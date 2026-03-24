import { Grid } from '@material-ui/core';
import moment from 'moment';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import {
	getTemplatePreviewData,
	getTemplateTextWithVariable,
	getTextDirection,
} from '../../Common';
import { fileTypes } from '../../Constant';
import {
	callToActionFieldProps,
	callToActionRowProps,
	coreProps,
	quickReplyButtonProps,
	quickReplyButtonsFieldProps,
} from '../../Editor/Types/WhatsappCreator.types';
import {
	APIWhatsappChatDetailData,
	ChatTemplateProps,
} from '../Types/WhatsappChat.type';
import clsx from 'clsx';
import Icon from './Icon';
import PDF from '../../../../assets/images/pdf.png';
import ZIP from '../../../../assets/images/zip.png';
import PPT from '../../../../assets/images/ppt.png';
import XLSX from '../../../../assets/images/xlsx.png';
import DOC from '../../../../assets/images/doc.png';
import Video from '../../../../assets/images/video.png';
import Download from '../../../../assets/images/download.png';
import ImagePreview from './ImagePreview';
import imagePlaceholder from '../../../../assets/images/image-placeholder.svg';
import imagePlaceholderX from '../../../../assets/images/image-placeholder-x.svg';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

const ChatTemplate = ({
	classes,
	template,
	msgIndex,
	message,
	variables,
}: ChatTemplateProps) => {
	const { t: translator } = useTranslation();
	const { isRTL } = useSelector((state: { core: coreProps }) => state.core);
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
	const isGif = (message: APIWhatsappChatDetailData): boolean =>
		!!(
			message.MediaContentType?.includes('image/gif') ||
			message.MediaUrl?.toLowerCase().includes('.gif')
		);
	const getIconForFile = (message: APIWhatsappChatDetailData) => {
		if (message.MediaContentType?.includes('spreadsheetml.sheet')) {
			return XLSX;
		} else if (
			message.MediaContentType?.includes('presentationml.presentation')
		) {
			return PPT;
		} else if (message.MediaContentType?.includes('pdf')) {
			return PDF;
		} else if (message.MediaContentType?.includes('zip')) {
			return ZIP;
		} else {
			return DOC;
		}
	};

	const getIconName = (statusId: number) => {
		switch (statusId) {
			case 2:
				return 'singleTick';
			case 3:
			case 6:
				return 'doubleTick';
			case 4:
			case 5:
			case 7:
			case 11:
				return 'cancel';
			default:
				return '';
		}
	}

	const renderGif = (src: string, caption?: string) => (
		<div style={{ maxWidth: 280, position: 'relative', borderRadius: 8, overflow: 'hidden' }}>
			<video
				autoPlay
				loop
				muted
				playsInline
				style={{
					width: '100%',
					display: 'block',
					borderRadius: 8,
					background: '#000',
				}}
				src={src}
			/>
			{/* GIF badge — bottom-left, like WhatsApp */}
			<span
				style={{
					position: 'absolute',
					bottom: caption ? 28 : 6,
					left: 8,
					background: 'rgba(0,0,0,0.45)',
					color: '#fff',
					fontSize: 11,
					fontWeight: 700,
					padding: '1px 5px',
					borderRadius: 4,
					letterSpacing: 1,
					pointerEvents: 'none',
					userSelect: 'none',
				}}
			>
				GIF
			</span>
			{caption && caption.length > 0 && (
				<span style={{ display: 'block', marginTop: 4, fontSize: 13 }}>
					{caption}
				</span>
			)}
		</div>
	);

	const getInboundMessageContent = (message: APIWhatsappChatDetailData) => {
		if (message?.Message?.length === 0 && message?.MediaUrl?.length === 0) {
			return (
				<span className={classes.whatsappOppsMsg}>
					<>{translator('whatsappChat.messageErrorText')}</>
				</span>
			);
		}

		// ── GIF ───────────────────────────────────────────────────────────────────
		if (isGif(message)) {
			return renderGif(message.MediaUrl, message.Message);
		}

		// ── AUDIO ──────────────────────────────────────────────────────────────────
		if (message.MediaContentType?.includes('audio')) {
			return (
				<audio
					controls
					style={{ maxWidth: '100%', outline: 'none' }}
					src={message?.MediaUrl}
				>
					{translator('whatsappChat.messageErrorText')}
				</audio>
			);
		}

		// ── VIDEO ──────────────────────────────────────────────────────────────────
		if (message.MediaContentType?.includes('video')) {
			return (
				<div style={{ maxWidth: 280 }}>
					<video
						controls
						style={{
							width: '100%',
							borderRadius: 8,
							display: 'block',
							background: '#000',
						}}
					>
						<source src={message?.MediaUrl} type={message.MediaContentType} />
						{translator('whatsappChat.messageErrorText')}
					</video>
					{message?.Message?.length > 0 && (
						<span style={{ display: 'block', marginTop: 4 }}>
							{message.Message}
						</span>
					)}
				</div>
			);
		}

		// ── DOCUMENTS ──────────────────────────────────────────────────────────────
		if (
			message.MediaContentType?.includes('pdf') ||
			message.MediaContentType?.includes('zip') ||
			message.MediaContentType?.includes('doc') ||
			message.MediaContentType?.includes('docx') ||
			message.MediaContentType?.includes('spreadsheetml.sheet') ||
			message.MediaContentType?.includes('presentationml.presentation')
		) {
			return (
				<div
					className={clsx(
						classes.whatsappMobileMessageTextAndImage,
						'transparent-background'
					)}
				>
					<Grid container alignItems="center">
						<img
							className="pdf-preview-img"
							src={getIconForFile(message)}
							alt="uploaded-file-preview"
						/>
						<div className={clsx(classes.pdfFileName, 'inbound')}>
							{message?.Message?.split('/')[message?.Message?.split('/')?.length - 1]}
						</div>
						<a href={message?.MediaUrl} target="_blank" rel="noreferrer">
							<img
								className="download-preview-img"
								src={Download}
								alt="uploaded-file-preview"
							/>
						</a>
					</Grid>
				</div>
			);
		}

		// ── IMAGE / PLAIN TEXT ─────────────────────────────────────────────────────
		return (
			<>
				{message?.MediaUrl?.length === 0 && <span>{message?.Message}</span>}
				{message?.MediaUrl && message?.MediaUrl?.length > 0 && (
					<>
						<ImagePreview
							classes={classes}
							className={`${classes.whatsappChat} chat__img`}
							placeholderImg={imagePlaceholder}
							errorImg={imagePlaceholderX}
							src={message?.MediaUrl}
						/>
						{message?.Message}
					</>
				)}
			</>
		);
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
											<pre
												style={{
													direction: getTextDirection(
														templateData.templateText,
														isRTL
													),
												}}>
												{getTemplateTextWithVariable(
													templateData?.templateText,
													variables
												)}
											</pre>
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
													) => {
														const textDirection = getTextDirection(
															templateData.templateText,
															isRTL
														);
														const buttonStyles = {
															paddingLeft:
																textDirection === 'ltr' ? '8px' : '0px',
															paddingRight:
																textDirection === 'ltr' ? '0px' : '8px',
														};
														return (
															<Grid
																item
																key={button.id}
																style={{
																	direction: textDirection,
																}}>
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
																			className={classes.callToActionButtonText}
																			style={buttonStyles}>
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
																			className={classes.callToActionButtonText}
																			style={buttonStyles}>
																			{getValueByFieldName(
																				button,
																				'whatsapp.websiteButtonText'
																			)}
																		</span>
																	</a>
																)}
															</Grid>
														);
													}
												)}
											</div>
										)}
								</div>
							</>
						)}
						{buttonType === 'quickReply' && (
							<div className={classes.quickReplyButtonWrapper}>
								{templateData?.templateButtons?.map(
									(button: quickReplyButtonProps | callToActionRowProps) => {
										const buttonName = getValueByFieldName(
											button,
											'whatsapp.websiteButtonText'
										);
										const textDirection = getTextDirection(buttonName, isRTL);
										return (
											<div
												key={button.id}
												className={`${classes.whatsappMobileMessage} sent quick-reply-button`}
												style={{
													margin: '2px 0px 0px 0px',
													borderRadius: '5px',
													padding: '4px 8px',
													width:
														buttonName?.length <=
														templateData?.templateText?.length
															? 'auto'
															: '',
												}}>
												<div
													className={classes.quickReplyButtonText}
													style={{ direction: textDirection }}>
													{buttonName}
												</div>
											</div>
										);
									}
								)}
							</div>
						)}
					</div>

					<span className={`${classes.whatsappChat} chat__msg-filler`}> </span>
					<span className={`${classes.whatsappChat} chat__msg-footer`}>
						<span> {formatTime(message.MessageDate)} </span>
						<Icon
							id={getIconName(message?.SmsStatusId)}
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
							{getInboundMessageContent(message)}
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
									<span>
										{message?.MediaUrl && message?.MediaUrl?.length > 0 && (
											<>
												{isGif(message) ? (
													renderGif(message.MediaUrl, message.Message)
												) : message.MediaContentType?.includes('video') ? (
													<div style={{ maxWidth: 280 }}>
														<video
															controls
															style={{ width: '100%', borderRadius: 8, display: 'block', background: '#000' }}
														>
															<source src={message.MediaUrl} type={message.MediaContentType} />
														</video>
													</div>
												) : message.MediaContentType?.includes('audio') ? (
													<audio controls style={{ maxWidth: '100%' }} src={message.MediaUrl} />
												) : (
													<ImagePreview
														classes={classes}
														className={`${classes.whatsappChat} chat__img`}
														placeholderImg={imagePlaceholder}
														errorImg={imagePlaceholderX}
														src={message?.MediaUrl}
													/>
												)}
											</>
										)}
										{/* Only show Message text separately when it's not a GIF (GIF renderer handles caption internally) */}
										{!isGif(message) && (
											message.Message ||
											(!message?.MediaUrl?.length ? translator('whatsappChat.messageErrorText') : '')
										)}
									</span>
							<span className={`${classes.whatsappChat} chat__msg-filler`}>
								{' '}
							</span>
							<span className={`${classes.whatsappChat} chat__msg-footer`}>
								<span> {formatTime(message.MessageDate)} </span>
								<Icon
									id={getIconName(message?.SmsStatusId)}
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
