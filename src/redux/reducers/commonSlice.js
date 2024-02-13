import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';
import { getCookie, setCookie } from '../../helpers/Functions/cookies';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const isClalAccount = createAsyncThunk(
  '/IsClalAccount',
  async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`/IsClalAccount`);
      return JSON.parse(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);
export const getAccountFeatures = createAsyncThunk(
  '/GetAccountFeatures',
  async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`/GetAccountFeatures`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);
export const getCommonFeatures = createAsyncThunk(
  'GetSubAccountWithFeatureAndSettings', async (req = null, thunkAPI) => {
    try {
      const settings = getCookie('accountSettings');
      if ((!settings || settings === '') || (req && req.forceRequest === true) ||
        document.referrer.toLocaleLowerCase().indexOf('accountsmanage.aspx') > -1 ||
        document.referrer.toLocaleLowerCase().indexOf('login') > -1 ||
        req?.companyName !== settings?.SubAccountName) {
        const response = await PulseemReactInstance.get(`GetSubAccountWithFeatureAndSettings`);
        return response.data
      }
      else {
        return { Data: settings }
      }
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);
export const isAlive = createAsyncThunk('IsAlive', async (_, thunkAPI) => {
  try {
    const response = await PulseemReactInstance.get(`IsAlive`);
    return JSON.parse(response.data);
  } catch (error) {
    return thunkAPI.rejectWithValue({ error: error.message });
  }
});

export const getAuthorizedEmails = createAsyncThunk(
  'authorization/GetAuthorizedEmails',
  async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(
        `authorization/GetAuthorizedEmails`
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);
export const newAuthorizeEmail = createAsyncThunk(
  'authorization/NewAuthorizeEmail',
  async (data, thunkAPI) => {
    const { email = '' } = data || {};
    return new Promise(async (resolve, reject) => {
      try {
        const response = await PulseemReactInstance.put(
          `authorization/NewAuthorizeEmail/${email}`
        );
        resolve(JSON.parse(response.data));
      } catch (error) {
        reject(thunkAPI.rejectWithValue({ error: error.message }));
      }
    });
  }
);

export const verifyEmailCode = createAsyncThunk(
  'authorization/VerifyEmailCode',
  async (data, thunkAPI) => {
    const { email = '', optinCode = 0 } = data || {};
    return new Promise(async (resolve, reject) => {
      try {
        const response = await PulseemReactInstance.put(
          `authorization/VerifyEmailCode/${email}/${optinCode}`
        );
        resolve(JSON.parse(response.data));
      } catch (error) {
        reject(thunkAPI.rejectWithValue({ error: error.message }));
      }
    });
  }
);

export const getAuthorizeNumbers = createAsyncThunk(
  'GetRelatedSubAccountNumber', async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`authorization/getAuthorizeNumbers`, { subID: -1 });
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const getTwoFactorAuthValues = createAsyncThunk(
  'getTwoFactorAuthValues', async (authType, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`authorization/GetTwoFactorAuthValues/${authType}`);
      response.data.TwoFactorAuthTypeID = authType;
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const isSweepingApprovalAccount = createAsyncThunk(
  'isSweepingApprovalAccount', async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`isSweepingApprovalAccount`);
      return response.data
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
    tokenAlive: true,
    twoFactorAuthEmails: [],
    twoFactorAuthNumbers: [],
    accountSettings: null,
    accountFeatures: null,
    isSweepingApproval: false,
    subAccount: null
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
        const data = payload?.Data;
        state.accountSettings = {
          Account: {
            IsPaying: data?.Account?.IsPaying,
            IsBillingAccount: data?.Account?.IsBillingAccount
          },
          SubAccountName: data?.SubAccountName,
          DefaultFromMail: data?.DefaultFromMail,
          DefaultFromName: data?.DefaultFromName,
          DefaultLinkChars: data?.DefaultLinkChars,
          DefaultCellNumber: data?.DefaultCellNumber,
          SubAccountSettings: data?.SubAccountSettings
        };
        state.accountFeatures = data?.Account?.AccountFeatures?.map(String);
        state.subAccount = data;
      })
    builder.addCase(isAlive.fulfilled, (state, { payload }) => {
      state.tokenAlive = payload;
    })
    builder.addCase(getTwoFactorAuthValues.fulfilled, (state, { payload }) => {
      if (payload?.TwoFactorAuthTypeID === 1) {
        state.twoFactorAuthEmails = payload?.Data;
      }
      else {
        state.twoFactorAuthNumbers = payload?.Data;
      }
    })
    builder
      .addCase(isSweepingApprovalAccount.fulfilled, (state, { payload }) => {
        state.isSweepingApproval = payload
      })
  },
  reducers: {
    updateDefaultFromEmail: (state, action) => {
      state.accountSettings = { ...state.accountSettings, DefaultFromMail: action.payload };
    }
  },
})

export const { updateDefaultFromEmail } = commonSlice.actions
export default commonSlice.reducer;
