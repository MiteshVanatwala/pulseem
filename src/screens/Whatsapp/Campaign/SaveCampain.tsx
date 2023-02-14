import { BaseSyntheticEvent, useEffect, useState } from 'react';
import DefaultScreen from '../../DefaultScreen';
import { Title } from '../../../components/managment/Title';
import { useTranslation } from 'react-i18next';
import {
	Box,
	Grid,
	RadioGroup,
	FormControlLabel,
	Radio,
	FormGroup,
	Switch,
	Typography,
	TextField,
	Button,
} from '@material-ui/core';
import { Stack } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
	WhatsappCampaignProps,
	coreProps,
	testGroupDataProps,
	tagDataProps,
	personalFieldDataProps,
	personalFieldAPIProps,
	updatedVariable,
	landingPageDataProps,
	landingPageAPIProps,
	smsReducerProps,
	saveCampaignDataProps,
	saveCampaignResponseProps,
	saveCampaignResponsePayloadProps,
	phoneNumberAPIProps,
	CampaignDetailById,
	ApiQuickSend,
} from './Types/WhatsappCampaign.types';
import CampaignFields from './Components/CampaignFields';
import clsx from 'clsx';
import WhatsappMobilePreview from '../Editor/Components/WhatsappMobilePreview';
import {
	buttonsDataProps,
	callToActionFieldProps,
	callToActionProps,
	callToActionRowProps,
	commonAPIResponseProps,
	quickReplyButtonProps,
	quickReplyButtonsFieldProps,
	savedTemplateAPIProps,
	savedTemplateCallToActionProps,
	savedTemplateCardProps,
	savedTemplateDataProps,
	savedTemplateListProps,
	savedTemplateMediaProps,
	savedTemplateQuickReplyProps,
	savedTemplateTextProps,
	templateDataProps,
	toastProps,
} from '../Editor/Types/WhatsappCreator.types';
import Highlighter from 'react-highlight-words';
import DynamicModal from './Popups/DynamicModal';
import Buttons from './Components/Buttons';
import uniqid from 'uniqid';
import {
	userPhoneNumbers,
	getSavedTemplates,
	saveCampaign,
	getCampaignDetailById,
	quickSend,
	deleteCampaign,
} from '../../../redux/reducers/whatsappSlice';
import ValidationAlert from './Popups/ValidationAlert';
import TestGroupModal from './Popups/TestGroupModal';
import { RiCloseFill } from 'react-icons/ri';
import QuickReply from '../Editor/Popups/QuickReply';
import ActionCallPopOver from '../Editor/Popups/ActionCallPopOver';
import { useNavigate } from 'react-router-dom';
import { getDynamicFields } from '../Common';
import {
	getAccountExtraData,
	getPreviousLandingData,
	getTestGroups,
} from '../../../redux/reducers/smsSlice';
import Toast from '../../../components/Toast/Toast.component';
import { apiStatus, resetToastData, whatsappRoutes } from '../Constant';
import AlertModal from '../Editor/Popups/AlertModal';
import { useParams } from 'react-router-dom';
import { Loader } from '../../../components/Loader/Loader';

