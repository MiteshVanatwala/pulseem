import {createSlice,createAsyncThunk} from '@reduxjs/toolkit';
import instence from '../../helpers/api'

export const getEmailReport=createAsyncThunk(
  'report/GetEmailDirectReport',async (data,thunkAPI) => {
    try {
      const response=await instence.post(`report/GetEmailDirectReport`, data);
      return JSON.parse(response.data)
    } catch(error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  })

export const getSMSReport=createAsyncThunk(
  'report/GetSmsDirectReport',async (data,thunkAPI) => {
    try {
      const response=await instence.post(`report/GetSmsDirectReport`, data);
      console.log(`reportsSlice.getSMSReport(): response`, response)
      return JSON.parse(response.data)
    } catch(error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  })

export const exportEmailReport=createAsyncThunk(
  'report/ExportEmailDirectReport',async (_,thunkAPI) => {
    try {
      const response=await instence.post(`report/ExportEmailDirectReport`);
      return JSON.parse(response.data)
    } catch(error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  })

export const exportSMSReport=createAsyncThunk(
  'report/ExportSMSDirectReport',async (_,thunkAPI) => {
    try {
      const response=await instence.post(`report/ExportSMSDirectReport`);
      return JSON.parse(response.data)
    } catch(error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  })

export const reportsSlice=createSlice({
  name: 'reports',
  initialState: {
    directEmailReport: {},
    directEmailReportError: '',
    directSmsReport: {},
    directSmsReportError: '',
  },
  reducers: {},
  extraReducers: builder => {
    builder
    .addCase(getEmailReport.fulfilled, (state, { payload }) => {
      state.directEmailReport = payload
    })
    .addCase(getSMSReport.fulfilled, (state, { payload }) => {
      state.directSmsReport = payload
      console.log(`getSmsReport.fulfilled(): payload`, payload)
    })
    .addCase(getEmailReport.rejected, (state, action) => {
      state.directEmailReportError = action.error
    })
    .addCase(getSMSReport.rejected, (state, action) => {
      state.directSmsReportError = action.error
    })
  }
})



export default reportsSlice.reducer