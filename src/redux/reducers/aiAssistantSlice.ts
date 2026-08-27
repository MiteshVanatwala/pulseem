import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { PulseemReactInstance } from "../../helpers/Api/PulseemReactAPI";
import { PulseemResponse } from "../../Models/APIResponse";
import { IAiAssistantSettings, IKnowledgeItem, IKnowledgeItemInput, ITestChatResponse, ITestChatExchange, IAiAssistantAnalytics, IAnalyticsDateRange } from "../../Models/Service/AIAssistant";

const SUCCESS = 201;
const EMPTY = 404; // GetKnowledgeItems only: "no items yet" — a valid state, not an error
const VALIDATION_FAILED = 400;
const NOT_FOUND = 404; // Save(update)/Delete/Toggle: not found OR belongs to another account — indistinguishable by design
const ROLLOUT_DISABLED = 423;
const NOT_ENTITLED = 403;
const RATE_LIMITED = 429; // TestAIMessage only

// TestAIMessage confirmed (backend Phase 0) to succeed on 201, but this is intentionally
// its OWN constant, not a reuse of the shared SUCCESS above — TestAIMessage's 201 is a
// deliberate, confirmed exception; SUCCESS above is otherwise an unconfirmed inference
// for the rest of this page's endpoints. Do not collapse these back into one constant —
// if SUCCESS is ever corrected for the other endpoints, TestAIMessage must not move with it.
const TEST_MESSAGE_SUCCESS = 201;

// SaveTestFeedback confirmed (backend Phase 0) to use the "normal" 200 convention —
// unlike TestAIMessage, this one is NOT an exception, so it deliberately does not use
// TEST_MESSAGE_SUCCESS or the shared SUCCESS(201) constant above.
const FEEDBACK_SUCCESS = 200;
const FEEDBACK_VALIDATION_FAILED = 400;
const FEEDBACK_NOT_FOUND = 404;

const DATA_INCORRECT_MESSAGE = 'Group Name is too long or missing';

export type GateStatus = 'unknown' | 'available' | 'rolloutDisabled' | 'notEntitled';

type GateFailure = { gate: 'rolloutDisabled' | 'notEntitled'; message: string };

const checkGate = (body: PulseemResponse | undefined): GateFailure | null => {
  if (!body) return null;
  if (body.StatusCode === ROLLOUT_DISABLED && body.Data?.Reason === 'FEATURE_DISABLED') {
    return { gate: 'rolloutDisabled', message: body.Message || '' };
  }
  if (body.StatusCode === NOT_ENTITLED && body.Data?.Reason === 'NOT_ENTITLED') {
    return { gate: 'notEntitled', message: body.Message || '' };
  }
  return null;
};

const fromServerItem = (raw: any): IKnowledgeItem => ({
  id: raw.Id,
  title: raw.Title,
  type: (raw.ItemType || '').toLowerCase(),
  content: raw.Content,
  tags: raw.Tags || [],
  isActive: raw.IsActive,
  wordCount: raw.WordCount,
  createdDate: raw.CreatedDate,
  modifiedDate: raw.ModifiedDate,
  lastReferencedDate: raw.LastReferencedDate,
});

const toServerItem = (input: IKnowledgeItemInput, id?: number) => ({
  Id: id || null,
  Title: input.title,
  ItemType: input.type,
  Content: input.content,
  Tags: input.tags,
});

const fromServerSettings = (raw: any): IAiAssistantSettings => ({
  responseStyle: raw.ResponseStyle,
  defaultLanguage: raw.DefaultLanguage,
  confidenceThreshold: raw.ConfidenceThreshold,
  autoEscalate: raw.AutoEscalate,
  escalationMessage: raw.EscalationMessage,
  maxContextWords: raw.MaxContextWords,
  includeConversationHistory: raw.IncludeConversationHistory,
  createdDate: raw.CreatedDate,
  modifiedDate: raw.ModifiedDate,
});

