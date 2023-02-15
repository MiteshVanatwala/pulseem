import { BaseSyntheticEvent } from 'react';
import { ClassesType } from '../../../Classes.types';
import { updatedVariable } from '../../Campaign/Types/WhatsappCampaign.types';
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
	updatedDynamicVariable: updatedVariable[];
	setIsDynamcFieldModal: (isDynamcFieldModal: boolean) => void;
	setDynamicModalVariable: (dynamicModalVariable: number) => void;
	savedTemplate: string;
	chatContacts: APIWhatsappChatSidebarContactsItemsData;
	activeUser: string;
	filteredSideChatContacts: APIWhatsappChatSidebarContactsItemsData[];
	whatsappChatSession: APIWhatsappChatSessionData;
	handleUserStatus: (e: BaseSyntheticEvent, contactPhoneNumber: string) => void;
};

export type WhatsappChatSideBarProps = {
	classes: ClassesType['classes'];
	isMobileSideBar: boolean;
	setIsMobileSideBar: () => void;
	handleChatId: (
		e: BaseSyntheticEvent,
		Contacts: APIWhatsappChatSidebarContactsItemsData
	) => void;
	activeUser: string;
	setActiveUser: (activeUser: string) => void;
	getPhoneNumber: () => void;
	onActiveUserChange: (e: BaseSyntheticEvent) => void;
	sideChatContacts: APIWhatsappChatSidebarContactsItemsData[];
	filteredSideChatContacts: APIWhatsappChatSidebarContactsItemsData[];
	setFilteredSideChatContacts: (
		filteredSideChatContacts: APIWhatsappChatSidebarContactsItemsData[]
	) => void;
	phoneNumbersList: string[];
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

export type APIWhatsappChatSidebarContactsItemsData = {
	ConversationStatusId: number;
	IsTemplate: boolean;
	IsUnsubscribed: boolean;
	LastMessage: string;
	LastMessageDate: string;
	PhoneNumber: string;
	Unread: number;
	UserName: string;
};

export type APIWhatsappChatSidebarContactsMainData = {
	Count: number;
	CurrentPage: number;
	Items: APIWhatsappChatSidebarContactsItemsData[];
	PageSize: number;
	TotalRecord: number;
};

export type APIWhatsappChatSidebarContactsPayloadData = {
	Data: APIWhatsappChatSidebarContactsMainData;
	Message: string;
	Status: string;
};

export type APIWhatsappChatSidebarContactsData = {
	payload: APIWhatsappChatSidebarContactsPayloadData;
};

export type APIWhatsappChatVariablesData = {
	'1': string;
	'2': string;
};

export type APIWhatsappChatTextData = {
	body: string;
};

export type APIWhatsappChatTypesData = {
	text: APIWhatsappChatTextData;
};

export type APIWhatsappChatTemplateData = {
	types: APIWhatsappChatTypesData;
	variables: APIWhatsappChatVariablesData;
};

export type APIWhatsappChatItemsData = {
	IsInbound: null | boolean;
	IsTemplate: boolean;
	MediaUrl: string;
	Message: string;
	MessageDate: string;
	MessageDateText: null | string;
	SmsStatus: string;
	SmsStatusId: number;
	TemplateData: APIWhatsappChatTemplateData;
};

export type APIWhatsappChatMainData = {
	Count: number;
	CurrentPage: number;
	Items: APIWhatsappChatItemsData[];
	PageSize: number;
	TotalRecord: number;
};

export type APIWhatsappChatPayloadData = {
	Data: APIWhatsappChatMainData;
	Message: string;
	Status: string;
};

export type APIWhatsappChatData = {
	payload: APIWhatsappChatPayloadData;
};

export type APIWhatsappChatSessionData = {
	ExpiryTime: string;
	IsIn24Window: boolean;
};

export type APIWhatsappChatSessionPayloadData = {
	Data: APIWhatsappChatSessionData;
	Message: string;
	Status: string;
};

export type APIWhatsappChatSession = {
	payload: APIWhatsappChatSessionPayloadData;
};

export type APIWhatsappChatConversationStatusPayloadData = {
	Status: string;
	Message: string;
	Data: null;
};

export type APIWhatsappChatConversationStatusData = {
	payload: APIWhatsappChatConversationStatusPayloadData;
};
