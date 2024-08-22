export interface CompanyWebsiteRequest {
  Email: string | any | null;
  GCLID: string | any | null;
  UtmSource: string | any | null;
  UtmMedium: string | any | null;
  UtmCampaign: string | any | null;
  RequestUrl: string | any | null;
  CampaignName: string | any | null;
  AdSetName: string | any | null;
  AdName: string | any | null;
  WebFormPosition: string | any | null;
  ReferralID: string | any | null;
}

export interface CompanyWebsiteApiResponse {
  IsValid: boolean;
  Errors: string[] | any | null;
  RedirectLink: string | any | null;
}