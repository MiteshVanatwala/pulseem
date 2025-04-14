import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemResponse } from '../../Models/APIResponse';
import { AccountSettings } from '../../Models/Account/AccountSettings';
import { LoginPassword } from '../../Models/Account/Password';
import { TwoFactorAuthAllowed } from '../../Models/Auth/TwoFactorAuth';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';
import { AuditLog } from '../../Models/AuditLog/AuditLog';
import { selectUserObject } from './coreSlice';

export const getAccountSettings = createAsyncThunk(
    'AccountSettings/Get',
    async (_, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.get(`AccountSettings/Get`);
            return response.data
        } catch (error) {
            return console.log(error);
        }
    }
);
export const updateDetails = createAsyncThunk(
    'AccountSettings/UpdateDetails',
    async (settings: AccountSettings, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.post(`AccountSettings/UpdateDetails`, settings);
            return response.data
        } catch (error) {
            return console.log(error);
        }
    }
);
export const updateSettings = createAsyncThunk(
    'AccountSettings/UpdateSettings',
    async (settings: AccountSettings, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.post(`AccountSettings/UpdateSettings`, settings);
            return response.data
        } catch (error) {
            return console.log(error);
        }
    }
);
export const update2FASettings = createAsyncThunk(
    'AccountSettings/Update2FASettings',
    async (settings: AccountSettings, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.put(`AccountSettings/Update2FASettings`, settings)
            return response.data;
        } catch (error) {
            return console.log(error);
        }
    }
);
export const changePassword = createAsyncThunk('AccountSettings/ChangePassword',
    async (passLogin: LoginPassword, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.post(`AccountSettings/ChangePassword`, passLogin)
            return response.data;
        } catch (error) {
            return console.log(error);
        }
    }
);

export const addTwoFactorAuthValues = createAsyncThunk(
    'AddTwoFactorAuthValue', async (authObject: TwoFactorAuthAllowed, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.post(`authorization/AddTwoFactorAuthValue`, authObject);
            return response.data
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    })

export const deleteAuthorizationValue = createAsyncThunk(
    'DeleteAuthorizationValue', async (authObject: TwoFactorAuthAllowed, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.post(`authorization/DeleteAuthorizationValue`, authObject);
            return response.data
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    })

export const checkEmailAuthorization = createAsyncThunk(
    'CheckEmailAuthorization', async (emailAuth: AuthorizationValues, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.get(`authorization/CheckEmailAuthorization/${emailAuth.value}/${emailAuth.isTwoFa}`);
            return response.data
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    })

export const deleteAuthorization2FA = createAsyncThunk(
    'DeleteAuthorization2FA', async (value: string, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.get(`authorization/DeleteAuthorization2FA/${value}`);
            return response.data
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    })
export const checkCellphoneAuthorization = createAsyncThunk(
    'CheckCellphoneAuthorization', async (cellphoneAuth: AuthorizationValues, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.get(`authorization/CheckCellphoneAuthorization/${cellphoneAuth.value}/${cellphoneAuth.isTwoFa}`);
            return response.data
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    })

export const getAllTwoFactorAuthValues = createAsyncThunk(
    'authorization/GetAllTwoFactorAuthValues',
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState();
            const userObject = selectUserObject(state);
            if (userObject?.Data?.Emails[0].AuthValue !== '' &&
                userObject?.Data?.Cellphones && userObject?.Data?.Cellphones[0].AuthValue !== ''
            ) {
                return userObject;
            }

            const response = await PulseemReactInstance.get(`authorization/GetAllTwoFactorAuthValues`)
            return response.data;
        } catch (error) {
            return console.log(error);
        }
    }
);

export const setDisablePendingFeature = createAsyncThunk(
    'AccountSettings/SetBypassPending',
    async (request: any, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.put(`AccountSettings/SetBypassPending`, request);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    }
);

export const cancelDisablePluginOTP = createAsyncThunk(
    'AccountSettings/CancelDisablePluginOTP',
    async (_, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.put(`AccountSettings/CancelDisablePluginOTP`);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    }
);

export const confimrOtp = createAsyncThunk(
    'AccountSettings/ConfirmOtp',
    async (request: any, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.put(`AccountSettings/ConfirmOtp`, request);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    }
);

export const setAuditLog = createAsyncThunk(
    'setAuditLog',
    async (request: AuditLog, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.post(`setAuditLog`, request);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    }
);

