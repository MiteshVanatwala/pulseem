import { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem,
    FormControlLabel, Checkbox, Box, Typography, InputLabel, FormControl
} from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { updateColumnMeta } from '../../../redux/reducers/dataSourcesSlice';
import { DataSourceColumn, eDataType, eFormatHint, eSemanticRole } from '../../../Models/DataSources/DataSource';

interface EditColumnDialogProps {
    classes: { [key: string]: string };
    open: boolean;
    column: DataSourceColumn | null;
    searchableRemaining: number;
    maxSearchable: number;
    onClose: () => void;
    onSaved: () => void;
}

// Synchronous save (the SP builds SearchValues in batches; the UI shows "building index" + disabled).
// SemanticRole is locked (identity change = new version). Searchable quota is enforced client-side and
// server-side (-7 → tooManySearchable). -8 = column locked by an active campaign.
const EditColumnDialog = ({ classes, open, column, searchableRemaining, maxSearchable, onClose, onSaved }: EditColumnDialogProps) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [displayName, setDisplayName] = useState('');
    const [dataType, setDataType] = useState<eDataType>(eDataType.TEXT);
    const [formatHint, setFormatHint] = useState<eFormatHint>(eFormatHint.NONE);
    const [isSearchable, setIsSearchable] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open && column) {
            setDisplayName(column.DisplayName || '');
            setDataType(column.DataType);
            setFormatHint(column.FormatHint);
            setIsSearchable(column.IsSearchable);
            setError('');
            setSaving(false);
        }
    }, [open, column]);

    if (!column) return null;

    const isIdentity = column.SemanticRole !== eSemanticRole.NONE;
    // Turning ON search when the quota is already used (and it wasn't already on) is blocked.
    const turningOnBlocked = isSearchable && !column.IsSearchable && searchableRemaining <= 0;

    const handleSave = async () => {
        setError('');
        if (displayName && displayName.length > 200) { setError(t('DataSources.errors.generalError')); return; }
        setSaving(true);
        const res: any = await dispatch(updateColumnMeta({
            ColumnID: column.ColumnID,
            DisplayName: displayName,
            DataType: dataType,
            FormatHint: formatHint,
            IsSearchable: isSearchable
        }));
        setSaving(false);
        const payload = res?.payload;
        const code = payload?.StatusCode;
        if (code === 200) { onSaved(); return; }
        if (code === 409 && payload?.Message === 'TOO_MANY_SEARCHABLE') { setError(t('DataSources.errors.tooManySearchableColumns', { max: maxSearchable })); return; }
        if (code === 409 && payload?.Message === 'COLUMN_LOCKED_BY_CAMPAIGN') { setError(t('DataSources.errors.columnLockedByCampaign')); return; }
        if (code === 409 && payload?.Message === 'EDIT_BLOCKED_DURING_SEND') { setError(t('DataSources.errors.editBlockedDuringSend')); return; }
        if (code === 403) { setError(t('DataSources.errors.invalidChars')); return; }
        setError(t('DataSources.errors.generalError'));
    };

    return (
        <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm" dir="rtl">
            <DialogTitle>{t('DataSources.column.editTitle')}</DialogTitle>
            <DialogContent>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
                    <TextField label={t('DataSources.column.displayName')} value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)} inputProps={{ maxLength: 200 }} fullWidth />

                    <FormControl fullWidth>
                        <InputLabel shrink>{t('DataSources.column.dataType')}</InputLabel>
                        {/* Identity columns are locked to Email(4)/Phone(5); info columns pick Text/Number/Date — same rule as the wizard. */}
                        <Select value={dataType} disabled={isIdentity}
                            onChange={(e) => {
                                const dt = Number(e.target.value) as eDataType;
                                setDataType(dt);
                                if (dt !== eDataType.NUMBER) setFormatHint(eFormatHint.NONE);
                            }}>
                            {(isIdentity ? [dataType] : [eDataType.TEXT, eDataType.NUMBER, eDataType.DATE]).map(v => (
                                <MenuItem key={v} value={v}>{t(`DataSources.column.dataTypes.${v}`)}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel shrink>{t('DataSources.column.formatHint')}</InputLabel>
                        {/* Currency/Percent apply only to numeric info columns. */}
                        <Select value={formatHint} disabled={isIdentity || dataType !== eDataType.NUMBER}
                            onChange={(e) => setFormatHint(Number(e.target.value) as eFormatHint)}>
                            {[eFormatHint.NONE, eFormatHint.CURRENCY, eFormatHint.PERCENT].map(v => (
                                <MenuItem key={v} value={v}>{t(`DataSources.column.formatHints.${v}`)}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControlLabel
                        control={<Checkbox checked={isSearchable} disabled={saving}
                            onChange={(e) => setIsSearchable(e.target.checked)} />}
                        label={t('DataSources.column.isSearchable')}
                    />
                    {isSearchable && !column.IsSearchable && (
                        <Typography style={{ fontSize: 12, color: '#5b6b7b' }}>
                            {t('DataSources.column.searchableRemaining', { n: searchableRemaining })}
                        </Typography>
                    )}
                    {turningOnBlocked && (
                        <Typography style={{ fontSize: 12, color: '#b54708' }}>
                            {t('DataSources.column.searchableQuotaReached', { max: maxSearchable })}
                        </Typography>
                    )}

                    {isIdentity && (
                        <Typography style={{ fontSize: 12, color: '#5b6b7b' }}>{t('DataSources.column.identityLocked')}</Typography>
                    )}
                    {saving && isSearchable && (
                        <Typography style={{ fontSize: 13, color: '#1565d8' }}>{t('DataSources.column.buildingSearchIndex')}</Typography>
                    )}
                    {error && <Typography style={{ color: '#B42318', fontSize: 13 }}>{error}</Typography>}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={saving}>{t('common.cancel')}</Button>
                <Button color="primary" variant="contained" onClick={handleSave} disabled={saving || turningOnBlocked}>
                    {t('common.save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditColumnDialog;
