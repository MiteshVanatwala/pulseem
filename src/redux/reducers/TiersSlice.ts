import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemResponse } from '../../Models/APIResponse';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';
import {
    DowngradePlanRequest, 
    RestoreAutomationRequest,
    SubscriptionCardIframeRequest,
    UpgradePlanRequest,
    ContactSalesRequest
} from '../../Models/Tiers/TierModels';

// Contact Sales for Scale
export const contactSalesForScale = createAsyncThunk(
    'FeatureTier/contactSalesForScale',
    async (request: ContactSalesRequest, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.post(
                'FeatureTier/contactSalesForScale',
                request
            );
            return response.data as PulseemResponse;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

// PR-3179 Step 5: account-specific Service plan limits (enterprise overrides via
// backoffice). Dispatched at app init so limits are available before any Service
// screen renders - see App.js.
export const getAccountServiceLimits = createAsyncThunk('Service/GetAccountLimits', async (_, thunkAPI) => {
    try {
        const res = await PulseemReactInstance.get('Service/GetAccountLimits');
        return res.data; // overrides SERVICE_PLAN_LIMITS if backoffice has custom limits set
    } catch (e: any) {
        return thunkAPI.rejectWithValue({ error: e.message });
        // Fall back to SERVICE_PLAN_LIMITS config on failure
    }
});

// PR-3767: real current-calendar-month message usage, for the ServiceDashboard
// UsageCounter/80%-Alert. Fetched on demand (Dashboard mount) rather than at app
// init like getAccountServiceLimits, since it's only needed on that one screen.
export const getMessageVolumeUsage = createAsyncThunk('Service/GetMessageVolumeUsage', async (_, thunkAPI) => {
    try {
        const res = await PulseemReactInstance.get('Service/GetMessageVolumeUsage');
        return res.data;
    } catch (e: any) {
        return thunkAPI.rejectWithValue({ error: e.message });
    }
});

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

export const deletePolandSubscription = createAsyncThunk(
    'Poland/DeletePolandSubscription',
    async (_, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.post(
                `Poland/DeletePolandSubscription`,
                {}
            );
            return response.data as PulseemResponse;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

// Upgrade Tier Plan
export const upgradePlan = createAsyncThunk(
    'FeatureTier/UpgradeTier',
    async (request: UpgradePlanRequest, thunkAPI) => {
        try {
            console.log(request);
            const response = await PulseemReactInstance.post(
                `FeatureTier/UpgradeTier`,
                request
            );
            return response.data as PulseemResponse;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const polandEmailSubscriptionByCreditCard = createAsyncThunk(
    'Poland/PolandEmailSubscriptionByCreditCard',
    async (request: UpgradePlanRequest, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.post(
                `Poland/PolandEmailSubscriptionByCreditCard`,
                request
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

// TODO - Merge this with getAddSubscriptionCardIframeURL when we deploy Email tier and poland changes together
export const getAddSubscriptionCardIframeURLPoland = createAsyncThunk(
    'AccountBilling/GetAddSubscriptionCardIframeURLPoland',
    async (request: SubscriptionCardIframeRequest, thunkAPI) => {
        try {
            const response = await PulseemReactInstance.get(
                `AccountBilling/GetAddSubscriptionCardIframeURL/${request.language}/${request.subscriptionType}/${request.isNewSubscription}/${request.tierId}/${request.emailTierScaleId}`
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
                `AccountBilling/GetAddSubscriptionCardIframeURL/${request.language}/${request.subscriptionType}/${request.isNewSubscription}/${request.tierId}/${request.emailTierScaleId}`
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
    // PR-3179 Step 5 - account-specific Service plan limits (enterprise overrides via
    // backoffice), fetched via getAccountServiceLimits. null until loaded/on failure -
    // useServicePlanLimits falls back to the hardcoded SERVICE_PLAN_LIMITS in that case.
    serviceLimits: {
        planId: number | null;
        limits: {
            maxServiceAgents: number;
            maxChatbots: number;
            aiAssistantEnabled: boolean;
            maxAiContextWords: number;
            monthlyMessageVolume: number;
        } | null;
    } | null;
    // PR-3767: real current-calendar-month message usage, for the ServiceDashboard.
    // null until getMessageVolumeUsage resolves - the Dashboard treats null the same
    // as 0 used so it never shows a false-positive 80% warning while loading.
    messageVolumeUsage: {
        used: number;
        limit: number;
        period: string;
    } | null;
    loading: {
        currentPlan: boolean;
        availablePlans: boolean;
        downgradePlan: boolean;
        restoreAutomation: boolean;
        userCreditCards: boolean;
        subscriptionCardIframe: boolean;
        contactSales: boolean; 
    };
    error: {
        currentPlan: string | null;
        availablePlans: string | null;
        downgradePlan: string | null;
        restoreAutomation: string | null;
        userCreditCards: string | null;
        subscriptionCardIframe: string | null;
        contactSales: string | null;
    };
}

const initialState: TiersState = {
    currentPlan: {},
    availablePlans: { Data: null, Message: '', StatusCode: 100 },
    userCreditCards: { Data: null, Message: '', StatusCode: 100 },
    subscriptionCardIframeURL: { Data: null, Message: '', StatusCode: 100 },
    serviceLimits: null,
    messageVolumeUsage: null,
    loading: {
        currentPlan: false,
        availablePlans: false,
        downgradePlan: false,
        restoreAutomation: false,
        userCreditCards: false,
        subscriptionCardIframe: false,
        contactSales: false,
    },
    error: {
        currentPlan: null,
        availablePlans: null,
        downgradePlan: null,
        restoreAutomation: null,
        userCreditCards: null,
        subscriptionCardIframe: null,
        contactSales: null,
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
                contactSales: null,
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
            .addCase(getAddSubscriptionCardIframeURLPoland.fulfilled, (state, action) => {
                state.loading.subscriptionCardIframe = false;
                state.subscriptionCardIframeURL = action.payload;
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

        // PR-3179 Step 5 - account-specific Service plan limits
        builder
            .addCase(getAccountServiceLimits.fulfilled, (state, action: any) => {
                const data = action.payload?.Data;
                if (data?.limits) {
                    state.serviceLimits = { planId: data.planId ?? null, limits: data.limits };
                }
            })
            .addCase(getAccountServiceLimits.rejected, (state) => {
                // Leave serviceLimits as-is (null on first failure) - useServicePlanLimits
                // falls back to the hardcoded SERVICE_PLAN_LIMITS config in that case.
                state.serviceLimits = null;
            });

        // PR-3767 - Message Volume usage
        builder
            .addCase(getMessageVolumeUsage.fulfilled, (state, action: any) => {
                const data = action.payload?.Data;
                if (data && typeof data.used === 'number') {
                    state.messageVolumeUsage = { used: data.used, limit: data.limit, period: data.period };
                }
            })
            .addCase(getMessageVolumeUsage.rejected, (state) => {
                state.messageVolumeUsage = null;
            });

        // Contact Sales for Scale
        builder
            .addCase(contactSalesForScale.pending, (state) => {
                state.loading.contactSales = true;
                state.error.contactSales = null;
            })
            .addCase(contactSalesForScale.fulfilled, (state, action) => {
                state.loading.contactSales = false;
            })
            .addCase(contactSalesForScale.rejected, (state, action) => {
                state.loading.contactSales = false;
                state.error.contactSales = action.payload as string;
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
    if (!availablePlans) {
        return null;
    }

    const plans = availablePlans;
    
    // Check if plans is an array and has length
    if (!Array.isArray(plans) || plans.length === 0) {
        return null;
    }

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