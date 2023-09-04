import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';
import { uploaderInstance } from '../../helpers/Api/UploaderAPI'

export const getGroupsBySubAccountId = createAsyncThunk(
    'Group/GetGroupsBySubAccountId', async (_, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.get(`Group/GetGroupsBySubAccountId`);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const getGroups = createAsyncThunk(
    'Group/Get', async (data, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.post(`Group/Get`, data);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const createGroup = createAsyncThunk(
    'Group/Create', async (payload, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.put(`Group/Create`, payload);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const editGroup = createAsyncThunk(
    'Group/UpdateSettings', async (payload, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.put(`Group/UpdateSettings`, payload);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const deleteGroups = createAsyncThunk(
    'Group/Delete', async (payload, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.put(`Group/Delete`, payload);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });
export const resetGroups = createAsyncThunk(
    'Group/ClearGroupRecipientData', async (payload, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.put(`Group/ClearGroupRecipientData`, payload);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const addRecipient = createAsyncThunk(
    'client/AddClients', async (payload, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.post(`client/AddClients`, payload);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const addRecipients = createAsyncThunk(
    'Client/Upload', async (payload, thunkAPI) => {
        try {
            //const dispatch = useDispatch()
            const response = await uploaderInstance.put(`Client/Upload`, payload
                ,
                {
                    onUploadProgress: (progressEvent) => {
                        const { loaded, total } = progressEvent
                        let percent = Math.floor(loaded * 100 / total);
                        thunkAPI.dispatch(setUploadProgress(percent));
                    }
                });

            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });
export const unsubRecipients = createAsyncThunk(
    'Client/UnsubscribeRecipients', async (payload, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.delete(`Client/UnsubscribeRecipients`, { data: payload });
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });
export const deleteRecipients = createAsyncThunk(
    'Client/DeleteRecipientsFromGroups', async (payload, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.delete(`Client/DeleteRecipientsFromGroups`, { data: payload });
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });
export const getGroupsForSimplyClub = createAsyncThunk(
    'Group/GetExternalGroups', async (payload, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.post(`Group/GetExternalGroups`, { ...payload });
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });
export const getExternalClientsByGroups = createAsyncThunk(
    'Group/GetExternalClientsByGroups', async (payload, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.post(`Group/GetExternalClientsByGroups`, { ...payload });
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const combinedGroup = createAsyncThunk(
    'group/CreateCombinedGroup', async (data, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.post(`group/CreateCombinedGroup`, data);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    })
export const createAndGetGroupIdForManualSend = createAsyncThunk(
    'Group/CreateAndGetGroupIdForManualSend', async (campaignType, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.get(`Group/CreateAndGetGroupIdForManualSend/${campaignType}`);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const groupSlice = createSlice({
    name: 'group',
    initialState: {
        defaultGroupId: -1,
        selectedGroups: [],
        subAccountAllGroups: [],
        groupData: null,
        error: "",
        uploadProgress: null,
        ToastMessages: {
            GROUP_CREATED: { severity: 'success', color: 'success', message: 'group.created', showAnimtionCheck: false },
            GROUP_UPDATED: { severity: 'success', color: 'success', message: 'group.updated', showAnimtionCheck: false },
            GROUP_DELETED: { severity: 'success', color: 'success', message: 'group.deleted', showAnimtionCheck: false },
            UNSUBSCRIBE_SUCCESS: { severity: 'success', color: 'success', message: 'recipient.unsubscribed.succeeded', showAnimtionCheck: false },
            GROUP_ZERO_SELECT: { severity: 'error', color: 'error', message: 'group.zeroSelected', showAnimtionCheck: false },
            GROUP_INPUT_INCORRECT: { severity: 'error', color: 'error', message: 'group.inputIncorrect', showAnimtionCheck: false },
            GROUP_INVALID_API: { severity: 'error', color: 'error', message: 'group.invalidApi', showAnimtionCheck: false },
            GROUP_ERROR: { severity: 'error', color: 'error', message: 'group.error', showAnimtionCheck: false },
            GROUP_ALREADY_EXIST: { severity: 'error', color: 'error', message: 'group.alreadyExist', showAnimtionCheck: false },
            GROUP_NAME_MAXLENGTH: { severity: 'error', color: 'error', message: 'group.nameMaxLength', showAnimtionCheck: false },
            GROUP_NAME_EMPTY: { severity: 'error', color: 'error', message: 'group.emptyGroupName', showAnimtionCheck: false },
            RECIPIENT_ADDED: { severity: 'success', color: 'success', message: 'recipient.addRecipientSuccess', showAnimtionCheck: false },
            RECIPIENT_UPDATED: { severity: 'success', color: 'success', message: 'recipient.updateRecipientSuccess', showAnimtionCheck: false },
            RECIPIENT_INPUT_INCORRECT: { severity: 'error', color: 'error', message: 'recipient.incorrectRecipientInput', showAnimtionCheck: false },
            GROUP_INVALID_ID: { severity: 'error', color: 'error', message: 'group.invalidGroupId', showAnimtionCheck: false },
            FEATURE_NOT_ALLOWED: { severity: 'error', color: 'error', message: 'group.responses.featureNotAllowed', showAnimtionCheck: false },
            SIMPLY_NOT_FOUND: { severity: 'error', color: 'error', message: 'group.responses.notFound', showAnimtionCheck: false },
            RECIPIENTS_NOT_FOUND: { severity: 'error', color: 'error', message: "recipient.responses.notFound", showAnimtionCheck: false },
            NO_RECIPIENTS_IN_GROUP: { severity: 'error', color: 'error', message: "recipient.responses.noRecipientsInGroup", showAnimtionCheck: false },
            ERROR_OCCURED: { severity: 'error', color: 'error', message: 'common.ErrorOccured', showAnimtionCheck: false },
            IMPORT_EMPTYLIST_INVALID_CLIENT: { severity: 'error', color: 'error', message: "recipient.importResponses.listEmptyOrClientInvalid", showAnimtionCheck: false },
            IMPORT_NO_FOLDER_FOUND: { severity: 'error', color: 'error', message: "recipient.importResponses.noFolderFound", showAnimtionCheck: false },
            IMPORT_GENERIC_ERROR: { severity: 'error', color: 'error', message: "recipient.importResponses.genericError", showAnimtionCheck: false },
            SERVER_FOUND_NO_RESPONSE: { severity: 'error', color: 'error', message: "recipient.responses.serverFoundWithNoResponse", showAnimtionCheck: false },
            UNAUTORIZED_RESPONSE: { severity: 'error', color: 'error', message: "'recipient.responses.unautorized'", showAnimtionCheck: false },
            RECIPIENTS_DELETED_FROM_GROUP: { severity: 'success', color: 'success', message: 'recipient.recipientsDeletedSuccessfuly', showAnimtionCheck: false },
            RECIPIENTS_DELETED_NOT_FOUND_RECORDS: { severity: 'error', color: 'error', message: 'recipient.noRecordsFound', showAnimtionCheck: false },
            UNSUBSCRIBE_LIMIT: { severity: 'error', color: 'error', message: 'recipient.maximumRecordLimitation', showAnimtionCheck: false },
            MAX_GROUPS_EXCEEDED: { severity: 'error', color: 'error', message: 'group.maxGroupsExceeded', showAnimtionCheck: false },
            UPLOADING_RECIPIENT_AS_FILE: { severity: 'success', color: 'success', message: 'recipient.importResponses.fileUploaded', showAnimtionCheck: false },
        }
    },
    reducers: {
        setSelectedGroups: (state, action) => {
            state.selectedGroups = action.payload;
        },
        setUploadProgress: (state, action) => {
            state.uploadProgress = action.payload;

        }
    },
    extraReducers: builder => {
        builder.addCase(getGroupsBySubAccountId.fulfilled, (state, { payload }) => {
            state.subAccountAllGroups = payload;
        })
        builder.addCase(getGroups.fulfilled, (state, { payload }) => {
            state.groupData = payload;
        })
        builder.addCase(combinedGroup.fulfilled, (state, action) => {
            state.subAccountAllGroups.push(action.payload);
        })
        builder.addCase(createAndGetGroupIdForManualSend.fulfilled, (state, { payload }) => {
            state.defaultGroupId = payload;
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
        builder.addCase(getGroupsForSimplyClub.rejected, (state, { error }) => {
            state.error = error.message;
        })
        builder.addCase(getExternalClientsByGroups.rejected, (state, { error }) => {
            state.error = error.message;
        })
        builder.addCase(addRecipients.fulfilled, (state, { payload }) => {
            state.uploadProgress = null;
        })
    }
})

export const { setSelectedGroups, setUploadProgress } = groupSlice.actions

export default groupSlice.reducer
