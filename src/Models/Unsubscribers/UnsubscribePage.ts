import { SubAccountSetting } from '../SubAccount/SubAccountSetting';

export interface UnsubscribePage {
    ID: number;
    SubAccountID: number;
    LogoImage: string;
    BackgroundImage: string;
    Slogan: string;
    Footer: string;
    UnsubscribeReasons: string;
    Culture: string;
    RequestUrl: string;
    RequestPostParams: string;
    SubAccountSettings: SubAccountSetting[];
}