import {createSlice} from '@reduxjs/toolkit';
const rtlLanguages=['he','ar']

export const coreSlice=createSlice({
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
    rowsPerPage: 6,
    isClal: false,
    accountFeatures: null,
    cameFromSubAccount: null,
    isAdmin: null,
    isAllowSwitchAccount: null,
    billingTypeId: null,
    smsOldVersion: false
  },
  reducers: {
    setIsClal: (state, action) => {
      state.isClal = action.payload;
    },
    setAccountFeatures: (state, action) => {
      state.accountFeatures = action.payload;
    },
    setLanguage: (state,action) => {
      state.language=action.payload
      state.isRTL=rtlLanguages.includes(action.payload)
    },
    setWindowSize: (state,action) => {
      state.windowSize=action.payload
    },
    setRowsPerPage: (state,action) => {
      state.rowsPerPage=action.payload
    },
    setCoreData: (state,{payload}) => {
      state.basename=payload.basename
      state.email=payload.email
      state.phone=payload.phone
      state.imageURL=payload.imageURL
      state.isWhiteLabel=payload.isWhiteLabel
      state.companyName=payload.companyName || payload.basename
      state.cameFromSubAccount=payload.cameFromSubAccount
      state.isAdmin=payload.isAdmin
      state.isAllowSwitchAccount=payload.isAllowSwitchAccount
      state.billingTypeId=payload.billingTypeId
    },
    setSmsOldVersion: (state, action) => {
      state.smsOldVersion = action.payload
    }
  }
})

export const {setLanguage,setWindowSize,setCoreData,setRowsPerPage,setIsClal,setAccountFeatures,setSmsOldVersion}=coreSlice.actions

export default coreSlice.reducer