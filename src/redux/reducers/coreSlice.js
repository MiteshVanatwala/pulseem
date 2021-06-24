import {createSlice} from '@reduxjs/toolkit';
//import {getStyle} from '../../style/classes/appBarStyles'
const rtlLanguages=['he','ar']

export const coreSlice=createSlice({
  name: 'core',
  initialState: {
    language: 'en',
    isRTL: false,
    windowSize: 'lg',
    basename: '',
    email: '',
    phone: '',
    imageURL: '',
    isWhiteLabel: false,
    companyName: '',
    rowsPerPage: 6
  },
  reducers: {
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
      state.companyName=payload.companyName
    }
  }
})

export const {setLanguage,setWindowSize,setCoreData,setRowsPerPage}=coreSlice.actions

export default coreSlice.reducer