import {
	Box,
	Button,
	Divider,
	FormControl,
	FormGroup,
	Grid,
	InputAdornment,
	MenuItem,
	Switch,
	TextField,
	Typography,
} from '@material-ui/core';
import { BaseSyntheticEvent, useEffect, useState } from 'react';
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
import { Select } from '@mui/material';
import { IoIosArrowDown } from 'react-icons/io';
import { DynamicProductLink } from '../../../../Models/PushNotifications/Enums';
import { MdClear } from 'react-icons/md';

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
	dynamicProductType,
	setDynamicProductType,
	dynamicProductFallbackURL,
	setDynamicProductFallbackURL
}: DynamicModalFieldsProps) => {
	const { t: translator } = useTranslation();
	const { isRTL, windowSize } = useSelector((state: { core: coreProps }) => state.core);
	const SubAccountSettings = useSelector(
		(state: {
			common: { accountSettings: { SubAccountSettings: SubAccountSettings } };
		}) => state.common?.accountSettings?.SubAccountSettings
	);
	const [isSiteTrack, setIsSiteTrack] = useState(false);

	useEffect(() => {
		setDynamicProductType('');
		setDynamicProductFallbackURL('');
		setLinkInput('', false);
	}, [ activeDynamicButton ])
	
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
		setDynamicProductType('');
		setDynamicProductFallbackURL('');
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
				<FormControl className={clsx(classes.selectInputFormControl, windowSize === 'xs' ? classes.w100 : classes.w50, classes.mt10)}>
					<Select
						variant="standard"
						name="FromEmail"
						value={personalField}
						className={clsx(classes.pbt5, classes.w100)}
						onChange={(event: any) => setPersonalField(event.target.value)}
						IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
						MenuProps={{
							PaperProps: {
								style: {
									maxHeight: 300,
									direction: isRTL ? 'rtl' : 'ltr',
								},
							},
						}}
						displayEmpty={true}
					>
						<MenuItem value={''}>
							{translator('whatsappCampaign.pFieldPlaceholder')}
						</MenuItem>
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
				</FormControl>
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
				<div className={clsx(classes.whatsappCampaignDynamicFieldLink, classes.pt10)}>
					<Grid container className={clsx(classes.whatsappCampaignDynamicFieldLink)} spacing={2}>
						<Grid item md={7}>
							<TextField
								required
								variant='outlined'
								placeholder={translator('whatsappCampaign.linkPlaceholder')}
								className={clsx('link-input', classes.w100)}
								onChange={(e: BaseSyntheticEvent) =>
									setLinkInput(e.target.value, isTrackLink)
								}
								disabled={linkInput?.includes('##WHATSAPPUnsubscribelink##') || linkInput?.includes('dynamicProduct')}
								value={linkInput}
								InputProps={{
									endAdornment: (
										<InputAdornment position="end" onClick={() => setLinkInput('', isTrackLink)} className={clsx(!linkInput ? classes.dNone : null)}>
											<MdClear style={{ cursor: 'pointer' }} />
										</InputAdornment>
									)
								}}
							/>

							{
								dynamicProductType && (
									<TextField
										required
										variant='outlined'
										placeholder={translator('common.fallbackURL')}
										className={clsx('link-input', classes.w100, classes.mt10)}
										onChange={(e: BaseSyntheticEvent) => {
											setLinkInput(dynamicProductType, isTrackLink, e.target.value);
											setDynamicProductFallbackURL(e.target.value)
										}}
										value={dynamicProductFallbackURL}
										disabled={!dynamicProductType}
									/>
								)
							}

							{ dynamicProductType && <Divider className={classes.mt20} /> }
							<Box className={clsx(classes.switchDiv, classes.pt14)} style={{ marginInlineStart: 0 }}>
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
										disabled={linkInput?.includes('##WHATSAPPUnsubscribelink##') || linkInput?.includes('dynamicProduct')}
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
						</Grid>
						<Grid item md={5}>
							<Button
								variant='outlined'
								color='primary'
								size='small'
								className={clsx(
									classes.btn,
									classes.btnRounded,
									classes.width160,
									linkInput?.includes('##WHATSAPPUnsubscribelink##') ? classes.redButton : ''
								)}
								onClick={() => onAddRemovalLinkClick()}
								style={{
									marginLeft: windowSize == 'xs' ? 0 : 10,
									marginTop: windowSize == 'xs' ? 10 : 0
								}}
							>
								<>{translator('whatsappCampaign.removalLinkTooltip')}</>
							</Button>

							<Button
								variant='outlined'
								color='primary'
								size='small'
								className={clsx(
									classes.btn,
									classes.btnRounded,
									classes.width160,
									dynamicProductType === DynamicProductLink.LATEST_PURCHASE ? classes.redButton : ''
								)}
								onClick={() => setDynamicProductType(DynamicProductLink.LATEST_PURCHASE) }
								style={{
									marginLeft: windowSize == 'xs' ? 0 : 10,
									marginTop: windowSize == 'xs' ? 10 : 5
								}}
							>
								{translator('common.latestPurchase')}
							</Button>
							<Button
								variant='outlined'
								color='primary'
								size='small'
								className={clsx(
									classes.btn,
									classes.btnRounded,
									classes.width160,
									dynamicProductType === DynamicProductLink.LATEST_ABANDONMENT ? classes.redButton : ''
								)}
								onClick={() => setDynamicProductType(DynamicProductLink.LATEST_ABANDONMENT)}
								style={{
									marginLeft: windowSize == 'xs' ? 0 : 10,
									marginTop: windowSize == 'xs' ? 10 : 5
								}}
							>
								{translator('common.latestAbandonment')}
							</Button>
						</Grid>
					</Grid>
				</div>
			)}

			{activeDynamicButton?.includes('lPage') && (
				<FormControl className={clsx(classes.selectInputFormControl, windowSize === 'xs' ? classes.w100 : classes.w50, classes.mt10)}>
					<Select
						variant="standard"
						value={landPage}
						className={clsx(classes.pbt5, classes.w100)}
						onChange={(event: any) => setLandPage(event.target.value)}
						IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
						MenuProps={{
							PaperProps: {
								style: {
									maxHeight: 300,
									direction: isRTL ? 'rtl' : 'ltr',
								},
							},
						}}
						displayEmpty={true}
					>
						<MenuItem value={''}>
							{translator('whatsappCampaign.lPagePlaceholder')}
						</MenuItem>
						{landingPageData?.map((landingPage: landingPageDataProps) => (
							<MenuItem key={landingPage.CampaignID} value={landingPage.PageHref}>
								{landingPage.CampaignName}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			)}

			{activeDynamicButton?.includes('navigation') && (
				<Grid container spacing={1}>
					<Grid item xs={12} sm={6} md={6}>
						<FormControl className={clsx(classes.selectInputFormControl, classes.w100, classes.mt10, windowSize === 'xs' ? classes.mb10 : '')}>
							<Select
								variant="standard"
								value={navApp}
								className={clsx(classes.pbt5, classes.w100)}
								onChange={(event: any) => updateNavApp(event.target.value)}
								IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
								MenuProps={{
									PaperProps: {
										style: {
											maxHeight: 300,
											direction: isRTL ? 'rtl' : 'ltr',
										},
									},
								}}
							>
								<MenuItem value='Waze'>Waze</MenuItem>
								<MenuItem value='Google Maps'>Google Maps</MenuItem>
							</Select>
						</FormControl>
					</Grid>
					<Grid item xs={12} sm={6} md={6}>
						<TextField
							required
							variant='outlined'
							placeholder={translator('whatsappCampaign.navigationPlaceholder')}
							className={classes.w100}
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
