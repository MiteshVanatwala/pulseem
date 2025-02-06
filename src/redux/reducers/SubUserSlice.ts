import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { PulseemReactInstance } from "../../helpers/Api/PulseemReactAPI";
import { PulseemResponse } from "../../Models/APIResponse";
import { SubUserModel, SubUserRequest } from "../../Models/SubUser/SubUsers";

export const getAllUsers = createAsyncThunk(
  'SubUser/GetAllUsers',
  async (request: SubUserRequest, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`SubUser/GetAllUsers`, request);
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
export const getChangeLog = createAsyncThunk(
  'SubUser/GetAllUsers',
  async (userId: number, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`SubUser/GetChangeLog/${userId}`);
      return response.data as PulseemResponse;
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

export const resendConfirmationEmail = createAsyncThunk(
  'SubUser/ResendConfirmationEmail',
  async (userId: number, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.put(`SubUser/ResendConfirmationEmail/${userId}`);
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
