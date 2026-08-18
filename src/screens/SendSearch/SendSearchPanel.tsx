// ═══════════════════════════════════════════════════════════════════════════════════════════
// SendSearchPanel — the body of חיפוש סוכנים ומפקחים, with NO page chrome.
//
// Extracted from SendSearchScreen.tsx so the same code can render in two places:
//   • `SendSearchScreen.tsx`            — the standalone /SendSearch route (DefaultScreen + gate)
//   • `DataSources.tsx` tab "sendsearch" — the LAST tab. The strip is built from a permission-gated
//     registry there, so it is 1–3 tabs wide, not a fixed three:
//     מקורות | קמפיינים לשליחה ממקור | חיפוש סוכנים ומפקחים
// Neither copy may fork: a filter that behaves differently depending on how the user got here is
// exactly the invisible inconsistency this screen exists to expose in the SEND data.
// The two hosts do NOT share a title string, and that is deliberate: the standalone route is named
// "דוח מקורות" (a product name), the tab keeps the literal "חיפוש סוכנים ומפקחים" (PO decision).
//
// What this component deliberately does NOT do, because its two hosts already do it:
//   • No `DefaultScreen` wrapper — the host owns the page shell.
//   • No feature gate / Redirect — SendSearchScreen gates on DATA_SOURCES *and* !HideRecipients
//     (matching SendSearchController, which answers Search with 405 for that permission), and
//     DataSources.tsx applies BOTH tests to the tab entry in its TABS registry before rendering it.
//     Gating a third time here would be a third place to keep in sync.
//   • No <h1> unless asked (`showTitle`) — inside the tab the page title is "מקורות נתונים" and
//     the tab label already names this view, so a second heading is noise. The standalone route
//     passes showTitle so it keeps its own heading.
// ═══════════════════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Tooltip, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Loader } from '../../components/Loader/Loader';
import InlineBanner from '../SmartSend/components/InlineBanner';
import {
    searchSends, getSendProvenance, getSendRowValues, getSendSearchFilterFields,
    searchSupervisorSends, getSupervisorAgents,
    setFilters, setPageIndex, setPageSize, clearFilters,
    pushDrawer, popDrawer, closeDrawer,
} from '../../redux/reducers/sendSearchSlice';
import {
    SS,
    SendSearchRequest,
    SendSearchRow,
    SendSearchFilters as Filters,
    SupervisorSendRow,
    DrawerEntry,
    eRowKind,
    eRoleFilter,
    DEFAULT_PAGE_SIZE,
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
import { PulseemFeatures } from '../../model/PulseemFields/Fields';
import SendSearchTable from './components/SendSearchTable';
import AgentDrawer from './components/AgentDrawer';
import RollupDrawer from './components/RollupDrawer';
import DrawerStack from './components/DrawerStack';
import SendSearchExportDialog from './components/SendSearchExportDialog';

interface Props {
    // The standalone route renders its own heading; the tab does not. Default off, so embedding
    // this panel anywhere new does not silently add a duplicate <h1>.
    showTitle?: boolean;
}

const SendSearchPanel: React.FC<Props> = ({ showTitle }) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const isRTL = useSelector((state: any) => state.core && state.core.isRTL);
    // Sub-user permissions, from the same `state.core` slice `DataSources.tsx:72` reads them from.
    const userRoles = useSelector((state: any) => state.core && state.core.userRoles);
    // ACCOUNT-level entitlements, a different axis from the sub-user permissions above. Read from
    // `state.common` — the shape `Groups.js:68` and `DynamicGroups.tsx:73` read it from — because of
    // LOCK_EXPORT_DATA; see `canExport`.
    const { accountFeatures } = useSelector((state: any) => state.common);
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

    // 🔴 THE BODY THAT ACTUALLY RAN. Added after review (2026-08-09).
    //
    // `buildRequest()` reads `advRef.current`, which the advanced panel writes on EVERY edit
    // (AdvancedFilterBuilder.tsx:84 updateRule, :109 addRule, :112 removeRule, :238 clear) — and none
    // of those dispatch a search, because a rule is applied by "החל מסננים" and not per keystroke
    // (see the effect below). So between an edit and an Apply, `buildRequest()` describes a query the
    // GRID HAS NEVER RUN. The export used to call it fresh at click time, which meant the file could
    // answer a different question from the screen that produced it, while the dialog printed the row
    // count of the OLD search — over-reporting in the direction that matters most: the operator
    // confirms "ייוצאו 4,312 שורות" and files a 118-row audit answer. The mirror case is worse in the
    // other direction: blanking a rule's value drops it at the wire boundary, so the file comes back
    // WIDER than the screen.
    //
    // Every dispatch goes through `runSearch` and records its body here, so the export posts the body
    // that produced the rows on screen, by construction rather than by discipline. This ref is the
    // single reason `SendSearchExportDialog`'s criteria table, its row count and the file can be
    // relied on to describe one search.
    const lastSentRef = useRef<SendSearchRequest | null>(null);
    const runSearch = () => {
        const body = buildRequest();
        lastSentRef.current = body;
        dispatch(searchSends(body));
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
        runSearch();
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
    // 🔴 RE-KEYED 2026-08-09 (multi-campaign). This was keyed on the CHANNEL alone, on the argument
    // that the catalog "cannot change" within a channel. That argument was wrong, and the campaign
    // picker is what made it visible.
    //
    // The catalog SP takes @prm_DateFrom / @prm_DateTo / @prm_IncludeOverOneYear and scopes its
    // #Camp by them. A channel-only call therefore always describes the SP's default window — the
    // last twelve months — no matter what dates are on screen. Two consequences:
    //   • the campaign picker would offer only the last year's campaigns, so ticking "כלול חיפוש
    //     שליחות מעל שנה" would fill the GRID with older sends the PICKER could not name;
    //   • the field list had the same defect already, quietly: the columns offered were the
    //     last-12-months set even when the user had chosen a narrower or wider range.
    //
    // The cost is one request per committed date change. Dates are COMMITTED filters, not
    // keystrokes — the same standard that lets them refetch the grid — so this is one request per
    // deliberate user action, not per character. The slice's `filterFieldsReqId` stale-guard already
    // orders the responses, which is what makes a chattier key safe.
    //
    // NOT keyed on the campaign selection, and that is the one exclusion that matters: the picker's
    // options must never be narrowed by the picker's own selection. That is precisely the
    // self-narrowing failure the deleted client-side catalog had.
    useEffect(() => {
        dispatch(getSendSearchFilterFields({
            channel: filters.Channel,
            dateFrom: filters.DateFrom,
            dateTo: filters.DateTo,
            includeOverOneYear: filters.IncludeOverOneYear,
        }));
    }, [dispatch, filters.Channel, filters.DateFrom, filters.DateTo, filters.IncludeOverOneYear]);

    // ── campaign picker options ───────────────────────────────────────────────────────────────
    // 🔴 REPLACED 2026-08-09 (multi-campaign). This was ~70 lines of client-side accumulation: the
    // options were the distinct campaigns found in RESULT ROWS, merged into a growing catalog, with
    // a second effect resetting it whenever the search scope changed. All of it is deleted.
    //
    // It existed only because §3.3 defined no campaign-list endpoint. There is one now — result set
    // [1] of dbo.DataSources_SearchSendsFilterCatalog (51-CatalogSP-Campaigns.sql), built from the
    // SAME #Camp set the field catalog uses, so every option is a campaign the grid can genuinely
    // return rows for.
    //
    // The deleted code had two documented completeness ceilings that no amount of client cleverness
    // could close: a campaign living only on an unvisited PAGE was unknown, and changing scope while
    // filtered to one campaign could only ever reveal that one campaign. Both were survivable for a
    // single-select. Neither survives a SEARCH BOX: the user types a campaign name, gets "not
    // found", and concludes the campaign does not exist — when the truth is that its page was never
    // fetched. That is a confident falsehood on an audit screen, which is the one thing this screen
    // is built not to produce. Deleting the accumulation is what makes the search box honest.
    //
    // Kept deliberately as a plain read with no fallback to the old behaviour: a half-list that
    // LOOKS complete is worse than an empty picker that says it could not load. `campaignsError`
    // carries that distinction to the bar.
    const campaigns: CampaignOption[] = sendSearch.campaigns ?? [];

    const hasFilter = !!filters.SearchText
        || filters.RoleFilter !== eRoleFilter.All
        || filters.RowKind !== eRowKind.All
        || filters.CampaignID != null
        // The multi-select is a filter like any other: without this, narrowing to a campaign that
        // returns nothing would show the "no results" state WITHOUT the "נקה הכל" way out, and the
        // user would be stuck looking at an empty grid with no visible cause.
        || (filters.CampaignIDs != null && filters.CampaignIDs.length > 0)
        || filters.DateFrom != null
        || filters.DateTo != null
        // An advanced rule is a filter like any other: without this, a search narrowed to nothing by
        // an advanced rule showed the "no results" state WITHOUT the "נקה הכל" way out, and the user
        // had to guess that the empty grid was caused by the panel they had collapsed.
        || completeRules(advRules, searchableFields).length > 0;

    // ── export (POST api/SendSearch/Export) ───────────────────────────────────────────────────
    // HIDDEN, not disabled, for a sub-user who may not export. That is the house convention and the
    // reason is not cosmetic: `DataSources.tsx:110-114` derives the identical pair, and
    // `DownloadFiles.tsx:67` simply omits the whole download column rather than greying it out.
    // A greyed-out button with an explanatory tooltip would tell a deliberately restricted user
    // exactly which capability was withheld from them — a permission denial explained to the person
    // it is aimed at. The server enforces the same rule anyway (405 USER_PERMISSION_NOT_ALLOWED),
    // so this is the UI half of a gate that exists on both sides.
    //
    // HideRecipients is part of the condition and not an afterthought: every one of the 22 export
    // columns is recipient data — name, email, mobile, ClientID — so a user who may not SEE
    // recipients on screen must certainly not be able to write them to a file and take them home.
    // Same composition DataSources.tsx:114 uses.
    //
    // 🔴 ADDED after review (2026-08-09) — LOCK_EXPORT_DATA. The two sub-user permissions above are
    // only half the gate this product actually enforces. Account feature 13 (LOCK_EXPORT_DATA,
    // `Dal/Models/AccountFeatures/AccountFeatures.cs:17`) is the switch an account buys to stop
    // recipient data leaving the product at all, and EVERY other export in this app honours it:
    // ClientSearch, Groups (:460), DynamicGroups, the newsletter archive, DirectSendReport,
    // SmsReplies, WhatsappInbound, MmsReport, NewslettersReport, ProductsReport, SmsReport and
    // LandingPages — twelve screens, all with the identical `indexOf(...) === -1` composition copied
    // here. Omitting it made THIS screen the way around it, on the most recipient-revealing dataset
    // in the product: name + email + mobile + ClientID + supervisor for up to 20,000 people.
    //
    // Client-side only, and that is not an oversight — it is where this feature is enforced. A
    // repo-wide grep of WebSiteApiNew for LockExportData returns the enum declaration and NOTHING
    // else: no C# code anywhere checks feature 13. Adding a server gate here would make SendSearch
    // the single endpoint in the product that enforces it, would widen the frozen contract's 405
    // condition (!AllowExport OR HideRecipietns), and belongs to whoever decides it product-wide.
    const canExport = !!userRoles?.AllowExport
        && !userRoles?.HideRecipients
        && accountFeatures?.indexOf(PulseemFeatures.LOCK_EXPORT_DATA) === -1;
    const [exportOpen, setExportOpen] = useState(false);
    // The wire body, CAPTURED at the moment the dialog opens rather than recomputed on every render
    // of the panel behind it. Two reasons, both about the file matching the screen:
    //   • the criteria table the operator confirms and the `Criteria` the server writes into the
    //     file are then provably the same object, not two evaluations of the same function;
    //   • nothing the panel does while the dialog is open can move it. `buildRequest()` reads
    //     `advRef.current`, which is written synchronously by the chips — a recompute mid-dialog
    //     could silently swap the criteria under a table the user is reading.
    const [exportRequest, setExportRequest] = useState<SendSearchRequest | null>(null);
    // Rules the user built but did not finish. `toSendSearchRequest` drops them, so they narrow
    // nothing — the dialog states that in the criteria block rather than letting the file imply a
    // narrower search than the one that ran.
    const incompleteRuleCount = Math.max(advRules.length - completeRules(advRules, searchableFields).length, 0);
    const exportDisabled = !!sendSearch.loading || (sendSearch.totalCount ?? 0) === 0;

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
        // A rollup is a supervisor: fetch that supervisor's OWN send (opens/clicks + sent-HTML),
        // scoped to THIS campaign and narrowed by the supervisor's email. One request per opened
        // rollup. The roster (SupervisorAgents) is fetched by the effect below, once this returns a
        // RequestID — the report row itself carries no RequestID to key the roster on.
        if (level === 'rollup') {
            dispatch(searchSupervisorSends({
                Channel: row.Channel,
                CampaignID: row.ChannelCampaignID,
                SearchText: row.RecipientEmail || null,
                DateFrom: null,
                DateTo: null,
                PageIndex: 0,
                PageSize: DEFAULT_PAGE_SIZE,
            }));
        }
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
    // is no supervisor id — so the grouping key is that string, scoped to the same campaign and channel
    // to keep a collision from pulling in another campaign's agents. The drawer states, in a banner,
    // that the roster is reconstructed rather than recorded (Mock-v3:461-463).
    //
    // CHANGED 2026-08-16 (defect D2). The key is the ADDRESS, not the display name.
    // `SupervisorName` is the RAW supervisor-column value from the row's RowJson — for a data-source
    // campaign that is an e-mail. The roll-up row's own identity is `RecipientEmail`. Comparing the
    // value to `RecipientName` therefore compared an address to a display name, never matched, and left
    // `roster` empty — which is why the drawer's three coverage tiles read 0 while the recorded roster
    // card beneath them listed five people.
    //
    // `!r.IsSupervisor` is KEPT ON PURPOSE. It is NOT what excluded a dual-role person: the SP now
    // stamps IsSupervisor = 0 on every CampaignSendingLog row, so someone who is both supervisor and
    // agent is admitted here by his AGENT row. The clause's only remaining job is to keep a supervisor's
    // own roll-up row out of its own roster, and it costs nothing to keep.
    const rosterFor = (rollupRow: SendSearchRow): SendSearchRow[] => {
        const supKey = (rollupRow.RecipientEmail || '').toLowerCase();
        // A roll-up row with no address can match nothing. Without this guard the comparison below
        // would be '' === '' for any row whose SupervisorName is an empty string.
        if (!supKey) return [];
        return items.filter((r) => !r.IsSupervisor
            && r.Channel === rollupRow.Channel
            && r.ChannelCampaignID === rollupRow.ChannelCampaignID
            && !!r.SupervisorName
            && r.SupervisorName.toLowerCase() === supKey);
    };

    // ── supervisor sends (feature) ────────────────────────────────────────────────────────────
    // The supervisor send matching the OPEN rollup, from the campaign-scoped list openRow fetched.
    // Matched on campaign + email, case-insensitively: RecipientEmail (report row) and
    // SupervisorEmail (SupervisorSends row) are the same address projected by two different procs.
    // Null until the fetch returns, and null forever on a server that has not shipped SupervisorSends
    // — in which case RollupDrawer renders exactly as it did before this feature.
    const supervisorSends: SupervisorSendRow[] = sendSearch.supervisorSends ?? [];
    const topEntry: DrawerEntry | null = drawerStack.length > 0 ? drawerStack[drawerStack.length - 1] : null;
    const openRollupRow: SendSearchRow | null = topEntry && topEntry.Level === 'rollup'
        ? rowByKey(topEntry.RowKey) : null;
    const supervisorSendForOpen: SupervisorSendRow | null = openRollupRow
        ? (supervisorSends.filter((s) => s.CampaignID === openRollupRow.ChannelCampaignID
            && (s.SupervisorEmail || '').toLowerCase() === (openRollupRow.RecipientEmail || '').toLowerCase())[0] ?? null)
        : null;

    // The roster keys on RequestID + SupervisorEmail, which ONLY the SupervisorSendRow carries — the
    // report row has no RequestID — so this is a DEPENDENT fetch, dispatched once the supervisor send
    // above resolves. Keyed on the two primitives so it fires once per (request, supervisor), no loop.
    const supReqId = supervisorSendForOpen?.RequestID ?? 0;
    const supEmail = supervisorSendForOpen?.SupervisorEmail ?? '';
    useEffect(() => {
        if (supReqId > 0 && supEmail) {
            dispatch(getSupervisorAgents({ requestId: supReqId, supervisorEmail: supEmail }));
        }
    }, [dispatch, supReqId, supEmail]);

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
                    // The supervisor's own send (opens/clicks + sent-HTML). Null ⇒ the card renders
                    // as before. The recorded roster is passed ONLY once we have a matching supervisor
                    // send, so a pre-feature server keeps the reconstructed roster (no regression).
                    supervisorSend={supervisorSendForOpen}
                    supervisorAgents={supervisorSendForOpen ? (sendSearch.supervisorAgents ?? []) : undefined}
                    supervisorAgentsLoading={!!sendSearch.supervisorAgentsLoading}
                    supervisorAgentsError={sendSearch.supervisorAgentsError ?? null}
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
                // Lets the picker say "could not load the campaign list" instead of rendering an
                // empty menu, which would assert — from a failed request — that this account has no
                // campaigns. Also covers the pre-51 server, where the field list arrives fine and
                // only the campaign result set is absent.
                campaignsError={sendSearch.campaignsError ?? null}
                // The source map (script 54). Three separate props rather than one object, so the
                // availability flag can never be inferred from the lists: the flag is a DEPLOYMENT
                // fact and the lists are a DATA fact, and the filter bar has to tell them apart
                // before it renders a control that acts on the operator's behalf.
                sourceMapAvailable={sendSearch.sourceMapAvailable === true}
                sourceOptions={sendSearch.sourceOptions ?? []}
                sourceCampaigns={sendSearch.sourceCampaigns ?? []}
                loading={!!sendSearch.loading}
                onChange={(patch: Partial<Filters>) => dispatch(setFilters(patch))}
                // The filter bar's "חפש" commits the text through onChange; the effect above already
                // refetches on any committed change, so onSearch only needs to force a refetch for the
                // case where the text did NOT change (the user pressing חפש again on the same term).
                onSearch={() => runSearch()}
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
                {/* ייצוא. Rendered only for a user who is allowed to export (see `canExport` above —
                    hidden, never greyed, for a restricted sub-user).
                    The Tooltip wraps a <span> and not the Button, for the reason spelled out at
                    SendSearchFilters.tsx:303-305: MUI attaches its listeners to the child, a disabled
                    button fires no pointer events, and the tooltip that explains WHY it is disabled
                    would be the one tooltip that never appears. */}
                {canExport && (
                    <Tooltip
                        title={(exportDisabled
                            ? t(sendSearch.loading ? `${SS}export.disabledLoading` : `${SS}export.disabledNoRows`)
                            : t(`${SS}export.tooltip`)) as string}
                    >
                        <span style={{ marginInlineStart: 'auto' }}>
                            <Button
                                size="small"
                                variant="outlined"
                                disabled={exportDisabled}
                                // The LAST DISPATCHED body, never a fresh buildRequest() — see
                                // `lastSentRef` above. There is deliberately no fallback to
                                // buildRequest() here: a fallback would silently restore the exact
                                // divergence the ref exists to remove. It cannot be null in practice
                                // anyway — `exportDisabled` requires totalCount > 0, which requires a
                                // search to have completed.
                                onClick={() => {
                                    const body = lastSentRef.current;
                                    if (!body) return;
                                    setExportRequest(body);
                                    setExportOpen(true);
                                }}
                            >
                                {t(`${SS}export.button`)}
                            </Button>
                        </span>
                    </Tooltip>
                )}
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
                // The source map for THIS result set, and the flag that decides whether the grid
                // renders a source line at all. Passed as a pair on purpose: the list alone cannot
                // distinguish "the server has not shipped 52_" from "this result references no
                // source", and rendering the first as the second would put a claim about the data
                // on screen that came from a fact about the deployment.
                sources={sendSearch.sources ?? []}
                sourcesAvailable={!!sendSearch.sourcesAvailable}
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

            {/* Mounted once a request has been captured, and left mounted afterwards so closing it
                animates out instead of vanishing. `open` alone drives visibility; the dialog resets
                all of its own state on every open, so a second export never starts inside the
                previous one's result.
                🔴 The reset is not the whole guard, and reading it as the whole guard was a defect.
                Because the component is left MOUNTED, a request still in flight from the previous
                open resolves onto the live dialog and used to write "the file is ready" over the
                criteria of the search now on screen — a different search than the file answers.
                What actually closes that is inside the dialog: an export-session counter bumped on
                every open and re-checked after the await, plus ESC/backdrop being disabled while a
                request is in flight. Do not "simplify" either of them away on the strength of this
                reset. */}
            {canExport && exportRequest && (
                <SendSearchExportDialog
                    open={exportOpen}
                    onClose={() => setExportOpen(false)}
                    filters={filters}
                    request={exportRequest}
                    totalCount={sendSearch.totalCount ?? 0}
                    campaigns={campaigns}
                    // Same flag the filter bar gets: it is what lets the criteria row say "the
                    // campaign names could not be loaded" instead of printing bare ids as if that
                    // were the whole truth.
                    campaignsError={sendSearch.campaignsError ?? null}
                    fields={searchableFields}
                    incompleteRuleCount={incompleteRuleCount}
                />
            )}
        </>
    );
};

export default SendSearchPanel;
