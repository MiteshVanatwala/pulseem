import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { instence } from '../../helpers/api';

export const getGroupsBySubAccountId = createAsyncThunk(
    'Group/GetGroupsBySubAccountId', async (_, thunkAPI) => {
        try {
            const response = await instence.get(`Group/GetGroupsBySubAccountId`);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const getGroups = createAsyncThunk(
    'api/Group/Get', async (_, thunkAPI) => {
        try {
            const response = await instence.get(`api/Group/Get`);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const createGroup = createAsyncThunk(
    '/api/Group/Create', async (payload, thunkAPI) => {
        try {
            const response = await instence.delete(`/api/Group/Create`, payload);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const deleteGroups = createAsyncThunk(
    '/api/Group/Delete', async (payload, thunkAPI) => {
        try {
            const response = await instence.delete(`/api/Group/Delete`, payload);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });


export const groupSlice = createSlice({
    name: 'group',
    initialState: {
        selectedGroups: [],
        subAccountAllGroups: [],
        groupData: [],
        error: ""
    },
    reducers: {
        setSelectedGroups: (state, action) => {
            state.selectedGroups = action.payload;
        }
    },
    extraReducers: builder => {
        builder.addCase(getGroupsBySubAccountId.fulfilled, (state, { payload }) => {
            state.subAccountAllGroups = payload;
        })
        builder.addCase(getGroups.fulfilled, (state, { payload }) => {
            state.groupData = payload.Groups;
        })
        builder.addCase(createGroup.rejected, (state, { error }) => {
            state.error = error.message;
        })
        builder.addCase(deleteGroups.rejected, (_, action) => console.log('Error - api deleteGroups: ' + action.error))
    }
})

export const { setSelectedGroups } = groupSlice.actions

export default groupSlice.reducer