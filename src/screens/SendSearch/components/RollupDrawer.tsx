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

import React from 'react';
import {
    Box, Button, Table, TableBody, TableCell, TableHead, TableRow, Typography,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { DateFormats } from '../../../helpers/Constants';
import InlineBanner from '../../SmartSend/components/InlineBanner';
import {
    SS,
    SendSearchRow,
    SendProvenanceRow,
    StateTone,
    camelCaseState,
    deliveryTone,
    engagementTone,
    rowAttempts,
    rowChannelAttempt,
    sendSearchRowKey,
} from '../../../Models/DataSources/SendSearch';
import SendStatusCell from './SendStatusCell';
import VersionBadge from './VersionBadge';

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

const RollupDrawer: React.FC<Props> = ({ row, roster, provenance, onOpenAgent }) => {
    const { t, i18n } = useTranslation();
    // Same idiom as DataSources.tsx:113 — fallback 'rtl' because Hebrew is the default locale.
    const isRtl = (i18n.dir?.() ?? 'rtl') === 'rtl';

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
    const covered = roster.length;
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
                    {rollupProvenance
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
                    <Num label={t(`${SS}roster.covered`)} value={String(covered)} />
                    <Num label={t(`${SS}delivery.failed`)} value={String(failed)} tone={failed > 0 ? 'bad' : undefined} />
                    <Num label={t(`${SS}roster.viewEvidence`)} value={String(covered - noEvidence)} />
                </Box>
                <Typography component="p" style={{ fontSize: 13, color: '#5b6b7b', margin: '10px 0 0' }}>
                    {/* The caveat is part of the number, not decoration: email has no delivery receipt,
                        SMS has no open metric, a recipient may be reached on more than one channel, and
                        there are no percentages because the denominator differs per channel (`:442-443`). */}
                    {t(`${SS}drawer.coverageCaveat`)}
                </Typography>
            </Card>

            {/* The count MUST be supplied at both call sites — see the note on the tile above. */}
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
        </>
    );
};

export default RollupDrawer;
