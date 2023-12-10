import { ClassesType } from '../../../Classes.types';
import { BaseSyntheticEvent, RefObject } from 'react';
import {
	campaignDataProps,
	reportDataProps,
} from '../../Campaign/Types/WhatsappCampaign.types';
import { authenticationClass } from './JSON.types';

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
	templateTextLimit: number;
	fileData: {
		fileLink: string;
		fileType: string;
	};
	category?: string;
};

export type TemplateFieldsProps = {
	classes: ClassesType[];
	templateName: string;
	savedTemplate: string;
	onTemplateNameChange: (e: BaseSyntheticEvent) => void;
	onSavedTemplateChange: (templateId: string) => void;
	savedTemplateList: savedTemplateListProps[];
	onCategoryChange: (category: string) => void;
	category: string;
	showValidation: boolean;
};

export type FileUploadProps = {
	classes: ClassesType['classes'];
	fileData: {
		fileLink: string;
		fileType: string;
	};
	setFileData: (fileData: File | undefined) => void;
	buttonType: string;
	sourceFileSize?: string
};

export type ReduxUserProps = {
	username: string;
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
	isEditable: boolean;
	buttonType: string;
	templateText: string;
};

export type whatsappMobilePreviewProps = {
	classes: ClassesType['classes'];
	templateData: templateDataProps;
	buttonType: string;
	fileData: {
		fileLink: string;
		fileType: string;
	};
};

export type ButtonsProps = {
	classes: ClassesType['classes'];
	onFormButtonClick: (buttonName: string) => void;
	displayBackButton: boolean;
	displayDeleteButton?: boolean;
	showSendButton?: boolean;
	showContinueButton?: boolean;
	isSummary?: boolean;
};

export type campaignPage1ButtonsProps = {
	classes: ClassesType['classes'];
	onDeleteCampaign: () => void;
	onSaveCampaign: () => void;
};

export type coreProps = {
	windowSize: string;
	isRTL: boolean;
	rowsPerPage: string | number;
	accountFeatures: string;
};

