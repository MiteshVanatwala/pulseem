import {createSlice} from '@reduxjs/toolkit';
//import {getStyle} from '../../style/classes/appBarStyles'
const rtlLanguages=['he','ar']

export const coreSlice=createSlice({
  name: 'core',
  initialState: {
    language: 'he',
    isRTL: true,
    windowSize: 'lg',
    basename: '',
    email: '',
    phone: '',
    imageURL: '',
    isWhiteLabel: false
  },
  reducers: {
    setLanguage: (state,action) => {
      state.language=action.payload
      state.isRTL=rtlLanguages.includes(action.payload)
    },
    setWindowSize: (state,action) => {
      state.windowSize=action.payload
    },
    setCoreData: (state,{payload}) => {
      state.basename=payload.basename
      state.email=payload.email
      state.phone=payload.phone
      state.imageURL=payload.imageURL
      state.isWhiteLabel=payload.isWhiteLabel
      const language=payload.locality.split('-')[0]
      state.language=language
      state.isRTL=rtlLanguages.includes(language)
    }
  }
})

export const {setLanguage,setWindowSize,setCoreData}=coreSlice.actions

export default coreSlice.reducer