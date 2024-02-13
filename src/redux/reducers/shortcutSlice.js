import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';

export const getShortcuts = createAsyncThunk(
    'dashboard/GetShortcuts', async (_, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.get(`dashboard/GetShortcuts`);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const setShortcuts = createAsyncThunk(
    'dashboard/SetShortcut', async (data, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.post(`dashboard/SetShortcut`, data);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const deleteShortcuts = createAsyncThunk(
    'dashboard/DeleteShortcut', async (id, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.delete(`dashboard/DeleteShortcut/${id}`);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const shortcutSlice = createSlice({
    name: 'shortcuts',
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