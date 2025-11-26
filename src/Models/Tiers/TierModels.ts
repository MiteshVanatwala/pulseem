export interface FeatureTier {
    id: number;
    name: string;
    description?: string;
    price?: number;
    features?: string[];
    isActive?: boolean;
    isCurrentPlan?: boolean;
}

export interface CurrentPlan {
    Id: number;
    Name: string;
    Description: string;
    TierSubscriptionStartDate: string | null;
    TierSubscriptionEndDate: string | null;
    AutomationAvailable: boolean;
    Price: number;
    Features: string[];
}

export interface AvailablePlan {
    id: number;
    name: string;
    description?: string;
    price: number;
    currency?: string;
    billingPeriod?: string;
    features: string[];
    isRecommended?: boolean;
    isCurrentPlan?: boolean;
}

export interface CreditCard {
    id: string;
    cardNumber: string;
    cardType: string;
    expiryMonth: number;
    expiryYear: number;
    isDefault: boolean;
    holderName?: string;
}

export interface DowngradePlanRequest {
    newTierId: number;
}

export interface UpgradePlanRequest {
    Id: number;
    Type: string;
    TierID: number;
    EmailTierScaleID?: number;
}

export interface RestoreAutomationRequest {
    isNeedRestore: boolean;
}

export interface SubscriptionCardIframeRequest {
    language: string;
    subscriptionType: string;
    isNewSubscription: boolean;
    tierId: number;
    emailTierScaleId?: number;
}

export interface ContactSalesRequest {
    Name: string;
    Email: string;
    Cellphone: string;
    Message: string;
}