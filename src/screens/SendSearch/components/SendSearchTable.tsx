// ═══════════════════════════════════════════════════════════════════════════════════════════
// SendSearchTable — the main result grid (CONTRACT §4.2, `SendSearch-Mock-v3.html:200-212`).
//
// DELIVERY PATH: _delivery\SendSearch-V1\react\screens\SendSearch\components\SendSearchTable.tsx
// TARGET PATH:   ReactCode\src\screens\SendSearch\components\SendSearchTable.tsx
//
// COLUMN ORDER (`Mock-v3:204`) plus the new version column:
//   נמען | מפקח | דיוור | ערוצים ותוצאה | הראיה האחרונה | ‹גרסה› | נשלח | [action]
// The version column sits IMMEDIATELY BEFORE נשלח — CONTRACT §4.2, non-negotiable: the version and
// the send time are one thought ("what was sent, when"), and separating them is what let a
// wrong-version send go unnoticed.
//
// A whole row is clickable (`:299` — "לחיצה על שורה פותחת פירוט"). A supervisor / roll-up recipient
// opens the ROLL-UP drawer; everyone else opens the AGENT drawer.
//
// NO PERCENTAGES anywhere and NO cross-channel matrix cell (§4.2 / `:443`).
// ═══════════════════════════════════════════════════════════════════════════════════════════

