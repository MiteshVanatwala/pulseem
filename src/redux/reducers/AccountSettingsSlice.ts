import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';
import { PulseemResponse } from '../../Models/APIResponse';
import { AccountSettings } from '../../Models/Account/AccountSettings';

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

const initialState = {
  StatusCode: 200,
  Message: '',
  Data: null as AccountSettings
} as PulseemResponse

const AccountSettingsSlice = createSlice({
  name: 'AccountSettings',
  initialState,
  reducers: {
    // fill in primary logic here
  },
  extraReducers: (builder) => {
    builder.addCase(getAccountSettings.pending, (state, action) => {
      // both `state` and `action` are now correctly typed
      // based on the slice state and the `pending` action creator
    })
    builder.addCase(getAccountSettings.fulfilled, (state, action) => {
      state.Data = action.payload?.Data;
      state.StatusCode = action.payload?.StatusCode;
      state.Message = action.payload?.Message;
    })
  },
})

export default AccountSettingsSlice.reducer