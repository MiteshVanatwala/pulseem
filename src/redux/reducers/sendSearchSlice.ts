// ═══════════════════════════════════════════════════════════════════════════════════════════
// SendSearch slice — V1.
//
// DELIVERY PATH:  _delivery\SendSearch-V1\react\redux\sendSearchSlice.ts
// TARGET PATH:    ReactCode\src\redux\reducers\sendSearchSlice.ts   (CONTRACT §4.3)
//
// Registration in `store.js` under the key `sendSearch` is REACT-PATCH's patch (§4.3) — nothing
// about the store is declared here.
//
// Pattern copied from `redux/reducers/dataSourcesSlice.ts`: createSlice + createAsyncThunk,
// `PulseemReactInstance` for the HTTP call, `return response.data` (NO JSON.parse — the new
// controllers return an object), `catch → thunkAPI.rejectWithValue({ error: error.message })`,
// and the payload unwrapped as `action.payload?.Data` because every response is a
// `PulseemResponse { StatusCode, Message, Data }` (CONTRACT §3).
// ═══════════════════════════════════════════════════════════════════════════════════════════

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';
import { eSendChannel } from '../../Models/DataSources/SmartSend';
import {
    SendSearchRow,
    SendSearchRequest,
    SendSearchFilters,
    SendProvenanceRow,
    SendRowValue,
    DrawerEntry,
    MAX_DRAWER_DEPTH,
    defaultSendSearchFilters,
    SendSearchFilterClause,
    SendSearchFilterField,
} from '../../Models/DataSources/SendSearch';

const api = 'SendSearch/';

interface SendSearchState {
    items: SendSearchRow[];
    totalCount: number;
    filters: SendSearchFilters;
    loading: boolean;
    error: string | null;
    drawerStack: DrawerEntry[];
    provenance: SendProvenanceRow[];
    provenanceLoading: boolean;
    // Latest-request id — drops out-of-order Search responses. Rapid paging / hitting "חפש" twice
    // resolves out of order often enough that without this the grid can end up showing page 1's rows
    // under page 2's pager. Same guard as dataSourcesSlice.ts:43-45 (currentReqId / rowsReqId).
    searchReqId: string;
    // The campaign id whose provenance is currently loaded, so the drawer can tell "not fetched yet"
    // from "fetched and genuinely empty" (an empty list is the NORMAL answer for a pre-provenance
    // send — it is what makes the row 'Inferred'/'Unverifiable', and it must not look like a spinner
    // that never finished).
    provenanceCampaignId: number | null;
    // A FAILED provenance fetch must not be indistinguishable from a genuinely empty history.
    // Without this flag both land on `provenance: []`, and AgentDrawer's empty branch prints the
    // reassuring sentence "there is no send record, but the mapping was not touched, so this IS the
    // version that was sent" — a positive claim about the data, asserted from a request that never
    // came back. That is the same over-claim as a blank version cell, only worse: it is confident.
    provenanceError: string | null;
    // ── per-recipient sent values (GET api/SendSearch/RowValues) ─────────────────────────────
    // Same three-field shape as provenance above, for the same three reasons: its own loading flag
    // so it never blanks the grid behind it, its own error flag so a FAILED fetch is not read as
    // "this recipient received nothing", and its own identity field so "not fetched yet" is
    // distinguishable from "fetched and genuinely empty".
    rowValues: SendRowValue[];
    rowValuesLoading: boolean;
    rowValuesError: string | null;
    // The ClientID whose values are currently loaded. Provenance keys on campaign; this keys on the
    // PERSON, because that is what changes when the user pops the roll-up drawer and opens a second
    // agent from the roster — the campaign is identical, the recipient is not. Without it the second
    // agent's card would show the first agent's values, which is the exact confident-lie failure this
    // card exists to prevent.
    rowValuesClientId: number | null;
    // Stale-response guard, same mechanism as searchReqId (:45). rowValuesClientId alone is NOT
    // enough: open recipient A, then B before A resolves. `pending` for B has already moved
    // rowValuesClientId to B, so when A's slower response lands last it overwrites rowValues while
    // the id field says B — AgentDrawer's clientId check then passes and A's national-ID / policy
    // numbers render under B's name, permanently. Only the request identity catches that ordering.
    rowValuesReqId: string;
    // ── the columns the user may filter / sort on (CONTRACT §2) ──────────────────────────────
    // Same four-field shape as rowValues above, for the same reasons: its own loading flag, its own
    // error flag, and its own request id.
    //
    // The error flag is NOT decoration here. The filter bar's empty state is "this account has no
    // filterable columns" — a statement ABOUT THE DATA. A failed fetch also lands on `[]`, and
    // without a flag the bar would make that positive claim from a request that never came back,
    // then leave the user unable to filter with no reason given. Identical failure mode to
    // `provenanceError` (:51-56).
    filterFields: SendSearchFilterField[];
    filterFieldsLoading: boolean;
    filterFieldsError: string | null;
    // Stale-response guard, same mechanism as rowValuesReqId (:76). The list is per-channel, so
    // switching channel twice quickly can land the FIRST channel's columns last — and the operator
    // would then be offered filter fields that do not exist for the channel on screen, every one of
    // which the SP rejects. There is no second identity field here (no `filterFieldsChannel`)
    // because the request id already fully orders the responses.
    filterFieldsReqId: string;
}

