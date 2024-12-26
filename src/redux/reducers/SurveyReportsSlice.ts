import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemResponse } from '../../Models/APIResponse';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';

export const getSurveyDetailsByWebformId = createAsyncThunk(
    'Survey/GetDetailsById', async (id, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.get(`Survey/GetDetailsById/${id}`);
            return response.data as PulseemResponse
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    })

const SurveyReportsSlice = createSlice({
    name: 'SurveyReports',
    initialState: {},
    reducers: {},
    extraReducers: (builder) => { },
})

export default SurveyReportsSlice.reducer