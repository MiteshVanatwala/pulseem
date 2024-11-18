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
	TestSendReq,
	SaveQuickSendGroups,
	ApiGetCampaignSummaryPayloadData,
	ApiGetCampaignSummary,
} from './Types/WhatsappCampaign.types';
import CampaignFields from './Components/CampaignFields';
import clsx from 'clsx';
import WhatsappMobilePreview from '../Editor/Components/WhatsappMobilePreview';
import {
	CommonRedux,
	callToActionFieldProps,
	callToActionProps,
	callToActionRowProps,
	quickReplyButtonProps,
	quickReplyButtonsFieldProps,
	savedTemplateAPIProps,
	savedTemplateDataProps,
	savedTemplateListProps,
	templateDataProps,
	templatePreviewDataProps,
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
	saveQuickSendGroups,
	getWhatsAppCampaignSummary,
	deleteCampaign,
} from '../../../redux/reducers/whatsappSlice';
import TestGroupModal from './Popups/TestGroupModal';
import { RiCloseFill } from 'react-icons/ri';
import QuickReply from '../Editor/Popups/QuickReply';
import ActionCallPopOver from '../Editor/Popups/ActionCallPopOver';
import { useNavigate } from 'react-router-dom';
import {
	adjustTemplateVariablesForLink,
	checkSiteTrackingLink,
	formatUpdatedDynamicVariable,
	getDynamicFields,
	getTemplatePreviewData,
	getTextDirection,
} from '../Common';
import {
	getAccountExtraData,
	getPreviousLandingData,
	getTestGroups,
} from '../../../redux/reducers/smsSlice';
import Toast from '../../../components/Toast/Toast.component';
import {
	apiStatus,
	authenticationMockTemplate,
	authenticationTypes,
	buttonTextLimits,
	buttonTypes,
	buttons,
	errorToastData,
	fieldNameIds,
	resetToastData,
	whatsappRoutes,
} from '../Constant';
import { useParams } from 'react-router-dom';
import { Loader } from '../../../components/Loader/Loader';
import SummaryModal from './Popups/SummaryModal';
import { getCommonFeatures } from '../../../redux/reducers/commonSlice';
import NoSetup from '../NoSetup/NoSetup';
import moment from 'moment';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import { sitePrefix } from '../../../config';
import ConfirmationButtons from '../../../components/ConfirmationButtons/ConfirmationButtons';
import { DateFormats, FBBusiness } from '../../../helpers/Constants';
import { WhatsappCampaignStatus } from '../../../config/enum';

