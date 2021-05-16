import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import instence from '../../helpers/api'

export const getNotificationData = createAsyncThunk(
  'notification/getNotifications', async (_, thunkAPI) => {
    try {
      const response = await instence.get(`notification/getNotifications`);
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
      const response = await instence.post(`notification/restoreNotifications`, { IdList: IdList, SubAccountId: 7878 }
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

export const getApiToken = createAsyncThunk(
  'notification/GetSubAccountPublicKey/', async (_, thunkAPI) => {
    try {
      const response = await instence.get(`notification/GetSubAccountPublicKey/`);
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

export const saveNotification = createAsyncThunk(
  'notification/SaveNotification/', async (data, thunkAPI) => {
    try {
      const response = await instence.post(`notification/SaveNotification`, data);
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

export const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    notificationData: [],
    notificationDeletedData: [],
    notificationDataError: '',
    notificationById: {}
  },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getNotificationData.fulfilled, (state, { payload }) => {
      state.notificationData = payload.filter(row => !row.IsDeleted)
      state.notificationDeletedData = payload.filter(row => row.IsDeleted)
    })
    builder.addCase(getNotificationData.rejected, (state, action) => {
      state.notificationDataError = action.error.message
    })
  }
})



export default notificationSlice.reducer