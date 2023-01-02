import { ClassesType } from '../../../Classes.types';

export type paginationProps = {
	classes: ClassesType['classes'];
	rows: number;
	page: number;
	rowsPerPageOptions: number[];
	rowsPerPage: number;
	returnPageOne: boolean;
	onRowsPerPageChange: (rowsNumber: number) => void;
	onPageChange: (pageNumber: number) => void;
};

export type RestoreDeletedModalProps = {
	classes: ClassesType['classes'];
	isOpen: boolean;
	onClose: () => void;
	onConfirmOrYes: () => void;
	title: string;
};

export type templateRowDataProps = {
	Id: number;
	Name: string;
	Status: number;
	IsDeleted: boolean;
	UpdatedDate: string;
	SendDate: string | null;
	SentCount: number;
	CreditsPerSms: number;
	AutomationID: number;
	Groups: number[];
	AutomationTriggerInActive: boolean;
};

export type statusProps = { [key: number]: string };

export type ManagmentIconProps = {
	classes: ClassesType['classes'];
	key: string;
	buttonKey: string;
	icon: string;
	lable: string;
	disable?: boolean;
	hide?: boolean;
	openNewTab?: boolean;
	href?: string;
	onClick: (key: string, templateId: string) => void;
	remove?: boolean;
	rootClass?: any;
	textClass?: any;
	templateId: string;
};
