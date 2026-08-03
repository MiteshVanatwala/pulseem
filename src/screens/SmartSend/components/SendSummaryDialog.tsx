import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, Box, Typography, Button, Checkbox, FormControlLabel, CircularProgress, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Close } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { sendSmart } from '../../../redux/reducers/smartSendSlice';
import { eSendChannel } from '../../../Models/DataSources/SmartSend';
import SmartSendPreview from './SmartSendPreview';
import InlineBanner from './InlineBanner';

// §11.4/§13 step 8-9 · the send-summary + confirm dialog. SmartSend-OWNED (the legacy
// SummaryDialog is tightly coupled to non-exported Newsletter-wizard styles + un-mockable
// thunks — see the PO deviation note). It reads the hydrated newsletterSendSummary (from
// getSendSummaryWrapped), embeds the token-replaced SmartSendPreview, exposes the supervisor
// checkbox when HasSupervisors, and routes the send EXCLUSIVELY through sendSmart (never the
// legacy email/SendCampaign endpoint — B5). Every pipeline code (201/423/451/550/551/402/
// 405/422) is surfaced as a result state.

const RESULTS: { [code: number]: { sev: 'error' | 'warning'; key: string } } = {
    423: { sev: 'error', key: 'problematicLinks' },
    451: { sev: 'error', key: 'domainNotVerified' },
    550: { sev: 'warning', key: 'pendingApproval' },
    551: { sev: 'warning', key: 'underReview' },
    402: { sev: 'error', key: 'noCredit' },
    405: { sev: 'error', key: 'sendBlocked' },
    422: { sev: 'error', key: 'bodyEmpty' },
};

