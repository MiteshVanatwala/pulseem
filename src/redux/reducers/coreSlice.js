import { createSlice } from '@reduxjs/toolkit';
import { setCookie, getCookie } from '../../helpers/Functions/cookies'
const rtlLanguages = ['he', 'ar']

export const isSuperUserSelector = (state) => {
  const adminPermissions = [1, 2, 3, 4];
  return adminPermissions?.every(permission =>
    state.subUserPermissions?.indexOf(permission) > -1
  );
};

export const coreSlice = createSlice({
  name: 'core',
  initialState: {
    language: 'he',
    isRTL: false,
    windowSize: 'lg',
    basename: '',
    email: '',
    imageURL: '',
    isWhiteLabel: false,
    companyName: '',
    rowsPerPage: getCookie('rpp') || 6,
    isClal: null,
    cameFromSubAccount: null,
    isAdmin: null,
    isAllowSwitchAccount: null,
    billingTypeId: null,
    accountFeatures: null,
    isDebtAccount: null,
    subUserPermissions: [1, 2, 3, 4],
    isSuperUser: true,
    CoreToastMessages: {
      XSS_ERROR: { severity: 'error', color: 'error', message: 'common.xssError', showAnimtionCheck: false }
    }
  },
  reducers: {
    setIsClal: (state, action) => {
      state.isClal = action.payload;
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
      // state.phone = payload.phone
      state.imageURL = payload.imageURL
      state.isWhiteLabel = payload.isWhiteLabel
      state.companyName = payload.companyName || payload.basename
      state.cameFromSubAccount = payload.cameFromSubAccount
      state.isAdmin = payload.isAdmin
      state.isAllowSwitchAccount = payload.isAllowSwitchAccount
      state.billingTypeId = payload.billingTypeId
      state.isDebtAccount = (payload.isDebtAccount === true || payload.isDebtAccount === 'True')
      state.subUserPermissions = payload?.unique_name
      state.isSuperUser = isSuperUserSelector(payload?.unique_name)
    }
  }
})

export const { setLanguage, setWindowSize, setCoreData, setRowsPerPage, setIsClal } = coreSlice.actions // setSmsOldVersion

export default coreSlice.reducer