const toServerSettings = (settings: IAiAssistantSettings) => ({
  ResponseStyle: settings.responseStyle,
  DefaultLanguage: settings.defaultLanguage,
  ConfidenceThreshold: settings.confidenceThreshold,
  AutoEscalate: settings.autoEscalate,
  EscalationMessage: settings.escalationMessage,
  MaxContextWords: settings.maxContextWords,
  IncludeConversationHistory: settings.includeConversationHistory,
});

// TestAIMessage's Data is camelCase (confirmed) — NOT PascalCase like the rest of
// ServiceAI. knowledgeSources items use `id`/`title`, not `Id`/`Title`.
const fromServerTestChatResponse = (raw: any): ITestChatResponse => ({
  responseLogId: raw.responseLogId,
  reply: raw.response,
  confidenceScore: raw.confidence,
  escalated: raw.escalated,
  knowledgeSources: (raw.knowledgeSources || []).map((source: any) => ({ id: source.id, title: source.title })),
  responseTimeMs: raw.responseTimeMs,
});

// GetAIAnalytics's Data is camelCase (confirmed), like TestAIMessage's — but its array
// items key on `knowledgeItemId`, NOT `id` like TestAIMessage's knowledgeSources. The
// two endpoints do not share a field name here; do not copy this mapper's shape onto
// fromServerTestChatResponse or vice versa.
const fromServerAnalytics = (raw: any): IAiAssistantAnalytics => ({
  liveModeCount: raw.liveModeCount,
  testModeCount: raw.testModeCount,
  unusedContentItems: (raw.unusedKnowledgeItems || []).map((item: any) => ({ id: item.knowledgeItemId, title: item.title })),
  mostReferencedItems: (raw.mostReferencedKnowledge || []).map((item: any) => ({
    id: item.knowledgeItemId,
    title: item.title,
    referenceCount: item.citationCount,
  })),
});

const asNetworkError = (error: any) => ({ message: error?.Message || error?.message || 'Network error' });

// Combined initial load for the page shell — GetKnowledgeItems' 404 "No Records
// found" is a valid empty state here, not a failure; only the gate, a genuine 400/401/
// 500, or a network error reject this thunk.
export const fetchAiAssistantOverview = createAsyncThunk(
  'AIAssistant/GetOverview',
  async (_data: void, thunkAPI) => {
    try {
      const [itemsRes, settingsRes] = await Promise.all([
        PulseemReactInstance.post(`ServiceAI/GetKnowledgeItems`, {}),
        PulseemReactInstance.post(`ServiceAI/GetAISettings`, {}),
      ]);
      const itemsBody = itemsRes.data as PulseemResponse;
      const settingsBody = settingsRes.data as PulseemResponse;
      const gateFailure = checkGate(itemsBody) || checkGate(settingsBody);
      if (gateFailure) return thunkAPI.rejectWithValue(gateFailure);

      if (settingsBody?.StatusCode !== SUCCESS) {
        return thunkAPI.rejectWithValue({ message: settingsBody?.Message || 'Unexpected response' });
      }

      let knowledgeItems: IKnowledgeItem[];
      if (itemsBody?.StatusCode === EMPTY) {
        knowledgeItems = [];
      } else if (itemsBody?.StatusCode === SUCCESS) {
        knowledgeItems = (itemsBody.Data || []).map(fromServerItem);
      } else {
        return thunkAPI.rejectWithValue({ message: itemsBody?.Message || 'Unexpected response' });
      }

      return { knowledgeItems, settings: fromServerSettings(settingsBody.Data) };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(asNetworkError(error));
    }
  }
);

// Lightweight refetch used after a knowledge-item mutation (create/update/delete/
// toggle never return the full item list — only an Id or nothing — so we refetch
// rather than optimistically reconstruct WordCount etc. client-side).
export const fetchKnowledgeItems = createAsyncThunk(
  'AIAssistant/GetKnowledgeItems',
  async (_data: void, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`ServiceAI/GetKnowledgeItems`, {});
      const body = response.data as PulseemResponse;
      const gateFailure = checkGate(body);
      if (gateFailure) return thunkAPI.rejectWithValue(gateFailure);
      if (body?.StatusCode === EMPTY) return [];
      if (body?.StatusCode === SUCCESS) return (body.Data || []).map(fromServerItem);
      return thunkAPI.rejectWithValue({ message: body?.Message || 'Unexpected response' });
    } catch (error: any) {
      return thunkAPI.rejectWithValue(asNetworkError(error));
    }
  }
);

