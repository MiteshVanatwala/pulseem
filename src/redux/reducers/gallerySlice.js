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
        folders: [],
        images: []
    },
    extraReducers: builder => {
        builder
            .addCase(getFileGallery.fulfilled, (state, { payload }) => {
                try {
                    if (payload) {
                        payload.Files.map((file) => {
                            const f = {
                                id: Date.now() + 1,
                                location: file.FileURL,
                                width: file.Properties.Width,
                                height: file.Properties.Height,
                                contentType: file.Properties.ContentType,
                                source: 'user'
                            };
                            state.images.push(f);
                        });
                    }
                } catch (e) {
                    console.error(e);
                }
            })
    }
})

export default gallerySlice.reducer
