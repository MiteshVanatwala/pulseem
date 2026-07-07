import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemResponse } from '../../Models/APIResponse';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';

export const getMcpTokens = createAsyncThunk(
    'McpTokens/GetAll', async (_, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.get('mcp-tokens');
            return response.data as PulseemResponse;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    })

export const createMcpToken = createAsyncThunk(
    'McpTokens/Create', async (label: string, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.post('mcp-tokens', { label });
            return response.data as PulseemResponse;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    })

export const deactivateMcpToken = createAsyncThunk(
    'McpTokens/Deactivate', async (id: number, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.delete(`mcp-tokens/${id}`);
            return response.data as PulseemResponse;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    })

const McpTokensSlice = createSlice({
    name: 'McpTokens',
    initialState: {},
    reducers: {},
    extraReducers: () => {},
})

export default McpTokensSlice.reducer;
