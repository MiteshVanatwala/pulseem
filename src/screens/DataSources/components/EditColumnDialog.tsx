import { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem,
    FormControlLabel, Checkbox, Box, Typography, FormControl
} from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { updateColumnMeta } from '../../../redux/reducers/dataSourcesSlice';
import { DataSourceColumn, eFormatHint, eSemanticRole, ColumnDetection } from '../../../Models/DataSources/DataSource';
import { eDataType } from '../../../Models/DataSources/DataSourceEnums';
import { useDsDialogStyles } from './dialogStyles';
import TypeEvidencePopover from './TypeEvidencePopover';

interface EditColumnDialogProps {
    classes: { [key: string]: string };
    open: boolean;
    column: DataSourceColumn | null;
    searchableRemaining: number;
    maxSearchable: number;
    /** Evidence for the column's type, re-derived from the rows currently on screen. Null = none. */
    detection?: ColumnDetection | null;
    /**
     * HISTORICAL VERSION. Only IsSearchable may be changed; DisplayName and DataType are frozen.
     * A past version is the record of how a send that already happened was described — renaming a
     * column or re-typing it after the fact rewrites that record, and a report of that send would
     * then disagree with itself. Searchability is not part of the description: it only decides
     * whether the value is indexed for lookup, which is a decision about TODAY.
     */
    restrictedToSearchable?: boolean;
    onClose: () => void;
    onSaved: () => void;
}

// Synchronous save (the SP builds SearchValues in batches; the UI shows "building index" + disabled).
// SemanticRole is locked (identity change = new version). Searchable quota is enforced client-side and
// server-side (-7 → tooManySearchable). -8 = column locked by an active campaign.
const EditColumnDialog = ({ classes, open, column, searchableRemaining, maxSearchable, detection = null, restrictedToSearchable = false, onClose, onSaved }: EditColumnDialogProps) => {
    const { t, i18n } = useTranslation();
    const isRtl = (i18n.dir?.() ?? 'rtl') === 'rtl';
    const dispatch = useDispatch();
    const dsDialog = useDsDialogStyles();
    const [displayName, setDisplayName] = useState('');
    const [dataType, setDataType] = useState<eDataType>(eDataType.TEXT);
    const [formatHint, setFormatHint] = useState<eFormatHint>(eFormatHint.NONE);
    const [isSearchable, setIsSearchable] = useState(false);
    // `!== false` and not `!!`: a column saved before ShowThousandsSeparator existed reads back as
    // undefined and must behave like the DB default (1 = on), not like "off".
    const [showThousands, setShowThousands] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Field titles must be clearly readable — slightly larger than the field's own text (16px, from the
    // shared dialog scale), so the size comes from that same scale (17px) and only the weight is set here.
    const labelStyle: any = { fontWeight: 600, color: '#344054', marginBottom: 6 };
    // Dropdowns drop below the field, anchored to its START edge: right in RTL, left in LTR.
    // anchorOrigin is a prop, not CSS, so jss-rtl never mirrors it and MUI v4's Popover does not
    // either — hardcoding 'right' anchored en/pl menus to the field's END edge.
    const menuProps: any = {
        getContentAnchorEl: null,
        anchorOrigin: { vertical: 'bottom', horizontal: isRtl ? 'right' : 'left' },
        transformOrigin: { vertical: 'top', horizontal: isRtl ? 'right' : 'left' },
        PaperProps: { dir: isRtl ? 'rtl' : 'ltr', style: { maxHeight: 320, marginTop: 4 } }
    };

    useEffect(() => {
        if (open && column) {
            setDisplayName(column.DisplayName || '');
            setDataType(column.DataType);
            setFormatHint(column.FormatHint);
            setIsSearchable(column.IsSearchable);
            setShowThousands(column.ShowThousandsSeparator !== false);
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
            IsSearchable: isSearchable,
            ShowThousandsSeparator: showThousands
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
        // Reactive dir, not hardcoded "rtl": Dialogs portal outside App.js:1024's <div dir> and
        // <html dir> is stuck at "ltr", so the attribute is mandatory — but hardcoding it forced
        // en/pl dialogs to render RTL. Full note at UploadWizardDialog.tsx.
        <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm" dir={isRtl ? 'rtl' : 'ltr'} PaperProps={{ className: dsDialog.paper }}>
            <DialogTitle>{t('DataSources.column.editTitle')}</DialogTitle>
            <DialogContent>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 4 }}>
                    {restrictedToSearchable && (
                        <Box style={{ background: '#fff4e5', border: '1px solid #f5d9b0', borderRadius: 8, padding: '8px 12px' }}>
                            <Typography style={{ color: '#b54708', fontSize: 13 }}>
                                {t('DataSources.column.historicalEditNotice')}
                            </Typography>
                        </Box>
                    )}

                    <Box>
                        <Typography style={labelStyle}>{t('DataSources.column.displayName')}</Typography>
                        <TextField variant="outlined" size="small" value={displayName}
                            disabled={restrictedToSearchable}
                            onChange={(e) => setDisplayName(e.target.value)}
                            inputProps={{ maxLength: 200 }} fullWidth />
                    </Box>

                    <Box>
                        <Typography style={labelStyle}>{t('DataSources.column.dataType')}</Typography>
                        {/* Identity columns are locked to Email(4)/Phone(5); info columns pick Text/Number/Date — same rule as the wizard. */}
                        <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FormControl variant="outlined" size="small" fullWidth>
                                <Select value={dataType} disabled={isIdentity || restrictedToSearchable} MenuProps={menuProps}
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
                            {/* Evidence re-derived from the rows on screen — the same values the user is
                                looking at, so "92% of these are numbers" is checkable on the spot. */}
                            <TypeEvidencePopover
                                detection={detection}
                                value={dataType}
                                options={(isIdentity || restrictedToSearchable) ? [dataType] : [eDataType.TEXT, eDataType.NUMBER, eDataType.DATE]}
                                onChange={(dt) => { setDataType(dt); if (dt !== eDataType.NUMBER) setFormatHint(eFormatHint.NONE); }}
                                disabled={isIdentity || restrictedToSearchable}
                            />
                        </Box>
                    </Box>

                    {/* NUMBER only — the flag has no meaning on any other type, and a permanently
                        disabled checkbox on every text column is noise. Default ON. */}
                    {dataType === eDataType.NUMBER && (
                        <FormControlLabel
                            control={<Checkbox checked={showThousands} disabled={saving || restrictedToSearchable}
                                onChange={(e) => setShowThousands(e.target.checked)} />}
                            label={t('DataSources.column.showThousandsSeparator')}
                        />
                    )}

                    {/* The "format" control (FormatHint: None/Currency/Percent) was removed on
                        2026-08-05, here and in the upload wizard, for the same reason: nothing in the
                        product ever consumed the value. The sender carries it but annotates it "not
                        applied in v1", the worker calls it "display metadata only", and no stored
                        procedure branches on it. Hiding it in only one of the two screens would have
                        left the value editable in one place and frozen in the other; hiding it in both
                        means it is provably pinned at NONE. `formatHint` state is deliberately kept and
                        still sent (unchanged) so the payload shape and the SP contract do not move —
                        restoring the control is re-adding this block, nothing more. */}

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
