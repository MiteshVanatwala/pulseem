import { sitePrefix } from '../../config';
import { toastProps, WhatsappTemplateError } from './Editor/Types/WhatsappCreator.types';
import {
	AllCampaignReq,
	AllReportReq,
	AllTemplateReq,
	AuthenticationMockTemplateType,
	ButtonTextLimits,
	campaignStatusProps,
	CategoryId,
	CategoryName,
	statusByNameProps,
	statusProps,
	TemplatesStatusIdByStatusName,
	TierSetting
} from './management/Types/Management.types';

export const whatsappRoutes = {
	CREATE_TEMPLATE: `${sitePrefix}whatsapp/template/create`,
	CREATE_CAMPAIGN_PAGE1: `${sitePrefix}whatsapp/campaign/create/page1`,
	CREATE_CAMPAIGN_PAGE2: `${sitePrefix}whatsapp/campaign/create/page2`,
	TEMPLATE_MANAGEMENT: `${sitePrefix}whatsapp/templatemanagement`,
	REPORTS: `${sitePrefix}reports/whatsappreports`,
	CAMPAIGN_MANAGEMENT: `${sitePrefix}whatsapp/campaignmanagement`,
	EDIT_TEMPLATE: `${sitePrefix}whatsapp/template/edit/:templateID`,
	EDIT_CAMPAIGN_PAGE1: `${sitePrefix}whatsapp/campaign/edit/page1/:campaignID`,
	EDIT_CAMPAIGN_PAGE2: `${sitePrefix}whatsapp/campaign/edit/page2/:campaignID`,
	CHAT: `${sitePrefix}whatsapp/chat`,
	CHAT_CONVERSATION: `${sitePrefix}whatsapp/chat/:contactID`,
};

export const apiStatus = {
	SUCCESS: 'Success',
	ERROR: 'Error',
};

export enum fieldIDs {
	'personalField' = 1,
	'text' = 2,
	'link' = 3,
	'landingPage' = 4,
	'navigation' = 5,
}

export enum fieldNames {
	PERSONALFIELD = 'personalField',
	TEXT = 'text',
	LINK = 'link',
	LANDINGPAGE = 'landingPage',
	NAVIGATION = 'navigation',
}

export enum fieldNameIds {
	PERSONALFIELD = 1,
	TEXT = 2,
	LINK = 3,
	LANDINGPAGE = 4,
	NAVIGATION = 5,
}

export enum fileTypes {
	DOCUMENT = 'document',
	VIDEO = 'video',
	IMAGE = 'image',
}

export enum tabs {
	GROUP = 'group',
	MANUAL = 'manual',
}

export enum buttonTypes {
	QUICK_REPLY = 'quickReply',
	CALL_TO_ACTION = 'callToAction',
}

export enum templateTypes {
	QUICK_REPLY = 'quick-reply',
	CALL_TO_ACTION = 'call-to-action',
	CARD = 'card',
	MEDIA = 'media',
	TEXT = 'text',
}

export enum buttons {
	DELETE = 'Delete',
	SAVE = 'Save',
	EXIT = 'Exit',
	SEND = 'Send',
	CONTINUE = 'Continue',
}

export enum reportCellNames {
	TOSEND = 'To Send',
	SENT = 'Sent',
	READ = 'Read',
	CLICKS = 'Clicks',
	UNIQUE = 'Unique',
	FEEDBACK = 'Feedback',
	REMOVED = 'Removed',
	FAILED = 'Failed',
	REVENUE = 'Revenue',
	COST = 'Cost',
}

export enum APIStatuses {
	SUCCESS = 'Success',
	ERROR = 'Error',
}

export enum campaignStatuses {
	CREATED = 1,
	SENDING = 2,
	STOPPED = 3,
	FINISHED = 4,
	CANCELED = 5,
}

