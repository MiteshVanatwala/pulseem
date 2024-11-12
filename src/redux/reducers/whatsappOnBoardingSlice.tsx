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
			return console.log(error);
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

export const whatsappOnBoardingSlice = createSlice({
	name: 'whatsappOnBoardingSlice',
	initialState: {},
	reducers: {},
	extraReducers: () => {},
});

export default whatsappOnBoardingSlice.reducer;
