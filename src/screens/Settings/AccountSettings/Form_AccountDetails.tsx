import { useState, useEffect } from 'react';
import {
	Box,
	Button,
	FormControl,
	FormControlLabel,
	Grid,
	MenuItem,
	Radio,
	RadioGroup,
	TextField,
	Typography,
} from '@material-ui/core';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { Title } from '../../../components/managment/Title';
import { AccDtlPropTypes } from '../../../Models/Settings/AccountDetails';
import { IsNumberField, IsValidEmail, IsValidPhoneNumber } from '../../../helpers/Utils/Validations';
import { AccountSettings } from '../../../Models/Account/AccountSettings';
import { tierSetting } from '../../Whatsapp/Constant';
import Illustration_app_Settings from '../../../assets/images/settings/Illustration_app_Settings';
import { IoIosArrowDown } from 'react-icons/io';
import PulseemSwitch from '../../../components/Controlls/PulseemSwitch';
import { cancelDisablePluginOTP, confimrOtp } from '../../../redux/reducers/AccountSettingsSlice';
import { PulseemFeatures } from '../../../model/PulseemFields/Fields';
import OTP from '../../../components/OneTimePassword/OTP';
import { logout } from '../../../helpers/Api/PulseemReactAPI';
import { OtpRequestFor } from '../../../Models/Authorization/AuthorizationModels';
import { RenderHtml } from '../../../helpers/Utils/HtmlUtils';

