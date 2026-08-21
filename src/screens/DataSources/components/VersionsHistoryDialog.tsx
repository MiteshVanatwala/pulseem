import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Table, TableBody, TableCell, TableHead,
    TableRow, Chip, Tooltip, IconButton, Box
} from '@material-ui/core';
import { Visibility, GetApp, Assessment } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { DataSourceVersion, eDataSourceStatus } from '../../../Models/DataSources/DataSource';
import { DateFormats } from '../../../helpers/Constants';
import { useDsDialogStyles } from './dialogStyles';

// Header labels take the weight/colour step of hierarchy plus one size step over the shared dialog
// scale's 15px body cells — same treatment as the upload wizard's mapping-table headers.
const hdrCellStyle = { fontWeight: 700, color: '#344054', fontSize: 16 };
// Action icons match the main list table (22px + 6px gap) so both tables read as one system. 22 and not
// 20: MUI v4's `fontSize="small"` ALREADY resolves to 20px under this theme, so 20 would be a no-op and
// the "enlarge the icons" feedback would go unaddressed. Keep in lockstep with DataSources.tsx.
const actionIconStyle = { fontSize: 22 };
// IconButton size="small" only pads 3px; 6px keeps the hit target at 34px around a 22px icon.
const actionBtnStyle = { padding: 6 };

interface VersionsHistoryDialogProps {
    classes: { [key: string]: string };
    open: boolean;
    versions: DataSourceVersion[];
    activeVersionId: number | null;
    onClose: () => void;
    onViewVersion: (vid: number) => void;
    onExportVersion: (vid: number, totalRows: number) => void;
    onShowSummary: (v: DataSourceVersion) => void;
    canView?: boolean;
    canExport?: boolean;
}

const VersionsHistoryDialog = ({
    classes, open, versions, activeVersionId, onClose, onViewVersion, onExportVersion, onShowSummary,
    canView = true, canExport = true
}: VersionsHistoryDialogProps) => {
    const { t, i18n } = useTranslation();
    const isRtl = (i18n.dir?.() ?? 'rtl') === 'rtl';
    const dsDialog = useDsDialogStyles();

    return (
        // Reactive dir, not hardcoded "rtl" — see UploadWizardDialog.tsx for why the attribute is
        // mandatory on a portalled Dialog and why hardcoding it broke en/pl.
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" dir={isRtl ? 'rtl' : 'ltr'} PaperProps={{ className: dsDialog.paper }}>
            <DialogTitle>{t('DataSources.versions.title')}</DialogTitle>
            <DialogContent>
                <Box style={{ overflowX: 'auto' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center" style={hdrCellStyle}>{t('DataSources.table.version')}</TableCell>
                                <TableCell align="center" style={hdrCellStyle}>{t('DataSources.table.status')}</TableCell>
                                <TableCell align="center" style={hdrCellStyle}>{t('DataSources.table.rows')}</TableCell>
                                <TableCell align="center" style={hdrCellStyle}>{t('DataSources.summary.resolvedRows')}</TableCell>
                                <TableCell align="center" style={hdrCellStyle}>{t('common.createdDate')}</TableCell>
                                <TableCell align="center" style={hdrCellStyle}>{t('DataSources.table.actions')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(versions || []).map(v => {
                                const isActive = v.DataSourceVersionID === activeVersionId;
                                const purged = !!v.PurgedDate;
                                return (
                                    <TableRow key={v.DataSourceVersionID}>
                                        <TableCell align="center" style={{ direction: 'ltr', textAlign: 'center' }}>
                                            {`V${v.VersionNumber}`}
                                            {isActive && <Chip size="small" label={t('DataSources.activeVersion')} style={{ marginInlineStart: 6, background: '#e6f4ec', color: '#067647' }} />}
                                        </TableCell>
                                        <TableCell align="center">{t(`DataSources.statuses.${v.Status}`)}</TableCell>
                                        <TableCell align="center" style={{ direction: 'ltr', textAlign: 'center' }}>{v.TotalRows !== null && v.TotalRows !== undefined ? v.TotalRows.toLocaleString() : '—'}</TableCell>
                                        <TableCell align="center" style={{ direction: 'ltr', textAlign: 'center' }}>{`✉ ${(v.ResolvedRowsEmail || 0).toLocaleString()} · ☎ ${(v.ResolvedRowsCell || 0).toLocaleString()}`}</TableCell>
                                        <TableCell align="center">{`${v.UploadedBy || ''} · ${moment(v.CreatedDate).format(DateFormats.DATE_TIME_24)}`}</TableCell>
                                        <TableCell align="center">
                                            {!purged && v.Status === eDataSourceStatus.READY && (
                                                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                                    {canView && (
                                                        <Tooltip title={t('DataSources.versions.viewVersion')} PopperProps={{ style: { direction: isRtl ? 'rtl' : 'ltr' } }}>
                                                            <IconButton size="small" style={actionBtnStyle} aria-label={t('DataSources.versions.viewVersion')} onClick={() => onViewVersion(v.DataSourceVersionID)}><Visibility style={actionIconStyle} /></IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {canExport && (
                                                        <Tooltip title={t('DataSources.versions.exportVersion')} PopperProps={{ style: { direction: isRtl ? 'rtl' : 'ltr' } }}>
                                                            <IconButton size="small" style={actionBtnStyle} aria-label={t('DataSources.versions.exportVersion')} onClick={() => onExportVersion(v.DataSourceVersionID, v.TotalRows ?? 0)}><GetApp style={actionIconStyle} /></IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {/* Active version only. Neither handler wired to onShowSummary reads the
                                                        version it is handed — DataSourceView.tsx:222 declares `v` and never uses
                                                        it, DataSources.tsx:556 discards it and opens by DataSourceID — and both
                                                        render from the ACTIVE version's columns (DataSourceView.tsx:80 is
                                                        `current?.columns`, and DataSources_Get RS2 scopes those to
                                                        @ActiveVersionID). So on a non-active row this button silently showed the
                                                        active version's mappings under a different version's number. This panel
                                                        names which recipient fields an upload overwrote, and that write has no
                                                        undo — attributing it to the wrong version is the one wrong answer this
                                                        dialog must not give, and it gives it silently rather than as an error.
                                                        Gated rather than deleted because on the active row the answer IS correct.
                                                        To restore it per-version, fetch that version via DataSources_GetRows
                                                        (@prm_VersionID — its RS1 already carries ClientFieldTarget) instead of
                                                        reusing `current`. */}
                                                    {isActive && (
                                                        <Tooltip title={t('DataSources.versions.summary')} PopperProps={{ style: { direction: isRtl ? 'rtl' : 'ltr' } }}>
                                                            <IconButton size="small" style={actionBtnStyle} aria-label={t('DataSources.versions.summary')} onClick={() => onShowSummary(v)}><Assessment style={actionIconStyle} /></IconButton>
                                                        </Tooltip>
                                                    )}
                                                </Box>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('common.close')}</Button>
            </DialogActions>
        </Dialog>
    );
};

export default VersionsHistoryDialog;
