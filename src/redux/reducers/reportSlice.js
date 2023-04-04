import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { instence } from '../../helpers/api';
import { v4 as uuidv4 } from 'uuid';

export const GetProductReports = createAsyncThunk(
  'ProductReport/Get', async (data, thunkAPI) => {
    try {
      const response = await instence.post(`ProductReport/Get`, data);
      return response.data
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const GetFileDownloadList = createAsyncThunk(
  'filedownloadlist', async (_, thunkAPI) => {
  try {
    const list = [
      {
        ID: 1,
        FileName: 'A.txt',
        IsDeleted: false,
        Status: 1,
        CreatedDate: ''
      }, {
        ID: 2,
        FileName: 'B.txt',
        IsDeleted: false,
        Status: 2,
        CreatedDate: ''
      }, {
        ID: 3,
        FileName: 'C.txt',
        IsDeleted: false,
        Status: 3,
        CreatedDate: ''
      }, {
        ID: 4,
        FileName: 'D.txt',
        IsDeleted: false,
        Status: 4,
        CreatedDate: ''
      }, {
        ID: 5,
        FileName: 'E.txt',
        IsDeleted: false,
        Status: 5,
        CreatedDate: ''
      }, {
        ID: 6,
        FileName: 'F.txt',
        IsDeleted: false,
        Status: 0,
        CreatedDate: ''
      }, {
        ID: 7,
        FileName: 'G.txt',
        IsDeleted: false,
        Status: -1,
        CreatedDate: ''
      },
    ];
    return list;
    // const response = await instence.get(`filedownloadlist`);
    // return JSON.parse(response.data)
  } catch (error) {
    return thunkAPI.rejectWithValue({ error: error.message });
  }
})

export const reportSlice = createSlice({
  name: 'report',
  initialState: {
    showContent: false,
    productsReportDetails: [],
    productCategories: [],
    exportPRData: [],
    downloadFileList: [],
  },
  reducers: {
    setShowContent: (state, action) => {
      state.showContent = action.payload;
    }
  },
  extraReducers: builder => {
    builder.addCase(GetProductReports.fulfilled, (state, { meta, payload }) => {
      if (!meta?.arg?.IsExport) {
        state.productsReportDetails = payload?.Data || [];
        state.productsReportDetails?.Products?.forEach((product) => {
          product.uniqueKey = uuidv4();
        });
        if (payload?.Data?.Categories?.length > 0) {
          state.productCategories = payload?.Data?.Categories
        }
      }
      else {
        state.exportPRData = payload?.Data?.Products || [];
      }
    })
    .addCase(GetFileDownloadList.fulfilled, (state, { meta, payload }) => {
      state.downloadFileList = payload;
    })
  }
})

export const { setShowContent } = reportSlice.actions

export default reportSlice.reducer