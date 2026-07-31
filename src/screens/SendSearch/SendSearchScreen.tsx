// ═══════════════════════════════════════════════════════════════════════════════════════════
// SendSearchScreen (חיפוש שליחות) — V1 (CONTRACT §4.2).
//
// DELIVERY PATH: _delivery\SendSearch-V1\react\screens\SendSearch\SendSearchScreen.tsx
// TARGET PATH:   ReactCode\src\screens\SendSearch\SendSearchScreen.tsx
//
// Route registration in `App.js` is REACT-PATCH's patch (§4.4.3); this file declares nothing about
// routing. The slice is registered under the key `sendSearch` by REACT-PATCH (§4.3).
//
// Built from `SendSearch-Mock-v3.html`. Layout: title → filters → count line → grid → the two
// standing caveats (`:209-212`) → drawer stack.
//
// Shape and conventions follow the house style of `screens/SmartSend/SmartSendScreen.tsx` and
// `screens/DataSources/SmartSendManageTab.tsx`: `({ classes }: ClassesType)`, `DefaultScreen`
// wrapper, `useTranslation`, `useSelector`/`useDispatch`, MUI v4 core only, `Loader` for the
// in-flight state, and the feature gate + `Redirect` pattern from SmartSendScreen.tsx:111-122.
// ═══════════════════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import DefaultScreen from '../DefaultScreen';
import { ClassesType } from '../Classes.types';
import { Loader } from '../../components/Loader/Loader';
import useRedirect from '../../helpers/Routes/Redirect';
import { sitePrefix } from '../../config';
import { PulseemFeatures } from '../../model/PulseemFields/Fields';
import InlineBanner from '../SmartSend/components/InlineBanner';
import {
    searchSends, getSendProvenance,
    setFilters, setPageIndex, setPageSize, clearFilters,
    pushDrawer, popDrawer, closeDrawer,
} from '../../redux/reducers/sendSearchSlice';
import {
    SS,
    SendSearchRow,
    SendSearchFilters as Filters,
    DrawerEntry,
    eRowKind,
    eRoleFilter,
    sendSearchRowKey,
    toSendSearchRequest,
} from '../../Models/DataSources/SendSearch';
import SendSearchFiltersBar, { CampaignOption } from './components/SendSearchFilters';
import SendSearchTable from './components/SendSearchTable';
import AgentDrawer from './components/AgentDrawer';
import RollupDrawer from './components/RollupDrawer';
import DrawerStack from './components/DrawerStack';

