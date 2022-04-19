import { instence } from '../../helpers/api'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const getFileGallery = createAsyncThunk(
    '/Gallery/GetFiles', async (_, thunkAPI) => {
        try {
            const response = await instence.get(`/Gallery/GetFiles`);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const createFolder = createAsyncThunk(
    '/Gallery/CreateFolder', async (folderName, thunkAPI) => {
        try {
            const response = await instence.post(`/Gallery/CreateFolder`, { FolderName: folderName }
            );
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const postImage = createAsyncThunk(
    '/Gallery/PostNewFile', async (fileGallery, thunkAPI) => {
        try {
            const response = await instence.post(`/Gallery/PostNewFile`, fileGallery
            );
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const deleteGalleryFile = createAsyncThunk(
    '/Gallery/DeleteFile', async (fileGallery, thunkAPI) => {
        try {
            const response = await instence.post(`/Gallery/DeleteFile`, fileGallery
            );
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });


export const gallerySlice = createSlice({
    name: 'gallery',
    initialState: {
        folders: [],
        images: [],
        gallery: null
    },
    extraReducers: builder => {
        builder
            .addCase(getFileGallery.fulfilled, (state, { payload }) => {
                state.gallery = payload.Gallery;
            })
    }
})

export default gallerySlice.reducer
