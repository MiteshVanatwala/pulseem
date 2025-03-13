import { BaseSyntheticEvent, ReactElement } from 'react';
import { ClassesType } from '../../../Classes.types';
import { savedTemplateListProps } from '../../Editor/Types/WhatsappCreator.types';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { SelectChangeEvent } from '@mui/material';

export type smsProps = {
	testGroups: [];
};

export type coreProps = {
	windowSize: string;
	isRTL: boolean;
	language: string;
	isLoader: boolean;
};

export type WhatsappCampaignProps = {
	classes: ClassesType['classes'];
};

export type ButtonsProps = {
	classes: ClassesType['classes'];
	onFormButtonClick: (buttonName: string) => void;
};

export type dynamicButtonProps = {
	tooltipTitle: string;
	buttonTitle: string;
};

export type dynamicModalProps = {
	classes: ClassesType['classes'];
	onDynamcFieldModalClose: () => void;
	onDynamcFieldModalSave: (updatedDynamicVariable: updatedVariable[]) => void;
	personalFields: personalFieldDataProps;
	dynamicModalVariable: number;
	landingPageData: landingPageDataProps[];
	dynamicVariable: updatedVariable[];
	isTrackLink: boolean;
	setIsTrackLink: (isTrackLink: boolean) => void;
	savedTemplate: string;
	templateCategory?: number;
};

export type campaignFielsProps = {
	savedTemplateList: savedTemplateListProps[];
	classes: ClassesType['classes'];
	savedTemplate: string;
	campaignName: string;
	from: string;
	onSavedTemplateChange: (templateId: string) => void;
	onCampaignNameChange: (campaignName: string) => void;
	onFromChange: (from: string) => void;
	showValidation: boolean;
	phoneNumbersList: string[];
};

export type validationAlertModalProps = {
	classes: ClassesType['classes'];
	isOpen: boolean;
	onClose: () => void;
	title: string;
	requiredFields: string[];
};

export type SendCampaignSuccessModalProps = {
	classes: ClassesType['classes'];
	isFromAutomation?: boolean;
	onBackToHome: () => void;
	onBackToCampaigns: () => void;
	onBackToAutomation?: () => void;
};

export type infoModalProps = {
	classes: ClassesType['classes'];
	isOpen: boolean;
	onClose: () => void;
	title: string;
	requiredFields: string[];
};

export type testGroupDataProps = {
	GroupID: number;
	WACampaignID?: number;
	GroupName: string;
	SubAccountID: number;
	CreationDate: string;
	UpdateDate: string;
	IsTestGroup: boolean;
	IsDynamic: boolean;
	Recipients: number;
};

export type selectedFilterCampaignsProps = {
	WACampaignID: number;
	Name: string;
};

export type testGroupModalProps = {
	classes: ClassesType['classes'];
	isOpen?: boolean;
	onClose: () => void;
	onConfirmOrYes: () => void;
	title: string;
	testGroupData: testGroupDataProps[];
	selectedTestGroup: testGroupDataProps[];
	setSelectedTestGroup: (updatedSelectedGroup: testGroupDataProps[]) => void;
};

export type RightPaneProps = {
	classes: ClassesType['classes'];
	handleDatePicker: (updatedDate: MaterialUiPickersDate | null) => void;
	sendDate: MaterialUiPickersDate | null;
	sendTime: MaterialUiPickersDate | null;
	handleRadioTime: (updatedRadioTime: MaterialUiPickersDate | null) => void;
	sendType: string;
	handleSendType: (e: BaseSyntheticEvent) => void;
	timePickerOpen: boolean;
	handleTimePicker: (updatedTimePicker: MaterialUiPickersDate | null) => void;
	daysBeforeAfter: string;
	handleSpecialDayChange: (e: BaseSyntheticEvent) => void;
	spectialDateFieldID: string;
	handleSelectChange: (e: SelectChangeEvent) => void;
	isSpecialDateBefore: boolean;
	setIsSpecialDateBefore: (value: boolean) => void;
	specialDatedropDown: specialDateDropDownPayload | undefined;
	selectedGroups: testGroupDataProps[];
	pulseSendingOpen: () => void;
	packetSending: ReactElement;
	randomSending: ReactElement;
};

