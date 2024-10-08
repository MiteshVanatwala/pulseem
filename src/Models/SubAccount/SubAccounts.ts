import { TemplateCategory } from '../TemplateCategories/TemplateCategory';
import { CampaignAbTesting } from '../Campaigns/AbTesting';
import { AccountSocialSetting, UserSocialPage, UserSocialToken } from '../Social/Social';
import { MmsCampaign } from '../Mms/MmsCampaign';
import { UnsubscribePage } from '../Unsubscribers/UnsubscribePage';
import { DirectAccountModel } from '../Account/DirectAccount';
import { SmsCampaign } from '../Sms/SmsCampaign';
import { SendPlan } from '../SendPlans/SendPlan';
import { Group } from '../Groups/Group';
import { Client } from '../Clients/Client';
import { Campaign } from '../Campaigns/Campaign';
import { Automation } from '../Automations/Automation';
import { WebForm } from '../Webforms/WebForm';
import { Account } from '../Account/Account';
import { SubAccountSetting } from './SubAccountSetting';
import { Target } from '../Targets/Target';
import { SurveyItem } from '../Survey/SurveyItem';

export interface SubAccount {
    SubAccountId: number;
    LoginUserName: string;
    AccountID: number;
    SubAccountName: string;
    SubAccountManager: string;
    CompanyAdmin: boolean | null;
    CreationDate: Date | string;
    MaxMailSendingForMonth: number | null;
    MaxSMSSendingForMonth: number | null;
    BulkEmail: number | null;
    BulkSMS: number | null;
    ExpiryDate: Date | string | null;
    Priority: string;
    DefaultFromMail: string;
    DefaultFromName: string;
    DefaultCellNumber: string;
    ExtraGenFieldName: string;
    ExtraDateFieldName: string;
    BulkMMS: number | null;
    TemplateCategories: TemplateCategory[];
    Targets: Target[];
    CampaignAbTestings: CampaignAbTesting[];
    UserSocialTokens: UserSocialToken[];
    UserSocialPages: UserSocialPage[];
    AccountSocialSettings: AccountSocialSetting[];
    MmsCampaigns: MmsCampaign[];
    Surveys: SurveyItem[];
    UnsubscribePages: UnsubscribePage[];
    DirectAccount: DirectAccountModel[];
    SMSCampaigns: SmsCampaign[];
    AutoTimingSendPlans: SendPlan[];
    Groups: Group[];
    Clients: Client[];
    Campaigns: Campaign[];
    Automations: Automation[];
    WebForms: WebForm[];
    Account: Account;
    SubAccountSettings: SubAccountSetting;
    DefaultLinkChars: number;
}

export interface SubAccountUsers {
    BulkEmail: null | number;
    BulkMMS: null | number;
    BulkSMS: null | number;
    CellPhone: null | string;
    CompanyAdmin: boolean;
    CreationDate: string;
    CurrencyID: number;
    CurrencyName: string;
    CustomGuidEnc: string;
    DirectAccountCompanyName: null | string;
    DirectAccountContactName: null | string;
    DirectAccountEmail: null | string;
    DirectAccountTelephone: null | string;
    DirectBulkEmails: null | number;
    DirectMmsCredits: null | number;
    DirectSMSCredits: null | number;
    Email: null | number;
    ExpiryDate: null | string;
    FinalGlobalBalance: null | number;
    IsDirectAccount: boolean;
    IsGlobalAccount: boolean;
    LoginUserName: string;
    MaxMailSendingForMonth: null | number;
    MaxSMSSendingForMonth: null | number;
    SubAccountManager: string;
    SubAccountName: string;
}

export interface BulkHistory {
    AccountType: null | boolean | number;
    Amount: null | number;
    Date: string;
    TransferedFromSubAccountName: string;
    TransferredToName: string;
    Type: number
}