// Upsert — Id absent/0 creates, a positive Id updates. IsActive is NOT settable here
// (contract: "use ToggleKnowledgeItem"). Success only returns { Id }, not the full
// item — WordCount etc. come from the follow-up fetchKnowledgeItems the caller
// dispatches on success.
export const saveKnowledgeItem = createAsyncThunk(
  'AIAssistant/SaveKnowledgeItem',
  async (args: { id?: number; input: IKnowledgeItemInput }, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`ServiceAI/SaveKnowledgeItem`, toServerItem(args.input, args.id));
      const body = response.data as PulseemResponse;
      const gateFailure = checkGate(body);
      if (gateFailure) return thunkAPI.rejectWithValue(gateFailure);

      if (body?.StatusCode === SUCCESS) return { id: body.Data.Id as number };

      if (body?.StatusCode === NOT_ENTITLED && body.Data?.Reason === 'ITEM_LIMIT_REACHED') {
        return thunkAPI.rejectWithValue({ capReached: true, limit: body.Data?.Limit, message: body.Message });
      }
      if (body?.StatusCode === VALIDATION_FAILED) {
        const message = body.Message === DATA_INCORRECT_MESSAGE ? null : body.Message;
        return thunkAPI.rejectWithValue({ validation: true, message });
      }
      if (body?.StatusCode === NOT_FOUND) {
        return thunkAPI.rejectWithValue({ notFound: true, message: body.Message });
      }
      return thunkAPI.rejectWithValue({ message: body?.Message || 'Unexpected response' });
    } catch (error: any) {
      return thunkAPI.rejectWithValue(asNetworkError(error));
    }
  }
);

// 404 here is deliberately indistinguishable between "not found" and "belongs to
// another account" — don't build UI that assumes either meaning; just surface it.
export const deleteKnowledgeItem = createAsyncThunk(
  'AIAssistant/DeleteKnowledgeItem',
  async (id: number, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.delete(`ServiceAI/DeleteKnowledgeItem/${id}`);
      const body = response.data as PulseemResponse;
      const gateFailure = checkGate(body);
      if (gateFailure) return thunkAPI.rejectWithValue(gateFailure);
      if (body?.StatusCode === SUCCESS) return id;
      if (body?.StatusCode === NOT_FOUND) return thunkAPI.rejectWithValue({ notFound: true, message: body.Message });
      return thunkAPI.rejectWithValue({ message: body?.Message || 'Unexpected response' });
    } catch (error: any) {
      return thunkAPI.rejectWithValue(asNetworkError(error));
    }
  }
);

// Same 404-ambiguity note as deleteKnowledgeItem applies here.
export const toggleKnowledgeItem = createAsyncThunk(
  'AIAssistant/ToggleKnowledgeItem',
  async (args: { id: number; isActive: boolean }, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`ServiceAI/ToggleKnowledgeItem`, { Id: args.id, IsActive: args.isActive });
      const body = response.data as PulseemResponse;
      const gateFailure = checkGate(body);
      if (gateFailure) return thunkAPI.rejectWithValue(gateFailure);
      if (body?.StatusCode === SUCCESS) return args;
      if (body?.StatusCode === NOT_FOUND) return thunkAPI.rejectWithValue({ notFound: true, message: body.Message });
      return thunkAPI.rejectWithValue({ message: body?.Message || 'Unexpected response' });
    } catch (error: any) {
      return thunkAPI.rejectWithValue(asNetworkError(error));
    }
  }
);

