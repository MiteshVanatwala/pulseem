import { instence } from '../../helpers/api'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


export const getCampaignById = createAsyncThunk(
    '/CampaignEditor/GetCampaignById/', async (id, thunkAPI) => {
        try {
            const response = await instence.get(`/CampaignEditor/GetCampaignById/${id}`);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const campaignEditorSlice = createSlice({
    name: 'campaignEditor',
    initialState: {
        campaign: null,
    },
    extraReducers: builder => {
        builder
            .addCase(getCampaignById.fulfilled, (state, { payload }) => {
                state.campaign = payload
            })
    }
})



export default campaignEditorSlice.reducer