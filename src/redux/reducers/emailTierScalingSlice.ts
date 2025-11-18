import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';

// --- Interfaces --- //
export interface EmailTierScaling {
  Id: number;
  LevelLow: number;
  LevelHigh: number;
  Price: number;
  AccountCategoryFeatureTier_Id: number;
  AccountCategoryFeatureTier: string;
}

interface EmailTierScalingState {
  tiers: EmailTierScaling[];
  loading: boolean;
  error: string | null;
}

// --- Initial State --- //
const initialState: EmailTierScalingState = {
  tiers: [],
  loading: false,
  error: null,
};

// --- Async Thunks --- //
export const getEmailPerRecipientsTierScaling = createAsyncThunk(
  'emailTierScaling/getEmailPerRecipientsTierScaling',
  async (currencyId: number, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(
        `FeatureTier/GetEmailPerRecipientsTierScaling?CurrencyId=${currencyId}`
      );
      return response.data.Data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: (error as Error).message });
    }
  }
);

// --- Slice --- //
const emailTierScalingSlice = createSlice({
  name: 'emailTierScaling',
  initialState,
  reducers: {
    clearEmailTierScaling: (state) => {
      state.tiers = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getEmailPerRecipientsTierScaling.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEmailPerRecipientsTierScaling.fulfilled, (state, action) => {
        state.loading = false;
        state.tiers = action.payload;
      })
      .addCase(getEmailPerRecipientsTierScaling.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as { error: string }).error;
      });
  },
});

export const { clearEmailTierScaling } = emailTierScalingSlice.actions;
export default emailTierScalingSlice.reducer;