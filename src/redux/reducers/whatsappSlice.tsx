import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';
import {
	CallToAction,
	JSONPropsText,
	QuickReply,
	TextMedia,
	TextMediaAndButton,
} from '../../screens/Whatsapp/Editor/Types/JSON.types';
import {
	ApiCreateGroupPayload,
	ApiSaveCampaignSettingsData,
	saveCampaignDataProps,
	uploadData,
} from '../../screens/Whatsapp/Campaign/Types/WhatsappCampaign.types';
import { uploaderInstance } from '../../helpers/Api/UploaderAPI';
import { setUploadProgress } from './groupSlice';

type ApiError = {
	message: string;
};

type ApiGetSavedTemplatesData = {
	templateStatus: number;
};

type ApiSubmitTemplatesData =
	| TextMediaAndButton
	| QuickReply
	| CallToAction
	| TextMedia
	| JSONPropsText
	| undefined;

type ApiSendCampaignData = {
	WACampaignID: number;
};

type apiCombineGroup = {
	GroupIds: number[];
	GroupName: string;
	SubAccountID: number;
};

export const getSavedTemplates = createAsyncThunk(
	'WhatsAppTemplate/GetWhatsAppTemplate',
	async (data: ApiGetSavedTemplatesData, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`WhatsAppTemplate/GetWhatsAppTemplate`,
				data
			);

			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const getSavedTemplatesById = createAsyncThunk(
	'WhatsAppTemplate/GetWhatsAppTemplateById',
	async (id: string, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.get(
				`WhatsAppTemplate/GetWhatsAppTemplateById/${id}`
			);

			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const getSavedTemplatesPreviewById = createAsyncThunk(
	'WhatsAppTemplate/GetWhatsAppTemplate',
	async (data: { templateId: string }, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`WhatsAppTemplate/GetWhatsAppTemplate`,
				data
			);

			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const submitTemplates = createAsyncThunk(
	'WhatsAppTemplate/SubmitWhatsAppTemplate',
	async (data: ApiSubmitTemplatesData, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`WhatsAppTemplate/SubmitWhatsAppTemplate`,
				data
			);

			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const uploadMedia = createAsyncThunk(
	'WhatsAppTemplate/UploadWhatsAppMediaFile',
	async (data: FormData, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`WhatsAppTemplate/UploadWhatsAppMediaFile`,
				data
			);

			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const saveTemplates = createAsyncThunk(
	'whatsAppCampaign/SaveWhatsAppTemplate',
	async (data: ApiSubmitTemplatesData, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`whatsAppCampaign/SaveWhatsAppTemplate`,
				data
			);

			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const saveCampaign = createAsyncThunk(
	'whatsAppCampaign/SaveWhatsappCampaign',
	async (data: saveCampaignDataProps, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`whatsAppCampaign/SaveWhatsappCampaign`,
				data
			);

			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const saveCampaignSettings = createAsyncThunk(
	'whatsAppCampaign/SaveWACampaignSettings',
	async (data: ApiSaveCampaignSettingsData, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`whatsAppCampaign/SaveWACampaignSettings`,
				data
			);

			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const getCampaignSettings = createAsyncThunk(
	'whatsAppCampaign/GetCampaignSettings',
	async (campaignID: string, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.get(
				`whatsAppCampaign/GetCampaignSettings/${campaignID}`
			);

			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const getWhatsappCampaignNameFilter = createAsyncThunk(
	'whatsAppCampaign/GetWhatsappCampaignNameFilter',
	async (campaignID: string, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.get(
				`whatsAppCampaign/GetWhatsappCampaignNameFilter`
			);

			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const sendCampaign = createAsyncThunk(
	'whatsAppCampaign/Send',
	async (data: ApiSendCampaignData, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`whatsAppCampaign/Send`,
				data
			);
			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const userPhoneNumbers = createAsyncThunk(
	'whatsAppCampaign/GetPhoneNumbers',
	async (_data, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.get(
				`whatsAppCampaign/GetPhoneNumbers`
			);
			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const deleteTemplate = createAsyncThunk(
	'WhatsAppTemplate/DeleteWhatsAppTemplate',
	async (templateId: string, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.delete(
				`WhatsAppTemplate/DeleteWhatsAppTemplate/${templateId}`
			);
			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const duplicateTemplate = createAsyncThunk(
	'WhatsAppTemplate/CloneWhatsAppTemplate',
	async (templateId: string, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.put(
				`WhatsAppTemplate/CloneWhatsAppTemplate/${templateId}`
			);
			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const getAllTemplates = createAsyncThunk(
	'WhatsAppTemplate/GetWhatsAppTemplate',
	async (_data, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`WhatsAppTemplate/GetWhatsAppTemplate`
			);

			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const submitTemplateDirect = createAsyncThunk(
	'WhatsAppTemplate/SubmitWhatsAppTemplateDirect',
	async (data: { id: string }, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`WhatsAppTemplate/SubmitWhatsAppTemplateDirect`,
				data
			);

			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const getAllCampaigns = createAsyncThunk(
	'whatsAppCampaign/GetWhatsAppCampaigns',
	async (_data, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`whatsAppCampaign/GetWhatsAppCampaigns`
			);

			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const deleteCampaign = createAsyncThunk(
	'whatsAppCampaign/DeleteCampaign',
	async (campaignId: string, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.delete(
				`whatsAppCampaign/DeleteCampaign/${campaignId}`
			);
			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const duplicateCampaign = createAsyncThunk(
	'whatsAppCampaign/CloneWhatsAppCampaign',
	async (templateId: string, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.put(
				`whatsAppCampaign/CloneWhatsAppCampaign/${templateId}`
			);
			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const getAllReports = createAsyncThunk(
	'WhatsAppReport/GetWhatsAppReport',
	async (_data, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`WhatsAppReport/GetWhatsAppReport`
			);

			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const getAllGroups = createAsyncThunk(
	'smsCampaign/GetGroupsBySubAccountId',
	async (_, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.get(
				`smsCampaign/GetGroupsBySubAccountId`
			);
			return JSON.parse(response.data);
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const createCombinedGroup = createAsyncThunk(
	'Group/CreateCombinedGroup',
	async (groupsData: apiCombineGroup, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`Group/CreateCombinedGroup`,
				groupsData
			);

			return JSON.parse(response.data);
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const getDirectReport = createAsyncThunk(
	'Whatsapp/GetDirectReport',
	async (data: any, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`Whatsapp/GetDirectReport`,
				data
			);
			response.data.IsExport = data.IsExport;
			return response.data;
		} catch (error: any) {
			return thunkAPI.rejectWithValue({ error: error.message });
		}
	}
);

export const getInboundReport = createAsyncThunk(
	'Whatsapp/GetInboundMessages',
	async (requestData: any, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`Whatsapp/GetInboundMessages`,
				requestData
			);
			response.data.IsExport = requestData.IsExport;
			return response.data;
		} catch (error: any) {
			return thunkAPI.rejectWithValue({ error: error.message });
		}
	}
);

export const getCampaignSettingsById = createAsyncThunk(
	'whatsAppCampaign/GetCampaignSettings',
	async (id: string, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.get(
				`whatsAppCampaign/GetCampaignSettings/${id}`
			);

			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const getCampaignDetailById = createAsyncThunk(
	'whatsAppCampaign/GetWhatsappCampaignDetail',
	async (campaignID: string, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.get(
				`whatsAppCampaign/GetWhatsappCampaignDetail/${campaignID}`
			);

			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const getWhatsappChatContactsByPhoneNumber = createAsyncThunk(
	'WhatsAppChat/GetWhatsAppChatContacts',
	async (
		number: string,
		// data: {
		// 	ispagination: boolean;
		// 	page: number;
		// 	pagesize: number;
		// },
		thunkAPI
	) => {
		try {
			const response = await PulseemReactInstance.post(
				`WhatsAppChat/GetWhatsAppChatContacts`,
				{
					PhoneNumber: number,
					// isPagination: data.ispagination,
					// pageNo: data.page,
					// pageSize: data.pagesize,
				}
			);

			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const getWhatsappChat = createAsyncThunk(
	'WhatsAppChat/GetWhatsAppChat',
	async (
		data: {
			activePhoneNumber: string;
			activeUserNumber: string;
		},
		thunkAPI
	) => {
		try {
			const response = await PulseemReactInstance.post(
				`WhatsAppChat/GetWhatsAppChat`,
				{
					PhoneNumber: data.activePhoneNumber,
					UserNumber: data.activeUserNumber,
				}
			);

			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const getInboundWhatsappChatStatus = createAsyncThunk(
	'WhatsAppChat/GetInboudSessionStatus',
	async (
		data: {
			activePhoneNumber: string;
			activeUserNumber: string;
		},
		thunkAPI
	) => {
		try {
			const response = await PulseemReactInstance.post(
				`WhatsAppChat/GetInboudSessionStatus`,
				{
					PhoneNumber: data.activePhoneNumber,
					UserNumber: data.activeUserNumber,
				}
			);

			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const manageWhatsappChatCoversationStatus = createAsyncThunk(
	'WhatsAppChat/ManageWhatsAppConversationStatus',
	async (
		data: {
			ClientNumber: string;
			Sendernumber: string;
			StatusId: number;
		},
		thunkAPI
	) => {
		try {
			const response = await PulseemReactInstance.post(
				`WhatsAppChat/ManageWhatsAppConversationStatus`,
				{
					Sendernumber: data.Sendernumber,
					ClientNumber: data.ClientNumber,
					StatusId: data.StatusId,
				}
			);

			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const createGroup = createAsyncThunk(
	'Group/Create',
	async (createGroupPayload: ApiCreateGroupPayload, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.put(
				`Group/Create`,
				createGroupPayload
			);
			return JSON.parse(response.data);
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const addRecipients = createAsyncThunk(
	'Client/Upload',
	async (payload: uploadData, thunkAPI) => {
		try {
			const response = await uploaderInstance.put(`Client/Upload`, payload, {
				onUploadProgress: (progressEvent) => {
					const { loaded, total } = progressEvent;
					let percent = Math.floor((loaded * 100) / total);
					thunkAPI.dispatch(setUploadProgress(percent));
				},
			});

			return JSON.parse(response.data);
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const addRecipient = createAsyncThunk(
	'client/AddClients',
	async (payload: uploadData, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`client/AddClients`,
				payload
			);
			return JSON.parse(response.data);
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const getAccountExtraData = createAsyncThunk(
	'smsCampaign/GetAccountExtraData',
	async (_, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.get(
				`smsCampaign/GetAccountExtraData`
			);
			return JSON.parse(response.data);
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const getWhatsAppCampaignSummary = createAsyncThunk(
	'whatsAppCampaign/GetWhatsAppCampaignSummary',
	async (campaignID: string, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.get(
				`whatsAppCampaign/GetWhatsAppCampaignSummary/${campaignID}`
			);
			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const quickSend = createAsyncThunk(
	'whatsAppCampaign/QuickSend',
	async (
		data: { WACampaignID: number; TestGroupsIds: number[] | number },
		thunkAPI
	) => {
		try {
			const response = await PulseemReactInstance.post(
				`whatsAppCampaign/QuickSend`,
				data
			);

			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const whatsappSlice = createSlice({
	name: 'whatsapp',
	initialState: {
		savedTemplates: [],
		submitTemplate: [],
		saveTemplate: [],
		userPhoneNumbers: [],
		ToastMessages: {
			SUCCESS: {
				severity: 'success',
				color: 'success',
				message: 'whatsapp.submitted',
				showAnimtionCheck: true,
			},
			SAVE_SUCCESS: {
				severity: 'success',
				color: 'success',
				message: 'Template saved succesfully',
				showAnimtionCheck: true,
			},
			ERROR: {
				severity: 'error',
				color: 'error',
				message: 'whatsapp.error',
				showAnimtionCheck: true,
			},
			SAVE_CAMPAIGN_SUCCESS: {
				severity: 'success',
				color: 'success',
				message: 'Campaign saved succesfully',
				showAnimtionCheck: true,
			},
			SUBMIT_CAMPAIGN_SUCCESS: {
				severity: 'success',
				color: 'success',
				message: 'Campaign submitted succesfully',
				showAnimtionCheck: true,
			},
			DELETE_CAMPAIGN_SUCCESS: {
				severity: 'success',
				color: 'success',
				message: 'Template deleted succesfully',
				showAnimtionCheck: true,
			},
			DELETE_TEMPLATE_SUCCESS: {
				severity: 'success',
				color: 'success',
				message: 'Template created succesfully',
				showAnimtionCheck: true,
			},
			DUPLICATE_CAMPAIGN_SUCCESS: {
				severity: 'success',
				color: 'success',
				message: 'Campaign cloned succesfully',
				showAnimtionCheck: true,
			},
			INVALID_RECIPIENTS: {
				severity: 'error',
				color: 'error',
				message: 'sms.noRecipientToUpdate',
				showAnimtionCheck: false,
			},
			DATE_PASS: {
				severity: 'error',
				color: 'error',
				message: 'smsReport.pastDateSelected',
				showAnimtionCheck: false,
			},
			CAMPAIGN_SAVE_SUCCESS: {
				severity: 'success',
				color: 'success',
				message: 'Campaign saved succesfully',
				showAnimtionCheck: true,
			},
			UPLOAD_CLIENT_DATA_SUCEESS: {
				severity: 'success',
				color: 'success',
				message: 'campaigns.newsLetterEditor.success',
				showAnimtionCheck: false,
			},
			INVALID_API_MISSING_KEY: {
				severity: 'error',
				color: 'error',
				message: 'campaigns.newsLetterEditor.errors.invaliApiKey',
				showAnimtionCheck: false,
			},
			GENERAL_ERROR: {
				severity: 'error',
				color: 'error',
				message: 'campaigns.newsLetterEditor.errors.generalError',
				showAnimtionCheck: false,
			},
			GROUP_ALREADY_EXIST: {
				severity: 'error',
				color: 'error',
				message: 'group.alreadyExist',
				showAnimtionCheck: false,
			},
			CAMPAIGN_SEND_SUCCESS: {
				severity: 'success',
				color: 'success',
				message: 'Campaign send succesfully',
				showAnimtionCheck: true,
			},
		},
		directWhatsappReport: null,
		inboundWhatsappReport: null,
	},
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(getSavedTemplates.fulfilled, (state, { payload }) => {
			state.savedTemplates = payload;
		});
		builder.addCase(submitTemplates.fulfilled, (state, { payload }) => {
			state.submitTemplate = payload;
		});
		builder.addCase(saveTemplates.fulfilled, (state, { payload }) => {
			state.saveTemplate = payload;
		});
		builder.addCase(userPhoneNumbers.fulfilled, (state, { payload }) => {
			state.userPhoneNumbers = payload;
		});
		builder.addCase(getDirectReport.fulfilled, (state, { payload }) => {
			if (!payload.IsExport) state.directWhatsappReport = payload;
		});
		builder.addCase(getInboundReport.fulfilled, (state, { payload }) => {
			if (!payload.IsExport) state.inboundWhatsappReport = payload;
		});
	},
});

export default whatsappSlice.reducer;
