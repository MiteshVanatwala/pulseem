import { createSlice, createAsyncThunk, configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { eventsInstance } from '../../helpers/api';

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

export const getScript = createAsyncThunk(
  'getScript', async (_, thunkAPI) => {
    try {
      const response = await eventsInstance.get(`getScript`);
      return response.data;
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
    siteScript: ''
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
        state.siteScript = payload.replace(/['"]+/g, '')
      })
      .addCase(get.rejected, (state, action) => {
        state.event = action.error.message
      })
  }
})

// export const { updateEvent } = siteTrackingSlice.actions
export default siteTrackingSlice.reducer