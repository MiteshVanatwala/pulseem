import { BaseSyntheticEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, TextField } from '@material-ui/core';
import { Box, Grid, Button, Dialog, useMediaQuery } from '@material-ui/core';
import {
	CampaignDetailByIdData,
	CampaignDetailById,
	SummaryModalProps,
	coreProps,
} from '../Types/WhatsappCampaign.types';
import { useTheme } from '@mui/material/styles';
import { Close, SupervisedUserCircleOutlined } from '@material-ui/icons';
import { useParams } from 'react-router-dom';
import { Loader } from '../../../../components/Loader/Loader';
import {
	getCampaignDetailById,
	getSavedTemplatesPreviewById,
} from '../../../../redux/reducers/whatsappSlice';
import { useDispatch, useSelector } from 'react-redux';
import {
	savedTemplateDataProps,
	// saveTemplateItemsProps,
	templateDataProps,
	templateListAPIProps,
	templatePreviewDataProps,
	toastProps,
} from '../../Editor/Types/WhatsappCreator.types';
import { apiStatus, resetToastData, tierSetting } from '../../Constant';
import WhatsappMobilePreview from '../../Editor/Components/WhatsappMobilePreview';
import downArrow from '../../../../assets/images/down-arrow.svg';
import upArrow from '../../../../assets/images/up-arrow.svg';
import moment from 'moment';
import { getTemplatePreviewData, isShowTierAlert } from '../../Common';
import clsx from 'clsx';
import Toast from '../../../../components/Toast/Toast.component';
import ValidationAlert from './ValidationAlert';
import CustomTooltip from '../../../../components/Tooltip/CustomTooltip';
import AlertModal from '../../Editor/Popups/AlertModal';

