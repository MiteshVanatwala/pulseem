import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';
import { getCookie } from '../../helpers/Functions/cookies'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


export const getFileGallery = createAsyncThunk(
  '/GetFileGallery', async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`/GetFileGallery`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const createFolder = createAsyncThunk(
  '/CreateFolder', async (folderName, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`/CreateFolder`, { FolderName: folderName }
      );
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const postImage = createAsyncThunk(
  '/PostImageFile', async (fileGallery, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`/PostImageFile`, fileGallery
      );
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const deleteGalleryFile = createAsyncThunk(
  '/DeleteGalleryFile', async (fileGallery, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.post(`/DeleteGalleryFile`, fileGallery
      );
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const isClalAccount = createAsyncThunk(
  '/IsClalAccount', async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`/IsClalAccount`);
      return JSON.parse(response.data)
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });
export const getAccountFeatures = createAsyncThunk(
  '/GetAccountFeatures', async (_, thunkAPI) => {
    try {
      const response = await PulseemReactInstance.get(`/GetAccountFeatures`);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });
export const getCommonFeatures = createAsyncThunk(
  'GetSubAccountWithFeatureAndSettings', async (req = null, thunkAPI) => {
    try {
      const settings = getCookie('accountSettings');
      if ((!settings || settings === '') || (req && req.forceRequest === true) ||
        document.referrer.toLocaleLowerCase().includes('accountsmanage.aspx') ||
        document.referrer.toLocaleLowerCase().includes('login')) {
        const response = await PulseemReactInstance.get(`GetSubAccountWithFeatureAndSettings`);
        return JSON.parse(response.data)
      }
      else {
        return settings
      }

    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const commonSlice = createSlice({
  name: 'common',
  initialState: {
    Folders: []
  }
})


export default commonSlice.reducer
