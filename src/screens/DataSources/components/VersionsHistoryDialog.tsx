import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Table, TableBody, TableCell, TableHead,
    TableRow, Chip, Tooltip, IconButton, Box
} from '@material-ui/core';
import { Visibility, GetApp, Assessment } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { DataSourceVersion, eDataSourceStatus } from '../../../Models/DataSources/DataSource';
import { DateFormats } from '../../../helpers/Constants';

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
    const { t } = useTranslation();

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" dir="rtl">
            <DialogTitle>{t('DataSources.versions.title')}</DialogTitle>
            <DialogContent>
                <Box style={{ overflowX: 'auto' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>{t('DataSources.table.version')}</TableCell>
                                <TableCell>{t('DataSources.table.status')}</TableCell>
                                <TableCell align="center">{t('DataSources.table.rows')}</TableCell>
                                <TableCell>{t('DataSources.summary.resolvedRows')}</TableCell>
                                <TableCell>{t('common.createdDate')}</TableCell>
                                <TableCell align="center">{t('DataSources.table.actions')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(versions || []).map(v => {
                                const isActive = v.DataSourceVersionID === activeVersionId;
                                const purged = !!v.PurgedDate;
                                return (
                                    <TableRow key={v.DataSourceVersionID}>
                                        <TableCell style={{ direction: 'ltr' }}>
                                            {`V${v.VersionNumber}`}
                                            {isActive && <Chip size="small" label={t('DataSources.activeVersion')} style={{ marginInlineStart: 6, background: '#e6f4ec', color: '#067647' }} />}
                                        </TableCell>
                                        <TableCell>{t(`DataSources.statuses.${v.Status}`)}</TableCell>
                                        <TableCell align="center" style={{ direction: 'ltr' }}>{v.TotalRows !== null && v.TotalRows !== undefined ? v.TotalRows.toLocaleString() : '—'}</TableCell>
                                        <TableCell style={{ direction: 'ltr' }}>{`✉ ${(v.ResolvedRowsEmail || 0).toLocaleString()} · ☎ ${(v.ResolvedRowsCell || 0).toLocaleString()}`}</TableCell>
                                        <TableCell>{`${v.UploadedBy || ''} · ${moment(v.CreatedDate).format(DateFormats.DATE_TIME_24)}`}</TableCell>
                                        <TableCell align="center">
                                            {!purged && v.Status === eDataSourceStatus.READY && (
                                                <>
                                                    {canView && (
                                                        <Tooltip title={t('DataSources.versions.viewVersion')}>
                                                            <IconButton size="small" aria-label={t('DataSources.versions.viewVersion')} onClick={() => onViewVersion(v.DataSourceVersionID)}><Visibility fontSize="small" /></IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {canExport && (
                                                        <Tooltip title={t('DataSources.versions.exportVersion')}>
                                                            <IconButton size="small" aria-label={t('DataSources.versions.exportVersion')} onClick={() => onExportVersion(v.DataSourceVersionID, v.TotalRows ?? 0)}><GetApp fontSize="small" /></IconButton>
                                                        </Tooltip>
                                                    )}
                                                    <Tooltip title={t('DataSources.versions.summary')}>
                                                        <IconButton size="small" aria-label={t('DataSources.versions.summary')} onClick={() => onShowSummary(v)}><Assessment fontSize="small" /></IconButton>
                                                    </Tooltip>
                                                </>
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
