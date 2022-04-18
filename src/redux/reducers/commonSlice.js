import { instence } from '../../helpers/api'
import { setCookie } from '../../helpers/cookies'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const isClalAccount = createAsyncThunk(
  '/IsClalAccount', async (_, thunkAPI) => {
    try {
      const response = await instence.get(`/IsClalAccount`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const getAccountFeatures = createAsyncThunk(
  '/GetAccountFeatures', async (_, thunkAPI) => {
    try {
      const response = await instence.get(`/GetAccountFeatures`);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });
export const getCommonFeatures = createAsyncThunk(
  'GetSubAccountWithFeatureAndSettings', async (_, thunkAPI) => {
    try {
      const response = await instence.get(`GetSubAccountWithFeatureAndSettings`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })


export const commonSlice = createSlice({
  name: 'common',
  initialState: {
    subAccountSettings: null
  },
  extraReducers: builder => {
    builder
      .addCase(getCommonFeatures.fulfilled, (state, { payload }) => {
        state.subAccountSettings = payload
        setCookie("subAccountSettings", payload.SubAccountSettings);
      })
  }
})



export default commonSlice.reducer