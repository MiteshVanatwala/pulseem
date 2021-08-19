import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { instence } from '../../helpers/api'

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
  '/PostImageFile', async (fileGallery, thunkAPI) => {
    try {
      const response = await instence.post(`/PostImageFile`, fileGallery
      );
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const deleteGalleryFile = createAsyncThunk(
  '/DeleteGalleryFile', async (fileGallery, thunkAPI) => {
    try {
      const response = await instence.post(`/DeleteGalleryFile`, fileGallery
      );
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

  export const getPackagesList = createAsyncThunk(
    '/GetPackagesList', async (_, thunkAPI) => {
      try {
        const response = await instence.get(`/GetPackagesList`);
        return JSON.parse(response.data)
      } catch (error) {
        return thunkAPI.rejectWithValue({ error: error.message });
      }
    });

  export const isClalAccount = createAsyncThunk(
    '/IsClalAccount', async (_, thunkAPI) => {
      try {
        const response = await instence.get(`/IsClalAccount`);
        return JSON.parse(response.data)
      } catch (error) {
        return thunkAPI.rejectWithValue({ error: error.message });
      }
    });

    export const getAccountFeatures = createAsyncThunk(
      '/GetAccountFeatures', async (_, thunkAPI) => {
        try {
          const response = await instence.get(`/GetAccountFeatures`);
          return response.data
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