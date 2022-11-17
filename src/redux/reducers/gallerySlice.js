import { instence } from '../../helpers/api'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const getFileGallery = createAsyncThunk(
    '/Gallery/GetFiles', async (folderType, thunkAPI) => {
        try {
            const response = await instence.get(`/Gallery/GetFiles/${folderType}`);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const createFolder = createAsyncThunk(
    '/Gallery/CreateFolder', async (folderObject, thunkAPI) => {
        try {
            const response = await instence.post(`/Gallery/CreateFolder`, folderObject
            );
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });
//#region Images
export const postFile = createAsyncThunk(
    '/Gallery/PostNewFile', async (fileGallery, thunkAPI) => {
        try {
            const response = await instence.post(`/Gallery/PostNewFile`, fileGallery);
            return JSON.parse(response.data)
        } catch (error) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    });

export const uploadFile = createAsyncThunk(
    '/gallery/UploadFile', async (fileGallery, thunkAPI) => {
        try {
            const response = await instence.put(`/gallery/UploadFile`, fileGallery,
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
//#endregion Images
//#region Documents
export const postFiles = createAsyncThunk(
    '/Gallery/PostMultipleFiles', (files, thunkAPI) => {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await instence.post(`/Gallery/PostMultipleFiles`, files,
                    {
                        onUploadProgress: (progressEvent) => {
                            const { loaded, total } = progressEvent
                            let percent = Math.floor(loaded * 100 / total);
                            thunkAPI.dispatch(setUploadProgress(percent));
                        }
                    });
                resolve(response.data)
            } catch (error) {
                reject(thunkAPI.rejectWithValue({ error: error.message }));
            }
        })
    });

export const uploadFiles = createAsyncThunk(
    '/gallery/UploadFiles', async (files, thunkAPI) => {
        try {
            const response = await instence.put(`/gallery/UploadFiles`, files,
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
//#endregion Documents


export const deleteGalleryFile = createAsyncThunk(
    '/Gallery/DeleteFile', async (fileGallery, thunkAPI) => {
        try {
            const response = await instence.post(`/Gallery/DeleteFile`, fileGallery);
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
