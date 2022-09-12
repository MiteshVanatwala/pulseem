import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReact';
import { exportFile } from '../../helpers/exportFromJson';

export const getNewslatterData = createAsyncThunk(
  'email/getEmailCampaigns', async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`email/getEmailCampaigns`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
)

export const getNewsletterReports = createAsyncThunk(
  'reports/EmailReports/', async (demo = false, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`reports/EmailReports?includeTestCampaign=${demo}`)
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
)

export const getNewsletterDirectReport = createAsyncThunk(
  'directReport/GetEmailDirectReport', async (data, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`directReport/GetEmailDirectReport`, data);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
)

export const getArchiveDirectReport = createAsyncThunk(
  'directReport/GetArchiveEmailDirectReport', async (data, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`directReport/GetArchiveEmailDirectReport`, data);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
)

export const exportNewsletterDirectReport = createAsyncThunk(
  'directReport/ExportEmailDirectReport', async (data, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`directReport/ExportEmailDirectReport`, data);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
)

export const exportArchiveEmailDirectReport = createAsyncThunk(
  'directReport/ExportArchiveEmailDirectReport', async (data, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`directReport/ExportArchiveEmailDirectReport`, data);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
)

export const getNewsletterReportsByIds = createAsyncThunk(
  'email/EmailReportsByIds', async (id, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`email/EmailReportsByIds`, [{ ID: id }])
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
)

export const restoreCampaigns = createAsyncThunk(
  'email/restoreEmailCampaigns', async (deletedCampaigns, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.put(`email/restoreEmailCampaigns`, deletedCampaigns);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
)

export const deleteCampaign = createAsyncThunk(
  'email/deleteEmailCampaign/', async (id, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.delete(`email/deleteEmailCampaign/${id}`);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const duplicteCampaign = createAsyncThunk(
  'email/cloneCampaign', async (id, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.put(`email/cloneCampaign/${id}`);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const downloadNewsletterReport = createAsyncThunk(
  'email/EmailReportsByIds', async (array = [], thunkAPI) => {
    try {
      var json = [];
      for (var i = 0; i <= array.length; i++) {
        if (array[i]) {
          json.push({ ID: array[i] });
        }
      }

      const response = await PulseemReactInstance.post('email/EmailReportsByIds/', json);

      exportFile({
        data: JSON.parse(response.data),
        fileName: 'emailReport',
        exportType: 'xls'
      });

    } catch (err) {
      return thunkAPI.rejectWithValue({ error: err.message });
    }
  }
)
export const getArchiveCampaigns = createAsyncThunk(
  'email/GetArchiveCampaigns', async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`email/GetArchiveCampaigns`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })
export const cloneArchiveCampaign = createAsyncThunk(
  'email/CloneArchiveCampaign', async (campaignId, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.put(`email/CloneArchiveCampaign/${campaignId}`);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const newsletterSlice = createSlice({
  name: 'newsletter',
  initialState: {
    newslettersData: [],
    newslettersDeletedData: [],
    newslettersDataError: '',
    newslettersReports: [],
    newslettersReportsError: '',
    directNewsletterReport: {},
    directNewsletterReportError: '',
    newsletterArchiveData: []
    //archiveDirectNewsletterReport: []
  },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getNewslatterData.fulfilled, (state, { payload }) => {
      state.newslettersData = payload.filter(row => !row.IsDeleted)
      state.newslettersDeletedData = payload.filter(row => row.IsDeleted)
    })
    builder.addCase(getNewslatterData.rejected, (state, action) => {
      state.newslettersDataError = action.error.message
    })
    builder.addCase(getNewsletterReports.fulfilled, (state, { payload }) => {
      state.newslettersReports = payload
    })
    builder.addCase(getNewsletterReports.rejected, (state, action) => {
      state.newslettersReportsError = action.error.message
    })
    builder.addCase(getArchiveCampaigns.fulfilled, (state, { payload }) => {
      state.newsletterArchiveData = payload
    })
    builder.addCase(getArchiveCampaigns.rejected, (state, action) => {
      state.newsletterArchiveData = action.error.message
    })
    builder.addCase(getNewsletterDirectReport.fulfilled, (state, { payload }) => {
      state.directNewsletterReport = payload
    })
    builder.addCase(getNewsletterDirectReport.rejected, (state, action) => {
      state.directNewsletterReportError = action.error.message
    })
    builder.addCase(getArchiveDirectReport.fulfilled, (state, { payload }) => {
      //state.archiveDirectNewsletterReport = payload
      state.directNewsletterReport = payload;
    })
    builder.addCase(getArchiveDirectReport.rejected, (state, action) => {
      //state.archiveDirectNewsletterReportError = action.error.message
      state.directNewsletterReportError = action.error.message
    })


    builder.addCase(restoreCampaigns.fulfilled, () => { console.log('api restoreCampaigns success') })
    builder.addCase(deleteCampaign.fulfilled, () => { console.log('api deleteCampaign success') })
    builder.addCase(duplicteCampaign.fulfilled, () => { console.log('api duplicteCampaign success') })
    builder.addCase(downloadNewsletterReport.fulfilled, () => { console.log('api downloadNewsletterReport success') })

    builder.addCase(restoreCampaigns.rejected, (_, action) => { console.log('Error - api restoreCampaigns: ' + action.error) })
    builder.addCase(deleteCampaign.rejected, (_, action) => { console.log('Error - deleteCampaign: ' + action.error) })
    builder.addCase(duplicteCampaign.rejected, (_, action) => { console.log('Error - duplicteCampaign: ' + action.error) })
    builder.addCase(downloadNewsletterReport.rejected, (_, action) => { console.log('Error - downloadNewsletterReport', action.error) })
  }
})



export default newsletterSlice.reducer