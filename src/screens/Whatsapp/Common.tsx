import {
	ApiErrorResponse,
	buttonsDataProps,
	callToActionProps,
	quickReplyButtonProps,
	savedTemplateCallToActionProps,
	savedTemplateCardProps,
	savedTemplateListProps,
	savedTemplateMediaProps,
	savedTemplateQuickReplyProps,
	savedTemplateTextProps,
	savedTemplateTypesProps,
	templatePreviewDataProps,
} from './Editor/Types/WhatsappCreator.types';
import uniqid from 'uniqid';
import WhatsappApiResponse from '../../assets/translations/en/WhatsappApiResponse.json';
import {
	landingPageDataProps,
	SubAccountSettings,
	updatedVariable,
} from './Campaign/Types/WhatsappCampaign.types';
import { APIWhatsappChatVariablesData } from './Chat/Types/WhatsappChat.type';
import { buttonTypes, fileTypes } from './Constant';
import { Separator } from '../../helpers/Constants';

//This regex will test dynamic field having two digits in side (i.e. {{10}});
const dynamicFieldL6 = new RegExp('^({{)[0-9][0-9](}})$');
//This regex will test dynamic field having one digits in side (i.e. {{1}});
const dynamicFieldL5 = new RegExp('^({{)[0-9](}})$');
const dynamicFieldNewLine = new RegExp('^\n$');

export const getDynamicFields = (text: string, replaceNewLine: boolean = false) => {
	let indices = [];
	for (let i = 0; i < text?.length; i++) {
		if (dynamicFieldL5.test(text?.slice(i, i + 5))) {
			indices.push(text?.slice(i, i + 5));
		}
		if (dynamicFieldL6.test(text?.slice(i, i + 6))) {
			indices.push(text?.slice(i, i + 6));
		}
		if (replaceNewLine && dynamicFieldNewLine.test(text?.slice(i, i + 1))) {
			indices.push(text?.slice(i, i + 1));
		}
	}
	return indices;
};

export const getDynamicFieldIndex = (text: string) => {
	let indices = [];
	for (let i = 0; i < text.length; i++) {
		if (
			dynamicFieldL5.test(text.slice(i, i + 5)) ||
			dynamicFieldL6.test(text.slice(i, i + 6))
		) {
			indices.push(i);
		}
	}
	return indices;
};

export const getLastDynamicFieldValue = (text: string) => {
	let str = text;
	let indices: string[] = [];
	for (let i = 0; i < str.length; i++) {
		if (dynamicFieldL5.test(str.slice(i, i + 5))) {
			indices.push(str.slice(i, i + 5).replace(/[{}]/g, ''));
		} else if (dynamicFieldL6.test(str.slice(i, i + 6))) {
			indices.push(str.slice(i, i + 6).replace(/[{}]/g, ''));
		}
	}
	return indices?.length > 0 ? indices[indices?.length - 1] : '0';
};

export const getLastDynamicFieldByValue = (value: string) => {
	return `{{${(Number(value) + 1).toString()}}}`;
};

export const getVariableValue = (variable: string) => {
	return variable?.replace(/[{}]/g, '');
};

export const getFileType = (fileLink: string) => {
	if (
		fileLink?.includes('.png') ||
		fileLink?.includes('.jpeg') ||
		fileLink?.includes('.jpg')
	) {
		return fileTypes.IMAGE;
	} else if (fileLink?.includes('.pdf')) {
		return fileTypes.DOCUMENT;
	} else if (fileLink?.includes('.mp4')) {
		return fileTypes.VIDEO;
	}
};

export const getTemplateIdByName = (
	savedTemplateList: savedTemplateListProps[],
	templateName: string
) => {
	return (
		savedTemplateList?.find(
			(template: savedTemplateListProps) =>
				template.FriendlyTemplateName === templateName ||
				template.TemplateName === templateName
		)?.TemplateId || null
	);
};

