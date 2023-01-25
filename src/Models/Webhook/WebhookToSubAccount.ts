import { LU_Methods } from '../Lookup';

export interface WebhookToSubAccount {
    ID: number;
    AccountID: number;
    SubAccountID: number;
    WebhookURL: string;
    MethodType: LU_Methods;
    Params: string;
    IsDeleted: boolean;
    CreatedDate: Date | string;
}