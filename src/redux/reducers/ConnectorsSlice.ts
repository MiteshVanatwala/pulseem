import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';

export interface TeamsMessage {
    MethodName: string;
    ComponentName: string;
    Text: string;
}

export const sendToTeamChannel = createAsyncThunk(
    'connectors/SendToTeamChannel',
    async (message: TeamsMessage, thunkAPI) => {
        return null;
        // try {
        //     const { ComponentName = '', MethodName = '' } = message;
        //     const log = {
        //         activityTitle: `Component: ${ComponentName} | Method: ${MethodName}`,
        //         text: message.Text,
        //     }
        //     const response = await PulseemReactInstance.post(`connectors/SendToTeamChannel`, log);
        //     return JSON.parse(response.data)

        // } catch (error) {
        //     return console.log(error);
        // }
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