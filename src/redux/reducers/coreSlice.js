import { createSlice } from '@reduxjs/toolkit';
import { setCookie, getCookie } from '../../helpers/Functions/cookies'
import { eSubUserPermissions, UserRoles } from '../../Models/SubUser/SubUsers';
const rtlLanguages = ['he', 'ar']

export const isSuperUserSelector = (permissions) => {
  if (permissions.indexOf(-1) > -1) return true;
  const adminPermissions = [1, 2, 3];
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
    userRoles: UserRoles?.Admin,
    subUserPermissions: [],
    CoreToastMessages: {
      XSS_ERROR: { severity: 'error', color: 'error', message: 'common.xssError', showAnimtionCheck: false }
    },
    isLoader: false,
    subUserName: '',
    subUserObject: {
      Data: {
        UserName: '',
        Emails: [
          {
            Id: 0,
            TwoFactorAuthTypeID: 1,
            AuthValue: "",
            CreatedDate: "0001-01-01T00:00:00",
            IsDeleted: false,
            AddToFromValues: false
          }
        ],
        Cellphones: [
          {
            Id: 0,
            TwoFactorAuthTypeID: 2,
            AuthValue: "",
            CreatedDate: "0001-01-01T00:00:00",
            IsDeleted: false,
            AddToFromValues: false
          }
        ]
      }
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

      const userToken = payload?.unique_name ? JSON.parse(payload?.unique_name) : -1;

      const isSuperUser = isSuperUserSelector(userToken?.UserPermissions);
      const isReadOnly = userToken?.UserPermissions?.indexOf(4) > -1;
      state.subUserName = userToken?.Name;
      state.subUserObject.Data.UserName = userToken?.Name;
      state.subUserObject.Data.Emails[0].AuthValue = userToken?.Email;
      state.subUserObject.Data.Cellphones[0].AuthValue = userToken?.Cellphone;

      if (isSuperUser) {
        state.userRoles = UserRoles.Admin;
      }
      else if (isReadOnly) {
        state.userRoles = UserRoles.ReadOnly;
      }
      else {
        const roles = {
          ...UserRoles,
          Restricted: {
            AllowSend: userToken.UserPermissions.indexOf(eSubUserPermissions.AllowSend) > -1,
            AllowExport: userToken.UserPermissions.indexOf(eSubUserPermissions.AllowExport) > -1,
            AllowDelete: userToken.UserPermissions.indexOf(eSubUserPermissions.AllowDelete) > -1
          }
        }
        state.userRoles = roles.Restricted;
      }
    },
    setIsLoader: (state, { payload }) => {
      state.isLoader = payload
    }
  }
})

export const selectUserObject = (state) => state.core.subUserObject;
export const { setLanguage, setWindowSize, setCoreData, setRowsPerPage, setIsClal, setIsLoader } = coreSlice.actions // setSmsOldVersion

export default coreSlice.reducer