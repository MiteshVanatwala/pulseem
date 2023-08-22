import Icon from './Icon';
import AccountUser from '../../../../assets/images/acc-user.jpg';
import { useEffect, useState } from 'react';
import {
	APIWhatsappChatData,
	WhatsappChatUiProps,
	APIWhatsappChatDetailData,
} from '../Types/WhatsappChat.type';
import { IconButton, makeStyles, MenuItem } from '@material-ui/core';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { FaBars } from 'react-icons/fa';
import ChatTemplateModal from '../Popups/ChatTemplateModal';
import { apiStatus } from '../../Constant';
import { useDispatch } from 'react-redux';
import { getWhatsappChat } from '../../../../redux/reducers/whatsappSlice';
import ChatTemplate from './ChatTemplate';
import { Loader } from '../../../../components/Loader/Loader';
import ChatFooterContent from './ChatFooterContent';
import clsx from 'clsx';
import ChatHeaderContent from './ChatHeaderContent';
import { useTranslation } from 'react-i18next';

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
	onChatTemplateDelete
}: WhatsappChatUiProps) => {
	const { t: translator } = useTranslation();
	const dispatch = useDispatch();

	const [isLoader, setIsLoader] = useState<boolean>(false);

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
			await setAPIInboundChatStatus();
			setUpdatedDynamicVariable([]);
			setDynamicVariable([]);
			setNewMessage('');
			setSavedTemplate('');
			!isNewMessage && setIsLoader(false);

			if (allWhatsAppChatData.payload.Status === apiStatus.SUCCESS) {
				setAllWhatsappChat(allWhatsAppChatData.payload?.Data?.Items);
				updateContactList();
			} else {
				setAllWhatsappChat(undefined);
			}
		}
	};

	const chatHeader = () => {
		return (
			<header
				className={`${classes.whatsappChat} header chat__header ${
					isMobileSideBar && 'mobile-side-bar-open'
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
						<span className={classes.whatsappChatUiStatusPadding}>
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
											position: 'absolute',
											borderRadius: '10px',
											textAlign: 'center',
											marginTop: '-6px',
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
						</span>
					</h2>
					<p className={`${classes.whatsappChat} chat__contact-desc`}></p>
				</div>

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
					setIsTemplateModal={setIsTemplateModal}
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
				<ChatTemplateModal
					classes={classes}
					isOpen={isTemplateModal}
					onClose={() => setIsTemplateModal(false)}
					savedTemplateList={savedTemplateList}
					onChoose={(template, templateText) =>
						onChoose(template, templateText)
					}
				/>
				<Loader isOpen={isLoader} showBackdrop={true} />
			</div>
		</>
	);
};

export default ChatUi;
