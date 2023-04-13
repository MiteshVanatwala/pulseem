import {
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
import {
	landingPageDataProps,
	personalFieldDataProps,
	SubAccountSettings,
	updatedVariable,
} from './Campaign/Types/WhatsappCampaign.types';
import { APIWhatsappChatVariablesData } from './Chat/Types/WhatsappChat.type';
import { buttonTypes } from './Constant';

//This regex will test dynamic field having two digits in side (i.e. {{10}});
const dynamicFieldL6 = new RegExp('^({{)[0-9][0-9](}})$');
//This regex will test dynamic field having one digits in side (i.e. {{1}});
const dynamicFieldL5 = new RegExp('^({{)[0-9](}})$');

export const getDynamicFields = (text: string) => {
	let indices = [];
	for (let i = 0; i < text?.length; i++) {
		if (dynamicFieldL5.test(text?.slice(i, i + 5))) {
			indices.push(text?.slice(i, i + 5));
		}
		if (dynamicFieldL6.test(text?.slice(i, i + 6))) {
			indices.push(text?.slice(i, i + 6));
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
									value: '+972 Israel',
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
		templatePreviewData.templateData.templateText = cardData?.title;
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
			templatePreviewData.fileData.fileLink = cardData?.media[0];
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
	updatedDynamicVariable: updatedVariable[],
	personalFields: personalFieldDataProps,
	landingPages: landingPageDataProps[]
): updatedVariable[] => {
	const formattedDynamicVariable: updatedVariable[] =
		updatedDynamicVariable.map((dynamicVariable) => {
			if (dynamicVariable?.FieldTypeId === 1) {
				return {
					...dynamicVariable,
					VariableValue: `##${getKeyByValue(
						personalFields,
						dynamicVariable?.VariableValue
					)}##`,
				};
			}
			if (dynamicVariable?.FieldTypeId === 4) {
				return {
					...dynamicVariable,
					VariableValue: getCampaignLink(
						landingPages,
						dynamicVariable?.VariableValue
					),
				};
			}
			return dynamicVariable;
		});
	return formattedDynamicVariable;
};
