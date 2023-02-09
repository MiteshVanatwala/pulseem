import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';
import { PulseemResponse } from '../../Models/APIResponse';
import { AccountSettings } from '../../Models/Account/AccountSettings';
import { LoginPassword } from '../../Models/Account/Password';

export const getAccountSettings = createAsyncThunk(
  'AccountSettings/Get',
  async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`AccountSettings/Get`);
      return response.data
    } catch (error) {
      return console.log(error);
    }
  }
);
export const updateDetails = createAsyncThunk(
  'AccountSettings/UpdateDetails',
  async (settings: AccountSettings, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`AccountSettings/UpdateDetails`, settings);
      return response.data
    } catch (error) {
      return console.log(error);
    }
  }
);
export const updateSettings = createAsyncThunk(
  'AccountSettings/UpdateSettings',
  async (settings: AccountSettings, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`AccountSettings/UpdateSettings`, settings);
      return response.data
    } catch (error) {
      return console.log(error);
    }
  }
);
export const update2FASettings = createAsyncThunk(
  'AccountSettings/Update2FASettings',
  async (settings: AccountSettings, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.put(`AccountSettings/Update2FASettings`, settings)
      return response.data;
    } catch (error) {
      return console.log(error);
    }
  }
);
export const changePassword = createAsyncThunk('AccountSettings/ChangePassword',
  async (passLogin: LoginPassword, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`AccountSettings/ChangePassword`, passLogin)
      return response.data;
    } catch (error) {
      return console.log(error);
    }
  }
);

const AccountSettingsSlice = createSlice({
  name: 'AccountSettings',
  initialState: {
    accountSettings: {
      StatusCode: 200,
      Message: '',
      Data: {} as AccountSettings,
    } as PulseemResponse,
    ToastMessages: {
      GENERAL_ERROR: { severity: 'error', color: 'error', message: 'campaigns.newsLetterEditor.errors.generalError', showAnimtionCheck: false },
      SETTINGS_SAVED: { severity: 'success', color: 'success', message: 'settings.accountSettings.savedSuccessfuly', showAnimtionCheck: false },
      TWO_FA_SAVED: { severity: 'success', color: 'success', message: 'settings.accountSettings.auth.activatedSuccessfuly', showAnimtionCheck: false },
      TWO_FA_SAVED_INACTIVE: { severity: 'success', color: 'success', message: 'settings.accountSettings.auth.inActivetedSuccessfuly', showAnimtionCheck: false },
      TWO_FA_NOT_SAVED: { severity: 'error', color: 'error', message: 'settings.accountSettings.auth.notSaved', showAnimtionCheck: false },
      INVALID_EMAIL: { severity: 'error', color: 'error', message: 'settings.accountSettings.fixedComDetails.errors.invalidEmail', showAnimtionCheck: false },
      INVALID_CELLPHONE: { severity: 'error', color: 'error', message: 'settings.accountSettings.fixedComDetails.errors.invalidMobile', showAnimtionCheck: false },
      VERIFY_EMAIL: { severity: 'error', color: 'error', message: 'settings.accountSettings.fixedComDetails.errors.verifyEmail', showAnimtionCheck: false },
      VERIFY_CELLPHONE: { severity: 'error', color: 'error', message: 'settings.accountSettings.fixedComDetails.errors.verifyMobile', showAnimtionCheck: false },
      CHANGE_PASSWORD: {
        201: { severity: 'success', color: 'success', message: 'settings.changePassword.responses.201', showAnimtionCheck: false },
        403: { severity: 'error', color: 'error', message: 'settings.changePassword.responses.403', showAnimtionCheck: false },
        406: { severity: 'error', color: 'error', message: 'settings.changePassword.responses.406', showAnimtionCheck: false },
        407: { severity: 'error', color: 'error', message: 'settings.changePassword.responses.407', showAnimtionCheck: false },
        408: { severity: 'error', color: 'error', message: 'settings.changePassword.responses.408', showAnimtionCheck: false }
      }
    },
    twoFAUpdated: {
      StatusCode: 200,
      Message: '',
      Data: ''
    } as PulseemResponse
  },
  reducers: {
    // fill in primary logic here
  },
  extraReducers: (builder) => {
    builder.addCase(getAccountSettings.fulfilled, (state, action) => {
      state.accountSettings = action.payload;
    })
    builder.addCase(update2FASettings.fulfilled, (state, action) => {
      state.twoFAUpdated = action.payload;
    })
  },
})

export default AccountSettingsSlice.reducer