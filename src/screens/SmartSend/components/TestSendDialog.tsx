import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, Box, Typography, Button, TextField, IconButton, CircularProgress, MenuItem, Chip, Tooltip } from '@material-ui/core';
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
    // The chips live ABOVE the input rather than inside it. Inside-the-field chips need the
    // field to own its own focus ring and overflow, which in MUI v4 means re-implementing
    // OutlinedInput — a lot of surface for a cosmetic gain. Above keeps the stock TextField
    // untouched, wraps naturally at any width, and reads correctly in RTL.
    chips: { display: 'flex', gap: theme.spacing(0.75), flexWrap: 'wrap', marginTop: theme.spacing(1) },
    // Seed is metadata, not an input: narrow, monospace, disabled. See the seed block below.
    seedBox: { width: 132 },
}));

// The destination lands in dbo.DirectApi_SendEmail.@ToEmail, which is NVARCHAR(50). A longer
// address is REFUSED (422), never truncated — a truncated address bounces and the bounce puts
// the mangled string in the blacklist. Enforced here for the message and server-side for real.
const MAX_TO_EMAIL = 50;
const MAX_SAMPLE_SIZE = 5;

// One digest per recipient: PreviewSend takes ONE @ToEmail (dbo.DirectApi_SendEmail sends to a
// single address), so N addresses means N calls. Capped at 5 — the same ceiling the legacy test
// send used, and the point at which "a check for me" becomes "a distribution list carrying five
// named agents' figures".
const MAX_RECIPIENTS = 5;

// Scoped PER USER, and deliberately NOT per campaign — the two are separate decisions.
//
// Not per campaign: the addresses a tester checks with belong to the PERSON, not the campaign —
// the same inbox, usually the same colleague, across every campaign they touch. A per-campaign
// key means retyping on every new campaign, which is when people stop using the feature.
//
// But scoped to the LOGGED-IN USER, not global. A shared browser — an agency machine, a support
// laptop, one desk two people — would otherwise show operator B the addresses operator A checks
// with. Those are colleagues' addresses at an insurance client; they are not a UI preference.
// Scoping to the user still survives what the feature is for: the SAME person, the NEXT campaign.
// No identity ⇒ no key ⇒ nothing is written. Failing to remember is not a cost worth a leak.
const storageKey = (user: string) => (user ? `smartsend.preview.recipients.v1::${user.toLowerCase()}` : '');

// Client-side sanity only; dbo/SmartSendPreviewLogic.IsValidToEmail (MailAddress + the 50-char
// ceiling) is the authority and runs again server-side. This exists to stop an obvious typo
// before it costs a round trip, not to be a specification of what an address is.
const EMAIL_RE = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/;
const isValidRecipient = (e: string) => EMAIL_RE.test(e) && e.length <= MAX_TO_EMAIL;

// localStorage throws in Safari private mode and when the quota is full. A preview dialog must
// never fail to open because a convenience feature could not read a string.
const loadSaved = (user: string): { recipients: string[]; sampleSize: number } | null => {
    const key = storageKey(user);
    if (!key) return null;
    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return null;
        const p = JSON.parse(raw);
        const recipients = Array.isArray(p.recipients)
            ? p.recipients.filter((x: any) => typeof x === 'string' && isValidRecipient(x)).slice(0, MAX_RECIPIENTS)
            : [];
        const sampleSize = Number(p.sampleSize) >= 1 && Number(p.sampleSize) <= MAX_SAMPLE_SIZE
            ? Number(p.sampleSize) : MAX_SAMPLE_SIZE;
        return { recipients, sampleSize };
    } catch (e) { return null; }
};