const SaveCampain = ({ classes }: WhatsappCampaignProps) => {
	const { t: translator } = useTranslation();
	const { campaignID } = useParams();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const queryParams = new URLSearchParams(window.location.search)
	let FromAutomation = queryParams.get("FromAutomation") || false
	if (FromAutomation === 'false') FromAutomation = false;
	const NodeToEdit = queryParams.get("NodeToEdit") || false
	let isSendCampaign = queryParams.get("new") || false;
	if (isSendCampaign === 'false') isSendCampaign = false;

	const { testGroups } = useSelector(
		(state: { sms: smsReducerProps }) => state.sms
	);
	const { SubAccountSettings } = useSelector(
		(state: { common: CommonRedux }) => state.common?.accountSettings
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
		{
			fieldName: 'mainReport.keepTrack',
			type: '',
			placeholder: '',
			value: 'false',
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
	const [isAccountSetup, setIsAccountSetup] = useState<boolean | null>(null);
	const [isLoader, setIsLoader] = useState<boolean>(true);
	const { isRTL, windowSize } = useSelector((state: { core: coreProps }) => state.core);
	// const [isDynamcFieldModal, setIsDynamcFieldModal] = useState<boolean>(false);
	const [campaignName, setCampaignName] = useState<string>('');
	const [from, setFrom] = useState<string>('');
	const [showValidation, setShowValidation] = useState<boolean>(false);
	const [isTestSend, setIsTestSend] = useState<boolean>(false);
	const [isTrackLink, setIsTrackLink] = useState<boolean>(false);
	const [nextMessageAvailable, setNextMessageAvailable] = useState<string>('');
	const [templateTextLimit, setTemplateTextLimit] = useState<number>(1024);
	const [templateTextCount, setTemplateTextCount] = useState<number>(0);
	const [randomlyCount, setRandomlyCount] = useState<string>('');
	const [testSendSelection, setTestSendSelection] =
		useState<string>('onecontact');
	const [fileData, setFileData] = useState<{
		fileLink: string;
		fileType: string;
	}>({
		fileLink: '',
		fileType: '',
	});
	const [dialogType, setDialogType] = useState<any>({ type: '' });
	const [savedTemplate, setSavedTemplate] = useState<string>('');
	const [buttonType, setButtonType] = useState<string>('');
	const [templateCategory, setTemplateCategory] = useState<number>(0);
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
	const [selectedTestGroupDummy, setSelectedTestGroupDummy] = useState<
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

	const [campaignSummary, setCampaignSummary] =
		useState<ApiGetCampaignSummaryPayloadData>();

	const ToastMessages = useSelector(
		(state: { whatsapp: { ToastMessages: toastProps } }) =>
			state.whatsapp.ToastMessages
	);

	const [toastMessage, setToastMessage] =
		useState<toastProps['SUCCESS']>(resetToastData);

	const getSavedTemplateFields = async () => {
		let savedTemplate: savedTemplateAPIProps = await dispatch<any>(
			getSavedTemplates({ templateStatus: 3 })
		);
		setSavedTemplateList(savedTemplate.payload?.Data?.Items || []);
		setCampaignDetail(savedTemplate.payload?.Data?.Items || []);
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
				dispatch(getTestGroups());
				if (!personalFields || landingPages?.length <= 0) {
					getDynamicModalValues();
				}
				(async () => {
					await getSavedTemplateFields();
					await getPhoneNumber();
					setIsLoader(false);
				})();

				// To fetch Sub Account Feature And Settings if not available
				if (!SubAccountSettings?.DomainAddress) {
					dispatch(getCommonFeatures());
				}
				setIsAccountSetup(true);
			} else {
				setIsLoader(false);
				setIsAccountSetup(false);
			}
		})();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (buttonType === buttonTypes.CALL_TO_ACTION) {
			setTemplateTextLimit(buttonTextLimits.callToAction);
		} else {
			setTemplateTextLimit(buttonTextLimits.quickReply);
		}
		// eslint-disable-next-line @typescript-eslint/no-use-before-define, react-hooks/exhaustive-deps
	}, [buttonType]);

	useEffect(() => {
		const updatedPersonalField = {
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
			Status: translator('common.Status'),
			SmsStatus: translator('common.smsStatus'),
			CreationDate: translator('client.subscribedOn'),
			ReminderDate: translator('recipient.reminderDate'),
		};
		setpersonalFields({ ...personalFields, ...updatedPersonalField });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isRTL]);

	useEffect(() => {
		let textCount = templateData?.templateText?.length;
		updatedDynamicVariable?.forEach((dynamicVariable) => {
			switch (dynamicVariable?.FieldTypeId) {
				// Personal field , Text, Landing Page, Navigation
				// case 1:
				case 2:
				case 4:
				case 5:
					textCount += dynamicVariable?.VariableValue?.length;
					break;
				// Link
				case 3:
					if (
						dynamicVariable?.IsStatastic &&
						checkSiteTrackingLink(
							SubAccountSettings,
							dynamicVariable?.VariableValue
						)
					) {
						textCount += 35;
					} else if (
						dynamicVariable?.IsStatastic &&
						dynamicVariable?.VariableValue === '##WHATSAPPUnsubscribelink##'
					) {
						textCount += 36;
					} else {
						textCount += dynamicVariable?.VariableValue?.length;
					}
					break;
				default:
					break;
			}
			textCount -= (dynamicVariable?.VariableIndex <= 10 ? 5 : 6) || 0;
		});
		setTemplateTextCount(textCount);
		// eslint-disable-next-line @typescript-eslint/no-use-before-define, react-hooks/exhaustive-deps
	}, [updatedDynamicVariable, templateData]);

	const setUpdatedDynamicVariableWithLinks = (variable: updatedVariable[]) => {
		const updatedVariableWithSiteLink = variable?.map((variable) => {
			if (
				variable?.FieldTypeId === fieldNameIds?.LINK &&
				variable?.IsStatastic
			) {
				if (
					(!variable.VariableValue.includes('ref') || !variable.VariableValue.includes('dynamicProduct')) && checkSiteTrackingLink(SubAccountSettings, variable?.VariableValue)
				) {
					return {
						...variable,
						VariableValue: variable?.VariableValue.includes('?')
							? variable?.VariableValue + '&ref=##ClientIDEnc##'
							: variable?.VariableValue + '?ref=##ClientIDEnc##',
					};
				}
				return variable;
			} else {
				if (
					(variable?.VariableValue.includes('ref') || variable?.VariableValue.includes('dynamicProduct')) &&
					!checkSiteTrackingLink(SubAccountSettings, variable?.VariableValue)
				) {
					return {
						...variable,
						VariableValue: variable?.VariableValue.includes('?')
							? variable?.VariableValue?.replace('&ref=##ClientIDEnc##', '').trim()
							: variable?.VariableValue?.replace('?ref=##ClientIDEnc##', '').trim(),
					};
				}
			}
			return variable;
		});

		// const consolidatedVars = updatedVariableWithSiteLink.reduce((result: any, newVar: updatedVariable) => {
		// 	console.log(newVar)
		// 	updatedDynamicVariable.map((existingVar: updatedVariable) => {
		// 		console.log(existingVar)
		// 		if (newVar.VariableIndex !== existingVar.VariableIndex) {
		// 			result.push(existingVar);
		// 			return result;
		// 		}
		// 	});
		// 	result.push(newVar);
		// 	return result;
		// }, []);

		// setUpdatedDynamicVariable(consolidatedVars.length ? consolidatedVars : updatedVariableWithSiteLink);
		setUpdatedDynamicVariable(updatedVariableWithSiteLink);
	};

	const setCampaignDetail = (templateList: savedTemplateListProps[]) => {
		if (campaignID && templateList) {
			(async () => {
				const { payload: campaignData }: CampaignDetailById =
					await dispatch<any>(getCampaignDetailById(campaignID));
				if (campaignData.Status === apiStatus.SUCCESS) {
					onSavedTemplateChange(campaignData?.Data?.TemplateID, templateList);
					setCampaignName(campaignData?.Data?.Name);
					setFrom(campaignData?.Data?.FromNumber);
					// chech siteLink and update dynamicvariable
					const processedDynamicVariable =
						campaignData?.Data?.VariableValues?.map((variable) => {
							if (variable?.FieldTypeId === 1) {
								return {
									...variable,
									VariableValue: variable.VariableValue?.replaceAll('#', ''),
								};
							}
							return variable;
						});

					setUpdatedDynamicVariableWithLinks(processedDynamicVariable);
					if (campaignData?.Data?.VariableValues?.length > 0) {
						campaignData?.Data?.VariableValues?.forEach((variable) => {
							if (variable?.IsStatastic === true) {
								setIsTrackLink(true);
							}
						});
					}
					setlinkCount(
						campaignData?.Data?.VariableValues?.filter(
							(variable) => variable?.FieldTypeId === fieldNameIds?.LINK
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
			Status: translator('common.Status'),
			SmsStatus: translator('common.smsStatus'),
			CreationDate: translator('client.subscribedOn'),
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
		setSelectedTestGroupDummy([]);
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

	const openDynamcFieldModal = async (variable: string) => {
		setDynamicModalVariable(Number(variable?.replace(/[{}]/g, '')));
		setDialogType({
			type: 'dynamicModal'
		});
	};

	const isUpdatedVaraiable = (variable: string) => {
		let updatedVariable = variable?.replace(/[{}]/g, '');
		const isAvaliable = updatedDynamicVariable?.find(
			(dynamicVariable: updatedVariable) =>
				dynamicVariable?.VariableIndex === Number(updatedVariable)
		);
		return !!isAvaliable;
	};

	const getUpdatedVariableValue = (variable: string) => {
		let updatedVariable = variable?.replace(/[{}]/g, '');
		const matchedVariable = updatedDynamicVariable?.find(
			(dynamicVariable: updatedVariable) =>
				dynamicVariable?.VariableIndex === Number(updatedVariable)
		);

		const variableValue =
			matchedVariable?.FieldTypeId === 1
				? personalFields[matchedVariable?.VariableValue]
				: matchedVariable?.VariableValue;

		return variableValue ? variableValue : variable;
	};

	const highlightText = (tagData: tagDataProps) => {
		let updatedVariables = getDynamicFields(tagData?.children, true);
		const highlightVariables = (
			<>
				{updatedVariables?.map((variable, index) => (
					variable === '\n'
						? <br />
						: <strong
							key={index}
							className={clsx(
								classes.whatsappCampainHighlightText,
								`${isUpdatedVaraiable(variable) && 'updated'}`
							)}
							onClick={() => openDynamcFieldModal(variable)}>
							{isUpdatedVaraiable(variable)
								? getUpdatedVariableValue(variable)
								: variable}
						</strong>
				))}
			</>
		);
		return highlightVariables;
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
		const savedTemplateData: savedTemplateListProps | undefined =
			templateList?.find((template) => template.TemplateId === TemplateId);
		setTemplateCategory(savedTemplateData?.CategoryId || 0);
		const templateData: savedTemplateDataProps | undefined =
			savedTemplateData?.Data;
		if (templateData) {
			templatePreviewData = getTemplatePreviewData(templateData?.types);
		}
		if (savedTemplateData?.CategoryId === 3) {
			renderAuthenticationPreview(savedTemplateData);
		} else {
			setFileData(templatePreviewData?.fileData);
			setButtonType(templatePreviewData?.buttonType);
			setTemplateData(templatePreviewData?.templateData);
			setDynamicVariable(
				getDynamicFields(templatePreviewData?.templateData.templateText, true)
			);
			if (templatePreviewData?.buttonType === 'quickReply') {
				setQuickReplyButtons(templatePreviewData?.templateData.templateButtons);
			} else {
				setCallToActionFieldRows(
					templatePreviewData?.templateData.templateButtons
				);
			}
			if (templateData?.variables) {
				setDynamicFieldCount(
					getDynamicFields(templatePreviewData?.templateData.templateText)?.length
				);
			}
		}
	};

	const renderAuthenticationPreview = (templateData: any) => {
		setButtonType('quickReply');
		const buttons = [{
			id: uniqid(),
			typeOfAction: '',
			fields: [
				{
					fieldName: 'whatsapp.websiteButtonText',
					type: 'text',
					placeholder: 'whatsapp.websiteButtonTextPlaceholder',
					value: templateData.Data?.types?.['authentication']?.actions[0].copy_code_text,
				},
			],
		}];
		let template = `${authenticationMockTemplate[templateData.Language === 'en' ? authenticationTypes.AUTHENTICATIONEN : authenticationTypes.AUTHENTICATIONHEBREW].body}`;
		if (templateData.Data?.types?.authentication?.code_expiration_minutes) {
			template += `\n\n ${authenticationMockTemplate[templateData.Language === 'en' ? authenticationTypes.AUTHENTICATIONEN : authenticationTypes.AUTHENTICATIONHEBREW].subtitle.replace('X', `${templateData.Data?.types?.authentication?.code_expiration_minutes || 0}`)}`;
		}
		setTemplateData({
			templateText: template,
			templateButtons: buttons,
		});
		setDynamicVariable(
			getDynamicFields(template, true)
		);
		setQuickReplyButtons(buttons);
		setFileData({
			fileLink: '',
			fileType: ''
		});
	}

	const onChangeTestSendRadio = (value: string) => {
		if (value === 'testgroup') {
			setDialogType({
				type: 'testGroup'
			});
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

	const validateSaveCampaign = (validateDynamicVaraiable: boolean = false) => {
		let validationErrors = [];
		let isValidated = true;
		if (templateTextCount > templateTextLimit) {
			validationErrors.push(
				`${translator(
					'whatsapp.alertModal.templateLengthError'
				)} ${templateTextLimit}`
			);
			isValidated = false;
		}
		if (campaignName?.length <= 0 || savedTemplate?.length <= 0) {
			if (campaignName?.length <= 0 && savedTemplate?.length <= 0) {
				validationErrors.push(translator('whatsappCampaign.setCampaign'));
				validationErrors.push(translator('whatsappCampaign.selectTemplate'));
			} else if (campaignName?.length <= 0) {
				validationErrors.push(translator('whatsappCampaign.setCampaign'));
			} else if (savedTemplate?.length <= 0) {
				validationErrors.push(translator('whatsappCampaign.selectTemplate'));
			}
			isValidated = false;
		}
		if (
			validateDynamicVaraiable &&
			savedTemplate?.length > 0 &&
			getDynamicFields(templateData?.templateText)?.filter((v) => v !== '\n')?.length !==
			updatedDynamicVariable?.length
		) {
			validationErrors.push(translator('whatsappChat.pleaseUpdate'));
			isValidated = false;
		}
		if (!isValidated) {
			setGroupSendValidationErrors([...validationErrors]);
			setShowValidation(true);
		}
		return isValidated;
	};

	const onDeleteCampaign = async () => {
		setDialogType({ type: '', data: '' })
		if (campaignID) {
			const deleteData = await dispatch<any>(
				deleteCampaign(campaignID)
			);
			if (deleteData?.payload?.Status === apiStatus.SUCCESS) {
				setToastMessage(ToastMessages.DELETE_CAMPAIGN_SUCCESS);
				setTimeout(() => {
					navigate(whatsappRoutes.CAMPAIGN_MANAGEMENT);
				}, 1000);
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
	};

	const onTestSend = async (isSingle: boolean = false, campaignID: number) => {
		setIsLoader(true);
		setDialogType({ type: '' });
		let payload: TestSendReq = {
			WACampaignID: campaignID,
		};
		if (isSingle) {
			payload.PhoneNumber = testSendOneContact;
		} else {
			payload.TestGroupsIds = selectedTestGroup?.map((group) => group?.GroupID);
		}
		if (Number(randomlyCount) > 0) {
			payload.Random = Number(randomlyCount);
		}
		if (campaignID) {
			if (validateSaveCampaign(true)) {
				const { payload: quickSendData }: ApiQuickSend = await dispatch<any>(
					quickSend(payload)
				);
				setIsLoader(false);
				if (quickSendData?.Status === apiStatus.SUCCESS) {
					setToastMessage(ToastMessages.CAMPAIGN_SEND_SUCCESS);
					setSelectedTestGroup([]);
					setRandomlyCount('');
				} else {
					if (quickSendData?.StatusCode === 10) {
						setDialogType({
							type: 'exceedDailyLimit'
						})
						setRandomlyCount('');
						if (
							quickSendData?.Data &&
							quickSendData?.Data?.NextAvailableTime &&
							quickSendData?.Data?.NextAvailableTime?.length > 0
						) {
							setNextMessageAvailable(quickSendData?.Data?.NextAvailableTime);
						}
					} else if (quickSendData?.StatusCode === WhatsappCampaignStatus.META_BUSINESS_NOTVERIFIED) {
						setToastMessage({
							...errorToastData,
							message: translator('whatsappCampaign.metaBusinessNotVerified')
						});
					} else if (quickSendData?.StatusCode === WhatsappCampaignStatus.META_PHONENUMBER_NOTVERIFIED) {
						setToastMessage({
							...errorToastData,
							message: translator('whatsappCampaign.metaPhoneNumberNotVerified')
						});
					} else {
						setRandomlyCount('');
						if (quickSendData?.Message === 'Invalid phonenumber') {
							setToastMessage(ToastMessages.INVALID_NUMBER);
						} else {
							setToastMessage({
								...ToastMessages.QUICK_SEND_ERROR,
								message:
									quickSendData?.Message ||
									ToastMessages.QUICK_SEND_ERROR?.message,
							});
						}
					}
				}
			} else {
				setIsLoader(false);
				setDialogType({
					type: 'validation'
				})
			}
		} else {
			setIsLoader(false);
		}
	};

	const onOkTestSending = async (selectedTestGroupDummy: testGroupDataProps[] = []) => {
		if (validateSaveCampaign(true)) {
			let campaignIdForTestSend: number = Number(campaignID) || 0;
			setIsLoader(true);
			const saveCampaign: any = await onSaveCampaign('testSend', false, false);
			campaignIdForTestSend = saveCampaign?.WACampaignId || 0;
			if (testSendSelection !== 'onecontact') {
				setIsLoader(true);
				const { payload: quickSendGroupsData }: SaveQuickSendGroups =
					await dispatch<any>(
						saveQuickSendGroups({
							WACampaignID: campaignIdForTestSend,
							TestGroupsIds: (selectedTestGroupDummy || selectedTestGroup)?.map((group) => group?.GroupID),
						})
					);
				if (quickSendGroupsData?.Status !== apiStatus.SUCCESS) {
					quickSendGroupsData?.Message
						? setToastMessage({
							...ToastMessages.ERROR,
							message: quickSendGroupsData?.Message,
						})
						: setToastMessage(ToastMessages.ERROR);
					return;
				}
			}
			if (campaignIdForTestSend) {
				if (!campaignID) {
					navigate(
						`${sitePrefix}whatsapp/campaign/edit/page1/${campaignIdForTestSend}`
					);
				}
				if (testSendSelection === 'onecontact') {
					onTestSend(true, campaignIdForTestSend);
				} else {
					if (campaignIdForTestSend) {
						setIsLoader(true);
						const { payload: campaignSummaryData }: ApiGetCampaignSummary =
							await dispatch<any>(
								getWhatsAppCampaignSummary(campaignIdForTestSend?.toString())
							);
						if (campaignSummaryData.Status === apiStatus.SUCCESS) {
							if (campaignSummaryData?.Data?.FinalCount > 0) {
								setCampaignSummary(campaignSummaryData?.Data);
								setNextMessageAvailable(
									campaignSummaryData?.Data?.NextAvailableTime
								);
								if (
									campaignSummaryData.Data.WhatsappTierID === 1 ||
									campaignSummaryData.Data.WhatsappTierID === 2 ||
									campaignSummaryData.Data.WhatsappTierID === 3
								) {
									if (campaignSummaryData?.Data?.WhatsappSmsLeft > 0) {
										setDialogType({
											type: 'summary'
										});
									} else {
										setDialogType({
											type: 'exceedDailyLimit'
										})
									}
								} else {
									setDialogType({
										type: 'summary'
									});
								}
							} else {
								setToastMessage({
									...ToastMessages.ERROR,
									message: translator('whatsappCampaign.noRecipient'),
								});
							}
						} else {
							campaignSummaryData?.Message
								? setToastMessage({
									...ToastMessages.ERROR,
									message: campaignSummaryData?.Message,
								})
								: setToastMessage(ToastMessages.ERROR);
						}
					}
				}
			}
			setIsLoader(false);
		} else {
			setDialogType({
				type: 'validation'
			})
		}
	};

	const onDynamcFieldModalSave = (
		updatedDynamicVariable: updatedVariable[]
	) => {
		setUpdatedDynamicVariableWithLinks(updatedDynamicVariable);
		setlinkCount(
			updatedDynamicVariable?.filter(
				(variable) => variable?.FieldTypeId === fieldNameIds?.LINK
			)?.length
		);
		setDialogType({});
	};

	const saveCampaignCall = async (callFrom: string = '') => {
		const savedTemplateData: savedTemplateListProps | undefined =
			savedTemplateList?.find(
				(template) => template.TemplateId === savedTemplate
			);
		const reqData: saveCampaignDataProps = {
			WACampaignID: Number(campaignID) || 0,
			TemplateId: savedTemplate,
			Variables: formatUpdatedDynamicVariable(updatedDynamicVariable),
			name: campaignName,
			fromnumber: from,
			IsTestCampaign:
				callFrom === 'send' || callFrom === 'save' ? false : isTestSend,
		};
		if (savedTemplateData && savedTemplateData?.Data?.types) {
			reqData.Variables = adjustTemplateVariablesForLink(
				savedTemplateData?.Data?.types,
				formatUpdatedDynamicVariable(updatedDynamicVariable),
				templateCategory === 3 ? `${authenticationMockTemplate[savedTemplateData.Language === 'en' ? authenticationTypes.AUTHENTICATIONEN : authenticationTypes.AUTHENTICATIONHEBREW].body}` : ''
			);
		}

		const { payload }: saveCampaignResponseProps = await dispatch<any>(
			saveCampaign(reqData)
		);
		return payload;
	};

	const onSaveCampaign = async (
		from: string = '',
		showSuccess: boolean = true,
		isNavigate: boolean = true,
		isExit: boolean = false
	) => {
		setDialogType(null);
		if (validateSaveCampaign(true)) {
			setIsLoader(true);
			const data: saveCampaignResponsePayloadProps = await saveCampaignCall(
				from
			);
			setIsLoader(false);
			if (data.Status === apiStatus.SUCCESS) {
				if (showSuccess) {
					setToastMessage(ToastMessages.SAVE_CAMPAIGN_SUCCESS);
				}
				if (isNavigate) {
					if (!FromAutomation) {
						navigate(
							`${sitePrefix}whatsapp/campaign/edit/page1/${data?.Data?.WACampaignId}`
						);
					} else {
						window.location.href = `/Pulseem/CreateAutomations.aspx?AutomationID=${FromAutomation}&NodeToEdit=${NodeToEdit}&fromreact=true&Culture=${isRTL ? 'he-IL' : 'en-US'}`
					}
				} else if (isExit) {
					onExitCampaign();
				}
				return data?.Data;
			} else {
				data?.Message
					? setToastMessage({ ...ToastMessages.ERROR, message: data?.Message })
					: setToastMessage(ToastMessages.ERROR);
				return null;
			}
		} else {
			setDialogType({
				type: 'validation'
			})
			return null;
		}
	};

	const onSubmit = async () => {
		if (validateSaveCampaign()) {
			setIsLoader(true);
			const data: saveCampaignResponsePayloadProps = await saveCampaignCall(
				'send'
			);
			setIsLoader(false);
			if (data.Status === apiStatus.SUCCESS) {
				navigate(
					`${sitePrefix}whatsapp/campaign/edit/page2/${data?.Data?.WACampaignId}?FromAutomation=${FromAutomation}&NodeToEdit=${NodeToEdit}&new=${isSendCampaign}`,
					{ state: { from: `edit/page1/${data?.Data?.WACampaignId}&new=${isSendCampaign}` } }
				);
			} else {
				data?.Message
					? setToastMessage({ ...ToastMessages.ERROR, message: data?.Message })
					: setToastMessage(ToastMessages.ERROR);
			}
		} else {
			setDialogType({
				type: 'validation'
			})
		}
	};

	const onFormButtonClick = (buttonName: string) => {
		switch (buttonName) {
			case buttons.SAVE:
				onSaveCampaign('save');
				break;
			case buttons.DELETE:
				setDialogType({
					type: 'delete'
				})
				break;
			case buttons.EXIT:
				setDialogType({
					type: 'exit'
				})
				break;
			case buttons.SEND:
				onSubmit();
				break;
			case buttons.CONTINUE:
				onSubmit();
				break;
			default:
				break;
		}
	};
	const onExitCampaign = () => {
		setDialogType(null);
		if (FromAutomation) {
			window.location.href = `/Pulseem/CreateAutomations.aspx?AutomationID=${FromAutomation}&NodeToEdit=${NodeToEdit}&fromreact=true&Culture=${isRTL ? 'he-IL' : 'en-US'}`
		} else {
			navigate(whatsappRoutes.CAMPAIGN_MANAGEMENT);
		}
	};

	const getExitDialog = () => ({
		title: translator('mainReport.handleExitTitle'),
		showDivider: false,
		content: (
			<Typography style={{ fontSize: 18 }} className={clsx(classes.textCenter)}>
				{translator('mainReport.leaveCampaign')}
			</Typography>
		),
		renderButtons: () => <ConfirmationButtons
			classes={classes}
			onConfirm={() => onSaveCampaign('save', true, false, true)}
			onCancel={() => onExitCampaign()}
		/>
	})

	const getDeleteDialog = () => ({
		title: translator('whatsappManagement.deleteCampaign'),
		showDivider: false,
		content: (
			<Typography style={{ fontSize: 18 }} className={clsx(classes.textCenter)}>
				{translator('whatsappManagement.deleteCampaignDesc')}
			</Typography>
		),
		renderButtons: () => <ConfirmationButtons
			classes={classes}
			onConfirm={() => onDeleteCampaign()}
			onCancel={() => setDialogType({ type: '', data: '' })}
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
			setDialogType({
				type: '',
				data: ''
			});
		}
	})

	const getTestGroupDialog = () => ({
		title: translator('whatsappCampaign.sendTitle'),
		showDivider: false,
		content: (
			<TestGroupModal
				classes={classes}
				onClose={() => {
					setDialogType(null);
					setSelectedTestGroupDummy(selectedTestGroup);
				}}
				title={translator('whatsappCampaign.sendTitle')}
				testGroupData={testGroups}
				selectedTestGroup={selectedTestGroupDummy}
				setSelectedTestGroup={(updatedSelectedGroup) =>
					setSelectedTestGroupDummy(updatedSelectedGroup)
				}
				onConfirmOrYes={() => onOkTestSending()}
			/>
		),
		customContainerStyle: classes.testGroupSending,
		onConfirm: async () => {
			setDialogType({
				type: '',
				data: ''
			});
			setSelectedTestGroup(selectedTestGroupDummy);
			onOkTestSending(selectedTestGroupDummy);
		},
		onClose: () => { setDialogType(null); setSelectedTestGroupDummy(selectedTestGroup); }
	})

	const getSummary = () => ({
		title: translator('whatsappCampaign.summary'),
		showDivider: false,
		showDefaultButtons: false,
		content: (
			<SummaryModal
				classes={classes}
				campaignName={''}
				fromNumber={''}
				onSummaryModalClose={() => setDialogType({ type: '' })}
				onConfirmOrYes={() => onTestSend(false, Number(campaignID || 0))}
				selectedGroups={selectedTestGroup}
				selectedFilterGroups={[]}
				selectedFilterCampaigns={[]}
				sendType={'1'}
				sendDate={null}
				sendTime={null}
				isSpecialDateBefore={false}
				daysBeforeAfter={''}
				specialDatedropDown={{}}
				spectialDateFieldID={'0'}
				campaignSummary={campaignSummary}
				randomlyCount={randomlyCount}
				setRandomlyCount={setRandomlyCount}
				resetRandomCount={() => setRandomlyCount('')}
			/>
		),
		onConfirm: async () => {
			setDialogType({
				type: '',
				data: ''
			});
		}
	})

	const getExceedDailyLimit = () => ({
		title: translator('settings.accountSettings.actDetails.fields.exceedLimitMpdalMessage'),
		showDivider: false,
		content: (
			<Typography style={{ fontSize: 18 }} className={clsx(classes.textCenter)}>
				{`${translator('settings.accountSettings.actDetails.fields.exceedLimitMpdalTimeMessage')}
					${campaignSummary?.NextAvailableTime
						? moment(campaignSummary?.NextAvailableTime).format(DateFormats.DATE_TIME_24)
						: moment().add(1, 'd').format(DateFormats.DATE_TIME_24)
					}`}
			</Typography>
		),
		onConfirm: async () => {
			setDialogType({
				type: '',
				data: ''
			});
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
				closeCallToAction={() => setDialogType({})}
				classes={classes}
				callToActionFieldRows={callToActionFieldRows}
				setCallToActionFieldRows={(data) => setCallToActionFieldRows(data)}
				phoneNumberField={phoneNumberField}
				websiteField={websiteField}
				addMore={() => { }}
				updateTemplateData={() => { }}
				isEditable={false}
				buttonType={buttonType}
				templateText={templateData.templateText}
			/>
		),
		onConfirm: async () => {
			setDialogType({
				type: '',
				data: ''
			});
		}
	})

	const getQuickReplyDialog = () => ({
		title: translator('whatsapp.quickReply.title'),
		showDivider: false,
		showDefaultButtons: false,
		contentStyle: classes.noPadding,
		paperStyle: classes.callToAction,
		content: (
			<QuickReply
				classes={classes}
				closeQuickReply={() => setDialogType({})}
				quickReplyButtons={quickReplyButtons}
				setQuickReplyButtons={() => { }}
				updateTemplateData={() => { }}
				templateButtons={templateData.templateButtons}
				isEditable={false}
			/>
		),
		onConfirm: async () => {
			setDialogType({
				type: '',
				data: ''
			});
		}
	})

	const getDynamicModalDialog = () => ({
		title: translator('whatsappCampaign.dfieldTitle'),
		showDivider: false,
		showDefaultButtons: false,
		contentStyle: classes.noPadding,
		content: (
			<DynamicModal
				classes={classes}
				onDynamcFieldModalClose={() => setDialogType({})}
				personalFields={personalFields}
				landingPageData={landingPages}
				dynamicModalVariable={dynamicModalVariable}
				onDynamcFieldModalSave={(updatedDynamicVariable) =>
					onDynamcFieldModalSave(updatedDynamicVariable)
				}
				dynamicVariable={updatedDynamicVariable}
				isTrackLink={isTrackLink}
				setIsTrackLink={setIsTrackLink}
				savedTemplate={savedTemplate}
				templateCategory={templateCategory}
			/>
		),
		onConfirm: async () => {
			setDialogType({
				type: '',
				data: ''
			});
		}
	})

	const renderDialog = () => {
		const { type } = dialogType || {}
		let currentDialog: any = {};
		if (type === 'exit') {
			currentDialog = getExitDialog();
		} else if (type === 'delete') {
			currentDialog = getDeleteDialog();
		} else if (type === 'validation') {
			currentDialog = getValidationDialog();
		} else if (type === 'testGroup') {
			currentDialog = getTestGroupDialog();
		} else if (type === 'exceedDailyLimit') {
			currentDialog = getExceedDailyLimit();
		} else if (type === 'summary') {
			currentDialog = getSummary();
		} else if (type === 'callToAction') {
			if (callToActionFieldRows?.length === 0) {
				setCallToActionFieldRows([initialFieldRow]);
			}
			currentDialog = getCallToAction();
		} else if (type === 'quickReply') {
			currentDialog = getQuickReplyDialog();
		} else if (type === 'dynamicModal') {
			currentDialog = getDynamicModalDialog();
		}

		if (type) {
			return (
				dialogType && <BaseDialog
					classes={classes}
					open={dialogType}
					onCancel={() => setDialogType({})}
					onClose={() => setDialogType({})}
					renderButtons={currentDialog?.renderButtons || null}
					{...currentDialog}>
					{currentDialog?.content}
				</BaseDialog>
			)
		}
	}

	const limitNotice = () => {
		return (
			<Grid item md={12} lg={12} className={classes.WhatsappCampainNotice}>
				<span style={{ lineHeight: '0' }}>
					{translator('whatsappCampaign.note1')}
				</span>

				<div className={classes.pt10}>
					{translator('whatsappCampaign.note2')}{' '}
					<>{translator('whatsappCampaign.checkLimit')}</>{' '}
					<a
						// href='https://business.facebook.com/settings/whatsapp-business-accounts/'
						href={FBBusiness}
						target='_blank'
						rel='noreferrer'
					>
						<>{translator('whatsappCampaign.here')}</>
					</a>
				</div>
			</Grid>
		)
	}

	return (
		<DefaultScreen
			subPage={'create'}
			currentPage='whatsapp'
			classes={classes}
			customPadding={true}
			containerClass={classes.editorCont}>
			{isAccountSetup ? (
				<>
					<Box className={"head"}>
						<Box className={'topSection'}>
							<Title
								Text={translator('whatsappCampaign.header')}
								classes={classes}
								subTitle={(windowSize === 'lg' || windowSize === 'md') && limitNotice()}
							/>
						</Box>
						<Box className={'containerBody'}>
							{(windowSize !== 'lg' && windowSize !== 'md') && limitNotice()}
							{renderToast()}
							<br />
							<form onSubmit={onSubmit}>
								<Grid container className={classes.WhatsappCampainP1}>
									<Grid
										className={classes.WhatsappCampainP1Left}
										item
										md={12}
										lg={6}>
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
													<div
														className={classes.whatsappCampainHighlightTextWrapper}
														style={{
															direction: getTextDirection(
																templateData.templateText,
																isRTL
															),
														}}>
														{/* @ts-ignore */}
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
															(
																button: quickReplyButtonProps | callToActionRowProps
															) =>
																button.fields.map(
																	(
																		field:
																			| quickReplyButtonsFieldProps
																			| callToActionFieldProps
																	) =>
																		(field.fieldName ===
																			'whatsapp.websiteButtonText' ||
																			field.fieldName ===
																			'whatsapp.phoneButtonText') && (
																			<Box
																				key={button.id}
																				className={
																					classes.whatsappCampaignActionButtonsBox
																				}>
																				<Button
																					className={classes.whatsappActionButtons}
																					onClick={() => setDialogType({ type: buttonType === 'quickReply' ? 'quickReply' : 'callToAction' })}
																				>
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

													<span
														className={clsx(
															classes.textInfoWrapper,
															`${templateTextCount > templateTextLimit &&
															'limit-exceed'
															}`
														)}>
														{isRTL && (
															<>
																{templateTextCount}/{templateTextLimit}&nbsp;
															</>
														)}
														<span className={classes.textInfo}>
															<>{translator('whatsappCampaign.char')}</>
														</span>
														{!isRTL && (
															<>
																&nbsp;{templateTextCount}/{templateTextLimit}
															</>
														)}
													</span>
												</Box>
											</Grid>
										</Grid>
									</Grid>
									<Grid
										className={classes.WhatsappCampainP1Right}
										item
										md={12}
										lg={6}>
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
													className={clsx(
														classes.switchDiv,
														classes.testSendWrapper
													)}>
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

												{
													isTestSend && (
														<Box
															className={clsx(classes.radio, classes.testSendRadio)}>
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
																		className={clsx(
																			classes.buttonField,
																			classes.success
																		)}
																		disabled={testSendSelection !== 'onecontact'}
																		onChange={(e: BaseSyntheticEvent) =>
																			setTestSendOneContact(
																				e.target.value
																					?.replace(/\D/g, '')
																					?.substr(0, 18)
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
																		className={clsx(classes.btn, classes.btnRounded)}
																		onClick={() => onOkTestSending()}>
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
																				<>
																					{translator('whatsappCampaign.testGroups')}
																				</>
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
																			>
																				{selectedTestGroup.length <= 0 && (
																					<div
																						onClick={() => setDialogType({ type: 'testGroup' })}
																					>
																						{' '}
																						<>
																							{translator('mainReport.ChooseLinks')}
																						</>
																					</div>
																				)}
																				{selectedTestGroup.length > 0 ? (
																					<div className={classes.mappedGroup}>
																						{selectedTestGroup.map((item, index) => {
																							return (
																								<div
																									key={index}
																									className={
																										classes.selectedGroupsDiv
																									}>
																									<span className={classes.nameGroup}>
																										{item.GroupName}
																									</span>
																									<RiCloseFill
																										className={classes.groupCloseicn}
																										onClick={(event: any) => {
																											event?.preventDefault();
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
													)
												}
											</Grid >
										</Grid >
									</Grid >
								</Grid >
								<Grid container>
									<Buttons
										displayBackButton={false}
										classes={classes}
										onFormButtonClick={(buttonName: string) =>
											onFormButtonClick(buttonName)
										}
										showSendButton={FromAutomation ? (!!FromAutomation && !!isSendCampaign) : true}
										showContinueButton={FromAutomation ? (!!FromAutomation && !isSendCampaign) : false}
									/>
								</Grid>
							</form >
						</Box >
					</Box >
				</>
			) : (
				!isLoader && <NoSetup classes={classes} />
			)}
			{renderDialog()}
			<Loader isOpen={isLoader} showBackdrop={true} />
		</DefaultScreen >
	);
};

export default SaveCampain;