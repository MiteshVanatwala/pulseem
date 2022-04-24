import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { instence, uploaderInstance } from '../../helpers/api';

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

export const editGroup = createAsyncThunk(
    'Group/UpdateSettings', async (payload, thunkAPI) => {
        try {
            const response = await instence.put(`Group/UpdateSettings`, payload);
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
export const resetGroups = createAsyncThunk(
    'Group/ClearGroupRecipientData', async (payload, thunkAPI) => {
        try {
            const response = await instence.put(`Group/ClearGroupRecipientData`, payload);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const addRecipient = createAsyncThunk(
    'client/AddClients', async (payload, thunkAPI) => {
        try {
            const response = await instence.post(`client/AddClients`, payload);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const addRecipients = createAsyncThunk(
    'Client/Upload', async (payload, thunkAPI) => {
        try {
            const response = await uploaderInstance.post(`Client/Upload`, payload);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });
export const unsubRecipients = createAsyncThunk(
    'Client/UnsubscribeRecipients', async (payload, thunkAPI) => {
        try {
            const response = await instence.delete(`Client/UnsubscribeRecipients`, { data: payload });
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });
export const deleteRecipients = createAsyncThunk(
    'Client//DeleteRecipientsFromGroups', async (payload, thunkAPI) => {
        try {
            const response = await instence.delete(`Client/DeleteRecipientsFromGroups`, { data: payload });
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
            GROUP_UPDATED: { severity: 'success', color: 'success', message: 'group.updated', showAnimtionCheck: false },
            GROUP_ZERO_SELECT: { severity: 'error', color: 'error', message: 'group.zeroSelected', showAnimtionCheck: false },
            GROUP_INPUT_INCORRECT: { severity: 'error', color: 'error', message: 'group.inputIncorrect', showAnimtionCheck: false },
            GROUP_INVALID_API: { severity: 'error', color: 'error', message: 'group.invalidApi', showAnimtionCheck: false },
            GROUP_ERROR: { severity: 'error', color: 'error', message: 'group.error', showAnimtionCheck: false },
            GROUP_ALREADY_EXIST: { severity: 'error', color: 'error', message: 'group.alreadyExist', showAnimtionCheck: false },
            GROUP_NAME_MAXLENGTH: { severity: 'error', color: 'error', message: 'group.nameMaxLength', showAnimtionCheck: false },
            GROUP_NAME_EMPTY: { severity: 'error', color: 'error', message: 'group.emptyGroupName', showAnimtionCheck: false },
            RECIPIENT_ADDED: { severity: 'success', color: 'success', message: 'recipient.addRecipientSuccess', showAnimtionCheck: false },
            RECIPIENT_INPUT_INCORRECT: { severity: 'error', color: 'error', message: 'recipient.incorrectRecipientInput', showAnimtionCheck: false },
            GROUP_INVALID_ID: { severity: 'error', color: 'error', message: 'group.invalidGroupId', showAnimtionCheck: false },
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
        builder.addCase(editGroup.rejected, (state, { error }) => {
            state.error = error.message;
        })
        builder.addCase(addRecipient.rejected, (state, { error }) => {
            state.error = error.message;
        })
        builder.addCase(deleteGroups.rejected, (_, action) => console.log('Error - api deleteGroups: ' + action.error))
        builder.addCase(unsubRecipients.rejected, (state, { error }) => {
            state.error = error.message;
        })
        builder.addCase(deleteRecipients.rejected, (state, { error }) => {
            state.error = error.message;
        })
        builder.addCase(resetGroups.rejected, (state, { error }) => {
            state.error = error.message;
        })
    }
})

export const { setSelectedGroups } = groupSlice.actions

export default groupSlice.reducer
