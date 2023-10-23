import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';
import { PulseemResponse } from '../../Models/APIResponse';

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
    async (groupId: number, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.put(`DynamicGroups/reset/${groupId}`);
            return response.data as PulseemResponse;
        } catch (error) {
            return console.log(error);
        }
    }
);


const DynamicGroupsSlice = createSlice({
    name: 'DynamicGroups',
    initialState: {
        // groups: {
        //     StatusCode: 200,
        //     Message: '',
        //     Data: ''
        // } 
    },
    reducers: {
        // resetGroups: (state) => {
        //     state.groups = {
        //         StatusCode: 200,
        //         Message: '',
        //         Data: ''
        //     } as PulseemResponse
        // }

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

// export const { resetShopIntegration } = DynamicGroupsSlice.actions
export default DynamicGroupsSlice.reducer