// Full-object update only — no PATCH. Always send every field; always re-render from
// the response's Data (may come back silently clamped to the plan's context-word
// ceiling), never from what was submitted.
export const saveAiAssistantSettings = createAsyncThunk(
  'AIAssistant/SaveAISettings',
  async (settings: IAiAssistantSettings, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`ServiceAI/SaveAISettings`, toServerSettings(settings));
      const body = response.data as PulseemResponse;
      const gateFailure = checkGate(body);
      if (gateFailure) return thunkAPI.rejectWithValue(gateFailure);
      if (body?.StatusCode === SUCCESS) return fromServerSettings(body.Data);
      if (body?.StatusCode === VALIDATION_FAILED) {
        const message = body.Message === DATA_INCORRECT_MESSAGE ? null : body.Message;
        return thunkAPI.rejectWithValue({ validation: true, message });
      }
      return thunkAPI.rejectWithValue({ message: body?.Message || 'Unexpected response' });
    } catch (error: any) {
      return thunkAPI.rejectWithValue(asNetworkError(error));
    }
  }
);

// Each call is a standalone message, not a stateful server-side conversation — the
// gate is re-checked every time for the same reason every other mutation thunk
// re-checks it (a session can go stale mid-tab, e.g. a downgrade).
export const sendTestChatMessage = createAsyncThunk(
  'AIAssistant/TestAIMessage',
  async (message: string, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`ServiceAI/TestAIMessage`, { Message: message });
      const body = response.data as PulseemResponse;
      const gateFailure = checkGate(body);
      if (gateFailure) return thunkAPI.rejectWithValue(gateFailure);

      // Deliberate exception: TestAIMessage succeeds on 201, confirmed by backend —
      // see TEST_MESSAGE_SUCCESS's definition above before "fixing" this to SUCCESS/200.
      if (body?.StatusCode === TEST_MESSAGE_SUCCESS) return fromServerTestChatResponse(body.Data);

      if (body?.StatusCode === RATE_LIMITED) {
        // Confirmed absent: RetryAfterSeconds. The 429 body carries a daily cap instead.
        return thunkAPI.rejectWithValue({
          rateLimited: true,
          maxRequestsPerDay: body.Data?.MaxRequestsPerDay,
          message: body.Message,
        });
      }
      if (body?.StatusCode === VALIDATION_FAILED) {
        // Confirmed: Data is null on validation failure, message is body.Message directly
        // (no nested Data.Reason the way the gate/rate-limit cases use).
        return thunkAPI.rejectWithValue({ validation: true, message: body.Message });
      }
      return thunkAPI.rejectWithValue({ message: body?.Message || 'Unexpected response' });
    } catch (error: any) {
      return thunkAPI.rejectWithValue(asNetworkError(error));
    }
  }
);

// SaveTestFeedback — real, confirmed endpoint (backend Phase 0). Uses responseLogId
// from the original TestAIMessage response, not the client-side exchange id.
export const submitTestChatFeedback = createAsyncThunk(
  'AIAssistant/SaveTestFeedback',
  async (args: { exchangeId: string; responseLogId: number; feedback: 'good' | 'needs_improvement' }, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`ServiceAI/SaveTestFeedback`, {
        responseLogId: args.responseLogId,
        feedback: args.feedback,
      });
      const body = response.data as PulseemResponse;
      const gateFailure = checkGate(body);
      if (gateFailure) return thunkAPI.rejectWithValue(gateFailure);

      // Not the TestAIMessage exception — this endpoint uses the normal 200 convention.
      if (body?.StatusCode === FEEDBACK_SUCCESS) return { exchangeId: args.exchangeId, helpful: args.feedback === 'good' };
      if (body?.StatusCode === FEEDBACK_VALIDATION_FAILED) {
        return thunkAPI.rejectWithValue({ validation: true, message: body.Message });
      }
      if (body?.StatusCode === FEEDBACK_NOT_FOUND) {
        return thunkAPI.rejectWithValue({ notFound: true, message: body.Message });
      }
      return thunkAPI.rejectWithValue({ message: body?.Message || 'Unexpected response' });
    } catch (error: any) {
      return thunkAPI.rejectWithValue(asNetworkError(error));
    }
  }
);