export const countryCodes = [
	'+93 AF',
	'+355 AL',
	'+213 DZ',
	'+1-684 AS',
	'+376 AD',
	'+244 AO',
	'+1-264 AI',
	'+672 AQ',
	'+1-268 AG',
	'+54 AR',
	'+374 AM',
	'+297 AW',
	'+61 AU',
	'+43 AT',
	'+994 AZ',
	'+1-242 BS',
	'+973 BH',
	'+880 BD',
	'+1-246 BB',
	'+375 BY',
	'+32 BE',
	'+501 BZ',
	'+229 BJ',
	'+1-441 BM',
	'+975 BT',
	'+591 BO',
	'+387 BA',
	'+267 BW',
	'+55 BR',
	'+673 BN',
	'+359 BG',
	'+226 BF',
	'+257 BI',
	'+855 KH',
	'+237 CM',
	'+238 CV',
	'+1-345 KY',
	'+236 CF',
	'+235 TD',
	'+56 CL',
	'+86 CN',
	'+57 CO',
	'+243 CD',
	'+242 CG',
	'+682 CK',
	'+506 CR',
	'+225 CI',
	'+385 HR',
	'+53 CU',
	'+357 CY',
	'+420 CZ',
	'+45 DK',
	'+253 DJ',
	'+1-767 DM',
	'+1-809 DO',
	'+670 TP',
	'+593  EC',
	'+20 EG',
	'+503 SV',
	'+240 GQ',
	'+291 ER',
	'+372 EE',
	'+251 ET',
	'+500 FK',
	'+298 FO',
	'+679 FJ',
	'+358 FI',
	'+33 FR',
	'+594 GF',
	'+689 PF',
	'+241 GA',
	'+220 GM',
	'+995 GE',
	'+49 DE',
	'+233 GH',
	'+350 GI',
	'+30 GR',
	'+299 GL',
	'+1-473 GD',
	'+590 GP',
	'+1-671 GU',
	'+502 GT',
	'+224 GN',
	'+245 GW',
	'+592 GY',
	'+509 HT',
	'+504 HN',
	'+852 HK',
	'+36 HU',
	'+354 IS',
	'+91 IN',
	'+62 ID',
	'+98 IR',
	'+964 IQ',
	'+353 IE',
	'+972 IL',
	'+39 IT',
	'+1-876 JM',
	'+81 JP',
	'+962 JO',
	'+254 KE',
	'+686 KI',
	'+850 KP',
	'+82 KR',
	'+965 KW',
	'+996 KG',
	'+856 LA',
	'+371 LV',
	'+961 LB',
	'+266 LS',
	'+231 LR',
	'+218 LY',
	'+423 LI',
	'+370 LT',
	'+352 LU',
	'+853 MO',
	'+389 MK',
	'+261 MG',
	'+265 MW',
	'+60 MY',
	'+960 MV',
	'+223 ML',
	'+356 MT',
	'+692 MH',
	'+596 MQ',
	'+222 MR',
	'+230 MU',
	'+269 YT',
	'+52 MX',
	'+691 FM',
	'+373 MD',
	'+377 MC',
	'+976 MN',
	'+1-664 MS',
	'+212 MA',
	'+258 MZ',
	'+95 MM',
	'+264 NA',
	'+674 NR',
	'+977 NP',
	'+31 NL',
	'+599 AN',
	'+687 NC',
	'+64 NZ',
	'+505 NI',
	'+227 NE',
	'+234 NG',
	'+683 NU',
	'+1-670 MP',
	'+47 NO',
	'+968 OM',
	'+92 PK',
	'+680 PW',
	'+970 PS',
	'+507 PA',
	'+675 PG',
	'+595 PY',
	'+51 PE',
	'+63 PH',
	'+48 PL',
	'+351 PT',
	'+1-787 PR',
	'+974  QA',
	'+262 RE',
	'+40 RO',
	'+7 RU',
	'+250 RW',
	'+290 SH',
	'+1-869 KN',
	'+1-758 LC',
	'+508 PM',
	'+1-784 VC',
	'+685 WS',
	'+378 SM',
	'+239 ST',
	'+966 SA',
	'+221 SN',
	'+248 SC',
	'+232 SL',
	'+65 SG',
	'+421 SK',
	'+386 SI',
	'+677 SB',
	'+252 SO',
	'+27 ZA',
	'+34 ES',
	'+94 LK',
	'+249 SD',
	'+597 SR',
	'+268 SZ',
	'+46 SE',
	'+41 CH',
	'+963 SY',
	'+886 TW',
	'+992 TJ',
	'+255 TZ',
	'+66 TH',
	'+690 TK',
	'+676 TO',
	'+1-868 TT',
	'+216 TN',
	'+90 TR',
	'+993 TM',
	'+1-649 TC',
	'+688 TV',
	'+256 UG',
	'+380 UA',
	'+971 AE',
	'+44 GB',
	'+1 US',
	'+598 UY',
	'+998 UZ',
	'+678 VU',
	'+418 VA',
	'+58 VE',
	'+84 VN',
	'+1-284 VI',
	'+1-340 VQ',
	'+681 WF',
	'+967 YE',
	'+260 ZM',
	'+263 ZW',
];

export const resetToastData: toastProps['SUCCESS'] = {
	severity: '',
	color: '',
	message: '',
	showAnimtionCheck: false,
};

export const statuses: statusProps = {
	1: 'common.Created',
	2: 'common.Sending',
	3: 'campaigns.Stopped',
	4: 'common.Sent',
	5: 'campaigns.Canceled',
	6: 'campaigns.Optin',
	7: 'campaigns.Approve',
};

export const buttonTextLimits: ButtonTextLimits = {
	quickReply: 1024,
	callToAction: 640,
};

export const templateStatusResonTextLength: number = 26;

export const statusesByName: statusByNameProps = {
	Pending: 'whatsappManagement.pending',
	Rejected: 'whatsappManagement.rejected',
	Approved: 'whatsappManagement.approved',
	Received: 'whatsappManagement.received',
	Created: 'common.Created',
};

