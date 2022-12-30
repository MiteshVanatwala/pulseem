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
	saveCampaignDataProps,
} from '../../screens/Whatsapp/Campaign/Types/WhatsappCampaign.types';

type errorProps = {
	message: string;
};

type getSavedTemplatesDataProps = {
	templateStatus: number;
};

type submitTemplatesDataProps =
	| TextMediaAndButton
	| QuickReply
	| CallToAction
	| TextMedia
	| JSONPropsText
	| undefined;

type saveCampaignSettingsDataProps = {
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

type sendCampaignDataProps = {
	WACampaignID: number;
};

export const getSavedTemplates = createAsyncThunk(
	'whatsAppCampaign/GetWhatsAppTemplate',
	async (data: getSavedTemplatesDataProps, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`whatsAppCampaign/GetWhatsAppTemplate`,
				data
			);

			return response.data;
		} catch (error) {
			const err = error as errorProps;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const submitTemplates = createAsyncThunk(
	'whatsAppCampaign/SubmitWhatsAppTemplate',
	async (data: submitTemplatesDataProps, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`whatsAppCampaign/SubmitWhatsAppTemplate`,
				data
			);

			return response.data;
		} catch (error) {
			const err = error as errorProps;
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
			const err = error as errorProps;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const saveTemplates = createAsyncThunk(
	'whatsAppCampaign/SaveWhatsAppTemplate',
	async (data: submitTemplatesDataProps, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`whatsAppCampaign/SaveWhatsAppTemplate`,
				data
			);

			return response.data;
		} catch (error) {
			const err = error as errorProps;
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
			const err = error as errorProps;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const saveCampaignSettings = createAsyncThunk(
	'whatsAppCampaign/SaveWACampaignSettings',
	async (data: saveCampaignSettingsDataProps, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`whatsAppCampaign/SaveWACampaignSettings`,
				data
			);

			return response.data;
		} catch (error) {
			const err = error as errorProps;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const sendCampaign = createAsyncThunk(
	'whatsAppCampaign/Send',
	async (data: sendCampaignDataProps, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`whatsAppCampaign/Send`,
				data
			);

			return response.data;
		} catch (error) {
			const err = error as errorProps;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const fromPhoneNumbers = createAsyncThunk(
	'whatsAppCampaign/GetPhoneNumbers',
	async (_data, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.get(
				`whatsAppCampaign/GetPhoneNumbers`
			);
			return response.data;
		} catch (error) {
			const err = error as errorProps;
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
		fromPhoneNumbers: [],
		ToastMessages: {
			SUCCESS: {
				severity: 'success',
				color: 'success',
				message: 'whatsapp.submitted',
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
		builder.addCase(fromPhoneNumbers.fulfilled, (state, { payload }) => {
			state.fromPhoneNumbers = payload;
		});
	},
});

export default whatsappSlice.reducer;
