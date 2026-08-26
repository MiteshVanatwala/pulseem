import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';
import { uploaderInstance } from '../../helpers/Api/UploaderAPI';
import {
    GroupDto,
    ItemDto,
    ChangeRowDto,
    ClalCenterConfig,
    GetTreeResponse,
    SaveGroupRequest,
    ReorderGroupsRequest,
    ReorderItemsRequest,
    SaveItemRequest,
    PublishRequest,
    PublishResult,
    UpdatedResult,
    SaveGroupResult,
    UploadFileResponse,
    ClalErrorKey,
    eClalItemStatus,
    eClalEntityType
} from '../../Models/ClalCenter/ClalCenter';
import {
    mockGetTree, mockSaveGroup, mockDeleteGroup, mockRestoreGroup, mockReorderGroups,
    mockSetGroupVisibility, mockSaveItem, mockSetStatus, mockDeleteItem, mockRestoreItem,
    mockReorderItems, mockUploadFile, mockPublish, mockGetHistory
} from './_mocks/clalCenterMock';

// ── MOCK SWITCH ──────────────────────────────────────────────────────────────
// While the API (W2) is not wired, every call short-circuits to a mock. The single dedicated
// "mock switch" commit by W5, right after the API merges, flips this to false, deletes
// ./_mocks/clalCenterMock.ts (THE FILE ONLY — the folder is shared), removes the guard lines and
// the mock imports, and re-runs the W3 acceptance criteria against the real API. After that,
// `Select-String` over src for USE_CC_MOCK|clalCenterMock must return 0.
// The exact lines are listed in src/screens/ClalCenter/FLIP-NOTES.md.
const USE_CC_MOCK = true;

const api = 'ClalCenter/';

type LoadStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

const KNOWN_ERROR_KEYS: ClalErrorKey[] = [
    'title_required', 'url_required', 'url_invalid', 'infotext_required', 'file_required',
    'ext_not_allowed', 'file_too_large', 'keywords_too_long', 'group_not_empty', 'publish_failed',
    'publish_partial', 'depth_exceeded', 'tenant_forbidden', 'server_error'
];

/**
 * Turn ANYTHING that comes out of a failed call into one of the contract's error keys.
 *
 * ⚠️ THE REASON THIS EXISTS (platform bug #9, 99-KNOWN-BUGS): the response interceptor at
 * `PulseemReactAPI.ts:74-81` — the instance behind EVERY ClalCenter call, not just uploads —
 * does `error.response.status` with no undefined guard. On a timeout or a dropped connection
 * there IS no `response`, so the interceptor itself throws a `TypeError`, and that TypeError is
 * what the caller receives instead of the API's error body. Without this funnel the entire
 * micro-copy table in §C6 would never render once. `UploaderAPI.ts:48-55` carries the same bug.
 *
 * Anything unrecognised degrades to `server_error` → "אירעה שגיאה". A TypeError's `.message`
 * ("Cannot read properties of undefined…") must never leak into a toast, which is why the value
 * is accepted only when it is a key the contract actually defines.
 */
export const toErrorKey = (error: any): ClalErrorKey => {
    const candidate = error?.Message ?? error?.Data?.Message ?? error?.message;
    if (typeof candidate === 'string' && KNOWN_ERROR_KEYS.indexOf(candidate as ClalErrorKey) > -1) {
        return candidate as ClalErrorKey;
    }
    if (error?.StatusCode === 403) return 'tenant_forbidden';
    return 'server_error';
};

/**
 * The house envelope is `{ StatusCode, Message, Data }` and the semantic code travels INSIDE it
 * (§C7: 0 OK · 400 validation · 403 · 500), so a non-zero StatusCode on an HTTP 200 is still a
 * failure and has to be raised, not returned. A controller that answers with the bare payload
 * (no StatusCode) is passed through untouched.
 */
