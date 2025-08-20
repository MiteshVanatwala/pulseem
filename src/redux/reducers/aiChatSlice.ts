import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import uniqid from 'uniqid';
import { Message } from '../../Models/StateTypes';


interface AiChatState {
  isOpen: boolean;
  messages: Message[];
  isLoading: boolean;
}

const initialState: AiChatState = {
  isOpen: false,
  messages: [],
  isLoading: false,
};

const aiChatSlice = createSlice({
  name: 'aiChat',
  initialState,
  reducers: {
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { toggleChat, addMessage, setLoading } = aiChatSlice.actions;

export const fetchAiResponse = createAsyncThunk(
  'aiChat/fetchAiResponse',
  async (message: string, { dispatch }) => {
    dispatch(setLoading(true));
    // Simulate API call
    setTimeout(() => {
      const response = {
        id: uniqid(),
        sender: 'ai',
        data: {
          type: 'text',
          content: `This is a mock AI response to: "${message}"`,
        },
      };
      dispatch(addMessage(response as any));
      dispatch(setLoading(false));
    }, 1500);
  }
);

export default aiChatSlice.reducer;
