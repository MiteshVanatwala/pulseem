import { BaseSyntheticEvent } from 'react';
import { ClassesType } from '../../Classes.types';
import { savedTemplateListProps } from '../Editor/WhatsappCreator.types';

export type coreProps = {
	windowSize: string;
	isRTL: boolean;
};

export type WhatsappCampaignProps = {
	classes: ClassesType[];
};

export type dynamicButtonProps = {
	tooltipTitle: string;
	buttonTitle: string;
};

export type dynamicModalProps = {
	classes: ClassesType['classes'];
	isDynamcFieldModal: boolean;
	onDynamcFieldModalClose: () => void;
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

export type DateFieldProps = {
	minDate: any;
	classes: ClassesType;
	value: any;
	onChange: (value: any) => void;
	onTimeChange: (value: any) => void;
	placeholder: string;
	isTimePicker: boolean;
	buttons: any;
	ampm: boolean;
	maximumDate: any;
	timePickerOpen: boolean;
	rootStyle: any;
	timeActive: any;
	dateActive: any;
	toolbarDisabled: boolean;
	isRoundedOnMobile: boolean;
	props: any;
};

export type RightPaneProps = {
	classes: ClassesType;
};

export type GroupListProps = {
	classes: ClassesType;
};
export type WhatsappCampaignSecondProps = {
	classes: ClassesType;
};

export type GroupsProps = {
	classes: ClassesType;
	list: any[];
	bsDot: boolean;
	selectedList: any[];
	innerHeight: number;
	showSortBy: boolean;
	showFilter: boolean;
	showSelectAll: boolean;
	callbackSelectedGroups: (group: any) => void;
	callbackUpdateGroups: (value: testGroupDataProps[]) => void;
	callbackSelectAll: () => void;
	callbackReciFilter: () => void;
	callbackShowTestGroup: (showTestGroups: boolean) => void;
	uniqueKey: string;
};
