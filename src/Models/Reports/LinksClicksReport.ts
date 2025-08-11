// Define interfaces
export interface LinkClickItem {
  LinkID: number;
  Url: string;
  CampaignID: number;
  ClickCount: number;
  ClickUniq: number;
  ClickVerified: number;
}

export interface LinksClicksReportState {
  linksClicksData: LinkClickItem[] | null;
  loading: boolean;
  error: string;
}

// Define the payload interface for the API request
export interface GetLinksClicksReportPayload {
  CampaignID: number;
  IsParent?: boolean;
  Culture?: string;
  type?: string;
  IsVerified?: boolean;
}