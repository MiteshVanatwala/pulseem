import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';

export const getAccountCards = createAsyncThunk(
  'payment/GetAccountCards', async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`Payment/GetAccountCards`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
)
export const getTranzillaURL = createAsyncThunk(
  'Payment/GetTranzillaURL', async (culture, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`Payment/GetTranzillaURL/${culture}`);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const buyPackage = createAsyncThunk(
  'Payment/BuyPackage', async (data, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`Payment/BuyPackage`, data);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const getPaymentURL = createAsyncThunk(
  'Payment/GetPaymentURL', async (data, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`Payment/GetPaymentURL`, data);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const getGlobalPaymentURL = createAsyncThunk(
  'Payment/GetGlobalAccountPaymentURL', async (data, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`Payment/GetGlobalAccountPaymentURL`, data);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const paymentSlice = createSlice({
  name: 'payment',
  initialState: {
    tranzillaUrl: null,
    paymentUrl: null,
    globalPaymentUrl: null,
    creditCards: null,
    paymentConfirmation: null,
    dialogMaxWidth: null
  },
  reducers: {
    setDialogWidth: (state, action) => {
      state.dialogMaxWidth = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getPaymentURL.fulfilled, (state, { payload }) => {
        state.paymentUrl = payload
      })
      .addCase(getPaymentURL.rejected, (state, action) => {
        state.paymentUrl = action.error.message
      })
      .addCase(getGlobalPaymentURL.fulfilled, (state, { payload }) => {
        state.globalPaymentUrl = payload
      })
      .addCase(getGlobalPaymentURL.rejected, (state, action) => {
        state.globalPaymentUrl = action.error.message
      })
      .addCase(getTranzillaURL.fulfilled, (state, { payload }) => {
        state.tranzillaUrl = payload
      })
      .addCase(getTranzillaURL.rejected, (state, action) => {
        state.tranzillaUrl = action.error.message
      })
      .addCase(getAccountCards.fulfilled, (state, { payload }) => {
        state.creditCards = payload?.Data
      })
      .addCase(getAccountCards.rejected, (state, action) => {
        state.creditCards = null
      })
      .addCase(buyPackage.fulfilled, (state, { payload }) => {
        state.paymentConfirmation = payload
      })
      .addCase(buyPackage.rejected, (state, action) => {
        state.paymentConfirmation = action.error.message
      })
  }
})

export const { setDialogWidth } = paymentSlice.actions
export default paymentSlice.reducer