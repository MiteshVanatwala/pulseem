import Icon from './Icon';
import AccountUser from '../../../../assets/images/acc-user.jpg';
import { useEffect, useState } from 'react';
import {
	APIWhatsappChatData,
	WhatsappChatUiProps,
	APIWhatsappChatDetailData,
} from '../Types/WhatsappChat.type';
import { Box, IconButton, MenuItem, Chip, Menu } from '@material-ui/core';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import useMediaQuery from '@mui/material/useMediaQuery';
import { FaBars } from 'react-icons/fa';
import { MdEdit, MdSupportAgent, MdClose, MdAdd, MdMoreVert, MdRefresh, MdAddComment } from 'react-icons/md';
import { BsPeopleFill, BsFillTagsFill } from 'react-icons/bs';
import ChatTemplateModal from '../Popups/ChatTemplateModal';
import { apiStatus } from '../../Constant';
import { useDispatch, useSelector } from 'react-redux';
import {
	assignAgentToChat,
	getChatAgents,
	getWhatsappChat,
	getWhatsappChatTag,
} from '../../../../redux/reducers/whatsappSlice';
import moment from 'moment';
import {
	getMessages as getServiceMessages,
	sendMessage as sendServiceMessage,
	uploadFile as uploadServiceFile,
	getAgents as getServiceAgents,
	getConversationDetail as getServiceConversationDetail,
	updateConversation as updateServiceConversation,
} from '../../../../redux/reducers/conversationsSlice';
import {
	IMessage,
	IAgentOption,
	IVisitorInfo,
	IPageVisit,
	ConversationStatus,
} from '../../../../Models/Service/Conversation';
import ChatTemplate from './ChatTemplate';
import ChatFooterContent from './ChatFooterContent';
import clsx from 'clsx';
import ChatHeaderContent from './ChatHeaderContent';
import { useTranslation } from 'react-i18next';
import { BaseDialog } from '../../../../components/DialogTemplates/BaseDialog';
import { StateType } from '../../../../Models/StateTypes';
import {
	coreProps,
	WhatsappAgent,
	WhatsappPhoneSession,
} from '../../Campaign/Types/WhatsappCampaign.types';
import AddRecipientPopup from '../../../Groups/Management/Popup/AddRecipientPopup';
import { PulseemReactInstance } from '../../../../helpers/Api/PulseemReactAPI';
import Toast from '../../../../components/Toast/Toast.component';
import { useNavigate } from 'react-router-dom';

// ── Widget (service) message adapters — PR-2455 ─────────────────────────────
// Widget conversations arrive as a flat IMessage[]; this pane renders a shape
// bucketed by date label, so they are adapted rather than the pane forked.

const adaptWidgetMessages = (msgs: IMessage[]): APIWhatsappChatItemsData => {
	const buckets: APIWhatsappChatItemsData = {};
	(msgs || []).forEach((m) => {
		const dateLabel = moment(m.sentAt).format('DD/MM/YYYY');
		if (!buckets[dateLabel]) buckets[dateLabel] = [];
		buckets[dateLabel].push({
			IsInbound: m.sender === 'visitor',
			IsTemplate: false,
			MediaContentType: '',
			MediaUrl: m.fileUrl || '',
			Message: m.content || '',
			MessageDate: m.sentAt,
			MessageDateText: moment(m.sentAt).format('HH:mm'),
			SmsStatus: '',
			SmsStatusId: 0,
		} as any);
	});
	return buckets;
};

// Appends one message to the bucketed shape, so an agent's reply appears
// instantly instead of waiting for a full reload.
const appendWidgetMessage = (
	buckets: APIWhatsappChatItemsData | undefined,
	m: IMessage,
): APIWhatsappChatItemsData => {
	const dateLabel = moment(m.sentAt).format('DD/MM/YYYY');
	const next: APIWhatsappChatItemsData = { ...(buckets || {}) };
	const detail = {
		IsInbound: m.sender === 'visitor',
		IsTemplate: false,
		MediaContentType: '',
		MediaUrl: m.fileUrl || '',
		Message: m.content || '',
		MessageDate: m.sentAt,
		MessageDateText: moment(m.sentAt).format('HH:mm'),
		SmsStatus: '',
		SmsStatusId: 0,
	} as any;
	next[dateLabel] = [...(next[dateLabel] || []), detail];
	return next;
};

