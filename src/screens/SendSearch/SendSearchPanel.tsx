// ═══════════════════════════════════════════════════════════════════════════════════════════
// SendSearchPanel — the body of חיפוש סוכנים ומפקחים, with NO page chrome.
//
// Extracted from SendSearchScreen.tsx so the same code can render in two places:
//   • `SendSearchScreen.tsx`            — the standalone /SendSearch route (DefaultScreen + gate)
//   • `DataSources.tsx` tab "sendsearch" — the third tab, מקורות | שליחה חכמה | חיפוש סוכנים ומפקחים
// Neither copy may fork: a filter that behaves differently depending on how the user got here is
// exactly the invisible inconsistency this screen exists to expose in the SEND data.
//
// What this component deliberately does NOT do, because its two hosts already do it:
//   • No `DefaultScreen` wrapper — the host owns the page shell.
//   • No feature gate / Redirect — SendSearchScreen gates on DATA_SOURCES, and DataSources.tsx
//     gates on the same entitlement before it renders any tab. Gating a third time here would be
//     a third place to keep in sync.
//   • No <h1> unless asked (`showTitle`) — inside the tab the page title is "מקורות נתונים" and
//     the tab label already names this view, so a second heading is noise. The standalone route
//     passes showTitle so it keeps its own heading.
// ═══════════════════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Loader } from '../../components/Loader/Loader';
import InlineBanner from '../SmartSend/components/InlineBanner';
import {
    searchSends, getSendProvenance, getSendRowValues, getSendSearchFilterFields,
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
import {
    SendSearchField,
    SendSearchFilterRule,
    SendSearchSort,
    completeRules,
    defaultSendSearchSort,
    fieldByKey,
} from './components/SendSearchAdvanced';
import SendSearchTable from './components/SendSearchTable';
import AgentDrawer from './components/AgentDrawer';
import RollupDrawer from './components/RollupDrawer';
import DrawerStack from './components/DrawerStack';

interface Props {
    // The standalone route renders its own heading; the tab does not. Default off, so embedding
    // this panel anywhere new does not silently add a duplicate <h1>.
    showTitle?: boolean;
}

const SendSearchPanel: React.FC<Props> = ({ showTitle }) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const isRTL = useSelector((state: any) => state.core && state.core.isRTL);
    const sendSearch = useSelector((state: any) => state.sendSearch);

    const filters: Filters = sendSearch.filters;
    const items: SendSearchRow[] = sendSearch.items ?? [];
    const drawerStack: DrawerEntry[] = sendSearch.drawerStack ?? [];

    // ── advanced filters + sort (CONTRACT §2) ────────────────────────────────────────────────
    // Held HERE and not in the slice, deliberately and temporarily: `sendSearchSlice.ts` and
    // `SendSearchFilters` (the state type) belong to B4, and CONTRACT §3 gives a file exactly one
    // owner. Local state keeps this screen compiling and behaving correctly on its own; when B4's
    // slice fields land, these three lines move into `useSelector` and NOTHING else in this file or
    // in the two components below changes, because the shapes are the same. Recorded in LEDGER.
    //
    // 🔴 FIXED 2026-08-08 (review R1-02). This read was `sendSearch.searchableFields`, a key the
    // reducer NEVER writes — the slice's field list is `filterFields` (sendSearchSlice.ts:88, :186,
    // :466). The selector above is `(state: any)`, so tsc could not see it; `?? []` then yielded an
    // empty array for the life of the session, `advAvailable` (SendSearchFilters.tsx:98) was
    // permanently false, "עוד מסננים" was permanently disabled, and `AdvancedFilterBuilder` was never
    // mounted at all (:302). The whole client half of CONTRACT §2 was inert on a live audit screen.
    //
    // The comment that stood here claimed the empty array was "§2's correct degrade, not a bug" —
    // it pre-labelled the broken state as intentional, which is why three reviews walked past it.
    // The premise was false: the server projects the list fine; the CLIENT was reading the wrong key.
    const searchableFields: SendSearchField[] = sendSearch.filterFields ?? [];
    const [advRules, setAdvRules] = useState<SendSearchFilterRule[]>([]);
    const [advSort, setAdvSort] = useState<SendSearchSort>(defaultSendSearchSort());

    // A REF beside the state, read by `buildRequest`. The chips fire `onRulesChange` and `onSearch`
    // in the same handler; reading `advRules` there would send the value from BEFORE the removal —
    // the grid would come back still narrowed by a rule the user just deleted, which is worse than
    // not refetching at all. The ref is written synchronously, so the request is never one render
    // behind what is on screen.
    const advRef = useRef<{ rules: SendSearchFilterRule[]; sort: SendSearchSort }>({
        rules: [], sort: defaultSendSearchSort(),
    });

    const setRules = (next: SendSearchFilterRule[]) => { advRef.current.rules = next; setAdvRules(next); };
    const setSort = (next: SendSearchSort) => { advRef.current.sort = next; setAdvSort(next); };

    // The wire request. The advanced parts are appended to the frozen §3.2 body; the cast is on the
    // OBJECT and not on the individual fields so that the base projection stays type-checked, and it
    // exists only because `SendSearchRequest` is B4's to extend. Incomplete rules are dropped by
    // `completeRules` — never sent with a blank value, which a CONTAINS would read as "match all".
    // `FilterGroupID` is NOT sent: CONTRACT §2 says the SERVER assigns it by order.
    const buildRequest = () => {
        const rules = completeRules(advRef.current.rules, searchableFields);
        const sort = advRef.current.sort;
        return {
            ...toSendSearchRequest(filters),
            Filters: rules.map((r) => ({
                FieldKey: r.FieldKey,
                Operator: r.Operator,
                Value1: r.Value1,
                // Value2 is BETWEEN-only; '' would bind an empty nvarchar where the TVP wants NULL.
                Value2: (r.Value2 || '').trim() === '' ? null : r.Value2,
            })),
            // FROZEN WIRE NAMES (ORCHESTRATOR AMENDMENT 2026-08-06): `SortField` / `SortDescending`,
            // matching the C# DTO member-for-member. This object is cast `as any` below, so tsc CANNOT
            // catch a misspelling here — and Newtonsoft drops an unknown key without a word, which is
            // exactly how the header showed a sort the grid was not performing.
            SortField: sort.FieldKey ? sort.FieldKey : null,
            SortDescending: sort.Dir === 'desc',
        } as any;
    };

    // The grid header for the sort column: the field's DISPLAY name, or null when unsorted (which
    // is what hides the column entirely).
    const sortFieldLabel: string | null = advSort.FieldKey
        ? ((fieldByKey(searchableFields, advSort.FieldKey)?.DisplayName) || advSort.FieldKey)
        : null;

    // One fetch per committed filter object. The free-text box is local state inside the filter bar
    // until "חפש"/Enter commits it, so typing never fires a request; every OTHER control commits
    // immediately, which is what the mock does (its selects call applyF() directly).
    // NOTE the dependency list: `filters` ONLY. The advanced rules are deliberately NOT here — a
    // rule is applied by "החל מסננים" (or by deleting its chip), not on every keystroke inside a
    // value box, which would fire a search per character and show the user results for a prefix of
    // the number they are typing.
    useEffect(() => {
        dispatch(searchSends(buildRequest()));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, filters]);

    // 🔴 ADDED 2026-08-08 (review R1-03). `getSendSearchFilterFields` was defined, exported and had
    // all three extraReducer cases wired (sendSearchSlice.ts:155, :443, :455, :474) — and NOTHING in
    // the entire tree ever dispatched it. `GET api/SendSearch/FilterFields` was therefore never
    // issued by the browser (confirmed on staging: the request is absent from the Network tab, not
    // failing — absent), so `filterFields` stayed `[]` for the whole session.
    //
    // This is the SECOND of two stacked breaks: repointing the selector at `filterFields` (above)
    // fixes nothing on its own, because the array it now reads was never populated.
    //
    // Keyed on the CHANNEL alone, deliberately, and NOT on `filters`: the catalog's domain is the
    // set of searchable columns behind the sends of a channel. Re-fetching it on every date tweak or
    // keystroke would be one request per interaction for a list that cannot change, and the slice's
    // `filterFieldsReqId` stale-guard (:456) exists precisely because a fast double channel switch
    // would otherwise land the FIRST channel's list last.
    useEffect(() => {
        dispatch(getSendSearchFilterFields({ channel: filters.Channel }));
    }, [dispatch, filters.Channel]);

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
        || filters.DateTo != null
        // An advanced rule is a filter like any other: without this, a search narrowed to nothing by
        // an advanced rule showed the "no results" state WITHOUT the "נקה הכל" way out, and the user
        // had to guess that the empty grid was caused by the panel they had collapsed.
        || completeRules(advRules, searchableFields).length > 0;

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

    // GET api/SendSearch/RowValues for ONE recipient. Guarded on ClientID because the field is new
    // (B.2 adds it to dbo.DataSources_SearchSends): against a server that has not been deployed yet
    // the value is `undefined`, and dispatching would send `clientId=undefined` for the API to answer
    // 400. Not dispatching leaves the drawer's own `valuesUnavailable` branch to say "could not
    // load" — which is the truth — instead of the no-values sentence, which would be a claim.
    const fetchRowValues = (row: SendSearchRow) => {
        if (!row.ClientID || row.ClientID <= 0) return;
        dispatch(getSendRowValues({
            campaignId: row.ChannelCampaignID,
            clientId: row.ClientID,
            channel: row.Channel,
        }));
    };

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
        // The values card lives in AgentDrawer only, so the roll-up level does not pay for a request
        // it will not render. `fetchRowValues` guards the ClientID.
        if (level === 'agent') fetchRowValues(row);
    };

    // Roster row → push the agent level ON TOP of the roll-up (Mock-v3:473 `pushAgent`). The
    // breadcrumb then reads "מפקח … › סוכן", and Esc pops back to the roll-up — not to the grid.
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
        // MANDATORY here, not only in openRow: the roll-up and the agent share a campaign, so the
        // provenance already in the store is still correct — but the values are per PERSON. Without
        // this dispatch the agent pushed from the roster would render the SUPERVISOR's ID numbers
        // under the agent's name, which is a confident lie of exactly the kind this drawer exists
        // to prevent.
        fetchRowValues(row);
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
                rowValues={sendSearch.rowValues ?? []}
                rowValuesLoading={!!sendSearch.rowValuesLoading}
                rowValuesError={sendSearch.rowValuesError ?? null}
                // WHOSE values are in the store. The slice has ONE slot, and the drawer refuses to
                // render it unless it belongs to the recipient on screen: someone else's ID and
                // policy numbers under this person's name are indistinguishable, on screen, from
                // the truth. A mismatch also covers "the fetch was never dispatched", which the
                // drawer must report as unknown rather than as "nothing was sent".
                rowValuesClientId={sendSearch.rowValuesClientId ?? null}
            />
        );
    };

    return (
        <>
            {showTitle && (
                <Typography component="h1" style={{ fontSize: 22, fontWeight: 800, margin: '0 0 16px' }}>
                    {t(`${SS}title`)}
                </Typography>
            )}

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
                onSearch={() => dispatch(searchSends(buildRequest()))}
                // "נקה הכל" clears the ADVANCED rules and the sort too. Leaving them behind would
                // make a cleared screen still silently narrowed and still silently reordered, under
                // a button that just told the user everything was cleared.
                onClearAll={() => {
                    setRules([]);
                    setSort(defaultSendSearchSort());
                    dispatch(clearFilters());
                }}
                fields={searchableFields}
                rules={advRules}
                onRulesChange={setRules}
                sort={advSort}
                onSortChange={setSort}
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
                onClearAll={() => {
                    setRules([]);
                    setSort(defaultSendSearchSort());
                    dispatch(clearFilters());
                }}
                // Null unless a sort field is chosen — that is what keeps the extra column out of
                // the grid entirely in the default case.
                sortFieldLabel={sortFieldLabel}
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
        </>
    );
};

export default SendSearchPanel;
