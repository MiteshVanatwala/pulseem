import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';
import {
	CallToAction,
	JSONPropsText,
	QuickReply,
	TextMedia,
	TextMediaAndButton,
} from '../../screens/Whatsapp/Editor/JSON.types';

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

export const whatsappSlice = createSlice({
	name: 'whatsapp',
	initialState: {
		savedTemplates: [],
		submitTemplate: [],
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
	},
});

export default whatsappSlice.reducer;
