import {
	Button,
	Box,
	Dialog,
	Grid,
	TextField,
	InputAdornment,
	Checkbox,
	FormGroup,
	FormControlLabel,
} from '@material-ui/core';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Close, SupervisedUserCircleOutlined } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

const RestoreDeletedModal = ({
	classes,
	isOpen,
	onClose,
	onConfirmOrYes,
	title,
}: any) => {
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
	const { t: translator } = useTranslation();

	const onCancel = () => {
		onClose();
	};

	const deletedCampaigns = [
		{
			id: '21',
			campaignName: 'demo campaign 1',
		},
		{
			id: '211',
			campaignName: 'demo campaign 2',
		},
		{
			id: '213',
			campaignName: 'demo campaign 3',
		},
		{
			id: '21564',
			campaignName: 'demo campaign 4',
		},
		{
			id: '26781',
			campaignName: 'demo campaign 5',
		},
		{
			id: '27801',
			campaignName: 'demo campaign 6',
		},
		{
			id: '23451',
			campaignName: 'demo campaign 7',
		},
		{
			id: '2231',
			campaignName: 'demo campaign 8',
		},
	];

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
							<SupervisedUserCircleOutlined
								fontSize={'small'}
								onClick={onClose}
							/>
						</Box>
					</Box>
					<div className={classes.alertModalContent}>
						<div className={classes.testGroupModalContentWrapper}>
							<Box border={'1px solid'}>
								<FormGroup
									aria-label='position'
									className={classes.restoreDeletedModalFormGroup}>
									{deletedCampaigns?.map((campaign: any) => (
										<FormControlLabel
											className={classes.restoreDeletedModalFormLabel}
											key={campaign.id}
											value={campaign.id}
											control={<Checkbox />}
											label={campaign.campaignName}
											labelPlacement='end'
										/>
									))}
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
