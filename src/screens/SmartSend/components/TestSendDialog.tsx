import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, Box, Typography, Button, TextField, IconButton, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Close } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { testSendWrapped } from '../../../redux/reducers/smartSendSlice';
import InlineBanner from './InlineBanner';

// §13 step 8 · test send. PO decision #5: TestSend clones the campaign WITHOUT the mapping,
// so source tokens render RAW (##field##) in the test email — show the explicit warning
// BEFORE sending (v1 conscious waiver, no sample-values path). Request shape mirrors the
// legacy TestSend.js: { Language, CampaignID, Emails (≤5, comma-joined), GroupIds }.

const useStyles = makeStyles((theme) => ({
    head: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing(2, 3), borderBottom: '1px solid #e0e0e0' },
    body: { padding: theme.spacing(3) },
    foot: { display: 'flex', gap: theme.spacing(1.5), padding: theme.spacing(2, 3), borderTop: '1px solid #e0e0e0' },
}));

const TestSendDialog: React.FC<{ open: boolean; campaignId: number; onClose: () => void; onToast: (r: { ok: boolean; msg: string }) => void }> =
    ({ open, campaignId, onClose, onToast }) => {
        const dispatch = useDispatch();
        const { t } = useTranslation();
        const classes = useStyles();
        const language = useSelector((s: any) => s.core && s.core.language);
        const [emails, setEmails] = useState('');
        const [sending, setSending] = useState(false);

        if (!open) return null;

        const doTest = async () => {
            setSending(true);
            const list = emails.split(',').map((e) => e.trim()).filter(Boolean).slice(0, 5).join(', ');
            const res: any = await dispatch(testSendWrapped({ Language: language || 'he', CampaignID: campaignId, Emails: list, GroupIds: '' }));
            setSending(false);
            const r = res && res.payload ? res.payload : {};
            const ok = r.StatusCode === 200 || r.StatusCode === 201;
            onToast({ ok, msg: ok ? t('DataSources.send.testSend.sentOk') : t('DataSources.send.testSend.sentFail') });
            onClose();
        };

        return (
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <Box className={classes.head}>
                    <Typography variant="h6">{t('DataSources.send.actions.testSend')}</Typography>
                    <IconButton size="small" onClick={onClose} aria-label={t('DataSources.send.close')}><Close /></IconButton>
                </Box>
                <Box className={classes.body}>
                    <InlineBanner severity="warning" role="alert" title={t('DataSources.send.testSend.title')} body={t('DataSources.send.testSendWarn')} />
                    <TextField
                        fullWidth variant="outlined" size="small" style={{ marginTop: 8 }}
                        label={t('DataSources.send.testSend.emailsLabel')}
                        placeholder={t('DataSources.send.testSend.emailsPlaceholder')}
                        value={emails}
                        onChange={(e) => setEmails(e.target.value)}
                    />
                </Box>
                <Box className={classes.foot}>
                    <Button variant="contained" color="primary" disabled={sending || !emails.trim()} onClick={doTest}>
                        {sending ? <CircularProgress size={18} color="inherit" /> : t('DataSources.send.actions.testSend')}
                    </Button>
                    <Button onClick={onClose} disabled={sending}>{t('DataSources.send.cancel')}</Button>
                </Box>
            </Dialog>
        );
    };

export default TestSendDialog;
