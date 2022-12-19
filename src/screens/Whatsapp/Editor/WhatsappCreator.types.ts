import { ClassesType } from '../../Classes.types';
import { BaseSyntheticEvent, RefObject } from 'react';

export type WhatsappCreatorProps = {
	classes: ClassesType[];
	onButtonClick(button: actionButtonProps): void;
	buttons: templateDataProps['templateButtons'];
	onButtonDelete: (
		button: quickReplyButtonProps | callToActionRowProps
	) => void;
	setTemplateText: (text: string) => void;
	templateText: string;
	buttonType: string;
	templateTextRef: RefObject<HTMLTextAreaElement>;
	OnEditorActionButtonClick(
		button: quickReplyButtonProps | callToActionRowProps
	): void;
};

export type TemplateFieldsProps = {
	classes: ClassesType[];
	templateName: string;
	savedTemplate: string;
	onTemplateNameChange: (e: BaseSyntheticEvent) => void;
	onSavedTemplateChange: (e: BaseSyntheticEvent) => void;
	fileData: File | undefined;
	setFileData: (fileData: File | undefined) => void;
};

export type MessageEditorProps = {
	classes: ClassesType;
};

export type callToActionFieldProps = {
	fieldName: string;
	type: string;
	placeholder: string;
	value: string;
};

export type callToActionRowProps = {
	id: string;
	typeOfAction: string;
	fields: callToActionFieldProps[];
};

export type callToActionProps = callToActionRowProps[];

export type actionProps = {
	isCallToActionOpen: boolean;
	closeCallToAction: () => void;
	classes: ClassesType['classes'];
	callToActionFieldRows: callToActionProps;
	setCallToActionFieldRows: (data: callToActionProps) => void;
	phoneNumberField: callToActionFieldProps[];
	websiteField: callToActionFieldProps[];
	addMore: () => void;
	updateTemplateData: (data: callToActionProps) => void;
};

export type whatsappMobilePreviewProps = {
	classes: ClassesType['classes'];
	campaignNumber: string;
	templateData: templateDataProps;
	buttonType: string;
};

export type ButtonsProps = {
	classes: ClassesType['classes'];
	onFormButtonClick: (buttonName: string) => void;
};

export type coreProps = {
	windowSize: string;
	isRTL: boolean;
};

export type actionButtonProps = {
	tooltipTitle: string;
	buttonTitle: string;
};

export type quickReplyProps = {
	classes: ClassesType['classes'];
	isQuickReplyOpen: boolean;
	closeQuickReply: () => void;
	quickReplyButtons: quickReplyButtonProps[];
	setQuickReplyButtons: (data: quickReplyButtonProps[]) => void;
	updateTemplateData: (data: quickReplyButtonProps[]) => void;
	templateButtons: templateDataProps['templateButtons'];
};

export type quickReplyButtonsFieldProps = {
	fieldName: string;
	type: string;
	placeholder: string;
	value: string;
};

export type quickReplyButtonProps = {
	id: string;
	typeOfAction: string;
	fields: quickReplyButtonsFieldProps[];
};

export type templateDataProps = {
	templateText: string;
	templateButtons: quickReplyButtonProps[] | callToActionProps;
};

export type WhatsappTipsProps = {
	classes: ClassesType['classes'];
};

export type AlertModalProps = {
	classes: ClassesType['classes'];
	isOpen: boolean;
	onClose: () => void;
	title: string;
	subtitle: string;
	type: 'confirm' | 'delete' | 'alert' | 'submit';
	children?: React.ReactNode;
};
