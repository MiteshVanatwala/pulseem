import { useState, useEffect, useRef } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Stepper, Step, StepLabel,
    Table, TableBody, TableCell, TableHead, TableRow, Select, MenuItem, Checkbox, FormControlLabel,
    TextField, LinearProgress, FormControl, ListSubheader
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { ERROR_TYPE } from '../../../helpers/Types/common';
import {
    UploadColumnDef, eFormatHint, eSemanticRole, DataSourceLimits,
    eClientField, ClientFieldOption, CLIENT_FIELD_CATALOGUE, ColumnDetection
} from '../../../Models/DataSources/DataSource';
import { eDataType } from '../../../Models/DataSources/DataSourceEnums';
import { checkQuota, insertDataSource, setUploadProgress } from '../../../redux/reducers/dataSourcesSlice';
import { useDsDialogStyles } from './dialogStyles';
import { detectColumnType } from './columnTypeDetect';
import TypeEvidencePopover from './TypeEvidencePopover';

interface UploadWizardDialogProps {
    classes: { [key: string]: string };
    open: boolean;
    onClose: () => void;
    onUploaded: (id: number) => void;
    setToastMessage: (msg: ERROR_TYPE) => void;
    // Description is optional because it is only needed to PRE-FILL the description box when the
    // typed name matches an existing source (see the seeding effect below). A caller that omits it
    // still gets correct behaviour, just an empty box.
    existingSources?: { Name: string; VersionNumber: number; Description?: string }[];
    /* The account's own names for ExtraField1..13 / ExtraDate1..4, already filtered to the named
       ones. Optional on purpose: omit it and the write-back picker still offers the ten fixed
       recipient fields, which is the whole of phase one. Labels live on dbo.AccountExtraFields and
       are per ACCOUNT, so every sub-account of the same customer sees the same names. */
    accountExtraFields?: ClientFieldOption[];
}

const ALLOWED = ['csv', 'xls', 'xlsx', 'tsv'];

/* Per-column value classification MOVED OUT to columnTypeDetect.ts on 2026-08-08.
   The predicates that used to live here were duplicated nowhere else, but the DECISION they fed was
   `vals.every(...)` — unanimity. One "n/a" in a 5-row sample demoted a whole amount column to text,
   and the UI gave the user no way to see that had happened, let alone why. columnTypeDetect votes
   over the sample (≥90% of non-empty cells) and returns the evidence it voted on, which is what
   TypeEvidencePopover renders. The predicates themselves are carried over unchanged except for the
   third phone shape (5 + 8 digits — Excel eats the leading zero) and the leading-zero rule. */

// A "supervisor email" is stored as a plain INFO field (SemanticRole NONE, DataType EMAIL) — this
// UI-only flag just remembers the wizard's supervisor tag so the role dropdown reflects it. It is
// stripped from the payload before upload (the server has no such column). `Detection` is UI-only
// too: it is the evidence behind the auto-picked DataType and never leaves the browser.
type WizardColumn = UploadColumnDef & { IsSupervisorEmail?: boolean; Detection?: ColumnDetection };

// Dropdown menus must open BELOW the field (never over it) and stay anchored to the field's START
// edge — right under RTL, left under LTR. The branch is required: anchorOrigin is a PROP, not CSS,
// so jss-rtl never sees it, and MUI v4's Popover has no direction handling of its own. Hardcoding
// 'right' pinned the menu to the field's END edge for en/pl, so a menu wider than its field grew
// outwards instead of along the field.
// getContentAnchorEl:null is what lets anchorOrigin.vertical:'bottom' actually take effect in MUI v4.
// PaperProps.dir is the other half, and it is NOT optional: MUI v4 portals the menu Paper to
// document.body, outside App.js's <div dir={isRTL}>, and <html dir> is stuck at "ltr" app-wide
// (App.js sets it in a mount-only effect, before i18n has switched off its 'en' default). The theme's
// direction:'rtl' and jss-rtl do not help either — they mirror physical CSS properties and never emit
// a `direction`. Without this the menu items render LTR inside an otherwise RTL dialog.
const menuPropsFor = (isRtl: boolean): any => ({
    getContentAnchorEl: null,
    anchorOrigin: { vertical: 'bottom', horizontal: isRtl ? 'right' : 'left' },
    transformOrigin: { vertical: 'top', horizontal: isRtl ? 'right' : 'left' },
    PaperProps: { dir: isRtl ? 'rtl' : 'ltr', style: { maxHeight: 320, marginTop: 4 } }
});

// Role dropdown value → SemanticRole. 'none' and 'sup' are deliberately absent: both persist as
// SemanticRole NONE ('sup' adds the UI-only supervisor flag), so they map to NONE by lookup miss.
// This map is also the single source of truth for the "at most one column per role" rule below —
// roles 3/4 have (or are getting) the same filtered unique index roles 1/2 have, so a duplicate is
// a 400 IDENTITY_COLUMNS_INVALID from the server, not a silently-picked winner.
const ROLE_OF_VALUE: { [k: string]: eSemanticRole } = {
    email: eSemanticRole.RECIPIENT_EMAIL,
    cell: eSemanticRole.RECIPIENT_CELLPHONE,
    firstName: eSemanticRole.FIRST_NAME,
    lastName: eSemanticRole.LAST_NAME
};

const extOf = (name: string) => {
    const parts = (name || '').split('.');
    return parts.length > 0 ? parts[parts.length - 1].toLowerCase() : '';
};

