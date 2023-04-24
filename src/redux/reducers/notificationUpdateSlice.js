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
      // state.notifyCenterList = payload?.Data;
      state.notifyCenterList = [{"ID":1,"SubAccountID":0,"TargetName":"1123","NotifyCenterTypeID":0,"NotifyCenterStatusID":1,"SourceID":0,"CreationDate":"2023-04-20T15:23:04.173","UpdatedDate":"0001-01-01T00:00:00"},{"ID":2,"SubAccountID":0,"TargetName":"נוטשים","NotifyCenterTypeID":1,"NotifyCenterStatusID":1,"SourceID":0,"CreationDate":"2023-04-20T16:25:21.55","UpdatedDate":"0001-01-01T00:00:00"},{"ID":3,"SubAccountID":0,"TargetName":"Newsletter","NotifyCenterTypeID":1,"NotifyCenterStatusID":1,"SourceID":0,"CreationDate":"2023-04-20T16:25:37.337","UpdatedDate":"0001-01-01T00:00:00"},{"ID":4,"SubAccountID":0,"TargetName":"לקוחות חדשים","NotifyCenterTypeID":2,"NotifyCenterStatusID":1,"SourceID":0,"CreationDate":"2023-04-20T16:25:50.48","UpdatedDate":"0001-01-01T00:00:00"}];
      state.unreadMessages = parseInt(payload?.Message);
    })
    builder.addCase(markNotificationsAsRead.fulfilled, (state, { payload }) => {
    })
  }
})


export default notificationUpdateSlice.reducer