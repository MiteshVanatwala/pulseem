import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemResponse } from '../../Models/APIResponse';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';
import { BillingAccount } from '../../Models/Product/BillingAccount';

export const getAccountBilling = createAsyncThunk(
    'AccountBilling/Get',
    async (_, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.get(`AccountBilling/Get`);
            return response.data
        } catch (error) {
            return console.log(error);
        }
    }
);
export const updateAccountBilling = createAsyncThunk(
    'AccountBilling/Update',
    async (data: BillingAccount, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.post(`AccountBilling/Update`, data);
            return response.data
        } catch (error) {
            return console.log(error);
        }
    }
);

export const getCreditCardIframe = createAsyncThunk(
    'AccountBilling/GetAddCreditCardIframeURL',
    async (culture: string, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.get(`AccountBilling/GetAddCreditCardIframeURL/${culture}`);
            return response.data as PulseemResponse
        } catch (error) {
            return console.log(error);
        }
    }
);
export const getPurchaseHistory = createAsyncThunk(
    'AccountBilling/GetPurchaseHistory',
    async (_, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.get(`AccountBilling/GetPurchaseHistory`);
            return response.data as PulseemResponse
        } catch (error) {
            return console.log(error);
        }
    }
);


const BillingSlice = createSlice({
    name: 'AccountSettings',
    initialState: {
        billing: { Data: null, Message: '', StatusCode: 100 } as PulseemResponse
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getAccountBilling.fulfilled, (state, action) => {
            state.billing = action.payload as PulseemResponse;
        })
    },
})

export default BillingSlice.reducer