// ── Thunks ───────────────────────────────────────────────────────────────────────────────────

// POST api/SendSearch/Search  →  Data: SendSearchResponse   (CONTRACT §3.3)
export const searchSends = createAsyncThunk(
    'SendSearch/Search', async (req: SendSearchRequest, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.post(`${api}Search`, req);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

// GET api/SendSearch/Provenance?campaignId=&channel=  →  Data: List<SendProvenanceRow>  (§3.3)
export const getSendProvenance = createAsyncThunk(
    'SendSearch/Provenance', async (arg: { campaignId: number; channel: eSendChannel }, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.get(`${api}Provenance`, {
                params: { campaignId: arg.campaignId, channel: arg.channel }
            });
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

// GET api/SendSearch/RowValues?campaignId=&clientId=&channel=  →  Data: List<SendRowValue>  (B.3)
// Cloned from getSendProvenance above, deliberately verbatim in shape: same `.get` + `params`, same
// `return response.data`, same rejectWithValue. The only difference is the third param — this asks
// about a PERSON inside a campaign, provenance asks about the campaign.
export const getSendRowValues = createAsyncThunk(
    'SendSearch/RowValues',
    async (arg: { campaignId: number; clientId: number; channel: eSendChannel }, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.get(`${api}RowValues`, {
                params: { campaignId: arg.campaignId, clientId: arg.clientId, channel: arg.channel }
            });
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

// GET api/SendSearch/FilterFields?channel=  →  Data: List<SendSearchFilterField>   (CONTRACT §2)
// Same `.get` + `params` + `return response.data` shape as the two thunks above.
//
// ⚠️ CONTRACT GAP (recorded in LEDGER, "בעיות שנמצאו בחוזה" #1): §2 freezes the filter VOCABULARY
// but never names the endpoint that lists the available fields. `FilterFields` is B4's choice and is
// recorded as a binding decision so B1 can bind the controller action to the same name. `channel` is
// passed because the filterable columns follow the data source behind the sends, which is per-channel
// — and an extra query param a parameterless controller action ignores is harmless, whereas a
// missing one a controller requires is a 404/500.
//
// There is deliberately NO preview thunk anywhere in this slice: §1 puts the whole preview contract
// on `SendSearchRow.PreviewUrl`. Adding one would be a second authority over an already-answered
// question.
export const getSendSearchFilterFields = createAsyncThunk(
    'SendSearch/FilterFields', async (arg: { channel: eSendChannel }, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.get(`${api}FilterFields`, {
                params: { channel: arg.channel }
            });
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

// ── Slice ────────────────────────────────────────────────────────────────────────────────────

const initialState: SendSearchState = {
    items: [],
    totalCount: 0,
    filters: defaultSendSearchFilters(),
    loading: false,
    error: null,
    drawerStack: [],
    provenance: [],
    provenanceLoading: false,
    searchReqId: '',
    provenanceCampaignId: null,
    provenanceError: null,
    rowValues: [],
    rowValuesLoading: false,
    rowValuesError: null,
    rowValuesClientId: null,
    rowValuesReqId: '',
    filterFields: [],
    filterFieldsLoading: false,
    filterFieldsError: null,
    filterFieldsReqId: '',
};

// One definition of "forget the recipient's values", shared by `closeDrawer`, `popDrawer` (last
// level) and `clearRowValues`, so the four fields can never be reset in three slightly different
// ways. Takes the Immer draft; mutates it in place, exactly as the reducers do.
const clearRowValuesState = (state: SendSearchState) => {
    state.rowValues = [];
    state.rowValuesClientId = null;
    state.rowValuesLoading = false;
    state.rowValuesError = null;
    // Also invalidate the in-flight request: a response that lands after the drawer closed must not
    // repopulate the slot for a recipient nobody is looking at any more.
    state.rowValuesReqId = '';
};

// ONE definition of "the result set just changed shape, so the page number is meaningless".
//
// Every filter-clause and sort reducer below calls it, and that is not defensive tidiness: page 4 of
// a result set filtered down to 30 rows is EMPTY, and an empty grid is how this screen says "no
// recipient matches" — so a forgotten reset does not look like a bug, it looks like an answer. The
// existing `setFilters` (:163) already inlines the same rule; this is the shared spelling for the
// reducers that cannot use it because they edit `Filters` structurally.
//
// Sort resets the page too. The rows on page 4 of an ASC sort are a different set of PEOPLE from the
// rows on page 4 of a DESC sort, so keeping the index silently swaps the population under the
// operator while the pager claims nothing moved.
const resetPage = (state: SendSearchState) => { state.filters.PageIndex = 0; };

export const sendSearchSlice = createSlice({
    name: 'sendSearch',
    initialState,
    reducers: {
        // Any filter change resets to page 0 EXCEPT an explicit page change — a filter edit that kept
        // the page index would fetch page 4 of a 1-page result and render an empty grid that looks
        // like "no matches".
        setFilters: (state, action: { payload: Partial<SendSearchFilters>; type: string }) => {
            state.filters = { ...state.filters, ...action.payload, PageIndex: 0 };
        },
        setPageIndex: (state, action: { payload: number; type: string }) => {
            state.filters.PageIndex = Math.max(action.payload, 0);
        },
        setPageSize: (state, action: { payload: number; type: string }) => {
            state.filters.PageSize = action.payload;
            state.filters.PageIndex = 0;
        },
        clearFilters: (state) => {
            // Channel and PageSize survive "נקה הכל": the channel is not a user filter in V1 (§8 puts
            // a channel facet out of scope) and resetting the page size would fight the pager.
            const keepChannel = state.filters.Channel;
            const keepSize = state.filters.PageSize;
            state.filters = { ...defaultSendSearchFilters(), Channel: keepChannel, PageSize: keepSize };
        },
        // ── column filters (CONTRACT §2) ──────────────────────────────────────────────────────
        // Clauses are stored AS EDITED, half-built ones included: this slice holds "what is on
        // screen", and `toSendSearchRequest` is the one place that decides what is complete enough
        // to send. Storing only complete clauses would make a row the user is still typing into
        // unrenderable.
        setFilterClauses: (state, action: { payload: SendSearchFilterClause[]; type: string }) => {
            state.filters.Filters = action.payload ?? [];
            resetPage(state);
        },
        addFilterClause: (state, action: { payload: SendSearchFilterClause; type: string }) => {
            state.filters.Filters.push(action.payload);
            // The page resets even though a BLANK new clause changes no result yet: it will change
            // them the moment a value is typed, and resetting at both ends is free while forgetting
            // one end is an empty grid that reads as "no matches".
            resetPage(state);
        },
        updateFilterClause: (state, action: { payload: { index: number; clause: SendSearchFilterClause }; type: string }) => {
            const { index, clause } = action.payload;
            // Bounds-checked rather than trusted: a stale index from a component that removed a row
            // in the same tick would otherwise APPEND a clause at `Filters[7]` on a 3-item array,
            // leaving holes that `filter(isClauseComplete)` walks straight into.
            if (index < 0 || index >= state.filters.Filters.length) return;
            state.filters.Filters[index] = clause;
            resetPage(state);
        },
        removeFilterClause: (state, action: { payload: number; type: string }) => {
            const index = action.payload;
            if (index < 0 || index >= state.filters.Filters.length) return;
            state.filters.Filters.splice(index, 1);
            resetPage(state);
        },
        clearFilterClauses: (state) => {
            state.filters.Filters = [];
            resetPage(state);
        },
        // ── sort (CONTRACT §2) ────────────────────────────────────────────────────────────────
        // `fieldKey: null` is the explicit "no user sort" state — the SP's own default order — and is
        // NOT the same as sorting ascending by some field. `desc` is forced false alongside it so two
        // "no sort" states can never differ.
        setSort: (state, action: { payload: { fieldKey: string | null; desc: boolean }; type: string }) => {
            const key = (action.payload?.fieldKey ?? '').trim();
            state.filters.SortField = key.length > 0 ? key : null;
            state.filters.SortDescending = key.length > 0 ? !!action.payload?.desc : false;
            resetPage(state);
        },
        clearSort: (state) => {
            state.filters.SortField = null;
            state.filters.SortDescending = false;
            resetPage(state);
        },
        // ── drawer stack (Mock-v3:341-356) ───────────────────────────────────────────────────
        pushDrawer: (state, action: { payload: DrawerEntry; type: string }) => {
            // Hard depth cap. The mock's stack is rollup → agent → message; a 4th level has no design
            // and no back-label, so it is REFUSED rather than rendered as an unreachable state.
            if (state.drawerStack.length >= MAX_DRAWER_DEPTH) return;
            state.drawerStack.push(action.payload);
        },
        // Esc pops exactly ONE level; when only one level is left, popping closes the drawer
        // (Mock-v3:353 `popD`).
        popDrawer: (state) => {
            state.drawerStack.pop();
            // Popping the LAST level is a close, so the same cleanup runs. Popping an inner level is
            // not: the level underneath is a different person and re-reads its own values on open.
            if (state.drawerStack.length === 0) clearRowValuesState(state);
        },
        // Scrim click / ✕ closes ALL levels (Mock-v3:354 `closeD`).
        closeDrawer: (state) => {
            state.drawerStack = [];
            // The values card is about ONE recipient. Left in the store, it is the next drawer's
            // first paint — someone else's ID numbers and policy numbers under this person's name,
            // for as long as the new fetch is in flight. Cleared here rather than only in the
            // thunk's `pending`, because the next drawer may never fire a fetch at all (a row with
            // no ClientID) and would then render the previous recipient's values indefinitely.
            clearRowValuesState(state);
        },
        clearProvenance: (state) => {
            state.provenance = [];
            state.provenanceCampaignId = null;
            state.provenanceLoading = false;
            state.provenanceError = null;
        },
        // The twin of `clearProvenance`, kept for callers that need to drop the values without
        // touching the drawer stack. NOTE: unlike `clearProvenance` — which is exported but
        // dispatched nowhere in the repo, so provenance is in practice only ever reset by the next
        // fetch's `pending` — the row-values cleanup ALSO runs from `closeDrawer`/`popDrawer` above.
        // Mirroring `clearProvenance` exactly would have produced a cleanup that never runs, and
        // B.4 requires the values to be cleared when the drawer closes.
        clearRowValues: (state) => {
            clearRowValuesState(state);
        },
    },
    extraReducers: (builder) => {
        // Search — only the latest request commits.
        builder.addCase(searchSends.pending, (state, action: any) => {
            state.searchReqId = action.meta.requestId;
            state.loading = true;
            state.error = null;
        });
        builder.addCase(searchSends.fulfilled, (state, action: any) => {
            if (action.meta.requestId !== state.searchReqId) return;   // stale response
            state.loading = false;
            const data = action.payload?.Data;
            if (action.payload?.StatusCode === 405) {
                // The Search endpoint suppresses the WHOLE response when the sub-user carries
                // eSubUserPermissions.HideRecipietns — that is the repo-wide convention (verified
                // across 11 call sites; not one endpoint blanks PII columns and returns 200).
                // Surfaced as its own state, not as a generic failure: "you are not allowed to see
                // recipients" and "the search broke" are different facts, and showing the second for
                // the first sends the operator debugging a working system.
                state.items = [];
                state.totalCount = 0;
                state.error = 'PERMISSION_DENIED';
            } else if (data) {
                state.items = data.Items ?? [];
                state.totalCount = data.TotalCount ?? 0;
                state.error = null;
            } else {
                // A 200 with no Data is a server-side failure that did not throw. Surfacing it as an
                // error is the honest read; leaving the previous rows on screen under new filters is
                // the invisible failure this whole feature exists to prevent.
                state.items = [];
                state.totalCount = 0;
                state.error = action.payload?.Message ?? 'SEARCH_FAILED';
            }
        });
        builder.addCase(searchSends.rejected, (state, action: any) => {
            if (action.meta.requestId !== state.searchReqId) return;
            state.loading = false;
            state.items = [];
            state.totalCount = 0;
            state.error = action.payload?.error ?? action.error?.message ?? 'SEARCH_FAILED';
        });

        // Provenance (drawer) — its own loading flag so it never blanks the grid behind it.
        builder.addCase(getSendProvenance.pending, (state, action: any) => {
            state.provenanceLoading = true;
            state.provenanceCampaignId = action.meta.arg?.campaignId ?? null;
            state.provenance = [];
            state.provenanceError = null;
        });
        builder.addCase(getSendProvenance.fulfilled, (state, action: any) => {
            state.provenanceLoading = false;
            state.provenance = action.payload?.Data ?? [];
            // A 200 whose body carries no `Data` at all is a failure that did not throw — treated as
            // one here, for the same reason `searchSends.fulfilled` does. An empty ARRAY, by contrast,
            // is the normal, meaningful answer for a pre-provenance send and leaves the flag null.
            state.provenanceError = action.payload && 'Data' in action.payload && action.payload.Data != null
                ? null
                : (action.payload?.Message ?? 'PROVENANCE_FAILED');
        });
        builder.addCase(getSendProvenance.rejected, (state, action: any) => {
            state.provenanceLoading = false;
            state.provenance = [];
            state.provenanceError = action.payload?.error ?? action.error?.message ?? 'PROVENANCE_FAILED';
        });

        // Row values (drawer) — same three-case shape as provenance, same reasons.
        builder.addCase(getSendRowValues.pending, (state, action: any) => {
            state.rowValuesLoading = true;
            state.rowValuesClientId = action.meta.arg?.clientId ?? null;
            state.rowValuesReqId = action.meta.requestId;
            // Cleared on PENDING, not only on fulfilled: the previous recipient's values must not
            // stay on screen under the new recipient's name while the request is in flight.
            state.rowValues = [];
            state.rowValuesError = null;
        });
        builder.addCase(getSendRowValues.fulfilled, (state, action: any) => {
            // Stale response: a slower request for a PREVIOUS recipient landing after a newer one.
            // Must return before touching rowValues — writing them here would paint one recipient's
            // values under another's name and rowValuesClientId would not catch it (see :71).
            if (action.meta.requestId !== state.rowValuesReqId) return;
            state.rowValuesLoading = false;
            if (action.payload?.StatusCode === 405) {
                // eSubUserPermissions.HideRecipietns. This endpoint returns raw recipient data, so it
                // is gated where Provenance is not (B.3). Surfaced as its own value rather than as a
                // generic failure: "you may not see recipient data" and "the request broke" are
                // different facts, and the card must not tell the operator to go debug a working
                // system. It is emphatically NOT the empty branch — that one asserts something about
                // the DATA, and we were told nothing about the data.
                state.rowValues = [];
                state.rowValuesError = 'PERMISSION_DENIED';
                return;
            }
            state.rowValues = action.payload?.Data ?? [];
            // A 200 whose body carries no `Data` at all is a failure that did not throw. An empty
            // ARRAY is a legitimate answer (the campaign has no token mapping, B.1) and leaves the
            // flag null so the card can say so in words.
            state.rowValuesError = action.payload && 'Data' in action.payload && action.payload.Data != null
                ? null
                : (action.payload?.Message ?? 'ROWVALUES_FAILED');
        });
        builder.addCase(getSendRowValues.rejected, (state, action: any) => {
            // Same stale guard as fulfilled: a failed OLD request must not clear the values of the
            // recipient the user is actually looking at, nor flip the card into an error state.
            if (action.meta.requestId !== state.rowValuesReqId) return;
            state.rowValuesLoading = false;
            state.rowValues = [];
            state.rowValuesError = action.payload?.error ?? action.error?.message ?? 'ROWVALUES_FAILED';
        });

        // Filter fields — same three-case shape and same stale guard as row values above.
        builder.addCase(getSendSearchFilterFields.pending, (state, action: any) => {
            state.filterFieldsLoading = true;
            state.filterFieldsReqId = action.meta.requestId;
            state.filterFieldsError = null;
            // The PREVIOUS list is deliberately LEFT IN PLACE while the new one is in flight, unlike
            // rowValues (:293) which is cleared. Opposite reasons, both about not lying: row values
            // are one person's data and showing them under another person's name is a false claim,
            // whereas the field list is a menu — blanking it mid-refresh would collapse every open
            // filter row's field selector to "unknown field" and read as "your filters were deleted".
            // Any clause pointing at a field that has genuinely disappeared is rejected by the SP,
            // which is the correct authority for that.
        });
        builder.addCase(getSendSearchFilterFields.fulfilled, (state, action: any) => {
            if (action.meta.requestId !== state.filterFieldsReqId) return;   // stale response
            state.filterFieldsLoading = false;
            if (action.payload?.StatusCode === 405) {
                // eSubUserPermissions.HideRecipietns — the field list describes recipient columns, so
                // it is gated like RowValues is. Its own value, not a generic failure: "you may not
                // see this" and "this broke" are different facts (see :302-312).
                state.filterFields = [];
                state.filterFieldsError = 'PERMISSION_DENIED';
                return;
            }
            state.filterFields = action.payload?.Data ?? [];
            // A 200 whose body carries no `Data` at all is a failure that did not throw. An empty
            // ARRAY is a legitimate answer — an account whose sources have no filterable columns —
            // and leaves the flag null so the bar can say so in words instead of showing an error.
            state.filterFieldsError = action.payload && 'Data' in action.payload && action.payload.Data != null
                ? null
                : (action.payload?.Message ?? 'FILTERFIELDS_FAILED');
        });
        builder.addCase(getSendSearchFilterFields.rejected, (state, action: any) => {
            if (action.meta.requestId !== state.filterFieldsReqId) return;
            state.filterFieldsLoading = false;
            // Cleared HERE but not on pending: a failed fetch means we no longer know what the menu
            // contains, and offering a stale menu next to an error message invites the operator to
            // build a clause against a field we cannot confirm exists.
            state.filterFields = [];
            state.filterFieldsError = action.payload?.error ?? action.error?.message ?? 'FILTERFIELDS_FAILED';
        });
    }
});

export const {
    setFilters, setPageIndex, setPageSize, clearFilters,
    setFilterClauses, addFilterClause, updateFilterClause, removeFilterClause, clearFilterClauses,
    setSort, clearSort,
    pushDrawer, popDrawer, closeDrawer, clearProvenance, clearRowValues,
} = sendSearchSlice.actions;

export default sendSearchSlice.reducer;
