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
        g.src="${siteTrackingScriptUrl}";
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

export const siteTrackingSlice = createSlice({
  name: 'siteTracking',
  initialState: {
    event: null,
    ToastMessages: {
      SUCCESS: { severity: 'success', color: 'success', message: 'siteTracking.saved', showAnimtionCheck: true }
    },
    siteScript: null
  },
  // middleware: [
  //   ...getDefaultMiddleware({
  //     serializableCheck: false
  //   })
  // ],
  // reducers: {
  //   updateEvent(state, action) {
  //     state.event = action.payload;
  //   }
  // },
  extraReducers: builder => {
    builder
      .addCase(getScript.fulfilled, (state, { payload }) => {
        state.siteScript = payload.data;
      })
      .addCase(get.rejected, (state, action) => {
        state.event = action.error.message
      })
  }
})

// export const { updateEvent } = siteTrackingSlice.actions
export default siteTrackingSlice.reducer