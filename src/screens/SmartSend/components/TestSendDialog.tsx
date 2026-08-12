import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, Box, Typography, Button, TextField, IconButton, CircularProgress, MenuItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Close } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { getPreviewSampleInfo, sendPreview } from '../../../redux/reducers/smartSendSlice';
import InlineBanner from './InlineBanner';

// §13 step 8 · test send. Same button, same position — NEW behaviour as of the
// SmartSendPreview contract (§4.1), replacing PO decision #5.
//
// What it used to do: dispatch /CampaignEditor/TestSend, which clones the campaign
// (NewsletterLogic.cs:1536). dbo.CloneEmailCampaignAsTest copies 7 child tables and NEITHER
// mapping table, so the clone reaches the sender unmapped, `if (!map.IsMapped) return data;`
// (DBProxyStandard.cs:2121-2122) short-circuits, and the tester receives literal ##tokens##.
// That is what the old `DataSources.send.testSendWarn` banner warned about.
//
// What it does now: PUT DataSourcesSender/PreviewSend — ONE email to the address below,
// carrying up to 5 REAL agents sampled from the campaign's LOCKED data-source version, each
// with resolved values and a link that renders the campaign through the SAME renderer the
// live send uses. So the raw-token caveat is no longer true and the banner is replaced,
// not merely reworded.
//
// The sample is deterministic by design (ORDER BY CHECKSUM(@Seed, RowID), never NEWID()):
// same seed + same offset ⇒ same agents. That is what makes the fix-the-sheet-and-recheck
// loop possible, so the seed is shown read-only and the offset is walked, never randomised.

const useStyles = makeStyles((theme) => ({
    head: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing(2, 3), borderBottom: '1px solid #e0e0e0' },
    body: { padding: theme.spacing(3) },
    foot: { display: 'flex', gap: theme.spacing(1.5), padding: theme.spacing(2, 3), borderTop: '1px solid #e0e0e0' },
    // Sample row: size + seed + the offset walkers on one line, wrapping on narrow viewports.
    sampleRow: { display: 'flex', gap: theme.spacing(1.5), alignItems: 'flex-start', flexWrap: 'wrap', marginTop: theme.spacing(1) },
    walk: { display: 'flex', gap: theme.spacing(1), alignItems: 'center', marginTop: theme.spacing(1) },
}));

// The destination lands in dbo.DirectApi_SendEmail.@ToEmail, which is NVARCHAR(50). A longer
// address is REFUSED (422), never truncated — a truncated address bounces and the bounce puts
// the mangled string in the blacklist. Enforced here for the message and server-side for real.
const MAX_TO_EMAIL = 50;
const MAX_SAMPLE_SIZE = 5;

// Failure copy is keyed on the STATUS CODE, never on the server's `Message`.
//
// Every Message the two preview actions can produce is a machine code, not a sentence:
// DataSourcesSenderController.cs — 401 "INVALID_API_KEY" (:64), 927 "DATA_SOURCES" (:74),
// 405 ResponsesText.USER_PERMISSION_NOT_ALLOWED (:730/:815), 400 "DATA_INCORRECT"
// (:737/:822), 400 "CHANNEL_NOT_SUPPORTED" (MapReturnCode(-99), :116), 404 "NOT_FOUND"
// (:751/:763/:844), 422 "INVALID_TO_EMAIL" (:836 and SmartSendPreviewLogic.cs:253),
// 500 "internalerror" (:773/:870); plus the codes PreviewSend returns VERBATIM from the SP
// (:863-864, documented at SmartSendPreviewLogic.cs:71-72) — 406 zero candidates,
// 413 composed body over budget, 404/422/500 again. Showing "internalerror" or
// "ResponsesText.USER_PERMISSION_NOT_ALLOWED" to a marketer is not an error message.
//
// Codes are the stable contract; the strings are internal identifiers that are re-worded and
// re-used across controllers without notice. Anything not listed here falls back to the
// generic `sentFail` — never to r.Message.
const PREVIEW_ERROR_KEYS: { [statusCode: number]: string } = {
    400: 'DataSources.preview.errors.badRequest',
    401: 'DataSources.preview.errors.session',
    404: 'DataSources.preview.errors.notFound',
    405: 'DataSources.preview.errors.noPermission',
    406: 'DataSources.preview.errors.noCandidates',
    413: 'DataSources.preview.errors.tooLarge',
    422: 'DataSources.preview.errors.invalidEmail',
    500: 'DataSources.preview.errors.serverError',
    927: 'DataSources.preview.errors.featureOff',
};

