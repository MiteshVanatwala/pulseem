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
  'GetSubAccountWithFeatureAndSettings', async (req = null, thunkAPI) => {
    try {
      const settings = getCookie('accountSettings');
      if ((!settings || settings === '') || (req && req.forceRequest === true) ||
        document.referrer.toLocaleLowerCase().indexOf('accountsmanage.aspx') > -1 ||
        document.referrer.toLocaleLowerCase().indexOf('login') > -1 ||
        req?.companyName !== settings?.SubAccountName) {
        const response = await instence.get(`GetSubAccountWithFeatureAndSettings`);
        return response.data
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

export const getAuthorizedEmails = createAsyncThunk(
  'authorization/GetAuthorizedEmails', async (_, thunkAPI) => {
    try {
      const response = await instence.get(`authorization/GetAuthorizedEmails`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const newAuthorizeEmail = createAsyncThunk(
  'authorization/NewAuthorizeEmail', async (data, thunkAPI) => {
    const { email = '' } = data || {};
    return new Promise(async (resolve, reject) => {
      try {
        const response = await instence.put(`authorization/NewAuthorizeEmail/${email}`);
        resolve(JSON.parse(response.data))
      } catch (error) {
        reject(thunkAPI.rejectWithValue({ error: error.message }));
      }
    })
  })

export const verifyEmailCode = createAsyncThunk(
  'authorization/VerifyEmailCode', async (data, thunkAPI) => {
    const { email = '', optinCode = 0 } = data || {};
    return new Promise(async (resolve, reject) => {
      try {
        const response = await instence.put(`authorization/VerifyEmailCode/${email}/${optinCode}`);
        resolve(JSON.parse(response.data))
      } catch (error) {
        reject(thunkAPI.rejectWithValue({ error: error.message }));
      }
    })
  })

export const getAuthorizeNumbers = createAsyncThunk(
  'GetRelatedSubAccountNumber', async (_, thunkAPI) => {
    try {
      const response = await instence.get(`authorization/getAuthorizeNumbers`, { subID: -1 });
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })


export const commonSlice = createSlice({
  name: 'common',
  initialState: {
    Folders: [],
    verifiedEmails: [],
    verifiedNumbers: [],
    tokenAlive: true
  },
  extraReducers: builder => {
    builder
      .addCase(getAuthorizedEmails.fulfilled, (state, { payload }) => {
        state.verifiedEmails = payload
      })
    builder
      .addCase(getAuthorizeNumbers.fulfilled, (state, { payload }) => {
        state.verifiedNumbers = payload
      })
    builder
      .addCase(getCommonFeatures.fulfilled, (state, { payload }) => {
        setCookie('accountSettings', payload?.Data);
      })
    builder.addCase(isAlive.fulfilled, (state, { payload }) => {
      state.tokenAlive = payload;
    })
  }
})


export default commonSlice.reducer
