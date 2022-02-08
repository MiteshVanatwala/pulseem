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


export const groupSlice = createSlice({
    name: 'group',
    initialState: {
        selectedGroups: [],
        subAccountAllGroups: []

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
    }
})

export const { setSelectedGroups } = groupSlice.actions

export default groupSlice.reducer