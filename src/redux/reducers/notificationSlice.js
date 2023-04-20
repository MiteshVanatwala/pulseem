import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { instence } from '../../helpers/api'

export const getNotificationData = createAsyncThunk(
  'notification/getNotifications', async (_, thunkAPI) => {
    try {
      const response = await instence.get(`notification/getNotifications`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const getNotificationUpdates = createAsyncThunk(
  'NotificationCenter/GetUpdates', async (_, thunkAPI) => {
    try {
      const response = await instence.get(`NotificationCenter/GetUpdates`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const getDeletedNotifications = createAsyncThunk(
  'notification/getDeletedNotificationsBySubAccountId', async (_, thunkAPI) => {
    try {
      const response = await instence.get(`notification/getDeletedNotificationsBySubAccountId`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const restoreNotifications = createAsyncThunk(
  'notification/restoreNotifications', async (IdList, thunkAPI) => {
    try {
      const response = await instence.post(`notification/restoreNotifications`, { IdList: IdList }
      );
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const getNotificationById = createAsyncThunk(
  'notification/getNotificationById', async (id, thunkAPI) => {
    try {
      const response = await instence.get(`notification/getNotificationById/${id}`);
      return JSON.parse(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const getNotificationGroups = createAsyncThunk(
  'notification/getGroupsBySubAccountId/', async (id, thunkAPI) => {
    try {
      const response = await instence.get(`notification/getGroupsBySubAccountId`);
      return JSON.parse(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const getSettings = createAsyncThunk(
  'notification/GetSettings/', async (id, thunkAPI) => {
    try {
      const response = await instence.get(`notification/GetSettings/${id}`);
      return JSON.parse(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const getUniqueClientsByGroups = createAsyncThunk(
  'notification/GetUniqueClientsByGroups', async (groupIds, thunkAPI) => {
    try {
      const response = await instence.post(`notification/GetUniqueClientsByGroups`, groupIds
      );
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const SendNotification = createAsyncThunk(
  'notification/InsertNotificationBeforeSend', async (model, thunkAPI) => {
    try {
      const response = await instence.post(`notification/InsertNotificationBeforeSend`, model
      );
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });
export const saveNotificationSettings = createAsyncThunk(
  'notification/SaveNotificationSettings', async (data, thunkAPI) => {
    try {
      const response = await instence.post(`notification/SaveNotificationSettings`, data);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });



export const getNotificationGroupsById = createAsyncThunk(
  'notification/getGroupsByNotificationId', async (id, thunkAPI) => {
    try {
      const response = await instence.get(`notification/getGroupsByNotificationId/${id}`);
      return JSON.parse(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const deleteNotification = createAsyncThunk(
  'notification/deleteNotification', async (id, thunkAPI) => {
    try {
      const response = await instence.delete(`notification/deleteNotification?id=${id}`);
      return JSON.parse(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const duplicateNotification = createAsyncThunk(
  'notification/duplicate', async (id, thunkAPI) => {
    try {
      const response = await instence.put(`notification/duplicate/${id}`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const getScriptPath = createAsyncThunk(
  'notification/GetScriptPath', async (_, thunkAPI) => {
    try {
      const response = await instence.get(`notification/GetScriptPath`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const updateScriptPath = createAsyncThunk(
  'notification/SetScriptPath', async (data, thunkAPI) => {
    try {
      const response = await instence.post(`notification/SetScriptPath`, { ScriptPath: data });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const getNotificationPublicKey = createAsyncThunk(
  'notification/GetSubAccountPublicKey/', async (_, thunkAPI) => {
    try {
      const response = await instence.get(`notification/GetSubAccountPublicKey/`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const getSubAccountApiKey = createAsyncThunk(
  'notification/GetSubAccountApiKey/', async (_, thunkAPI) => {
    try {
      const response = await instence.get(`notification/GetSubAccountApiKey/`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const updateNotification = createAsyncThunk(
  'notification/UpdateNotification/', async (data, thunkAPI) => {
    try {
      const response = await instence.post(`notification/UpdateNotification`, data);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });
export const save = createAsyncThunk(
  'notification/Save/', async (data, thunkAPI) => {
    try {
      const response = await instence.post(`notification/Save`, data);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const getSubAccountRegistrations = createAsyncThunk(
  'notification/GetSubAccountRegistrations/', async (_, thunkAPI) => {
    try {
      const response = await instence.get(`notification/GetSubAccountRegistrations`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    hideScriptDialog: true,
    notificationData: [],
    notificationDeletedData: [],
    notificationDataError: '',
    notificationById: {},
    notificationList: [
      {"ActionType": 0, "IpAddress": null, "ActionDate": "2023-04-06T10:55:17.5", "ID": 6, "SubAccountId": 0, "FileName": "63e7a610-72a1-4a6e-95c0-53f2b222bc52.CSV", "IsDeleted": false, "Status": 2, "CreationDate": "2023-04-06T10:55:17.5", "FileExtension": null, "NotifyEmail": null, "ActionName": "REQUEST", "StatusName": "READY" }, { "ActionType": 0, "IpAddress": null, "ActionDate": "2023-04-06T10:50:23.793", "ID": 5, "SubAccountId": 0, "FileName": "15d7a08d-8ee5-4182-95aa-f104abf63950.CSV", "IsDeleted": false, "Status": 2, "CreationDate": "2023-04-06T10:50:23.787", "FileExtension": null, "NotifyEmail": null, "ActionName": "REQUEST", "StatusName": "READY" }, { "ActionType": 0, "IpAddress": null, "ActionDate": "2023-04-05T11:03:08.26", "ID": 4, "SubAccountId": 0, "FileName": "4301db75-291a-4f38-a5ef-1649e6ea099e.CSV", "IsDeleted": false, "Status": 2, "CreationDate": "2023-04-05T11:03:08.26", "FileExtension": null, "NotifyEmail": null, "ActionName": "REQUEST", "StatusName": "READY" }, { "ActionType": 0, "IpAddress": null, "ActionDate": "2023-04-05T10:59:29.08", "ID": 3, "SubAccountId": 0, "FileName": "a3cf5099-530f-4f67-a93a-3a399b2784ff.CSV", "IsDeleted": false, "Status": 2, "CreationDate": "2023-04-05T10:59:29.07", "FileExtension": null, "NotifyEmail": null, "ActionName": "REQUEST", "StatusName": "READY" }, { "ActionType": 0, "IpAddress": null, "ActionDate": "2023-04-05T10:01:22.3", "ID": 6, "SubAccountId": 0, "FileName": "63e7a610-72a1-4a6e-95c0-53f2b222bc52.CSV", "IsDeleted": false, "Status": 2, "CreationDate": "2023-04-06T10:55:17.5", "FileExtension": null, "NotifyEmail": null, "ActionName": "REQUEST", "StatusName": "READY" }, { "ActionType": 0, "IpAddress": null, "ActionDate": "2023-04-05T09:59:10.603", "ID": 5, "SubAccountId": 0, "FileName": "15d7a08d-8ee5-4182-95aa-f104abf63950.CSV", "IsDeleted": false, "Status": 2, "CreationDate": "2023-04-06T10:50:23.787", "FileExtension": null, "NotifyEmail": null, "ActionName": "REQUEST", "StatusName": "READY" }, { "ActionType": 0, "IpAddress": null, "ActionDate": "2023-04-05T10:01:22.3", "ID": 6, "SubAccountId": 0, "FileName": "63e7a610-72a1-4a6e-95c0-53f2b222bc52.CSV", "IsDeleted": false, "Status": 2, "CreationDate": "2023-04-06T10:55:17.5", "FileExtension": null, "NotifyEmail": null, "ActionName": "REQUEST", "StatusName": "READY" }, { "ActionType": 0, "IpAddress": null, "ActionDate": "2023-04-05T09:59:10.603", "ID": 5, "SubAccountId": 0, "FileName": "15d7a08d-8ee5-4182-95aa-f104abf63950.CSV", "IsDeleted": false, "Status": 2, "CreationDate": "2023-04-06T10:50:23.787", "FileExtension": null, "NotifyEmail": null, "ActionName": "REQUEST", "StatusName": "READY" }, { "ActionType": 0, "IpAddress": null, "ActionDate": "2023-04-05T10:01:22.3", "ID": 6, "SubAccountId": 0, "FileName": "63e7a610-72a1-4a6e-95c0-53f2b222bc52.CSV", "IsDeleted": false, "Status": 2, "CreationDate": "2023-04-06T10:55:17.5", "FileExtension": null, "NotifyEmail": null, "ActionName": "REQUEST", "StatusName": "READY" }, { "ActionType": 0, "IpAddress": null, "ActionDate": "2023-04-05T09:59:10.603", "ID": 5, "SubAccountId": 0, "FileName": "15d7a08d-8ee5-4182-95aa-f104abf63950.CSV", "IsDeleted": false, "Status": 2, "CreationDate": "2023-04-06T10:50:23.787", "FileExtension": null, "NotifyEmail": null, "ActionName": "REQUEST", "StatusName": "READY" }
    ]
  },
  reducers: {
    setScriptDialog: (state, action) => {
      state.hideScriptDialog = action.payload
    }
  },
  extraReducers: builder => {
    builder.addCase(getNotificationData.fulfilled, (state, { payload }) => {
      state.notificationData = payload.filter(row => !row.IsDeleted)
      state.notificationDeletedData = payload.filter(row => row.IsDeleted)
    })
    builder.addCase(getNotificationData.rejected, (state, action) => {
      state.notificationDataError = action.error.message
    })
    builder.addCase(getNotificationUpdates.fulfilled, (state, { payload }) => {
      state.notificationList = payload;
    })
  }
})


export const { setScriptDialog } = notificationSlice.actions;

export default notificationSlice.reducer