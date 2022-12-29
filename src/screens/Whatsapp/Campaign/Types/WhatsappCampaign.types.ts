import { BaseSyntheticEvent } from 'react';
import { ClassesType } from '../../../Classes.types';
import { savedTemplateListProps } from '../../Editor/Types/WhatsappCreator.types';

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
};

export type validationAlertModalProps = {
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
};

export type LeftPaneProps = {
	classes: ClassesType['classes'];
};
export type WhatsappCampaignSecondProps = {
	classes: ClassesType['classes'];
};

export type GroupsProps = {
	classes: ClassesType['classes'];
	list: testGroupDataProps[];
	bsDot: boolean;
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
