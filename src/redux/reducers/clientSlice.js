import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { instence } from '../../helpers/api';

export const deleteFromGroups = createAsyncThunk(
  'client/DeleteFromGroups', async (id, thunkAPI) => {
    try {
      const response = await instence.delete(`client/DeleteFromGroups/${id}`);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const removeEmailClient = createAsyncThunk(
  'client/RemoveEmailClient', async (id, thunkAPI) => {
    try {
      const response = await instence.put(`client/RemoveEmailClient/${id}`);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const removeSmsClient = createAsyncThunk(
  'client/RemoveSmsClient', async (id, thunkAPI) => {
    try {
      const response = await instence.put(`client/RemoveSmsClient/${id}`);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const reactivateEmail = createAsyncThunk(
  'client/ReactivateEmail', async (payload, thunkAPI) => {
    try {
      const response = await instence.put(`client/ReactivateEmail`, payload);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const reactivateSms = createAsyncThunk(
  'client/ReactivateSms', async (payload, thunkAPI) => {
    try {
      const response = await instence.put(`client/ReactivateSms`, payload);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const makeInvalidClients = createAsyncThunk(
  'client/makeInvalidClients', async (payload, thunkAPI) => {
    try {
      const response = await instence.post(`client/makeInvalidClients`, payload);
      return JSON.parse(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const searchAllClients = createAsyncThunk(
  'client/Get', async (payload, thunkAPI) => {
    try {
      const response = await instence.post(`client/Get`, payload);
      return JSON.parse(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const addClientsToGroup = createAsyncThunk(
  'client/AddClientsToGroup', async (payload, thunkAPI) => {
    try {
      const response = await instence.post(`client/AddClientsToGroup`, payload);
      return JSON.parse(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })


export const clientSlice = createSlice({
  name: 'client',
  initialState: {
    ClientData: null,
    TotalCount: 0,
    TotalRevenue: 0,
    CampaignClicks: 0,
    error: "",
    ToastMessages: {
      CLIENT_ZERO_SELECT: { severity: 'error', color: 'error', message: 'client.errors.zeroSelected', showAnimtionCheck: false },
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