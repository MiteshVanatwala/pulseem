import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';
import { SiteTrackingInstance } from '../../helpers/Api/SiteTrackingAPI';
import { VerifyGetUrl } from '../../helpers/Utils/Validations';
import { siteTrackingScriptUrl } from '../../config/index';
import { RandomID } from '../../helpers/Functions/functions'

export const get = createAsyncThunk(
  'events', async (data, thunkAPI) => {
    try {
      const response = await SiteTrackingInstance.get(`events`, data);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
)
export const post = createAsyncThunk(
  'events', async (data, thunkAPI) => {
    try {
      const response = await SiteTrackingInstance.post(`events`, data);
      if (data?.actionType === 'TRACK_PURCHASE_EVENT') {
        return { status: response?.status, data: response?.data };
      }
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue({ status: error.statusCode });
    }
  });

export const update = createAsyncThunk(
  'events', async (data, thunkAPI) => {
    try {
      const response = await SiteTrackingInstance.patch(`events/${data.id}`, data);
      return { status: response.status, data: response.data };
    } catch (error) {
      return thunkAPI.rejectWithValue({ status: error.statusCode });
    }
  });

export const deleteSiteTrackingEvent = createAsyncThunk(
  'events', async (eventId, thunkAPI) => {
    try {
      const response = await SiteTrackingInstance.delete(`events/${eventId}`);
      if (response?.data === '') {
        return { event: "deleteEvent", eventId };
      }
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message, eventId });
    }
  }
)

export const deletePulseemSiteTracking = createAsyncThunk(
  'siteTracking/DeleteDomain', async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.delete(`siteTracking/DeleteDomain`);
      return JSON.parse(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
)

export const getScript = createAsyncThunk(
  'getScript', async (_, thunkAPI) => {
    try {
      const payload = { data: '' };
      const isVerified = await VerifyGetUrl(`${siteTrackingScriptUrl}?v=${Math.random()}`);
      if (isVerified === true) {
        payload.data = `<script type="text/javascript">
        (function(d, t) {
          var g = d.createElement(t),
          s = d.getElementsByTagName(t)[0];
          g.src="${siteTrackingScriptUrl}?v=" + Math.floor(Date.now() / 1000);
          s.parentNode.insertBefore(g, s);
          }(document, "script"))
      </script>`;
      }
      return payload;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
)

export const setDomain = createAsyncThunk(
  'siteTracking/SetDomain', async (domain, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post('siteTracking/SetDomain', domain);
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
    purchaseEvent: null,
    purchaseEnabled: false,
    eventError: null,
    ToastMessages: {
      SUCCESS: { severity: 'success', color: 'success', message: 'siteTracking.saved', showAnimtionCheck: true },
      REVENUE_ADDED: { severity: 'success', color: 'success', message: 'siteTracking.saved', showAnimtionCheck: false },
      REVENUE_REMOVED: { severity: 'success', color: 'success', message: 'siteTracking.saved', showAnimtionCheck: false },
      REVENUE_ERROR: { severity: 'error', color: 'error', message: 'common.Error', showAnimtionCheck: false }
    },
    siteScript: null,
    eventModel: {
      id: '',
      eventName: 'PAGE_VIEW',
      domain: '',
      actionType: 'ADD_CLIENTS_TO_GROUP',
      metadata: [{
        operatorKey: 'CONTAINS',
        operatorValue: '',
        groupIds: [],
        id: RandomID()
      }]
    }
  },
  reducers: {
    updateEventModel: (state, action) => {
      try {
        if (action.payload.type === 'model') {
          state.event = action.payload.model;
          if (state.event.metadata) {
            state.event.metadata.map((mt) => {
              if (!mt.id || mt.id === '') {
                mt.id = RandomID();
              }
              return mt;
            });
          }
        }
        else if (action.payload.type === 'new') {
          state.event = state.eventModel;
        }
        else {
          state.event[action.payload.prop] = action.payload.value ?? action.payload[action.payload.prop];
        }
      } catch (err) {
        console.error(err);
      }
    },
    updateMetaData: (state, action) => {
      state.event.metadata.map((item) => {
        if (item.id === action.payload.id) {
          item[action.payload.key] = action.payload.value;
        }
        return item;
      });
    },
    deleteMetaData: (state, action) => {
      state.event.metadata = state.event.metadata.filter((item, idx) => item.id !== action.payload);
    },
    addMetaData: (state, action) => {
      const newMetaData = action.payload;
      newMetaData.id = RandomID();
      state.event.metadata = [...state.event.metadata, newMetaData];
    },
    resetEventModel: (state, action) => {
      state.event = null;
    },
    getCurrentEventGroups: (state, action) => {
      const currentEvent = state.event.metadata.filter((item) => item.id === action.payload);
      return currentEvent.groupIds;
    },
    setPurchase: (state, action) => {
      state.purchaseEvent = action.payload;
      state.purchaseEnabled = true;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(getScript.fulfilled, (state, { payload }) => {
        state.siteScript = payload?.data ?? payload;
      })
      .addCase(get.fulfilled, (state, { payload }) => {
        try {
          const response = payload.data ?? payload;
          if (!Array.isArray(response)) {
            if (response?.event === 'deleteEvent') {
              state.purchaseEnabled = false;
              state.purchaseEvent = null;
            }
            return;
          }
          const pageViewEvent = response?.find((e) => { return e.eventName === 'PAGE_VIEW' }) ?? null;
          const purchaseEvent = response?.find((e) => { return e.eventName === 'PURCHASE' }) ?? null;
          state.purchaseEvent = purchaseEvent ?? null;
          state.purchaseEnabled = purchaseEvent !== null;

          if (pageViewEvent) {
            state.event = pageViewEvent;

            if (state.event.metadata) {
              state.event.metadata.map((mt) => {
                if (!mt.id || mt.id === '') {
                  mt.id = RandomID();
                }
                return mt;
              });
            }
          }
          else {
            state.event = state.eventModel;
            if (purchaseEvent) {
              state.event.domain = purchaseEvent.domain;
            }
          }
        } catch (e) {
          console.info(e);
        }
      })
  }
})

export const {
  addMetaData,
  updateMetaData,
  deleteMetaData,
  resetEventModel,
  updateEventModel,
  getCurrentEventGroups,
  setPurchase
} = siteTrackingSlice.actions
export default siteTrackingSlice.reducer