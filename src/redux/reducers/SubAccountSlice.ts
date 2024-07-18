import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { PulseemReactInstance } from "../../helpers/Api/PulseemReactAPI";
import { PulseemResponse } from "../../Models/APIResponse";
import { SubAccountUsers } from "../../Models/SubAccount/SubAccounts";

export const GetSubAccountList = createAsyncThunk(
  'SubAccount/SubAccountLisr',
  async (extraFields: any, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`Account/SetExtraFields`, extraFields);
      return response.data as PulseemResponse;
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);


export const SubAccountSlice = createSlice({
  name: "SubAccount",
  initialState: {
    isGlobal: false,
    subAccountList: [
      {
        SubAccountId: 1,
        SubAccountName: 'John Doe',
        SubAccountManager: 'Mr. John',
        Balance: 123
      },
      {
        SubAccountId: 2,
        SubAccountName: 'Smith Carter',
        SubAccountManager: 'Mr. John',
        Balance: 2343
      }
    ] as SubAccountUsers[],
    extraData: null
  },
  reducers: {
    update: (state, action) => {
      state.extraData = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(GetSubAccountList.fulfilled, (state, { payload }) => {
      state.subAccountList = payload?.Data;
    });
  },
});

export const { update } = SubAccountSlice.actions
export default SubAccountSlice.reducer;
