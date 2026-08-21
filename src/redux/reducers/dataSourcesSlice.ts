import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';
import { uploaderInstance } from '../../helpers/Api/UploaderAPI';
import { ERROR_TYPE } from '../../helpers/Types/common';
import {
    DataSourceListItem,
    DataSourceDetails,
    DataSourceColumn,
    DataSourceVersion,
    DataSourceRow,
    DataSourceLimits,
    GetManyRequest,
    GetRowsRequest,
    UpdateDataSourceRequest,
    UpdateColumnMetaRequest,
    ExportRequest
} from '../../Models/DataSources/DataSource';
import {
    mockGetMany, mockGet, mockGetRows, mockCheckQuota,
    mockInsert, mockUpdate, mockUpdateColumnMeta, mockDelete, mockExport
} from './_mocks/dataSourcesMock';

// ── MOCK SWITCH ──────────────────────────────────────────────────────────────
// While the API (M1) is not wired, every thunk short-circuits to a mock. The single
// dedicated "mock switch" commit right after the API PR merges flips this to false,
// deletes ./_mocks/dataSourcesMock.ts, removes the guard lines, and re-runs the M2/M3
// acceptance criteria against the real API. grep USE_DS_MOCK / _mocks must return 0 after.
const USE_DS_MOCK = false;

const api = 'DataSources/';

type LoadStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface DataSourcesState {
    list: { items: DataSourceListItem[]; total: number; page: number; pageSize: number } | null;
    listStatus: LoadStatus; // silent polling never touches this
    current: { details: DataSourceDetails; columns: DataSourceColumn[]; versions: DataSourceVersion[] } | null;
    rows: { columns: DataSourceColumn[]; items: DataSourceRow[]; total: number } | null;
    rowsStatus: LoadStatus;
    uploadProgress: number | null; // step A (network) progress
    quota: { IsAllowed: boolean; Message: string; Limits: DataSourceLimits } | null;
    error: string;
    // Latest-request ids — used to drop out-of-order getRows/getDataSource responses (rapid paging/nav).
    currentReqId: string;
    rowsReqId: string;
    ToastMessages: { [k: string]: ERROR_TYPE };
}

// ── Thunks ───────────────────────────────────────────────────────────────────
// House rules: return response.data (NO JSON.parse — the new controller returns an object,
// like FileUploadsController); catch → thunkAPI.rejectWithValue({ error: error.message }).

