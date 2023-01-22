import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { instence } from '../../helpers/api';


export const getDirectReport = createAsyncThunk(
  'Whatsapp/GetDirectReport', async (data, thunkAPI) => {
    try {
      const response = await instence.post(`Whatsapp/GetDirectReport`, data);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const getInboundReport = createAsyncThunk(
  'Whatsapp/GetInboundMessages',
  async (requestData, thunkAPI) => {
    try {
      const response = await instence.post(`Whatsapp/GetInboundMessages`, requestData);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const whatsappSlice = createSlice({
  name: 'whatsapp',
  initialState: {
    directWhatsappReport: null,
    inboundWhatsappReport: null
  },
  extraReducers: builder => {
    builder.addCase(getDirectReport.fulfilled, (state, { payload }) => {
      state.directWhatsappReport = payload;
    })
    builder.addCase(getInboundReport.fulfilled, (state, { payload }) => {
      state.inboundWhatsappReport = payload;
    })
  }
})


export default whatsappSlice.reducer