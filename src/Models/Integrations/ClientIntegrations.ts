
    export interface UserSettings {
        GroupId: number;
        Email: string;
    }

    export interface AddUser extends UserSettings {
        fname: string;
        lname: string;
        phone: string;
        optin: string;
    }

    export enum e_DeleteAction {
        DeleteFailed = 0,
        NoRecordFound = 1,
        DeleteSucceed = 2,
        InvalidAccount = 3
    }

    export interface ClientExtraData {
        ExtraDate1: string;
        ExtraDate2: string;
        ExtraDate3: string;
        ExtraDate4: string;
        ExtraField1: string;
        ExtraField2: string;
        ExtraField3: string;
        ExtraField4: string;
        ExtraField5: string;
        ExtraField6: string;
        ExtraField7: string;
        ExtraField8: string;
        ExtraField9: string;
        ExtraField10: string;
        ExtraField11: string;
        ExtraField12: string;
        ExtraField13: string;
    }

    export interface IntegrationClient extends UserSettings {
        FirstName: string;
        LastName: string;
        City: string;
        Address: string;
        Zip: string;
        Country: string;
        State: string;
        Company: string;
        Telephone: string;
        Cellphone: string;
        Birthday: string;
        clientExtraData: ClientExtraData;
        NeedOptIn: boolean;
        OverWrite: boolean;
        RespondResend: boolean;
    }

