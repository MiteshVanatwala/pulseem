import { BaseSyntheticEvent } from 'react';
import { ClassesType } from '../../../Classes.types';
import { updatedVariableProps } from '../../Campaign/Types/WhatsappCampaign.types';
import { savedTemplateListProps } from '../../Editor/Types/WhatsappCreator.types';

export type WhatsappChatProps = {
	classes: ClassesType['classes'];
	isMobileSideBar: boolean;
};

export type WhatsappChatUiProps = {
	classes: ClassesType['classes'];
	isMobileSideBar: boolean;
	setIsMobileSideBar: () => void;
	savedTemplateList: savedTemplateListProps[];
	onChoose: (
		template: savedTemplateListProps,
		templateText: string | null
	) => void;
	newMessage: string;
	setNewMessage: (newMessage: string) => void;
	isTemplateModal: boolean;
	setIsTemplateModal: (isTemplateModal: boolean) => void;
	dynamicVariable: string[];
	updatedDynamicVariable: updatedVariableProps[];
	setIsDynamcFieldModal: (isDynamcFieldModal: boolean) => void;
	setDynamicModalVariable: (dynamicModalVariable: number) => void;
	savedTemplate: string;
	chatContacts: any;
	activeUser: string;
	filteredSideChatContacts: any;
	whatsappChatSession: any;
	handleUserStatus: (e: BaseSyntheticEvent, contactPhoneNumber: string) => void;
};

export type WhatsappChatSideBarProps = {
	classes: ClassesType['classes'];
	isMobileSideBar: boolean;
	setIsMobileSideBar: () => void;
	handleChatId: (e: BaseSyntheticEvent, Contacts: any) => void;
	activeUser: string;
	setActiveUser: (activeUser: string) => void;
	getPhoneNumber: () => void;
	onActiveUserChange: (e: BaseSyntheticEvent) => void;
	sideChatContacts: any;
	filteredSideChatContacts: any;
	setFilteredSideChatContacts: (filteredSideChatContacts: any) => void;
	phoneNumbersList: any;
	handleUserStatus: (e: BaseSyntheticEvent, contactPhoneNumber: string) => void;
};

export type chatModalProps = {
	classes: ClassesType['classes'];
	isOpen: boolean;
	onClose: () => void;
	savedTemplateList: savedTemplateListProps[];
	onChoose: (
		template: savedTemplateListProps,
		templateText: string | null
	) => void;
};

export type AllIconComponentProps = {
	id: string;
	className?: string;
};

export type AllIconProps = {
	[key: string]: (props: AllIconComponentProps) => JSX.Element;
};

export type APIWhatsappChatSidebarContactsItemsProps = {
	ConversationStatusId: number;
	IsTemplate: boolean;
	IsUnsubscribed: boolean;
	LastMessage: string;
	LastMessageDate: string;
	PhoneNumber: string;
	Unread: number;
	UserName: string;
};

export type APIWhatsappChatSidebarContactsDataProps = {
	Count: number;
	CurrentPage: number;
	Items: APIWhatsappChatSidebarContactsItemsProps[];
	PageSize: number;
	TotalRecord: number;
};

export type APIWhatsappChatSidebarContactsPayloadProps = {
	Data: APIWhatsappChatSidebarContactsDataProps;
	Message: string;
	Status: string;
};

export type APIWhatsappChatSidebarContactsProps = {
	payload: APIWhatsappChatSidebarContactsPayloadProps;
};

export type APIWhatsappChatVariablesProps = {
	'1': string;
	'2': string;
};

export type APIWhatsappChatTextProps = {
	body: string;
};

export type APIWhatsappChatTypesProps = {
	text: APIWhatsappChatTextProps;
};

export type APIWhatsappChatTemplateDataProps = {
	types: APIWhatsappChatTypesProps;
	variables: APIWhatsappChatVariablesProps;
};

export type APIWhatsappChatItemsProps = {
	IsInbound: null | boolean;
	IsTemplate: boolean;
	MediaUrl: string;
	Message: string;
	MessageDate: string;
	MessageDateText: null | string;
	SmsStatus: string;
	SmsStatusId: number;
	TemplateData: APIWhatsappChatTemplateDataProps;
};

export type APIWhatsappChatDataProps = {
	Count: number;
	CurrentPage: number;
	Items: APIWhatsappChatItemsProps[];
	PageSize: number;
	TotalRecord: number;
};

export type APIWhatsappChatPayloadProps = {
	Data: APIWhatsappChatDataProps;
	Message: string;
	Status: string;
};

export type APIWhatsappChatProps = {
	payload: APIWhatsappChatPayloadProps;
};