// Saved on SEND, not on every keystroke: what is worth restoring is the set the operator actually
// committed to, not a half-typed address they abandoned.
const saveChoice = (user: string, recipients: string[], sampleSize: number) => {
    const key = storageKey(user);
    if (!key) return;
    try {
        window.localStorage.setItem(key, JSON.stringify({ recipients, sampleSize }));
    } catch (e) { /* storage unavailable — the feature degrades to "no memory", nothing else */ }
};

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
        // THE one state change this whole feature rests on: the destination was a string, it is now
        // a LIST plus whatever is being typed. Everything else — validation, the send, what gets
        // remembered — is derived from these two, so nothing else had to grow a special case.
        const [recipients, setRecipients] = useState<string[]>([]);
        const [draft, setDraft] = useState('');
        const [sampleSize, setSampleSize] = useState(MAX_SAMPLE_SIZE);
        const [offset, setOffset] = useState(0);
        const [seed, setSeed] = useState(0);
        const [sending, setSending] = useState(false);
        const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
        // How many pasted addresses were refused for exceeding MAX_RECIPIENTS. Shown, never silent.
        const [dropped, setDropped] = useState(0);
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
            // Restore last time's choice; fall back to the logged-in address. The SEED is
            // deliberately NOT restored — it is re-rolled above on every open. Its job is to hold
            // one sample still while you fix a cell and re-send, not to freeze the same five agents
            // forever: persisting it would mean nobody ever sees a different agent without walking.
            const saved = loadSaved(userEmail);
            const restored = (saved && saved.recipients.length ? saved.recipients : (userEmail ? [userEmail] : []))
                .filter(isValidRecipient).slice(0, MAX_RECIPIENTS);
            // A SINGLE restored address goes into the INPUT, not into a chip. That is the default
            // case — "send the check to me" — and before this change the field held that address,
            // so select-all-and-type replaced it. As a chip the field reads empty, and the same
            // keystrokes ADD a second recipient instead of replacing the first: the operator who
            // meant to check as a colleague mails both. Two or more restored addresses are a
            // deliberate list, and chips are the right shape for a list.
            if (restored.length === 1) { setRecipients([]); setDraft(restored[0]); }
            else { setRecipients(restored); setDraft(''); }
            setDropped(0);
            if (saved) setSampleSize(saved.sampleSize);
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

        // ── the chip input ───────────────────────────────────────────────────────────────────
        // One commit function, four triggers: ',' / ' ' / Enter / blur. They all mean the same
        // thing — "that address is finished" — so they must not drift apart.
        // Paste is covered for free: a pasted "a@x.com, b@y.com" arrives through onChange and the
        // separator split below turns it into two chips in one keystroke-equivalent.
        const commitDraft = (raw: string): void => {
            const parts = raw.split(/[,;\s]+/).map((s) => s.trim()).filter(Boolean);
            if (!parts.length) return;
            setRecipients((prev) => {
                const next = prev.slice();
                let overflow = 0;
                parts.forEach((p) => {
                    // Duplicates are dropped silently rather than flagged: adding the same address
                    // twice is an obvious slip, and two identical digests is a worse outcome than
                    // no feedback. Comparison is case-insensitive on the whole address — the local
                    // part is technically case-sensitive, but no real mailbox relies on it and a
                    // tester typing Idan@ and idan@ means one inbox.
                    // Over the cap is NOT silent. Dropping an address the operator pasted, while
                    // the toast then reports success, is the "sent to fewer people than intended"
                    // failure this whole dialog exists to avoid.
                    if (next.length >= MAX_RECIPIENTS) { overflow += 1; return; }
                    if (next.some((x) => x.toLowerCase() === p.toLowerCase())) return;
                    next.push(p);
                });
                setDropped(overflow);
                return next;
            });
        };

        const handleDraftChange = (v: string) => {
            // A separator ENDS an address. Anything before the last separator is committed; the
            // tail keeps being typed. This is what makes "type, comma, type, comma" feel natural
            // without a keydown handler racing the controlled value.
            if (/[,;\s]/.test(v)) {
                const lastSep = Math.max(v.lastIndexOf(','), v.lastIndexOf(';'), v.lastIndexOf(' '));
                commitDraft(v.slice(0, lastSep + 1));
                setDraft(v.slice(lastSep + 1));
                return;
            }
            setDraft(v);
        };

        const removeRecipient = (email: string) =>
            setRecipients((prev) => prev.filter((x) => x !== email));

        const draftTrimmed = draft.trim();
        // The list the send will actually use — the draft counts even if the operator never pressed
        // anything after typing it. Losing a typed address because it was not "committed" is the
        // classic chip-input bug, and it silently sends to fewer people than the screen implies.
        const effective = draftTrimmed && !recipients.some((x) => x.toLowerCase() === draftTrimmed.toLowerCase())
            ? recipients.concat([draftTrimmed]).slice(0, MAX_RECIPIENTS)
            : recipients;
        const invalid = effective.filter((e) => !isValidRecipient(e));
        const atCapacity = recipients.length >= MAX_RECIPIENTS;
        // How many agents this offset can actually yield — the last page is short, and claiming
        // "5 out of 12" while standing at offset 10 would be a lie the mail then contradicts.
        const shownInSample = info.status === 'ok'
            ? Math.max(0, Math.min(sampleSize, info.count - offset))
            : sampleSize;
        const canPrev = offset > 0;
        const canNext = info.status === 'ok' && offset + sampleSize < info.count;

        const doSend = async () => {
            const targets = effective.filter(isValidRecipient);
            if (!targets.length) return;
            setSending(true);

            // SEQUENTIAL, not Promise.all. Each call composes its own digest and mints its own
            // preview tokens, so five parallel calls are five concurrent samplings against the same
            // campaign for no gain — and a partial failure in flight becomes far harder to report
            // honestly. Five requests one after another is well inside a dialog's patience budget.
            //
            // Same seed and offset for every recipient on purpose: everyone must be looking at THE
            // SAME five agents, otherwise two people comparing notes are discussing different mail.
            const results: Array<{ to: string; ok: boolean; code: number }> = [];
            try {
                for (let i = 0; i < targets.length; i += 1) {
                    // Progress is shown per address rather than as one opaque spinner: five
                    // sequential composes is seconds, not milliseconds, and a spinner that sits
                    // still for that long reads as "stuck" — which is when people click again.
                    setProgress({ done: i, total: targets.length });
                    /* eslint-disable no-await-in-loop */
                    const res: any = await dispatch(sendPreview({
                        campaignId, channel, toEmail: targets[i], sampleSize, seed, offset
                    }));
                    /* eslint-enable no-await-in-loop */
                    const r = res && res.payload ? res.payload : {};
                    // 201 ONLY. The previous implementation accepted `200 || 201`, and 200 is
                    // exactly what the shared test-send path returns when the send FAILED
                    // (NewsletterLogic.cs:479/:589) — a failed test looked sent. This endpoint
                    // returns 201 for "queued" and nothing else.
                    results.push({ to: targets[i], ok: r.StatusCode === 201, code: r.StatusCode });
                }
            } catch (err) {
                // A thunk that REJECTS (network down, unhandled 500) would otherwise escape this
                // loop with `sending` still true — a permanently spinning button on an open dialog,
                // with no way out but a page reload. Anything not yet attempted is reported as
                // failed rather than quietly forgotten.
                while (results.length < targets.length) {
                    results.push({ to: targets[results.length], ok: false, code: 0 });
                }
            } finally {
                setSending(false);
                setProgress(null);
            }

            const okCount = results.filter((x) => x.ok).length;
            const failed = results.filter((x) => !x.ok);

            if (okCount) saveChoice(userEmail, targets, sampleSize);

            if (!failed.length) {
                onToast({ ok: true, msg: t('DataSources.preview.sentOkN', { n: okCount }) });
                onClose();
                return;
            }
            // PARTIAL FAILURE KEEPS THE DIALOG OPEN — and the list is REDUCED TO THE FAILURES.
            // Without this the comment above was a promise the code did not keep: `recipients` was
            // left untouched, so the only available action — pressing Send again — re-dispatched to
            // all five, and the three people who already had the digest received a second,
            // byte-identical copy (the seed does not re-roll inside an open dialog). Shrinking the
            // list makes retry mean "retry what failed", which is what the operator intends, and
            // makes the failures visible as the chips that remain.
            if (okCount) {
                const failedAddrs = failed.map((x) => x.to);
                setRecipients(failedAddrs);
                setDraft('');
            }
            onToast({
                ok: false,
                msg: okCount
                    ? t('DataSources.preview.sentPartial', { ok: okCount, fail: failed.length, reason: previewErrorMsg(failed[0].code) })
                    : previewErrorMsg(failed[0].code)
            });
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
            // LOCKED WHILE SENDING — every exit, not only the Cancel button.
            // This component never unmounts: SmartSendScreen.tsx:627 renders it unconditionally
            // and only flips `open`, so closing mid-loop returns null at the top of render while
            // doSend keeps dispatching against its captured `targets`. The operator would watch
            // the dialog disappear and believe they had stopped it, while recipients 3, 4 and 5
            // still received the digest. Cancel was already guarded; the ✕, ESC and the backdrop
            // were not, which made them the ONLY exits an operator could actually reach.
            <Dialog
                open={open}
                onClose={() => { if (!sending) onClose(); }}
                disableEscapeKeyDown={sending}
                disableBackdropClick={sending}
                maxWidth="sm" fullWidth dir={isRTL ? 'rtl' : 'ltr'}
            >
                <Box className={classes.head}>
                    <Typography variant="h6">{t('DataSources.preview.title')}</Typography>
                    <IconButton size="small" onClick={onClose} disabled={sending} aria-label={t('DataSources.send.close')}><Close /></IconButton>
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
                                <Button size="small" variant="outlined" color="primary" disabled={savingMapping || sending} onClick={doSaveMapping}>
                                    {savingMapping ? <CircularProgress size={16} color="inherit" /> : t('DataSources.send.actions.saveMapping')}
                                </Button>
                            )}
                        />
                    )}
                    <TextField
                        fullWidth variant="outlined" size="small" style={{ marginTop: 8 }}
                        // NOT type="email": the browser's own validation bubble fires on a value
                        // that is mid-typing here, and the field legitimately holds a partial
                        // address between separators.
                        label={t('DataSources.preview.toLabel')}
                        value={draft}
                        // NOT disabled at capacity. Disabling it also disables the Backspace path
                        // below, so the one way to correct the fifth address would be to delete
                        // the chip and retype it from scratch. commitDraft already refuses to go
                        // past MAX_RECIPIENTS, and the helper text says why — so the field stays
                        // usable and simply will not accept a sixth.
                        onChange={(e) => handleDraftChange(e.target.value)}
                        onBlur={() => { commitDraft(draft); setDraft(''); }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') { e.preventDefault(); commitDraft(draft); setDraft(''); }
                            // Backspace on an EMPTY draft pulls the last chip back into the field
                            // rather than deleting it outright: the common reason to reach for
                            // backspace here is a typo in the address just committed, and undoing
                            // it into an editable state is what every mail client does.
                            if (e.key === 'Backspace' && !draft && recipients.length) {
                                e.preventDefault();
                                const last = recipients[recipients.length - 1];
                                setRecipients((prev) => prev.slice(0, -1));
                                setDraft(last);
                            }
                        }}
                        // NO maxLength. MAX_TO_EMAIL is the PER-ADDRESS server ceiling
                        // (dbo.DirectApi_SendEmail.@ToEmail NVARCHAR(50)); as a maxLength on a field
                        // that now holds a LIST it clipped the whole paste at the DOM, before
                        // onChange ever ran. Measured: pasting three clalbit.co.il addresses (69
                        // chars) silently produced TWO chips and a green Send button; pasting three
                        // clal.co.il addresses (51 chars) produced three, the last of them
                        // "avi@clal.co.i" — a domain the operator never typed, which passes both
                        // this regex and the server's MailAddress check. Length is enforced where
                        // it belongs instead: isValidRecipient, per address, on every chip.
                        onPaste={(e) => {
                            // Own the paste so the full clipboard text is parsed, not a clipped
                            // prefix. preventDefault is what keeps the DOM out of it.
                            const text = e.clipboardData.getData('text');
                            if (!text || !/[,;\s]/.test(text)) return;   // single address: let it through
                            e.preventDefault();
                            commitDraft(`${draft} ${text}`);
                            setDraft('');
                        }}
                        error={invalid.length > 0}
                        helperText={
                            invalid.length > 0
                                ? t('DataSources.preview.toInvalid', { email: invalid[0] })
                                : dropped > 0
                                    ? t('DataSources.preview.toDropped', { n: dropped, max: MAX_RECIPIENTS })
                                    : atCapacity
                                        ? t('DataSources.preview.toAtCapacity', { max: MAX_RECIPIENTS })
                                        : t('DataSources.preview.toHelperMulti', { max: MAX_RECIPIENTS })
                        }
                    />

                    {recipients.length > 0 && (
                        <Box className={classes.chips}>
                            {recipients.map((email) => (
                                <Chip
                                    key={email}
                                    size="small"
                                    label={email}
                                    // Deleting a chip mid-send removes it from the screen but NOT
                                    // from the loop's captured targets — the address still gets the
                                    // mail, the toast still counts it, and localStorage saves it.
                                    onDelete={sending ? undefined : () => removeRecipient(email)}
                                    // An invalid chip is coloured, not silently dropped: the operator
                                    // typed it and must see WHICH one the send will refuse.
                                    color={isValidRecipient(email) ? 'default' : 'secondary'}
                                    // The address is always LTR even in an RTL dialog — an email
                                    // rendered RTL puts the domain on the wrong side and reads as a
                                    // different address entirely.
                                    dir="ltr"
                                />
                            ))}
                        </Box>
                    )}

                    <Box className={classes.sampleRow}>
                        <TextField
                            select variant="outlined" size="small" style={{ minWidth: 160 }}
                            label={t('DataSources.preview.sampleSizeLabel')}
                            value={sampleSize}
                            // Locked mid-send: doSend captured sampleSize, so changing it here
                            // would leave the screen claiming a size the mails in flight do not use.
                            disabled={sending}
                            // Changing the size restarts the walk: keeping a stale offset would page
                            // past the end (or straddle a previous page) with no visible cause.
                            onChange={(e) => { setSampleSize(Number(e.target.value)); setOffset(0); }}
                        >
                            {[1, 2, 3, 4, 5].map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                        </TextField>
                        {/* The seed is OUTPUT, not input. It was a full-width read-only TextField
                            with a label and helper text, which made it look exactly as editable as
                            the selector beside it and invited people to type in it.
                            Now: narrow, monospace, and `disabled` — which greys it AND removes it
                            from the tab order, the two things that actually say "not for you".
                            The explanation moved into a tooltip so the row stays one line high. */}
                        <Tooltip title={t('DataSources.preview.seedHelper') as string}>
                            <TextField
                                variant="outlined" size="small" className={classes.seedBox}
                                label={t('DataSources.preview.seedLabel')}
                                value={seed}
                                disabled
                                inputProps={{ dir: 'ltr', style: { fontFamily: 'Consolas, monospace', fontSize: 12 } }}
                            />
                        </Tooltip>
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
                    <Button variant="contained" color="primary"
                        disabled={sending || !effective.length || invalid.length > 0}
                        onClick={doSend}>
                        {sending
                            ? (
                                <Box display="flex" alignItems="center" style={{ gap: 8 }}>
                                    <CircularProgress size={18} color="inherit" />
                                    {progress && progress.total > 1
                                        && t('DataSources.preview.sendingProgress', { done: progress.done + 1, total: progress.total })}
                                </Box>
                            )
                            : effective.length > 1
                                ? t('DataSources.send.actions.testSendN', { n: effective.length })
                                : t('DataSources.send.actions.testSend')}
                    </Button>
                    <Button onClick={onClose} disabled={sending}>{t('DataSources.send.cancel')}</Button>
                </Box>
            </Dialog>
        );
    };

export default TestSendDialog;
