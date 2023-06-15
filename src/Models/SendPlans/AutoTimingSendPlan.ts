import { SmsCampaign } from '../Sms/SmsCampaign';
import { Campaign } from '../Campaigns/Campaign';

export interface AutoTimingSendPlan {
    SendPlanID: number;
    SendPlanName: string;
    CreationDate: Date | string | null;
    GroupID: number | null;
    SMSCampaigns: SmsCampaign[];
    SubAccountID: number | null;
    _Campaigns: Campaign[];
}