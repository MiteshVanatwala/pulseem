import { ClassesType } from '../../../Classes.types';

export type WhatsappChatProps = {
	classes: ClassesType['classes'];
	isMobileSideBar: boolean;
};

export type WhatsappChatUiProps = {
	classes: ClassesType['classes'];
	isMobileSideBar: boolean;
	setIsMobileSideBar: () => void;
};

export type WhatsappChatSideBarProps = {
	classes: ClassesType['classes'];
	isMobileSideBar: boolean;
	setIsMobileSideBar: () => void;
};
