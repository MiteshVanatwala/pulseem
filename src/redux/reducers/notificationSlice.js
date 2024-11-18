import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';

export const getNotificationData = createAsyncThunk(
  'notification/getNotifications', async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`notification/getNotifications`);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const getDeletedNotifications = createAsyncThunk(
  'notification/getDeletedNotificationsBySubAccountId', async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`notification/getDeletedNotificationsBySubAccountId`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const restoreNotifications = createAsyncThunk(
  'notification/restoreNotifications', async (IdList, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`notification/restoreNotifications`, { IdList: IdList }
      );
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const getNotificationById = createAsyncThunk(
  'notification/getNotificationById', async (id, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`notification/getNotificationById/${id}`);
      return JSON.parse(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const getNotificationGroups = createAsyncThunk(
  'notification/getGroupsBySubAccountId/', async (id, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`notification/getGroupsBySubAccountId`);
      return JSON.parse(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const getSettings = createAsyncThunk(
  'notification/GetSettings/', async (id, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`notification/GetSettings/${id}`);
      return JSON.parse(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const getUniqueClientsByGroups = createAsyncThunk(
  'notification/GetUniqueClientsByGroups', async (groupIds, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`notification/GetUniqueClientsByGroups`, groupIds
      );
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const SendNotification = createAsyncThunk(
  'notification/InsertNotificationBeforeSend', async (model, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`notification/InsertNotificationBeforeSend`, model
      );
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });
export const saveNotificationSettings = createAsyncThunk(
  'notification/SaveNotificationSettings', async (data, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`notification/SaveNotificationSettings`, data);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });



export const getNotificationGroupsById = createAsyncThunk(
  'notification/getGroupsByNotificationId', async (id, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`notification/getGroupsByNotificationId/${id}`);
      return JSON.parse(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const deleteNotification = createAsyncThunk(
  'notification/deleteNotification', async (id, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.delete(`notification/deleteNotification?id=${id}`);
      return JSON.parse(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const duplicateNotification = createAsyncThunk(
  'notification/duplicate', async (id, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.put(`notification/duplicate/${id}`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const getScriptPath = createAsyncThunk(
  'notification/GetScriptPath', async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`notification/GetScriptPath`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const updateScriptPath = createAsyncThunk(
  'notification/SetScriptPath', async (data, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`notification/SetScriptPath`, { ScriptPath: data });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const getNotificationPublicKey = createAsyncThunk(
  'notification/GetSubAccountPublicKey/', async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`notification/GetSubAccountPublicKey/`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const getSubAccountApiKey = createAsyncThunk(
  'notification/GetSubAccountApiKey/', async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`notification/GetSubAccountApiKey/`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const updateNotification = createAsyncThunk(
  'notification/UpdateNotification/', async (data, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`notification/UpdateNotification`, data);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });
export const save = createAsyncThunk(
  'notification/Save/', async (data, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`notification/Save`, data);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const getSubAccountRegistrations = createAsyncThunk(
  'notification/GetSubAccountRegistrations/', async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`notification/GetSubAccountRegistrations`);
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
    notificationGroups: null,
    scriptPath: '',
    subAccountApiKey: ''
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
    builder.addCase(getNotificationGroups.fulfilled, (state, { payload }) => {
      state.notificationGroups = payload;
    })
    builder.addCase(getScriptPath.fulfilled, (state, { payload }) => {
      state.scriptPath = payload;
    })
    builder.addCase(getSubAccountApiKey.fulfilled, (state, { payload }) => {
      state.subAccountApiKey = payload;
    })
  }
})


export const { setScriptDialog } = notificationSlice.actions;

export default notificationSlice.reducer