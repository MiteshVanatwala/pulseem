import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import uniqid from 'uniqid';

import { Message } from '../../Models/StateTypes';

interface AiChatState {
  isOpen: boolean;
  messages: Message[];
  isLoading: boolean;
  aiIconStatus: 0|1|2|3; // 0-AI Icon, 1-Loading, 2-Message Sent, 3-Error
}

const initialState: AiChatState = {
  isOpen: false,
  messages: [
    {
      id: 'init-1',
      sender: 'user',
      data: { type: 'text', content: 'How can I create a new email campaign?' }
    },
    {
      id: 'init-2',
      sender: 'ai',
      data: { type: 'text', content: 'To create a new email campaign, go to Campaigns > New Campaign. You can choose from our templates or start from scratch.' }
    },
    {
      id: 'init-3',
      sender: 'user',
      data: { type: 'text', content: 'How do I segment my contact list?' }
    },
    {
      id: 'init-4',
      sender: 'ai',
      data: { type: 'text', content: 'You can segment your contact list by going to Contacts > Groups. Create a new group and set conditions based on demographics, behavior, or custom fields.' }
    },
    {
      id: 'init-5',
      sender: 'user',
      data: { type: 'text', content: "What's the best time to send emails?" }
    },
    {
      id: 'init-6',
      sender: 'ai',
      data: { type: 'text', content: 'The best sending time varies by audience. Our analytics show that workday mornings (9-11 AM) often have high open rates. You can use our Send Time Optimization feature for automatic timing.' }
    },
    {
      id: 'init-7',
      sender: 'user',
      data: { type: 'text', content: 'How do I check my email performance?' }
    },
    {
      id: 'init-8',
      sender: 'ai',
      data: { type: 'text', content: "View campaign performance in Reports > Email Analytics. You'll see open rates, click rates, bounces, and conversions. You can also export detailed reports." }
    },
    {
      id: 'init-9',
      sender: 'user',
      data: { type: 'text', content: 'Can I automate my email campaigns?' }
    },
    {
      id: 'init-10',
      sender: 'ai',
      data: { type: 'text', content: 'Yes! Use our Automation feature to set up triggers and workflows. Common automations include welcome series, abandoned cart emails, and birthday messages.' }
    }
  ],
  isLoading: false,
  aiIconStatus: 0
};

const aiChatSlice = createSlice({
  name: 'aiChat',
  initialState,
  reducers: {
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
      if (state.isOpen && state.aiIconStatus === 2) state.aiIconStatus = 0;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
      if (state.isOpen && state.aiIconStatus === 2) state.aiIconStatus = 0;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAIIconStatus: (state, action: PayloadAction<0|1|2|3>) => {
      state.aiIconStatus = action.payload;
    },
  },
});

export const { toggleChat, addMessage, setLoading, setAIIconStatus } = aiChatSlice.actions;

export const fetchAiResponse = createAsyncThunk(
  'aiChat/fetchAiResponse',
  async (message: string, { dispatch }) => {
    dispatch(setLoading(true));
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10 second delay
      const response: Message = {
        id: uniqid(),
        sender: 'ai',
        data: {
          type: 'text',
          content: `This is a mock AI response to: "${message}"`,
        },
      };
      dispatch(addMessage(response));
      dispatch(setAIIconStatus(2));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export default aiChatSlice.reducer;
