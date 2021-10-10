import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { instence } from '../../helpers/api';

export const getAccountCards = createAsyncThunk(
  'payment/GetAccountCards', async (_, thunkAPI) => {
    try {
      const response = await instence.get(`Payment/GetAccountCards`);
      return JSON.parse(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
)
export const getTranzillaURL = createAsyncThunk(
  'Payment/GetTranzillaURL', async (culture, thunkAPI) => {
    try {
      const response = await instence.get(`Payment/GetTranzillaURL/${culture}`);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });


export const paymentSlice = createSlice({
  name: 'payment',
  initialState: {
    tranzillaUrl: null,
    creditCards: null
  },
  extraReducers: builder => {
    builder
      .addCase(getTranzillaURL.fulfilled, (state, { payload }) => {
        state.tranzillaUrl = payload
      })
      .addCase(getTranzillaURL.rejected, (state, action) => {
        state.tranzillaUrl = action.error.message
      })
      .addCase(getAccountCards.fulfilled, (state, { payload }) => {
        state.creditCards = payload
      })
      .addCase(getAccountCards.rejected, (state, action) => {
        state.creditCards = action.error.message
      })
  }
})


export default paymentSlice.reducer