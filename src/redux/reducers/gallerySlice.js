import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const getFileGallery = createAsyncThunk(
    '/Gallery/GetFiles', async (folderType, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.get(`/Gallery/GetFiles/${folderType}`);
            return response.data
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const createFolder = createAsyncThunk(
    '/Gallery/CreateFolder', async (folderObject, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.post(`/Gallery/CreateFolder`, folderObject
            );
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });
export const uploadFiles = createAsyncThunk(
    '/gallery/UploadFiles', async (files, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.put(`/gallery/UploadFiles`, files,
                {
                    onUploadProgress: (progressEvent) => {
                        const { loaded, total } = progressEvent
                        let percent = Math.floor(loaded * 100 / total);
                        thunkAPI.dispatch(setUploadProgress(percent));
                    }
                });
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });
export const deleteGalleryFile = createAsyncThunk(
    '/Gallery/DeleteFile', async (fileGallery, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.post(`/Gallery/DeleteFile`, fileGallery);
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
        gallery: null,
        uploadProgress: null
    },
    reducers: {
        setUploadProgress: (state, action) => {
            state.uploadProgress = action.payload;
        }
    },
    extraReducers: builder => {
        builder
            .addCase(getFileGallery.fulfilled, (state, { payload }) => {
                state.gallery = payload.Gallery;
            })
    }
})

export const { setUploadProgress } = gallerySlice.actions
export default gallerySlice.reducer
