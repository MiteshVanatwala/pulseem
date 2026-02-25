import Icon from './Icon';
import AccountUser from '../../../../assets/images/acc-user.jpg';
import { useEffect, useState } from 'react';
import {
	APIWhatsappChatData,
	WhatsappChatUiProps,
	APIWhatsappChatDetailData,
} from '../Types/WhatsappChat.type';
import { Box, IconButton, MenuItem, Chip } from '@material-ui/core';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { FaBars } from 'react-icons/fa';
import { MdEdit, MdSupportAgent, MdClose } from 'react-icons/md';
import ChatTemplateModal from '../Popups/ChatTemplateModal';
import { apiStatus } from '../../Constant';
import { useDispatch, useSelector } from 'react-redux';
import {
	assignAgentToChat,
	getChatAgents,
	getWhatsappChat,
	getWhatsappChatTag,
} from '../../../../redux/reducers/whatsappSlice';
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
}: WhatsappChatUiProps) => {
	const { t: translator } = useTranslation();
	const dispatch = useDispatch();
	const [dialogType, setDialogType] = useState<{
		type: string;
	} | null>(null);
	const [contactTags, setContactTags] = useState<any[]>([]);
	const [toastMessage, setToastMessage] = useState(null);

	// Handler to remove a tag from the current chat contact
	const onChatTagRemove = async (tagId: string) => {
		if (!chatContacts?.PhoneNumber) return;
		const currentTags = contactTags || [];
		const tagIdToRemove = String(tagId);
		const newTags = currentTags.filter(
			(t: any) => String(t.id) !== tagIdToRemove,
		);
		const newTagIds = newTags
			.map((t: any) => parseInt(t.id, 10))
			.filter((id: any) => !isNaN(id));
		try {
			setContactTags(newTags);
			await PulseemReactInstance.put('WhatsAppChat/AssignTagsToChat', {
				Cellphone: chatContacts.PhoneNumber,
				TagIds: newTagIds,
			});
			updateContactList();
		} catch (err) {
			console.error('Failed to remove tag:', err);
		}
	};
	const [showEditRecipient, setShowEditRecipient] = useState(false);
	const [clientToEdit, setClientToEdit] = useState<any>(null);

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
	}, [chatContacts?.Tags]);

	useEffect(() => {
		getAPIAllWhatsappChat();
		// Fetch tags for the current contact immediately
		if (chatContacts?.PhoneNumber) {
			dispatch(getWhatsappChatTag());
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [chatContacts?.PhoneNumber]);

	useEffect(() => {
		if (whatsappChatSession?.IsNewMessage) {
			getAPIAllWhatsappChat(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [whatsappChatSession]);

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
				updateContactList();
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

	const handleSetAgentToSession = async (
		agentToSession: WhatsappPhoneSession,
	) => {
		const response: any = await dispatch(assignAgentToChat(agentToSession));
		switch (response?.payload?.StatusCode) {
			case 201: {
				await dispatch(getChatAgents());
				//TODO: show success assign
				break;
			}
			case 404: {
				//TODO: not found
				break;
			}
		}
	};

	const chatHeader = () => {
		return (
			<header
				className={`${classes.whatsappChat} header chat__header ${
					isMobileSideBar && 'mobile-side-bar-open'
				}`}
			>
				<IconButton
					className={classes.whatsappChatBarButton}
					onClick={setIsMobileSideBar}
				>
					<FaBars />
				</IconButton>
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
							chatContacts.PhoneNumber ||
							translator('common.pulseem')}
					</h2>

					<p className={`${classes.whatsappChat} chat__contact-desc`}></p>
				</div>

				<Box className={clsx(classes.spaceBetween, 'mobileColumn')}>
					<Box className={classes.whatsappChatUiStatusPadding}>
						<Select
							className={clsx(
								classes.whatsappChatStatusSelect,
								getStatusClass(chatContacts.ConversationStatusId),
								classes.f12,
							)}
							autoWidth
							value={`${chatContacts?.ConversationStatusId || ''}`}
							variant="standard"
							style={
								chatContacts.ConversationStatusId
									? {
											padding: '8px 0px 8px 8px',
											// position: 'absolute',
											borderRadius: '24px',
											textAlign: 'center',
											// marginTop: '-6px',
										}
									: {
											display: 'none',
										}
							}
							onChange={(e: SelectChangeEvent) =>
								handleUserStatus(e, chatContacts.PhoneNumber)
							}
						>
							<MenuItem value={1}>{translator('whatsappChat.open')}</MenuItem>
							<MenuItem value={2}>
								{translator('whatsappChat.pending')}
							</MenuItem>
							<MenuItem value={3}>{translator('whatsappChat.solved')}</MenuItem>
						</Select>
						<div className={classes.agentSelectorContainer}>
							<Select
								className={clsx(
									classes.whatsappChatStatusSelect,
									classes.f12,
									classes.selectFieldStyle,
								)}
								autoWidth
								defaultValue="0"
								value={`${selectedAgent?.AgentId || 0}`}
								variant="standard"
								MenuProps={{
									PaperProps: {
										style: {
											direction: isRTL ? 'rtl' : 'ltr',
										},
									},
								}}
								onChange={(e: SelectChangeEvent) => {
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
								{agentList?.map((agent: WhatsappAgent) => {
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
							</Select>
						</div>
						<IconButton
							className={classes.editAgentIconButton}
							aria-label="Edit"
							onClick={handleEditRecipient}
						>
							<MdEdit size={18} color="#333" />
						</IconButton>
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
					onChatSend={onChatSend}
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

				updateContactList();
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
