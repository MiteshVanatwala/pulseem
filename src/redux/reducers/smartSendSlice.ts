import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';
import { ERROR_TYPE } from '../../helpers/Types/common';
import {
    eSendChannel, CHANNELS, getChannelDescriptor,
    GetMappingResult, SaveMappingRequest, SmartSendTokenInfo, SmartSendColumn,
    SmartSendDataSourceInfo, FillSummary, SmartSendListItem
} from '../../Models/DataSources/SmartSend';
import {
    getSendSummary, getEmailSendSettings, setEmailSendSettings,
    getNewsletterPreview, saveCampaignInfo, getCampaignInfo
} from './newsletterSlice';
import { testSend } from './campaignEditorSlice';
import { getDataSource } from './dataSourcesSlice';
import {
    mockGetMapping, mockSetMapping, mockGetSampleValues, mockFillAndSummarize, mockSendSmart,
    mockGetSendSummary, mockGetEmailSendSettings, mockSetEmailSendSettings,
    mockGetNewsletterPreview, mockTestSend, mockSaveCampaignInfo, mockGetCampaignInfo,
    mockGetSmartSendList
} from './_mocks/smartSendMock';

// ── MOCK SWITCH ──────────────────────────────────────────────────────────────
// While the API (M4-M5) is not deployed, every thunk short-circuits to a mock —
// INCLUDING the wrapper-thunks over the reused newsletter/campaignEditor thunks
// (§7.1: the reused pipeline must obey the switch too; SmartSend components call
// ONLY the wrappers). The single dedicated flip commit after the API deploys sets
// this to false, deletes ./_mocks/smartSendMock.ts and removes the guard lines.
// grep USE_SEND_MOCK / smartSendMock must return 0 after the flip.
const USE_SEND_MOCK = false;

const api = 'DataSourcesSender/';

type LoadStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface SmartSendState {
    campaignId: number | null;
    dataSourceId: number | null;              // entry A (?dataSourceId=) — preselects the source
    selectedChannel: eSendChannel;
    isMapped: boolean;
    dataSource: SmartSendDataSourceInfo | null;
    lockedVersionId: number | null;
    tokens: SmartSendTokenInfo[];
    columns: SmartSendColumn[];
    columnsReqId: string;                     // latest loadSourceColumns request — drops out-of-order responses
    tokenMap: { [token: string]: number | null };   // the working (unsaved) mapping
    supervisorColumnId: number | null;
    gapColumnId: number | null;
    sortColumnId: number | null;
    syntheticGroupId: number | null;
    foreignSyntheticGroupId: number | null;   // clone detection (PO decision #6)
    foreignSyntheticGroupName: string | null;
    isStale: boolean;
    mismatch: boolean;
    sampleValues: { [token: string]: string } | null;
    fillSummary: FillSummary | null;
    sendResult: any | null;                   // the raw PulseemResponse of Send — UI branches on StatusCode
    mappingStatus: LoadStatus;
    mappingError: number | null;              // StatusCode of a failed getMapping (404/927 → distinct UI, §16)
    columnsStatus: LoadStatus;                // loadSourceColumns lifecycle (spinner/retry for the source-column load)
    saveStatus: LoadStatus;
    // Session-B · the DataSources "Smart Send" management-tab list (own state; the tab
    // reads s.smartSend.smartSendList). Shape mirrors dataSourcesSlice.list.
    smartSendList: { items: SmartSendListItem[]; total: number; page: number; pageSize: number } | null;
    smartSendListStatus: LoadStatus;
    ToastMessages: { [k: string]: ERROR_TYPE };
}

// ── Own thunks (the new DataSourcesSender endpoints) ─────────────────────────
// House rules (dataSourcesSlice convention): return response.data (NO JSON.parse),
// catch → thunkAPI.rejectWithValue({ error: error.message }).

