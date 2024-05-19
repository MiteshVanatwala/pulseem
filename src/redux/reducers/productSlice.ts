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

export const productSlice = createSlice({
  name: "product",
  initialState: {
    productCategories: []
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      getCategories.fulfilled,
      (state: any, { meta, payload }: any) => {
        state.productCategories = payload?.Data;
      }
    );
  },
});

export default productSlice.reducer;