const useStyles = makeStyles((theme) => ({
    // head/foot fixed, body takes the rest: the dialog now has an explicit 90vh
    // height (see the Dialog below) so the preview can fill the column instead of
    // being pinned to 300px and scrolling. Same flex chain as the standalone
    // preview dialog in SmartSendScreen, kept identical on purpose.
    head: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing(2, 3), borderBottom: '1px solid #e0e0e0', flex: '0 0 auto' },
    body: { padding: theme.spacing(3), flex: '1 1 auto', minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' },
    foot: { display: 'flex', gap: theme.spacing(1.5), padding: theme.spacing(2, 3), borderTop: '1px solid #e0e0e0', flex: '0 0 auto' },
    // flex:1 + minHeight:0 rather than height:100% — the combined banner and the
    // supervisor checkbox are siblings, and height:100% would push them past the body.
    grid: { display: 'flex', flexWrap: 'wrap', gap: theme.spacing(3), flex: 1, minHeight: 0 },
    col: { flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', minHeight: 0 },
    line: { display: 'flex', justifyContent: 'space-between', padding: theme.spacing(0.75, 0), borderBottom: '1px dashed #eee' },
    line_b: { fontWeight: 600, color: '#42526b' },
    // Not a warning colour: this is the final-recipient count on a healthy send.
    // It used to inherit palette.primary.main (#FF1744), which read as an error.
    // #2e7d32 is the established success green used elsewhere in this feature.
    big: { fontSize: 22, fontWeight: 700, color: '#2e7d32' },
    muted: { color: theme.palette.text.secondary },
}));

const SendSummaryDialog: React.FC<{ open: boolean; campaignId: number; onClose: () => void; onSent?: () => void; beforeSend?: () => Promise<boolean> }> =
    ({ open, campaignId, onClose, onSent, beforeSend }) => {
        const dispatch = useDispatch();
        const { t } = useTranslation();
        const classes = useStyles();
        // Dialogs portal outside App.js:1018's <div dir=...>, and <html dir> is stuck at "ltr"
        // (App.js:727-730 runs once at mount, when i18n.language is still the 'en' default set at
        // i18n.js:20). Without an explicit dir every dialog in this feature renders LTR.
        const isRTL = useSelector((s: any) => s.core && s.core.isRTL);
        const summary = useSelector((s: any) => s.newsletter && s.newsletter.newsletterSendSummary);
        const channel = useSelector((s: any) => s.smartSend.selectedChannel) as eSendChannel;
        const [sendToSupervisor, setSendToSupervisor] = useState(false);
        const [phase, setPhase] = useState<'summary' | 'sending' | 'result'>('summary');
        const [result, setResult] = useState<any>(null);

        // The dialog stays mounted (open toggled by the parent), so reset to a clean
        // summary view on every open — otherwise a prior send's result banner persists and
        // blocks re-viewing the summary / retrying after a fixable pipeline error.
        useEffect(() => {
            if (open) { setPhase('summary'); setResult(null); setSendToSupervisor(false); }
        }, [open]);

        if (!open) return null;
        const sum = summary || {};
        const isCombined = typeof sum.Groups === 'string' && sum.Groups.split(',').length > 1;

        const doSend = async () => {
            setPhase('sending');
            // item 2: attach the synthetic group to the campaign's real GroupIds ONLY here, at a
            // confirmed send — never when merely opening this dialog (that pre-confirmation attach
            // was the silent production mutation). If the attach fails the parent has shown a
            // toast, so drop back to the summary rather than send against an unwired campaign.
            if (beforeSend) {
                const attached = await beforeSend();
                if (!attached) { setPhase('summary'); return; }
            }
            const res: any = await dispatch(sendSmart({ campaignId, sendToSupervisor, channel }));
            const r = res && res.payload ? res.payload : { StatusCode: 500 };
            setResult(r);
            setPhase('result');
            if (r.StatusCode === 200 || r.StatusCode === 201) { if (onSent) onSent(); }
        };

        const line = (label: string, value: any, muted?: boolean) => (
            <Box className={classes.line}>
                <span className={muted ? classes.muted : classes.line_b}>{label}</span>
                <span className={muted ? classes.muted : ''}>{value}</span>
            </Box>
        );

        const renderResult = () => {
            const code = result ? result.StatusCode : 0;
            if (code === 200 || code === 201) {
                return <InlineBanner severity="info" size="lg" title={t('DataSources.send.result.success')} body={t('DataSources.send.result.successDesc')} />;
            }
            const meta = RESULTS[code];
            const key = meta ? meta.key : 'genericError';
            const body = code === 423 && Array.isArray(result.Data)
                ? result.Data.join('  ·  ')
                : t('DataSources.send.result.' + key);
            return <InlineBanner severity={meta ? meta.sev : 'error'} role="alert" size="lg" title={t('DataSources.send.result.' + key)} body={body} />;
        };

        return (
            <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth dir={isRTL ? 'rtl' : 'ltr'}
                PaperProps={{ style: { height: '90vh' } }}>
                <Box className={classes.head}>
                    <Typography variant="h6">{t('DataSources.send.summary.title')}</Typography>
                    <IconButton size="small" onClick={onClose} aria-label={t('DataSources.send.close')}><Close /></IconButton>
                </Box>
                <Box className={classes.body}>
                    {phase === 'result' ? renderResult() : (
                        <>
                            <Box className={classes.grid}>
                                <Box className={classes.col}>
                                    {/* Campaign name first: this dialog is the last step before a real
                                        send, and until now nothing on the smart-send path named the
                                        campaign. The header label on the mapping screen cannot serve
                                        this — the summary it reads is only fetched when this dialog
                                        opens, by which point the dialog covers the header. */}
                                    {sum.CampaignName ? line(t('DataSources.send.campaignLabel', { name: sum.CampaignName }), '') : null}
                                    {line(t('DataSources.send.summary.recipients'), <span className={classes.big}>{(sum.FinalClients ?? 0).toLocaleString()}</span>)}
                                    {line(t('DataSources.send.summary.from'), sum.FromEmail || '')}
                                    {line(t('DataSources.send.summary.replyTo'), sum.ReplyTo || '')}
                                    {line(t('DataSources.send.summary.subject'), sum.Subject || '')}
                                    {line(t('DataSources.send.summary.groups'), sum.Groups || '')}
                                    {line(t('DataSources.send.summary.totalInSource'), (sum.TotalClients ?? 0).toLocaleString())}
                                    {line(t('DataSources.send.summary.noEmail'), sum.NoEmailClients ?? 0, true)}
                                    {line(t('DataSources.send.summary.duplicates'), sum.DuplicateClients ?? 0, true)}
                                    {line(t('DataSources.send.summary.removed'), sum.RemovedClients ?? 0, true)}
                                </Box>
                                <Box className={classes.col}>
                                    <Typography variant="subtitle2" style={{ marginBottom: 6, fontWeight: 600, flex: '0 0 auto' }}>{t('DataSources.send.preview')}</Typography>
                                    <Box style={{ flex: '1 1 auto', minHeight: 0 }}>
                                        <SmartSendPreview campaignId={campaignId} height="100%" />
                                    </Box>
                                </Box>
                            </Box>
                            {isCombined && (
                                <Box style={{ marginTop: 16 }}>
                                    <InlineBanner severity="info" title={t('DataSources.send.summary.combinedTitle')} body={t('DataSources.send.summary.combinedNote')} />
                                </Box>
                            )}
                            {sum.HasSupervisors && (
                                <FormControlLabel style={{ marginTop: 8 }}
                                    control={<Checkbox color="primary" checked={sendToSupervisor} onChange={(e) => setSendToSupervisor(e.target.checked)} />}
                                    label={t('DataSources.send.summary.sendToSupervisor')} />
                            )}
                        </>
                    )}
                </Box>
                <Box className={classes.foot}>
                    {phase === 'result' ? (
                        <Button variant="contained" color="primary" onClick={onClose}>{t('DataSources.send.close')}</Button>
                    ) : (
                        <>
                            <Button variant="contained" color="primary" disabled={phase === 'sending'} onClick={doSend}>
                                {phase === 'sending' ? <CircularProgress size={18} color="inherit" /> : t('DataSources.send.actions.sendToAll')}
                            </Button>
                            <Button onClick={onClose} disabled={phase === 'sending'}>{t('DataSources.send.cancel')}</Button>
                        </>
                    )}
                </Box>
            </Dialog>
        );
    };

export default SendSummaryDialog;
