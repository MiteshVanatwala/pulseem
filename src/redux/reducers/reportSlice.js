import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { instence } from '../../helpers/api';

export const GetProductReports = createAsyncThunk(
  'ProductReport/Get', async (data, thunkAPI) => {
    try {
      const response = await instence.post(`ProductReport/Get`, data);
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
    builder.addCase(GetProductReports.fulfilled, (state, { meta, payload }) => {
      if (!meta?.arg?.IsExport) {
        state.productsReportDetails = payload?.Data || [];
        if (payload?.Data?.Categories?.length > 0) {
          state.productCategories = payload?.Data?.Categories
        }
      }
      else {
        state.exportPRData = payload?.Data?.Products || [];
      }
    })
  }
})

export const { setShowContent } = reportSlice.actions

export default reportSlice.reducer