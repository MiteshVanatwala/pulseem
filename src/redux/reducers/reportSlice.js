import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { instence } from '../../helpers/api';
import { StaticProducts, ProductCategories } from '../../screens/Reports/ProductsReport/TempConstants';

export const GetProductReports = createAsyncThunk(
  'ProductReport/Get', async (data, thunkAPI) => {
    try {
      const response = await instence.post(`ProductReport/Get`, data);
      console.log("1: ", response)
      return response.data
    } catch (error) {
      console.log("2: ", error)
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
      state.productsReportDetails = payload?.Data?.Products || StaticProducts;
      state.productCategories = payload?.Data?.Categories || ProductCategories;
    })
  }
})

export const { setShowContent } = reportSlice.actions

export default reportSlice.reducer