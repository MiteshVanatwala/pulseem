import { createSlice } from '@reduxjs/toolkit';

export const groupSlice = createSlice({
    name: 'group',
    initialState: {
        selectedGroups: []
    },
    reducers: {
        setSelectedGroups: (state, action) => {
            state.selectedGroups = action.payload;
        }
    }
})

export const { setSelectedGroups } = groupSlice.actions

export default groupSlice.reducer