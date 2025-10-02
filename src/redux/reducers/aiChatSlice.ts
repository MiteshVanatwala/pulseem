import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

import { Message } from '../../Models/StateTypes';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';

export const loadSessionMessages = createAsyncThunk(
  'aiChat/loadSessionMessages',
  async () => {
    const response = await PulseemReactInstance.get('PulsyAI/LoadSessionMessages');
    return response.data;
  }
);

export const addMessage = createAsyncThunk(
  'aiChat/addMessage',
  async (message: { MessageText: string; MessageTypeID: number }) => {
    const response = await PulseemReactInstance.post('PulsyAI/AddMessage', message);
    return response.data;
  }
);

interface AiChatState {
  isOpen: boolean;
  messages: Message[];
  isLoading: boolean;
  aiIconStatus: 0|1|2|3; // 0-AI Icon, 1-Loading, 2-Message Sent and response received, 3-Error
  totalMessagesForUserCount: number;
}

const initialState: AiChatState = {
  isOpen: false,
  messages: [],
  isLoading: false,
  aiIconStatus: 0,
  totalMessagesForUserCount: -1
};

const aiChatSlice = createSlice({
  name: 'aiChat',
  initialState,
  reducers: {
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
    },
    addUserMessage: (state, action: PayloadAction<any>) => {
      state.messages.push(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAIIconStatus: (state, action: PayloadAction<0|1|2|3>) => {
      state.aiIconStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addMessage.fulfilled, (state, action: any) => {
        state.messages.push(action.payload?.Data || []);
        state.totalMessagesForUserCount = action.payload?.DataCount?.TotalMessagesForUserCount || 0;
        state.aiIconStatus = 2;
      })
      .addCase(addMessage.rejected, (state) => {
        state.aiIconStatus = 2;
      })
      .addCase(loadSessionMessages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadSessionMessages.fulfilled, (state, action: any) => {
        state.isLoading = false;
        if (action.payload) {
          state.messages.push(...(action.payload?.Data || []));
          state.totalMessagesForUserCount = action.payload?.DataCount?.TotalMessagesForUserCount || 0;
          state.aiIconStatus = 2;
        }
      })
      .addCase(loadSessionMessages.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { toggleChat, setLoading, setAIIconStatus, addUserMessage } = aiChatSlice.actions;

export default aiChatSlice.reducer;
