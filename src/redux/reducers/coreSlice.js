import {createSlice} from '@reduxjs/toolkit';
//import {getStyle} from '../../style/classes/appBarStyles'
const rtlLanguages=['he','ar']

export const coreSlice=createSlice({
  name: 'core',
  initialState: {
    language: 'en',
    isRTL: false,
    windowSize: 'lg',
  },
  reducers: {
    setLanguage: (state,action) => {
      state.language=action.payload
      state.isRTL=rtlLanguages.includes(action.payload)
    },
    setWindowSize: (state,action) => {
      state.windowSize=action.payload
    }
  }
})

export const {setLanguage,setWindowSize}=coreSlice.actions

export default coreSlice.reducer