import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import instence from '../../helpers/api'

export const getFileGallery = createAsyncThunk(
  '/GetFileGallery', async (_, thunkAPI) => {
    try {
      const response = await instence.get(`/GetFileGallery`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const createFolder = createAsyncThunk(
  '/CreateFolder', async (folderName, thunkAPI) => {
    try {
      const response = await instence.post(`/CreateFolder`, { FolderName: folderName }
      );
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const postImage = createAsyncThunk(
  '/PostImageFile', async (folderName, thunkAPI) => {
    try {
      const response = await instence.post(`/PostImageFile`, { FolderName: folderName }
      );
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });



export const commonSlice = createSlice({
  name: 'common',
  initialState: {
    Folders: []
  },
  reducers: {},
  // extraReducers: builder => {
  //   builder.addCase(getNotificationData.fulfilled, (state, { payload }) => {
  //     state.notificationData = payload.filter(row => !row.IsDeleted)
  //     state.notificationDeletedData = payload.filter(row => row.IsDeleted)
  //   })
  //   builder.addCase(getNotificationData.rejected, (state, action) => {
  //     state.notificationDataError = action.error.message
  //   })
  // }
})



export default commonSlice.reducer