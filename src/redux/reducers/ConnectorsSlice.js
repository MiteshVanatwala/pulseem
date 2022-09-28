import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';

export const sendToTeamChannel = createAsyncThunk(
    'connectors/SendToTeamChannel',
    async (data, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.post(`connectors/SendToTeamChannel`, data);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    }
);

export const ConnectorsSlice = createSlice({
    name: 'Connectors',
    initialState: {
        result: null
    }
})


export default ConnectorsSlice.reducer