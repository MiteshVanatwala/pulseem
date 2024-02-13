
export interface AutomationNode {
    NodeID: number;
    AutomationID: number | null;
    NodeName: string;
    SourceNodeIDs: string;
    NodeType: number | null;
    TriggerID: number | null;
    ActionID: number | null;
    CampaignID: number | null;
    SegmentationType: number | null;
    SegmentationValue: boolean | null;
    PositionLeft: string;
    PositionTop: string;
}
export enum AutomationTriggers {
    EmailCampaign = 1,
    SMSCampaign = 2,
    LandingPage = 3,
    MMSCampaign = 4,
    Group = 5,
}
export enum AutomationActions {
    AddUserToList = 1,
    RemoveUserFromList = 2,
    SendEmailCampaign = 3,
    SendSMSCamaign = 4,
    SendMMSCampaign = 5,
    UpdateAdmin = 6
}