const UploadWizardDialog = ({ classes, open, onClose, onUploaded, setToastMessage, existingSources = [], accountExtraFields }: UploadWizardDialogProps) => {
    const { t, i18n } = useTranslation();
    // Fallback 'rtl' matches DataSources.tsx:113 — Hebrew is the default locale, so an i18n
    // instance without dir() must not silently downgrade the app to LTR.
    const isRtl = (i18n.dir?.() ?? 'rtl') === 'rtl';
    const MENU_PROPS = menuPropsFor(isRtl);
    const dispatch = useDispatch();
    const dsDialog = useDsDialogStyles();
    const { uploadProgress, quota } = useSelector((s: any) => s.dataSources);
    const limits: DataSourceLimits | null = quota?.Limits ?? null;

    const [step, setStep] = useState(0);
    const [file, setFile] = useState<File | null>(null);
    const [headers, setHeaders] = useState<string[]>([]);
    const [previewRows, setPreviewRows] = useState<string[][]>([]);
    const [columns, setColumns] = useState<WizardColumn[]>([]);
    const [rowCount, setRowCount] = useState<number | null>(null);
    /* Non-blank count per column ordinal, from the same full pass that produced rowCount. null when the
       count could not be established (an oversized or unreadable workbook), in which case step 3 simply
       omits the blank notice rather than guessing. */
    const [columnNonEmpty, setColumnNonEmpty] = useState<number[] | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [createMissingClients, setCreateMissingClients] = useState(true);
    /* Status for recipients this upload CREATES. Existing recipients never have their status
       touched, so this is meaningful only while createMissingClients is on — the checkbox is
       nested under it and reset with it. Default off = created active, today's behaviour.
       ClientStatus.Pending = 5 and SmsStatus.Pending = 5, both verified against the live lookup
       tables on 2026-08-05 (note the C# SmsStatus enum is missing its Pending member). */
    const [createAsPending, setCreateAsPending] = useState(false);
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const [uploading, setUploading] = useState(false);
    const [parsing, setParsing] = useState(false);
    const dragRef = useRef(false);
    /* Has the user typed in the description box themselves? A REF, not state, on purpose: it must
       never trigger a render, and — more importantly — it must be readable synchronously by the
       seeding effect below. Once true it stays true for the life of the dialog (reset() clears it
       on every open), which is what guarantees the seeding can never fight the user's typing. */
    const descriptionTouched = useRef(false);

    const maxSearchable = limits?.MaxSearchableColumnsPerVersion ?? 10;
    const searchableCount = columns.filter(c => c.IsSearchable).length;
    const searchableRemaining = Math.max(0, maxSearchable - searchableCount);

    useEffect(() => {
        if (open) {
            reset();
            dispatch(checkQuota());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const reset = () => {
        setStep(0); setFile(null); setHeaders([]); setPreviewRows([]); setColumns([]);
        setRowCount(null); setColumnNonEmpty(null); setName(''); setDescription(''); setCreateMissingClients(true);
        descriptionTouched.current = false;   // fresh open => box is empty AND re-seedable again
        setCreateAsPending(false);
        setErrors({}); setUploading(false); setParsing(false);
        dispatch(setUploadProgress(null));
    };

    // ── encoding-tolerant preview ────────────────────────────────────────────
    const detectEncoding = (file: File): Promise<string> => new Promise((resolve) => {
        const slice = file.slice(0, 4096);
        const r = new FileReader();
        r.onload = () => {
            // Drop trailing replacement char(s): a multi-byte UTF-8 sequence straddling the 4KB cut decodes
            // to a lone trailing U+FFFD and must NOT be mistaken for legacy encoding. A real ISO-8859-8 file
            // decoded as UTF-8 produces replacement chars scattered throughout (interior), still detected.
            const text = ((r.result as string) || '').replace(/�+$/, '');
            resolve(text.indexOf('�') > -1 ? 'ISO-8859-8' : 'utf-8');
        };
        r.onerror = () => resolve('utf-8');
        r.readAsText(slice, 'utf-8');
    });

    // Workbooks above this size are previewed but NOT counted: the full (uncapped) parse below walks
    // every cell and would freeze the tab on a huge sheet. The worker still enforces MaxRows server-side.
    const XLSX_COUNT_MAX_BYTES = 15 * 1024 * 1024;

    // Resolves the preview rows plus the sheet's total row count (header row INCLUDED, exactly like
    // countCsvRows), or null when the count could not be established.
    /* Non-blank cell count per column ordinal, over the DATA rows only (the header is excluded by the
       caller). Both parse paths already make one full pass over the file — xlsx materialises the whole
       sheet to count rows, csv streams every row for the same reason — so this rides along for free.
       It is what lets step 3 tell the operator "this column is blank in 300 of 1,000 rows, and those
       recipients keep whatever they already have", which is the one thing the write rule does that
       nobody expects. */
    const countNonEmptyPerColumn = (dataRows: any[][]): number[] => {
        const out: number[] = [];
        for (const row of dataRows) {
            if (!Array.isArray(row)) continue;
            for (let i = 0; i < row.length; i++) {
                const c = row[i];
                if (c !== null && c !== undefined && String(c).trim() !== '') out[i] = (out[i] || 0) + 1;
            }
        }
        return out;
    };

    const parseXlsx = (file: File): Promise<{ rows: string[][]; rowCount: number | null; nonEmpty: number[] | null }> => new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = (e: any) => {
            try {
                const data = new Uint8Array(e.target.result);
                const wb = XLSX.read(data, { type: 'array', sheetRows: 6 }); // parse only 6 rows → fast on big files
                const sheet = wb.Sheets[wb.SheetNames[0]];
                const raw: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false });
                // sheet_to_json (header:1) returns SPARSE arrays - a cell absent from the
                // used range is a HOLE, and Array.prototype.map SKIPS holes, so they used
                // to survive the String() normalization, reach the columns array, become
                // null in the request JSON and crash the server (NRE on SourceHeader).
                // Densify explicitly, and drop the columns BEFORE the header row's first
                // present cell: the worker reads the file shifted to exactly that column
                // (DataSourcesWorker FileParser offset rule), so keeping a leading empty
                // column here would silently shift the whole column mapping by one.
                const hdr: any[] = raw.length > 0 ? raw[0] : [];
                let start = 0;
                while (start < hdr.length && !(start in hdr)) start++;   // skip leading holes only
                const rows = raw.map(row => {
                    const width = Math.max(row.length, hdr.length);
                    const dense: string[] = [];
                    for (let i = start; i < width; i++) {
                        const c = row[i];
                        dense.push(c === null || c === undefined ? '' : String(c));
                    }
                    return dense;
                });
                // The preview above is capped at 6 rows, so the real height needs a second, uncapped
                // read of the same buffer. Count via sheet_to_json with the SAME options the preview
                // uses (blankrows:false) rather than the sheet's '!ref' range: a range covers every
                // formatted-but-empty trailing row, which would both overstate the count shown to the
                // user and trip the MaxRows pre-flight below on a file the worker would accept.
                // blankrows:false also matches countCsvRows' skipEmptyLines, so both paths mean the
                // same thing by "rows". Best-effort: any failure leaves the count unknown rather than
                // losing a preview that already parsed fine.
                let total: number | null = null;
                let nonEmpty: number[] | null = null;
                if (file.size <= XLSX_COUNT_MAX_BYTES) {
                    try {
                        const fullWb = XLSX.read(data, { type: 'array' });
                        const fullSheet = fullWb.Sheets[fullWb.SheetNames[0]];
                        if (fullSheet) {
                            const all = XLSX.utils.sheet_to_json(fullSheet, { header: 1, blankrows: false }) as any[][];
                            total = all.length;
                            /* The blank counts MUST be aligned to the same origin as `columns`, and two
                               separate things can shift them apart:
                                 1. `rows` above starts at `start`, the header's first PRESENT cell, so
                                    columns[j] is raw column start+j. Counting from raw 0 would report
                                    every column's blanks against the column `start` places to its left.
                                 2. sheet_to_json(header:1) indexes RELATIVE to the sheet range's first
                                    column, and the capped read (sheetRows:6) can resolve a different
                                    first column than this uncapped one — a column blank in rows 1-6 but
                                    populated at row 500 moves the origin even when start === 0.
                               Applying the SAME "skip to the header's first present cell" rule to this
                               read fixes both: the header row exists in both reads, so anchoring each on
                               its own first present header cell anchors both on the same ABSOLUTE column.
                               Getting this wrong is worse than omitting the notice — it would tell the
                               operator a confident, wrong number about their own file, right before an
                               irreversible write. */
                            const allHdr: any[] = all.length > 0 ? all[0] : [];
                            let fullStart = 0;
                            while (fullStart < allHdr.length && !(fullStart in allHdr)) fullStart++;
                            nonEmpty = countNonEmptyPerColumn(all.slice(1).map(row => Array.isArray(row) ? row.slice(fullStart) : row));
                        }
                    } catch { total = null; nonEmpty = null; }
                }
                resolve({ rows, rowCount: total, nonEmpty });
            } catch (err) { reject(err); }
        };
        r.onerror = reject;
        r.readAsArrayBuffer(file);
    });

    const parseCsvPreview = (file: File, encoding: string): Promise<string[][]> => new Promise((resolve, reject) => {
        Papa.parse(file as any, {
            preview: 6, skipEmptyLines: true, encoding,
            complete: (res: any) => resolve((res.data as any[][]).map(row => row.map(c => c === null || c === undefined ? '' : String(c)))),
            error: reject
        });
    });

    const countCsvRows = (file: File, encoding: string): Promise<{ count: number; nonEmpty: number[] }> => new Promise((resolve, reject) => {
        let count = 0;
        const nonEmpty: number[] = [];
        Papa.parse(file as any, {
            skipEmptyLines: true, encoding, worker: true,
            step: (res: any) => {
                count++;
                if (count === 1) return;   // header row — not data
                const row = res.data;
                if (!Array.isArray(row)) return;
                for (let i = 0; i < row.length; i++) {
                    const c = row[i];
                    if (c !== null && c !== undefined && String(c).trim() !== '') nonEmpty[i] = (nonEmpty[i] || 0) + 1;
                }
            },
            complete: () => resolve({ count, nonEmpty }),
            error: reject
        });
    });

    // Auto-typing from the sampled values (+ header hints for identity when a column has no sample):
    //   email→email-identity (2nd+ email → "supervisor email", saved as an info field);
    //   05######## / 9725######## → cellphone-identity; else number / date / text by value shape.
    // Email, cellphone and supervisor-email default to searchable (capped by the version quota).
    const buildColumns = (hdrs: string[], sample: string[][]): WizardColumn[] => {
        let emailCount = 0;
        let hasCell = false;
        let searchableBudget = maxSearchable;
        const cols = hdrs.map((h, i) => {
            const header = (h && h.trim()) ? h.trim() : `${t('DataSources.table.name')} ${i + 1}`;
            const lower = header.toLowerCase();
            const colVals = sample.map(r => r[i]);
            // ONE decision per column, taken here, from the sample — never per cell. The evidence
            // rides along on the column so the ℹ️ can show it without re-deriving anything.
            const detection = detectColumnType(colVals);
            const kind = detection.total === 0 ? 'text'
                : detection.type === eDataType.EMAIL ? 'email'
                    : detection.type === eDataType.PHONE ? 'phone'
                        : detection.type === eDataType.DATE ? 'date'
                            : detection.type === eDataType.NUMBER ? 'number' : 'text';
            const headerEmail = /mail|אימייל|דוא/.test(lower);
            const headerPhone = /phone|נייד|סלולר|cell|mobile|טלפון/.test(lower);

            let role: eSemanticRole = eSemanticRole.NONE;
            let dataType: eDataType = eDataType.TEXT;
            let isSupervisor = false;

            // `detection.total === 0` (no non-empty sampled value), not `colVals.length === 0`:
            // colVals now carries the blanks too, because the detector owns the emptiness rule.
            const looksEmail = kind === 'email' || (headerEmail && detection.total === 0);
            const looksPhone = kind === 'phone' || (headerPhone && detection.total === 0);

            if (looksEmail) {
                if (emailCount === 0) { role = eSemanticRole.RECIPIENT_EMAIL; dataType = eDataType.EMAIL; }
                else { isSupervisor = true; dataType = eDataType.EMAIL; }   // 2nd+ email → supervisor (saved as info field)
                emailCount++;
            } else if (looksPhone) {
                if (!hasCell) { role = eSemanticRole.RECIPIENT_CELLPHONE; dataType = eDataType.PHONE; hasCell = true; }
                else { dataType = eDataType.TEXT; }   // only one cellphone identity allowed — extra phone stays text
            } else if (kind === 'number') {
                dataType = eDataType.NUMBER;
            } else if (kind === 'date') {
                dataType = eDataType.DATE;
            }

            const isIdentityOrSup = role === eSemanticRole.RECIPIENT_EMAIL || role === eSemanticRole.RECIPIENT_CELLPHONE || isSupervisor;
            let isSearchable = false;
            if (isIdentityOrSup && searchableBudget > 0) { isSearchable = true; searchableBudget--; }

            return {
                Ordinal: i + 1, SourceHeader: header,
                DisplayName: isSupervisor ? t('DataSources.wizard.roleSupervisorEmail') : header,
                DataType: dataType, FormatHint: eFormatHint.NONE, SemanticRole: role,
                IsSearchable: isSearchable,
                // Default ON, matching the DB default — a number in a grid is meant to be read.
                ShowThousandsSeparator: true,
                IsSupervisorEmail: isSupervisor, Detection: detection
            };
        });
        // A NUMBER column is only filterable while it is searchable, so it defaults to searchable
        // too — but in a SECOND pass, deliberately. The identities above allocate first: a file whose
        // numeric columns precede its email/cellphone column must not spend the version's budget
        // before the identity that the whole match runs on gets its slot.
        for (const c of cols) {
            if (searchableBudget <= 0) break;
            if (!c.IsSearchable && c.DataType === eDataType.NUMBER) { c.IsSearchable = true; searchableBudget--; }
        }
        return cols;
    };

    const onFileChosen = async (chosen: File | null) => {
        if (!chosen) return;
        setErrors({});
        const ext = extOf(chosen.name);
        if (ALLOWED.indexOf(ext) === -1) {
            setErrors({ file: t('DataSources.wizard.errors.invalidExtension') });
            return;
        }
        if (limits && limits.MaxFileSizeKB > 0 && chosen.size / 1024 > limits.MaxFileSizeKB) {
            setErrors({ file: t('DataSources.wizard.errors.fileTooLarge', { max: Math.round(limits.MaxFileSizeKB / 1024) }) });
            return;
        }

        setParsing(true);
        try {
            let rows: string[][];
            let count: number | null = null;
            let nonEmpty: number[] | null = null;
            if (ext === 'xls' || ext === 'xlsx') {
                const parsed = await parseXlsx(chosen); // count is null on oversized/unreadable workbooks (worker still enforces MaxRows)
                rows = parsed.rows;
                count = parsed.rowCount;
                nonEmpty = parsed.nonEmpty;
            } else {
                const enc = await detectEncoding(chosen);
                rows = await parseCsvPreview(chosen, enc);
                const counted = await countCsvRows(chosen, enc);
                count = counted.count;
                nonEmpty = counted.nonEmpty;
            }
            if (!rows || rows.length === 0 || (rows.length === 1 && rows[0].every(c => !c))) {
                setParsing(false);
                setErrors({ file: t('DataSources.wizard.errors.emptyFile') });
                return;
            }
            const hdrs = rows[0];
            const dataRows = rows.slice(1, 6);
            // enforce MaxRows locally before upload, whenever the row count is known (csv/tsv always, xlsx when countable)
            if (count !== null && limits && limits.MaxRows > 0 && (count - 1) > limits.MaxRows) {
                setParsing(false);
                setErrors({ file: t('DataSources.wizard.errors.maxRowsExceeded', { max: limits.MaxRows.toLocaleString() }) });
                return;
            }
            setFile(chosen);
            setHeaders(hdrs);
            setPreviewRows(dataRows);
            setColumns(buildColumns(hdrs, dataRows));
            setRowCount(count);
            setColumnNonEmpty(nonEmpty);
            setName(chosen.name.replace(/\.[^.]+$/, '').substring(0, 100));
            setParsing(false);
        } catch (err) {
            setParsing(false);
            setErrors({ file: t('DataSources.errors.generalError') });
        }
    };

    // ── identity mapping ──────────────────────────────────────────────────────
    // The role dropdown carries a UI value ('none' | 'email' | 'cell' | 'firstName' | 'lastName' |
    // 'sup'). 'sup' = supervisor email — stored as an info field (SemanticRole NONE + DataType EMAIL)
    // plus the UI-only flag. Picking email/cell/supervisor also turns on search by default when the
    // quota still allows it; firstName/lastName deliberately do NOT (see below).
    const setRoleValue = (idx: number, value: string) => {
        const picked = ROLE_OF_VALUE[value] ?? eSemanticRole.NONE;
        setColumns(cols => cols.map((c, i) => {
            if (i === idx) {
                if (value === 'sup') {
                    const enable = c.IsSearchable || searchableRemaining > 0;
                    return { ...c, SemanticRole: eSemanticRole.NONE, DataType: eDataType.EMAIL, FormatHint: eFormatHint.NONE, IsSupervisorEmail: true, IsSearchable: enable };
                }
                const role = picked;
                const dataType = role === eSemanticRole.RECIPIENT_EMAIL ? eDataType.EMAIL
                    : role === eSemanticRole.RECIPIENT_CELLPHONE ? eDataType.PHONE : eDataType.TEXT;
                // Only email/cell are matching identities. A name is enrichment data, so it must not
                // silently spend one of the version's scarce searchable-column slots.
                const isIdentity = role === eSemanticRole.RECIPIENT_EMAIL || role === eSemanticRole.RECIPIENT_CELLPHONE;
                const enable = isIdentity ? (c.IsSearchable || searchableRemaining > 0) : c.IsSearchable;
                // role columns never carry a currency/percent format
                return { ...c, SemanticRole: role, DataType: dataType, FormatHint: role === eSemanticRole.NONE ? c.FormatHint : eFormatHint.NONE, IsSupervisorEmail: false, IsSearchable: enable };
            }
            // Enforce ≤1 column per role — clear the previous holder. This covers ALL FOUR roles
            // (1 email, 2 cell, 3 firstName, 4 lastName), not just the two identities: DataSourceColumns
            // carries a filtered unique index per role, so a second column on role 3/4 is rejected by
            // the server with 400 IDENTITY_COLUMNS_INVALID and the user gets a misleading
            // "duplicate identity" toast for a mapping the UI itself allowed.
            if (picked !== eSemanticRole.NONE && c.SemanticRole === picked) {
                return { ...c, SemanticRole: eSemanticRole.NONE, DataType: eDataType.TEXT };
            }
            return c;
        }));
    };

    const toggleSearchable = (idx: number, value: boolean) => {
        if (value && searchableRemaining <= 0) return; // quota block
        setColumns(cols => cols.map((c, i) => i === idx ? { ...c, IsSearchable: value } : c));
    };

    const setDisplayName = (idx: number, val: string) =>
        setColumns(cols => cols.map((c, i) => i === idx ? { ...c, DisplayName: val } : c));

    // Info columns only. Switching away from Number resets the format (Currency/Percent apply to numbers).
    // ShowThousandsSeparator is deliberately NOT reset here: a user who turns separators off, switches
    // to Text to look at something and switches back would otherwise silently get them again.
    // IsSearchable IS released, and the asymmetry is the point: separators are a free display choice,
    // while a searchable column costs one of the version's ten slots AND a row per data row in
    // DataSourceRowSearchValues. A tick the operator never made must not hold either.
    const setDataType = (idx: number, dt: eDataType) =>
        setColumns(cols => cols.map((c, i) => i === idx
            ? {
                ...c, DataType: dt,
                FormatHint: dt === eDataType.NUMBER ? c.FormatHint : eFormatHint.NONE,
                // A NUMBER column arrives pre-ticked (buildColumns, second pass), so a column retyped
                // to Text/Date is holding a tick that came from its type, not from the operator. The
                // Select is disabled unless isInfo, so this can never reach an identity or supervisor
                // column. Re-ticking by hand still works — the checkbox is right there.
                IsSearchable: dt === eDataType.NUMBER ? c.IsSearchable : false
            }
            : c));

    const setShowThousandsSeparator = (idx: number, value: boolean) =>
        setColumns(cols => cols.map((c, i) => i === idx ? { ...c, ShowThousandsSeparator: value } : c));

    /* setFormatHint was removed with the "format" column on 2026-08-05. FormatHint itself is still
       part of the payload and stays at NONE for every column, so nothing downstream changed. */

    const setClientFieldTarget = (idx: number, target: eClientField | null) =>
        setColumns(cols => cols.map((c, i) => i === idx ? { ...c, ClientFieldTarget: target } : c));

    /* The account's own names for ExtraField1..13 / ExtraDate1..4. Optional: when the host does not
       supply them the extra-field groups simply do not appear, and the ten fixed recipient fields
       work on their own. That is what lets the first phase ship without the account-labels endpoint. */
    const clientFieldOptions: ClientFieldOption[] = [
        ...CLIENT_FIELD_CATALOGUE,
        ...(accountExtraFields ?? [])
    ];

    /* One target may be claimed by one column only — two columns writing the same field would make
       the winner arbitrary. Enforced again server-side; here it just greys the taken options out. */
    const takenClientFields = new Set<eClientField>(
        columns.map(c => c.ClientFieldTarget).filter((v): v is eClientField => v != null)
    );

    const clientFieldLabel = (o: ClientFieldOption) =>
        o.AccountLabel ? o.AccountLabel : t(`DataSources.wizard.clientFields.${o.LabelKey}`);

    /* Grouped so ~26 options stay readable, and so the account's "phone" extra field cannot be
       mistaken for the recipient record's own Telephone — they sit under different headings. */
    const clientFieldGroups = ([
        { key: 'recipient' as const },
        { key: 'extraField' as const },
        { key: 'extraDate' as const }
    ]).map(g => ({ ...g, options: clientFieldOptions.filter(o => o.Group === g.key) }))
        .filter(g => g.options.length > 0);

    /* The chosen write-backs, resolved once for step 3's summary. The array index IS the file's column
       ordinal — buildColumns maps headers positionally and the wizard never reorders columns — which is
       what lets columnNonEmpty line up. `blank` is how many DATA rows have an empty cell in that column;
       those recipients keep whatever they already have, which is the half of the write rule nobody
       expects. Both counts stay null when the row count could not be established, and step 3 then omits
       the notice rather than guessing. */
    const clientFieldMappings = columns
        .map((c, i) => ({ col: c, ordinal: i, opt: clientFieldOptions.find(o => o.Id === c.ClientFieldTarget) }))
        .filter(m => m.opt != null)
        .map(m => {
            const total = rowCount !== null ? rowCount - 1 : null;
            const filled = columnNonEmpty ? (columnNonEmpty[m.ordinal] || 0) : null;
            const opt = m.opt as ClientFieldOption;
            return {
                ...m,
                opt,
                total,
                blank: (total !== null && filled !== null) ? Math.max(0, total - filled) : null,
                /* A DATE target only stores values the engine can read as DAY-FIRST dates: it does
                   TRY_CONVERT(DATETIME, value, 103) and then COALESCE(NULL, current), so an unparseable
                   value silently leaves the field as it was.
                   This is flagged for EVERY date target, not gated on the column's detected DataType.
                   An earlier version gated it on `DataType !== DATE` and that was wrong in both
                   directions: `DataType` appears ZERO times in the stored procedure, so it has no
                   bearing on what is written. A TEXT-typed column full of real dd/MM/yyyy values (the
                   type detector falls back to TEXT on 2 misses in a 5-row sample) writes fine, and the
                   warning was a false alarm telling the operator to unmap something that works — while
                   a DATE-typed column of month-first values writes nothing and got no warning at all.
                   Worse, the remedy that version printed — "change the column's data type to Date" —
                   changes nothing in the write path; it only silenced this predicate. */
                isDateTarget: opt.IsDate === true,
                /* Which physical slot is being overwritten. An account may name two extra fields the
                   same thing, or name one exactly like a built-in recipient field — and then the label
                   alone cannot tell the operator which CRM column they are about to overwrite, on the
                   one surface that exists to review that. Qualified HERE and not in clientFieldLabel:
                   that feeds the 151px tag too, where the RTL ellipsis would cut the qualifier off
                   first and leave the ambiguity untouched. The summary box has the width. */
                slot: opt.Group === 'extraField' ? { key: 'extraFieldSlot', n: opt.Id - 100 }
                    : opt.Group === 'extraDate' ? { key: 'extraDateSlot', n: opt.Id - 200 }
                        : null
            };
        });

    const hasEmail = columns.some(c => c.SemanticRole === eSemanticRole.RECIPIENT_EMAIL);
    const hasCell = columns.some(c => c.SemanticRole === eSemanticRole.RECIPIENT_CELLPHONE);
    const matchedSource = name ? existingSources.find(s => s.Name && s.Name.trim().toLowerCase() === name.trim().toLowerCase()) : undefined;
    const nameExists = !!matchedSource;
    const nextVersion = matchedSource ? (matchedSource.VersionNumber || 0) + 1 : 0;

    /* ── seed the description box from the matched existing source ────────────────────────────
       WHY this exists: on the same-name / new-version path the box used to open empty, so a user
       who did not retype sent ''. The API maps '' to DBNull (DataSourcesLogic.cs:286) and the SP
       fix reads that as "leave the existing description alone" — correct, but INVISIBLE: the user
       could not see which description they were keeping. Seeding makes the kept value legible and
       editable in place.

       WHY IT CANNOT FIGHT THE USER: the effect early-returns forever once descriptionTouched is
       set, and that flag is set on the FIRST keystroke in the box (see the TextField's onChange).
       So the box is only ever written by this effect while it still holds a value the user never
       authored. reset() clears both the text and the flag on every open, so "fresh open => empty"
       holds regardless of what the previous session left behind.

       Deps are the matched source's PRIMITIVES, not the object: `matchedSource` is a `.find()`
       result, so its identity is only as stable as the `existingSources` array the parent rebuilds
       on every render (DataSources.tsx:411 maps it inline). Depending on the object would re-run
       this on every parent render; depending on Name+Description re-runs it exactly when the match
       actually changes.

       Falling back to '' when nothing matches is deliberate: it clears a previously seeded value
       once the name no longer points at that source, so the box never shows a description
       belonging to a source the user is no longer targeting. It cannot wipe user input — the
       touched flag already short-circuits that case. */
    useEffect(() => {
        if (descriptionTouched.current) return;
        setDescription(matchedSource?.Description || '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matchedSource?.Name, matchedSource?.Description]);

    // ── upload ────────────────────────────────────────────────────────────────
    const doUpload = async () => {
        setErrors({});
        if (!name || !name.trim()) { setErrors({ name: t('DataSources.wizard.errors.nameRequired') }); return; }
        if (name.length > 100) { setErrors({ name: t('DataSources.wizard.errors.nameTooLong') }); return; }
        if (!file) return;

        const fd = new FormData();
        fd.append('file', file, file.name);
        fd.append('name', name.trim());
        fd.append('description', description || '');
        fd.append('createMissingClients', createMissingClients ? 'true' : 'false');
        // `&& createMissingClients` keeps the pair coherent on the wire even if a future edit breaks
        // the nesting — "create them pending" is meaningless without "create them".
        fd.append('createAsPending', (createMissingClients && createAsPending) ? 'true' : 'false');
        // Supervisor email is a UI-only tag — send only the server-known fields (it persists as a
        // plain info field: SemanticRole NONE + DataType EMAIL).
        const payloadColumns: UploadColumnDef[] = columns.map(c => ({
            Ordinal: c.Ordinal, SourceHeader: c.SourceHeader, DisplayName: c.DisplayName,
            DataType: c.DataType, FormatHint: c.FormatHint, SemanticRole: c.SemanticRole, IsSearchable: c.IsSearchable,
            // null, not undefined: JSON.stringify drops undefined members, and the server binds by
            // name — an absent member and an explicit null must not mean different things here.
            ClientFieldTarget: c.ClientFieldTarget ?? null,
            // Explicit true, never undefined, for the same reason. Sent for every column (not only
            // NUMBER) so the value on the row always matches the DB default and a later type change
            // does not land on a NULL flag. `!== false` so a column built before the flag existed
            // still uploads as "on".
            ShowThousandsSeparator: c.ShowThousandsSeparator !== false
        }));
        fd.append('columns', JSON.stringify(payloadColumns));

        setUploading(true);
        const res: any = await dispatch(insertDataSource(fd));
        setUploading(false);
        const payload = res?.payload;
        const code = payload?.StatusCode;
        if (code === 202 || code === 200 || code === 201) {
            onUploaded(payload?.Data?.DataSourceID ?? 0);
            return;
        }
        if (code === 409 && payload?.Message === 'UPLOAD_IN_PROGRESS') { setErrors({ upload: t('DataSources.errors.uploadInProgress') }); return; }
        // SP source/row-cap quota (-3 → 409), distinct from the controller's 405 file-size quota.
        if (code === 409 && payload?.Message === 'QUOTA_EXCEEDED') { setErrors({ upload: t('DataSources.errors.quotaExceeded') }); return; }
        if (code === 405 && payload?.Message === 'INVALID_FILE_EXTENSION') { setErrors({ upload: t('DataSources.wizard.errors.invalidExtension') }); return; }
        if (code === 405 && payload?.Message === 'USER_PERMISSION_NOT_ALLOWED') { setErrors({ upload: t('DataSources.errors.generalError') }); return; }
        if (code === 405) { setErrors({ upload: t('DataSources.errors.quotaExceeded') }); return; }
        if (code === 403) { setErrors({ upload: t('DataSources.errors.invalidChars') }); return; }
        if (code === 400 && payload?.Message === 'IDENTITY_COLUMNS_INVALID') { setErrors({ upload: t('DataSources.errors.duplicateIdentity') }); return; }
        // Two columns claiming the same recipient field. The picker already greys taken
        // options out, so reaching this means a stale tab or a non-UI caller — say which
        // rule was broken rather than falling through to "something went wrong".
        if (code === 400 && payload?.Message === 'CLIENT_FIELD_DUPLICATE') { setErrors({ upload: t('DataSources.errors.duplicateClientField') }); return; }
        setErrors({ upload: t('DataSources.errors.generalError') });
    };

    const requestClose = () => {
        if (uploading) return;
        if (file && !window.confirm(t('DataSources.wizard.abandonConfirm'))) return;
        onClose();
    };

    // ── render ──────────────────────────────────────────────────────────────
    /* firstName / lastName were removed here on 2026-08-05: they are write-back targets, not matching
       roles, and they are now two entries in the client-field picker alongside the other 24 instead of
       two special cases. roleValueOf still MAPS roles 3/4 so a version saved before the change still
       renders sensibly, even though the live DB confirms no such version exists. */
    const roleOptions = [
        { value: 'none', label: t('DataSources.wizard.roleNone') },
        { value: 'email', label: t('DataSources.wizard.roleEmail') },
        { value: 'cell', label: t('DataSources.wizard.roleCellphone') },
        { value: 'sup', label: t('DataSources.wizard.roleSupervisorEmail') }
    ];
    // Both 'none' and 'sup' map to SemanticRole NONE, so the dropdown value is derived, not the role.
    const roleValueOf = (c: WizardColumn) => c.IsSupervisorEmail ? 'sup'
        : c.SemanticRole === eSemanticRole.RECIPIENT_EMAIL ? 'email'
            : c.SemanticRole === eSemanticRole.RECIPIENT_CELLPHONE ? 'cell' : 'none';

    // Readable, slightly-larger-than-field header labels for the mapping table.
    // (16 keeps the intended one-step lead now that the shared dialog scale puts body cells at 15.)
    const hdrCellStyle: any = { fontSize: 16, fontWeight: 700, color: '#344054' };

    /* One shared vertical grid for every cell of a mapping row. The row is pinned to
       verticalAlign:'top' below; each cell then puts its primary control in the same 40px band and
       its secondary line in the same 28px band underneath.
       Without this, MuiTableRow's default verticalAlign:'middle' centres each cell's WHOLE content
       block against the tallest sibling. The role cell is the only one that always carries a second
       line ("+ עדכן גם שדה לקוח"), so it sets the row height and every shorter cell floats down to
       the middle of it — up to 18px of drift, plus a 14px jump between rows depending on whether the
       column happens to be a NUMBER (which adds "הצג מפריד אלפים" and nothing else does).
       40 absorbs the natural mismatch between the dense TextField (~37.6px), the dense Selects (40px)
       and the default Checkbox (42px). */
    const PRIMARY_BAND: any = { minHeight: 40, display: 'flex', alignItems: 'center' };
    const SUB_BAND: any = { minHeight: 28, marginTop: 8, display: 'flex', alignItems: 'center' };
    /* A FIXED width is the point: the table is auto-layout and the renderValue text changes length
       when a field is chosen ("+ עדכן גם שדה לקוח" -> "עדכן גם: <name>"), so an auto-sized control
       here re-measured the cell and shifted the other three columns sideways on every pick.
       14 is MUI's own outlined helper-text inset, which lines the link up under the Select's TEXT
       rather than its border.
       14 + 151 matches the role FormControl's `minWidth: 165` — but note that 165 is a MINIMUM, not
       a reservation, and the FormControl is the only flex item in a shrink-to-fit band. Where a role
       label is wider than 165 the Select grows and the link below it stops being flush with its end.
       That is a locale-dependent cosmetic drift (pl's "Telefon komórkowy (tożsamość)" is the long
       one; he and en both fit), NOT the row-baseline problem this change fixes — that is handled by
       verticalAlign + the bands above and is width-independent. */
    const CLIENT_FIELD_W = 151;
    const CLIENT_FIELD_INSET = 14;

    const renderFileStep = () => (
        <Box>
            <Box
                onDragOver={(e) => { e.preventDefault(); dragRef.current = true; }}
                onDrop={(e) => { e.preventDefault(); dragRef.current = false; onFileChosen(e.dataTransfer.files?.[0] ?? null); }}
                style={{ border: '2px dashed #a9bdd4', borderRadius: 12, padding: 28, textAlign: 'center', background: '#fafcff', cursor: 'pointer' }}
                onClick={() => document.getElementById('ds-file-input')?.click()}
            >
                <Typography>{t('DataSources.wizard.dragHere')}</Typography>
                <input id="ds-file-input" type="file" accept=".csv,.xls,.xlsx,.tsv" style={{ display: 'none' }}
                    onChange={(e) => onFileChosen(e.target.files?.[0] ?? null)} />
                {file && <Typography style={{ marginTop: 8, fontWeight: 600 }}>{file.name}</Typography>}
            </Box>
            {parsing && <LinearProgress style={{ marginTop: 12 }} />}
            {errors.file && <Typography style={{ color: '#B42318', marginTop: 10 }}>{errors.file}</Typography>}
            {previewRows.length > 0 && (
                <Box style={{ marginTop: 16, overflowX: 'auto' }}>
                    <Typography style={{ fontWeight: 600, marginBottom: 6 }}>{t('DataSources.wizard.previewTitle')}</Typography>
                    <Table size="small">
                        <TableHead><TableRow>{headers.map((h, i) => <TableCell key={i}>{h}</TableCell>)}</TableRow></TableHead>
                        <TableBody>
                            {previewRows.map((r, ri) => <TableRow key={ri}>{headers.map((_, ci) => <TableCell key={ci}>{r[ci] ?? ''}</TableCell>)}</TableRow>)}
                        </TableBody>
                    </Table>
                </Box>
            )}
        </Box>
    );

    const renderIdentityStep = () => (
        <Box>
            <Typography color="textSecondary" style={{ marginBottom: 8 }}>{t('DataSources.wizard.identityBanner')}</Typography>
            {!hasEmail && !hasCell && (
                <Box style={{ background: '#fff4e5', border: '1px solid #f5d9b0', borderRadius: 8, padding: '8px 12px', marginBottom: 10 }}>
                    <Typography style={{ color: '#b54708' }}>{t('DataSources.wizard.noIdentityWarning')}</Typography>
                </Box>
            )}
            <Typography style={{ fontSize: 14, color: '#5b6b7b', marginBottom: 8 }}>
                {t('DataSources.column.searchableRemaining', { n: searchableRemaining })}
            </Typography>
            <Box style={{ overflowX: 'auto' }}>
                <Table size="small">
                    <TableHead><TableRow>
                        <TableCell style={hdrCellStyle}>{t('DataSources.wizard.columnNameLabel')}</TableCell>
                        {/* Own key, not steps.identity: that string also labels the stepper and the
                            step-3 summary line, and this column is no longer only about identity. */}
                        <TableCell style={hdrCellStyle}>{t('DataSources.wizard.columnRoleLabel')}</TableCell>
                        <TableCell style={hdrCellStyle}>{t('DataSources.column.dataType')}</TableCell>
                        {/* The "format" column (FormatHint: None/Currency/Percent) was removed on
                            2026-08-05. Nothing anywhere consumed it — the sender carries it but
                            annotates it "not applied in v1", the worker calls it "display metadata
                            only", and no SP branches on it — so it was a control that could only
                            ever be set to None and never had an effect. FormatHint itself is still
                            sent (always NONE) so the payload shape is unchanged; restoring the
                            column is re-adding this header cell and its body cell, nothing more. */}
                        <TableCell align="center" style={hdrCellStyle}>{t('DataSources.wizard.searchableLabel')}</TableCell>
                    </TableRow></TableHead>
                    <TableBody>
                        {columns.map((c, i) => {
                            // isInfo == "the user may still choose DataType/FormatHint". False for every
                            // column whose role already fixes its type: email→Email, cell→Phone,
                            // supervisor→Email (stored as an info field but type-locked all the same),
                            // and firstName/lastName→Text. setRoleValue already forced DataType to Text
                            // and FormatHint to None for the two name roles, so the locked Select renders
                            // "Text" and the format Select stays disabled — correct, not a wrong lock:
                            // Currency/Percent on a person's name is never a legal combination.
                            const isInfo = c.SemanticRole === eSemanticRole.NONE && !c.IsSupervisorEmail;
                            return (
                                <TableRow key={i} style={{ verticalAlign: 'top' }}>
                                    <TableCell style={{ minWidth: 190 }}>
                                        <Box style={PRIMARY_BAND}>
                                            <TextField variant="outlined" size="small" value={c.DisplayName} onChange={(e) => setDisplayName(i, e.target.value)}
                                                inputProps={{ maxLength: 200, style: { fontSize: 14 } }} fullWidth />
                                        </Box>
                                        <Box style={SUB_BAND}>
                                            <Typography style={{ fontSize: 12, color: '#95A5A6' }}>
                                                {`${t('DataSources.wizard.originalHeader')}: ${c.SourceHeader}`}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box style={PRIMARY_BAND}>
                                            <FormControl variant="outlined" size="small" style={{ minWidth: 165 }}>
                                                <Select value={roleValueOf(c)} MenuProps={MENU_PROPS} style={{ fontSize: 14 }}
                                                    onChange={(e) => setRoleValue(i, String(e.target.value))}>
                                                    {roleOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                                                </Select>
                                            </FormControl>
                                        </Box>
                                        {/* ADDITIVE, not exclusive: the column keeps the role above AND may also
                                            update the recipient's own record. Rendered as one Select with a custom
                                            renderValue so it reads as a quiet link while unset and as a removable
                                            tag once set — no anchor state, no second menu component. */}
                                        <Select
                                            value={c.ClientFieldTarget ?? ''}
                                            /* The `undefined` guard is load-bearing. MUI v4 clones EVERY child of a
                                               Select with its own onClick (SelectInput.js:335-337) — group headings
                                               included, because ListSubheader passes React.isValidElement like any
                                               other node. Clicking one fires onChange with target.value === undefined,
                                               and `undefined === ''` is false, so Number(undefined) would land NaN in
                                               ClientFieldTarget. NaN survives `?? null`, JSON.stringify turns it into
                                               null, and renderValue finds no match and falls back to the "add" label —
                                               so the operator's choice is silently erased with no visible sign, by
                                               clicking the widest target in the list. */
                                            onChange={(e) => {
                                                if (e.target.value === undefined) return;   // group heading, not an option
                                                setClientFieldTarget(i, e.target.value === '' ? null : Number(e.target.value) as eClientField);
                                            }}
                                            displayEmpty
                                            disableUnderline
                                            MenuProps={MENU_PROPS}
                                            /* a11y. disableUnderline above strips the only focus affordance MUI v4 gives a
                                               standard Select, and its default :focus treatment is a 5%-grey wash — invisible
                                               behind 12.5px grey text on a white row. The control IS tab-reachable and
                                               Enter/Space opens it, so a keyboard user could reach it and never see where they
                                               were. Outline is set on the display node directly rather than through the shared
                                               dialogStyles sheet, which six other components also consume. */
                                            SelectDisplayProps={{
                                                'aria-label': t('DataSources.wizard.clientFieldAdd'),
                                                onFocus: (e: any) => { e.currentTarget.style.outline = '2px solid #0b7285'; e.currentTarget.style.outlineOffset = '2px'; },
                                                onBlur: (e: any) => { e.currentTarget.style.outline = 'none'; }
                                            } as any}
                                            renderValue={() => {
                                                const opt = clientFieldOptions.find(o => o.Id === c.ClientFieldTarget);
                                                return opt
                                                    ? <span style={{ fontSize: 12.5, color: '#0b7285', fontWeight: 600, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                                        title={t('DataSources.wizard.clientFieldTag', { name: clientFieldLabel(opt) })}>
                                                        {t('DataSources.wizard.clientFieldTag', { name: clientFieldLabel(opt) })}
                                                    </span>
                                                    : <span style={{ fontSize: 12.5, color: '#5b6b7b', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {t('DataSources.wizard.clientFieldAdd')}
                                                    </span>;
                                            }}
                                            /* Fixed width + start inset, not auto: the table is auto-layout, so letting
                                               this Select size to its own text made every other column jump sideways the
                                               moment a client field was picked and the label grew from "+ עדכן גם שדה
                                               לקוח" to "עדכן גם: <name>". The ellipsis on the spans above is the other
                                               half of that — a long account label truncates instead of widening.
                                               marginTop 8 (was 4) is the extra breathing room under the role Select. */
                                            style={{ fontSize: 12.5, marginTop: 8, width: CLIENT_FIELD_W, marginInlineStart: CLIENT_FIELD_INSET }}
                                        >
                                            <MenuItem value=""><em>{t('DataSources.wizard.clientFieldNone')}</em></MenuItem>
                                            {clientFieldGroups.map(g => ([
                                                /* Sticky (disableSticky removed 2026-08-09). With 1 + 3 headings + up to 27
                                                   options in a 320px menu, the heading that tells "פרטי הנמען" apart from
                                                   "שדות נוספים" scrolls out of view — and an account extra field the account
                                                   named "טלפון" is then character-identical to the recipient's own "טלפון".
                                                   The explicit background is REQUIRED with sticky: MUI v4's sticky class is
                                                   backgroundColor:'inherit' and the Menu's own list element is transparent, so
                                                   without it the options scroll straight through the pinned heading. That is
                                                   almost certainly why disableSticky was there in the first place.
                                                   NOTE: a plain block comment, NOT a braced JSX comment — these elements are
                                                   members of an ARRAY literal, where a braced JSX comment parses as an empty
                                                   object and becomes a bogus array element. */
                                                <ListSubheader key={`h-${g.key}`} style={{ fontSize: 12, lineHeight: '28px', background: '#fff' }}>
                                                    {t(`DataSources.wizard.clientFieldGroups.${g.key}`)}
                                                </ListSubheader>,
                                                ...g.options.map(o => (
                                                    <MenuItem key={o.Id} value={o.Id}
                                                        disabled={takenClientFields.has(o.Id) && c.ClientFieldTarget !== o.Id}>
                                                        {clientFieldLabel(o)}
                                                    </MenuItem>
                                                ))
                                            ]))}
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        {/* Identity + supervisor columns are type-locked (Email/Phone); info columns pick Text/Number/Date. */}
                                        <Box style={{ ...PRIMARY_BAND, gap: 2 }}>
                                            <FormControl variant="outlined" size="small" style={{ minWidth: 120 }}>
                                                <Select value={c.DataType} disabled={!isInfo} MenuProps={MENU_PROPS} style={{ fontSize: 14 }}
                                                    onChange={(e) => setDataType(i, Number(e.target.value) as eDataType)}>
                                                    {(isInfo ? [eDataType.TEXT, eDataType.NUMBER, eDataType.DATE] : [c.DataType]).map(v => (
                                                        <MenuItem key={v} value={v}>{t(`DataSources.column.dataTypes.${v}`)}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                            {/* Why the type is what it is, in the user's own values. Type-locked
                                                columns still get the ℹ️ — the evidence is the answer to "why is
                                                this greyed out as Phone?" — but with no change control. */}
                                            <TypeEvidencePopover
                                                detection={c.Detection}
                                                value={c.DataType}
                                                options={isInfo ? [eDataType.TEXT, eDataType.NUMBER, eDataType.DATE] : [c.DataType]}
                                                onChange={(dt) => setDataType(i, dt)}
                                                disabled={!isInfo}
                                            />
                                        </Box>
                                        {/* NUMBER only. On any other type the flag is meaningless, and showing a
                                            dead checkbox on every text column is noise. Default ON.
                                            The BAND is unconditional even though the control is not — that is the point:
                                            reserving it on every row is what stops a NUMBER row and a text row from
                                            having different heights, which was half the misalignment. */}
                                        <Box style={SUB_BAND}>
                                            {c.DataType === eDataType.NUMBER && (
                                                <FormControlLabel
                                                    style={{ marginInlineStart: 0, marginTop: 0, marginRight: 0 }}
                                                    control={<Checkbox size="small" checked={c.ShowThousandsSeparator !== false}
                                                        onChange={(e) => setShowThousandsSeparator(i, e.target.checked)} />}
                                                    label={<span style={{ fontSize: 12.5, color: '#5b6b7b' }}>{t('DataSources.column.showThousandsSeparator')}</span>}
                                                />
                                            )}
                                        </Box>
                                    </TableCell>
                                    {/* format cell removed 2026-08-05 — see the header comment. */}
                                    <TableCell align="center">
                                        <Box style={{ ...PRIMARY_BAND, justifyContent: 'center' }}>
                                            <Checkbox checked={c.IsSearchable} onChange={(e) => toggleSearchable(i, e.target.checked)}
                                                disabled={!c.IsSearchable && searchableRemaining <= 0} />
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Box>
            {/* The two name-enrichment checkboxes ("update client names" / "overwrite existing names")
                were removed on 2026-08-05. Choosing a client field on a column IS the opt-in now, so a
                separate "should I write it" question asked the same thing twice, and the overwrite
                half of it is expressed by the write rule itself: a non-empty source value wins, an
                empty one never erases. */}
            <Box style={{ display: 'flex', flexDirection: 'column' }}>
                {/* The overwrite rule, stated where the operator can read it. It lived ONLY in a code
                    comment until 2026-08-09 — the engine enforced a rule the UI never mentioned, and the
                    dangerous mental model ("it only fills blanks") was the natural one to arrive at.
                    Placed at the head of THIS block, not next to identityBanner: identityBanner is about
                    how columns are STORED, while this is about what happens to recipients — which is
                    exactly what createMissingClients / createAsPending below are about too. Rendered once
                    per table, never per row: the mapping row already carries four controls and two
                    sub-captions across four cells and is at its density limit. */}
                <Typography style={{ fontSize: 12, color: '#95A5A6', marginBottom: 8 }}>
                    {t('DataSources.wizard.clientFieldHint')}
                </Typography>
                <FormControlLabel
                    control={<Checkbox checked={createMissingClients} onChange={(e) => {
                        const on = e.target.checked;
                        setCreateMissingClients(on);
                        if (!on) setCreateAsPending(false);   // meaningless without "create"
                    }} />}
                    label={t('DataSources.wizard.createMissingClients')}
                />
                {/* Applies to recipients this upload CREATES and to nobody else — an existing
                    recipient never has their status touched. Nested under create-missing and reset
                    with it, so a stale tick can never ride along after the parent is unchecked. */}
                <Box style={{ paddingInlineStart: 26 }}>
                    <FormControlLabel
                        disabled={!createMissingClients}
                        control={<Checkbox checked={createAsPending} disabled={!createMissingClients}
                            onChange={(e) => setCreateAsPending(e.target.checked)} />}
                        label={t('DataSources.wizard.createAsPending')}
                    />
                    <Typography style={{ fontSize: 12, color: '#95A5A6', marginTop: -6, marginInlineStart: 32 }}>
                        {t('DataSources.wizard.createAsPendingHint')}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );

    const renderDetailsStep = () => (
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <TextField variant="outlined" label={t('DataSources.wizard.nameLabel')} value={name} onChange={(e) => setName(e.target.value)}
                error={!!errors.name} helperText={errors.name} inputProps={{ maxLength: 100 }} fullWidth />
            {/* descriptionTouched: from the first keystroke the box belongs to the user and the
                seeding effect above stops writing to it — including when the user clears it.

                helperText, only on the same-name path: clearing the box is a SILENT NO-OP there and
                the user has no way to tell. The API maps '' to DBNull (DataSourcesLogic.cs:286) and
                the SP writes ISNULL(@prm_Description, Description), i.e. blank means "leave the
                existing description alone" — the approved product decision. Pre-filling the box (the
                seeding effect above) makes "select all + delete" the natural gesture for a user who
                wants to REMOVE the description, and that gesture does nothing. There is no way to
                clear a description anywhere in the product today, so this line states the rule rather
                than pointing at a workaround that does not exist. Gated on nameExists because on the
                NEW-source path blank genuinely means "no description" and the line would be false. */}
            <TextField variant="outlined" label={t('DataSources.wizard.descriptionLabel')} value={description}
                onChange={(e) => { descriptionTouched.current = true; setDescription(e.target.value); }}
                helperText={nameExists ? t('DataSources.wizard.descriptionKeepHint') : undefined}
                inputProps={{ maxLength: 500 }} multiline rows={2} fullWidth />
            {nameExists && (
                <Typography style={{ color: '#b54708', fontSize: 13 }}>
                    {t('DataSources.wizard.newVersionNotice', { n: nextVersion })}
                </Typography>
            )}
            {/* Summary: muted label + bold value, one pair per line (it used to read as two raw
                concatenated strings). Identity uses the SHORT labels — the role dropdown's
                "(identity)" suffix is redundant on a line already labelled "identity mapping". */}
            <Box style={{ background: '#f6f9fc', borderRadius: 8, padding: 12 }}>
                <Box style={{ display: 'flex', alignItems: 'baseline', marginBottom: 4 }}>
                    <Typography color="textSecondary">{`${t('DataSources.table.rows')}:`}</Typography>
                    <Typography style={{ fontWeight: 700, marginInlineStart: 6 }}>
                        {rowCount !== null ? (rowCount - 1).toLocaleString() : t('DataSources.wizard.rowsUnknown')}
                    </Typography>
                </Box>
                <Box style={{ display: 'flex', alignItems: 'baseline' }}>
                    <Typography color="textSecondary">{`${t('DataSources.wizard.steps.identity')}:`}</Typography>
                    <Typography style={{ fontWeight: 700, marginInlineStart: 6 }}>
                        {[hasEmail ? t('DataSources.wizard.identityEmailShort') : null, hasCell ? t('DataSources.wizard.identityCellShort') : null].filter(Boolean).join(', ') || t('DataSources.wizard.identityNoneShort')}
                    </Typography>
                </Box>
                {/* The write-backs, listed before the commit. Until 2026-08-09 the only surface between
                    picking a target on row 1 and pressing "העלה" was a 151px control that ellipsises its
                    own label, nineteen table rows earlier — so this is the ONLY review moment before a bulk
                    mutation of recipient records that has no undo and no audit surface anywhere in the
                    product. Deliberately step 3 and not a step-2 recap: a summary that sits beside the
                    controls it summarises is not an independent check. */}
                {clientFieldMappings.length > 0 && (
                    <Box style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #e3ebf3' }}>
                        <Typography color="textSecondary">{t('DataSources.wizard.clientFieldSummaryLabel')}</Typography>
                        {clientFieldMappings.map(m => (
                            <Typography key={m.opt.Id} style={{ fontWeight: 700, marginTop: 2 }}>
                                {t('DataSources.wizard.clientFieldSummaryRow', {
                                    field: clientFieldLabel(m.opt) + (m.slot ? ' ' + t(`DataSources.wizard.${m.slot.key}`, { n: m.slot.n }) : ''),
                                    column: m.col.DisplayName
                                })}
                            </Typography>
                        ))}
                        {/* Above the blank notice, because "0 blank rows" reads as "everything will be
                            written" and for a date target that does not follow. */}
                        {clientFieldMappings.filter(m => m.isDateTarget).map(m => (
                            <Typography key={`dt-${m.opt.Id}`} style={{ fontSize: 12, color: '#b54708', marginTop: 2 }}>
                                {t('DataSources.wizard.clientFieldDateNotice', { column: m.col.DisplayName, field: clientFieldLabel(m.opt) })}
                            </Typography>
                        ))}
                        {/* The counts above come from the FILE. The engine writes only recipients it
                            resolved to a record — matched on email/cellphone, or created when
                            create-missing is on — and only the first source row per recipient. So the
                            written population is at most the file's rows and is often materially fewer.
                            Stating it here is the difference between a summary and a promise. */}
                        <Typography style={{ fontSize: 12, color: '#95A5A6', marginTop: 4 }}>
                            {t('DataSources.wizard.clientFieldScopeNotice')}
                        </Typography>
                        {/* The blank-cell count, for THIS file. The rule is COALESCE(new, current): a blank
                            cell does not clear the field, it leaves whatever is already on the recipient. So
                            a file blank in 300 of 1,000 rows leaves the CRM in a state present in neither the
                            file nor the previous CRM — 700 fresh values and 300 stale ones, indistinguishable
                            afterwards. Stating the rule above the table is necessary but does not tell the
                            operator that this column, right now, has 300 of them. */}
                        {clientFieldMappings.filter(m => m.blank !== null && m.blank > 0).map(m => (
                            <Typography key={`blank-${m.opt.Id}`} style={{ fontSize: 12, color: '#b54708', marginTop: 2 }}>
                                {t('DataSources.wizard.clientFieldBlankNotice', {
                                    column: m.col.DisplayName,
                                    blank: (m.blank as number).toLocaleString(),
                                    total: (m.total as number).toLocaleString(),
                                    field: clientFieldLabel(m.opt)
                                })}
                            </Typography>
                        ))}
                    </Box>
                )}
            </Box>
            {/* Fires on a RE-upload, whether or not anything is mapped — forgetting to re-pick is the
                failure, so it cannot be gated on a mapping existing. ClientFieldTarget is deliberately not
                inherited from the previous version (the filtered unique index on DataSourceColumns would
                otherwise let two columns claim one target), and nothing in the product can show what the
                last version mapped — no GET returns the field, no view or history dialog renders it. So the
                omission is invisible: the upload succeeds, resolves normally, and writes nothing. */}
            {nameExists && (
                <Typography style={{ fontSize: 12, color: '#b54708' }}>
                    {t('DataSources.wizard.clientFieldVersionReminder')}
                </Typography>
            )}
            {uploading && uploadProgress !== null && <LinearProgress variant="determinate" value={uploadProgress} />}
            {errors.upload && <Typography style={{ color: '#B42318' }}>{errors.upload}</Typography>}
        </Box>
    );

    const steps = [t('DataSources.wizard.steps.file'), t('DataSources.wizard.steps.identity'), t('DataSources.wizard.steps.details')];
    const canNext = step === 0 ? (!!file && previewRows.length > 0) : true;

    return (
        // `dir` is MANDATORY on every Dialog here and is NOT inherited: MUI v4 Dialogs portal into
        // document.body, outside the <div dir={isRTL...}> at App.js:1024, and <html dir> is stuck at
        // "ltr" because App.js:733-736 writes it once at mount from i18n.language — still the 'en'
        // default from i18n.js at that point. jss-rtl mirrors CSS but never sets `direction`, so it
        // cannot compensate. Reactive, NOT hardcoded "rtl", so en/pl accounts render LTR — same idiom
        // as TestSendDialog.tsx:69 and SmartSendManageTab.tsx:305.
        <Dialog open={open} onClose={requestClose} fullWidth maxWidth="md" dir={isRtl ? 'rtl' : 'ltr'} PaperProps={{ className: dsDialog.paper }}>
            <DialogTitle>{t('DataSources.wizard.title')}</DialogTitle>
            <DialogContent>
                <Stepper activeStep={step} alternativeLabel>
                    {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
                </Stepper>
                {step === 0 && renderFileStep()}
                {step === 1 && renderIdentityStep()}
                {step === 2 && renderDetailsStep()}
            </DialogContent>
            <DialogActions>
                <Button onClick={requestClose} disabled={uploading}>{t('common.cancel')}</Button>
                {step > 0 && <Button onClick={() => setStep(step - 1)} disabled={uploading}>{t('DataSources.wizard.back')}</Button>}
                {step < 2 && <Button color="primary" variant="contained" onClick={() => setStep(step + 1)} disabled={!canNext}>{t('DataSources.wizard.next')}</Button>}
                {step === 2 && <Button color="primary" variant="contained" onClick={doUpload} disabled={uploading}>{t('DataSources.wizard.confirmUpload')}</Button>}
            </DialogActions>
        </Dialog>
    );
};

export default UploadWizardDialog;
