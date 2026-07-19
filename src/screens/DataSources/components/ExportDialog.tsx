import { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, RadioGroup, Radio,
    FormControlLabel, TextField, Link
} from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import useRedirect from '../../../helpers/Routes/Redirect';
import { sitePrefix } from '../../../config';
import { ERROR_TYPE } from '../../../helpers/Types/common';
import { exportDataSource } from '../../../redux/reducers/dataSourcesSlice';

interface ExportDialogProps {
    classes: { [key: string]: string };
    open: boolean;
    dataSource: { ID: number; Name: string } | null;
    versionId: number | null;
    totalRows: number;
    onClose: () => void;
    setToastMessage: (msg: ERROR_TYPE) => void;
}

const CSV_ONLY_THRESHOLD = 100000;

const ExportDialog = ({ classes, open, dataSource, versionId, totalRows, onClose, setToastMessage }: ExportDialogProps) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const Redirect = useRedirect();
    const csvOnly = totalRows > CSV_ONLY_THRESHOLD;
    const [fileType, setFileType] = useState<'csv' | 'xlsx'>('csv');
    const [notifyEmail, setNotifyEmail] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [readyMessage, setReadyMessage] = useState('');

    useEffect(() => {
        if (open) {
            setFileType('csv'); setNotifyEmail(''); setBusy(false); setError(''); setReadyMessage('');
        }
    }, [open]);

    const handleExport = async () => {
        if (!dataSource) return;
        setError(''); setReadyMessage(''); setBusy(true);
        const res: any = await dispatch(exportDataSource({
            DataSourceID: dataSource.ID,
            VersionID: versionId,
            FileType: csvOnly ? 'csv' : fileType,
            NotifyEmail: notifyEmail || undefined
        }));
        setBusy(false);
        const payload = res?.payload;
        const code = payload?.StatusCode;
        if (code === 201) {
            setToastMessage({ severity: 'success', color: 'success', message: 'DataSources.export.ready', showAnimtionCheck: true } as ERROR_TYPE);
            setReadyMessage(t('DataSources.export.ready'));
            return;
        }
        if (code === 202) {
            setToastMessage({ severity: 'success', color: 'success', message: 'DataSources.toasts.exportStarted', showAnimtionCheck: true } as ERROR_TYPE);
            setReadyMessage(t('DataSources.export.runningInBackground'));
            return;
        }
        if (code === 405 && payload?.Message === 'CSV_ONLY') { setError(t('DataSources.export.csvOnly')); return; }
        setError(t('DataSources.errors.generalError'));
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" dir="rtl">
            <DialogTitle>{t('DataSources.export.title')}</DialogTitle>
            <DialogContent>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <Box>
                        <Typography style={{ fontWeight: 600 }}>{t('DataSources.export.format')}</Typography>
                        <RadioGroup row value={csvOnly ? 'csv' : fileType} onChange={(e) => setFileType(e.target.value as 'csv' | 'xlsx')}>
                            <FormControlLabel value="csv" control={<Radio />} label="CSV" />
                            <FormControlLabel value="xlsx" control={<Radio />} label="Excel" disabled={csvOnly} />
                        </RadioGroup>
                        {csvOnly && <Typography style={{ fontSize: 12, color: '#b54708' }}>{t('DataSources.export.csvOnly')}</Typography>}
                    </Box>
                    <TextField
                        label={t('DataSources.export.notifyEmail')}
                        value={notifyEmail}
                        onChange={(e) => setNotifyEmail(e.target.value)}
                        type="email"
                        fullWidth
                    />
                    {readyMessage && (
                        <Box>
                            <Typography style={{ color: '#067647' }}>{readyMessage}</Typography>
                            <Link component="button" onClick={() => Redirect({ url: `${sitePrefix}Groups/Download` })}>
                                {t('DataSources.export.goToDownloads')}
                            </Link>
                        </Box>
                    )}
                    {error && <Typography style={{ color: '#B42318', fontSize: 13 }}>{error}</Typography>}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={busy}>{t('common.close')}</Button>
                <Button color="primary" variant="contained" onClick={handleExport} disabled={busy || !!readyMessage}>
                    {t('DataSources.actions.export')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ExportDialog;
