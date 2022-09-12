import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReact';

export const deleteFromGroups = createAsyncThunk(
  'client/DeleteFromGroups', async (id, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.delete(`client/DeleteFromGroups/${id}`);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const removeEmailClient = createAsyncThunk(
  'client/RemoveEmailClient', async (id, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.put(`client/RemoveEmailClient/${id}`);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const removeSmsClient = createAsyncThunk(
  'client/RemoveSmsClient', async (id, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.put(`client/RemoveSmsClient/${id}`);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const reactivateEmail = createAsyncThunk(
  'client/ReactivateEmail', async (payload, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.put(`client/ReactivateEmail`, payload);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const reactivateSms = createAsyncThunk(
  'client/ReactivateSms', async (payload, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.put(`client/ReactivateSms`, payload);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const searchAllClients = createAsyncThunk(
  'client/Get', async (payload, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`client/Get`, payload);
      return JSON.parse(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })


export const clientSlice = createSlice({
  name: 'client',
  initialState: {
    ClientData: [],
    TotalCount: 0,
    TotalRevenue: 0,
    CampaignClicks: 0,
    error: "",
    ToastMessages: {

    }
  },
  extraReducers: builder => {
    builder.addCase(searchAllClients.fulfilled, (state, { payload }) => {
      state.ClientData = payload.Clients;
      state.TotalCount = payload.TotalCount;
      state.TotalRevenue = payload.TotalRevenue;
      state.CampaignClicks = payload.CampaignClicks ?? 0;
    })
    builder.addCase(searchAllClients.rejected, (state, { error }) => {
      state.error = error.message;
    })
  }
})


export default clientSlice.reducer