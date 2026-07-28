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

const TestSendDialog: React.FC<{ open: boolean; campaignId: number; onClose: () => void; onToast: (r: { ok: boolean; msg: string }) => void; dirty?: boolean; onSaveMapping?: () => Promise<{ ok: boolean }> }> =
    ({ open, campaignId, onClose, onToast, dirty, onSaveMapping }) => {
        const dispatch = useDispatch();
        const { t } = useTranslation();
        const classes = useStyles();
        const isRTL = useSelector((s: any) => s.core && s.core.isRTL);
        const [emails, setEmails] = useState('');
        const [sending, setSending] = useState(false);
        const [savingMapping, setSavingMapping] = useState(false);

        if (!open) return null;

        // item 4: TestSend NEVER auto-saves — a save attaches the source's recipients to the
        // campaign, the exact mutation a "test" must not cause. When the mapping has unsaved
        // changes we OFFER a save inline (below); the test proceeds either way, and the test
        // email is bit-identical because the clone carries no mapping (see the warning banner).
        const doSaveMapping = async () => {
            if (!onSaveMapping) return;
            setSavingMapping(true);
            await onSaveMapping();
            setSavingMapping(false);
        };

        const doTest = async () => {
            setSending(true);
            const list = emails.split(',').map((e) => e.trim()).filter(Boolean).slice(0, 5).join(', ');
            // Server picks the Hebrew subject with `campaignRequest.Language.ToLower() == "he-il"` (NewsletterLogic.cs:521) — a bare 'he' fails it, so send the full culture code exactly like legacy TestSend.js:75.
            const res: any = await dispatch(testSendWrapped({ Language: `${isRTL ? 'he-IL' : 'en-US'}`, CampaignID: campaignId, Emails: list, GroupIds: '' }));
            setSending(false);
            const r = res && res.payload ? res.payload : {};
            const ok = r.StatusCode === 200 || r.StatusCode === 201;
            onToast({ ok, msg: ok ? t('DataSources.send.testSend.sentOk') : t('DataSources.send.testSend.sentFail') });
            onClose();
        };

        return (
            // `dir` is MANDATORY on every Dialog in this app and is NOT inherited.
            // App.js:727-730 sets <html dir> inside a useEffect with an EMPTY dependency array,
            // reading i18n.language at mount — but i18n.js:20 initialises `lng: 'en'` and the real
            // language is only applied later at App.js:806, so <html dir="ltr"> is permanent even
            // for Hebrew users. The app looks RTL only because of the in-app wrapper
            // <div dir={isRTL...}> at App.js:1018, and MUI v4 <Dialog> portals into document.body
            // — OUTSIDE that wrapper. jss-rtl mirrors physical CSS properties but never sets the
            // `direction` property, so it cannot compensate: the header's space-between put the
            // title left and the ✕ right, and the banner's text-align:start resolved to left.
            // Every sibling DataSources dialog already carries this attribute (ExportDialog.tsx:71,
            // EditColumnDialog.tsx:87, UploadWizardDialog.tsx:555, DataSources.tsx:439/448).
            // Reactive, not hardcoded "rtl", so en/pl accounts still render LTR.
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth dir={isRTL ? 'rtl' : 'ltr'}>
                <Box className={classes.head}>
                    <Typography variant="h6">{t('DataSources.send.actions.testSend')}</Typography>
                    <IconButton size="small" onClick={onClose} aria-label={t('DataSources.send.close')}><Close /></IconButton>
                </Box>
                <Box className={classes.body}>
                    <InlineBanner severity="warning" role="alert" size="lg" title={t('DataSources.send.testSend.title')} body={t('DataSources.send.testSendWarn')} />
                    {dirty && (
                        <InlineBanner
                            severity="info"
                            size="lg"
                            title={t('DataSources.send.testSavePrompt.title')}
                            body={t('DataSources.send.testSavePrompt.body')}
                            action={(
                                <Button size="small" variant="outlined" color="primary" disabled={savingMapping} onClick={doSaveMapping}>
                                    {savingMapping ? <CircularProgress size={16} color="inherit" /> : t('DataSources.send.actions.saveMapping')}
                                </Button>
                            )}
                        />
                    )}
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
