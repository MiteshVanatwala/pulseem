import { BaseSyntheticEvent } from 'react';
import { ClassesType } from '../../../Classes.types';
import {
	personalFieldDataProps,
	updatedVariable,
	WhatsappAgent,
} from '../../Campaign/Types/WhatsappCampaign.types';
import {
	savedTemplateListProps,
	savedTemplateTypesProps,
} from '../../Editor/Types/WhatsappCreator.types';
import { SelectChangeEvent } from '@mui/material';

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
	activePhoneNumber: string;
	chatContacts: APIWhatsappChatSidebarContactsItemsData;
	ChatContacts: APIWhatsappChatSidebarContactsItemsData[];
	whatsappChatSession: APIWhatsappChatSessionData;
	handleUserStatus: (e: SelectChangeEvent, contactPhoneNumber: string) => void;
	getStatusClass: (status: number) => string | undefined;
	onChatSend: () => void;
	allWhatsappChat: APIWhatsappChatItemsData | undefined;
	setAllWhatsappChat: (
		whatsappChat: APIWhatsappChatItemsData | undefined
	) => void;
	setAPIInboundChatStatus: () => void;
	setWhatsappChatSession: (chatSession: APIWhatsappChatSessionData) => void;
	setUpdatedDynamicVariable: (
		updatedDynamicVariable: updatedVariable[]
	) => void;
	setDynamicVariable: (dynamicVariable: string[]) => void;
	setSavedTemplate: (template: string) => void;
	activeChatContacts: APIWhatsappChatSidebarContactsItemsData;
	isContactLoader: boolean;
	updateContactList: () => void;
	personalFields: personalFieldDataProps;
	onChatTemplateDelete: () => void;
	setIsLoader: (showing: boolean) => void;
	selectedAgent?: WhatsappAgent;
};

export type SideBarContactListProps = {
	classes: ClassesType['classes'];
	ChatContacts: APIWhatsappChatSidebarContactsItemsData[];
	handleChatId: (
		e: BaseSyntheticEvent,
		Contacts: APIWhatsappChatSidebarContactsItemsData
	) => void;
	handleUserStatus: (e: SelectChangeEvent, contactPhoneNumber: string) => void;
	getStatusClass: (status: number) => string | undefined;
	fetchMoreContacts: () => void;
	contactsPaginationSetting: ContactsPaginationSetting;
	isLoader: boolean;
	searchText: string;
};

export type SideHeaderContactDropDownProps = {
	classes: ClassesType['classes'];
	phoneNumbersList: string[];
	onActiveUserChange: (e: SelectChangeEvent) => void;
	activePhoneNumber: string;
};

export type ChatHeaderContentProps = {
	classes: ClassesType['classes'];
	whatsappChatSession: APIWhatsappChatSessionData;
	setWhatsappChatSession: (chatSession: APIWhatsappChatSessionData) => void;
};

export type ChatFooterContentProps = {
	classes: ClassesType['classes'];
	updatedDynamicVariable: updatedVariable[];
	setDynamicModalVariable: (dynamicModalVariable: number) => void;
	setIsDynamcFieldModal: (isDynamcFieldModal: boolean) => void;
	newMessage: string;
	setNewMessage: (newMessage: string) => void;
	setIsTemplateModal: (isTemplateModal: boolean) => void;
	savedTemplate: string;
	dynamicVariable: string[];
	whatsappChatSession: APIWhatsappChatSessionData;
	onChatSend: () => void;
	activeChatContacts: APIWhatsappChatSidebarContactsItemsData;
	ChatContacts: APIWhatsappChatSidebarContactsItemsData[];
	isContactLoader: boolean;
	personalFields: personalFieldDataProps;
	onChatTemplateDelete: () => void;
};

export type ChatTemplateProps = {
	classes: ClassesType['classes'];
	template: savedTemplateTypesProps;
	msgIndex: number;
	message: APIWhatsappChatDetailData;
	variables: APIWhatsappChatVariablesData;
};

