import { Box, Button, Grid, Tooltip, Typography, makeStyles } from '@material-ui/core';
import Icon from './Icon';
import { Stack } from '@mui/material';
import EmojiPicker from '../../../../components/Emojis/EmojiPicker';
import Highlighter from 'react-highlight-words';
import { ChatFooterContentProps } from '../Types/WhatsappChat.type';
import { useTranslation } from 'react-i18next';
import { BaseSyntheticEvent, useEffect, useRef, useState } from 'react';
import {
	coreProps,
	tagDataProps,
	updatedVariable,
} from '../../Campaign/Types/WhatsappCampaign.types';
import clsx from 'clsx';
import {
	checkLanguage,
	getTextDirection,
	getVariableValue,
} from '../../Common';
import { useSelector } from 'react-redux';

const useStyles = makeStyles({
	customWidth: {
		maxWidth: 200,
		backgroundColor: 'black',
		fontSize: '14px',
		textAlign: 'center',
		"& span": {
			color: '#000'
		}
	},
	noMaxWidth: {
		maxWidth: 'none',
	},
	root: {
		'& .emoji-picker-react': {
			top: 0
		}

	}
});

const ChatFooterContent = ({
	classes,
	updatedDynamicVariable,
	setDynamicModalVariable,
	setIsDynamcFieldModal,
	newMessage,
	setNewMessage,
	setIsTemplateModal,
	savedTemplate,
	dynamicVariable,
	whatsappChatSession,
	onChatSend,
	activeChatContacts,
	ChatContacts,
	isContactLoader,
	personalFields,
	onChatTemplateDelete,
}: ChatFooterContentProps) => {
	const { t: translator } = useTranslation();
	const localClasses = useStyles();
	const { isRTL } = useSelector((state: { core: coreProps }) => state.core);
	const [showEmojis, setShowEmojis] = useState<boolean>(false);
	const [textDirection, setTextDirection] = useState<string>('ltr');
	const freeFormInputHeight = '17px';
	const templateTextRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		const textElement = document.getElementById('free-from-input');
		if (textElement) {
			textElement.style.height = '5px';
			textElement.style.height = textElement.scrollHeight + 'px';
		}
	}, [newMessage]);
	useEffect(() => {
		const direction = checkLanguage(newMessage, isRTL);
		if (direction !== 'Both') {
			setTextDirection(direction === 'English' ? 'ltr' : 'rtl');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [newMessage]);
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
		const matchedVariable = updatedDynamicVariable?.find(
			(dynamicVariable: updatedVariable) =>
				dynamicVariable.VariableIndex === Number(updatedVariable)
		);
		const variableValue =
			matchedVariable?.FieldTypeId === 1
				? personalFields[matchedVariable?.VariableValue]
				: matchedVariable?.VariableValue;
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
	
	const focusOnMessage = () => {
    const textArea = document.getElementById("free-from-input");
    setTimeout(() => {
      textArea?.focus();
    }, 500)
  }
	
	const onEmojiClick = (emoji: string) => {
		emoji = emoji.trim();
    let afterUpdateCharCount = newMessage.length + emoji.length;
		if (afterUpdateCharCount < 1024) {
			const txtarea = document.getElementById('free-from-input') as HTMLTextAreaElement;
			if (txtarea !== null) {
				var startPos = txtarea.selectionStart || 0;
				var endPos = txtarea.selectionEnd || 0;
				var cursorPos = startPos;
				setNewMessage(newMessage.substring(0, startPos) + emoji + newMessage.substring(endPos, newMessage.length))
				setTimeout(() => {
					cursorPos += emoji.length;
					txtarea.selectionStart = txtarea.selectionEnd = cursorPos;
				}, 10);
			}
			focusOnMessage();
		}
	};

	const onEditableDivChange = (e: BaseSyntheticEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setNewMessage(e.target.value);
	};

	return (
		<>
			<div className={`${classes.whatsappChat} chat__input-wrapper`}>
				{!activeChatContacts?.IsUnsubscribed ? (
					<>
						{whatsappChatSession.IsIn24Window || savedTemplate?.length > 0 ? (
							<>
								{savedTemplate?.length === 0 && (
									<button
										aria-label='Emojis'
										onClick={() => setShowEmojis(!showEmojis)}>
										<EmojiPicker
											classes={classes}
											OnSelectEmoji={(emoji: string) => {
												onEmojiClick(emoji);
											}}
											boxStyles={{ display: 'flex', alignItems: 'end' }}
										/>
									</button>
								)}
								<Tooltip
									disableFocusListener
									title={translator('whatsappManagement.templates')}
									classes={{ tooltip: localClasses.customWidth }}
									placement='top-start'
									arrow>
									<button
										aria-label='chat'
										onClick={() => setIsTemplateModal(true)}>
										<Icon
											id='chat'
											className={`${classes.whatsappChat} chat__input-icon ${showEmojis
												? `${classes.whatsappChat} chat__input-icon--highlight`
												: ''
												}`}
										/>
									</button>
								</Tooltip>
								{savedTemplate?.length !== 0 ? (
									<Box
										className={`${classes.whatsappChat} chat__input m`}
										style={{
											direction: getTextDirection(newMessage, isRTL),
										}}>
										{/* @ts-ignore */}
										<Highlighter
											searchWords={dynamicVariable}
											autoEscape={true}
											textToHighlight={newMessage}
											highlightTag={(tagData: tagDataProps) =>
												highlightText(tagData)
											}
										/>
									</Box>
								) : (
									<textarea
										className={`${classes.whatsappChat} chat__input s`}
										id={'free-from-input'}
										ref={templateTextRef}
										style={{
											direction:
												newMessage?.length > 0
													? textDirection === 'rtl'
														? 'rtl'
														: 'ltr'
													: isRTL
														? 'rtl'
														: 'ltr',
											minHeight: freeFormInputHeight,
											resize: 'none',
											overflowY: 'auto',
										}}
										placeholder={translator('whatsappChat.typeMessage')}
										value={newMessage}
										onChange={onEditableDivChange}
									/>
								)}
							</>
						) : ChatContacts?.length === 0 && !isContactLoader ? (
							<div
								className={classes.noContactDiv}
								style={{ padding: '2px', marginLeft: '12px', width: '100%' }}>
								<Stack
									direction='row'
									justifyContent='center'
									alignItems='center'
									spacing={2}>
									<Typography color='textSecondary'>
										<label style={{ fontSize: '22px' }}>
											<>{translator('whatsappChat.noChat')}</>
										</label>
									</Typography>
								</Stack>
							</div>
						) : (
							<div
								style={{ padding: '2px', marginLeft: '12px', width: '100%' }}>
								<Stack
									direction='row'
									justifyContent='space-around'
									alignItems='center'
									spacing={2}>
									<Typography color='textSecondary'>
										<label style={{ fontSize: '22px', fontWeight: 'bolder' }}>
											<>{translator('whatsappChat.conversation')}</>
										</label>
										<br />
										<label style={{ fontSize: '17px', fontWeight: 'bolder' }}>
											<>{translator('whatsappChat.cantSend')}</>
										</label>
									</Typography>

									<Grid className={classes.manageTemplatesHeaderButtons}>
										<Button
											className={clsx(
												classes.btn,
												classes.btnRounded
											)}
											size='small'
											style={{ padding: '6px 22px' }}
											onClick={() => setIsTemplateModal(true)}
										>
											{translator('whatsappChat.send')}
										</Button>
									</Grid>
								</Stack>
							</div>
						)}
						{savedTemplate?.length > 0 && (
							<>
								<button
									aria-label='Delete message'
									onClick={onChatTemplateDelete}>
									<Icon
										id='delete'
										className={`${classes.whatsappChat} chat__delete-icon`}
									/>
								</button>
							</>
						)}{' '}
						{(whatsappChatSession.IsIn24Window ||
							savedTemplate?.length > 0) && (
								<button aria-label='Send message' onClick={onChatSend}>
									<Icon
										id='send'
										className={`${classes.whatsappChat} chat__send-icon`}
									/>
								</button>
							)}{' '}
					</>
				) : (
					<div style={{ padding: '2px', marginLeft: '12px', width: '100%' }}>
						<Stack
							direction='row'
							justifyContent='center'
							alignItems='center'
							spacing={2}>
							<Typography color='textSecondary'>
								<label style={{ fontSize: '22px' }}>
									<>{translator('whatsappChat.unsubscribe')}</>
								</label>
							</Typography>
						</Stack>
					</div>
				)}
			</div>
		</>
	);
};

export default ChatFooterContent;
