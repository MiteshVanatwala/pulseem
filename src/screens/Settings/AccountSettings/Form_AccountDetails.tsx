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
import { IsEnglishAndNumbers, IsNumberField, IsValidEmail, IsValidPhoneNumber } from '../../../helpers/Utils/Validations';
import { AccountSettings } from '../../../Models/Account/AccountSettings';
import { tierSetting } from '../../Whatsapp/Constant';
import Illustration_app_Settings from '../../../assets/images/settings/Illustration_app_Settings';
import { IoIosArrowDown } from 'react-icons/io';
import PulseemSwitch from '../../../components/Controlls/PulseemSwitch';
import { cancelDisablePluginOTP, confimrOtp, setAuditLog } from '../../../redux/reducers/AccountSettingsSlice';
import { PulseemFeatures } from '../../../model/PulseemFields/Fields';
import OTP from '../../../components/OneTimePassword/OTP';
import { logout } from '../../../helpers/Api/PulseemReactAPI';
import { OtpRequestFor } from '../../../Models/Authorization/AuthorizationModels';
import { RenderHtml } from '../../../helpers/Utils/HtmlUtils';
import { AuditLog, eAuditActionType } from '../../../Models/AuditLog/AuditLog';

const FORM_ACCOUNT_DETAILS = ({
	classes,
	Settings,
	OnUpdate,
	selectedTier,
	onTierChange = () => { },
}: AccDtlPropTypes) => {
	console.log(Settings);
	const dispatch = useDispatch();
	const { t } = useTranslation();
	const { isRTL, windowSize } = useSelector((state: any) => state.core);
	const { accountFeatures, accountSettings } = useSelector((state: any) => state.common);
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
	const FROM_NUMBER_MAX_LETTERS = 11;
	const FROM_NUMBER_MAX_NUMBERS = 13;

	const errorMessages = {
		401: t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.email_error_abused'),
		404: t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.error_not_match'),
		405: t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.error_tooMuchAttempts'),
		409: t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.error_expired'),
		500: t('common.ErrorOccured'),
		501: t('common.ErrorOccured')
	} as any;

	const isValidPayload = () => {
		if (accountDetails?.DefaultFromMail && accountDetails?.DefaultFromMail !== '' && (accountSettings?.AllowEnglishInFromNumber && !IsValidEmail(accountDetails?.DefaultFromMail))) {
			setFromEmailError(true);
			return false;
		}
		else if (accountDetails?.DefaultCellNumber && accountDetails?.DefaultCellNumber !== '' && (!accountSettings?.AllowEnglishInFromNumber && !IsValidPhoneNumber(accountDetails?.DefaultCellNumber))) {
			setFromCellphonError(true);
			return false;
		}
		return true;
	};

	useEffect(() => {
		setUnsubscribeType(Settings?.UnsubscribeType ? '1' : '0');
		setAccountDetails(Settings);
	}, [Settings]);

	const handleChange = (e: any, name = '') => {
		let actualValue = e?.target?.value;

		if (e?.target?.name === 'DefaultFromMail') {
			setFromEmailError(false);
		}
		if (e?.target?.name === 'DefaultCellNumber') {
			var onlyNumbersWithHyphenAndSpace = /^[0-9 -]*$/;
			var onlyNumbers = /^[0-9]*$/;
			var english = /^[A-Za-z0-9_ -]*$/

			if (!actualValue.match(onlyNumbersWithHyphenAndSpace) && actualValue.match(english) && actualValue.length >= FROM_NUMBER_MAX_LETTERS) {
				actualValue = actualValue.substring(0, FROM_NUMBER_MAX_LETTERS);
			}
			if (actualValue.match(onlyNumbersWithHyphenAndSpace) && actualValue.length >= FROM_NUMBER_MAX_NUMBERS) {
				actualValue = actualValue.substring(0, FROM_NUMBER_MAX_NUMBERS);
			}

			if (actualValue.match(onlyNumbersWithHyphenAndSpace) && !actualValue.match(onlyNumbers)) {
				actualValue = e.target.value.replace(/[^0-9]/g, '');
			} else if (!actualValue.match(english)) {
				actualValue = actualValue.replace(/[^A-Za-z0-9_ -]/g, '');
			}

			setFromCellphonError(false);
		}
		setAccountDetails({
			...accountDetails,
			[e?.target?.name]: actualValue.trim()
		} as AccountSettings);
		OnUpdate({
			...accountDetails,
			[e?.target?.name]: actualValue.trim()
		} as AccountSettings, 'account', false);
	};

	const handleSave = (overwriteDetails: AccountSettings | null | never) => {
		if (isValidPayload()) {
			if (overwriteDetails !== null) {
				OnUpdate(overwriteDetails);
			}
			else {
				OnUpdate(accountDetails);
			}
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
		setErrorMessage('')
		if (!req?.Code || req?.Code === '') {
			setErrorMessage(t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.error2'));
			return false;
		}
		// @ts-ignore
		const response = await dispatch(confimrOtp({ ...req, otpRequestFor: OtpRequestFor.eDisablePendingOptIn })) as any;

		const results = response?.payload;

		if (results?.StatusCode === 201) {
			setErrorMessage('');
			setAccountDetails({ ...accountDetails, DisablePluginOTP: true } as AccountSettings);
			setShowOtpRegulationDialog(false);
			dispatch(setAuditLog({
				ActionName: 'DisablePendingFeature',
				AuditActionType: eAuditActionType.Enable,
				RequestSourceValue: '',
				ResponseValue: '',
				RequestValue: ''
			} as AuditLog))
		}
		else {
			handleErrorOTPResponse(results?.StatusCode);
		}
	}

	const handleConfirmUnsubscribe = async (req: any) => {
		setErrorMessage('')
		if (!req?.Code || req?.Code === '') {
			setErrorMessage(t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.error2'));
			return false;
		}
		setUnsubscribeType('0')
		setErrorMessage('');
		const fullRequest = { ...req, UpdatedValue: '0', otpRequestFor: OtpRequestFor.eUnsubscribeType }
		// @ts-ignore
		const response = await dispatch(confimrOtp(fullRequest)) as any;

		const results = response?.payload;

		if (results?.StatusCode === 201) {
			setShowUnsubscribeOtpDialog(false);
			handleSave({
				...accountDetails,
				UnsubscribeType: false
			} as AccountSettings);

			dispatch(setAuditLog({
				ActionName: 'UnsubscribeByEmailOrSms',
				AuditActionType: eAuditActionType.Update,
				RequestSourceValue: '',
				ResponseValue: '',
				RequestValue: ''
			} as AuditLog))
		}
		else {
			handleErrorOTPResponse(results?.StatusCode);
		}
	}

	const handleErrorOTPResponse = (statusCode: number) => {
		switch (statusCode) {
			case 401: {
				logout();
				break;
			}
			case 404:
			case 406:
			case 501:
			default: {
				setErrorMessage(errorMessages[statusCode]);
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
							onKeyDown={(event: any) => {
								if (!accountSettings?.AllowEnglishInFromNumber) {
									IsNumberField(event);
								}
								else if (accountSettings?.AllowEnglishInFromNumber) {
									const newValue = event.target.value + event.key;
									if (!IsEnglishAndNumbers(newValue) &&
										!['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(event.key)) {
										event.preventDefault();
									}
								}
							}}
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
								value={unsubscribeType}
								onChange={(e: any) => {
									if (e?.target?.value === '0') {
										setShowUnsubscribeOtpDialog(true);
									}
									else {
										const updatedAccountDetails = {
											...accountDetails,
											UnsubscribeType: true
										} as AccountSettings;

										setUnsubscribeType('1');
										setAccountDetails(updatedAccountDetails);
										OnUpdate(updatedAccountDetails);
										//@ts-ignore
										dispatch(setAuditLog({
											ActionName: 'UnsubscribeByEmailAndSms',
											AuditActionType: eAuditActionType.Update,
											RequestSourceValue: '',
											ResponseValue: '',
											RequestValue: ''
										} as AuditLog));
										handleSave(updatedAccountDetails);
									}
								}}>
								<FormControlLabel
									value='0'
									control={<Radio color='primary' value={'0'} />}
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
									control={<Radio color='primary' value={'1'} />}
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
						{/* <Grid item xs={12} sm={6} md={3} className={'textBoxWrapper'}>
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
						</Grid> */}
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
							onClick={() => handleSave(null)}
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
				onClose={() => { setShowOtpRegulationDialog(false); setErrorMessage('') }}
				onConfirm={handleConfirmOtpRegulation}
				userCodeConfirmed={userCodeConfirmed}
				preText={RenderHtml(t("settings.accountSettings.bypassOtp.regulationPopup.text"))}
				responseError={errorMessage}
				actionName='DisablePendingFeature'
			/>}
			{showUnsubscribeOtpDialog && <OTP
				classes={classes}
				onClose={() => { setShowUnsubscribeOtpDialog(false); setErrorMessage('') }}
				onConfirm={handleConfirmUnsubscribe}
				userCodeConfirmed={userCodeConfirmed}
				preText={RenderHtml(t("settings.accountSettings.unsubscribeOtp.popup.text"))}
				responseError={errorMessage}
				actionName='UnsubscribeSettings'
			/>}
		</Box>
	);
};
export default FORM_ACCOUNT_DETAILS;
