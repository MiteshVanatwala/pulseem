export const TEAM_NAME_MAX_LENGTH = 100;

export interface Team {
    Id: number;
    Name: string;
    AgentIds: number[];
}

export interface SaveTeamPayload {
    Id?: number;
    Name: string;
    AgentIds: number[];
}
