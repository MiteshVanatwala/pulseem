import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { instence } from '../../helpers/api';
import { ClientSearchResultData } from '../../screens/ClientSearch/tempContants';

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

export const searchAllClients = createAsyncThunk(
  'client/Get', async (payload, thunkAPI) => {
    try {
      const response = await instence.get(`client/Get`, payload);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })


export const clientSlice = createSlice({
  name: 'client',
  initialState: {
    ClientData: [],
    TotalCount: 0,
    error: "",
    ToastMessages: {

    }
  },
  extraReducers: builder => {
    // builder.addCase(searchAllClients.fulfilled, (state, { payload }) => {
    //   state.ClientData = ClientSearchResultData.Clients;
    //   state.TotalCount = ClientSearchResultData.TotalCount;
    // })
    builder.addCase(searchAllClients.rejected, (state, { error }) => {
      state.error = error.message;
    })
  }
})


export default clientSlice.reducer