export const getTemplateNameById = (
	savedTemplateList: savedTemplateListProps[],
	templateId: string
) => {
	const template = savedTemplateList?.find(
		(template: savedTemplateListProps) => template.TemplateId === templateId
	);
	if (template) {
		if (
			template?.FriendlyTemplateName &&
			template?.FriendlyTemplateName?.length > 0
		) {
			return template?.FriendlyTemplateName;
		}
		return template?.TemplateName;
	}
	return '';
};

export const getTemplateName = (template: savedTemplateListProps) => {
	if (
		template?.FriendlyTemplateName &&
		template?.FriendlyTemplateName?.length > 0
	) {
		return template?.FriendlyTemplateName;
	}
	return template?.TemplateName;
};

export const getTemplatePreviewData = (
	templateData: savedTemplateTypesProps
) => {
	let templatePreviewData: templatePreviewDataProps = {
		templateData: {
			templateText: '',
			templateButtons: [],
		},
		buttonType: '',
		fileData: {
			fileLink: '',
			fileType: '',
		},
	};
	const setButtonsData = (buttonType: string, data: buttonsDataProps[]) => {
		let buttonData: quickReplyButtonProps[] | callToActionProps = [];
		switch (buttonType) {
			case buttonTypes.QUICK_REPLY:
				buttonData = data?.map((button: buttonsDataProps) => {
					return {
						id: uniqid(),
						typeOfAction: '',
						fields: [
							{
								fieldName: 'whatsapp.websiteButtonText',
								type: 'text',
								placeholder: 'whatsapp.websiteButtonTextPlaceholder',
								value: button.title,
							},
						],
					};
				});
				return buttonData ? buttonData : [];
			case buttonTypes.CALL_TO_ACTION:
				buttonData = data?.map((button: buttonsDataProps) => {
					if (button?.type === 'PHONE_NUMBER') {
						return {
							id: uniqid(),
							typeOfAction: 'phonenumber',
							fields: [
								{
									fieldName: 'whatsapp.phoneButtonText',
									type: 'text',
									placeholder: 'whatsapp.phoneButtonTextPlaceholder',
									value: button.title,
								},
								{
									fieldName: 'whatsapp.country',
									type: 'select',
									placeholder: 'Select Your Country Code',
									value: button?.phoneCode || '+972',
								},
								{
									fieldName: 'whatsapp.phoneNumber',
									type: 'tel',
									placeholder: 'whatsapp.phoneNumberPlaceholder',
									value: button.phone,
								},
							],
						};
					} else {
						return {
							id: uniqid(),
							typeOfAction: 'website',
							fields: [
								{
									fieldName: 'whatsapp.websiteButtonText',
									type: 'text',
									placeholder: 'whatsapp.websiteButtonTextPlaceholder',
									value: button.title,
								},
								{
									fieldName: 'whatsapp.websiteURL',
									type: 'text',
									placeholder: 'whatsapp.websiteURLPlaceholder',
									value: button.url,
								},
							],
						};
					}
				});
				return buttonData ? buttonData : [];
		}
	};
	const saveQuickreplyTemplate = (templateData: savedTemplateTypesProps) => {
		const quickReplyData: savedTemplateQuickReplyProps =
			templateData?.['quick-reply'];
		templatePreviewData.buttonType = buttonTypes.QUICK_REPLY;
		templatePreviewData.templateData.templateText = quickReplyData?.body;
		const buttonData = setButtonsData(
			buttonTypes.QUICK_REPLY,
			quickReplyData?.actions
		);
		templatePreviewData.templateData.templateButtons = buttonData || [];
	};

	const saveCallToActionTemplate = (templateData: savedTemplateTypesProps) => {
		const callToActionData: savedTemplateCallToActionProps =
			templateData?.['call-to-action'];
		templatePreviewData.buttonType = buttonTypes.CALL_TO_ACTION;
		const buttonData = setButtonsData(
			buttonTypes.CALL_TO_ACTION,
			callToActionData?.actions
		);
		templatePreviewData.templateData.templateText = callToActionData?.body;
		templatePreviewData.templateData.templateButtons = buttonData || [];
	};

	const saveCardTemplate = (templateData: savedTemplateTypesProps) => {
		const cardData: savedTemplateCardProps = templateData?.['card'];
		templatePreviewData.templateData.templateText = `${cardData?.title}${cardData?.subtitle && cardData?.subtitle !== '' ? "\n" + cardData?.subtitle : ''}`;
		if (cardData?.actions?.length > 0) {
			if (cardData?.actions[0]?.type !== 'QUICK_REPLY') {
				templatePreviewData.buttonType = buttonTypes.CALL_TO_ACTION;
				const buttonData = setButtonsData(
					buttonTypes.CALL_TO_ACTION,
					cardData?.actions
				);
				templatePreviewData.templateData.templateButtons = buttonData || [];
			} else {
				templatePreviewData.buttonType = buttonTypes.QUICK_REPLY;
				const buttonData = setButtonsData(
					buttonTypes.QUICK_REPLY,
					cardData?.actions
				);
				templatePreviewData.templateData.templateButtons = buttonData || [];
			}
		}
		if (cardData?.media?.length > 0) {
			// getFileType(fileData?.fileLink)
			templatePreviewData.fileData.fileLink = cardData?.media[0];
			templatePreviewData.fileData.fileType =
				getFileType(cardData?.media[0]) || '';
		}
	};

	const saveMediaTemplate = (templateData: savedTemplateTypesProps) => {
		const mediaData: savedTemplateMediaProps = templateData?.['media'];
		templatePreviewData.templateData.templateText = mediaData?.body;
		if (mediaData?.media?.length > 0) {
			templatePreviewData.fileData.fileLink = mediaData?.media[0];
			templatePreviewData.fileData.fileType = mediaData?.media_type;
		}
	};

	const saveTextTemplate = (templateData: savedTemplateTypesProps) => {
		const textData: savedTemplateTextProps = templateData?.['text'];
		templatePreviewData.templateData.templateText = textData?.body;
	};
	if (templateData) {
		if ('quick-reply' in templateData) {
			saveQuickreplyTemplate(templateData);
		}
		if ('call-to-action' in templateData) {
			saveCallToActionTemplate(templateData);
		} else if ('card' in templateData) {
			saveCardTemplate(templateData);
		} else if ('media' in templateData) {
			saveMediaTemplate(templateData);
		} else if ('text' in templateData) {
			saveTextTemplate(templateData);
		}
	}
	return templatePreviewData;
};

