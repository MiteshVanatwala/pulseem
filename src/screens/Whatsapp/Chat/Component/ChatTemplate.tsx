import { Grid } from '@material-ui/core';
import moment from 'moment';
import { getTemplatePreviewData } from '../../Common';
import { fileTypes } from '../../Constant';
import {
	callToActionFieldProps,
	callToActionRowProps,
	quickReplyButtonProps,
	quickReplyButtonsFieldProps,
} from '../../Editor/Types/WhatsappCreator.types';
import { ChatTemplateProps } from '../Types/WhatsappChat.type';
import clsx from 'clsx';
import Icon from './Icon';
import PDF from '../../../../assets/images/pdf.png';
import Video from '../../../../assets/images/video.png';
import Download from '../../../../assets/images/download.png';
import ImagePreview from './ImagePreview';
import imagePlaceholder from '../../../../assets/images/image-placeholder.svg';
import imagePlaceholderX from '../../../../assets/images/image-placeholder-x.svg';

const ChatTemplate = ({
	classes,
	template,
	msgIndex,
	message,
}: ChatTemplateProps) => {
	const { templateData, buttonType, fileData } =
		getTemplatePreviewData(template);
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
	const formatTime = (timeString: string) => {
		return moment(timeString).format('hh:mm');
	};
	return (
		<>
			{message?.IsTemplate ? (
				<p
					key={msgIndex}
					className={`${classes.whatsappChat} chat__msg chat__msg--sent`}>
					<div className='conversation-container'>
						{(templateData?.templateText || buttonType === 'callToAction') && (
							<>
								<div
									className={clsx(
										`${classes.whatsappMobileMessage} sent`,
										'whatsapp-chat'
									)}
									id='conversation-text-preview'>
									{templateData?.templateText?.length > 0 && (
										<div
											className={clsx(
												classes.whatsappMobileMessageTextAndImage,
												'whatsapp-chat'
											)}>
											{fileData?.fileType === fileTypes.IMAGE &&
												fileData?.fileLink?.length > 0 && (
													<img
														src={fileData?.fileLink}
														alt='uploaded-file-preview'
													/>
												)}
											{fileData?.fileType === fileTypes.VIDEO &&
												fileData?.fileLink?.length > 0 && (
													<a
														href={fileData?.fileLink}
														target='_blank'
														rel='noreferrer'>
														<img
															className='video-preview-img'
															src={Video}
															alt='uploaded-file-preview'
														/>
													</a>
												)}
											{fileData?.fileType === fileTypes.DOCUMENT &&
												fileData?.fileLink?.length > 0 && (
													<Grid container alignItems='center'>
														<img
															className='pdf-preview-img'
															src={PDF}
															alt='uploaded-file-preview'
														/>
														<div className={classes.pdfFileName}>
															{
																fileData?.fileLink?.split('/')[
																	fileData?.fileLink?.split('/')?.length - 1
																]
															}
														</div>
														<a
															href={fileData?.fileLink}
															target='_blank'
															rel='noreferrer'>
															<img
																className='download-preview-img'
																src={Download}
																alt='uploaded-file-preview'
															/>
														</a>
													</Grid>
												)}
											<pre>{templateData?.templateText}</pre>
										</div>
									)}
									{buttonType === 'callToAction' &&
										templateData?.templateButtons?.length > 0 && (
											<div
												className={classes.callToActionButtonsWrapper}
												style={{
													borderTop:
														templateData?.templateText?.length <= 0
															? '0px'
															: '1px solid #cbcbcb',
													margin:
														templateData?.templateText?.length <= 0
															? '0px -8px 0px -8px'
															: '4px 0px 0px 0px',
													padding:
														templateData?.templateText?.length <= 0
															? '0px 8px 0px 8px'
															: '0px 0px 0px 0px',
												}}>
												{templateData?.templateButtons?.map(
													(
														button: quickReplyButtonProps | callToActionRowProps
													) => (
														<Grid item key={button.id}>
															{button.typeOfAction === 'phonenumber' ? (
																<a
																	target='_blank'
																	href={`tel:${getValueByFieldName(
																		button,
																		'whatsapp.phoneNumber'
																	)}`}
																	rel='noreferrer'>
																	<i
																		className={`${classes.callToActionButton} zmdi zmdi-phone`}></i>
																	<span
																		className={classes.callToActionButtonText}>
																		{getValueByFieldName(
																			button,
																			'whatsapp.phoneButtonText'
																		)}
																	</span>
																</a>
															) : (
																<a
																	href={getValueByFieldName(
																		button,
																		'whatsapp.websiteURL'
																	)}
																	target='_blank'
																	rel='noreferrer'>
																	<i
																		className={`${classes.callToActionButton} zmdi zmdi-open-in-new`}></i>
																	<span
																		className={classes.callToActionButtonText}>
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
											</div>
										)}
								</div>
							</>
						)}
						{buttonType === 'quickReply' && (
							<>
								<div className={classes.quickReplyButtonWrapper}>
									{templateData?.templateButtons?.map(
										(button: quickReplyButtonProps | callToActionRowProps) => (
											<div
												key={button.id}
												className={`${classes.whatsappMobileMessage} sent quick-reply-button`}
												style={{
													margin: '2px 0px 0px 0px',
													borderRadius: '5px',
													padding: '4px 8px',
													width:
														getValueByFieldName(
															button,
															'whatsapp.websiteButtonText'
														)?.length <= templateData?.templateText?.length
															? 'auto'
															: '',
												}}>
												<span className={classes.quickReplyButtonText}>
													{getValueByFieldName(
														button,
														'whatsapp.websiteButtonText'
													)}
												</span>
											</div>
										)
									)}
								</div>
							</>
						)}
					</div>

					<span className={`${classes.whatsappChat} chat__msg-filler`}> </span>
					<span className={`${classes.whatsappChat} chat__msg-footer`}>
						<span> {formatTime(message.MessageDate)} </span>
						<Icon
							id={message?.SmsStatusId === 2 ? 'singleTick' : 'doubleTick'}
							aria-label={'sent'}
							className={`${classes.whatsappChat} chat__msg-status-icon ${
								message?.SmsStatusId === 6
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
			) : (
				<>
					{message.IsInbound ? (
						<p
							key={msgIndex}
							className={`${classes.whatsappChat} chat__msg chat__msg--rxd`}>
							{message?.MediaUrl?.length === 0 && (
								<span>{message?.Message}</span>
							)}
							{message?.MediaUrl && message?.MediaUrl?.length > 0 && (
								<ImagePreview
									classes={classes}
									className={`${classes.whatsappChat} chat__img`}
									placeholderImg={imagePlaceholder}
									errorImg={imagePlaceholderX}
									src={message?.MediaUrl}
								/>
							)}
							<span className={`${classes.whatsappChat} chat__msg-filler`}>
								{' '}
							</span>
							<span className={`${classes.whatsappChat} chat__msg-footer`}>
								{formatTime(message.MessageDate)}
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
							className={`${classes.whatsappChat} chat__msg chat__msg--sent`}>
							<span>{message.Message}</span>
							<span className={`${classes.whatsappChat} chat__msg-filler`}>
								{' '}
							</span>
							<span className={`${classes.whatsappChat} chat__msg-footer`}>
								<span> {formatTime(message.MessageDate)} </span>
								<Icon
									id={message?.SmsStatusId === 2 ? 'singleTick' : 'doubleTick'}
									aria-label={'sent'}
									className={`${classes.whatsappChat} chat__msg-status-icon ${
										message?.SmsStatusId === 6
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
			)}
		</>
	);
};

export default ChatTemplate;