const unwrap = <T,>(data: any): T => {
    if (data && typeof data === 'object' && typeof data.StatusCode === 'number') {
        if (data.StatusCode !== 0 && data.StatusCode !== 200) {
            // Deliberately a PLAIN OBJECT, not an Error: it has to be indistinguishable from what
            // the axios interceptor rejects with (the parsed PulseemResponse body), so
            // `toErrorKey` has exactly ONE shape to read — whether the failure arrived as an HTTP
            // error or as a non-zero StatusCode on an HTTP 200.
            // eslint-disable-next-line no-throw-literal
            throw { StatusCode: data.StatusCode, Message: data.Message };
        }
        return data.Data as T;
    }
    return data as T;
};

export interface ClalCenterState {
    groups: GroupDto[];
    items: ItemDto[];
    config: ClalCenterConfig | null;
    loadStatus: LoadStatus;
    /** The last error KEY (not a sentence) — the screen maps it through i18n. */
    error: ClalErrorKey | '';
}

const initialState: ClalCenterState = {
    groups: [],
    items: [],
    config: null,
    loadStatus: 'idle',
    error: ''
};

// ── Thunks ───────────────────────────────────────────────────────────────────
// Every one of them is wrapped: the catch swallows TypeError too, via toErrorKey.

export const getClalTree = createAsyncThunk(
    'ClalCenter/GetTree', async (_: void, thunkAPI) => {
        if (USE_CC_MOCK) return mockGetTree();
        try {
            const response = await PulseemReactInstance.get(`${api}GetTree`);
            return unwrap<GetTreeResponse>(response.data);
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: toErrorKey(error) });
        }
    });

export const saveClalGroup = createAsyncThunk(
    'ClalCenter/SaveGroup', async (req: SaveGroupRequest, thunkAPI) => {
        if (USE_CC_MOCK) {
            try { return await mockSaveGroup(req); }
            catch (error: any) { return thunkAPI.rejectWithValue({ error: toErrorKey(error) }); }
        }
        try {
            const response = await PulseemReactInstance.post(`${api}SaveGroup`, req);
            return unwrap<SaveGroupResult>(response.data);
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: toErrorKey(error) });
        }
    });

export const deleteClalGroup = createAsyncThunk(
    'ClalCenter/DeleteGroup', async (req: { GroupID: number }, thunkAPI) => {
        if (USE_CC_MOCK) {
            try { return await mockDeleteGroup(req); }
            catch (error: any) { return thunkAPI.rejectWithValue({ error: toErrorKey(error) }); }
        }
        try {
            const response = await PulseemReactInstance.post(`${api}DeleteGroup`, req);
            return unwrap<UpdatedResult>(response.data);
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: toErrorKey(error) });
        }
    });

export const restoreClalGroup = createAsyncThunk(
    'ClalCenter/RestoreGroup', async (req: { GroupID: number }, thunkAPI) => {
        if (USE_CC_MOCK) {
            try { return await mockRestoreGroup(req); }
            catch (error: any) { return thunkAPI.rejectWithValue({ error: toErrorKey(error) }); }
        }
        try {
            const response = await PulseemReactInstance.post(`${api}RestoreGroup`, req);
            return unwrap<UpdatedResult>(response.data);
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: toErrorKey(error) });
        }
    });

export const reorderClalGroups = createAsyncThunk(
    'ClalCenter/ReorderGroups', async (req: ReorderGroupsRequest, thunkAPI) => {
        if (USE_CC_MOCK) {
            try { return await mockReorderGroups(req); }
            catch (error: any) { return thunkAPI.rejectWithValue({ error: toErrorKey(error) }); }
        }
        try {
            const response = await PulseemReactInstance.post(`${api}ReorderGroups`, req);
            return unwrap<UpdatedResult>(response.data);
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: toErrorKey(error) });
        }
    });

export const setClalGroupVisibility = createAsyncThunk(
    'ClalCenter/SetGroupVisibility', async (req: { GroupID: number; IsHidden: boolean }, thunkAPI) => {
        if (USE_CC_MOCK) {
            try { return await mockSetGroupVisibility(req); }
            catch (error: any) { return thunkAPI.rejectWithValue({ error: toErrorKey(error) }); }
        }
        try {
            const response = await PulseemReactInstance.post(`${api}SetGroupVisibility`, req);
            return unwrap<UpdatedResult>(response.data);
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: toErrorKey(error) });
        }
    });

