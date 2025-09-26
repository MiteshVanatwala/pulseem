import ChatUi from './Component/ChatUi';
import SideBar from './Component/SideBar';
import './css/index.css';
import clsx from 'clsx';
import DefaultScreen from '../../DefaultScreen';
import {
	APIWhatsappChatConversationStatusData,
	APIWhatsappChatSessionData,
	APIWhatsappChatSession,
	APIWhatsappChatSidebarContactsItemsData,
	APIWhatsappChatSidebarContactsData,
	WhatsappChatProps,
	APISendWhatsappChat,
	APISendWhatsAppChatReqPayload,
	APIWhatsappChatItemsData,
	ContactsPaginationSetting,
} from './Types/WhatsappChat.type';
import { BaseSyntheticEvent, useEffect, useState } from 'react';
import {
	callToActionProps,
	quickReplyButtonProps,
	savedTemplateAPIProps,
	savedTemplateDataProps,
	savedTemplateListProps,
	templateDataProps,
	templatePreviewDataProps,
	toastProps,
} from '../Editor/Types/WhatsappCreator.types';
import { useDispatch, useSelector } from 'react-redux';
import {
	getInboundWhatsappChatStatus,
	getSavedTemplates,
	getWhatsappChatContactsByPhoneNumber,
	getWhatsappChatContactsByUserNumber,
	manageWhatsappChatCoversationStatus,
	sendWhatsAppMessage,
	userPhoneNumbers,
	getChatAgents,
	getWhatsappChatContactsByAgent,
	addChatAgent,
	editChatAgent
} from '../../../redux/reducers/whatsappSlice';
import { useTranslation } from 'react-i18next';
import uniqid from 'uniqid';
import {
	checkSiteTrackingLink,
	formatUpdatedDynamicVariable,
	getDynamicFields,
	getTemplatePreviewData,
} from '../Common';
import {
	coreProps,
	landingPageAPIProps,
	landingPageDataProps,
	personalFieldAPIProps,
	personalFieldDataProps,
	phoneNumberAPIProps,
	SubAccountSettings,
	updatedVariable,
	WhatsappAgent
} from '../Campaign/Types/WhatsappCampaign.types';
import DynamicModal from '../Campaign/Popups/DynamicModal';
import {
	getAccountExtraData,
	getPreviousLandingData,
} from '../../../redux/reducers/smsSlice';
import {
	apiStatus,
	buttonTypes,
	fieldNameIds,
	resetToastData,
	whatsappChatStatuses,
	whatsappRoutes,
} from '../Constant';
import { useNavigate, useParams } from 'react-router-dom';
import Toast from '../../../components/Toast/Toast.component';
import NoSetup from '../NoSetup/NoSetup';
import moment from 'moment';
import { Box, Button, FormControl, Grid, Link, TextField, Typography } from '@material-ui/core';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import { SelectChangeEvent } from '@mui/material';
import { DateFormats, TierFeatures } from '../../../helpers/Constants';
import { setIsLoader } from '../../../redux/reducers/coreSlice';
import { getCookie, setCookie } from '../../../helpers/Functions/cookies';
import { MdSupportAgent } from 'react-icons/md';
import { logout } from '../../../helpers/Api/PulseemReactAPI';
import { StateType } from '../../../Models/StateTypes';
import { compareLastNineDigits } from '../../../helpers/Utils/TextHelper';
import { BsTrash } from 'react-icons/bs';
import ConfirmDeletePopUp from '../../Groups/Management/Popup/ConfirmDeletePopUp';
import { findPlanByFeatureCode } from '../../../redux/reducers/TiersSlice';
import TierPlans from '../../../components/TierPlans/TierPlans';

