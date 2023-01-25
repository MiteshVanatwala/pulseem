import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';

export const getPackagesDetails = createAsyncThunk(
  'dashboard/GetPackagesDetails', async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`dashboard/GetPackagesDetails`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const getLastCampaignReport = createAsyncThunk(
  'dashboard/GetLastCampaignReport', async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`dashboard/GetLastCampaignReport`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const getTips = createAsyncThunk(
  'dashboard/GetTips', async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`dashboard/GetTips`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const deleteShortcuts = createAsyncThunk(
  'dashboard/DeleteShortcut', async (id, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.delete(`dashboard/DeleteShortcut/${id}`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const getPurchaseLog = createAsyncThunk(
  'dashboard/GetPurchaseLog', async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`dashboard/GetPurchaseLog`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });



export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    lastCampaignReport: null,
    packagesDetails: [],
    accountAvailablePackages: [],
    tips: [],
    lastCampaignReportError: '',
    packagesDetailsError: '',
    tipsError: '',
    shortcutsError: ''
  },
  extraReducers: builder => {
    builder
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
    // .addCase(getPurchaseLog.fulfilled, (state, { payload }) => {
    //   state.purchaseLogs = payload;
    // })
    // .addCase(getPurchaseLog.rejected, (state, action) => {
    //   state.purchaseLogs = action.error.message
    // })

  }
})


export default dashboardSlice.reducer