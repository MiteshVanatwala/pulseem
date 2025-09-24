import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemResponse } from '../../Models/APIResponse';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';
import { 
    CurrentPlan, 
    AvailablePlan, 
    CreditCard, 
    DowngradePlanRequest, 
    RestoreAutomationRequest,
    SubscriptionCardIframeRequest
} from '../../Models/Tiers/TierModels';

// Get Current Plan
export const getCurrentPlan = createAsyncThunk(
    'FeatureTier/GetCurrentPlan',
    async (_, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.get('FeatureTier/GetCurrentPlan');
            return response.data as PulseemResponse;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

// Downgrade Plan
export const downgradePlan = createAsyncThunk(
    'FeatureTier/DowngradePlan',
    async (request: DowngradePlanRequest, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.post(
                `FeatureTier/DowngradePlan?newTierId=${request.newTierId}`,
                {}
            );
            return response.data as PulseemResponse;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

// Get Available Plans
export const getAvailablePlans = createAsyncThunk(
    'FeatureTier/GetAvailablePlans',
    async (_, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.get('FeatureTier/GetAvailablePlans');
            return response.data as PulseemResponse;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

// Restore Automation
export const restoreAutomation = createAsyncThunk(
    'FeatureTier/RestoreAutomation',
    async (request: RestoreAutomationRequest, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.post(
                `FeatureTier/RestoreAutomation?isNeedRestore=${request.isNeedRestore}`,
                {}
            );
            return response.data as PulseemResponse;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

// Get Add Subscription Card Iframe URL
export const getAddSubscriptionCardIframeURL = createAsyncThunk(
    'AccountBilling/GetAddSubscriptionCardIframeURL',
    async (request: SubscriptionCardIframeRequest, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.get(
                `AccountBilling/GetAddSubscriptionCardIframeURL/${request.language}/TierSubscription/true/${request.tierId}`
            );
            return response.data as PulseemResponse;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

// Get User Credit Cards
export const getUserCreditCards = createAsyncThunk(
    'FeatureTier/GetUserCreditCards',
    async (_, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.get('FeatureTier/GetUserCreditCards');
            return response.data as PulseemResponse;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

interface TiersState {
    currentPlan: {
        Id?: number;
        Name?: string;
        Description?: string;
        TierSubscriptionStartDate?: string | null;
        TierSubscriptionEndDate?: string | null;
        AutomationAvailable?: boolean;
        Price?: string | null;
    };
    availablePlans: PulseemResponse;
    userCreditCards: PulseemResponse;
    subscriptionCardIframeURL: PulseemResponse;
    loading: {
        currentPlan: boolean;
        availablePlans: boolean;
        downgradePlan: boolean;
        restoreAutomation: boolean;
        userCreditCards: boolean;
        subscriptionCardIframe: boolean;
    };
    error: {
        currentPlan: string | null;
        availablePlans: string | null;
        downgradePlan: string | null;
        restoreAutomation: string | null;
        userCreditCards: string | null;
        subscriptionCardIframe: string | null;
    };
}

const initialState: TiersState = {
    currentPlan: {},
    availablePlans: { Data: null, Message: '', StatusCode: 100 },
    userCreditCards: { Data: null, Message: '', StatusCode: 100 },
    subscriptionCardIframeURL: { Data: null, Message: '', StatusCode: 100 },
    loading: {
        currentPlan: false,
        availablePlans: false,
        downgradePlan: false,
        restoreAutomation: false,
        userCreditCards: false,
        subscriptionCardIframe: false,
    },
    error: {
        currentPlan: null,
        availablePlans: null,
        downgradePlan: null,
        restoreAutomation: null,
        userCreditCards: null,
        subscriptionCardIframe: null,
    },
};

const TiersSlice = createSlice({
    name: 'Tiers',
    initialState,
    reducers: {
        clearErrors: (state) => {
            state.error = {
                currentPlan: null,
                availablePlans: null,
                downgradePlan: null,
                restoreAutomation: null,
                userCreditCards: null,
                subscriptionCardIframe: null,
            };
        },
        resetTiersState: () => initialState,
    },
    extraReducers: (builder) => {
        // Get Current Plan
        builder
            .addCase(getCurrentPlan.fulfilled, (state, action) => {
                state.loading.currentPlan = false;
                state.currentPlan = action.payload.Data;
            })

        // Downgrade Plan
        builder
            .addCase(downgradePlan.pending, (state) => {
                state.loading.downgradePlan = true;
                state.error.downgradePlan = null;
            })
            .addCase(downgradePlan.fulfilled, (state, action) => {
                state.loading.downgradePlan = false;
                // Optionally refresh current plan after downgrade
            })
            .addCase(downgradePlan.rejected, (state, action) => {
                state.loading.downgradePlan = false;
                state.error.downgradePlan = action.payload as string;
            })

        // Get Available Plans
        builder
            .addCase(getAvailablePlans.pending, (state) => {
                state.loading.availablePlans = true;
                state.error.availablePlans = null;
            })
            .addCase(getAvailablePlans.fulfilled, (state, action) => {
                state.loading.availablePlans = false;
                state.availablePlans = action.payload.Data;
            })
            .addCase(getAvailablePlans.rejected, (state, action) => {
                state.loading.availablePlans = false;
                state.error.availablePlans = action.payload as string;
            })

        // Restore Automation
        builder
            .addCase(restoreAutomation.pending, (state) => {
                state.loading.restoreAutomation = true;
                state.error.restoreAutomation = null;
            })
            .addCase(restoreAutomation.fulfilled, (state, action) => {
                state.loading.restoreAutomation = false;
            })
            .addCase(restoreAutomation.rejected, (state, action) => {
                state.loading.restoreAutomation = false;
                state.error.restoreAutomation = action.payload as string;
            })

        // Get Add Subscription Card Iframe URL
        builder
            .addCase(getAddSubscriptionCardIframeURL.pending, (state) => {
                state.loading.subscriptionCardIframe = true;
                state.error.subscriptionCardIframe = null;
            })
            .addCase(getAddSubscriptionCardIframeURL.fulfilled, (state, action) => {
                state.loading.subscriptionCardIframe = false;
                state.subscriptionCardIframeURL = action.payload;
            })
            .addCase(getAddSubscriptionCardIframeURL.rejected, (state, action) => {
                state.loading.subscriptionCardIframe = false;
                state.error.subscriptionCardIframe = action.payload as string;
            })

        // Get User Credit Cards
        builder
            .addCase(getUserCreditCards.pending, (state) => {
                state.loading.userCreditCards = true;
                state.error.userCreditCards = null;
            })
            .addCase(getUserCreditCards.fulfilled, (state, action) => {
                state.loading.userCreditCards = false;
                state.userCreditCards = action.payload;
            })
            .addCase(getUserCreditCards.rejected, (state, action) => {
                state.loading.userCreditCards = false;
                state.error.userCreditCards = action.payload as string;
            });
    },
});

// Utility function to find plan by feature code
export const findPlanByFeatureCode = (
    tierMessageCode: string,
    availablePlans: any,
    currentPlanId?: number
): string | null => {
    // Check if availablePlans data exists
    if (!availablePlans?.Data) {
        return null;
    }

    const plans = availablePlans.Data;
    
    // If currentPlanId is provided, start searching from plans with Id > currentPlanId
    // Otherwise, search through all plans
    const sortedPlans = currentPlanId 
        ? plans.filter((plan: any) => plan.Id > currentPlanId).sort((a: any, b: any) => a.Id - b.Id)
        : plans.sort((a: any, b: any) => a.Id - b.Id);

    // Search through each plan's features
    for (const plan of sortedPlans) {
        if (plan.Features && Array.isArray(plan.Features)) {
            const hasFeature = plan.Features.some((feature: any) => 
                feature.FeatureCode === tierMessageCode
            );
            
            if (hasFeature) {
                return plan.Name;
            }
        }
    }

    return null;
};

export const { clearErrors, resetTiersState } = TiersSlice.actions;
export default TiersSlice.reducer;