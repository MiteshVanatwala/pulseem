import { createSlice } from '@reduxjs/toolkit';
import { setCookie, getCookie } from '../../helpers/Functions/cookies'
import { eSubUserPermissions, UserRoles } from '../../Models/SubUser/SubUsers';
const rtlLanguages = ['he', 'ar']

export const isSuperUserSelector = (permissions) => {
  const adminPermissions = [1, 2, 3, 4];
  return adminPermissions?.every(permission =>
    permissions?.indexOf(permission) > -1
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
    userRoles: UserRoles.Admin,
    subUserPermissions: [],
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

      const userPermissions = payload?.unique_name;
      const isAdmin = userPermissions === 'idopulseem4444' || userPermissions === '' || isSuperUserSelector(userPermissions);
      const isReadOnly = userPermissions?.indexOf(5) > -1;

      if (isAdmin) {
        state.userRoles = UserRoles.Admin;
      }
      else if (isReadOnly) {
        state.userRoles = UserRoles.ReadOnly;
      }
      else {
        UserRoles.Restricted.AllowSend = userPermissions.indexOf(eSubUserPermissions.AllowSend) > -1
        UserRoles.Restricted.AllowExport = userPermissions.indexOf(eSubUserPermissions.AllowExport) > -1
        UserRoles.Restricted.AllowDelete = userPermissions.indexOf(eSubUserPermissions.AllowDelete) > -1
        UserRoles.Restricted.AllowSubUsers = userPermissions.indexOf(eSubUserPermissions.AllowSubUsers) > -1

        state.userRoles = UserRoles.Restricted;
      }
    }
  }
})

export const { setLanguage, setWindowSize, setCoreData, setRowsPerPage, setIsClal } = coreSlice.actions // setSmsOldVersion

export default coreSlice.reducer