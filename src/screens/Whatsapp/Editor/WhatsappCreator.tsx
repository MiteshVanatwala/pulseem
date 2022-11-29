import React, { BaseSyntheticEvent, useMemo, useRef, useState } from 'react';
import DefaultScreen from '../../DefaultScreen';
import uniqid from 'uniqid';
import { Title } from '../../../components/managment/Title';
import TemplateFields from './TemplateFields';
import ActionCallPopOver from './ActionCallPopOver';
import Buttons from './Buttons';
import Phone from './Phone';
import {
	callToActionFieldProps,
	callToActionProps,
	callToActionRowProps,
	coreProps,
	quickReplyButtonProps,
	quickReplyButtonsFieldProps,
	templateDataProps,
	WhatsappCreatorProps,
} from './WhatsappCreator.types';
import { ClassesType } from '../../Classes.types';
import { useTranslation } from 'react-i18next';
import { Box, Grid } from '@material-ui/core';
import WhatsappTemplateEditor from './WhatsappTemplateEditor';
import { actionButtonProps } from './WhatsappCreator.types';
import QuickReply from './QuickReply';
import { useSelector } from 'react-redux';

const WhatsappCreator = ({ classes }: WhatsappCreatorProps & ClassesType) => {
	const { t: translator } = useTranslation();
	const { isRTL } = useSelector((state: { core: coreProps }) => state.core);
	const templateTextRef = useRef<HTMLTextAreaElement>(null);
	const initialQuickReplyButtons = [
		{
			id: uniqid(),
			typeOfAction: '',
			fields: [
				{
					fieldName: translator('whatsapp.websiteButtonText'),
					type: 'text',
					placeholder: translator('whatsapp.websiteButtonTextPlaceholder'),
					value: '',
				},
			],
		},
	];
	const [templateName, setTemplateName] = useState<string>('');
	const [savedTemplate, setSavedTemplate] = useState<string>('');
	const [buttonType, setButtonType] = useState<string>('');
	const [templateData, setTemplateData] = useState<templateDataProps>({
		templateText: '',
		templateButtons: [],
	});
	const [isQuickReplyOpen, setIsQuickReplyOpen] = useState<boolean>(false);
	const [isCallToActionOpen, setIsCallToActionOpen] = useState<boolean>(false);
	const [quickReplyButtons, setQuickReplyButtons] = useState<
		quickReplyButtonProps[]
	>(initialQuickReplyButtons);

	const websiteField = useMemo<callToActionFieldProps[]>(
		() => [
			{
				fieldName: translator('whatsapp.websiteButtonText'),
				type: 'text',
				placeholder: translator('whatsapp.websiteButtonTextPlaceholder'),
				value: '',
			},
			{
				fieldName: translator('whatsapp.websiteURL'),
				type: 'text',
				placeholder: translator('whatsapp.websiteURLPlaceholder'),
				value: '',
			},
		],
		[translator]
	);
	const phoneNumberField = useMemo<callToActionFieldProps[]>(
		() => [
			{
				fieldName: translator('whatsapp.phoneButtonText'),
				type: 'text',
				placeholder: translator('whatsapp.phoneButtonTextPlaceholder'),
				value: '',
			},
			{
				fieldName: translator('whatsapp.country'),
				type: 'select',
				placeholder: 'Select Your Country Code',
				value: '+972 Israel',
			},
			{
				fieldName: translator('whatsapp.phoneNumber'),
				type: 'tel',
				placeholder: translator('whatsapp.phoneNumberPlaceholder'),
				value: '',
			},
		],
		[translator]
	);

	const initialFieldRow = {
		id: uniqid(),
		typeOfAction: 'phonenumber',
		fields: phoneNumberField,
	};

	const [callToActionFieldRows, setCallToActionFieldRows] =
		useState<callToActionProps>([initialFieldRow]);

	const onTemplateNameChange = (e: BaseSyntheticEvent) => {
		setTemplateName(e.target.value.toLowerCase());
	};

	const onSavedTemplateChange = (e: BaseSyntheticEvent) => {
		setSavedTemplate(e.target.value);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log('Form Submitted with these - ', templateName, savedTemplate);
		console.log('Form Submitted with these - requestJSON', requestJSON);
	};

	const addDynamicField = (
		selectionEnd: number | undefined,
		textLength: number | undefined
	) => {
		let updatedTemplateText = templateData.templateText;
		if (
			(selectionEnd === 0 && textLength === 0) ||
			selectionEnd === textLength
		) {
			updatedTemplateText =
				updatedTemplateText +
				getLastDynamicFieldByValue(
					getLastDynamicFieldValue(updatedTemplateText)
				);
		} else {
			updatedTemplateText = [
				updatedTemplateText.slice(0, selectionEnd),
				getLastDynamicFieldByValue(
					getLastDynamicFieldValue(updatedTemplateText.slice(0, selectionEnd))
				),
				updatedTemplateText.slice(selectionEnd),
			].join('');
		}

		return updatedTemplateText;
	};

	const getDynamicFieldIndex = (text: string) => {
		var indices = [];
		var dynamicFieldL6 = new RegExp('^({{)[0-9][0-9](}})$');
		var dynamicFieldL5 = new RegExp('^({{)[0-9](}})$');
		for (var i = 0; i < text.length; i++) {
			if (
				dynamicFieldL5.test(text.slice(i, i + 5)) ||
				dynamicFieldL6.test(text.slice(i, i + 6))
			) {
				indices.push(i);
			}
		}
		return indices;
	};

	const getLastDynamicFieldValue = (text: string) => {
		var str = text;
		var indices: string[] = [];
		var dynamicFieldL6 = new RegExp('^({{)[0-9][0-9](}})$');
		var dynamicFieldL5 = new RegExp('^({{)[0-9](}})$');
		for (var i = 0; i < str.length; i++) {
			if (dynamicFieldL5.test(str.slice(i, i + 5))) {
				indices.push(str.slice(i, i + 5).replace(/[{}]/g, ''));
			} else if (dynamicFieldL6.test(str.slice(i, i + 6))) {
				indices.push(str.slice(i, i + 6).replace(/[{}]/g, ''));
			}
		}
		return indices?.length > 0 ? indices[indices?.length - 1] : '0';
	};

	const getLastDynamicFieldByValue = (value: string) => {
		return '{{' + (Number(value) + 1).toString() + '}}';
	};

	const reOrderDynamicFieldValue = (text: string) => {
		const d = getDynamicFieldIndex(text);
		var dynamicFieldL6 = new RegExp('^({{)[0-9][0-9](}})$');
		var dynamicFieldL5 = new RegExp('^({{)[0-9](}})$');
		let updatedText = '';
		let lastDynamicFieldLength = 0;
		if (d?.length <= 0) return text;
		for (var i = 0; i < d?.length; i++) {
			if (dynamicFieldL5.test(text.slice(d[i], d[i] + 5))) {
				lastDynamicFieldLength = 5;
				if (updatedText?.length <= 0) {
					updatedText = text.slice(0, d[i]) + '{{' + Number(i + 1) + '}}';
				} else {
					updatedText =
						updatedText +
						text.slice(d[i - 1] + 5, d[i]) +
						'{{' +
						Number(i + 1) +
						'}}';
				}
			} else if (dynamicFieldL6.test(text.slice(d[i], d[i] + 6))) {
				lastDynamicFieldLength = 6;
				if (updatedText?.length <= 0) {
					updatedText = text.slice(0, d[i]) + '{{' + Number(i + 1) + '}}';
				} else {
					updatedText =
						updatedText +
						text.slice(d[i - 1] + 6, d[i]) +
						'{{' +
						Number(i + 1) +
						'}}';
				}
			}
		}
		return updatedText + text.slice(d[d?.length - 1] + lastDynamicFieldLength);
	};

	const onButtonClick = (button: actionButtonProps) => {
		if (button.buttonTitle.includes('callToAction')) {
			setIsCallToActionOpen(true);
		} else if (button.buttonTitle.includes('quickReplay')) {
			setIsQuickReplyOpen(true);
		} else if (button.buttonTitle.includes('dynamicField')) {
			const selectionEnd = templateTextRef.current?.selectionEnd;
			const textLength = templateTextRef.current?.textLength;
			reOrderDynamicFieldValue(addDynamicField(selectionEnd, textLength));
			setTemplateData({
				...templateData,
				templateText: reOrderDynamicFieldValue(
					addDynamicField(selectionEnd, textLength)
				),
			});
			templateTextRef.current?.focus();
		} else if (button.buttonTitle.includes('removalText')) {
			setTemplateData({
				...templateData,
				templateText: `${templateData.templateText} ${
					isRTL ? '\nלהסרה השב “הסר”' : '\nReply “remove” to unsubscribe'
				}`,
			});
		}
	};

	const onActionButtonDelete = (
		button: quickReplyButtonProps | callToActionRowProps
	) => {
		if (buttonType === 'quickReply') {
			const updatedQuickButtonsData = quickReplyButtons.filter(
				(quickButton: quickReplyButtonProps) => quickButton.id !== button.id
			);
			setTemplateData({
				...templateData,
				templateButtons: updatedQuickButtonsData,
			});
			setQuickReplyButtons([...updatedQuickButtonsData]);
			if (updatedQuickButtonsData?.length <= 0) {
				setButtonType('');
			}
		} else {
			const updatedCallToActionFieldRows = callToActionFieldRows.filter(
				(fieldRow: callToActionRowProps) => fieldRow.id !== button.id
			);
			setTemplateData({
				...templateData,
				templateButtons: updatedCallToActionFieldRows,
			});
			setCallToActionFieldRows([...updatedCallToActionFieldRows]);
			if (updatedCallToActionFieldRows?.length <= 0) {
				setButtonType('');
			}
		}
	};

	const updateTemplateButton = (
		buttons: quickReplyButtonProps[] | callToActionProps,
		buttonsType: string
	) => {
		setTemplateData({ ...templateData, templateButtons: buttons });
		buttons?.length > 0 ? setButtonType(buttonsType) : setButtonType('');
	};

	const addMore = () => {
		setCallToActionFieldRows([...callToActionFieldRows, initialFieldRow]);
	};

	const updateTemplateText = (text: string) => {
		setTemplateData({
			...templateData,
			templateText: reOrderDynamicFieldValue(text),
		});
	};

	const getQuickReplyActions = () => {
		return templateData.templateButtons.map((button: quickReplyButtonProps) => {
			return {
				id: button.id,
				title: button.fields.find((field: quickReplyButtonsFieldProps) => {
					return field.fieldName === translator('whatsapp.websiteButtonText');
				})?.value,
			};
		});
	};

	const getCallTOActionActions = () => {
		return templateData.templateButtons.map((button: quickReplyButtonProps) => {
			return {
				type: button.typeOfAction === 'phonenumber' ? 'PHONE_NUMBER' : 'URL',
				title: button.fields.find((field: quickReplyButtonsFieldProps) => {
					return field.fieldName === translator('whatsapp.websiteButtonText');
				})?.value,
				[button.typeOfAction === 'phonenumber' ? 'phone' : 'url']:
					button.typeOfAction === 'phonenumber'
						? button.fields.find((field: quickReplyButtonsFieldProps) => {
								return field.fieldName === translator('whatsapp.phoneNumber');
						  })?.value
						: button.fields.find((field: quickReplyButtonsFieldProps) => {
								return field.fieldName === translator('whatsapp.websiteURL');
						  })?.value,
			};
		});
	};

	const requestJSON = {
		text: {
			phonenumber: '',
			templateName: templateName,
			variables: {
				'1': 'name',
			},
			language: isRTL ? 'he' : 'en',
			types: {
				text: {
					body: templateData.templateText,
				},
			},
		},
		textMedia: {
			phonenumber: '',
			templateName: templateName,
			variables: {
				'1': 'account',
			},
			language: isRTL ? 'he' : 'en',
			types: {
				media: {
					body: templateData.templateText,
					media_type: 'image',
					media: ['http://clipart-library.com/data_images/320465.png'],
				},
			},
		},
		quickReply: {
			phonenumber: '',
			templateName: templateName,
			variables: {
				'1': 'Name',
			},
			language: isRTL ? 'he' : 'en',
			types: {
				text: {
					body: templateData.templateText,
				},
				'quick-reply': {
					body: templateData.templateText,
					actions: getQuickReplyActions(),
				},
			},
		},
		callToAction: {
			phonenumber: '',
			templateName: templateName,
			variables: {
				'1': 'flight_number',
				'2': 'arrival_city',
				'3': 'departure_time',
				'4': 'gate_number',
				'5': 'url_suffix',
			},
			language: isRTL ? 'he' : 'en',
			types: {
				'call-to-action': {
					body: templateData.templateText,
					actions: getCallTOActionActions(),
				},
			},
		},
		textMediaAndButton: {
			phonenumber: '',
			templateName: templateName,
			variables: {
				'1': 'coupon_code',
			},
			language: isRTL ? 'he' : 'en',
			types: {
				card: {
					title: templateData.templateText,
					subtitle: 'To unsubscribe, reply Stop',
					actions:
						buttonType === 'quickReply'
							? getQuickReplyActions()
							: getCallTOActionActions(),
				},
				text: {
					body: templateData.templateText,
				},
			},
		},
	};

	return (
		<form onSubmit={handleSubmit}>
			<DefaultScreen
				subPage={'create'}
				currentPage='whatsapp'
				classes={classes}
				customPadding={true}>
				<Title
					Text={translator('whatsapp.header')}
					Classes={classes.whatsappTemplateTitle}
					ContainerStyle={{}}
					Element={null}
				/>
				<br />
				<Grid container>
					<Grid item xs={12} md={5} sm={12}>
						<TemplateFields
							classes={classes}
							templateName={templateName}
							savedTemplate={savedTemplate}
							onTemplateNameChange={(e) => onTemplateNameChange(e)}
							onSavedTemplateChange={(e) => onSavedTemplateChange(e)}
						/>
						<ActionCallPopOver
							isCallToActionOpen={isCallToActionOpen}
							closeCallToAction={() => setIsCallToActionOpen(false)}
							classes={classes}
							callToActionFieldRows={callToActionFieldRows}
							setCallToActionFieldRows={(data) =>
								setCallToActionFieldRows(data)
							}
							phoneNumberField={phoneNumberField}
							websiteField={websiteField}
							addMore={() => addMore()}
							updateTemplateData={(data: callToActionProps) =>
								updateTemplateButton(data, 'callToAction')
							}
						/>
					</Grid>
					<Grid container>
						<Grid item xs={12} sm={12} md={12} lg={5}>
							<WhatsappTemplateEditor
								classes={classes}
								onButtonClick={(button: actionButtonProps) =>
									onButtonClick(button)
								}
								buttons={templateData.templateButtons}
								onButtonDelete={(button) => onActionButtonDelete(button)}
								buttonType={buttonType}
								setTemplateText={(text: string) => updateTemplateText(text)}
								templateText={templateData.templateText}
								templateTextRef={templateTextRef}
								OnEditorActionButtonClick={() => alert('s')}
							/>
						</Grid>

						<Grid item xs={12} sm={12} md={12} lg={7}>
							<Grid container>
								<Grid item xs={12} sm={12} md={12} lg={6}></Grid>
								<Grid item xs={12} sm={12} md={12} lg={6}>
									<Box style={{ maxWidth: 420, marginTop: 20 }}>
										<Phone classes={classes} />
									</Box>
								</Grid>
							</Grid>
							<Buttons classes={classes} />
						</Grid>
					</Grid>
				</Grid>
				<QuickReply
					classes={classes}
					isQuickReplyOpen={isQuickReplyOpen}
					closeQuickReply={() => setIsQuickReplyOpen(false)}
					quickReplyButtons={quickReplyButtons}
					setQuickReplyButtons={(data: quickReplyButtonProps[]) =>
						setQuickReplyButtons(data)
					}
					updateTemplateData={(data: quickReplyButtonProps[]) =>
						updateTemplateButton(data, 'quickReply')
					}
				/>
			</DefaultScreen>
		</form>
	);
};

export default WhatsappCreator;
