import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getUniqueValuesOfKey } from '../../helpers/Utils/common';


export const getCampaignById = createAsyncThunk(
    '/CampaignEditor/GetCampaignById/', async (id, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.get(`/CampaignEditor/GetCampaignById/${id}`);
            return response.data
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const saveCampaign = createAsyncThunk(
    '/CampaignEditor/SaveCampaign/', async (campaign, thunkAPI) => {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await PulseemReactInstance.post(`/CampaignEditor/SaveCampaign/`, campaign);
                resolve(response.data)
            } catch (error) {
                reject(thunkAPI.rejectWithValue({ error: error.message }));
            }
        })
    });

export const saveUserBlock = createAsyncThunk(
    '/CampaignEditor/SaveUserBlock/', async (block, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.post(`/CampaignEditor/SaveUserBlock/`, block);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const updateUserBlock = createAsyncThunk(
    '/CampaignEditor/UpdateUserBlock/', async (campaign, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.put(`/CampaignEditor/UpdateUserBlock/`, campaign);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const getUserblocks = createAsyncThunk(
    '/CampaignEditor/GetUserblocks/', async (thunkAPI) => {
        try {
            const response = await PulseemReactInstance.get(`/CampaignEditor/GetUserblocks`);
            return response.data
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const deleteUserBlock = createAsyncThunk(
    '/CampaignEditor/DeleteUserBlock/', async (id, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.delete(`/CampaignEditor/DeleteUserBlock/${id}`);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const testSend = createAsyncThunk(
    '/CampaignEditor/TestSend/', async (payload, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.post(`/CampaignEditor/TestSend/`, payload);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const getBeeToken = createAsyncThunk(
    '/CampaignEditor/GetBeeToken/', async (_, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.get(`/CampaignEditor/GetBeeToken`);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const getTemplateById = createAsyncThunk(
    '/CampaignEditor/GetTemplateById/', async (id, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.get(`/CampaignEditor/GetTemplateById/${id}`);
            return response.data
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    })
export const deleteTemplateById = createAsyncThunk(
    '/CampaignEditor/DeleteTemplateById/', async (id, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.delete(`/CampaignEditor/DeleteTemplateById/${id}`);
            return response.data
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    })
export const saveTemplateToAccount = createAsyncThunk(
    '/CampaignEditor/SaveAsTemplate', async (data, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.post(`CampaignEditor/SaveAsTemplate`, data);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    })

export const getPublicTemplates = createAsyncThunk(
    '/CampaignEditor/GetPublicTemplates', async (isRTL, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.get(`CampaignEditor/GetPublicTemplates/${isRTL ? 'he' : 'en'}`);
            return response.data
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    })
export const getAllTemplatesBySubaccountId = createAsyncThunk(
    '/CampaignEditor/GetAllTemplatesBySubaccountId', async (_, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.get(`CampaignEditor/GetAllTemplatesBySubaccountId`);
            return response.data
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    })

export const updateTemplateMeta = createAsyncThunk(
    '/CampaignEditor/UpdateTemplateMeta', async (data, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.post(`CampaignEditor/UpdateTemplateMeta`, data);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    })

export const getDisplayConditions = createAsyncThunk(
    '/api/email/displayconditions', async (_, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.get('email/displayconditions');
            const items = response.data?.Data?.items || [];
            
            // Transform backend format to Beefree format
            const transformedItems = items.map(item => ({
                type: item.type || 'Custom Conditions',
                label: item.name,
                description: item.description || '',
                before: item.syntaxBefore,
                after: item.syntaxAfter,
                id: item.id
            }));
            
            return transformedItems;
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    })

export const saveDisplayCondition = createAsyncThunk(
    '/api/email/displayconditions/save', async (data, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.post('email/displayconditions', data);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.response?.data || error.message });
        }
    })

export const deleteDisplayCondition = createAsyncThunk(
    '/api/email/displayconditions/delete', async (id, thunkAPI) => {
        try {
            await PulseemReactInstance.delete(`email/displayconditions/${id}`);
            return id;
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    })

export const campaignEditorSlice = createSlice({
    name: 'campaignEditor',
    initialState: {
        beeToken: null,
        campaign: null,
        userBlocks: null,
        displayConditions: [],
        displayConditionsLoading: false,
        ToastMessages: {
            CAMPAIGN_SAVED: { severity: 'success', color: 'success', message: 'campaigns.campaignSaved', showAnimtionCheck: true },
            TEMPLATE_SAVED: { severity: 'success', color: 'success', message: 'common.templateSaved', showAnimtionCheck: true },
            RECIPIENT_BLOCKED: { severity: 'error', color: 'error', message: "campaigns.recipientBlocked", showAnimtionCheck: false },
            NO_CREDITS_LEFT: { severity: 'error', color: 'error', message: "sms.noCredits", showAnimtionCheck: false },
            INVALID_EMAIL: { severity: 'error', color: 'error', message: "common.invalidEmail", showAnimtionCheck: false },
            ERROR_OCCURED: { severity: 'error', color: 'error', message: 'common.ErrorOccured', showAnimtionCheck: false },
            WEBP_NOT_SUPPORTED: { severity: 'error', color: 'error', message: 'campaigns.webpNotSupport', showAnimtionCheck: false },
            HTML_DOCTYPE_ERROR: { severity: 'error', color: 'error', message: 'campaigns.htmlDocTypeNotAllowed', showAnimtionCheck: false },
        },
        templateDetails: {},
        publicTemplates: [],
        publicTemplateCategories: [],
        templatesBySubAccount: [],
        templatesBySubAccountCategories: []
    },
    extraReducers: builder => {
        builder
            .addCase(getCampaignById.fulfilled, (state, { payload }) => {
                state.campaign = payload
            })
            .addCase(getUserblocks.fulfilled, (state, { payload }) => {
                const blocks = payload?.map((b) => {
                    return {
                        uuid: b.uuid,
                        category: b.Category,
                        data: JSON.parse(b.Data),
                        tags: b?.TagsAsString?.split(',')
                    }
                });
                state.userBlocks = blocks;
            })
            .addCase(getBeeToken.fulfilled, (state, { payload }) => {
                state.beeToken = payload;
            })
            .addCase(getPublicTemplates.fulfilled, (state, action) => {
                state.publicTemplates = action.payload.Data || []
                state.publicTemplateCategories = getUniqueValuesOfKey(action.payload.Data || [], 'CategoryList');
            })
            .addCase(getAllTemplatesBySubaccountId.fulfilled, (state, action) => {
                state.templatesBySubAccount = action.payload.Data || [];
                state.templatesBySubAccountCategories = getUniqueValuesOfKey(action.payload.Data || [], 'CategoryList');
            })
            .addCase(getDisplayConditions.pending, (state) => {
                state.displayConditionsLoading = true;
            })
            .addCase(getDisplayConditions.fulfilled, (state, action) => {
                state.displayConditions = action.payload;
                state.displayConditionsLoading = false;
            })
            .addCase(getDisplayConditions.rejected, (state) => {
                state.displayConditionsLoading = false;
            })
            .addCase(saveDisplayCondition.fulfilled, (state) => {
                state.displayConditionsLoading = false;
            })
            .addCase(deleteDisplayCondition.fulfilled, (state, action) => {
                state.displayConditions = state.displayConditions.filter(c => c.id !== action.payload);
            })

    }
})

export default campaignEditorSlice.reducer
