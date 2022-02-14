import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { instence } from '../../helpers/api'

const STATIC_DATA = JSON.parse("[{\"MmsCampaignID\":836,\"Status\":2,\"Name\":\"mmsTest-copy-01\",\"UpdateDate\":\"2020-09-07T09:40:37.673\",\"SendDate\":\"2020-09-07T09:41:00.54\",\"TotalSendPlan\":1,\"CreditsPerMms\":1,\"TotalSent\":1,\"Success\":0,\"Failure\":0,\"Removed\":0,\"FutureSends\":0,\"TotalCredits\":1},{\"MmsCampaignID\":828,\"Status\":4,\"Name\":\"בבבבבבבבב בבבבבבבבבבבבבבבבב-copy-11\",\"UpdateDate\":\"2019-01-10T09:09:06.26\",\"SendDate\":\"2019-01-10T12:00:33.62\",\"TotalSendPlan\":5,\"CreditsPerMms\":2,\"TotalSent\":5,\"Success\":5,\"Failure\":0,\"Removed\":0,\"FutureSends\":0,\"TotalCredits\":10},{\"MmsCampaignID\":827,\"Status\":4,\"Name\":\"בבבבבבבבב בבבבבבבבבבבבבבבבב-copy-10\",\"UpdateDate\":\"2019-01-09T11:03:04.64\",\"SendDate\":\"2019-01-09T11:03:21.83\",\"TotalSendPlan\":2,\"CreditsPerMms\":1,\"TotalSent\":2,\"Success\":2,\"Failure\":0,\"Removed\":0,\"FutureSends\":0,\"TotalCredits\":2},{\"MmsCampaignID\":826,\"Status\":2,\"Name\":\"בבבבבבבבב בבבבבבבבבבבבבבבבב-copy-09\",\"UpdateDate\":\"2019-01-09T11:02:23.657\",\"SendDate\":\"2019-01-09T11:02:37.167\",\"TotalSendPlan\":0,\"CreditsPerMms\":1,\"TotalSent\":0,\"Success\":0,\"Failure\":0,\"Removed\":0,\"FutureSends\":0,\"TotalCredits\":0},{\"MmsCampaignID\":825,\"Status\":4,\"Name\":\"בבבבבבבבב בבבבבבבבבבבבבבבבב-copy-08\",\"UpdateDate\":\"2019-01-09T09:55:18.82\",\"SendDate\":\"2019-01-09T09:55:36.573\",\"TotalSendPlan\":2,\"CreditsPerMms\":1,\"TotalSent\":2,\"Success\":0,\"Failure\":0,\"Removed\":0,\"FutureSends\":0,\"TotalCredits\":2},{\"MmsCampaignID\":824,\"Status\":4,\"Name\":\"בבבבבבבבב בבבבבבבבבבבבבבבבב-copy-07\",\"UpdateDate\":\"2019-01-08T10:57:55.303\",\"SendDate\":\"2019-01-08T10:58:09.063\",\"TotalSendPlan\":2,\"CreditsPerMms\":1,\"TotalSent\":2,\"Success\":0,\"Failure\":2,\"Removed\":0,\"FutureSends\":0,\"TotalCredits\":2},{\"MmsCampaignID\":823,\"Status\":4,\"Name\":\"בבבבבבבבב בבבבבבבבבבבבבבבבב-copy-06\",\"UpdateDate\":\"2019-01-08T10:55:28.727\",\"SendDate\":\"2019-01-08T10:55:44.31\",\"TotalSendPlan\":2,\"CreditsPerMms\":1,\"TotalSent\":2,\"Success\":0,\"Failure\":2,\"Removed\":0,\"FutureSends\":0,\"TotalCredits\":2},{\"MmsCampaignID\":815,\"Status\":4,\"Name\":\"בבבבבבבבב בבבבבבבבבבבבבבבבב-copy-05\",\"UpdateDate\":\"2019-01-08T10:20:10.617\",\"SendDate\":\"2019-01-08T10:21:48.96\",\"TotalSendPlan\":4,\"CreditsPerMms\":1,\"TotalSent\":4,\"Success\":0,\"Failure\":0,\"Removed\":0,\"FutureSends\":0,\"TotalCredits\":4},{\"MmsCampaignID\":814,\"Status\":4,\"Name\":\"בבבבבבבבב בבבבבבבבבבבבבבבבב-copy-04\",\"UpdateDate\":\"2018-10-22T10:23:57.507\",\"SendDate\":\"2018-10-22T10:24:09.893\",\"TotalSendPlan\":2,\"CreditsPerMms\":1,\"TotalSent\":2,\"Success\":2,\"Failure\":0,\"Removed\":0,\"FutureSends\":0,\"TotalCredits\":2},{\"MmsCampaignID\":813,\"Status\":4,\"Name\":\"בבבבבבבבב בבבבבבבבבבבבבבבבב-copy-03\",\"UpdateDate\":\"2018-10-21T14:17:47.53\",\"SendDate\":\"2018-10-21T14:25:35.483\",\"TotalSendPlan\":1,\"CreditsPerMms\":1,\"TotalSent\":1,\"Success\":1,\"Failure\":0,\"Removed\":0,\"FutureSends\":0,\"TotalCredits\":1},{\"MmsCampaignID\":806,\"Status\":4,\"Name\":\"בבבבבבבבב בבבבבבבבבבבבבבבבב-copy-02\",\"UpdateDate\":\"2018-10-18T14:22:28.227\",\"SendDate\":\"2018-10-18T14:22:47.557\",\"TotalSendPlan\":1,\"CreditsPerMms\":1,\"TotalSent\":1,\"Success\":1,\"Failure\":0,\"Removed\":0,\"FutureSends\":0,\"TotalCredits\":1},{\"MmsCampaignID\":735,\"Status\":4,\"Name\":\"בבבבבבבבב בבבבבבבבבבבבבבבבב\",\"UpdateDate\":\"2018-10-18T14:17:53.98\",\"SendDate\":\"2018-10-18T14:18:20.86\",\"TotalSendPlan\":1,\"CreditsPerMms\":1,\"TotalSent\":1,\"Success\":1,\"Failure\":0,\"Removed\":0,\"FutureSends\":0,\"TotalCredits\":1},{\"MmsCampaignID\":803,\"Status\":2,\"Name\":\"Rahul's MMS Campaign\",\"UpdateDate\":\"2018-10-16T14:58:25.653\",\"SendDate\":\"2018-10-16T15:02:22.413\",\"TotalSendPlan\":0,\"CreditsPerMms\":1,\"TotalSent\":0,\"Success\":0,\"Failure\":0,\"Removed\":0,\"FutureSends\":0,\"TotalCredits\":0},{\"MmsCampaignID\":680,\"Status\":4,\"Name\":\"Copy of Copy of Copy of 5465\",\"UpdateDate\":\"2018-05-30T08:45:42.13\",\"SendDate\":\"2018-05-30T08:46:06.7\",\"TotalSendPlan\":2,\"CreditsPerMms\":1,\"TotalSent\":2,\"Success\":2,\"Failure\":0,\"Removed\":0,\"FutureSends\":0,\"TotalCredits\":2},{\"MmsCampaignID\":679,\"Status\":4,\"Name\":\"Copy of Copy of 5465\",\"UpdateDate\":\"2018-05-29T18:33:54.02\",\"SendDate\":\"2018-05-29T18:34:13.147\",\"TotalSendPlan\":1,\"CreditsPerMms\":1,\"TotalSent\":1,\"Success\":0,\"Failure\":1,\"Removed\":0,\"FutureSends\":0,\"TotalCredits\":1},{\"MmsCampaignID\":637,\"Status\":4,\"Name\":\"Copy of 5465\",\"UpdateDate\":\"2018-03-01T13:18:23.7\",\"SendDate\":\"2018-05-29T17:19:58.963\",\"TotalSendPlan\":3,\"CreditsPerMms\":1,\"TotalSent\":3,\"Success\":0,\"Failure\":3,\"Removed\":0,\"FutureSends\":0,\"TotalCredits\":3},{\"MmsCampaignID\":407,\"Status\":4,\"Name\":\"5465\",\"UpdateDate\":\"2018-02-04T15:52:06.823\",\"SendDate\":\"2018-03-01T13:12:57.267\",\"TotalSendPlan\":7,\"CreditsPerMms\":1,\"TotalSent\":5,\"Success\":1,\"Failure\":4,\"Removed\":0,\"FutureSends\":0,\"TotalCredits\":5}]")

