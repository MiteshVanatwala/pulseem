import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from '@material-ui/core';
import { Box, Grid, Button, Dialog, useMediaQuery } from '@material-ui/core';
import MobilePreview from '../../Editor/Components/WhatsappMobilePreview';
import { SummaryModalProps } from '../Types/WhatsappCampaign.types';
import { useTheme } from '@mui/material/styles';
import { Close, SupervisedUserCircleOutlined } from '@material-ui/icons';

const SummaryModal = ({
	classes,
	isOpen,
	fromNumber,
	onSummaryModalClose,
}: SummaryModalProps) => {
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('lg'));

	const [detailsHide, setdetailsHide] = useState<boolean>(true);

	const { t: translator } = useTranslation();

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
				<div className={classes.alertModalContent}>
					<div className={classes.testGroupModalContentWrapper}>
						<Grid container style={{ justifyContent: 'space-between' }}>
							<Grid item lg={6}>
								<Box className={classes.campaignSummaryTextWrapper}>
									<span className={classes.campaignSummaryTextTitle}>
										<>{translator('whatsappCampaign.campaignFrom')}</>
									</span>
									<span className={classes.campaignSummaryTextDesc}>
										215646512
									</span>
								</Box>
								<Box className={classes.campaignSummaryTextWrapper}>
									<span className={classes.campaignSummaryTextTitle}>
										<>{translator('whatsappCampaign.campaignName')}</>
									</span>
									<span className={classes.campaignSummaryTextDesc}>
										215646512
									</span>
								</Box>
								<Box className={classes.campaignSummaryTextWrapper}>
									<span className={classes.campaignSummaryTextTitle}>
										<>{translator('whatsappCampaign.when')}</>
									</span>
									<span className={classes.campaignSummaryTextDesc}>
										215646512
									</span>
								</Box>
								<Box className={classes.campaignSummaryTextWrapper}>
									<span className={classes.campaignSummaryTextTitle}>
										<>{translator('whatsappCampaign.for')}</>
									</span>
									<span className={classes.campaignSummaryTextDesc}>
										215646512
									</span>
									<span className={classes.campaignSummaryTextDetail}>
										<Link
											onClick={() => {
												setdetailsHide(!detailsHide);
											}}
											style={{
												textDecoration: 'underline',
												marginTop: '6px',
												fontSize: '16px',
												color: 'gray',
												width: '50px',
												cursor: 'pointer',
											}}>
											<>{translator('whatsappCampaign.details')}</>
										</Link>
									</span>
								</Box>
								<div>&emsp;</div>
								<Box className={classes.campaignSummaryTextWrapper}>
									<span className={classes.campaignSummaryTextTitle}>
										<>{translator('whatsappCampaign.sendRandomlyTo')}</>
									</span>
									<span className={classes.campaignSummaryTextDesc}>
										<input
											placeholder={translator('whatsappCampaign.insert')}
											style={{
												width: '25%',
												padding: '4px',
												textAlign: 'center',
												fontWeight: 'bold',
											}}
										/>
										&nbsp;
										<span style={{ fontSize: '12px' }}>
											<>{translator('whatsappCampaign.recipient')}</>
										</span>
									</span>
								</Box>
							</Grid>

							<Grid item lg={6}>
								<Box className={classes.sumRight}>
									<MobilePreview
										classes={classes}
										templateData={{
											templateText: '',
											templateButtons: [],
										}}
										buttonType={''}
										fileData={''}
										//   text={textMsg}
										//   keyItem="summaryPreview"
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
												<a href='https://business.facebook.com/settings/whatsapp-business-accounts/'>
													<>{translator('whatsappCampaign.limit')}</>
												</a>
											</span>
										</b>
									</div>
								</Box>
							</Grid>
						</Grid>
					</div>
				</div>
				<Grid container className={classes.alertModalAction}>
					<Button
						className='ok-button'
						variant='contained'
						color='primary'
						autoFocus
						// onClick={onConfirmOrYes}
					>
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
		</Dialog>
	);
};

export default SummaryModal;
