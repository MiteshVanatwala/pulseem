import Icon from './Icon';
import { allMessages, dates, user } from './data';
import AccountUser from '../../../../assets/images/acc-user.jpg';
import { BaseSyntheticEvent, useEffect, useState } from 'react';
import {
	APIWhatsappChatItemsData,
	APIWhatsappChatData,
	WhatsappChatUiProps,
} from '../Types/WhatsappChat.type';
import {
	Button,
	Grid,
	IconButton,
	Select,
	MenuItem,
	makeStyles,
	Typography,
} from '@material-ui/core';
import { FaBars } from 'react-icons/fa';
import ChatTemplateModal from '../Popups/ChatTemplateModal';
import Highlighter from 'react-highlight-words';
import {
	tagDataProps,
	updatedVariable,
} from '../../Campaign/Types/WhatsappCampaign.types';
import clsx from 'clsx';
import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getVariableValue } from '../../Common';
import EmojiPicker from '../../../../components/Emojis/EmojiPicker';
import { apiStatus } from '../../Constant';
import { useDispatch } from 'react-redux';
import { getWhatsappChat } from '../../../../redux/reducers/whatsappSlice';

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
	activeUser,
	whatsappChatSession,
	handleUserStatus,
}: WhatsappChatUiProps) => {
	const [allWhatsappChat, setAllWhatsappChat] = useState<
		APIWhatsappChatItemsData[]
	>([]);
	const [activePhoneNumber, setActivePhoneNumber] =
		useState<string>(activeUser);
	const [activeUserNumber, setActiveUserNumber] =
		useState<string>('918657485699');

	const dispatch = useDispatch();
	const { t: translator } = useTranslation();
	const [showEmojis, setShowEmojis] = useState<boolean>(false);
	const formatTime = (timeString: string) => {
		let splitTimeString = timeString.split(':');
		return `${splitTimeString[0]}:${splitTimeString[1]}`;
	};
	const time = new Date().toLocaleTimeString('en-US');
	const [chatTimer, setChatTimer] = useState<string>(time);
	const setUpdateTime = () => {
		let time = new Date().toLocaleTimeString('en-US');
		setChatTimer(time);
	};

	const useStyles = makeStyles(() => ({
		selectRoot: {
			fontSize: '18px',
			'&:focus': {
				backgroundColor: 'rgba(0,0,0,0)',
			},
		},
		selectSection: {
			'&:focus': {
				backgroundColor: 'rgba(0,0,0,0)',
			},
		},
	}));
	const muiclasses = useStyles();
	const getStatusClass = (status: number) => {
		switch (status) {
			case 1:
				return 'open';
			case 2:
				return 'pending';
			case 3:
				return 'solved';

			default:
				break;
		}
	};

	const isUpdatedVaraiable = (variable: string) => {
		let updatedVariable = getVariableValue(variable);
		const isAvaliable = updatedDynamicVariable?.find(
			(dynamicVariable: updatedVariable) =>
				dynamicVariable.VariableIndex === Number(updatedVariable)
		);
		return !!isAvaliable;
	};
	const openDynamcFieldModal = async (variable: string) => {
		setDynamicModalVariable(Number(variable?.replace(/[{}]/g, '')));
		setIsDynamcFieldModal(true);
	};
	const getUpdatedVariableValue = (variable: string) => {
		let updatedVariable = getVariableValue(variable);
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
	const onEmojiClick = (emoji: string) => {
		setNewMessage(`${newMessage} ${emoji}`);
	};

	const onEditableDivChange = (e: BaseSyntheticEvent) => {
		setNewMessage(e.target.value);
	};

	useEffect(() => {
		getAPIAllWhatsappChat();
	}, []);

	const getAPIAllWhatsappChat = async () => {
		const allWhatsAppChatData: APIWhatsappChatData = await dispatch<any>(
			getWhatsappChat({ activePhoneNumber, activeUserNumber })
		);

		if (allWhatsAppChatData.payload.Status === apiStatus.SUCCESS) {
			setAllWhatsappChat(allWhatsAppChatData.payload.Data.Items);
		} else {
			setAllWhatsappChat([]);
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
								classes={{ root: muiclasses.selectSection }}
								className={clsx(
									classes.whatsappChatStatusSelect,
									getStatusClass(chatContacts.ConversationStatusId)
								)}
								autoWidth
								value={chatContacts.ConversationStatusId || ''}
								variant='standard'
								style={
									chatContacts.ConversationStatusId
										? {
												fontSize: '12px',
												padding: '8px 0px 8px 8px',
												position: 'absolute',
												borderRadius: '10px',
												textAlign: 'center',
										  }
										: {
												display: 'none',
										  }
								}
								onChange={(e) => handleUserStatus(e, chatContacts.PhoneNumber)}>
								<MenuItem value={1}>{translator('whatsappChat.open')}</MenuItem>
								<MenuItem value={2}>
									{translator('whatsappChat.pending')}
								</MenuItem>
								<MenuItem value={3}>
									{translator('whatsappChat.solved')}
								</MenuItem>
							</Select>
						</span>
					</h2>
					<p className={`${classes.whatsappChat} chat__contact-desc`}>
						{user.typing
							? translator('whatsappChat.type')
							: translator('whatsappChat.online')}
					</p>
				</div>

				<div className={`${classes.whatsappChat} chat__actions`}>
					<div
						className={`${classes.whatsappChat} chat__action chat__action-icon`}>
						{chatTimer}
					</div>
				</div>
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
				<div className={`${classes.whatsappChat} chat__input-wrapper`}>
					{whatsappChatSession.IsIn24Window ? (
						<>
							<button
								aria-label='Emojis'
								onClick={() => setShowEmojis(!showEmojis)}>
								<EmojiPicker
									classes={classes}
									OnSelectEmoji={(emoji: string) => {
										onEmojiClick(emoji);
									}}
									boxStyles={{ alignItems: 'center' }}
								/>
							</button>
							<button
								aria-label='chat'
								onClick={() => setIsTemplateModal(true)}>
								<Icon
									id='chat'
									className={`${classes.whatsappChat} chat__input-icon ${
										showEmojis
											? `${classes.whatsappChat} chat__input-icon--highlight`
											: ''
									}`}
								/>
							</button>
							<div
								className={`${classes.whatsappChat} chat__input`}
								data-text='Type a message'
								contentEditable={savedTemplate?.length === 0 ? true : false}
								suppressContentEditableWarning={
									savedTemplate?.length === 0 ? true : false
								}
								onKeyUp={onEditableDivChange}>
								<Highlighter
									searchWords={dynamicVariable}
									autoEscape={true}
									textToHighlight={newMessage}
									highlightTag={(tagData: tagDataProps) =>
										highlightText(tagData)
									}
								/>
							</div>
						</>
					) : (
						<div style={{ padding: '2px', marginLeft: '12px', width: '100%' }}>
							<Stack
								direction='row'
								justifyContent='center'
								alignItems='center'
								spacing={2}>
								<Typography color='textSecondary'>
									<label style={{ fontSize: '20px' }}>
										<>{translator('whatsappChat.conversation')}</>
									</label>
									<br />
									<label style={{ fontSize: '15px' }}>
										<>{translator('whatsappChat.cantSend')}</>
									</label>
								</Typography>

								<Grid className={classes.manageTemplatesHeaderButtons}>
									<Button
										size='small'
										className={'green'}
										onClick={() => setIsTemplateModal(true)}>
										<>{translator('whatsappChat.send')}</>
									</Button>
								</Grid>
							</Stack>
						</div>
					)}
					{whatsappChatSession.IsIn24Window && (
						<button aria-label='Send message'>
							<Icon
								id='send'
								className={`${classes.whatsappChat} chat__send-icon`}
							/>
						</button>
					)}
				</div>
			</footer>
		);
	};

	const chatConversation = () => {
		return (
			<div className={`${classes.whatsappChat} chat__content`}>
				{dates?.map((date: any, dateIndex: number) => {
					const messages: any = allMessages[date];
					return (
						<div key={dateIndex}>
							<div className={`${classes.whatsappChat} chat__date-wrapper`}>
								<span className={`${classes.whatsappChat} chat__date`}>
									{' '}
									{date}
								</span>
							</div>
							{dateIndex === 0 && (
								<p className={`${classes.whatsappChat} chat__encryption-msg`}>
									<Icon
										id='lock'
										className={`${classes.whatsappChat} chat__encryption-icon`}
									/>
									Messages are end-to-end encrypted. No one outside of this
									chat, not even WhatsApp, can read or listen to them. Click to
									learn more.
								</p>
							)}
							<div className={`${classes.whatsappChat} chat__msg-group`}>
								{messages.map((message: any, msgIndex: number) => {
									const assignRef = () =>
										dateIndex === dates.length - 1 &&
										msgIndex === messages.length - 1
											? undefined
											: undefined;
									return (
										<>
											{message.image ? (
												<div
													key={msgIndex}
													className={`${
														classes.whatsappChat
													} chat__msg chat__img-wrapper ${
														message.sender
															? `${classes.whatsappChat} chat__msg--rxd`
															: `${classes.whatsappChat} chat__msg--sent`
													}`}
													ref={assignRef()}>
													<img
														src={AccountUser}
														alt=''
														className={`${classes.whatsappChat} chat__img`}
													/>
													<span
														className={`${classes.whatsappChat} chat__msg-footer`}>
														<span>{formatTime(message.time)}</span>
														{!message.sender && (
															<Icon
																id={
																	message?.status === 'sent'
																		? 'singleTick'
																		: 'doubleTick'
																}
																aria-label={message?.status}
																className={`${
																	classes.whatsappChat
																} chat__msg-status-icon ${
																	message?.status === 'read'
																		? `${classes.whatsappChat} chat__msg-status-icon--blue`
																		: ''
																}`}
															/>
														)}
													</span>

													<button
														aria-label='Message options'
														className={`${classes.whatsappChat} chat__msg-options`}>
														<Icon
															id='downArrow'
															className={`${classes.whatsappChat} chat__msg-options-icon`}
														/>
													</button>
												</div>
											) : message.sender ? (
												<p
													key={msgIndex}
													className={`${classes.whatsappChat} chat__msg chat__msg--rxd`}
													ref={assignRef()}>
													<span>{message.content}</span>
													<span
														className={`${classes.whatsappChat} chat__msg-filler`}>
														{' '}
													</span>
													<span
														className={`${classes.whatsappChat} chat__msg-footer`}>
														{formatTime(message.time)}
													</span>
													<button
														aria-label='Message options'
														className={`${classes.whatsappChat} chat__msg-options`}>
														<Icon
															id='downArrow'
															className={`${classes.whatsappChat} chat__msg-options-icon`}
														/>
													</button>
												</p>
											) : (
												<p
													key={msgIndex}
													className={`${classes.whatsappChat} chat__msg chat__msg--sent`}
													ref={assignRef()}>
													<span>{message.content}</span>
													<span
														className={`${classes.whatsappChat} chat__msg-filler`}>
														{' '}
													</span>
													<span
														className={`${classes.whatsappChat} chat__msg-footer`}>
														<span> {formatTime(message.time)} </span>
														<Icon
															id={
																message?.status === 'sent'
																	? 'singleTick'
																	: 'doubleTick'
															}
															aria-label={message?.status}
															className={`${
																classes.whatsappChat
															} chat__msg-status-icon ${
																message?.status === 'read'
																	? `${classes.whatsappChat} chat__msg-status-icon--blue`
																	: ''
															}`}
														/>
													</span>
													<button
														aria-label='Message options'
														className={`${classes.whatsappChat} chat__msg-options`}>
														<Icon
															id='downArrow'
															className={`${classes.whatsappChat} chat__msg-options-icon`}
														/>
													</button>
												</p>
											)}
										</>
									);
								})}
							</div>
						</div>
					);
				})}
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
			</div>
		</>
	);
};

export default ChatUi;
