import {createSlice,createAsyncThunk} from '@reduxjs/toolkit';
import instence from '../../helpers/api'

export const getMmsData=createAsyncThunk(
  'mms/getMmsCampaigns',async (_,thunkAPI) => {
    try {
      const response=await instence.get(`mms/getMmsCampaigns`);
      return JSON.parse(response.data)
    } catch(error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  })

export const mmsSlice=createSlice({
  name: 'newsletter',
  initialState: {
    mmsData: [],
    mmsDeletedData: [],
    mmsDataError: ''
  },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getMmsData.fulfilled,(state,{payload}) => {
      state.mmsData=payload.filter(row => !row.IsDeleted)
      state.mmsDeletedData=payload.filter(row => row.IsDeleted)
    })
    builder.addCase(getMmsData.rejected,(state,action) => {
      state.mmsDataError=action.error.message
    })
  }
})



export default mmsSlice.reducer