// Re-checks the gate for the same reason every other mutation/query thunk on this page
// does — a session can go stale mid-tab (e.g. a downgrade) even on a read-only call.
export const fetchAiAssistantAnalytics = createAsyncThunk(
  'AIAssistant/GetAIAnalytics',
  async (range: IAnalyticsDateRange, thunkAPI) => {
    try {
      // Confirmed: POST only — the GET variant has a different, non-date-ranged shape
      // with no testModeCount/liveModeCount and must not be used. Request body is
      // camelCase (dateRangeStart/dateRangeEnd), unlike GetAISettings/SaveKnowledgeItem etc.
      const response = await PulseemReactInstance.post(`ServiceAI/GetAIAnalytics`, {
        dateRangeStart: range.startDate,
        dateRangeEnd: range.endDate,
      });
      const body = response.data as PulseemResponse;
      const gateFailure = checkGate(body);
      if (gateFailure) return thunkAPI.rejectWithValue(gateFailure);
      if (body?.StatusCode === SUCCESS) return { range, analytics: fromServerAnalytics(body.Data) };
      return thunkAPI.rejectWithValue({ message: body?.Message || 'Unexpected response' });
    } catch (error: any) {
      return thunkAPI.rejectWithValue(asNetworkError(error));
    }
  }
);

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface AiAssistantState {
  knowledgeItems: IKnowledgeItem[];
  settings: IAiAssistantSettings | null;
  loading: AsyncStatus;
  saving: AsyncStatus;
  error: string | null;
  gateStatus: GateStatus;
  testChatExchanges: ITestChatExchange[];
  testChatSending: AsyncStatus;
  analytics: IAiAssistantAnalytics | null;
  analyticsLoading: AsyncStatus;
  analyticsError: string | null;
}

const initialState: AiAssistantState = {
  knowledgeItems: [],
  settings: null,
  loading: 'idle',
  saving: 'idle',
  error: null,
  gateStatus: 'unknown',
  testChatExchanges: [],
  testChatSending: 'idle',
  analytics: null,
  analyticsLoading: 'idle',
  analyticsError: null,
};

const applyGateRejection = (state: AiAssistantState, action: any) => {
  const gate = action.payload?.gate;
  if (gate === 'rolloutDisabled' || gate === 'notEntitled') {
    state.gateStatus = gate;
    return true;
  }
  return false;
};

