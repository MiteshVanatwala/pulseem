import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
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

export type ButtonTextLimits = { [key: string]: number };

export type TemplatesStatusIdByStatusName = { [key: string]: number };

export type CategoryId = { [key: string]: number };

export type CategoryName = { [key: number]: string };

export type campaignStatusProps = { [key: number]: string };

export type ManagmentIconProps = {
	classes: ClassesType['classes'];
	key: string;
	buttonKey: string;
	icon?: any;
	uIcon?: any;
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

export type AllTemplateReq = {
	templateName: string;
	templateStatus: number;
	isPagination: boolean;
	pageNo: number;
	pageSize: number;
};

export type AllCampaignReq = {
	campaignName: string;
	fromDate: MaterialUiPickersDate | null;
	toDate: MaterialUiPickersDate | null;
	isPagination: boolean;
	pageNo: number;
	pageSize: number;
	isDeleted: boolean;
};

export type AllReportReq = {
	campaignName: string;
	fromDate: MaterialUiPickersDate | null;
	toDate: MaterialUiPickersDate | null;
	isPagination: boolean;
	pageNo: number;
	pageSize: number;
	IsTestCampaign: boolean;
};

export type PageTypeRequest = { [key: string]: number };

export type TierSetting = {
	name: string;
	value: '1' | '2' | '3' | '4' | '5' | '6';
	messageLimit: number | string;
};

export type UpdateWhatsappTierPayload = {
	Data: null;
	Message: string;
	Status: string;
	StatusCode: number;
};

export type UpdateWhatsappTier = {
	payload: UpdateWhatsappTierPayload;
};

export type authenticationMockTemplateObject = {
	body: string;
	subtitle: string
}
export type AuthenticationMockTemplateType = {
	[key: string]: authenticationMockTemplateObject;
	AUTHENTICATIONEN: authenticationMockTemplateObject;
	AUTHENTICATIONHEBREW: authenticationMockTemplateObject;
}