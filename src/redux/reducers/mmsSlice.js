import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';

export const getMmsData = createAsyncThunk(
  'mms/getMmsCampaigns', async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`mms/getMmsCampaigns`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const getMMSByID = createAsyncThunk(
  'mms/GetPreview/', async (id, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`mms/GetPreview/${id}`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const restoreMms = createAsyncThunk(
  'mms/restoreMmsCampaigns', async (deletedMms, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.put(`mms/restoreMmsCampaigns`, deletedMms);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const deleteMms = createAsyncThunk(
  'mms/deleteMmsCampaigns', async (id, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.delete(`mms/deleteMmsCampaigns/${id}`);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const duplicteMms = createAsyncThunk(
  'mms/cloneMmsCampaign', async (id, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.put(`mms/cloneMmsCampaign/${id}`);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const getMmsReport = createAsyncThunk(
  'reports/MmsReport', async (query, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`report/MMSReport/?includeTestCampaign=${query}`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const getMmsGraph = createAsyncThunk(
  'reports/MmsReportGraph', async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`reports/MmsReportGraph`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const mmsSlice = createSlice({
  name: 'mms',
  initialState: {
    mmsData: [],
    mmsDeletedData: [],
    mmsDataError: '',
    mmsReport: [],
    mmsGraph: null,
    mmsReportError: ''
  },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getMmsData.fulfilled, (state, { payload }) => {
      state.mmsData = payload.filter(row => !row.IsDeleted)
      state.mmsDeletedData = payload.filter(row => row.IsDeleted)
    })
    builder.addCase(getMmsReport.fulfilled, (state, { payload }) => {
      state.mmsReport = payload;
    })
    builder.addCase(getMmsGraph.fulfilled, (state, { payload }) => {
      state.mmsGraph = payload;
    })
    builder.addCase(getMmsData.rejected, (state, action) => {
      state.mmsDataError = action.error.message
    })
    builder.addCase(duplicteMms.fulfilled, () => console.log('api duplicteMms success'))
    builder.addCase(deleteMms.fulfilled, () => console.log('api deleteMms success'))
    builder.addCase(restoreMms.fulfilled, () => console.log('api restoreMms success'))
    builder.addCase(duplicteMms.rejected, (_, action) => console.log('Error - api duplicteMms: ' + action.error))
    builder.addCase(deleteMms.rejected, (_, action) => console.log('Error - api deleteMms: ' + action.error))
    builder.addCase(restoreMms.rejected, (_, action) => console.log('Error - api restoreMms: ' + action.error))
    builder.addCase(getMmsReport.rejected, (state, action) => ({ ...state, mmsReport: null }))
    builder.addCase(getMmsGraph.rejected, (state, action) => {
      state.mmsReportError = "No Data Found";
    })
  }
})



export default mmsSlice.reducer