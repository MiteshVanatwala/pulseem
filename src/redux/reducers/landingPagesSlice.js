import {createSlice,createAsyncThunk} from '@reduxjs/toolkit';
import instence from '../../helpers/api'

export const getLandingPagesData=createAsyncThunk(
  'landingpages/getLandingPages',async (_,thunkAPI) => {
    try {
      const response=await instence.get(`landingpages/getLandingPages`);
      return JSON.parse(response.data)
    } catch(error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  })

export const landingPagesSlice=createSlice({
  name: 'newsletter',
  initialState: {
    landingPagesData: [],
    landingPagesDeletedData: [],
    landingPagesDataError: ''
  },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getLandingPagesData.fulfilled,(state,{payload}) => {
      state.landingPagesData=payload.filter(row => !row.IsDeleted)
      state.landingPagesDeletedData=payload.filter(row => row.IsDeleted)
    })
    builder.addCase(getLandingPagesData.rejected,(state,action) => {
      state.landingPagesDataError=action.error.message
    })
  }
})



export default landingPagesSlice.reducer