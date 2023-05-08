import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';

export const getNotificationUpdates = createAsyncThunk(
  'NotifyCenter/GetUpdates',
  async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`NotifyCenter/GetUpdates`);
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
      const response = await PulseemReactInstance.put(`NotifyCenter/MarkAsRead`);
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
      state.notifyCenterList = payload?.Data.sort(function(a,b){
        return new Date(b.CreationDate) - new Date(a.CreationDate);
      });;
      state.unreadMessages = parseInt(payload?.Message);
    })
    builder.addCase(markNotificationsAsRead.fulfilled, (state, { payload }) => {
      state.unreadMessages = 0;
    })
  }
})


export default notificationUpdateSlice.reducer