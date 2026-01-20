import { Button, Grid, Tabs, Tab, TextField, Box, IconButton, CircularProgress, Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
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
import { useSelector, useDispatch } from 'react-redux';
import { getQuickResponses, saveQuickResponse, deleteQuickResponse } from '../../../../redux/reducers/whatsappSlice';
import { StateType } from '../../../../Models/StateTypes';

interface QuickResponseProps {
	ID: number;
	Text: string;
	CreatedAt?: number;
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
		padding: '4px 2px',
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
		'@media (max-width: 768px)': {
			fontSize: '0.875rem',
			padding: '6px 12px',
			margin: '0 2px',
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
		width: '100%',
	},
	modalContainer: {
		minWidth: '600px',
		maxWidth: '800px',
		width: '800px',
		display: 'flex',
		flexDirection: 'column',
		maxHeight: '70vh',
		overflow: 'visible',
		'@media (max-width: 768px)': {
			minWidth: '68vw',
			maxWidth: '68vw',
			width: '68vw',
			maxHeight: '65vh',
		},
		'@media (max-width: 568px)': {
			width: '85vw',
			minWidth: '85vw',
			maxWidth: '85vw',
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
		zIndex: 1500,
		'& .emoji-picker-react': {
			position: 'absolute !important',
			bottom: '100% !important',
			right: '0 !important',
			top: 'auto !important',
			left: 'auto !important',
			marginBottom: '2px !important',
			maxWidth: '350px !important',
			width: '350px !important',
			boxShadow: '0 4px 16px rgba(0,0,0,0.2) !important',
			zIndex: '1500 !important',
			height: 185,
		},
		'@media (max-width: 768px)': {
			'& .emoji-picker-react': {
				maxWidth: '280px !important',
				width: '280px !important',
			},
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
			whiteSpace: 'pre-wrap',
			wordBreak: 'break-word',
			overflowWrap: 'break-word',
		},
	},
	quickResponseButtonContainer: {
		display: 'flex',
		justifyContent: 'flex-end',
		flexWrap: 'wrap',
		'& > *': {
			marginLeft: '8px',
		},
		'@media (max-width: 768px)': {
			'& > *': {
				marginLeft: '4px',
			},
		},
	},
	quickResponseButton: {
		'@media (max-width: 768px)': {
			fontSize: '0.75rem',
			padding: '4px 8px',
			minWidth: 'auto',
		},
	},
	addResponseContainer: {
		padding: '16px',
		textAlign: 'right',
		borderTop: '1px solid #e0e0e0',
		'@media (max-width: 768px)': {
			padding: '12px',
		},
	},
	addResponseContainerRTL: {
		textAlign: 'left',
	},
	formContainer: {
		padding: '16px',
		borderTop: '1px solid #e0e0e0',
		'@media (max-width: 768px)': {
			padding: '12px',
		},
	},
	buttonGroup: {
		display: 'flex',
		justifyContent: 'flex-end',
		flexWrap: 'wrap',
		'& > *': {
			marginLeft: '8px',
			marginTop: '4px',
		},
		'@media (max-width: 768px)': {
			'& > *': {
				marginLeft: '4px',
			},
		},
	},
	loadingOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(255, 255, 255, 0.8)',
		zIndex: 1000,
		borderRadius: '4px',
	},
	deletingRow: {
		opacity: 0.5,
		pointerEvents: 'none',
		transition: 'opacity 0.3s ease',
	},
	loaderWrapper: {
		display: 'flex',
		alignItems: 'center',
		gap: '8px',
	},
});

