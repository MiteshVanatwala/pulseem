import React, { useState, useMemo } from 'react';
import {
	Button,
	Box,
	IconButton,
	Dialog,
	DialogActions,
	Grid,
} from '@material-ui/core';
import { useMediaQuery, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Close } from '@material-ui/icons';
import {
	dynamicButtonProps,
	dynamicModalProps,
} from './WhatsappCampaign.types';
import { useTranslation } from 'react-i18next';
import DynamicModalFields from './DynamicModalFields';

const DynamicModal = ({
	classes,
	isDynamcFieldModal,
	onDynamcFieldModalClose,
}: dynamicModalProps) => {
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('lg'));
	const { t: translator } = useTranslation();

	const [navApp, setNavApp] = React.useState<string>('');
	const [landPage, setLandPage] = React.useState<string>('');
	const [personalField, setPersonalField] = React.useState<string>('');
	const [textInput, setTextInput] = React.useState<string>('');
	const [linkInput, setLinkInput] = React.useState<string>('');
	const [navAddress, setNavAddress] = React.useState<string>('');
	const [activeDynamicButton, setActiveDynamicButton] = useState<string>(
		'whatsappCampaign.pField'
	);

	const dynamicButtons = useMemo<dynamicButtonProps[]>(
		() => [
			{
				tooltipTitle: 'whatsappCampaign.pField',
				buttonTitle: 'whatsappCampaign.pField',
			},
			{
				tooltipTitle: 'whatsappCampaign.text',
				buttonTitle: 'whatsappCampaign.text',
			},
			{
				tooltipTitle: 'whatsappCampaign.link',
				buttonTitle: 'whatsappCampaign.link',
			},
			{
				tooltipTitle: 'whatsappCampaign.lPage',
				buttonTitle: 'whatsappCampaign.lPage',
			},
			{
				tooltipTitle: 'whatsappCampaign.navigation',
				buttonTitle: 'whatsappCampaign.navigation',
			},
		],
		[]
	);

	const onAddRemovalLink = () => {
		if (!linkInput?.includes('##WHATSAPPUnsubscribelink##')) {
			setLinkInput(linkInput + '##WHATSAPPUnsubscribelink##');
		}
	};

	return (
		<>
			<Dialog
				fullScreen={fullScreen}
				open={isDynamcFieldModal}
				onClose={onDynamcFieldModalClose}
				aria-labelledby='responsive-dialog-title'>
				<div className={classes.whatsappCampaignDynamicFieldTitle}>
					{translator('whatsappCampaign.dfieldTitle')}
				</div>
				<Box className={classes.whatsappCampaignDynamicFieldClose}>
					<IconButton>
						<Close onClick={onDynamcFieldModalClose} />
					</IconButton>
				</Box>
				<Box style={{ height: '203px' }}>
					<Grid
						container
						className={classes.whatsappCampaignDynamicFieldContent}>
						<Grid
							container
							className={classes.whatsappCampaignDynamicFieldContentText}>
							<Stack direction='row' spacing={0}>
								{dynamicButtons.map(
									(button: dynamicButtonProps, index: number) => (
										<Button
											key={index}
											variant='outlined'
											color='primary'
											size='small'
											style={{
												margin: '0px 6px 6px 0px',
												padding: '3px 9px',
												borderRadius: '20px',
											}}
											className={
												button.buttonTitle === activeDynamicButton
													? classes.whatsappCampaignDynamicFieldButtonActive
													: classes.whatsappCampaignDynamicFieldButton
											}
											onClick={() =>
												setActiveDynamicButton(button.buttonTitle)
											}>
											{translator(button.buttonTitle)}
										</Button>
									)
								)}
							</Stack>
						</Grid>
						<DynamicModalFields
							classes={classes}
							activeDynamicButton={activeDynamicButton}
							personalField={personalField}
							textInput={textInput}
							linkInput={linkInput}
							navApp={navApp}
							landPage={landPage}
							navAddress={navAddress}
							setTextInput={setTextInput}
							setPersonalField={setPersonalField}
							onAddRemovalLink={onAddRemovalLink}
							setLinkInput={setLinkInput}
							setLandPage={setLandPage}
							setNavApp={setNavApp}
							setNavAddress={setNavAddress}
						/>
					</Grid>
				</Box>
				<DialogActions>
					<Button
						// color="primary"
						variant='contained'
						style={{
							margin: '6px',
							padding: '3px 9px',
							borderRadius: '20px',
							backgroundColor: '#d63511',
							color: 'white',
						}}>
						Exit
					</Button>
					<Button
						// color="secondary"
						variant='contained'
						style={{
							margin: '6px',
							padding: '3px 9px',
							borderRadius: '20px',
							backgroundColor: '#1e8a22',
							color: 'white',
						}}>
						Save
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default DynamicModal;
