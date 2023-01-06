import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';

export const getCompanyDetails = createAsyncThunk(
    'settings/companyDetails', async (_, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.get(`settings/companyDetails`);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });
export const getAccountDetails = createAsyncThunk(
    'settings/accountDetails', async (_, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.get(`settings/accountDetails`);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const updateCompanyDetails = createAsyncThunk(
    'settings/updateCompanyDetails', async (payload, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.put(`settings/updateCompanyDetails`, payload);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });
export const updateAccountDetails = createAsyncThunk(
    'settings/updateAccountDetails', async (payload, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.put(`settings/updateAccountDetails`, payload);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });


export const settingsSlice = createSlice({
    name: 'settings',
    initialState: {
        companyDetails: {},
        accuntDetails: {},
        error: "",
        ToastMessages: {
            GENERAL_ERROR: { severity: 'error', color: 'error', message: 'campaigns.newsLetterEditor.errors.generalError', showAnimtionCheck: false },
        }
    },
    extraReducers: builder => {
        builder.addCase(getCompanyDetails.fulfilled, (state, { payload }) => {
            state.companyDetails = payload;
        })
        builder.addCase(getAccountDetails.fulfilled, (state, { payload }) => {
            state.accuntDetails = payload;
        })
        builder.addCase(updateCompanyDetails.rejected, (state, { error }) => {
            state.error = error.message;
        })
        builder.addCase(updateAccountDetails.rejected, (state, { error }) => {
            state.error = error.message;
        })
    }
})


export default settingsSlice.reducer
