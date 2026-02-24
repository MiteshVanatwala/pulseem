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
import { BaseSyntheticEvent, useEffect, useState, useCallback } from 'react';
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
	editChatAgent,
	getWhatsappChatTag,
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
	WhatsappAgent,
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
import {
	Box,
	Button,
	FormControl,
	Grid,
	Link,
	TextField,
	Typography,
} from '@material-ui/core';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import { SelectChangeEvent } from '@mui/material';
import { DateFormats, TierFeatures } from '../../../helpers/Constants';
import { setIsLoader } from '../../../redux/reducers/coreSlice';
import { getCookie, setCookie } from '../../../helpers/Functions/cookies';
import { MdSupportAgent } from 'react-icons/md';
import { logout } from '../../../helpers/Api/PulseemReactAPI';
import { StateType } from '../../../Models/StateTypes';
import {
	compareLastNineDigits,
	normalizePhoneForSearch,
} from '../../../helpers/Utils/TextHelper';
import { BsTrash } from 'react-icons/bs';
import ConfirmDeletePopUp from '../../Groups/Management/Popup/ConfirmDeletePopUp';
import { findPlanByFeatureCode } from '../../../redux/reducers/TiersSlice';
import TierPlans from '../../../components/TierPlans/TierPlans';
import { get } from 'lodash';

