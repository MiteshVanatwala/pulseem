import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';

export const getDirectReport = createAsyncThunk(
  'Whatsapp/GetDirectReport', async (data, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`Whatsapp/GetDirectReport`, data);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const exportReport = createAsyncThunk(
  'Whatsapp/GetDirectReport', async (data, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`Whatsapp/GetDirectReport`, data);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });


export const whatsappSlice = createSlice({
  name: 'whatsapp',
  initialState: {
    directWhatsappReport: null
  },
  extraReducers: builder => {
    builder.addCase(getDirectReport.fulfilled, (state, { payload }) => {
      state.directWhatsappReport = payload;
    })
  }
})


export default whatsappSlice.reducer