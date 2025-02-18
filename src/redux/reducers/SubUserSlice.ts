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



const SubUserSlice = createSlice({
  name: "SubUser",
  initialState: {
    subUsers: [] as SubUserModel[],
    ToastMessages: {
      LINK_EXPIRED: { severity: 'error', color: 'error', message: 'SubUsers.activationLinkExpired', showAnimtionCheck: false },
      404: { severity: 'error', color: 'error', message: 'SubUsers.activateFailed.404', showAnimtionCheck: false },
      405: { severity: 'error', color: 'error', message: 'SubUsers.activateFailed.405', showAnimtionCheck: false },
      NO_DATA_PROVIDED: { severity: 'error', color: 'error', message: 'SubUsers.form.noDataProvided', showAnimtionCheck: false },
      USER_NOT_MATCHED: { severity: 'error', color: 'error', message: 'SubUsers.form.userNotMached', showAnimtionCheck: false },
      INVALID_USERNAME: { severity: 'error', color: 'error', message: 'SubUsers.form.invalidUserName', showAnimtionCheck: false },
      XSS_NOT_ALLOWD: { severity: 'error', color: 'error', message: 'common.xssError', showAnimtionCheck: false },
      USERNAME_ALREADY_EXISTS: { severity: 'error', color: 'error', message: 'SubUsers.form.usernameAlreadyExists', showAnimtionCheck: false },
      USER_REJECTED: { severity: 'error', color: 'error', message: 'SubUsers.form.userRejected', showAnimtionCheck: false },
      USER_CREATED_SUCCESSFULLY: { severity: 'success', color: 'success', message: 'SubUsers.form.userCreatedSuccessfuly', showAnimtionCheck: true },
      CONFIRMATION_SENT: { severity: 'success', color: 'success', message: 'SubUsers.form.confirmationLinkSent', showAnimtionCheck: true },
      USER_DELETED: { severity: 'success', color: 'success', message: 'SubUsers.form.deleteUserSuccess', showAnimtionCheck: true },
      EMAIL_ALREADY_EXISTS: { severity: 'error', color: 'error', message: 'SubUsers.form.emailAlreadyExists', showAnimtionCheck: false },

    },
    test: 'hello'
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAllUsers.fulfilled, (state, { payload }) => {
      state.subUsers = payload?.Data?.Items || [];
    });
  },
});

export default SubUserSlice.reducer;