export const checkSiteTrackingLink = (
	SubAccountSettings: SubAccountSettings,
	text: string
): boolean => {
	if (
		SubAccountSettings?.DomainAddress &&
		SubAccountSettings?.DomainAddress !== ''
	) {
		const domainName = SubAccountSettings?.DomainAddress.replace('https://', '')
			.replace('http://', '')
			.replace('www.', '');
		return text.includes(domainName);
	}
	return false;
};

export const getTemplateTextWithVariable = (
	templateText: string,
	variablesData: APIWhatsappChatVariablesData
) => {
	let updatedTemplateText = templateText;
	if (variablesData) {
		const dynamicVariables = getDynamicFields(templateText);
		dynamicVariables?.forEach((dynamicVariable: string) => {
			updatedTemplateText = updatedTemplateText?.replace(
				dynamicVariable,
				variablesData[getVariableValue(dynamicVariable)]
			);
		});
	}

	return updatedTemplateText;
};

export const getKeyByValue = (
	object: { [key: string]: string },
	value: string
) => {
	return (
		Object.keys(object).find(
			(key) =>
				object[key] ===
				value?.replaceAll('#', '')?.replace(/([a-z])([A-Z])/g, '$1 $2')
		) || ''
	);
};

export const getCampaignLink = (
	landingPages: landingPageDataProps[],
	campaignName: string
) => {
	return (
		landingPages?.find((page) => page.CampaignName === campaignName)
			?.PageHref || ''
	);
};