const WhatsappChat = ({ classes }: WhatsappChatProps) => {
	const navigate = useNavigate();
	const ToastMessages = useSelector(
		(state: { whatsapp: { ToastMessages: toastProps } }) =>
			state.whatsapp.ToastMessages
	);
	const SubAccountSettings = useSelector(
		(state: {
			common: { accountSettings: { SubAccountSettings: SubAccountSettings } };
		}) => state.common?.accountSettings?.SubAccountSettings
	);
	const { isRTL, windowSize, isLoader = false } = useSelector((state: { core: coreProps }) => state.core);
	const { agentList } = useSelector((state: StateType) => state.whatsapp);
	const { currentPlan, availablePlans } = useSelector((state: any) => state.tiers);
	const [isAccountSetup, setIsAccountSetup] = useState<boolean | null>(null);
	const [isTrackLink, setIsTrackLink] = useState<boolean>(false);
	const [nextMessageAvailable, setNextMessageAvailable] = useState<string>('');
	const [dialogType, setDialogType] = useState<any>({});
	const [showTierPlans, setShowTierPlans] = useState(false);
	const [activeChatContacts, setActiveChatContacts] =
		useState<APIWhatsappChatSidebarContactsItemsData>({
			ConversationStatusId: 0,
			IsTemplate: false,
			IsUnsubscribed: false,
			LastMessage: '',
			LastMessageDate: '',
			PhoneNumber: '',
			Unread: 0,
			UserName: '',
		});
	const [sideChatContacts, setSideChatContacts] = useState<
		APIWhatsappChatSidebarContactsItemsData[]
	>([]);
	const [activePhoneNumber, setActivePhoneNumber] = useState<string>('');
	const [filterBySelected, setFilterBySelected] = useState(0);
	const [agentSelected, setAgentSelected] = useState(Number(getCookie('whatsappSelectedAgentId') || 0));
	const [whatsappChatSession, setWhatsappChatSession] =
		useState<APIWhatsappChatSessionData>({
			IsIn24Window: false,
			ExpiryTime: '',
			Hour: '0',
			Minute: '0',
			Second: '0',
			IsNewMessage: false,
		});

	const handleUserStatus = (e: SelectChangeEvent, ClientNumber: string) => {
		e.preventDefault();
		e.stopPropagation();

		setWhatsappChatCoversationStatus(
			Number(e.target.value),
			activePhoneNumber,
			ClientNumber
		);
	};

	const { t: translator } = useTranslation();
	const dispatch = useDispatch();
	const { contactID } = useParams();
	const [isMobileSideBar, setIsMobileSideBar] = useState<boolean>(false);
	const [isTemplateModal, setIsTemplateModal] = useState<boolean>(false);
	const [newMessage, setNewMessage] = useState<string>('');
	const [savedTemplateList, setSavedTemplateList] = useState<
		savedTemplateListProps[]
	>([]);
	const [groupSendValidationErrors, setGroupSendValidationErrors] = useState<
		string[]
	>([]);
	const [allWhatsappChat, setAllWhatsappChat] =
		useState<APIWhatsappChatItemsData>();
	const [toastMessage, setToastMessage] =
		useState<toastProps['SUCCESS']>(resetToastData);
	const [savedTemplate, setSavedTemplate] = useState<string>('');
	const [fileData, setFileData] = useState<{
		fileType: string;
		fileLink: string;
	}>({
		fileType: '',
		fileLink: '',
	});
	const [buttonType, setButtonType] = useState<string>('');
	const [templateData, setTemplateData] = useState<templateDataProps>({
		templateText: '',
		templateButtons: [],
	});
	const [TierMessageCode, setTierMessageCode] = useState<string>("");
	const [dynamicVariable, setDynamicVariable] = useState<string[]>([]);
	const [updatedDynamicVariable, setUpdatedDynamicVariable] = useState<
		updatedVariable[]
	>([]);
	const [agentModel, setAgentModel] = useState<WhatsappAgent>({
		AgentId: 0,
		Name: '',
		IsDeleted: false
	})
	const [allAgents, setAllAgents] = useState<WhatsappAgent[]>(agentList);
	const [showConfirmDeleteAgent, setShowConfirmDeleteAgent] = useState<number>(0);

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
	const [quickReplyButtons, setQuickReplyButtons] = useState<
		quickReplyButtonProps[]
	>(initialQuickReplyButtons);
	const [callToActionFieldRows, setCallToActionFieldRows] =
		useState<callToActionProps>([initialFieldRow]);
	const [dynamicFieldCount, setDynamicFieldCount] = useState<number>(0);
	const [personalFields, setpersonalFields] = useState<personalFieldDataProps>(
		{}
	);
	const [landingPages, setLandingPages] = useState<landingPageDataProps[]>([]);
	const [phoneNumbersList, setPhoneNumbersList] = useState<string[]>([]);
	const [dynamicModalVariable, setDynamicModalVariable] = useState<number>(0);

	const [contactsPaginationSetting, setContactsPaginationSetting] =
		useState<ContactsPaginationSetting>({
			PageNo: 1,
			PageSize: 20,
			hasMore: true,
		});

	useEffect(() => {
		dispatch(setIsLoader(true));
		(async () => {
			const { payload: phoneNumberData }: phoneNumberAPIProps =
				await dispatch<any>(userPhoneNumbers());
			if (
				phoneNumberData?.Status === apiStatus.SUCCESS &&
				phoneNumberData?.Data &&
				phoneNumberData?.Data?.length > 0
			) {
				if (!personalFields || landingPages?.length <= 0) {
					getDynamicModalValues();
				}
				getSavedTemplateFields();
				await getAgents();
				await getPhoneNumber();
				setIsAccountSetup(true);
			} else {
				setIsAccountSetup(false);
				dispatch(setIsLoader(false));
			}
		})();
		/**
		 * we disable it because we want to run this code only when component loads
		 */
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		/**
		 * This will check that is current user is allowed to send freeform message
		 * or not every 3 second.
		 */
		let ChatStatusTimer = setInterval(
			async () => await setAPIInboundChatStatus(),
			3000
		);
		return () => clearInterval(ChatStatusTimer);
	});

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

	const setWhatsappChatCoversationStatus = async (
		StatusId: number,
		Sendernumber: string,
		ClientNumber: string
	) => {
		dispatch(setIsLoader(true));
		const whatsAppChatConversationStatusData: APIWhatsappChatConversationStatusData =
			await dispatch<any>(
				manageWhatsappChatCoversationStatus({
					ClientNumber,
					Sendernumber,
					StatusId,
				})
			);
		dispatch(setIsLoader(false));
		if (
			whatsAppChatConversationStatusData?.payload?.Status === apiStatus.SUCCESS
		) {
			if (activeChatContacts?.PhoneNumber === ClientNumber) {
				setActiveChatContacts({
					...activeChatContacts,
					ConversationStatusId: StatusId,
				});
			}
			const updatedSideChatContacts = sideChatContacts?.map((contact) => {
				if (contact?.PhoneNumber === ClientNumber) {
					return { ...contact, ConversationStatusId: StatusId };
				}
				return contact;
			});
			setSideChatContacts(updatedSideChatContacts);
		} else {
			whatsAppChatConversationStatusData?.payload?.Message
				? setToastMessage({
					...ToastMessages.ERROR,
					message: whatsAppChatConversationStatusData?.payload?.Message,
				})
				: setToastMessage(ToastMessages.ERROR);
		}
	};

	const setAPIInboundChatStatus = async () => {
		if (activeChatContacts && activeChatContacts?.PhoneNumber?.length > 0) {
			const { payload: whatsAppChatSessionStatus }: APIWhatsappChatSession =
				await dispatch<any>(
					getInboundWhatsappChatStatus({
						activePhoneNumber: activePhoneNumber,
						activeUserNumber: activeChatContacts.PhoneNumber,
					})
				);
			if (whatsAppChatSessionStatus?.Status === apiStatus.SUCCESS) {
				setWhatsappChatSession(whatsAppChatSessionStatus?.Data);
			} else {
				setWhatsappChatSession({
					IsIn24Window: false,
					ExpiryTime: '',
					Hour: '0',
					Minute: '0',
					Second: '0',
					IsNewMessage: false,
				});
				whatsAppChatSessionStatus?.Message
					? setToastMessage({
						...ToastMessages.ERROR,
						message: whatsAppChatSessionStatus?.Message,
					})
					: setToastMessage(ToastMessages.ERROR);
			}
		}
	};

	const setAPIWhatsAppChatContacts = async (
		activeUser: string,
		isInitial: boolean = false
	) => {
		if (!isInitial) {
			setSideChatContacts([]);
			setActiveChatContacts({
				ConversationStatusId: 0,
				IsTemplate: false,
				IsUnsubscribed: false,
				LastMessage: '',
				LastMessageDate: '',
				PhoneNumber: '',
				Unread: 0,
				UserName: '',
			});
			setAllWhatsappChat(undefined);
			navigate(whatsappRoutes.CHAT);
		}
		setActivePhoneNumber(activeUser);

		const {
			payload: whatsAppChatContactsData,
		}: APIWhatsappChatSidebarContactsData = await dispatch<any>(
			agentSelected > 0 ? getWhatsappChatContactsByAgent({
				AgentId: agentSelected,
				IsPagination: true,
				pageNo: contactsPaginationSetting?.PageNo,
				pageSize: contactsPaginationSetting?.PageSize,
				ChatStatus: filterBySelected,
				Searchtext: ''
			}) :
				getWhatsappChatContactsByPhoneNumber({
					PhoneNumber: activeUser,
					IsPagination: true,
					pageNo: contactsPaginationSetting?.PageNo,
					pageSize: contactsPaginationSetting?.PageSize,
					ChatStatus: filterBySelected
				})
		);

		dispatch(setIsLoader(false));
		if (whatsAppChatContactsData?.Status === apiStatus.SUCCESS) {
			const contactData = whatsAppChatContactsData.Data.Items;
			const updatedActiveChat = contactData[0];
			if (contactID) {
				const activeContact = contactData?.find(
					(contact) => contact?.PhoneNumber === contactID
				);
				if (activeContact) {
					setActiveChatContacts(activeContact);
					navigate(`/react/whatsapp/chat/${activeContact?.PhoneNumber}`);
					changeContactReadStatus(activeContact, contactData);
				}
			} else {
				if (activeChatContacts?.PhoneNumber === '' && updatedActiveChat) {
					setActiveChatContacts(updatedActiveChat);
					navigate(`/react/whatsapp/chat/${updatedActiveChat?.PhoneNumber}`);
					changeContactReadStatus(updatedActiveChat, contactData);
				}
			}
			if (contactData?.length < contactsPaginationSetting.PageSize) {
				setContactsPaginationSetting({
					...contactsPaginationSetting,
					hasMore: false,
					PageNo: 1,
				});
			} else {
				setContactsPaginationSetting({
					...contactsPaginationSetting,
					hasMore: true,
					PageNo: 1,
				});
			}
		} else {
			if (whatsAppChatContactsData?.StatusCode === 927) {
				// WHATSAPP_CHAT_INTERFACE
				setTierMessageCode(whatsAppChatContactsData?.Message);
				setDialogType({
					type: 'tier'
				});
			}
			setContactsPaginationSetting({
				...contactsPaginationSetting,
				hasMore: false,
				PageNo: 1,
			});
			setSideChatContacts([]);
		}
	};

	const getPhoneNumber = async () => {
		const { payload: phoneNumberData }: phoneNumberAPIProps =
			await dispatch<any>(userPhoneNumbers());
		if (phoneNumberData?.Data?.length > 0) {
			setActivePhoneNumber(phoneNumberData?.Data[0]);
			await setAPIWhatsAppChatContacts(phoneNumberData?.Data[0], true);
			setPhoneNumbersList(phoneNumberData?.Data);
			return phoneNumberData?.Data;
		} else {
			dispatch(setIsLoader(false));
			setToastMessage(ToastMessages.ERROR);
			setContactsPaginationSetting({
				...contactsPaginationSetting,
				hasMore: false,
			});
		}
		setPhoneNumbersList([]);
		return [];
	};

	const getAgents = async () => {
		const response: any = await dispatch<any>(getChatAgents());
		const agents: WhatsappAgent[] = response?.payload?.Data as any;
		setAllAgents(agents)
	}

	const onActiveUserChange = (e: SelectChangeEvent) => {
		setActivePhoneNumber(e.target.value?.replace(/\D/g, ''));
		setAPIWhatsAppChatContacts(e.target.value?.replace(/\D/g, ''));
	};

	const getStatusClass = (status: number) => {
		switch (status) {
			case 1:
				return whatsappChatStatuses.OPEN;
			case 2:
				return whatsappChatStatuses.PENDING;
			case 3:
				return whatsappChatStatuses.SOLVED;

			default:
				break;
		}
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
	const getSavedTemplateFields = async () => {
		let savedTemplate: savedTemplateAPIProps = await dispatch<any>(
			getSavedTemplates({ templateStatus: 3 })
		);
		setSavedTemplateList(savedTemplate?.payload?.Data?.Items);
	};
	const onChoose = (
		template: savedTemplateListProps,
		templateText: string | null
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
		setUpdatedDynamicVariable([]);
		setNewMessage(templateText || '');
		setIsTemplateModal(false);
		setSavedTemplate(template?.TemplateId);
		const templateData: savedTemplateDataProps = template?.Data;
		if (templateData) {
			templatePreviewData = getTemplatePreviewData(templateData?.types);
		}
		setFileData(templatePreviewData?.fileData);
		setButtonType(templatePreviewData?.buttonType);
		setTemplateData(templatePreviewData?.templateData);
		setDynamicVariable(
			getDynamicFields(templatePreviewData?.templateData?.templateText)
		);
		if (templatePreviewData?.buttonType === buttonTypes.QUICK_REPLY) {
			setQuickReplyButtons(templatePreviewData?.templateData.templateButtons);
		} else {
			setCallToActionFieldRows(
				templatePreviewData?.templateData.templateButtons
			);
		}
		if (templateData?.variables) {
			setDynamicFieldCount(Object.keys(templateData?.variables)?.length);
		}
	};

	const setUpdatedDynamicVariableWithLinks = (variable: updatedVariable[]) => {
		const updatedVariableWithSiteLink = variable?.map((variable) => {
			if (
				variable?.FieldTypeId === fieldNameIds?.LINK &&
				variable?.IsStatastic
			) {
				if (
					checkSiteTrackingLink(SubAccountSettings, variable?.VariableValue)
				) {
					return {
						...variable,
						VariableValue: variable?.VariableValue.includes('?')
							? variable?.VariableValue + '&ref=##ClientIDEnc##'
							: variable?.VariableValue + '?ref=##ClientIDEnc##',
					};
				}
				return variable;
			}
			return variable;
		});
		setUpdatedDynamicVariable(updatedVariableWithSiteLink);
	};

	const onDynamcFieldModalSave = (
		updatedDynamicVariable: updatedVariable[]
	) => {
		setUpdatedDynamicVariableWithLinks(updatedDynamicVariable);
		setDialogType({});
	};

	const changeContactReadStatus = (
		contacts: APIWhatsappChatSidebarContactsItemsData,
		sideChatContactList: APIWhatsappChatSidebarContactsItemsData[] = sideChatContacts
	) => {
		const updatedSideChatContacts = sideChatContactList?.map(
			(sideChatContact) => {
				if (sideChatContact?.PhoneNumber === contacts?.PhoneNumber) {
					return { ...sideChatContact, Unread: 0 };
				}
				return sideChatContact;
			}
		);
		setSideChatContacts(updatedSideChatContacts);
	};

	const handleChatId = (
		e: BaseSyntheticEvent,
		contacts: APIWhatsappChatSidebarContactsItemsData
	) => {
		setActiveChatContacts(contacts);
		changeContactReadStatus(contacts);
	};

	const validateDynamicVaraiable = () => {
		let validationErrors = [];
		let isValidated = true;
		if (
			savedTemplate?.length > 0 &&
			getDynamicFields(newMessage)?.length !== updatedDynamicVariable?.length
		) {
			validationErrors.push(translator('whatsappChat.pleaseUpdate'));
			isValidated = false;
		}
		if (newMessage?.length === 0) {
			validationErrors.push('Message - required field');
			isValidated = false;
		}

		if (!isValidated) {
			setGroupSendValidationErrors(validationErrors);
			setDialogType({
				type: 'validation'
			});
		}
		return isValidated;
	};

	const updateContactList = async () => {
		if (sideChatContacts?.length > 0) {
			const {
				payload: whatsAppChatContactsData,
			}: APIWhatsappChatSidebarContactsData = await dispatch<any>(
				getWhatsappChatContactsByUserNumber({
					PhoneNumber: activePhoneNumber,
					IsPagination: false,
					pageNo: 1,
					pageSize: 6,
					UserNumber: activeChatContacts?.PhoneNumber,
					ChatStatus: filterBySelected,
				})
			);
			if (
				whatsAppChatContactsData?.Status === apiStatus?.SUCCESS &&
				whatsAppChatContactsData?.Data?.Items?.length > 0
			) {
				const updatedContacts = sideChatContacts?.map((contact) => {
					if (
						contact?.PhoneNumber ===
						whatsAppChatContactsData?.Data?.Items[0]?.PhoneNumber
					) {
						return whatsAppChatContactsData?.Data?.Items[0];
					}
					return contact;
				});

				changeContactReadStatus(activeChatContacts, updatedContacts);
			} else if (whatsAppChatContactsData?.StatusCode === 927) {
				setTierMessageCode(whatsAppChatContactsData?.Message);
				setDialogType({
					type: 'tier'
				});
			}
		}
	};

	const onChatSend = async () => {
		if (validateDynamicVaraiable()) {
			let chatReqPayload: APISendWhatsAppChatReqPayload = {
				FromNumber: activePhoneNumber,
				ToNumber: activeChatContacts?.PhoneNumber,
				IsFreeFormChat: savedTemplate?.length === 0 ? true : false,
			};
			if (savedTemplate?.length > 0) {
				chatReqPayload.TemplateId = savedTemplate;
				chatReqPayload.Variables = formatUpdatedDynamicVariable(
					updatedDynamicVariable
				);
			} else {
				chatReqPayload.TextMessage = newMessage;
				chatReqPayload.mediaUrl = '';
			}
			dispatch(setIsLoader(true));
			const { payload: sendWhatsappChat }: APISendWhatsappChat =
				await dispatch<any>(sendWhatsAppMessage(chatReqPayload));
			dispatch(setIsLoader(false));
			if (sendWhatsappChat?.Status === apiStatus?.SUCCESS) {
				const sentChat = sendWhatsappChat?.Data?.Data?.Items;
				if (allWhatsappChat && sentChat && sentChat?.TODAY?.length > 0) {
					if (Object?.keys(allWhatsappChat)?.includes('TODAY')) {
						setAllWhatsappChat({
							...allWhatsappChat,
							TODAY: [...allWhatsappChat?.TODAY, sentChat?.TODAY[0]],
						});
					} else {
						setAllWhatsappChat({
							...allWhatsappChat,
							TODAY: [sentChat?.TODAY[0]],
						});
					}
					setUpdatedDynamicVariable([]);
					setDynamicVariable([]);
					setNewMessage('');
					setSavedTemplate('');
					const inputElement = document.getElementById('free-from-input');
					if (inputElement && savedTemplate?.length === 0) {
						inputElement.innerText = '';
					}
				}

				// To update contact list
				updateContactList();
			} else {
				if (sendWhatsappChat.StatusCode === 112) {
					setDialogType({
						type: 'exceedDailyLimit'
					});
					// setNextMessageAvailable
					if (
						sendWhatsappChat?.Data &&
						sendWhatsappChat?.Data?.NextAvailableTime &&
						sendWhatsappChat?.Data?.NextAvailableTime?.length > 0
					) {
						setNextMessageAvailable(sendWhatsappChat?.Data?.NextAvailableTime);
					}
				} else if (sendWhatsappChat.StatusCode === 927) {
					// WHATSAPP_CAMPAIGN_SEND
					setTierMessageCode(sendWhatsappChat?.Message);
					setDialogType({
						type: 'tier'
					});
				} else {
					sendWhatsappChat?.Message
						? setToastMessage({
							...ToastMessages.ERROR,
							message: sendWhatsappChat?.Message,
						})
						: setToastMessage(ToastMessages.ERROR);
				}
			}
		}
	};

	const resetToast = () => {
		setToastMessage(resetToastData);
	};

	const renderToast = () => {
		if (toastMessage) {
			setTimeout(() => {
				resetToast();
			}, 4000);
			return <Toast data={toastMessage} />;
		}
		return null;
	};

	const fetchMoreContacts = async (
		searchText: string,
		ChatStatus: number = filterBySelected,
		isPaginationReset: boolean = false
	) => {
		if (activePhoneNumber && activePhoneNumber?.length > 0) {
			if (isPaginationReset) {
				dispatch(setIsLoader(true));
			}
			const {
				payload: whatsAppChatContactsData,
			}: APIWhatsappChatSidebarContactsData = await dispatch<any>(
				agentSelected > 0 ? getWhatsappChatContactsByAgent({
					AgentId: agentSelected,
					IsPagination: true,
					pageNo: isPaginationReset ? 1 : contactsPaginationSetting?.PageNo + 1,
					pageSize: contactsPaginationSetting?.PageSize,
					Searchtext: searchText,
					ChatStatus: ChatStatus,
				}) : getWhatsappChatContactsByPhoneNumber({
					PhoneNumber: activePhoneNumber,
					IsPagination: true,
					pageNo: isPaginationReset ? 1 : contactsPaginationSetting?.PageNo + 1,
					pageSize: contactsPaginationSetting?.PageSize,
					Searchtext: searchText,
					ChatStatus: ChatStatus,
				})
			);
			dispatch(setIsLoader(false));
			if (whatsAppChatContactsData?.Status === apiStatus.SUCCESS) {
				setContactsPaginationSetting({
					...contactsPaginationSetting,
					hasMore:
						whatsAppChatContactsData?.Data?.Items?.length <
							contactsPaginationSetting?.PageSize
							? false
							: true,
					PageNo: isPaginationReset ? 1 : contactsPaginationSetting?.PageNo + 1,
				});
				if (isPaginationReset) {
					const listDivElement = document.getElementById('contact-list-div');
					if (listDivElement) {
						listDivElement.scrollTop = 0;
					}
					setSideChatContacts(whatsAppChatContactsData?.Data?.Items);
				} else {
					setSideChatContacts([
						...sideChatContacts,
						...whatsAppChatContactsData?.Data?.Items,
					]);
				}
			} else {
				if (whatsAppChatContactsData?.StatusCode === 927) {
					setTierMessageCode(whatsAppChatContactsData?.Message);
					setDialogType({
						type: 'tier'
					});
				} else if (whatsAppChatContactsData?.Message === 'No Data Found') {
					setSideChatContacts([]);
					setContactsPaginationSetting({
						...contactsPaginationSetting,
						PageNo: 1,
						hasMore: false,
					});
				}
			}
		}
	};

	const updateFreeFormMessage = (message: string) => {
		if (message !== newMessage) {
			setNewMessage(message);

			const freeFormDivElement = document.getElementById('free-from-input');
			if (freeFormDivElement) {
				freeFormDivElement.innerHTML = message;
			}
		}
	};

	const onChatTemplateDelete = () => {
		setButtonType('');
		setUpdatedDynamicVariable([]);
		setNewMessage('');
		setSavedTemplate('');
	};

	const getExceedDailyLimit = () => ({
		title: translator('settings.accountSettings.actDetails.fields.exceedLimitMpdalMessage'),
		showDivider: false,
		content: (
			<Typography style={{ fontSize: 18 }} className={clsx(classes.textCenter)}>
				{`${translator(
					'settings.accountSettings.actDetails.fields.exceedLimitMpdalTimeMessage'
				)} ${nextMessageAvailable
					? moment(nextMessageAvailable).format(DateFormats.DATE_TIME_24)
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

	const handleGetPlanForFeature = (tierMessageCode: string) => {
		const planName = findPlanByFeatureCode(
			tierMessageCode,
			availablePlans,
			currentPlan.Id
		);
		
		if (planName) {
			return translator('billing.tier.featureNotAvailable').replace('{feature}', translator(TierFeatures[tierMessageCode as keyof typeof TierFeatures] || tierMessageCode)).replace('{planName}', planName);
		} else {
			return translator('billing.tier.noFeatureAvailable');
		}
	};

	const getTierValidationDialog = () => ({
		title: translator('billing.tier.permission'),
		showDivider: false,
		content: (
			<Typography style={{ textAlign: 'center' }}>
				{handleGetPlanForFeature(TierMessageCode)}
			</Typography>
		),
		renderButtons: () => (
			<Grid
				container
				spacing={2}
				className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null)}
			>
				<Grid item>
					<Button
						onClick={() => {
						setDialogType({ type: '', data: '' });
						setShowTierPlans(true);
					}}
					className={clsx(classes.btn, classes.btnRounded)}
					>
						{translator('billing.upgradePlan')}
					</Button>
				</Grid>
				<Grid item>
					<Button
						onClick={() => setDialogType({ type: '', data: '' })}
						className={clsx(classes.btn, classes.btnRounded)}
					>
						{translator('common.cancel')}
					</Button>
				</Grid>
			</Grid>
		)
	});

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
			/>
		),
		onConfirm: async () => {
			setDialogType({
				type: '',
				data: ''
			});
		}
	})

	const onAddAgent = async () => {
		dispatch(setIsLoader(true));
		const response = await dispatch(addChatAgent(agentModel.Name)) as any;
		switch (response?.payload?.StatusCode) {
			case 201: {
				getAgents();
				setToastMessage({
					...ToastMessages.AGENT_ADDED,
					message:
						ToastMessages.AGENT_ADDED?.message,
				});
				setDialogType({
					type: '',
					data: ''
				});
				break;
			}
			case 401: {
				logout();
				break;
			}
			case 404:
			case 500: {
				setToastMessage(ToastMessages.ERROR);
			}
		}
		dispatch(setIsLoader(false));
		setAgentModel({
			AgentId: 0,
			Name: '',
			IsDeleted: false
		});
	}

	const onEditAgent = async (agent: WhatsappAgent) => {
		dispatch(setIsLoader(true));
		const response = await dispatch(editChatAgent(agent)) as any;
		switch (response?.payload?.StatusCode) {
			case 201: {
				getAgents();
				if (agent?.IsDeleted) {
					setToastMessage({
						...ToastMessages.AGENT_DELETED,
						message:
							ToastMessages.AGENT_DELETED?.message,
					});
				}
				else {
					setToastMessage({
						...ToastMessages.AGENT_UPDATED,
						message:
							ToastMessages.AGENT_UPDATED?.message,
					});
				}
				setDialogType({
					type: 'editAgents',
					data: ''
				});
				break;
			}
			case 401: {
				logout();
				break;
			}
			case 404:
			case 500: {
				setToastMessage(ToastMessages.ERROR);
			}
		}
		dispatch(setIsLoader(false));
	}

	const updateAgent = (agentId: number, updatedData: Partial<WhatsappAgent>) => {
		setAllAgents(prevAgents =>
			prevAgents.map(agent =>
				agent.AgentId === agentId
					? { ...agent, ...updatedData }
					: agent
			)
		);
	};

	const editAgentsModalDialog = () => {
		return {
			title: translator('whatsappChat.editAgent'),
			showDivider: false,
			showDefaultButtons: false,
			style: { maxWidth: 640, margin: '0 auto' },
			icon: <MdSupportAgent />,
			content: (
				<Grid container alignItems='center' alignContent='center' style={{ marginBlockEnd: 60 }}>
					{allAgents?.map((agent: WhatsappAgent) => {
						return <Grid container alignItems='center' alignContent='center' style={{ marginBottom: 25 }}>
							<Grid item xs={8}>
								<TextField
									label={translator('whatsappChat.agentName')}
									value={agent?.Name}
									className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
									placeholder={translator('whatsappChat.agentName')}
									disabled={false}
									inputProps={{
										readOnly: false,
									}}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
										const newName = e.target.value;
										updateAgent(agent.AgentId, { Name: newName });
									}}
								/>
							</Grid>
							<Grid item alignContent='flex-end' alignItems='flex-end' xs={4} style={{ display: 'flex' }}>
								<Button
									className={clsx(classes.btn, classes.btnRounded)}
									style={{ marginInline: 20, marginBlockStart: 20 }}
									onClick={(e: any) => {
										onEditAgent({
											AgentId: agent.AgentId,
											Name: agent.Name,
											IsDeleted: false
										})
									}}>{translator('common.Update')}</Button>
								<Box className={clsx(classes.dFlex, classes.flexAlignCetner)} style={{ marginBlockStart: 20 }}>
									<Link
										className={clsx('deleteShortcut')} style={{ cursor: 'pointer' }}
										title={translator("common.remove")}
										onClick={() => {
											setShowConfirmDeleteAgent(agent.AgentId);
										}}
									>
										<BsTrash className={'trash'} style={{ fontSize: "20", marginLeft: '0 !important', marginRight: '0 !important' }} />
									</Link>
								</Box>
							</Grid>
						</Grid>
					})}
					<Box position={'absolute'} className={clsx(classes.flex, classes.stickBottom)} style={{ background: 'transparent', border: 'none' }}>
						<Box style={{ width: '80%', margin: '0 auto', justifyContent: 'flex-end' }} className={clsx(classes.flex)}>
							<Button
								className={clsx(classes.btn, classes.btnRounded)}
								onClick={(e: BaseSyntheticEvent) => {
									setDialogType({ type: 'addAgent', data: null })
								}}>{translator('whatsappChat.addAgent')}</Button>
						</Box>
					</Box>
				</Grid>
			)
		}
	}

	const addAgentModalDialog = () => {
		return {
			title: translator('whatsappChat.addAgent'),
			showDivider: false,
			showDefaultButtons: false,
			contentStyle: classes.noPadding,
			icon: <MdSupportAgent />,
			content: (
				<Grid container className={classes.w100}>
					<Grid item xs={12}>
						<FormControl className={classes.w100}>
							<TextField
								label={translator('whatsappChat.agentName')}
								value={agentModel.Name}
								className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
								placeholder={translator('whatsappChat.agentName')}
								disabled={false}
								inputProps={{
									readOnly: false,
								}}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
									setAgentModel({ ...agentModel, Name: e.target.value })
								}}
							/>
							<div className={clsx(classes.flex, classes.flexEnd, classes.mt15)}>
								<Button
									className={clsx(classes.btn, classes.btnRounded)}
									style={{ alignSelf: 'center' }}
									onClick={onAddAgent}>{translator('whatsappChat.addAgent')}</Button>
							</div>
						</FormControl>
					</Grid>
				</Grid>
			),
			onConfirm: async () => {
				setDialogType({
					type: '',
					data: ''
				});
			}
		};
	};


	const renderDialog = () => {
		const { type } = dialogType || {}
		let currentDialog: any = {};
		if (type === 'validation') {
			currentDialog = getValidationDialog();
		} else if (type === 'exceedDailyLimit') {
			currentDialog = getExceedDailyLimit();
		} else if (type === 'tier') {
			currentDialog = getTierValidationDialog();
		} else if (type === 'dynamicModal') {
			currentDialog = getDynamicModalDialog();
		} else if (type === 'addAgent') {
			currentDialog = addAgentModalDialog();
		} else if (type === 'editAgents') {
			currentDialog = editAgentsModalDialog();
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

	const handleAgentSelection = (value: number) => {
		setAgentSelected(value);
		setCookie('whatsappSelectedAgentId', value.toString());
	}

	const getAgentByCellphone = (targetCellphone: any) => {
		// First, iterate through all agents
		for (const agent of agentList) {
			// Check if this agent has any sessions with matching cellphone
			const matchingSession = agent.Sessions.find(
				(session: any) => compareLastNineDigits(session.Cellphone, targetCellphone)
			);

			// If we found a matching session, return this agent
			if (matchingSession) {
				return agent as WhatsappAgent;
			}
		}

		// If no matching agent is found, return null or undefined
		return {} as WhatsappAgent;
	};

	return (
		<>
			<DefaultScreen
				subPage={'chat'}
				currentPage='whatsapp'
				classes={classes}
				customPadding={false}
				containerClass={clsx(classes.mb75)}
			>
				{isAccountSetup === true && (
					<>
						{toastMessage?.message?.length > 0 && <>{renderToast()}</>}
						<div className={`${classes.whatsappChat} app`}>
							<div className={`${classes.whatsappChat} app-content`}>
								<SideBar
									isMobileSideBar={isMobileSideBar}
									classes={classes}
									setIsMobileSideBar={() =>
										setIsMobileSideBar(!isMobileSideBar)
									}
									handleChatId={handleChatId}
									activePhoneNumber={activePhoneNumber}
									setActiveUser={setActivePhoneNumber}
									onActiveUserChange={onActiveUserChange}
									sideChatContacts={sideChatContacts}
									phoneNumbersList={phoneNumbersList}
									handleUserStatus={handleUserStatus}
									getStatusClass={getStatusClass}
									chatContacts={activeChatContacts}
									fetchMoreContacts={fetchMoreContacts}
									contactsPaginationSetting={contactsPaginationSetting}
									fetchSearchedContacts={fetchMoreContacts}
									isLoader={isLoader}
									filterBySelected={filterBySelected}
									setFilterBySelected={setFilterBySelected}
									setAgentSelected={handleAgentSelection}
									selectedAgent={agentSelected}
									onAddAgent={() => {
										setDialogType({ type: 'addAgent', data: null })
									}}
									onEditAgents={() => {
										getAgents();
										setDialogType({ type: 'editAgents' })
									}}
								/>
								<ChatUi
									isMobileSideBar={isMobileSideBar}
									classes={classes}
									setIsMobileSideBar={() =>
										setIsMobileSideBar(!isMobileSideBar)
									}
									savedTemplateList={savedTemplateList}
									onChoose={(template, templateText) =>
										onChoose(template, templateText)
									}
									newMessage={newMessage}
									setNewMessage={updateFreeFormMessage}
									isTemplateModal={isTemplateModal}
									setIsTemplateModal={setIsTemplateModal}
									dynamicVariable={dynamicVariable}
									updatedDynamicVariable={updatedDynamicVariable}
									setIsDynamcFieldModal={() => setDialogType({ type: 'dynamicModal' })}
									setDynamicModalVariable={setDynamicModalVariable}
									savedTemplate={savedTemplate}
									chatContacts={activeChatContacts}
									activePhoneNumber={activePhoneNumber}
									ChatContacts={sideChatContacts}
									whatsappChatSession={whatsappChatSession}
									handleUserStatus={handleUserStatus}
									getStatusClass={getStatusClass}
									onChatSend={onChatSend}
									allWhatsappChat={allWhatsappChat}
									setAllWhatsappChat={setAllWhatsappChat}
									setAPIInboundChatStatus={setAPIInboundChatStatus}
									setWhatsappChatSession={setWhatsappChatSession}
									setUpdatedDynamicVariable={setUpdatedDynamicVariableWithLinks}
									setDynamicVariable={setDynamicVariable}
									setSavedTemplate={setSavedTemplate}
									activeChatContacts={activeChatContacts}
									isContactLoader={isLoader}
									updateContactList={updateContactList}
									personalFields={personalFields}
									onChatTemplateDelete={onChatTemplateDelete}
									setIsLoader={(value: boolean) => dispatch(setIsLoader(value))}
									selectedAgent={getAgentByCellphone(activeChatContacts.PhoneNumber)}
								/>
							</div>
						</div>
					</>
				)}
				{isAccountSetup === false && (
					!isLoader && <NoSetup classes={classes} />
				)}
				{renderDialog()}
				<ConfirmDeletePopUp
					classes={classes}
					isOpen={showConfirmDeleteAgent > 0}
					onClose={() => { setShowConfirmDeleteAgent(0) }}
					onCancel={() => { setShowConfirmDeleteAgent(0) }}
					windowSize={windowSize}
					title={translator('whatsappChat.deleteAgent')}
					text={translator('whatsappChat.confirmDeleteAgent')}
					handleDeleteGroup={() => {
						const agentToDelete = allAgents.filter((agent: WhatsappAgent) => { return agent.AgentId === showConfirmDeleteAgent })[0];
						if (agentToDelete) {
							dispatch(setIsLoader(true));
							onEditAgent({
								AgentId: agentToDelete.AgentId,
								Name: agentToDelete.Name,
								IsDeleted: true
							});
							setShowConfirmDeleteAgent(0)
							dispatch(setIsLoader(false));
						}
					}}
				/>
				{showTierPlans && <TierPlans
					classes={classes}
					isOpen={showTierPlans}
					onClose={() => setShowTierPlans(false)}
				/>}
			</DefaultScreen >
		</>
	);
};

export default WhatsappChat;
