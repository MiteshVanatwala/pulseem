import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { instence } from '../../helpers/api'

export const getNotificationUpdates = createAsyncThunk(
  'NotificationCenter/GetUpdates', 
  async (_, thunkAPI) => {
    try {
      const response = await instence.get(`NotificationCenter/GetUpdates`);
      return response.data.Data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

export const markNotificationsAsRead = createAsyncThunk(
  'NotificationCenter/MarkAsRead', 
  async (_, thunkAPI) => {
    try {
      const response = await instence.get(`NotificationCenter/MarkAsRead`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

export const notificationUpdateSlice = createSlice({
  name: 'notificationUpdate',
  initialState: {
    notificationUpdateList: [
      {"ActionType": 0, "IpAddress": null, "ActionDate": "2023-04-06T10:55:17.5", "ID": 6, "SubAccountId": 0, "FileName": "63e7a610-72a1-4a6e-95c0-53f2b222bc52.CSV", "IsDeleted": false, "Status": 2, "CreationDate": "2023-04-06T10:55:17.5", "FileExtension": null, "NotifyEmail": null, "ActionName": "REQUEST", "StatusName": "READY" }, { "ActionType": 0, "IpAddress": null, "ActionDate": "2023-04-06T10:50:23.793", "ID": 5, "SubAccountId": 0, "FileName": "15d7a08d-8ee5-4182-95aa-f104abf63950.CSV", "IsDeleted": false, "Status": 2, "CreationDate": "2023-04-06T10:50:23.787", "FileExtension": null, "NotifyEmail": null, "ActionName": "REQUEST", "StatusName": "READY" }, { "ActionType": 0, "IpAddress": null, "ActionDate": "2023-04-05T11:03:08.26", "ID": 4, "SubAccountId": 0, "FileName": "4301db75-291a-4f38-a5ef-1649e6ea099e.CSV", "IsDeleted": false, "Status": 2, "CreationDate": "2023-04-05T11:03:08.26", "FileExtension": null, "NotifyEmail": null, "ActionName": "REQUEST", "StatusName": "READY" }, { "ActionType": 0, "IpAddress": null, "ActionDate": "2023-04-05T10:59:29.08", "ID": 3, "SubAccountId": 0, "FileName": "a3cf5099-530f-4f67-a93a-3a399b2784ff.CSV", "IsDeleted": false, "Status": 2, "CreationDate": "2023-04-05T10:59:29.07", "FileExtension": null, "NotifyEmail": null, "ActionName": "REQUEST", "StatusName": "READY" }, { "ActionType": 0, "IpAddress": null, "ActionDate": "2023-04-05T10:01:22.3", "ID": 6, "SubAccountId": 0, "FileName": "63e7a610-72a1-4a6e-95c0-53f2b222bc52.CSV", "IsDeleted": false, "Status": 2, "CreationDate": "2023-04-06T10:55:17.5", "FileExtension": null, "NotifyEmail": null, "ActionName": "REQUEST", "StatusName": "READY" }, { "ActionType": 0, "IpAddress": null, "ActionDate": "2023-04-05T09:59:10.603", "ID": 5, "SubAccountId": 0, "FileName": "15d7a08d-8ee5-4182-95aa-f104abf63950.CSV", "IsDeleted": false, "Status": 2, "CreationDate": "2023-04-06T10:50:23.787", "FileExtension": null, "NotifyEmail": null, "ActionName": "REQUEST", "StatusName": "READY" }, { "ActionType": 0, "IpAddress": null, "ActionDate": "2023-04-05T10:01:22.3", "ID": 6, "SubAccountId": 0, "FileName": "63e7a610-72a1-4a6e-95c0-53f2b222bc52.CSV", "IsDeleted": false, "Status": 2, "CreationDate": "2023-04-06T10:55:17.5", "FileExtension": null, "NotifyEmail": null, "ActionName": "REQUEST", "StatusName": "READY" }, { "ActionType": 0, "IpAddress": null, "ActionDate": "2023-04-05T09:59:10.603", "ID": 5, "SubAccountId": 0, "FileName": "15d7a08d-8ee5-4182-95aa-f104abf63950.CSV", "IsDeleted": false, "Status": 2, "CreationDate": "2023-04-06T10:50:23.787", "FileExtension": null, "NotifyEmail": null, "ActionName": "REQUEST", "StatusName": "READY" }, { "ActionType": 0, "IpAddress": null, "ActionDate": "2023-04-05T10:01:22.3", "ID": 6, "SubAccountId": 0, "FileName": "63e7a610-72a1-4a6e-95c0-53f2b222bc52.CSV", "IsDeleted": false, "Status": 2, "CreationDate": "2023-04-06T10:55:17.5", "FileExtension": null, "NotifyEmail": null, "ActionName": "REQUEST", "StatusName": "READY" }, { "ActionType": 0, "IpAddress": null, "ActionDate": "2023-04-05T09:59:10.603", "ID": 5, "SubAccountId": 0, "FileName": "15d7a08d-8ee5-4182-95aa-f104abf63950.CSV", "IsDeleted": false, "Status": 2, "CreationDate": "2023-04-06T10:50:23.787", "FileExtension": null, "NotifyEmail": null, "ActionName": "REQUEST", "StatusName": "READY" }
    ]
  },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getNotificationUpdates.fulfilled, (state, { payload }) => {
      state.notificationUpdateList = payload;
    })
    builder.addCase(markNotificationsAsRead.fulfilled, (state, { payload }) => {
    })
  }
})


export default notificationUpdateSlice.reducer