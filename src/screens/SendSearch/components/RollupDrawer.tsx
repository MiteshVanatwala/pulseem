// ═══════════════════════════════════════════════════════════════════════════════════════════
// RollupDrawer — level 1 drawer body for a roll-up (supervisor) recipient
// (CONTRACT §4.2, `SendSearch-Mock-v3.html:419-484`; roster table at `:472`).
//
// DELIVERY PATH: _delivery\SendSearch-V1\react\screens\SendSearch\components\RollupDrawer.tsx
// TARGET PATH:   ReactCode\src\screens\SendSearch\components\RollupDrawer.tsx
//
// Roster columns, exactly `:472`:  נמען | ערוצים | פער | ראיית צפייה | [action]
// A roster row is clickable and PUSHES the agent level (`:473`) — that is the rollup → agent → message
// stack the breadcrumb exists for.
//
// TWO HONESTY RULES THE MOCK MAKES NON-NEGOTIABLE, both enforced below:
//  1. NO PERCENTAGES. "אין אחוזים — המכנה שונה בכל ערוץ" (`:443`). Every number here is a COUNT.
//  2. The covered list is NOT stored with the send (`:461-463`): it is reconstructed. The banner says
//     so, in the drawer, above the roster — not in a tooltip. A reconstructed list presented as the
//     recorded one is the same class of over-claim as a blank version cell.
// ═══════════════════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box, Button, CircularProgress, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography,
} from '@material-ui/core';
import { MailOutline } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { DateFormats } from '../../../helpers/Constants';
import InlineBanner from '../../SmartSend/components/InlineBanner';
import {
    SS,
    SendSearchRow,
    SendProvenanceRow,
    SupervisorSendRow,
    SupervisorAgentRow,
    StateTone,
    camelCaseState,
    deliveryTone,
    engagementTone,
    engagementCountKind,
    rowAttempts,
    rowChannelAttempt,
    sendSearchRowKey,
} from '../../../Models/DataSources/SendSearch';
import SendStatusCell from './SendStatusCell';
import VersionBadge from './VersionBadge';
import EmailPreviewDialog from './EmailPreviewDialog';
import { previewUrlOf } from './SendSearchAdvanced';
import { getSupervisorSentEmailHtml, clearSupervisorSentHtml } from '../../../redux/reducers/sendSearchSlice';

const TONE_COLOR: { [k in StateTone]: string } = {
    ok: '#067647', bad: '#B42318', warn: '#B54708', muted: '#5b6b7b',
};

interface Props {
    // The roll-up recipient's own row (the supervisor's copy of the mailing).
    row: SendSearchRow;
    // The recipients this roll-up covered, assembled by the screen. See LEDGER: §3.2 exposes only
    // `SupervisorName` (a STRING) — there is no supervisor id on a report row — so the grouping key is
    // the name, and the banner already tells the user the roster is a reconstruction.
    roster: SendSearchRow[];
    provenance: SendProvenanceRow[];
    onOpenAgent: (row: SendSearchRow) => void;
    // ── supervisor-sends feature (all OPTIONAL, so the existing agent/rollup path is unchanged) ──
    // The supervisor's OWN send (opens/clicks/sent-HTML). When present, the top verdict card grows
    // the opens/clicks line and the "צפה במייל שנשלח" button. Absent ⇒ the card renders exactly as
    // before (a server that has not shipped SupervisorSends, or a rollup we could not match).
    supervisorSend?: SupervisorSendRow | null;
    // The RECORDED roster from GET api/SendSearch/SupervisorAgents. When PROVIDED (not undefined),
    // it REPLACES the reconstructed roster below with the authoritative one (each row offers a
    // per-agent sent-mail preview). Left undefined ⇒ the existing reconstructed roster is kept, so
    // nothing regresses on a pre-feature server.
    supervisorAgents?: SupervisorAgentRow[];
    supervisorAgentsLoading?: boolean;
    supervisorAgentsError?: string | null;
}

const Card: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => (
    <Box style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 10, padding: 17 }}>
        {title && (
            <Typography
                component="div"
                style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '.09em', color: '#5b6b7b', textTransform: 'uppercase', marginBottom: 11 }}
            >
                {title}
            </Typography>
        )}
        {children}
    </Box>
);