const ChatTemplateModal = ({
	classes,
	onChoose,
	savedTemplateList,
	isIn24Window = true,
}: ChatTemplateModalExtendedProps) => {
	const { t: translator } = useTranslation();
	const dispatch = useDispatch();
	const tabClasses = useTabStyles();
	const { isRTL } = useSelector((state: any) => state.core);
	const { quickResponses } = useSelector((state: StateType) => state.whatsapp);
	const [expandedTemplate, setExpandedTemplate] = useState<any>([]);
	const [activeTab, setActiveTab] = useState(isIn24Window ? 0 : 1);
	const [isAddingResponse, setIsAddingResponse] = useState(false);
	const [newResponseText, setNewResponseText] = useState('');
	const [isSaving, setIsSaving] = useState(false);
	const [deletingId, setDeletingId] = useState<number | null>(null);
	const [snackbar, setSnackbar] = useState<{
		open: boolean;
		message: string;
		severity: 'success' | 'error' | 'info' | 'warning';
	}>({
		open: false,
		message: '',
		severity: 'success',
	});
	const textFieldRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		fetchQuickResponses();
	}, []);

	const fetchQuickResponses = async () => {
		try {
			await dispatch<any>(getQuickResponses());
		} catch (error) {
			console.error('Error fetching quick responses:', error);
		}
	};

	const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
		setActiveTab(newValue);
		setIsAddingResponse(false);
		setNewResponseText('');
	};

	const handleAddQuickResponse = async () => {
		if (newResponseText.trim() && !isSaving) {
			setIsSaving(true);
			try {
				const response: any = await dispatch<any>(saveQuickResponse({
					ID: 0,
					Text: newResponseText.trim()
				}));

				if (response.payload?.Status === 'Success' ||
					response.payload?.StatusCode === 200 ||
					response.payload?.StatusCode === 201 ||
					response.type.endsWith('/fulfilled')) {
					await fetchQuickResponses();
					setNewResponseText('');
					setIsAddingResponse(false);
					setSnackbar({
						open: true,
						message: translator('whatsappChat.quickResponseSaved') || 'Quick response saved successfully!',
						severity: 'success',
					});
				} else {
					setSnackbar({
						open: true,
						message: translator('whatsapp.error') || 'Failed to save quick response',
						severity: 'error',
					});
				}
			} catch (error) {
				console.error('Error saving quick response:', error);
				setSnackbar({
					open: true,
					message: translator('whatsapp.error') || 'An error occurred while saving',
					severity: 'error',
				});
			} finally {
				setIsSaving(false);
			}
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

	const handleDeleteQuickResponse = async (id: number) => {
		setDeletingId(id);
		try {
			const response: any = await dispatch<any>(deleteQuickResponse(id));
			if (response.payload?.Status === 'Success' ||
				response.payload?.StatusCode === 200 ||
				response.type.endsWith('/fulfilled')) {
				await fetchQuickResponses();
				setSnackbar({
					open: true,
					message: translator('whatsappChat.quickResponseDeleted') || 'Quick response deleted successfully!',
					severity: 'success',
				});
			} else {
				setSnackbar({
					open: true,
					message: translator('whatsapp.error') || 'Failed to delete quick response',
					severity: 'error',
				});
			}
		} catch (error) {
			console.error('Error deleting quick response:', error);
			setSnackbar({
				open: true,
				message: translator('whatsapp.error') || 'An error occurred while deleting',
				severity: 'error',
			});
		} finally {
			setDeletingId(null);
		}
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

	const handleCloseSnackbar = () => {
		setSnackbar({ ...snackbar, open: false });
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
				{isSaving && (
					<Box className={tabClasses.loadingOverlay}>
						<Box className={tabClasses.loaderWrapper}>
							<CircularProgress size={40} />
							<span>{translator('common.Saving') || 'Saving...'}</span>
						</Box>
					</Box>
				)}

				<Box className={tabClasses.quickResponseWrapper}>
					<ul className={clsx(classes.chooseTemplateModalUl, classes.noMargin)}>
						{quickResponses?.map((response: QuickResponseProps) => (
							<li
								key={response.ID}
								className={clsx(
									tabClasses.quickResponseList,
									deletingId === response.ID && tabClasses.deletingRow
								)}
							>
								<Grid container alignItems='center' spacing={1}>
									<Grid item xs={12} sm={8}>
										<p>{response.Text}</p>
									</Grid>
									<Grid item xs={12} sm={4} className={isRTL ? classes.textLeft : classes.textRight}>
										<Box className={tabClasses.quickResponseButtonContainer}>
											<Button
												variant="contained"
												color="primary"
												className={clsx(classes.btn, classes.btnRounded, tabClasses.quickResponseButton)}
												onClick={() => handleSelectQuickResponse(response.Text)}
												disabled={deletingId === response.ID}
											>
												{translator('whatsappChat.select')}
											</Button>
											<IconButton
												onClick={() => handleDeleteQuickResponse(response.ID)}
												className={clsx(classes.sendIcon, classes.p5)}
												size="small"
												disabled={deletingId === response.ID}
											>
												{deletingId === response.ID ? (
													<CircularProgress size={20} />
												) : (
													<Delete />
												)}
											</IconButton>
										</Box>
									</Grid>
								</Grid>
							</li>
						))}
						{(!quickResponses || quickResponses.length === 0) && !isSaving && (
							<li className={tabClasses.noQuickResponsesText}>
								{translator('whatsappChat.noQuickResponses')}
							</li>
						)}
					</ul>
				</Box>

				{!isAddingResponse && (
					<Box className={clsx(tabClasses.addResponseContainer, isRTL && tabClasses.addResponseContainerRTL)}>
						<Button
							variant="contained"
							color="primary"
							className={clsx(classes.btn, classes.btnRounded, tabClasses.quickResponseButton)}
							onClick={() => setIsAddingResponse(true)}
							disabled={isSaving}
						>
							{translator('whatsappChat.addQuickResponse')}
						</Button>
					</Box>
				)}

				{isAddingResponse && (
					<Box className={tabClasses.formContainer}>
						<Box sx={{ position: 'relative', marginBottom: '16px' }}>
							<TextField
								fullWidth
								multiline
								rows={4}
								variant='outlined'
								placeholder={translator('whatsappChat.enterQuickResponse')}
								value={newResponseText}
								onChange={(e) => setNewResponseText(e.target.value)}
								inputRef={textFieldRef}
								disabled={isSaving}
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
						<Box className={tabClasses.buttonGroup}>
							<Button
								variant="contained"
								color="primary"
								className={clsx(classes.btn, classes.btnRounded, tabClasses.quickResponseButton)}
								onClick={() => {
									setIsAddingResponse(false);
									setNewResponseText('');
								}}
								disabled={isSaving}
							>
								{translator('common.cancel')}
							</Button>
							<Button
								variant="contained"
								color="primary"
								className={clsx(classes.btn, classes.btnRounded, tabClasses.quickResponseButton)}
								onClick={handleAddQuickResponse}
								disabled={!newResponseText.trim() || isSaving}
							>
								{isSaving ? (
									<Box className={tabClasses.loaderWrapper}>
										<CircularProgress size={16} color="inherit" />
										<span>{translator('common.Saving')}</span>
									</Box>
								) : (
									translator('common.Save')
								)}
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
		<>
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

			<Snackbar
				open={snackbar.open}
				autoHideDuration={4000}
				onClose={handleCloseSnackbar}
				anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
			>
				<Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
					{snackbar.message}
				</Alert>
			</Snackbar>
		</>
	);
};

export default ChatTemplateModal;
