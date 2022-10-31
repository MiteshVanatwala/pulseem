export interface APIResponse {
    new(_statusCode: number, _message: string): APIResponse;
    StatusCode: number;
    Message: string;
}