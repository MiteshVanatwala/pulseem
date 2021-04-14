import {createSlice,createAsyncThunk} from '@reduxjs/toolkit';
import instence from '../../helpers/api'

export const getNewslatterData=createAsyncThunk(
  'email/getEmailCampaigns',async (_,thunkAPI) => {
    try {
      const response=await instence.get(`email/getEmailCampaigns`);
      return JSON.parse(response.data)
    } catch(error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  })

export const apiSlice=createSlice({
  name: 'api',
  initialState: {
    newslettersData: [],
    newslettersDeletedData: [],
    newslettersDataError: ''
  },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getNewslatterData.fulfilled,(state,{payload}) => {
      state.newslettersData=payload.filter(row => !row.IsDeleted)
      state.newslettersDeletedData=payload.filter(row => row.IsDeleted)
    })
    builder.addCase(getNewslatterData.rejected,(state,action) => {
      state.newslettersDataError=action.error.message
    })
  }
})



export default apiSlice.reducer