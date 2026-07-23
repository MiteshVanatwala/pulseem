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

export const escapeToAgent = createAsyncThunk(
  'supportChat/escapeToAgent',
  async () => {
    const response = await PulseemReactInstance.post(supportConfig.apiEscalate!, {});
    return response.data;
  }
);

export const pollAgentMessages = createAsyncThunk(
  'supportChat/pollAgentMessages',
  async (afterId: number) => {
    const response = await PulseemReactInstance.get(
      `${supportConfig.apiNewMessages!}?afterId=${afterId}`
    );
    return response.data;
  }
);

const initialState: AiChatState = {
  isOpen: false,
  messages: [],
  isLoading: false,
  aiIconStatus: 0,
  totalMessagesForUserCount: -1,
  isEscalated: false,
  suggestAgent: false,
  lastAgentMessageId: 0,
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
        // Data is null when session is escalated (no AI response)
        if (action.payload?.Data) {
          state.messages.push(action.payload.Data);
        }
        state.totalMessagesForUserCount = action.payload?.DataCount?.TotalMessagesForUserCount || 0;
        state.suggestAgent = action.payload?.DataCount?.SuggestAgent || false;
        if (action.payload?.DataCount?.IsEscalated) {
          state.isEscalated = true;
        }
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
          const msgs = action.payload?.Data || [];
          state.messages.push(...msgs);
          state.totalMessagesForUserCount = action.payload?.DataCount?.TotalMessagesForUserCount || 0;
          state.isEscalated = action.payload?.DataCount?.IsEscalated || false;
          // Set cursor to the highest TypeID=4 MessageID already loaded
          const agentMsgs = msgs.filter((m: any) => m.MessageTypeID === 4);
          if (agentMsgs.length > 0) {
            state.lastAgentMessageId = Math.max(...agentMsgs.map((m: any) => m.MessageID));
          }
          state.aiIconStatus = 2;
        }
      })
      .addCase(loadSupportSessionMessages.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(startNewSupportSession.fulfilled, (state) => {
        state.messages = [];
        state.totalMessagesForUserCount = -1;
        state.isEscalated = false;
        state.suggestAgent = false;
        state.lastAgentMessageId = 0;
      })
      .addCase(escapeToAgent.fulfilled, (state, action: any) => {
        state.isEscalated = true;
        state.suggestAgent = false;
        // Push the TypeID=1 escalation request message so it shows immediately
        if (action.payload?.Data) {
          state.messages.push(action.payload.Data);
        }
        // cursor stays at 0 — agent hasn't replied yet
      })
      .addCase(escapeToAgent.rejected, () => {
        // error is handled locally in the UI — no state change needed
      })
      .addCase(pollAgentMessages.fulfilled, (state, action: any) => {
        const newMsgs = action.payload?.Data || [];
        if (newMsgs.length > 0) {
          state.messages.push(...newMsgs);
          state.lastAgentMessageId = Math.max(...newMsgs.map((m: any) => m.MessageID));
        }
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
