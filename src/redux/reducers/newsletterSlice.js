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

export const getNewsletterReports=createAsyncThunk(
  'email/GetEmailReports/',async (demo=false,thunkAPI) => {
    try {
      const response=await instence.get(`email/GetEmailReports/${demo}`)
      return JSON.parse(response.data)
    } catch(error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  }
)

export const restoreCampaigns=createAsyncThunk(
  'email/restoreEmailCampaigns',async (deletedCampaigns,thunkAPI) => {
    try {
      const response=await instence.put(`email/restoreEmailCampaigns`,deletedCampaigns);
      return response.data
    } catch(error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  })

export const deleteCampaign=createAsyncThunk(
  'email/deleteEmailCampaign/',async (id,thunkAPI) => {
    try {
      const response=await instence.delete(`email/deleteEmailCampaign/${id}`);
      return response.data
    } catch(error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  })

export const duplicteCampaign=createAsyncThunk(
  'email/cloneCampaign',async (id,thunkAPI) => {
    try {
      const response=await instence.put(`email/cloneCampaign/${id}`);
      return response.data
    } catch(error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  })

export const newsletterSlice=createSlice({
  name: 'newsletter',
  initialState: {
    newslettersData: [],
    newslettersDeletedData: [],
    newslettersDataError: '',
    newslettersReports: [],
    newslettersReportsError: ''
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
    builder.addCase(getNewsletterReports.fulfilled,(state,{payload}) => {
      state.newslettersReports=payload
    })
    builder.addCase(getNewsletterReports.rejected,(state,action) => {
      state.newslettersReportsError=action.error.message
    })
    builder.addCase(restoreCampaigns.fulfilled,() => {console.log('api restoreCampaigns success')})
    builder.addCase(deleteCampaign.fulfilled,() => {console.log('api deleteCampaign success')})
    builder.addCase(duplicteCampaign.fulfilled,() => {console.log('api duplicteCampaign success')})

    builder.addCase(restoreCampaigns.rejected,(_,action) => {console.log('Error - api restoreCampaigns: '+action.error)})
    builder.addCase(deleteCampaign.rejected,(_,action) => {console.log('Error - deleteCampaign: '+action.error)})
    builder.addCase(duplicteCampaign.rejected,(_,action) => {console.log('Error - duplicteCampaign: '+action.error)})
  }
})



export default newsletterSlice.reducer