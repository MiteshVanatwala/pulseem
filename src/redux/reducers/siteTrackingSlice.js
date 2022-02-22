import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
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

export const makeId = () => {
  let ID = "";
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (var i = 0; i < 12; i++) {
    ID += characters.charAt(Math.floor(Math.random() * 36));
  }
  return ID;
}


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
      try {
        const newModel = {
          id: '',
          eventName: 'PAGE_VIEW',
          domain: '',
          actionType: 'ADD_CLIENTS_TO_GROUP',
          metadata: [{
            id: makeId(),
            operatorKey: 'CONTAINS',
            operatorValue: '',
            groupIds: []
          }]
        };
        if (action.payload.type === 'model') {
          state.event = action.payload.model;
        }
        else if (action.payload.type === 'new') {
          state.event = newModel;
        }
        else {
          state.event[action.payload.prop] = action.payload;
        }
      } catch (err) {
        console.error(err);
      }
    },
    updateMetaData: (state, action) => {
      //const metaData = state.event.metadata.filter((mt) => { return mt.id === action.payload.id });
      state.event.metadata[action.payload.index][action.payload.key] = action.payload.value;
    },
    deleteMetaData: (state, action) => {
      state.event.metadata = state.event.metadata.filter((item, idx) => item.id !== action.payload);
    },
    addMetaData: (state, action) => {
      const newMetaData = action.payload;
      newMetaData.id = makeId();
      state.event.metadata = [...state.event.metadata, newMetaData];
    },
    resetEventModel: (state, action) => {
      state.event = null;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(getScript.fulfilled, (state, { payload }) => {
        state.siteScript = payload.data;
      })
      .addCase(get.fulfilled, (state, { payload }) => {
        state.event = payload[0] ?? payload.data;
      })
      .addCase(get.rejected, (state, action) => {
        state.event = action.error.message
      })
  }
})

export const { updateEventModel, updateMetaData, deleteMetaData, addMetaData, resetEventModel } = siteTrackingSlice.actions
export default siteTrackingSlice.reducer