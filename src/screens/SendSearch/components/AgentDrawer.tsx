// ═══════════════════════════════════════════════════════════════════════════════════════════
// AgentDrawer — level 2 (or level 1) drawer body for a single recipient
// (CONTRACT §4.2, `SendSearch-Mock-v3.html:359-380`).
//
// DELIVERY PATH: _delivery\SendSearch-V1\react\screens\SendSearch\components\AgentDrawer.tsx
// TARGET PATH:   ReactCode\src\screens\SendSearch\components\AgentDrawer.tsx
//
// The mock's card order is kept: verdict → channel lines → send details → provenance → values.
// The verdict is a SENTENCE, not a status chip: the whole point of the drawer is that an operator can
// read one line to a client on the phone.
//
// PER-RECIPIENT VALUES — a reversal, recorded here because this comment used to say the opposite.
// V1 said: "V1 does not store per-recipient as-sent values (CONTRACT D5/§9)", so no such card.
// That was true of a REBUILD from template + data — which is what the mock's "המייל שנשלח" panel
// (`:394-404`) is, and which would have been an invented email presented as a record.
// It was NOT true of the token VALUES: `dbo.DataSources_GetRowValuesForPreviewByClient` reads the
// row out of the LOCKED source version that was actually sent, so the values are read, not
// reconstructed. Idan reversed the decision on 2026-08-03 and the fourth card below is the result.
// The distinction the old comment was defending still holds, and still holds here:
//   • the values are shown because they were RECORDED;
//   • `HasRow = false` means there was no source row for this client, i.e. the sender emitted empty
//     strings — so the card says that IN WORDS and renders no rows at all. Printing the blank
//     values would read as "this recipient was deliberately sent empty text", which is precisely
//     the confident over-claim this header exists to forbid.
//
// What is STILL deliberately NOT here:
//   • no percentages (the denominator differs per channel — `:443`);
//   • no reconstructed message body, and no preview button — deferred by Idan's explicit decision,
//     so no preview token is minted from this screen. The message drawer level is opened only when
//     the caller says a stored message exists.
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
    SendRowValue,
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
    // ── the values this recipient actually received (GET api/SendSearch/RowValues) ───────────
    // Three props, not one, for the same reason provenance needs three: an empty list means
    // something ("the campaign has no token mapping"), a failed fetch means something else
    // ("we do not know"), and neither may be rendered as the other.
    rowValues?: SendRowValue[];
    rowValuesLoading?: boolean;
    rowValuesError?: string | null;
    // The ClientID the loaded values belong to. The store holds ONE slot; if it is not this
    // recipient's, the list is not rendered at all — see `valuesUnavailable` below.
    rowValuesClientId?: number | null;
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

const AgentDrawer: React.FC<Props> = ({
    row, provenance, provenanceLoading, provenanceError,
    rowValues, rowValuesLoading, rowValuesError, rowValuesClientId,
}) => {
    const { t } = useTranslation();

    const values: SendRowValue[] = rowValues ?? [];
    // The recipient has a source row in the sent version. `HasRow` is a per-CLIENT fact that the SP
    // repeats on every returned row, so `some` and `every` agree in practice; `some` is used because
    // the failure it guards against is rendering blanks, and one real row is enough to justify the
    // table. FALSE (or an empty list) ⇒ the sender emitted empty strings for every token, and the
    // card must say so in words instead of printing a column of blanks.
    const hasSourceRow = values.some((v) => v.HasRow);
    // The row-values fetch is keyed on ClientID. A row that arrived without one — an older server
    // that does not yet project it (B.2) — means the fetch was never dispatched, which is "we did
    // not ask", NOT "the recipient received nothing". Rendering the no-values sentence for it would
    // assert the second from the first, so it degrades to the load-failure line instead: the
    // conservative end, claiming nothing about the data.
    //
    // The second half is the anti-staleness guard: the slice holds ONE values slot, so a slot that
    // belongs to a different ClientID must not be rendered under this name. In practice the two
    // dispatches (push the drawer, fetch the values) happen in the same handler, so the id is
    // already this recipient's by first paint; the guard is for every path that does not fetch.
    const valuesUnavailable = !row.ClientID || row.ClientID <= 0 || rowValuesClientId !== row.ClientID;

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

            {/* ── the values this recipient actually received (GET api/SendSearch/RowValues) ──
                Read from the LOCKED source version that was sent, not rebuilt from the template —
                see the reversal note in the header. Order is the SERVER's (the SP already sorts by
                tm.DisplayOrder, tm.TokenMapID); this must never re-sort, or the card stops matching
                the mapping screen the operator has open beside it.
                NO preview button: deferred by decision, so this screen mints no preview token. */}
            <Card title={t(`${SS}drawer.rowValues`)}>
                {rowValuesLoading && <CircularProgress size={18} />}
                {!rowValuesLoading && (!!rowValuesError || valuesUnavailable) && (
                    // Could not load, or was never asked. Say THAT — never the no-values sentence
                    // below, which is a positive claim about data we do not have. Reuses the
                    // screen's existing `error.loadFailed` string rather than minting a key the
                    // JSON does not carry, exactly as the provenance card above does.
                    <Typography component="div" style={{ fontSize: 13.5, color: '#B42318', fontWeight: 700 }}>
                        {/* Both keys already exist in all three locales. The permission case gets its
                            own sentence because "you may not see recipient data" and "loading failed"
                            send the operator to two different places, and only one of them is a bug. */}
                        {t(rowValuesError === 'PERMISSION_DENIED'
                            ? `${SS}error.permissionDenied`
                            : `${SS}error.loadFailed`)}
                    </Typography>
                )}
                {!rowValuesLoading && !rowValuesError && !valuesUnavailable && !hasSourceRow && (
                    // HasRow = false, or an empty list (the campaign carries no token mapping).
                    // Both mean the same thing to the operator on the phone: nothing personal was
                    // filled in for this person. NO value rows are rendered in this branch — a
                    // column of blanks would read as "we sent them empty text on purpose".
                    <Typography component="div" style={{ fontSize: 13.5, color: '#5b6b7b' }}>
                        {t(`${SS}drawer.noRowValues`)}
                    </Typography>
                )}
                {!rowValuesLoading && !rowValuesError && !valuesUnavailable && hasSourceRow
                    && values.map((v, i) => (
                        <Kv key={`${v.Token}-${i}`} label={v.Token}>
                            {/* An em-dash, never an empty cell: a token that genuinely resolved to
                                '' is a real fact about the send, and a blank <Box> is indistinguishable
                                from a rendering bug. `direction: ltr` because the values are IDs,
                                policy numbers and dates — RTL would reorder their digits on screen. */}
                            <Typography component="span" style={{ fontWeight: 700, direction: 'ltr' }}>
                                {(v.Value || '').trim() !== '' ? v.Value : '—'}
                            </Typography>
                        </Kv>
                    ))}
            </Card>
        </>
    );
};

export default AgentDrawer;