const WhatsappChat = ({ classes }: WhatsappChatProps) => {
	const navigate = useNavigate();
	const ToastMessages = useSelector(
		(state: { whatsapp: { ToastMessages: toastProps } }) =>
			state.whatsapp.ToastMessages,
	);
	const SubAccountSettings = useSelector(
		(state: {
			common: { accountSettings: { SubAccountSettings: SubAccountSettings } };
		}) => state.common?.accountSettings?.SubAccountSettings,
	);
	const { subAccount } = useSelector((state: any) => state.common);
	const {
		isRTL,
		windowSize,
		isLoader = false,
	} = useSelector((state: { core: coreProps }) => state.core);
	const { agentList } = useSelector((state: StateType) => state.whatsapp);
	const { currentPlan, availablePlans } = useSelector(
		(state: any) => state.tiers,
	);
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
	const [totalContacts, setTotalContacts] = useState<number>(0);
	const [totalOpenContacts, setTotalOpenContacts] = useState<number>(0);
	const [totalPendingContacts, setTotalPendingContacts] = useState<number>(0);
	const [totalSolvedContacts, setTotalSolvedContacts] = useState<number>(0);
	const [activePhoneNumber, setActivePhoneNumber] = useState<string>('');
	const [filterBySelected, setFilterBySelected] = useState(0);
	const [agentSelected, setAgentSelected] = useState(
		Number(getCookie('whatsappSelectedAgentId') || 0),
	);
	const [whatsappChatSession, setWhatsappChatSession] =
		useState<APIWhatsappChatSessionData>({
			IsIn24Window: false,
			ExpiryTime: '',
			Hour: '0',
			Minute: '0',
			Second: '0',
			IsNewMessage: false,
		});

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
	const [TierMessageCode, setTierMessageCode] = useState<string>('');
	const [dynamicVariable, setDynamicVariable] = useState<string[]>([]);
	const [updatedDynamicVariable, setUpdatedDynamicVariable] = useState<
		updatedVariable[]
	>([]);
	const [agentModel, setAgentModel] = useState<WhatsappAgent>({
		AgentId: 0,
		Name: '',
		IsDeleted: false,
	});
	const [allAgents, setAllAgents] = useState<WhatsappAgent[]>(agentList);
	const [showConfirmDeleteAgent, setShowConfirmDeleteAgent] =
		useState<number>(0);
	const [tagsList, setTagsList] = useState<any[]>([]);

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
		{},
	);
	const [landingPages, setLandingPages] = useState<landingPageDataProps[]>([]);
	const [phoneNumbersList, setPhoneNumbersList] = useState<string[]>([]);
	const [dynamicModalVariable, setDynamicModalVariable] = useState<number>(0);

	const [contactsPaginationSetting, setContactsPaginationSetting] =
		useState<ContactsPaginationSetting>({
			PageNo: 1,
			PageSize: 10,
			hasMore: true,
		});

	const setWhatsappChatCoversationStatus = useCallback(
		async (StatusId: number, Sendernumber: string, ClientNumber: string) => {
			// Find the contact's current status for optimistic update
			const contact = sideChatContacts?.find(
				(c) => c?.PhoneNumber === ClientNumber,
			);
			const oldStatusId = contact?.ConversationStatusId || 0;

			// Store original values for rollback if needed
			const originalTotalOpen = totalOpenContacts;
			const originalTotalPending = totalPendingContacts;
			const originalTotalSolved = totalSolvedContacts;
			const originalActiveChatContacts = activeChatContacts;
			const originalSideChatContacts = sideChatContacts;

			// Optimistically update counts before API call
			if (oldStatusId !== StatusId) {
				// Decrement old status count
				if (oldStatusId === 1) {
					setTotalOpenContacts((prev) => prev - 1);
				} else if (oldStatusId === 2) {
					setTotalPendingContacts((prev) => prev - 1);
				} else if (oldStatusId === 3) {
					setTotalSolvedContacts((prev) => prev - 1);
				}

				// Increment new status count
				if (StatusId === 1) {
					setTotalOpenContacts((prev) => prev + 1);
				} else if (StatusId === 2) {
					setTotalPendingContacts((prev) => prev + 1);
				} else if (StatusId === 3) {
					setTotalSolvedContacts((prev) => prev + 1);
				}
			}

			// Optimistically update UI
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

			// Make API call without loader
			const whatsAppChatConversationStatusData: APIWhatsappChatConversationStatusData =
				await dispatch<any>(
					manageWhatsappChatCoversationStatus({
						ClientNumber,
						Sendernumber,
						StatusId,
					}),
				);

			if (
				whatsAppChatConversationStatusData?.payload?.Status !==
				apiStatus.SUCCESS
			) {
				// Rollback on failure
				setTotalOpenContacts(originalTotalOpen);
				setTotalPendingContacts(originalTotalPending);
				setTotalSolvedContacts(originalTotalSolved);
				setActiveChatContacts(originalActiveChatContacts);
				setSideChatContacts(originalSideChatContacts);

				whatsAppChatConversationStatusData?.payload?.Message
					? setToastMessage({
							...ToastMessages.ERROR,
							message: whatsAppChatConversationStatusData?.payload?.Message,
						})
					: setToastMessage(ToastMessages.ERROR);
			}
		},
		[
			dispatch,
			activeChatContacts,
			sideChatContacts,
			totalOpenContacts,
			totalPendingContacts,
			totalSolvedContacts,
			ToastMessages,
		],
	);

	const handleUserStatus = useCallback(
		(e: SelectChangeEvent, ClientNumber: string) => {
			e.preventDefault();
			e.stopPropagation();

			setWhatsappChatCoversationStatus(
				Number(e.target.value),
				activePhoneNumber,
				ClientNumber,
			);
		},
		[activePhoneNumber, setWhatsappChatCoversationStatus],
	);

	const setAPIInboundChatStatus = useCallback(async () => {
		if (activeChatContacts && activeChatContacts?.PhoneNumber?.length > 0) {
			const { payload: whatsAppChatSessionStatus }: APIWhatsappChatSession =
				await dispatch<any>(
					getInboundWhatsappChatStatus({
						activePhoneNumber: activePhoneNumber,
						activeUserNumber: activeChatContacts.PhoneNumber,
					}),
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
	}, [activeChatContacts, activePhoneNumber, dispatch, ToastMessages]);

	const setAPIWhatsAppChatContacts = useCallback(
		async (activeUser: string, isInitial: boolean = false) => {
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
				agentSelected > 0
					? getWhatsappChatContactsByAgent({
							AgentId: agentSelected,
							IsPagination: true,
							pageNo: contactsPaginationSetting?.PageNo,
							pageSize: contactsPaginationSetting?.PageSize,
							ChatStatus: filterBySelected,
							Searchtext: '',
						})
					: getWhatsappChatContactsByPhoneNumber({
							PhoneNumber: activeUser,
							IsPagination: true,
							pageNo: contactsPaginationSetting?.PageNo,
							pageSize: contactsPaginationSetting?.PageSize,
							ChatStatus: filterBySelected,
						}),
			);

			dispatch(setIsLoader(false));
			if (whatsAppChatContactsData?.Status === apiStatus.SUCCESS) {
				const contactData = whatsAppChatContactsData.Data.Items;
				const updatedActiveChat = contactData[0];
				// Update total contacts data
				setTotalContacts(whatsAppChatContactsData?.Data?.TotalRecord || 0);
				setTotalOpenContacts(whatsAppChatContactsData?.Data?.TotalOpen || 0);
				setTotalPendingContacts(
					whatsAppChatContactsData?.Data?.TotalPending || 0,
				);
				setTotalSolvedContacts(
					whatsAppChatContactsData?.Data?.TotalSolved || 0,
				);
				if (contactID) {
					const activeContact = contactData?.find(
						(contact) => contact?.PhoneNumber === contactID,
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
						type: 'tier',
					});
				}
				setContactsPaginationSetting({
					...contactsPaginationSetting,
					hasMore: false,
					PageNo: 1,
				});
				setSideChatContacts([]);
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		},
		[
			activeChatContacts.PhoneNumber,
			contactID,
			agentSelected,
			filterBySelected,
			dispatch,
			navigate,
		],
	);

	const getPhoneNumber = useCallback(async () => {
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
	}, [
		dispatch,
		ToastMessages,
		contactsPaginationSetting,
		setAPIWhatsAppChatContacts,
	]);

	const getAgents = useCallback(async () => {
		const response: any = await dispatch<any>(getChatAgents());
		const agents: WhatsappAgent[] = response?.payload?.Data as any;
		setAllAgents(agents);
	}, [dispatch]);

	const getTags = useCallback(async () => {
		const response: any = await dispatch<any>(getWhatsappChatTag());
		if (response?.payload?.Status === apiStatus.SUCCESS) {
			setTagsList(response?.payload?.Data || []);
		}
	}, [dispatch]);

	const onActiveUserChange = useCallback(
		(e: SelectChangeEvent) => {
			setActivePhoneNumber(e.target.value?.replace(/\D/g, ''));
			setAPIWhatsAppChatContacts(e.target.value?.replace(/\D/g, ''));
		},
		[setAPIWhatsAppChatContacts],
	);

	const getStatusClass = useCallback((status: number) => {
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
	}, []);

	const getDynamicModalValues = useCallback(async () => {
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
		const [{ payload: personalFieldData }, { payload: landingPageData }]: [
			personalFieldAPIProps,
			landingPageAPIProps,
		] = await Promise.all([
			dispatch<any>(getAccountExtraData()),
			dispatch<any>(getPreviousLandingData()),
		]);

		setLandingPages(landingPageData);
		setpersonalFields({ ...staticPersonalField, ...personalFieldData });
	}, [dispatch, translator]);
	const getSavedTemplateFields = useCallback(async () => {
		let savedTemplate: savedTemplateAPIProps = await dispatch<any>(
			getSavedTemplates({ templateStatus: 3 }),
		);
		setSavedTemplateList(savedTemplate?.payload?.Data?.Items);
	}, [dispatch]);

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
				/**
				 * Load all initial data in parallel for better performance
				 */
				if (!personalFields || landingPages?.length <= 0) {
					await Promise.all([
						getDynamicModalValues(),
						getSavedTemplateFields(),
						getAgents(),
						getTags(),
						getPhoneNumber(),
					]);
				} else {
					await Promise.all([
						getSavedTemplateFields(),
						getAgents(),
						getTags(),
						getPhoneNumber(),
					]);
				}
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
			3000,
		);
		return () => clearInterval(ChatStatusTimer);
	}, [setAPIInboundChatStatus]);

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

	const onChoose = useCallback(
		(template: savedTemplateListProps, templateText: string | null) => {
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
				getDynamicFields(templatePreviewData?.templateData?.templateText),
			);
			if (templatePreviewData?.buttonType === buttonTypes.QUICK_REPLY) {
				setQuickReplyButtons(templatePreviewData?.templateData.templateButtons);
			} else {
				setCallToActionFieldRows(
					templatePreviewData?.templateData.templateButtons,
				);
			}
			if (templateData?.variables) {
				setDynamicFieldCount(Object.keys(templateData?.variables)?.length);
			}
		},
		[],
	);

	const setUpdatedDynamicVariableWithLinks = useCallback(
		(variable: updatedVariable[]) => {
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
		},
		[SubAccountSettings],
	);

	const onDynamcFieldModalSave = useCallback(
		(updatedDynamicVariable: updatedVariable[]) => {
			setUpdatedDynamicVariableWithLinks(updatedDynamicVariable);
			setDialogType({});
		},
		[setUpdatedDynamicVariableWithLinks],
	);

	const changeContactReadStatus = useCallback(
		(
			contacts: APIWhatsappChatSidebarContactsItemsData,
			sideChatContactList: APIWhatsappChatSidebarContactsItemsData[] = sideChatContacts,
		) => {
			const updatedSideChatContacts = sideChatContactList?.map(
				(sideChatContact) => {
					if (sideChatContact?.PhoneNumber === contacts?.PhoneNumber) {
						return { ...sideChatContact, Unread: 0 };
					}
					return sideChatContact;
				},
			);
			setSideChatContacts(updatedSideChatContacts);
		},
		[sideChatContacts],
	);

	const handleChatId = useCallback(
		(
			e: BaseSyntheticEvent,
			contacts: APIWhatsappChatSidebarContactsItemsData,
		) => {
			setActiveChatContacts(contacts);
			changeContactReadStatus(contacts);
		},
		[changeContactReadStatus],
	);

	const handleTagsUpdated = useCallback(
		(phoneNumber: string, tagIds: number[], tags?: any[]) => {
			// Update the activeChatContacts with new tags if it's the current contact
			if (activeChatContacts?.PhoneNumber === phoneNumber && tags) {
				setActiveChatContacts((prev) => ({
					...prev,
					Tags: [...tags],
				}));
			}
			// Also update sideChatContacts to reflect the new tags
			setSideChatContacts((prev) =>
				prev.map((contact) =>
					contact.PhoneNumber === phoneNumber
						? { ...contact, Tags: tags ? [...tags] : contact.Tags }
						: contact,
				),
			);
		},
		[activeChatContacts?.PhoneNumber],
	);

	const handleTagColorUpdated = useCallback(
		(tagId: string, newColor: string) => {
			console.log('📥 handleTagColorUpdated received:', { tagId, newColor });
			// Update all contacts that have this tag with the new color
			setSideChatContacts((prev) => {
				console.log('📋 Updating sideChatContacts, count:', prev.length);
				return prev.map((contact) => {
					if (contact.Tags && contact.Tags.length > 0) {
						const hasTag = contact.Tags.some(tag => tag.id === tagId);
						if (hasTag) {
							const updatedTags = contact.Tags.map((tag) =>
								tag.id === tagId ? { ...tag, TagColor: newColor } : tag,
							);
							return { ...contact, Tags: updatedTags };
						}
					}
					return contact;
				});
			});

			// Update activeChatContacts if it has this tag
			setActiveChatContacts((prev) => {
				if (prev?.Tags && prev.Tags.length > 0) {
					const hasTag = prev.Tags.some(tag => tag.id === tagId);
					if (hasTag) {
						console.log('📌 Updating activeChatContacts');
						const updatedTags = prev.Tags.map((tag) =>
							tag.id === tagId ? { ...tag, TagColor: newColor } : tag,
						);
						return { ...prev, Tags: updatedTags };
					}
				}
				return prev;
			});
		},
		[],
	);

	const validateDynamicVaraiable = useCallback(() => {
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
				type: 'validation',
			});
		}
		return isValidated;
	}, [savedTemplate, newMessage, updatedDynamicVariable, translator]);

	const updateContactList = useCallback(async () => {
		if (!sideChatContacts?.length || sideChatContacts.length === 0) {
			return false;
		}
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
			}),
		);
		if (
			whatsAppChatContactsData?.Status === apiStatus?.SUCCESS &&
			whatsAppChatContactsData?.Data?.Items?.length > 0
		) {
			// Update total contacts data
			// setTotalContacts(whatsAppChatContactsData?.Data?.TotalRecord || 0);
			// setTotalOpenContacts(whatsAppChatContactsData?.Data?.TotalOpen || 0);
			// setTotalPendingContacts(whatsAppChatContactsData?.Data?.TotalPending || 0);
			// setTotalSolvedContacts(whatsAppChatContactsData?.Data?.TotalSolved || 0);
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
				type: 'tier',
			});
		}
		return false;
	}, [
		sideChatContacts,
		dispatch,
		activePhoneNumber,
		activeChatContacts,
		filterBySelected,
		changeContactReadStatus,
	]);

	const onChatSend = useCallback(async () => {
		if (validateDynamicVaraiable()) {
			let chatReqPayload: APISendWhatsAppChatReqPayload = {
				FromNumber: activePhoneNumber,
				ToNumber: activeChatContacts?.PhoneNumber,
				IsFreeFormChat: savedTemplate?.length === 0 ? true : false,
			};
			if (savedTemplate?.length > 0) {
				chatReqPayload.TemplateId = savedTemplate;
				chatReqPayload.Variables = formatUpdatedDynamicVariable(
					updatedDynamicVariable,
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
				// updateContactList();
			} else {
				if (sendWhatsappChat.StatusCode === 112) {
					setDialogType({
						type: 'exceedDailyLimit',
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
						type: 'tier',
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
	}, [
		validateDynamicVaraiable,
		activePhoneNumber,
		activeChatContacts,
		savedTemplate,
		updatedDynamicVariable,
		newMessage,
		dispatch,
		allWhatsappChat,
		updateContactList,
		ToastMessages,
	]);

	const resetToast = useCallback(() => {
		setToastMessage(resetToastData);
	}, []);

	const renderToast = useCallback(() => {
		if (toastMessage) {
			setTimeout(() => {
				resetToast();
			}, 4000);
			return <Toast data={toastMessage} />;
		}
		return null;
	}, [toastMessage, resetToast]);

	const fetchMoreContacts = useCallback(
		async (
			searchText: string,
			ChatStatus: number = filterBySelected,
			isPaginationReset: boolean = false,
			pageSize: number = contactsPaginationSetting.PageSize,
			pageNumber?: number,
			isInfiniteScroll: boolean = false,
			startDate?: string,
			endDate?: string,
			agentIds?: number[],
			tagIds?: number[],
			startTime?: string,
			endTime?: string,
		) => {
			if (activePhoneNumber && activePhoneNumber?.length > 0) {
				if (isPaginationReset && !isInfiniteScroll) {
					dispatch(setIsLoader(true));
				}

				// Use normal pagination - backend handles all filtering (dates, agent, search)
				const effectivePageNo =
					pageNumber ||
					(isPaginationReset ? 1 : contactsPaginationSetting?.PageNo + 1);

				// Update pagination settings with new values
				const newPaginationSettings = {
					...contactsPaginationSetting,
					PageSize: pageSize,
					PageNo: effectivePageNo,
				};

				// Combine date and time for API payload
				let finalStartDate = '';
				let finalEndDate = '';
				if (startDate && startTime) {
					finalStartDate = `${startDate}T${startTime}:00`;
				}
				if (endDate && endTime) {
					finalEndDate = `${endDate}T${endTime}:00`;
				}

				console.log('📅 API Date Filter Debug:', {
					startDate,
					endDate,
					startTime,
					endTime,
					finalStartDate,
					finalEndDate,
					hasStartDate: !!finalStartDate,
					hasEndDate: !!finalEndDate,
				});

				// Use single API for all filtering - GetWhatsAppChatContacts
				const apiPayload: any = {
					PhoneNumber: activePhoneNumber,
					IsPagination: true,
					pageNo: newPaginationSettings.PageNo,
					pageSize: newPaginationSettings.PageSize,
					Searchtext: normalizePhoneForSearch(searchText),
					ChatStatus: ChatStatus,
				};

				// Only add date fields if they have values
				if (finalStartDate) {
					apiPayload.StartDate = finalStartDate;
				}
				if (finalEndDate) {
					apiPayload.EndDate = finalEndDate;
				}

				console.log('🚀 API Payload:', apiPayload);

				// Only add AgentIds and TagIds if they have values
				if (agentIds && agentIds.length > 0) {
					apiPayload.AgentIds = agentIds;
				}
				if (tagIds && tagIds.length > 0) {
					apiPayload.TagIds = tagIds;
				}

				const {
					payload: whatsAppChatContactsData,
				}: APIWhatsappChatSidebarContactsData = await dispatch<any>(
					getWhatsappChatContactsByPhoneNumber(apiPayload),
				);
				dispatch(setIsLoader(false));
				if (whatsAppChatContactsData?.Status === apiStatus.SUCCESS) {
					// Backend handles all filtering - use response data directly
					const items = whatsAppChatContactsData?.Data?.Items || [];

					// Update total contacts data from backend response
					setTotalContacts(whatsAppChatContactsData?.Data?.TotalRecord || 0);
					setTotalOpenContacts(whatsAppChatContactsData?.Data?.TotalOpen || 0);
					setTotalPendingContacts(
						whatsAppChatContactsData?.Data?.TotalPending || 0,
					);
					setTotalSolvedContacts(
						whatsAppChatContactsData?.Data?.TotalSolved || 0,
					);

					// Handle pagination based on backend response
					setContactsPaginationSetting({
						...newPaginationSettings,
						hasMore: isInfiniteScroll ? items.length >= pageSize : false,
					});

					if (isPaginationReset || pageNumber) {
						const listDivElement = document.getElementById('contact-list-div');
						if (listDivElement) {
							listDivElement.scrollTop = 0;
						}
						setSideChatContacts(items);
					} else if (isInfiniteScroll) {
						setSideChatContacts((prevContacts) => [...prevContacts, ...items]);
					} else {
						setSideChatContacts(items);
					}
				} else {
					if (whatsAppChatContactsData?.StatusCode === 927) {
						setTierMessageCode(whatsAppChatContactsData?.Message);
						setDialogType({
							type: 'tier',
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
		},
		[
			activePhoneNumber,
			filterBySelected,
			agentSelected,
			dispatch,
			contactsPaginationSetting,
		],
	);

	const updateFreeFormMessage = useCallback(
		(message: string) => {
			if (message !== newMessage) {
				setNewMessage(message);

				const freeFormDivElement = document.getElementById('free-from-input');
				if (freeFormDivElement) {
					freeFormDivElement.innerHTML = message;
				}
			}
		},
		[newMessage],
	);

	const onChatTemplateDelete = useCallback(() => {
		setButtonType('');
		setUpdatedDynamicVariable([]);
		setNewMessage('');
		setSavedTemplate('');
	}, []);

	const getExceedDailyLimit = useCallback(
		() => ({
			title: translator(
				'settings.accountSettings.actDetails.fields.exceedLimitMpdalMessage',
			),
			showDivider: false,
			content: (
				<Typography
					style={{ fontSize: 18 }}
					className={clsx(classes.textCenter)}
				>
					{`${translator(
						'settings.accountSettings.actDetails.fields.exceedLimitMpdalTimeMessage',
					)} ${
						nextMessageAvailable
							? moment(nextMessageAvailable).format(DateFormats.DATE_TIME_24)
							: moment().add(1, 'd').format(DateFormats.DATE_TIME_24)
					}`}
				</Typography>
			),
			onConfirm: async () => {
				setDialogType({
					type: '',
					data: '',
				});
			},
		}),
		[translator, classes, nextMessageAvailable],
	);

	const getValidationDialog = useCallback(
		() => ({
			title: translator('whatsappCampaign.sendValidation'),
			showDivider: false,
			content: (
				<ul className={clsx(classes.noMargin, classes.mb20)}>
					{groupSendValidationErrors?.map(
						(requiredField: string, index: number) => (
							<li key={index} className={classes.validationAlertModalLi}>
								{requiredField}
							</li>
						),
					)}
				</ul>
			),
			onConfirm: async () => {
				setDialogType({
					type: '',
					data: '',
				});
			},
		}),
		[translator, classes, groupSendValidationErrors],
	);

	const handleGetPlanForFeature = useCallback(
		(tierMessageCode: string) => {
			const planName = findPlanByFeatureCode(
				tierMessageCode,
				availablePlans,
				currentPlan.Id,
			);

			if (planName) {
				return translator('billing.tier.featureNotAvailable')
					.replace(
						'{feature}',
						translator(
							TierFeatures[tierMessageCode as keyof typeof TierFeatures] ||
								tierMessageCode,
						),
					)
					.replace('{planName}', planName);
			} else {
				return translator('billing.tier.noFeatureAvailable');
			}
		},
		[availablePlans, currentPlan, translator],
	);

	const getTierValidationDialog = useCallback(
		() => ({
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
					className={clsx(
						classes.dialogButtonsContainer,
						isRTL ? classes.rowReverse : null,
						!get(subAccount, 'CompanyAdmin', false) ? classes.dNone : '',
					)}
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
			),
		}),
		[
			translator,
			classes,
			TierMessageCode,
			handleGetPlanForFeature,
			isRTL,
			subAccount,
		],
	);

	const getDynamicModalDialog = useCallback(
		() => ({
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
					data: '',
				});
			},
		}),
		[
			translator,
			classes,
			personalFields,
			landingPages,
			dynamicModalVariable,
			onDynamcFieldModalSave,
			updatedDynamicVariable,
			isTrackLink,
			savedTemplate,
		],
	);

	const onAddAgent = useCallback(async () => {
		dispatch(setIsLoader(true));
		const response = (await dispatch(addChatAgent(agentModel.Name))) as any;
		switch (response?.payload?.StatusCode) {
			case 201: {
				getAgents();
				setToastMessage({
					...ToastMessages.AGENT_ADDED,
					message: ToastMessages.AGENT_ADDED?.message,
				});
				setDialogType({
					type: '',
					data: '',
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
			IsDeleted: false,
		});
	}, [dispatch, agentModel, getAgents, ToastMessages]);

	const onEditAgent = useCallback(
		async (agent: WhatsappAgent) => {
			dispatch(setIsLoader(true));
			const response = (await dispatch(editChatAgent(agent))) as any;
			switch (response?.payload?.StatusCode) {
				case 201: {
					getAgents();
					if (agent?.IsDeleted) {
						setToastMessage({
							...ToastMessages.AGENT_DELETED,
							message: ToastMessages.AGENT_DELETED?.message,
						});
					} else {
						setToastMessage({
							...ToastMessages.AGENT_UPDATED,
							message: ToastMessages.AGENT_UPDATED?.message,
						});
					}
					setDialogType({
						type: 'editAgents',
						data: '',
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
		},
		[dispatch, getAgents, ToastMessages],
	);

	const updateAgent = useCallback(
		(agentId: number, updatedData: Partial<WhatsappAgent>) => {
			setAllAgents((prevAgents) =>
				prevAgents.map((agent) =>
					agent.AgentId === agentId ? { ...agent, ...updatedData } : agent,
				),
			);
		},
		[],
	);

	const editAgentsModalDialog = useCallback(() => {
		return {
			title: translator('whatsappChat.editAgent'),
			showDivider: false,
			showDefaultButtons: false,
			style: { maxWidth: 640, margin: '0 auto' },
			icon: <MdSupportAgent />,
			content: (
				<Grid
					container
					alignItems="center"
					alignContent="center"
					style={{ marginBlockEnd: 60 }}
				>
					{allAgents?.map((agent: WhatsappAgent) => {
						return (
							<Grid
								container
								alignItems="center"
								alignContent="center"
								style={{ marginBottom: 25 }}
								key={agent.AgentId}
							>
								<Grid item xs={8}>
									<TextField
										label={translator('whatsappChat.agentName')}
										value={agent?.Name}
										className={clsx(
											classes.pl5,
											classes.pr10,
											classes.NoPaddingtextField,
											classes.textField,
											classes.w100,
										)}
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
								<Grid
									item
									alignContent="flex-end"
									alignItems="flex-end"
									xs={4}
									style={{ display: 'flex' }}
								>
									<Button
										className={clsx(classes.btn, classes.btnRounded)}
										style={{ marginInline: 20, marginBlockStart: 20 }}
										onClick={(e: any) => {
											onEditAgent({
												AgentId: agent.AgentId,
												Name: agent.Name,
												IsDeleted: false,
											});
										}}
									>
										{translator('common.Update')}
									</Button>
									<Box
										className={clsx(classes.dFlex, classes.flexAlignCetner)}
										style={{ marginBlockStart: 20 }}
									>
										<Link
											className={clsx('deleteShortcut')}
											style={{ cursor: 'pointer' }}
											title={translator('common.remove')}
											onClick={() => {
												setShowConfirmDeleteAgent(agent.AgentId);
											}}
										>
											<BsTrash
												className={'trash'}
												style={{
													fontSize: '20',
													marginLeft: '0 !important',
													marginRight: '0 !important',
												}}
											/>
										</Link>
									</Box>
								</Grid>
							</Grid>
						);
					})}
					<Box
						position={'absolute'}
						className={clsx(classes.flex, classes.stickBottom)}
						style={{ background: 'transparent', border: 'none' }}
					>
						<Box
							style={{
								width: '80%',
								margin: '0 auto',
								justifyContent: 'flex-end',
							}}
							className={clsx(classes.flex)}
						>
							<Button
								className={clsx(classes.btn, classes.btnRounded)}
								onClick={(e: BaseSyntheticEvent) => {
									setDialogType({ type: 'addAgent', data: null });
								}}
							>
								{translator('whatsappChat.addAgent')}
							</Button>
						</Box>
					</Box>
				</Grid>
			),
		};
	}, [translator, classes, allAgents, updateAgent, onEditAgent]);

	const addAgentModalDialog = useCallback(() => {
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
								className={clsx(
									classes.pl5,
									classes.pr10,
									classes.NoPaddingtextField,
									classes.textField,
									classes.w100,
								)}
								placeholder={translator('whatsappChat.agentName')}
								disabled={false}
								inputProps={{
									readOnly: false,
								}}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
									setAgentModel({ ...agentModel, Name: e.target.value });
								}}
							/>
							<div
								className={clsx(classes.flex, classes.flexEnd, classes.mt15)}
							>
								<Button
									className={clsx(classes.btn, classes.btnRounded)}
									style={{ alignSelf: 'center' }}
									onClick={onAddAgent}
								>
									{translator('whatsappChat.addAgent')}
								</Button>
							</div>
						</FormControl>
					</Grid>
				</Grid>
			),
			onConfirm: async () => {
				setDialogType({
					type: '',
					data: '',
				});
			},
		};
	}, [translator, classes, agentModel, onAddAgent]);

	const renderDialog = useCallback(() => {
		const { type } = dialogType || {};
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
				dialogType && (
					<BaseDialog
						classes={classes}
						open={dialogType}
						onCancel={() => setDialogType({})}
						onClose={() => setDialogType({})}
						renderButtons={currentDialog?.renderButtons || null}
						{...currentDialog}
					>
						{currentDialog?.content}
					</BaseDialog>
				)
			);
		}
	}, [
		dialogType,
		classes,
		getValidationDialog,
		getExceedDailyLimit,
		getTierValidationDialog,
		getDynamicModalDialog,
		addAgentModalDialog,
		editAgentsModalDialog,
	]);

	const handleAgentSelection = useCallback((value: number) => {
		setAgentSelected(value);
		setCookie('whatsappSelectedAgentId', value.toString());
	}, []);

	const getAgentByCellphone = useCallback(
		(targetCellphone: any) => {
			// First, iterate through all agents
			for (const agent of agentList) {
				// Check if this agent has any sessions with matching cellphone
				const matchingSession = agent.Sessions.find((session: any) =>
					compareLastNineDigits(session.Cellphone, targetCellphone),
				);

				// If we found a matching session, return this agent
				if (matchingSession) {
					return agent as WhatsappAgent;
				}
			}

			// If no matching agent is found, return null or undefined
			return {} as WhatsappAgent;
		},
		[agentList],
	);

	return (
		<>
			<DefaultScreen
				subPage={'chat'}
				currentPage="whatsapp"
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
									fetchSearchedContacts={(
										searchText: string,
										ChatStatus: number,
										isPaginationReset: boolean,
										startDate?: string,
										endDate?: string,
									) => {
										void fetchMoreContacts(
											searchText,
											ChatStatus,
											isPaginationReset,
											contactsPaginationSetting?.PageSize || 10,
											1,
											false,
											startDate,
											endDate,
										);
									}}
									isLoader={isLoader}
									filterBySelected={filterBySelected}
									setFilterBySelected={setFilterBySelected}
									setAgentSelected={handleAgentSelection}
									selectedAgent={agentSelected}
									onAddAgent={() => {
										setDialogType({ type: 'addAgent', data: null });
									}}
									onEditAgents={() => {
										getAgents();
										setDialogType({ type: 'editAgents' });
									}}
									onTagsUpdated={handleTagsUpdated}
									onTagColorUpdated={handleTagColorUpdated}
									tagsList={tagsList}
								TotalRecord={totalContacts}
									TotalOpen={totalOpenContacts}
									TotalPending={totalPendingContacts}
									TotalSolved={totalSolvedContacts}
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
									setIsDynamcFieldModal={() =>
										setDialogType({ type: 'dynamicModal' })
									}
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
									selectedAgent={getAgentByCellphone(
										activeChatContacts.PhoneNumber,
									)}
									ToastMessages={ToastMessages}
									tagsList={tagsList}
									onTagsUpdated={handleTagsUpdated}
								/>
							</div>
						</div>
					</>
				)}
				{isAccountSetup === false && !isLoader && <NoSetup classes={classes} />}
				{renderDialog()}
				<ConfirmDeletePopUp
					classes={classes}
					isOpen={showConfirmDeleteAgent > 0}
					onClose={() => {
						setShowConfirmDeleteAgent(0);
					}}
					onCancel={() => {
						setShowConfirmDeleteAgent(0);
					}}
					windowSize={windowSize}
					title={translator('whatsappChat.deleteAgent')}
					text={translator('whatsappChat.confirmDeleteAgent')}
					handleDeleteGroup={() => {
						const agentToDelete = allAgents.filter((agent: WhatsappAgent) => {
							return agent.AgentId === showConfirmDeleteAgent;
						})[0];
						if (agentToDelete) {
							dispatch(setIsLoader(true));
							onEditAgent({
								AgentId: agentToDelete.AgentId,
								Name: agentToDelete.Name,
								IsDeleted: true,
							});
							setShowConfirmDeleteAgent(0);
							dispatch(setIsLoader(false));
						}
					}}
				/>
				{showTierPlans && (
					<TierPlans
						classes={classes}
						isOpen={showTierPlans}
						onClose={() => setShowTierPlans(false)}
					/>
				)}
			</DefaultScreen>
		</>
	);
};

export default WhatsappChat;
