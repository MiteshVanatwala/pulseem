import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';
import { PulseemResponse } from '../../Models/APIResponse';

type ApiError = {
	message: string;
};

export const getWhatsAppSMSVirtualNumbers = createAsyncThunk(
	'WhatsAppAccountOnBoard/GetWhatsAppSMSVirtualNumbers',
	async (_, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.get(
				`WhatsAppAccountOnBoard/GetWhatsAppSMSVirtualNumbers`
			);

			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const getWhatsAppCodeVirtualNumbers = createAsyncThunk(
	'WhatsAppAccountOnBoard/GetWhatsAppCodeVirtualNumbers',
	async (_, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.get(
				`WhatsAppAccountOnBoard/GetWhatsAppCodeVirtualNumbers`
			);

			return response.data;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const facebookLogin = createAsyncThunk(
	'WhatsAppAccountOnBoard/SaveWhatsappMetaClients',
	async (request: any, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(`WhatsAppAccountOnBoard/SaveWhatsappMetaClients`, request);
			return response.data as PulseemResponse;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const getMetaBusinessVerficationStatus = createAsyncThunk(
	'WhatsAppAccountOnBoard/GetMetaBusinessVerficationStatus',
	async (request: any, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.get(`WhatsAppAccountOnBoard/GetMetaBusinessVerficationStatus`, request);
			return response.data as PulseemResponse;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const getMetaPhoneNumbers = createAsyncThunk(
	'WhatsAppAccountOnBoard/GetMetaPhoneNumbers',
	async (request: any, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(`WhatsAppAccountOnBoard/GetMetaPhoneNumbers`, request);
			return response.data as PulseemResponse;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const MetaPhoneRegister = createAsyncThunk(
	'WhatsAppAccountOnBoard/MetaPhoneRegister',
	async (request: any, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(`WhatsAppAccountOnBoard/MetaPhoneRegister`, request);
			return response.data as PulseemResponse;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const setCoexistenceMode = createAsyncThunk(
	'WhatsAppAccountOnBoard/SetCoexistenceMode',
	async (request: { enable: boolean; phone_number: string; message_service_id: string }, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(`WhatsAppAccountOnBoard/SetCoexistenceMode`, request);
			return response.data as PulseemResponse;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

// Triggers Meta's one-time backfill of the last 6 months of chats and contacts for a
// coexistence number. Meta accepts this once per onboarding, within 24 hours.
export const syncCoexistenceHistoryRecords = createAsyncThunk(
	'WhatsAppAccountOnBoard/SyncCoexistenceHistoryRecords',
	async (request: { phone_number: string; message_service_id: string }, thunkAPI) => {
		try {
			const response = await PulseemReactInstance.post(`WhatsAppAccountOnBoard/SyncCoexistenceHistoryRecords`, request);
			return response.data as PulseemResponse;
		} catch (error) {
			const err = error as ApiError;
			return thunkAPI.rejectWithValue({ error: err.message });
		}
	}
);

export const whatsappOnBoardingSlice = createSlice({
	name: 'whatsappOnBoardingSlice',
	initialState: {},
	reducers: {},
	extraReducers: () => {},
});

export default whatsappOnBoardingSlice.reducer;
