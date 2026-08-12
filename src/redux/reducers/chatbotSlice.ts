import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';
import { IChatbotFlow, IChatbotListItem, IChatbotTierLimit } from '../../Models/Service/Chatbot';
import { emptyFlow, toListItem } from '../../screens/Service/Chatbot/mockChatbots';

// ChatbotController always answers with HTTP 200 - the real result is the
// PulseemResponse body's own StatusCode/Message (e.g. 400 missing name, 403
// tier limit reached, 404 editing something that isn't this account's). Axios
// won't throw for any of that on its own, so callers must check it themselves.
const SUCCESS_STATUS_CODES = new Set([200, 201]);

const unwrapOrThrow = <T = any>(data: any): T => {
  const parsed = typeof data === 'string' ? JSON.parse(data) : data;
  if (!SUCCESS_STATUS_CODES.has(parsed?.StatusCode)) {
    throw new Error(parsed?.Message || 'Request failed');
  }
  return parsed.Data as T;
};

export const getChatbots = createAsyncThunk('Service/GetChatbots', async (_: void, thunkAPI) => {
  try {
    const res = await PulseemReactInstance.get('api/Service/GetChatbots');
    return unwrapOrThrow<{ list: IChatbotListItem[]; tierLimit: IChatbotTierLimit }>(res.data);
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message ?? 'Failed to load chatbots');
  }
});

export const getChatbotFlow = createAsyncThunk(
  'Service/GetChatbotFlow',
  async (id: string | undefined, thunkAPI) => {
    if (!id) return emptyFlow();
    try {
      const res = await PulseemReactInstance.get(`api/Service/GetChatbot/${id}`);
      return unwrapOrThrow<IChatbotFlow>(res.data);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message ?? 'Failed to load chatbot');
    }
  },
);

export const saveChatbot = createAsyncThunk('Service/SaveChatbot', async (flow: IChatbotFlow, thunkAPI) => {
  try {
    const res = await PulseemReactInstance.post('api/Service/SaveChatbot', flow);
    return unwrapOrThrow<IChatbotFlow>(res.data);
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message ?? 'Failed to save chatbot');
  }
});

export const deleteChatbot = createAsyncThunk('Service/DeleteChatbot', async (id: string, thunkAPI) => {
  try {
    const res = await PulseemReactInstance.delete(`api/Service/DeleteChatbot/${id}`);
    unwrapOrThrow(res.data);
    return id;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message ?? 'Failed to delete chatbot');
  }
});

export const toggleChatbot = createAsyncThunk(
  'Service/ToggleChatbot',
  async ({ id, enabled }: { id: string; enabled: boolean }, thunkAPI) => {
    try {
      const res = await PulseemReactInstance.post('api/Service/ToggleChatbot', { id, enabled });
      unwrapOrThrow(res.data);
      return { id, enabled };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message ?? 'Failed to update chatbot');
    }
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
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to load chatbots';
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
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to load chatbot';
      })
      .addCase(saveChatbot.pending, (state) => {
        state.saving = true;
        state.error = null;
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
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to save chatbot';
      })
      .addCase(deleteChatbot.fulfilled, (state, action) => {
        state.list = state.list.filter((c) => c.id !== action.payload);
      })
      .addCase(deleteChatbot.rejected, (state, action) => {
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to delete chatbot';
      })
      .addCase(toggleChatbot.fulfilled, (state, action) => {
        const item = state.list.find((c) => c.id === action.payload.id);
        if (item) item.enabled = action.payload.enabled;
      })
      .addCase(toggleChatbot.rejected, (state, action) => {
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to update chatbot';
      });
  },
});

export const { clearCurrentFlow } = chatbotSlice.actions;
export default chatbotSlice.reducer;