export type LeftPaneProps = {
	classes: ClassesType['classes'];
	allGroupList: testGroupDataProps[];
	testGroupList: testGroupsProps[];
	finishedCampaigns: selectedFilterCampaignsProps[];
	selectedFilterCampaigns: selectedFilterCampaignsProps[];
	setFilterCampaigns: (
		updatedFilterCampaigns: selectedFilterCampaignsProps[]
	) => void;
	selectedFilterGroups: testGroupDataProps[];
	setFilterGroups: (updatedFilterGroups: testGroupDataProps[]) => void;
	selectedGroups: testGroupDataProps[];
	setSelected: (updatedSelected: testGroupDataProps[]) => void;
	onNewGroupChange: (value: string) => void;
	newGroupName: string;
	onNewGroupSave: () => void;
	activeTab: string;
	setActiveTab: (tab: 'group' | 'manual') => void;
	onFilter: () => void;
	isCreateNewGroup: boolean;
	setIsCreateNewGroup: (val: boolean) => void;
	onManualUpload: (
		groupName: string,
		uploadData: uploadData,
		uploadedAsFile: boolean
	) => void;
	exceptionalDaysToggle: boolean;
	exceptionalDays: string;
	setExceptionalDaysToggle: (exceptionalDaysToggle: boolean) => void;
	setExceptionalDays: (exceptionalDays: string) => void;
	showTestGroups: boolean;
	setShowTestGroups: (showTestGroups: boolean) => void;
};
export type WhatsappCampaignSecondProps = {
	classes: ClassesType['classes'];
};

export type GroupsProps = {
	classes: ClassesType['classes'];
	list: testGroupDataProps[];
	isFilterSelected: boolean;
	selectedList: testGroupDataProps[];
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
	showTestGroups: boolean;
};

export type CampaignGroupsProps = {
	classes: ClassesType['classes'];
	list: selectedFilterCampaignsProps[];
	isFilterSelected: boolean;
	selectedList: selectedFilterCampaignsProps[];
	innerHeight: number;
	showSortBy: boolean;
	showFilter: boolean;
	showSelectAll: boolean;
	callbackSelectedGroups: (group: selectedFilterCampaignsProps) => void;
	callbackUpdateGroups: (value: selectedFilterCampaignsProps[]) => void;
	callbackSelectAll: () => void;
	callbackReciFilter: () => void;
	callbackShowTestGroup: (showTestGroups: boolean) => void;
	uniqueKey: string;
};

export type FilterRecipientsDialogProps = {
	classes: ClassesType['classes'];
	isFilterModal: boolean;
	onFilterModalClose: () => void;
	allGroupList: testGroupDataProps[];
	finishedCampaigns: selectedFilterCampaignsProps[];
	selectedFilterCampaigns: selectedFilterCampaignsProps[];
	setFilterCampaigns: (
		updatedFilterCampaigns: selectedFilterCampaignsProps[]
	) => void;
	selectedFilterGroups: testGroupDataProps[];
	setFilterGroups: (updatedFilterGroups: testGroupDataProps[]) => void;
	onConfirmOrYes: () => void;
	exceptionalDaysToggle: boolean;
	exceptionalDays: string;
	setExceptionalDaysToggle: (exceptionalDaysToggle: boolean) => void;
	setExceptionalDays: (exceptionalDays: string) => void;
};

export type SummaryModalProps = {
	classes: ClassesType['classes'];
	campaignName: string;
	fromNumber: string;
	onSummaryModalClose: () => void;
	onConfirmOrYes: () => void;
	selectedGroups: testGroupDataProps[];
	selectedFilterGroups: testGroupDataProps[];
	selectedFilterCampaigns: selectedFilterCampaignsProps[];
	sendType: string;
	sendDate: MaterialUiPickersDate | null;
	sendTime: MaterialUiPickersDate | null;
	isSpecialDateBefore: boolean;
	daysBeforeAfter: string;
	specialDatedropDown: specialDateDropDownPayload | undefined;
	spectialDateFieldID: string;
	campaignSummary: ApiGetCampaignSummaryPayloadData | undefined;
	randomlyCount: string;
	setRandomlyCount: (value: string) => void;
	resetRandomCount: () => void;
	pulseData?: any;
};

export type ApiSendCampaignData = {
	WACampaignID: number;
	Random?: number;
};

export type tagDataProps = {
	children: string;
	className: string;
	highlightIndex: number;
};