const aiAssistantSlice = createSlice({
  name: "aiAssistant",
  initialState,
  reducers: {
    clearAiAssistantError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAiAssistantOverview.pending, (state) => {
        state.loading = 'loading';
        state.error = null;
      })
      .addCase(fetchAiAssistantOverview.fulfilled, (state, { payload }) => {
        state.loading = 'succeeded';
        state.gateStatus = 'available';
        state.knowledgeItems = payload.knowledgeItems;
        state.settings = payload.settings;
      })
      .addCase(fetchAiAssistantOverview.rejected, (state, action: any) => {
        state.loading = 'failed';
        if (!applyGateRejection(state, action)) {
          state.error = action.payload?.message || 'Failed to load AI Assistant';
        }
      })
      .addCase(fetchKnowledgeItems.fulfilled, (state, { payload }) => {
        state.gateStatus = 'available';
        state.knowledgeItems = payload;
      })
      .addCase(fetchKnowledgeItems.rejected, (state, action: any) => {
        if (!applyGateRejection(state, action)) {
          state.error = action.payload?.message || 'Failed to refresh knowledge items';
        }
      })
      .addCase(saveKnowledgeItem.pending, (state) => {
        state.saving = 'loading';
        state.error = null;
      })
      .addCase(saveKnowledgeItem.fulfilled, (state) => {
        state.saving = 'succeeded';
        state.gateStatus = 'available';
      })
      .addCase(saveKnowledgeItem.rejected, (state, action: any) => {
        state.saving = 'failed';
        if (!applyGateRejection(state, action) && !action.payload?.validation && !action.payload?.capReached) {
          state.error = action.payload?.message || 'Failed to save knowledge item';
        }
      })
      .addCase(deleteKnowledgeItem.pending, (state) => {
        state.saving = 'loading';
        state.error = null;
      })
      .addCase(deleteKnowledgeItem.fulfilled, (state, { payload: id }) => {
        state.saving = 'succeeded';
        state.gateStatus = 'available';
        state.knowledgeItems = state.knowledgeItems.filter((item) => item.id !== id);
      })
      .addCase(deleteKnowledgeItem.rejected, (state, action: any) => {
        state.saving = 'failed';
        if (!applyGateRejection(state, action)) {
          // 404 here means "not found OR belongs to another account" — deliberately
          // indistinguishable. Surface it; don't assume it's already gone.
          state.error = action.payload?.message || 'Failed to delete knowledge item';
        }
      })
      .addCase(toggleKnowledgeItem.pending, (state) => {
        state.saving = 'loading';
        state.error = null;
      })
      .addCase(toggleKnowledgeItem.fulfilled, (state, { payload }) => {
        state.saving = 'succeeded';
        state.gateStatus = 'available';
        const item = state.knowledgeItems.find((i) => i.id === payload.id);
        if (item) item.isActive = payload.isActive;
      })
      .addCase(toggleKnowledgeItem.rejected, (state, action: any) => {
        state.saving = 'failed';
        if (!applyGateRejection(state, action)) {
          state.error = action.payload?.message || 'Failed to update knowledge item';
        }
      })
      .addCase(saveAiAssistantSettings.pending, (state) => {
        state.saving = 'loading';
        state.error = null;
      })
      .addCase(saveAiAssistantSettings.fulfilled, (state, { payload }) => {
        state.saving = 'succeeded';
        state.gateStatus = 'available';
        state.settings = payload;
      })
      .addCase(saveAiAssistantSettings.rejected, (state, action: any) => {
        state.saving = 'failed';
        if (!applyGateRejection(state, action) && !action.payload?.validation) {
          state.error = action.payload?.message || 'Failed to save settings';
        }
      })
      .addCase(sendTestChatMessage.pending, (state, action) => {
        state.testChatSending = 'loading';
        state.testChatExchanges.push({
          id: action.meta.requestId,
          question: action.meta.arg,
          status: 'pending',
          response: null,
          errorMessage: null,
          feedback: null,
        });
      })
      .addCase(sendTestChatMessage.fulfilled, (state, action) => {
        state.testChatSending = 'succeeded';
        state.gateStatus = 'available';
        const exchange = state.testChatExchanges.find((e) => e.id === action.meta.requestId);
        if (exchange) {
          exchange.status = 'succeeded';
          exchange.response = action.payload;
        }
      })
      .addCase(sendTestChatMessage.rejected, (state, action: any) => {
        state.testChatSending = 'failed';
        // Always resolve the pending bubble, even on a gate rejection (rollout/
        // entitlement went stale mid-tab) — the page hides the whole tab on next
        // render anyway, but an unresolved 'pending' entry would otherwise sit
        // stuck on "Thinking…" forever if it's ever inspected before that happens.
        const exchange = state.testChatExchanges.find((e) => e.id === action.meta.requestId);
        if (exchange) {
          exchange.status = action.payload?.rateLimited ? 'rateLimited' : 'failed';
          exchange.errorMessage = action.payload?.message || null;
          exchange.maxRequestsPerDay = action.payload?.maxRequestsPerDay;
        }
        applyGateRejection(state, action);
      })
      .addCase(submitTestChatFeedback.fulfilled, (state, action) => {
        const exchange = state.testChatExchanges.find((e) => e.id === action.payload.exchangeId);
        if (exchange) exchange.feedback = action.payload.helpful ? 'helpful' : 'needsImprovement';
      })
      .addCase(fetchAiAssistantAnalytics.pending, (state) => {
        state.analyticsLoading = 'loading';
        state.analyticsError = null;
      })
      .addCase(fetchAiAssistantAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = 'succeeded';
        state.gateStatus = 'available';
        state.analytics = action.payload.analytics;
      })
      .addCase(fetchAiAssistantAnalytics.rejected, (state, action: any) => {
        state.analyticsLoading = 'failed';
        if (!applyGateRejection(state, action)) {
          state.analyticsError = action.payload?.message || 'Failed to load analytics';
        }
      });
  },
});

export const { clearAiAssistantError } = aiAssistantSlice.actions;
export default aiAssistantSlice.reducer;
