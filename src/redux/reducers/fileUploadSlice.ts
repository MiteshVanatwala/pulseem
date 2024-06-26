import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemResponse } from '../../Models/APIResponse';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';
import { PulseemFile } from '../../Models/Files/FileUpload';

export const getFiles = createAsyncThunk(
  'FileUploads/Get',
  async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`FileUploads/Get`);
      return response.data
    } catch (error) {
      return console.log(error);
    }
  }
);

const fileUploadsSlice = createSlice({
  name: 'fileUploads',
  initialState: {
    fileUploads: {
      StatusCode: 200,
      Message: '',
      Data: {} as PulseemFile,
    } as PulseemResponse,
    ToastMessages: {
      GENERAL_ERROR: { severity: 'error', color: 'error', message: 'campaigns.newsLetterEditor.errors.generalError', showAnimtionCheck: false }
    }
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getFiles.fulfilled, (state, action) => {
      state.fileUploads = action.payload;
    })
  }
});
export default fileUploadsSlice.reducer
