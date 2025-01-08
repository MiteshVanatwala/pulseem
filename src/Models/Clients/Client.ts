import { AccountExtraFields } from "../Account/AccountExtraFields";
import { ClientSearchModel } from '../Clients/ClientSearch'
import { AutomationActions, AutomationTriggers } from '../Automations/AutomationNode'
import { Columns } from '../Files/FileUpload';
export enum RemovingOption {
    Both = 0,
    Email = 1,
    Sms = 2
}
export enum ClientStatus {
    NoEmail = -1,
    Active = 1,
    Removed = 2,
    Restricted = 3,
    Invalid = 4,
    Pending = 5
}
export enum SmsStatus {
    NoSms = -1,
    Active = 0,
    Removed = 1,
    Invalid = 4
}
export interface Client {
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
    BirthDate: Date | string | null;
    ReminderDate: Date | string | null;
    LastSendDate: Date | string | null;
    CreationDate: Date | string | null;
    FailedSendingCounter: number | null;
    IsWebService: boolean | null;
    LastEmailOpened: Date | string | null;
    LastEmailClicked: Date | string | null;
    BestEmailOpenTime: number | null;
    AdditionalData: string[];
    RegistrationOn: string;
    SubmitDates: string[] | null | any;

}

export interface AddClientData {
    ClientID: number;
    SubAccountID: number;
    Email: string;
    Status: number | null;
    SmsStatus: number | null;
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
    BirthDate: string;
    ReminderDate: string;
    LastSendDate: Date | string | null;
    CreationDate: Date | string | null;
    FailedSendingCounter: number | null;
    IsWebService: boolean | null;
    LastEmailOpened: Date | string | null;
    LastEmailClicked: Date | string | null;
    BestEmailOpenTime: number | null;
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
    Overwrite: boolean;
    OverwriteOption: OverwriteOption;
}

export enum OverwriteOption {
    OverwriteWithNotEmptyValuesOnly = 0,
    OverwriteAlways = 1
}

export interface AddClientInput {
    ClientsData: AddClientData[];
    GroupIds: number[];
    Mapping: Columns[];
}
export interface ClientsUploadSummary {
    TotalValidUploadedRecords: number;
    TotalDuplicates: number;
    TotalInvalidOrEmptyAddresses: number;
    TotalRecords: number;
    InvalidOrEmptyEmails: number;
    ExistingEmails: number;
    DuplicateEmails: number;
    InvalidOrEmptyCellphones: number;
    ExistingCellphones: number;
    DuplicateCellphones: number;
}
export interface RemovedClients {
    Cellphone: string;
    SmsStatus: number;
}
export interface ReactivateRequest {
    From: string;
    To: string;
    ErrorCode: number;
    UserID: string;
}
export interface ReactivateSmsRequest {
    To: string;
    UserID: number;
}
export interface ClientListRequest {
    SubAccountID: number;
    PageSize: number;
    PageIndex: number;
    SearchTerm: string;
    Status: number | null;
    PageType: ePageType;
    ReportType: eReportType;
    TestStatusOfEmailElseSms: number | null;
    CampaignID: number | null;
    Switch: string;
    CountryOrRegion: string;
    GroupIds: number[];
    SearchInput: ClientSearchModel;
    FromDate: Date | string | null;
    ToDate: Date | string | null;
    GroupName: string;
    RemovingOption: RemovingOption;
    OrderBy: OrderBy | null;
    NodeID: number | null;
    ActionType: AutomationActions | null;
    TriggerType: AutomationTriggers | null;
    UnsubscribeOption: eUnsubscribeOption;
}
export interface ClientListResponse {
    Clients: ClientResponse[];
    StatusCode: number;
    Message: string;
    TotalCount: number;
    TotalRevenue: number;
    CampaignClicks: number | null;
    ClientIds: number[];
    GroupIds: string;
}
export interface ClientResponse extends Client {
    OpenTime: string;
    LogSms_ErrorType: number | null;
    PageType: ePageType;
    snt_OpeningCount: number | null;
    int_Country: string;
    inf_City: string;
    Revenue: number;
    snt_OpeningDate: Date | string | null;
    SentDate: Date | string | null;
    ErrorTypeText: string;
    // USED ONLY FOR EXPORT
    ExtraDate1: Date | string | null;
    ExtraDate2: Date | string | null;
    ExtraDate3: Date | string | null;
    ExtraDate4: Date | string | null;
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
export enum ePageType {
    Undefined,
    OpenedCampaignID,
    LandingPageID,
    FormID,
    SentToCampaignID,
    RemovedClientsCampaignID,
    NotOpenedCampaignID,
    ClientStatus,
    TotalCountSMSCampaignID,
    SuccessCountSMSCampaignID,
    FailureCountSMSCampaignID,
    RemovedCountSMSCampaignID,
    MmsCountCampaignID,
    StatCountryRegion,
    StatCity,
    Revenue,
    ShowGroup
}
export enum eReportType {
    ShowGroup = 0,
    ShowMails = 10,
    ShowMailsActive = 11,
    ShowMailsRemoved = 12,
    ShowMailsErrored = 13,
    ShowSms = 20,
    ShowSmsActive = 21,
    ShowSmsRemoved = 22,
    ShowSmsErrored = 23
}
export interface ClientResponsesText {
    INVALID_API_KEY: string;
    DATA_INCORRECT: string;
    ERROR_OCCURED: string;
    CLIENT_EXISTS: string;
    SUCCESS: string;
    UPLOAD_IN_PROGRESS: string;
    FOLDER_NOT_FOUND: string;
    INVALID_GROUP_ID: string;
    INVALID_CLINET_ID: string;
}
export interface ClientsDataOutputModel {
    SessionId: string;
    Status: string;
    Error: string;
    ClientsUploadSummary: ClientsUploadSummary;
}
export interface DeleteRecipientsFromGroupsInput {
    GroupIDs: number[];
    ListOfValues: string[];
}
export interface UnsubscribeRecipientsInput {
    ListOfValues: string[];
    RemovingOption: RemovingOption;
    UnsubscribeOption: eUnsubscribeOption;
}
export interface ClientEmailStatus {
    Email: string;
    EmailStatus: ClientStatus;
    RemovingOption: RemovingOption;
}
export interface UpdateClientStatusInput {
    ClientID: number;
    RemovingOption: RemovingOption;
    UnsubscribeOption: eUnsubscribeOption;
    SmsStatus: SmsStatus;
    EmailStatus: ClientStatus;
}
export enum OrderBy {
    UNDEFINED = -1,
    DESC = 0,
    ASC = 1
}
export enum eUnsubscribeOption {
    NULL = -1,
    SPECIFIC_CLIENT_DATA = 0,
    ALL_CLIENT_DATA = 1
}