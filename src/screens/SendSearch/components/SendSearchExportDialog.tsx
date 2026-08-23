// ═══════════════════════════════════════════════════════════════════════════════════════════
// SendSearchExportDialog — ייצוא תוצאות חיפוש השליחות.
//
// Structure copied from `screens/DataSources/components/ExportDialog.tsx`: reactive
// `dir={isRtl ? 'rtl' : 'ltr'}` on the Dialog, `fullWidth maxWidth="sm"`, `useDsDialogStyles` on
// the Paper, a full state reset in a `useEffect` on `open`, and the dialog owning its own status
// instead of the slice (see the note over `exportSendSearch` in sendSearchSlice.ts for why).
//
// WHERE IT DELIBERATELY GOES FURTHER, and why the extra surface earns its place:
// this file is not a "pick a format" popup — it is the last screen between an operator and a file
// that will be read as evidence of what an insurer sent to its agents. So the centre of the dialog
// is the CRITERIA TABLE: every filter currently in effect, written out in words. The exact same
// rows are what travels to the server as `Criteria` and what the server writes into the head of the
// file (frozen contract, "File layout"). One function, two uses — `buildExportCriteria` — so the
// file can never describe a different search from the one the operator confirmed.
//
// The rows are produced by SCANNING the live filter state, never from a hand-written list. A
// hand-written list would go stale the next time a filter is added, and it would go stale
// INVISIBLY: a file that looks complete while omitting the one filter that explains why it is
// short. The rationale, and the fallback that keeps an unknown filter visible, are in
// `Models/DataSources/SendSearch.ts` (`buildExportCriteria`).
// ═══════════════════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
    Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Link,
    Table, TableBody, TableCell, TableRow, TextField, Typography,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import useRedirect from '../../../helpers/Routes/Redirect';
import { sitePrefix } from '../../../config';
import { exportSendSearch } from '../../../redux/reducers/sendSearchSlice';
import { useDsDialogStyles } from '../../DataSources/components/dialogStyles';
import {
    SS,
    ExportCriterion,
    SendSearchCampaign,
    SendSearchFilterField,
    SendSearchFilters as Filters,
    SendSearchRequest,
    buildExportColumnHeaders,
    buildExportCriteria,
    buildExportLabels,
} from '../../../Models/DataSources/SendSearch';

interface Props {
    open: boolean;
    onClose: () => void;
    // "What is on screen": the dates as the user picked them (inclusive), which is what the criteria
    // rows must show.
    filters: Filters;
    // "What the server will run": trimmed text, de-duplicated campaign ids, complete clauses only,
    // the sort, and the EXCLUSIVE DateTo. Captured by the panel at the moment the dialog opens, so
    // the criteria on screen cannot drift from the criteria in the file while the dialog is up.
    request: SendSearchRequest;
    // TotalCount of the current search — the number of rows the file will contain, which is NOT the
    // number of rows on the page behind this dialog.
    totalCount: number;
    campaigns: SendSearchCampaign[];
    campaignsError: string | null;
    fields: SendSearchFilterField[];
    // Rules on screen that are not complete and are therefore NOT applied. Surfaced as its own
    // criteria row rather than swallowed: the operator can see them in the builder, so a file that
    // does not mention them invites the reader to assume they ran.
    incompleteRuleCount?: number;
}

