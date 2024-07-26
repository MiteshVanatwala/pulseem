import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { PulseemReactInstance } from "../../helpers/Api/PulseemReactAPI";
import { PulseemResponse } from "../../Models/APIResponse";
import { BulkHistory, SubAccountUsers } from "../../Models/SubAccount/SubAccounts";

export const GetAccountDetails = createAsyncThunk(
  'AccountSubUsers/GetIsGlobalAndCurrencyOfAccount',
  async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`AccountSubUsers/GetIsGlobalAndCurrencyOfAccount`);
      return response.data as PulseemResponse;
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

export const GetDirectAccountDetails = createAsyncThunk(
  'AccountSubUsers/GetAccountUsers',
  async (filters: any, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`AccountSubUsers/GetAccountUsers`, filters);
      return response.data as PulseemResponse;
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

export const DeleteSubAccounts = createAsyncThunk(
  'AccountSubUsers/DeleteSubAccounts',
  async (CustomGuidEnc: string, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`AccountSubUsers/DeleteSubAccounts`, { CustomGuidEnc });
      return response.data as PulseemResponse;
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

export const GetSubAccountList = createAsyncThunk(
  'AccountSubUsers/GetAccountUsers',
  async (filters: any, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`AccountSubUsers/GetAccountUsers`, filters);
      return response.data as PulseemResponse;
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

export const GetBulkHistory = createAsyncThunk(
  'AccountSubUsers/GetBulkHistory',
  async (filters: any, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`AccountSubUsers/GetBulkHistory`, {
        ...filters,
        type: filters.type === '' ? null : filters.type,
        accountType: filters.accountType === '' ? null : filters.accountType
      });
      return response.data as PulseemResponse;
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);


export const SubAccountSlice = createSlice({
  name: "SubAccount",
  initialState: {
    accountId: null,
    isGlobal: false,
    currencyId: null,
    currency: null,
    currencyDescription: null,
    subAccountList: [] as SubAccountUsers[],
    bulkHistory: [] as BulkHistory[],
  },
  reducers: {
    update: (state, action) => {
      // state.extraData = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(GetAccountDetails.fulfilled, (state, { payload }) => {
      state.accountId = payload?.Data?.AccountId;
      state.isGlobal = payload?.Data?.IsGlobalAccount;
      state.currency = payload?.Data?.Currency;
      state.currencyDescription = payload?.Data?.CurrencyDescription;
      state.currencyId = payload?.Data?.CurrencyId;
    });
    builder.addCase(GetSubAccountList.fulfilled, (state, { payload }) => {
      state.subAccountList = payload?.Data?.Items || [];
    });
    // builder.addCase(GetBulkHistory.fulfilled, (state, { payload }) => {
    //   state.bulkHistory = payload?.Data || [];
    // });
  },
});

export const { update } = SubAccountSlice.actions
export default SubAccountSlice.reducer;
