import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const reportSlice = createSlice({
  name: 'report',
  initialState: {
    showContent: false
  },
  reducers: {
    setShowContent: (state, action) => {
      state.showContent = action.payload;
    }
  }
})

export const { setShowContent } = reportSlice.actions

export default reportSlice.reducer