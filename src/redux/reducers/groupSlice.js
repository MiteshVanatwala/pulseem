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
    'Group/Get', async (data, thunkAPI) => {
        try {
            const response = await instence.post(`Group/Get`, data);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const createGroup = createAsyncThunk(
    'Group/Create', async (payload, thunkAPI) => {
        try {
            const response = await instence.put(`Group/Create`, payload);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const deleteGroups = createAsyncThunk(
    'Group/Delete', async (payload, thunkAPI) => {
        try {
            const response = await instence.put(`Group/Delete`, payload);
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
        groupData: null,
        error: "",
        ToastMessages: {
            GROUP_CREATED: { severity: 'success', color: 'success', message: 'group.created', showAnimtionCheck: false },
          }
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
            state.groupData = payload;
        })
        builder.addCase(createGroup.rejected, (state, { error }) => {
            state.error = error.message;
        })
        builder.addCase(deleteGroups.rejected, (_, action) => console.log('Error - api deleteGroups: ' + action.error))
    }
})

export const { setSelectedGroups } = groupSlice.actions

export default groupSlice.reducer