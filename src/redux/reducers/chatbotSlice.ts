import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';
import { IChatbotFlow, IChatbotListItem, IChatbotTierLimit } from '../../Models/Service/Chatbot';
import { MOCK_CHATBOT_FLOWS, MOCK_TIER_LIMIT, emptyFlow, toListItem } from '../../screens/Service/Chatbot/mockChatbots';

// ⚠️ PREVIEW FLAG — true = use local mock data (no backend needed); false = call the
// real Service/Chatbots endpoints (pulseem-communication). Flip to false once that
// service is deployed. See serviceDashboardSlice for the same pattern.
const USE_MOCK = true;

// In-memory stand-in for the backend while USE_MOCK is true — lets create/edit/delete
// persist for the length of the session instead of resetting on every navigation.
const mockDb: Record<string, IChatbotFlow> = { ...MOCK_CHATBOT_FLOWS };

const unwrap = <T = any>(data: any): { StatusCode: number; Message: string; Data: T } =>
  typeof data === 'string' ? JSON.parse(data) : data;

const mockDelay = <T = any>(data: T, ms = 250): Promise<T> =>
  new Promise((r) => setTimeout(() => r(data), ms));

export const getChatbots = createAsyncThunk('Service/GetChatbots', async () => {
  if (USE_MOCK) {
    return mockDelay({
      list: Object.values(mockDb).map(toListItem),
      tierLimit: MOCK_TIER_LIMIT,
    });
  }
  const res = await PulseemReactInstance.get('api/Service/GetChatbots');
  return unwrap<{ list: IChatbotListItem[]; tierLimit: IChatbotTierLimit }>(res.data).Data;
});

export const getChatbotFlow = createAsyncThunk('Service/GetChatbotFlow', async (id: string | undefined) => {
  if (!id) return emptyFlow();
  if (USE_MOCK) return mockDelay(mockDb[id] ?? emptyFlow());
  const res = await PulseemReactInstance.get(`api/Service/GetChatbot/${id}`);
  return unwrap<IChatbotFlow>(res.data).Data;
});

export const saveChatbot = createAsyncThunk('Service/SaveChatbot', async (flow: IChatbotFlow) => {
  if (USE_MOCK) {
    const saved: IChatbotFlow = { ...flow, updatedAt: new Date().toISOString() };
    mockDb[saved.id] = saved;
    return saved;
  }
  const res = await PulseemReactInstance.post('api/Service/SaveChatbot', flow);
  return unwrap<IChatbotFlow>(res.data).Data;
});

export const deleteChatbot = createAsyncThunk('Service/DeleteChatbot', async (id: string) => {
  if (USE_MOCK) {
    delete mockDb[id];
    return id;
  }
  await PulseemReactInstance.delete(`api/Service/DeleteChatbot/${id}`);
  return id;
});

export const toggleChatbot = createAsyncThunk(
  'Service/ToggleChatbot',
  async ({ id, enabled }: { id: string; enabled: boolean }) => {
    if (USE_MOCK) {
      if (mockDb[id]) mockDb[id] = { ...mockDb[id], enabled, updatedAt: new Date().toISOString() };
      return { id, enabled };
    }
    await PulseemReactInstance.post('api/Service/ToggleChatbot', { id, enabled });
    return { id, enabled };
  },
);

interface ChatbotState {
  list: IChatbotListItem[];
  tierLimit: IChatbotTierLimit | null;
  loadingList: boolean;
  currentFlow: IChatbotFlow | null;
  loadingFlow: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: ChatbotState = {
  list: [],
  tierLimit: null,
  loadingList: false,
  currentFlow: null,
  loadingFlow: false,
  saving: false,
  error: null,
};

const chatbotSlice = createSlice({
  name: 'chatbot',
  initialState,
  reducers: {
    clearCurrentFlow: (state) => {
      state.currentFlow = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getChatbots.pending, (state) => {
        state.loadingList = true;
        state.error = null;
      })
      .addCase(getChatbots.fulfilled, (state, action) => {
        state.loadingList = false;
        state.list = action.payload.list;
        state.tierLimit = action.payload.tierLimit;
      })
      .addCase(getChatbots.rejected, (state, action) => {
        state.loadingList = false;
        state.error = action.error.message ?? 'Failed to load chatbots';
      })
      .addCase(getChatbotFlow.pending, (state) => {
        state.loadingFlow = true;
      })
      .addCase(getChatbotFlow.fulfilled, (state, action) => {
        state.loadingFlow = false;
        state.currentFlow = action.payload;
      })
      .addCase(getChatbotFlow.rejected, (state, action) => {
        state.loadingFlow = false;
        state.error = action.error.message ?? 'Failed to load chatbot';
      })
      .addCase(saveChatbot.pending, (state) => {
        state.saving = true;
      })
      .addCase(saveChatbot.fulfilled, (state, action) => {
        state.saving = false;
        state.currentFlow = action.payload;
        const idx = state.list.findIndex((c) => c.id === action.payload.id);
        const item = toListItem(action.payload);
        if (idx >= 0) state.list[idx] = item;
        else state.list.push(item);
      })
      .addCase(saveChatbot.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message ?? 'Failed to save chatbot';
      })
      .addCase(deleteChatbot.fulfilled, (state, action) => {
        state.list = state.list.filter((c) => c.id !== action.payload);
      })
      .addCase(toggleChatbot.fulfilled, (state, action) => {
        const item = state.list.find((c) => c.id === action.payload.id);
        if (item) item.enabled = action.payload.enabled;
      });
  },
});

export const { clearCurrentFlow } = chatbotSlice.actions;
export default chatbotSlice.reducer;
