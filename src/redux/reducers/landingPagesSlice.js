import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';
import { apiURL } from '../../config/index';
import { ExportFile } from '../../helpers/Export/ExportFile';

export const getLandingPagesData = createAsyncThunk(
  'landingpages/getLandingPages', async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`landingpages/getLandingPages`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const restoreLandingPages = createAsyncThunk(
  'landingpages/restoreLandingPages', async (deletedLandingPages, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.put(`landingpages/restoreLandingPages`, deletedLandingPages);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const deleteLandingPage = createAsyncThunk(
  'landingpages/deleteLandingPage', async (id, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.delete(`landingpages/deleteLandingPage/${id}`);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const duplicteLandingPage = createAsyncThunk(
  'landingpages/cloneLandingPage', async (id, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.put(`landingpages/cloneLandingPage/${id}`);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const downloadReport = createAsyncThunk(
  'report/ExportPurchase/', async ({ ID, Name }, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`${apiURL}/report/ExportPurchase/${ID}`);
      const exportOptions = {
        data: JSON.parse(response.data),
        fileName: 'purchaseReport',
        exportType: 'xls'
      }
      ExportFile(exportOptions);
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const exportSurvey = createAsyncThunk(
  'report/ExportSurvey/', async ({ ID, Name }, thunkAPI) => {
    try {

      const response = await PulseemReactInstance.get(`${apiURL}/report/ExportSurvey/${ID}`);

      const exportOptions = {
        data: JSON.parse(response.data),
        fileName: 'surveyReport',
        exportType: 'xls'
      }
      ExportFile(exportOptions);

    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const saveLandingPage = createAsyncThunk(
  'landingpages/save',
  async (data, thunkAPI) => {
    try {
      // const response = await PulseemReactInstance.post(`landingpages/save`, data);
      // return response.data
      return {};
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const getLPBeeToken = createAsyncThunk(
  '/CampaignEditor/GetBeeLPToken/',
  async (_, thunkAPI) => {
    try {
        const response = await PulseemReactInstance.get(`/CampaignEditor/GetBeeLPToken`);
        return JSON.parse(response.data)
    } catch (error) {
        return thunkAPI.rejectWithValue({ error: error.message });
    }
});

export const landingPagesSlice = createSlice({
  name: 'newsletter',
  initialState: {
    LPBeeToken: null,
    landingPagesData: [],
    landingPagesDeletedData: [],
    landingPagesDataError: ''
  },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getLandingPagesData.fulfilled, (state, { payload }) => {
      state.landingPagesData = payload.filter(row => !row.IsDeleted)
      state.landingPagesDeletedData = payload.filter(row => row.IsDeleted)
    })
    builder.addCase(getLandingPagesData.rejected, (state, action) => {
      state.landingPagesDataError = action.error.message
    })
    builder.addCase(getLPBeeToken.fulfilled, (state, { payload }) => {
      state.LPBeeToken = payload;
    })
    builder.addCase(downloadReport.fulfilled, () => console.log('api downloadReport success'))
    builder.addCase(duplicteLandingPage.fulfilled, () => console.log('api duplicteLandingPage success'))
    builder.addCase(deleteLandingPage.fulfilled, () => console.log('api deleteLandingPage success'))
    builder.addCase(restoreLandingPages.fulfilled, () => console.log('api restoreLandingPages success'))

    builder.addCase(downloadReport.rejected, (_, action) => console.log('Error - api downloadReport: ' + action.error))
    builder.addCase(duplicteLandingPage.rejected, (_, action) => console.log('Error - api duplicteLandingPage: ' + action.error))
    builder.addCase(deleteLandingPage.rejected, (_, action) => console.log('Error - api deleteLandingPage: ' + action.error))
    builder.addCase(restoreLandingPages.rejected, (_, action) => console.log('Error - api restoreLandingPages: ' + action.error))
  }
})



export default landingPagesSlice.reducer