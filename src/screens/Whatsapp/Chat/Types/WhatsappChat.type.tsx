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
	handleChatId: (chatId: number) => void;
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