const FORM_ACCOUNT_DETAILS = ({
	classes,
	Settings,
	OnUpdate,
	selectedTier,
	onTierChange = () => { },
}: AccDtlPropTypes) => {
	const dispatch = useDispatch();
	const { t } = useTranslation();
	const { isRTL, windowSize } = useSelector((state: any) => state.core);
	const { accountFeatures } = useSelector((state: any) => state.common);
	const [fromEmailError, setFromEmailError] = useState<boolean>(false);
	const [fromCellphonError, setFromCellphonError] = useState<boolean>(false);


	const [accountDetails, setAccountDetails] = useState<AccountSettings | null>({
		DefaultFromMail: '',
		DefaultFromName: '',
		DefaultCellNumber: '',
		UnsubscribeType: false,
		IsSmsImmediateUnsubscribeLink: false,
		DisablePluginOTP: false
	} as AccountSettings);
	const [showOtpRegulationDialog, setShowOtpRegulationDialog] = useState<boolean>(false);
	const [showUnsubscribeOtpDialog, setShowUnsubscribeOtpDialog] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [userCodeConfirmed, setUserCodeConfirmed] = useState<boolean>(false);
	const [unsubscribeType, setUnsubscribeType] = useState<string>('0');

	const errorMessages = {
		401: t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.email_error_abused'),
		404: t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.error_not_match'),
		405: t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.error_tooMuchAttempts'),
		409: t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.error_expired'),
		500: t('common.ErrorOccured'),
		501: t('common.ErrorOccured')
	} as any;

	const isValidPayload = () => {
		if (accountDetails?.DefaultFromMail && accountDetails?.DefaultFromMail !== '' && !IsValidEmail(accountDetails?.DefaultFromMail)) {
			setFromEmailError(true);
			return false;
		}
		else if (accountDetails?.DefaultCellNumber && accountDetails?.DefaultCellNumber !== '' && !IsValidPhoneNumber(accountDetails?.DefaultCellNumber)) {
			setFromCellphonError(true);
			return false;
		}
		return true;
	};

	useEffect(() => {
		setAccountDetails(Settings);
	}, [Settings]);

	const handleChange = (e: any, name = '') => {
		let actualValue = e?.target?.value;
		let trimValue = e?.target?.value.trim();
		if (e?.target?.name === 'DefaultFromMail') {
			setFromEmailError(false);
		}
		if (e?.target?.name === 'DefaultCellNumber') {
			setFromCellphonError(false);
		}
		setAccountDetails({
			...accountDetails,
			[e?.target?.name]:
				trimValue.length + 1 === actualValue?.length ? actualValue : trimValue,
		} as AccountSettings);
	};

	const handleSave = () => {
		if (isValidPayload()) {
			OnUpdate(accountDetails);
		}
	};

	const handleByPassPending = async (event: any, selected: any) => {
		if (selected) {
			setShowOtpRegulationDialog(true);
		}
		else {
			await dispatch(cancelDisablePluginOTP());

			setAccountDetails({
				...accountDetails,
				DisablePluginOTP:
					false
			} as AccountSettings);
		}
	}

	const handleConfirmOtpRegulation = async (req: any) => {
		setErrorMessage('');
		setAccountDetails({ ...accountDetails, DisablePluginOTP: true } as AccountSettings);
		// @ts-ignore
		const response = await dispatch(confimrOtp({ ...req, otpRequestFor: OtpRequestFor.eDisablePendingOptIn })) as any;

		const results = response?.payload;

		switch (results?.StatusCode) {
			case 201: {
				setAccountDetails({
					...accountDetails,
					UnsubscribeType: unsubscribeType === '0' ? true : false,
				} as AccountSettings);

				setShowOtpRegulationDialog(false);
				break;
			}
			case 401: {
				logout();
				break;
			}
			case 404:
			case 406:
			case 501:
			default: {
				setErrorMessage(errorMessages[results?.StatusCode]);
				setUserCodeConfirmed(false);
				break;
			}
		}
	}

	const handleConfirmUnsubscribe = async (req: any) => {
		setErrorMessage('');
		const fullRequest = { ...req, UpdatedValue: unsubscribeType, otpRequestFor: OtpRequestFor.eUnsubscribeType }
		// @ts-ignore
		const response = await dispatch(confimrOtp(fullRequest)) as any;

		const results = response?.payload;

		switch (results?.StatusCode) {
			case 201: {
				setAccountDetails({
					...accountDetails,
					UnsubscribeType: unsubscribeType === '0' ? true : false,
				} as AccountSettings);

				setShowUnsubscribeOtpDialog(false);
				handleSave();
				break;
			}
			case 401: {
				logout();
				break;
			}
			case 404:
			case 406:
			case 501:
			default: {
				setErrorMessage(errorMessages[results?.StatusCode]);
				setUserCodeConfirmed(false);
				break;
			}
		}
	}

	return (
		<Box
			className={'settingsWrapper'}>
			<Title
				Text={t('settings.accountSettings.actDetails.title')}
				classes={classes}
				isIcon={false}
				ContainerStyle={{
					padding: `6px ${isRTL ? "14.69px" : 0} 5px ${isRTL ? 0 : "14.69px"
						}`,
				}}
			/>
			<Box className={'formContainer'}>
				{windowSize !== 'xs' && <Illustration_app_Settings className={"svg_app_settings"} />}
				<Grid container className={'form'}>
					<Grid item xs={12} sm={6} md={4} className={'textBoxWrapper'}>
						<Typography>
							<>{t('mainReport.fromName')}</>
						</Typography>
						<TextField
							variant='outlined'
							size='small'
							name='DefaultFromName'
							value={accountDetails?.DefaultFromName}
							onChange={handleChange}
							className={clsx(classes.textField, classes.minWidth252)}
						/>
					</Grid>
					<Grid item xs={12} sm={6} md={4} className={'textBoxWrapper'}>
						<Typography>
							<>{t('mainReport.fromEmail')}</>
						</Typography>
						<TextField
							variant='outlined'
							size='small'
							name='DefaultFromMail'
							value={accountDetails?.DefaultFromMail}
							onChange={handleChange}
							className={clsx(classes.textField, classes.minWidth252, fromEmailError && classes.error)}
						/>
					</Grid>
					<Grid item xs={12} sm={6} md={4} className={'textBoxWrapper'}>
						<Typography>
							<>
								{t(
									'settings.accountSettings.actDetails.fields.fromPhoneNumber'
								)}
							</>
						</Typography>
						<TextField
							variant='outlined'
							size='small'
							name='DefaultCellNumber'
							value={accountDetails?.DefaultCellNumber}
							onKeyPress={IsNumberField}
							onChange={handleChange}
							className={clsx(classes.textField, classes.minWidth252, fromCellphonError && classes.error)}
						/>
					</Grid>
					<Grid container>
						<Grid item xs={12} sm={6} md={3} className={'textBoxWrapper'}>
							<Typography>
								<>
									{t(
										'settings.accountSettings.actDetails.fields.unsubSettings'
									)}
								</>
							</Typography>
						</Grid>
						<Grid item xs={12} sm={6} md={8} className={windowSize === 'xs' ? classes.pt10 : 'textBoxWrapper'}>
							<RadioGroup
								aria-label='UnsubscribeType'
								name='UnsubscribeType'
								value={!accountDetails?.UnsubscribeType ? '0' : '1'}
								onChange={() => {
									setShowUnsubscribeOtpDialog(true);
									setUnsubscribeType(accountDetails?.UnsubscribeType ? '0' : '1')
								}}>
								<FormControlLabel
									value='0'
									control={<Radio color='primary' />}
									label={
										<>
											{t(
												'settings.accountSettings.actDetails.fields.unsubByEmailOrCell'
											)}
										</>
									}
								/>
								<FormControlLabel
									value='1'
									control={<Radio color='primary' />}
									label={
										<>
											{t(
												'settings.accountSettings.actDetails.fields.unsubByEmailAndCell'
											)}
										</>
									}
								/>
							</RadioGroup>
						</Grid>

						{/* Tier Setting */}
						<Grid item xs={12} sm={6} md={3} className={'textBoxWrapper'}>
							<Typography>
								<>
									{t(
										'settings.accountSettings.actDetails.fields.setupWhatsappTier'
									)}
								</>
							</Typography>
							<a
								href='https://business.facebook.com/settings/whatsapp-business-accounts/'
								target='_blank'
								rel='noreferrer'
								className={classes.accountSettingCheckYourTier}>
								<>{t('settings.accountSettings.actDetails.fields.checkTier')}</>
							</a>
						</Grid>
						<Grid item xs={12} sm={6} md={8} className={'textBoxWrapper'}>
							<FormControl variant='standard' className={clsx(classes.selectInputFormControl, classes.w100)}>
								<Select
									variant="standard"
									// disabled
									autoWidth
									value={selectedTier}
									name='TwoFactorAuthOptionID'
									onChange={(e: SelectChangeEvent) =>
										onTierChange(e.target.value)
									}
									IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
									MenuProps={{
										PaperProps: {
											style: {
												maxHeight: 300,
												direction: isRTL ? 'rtl' : 'ltr'
											},
										},
									}}
								>
									{tierSetting?.map((tier, index) => {
										return (
											<MenuItem
												key={index}
												value={tier.value}
											>
												{t(tier.name)}
											</MenuItem>
										);
									})}
								</Select>
							</FormControl>
						</Grid>
					</Grid>
				</Grid>
				{accountFeatures?.indexOf(PulseemFeatures.DISABLE_OPTIN_PLUGIN) > -1 && <Grid container>
					<Grid item xs={12} sm={6} md={3} className={'textBoxWrapper'}>
						<FormControlLabel
							control={
								<PulseemSwitch
									switchType={'ios'}
									isRTL={false}
									key='bypassPending'
									id="type"
									classes={classes}
									checked={!!accountDetails?.DisablePluginOTP}
									onColor="#0371ad"
									handleDiameter={20}
									boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
									activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
									height={15}
									width={40}
									className={clsx(classes.inputSwitch, { [classes.rtlSwitch]: isRTL })}
									onChange={handleByPassPending}
								/>
							}
							label={t('settings.accountSettings.bypassOtp.checkboxTitle')}
						/>
					</Grid>
				</Grid>}
				<Grid container className={'form'} style={{ maxWidth: '100%' }}>
					<Grid item xs={12} className={classes.justifyContentEnd}>
						<Button
							variant='contained'
							size='medium'
							onClick={handleSave}
							endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
							className={clsx(
								classes.mt5,
								classes.btn,
								classes.btnRounded,
								"saveFixedDetails"
							)}>
							{/* @ts-ignore */}
							{t('settings.accountSettings.actDetails.btnUpdate')}
						</Button>
					</Grid>
				</Grid>
			</Box>
			{showOtpRegulationDialog && <OTP
				classes={classes}
				onClose={() => { setShowOtpRegulationDialog(false) }}
				onConfirm={handleConfirmOtpRegulation}
				userCodeConfirmed={userCodeConfirmed}
				preText={RenderHtml(t("settings.accountSettings.bypassOtp.regulationPopup.text"))}
				responseError={errorMessage}
			/>}
			{showUnsubscribeOtpDialog && <OTP
				classes={classes}
				onClose={() => { setShowUnsubscribeOtpDialog(false) }}
				onConfirm={handleConfirmUnsubscribe}
				userCodeConfirmed={userCodeConfirmed}
				preText={RenderHtml(t("settings.accountSettings.unsubscribeOtp.popup.text"))}
				responseError={errorMessage}
			/>}
		</Box>
	);
};
export default FORM_ACCOUNT_DETAILS;
