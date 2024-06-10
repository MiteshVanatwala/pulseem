import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';
import { apiURL } from '../../config/index';
import { getUniqueValuesOfKey } from '../../helpers/Utils/common';
import { publicTemplates } from "../../assets/data/LandingPageTemplates.json"

export const getLandingPagesData = createAsyncThunk(
  'landingpages/getLandingPages', async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`landingpages/getLandingPages`);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const restoreLandingPages = createAsyncThunk(
  'landingpages/restoreLandingPages', async (deletedLandingPages, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.put(`landingpages/restoreLandingPages`, deletedLandingPages);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const deleteLandingPage = createAsyncThunk(
  'landingpages/deleteLandingPage', async (id, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.delete(`landingpages/deleteLandingPage/${id}`);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const duplicteLandingPage = createAsyncThunk(
  'landingpages/cloneLandingPage', async (id, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.put(`landingpages/cloneLandingPage/${id}`);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const downloadReport = createAsyncThunk(
  'report/ExportPurchase/', async (ID, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`${apiURL}/report/ExportPurchase/${ID}`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const exportSurvey = createAsyncThunk(
  'report/ExportSurvey/', async (ID, thunkAPI) => {
    try {

      const response = await PulseemReactInstance.get(`${apiURL}/report/ExportSurvey/${ID}`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const saveLandingPage = createAsyncThunk(
  'landingpages/CreateOrUpdate',
  async (data, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`landingpages/CreateOrUpdate`, data);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const saveLPTemplateToAccount = createAsyncThunk(
  '/landingpages/SaveAsTemplate', async (data, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`LandingPages/SaveAsTemplate`, data);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const getLPBeeToken = createAsyncThunk(
  '/LandingPages/GetBeeLPToken',
  async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`/LandingPages/GetBeeLPToken`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const getLPPublicTemplates = createAsyncThunk(
  '/landingpages/GetPublicTemplates', async (isRTL, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`LandingPages/GetPublicTemplates/${isRTL ? 'he' : 'en'}`);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const getAllLPTemplatesBySubaccountId = createAsyncThunk(
  '/landingpages/GetAllTemplatesBySubaccountId', async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`LandingPages/GetAllTemplatesBySubaccountId`);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const getLPTemplateById = createAsyncThunk(
  '/landingpages/GetTemplateById/', async (id, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`/LandingPages/GetTemplateById/${id}`);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const saveLPUserBlock = createAsyncThunk(
  '/landingpages/SaveUserBlock/', async (block, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`/landingpages/SaveUserBlock/`, block);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const getLPUserblocks = createAsyncThunk(
  '/landingpages/GetUserblocks/', async (thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`/landingpages/GetUserblocks`);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const deleteLPUserBlock = createAsyncThunk(
  '/landingpages/DeleteUserBlock/', async (id, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.delete(`/landingpages/DeleteUserBlock/${id}`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const getById = createAsyncThunk(
  '/landingpages/getById/', async (id, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`/landingpages/getById/${id}`);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const isShortUrlExist = createAsyncThunk(
  '/landingpages/IsShortUrlExist/', async (data, thunkAPI) => {
    try {
      const { WebFormID, ShortUrl } = data
      const response = await PulseemReactInstance.get(`/landingpages/IsShortUrlExist/${WebFormID}/${ShortUrl}`);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const setApiIntegration = createAsyncThunk(
  '/landingpages/SetApiIntegration', async (data, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`/landingpages/SetApiIntegration`, data);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });
export const deleteApiIntegration = createAsyncThunk(
  '/landingpages/DeleteApiIntegration', async (data, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.delete(`/landingpages/DeleteApiIntegration/${data.webFormId}/${data.id}`);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const getPageHeight = createAsyncThunk(
  '/landingpages/GetPageHeight/', async (id, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`/landingpages/GetPageHeight/${id}`);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const saveWebform = createAsyncThunk(
  'landingpages/SaveWebform',
  async (data, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`landingpages/SaveWebform`, data);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const publish = createAsyncThunk(
  'landingpages/publish',
  async (id, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.put(`landingpages/publish/${id}`);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const setWebformGroups = createAsyncThunk(
  'landingpages/SetWebformGroups',
  async (model, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`landingpages/SetWebformGroups`, model);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });



export const landingPagesSlice = createSlice({
  name: 'newsletter',
  initialState: {
    LPBeeToken: null,
    landingPagesData: [],
    landingPage: null,
    landingPagesDeletedData: [],
    landingPagesDataError: '',
    landingPageUserBlocks: null,
    publicTemplates: [],
    publicTemplateCategories: [],
    templatesBySubAccount: [],
    templatesBySubAccountCategories: [],
    ToastMessages: {
      LANDING_PAGE_SAVED: { severity: 'success', color: 'success', message: 'landingPages.landingPageSaved', showAnimtionCheck: true },
      TEMPLATE_SAVED: { severity: 'success', color: 'success', message: 'common.templateSaved', showAnimtionCheck: true },
      USER_BLOCK_SAVED: { severity: 'success', color: 'success', message: 'common.templateSaved', showAnimtionCheck: true },
      MULTIPLE_FORMS_NOT_ALLOWED: { severity: 'error', color: 'error', message: 'landingPages.multipleFormsBlocked', showAnimtionCheck: false },
    },
  },
  reducers: {
    updateLandingPage: (state, action) => {
      state.landingPage = action.payload;
    }
  },
  extraReducers: builder => {
    builder.addCase(saveWebform.fulfilled, (state, { payload }) => {
      state.landingPage = payload;
    })
    builder.addCase(getLandingPagesData.fulfilled, (state, { payload }) => {
      state.landingPagesData = payload.filter(row => !row.IsDeleted)
      state.landingPagesDeletedData = payload.filter(row => row.IsDeleted)
    })
    builder.addCase(getLPUserblocks.fulfilled, (state, { payload }) => {
      const blocks = payload?.map((b) => {
        return {
          uuid: b.uuid,
          category: b.Category,
          data: JSON.parse(b.Data),
          tags: b?.TagsAsString?.split(',')
        }
      });
      state.landingPageUserBlocks = blocks;
    })
    builder.addCase(getLandingPagesData.rejected, (state, action) => {
      state.landingPagesDataError = action.error.message
    })
    builder.addCase(getLPBeeToken.fulfilled, (state, { payload }) => {
      state.LPBeeToken = payload;
    })
    builder.addCase(getById.fulfilled, (state, { payload }) => {
      state.landingPage = payload;
    })
    builder.addCase(downloadReport.fulfilled, () => console.log('api downloadReport success'))
    builder.addCase(duplicteLandingPage.fulfilled, () => console.log('api duplicteLandingPage success'))
    builder.addCase(deleteLandingPage.fulfilled, () => console.log('api deleteLandingPage success'))
    builder.addCase(restoreLandingPages.fulfilled, () => console.log('api restoreLandingPages success'))
    builder.addCase(getLPPublicTemplates.fulfilled, (state, action) => {
      state.publicTemplates = action.payload.Data || []
      state.publicTemplateCategories = getUniqueValuesOfKey(action.payload.Data || [], 'Category');
    })
    builder.addCase(getAllLPTemplatesBySubaccountId.fulfilled, (state, action) => {
      state.templatesBySubAccount = action.payload.Data || [];
      state.templatesBySubAccountCategories = getUniqueValuesOfKey(action.payload.Data || [], 'CategoryList');
    })

    builder.addCase(downloadReport.rejected, (_, action) => console.log('Error - api downloadReport: ' + action.error))
    builder.addCase(duplicteLandingPage.rejected, (_, action) => console.log('Error - api duplicteLandingPage: ' + action.error))
    builder.addCase(deleteLandingPage.rejected, (_, action) => console.log('Error - api deleteLandingPage: ' + action.error))
    builder.addCase(restoreLandingPages.rejected, (_, action) => console.log('Error - api restoreLandingPages: ' + action.error))
  }
})


export const { updateLandingPage } = landingPagesSlice.actions
export default landingPagesSlice.reducer