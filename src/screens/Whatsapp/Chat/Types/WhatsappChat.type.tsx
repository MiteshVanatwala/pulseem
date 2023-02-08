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
};

export type WhatsappChatSideBarProps = {
	classes: ClassesType['classes'];
	isMobileSideBar: boolean;
	setIsMobileSideBar: () => void;
	handleChatId: (e: BaseSyntheticEvent, chatId: number) => void;
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
