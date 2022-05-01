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

export const isAlive = createAsyncThunk(
  'IsAlive', async (_, thunkAPI) => {
    try {
      const response = await instence.get(`IsAlive`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const commonSlice = createSlice({
  name: 'common',
  initialState: {
    subAccountSettings: null,
    tokenAlive: true
  },
  extraReducers: builder => {
    builder
      .addCase(getCommonFeatures.fulfilled, (state, { payload }) => {
        state.subAccountSettings = payload
        setCookie("subAccountSettings", payload.SubAccountSettings);
      })
      .addCase(isAlive.fulfilled, (state, { payload }) => {
        state.tokenAlive = payload;
      })
    builder
      .addCase(isAlive.rejected, (state, { payload }) => {
        state.tokenAlive = payload;
      })
  }
})



export default commonSlice.reducer