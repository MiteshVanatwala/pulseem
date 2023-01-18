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
	[key: string]: string;
	type: string;
	title: string;
};

export type CallToAction = {
	friendlyTemplateName: string;
	templateName: string;
	variables: { [key: string]: string };
	language: string;
	types: CallToActionTypes;
	isSaveOnly?: boolean;
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

export type QuickReply = {
	friendlyTemplateName: string;
	templateName: string;
	variables: { [key: string]: string };
	language: string;
	types: QuickReplyTypes;
	isSaveOnly?: boolean;
};

export type QuickReplyTypes = {
	'quick-reply': quickReplyClass;
};

export type JSONPropsText = {
	friendlyTemplateName: string;
	templateName: string;
	variables: { [key: string]: string };
	language: string;
	types: TextTypes;
	isSaveOnly?: boolean;
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
	variables: { [key: string]: string };
	language: string;
	types: TextMediaTypes;
	isSaveOnly?: boolean;
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
	variables: { [key: string]: string };
	language: string;
	types: TextMediaAndButtonTypes;
	isSaveOnly?: boolean;
};

export type TextMediaAndButtonTypes = {
	card: Card;
};

export type Card = {
	title: string;
	subtitle: string;
	media: string[];
	actions: callToActionButton[] | quickReplyButton[];
};
