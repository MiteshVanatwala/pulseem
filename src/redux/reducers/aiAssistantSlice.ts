import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { PulseemReactInstance } from "../../helpers/Api/PulseemReactAPI";
import { PulseemResponse } from "../../Models/APIResponse";
import { IAiAssistantSettings, IKnowledgeItem, IKnowledgeItemInput } from "../../Models/Service/AIAssistant";

const SUCCESS = 201;
const EMPTY = 404; // GetKnowledgeItems only: "no items yet" — a valid state, not an error
const VALIDATION_FAILED = 400;
const NOT_FOUND = 404; // Save(update)/Delete/Toggle: not found OR belongs to another account — indistinguishable by design
const ROLLOUT_DISABLED = 423;
const NOT_ENTITLED = 403;

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

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface AiAssistantState {
  knowledgeItems: IKnowledgeItem[];
  settings: IAiAssistantSettings | null;
  loading: AsyncStatus;
  saving: AsyncStatus;
  error: string | null;
  gateStatus: GateStatus;
}

const initialState: AiAssistantState = {
  knowledgeItems: [],
  settings: null,
  loading: 'idle',
  saving: 'idle',
  error: null,
  gateStatus: 'unknown',
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
      });
  },
});

export const { clearAiAssistantError } = aiAssistantSlice.actions;
export default aiAssistantSlice.reducer;
