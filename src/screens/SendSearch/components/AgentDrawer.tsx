// ═══════════════════════════════════════════════════════════════════════════════════════════
// AgentDrawer — level 2 (or level 1) drawer body for a single recipient
// (CONTRACT §4.2, `SendSearch-Mock-v3.html:359-380`).
//
// DELIVERY PATH: _delivery\SendSearch-V1\react\screens\SendSearch\components\AgentDrawer.tsx
// TARGET PATH:   ReactCode\src\screens\SendSearch\components\AgentDrawer.tsx
//
// The mock's card order is kept: verdict → channel lines → send details → provenance → actions.
// The verdict is a SENTENCE, not a status chip: the whole point of the drawer is that an operator can
// read one line to a client on the phone.
//
// What is deliberately NOT here:
//   • no percentages (the denominator differs per channel — `:443`);
//   • no reconstructed message body. The mock's "המייל שנשלח" panel (`:394-404`) is a REBUILD from
//     template + data, and V1 does not store per-recipient as-sent values (CONTRACT D5/§9). Offering
//     the button and rendering an invented email would be the strongest possible over-claim, so the
//     message level is opened only when the caller says a stored message exists.
// ═══════════════════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Box, Button, CircularProgress, Typography } from '@material-ui/core';
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
    isProvenanceSource,
    rowAttempts,
    rowChannelAttempt,
} from '../../../Models/DataSources/SendSearch';
import SendStatusCell from './SendStatusCell';
import VersionBadge from './VersionBadge';

const TONE_COLOR: { [k in StateTone]: string } = {
    ok: '#067647', bad: '#B42318', warn: '#B54708', muted: '#5b6b7b',
};

interface Props {
    row: SendSearchRow;
    provenance: SendProvenanceRow[];
    provenanceLoading: boolean;
    // Set when the Provenance fetch FAILED. A failed fetch and a genuinely empty history both arrive
    // as `provenance: []`, and the empty branch below asserts something positive about the data
    // ("the mapping was not touched, so this IS the version that was sent"). Asserting that from a
    // request that never returned is the confident-lie failure mode, so the two cases are separated.
    provenanceError?: string | null;
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

const Kv: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <Box style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '6px 0', borderBottom: '1px solid #eef1f5', fontSize: 14 }}>
        <Typography component="span" style={{ color: '#5b6b7b', fontSize: 14 }}>{label}</Typography>
        <Box style={{ fontWeight: 700 }}>{children}</Box>
    </Box>
);

