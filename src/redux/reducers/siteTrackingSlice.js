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
export const post = createAsyncThunk(
  'events', async (data, thunkAPI) => {
    try {
      const response = await eventsInstance.post(`events`, data);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });


export const siteTrackingSlice = createSlice({
  name: 'siteTracking',
  initialState: {
    event: null,
    ToastMessages: {
      SUCCESS: { severity: 'success', color: 'success', message: 'siteTracking.saved', showAnimtionCheck: true }
    }
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
      // .addCase(get.fulfilled, (state, { payload }) => {
      //   let siteTrackEvent =  new SiteTrackingModel(payload.eventName, payload.pageURL, payload.actionType, payload.metadata);
      //   state.event = siteTrackEvent
      // })
      .addCase(get.rejected, (state, action) => {
        state.event = action.error.message
      })
  }
})

// export const { updateEvent } = siteTrackingSlice.actions
export default siteTrackingSlice.reducer