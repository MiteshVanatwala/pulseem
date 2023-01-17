import Icon from './Icon';
import { allMessages, dates, user } from './data';
import profile from '../../../../assets/images/profile.jpeg';
import { BaseSyntheticEvent, KeyboardEvent, useState } from 'react';
import { WhatsappChatUiProps } from '../Types/WhatsappChat.type';
import { Button, Grid, IconButton, Typography } from '@material-ui/core';
import { FaBars } from 'react-icons/fa';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import ChatTemplateModal from '../Popups/ChatTemplateModal';
import Highlighter from 'react-highlight-words';
import {
	tagDataProps,
	updatedVariableProps,
} from '../../Campaign/Types/WhatsappCampaign.types';
import clsx from 'clsx';
import { Stack } from '@mui/material';

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
}: WhatsappChatUiProps) => {
	const [showEmojis, setShowEmojis] = useState<boolean>(false);
	const formatTime = (timeString: string) => {
		let splitTimeString = timeString.split(':');
		return `${splitTimeString[0]}:${splitTimeString[1]}`;
	};
	const isUpdatedVaraiable = (variable: string) => {
		let updatedVariable = variable?.replace(/[{}]/g, '');
		const isAvaliable = updatedDynamicVariable?.find(
			(dynamicVariable: updatedVariableProps) =>
				dynamicVariable.VariableIndex === Number(updatedVariable)
		);
		return !!isAvaliable;
	};
	const openDynamcFieldModal = async (variable: string) => {
		setDynamicModalVariable(Number(variable?.replace(/[{}]/g, '')));
		setIsDynamcFieldModal(true);
	};
	const getUpdatedVariableValue = (variable: string) => {
		let updatedVariable = variable?.replace(/[{}]/g, '');
		const variableValue = updatedDynamicVariable?.find(
			(dynamicVariable: updatedVariableProps) =>
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
	const onEmojiClick = (emoji: EmojiClickData, event: MouseEvent) => {
		setNewMessage(`${newMessage} ${emoji.emoji}`);
	};

	const onEditableDivChange = (e: BaseSyntheticEvent) => {
		setNewMessage(e.target.value);
	};

	return (
		<>
			<div className={`${classes.whatsappChat} chat`}>
				<div className={`${classes.whatsappChat} chat__body`}>
					<div className={`${classes.whatsappChat} chat__bg`}></div>

					{/* Header */}
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
								src={profile}
								width='40px'
								alt={'name'}
								className={`${classes.whatsappChat} avatar`}
							/>
						</div>

						<div className={`${classes.whatsappChat} chat__contact-wrapper`}>
							<h2 className={`${classes.whatsappChat} chat__contact-name`}>
								{' '}
								{user?.name}
							</h2>
							<p className={`${classes.whatsappChat} chat__contact-desc`}>
								{user.typing ? 'typing...' : 'online'}
							</p>
						</div>
					</header>

					{/* Convo */}
					<div className={`${classes.whatsappChat} chat__content`}>
						{dates?.map((date: any, dateIndex: any) => {
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
										<p
											className={`${classes.whatsappChat} chat__encryption-msg`}>
											<Icon
												id='lock'
												className={`${classes.whatsappChat} chat__encryption-icon`}
											/>
											Messages are end-to-end encrypted. No one outside of this
											chat, not even WhatsApp, can read or listen to them. Click
											to learn more.
										</p>
									)}
									<div className={`${classes.whatsappChat} chat__msg-group`}>
										{messages.map((message: any, msgIndex: any) => {
											const assignRef = () =>
												dateIndex === dates.length - 1 &&
												msgIndex === messages.length - 1
													? undefined
													: undefined;
											return (
												<>
													{message.image ? (
														<div
															className={`${
																classes.whatsappChat
															} chat__msg chat__img-wrapper ${
																message.sender
																	? `${classes.whatsappChat} chat__msg--rxd`
																	: `${classes.whatsappChat} chat__msg--sent`
															}`}
															ref={assignRef()}>
															{/* <img
																src={profile}
																alt=''
																className={`${classes.whatsappChat} chat__img`}
															/> */}
															<img
																src={profile}
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

					{/* Footer */}
					<footer className={`${classes.whatsappChat} chat__footer`}>
						<button
							className={`${classes.whatsappChat} chat__scroll-btn`}
							aria-label='scroll down'>
							<Icon id='downArrow' />
						</button>
						<div className={`${classes.whatsappChat} chat__input-wrapper`}>
							<button
								aria-label='Emojis'
								onClick={() => setShowEmojis(!showEmojis)}>
								<Icon
									id='smiley'
									className={`${classes.whatsappChat} chat__input-icon ${
										showEmojis
											? `${classes.whatsappChat} chat__input-icon--highlight`
											: ''
									}`}
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
							{showEmojis && (
								<Grid
									container
									className={classes.whatsappChatEmojiPickerWrapper}>
									<EmojiPicker onEmojiClick={onEmojiClick} />
								</Grid>
							)}
							<div
								className={`${classes.whatsappChat} chat__input`}
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
							<div style={{ padding: '2px', marginLeft: '12px' }}>
								<Stack
									direction='row'
									justifyContent='center'
									alignItems='center'
									spacing={2}>
									<Typography color='textSecondary'>
										<label style={{ fontSize: '20px' }}>
											Conversation is closed.
										</label>
										<br />
										<label style={{ fontSize: '15px' }}>
											You can not send messages in closed conversation.
										</label>
									</Typography>

									<Grid className={classes.manageTemplatesHeaderButtons}>
										<Button
											size='small'
											className={'green'}
											onClick={() => setIsTemplateModal(true)}>
											Send Template
										</Button>
									</Grid>
								</Stack>
							</div>
							<button aria-label='Send message'>
								<Icon
									id='send'
									className={`${classes.whatsappChat} chat__send-icon`}
								/>
							</button>
						</div>
					</footer>
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
