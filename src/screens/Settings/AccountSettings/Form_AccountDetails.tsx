import React, { useState, useEffect } from 'react';
import {
	Box,
	Button,
	Checkbox,
	FormControl,
	FormControlLabel,
	Grid,
	InputAdornment,
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
import { IsNumberField } from '../../../helpers/Utils/Validations';
import { AccountSettings } from '../../../Models/Account/AccountSettings';
import { tierSetting } from '../../Whatsapp/Constant';
import Illustration_app_Settings from '../../../assets/images/settings/Illustration_app_Settings';
import { IoIosArrowDown } from 'react-icons/io';
import PulseemSwitch from '../../../components/Controlls/PulseemSwitch';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import { RenderHtml } from '../../../helpers/Utils/HtmlUtils';
import { Visibility, VisibilityOff } from '@material-ui/icons';
import moment from 'moment';
import { setBypassPending } from '../../../redux/reducers/AccountSettingsSlice';
import { logout } from '../../../helpers/Api/PulseemReactAPI';
import DisableOtpPopup from './Popups/DisableOtpPopup';

const FORM_ACCOUNT_DETAILS = ({
	classes,
	setToastMessage,
	ToastMessages,
	Settings,
	OnUpdate,
	selectedTier,
	onTierChange = () => { },
}: AccDtlPropTypes) => {
	const dispatch = useDispatch();
	const { t } = useTranslation();
	const { isRTL, windowSize } = useSelector((state: any) => state.core);

	const [accountDetails, setAccountDetails] = useState<AccountSettings | null>({
		DefaultFromMail: '',
		DefaultFromName: '',
		DefaultCellNumber: '',
		UnsubscribeType: false,
		IsSmsImmediateUnsubscribeLink: false,
		ByPassOTPAgreement: false
	} as AccountSettings);
	const [showOtpRegulationDialog, setShowOtpRegulationDialog] = useState<boolean>(false);
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [password, setPassword] = useState<string>('');

	const isValidPayload = () => {
		if (!accountDetails?.DefaultFromMail) {
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

	const handleByPassPending = (event: any, selected: any) => {
		if (selected) {
			setShowOtpRegulationDialog(true);
		}
		else {
			setAccountDetails({
				...accountDetails,
				ByPassOTPAgreement:
					selected
			} as AccountSettings);
		}
	}

	const handleConfirmOtpRegulation = async () => {
		const request = { ByPassOTPAgreement: true, password, ByPassOTPAgreementDate: moment() } as any
		const response = await dispatch(setBypassPending(request)) as any;

		switch (response?.payload?.StatusCode) {
			case 401: {
				logout();
				break;
			}
			case 403: {
				alert(response?.payload?.Message)
				break;
			}
			case 406: {
				alert(response?.payload?.Message)
				break;
			}
			case 201:
			default: {
				// show results
				setAccountDetails({ ...accountDetails, ByPassOTPAgreement: true } as AccountSettings);
				setShowOtpRegulationDialog(false)
				break;
			}
		}
	}

	const otpRegulationDialog = () => {
		return <BaseDialog
			// icon={<MdCelebration />}
			title={t('settings.accountSettings.bypassOtp.regulationPopup.title')}
			children={<>
				{RenderHtml(t("settings.accountSettings.bypassOtp.regulationPopup.text"))}
				<Typography className={clsx(classes.font18, classes.mt15)}>
					{t("settings.accountSettings.bypassOtp.regulationPopup.reEnterPassword")}
				</Typography>

				<Grid container className={classes.mt15}>
					<Grid item md={6} xs={12}>
						<TextField
							type={showPassword ? "text" : "password"}
							id="outlined-basic"
							name="OldPassword"

							variant="outlined"
							value={password}
							className={clsx(
								classes.textField,
								classes.minWidth252
								// password === "" ? classes.textFieldError : null
							)}
							inputProps={{ autocomplete: "password" }}
							placeholder={t('settings.accountSettings.bypassOtp.regulationPopup.typePassword')}
							onChange={(event: any) => {
								setPassword(event.target.value.trim());
							}}
							// helperText={t('common.requiredField')}
							InputProps={{
								endAdornment: (
									<Button
										onClick={() => setShowPassword(!showPassword)}
										style={{
											width: 25,
											padding: 5,
											minWidth: 10,
											marginRight: 5
										}}
									>
										{" "}
										{showPassword ? (
											<VisibilityOff style={{ fontSize: 15 }} />
										) : (
											<Visibility style={{ fontSize: 15 }} />
										)}
									</Button>
								),
							}}
						/>
					</Grid>
				</Grid>
				<Typography className={clsx(classes.font16, classes.mt5)}>
					{t("settings.accountSettings.bypassOtp.regulationPopup.acceptAgreement")}
				</Typography>
			</>
			}
			open={showOtpRegulationDialog}
			classes={classes}
			confirmText={t("common.Ok")}
			disableBackdropClick={true}
			onCancel={() => setShowOtpRegulationDialog(false)}
			onClose={() => setShowOtpRegulationDialog(false)}
			onConfirm={() => {
				handleConfirmOtpRegulation();
			}}
			showDefaultButtons={true}
		/>
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
							className={clsx(classes.textField, classes.minWidth252)}
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
							className={clsx(classes.textField, classes.minWidth252)}
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
									setAccountDetails({
										...accountDetails,
										UnsubscribeType:
											accountDetails?.UnsubscribeType === false ? true : false,
									} as AccountSettings);
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
				<Grid container>
					<Grid item xs={12} sm={6} md={3} className={'textBoxWrapper'}>
						<FormControlLabel
							control={
								<PulseemSwitch
									switchType={'ios'}
									isRTL={false}
									key='bypassPending'
									id="type"
									classes={classes}
									checked={!!accountDetails?.ByPassOTPAgreement}
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
				</Grid>
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
			{showOtpRegulationDialog && <DisableOtpPopup
				classes={classes}
				onClose={() => { setShowOtpRegulationDialog(false) }}
				onConfirm={handleConfirmOtpRegulation}
			/>}
			{/* {otpRegulationDialog()} */}
		</Box>
	);
};
export default FORM_ACCOUNT_DETAILS;
