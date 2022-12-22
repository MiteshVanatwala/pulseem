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
	dynamicFieldCount: number;
	linkCount: number;
};

export type TemplateFieldsProps = {
	classes: ClassesType[];
	templateName: string;
	savedTemplate: string;
	onTemplateNameChange: (e: BaseSyntheticEvent) => void;
	onSavedTemplateChange: (e: BaseSyntheticEvent) => void;
	fileData: string;
	setFileData: (fileData: File | undefined) => void;
	savedTemplateList: savedTemplateListProps[];
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
	closeCallToAction: (isReset: boolean) => void;
	classes: ClassesType['classes'];
	callToActionFieldRows: callToActionProps;
	setCallToActionFieldRows: (data: callToActionProps) => void;
	phoneNumberField: callToActionFieldProps[];
	websiteField: callToActionFieldProps[];
	addMore: () => void;
	updateTemplateData: (data: callToActionProps) => void;
	isEdiable: boolean;
};

export type whatsappMobilePreviewProps = {
	classes: ClassesType['classes'];
	campaignNumber: string;
	templateData: templateDataProps;
	buttonType: string;
	fileData: string;
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
	isEdiable: boolean;
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
	onConfirmOrYes: () => void;
	title: string;
	subtitle: string;
	type: 'confirm' | 'delete' | 'alert' | 'submit';
	children?: React.ReactNode;
};

export type savedTemplateVariablesProps = {
	[key: number]: string;
};

export type savedTemplateActionProps = {
	title: string;
	type: string;
	url: string;
	phone: string;
};

export type savedTemplateQuickReplyProps = {
	actions: savedTemplateActionProps[];
	body: string;
};

export type savedTemplateMediaProps = {
	body: string;
	media: string[];
	media_type: string;
};

export type savedTemplateTextProps = {
	body: string;
};

export type savedTemplateCardActionProps = {
	title: string;
	type: string;
	url: string;
	phone: string;
};

export type savedTemplateCardProps = {
	actions: savedTemplateCardActionProps[];
	media: string[];
	subtitle: string;
	title: string;
};

export type savedTemplateCallToActionActionProps = {
	title: string;
	type: string;
	url: string;
	phone: string;
};

export type savedTemplateCallToActionProps = {
	actions: savedTemplateCallToActionActionProps[];
	body: string;
};

export type savedTemplateTypesProps = {
	'quick-reply': savedTemplateQuickReplyProps;
	'call-to-action': savedTemplateCallToActionProps;
	media: savedTemplateMediaProps;
	text: savedTemplateTextProps;
	card: savedTemplateCardProps;
};

export type savedTemplateDataProps = {
	types: savedTemplateTypesProps;
	variables: savedTemplateVariablesProps;
};

export type savedTemplateListProps = {
	CreatedDate: string;
	Data: savedTemplateDataProps;
	RejectionReason: string;
	Status: string;
	StatusUpdatedDate: string;
	TemplateId: string;
	TemplateName: string;
};

export type toastProps = {
	SUCCESS: toastKeyProps;
	ERROR: toastKeyProps;
	QUICK_SEND_SUCCESSS: toastKeyProps;
};

export type toastKeyProps = {
	severity: string;
	color: string;
	message: string;
	showAnimtionCheck: boolean;
};

export type fileUploadPayloadProps = {
	Data: string;
	ErrorCode: number;
	Message: string;
	Status: number;
};

export type fileUploadAPIProps = {
	payload: fileUploadPayloadProps;
};

export type buttonsDataProps = {
	title: string;
	type: string;
	url: string;
	phone: string;
};
export type JSONFreetextVariableProps = {
	[key: string]: string;
};

export type saveTemplateItemsProps = {
	CreatedDate: string;
	Data: savedTemplateDataProps;
	RejectionReason: string;
	Status: string;
	StatusUpdatedDate: string;
	TemplateId: string;
	TemplateName: string;
};

export type saveTemplatePayloadProps = {
	Error: string;
	Count: number;
	Message: string;
	Status: string;
	Items: saveTemplateItemsProps[];
};

export type savedTemplateAPIProps = {
	payload: saveTemplatePayloadProps;
};

export type submitTemplateDataProps = {
	createdDate: string;
	templateId: string;
	templateName: string;
};

export type submitTemplatePayloadProps = {
	Data: submitTemplateDataProps;
	Message: string;
	Status: string;
};

export type submitTemplateAPIProps = {
	payload: submitTemplatePayloadProps;
};
