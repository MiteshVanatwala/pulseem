import { Button, Box, Grid, Typography } from '@material-ui/core';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { SendCampaignSuccessModalProps } from '../Types/WhatsappCampaign.types';
import Gif from '../../../../assets/images/managment/check-circle.gif';

const SendCampaignSuccess = ({
	classes,
	onBackToHome,
	onBackToCampaigns,
}: SendCampaignSuccessModalProps) => {
	const { t: translator } = useTranslation();
	return (
		<>
			<Box className={clsx(classes.flexColumnCenter)}>
				<img
					src={Gif}
					style={{ width: 150, height: 150 }}
					alt='Success'
				/>
				<Typography className={clsx(classes.fontBold, classes.font24, classes.mt2)}>
					{translator('campaigns.weSent')}
				</Typography>
				<Typography className={clsx(classes.font18, classes.mt2)}>
					{translator('campaigns.campaignIsOnItsWay')}
				</Typography>
			</Box>
			<Grid
				container
				className={clsx(classes.dialogButtonsContainer, classes.mt3)}>
				<Grid item>
					<Button
						onClick={() => {
							onBackToHome();
						}}
						variant='contained'
						size='medium'
						className={clsx(
							classes.btn,
							classes.btnRounded
						)}
						style={{ margin: '8px' }}
						color='primary'
					>
						{translator('common.backToHome')}
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
							classes.btn,
							classes.btnRounded
						)}
						style={{ margin: '8px' }}
						color='primary'
					>
						{translator('common.backToCampaigns')}
					</Button>
				</Grid>
			</Grid>
		</>
	);
};

export default SendCampaignSuccess;
