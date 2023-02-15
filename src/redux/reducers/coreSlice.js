import { createSlice } from '@reduxjs/toolkit';
import { setCookie, getCookie } from '../../helpers/Functions/cookies'
const rtlLanguages = ['he', 'ar']

export const coreSlice = createSlice({
  name: 'core',
  initialState: {
    language: 'he',
    isRTL: false,
    windowSize: 'lg',
    basename: '',
    email: '',
    phone: '',
    imageURL: '',
    isWhiteLabel: false,
    companyName: '',
    rowsPerPage: getCookie('rpp') || 6,
    isClal: false,
    accountFeatures: null,
    cameFromSubAccount: null,
    isAdmin: null,
    isAllowSwitchAccount: null,
    billingTypeId: null,
    accountSettings: null
  },
  reducers: {
    setIsClal: (state, action) => {
      state.isClal = action.payload;
      setCookie("isClal", action.payload);
    },
    setAccountFeatures: (state, action) => {
      const data = action.payload?.Data;
      state.accountSettings = data;
      state.accountFeatures = data.Account.AccountFeatures.map(String);
      setCookie("accountSettings", data)
      setCookie("accountFeatures", data.Account.AccountFeatures.map(String));
    },
    setLanguage: (state, action) => {
      state.language = action.payload
      state.isRTL = rtlLanguages.includes(action.payload)
    },
    setWindowSize: (state, action) => {
      state.windowSize = action.payload
    },
    setRowsPerPage: (state, action) => {
      state.rowsPerPage = action.payload
      setCookie('rpp', action.payload, { maxAge: 2147483647 })
    },
    setCoreData: (state, { payload }) => {
      state.basename = payload.basename
      state.email = payload.email
      state.phone = payload.phone
      state.imageURL = payload.imageURL
      state.isWhiteLabel = payload.isWhiteLabel
      state.companyName = payload.companyName || payload.basename
      state.cameFromSubAccount = payload.cameFromSubAccount
      state.isAdmin = payload.isAdmin
      state.isAllowSwitchAccount = payload.isAllowSwitchAccount
      state.billingTypeId = payload.billingTypeId
    }
  }
})

export const { setLanguage, setWindowSize, setCoreData, setRowsPerPage, setIsClal, setAccountFeatures, setAccountSettings } = coreSlice.actions // setSmsOldVersion

export default coreSlice.reducer