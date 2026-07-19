import { useState, useEffect, useRef } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Stepper, Step, StepLabel,
    Table, TableBody, TableCell, TableHead, TableRow, Select, MenuItem, Checkbox, FormControlLabel,
    TextField, LinearProgress
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { ERROR_TYPE } from '../../../helpers/Types/common';
import {
    UploadColumnDef, eDataType, eFormatHint, eSemanticRole, DataSourceLimits
} from '../../../Models/DataSources/DataSource';
import { checkQuota, insertDataSource, setUploadProgress } from '../../../redux/reducers/dataSourcesSlice';

interface UploadWizardDialogProps {
    classes: { [key: string]: string };
    open: boolean;
    onClose: () => void;
    onUploaded: (id: number) => void;
    setToastMessage: (msg: ERROR_TYPE) => void;
    existingSources?: { Name: string; VersionNumber: number }[];
}

const ALLOWED = ['csv', 'xls', 'xlsx', 'tsv'];
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE_RE = /^(\+?972|0)?[\s-]?\d[\d\s-]{6,}$/;

const extOf = (name: string) => {
    const parts = (name || '').split('.');
    return parts.length > 0 ? parts[parts.length - 1].toLowerCase() : '';
};

const UploadWizardDialog = ({ classes, open, onClose, onUploaded, setToastMessage, existingSources = [] }: UploadWizardDialogProps) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { uploadProgress, quota } = useSelector((s: any) => s.dataSources);
    const limits: DataSourceLimits | null = quota?.Limits ?? null;

    const [step, setStep] = useState(0);
    const [file, setFile] = useState<File | null>(null);
    const [headers, setHeaders] = useState<string[]>([]);
    const [previewRows, setPreviewRows] = useState<string[][]>([]);
    const [columns, setColumns] = useState<UploadColumnDef[]>([]);
    const [rowCount, setRowCount] = useState<number | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [createMissingClients, setCreateMissingClients] = useState(true);
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const [uploading, setUploading] = useState(false);
    const [parsing, setParsing] = useState(false);
    const dragRef = useRef(false);

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

    const parseXlsx = (file: File): Promise<string[][]> => new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = (e: any) => {
            try {
                const data = new Uint8Array(e.target.result);
                const wb = XLSX.read(data, { type: 'array', sheetRows: 6 }); // parse only 6 rows → fast on big files
                const sheet = wb.Sheets[wb.SheetNames[0]];
                const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false });
                resolve(rows.map(row => row.map((c: any) => (c === null || c === undefined) ? '' : String(c))));
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

    const buildColumns = (hdrs: string[], sample: string[][]): UploadColumnDef[] => {
        const usedRoles = new Set<number>();
        return hdrs.map((h, i) => {
            const header = (h && h.trim()) ? h.trim() : `${t('DataSources.table.name')} ${i + 1}`;
            const colVals = sample.map(r => r[i]).filter(v => v !== undefined && v !== '');
            let role: eSemanticRole = eSemanticRole.NONE;
            const lower = header.toLowerCase();
            const looksEmail = colVals.length > 0 && colVals.every(v => EMAIL_RE.test(String(v)));
            const looksPhone = colVals.length > 0 && colVals.every(v => PHONE_RE.test(String(v).replace(/\s/g, '')));
            if (!usedRoles.has(eSemanticRole.RECIPIENT_EMAIL) && (/mail|אימייל|דוא/.test(lower) || looksEmail)) {
                role = eSemanticRole.RECIPIENT_EMAIL; usedRoles.add(role);
            } else if (!usedRoles.has(eSemanticRole.RECIPIENT_CELLPHONE) && (/phone|נייד|סלולר|cell|mobile|טלפון/.test(lower) || looksPhone)) {
                role = eSemanticRole.RECIPIENT_CELLPHONE; usedRoles.add(role);
            }
            const dataType = role === eSemanticRole.RECIPIENT_EMAIL ? eDataType.EMAIL
                : role === eSemanticRole.RECIPIENT_CELLPHONE ? eDataType.PHONE : eDataType.TEXT;
            return {
                Ordinal: i + 1, SourceHeader: header, DisplayName: header,
                DataType: dataType, FormatHint: eFormatHint.NONE, SemanticRole: role, IsSearchable: false
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
                rows = await parseXlsx(chosen); // no cheap row count for xlsx (worker enforces MaxRows)
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
            // csv/tsv: enforce MaxRows locally before upload
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
    const setRole = (idx: number, role: eSemanticRole) => {
        setColumns(cols => cols.map((c, i) => {
            if (i === idx) {
                const dataType = role === eSemanticRole.RECIPIENT_EMAIL ? eDataType.EMAIL
                    : role === eSemanticRole.RECIPIENT_CELLPHONE ? eDataType.PHONE : eDataType.TEXT;
                // identity columns never carry a currency/percent format
                return { ...c, SemanticRole: role, DataType: dataType, FormatHint: role === eSemanticRole.NONE ? c.FormatHint : eFormatHint.NONE };
            }
            // enforce ≤1 of each identity role — clear the previous holder
            if (role !== eSemanticRole.NONE && c.SemanticRole === role) return { ...c, SemanticRole: eSemanticRole.NONE, DataType: eDataType.TEXT };
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

    const setFormatHint = (idx: number, fh: eFormatHint) =>
        setColumns(cols => cols.map((c, i) => i === idx ? { ...c, FormatHint: fh } : c));

    const hasEmail = columns.some(c => c.SemanticRole === eSemanticRole.RECIPIENT_EMAIL);
    const hasCell = columns.some(c => c.SemanticRole === eSemanticRole.RECIPIENT_CELLPHONE);
    const matchedSource = name ? existingSources.find(s => s.Name && s.Name.trim().toLowerCase() === name.trim().toLowerCase()) : undefined;
    const nameExists = !!matchedSource;
    const nextVersion = matchedSource ? (matchedSource.VersionNumber || 0) + 1 : 0;

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
        fd.append('columns', JSON.stringify(columns));

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
        setErrors({ upload: t('DataSources.errors.generalError') });
    };

    const requestClose = () => {
        if (uploading) return;
        if (file && !window.confirm(t('DataSources.wizard.abandonConfirm'))) return;
        onClose();
    };

    // ── render ──────────────────────────────────────────────────────────────
    const roleOptions = [
        { value: eSemanticRole.NONE, label: t('DataSources.wizard.roleNone') },
        { value: eSemanticRole.RECIPIENT_EMAIL, label: t('DataSources.wizard.roleEmail') },
        { value: eSemanticRole.RECIPIENT_CELLPHONE, label: t('DataSources.wizard.roleCellphone') }
    ];

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
            <Typography style={{ fontSize: 13, color: '#5b6b7b', marginBottom: 8 }}>
                {t('DataSources.column.searchableRemaining', { n: searchableRemaining })}
            </Typography>
            <Box style={{ overflowX: 'auto' }}>
                <Table size="small">
                    <TableHead><TableRow>
                        <TableCell>{t('DataSources.wizard.columnNameLabel')}</TableCell>
                        <TableCell>{t('DataSources.wizard.steps.identity')}</TableCell>
                        <TableCell>{t('DataSources.column.dataType')}</TableCell>
                        <TableCell>{t('DataSources.column.formatHint')}</TableCell>
                        <TableCell align="center">{t('DataSources.wizard.searchableLabel')}</TableCell>
                    </TableRow></TableHead>
                    <TableBody>
                        {columns.map((c, i) => {
                            const isInfo = c.SemanticRole === eSemanticRole.NONE;
                            return (
                                <TableRow key={i}>
                                    <TableCell style={{ minWidth: 160 }}>
                                        <TextField value={c.DisplayName} onChange={(e) => setDisplayName(i, e.target.value)}
                                            inputProps={{ maxLength: 200 }} fullWidth />
                                        <Typography style={{ fontSize: 11, color: '#95A5A6' }}>
                                            {`${t('DataSources.wizard.originalHeader')}: ${c.SourceHeader}`}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Select value={c.SemanticRole} onChange={(e) => setRole(i, Number(e.target.value) as eSemanticRole)} style={{ minWidth: 150 }}>
                                            {roleOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        {/* Identity columns are locked to Email(4)/Phone(5); info columns pick Text/Number/Date. */}
                                        <Select value={c.DataType} disabled={!isInfo} style={{ minWidth: 110 }}
                                            onChange={(e) => setDataType(i, Number(e.target.value) as eDataType)}>
                                            {(isInfo ? [eDataType.TEXT, eDataType.NUMBER, eDataType.DATE] : [c.DataType]).map(v => (
                                                <MenuItem key={v} value={v}>{t(`DataSources.column.dataTypes.${v}`)}</MenuItem>
                                            ))}
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        {/* Currency/Percent only apply to numeric info columns. */}
                                        <Select value={c.FormatHint} disabled={!isInfo || c.DataType !== eDataType.NUMBER} style={{ minWidth: 100 }}
                                            onChange={(e) => setFormatHint(i, Number(e.target.value) as eFormatHint)}>
                                            {[eFormatHint.NONE, eFormatHint.CURRENCY, eFormatHint.PERCENT].map(v => (
                                                <MenuItem key={v} value={v}>{t(`DataSources.column.formatHints.${v}`)}</MenuItem>
                                            ))}
                                        </Select>
                                    </TableCell>
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
            <FormControlLabel
                control={<Checkbox checked={createMissingClients} onChange={(e) => setCreateMissingClients(e.target.checked)} />}
                label={t('DataSources.wizard.createMissingClients')}
            />
        </Box>
    );

    const renderDetailsStep = () => (
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <TextField label={t('DataSources.wizard.nameLabel')} value={name} onChange={(e) => setName(e.target.value)}
                error={!!errors.name} helperText={errors.name} inputProps={{ maxLength: 100 }} fullWidth />
            <TextField label={t('DataSources.wizard.descriptionLabel')} value={description} onChange={(e) => setDescription(e.target.value)}
                inputProps={{ maxLength: 500 }} multiline rows={2} fullWidth />
            {nameExists && (
                <Typography style={{ color: '#b54708', fontSize: 13 }}>
                    {t('DataSources.wizard.newVersionNotice', { n: nextVersion })}
                </Typography>
            )}
            <Box style={{ background: '#f6f9fc', borderRadius: 8, padding: 12 }}>
                <Typography>{`${t('DataSources.table.rows')}: ${rowCount !== null ? (rowCount - 1).toLocaleString() : '—'}`}</Typography>
                <Typography>{`${t('DataSources.wizard.steps.identity')}: ${[hasEmail ? t('DataSources.wizard.roleEmail') : null, hasCell ? t('DataSources.wizard.roleCellphone') : null].filter(Boolean).join(', ') || t('DataSources.viewOnlyBadge')}`}</Typography>
            </Box>
            {uploading && uploadProgress !== null && <LinearProgress variant="determinate" value={uploadProgress} />}
            {errors.upload && <Typography style={{ color: '#B42318' }}>{errors.upload}</Typography>}
        </Box>
    );

    const steps = [t('DataSources.wizard.steps.file'), t('DataSources.wizard.steps.identity'), t('DataSources.wizard.steps.details')];
    const canNext = step === 0 ? (!!file && previewRows.length > 0) : true;

    return (
        <Dialog open={open} onClose={requestClose} fullWidth maxWidth="md" dir="rtl">
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
