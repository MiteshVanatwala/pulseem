import { Button, Box, Dialog, Grid, Typography } from '@material-ui/core';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Close, InfoOutlined } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { SiteTrackAlertModalProps } from '../Types/WhatsappCampaign.types';
import { FaExclamationCircle } from 'react-icons/fa';

const SiteTrackAlert = ({
	classes,
	isOpen,
	onClose,
	onOkay
}: SiteTrackAlertModalProps) => {
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
	const { t: translator } = useTranslation();

	const renderHtml = (html: string) => {
		function createMarkup() {
			return { __html: html };
		}
		return <label dangerouslySetInnerHTML={createMarkup()}></label>;
	};
	return (
		<>
			<Dialog
				fullScreen={fullScreen}
				open={isOpen}
				onClose={onClose}
				aria-labelledby='responsive-dialog-title'>
				<div className={classes.alertModal}>
					<Box className={classes.alertModalClose}>
						<Close fontSize={'small'} onClick={onClose} />
					</Box>
					<Box className={classes.alertModalInfoWrapper}>
						<Box className={classes.alertModalInfo}>
							<InfoOutlined fontSize={'small'} onClick={onClose} />
						</Box>
					</Box>
					<div className={classes.alertModalContent}>
						<Box
							className={classes.dialogBox}
							style={{
								display: 'flex',
								justifyContent: 'center',
								flexDirection: 'column',
								alignItems: 'center',
							}}>
							<FaExclamationCircle style={{ fontSize: 60 }} />
							<Typography
								className={classes.mt2}
								style={{ fontWeight: 'bold' }}>
								{translator('common.Notice')}
							</Typography>
							<Typography style={{ textAlign: 'center' }}>
								{renderHtml(translator('siteTracking.NoticeLinkStatistics'))}
							</Typography>
						</Box>
					</div>
					<Grid container className={classes.alertModalAction}>
						<Button
							className='ok-button'
							variant='contained'
							color='primary'
							autoFocus
							onClick={onOkay}>
							<>{translator('whatsapp.alertModal.okButtonText')}</>
						</Button>

						<Button
							className='cancel-button'
							variant='contained'
							color='primary'
							autoFocus
							onClick={onClose}>
							<>{translator('whatsapp.alertModal.calcelButtonText')}</>
						</Button>
					</Grid>
				</div>
			</Dialog>
		</>
	);
};

export default SiteTrackAlert;
