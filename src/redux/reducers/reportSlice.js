import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';

export const GetProductReports = createAsyncThunk(
  'ProductReport/Get', async (data, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`ProductReport/Get`, data);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });
export const GetExporPRData = createAsyncThunk(
  'ProductReport/GetExportData', async (data, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`ProductReport/Get`, data);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });
export const reportSlice = createSlice({
  name: 'report',
  initialState: {
    showContent: false,
    productsReportDetails: [],
    productCategories: [],
    exportPRData: []
  },
  reducers: {
    setShowContent: (state, action) => {
      state.showContent = action.payload;
    }
  },
  extraReducers: builder => {
    builder.addCase(GetProductReports.fulfilled, (state, { payload }) => {
      state.productsReportDetails = payload?.Data?.Products || [];
      state.productCategories = payload?.Data?.Categories || [];
    })
    builder.addCase(GetExporPRData.fulfilled, (state, { payload }) => {
      state.exportPRData = payload?.Data?.Products || [];
    })
  }
})

export const { setShowContent } = reportSlice.actions

export default reportSlice.reducer