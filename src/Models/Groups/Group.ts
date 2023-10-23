import { Client } from '../Clients/Client';
import { ClientsUploadSummary } from '../Clients/Client'

export interface Group {
    GroupID: number;
    GroupName: string;
    SubAccountID: number;
    CreationDate: Date | string | null;
    UpdateDate: Date | string | null;
    IsTestGroup: boolean | null;
    IsDynamic: boolean;
    DynamicData: string;
    DynamicLastUpdate: Date | string | null;
    DynamicUpdatePolicy: number | null;
    Recipients: number;
}
export interface GroupData extends Group {
    TotalRecipients: number | never;
    ActiveEmails: number | never;
    RemovedEmails: number | never;
    RestrictedEmails: number | never;
    InvalidEmails: number | never;
    PendingEmails: number | never;
    ActiveCell: number | never;
    RemovedCell: number | never;
    InvalidCell: number | never;
    IsAutoResponder: boolean | never;
    IsConnectedToWebForm: boolean | never;
    AutomationID: number | null | never | undefined;
    PendingClients: number | never; // Email Clients
    PendingSmsClients: number | never; // Sms Clients
    IsChecked: boolean | never;
}
export interface CombinedGroups {
    SubAccountID: number;
    GroupName: string;
    GroupIds: number[];
}
export interface ManualClientsToGroup {
    SubAccountID: number;
    GroupName: string;
    GroupID: number;
    Clients: Client[];
}
export interface ManualUploadResults {
    GroupID: number;
    Recipients: number;
    Reason: string;
}
export interface GroupQuery {
    SubAccountID: number;
    PageIndex: number;
    PageSize: number;
    sms: boolean;
    optin: boolean;
    SearchTerm: string;
    IsDynamic: boolean;
}

export interface InputAddGroup {
    GroupName: string;
    IsTestGroup: boolean;
}

export interface ResponsesText {
    INVALID_API_KEY: string;
    DATA_INCORRECT: string;
    ERROR_OCCURED: string;
    GROUP_EXISTS: string;
    SUCCESS: string;
    FEATURE_NOT_ALLOWED: string;
    LIMITATION_RECORDS_PER_REQUEST: string;
}
export interface ResponseMessage {
    StatusCode: number;
    Message: string;
    Summary: ClientsUploadSummary;
}
export interface OutputAddGroup {
    sessionId: string;
    status: string;
    error: string;
    groups: OutputGroup[];
}
export interface OutputGroup {
    status: string;
    error: string;
    groupId: string;
    groupName: string;
    isTestGroup: boolean;
    isDynamicGroup: boolean;
}
