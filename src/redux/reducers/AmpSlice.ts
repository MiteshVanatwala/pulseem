import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemResponse } from '../../Models/APIResponse';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';

export const ampApproval = createAsyncThunk(
  '/Amp/Approval', async (data: string[] = [], thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`Amp/Approval`, data);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

const AmpSlice = createSlice({
  name: 'Amp',
  initialState: {
    account: {
      StatusCode: 200,
      Message: '',
      Data: {} as any,
    } as PulseemResponse,
    ToastMessages: {
      GENERAL_ERROR: { severity: 'error', color: 'error', message: 'campaigns.newsLetterEditor.errors.generalError', showAnimtionCheck: false },
      RESPONSES: {
        201: { severity: 'success', color: 'success', message: 'settings.changePassword.responses.201', showAnimtionCheck: false },
        401: { severity: 'error', color: 'error', message: 'integrations.authResponses.401', showAnimtionCheck: false },
        500: { severity: 'error', color: 'error', message: 'campaigns.newsLetterEditor.errors.generalError', showAnimtionCheck: false }
      }
    }
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(ampApproval.fulfilled, (state, action) => {
      state.account = action.payload;
    })
  }
})

export default AmpSlice.reducer