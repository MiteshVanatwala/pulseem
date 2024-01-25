export type Summary  = {
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
}

export type GroupSummaryProps = {
  classes: any;
  summary: Summary;
};