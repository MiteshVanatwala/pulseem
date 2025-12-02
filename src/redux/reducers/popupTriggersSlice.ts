import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';

// --- Interfaces --- //
interface PopupTrigger {
  Id: number;
  Name: string;
  Name_HE: string;
  Name_PL: string;
  Description: string;
  Description_HE: string;
  Description_PL: string;
  FullDescription: string;
  IsActive: boolean;
}

interface AudienceTarget {
  Id: number;
  Name: string;
  Description: string;
}

interface ConditionType {
  Id: number;
  Name: string;
  Description: string;
}

interface DisplayFrequency {
  Id: number;
  Name: string;
  Description: string;
}

interface PopupLookupData {
  PopupTriggers: PopupTrigger[];
  AudienceTargets: AudienceTarget[];
  ConditionTypes: ConditionType[];
  DisplayFrequencies: DisplayFrequency[];
}

interface PopupRulesData {
  PopupTriggers?: any[];
  PopupFrequency?: any[];
  PopupPageTargeting?: any[];
  PopupDeviceTargets?: number[];
  ContinueAfterConversion: boolean;
  PopupConversionId?: number;
  PopupConvesrionId?: number;
}

interface PopupTriggersState {
  lookupData: PopupLookupData | null;
  loading: boolean;
  error: string | null;
  upserting: boolean;
  upsertSuccess: boolean;
  upsertError: string | null;
  popupRules: PopupRulesData | null;
  rulesLoading: boolean;
  rulesError: string | null;
}

// --- Initial State --- //
const initialState: PopupTriggersState = {
  lookupData: null,
  loading: false,
  error: null,
  upserting: false,
  upsertSuccess: false,
  upsertError: null,
  popupRules: null,
  rulesLoading: false,
  rulesError: null,
};

// --- Async Thunks --- //
export const getPopupLookupData = createAsyncThunk(
  'popupTriggers/getPopupLookupData',
  async ({ id }: { id: number }, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get('popup/GetPopupLookupData', { 
        params: { id }
       });
      return response.data.Data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: (error as Error).message });
    }
  }
);

export const upsertPopupRules = createAsyncThunk(
  'popupTriggers/upsertPopupRules',
  async (rules: any, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post('popup/UpsertPopupRules', rules);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: (error as Error).message });
    }
  }
);

export const getPopupRulesById = createAsyncThunk(
  'popupTriggers/getPopupRulesById',
  async ({ webFormId }: { webFormId: number }, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get('popup/GetPopupRulesById', { 
        params: { webFormId }
       });
      return response.data.Data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: (error as Error).message });
    }
  }
);

// --- Slice --- //
const popupTriggersSlice = createSlice({
  name: 'popupTriggers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPopupLookupData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPopupLookupData.fulfilled, (state, action) => {
        state.loading = false;
        state.lookupData = action.payload;
      })
      .addCase(getPopupLookupData.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as { error: string }).error;
      })
      .addCase(upsertPopupRules.pending, (state) => {
        state.upserting = true;
        state.upsertError = null;
        state.upsertSuccess = false;
      })
      .addCase(upsertPopupRules.fulfilled, (state, action) => {
        state.upserting = false;
        state.upsertSuccess = true;
      })
      .addCase(upsertPopupRules.rejected, (state, action) => {
        state.upserting = false;
        state.upsertError = (action.payload as { error: string }).error;
      })
      .addCase(getPopupRulesById.pending, (state) => {
        state.rulesLoading = true;
        state.rulesError = null;
      })
      .addCase(getPopupRulesById.fulfilled, (state, action) => {
        state.rulesLoading = false;
        state.popupRules = action.payload;
      })
      .addCase(getPopupRulesById.rejected, (state, action) => {
        state.rulesLoading = false;
        state.rulesError = (action.payload as { error: string }).error;
      });
  },
});

export default popupTriggersSlice.reducer;