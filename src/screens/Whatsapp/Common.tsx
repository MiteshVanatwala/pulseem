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
				template.TemplateName === templateName
		)?.TemplateId || null
	);
};

export const getTemplateNameById = (
	savedTemplateList: savedTemplateListProps[],
	templateId: string
) => {
	return (
		savedTemplateList?.find(
			(template: savedTemplateListProps) => template.TemplateId === templateId
		)?.TemplateName || null
	);
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
			case 'quickReply':
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
			case 'callToAction':
				buttonData = data?.map((button: buttonsDataProps) => {
					if (button?.type === 'PHONE') {
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
		templatePreviewData.buttonType = 'quickReply';
		templatePreviewData.templateData.templateText = quickReplyData?.body;
		const buttonData = setButtonsData('quickReply', quickReplyData?.actions);
		templatePreviewData.templateData.templateButtons = buttonData || [];
	};

	const saveCallToActionTemplate = (templateData: savedTemplateTypesProps) => {
		const callToActionData: savedTemplateCallToActionProps =
			templateData?.['call-to-action'];
		templatePreviewData.buttonType = 'callToAction';
		const buttonData = setButtonsData(
			'callToAction',
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
				templatePreviewData.buttonType = 'callToAction';
				const buttonData = setButtonsData('callToAction', cardData?.actions);
				templatePreviewData.templateData.templateButtons = buttonData || [];
			} else {
				templatePreviewData.buttonType = 'quickReply';
				const buttonData = setButtonsData('quickReply', cardData?.actions);
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
