import { ClassesType } from '../../../Classes.types';
import { campaignDataProps } from '../../Campaign/Types/WhatsappCampaign.types';

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
	restoreIds: string[];
	setRestoreIds: (ids: string[]) => void;
	deletedCampaignListData: campaignDataProps[];
};

export type apiTemplateRowDataProps = {
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

export type statusByNameProps = { [key: string]: string };

export type campaignStatusProps = { [key: number]: string };

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
	onClick: (key: string, Id: string) => void;
	remove?: boolean;
	rootClass?: any;
	textClass?: any;
	id: string;
};
