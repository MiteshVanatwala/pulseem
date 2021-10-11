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
  'Payment/GetTranzillaURL', async (_, thunkAPI) => {
    try {
      const response = await instence.get(`Payment/GetTranzillaURL/`);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

  export const buyPackage = createAsyncThunk(
    'Payment/BuyPackage', async (data, thunkAPI) => {
      try {
        const response = await instence.post(`Payment/BuyPackage`, data);
        return JSON.parse(response.data)
      } catch (error) {
        return thunkAPI.rejectWithValue({ error: error.message });
      }
    });


export const paymentSlice = createSlice({
  name: 'payment',
  initialState: {
    tranzillaUrl: null,
    creditCards: null,
    paymentConfirmation: null
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
      .addCase(buyPackage.fulfilled, (state, { payload }) => {
        state.paymentConfirmation = payload
      })
      .addCase(buyPackage.rejected, (state, action) => {
        state.paymentConfirmation = action.error.message
      })
  }
})


export default paymentSlice.reducer