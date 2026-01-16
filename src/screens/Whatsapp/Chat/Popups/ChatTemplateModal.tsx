import { Button, Grid, Tabs, Tab, TextField, Box, IconButton } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import '../css/ChatTemplate.css';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { chatModalProps } from '../Types/WhatsappChat.type';
import {
	buttonsDataProps,
	callToActionFieldProps,
	callToActionProps,
	callToActionRowProps,
	quickReplyButtonProps,
	quickReplyButtonsFieldProps,
	savedTemplateCallToActionProps,
	savedTemplateCardProps,
	savedTemplateListProps,
	savedTemplateMediaProps,
	savedTemplateQuickReplyProps,
	savedTemplateTextProps,
	savedTemplateTypesProps,
} from '../../Editor/Types/WhatsappCreator.types';
import { buttonTypes, templateTypes } from '../../Constant';
import uniqid from 'uniqid';
import { getTemplateName } from '../../Common';
import { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import EmojiPicker from '../../../../components/Emojis/EmojiPicker';
import { Delete } from '@material-ui/icons';
import clsx from 'clsx';
import { useSelector } from 'react-redux';

interface QuickResponseProps {
	id: string;
	text: string;
	createdAt: number;
}

interface ChatTemplateModalExtendedProps extends chatModalProps {
	isIn24Window?: boolean;
}

const useTabStyles = makeStyles({
	tabsRoot: {
		borderBottom: 'none',
		minHeight: 'auto',
		marginBottom: '0px',
		position: 'sticky',
		top: 0,
		backgroundColor: '#fff',
		zIndex: 10,
		padding: '4px 0px',
		borderRadius: '10px',
	},
	tabsIndicator: {
		display: 'none',
	},
	tabRoot: {
		textTransform: 'none',
		minWidth: 0,
		minHeight: 'auto',
		fontWeight: 700,
		fontSize: '1rem',
		padding: '8px 16px',
		margin: '0 4px',
		borderRadius: '10px',
		color: '#000',
		backgroundColor: '#f5f5f5',
		transition: 'all 0.3s ease',
		'&:hover': {
			backgroundColor: '#e8e8e8',
		},
	},
	tabSelected: {
		color: '#fff !important',
		background: 'linear-gradient(90deg, #FF0076 1.31%, #FF0054 33.07%, #FF4D2A 134.74%) !important',
	},
	tabContainer: {
		flex: 1,
		overflowY: 'auto',
		overflowX: 'hidden',
		position: 'relative'
	},
	modalContainer: {
		minWidth: '600px',
		maxWidth: '800px',
		width: '100%',
		display: 'flex',
		flexDirection: 'column',
		maxHeight: '70vh',
		overflow: 'visible',
		'@media (max-width: 768px)': {
			minWidth: '90vw',
			maxWidth: '90vw',
		},
	},
	quickResponseWrapper: {
		maxHeight: '294px',
		overflowY: 'auto',
		overflowX: 'hidden',
		marginBottom: '16px'
	},
	iconStyle: {
		marginRight: '10px',
		fontSize: '0.7rem',
		fontFamily: 'fontawesome',
	},
	emojiPickerWrapper: {
		position: 'absolute',
		bottom: '8px',
		right: '8px',
		zIndex: 1400,
		'& .emoji-picker-react': {
			position: 'absolute !important',
			bottom: '100% !important',
			right: '0 !important',
			top: 'auto !important',
			left: 'auto !important',
			marginBottom: '8px !important',
			maxWidth: '350px !important',
			width: '350px !important',
			boxShadow: '0 4px 16px rgba(0,0,0,0.2) !important',
		},
	},
	noQuickResponsesText: {
		padding: '24px',
		textAlign: 'center',
		color: '#999'
	},
	quickResponseList: {
		padding: '12px',
		borderBottom: '1px solid #e0e0e0',
		'& p': {
			margin: 0,
			whiteSpace: 'pre-wrap'
		},
	},
});

const ChatTemplateModal = ({
	classes,
	onChoose,
	savedTemplateList,
	isIn24Window = true,
}: ChatTemplateModalExtendedProps) => {
	const { t: translator } = useTranslation();
	const tabClasses = useTabStyles();
	const { isRTL } = useSelector((state: any) => state.core);
	const [expandedTemplate, setExpandedTemplate] = useState<any>([]);
	const [activeTab, setActiveTab] = useState(isIn24Window ? 0 : 1);
	const [quickResponses, setQuickResponses] = useState<QuickResponseProps[]>([]);
	const [isAddingResponse, setIsAddingResponse] = useState(false);
	const [newResponseText, setNewResponseText] = useState('');
	const textFieldRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		const savedResponses = localStorage.getItem('quickResponses');
		if (savedResponses) {
			setQuickResponses(JSON.parse(savedResponses));
		}
	}, []);

	useEffect(() => {
		if (quickResponses.length > 0) {
			localStorage.setItem('quickResponses', JSON.stringify(quickResponses));
		}
	}, [quickResponses]);

	const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
		setActiveTab(newValue);
		setIsAddingResponse(false);
		setNewResponseText('');
	};

	const handleAddQuickResponse = () => {
		if (newResponseText.trim()) {
			const newResponse: QuickResponseProps = {
				id: uniqid(),
				text: newResponseText.trim(),
				createdAt: Date.now(),
			};
			setQuickResponses([...quickResponses, newResponse]);
			setNewResponseText('');
			setIsAddingResponse(false);
		}
	};

	const handleEmojiSelect = (emoji: string) => {
		const textarea = textFieldRef.current;
		if (textarea) {
			const start = textarea.selectionStart;
			const end = textarea.selectionEnd;
			const text = newResponseText;
			const before = text.substring(0, start);
			const after = text.substring(end);
			const newText = before + emoji + after;

			setNewResponseText(newText);

			setTimeout(() => {
				textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
				textarea.focus();
			}, 0);
		} else {
			setNewResponseText(newResponseText + emoji);
		}
	};

	const handleDeleteQuickResponse = (id: string) => {
		const updatedResponses = quickResponses.filter(response => response.id !== id);
		setQuickResponses(updatedResponses);
		localStorage.setItem('quickResponses', JSON.stringify(updatedResponses));
	};

	const handleSelectQuickResponse = (text: string) => {
		const quickResponseTemplate: any = {
			TemplateId: '',
			Data: {
				types: {
					text: {
						body: text
					}
				}
			}
		};
		onChoose(quickResponseTemplate, text);
	};

	const setButtonsData = (buttonType: string, data: buttonsDataProps[]) => {
		let buttonData: quickReplyButtonProps[] | callToActionProps = [];
		switch (buttonType) {
			case 'quickReply':
				buttonData = data?.map((button: buttonsDataProps) => {
					return {
						id: uniqid(),
						typeOfAction: '',
						fields: [
							{
								fieldName: 'whatsapp.websiteButtonText',
								type: 'text',
								placeholder: 'whatsapp.websiteButtonTextPlaceholder',
								value: button.title,
							},
						],
					};
				});
				return buttonData ? buttonData : [];
			case 'callToAction':
				buttonData = data?.map((button: buttonsDataProps) => {
					if (button?.type === 'PHONE_NUMBER') {
						return {
							id: uniqid(),
							typeOfAction: 'phonenumber',
							fields: [
								{
									fieldName: 'whatsapp.phoneButtonText',
									type: 'text',
									placeholder: 'whatsapp.phoneButtonTextPlaceholder',
									value: button.title,
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
									value: button.phone,
								},
							],
						};
					} else {
						return {
							id: uniqid(),
							typeOfAction: 'website',
							fields: [
								{
									fieldName: 'whatsapp.websiteButtonText',
									type: 'text',
									placeholder: 'whatsapp.websiteButtonTextPlaceholder',
									value: button.title,
								},
								{
									fieldName: 'whatsapp.websiteURL',
									type: 'text',
									placeholder: 'whatsapp.websiteURLPlaceholder',
									value: button.url,
								},
							],
						};
					}
				});
				return buttonData ? buttonData : [];
		}
	};
	const getTemplateText = (template: savedTemplateListProps) => {
		if (template && template?.Data && template?.Data?.types) {
			if (templateTypes.QUICK_REPLY in template?.Data?.types) {
				const quickReplyData: savedTemplateQuickReplyProps =
					template?.Data?.types[templateTypes.QUICK_REPLY];
				return quickReplyData?.body;
			}
			if (templateTypes.CALL_TO_ACTION in template?.Data?.types) {
				const callToActionData: savedTemplateCallToActionProps =
					template?.Data?.types[templateTypes.CALL_TO_ACTION];
				return callToActionData?.body;
			} else if (templateTypes.CARD in template?.Data?.types) {
				const cardData: savedTemplateCardProps =
					template?.Data?.types[templateTypes.CARD];
				return cardData?.title;
			} else if (templateTypes.MEDIA in template?.Data?.types) {
				const mediaData: savedTemplateMediaProps =
					template?.Data?.types[templateTypes.MEDIA];
				return mediaData?.body;
			} else if (templateTypes.TEXT in template?.Data?.types) {
				const textData: savedTemplateTextProps =
					template?.Data?.types[templateTypes.TEXT];
				return textData?.body;
			}
		}
		return null;
	};
	const getValueByFieldName = (
		button: quickReplyButtonProps | callToActionRowProps,
		fieldName: string
	) => {
		return (
			button.fields.find(
				(field: quickReplyButtonsFieldProps | callToActionFieldProps) => {
					return field.fieldName === fieldName;
				}
			)?.value || ''
		);
	};

	const getButton = (templateData: savedTemplateTypesProps) => {
		let updatedButtonType: string = '';
		let button: quickReplyButtonProps[] | callToActionProps = [];
		if (templateData) {
			if ('quick-reply' in templateData) {
				const quickReplyData: savedTemplateQuickReplyProps =
					templateData?.['quick-reply'];
				updatedButtonType = buttonTypes.QUICK_REPLY;
				const buttonData = setButtonsData(
					buttonTypes.QUICK_REPLY,
					quickReplyData?.actions
				);
				button = buttonData ? buttonData : [];
			}
			if ('call-to-action' in templateData) {
				const callToActionData: savedTemplateCallToActionProps =
					templateData?.['call-to-action'];
				updatedButtonType = 'callToAction';
				const buttonData = setButtonsData(
					'callToAction',
					callToActionData?.actions
				);
				button = buttonData ? buttonData : [];
			} else if ('card' in templateData) {
				const cardData: savedTemplateCardProps = templateData?.['card'];
				if (cardData?.actions?.length > 0) {
					if (cardData?.actions[0]?.type !== 'QUICK_REPLY') {
						updatedButtonType = buttonTypes.CALL_TO_ACTION;
						const buttonData = setButtonsData(
							buttonTypes.CALL_TO_ACTION,
							cardData?.actions
						);
						button = buttonData ? buttonData : [];
					} else {
						updatedButtonType = buttonTypes.QUICK_REPLY;
						const buttonData = setButtonsData(
							buttonTypes.QUICK_REPLY,
							cardData?.actions
						);
						button = buttonData ? buttonData : [];
					}
				}
			}
		}
		if (updatedButtonType === buttonTypes.QUICK_REPLY) {
			return (
				<Grid item xs={12}>
					{button?.map(
						(button: quickReplyButtonProps | callToActionRowProps) => (
							<div
								key={button.id}
								className={`${classes.whatsappMobileMessage} sent quick-reply-button`}
								style={{
									margin: '2px 0px 0px 0px',
									borderRadius: '5px',
									padding: '4px 8px',
									width: 'auto',
								}}
							>
								<span className={classes.quickReplyButtonText}>
									{getValueByFieldName(button, 'whatsapp.websiteButtonText')}
								</span>
							</div>
						)
					)}
				</Grid>
			);
		} else if (updatedButtonType === buttonTypes.CALL_TO_ACTION) {
			return (
				<Grid item xs={12}>
					{button?.map(
						(button: quickReplyButtonProps | callToActionRowProps) => (
							<Grid
								item
								key={button.id}
								className={classes.calltoActionButtonChatWrapper}>
								{button.typeOfAction === 'phonenumber' ? (
									<a
										className={classes.calltoActionButtonChat}
										target='_blank'
										href={`tel:${getValueByFieldName(
											button,
											'whatsapp.phoneNumber'
										)}`}
										rel='noreferrer'>
										<i
											className={`${classes.callToActionButton} zmdi zmdi-phone`}></i>
										<span className={classes.callToActionButtonText}>
											{getValueByFieldName(button, 'whatsapp.phoneButtonText')}
										</span>
									</a>
								) : (
									<a
										className={classes.calltoActionButtonChat}
										href={getValueByFieldName(button, 'whatsapp.websiteURL')}
										target='_blank'
										rel='noreferrer'>
										<i
											className={`${classes.callToActionButton} zmdi zmdi-open-in-new`}></i>
										<span className={classes.callToActionButtonText}>
											{getValueByFieldName(
												button,
												'whatsapp.websiteButtonText'
											)}
										</span>
									</a>
								)}
							</Grid>
						)
					)}
				</Grid>
			);
		}
	};

	const renderQuickResponseTab = () => {
		return (
			<div className={classes.templateListModalContent}>
				<Box className={tabClasses.quickResponseWrapper}>
					<ul className={clsx(classes.chooseTemplateModalUl, classes.noMargin)}>
						{quickResponses.map((response) => (
							<li key={response.id} className={tabClasses.quickResponseList}>
								<Grid container alignItems='center' spacing={2}>
									<Grid item xs={9}>
										<p>{response.text}</p>
									</Grid>
									<Grid item xs={3} className={isRTL ? classes.textLeft : classes.textRight}>
										<Button
											variant="contained"
											color="primary"
											className={clsx(classes.btn, classes.btnRounded, classes.mr10)}
											onClick={() => handleSelectQuickResponse(response.text)}
										>
											{translator('whatsappChat.select')}
										</Button>
										<IconButton
											onClick={() => handleDeleteQuickResponse(response.id)}
											className={clsx(classes.sendIcon, classes.p5)}
										>
											<Delete />
										</IconButton>
									</Grid>
								</Grid>
							</li>
						))}
						{quickResponses.length === 0 && (
							<li className={tabClasses.noQuickResponsesText}>
								{translator('whatsappChat.noQuickResponses')}
							</li>
						)}
					</ul>
				</Box>

				{!isAddingResponse && (
					<Box sx={{ padding: '16px', textAlign: isRTL ? 'left' : 'right', borderTop: '1px solid #e0e0e0' }}>
						<Button
							variant="contained"
							color="primary"
							className={clsx(classes.btn, classes.btnRounded)}
							onClick={() => setIsAddingResponse(true)}
						>
							{translator('whatsappChat.addQuickResponse')}
						</Button>
					</Box>
				)}

				{isAddingResponse && (
					<Box sx={{ padding: '16px', borderTop: '1px solid #e0e0e0' }}>
						<Box sx={{ position: 'relative', marginBottom: '16px' }}>
							<TextField
								fullWidth
								multiline
								rows={3}
								variant='outlined'
								placeholder={translator('whatsappChat.enterQuickResponse')}
								value={newResponseText}
								onChange={(e) => setNewResponseText(e.target.value)}
								inputRef={textFieldRef}
							/>
							<Box className={tabClasses.emojiPickerWrapper}>
								<EmojiPicker
									classes={classes}
									boxStyles={{
										position: 'static',
										display: 'flex',
										flexDirection: 'column-reverse'
									}}
									OnSelectEmoji={handleEmojiSelect}
								/>
							</Box>
						</Box>
						<Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
							<Button
								variant="contained"
								color="primary"
								className={clsx(classes.btn, classes.btnRounded, classes.mlr10)}
								onClick={() => {
									setIsAddingResponse(false);
									setNewResponseText('');
								}}
							>
								{translator('common.cancel')}
							</Button>
							<Button
								variant="contained"
								color="primary"
								className={clsx(classes.btn, classes.btnRounded)}
								onClick={handleAddQuickResponse}
								disabled={!newResponseText.trim()}
							>
								{translator('common.Save')}
							</Button>
						</Box>
					</Box>
				)}
			</div>
		);
	};

	const renderTemplatesTab = () => {
		return (
			<div className={classes.templateListModalContent}>
				<ul className={classes.chooseTemplateModalUl}>
					{savedTemplateList?.map(
						(template: savedTemplateListProps, index: number) => (
							<section
								className='accordion'
								key={`templatelist_${template.TemplateId}_${index}`}>
								<input
									type='checkbox'
									name='collapse'
									id={template?.TemplateId}
									onChange={(event: any) => {
										if (event.target.checked) {
											setExpandedTemplate([...expandedTemplate, template?.TemplateId])
										} else {
											setExpandedTemplate(expandedTemplate.filter((item: any) => item !== template?.TemplateId))
										}
									}}
								/>
								<h2 className='handle'>
									<label htmlFor={template?.TemplateId}>
										{
											expandedTemplate.indexOf(template?.TemplateId) !== -1 ? (
												<FaChevronDown
													className={tabClasses.iconStyle}
												/>
											) : (
												<FaChevronRight
													className={tabClasses.iconStyle}
												/>
											)
										}
										{getTemplateName(template)}
									</label>
								</h2>
								<div className='content'>
									<Grid
										container
										className={
											classes.chatTemplateModalTemplateDataWrapper
										}>
										<Grid item>
											<p>{getTemplateText(template)}</p>
										</Grid>
										<Grid item>
											<Button
												variant="contained"
												color="primary"
												className={clsx(classes.btn, classes.btnRounded)}
												size='small'
												autoFocus
												onClick={() => onChoose(template, getTemplateText(template))}
											>
												{translator('whatsappChat.select')}
											</Button>
										</Grid>
									</Grid>
									<Grid container>{getButton(template?.Data?.types)}</Grid>
								</div>
							</section>
						)
					)}
				</ul>
			</div>
		);
	};

	return (
		<div className={tabClasses.modalContainer}>
			{isIn24Window && (
				<Box sx={{ position: 'sticky', top: 0, zIndex: 10, border: '2px solid #F65026', borderRadius: '10px' }}>
					<Tabs
						value={activeTab}
						onChange={handleTabChange}
						variant='fullWidth'
						classes={{
							root: tabClasses.tabsRoot,
							indicator: tabClasses.tabsIndicator,
						}}
					>
						<Tab
							label={translator('whatsappChat.quickResponse')}
							classes={{
								root: tabClasses.tabRoot,
								selected: tabClasses.tabSelected,
							}}
						/>
						<Tab
							label={translator('whatsappChat.templates')}
							classes={{
								root: tabClasses.tabRoot,
								selected: tabClasses.tabSelected,
							}}
						/>
					</Tabs>
				</Box>
			)}
			<Box className={tabClasses.tabContainer}>
				{activeTab === 0 && isIn24Window && renderQuickResponseTab()}
				{(activeTab === 1 || !isIn24Window) && renderTemplatesTab()}
			</Box>
		</div>
	);
};

export default ChatTemplateModal;