export type WhatsappChatSideBarProps = {
	classes: ClassesType['classes'];
	isMobileSideBar: boolean;
	setIsMobileSideBar: () => void;
	handleChatId: (
		e: BaseSyntheticEvent,
		Contacts: APIWhatsappChatSidebarContactsItemsData
	) => void;
	setActiveUser: (activeUser: string) => void;
	onActiveUserChange: (e: SelectChangeEvent) => void;
	chatContacts: APIWhatsappChatSidebarContactsItemsData;
	sideChatContacts: APIWhatsappChatSidebarContactsItemsData[];
	phoneNumbersList: string[];
	handleUserStatus: (e: SelectChangeEvent, contactPhoneNumber: string) => void;
	getStatusClass: (status: number) => string | undefined;
	activePhoneNumber: string;
	fetchMoreContacts: (
		searchText: string,
		ChatStatus: number,
		isPaginationReset?: boolean
	) => void;
	contactsPaginationSetting: ContactsPaginationSetting;
	fetchSearchedContacts: (
		searchText: string,
		ChatStatus: number,
		isPaginationReset: boolean
	) => void;
	isLoader: boolean;
	filterBySelected: number;
	setFilterBySelected: (filterId: number) => void;
	selectedAgent?: number;
	setAgentSelected: (agentId: number) => void;
	onAddAgent: () => void;
	onEditAgents: () => void;
};

export type chatModalProps = {
	classes: ClassesType['classes'];
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

//SidebarContacts Main inbound data types
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
	StatusCode: number;
};

export type APIWhatsappChatSidebarContactsData = {
	payload: APIWhatsappChatSidebarContactsPayloadData;
};

// TemplateData Variables (PersonalField,Text,Link,LandingPage,Navigation)
export type APIWhatsappChatVariablesData = {
	[key: string]: string;
};

//According to API inbound schema for template data types
export type APIWhatsappChatTypesData = {
	text: { body: string };
};

export type APIWhatsappChatTemplateData = {
	types: savedTemplateTypesProps;
	variables: APIWhatsappChatVariablesData;
};

export type APIWhatsappChatDetailData = {
	IsInbound: null | boolean;
	IsTemplate: boolean;
	MediaContentType: string;
	MediaUrl: string;
	Message: string;
	MessageDate: string;
	MessageDateText: null | string;
	SmsStatus: string;
	SmsStatusId: number;
	TemplateData: APIWhatsappChatTemplateData;
};

export type APIWhatsappChatItemsData = {
	[key: string]: APIWhatsappChatDetailData[];
};

//Chat Main inbound data types
export type APIWhatsappChatMainData = {
	Count: number;
	CurrentPage: number;
	Items: APIWhatsappChatItemsData;
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
	Hour: string;
	Minute: string;
	Second: string;
	IsNewMessage: boolean;
};

export type ContactsPaginationSetting = {
	PageNo: number;
	PageSize: number;
	hasMore: boolean;
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

export type APISendWhatsAppChatReqPayload = {
	FromNumber: string;
	ToNumber: string;
	IsFreeFormChat: boolean;
	TextMessage?: string;
	mediaUrl?: string;
	TemplateId?: string;
	Variables?: updatedVariable[];
};

export type APISendWhatsappChatData = {
	Count: number;
	CurrentPage: number;
	Items: APIWhatsappChatItemsData;
	PageSize: number;
	TotalRecord: number;
};

export type APISendWhatsappChatDataData = {
	Data: APISendWhatsappChatData;
	NextAvailableTime?: string;
};

export type APISendWhatsappChatPayload = {
	Status: string;
	Message: string;
	Data: APISendWhatsappChatDataData;
	StatusCode: number;
};

export type APISendWhatsappChat = {
	payload: APISendWhatsappChatPayload;
};

export type displayCountDown = {
	formatted: {
		days: string;
		hours: string;
		minutes: string;
		seconds: string;
	};
};

export type APIGetWhatsappChatContactsReq = {
	PhoneNumber?: string;
	IsPagination: boolean;
	pageNo: number;
	pageSize: number;
	Searchtext?: string;
	UserNumber?: string;
	ChatStatus: number;
	AgentId?: number;
};

export type Timer = {
	Hour: number;
	Minute: number;
	Second: number;
};

export type ImagePreviewProps = React.ImgHTMLAttributes<HTMLImageElement> & {
	placeholderImg?: string;
	errorImg?: string;
	classes: ClassesType['classes'];
};
