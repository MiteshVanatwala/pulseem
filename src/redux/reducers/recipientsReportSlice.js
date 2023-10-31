import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';

export const getRecipientsReport = createAsyncThunk(
    'dashboard/GetRecipientsReport', async (_, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.get(`dashboard/GetRecipientsReport`);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const getRecipientsReportData = createAsyncThunk(
    'RecipientReport/Get',
    async (settings, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.post(`RecipientReport/Get`, settings);
            return response.data
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    }
);

const initialState = {
    recipientsReport: null,
    recipientsReportData: null,
    recipientsReportError: ''
}

export const recipientsReportSlice = createSlice({
    name: 'recipientReports',
    initialState: initialState,
    reducers: {
        resetRecipientReportData: (state = initialState) => {
            state.recipientsReportData = null;
        }
    },
    extraReducers: builder => {
        builder
            .addCase(getRecipientsReport.fulfilled, (state, { payload }) => {
                state.recipientsReport = payload
            })
            .addCase(getRecipientsReport.rejected, (state, action) => {
                state.recipientsReportError = action.error.message
            })
            .addCase(getRecipientsReportData.fulfilled, (state, { payload }) => {
                state.recipientsReportData = payload.Data
            })
    }
})

export const { resetRecipientReportData } = recipientsReportSlice.actions;
export default recipientsReportSlice.reducer