import React from 'react';
import {
    Box, Button, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination,
    TableRow, Typography,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { DateFormats } from '../../../helpers/Constants';
import {
    SS,
    SendSearchRow,
    StateTone,
    camelCaseState,
    deliveryTone,
    engagementTone,
    rowAttempts,
    rowChannelAttempt,
    sendSearchRowKey,
    PAGE_SIZE_OPTIONS,
} from '../../../Models/DataSources/SendSearch';
import SendStatusCell from './SendStatusCell';
import VersionBadge from './VersionBadge';

const TONE_COLOR: { [k in StateTone]: string } = {
    ok: '#067647', bad: '#B42318', warn: '#B54708', muted: '#5b6b7b',
};

interface Props {
    items: SendSearchRow[];
    totalCount: number;
    pageIndex: number;      // 0-based, as the SP is
    pageSize: number;
    loading: boolean;
    hasFilter: boolean;
    onOpenRow: (row: SendSearchRow) => void;
    onPageChange: (pageIndex: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    onClearAll: () => void;
}

const fmt = (iso: string | null): string => (iso ? moment(iso).format(DateFormats.DATE_TIME_24) : '—');

const SendSearchTable: React.FC<Props> = ({
    items, totalCount, pageIndex, pageSize, loading, hasFilter,
    onOpenRow, onPageChange, onPageSizeChange, onClearAll,
}) => {
    const { t } = useTranslation();

    // The left/leading stripe encodes WHAT KIND of row this is (`Mock-v3:78-80`):
    //   blue  (--blue)  roll-up / supervisor recipient
    //   amber (--warn)  synthetic — no source row; the record was created by the engagement itself
    //   red   (--risk)  no row in the locked source version at all ⇒ nothing was sent to this person
    // Checked in that order: a supervisor row is a roll-up first and foremost.
    const stripe = (r: SendSearchRow): string | undefined => {
        if (r.IsSupervisor) return '#0371AD';
        if (r.IsSynthetic) return '#B54708';
        if (!r.HasRow) return '#B42318';
        return undefined;
    };

    // "הראיה האחרונה" — the strongest thing we can prove about this row, in words. Built by key
    // CONSTRUCTION from the server's normalised state, exactly like SendStatusCell; there is no
    // status table here either.
    const renderEvidence = (r: SendSearchRow) => {
        const attempts = rowAttempts(r);
        if (attempts.length === 0) {
            // Nothing was attempted. `empty.notSent` says so; a dash would not.
            return (
                <Typography component="span" style={{ fontSize: 13, color: '#5b6b7b' }}>
                    {t(`${SS}empty.notSent`)}
                </Typography>
            );
        }
        // NARROWED FIRST — never build a key from the raw row. Reading `r.EngagementState` here
        // bypassed `toChannelAttempt`, so this cell and the SendStatusCell beside it disagreed about
        // the same value: 'Bounced' rendered "סטטוס לא מזוהה" there and the literal untranslated key
        // `SendSearch.delivery.bounced` here. The old guard was also null-blind — `null !== 'None'`
        // and `null !== ''` are both TRUE, so a NULL state passed straight into `camelCaseState` and
        // threw on `null.charAt(0)`, taking the whole grid down (CONTRACT D10).
        const a = rowChannelAttempt(r);
        const hasEngagement = a.EngagementState !== 'None';
        const label = hasEngagement
            ? t(`${SS}engagement.${camelCaseState(a.EngagementState)}`)
            : t(`${SS}delivery.${camelCaseState(a.DeliveryState)}`);
        const tone: StateTone = hasEngagement ? engagementTone(a.EngagementState) : deliveryTone(a.DeliveryState);
        const when = hasEngagement ? r.EngagementAt : r.SentAt;
        return (
            <Box style={{ lineHeight: 1.35 }}>
                <Typography
                    component="div"
                    style={{ fontSize: 13.5, fontWeight: tone === 'muted' ? 400 : 700, color: TONE_COLOR[tone] }}
                >
                    {label}
                </Typography>
                {when && (
                    <Typography component="div" style={{ fontSize: 12, color: '#5b6b7b', direction: 'ltr' }}>
                        {fmt(when)}
                    </Typography>
                )}
            </Box>
        );
    };

    const renderRow = (r: SendSearchRow) => {
        const leading = stripe(r);
        return (
            <TableRow
                key={sendSearchRowKey(r)}
                hover
                onClick={() => onOpenRow(r)}
                // Keyboard parity for a clickable row: the mock is mouse-only, but a row that is the
                // ONLY way into the drawer must be reachable without a mouse.
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenRow(r); } }}
                style={{ cursor: 'pointer' }}
            >
                {/* ── נמען ── name + (email · cellphone) beneath, the contact line forced LTR ── */}
                <TableCell
                    align="right"
                    style={{ minWidth: 230, boxShadow: leading ? `inset 3px 0 0 ${leading}` : undefined }}
                >
                    <Box style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Typography component="span" style={{ fontWeight: 700 }}>{r.RecipientName}</Typography>
                        {r.IsSupervisor && (
                            <Chip
                                size="small"
                                // `badge.supervisor` ("מפקח"), NOT `kind.rollup` — that key is the
                                // FILTER label ("מפקחים בלבד") and rendering it here put a filter
                                // caption next to a person's name.
                                label={t(`${SS}badge.supervisor`)}
                                style={{ backgroundColor: '#E7F1F8', color: '#0371AD', fontWeight: 800, fontSize: 11.5 }}
                            />
                        )}
                    </Box>
                    <Typography
                        component="div"
                        style={{ color: '#5b6b7b', fontSize: 12.5, direction: 'ltr', textAlign: 'right' }}
                    >
                        {[r.RecipientEmail, r.RecipientCellphone].filter((v) => !!v).join(' · ')}
                    </Typography>
                </TableCell>

                {/* ── מפקח ── */}
                <TableCell align="center">
                    {r.SupervisorName
                        ? <Typography component="span" style={{ fontSize: 14 }}>{r.SupervisorName}</Typography>
                        : <Typography component="span" style={{ color: '#a8b2bb' }}>—</Typography>}
                </TableCell>

                {/* ── דיוור ── */}
                <TableCell align="center">
                    <Typography component="span" style={{ fontSize: 14 }}>{r.CampaignName}</Typography>
                </TableCell>

                {/* ── ערוצים ותוצאה ── one line per channel actually attempted; no dash matrix ── */}
                <TableCell align="right">
                    <SendStatusCell attempts={rowAttempts(r)} />
                </TableCell>

                {/* ── הראיה האחרונה ── */}
                <TableCell align="center">{renderEvidence(r)}</TableCell>

                {/* ── גרסה ── IMMEDIATELY BEFORE נשלח (CONTRACT §4.2). Never blank. ── */}
                <TableCell align="center">
                    <VersionBadge
                        VersionNumber={r.VersionNumber}
                        ProvenanceSource={r.ProvenanceSource}
                        VersionState={r.VersionState}
                    />
                </TableCell>

                {/* ── נשלח ── */}
                <TableCell align="center" style={{ direction: 'ltr', fontSize: 13.5 }}>
                    {fmt(r.SentAt)}
                </TableCell>

                {/* ── action ── the row is clickable; this is the affordance, not a second path.
                    stopPropagation is deliberate: without it the row handler fires too and the
                    drawer would be pushed twice, which under the depth cap silently swallows the
                    second push and looks like a dead button. */}
                <TableCell align="center">
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => { e.stopPropagation(); onOpenRow(r); }}
                    >
                        {t(`${SS}${r.IsSupervisor ? 'action.viewRollup' : 'action.view'}`)}
                    </Button>
                </TableCell>
            </TableRow>
        );
    };

    const renderHead = () => (
        <TableHead>
            <TableRow>
                <TableCell align="right">{t(`${SS}col.recipient`)}</TableCell>
                <TableCell align="center">{t(`${SS}col.supervisor`)}</TableCell>
                <TableCell align="center">{t(`${SS}col.mailing`)}</TableCell>
                <TableCell align="center">{t(`${SS}col.channelsAndResult`)}</TableCell>
                <TableCell align="center">{t(`${SS}col.lastEvidence`)}</TableCell>
                <TableCell align="center">{t(`${SS}version.label`)}</TableCell>
                <TableCell align="center">{t(`${SS}col.sent`)}</TableCell>
                <TableCell align="center" />
            </TableRow>
        </TableHead>
    );

    // An empty grid must say WHICH empty it is. With filters on, the answer is "no match" and the
    // way out is offered; the loading case is handled by the caller's Loader, so this never flashes
    // during a fetch.
    const renderEmpty = () => (
        <Box style={{ textAlign: 'center', padding: '48px 16px', color: '#5b6b7b' }}>
            <Typography style={{ fontSize: 18, fontWeight: 600 }}>{t(`${SS}empty.noResults`)}</Typography>
            {hasFilter && (
                <Button onClick={onClearAll} style={{ marginTop: 12 }}>{t(`${SS}clearAll`)}</Button>
            )}
        </Box>
    );

    if (!loading && items.length === 0) return renderEmpty();

    return (
        <>
            <TableContainer style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 10 }}>
                <Table style={{ minWidth: 1120 }}>
                    {renderHead()}
                    <TableBody>{items.map(renderRow)}</TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                component="div"
                count={totalCount}
                page={pageIndex}
                onPageChange={(_: any, page: number) => onPageChange(page)}
                rowsPerPage={pageSize}
                onRowsPerPageChange={(e: any) => onPageSizeChange(parseInt(e.target.value, 10))}
                rowsPerPageOptions={PAGE_SIZE_OPTIONS}
            />
        </>
    );
};

export default SendSearchTable;