export const getDataSources = createAsyncThunk(
    'DataSources/GetMany', async (req: GetManyRequest, thunkAPI) => {
        if (USE_DS_MOCK) return mockGetMany(req);
        try {
            const response = await PulseemReactInstance.get(`${api}GetMany`, {
                params: { search: req.SearchTerm, page: req.PageIndex, pageSize: req.PageSize }
            });
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const getDataSource = createAsyncThunk(
    'DataSources/Get', async (id: number, thunkAPI) => {
        if (USE_DS_MOCK) return mockGet(id);
        try {
            const response = await PulseemReactInstance.get(`${api}Get/${id}`);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const getRows = createAsyncThunk(
    'DataSources/GetRows', async (req: GetRowsRequest, thunkAPI) => {
        if (USE_DS_MOCK) return mockGetRows(req);
        try {
            const response = await PulseemReactInstance.post(`${api}GetRows`, req);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const insertDataSource = createAsyncThunk(
    'DataSources/Insert', async (formData: FormData, thunkAPI) => {
        if (USE_DS_MOCK) return mockInsert(formData);
        try {
            const response = await uploaderInstance.post(`${api}Insert`, formData, {
                onUploadProgress: (progressEvent: any) => {
                    const { loaded, total } = progressEvent;
                    const percent = Math.floor(loaded * 100 / total);
                    thunkAPI.dispatch(setUploadProgress(percent));
                }
            });
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const updateDataSource = createAsyncThunk(
    'DataSources/Update', async (req: UpdateDataSourceRequest, thunkAPI) => {
        if (USE_DS_MOCK) return mockUpdate(req);
        try {
            const response = await PulseemReactInstance.put(`${api}Update`, req);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const updateColumnMeta = createAsyncThunk(
    'DataSources/UpdateColumnMeta', async (req: UpdateColumnMetaRequest, thunkAPI) => {
        if (USE_DS_MOCK) return mockUpdateColumnMeta(req);
        try {
            const response = await PulseemReactInstance.put(`${api}UpdateColumnMeta`, req);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const deleteDataSource = createAsyncThunk(
    'DataSources/Delete', async (id: number, thunkAPI) => {
        if (USE_DS_MOCK) return mockDelete(id);
        try {
            const response = await PulseemReactInstance.delete(`${api}Delete/${id}`);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const exportDataSource = createAsyncThunk(
    'DataSources/Export', async (req: ExportRequest, thunkAPI) => {
        if (USE_DS_MOCK) return mockExport(req);
        try {
            const response = await PulseemReactInstance.post(`${api}Export`, req);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const checkQuota = createAsyncThunk(
    'DataSources/CheckQuota', async (_, thunkAPI) => {
        if (USE_DS_MOCK) return mockCheckQuota();
        try {
            const response = await PulseemReactInstance.get(`${api}CheckQuota`);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

// ── Slice ────────────────────────────────────────────────────────────────────

const initialState: DataSourcesState = {
    list: null,
    listStatus: 'idle',
    current: null,
    rows: null,
    rowsStatus: 'idle',
    uploadProgress: null,
    quota: null,
    error: '',
    currentReqId: '',
    rowsReqId: '',
    // message = i18n key (Toast runs it through t()). showAnimtionCheck spelling is intentional (matches ERROR_TYPE).
    ToastMessages: {
        GENERAL_ERROR: { severity: 'error', color: 'error', message: 'DataSources.errors.generalError', showAnimtionCheck: false },
        SOURCE_CREATED: { severity: 'success', color: 'success', message: 'DataSources.toasts.created', showAnimtionCheck: true },
        SOURCE_READY: { severity: 'success', color: 'success', message: 'DataSources.toasts.ready', showAnimtionCheck: true },
        SOURCE_FAILED: { severity: 'error', color: 'error', message: 'DataSources.toasts.failed', showAnimtionCheck: false },
        SOURCE_UPDATED: { severity: 'success', color: 'success', message: 'DataSources.toasts.updated', showAnimtionCheck: true },
        SOURCE_DELETED: { severity: 'success', color: 'success', message: 'DataSources.toasts.deleted', showAnimtionCheck: true },
        COLUMN_UPDATED: { severity: 'success', color: 'success', message: 'DataSources.toasts.columnUpdated', showAnimtionCheck: true },
        EXPORT_STARTED: { severity: 'success', color: 'success', message: 'DataSources.toasts.exportStarted', showAnimtionCheck: true },
        EXPORT_READY: { severity: 'success', color: 'success', message: 'DataSources.export.ready', showAnimtionCheck: true },
        NAME_EXISTS: { severity: 'error', color: 'error', message: 'DataSources.errors.nameExists', showAnimtionCheck: false },
        UPLOAD_IN_PROGRESS: { severity: 'error', color: 'error', message: 'DataSources.errors.uploadInProgress', showAnimtionCheck: false },
        QUOTA_EXCEEDED: { severity: 'error', color: 'error', message: 'DataSources.errors.quotaExceeded', showAnimtionCheck: false },
        FEATURE_BLOCKED: { severity: 'error', color: 'error', message: 'DataSources.errors.featureNotAvailable', showAnimtionCheck: false }
    }
};

export const dataSourcesSlice = createSlice({
    name: 'dataSources',
    initialState,
    reducers: {
        setUploadProgress: (state, action) => {
            state.uploadProgress = action.payload;
        },
        clearCurrent: (state) => {
            state.current = null;
        },
        clearRows: (state) => {
            state.rows = null;
            state.rowsStatus = 'idle';
        }
    },
    extraReducers: (builder) => {
        // GetMany — silent polling must not touch listStatus (prevents flicker)
        builder.addCase(getDataSources.pending, (state, action) => {
            if (!action.meta.arg?.silent) state.listStatus = 'loading';
        });
        builder.addCase(getDataSources.fulfilled, (state, action: any) => {
            const data = action.payload?.Data;
            if (data) state.list = { items: data.items, total: data.total, page: data.page, pageSize: data.pageSize };
            if (!action.meta.arg?.silent) state.listStatus = 'succeeded';
        });
        builder.addCase(getDataSources.rejected, (state, action) => {
            if (!action.meta.arg?.silent) state.listStatus = 'failed';
        });

        // Get (details + columns + versions) — only the latest request commits (out-of-order guard)
        builder.addCase(getDataSource.pending, (state, action: any) => {
            state.currentReqId = action.meta.requestId;
            state.current = null;
        });
        builder.addCase(getDataSource.fulfilled, (state, action: any) => {
            if (action.meta.requestId !== state.currentReqId) return; // stale response
            state.current = action.payload?.Data ?? null;
        });
        builder.addCase(getDataSource.rejected, (state, action: any) => {
            if (action.meta.requestId !== state.currentReqId) return;
            state.error = action.error?.message ?? 'getDataSource failed';
        });

        // GetRows — only the latest request commits (rapid paging/filtering can resolve out of order)
        builder.addCase(getRows.pending, (state, action: any) => {
            state.rowsReqId = action.meta.requestId;
            state.rowsStatus = 'loading';
        });
        builder.addCase(getRows.fulfilled, (state, action: any) => {
            if (action.meta.requestId !== state.rowsReqId) return; // stale response
            const data = action.payload?.Data;
            if (data) state.rows = { columns: data.columns, items: data.rows, total: data.total };
            state.rowsStatus = 'succeeded';
        });
        builder.addCase(getRows.rejected, (state, action: any) => {
            if (action.meta.requestId !== state.rowsReqId) return;
            state.rowsStatus = 'failed';
        });

        // Insert — reset the network-progress bar when the request settles
        builder.addCase(insertDataSource.fulfilled, (state) => {
            state.uploadProgress = null;
        });
        builder.addCase(insertDataSource.rejected, (state) => {
            state.uploadProgress = null;
        });

        // CheckQuota
        builder.addCase(checkQuota.fulfilled, (state, action: any) => {
            state.quota = action.payload?.Data ?? null;
        });
    }
});

export const { setUploadProgress, clearCurrent, clearRows } = dataSourcesSlice.actions;

export default dataSourcesSlice.reducer;