export const formatUpdatedDynamicVariable = (
	updatedDynamicVariable: updatedVariable[]
): updatedVariable[] => {
	const formattedDynamicVariable: updatedVariable[] =
		updatedDynamicVariable.map((dynamicVariable) => {
			if (dynamicVariable?.FieldTypeId === 1) {
				return {
					...dynamicVariable,
					VariableValue: `##${dynamicVariable?.VariableValue}##`,
				};
			}
			return dynamicVariable;
		});
	return formattedDynamicVariable;
};

export const checkLanguage = (text: string, isRTL: boolean) => {
	let isEnglish = false;
	let isHebrew = false;
	let isContainAlphabates = false;
	if (text?.length > 0) {
		for (var i = 0; i < text?.length; i++) {
			if (!/[^a-zA-Z\u0590-\u05FF]/.test(text?.charAt(i))) {
				isContainAlphabates = true;
				if (/[\u0590-\u05FF]/.test(text?.charAt(i))) {
					isHebrew = true;
				}
				if (/[a-zA-Z]/.test(text?.charAt(i))) {
					isEnglish = true;
				}
			}
		}
	} else {
		return 'Both';
	}
	if (isEnglish && isHebrew) {
		return 'Both';
	} else if (!isEnglish && !isHebrew) {
		if (isContainAlphabates) {
			return 'Both';
		} else {
			return isRTL ? 'Hebrew' : 'English';
		}
	} else {
		return isEnglish ? 'English' : 'Hebrew';
	}
};

export const getTextDirection = (text: string, isRTL: boolean) => {
	const language = checkLanguage(text, isRTL);
	switch (language) {
		case 'Both':
			return isRTL ? 'rtl' : 'ltr';
		case 'English':
			return 'ltr';
		case 'Hebrew':
			return 'rtl';

		default:
			return 'ltr';
	}
};

export const getApiErrorResponseMessage = (
	messageKey: string,
	responseCode: number | string
): string => {
	const apiErrorResponse: ApiErrorResponse = WhatsappApiResponse;
	if (apiErrorResponse[messageKey][responseCode]) {
		return messageKey === 'twilio'
			? `WhatsappApiResponse.${messageKey}.${responseCode}.message`
			: `WhatsappApiResponse.${messageKey}.${responseCode}`;
	} else {
		return 'WhatsappApiResponse.common.error';
	}
};

export const getWhatsappError = (message: string): string => {
	const initialCode = message.substring(0, 5);
	const initialCodeList = [
		'63005', '63013', '63019', '63027', '63041'
	]
	if (message.indexOf('https://www.twilio.com/docs/api/errors') > -1) {
		const errorCode = message?.split('/');
		return getApiErrorResponseMessage(
			'twilio',
			Number(errorCode[errorCode?.length - 1])
		);
	} else if (initialCodeList.indexOf(initialCode) > -1) {
		return `WhatsappApiResponse.${initialCode}.message`;
	} else if(message.indexOf('message body or media urls must be specified') > -1) {
		return `WhatsappApiResponse.bodyOrMediaURLMustBeSpecified.message`;
	} else if(message.indexOf('internal server error has occurred') > -1) {
		return `WhatsappApiResponse.internalServerError.message`;
	} else if(message.indexOf('Authenticate') > -1) {
		return `WhatsappApiResponse.authenticate.message`;
	} else if(message.indexOf('Invalid media URL') > -1) {
		return `WhatsappApiResponse.invalidMediaURL.message`;
	} else if(message.indexOf('The Content Variables parameter is invalid') > -1) {
		return `WhatsappApiResponse.contentVariablesParameterInvalid.message`;
	} else if(message.indexOf('The Messaging Service Sid') > -1) {
		return `WhatsappApiResponse.messagingServiceKeyInvalid.message`;
	} else if(message.indexOf('The \'To\' number whatsapp') > -1) {
		return `WhatsappApiResponse.NoWhatsApp.message`;
	}
	return 'WhatsappApiResponse.common.error';
};

