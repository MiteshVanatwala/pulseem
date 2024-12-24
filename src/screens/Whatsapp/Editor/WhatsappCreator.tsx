import React, { BaseSyntheticEvent, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import DefaultScreen from '../../DefaultScreen';
import uniqid from 'uniqid';
import { Title } from '../../../components/managment/Title';
import TemplateFields from './Components/TemplateFields';
import ActionCallPopOver from './Popups/ActionCallPopOver';
import Buttons from './Components/Buttons';
import {
	ApiButtonData,
	buttonsDataProps,
	callToActionProps,
	callToActionRowProps,
	coreProps,
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
import { Box, Button, Grid, TextField, Typography } from '@material-ui/core';
import WhatsappTemplateEditor from './Components/WhatsappTemplateEditor';
import { actionButtonProps } from './Types/WhatsappCreator.types';
import QuickReply from './Popups/QuickReply';
import { useDispatch, useSelector } from 'react-redux';
import WhatsappMobilePreview from './Components/WhatsappMobilePreview';
import { getValueByFieldName } from '../../../helpers/Utils/common';
import {
	deleteTemplate,
	getSavedTemplates,
	getSavedTemplatesById,
	submitTemplates,
	uploadMedia,
	userPhoneNumbers,
} from '../../../redux/reducers/whatsappSlice';
import Toast from '../../../components/Toast/Toast.component';
import { JSONProps } from './Types/JSON.types';
import {
	checkLanguage,
	getDynamicFieldIndex,
	getDynamicFields,
	getLastDynamicFieldByValue,
	getLastDynamicFieldValue,
} from '../Common';
import {
	APIStatuses,
	apiStatus,
	authenticationMockTemplate,
	authenticationTypes,
	buttonTextLimits,
	buttonTypes,
	categoryName,
	resetToastData,
	whatsappRoutes,
} from '../Constant';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader } from '../../../components/Loader/Loader';
import NoSetup from '../NoSetup/NoSetup';
import { phoneNumberAPIProps } from '../Campaign/Types/WhatsappCampaign.types';
import moment from 'moment';
import FileUpload from './Components/FileUpload';
import Gallery from '../../../components/Gallery/Gallery.component';
import { PulseemFolderType } from '../../../model/PulseemFields/Fields';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import { Switch } from '../../../components/managment';
import ConfirmationButtons from '../../../components/ConfirmationButtons/ConfirmationButtons';

const WhatsappCreator = ({ classes }: WhatsappCreatorProps & ClassesType) => {
	const { templateID } = useParams();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { t: translator } = useTranslation();
	const { isRTL, windowSize } = useSelector(
		(state: { core: coreProps }) => state.core
	);
	const { gallery } = useSelector(
		(state: { gallery: any }) => state.gallery
	);

	const ToastMessages = useSelector(
		(state: { whatsapp: { ToastMessages: toastProps } }) =>
			state.whatsapp.ToastMessages
	);
	const [isAccountSetup, setIsAccountSetup] = useState<boolean | null>(null);
	const [codeExpirationTime, setCodeExpirationTime] = useState<number | undefined>(0);
	const [isLoader, setIsLoader] = useState<boolean>(true);
	const [templateTextLimit, setTemplateTextLimit] = useState<number>(1024);
	const [savedTemplateList, setSavedTemplateList] = useState<
		savedTemplateListProps[]
	>([]);
	const [groupSendValidationErrors, setGroupSendValidationErrors] = useState<
		string[]
	>([]);
	const [showValidation, setShowValidation] = useState<boolean>(false);
	const [isValidationAlert, setIsValidationAlert] = useState<boolean>(false);
	const [dialogType, setDialogType] = useState<{
		type: string;
	} | null>(null);
	const [isGalleryConfirmed, setIsFileSelected] = useState(false);

	const getSavedTemplateFields = async () => {
		let savedTemplate: savedTemplateAPIProps = await dispatch<any>(
			getSavedTemplates({ templateStatus: 3 })
		);
		setSavedTemplateList(savedTemplate.payload?.Data?.Items || []);
	};
	useEffect(() => {
		(async () => {
			setIsLoader(true);
			const { payload: phoneNumberData }: phoneNumberAPIProps =
				await dispatch<any>(userPhoneNumbers());
			if (
				phoneNumberData?.Status === apiStatus.SUCCESS &&
				phoneNumberData?.Data &&
				phoneNumberData?.Data?.length > 0
			) {
				getSavedTemplateFields().then(() => {
					if (templateID) {
						setTemplateById(templateID);
					} else {
						setIsLoader(false);
					}
				});
				setIsAccountSetup(true);
			} else {
				setIsLoader(false);
				setIsAccountSetup(false);
			}
		})();
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
	const [category, setCategory] = useState<string>('marketing');
	const [savedTemplate, setSavedTemplate] = useState<string>('');
	const [buttonType, setButtonType] = useState<string>('');
	const [templateData, setTemplateData] = useState<templateDataProps>({
		templateText: '',
		templateButtons: [],
	});
	const [fileData, setFileData] = useState<{
		fileLink: string;
		fileType: string;
		properties?: any;
	}>({
		fileLink: '',
		fileType: ''
	});
	const [quickReplyButtons, setQuickReplyButtons] = useState<quickReplyButtonProps[]>(initialQuickReplyButtons);
	const [isDeleteTemplateOpen, setIsDeleteTemplateOpen] = useState<boolean>(false);
	const [linkCount, setlinkCount] = useState<number>(0);
	const [dynamicFieldCount, setDynamicFieldCount] = useState<number>(0);
	const [authenticationButtonText, setAuthenticationButtonText] = useState<string>('');

	let updatedTemplateData: templateDataProps = {
		templateText: '',
		templateButtons: [],
	};
	let updatedButtonType: string = '';
	let updatedFileData: {
		fileLink: string;
		fileType: string;
	} = {
		fileLink: '',
		fileType: '',
	};

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
		{
			fieldName: 'mainReport.keepTrack',
			type: '',
			placeholder: '',
			value: 'true',
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
			value: '+972',
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

	useEffect(() => {
		if (buttonType === buttonTypes.CALL_TO_ACTION) {
			setTemplateTextLimit(buttonTextLimits.callToAction);
			// setTemplateData({
			// 	...templateData,
			// 	// templateText: templateData.templateText?.substring(
			// 	// 	0,
			// 	// 	buttonTextLimits.callToAction
			// 	// ),
			// });
		} else {
			setTemplateTextLimit(buttonTextLimits.quickReply);
		}
		// eslint-disable-next-line @typescript-eslint/no-use-before-define, react-hooks/exhaustive-deps
	}, [buttonType]);

	// useEffect(() => {
	// if (isCallToActionOpen && callToActionFieldRows?.length === 0) {
	// setCallToActionFieldRows([initialFieldRow]);
	// }
	// eslint-disable-next-line @typescript-eslint/no-use-before-define, react-hooks/exhaustive-deps
	// }, [isCallToActionOpen]);

	useEffect(() => {
		if (category === authenticationTypes.AUTHENTICATIONEN || category === authenticationTypes.AUTHENTICATIONHEBREW) {
			updateTemplateForAuthentication();
			setButtonType(ActionButtons.QuickReply);
		} else {
			setTemplateData({
				...templateData,
				templateText: '',
				templateButtons: []
			})
			setButtonType('');
		}
	}, [ category ])

	useEffect(() => {
		if (category === authenticationTypes.AUTHENTICATIONEN || category === authenticationTypes.AUTHENTICATIONHEBREW) {
			updateTemplateForAuthentication();
			setButtonType(ActionButtons.QuickReply);
		} else {
			setTemplateData({
				...templateData,
				templateText: '',
				templateButtons: []
			})
			setButtonType('');
		}
	}, [ category ])

	const onTemplateNameChange = (e: BaseSyntheticEvent) => {
		setTemplateName(e.target.value);
	};

	const resetFields = () => {
		setTemplateName('');
		setSavedTemplate('');
		setButtonType('');
		setTemplateData({
			templateText: '',
			templateButtons: [],
		});
		setFileData({
			fileLink: '',
			fileType: '',
		});
		setShowValidation(false);
		setCategory('marketing');
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
			setFileData({
				fileLink: translator('whatsapp.uploading'),
				fileType: '',
			});
			const myFormData: FormData = new FormData();
			myFormData.append('file', file);
			const uploadedFile: fileUploadAPIProps = await dispatch<any>(
				uploadMedia(myFormData)
			);
			if (uploadedFile.payload?.Data?.length > 0) {
				setFileData({
					fileLink: uploadedFile.payload?.Data,
					fileType: '',
				});
			} else {
				setFileData({
					fileLink: '',
					fileType: '',
				});
			}
		} else {
			setFileData({
				fileLink: '',
				fileType: '',
			});
		}
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
									value: button?.phoneCode || '',
								},
								{
									fieldName: 'whatsapp.phoneNumber',
									type: 'tel',
									placeholder: 'whatsapp.phoneNumberPlaceholder',
									value: button?.phoneCode
										? button.phone?.replace(button?.phoneCode, '')
										: button.phone,
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
								{
									fieldName: 'mainReport.keepTrack',
									type: '',
									placeholder: '',
									value: `${button.keeptrackoflinks}`,
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
		updatedButtonType = buttonTypes.QUICK_REPLY;
		const buttonData = setButtonsData(
			buttonTypes.QUICK_REPLY,
			quickReplyData?.actions
		);
		updatedTemplateData.templateText = quickReplyData?.body;
		updatedTemplateData.templateButtons = buttonData ? buttonData : [];
	};

	const saveCallToActionTemplate = (templateData: savedTemplateDataProps) => {
		const callToActionData: savedTemplateCallToActionProps =
			templateData?.types['call-to-action'];
		updatedButtonType = buttonTypes.CALL_TO_ACTION;
		const buttonData = setButtonsData(
			buttonTypes.CALL_TO_ACTION,
			callToActionData?.actions
		);
		updatedTemplateData.templateText = callToActionData?.body;
		updatedTemplateData.templateButtons = buttonData ? buttonData : [];
	};

	const saveCardTemplate = (templateData: savedTemplateDataProps) => {
		const cardData: savedTemplateCardProps = templateData?.types['card'];
		updatedTemplateData.templateText = cardData?.title;
		if (cardData?.subtitle) updatedTemplateData.templateText += '\n' + cardData?.subtitle;
		if (cardData?.actions?.length > 0) {
			if (cardData?.actions[0]?.type !== 'QUICK_REPLY') {
				updatedButtonType = buttonTypes.CALL_TO_ACTION;
				const buttonData = setButtonsData(
					buttonTypes.CALL_TO_ACTION,
					cardData?.actions
				);
				updatedTemplateData.templateButtons = buttonData ? buttonData : [];
			} else {
				updatedButtonType = buttonTypes.QUICK_REPLY;
				const buttonData = setButtonsData(
					buttonTypes.QUICK_REPLY,
					cardData?.actions
				);
				updatedTemplateData.templateButtons = buttonData ? buttonData : [];
			}
		}
		if (cardData?.media?.length > 0) {
			updatedFileData.fileLink = cardData?.media[0];
		}
	};

	const saveMediaTemplate = (templateData: savedTemplateDataProps) => {
		const mediaData: savedTemplateMediaProps = templateData?.types['media'];
		updatedTemplateData.templateText = mediaData?.body;
		if (mediaData?.media?.length > 0) {
			updatedFileData.fileLink = mediaData?.media[0];
			updatedFileData.fileType = mediaData?.media_type;
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
		if (updatedTemplateData?.templateButtons?.length > 0) {
			if (updatedButtonType === buttonTypes.QUICK_REPLY) {
				setQuickReplyButtons(updatedTemplateData.templateButtons);
			} else {
				setCallToActionFieldRows(updatedTemplateData.templateButtons);
			}
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
				const templateName = templates?.FriendlyTemplateName || '';
				setCategory(templates?.CategoryId === 3 ? (templates?.Language === 'en' ? authenticationTypes.AUTHENTICATIONEN : authenticationTypes.AUTHENTICATIONHEBREW) : categoryName[templates?.CategoryId || 1]);
				if (templateData) {
					setUpdatedTemplateData(templateData);
				}
				setSavedTemplate(templateId);
				setTemplateName(templateName);
				setFileData(updatedFileData);
				
				if (templates?.CategoryId === 3) {
					setCodeExpirationTime(templates?.Data?.types?.authentication?.code_expiration_minutes)
					setAuthenticationButtonText(templates?.Data?.types?.authentication?.actions[0].copy_code_text)
					setButtonType(buttonTypes.QUICK_REPLY);
				} else {
					setTemplateData(updatedTemplateData);
					setButtonType(updatedButtonType);
				}
				if (updatedTemplateData?.templateButtons?.length > 0) {
					if (updatedButtonType === buttonTypes.QUICK_REPLY) {
						setQuickReplyButtons(updatedTemplateData.templateButtons);
					} else {
						setCallToActionFieldRows(updatedTemplateData.templateButtons);
					}
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
				title: getValueByFieldName(button, 'whatsapp.websiteButtonText'),
			};
		});
	};

	const getActionPhoneNumber = (button: quickReplyButtonProps) => {
		const phoneNumber = getValueByFieldName(button, 'whatsapp.phoneNumber');
		const countryCode = getValueByFieldName(
			button,
			'whatsapp.country'
		)?.replace(/\D/g, '');
		return countryCode ? '+' + countryCode + phoneNumber : phoneNumber;
	};

	const getCallTOActionActions = () => {
		return templateData.templateButtons.map((button: quickReplyButtonProps) => {
			let apiButtonData: ApiButtonData = {
				type: button.typeOfAction === 'phonenumber' ? 'PHONE_NUMBER' : 'URL',
				title: getValueByFieldName(
					button,
					button.typeOfAction === 'phonenumber'
						? 'whatsapp.phoneButtonText'
						: 'whatsapp.websiteButtonText'
				),
				[button.typeOfAction === 'phonenumber' ? 'phone' : 'url']:
					button.typeOfAction === 'phonenumber'
						? getActionPhoneNumber(button)
						: getValueByFieldName(button, 'whatsapp.websiteURL'),
			};
			if (button.typeOfAction === 'phonenumber') {
				const countryCode = getValueByFieldName(button, 'whatsapp.country');
				apiButtonData.phoneCode = '+' + countryCode?.replace(/\D/g, '');
			} else if (button.typeOfAction === 'website') {
				apiButtonData.keepTrackOfLinks = getValueByFieldName(button, 'mainReport.keepTrack') === 'true'
			}
			return apiButtonData;
		});
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
		if (templateData.templateText?.toLowerCase().indexOf(translator('whatsapp.replyRemoveToUnsubscribe', { lng: 'en' }).toLowerCase()) > -1) {
			return translator('whatsapp.replyRemoveToUnsubscribe', { lng: 'en' });
		}
		if (templateData.templateText?.toLowerCase().indexOf(translator('whatsapp.replyRemoveToUnsubscribe', { lng: 'he' }).toLowerCase()) > -1) {
			return translator('whatsapp.replyRemoveToUnsubscribe', { lng: 'he' });
		}
		return '';
	};

	const getRequestJSON = async (isSave: boolean) => {
		let generatedTemplatename = `whatsapp_template_${moment().format(
			'DD_MM_YYYY'
		)}_${moment().valueOf()}`;
		const templateLanguage =
			checkLanguage(templateData.templateText, isRTL) === 'English'
				? 'en'
				: 'he';
		if (templateID) {
			const { payload: templateDataById }: getTemplateByIdAPIProps =
				await dispatch<any>(getSavedTemplatesById(templateID));
			if (templateDataById?.Status === APIStatuses.SUCCESS) {
				generatedTemplatename = templateDataById?.Data?.TemplateName;
			} else {
				setToastMessage(ToastMessages.ERROR);
				return;
			}
		}
		var regexRemoveTextEn = new RegExp(translator('whatsapp.replyRemoveToUnsubscribe', { lng: 'en' }), "g");
		var regexRemoveTextHe = new RegExp(translator('whatsapp.replyRemoveToUnsubscribe', { lng: 'he' }), "g");
		const variables = getJSONVariables();
		const requestJSON: JSONProps = {
			text: {
				friendlyTemplateName: templateName,
				templateName: generatedTemplatename,
				variables: variables,
				language: templateLanguage,
				TemplateCategory: category?.toUpperCase(),
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
				language: templateLanguage,
				TemplateCategory: category?.toUpperCase(),
				isSaveOnly: isSave ? true : false,
				types: {
					media: {
						body: templateData.templateText,
						media_type: 'image',
						media: [fileData?.fileLink],
					},
				},
			},
			quickReply: {
				friendlyTemplateName: templateName,
				templateName: generatedTemplatename,
				variables: variables,
				language: templateLanguage,
				TemplateCategory: category?.toUpperCase(),
				codeExpirationTime: codeExpirationTime,
				isSaveOnly: isSave ? true : false,
				types: (category === authenticationTypes.AUTHENTICATIONEN || category === authenticationTypes.AUTHENTICATIONHEBREW)
				? {
					authentication: {
						add_security_recommendation: true,
            code_expiration_minutes: Number(codeExpirationTime),
            actions: [{
							type: 'COPY_CODE',
							copy_code_text: getValueByFieldName(templateData.templateButtons[0], 'whatsapp.websiteButtonText')
						}]
					},
				} : {
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
				language: templateLanguage,
				TemplateCategory: category?.toUpperCase(),
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
				language: templateLanguage,
				TemplateCategory: category?.toUpperCase(),
				isSaveOnly: isSave ? true : false,
				types: {
					card: {
						title: templateData.templateText
							?.replace(regexRemoveTextEn, '')
							.replace(regexRemoveTextHe, '')
							?.replace(/\n+$/, ''),
						subtitle: getSubtitle()?.length > 0 ? getSubtitle() : null,
						media: [fileData?.fileLink],
						actions:
							buttonType === buttonTypes.QUICK_REPLY
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
			fileData?.fileLink?.length > 0
		) {
			return requestJSON.textMediaAndButton;
		} else if (
			templateText?.length > 0 &&
			buttonType === buttonTypes.QUICK_REPLY
		) {
			return requestJSON.quickReply;
		} else if (
			templateText?.length > 0 &&
			buttonType === buttonTypes.CALL_TO_ACTION
		) {
			return requestJSON.callToAction;
		} else if (templateText?.length > 0 && fileData?.fileLink?.length > 0) {
			return requestJSON.textMedia;
		} else if (templateText?.length > 0) {
			return requestJSON.text;
		}
	};

	const onSubmit = () => {
		if (validateSaveTemplate()) {
			setDialogType({
				type: 'preview'
			});
		}
	};

	const validateSaveTemplate = () => {
		let validationErrors = [];
		let isValidated = true;
		if (templateData?.templateText?.length <= 0) {
			validationErrors.push(
				translator('whatsapp.alertModal.templateTextRequired')
			);
			isValidated = false;
		} else {
			if (
				!templateData?.templateText?.replace(/\s/g, '').length ||
				!templateData?.templateText?.replace(/\n/g, '').length
			) {
				validationErrors.push(
					translator('whatsapp.alertModal.templateTextRequired')
				);
				isValidated = false;
			}
		}
		if (templateName?.length <= 0) {
			validationErrors.push(
				translator('whatsapp.alertModal.templateNameRequired')
			);
			isValidated = false;
		}

		// to validate template text length
		if (
			buttonType === buttonTypes.CALL_TO_ACTION &&
			templateData.templateText?.length > buttonTextLimits.callToAction
		) {
			validationErrors.push(
				`${translator('whatsapp.alertModal.templateLengthError')} ${
					buttonTextLimits.callToAction
				}`
			);
			isValidated = false;
		}
		if (
			buttonType === buttonTypes.CALL_TO_ACTION &&
			templateData.templateText?.length > buttonTextLimits.quickReply
		) {
			validationErrors.push(
				`Template length should be less then or equals to ${buttonTextLimits.quickReply}`
			);
			isValidated = false;
		}

		if (
			templateData.templateText?.length > 0 &&
			checkLanguage(templateData.templateText, isRTL) === 'Both'
		) {
			validationErrors.push(translator('whatsapp.alertModal.languageError'));
			isValidated = false;
		}

		if ((category === authenticationTypes.AUTHENTICATIONEN || category === authenticationTypes.AUTHENTICATIONHEBREW) && (codeExpirationTime || 0) > 90) {
			validationErrors.push(translator('whatsapp.codeExpirationMessage'));
			isValidated = false;
		}

		if (!isValidated) {
			setGroupSendValidationErrors([...validationErrors]);
			setShowValidation(true);
			setDialogType({
				type: 'validation'
			});
		}
		return isValidated;
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
		if (button.buttonTitle?.includes(buttonTypes.CALL_TO_ACTION)) {
			setDialogType({
				type: 'callToAction'
			});
		} else if (button.buttonTitle?.includes('quickReplay')) {
			setDialogType({
				type: 'quickReply'
			});
		} else if (button.buttonTitle?.includes('dynamicField')) {
			if (templateData?.templateText?.length < templateTextLimit) {
				const selectionEnd = templateTextRef.current?.selectionEnd;
				const textLength = templateTextRef.current?.textLength;
				const updatedTemplateText = reOrderDynamicFieldValue(
					addDynamicField(selectionEnd, textLength)
				)?.substring(0, templateTextLimit);
				setDynamicFieldCount(getDynamicFieldIndex(updatedTemplateText)?.length);
				setTemplateData({
					...templateData,
					templateText: updatedTemplateText,
				});
				templateTextRef.current?.focus();
			}
		} else if (button.buttonTitle?.includes('removalText')) {
			setTemplateData({
				...templateData,
				templateText: `${templateData.templateText}\n${
					translator('whatsapp.replyRemoveToUnsubscribe', { lng: isRTL ? 'he' : 'en' })
				}`?.substring(0, templateTextLimit),
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
		let isPhoneNumberField: boolean = false;
		let isWebsiteField: boolean = false;
		callToActionFieldRows.forEach((row) => {
			if (row.typeOfAction === 'phonenumber') {
				isPhoneNumberField = true;
			}
			if (row.typeOfAction === 'website') {
				isWebsiteField = true;
			}
		});

		if (!isPhoneNumberField) {
			setCallToActionFieldRows([...callToActionFieldRows, initialFieldRow]);
		} else if (!isWebsiteField) {
			setCallToActionFieldRows([
				...callToActionFieldRows,
				{ ...initialFieldRow, typeOfAction: 'website', fields: websiteField },
			]);
		}
	};

	const updateTemplateText = (text: string) => {
		setDynamicFieldCount(getDynamicFieldIndex(text)?.length || 0);
		setTemplateData({
			...templateData,
			templateText: reOrderDynamicFieldValue(text),
		});
	};

	const saveTemplate = async () => {
		if (validateSaveTemplate()) {
			let requestJSON = await getRequestJSON(true);
			if (requestJSON) {
				if (templateID) {
					requestJSON.id = Number(templateID);
				}
				setIsLoader(true);
				let submitTemplate: submitTemplateAPIProps = await dispatch<any>(
					submitTemplates(requestJSON)
				);
				setIsLoader(false);
				if (submitTemplate?.payload?.Status === apiStatus.SUCCESS) {
					setToastMessage(ToastMessages.SAVE_SUCCESS);
					// resetFields();
					if (!templateID) {
						navigate(
							`/react/whatsapp/template/edit/${submitTemplate.payload.Data.id}`
						);
					}
				} else if (submitTemplate?.payload?.Status === 'Error') {
					if (submitTemplate?.payload?.Message?.length > 0) {
						if (
							submitTemplate?.payload?.Message?.includes(
								'Template with this name is already exists'
							)
						) {
							setToastMessage({
								...ToastMessages.ERROR,
								message: submitTemplate?.payload?.Message,
							});
						} else {
							setToastMessage({
								...ToastMessages.ERROR,
								message: submitTemplate?.payload?.Message,
							});
						}
					} else {
						setToastMessage(ToastMessages.ERROR);
					}
				}
			}
		}
	};

	const onFormButtonClick = (buttonName: string) => {
		switch (buttonName) {
			case 'delete':
				setDialogType({
					type: 'delete'
				})
				break;
			case 'save':
				saveTemplate();
				break;
			case 'submit':
				onSubmit();
				break;
			default:
				break;
		}
	};

	const onDeleteTemplate = async () => {
		setDialogType(null);
		setIsDeleteTemplateOpen(false);
		if (templateID) {
			const deleteData = await dispatch<any>(deleteTemplate(templateID));
			if (deleteData?.payload?.Status === apiStatus.SUCCESS) {
				setIsDeleteTemplateOpen(false);
				await setToastMessage({
					...ToastMessages.DELETE_TEMPLATE_SUCCESS,
					message: deleteData?.payload?.Message,
				})
				resetFields();
				setTimeout(() => {
					navigate(whatsappRoutes.CREATE_TEMPLATE);
				}, 1000);
			} else {
				deleteData?.payload?.Error
					? setToastMessage({
						...ToastMessages.ERROR,
						message: deleteData?.payload?.Error,
					})
					: setToastMessage(ToastMessages.ERROR);
			}
		}
	};

	const onSubmitCampaign = async () => {
		let requestJSON = await getRequestJSON(false);
		if (requestJSON) {
			if (templateID) {
				requestJSON.id = Number(templateID);
			}
			setIsLoader(true);
			let submitTemplate: submitTemplateAPIProps = await dispatch<any>(
				submitTemplates(requestJSON)
			);
			setIsLoader(false);
			if (submitTemplate?.payload?.Status === apiStatus.SUCCESS) {
				setToastMessage(ToastMessages.SUCCESS);
				resetFields();
				setTimeout(() => {
					navigate('/react/whatsapp/templatemanagement');
				}, 2500);
			} else if (submitTemplate?.payload?.Status === 'Error') {
				if (submitTemplate?.payload?.Message?.length > 0) {
					setToastMessage({
						...ToastMessages.ERROR,
						message: submitTemplate?.payload?.Message,
					});
				} else {
					setToastMessage(ToastMessages.ERROR);
				}
			}
		}
	};

	const closeCallToAction = (isReset: Boolean) => {
		setDialogType(null);
		if (isReset && buttonType === 'callToAction') {
			setCallToActionFieldRows([...templateData.templateButtons]);
		}
	};

	const handleSelectedImage = async (fileUrl: any) => {
		setDialogType(null);
		
		if (!fileUrl || fileUrl === '') return;

		const fileProp = gallery[""].filter((g: any) => { return g.FileURL === fileUrl });

		setFileData({
			fileLink: fileUrl,
			fileType: "0",
			properties: fileProp && fileProp[0].Properties
		});

		setIsFileSelected(true);
	}

	const renderGalleryDialog = () => {
		return {
			showDivider: false,
			title: translator("common.documentGallery"),
			content: (
				<Gallery
					classes={classes}
					isConfirm={isGalleryConfirmed}
					forceReload={true}
					callbackSelectFile={handleSelectedImage}
					multiSelect={false}
					selected={fileData}
					folderType={PulseemFolderType.CLIENT_IMAGES}
				/>
			),
			onConfirm: () => {
				setIsFileSelected(true);
			}
		};
	}

	const getDeleteDialog = () => ({
		title: translator('whatsapp.alertModal.DeleteText'),
		showDivider: false,
		content: (
			<Typography style={{ fontSize: 18 }} className={clsx(classes.textCenter)}>
				{translator('whatsapp.alertModal.DeleteTitle')}
			</Typography>
		),
		renderButtons: () => <ConfirmationButtons
			classes={classes}
			onConfirm={() => onDeleteTemplate()}
			onCancel={() => setDialogType(null)}
		/>
	})

	const getValidationDialog = () => ({
		title: translator('whatsappCampaign.sendValidation'),
		showDivider: false,
		content: (
			<ul className={clsx(classes.noMargin, classes.mb20)}>
				{groupSendValidationErrors?.map((requiredField: string, index: number) => (
					<li key={index} className={classes.validationAlertModalLi}>
						{requiredField}
					</li>
				))}
			</ul>
		),
		onConfirm: async () => {
			setDialogType(null);
		}
	})

	const getPreviewDialog = () => ({
		title: translator('whatsapp.alertModal.ConfirmText'),
		showDivider: false,
		content: (
			<Box className={classes.alertModalContentMobile}>
				<div className={clsx(classes.pb25)}>{translator('whatsapp.alertModal.ConfirmTitle')}</div>

				<WhatsappMobilePreview
					classes={classes}
					templateData={templateData}
					buttonType={buttonType}
					fileData={fileData}
				/>
			</Box>
		),
		onConfirm: async () => {
			setDialogType(null);
			onSubmitCampaign();
		}
	})

	const getCallToAction = () => ({
		title: translator('whatsapp.callToActionTitle'),
		showDivider: false,
		showDefaultButtons: false,
		contentStyle: classes.noPadding,
		customContainerStyle: classes.callToAction,
		content: (
			<ActionCallPopOver
				closeCallToAction={(isReset) => closeCallToAction(isReset)}
				classes={classes}
				callToActionFieldRows={callToActionFieldRows}
				setCallToActionFieldRows={(data) => setCallToActionFieldRows(data)}
				phoneNumberField={phoneNumberField}
				websiteField={websiteField}
				addMore={() => addMore()}
				updateTemplateData={(data: callToActionProps) =>
					updateTemplateButton(data, buttonTypes.CALL_TO_ACTION)
				}
				isEditable={true}
				buttonType={buttonType}
				templateText={templateData.templateText}
			/>
		),
		onConfirm: async () => {
			setDialogType(null);
			onSubmitCampaign();
		}
	})

	const getQuickReplyDialog = () => ({
		title: translator('whatsapp.quickReply.title'),
		showDivider: false,
		showDefaultButtons: false,
		contentStyle: classes.noPadding,
		content: (
			<QuickReply
				classes={classes}
				closeQuickReply={() => setDialogType(null)}
				quickReplyButtons={quickReplyButtons}
				setQuickReplyButtons={(data: quickReplyButtonProps[]) =>
					setQuickReplyButtons(data)
				}
				updateTemplateData={(data: quickReplyButtonProps[]) => {
					updateTemplateButton(data, buttonTypes.QUICK_REPLY);
					if ((category === authenticationTypes.AUTHENTICATIONEN || category === authenticationTypes.AUTHENTICATIONHEBREW) && data.length > 0) {
						setAuthenticationButtonText(data[0].fields[0].value);
					}
				}}
				templateButtons={templateData.templateButtons}
				isEditable={true}
				isDeletionAllowed={category !== authenticationTypes.AUTHENTICATIONEN && category !== authenticationTypes.AUTHENTICATIONHEBREW}
				canAddMoreButtons={category !== authenticationTypes.AUTHENTICATIONEN && category !== authenticationTypes.AUTHENTICATIONHEBREW}
				maxButtonTextLength={category !== authenticationTypes.AUTHENTICATIONEN && category !== authenticationTypes.AUTHENTICATIONHEBREW ? 20 : 25}
			/>
		),
		onConfirm: async () => {
			setDialogType(null);
		}
	})

	const renderDialog = () => {
		const { type } = dialogType || {}
		let currentDialog: any = {};
		if (type === 'delete') {
			currentDialog = getDeleteDialog();
		} else if (type === 'validation') {
			currentDialog = getValidationDialog();
		} else if (type === 'preview') {
			currentDialog = getPreviewDialog();
		} else if (type === 'callToAction') {
			if (callToActionFieldRows?.length === 0) {
				setCallToActionFieldRows([initialFieldRow]);
			}
			currentDialog = getCallToAction();
		} else if (type === 'quickReply') {
			currentDialog = getQuickReplyDialog();
		}
		else if(type==='gallery'){
			currentDialog = renderGalleryDialog();
		}

		if (type) {
			return (
				dialogType && <BaseDialog
					classes={classes}
					open={dialogType}
					onCancel={() => setDialogType(null)}
					onClose={() => setDialogType(null)}
					renderButtons={currentDialog?.renderButtons || null}
					{...currentDialog}>
					{currentDialog?.content}
				</BaseDialog>
			)
		}
	}

	const handleCodeExpirationChange = (event: any) => {
		const onlyNums = event.target.value.replace(/[^0-9]/g, '');
		setCodeExpirationTime(onlyNums);
		updateTemplateForAuthentication();
	}

	const updateTemplateForAuthentication = () => {
		const button = {
			id: uniqid(),
			typeOfAction: '',
			fields: [
				{
					fieldName: 'whatsapp.websiteButtonText',
					type: 'text',
					placeholder: 'whatsapp.websiteButtonTextPlaceholder',
					value: authenticationButtonText || translator('whatsapp.copyCode', { lng: category === authenticationTypes.AUTHENTICATIONEN ? 'en' : 'he' }),
				},
			],
		};

		let template = `${authenticationMockTemplate[category].body}`;
		if (codeExpirationTime && codeExpirationTime > 0) {
			template += `\n\n ${authenticationMockTemplate[category].subtitle.replace('X', `${codeExpirationTime}`)}`;
		}
		setTemplateData({
			...templateData,
			templateText: template,
			templateButtons: [button]
		})
	}

	return (
		<DefaultScreen
			subPage={'create'}
			currentPage='whatsapp'
			classes={classes}
			containerClass={classes.editorCont}>
			{isAccountSetup ? (
				<>
					<Box className={"head"}>
						{renderToast()}
						<Box className={'topSection'}>
							<Title
								Text={translator('whatsapp.header')}
								classes={classes}
							/>
						</Box>

						<Box className={'containerBody'}>
							<form onSubmit={onSubmit}>
								<Grid container>
									<TemplateFields
										classes={classes}
										templateName={templateName}
										savedTemplate={savedTemplate}
										onTemplateNameChange={(e) => onTemplateNameChange(e)}
										onSavedTemplateChange={(templateId) =>
											onSavedTemplateChange(templateId)
										}
										savedTemplateList={savedTemplateList}
										category={category}
										onCategoryChange={setCategory}
										showValidation={showValidation}
									/>
									<Grid
										container
										spacing={windowSize === 'xs' ? 0 : 2}
										style={{ paddingTop: '14px' }}>
										<Grid item className={classes.whatsappTextEditorWrapper}>
											<WhatsappTemplateEditor
												classes={classes}
												category={category}
												onButtonClick={(button: actionButtonProps) =>
													onButtonClick(button)
												}
												buttons={templateData.templateButtons}
												onButtonDelete={(button: any) => onActionButtonDelete(button)}
												buttonType={buttonType}
												setTemplateText={(text: string) => updateTemplateText(text)}
												templateText={templateData.templateText}
												templateTextRef={templateTextRef}
												OnEditorActionButtonClick={() => setDialogType({ type: buttonType === buttonTypes.QUICK_REPLY ? 'quickReply' : 'callToAction' })
												}
												dynamicFieldCount={dynamicFieldCount}
												linkCount={linkCount}
												templateTextLimit={templateTextLimit}
												fileData={fileData}
											/>

										{
											(category === authenticationTypes.AUTHENTICATIONEN || category === authenticationTypes.AUTHENTICATIONHEBREW) && (
												<Grid item className={clsx(classes.pt15, classes.pb10, classes.dFlex)}>
													<Typography className={clsx(classes.pt5)}>
														{translator('whatsapp.codeExpirationTime') + ' (' + translator('common.minutes') + ')'}
													</Typography>
													<TextField
														required
														type='text'
														placeholder={translator('whatsapp.codeExpirationTime')}
														variant='outlined'
														size='small'
														onChange={handleCodeExpirationChange}
														onBlur={(event: any) => {
															if (event.target.value === '') setCodeExpirationTime(0);
															updateTemplateForAuthentication();
														}}
														inputProps={{ inputMode: 'numeric' }}
														value={codeExpirationTime}
														className={classes.mlr10}
													/>
													{
														(codeExpirationTime || 0) > 90 && (
															<Typography className={clsx(classes.pt5, classes.f13, classes.textRed)}>
																{translator('whatsapp.codeExpirationMessage')}
															</Typography>
														)
													}
											</Grid>
										)
									}

									{
										category !== authenticationTypes.AUTHENTICATIONEN && category !== authenticationTypes.AUTHENTICATIONHEBREW && (		
											<Grid className={classes.whatsappFileUploadWrapper} item>
												<Grid container spacing={1}>
													<Grid item className={buttonType === 'quickReply' ? classes.disabled : ''}>
														<FileUpload
															classes={classes}
															buttonType={buttonType}
															fileData={fileData}
															setFileData={(fileData) => uploadFile(fileData)}
															sourceFileSize={fileData?.properties && fileData?.properties?.Size}
														/>
													</Grid>
													<Grid item
														style={{
															paddingTop: 60,
															paddingLeft: 10
														}}
													>
														<Button
															variant='contained'
															size='medium'
															className={clsx(
																classes.btn,
																classes.btnRounded,
																classes.mt50
															)}
															color='primary'
															onClick={() => {
																setIsFileSelected(false);
																setDialogType({ type: 'gallery' });
															}}
															disabled={buttonType === 'quickReply'}
														>
															{translator('common.SelectFile')}
														</Button>
													</Grid>
												</Grid>
											</Grid>
										)
									}
								</Grid>

										<Grid item className={classes.whatsappPreviewWrapper}>
											<Grid container spacing={windowSize === 'xs' ? 0 : 2}>
												{/* <Grid item xs={12} sm={12} md={12} lg={6}>
													<WhatsappTips classes={classes} />
												</Grid> */}
												<Grid item xs={12} sm={12} md={12} lg={12}>
													<Box className={classes.whatsappMobilePreviewWrapper}>
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
											onFormButtonClick={(buttonName) =>
												onFormButtonClick(buttonName)
											}
											displayBackButton={false}
										/>
									</Grid>
								</Grid>
							</form>
						</Box>
					</Box>
				</>
			) : (
				!isLoader && <NoSetup classes={classes} />
			)}
			{renderDialog()}
			<Loader isOpen={isLoader} showBackdrop={true} />
		</DefaultScreen>
	);
};

export default WhatsappCreator;
