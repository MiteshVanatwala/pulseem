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
};

export type virtualNumbersInterface = {
  Number: string;
};

export type virtualNumbersCodeListInterface = {
  VirtualNumber: string;
  ReplyDate: string;
  ReplyText: string;
};