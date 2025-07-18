import AccountUser from '../../../../assets/images/acc-user.jpg';
import Video from '../../../../assets/images/video.png';
import PDF from '../../../../assets/images/pdf.png';
import Download from '../../../../assets/images/download.png';
import { Box, Grid } from '@material-ui/core';
import {
	callToActionFieldProps,
	callToActionRowProps,
	coreProps,
	quickReplyButtonProps,
	quickReplyButtonsFieldProps,
	ReduxUserProps,
	whatsappMobilePreviewProps,
} from '../Types/WhatsappCreator.types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { fileTypes } from '../../Constant';
import { checkLanguage, getFileType, getTextDirection } from '../../Common';
import clsx from 'clsx';

const WhatsappMobilePreview = ({
	classes,
	templateData,
	buttonType,
	fileData,
	templateId = '',
}: whatsappMobilePreviewProps) => {
	const { templateText, templateButtons } = templateData;
	const { t: translator } = useTranslation();
	const { isRTL } = useSelector((state: { core: coreProps }) => state.core);

	let time = new Date().toLocaleTimeString('en-US');

	const [textDirection, setTextDirection] = useState<string>('ltr');
	const [mobileTime, setMobileTime] = useState<string>(time);
	const [quickReplyWidth, setQuickReplyWidth] = useState<string>('');

	const getQuickReplyWidth = () => {
		const templateTextElement: HTMLElement | null = document.getElementById(
			'conversation-text-preview'
		);
		return templateTextElement?.clientWidth
			? (templateTextElement?.clientWidth - 15).toString() + 'px'
			: 'auto';
	};

	const { username } = useSelector(
		(state: { user: ReduxUserProps }) => state.user
	);

	useEffect(() => {
		setQuickReplyWidth(getQuickReplyWidth());
	}, [templateText, fileData, templateButtons]);

	useEffect(() => {
		const direction = checkLanguage(templateText, isRTL);
		if (direction !== 'Both') {
			setTextDirection(direction === 'English' ? 'ltr' : 'rtl');
		} else if (direction === 'Both') {
			setTextDirection(isRTL ? 'rtl' : 'ltr');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [templateText, isRTL]);

	const setUpdateTime = () => {
		let time = new Date()
			.toLocaleTimeString('en-US')
			.replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, '$1$3');
		setMobileTime(time);
	};

	setInterval(setUpdateTime, 1000);

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
	return (
		<Box className={classes.phoneDiv}>
			{
				templateId !== '' && (
					<>
						<div className={classes.bold}>{translator('common.templateId')}:</div>
						<div className={clsx(classes.pt5, classes.pb15)}>{templateId}</div>
					</>
				)
			}
			<div className={classes.whatsappPhoneImg}>
				<div className={classes.whatsappMobileSection}>
					<div className={`${classes.whatsappMobileMarvelDevice} nexus5`}>
						<div className='top-bar'></div>
						<div className='sleep'></div>
						<div className='volume'></div>
						<div className='camera'></div>
						<div className='screen'>
							<div className={classes.whatsappMobileScreenContainer}>
								<div className={classes.whatsappMobileStatusBar}>
									<div className='time'>{mobileTime}</div>
									<div className='battery'>
										<i className='zmdi zmdi-battery'></i>
									</div>
									<div className='network'>
										<i className='zmdi zmdi-network'></i>
									</div>
									<div className='wifi'>
										<i className='zmdi zmdi-wifi-alt-2'></i>
									</div>
									<div className='star'>
										<i className='zmdi zmdi-star'></i>
									</div>
								</div>
								<div className={classes.whatsappMobileChat}>
									<div className={classes.whatsappMobileChatContainer}>
										<div className={classes.whatsappMobileUserBar}>
											<div className='back'>
												<i className='zmdi zmdi-arrow-left navigation-arrow'></i>
											</div>
											<div className='avatar'>
												<img src={AccountUser} alt='Avatar' />
											</div>
											<div className='name'>
												<span>{username}</span>
												<span className='status'>
													<>{translator('whatsapp.online')}</>
												</span>
											</div>
											<div className='actions more'>
												<i className='zmdi zmdi-more-vert'></i>
											</div>
											<div className='actions attachment'>
												<i className='zmdi zmdi-phone'></i>
											</div>
											<div className='actions'>
												<img
													src='https://i.ibb.co/LdnbHSG/ic-action-videocall.png'
													alt='video-call'
												/>
											</div>
										</div>
										<div className={classes.whatsappMobileConversation}>
											<div className='conversation-container'>
												{(templateText || buttonType === 'callToAction') && (
													<>
														<div
															className={`${classes.whatsappMobileMessage} sent`}
															id='conversation-text-preview'>
															{templateText?.length > 0 && (
																<div
																	className={
																		classes.whatsappMobileMessageTextAndImage
																	}>
																	{getFileType(fileData?.fileLink) ===
																		fileTypes.IMAGE &&
																		fileData?.fileLink?.length > 0 && (
																			<img
																				src={fileData?.fileLink}
																				alt='uploaded-file-preview'
																			/>
																		)}
																	{getFileType(fileData?.fileLink) ===
																		fileTypes.VIDEO &&
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
																	{getFileType(fileData?.fileLink) ===
																		fileTypes.DOCUMENT &&
																		fileData?.fileLink?.length > 0 && (
																			<Grid container alignItems='center'>
																				<img
																					className='pdf-preview-img'
																					src={PDF}
																					alt='uploaded-file-preview'
																				/>
																				<div className={classes.pdfFileName}>
																					{fileData?.fileLink
																						?.split('/')
																						[
																							fileData?.fileLink?.split('/')
																								?.length - 1
																						]?.substring(0, 18) + '...'}
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
																			direction:
																				templateText?.length > 0
																					? textDirection === 'rtl'
																						? 'rtl'
																						: 'ltr'
																					: isRTL
																					? 'rtl'
																					: 'ltr',
																		}}>
																		{templateText}
																	</pre>
																</div>
															)}
															{buttonType === 'callToAction' &&
																templateButtons?.length > 0 && (
																	<div
																		className={
																			classes.callToActionButtonsWrapper
																		}
																		style={{
																			borderTop:
																				templateText?.length <= 0
																					? '0px'
																					: '1px solid #cbcbcb',
																			margin:
																				templateText?.length <= 0
																					? '0px -8px 0px -8px'
																					: '4px 0px 0px 0px',
																			padding:
																				templateText?.length <= 0
																					? '0px 8px 0px 8px'
																					: '0px 0px 0px 0px',
																		}}>
																		{templateButtons?.map(
																			(
																				button:
																					| quickReplyButtonProps
																					| callToActionRowProps
																			) => (
																				<Grid item key={button.id}>
																					{button.typeOfAction ===
																					'phonenumber' ? (
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
																								className={
																									classes.callToActionButtonText
																								}>
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
																								className={
																									classes.callToActionButtonText
																								}>
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
															{templateButtons?.map(
																(
																	button:
																		| quickReplyButtonProps
																		| callToActionRowProps
																) => (
																	<div
																		key={button.id}
																		className={`${classes.whatsappMobileMessage} sent quick-reply-button`}
																		style={{
																			margin: '2px 0px 0px 0px',
																			borderRadius: '5px',
																			padding: '4px 8px'
																		}}>
																		<span
																			className={classes.quickReplyButtonText}>
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
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Box>
	);
};

export default WhatsappMobilePreview;
