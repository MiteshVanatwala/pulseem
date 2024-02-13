export type JSONProps = {
	text?: JSONPropsText;
	textMedia?: TextMedia;
	quickReply?: QuickReply;
	callToAction?: CallToAction;
	textMediaAndButton?: TextMediaAndButton;
};

export type quickReplyButton = {
	id: string;
	title: string;
};

export type callToActionButton = {
	[key: string]: string | boolean;
	type: string;
	title: string;
};

export type CallToAction = {
	friendlyTemplateName: string;
	templateName: string;
	TemplateCategory: string;
	variables: { [key: string]: string };
	language: string;
	types: CallToActionTypes;
	isSaveOnly?: boolean;
	id?: number;
};

export type CallToActionTypes = {
	'call-to-action': CallToActionClass;
};

export type CallToActionClass = {
	body: string;
	actions: callToActionButton[];
};

export type quickReplyClass = {
	body: string;
	actions: quickReplyButton[];
};

export type authenticationClass = {
	add_security_recommendation: boolean;
	code_expiration_minutes?: number;
	actions: authenticationCopyButtonClass[];
};
export type authenticationCopyButtonClass = {
	type: string;
	copy_code_text: string;
};

export type QuickReply = {
	friendlyTemplateName: string;
	templateName: string;
	TemplateCategory: string;
	variables: { [key: string]: string };
	language: string;
	types: QuickReplyTypes;
	isSaveOnly?: boolean;
	id?: number;
	codeExpirationTime?: number;
};

export type QuickReplyTypes = {
	'quick-reply'?: quickReplyClass;
	authentication?: authenticationClass;
};

export type JSONPropsText = {
	friendlyTemplateName: string;
	templateName: string;
	variables: { [key: string]: string };
	language: string;
	types: TextTypes;
	TemplateCategory: string;
	isSaveOnly?: boolean;
	id?: number;
};

export type TextTypes = {
	text: TypesText;
};

export type TypesText = {
	body: string;
};

export type TextMedia = {
	friendlyTemplateName: string;
	templateName: string;
	TemplateCategory: string;
	variables: { [key: string]: string };
	language: string;
	types: TextMediaTypes;
	isSaveOnly?: boolean;
	id?: number;
};

export type TextMediaTypes = {
	media: Media;
};

export type Media = {
	body: string;
	media_type: string;
	media: string[];
};

export type TextMediaAndButton = {
	friendlyTemplateName: string;
	templateName: string;
	TemplateCategory: string;
	variables: { [key: string]: string };
	language: string;
	types: TextMediaAndButtonTypes;
	isSaveOnly?: boolean;
	id?: number;
};

export type TextMediaAndButtonTypes = {
	card: Card;
};

export type Card = {
	title: string;
	subtitle: string | null;
	media: string[];
	actions: callToActionButton[] | quickReplyButton[];
};
