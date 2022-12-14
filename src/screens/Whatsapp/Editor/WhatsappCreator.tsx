import React, {
	BaseSyntheticEvent,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import DefaultScreen from '../../DefaultScreen';
import uniqid from 'uniqid';
import { Title } from '../../../components/managment/Title';
import TemplateFields from './TemplateFields';
import ActionCallPopOver from './ActionCallPopOver';
import Buttons from './Buttons';
import {
	callToActionFieldProps,
	callToActionProps,
	callToActionRowProps,
	coreProps,
	quickReplyButtonProps,
	savedTemplateListProps,
	templateDataProps,
	toastProps,
	WhatsappCreatorProps,
} from './WhatsappCreator.types';
import { ClassesType } from '../../Classes.types';
import { useTranslation } from 'react-i18next';
import { Box, Grid } from '@material-ui/core';
import WhatsappTemplateEditor from './WhatsappTemplateEditor';
import { actionButtonProps } from './WhatsappCreator.types';
import QuickReply from './QuickReply';
import { useDispatch, useSelector } from 'react-redux';
import WhatsappMobilePreview from './WhatsappMobilePreview';
import WhatsappTips from './whatsappTips';
import AlertModal from './AlertModal';
import { getValueByFieldName } from '../../../helpers/Utils/common';
import {
	getSavedTemplates,
	submitTemplates,
	uploadMedia,
} from '../../../redux/reducers/whatsappSlice';
import Toast from '../../../components/Toast/Toast.component';

const WhatsappCreator = ({ classes }: WhatsappCreatorProps & ClassesType) => {
	const dispatch = useDispatch();
	const { t: translator } = useTranslation();
	const { isRTL, windowSize } = useSelector(
		(state: { core: coreProps }) => state.core
	);
	const ToastMessages = useSelector(
		(state: { whatsapp: { ToastMessages: toastProps } }) =>
			state.whatsapp.ToastMessages
	);
	const [savedTemplateList, setSavedTemplateList] = useState<
		savedTemplateListProps[]
	>([]);
	const getSavedTemplateFields = async () => {
		let savedTemplate: any = await dispatch(
			getSavedTemplates({ templateStatus: 3 })
		);
		console.log('savedTemplate::', savedTemplate);
		setSavedTemplateList(savedTemplate.payload.Items);
	};
	useEffect(() => {
		getSavedTemplateFields();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	const templateTextRef = useRef<HTMLTextAreaElement>(null);
	//This regex will test dynamic field having two digits in side (i.e. {{10}});
	const dynamicFieldL6 = new RegExp('^({{)[0-9][0-9](}})$');
	//This regex will test dynamic field having one digits in side (i.e. {{1}});
	const dynamicFieldL5 = new RegExp('^({{)[0-9](}})$');
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
	const [toastMessage, setToastMessage] = useState<toastProps['SUCCESS']>({
		severity: '',
		color: '',
		message: '',
		showAnimtionCheck: false,
	});
	const [templateName, setTemplateName] = useState<string>('');
	const [savedTemplate, setSavedTemplate] = useState<string>('');
	const [buttonType, setButtonType] = useState<string>('');
	const [templateData, setTemplateData] = useState<templateDataProps>({
		templateText: '',
		templateButtons: [],
	});
	const [fileData, setFileData] = useState<string>('');
	const [isQuickReplyOpen, setIsQuickReplyOpen] = useState<boolean>(false);
	const [isCallToActionOpen, setIsCallToActionOpen] = useState<boolean>(false);
	const [quickReplyButtons, setQuickReplyButtons] = useState<
		quickReplyButtonProps[]
	>(initialQuickReplyButtons);
	const [isDeleteCampaignOpen, setIsDeleteCampaignOpen] = useState(false);
	const [isSubmitCampaignOpen, setIsSubmitCampaignOpen] = useState(false);

	enum ActionButtons {
		QuickReply = 'quickReply',
	}

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

	const resetFields = () => {
		setTemplateName('');
		setSavedTemplate('');
		setButtonType('');
		setTemplateData({
			templateText: '',
			templateButtons: [],
		});
		setFileData('');
		setQuickReplyButtons(initialQuickReplyButtons);
		setCallToActionFieldRows([initialFieldRow]);
	};

	const renderToast = () => {
		if (toastMessage.message?.length > 0) {
			setTimeout(() => {
				setToastMessage({
					severity: '',
					color: '',
					message: '',
					showAnimtionCheck: false,
				});
			}, 4000);
			return <Toast data={toastMessage} onClose={undefined} />;
		}
		return null;
	};

	const uploadFile = async (file: File | undefined) => {
		if (file) {
			setFileData(translator('whatsapp.alertModal.DeleteText'));
			const myFormData = new FormData();
			myFormData.append('file', file);
			const uploadedFile: any = await dispatch(uploadMedia(myFormData));
			console.log(uploadedFile);
			if (uploadedFile.payload?.Data?.length > 0) {
				// let urlSplit = uploadedFile.payload?.Data?.split('/');
				setFileData(uploadedFile.payload?.Data);
			} else {
				setFileData('');
			}
		} else {
			setFileData('');
		}
	};

	const setButtonsData = (buttonType: string, data: any) => {
		console.log(data);
		if (buttonType === 'quickReply') {
			const buttonData = data?.map((button: any) => {
				return {
					id: uniqid(),
					typeOfAction: '',
					fields: [
						{
							fieldName: translator('whatsapp.websiteButtonText'),
							type: 'text',
							placeholder: translator('whatsapp.websiteButtonTextPlaceholder'),
							value: button.title,
						},
					],
				};
			});
			console.log(buttonData);
			return buttonData;
		} else {
			const buttonData = data?.map((button: any) => {
				if (button?.type === 'PHONE') {
					return {
						id: uniqid(),
						typeOfAction: 'phonenumber',
						fields: [
							{
								fieldName: translator('whatsapp.phoneButtonText'),
								type: 'text',
								placeholder: translator('whatsapp.phoneButtonTextPlaceholder'),
								value: button.title,
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
								fieldName: translator('whatsapp.websiteButtonText'),
								type: 'text',
								placeholder: translator(
									'whatsapp.websiteButtonTextPlaceholder'
								),
								value: button.title,
							},
							{
								fieldName: translator('whatsapp.websiteURL'),
								type: 'text',
								placeholder: translator('whatsapp.websiteURLPlaceholder'),
								value: button.url,
							},
						],
					};
				}
			});
			console.log(buttonData);
			return buttonData;
		}
	};

	const onSavedTemplateChange = (TemplateId: string) => {
		setSavedTemplate(TemplateId);
		const savedTemplateData = savedTemplateList?.find(
			(template) => template.TemplateId === TemplateId
		);
		let updatedTemplateData = {
			templateText: '',
			templateButtons: [],
		};
		let updatedButtonType = '';
		let updatedFileData = '';
		if (savedTemplateData?.Data) {
			if ('quick-reply' in savedTemplateData?.Data?.types) {
				updatedButtonType = 'quickReply';
				const buttonData = setButtonsData(
					'quickReply',
					savedTemplateData?.Data?.types['quick-reply']?.actions
				);
				updatedTemplateData.templateText =
					savedTemplateData?.Data?.types['quick-reply']?.body;
				updatedTemplateData.templateButtons = buttonData;
			}
			if ('call-to-action' in savedTemplateData?.Data?.types) {
				updatedButtonType = 'callToAction';
				const buttonData = setButtonsData(
					'callToAction',
					savedTemplateData?.Data?.types['call-to-action']?.actions
				);
				updatedTemplateData.templateText =
					savedTemplateData?.Data?.types['call-to-action']?.body;
				updatedTemplateData.templateButtons = buttonData;
			} else if ('card' in savedTemplateData?.Data?.types) {
				updatedTemplateData.templateText =
					savedTemplateData?.Data?.types['card']?.title;
				if (savedTemplateData?.Data?.types['card']?.actions?.length > 0) {
					updatedButtonType = 'callToAction';
					const buttonData = setButtonsData(
						'callToAction',
						savedTemplateData?.Data?.types['card']?.actions
					);
					updatedTemplateData.templateButtons = buttonData;
				}
				if (savedTemplateData?.Data?.types['card']?.media?.length > 0) {
					updatedFileData = savedTemplateData?.Data?.types['card']?.media[0];
				}
			} else if ('media' in savedTemplateData?.Data?.types) {
				updatedTemplateData.templateText =
					savedTemplateData?.Data?.types['media']?.body;
				if (savedTemplateData?.Data?.types['media']?.media?.length > 0) {
					updatedFileData = savedTemplateData?.Data?.types['media']?.media[0];
				}
			} else if ('text' in savedTemplateData?.Data?.types) {
				updatedTemplateData.templateText =
					savedTemplateData?.Data?.types['text']?.body;
			}
		}
		setFileData(updatedFileData);
		// setTemplateName(savedTemplateData?.TemplateName || '');
		setButtonType(updatedButtonType);
		setTemplateData(updatedTemplateData);
		if (updatedButtonType === 'quickReply') {
			setQuickReplyButtons(updatedTemplateData.templateButtons);
		} else {
			setCallToActionFieldRows(updatedTemplateData.templateButtons);
		}
		console.log('templateData::', savedTemplateData);
	};

	const getQuickReplyActions = () => {
		return templateData.templateButtons.map((button: quickReplyButtonProps) => {
			return {
				id: button.id,
				title: getValueByFieldName(
					button,
					translator('whatsapp.websiteButtonText')
				),
			};
		});
	};

	const getActionPhoneNumber = (button: quickReplyButtonProps) => {
		const phoneNumber = getValueByFieldName(
			button,
			translator('whatsapp.phoneNumber')
		);
		const countryCode = getValueByFieldName(
			button,
			translator('whatsapp.country')
		);
		return countryCode && phoneNumber
			? '+' + countryCode?.replace(/\D/g, '') + phoneNumber
			: phoneNumber;
	};

	const getCallTOActionActions = () => {
		return templateData.templateButtons.map((button: quickReplyButtonProps) => {
			return {
				type: button.typeOfAction === 'phonenumber' ? 'PHONE_NUMBER' : 'URL',
				title: getValueByFieldName(
					button,
					translator('whatsapp.websiteButtonText')
				),
				[button.typeOfAction === 'phonenumber' ? 'phone' : 'url']:
					button.typeOfAction === 'phonenumber'
						? getActionPhoneNumber(button)
						: getValueByFieldName(button, translator('whatsapp.websiteURL')),
			};
		});
	};

	const getFriendlyTemplateName = () => {
		return templateName?.replace(/ /g, '_')?.replace(/[^a-z0-9_]/gi, '');
	};

	const getJSONVariables = () => {
		const dynamicFields = getDynamicFields(templateData.templateText);
		if (dynamicFields?.length > 0) {
			let variables: any = {};
			for (let i = 0; i < dynamicFields.length; i++) {
				variables[dynamicFields[i].replace(/[{}]/g, '')] = 'freetext';
			}
			return variables;
		}
		return {};
	};

	const getSubtitle = () => {
		if (templateData.templateText?.includes('Reply “remove” to unsubscribe')) {
			return 'Reply “remove” to unsubscribe';
		}
		if (templateData.templateText?.includes('להסרה השב “הסר')) {
			return 'להסרה השב “הסר';
		}
		return '';
	};

	const getRequestJSON = () => {
		const generatedTemplatename = getFriendlyTemplateName();
		const variables = getJSONVariables();
		const requestJSON = {
			text: {
				friendlyTemplateName: templateName,
				templateName: generatedTemplatename,
				variables: variables,
				language: isRTL ? 'he' : 'en',
				types: {
					text: {
						body: templateData.templateText,
					},
				},
			},
			textMedia: {
				friendlyTemplateName: templateName,
				templateName: generatedTemplatename,
				variables: variables,
				language: isRTL ? 'he' : 'en',
				types: {
					media: {
						body: templateData.templateText,
						media_type: 'image',
						media: [fileData],
					},
				},
			},
			quickReply: {
				friendlyTemplateName: templateName,
				templateName: generatedTemplatename,
				variables: variables,
				language: isRTL ? 'he' : 'en',
				types: {
					'quick-reply': {
						body: templateData.templateText,
						actions: getQuickReplyActions(),
					},
				},
			},
			callToAction: {
				friendlyTemplateName: templateName,
				templateName: generatedTemplatename,
				variables: variables,
				language: isRTL ? 'he' : 'en',
				types: {
					'call-to-action': {
						body: templateData.templateText,
						actions: getCallTOActionActions(),
					},
				},
			},
			textMediaAndButton: {
				friendlyTemplateName: templateName,
				templateName: generatedTemplatename,
				variables: variables,
				language: isRTL ? 'he' : 'en',
				types: {
					card: {
						title: templateData.templateText
							?.replace(/Reply “remove” to unsubscribe/g, '')
							.replace(/להסרה השב “הסר”/g, ''),
						subtitle: getSubtitle(),
						media: [fileData],
						actions:
							buttonType === 'quickReply'
								? getQuickReplyActions()
								: getCallTOActionActions(),
					},
				},
			},
		};
		const templateText = templateData.templateText;
		if (
			templateText?.length > 0 &&
			buttonType.length > 0 &&
			fileData?.length > 0
		) {
			return requestJSON.textMediaAndButton;
		} else if (templateText?.length > 0 && buttonType === 'quickReply') {
			return requestJSON.quickReply;
		} else if (templateText?.length > 0 && buttonType === 'callToAction') {
			return requestJSON.callToAction;
		} else if (templateText?.length > 0 && fileData?.length > 0) {
			return requestJSON.textMedia;
		} else if (templateText?.length > 0) {
			return templateText;
		}
	};

	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitCampaignOpen(true);
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

	const getDynamicFields = (text: string) => {
		let indices = [];
		for (let i = 0; i < text.length; i++) {
			if (dynamicFieldL5.test(text.slice(i, i + 5))) {
				indices.push(text.slice(i, i + 5));
			}
			if (dynamicFieldL6.test(text.slice(i, i + 6))) {
				indices.push(text.slice(i, i + 6));
			}
		}
		return indices;
	};

	const getLastDynamicFieldValue = (text: string) => {
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

	const getLastDynamicFieldByValue = (value: string) => {
		return `{{${(Number(value) + 1).toString()}}}`;
	};

	const reOrderDynamicFieldValue = (text: string) => {
		const d = getDynamicFieldIndex(text);
		let updatedText = '';
		let lastDynamicFieldLength = 0;
		if (d?.length <= 0) return text;
		for (let i = 0; i < d?.length; i++) {
			if (dynamicFieldL5.test(text.slice(d[i], d[i] + 5))) {
				lastDynamicFieldLength = 5;
				if (updatedText?.length <= 0) {
					updatedText = `${text.slice(0, d[i])}{{${Number(i + 1)}}}`;
				} else {
					updatedText = `${updatedText}${text.slice(
						d[i - 1] + 5,
						d[i]
					)}{{${Number(i + 1)}}}`;
				}
			} else if (dynamicFieldL6.test(text.slice(d[i], d[i] + 6))) {
				lastDynamicFieldLength = 6;
				if (updatedText?.length <= 0) {
					updatedText = `${text.slice(0, d[i])}{{${Number(i + 1)}}}`;
				} else {
					updatedText = `${updatedText}${text.slice(
						d[i - 1] + 6,
						d[i]
					)}{{${Number(i + 1)}}}`;
				}
			}
		}
		return updatedText + text.slice(d[d?.length - 1] + lastDynamicFieldLength);
	};

	const onButtonClick = (button: actionButtonProps) => {
		if (button.buttonTitle?.includes('callToAction')) {
			setIsCallToActionOpen(true);
		} else if (button.buttonTitle?.includes('quickReplay')) {
			setIsQuickReplyOpen(true);
		} else if (button.buttonTitle?.includes('dynamicField')) {
			const selectionEnd = templateTextRef.current?.selectionEnd;
			const textLength = templateTextRef.current?.textLength;
			setTemplateData({
				...templateData,
				templateText: reOrderDynamicFieldValue(
					addDynamicField(selectionEnd, textLength)
				),
			});
			templateTextRef.current?.focus();
		} else if (button.buttonTitle?.includes('removalText')) {
			setTemplateData({
				...templateData,
				templateText: `${templateData.templateText} ${
					isRTL ? '\nלהסרה השב “הסר”' : '\nReply “remove” to unsubscribe'
				}`,
			});
		}
	};

	const updateTemplateDataOnDeleteAction = (
		data: quickReplyButtonProps[] | callToActionProps,
		button: quickReplyButtonProps | callToActionRowProps
	) => {
		const updatedButtonsData = data?.filter(
			(d: quickReplyButtonProps | quickReplyButtonProps) => d.id !== button.id
		);
		setTemplateData({
			...templateData,
			templateButtons: updatedButtonsData,
		});
		if (updatedButtonsData?.length <= 0) {
			setButtonType('');
		}
		return updatedButtonsData;
	};

	const onActionButtonDelete = (
		button: quickReplyButtonProps | callToActionRowProps
	) => {
		console.log(templateData);
		console.log(button);
		if (buttonType === ActionButtons.QuickReply) {
			const updatedData = updateTemplateDataOnDeleteAction(
				quickReplyButtons,
				button
			);
			console.log(updatedData);
			setQuickReplyButtons([...updatedData]);
		} else {
			const updatedData = updateTemplateDataOnDeleteAction(
				callToActionFieldRows,
				button
			);
			console.log(updatedData);
			setCallToActionFieldRows([...updatedData]);
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

	const onFormButtonClick = (buttonName: string) => {
		if (buttonName === 'delete') {
			setIsDeleteCampaignOpen(true);
		}
	};

	const onDeleteCampaign = () => {
		resetFields();
		setIsDeleteCampaignOpen(false);
	};

	const onSubmitCampaign = async () => {
		let submitTemplate: any = await dispatch(submitTemplates(getRequestJSON()));
		console.log(submitTemplate);
		if (submitTemplate?.payload?.Status === 'Success') {
			setIsSubmitCampaignOpen(false);
			setToastMessage(ToastMessages.SUCCESS);
			resetFields();
		} else if (submitTemplate?.payload?.Status === 'Error') {
			if (submitTemplate?.payload?.Message?.length > 0) {
				setToastMessage({
					...ToastMessages.ERROR,
					message: submitTemplate?.payload?.Message,
				});
			} else {
				setToastMessage(ToastMessages.ERROR);
			}
			setIsSubmitCampaignOpen(false);
		}
	};

	return (
		<DefaultScreen
			subPage={'create'}
			currentPage='whatsapp'
			classes={classes}
			customPadding={true}>
			{renderToast()}
			<Title
				Text={translator('whatsapp.header')}
				Classes={classes.whatsappTemplateTitle}
				ContainerStyle={{}}
				Element={null}
			/>
			<br />
			<form onSubmit={onSubmit}>
				<Grid container>
					<TemplateFields
						classes={classes}
						templateName={templateName}
						savedTemplate={savedTemplate}
						fileData={fileData}
						onTemplateNameChange={(e) => onTemplateNameChange(e)}
						onSavedTemplateChange={(e) => onSavedTemplateChange(e.target.value)}
						setFileData={(fileData) => uploadFile(fileData)}
						savedTemplateList={savedTemplateList}
					/>
					<Grid
						container
						spacing={windowSize === 'xs' ? 0 : 2}
						style={{ paddingTop: '14px' }}>
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
								OnEditorActionButtonClick={() =>
									buttonType === 'quickReply'
										? setIsQuickReplyOpen(true)
										: setIsCallToActionOpen(true)
								}
							/>
						</Grid>

						<Grid item xs={12} sm={12} md={12} lg={7}>
							<Grid container spacing={windowSize === 'xs' ? 0 : 2}>
								<Grid item xs={12} sm={12} md={12} lg={6}>
									<WhatsappTips classes={classes} />
								</Grid>
								<Grid item xs={12} sm={12} md={12} lg={6}>
									<Box>
										<WhatsappMobilePreview
											classes={classes}
											campaignNumber='1'
											templateData={templateData}
											buttonType={buttonType}
											fileData={fileData}
										/>
									</Box>
								</Grid>
							</Grid>
						</Grid>
						<Buttons
							classes={classes}
							onFormButtonClick={(buttonName) => onFormButtonClick(buttonName)}
						/>
					</Grid>
				</Grid>
			</form>
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
				templateButtons={templateData.templateButtons}
			/>
			<ActionCallPopOver
				isCallToActionOpen={isCallToActionOpen}
				closeCallToAction={() => setIsCallToActionOpen(false)}
				classes={classes}
				callToActionFieldRows={callToActionFieldRows}
				setCallToActionFieldRows={(data) => setCallToActionFieldRows(data)}
				phoneNumberField={phoneNumberField}
				websiteField={websiteField}
				addMore={() => addMore()}
				updateTemplateData={(data: callToActionProps) =>
					updateTemplateButton(data, 'callToAction')
				}
			/>
			<AlertModal
				classes={classes}
				isOpen={isDeleteCampaignOpen}
				onClose={() => setIsDeleteCampaignOpen(false)}
				title={translator('whatsapp.alertModal.DeleteText')}
				subtitle={translator('whatsapp.alertModal.DeleteTitle')}
				type='delete'
				onConfirmOrYes={() => onDeleteCampaign()}
			/>
			<AlertModal
				classes={classes}
				isOpen={isSubmitCampaignOpen}
				onClose={() => setIsSubmitCampaignOpen(false)}
				title={translator('whatsapp.alertModal.ConfirmText')}
				subtitle={translator('whatsapp.alertModal.ConfirmTitle')}
				onConfirmOrYes={() => onSubmitCampaign()}
				type='submit'>
				<Box className={classes.alertModalContentMobile}>
					<WhatsappMobilePreview
						classes={classes}
						campaignNumber='1'
						templateData={templateData}
						buttonType={buttonType}
						fileData={fileData}
					/>
				</Box>
			</AlertModal>
		</DefaultScreen>
	);
};

export default WhatsappCreator;
