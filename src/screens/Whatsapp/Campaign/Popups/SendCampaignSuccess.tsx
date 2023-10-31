import { Button, Box, Dialog, Grid, Typography } from '@material-ui/core';
import clsx from 'clsx';
import { Close, InfoOutlined } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { SendCampaignSuccessModalProps } from '../Types/WhatsappCampaign.types';
import Gif from '../../../../assets/images/managment/check-circle.gif';

const SendCampaignSuccess = ({
	classes,
	isOpen,
	isFromAutomation = false,
	onClose,
	onBackToHome,
	onBackToCampaigns,
	onBackToAutomation,
}: SendCampaignSuccessModalProps) => {
	const { t: translator } = useTranslation();
	return (
		<>
			<Dialog
				open={isOpen}
				onClose={onClose}
				aria-labelledby='responsive-dialog-title'>
				<div className={classes.alertModal}>
					<div id='responsive-dialog-title' className={classes.alertModalTitle}>
						<>{translator('campaigns.campaignIsOnItsWay')}</>
					</div>
					<Box className={classes.alertModalClose}>
						<Close fontSize={'small'} onClick={onClose} />
					</Box>
					<Box className={classes.alertModalInfoWrapper}>
						<Box className={classes.alertModalInfo}>
							<InfoOutlined fontSize={'small'} onClick={onClose} />
						</Box>
					</Box>
					<div className={classes.alertModalContent}>
						<Box className={clsx(classes.flexColumnCenter, classes.p20)}>
							<img
								src={Gif}
								style={{ width: 150, height: 150 }}
								alt='Success'
							/>
							<Typography
								className={clsx(classes.fontBold, classes.font24, classes.mt2)}>
								<>{translator('campaigns.weSent')}</>
							</Typography>
							<Typography className={clsx(classes.font18, classes.mt2)}>
								<>{translator('campaigns.campaignIsOnItsWay')}</>
							</Typography>
						</Box>
					</div>
					<Grid
						container
						spacing={4}
						className={clsx(classes.dialogButtonsContainer, classes.mt3)}>
						{
							!isFromAutomation && (
								<>
									<Grid item>
										<Button
											onClick={() => {
												onBackToHome();
											}}
											variant='contained'
											size='medium'
											className={clsx(
												classes.actionButton,
												classes.actionButtonLightBlue,
												classes.backButton
											)}
											style={{ margin: '8px' }}
											color='primary'>
											<>{translator('common.backToHome')}</>
										</Button>
									</Grid>
									<Grid item>
										<Button
											onClick={() => {
												onBackToCampaigns();
											}}
											variant='contained'
											size='medium'
											className={clsx(
												classes.actionButton,
												classes.actionButtonLightBlue,
												classes.backButton
											)}
											style={{ margin: '8px' }}
											color='primary'>
											<>{translator('common.backToCampaigns')}</>
										</Button>
									</Grid>
								</>
							)
						}
						{
							isFromAutomation && (
								<Grid item>
									<Button
										onClick={() => {
											onBackToAutomation();
										}}
										variant='contained'
										size='medium'
										className={clsx(
											classes.actionButton,
											classes.actionButtonLightBlue,
											classes.backButton
										)}
										style={{ margin: '8px' }}
										color='primary'
									>
										{translator('common.backToAutomation')}
									</Button>
								</Grid>
							)
						}
					</Grid>
				</div>
			</Dialog>
		</>
	);
};

export default SendCampaignSuccess;
