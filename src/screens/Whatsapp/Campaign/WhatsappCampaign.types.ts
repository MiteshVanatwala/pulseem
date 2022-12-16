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
	onSavedTemplateChange: (e: BaseSyntheticEvent) => void;
};
