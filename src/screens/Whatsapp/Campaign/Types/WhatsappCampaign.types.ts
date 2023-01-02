import { BaseSyntheticEvent } from "react";
import { ClassesType } from "../../../Classes.types";
import { savedTemplateListProps } from "../../Editor/Types/WhatsappCreator.types";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";

export type smsProps = {
  testGroups: [];
};

export type coreProps = {
  windowSize: string;
  isRTL: boolean;
  language: string;
};

export type WhatsappCampaignProps = {
  classes: ClassesType["classes"];
};

export type ButtonsProps = {
  classes: ClassesType["classes"];
  onFormButtonClick: (buttonName: string) => void;
};

export type dynamicButtonProps = {
  tooltipTitle: string;
  buttonTitle: string;
};

export type dynamicModalProps = {
  classes: ClassesType["classes"];
  isDynamcFieldModal: boolean;
  onDynamcFieldModalClose: () => void;
};

export type campaignFielsProps = {
  savedTemplateList: savedTemplateListProps[];
  classes: ClassesType["classes"];
  savedTemplate: string;
  campaignName: string;
  from: string;
  onSavedTemplateChange: (e: BaseSyntheticEvent) => void;
  onCampaignNameChange: (campaignName: string) => void;
  onFromChange: (from: string) => void;
  onCampaignFromRestore: () => void;
};

export type validationAlertModalProps = {
  classes: ClassesType["classes"];
  isOpen: boolean;
  onClose: () => void;
  title: string;
  requiredFields: string[];
};

export type testGroupDataProps = {
  GroupID: number;
  GroupName: string;
  SubAccountID: number;
  CreationDate: string;
  UpdateDate: string;
  IsTestGroup: boolean;
  IsDynamic: boolean;
  Recipients: number;
};

export type testGroupModalProps = {
  classes: ClassesType["classes"];
  isOpen: boolean;
  onClose: () => void;
  onConfirmOrYes: () => void;
  title: string;
  testGroupData: testGroupDataProps[];
  selectedTestGroup: testGroupDataProps[];
  setSelectedTestGroup: (updatedSelectedGroup: testGroupDataProps[]) => void;
};

export type RightPaneProps = {
  classes: ClassesType["classes"];
  handleDatePicker: (updatedDate: MaterialUiPickersDate | null) => void;
  sendDate: MaterialUiPickersDate | null;
  handleFromDate: (updatedHandleFromDate: MaterialUiPickersDate | null) => void;
  sendTime: MaterialUiPickersDate | null;
  setsendTime: (updatedSendTime: MaterialUiPickersDate | null) => void;
  handleRadioTime: (updatedRadioTime: MaterialUiPickersDate | null) => void;
  sendType: string;
  model: {};
  handleSendType: (e: BaseSyntheticEvent) => void;
  toggleA: boolean;
  toggleB: boolean;
  handlebef: () => void;
  handleaf: () => void;
  timePickerOpen: boolean;
  handleTimePicker: (updatedTimePicker: MaterialUiPickersDate | null) => void;
  renderToast: () => void;
  daysBeforeAfter: string;
  handleSpecialDayChange: (e: BaseSyntheticEvent) => void;
  spectialDateFieldID: string;
  handleSelectChange: (e: BaseSyntheticEvent) => void;
};

export type LeftPaneProps = {
  classes: ClassesType["classes"];
  subAccountAllGroups: testGroupDataProps[];
  finishedCampaigns: testGroupDataProps[];
  selectedFilterCampaigns: testGroupDataProps[];
  setFilterCampaigns: (updatedFilterCampaigns: testGroupDataProps[]) => void;
  selectedFilterGroups: testGroupDataProps[];
  setFilterGroups: (updatedFilterGroups: testGroupDataProps[]) => void;
  selectedGroups: testGroupDataProps[];
  setSelected: (updatedSelected: testGroupDataProps[]) => void;
};
export type WhatsappCampaignSecondProps = {
  classes: ClassesType["classes"];
};

export type GroupsProps = {
  classes: ClassesType["classes"];
  list: any[];
  bsDot: boolean;
  selectedList: any[];
  innerHeight: number;
  showSortBy: boolean;
  showFilter: boolean;
  showSelectAll: boolean;
  callbackSelectedGroups: (group: testGroupDataProps) => void;
  callbackUpdateGroups: (value: testGroupDataProps[]) => void;
  callbackSelectAll: () => void;
  callbackReciFilter: () => void;
  callbackShowTestGroup: (showTestGroups: boolean) => void;
  uniqueKey: string;
};

export type FilterRecipientsDialogProps = {
  classes: ClassesType["classes"];
  isFilterModal: boolean;
  onFilterModalClose: () => void;
  subAccountAllGroups: testGroupDataProps[];
  finishedCampaigns: testGroupDataProps[];
  selectedFilterCampaigns: testGroupDataProps[];
  setFilterCampaigns: (updatedFilterCampaigns: testGroupDataProps[]) => void;
  selectedFilterGroups: testGroupDataProps[];
  setFilterGroups: (updatedFilterGroups: testGroupDataProps[]) => void;
};

export type SummaryModalProps = {
  classes: ClassesType["classes"];
  isOpen: boolean;
  campaignName: string;
  fromNumber: string;
  onSummaryModalClose: () => void;
};

export type tagDataProps = {
  children: string;
  className: string;
  highlightIndex: number;
};

export type ColumnAdjustmentModalProps = {
  classes: ClassesType["classes"];
  isColumnAdjustmentModal: boolean;
  onColumnAdjustmentModalClose: () => void;
  headers: string[];
  setheaders: any;
  typedData: string[][];
};

export type DynamicModalFieldsProps = {
  classes: ClassesType["classes"];
  activeDynamicButton: string;
  personalField: string;
  textInput: string;
  linkInput: string;
  navApp: string;
  landPage: string;
  navAddress: string;
  setTextInput: (value: string) => void;
  setPersonalField: (value: string) => void;
  onAddRemovalLink: () => void;
  setLinkInput: (value: string) => void;
  setLandPage: (value: string) => void;
  setNavApp: (value: string) => void;
  setNavAddress: (value: string) => void;
};

export type TestGroupModalRows = {
  classes: ClassesType["classes"];
  searchText: string;
  testGroupData: testGroupDataProps[];
  searchGroupResult: testGroupDataProps[];
  onSelectGroup: (groupID: number) => void;
  isSelectdGroup: (groupID: number) => boolean;
};
