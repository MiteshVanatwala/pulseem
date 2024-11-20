import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { PulseemReactInstance } from "../../helpers/Api/PulseemReactAPI";
import { PulseemResponse } from "../../Models/APIResponse";
import { TermsOfUseModel } from "../../Models/TermsOfUse/TermsOfUse";

export const updateTermsOfUse = createAsyncThunk(
  'TermsOfUse/Update',
  async (filters: TermsOfUseModel, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`TermsOfUse/Update`, filters);
      return response.data as PulseemResponse;
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);


export const TermsOfUseSlice = createSlice({
  name: "TermsOfUse",
  initialState: {},
  reducers: {},
  extraReducers: (builder) => { }
});

export default TermsOfUseSlice.reducer;