const Num: React.FC<{ label: string; value: string; tone?: StateTone }> = ({ label, value, tone }) => (
    <Box style={{ background: '#fff', padding: '11px 13px' }}>
        <Typography component="small" style={{ display: 'block', fontSize: 12, color: '#5b6b7b' }}>{label}</Typography>
        <Typography
            component="b"
            style={{ fontSize: 18, fontWeight: 800, fontVariantNumeric: 'tabular-nums', direction: 'ltr', color: tone ? TONE_COLOR[tone] : '#151b21' }}
        >
            {value}
        </Typography>
    </Box>
);

const RollupDrawer: React.FC<Props> = ({
    row, roster, provenance, onOpenAgent,
    supervisorSend, supervisorAgents, supervisorAgentsLoading, supervisorAgentsError,
}) => {
    const { t, i18n } = useTranslation();
    const dispatch = useDispatch();
    // Same idiom as DataSources.tsx:113 — fallback 'rtl' because Hebrew is the default locale.
    const isRtl = (i18n.dir?.() ?? 'rtl') === 'rtl';

    // The tenancy-gated sent-HTML for the supervisor's OWN mail — the SECURE viewer's content. Read
    // from the store because the "צפה במייל שנשלח" button dispatches getSupervisorSentEmailHtml (the
    // fetch is lazy — the stored HTML can be large, so it is not pulled until the operator asks to see
    // it). Cleared by the slice on drawer/dialog close and on clearSupervisorSentHtml (dialog onClose).
    const supervisorSentHtml: string | null = useSelector((s: any) => s.sendSearch?.supervisorSentHtml ?? null);
    const supervisorSentHtmlLoading: boolean = useSelector((s: any) => !!(s.sendSearch?.supervisorSentHtmlLoading));

    // ONE dialog instance, parameterised by whichever mail is being viewed. `mode` selects how the
    // dialog renders it: 'url' = an agent's server-minted PreviewCampaign.aspx URL (unchanged legacy
    // path, run through `previewUrlOf` first); 'srcDoc' = the supervisor's stored HTML fetched above,
    // rendered as a STRING (no id in a URL — the IDOR fix). `preview === null` ⇒ closed.
    const [preview, setPreview] = useState<{
        mode: 'url' | 'srcDoc'; url: string | null; name: string; email: string; sentAt: string | null;
    } | null>(null);

    // Opens/clicks as WORDS + "×N", never a percentage and never a bare "0". `engagementCountKind`
    // is the single home of that rule (Model, D10). NULL ⇒ "לא זמין" (supervisor.notAvailable);
    // 0 ⇒ the existing engagement.none; >0 ⇒ the existing engagement.opened/clicked + "×N". The
    // status WORD reuses the same i18n keys the agent card uses — no new status vocabulary.
    const countPhrase = (n: number | null, wordKey: string): string => {
        const kind = engagementCountKind(n);
        if (kind === 'unavailable') return t(`${SS}supervisor.notAvailable`);
        if (kind === 'none') return t(`${SS}engagement.none`);
        return `${t(`${SS}${wordKey}`)} · ×${n}`;
    };
    const countTone = (n: number | null): StateTone => (engagementCountKind(n) === 'count' ? 'ok' : 'muted');

    // Whether the supervisor's own sent mail can be viewed. 🔴 SECURITY FIX: this NO LONGER derives a
    // URL from SentEmailUrl (that field is now server-neutralized to null — it WAS the IDOR). The
    // button is enabled iff the send has captured HTML (HasSentHtml ⇔ SendLogId != null); the HTML
    // itself is fetched on click via the tenancy-gated thunk and rendered in-iframe via `srcDoc`.
    const canViewSupMail = !!supervisorSend?.HasSentHtml;

    // The roster is driven by the RECORDED list when the screen provided it (feature active),
    // otherwise by the reconstructed `roster` prop (unchanged legacy path). `!== undefined` and not a
    // truthiness check: an empty recorded roster is a real answer ("covered nobody") and must not
    // silently fall back to the reconstructed list.
    const useRecordedRoster = supervisorAgents !== undefined;

    // NARROWED FIRST, here and at every roster row below. Reading `row.EngagementState` raw bypassed
    // `toChannelAttempt`, so an out-of-domain value printed the untranslated key
    // `SendSearch.delivery.bounced` as the verdict headline while the channel lines underneath said
    // "סטטוס לא מזוהה"; and the guard was null-blind (`null !== 'None'` and `null !== ''` are both
    // true), so a NULL state reached `camelCaseState` and threw on `null.charAt(0)` (CONTRACT D10).
    const attempts = rowAttempts(row);
    const a = rowChannelAttempt(row);
    const hasEngagement = a.EngagementState !== 'None';
    const tone: StateTone = attempts.length === 0
        ? 'muted'
        : (hasEngagement ? engagementTone(a.EngagementState) : deliveryTone(a.DeliveryState));
    const verdict = attempts.length === 0
        ? t(`${SS}empty.notSent`)
        : (hasEngagement
            ? t(`${SS}engagement.${camelCaseState(a.EngagementState)}`)
            : t(`${SS}delivery.${camelCaseState(a.DeliveryState)}`));

    // ── coverage COUNTS (never percentages) ──
    // The counts read the NARROWED states too: a raw NULL is not 'None' and would otherwise have
    // been counted as "has viewing evidence", inflating the one number a supervisor acts on.
    //
    // CHANGED 2026-08-16. `roster` is RECONSTRUCTED from the rows on the CURRENT PAGE — the screen's
    // `rosterFor` filters `items`, which is one page (server-clamped to 200). It is a SUBSET, never a
    // total: on page 2 of a real report it is 0, and under RowKind=2 the agent rows are not in `items`
    // at all. Where the RECORDED roster exists it is the only honest denominator — otherwise these
    // tiles print a plausible number that contradicts the recorded count in the card directly beneath
    // them, which is the failure mode rule 2 at the top of this file exists to forbid.
    const recordedRoster = supervisorAgents ?? [];
    // Empty WHILE THE DEPENDENT FETCH IS IN FLIGHT, so a bare `.length` would print a confident 0 next
    // to the spinner the roster card below is showing.
    const coverageUnavailable = useRecordedRoster && (supervisorAgentsLoading || !!supervisorAgentsError);
    const covered = useRecordedRoster ? recordedRoster.length : roster.length;
    const failed = roster.filter((r) => deliveryTone(rowChannelAttempt(r).DeliveryState) === 'bad').length;
    // "ללא ראיית צפייה" is not the same as "did not read": open tracking is image-load based
    // (`:210,431`). The count is stated plainly and the caveat banner carries the meaning.
    // 'Unknown' counts as NO evidence: an unrecognised marker is not proof anyone looked.
    const noEvidence = roster.filter((r) => {
        const e = rowChannelAttempt(r).EngagementState;
        return e === 'None' || e === 'Unknown' || !r.EngagementAt;
    }).length;

    const rosterTone = (r: SendSearchRow): StateTone => {
        const ra = rowChannelAttempt(r);
        const eng = ra.EngagementState !== 'None';
        return eng ? engagementTone(ra.EngagementState) : deliveryTone(ra.DeliveryState);
    };

    const rosterEvidence = (r: SendSearchRow): string => {
        const ra = rowChannelAttempt(r);
        if (ra.EngagementState === 'None') return '—';
        const label = t(`${SS}engagement.${camelCaseState(ra.EngagementState)}`);
        return r.EngagementAt ? `${label} · ${moment(r.EngagementAt).format(DateFormats.DATE_TIME_24)}` : label;
    };

    // The version the roll-up itself was built from.
    //
    // NOT simply `provenance[0]`. `provenance` is every recorded send of this CAMPAIGN, and a campaign
    // can legitimately be sent more than once — that is exactly why the provenance table has no unique
    // constraint on (CampaignID, Channel) (CONTRACT §2.1). Taking the newest row would label an OLD
    // roll-up with the version of a LATER send: a confident, wrong version number in the one column
    // this whole feature exists to make trustworthy. Same rule as RESUME.md §3 A13 applies to the SP's
    // 'Recorded' branch — choose by TIME relative to this row's send, never TOP 1.
    //
    // So: the latest send at or before this row's SentAt. If the row has no SentAt, or every recorded
    // send post-dates it, there is no row we can honestly attribute — fall back to the report row's own
    // projection, whose ProvenanceSource the SERVER derived. Either way VersionBadge renders something.
    const rollupProvenance = (() => {
        if (!row.SentAt || provenance.length === 0) return null;
        const sentAt = moment(row.SentAt);
        let best: SendProvenanceRow | null = null;
        provenance.forEach((p) => {
            const pAt = moment(p.SentAt);
            if (pAt.isAfter(sentAt)) return;
            if (best === null || pAt.isAfter(moment(best.SentAt))) best = p;
        });
        return best as SendProvenanceRow | null;
    })();

    return (
        <>
            {/* One shared preview dialog, mounted only while a mail is being viewed (supervisor's own
                or a single agent's). Version props are the honest minimum: the sent-HTML IS the
                recorded mail, so 'Recorded'/'Available' with no version number renders "מתועד"
                (VersionBadge never blanks) — there is no template-version concept for a captured send. */}
            {preview && (
                <EmailPreviewDialog
                    open={!!preview}
                    // Closing also drops the fetched HTML from the store, so reopening the preview never
                    // flashes the previous supervisor's mail while the next fetch is in flight.
                    onClose={() => { setPreview(null); dispatch(clearSupervisorSentHtml()); }}
                    // url drives the agent path (unchanged); srcDoc+loading drive the supervisor path.
                    // Exactly one is active per `mode`, so the dialog's own precedence never mixes them.
                    url={preview.mode === 'url' ? preview.url : null}
                    srcDoc={preview.mode === 'srcDoc' ? supervisorSentHtml : undefined}
                    loading={preview.mode === 'srcDoc' ? supervisorSentHtmlLoading : undefined}
                    recipientName={preview.name}
                    recipientEmail={preview.email}
                    sentAt={preview.sentAt}
                    VersionNumber={null}
                    ProvenanceSource="Recorded"
                    VersionState="Available"
                />
            )}

            <Card>
                <Typography component="div" style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.3, color: TONE_COLOR[tone] }}>
                    {verdict}
                </Typography>
                {row.SentAt && (
                    // `direction: ltr` is for the timestamp itself; the alignment has to be branched
                    // because 'start' would resolve off that ltr, not off the page direction.
                    <Typography component="div" style={{ fontSize: 14, color: '#5b6b7b', marginTop: 5, direction: 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
                        {moment(row.SentAt).format(DateFormats.DATE_TIME_24)}
                    </Typography>
                )}
                <Box style={{ marginTop: 12 }}>
                    <SendStatusCell attempts={attempts} />
                </Box>
                <Box style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Typography component="span" style={{ fontSize: 13.5, color: '#5b6b7b' }}>{t(`${SS}version.label`)}</Typography>
                    {/* ADDED 2026-08-16. A supervisor SUMMARY mail is not a data-source send: the SP
                        emits ProvenanceSource 'Unverifiable' with DataSourceVersionID NULL for it.
                        Both branches below would state something untrue about such a row — the first
                        borrows the CAMPAIGN's provenance and hard-codes ProvenanceSource="Recorded",
                        printing "מתועד · V7" as documented fact, which is the confident-wrong-version
                        outcome the note above this block exists to forbid; the second renders the
                        Unverifiable badge, whose tooltip gives a SPECIFIC reason ("המיפוי עודכן אחרי
                        השליחה") that is false for a mail with no mapping and no version concept.
                        The honest answer is the WORD — a dash would read as "the version is empty",
                        which is a different claim. */}
                    {row.IsSupervisor
                        ? (
                            <Typography component="span" style={{ fontSize: 13.5, color: '#5b6b7b' }}>
                                {t(`${SS}supervisor.notAvailable`)}
                            </Typography>
                        )
                        : rollupProvenance
                            ? (
                                <VersionBadge
                                    VersionNumber={rollupProvenance.VersionNumber}
                                    ProvenanceSource="Recorded"
                                    VersionState={rollupProvenance.VersionState}
                                    IsOutdated={rollupProvenance.IsOutdated}
                                    LatestVersionNumber={rollupProvenance.LatestVersionNumber}
                                />
                            )
                            : (
                                <VersionBadge
                                    VersionNumber={row.VersionNumber}
                                    ProvenanceSource={row.ProvenanceSource}
                                    VersionState={row.VersionState}
                                />
                            )}
                </Box>

                {/* ── the supervisor's OWN send: opens/clicks (counts, never %) + view sent mail ──
                    Rendered only when the screen supplied the SupervisorSendRow. The labels above the
                    values are what keeps opens vs clicks legible when BOTH read "לא זמין" (null). */}
                {supervisorSend && (
                    <Box style={{ marginTop: 14, borderTop: '1px solid #eef1f5', paddingTop: 12, display: 'flex', gap: 20, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <Box>
                            <Typography component="div" style={{ fontSize: 12, color: '#5b6b7b' }}>{t(`${SS}supervisor.opens`)}</Typography>
                            <Typography component="div" style={{ fontSize: 15, fontWeight: 700, color: TONE_COLOR[countTone(supervisorSend.Opens)] }}>
                                {countPhrase(supervisorSend.Opens, 'engagement.opened')}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography component="div" style={{ fontSize: 12, color: '#5b6b7b' }}>{t(`${SS}supervisor.clicks`)}</Typography>
                            <Typography component="div" style={{ fontSize: 15, fontWeight: 700, color: TONE_COLOR[countTone(supervisorSend.Clicks)] }}>
                                {countPhrase(supervisorSend.Clicks, 'engagement.clicked')}
                            </Typography>
                        </Box>
                        {/* Beside the counts it describes. Tooltip wraps a <span> so a DISABLED button
                            (null url/SendLogId) still shows why — a disabled button emits no pointer
                            events (same idiom as AgentDrawer). Disabled ⇒ the "לא זמין" caption too. */}
                        <Box style={{ marginInlineStart: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                            {!canViewSupMail && (
                                <Typography component="span" style={{ fontSize: 12.5, color: '#5b6b7b' }}>
                                    {t(`${SS}supervisor.notAvailable`)}
                                </Typography>
                            )}
                            <Tooltip title={(canViewSupMail ? t(`${SS}preview.button`) : t(`${SS}preview.disabled`)) as string}>
                                <span>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        color="primary"
                                        disabled={!canViewSupMail}
                                        startIcon={<MailOutline />}
                                        onClick={() => {
                                            if (!supervisorSend?.SendLogId) return;
                                            // Fetch the stored HTML (tenancy-gated) and open the dialog
                                            // in srcDoc mode. The id travels in the POST body, NEVER a URL.
                                            dispatch(getSupervisorSentEmailHtml(supervisorSend.SendLogId));
                                            setPreview({
                                                mode: 'srcDoc',
                                                url: null,
                                                name: supervisorSend.SupervisorName || row.RecipientName,
                                                email: supervisorSend.SupervisorEmail || row.RecipientEmail,
                                                sentAt: supervisorSend.SentDate ?? row.SentAt,
                                            });
                                        }}
                                    >
                                        {t(`${SS}preview.button`)}
                                    </Button>
                                </span>
                            </Tooltip>
                        </Box>
                    </Box>
                )}
            </Card>

            <Card title={t(`${SS}drawer.coverage`)}>
                <Box
                    style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(112px,1fr))', gap: 1,
                        background: '#e0e0e0', border: '1px solid #e0e0e0', borderRadius: 8, overflow: 'hidden',
                    }}
                >
                    {/* `roster.title` is "{{count}} הנמענים שהריכוז כיסה" — a SENTENCE with an
                        interpolated count. Using it as the label of a tile whose value is that same
                        count printed the placeholder verbatim ("{{count}} הנמענים…" next to "12"),
                        because i18next leaves an unsupplied variable in place rather than throwing.
                        The tile needs a bare noun, so it uses its own key. */}
                    <Num
                        label={t(`${SS}roster.covered`)}
                        value={coverageUnavailable ? (t(`${SS}supervisor.notAvailable`) as string) : String(covered)}
                    />
                    {/* CHANGED 2026-08-16. Delivery and viewing evidence can only be derived from GRID
                        rows, i.e. from the page-scoped reconstruction. Beside a RECORDED roster they
                        would be a subset presented as a total, so on that path they are not printed at
                        all rather than printed wrong. The recorded roster card below states the covered
                        list itself, name by name. Restoring these two for real needs a per-supervisor
                        delivery/engagement aggregate from the server — a SupervisorAgentRow carries
                        neither — which is a separate piece of work, not a line here. */}
                    {!useRecordedRoster && (
                        <Num label={t(`${SS}delivery.failed`)} value={String(failed)} tone={failed > 0 ? 'bad' : undefined} />
                    )}
                    {!useRecordedRoster && (
                        <Num label={t(`${SS}roster.viewEvidence`)} value={String(covered - noEvidence)} />
                    )}
                </Box>
                <Typography component="p" style={{ fontSize: 13, color: '#5b6b7b', margin: '10px 0 0' }}>
                    {/* The caveat is part of the number, not decoration: email has no delivery receipt,
                        SMS has no open metric, a recipient may be reached on more than one channel, and
                        there are no percentages because the denominator differs per channel (`:442-443`). */}
                    {t(`${SS}drawer.coverageCaveat`)}
                </Typography>
            </Card>

            {/* LEGACY roster — reconstructed by name-match, kept intact for the pre-feature path.
                Rendered only when the screen did NOT supply the recorded roster (see useRecordedRoster).
                The count MUST be supplied at both call sites — see the note on the tile above. */}
            {!useRecordedRoster && (
            <Card title={t(`${SS}roster.title`, { count: covered })}>
                <InlineBanner
                    severity="info"
                    role="status"
                    title={t(`${SS}roster.title`, { count: covered })}
                    body={t(`${SS}drawer.rosterReconstructed`)}
                />
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell align="right">{t(`${SS}roster.recipient`)}</TableCell>
                            <TableCell align="right">{t(`${SS}roster.channels`)}</TableCell>
                            <TableCell align="right">{t(`${SS}roster.gap`)}</TableCell>
                            <TableCell align="right">{t(`${SS}roster.viewEvidence`)}</TableCell>
                            <TableCell align="right" />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {roster.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="right">
                                    <Typography component="span" style={{ fontSize: 13, color: '#5b6b7b' }}>
                                        {t(`${SS}empty.noResults`)}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                        {roster.map((r) => (
                            <TableRow
                                key={sendSearchRowKey(r)}
                                hover
                                style={{ cursor: 'pointer' }}
                                onClick={() => onOpenAgent(r)}
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenAgent(r); } }}
                            >
                                <TableCell align="right">
                                    <Typography component="div" style={{ fontSize: 14 }}>{r.RecipientName}</Typography>
                                    <Typography component="div" style={{ fontSize: 12, color: '#5b6b7b', direction: 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
                                        {r.RecipientEmail}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right"><SendStatusCell attempts={rowAttempts(r)} dense /></TableCell>
                                <TableCell align="right" style={{ direction: 'ltr' }}>{r.RollupValue || '—'}</TableCell>
                                <TableCell
                                    align="right"
                                    style={{ color: TONE_COLOR[rosterTone(r)], fontWeight: rosterEvidence(r) === '—' ? 400 : 700 }}
                                >
                                    {rosterEvidence(r)}
                                </TableCell>
                                <TableCell align="right">
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={(e) => { e.stopPropagation(); onOpenAgent(r); }}
                                    >
                                        {t(`${SS}action.view`)}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
            )}

            {/* RECORDED roster — the authoritative agents from GET api/SendSearch/SupervisorAgents.
                No "reconstructed" caveat: unlike the legacy list this IS the send-log record. Each row
                offers a direct sent-mail preview (the point of the feature) rather than opening the
                agent drawer, since a SupervisorAgentRow is not a SendSearchRow. Honest states: a failed
                fetch says "load failed", never renders as an empty roster. */}
            {useRecordedRoster && (
            <Card title={t(`${SS}roster.title`, { count: (supervisorAgents ?? []).length })}>
                {supervisorAgentsLoading && <CircularProgress size={18} />}
                {!supervisorAgentsLoading && !!supervisorAgentsError && (
                    <Typography component="div" style={{ fontSize: 13.5, color: '#B42318', fontWeight: 700 }}>
                        {t(supervisorAgentsError === 'PERMISSION_DENIED'
                            ? `${SS}error.permissionDenied`
                            : `${SS}error.loadFailed`)}
                    </Typography>
                )}
                {!supervisorAgentsLoading && !supervisorAgentsError && (
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell align="right">{t(`${SS}roster.recipient`)}</TableCell>
                                <TableCell align="right" />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(supervisorAgents ?? []).length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={2} align="right">
                                        <Typography component="span" style={{ fontSize: 13, color: '#5b6b7b' }}>
                                            {t(`${SS}empty.noResults`)}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                            {(supervisorAgents ?? []).map((ag) => {
                                const agName = [ag.FirstName, ag.LastName].filter((v) => !!v).join(' ');
                                const agUrl = previewUrlOf({ PreviewUrl: ag.PreviewLink });
                                return (
                                    <TableRow key={`${ag.ClientID}-${ag.Email}`}>
                                        <TableCell align="right">
                                            <Typography component="div" style={{ fontSize: 14 }}>{agName || ag.Email}</Typography>
                                            <Typography component="div" style={{ fontSize: 12, color: '#5b6b7b', direction: 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
                                                {ag.Email}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title={(agUrl ? t(`${SS}preview.button`) : t(`${SS}preview.disabled`)) as string}>
                                                <span>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        disabled={!agUrl}
                                                        startIcon={<MailOutline />}
                                                        onClick={() => setPreview({
                                                            mode: 'url', url: agUrl, name: agName || ag.Email, email: ag.Email, sentAt: null,
                                                        })}
                                                    >
                                                        {t(`${SS}preview.button`)}
                                                    </Button>
                                                </span>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </Card>
            )}
        </>
    );
};

export default RollupDrawer;