export const getMmsData = createAsyncThunk(
  'mms/getMmsCampaigns', async (_, thunkAPI) => {
    try {
      const response = await instence.get(`mms/getMmsCampaigns`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const getMMSByID = createAsyncThunk(
  'mms/GetPreview/', async (id, thunkAPI) => {
    try {
      const response = await instence.get(`mms/GetPreview/${id}`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const restoreMms = createAsyncThunk(
  'mms/restoreMmsCampaigns', async (deletedMms, thunkAPI) => {
    try {
      const response = await instence.put(`mms/restoreMmsCampaigns`, deletedMms);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const deleteMms = createAsyncThunk(
  'mms/deleteMmsCampaigns', async (id, thunkAPI) => {
    try {
      const response = await instence.delete(`mms/deleteMmsCampaigns/${id}`);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const duplicteMms = createAsyncThunk(
  'mms/cloneMmsCampaign', async (id, thunkAPI) => {
    try {
      const response = await instence.put(`mms/cloneMmsCampaign/${id}`);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const getMmsReport = createAsyncThunk(
  'reports/MmsReport', async (query, thunkAPI) => {
    try {
      const response = await instence.get(`report/MMSReport/?includeTestCampaign=${query}`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const getMmsGraph = createAsyncThunk(
  'reports/MmsReportGraph', async (_, thunkAPI) => {
    try {
      const response = await instence.get(`reports/MmsReportGraph`);
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
    mmsGraph: [],
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
    builder.addCase(getMmsReport.rejected, (state, action) => ({ ...state, mmsReport: [...STATIC_DATA] }))
    builder.addCase(getMmsGraph.rejected, (state, action) => {
      state.mmsReportError = "No Data Found";
    })
  }
})



export default mmsSlice.reducer