import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { instence } from '../../helpers/api'

export const getNotificationUpdates = createAsyncThunk(
  'NotifyCenter/GetUpdates',
  async (_, thunkAPI) => {
    try {
      const response = await instence.get(`NotifyCenter/GetUpdates`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

export const markNotificationsAsRead = createAsyncThunk(
  'NotifyCenter/MarkAsRead',
  async (_, thunkAPI) => {
    try {
      const response = await instence.put(`NotifyCenter/MarkAsRead`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

export const notificationUpdateSlice = createSlice({
  name: 'notificationUpdate',
  initialState: {
    notifyCenterList: null,
    unreadMessages: 0
  },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getNotificationUpdates.fulfilled, (state, { payload }) => {
      state.notifyCenterList = payload?.Data;
      state.unreadMessages = parseInt(payload?.Message);
    })
    builder.addCase(markNotificationsAsRead.fulfilled, (state, { payload }) => {
    })
  }
})


export default notificationUpdateSlice.reducer