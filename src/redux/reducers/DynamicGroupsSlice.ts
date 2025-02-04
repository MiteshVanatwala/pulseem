import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';
import { PulseemResponse } from '../../Models/APIResponse';

export interface ClientExportRequest {
    GroupIds: [] | never,
    NotifyEmail: boolean,
    FileType: any,
    Culture: Number,
    FileName: string,
    ExportGroupNames: string | any | never
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

export const getById = createAsyncThunk(
    'DynamicGroups/GetById',
    async (groupId: number | any, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.get(`DynamicGroups/GetById/${groupId}`);
            return response.data as PulseemResponse;
        } catch (error) {
            return console.log(error);
        }
    }
);


export const save = createAsyncThunk(
    'DynamicGroups/Save',
    async (groupData: any, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.post(`DynamicGroups/Save`, groupData);
            return response.data as PulseemResponse;
        } catch (error) {
            return console.log(error);
        }
    }
);




const DynamicGroupsSlice = createSlice({
    name: 'dynamicGroups',
    initialState: {
        dynamicGroup: {
            StatusCode: 200,
            Message: '',
            Data: null
        } as PulseemResponse
    },
    reducers: {
    },
    extraReducers: (builder) => {
        builder.addCase(getById.fulfilled, (state, action) => {
            state.dynamicGroup = action.payload as PulseemResponse;
        })
    },
})

export default DynamicGroupsSlice.reducer