const AgentDrawer: React.FC<Props> = ({ row, provenance, provenanceLoading, provenanceError }) => {
    const { t } = useTranslation();

    const attempts = rowAttempts(row);
    // NARROWED FIRST — the verdict must be built from the same narrowed value the channel lines
    // below it are built from, or the drawer contradicts itself: an out-of-domain state printed the
    // raw key `SendSearch.delivery.bounced` as the 20px headline while SendStatusCell, three lines
    // down, printed "סטטוס לא מזוהה". The old guard was null-blind as well (`null !== 'None'` is
    // true), so a NULL state threw inside `camelCaseState` and the drawer rendered nothing at all.
    const a = rowChannelAttempt(row);
    const hasEngagement = a.EngagementState !== 'None';
    const tone: StateTone = attempts.length === 0
        ? 'muted'
        : (hasEngagement ? engagementTone(a.EngagementState) : deliveryTone(a.DeliveryState));

    // The verdict line. Built by key construction from the server's normalised state — same rule as
    // SendStatusCell, no status table.
    const verdict = attempts.length === 0
        ? t(`${SS}empty.notSent`)
        : (hasEngagement
            ? t(`${SS}engagement.${camelCaseState(a.EngagementState)}`)
            : t(`${SS}delivery.${camelCaseState(a.DeliveryState)}`));

    const verdictWhen = hasEngagement ? row.EngagementAt : row.SentAt;

    return (
        <>
            {/* A row with no source row in the locked version means nothing was sent to this person —
                and the operator must not tell them "it was sent to you". Stated at the TOP, before the
                verdict, because it changes what the verdict means. */}
            {!row.HasRow && (
                <InlineBanner
                    severity="warning"
                    role="status"
                    title={t(`${SS}empty.notSent`)}
                    body={t(`${SS}version.tooltip.unverifiable`)}
                />
            )}

            <Card>
                <Typography component="div" style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.3, color: TONE_COLOR[tone] }}>
                    {verdict}
                </Typography>
                {verdictWhen && (
                    <Typography component="div" style={{ fontSize: 14, color: '#5b6b7b', marginTop: 5, direction: 'ltr', textAlign: 'right' }}>
                        {moment(verdictWhen).format(DateFormats.DATE_TIME_24)}
                    </Typography>
                )}
                <Box style={{ marginTop: 12 }}>
                    <SendStatusCell attempts={attempts} />
                </Box>
            </Card>

            <Card title={t(`${SS}drawer.sendDetails`)}>
                <Kv label={t(`${SS}col.mailing`)}>
                    <Typography component="span" style={{ fontWeight: 700 }}>{row.CampaignName}</Typography>
                </Kv>
                <Kv label={t(`${SS}col.supervisor`)}>
                    <Typography component="span" style={{ fontWeight: 700 }}>{row.SupervisorName || '—'}</Typography>
                </Kv>
                {/* The version travels WITH the send details, never in a separate tab: "which version"
                    and "when" are one answer. Never blank — VersionBadge guarantees that. */}
                <Kv label={t(`${SS}version.label`)}>
                    <VersionBadge
                        VersionNumber={row.VersionNumber}
                        ProvenanceSource={row.ProvenanceSource}
                        VersionState={row.VersionState}
                    />
                </Kv>
                <Kv label={t(`${SS}col.sent`)}>
                    <Typography component="span" style={{ fontWeight: 700, direction: 'ltr' }}>
                        {row.SentAt ? moment(row.SentAt).format(DateFormats.DATE_TIME_24) : '—'}
                    </Typography>
                </Kv>
                {row.RollupValue && (
                    <Kv label={t(`${SS}roster.gap`)}>
                        <Typography component="span" style={{ fontWeight: 700, direction: 'ltr' }}>{row.RollupValue}</Typography>
                    </Kv>
                )}
            </Card>

            {/* ── provenance history for this campaign (GET api/SendSearch/Provenance) ──
                A campaign can legitimately have MANY provenance rows: the table has no unique
                constraint on (CampaignID, Channel) precisely because a repeat send gets its own row
                (CONTRACT §2.1). So this is a LIST, newest first as the SP returns it — collapsing it
                to "the version" would hide a second send. */}
            <Card title={t(`${SS}drawer.provenance`)}>
                {provenanceLoading && <CircularProgress size={18} />}
                {!provenanceLoading && !!provenanceError && (
                    // The history could not be loaded. Say THAT — never the reassuring sentence below,
                    // which is a claim about data we do not have. Reuses the screen's existing
                    // `error.loadFailed` string rather than minting a key the JSON does not carry.
                    <Typography component="div" style={{ fontSize: 13.5, color: '#B42318', fontWeight: 700 }}>
                        {t(`${SS}error.loadFailed`)}
                    </Typography>
                )}
                {!provenanceLoading && !provenanceError && provenance.length === 0 && (
                    // An empty history is the NORMAL answer for a send that predates the provenance
                    // table — it is what makes the row 'Inferred' or 'Unverifiable' (D7). Saying so is
                    // required; an empty card would read as a failed fetch.
                    <Typography component="div" style={{ fontSize: 13.5, color: '#5b6b7b' }}>
                        {/* Same narrowing rule as the states, applied to the provenance domain, and
                            the same degrade VersionBadge uses: an out-of-domain (or NULL) source
                            becomes 'Unverifiable' — the CONSERVATIVE end of the ladder — because
                            `${SS}version.tooltip.` + an unknown word is a raw untranslated key on
                            screen, and degrading to 'Recorded'/'Inferred' would assert a confidence
                            the server never expressed. §4.1 defines exactly three tooltip keys. */}
                        {t(`${SS}version.tooltip.${camelCaseState(
                            isProvenanceSource(row.ProvenanceSource) ? row.ProvenanceSource : 'Unverifiable',
                        )}`)}
                    </Typography>
                )}
                {!provenanceLoading && provenance.map((p) => (
                    <Kv
                        key={p.SendProvenanceID}
                        label={moment(p.SentAt).format(DateFormats.DATE_TIME_24)}
                    >
                        <Box style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                            <Typography component="span" style={{ fontSize: 13.5 }}>{p.DataSourceName}</Typography>
                            <VersionBadge
                                VersionNumber={p.VersionNumber}
                                // A provenance ROW is by definition a recorded send — that is what the
                                // table is. It is the only place 'Recorded' can be asserted from the
                                // client without inventing a claim.
                                ProvenanceSource="Recorded"
                                VersionState={p.VersionState}
                                IsOutdated={p.IsOutdated}
                                LatestVersionNumber={p.LatestVersionNumber}
                            />
                        </Box>
                    </Kv>
                ))}
            </Card>
        </>
    );
};

export default AgentDrawer;
