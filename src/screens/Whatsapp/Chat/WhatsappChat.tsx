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
import { Loader } from '../../../components/Loader/Loader';
import { useNavigate, useParams } from 'react-router-dom';
import Toast from '../../../components/Toast/Toast.component';
import NoSetup from '../NoSetup/NoSetup';
import moment from 'moment';
import { Typography } from '@material-ui/core';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import { SelectChangeEvent } from '@mui/material';
import { DateFormats } from '../../../helpers/Constants';

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
	const { isRTL } = useSelector((state: { core: coreProps }) => state.core);
	const [isAccountSetup, setIsAccountSetup] = useState<boolean | null>(null);
	const [isLoader, setIsLoader] = useState<boolean>(true);
	const [isTrackLink, setIsTrackLink] = useState<boolean>(false);
	const [nextMessageAvailable, setNextMessageAvailable] = useState<string>('');
	const [dialogType, setDialogType] = useState<any>({});
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
	const [dynamicVariable, setDynamicVariable] = useState<string[]>([]);
	const [updatedDynamicVariable, setUpdatedDynamicVariable] = useState<
		updatedVariable[]
	>([]);

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
		(async () => {
			setIsLoader(true);
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
				setIsLoader(true);
				await getPhoneNumber();
				setIsAccountSetup(true);
			} else {
				setIsLoader(false);
				setIsAccountSetup(false);
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
		setIsLoader(true);
		const whatsAppChatConversationStatusData: APIWhatsappChatConversationStatusData =
			await dispatch<any>(
				manageWhatsappChatCoversationStatus({
					ClientNumber,
					Sendernumber,
					StatusId,
				})
			);
		setIsLoader(false);
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
		setIsLoader(true);
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
		const whatsAppChatContactsData: APIWhatsappChatSidebarContactsData =
			await dispatch<any>(
				getWhatsappChatContactsByPhoneNumber({
					PhoneNumber: activeUser,
					IsPagination: true,
					pageNo: contactsPaginationSetting?.PageNo,
					pageSize: contactsPaginationSetting?.PageSize,
					ChatStatus: filterBySelected,
				})
			);
		setIsLoader(false);
		if (whatsAppChatContactsData.payload.Status === apiStatus.SUCCESS) {
			const contactData = whatsAppChatContactsData.payload.Data.Items;
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
			setAPIWhatsAppChatContacts(phoneNumberData?.Data[0], true);
			setPhoneNumbersList(phoneNumberData?.Data);
			return phoneNumberData?.Data;
		} else {
			setIsLoader(false);
			setToastMessage(ToastMessages.ERROR);
			setContactsPaginationSetting({
				...contactsPaginationSetting,
				hasMore: false,
			});
		}
		setPhoneNumbersList([]);
		return [];
	};

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
			setIsLoader(true);
			const { payload: sendWhatsappChat }: APISendWhatsappChat =
				await dispatch<any>(sendWhatsAppMessage(chatReqPayload));
			setIsLoader(false);
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
				setIsLoader(true);
			}
			const {
				payload: whatsAppChatContactsData,
			}: APIWhatsappChatSidebarContactsData = await dispatch<any>(
				getWhatsappChatContactsByPhoneNumber({
					PhoneNumber: activePhoneNumber,
					IsPagination: true,
					pageNo: isPaginationReset ? 1 : contactsPaginationSetting?.PageNo + 1,
					pageSize: contactsPaginationSetting?.PageSize,
					Searchtext: searchText,
					ChatStatus: ChatStatus,
				})
			);
			setIsLoader(false);
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
				if (whatsAppChatContactsData?.Message === 'No Data Found') {
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

	const renderDialog = () => {
		const { type } = dialogType || {}
		let currentDialog: any = {};
		if (type === 'validation') {
			currentDialog = getValidationDialog();
		} else if (type === 'exceedDailyLimit') {
			currentDialog = getExceedDailyLimit();
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

	return (
		<>
			<DefaultScreen
				subPage={'chat'}
				currentPage='whatsapp'
				classes={classes}
				customPadding={false}
				containerClass={clsx(classes.mb75)}
			>
				{isAccountSetup ? (
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
								/>
							</div>
						</div>
					</>
				) : (
					!isLoader && <NoSetup classes={classes} />
				)}
				{renderDialog()}
				<Loader isOpen={isLoader} showBackdrop={true} />
			</DefaultScreen >
		</>
	);
};

export default WhatsappChat;