// The terminal states of one export attempt. A discriminated union rather than three booleans and a
// string: "the file is ready" and "there are too many rows" are mutually exclusive answers, and a
// flag soup lets two of them render at once — which on this screen would mean a success message
// above a failure message about the same file.
type Outcome =
    | { kind: 'ready'; rows: number; xlsx: boolean }
    // `notified` carries whether an address was actually submitted. The 202 message used to promise
    // an email unconditionally, and `DownloadRepository.FinalizeFileReady` only sends one when
    // NotifyEmail is non-empty — so an operator who took the field's own advice and left it blank was
    // told to wait for mail that would never arrive, on a build that can take minutes.
    | { kind: 'background'; notified: boolean }
    | { kind: 'tooManyRows'; rows: number; max: number }
    | { kind: 'inProgress' }
    | { kind: 'notAllowed' }
    // 400 DATA_INCORRECT — the server rejected the ENVELOPE, not the search. It used to fall into the
    // catch-all "try again", which is the one instruction that cannot work: the request is
    // deterministic, so the retry reproduces it exactly.
    | { kind: 'invalid' }
    | { kind: 'error' }
    // The transport gave up before the server answered — an axios timeout
    // (PulseemReactAPI.ts:32, 300000 ms), a dropped connection, a proxy idle
    // timeout, a laptop sleep. THIS IS NOT A FAILURE AND MUST NOT BE PAINTED AS
    // ONE: the request has no CancellationToken on the server side
    // (SendSearchController.Export), so it keeps running, and on the sync path it
    // goes on to call FinalizeFileReady — which flips the row READY, raises the
    // bell and e-mails the download link. Reporting "failed" here tells the
    // operator an audit file does not exist while it is being announced to them,
    // and the "try again" it used to invite produces a SECOND file, row, bell and
    // mail for one intent. The dialog already guards that exact duplication on
    // the ESC/backdrop route below; this is the same door, opened by the client.
    | { kind: 'unknown' }
    | null;