const SendSearchScreen = ({ classes }: ClassesType) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const Redirect = useRedirect();

    const { accountFeatures } = useSelector((state: any) => state.common);
    const isRTL = useSelector((state: any) => state.core && state.core.isRTL);
    const sendSearch = useSelector((state: any) => state.sendSearch);

    const filters: Filters = sendSearch.filters;
    const items: SendSearchRow[] = sendSearch.items ?? [];
    const drawerStack: DrawerEntry[] = sendSearch.drawerStack ?? [];

    // Feature gate — identical to SmartSendScreen.tsx:111-122, including the two traps documented
    // there: `accountFeatures?.length &&` (the cookie-backed list is null until it loads, and a bare
    // truthiness check would let an unentitled user through on `undefined`) and `sitePrefix ?? ''`
    // (it comes straight from process.env and is `string | undefined`).
    // CONTRACT §7 notes the deployed gate is feature 76 via `AccountFeatures` while the mirror shows
    // `FeatureTierLogic` — this screen depends on NEITHER: it reuses the same DATA_SOURCES entitlement
    // the rest of the feature already gates on, so there is nothing here to "fix" later.
    useEffect(() => {
        if (accountFeatures?.length && accountFeatures.indexOf(PulseemFeatures.DATA_SOURCES) === -1) {
            Redirect({ url: sitePrefix ?? '', openNewTab: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accountFeatures]);

    // One fetch per committed filter object. The free-text box is local state inside the filter bar
    // until "חפש"/Enter commits it, so typing never fires a request; every OTHER control commits
    // immediately, which is what the mock does (its selects call applyF() directly).
    useEffect(() => {
        dispatch(searchSends(toSendSearchRequest(filters)));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, filters]);

    // Campaign dropdown options. §3.3 defines no campaign-list endpoint, so the options are the
    // distinct campaigns present in the CURRENT result set. Consequence, stated plainly: the list can
    // only offer campaigns the user can already see rows for. That is a smaller promise than a full
    // campaign list, and it is a promise this screen can keep without inventing API surface.
    const campaigns: CampaignOption[] = useMemo(() => {
        const seen: { [id: number]: boolean } = {};
        const out: CampaignOption[] = [];
        items.forEach((r) => {
            if (!seen[r.ChannelCampaignID]) {
                seen[r.ChannelCampaignID] = true;
                out.push({ CampaignID: r.ChannelCampaignID, CampaignName: r.CampaignName });
            }
        });
        return out;
    }, [items]);

    const hasFilter = !!filters.SearchText
        || filters.RoleFilter !== eRoleFilter.All
        || filters.RowKind !== eRowKind.All
        || filters.CampaignID != null
        || filters.DateFrom != null
        || filters.DateTo != null;

    // ── drawer ────────────────────────────────────────────────────────────────────────────────
    // The stack stores the row's COMPOSITE KEY, never a copy of the row (Models/…/SendSearch.ts
    // DrawerEntry), so a refetch while the drawer is open cannot leave stale data on screen.
    // Resolving it here is that lookup; a level whose row is gone after a refetch renders nothing
    // rather than last-known data.
    //
    // It must be `sendSearchRowKey`, NOT `RowID`. `RowID` is a DataSourceRows key — PK
    // (DataSourceVersionID, RowID) — and a repeat send of the same campaign produces a SECOND report
    // row carrying the same RowID (CONTRACT §9 fixes the report's row key at
    // `(Channel, ChannelCampaignID, RowID, SentAt)` for exactly this reason, and §2.1 leaves the
    // provenance table without a unique constraint for exactly this reason). Matching on RowID
    // returned the FIRST such row, so opening the drawer on a repeat-sent recipient showed a
    // different send than the one clicked — wrong version, wrong timestamp, in the drawer whose
    // whole purpose is to answer "what exactly was sent to this person, when".
    const rowByKey = (rowKey: string): SendSearchRow | null =>
        items.filter((r) => sendSearchRowKey(r) === rowKey)[0] ?? null;

    const openRow = (row: SendSearchRow) => {
        // A supervisor / roll-up recipient opens the ROLL-UP level; everyone else opens the agent level.
        const level = row.IsSupervisor ? 'rollup' : 'agent';
        dispatch(pushDrawer({
            Level: level,
            RowKey: sendSearchRowKey(row),
            RowID: row.RowID,
            Crumb: row.RecipientName,
            Title: row.RecipientName,
            Subtitle: [row.RecipientEmail, row.RecipientCellphone].filter((v) => !!v).join(' · ') || null,
            Channel: null,
        } as DrawerEntry));
        // The per-campaign provenance history backs the drawer's version card. Fetched on open, not
        // with the grid: it is one request per opened row instead of one per page of rows.
        dispatch(getSendProvenance({ campaignId: row.ChannelCampaignID, channel: row.Channel }));
    };

    // Roster row → push the agent level ON TOP of the roll-up (Mock-v3:473 `pushAgent`). The
    // breadcrumb then reads "ריכוז … › סוכן", and Esc pops back to the roll-up — not to the grid.
    const openAgentFromRoster = (row: SendSearchRow) => {
        dispatch(pushDrawer({
            Level: 'agent',
            RowKey: sendSearchRowKey(row),
            RowID: row.RowID,
            Crumb: row.RecipientName,
            Title: row.RecipientName,
            Subtitle: row.RecipientEmail || null,
            Channel: null,
        } as DrawerEntry));
    };

    // The recipients a roll-up covered. §3.2 gives a report row only `SupervisorName` — a STRING; there
    // is no supervisor id — so the grouping key is the name, scoped to the same campaign and channel to
    // keep a name collision from pulling in another campaign's agents. The drawer states, in a banner,
    // that the roster is reconstructed rather than recorded (Mock-v3:461-463).
    const rosterFor = (rollupRow: SendSearchRow): SendSearchRow[] =>
        items.filter((r) => !r.IsSupervisor
            && r.Channel === rollupRow.Channel
            && r.ChannelCampaignID === rollupRow.ChannelCampaignID
            && !!r.SupervisorName
            && r.SupervisorName === rollupRow.RecipientName);

    const renderDrawerBody = () => {
        const top = drawerStack.length > 0 ? drawerStack[drawerStack.length - 1] : null;
        if (!top) return null;
        const row = rowByKey(top.RowKey);
        if (!row) return null;
        if (top.Level === 'rollup') {
            return (
                <RollupDrawer
                    row={row}
                    roster={rosterFor(row)}
                    provenance={sendSearch.provenance ?? []}
                    onOpenAgent={openAgentFromRoster}
                />
            );
        }
        // 'agent' — and 'message' too: V1 stores no per-recipient as-sent snapshot (CONTRACT D5/§9),
        // so nothing pushes a 'message' level and no reconstructed message is ever shown. The stack
        // and the breadcrumb already support the third level for when V2 supplies its content.
        return (
            <AgentDrawer
                row={row}
                provenance={sendSearch.provenance ?? []}
                provenanceLoading={!!sendSearch.provenanceLoading}
                provenanceError={sendSearch.provenanceError ?? null}
            />
        );
    };

    return (
        <DefaultScreen
            currentPage="groups"
            subPage="sendSearch"
            classes={classes}
            containerClass={clsx(classes.management, classes.mb50)}
        >
            <Typography component="h1" style={{ fontSize: 22, fontWeight: 800, margin: '0 0 16px' }}>
                {t(`${SS}title`)}
            </Typography>

            {/* A failed load must not leave the previous rows on screen pretending to be the answer —
                the slice clears `items` on failure, and this says why the grid is empty. */}
            {sendSearch.error && (
                <InlineBanner
                    severity={sendSearch.error === 'PERMISSION_DENIED' ? 'warning' : 'error'}
                    role="alert"
                    title={t(sendSearch.error === 'PERMISSION_DENIED'
                        ? `${SS}error.permissionDenied`
                        : `${SS}error.loadFailed`)}
                    body={t(sendSearch.error === 'PERMISSION_DENIED'
                        ? `${SS}error.permissionDenied`
                        : `${SS}error.loadFailed`)}
                />
            )}

            <SendSearchFiltersBar
                value={filters}
                campaigns={campaigns}
                loading={!!sendSearch.loading}
                onChange={(patch: Partial<Filters>) => dispatch(setFilters(patch))}
                // The filter bar's "חפש" commits the text through onChange; the effect above already
                // refetches on any committed change, so onSearch only needs to force a refetch for the
                // case where the text did NOT change (the user pressing חפש again on the same term).
                onSearch={() => dispatch(searchSends(toSendSearchRequest(filters)))}
                onClearAll={() => dispatch(clearFilters())}
            />

            <Box style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '15px 0 9px', flexWrap: 'wrap' }}>
                <Typography component="span" style={{ fontSize: 16.5, fontWeight: 700 }}>
                    {/* A COUNT, never a percentage. */}
                    {t(`${SS}results.count`, { count: sendSearch.totalCount ?? 0 })}
                </Typography>
                {/* No export endpoint exists in §3.3, so the mock's ייצוא stays a visible-but-disabled
                    affordance rather than a button that silently does nothing. */}
                <Button size="small" variant="outlined" disabled style={{ marginInlineStart: 'auto' }}>
                    {t(`${SS}export.button`)}
                </Button>
            </Box>

            <SendSearchTable
                items={items}
                totalCount={sendSearch.totalCount ?? 0}
                pageIndex={filters.PageIndex}
                pageSize={filters.PageSize}
                loading={!!sendSearch.loading}
                hasFilter={hasFilter}
                onOpenRow={openRow}
                onPageChange={(p: number) => dispatch(setPageIndex(p))}
                onPageSizeChange={(s: number) => dispatch(setPageSize(s))}
                onClearAll={() => dispatch(clearFilters())}
            />

            {/* The two standing caveats (`Mock-v3:209-212`). They are page furniture, not a tooltip:
                every number above them is qualified by them — email open tracking is image-load based
                (absence of a record is not proof the mail was not read), email has no delivery receipt,
                SMS has no open metric, and one row = one person as identified by the source row. */}
            <Typography
                component="p"
                style={{ fontSize: 12.5, color: '#5b6b7b', maxWidth: '78ch', marginTop: 12 }}
            >
                {t(`${SS}footnote.tracking`)}
            </Typography>

            <Loader isOpen={!!sendSearch.loading} />

            <DrawerStack
                stack={drawerStack}
                isRTL={!!isRTL}
                onPop={() => dispatch(popDrawer())}
                onClose={() => dispatch(closeDrawer())}
            >
                {renderDrawerBody()}
            </DrawerStack>
        </DefaultScreen>
    );
};

export default SendSearchScreen;
