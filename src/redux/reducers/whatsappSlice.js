import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';

export const getDirectReport = createAsyncThunk(
  'Whatsapp/GetDirectReport', async (data, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`Whatsapp/GetDirectReport`, data);
      response.data.IsExport = data.IsExport;
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const getInboundReport = createAsyncThunk(
  'Whatsapp/GetInboundMessages',
  async (requestData, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`Whatsapp/GetInboundMessages`, requestData);
      response.data.IsExport = requestData.IsExport;
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
      if (!payload.IsExport)
        state.directWhatsappReport = payload;
    })
    builder.addCase(getInboundReport.fulfilled, (state, { payload }) => {
      if (!payload.IsExport)
        state.inboundWhatsappReport = payload;
    })
  }
})


export default whatsappSlice.reducer