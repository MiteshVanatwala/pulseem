import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { PulseemReactInstance } from "../../helpers/Api/PulseemReactAPI";
import { PulseemResponse } from "../../Models/APIResponse";
import { IServiceLimits, IServiceUsage } from "../../Models/ServiceLimits/ServiceLimits";

// leave limits/usage null (UNKNOWN => no restriction applied anywhere downstream).
export const getAccountLimits = createAsyncThunk(
  'ServiceLimits/GetAccountLimits',
  async (_data: void, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`ServiceLimits/GetAccountLimits`);
      return response.data as PulseemResponse;
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.Message || error.message });
    }
  }
);

const isPlainObject = (value: any): boolean =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const serviceLimitsSlice = createSlice({
  name: "ServiceLimits",
  initialState: {
    limits: null as IServiceLimits | null,
    usage: null as IServiceUsage | null,
    status: 'idle' as 'idle' | 'loading' | 'succeeded' | 'failed',
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAccountLimits.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(getAccountLimits.fulfilled, (state, { payload }) => {
      const limits = payload?.Data?.limits;
      const usage = payload?.Data?.usage;
      if (payload?.StatusCode === 201 && isPlainObject(limits)) {
        state.limits = limits;
        state.usage = isPlainObject(usage) ? usage : null;
        state.status = 'succeeded';
      } else {
        console.warn('[serviceLimits] Unexpected GetAccountLimits response — applying no restrictions.', payload);
        state.limits = null;
        state.usage = null;
        state.status = 'failed';
      }
    });
    builder.addCase(getAccountLimits.rejected, (state, action: any) => {
      console.warn('[serviceLimits] GetAccountLimits request failed — applying no restrictions.', action.payload?.error);
      state.limits = null;
      state.usage = null;
      state.status = 'failed';
    });
  },
});

export default serviceLimitsSlice.reducer;
