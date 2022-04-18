import { instence } from '../../helpers/api'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createStore } from 'redux'


export const getFileGallery = createAsyncThunk(
    '/Gallery/GetFiles', async (_, thunkAPI) => {
        try {
            const response = await instence.get(`/GetFiles`);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const createFolder = createAsyncThunk(
    '/Gallery/CreateFolder', async (folderName, thunkAPI) => {
        try {
            const response = await instence.post(`/CreateFolder`, { FolderName: folderName }
            );
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const postImage = createAsyncThunk(
    '/Gallery/PostNewFile', async (fileGallery, thunkAPI) => {
        try {
            const response = await instence.post(`/PostNewFile`, fileGallery
            );
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const deleteGalleryFile = createAsyncThunk(
    '/Gallery/DeleteFile', async (fileGallery, thunkAPI) => {
        try {
            const response = await instence.post(`/DeleteFile`, fileGallery
            );
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });


export const gallerySlice = createSlice({
    name: 'gallery',
    initialState: {
        Folders: [],
        UnlayerFilterFiles: []
    },
    extraReducers: builder => {
        builder
            .addCase(getFileGallery.fulfilled, (state, { payload }) => {
                state.Folders = payload;
                if (payload) {

                }
            })
    }
})

export default gallerySlice.reducer