export type DynamicModalFieldsProps = {
	classes: ClassesType['classes'];
	activeDynamicButton: string;
	personalField: string;
	textInput: string;
	linkInput: string;
	navApp: string;
	landPage: string;
	navAddress: string;
	setTextInput: (value: string) => void;
	setPersonalField: (value: string) => void;
	onAddRemovalLink: (isTrackLink: boolean) => void;
	setLinkInput: (value: string, isTrackLink: boolean, fallbackUrl?: string) => void;
	setLandPage: (value: string, isTrackLink?: boolean) => void;
	setNavApp: (value: string) => void;
	setNavAddress: (value: string) => void;
	personalFields: personalFieldDataProps;
	landingPageData: landingPageDataProps[];
	isTrackLink: boolean;
	dynamicProductType: string,
	setDynamicProductType: (value: string) => void,
	dynamicProductFallbackURL: string,
	setDynamicProductFallbackURL: (value: string) => void
};

export type TestGroupModalRowsProps = {
	classes: ClassesType['classes'];
	searchText: string;
	testGroupData: testGroupDataProps[];
	searchGroupResult: testGroupDataProps[];
	onSelectGroup: (groupID: number) => void;
	isSelectdGroup: (groupID: number) => boolean;
};

export type personalFieldAPIProps = {
	payload: personalFieldDataProps;
};

export type phoneNumberAPIDataProps = {
	Data: string[];
	Status: string;
};

export type phoneNumberAPIProps = {
	payload: phoneNumberAPIDataProps;
};

export type personalFieldDataProps = {
	[key: string]: string;
};

export type landingPageAPIProps = {
	payload: landingPageDataProps[];
};

export type landingPageDataProps = {
	CampaignID: number;
	CampaignName: string;
	PageHref: string;
};

export type updatedVariable = {
	FieldTypeId: number;
	VariableIndex: number;
	VariableValue: string;
	IsStatastic: boolean;
	FallbackUrl?: string;
};

export type smsReducerProps = {
	testGroups: testGroupsProps[];
};

export type SubAccountSettings = {
	DomainAddress: string;
	WhatsappTierID: null | string;
};

export type testGroupsProps = {
	CreationDate: string;
	GroupID: number;
	GroupName: string;
	IsDynamic: boolean;
	IsTestGroup: boolean;
	Recipients: number;
	SubAccountID: number;
	UpdateDate: string;
};

export type saveCampaignDataProps = {
	WACampaignID: number;
	TemplateId: string;
	Variables: updatedVariable[];
	name: string;
	fromnumber: string;
	IsTestCampaign: boolean;
};

export type saveCampaignResponsePayloadProps = {
	Data: { WACampaignId: number };
	ErrorCode: number;
	Message: string | null;
	Status: string;
};

export type saveCampaignResponseProps = {
	payload: saveCampaignResponsePayloadProps;
};

export type groupsListProps = {
	classes: ClassesType['classes'];
	list: any;
	groupNameSearch: any;
	selectedList: any;
	onSelectGroup: (group: testGroupDataProps) => void;
	from: 'group' | 'campaign';
};

export type GroupsSelectAllProps = {
	classes: ClassesType['classes'];
	onSelectAllGroup: () => void;
	allSelected: boolean;
};

export type campaignDataProps = {
	AutomationID: number;
	AutomationTriggerInActive: boolean;
	CreateDate: string;
	CreditsPerSms: number;
	Groups: string[] | string | null;
	IsDeleted: boolean;
	Name: string;
	SendDate: string | null;
	Status: number;
	TotalSendPlan: number;
	UpdateDate: string;
	WACampaignID: number;
	TemplateId: string;
};

export type searchArrayProps = {
	type: 'name' | 'date';
	fromDate?: MaterialUiPickersDate | undefined;
	toDate?: MaterialUiPickersDate | undefined;
	campaignName?: string;
};

export type filtersObjectProps = {
	name: any;
	date: any;
};

export type reportDataProps = {
	WACampaignID: number;
	statusId: number;
	Status: number;
	Name: string;
	ToSend: number;
	Sent: number;
	Read: number;
	ClicksCount: number;
	UniqueClicksCount: number;
	FeedBack: number;
	Removed: number;
	Failed: number;
	CreateDate: string;
	UpdateDate: string;
	SendDate: string;
	FromNumber: string;
	TemplateID: string;
	Revenue: number;
	Cost: number;
};

export type exportDataProps = {
	WACampaignID: number;
	statusId?: number;
	Status: string;
	Name: string;
	ToSend: number;
	Sent: number;
	Read: number;
	ClicksCount: number;
	UniqueClicksCount: number;
	FeedBack?: number;
	Removed: number;
	Failed: number;
	CreateDate: string;
	FromNumber: string;
	TemplateID?: string;
	Cost: number;
	Revenue?: number;
	UpdateDate: string;
};

