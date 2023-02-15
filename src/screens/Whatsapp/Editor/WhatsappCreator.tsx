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
import TemplateFields from './Components/TemplateFields';
import ActionCallPopOver from './Popups/ActionCallPopOver';
import Buttons from './Components/Buttons';
import {
	buttonsDataProps,
	callToActionFieldProps,
	callToActionProps,
	callToActionRowProps,
	coreProps,
	deleteTemplateAPIProps,
	fileUploadAPIProps,
	getTemplateByIdAPIProps,
	JSONFreetextVariableProps,
	quickReplyButtonProps,
	savedTemplateAPIProps,
	savedTemplateCallToActionProps,
	savedTemplateCardProps,
	savedTemplateDataProps,
	savedTemplateListProps,
	savedTemplateMediaProps,
	savedTemplateQuickReplyProps,
	savedTemplateTextProps,
	submitTemplateAPIProps,
	templateDataProps,
	toastProps,
	WhatsappCreatorProps,
} from './Types/WhatsappCreator.types';
import { ClassesType } from '../../Classes.types';
import { useTranslation } from 'react-i18next';
import { Box, Grid } from '@material-ui/core';
import WhatsappTemplateEditor from './Components/WhatsappTemplateEditor';
import { actionButtonProps } from './Types/WhatsappCreator.types';
import QuickReply from './Popups/QuickReply';
import { useDispatch, useSelector } from 'react-redux';
import WhatsappMobilePreview from './Components/WhatsappMobilePreview';
import WhatsappTips from './Components/whatsappTips';
import AlertModal from './Popups/AlertModal';
import { getValueByFieldName } from '../../../helpers/Utils/common';
import {
	deleteTemplate,
	getSavedTemplates,
	getSavedTemplatesById,
	submitTemplates,
	uploadMedia,
} from '../../../redux/reducers/whatsappSlice';
import Toast from '../../../components/Toast/Toast.component';
import { JSONProps } from './Types/JSON.types';
import {
	getDynamicFieldIndex,
	getDynamicFields,
	getLastDynamicFieldByValue,
	getLastDynamicFieldValue,
} from '../Common';
import { apiStatus, resetToastData } from '../Constant';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader } from '../../../components/Loader/Loader';

