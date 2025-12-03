import { Button, Box, Grid, Typography } from '@material-ui/core';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { SendCampaignSuccessModalProps } from '../Types/WhatsappCampaign.types';
import Gif from '../../../../assets/images/managment/check-circle.gif';
import { DateFormats } from '../../../../helpers/Constants';
import moment from 'moment';

const SendCampaignSuccess = ({
	classes,
	isFromAutomation = false,
	onBackToHome,
	onBackToCampaigns,
	onBackToAutomation = () => {},
	sendType,
	sendDate,
	sendTime,
	daysBeforeAfter,
	spectialDateFieldID,
	isSpecialDateBefore,
	specialDatedropDown
}: SendCampaignSuccessModalProps) => {
	const { t: translator } = useTranslation();
	console.log(spectialDateFieldID)

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

	const sentDate = sendType == 3
			? `${daysBeforeAfter} ${translator("mainReport.days")} ${!isSpecialDateBefore ? translator("mainReport.after") : translator("mainReport.before")} ${getSpecialDay()}` 
			: moment(sendDate).format(DateFormats.DATE_ONLY);

	const time = sendType == 3 ? sendTime.format(DateFormats.TIME_ONLY_AMPM) : (sendDate || moment()).format(DateFormats.TIME_ONLY_AMPM) || moment().format(DateFormats.TIME_ONLY);

	return (
		<>
			<Box className={clsx(classes.flexColumnCenter)}>
				<img
					src={Gif}
					style={{ width: 150, height: 150 }}
					alt='Success'
				/>
				<Typography className={clsx(classes.fontBold, classes.font24, classes.mt2)}>
					{translator( sendType == 1 ? 'campaigns.weSent' : 'campaigns.whatsappMailingScheduled' )}
				</Typography>
				<Typography className={clsx(classes.font18, classes.mt2)}>
					{ sendType == 1 
							? translator("campaigns.campaignIsOnItsWay") 
							: translator('campaigns.whatsappMailingScheduledDesc', { DATE_OF_SCHEDULE: sentDate, TIME_OF_SCHEDULE: time })}
				</Typography>
			</Box>
			<Grid
				container
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
						</>
					)
				}

				{
					isFromAutomation && (
						<Grid item>
							<Button
								onClick={() => {
									onBackToAutomation && onBackToAutomation();
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
		</>
	);
};

export default SendCampaignSuccess;
