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
    UploadColumnDef, eDataType, eFormatHint, eSemanticRole, DataSourceLimits,
    eClientField, ClientFieldOption, CLIENT_FIELD_CATALOGUE
} from '../../../Models/DataSources/DataSource';
import { checkQuota, insertDataSource, setUploadProgress } from '../../../redux/reducers/dataSourcesSlice';
import { useDsDialogStyles } from './dialogStyles';

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

// ── per-column value classification (drives the wizard's auto-typing) ──
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const cleanDigits = (v: any) => String(v).replace(/[\s\-()+]/g, '');
const isEmailVal = (v: any) => EMAIL_RE.test(String(v).trim());
// Israeli mobile only, per spec: local 05 + 8 digits (10 total), or intl 9725 + 8 digits (12 total).
const isPhoneVal = (v: any) => { const c = cleanDigits(v); return /^05\d{8}$/.test(c) || /^9725\d{8}$/.test(c); };
/* Three digit groups separated by / - or . , with an OPTIONAL time part.
   The time part is why this changed: the old expression anchored $ straight after the year, so a
   real export like "14/12/2017 12:47 PM" failed and the whole column silently fell through to
   text. `\s+` (not a single space) because Excel exports do emit double spaces before the time.
   Deliberately NOT validated as a real date — 99/99/9999 matches. This only decides a DISPLAY
   LABEL: the cell is stored and sent as the raw string either way, and nothing downstream parses
   it. Do not "improve" this into a real date parser without deciding day-first vs month-first
   first — 05/04/1956 is ambiguous and today nobody has to resolve it. */
const isDateVal = (v: any) => /^\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}(?:(?:\s+|T)\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AaPp]\.?[Mm]\.?)?)?$/.test(String(v).trim());
const isNumberVal = (v: any) => { const s = String(v).trim(); return s !== '' && (/^-?\d{1,3}(,\d{3})*(\.\d+)?$/.test(s) || /^-?\d+(\.\d+)?$/.test(s)); };
type ColKind = 'email' | 'phone' | 'date' | 'number' | 'text';
// Order matters: email → phone (phones are all-digits too) → date → number → text.
const classifyColumn = (vals: any[]): ColKind => {
    if (vals.length === 0) return 'text';
    if (vals.every(isEmailVal)) return 'email';
    if (vals.every(isPhoneVal)) return 'phone';
    if (vals.every(isDateVal)) return 'date';
    if (vals.every(isNumberVal)) return 'number';
    return 'text';
};

// A "supervisor email" is stored as a plain INFO field (SemanticRole NONE, DataType EMAIL) — this
// UI-only flag just remembers the wizard's supervisor tag so the role dropdown reflects it. It is
// stripped from the payload before upload (the server has no such column).
type WizardColumn = UploadColumnDef & { IsSupervisorEmail?: boolean };

