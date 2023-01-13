import { BaseSyntheticEvent } from 'react';
import { ClassesType } from '../../../Classes.types';
import { savedTemplateListProps } from '../../Editor/Types/WhatsappCreator.types';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';

export type smsProps = {
	testGroups: [];
};

export type coreProps = {
	windowSize: string;
	isRTL: boolean;
	language: string;
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
	isDynamcFieldModal: boolean;
	onDynamcFieldModalClose: () => void;
	onDynamcFieldModalSave: (
		updatedDynamicVariable: updatedVariableProps[]
	) => void;
	personalFields: personalFieldDataProps;
	dynamicModalVariable: number;
	landingPageData: landingPageDataProps[];
	dynamicVariable: updatedVariableProps[];
};

export type campaignFielsProps = {
	savedTemplateList: savedTemplateListProps[];
	classes: ClassesType['classes'];
	savedTemplate: string;
	campaignName: string;
	from: string;
	onSavedTemplateChange: (e: BaseSyntheticEvent) => void;
	onCampaignNameChange: (campaignName: string) => void;
	onFromChange: (from: string) => void;
	onCampaignFromRestore: () => void;
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

export type infoModalProps = {
	classes: ClassesType['classes'];
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
	classes: ClassesType['classes'];
	isOpen: boolean;
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
	setsendTime: (updatedSendTime: MaterialUiPickersDate | null) => void;
	handleRadioTime: (updatedRadioTime: MaterialUiPickersDate | null) => void;
	sendType: string;
	handleSendType: (e: BaseSyntheticEvent) => void;
	timePickerOpen: boolean;
	handleTimePicker: (updatedTimePicker: MaterialUiPickersDate | null) => void;
	daysBeforeAfter: string;
	handleSpecialDayChange: (e: BaseSyntheticEvent) => void;
	spectialDateFieldID: string;
	handleSelectChange: (e: BaseSyntheticEvent) => void;
	isSpecialDateBefore: boolean;
	setIsSpecialDateBefore: (value: boolean) => void;
};

export type LeftPaneProps = {
	classes: ClassesType['classes'];
	allGroupList: testGroupDataProps[];
	testGroupList: testGroupsProps[];
	finishedCampaigns: testGroupDataProps[];
	selectedFilterCampaigns: testGroupDataProps[];
	setFilterCampaigns: (updatedFilterCampaigns: testGroupDataProps[]) => void;
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
};

export type FilterRecipientsDialogProps = {
	classes: ClassesType['classes'];
	isFilterModal: boolean;
	onFilterModalClose: () => void;
	allGroupList: testGroupDataProps[];
	finishedCampaigns: testGroupDataProps[];
	selectedFilterCampaigns: testGroupDataProps[];
	setFilterCampaigns: (updatedFilterCampaigns: testGroupDataProps[]) => void;
	selectedFilterGroups: testGroupDataProps[];
	setFilterGroups: (updatedFilterGroups: testGroupDataProps[]) => void;
	onConfirmOrYes: () => void;
};

export type SummaryModalProps = {
	classes: ClassesType['classes'];
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
	classes: ClassesType['classes'];
	isColumnAdjustmentModal: boolean;
	onColumnAdjustmentModalClose: () => void;
	headers: string[];
	setheaders: (headers: string[]) => void;
	typedData: string[][];
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
	setLinkInput: (value: string, isTrackLink: boolean) => void;
	setLandPage: (value: string) => void;
	setNavApp: (value: string) => void;
	setNavAddress: (value: string) => void;
	personalFields: personalFieldDataProps;
	landingPageData: landingPageDataProps[];
	isTrackLink: boolean;
	setIsTrackLink: () => void;
};

export type TestGroupModalRowsProps = {
	classes: ClassesType['classes'];
	searchText: string;
	testGroupData: testGroupDataProps[];
	searchGroupResult: testGroupDataProps[];
	onSelectGroup: (groupID: number) => void;
	isSelectdGroup: (groupID: number) => boolean;
};

export type selectArrayProps = {
	isdisabled: boolean;
	idx: number;
	value: string;
	label: string;
};

export type personalFieldAPIProps = {
	payload: personalFieldDataProps;
};

export type phoneNumberAPIProps = {
	payload: string[];
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

export type updatedVariableProps = {
	FieldTypeId: number;
	VariableIndex: number;
	VariableValue: string;
	IsStatastic: boolean;
};

export type smsReducerProps = {
	testGroups: testGroupsProps[];
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
	Variables: updatedVariableProps[];
	name: string;
	fromnumber: string;
	IsTestCampaign: boolean;
};

export type saveCampaignResponsePayloadProps = {
	Data: { WACampaignId: number };
	ErrorCode: number;
	Message: string | null;
	Status: number;
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
};

export type GroupsSelectAllProps = {
	classes: ClassesType['classes'];
	onSelectAllGroup: () => void;
	allSelected: boolean;
};

export type campaignDataProps = {
	campaignId: number;
	campaignName: string;
	statusId: number;
	status: string;
	recipients: number;
	messages: number;
	IsAutomation: boolean;
	updatedDate: string;
	sendDate: string | null;
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
	waCampaignId: number;
	statusId: number;
	status: string;
	campaignName: string;
	totalSendPlan: number;
	totalSent: number;
	totalRead: number;
	clicksCount: number;
	uniqueClicksCount: number;
	totalFeedback: number;
	removed: number;
	failure: number;
	updatedDate: string | null;
	sendDate: string | null;
};

export type exportDataProps = {
	waCampaignId: number;
	statusId?: number;
	status: string;
	campaignName: string;
	totalSendPlan: number;
	totalSent: number;
	totalRead: number;
	clicksCount: number;
	uniqueClicksCount: number;
	totalFeedback: number;
	removed: number;
	failure: number;
	updatedDate: string | null;
	sendDate: string | null;
};

export type manualUploadProps = {
	classes: ClassesType['classes'];
	highlighted: boolean;
	areaData: string;
	setHighlighted: (value: boolean) => void;
	setAreaData: (areaData: string) => void;
	setContacts: (contacts: number[]) => void;
	setTypedData: (typedData: string[][]) => void;
	setTotalRecords: (totalRecords: number) => void;
	setInitialHeadState: (headState: string[]) => void;
	setHeaders: (headState: string[]) => void;
	setIsColumnAdjustmentModal: (columnAdjustmentModal: boolean) => void;
	setAlertModalSubtitle: (alertModalSubtitle: string) => void;
	setIsAlert: (isAlert: boolean) => void;
	totalRecords: number;
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
