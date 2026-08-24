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
  // True once Meta's one-time 6-month history backfill has been triggered for this
  // number. Spelling matches the API response exactly - do not "fix" it here.
  isLast6MonthsRecordCoexistance?: boolean;
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