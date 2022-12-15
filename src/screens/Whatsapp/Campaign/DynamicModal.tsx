import React, { useState, useMemo, BaseSyntheticEvent } from 'react';
import {
	Button,
	Box,
	IconButton,
	Dialog,
	DialogActions,
	TextField,
	MenuItem,
	Switch,
	Typography,
	FormGroup,
	Select,
	Grid,
} from '@material-ui/core';
import { useMediaQuery, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Close } from '@material-ui/icons';
import clsx from 'clsx';
import {
	coreProps,
	dynamicButtonProps,
	dynamicModalProps,
} from './WhatsappCampaign.types';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

const DynamicModal = ({
	classes,
	isDynamcFieldModal,
	onDynamcFieldModalClose,
}: dynamicModalProps) => {
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('lg'));
	const { t: translator } = useTranslation();
	const { isRTL } = useSelector((state: { core: coreProps }) => state.core);

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
				<Grid container className={classes.whatsappCampaignDynamicFieldContent}>
					<Grid className={classes.whatsappCampaignDynamicFieldContentText}>
						<Stack direction='row' spacing={0}>
							{dynamicButtons.map((button) => (
								<Button
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
									onClick={() => setActiveDynamicButton(button.buttonTitle)}>
									{translator(button.buttonTitle)}
								</Button>
							))}
						</Stack>
					</Grid>
					{activeDynamicButton?.includes('pField') && (
						<Select
							required
							value={personalField}
							displayEmpty
							variant='outlined'
							className={classes.whatsappCampaignDynamicFieldPersonalField}
							renderValue={
								personalField !== ''
									? undefined
									: () => translator('whatsappCampaign.pFieldPlaceholder')
							}
							onChange={(e: BaseSyntheticEvent) =>
								setPersonalField(e.target.value)
							}>
							<MenuItem value='Jonak'>Jonak</MenuItem>
							<MenuItem value='Roy'>Roy</MenuItem>
							<MenuItem value='Jonak'>Jonak</MenuItem>
							<MenuItem value='Roy'>Roy</MenuItem>
							<MenuItem value='Jonak'>Jonak</MenuItem>
							<MenuItem value='Roy'>Roy</MenuItem>
							<MenuItem value='Jonak'>Jonak</MenuItem>
							<MenuItem value='Roy'>Roy</MenuItem>
							<MenuItem value='Jonak'>Jonak</MenuItem>
							<MenuItem value='Roy'>Roy</MenuItem>
							<MenuItem value='Jonak'>Jonak</MenuItem>
							<MenuItem value='Roy'>Roy</MenuItem>
							<MenuItem value='Jonak'>Jonak</MenuItem>
							<MenuItem value='Roy'>Roy</MenuItem>
							<MenuItem value='Jonak'>Jonak</MenuItem>
							<MenuItem value='Roy'>Roy</MenuItem>
							<MenuItem value='Jonak'>Jonak</MenuItem>
							<MenuItem value='Roy'>Roy</MenuItem>
							<MenuItem value='Jonak'>Jonak</MenuItem>
							<MenuItem value='Roy'>Roy</MenuItem>
							<MenuItem value='Jonak'>Jonak</MenuItem>
							<MenuItem value='Roy'>Roy</MenuItem>
							<MenuItem value='Jonak'>Jonak</MenuItem>
							<MenuItem value='Roy'>Roy</MenuItem>
							<MenuItem value='Jonak'>Jonak</MenuItem>
							<MenuItem value='Roy'>Roy</MenuItem>
							<MenuItem value='Jonak'>Jonak</MenuItem>
							<MenuItem value='Roy'>Roy</MenuItem>
							<MenuItem value='Jonak'>Jonak</MenuItem>
							<MenuItem value='Roy'>Roy</MenuItem>
						</Select>
					)}

					{activeDynamicButton?.includes('text') && (
						<textarea
							required
							placeholder={translator('whatsappCampaign.textPlaceholder')}
							className={classes.whatsappCampaignDynamicFieldTextarea}
							onChange={(e: BaseSyntheticEvent) => setTextInput(e.target.value)}
							value={textInput}
						/>
					)}

					{activeDynamicButton?.includes('link') && (
						<div className={classes.whatsappCampaignDynamicFieldLink}>
							<Box className={classes.switchDiv}>
								<FormGroup>
									<Switch
										className={
											isRTL
												? clsx(
														classes.reactSwitchHe,
														'react-switch',
														'dynamic-link-switch'
												  )
												: clsx(
														classes.reactSwitch,
														'react-switch',
														'dynamic-link-switch'
												  )
										}
										checked={true}
									/>
								</FormGroup>
								<Box>
									<Typography className='keep-track'>
										{translator('mainReport.keepTrack')}
									</Typography>
									<Typography className='keep-track-desc'>
										{translator('mainReport.keepDesc')}
									</Typography>
								</Box>
							</Box>
							<br />
							<TextField
								required
								variant='outlined'
								placeholder={translator('whatsappCampaign.linkPlaceholder')}
								className='link-input'
								onChange={(e: BaseSyntheticEvent) =>
									setLinkInput(e.target.value)
								}
								value={linkInput}
							/>
						</div>
					)}

					{activeDynamicButton?.includes('lPage') && (
						<Select
							required
							value={landPage}
							displayEmpty
							variant='outlined'
							className={classes.whatsappCampaignDynamicFieldLandingPage}
							renderValue={
								landPage !== ''
									? undefined
									: () => translator('whatsappCampaign.lPagePlaceholder')
							}
							onChange={(e: BaseSyntheticEvent) => setLandPage(e.target.value)}>
							<MenuItem value='Landing page 1'>Landing page 1</MenuItem>
							<MenuItem value='Landing page 2'>Landing page 2</MenuItem>
						</Select>
					)}

					{activeDynamicButton?.includes('navigation') && (
						<Grid container>
							<Grid item lg={12}>
								<Select
									required
									value={navApp}
									displayEmpty
									variant='outlined'
									className={
										classes.whatsappCampaignDynamicFieldNavigationSelect
									}
									renderValue={
										navApp !== ''
											? undefined
											: () => translator('whatsappCampaign.navAppPlaceholder')
									}
									onChange={(e: BaseSyntheticEvent) =>
										setNavApp(e.target.value)
									}>
									<MenuItem value='Waze'>Waze</MenuItem>
									<MenuItem value='Google Maps'>Google Maps</MenuItem>
								</Select>
							</Grid>
							<Grid item lg={12}>
								<TextField
									required
									variant='outlined'
									placeholder={translator(
										'whatsappCampaign.navigationPlaceholder'
									)}
									className={classes.whatsappCampaignDynamicFieldNavigationText}
									onChange={(e: BaseSyntheticEvent) =>
										setNavAddress(e.target.value)
									}
									value={navAddress}
								/>
							</Grid>
						</Grid>
					)}
				</Grid>
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
