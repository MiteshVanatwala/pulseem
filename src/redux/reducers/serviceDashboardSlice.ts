import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';
import { IDashboardData } from '../../Models/Service/Dashboard';
import { MOCK_DASHBOARD } from '../../screens/Service/Dashboard/mockDashboard';

// ⚠️ PREVIEW FLAG — true = use local mock data (no backend needed); false = call the
// real Service/Dashboard endpoint. Flip to false once the Dashboard backend is deployed.
const USE_MOCK = true;

// The Service backend returns a double-encoded JSON string (see conversationsSlice).
const unwrap = <T = any>(data: any): { StatusCode: number; Message: string; Data: T } =>
  typeof data === 'string' ? JSON.parse(data) : data;

const mockDelay = <T = any>(data: T, ms = 250): Promise<T> =>
  new Promise((r) => setTimeout(() => r(data), ms));

export const getDashboardData = createAsyncThunk('Service/GetDashboard', async () => {
  if (USE_MOCK) return mockDelay(MOCK_DASHBOARD);
  const res = await PulseemReactInstance.get('api/Service/Dashboard');
  return unwrap<IDashboardData>(res.data).Data;
});

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
        state.error = action.error.message ?? 'Failed to load dashboard';
      });
  },
});

export default serviceDashboardSlice.reducer;
