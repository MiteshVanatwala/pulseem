import { createSlice, createAsyncThunk, configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { eventsInstance, instence } from '../../helpers/api';
import { verifyGetUrl } from '../../helpers/functions';
import { siteTrackingScriptUrl } from '../../config/index';

export const get = createAsyncThunk(
  'events', async (data, thunkAPI) => {
    try {
      const response = await eventsInstance.get(`events`, data);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
)
export const post = createAsyncThunk(
  'events', async (data, thunkAPI) => {
    try {
      const response = await eventsInstance.post(`events`, data);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue({ status: error.statusCode });
    }
  });

export const update = createAsyncThunk(
  'events', async (data, thunkAPI) => {
    try {
      const response = await eventsInstance.patch(`events/${data.id}`, data);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue({ status: error.statusCode });
    }
  });

export const deleteSiteTrackingEvent = createAsyncThunk(
  'events', async (eventId, thunkAPI) => {
    try {
      const response = await eventsInstance.delete(`events/${eventId}`);
      return JSON.parse(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
)

export const deletePulseemSiteTracking = createAsyncThunk(
  'siteTracking/DeleteDomain', async (_, thunkAPI) => {
    try {
      const response = await instence.delete(`siteTracking/DeleteDomain`);
      return JSON.parse(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
)

export const getScript = createAsyncThunk(
  'getScript', async (_, thunkAPI) => {
    try {
      const isVerified = await verifyGetUrl(`${siteTrackingScriptUrl}?v=${Math.random()}`);
      const response = {};
      if (isVerified === true) {
        response["data"] = `<script type="text/javascript">
      (function(d, t) {
        var g = d.createElement(t),
        s = d.getElementsByTagName(t)[0];
        g.src="${siteTrackingScriptUrl}?v=" + Math.floor(Date.now() / 1000);
        s.parentNode.insertBefore(g, s);
        }(document, "script"))
    </script>`;
      }
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
)

export const setDomain = createAsyncThunk(
  'siteTracking/SetDomain', async (domain, thunkAPI) => {
    try {
      const response = await instence.post('siteTracking/SetDomain', domain);
      return JSON.parse(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
)

const dummy = [{ "id": "9b30b88f-b278-4969-9e0a-cd259eb8bd10", "createdAt": "2022-02-06T11:59:09.446Z", "createdBy": "s6phvaT3dhKeSU3YYU0DjA==", "domain": "pulseemdev.co.il", "eventName": "PAGE_VIEW", "actionType": "ADD_CLIENTS_TO_GROUP", "metadata": [{ "operatorKey": "CONTAINS", "operatorValue": "sms", "groupIds": [551841] }, { "operatorKey": "CONTAINS", "operatorValue": "cart", "groupIds": [551841] }] }];

export const siteTrackingSlice = createSlice({
  name: 'siteTracking',
  initialState: {
    event: null,
    ToastMessages: {
      SUCCESS: { severity: 'success', color: 'success', message: 'siteTracking.saved', showAnimtionCheck: true }
    },
    siteScript: null
  },
  reducers: {
    updateEventModel: (state, action) => {
      if (action.payload.type === 'model') {
        state.event = action.payload.model;
      }
      else {
        state.event[action.payload.prop] = action.payload;
      }
    },
    updateMetaData: (state, action) => {
      state.event.metadata[action.payload.index][action.payload.key] = action.payload.value;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(getScript.fulfilled, (state, { payload }) => {
        state.siteScript = payload.data;
      })
      .addCase(get.fulfilled, (state, { payload }) => {
        console.log('get payload', payload);
        state.event = dummy[0];
      })
      .addCase(get.rejected, (state, action) => {
        state.event = action.error.message
      })
  }
})

export const { updateEventModel, updateMetaData } = siteTrackingSlice.actions
export default siteTrackingSlice.reducer