export const getMetaError = (message: string): string => {
	const splittedError = message?.split(Separator);
	const errorCodeList = [
		"0", "3", "10", "190", "4", "80007", "130429", "131048", "131056", "133016", "368", "130497", "131031", "1", "2", "33", "100", "130472", "131000", "131005", "131008", "131009", "131016", "131021", "131026", "131042", "131045", "131047", "131049", "131051", "131052", "131053", "131057", "132000", "132001", "132005", "132007", "132012", "132015", "132016", "132068", "132069", "133000", "133004", "133005", "133006", "133008", "133009", "133010", "133015", "135000"
	]
	if (splittedError?.length > 0 && errorCodeList.indexOf(splittedError[0]) > -1) {
		return `WhatsappOnBoarding.metaErrorCodes.${splittedError[0]}`;
	} 
	return 'WhatsappApiResponse.common.error';
};

export const getErrorMessageFromTwilioLink = (link: string): string => {
	const errorCode = link?.split('/');
	return getApiErrorResponseMessage(
		'twilio',
		Number(errorCode[errorCode?.length - 1])
	);
};

export const getFileNameFromLink = (fileLink: string) => {
	const fileName = fileLink?.split('_orignal_');
	return fileName?.length > 0 ? fileName[fileName?.length - 1] : '';
};

export const isShowTierAlert = (
	messageLeft: number,
	messageRequired: number,
	whatsappTierID: number,
	sendType: string,
	isIn24HrWindow: boolean
) => {
	if (whatsappTierID !== 4) {
		if (sendType === '1' || (sendType === '2' && isIn24HrWindow)) {
			if (messageLeft < messageRequired) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	} else {
		return false;
	}
};

export const adjustTemplateVariablesForLink = (
	templateData: savedTemplateTypesProps,
	updatedDynamicVariable: updatedVariable[],
	whatsappTempalteBody: string = ''
) => {
	let {
		templateData: { templateText },
	} = getTemplatePreviewData(templateData);
	if (whatsappTempalteBody !== '') templateText = whatsappTempalteBody;
	const DynamicFieldsIndex = getDynamicFieldIndex(templateText);
	const adjustedDynamicVariableForLinks = DynamicFieldsIndex?.map(
		(fieldIndex, index) => {
			const variable = updatedDynamicVariable?.find(
				(dynamicVariable) => dynamicVariable?.VariableIndex === index + 1
			)!;
			if (
				variable &&
				variable?.IsStatastic !== true &&
				(variable?.FieldTypeId === 3 ||
					variable?.FieldTypeId === 4 ||
					variable?.FieldTypeId === 5)
			) {
				let adjustedVariable = variable;
				if (
					templateText.charAt(fieldIndex - 1) !== ' ' &&
					adjustedVariable?.VariableValue?.charAt(0) !== ' '
				) {
					adjustedVariable = {
						...variable,
						VariableValue: ` ${adjustedVariable?.VariableValue}`,
					};
				}
				if (
					templateText.charAt(
						index + 1 <= 9 ? fieldIndex + 5 : fieldIndex + 5
					) !== ' ' &&
					adjustedVariable?.VariableValue?.charAt(
						adjustedVariable?.VariableValue?.length - 1
					) !== ' '
				) {
					if (
						templateText?.length !==
						(index + 1 <= 9 ? fieldIndex + 5 : fieldIndex + 5)
					) {
						adjustedVariable = {
							...variable,
							VariableValue: `${adjustedVariable?.VariableValue}${variable?.FieldTypeId === 4 ? '' : ' '}`,
						};
					}
				}
				return adjustedVariable;
			} else {
				return variable;
			}
		}
	);
	return adjustedDynamicVariableForLinks;
};
