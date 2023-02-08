import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';
import {
	CallToAction,
	JSONPropsText,
	QuickReply,
	TextMedia,
	TextMediaAndButton,
} from '../../screens/Whatsapp/Editor/Types/JSON.types';
import { saveCampaignDataProps } from '../../screens/Whatsapp/Campaign/Types/WhatsappCampaign.types';

type ApiErrorProps = {
	message: string;
};

type ApiGetSavedTemplatesDataProps = {
	templateStatus: number;
};

type ApiSubmitTemplatesDataProps =
	| TextMediaAndButton
	| QuickReply
	| CallToAction
	| TextMedia
	| JSONPropsText
	| undefined;

type ApiSaveCampaignSettingsDataProps = {
	WACampaignID: number;
	SendTypeID: number;
	Groups: number[];
	SendExeptional?: {
		/**
		 * To Send Campaign on particlar occation with dates and groups.
		 * (for example, If you want to send campaign on particular date
		 * and you have selected groups but you don't want to send last
		 * campaign recipients then you can add here)
		 **/
		IsExceptionalroups?: boolean;
		Groups?: number[];
		IsExceptionSmsCampaigns?: boolean;
		Campaigns?: number[];
		ExceptionalDays?: number;
	};
	RandomSettings?: {
		RandomAmount?: number;
	};
	specialsettings?: {
		datefieldid?: number;
		day?: number;
		intervaltypeid?: number;
		sendhour?: string;
	};
	FutureDateTime?: string;
};

type ApiSendCampaignDataProps = {
	WACampaignID: number;
};

type apiCombineGroupProps = {
	GroupIds: number[];
	GroupName: string;
	SubAccountID: number;
};

export const getSavedTemplates = createAsyncThunk(
	'WhatsAppTemplate/GetWhatsAppTemplate',
	async (data: ApiGetSavedTemplatesDataProps, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`WhatsAppTemplate/GetWhatsAppTemplate`,
				data
			);

			return response.data;
		} catch (error) {
			const err = error as ApiErrorProps;
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
			const err = error as ApiErrorProps;
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
			const err = error as ApiErrorProps;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const submitTemplates = createAsyncThunk(
	'WhatsAppTemplate/SubmitWhatsAppTemplate',
	async (data: ApiSubmitTemplatesDataProps, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`WhatsAppTemplate/SubmitWhatsAppTemplate`,
				data
			);

			return response.data;
		} catch (error) {
			const err = error as ApiErrorProps;
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
			const err = error as ApiErrorProps;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const saveTemplates = createAsyncThunk(
	'whatsAppCampaign/SaveWhatsAppTemplate',
	async (data: ApiSubmitTemplatesDataProps, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`whatsAppCampaign/SaveWhatsAppTemplate`,
				data
			);

			return response.data;
		} catch (error) {
			const err = error as ApiErrorProps;
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
			const err = error as ApiErrorProps;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const saveCampaignSettings = createAsyncThunk(
	'whatsAppCampaign/SaveWACampaignSettings',
	async (data: ApiSaveCampaignSettingsDataProps, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`whatsAppCampaign/SaveWACampaignSettings`,
				data
			);

			return response.data;
		} catch (error) {
			const err = error as ApiErrorProps;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const sendCampaign = createAsyncThunk(
	'whatsAppCampaign/Send',
	async (data: ApiSendCampaignDataProps, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`whatsAppCampaign/Send`,
				data
			);

			return response.data;
		} catch (error) {
			const err = error as ApiErrorProps;
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
			const err = error as ApiErrorProps;
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
			const err = error as ApiErrorProps;
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
			const err = error as ApiErrorProps;
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
			const err = error as ApiErrorProps;
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
			const err = error as ApiErrorProps;
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
			const err = error as ApiErrorProps;
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
			const err = error as ApiErrorProps;
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
			const err = error as ApiErrorProps;
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
			const err = error as ApiErrorProps;
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
			const err = error as ApiErrorProps;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const createCombinedGroup = createAsyncThunk(
	'smsCampaign/CreateCombinedGroup',
	async (groupsData: apiCombineGroupProps, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`smsCampaign/CreateCombinedGroup`,
				groupsData
			);

			return response.data;
		} catch (error) {
			const err = error as ApiErrorProps;
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
			const err = error as ApiErrorProps;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const getWhatsappChatContactsByPhoneNumber = createAsyncThunk(
	'WhatsAppChat/GetWhatsAppChatContacts',
	async (number: string, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`WhatsAppChat/GetWhatsAppChatContacts`,
				{ PhoneNumber: number }
			);

			return response.data;
		} catch (error) {
			const err = error as ApiErrorProps;
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
		// getWhatsappChatContactsByPhoneNumber: [],
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
		// builder.addCase(
		// 	getWhatsappChatContactsByPhoneNumber.fulfilled,
		// 	(state, { payload }) => {
		// 		state.getWhatsappChatContactsByPhoneNumber = payload;
		// 	}
		// );
	},
});

export default whatsappSlice.reducer;