// Dropdown menus must open BELOW the field (never over it) and stay anchored to the field's START
// edge — right under RTL, left under LTR. The branch is required: anchorOrigin is a PROP, not CSS,
// so jss-rtl never sees it, and MUI v4's Popover has no direction handling of its own. Hardcoding
// 'right' pinned the menu to the field's END edge for en/pl, so a menu wider than its field grew
// outwards instead of along the field.
// getContentAnchorEl:null is what lets anchorOrigin.vertical:'bottom' actually take effect in MUI v4.
const menuPropsFor = (isRtl: boolean): any => ({
    getContentAnchorEl: null,
    anchorOrigin: { vertical: 'bottom', horizontal: isRtl ? 'right' : 'left' },
    transformOrigin: { vertical: 'top', horizontal: isRtl ? 'right' : 'left' },
    PaperProps: { style: { maxHeight: 320, marginTop: 4 } }
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
        setRowCount(null); setName(''); setDescription(''); setCreateMissingClients(true);
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
    const parseXlsx = (file: File): Promise<{ rows: string[][]; rowCount: number | null }> => new Promise((resolve, reject) => {
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
                if (file.size <= XLSX_COUNT_MAX_BYTES) {
                    try {
                        const fullWb = XLSX.read(data, { type: 'array' });
                        const fullSheet = fullWb.Sheets[fullWb.SheetNames[0]];
                        if (fullSheet) total = (XLSX.utils.sheet_to_json(fullSheet, { header: 1, blankrows: false }) as any[]).length;
                    } catch { total = null; }
                }
                resolve({ rows, rowCount: total });
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

    const countCsvRows = (file: File, encoding: string): Promise<number> => new Promise((resolve, reject) => {
        let count = 0;
        Papa.parse(file as any, {
            skipEmptyLines: true, encoding, worker: true,
            step: () => { count++; },
            complete: () => resolve(count),
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
        return hdrs.map((h, i) => {
            const header = (h && h.trim()) ? h.trim() : `${t('DataSources.table.name')} ${i + 1}`;
            const lower = header.toLowerCase();
            const colVals = sample.map(r => r[i]).filter(v => v !== undefined && v !== null && String(v).trim() !== '');
            const kind = classifyColumn(colVals);
            const headerEmail = /mail|אימייל|דוא/.test(lower);
            const headerPhone = /phone|נייד|סלולר|cell|mobile|טלפון/.test(lower);

            let role: eSemanticRole = eSemanticRole.NONE;
            let dataType: eDataType = eDataType.TEXT;
            let isSupervisor = false;

            const looksEmail = kind === 'email' || (headerEmail && colVals.length === 0);
            const looksPhone = kind === 'phone' || (headerPhone && colVals.length === 0);

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
                IsSearchable: isSearchable, IsSupervisorEmail: isSupervisor
            };
        });
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
            if (ext === 'xls' || ext === 'xlsx') {
                const parsed = await parseXlsx(chosen); // count is null on oversized/unreadable workbooks (worker still enforces MaxRows)
                rows = parsed.rows;
                count = parsed.rowCount;
            } else {
                const enc = await detectEncoding(chosen);
                rows = await parseCsvPreview(chosen, enc);
                count = await countCsvRows(chosen, enc);
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
    const setDataType = (idx: number, dt: eDataType) =>
        setColumns(cols => cols.map((c, i) => i === idx
            ? { ...c, DataType: dt, FormatHint: dt === eDataType.NUMBER ? c.FormatHint : eFormatHint.NONE }
            : c));

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
            ClientFieldTarget: c.ClientFieldTarget ?? null
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
                                <TableRow key={i}>
                                    <TableCell style={{ minWidth: 190 }}>
                                        <TextField variant="outlined" size="small" value={c.DisplayName} onChange={(e) => setDisplayName(i, e.target.value)}
                                            inputProps={{ maxLength: 200, style: { fontSize: 14 } }} fullWidth />
                                        <Typography style={{ fontSize: 12, color: '#95A5A6', marginTop: 2 }}>
                                            {`${t('DataSources.wizard.originalHeader')}: ${c.SourceHeader}`}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <FormControl variant="outlined" size="small" style={{ minWidth: 165 }}>
                                            <Select value={roleValueOf(c)} MenuProps={MENU_PROPS} style={{ fontSize: 14 }}
                                                onChange={(e) => setRoleValue(i, String(e.target.value))}>
                                                {roleOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                                            </Select>
                                        </FormControl>
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
                                            renderValue={() => {
                                                const opt = clientFieldOptions.find(o => o.Id === c.ClientFieldTarget);
                                                return opt
                                                    ? <span style={{ fontSize: 12.5, color: '#0b7285', fontWeight: 600 }}>
                                                        {t('DataSources.wizard.clientFieldTag', { name: clientFieldLabel(opt) })}
                                                    </span>
                                                    : <span style={{ fontSize: 12.5, color: '#5b6b7b' }}>
                                                        {t('DataSources.wizard.clientFieldAdd')}
                                                    </span>;
                                            }}
                                            style={{ fontSize: 12.5, marginTop: 4 }}
                                        >
                                            <MenuItem value=""><em>{t('DataSources.wizard.clientFieldNone')}</em></MenuItem>
                                            {clientFieldGroups.map(g => ([
                                                <ListSubheader key={`h-${g.key}`} disableSticky style={{ fontSize: 12, lineHeight: '28px' }}>
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
                                        <FormControl variant="outlined" size="small" style={{ minWidth: 120 }}>
                                            <Select value={c.DataType} disabled={!isInfo} MenuProps={MENU_PROPS} style={{ fontSize: 14 }}
                                                onChange={(e) => setDataType(i, Number(e.target.value) as eDataType)}>
                                                {(isInfo ? [eDataType.TEXT, eDataType.NUMBER, eDataType.DATE] : [c.DataType]).map(v => (
                                                    <MenuItem key={v} value={v}>{t(`DataSources.column.dataTypes.${v}`)}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </TableCell>
                                    {/* format cell removed 2026-08-05 — see the header comment. */}
                                    <TableCell align="center">
                                        <Checkbox checked={c.IsSearchable} onChange={(e) => toggleSearchable(i, e.target.checked)}
                                            disabled={!c.IsSearchable && searchableRemaining <= 0} />
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
            </Box>
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
