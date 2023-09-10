import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';

export const deleteFromGroups = createAsyncThunk(
  'client/DeleteFromGroups', async (id, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.delete(`client/DeleteFromGroups/${id}`);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const removeEmailClient = createAsyncThunk(
  'client/RemoveEmailClient', async (id, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.put(`client/RemoveEmailClient/${id}`);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const removeSmsClient = createAsyncThunk(
  'client/RemoveSmsClient', async (id, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.put(`client/RemoveSmsClient/${id}`);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const reactivateEmail = createAsyncThunk(
  'client/ReactivateEmail', async (payload, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.put(`client/ReactivateEmail`, payload);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const reactivateSms = createAsyncThunk(
  'client/ReactivateSms', async (payload, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.put(`client/ReactivateSms`, payload);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const makeInvalidClients = createAsyncThunk(
  'client/SetInvalidClients', async (payload, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`client/SetInvalidClients`, payload);
      return JSON.parse(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const searchAllClients = createAsyncThunk(
  'client/Get', async (payload, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`client/Get`, payload);
      return JSON.parse(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const searchAdvancedClients = createAsyncThunk(
  'client/Search', async (payload, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`client/Search`, payload);
      return JSON.parse(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const AddClientsToGroup = createAsyncThunk(
  'client/AddClientsToGroup', async (payload, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`client/AddClientsToGroup`, payload);
      return JSON.parse(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const getExportData = createAsyncThunk(
  'client/GetExportData', async (payload, thunkAPI) => {
    try {
      //const dispatch = useDispatch()
      const response = await PulseemReactInstance.post(`Client/GetExportData`, payload
        ,
        {
          onDownloadProgress: progressEvent => {
            const total = parseFloat(progressEvent.srcElement.getResponseHeader('content-length'))
            const loaded = progressEvent.currentTarget.response.length

            let percent = Math.floor(loaded * 100 / total);
            thunkAPI.dispatch(setDownloadProgress(percent));
          },
        });

      ///return { payload: { StatusCode: response?.data?.StatusCode, Clients: response.data } }
      return response?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
)
export const setUnsubscribedClients = createAsyncThunk(
  'client/SetUnsubscribedClients', async (payload, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`client/SetUnsubscribedClients`, { ...payload });
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });
export const changeClientStatus = createAsyncThunk(
  'client/ChangeClientStatus', async (payload, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.put(`client/ChangeClientStatus`, { ...payload });
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });
export const getClientsById = createAsyncThunk(
  'client/GetClientsById', async (payload, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`client/GetClientsById`, payload);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });
export const exportGroupsClients = createAsyncThunk(
  'client/ExportGroupsClients', async (payload, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`client/ExportGroupsClients`, { ...payload });
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const clientSlice = createSlice({
  name: 'client',
  initialState: {
    ClientData: null,
    TotalCount: 0,
    TotalRevenue: 0,
    CampaignClicks: 0,
    error: "",
    downloadProgress: 0,
    ToastMessages: {
      SUCCESS: { severity: 'success', color: 'success', message: 'common.Success', showAnimtionCheck: false },
      CLIENT_ZERO_SELECT: { severity: 'error', color: 'error', message: 'client.errors.zeroSelected', showAnimtionCheck: false },
      RECIPIENT_ADDED_TO_GROUP: { severity: 'success', color: 'success', message: 'recipient.addRecipientsToGroupSucceeded', showAnimtionCheck: false },
      GROUP_INPUT_INCORRECT: { severity: 'error', color: 'error', message: 'group.inputIncorrect', showAnimtionCheck: false },
      GROUP_INVALID_API: { severity: 'error', color: 'error', message: 'group.invalidApi', showAnimtionCheck: false },
      GROUP_ERROR: { severity: 'error', color: 'error', message: 'group.error', showAnimtionCheck: false },
      GROUP_ALREADY_EXIST: { severity: 'error', color: 'error', message: 'group.alreadyExist', showAnimtionCheck: false },
      SOMETHING_WENT_WRONG: { severity: 'error', color: 'error', message: 'client.errors.somethingWentWrong', showAnimtionCheck: false },
      GENERIC_ERROR: { severity: 'error', color: 'error', message: 'client.errors.genericError', showAnimtionCheck: false },
      RECIPIENT_DELETED_FROM_GROUP: { severity: 'success', color: 'success', message: 'recipient.recipientDeletedSuccessfuly', showAnimtionCheck: false },
      RECIPIENTS_DELETED_FROM_GROUP: { severity: 'success', color: 'success', message: 'recipient.recipientsDeletedSuccessfuly', showAnimtionCheck: false },
      AUTOMATION_CLIENTS_UPDATED: { severity: 'success', color: 'success', message: 'client.automationClientsUpdated', showAnimtionCheck: false },
      NO_CLIENTS_FOUND: { severity: 'success', color: 'success', message: 'client.errors.noClientsFound', showAnimtionCheck: false },
      UNSUBSCRIBED_SUCCESS: { severity: 'success', color: 'success', message: 'recipient.unsubscribed.succeeded', showAnimtionCheck: false },
      UNSUBSCRIBED_IN_PROGRESS: { severity: 'success', color: 'success', message: 'recipient.unsubscribed.inProgress', showAnimtionCheck: false },
      SET_INVALID_SUCCESS: { severity: 'success', color: 'success', message: 'client.setInvalidSucceeded', showAnimtionCheck: false },
      STATUS_UPDATED: { severity: 'success', color: 'success', message: 'client.statusUpdated', showAnimtionCheck: false },
      INVALID_CLIENT_ID: { severity: 'error', color: 'error', message: 'client.errors.invalidClientId', showAnimtionCheck: false },
      RECIPIENT_ADDED: { severity: 'success', color: 'success', message: 'recipient.addRecipientSuccess', showAnimtionCheck: false },
      RECIPIENT_UPDATED: { severity: 'success', color: 'success', message: 'recipient.updateRecipientSuccess', showAnimtionCheck: false },
      RECIPIENT_INPUT_INCORRECT: { severity: 'error', color: 'error', message: 'recipient.incorrectRecipientInput', showAnimtionCheck: false },
      CAMPAIGN_DELETED_SUCCESS: { severity: 'success', color: 'success', message: 'campaigns.newsLetterEditor.sendSettings.deleted', showAnimtionCheck: false },
    }
  },
  reducers: {
    setDownloadProgress: (state, action) => {
      state.downloadProgress = action.payload;

    }
  },
  extraReducers: builder => {
    builder.addCase(searchAllClients.fulfilled, (state, { payload }) => {
      state.ClientData = payload.Clients;
      state.TotalCount = payload.TotalCount;
      state.TotalRevenue = payload.TotalRevenue;
      state.CampaignClicks = payload.CampaignClicks ?? 0;
    })
    builder.addCase(searchAdvancedClients.fulfilled, (state, { payload }) => {
      state.ClientData = payload.Clients;
      state.TotalCount = payload.TotalCount;
      state.TotalRevenue = payload.TotalRevenue;
      state.CampaignClicks = payload.CampaignClicks ?? 0;
    })
    builder.addCase(searchAllClients.rejected, (state, { error }) => {
      state.error = error.message;
    })
    builder.addCase(searchAdvancedClients.rejected, (state, { error }) => {
      state.error = error.message;
    })
    builder.addCase(getExportData.fulfilled, (state, { payload }) => {
      state.downloadProgress = null;
    })
  }
})


export const { setDownloadProgress } = clientSlice.actions
export default clientSlice.reducer