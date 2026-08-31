import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';
import { IDashboardData } from '../../Models/Service/Dashboard';

// The Service backend returns a double-encoded JSON string (see conversationsSlice).
const unwrap = <T = any>(data: any): { StatusCode: number; Message: string; Data: T } =>
  typeof data === 'string' ? JSON.parse(data) : data;

/** Reporting windows offered by the dashboard. Resolved to actual dates by the API. */
export type DashboardRange = '24h' | '7d' | '30d' | 'all';

export const getDashboardData = createAsyncThunk(
  'Service/GetDashboard',
  async (range: DashboardRange | void, thunkAPI) => {
    try {
      // Omitted entirely when not supplied, so the request stays byte-identical to
      // the previous one and the endpoint keeps its all-time default.
      const res = await PulseemReactInstance.get(
        range ? `Service/Dashboard?range=${range}` : 'Service/Dashboard',
      );
      const body = unwrap<IDashboardData>(res.data);

      // The API answers 200 at the transport layer and puts the real outcome in the
      // envelope, so a non-200 StatusCode has to be surfaced explicitly or the screen
      // silently renders an empty dashboard as though it were real data.
      if (body.StatusCode !== 200) {
        return thunkAPI.rejectWithValue(body.Message || 'Failed to load dashboard');
      }
      return body.Data;
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e?.message ?? 'Failed to load dashboard');
    }
  },
);

interface ServiceDashboardState {
  data: IDashboardData | null;
  loading: boolean;
  error: string | null;
}

const initialState: ServiceDashboardState = {
  data: null,
  loading: false,
  error: null,
};

const serviceDashboardSlice = createSlice({
  name: 'serviceDashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload as IDashboardData;
      })
      .addCase(getDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ?? action.error.message ?? 'Failed to load dashboard';
      });
  },
});

export default serviceDashboardSlice.reducer;
