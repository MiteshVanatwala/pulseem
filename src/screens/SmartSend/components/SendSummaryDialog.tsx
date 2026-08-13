import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, Box, Typography, Button, Checkbox, FormControlLabel, CircularProgress, IconButton, Fade } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Close, Check, Warning, NewReleases } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { sendSmart, setBusinessColumn } from '../../../redux/reducers/smartSendSlice';
import { eSendChannel } from '../../../Models/DataSources/SmartSend';
import SmartSendPreview from './SmartSendPreview';
import InlineBanner from './InlineBanner';
// SUPERVISOR-PREDICATE-IMPORT: the SAME predicates the mapping screen's auto-pick uses, so the
// pre-send warning and the picker can never disagree about what a usable supervisor address is.
import { isEmailish, isNotIdentity } from '../businessColumnDefaults';

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

// RESULT-PHASE TONE. The ramps are InlineBanner.tsx:11-13 verbatim, so a result card and a banner
// elsewhere in this flow stay one family — but `success` exists only here. InlineBanner has no
// success severity, which is why the single most consequential positive outcome in the feature was
// dressed as severity="info" (blue #1a56db) until now. It is NOT added to InlineBanner: that file
// has 9 importers / 14 render sites across SmartSend AND SendSearch, plus a hand-copied colour twin
// at SmartSendScreen.tsx:566-567 that no compiler tracks. Same reasoning as the wrapper Box below.
// Success is a SOLID disc; warning/error are tinted with a ring. Five of the seven mapped codes are
// states to resolve (550 pending approval, 551 under review, 423/451/402 recoverable), and a solid
// red 64px disc escalates "queued for approval" into "catastrophe".
const TONE: { [k: string]: { bg: string; ring: string; glyph: string; Icon: any } } = {
    success: { bg: '#2e7d32', ring: 'none', glyph: '#ffffff', Icon: Check },
    warning: { bg: '#fff8e1', ring: '2px solid #ffe082', glyph: '#b7791f', Icon: NewReleases },
    error: { bg: '#fdecea', ring: '2px solid #f5c6cb', glyph: '#c0392b', Icon: Warning },
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
    // overflowY:auto is required, not cosmetic. `grid` is flex:1 + minHeight:0, so on a short
    // viewport it is squeezed below its content height; without a scroll container here the
    // summary rows overflow VISIBLY and paint over the combined-campaign banner and the
    // send-to-supervisor checkbox below — a control that changes who actually receives the send.
    col: { flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', minHeight: 0, overflowY: 'auto' },
    line: { display: 'flex', justifyContent: 'space-between', padding: theme.spacing(0.75, 0), borderBottom: '1px dashed #eee' },
    line_b: { fontWeight: 600, color: '#42526b' },
    // Not a warning colour: this is the final-recipient count on a healthy send.
    // It used to inherit palette.primary.main (#FF1744), which read as an error.
    // #2e7d32 is the established success green used elsewhere in this feature.
    big: { fontSize: 22, fontWeight: 700, color: '#2e7d32' },
    muted: { color: theme.palette.text.secondary },

    // ---- RESULT PHASE ----------------------------------------------------------------
    // NO physical direction in any rule below (no left/right/marginLeft/textAlign:'left').
    // makeStyles auto-flips under RTL (makeStyles.js sets flip: theme.direction === 'rtl', which
    // jss-rtl reads), and it would flip `direction: ltr` into `direction: rtl` — silently undoing
    // the isolation on Latin runs. Every LTR-forced run is therefore an INLINE style, which never
    // reaches JSS and is never mirrored. Same idiom as SmartSendPreview.tsx:65.
    // NO `max-width` transition on the Paper — deliberately reverted during adversarial review.
    // Easing the lg→sm shrink was pleasant, but it also made a PRE-EXISTING stale render visible.
    // The dialog is permanently mounted (SmartSendScreen.tsx:617) and `if (!open) return null`
    // does not reset state, so re-opening after a recoverable failure (402/423/451) commits one
    // frame still holding phase==='result' before the passive reset effect runs. Un-eased, that is
    // an imperceptible single-frame class swap. Eased, the operator watches the summary dialog
    // visibly grow 600→1367px on every retry — and MUI's own reflow(node) in the container Fade
    // guarantees the two style recalcs do not coalesce. An instant snap is what MUI does natively
    // and is the correct trade here.
    // outline:'none' because this element is focused programmatically on entering the result phase
    // (see the effect below) — the heading text is the announcement, a focus ring around the whole
    // card is not. Focus has to move: the foot goes from a Fragment to a single Button, so React
    // unmounts the Send button the user just pressed and focus falls to <body>.
    resultWrap: {
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        padding: theme.spacing(4, 3, 2), outline: 'none',
    },
    resultDisc: {
        width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    // 22/700 and 17 are the house Data Sources dialog scale (dialogStyles.ts:11-13). Written out
    // rather than inherited: this dialog builds raw Boxes and never mounts useDsDialogStyles, so
    // that scale does not cascade here. Text stays neutral in all three tones — #b7791f as a 22px
    // headline is 3.64:1 on white and fails AA, and under index.css:11-15 (`body{zoom:0.95}`) it
    // paints at 20.9px, where the AA-large 3:1 margin is already thin.
    resultTitle: { fontSize: 22, fontWeight: 700, lineHeight: 1.3, color: 'rgba(0, 0, 0, 0.87)', marginTop: theme.spacing(2) },
    resultBody: { fontSize: 17, lineHeight: 1.55, color: 'rgba(0, 0, 0, 0.6)', marginTop: theme.spacing(1), maxWidth: 440 },
    resultRule: {
        width: '100%', maxWidth: 440, marginTop: theme.spacing(2),
        paddingTop: theme.spacing(2), borderTop: '1px solid #e0e0e0',
    },
    resultMeta: { fontSize: 15, color: 'rgba(0, 0, 0, 0.6)' },
    resultCode: { fontSize: 13, color: 'rgba(0, 0, 0, 0.6)' },
    resultLinks: { fontSize: 15, color: 'rgba(0, 0, 0, 0.6)', wordBreak: 'break-all', maxHeight: 160, overflowY: 'auto' },
}));

