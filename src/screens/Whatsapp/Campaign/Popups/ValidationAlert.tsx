import { Button, Box, Dialog, Grid } from '@material-ui/core';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Close, InfoOutlined } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { validationAlertModalProps } from '../Types/WhatsappCampaign.types';

const ValidationAlert = ({
	classes,
	isOpen,
	onClose,
	title,
	requiredFields,
}: validationAlertModalProps) => {
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
	const { t: translator } = useTranslation();
	return (
		<>
			<Dialog
				fullScreen={fullScreen}
				open={isOpen}
				onClose={onClose}
				aria-labelledby='responsive-dialog-title'>
				<div className={classes.alertModal}>
					<div id='responsive-dialog-title' className={classes.alertModalTitle}>
						{title}
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
						<ul className={classes.validationAlertModalUl}>
							{requiredFields?.map((requiredField: string, index: number) => (
								<li key={index} className={classes.validationAlertModalLi}>
									{requiredField}
								</li>
							))}
						</ul>
					</div>
					<Grid container className={classes.alertModalAction}>
						<Button
							className='ok-button'
							variant='contained'
							color='primary'
							autoFocus
							onClick={onClose}>
							<>{translator('whatsapp.alertModal.okButtonText')}</>
						</Button>
					</Grid>
				</div>
			</Dialog>
		</>
	);
};

export default ValidationAlert;
