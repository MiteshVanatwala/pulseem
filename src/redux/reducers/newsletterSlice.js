import {createSlice,createAsyncThunk} from '@reduxjs/toolkit';
import { instence } from '../../helpers/api'
import { exportFile } from '../../helpers/exportFromJson';

export const getNewslatterData=createAsyncThunk(
  'email/getEmailCampaigns',async (_,thunkAPI) => {
    try {
      const response=await instence.get(`email/getEmailCampaigns`);
      return JSON.parse(response.data)
    } catch(error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  })

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

export const downloadNewsletterReport=createAsyncThunk(
  'email/EmailReportsByIds',async (array=[],thunkAPI) => {
    try {
      var json = [];
      for (var i = 0; i<= array.length; i++){
        if (array[i]){
          json.push({ ID: array[i] });
        }
      }

      const response=await instence.post('email/EmailReportsByIds/', json);

      exportFile({ 
        data: JSON.parse(response.data), 
        fileName: 'emailReport', 
        exportType: 'xls'
      });

    } catch(err) {
      return thunkAPI.rejectWithValue({error: err.message});
    }
  }
)

export const newsletterSlice=createSlice({
  name: 'newsletter',
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
    builder.addCase(restoreCampaigns.fulfilled,() => {console.log('api restoreCampaigns success')})
    builder.addCase(deleteCampaign.fulfilled,() => {console.log('api deleteCampaign success')})
    builder.addCase(duplicteCampaign.fulfilled,() => {console.log('api duplicteCampaign success')})

    builder.addCase(restoreCampaigns.rejected,(_,action) => {console.log('Error - api restoreCampaigns: '+action.error)})
    builder.addCase(deleteCampaign.rejected,(_,action) => {console.log('Error - deleteCampaign: '+action.error)})
    builder.addCase(duplicteCampaign.rejected,(_,action) => {console.log('Error - duplicteCampaign: '+action.error)})
  }
})



export default newsletterSlice.reducer