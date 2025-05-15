import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemResponse } from '../../Models/APIResponse';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';
import { AnthropicUserRequest } from '../../Models/AI/Anthropic';

export const requestTemplate = createAsyncThunk(
    'AI/Anthropic/RequestTemplate',
    async (request: AnthropicUserRequest, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.post(`AI/Anthropic/RequestTemplate`, request);
            return response.data
        } catch (error) {
            return console.log(error);
        }
    }
);

const AiSlice = createSlice({
    name: 'Ai',
    initialState: {
        aiResponse: {
            StatusCode: 200,
            Message: '',
            Data: {} as any,
        } as PulseemResponse,
        ToastMessages: {
            RESPONSES: {
                201: { severity: 'success', color: 'success', message: 'settings.changePassword.responses.201', showAnimtionCheck: false },
                400: { severity: 'error', color: 'error', message: 'AI.responses.400', showAnimtionCheck: false },
                401: { severity: 'error', color: 'error', message: 'AI.responses.401', showAnimtionCheck: false },
                403: { severity: 'error', color: 'error', message: 'AI.responses.403', showAnimtionCheck: false },
                404: { severity: 'error', color: 'error', message: 'AI.responses.404', showAnimtionCheck: false },
                405: { severity: 'error', color: 'error', message: 'AI.responses.405', showAnimtionCheck: false },
                413: { severity: 'error', color: 'error', message: 'AI.responses.413', showAnimtionCheck: false },
                429: { severity: 'error', color: 'error', message: 'AI.responses.429', showAnimtionCheck: false },
                500: { severity: 'error', color: 'error', message: 'AI.responses.500', showAnimtionCheck: false },
                529: { severity: 'error', color: 'error', message: 'AI.responses.529', showAnimtionCheck: false }
            }
        },
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(requestTemplate.fulfilled, (state, action) => {
            state.aiResponse = action.payload;
        })
    },
})

export default AiSlice.reducer