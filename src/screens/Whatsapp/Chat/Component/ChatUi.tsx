import Icon from './Icon';
import AccountUser from '../../../../assets/images/acc-user.jpg';
import { useEffect, useState } from 'react';
import {
	APIWhatsappChatData,
	WhatsappChatUiProps,
	APIWhatsappChatDetailData,
} from '../Types/WhatsappChat.type';
import { Box, IconButton, MenuItem } from '@material-ui/core';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { FaBars } from 'react-icons/fa';
import ChatTemplateModal from '../Popups/ChatTemplateModal';
import { apiStatus } from '../../Constant';
import { useDispatch, useSelector } from 'react-redux';
import { assignAgentToChat, getChatAgents, getWhatsappChat } from '../../../../redux/reducers/whatsappSlice';
import ChatTemplate from './ChatTemplate';
import ChatFooterContent from './ChatFooterContent';
import clsx from 'clsx';
import ChatHeaderContent from './ChatHeaderContent';
import { useTranslation } from 'react-i18next';
import { BaseDialog } from '../../../../components/DialogTemplates/BaseDialog';
import { StateType } from '../../../../Models/StateTypes';
import { coreProps, WhatsappAgent, WhatsappPhoneSession } from '../../Campaign/Types/WhatsappCampaign.types';

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
	selectedAgent
}: WhatsappChatUiProps) => {
	const { t: translator } = useTranslation();
	const dispatch = useDispatch();
	const [dialogType, setDialogType] = useState<{
		type: string;
	} | null>(null);
	const { isRTL } = useSelector((state: { core: coreProps }) => state.core);
	const { agentList } = useSelector((state: StateType) => state.whatsapp);

	useEffect(() => {
		setTimeout(() => {
			const chatDiv = document.getElementById('chat-messages');
			chatDiv?.scroll({ top: chatDiv?.scrollHeight, behavior: 'auto' });
		}, 1500)
	}, [allWhatsappChat]);

	useEffect(() => {
		getAPIAllWhatsappChat();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [chatContacts?.PhoneNumber]);

	useEffect(() => {
		if (whatsappChatSession?.IsNewMessage) {
			getAPIAllWhatsappChat(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [whatsappChatSession]);

	const getAPIAllWhatsappChat = async (isNewMessage: boolean = false) => {
		if (activePhoneNumber && chatContacts?.PhoneNumber) {
			!isNewMessage && setIsLoader(true);
			const allWhatsAppChatData: APIWhatsappChatData = await dispatch<any>(
				getWhatsappChat({
					activePhoneNumber: activePhoneNumber,
					activeUserNumber: chatContacts?.PhoneNumber,
				})
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
					}, 2000)
				}
			} else {
				setAllWhatsappChat(undefined);
			}
		}
	};

	const handleSetAgentToSession = async (agentToSession: WhatsappPhoneSession) => {
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
	}

	const chatHeader = () => {
		return (
			<header
				className={`${classes.whatsappChat} header chat__header ${isMobileSideBar && 'mobile-side-bar-open'
					}`}>
				<IconButton
					className={classes.whatsappChatBarButton}
					onClick={setIsMobileSideBar}>
					<FaBars />
				</IconButton>
				<div className={`${classes.whatsappChat} chat__avatar-wrapper`}>
					<img
						src={AccountUser}
						width='40px'
						alt={'name'}
						className={`${classes.whatsappChat} avatar`}
					/>
				</div>

				<div className={`${classes.whatsappChat} chat__contact-wrapper`}>
					<h2 className={`${classes.whatsappChat} chat__contact-name`}>
						{' '}
						{chatContacts.UserName || chatContacts.PhoneNumber || 'Pulseem'}
					</h2>

					<p className={`${classes.whatsappChat} chat__contact-desc`}></p>
				</div>

				<Box className={clsx(classes.spaceBetween, 'mobileColumn')}>

					<Box className={classes.whatsappChatUiStatusPadding}>
						<Select
							className={clsx(
								classes.whatsappChatStatusSelect,
								getStatusClass(chatContacts.ConversationStatusId),
								classes.f12
							)}
							autoWidth
							value={`${chatContacts?.ConversationStatusId || ''}`}
							variant='standard'
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
							onChange={(e: SelectChangeEvent) => handleUserStatus(e, chatContacts.PhoneNumber)}
						>
							<MenuItem value={1}>{translator('whatsappChat.open')}</MenuItem>
							<MenuItem value={2}>{translator('whatsappChat.pending')}</MenuItem>
							<MenuItem value={3}>{translator('whatsappChat.solved')}</MenuItem>
						</Select>
						<div className={classes.agentSelectorContainer}>
							<Select
								className={clsx(classes.whatsappChatStatusSelect, classes.f12)}
								autoWidth
								defaultValue='0'
								value={`${selectedAgent?.AgentId || 0}`}
								variant='standard'
								style={{ marginInline: 15 }}
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
										Cellphone: activeChatContacts.PhoneNumber
									};

									if (Number(e.target.value) > 0) {
										const selectedAgent: WhatsappAgent = agentList?.filter((a: WhatsappAgent) => { return a.AgentId === Number(e.target.value) })[0];
										agentToSession = {
											AgentId: selectedAgent.AgentId,
											Cellphone: activeChatContacts.PhoneNumber
										};
									}

									handleSetAgentToSession(agentToSession);
								}}
							>
								<MenuItem value={0}>{translator('whatsappChat.setAgent')}</MenuItem>
								{agentList?.map((agent: WhatsappAgent) => {
									return <MenuItem value={agent.AgentId}>{agent.Name}</MenuItem>
								})}
							</Select>
						</div>
					</Box>
					<Box className='clock-font-size'>
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
					aria-label='scroll down'>
					<Icon id='downArrow' />
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
				id='chat-messages'
				className={`${classes.whatsappChat} chat__content`}>
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
											className={`${classes.whatsappChat} chat__encryption-msg`}>
											<Icon
												id='lock'
												className={`${classes.whatsappChat} chat__encryption-icon`}
											/>
											<>{translator('whatsappChat.endEncrypt')}</>
										</p>
									)}
									<div className={`${classes.whatsappChat} chat__msg-group`}>
										{messages?.map(
											(
												message: APIWhatsappChatDetailData,
												msgIndex: number
											) => (
												<ChatTemplate
													classes={classes}
													template={message?.TemplateData?.types}
													msgIndex={msgIndex}
													message={message}
													variables={message?.TemplateData?.variables}
												/>
											)
										)}
									</div>
								</div>
							);
						}
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
			)
		}
	}

	const renderDialog = () => {
		const { type } = dialogType || {}

		if (type) {
			const dialogContent: { [key: string]: {} } = {
				chatTemplate: getChatTemplateDialog(),
			}
			const currentDialog: any = (type && dialogContent[type]) || {};
			return (
				dialogType && <BaseDialog
					classes={classes}
					open={dialogType}
					childrenStyle={classes.mb25}
					onClose={() => setDialogType(null)}
					onCancel={() => setDialogType(null)}
					{...currentDialog}>
					{currentDialog.content}
				</BaseDialog>
			)
		}
	}

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
			</div>
		</>
	);
};

export default ChatUi;