export const saveClalItem = createAsyncThunk(
    'ClalCenter/SaveItem', async (req: SaveItemRequest, thunkAPI) => {
        if (USE_CC_MOCK) {
            try { return await mockSaveItem(req); }
            catch (error: any) { return thunkAPI.rejectWithValue({ error: toErrorKey(error) }); }
        }
        try {
            const response = await PulseemReactInstance.post(`${api}SaveItem`, req);
            return unwrap<ItemDto>(response.data);
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: toErrorKey(error) });
        }
    });

export const setClalItemStatus = createAsyncThunk(
    'ClalCenter/SetStatus', async (req: { ItemID: number; Status: eClalItemStatus }, thunkAPI) => {
        if (USE_CC_MOCK) {
            try { return await mockSetStatus(req); }
            catch (error: any) { return thunkAPI.rejectWithValue({ error: toErrorKey(error) }); }
        }
        try {
            const response = await PulseemReactInstance.post(`${api}SetStatus`, req);
            return unwrap<UpdatedResult>(response.data);
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: toErrorKey(error) });
        }
    });

export const deleteClalItem = createAsyncThunk(
    'ClalCenter/DeleteItem', async (req: { ItemID: number }, thunkAPI) => {
        if (USE_CC_MOCK) {
            try { return await mockDeleteItem(req); }
            catch (error: any) { return thunkAPI.rejectWithValue({ error: toErrorKey(error) }); }
        }
        try {
            const response = await PulseemReactInstance.post(`${api}DeleteItem`, req);
            return unwrap<UpdatedResult>(response.data);
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: toErrorKey(error) });
        }
    });

export const restoreClalItem = createAsyncThunk(
    'ClalCenter/RestoreItem', async (req: { ItemID: number }, thunkAPI) => {
        if (USE_CC_MOCK) {
            try { return await mockRestoreItem(req); }
            catch (error: any) { return thunkAPI.rejectWithValue({ error: toErrorKey(error) }); }
        }
        try {
            const response = await PulseemReactInstance.post(`${api}RestoreItem`, req);
            return unwrap<UpdatedResult>(response.data);
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: toErrorKey(error) });
        }
    });

export const reorderClalItems = createAsyncThunk(
    'ClalCenter/ReorderItems', async (req: ReorderItemsRequest, thunkAPI) => {
        if (USE_CC_MOCK) {
            try { return await mockReorderItems(req); }
            catch (error: any) { return thunkAPI.rejectWithValue({ error: toErrorKey(error) }); }
        }
        try {
            const response = await PulseemReactInstance.post(`${api}ReorderItems`, req);
            return unwrap<UpdatedResult>(response.data);
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: toErrorKey(error) });
        }
    });

/** Empty body ⇒ rebuild-only: applies hides/deletes/restores without promoting any draft. */
export const publishClalCenter = createAsyncThunk(
    'ClalCenter/Publish', async (req: PublishRequest, thunkAPI) => {
        if (USE_CC_MOCK) {
            try { return await mockPublish(req); }
            catch (error: any) { return thunkAPI.rejectWithValue({ error: toErrorKey(error) }); }
        }
        try {
            const response = await PulseemReactInstance.post(`${api}Publish`, req);
            return unwrap<PublishResult>(response.data);
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: toErrorKey(error) });
        }
    });

// ── Plain async calls (screen-local data — deliberately NOT in the store) ─────
// History is a drawer that opens, reads and closes; upload progress belongs to one field in one
// drawer. Parking either in redux would only add a second copy of state to keep in sync.

export async function getClalHistory(
    entityType: eClalEntityType,
    entityId: number,
    top = 50
): Promise<ChangeRowDto[]> {
    if (USE_CC_MOCK) return mockGetHistory(entityType, entityId, top);
    const response = await PulseemReactInstance.get(`${api}GetHistory`, {
        params: { entityType, entityId, top }
    });
    return unwrap<ChangeRowDto[]>(response.data);
}