export const templateStatusIdsByStatusName: TemplatesStatusIdByStatusName = {
	Pending: 1,
	Rejected: 2,
	Approved: 3,
	Received: 4,
	Created: 50,
};

export const categoryId: CategoryId = {
	marketing: 1,
	utility: 2,
	authentication: 3,
};

export const categoryName: CategoryName = {
	1: 'marketing',
	2: 'utility',
	3: 'authentication',
};

export enum authenticationTypes {
	AUTHENTICATIONEN = 'AUTHENTICATIONEN',
	AUTHENTICATIONHEBREW = 'AUTHENTICATIONHEBREW'
}

export const campaignStatus: campaignStatusProps = {
	1: 'Created',
	2: 'Sending',
	3: 'Stopped',
	4: 'Finished',
	5: 'Canceled',
};

export enum whatsappChatStatuses {
	OPEN = 'open',
	PENDING = 'pending',
	SOLVED = 'solved',
}

export const allTemplateInitialPagination: AllTemplateReq = {
	templateName: '',
	templateStatus: 0,
	isPagination: true,
	pageNo: 1,
	pageSize: 6,
};

export const allCampaignInitialPagination: AllCampaignReq = {
	campaignName: '',
	fromDate: null,
	toDate: null,
	isPagination: true,
	pageNo: 1,
	pageSize: 6,
	isDeleted: false,
};

export const allReportInitialPagination: AllReportReq = {
	campaignName: '',
	fromDate: null,
	toDate: null,
	isPagination: true,
	pageNo: 1,
	pageSize: 6,
	IsTestCampaign: false
};

export const tierSetting: TierSetting[] = [
	{
		name: 'settings.accountSettings.actDetails.fields.tier1',
		value: '1',
		messageLimit: 1000,
	},
	{
		name: 'settings.accountSettings.actDetails.fields.tier2',
		value: '2',
		messageLimit: 10000,
	},
	{
		name: 'settings.accountSettings.actDetails.fields.tier3',
		value: '3',
		messageLimit: 100000,
	},
	{
		name: 'settings.accountSettings.actDetails.fields.tier4',
		value: '4',
		messageLimit: 'unlimited',
	},
];

export const authenticationMockTemplate: AuthenticationMockTemplateType = {
	AUTHENTICATIONEN: {
		body: '{{1}} is your verification code. For your security, do not share this code.',
		subtitle: 'The code expires in X minutes'
	},
	AUTHENTICATIONHEBREW: {
		body: `{{1}} הוא קוד האימות שלך. מטעמי אבטחה, אין לשתף את הקוד הזה.`,
		subtitle: 'תוקף הקוד הזה יפוג בעוד X דקות'
	}
}

export const templateErrors: WhatsappTemplateError[] = [
	{
		key: 'component of type FOOTER is missing expected field(s) (text)',
		title: 'invalidFormat',
		reason: 'footerIsMissingExpectedField'
	},
	{
		key: '#common-rejection-reasons for more information',
		title: 'invalidFormat',
		reason: 'invalidFormat'
	},
	{
		key: 'INCORRECT_CATEGORY',
		title: 'incorrectCategory',
		reason: 'categoryNotMatched'
	},
	{
		key: 'SCAM',
		title: 'suspectedScam',
		reason: 'suspectedScam'
	},
	{
		key: 'component of type BODY is missing expected field',
		title: 'invalidFormat',
		reason: 'bodyIsMissingExpectedField'
	},
	// {
	// 	key: 'INVALID_FORMAT',
	// 	title: 'invalidFormat',
	// 	reason: 'invalidFormat'
	// },
	{
		key: 'is not a valid phone number.',
		title: 'invalidFormat',
		reason: 'invalidPhoneNumber'
	},
	{
		key: 'Character Limit Exceeded',
		title: 'invalidFormat',
		reason: 'moreCharacters'
	},
	{
		key: 'ABUSIVE_CONTENT',
		title: 'abusiveContent',
		reason: 'abusiveContentsInTemplate'
	},
	{
		key: 'BUTTONS is missing expected field',
		title: 'invalidFormat',
		reason: 'buttonIsMissingExpectedField'
	},
	{
		key: 'more than 1,024 characters',
		title: 'invalidFormat',
		reason: 'moreThan1024Characters'
	},
	{
		key: 'variables, newlines, emojis, or formatting characters.',
		title: 'invalidFormat',
		reason: 'invalidButtonFormat'
	},
	{
		key: 'No elements passed in the last 10000000000 nanoseconds.',
		title: 'invalidFormat',
		reason: 'noElementPassed'
	},
	{
		key: 'more than two consecutive newline characters.',
		title: 'invalidFormat',
		reason: 'twoNewLineCharactersNotAllowed'
	},
	{
		key: '404 Not Found',
		title: '404NotFound',
		reason: 'unableToReadFromURL'
	},
	{
		key: 'AUTHENTICATION category',
		title: 'invalidFormat',
		reason: 'noImageAuthentication'
	}
]