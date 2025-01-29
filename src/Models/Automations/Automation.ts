import { AutomationNode } from './AutomationNode';

export interface Automation {
    ID: number;
    AutomationID: number;
    Name: string;
    IsDeleted: boolean | null;
    IsActive: boolean | null;
    Description: string;
    TotalActivities: number | null;
    Status: number | null;
    CreatedDate: Date | string | null;
    ModifiedDate: Date | string | null;
    SubAccountID: number | null;
    ActivatedOn: Date | string | null;
    ActiveDaysCount: number | null;
    Recipients: number | null;
    AutomationNodes: AutomationNode ;
    HasNodes: boolean;
}


export interface AutomationTemplate {
    AutomationId: number;
    Name: string;
    NameHe: string;
    IsDeleted: boolean | null;
    IsActive: boolean | null;
    Description: string;
    DescriptionHe: string;
    CreatedDate: Date | string | null;
}