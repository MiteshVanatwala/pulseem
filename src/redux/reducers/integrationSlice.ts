import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';
import { PulseemResponse } from '../../Models/APIResponse';
import { IntegrationRequest, LU_Plugin } from '../../Models/Integrations/Integration';

export const authenticate = createAsyncThunk(
    'Integrations/authenticate',
    async (request: IntegrationRequest, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.post(`Integrations/authenticate`, request);
            return response.data as PulseemResponse;
        } catch (error) {
            return console.log(error);
        }
    }
);

export const getIntegration = createAsyncThunk(
    'Integrations/getIntegration',
    async (integrationSource: LU_Plugin, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.get(`Integrations/GetIntegration/${integrationSource}`);
            return response.data as PulseemResponse;
        } catch (error) {
            return console.log(error);
        }
    }
);

export const setIntegration = createAsyncThunk(
    'Integrations/setIntegration',
    async (integrationRequest: IntegrationRequest, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.post(`Integrations/SetIntegration`, integrationRequest);
            return response.data as PulseemResponse;
        } catch (error) {
            return console.log(error);
        }
    }
);

export const RunIntegrationService = createAsyncThunk(
    'Integrations/RunIntegrationService',
    async (integrationRequest: IntegrationRequest, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.post(`Integrations/RunIntegrationService`, integrationRequest);
            return response.data as PulseemResponse;
        } catch (error) {
            return console.log(error);
        }
    }
);

export const resetIntegration = createAsyncThunk(
    'Integrations/Reset',
    async (integrationSource: LU_Plugin, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.put(`Integrations/Reset/${integrationSource}`);
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
        builder.addCase(getIntegration.fulfilled, (state, action) => {
            state.integrationSettings = action.payload as PulseemResponse;
        })
        builder.addCase(setIntegration.fulfilled, (state, action) => {
        })
        builder.addCase(resetIntegration.fulfilled, (state, action) => {
        })
    },
})

export const { resetShopIntegration } = IntegrationSlice.actions
export default IntegrationSlice.reducer