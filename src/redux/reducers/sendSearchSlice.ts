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
    DrawerEntry,
    MAX_DRAWER_DEPTH,
    defaultSendSearchFilters,
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
};

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
        },
        // Scrim click / ✕ closes ALL levels (Mock-v3:354 `closeD`).
        closeDrawer: (state) => {
            state.drawerStack = [];
        },
        clearProvenance: (state) => {
            state.provenance = [];
            state.provenanceCampaignId = null;
            state.provenanceLoading = false;
            state.provenanceError = null;
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
    }
});

export const {
    setFilters, setPageIndex, setPageSize, clearFilters,
    pushDrawer, popDrawer, closeDrawer, clearProvenance,
} = sendSearchSlice.actions;

export default sendSearchSlice.reducer;
