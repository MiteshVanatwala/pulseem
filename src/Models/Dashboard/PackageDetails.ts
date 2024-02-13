import { eBillingType } from '../Product/BillingProduct';

export interface PackageDetails {
    Sms: Package;
    Mms: Package;
    Notifications: Package;
    Newsletters: Package;
}
export interface Package {
    IsPrepaid: boolean;
    Credits: number | null;
    FeatureExist: boolean;
    eBillingType: eBillingType;
}
export interface PulseemProduct {
    MailBillingType: number;
    SmsBillingType: number;
}
