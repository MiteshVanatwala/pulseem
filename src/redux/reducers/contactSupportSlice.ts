import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemResponse } from '../../Models/APIResponse';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';

export interface ContactUsRequest {
    FirstName: string;
    LastName: string;
    PhoneNumber: string;
    Email: string;
    Website: string;
    Message: string;
    CloudflareCaptchaToken: string;
}

export const submitContactForm = createAsyncThunk(
    'ContactSupport/SubmitContactForm',
    async (request: ContactUsRequest, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.post(
                '/contactus',
                request
            );
            return response.data as PulseemResponse;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

interface ContactSupportState {
    loading: boolean;
    response: PulseemResponse | null;
    error: string | null;
}

const initialState: ContactSupportState = {
    loading: false,
    response: null,
    error: null,
};

const contactSupportSlice = createSlice({
    name: 'contactSupport',
    initialState,
    reducers: {
        clearContactSupportState: (state) => {
            state.loading = false;
            state.response = null;
            state.error = null;
        },
        resetContactSupport: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(submitContactForm.pending, (state) => {
                state.loading = true;
                state.response = null;
                state.error = null;
            })
            .addCase(submitContactForm.fulfilled, (state, action) => {
                state.loading = false;
                state.response = action.payload;
                state.error = null;
            })
            .addCase(submitContactForm.rejected, (state, action) => {
                state.loading = false;
                state.response = null;
                state.error = action.payload as string;
            });
    },
});

export const { clearContactSupportState, resetContactSupport } = contactSupportSlice.actions;
export default contactSupportSlice.reducer;