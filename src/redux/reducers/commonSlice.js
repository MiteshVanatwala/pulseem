import { instence } from '../../helpers/api'
import { getCookie, setCookie } from '../../helpers/cookies'
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
      const settings = getCookie('accountSettings');
      if (!settings || settings === '' || document.referrer.toLocaleLowerCase().includes('accountsmanage.aspx')) {
        const response = await instence.get(`GetSubAccountWithFeatureAndSettings`);
        return JSON.parse(response.data)
      }
      else {
        return settings
      }

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
    Folders: []
  }
})


export default commonSlice.reducer
