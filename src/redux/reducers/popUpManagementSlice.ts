import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';

// --- Interfaces --- //
interface TopPerformer {
  Id: number;
  Name: string;
  ConversionRate: number;
}

interface PerformanceStats {
  TotalPopups: number;
  ActiveCount: number;
  InactiveCount: number;
  DraftCount: number;
  MonthlyViews: number;
  MonthlyViewsChange: number;
  AverageConversionRate: number;
  AverageConversionChange: number;
  TopPerformer: TopPerformer;
}

export interface Page {
  ID: number;
  Name: string;
  Status: number;
  StatusName: string;
  AllViews: number;
  DesktopViewsPercent: number;
  MobileViewsPercent: number;
  IdentifiedViewers: number;
  IdentifiedViewersPercent: number;
  Conversions: number;
  IdentifiedConversions: number;
  ConversionRate: number;
  ConversionRateChange: number;
  ConversionType: number;
  CreatedDate: string;
  LastModifiedDate: string;
  Domains: string[];
  PopupGuid: string;
}

interface PopUpManagementState {
  stats: PerformanceStats | null;
  statsLoading: boolean;
  statsError: string | null;
  pages: Page[];
  totalPages: number;
  currentPage: number;
  pagesLoading: boolean;
  pagesError: string | null;
}

// --- Initial State --- //
const initialState: PopUpManagementState = {
  stats: null,
  statsLoading: false,
  statsError: null,
  pages: [],
  totalPages: 1,
  currentPage: 1,
  pagesLoading: false,
  pagesError: null,
};

// --- Async Thunks --- //
export const getPerformanceStats = createAsyncThunk(
  'popUpManagement/getPerformanceStats',
  async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get('popup/GetPerformanceStats');
      return response.data.Data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: (error as Error).message });
    }
  }
);

interface PopupPagesResponse {
  Pages: Page[];
  TotalPages: number;
  CurrentPage: number;
}

interface Filters {
  SearchTerm: string;
  FilterStatus: string;
  SortBy: string;
  SortDirection: string;
  PageNumber: number;
  PageSize: number;
}

export const getPopupPages = createAsyncThunk<PopupPagesResponse, Filters>(
  'popUpManagement/getPopupPages',
  async (filters, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post('popup/GetPopupPages', filters);
      return response.data.Data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: (error as Error).message });
    }
  }
);

export const togglePopupStatus = createAsyncThunk(
  'popUpManagement/togglePopupStatus',
  async ({ ID, Status }: { ID: number; Status: number }, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post('popup/ToggleStatus', { ID, Status });
      return response.data.Data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: (error as Error).message });
    }
  }
);

export const deletePopup = createAsyncThunk<number, number>(
  'popUpManagement/deletePopup',
  async (id: number, thunkAPI) => {
    try {
      await PulseemReactInstance.delete(`landingpages/deleteLandingPage/${id}`);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: (error as Error).message });
    }
  }
);

// --- Slice --- //
const popUpManagementSlice = createSlice({
  name: 'popUpManagement',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Stats Reducers
      .addCase(getPerformanceStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(getPerformanceStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(getPerformanceStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = (action.payload as { error: string }).error;
      })
      // Pages Reducers
      .addCase(getPopupPages.pending, (state) => {
        state.pagesLoading = true;
        state.pagesError = null;
      })
      .addCase(getPopupPages.fulfilled, (state, action) => {
        state.pagesLoading = false;
        state.pages = action.payload.Pages;
        state.totalPages = action.payload.TotalPages;
        state.currentPage = action.payload.CurrentPage;
      })
      .addCase(getPopupPages.rejected, (state, action) => {
        state.pagesLoading = false;
        state.pagesError = (action.payload as { error: string }).error;
      })
      // Toggle Status Reducers
      .addCase(togglePopupStatus.pending, (state) => {
        state.pagesLoading = true;
      })
      .addCase(togglePopupStatus.fulfilled, (state, action) => {
        state.pagesLoading = false;
        const { ID, Status } = action.meta.arg;
        const index = state.pages.findIndex(p => p.ID === ID);
        if (index !== -1) {
          if (Status === 2) { // 2 corresponds to 'Active'
            state.pages[index].StatusName = 'Active';
            state.pages[index].Status = 1;
          } else { // 1 corresponds to 'Inactive'
            state.pages[index].StatusName = 'Inactive';
            state.pages[index].Status = 0;
          }
        }
      })
      .addCase(togglePopupStatus.rejected, (state, action) => {
        state.pagesLoading = false;
        state.pagesError = (action.payload as { error: string }).error;
      })
      // Delete Popup Reducers
      .addCase(deletePopup.pending, (state) => {
        state.pagesLoading = true;
      })
      .addCase(deletePopup.fulfilled, (state, action) => {
        state.pagesLoading = false;
        state.pages = state.pages.filter(p => p.ID !== action.payload);
      })
      .addCase(deletePopup.rejected, (state, action) => {
        state.pagesLoading = false;
        state.pagesError = (action.payload as { error: string }).error;
      });
  },
});

export default popUpManagementSlice.reducer;