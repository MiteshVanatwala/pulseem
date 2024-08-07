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

const ampSlice = createSlice({
  name: 'amp',
  initialState: {
    account: {
      StatusCode: 200,
      Message: '',
      Data: {} as any,
    } as PulseemResponse
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(ampApproval.fulfilled, (state, action) => {
      state.account = action.payload;
    })
  }
})

export default ampSlice.reducer