export const SetRevenueFeature = createAsyncThunk(
    'AccountSettings/SetRevenueFeature',
    async (request: any, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.post(`AccountSettings/SetRevenueFeature`, request);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message });
        }
    })



interface AuthorizationValues {
    value: string,
    isTwoFa: boolean
}

const AccountSettingsSlice = createSlice({
    name: 'AccountSettings',
    initialState: {
        account: {
            StatusCode: 200,
            Message: '',
            Data: {} as AccountSettings,
        } as PulseemResponse,
        ToastMessages: {
            GENERAL_ERROR: { severity: 'error', color: 'error', message: 'campaigns.newsLetterEditor.errors.generalError', showAnimtionCheck: false },
            SETTINGS_SAVED: { severity: 'success', color: 'success', message: 'settings.accountSettings.savedSuccessfuly', showAnimtionCheck: false },
            TWO_FA_SAVED: { severity: 'success', color: 'success', message: 'settings.accountSettings.auth.activatedSuccessfuly', showAnimtionCheck: false },
            TWO_FA_SAVED_INACTIVE: { severity: 'success', color: 'success', message: 'settings.accountSettings.auth.inActivetedSuccessfuly', showAnimtionCheck: false },
            TWO_FA_NOT_SAVED: { severity: 'error', color: 'error', message: 'settings.accountSettings.auth.notSaved', showAnimtionCheck: false },
            INVALID_EMAIL: { severity: 'error', color: 'error', message: 'settings.accountSettings.fixedComDetails.errors.invalidEmail', showAnimtionCheck: false },
            INVALID_CELLPHONE: { severity: 'error', color: 'error', message: 'settings.accountSettings.fixedComDetails.errors.invalidMobile', showAnimtionCheck: false },
            VERIFY_EMAIL: { severity: 'error', color: 'error', message: 'settings.accountSettings.fixedComDetails.errors.verifyEmail', showAnimtionCheck: false },
            VERIFY_CELLPHONE: { severity: 'error', color: 'error', message: 'settings.accountSettings.fixedComDetails.errors.verifyPhone', showAnimtionCheck: false },
            WHATSAPP_TIER_SAVED: { severity: 'success', color: 'success', message: 'settings.accountSettings.whatsAppTier.tierUpdatedSuccessfully', showAnimtionCheck: false },
            WHATSAPP_TIER_NOT_SAVED: { severity: 'error', color: 'error', message: 'settings.accountSettings.whatsAppTier.tierUpdatedFailed', showAnimtionCheck: false },
            CHANGE_PASSWORD: {
                201: { severity: 'success', color: 'success', message: 'settings.changePassword.responses.201', showAnimtionCheck: false },
                403: { severity: 'error', color: 'error', message: 'settings.changePassword.responses.403', showAnimtionCheck: false },
                406: { severity: 'error', color: 'error', message: 'settings.changePassword.responses.406', showAnimtionCheck: false },
                407: { severity: 'error', color: 'error', message: 'settings.changePassword.responses.407', showAnimtionCheck: false },
                408: { severity: 'error', color: 'error', message: 'settings.changePassword.responses.408', showAnimtionCheck: false },
                409: { severity: 'error', color: 'error', message: 'settings.changePassword.responses.409', showAnimtionCheck: false }
            }
        },
        twoFAUpdated: {
            StatusCode: 200,
            Message: '',
            Data: ''
        } as PulseemResponse,
        authorizedValues: {
            Emails: [],
            Cellphones: []
        } as any
    },
    reducers: {
        resetTwoFA: (state) => {
            state.twoFAUpdated = {
                StatusCode: 200,
                Message: '',
                Data: ''
            } as PulseemResponse
        }
    },
    extraReducers: (builder) => {
        builder.addCase(getAccountSettings.fulfilled, (state, action) => {
            state.account = action.payload;
        })
        builder.addCase(update2FASettings.fulfilled, (state, action) => {
            state.twoFAUpdated = action.payload;
        })
        builder.addCase(getAllTwoFactorAuthValues.fulfilled, (state, action) => {
            state.authorizedValues.Emails = action.payload?.Data?.Emails;
            state.authorizedValues.Cellphones = action.payload?.Data?.Cellphones;
        })

    },
})

export const { resetTwoFA } = AccountSettingsSlice.actions
export default AccountSettingsSlice.reducer