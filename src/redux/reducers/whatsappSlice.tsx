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

type apiErrorProps = {
	message: string;
};

type apiGetSavedTemplatesDataProps = {
	templateStatus: number;
};

type apiGetSavedTemplatesDataByIdProps = {
	templateId: string;
};

type apiSubmitTemplatesDataProps =
	| TextMediaAndButton
	| QuickReply
	| CallToAction
	| TextMedia
	| JSONPropsText
	| undefined;

type apiSaveCampaignSettingsDataProps = {
	WACampaignID: number;
	SendTypeID: number;
	Groups: number[];
	SendExeptional?: {
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

type apiSendCampaignDataProps = {
	WACampaignID: number;
};

type apiCombineGroupProps = {
	GroupIds: number[];
	GroupName: string;
	SubAccountID: number;
};

export const getSavedTemplates = createAsyncThunk(
	'WhatsAppTemplate/GetWhatsAppTemplate',
	async (data: apiGetSavedTemplatesDataProps, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`WhatsAppTemplate/GetWhatsAppTemplate`,
				data
			);

			return response.data;
		} catch (error) {
			const err = error as apiErrorProps;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const getSavedTemplatesById = createAsyncThunk(
	'WhatsAppTemplate/GetWhatsAppTemplate',
	async (data: apiGetSavedTemplatesDataByIdProps, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`WhatsAppTemplate/GetWhatsAppTemplate`,
				data
			);

			return response.data;
		} catch (error) {
			const err = error as apiErrorProps;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const submitTemplates = createAsyncThunk(
	'WhatsAppTemplate/SubmitWhatsAppTemplate',
	async (data: apiSubmitTemplatesDataProps, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`WhatsAppTemplate/SubmitWhatsAppTemplate`,
				data
			);

			return response.data;
		} catch (error) {
			const err = error as apiErrorProps;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const uploadMedia = createAsyncThunk(
	'whatsAppCampaign/UploadWhatsAppMediaFile',
	async (data: FormData, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`whatsAppCampaign/UploadWhatsAppMediaFile`,
				data
			);

			return response.data;
		} catch (error) {
			const err = error as apiErrorProps;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const saveTemplates = createAsyncThunk(
	'whatsAppCampaign/SaveWhatsAppTemplate',
	async (data: apiSubmitTemplatesDataProps, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`whatsAppCampaign/SaveWhatsAppTemplate`,
				data
			);

			return response.data;
		} catch (error) {
			const err = error as apiErrorProps;
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
			const err = error as apiErrorProps;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const saveCampaignSettings = createAsyncThunk(
	'whatsAppCampaign/SaveWACampaignSettings',
	async (data: apiSaveCampaignSettingsDataProps, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`whatsAppCampaign/SaveWACampaignSettings`,
				data
			);

			return response.data;
		} catch (error) {
			const err = error as apiErrorProps;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const sendCampaign = createAsyncThunk(
	'whatsAppCampaign/Send',
	async (data: apiSendCampaignDataProps, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`whatsAppCampaign/Send`,
				data
			);

			return response.data;
		} catch (error) {
			const err = error as apiErrorProps;
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
			const err = error as apiErrorProps;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const deleteTemplate = createAsyncThunk(
	'WhatsAppTemplate/DeleteWhatsAppTemplate',
	async (templateId: string, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.get(
				`WhatsAppTemplate/DeleteWhatsAppTemplate/${templateId}`
			);
			return response.data;
		} catch (error) {
			const err = error as apiErrorProps;
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
			const err = error as apiErrorProps;
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
			const err = error as apiErrorProps;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const getAllReports = createAsyncThunk(
	'whatsAppCampaign/GetWhatsAppReport',
	async (_data, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`whatsAppCampaign/GetWhatsAppReport`
			);

			return response.data;
		} catch (error) {
			const err = error as apiErrorProps;
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
			const err = error as apiErrorProps;
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
			const err = error as apiErrorProps;
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
				message: 'Campaign submitted succesfully',
				showAnimtionCheck: true,
			},
			DELETE_CAMPAIGN_SUCCESS: {
				severity: 'success',
				color: 'success',
				message: 'Template deleted succesfully',
				showAnimtionCheck: true,
			},
		},
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
	},
});

export default whatsappSlice.reducer;