const ChatUi = ({
	classes,
	setIsMobileSideBar,
	isMobileSideBar,
	savedTemplateList,
	onChoose,
	newMessage,
	setNewMessage,
	isTemplateModal,
	setIsTemplateModal,
	dynamicVariable,
	updatedDynamicVariable,
	setIsDynamcFieldModal,
	setDynamicModalVariable,
	savedTemplate,
	chatContacts,
	whatsappChatSession,
	handleUserStatus,
	getStatusClass,
	onChatSend,
	activePhoneNumber,
	allWhatsappChat,
	setAllWhatsappChat,
	setAPIInboundChatStatus,
	setWhatsappChatSession,
	setUpdatedDynamicVariable,
	setDynamicVariable,
	setSavedTemplate,
	activeChatContacts,
	ChatContacts,
	isContactLoader,
	updateContactList,
	personalFields,
	onChatTemplateDelete,
	setIsLoader,
	selectedAgent,
	ToastMessages,
	refetchActiveChatContact,
	onTagsUpdated,
	onAddAgent,
	onEditAgents,
	onRefreshChat,
	onOpenNewChat,
	onOpenEditTags,
}: WhatsappChatUiProps) => {
	const navigate = useNavigate();
	const { t: translator } = useTranslation();
	const dispatch = useDispatch();
	const [dialogType, setDialogType] = useState<{
		type: string;
	} | null>(null);
	const [contactTags, setContactTags] = useState<any[]>([]);
	const [toastMessage, setToastMessage] = useState(null);
	const [localAgentId, setLocalAgentId] = useState<number>(
		(chatContacts as any)?.Agents?.[0]?.AgentID || 0
	);
	const [mobileActionsAnchor, setMobileActionsAnchor] = useState<null | HTMLElement>(null);
	const [isRefreshingMobile, setIsRefreshingMobile] = useState(false);
	// Matches the breakpoint that hides the sidebar (and its New Chat/Edit Tags/Manage
	// Agent/Refresh actions) on mobile, so this menu appears exactly when those are unreachable.
	const isMobileChat = useMediaQuery('(max-width:1024px)');

	// Handler to remove a tag from the current chat contact
	const onChatTagRemove = async (tagId: string) => {
		if (!chatContacts?.PhoneNumber) return;
		const currentTags = contactTags || [];
		const tagIdToRemove = parseInt(tagId);
		const newTags = currentTags.filter((t: any) => {
			const currentId = parseInt(t.id);
			return currentId !== tagIdToRemove;
		});
		const newTagIds = newTags
			.map((t: any) => parseInt(t.id, 10))
			.filter((id: any) => !isNaN(id));
		try {
			// Optimistically update local state
			setContactTags(newTags);
			
			// Wait for API to complete
			const response = await PulseemReactInstance.put('WhatsAppChat/AssignTagsToChat', {
				Cellphone: chatContacts.PhoneNumber,
				TagIds: newTagIds,
				Sendernumber: activePhoneNumber,
			});
			
			// Call onTagsUpdated callback to update sidebar immediately
			if (response && typeof onTagsUpdated === 'function') {
				onTagsUpdated(chatContacts.PhoneNumber, newTagIds, newTags, activePhoneNumber);
			}
		} catch (err) {
			console.error('Failed to remove tag:', err);
			// Revert optimistic update on error
			setContactTags(currentTags);
		}
	};
	const [showEditRecipient, setShowEditRecipient] = useState(false);
	const [clientToEdit, setClientToEdit] = useState<any>(null);
	const [isStatusUpdating, setIsStatusUpdating] = useState(false);

	// Handler for Edit icon click (fetches full user details by ClientId)
	const handleEditRecipient = async () => {
		// Debug log to check if ClientId is present
		const contact = chatContacts || activeChatContacts;
		const clientId = contact?.ClientId;
		if (!clientId) return;
		setIsLoader && setIsLoader(true);
		try {
			// getClientsById is imported from clientSlice (redux async thunk)
			const recipientRequest = await dispatch(
				// @ts-ignore
				require('../../../../redux/reducers/clientSlice').getClientsById([
					clientId,
				]),
			);
			const cte =
				recipientRequest?.payload?.Data?.length > 0 &&
				recipientRequest?.payload?.Data[0];
			if (cte) {
				setClientToEdit(cte);
				setShowEditRecipient(true);
			}
		} finally {
			setIsLoader && setIsLoader(false);
		}
	};
	const { isRTL } = useSelector((state: { core: coreProps }) => state.core);
	const { agentList } = useSelector((state: StateType) => state.whatsapp);
	const { windowSize } = useSelector(
		(state: { core: coreProps }) => state.core,
	);
	const firstAgentId = (chatContacts as any)?.Agents?.[0]?.AgentID ?? 0;

	useEffect(() => {
		setTimeout(() => {
			const chatDiv = document.getElementById('chat-messages');
			chatDiv?.scroll({ top: chatDiv?.scrollHeight, behavior: 'auto' });
		}, 1500);
	}, [allWhatsappChat]);

	// Update contact tags whenever chatContacts.Tags changes
	useEffect(() => {
		if (chatContacts?.Tags && Array.isArray(chatContacts.Tags)) {
			setContactTags([...chatContacts.Tags]);
		} else {
			setContactTags([]);
		}
	}, [chatContacts?.Tags, chatContacts?.PhoneNumber, activePhoneNumber]);

	useEffect(() => {
		getAPIAllWhatsappChat();
		// Fetch tags for the current contact immediately
		if (chatContacts?.PhoneNumber) {
			dispatch(getWhatsappChatTag());
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [chatContacts?.PhoneNumber]);

	// IsNewMessage: customer replied. IsNewEcho: the business replied from the WhatsApp
	// Business App (coexistence). Either way reload only the open thread — GetWhatsAppChat
	// does not filter on SendID, so echo rows come back as normal outgoing bubbles.
	// Passing true skips the loader, keeping this a silent background refresh.
	useEffect(() => {
		if ((whatsappChatSession?.IsNewMessage || whatsappChatSession?.IsNewEcho) && !isStatusUpdating) {
			getAPIAllWhatsappChat(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [whatsappChatSession, isStatusUpdating]);

	// The refresh above is driven by the WhatsApp inbound-status poll, which never runs
	// for a widget conversation — so an open widget thread would sit still while the
	// visitor typed. Poll the thread directly instead, on the same 5s cadence, and only
	// while a widget conversation is actually open. Passing true keeps it silent (no
	// loader flash on every tick).
	useEffect(() => {
		if ((chatContacts as any)?.channel !== 'widget') return;

		let cancelled = false;
		let timer: ReturnType<typeof setTimeout> | null = null;

		const tick = async () => {
			try {
				await getAPIAllWhatsappChat(true);
			} catch {
				// keep polling; a dropped refresh is recovered on the next tick
			}
			if (!cancelled) timer = setTimeout(tick, 5000);
		};

		timer = setTimeout(tick, 5000);

		return () => {
			cancelled = true;
			if (timer) clearTimeout(timer);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [(chatContacts as any)?.channel, (chatContacts as any)?.conversationId, chatContacts?.PhoneNumber]);

	useEffect(() => {
		setLocalAgentId(firstAgentId);
	}, [
		chatContacts?.PhoneNumber,
		activePhoneNumber,
		firstAgentId,
	]);

	const isWidgetChat = (chatContacts as any)?.channel === 'widget';

	// The WhatsApp status Select speaks numeric ids; a widget conversation speaks the
	// Service vocabulary. Map between the two rather than introducing a second control,
	// so the header keeps one status widget whichever channel is open.
	const SVC_ID_TO_STATUS: Record<number, ConversationStatus> = {
		0: 'new',
		1: 'open',
		3: 'resolved',
		4: 'archived',
	};
	const SVC_STATUS_TO_ID: Record<string, number> = { new: 0, open: 1, resolved: 3, archived: 4 };

	const [serviceAgents, setServiceAgents] = useState<IAgentOption[]>([]);
	const [visitorInfo, setVisitorInfo] = useState<IVisitorInfo | null>(null);
	const [pageTrail, setPageTrail] = useState<IPageVisit[]>([]);
	const [widgetStatusId, setWidgetStatusId] = useState<number>(0);

	const widgetConversationId =
		(chatContacts as any)?.conversationId || chatContacts?.PhoneNumber;

	// Agent list and visitor context for the open widget conversation. Both endpoints
	// existed unused until now; without them the header could show a status but not
	// change it, and nothing could be assigned.
	useEffect(() => {
		if (!isWidgetChat || !widgetConversationId) {
			setVisitorInfo(null);
			setPageTrail([]);
			return;
		}
		setWidgetStatusId(Number(chatContacts?.ConversationStatusId ?? 0));
		(dispatch as any)(getServiceAgents()).then((res: any) =>
			setServiceAgents(res?.payload || []),
		);
		(dispatch as any)(getServiceConversationDetail(widgetConversationId)).then((res: any) => {
			setVisitorInfo(res?.payload?.visitorInfo || null);
			// Last 5 pages, most recent first — the ticket's "Page Navigation" trail.
			setPageTrail((res?.payload?.pageTrail || []).slice(-5).reverse());
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isWidgetChat, widgetConversationId]);

	// Status change on a widget conversation — the WhatsApp path writes through a
	// different API and keys on a phone number, which a widget visitor does not have.
	const handleWidgetStatus = (statusId: number) => {
		const status = SVC_ID_TO_STATUS[statusId];
		if (!status || !widgetConversationId) return;
		setWidgetStatusId(statusId);   // optimistic; the list poll reconciles
		(dispatch as any)(updateServiceConversation({ id: widgetConversationId, status }));
	};

	// Assignment on a widget conversation. agentId 0 from the picker means "unassign",
	// which the API models as an explicit null rather than an omitted field.
	const handleWidgetAgent = (agentId: number) => {
		if (!widgetConversationId) return;
		const match = serviceAgents.find((a) => a.id === agentId);
		(dispatch as any)(updateServiceConversation({
			id: widgetConversationId,
			agentId: agentId > 0 ? agentId : null,
			agentName: match ? match.name : null,
		}));
	};

	const scrollChatToBottom = () => {
		const el = document.getElementById('chat-messages');
		if (el) setTimeout(() => { el.scrollTop = el.scrollHeight; }, 100);
	};

	// Send a widget reply through the Service slice and append it optimistically,
	// so the agent sees it immediately rather than after the next poll.
	const handleWidgetSend = async () => {
		const conversationId =
			(chatContacts as any)?.conversationId || chatContacts?.PhoneNumber;
		const text = (newMessage || '').trim();
		if (!conversationId || !text) return;
		setNewMessage('');
		try {
			const res: any = await dispatch<any>(
				sendServiceMessage({ conversationId, content: text }),
			);
			const msg: IMessage | undefined = res?.payload;
			if (msg) setAllWhatsappChat(appendWidgetMessage(allWhatsappChat, msg));
			scrollChatToBottom();
		} catch {
			/* keep the composer responsive on failure */
		}
	};

	// Upload a file for a widget reply, then send it as a message.
	const handleWidgetAttach = async (file: File) => {
		const conversationId =
			(chatContacts as any)?.conversationId || chatContacts?.PhoneNumber;
		if (!conversationId || !file) return;
		try {
			const up: any = await dispatch<any>(uploadServiceFile(file));
			const fileUrl = up?.payload?.fileUrl;
			if (!fileUrl) return;
			const res: any = await dispatch<any>(
				sendServiceMessage({
					conversationId,
					content: (newMessage || '').trim() || file.name,
					fileUrl,
				}),
			);
			const msg: IMessage | undefined = res?.payload;
			if (msg) setAllWhatsappChat(appendWidgetMessage(allWhatsappChat, msg));
			setNewMessage('');
			scrollChatToBottom();
		} catch {
			/* upload failed — leave the composer as it was */
		}
	};

	const renderToast = () => {
		if (toastMessage) {
			setTimeout(() => {
				setToastMessage(null);
			}, 4000);
			return <Toast data={toastMessage} />;
		}
		return null;
	};

	const getAPIAllWhatsappChat = async (isNewMessage: boolean = false) => {
		// Widget conversations come from the Service slice, not the WhatsApp API.
		// Handled first so the WhatsApp path below is completely unchanged.
		if ((chatContacts as any)?.channel === 'widget') {
			const conversationId =
				(chatContacts as any)?.conversationId || chatContacts?.PhoneNumber;
			if (!conversationId) return;
			!isNewMessage && setIsLoader(true);
			try {
				const res: any = await dispatch<any>(getServiceMessages(conversationId));
				const msgs: IMessage[] = res?.payload || [];
				setAllWhatsappChat(adaptWidgetMessages(msgs));
			} catch {
				setAllWhatsappChat(undefined);
			} finally {
				!isNewMessage && setIsLoader(false);
			}
			return;
		}

		if (activePhoneNumber && chatContacts?.PhoneNumber) {
			!isNewMessage && setIsLoader(true);
			const allWhatsAppChatData: APIWhatsappChatData = await dispatch<any>(
				getWhatsappChat({
					activePhoneNumber: activePhoneNumber,
					activeUserNumber: chatContacts?.PhoneNumber,
				}),
			);
			// await setAPIInboundChatStatus();
			setUpdatedDynamicVariable([]);
			setDynamicVariable([]);
			setNewMessage('');
			setSavedTemplate('');
			!isNewMessage && setIsLoader(false);

			if (allWhatsAppChatData.payload.Status === apiStatus.SUCCESS) {
				setAllWhatsappChat(allWhatsAppChatData.payload?.Data?.Items);
				// Don't call updateContactList here - it fetches stale data that overwrites optimistic status updates
				// updateContactList();
				const element = document.getElementById('chat-messages');
				if (element !== null) {
					setTimeout(() => {
						element.scrollTop = element.scrollHeight;
					}, 2000);
				}
			} else {
				setAllWhatsappChat(undefined);
			}
		}
	};

	const handleSetAgentToSession = async (agentToSession: WhatsappPhoneSession) => {
		setLocalAgentId(agentToSession.AgentId > 0 ? agentToSession.AgentId : 0);

		try {
			const response: any = await dispatch(assignAgentToChat({
				...agentToSession,
				Sendernumber: activePhoneNumber,
			}));

			if (response?.payload?.StatusCode === 201) {
				await dispatch(getChatAgents());
				if (typeof refetchActiveChatContact === 'function') {
					await refetchActiveChatContact(activeChatContacts.PhoneNumber);
				}
			}
		} catch (e) {
			setLocalAgentId((chatContacts as any)?.Agents?.[0]?.AgentID || 0);
		}
	};

	const chatHeader = () => {
		return (
			<header
				className={`${classes.whatsappChat} chat-header chat__header ${
					isMobileSideBar && 'mobile-side-bar-open'
				}`}
			>
				<IconButton
					className={classes.whatsappChatBarButton}
					onClick={setIsMobileSideBar}
				>
					<FaBars />
				</IconButton>
				{isMobileChat && (
					<>
						<IconButton
							onClick={(e) => setMobileActionsAnchor(e.currentTarget)}
							title={translator('whatsappChat.moreActions')}
						>
							<MdMoreVert />
						</IconButton>
						<Menu
							anchorEl={mobileActionsAnchor}
							open={Boolean(mobileActionsAnchor)}
							onClose={() => setMobileActionsAnchor(null)}
						>
							<MenuItem
								onClick={() => {
									setMobileActionsAnchor(null);
									onEditAgents?.();
								}}
							>
								<Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
									<BsPeopleFill size={16} />
									{translator('common.manageAgent')}
								</Box>
							</MenuItem>
							<MenuItem
								onClick={() => {
									setMobileActionsAnchor(null);
									onOpenEditTags?.();
								}}
							>
								<Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
									<BsFillTagsFill size={16} />
									{translator('whatsappChat.editTags')}
								</Box>
							</MenuItem>
							<MenuItem
								onClick={() => {
									setMobileActionsAnchor(null);
									onOpenNewChat?.();
								}}
							>
								<Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
									<MdAddComment size={16} />
									{translator('whatsappChat.startNewChatTooltip')}
								</Box>
							</MenuItem>
							<MenuItem
								onClick={async () => {
									setMobileActionsAnchor(null);
									setIsRefreshingMobile(true);
									await onRefreshChat?.();
									setIsRefreshingMobile(false);
								}}
							>
								<Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
									<MdRefresh
										size={16}
										style={{ animation: isRefreshingMobile ? 'spin 0.8s linear infinite' : 'none' }}
									/>
									{translator('whatsappChat.refreshChat')}
								</Box>
							</MenuItem>
						</Menu>
					</>
				)}
				<div className={`${classes.whatsappChat} chat__avatar-wrapper`}>
					<img
						src={AccountUser}
						width="40px"
						alt={'name'}
						className={`${classes.whatsappChat} avatar`}
					/>
				</div>

				<div className={`${classes.whatsappChat} chat__contact-wrapper`}>
					<h2 className={`${classes.whatsappChat} chat__contact-name`}>
						{' '}
						{chatContacts.UserName ||
							chatContacts.PhoneNumber}
					</h2>

					<p className={`${classes.whatsappChat} chat__contact-desc`}></p>
				</div>

				<Box className={clsx(classes.spaceBetween, classes.mobileColumn)}>
					<Box className={classes.whatsappChatUiStatusPadding}>
						<Select
							className={clsx(
								classes.whatsappChatStatusSelect,
								getStatusClass(chatContacts.ConversationStatusId),
								classes.f12,
							)}
							autoWidth
							value={
								isWidgetChat
									? `${widgetStatusId}`
									: `${chatContacts?.ConversationStatusId || ''}`
							}
							variant="standard"
							style={
								// A widget conversation starts at 'new' (id 0), which is falsy — so the
								// WhatsApp truthiness test would hide the control on exactly the
								// conversations an agent most needs to action.
								isWidgetChat || chatContacts.ConversationStatusId
									? {
										padding: '8px 0px 8px 8px',
										// position: 'absolute',
										borderRadius: '24px',
										textAlign: 'center',
										// marginTop: '-6px',
									}
									: { display: 'none' }
							}
							onChange={(e: SelectChangeEvent) =>
								isWidgetChat
									? handleWidgetStatus(Number(e.target.value))
									: handleUserStatus(e, chatContacts.PhoneNumber, setIsStatusUpdating)
							}
						>
							{isWidgetChat
								? [
									<MenuItem key="new" value={0}>{translator('whatsappChat.status_new')}</MenuItem>,
									<MenuItem key="open" value={1}>{translator('whatsappChat.open')}</MenuItem>,
									<MenuItem key="resolved" value={3}>{translator('whatsappChat.solved')}</MenuItem>,
									<MenuItem key="archived" value={4}>{translator('whatsappChat.status_archived')}</MenuItem>,
								]
								: [
									<MenuItem key="open" value={1}>{translator('whatsappChat.open')}</MenuItem>,
									<MenuItem key="pending" value={2}>{translator('whatsappChat.pending')}</MenuItem>,
									<MenuItem key="solved" value={3}>{translator('whatsappChat.solved')}</MenuItem>,
								]}
						</Select>
						<div className={classes.agentSelectorContainer}>
							<Select
								className={clsx(
									classes.whatsappChatStatusSelect,
									classes.f12,
									classes.selectFieldStyle,
								)}
								autoWidth
								displayEmpty
								value={
									isWidgetChat
										? String((chatContacts as any)?.assignedAgentId ?? 0)
										: String(localAgentId)
								}
								renderValue={(value) => {
									const assignedAgent = isWidgetChat
										? (() => {
											const a = serviceAgents.find((x) => String(x.id) === value);
											return a ? ({ Name: a.name } as any) : undefined;
										})()
										: agentList?.find(
											(a: WhatsappAgent) => String(a.AgentId) === value,
										);
									return (
										<Box
											style={{
												display: 'flex',
												alignItems: 'center',
												gap: '8px',
											}}
										>
											<MdSupportAgent size={16} />
											{assignedAgent?.Name || translator('whatsappChat.setAgent')}
										</Box>
									);
								}}
								variant="standard"
								MenuProps={{
									PaperProps: {
										style: {
											direction: isRTL ? 'rtl' : 'ltr',
										},
									},
								}}
								onChange={(e: SelectChangeEvent) => {
									if (e.target.value === 'add-new') {
										onAddAgent?.();
										return;
									}

									// A widget conversation is assigned through the Service API; the
									// WhatsApp session path below is keyed on a phone number the
									// visitor does not have.
									if (isWidgetChat) {
										handleWidgetAgent(Number(e.target.value));
										return;
									}

									let agentToSession: WhatsappPhoneSession = {
										AgentId: -1,
										Cellphone: activeChatContacts.PhoneNumber,
									};

									if (Number(e.target.value) > 0) {
										const selectedAgent: WhatsappAgent = agentList?.filter(
											(a: WhatsappAgent) => {
												return a.AgentId === Number(e.target.value);
											},
										)[0];
										agentToSession = {
											AgentId: selectedAgent.AgentId,
											Cellphone: activeChatContacts.PhoneNumber,
										};
									}

									handleSetAgentToSession(agentToSession);
								}}
							>
								<MenuItem value={0}>
									<Box
										style={{
											display: 'flex',
											alignItems: 'center',
											gap: '8px',
										}}
									>
										<MdSupportAgent size={16} style={{ opacity: 1 }} />
										{translator('whatsappChat.setAgent')}
									</Box>
								</MenuItem>
								{/* A widget conversation is assigned to a Pulseem sub-user (Service
								    GetAgents), not to a WhatsApp agent — different list, same picker. */}
								{isWidgetChat &&
									serviceAgents.map((agent: IAgentOption) => (
										<MenuItem key={agent.id} value={agent.id}>
											<Box
												style={{
													display: 'flex',
													alignItems: 'center',
													gap: '8px',
												}}
											>
												<MdSupportAgent size={16} />
												{agent.name}
											</Box>
										</MenuItem>
									))}
								{!isWidgetChat && agentList?.map((agent: WhatsappAgent) => {
									return (
										<MenuItem key={agent.AgentId} value={agent.AgentId}>
											<Box
												style={{
													display: 'flex',
													alignItems: 'center',
													gap: '8px',
												}}
											>
												<MdSupportAgent size={16} />
												{agent.Name}
											</Box>
										</MenuItem>
									);
								})}
								{/* "Add agent" creates a WhatsApp agent, which would not appear in
								    the Service list — offering it here would look broken. */}
								{onAddAgent && !isWidgetChat && (
									<MenuItem value="add-new">
										<Box
											style={{
												display: 'flex',
												alignItems: 'center',
												gap: '8px',
											}}
										>
											<MdAdd size={16} />
											{translator('whatsappChat.addAgent')}
										</Box>
									</MenuItem>
								)}
							</Select>
						</div>
						<IconButton
							className={classes.editAgentIconButton}
							aria-label="Edit"
							onClick={handleEditRecipient}
						>
							<MdEdit size={18} color="#333" />
						</IconButton>
						{/* Visitor context for a widget conversation — browser, location and the
						    page they arrived from. A WhatsApp contact has a phone number and a
						    name; a website visitor is anonymous, so this is the only identifying
						    detail an agent gets. Rendered inline rather than in a side panel to
						    avoid restructuring the WhatsApp layout. */}
						{isWidgetChat && visitorInfo && (
							<Box
								style={{
									display: 'flex',
									flexWrap: 'wrap',
									alignItems: 'center',
									gap: '12px',
									fontSize: 12,
									color: '#6b7280',
									marginInlineStart: 8,
								}}
							>
								{visitorInfo.browser && <span>{visitorInfo.browser}</span>}
								{visitorInfo.location && <span>{visitorInfo.location}</span>}
								{pageTrail.length > 0 && (
									<span
										title={pageTrail
											.map((v) => `${v.url}  ${moment(v.visitedAt).format('DD/MM HH:mm')}`)
											.join('\n')}
										style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
									>
										{translator('whatsappChat.page_navigation')}:{' '}
										{pageTrail.map((v) => {
											try {
												return new URL(v.url).pathname;
											} catch {
												return v.url;
											}
										}).join(' ← ')}
									</span>
								)}
								{visitorInfo.referrerUrl && (
									<span
										title={visitorInfo.referrerUrl}
										style={{
											maxWidth: 260,
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap',
										}}
									>
										{visitorInfo.referrerUrl}
									</span>
								)}
							</Box>
						)}

						{/* Tag Chips Display */}
						<Box className={classes.tagChipsContainer}>
							{contactTags &&
								contactTags.length > 0 &&
								contactTags.map((tag: any) => (
									<Chip
										key={tag.id}
										label={tag.TagName}
										size="small"
										style={{
											backgroundColor: tag.TagColor || '#e8e8e8',
											color: '#fff',
											marginRight: 4,
											fontWeight: 600,
											fontSize: '15px',
											height: '18px',
											padding: '13px 0px',
											flexShrink: 0,
										}}
										className={classes.tagChipStyle}
										onDelete={() => onChatTagRemove(tag.id)}
									/>
								))}
						</Box>
					</Box>
					<Box className="clock-font-size">
						{whatsappChatSession?.IsIn24Window &&
							Number(whatsappChatSession.Hour) > 0 &&
							Number(whatsappChatSession.Minute) > 0 &&
							Number(whatsappChatSession.Second) > 0 && (
								<ChatHeaderContent
									classes={classes}
									whatsappChatSession={whatsappChatSession}
									setWhatsappChatSession={setWhatsappChatSession}
								/>
							)}
					</Box>
				</Box>
			</header>
		);
	};

	const chatFooter = () => {
		return (
			<footer className={`${classes.whatsappChat} chat__footer`}>
				<button
					className={`${classes.whatsappChat} chat__scroll-btn`}
					aria-label="scroll down"
				>
					<Icon id="downArrow" />
				</button>
				<ChatFooterContent
					classes={classes}
					updatedDynamicVariable={updatedDynamicVariable}
					setDynamicModalVariable={setDynamicModalVariable}
					setIsDynamcFieldModal={setIsDynamcFieldModal}
					newMessage={newMessage}
					setNewMessage={setNewMessage}
					setIsTemplateModal={() => setDialogType({ type: 'chatTemplate' })}
					savedTemplate={savedTemplate}
					dynamicVariable={dynamicVariable}
					whatsappChatSession={whatsappChatSession}
					isWidget={isWidgetChat}
					onWidgetAttach={handleWidgetAttach}
					onChatSend={isWidgetChat ? handleWidgetSend : onChatSend}
					activeChatContacts={activeChatContacts}
					ChatContacts={ChatContacts}
					isContactLoader={isContactLoader}
					personalFields={personalFields}
					onChatTemplateDelete={onChatTemplateDelete}
				/>
			</footer>
		);
	};

	const chatConversation = () => {
		return (
			<div
				id="chat-messages"
				className={`${classes.whatsappChat} chat__content`}
			>
				{allWhatsappChat &&
					Object.keys(allWhatsappChat)?.map(
						(date: string, dateIndex: number) => {
							const messages: APIWhatsappChatDetailData[] =
								allWhatsappChat[date];
							return (
								<div key={dateIndex}>
									<div className={`${classes.whatsappChat} chat__date-wrapper`}>
										<span className={`${classes.whatsappChat} chat__date`}>
											{' '}
											{date}
										</span>
									</div>
									{dateIndex === 0 && (
										<p
											className={`${classes.whatsappChat} chat__encryption-msg`}
										>
											<Icon
												id="lock"
												className={`${classes.whatsappChat} chat__encryption-icon`}
											/>
											<>{translator('whatsappChat.endEncrypt')}</>
										</p>
									)}
									<div className={`${classes.whatsappChat} chat__msg-group`}>
										{messages?.map(
											(
												message: APIWhatsappChatDetailData,
												msgIndex: number,
											) => (
												<ChatTemplate
													classes={classes}
													template={message?.TemplateData?.types}
													msgIndex={msgIndex}
													message={message}
													variables={message?.TemplateData?.variables}
												/>
											),
										)}
									</div>
								</div>
							);
						},
					)}
			</div>
		);
	};

	const getChatTemplateDialog = () => {
		return {
			title: translator('whatsappChat.chooseTemplate'),
			showDivider: true,
			showDefaultButtons: false,
			content: (
				<ChatTemplateModal
					classes={classes}
					onClose={() => setDialogType(null)}
					savedTemplateList={savedTemplateList}
					onChoose={(template, templateText) => {
						onChoose(template, templateText);
						setDialogType(null);
					}}
					isIn24Window={whatsappChatSession?.IsIn24Window}
				/>
			),
		};
	};

	const renderDialog = () => {
		const { type } = dialogType || {};

		if (type) {
			const dialogContent: { [key: string]: {} } = {
				chatTemplate: getChatTemplateDialog(),
			};
			const currentDialog: any = (type && dialogContent[type]) || {};
			return (
				dialogType && (
					<BaseDialog
						classes={classes}
						open={dialogType}
						childrenStyle={classes.mb25}
						onClose={() => setDialogType(null)}
						onCancel={() => setDialogType(null)}
						{...currentDialog}
					>
						{currentDialog.content}
					</BaseDialog>
				)
			);
		}
	};

	const handleResponses = (
		response: any,
		actions = {
			S_200: {
				code: 200,
				message: '',
				Func: () => null,
			},
			S_201: {
				code: 201,
				message: '',
				Func: () => {},
			},
			S_202: {
				code: 202,
				message: '',
				Func: () => {},
			},
			S_400: {
				code: 400,
				message: '',
				Func: () => null,
			},
			S_401: {
				code: 401,
				message: '',
				Func: () => null,
			},
			S_404: {
				code: 404,
				message: '',
				Func: () => null,
			},
			S_405: {
				code: 405,
				message: '',
				Func: () => null,
			},
			S_406: {
				code: 406,
				message: '',
				Func: () => null,
			},
			S_422: {
				code: 422,
				message: '',
				Func: () => null,
			},
			S_500: {
				code: 500,
				message: '',
				Func: () => null,
			},
			default: {
				message: '',
				Func: () => null,
			},
		},
	) => {
		switch (
			response.payload?.StatusCode ||
			response.payload?.Message.StatusCode
		) {
			case 200: {
				actions?.S_200?.Func?.();
				break;
			}
			case 201: {
				setShowEditRecipient(false);
				setClientToEdit(null);

				// Single optimized refetch - only call once
				if (typeof refetchActiveChatContact === 'function') {
					refetchActiveChatContact(chatContacts?.PhoneNumber);
				}
				// No need to navigate to same page or call updateContactList - refetchActiveChatContact handles it
				break;
			}
			case 202: {
				actions?.S_202?.Func?.();
				// actions?.S_201?.message && setToastMessage(actions?.S_201?.message);
				break;
			}
			case 400: {
				actions?.S_400?.Func?.();
				//@ts-ignore
				actions?.S_400?.message && setToastMessage(actions?.S_400?.message);
				break;
			}
			case 401: {
				actions?.S_401?.Func?.();
				//@ts-ignore
				actions?.S_401?.message && setToastMessage(actions?.S_401?.message);
				break;
			}
			case 404: {
				actions?.S_404?.Func?.();
				//@ts-ignore
				actions?.S_404?.message && setToastMessage(actions?.S_404?.message);
				break;
			}
			case 405: {
				actions?.S_405?.Func?.();
				//@ts-ignore
				actions?.S_405?.message && setToastMessage(actions?.S_405?.message);
				break;
			}
			case 406: {
				actions?.S_406?.Func?.();
				//@ts-ignore
				actions?.S_406?.message && setToastMessage(actions?.S_406?.message);
				break;
			}
			case 422: {
				actions?.S_422?.Func?.();
				//@ts-ignore
				actions?.S_422?.message && setToastMessage(actions?.S_422?.message);
				break;
			}
			case 500: {
				actions?.S_500?.Func?.();
				//@ts-ignore
				actions?.S_500?.message && setToastMessage(actions?.S_500?.message);
				break;
			}
			default: {
				actions?.default?.Func?.();
				//@ts-ignore
				actions?.default?.message && setToastMessage(actions?.default?.message);
				setShowEditRecipient(false);
				setClientToEdit(null);
			}
		}
		setIsLoader(false);
	};

	return (
		<>
			<div className={`${classes.whatsappChat} chat`}>
				<div className={`${classes.whatsappChat} chat__body`}>
					<div className={`${classes.whatsappChat} chat__bg`}></div>

					{/* Header */}
					{chatHeader()}

					{/* Convo */}
					{chatConversation()}

					{/* Footer */}
					{chatFooter()}
				</div>
				{renderDialog()}
				{renderToast()}
			</div>

			{/* Edit Recipient Popup */}
			{showEditRecipient && clientToEdit && (
				<AddRecipientPopup
					classes={classes}
					isOpen={showEditRecipient}
					onClose={() => {
						setShowEditRecipient(false);
						setClientToEdit(null);
					}}
					windowSize={windowSize}
					recipientData={clientToEdit}
					ToastMessages={ToastMessages}
					onAddRecipient={(closeDialog = true) => {
						if (closeDialog) {
							setShowEditRecipient(false);
							setClientToEdit(null);
						}
						// Refresh contact list if needed
						if (updateContactList) {
							updateContactList();
						}
						return null;
					}}
					// @ts-ignore
					handleResponses={(response, actions) =>
						handleResponses(response, actions)
					}
				/>
			)}
		</>
	);
};

export default ChatUi;
