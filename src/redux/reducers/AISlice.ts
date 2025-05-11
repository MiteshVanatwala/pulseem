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
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(requestTemplate.fulfilled, (state, action) => {
            state.aiResponse = action.payload;
        })
    },
})

export default AiSlice.reducer