import {
	Box,
	Button,
	FormGroup,
	Grid,
	MenuItem,
	Select,
	Switch,
	TextField,
	Typography,
} from '@material-ui/core';
import { BaseSyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { coreProps, DynamicModalFieldsProps } from './WhatsappCampaign.types';
import { useSelector } from 'react-redux';

const DynamicModalFields = ({
	classes,
	activeDynamicButton,
	personalField,
	textInput,
	linkInput,
	navApp,
    landPage,
    navAddress,
	setTextInput,
	setPersonalField,
	onAddRemovalLink,
    setLinkInput,
    setLandPage,
    setNavApp,
    setNavAddress
}: DynamicModalFieldsProps) => {
	const { t: translator } = useTranslation();
	const { isRTL } = useSelector((state: { core: coreProps }) => state.core);
	return (
		<>
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
					<MenuItem value='booking'>Booking</MenuItem>
					<MenuItem value='confirmed'>Confirmed</MenuItem>
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
						onChange={(e: BaseSyntheticEvent) => setLinkInput(e.target.value)}
						value={linkInput}
					/>
					<Button
						variant='outlined'
						color='primary'
						size='small'
						className={classes.whatsappCampaignDynamicFieldLinkRemoval}
						onClick={() => onAddRemovalLink()}>
						Add removal link
					</Button>
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
							className={classes.whatsappCampaignDynamicFieldNavigationSelect}
							renderValue={
								navApp !== ''
									? undefined
									: () => translator('whatsappCampaign.navAppPlaceholder')
							}
							onChange={(e: BaseSyntheticEvent) => setNavApp(e.target.value)}>
							<MenuItem value='Waze'>Waze</MenuItem>
							<MenuItem value='Google Maps'>Google Maps</MenuItem>
						</Select>
					</Grid>
					<Grid item lg={12}>
						<TextField
							required
							variant='outlined'
							placeholder={translator('whatsappCampaign.navigationPlaceholder')}
							className={classes.whatsappCampaignDynamicFieldNavigationText}
							onChange={(e: BaseSyntheticEvent) =>
								setNavAddress(e.target.value)
							}
							value={navAddress}
						/>
					</Grid>
				</Grid>
			)}
		</>
	);
};
export default DynamicModalFields;
