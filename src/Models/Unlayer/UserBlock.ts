export interface UserBlock {
    SubaccountID: number;
    ID: number;
    Category: string;
    Data: string;
    Tags: string[];
    TagsAsString: string;
}
export interface UserBlockResponse {
    Block: UserBlock;
    StatusCode: number;
    Message: string;
}