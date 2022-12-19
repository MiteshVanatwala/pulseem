import { Button, Box, Dialog, Grid } from '@material-ui/core';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Close } from '@material-ui/icons';
import { AlertModalProps } from './WhatsappCreator.types';
import { useTranslation } from 'react-i18next';

const AlertModal = ({
	classes,
	isOpen,
	type,
	onClose,
	title,
	subtitle,
	children,
}: AlertModalProps) => {
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
					<div className={classes.alertModalContent}>
						<div className={classes.alertModalContentText}>{subtitle}</div>
						<div className={classes.alertModalContentChildren}>{children}</div>
					</div>
					<Grid container className={classes.alertModalAction}>
						{type === 'alert' && (
							<Button
								className='ok-button'
								variant='contained'
								color='primary'
								autoFocus
								onClick={onClose}>
								{translator('whatsapp.alertModal.okButtonText')}
							</Button>
						)}
						{type === 'confirm' && (
							<>
								<Button
									className='confirm-button'
									color='secondary'
									variant='contained'>
									{translator('whatsapp.alertModal.confirmButtonText')}
								</Button>
								<Button
									className='cancel-button'
									color='primary'
									variant='contained'
									onClick={onClose}>
									{translator('whatsapp.alertModal.calcelButtonText')}
								</Button>
							</>
						)}
						{type === 'delete' && (
							<>
								<Button
									className='confirm-button'
									color='secondary'
									variant='contained'>
									{translator('whatsapp.alertModal.yesButtonText')}
								</Button>
								<Button
									className='cancel-button'
									color='primary'
									variant='contained'
									onClick={onClose}>
									{translator('whatsapp.alertModal.calcelButtonText')}
								</Button>
							</>
						)}
						{type === 'submit' && (
							<>
								<Button
									className='confirm-button'
									color='secondary'
									variant='contained'>
									{translator('whatsapp.alertModal.submitButtonText')}
								</Button>
								<Button
									className='cancel-button'
									color='primary'
									variant='contained'
									onClick={onClose}>
									{translator('whatsapp.alertModal.calcelButtonText')}
								</Button>
							</>
						)}
					</Grid>
				</div>
			</Dialog>
		</>
	);
};

export default AlertModal;