const TestSendDialog: React.FC<{ open: boolean; campaignId: number; onClose: () => void; onToast: (r: { ok: boolean; msg: string }) => void; dirty?: boolean; onSaveMapping?: () => Promise<{ ok: boolean }> }> =
    ({ open, campaignId, onClose, onToast, dirty, onSaveMapping }) => {
        const dispatch = useDispatch();
        const { t } = useTranslation();
        const classes = useStyles();
        const isRTL = useSelector((s: any) => s.core && s.core.isRTL);
        // The sub-user's own login address (coreSlice.js:121) is the logged-in USER; core.email is
        // the ACCOUNT address and is the fallback for an account without a sub-user token.
        const userEmail = useSelector((s: any) =>
            (s.core && s.core.subUserObject && s.core.subUserObject.Data && s.core.subUserObject.Data.Emails
                && s.core.subUserObject.Data.Emails[0] && s.core.subUserObject.Data.Emails[0].AuthValue)
            || (s.core && s.core.email) || '');
        const channel = useSelector((s: any) => s.smartSend && s.smartSend.selectedChannel);
        const [toEmail, setToEmail] = useState('');
        const [sampleSize, setSampleSize] = useState(MAX_SAMPLE_SIZE);
        const [offset, setOffset] = useState(0);
        const [seed, setSeed] = useState(0);
        const [sending, setSending] = useState(false);
        const [savingMapping, setSavingMapping] = useState(false);
        const [info, setInfo] = useState<{ status: 'idle' | 'loading' | 'ok' | 'failed'; count: number }>({ status: 'idle', count: 0 });

        // Runs on every OPEN, not once per mount. SmartSendScreen.tsx:627 renders this component
        // unconditionally and only flips `open`, so it never unmounts — a mount-time seed would
        // freeze one sample for the whole screen session and "close, reopen, get another five"
        // would silently return the same agents.
        useEffect(() => {
            if (!open) return undefined;
            // SQL `int`, and CHECKSUM(@Seed, RowID) treats 0 as a legitimate seed — 1..2^31-2 keeps
            // it inside int and away from the SP's `@prm_Seed int = 0` default so a seed is always
            // visibly a real one.
            setSeed(Math.floor(Math.random() * 2147483646) + 1);
            setOffset(0);
            setToEmail(userEmail || '');
            setInfo({ status: 'loading', count: 0 });
            let cancelled = false;
            (async () => {
                const res: any = await dispatch(getPreviewSampleInfo({ campaignId, channel }));
                if (cancelled) return;
                const p = res && res.payload ? res.payload : {};
                if (p.StatusCode === 200 && p.Data) setInfo({ status: 'ok', count: p.Data.CandidateCount ?? 0 });
                else setInfo({ status: 'failed', count: 0 });
            })();
            return () => { cancelled = true; };
        }, [open, campaignId, channel, userEmail, dispatch]);

        if (!open) return null;

        // item 4: this dialog NEVER auto-saves — a save attaches the source's recipients to the
        // campaign, the exact mutation a "test" must not cause. When the mapping has unsaved
        // changes we OFFER a save inline (below); the preview proceeds either way. Unlike the old
        // clone-based test, the preview DOES read the saved mapping, so an unsaved change is not
        // reflected in the mail — which is precisely why the prompt is worth keeping.
        const doSaveMapping = async () => {
            if (!onSaveMapping) return;
            setSavingMapping(true);
            await onSaveMapping();
            setSavingMapping(false);
        };

        // Unmapped code ⇒ the generic string, never the raw Message. A code we have not seen
        // before is by definition one we have no vetted wording for, and "internalerror" in a
        // toast is worse than "שליחת הבדיקה נכשלה": it looks like the product broke, and it tells
        // the operator nothing they can act on. The real cause is already in Log.Insert.
        const previewErrorMsg = (statusCode: number): string => {
            const key = PREVIEW_ERROR_KEYS[statusCode];
            return key ? t(key) : t('DataSources.preview.sentFail');
        };

        const trimmedEmail = toEmail.trim();
        const emailTooLong = trimmedEmail.length > MAX_TO_EMAIL;
        // How many agents this offset can actually yield — the last page is short, and claiming
        // "5 out of 12" while standing at offset 10 would be a lie the mail then contradicts.
        const shownInSample = info.status === 'ok'
            ? Math.max(0, Math.min(sampleSize, info.count - offset))
            : sampleSize;
        const canPrev = offset > 0;
        const canNext = info.status === 'ok' && offset + sampleSize < info.count;

        const doSend = async () => {
            setSending(true);
            const res: any = await dispatch(sendPreview({
                campaignId, channel, toEmail: trimmedEmail, sampleSize, seed, offset
            }));
            setSending(false);
            const r = res && res.payload ? res.payload : {};
            // 201 ONLY. The previous implementation accepted `200 || 201`, and 200 is exactly what
            // the shared test-send path returns when the send FAILED (NewsletterLogic.cs:479/:589) —
            // a failed test looked sent. The new endpoint returns 201 for "queued" and nothing else.
            const ok = r.StatusCode === 201;
            onToast({
                ok,
                // The server still explains WHY it refused (no candidates / body over budget /
                // bad address) — but through its StatusCode, translated here. r.Message is a
                // machine code and is never rendered; see PREVIEW_ERROR_KEYS above.
                msg: ok ? t('DataSources.preview.sentOk') : previewErrorMsg(r.StatusCode)
            });
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
                    <Typography variant="h6">{t('DataSources.preview.title')}</Typography>
                    <IconButton size="small" onClick={onClose} aria-label={t('DataSources.send.close')}><Close /></IconButton>
                </Box>
                <Box className={classes.body}>
                    {/* severity="info", not "warning": this is no longer a caveat about degraded
                        output, it is a description of what the mail contains. */}
                    <InlineBanner severity="info" size="lg" title={t('DataSources.preview.banner.title')} body={t('DataSources.preview.banner.body')} />
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
                        type="email"
                        label={t('DataSources.preview.toLabel')}
                        value={toEmail}
                        onChange={(e) => setToEmail(e.target.value)}
                        inputProps={{ maxLength: MAX_TO_EMAIL }}
                        error={emailTooLong}
                        helperText={emailTooLong ? t('DataSources.preview.toTooLong') : t('DataSources.preview.toHelper')}
                    />

                    <Box className={classes.sampleRow}>
                        <TextField
                            select variant="outlined" size="small" style={{ minWidth: 160 }}
                            label={t('DataSources.preview.sampleSizeLabel')}
                            value={sampleSize}
                            // Changing the size restarts the walk: keeping a stale offset would page
                            // past the end (or straddle a previous page) with no visible cause.
                            onChange={(e) => { setSampleSize(Number(e.target.value)); setOffset(0); }}
                        >
                            {[1, 2, 3, 4, 5].map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                        </TextField>
                        <TextField
                            variant="outlined" size="small" style={{ minWidth: 180 }}
                            label={t('DataSources.preview.seedLabel')}
                            value={seed}
                            InputProps={{ readOnly: true }}
                            helperText={t('DataSources.preview.seedHelper')}
                        />
                    </Box>

                    <Box className={classes.walk}>
                        <Button size="small" variant="outlined" disabled={!canPrev || sending}
                            aria-label={t('DataSources.preview.prevAria')}
                            onClick={() => setOffset((o) => Math.max(0, o - sampleSize))}>
                            {t('DataSources.preview.prev')}
                        </Button>
                        <Button size="small" variant="outlined" disabled={!canNext || sending}
                            aria-label={t('DataSources.preview.nextAria')}
                            onClick={() => setOffset((o) => o + sampleSize)}>
                            {t('DataSources.preview.next')}
                        </Button>
                        <Typography variant="body2" color="textSecondary">
                            {info.status === 'loading' && t('DataSources.preview.countLoading')}
                            {info.status === 'failed' && t('DataSources.preview.countError')}
                            {info.status === 'ok' && t('DataSources.preview.countLabel', { n: shownInSample, total: info.count })}
                        </Typography>
                    </Box>
                </Box>
                <Box className={classes.foot}>
                    <Button variant="contained" color="primary" disabled={sending || !trimmedEmail || emailTooLong} onClick={doSend}>
                        {sending ? <CircularProgress size={18} color="inherit" /> : t('DataSources.send.actions.testSend')}
                    </Button>
                    <Button onClick={onClose} disabled={sending}>{t('DataSources.send.cancel')}</Button>
                </Box>
            </Dialog>
        );
    };

export default TestSendDialog;
