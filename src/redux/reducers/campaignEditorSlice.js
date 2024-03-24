import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getUniqueValuesOfKey } from '../../helpers/Utils/common';


export const getCampaignById = createAsyncThunk(
    '/CampaignEditor/GetCampaignById/', async (id, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.get(`/CampaignEditor/GetCampaignById/${id}`);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const saveCampaign = createAsyncThunk(
    '/CampaignEditor/SaveCampaign/', async (campaign, thunkAPI) => {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await PulseemReactInstance.post(`/CampaignEditor/SaveCampaign/`, campaign);
                resolve(JSON.parse(response.data))
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

export const campaignEditorSlice = createSlice({
    name: 'campaignEditor',
    initialState: {
        beeToken: null,
        campaign: null,
        userBlocks: null,
        ToastMessages: {
            CAMPAIGN_SAVED: { severity: 'success', color: 'success', message: 'campaigns.campaignSaved', showAnimtionCheck: true },
            TEMPLATE_SAVED: { severity: 'success', color: 'success', message: 'common.templateSaved', showAnimtionCheck: true },
            RECIPIENT_BLOCKED: { severity: 'error', color: 'error', message: "campaigns.recipientBlocked", showAnimtionCheck: false },
            NO_CREDITS_LEFT: { severity: 'error', color: 'error', message: "sms.noCredits", showAnimtionCheck: false },
            INVALID_EMAIL: { severity: 'error', color: 'error', message: "common.invalidEmail", showAnimtionCheck: false },
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
                console.log(state.userBlocks)
                console.log(blocks)
                state.userBlocks = blocks.concat([{
                    "category": "Dynamic Product Block",
                    "data": "\"{\\\"columns\\\":[{\\\"uuid\\\":\\\"041459da-cc24-48cc-a8d8-24fbcc653b64\\\",\\\"style\\\":{},\\\"modules\\\":[{\\\"uuid\\\":\\\"747c0fa3-7ab3-46b9-a270-3b1d584e79ea\\\",\\\"type\\\":\\\"mailup-bee-newsletter-modules-image\\\",\\\"descriptor\\\":{\\\"image\\\":{\\\"alt\\\":\\\"\\\",\\\"src\\\":\\\"https://www.pulseem.co.il/Pulseem/images/productimage.png\\\",\\\"href\\\":\\\"\\\",\\\"style\\\":{\\\"width\\\":\\\"100%\\\",\\\"text-align\\\":\\\"left\\\"},\\\"width\\\":\\\"200\\\"},\\\"style\\\":{\\\"width\\\":\\\"100%\\\",\\\"padding-top\\\":\\\"0px\\\",\\\"padding-right\\\":\\\"20px\\\",\\\"padding-bottom\\\":\\\"0px\\\",\\\"padding-left\\\":\\\"20px\\\",\\\"text-align\\\":\\\"left\\\"},\\\"computedStyle\\\":{\\\"class\\\":\\\"left fixedwidth\\\",\\\"width\\\":\\\"100%\\\",\\\"hideContentOnMobile\\\":false},\\\"mobileStyle\\\":{}},\\\"align\\\":\\\"right\\\",\\\"locked\\\":false},{\\\"uuid\\\":\\\"c856bbd2-877e-4e34-87d2-6e5dd2f0c291\\\",\\\"type\\\":\\\"mailup-bee-newsletter-modules-heading\\\",\\\"descriptor\\\":{\\\"heading\\\":{\\\"title\\\":\\\"h1\\\",\\\"text\\\":\\\"#name#\\\",\\\"style\\\":{\\\"color\\\":\\\"#555555\\\",\\\"font-size\\\":\\\"16px\\\",\\\"font-family\\\":\\\"inherit\\\",\\\"link-color\\\":\\\"#E01253\\\",\\\"line-height\\\":\\\"100%\\\",\\\"text-align\\\":\\\"left\\\",\\\"direction\\\":\\\"ltr\\\",\\\"font-weight\\\":\\\"700\\\",\\\"letter-spacing\\\":\\\"0px\\\"}},\\\"style\\\":{\\\"width\\\":\\\"100%\\\",\\\"text-align\\\":\\\"left\\\",\\\"padding-top\\\":\\\"10px\\\",\\\"padding-right\\\":\\\"20px\\\",\\\"padding-bottom\\\":\\\"10px\\\",\\\"padding-left\\\":\\\"20px\\\"},\\\"mobileStyle\\\":{},\\\"computedStyle\\\":{\\\"width\\\":52,\\\"height\\\":42}},\\\"align\\\":\\\"left\\\",\\\"locked\\\":false},{\\\"type\\\":\\\"mailup-bee-newsletter-modules-paragraph\\\",\\\"descriptor\\\":{\\\"paragraph\\\":{\\\"html\\\":\\\"#description#\\\",\\\"style\\\":{\\\"color\\\":\\\"#000000\\\",\\\"font-size\\\":\\\"14px\\\",\\\"font-family\\\":\\\"inherit\\\",\\\"font-weight\\\":\\\"400\\\",\\\"line-height\\\":\\\"120%\\\",\\\"text-align\\\":\\\"left\\\",\\\"direction\\\":\\\"ltr\\\",\\\"letter-spacing\\\":\\\"0px\\\"},\\\"computedStyle\\\":{\\\"linkColor\\\":\\\"#0068a5\\\",\\\"paragraphSpacing\\\":\\\"16px\\\"}},\\\"style\\\":{\\\"padding-top\\\":\\\"5px\\\",\\\"padding-right\\\":\\\"20px\\\",\\\"padding-bottom\\\":\\\"5px\\\",\\\"padding-left\\\":\\\"20px\\\"},\\\"mobileStyle\\\":{},\\\"computedStyle\\\":{\\\"hideContentOnAmp\\\":false,\\\"hideContentOnHtml\\\":false,\\\"hideContentOnDesktop\\\":false,\\\"hideContentOnMobile\\\":false}},\\\"uuid\\\":\\\"072f82be-51e0-49e3-b1a6-206396c7660c\\\",\\\"locked\\\":false},{\\\"type\\\":\\\"mailup-bee-newsletter-modules-paragraph\\\",\\\"descriptor\\\":{\\\"paragraph\\\":{\\\"html\\\":\\\"#price#\\\",\\\"style\\\":{\\\"color\\\":\\\"#000000\\\",\\\"font-size\\\":\\\"14px\\\",\\\"font-family\\\":\\\"inherit\\\",\\\"font-weight\\\":\\\"400\\\",\\\"line-height\\\":\\\"120%\\\",\\\"text-align\\\":\\\"left\\\",\\\"direction\\\":\\\"ltr\\\",\\\"letter-spacing\\\":\\\"0px\\\"},\\\"computedStyle\\\":{\\\"linkColor\\\":\\\"#0068a5\\\",\\\"paragraphSpacing\\\":\\\"16px\\\"}},\\\"style\\\":{\\\"padding-top\\\":\\\"5px\\\",\\\"padding-right\\\":\\\"20px\\\",\\\"padding-bottom\\\":\\\"5px\\\",\\\"padding-left\\\":\\\"20px\\\"},\\\"mobileStyle\\\":{},\\\"computedStyle\\\":{\\\"hideContentOnAmp\\\":false,\\\"hideContentOnHtml\\\":false,\\\"hideContentOnDesktop\\\":false,\\\"hideContentOnMobile\\\":false}},\\\"uuid\\\":\\\"9c399206-b9a4-498a-971f-5c5ab6d332a4\\\",\\\"locked\\\":false},{\\\"type\\\":\\\"mailup-bee-newsletter-modules-paragraph\\\",\\\"descriptor\\\":{\\\"paragraph\\\":{\\\"html\\\":\\\"Purchase\\\",\\\"style\\\":{\\\"color\\\":\\\"#000000\\\",\\\"font-size\\\":\\\"14px\\\",\\\"font-family\\\":\\\"inherit\\\",\\\"font-weight\\\":\\\"400\\\",\\\"line-height\\\":\\\"120%\\\",\\\"text-align\\\":\\\"left\\\",\\\"direction\\\":\\\"ltr\\\",\\\"letter-spacing\\\":\\\"0px\\\",\\\"pulseem-hide\\\":\\\"1\\\"},\\\"computedStyle\\\":{\\\"linkColor\\\":\\\"#0068a5\\\",\\\"paragraphSpacing\\\":\\\"16px\\\"}},\\\"style\\\":{\\\"padding-top\\\":\\\"5px\\\",\\\"padding-right\\\":\\\"20px\\\",\\\"padding-bottom\\\":\\\"5px\\\",\\\"padding-left\\\":\\\"20px\\\"},\\\"mobileStyle\\\":{},\\\"computedStyle\\\":{\\\"hideContentOnAmp\\\":false,\\\"hideContentOnHtml\\\":true,\\\"hideContentOnDesktop\\\":false,\\\"hideContentOnMobile\\\":false}},\\\"uuid\\\":\\\"885ad832-e230-4708-a904-b8deed5d600f\\\",\\\"locked\\\":false},{\\\"type\\\":\\\"mailup-bee-newsletter-modules-paragraph\\\",\\\"descriptor\\\":{\\\"paragraph\\\":{\\\"html\\\":\\\"All Categories\\\",\\\"style\\\":{\\\"color\\\":\\\"#000000\\\",\\\"font-size\\\":\\\"14px\\\",\\\"font-family\\\":\\\"inherit\\\",\\\"font-weight\\\":\\\"400\\\",\\\"line-height\\\":\\\"120%\\\",\\\"text-align\\\":\\\"left\\\",\\\"direction\\\":\\\"ltr\\\",\\\"letter-spacing\\\":\\\"0px\\\",\\\"pulseem-hide\\\":\\\"1\\\"},\\\"computedStyle\\\":{\\\"linkColor\\\":\\\"#0068a5\\\",\\\"paragraphSpacing\\\":\\\"16px\\\"}},\\\"style\\\":{\\\"padding-top\\\":\\\"5px\\\",\\\"padding-right\\\":\\\"20px\\\",\\\"padding-bottom\\\":\\\"5px\\\",\\\"padding-left\\\":\\\"20px\\\"},\\\"mobileStyle\\\":{},\\\"computedStyle\\\":{\\\"hideContentOnAmp\\\":false,\\\"hideContentOnHtml\\\":true,\\\"hideContentOnDesktop\\\":false,\\\"hideContentOnMobile\\\":false}},\\\"uuid\\\":\\\"d4117be3-4fc9-444e-8783-475f3e9946e7\\\",\\\"locked\\\":false},{\\\"uuid\\\":\\\"22913d9e-4fef-40da-b138-db8e5d572992\\\",\\\"type\\\":\\\"mailup-bee-newsletter-modules-button\\\",\\\"descriptor\\\":{\\\"button\\\":{\\\"label\\\":\\\"Buy Now\\\",\\\"href\\\":\\\"#URL#\\\",\\\"pul_id\\\":\\\"1\\\",\\\"style\\\":{\\\"font-family\\\":\\\"inherit\\\",\\\"font-size\\\":\\\"16px\\\",\\\"font-weight\\\":\\\"400\\\",\\\"background-color\\\":\\\"#3AAEE0\\\",\\\"border-radius\\\":\\\"4px\\\",\\\"border-top\\\":\\\"0px solid transparent\\\",\\\"border-right\\\":\\\"0px solid transparent\\\",\\\"border-bottom\\\":\\\"0px solid transparent\\\",\\\"border-left\\\":\\\"0px solid transparent\\\",\\\"color\\\":\\\"#ffffff\\\",\\\"line-height\\\":\\\"200%\\\",\\\"padding-top\\\":\\\"5px\\\",\\\"padding-right\\\":\\\"10px\\\",\\\"padding-bottom\\\":\\\"5px\\\",\\\"padding-left\\\":\\\"10px\\\",\\\"width\\\":\\\"auto\\\",\\\"max-width\\\":\\\"100%\\\",\\\"margin-left\\\":\\\"10px\\\",\\\"margin-right\\\":\\\"10px\\\"}},\\\"style\\\":{\\\"text-align\\\":\\\"left\\\",\\\"padding-top\\\":\\\"10px\\\",\\\"padding-right\\\":\\\"10px\\\",\\\"padding-bottom\\\":\\\"10px\\\",\\\"padding-left\\\":\\\"10px\\\"},\\\"mobileStyle\\\":{},\\\"computedStyle\\\":{\\\"width\\\":87,\\\"height\\\":42,\\\"hideContentOnMobile\\\":false}},\\\"align\\\":\\\"left\\\",\\\"locked\\\":false}],\\\"grid-columns\\\":12,\\\"locked\\\":false}],\\\"type\\\":\\\"product-catalog\\\",\\\"name\\\":\\\"Product Catalog\\\",\\\"synced\\\":false,\\\"metadata\\\":{\\\"name\\\":\\\"#1 - 1 - All Categories - horizontal - LTR\\\",\\\"tags\\\":\\\"product-catalog\\\",\\\"uuid\\\":\\\"808fb5dd-c34b-4e25-a3d7-f8e34c76fd64\\\",\\\"EventType\\\":\\\"1\\\",\\\"ProductCategory\\\":0,\\\"NumOfProdcuts\\\":1,\\\"direction\\\":\\\"LTR\\\",\\\"order\\\":\\\"horizontal\\\",\\\"category\\\":\\\"All Categories\\\",\\\"width\\\":\\\"100%\\\"},\\\"container\\\":{\\\"style\\\":{\\\"background-color\\\":\\\"transparent\\\",\\\"background-image\\\":\\\"none\\\",\\\"background-repeat\\\":\\\"no-repeat\\\",\\\"background-position\\\":\\\"top left\\\",\\\"direction\\\":\\\"ltr\\\",\\\"product-block-container\\\":\\\"1\\\",\\\"width\\\":\\\"100%\\\",\\\"event-type\\\":\\\"1\\\",\\\"category\\\":0,\\\"product-count\\\":1}},\\\"content\\\":{\\\"style\\\":{\\\"background-color\\\":\\\"#ffffff\\\",\\\"color\\\":\\\"#000000\\\",\\\"width\\\":\\\"1000px\\\",\\\"background-image\\\":\\\"none\\\",\\\"background-repeat\\\":\\\"no-repeat\\\",\\\"background-position\\\":\\\"top left\\\",\\\"border-top\\\":\\\"0px solid transparent\\\",\\\"border-right\\\":\\\"0px solid transparent\\\",\\\"border-bottom\\\":\\\"0px solid transparent\\\",\\\"border-left\\\":\\\"0px solid transparent\\\",\\\"border-radius\\\":\\\"0px\\\",\\\"direction\\\":\\\"ltr\\\"},\\\"computedStyle\\\":{\\\"rowColStackOnMobile\\\":true,\\\"rowReverseColStackOnMobile\\\":false,\\\"verticalAlign\\\":\\\"top\\\",\\\"hideContentOnMobile\\\":false,\\\"hideContentOnDesktop\\\":false}},\\\"uuid\\\":\\\"26613973-fbf7-48e6-9ac4-1bd5e9016841\\\",\\\"locked\\\":false}\"",
                    "ttags": ["product-catalog"],
                    "uuid": "808fb5dd-c34b-4e25-a3d7-f8e34c76fd64"
                }])
            })
            .addCase(getBeeToken.fulfilled, (state, { payload }) => {
                state.beeToken = payload;
            })
            .addCase(getPublicTemplates.fulfilled, (state, action) => {
                state.publicTemplates = action.payload.Data || []
                state.publicTemplateCategories = getUniqueValuesOfKey(action.payload.Data || [], 'Category');
            })
            .addCase(getAllTemplatesBySubaccountId.fulfilled, (state, action) => {
                state.templatesBySubAccount = action.payload.Data || [];
                state.templatesBySubAccountCategories = getUniqueValuesOfKey(action.payload.Data || [], 'Category');
            })

    }
})

export default campaignEditorSlice.reducer
