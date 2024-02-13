import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemResponse } from '../../Models/APIResponse';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';

export const getApiKey = createAsyncThunk(
    'GetKey', async (_, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.get(`ApiSettings/GetKey`);
            return response.data as PulseemResponse
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    })

export const generateApiKey = createAsyncThunk(
    'GenerateNewApiKey', async (_, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.put(`ApiSettings/GenerateNewApiKey`);
            return response.data as PulseemResponse
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    })

export const getDirectRemovals = createAsyncThunk(
    'GetDirectRemovals', async (_, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.get(`ApiSettings/GetDirectRemovals`);
            return response.data as PulseemResponse
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    })


const AccountSettingsSlice = createSlice({
    name: 'ApiSettings',
    initialState: {},
    reducers: {},
    extraReducers: (builder) => { },
})

export default AccountSettingsSlice.reducer