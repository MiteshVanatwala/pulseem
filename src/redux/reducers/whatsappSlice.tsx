import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';

type errorProps = {
	message: string;
};

type getSavedTemplatesDataProps = {
	templateStatus: number;
};

type submitTemplatesDataProps = {
	friendlytemplatename: string;
	templateName: string;
	language: string;
	variables: { [key: string]: string };
	types: {
		text: {
			body: string;
		};
	};
};

export const getSavedTemplates = createAsyncThunk(
	'whatsAppCampaign/GetWhatsAppTemplate',
	async (data: getSavedTemplatesDataProps, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(
				`whatsAppCampaign/GetWhatsAppTemplate`,
				data
			);

			return JSON.parse(response.data);
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

			return JSON.parse(response.data);
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
				message: 'sms.saved',
				showAnimtionCheck: true,
			},
			QUICK_SEND_SUCCESSS: {
				severity: 'success',
				color: 'success',
				message: 'sms.quickSend',
				showAnimtionCheck: true,
			},
			SAVE_SETTINGS: {
				severity: 'success',
				color: 'success',
				message: 'sms.settings_saved',
				showAnimtionCheck: true,
			},
			ERROR: {
				severity: 'error',
				color: 'error',
				message: 'sms.error',
				showAnimtionCheck: true,
			},
			OTP: {
				severity: 'success',
				color: 'success',
				message: 'sms.otpVerifiedSuccess',
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
			SENT_ALREADY: {
				severity: 'success',
				color: 'success',
				message: 'sms.alreadySent',
				showAnimtionCheck: false,
			},
			PROVISION: {
				severity: 'error',
				color: 'error',
				message: 'sms.recipientBlocked',
				showAnimtionCheck: false,
			},
			NO_CREDITS: {
				severity: 'error',
				color: 'error',
				message: 'sms.noCredits',
				showAnimtionCheck: false,
			},
			GROUP_CREATED_SUCCESS: {
				severity: 'success',
				color: 'success',
				message: 'sms.groupSaved',
				showAnimtionCheck: true,
			},
			INVALID_RECIPIENTS: {
				severity: 'error',
				color: 'error',
				message: 'sms.noRecipientToUpdate',
				showAnimtionCheck: false,
			},
			NO_GROUPS: {
				severity: 'error',
				color: 'error',
				message: 'smsReport.NoGroups',
				showAnimtionCheck: false,
			},
			DATE_PASS: {
				severity: 'error',
				color: 'error',
				message: 'smsReport.pastDateSelected',
				showAnimtionCheck: false,
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
