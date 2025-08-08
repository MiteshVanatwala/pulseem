import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';
import { GetLinksClicksReportPayload, LinksClicksReportState } from '../../Models/Reports/LinksClicksReport';
import get from 'lodash/get';

export const getLinksClicksReport = createAsyncThunk(
  'linksClicksReport/getReport',
  async ({
    CampaignID,
    IsParent,
    IsVerified,
    type
  }: GetLinksClicksReportPayload, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`report/GetLinksClicksReport?CampaignID=${CampaignID}&IsParent=${IsParent}&IsVerified=${IsVerified}&type=${type}`);
      
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

export const exportLinkClicksData = createAsyncThunk(
  'linksClicksReport/exportLinkClicksData',
  async (payload: { linkId: number; campaignId: number, Culture: string, type: string }, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(
        `report/ExportLinkClicksReport?LinkID=${payload.linkId}&CampaignID=${payload.campaignId}&Culture=${payload.Culture}&type=${payload.type}`
      );
      
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

export const exportLinksClicksReport = createAsyncThunk(
  'linksClicksReport/exportLinksClicksReport',
  async (payload: { linkId?: number; campaignId: number; type: string, isParent: boolean, Culture: string }, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(
        `report/ExportLinksClicksReport?LinkID=${payload.linkId ? payload.linkId : 0}&CampaignID=${payload.campaignId}&IsParent=${payload.isParent}&IsVerified=false&Culture=${payload.Culture}&type=${payload.type}`
      );

      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

// Initial state
const initialState: LinksClicksReportState = {
  linksClicksData: [],
  loading: false,
  error: ''
};

export const linksClicksReportSlice = createSlice({
  name: 'linksClicksReport',
  initialState,
  reducers: {
    clearLinksClicksReport: (state) => {
      state.linksClicksData = null;
      state.error = '';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getLinksClicksReport.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(getLinksClicksReport.fulfilled, (state, action) => {
        state.loading = false;
        state.linksClicksData = get(action, 'payload', []);
      })
      .addCase(getLinksClicksReport.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to load links clicks report';
      })
  }
});

// Export actions
export const { clearLinksClicksReport } = linksClicksReportSlice.actions;

// Export reducer
export default linksClicksReportSlice.reducer;