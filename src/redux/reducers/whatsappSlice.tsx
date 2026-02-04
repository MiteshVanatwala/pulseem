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
	ApiSendCampaignData,
	saveCampaignDataProps,
	SaveQuickSendGroupReq,
	TestSendReq,
	uploadData,
	WhatsappAgent,
	WhatsappPhoneSession,
} from '../../screens/Whatsapp/Campaign/Types/WhatsappCampaign.types';
import { uploaderInstance } from '../../helpers/Api/UploaderAPI';
import { setUploadProgress } from './groupSlice';
import {
	APIGetWhatsappChatContactsReq,
	APISendWhatsAppChatReqPayload,
} from '../../screens/Whatsapp/Chat/Types/WhatsappChat.type';
import {
	AllCampaignReq,
	AllReportReq,
	AllTemplateReq,
} from '../../screens/Whatsapp/management/Types/Management.types';

type ApiError = {
	message: string;
};

type ApiGetSavedTemplatesData = {
	templateStatus?: number;
	TemplateId?: string;
};

type ApiQuickResponsePayload = {
	ID: number;
	Text?: string;
	IsDelete?: boolean;
};

type ApiSubmitTemplatesData =
	| TextMediaAndButton
	| QuickReply
	| CallToAction
	| TextMedia
	| JSONPropsText
	| undefined;

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
	async (data: AllTemplateReq, thunkAPI) => {
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
	async (data: AllCampaignReq, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`whatsAppCampaign/GetWhatsAppCampaigns`,
				data
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
	async (data: AllReportReq, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`WhatsAppReport/GetWhatsAppReport`,
				data
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
		{
			PhoneNumber,
			IsPagination,
			pageNo,
			pageSize,
			Searchtext,
			ChatStatus,
			StartDate,
			EndDate,
		}: APIGetWhatsappChatContactsReq,
		thunkAPI
	) => {
		try {
			const response = await PulseemReactInstance.post(
				`WhatsAppChat/GetWhatsAppChatContacts`,
				{
					PhoneNumber,
					IsPagination,
					pageNo,
					pageSize,
					Searchtext,
					ChatStatus,
					StartDate,
					EndDate,
				}
			);

			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const getWhatsappChatContactsByUserNumber = createAsyncThunk(
	'WhatsAppChat/GetWhatsAppChatContacts',
	async (
		{
			PhoneNumber,
			IsPagination = false,
			pageNo = 1,
			pageSize = 6,
			UserNumber,
		}: APIGetWhatsappChatContactsReq,
		thunkAPI
	) => {
		try {
			const response = await PulseemReactInstance.post(
				`WhatsAppChat/GetWhatsAppChatContacts`,
				{
					PhoneNumber,
					IsPagination,
					pageNo,
					pageSize,
					UserNumber,
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
					const { loaded, total = 0 } = progressEvent;
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
	async (data: TestSendReq, thunkAPI) => {
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

export const restoreWhatsAppCampaigns = createAsyncThunk(
	'whatsAppCampaign/RestoreWhatsAppCampaigns',
	async (data: number[], thunkAPI) => {
		try {
			const response = await PulseemReactInstance.put(
				`whatsAppCampaign/RestoreWhatsAppCampaigns`,
				data
			);
			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const sendWhatsAppMessage = createAsyncThunk(
	'WhatsAppChat/SendWhatsAppChat',
	async (data: APISendWhatsAppChatReqPayload, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`WhatsAppChat/SendWhatsAppChat`,
				data
			);

			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const saveQuickSendGroups = createAsyncThunk(
	'whatsAppCampaign/SaveQuickSendGroups',
	async (data: SaveQuickSendGroupReq, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`whatsAppCampaign/SaveQuickSendGroups`,
				data
			);

			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const updateWhatsappTier = createAsyncThunk(
	'whatsAppCampaign/WhatsappTierUpdate',
	async (tier: string, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`whatsAppCampaign/WhatsappTierUpdate`,
				{ WhatsappTierID: tier }
			);

			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

//#region Agents
export const getChatAgents = createAsyncThunk(
	'WhatsAppChat/GetAgents',
	async (_data, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.get(
				`WhatsAppChat/GetAgents`
			);
			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);
export const getWhatsappChatContactsByAgent = createAsyncThunk(
	'WhatsAppChat/GetWhatsAppChatByAgent',
	async (
		{
			AgentId,
			IsPagination,
			pageNo,
			pageSize,
			Searchtext,
			ChatStatus,
			StartDate,
			EndDate
		}: APIGetWhatsappChatContactsReq,
		thunkAPI
	) => {
		try {
			const response = await PulseemReactInstance.post(
				`WhatsAppChat/GetWhatsAppChatByAgent`,
				{
					AgentId,
					IsPagination,
					pageNo,
					pageSize,
					Searchtext,
					ChatStatus,
					StartDate,
					EndDate
				}
			);

			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const addChatAgent = createAsyncThunk(
	'WhatsAppChat/AddAgent',
	async (agentName: string, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`WhatsAppChat/AddAgent`,
				{
					Name: agentName,
					IsDeleted: false
				}
			);

			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);
export const editChatAgent = createAsyncThunk(
	'WhatsAppChat/AddAgent',
	async (agent: WhatsappAgent, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`WhatsAppChat/AddAgent`,
				{
					AgentId: agent.AgentId,
					Name: agent.Name,
					IsDeleted: agent.IsDeleted
				} as WhatsappAgent
			);

			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);
export const assignAgentToChat = createAsyncThunk(
	'WhatsAppChat/AssignAgentToChat',
	async (agentToSession: WhatsappPhoneSession, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.put(`WhatsAppChat/AssignAgentToChat`, agentToSession);
			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const getQuickResponses = createAsyncThunk(
	'WhatsappPreDefinedFixText/Get',
	async (_, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.get(
				`WhatsappPreDefinedFixText/Get`
			);
			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const saveQuickResponse = createAsyncThunk(
	'WhatsappPreDefinedFixText/Save',
	async (data: ApiQuickResponsePayload, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`WhatsappPreDefinedFixText/Save`,
				data
			);
			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const deleteQuickResponse = createAsyncThunk(
	'WhatsappPreDefinedFixText/Delete',
	async (id: number, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`WhatsappPreDefinedFixText/Save`,
				{
					ID: id,
					IsDelete: true
				}
			);
			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);


//#endregion

export const whatsappSlice = createSlice({
	name: 'whatsapp',
	initialState: {
		savedTemplates: [],
		submitTemplate: [],
		saveTemplate: [],
		userPhoneNumbers: [],
		agentList: [],
		quickResponses: [],
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
				message: 'whatsappCampaign.saveTemplate',
				showAnimtionCheck: true,
			},
			ERROR: {
				severity: 'error',
				color: 'error',
				message: 'whatsapp.error',
				showAnimtionCheck: false,
			},
			SAVE_CAMPAIGN_SUCCESS: {
				severity: 'success',
				color: 'success',
				message: 'whatsappCampaign.saveCampaign',
				showAnimtionCheck: true,
			},
			SUBMIT_CAMPAIGN_SUCCESS: {
				severity: 'success',
				color: 'success',
				message: 'whatsappCampaign.submitTemplate',
				showAnimtionCheck: true,
			},
			DELETE_CAMPAIGN_SUCCESS: {
				severity: 'success',
				color: 'success',
				message: 'whatsappCampaign.deleteCampaign',
				showAnimtionCheck: true,
			},
			DELETE_TEMPLATE_SUCCESS: {
				severity: 'success',
				color: 'success',
				message: 'whatsappCampaign.deleteTemplate',
				showAnimtionCheck: true,
			},
			DUPLICATE_TEMPLATE_SUCCESS: {
				severity: 'success',
				color: 'success',
				message: 'whatsappCampaign.duplicateTemplate',
				showAnimtionCheck: true,
			},
			DUPLICATE_CAMPAIGN_SUCCESS: {
				severity: 'success',
				color: 'success',
				message: 'whatsappCampaign.cloneCampaign',
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
				message: 'whatsappCampaign.saveCampaign',
				showAnimtionCheck: true,
			},
			UPLOAD_CLIENT_DATA_SUCEESS: {
				severity: 'success',
				color: 'success',
				message: 'campaigns.newsLetterEditor.success',
				showAnimtionCheck: true,
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
				message: 'whatsappCampaign.sendCampaign',
				showAnimtionCheck: true,
			},
			RESTORE_CAMPAIGN_SUCCESS: {
				severity: 'success',
				color: 'success',
				message: 'whatsappCampaign.restoreCampaign',
				showAnimtionCheck: true,
			},
			GROUP_CREATED_SUCCESS: {
				severity: 'success',
				color: 'success',
				message: 'sms.groupSaved',
				showAnimtionCheck: true,
			},
			TEMPLATE_ALREADY_EXIST: {
				severity: 'error',
				color: 'error',
				message: 'whatsapp.templateNamePlaceholder',
				showAnimtionCheck: true,
			},
			INVALID_NUMBER: {
				severity: 'error',
				color: 'error',
				message: 'sms.invalidNumber',
				showAnimtionCheck: false,
			},
			QUICK_SEND_ERROR: {
				severity: 'error',
				color: 'error',
				message: 'sms.errorQuickSend',
				showAnimtionCheck: false,
			},
			AGENT_ADDED: {
				severity: 'success',
				color: 'success',
				message: 'whatsappChat.agentAdded',
				showAnimtionCheck: false,
			},
			AGENT_DELETED: {
				severity: 'success',
				color: 'success',
				message: 'whatsappChat.agentDeleted',
				showAnimtionCheck: false,
			},
			AGENT_UPDATED: {
				severity: 'success',
				color: 'success',
				message: 'whatsappChat.agentUpdated',
				showAnimtionCheck: false,
			},
			QUICK_RESPONSE_SAVED: {
				severity: 'success',
				color: 'success',
				message: 'whatsappChat.quickResponseSaved',
				showAnimtionCheck: true,
			},
			QUICK_RESPONSE_DELETED: {
				severity: 'success',
				color: 'success',
				message: 'whatsappChat.quickResponseDeleted',
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
			if (!payload.IsExport) {
				const jsonMessage = JSON.parse(payload?.Message);
				state.directWhatsappReport = { ...payload, Message: jsonMessage };

			}
		});
		builder.addCase(getInboundReport.fulfilled, (state, { payload }) => {
			if (!payload.IsExport) state.inboundWhatsappReport = payload;
		});
		builder.addCase(getChatAgents.fulfilled, (state, { payload }) => {
			state.agentList = payload?.Data;
		});
		builder.addCase(getQuickResponses.fulfilled, (state, { payload }) => {
			state.quickResponses = payload?.Data || [];
		});
	},
});

export default whatsappSlice.reducer;