const SendSearchExportDialog: React.FC<Props> = ({
    open, onClose, filters, request, totalCount,
    campaigns, campaignsError, fields, incompleteRuleCount,
}) => {
    const { t, i18n } = useTranslation();
    // Reactive, not hardcoded "rtl" — the same reason ExportDialog.tsx:72-73 gives: MUI portals the
    // Dialog outside App's inner `<div dir>` and `<html dir>` is stuck ltr, so the attribute is
    // mandatory here, and hardcoding it broke en/pl once already.
    const isRtl = (i18n.dir?.() ?? 'rtl') === 'rtl';
    const dispatch = useDispatch();
    const Redirect = useRedirect();
    const dsDialog = useDsDialogStyles();

    const [notifyEmail, setNotifyEmail] = useState('');
    const [busy, setBusy] = useState(false);
    const [outcome, setOutcome] = useState<Outcome>(null);

    // Which EXPORT SESSION the component is currently showing. Bumped on every open; captured by
    // `handleExport` before it awaits and re-checked after. The reset below clears the state of a
    // session, but it cannot cancel a request that is already in flight — the panel deliberately
    // leaves this dialog mounted (SendSearchPanel.tsx:560-564), so a thunk dispatched in session N
    // resolves onto a LIVE component that may by then be showing session N+1. Without this counter
    // that continuation writes "the file is ready — N rows" over the criteria of a search that was
    // never exported, and `done` then locks the Export button until the dialog is closed and
    // re-opened — so the export the operator actually asked for cannot be run at all. On a
    // regulatory deliverable that is a file answering a different question than the UI claims.
    const exportGenRef = useRef(0);

    // Full reset on every OPEN. Without it the previous attempt's "the file is ready" — with a link
    // to a download built from a different filter set — would be the first thing the operator sees
    // over a search they have since narrowed.
    useEffect(() => {
        if (open) {
            exportGenRef.current += 1;
            setNotifyEmail('');
            setBusy(false);
            setOutcome(null);
        }
    }, [open]);

    // Built once per render from the live state. The SAME array is rendered below and posted as
    // `Criteria` — there is no second construction and therefore no way for the table and the file
    // to disagree.
    const criteria: ExportCriterion[] = buildExportCriteria(filters, request, {
        t,
        campaigns,
        campaignsError,
        fields,
        incompleteRuleCount,
    });

    const handleExport = async () => {
        setOutcome(null);
        setBusy(true);
        // The session this attempt belongs to. Everything after the await is written ONLY if the
        // dialog is still showing this same session.
        const gen = exportGenRef.current;
        const email = notifyEmail.trim();
        const res: any = await dispatch(exportSendSearch({
            // The search body, verbatim. NOT re-derived here: re-deriving it is how an export
            // silently stops matching the grid it claims to describe.
            ...request,
            Criteria: criteria,
            ColumnHeaders: buildExportColumnHeaders(t),
            Labels: buildExportLabels(t),
            // null, never '' — see SendSearchExportRequest.NotifyEmail.
            NotifyEmail: email.length > 0 ? email : null,
        }) as any);
        // The dialog was re-opened while this request was in flight, so the state below it belongs
        // to a DIFFERENT search. Drop the answer rather than paint it: the new session has already
        // reset `busy`/`outcome` itself, and this attempt's own file is still findable in the
        // downloads page and the notification bell. Writing here instead would claim the file
        // answers the criteria now on screen.
        if (gen !== exportGenRef.current) return;
        setBusy(false);

        const payload = res?.payload;
        const code = payload?.StatusCode;
        const data = payload?.Data;
        const message = payload?.Message;

        // 201 — written and READY. `Rows` and `XlsxIncluded` come from the server, never from
        // `totalCount`: above SendSearchExportXlsxMaxRows there is no .xls sibling, and telling the
        // user to open the Excel file that was not produced is a small lie with a support call
        // attached to it.
        if (code === 201) {
            setOutcome({ kind: 'ready', rows: data?.Rows ?? totalCount, xlsx: !!data?.XlsxIncluded });
            return;
        }
        // 202 — the walk is long enough to run in the background; the file is not on disk yet.
        // `notified` from the address that was actually SUBMITTED, not from the live field: the
        // message must describe the export that ran.
        if (code === 202) { setOutcome({ kind: 'background', notified: email.length > 0 }); return; }

        if (code === 409 && message === 'TOO_MANY_ROWS') {
            // BOTH numbers, from the server. "Too many rows" on its own is an error the operator
            // cannot act on — they do not know by how much they must narrow, and the ceiling is a
            // Web.config value that Idan can raise, so a number hardcoded here would go stale.
            setOutcome({
                kind: 'tooManyRows',
                rows: data?.Rows ?? totalCount,
                max: data?.MaxRows ?? 0,
            });
            return;
        }
        if (code === 409 && message === 'EXPORT_IN_PROGRESS') { setOutcome({ kind: 'inProgress' }); return; }

        // 405 should be UNREACHABLE — the panel hides the button entirely for a sub-user without
        // AllowExport or with HideRecipients. Handled anyway, because "unreachable" here means
        // "unreachable through this UI": the permission can change in another tab between the page
        // load that read `userRoles` and this click, and the generic error would send the operator
        // to debug a working server.
        if (code === 405) { setOutcome({ kind: 'notAllowed' }); return; }

        // 400 DATA_INCORRECT — the envelope this dialog built was rejected: the criteria block, the
        // 14 headers, the Labels map or the notification address. It gets its own answer because it
        // is the one failure a retry cannot clear — the same click rebuilds the same body and is
        // rejected identically. Told apart from 500 so an operator narrows or fixes the field she can
        // act on instead of opening a bug against a working server.
        if (code === 400) { setOutcome({ kind: 'invalid' }); return; }

        // A rejected thunk carries NO StatusCode at all — the server never answered this client.
        // Split out from the error branch 2026-08-11 (deep review R2-01). See the 'unknown' arm of
        // Outcome for why: the server does not stop when the client hangs up, so on the sync path
        // (<= SendSearchExportSyncMaxRows) the file is very likely finished, READY, belled and
        // mailed by the time this runs. The honest answer is "I do not know", and the safe action
        // is to send the operator to the downloads page instead of inviting a duplicate.
        if (code === undefined || code === null) { setOutcome({ kind: 'unknown' }); return; }

        // Everything else — 403, 927 DATA_SOURCES, 500. The server answered and said no, so no file
        // was produced and retrying is genuinely the right advice.
        setOutcome({ kind: 'error' });
    };

    // A finished export must not be re-fired from the same dialog: the second call would either
    // duplicate the file or hit the concurrency gate and paint a 409 over a success message.
    // 'unknown' is in this set on purpose, added 2026-08-11 (deep review R2-01). `done` disables
    // the Export button, and an unknown outcome is EXACTLY the state in which a second click is
    // most likely to duplicate a completed, already-announced PII file. Locking here is the same
    // decision the ESC/backdrop guard below already makes for the same hazard.
    const done = !!outcome
        && (outcome.kind === 'ready' || outcome.kind === 'background' || outcome.kind === 'unknown');

    const renderOutcome = () => {
        if (!outcome) return null;
        if (outcome.kind === 'ready') {
            return (
                <Box>
                    <Typography style={{ color: '#067647' }}>
                        {t(`${SS}export.ready`, { n: outcome.rows })}
                    </Typography>
                    <Typography style={{ fontSize: 13, color: '#5b6b7b' }}>
                        {t(outcome.xlsx ? `${SS}export.readyBoth` : `${SS}export.readyCsvOnly`)}
                    </Typography>
                    {/* Same destination the DataSources export links to — one downloads page for the
                        whole product, and it is where the notification bell points too. */}
                    <Link component="button" onClick={() => Redirect({ url: `${sitePrefix}Groups/Download`, openNewTab: false })}>
                        {t(`${SS}export.goToDownloads`)}
                    </Link>
                </Box>
            );
        }
        if (outcome.kind === 'background') {
            return (
                <Box>
                    {/* Two sentences, not one: an email is sent only when an address was given
                        (DownloadRepository.FinalizeFileReady gates it on a non-empty NotifyEmail),
                        while the notification bell fires either way. Promising mail that will not be
                        sent is the kind of small lie an operator only discovers by waiting. */}
                    <Typography style={{ color: '#067647' }}>
                        {t(outcome.notified
                            ? `${SS}export.runningInBackground`
                            : `${SS}export.runningInBackgroundNoEmail`)}
                    </Typography>
                    <Link component="button" onClick={() => Redirect({ url: `${sitePrefix}Groups/Download`, openNewTab: false })}>
                        {t(`${SS}export.goToDownloads`)}
                    </Link>
                </Box>
            );
        }
        if (outcome.kind === 'tooManyRows') {
            // Amber, not red, and phrased as an instruction: nothing broke, the search is simply
            // wider than the ceiling, and the operator has a concrete way out.
            return (
                <Box>
                    <Typography style={{ color: '#b54708' }}>
                        {t(`${SS}export.tooManyRows`, { rows: outcome.rows, max: outcome.max })}
                    </Typography>
                    <Typography style={{ fontSize: 13, color: '#5b6b7b' }}>
                        {t(`${SS}export.tooManyRowsHint`)}
                    </Typography>
                </Box>
            );
        }
        if (outcome.kind === 'inProgress') {
            return <Typography style={{ color: '#b54708' }}>{t(`${SS}export.inProgress`)}</Typography>;
        }
        if (outcome.kind === 'notAllowed') {
            return <Typography style={{ color: '#B42318', fontSize: 13 }}>{t(`${SS}export.notAllowed`)}</Typography>;
        }
        if (outcome.kind === 'invalid') {
            return <Typography style={{ color: '#B42318', fontSize: 13 }}>{t(`${SS}export.invalidRequest`)}</Typography>;
        }
        // Amber, not red, and no "try again": the file may well exist. Same visual weight as
        // inProgress, which is the other "do not act yet" state.
        if (outcome.kind === 'unknown') {
            return (
                <Box>
                    <Typography style={{ color: '#b54708', fontSize: 13 }}>
                        {t(`${SS}export.unknownOutcome`)}
                    </Typography>
                    <Typography style={{ color: '#667085', fontSize: 12, marginTop: 4 }}>
                        {t(`${SS}export.unknownOutcomeHint`)}
                    </Typography>
                    {/* The hint tells the operator to check the downloads page and the Export button
                        is locked, so this arm has to make that destination reachable — otherwise the
                        one action we are asking for is the one we did not offer. Same link as the
                        'ready' and 'background' arms. */}
                    <Link component="button" onClick={() => Redirect({ url: `${sitePrefix}Groups/Download`, openNewTab: false })}>
                        {t(`${SS}export.goToDownloads`)}
                    </Link>
                </Box>
            );
        }
        return <Typography style={{ color: '#B42318', fontSize: 13 }}>{t(`${SS}export.failed`)}</Typography>;
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            // While a request is in flight the dialog can only be left through the Close BUTTON —
            // which is itself `disabled={busy}` below. MUI v4 lets ESC and a backdrop click close a
            // Dialog by default, and the Close button being the only guarded exit was the gap: the
            // sync path builds the whole file inline in the request (SendSearchController.cs:787),
            // so the await is open for seconds to tens of seconds. Escaping through it orphans the
            // attempt — the operator never sees the confirmation, clicks Export again, and gets a
            // SECOND file: two PulseemLargeFiles rows, two bell notifications, two CSVs for one
            // intent, on a deliverable whose duplication is itself the defect. `busy`, not `true`:
            // once the answer is on screen the operator must still be able to dismiss it normally.
            disableEscapeKeyDown={busy}
            disableBackdropClick={busy}
            fullWidth
            maxWidth="sm"
            dir={isRtl ? 'rtl' : 'ltr'}
            PaperProps={{ className: dsDialog.paper }}
        >
            <DialogTitle>{t(`${SS}export.title`)}</DialogTitle>
            <DialogContent>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* The count, stated as a COUNT and immediately qualified. "N rows" beside a grid
                        showing 50 is read as "the page" by default, and an operator who exports what
                        they believe is the page and files what is actually the whole result set has
                        been misled in the direction that matters least — but one who believes the
                        reverse has filed an incomplete audit answer. */}
                    <Typography style={{ fontWeight: 700 }}>
                        {t(`${SS}export.rowCount`, { n: totalCount })}
                    </Typography>

                    {/* ── the criteria block ── */}
                    <Box>
                        <Typography style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                            {t(`${SS}export.criteriaTitle`)}
                        </Typography>
                        <Typography style={{ fontSize: 12.5, color: '#5b6b7b', marginBottom: 6 }}>
                            {t(`${SS}export.criteriaNote`)}
                        </Typography>
                        {/* Scrolls inside itself. A long campaign list must not push the export
                            button below the fold — the confirm action has to stay reachable without
                            the operator having to scroll a dialog to find it. */}
                        <Box style={{ maxHeight: 260, overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: 4 }}>
                            <Table size="small">
                                <TableBody>
                                    {criteria.map((c, i) => (
                                        // Index key: the rows are a rendering of one immutable array
                                        // built in this same render, never reordered and never
                                        // individually edited, so there is no identity to preserve.
                                        <TableRow key={`${c.Label}-${i}`}>
                                            <TableCell
                                                component="th"
                                                scope="row"
                                                style={{ width: '38%', fontWeight: 600, verticalAlign: 'top' }}
                                            >
                                                {c.Label}
                                            </TableCell>
                                            {/* wordBreak: a campaign name list or a free-text search
                                                term has no spaces to wrap at and would otherwise
                                                stretch the dialog sideways. */}
                                            <TableCell style={{ wordBreak: 'break-word' }}>{c.Value}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Box>

                    {/* The one thing about the FILE the operator has to know before they open it.
                        The .xls sibling keeps a leading zero on a mobile number; the .CSV is plain
                        text and Excel eats the zero when it auto-converts the column to a number.
                        Said here, before the export, because after the export it looks like data
                        loss. */}
                    <Typography style={{ fontSize: 12.5, color: '#5b6b7b' }}>
                        {t(`${SS}export.zeroPrefixNote`)}
                    </Typography>

                    {/* Outlined for the same reason the sibling dialog's field is (ExportDialog.tsx:82):
                        a bare-variant field on a white dialog surface reads as static text. */}
                    <TextField
                        variant="outlined"
                        label={t(`${SS}export.notifyEmail`)}
                        helperText={t(`${SS}export.notifyEmailHint`)}
                        value={notifyEmail}
                        onChange={(e) => setNotifyEmail(e.target.value)}
                        type="email"
                        fullWidth
                    />

                    {renderOutcome()}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={busy}>{t('common.close')}</Button>
                <Button color="primary" variant="contained" onClick={handleExport} disabled={busy || done}>
                    {t(`${SS}export.button`)}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SendSearchExportDialog;