export const getMapping = createAsyncThunk(
    'SmartSend/GetMapping', async (campaignId: number, thunkAPI) => {
        if (USE_SEND_MOCK) return mockGetMapping(campaignId);
        try {
            const response = await PulseemReactInstance.get(`${api}GetMapping/${campaignId}`);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const setMapping = createAsyncThunk(
    'SmartSend/SetMapping', async (req: SaveMappingRequest, thunkAPI) => {
        if (USE_SEND_MOCK) return mockSetMapping(req);
        try {
            const response = await PulseemReactInstance.post(`${api}SetMapping`, req);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const getSampleValues = createAsyncThunk(
    'SmartSend/GetSampleValues', async (campaignId: number, thunkAPI) => {
        if (USE_SEND_MOCK) return mockGetSampleValues(campaignId);
        try {
            const response = await PulseemReactInstance.get(`${api}GetSampleValues/${campaignId}`);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const fillAndSummarize = createAsyncThunk(
    'SmartSend/FillAndSummarize', async (arg: { campaignId: number; channel: eSendChannel }, thunkAPI) => {
        if (USE_SEND_MOCK) return mockFillAndSummarize(arg.campaignId, arg.channel);
        try {
            const response = await PulseemReactInstance.post(`${api}FillAndSummarize/${arg.campaignId}`, { Channel: arg.channel });
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const sendSmart = createAsyncThunk(
    'SmartSend/Send', async (arg: { campaignId: number; sendToSupervisor: boolean; channel: eSendChannel }, thunkAPI) => {
        if (USE_SEND_MOCK) return mockSendSmart(arg.campaignId, arg.sendToSupervisor, arg.channel);
        try {
            const response = await PulseemReactInstance.put(
                `${api}Send/${arg.campaignId}?sendToSupervisor=${arg.sendToSupervisor}&channel=${arg.channel}`);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

// Session-B · the management-tab list (GET DataSourcesSender/GetList). Read-only, gated
// server-side by CheckAccess only (like GetMapping). MOCK-GATED like every own thunk until
// the API deploys. Paging is rowsToSkip/pageSize (server contract), computed by the tab.
export const getSmartSendList = createAsyncThunk(
    'SmartSend/GetList', async (arg: { search?: string; outdatedOnly?: boolean; channel?: eSendChannel; pageSize?: number; rowsToSkip?: number }, thunkAPI) => {
        if (USE_SEND_MOCK) return mockGetSmartSendList(arg);
        try {
            const qs = new URLSearchParams();
            if (arg.search) qs.set('search', arg.search);
            if (arg.outdatedOnly) qs.set('outdatedOnly', String(arg.outdatedOnly));
            if (arg.channel != null) qs.set('channel', String(arg.channel));
            if (arg.pageSize != null) qs.set('pageSize', String(arg.pageSize));
            if (arg.rowsToSkip != null) qs.set('rowsToSkip', String(arg.rowsToSkip));
            const response = await PulseemReactInstance.get(`${api}GetList?${qs.toString()}`);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

// ── Wrapper-thunks over the REUSED pipeline (§7.1) ───────────────────────────
// SmartSend components call ONLY these. In mock mode they return fixtures. TWO of
// them (summary / send-settings) additionally HYDRATE the reused slice state by
// dispatching the original thunks' fulfilled actions, so reused components
// (SummaryDialog) read the same state they would against the real API. The PREVIEW
// wrapper's dispatch is NOT hydration: getNewsletterPreview has NO reducer case
// anywhere, and EmailPreviewComponent (EmailPreviewComponent.js:18-23) reads its
// OWN dispatch result rather than slice state — the dispatch is kept only for
// action-stream parity. That component still self-dispatches the REAL
// getNewsletterPreview (which would hit the network in mock mode), so it MUST be
// parameterized/replaced at M9 (the §7.1 trap). The write/info wrappers have no
// consumed reducer state — no hydration needed. In real mode every wrapper
// delegates to the original thunk (its own reducers fire normally).

// newsletterSlice and campaignEditorSlice are plain JS. Their createAsyncThunk payload creators
// carry no type annotations, so the TS build cannot infer a ThunkArg for the thunks they export
// and falls back to `void` — which makes every `getSendSummary(campaignId)` below fail the build
// with TS2554 "Expected 0 arguments, but got 1". The calls are correct at runtime: the argument
// reaches the payload creator exactly as it does from the JS screens that already call these.
// `jsThunk` restores the argument in the type system only; it compiles away and changes nothing
// that runs. Drop it if those two slices are ever converted to TS with typed payload creators.
const jsThunk = (t: any) => t as (arg?: any) => any;

export const getSendSummaryWrapped = createAsyncThunk(
    'SmartSend/GetSendSummaryWrapped', async (campaignId: number, thunkAPI) => {
        if (USE_SEND_MOCK) {
            const fixture = mockGetSendSummary(campaignId);
            thunkAPI.dispatch({ type: getSendSummary.fulfilled.type, payload: fixture });
            return fixture;
        }
        const res: any = await thunkAPI.dispatch(jsThunk(getSendSummary)(campaignId));
        return res.payload;
    });

export const getEmailSendSettingsWrapped = createAsyncThunk(
    'SmartSend/GetEmailSendSettingsWrapped', async (campaignId: number, thunkAPI) => {
        if (USE_SEND_MOCK) {
            const fixture = mockGetEmailSendSettings(campaignId);
            thunkAPI.dispatch({ type: getEmailSendSettings.fulfilled.type, payload: fixture });
            return fixture;
        }
        const res: any = await thunkAPI.dispatch(jsThunk(getEmailSendSettings)(campaignId));
        return res.payload;
    });

export const setEmailSendSettingsWrapped = createAsyncThunk(
    'SmartSend/SetEmailSendSettingsWrapped', async (payload: any, thunkAPI) => {
        // CONTRACT (§10 companion): the caller (M9) always includes SyntheticGroupID
        // BOTH in GroupList (array) AND in GroupIds (CSV) — the CSV is authoritative
        // server-side (SendSettings.cs GroupList is a getter-only computed property).
        if (USE_SEND_MOCK) return mockSetEmailSendSettings(payload);
        const res: any = await thunkAPI.dispatch(jsThunk(setEmailSendSettings)(payload));
        return res.payload;
    });

export const getNewsletterPreviewWrapped = createAsyncThunk(
    'SmartSend/GetNewsletterPreviewWrapped', async (campaignId: number, thunkAPI) => {
        if (USE_SEND_MOCK) {
            const fixture = mockGetNewsletterPreview(campaignId);
            // No-op for STATE (getNewsletterPreview has no reducer case) — kept for
            // action-stream parity only. SmartSendPreview (M9) consumes the returned
            // fixture directly; EmailPreviewComponent must be parameterized at M9.
            thunkAPI.dispatch({ type: getNewsletterPreview.fulfilled.type, payload: fixture });
            return fixture;
        }
        const res: any = await thunkAPI.dispatch(jsThunk(getNewsletterPreview)(campaignId));
        return res.payload;
    });

export const saveCampaignInfoWrapped = createAsyncThunk(
    'SmartSend/SaveCampaignInfoWrapped', async (info: any, thunkAPI) => {
        if (USE_SEND_MOCK) return mockSaveCampaignInfo(info);
        const res: any = await thunkAPI.dispatch(jsThunk(saveCampaignInfo)(info));
        return res.payload;
    });

export const getCampaignInfoWrapped = createAsyncThunk(
    'SmartSend/GetCampaignInfoWrapped', async (campaignId: number, thunkAPI) => {
        if (USE_SEND_MOCK) return mockGetCampaignInfo(campaignId);
        const res: any = await thunkAPI.dispatch(jsThunk(getCampaignInfo)(campaignId));
        return res.payload;
    });

// Test send lives in campaignEditorSlice (POST /CampaignEditor/TestSend/), NOT in
// newsletterSlice (§11.3). PO decision #5: the clone has no mapping — the UI shows
// the raw-tokens warning BEFORE dispatching this (v1 conscious waiver).
export const testSendWrapped = createAsyncThunk(
    'SmartSend/TestSendWrapped', async (payload: any, thunkAPI) => {
        if (USE_SEND_MOCK) return mockTestSend(payload);
        const res: any = await thunkAPI.dispatch(jsThunk(testSend)(payload));
        return res.payload;
    });

// M8 · loads the picked source's active-version columns into smartSend.columns so the
// mapping table works for an unmapped campaign or a source change. Source data comes
// from the DataSources module (dataSourcesSlice.getDataSource, USE_DS_MOCK) — NOT the
// send pipeline — so there is no send-specific mock and no USE_SEND_MOCK guard here.
// SourcePicker also fetches the source LIST directly via dataSourcesSlice.getDataSources.
export const loadSourceColumns = createAsyncThunk(
    'SmartSend/LoadSourceColumns', async (sourceId: number, thunkAPI) => {
        const res: any = await thunkAPI.dispatch(getDataSource(sourceId));
        return res.payload;
    });

// ── Slice ────────────────────────────────────────────────────────────────────

const initialState: SmartSendState = {
    campaignId: null,
    dataSourceId: null,
    selectedChannel: eSendChannel.EMAIL,
    isMapped: false,
    dataSource: null,
    lockedVersionId: null,
    tokens: [],
    columns: [],
    columnsReqId: '',
    tokenMap: {},
    supervisorColumnId: null,
    gapColumnId: null,
    sortColumnId: null,
    syntheticGroupId: null,
    foreignSyntheticGroupId: null,
    foreignSyntheticGroupName: null,
    isStale: false,
    mismatch: false,
    sampleValues: null,
    fillSummary: null,
    sendResult: null,
    mappingStatus: 'idle',
    mappingError: null,
    columnsStatus: 'idle',
    saveStatus: 'idle',
    smartSendList: null,
    smartSendListStatus: 'idle',
    // message = i18n key (Toast runs it through t()). showAnimtionCheck spelling is intentional.
    ToastMessages: {
        GENERAL_ERROR: { severity: 'error', color: 'error', message: 'DataSources.send.errors.generalError', showAnimtionCheck: false },
        MAPPING_SAVED: { severity: 'success', color: 'success', message: 'DataSources.send.toasts.mappingSaved', showAnimtionCheck: true },
        GROUP_MERGE_LIMIT: { severity: 'error', color: 'error', message: 'DataSources.send.errors.groupMergeLimit', showAnimtionCheck: false },
        EDIT_BLOCKED_DURING_SEND: { severity: 'error', color: 'error', message: 'DataSources.send.errors.editBlockedDuringSend', showAnimtionCheck: false },
        VIEW_ONLY: { severity: 'error', color: 'error', message: 'DataSources.send.errors.viewOnlyBlocked', showAnimtionCheck: false },
        DATA_INCORRECT: { severity: 'error', color: 'error', message: 'DataSources.send.errors.dataIncorrect', showAnimtionCheck: false },
        CHANNEL_NOT_SUPPORTED: { severity: 'error', color: 'error', message: 'DataSources.send.errors.channelNotSupported', showAnimtionCheck: false },
        NOT_FOUND: { severity: 'error', color: 'error', message: 'DataSources.send.errors.notFound', showAnimtionCheck: false },
        FEATURE_BLOCKED: { severity: 'error', color: 'error', message: 'DataSources.errors.featureNotAvailable', showAnimtionCheck: false }
    }
};

export const smartSendSlice = createSlice({
    name: 'smartSend',
    initialState,
    reducers: {
        setCampaignContext: (state, action) => {
            state.campaignId = action.payload?.campaignId ?? null;
            state.dataSourceId = action.payload?.dataSourceId ?? null;
        },
        // Defensive (§11.3): a disabled channel is REJECTED here even if some UI
        // path tries to select it — the ChannelSelector never offers it anyway.
        setChannel: (state, action) => {
            const descriptor = CHANNELS.find(c => c.channel === action.payload);
            if (descriptor && descriptor.enabled) state.selectedChannel = action.payload;
        },
        // M8 · the user picked a (different) source in SourcePicker. Re-picking the current
        // source is a no-op (keeps the mapping); a NEW source clears the working mapping +
        // business columns + locked version (the active version re-locks on save) so the
        // table starts fresh for that source's columns (loaded by loadSourceColumns).
        selectSource: (state, action) => {
            const sourceId = action.payload;
            const current = state.dataSource?.DataSourceID ?? state.dataSourceId;
            if (sourceId == null || sourceId === current) return;
            state.dataSourceId = sourceId;
            state.tokenMap = {};
            state.supervisorColumnId = null;
            state.gapColumnId = null;
            state.sortColumnId = null;
            state.lockedVersionId = null;
            state.columns = [];
            state.sampleValues = null;
            state.isMapped = false;
            state.dataSource = null; // repopulated from loadSourceColumns (the source's details)
            state.columnsStatus = 'loading'; // the new source's columns are about to load
        },
        setTokenMapping: (state, action) => {
            const { token, columnId } = action.payload || {};
            if (typeof token === 'string') state.tokenMap[token] = columnId ?? null;
        },
        setBusinessColumn: (state, action) => {
            const { role, columnId } = action.payload || {};
            if (role === 'supervisor') state.supervisorColumnId = columnId ?? null;
            else if (role === 'gap') state.gapColumnId = columnId ?? null;
            else if (role === 'sort') state.sortColumnId = columnId ?? null;
        },
        clearSendResult: (state) => {
            state.sendResult = null;
        },
        clearSmartSend: () => initialState
    },
    extraReducers: (builder) => {
        builder.addCase(getMapping.pending, (state) => {
            state.mappingStatus = 'loading';
            state.mappingError = null;
        });
        builder.addCase(getMapping.fulfilled, (state, action: any) => {
            const payload = action.payload;
            if (payload?.StatusCode === 200 && payload.Data) {
                const data: GetMappingResult = payload.Data;
                state.campaignId = data.CampaignID;
                state.isMapped = data.IsMapped;
                state.dataSource = data.DataSource;
                state.lockedVersionId = data.DataSource?.LockedVersionID ?? null;
                state.tokens = data.Tokens || [];
                state.columns = data.Columns || [];
                state.supervisorColumnId = data.SupervisorColumnID;
                state.gapColumnId = data.GapColumnID;
                state.sortColumnId = data.SortColumnID;
                state.syntheticGroupId = data.SyntheticGroupID;
                state.foreignSyntheticGroupId = data.ForeignSyntheticGroupID;
                state.foreignSyntheticGroupName = data.ForeignSyntheticGroupName;
                state.isStale = data.IsStale;
                state.mismatch = data.Mismatch;
                // Seed the working map from the saved mapping (null = unmapped token).
                const map: { [token: string]: number | null } = {};
                (data.Tokens || []).forEach(t => { map[t.Token] = t.MappedColumnID; });
                state.tokenMap = map;
                state.mappingStatus = 'succeeded';
            } else {
                state.mappingStatus = 'failed';
                state.mappingError = payload?.StatusCode ?? null; // 404/927 drive distinct UI (§16)
            }
        });
        builder.addCase(getMapping.rejected, (state) => {
            state.mappingStatus = 'failed';
            state.mappingError = null; // network/5xx → generic message
        });

        builder.addCase(setMapping.pending, (state) => {
            state.saveStatus = 'loading';
        });
        builder.addCase(setMapping.fulfilled, (state, action: any) => {
            const payload = action.payload;
            if (payload?.StatusCode === 200 && payload.Data) {
                state.syntheticGroupId = payload.Data.SyntheticGroupID ?? state.syntheticGroupId;
                state.isMapped = true;
                state.saveStatus = 'succeeded';
            } else {
                state.saveStatus = 'failed';
            }
        });
        builder.addCase(setMapping.rejected, (state) => {
            state.saveStatus = 'failed';
        });

        // M8 · a freshly-picked source's columns (+ its details for the header/highlight).
        // M10 · latest-request guard: a slow getDataSource(A) must not clobber a newer pick(B).
        builder.addCase(loadSourceColumns.pending, (state, action: any) => {
            state.columnsReqId = action.meta.requestId;
            state.columnsStatus = 'loading';
        });
        builder.addCase(loadSourceColumns.fulfilled, (state, action: any) => {
            if (action.meta.requestId !== state.columnsReqId) return; // stale — a newer pick superseded it
            const payload = action.payload;
            if (payload?.StatusCode === 200 && payload.Data) {
                state.columns = payload.Data.columns || [];
                const details = payload.Data.details;
                if (details) {
                    state.lockedVersionId = details.ActiveVersionID ?? null;
                    state.dataSource = {
                        DataSourceID: details.DataSourceID,
                        Name: details.Name,
                        LockedVersionID: details.ActiveVersionID ?? 0,
                        ActiveVersionID: details.ActiveVersionID ?? null
                    };
                }
                state.columnsStatus = 'succeeded';
            } else {
                state.columnsStatus = 'failed';
            }
        });
        builder.addCase(loadSourceColumns.rejected, (state, action: any) => {
            if (action.meta.requestId !== state.columnsReqId) return;
            state.columnsStatus = 'failed';
        });

        builder.addCase(getSampleValues.fulfilled, (state, action: any) => {
            state.sampleValues = action.payload?.StatusCode === 200 ? (action.payload?.Data ?? {}) : null;
        });

        builder.addCase(fillAndSummarize.fulfilled, (state, action: any) => {
            state.fillSummary = action.payload?.StatusCode === 200 ? (action.payload?.Data ?? null) : null;
        });

        // The whole PulseemResponse is kept — the UI branches on StatusCode
        // (201 success / 423 links in Data / 451 / 550 / 551 / 402 / 405 / 422 …).
        builder.addCase(sendSmart.fulfilled, (state, action: any) => {
            state.sendResult = action.payload ?? null;
        });
        builder.addCase(sendSmart.rejected, (state) => {
            state.sendResult = { StatusCode: 500, Message: 'internalerror', Data: null };
        });

        // Session-B · management-tab list. The tab does not poll, so status transitions are
        // unconditional — mirrors dataSourcesSlice.getDataSources (minus the silent-poll guard).
        builder.addCase(getSmartSendList.pending, (state) => {
            state.smartSendListStatus = 'loading';
        });
        builder.addCase(getSmartSendList.fulfilled, (state, action: any) => {
            const data = action.payload?.Data;
            if (data) state.smartSendList = { items: data.items, total: data.total, page: data.page, pageSize: data.pageSize };
            state.smartSendListStatus = 'succeeded';
        });
        builder.addCase(getSmartSendList.rejected, (state) => {
            state.smartSendListStatus = 'failed';
        });
    }
});

// §11.3: the single per-channel recipient-count selector — reads the field NAME
// from the CHANNELS descriptor (channel-specific field names never appear here).
export const selectResolvedCountForChannel = (source: any, channel: eSendChannel): number =>
    source ? (source[getChannelDescriptor(channel).resolvedCountField] ?? 0) : 0;

// M9 · tokens that block send: not mapped, mapped to 0/none, OR mapped to a column that
// vanished from the locked version. UnmappedTokensWarning + the send gate both use this.
export const selectUnmappedTokens = (state: any): string[] => {
    const ss = state.smartSend;
    const colSet = new Set((ss.columns || []).map((c: any) => c.ColumnID));
    return (ss.tokens || [])
        .filter((tk: any) => {
            const m = ss.tokenMap ? ss.tokenMap[tk.Token] : null;
            return m == null || m <= 0 || !colSet.has(m);
        })
        .map((tk: any) => tk.Token);
};

export const {
    setCampaignContext, setChannel, selectSource, setTokenMapping, setBusinessColumn,
    clearSendResult, clearSmartSend
} = smartSendSlice.actions;

export default smartSendSlice.reducer;
