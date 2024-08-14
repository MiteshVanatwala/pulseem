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
    isGlobal: false,
    currencyId: null,
    currency: null,
    currencyDescription: null,
    currencySymbol: '',
    isCurrencySymbolPrefix: true,
    tranzilaCurrencyID: null,
    finalGlobalBalance: 0,
    VAT: null,
    showCurrencyReportCurrencyID: null,
    currencyList: [],
    countryCodeList: [
      {
          "ID": 2,
          "SmsCountryName": "USA",
          "SmsCountryPhoneCode": 1
      },
      {
          "ID": 3,
          "SmsCountryName": "United States Virgin Islands",
          "SmsCountryPhoneCode": 1340
      },
      {
          "ID": 4,
          "SmsCountryName": "Northern Mariana Islands",
          "SmsCountryPhoneCode": 1670
      },
      {
          "ID": 5,
          "SmsCountryName": "Guam",
          "SmsCountryPhoneCode": 1671
      },
      {
          "ID": 6,
          "SmsCountryName": "American Samoa",
          "SmsCountryPhoneCode": 1684
      },
      {
          "ID": 7,
          "SmsCountryName": "Puerto Rico",
          "SmsCountryPhoneCode": 1787
      },
      {
          "ID": 9,
          "SmsCountryName": "Bahamas",
          "SmsCountryPhoneCode": 1242
      },
      {
          "ID": 10,
          "SmsCountryName": "Barbados",
          "SmsCountryPhoneCode": 1246
      },
      {
          "ID": 11,
          "SmsCountryName": "Anguilla",
          "SmsCountryPhoneCode": 1264
      },
      {
          "ID": 12,
          "SmsCountryName": "Antigua and Barbuda",
          "SmsCountryPhoneCode": 1268
      },
      {
          "ID": 13,
          "SmsCountryName": "British Virgin Islands",
          "SmsCountryPhoneCode": 1284
      },
      {
          "ID": 14,
          "SmsCountryName": "Cayman Islands",
          "SmsCountryPhoneCode": 1345
      },
      {
          "ID": 15,
          "SmsCountryName": "Bermuda",
          "SmsCountryPhoneCode": 1441
      },
      {
          "ID": 16,
          "SmsCountryName": "Grenada",
          "SmsCountryPhoneCode": 1473
      },
      {
          "ID": 17,
          "SmsCountryName": "Turks and Caicos Islands",
          "SmsCountryPhoneCode": 1649
      },
      {
          "ID": 18,
          "SmsCountryName": "Montserrat",
          "SmsCountryPhoneCode": 1664
      },
      {
          "ID": 19,
          "SmsCountryName": "Sint Maarten",
          "SmsCountryPhoneCode": 1721
      },
      {
          "ID": 20,
          "SmsCountryName": "Saint Lucia",
          "SmsCountryPhoneCode": 1758
      },
      {
          "ID": 21,
          "SmsCountryName": "Dominica",
          "SmsCountryPhoneCode": 1767
      },
      {
          "ID": 22,
          "SmsCountryName": "Saint Vincent and the Grenadines",
          "SmsCountryPhoneCode": 1784
      },
      {
          "ID": 23,
          "SmsCountryName": "Dominican Republic",
          "SmsCountryPhoneCode": 1809
      },
      {
          "ID": 26,
          "SmsCountryName": "Trinidad and Tobago",
          "SmsCountryPhoneCode": 1868
      },
      {
          "ID": 27,
          "SmsCountryName": "Saint Kitts and Nevis",
          "SmsCountryPhoneCode": 1869
      },
      {
          "ID": 28,
          "SmsCountryName": "Jamaica",
          "SmsCountryPhoneCode": 1876
      },
      {
          "ID": 29,
          "SmsCountryName": "Egypt",
          "SmsCountryPhoneCode": 20
      },
      {
          "ID": 30,
          "SmsCountryName": "South Sudan",
          "SmsCountryPhoneCode": 211
      },
      {
          "ID": 31,
          "SmsCountryName": "Morocco",
          "SmsCountryPhoneCode": 212
      },
      {
          "ID": 32,
          "SmsCountryName": "Algeria",
          "SmsCountryPhoneCode": 213
      },
      {
          "ID": 33,
          "SmsCountryName": "Tunisia",
          "SmsCountryPhoneCode": 216
      },
      {
          "ID": 34,
          "SmsCountryName": "Libya",
          "SmsCountryPhoneCode": 218
      },
      {
          "ID": 35,
          "SmsCountryName": "Gambia",
          "SmsCountryPhoneCode": 220
      },
      {
          "ID": 36,
          "SmsCountryName": "Senegal",
          "SmsCountryPhoneCode": 221
      },
      {
          "ID": 37,
          "SmsCountryName": "Mauritania",
          "SmsCountryPhoneCode": 222
      },
      {
          "ID": 38,
          "SmsCountryName": "Mali",
          "SmsCountryPhoneCode": 223
      },
      {
          "ID": 39,
          "SmsCountryName": "Guinea",
          "SmsCountryPhoneCode": 224
      },
      {
          "ID": 40,
          "SmsCountryName": "Ivory Coast",
          "SmsCountryPhoneCode": 225
      },
      {
          "ID": 41,
          "SmsCountryName": "Burkina Faso",
          "SmsCountryPhoneCode": 226
      },
      {
          "ID": 42,
          "SmsCountryName": "Niger",
          "SmsCountryPhoneCode": 227
      },
      {
          "ID": 43,
          "SmsCountryName": "Togo",
          "SmsCountryPhoneCode": 228
      },
      {
          "ID": 44,
          "SmsCountryName": "Benin",
          "SmsCountryPhoneCode": 229
      },
      {
          "ID": 45,
          "SmsCountryName": "Mauritius",
          "SmsCountryPhoneCode": 230
      },
      {
          "ID": 46,
          "SmsCountryName": "Liberia",
          "SmsCountryPhoneCode": 231
      },
      {
          "ID": 47,
          "SmsCountryName": "Sierra Leone",
          "SmsCountryPhoneCode": 232
      },
      {
          "ID": 48,
          "SmsCountryName": "Ghana",
          "SmsCountryPhoneCode": 233
      },
      {
          "ID": 49,
          "SmsCountryName": "Nigeria",
          "SmsCountryPhoneCode": 234
      },
      {
          "ID": 50,
          "SmsCountryName": "Chad",
          "SmsCountryPhoneCode": 235
      },
      {
          "ID": 51,
          "SmsCountryName": "Central African Republic",
          "SmsCountryPhoneCode": 236
      },
      {
          "ID": 52,
          "SmsCountryName": "Cameroon",
          "SmsCountryPhoneCode": 237
      },
      {
          "ID": 53,
          "SmsCountryName": "Cape Verde",
          "SmsCountryPhoneCode": 238
      },
      {
          "ID": 54,
          "SmsCountryName": "S?o Tom? and Pr?ncipe",
          "SmsCountryPhoneCode": 239
      },
      {
          "ID": 55,
          "SmsCountryName": "Equatorial Guinea",
          "SmsCountryPhoneCode": 240
      },
      {
          "ID": 56,
          "SmsCountryName": "Gabon",
          "SmsCountryPhoneCode": 241
      },
      {
          "ID": 57,
          "SmsCountryName": "Republic of the Congo",
          "SmsCountryPhoneCode": 242
      },
      {
          "ID": 58,
          "SmsCountryName": "Democratic Republic of the Congo",
          "SmsCountryPhoneCode": 243
      },
      {
          "ID": 59,
          "SmsCountryName": "Angola",
          "SmsCountryPhoneCode": 244
      },
      {
          "ID": 60,
          "SmsCountryName": "Guinea-Bissau",
          "SmsCountryPhoneCode": 245
      },
      {
          "ID": 61,
          "SmsCountryName": "British Indian Ocean Territory",
          "SmsCountryPhoneCode": 246
      },
      {
          "ID": 62,
          "SmsCountryName": "Ascension Island",
          "SmsCountryPhoneCode": 247
      },
      {
          "ID": 63,
          "SmsCountryName": "Seychelles",
          "SmsCountryPhoneCode": 248
      },
      {
          "ID": 64,
          "SmsCountryName": "Sudan",
          "SmsCountryPhoneCode": 249
      },
      {
          "ID": 65,
          "SmsCountryName": "Rwanda",
          "SmsCountryPhoneCode": 250
      },
      {
          "ID": 66,
          "SmsCountryName": "Ethiopia",
          "SmsCountryPhoneCode": 251
      },
      {
          "ID": 67,
          "SmsCountryName": "Somalia",
          "SmsCountryPhoneCode": 252
      },
      {
          "ID": 68,
          "SmsCountryName": "Djibouti",
          "SmsCountryPhoneCode": 253
      },
      {
          "ID": 69,
          "SmsCountryName": "Kenya",
          "SmsCountryPhoneCode": 254
      },
      {
          "ID": 70,
          "SmsCountryName": "Tanzania",
          "SmsCountryPhoneCode": 255
      },
      {
          "ID": 71,
          "SmsCountryName": "Zanzibar, in place of never-implemented 259",
          "SmsCountryPhoneCode": 25524
      },
      {
          "ID": 72,
          "SmsCountryName": "Uganda",
          "SmsCountryPhoneCode": 256
      },
      {
          "ID": 73,
          "SmsCountryName": "Burundi",
          "SmsCountryPhoneCode": 257
      },
      {
          "ID": 74,
          "SmsCountryName": "Mozambique",
          "SmsCountryPhoneCode": 258
      },
      {
          "ID": 75,
          "SmsCountryName": "Zambia",
          "SmsCountryPhoneCode": 260
      },
      {
          "ID": 76,
          "SmsCountryName": "Madagascar",
          "SmsCountryPhoneCode": 261
      },
      {
          "ID": 77,
          "SmsCountryName": "R?union",
          "SmsCountryPhoneCode": 262
      },
      {
          "ID": 79,
          "SmsCountryName": "Mayotte (land \/ mobile, formerly with 269 Comoros)",
          "SmsCountryPhoneCode": 262639
      },
      {
          "ID": 80,
          "SmsCountryName": "Zimbabwe",
          "SmsCountryPhoneCode": 263
      },
      {
          "ID": 81,
          "SmsCountryName": "Namibia",
          "SmsCountryPhoneCode": 264
      },
      {
          "ID": 82,
          "SmsCountryName": "Malawi",
          "SmsCountryPhoneCode": 265
      },
      {
          "ID": 83,
          "SmsCountryName": "Lesotho",
          "SmsCountryPhoneCode": 266
      },
      {
          "ID": 84,
          "SmsCountryName": "Botswana",
          "SmsCountryPhoneCode": 267
      },
      {
          "ID": 85,
          "SmsCountryName": "Swaziland",
          "SmsCountryPhoneCode": 268
      },
      {
          "ID": 86,
          "SmsCountryName": "South Africa",
          "SmsCountryPhoneCode": 27
      },
      {
          "ID": 87,
          "SmsCountryName": "Saint Helena",
          "SmsCountryPhoneCode": 290
      },
      {
          "ID": 88,
          "SmsCountryName": "Tristan da Cunha",
          "SmsCountryPhoneCode": 2908
      },
      {
          "ID": 89,
          "SmsCountryName": "Eritrea",
          "SmsCountryPhoneCode": 291
      },
      {
          "ID": 90,
          "SmsCountryName": "Aruba",
          "SmsCountryPhoneCode": 297
      },
      {
          "ID": 91,
          "SmsCountryName": "Faroe Islands",
          "SmsCountryPhoneCode": 298
      },
      {
          "ID": 92,
          "SmsCountryName": "Greenland",
          "SmsCountryPhoneCode": 299
      },
      {
          "ID": 93,
          "SmsCountryName": "Greece",
          "SmsCountryPhoneCode": 30
      },
      {
          "ID": 94,
          "SmsCountryName": "Netherlands",
          "SmsCountryPhoneCode": 31
      },
      {
          "ID": 95,
          "SmsCountryName": "Belgium",
          "SmsCountryPhoneCode": 32
      },
      {
          "ID": 96,
          "SmsCountryName": "France",
          "SmsCountryPhoneCode": 33
      },
      {
          "ID": 97,
          "SmsCountryName": "Spain",
          "SmsCountryPhoneCode": 34
      },
      {
          "ID": 98,
          "SmsCountryName": "Gibraltar",
          "SmsCountryPhoneCode": 350
      },
      {
          "ID": 99,
          "SmsCountryName": "Portugal",
          "SmsCountryPhoneCode": 351
      },
      {
          "ID": 100,
          "SmsCountryName": "Luxembourg",
          "SmsCountryPhoneCode": 352
      },
      {
          "ID": 101,
          "SmsCountryName": "Ireland",
          "SmsCountryPhoneCode": 353
      },
      {
          "ID": 102,
          "SmsCountryName": "Iceland",
          "SmsCountryPhoneCode": 354
      },
      {
          "ID": 103,
          "SmsCountryName": "Albania",
          "SmsCountryPhoneCode": 355
      },
      {
          "ID": 104,
          "SmsCountryName": "Malta",
          "SmsCountryPhoneCode": 356
      },
      {
          "ID": 105,
          "SmsCountryName": "Cyprus",
          "SmsCountryPhoneCode": 357
      },
      {
          "ID": 106,
          "SmsCountryName": "Finland",
          "SmsCountryPhoneCode": 358
      },
      {
          "ID": 107,
          "SmsCountryName": "?land Islands",
          "SmsCountryPhoneCode": 35818
      },
      {
          "ID": 108,
          "SmsCountryName": "Bulgaria",
          "SmsCountryPhoneCode": 359
      },
      {
          "ID": 109,
          "SmsCountryName": "Hungary",
          "SmsCountryPhoneCode": 36
      },
      {
          "ID": 110,
          "SmsCountryName": "Lithuania",
          "SmsCountryPhoneCode": 370
      },
      {
          "ID": 111,
          "SmsCountryName": "Latvia",
          "SmsCountryPhoneCode": 371
      },
      {
          "ID": 112,
          "SmsCountryName": "Estonia",
          "SmsCountryPhoneCode": 372
      },
      {
          "ID": 113,
          "SmsCountryName": "Moldova",
          "SmsCountryPhoneCode": 373
      },
      {
          "ID": 115,
          "SmsCountryName": "Transnistria",
          "SmsCountryPhoneCode": 3735
      },
      {
          "ID": 116,
          "SmsCountryName": "Armenia",
          "SmsCountryPhoneCode": 374
      },
      {
          "ID": 118,
          "SmsCountryName": "Nagorno-Karabakh (landlines \/ mobile phones)",
          "SmsCountryPhoneCode": 37497
      },
      {
          "ID": 119,
          "SmsCountryName": "Belarus",
          "SmsCountryPhoneCode": 375
      },
      {
          "ID": 120,
          "SmsCountryName": "Andorra (formerly 33 628)",
          "SmsCountryPhoneCode": 376
      },
      {
          "ID": 121,
          "SmsCountryName": "Monaco (formerly 33 93)",
          "SmsCountryPhoneCode": 377
      },
      {
          "ID": 122,
          "SmsCountryName": "San Marino (formerly 39 549)",
          "SmsCountryPhoneCode": 378
      },
      {
          "ID": 123,
          "SmsCountryName": "Vatican City assigned but uses Italian 39 06698.",
          "SmsCountryPhoneCode": 379
      },
      {
          "ID": 124,
          "SmsCountryName": "Ukraine",
          "SmsCountryPhoneCode": 380
      },
      {
          "ID": 125,
          "SmsCountryName": "Serbia",
          "SmsCountryPhoneCode": 381
      },
      {
          "ID": 126,
          "SmsCountryName": "Montenegro",
          "SmsCountryPhoneCode": 382
      },
      {
          "ID": 127,
          "SmsCountryName": "Kosovo",
          "SmsCountryPhoneCode": 383
      },
      {
          "ID": 128,
          "SmsCountryName": "Croatia",
          "SmsCountryPhoneCode": 385
      },
      {
          "ID": 129,
          "SmsCountryName": "Slovenia",
          "SmsCountryPhoneCode": 386
      },
      {
          "ID": 130,
          "SmsCountryName": "Bosnia and Herzegovina",
          "SmsCountryPhoneCode": 387
      },
      {
          "ID": 131,
          "SmsCountryName": "Macedonia",
          "SmsCountryPhoneCode": 389
      },
      {
          "ID": 132,
          "SmsCountryName": "Italy",
          "SmsCountryPhoneCode": 39
      },
      {
          "ID": 133,
          "SmsCountryName": "Vatican City (assigned 379 but not in use)",
          "SmsCountryPhoneCode": 3906698
      },
      {
          "ID": 134,
          "SmsCountryName": "Romania",
          "SmsCountryPhoneCode": 40
      },
      {
          "ID": 135,
          "SmsCountryName": "Switzerland",
          "SmsCountryPhoneCode": 41
      },
      {
          "ID": 136,
          "SmsCountryName": "Czech Republic",
          "SmsCountryPhoneCode": 420
      },
      {
          "ID": 137,
          "SmsCountryName": "Slovakia",
          "SmsCountryPhoneCode": 421
      },
      {
          "ID": 138,
          "SmsCountryName": "Liechtenstein (formerly 4175)",
          "SmsCountryPhoneCode": 423
      },
      {
          "ID": 139,
          "SmsCountryName": "Austria",
          "SmsCountryPhoneCode": 43
      },
      {
          "ID": 140,
          "SmsCountryName": "United Kingdom",
          "SmsCountryPhoneCode": 44
      },
      {
          "ID": 141,
          "SmsCountryName": "Guernsey",
          "SmsCountryPhoneCode": 441481
      },
      {
          "ID": 142,
          "SmsCountryName": "Jersey",
          "SmsCountryPhoneCode": 441534
      },
      {
          "ID": 143,
          "SmsCountryName": "Isle of Man",
          "SmsCountryPhoneCode": 441624
      },
      {
          "ID": 144,
          "SmsCountryName": "Denmark",
          "SmsCountryPhoneCode": 45
      },
      {
          "ID": 145,
          "SmsCountryName": "Sweden",
          "SmsCountryPhoneCode": 46
      },
      {
          "ID": 146,
          "SmsCountryName": "Norway",
          "SmsCountryPhoneCode": 47
      },
      {
          "ID": 147,
          "SmsCountryName": "Svalbard",
          "SmsCountryPhoneCode": 4779
      },
      {
          "ID": 148,
          "SmsCountryName": "Jan Mayen",
          "SmsCountryPhoneCode": 4779
      },
      {
          "ID": 149,
          "SmsCountryName": "Poland",
          "SmsCountryPhoneCode": 48
      },
      {
          "ID": 150,
          "SmsCountryName": "Germany",
          "SmsCountryPhoneCode": 49
      },
      {
          "ID": 151,
          "SmsCountryName": "Falkland Islands",
          "SmsCountryPhoneCode": 500
      },
      {
          "ID": 152,
          "SmsCountryName": "Belize",
          "SmsCountryPhoneCode": 501
      },
      {
          "ID": 153,
          "SmsCountryName": "Guatemala",
          "SmsCountryPhoneCode": 502
      },
      {
          "ID": 154,
          "SmsCountryName": "El Salvador",
          "SmsCountryPhoneCode": 503
      },
      {
          "ID": 155,
          "SmsCountryName": "Honduras",
          "SmsCountryPhoneCode": 504
      },
      {
          "ID": 156,
          "SmsCountryName": "Nicaragua",
          "SmsCountryPhoneCode": 505
      },
      {
          "ID": 157,
          "SmsCountryName": "Costa Rica",
          "SmsCountryPhoneCode": 506
      },
      {
          "ID": 158,
          "SmsCountryName": "Panama",
          "SmsCountryPhoneCode": 507
      },
      {
          "ID": 159,
          "SmsCountryName": "Saint-Pierre and Miquelon",
          "SmsCountryPhoneCode": 508
      },
      {
          "ID": 160,
          "SmsCountryName": "Haiti",
          "SmsCountryPhoneCode": 509
      },
      {
          "ID": 161,
          "SmsCountryName": "Peru",
          "SmsCountryPhoneCode": 51
      },
      {
          "ID": 162,
          "SmsCountryName": "Mexico",
          "SmsCountryPhoneCode": 52
      },
      {
          "ID": 163,
          "SmsCountryName": "Cuba",
          "SmsCountryPhoneCode": 53
      },
      {
          "ID": 164,
          "SmsCountryName": "Argentina",
          "SmsCountryPhoneCode": 54
      },
      {
          "ID": 165,
          "SmsCountryName": "Brazil",
          "SmsCountryPhoneCode": 55
      },
      {
          "ID": 166,
          "SmsCountryName": "Chile",
          "SmsCountryPhoneCode": 56
      },
      {
          "ID": 167,
          "SmsCountryName": "Colombia",
          "SmsCountryPhoneCode": 57
      },
      {
          "ID": 168,
          "SmsCountryName": "Venezuela",
          "SmsCountryPhoneCode": 58
      },
      {
          "ID": 169,
          "SmsCountryName": "Bolivia",
          "SmsCountryPhoneCode": 591
      },
      {
          "ID": 170,
          "SmsCountryName": "Guyana",
          "SmsCountryPhoneCode": 592
      },
      {
          "ID": 171,
          "SmsCountryName": "Ecuador",
          "SmsCountryPhoneCode": 593
      },
      {
          "ID": 172,
          "SmsCountryName": "French Guiana",
          "SmsCountryPhoneCode": 594
      },
      {
          "ID": 173,
          "SmsCountryName": "Paraguay",
          "SmsCountryPhoneCode": 595
      },
      {
          "ID": 174,
          "SmsCountryName": "Martinique",
          "SmsCountryPhoneCode": 596
      },
      {
          "ID": 175,
          "SmsCountryName": "Suriname",
          "SmsCountryPhoneCode": 597
      },
      {
          "ID": 176,
          "SmsCountryName": "Uruguay",
          "SmsCountryPhoneCode": 598
      },
      {
          "ID": 177,
          "SmsCountryName": "Sint Eustatius",
          "SmsCountryPhoneCode": 5993
      },
      {
          "ID": 178,
          "SmsCountryName": "Saba",
          "SmsCountryPhoneCode": 5994
      },
      {
          "ID": 179,
          "SmsCountryName": "Bonaire",
          "SmsCountryPhoneCode": 5997
      },
      {
          "ID": 180,
          "SmsCountryName": "formerly  Aruba , See country code 297 above",
          "SmsCountryPhoneCode": 5998
      },
      {
          "ID": 181,
          "SmsCountryName": "Cura?ao",
          "SmsCountryPhoneCode": 5999
      },
      {
          "ID": 182,
          "SmsCountryName": "Malaysia",
          "SmsCountryPhoneCode": 60
      },
      {
          "ID": 183,
          "SmsCountryName": "Australia",
          "SmsCountryPhoneCode": 61
      },
      {
          "ID": 184,
          "SmsCountryName": "Cocos Islands",
          "SmsCountryPhoneCode": 6189162
      },
      {
          "ID": 185,
          "SmsCountryName": "Christmas Island",
          "SmsCountryPhoneCode": 6189164
      },
      {
          "ID": 186,
          "SmsCountryName": "Indonesia",
          "SmsCountryPhoneCode": 62
      },
      {
          "ID": 187,
          "SmsCountryName": "Philippines",
          "SmsCountryPhoneCode": 63
      },
      {
          "ID": 188,
          "SmsCountryName": "New Zealand",
          "SmsCountryPhoneCode": 64
      },
      {
          "ID": 189,
          "SmsCountryName": "Singapore",
          "SmsCountryPhoneCode": 65
      },
      {
          "ID": 190,
          "SmsCountryName": "Thailand",
          "SmsCountryPhoneCode": 66
      },
      {
          "ID": 191,
          "SmsCountryName": "East Timor",
          "SmsCountryPhoneCode": 670
      },
      {
          "ID": 192,
          "SmsCountryName": "Norfolk Island",
          "SmsCountryPhoneCode": 6723
      },
      {
          "ID": 193,
          "SmsCountryName": "Brunei",
          "SmsCountryPhoneCode": 673
      },
      {
          "ID": 194,
          "SmsCountryName": "Nauru",
          "SmsCountryPhoneCode": 674
      },
      {
          "ID": 195,
          "SmsCountryName": "Papua New Guinea",
          "SmsCountryPhoneCode": 675
      },
      {
          "ID": 196,
          "SmsCountryName": "Tonga",
          "SmsCountryPhoneCode": 676
      },
      {
          "ID": 197,
          "SmsCountryName": "Solomon Islands",
          "SmsCountryPhoneCode": 677
      },
      {
          "ID": 198,
          "SmsCountryName": "Vanuatu",
          "SmsCountryPhoneCode": 678
      },
      {
          "ID": 199,
          "SmsCountryName": "Fiji",
          "SmsCountryPhoneCode": 679
      },
      {
          "ID": 200,
          "SmsCountryName": "Palau",
          "SmsCountryPhoneCode": 680
      },
      {
          "ID": 201,
          "SmsCountryName": "Wallis and Futuna",
          "SmsCountryPhoneCode": 681
      },
      {
          "ID": 202,
          "SmsCountryName": "Cook Islands",
          "SmsCountryPhoneCode": 682
      },
      {
          "ID": 203,
          "SmsCountryName": "Niue",
          "SmsCountryPhoneCode": 683
      },
      {
          "ID": 204,
          "SmsCountryName": "Samoa",
          "SmsCountryPhoneCode": 685
      },
      {
          "ID": 205,
          "SmsCountryName": "Kiribati",
          "SmsCountryPhoneCode": 686
      },
      {
          "ID": 206,
          "SmsCountryName": "New Caledonia",
          "SmsCountryPhoneCode": 687
      },
      {
          "ID": 207,
          "SmsCountryName": "Tuvalu",
          "SmsCountryPhoneCode": 688
      },
      {
          "ID": 208,
          "SmsCountryName": "French Polynesia",
          "SmsCountryPhoneCode": 689
      },
      {
          "ID": 209,
          "SmsCountryName": "Tokelau",
          "SmsCountryPhoneCode": 690
      },
      {
          "ID": 210,
          "SmsCountryName": "Federated States of Micronesia",
          "SmsCountryPhoneCode": 691
      },
      {
          "ID": 211,
          "SmsCountryName": "Marshall Islands",
          "SmsCountryPhoneCode": 692
      },
      {
          "ID": 212,
          "SmsCountryName": "Russia",
          "SmsCountryPhoneCode": 7
      },
      {
          "ID": 213,
          "SmsCountryName": "Kazakhstan",
          "SmsCountryPhoneCode": 77
      },
      {
          "ID": 215,
          "SmsCountryName": "Abkhazia - see also 995 44",
          "SmsCountryPhoneCode": 940
      },
      {
          "ID": 216,
          "SmsCountryName": "Japan",
          "SmsCountryPhoneCode": 81
      },
      {
          "ID": 217,
          "SmsCountryName": "South Korea",
          "SmsCountryPhoneCode": 82
      },
      {
          "ID": 218,
          "SmsCountryName": "Vietnam",
          "SmsCountryPhoneCode": 84
      },
      {
          "ID": 219,
          "SmsCountryName": "North Korea",
          "SmsCountryPhoneCode": 850
      },
      {
          "ID": 220,
          "SmsCountryName": "Hong Kong",
          "SmsCountryPhoneCode": 852
      },
      {
          "ID": 221,
          "SmsCountryName": "Macau",
          "SmsCountryPhoneCode": 853
      },
      {
          "ID": 222,
          "SmsCountryName": "Cambodia",
          "SmsCountryPhoneCode": 855
      },
      {
          "ID": 223,
          "SmsCountryName": "Laos",
          "SmsCountryPhoneCode": 856
      },
      {
          "ID": 224,
          "SmsCountryName": "China",
          "SmsCountryPhoneCode": 86
      },
      {
          "ID": 225,
          "SmsCountryName": "Inmarsat SNAC service",
          "SmsCountryPhoneCode": 870
      },
      {
          "ID": 228,
          "SmsCountryName": "reserved for Maritime Mobile service",
          "SmsCountryPhoneCode": 877
      },
      {
          "ID": 229,
          "SmsCountryName": "Universal Personal Telecommunications services",
          "SmsCountryPhoneCode": 878
      },
      {
          "ID": 230,
          "SmsCountryName": "Bangladesh",
          "SmsCountryPhoneCode": 880
      },
      {
          "ID": 231,
          "SmsCountryName": "Global Mobile Satellite System",
          "SmsCountryPhoneCode": 881
      },
      {
          "ID": 233,
          "SmsCountryName": "International Networks",
          "SmsCountryPhoneCode": 883
      },
      {
          "ID": 234,
          "SmsCountryName": "Taiwan",
          "SmsCountryPhoneCode": 886
      },
      {
          "ID": 235,
          "SmsCountryName": "Telecommunications for Disaster Relief by OCHA",
          "SmsCountryPhoneCode": 888
      },
      {
          "ID": 236,
          "SmsCountryName": "Turkey",
          "SmsCountryPhoneCode": 90
      },
      {
          "ID": 237,
          "SmsCountryName": "Northern Cyprus",
          "SmsCountryPhoneCode": 90392
      },
      {
          "ID": 238,
          "SmsCountryName": "India",
          "SmsCountryPhoneCode": 91
      },
      {
          "ID": 239,
          "SmsCountryName": "Pakistan",
          "SmsCountryPhoneCode": 92
      },
      {
          "ID": 240,
          "SmsCountryName": "Afghanistan",
          "SmsCountryPhoneCode": 93
      },
      {
          "ID": 241,
          "SmsCountryName": "Sri Lanka",
          "SmsCountryPhoneCode": 94
      },
      {
          "ID": 242,
          "SmsCountryName": "Myanmar",
          "SmsCountryPhoneCode": 95
      },
      {
          "ID": 243,
          "SmsCountryName": "Maldives",
          "SmsCountryPhoneCode": 960
      },
      {
          "ID": 244,
          "SmsCountryName": "Lebanon",
          "SmsCountryPhoneCode": 961
      },
      {
          "ID": 245,
          "SmsCountryName": "Jordan",
          "SmsCountryPhoneCode": 962
      },
      {
          "ID": 246,
          "SmsCountryName": "Syria",
          "SmsCountryPhoneCode": 963
      },
      {
          "ID": 247,
          "SmsCountryName": "Iraq",
          "SmsCountryPhoneCode": 964
      },
      {
          "ID": 248,
          "SmsCountryName": "Kuwait",
          "SmsCountryPhoneCode": 965
      },
      {
          "ID": 249,
          "SmsCountryName": "Saudi Arabia",
          "SmsCountryPhoneCode": 966
      },
      {
          "ID": 250,
          "SmsCountryName": "Yemen",
          "SmsCountryPhoneCode": 967
      },
      {
          "ID": 251,
          "SmsCountryName": "Oman",
          "SmsCountryPhoneCode": 968
      },
      {
          "ID": 252,
          "SmsCountryName": "Palestine",
          "SmsCountryPhoneCode": 970
      },
      {
          "ID": 253,
          "SmsCountryName": "United Arab Emirates",
          "SmsCountryPhoneCode": 971
      },
      {
          "ID": 254,
          "SmsCountryName": "Israel",
          "SmsCountryPhoneCode": 972
      },
      {
          "ID": 255,
          "SmsCountryName": "Bahrain",
          "SmsCountryPhoneCode": 973
      },
      {
          "ID": 256,
          "SmsCountryName": "Qatar",
          "SmsCountryPhoneCode": 974
      },
      {
          "ID": 257,
          "SmsCountryName": "Bhutan",
          "SmsCountryPhoneCode": 975
      },
      {
          "ID": 258,
          "SmsCountryName": "Mongolia",
          "SmsCountryPhoneCode": 976
      },
      {
          "ID": 259,
          "SmsCountryName": "Nepal",
          "SmsCountryPhoneCode": 977
      },
      {
          "ID": 260,
          "SmsCountryName": "Iran",
          "SmsCountryPhoneCode": 98
      },
      {
          "ID": 261,
          "SmsCountryName": "Tajikistan",
          "SmsCountryPhoneCode": 992
      },
      {
          "ID": 262,
          "SmsCountryName": "Turkmenistan",
          "SmsCountryPhoneCode": 993
      },
      {
          "ID": 263,
          "SmsCountryName": "Azerbaijan",
          "SmsCountryPhoneCode": 994
      },
      {
          "ID": 264,
          "SmsCountryName": "Georgia",
          "SmsCountryPhoneCode": 995
      },
      {
          "ID": 265,
          "SmsCountryName": "South Ossetia",
          "SmsCountryPhoneCode": 99534
      },
      {
          "ID": 266,
          "SmsCountryName": "Abkhazia[3][4] - see also 7 840, 940",
          "SmsCountryPhoneCode": 99544
      },
      {
          "ID": 267,
          "SmsCountryName": "Kyrgyzstan",
          "SmsCountryPhoneCode": 996
      },
      {
          "ID": 268,
          "SmsCountryName": "Uzbekistan",
          "SmsCountryPhoneCode": 998
      },
      {
          "ID": 269,
          "SmsCountryName": "Guadeloupe",
          "SmsCountryPhoneCode": 590
      },
      {
          "ID": 270,
          "SmsCountryName": "Canada",
          "SmsCountryPhoneCode": 1
      }
    ]
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
    builder
      .addCase(GetGlobalAccountPackagesDetails.fulfilled, (state, { payload }) => {
        const currency = find(state.currencyList, { ID: get(payload, 'Data.balanceInfo.ShowCurrencyReport_CurrencyID', 1)});
        state.currency = get(currency, 'Name', '');
        state.currencyDescription = get(currency, 'Description', '');
        state.currencyId = get(currency, 'ID', '');
        state.currencySymbol = get(currency, 'CurrencySymbol', '');
        state.isCurrencySymbolPrefix = get(currency, 'IsCurrencySymbolPrefix', false);
        state.isGlobal = get(payload, 'Data.balanceInfo.IsGlobalAccount', null)
        state.tranzilaCurrencyID = get(payload, 'Data.balanceInfo.TranzilaCurrencyID', null)
        state.finalGlobalBalance = get(payload, 'Data.balanceInfo.FinalGlobalBalance', 0)
        state.VAT = get(payload, 'Data.balanceInfo.VAT', 0)
        state.showCurrencyReportCurrencyID = get(payload, 'Data.balanceInfo.ShowCurrencyReport_CurrencyID', null)
      });
    builder
      .addCase(GetCurrencyList.fulfilled, (state, { payload }) => {
        state.currencyList = get(payload, 'Data.Data', false);
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