export type CommonRedux = {
	accountFeatures: string[];
	accountSettings: {
		SubAccountSettings: {
			DomainAddress: string;
			WhatsappTierID: null | string;
		};
	};
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
	isEditable: boolean;
	isDeletionAllowed?: boolean;
	canAddMoreButtons?: boolean;
	maxButtonTextLength?: number;
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

export type ApiButtonData = {
	type: string;
	title: string;
	phone?: string;
	url?: string;
	phoneCode?: string;
	keepTrackOfLinks?: boolean;
};

export type quickReplyButtons = {
	id: string;
	title: string
};

export type templateDataProps = {
	templateText: string;
	templateButtons: quickReplyButtonProps[] | callToActionProps;
};

export type templatePreviewDataProps = {
	templateData: templateDataProps;
	buttonType: 'quickReply' | 'callToAction' | '';
	fileData: {
		fileLink: string;
		fileType: string;
	};
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
	direction?: 'ltr' | 'rtl';
	titleFontSize?: string;
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
	'whatsapp/authentication': authenticationClass,
	'authentication': authenticationClass
};

export type savedTemplateDataProps = {
	types: savedTemplateTypesProps;
	variables: savedTemplateVariablesProps;
};

export type savedTemplateListProps = {
	CategoryId: number;
	CreatedDate: string | null;
	Data: savedTemplateDataProps;
	RejectionReason: string;
	Status: string;
	StatusUpdatedDate: string;
	TemplateId: string;
	TemplateName: string;
	FriendlyTemplateName: string;
	IsAllowEdit: boolean;
	Language?: string;
};

export type toastProps = {
	SUCCESS: toastKeyProps;
	SAVE_SUCCESS: toastKeyProps;
	ERROR: toastKeyProps;
	QUICK_SEND_SUCCESSS: toastKeyProps;
	SAVE_CAMPAIGN_SUCCESS: toastKeyProps;
	DELETE_CAMPAIGN_SUCCESS: toastKeyProps;
	DELETE_TEMPLATE_SUCCESS: toastKeyProps;
	DUPLICATE_TEMPLATE_SUCCESS: toastKeyProps;
	SUBMIT_CAMPAIGN_SUCCESS: toastKeyProps;
	DUPLICATE_CAMPAIGN_SUCCESS: toastKeyProps;
	INVALID_RECIPIENTS: toastKeyProps;
	DATE_PASS: toastKeyProps;
	CAMPAIGN_SAVE_SUCCESS: toastKeyProps;
	UPLOAD_CLIENT_DATA_SUCEESS: toastKeyProps;
	INVALID_API_MISSING_KEY: toastKeyProps;
	GENERAL_ERROR: toastKeyProps;
	GROUP_ALREADY_EXIST: toastKeyProps;
	CAMPAIGN_SEND_SUCCESS: toastKeyProps;
	RESTORE_CAMPAIGN_SUCCESS: toastKeyProps;
	GROUP_CREATED_SUCCESS: toastKeyProps;
	TEMPLATE_ALREADY_EXIST: toastKeyProps;
	INVALID_NUMBER: toastKeyProps;
	QUICK_SEND_ERROR: toastKeyProps;
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
	phoneCode?: string;
	keeptrackoflinks?: any;
};
export type JSONFreetextVariableProps = {
	[key: string]: string;
};

export type saveTemplateItemsProps = {
	CreatedDate: string;
	Data: savedTemplateDataProps;
	RejectionReason: string;
	Status: string;
	StatusId: number;
	StatusUpdatedDate: string;
	TemplateId: string;
	TemplateName: string;
	FriendlyTemplateName: string;
	Id: number;
	IsAllowEdit: boolean;
	UpdatedOn: string;
	Category: string;
	CategoryId: number;
};

export type saveTemplateDataProps = {
	Error: string;
	Count: number;
	Items: saveTemplateItemsProps[];
};

export type saveTemplatePayloadProps = {
	Data: saveTemplateDataProps;
	Message: string;
	Status: string;
};

export type savedTemplateAPIProps = {
	payload: saveTemplatePayloadProps;
};

export type getTemplateByIdDataAPIProps = {
	Category: string;
	CategoryId: number;
	Data: savedTemplateDataProps;
	FileName: string;
	FilePath: string;
	FriendlyTemplateName: string;
	id: number;
	SavedApiWhatsappTemplatesId: number;
	TemplateId: string;
	TemplateName: string;
	Language?: string;
};

export type getTemplateByIdPayloadAPIProps = {
	Data: getTemplateByIdDataAPIProps;
	Message: string;
	Status: string;
};

export type getTemplateByIdAPIProps = {
	payload: getTemplateByIdPayloadAPIProps;
};

export type submitTemplateDataProps = {
	createdDate: string;
	id: number;
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

export type templateListItemsProps = {
	CreatedDate: string | null;
	Data: savedTemplateDataProps;
	RejectionReason: string;
	Status: string;
	StatusId: number;
	StatusUpdatedDate: string;
	TemplateId: string;
	TemplateName: string;
	FriendlyTemplateName: string;
	Id: number;
	IsAllowEdit: boolean;
	UpdatedOn: string;
	Category: string;
	CategoryId: number;
};

export type templateListDataProps = {
	CurrentPage: number;
	PageSize: number;
	Count: number;
	TotalRecord: number;
	Items: saveTemplateItemsProps[];
};

export type templateListPayloadProps = {
	Message: string;
	Status: string;
	Data: templateListDataProps;
};

export type templateListAPIProps = {
	payload: templateListPayloadProps;
};

export type deleteTemplatePayloadProps = {
	Error: string;
	Count: number;
	Message: string;
	Status: string;
	Items: saveTemplateItemsProps[];
};

export type deleteTemplateAPIProps = {
	payload: deleteTemplatePayloadProps;
};

export type campaignListDataProps = {
	Count: number;
	CurrentPage: number;
	Items: campaignDataProps[];
	PageSize: number;
	TotalRecord: number;
};

export type campaignListPayloadProps = {
	Message: string;
	Status: string;
	Data: campaignListDataProps;
};

export type campaignListAPIProps = {
	payload: campaignListPayloadProps;
};

export type reportListPayloadDataProps = {
	Count: number;
	CurrentPage: number;
	Items: reportDataProps[];
	PageSize: number;
	TotalRecord: number;
};

export type reportListPayloadProps = {
	Data: reportListPayloadDataProps;
	Message: string;
	Status: string;
};

export type reportListAPIProps = {
	payload: reportListPayloadProps;
};

export type commonAPIResponsePayloadProps = {
	Data: any;
	Message: string;
	Status: string;
};

export type commonAPIResponseProps = {
	payload: commonAPIResponsePayloadProps;
};

export type restoreCampaignPayloadData = {
	Message: string;
	Status: string;
};

export type restoreCampaignData = {
	payload: restoreCampaignPayloadData;
};

export type CommonFeaturesAPIData = {
	Account: {
		AccountFeatures: number[];
	};
};

export type CommonFeaturesAPIPayload = {
	Data: CommonFeaturesAPIData;
	Message: string;
	StatusCode: number;
};

export type CommonFeaturesAPI = {
	payload: CommonFeaturesAPIPayload;
};

export type ApiErrorKey = {
	[key: string]: string | { [key: string]: string | number | null };
};

export type ApiErrorResponse = {
	[key: string]: ApiErrorKey;
};
