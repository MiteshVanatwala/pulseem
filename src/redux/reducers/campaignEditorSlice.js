import { instence } from '../../helpers/api'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createStore } from 'redux'


export const getCampaignById = createAsyncThunk(
    '/CampaignEditor/GetCampaignById/', async (id, thunkAPI) => {
        try {
            const response = await instence.get(`/CampaignEditor/GetCampaignById/${id}`);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const saveCampaign = createAsyncThunk(
    '/CampaignEditor/SaveCampaign/', async (campaign, thunkAPI) => {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await instence.post(`/CampaignEditor/SaveCampaign/`, campaign);
                resolve(JSON.parse(response.data))
            } catch (error) {
                reject(thunkAPI.rejectWithValue({ error: error.message }));
            }
        })
    });

export const saveUserBlock = createAsyncThunk(
    '/CampaignEditor/SaveUserBlock/', async (block, thunkAPI) => {
        try {
            const jsonData = {
                Category: block.category,
                Data: JSON.stringify(block.data),
                Tags: block.tags
            }
            const response = await instence.post(`/CampaignEditor/SaveUserBlock/`, jsonData);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const updateUserBlock = createAsyncThunk(
    '/CampaignEditor/UpdateUserBlock/', async (campaign, thunkAPI) => {
        try {
            const response = await instence.put(`/CampaignEditor/UpdateUserBlock/`, campaign);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const getUserblocks = createAsyncThunk(
    '/CampaignEditor/GetUserblocks/', async (thunkAPI) => {
        try {
            const response = await instence.get(`/CampaignEditor/GetUserblocks`);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const deleteUserBlock = createAsyncThunk(
    '/CampaignEditor/DeleteUserBlock/', async (id, thunkAPI) => {
        try {
            const response = await instence.delete(`/CampaignEditor/DeleteUserBlock/${id}`);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const testSend = createAsyncThunk(
    '/CampaignEditor/TestSend/', async (payload, thunkAPI) => {
        try {
            const response = await instence.post(`/CampaignEditor/TestSend/`, payload);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const saveCampaignInfo = createAsyncThunk(
    'CampaignEditor/CreateOrUpdate', async (campaign, thunkAPI) => {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await instence.post(`CampaignEditor/CreateOrUpdate`, campaign);
                resolve(JSON.parse(response.data))
            } catch (error) {
                reject(thunkAPI.rejectWithValue({ error: error.message }));
            }
        })
    }
)

export const getCampaignInfo = createAsyncThunk(
    'CampaignEditor/GetCampaignInfo', async (campaignId, thunkAPI) => {
        try {
            const response = await instence.get(`CampaignEditor/GetCampaignInfo/${campaignId}`);
            return response.data
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const getCreditsByFileTotalBytes = createAsyncThunk(
    'CampaignEditor/GetCreditsByFileTotalBytes', async (campaign, thunkAPI) => {
        try {
            const response = await instence.post(`CampaignEditor/GetCreditsByFileTotalBytes`, campaign);
            return response.data
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });


export const campaignEditorSlice = createSlice({
    name: 'campaignEditor',
    initialState: {
        campaign: null,
        userBlocks: null,
        ToastMessages: {
            CAMPAIGN_SAVED: { severity: 'success', color: 'success', message: 'campaigns.campaignSaved', showAnimtionCheck: true },
            RECIPIENT_BLOCKED: { severity: 'error', color: 'error', message: "campaigns.recipientBlocked", showAnimtionCheck: false },
            NO_CREDITS_LEFT: { severity: 'error', color: 'error', message: "sms.noCredits", showAnimtionCheck: false },
            INVALID_EMAIL: { severity: 'error', color: 'error', message: "common.invalidEmail", showAnimtionCheck: false },
        },
        campaignInfo: []
    },
    extraReducers: builder => {
        builder
            .addCase(getCampaignById.fulfilled, (state, { payload }) => {
                state.campaign = payload
            })
            .addCase(getUserblocks.fulfilled, (state, { payload }) => {
                const blocks = payload.map((b) => {
                    return {
                        id: b.ID,
                        category: b.Category,
                        data: JSON.parse(b.Data),
                        Tags: b.TagsAsString.split(',')
                    }
                });
                state.userBlocks = blocks
            })
            .addCase(getCampaignInfo.fulfilled, (state, { payload }) => {
                state.campaignInfo = payload;
            })
            .addCase(getCreditsByFileTotalBytes.fulfilled, (state, { payload }) => {
                state.campaignInfo = payload?.Message;
            })
    },
    reducers: {
        save: async (_, action) => {
            const res = await saveUserBlock(action.payload);
            return res;
        },
        update: async (_, action) => {
            await updateUserBlock(action.payload);
        },
        remove: async (_, action) => {
            await deleteUserBlock(action.payload);
        }
    },
})


export const { save, update, remove } = campaignEditorSlice.actions
export const store = createStore(campaignEditorSlice.reducer);
export default campaignEditorSlice.reducer
