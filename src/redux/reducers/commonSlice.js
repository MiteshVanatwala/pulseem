import { instence } from '../../helpers/api'
import { setCookie } from '../../helpers/cookies'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


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
export const getCommonFeatures = createAsyncThunk(
  'GetSubAccountWithFeatureAndSettings', async (_, thunkAPI) => {
    try {
      const response = await instence.get(`GetSubAccountWithFeatureAndSettings`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const commonSlice = createSlice({
  name: 'common',
  initialState: {
    Folders: [],
    subAccountSettings: null
  },
  extraReducers: builder => {
    builder
      .addCase(getCommonFeatures.fulfilled, (state, { payload }) => {
        state.subAccountSettings = payload
        setCookie("subAccountSettings", payload.SubAccountSettings);
      })
  }
})



export default commonSlice.reducer
