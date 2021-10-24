import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { instence } from '../../helpers/api'

export const getSmsData = createAsyncThunk(
  'smsCampaign/getAllSmsCampaigns', async (_, thunkAPI) => {
    try {
      const response = await instence.get(`smsCampaign/getAllSmsCampaigns`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

  export const getSMSVirtualNumber = createAsyncThunk(
    'smsCampaign/GetAccountVirtualNumber', async (number, thunkAPI) => {
      try {
        const response = await instence.get(`smsCampaign/GetAccountVirtualNumber/${number}`);
        return JSON.parse(response.data)
      } catch (error) {
        return thunkAPI.rejectWithValue({ error: error.message });
      }
    })
 

export const getCommonFeatures = createAsyncThunk(
  'GetSubAccountWithFeatureAndSettings', async (_, thunkAPI) => {
    try {
      const response = await instence.get(`GetSubAccountWithFeatureAndSettings`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })
export const getTestGroups = createAsyncThunk(
  'smsCampaign/GetTestGroups', async (_, thunkAPI) => {
    try {
      const response = await instence.get(`smsCampaign/GetTestGroups`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })
export const getPreviousLandingData = createAsyncThunk(
  'smsCampaign/GetLastLandingPages', async (_, thunkAPI) => {
    try {
      const response = await instence.get(`smsCampaign/GetLastLandingPages`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })
export const getPreviousCampaignData = createAsyncThunk(
  'smsCampaign/GetLastCampaings', async (_, thunkAPI) => {
    try {
      const response = await instence.get(`smsCampaign/GetLastCampaings`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })
export const getAccountExtraData = createAsyncThunk(
  'smsCampaign/GetAccountExtraData', async (_, thunkAPI) => {
    try {
      const response = await instence.get(`smsCampaign/GetAccountExtraData`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })
export const getGroupsBySubAccountId = createAsyncThunk(
  'smsCampaign/GetGroupsBySubAccountId', async (_, thunkAPI) => {
    try {
      const response = await instence.get(`smsCampaign/GetGroupsBySubAccountId`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const getCreditsforSMS = createAsyncThunk(
  'smsCampaign/GetCreditsForSms', async (count, thunkAPI) => {
    try {
      const response = await instence.get(`smsCampaign/GetCreditsForSms/${count}`);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const getSmsByID = createAsyncThunk(
  'smsCampaign/GetSmsCampaignById', async (id, thunkAPI) => {
    try {
      const response = await instence.get(`smsCampaign/GetSmsCampaignById/${id}`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const getSMSDirectReport = createAsyncThunk(
  'report/GetSmsDirectReport', async (data, thunkAPI) => {
    try {
      const response = await instence.post(`report/GetSmsDirectReport`, data);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })
  export const getSMSRequestOTP = createAsyncThunk(
    'RequestOTP', async (data, thunkAPI) => {
      try {
        const response = await instence.post(`RequestOTP`, data);
        return JSON.parse(response.data)
      } catch (error) {
        return thunkAPI.rejectWithValue({ error: error.message });
      }
    })
    export const getSMSConfirmOTP = createAsyncThunk(
      'ConfirmOTP', async (data, thunkAPI) => {
        try {
          const response = await instence.post(`ConfirmOTP`, data);
          return JSON.parse(response.data)
        } catch (error) {
          return thunkAPI.rejectWithValue({ error: error.message });
        }
      })
export const saveManualClients = createAsyncThunk(
  'smsCampaign/SaveManualClients', async (data, thunkAPI) => {
    try {
      const response = await instence.post(`smsCampaign/SaveManualClients`, data);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const exportSMSDirectReport = createAsyncThunk(
  'report/ExportSmsDirectReport', async (_, thunkAPI) => {
    try {
      const response = await instence.post(`report/ExportSmsDirectReport`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const restoreSms = createAsyncThunk(
  'smsCampaign/restoreSmsCampaigns', async (deletedsms, thunkAPI) => {
    try {
      const response = await instence.put(`smsCampaign/restoreSmsCampaigns`, deletedsms);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const deleteSms = createAsyncThunk(
  'smsCampaign/DeleteById', async (id, thunkAPI) => {
    try {
      const response = await instence.delete(`smsCampaign/DeleteById/${id}`);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const duplicteSms = createAsyncThunk(
  'smsCampaign/cloneSmsCampaign', async (id, thunkAPI) => {
    try {
      const response = await instence.put(`smsCampaign/cloneSmsCampaign/${id}`);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })
export const smsDelete = createAsyncThunk(
  'smsCampaign/deleteSmsCampaign', async (id, thunkAPI) => {
    try {
      const response = await instence.post(`smsCampaign/deleteSmsCampaign/${id}`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const getSmsAuthorizationData = createAsyncThunk(
  'authorization/getAuthorizeNumbers', async (_, thunkAPI) => {
    try {
      const response = await instence.get(`authorization/getAuthorizeNumbers`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const getAuthorizeNumbers = createAsyncThunk(
  'GetRelatedSubAccountNumber', async (_, thunkAPI) => {
    try {
      const response = await instence.get(`authorization/getAuthorizeNumbers`, { subID: -1 });
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const sendVerificationCode = createAsyncThunk(
  'authorization/newAuthorizeNumbers', async (data, thunkAPI) => {
    const { username = '', number = '' } = data || {};
    try {
      const response = await instence.put(`authorization/newAuthorizeNumbers/${username}/${number}`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const verifyCode = createAsyncThunk(
  'authorization/newAuthorizeNumbers', async (data, thunkAPI) => {
    try {
      const response = await instence.put(`authorization/newAuthorizeNumberInsertCode/${data.phoneNumber}/${data.optinCode}`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const getSmsReport = createAsyncThunk(
  'reports/SmsReport', async (demo = false, thunkAPI) => {
    try {
      const response = await instence.get(`reports/SmsReport?includeTestCampaign=${demo}`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const getCampaignSumm = createAsyncThunk(
  'smsCampaign/GetCampaignSummary', async (id, thunkAPI) => {
    try {
      const response = await instence.get(`smsCampaign/GetCampaignSummary/${id}`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })

export const smsSave = createAsyncThunk(
  'smsCampaign/Save', async (data, thunkAPI) => {
    try {
      const response = await instence.post(`smsCampaign/Save`, data);

      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })
export const smsSaveGroup = createAsyncThunk(
  'smsCampaign/SaveQuickSendGroups', async (data, thunkAPI) => {
    try {
      const response = await instence.post(`smsCampaign/SaveQuickSendGroups`, data);

      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })
export const saveSmsCampSettings = createAsyncThunk(
  'smsCampaign/SaveCampaignSettings', async (data, thunkAPI) => {
    try {
      const response = await instence.post(`smsCampaign/SaveCampaignSettings`, data);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })
export const smsCombinedGroup = createAsyncThunk(
  'smsCampaign/CreateCombinedGroup', async (data, thunkAPI) => {
    try {
      const response = await instence.post(`smsCampaign/CreateCombinedGroup`, data);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })
export const smsQuick = createAsyncThunk(
  'smsCampaign/QuickSend', async (data, thunkAPI) => {
    try {
      const response = await instence.post(`smsCampaign/QuickSend`, data);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })


export const exportSmsReport = createAsyncThunk(
  'report/ExportSmsReport', async (demo = false, thunkAPI) => {
    try {
      const response = await instence.post(`report/ExportSmsReport/${demo}`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })
export const getFinishedCampaigns = createAsyncThunk(
  'smsCampaign/GetFinishedSmsCampaigns', async (_, thunkAPI) => {
    try {
      const response = await instence.get(`smsCampaign/GetFinishedSmsCampaigns`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  })
export const getCampaignSettings = createAsyncThunk(
  'smsCampaign/GetCampaignSettings', async (campaignId, thunkAPI) => {
    try {
      const response = await instence.get(`smsCampaign/GetCampaignSettings/${campaignId}`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

  export const sendSms = createAsyncThunk(
    'smsCampaign/Send', async (sendData, thunkAPI) => {
      try {
        const response = await instence.post(`smsCampaign/Send`, sendData);
        return JSON.parse(response.data)
      } catch (error) {
        return thunkAPI.rejectWithValue({ error: error.message });
      }
    });

// export const SaveSms=createAsyncThunk(
//   'smsCampaign/Save/',async (data,thunkAPI) => {
//     try {
//       const response=await instence.post(`smsCampaign/Save/`,data);
//       return response.data
//     } catch(error) {
//       return thunkAPI.rejectWithValue({error: error.message});
//     }
//   })

export const smsSlice = createSlice({
  name: 'newsletter',
  initialState: {
    smsData: [],
    smsDeletedData: [],
    smsDataError: '',
    authorizationData: [],
    smsReport: [],
    previousLandingData: [],
    previousCampaignData: [],
    extraData: [],
    accountId: [],
    getCampaignSum: [],
    finishedCampaigns: [],
    testGroups: [],
    commonSettings: {},
    directSmsReport: {},
    directSmsReportError: '',
    credits: [],
    smsCampaignSettings: [],
    smsSendResult: -1
  },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(sendSms.fulfilled, (state, {payload}) => {
      state.smsSendResult = payload;
    })
    builder.addCase(getSmsData.fulfilled, (state, { payload }) => {
      state.smsData = payload.filter(row => !row.IsDeleted)
      state.smsDeletedData = payload.filter(row => row.IsDeleted)
    })
    builder.addCase(getSmsData.rejected, (state, action) => {
      state.smsDataError = action.error.message
    })
    builder.addCase(getSmsAuthorizationData.fulfilled, (state, { payload }) => {
      state.authorizationData = payload
    })
    builder.addCase(getCampaignSumm.fulfilled, (state, { payload }) => {
      state.getCampaignSum = payload
    })

    builder.addCase(getSmsReport.fulfilled, (state, { payload }) => {
      state.smsReport = payload
    })
    builder.addCase(getSMSDirectReport.fulfilled, (state, { payload }) => {
      state.directSmsReport = payload
    })
    builder.addCase(getPreviousLandingData.fulfilled, (state, { payload }) => {
      state.previousLandingData = payload
    })
    builder.addCase(getTestGroups.fulfilled, (state, { payload }) => {
      state.testGroups = payload
    })
    builder.addCase(getCommonFeatures.fulfilled, (state, { payload }) => {
      state.commonSettings = payload
    })
    builder.addCase(getFinishedCampaigns.fulfilled, (state, { payload }) => {
      state.finishedCampaigns = payload
    })

    builder.addCase(getPreviousCampaignData.fulfilled, (state, { payload }) => {
      state.previousCampaignData = payload
    })
    builder.addCase(getAccountExtraData.fulfilled, (state, { payload }) => {
      state.extraData = payload
    })
    builder.addCase(getCampaignSettings.fulfilled, (state, { payload }) => {
      state.smsCampaignSettings = payload
    })
    builder.addCase(getGroupsBySubAccountId.fulfilled, (state, { payload }) => {
      let tempArr = [];
      for (let i = 0; i < payload.length; i++) {
        tempArr.push({ ...payload[i], selected: false })
      }
      state.accountId = tempArr
    })
    builder.addCase(getSMSDirectReport.rejected, (state, action) => {
      state.directSmsReportError = action.error
    })
    builder.addCase(getCampaignSettings.rejected, (state, action) => {
      state.smsCampaignSettings = action.error
    })

    // builder.addCase(duplicteSms.fulfilled, () => console.log('api duplicteSms success'))
    // builder.addCase(deleteSms.fulfilled, () => console.log('api deleteSms success'))
    // builder.addCase(restoreSms.fulfilled, () => console.log('api restoreSms success'))
    // builder.addCase(getCreditsforSMS.fulfilled, () => console.log('api getCreditsforSMS success'))

    builder.addCase(duplicteSms.rejected, (_, action) => console.log('Error - api duplicteSms: ' + action.error))
    builder.addCase(deleteSms.rejected, (_, action) => console.log('Error - api deleteSms: ' + action.error))
    builder.addCase(restoreSms.rejected, (_, action) => console.log('Error - api restoreSms: ' + action.error))
    builder.addCase(getCreditsforSMS.rejected, (_, action) => console.log('Error - api getCreditsforSMS: ' + action.error))
    builder.addCase(sendSms.rejected, (_, action) => console.log('error - api send sms' + action.error))
  }
})



export default smsSlice.reducer