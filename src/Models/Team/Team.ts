export const TEAM_NAME_MAX_LENGTH = 100;

export interface Team {
    TeamID: number;
    TeamName: string;
    AgentIds: number[];
}

export interface SaveTeamPayload {
    TeamID?: number;
    TeamName: string;
    AgentIds: number[];
}