export type groupSelectorProps = {
	classes: ClassesType['classes'];
	showTestGroups: boolean;
	testGroupList: testGroupsProps[];
	allGroupList: testGroupDataProps[];
	selectedGroups: testGroupDataProps[];
	isFilterSelected: boolean;
	isCreateNewGroup: boolean;
	setIsCreateNewGroup: (isNewGroup: boolean) => void;
	onNewGroupChange: (groupName: string) => void;
	newGroupName: string;
	onNewGroupSave: () => void;
	setSelected: (selectedGroup: testGroupDataProps[]) => void;
	allGroupsSelected: boolean;
	setIsFilterModal: (isFilterModal: boolean) => void;
	setAllGroupsSelected: (allGroupsSelected: boolean) => void;
	setShowTestGroups: (showTestGroups: boolean) => void;
};

export type gropListAPIProps = {
	meta: { requestStatus: string };
	type: string;
	payload: testGroupDataProps[];
};

export type CampaignDetailByIdData = {
	ClicksCount: number;
	CreateDate: string;
	CreditsPerSms: number;
	FromNumber: string;
	IsTestCampaign: false;
	LogicalDeleted: false;
	Name: string;
	SendDate: number;
	SendingMethod: number;
	Status: number;
	SubAccountID: number;
	TemplateID: string;
	TotalSendPlan: number;
	UniqueClicksCount: number;
	UpdateDate: string;
	VariableValues: updatedVariable[];
	WACampaignID: number;
};

export type CampaignDetailByIdPayload = {
	Data: CampaignDetailByIdData;
	Message: string;
	Status: string;
};

export type CampaignDetailById = {
	payload: CampaignDetailByIdPayload;
};

export type createCombinedGroupData = {
	payload: testGroupDataProps;
};

export type APIManualUploadDataPayload = {
	GroupID: number;
	Reason: string;
	Recipients: number;
};

export type APIManualUploadData = {
	payload: APIManualUploadDataPayload;
};

export type ApiSaveCampaignSettingsData = {
	WACampaignID: number;
	SendTypeID: number;
	Groups: number[];
	SendExeptional?: {
		/**
		 * To Send Campaign on particlar occation with dates and groups.
		 * (for example, If you want to send campaign on particular date
		 * and you have selected groups but you don't want to send last
		 * campaign recipients then you can add here)
		 **/
		IsExceptionalGroups?: boolean;
		Groups?: number[];
		IsExceptionSmsCampaigns?: boolean;
		Campaigns?: number[];
		ExceptionalDays?: number;
	};
	RandomSettings?: {
		/**
		 * RandomAmount is a user number to whom you want to send a message
		 **/
		RandomAmount?: number;
	};
	specialsettings?: {
		datefieldid?: number;
		day?: number;
		intervaltypeid?: number;
		sendhour?: string;
	};
	FutureDateTime?: string;
	PulseSettings?: {
		PulseAmount: number;
		PulseSettingsId: number;
		PulseType: number;
		TimeInterval: number;
		TimeType: number;
	};
};

export type ApiSaveCampaignSettingsPayload = {
	Message: string;
	Status: string;
};

export type ApiSaveCampaignSettings = {
	payload: ApiSaveCampaignSettingsPayload;
};

export type ApiCreateGroupPayload = {
	GroupName: string;
	IsTestGroup: boolean;
};

export type uploadDataClientsData = {
	[key: string]: string;
};
export type uploadDataMapping = {
	Index: number;
	Title: string;
};

export type uploadData = {
	ClientsData: uploadDataClientsData[];
	GroupIds: number[];
	Mapping: uploadDataMapping[];
};

export type APICreateGroupDataPayload = {
	Message: string;
	StatusCode: number;
};

export type APICreateGroupData = {
	payload: APICreateGroupDataPayload;
};

export type uploadClientDataPayload = {
	Message: string;
	StatusCode: number;
	Summary: {
		DuplicateCellphones: number;
		DuplicateEmails: number;
		ExistingCellphones: number;
		ExistingEmails: number;
		InvalidOrEmptyCellphones: number;
		InvalidOrEmptyEmails: number;
		TotalDuplicates: number;
		TotalInvalidOrEmptyAddresses: number;
		TotalRecords: number;
		TotalValidUploadedRecords: number;
	};
};

