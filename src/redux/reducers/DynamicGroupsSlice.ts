import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';
import { PulseemResponse } from '../../Models/APIResponse';
import { IntegrationRequest, LU_Plugin } from '../../Models/Integrations/Integration';

export interface ClientExportRequest {
    GroupIds: [] | never,
    NotifyEmail: boolean,
    FileType: any,
    Culture: Number,
    FileName: string
};

export const exportGroupsClients = createAsyncThunk(
    'client/ExportGroupsClients', async (payload: ClientExportRequest, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.post(`client/ExportGroupsClients`, { ...payload });
            return response.data
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const get = createAsyncThunk(
    'DynamicGroups/get',
    async (integrationSource: LU_Plugin, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.get(`DynamicGroups/get/${integrationSource}`);
            return response.data as PulseemResponse;
        } catch (error) {
            return console.log(error);
        }
    }
);

export const set = createAsyncThunk(
    'DynamicGroups/set',
    async (integrationRequest: IntegrationRequest, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.post(`DynamicGroups/set`, integrationRequest);
            return response.data as PulseemResponse;
        } catch (error) {
            return console.log(error);
        }
    }
);

export const deleteGroups = createAsyncThunk(
    'Group/Delete',
    async (payload: [], thunkAPI) => {
        try {
            const response = await PulseemReactInstance.put(`Group/Delete`, payload);
            return response.data as PulseemResponse;
        } catch (error) {
            return console.log(error);
        }
    }
);

export const reset = createAsyncThunk(
    'DynamicGroups/reset',
    async (integrationSource: LU_Plugin, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.put(`DynamicGroups/reset/${integrationSource}`);
            return response.data as PulseemResponse;
        } catch (error) {
            return console.log(error);
        }
    }
);


const DynamicGroupsSlice = createSlice({
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
        // builder.addCase(getIntegration.fulfilled, (state, action) => {
        //     state.integrationSettings = action.payload as PulseemResponse;
        // })
        // builder.addCase(setIntegration.fulfilled, (state, action) => {
        // })
        // builder.addCase(resetIntegration.fulfilled, (state, action) => {
        // })
    },
})

export const { resetShopIntegration } = DynamicGroupsSlice.actions
export default DynamicGroupsSlice.reducer