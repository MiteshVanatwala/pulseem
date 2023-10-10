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
import { BaseSyntheticEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import {
	DynamicModalFieldsProps,
	coreProps,
	landingPageDataProps,
	SubAccountSettings,
} from '../Types/WhatsappCampaign.types';
import { useSelector } from 'react-redux';
import SiteTrackAlert from './SiteTrackAlert';
import { checkSiteTrackingLink } from '../../Common';

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
	setNavAddress,
	personalFields,
	landingPageData,
	isTrackLink,
}: DynamicModalFieldsProps) => {
	const { t: translator } = useTranslation();
	const { isRTL, windowSize } = useSelector((state: { core: coreProps }) => state.core);
	const SubAccountSettings = useSelector(
		(state: {
			common: { accountSettings: { SubAccountSettings: SubAccountSettings } };
		}) => state.common?.accountSettings?.SubAccountSettings
	);
	const [isSiteTrack, setIsSiteTrack] = useState(false);

	const onTrackLinkToggle = () => {
		if (isTrackLink && checkSiteTrackingLink(SubAccountSettings, linkInput)) {
			setIsSiteTrack(true);
		} else {
			setLinkInput(linkInput, !isTrackLink);
		}
	};

	const onSiteTrackOkay = () => {
		setIsSiteTrack(false);
		setLinkInput(linkInput, !isTrackLink);
	};

	const onAddRemovalLinkClick = () => {
		onAddRemovalLink(true);
	};

	const updateNavAddress = (navAddress: string) => {
		setNavAddress(
			`${
				navApp === 'Waze' ? 'https://waze.to/?q=' : 'http://maps.google.com/?q='
			}${encodeURI(navAddress)}`
		);
	};

	const updateNavApp = (navApp: string) => {
		setNavApp(navApp);
		if (navApp === 'Waze') {
			setNavAddress(
				navAddress?.replaceAll(
					'http://maps.google.com/?q=',
					'https://waze.to/?q='
				)
			);
		} else {
			setNavAddress(
				navAddress?.replaceAll(
					'https://waze.to/?q=',
					'http://maps.google.com/?q='
				)
			);
		}
	};

	return (
		<>
			{activeDynamicButton?.includes('pField') && (
				<Select
					required
					value={personalField}
					displayEmpty
					variant='standard'
					className={classes.whatsappCampaignDynamicFieldPersonalField}
					renderValue={
						personalField !== ''
							? undefined
							: () => <>{translator('whatsappCampaign.pFieldPlaceholder')}</>
					}
					MenuProps={{
						PaperProps: {
							style: {
								maxHeight: 48 * 4.5 + 8,
								width: 250,
								direction: isRTL ? 'rtl' : 'ltr',
							},
						},
					}}
					onChange={(e: BaseSyntheticEvent) =>
						setPersonalField(e.target.value)
					}>
					{Object.keys(personalFields)
						?.filter(
							(personalField) =>
								personalFields[personalField] &&
								personalFields[personalField]?.length > 0
						)
						?.map((personalFieldKey: string, index: number) => (
							<MenuItem key={index} value={personalFieldKey}>
								{personalFields[personalFieldKey]}
							</MenuItem>
						))}
				</Select>
			)}

			{activeDynamicButton?.includes('text') && (
				<textarea
					required
					placeholder={translator('whatsappCampaign.textPlaceholder')}
					className={classes.whatsappCampaignDynamicFieldTextarea}
					onChange={(e: BaseSyntheticEvent) => setTextInput(e.target.value)}
					value={textInput}
					onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
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
								disabled={linkInput?.includes('##WHATSAPPUnsubscribelink##')}
								checked={isTrackLink}
								onChange={() => onTrackLinkToggle()}
							/>
						</FormGroup>
						<Box>
							<Typography className='keep-track'>
								<>{translator('mainReport.keepTrack')}</>
							</Typography>
							<Typography className='keep-track-desc'>
								<>{translator('mainReport.keepDesc')}</>
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
							setLinkInput(e.target.value, isTrackLink)
						}
						disabled={linkInput?.includes('##WHATSAPPUnsubscribelink##')}
						value={linkInput}
					/>
					<Button
						variant='outlined'
						color='primary'
						size='small'
						className={clsx(
							// classes.whatsappCampaignDynamicFieldLinkRemoval,
							classes.btn,
							classes.btnRounded
						)}
						onClick={() => onAddRemovalLinkClick()}
						style={{
							marginLeft: windowSize == 'xs' ? 0 : 10,
							marginTop: windowSize == 'xs' ? 10 : 5
						}}
					>
						<>{translator('whatsappCampaign.removalLinkTooltip')}</>
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
							: () => <>{translator('whatsappCampaign.lPagePlaceholder')}</>
					}
					MenuProps={{
						PaperProps: {
							style: {
								maxHeight: 48 * 4.5 + 8,
								width: 250,
								direction: isRTL ? 'rtl' : 'ltr',
							},
						},
					}}
					onChange={(e: BaseSyntheticEvent) => setLandPage(e.target.value)}>
					{landingPageData?.map((landingPage: landingPageDataProps) => (
						<MenuItem key={landingPage.CampaignID} value={landingPage.PageHref}>
							{landingPage.CampaignName}
						</MenuItem>
					))}
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
									: () => (
											<>{translator('whatsappCampaign.navAppPlaceholder')}</>
									  )
							}
							MenuProps={{
								PaperProps: {
									style: {
										maxHeight: 48 * 4.5 + 8,
										width: 250,
										direction: isRTL ? 'rtl' : 'ltr',
									},
								},
							}}
							onChange={(e: BaseSyntheticEvent) =>
								updateNavApp(e.target.value)
							}>
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
								updateNavAddress(e.target.value)
							}
							value={decodeURI(
								navAddress?.split('?q=')[navAddress?.split('?q=')?.length - 1]
							)}
						/>
					</Grid>
				</Grid>
			)}

			<SiteTrackAlert
				classes={classes}
				isOpen={isSiteTrack}
				onClose={() => setIsSiteTrack(false)}
				onOkay={() => onSiteTrackOkay()}
			/>
		</>
	);
};
export default DynamicModalFields;
