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
import { BaseSyntheticEvent, useEffect, useState, useCallback, useMemo } from 'react';
import { flushSync } from 'react-dom';
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
	getWhatsappChat,
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
import { logout, PulseemReactInstance } from '../../../helpers/Api/PulseemReactAPI';
import { StateType } from '../../../Models/StateTypes';
import {
	compareLastNineDigits,
	normalizePhoneForSearch,
} from '../../../helpers/Utils/TextHelper';
import { BsTrash } from 'react-icons/bs';
import ConfirmDeletePopUp from '../../Groups/Management/Popup/ConfirmDeletePopUp';
import { findPlanByFeatureCode } from '../../../redux/reducers/TiersSlice';
import { ServiceChannel } from '../../Service/Conversations/ServiceChannelDropdown';
import { IConversation } from '../../../Models/Service/Conversation';
import { getConversations as getServiceConversations } from '../../../redux/reducers/conversationsSlice';
import TierPlans from '../../../components/TierPlans/TierPlans';
import { get } from 'lodash';

import { useRef } from 'react';
import { searchAllClients } from '../../../redux/reducers/clientSlice';

// ── Service (widget) conversations — PR-2455 ────────────────────────────────
// This inbox is shared between WhatsApp and site-widget chats. Widget rows are
// adapted into the same sidebar shape so one contact list can render both.

const svcHostOf = (c: IConversation): string => {
	if (c.domain) return c.domain;
	try { return c.pageUrl ? new URL(c.pageUrl).host : ''; } catch { return ''; }
};

const SVC_STATUS_ID: Record<string, number> = { new: 0, open: 1, resolved: 3, archived: 4 };

const adaptWidgetToSidebar = (list: IConversation[]): APIWhatsappChatSidebarContactsItemsData[] =>
	list.map((c) => ({
		ConversationStatusId: SVC_STATUS_ID[c.status] ?? 0,
		IsTemplate: false,
		IsUnsubscribed: false,
		LastMessage: c.lastMessage || '',
		LastMessageDate: c.lastActivityAt || '',
		PhoneNumber: c.id,
		Unread: 0,
		UserName: c.visitorName || `Visitor ${(c.visitorId || '').slice(-6)}`,
		channel: 'widget',
		conversationId: c.id,
		// Carried through so the chat header's agent picker can show the current
		// assignment; without these it would read as unassigned on every conversation.
		assignedAgentId: c.assignedAgentId ?? 0,
		assignedAgentName: c.assignedAgentName ?? null,
	} as APIWhatsappChatSidebarContactsItemsData));

