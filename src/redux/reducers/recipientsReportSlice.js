import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { instence } from '../../helpers/api';

export const getRecipientsReport = createAsyncThunk(
    'dashboard/GetRecipientsReport', async (_, thunkAPI) => {
        try {
            const response = await instence.get(`dashboard/GetRecipientsReport`);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const recipientsReportSlice = createSlice({
    name: 'recipientReports',
    initialState: {
        recipientsReport: [],
        recipientsReportError: ''
    },
    extraReducers: builder => {
        builder
            .addCase(getRecipientsReport.fulfilled, (state, { payload }) => {
                state.recipientsReport = payload
            })
            .addCase(getRecipientsReport.rejected, (state, action) => {
                state.recipientsReportError = action.error.message
            })
    }
})


export default recipientsReportSlice.reducer