import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Message, AiChatState } from '../../Models/StateTypes';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';
import { supportConfig } from '../../components/AI/chatConfig';

export const loadSupportSessionMessages = createAsyncThunk(
  'supportChat/loadSessionMessages',
  async () => {
    const response = await PulseemReactInstance.get(supportConfig.apiLoadSession);
    return response.data;
  }
);

export const addSupportMessage = createAsyncThunk(
  'supportChat/addMessage',
  async (message: { MessageText: string; MessageTypeID: number }) => {
    const response = await PulseemReactInstance.post(supportConfig.apiAddMessage, message);
    return response.data;
  }
);

export const startNewSupportSession = createAsyncThunk(
  'supportChat/startNewSession',
  async () => {
    const response = await PulseemReactInstance.post(supportConfig.apiNewSession, {});
    return response.data;
  }
);

const initialState: AiChatState = {
  isOpen: false,
  messages: [],
  isLoading: false,
  aiIconStatus: 0,
  totalMessagesForUserCount: -1,
};

const supportChatSlice = createSlice({
  name: 'supportChat',
  initialState,
  reducers: {
    toggleSupportChat: (state) => {
      state.isOpen = !state.isOpen;
    },
    openSupportChat: (state) => {
      state.isOpen = true;
    },
    addSupportUserMessage: (state, action: PayloadAction<any>) => {
      state.messages.push(action.payload);
    },
    setSupportLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setSupportAIIconStatus: (state, action: PayloadAction<0 | 1 | 2 | 3>) => {
      state.aiIconStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addSupportMessage.fulfilled, (state, action: any) => {
        state.messages.push(action.payload?.Data || []);
        state.totalMessagesForUserCount = action.payload?.DataCount?.TotalMessagesForUserCount || 0;
        state.aiIconStatus = 2;
      })
      .addCase(addSupportMessage.rejected, (state) => {
        state.aiIconStatus = 2;
      })
      .addCase(loadSupportSessionMessages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadSupportSessionMessages.fulfilled, (state, action: any) => {
        state.isLoading = false;
        if (action.payload) {
          state.messages.push(...(action.payload?.Data || []));
          state.totalMessagesForUserCount = action.payload?.DataCount?.TotalMessagesForUserCount || 0;
          state.aiIconStatus = 2;
        }
      })
      .addCase(loadSupportSessionMessages.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(startNewSupportSession.fulfilled, (state) => {
        state.messages = [];
        state.totalMessagesForUserCount = -1;
      });
  },
});

export const {
  toggleSupportChat,
  openSupportChat,
  addSupportUserMessage,
  setSupportLoading,
  setSupportAIIconStatus,
} = supportChatSlice.actions;

export default supportChatSlice.reducer;