export type uploadClientData = {
	payload: uploadClientDataPayload;
};

export type specialDateDropDownPayload = {
	[key: string]: string;
};

export type specialDateDropDownData = {
	payload: specialDateDropDownPayload;
};

export type campaignSettingsPayloadData = {
	WACampaignID: number;
	SendTypeID: number;
	Groups: number[];
	FutureDateTime: string | null;
	SendExeptional?: {
		/**
		 * To Send Campaign on particlar occation with dates and groups.
		 * (for example, If you want to send campaign on particular date
		 * and you have selected groups but you don't want to send last
		 * campaign recipients then you can add here)
		 **/
		IsExceptionalGroups?: boolean;
		Groups?: number[];
		IsExceptionSmsCampaigns?: boolean;
		Campaigns?: number[];
		ExceptionalDays?: number;
		ExceptionalID?: number;
	};
	PulseSettings?: {
		PulseAmount: number;
		PulseSettingsId: number;
		PulseType: number;
		TimeInterval: number;
		TimeType: number;
	};
	RandomSettings?: {
		ID: number;
		RandomAmount: number;
	};
	SpecialSettings?: {
		DateFieldID?: number;
		Day?: number;
		IntervalTypeID?: number;
		SendHour?: string;
		SendDate?: string;
		SpecialSettingId?: number;
	};
};

export type campaignSettingsPayload = {
	Data: campaignSettingsPayloadData;
	Message: string;
	Status: string;
};

export type campaignSettingsData = {
	payload: campaignSettingsPayload;
};

export type GetTestGroups = {
	payload: testGroupDataProps[];
};

export type whatsappCampaignNameFilterPayloadData = {
	WACampaignID: number;
	Name: string;
};

export type whatsappCampaignNameFilterPayload = {
	Data: whatsappCampaignNameFilterPayloadData[];
	Message: string;
	Status: string;
};

export type whatsappCampaignNameFilterData = {
	payload: whatsappCampaignNameFilterPayload;
};
export type ApiGetCampaignSummaryPayloadData = {
	ClientTotalCount: number;
	ClientUniqCount: number;
	DuplicateCellphoneSharedWithClienCount: number;
	EmptyCellphoneCount: number;
	ExceptionalDayClientCount: number;
	ExceptionalGroupsClientCount: number;
	ExceptionalWACampaignClientCount: number;
	FinalCount: number;
	Invalid: number;
	Removed: number;
	SpecialSettingUniqCount: number;
	WhatsappSmsLeft: number;
	NextAvailableTime: string;
	WhatsappTierID: number;
};

export type ApiGetCampaignSummaryPayload = {
	Data: ApiGetCampaignSummaryPayloadData;
	Message: string;
	Status: string;
};

export type ApiGetCampaignSummary = {
	payload: ApiGetCampaignSummaryPayload;
};

export type ApiSendCampaignPayload = {
	Message: string;
	Status: string;
};

export type ApiSendCampaign = {
	payload: ApiSendCampaignPayload;
};

export type ApiQuickSendPayload = {
	Data?: {
		NextAvailableTime?: string;
	};
	Message: string;
	Status: string;
	StatusCode: number;
};

export type ApiQuickSend = {
	payload: ApiQuickSendPayload;
};

export type SiteTrackAlertModalProps = {
	classes: ClassesType['classes'];
	isOpen: boolean;
	onClose: () => void;
	onOkay: () => void;
};

export type TestSendReq = {
	WACampaignID: number;
	TestGroupsIds?: number[];
	PhoneNumber?: string;
	Random?: number;
};

export type SaveQuickSendGroupReq = {
	WACampaignID: number;
	TestGroupsIds: number[];
};

export type SaveQuickSendGroupsPayload = {
	Data: null;
	Message: string | null;
	Status: string;
};

export type SaveQuickSendGroups = {
	payload: SaveQuickSendGroupsPayload;
};

export type PulseemAPIDataProps = {
	Data: any;
	Status: string;
};

export type PulseemApiProps = {
	payload: PulseemAPIDataProps;
};

export interface WhatsappAgent {
	AgentId: number;
	Name: string;
	IsDeleted: boolean;
	CreationDate?: Date | string;
	UpdatedDate?: Date | string | null;
	Sessions?: WhatsappSessionToClient[] | null | never;
	ChatSessions?: string | null
}

export interface WhatsappSessionToClient {
	ChatSessionId: number;
	ClientId: number;
	Cellphone: string;
}