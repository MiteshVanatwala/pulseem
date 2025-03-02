import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { PulseemReactInstance } from "../../helpers/Api/PulseemReactAPI";

export const getCategories = createAsyncThunk(
  "Product/GetCategories",
  async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`Product/GetCategories`);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

export const GetProductsList = createAsyncThunk(
  "Product/GetProductsList",
  async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`Product/GetProductsList`);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

export const getProductURLS = createAsyncThunk(
  "Product/GetProductURLS",
  async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`Product/GetProductURLS`);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

export const productSlice = createSlice({
  name: "product",
  initialState: {
    productCategories: [],
    productList: [],
    productUrls: []
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      getCategories.fulfilled,
      (state: any, { meta, payload }: any) => {
        state.productCategories = payload?.Data;
      }
    );
    builder.addCase(
      GetProductsList.fulfilled,
      (state: any, { meta, payload }: any) => {
        state.productList = payload?.Data;
      }
    );
    builder.addCase(
      getProductURLS.fulfilled,
      (state: any, { meta, payload }: any) => {
        state.productUrls = payload?.Data;
      }
    );
  },
});

export default productSlice.reducer;
