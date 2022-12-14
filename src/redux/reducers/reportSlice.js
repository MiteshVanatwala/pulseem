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
    productCategories: []
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
  }
})

export const { setShowContent } = reportSlice.actions

export default reportSlice.reducer