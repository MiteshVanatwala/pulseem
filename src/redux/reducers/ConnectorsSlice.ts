import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';

export const sendToTeamChannel = createAsyncThunk(
    'connectors/SendToTeamChannel',
    async (data: any, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.post(`connectors/SendToTeamChannel`, data);
            return JSON.parse(response.data)
        } catch (error) {
            return console.log(error);
        }
    }
);

interface LogState {
    result: string
}

const initialState = {
    result: ''
} as LogState

const ConnectorsSlice = createSlice({
    name: 'Connectors',
    initialState,
    reducers: {
        // fill in primary logic here
    },
    extraReducers: (builder) => {
        builder.addCase(sendToTeamChannel.pending, (state, action) => {
            // both `state` and `action` are now correctly typed
            // based on the slice state and the `pending` action creator
        })
    },
})

export default ConnectorsSlice.reducer