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
    SendSearchCampaignSource,
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
import { sortValueDisplayOf } from './SendSearchAdvanced';

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
    // ── the sort-value column (CONTRACT §2) ──────────────────────────────────────────────────
    // The DISPLAY NAME of the field the grid is currently sorted by, or null for the server's
    // default order. When set, one extra column appears showing `row.SortValueDisplay` — the raw
    // value the server actually sorted on.
    //
    // WHY THE COLUMN IS MANDATORY WHEN SORTING BY A HIDDEN FIELD: the user can sort by any
    // searchable column, and almost none of them are columns of this grid. Without this cell the
    // rows simply reorder for no visible reason — indistinguishable, on screen, from a paging bug —
    // and the user cannot check that the ordering is the one they asked for. §2 requires it on RS1,
    // MapRow, both row models and the channel≠1 stub for exactly this reason; this is its render.
    sortFieldLabel?: string | null;

    // ── data-source identity (52-SearchSends-SourceColumn.sql, result set 3) ─────────────────
    // The map for THIS result set. Rows carry `EffectiveDataSourceID`; the name is joined here.
    sources?: SendSearchCampaignSource[];
    // 🔴 THE GATE. false ⇒ the server has not shipped 52_ ⇒ render NO source line at all. It must
    // never degrade into a line reading "unknown source" on every row: that is a claim about the
    // DATA, made from a fact about the DEPLOYMENT.
    sourcesAvailable?: boolean;
}

const fmt = (iso: string | null): string => (iso ? moment(iso).format(DateFormats.DATE_TIME_24) : '—');

// Screen-reader-only. Written out rather than imported: `visuallyHidden` is MUI v5, this is v4.
const SR_ONLY: React.CSSProperties = {
    position: 'absolute', width: 1, height: 1, padding: 0, margin: -1,
    overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0,
};

