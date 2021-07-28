import {createSlice,createAsyncThunk} from '@reduxjs/toolkit';
import instence from '../../helpers/api';

export const getRecipientsReport=createAsyncThunk(
  'dashboard/GetRecipientsReport',async (_,thunkAPI) => {
  try {
    const response=await instence.get(`dashboard/GetRecipientsReport`);
    return JSON.parse(response.data)
  } catch(error) {
    return thunkAPI.rejectWithValue({error: error.message});
  }
});

export const getPackagesDetails=createAsyncThunk(
  'dashboard/GetPackagesDetails',async (_,thunkAPI) => {
  try {
    const response=await instence.get(`dashboard/GetPackagesDetails`);
    return JSON.parse(response.data)
  } catch(error) {
    return thunkAPI.rejectWithValue({error: error.message});
  }
});

export const getLastCampaignReport=createAsyncThunk(
  'dashboard/GetLastCampaignReport',async (_,thunkAPI) => {
  try {
    const response=await instence.get(`dashboard/GetLastCampaignReport`);
    return JSON.parse(response.data)
  } catch(error) {
    return thunkAPI.rejectWithValue({error: error.message});
  }
});

export const getTips=createAsyncThunk(
  'dashboard/GetTips',async (_,thunkAPI) => {
  try {
    const response=await instence.get(`dashboard/GetTips`);
    return JSON.parse(response.data)
  } catch(error) {
    return thunkAPI.rejectWithValue({error: error.message});
  }
});

export const getShortcuts=createAsyncThunk(
  'dashboard/GetShortcuts',async (_,thunkAPI) => {
  try {
    const response=await instence.get(`dashboard/GetShortcuts`);
    return JSON.parse(response.data)
  } catch(error) {
    return thunkAPI.rejectWithValue({error: error.message});
  }
});

export const setShortcuts=createAsyncThunk(
  'dashboard/SetShortcut',async (data,thunkAPI) => {
  try {
    const response=await instence.post(`dashboard/SetShortcut`, data);
    return JSON.parse(response.data)
  } catch(error) {
    return thunkAPI.rejectWithValue({error: error.message});
  }
});

export const deleteShortcuts=createAsyncThunk(
  'dashboard/DeleteShortcut',async (id,thunkAPI) => {
  try {
    const response=await instence.delete(`dashboard/DeleteShortcut/${id}`);
    return JSON.parse(response.data)
  } catch(error) {
    return thunkAPI.rejectWithValue({error: error.message});
  }
});

export const buySmsPackage=createAsyncThunk(
  'dashboard/BuyPackage',async (data,thunkAPI) => {
  try {
    const response=await instence.post(`dashboard/BuyPackage`, data);
    return JSON.parse(response.data)
  } catch(error) {
    return thunkAPI.rejectWithValue({error: error.message});
  }
});


export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    recipientsReport: [],
    lastCampaignReport: [],
    packagesDetails: [],
    accountAvailablePackages: [],
    tips: [],
    shortcuts: [],
    recipientsReportError: '',
    lastCampaignReportError: '',
    packagesDetailsError: '',
    tipsError: '',
    shortcutsError: ''
  },
  extraReducers: builder => {
    builder
      .addCase(getRecipientsReport.fulfilled, (state, { payload }) => {
        state.recipientsReport = payload
      })
      .addCase(getRecipientsReport.rejected, (state, action) => {
        state.recipientsReportError = action.error.message
      })
      .addCase(getLastCampaignReport.fulfilled, (state, { payload }) => {
        state.lastCampaignReport = payload
      })
      .addCase(getLastCampaignReport.rejected, (state, action) => {
        state.lastCampaignReportError = action.error.message
      })
      .addCase(getPackagesDetails.fulfilled, (state, { payload }) => {
        state.packagesDetails = payload.PackageDetails;
        state.accountAvailablePackages = payload.AccountAvailablePackages;
      })
      .addCase(getPackagesDetails.rejected, (state, action) => {
        state.packagesDetailsError = action.error.message
      })
      .addCase(getTips.fulfilled, (state, { payload }) => {
        state.tips = payload;
      })
      .addCase(getTips.rejected, (state, action) => {
        state.tipsError = action.error.message
      })
      .addCase(getShortcuts.fulfilled, (state, { payload }) => {
        state.shortcuts = payload;
      })
      .addCase(getShortcuts.rejected, (state, action) => {
        state.shortcutsError = action.error.message
      })
  }
})


export default dashboardSlice.reducer