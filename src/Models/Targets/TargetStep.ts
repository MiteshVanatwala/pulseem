import { TargetLog } from './TargetLog';

export interface TargetStep {
    StepID: number;
    TargetID: number | null;
    StepName: string;
    StepUrl: string;
    TargetsLogs: TargetLog[];
}