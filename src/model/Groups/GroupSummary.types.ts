export type Summary = {
  TotalValidUploadedRecords: string;
  TotalInvalidOrEmptyAddresses: string;
  TotalDuplicates: string;
  TotalRecords: string;
  InvalidOrEmptyEmails: string;
  DuplicateEmails: string;
  ExistingEmails: string;
  InvalidOrEmptyCellphones: string;
  DuplicateCellphones: string;
  ExistingCellphones: string;
  TotalUploaded: string;
  TotalErrors: string;
  EmailSuccess: string;
  EmailInvalid: string;
  EmailDuplicates: string;
  EmailExists: string;
  PhoneSuccess: string;
  PhoneInvalid: string;
  PhoneDuplicates: string;
  PhoneExists: string;
}

export type GroupSummaryProps = {
  classes: any;
  summary: Summary;
};