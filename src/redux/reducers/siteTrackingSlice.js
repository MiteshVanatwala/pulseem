import { createSlice, createAsyncThunk, configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { eventsInstance } from '../../helpers/api';
import { SiteTrackingModel } from '../../model/SiteTracking/SiteTrackingModel'

export const get = createAsyncThunk(
  'events', async (data, thunkAPI) => {
    try {
      const response = await eventsInstance.get(`events`, data);
      return JSON.parse(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
)
export const create = createAsyncThunk(
  'events', async (data, thunkAPI) => {
    try {
      const response = await eventsInstance.post(`events`, data);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });


export const siteTrackingSlice = createSlice({
  name: 'siteTracking',
  initialState: {
    event: null,
  },
  middleware: [
    ...getDefaultMiddleware({
      serializableCheck: false
    })
  ],
  reducers: {
    updateEvent(state, action) {
      state.event = action.payload;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(get.fulfilled, (state, { payload }) => {
        state.event = new SiteTrackingModel(payload.eventName, payload.pageURL, payload.actionType, payload.metadata)
      })
      .addCase(get.rejected, (state, action) => {
        state.event = action.error.message
      })
  }
})

export const { updateEvent } = siteTrackingSlice.actions
export default siteTrackingSlice.reducer