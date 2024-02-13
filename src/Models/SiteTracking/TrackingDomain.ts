export interface TrackingDomain {
    SiteID: string;
    SubAccountId: number;
    DomainAddress: string;
}
export interface RevenueResponse {
    campaignId: string;
    statusCode: number;
    count: number;
    data: CampaignRevenue[];
    clients: RevenueClient[];
    totalRevenue: number;
    error: string;
    message: string;
}
export interface RevenueClient {
    id: string;
    totalRevenue: number;
}
export interface CampaignRevenue {
    campaignId: string;
    totalRevenue: number;
}
export enum SetDomainResult {
    FAILED = -1,
    DOMAIN_EXISTS = 0,
    SUCCESS = 1,
}