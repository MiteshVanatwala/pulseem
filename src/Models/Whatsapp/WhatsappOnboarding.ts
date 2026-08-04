export type businessInfoInterface = {
  name: string;
  business_verification_status: string;
};

export type phoneNumbersInterface = {
  code_verification_status: string;
  display_phone_number: string;
  id: string;
  platform_type: string;
  quality_rating: string;
  status: string;
  verified_name: string;
  tier?: string;
  limit?: number;
  isCoexistenceEnabled?: boolean;
  isBusinessNumber?: boolean;
  // WhatsAppMetaOnBoardClientsInfo.CreatedOn. Meta only accepts the history sync within
  // 24 hours of onboarding, so the UI needs this to know when that window has closed.
  // Not returned by GetMetaPhoneNumbers yet.
  onboardedOn?: string;
};

export type virtualNumbersInterface = {
  Number: string;
};

export type virtualNumbersCodeListInterface = {
  VirtualNumber: string;
  ReplyDate: string;
  ReplyText: string;
};