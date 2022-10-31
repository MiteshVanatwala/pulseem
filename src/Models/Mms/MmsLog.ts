
export interface MmsLog {
    MmsLogID: number;
    MmsCampaignID: number | null;
    ClientID: number | null;
    Schedule: Date | string | null;
    Status: number | null;
    ErrorType: number | null;
}

export interface MmsLogFuture {
    MmsLogFutureID: number;
    MmsCampaignID: number;
    ClientID: number;
    Schedule: Date | string;
}