const WhatsappCreator = ({ classes }: WhatsappCreatorProps & ClassesType) => {
	const { templateID } = useParams();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { t: translator } = useTranslation();
	const { isRTL, windowSize } = useSelector(
		(state: { core: coreProps }) => state.core
	);
	const ToastMessages = useSelector(
		(state: { whatsapp: { ToastMessages: toastProps } }) =>
			state.whatsapp.ToastMessages
	);
	const [isLoader, setIsLoader] = useState<boolean>(false);
	const [savedTemplateList, setSavedTemplateList] = useState<
		savedTemplateListProps[]
	>([]);
	const getSavedTemplateFields = async () => {
		let savedTemplate: savedTemplateAPIProps = await dispatch<any>(
			getSavedTemplates({ templateStatus: 3 })
		);
		setSavedTemplateList(savedTemplate.payload.Data.Items);
	};
	useEffect(() => {
		setIsLoader(true);
		getSavedTemplateFields().then(() => {
			if (templateID) {
				setTemplateById(templateID);
			} else {
				setIsLoader(false);
			}
		});

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
					fieldName: 'whatsapp.websiteButtonText',
					type: 'text',
					placeholder: 'whatsapp.websiteButtonTextPlaceholder',
					value: '',
				},
			],
		},
	];
	const [toastMessage, setToastMessage] =
		useState<toastProps['SUCCESS']>(resetToastData);
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
	const [isDeleteTemplateOpen, setIsDeleteTemplateOpen] =
		useState<boolean>(false);
	const [isSubmitCampaignOpen, setIsSubmitCampaignOpen] =
		useState<boolean>(false);
	const [linkCount, setlinkCount] = useState<number>(0);
	const [dynamicFieldCount, setDynamicFieldCount] = useState<number>(0);

	let updatedTemplateData: templateDataProps = {
		templateText: '',
		templateButtons: [],
	};
	let updatedButtonType: string = '';
	let updatedFileData: string = '';

	enum ActionButtons {
		QuickReply = 'quickReply',
	}

	const websiteField = [
		{
			fieldName: 'whatsapp.websiteButtonText',
			type: 'text',
			placeholder: 'whatsapp.websiteButtonTextPlaceholder',
			value: '',
		},
		{
			fieldName: 'whatsapp.websiteURL',
			type: 'text',
			placeholder: 'whatsapp.websiteURLPlaceholder',
			value: '',
		},
	];
	const phoneNumberField = [
		{
			fieldName: 'whatsapp.phoneButtonText',
			type: 'text',
			placeholder: 'whatsapp.phoneButtonTextPlaceholder',
			value: '',
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
			value: '',
		},
	];

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

	const resetToast = () => {
		setToastMessage(resetToastData);
	};

	const renderToast = () => {
		if (toastMessage.message?.length > 0) {
			setTimeout(() => {
				resetToast();
			}, 4000);
			return <Toast data={toastMessage} />;
		}
		return null;
	};

	const uploadFile = async (file: File | undefined) => {
		if (file) {
			setFileData(translator('whatsapp.uploading'));
			const myFormData: FormData = new FormData();
			myFormData.append('file', file);
			const uploadedFile: fileUploadAPIProps = await dispatch<any>(
				uploadMedia(myFormData)
			);
			if (uploadedFile.payload?.Data?.length > 0) {
				setFileData(uploadedFile.payload?.Data);
			} else {
				setFileData('');
			}
		} else {
			setFileData('');
		}
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

	const saveQuickreplyTemplate = (templateData: savedTemplateDataProps) => {
		const quickReplyData: savedTemplateQuickReplyProps =
			templateData?.types['quick-reply'];
		updatedButtonType = 'quickReply';
		const buttonData = setButtonsData('quickReply', quickReplyData?.actions);
		updatedTemplateData.templateText = quickReplyData?.body;
		updatedTemplateData.templateButtons = buttonData ? buttonData : [];
	};

	const saveCallToActionTemplate = (templateData: savedTemplateDataProps) => {
		const callToActionData: savedTemplateCallToActionProps =
			templateData?.types['call-to-action'];
		updatedButtonType = 'callToAction';
		const buttonData = setButtonsData(
			'callToAction',
			callToActionData?.actions
		);
		updatedTemplateData.templateText = callToActionData?.body;
		updatedTemplateData.templateButtons = buttonData ? buttonData : [];
	};

	const saveCardTemplate = (templateData: savedTemplateDataProps) => {
		const cardData: savedTemplateCardProps = templateData?.types['card'];
		updatedTemplateData.templateText = cardData?.title;
		if (cardData?.actions?.length > 0) {
			if (cardData?.actions[0]?.type !== 'QUICK_REPLY') {
				updatedButtonType = 'callToAction';
				const buttonData = setButtonsData('callToAction', cardData?.actions);
				updatedTemplateData.templateButtons = buttonData ? buttonData : [];
			} else {
				updatedButtonType = 'quickReply';
				const buttonData = setButtonsData('quickReply', cardData?.actions);
				updatedTemplateData.templateButtons = buttonData ? buttonData : [];
			}
		}
		if (cardData?.media?.length > 0) {
			updatedFileData = cardData?.media[0];
		}
	};

	const saveMediaTemplate = (templateData: savedTemplateDataProps) => {
		const mediaData: savedTemplateMediaProps = templateData?.types['media'];
		updatedTemplateData.templateText = mediaData?.body;
		if (mediaData?.media?.length > 0) {
			updatedFileData = mediaData?.media[0];
		}
	};

	const saveTextTemplate = (templateData: savedTemplateDataProps) => {
		const textData: savedTemplateTextProps = templateData?.types['text'];
		updatedTemplateData.templateText = textData?.body;
	};

	const setUpdatedTemplateData = (templateData: savedTemplateDataProps) => {
		if ('quick-reply' in templateData?.types) {
			saveQuickreplyTemplate(templateData);
		}
		if ('call-to-action' in templateData?.types) {
			saveCallToActionTemplate(templateData);
		} else if ('card' in templateData?.types) {
			saveCardTemplate(templateData);
		} else if ('media' in templateData?.types) {
			saveMediaTemplate(templateData);
		} else if ('text' in templateData?.types) {
			saveTextTemplate(templateData);
		}
	};

	const onSavedTemplateChange = (TemplateId: string) => {
		setSavedTemplate(TemplateId);
		const savedTemplateData: savedTemplateListProps | undefined =
			savedTemplateList?.find((template) => template.TemplateId === TemplateId);
		const templateData: savedTemplateDataProps | undefined =
			savedTemplateData?.Data;
		if (templateData) {
			setUpdatedTemplateData(templateData);
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
		if (templateData?.variables) {
			setDynamicFieldCount(Object.keys(templateData?.variables)?.length);
		}
	};

	const setTemplateById = async (templateId: string) => {
		const templateData: getTemplateByIdAPIProps = await dispatch<any>(
			getSavedTemplatesById(templateId)
		);
		setIsLoader(false);
		const templates = templateData.payload?.Data;
		if (templateData.payload.Status === apiStatus.SUCCESS) {
			if (templateData?.payload?.Data?.Data && templates) {
				const templateData = templates?.Data;
				const templateName = templates?.TemplateName;
				if (templateData) {
					setUpdatedTemplateData(templateData);
				}
				setSavedTemplate(templateId);
				setTemplateName(templateName || '');
				setFileData(updatedFileData);
				setButtonType(updatedButtonType);
				setTemplateData(updatedTemplateData);
				if (updatedButtonType === 'quickReply') {
					setQuickReplyButtons(updatedTemplateData.templateButtons);
				} else {
					setCallToActionFieldRows(updatedTemplateData.templateButtons);
				}
				if (templateData?.variables) {
					setDynamicFieldCount(Object.keys(templateData?.variables)?.length);
				}
			}
		}
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
			let variables: JSONFreetextVariableProps = {};
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

	const getRequestJSON = (isSave: boolean) => {
		const generatedTemplatename = getFriendlyTemplateName();
		const variables = getJSONVariables();
		const requestJSON: JSONProps = {
			text: {
				friendlyTemplateName: templateName,
				templateName: generatedTemplatename,
				variables: variables,
				language: isRTL ? 'he' : 'en',
				isSaveOnly: isSave ? true : false,
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
				isSaveOnly: isSave ? true : false,
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
				isSaveOnly: isSave ? true : false,
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
				isSaveOnly: isSave ? true : false,
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
				isSaveOnly: isSave ? true : false,
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
			return requestJSON.text;
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
		if (buttonType === ActionButtons.QuickReply) {
			const updatedData = updateTemplateDataOnDeleteAction(
				quickReplyButtons,
				button
			);
			setQuickReplyButtons([...updatedData]);
		} else {
			const updatedData = updateTemplateDataOnDeleteAction(
				callToActionFieldRows,
				button
			);
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

	const saveTemplate = async () => {
		let requestJSON = getRequestJSON(true);
		if (requestJSON) {
			if (templateID) {
				requestJSON.id = Number(templateID);
			}
			let submitTemplate: submitTemplateAPIProps = await dispatch<any>(
				submitTemplates(requestJSON)
			);
			if (submitTemplate?.payload?.Status === apiStatus.SUCCESS) {
				setIsSubmitCampaignOpen(false);
				setToastMessage(ToastMessages.SAVE_SUCCESS);
				resetFields();
				navigate('/react/whatsapp/template/create');
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
		}
	};

	const onFormButtonClick = (buttonName: string) => {
		switch (buttonName) {
			case 'delete':
				setIsDeleteTemplateOpen(true);
				break;
			case 'save':
				saveTemplate();
				break;
			default:
				break;
		}
	};

	const onDeleteTemplate = async () => {
		if (templateID) {
			const deleteData: deleteTemplateAPIProps = await dispatch<any>(
				deleteTemplate(templateID)
			);
			if (deleteData?.payload?.Status === apiStatus.SUCCESS) {
				setIsDeleteTemplateOpen(false);
				setToastMessage(ToastMessages.DELETE_CAMPAIGN_SUCCESS);
				resetFields();
				navigate('/react/whatsapp/template/create');
			} else {
				deleteData?.payload?.Error
					? setToastMessage({
							...ToastMessages.ERROR,
							message: deleteData?.payload?.Error,
					  })
					: setToastMessage(ToastMessages.ERROR);
			}
		} else {
			resetFields();
			setIsDeleteTemplateOpen(false);
		}
	};

	const onSubmitCampaign = async () => {
		let requestJSON = getRequestJSON(false);
		if (requestJSON) {
			if (templateID) {
				requestJSON.id = Number(templateID);
			}
			let submitTemplate: submitTemplateAPIProps = await dispatch<any>(
				submitTemplates(requestJSON)
			);
			if (submitTemplate?.payload?.Status === apiStatus.SUCCESS) {
				setIsSubmitCampaignOpen(false);
				setToastMessage(ToastMessages.SUCCESS);
				resetFields();
				navigate('/react/whatsapp/template/create');
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
		}
	};

	const closeCallToAction = (isReset: Boolean) => {
		setIsCallToActionOpen(false);
		if (isReset && buttonType === 'callToAction') {
			setCallToActionFieldRows([...templateData.templateButtons]);
		}
	};

	return (
		<DefaultScreen
			subPage={'create'}
			currentPage='whatsapp'
			classes={classes}
			containerClass={null}
			customPadding={true}>
			{renderToast()}
			<Title
				Text={translator('whatsapp.header')}
				classes={classes}
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
						onSavedTemplateChange={(templateId) => onSavedTemplateChange(templateId)}
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
								dynamicFieldCount={dynamicFieldCount}
								linkCount={linkCount}
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
							displayBackButton={false}
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
				isEditable={true}
			/>
			<ActionCallPopOver
				isCallToActionOpen={isCallToActionOpen}
				closeCallToAction={(isReset) => closeCallToAction(isReset)}
				classes={classes}
				callToActionFieldRows={callToActionFieldRows}
				setCallToActionFieldRows={(data) => setCallToActionFieldRows(data)}
				phoneNumberField={phoneNumberField}
				websiteField={websiteField}
				addMore={() => addMore()}
				updateTemplateData={(data: callToActionProps) =>
					updateTemplateButton(data, 'callToAction')
				}
				isEditable={true}
			/>
			<AlertModal
				classes={classes}
				isOpen={isDeleteTemplateOpen}
				onClose={() => setIsDeleteTemplateOpen(false)}
				title={translator('whatsapp.alertModal.DeleteText')}
				subtitle={translator('whatsapp.alertModal.DeleteTitle')}
				type='delete'
				onConfirmOrYes={() => onDeleteTemplate()}
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
						templateData={templateData}
						buttonType={buttonType}
						fileData={fileData}
					/>
				</Box>
			</AlertModal>

			<Loader isOpen={isLoader} showBackdrop={true} />
		</DefaultScreen>
	);
};

export default WhatsappCreator;
