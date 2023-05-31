import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { instence } from '../../helpers/api'
import { PulseemResponse } from '../../Models/APIResponse';
import { ShopifyModel } from '../../Models/Integrations/Shopify/Shopify';
import { IntegrationRequest, LU_Plugin } from '../../Models/Integrations/Integration';

export const authenticate = createAsyncThunk(
    'Integrations/authenticate',
    async (request: IntegrationRequest, thunkAPI) => {
        try {
            const response = await instence.post(`Integrations/authenticate`, request);
            return response.data as PulseemResponse;
        } catch (error) {
            return console.log(error);
        }
    }
);

export const getSettings = createAsyncThunk(
    'Integrations/GetSettings',
    async (integrationSource: LU_Plugin, thunkAPI) => {
        try {
            const response = await instence.get(`Integrations/GetSettings/${integrationSource}`);
            return response.data as PulseemResponse;
        } catch (error) {
            return console.log(error);
        }
    }
);




const IntegrationSlice = createSlice({
    name: 'Integration',
    initialState: {
        authResponse: {
            StatusCode: 200,
            Message: '',
            Data: ''
        } as PulseemResponse,
        integrationSettings: {
            StatusCode: 200,
            Message: '',
            Data: ''
        } as PulseemResponse
    },
    reducers: {
        resetShopIntegration: (state) => {
            state.authResponse = {
                StatusCode: 200,
                Message: '',
                Data: ''
            } as PulseemResponse
        },
        resetIntegrationSettings: (state) => {
            state.authResponse = {
                StatusCode: 200,
                Message: '',
                Data: ''
            } as PulseemResponse
        },

    },
    extraReducers: (builder) => {
        builder.addCase(authenticate.fulfilled, (state, action) => {
            state.authResponse = action.payload as PulseemResponse;
        })
        builder.addCase(getSettings.fulfilled, (state, action) => {
            state.integrationSettings = action.payload as PulseemResponse;
        })

    },
})

export const { resetShopIntegration } = IntegrationSlice.actions
export default IntegrationSlice.reducer