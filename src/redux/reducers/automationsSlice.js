import {createSlice,createAsyncThunk} from '@reduxjs/toolkit';
import { instence, customInstance } from '../../helpers/api'


export const getAutomationsData=createAsyncThunk(
  'automation/getAutomations',async (_,thunkAPI) => {
    try {
      const response=await instence.get(`automation/getAutomations`);
      return JSON.parse(response.data)
    } catch(error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  })

export const deleteAutomations=createAsyncThunk(
  'automation/deleteAutomation/',async (id,thunkAPI) => {
    try {
      const response=await instence.delete(`automation/deleteAutomation/${id}`);
      return response.data
    } catch(error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  })

export const duplicateAutomations=createAsyncThunk(
  'automation/cloneAutomation/',async (id,thunkAPI) => {
    try {
      console.log('inside Duplicate')
      const response=await instence.put(`automation/cloneAutomation/${id}`);
      return response.data
    } catch(error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  })

export const restoreAutomations=createAsyncThunk(
  'automation/restoreAutomation',async (deletedAutomations,thunkAPI) => {
    try {
      const response=await instence.put(`automation/restoreAutomation`,deletedAutomations);
      return response.data
    } catch(error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  })

// export const activateAutomation=createAsyncThunk(
//   'automation/activateAutomation/',async ({ID,IsActive},thunkAPI) => {
//     try {
//       const response=await instence.put(`automation/activateAutomation/${ID}/${!IsActive}`);
//       return response.data
//     } catch(error) {
//       throw error.message;
//     }
//   })

  export const activateAutomation = createAsyncThunk(
    'AutomationServices.asmx/ChangeAutomationStatus', async ( data, thunkAPI) => {
      try {
        const d = "{'automationID':'" + data.ID + "'}"

        console.log(d);
        const response = await customInstance.post(`AutomationServices.asmx/ChangeAutomationStatus`, d);
        return response.data;
      }
      catch (error) {
        throw error.message;
      }
    }
  )

export const automationsSlice=createSlice({
  name: 'newsletter',
  initialState: {
    automationsData: [],
    automationsDeletedData: [],
    automationsDataError: ''
  },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getAutomationsData.fulfilled,(state,{payload}) => {
      state.automationsData=payload.filter(row => !row.IsDeleted)
      state.automationsDeletedData=payload.filter(row => row.IsDeleted)
    })
    builder.addCase(getAutomationsData.rejected,(state,action) => {
      state.automationsDataError=action.error.message
    })
    builder.addCase(deleteAutomations.fulfilled,() => console.log('api deleteAutomations success'))
    builder.addCase(duplicateAutomations.fulfilled,() => console.log('api duplicateAutomations success'))
    builder.addCase(restoreAutomations.fulfilled,() => console.log('api restoreAutomations success'))
    builder.addCase(activateAutomation.fulfilled,() => console.log('api activateAutomation success'))

    builder.addCase(deleteAutomations.rejected,(_,action) => console.log('Error - api deleteAutomations: '+action.error))
    builder.addCase(duplicateAutomations.rejected,(_,action) => console.log('Error - api duplicateAutomations: '+action.error))
    builder.addCase(restoreAutomations.rejected,(_,action) => console.log('Error - api restoreAutomations: '+action.error))
  }
})



export default automationsSlice.reducer