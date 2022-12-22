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
	onCampaignFromRestore: () => void;
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

export type tagDataProps = {
	children: string;
	className: string;
	highlightIndex: number;
};