const SummaryModal = ({
	classes,
	isOpen,
	onSummaryModalClose,
	onConfirmOrYes,
	selectedGroups,
	selectedFilterGroups,
	selectedFilterCampaigns,
	sendType,
	sendDate,
	sendTime,
	isSpecialDateBefore,
	daysBeforeAfter,
	specialDatedropDown,
	spectialDateFieldID,
	campaignSummary,
	randomlyCount,
	setRandomlyCount,
	resetRandomCount,
}: SummaryModalProps) => {
	const theme = useTheme();
	const dispatch = useDispatch();
	const { campaignID } = useParams();
	const fullScreen = useMediaQuery(theme.breakpoints.down('lg'));
	const [isLoader, setIsLoader] = useState<boolean>(false);
	const [isGroup, setIsGroup] = useState<boolean>(false);
	const [isRecipientFilter, setIsRecipientFilter] = useState<boolean>(false);
	const [detailsHide, setdetailsHide] = useState<boolean>(true);
	const [isValidationAlert, setIsValidationAlert] = useState<boolean>(false);
	const [tierAlert, setTierAlert] = useState<boolean>(false);
	const [validationErrors, setValidationErrors] = useState<string[]>([]);
	const [isIn24HrWindow, setIsIn24HrWindow] = useState<boolean>(false);
	const { t: translator } = useTranslation();
	const ToastMessages = useSelector(
		(state: { whatsapp: { ToastMessages: toastProps } }) =>
			state.whatsapp.ToastMessages
	);
	const { isRTL } = useSelector((state: { core: coreProps }) => state.core);
	const [toastMessage, setToastMessage] =
		useState<toastProps['SUCCESS']>(resetToastData);

	const [campaignDetails, setCampaignDetails] =
		useState<CampaignDetailByIdData>();
	// const [templateDetails, setTemplateDetails] =
	// 	useState<saveTemplateItemsProps>();

	const [templateData, setTemplateData] = useState<templateDataProps>({
		templateText: '',
		templateButtons: [],
	});
	const [buttonType, setButtonType] = useState<string>('');
	const [fileData, setFileData] = useState<{
		fileLink: string;
		fileType: string;
	}>({
		fileLink: '',
		fileType: '',
	});

	useEffect(() => {
		(async () => {
			if (campaignID && isOpen === true) {
				setIsLoader(true);
				const { payload: campaignData }: CampaignDetailById =
					await dispatch<any>(getCampaignDetailById(campaignID));
				if (campaignData?.Status === apiStatus?.SUCCESS) {
					resetRandomCount();
					setCampaignDetails(campaignData?.Data);
					const { payload: templateData }: templateListAPIProps =
						await dispatch<any>(
							getSavedTemplatesPreviewById({
								templateId: campaignData?.Data?.TemplateID,
							})
						);
					if (
						templateData?.Status === apiStatus?.SUCCESS &&
						templateData?.Data?.Items?.length > 0
					) {
						// setTemplateDetails(templateData?.Data?.Items[0]);
						const template = templateData?.Data?.Items[0];
						onSavedTemplateChange(template?.Data);
					}
				} else {
					campaignData?.Message
						? setToastMessage({
								...ToastMessages.ERROR,
								message: campaignData?.Message,
						  })
						: setToastMessage(ToastMessages.ERROR);
				}
				setIsLoader(false);
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, campaignID]);

	useEffect(() => {
		if (sendType === '2' && sendDate) {
			const timeDiff = moment(sendDate).diff(moment(), 'seconds');
			if (timeDiff <= 86400) {
				setIsIn24HrWindow(true);
			} else {
				setIsIn24HrWindow(false);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sendDate]);

	const onSavedTemplateChange = (templateData: savedTemplateDataProps) => {
		let templatePreviewData: templatePreviewDataProps = {
			templateData: {
				templateText: '',
				templateButtons: [],
			},
			buttonType: '',
			fileData: {
				fileLink: '',
				fileType: '',
			},
		};
		if (templateData) {
			templatePreviewData = getTemplatePreviewData(templateData?.types);
		}
		setFileData(templatePreviewData?.fileData);
		setButtonType(templatePreviewData?.buttonType);
		setTemplateData(templatePreviewData?.templateData);
	};

	const getSpecialDay = () => {
		if (spectialDateFieldID === '1') {
			return translator('mainReport.birthday');
		} else if (spectialDateFieldID === '2') {
			return translator('mainReport.creationDay');
		} else if (spectialDateFieldID !== '0') {
			return (
				specialDatedropDown &&
				Object.entries(specialDatedropDown)[Number(spectialDateFieldID) - 3][1]
			);
		}
	};

	const resetToast = () => {
		setToastMessage(resetToastData);
	};

	const renderToast = () => {
		if (toastMessage) {
			setTimeout(() => {
				resetToast();
			}, 4000);
			return <Toast data={toastMessage} />;
		}
		return null;
	};

	const validateSummary = () => {
		let validationErrors = [];
		let isValidated = true;
		const showTierAlert = isShowTierAlert(
			campaignSummary?.WhatsappSmsLeft || 0,
			campaignSummary?.FinalCount || 0,
			campaignSummary?.WhatsappTierID || 1,
			sendType,
			isIn24HrWindow
		);
		if (showTierAlert) {
			if (randomlyCount?.length <= 0) {
				isValidated = false;
				validationErrors.push(
					translator(
						'settings.accountSettings.actDetails.fields.recipientsRequired'
					)
				);
				validationErrors.push(
					`${translator(
						'settings.accountSettings.actDetails.fields.youHave'
					)} ${campaignSummary?.WhatsappSmsLeft || 0} ${translator(
						'settings.accountSettings.actDetails.fields.messageLeftToday'
					)}`
				);
			} else {
				if (
					Number(randomlyCount) === 0 ||
					(campaignSummary?.WhatsappSmsLeft &&
						Number(randomlyCount) > campaignSummary?.WhatsappSmsLeft)
				) {
					isValidated = false;
					// validationErrors.push(
					// 	`Please enter valid Recipient - Range 1 - ${campaignSummary?.WhatsappSmsLeft}`
					// );
					validationErrors.push(
						translator(
							'settings.accountSettings.actDetails.fields.recipientsRangeError'
						)
					);
					if (campaignSummary?.WhatsappSmsLeft === 1) {
						validationErrors.push(
							translator(
								'settings.accountSettings.actDetails.fields.oneMessageLeft'
							)
						);
					} else {
						validationErrors.push(
							`${translator(
								'settings.accountSettings.actDetails.fields.youHave'
							)} ${campaignSummary?.WhatsappSmsLeft || 0} ${translator(
								'settings.accountSettings.actDetails.fields.messageLeft'
							)}`
						);
					}
				}
			}
		}
		if (!isValidated) {
			setValidationErrors([...validationErrors]);
			setIsValidationAlert(true);
		}
		return isValidated;
	};

	const onRandomlyCountChange = (value: string) => {
		setRandomlyCount(value);
	};

	const onConfirmOrYesClick = async () => {
		setIsLoader(true);
		if (validateSummary()) {
			if (campaignSummary?.WhatsappTierID === 4) {
				await onConfirmOrYes();
				await resetRandomCount();
			} else {
				if (sendType === '1' || (sendType === '2' && isIn24HrWindow)) {
					await onConfirmOrYes();
					await resetRandomCount();
				} else {
					setTierAlert(true);
				}
			}
		}
		setIsLoader(false);
	};

	const getTierInfoTooltip = () => {
		let toolTip: JSX.Element[] = [];
		tierSetting?.map((tier, index: number) =>
			toolTip.push(
				<>
					<span>{`${translator(
						'settings.accountSettings.actDetails.fields.tier'
					)} ${index + 1} - ${translator(tier.name)}`}</span>
					<br />
				</>
			)
		);
		return <>{toolTip}</>;
	};

	const onTierAlertConfirm = () => {
		if (validateSummary()) {
			resetRandomCount();
			onConfirmOrYes();
		}
	};

	const getIndexFromTierId = (tierId: number | undefined) => {
		if (tierId) {
			return Number(tierId) - 1;
		}
		return 0;
	};

	return (
		<Dialog
			fullScreen={fullScreen}
			open={isOpen}
			onClose={onSummaryModalClose}
			aria-labelledby='responsive-dialog-title'
			maxWidth={'md'}>
			{renderToast()}
			<div className={classes.summaryModal}>
				<div id='responsive-dialog-title' className={classes.alertModalTitle}>
					<>{translator('whatsappCampaign.summary')}</>
				</div>
				<Box className={classes.alertModalClose}>
					<Close fontSize={'small'} onClick={onSummaryModalClose} />
				</Box>
				<Box className={classes.alertModalInfoWrapper}>
					<Box className={classes.alertModalInfo}>
						<SupervisedUserCircleOutlined
							fontSize={'small'}
							onClick={onSummaryModalClose}
						/>
					</Box>
				</Box>
				<div className={classes.summaryModalContent}>
					<div className={classes.testGroupModalContentWrapper}>
						<Grid container style={{ justifyContent: 'space-between' }}>
							<Grid item lg={6}>
								<Box className={classes.campaignSummaryTextWrapper}>
									<span className={classes.campaignSummaryTextTitle}>
										<>{translator('whatsappCampaign.campaignFrom')}</>
									</span>
									<span className={classes.campaignSummaryTextDesc}>
										{campaignDetails?.FromNumber}
									</span>
								</Box>
								<Box className={classes.campaignSummaryTextWrapper}>
									<span className={classes.campaignSummaryTextTitle}>
										<>{translator('whatsappCampaign.campaignName')}</>
									</span>
									<span className={classes.campaignSummaryTextDesc}>
										{campaignDetails?.Name}
									</span>
								</Box>
								<Box className={classes.campaignSummaryTextWrapper}>
									<span className={classes.campaignSummaryTextTitle}>
										<>{translator('whatsappCampaign.when')}</>
									</span>
									<span className={classes.campaignSummaryTextDesc}>
										{sendType === '1' && <>{translator('sms.SendNow')}</>}
										{sendType === '2' &&
											moment(sendDate)?.format('dddd , MMMM Do YYYY, h:mm a')}
										{sendType === '3' &&
											`${daysBeforeAfter} ${translator('mainReport.days')} ${
												isSpecialDateBefore
													? translator('mainReport.before')
													: translator('mainReport.after')
											} ${getSpecialDay()} ${translator('whatsappCampaign.atTime')} ${moment(sendTime)?.format(
												'HH:mm a'
											)}`}
									</span>
								</Box>
								<Box className={classes.campaignSummaryTextWrapper}>
									<span className={classes.campaignSummaryTextTitle}>
										<>{translator('whatsappCampaign.for')}</>
									</span>
									<span className={classes.campaignSummaryTextDesc}>
										<>
											{translator('sms.smsSummaryDialogTotalRecipients')}:{' '}
											{campaignSummary?.FinalCount}
										</>
									</span>
									<span className={classes.campaignSummaryTextDetail}>
										<Link
											onClick={() => {
												setdetailsHide(!detailsHide);
											}}>
											{detailsHide ? (
												<>{translator('sms.smsSummaryDetails')}</>
											) : (
												<>{translator('sms.smsSummaryClose')}</>
											)}
										</Link>
									</span>
								</Box>
								{isShowTierAlert(
									campaignSummary?.WhatsappSmsLeft || 0,
									campaignSummary?.FinalCount || 0,
									campaignSummary?.WhatsappTierID || 1,
									sendType,
									isIn24HrWindow
								) && (
									<Box className={classes.campaignSummaryExceedLimitWrapper}>
										<div className={classes.campaignSummaryExceedLimitTierInfo}>
											<>
												{`${translator(
													'settings.accountSettings.actDetails.fields.sendingTier'
												)} ${translator(
													tierSetting[
														getIndexFromTierId(campaignSummary?.WhatsappTierID)
													]?.name
												)}`}
												<CustomTooltip
													isSimpleTooltip={false}
													arrow={true}
													style={{
														fontSize: 14,
														width: 'auto',
														paddingLeft: isRTL ? '0px' : '10px',
														paddingRight: isRTL ? '10px' : '0px',
													}}
													classes={classes}
													interactive={true}
													placement={'top'}
													title={getTierInfoTooltip()}
													titleStyle={{
														width: '100%',
														display: 'inline-block',
													}}
													text={<span className={classes.bodyInfo}>i</span>}
													icon={undefined}>
													{/* <>
													{tierSetting?.map((tier, index: number) => (
														<span>{`Tier ${index} - ${translator(
															tier.name
														)}`}</span>
													))}
												</> */}
												</CustomTooltip>
											</>
										</div>
										<div className={classes.campaignSummaryExceedLimitText}>
											<>
												{translator(
													'settings.accountSettings.actDetails.fields.exceedLimitMessage'
												)}
											</>
										</div>
										<div className={classes.campaignSummaryExceedLimitText}>
											<>
												{translator(
													'settings.accountSettings.actDetails.fields.exceedLimitNumberMessage'
												)}
												{campaignSummary?.WhatsappSmsLeft}
											</>
										</div>
										<Box
											className={
												classes.campaignSummaryExceedLimitSendRandomlyWrapper
											}>
											<div
												className={
													classes.campaignSummaryExceedLimitSendRandomlyText
												}>
												<>
													{translator(
														'settings.accountSettings.actDetails.fields.sendRandomlyTo'
													)}
												</>
											</div>
											<Box
												className={
													classes.campaignSummaryExceedLimitSendRandomlyInsert
												}>
												<TextField
													id='randomcount'
													type='text'
													placeholder={translator(
														'settings.accountSettings.actDetails.fields.insert'
													)}
													className={clsx(
														classes.buttonField,
														classes.campaignSummaryExceedLimitSendRandomlyInsertInput
													)}
													onChange={(e: BaseSyntheticEvent) =>
														onRandomlyCountChange(
															e.target?.value?.replace(/\D/g, '')
														)
													}
													value={randomlyCount}
												/>
												<span
													className={
														classes.campaignSummaryExceedLimitSendRandomlyRecipients
													}>
													<>
														{translator(
															'settings.accountSettings.actDetails.fields.recipientsOutOfTotal'
														)}
													</>
												</span>
											</Box>
										</Box>
									</Box>
								)}
								<div>&emsp;</div>
							</Grid>

							<Grid item lg={6}>
								<Box className={classes.sumRight}>
									<WhatsappMobilePreview
										classes={classes}
										templateData={templateData}
										buttonType={buttonType}
										fileData={fileData}
									/>
								</Box>

								<Box className={classes.campaignSummaryImportantText}>
									<div>
										<b>
											<>{translator('whatsappCampaign.summaryNote')}</>
											<br />
											<>{translator('whatsappCampaign.summaryNote2')}</>
											<br />
											<>{translator('whatsappCampaign.summaryNote3')}</>
											<br />
											<span>
												<a
													target={'_blank'}
													// href='https://business.facebook.com/settings/whatsapp-business-accounts/'
													href='https://business.facebook.com/wa/manage/'
													rel='noreferrer'>
													<>{translator('whatsappCampaign.limit')}</>
												</a>
											</span>
										</b>
									</div>
								</Box>
							</Grid>
						</Grid>
					</div>
					<div className={classes.summaryModalAccordionWrapper}>
						{!detailsHide && (
							<>
								<ul className={classes.summaryModalAccordionUl}>
									<li className={classes.summaryModalAccordionLi}>
										<Grid container onClick={() => setIsGroup(!isGroup)}>
											<Grid
												item
												className={classes.summaryModalAccordionLiContentTitle}>
												<>{translator('sms.smsSummaryGroups')} </> (
												{selectedGroups?.length}){' '}
												{!isGroup ? (
													<img
														className={classes.summaryModalAccordionUlImage}
														src={downArrow}
														alt='downArrow'
													/>
												) : (
													<img
														className={classes.summaryModalAccordionUlImage}
														src={upArrow}
														alt='upArrow'
													/>
												)}
											</Grid>
										</Grid>
										{isGroup &&
											selectedGroups?.map((group) => (
												<Box
													className={classes.summaryModalAccordionLiContent}
													key={group?.GroupID}>
													{group?.GroupName}
												</Box>
											))}
									</li>
									<li className={classes.summaryModalAccordionLi}>
										<Grid
											container
											onClick={() => setIsRecipientFilter(!isRecipientFilter)}>
											<Grid
												item
												className={classes.summaryModalAccordionLiContentTitle}>
												<>{translator('sms.smsSummaryRecipientsFilter')}</> (
												{selectedFilterGroups?.length +
													selectedFilterCampaigns?.length}
												){' '}
												{!isRecipientFilter ? (
													<img
														className={classes.summaryModalAccordionUlImage}
														src={downArrow}
														alt='downArrow'
													/>
												) : (
													<img
														className={classes.summaryModalAccordionUlImage}
														src={upArrow}
														alt='upArrow'
													/>
												)}
											</Grid>
										</Grid>

										{isRecipientFilter && (
											<>
												{campaignSummary && (
													<Box
														className={clsx(
															classes.summaryModalDuplicateRecipients,
															classes.recipientsStatistics
														)}>
														<span>
															{translator('sms.duplicateRecipients')}:{' '}
														</span>{' '}
														<span className={classes.recipientsStatisticsData}>
															{
																campaignSummary?.DuplicateCellphoneSharedWithClienCount
															}
														</span>
													</Box>
												)}

												{campaignSummary && (
													<Box
														className={clsx(
															classes.summaryModalRemoved,
															classes.recipientsStatistics
														)}>
														<span>{translator('sms.removedRecipients')}: </span>{' '}
														<span className={classes.recipientsStatisticsData}>
															{campaignSummary?.Removed}
														</span>
													</Box>
												)}

												{campaignSummary && (
													<Box
														className={clsx(
															classes.summaryModalEmptyNumbers,
															classes.recipientsStatistics
														)}>
														<span>{translator('sms.emptyNumbers')}: </span>{' '}
														<span className={classes.recipientsStatisticsData}>
															{campaignSummary?.EmptyCellphoneCount}
														</span>
													</Box>
												)}

												{campaignSummary && (
													<Box
														className={clsx(
															classes.summaryModalInvalidRecipients,
															classes.recipientsStatistics
														)}>
														<span>{translator('sms.invalidRecipients')}: </span>{' '}
														<span className={classes.recipientsStatisticsData}>
															{campaignSummary?.Invalid}
														</span>
													</Box>
												)}
											</>
										)}

										{isRecipientFilter && selectedFilterGroups?.length > 0 && (
											<>
												<Box
													className={classes.summaryModalAccordionGroupFilter}>
													<>{translator('sms.recipientsFromFollowingGroups')}</>
												</Box>
												{selectedFilterGroups?.map((group) => (
													<Box
														className={classes.summaryModalAccordionLiContent}
														key={group?.GroupID}>
														{group?.GroupName}
													</Box>
												))}
											</>
										)}

										{isRecipientFilter &&
											selectedFilterCampaigns?.length > 0 && (
												<>
													<Box
														className={
															classes.summaryModalAccordionCampaignFilter
														}>
														<>
															{translator(
																'sms.recipientsFromFollowingCampaign'
															)}
														</>
													</Box>
													{selectedFilterCampaigns?.map((campaign) => (
														<Box
															className={classes.summaryModalAccordionLiContent}
															key={campaign?.WACampaignID}>
															{campaign?.Name}
														</Box>
													))}
												</>
											)}
									</li>
								</ul>
							</>
						)}
					</div>
				</div>
				<Grid
					container
					className={classes.alertModalAction}
					style={{ marginTop: '16px' }}>
					<Button
						className='ok-button'
						variant='contained'
						color='primary'
						autoFocus
						disabled={campaignSummary && campaignSummary?.FinalCount <= 0}
						onClick={onConfirmOrYesClick}>
						<>{translator('whatsapp.alertModal.okButtonText')}</>
					</Button>
					<Button
						className='cancel-button'
						color='primary'
						variant='contained'
						onClick={onSummaryModalClose}>
						<>{translator('whatsapp.alertModal.calcelButtonText')}</>
					</Button>
				</Grid>
			</div>
			<Loader isOpen={isLoader} showBackdrop={true} />
			<ValidationAlert
				classes={classes}
				isOpen={isValidationAlert}
				onClose={() => setIsValidationAlert(false)}
				title={translator('whatsappCampaign.sendValidation')}
				requiredFields={validationErrors}
			/>
			<AlertModal
				classes={classes}
				isOpen={tierAlert}
				onClose={() => setTierAlert(false)}
				title={translator(
					'settings.accountSettings.actDetails.fields.doYouWantToProceed'
				)}
				subtitle={''}
				type='delete'
				onConfirmOrYes={() => onTierAlertConfirm()}>
				<Box className={classes.tierAlertModalWrapper}>
					<Box>
						{translator(
							'settings.accountSettings.actDetails.fields.stopSending'
						)}
					</Box>
					<br />
					<Box>
						{translator(
							'settings.accountSettings.actDetails.fields.yourResponsibility'
						)}
					</Box>
				</Box>
			</AlertModal>
		</Dialog>
	);
};

export default SummaryModal;
