import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { PulseemReactInstance } from "../../helpers/Api/PulseemReactAPI";
import { PulseemResponse } from "../../Models/APIResponse";

export const SetExtraFields = createAsyncThunk(
  'Account/SetExtraFields',
  async (extraFields: any, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`Account/SetExtraFields`, extraFields);
      return response.data as PulseemResponse;
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

export const GetExtraFields = createAsyncThunk(
  'Account/GetExtraFields',
  async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`Account/GetExtraFields`);
      return response.data as PulseemResponse;
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);



export const ExtraFieldsSlice = createSlice({
  name: "extraFields",
  initialState: {
    AccountExtraFields: null as any
  },
  reducers: {

  },
  extraReducers: (builder) => {
    builder.addCase(GetExtraFields.fulfilled, (state, action) => {
      state.AccountExtraFields = action.payload;
    })
  }
});

export default ExtraFieldsSlice.reducer;
