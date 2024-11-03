import React, { useState, useEffect } from 'react';
import { Box, Divider, Button, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import DefaultScreen from '../../DefaultScreen';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import FORM_COMPANY_DETAILS from './Form_CompanyDetails';
import FORM_ACCOUNT_DETAILS from './Form_AccountDetails';
import Toast from '../../../components/Toast/Toast.component';
import {
	getAccountSettings,
	updateDetails,
	updateSettings,
} from '../../../redux/reducers/AccountSettingsSlice';
import { AccountSettings } from '../../../Models/Account/AccountSettings';
import { Loader } from '../../../components/Loader/Loader';
import { logout } from '../../../helpers/Api/PulseemReactAPI';
import VerificationDialog from '../../../components/DialogTemplates/VerificationDialog';
import {
	MdArrowBackIos,
	MdArrowForwardIos,
	MdMobileFriendly,
	MdOutlineMarkEmailRead,
	MdOutlineVerified,
} from 'react-icons/md';
import { Title } from '../../../components/managment/Title';
import { SubAccountSettings } from '../../Whatsapp/Campaign/Types/WhatsappCampaign.types';
import { updateWhatsappTier } from '../../../redux/reducers/whatsappSlice';
import { UpdateWhatsappTier } from '../../Whatsapp/management/Types/Management.types';
import { apiStatus } from '../../Whatsapp/Constant';
import { getCommonFeatures, GetGlobalAccountPackagesDetails, updateDefaultFromEmail } from '../../../redux/reducers/commonSlice';
import { ListIcon } from '../../../assets/images/managment';
import DomainsVerificationPopUp from './Popups/DomainsVerificationPopUp';
import queryString from 'query-string';
import { UpdateShowCurrencyReportCurrencyID } from '../../../redux/reducers/SubAccountSlice';

const AccountSettingsEditor = ({ classes }: any) => {
	const { t } = useTranslation();
	const dispatch = useDispatch();
	const { isRTL, windowSize } = useSelector((state: any) => state.core);
	const { showCurrencyReportCurrencyID } = useSelector((state: any) => state.common);
	const { account, ToastMessages } = useSelector((state: any) => state?.accountSettings);
	const { WhatsappTierID } = useSelector(
		(state: {
			common: { accountSettings: { SubAccountSettings: SubAccountSettings } };
		}) => state.common?.accountSettings?.SubAccountSettings
	);
	const { CoreToastMessages } = useSelector((state: any) => state?.core);
	const [toastMessage, setToastMessage] = useState(null);
	const [showLoader, setShowLoader] = useState(true);
	const [smsVerificationPopup, setSmsVerificationPopup] = useState(false);
	const [emailVerificationPopup, setEmailVerificationPopup] = useState(false);
	const [tfaEmailVerification, setTfaEmailVerification] = useState(false);
	const [tfaSmsVerification, setTfaSmsVerification] = useState(false);
	const [verificationStep, setVerificationStep] = useState(0);
	const [emailToVerify, setEmailToVerify] = useState<string>('');
	const [cellphoneToVerify, setCellphoneToVerify] = useState<string>('');
	const [settingRequest, setSettingRequest] = useState<AccountSettings>({
		LoginUserName: '',
		CompanyAdmin: false,
		CompanyName: '',
		ContactName: '',
		Email: '',
		CellPhone: '',
		Telephone: '',
		City: '',
		Address: '',
		ZipCode: null,
		BirthDate: null,
		DefaultFromMail: '',
		DefaultFromName: '',
		DefaultCellNumber: '',
		UnsubscribeType: false,
		IsSmsImmediateUnsubscribeLink: false,
		TwoFactorAuthEnabled: null,
		TwoFactorAuthOptionID: null,
		TwoFactorAuthTestMethodID: null,
		TwoFactorAuthRetries: null,
		TwoFactorAuthOverrideDateTime: null,
		ExpiryDate: null,
		DisablePluginOTP: false,
		RevenueCurrencyId: showCurrencyReportCurrencyID
	} as AccountSettings);
	const [selectedTier, setSelectedTier] = useState<string>('1');
	const [showVerificationDomains, setShowVerificationDomains] = useState<boolean>(false);

	const renderToast = () => {
		setTimeout(() => {
			setToastMessage(null);
		}, 4000);
		return <Toast data={toastMessage} />;
	};

	const getData = async () => {
		await dispatch(getAccountSettings());
		setShowLoader(false);
		const qs = window.location.search && queryString.parse(window.location.search) as any;
		setShowVerificationDomains(qs?.sdv || false);
	}
	useEffect(() => {
		getData();
	}, []);

	useEffect(() => {
		setSettingRequest({
			...settingRequest,
			...account?.Data
		});
	}, [account]);

	useEffect(() => {
		if (WhatsappTierID) {
			setSelectedTier(WhatsappTierID);
		}
	}, [WhatsappTierID]);

	useEffect(() => {
		setSettingRequest({
			...settingRequest,
			RevenueCurrencyId: showCurrencyReportCurrencyID
		});
	}, [showCurrencyReportCurrencyID]);

	const handleUpdate = async (
		updatedObject: AccountSettings,
		saveType: string,
		sendRequest: boolean
	) => {
		setSettingRequest({ ...settingRequest, ...updatedObject });

		if (sendRequest === true) {
			setShowLoader(true);
			let response = null;

			try {
				switch (saveType) {
					case 'company': {
						response = await dispatch(updateDetails(updatedObject));
						break;
					}
					case 'account':
					default: {
						response = await dispatch(updateSettings(updatedObject));
					}
				}
			}
			catch (ex) { }
			finally {
				handleResponses(response, updatedObject);
				response = await dispatch(UpdateShowCurrencyReportCurrencyID({ CurrencyID: updatedObject.RevenueCurrencyId }));
				await dispatch(GetGlobalAccountPackagesDetails());
				setShowLoader(false);
			}
		}

	}

	const handleResponses = async (response: any, updatedObject: AccountSettings) => {
		switch (response?.StatusCode || response?.payload?.StatusCode) {
			case 201: {
				setToastMessage(ToastMessages.SETTINGS_SAVED);
				dispatch(updateDefaultFromEmail(updatedObject.DefaultFromMail));
				break;
			}
			case 401: {
				logout();
				break;
			}
			case 400: {
				switch (response?.payload?.Message) {
					case 'Email': {
						setToastMessage(ToastMessages.INVALID_EMAIL);
						break;
					}
					case 'Cellphone': {
						setToastMessage(ToastMessages.INVALID_CELLPHONE);
						break;
					}
					case 'AuthCompanyEmail': {
						setEmailToVerify(updatedObject.Email);
						setVerificationStep(1);
						setToastMessage(ToastMessages.VERIFY_EMAIL);
						handleVerification('email2fa');
						break;
					}
					case 'AuthCompanyCellphone': {
						setCellphoneToVerify(updatedObject.CellPhone);
						setVerificationStep(1);
						setToastMessage(ToastMessages.VERIFY_CELLPHONE);
						handleVerification('sms2fa');
						break;
					}
					case 'AuthEmail': {
						setEmailToVerify(updatedObject.DefaultFromMail);
						setVerificationStep(1);
						setToastMessage(ToastMessages.VERIFY_EMAIL);
						handleVerification('email');
						break;
					}
					case 'AuthCellphone': {
						setCellphoneToVerify(updatedObject.DefaultCellNumber);
						setVerificationStep(1);
						setToastMessage(ToastMessages.VERIFY_CELLPHONE);
						handleVerification('cellphone');
						break;
					}
				}
				break;
			}
			case 403: {
				setToastMessage(CoreToastMessages?.XSS_ERROR);
				await dispatch(getAccountSettings());
				break;
			}
			case 200:
			case 500:
			default: {
				setToastMessage(ToastMessages?.GENERAL_ERROR);
				break;
			}
		}
	};

	const handleVerification = (type: string) => {
		switch (type) {
			case 'cellphone': {
				setSmsVerificationPopup(true);
				break;
			}
			case 'email': {
				setEmailVerificationPopup(true);
				break;
			}
			case 'email2fa': {
				setTfaEmailVerification(true);
				break;
			}
			case 'sms2fa': {
				setTfaSmsVerification(true);
				break;
			}
			default: {
				return false;
			}
		}
	}

	const onTierChange = async (tier: string) => {
		const prevSelectedTier = selectedTier;
		setSelectedTier(tier);
		let { payload }: UpdateWhatsappTier = await dispatch<any>(
			updateWhatsappTier(tier)
		);
		if (payload.Status === apiStatus.SUCCESS) {
			setToastMessage(ToastMessages?.WHATSAPP_TIER_SAVED)
			await dispatch<any>(getCommonFeatures());
		} else {
			setSelectedTier(prevSelectedTier)
			setToastMessage(ToastMessages?.WHATSAPP_TIER_NOT_SAVED)
		}
	};

	return (
		<DefaultScreen
			currentPage="settings"
			subPage="accountSettings"
			key="accountSettings"
			classes={classes}
			containerClass={clsx(classes.management, classes.mb50)}
		>
			{toastMessage && renderToast()}
			<Box className={clsx(classes.settingsContainer)}>
				<Box className={clsx("head")} style={{ display: windowSize !== 'xs' ? '' : 'block' }}>
					<Title
						classes={classes}
						ContainerStyle={{ width: '100%' }}
						isIcon={windowSize !== 'xs'}
						Element={
							<Box className={clsx(classes.flex, windowSize !== 'xs' ? classes.spaceBetween : '', classes.flexWrap)}>
								{
									windowSize === 'xs' && <ListIcon className={classes.mr15} />
								}
								<Typography
									style={{ width: 'auto' }}
									className={clsx(classes.managementTitle, "mgmtTitle")}
								>
									{t("settings.accountSettings.title")}
								</Typography>
								<div>
									<Button
										className={clsx(
											classes.btn,
											classes.btnRounded,
											classes.mr10,
											{
												[classes.dFlex]: windowSize === 'xs',
												[classes.mt10]: windowSize === 'xs',
												[classes.f12]: windowSize === 'xs',
											}
										)}
										onClick={() =>
											handleVerification('cellphone')
										}
										startIcon={<MdMobileFriendly className={clsx(classes.p5, windowSize === 'xs' ? classes.f16 : '')} />}
										endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
									>
										{t("settings.accountSettings.fixedComDetails.btnVerifyNumber")}
									</Button>
									<Button
										className={clsx(
											classes.btn,
											classes.btnRounded,
											classes.mr10,
											{
												[classes.dFlex]: windowSize === 'xs',
												[classes.mt10]: windowSize === 'xs',
												[classes.f12]: windowSize === 'xs',
											}
										)}
										onClick={() =>
											handleVerification('email')
										}
										startIcon={<MdOutlineMarkEmailRead className={clsx(classes.p5, windowSize === 'xs' ? classes.f16 : '')} />}
										endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
									>
										<>
											{t(
												"settings.accountSettings.fixedComDetails.btnVerifyEmail"
											)}
										</>
									</Button>
									<Button
										className={clsx(
											classes.btn,
											classes.btnRounded,
											classes.mr10,
											{
												[classes.dFlex]: windowSize === 'xs',
												[classes.mt10]: windowSize === 'xs',
												[classes.f12]: windowSize === 'xs',
											}
										)}
										startIcon={<MdOutlineVerified className={clsx(classes.p5, windowSize === 'xs' ? classes.f16 : '')} />}
										endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
										onClick={() => setShowVerificationDomains(!showVerificationDomains)}
									>
										<>
											{t('common.domainVerification.settingPopUp.title')}
										</>
									</Button>
								</div>
							</Box>
						}
					/>
				</Box>
				<Divider />
				<Box className={clsx("containerBody", classes.pt20)}>
					<FORM_COMPANY_DETAILS
						classes={classes}
						setToastMessage={setToastMessage}
						ToastMessages={ToastMessages}
						Settings={{ ...settingRequest as AccountSettings }}
						OnUpdate={(updatedObject: AccountSettings, sendRequest: boolean) => handleUpdate(updatedObject, 'company', sendRequest)}
						onShowTwoFactorAuth={(variant: string) => {
							if (variant === 'smsTFA') {
								setTfaSmsVerification(true);
							}
							else {
								setTfaEmailVerification(true);
							}
						}}
					/>
					<FORM_ACCOUNT_DETAILS
						classes={classes}
						setToastMessage={setToastMessage}
						ToastMessages={ToastMessages}
						Settings={{ ...settingRequest as AccountSettings }}
						OnUpdate={(updatedObject: AccountSettings) => handleUpdate(updatedObject, 'account', true)}
						selectedTier={selectedTier}
						onTierChange={onTierChange}
					/>
				</Box>
			</Box>
			{showVerificationDomains && <DomainsVerificationPopUp
				classes={classes} isOpen={showVerificationDomains}
				onClose={() => setShowVerificationDomains(false)}
				onConfirm={() => setShowVerificationDomains(false)}
			/>}
			{tfaEmailVerification && <VerificationDialog
				variant="emailTFA"
				textButtonOnSuccess={t('common.close')}
				classes={classes}
				isOpen={tfaEmailVerification}
				step={verificationStep}
				value={verificationStep > 0 && emailToVerify}
				onClose={() => {
					setTfaEmailVerification(false);
					setVerificationStep(0);
				}}
			/>}
			{emailVerificationPopup && <VerificationDialog
				textButtonOnSuccess={t('common.close')}
				classes={classes}
				variant="email"
				isOpen={emailVerificationPopup}
				step={verificationStep}
				value={verificationStep > 0 && emailToVerify}
				onClose={() => {
					setEmailVerificationPopup(false);
					setVerificationStep(0);
				}} />}
			{tfaSmsVerification && <VerificationDialog
				variant="smsTFA"
				textButtonOnSuccess={t('common.close')}
				classes={classes}
				isOpen={tfaSmsVerification}
				step={verificationStep}
				value={verificationStep > 0 && cellphoneToVerify}
				onClose={() => {
					setTfaSmsVerification(false);
					setVerificationStep(0);
				}}
			/>}
			{smsVerificationPopup && <VerificationDialog
				textButtonOnSuccess={t('common.close')}
				classes={classes}
				variant="sms"
				step={verificationStep}
				value={verificationStep > 0 && cellphoneToVerify}
				isOpen={smsVerificationPopup}
				onClose={() => {
					setSmsVerificationPopup(false);
					setVerificationStep(0);
				}} />}
			<Loader isOpen={showLoader} showBackdrop={true} />
		</DefaultScreen>
	);
};

export default AccountSettingsEditor;
