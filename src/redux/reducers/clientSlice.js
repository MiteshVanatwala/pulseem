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



export const clientSlice = createSlice({
  name: 'client',
  initialState: {

  },
  extraReducers: builder => {
    // builder
    //   .addCase(x.fulfilled, (state, { payload }) => {
    //     state.x = payload
    //   })
  }
})


export default clientSlice.reducer