export async function uploadClalFile(
    file: File,
    onProgress?: (percent: number) => void
): Promise<UploadFileResponse> {
    if (USE_CC_MOCK) {
        // The real request reports progress; the mock has to, or the progress bar is untested.
        let p = 0;
        const tick = setInterval(() => {
            p = Math.min(95, p + 17);
            onProgress?.(p);
        }, 120);
        try {
            const result = await mockUploadFile(file);
            onProgress?.(100);
            return result;
        } finally {
            clearInterval(tick);
        }
    }
    const form = new FormData();
    form.append('file', file, file.name);
    const response = await uploaderInstance.put(`${api}UploadFile`, form, {
        onUploadProgress: (e: any) => {
            if (!onProgress || !e?.total) return;
            onProgress(Math.min(100, Math.round((e.loaded * 100) / e.total)));
        }
    });
    return unwrap<UploadFileResponse>(response.data);
}

// ── Slice ────────────────────────────────────────────────────────────────────

const resequence = <T extends { SortOrder: number }>(rows: T[], orderedIds: number[], idOf: (r: T) => number) => {
    // Exactly what SP3/SP6 do: (index+1)*10, and ONLY for the ids that were sent. Keeping the
    // client formula identical is what lets the reorder path skip a GetTree (C6 v12 §7).
    orderedIds.forEach((id, index) => {
        const row = rows.find(r => idOf(r) === id);
        if (row) row.SortOrder = (index + 1) * 10;
    });
};

export const clalCenterSlice = createSlice({
    name: 'clalCenter',
    initialState,
    reducers: {
        /** Optimistic category / sub-group reorder — applied before the network, per §3.7. */
        applyLocalGroupOrder(state, { payload }: { payload: { parentId: number | null; orderedIds: number[] } }) {
            resequence(state.groups, payload.orderedIds, g => g.GroupID);
        },
        /** Optimistic item reorder inside one group. */
        applyLocalItemOrder(state, { payload }: { payload: { groupId: number; orderedIds: number[] } }) {
            resequence(state.items, payload.orderedIds, i => i.ItemID);
        },
        /** Optimistic cross-category move of a sub-group (level 2 is the only level that crosses). */
        applyLocalGroupReparent(
            state,
            { payload }: { payload: { groupId: number; newParentId: number; orderedIds: number[] } }
        ) {
            const row = state.groups.find(g => g.GroupID === payload.groupId);
            if (row) row.ParentGroupID = payload.newParentId;
            resequence(state.groups, payload.orderedIds, g => g.GroupID);
        },
        /** Snap-back target: the exact tree as it was before the optimistic burst. */
        restoreTreeSnapshot(state, { payload }: { payload: { groups: GroupDto[]; items: ItemDto[] } }) {
            state.groups = payload.groups;
            state.items = payload.items;
        },
        /**
         * §3.7 / C6 v12 §7: reorder does not refresh GetTree, so the badge has to be computed
         * here. Conservative by design — never turned OFF from the client.
         */
        markPendingSiteUpdate(state) {
            if (state.config) state.config.PendingSiteUpdate = true;
        },
        clearClalError(state) {
            state.error = '';
        }
    },
    extraReducers: builder => {
        builder
            .addCase(getClalTree.pending, state => {
                // 'succeeded' stays put so a background refresh does not blank a populated tree.
                // 'failed' must NOT stay put: a retry has to show the loading row, or the button
                // appears dead and a second failure looks identical to the first.
                state.loadStatus = state.loadStatus === 'succeeded' ? 'succeeded' : 'loading';
            })
            .addCase(getClalTree.fulfilled, (state, { payload }: any) => {
                state.loadStatus = 'succeeded';
                state.groups = payload?.Groups ?? [];
                state.items = payload?.Items ?? [];
                state.config = payload?.Config ?? null;
                state.error = '';
            })
            .addCase(getClalTree.rejected, (state, { payload }: any) => {
                state.loadStatus = 'failed';
                state.error = payload?.error ?? 'server_error';
            });
    }
});

export const {
    applyLocalGroupOrder,
    applyLocalItemOrder,
    applyLocalGroupReparent,
    restoreTreeSnapshot,
    markPendingSiteUpdate,
    clearClalError
} = clalCenterSlice.actions;

export default clalCenterSlice.reducer;