const SaveCampain = ({ classes }: WhatsappCampaignProps) => {
	const { t: translator } = useTranslation();
	const { campaignID } = useParams();
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const { testGroups } = useSelector(
		(state: { sms: smsReducerProps }) => state.sms
	);
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
	const initialFieldRow = {
		id: uniqid(),
		typeOfAction: 'phonenumber',
		fields: phoneNumberField,
	};
	const [isLoader, setIsLoader] = useState<boolean>(false);
	const { isRTL } = useSelector((state: { core: coreProps }) => state.core);
	const [isDynamcFieldModal, setIsDynamcFieldModal] = useState<boolean>(false);
	const [campaignName, setCampaignName] = useState<string>('');
	const [from, setFrom] = useState<string>('16067520281');
	const [showValidation, setShowValidation] = useState<boolean>(false);
	const [isValidationAlert, setIsValidationAlert] = useState<boolean>(false);
	const [isTestGroupModal, setIsTestGroupModal] = useState<boolean>(false);
	const [isQuickReplyOpen, setIsQuickReplyOpen] = useState<boolean>(false);
	const [isCallToActionOpen, setIsCallToActionOpen] = useState<boolean>(false);
	const [isDeleteCampaignOpen, setIsDeleteCampaignOpen] = useState(false);
	const [isTestSend, setIsTestSend] = useState<boolean>(false);
	const [testSendSelection, setTestSendSelection] =
		useState<string>('onecontact');
	const [fileData, setFileData] = useState<string>('');
	const [savedTemplate, setSavedTemplate] = useState<string>('');
	const [buttonType, setButtonType] = useState<string>('');
	const [templateData, setTemplateData] = useState<templateDataProps>({
		templateText: '',
		templateButtons: [],
	});
	const [personalFields, setpersonalFields] = useState<personalFieldDataProps>(
		{}
	);
	const [landingPages, setLandingPages] = useState<landingPageDataProps[]>([]);
	const [phoneNumbersList, setPhoneNumbersList] = useState<string[]>([]);
	const [savedTemplateList, setSavedTemplateList] = useState<
		savedTemplateListProps[]
	>([]);
	const [dynamicVariable, setDynamicVariable] = useState<string[]>([]);
	const [updatedDynamicVariable, setUpdatedDynamicVariable] = useState<
		updatedVariable[]
	>([]);
	const [groupSendValidationErrors, setGroupSendValidationErrors] = useState<
		string[]
	>([]);
	const [selectedTestGroup, setSelectedTestGroup] = useState<
		testGroupDataProps[]
	>([]);

	const [callToActionFieldRows, setCallToActionFieldRows] =
		useState<callToActionProps>([initialFieldRow]);
	const [linkCount, setlinkCount] = useState<number>(0);
	const [dynamicFieldCount, setDynamicFieldCount] = useState<number>(0);
	const [dynamicModalVariable, setDynamicModalVariable] = useState<number>(0);

	const [testSendOneContact, setTestSendOneContact] = useState<string>('');

	const [quickReplyButtons, setQuickReplyButtons] = useState<
		quickReplyButtonProps[]
	>(initialQuickReplyButtons);

	const ToastMessages = useSelector(
		(state: { whatsapp: { ToastMessages: toastProps } }) =>
			state.whatsapp.ToastMessages
	);

	const [toastMessage, setToastMessage] =
		useState<toastProps['SUCCESS']>(resetToastData);

	let updatedTemplateData: templateDataProps = {
		templateText: '',
		templateButtons: [],
	};
	let updatedButtonType: string = '';
	let updatedFileData: string = '';

	const getSavedTemplateFields = async () => {
		let savedTemplate: savedTemplateAPIProps = await dispatch<any>(
			getSavedTemplates({ templateStatus: 3 })
		);
		setSavedTemplateList(savedTemplate.payload?.Data?.Items);
		setCampaignDetail(savedTemplate.payload?.Data?.Items);
	};

	useEffect(() => {
		setIsLoader(true);
		if (!testGroups || testGroups?.length === 0) {
			dispatch(getTestGroups());
		}
		if (!personalFields || landingPages?.length <= 0) {
			getDynamicModalValues();
		}
		(async () => {
			await getSavedTemplateFields();
			await getPhoneNumber();
			setIsLoader(false);
		})();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const setCampaignDetail = (templateList: savedTemplateListProps[]) => {
		if (campaignID && templateList) {
			(async () => {
				const { payload: campaignData }: CampaignDetailById =
					await dispatch<any>(getCampaignDetailById(campaignID));
				if (campaignData.Status === apiStatus.SUCCESS) {
					onSavedTemplateChange(campaignData?.Data?.TemplateID, templateList);
					setCampaignName(campaignData?.Data?.Name);
					setFrom(campaignData?.Data?.FromNumber);
					setUpdatedDynamicVariable(campaignData?.Data?.VariableValues);
					setlinkCount(
						campaignData?.Data?.VariableValues?.filter(
							(variable) => variable?.FieldTypeId === 3
						)?.length
					);
				}
			})();
		}
	};

	const getPhoneNumber = async () => {
		const { payload: phoneNumberData }: phoneNumberAPIProps =
			await dispatch<any>(userPhoneNumbers());
		if (phoneNumberData?.Data?.length > 0) {
			setFrom(phoneNumberData?.Data[0]);
		}
		setPhoneNumbersList(phoneNumberData?.Data);
	};

	const getDynamicModalValues = async () => {
		const staticPersonalField: personalFieldDataProps = {
			Status: translator('common.Status'),
			SmsStatus: translator('common.smsStatus'),
			CreationDate: translator('client.subscribedOn'),
			FirstName: translator('smsReport.firstName'),
			LastName: translator('smsReport.lastName'),
			Email: translator('common.Mail'),
			Telephone: translator('common.telephone'),
			Cellphone: translator('common.Cellphone'),
			Address: translator('common.address'),
			BirthDate: translator('common.birthDate'),
			City: translator('common.city'),
			State: translator('common.state'),
			Country: translator('common.country'),
			Zip: translator('common.zip'),
			Company: translator('common.company'),
			ReminderDate: translator('recipient.reminderDate'),
		};
		const { payload: personalFieldData }: personalFieldAPIProps =
			await dispatch<any>(getAccountExtraData());
		const { payload: landingPageData }: landingPageAPIProps =
			await dispatch<any>(getPreviousLandingData());
		setLandingPages(landingPageData);
		setpersonalFields({ ...staticPersonalField, ...personalFieldData });
	};

	const resetFields = () => {
		setCampaignName('');
		setSavedTemplate('');
		setFrom('');
		setTemplateData({
			templateText: '',
			templateButtons: [],
		});
		setTestSendOneContact('');
		setIsTestSend(false);
		setSelectedTestGroup([]);
	};

	const resetToast = () => {
		setToastMessage(resetToastData);
	};

	const renderToast = () => {
		if (toastMessage.message?.length > 0) {
			setTimeout(() => {
				resetToast();
			}, 4000);
			return <Toast data={toastMessage} onClose={undefined} />;
		}
		return null;
	};

	const openDynamcFieldModal = async (variable: string) => {
		setDynamicModalVariable(Number(variable?.replace(/[{}]/g, '')));
		setIsDynamcFieldModal(true);
	};

	const isUpdatedVaraiable = (variable: string) => {
		let updatedVariable = variable?.replace(/[{}]/g, '');
		const isAvaliable = updatedDynamicVariable?.find(
			(dynamicVariable: updatedVariable) =>
				dynamicVariable.VariableIndex === Number(updatedVariable)
		);
		return !!isAvaliable;
	};

	const getUpdatedVariableValue = (variable: string) => {
		let updatedVariable = variable?.replace(/[{}]/g, '');
		const variableValue = updatedDynamicVariable?.find(
			(dynamicVariable: updatedVariable) =>
				dynamicVariable.VariableIndex === Number(updatedVariable)
		)?.VariableValue;
		return variableValue ? variableValue : variable;
	};

	const highlightText = (tagData: tagDataProps) => {
		const isUpdated = isUpdatedVaraiable(tagData?.children);
		return (
			<strong
				className={clsx(
					classes.whatsappCampainHighlightText,
					`${isUpdated && 'updated'}`
				)}
				onClick={() => openDynamcFieldModal(tagData?.children)}>
				{isUpdated
					? getUpdatedVariableValue(tagData?.children)
					: tagData?.children}
			</strong>
		);
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

	const resetDynamicFields = () => {
		setDynamicVariable([]);
		setUpdatedDynamicVariable([]);
		setlinkCount(0);
		setDynamicModalVariable(0);
	};

	const onSavedTemplateChange = (
		TemplateId: string,
		templateList: savedTemplateListProps[] = savedTemplateList
	) => {
		resetDynamicFields();

		setSavedTemplate(TemplateId);
		const savedTemplateData: savedTemplateListProps | undefined =
			templateList?.find((template) => template.TemplateId === TemplateId);
		const templateData: savedTemplateDataProps | undefined =
			savedTemplateData?.Data;
		if (templateData) {
			setUpdatedTemplateData(templateData);
		}
		setFileData(updatedFileData);
		// setTemplateName(savedTemplateData?.TemplateName || '');
		setButtonType(updatedButtonType);
		setTemplateData(updatedTemplateData);
		setDynamicVariable(getDynamicFields(updatedTemplateData.templateText));
		if (updatedButtonType === 'quickReply') {
			setQuickReplyButtons(updatedTemplateData.templateButtons);
		} else {
			setCallToActionFieldRows(updatedTemplateData.templateButtons);
		}
		if (templateData?.variables) {
			setDynamicFieldCount(Object.keys(templateData?.variables)?.length);
		}
	};

	const onChangeTestSendRadio = (value: string) => {
		if (value === 'testgroup') {
			setIsTestGroupModal(true);
		}
		setTestSendSelection(value);
	};

	const onRemoveGroupSelection = (e: BaseSyntheticEvent, GroupID: number) => {
		e.stopPropagation();
		e.preventDefault();
		const updatedSelectedGroup = selectedTestGroup.filter(
			(selectedGroup: testGroupDataProps) => selectedGroup?.GroupID !== GroupID
		);
		setSelectedTestGroup(updatedSelectedGroup);
	};

	const validateSaveCampaign = () => {
		if (campaignName?.length <= 0 || savedTemplate?.length <= 0) {
			let validationErrors = [];
			if (campaignName?.length <= 0 && savedTemplate?.length <= 0) {
				validationErrors.push('Campaign name - required fields');
				validationErrors.push('Template for sending - required fields');
			} else if (campaignName?.length <= 0) {
				validationErrors.push('Campaign name - required fields');
			} else if (savedTemplate?.length <= 0) {
				validationErrors.push('Template for sending - required fields');
			}
			setGroupSendValidationErrors([...validationErrors]);
			setShowValidation(true);
			return false;
		} else {
			return true;
		}
	};

	const onDeleteClick = () => {
		setIsDeleteCampaignOpen(true);
	};

	const onDeleteCampaign = async () => {
		if (campaignID) {
			const deleteData: commonAPIResponseProps = await dispatch<any>(
				deleteCampaign(campaignID)
			);
			setIsDeleteCampaignOpen(false);
			if (deleteData?.payload?.Status === apiStatus.SUCCESS) {
				setToastMessage(ToastMessages.DELETE_CAMPAIGN_SUCCESS);
				navigate(whatsappRoutes.CAMPAIGN_MANAGEMENT);
			} else {
				deleteData?.payload?.Message
					? setToastMessage({
							...ToastMessages.ERROR,
							message: deleteData?.payload?.Message,
					  })
					: setToastMessage(ToastMessages.ERROR);
			}
		} else {
			resetFields();
		}
		setIsDeleteCampaignOpen(false);
	};

	const onOkTestSending = async (isSingle: boolean = false) => {
		if (validateSaveCampaign()) {
			const { payload: quickSendData }: ApiQuickSend = await dispatch<any>(
				quickSend({
					WACampaignID: Number(campaignID) || 0,
					TestGroupsIds: isSingle
						? Number(testSendOneContact)
						: selectedTestGroup?.map((group) => group?.GroupID),
				})
			);
			if (quickSendData?.Status === apiStatus.SUCCESS) {
				setToastMessage(ToastMessages.CAMPAIGN_SEND_SUCCESS);
				setSelectedTestGroup([]);
			} else {
				quickSendData?.Message
					? setToastMessage({
							...ToastMessages.ERROR,
							message: quickSendData?.Message,
					  })
					: setToastMessage(ToastMessages.ERROR);
			}
			console.log(quickSendData);
			setIsTestGroupModal(false);
		} else {
			setIsTestGroupModal(false);
			setIsValidationAlert(true);
		}
	};

	const onDynamcFieldModalSave = (
		updatedDynamicVariable: updatedVariable[]
	) => {
		setUpdatedDynamicVariable(updatedDynamicVariable);
		setlinkCount(
			updatedDynamicVariable?.filter((variable) => variable?.FieldTypeId === 3)
				?.length
		);
		setIsDynamcFieldModal(false);
	};

	const saveCampaignCall = async () => {
		const reqData: saveCampaignDataProps = {
			WACampaignID: Number(campaignID) || 0,
			TemplateId: savedTemplate,
			Variables: updatedDynamicVariable,
			name: campaignName,
			fromnumber: from,
			IsTestCampaign: isTestSend,
		};
		const { payload }: saveCampaignResponseProps = await dispatch<any>(
			saveCampaign(reqData)
		);
		return payload;
	};

	const onSaveCampaign = async () => {
		if (validateSaveCampaign()) {
			const data: saveCampaignResponsePayloadProps = await saveCampaignCall();

			if (data.Status === apiStatus.SUCCESS) {
				setToastMessage(ToastMessages.SAVE_CAMPAIGN_SUCCESS);
			} else {
				data?.Message
					? setToastMessage({ ...ToastMessages.ERROR, message: data?.Message })
					: setToastMessage(ToastMessages.ERROR);
			}
		} else {
			setIsValidationAlert(true);
		}
	};

	const onSubmit = async (e: BaseSyntheticEvent) => {
		e.preventDefault();
		if (validateSaveCampaign()) {
			const data: saveCampaignResponsePayloadProps = await saveCampaignCall();

			if (data.Status === apiStatus.SUCCESS) {
				navigate(
					`/react/whatsapp/campaign/edit/page2/${data.Data.WACampaignId}`
				);
			} else {
				data?.Message
					? setToastMessage({ ...ToastMessages.ERROR, message: data?.Message })
					: setToastMessage(ToastMessages.ERROR);
			}
		} else {
			setIsValidationAlert(true);
		}
	};

	const onFormButtonClick = (buttonName: string) => {
		switch (buttonName) {
			case 'Save':
				onSaveCampaign();
				break;
			case 'Delete':
				onDeleteClick();
				break;

			default:
				break;
		}
	};

	return (
		<DefaultScreen
			subPage={'create'}
			currentPage='whatsapp'
			classes={classes}
			customPadding={true}
			containerClass={null}>
			{renderToast()}
			<Grid
				className={classes.WhatsappCampainHeaderWrapper}
				container
				alignItems='center'>
				<Grid item>
					<Title
						Text={translator('whatsappCampaign.header')}
						Classes={classes.WhatsappCampainP1Title}
						ContainerStyle={{}}
						Element={null}
					/>
				</Grid>
				<Grid item className={classes.WhatsappCampainNotice}>
					<>{translator('whatsappCampaign.note')}</>
					<br />
					<span>
						<>{translator('whatsappCampaign.checkLimit')}</>{' '}
						<a
							href='https://business.facebook.com/settings/whatsapp-business-accounts/'
							target='_blank'
							rel='noreferrer'>
							<>{translator('whatsappCampaign.here')}</>
						</a>
					</span>
				</Grid>
			</Grid>
			<br />
			<form onSubmit={(e: BaseSyntheticEvent) => onSubmit(e)}>
				<Grid container className={classes.WhatsappCampainP1}>
					<Grid className={classes.WhatsappCampainP1Left} item md={12} lg={6}>
						<Grid container>
							<Grid
								item
								className={classes.WhatsappCampainFields}
								md={12}
								lg={12}>
								<CampaignFields
									classes={classes}
									savedTemplateList={savedTemplateList}
									savedTemplate={savedTemplate}
									onSavedTemplateChange={(templateId) =>
										onSavedTemplateChange(templateId)
									}
									campaignName={campaignName}
									onCampaignNameChange={(campaignName) =>
										setCampaignName(campaignName)
									}
									from={from}
									onFromChange={(from) => setFrom(from)}
									showValidation={showValidation}
									phoneNumbersList={phoneNumbersList}
								/>
							</Grid>
							<Grid
								item
								className={classes.WhatsappCampainTextarea}
								md={12}
								lg={12}>
								<div className={classes.whatsappCampainHighlightContent}>
									<div className={classes.whatsappCampainHighlightTextWrapper}>
										<Highlighter
											searchWords={dynamicVariable}
											autoEscape={true}
											textToHighlight={templateData.templateText}
											highlightTag={(tagData: tagDataProps) =>
												highlightText(tagData)
											}
										/>
									</div>
									<Box
										className={classes.whatsappCampaignActionButtonsWrapper}
										id='buttons-wrapper'>
										{templateData.templateButtons?.map(
											(button: quickReplyButtonProps | callToActionRowProps) =>
												button.fields.map(
													(
														field:
															| quickReplyButtonsFieldProps
															| callToActionFieldProps
													) =>
														(field.fieldName === 'whatsapp.websiteButtonText' ||
															field.fieldName ===
																'whatsapp.phoneButtonText') && (
															<Box
																key={button.id}
																className={
																	classes.whatsappCampaignActionButtonsBox
																}>
																<Button
																	className={classes.whatsappActionButtons}
																	onClick={() =>
																		buttonType === 'quickReply'
																			? setIsQuickReplyOpen(true)
																			: setIsCallToActionOpen(true)
																	}>
																	{field.value}
																</Button>
															</Box>
														)
												)
										)}
									</Box>
								</div>
								<Box className={classes.whatsappSmallInfoDiv}>
									<span className={classes.textInfoWrapper}>
										{isRTL && <>{linkCount}&nbsp;</>}
										<span className={classes.textInfo}>
											{linkCount === 1 ? (
												<>{translator('whatsappCampaign.link')}</>
											) : (
												<>{translator('whatsappCampaign.links')}</>
											)}
										</span>
										{!isRTL && <>&nbsp;{linkCount}</>}
									</span>

									<span className={classes.textInfoWrapper}>
										{isRTL && <>{dynamicFieldCount}&nbsp;</>}
										<span className={classes.textInfo}>
											{dynamicFieldCount === 1 ? (
												<>{translator('whatsappCampaign.dfield')}</>
											) : (
												<>{translator('whatsappCampaign.dfields')}</>
											)}
										</span>
										{!isRTL && <>&nbsp;{dynamicFieldCount}</>}
									</span>

									<span className={classes.textInfoWrapper}>
										{isRTL && (
											<>{templateData.templateText?.length}/1024&nbsp;</>
										)}
										<span className={classes.textInfo}>
											<>{translator('whatsappCampaign.char')}</>
										</span>
										{!isRTL && (
											<>&nbsp;{templateData.templateText?.length}/1024</>
										)}
									</span>
								</Box>
							</Grid>
						</Grid>
					</Grid>
					<Grid className={classes.WhatsappCampainP1Right} item md={12} lg={6}>
						<Grid container>
							<Grid item xs={12} sm={12} md={12} lg={12}>
								<Box className={classes.WhatsappCampainMobilePreviewBox}>
									<WhatsappMobilePreview
										classes={classes}
										templateData={templateData}
										buttonType={buttonType}
										fileData={fileData}
									/>
								</Box>
							</Grid>
							<Grid
								className={classes.WhatsappCampainMobilePreviewBox}
								item
								xs={12}
								sm={12}
								md={12}
								lg={12}>
								<Box
									className={clsx(classes.switchDiv, classes.testSendWrapper)}>
									<FormGroup>
										<Switch
											checked={isTestSend}
											onChange={() => setIsTestSend(!isTestSend)}
											className={clsx(
												{ [classes.rtlSwitch]: isRTL },
												classes.WhatsappCampainSwitch
											)}
										/>
									</FormGroup>

									<Box className={classes.radio}>
										<Typography style={{ fontSize: '18px' }}>
											<>{translator('whatsappCampaign.tsend')}</>
										</Typography>
										<Typography className={classes.whatsappDescSwitch}>
											<>{translator('whatsappCampaign.tsendDesc')}</>
										</Typography>
									</Box>
								</Box>

								{isTestSend && (
									<Box className={clsx(classes.radio, classes.testSendRadio)}>
										<RadioGroup
											aria-labelledby='demo-controlled-radio-buttons-group'
											defaultValue='onecontact'
											name='radio-buttons-group'
											onChange={(e: BaseSyntheticEvent) =>
												onChangeTestSendRadio(e.target.value)
											}>
											<FormControlLabel
												value='onecontact'
												control={
													<Radio
														className={classes.WhatsappCampainRadioButton}
													/>
												}
												label={
													<Typography style={{ fontSize: 16 }}>
														<>{translator('whatsappCampaign.oneContact')}</>
													</Typography>
												}
											/>
											<Stack direction='row' spacing={0.5} height={40}>
												<TextField
													required
													size='small'
													id='templateName'
													placeholder={translator(
														'whatsappCampaign.oneContactPlaceholder'
													)}
													className={clsx(classes.buttonField, classes.success)}
													disabled={testSendSelection !== 'onecontact'}
													onChange={(e: BaseSyntheticEvent) =>
														setTestSendOneContact(
															e.target.value?.replace(/\D/g, '')
														)
													}
													value={testSendOneContact}
												/>
												<Button
													disabled={
														testSendSelection !== 'onecontact' ||
														testSendOneContact?.length === 0
													}
													variant='outlined'
													color='primary'
													className={classes.testOneContactSendButton}
													onClick={() => onOkTestSending(true)}>
													<>{translator('whatsappCampaign.sendButton')}</>
												</Button>
											</Stack>
											<br />
											<Stack
												direction='row'
												alignItems={'center'}
												spacing={0.5}
												height={40}>
												<FormControlLabel
													value='testgroup'
													control={
														<Radio
															className={classes.WhatsappCampainRadioButton}
														/>
													}
													label={
														<Typography style={{ fontSize: 16 }}>
															<>{translator('whatsappCampaign.testGroups')}</>
														</Typography>
													}
												/>
												<span className={classes.testSendNewTag}>
													<>{translator('mainReport.newFeature')}</>
												</span>
											</Stack>
											{testSendSelection === 'testgroup' && (
												<Stack>
													<div className={classes.rightForm}>
														<div
															className={classes.contactGroupDiv}
															onClick={() => {
																setIsTestGroupModal(true);
															}}>
															{selectedTestGroup.length <= 0 && (
																<div>
																	{' '}
																	<>{translator('mainReport.ChooseLinks')}</>
																</div>
															)}
															{selectedTestGroup.length > 0 ? (
																<div className={classes.mappedGroup}>
																	{selectedTestGroup.map((item, index) => {
																		return (
																			<div
																				key={index}
																				className={classes.selectedGroupsDiv}>
																				<span className={classes.nameGroup}>
																					{item.GroupName}
																				</span>
																				<RiCloseFill
																					className={classes.groupCloseicn}
																					onClick={(event) => {
																						onRemoveGroupSelection(
																							event,
																							item.GroupID
																						);
																					}}
																				/>
																			</div>
																		);
																	})}
																</div>
															) : null}
														</div>
													</div>
												</Stack>
											)}
										</RadioGroup>
									</Box>
								)}
							</Grid>
						</Grid>
					</Grid>
				</Grid>
				<Grid container>
					<Buttons
						displayBackButton={false}
						classes={classes}
						onFormButtonClick={(buttonName: string) =>
							onFormButtonClick(buttonName)
						}
					/>
				</Grid>
			</form>

			<Loader isOpen={isLoader} showBackdrop={true} />

			<DynamicModal
				classes={classes}
				isDynamcFieldModal={isDynamcFieldModal}
				onDynamcFieldModalClose={() => setIsDynamcFieldModal(false)}
				personalFields={personalFields}
				landingPageData={landingPages}
				dynamicModalVariable={dynamicModalVariable}
				onDynamcFieldModalSave={(updatedDynamicVariable) =>
					onDynamcFieldModalSave(updatedDynamicVariable)
				}
				dynamicVariable={updatedDynamicVariable}
			/>

			<ValidationAlert
				classes={classes}
				isOpen={isValidationAlert}
				onClose={() => setIsValidationAlert(false)}
				title={translator('whatsappCampaign.sendValidation')}
				requiredFields={groupSendValidationErrors}
			/>

			<TestGroupModal
				classes={classes}
				isOpen={isTestGroupModal}
				onClose={() => setIsTestGroupModal(false)}
				title={translator('whatsappCampaign.sendTitle')}
				testGroupData={testGroups}
				selectedTestGroup={selectedTestGroup}
				setSelectedTestGroup={(updatedSelectedGroup) =>
					setSelectedTestGroup(updatedSelectedGroup)
				}
				onConfirmOrYes={() => onOkTestSending()}
			/>

			<QuickReply
				classes={classes}
				isQuickReplyOpen={isQuickReplyOpen}
				closeQuickReply={() => setIsQuickReplyOpen(false)}
				quickReplyButtons={quickReplyButtons}
				setQuickReplyButtons={() => {}}
				updateTemplateData={() => {}}
				templateButtons={templateData.templateButtons}
				isEditable={false}
			/>
			<ActionCallPopOver
				isCallToActionOpen={isCallToActionOpen}
				closeCallToAction={() => setIsCallToActionOpen(false)}
				classes={classes}
				callToActionFieldRows={callToActionFieldRows}
				setCallToActionFieldRows={(data) => setCallToActionFieldRows(data)}
				phoneNumberField={phoneNumberField}
				websiteField={websiteField}
				addMore={() => {}}
				updateTemplateData={() => {}}
				isEditable={false}
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
		</DefaultScreen>
	);
};

export default SaveCampain;
