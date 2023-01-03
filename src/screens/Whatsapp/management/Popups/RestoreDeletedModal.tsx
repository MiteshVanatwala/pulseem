import {
	Button,
	Box,
	Dialog,
	Grid,
	Checkbox,
	FormGroup,
	FormControlLabel,
} from '@material-ui/core';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Close, SupervisedUserCircleOutlined } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { RestoreDeletedModalProps } from '../Types/Management.types';
import { BaseSyntheticEvent } from 'react';

const RestoreDeletedModal = ({
	classes,
	isOpen,
	onClose,
	onConfirmOrYes,
	title,
	deletedCampaigns,
	restoreIds,
	setRestoreIds,
}: RestoreDeletedModalProps) => {
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
	const { t: translator } = useTranslation();

	const onCancel = () => {
		setRestoreIds([]);
		onClose();
	};
	const onRestoreDeletedChange = (restoreId: string, isChecked: boolean) => {
		const isAvaliable = restoreIds?.find((id: string) => id === restoreId);
		if (isChecked) {
			if (!!!isAvaliable) {
				setRestoreIds([...restoreIds, restoreId]);
			}
		} else {
			if (!!isAvaliable) {
				const updatedIds = restoreIds?.filter((id: string) => id !== restoreId);
				setRestoreIds([...updatedIds]);
			}
		}
	};

	return (
		<>
			<Dialog
				fullScreen={fullScreen}
				open={isOpen}
				onClose={onCancel}
				aria-labelledby='responsive-dialog-title'>
				<div className={classes.alertModal}>
					<div id='responsive-dialog-title' className={classes.alertModalTitle}>
						{title}
					</div>
					<Box className={classes.alertModalClose}>
						<Close fontSize={'small'} onClick={onCancel} />
					</Box>
					<Box className={classes.alertModalInfoWrapper}>
						<Box className={classes.alertModalInfo}>
							<SupervisedUserCircleOutlined fontSize={'small'} />
						</Box>
					</Box>
					<div className={classes.alertModalContent}>
						<div className={classes.testGroupModalContentWrapper}>
							<Box border={'1px solid'}>
								<FormGroup
									aria-label='position'
									className={classes.restoreDeletedModalFormGroup}>
									{deletedCampaigns?.map(
										(campaign: { id: string; campaignName: string }) => (
											<FormControlLabel
												className={classes.restoreDeletedModalFormLabel}
												key={campaign.id}
												value={campaign.id}
												control={<Checkbox />}
												label={campaign.campaignName}
												labelPlacement='end'
												onChange={(e: BaseSyntheticEvent) =>
													onRestoreDeletedChange(
														e.target.value,
														e.target.checked
													)
												}
											/>
										)
									)}
								</FormGroup>
							</Box>
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
							onClick={onCancel}>
							<>{translator('whatsapp.alertModal.calcelButtonText')}</>
						</Button>
					</Grid>
				</div>
			</Dialog>
		</>
	);
};

export default RestoreDeletedModal;
