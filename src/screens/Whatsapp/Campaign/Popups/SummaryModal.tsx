import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Link,
	Typography,
} from '@material-ui/core';
import { Box, Grid, Button, Dialog, useMediaQuery } from '@material-ui/core';
import {
	ApiGetCampaignSummary,
	ApiGetCampaignSummaryPayloadData,
	CampaignDetailByIdData,
	CampaignDetailById,
	SummaryModalProps,
} from '../Types/WhatsappCampaign.types';
import { useTheme } from '@mui/material/styles';
import { Close, SupervisedUserCircleOutlined } from '@material-ui/icons';
import { useParams } from 'react-router-dom';
import { Loader } from '../../../../components/Loader/Loader';
import {
	getCampaignDetailById,
	getSavedTemplatesPreviewById,
	getWhatsAppCampaignSummary,
} from '../../../../redux/reducers/whatsappSlice';
import { useDispatch } from 'react-redux';
import {
	buttonsDataProps,
	callToActionProps,
	quickReplyButtonProps,
	savedTemplateCallToActionProps,
	savedTemplateCardProps,
	savedTemplateDataProps,
	savedTemplateMediaProps,
	savedTemplateQuickReplyProps,
	savedTemplateTextProps,
	saveTemplateItemsProps,
	templateDataProps,
	templateListAPIProps,
	templatePreviewDataProps,
} from '../../Editor/Types/WhatsappCreator.types';
import { apiStatus } from '../../Constant';
import uniqid from 'uniqid';
import WhatsappMobilePreview from '../../Editor/Components/WhatsappMobilePreview';
import downArrow from '../../../../assets/images/down-arrow.svg';
import upArrow from '../../../../assets/images/up-arrow.svg';
import moment from 'moment';
import { getTemplatePreviewData } from '../../Common';

const SummaryModal = ({
	classes,
	isOpen,
	fromNumber,
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
}: SummaryModalProps) => {
	const theme = useTheme();
	const dispatch = useDispatch();
	const { campaignID } = useParams();
	const fullScreen = useMediaQuery(theme.breakpoints.down('lg'));
	const [isLoader, setIsLoader] = useState<boolean>(false);
	const [isGroup, setIsGroup] = useState<boolean>(false);
	const [isRecipientFilter, setIsRecipientFilter] = useState<boolean>(false);
	const [detailsHide, setdetailsHide] = useState<boolean>(true);
	const { t: translator } = useTranslation();

	const [campaignSummary, setCampaignSummary] =
		useState<ApiGetCampaignSummaryPayloadData>();

	const [campaignDetails, setCampaignDetails] =
		useState<CampaignDetailByIdData>();
	const [templateDetails, setTemplateDetails] =
		useState<saveTemplateItemsProps>();

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

	let updatedTemplateData: templateDataProps = {
		templateText: '',
		templateButtons: [],
	};
	let updatedButtonType: string = '';
	let updatedFileData: string = '';

	useEffect(() => {
		(async () => {
			if (campaignID && isOpen === true) {
				setIsLoader(true);
				const { payload: campaignSummaryData }: ApiGetCampaignSummary =
					await dispatch<any>(getWhatsAppCampaignSummary(campaignID));
				if (campaignSummaryData?.Status === apiStatus?.SUCCESS) {
					setCampaignSummary(campaignSummaryData?.Data);
				}
				const { payload: campaignData }: CampaignDetailById =
					await dispatch<any>(getCampaignDetailById(campaignID));
				if (campaignData?.Status === apiStatus?.SUCCESS) {
					setCampaignDetails(campaignData?.Data);
				}
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
					setTemplateDetails(templateData?.Data?.Items[0]);
					const template = templateData?.Data?.Items[0];
					onSavedTemplateChange(template?.Data);
				}
				setIsLoader(false);
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, campaignID]);

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
		} else {
			return specialDatedropDown[Number(spectialDateFieldID) - 3];
		}
	};

	return (
		<Dialog
			fullScreen={fullScreen}
			open={isOpen}
			onClose={onSummaryModalClose}
			aria-labelledby='responsive-dialog-title'
			maxWidth={'md'}>
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
											} ${getSpecialDay()} day at ${moment(sendTime)?.format(
												'hh:mm a'
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
											{campaignSummary?.ClientTotalCount}
										</>
									</span>
									<span className={classes.campaignSummaryTextDetail}>
										<Link
											onClick={() => {
												setdetailsHide(!detailsHide);
											}}>
											{detailsHide
												? translator('sms.smsSummaryDetails')
												: translator('sms.smsSummaryClose')}
										</Link>
									</span>
								</Box>
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
													href='https://business.facebook.com/settings/whatsapp-business-accounts/'
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
				<Grid container className={classes.alertModalAction}>
					<Button
						className='ok-button'
						variant='contained'
						color='primary'
						autoFocus
						onClick={onConfirmOrYes}>
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
		</Dialog>
	);
};

export default SummaryModal;
