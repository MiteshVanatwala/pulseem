import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { PulseemReactInstance } from "../../helpers/Api/PulseemReactAPI";
import { v4 as uuidv4 } from "uuid";
import { ResponsesFilter } from "../../Models/Reports/ResponsesReports";

export const GetProductReports = createAsyncThunk(
  "ProductReport/Get",
  async (data: any, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(
        `ProductReport/Get`,
        data
      );
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);
export const GetResponsesReports = createAsyncThunk(
  "ResponsesReport/Get",
  async (data: ResponsesFilter, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(
        `ResponsesReport/Get`,
        data
      );
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

export const reportSlice = createSlice({
  name: "report",
  initialState: {
    showContent: false,
    productsReportDetails: [],
    productCategories: [],
    exportPRData: [],
    responsesReportDetails: [],
    TotalResponses: 0,
  },
  reducers: {
    setShowContent: (state, action) => {
      state.showContent = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      GetProductReports.fulfilled,
      (state: any, { meta, payload }: any) => {
        if (!meta?.arg?.IsExport) {
          state.productsReportDetails = payload?.Data || [];
          state.productsReportDetails?.Products?.forEach((product: any) => {
            product.uniqueKey = uuidv4();
          });
          if (payload?.Data?.Categories?.length > 0) {
            state.productCategories = payload?.Data?.Categories;
          }
        } else {
          state.exportPRData = payload?.Data?.Products || [];
        }
      }
    );
    builder.addCase(
      GetResponsesReports.fulfilled,
      (state, { meta, payload }) => {
        state.responsesReportDetails = payload?.Data || [];
      }
    );
  },
});

export const { setShowContent } = reportSlice.actions;

export default reportSlice.reducer;