const SendSearchTable: React.FC<Props> = ({
    items, totalCount, pageIndex, pageSize, loading, hasFilter,
    onOpenRow, onPageChange, onPageSizeChange, onClearAll, sortFieldLabel,
    sources, sourcesAvailable,
}) => {
    const { t, i18n } = useTranslation();
    // Same idiom as DataSources.tsx:113 — fallback 'rtl' because Hebrew is the default locale.
    const isRtl = (i18n.dir?.() ?? 'rtl') === 'rtl';

    // ── data-source line ─────────────────────────────────────────────────────────────────────
    // Built once per render, not per row: 50 rows × a linear scan would be 50 scans of the map.
    const srcList: SendSearchCampaignSource[] = sources ?? [];
    const srcById: { [id: number]: SendSearchCampaignSource } = {};
    srcList.forEach((s) => { srcById[s.DataSourceID] = s; });

    // Which NAMES are carried by more than one id. Case-folded and trimmed, because "תיק סוכן" and
    // "תיק סוכן " are the same name to a reader and the filtered unique index does not stop them
    // from coexisting once one side is deleted.
    //
    // This drives EMPHASIS only — never whether the id is shown. The id is unconditional: this map
    // covers the filtered result, so a search returning only the deleted twin contains no collision,
    // and a conditional id would vanish exactly where it is most needed while its absence read as a
    // positive claim of uniqueness.
    const nameCounts: { [name: string]: number } = {};
    srcList.forEach((s) => {
        const key = (s.DataSourceName ?? '').trim().toLowerCase();
        if (key === '') return;
        nameCounts[key] = (nameCounts[key] || 0) + 1;
    });

    const renderSourceLine = (r: SendSearchRow) => {
        // The gate. Absent flag ⇒ the SERVER cannot tell us ⇒ no line at all. Never a line that
        // asserts something about the data from a fact about the deployment.
        if (!sourcesAvailable) return null;

        const id = r.EffectiveDataSourceID;
        const src = id != null ? srcById[id] : undefined;
        const name = src ? src.DataSourceName : null;
        const isDeleted = !!(src && src.IsDeleted);
        const collides = !!(name && nameCounts[name.trim().toLowerCase()] > 1);

        // 🔴 WHERE THE ID CAME FROM, and this qualifier is not cosmetic.
        // The server resolves it as COALESCE(provenance.DataSourceID, mapping.DataSourceID). The
        // first arm is a RECORD of the send. The second is the mapping AS IT IS NOW — and
        // dbo.CampaignsToDataSources has PK (CampaignID, Channel) with no history, so re-pointing a
        // campaign is an in-place UPDATE that erases what it used to be.
        //
        // So on a row the SP already graded 'Unverifiable' (the mapping was touched after the send),
        // an unqualified source name is a confident claim about which file was sent — asserted from
        // a mapping that may since have been pointed somewhere else entirely. That is exactly the
        // failure this screen exists to prevent, and it is NOT covered by the provenance badge three
        // cells away: this line reads as an independent statement.
        //
        // The qualifier names the SOURCE OF THE FACT ("according to the mapping"), deliberately NOT
        // a certainty word. The certainty ladder (מתועד/משוחזר/לא ניתן לאימות) stays the exclusive
        // vocabulary of the version cell; adding a fourth term here would make the reader count two
        // findings where there is one.
        const fromRecord = r.ProvenanceSource === 'Recorded';

        // Six states, six different appearances. (ה) and (ו) differ STRUCTURALLY — one has no
        // number, the other has one — so a screenshot can tell them apart.
        let body: React.ReactNode;
        let a11y: string;
        if (id == null) {
            // (ה) no source recorded at all. A record fact, NOT a certainty verdict: the words
            // "לא ניתן לאימות" belong to the version cell and must not be echoed three cells away,
            // or the reader counts two findings where there is one.
            body = <span style={{ fontSize: 12, color: '#5b6b7b' }}>{t(`${SS}source.noRecord`)}</span>;
            a11y = t(`${SS}source.a11y.cellNoRecord`);
        } else if (!src || name === null) {
            // (ו) we have an id, the map has no entry for it. Different from (ה): there ARE digits.
            body = (
                <>
                    <span dir="ltr" style={{ direction: 'ltr', unicodeBidi: 'isolate', fontSize: 11.5, color: '#5b6b7b' }}>{`#${id}`}</span>
                    <span style={{ fontSize: 12, color: '#5b6b7b' }}>{` · ${t(`${SS}source.nameNotFound`)}`}</span>
                </>
            );
            a11y = t(`${SS}source.a11y.cellNameNotFound`, { id });
        } else {
            // (א)/(ב)/(ג). `<bdi>` is first-strong isolation: a Hebrew name renders RTL, an
            // "AgentPortfolio_Q3" renders LTR, and neither drags the label or the number to the
            // wrong end. Setting direction on the whole row instead would reorder the Hebrew.
            body = (
                <>
                    <bdi style={{
                        flex: '1 1 auto', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap', fontSize: 12, fontWeight: 500, color: '#5b6b7b',
                    }}>{name === '' ? t(`${SS}source.nameNotFound`) : name}</bdi>
                    <span dir="ltr" style={{
                        flex: '0 0 auto', direction: 'ltr', unicodeBidi: 'isolate', fontSize: 11.5,
                        color: '#5b6b7b', fontVariantNumeric: 'tabular-nums',
                        fontWeight: collides ? 700 : 400,
                    }}>{`#${id}`}</span>
                </>
            );
            a11y = isDeleted
                ? t(fromRecord ? `${SS}source.a11y.cellDeleted` : `${SS}source.a11y.cellDeletedMapped`, { name, id })
                : t(fromRecord ? `${SS}source.a11y.cell` : `${SS}source.a11y.cellMapped`, { name, id });
        }

        return (
            <>
                <Box aria-hidden style={{
                    display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2,
                    direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left',
                }}>
                    {/* The chip REPLACES the "מקור:" label rather than trailing the name: it then
                        carries the noun, forms a vertical rule of identical rectangles at one x for
                        a 50-row scan, and is never the part the ellipsis eats (`flex:'0 0 auto'` —
                        only the <bdi> shortens).
                        borderRadius 3 + a border is deliberately the OPPOSITE shape language to
                        every other chip on this screen (radius 11, borderless), so the shape itself
                        is a carrier and the signal does not rest on colour — WCAG 1.4.1.
                        NEVER the warn palette (#B54708/#FCF0E6): that pair means "we cannot vouch
                        for which version was sent". Deletion is a certain lifecycle fact, and
                        painting it as a warning raises an alarm on a row that may read "מתועד". */}
                    {isDeleted ? (
                        <span style={{
                            flex: '0 0 auto', fontSize: 11, fontWeight: 800, lineHeight: '15px',
                            color: '#3b4754', background: '#EDF0F3', border: '1px solid #838F9B',
                            borderRadius: 3, padding: '0 5px', whiteSpace: 'nowrap',
                        }}>{t(fromRecord ? `${SS}source.deletedChip` : `${SS}source.deletedChipMapped`)}</span>
                    ) : (
                        <span style={{ flex: '0 0 auto', fontSize: 12, color: '#5b6b7b' }}>
                            {t(fromRecord ? `${SS}source.prefix` : `${SS}source.prefixMapped`)}
                        </span>
                    )}
                    {body}
                </Box>
                {/* The visual row is aria-hidden and the whole fact is spoken as one sentence:
                    a screen reader announcing "hash 412" out of a flex row is noise, and
                    "מזהה 412" inside a sentence is the same fact, usable. */}
                <span style={SR_ONLY}>{a11y}</span>
            </>
        );
    };

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
                        /* `direction: ltr` keeps the "email · phone" run from reordering, but it also
                           makes textAlign:'start' resolve to LEFT — so the page-start alignment has
                           to be branched explicitly. Physical 'right' left the contact line hugging
                           the end edge under en/pl while the name above it sat at the start edge. */
                        style={{ color: '#5b6b7b', fontSize: 12.5, direction: 'ltr', textAlign: isRtl ? 'right' : 'left' }}
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

                {/* ── דיוור ── campaign, and under it the DATA SOURCE the send came from ──
                    align="right", not "center": two lines of different lengths with no shared axis
                    read as floating caption rather than as one cell. The header (:252) moves with it.

                    The source line answers a question the grid could not answer before: the version
                    cell says "גרסה 3" without saying "of what". With one source that was tolerable;
                    with ten it misleads on an audit artifact. */}
                <TableCell align="right">
                    <Typography component="div" style={{ fontSize: 14, fontWeight: 600, color: '#3b4754' }}>
                        {r.CampaignName}
                    </Typography>
                    {renderSourceLine(r)}
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

                {/* ── ערך המיון ── present ONLY while a sort field is chosen ──
                    `direction:'ltr'` because the values are ids, policy numbers, amounts and dates —
                    RTL reorders their digits and the operator would read a different number than the
                    one the server sorted on. An ABSENT value says "אין ערך" in words rather than
                    showing a dash: a row with no value for the sort field is sorted into a group
                    (§2 `SortIsUnknown`), and a dash would read as "the value is empty", which is a
                    different fact. */}
                {!!sortFieldLabel && (
                    <TableCell align="center" style={{ direction: 'ltr', fontSize: 13.5 }}>
                        {sortValueDisplayOf(r) ?? (
                            <Typography component="span" style={{ fontSize: 12.5, color: '#a8b2bb' }}>
                                {t(`${SS}sort.unknownValue`)}
                            </Typography>
                        )}
                    </TableCell>
                )}

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
                {/* align="right" to match the body cell, which now holds two lines of different
                    lengths and needs a shared start axis. One start-aligned column among centred
                    ones is a conscious cost — a floating second line is worse. */}
                <TableCell align="right">{t(`${SS}col.mailing`)}</TableCell>
                <TableCell align="center">{t(`${SS}col.channelsAndResult`)}</TableCell>
                <TableCell align="center">{t(`${SS}col.lastEvidence`)}</TableCell>
                <TableCell align="center">{t(`${SS}version.label`)}</TableCell>
                <TableCell align="center">{t(`${SS}col.sent`)}</TableCell>
                {/* The header NAMES the field being sorted on ("ערך המיון · מספר פוליסה"). A generic
                    "ערך המיון" would leave the user to guess which of their columns produced it. */}
                {!!sortFieldLabel && (
                    <TableCell align="center">
                        {`${t(`${SS}col.sortValue`)} · ${sortFieldLabel}`}
                    </TableCell>
                )}
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
