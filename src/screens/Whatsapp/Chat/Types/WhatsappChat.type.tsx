import { ClassesType } from '../../../Classes.types';
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
};

export type WhatsappChatSideBarProps = {
	classes: ClassesType['classes'];
	isMobileSideBar: boolean;
	setIsMobileSideBar: () => void;
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
