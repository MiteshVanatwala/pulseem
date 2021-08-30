import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { instence } from '../../helpers/api';

export const getShortcuts = createAsyncThunk(
    'dashboard/GetShortcuts', async (_, thunkAPI) => {
        try {
            const response = await instence.get(`dashboard/GetShortcuts`);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const setShortcuts = createAsyncThunk(
    'dashboard/SetShortcut', async (data, thunkAPI) => {
        try {
            const response = await instence.post(`dashboard/SetShortcut`, data);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const shortcutSlice = createSlice({
    name: 'dashboard',
    initialState: {
        shortcuts: [],
        shortcutsError: ''
    },
    extraReducers: builder => {
        builder
            .addCase(getShortcuts.fulfilled, (state, { payload }) => {
                state.shortcuts = payload;
            })
            .addCase(getShortcuts.rejected, (state, action) => {
                state.shortcutsError = action.error.message
            })
    }
})


export default shortcutSlice.reducer