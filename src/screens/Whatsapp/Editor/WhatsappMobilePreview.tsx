import AccountUser from '../../../assets/images/acc-user.jpg';

import { Box, Button, Grid } from '@material-ui/core';
import {
	callToActionFieldProps,
	callToActionRowProps,
	quickReplyButtonProps,
	quickReplyButtonsFieldProps,
	whatsappMobilePreviewProps,
} from './WhatsappCreator.types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const WhatsappMobilePreview = ({
	classes,
	campaignNumber,
	templateData,
	buttonType,
}: whatsappMobilePreviewProps) => {
	const { templateText, templateButtons } = templateData;
	const { t: translator } = useTranslation();

	let time = new Date().toLocaleTimeString('en-US');

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

	useEffect(() => {
		setQuickReplyWidth(getQuickReplyWidth());
	}, [templateText]);

	const updateTime = () => {
		let time = new Date()
			.toLocaleTimeString('en-US')
			.replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, '$1$3');
		setMobileTime(time);
	};

	setInterval(updateTime, 1000);

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
												<span>{campaignNumber}</span>
												<span className='status'>online</span>
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
															<pre>{templateText}</pre>
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
																					: '4px -8px 0px -8px',
																			padding:
																				templateText?.length <= 0
																					? '0px 8px 0px 8px'
																					: '4px 8px 0px 8px',
																		}}>
																		{templateButtons?.map(
																			(
																				button:
																					| quickReplyButtonProps
																					| callToActionRowProps
																			) => (
																				<Grid item>
																					{button.typeOfAction ===
																					'phonenumber' ? (
																						<a
																							href={`tel:${getValueByFieldName(
																								button,
																								'Phone Number'
																							)}`}>
																							<i
																								className={`${classes.callToActionButton} zmdi zmdi-phone`}></i>
																							<span
																								className={
																									classes.callToActionButtonText
																								}>
																								{getValueByFieldName(
																									button,
																									'Button Text'
																								)}
																							</span>
																						</a>
																					) : (
																						<a
																							href={getValueByFieldName(
																								button,
																								'Website URL'
																							)}>
																							<i
																								className={`${classes.callToActionButton} zmdi zmdi-open-in-new`}></i>
																							<span
																								className={
																									classes.callToActionButtonText
																								}>
																								{getValueByFieldName(
																									button,
																									'Button Text'
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
																		className={`${classes.whatsappMobileMessage} sent`}
																		style={{
																			margin: '2px 0px 0px 0px',
																			borderRadius: '5px',
																			padding: '4px 8px',
																			width:
																				getValueByFieldName(
																					button,
																					'Button Text'
																				)?.length <= templateText?.length
																					? quickReplyWidth
																					: '',
																		}}>
																		<span
																			className={classes.quickReplyButtonText}>
																			{getValueByFieldName(
																				button,
																				'Button Text'
																			)}
																		</span>
																	</div>
																)
															)}
														</div>
													</>
												)}
											</div>
											<form
												className={classes.whatsappMobileConversationCompose}>
												<div className='emoji'>
													<svg
														xmlns='http://www.w3.org/2000/svg'
														width='24'
														height='24'
														id='smiley'
														x='3147'
														y='3209'>
														<path
															fill-rule='evenodd'
															clip-rule='evenodd'
															d='M9.153 11.603c.795 0 1.44-.88 1.44-1.962s-.645-1.96-1.44-1.96c-.795 0-1.44.88-1.44 1.96s.645 1.965 1.44 1.965zM5.95 12.965c-.027-.307-.132 5.218 6.062 5.55 6.066-.25 6.066-5.55 6.066-5.55-6.078 1.416-12.13 0-12.13 0zm11.362 1.108s-.67 1.96-5.05 1.96c-3.506 0-5.39-1.165-5.608-1.96 0 0 5.912 1.055 10.658 0zM11.804 1.01C5.61 1.01.978 6.034.978 12.23s4.826 10.76 11.02 10.76S23.02 18.424 23.02 12.23c0-6.197-5.02-11.22-11.216-11.22zM12 21.355c-5.273 0-9.38-3.886-9.38-9.16 0-5.272 3.94-9.547 9.214-9.547a9.548 9.548 0 0 1 9.548 9.548c0 5.272-4.11 9.16-9.382 9.16zm3.108-9.75c.795 0 1.44-.88 1.44-1.963s-.645-1.96-1.44-1.96c-.795 0-1.44.878-1.44 1.96s.645 1.963 1.44 1.963z'
															fill='#7d8489'
														/>
													</svg>
												</div>
												<input
													className='input-msg'
													name='input'
													placeholder='Type a message..'
													autoComplete='off'
													autoFocus
												/>
												<div className='photo'>
													<img
														src='https://i.ibb.co/zNL2yg0/ib-attach.png'
														alt=''
														width='25'
														height='25'
													/>
													<img
														src='https://i.ibb.co/vHXYtHF/ib-camera.png'
														alt=''
														width='25'
														height='25'
													/>
												</div>
												<button className='send'>
													<div className='circle'>
														<i className='zmdi zmdi-mail-send'></i>
													</div>
												</button>
											</form>
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