const SendSummaryDialog: React.FC<{ open: boolean; campaignId: number; onClose: () => void; onSent?: () => void; beforeSend?: () => Promise<boolean> }> =
    ({ open, campaignId, onClose, onSent, beforeSend }) => {
        const dispatch = useDispatch();
        const { t, i18n } = useTranslation();
        const classes = useStyles();
        // Dialogs portal outside App.js:1018's <div dir=...>, and <html dir> is stuck at "ltr"
        // (App.js:727-730 runs once at mount, when i18n.language is still the 'en' default set at
        // i18n.js:20). Without an explicit dir every dialog in this feature renders LTR.
        const isRTL = useSelector((s: any) => s.core && s.core.isRTL);
        const summary = useSelector((s: any) => s.newsletter && s.newsletter.newsletterSendSummary);
        const channel = useSelector((s: any) => s.smartSend.selectedChannel) as eSendChannel;
        // SUPERVISOR-INTENT: the mapping the user actually made. sum.HasSupervisors is the LEGACY
        // per-SubAccount flag (EmailController stamps it from Newsletter_HasSupervisors over
        // dbo.SupervisorToAgents) and knows nothing about this campaign's supervisor column — which
        // is why the control could appear with no mapping, and hide with one.
        const supervisorColumnId = useSelector((s: any) => s.smartSend && s.smartSend.supervisorColumnId);
        const supervisorColumns = useSelector((s: any) => (s.smartSend && s.smartSend.columns) || []);
        const [sendToSupervisor, setSendToSupervisor] = useState(false);
        const [phase, setPhase] = useState<'summary' | 'sending' | 'result'>('summary');
        const [result, setResult] = useState<any>(null);

        // SUPERVISOR-SUMMARY-GUARD: a POSITIVE test, so it fails closed. newsletterSendSummary is
        // session-sticky (seeded to [], nothing clears it but the new .rejected case), and
        // GetSendSummary answers Data = null on four separate paths. Without this the dialog could
        // open on a stale object and show another campaign's recipient count — and now its
        // supervisor default — next to a live Send button. CampaignID is always populated on the
        // success path (Newsletter_GetSummary selects it under WHERE CampaignID = @prm_CampaignID).
        const summaryUsable = !!summary && !Array.isArray(summary)
            && Number(summary.CampaignID) === Number(campaignId);
        const sum: any = summaryUsable ? summary : {};

        // SUPERVISOR-CONTROL: one control, and exactly one warning — is the mapped column actually
        // usable as a supervisor address. The three-tier confidence scale was dropped deliberately:
        // the upload wizard renames an auto-detected second email column to the localized
        // "supervisor email" label AND tags it EMAIL, so the ordinary path already produces the
        // strongest possible signal, and the mapping screen already offers "none" as the place to
        // say no. Re-asking at send time was duplication; warning on a column that cannot hold an
        // address is not.
        const supervisorColumn = supervisorColumnId != null
            ? supervisorColumns.find((c: any) => c && c.ColumnID === supervisorColumnId)
            : undefined;
        const supervisorIssue: 'none' | 'notEmail' | 'isRecipient' =
            !supervisorColumn ? 'none'
                : !isNotIdentity(supervisorColumn) ? 'isRecipient'
                    : !isEmailish(supervisorColumn) ? 'notEmail'
                        : 'none';
        // Visible for a mapped campaign OR a legacy tenant — the server gate is the OR of the same
        // two sources, so the control must mirror it or the UI and the backend disagree.
        const supervisorVisible = !!supervisorColumn || !!sum.HasSupervisors;
        // ON by default: the mapping is already the decision. Off only when the column cannot work.
        // `&& !supervisorColumnIsGuess` added 2026-08-11 (deep review R1-02). D1 says the default is
        // ON *because the mapping is already the decision* — that reasoning holds for a column an
        // operator picked and fails completely for one pickDefaultSupervisorColumn guessed.
        // The old expression was inverted relative to risk: guess tiers 2 and 3 are "emailish" by
        // construction, so supervisorIssue was always 'none' for them and the box shipped TICKED,
        // while the warning banner below fired only for tier 1 — the tier with the STRONGEST
        // evidence of intent. An unconfirmed guess now starts OFF and the operator opts in, which
        // is the one direction that cannot send mail to an address nobody chose.
        const supervisorColumnIsGuess = useSelector(
            (s: any) => !!(s.smartSend && s.smartSend.supervisorColumnIsGuess));
        const supervisorDefaultOn =
            !!supervisorColumn && !supervisorColumnIsGuess && supervisorIssue === 'none';

        // The dialog stays mounted (open toggled by the parent), so reset to a clean
        // summary view on every open — otherwise a prior send's result banner persists and
        // blocks re-viewing the summary / retrying after a fixable pipeline error.
        // [open] alone is the correct dependency: SmartSendScreen.openSummary awaits the summary
        // fetch BEFORE flipping open, so supervisorDefaultOn is already settled in the render that
        // turns it true. Adding it to the deps would silently undo the user's own un-tick whenever
        // redux updated.
        useEffect(() => {
            if (open) { setPhase('summary'); setResult(null); setSendToSupervisor(supervisorDefaultOn); }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [open]);

        // FOCUS ON RESULT. Entering 'result' swaps the foot from a Fragment (Send + Cancel) to a
        // single Button: React sees different element types at that position, unmounts the subtree,
        // and the Send button the operator just pressed disappears WHILE FOCUSED — the browser then
        // drops focus to <body>. MUI's TrapFocus notices and pushes focus back to the dialog
        // CONTAINER div (which has outline:0, so nothing is visible) via a 50ms interval, leaving a
        // window where focus is genuinely outside the dialog and the next Tab lands on the header ✕
        // rather than on Close. Focusing the card in the same commit as the phase change wins that
        // race — TrapFocus only intervenes when focus is outside the root, and this target is inside.
        // The card, not the Close button: on a failure the button reads "סגור", which tells a screen
        // reader nothing about what happened, while the card leads with the outcome heading.
        const resultRef = useRef<HTMLDivElement | null>(null);
        useEffect(() => {
            if (open && phase === 'result' && resultRef.current) resultRef.current.focus();
        }, [open, phase]);

        if (!open) return null;
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

        // The result phase is a CARD, not a banner. InlineBanner is by construction a SUBORDINATE
        // surface: it carries marginBottom (InlineBanner.tsx:19) and a leading icon rail, i.e. the
        // grammar of "read this, then act on what follows". In this phase nothing follows — the whole
        // summary subtree is unmounted — so a tinted strip pinned to the top of an empty body is what
        // made the screen read as broken. InlineBanner remains correct for the summary-phase banners
        // below, which do sit above content the operator must still act on.
        const buildResult = () => {
            const code = result && typeof result.StatusCode === 'number' ? result.StatusCode : 0;
            if (code === 200 || code === 201) {
                // SUPERVISOR-RECEIPT-UI: the campaign sent — that is what the status code means, and
                // it is deliberately NOT re-coded when the supervisor enqueue fails, because a
                // non-success code would withhold the parent's `sent` latch and permit a SECOND real
                // send. The receipt rides in Data instead. id <= 0 covers both non-positive cases
                // (-1 = the SP declined, 0 = a SqlException swallowed inside DataAccess); an absent
                // field means this environment is running an API build without the receipt, which is
                // reported as unknown rather than quietly as success.
                const receipt = result && result.Data && typeof result.Data.SupervisorRequestID === 'number'
                    ? result.Data.SupervisorRequestID as number
                    : null;
                // A failed supervisor enqueue no longer REPLACES the success message. The campaign
                // did go out; suppressing that on the one path where it matters most left the
                // operator unable to tell whether recipients had been mailed at all. Same card,
                // warning tone, and the reason stated in the body.
                const notQueued = sendToSupervisor && receipt !== null && receipt <= 0;
                return {
                    tone: notQueued ? 'warning' : 'success',
                    role: notQueued ? 'alert' : 'status',
                    headline: notQueued
                        ? t('DataSources.send.result.supervisorNotQueuedTitle')
                        : t('DataSources.send.result.success'),
                    detail: notQueued
                        ? t('DataSources.send.result.supervisorNotQueuedBody')
                        : t('DataSources.send.result.successDesc'),
                    // Its own row under a rule, no longer string-concatenated onto the description:
                    // this is a transactional identifier the operator may have to quote. Rendered
                    // only when the report was actually requested — the operator who did not ask for
                    // one is owed silence, not a line explaining its absence.
                    meta: notQueued || !sendToSupervisor ? null
                        : receipt === null
                            ? t('DataSources.send.result.supervisorUnknown')
                            : t('DataSources.send.result.supervisorQueued', { id: receipt }),
                    links: null as string[] | null,
                    code: null as string | null,
                };
            }
            const known = RESULTS[code];
            const key = known ? known.key : 'genericError';
            // TITLE AND BODY USED TO BE THE SAME STRING — both arms resolved to
            // t('…result.' + key), so InlineBanner printed one sentence twice: once bold and
            // coloured, once grey directly beneath it. That is what the screenshot shows under
            // "שליחה חסומה", and it reads as a rendering fault. The headline is now the only
            // required copy; a body appears when — and only when — a matching `…Desc` key exists.
            // No new translation keys are needed to ship this, and adding one later is copy-only.
            const descKey = 'DataSources.send.result.' + key + 'Desc';
            return {
                tone: known ? known.sev : 'error',
                // 550/551 are NOT failures: the campaign is queued and goes out on approval. Every
                // non-2xx code used to get role="alert" — assertive interruption — which framed a
                // normal approval hold as a malfunction. A warning gets the polite region.
                role: known && known.sev === 'warning' ? 'status' : 'alert',
                headline: t('DataSources.send.result.' + key),
                detail: i18n.exists(descKey) ? t(descKey) : null,
                meta: null as string | null,
                links: code === 423 && result && Array.isArray(result.Data) && result.Data.length
                    ? (result.Data as string[]) : null,
                // Quotable diagnostic. Message rides on every payload and was never surfaced.
                // The `code > 0` guard alone would switch this row OFF on the one class of failure
                // where the outcome is genuinely unknown: on a REJECTED thunk there is no
                // StatusCode at all, because the response interceptor rejects with
                // error.response.data (PulseemReactAPI.ts:74-80) whose field is `Message`, not
                // `message`, so smartSendSlice.ts:146 stores { error: undefined } — a TRUTHY object,
                // which also means doSend's `{ StatusCode: 500 }` fallback never fires. Falling back
                // to the error string keeps the row alive on the transport path, where it is the
                // only thing the operator can hand to support.
                // STILL OPEN (B4, deferred by the owner): the HEADLINE on this path is
                // "השליחה נכשלה" — asserted as fact when the send may well have completed and only
                // the response was lost. Correcting that needs a new key ("לא ידוע אם השליחה בוצעה").
                code: code > 0
                    ? code + ' · ' + ((result && result.Message) || key)
                    : (result && typeof result.error === 'string' && result.error) || null,
            };
        };
        const rv = phase === 'result' ? buildResult() : null;
        const tone = TONE[(rv && rv.tone) || 'success'];

        const renderResult = () => {
            if (!rv) return null;
            const Icon = tone.Icon;
            return (
                <Fade in timeout={200}>
                    {/* a plain div, not Box: MUI v4's BoxProps does not declare `ref`, and this node
                        needs one for the focus move above (it is also the ref Fade forks onto). */}
                    {/* aria-labelledby is required, not decorative: both role="status" and
                        role="alert" are "name from author" — neither derives a name from its
                        contents — so without it the element that receives focus has an EMPTY
                        accessible name and the outcome is not announced on the focus move. */}
                    <div className={classes.resultWrap} role={rv.role} tabIndex={-1} ref={resultRef}
                        aria-labelledby="send-summary-outcome">
                        <Box className={classes.resultDisc} style={{ background: tone.bg, border: tone.ring }}>
                            <Icon style={{ fontSize: 34, color: tone.glyph }} aria-hidden="true" />
                        </Box>
                        {/* component="h2": the dialog header h6 is this surface's heading level 1,
                            and until now the result had no heading at all to navigate to. */}
                        <Typography component="h2" id="send-summary-outcome" className={classes.resultTitle}>{rv.headline}</Typography>
                        {rv.detail && <Typography component="p" className={classes.resultBody}>{rv.detail}</Typography>}
                        {rv.links && (
                            // Latin URLs. direction/textAlign are INLINE on purpose — the same rule
                            // inside makeStyles would be flipped to rtl by jss-rtl and undo the
                            // isolation. 'start' rather than 'left' so it is correct in both modes,
                            // and never centred: a wrapped URL centred line-by-line is unreadable.
                            <Box className={`${classes.resultRule} ${classes.resultLinks}`}
                                style={{ direction: 'ltr', textAlign: 'start' }}>
                                {rv.links.map((u, i) => <div key={i}>{u}</div>)}
                            </Box>
                        )}
                        {rv.meta && (
                            <Box className={classes.resultRule}>
                                <Typography className={classes.resultMeta}>{rv.meta}</Typography>
                            </Box>
                        )}
                        {rv.code && (
                            <Box className={classes.resultRule}>
                                <Typography className={classes.resultCode}
                                    style={{ direction: 'ltr', display: 'inline-block' }}>{rv.code}</Typography>
                            </Box>
                        )}
                    </div>
                </Fade>
            );
        };

        const sending = phase === 'sending';
        const isResult = phase === 'result';

        return (
            <Dialog
                open={open}
                // B1 — DISMISSAL GUARD, copied from the sibling TestSendDialog.tsx:381-385 which
                // already guards the identical hazard. Without it, ESC or a backdrop click during
                // 'sending' calls onClose while the send is still in flight: this component then
                // returns null at the top of render, doSend nevertheless reaches setPhase('result')
                // and onSent, and SmartSendScreen.tsx:621-624 has ALREADY run its close handler with
                // `sent` still false — so there is no banner, no redirect and no toast. A real
                // production campaign goes out and the operator is shown nothing at all.
                // The RESULT phase is deliberately NOT locked: dismissing a receipt is fine, and
                // every exit still routes through onClose so the post-send redirect fires.
                // SCOPE OF THE LOCK — ESC AND BACKDROP ONLY. The header ✕ stays live (see below).
                // Locking all three, as TestSendDialog does, is not safe here: `sending` is cleared
                // ONLY by doSend's own continuation, and that continuation can be delayed for a very
                // long time or never arrive. PulseemReactAPI.ts:47 refreshes the token with a BARE
                // `axios.get` — the default instance, no timeout; the `timeout: 300000` at :31
                // belongs to PulseemReactInstance and does not apply — and it is awaited at :65
                // inside the REQUEST interceptor, i.e. before the adapter that would enforce a
                // timeout even runs. If RefreshToken.ashx stalls, the PUT is never issued and no
                // timer is ever armed. Even with nothing wrong, a slow send holds 'sending' for up
                // to the full 5 minutes. With all three exits gone the operator's only way out of a
                // full-screen modal is F5 — a worse failure than the one this guard fixes.
                onClose={() => { if (!sending) onClose(); }}
                disableEscapeKeyDown={sending}
                disableBackdropClick={sending}
                // The dialog had no accessible name at all — role="dialog" announced as just
                // "dialog". It matters more now that focus is moved deliberately on the result.
                aria-labelledby="send-summary-title"
                // GEOMETRY IS PHASE-DEPENDENT, on ONE Dialog element — never two conditionally
                // rendered ones, which would be a real unmount: Fade replays, TrapFocus restores and
                // re-acquires, and ModalManager tears down and re-applies the body scroll lock.
                // `maxWidth` selects a pre-generated static class (Dialog.js:113-151), so this swaps
                // a className on the same Paper. lg resolves to 1367 here, not MUI's stock 1280
                // (theme.js:36); sm is 600.
                // The switch happens ONLY on the edge into 'result'. 'sending' keeps the summary
                // geometry because doSend bounces back to 'summary' when beforeSend fails, which
                // would otherwise shrink then re-grow the dialog with no state change to explain it.
                maxWidth={isResult ? 'sm' : 'lg'}
                fullWidth
                dir={isRTL ? 'rtl' : 'ltr'}
                PaperProps={{
                    // 90vh is what lets the summary's preview iframe fill its column. In the result
                    // phase the body is a single card, so height comes from content — a 1367x727 box
                    // holding one 74px banner is the entire reported bug.
                    style: isResult
                        ? { height: 'auto', maxHeight: 'calc(100% - 64px)' }
                        : { height: '90vh' },
                }}>
                <Box className={classes.head}>
                    <Typography variant="h6" id="send-summary-title">{t('DataSources.send.summary.title')}</Typography>
                    {/* padding 7, not size="small"'s 3: MUI renders a 24x24 target there, and
                        index.css:11-15 paints this dialog at zoom 0.95, giving 22.8px — under the
                        24x24 minimum. 7 makes it 32x32 CSS / 30.4 painted. The head row is sized by
                        the h6's 32px line-box, so header height is unchanged.
                        DELIBERATELY NOT disabled while sending — this is the escape hatch, and the
                        one exit that must never be taken away. ESC and a backdrop click are slips;
                        pressing ✕ is a decision. Guarding the two accidental exits removes the
                        reported hazard (a campaign going out with the operator shown nothing),
                        while leaving this one guarantees the modal can always be dismissed even if
                        `sending` never clears — see the timeout analysis on the Dialog above. */}
                    <IconButton size="small" style={{ padding: 7 }} onClick={onClose}
                        aria-label={t('DataSources.send.close')}><Close /></IconButton>
                </Box>
                {/* padding only. `flex:'0 0 auto'` was here and was WRONG: it overrode the class's
                    `flex:'1 1 auto'` (:body), so the body could no longer shrink and its own
                    overflowY:auto never engaged. head and foot are already 0 0 auto, so on a short
                    viewport with tall content — a 423 card carrying a link list — the whole PAPER
                    scrolled instead, and the ✕ and the Close button, the only two dismiss
                    affordances, scrolled out of view on a card that looked complete. Leaving the
                    class's flex alone keeps head/foot pinned and scrolls the body, as in every
                    other phase. With height:'auto' there is nothing to grow into, so the body
                    still sizes to its content and no stray scrollbar appears. */}
                <Box className={classes.body} style={isResult ? { padding: 0 } : undefined}>
                    {phase === 'result' ? renderResult() : !summaryUsable ? (
                        // SUPERVISOR-SUMMARY-GUARD render arm. An error banner alone is not enough —
                        // the Send button below is also disabled, because showing a plausible-looking
                        // but stale summary next to a live Send is the actual hazard.
                        <InlineBanner severity="error" role="alert" size="lg"
                            title={t('DataSources.send.summary.staleTitle')}
                            body={t('DataSources.send.summary.staleBody')} />
                    ) : (
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
                            {supervisorVisible && (
                                <Box style={{ marginTop: 8 }}>
                                    {supervisorIssue !== 'none' && (
                                        // Wrapped rather than passing an id to InlineBanner: that
                                        // component is shared across this feature and an additive prop
                                        // there is a wider blast radius than a Box here.
                                        <Box id="supervisor-issue" style={{ marginBottom: 8 }}>
                                            <InlineBanner
                                                severity="warning"
                                                role="alert"
                                                size="lg"
                                                title={t('DataSources.send.summary.supervisor.' + supervisorIssue + 'Title')}
                                                body={t('DataSources.send.summary.supervisor.' + supervisorIssue + 'Body',
                                                    { name: (supervisorColumn && supervisorColumn.DisplayName) || '' })} />
                                        </Box>
                                    )}
                                    <FormControlLabel
                                        control={<Checkbox
                                            color="primary"
                                            checked={sendToSupervisor}
                                            inputProps={{ 'aria-describedby': 'supervisor-caption' } as any}
                                            onChange={(e) => {
                                                setSendToSupervisor(e.target.checked);
                                                // TICKING THE BOX IS THE CONFIRMATION. Added 2026-08-11
                                                // during fix verification. Making an unconfirmed guess
                                                // start OFF (see supervisorDefaultOn) left a hole: the
                                                // control was visible and tickable, but the guessed
                                                // SupervisorColumnID was never persisted, so the server's
                                                // OR gate saw NULL, and for a post-migration tenant with
                                                // HasSupervisors = 0 the enqueue returned -1 AFTER the
                                                // campaign had already gone out. The operator ticked
                                                // "send to supervisors", the campaign sent, and the
                                                // report did not — with no re-queue path in the UI.
                                                // Promoting the guess here closes it: setBusinessColumn
                                                // clears supervisorColumnIsGuess and marks the screen
                                                // dirty, so the mapping is saved with a real column
                                                // before doSend runs saveMapping.
                                                if (e.target.checked && supervisorColumnIsGuess && supervisorColumn) {
                                                    dispatch(setBusinessColumn({
                                                        role: 'supervisor',
                                                        columnId: supervisorColumn.ColumnID,
                                                    }));
                                                }
                                            }} />}
                                        label={t('DataSources.send.summary.supervisor.label')} />
                                    {/* Muted, never MUI `disabled`. Disabled would drop the control out
                                        of the tab order, read as "unavailable" to a screen reader, and
                                        make "with the option to cancel" impossible to act on — the whole
                                        point of shipping it pre-ticked. body1, not body2: index.css
                                        applies body{zoom:0.95} between 1024 and 1440px and dialogs portal
                                        into document.body, so body2 lands around 13.3px effective. */}
                                    <Typography
                                        id="supervisor-caption"
                                        variant="body1"
                                        aria-live="polite"
                                        style={{ marginTop: 2, color: 'rgba(0, 0, 0, 0.6)' }}>
                                        {!sendToSupervisor
                                            ? t('DataSources.send.summary.supervisor.off')
                                            : supervisorColumn
                                                ? t('DataSources.send.summary.supervisor.byColumn',
                                                    { name: supervisorColumn.DisplayName || '' })
                                                : t('DataSources.send.summary.supervisor.byAccount')}
                                    </Typography>
                                </Box>
                            )}
                        </>
                    )}
                </Box>
                <Box className={classes.foot} style={isResult ? { justifyContent: 'flex-end' } : undefined}>
                    {isResult ? (
                        // `flex-end` is logical, so it lands on the physically-left edge under RTL —
                        // where a lone dismissive action belongs — with nothing for jss-rtl to flip.
                        // outlined, not contained-primary: palette.primary.main is #FF1744
                        // (theme.js:43), the exact red this file already rejected as "reads as an
                        // error" on a healthy outcome (see `big` above), and white on it is 3.85:1 —
                        // under AA for a 15px label. Green outline on success (#2e7d32 on white =
                        // 5.13:1); neutral outline otherwise, so the disc stays the only colour.
                        // Never variant="text": a lone text button in an empty footer is the other
                        // half of what made this screen look unfinished.
                        // No autoFocus — the effect above focuses the card so a screen reader leads
                        // with the outcome, not with the word "סגור". Two focus owners would race.
                        <Button variant="outlined" onClick={onClose}
                            // borderColor is set on BOTH arms. MUI's stock outlined border is
                            // rgba(0,0,0,0.23) — #C4C4C4 over white, 1.74:1, and WCAG 1.4.11 wants
                            // 3:1 for the boundary of an active control. It is the only visual
                            // affordance this button has, so leaving the default would have traded
                            // the label's 3.85:1 for a boundary WORSE than the contained button it
                            // replaced. rgba(0,0,0,0.5) is #808080 = 3.95:1; #2e7d32 is 5.13:1.
                            style={rv && rv.tone === 'success'
                                ? { color: '#2e7d32', borderColor: '#2e7d32', fontSize: 15, minWidth: 120 }
                                : { borderColor: 'rgba(0, 0, 0, 0.5)', fontSize: 15, minWidth: 120 }}>
                            {t('DataSources.send.close')}
                        </Button>
                    ) : (
                        <>
                            <Button variant="contained" color="primary" disabled={phase === 'sending' || !summaryUsable} onClick={doSend}>
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
