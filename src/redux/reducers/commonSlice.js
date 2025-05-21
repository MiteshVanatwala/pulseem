import { find, get } from 'lodash';
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
export const sendOTP = createAsyncThunk(
  'authorization/SendOTP',
  async (request, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`authorization/SendOTP`, request);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

const wl_referrerObject = (account) => {
  const retVal = {
    Email: account?.Email,
    Telephone: account?.Telephone,
    ReferrerID: account?.ReferrerID

  };
  switch (account?.ReferrerID) {
    case '4':
    case 4: {
      retVal.Email = 'Support@simplyclub.co.il';
      retVal.Telephone = '03-9192513'
      break;
    }
    default: {
      break;
    }
  }

  return retVal;
}

export const GetCurrencyList = createAsyncThunk(
  'AccountSubUsers/GetCurrency',
  async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`AccountSubUsers/GetCurrency`);
      return response.data;
      return [];
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

export const GetGlobalAccountPackagesDetails = createAsyncThunk(
  'dashboard/GetGlobalAccountPackagesDetails',
  async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`dashboard/GetGlobalAccountPackagesDetails`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

export const GetSmsCountries = createAsyncThunk(
  'AccountSubUsers/GetSmsCountries',
  async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`AccountSubUsers/GetSmsCountries`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

export const GetAfterLoginInitialData = createAsyncThunk(
  'AfterLoginInitialData',
  async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`AfterLoginInitialData`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

export const updateBusinessSectorActivity = createAsyncThunk(
  'UpdateBusinessSectorActivity',
  async (request, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`UpdateBusinessSectorActivity`, request);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);


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
    subAccount: null,
    isGlobal: null,
    currencyId: null,
    currency: null,
    currencyDescription: null,
    currencySymbol: '',
    isCurrencySymbolPrefix: true,
    accountCurrencySymbol: '',
    accountIsCurrencySymbolPrefix: true,
    tranzilaCurrencyID: null,
    finalGlobalBalance: 0,
    VAT: null,
    showCurrencyReportCurrencyID: null,
    currencyList: [],
    countryCodeList: [],
    WhatsAppPlatformID: null,
    TierData: [],
    IsPoland: false
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
            IsBillingAccount: data?.Account?.IsBillingAccount,
            ...wl_referrerObject(data?.Account)
          },
          SubAccountName: data?.SubAccountName,
          DefaultFromMail: data?.DefaultFromMail,
          DefaultFromName: data?.DefaultFromName,
          DefaultLinkChars: data?.DefaultLinkChars,
          DefaultCellNumber: data?.DefaultCellNumber,
          IsDirectAccount: data?.IsDirectAccount,
          SubAccountSettings: data?.SubAccountSettings,
          DomainAddress: data?.DomainAddress,
          HasSmsVoice: data?.HasSmsVoice,
          AllowEnglishInFromNumber: data?.AllowEnglishInFromNumber
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
    builder
      .addCase(GetGlobalAccountPackagesDetails.fulfilled, (state, { payload }) => {
        const isGlobal = get(payload, 'Data.balanceInfo.IsGlobalAccount', false);
        const reportCurrencyId = !isGlobal ? 1 : get(payload, 'Data.balanceInfo.ShowCurrencyReport_CurrencyID', 1);
        const accountCurrencyId = get(payload, 'Data.balanceInfo.CurrencyId', 1);

        const currency = find(state.currencyList, { ID: reportCurrencyId });
        const accountCurrency = find(state.currencyList, { ID: accountCurrencyId });

        state.currency = get(currency, 'Name', '');
        state.currencyDescription = get(currency, 'Description', '');
        state.currencyId = get(payload, 'Data.balanceInfo.CurrencyId', 1);
        state.currencySymbol = get(currency, 'CurrencySymbol', '');
        state.accountCurrencySymbol = get(accountCurrency, 'CurrencySymbol', '');
        state.accountIsCurrencySymbolPrefix = get(accountCurrency, 'IsCurrencySymbolPrefix', false);
        state.isCurrencySymbolPrefix = get(currency, 'IsCurrencySymbolPrefix', false);
        state.isGlobal = get(payload, 'Data.balanceInfo.IsGlobalAccount', null)
        state.tranzilaCurrencyID = get(payload, 'Data.balanceInfo.TranzilaCurrencyID', null)
        state.finalGlobalBalance = get(payload, 'Data.balanceInfo.FinalGlobalBalance', 0)
        state.VAT = get(payload, 'Data.balanceInfo.VAT', 0)
        state.showCurrencyReportCurrencyID = reportCurrencyId
      });
    builder
      .addCase(GetCurrencyList.fulfilled, (state, { payload }) => {
        state.currencyList = get(payload, 'Data.Data', []);
      });
    builder
      .addCase(GetSmsCountries.fulfilled, (state, { payload }) => {
        state.countryCodeList = get(payload, 'Data.Data', []);
        state.countryCodeList.push({
          ID: 0,
          Name: 'Default',
          SmsCountryPhoneCode: '0'
        })
      });
    builder
      .addCase(GetAfterLoginInitialData.fulfilled, (state, { payload }) => {
        state.WhatsAppPlatformID = get(payload, 'Data.WhatsappPlatformId', null)
        state.TierData = get(payload, 'Data.TierData', [])
        state.IsPoland = get(payload, 'Data.IsPoland', false)
      });
  },
  reducers: {
    updateDefaultFromEmail: (state, action) => {
      state.accountSettings = { ...state.accountSettings, DefaultFromMail: action.payload };
    }
  },
})

export const { updateDefaultFromEmail } = commonSlice.actions
export default commonSlice.reducer;
