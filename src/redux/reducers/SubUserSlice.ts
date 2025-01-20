import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { PulseemReactInstance } from "../../helpers/Api/PulseemReactAPI";
import { PulseemResponse } from "../../Models/APIResponse";
import { SubUserModel } from "../../Models/SubUser/SubUsers";

export const getAllUsers = createAsyncThunk(
  'SubUser/GetAllUsers',
  async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`SubUser/GetAllUsers`);
      return response.data as PulseemResponse;
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);
export const save = createAsyncThunk(
  'SubUser/CreateOrEdit',
  async (subUserModel: SubUserModel, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`SubUser/CreateOrEdit`, subUserModel);
      return response.data as PulseemResponse;
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);




export const SubUserSlice = createSlice({
  name: "SubUser",
  initialState: {
    subUsers: [] as SubUserModel[]
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAllUsers.fulfilled, (state, { payload }) => {
      state.subUsers = payload?.Data?.Items || [];
    });
  },
});

export default SubUserSlice.reducer;
