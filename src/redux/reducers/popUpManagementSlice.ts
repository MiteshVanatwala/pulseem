import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';

// Mocking stages in localStorage for development/testing before backend is ready
// Set to false once backend endpoints are live
const MOCK_STAGES = true;

const mockStagesKey = (webFormId: number) => `mockPopupStages_${webFormId}`;

const mockGetStages = (webFormId: number): PopupStage[] => {
  const stored = localStorage.getItem(mockStagesKey(webFormId));
  if (stored) return JSON.parse(stored);
  const initial: PopupStage[] = [{ StageNumber: 1 }];
  localStorage.setItem(mockStagesKey(webFormId), JSON.stringify(initial));
  return initial;
};

const mockSaveStages = (webFormId: number, stages: PopupStage[]) => {
  localStorage.setItem(mockStagesKey(webFormId), JSON.stringify(stages));
};

// --- Interfaces --- //
export interface PopupStage {
  StageNumber: number;
  HtmlContent?: string;
  JsonData?: string;
}

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
  IsSurvey?: boolean;
  SurveyCount?: number;
  IsNewEditor?: boolean;
  Submits?: number;
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
  deletedPopups: Page[];
  stages: PopupStage[];
  stagesLoading: boolean;
  stagesError: string | null;
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
  deletedPopups: [],
  stages: [],
  stagesLoading: false,
  stagesError: null,
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
      return response.data;
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

export const getDeletedPopups = createAsyncThunk(
  'popUpManagement/getDeletedPopups',
  async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get('popup/GetDeletedPopups');
      return response.data.Data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: (error as Error).message });
    }
  }
);

export const getPopupStages = createAsyncThunk(
  'popUpManagement/getPopupStages',
  async (webFormId: number, thunkAPI) => {
    if (MOCK_STAGES) {
      return { StatusCode: 201, Data: mockGetStages(webFormId) };
    }
    try {
      const response = await PulseemReactInstance.get(`popup/GetPopupStages`, { params: { webFormId } });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: (error as Error).message });
    }
  }
);

export const addPopupStage = createAsyncThunk(
  'popUpManagement/addPopupStage',
  async (webFormId: number, thunkAPI) => {
    if (MOCK_STAGES) {
      const stages = mockGetStages(webFormId);
      if (stages.length >= 3) {
        return thunkAPI.rejectWithValue({ error: 'Maximum 3 stages allowed' });
      }
      const newStageNumber = stages.length + 1;
      stages.push({ StageNumber: newStageNumber });
      mockSaveStages(webFormId, stages);
      return { StatusCode: 201, Data: { StageNumber: newStageNumber, TotalStages: stages.length } };
    }
    try {
      const response = await PulseemReactInstance.post('popup/AddPopupStage', { WebFormId: webFormId });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: (error as Error).message });
    }
  }
);

export const deletePopupStage = createAsyncThunk(
  'popUpManagement/deletePopupStage',
  async ({ webFormId, stageNumber }: { webFormId: number; stageNumber: number }, thunkAPI) => {
    if (MOCK_STAGES) {
      let stages = mockGetStages(webFormId).filter(s => s.StageNumber !== stageNumber);
      // Renumber sequentially after deletion
      stages = stages.map((s, i) => ({ ...s, StageNumber: i + 1 }));
      mockSaveStages(webFormId, stages);
      return { StatusCode: 201, Data: null };
    }
    try {
      const response = await PulseemReactInstance.post('popup/DeletePopupStage', { WebFormId: webFormId, StageNumber: stageNumber });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: (error as Error).message });
    }
  }
);

export const savePopupStageContent = createAsyncThunk(
  'popUpManagement/savePopupStageContent',
  async ({ webFormId, stageNumber, htmlContent, jsonData }: { webFormId: number; stageNumber: number; htmlContent: string; jsonData: string }, thunkAPI) => {
    if (MOCK_STAGES) {
      const stages = mockGetStages(webFormId);
      const idx = stages.findIndex(s => s.StageNumber === stageNumber);
      if (idx > -1) {
        stages[idx] = { ...stages[idx], HtmlContent: htmlContent, JsonData: jsonData };
      } else {
        stages.push({ StageNumber: stageNumber, HtmlContent: htmlContent, JsonData: jsonData });
      }
      mockSaveStages(webFormId, stages);
      return { StatusCode: 201, Data: null };
    }
    try {
      const response = await PulseemReactInstance.post('popup/SavePopupStageContent', { WebFormId: webFormId, StageNumber: stageNumber, HtmlContent: htmlContent, JsonData: jsonData });
      return response.data;
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
        if (action.payload.StatusCode !== 927) {
          const { ID, Status } = action.meta.arg;
          const index = state.pages.findIndex(p => p.ID === ID);
          if (index !== -1) {
            if (Status === 2) {
              state.pages[index].StatusName = 'Active';
              state.pages[index].Status = 1;
            } else {
              state.pages[index].StatusName = 'Inactive';
              state.pages[index].Status = 0;
            }
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
      })
      // Deleted Popups Reducers
      .addCase(getDeletedPopups.pending, (state) => {
        state.pagesLoading = true;
      })
      .addCase(getDeletedPopups.fulfilled, (state, action) => {
        state.pagesLoading = false;
        state.deletedPopups = action.payload;
      })
      .addCase(getDeletedPopups.rejected, (state, action) => {
        state.pagesLoading = false;
        state.pagesError = (action.payload as { error: string }).error;
      })
      // Stage Reducers
      .addCase(getPopupStages.pending, (state) => {
        state.stagesLoading = true;
        state.stagesError = null;
      })
      .addCase(getPopupStages.fulfilled, (state, action) => {
        state.stagesLoading = false;
        state.stages = action.payload?.Data || [];
      })
      .addCase(getPopupStages.rejected, (state, action) => {
        state.stagesLoading = false;
        state.stagesError = (action.payload as { error: string })?.error || null;
      })
      .addCase(addPopupStage.pending, (state) => {
        state.stagesLoading = true;
        state.stagesError = null;
      })
      .addCase(addPopupStage.fulfilled, (state) => {
        state.stagesLoading = false;
      })
      .addCase(addPopupStage.rejected, (state, action) => {
        state.stagesLoading = false;
        state.stagesError = (action.payload as { error: string })?.error || null;
      })
      .addCase(deletePopupStage.pending, (state) => {
        state.stagesLoading = true;
        state.stagesError = null;
      })
      .addCase(deletePopupStage.fulfilled, (state) => {
        state.stagesLoading = false;
      })
      .addCase(deletePopupStage.rejected, (state, action) => {
        state.stagesLoading = false;
        state.stagesError = (action.payload as { error: string })?.error || null;
      })
      .addCase(savePopupStageContent.pending, (state) => {
        state.stagesLoading = true;
        state.stagesError = null;
      })
      .addCase(savePopupStageContent.fulfilled, (state) => {
        state.stagesLoading = false;
      })
      .addCase(savePopupStageContent.rejected, (state, action) => {
        state.stagesLoading = false;
        state.stagesError = (action.payload as { error: string })?.error || null;
      });
  },
});

export default popUpManagementSlice.reducer;