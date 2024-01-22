import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';
export const GetDomainVerification = createAsyncThunk(
    'DomainVerification/GetDomainVerification',
    async (domainAddress: string, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.get(`DomainVerification/GetDomainVerification/${domainAddress}`);
            return response.data
        } catch (error) {
            return console.log(error);
        }
    }
);
export const SetSharedDomain = createAsyncThunk(
    'DomainVerification/SetSharedEmailDomain',
    async (domainAddress: string, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.put(`DomainVerification/SetSharedEmailDomain?domain=${domainAddress}`);
            return response.data
        } catch (error) {
            return console.log(error);
        }
    }
);
const DomainVerificationSlice = createSlice({
    name: 'DomainVerification',
    initialState: {
        // domain: {
        //     StatusCode: 200,
        //     Message: '',
        //     Data: ''
        // } as PulseemResponse
    },
    reducers: {
        reduceExample: (state, payload) => {
            // state.x = payload
        }
    },
    extraReducers: (builder) => {
        // builder.addCase(GetDomainVerification.fulfilled, (state, action) => {
        //     state.domain = action.payload;
        // })
    },
})

// export const { reduceExample } = DomainVerificationSlice.actions
export default DomainVerificationSlice.reducer