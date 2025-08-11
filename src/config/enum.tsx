export enum Direction {
  LeftToRight = 'ltr',
  Center = 'center',
  RightToLeft = 'rtl'
}

export enum Structure {
  Horizontal = 'horizontal',
  Vertical = 'vertical'
}

export enum Items {
  Single = 'single',
  Multiple = 'multiple'
}

export enum EventTypes {
  All = 0,
  Purchase = 1,
  CartAbandon = 2,
  LastViewedProduct = 3
}

export enum AddProductCatalogType {
  Static = 'static',
  Dynamic = 'dynamic'
}

export enum ProductDetails {
  Image = '#productsrc#',
  Name = '#name#',
  Description = '#description#',
  Price = '#price#'
}

export enum PermissionTypes {
  Admin = 'Admin',
  LimitedAccess = 'LimitedAccess',
  ReadOnly = 'ReadOnly'
}
export enum WhatsappCampaignStatus {
  META_BUSINESS_NOTVERIFIED = 11,
  META_PHONENUMBER_NOTVERIFIED = 12
}

export enum WhatsAppPlatformIDEnum {
  TWILLIO = 1,
  META = 2
}

export enum URLS {
  AutomationTemplatePreview = 'CreateAutomations.aspx?Mode=show&AutomationID=',
  ContactUs = 'https://site.pulseem.co.il/%d7%a6%d7%95%d7%a8-%d7%a7%d7%a9%d7%a8/',
  ContactUsEn = 'https://site.pulseem.co.il/en/contact-us/',
  UserGuide = 'https://site.pulseem.co.il/%D7%9E%D7%93%D7%A8%D7%99%D7%9B%D7%99%D7%9D/'
}

export enum LinksClicksReport {
  Newsletter = "newsletter",
  SMS = "sms",
  WhatsApp = "whatsapp"
}