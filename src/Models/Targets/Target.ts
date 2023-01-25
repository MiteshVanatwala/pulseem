import { TargetStep } from './TargetStep';
export interface Target {
    TargetID: number;
    SubAccountID: number;
    TargetName: string;
    CreationDate: Date | string | null;
    TargetSteps: TargetStep[];
}