const WhatsappChat = ({ classes }: WhatsappChatProps) => {
	const dispatch = useDispatch();

	// Ref to store PhoneNumber → ClientId mapping
	const phoneToClientIdMap = useRef<{ [phone: string]: number }>({});

	// Tracks the last RecentMsgDate we processed so we only act on genuinely new inbound messages
	const lastSeenRecentMsgDateRef = useRef<string>('');
	// Same idea as lastSeenRecentMsgDateRef, but for the currently-open contact's own sidebar row
	// (Q1/IsNewMessage), which the SP never surfaces through LastAllChatsMsgId since that field is
	// reserved for messages from OTHER contacts.
	const lastSeenActiveMsgDateRef = useRef<string>('');
	// Tracks the last RecentEchoMsgDate we processed so a business-sent echo (Q3) only triggers
	// one debounced contacts-list refresh, not one per poll while IsNewEcho stays true.
	const lastSeenEchoMsgDateRef = useRef<string>('');

	// Cursors for SP-level scan optimisation
	const lastCurrentChatMsgIdRef = useRef<number | null>(null); // last known msg Id from active contact
	const lastAllChatsMsgIdRef    = useRef<number | null>(null); // last known msg Id from any other contact
	// Q3 cursor: last known echo (message the business sent from the WhatsApp Business App)
	// for the active chat. Unlike the two above this is an ApiWhatsappSendLogs.ID, which is
	// global across every conversation — it MUST be reset on contact switch or a high cursor
	// carried over from another chat silently swallows this chat's echoes.
	const lastEchoMsgIdRef        = useRef<number | null>(null);

	// Debounce timer ref for the full contacts-list API refresh (5-second debounce)
	const contactsRefreshDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Always holds the latest fetchMoreContacts callback — avoids a forward-reference TS error
	const fetchMoreContactsRef = useRef<((searchText: string, ChatStatus: number, isPaginationReset: boolean) => void) | null>(null);
	// Always holds the latest setAPIInboundChatStatus callback so the polling loop below can call
	// it without depending on its identity — activeChatContacts (one of its deps) gets a new
	// object reference on unrelated updates (tag/status edits, sidebar refresh), and depending on
	// it directly would tear down and restart the poll loop mid-request, resetting the cursors below.
	const setAPIInboundChatStatusRef = useRef<(() => Promise<void>) | null>(null);
	// Set to true before a background sidebar refresh so fetchMoreContacts skips the global loader
	const suppressNextLoaderRef = useRef<boolean>(false);

	const activePhoneNumberRef = useRef<string>('');
	const filterBySelectedRef = useRef<number>(0);
	const agentAutoSelectedRef = useRef<boolean>(false);
	const userRolesRef = useRef<any>(null);
	const isAccountAdminRef = useRef<boolean>(false);
	const changeContactReadStatusRef = useRef<((contacts: APIWhatsappChatSidebarContactsItemsData, sideChatContactList?: APIWhatsappChatSidebarContactsItemsData[]) => void) | null>(null);
	const sideBarSearchTextRef = useRef<string>('');
    
	// Helper to build the mapping from all clients (Cellphone → ClientId)
	const buildPhoneToClientIdMap = useCallback(async () => {
		// Fetch all clients (up to 10,000 for mapping)
		const { payload } = await dispatch<any>(
			(searchAllClients as any)({ PageSize: 10000, PageIndex: 1 }),
		);
		if (payload && Array.isArray(payload.Clients)) {
			const map: { [phone: string]: number } = {};
			payload.Clients.forEach((client: any) => {
				if (client.Cellphone && (client.ClientId || client.ClientID)) {
					// Normalize phone for search (strip leading 0 for Israeli numbers)
					let norm = normalizePhoneForSearch(client.Cellphone);
					map[norm] = client.ClientId || client.ClientID;
				}
			});
			phoneToClientIdMap.current = map;
		}
	}, [dispatch]);
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
	const { isRTL, windowSize, isLoader = false, isOnlyWhatsAppChat } = useSelector((state: { core: coreProps }) => state.core);
	const { agentList } = useSelector((state: StateType) => state.whatsapp);
	const { userRoles, subUserObject } = useSelector((state: any) => state.core);
	const agentCookieKey = `whatsappSelectedAgentId_${subUserObject?.Data?.Emails?.[0]?.AuthValue || ''}`;
	const isAccountAdmin = !!(
		userRoles &&
		userRoles.AllowSend &&
		userRoles.AllowExport &&
		userRoles.AllowDelete &&
		!userRoles.HideRecipients
	);
	const { currentPlan, availablePlans } = useSelector(
		(state: any) => state.tiers,
	);
	const [isAccountSetup, setIsAccountSetup] = useState<boolean | null>(null);
	const [isTrackLink, setIsTrackLink] = useState<boolean>(false);
	const [nextMessageAvailable, setNextMessageAvailable] = useState<string>('');
	const [messageVolumeLimitInfo, setMessageVolumeLimitInfo] = useState<{ limit: number; current: number } | null>(null);
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

	// ── Service channel (PR-2455) ──────────────────────────────────────────
	// Opens on a specific channel when linked with ?channel=widget|all|whatsapp
	// (e.g. from the Service Dashboard "View Chats" action); defaults to WhatsApp
	// so nothing changes for anyone arriving the normal way.
	const [selectedChannel, setSelectedChannel] = useState<ServiceChannel>(() => {
		try {
			const ch = new URLSearchParams(window.location.search).get('channel');
			return ch === 'all' || ch === 'widget' || ch === 'whatsapp' ? ch : 'whatsapp';
		} catch {
			return 'whatsapp';
		}
	});
	const [widgetConversations, setWidgetConversations] = useState<IConversation[]>([]);
	const [serviceDomain, setServiceDomain] = useState<string>('');
	// All-mode source filter: 'all' | 'wa:<number>' | 'dom:<domain>'
	const [allSource, setAllSource] = useState<string>('all');

	// Memoized so they don't recompute on every render (polling / search keystrokes).
	const serviceDomains = useMemo(
		() => Array.from(new Set(widgetConversations.map(svcHostOf).filter(Boolean))),
		[widgetConversations],
	);
	const widgetSidebarContacts = useMemo(
		() =>
			adaptWidgetToSidebar(
				serviceDomain
					? widgetConversations.filter((c) => svcHostOf(c) === serviceDomain)
					: widgetConversations,
			),
		[widgetConversations, serviceDomain],
	);
	// "All" merges WhatsApp + widget rows, newest first (both share the sidebar shape).
	const allSidebarContacts = useMemo(
		() =>
			[...sideChatContacts, ...widgetSidebarContacts].sort(
				(a, b) =>
					new Date(b.LastMessageDate || 0).getTime() -
					new Date(a.LastMessageDate || 0).getTime(),
			),
		[sideChatContacts, widgetSidebarContacts],
	);
	// The list actually shown, per channel and (in All mode) the source filter.
	const displayedSidebarContacts = useMemo(() => {
		if (selectedChannel === 'widget') return widgetSidebarContacts;
		if (selectedChannel === 'all') {
			if (allSource.startsWith('wa:')) return sideChatContacts;
			if (allSource.startsWith('dom:')) return widgetSidebarContacts;
			return allSidebarContacts;
		}
		return sideChatContacts;
	}, [selectedChannel, allSource, sideChatContacts, widgetSidebarContacts, allSidebarContacts]);

	// Widget conversations are only fetched once the agent actually switches to a
	// channel that shows them — a WhatsApp-only user never pays for this call.
	//
	// Then it keeps polling, because nothing here listens on a socket: a visitor's
	// message would otherwise not reach the agent until they switched channels or
	// reloaded. Same shape as the WhatsApp inbound loop below — chained setTimeout
	// rather than setInterval, so a slow response cannot stack up requests.
	useEffect(() => {
		if (selectedChannel === 'whatsapp') return;

		let cancelled = false;
		let timer: ReturnType<typeof setTimeout> | null = null;

		const load = async () => {
			try {
				const res: any = await (dispatch as any)(getServiceConversations({
					status: 'all',
					search: '',
					agentId: null,
					channel: selectedChannel === 'widget' ? 'widget' : 'all',
				}));
				if (cancelled) return;
				const list: IConversation[] = res?.payload || [];
				setWidgetConversations(list);
				const domains = Array.from(new Set(list.map(svcHostOf).filter(Boolean)));
				setServiceDomain((prev) => prev || domains[0] || '');
			} catch {
				// A failed refresh must not kill the loop — the next tick retries.
			}
			if (!cancelled) timer = setTimeout(load, 5000);
		};

		load();

		return () => {
			cancelled = true;
			if (timer) clearTimeout(timer);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedChannel]);

	const [agentSelected, setAgentSelected] = useState(
		Number(getCookie(agentCookieKey) || 0),
	);
	const [whatsappChatSession, setWhatsappChatSession] =
		useState<APIWhatsappChatSessionData>({
			IsIn24Window: false,
			ExpiryTime: null,
			Hour: '0',
			Minute: '0',
			Second: '0',
			IsNewMessage: false,
			IsNewEcho: false,
		});

	const { t: translator } = useTranslation();
	const { contactID } = useParams();
	const [isMobileSideBar, setIsMobileSideBar] = useState<boolean>(
		typeof window !== 'undefined' && window.innerWidth <= 1024,
	);
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
	const [contactsPaginationSetting, setContactsPaginationSetting] =
		useState<ContactsPaginationSetting>({
			PageNo: 1,
			PageSize: 20,
			hasMore: true,
		});

	// Refs to capture current state values for status change logic
	const activeChatContactsRef = useRef<APIWhatsappChatSidebarContactsItemsData | null>(null);
	const sideChatContactsRef = useRef<APIWhatsappChatSidebarContactsItemsData[]>([]);
	const isNumberSwitchingRef = useRef<boolean>(false);
	const totalOpenContactsRef = useRef<number>(0);
	const totalPendingContactsRef = useRef<number>(0);
	const totalSolvedContactsRef = useRef<number>(0);
	const contactsPaginationSettingRef = useRef(contactsPaginationSetting);
	// Populated by SideBar so the mobile chat header can trigger its "New Chat"/"Edit Tags"
	// actions too, even though the sidebar itself is display:none while a chat is open on mobile.
	const mobileSideBarActionsRef = useRef<{ openNewChat: () => void; openEditTags: () => void }>({
		openNewChat: () => {},
		openEditTags: () => {},
	});

	useEffect(() => {
		activeChatContactsRef.current = activeChatContacts;
	}, [activeChatContacts]);

	useEffect(() => {
		totalOpenContactsRef.current = totalOpenContacts;
	}, [totalOpenContacts]);

	useEffect(() => {
		totalPendingContactsRef.current = totalPendingContacts;
	}, [totalPendingContacts]);

	useEffect(() => {
		if (isNumberSwitchingRef.current && !activeChatContacts?.PhoneNumber && sideChatContacts?.length > 0) {
			const firstContact = sideChatContacts[0];
			isNumberSwitchingRef.current = false;
			setActiveChatContacts(firstContact);
			navigate(`/react/whatsapp/chat/${firstContact?.PhoneNumber}`);
		}
	}, [sideChatContacts, activeChatContacts?.PhoneNumber, navigate]);

	useEffect(() => {
		totalSolvedContactsRef.current = totalSolvedContacts;
	}, [totalSolvedContacts]);

	useEffect(() => {
		activePhoneNumberRef.current = activePhoneNumber;
	}, [activePhoneNumber]);

	useEffect(() => {
		filterBySelectedRef.current = filterBySelected;
	}, [filterBySelected]);

	useEffect(() => {
		userRolesRef.current = userRoles;
	}, [userRoles]);

	useEffect(() => {
		isAccountAdminRef.current = isAccountAdmin;
	}, [isAccountAdmin]);

	useEffect(() => {
		contactsPaginationSettingRef.current = contactsPaginationSetting;
	}, [contactsPaginationSetting]);

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

	const setWhatsappChatCoversationStatus = useCallback(
		async (StatusId: number, Sendernumber: string, ClientNumber: string) => {
			const parsedStatusId = Number(StatusId);
			if (isNaN(parsedStatusId) || parsedStatusId < 1 || parsedStatusId > 3) {
				return;
			}

			const originalActiveChat = activeChatContacts;
			const originalSideContacts = sideChatContacts;
			const originalTotalOpen = totalOpenContacts;
			const originalTotalPending = totalPendingContacts;
			const originalTotalSolved = totalSolvedContacts;

			let oldStatusId = 0;
			let contactToUpdate: APIWhatsappChatSidebarContactsItemsData | null = null;
			
			if (originalActiveChat?.PhoneNumber === ClientNumber) {
				oldStatusId = originalActiveChat?.ConversationStatusId || 0;
				contactToUpdate = originalActiveChat;
			} else {
				const contact = originalSideContacts?.find(
					(c) => c?.PhoneNumber === ClientNumber,
				);
				oldStatusId = contact?.ConversationStatusId || 0;
				contactToUpdate = contact || null;
			}

			const updatedContact = contactToUpdate ? {
				...contactToUpdate,
				ConversationStatusId: StatusId,
			} : null;

			if (updatedContact) {
				const shouldUpdateActive = originalActiveChat?.PhoneNumber === ClientNumber;
				
				if (shouldUpdateActive) {
					const newActiveContact = {
						...updatedContact,
					};
					flushSync(() => {
						setActiveChatContacts(newActiveContact);
					});
				} else {
					// Auto-select contact after sidebar update
				}

				if (originalSideContacts && originalSideContacts.length > 0) {
					const updatedSideChatContacts = originalSideContacts.map((contact) => {
						if (contact?.PhoneNumber === ClientNumber) {
							return {
								...updatedContact,
							};
						}
						return contact;
					});
					
					flushSync(() => {
						setSideChatContacts(updatedSideChatContacts);
					});
					
					if (!shouldUpdateActive) {
						flushSync(() => {
							setActiveChatContacts(updatedContact);
						});
					}
				}
			}

			if (oldStatusId !== StatusId && oldStatusId > 0 && StatusId > 0) {
				if (oldStatusId === 1) {
					setTotalOpenContacts((prev) => Math.max(0, prev - 1));
				} else if (oldStatusId === 2) {
					setTotalPendingContacts((prev) => Math.max(0, prev - 1));
				} else if (oldStatusId === 3) {
					setTotalSolvedContacts((prev) => Math.max(0, prev - 1));
				}

				if (StatusId === 1) {
					setTotalOpenContacts((prev) => prev + 1);
				} else if (StatusId === 2) {
					setTotalPendingContacts((prev) => prev + 1);
				} else if (StatusId === 3) {
					setTotalSolvedContacts((prev) => prev + 1);
				}
			}

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
				setTotalOpenContacts(originalTotalOpen);
				setTotalPendingContacts(originalTotalPending);
				setTotalSolvedContacts(originalTotalSolved);
				
				if (originalActiveChat) {
					setActiveChatContacts(originalActiveChat);
				}
				if (originalSideContacts) {
					setSideChatContacts(originalSideContacts);
				}

				whatsAppChatConversationStatusData?.payload?.Message
					? setToastMessage({
							...ToastMessages.ERROR,
							message: whatsAppChatConversationStatusData?.payload?.Message,
						})
					: setToastMessage(ToastMessages.ERROR);
			} else {
				if (updatedContact) {
					const shouldUpdateActive = originalActiveChat?.PhoneNumber === ClientNumber;
					if (shouldUpdateActive) {
						setActiveChatContacts({...updatedContact});
					}
					setSideChatContacts(prev => prev.map(contact => 
						contact?.PhoneNumber === ClientNumber 
							? {...updatedContact}
							: contact
					));
				}
			}
		},
		[dispatch, ToastMessages, activeChatContacts, sideChatContacts, totalOpenContacts, totalPendingContacts, totalSolvedContacts],
	);

	const handleUserStatus = useCallback(
		(e: SelectChangeEvent, ClientNumber: string, setIsStatusUpdating?: (value: boolean) => void) => {
			e.preventDefault();
			e.stopPropagation();

			const newStatusValue = Number(e.target.value);
			// Validate status value
			if (isNaN(newStatusValue) || newStatusValue < 1 || newStatusValue > 3) {
				return;
			}

			// Set status updating flag if provided
			if (setIsStatusUpdating) {
				setIsStatusUpdating(true);
			}

			setWhatsappChatCoversationStatus(
				newStatusValue,
				activePhoneNumber,
				ClientNumber,
			).finally(() => {
				// Clear status updating flag after completion
				if (setIsStatusUpdating) {
					setIsStatusUpdating(false);
				}
			});
		},
		[activePhoneNumber, activeChatContacts?.PhoneNumber, setWhatsappChatCoversationStatus],
	);

	const setAPIInboundChatStatus = useCallback(async () => {
		if (activeChatContacts && activeChatContacts?.PhoneNumber?.length > 0) {
			const { payload: whatsAppChatSessionStatus }: APIWhatsappChatSession =
				await dispatch<any>(
					getInboundWhatsappChatStatus({
						activePhoneNumber: activePhoneNumber,
						activeUserNumber: activeChatContacts.PhoneNumber,
						lastCurrentChatMsgId: lastCurrentChatMsgIdRef.current,
						lastAllChatsMsgId: lastAllChatsMsgIdRef.current,
						lastEchoMsgId: lastEchoMsgIdRef.current,
					}),
				);
			if (whatsAppChatSessionStatus?.Status === apiStatus.SUCCESS) {
				const data = whatsAppChatSessionStatus?.Data;
				if (data) {
					// Q1: SP always includes the cursor row (>=) so H/M/S and IsIn24Window are always fresh.
					// Update window state on every successful response.
					setWhatsappChatSession((prev) => ({
						...prev,
						IsIn24Window: data.IsIn24Window,
						ExpiryTime: data.ExpiryTime,
						IsNewMessage: data.IsNewMessage,
						// Q3: true only on the poll that first sees a new echo — the SP advances the
						// cursor, so the next poll reports false again. ChatUi watches this to reload
						// just the open thread.
						IsNewEcho: data.IsNewEcho ?? false,
						RecentEchoMsg: data.RecentEchoMsg,
						RecentEchoMsgDate: data.RecentEchoMsgDate,
						Hour: data.Hour ?? '0',
						Minute: data.Minute ?? '0',
						Second: data.Second ?? '0',
					}));

					// Advance Q1 cursor to the latest known message ID
					if (data.LastCurrentChatMsgId != null) {
						lastCurrentChatMsgIdRef.current = data.LastCurrentChatMsgId;
					}

					// Advance Q3 cursor. The SP never lets this regress to NULL when there is
					// nothing new, so a non-null value is always safe to store.
					if (data.LastEchoMsgId != null) {
						lastEchoMsgIdRef.current = data.LastEchoMsgId;
					}

					// Q3: business replied via the WhatsApp Business App (echo). ChatUi reloads the
					// open thread for this already, but the sidebar list itself is stale until we
					// pull it fresh — same debounced refresh used for Q2 inbound messages below.
					if (data.IsNewEcho && data.RecentEchoMsg) {
						const isNewEchoForRefresh =
							data.RecentEchoMsgDate && data.RecentEchoMsgDate !== lastSeenEchoMsgDateRef.current;

						if (isNewEchoForRefresh) {
							lastSeenEchoMsgDateRef.current = data.RecentEchoMsgDate!;

							if (contactsRefreshDebounceRef.current) {
								clearTimeout(contactsRefreshDebounceRef.current);
							}
							contactsRefreshDebounceRef.current = setTimeout(() => {
								suppressNextLoaderRef.current = true;
								fetchMoreContactsRef.current?.(sideBarSearchTextRef.current, filterBySelected, true);
							}, 5000);
						}
					}

					// Q1: new message for the contact whose thread is currently open. The SP only
					// reports LastAllChatsMsgId for OTHER contacts, so the active contact's own
					// sidebar row would otherwise never get its preview/order updated.
					if (data.IsNewMessage && activeChatContacts?.PhoneNumber) {
						const isNewActiveInbound =
							data.RecentMsgDate && data.RecentMsgDate !== lastSeenActiveMsgDateRef.current;

						if (isNewActiveInbound) {
							lastSeenActiveMsgDateRef.current = data.RecentMsgDate!;

							setSideChatContacts((prev) => {
								const idx = prev.findIndex((c) =>
									compareLastNineDigits(c.PhoneNumber, activeChatContacts.PhoneNumber),
								);
								if (idx === -1) return prev;
								const updated = [...prev];
								updated[idx] = {
									...updated[idx],
									LastMessage: data.RecentMsg ?? updated[idx].LastMessage,
									LastMessageDate: data.RecentMsgDate ?? updated[idx].LastMessageDate,
								};
								const [promoted] = updated.splice(idx, 1);
								return [promoted, ...updated];
							});
						}
					}

					// Q2: new message from another contact detected — update sidebar
					// LastAllChatsMsgId is non-null only when SP found a row from another contact after the cursor
					if (data.LastAllChatsMsgId != null) {
						const isFirstQ2Poll = lastAllChatsMsgIdRef.current === null;
						lastAllChatsMsgIdRef.current = data.LastAllChatsMsgId;

						if (isFirstQ2Poll) {
							// First poll: cursor was null so SP returned historical rows — just record
							// the baseline date so the next poll can detect genuinely new messages.
							lastSeenRecentMsgDateRef.current = data.RecentMsgDate ?? '';
						} else {
							const isNewInbound =
								data.RecentFromNumber &&
								data.RecentMsgDate &&
								data.RecentMsgDate !== lastSeenRecentMsgDateRef.current;

							if (isNewInbound) {
								lastSeenRecentMsgDateRef.current = data.RecentMsgDate!;

								// Immediately reorder sidebar without waiting for a full API refresh
								setSideChatContacts((prev) => {
									const idx = prev.findIndex((c) =>
										compareLastNineDigits(c.PhoneNumber, data.RecentFromNumber!),
									);
									if (idx === -1) return prev;
									const updated = [...prev];
									updated[idx] = {
										...updated[idx],
										LastMessage: data.RecentMsg ?? updated[idx].LastMessage,
										LastMessageDate: data.RecentMsgDate ?? updated[idx].LastMessageDate,
									};
									const [promoted] = updated.splice(idx, 1);
									return [promoted, ...updated];
								});

								// Debounced full contacts-list refresh (5 seconds)
								if (contactsRefreshDebounceRef.current) {
									clearTimeout(contactsRefreshDebounceRef.current);
								}
								contactsRefreshDebounceRef.current = setTimeout(() => {
									suppressNextLoaderRef.current = true;
									fetchMoreContactsRef.current?.(sideBarSearchTextRef.current, filterBySelected, true);
								}, 5000);
							}
						}
					}
				}
			} else {
				setWhatsappChatSession({
					IsIn24Window: false,
					ExpiryTime: null,
					Hour: '0',
					Minute: '0',
					Second: '0',
					IsNewMessage: false,
					IsNewEcho: false,
				});
				whatsAppChatSessionStatus?.Message
					? setToastMessage({
							...ToastMessages.ERROR,
							message: whatsAppChatSessionStatus?.Message,
						})
					: setToastMessage(ToastMessages.ERROR);
			}
		}
	}, [activeChatContacts, activePhoneNumber, dispatch, ToastMessages, filterBySelected]);

	useEffect(() => {
		setAPIInboundChatStatusRef.current = setAPIInboundChatStatus;
	}, [setAPIInboundChatStatus]);

	const setAPIWhatsAppChatContacts = useCallback(
		async (activeUser: string, isInitial: boolean = false, overrideAgentId?: number) => {
			// Ensure mapping is built before loading contacts
			if (Object.keys(phoneToClientIdMap.current).length === 0) {
				await buildPhoneToClientIdMap();
			}

			if (!isInitial) {
				isNumberSwitchingRef.current = true;
			}

			setActivePhoneNumber(activeUser);

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
			}

			const resetPageNo = 1;
			const resetPageSize = contactsPaginationSettingRef.current?.PageSize || 20;

			const effectiveAgentId =
				overrideAgentId !== undefined ? overrideAgentId : agentSelected;

			const {
				payload: whatsAppChatContactsData,
			}: APIWhatsappChatSidebarContactsData = await dispatch<any>(
				effectiveAgentId > 0
					? getWhatsappChatContactsByAgent({
						AgentId: effectiveAgentId,
						IsPagination: true,
						pageNo: resetPageNo,
						pageSize: resetPageSize,
						ChatStatus: filterBySelected,
						Searchtext: '',
					})
					: getWhatsappChatContactsByPhoneNumber({
						PhoneNumber: activeUser,
						IsPagination: true,
						pageNo: resetPageNo,
						pageSize: resetPageSize,
						ChatStatus: filterBySelected,
					}),
			);

			dispatch(setIsLoader(false));
			if (whatsAppChatContactsData?.Status === apiStatus.SUCCESS) {
				// Use contacts as returned from the API (they already have ClientId)
				const contactData = whatsAppChatContactsData.Data.Items || [];
				const updatedActiveChat = contactData[0];
				setSideChatContacts(contactData);
				// Update total contacts data
				setTotalContacts(whatsAppChatContactsData?.Data?.TotalRecord || 0);
				setTotalOpenContacts(whatsAppChatContactsData?.Data?.TotalOpen || 0);
				setTotalPendingContacts(whatsAppChatContactsData?.Data?.TotalPending || 0);
				setTotalSolvedContacts(whatsAppChatContactsData?.Data?.TotalSolved || 0);

				if (!isInitial) {
					// Number switch: always select first contact
					if (updatedActiveChat) {
						setActiveChatContacts(updatedActiveChat);
						navigate(`/react/whatsapp/chat/${updatedActiveChat?.PhoneNumber}`);
						changeContactReadStatusRef.current?.(updatedActiveChat, contactData);
						isNumberSwitchingRef.current = false;
					}
				} else {
					// Initial load: respect URL contactID or select first
					if (contactID) {
						const activeContact = contactData?.find(
							(contact) => contact?.PhoneNumber === contactID,
						);
						if (activeContact) {
							setActiveChatContacts(activeContact);
							navigate(`/react/whatsapp/chat/${activeContact?.PhoneNumber}`);
							changeContactReadStatusRef.current?.(activeContact, contactData);
							isNumberSwitchingRef.current = false;
						}
					} else if (updatedActiveChat) {
						setActiveChatContacts(updatedActiveChat);
						navigate(`/react/whatsapp/chat/${updatedActiveChat?.PhoneNumber}`);
						changeContactReadStatusRef.current?.(updatedActiveChat, contactData);
						isNumberSwitchingRef.current = false;
					}
				}
				if (contactData?.length < resetPageSize) {
					setContactsPaginationSetting({
						...contactsPaginationSettingRef.current,
						hasMore: false,
						PageNo: resetPageNo,
					});
				} else {
					setContactsPaginationSetting({
						...contactsPaginationSettingRef.current,
						hasMore: true,
						PageNo: resetPageNo,
					});
				}
			} else {
				if (whatsAppChatContactsData?.StatusCode === 927) {
					// WHATSAPP_CHAT_INTERFACE
					setTierMessageCode(whatsAppChatContactsData?.Message);
					setDialogType({ type: 'tier' });
				}
				setContactsPaginationSetting({
					...contactsPaginationSettingRef.current,
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
			buildPhoneToClientIdMap,
		],
	);

	const refetchActiveChatContact = useCallback(async (phoneNumber: string) => {
		try {
			const response = await (PulseemReactInstance as any).post(
				'WhatsAppChat/GetWhatsAppChatContacts',
				{
					PhoneNumber: activePhoneNumberRef.current,  // ← always latest
					IsPagination: false,
					pageNo: 1,
					pageSize: 1,
					UserNumber: phoneNumber,
					ChatStatus: filterBySelectedRef.current,    // ← always latest
				}
			);
			const contactsData = response?.data;
			if (
				contactsData?.Status === apiStatus.SUCCESS &&
				Array.isArray(contactsData?.Data?.Items) &&
				contactsData.Data.Items.length > 0
			) {
				const updatedContact = contactsData.Data.Items[0];
				setActiveChatContacts(updatedContact);
				setSideChatContacts((prevContacts) =>
					prevContacts.map((contact) =>
						contact.PhoneNumber === phoneNumber ? updatedContact : contact
					)
				);
			}
		} catch (e) {
			console.error('refetchActiveChatContact failed:', e);
		}
	}, []);

	const getAgents = useCallback(async () => {
		const response: any = await dispatch<any>(getChatAgents());
		const agents: WhatsappAgent[] = response?.payload?.Data as any;
		setAllAgents(agents);
		return agents;
	}, [dispatch]);

	const getTags = useCallback(async () => {
		const response: any = await dispatch<any>(getWhatsappChatTag());
		if (response?.payload?.Status === apiStatus.SUCCESS) {
			setTagsList(response?.payload?.Data || []);
		}
	}, [dispatch]);

	const fetchTotalsUnfiltered = useCallback(async () => {
		if (activePhoneNumber && activePhoneNumber?.length > 0) {
			const { payload: totalsData }: APIWhatsappChatSidebarContactsData = await dispatch<any>(
				getWhatsappChatContactsByPhoneNumber({
					PhoneNumber: activePhoneNumber,
					IsPagination: false,
					pageNo: 1,
					pageSize: 1,
					ChatStatus: 0,
				}),
			);
			if (totalsData?.Status === apiStatus.SUCCESS) {
				setTotalContacts(totalsData?.Data?.TotalRecord || 0);
				setTotalOpenContacts(totalsData?.Data?.TotalOpen || 0);
				setTotalPendingContacts(totalsData?.Data?.TotalPending || 0);
				setTotalSolvedContacts(totalsData?.Data?.TotalSolved || 0);
			}
		}
	}, [activePhoneNumber, dispatch]);

	const getPhoneNumber = useCallback(async (overrideAgentId?: number) => {
		const { payload: phoneNumberData }: phoneNumberAPIProps =
			await dispatch<any>(userPhoneNumbers());
		if (phoneNumberData?.Data?.length > 0) {
			setActivePhoneNumber(phoneNumberData?.Data[0]);
			await setAPIWhatsAppChatContacts(phoneNumberData?.Data[0], true, overrideAgentId);
			setPhoneNumbersList(phoneNumberData?.Data);
			await fetchTotalsUnfiltered();
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
		fetchTotalsUnfiltered,
	]);

	const onActiveUserChange = useCallback(
		(e: SelectChangeEvent) => {
			dispatch(setIsLoader(true));
			setActivePhoneNumber(e.target.value?.replace(/\D/g, ''));
			setAPIWhatsAppChatContacts(e.target.value?.replace(/\D/g, ''));
		},
		[setAPIWhatsAppChatContacts, dispatch],
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
				 * Load the agent list and other independent data in parallel;
				 */
				const otherLoads =
					!personalFields || landingPages?.length <= 0
						? [getDynamicModalValues(), getSavedTemplateFields(), getTags()]
						: [getSavedTemplateFields(), getTags()];

				const [agents] = await Promise.all([getAgents(), ...otherLoads]);

				let resolvedAgentId = agentSelected;
				if (
					resolvedAgentId === 0 &&
					userRolesRef.current?.AllowWhatsAppToAgent &&
					!isAccountAdminRef.current
				) {
					const matchingAgent = agents?.find(
						(agent: WhatsappAgent) => !agent.IsDeleted && agent.IsCurrentUser,
					);
					if (matchingAgent) {
						resolvedAgentId = matchingAgent.AgentId;
						handleAgentSelection(resolvedAgentId);
					}
				}

				await getPhoneNumber(resolvedAgentId);
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
		// Reset cursors whenever the active contact actually changes. Deliberately keyed on the
		// phone numbers, not on setAPIInboundChatStatus's identity — that callback is recreated on
		// unrelated activeChatContacts updates (tag/status edits, sidebar refresh) which must NOT
		// restart this loop or reset the cursors below.
		lastCurrentChatMsgIdRef.current  = null;
		lastAllChatsMsgIdRef.current     = null;
		lastEchoMsgIdRef.current         = null;
		lastSeenRecentMsgDateRef.current = '';
		lastSeenActiveMsgDateRef.current = '';
		lastSeenEchoMsgDateRef.current = '';

		let pollingTimer: ReturnType<typeof setTimeout> | null = null;
		let cancelled = false;

		const poll = async () => {
			try {
				await setAPIInboundChatStatusRef.current?.();
			} catch {
				// errors are handled inside setAPIInboundChatStatus; loop must not break on failure
			}
			if (!cancelled) {
				pollingTimer = setTimeout(poll, 5000);
			}
		};

		poll(); // fire immediately, then chain every 5 s after each response

		return () => {
			cancelled = true;
			if (pollingTimer) clearTimeout(pollingTimer);
			if (contactsRefreshDebounceRef.current) {
				clearTimeout(contactsRefreshDebounceRef.current);
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeChatContacts?.PhoneNumber, activePhoneNumber]);


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

	useEffect(() => {
		changeContactReadStatusRef.current = changeContactReadStatus;
	}, [changeContactReadStatus]);

	const handleChatId = useCallback(
		(
			e: BaseSyntheticEvent,
			contacts: APIWhatsappChatSidebarContactsItemsData,
		) => {
			setActiveChatContacts(contacts);
			changeContactReadStatus(contacts);
			if (typeof window !== 'undefined' && window.innerWidth <= 1024) {
				setIsMobileSideBar(false);
			}
		},
		[changeContactReadStatus],
	);

	const handleTagsUpdated = useCallback(
		(phoneNumber: string, tagIds: number[], tags?: any[], senderNumber?: string) => {
			// If senderNumber provided and doesn't match current account, ignore
			if (senderNumber && senderNumber !== activePhoneNumber) {
				return;
			}
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
		[activeChatContacts?.PhoneNumber, activePhoneNumber],
	);

	const handleTagColorUpdated = useCallback(
		(tagId: string, newColor: string) => {
			getWhatsappChatContactsByUserNumber({
				PhoneNumber: activePhoneNumber,
				IsPagination: false,
				pageNo: 1,
				pageSize: 6,
				UserNumber: activeChatContacts?.PhoneNumber,
				ChatStatus: filterBySelected,
			});
			// Update all contacts that have this tag with the new color
			// setSideChatContacts((prev) => {
			// 	return prev.map((contact) => {
			// 		if (contact.Tags && contact.Tags.length > 0) {
			// 			const hasTag = contact.Tags.some((tag) => tag.id == tagId);
			// 			if (hasTag) {
			// 				const updatedTags = contact.Tags.map((tag) =>
			// 					tag.id == tagId ? { ...tag, TagColor: newColor } : tag,
			// 				);
			// 				return { ...contact, Tags: updatedTags };
			// 			}
			// 		}
			// 		return contact;
			// 	});
			// }); 

			// Update activeChatContacts if it has this tag
			setActiveChatContacts((prev) => {
				if (prev?.Tags && prev.Tags.length > 0) {
					const hasTag = prev.Tags.some((tag) => tag.id === tagId);
					if (hasTag) {
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
					// Merge, don't replace: ConversationStatusId is optimistically owned by
					// setWhatsappChatCoversationStatus and can outrun this read, so keep the
					// locally-known status and take everything else from the server.
					return {
						...whatsAppChatContactsData.Data.Items[0],
						ConversationStatusId: contact.ConversationStatusId,
					};
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
				IsNewchat: false,
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
				} else if (sendWhatsappChat.StatusCode === 107) {
					setDialogType({
						type: 'noPermission'
					});
				} else if (sendWhatsappChat.StatusCode === 927) {
					// WHATSAPP_CAMPAIGN_SEND
					setTierMessageCode(sendWhatsappChat?.Message);
					setDialogType({
						type: 'tier',
					});
				} else if (sendWhatsappChat.StatusCode === 113) {
					// PR-3767: monthly message volume limit reached
					setMessageVolumeLimitInfo({
						limit: sendWhatsappChat?.Data?.Limit ?? -1,
						current: sendWhatsappChat?.Data?.Current ?? 0,
					});
					setDialogType({
						type: 'messageVolumeLimit',
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
				const skipLoader = suppressNextLoaderRef.current;
				suppressNextLoaderRef.current = false;
				if (isPaginationReset && !isInfiniteScroll && !skipLoader) {
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

				// Only add AgentIds and TagIds if they have values.
				// Fall back to [agentSelected] so single-agent selection (dropdown / auto-select) filters correctly.
				const effectiveAgentIds =
					agentIds && agentIds.length > 0
						? agentIds
						: agentSelected > 0
						? [agentSelected]
						: [];
				if (effectiveAgentIds.length > 0) {
					apiPayload.AgentIds = effectiveAgentIds;
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

					// ONLY update totals when viewing All (ChatStatus === 0)
					if (ChatStatus === 0 && isPaginationReset) {
						setTotalContacts(whatsAppChatContactsData?.Data?.TotalRecord || 0);
						setTotalOpenContacts(whatsAppChatContactsData?.Data?.TotalOpen || 0);
						setTotalPendingContacts(whatsAppChatContactsData?.Data?.TotalPending || 0);
						setTotalSolvedContacts(whatsAppChatContactsData?.Data?.TotalSolved || 0);
					}

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
						// If the active contact was set with minimal data (e.g. after
						// onStartNewChat), upgrade it with the full record from the
						// refreshed sidebar so header/tags/status render correctly.
						const currentPhone = activeChatContactsRef.current?.PhoneNumber;
						if (currentPhone && !activeChatContactsRef.current?.UserName) {
							const fullContact = items.find((c) =>
								compareLastNineDigits(c.PhoneNumber, currentPhone),
							);
							if (fullContact) {
								setActiveChatContacts(fullContact);
							}
						}
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

	const onStartNewChat = useCallback(
		(toNumber: string) => {
			const normalizedTo = toNumber.replace(/\D/g, '');

			// Set a minimal active contact so ChatUi immediately loads the chat
			// history and footer for this number (IsIn24Window=false until reply).
			setActiveChatContacts({
				PhoneNumber: normalizedTo,
				UserName: '',
				LastMessage: '',
				LastMessageDate: '',
				IsTemplate: true,
				IsUnsubscribed: false,
				Unread: 0,
				ConversationStatusId: 1,
				Tags: [],
			});

			// Navigate to the conversation
			navigate(`/react/whatsapp/chat/${normalizedTo}`);

			// Refresh sidebar — new contact sorts to top (most recent message)
			void fetchMoreContacts('', filterBySelected, true);
		},
		[navigate, fetchMoreContacts, filterBySelected, setActiveChatContacts],
	);

	const onRefreshChat = useCallback(async () => {
		await fetchMoreContacts('', filterBySelected, true);
		if (activeChatContacts?.PhoneNumber) {
			await dispatch<any>(getWhatsappChat({
				activePhoneNumber: activePhoneNumber,
				activeUserNumber: activeChatContacts.PhoneNumber,
			}));
		}
	}, [fetchMoreContacts, filterBySelected, activeChatContacts, activePhoneNumber, dispatch]);
	// Keep the ref pointing at the latest fetchMoreContacts so setAPIInboundChatStatus
	// can call it without being listed as a dependency (avoids forward-reference TS2448).
	useEffect(() => {
		fetchMoreContactsRef.current = fetchMoreContacts;
	}, [fetchMoreContacts]);

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

	const getNoPermissionDialog = useCallback(() => ({
		title: translator('whatsappCampaign.noPermission'),
		showDivider: false,
		content: (
			<Typography style={{ fontSize: 18 }} className={clsx(classes.textCenter)}>
				{translator('whatsappCampaign.noPermissionToSend')}
			</Typography>
		),
		onConfirm: async () => {
			setDialogType({
				type: '',
				data: ''
			});
		}
	}), [translator, classes]);

	const getValidationDialog = useCallback(() => ({
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
	}), [translator, classes, groupSendValidationErrors]);

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

	const getMessageVolumeLimitDialog = useCallback(
		() => ({
			title: translator('billing.messageVolume.limitReachedTitle', 'Monthly message limit reached'),
			showDivider: false,
			content: (
				<Typography style={{ textAlign: 'center' }}>
					{messageVolumeLimitInfo && messageVolumeLimitInfo.limit >= 0
						? translator(
								'billing.messageVolume.limitReachedMessage',
								"You've used all {{limit}} messages included in your plan this month. Upgrade to keep sending.",
								{ limit: messageVolumeLimitInfo.limit },
							)
						: translator(
								'billing.messageVolume.limitReachedMessageGeneric',
								'You have reached your plan’s monthly message limit. Upgrade to keep sending.',
							)}
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
		[translator, classes, messageVolumeLimitInfo, isRTL, subAccount],
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
							{!userRoles?.HideRecipients && (
								<Button
									className={clsx(classes.btn, classes.btnRounded)}
									onClick={(e: BaseSyntheticEvent) => {
										setDialogType({ type: 'addAgent', data: null });
									}}
								>
									{translator('whatsappChat.addAgent')}
								</Button>
							)}
						</Box>
					</Box>
				</Grid>
			),
		};
	}, [translator, classes, allAgents, updateAgent, onEditAgent, userRoles]);

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
		} else if (type === 'noPermission') {
			currentDialog = getNoPermissionDialog(); // Add this
		} else if (type === 'tier') {
			currentDialog = getTierValidationDialog();
		} else if (type === 'messageVolumeLimit') {
			currentDialog = getMessageVolumeLimitDialog();
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
	}, [dialogType, classes, getValidationDialog, getExceedDailyLimit, getTierValidationDialog, getNoPermissionDialog, getDynamicModalDialog, addAgentModalDialog, editAgentsModalDialog]);

	const handleAgentSelection = useCallback((value: number) => {
		agentAutoSelectedRef.current = true;
		setAgentSelected(value);
		setCookie(agentCookieKey, value.toString());
	}, [agentCookieKey]);

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

	// Guards: isAccountAdmin excludes super-users who inherit AllowWhatsAppToAgent=true by default.
	useEffect(() => {
		if (!isAccountSetup) return;
		if (agentAutoSelectedRef.current) return;
		if (!userRoles?.AllowWhatsAppToAgent) return;
		if (isAccountAdmin) return;
		if (agentSelected !== 0) return;
		if (!allAgents || allAgents.length === 0) return;
		if (!activePhoneNumber) return;

		const matchingAgent = allAgents.find(
			(agent: WhatsappAgent) => !agent.IsDeleted && agent.IsCurrentUser,
		);
		if (!matchingAgent) return;

		handleAgentSelection(matchingAgent.AgentId);
	}, [isAccountSetup, allAgents, activePhoneNumber, userRoles, isAccountAdmin, agentSelected, handleAgentSelection]);

	return (
		<>
			<DefaultScreen
				key="chat"
				subPage={'chat'}
				currentPage="whatsapp"
				classes={classes}
				customPadding={false}
				containerClass={null}
				showAppBar={!isOnlyWhatsAppChat}
			>
				{isAccountSetup === true && (
					<>
						{toastMessage?.message?.length > 0 && <>{renderToast()}</>}
						<div className={`${classes.whatsappChat} app ${isOnlyWhatsAppChat ? 'only-whatsapp' : ''}`}>
							<div className={`${classes.whatsappChat} app-content ${isOnlyWhatsAppChat ? 'only-whatsapp' : ''}`}>
								<SideBar
                                    refetchActiveChatContact={refetchActiveChatContact}
									isMobileSideBar={isMobileSideBar}
									classes={classes}
									setIsMobileSideBar={() =>
										setIsMobileSideBar(!isMobileSideBar)
									}
									handleChatId={handleChatId}
									activePhoneNumber={activePhoneNumber}
									setActiveUser={setActivePhoneNumber}
									onActiveUserChange={onActiveUserChange}
									selectedServiceChannel={selectedChannel}
									onServiceChannelChange={setSelectedChannel}
									serviceDomains={serviceDomains}
									serviceDomain={serviceDomain}
									onServiceDomainChange={setServiceDomain}
									serviceSource={allSource}
									onServiceSourceChange={setAllSource}
									sideChatContacts={displayedSidebarContacts}
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
									agentCookieKey={agentCookieKey}
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
									savedTemplateList={savedTemplateList}
									onStartNewChat={onStartNewChat}
									onRefreshChat={onRefreshChat}
									personalFields={personalFields}
									landingPageData={landingPages}
									searchTextRef={sideBarSearchTextRef}
									onRegisterMobileActions={(actions) => {
										mobileSideBarActionsRef.current = actions;
									}}
								/>
								<ChatUi
									refetchActiveChatContact={refetchActiveChatContact}
									onAddAgent={() => {
										setDialogType({ type: 'addAgent', data: null });
									}}
									onEditAgents={() => {
										getAgents();
										setDialogType({ type: 'editAgents' });
									}}
									onRefreshChat={onRefreshChat}
									onOpenNewChat={() => mobileSideBarActionsRef.current.openNewChat()}
									onOpenEditTags={() => mobileSideBarActionsRef.current.openEditTags()}
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
									selectedAgent={
										(activeChatContacts as any)?.Agents?.length > 0
											? {
												AgentId: (activeChatContacts as any).Agents[0].AgentID,
												Name: (activeChatContacts as any).Agents[0].AgentName,
												IsDeleted: false,
											} as WhatsappAgent
											: {} as WhatsappAgent
									}
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
