import { ClientListRequest } from './Client'

export interface ClientToGroup {
    ClientID: number;
    GroupID: number;
}
export interface ClientsToGroup extends ClientListRequest {
    GroupId: number;
    ClientIds: number[];
}
export interface ClientsToGroupResponse {
    StatusCode: number;
    Message: string;
}
