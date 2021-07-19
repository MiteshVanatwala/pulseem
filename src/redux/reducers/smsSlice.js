import {createSlice,createAsyncThunk} from '@reduxjs/toolkit';
import instence from '../../helpers/api'

export const getSmsData=createAsyncThunk(
  'smsCampaign/getAllSmsCampaigns',async (_,thunkAPI) => {
    try {
      const response=await instence.get(`smsCampaign/getAllSmsCampaigns`);
      return JSON.parse(response.data)
    } catch(error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  })

export const getSmsByID=createAsyncThunk(
  'smsCampaign/GetSmsCampaignById',async (id,thunkAPI) => {
    try {
      const response=await instence.get(`smsCampaign/GetSmsCampaignById/${id}`);
      return JSON.parse(response.data)
    } catch(error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  })

export const restoreSms=createAsyncThunk(
  'smsCampaign/restoreSmsCampaigns',async (deletedsms,thunkAPI) => {
    try {
      const response=await instence.put(`smsCampaign/restoreSmsCampaigns`,deletedsms);
      return response.data
    } catch(error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  })

export const deleteSms=createAsyncThunk(
  'smsCampaign/deleteSmsCampaign',async (id,thunkAPI) => {
    try {
      const response=await instence.delete(`smsCampaign/deleteSmsCampaign/${id}`);
      return response.data
    } catch(error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  })

export const duplicteSms=createAsyncThunk(
  'smsCampaign/cloneSmsCampaign',async (id,thunkAPI) => {
    try {
      const response=await instence.put(`smsCampaign/cloneSmsCampaign/${id}`);
      return response.data
    } catch(error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  })

export const getSmsAuthorizationData=createAsyncThunk(
  'authorization/getAuthorizeNumbers',async (_,thunkAPI) => {
    try {
      const response=await instence.get(`authorization/getAuthorizeNumbers`);
      return JSON.parse(response.data)
    } catch(error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  })

export const getAuthorizeNumbers=createAsyncThunk(
  'GetRelatedSubAccountNumber',async (_,thunkAPI) => {
    try {
      const response=await instence.get(`authorization/getAuthorizeNumbers`,{subID: -1});
      return JSON.parse(response.data)
    } catch(error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  })

export const sendVerificationCode=createAsyncThunk(
  'authorization/newAuthorizeNumbers',async (data,thunkAPI) => {
    const {username='',number=''}=data||{};
    try {
      const response=await instence.put(`authorization/newAuthorizeNumbers/${username}/${number}`);
      return JSON.parse(response.data)
    } catch(error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  })

export const verifyCode=createAsyncThunk(
  'authorization/newAuthorizeNumbers',async (data,thunkAPI) => {
    try {
      const response=await instence.put(`authorization/newAuthorizeNumberInsertCode/${data.phoneNumber}/${data.optinCode}`);
      return JSON.parse(response.data)
    } catch(error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  })

  export const getSmsReport=createAsyncThunk(
    'reports/SmsReport',async (demo=false,thunkAPI) => {
      try {
        const response=await instence.get(`reports/SmsReport?includeTestCampaign=${demo}`);
        return JSON.parse(response.data)
      } catch(error) {
        return thunkAPI.rejectWithValue({error: error.message});
      }
    })

  export const exportSmsReport=createAsyncThunk(
    'report/ExportSmsDirectReport',async (demo=false,thunkAPI) => {
      try {
        const response=await instence.post(`report/ExportSmsReport/${demo}`);
        return JSON.parse(response.data)
      } catch(error) {
        return thunkAPI.rejectWithValue({error: error.message});
      }
    })

export const smsSlice=createSlice({
  name: 'newsletter',
  initialState: {
    smsData: [],
    smsDeletedData: [],
    smsDataError: '',
    authorizationData: [],
    smsReport: [],

  },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getSmsData.fulfilled,(state,{payload}) => {
      state.smsData=payload.filter(row => !row.IsDeleted)
      state.smsDeletedData=payload.filter(row => row.IsDeleted)
    })
    builder.addCase(getSmsData.rejected,(state,action) => {
      state.smsDataError=action.error.message
    })
    builder.addCase(getSmsAuthorizationData.fulfilled,(state,{payload}) => {
      state.authorizationData=payload
    })
    builder.addCase(getSmsReport.fulfilled,(state,{payload}) => {
      state.smsReport=payload
    })
    builder.addCase(duplicteSms.fulfilled,() => console.log('api duplicteSms success'))
    builder.addCase(deleteSms.fulfilled,() => console.log('api deleteSms success'))
    builder.addCase(restoreSms.fulfilled,() => console.log('api restoreSms success'))

    builder.addCase(duplicteSms.rejected,(_,action) => console.log('Error - api duplicteSms: '+action.error))
    builder.addCase(deleteSms.rejected,(_,action) => console.log('Error - api deleteSms: '+action.error))
    builder.addCase(restoreSms.rejected,(_,action) => console.log('Error - api restoreSms: '+action.error))
  }
})



export default smsSlice.reducer