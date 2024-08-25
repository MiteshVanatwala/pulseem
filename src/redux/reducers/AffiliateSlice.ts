import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemResponse } from '../../Models/APIResponse';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';
import { AffiliateDetails } from '../../Models/Affiliates/Affiliates';

export const getDetails = createAsyncThunk(
    'Affiliate/GetDetails',
    async (timeFrame, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.get(`Affiliate/GetDetails/${timeFrame}`);
            return response.data
        } catch (error) {
            return console.log(error);
        }
    }
);

const AffiliateSlice = createSlice({
    name: 'Affiliates',
    initialState: {
        affiliateDetails: {
            StatusCode: 200,
            Message: '',
            Data: {} as AffiliateDetails,
        } as PulseemResponse,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getDetails.fulfilled, (state, action) => {
            state.affiliateDetails = action.payload;
        })
    },
})

export default AffiliateSlice.reducer