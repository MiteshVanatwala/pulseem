import { AccountExtraFields } from "../Account/AccountExtraFields";

export interface SimplyClubClient {
    ClientID: number;
    SubAccountID: number;
    Email: string;
    Status: number;
    SmsStatus: number;
    FirstName: string;
    LastName: string;
    Telephone: string;
    Cellphone: string;
    Address: string;
    City: string;
    State: string;
    Country: string;
    Zip: string;
    Company: string;
    ExtraFields: AccountExtraFields;
    BirthDate: string;
    ReminderDate: Date | string | null;
    LastSendDate: Date | string | null;
    CreationDate: Date | string | null;
    FailedSendingCounter: number | null;
    IsWebService: boolean | null;
    LastEmailOpened: Date | string | null;
    LastEmailClicked: Date | string | null;
    BestEmailOpenTime: number | null;
    AdditionalData: string[];
    Overwrite: boolean;
}
