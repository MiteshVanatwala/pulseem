import { Box, Button, Grid, Typography } from '@material-ui/core';
import Icon from './Icon';
import { Stack } from '@mui/material';
import EmojiPicker from '../../../../components/Emojis/EmojiPicker';
import Highlighter from 'react-highlight-words';
import { ChatFooterContentProps } from '../Types/WhatsappChat.type';
import { useTranslation } from 'react-i18next';
import { BaseSyntheticEvent, useState } from 'react';
import {
	tagDataProps,
	updatedVariable,
} from '../../Campaign/Types/WhatsappCampaign.types';
import clsx from 'clsx';
import { getVariableValue } from '../../Common';

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
	filteredSideChatContacts,
	isContactLoader,
}: ChatFooterContentProps) => {
	const { t: translator } = useTranslation();
	const [showEmojis, setShowEmojis] = useState<boolean>(false);
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
		e.preventDefault();
		e.stopPropagation();
		setNewMessage(e.target.textContent);
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
											boxStyles={{ alignItems: 'center' }}
										/>
									</button>
								)}
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
								{savedTemplate?.length !== 0 ? (
									<Box className={`${classes.whatsappChat} chat__input m`}>
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
									<div
										className={`${classes.whatsappChat} chat__input s`}
										id={'free-from-input'}
										data-text='Type a message'
										contentEditable={true}
										suppressContentEditableWarning={true}
										onKeyUp={onEditableDivChange}
									/>
								)}
							</>
						) : filteredSideChatContacts?.length === 0 && !isContactLoader ? (
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
