import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Box, Button, Divider, FormControlLabel, Grid, TextField, Tooltip, Typography, Zoom } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { Loader } from '../../components/Loader/Loader';
import { logout } from '../../helpers/Api/PulseemReactAPI';
import Toast from '../../components/Toast/Toast.component';
import { coreProps } from '../../model/Core/corePros.types';
import PulseemSwitch from '../../components/Controlls/PulseemSwitch';
import { RenderHtml, useStylesBootstrapPasswordHint } from '../../helpers/Utils/HtmlUtils';
import PasswordHint from '../Settings/AccountSettings/Password/PasswordHint';
import { ValidPassword } from '../Settings/AccountSettings/Password/Types';
import { lowerCaseLetters, numbers, DecimalWithMinusRegEx, specialLetters, upperCaseLetters, NumberWithMinusRegEx } from '../../helpers/Constants';
import Groups from '../../components/Groups/GroupsHandler/Groups';
import { getGroupsBySubAccountId } from '../../redux/reducers/groupSlice';
import { BaseDialog } from '../../components/DialogTemplates/BaseDialog';
import { ValidateEmailAddress } from '../../helpers/Utils/common';
import { get, map } from 'lodash';
import { AddEditSubAccounts, GetGroupsAccountSubUsers } from '../../redux/reducers/SubAccountSlice';
import { Group } from '../../Models/Groups/Group';
import { CommonRedux } from '../Whatsapp/Editor/Types/WhatsappCreator.types';
import { IsValidNonGlobalPhoneNumber, IsValidPhoneNumberKeyPress, IsValidPhoneNumberWithCountryCode } from '../../helpers/Utils/Validations';
import { getTestGroups } from '../../redux/reducers/smsSlice';
import { GetGlobalAccountPackagesDetails } from '../../redux/reducers/commonSlice';
import { Stack } from '@mui/material';
import { findPlanByFeatureCode } from '../../redux/reducers/TiersSlice';
import TierPlans from '../../components/TierPlans/TierPlans';

const SaveSubAccount = ({ classes, isOpen = false, onClose, subAccountRecord = {}, mainAccountBalance = {} }: any) => {
	const dispatch: any = useDispatch();
	const { t } = useTranslation();
	const { windowSize, isRTL } = useSelector(
		(state: { core: coreProps }) => state.core
	);
	const { isGlobal, countryCodeList, accountCurrencySymbol, accountIsCurrencySymbolPrefix, IsPoland } = useSelector((state: { common: CommonRedux }) => state.common);
	const { subAccountAllGroups } = useSelector((state: any) => state.group);
	const { testGroups } = useSelector((state: any) => state.sms);
	const { currentPlan, availablePlans } = useSelector((state: any) => state.tiers);
	const [ selectedGroups, setSelectedGroups ] = useState<any>([]);
	const [ showTestGroups, setShowTestGroups ] = useState(false);
	const [ allGroupsSelected, setAllGroupsSelected ] = useState(false);
	const [ isLoader, setIsLoader ] = useState<boolean>(false);
	const [ toastMessage, setToastMessage ] = useState(null);
	const [showTierPlans, setShowTierPlans] = useState(false);
	const [ dialogType, setDialogType ] = useState<{
		type: string;
	} | null>({
		type: ''
	});
	const [TierMessageCode, setTierMessageCode] = useState<string>('');
	const [ errors, setErrors ] = useState({
		subAccountName: '',
		cellPhone: '',
		emailAddress: '',
		loginUserName: '',
		password: '',
		confirmPassword: '',
		addBalance: '',
		SMSBulkAmount: '',
		emailBulkAmount: '',
	});
	const [ showPasswordTip, setShowPasswordTip ] = useState<boolean>(false);
	const [ passwordValidation, setPasswordValidation ] = useState<ValidPassword>({
    LowerChar: false,
    SpecialChar: false,
    UpperChar: false,
    PasswordLength: 0,
    NumberChar: false,
  } as ValidPassword);
	const [ subAccountDetails, setSubAccountDetails ] = useState<any>({
		emailBulk: '',
		SMSBulk: '',
		MMSBulk: '',
		subAccountName: '',
		cellPhone: '',
		accountManager: '',
		addEmailBulk: false,
		addSMSBulk: false,
		addMMSBulk: false,
		emailBulkAmount: '',
		SMSBulkAmount: '',
		MMSBulkAmount: '',
		emailAddress: '',
		loginUserName: '',
		password: '',
		confirmPassword: '',
		isPasswordVisible: false,
		// automaticUserLock: null,
		balance: 0,
		addBalance: '',
	})
	const CustomGuidEnc = get(subAccountRecord, 'CustomGuidEnc', '');

	useEffect(() => {
		if (subAccountAllGroups.length === 0) {
			dispatch(getGroupsBySubAccountId());
		}
		if (testGroups?.length === 0) {
      dispatch(getTestGroups());
    }
	}, []);
	
	useEffect(() => {
		if (isOpen && CustomGuidEnc !== '') {
			setSubAccountDetails({
				...subAccountDetails,
				emailBulk: get(subAccountRecord, 'BulkEmail', 0),
				SMSBulk: get(subAccountRecord, 'BulkSMS', 0),
				MMSBulk: get(subAccountRecord, 'BulkMMS', 0),
				subAccountName: get(subAccountRecord, 'SubAccountName', ''),
				cellPhone: get(subAccountRecord, 'CellPhone', ''),
				accountManager: get(subAccountRecord, 'SubAccountManager', ''),
				addEmailBulk: false,
				addSMSBulk: false,
				addMMSBulk: false,
				emailBulkAmount: '',
				SMSBulkAmount: '',
				MMSBulkAmount: '',
				emailAddress: get(subAccountRecord, 'Email', ''),
				loginUserName: get(subAccountRecord, 'LoginUserName', ''),
				password: '',
				confirmPassword: '',
				isPasswordVisible: false,
				// automaticUserLock: get(subAccountRecord, 'ExpiryDate', null),
				balance: get(subAccountRecord, 'FinalGlobalBalance', 0),
				addBalance: 0,
			})

			setErrors({
				subAccountName: '',
				cellPhone: '',
				emailAddress: '',
				loginUserName: '',
				password: '',
				confirmPassword: '',
				addBalance: '',
				SMSBulkAmount: '',
				emailBulkAmount: '',
			});

			// getGroupList();
		}

		if (!isOpen) {
			setSubAccountDetails({
				...subAccountDetails,
				emailBulk: 0,
				SMSBulk: 0,
				MMSBulk: 0,
				subAccountName: '',
				cellPhone: '',
				accountManager: '',
				addEmailBulk: false,
				addSMSBulk: false,
				addMMSBulk: false,
				emailBulkAmount: '',
				SMSBulkAmount: '',
				MMSBulkAmount: '',
				emailAddress: '',
				loginUserName: '',
				password: '',
				confirmPassword: '',
				isPasswordVisible: false,
				// automaticUserLock: null,
				balance: '',
				addBalance: 0,
			})

			setSelectedGroups([]);
			setAllGroupsSelected(false);
		}
	}, [ isOpen ]);

	const getGroupList = async () => {
		const groupList = await dispatch(GetGroupsAccountSubUsers(CustomGuidEnc));
		if (groupList?.payload?.Data.length > 0 && groupList?.payload?.StatusCode === 1) {
			setSelectedGroups(groupList?.payload?.Data)
		}
	}

	const validateForm = () => {
		let errorsTemp = JSON.parse(JSON.stringify(errors))
		errorsTemp = {
			subAccountName: subAccountDetails.subAccountName.trim() === '' ? t('common.requiredField') : '',
			cellPhone: (isGlobal ? !IsValidPhoneNumberWithCountryCode(subAccountDetails.cellPhone.trim(), countryCodeList ) : !IsValidNonGlobalPhoneNumber(subAccountDetails.cellPhone.trim())) ? t('recipient.errors.cellPhone') : '',
			emailAddress: subAccountDetails.emailAddress.trim() === '' ? t('common.requiredField') : '',
			loginUserName: subAccountDetails.loginUserName.trim() === '' ? t('common.requiredField') : '',
			password: '',
			confirmPassword: (CustomGuidEnc === '' || subAccountDetails.confirmPassword.trim() !== '') && subAccountDetails.confirmPassword.trim() === '' ? t('common.requiredField') : '',
			emailBulkAmount: !DecimalWithMinusRegEx.test(subAccountDetails.emailBulkAmount) ? t('mainReport.invalidNo') : '',
			SMSBulkAmount: !DecimalWithMinusRegEx.test(subAccountDetails.SMSBulkAmount) ? t('mainReport.invalidNo') : '',
			addBalance: !DecimalWithMinusRegEx.test(subAccountDetails.addBalance) ? t('mainReport.invalidNo') : '',
		};

		if ((!isGlobal || IsPoland) && subAccountDetails.addEmailBulk === true && errorsTemp.emailBulkAmount === '' && subAccountDetails.emailBulkAmount !== '') {
			errorsTemp.emailBulkAmount = Number(subAccountDetails.emailBulkAmount) > Number(get(mainAccountBalance, 'EmailBalance', 0)) ? t('SubAccount.notEnoughEmailCreditInParentAccount') : '';
		}

		if ((!isGlobal || IsPoland) && subAccountDetails.addSMSBulk === true && errorsTemp.SMSBulkAmount === '' && subAccountDetails.SMSBulkAmount) {
			errorsTemp.SMSBulkAmount = Number(subAccountDetails.SMSBulkAmount) > Number(get(mainAccountBalance, 'SMSBalance', 0)) ? t('SubAccount.notEnoughSMSCreditInParentAccount') : '';
		}

		if (isGlobal && !IsPoland && errorsTemp.addBalance === '' && subAccountDetails.addBalance) {
			errorsTemp.addBalance = Number(subAccountDetails.addBalance) > Number(get(mainAccountBalance, 'GlobalBalance', 0)) ? t('SubAccount.notEnoughGlobalBalance') : '';
		}

		if ((CustomGuidEnc === '' || subAccountDetails.password.trim() !== '') && (!passwordValidation.LowerChar || !passwordValidation.NumberChar || !passwordValidation.PasswordLength || !passwordValidation.SpecialChar || !passwordValidation.UpperChar)) {
      errorsTemp.password = t('SignUp.InvalidPassword');
    } else if (CustomGuidEnc === '' && subAccountDetails.password.trim() === '') {
      errorsTemp.password = t('SignUp.PasswordRequired');
    }

		if ((CustomGuidEnc === '' || subAccountDetails.password !== '' || subAccountDetails.confirmPassword !== '') && subAccountDetails.password !== subAccountDetails.confirmPassword) {
			errorsTemp = {
				...errorsTemp,
				confirmPassword: t('common.confirmPasswordNotMatch')
			}
		}

		if (!ValidateEmailAddress(subAccountDetails.emailAddress)) {
			errorsTemp = {
				...errorsTemp,
				emailAddress: t('common.invalidEmail')
			}
		}

		setErrors(errorsTemp);
		return errorsTemp.subAccountName === '' && errorsTemp.cellPhone === '' && errorsTemp.emailAddress === '' && errorsTemp.loginUserName === '' && errorsTemp.password === '' && errorsTemp.confirmPassword === '' && errorsTemp.emailBulkAmount === ''  && errorsTemp.SMSBulkAmount === ''  && errorsTemp.addBalance === '' ;
	}

	const saveSubAccountDetils = async () => {
		if (validateForm()) {
			setIsLoader(true);
			//@ts-ignore
			const response = await dispatch(AddEditSubAccounts({
				CustomGuidEnc,
				SubAccountName: subAccountDetails.subAccountName,
				// ExpiryDate: subAccountDetails.automaticUserLock,
				CellPhone: subAccountDetails.cellPhone,
				AccountManager: subAccountDetails.accountManager,
				AddEmailBulkAmount: (!isGlobal || IsPoland) && subAccountDetails.addEmailBulk ? subAccountDetails.emailBulkAmount : 0,
				AddSmsBulkAmount: (!isGlobal || IsPoland) && subAccountDetails.addSMSBulk ? subAccountDetails.SMSBulkAmount : 0,
				AddMmsBulkAmount: 0,
				FinalGlobalBalance: isGlobal && !IsPoland ? subAccountDetails.addBalance : 0,
				Email: subAccountDetails.emailAddress,
				LoginUserName: CustomGuidEnc ? get(subAccountRecord, 'LoginUserName', '') : subAccountDetails.loginUserName,
				Password: subAccountDetails.password,
				groupIds: map(selectedGroups, 'GroupID')
			}));
			handleSaveResponse(response?.payload?.StatusCode);
			setIsLoader(false);
			return true;
		}
	}

	const showErrorToast = (message: string) => setToastMessage({ severity: 'error', color: 'error', message, showAnimtionCheck: false } as any)

	const handleSaveResponse = (statusCode: number) => {
		switch (statusCode) {
			case 0: {
				showErrorToast(t('SubAccount.subAccountNotFound'));
				break;
			}
			case 1: {
				setToastMessage({ severity: 'success', color: 'success', message: t('SubAccount.subAccountSaved'), showAnimtionCheck: false } as any)
				if (isGlobal) dispatch(GetGlobalAccountPackagesDetails());
				setTimeout(() => {
					onClose(true);
				}, 2000);
				break;
			}
			case 2: {
				showErrorToast(t('common.invalidEmail'));
				break;
			}
			case 3: {
				showErrorToast(t('SubAccount.invalidLoginName'));
				break;
			}
			case 4: {
				showErrorToast(t('SubAccount.invalidPhoneNumber'));
				break;
			}
			case 7: {
				showErrorToast(t('SubAccount.userCreationFailed'));
				break;
			}
			case 400: {
				showErrorToast(t('common.Error'));
				break;
			}
			case 401: {
				logout();
				break;
			}
			case 402: {
				showErrorToast(t('common.Error'));
				break;
			}
			case 404: {
				showErrorToast(t('common.Error'));
				break;
			}
			case 405: {
				showErrorToast(t('landingPages.shortUrlExist'));
				break;
			}
			case 927: {
				setTierMessageCode('SUBACCOUNTS');
				setDialogType({ type: 'tier' });
				break;
			}
			case 1000: {
				showErrorToast(t('SubAccount.notAllowed'));
				break;
			}
			case 1001: {
				showErrorToast(t('SubAccount.notEnoughGlobalBalance'));
				break;
			}
			case 1002: {
				showErrorToast(t('SubAccount.notEnoughEmailCreditInParentAccount'));
				break;
			}
			case 1003: {
				showErrorToast(t('SubAccount.notEnoughSMSCreditInParentAccount'));
				break;
			}
			case 1004: {
				showErrorToast(t('SubAccount.notEnoughMMSCreditInParentAccount'));
				break;
			}
			case 100:
			case 500:
			default: {
				setDialogType({ type: 'internalError'});
				break;
			}
		}
	}

	const displayInternalErrorPopup = () => ({
		title: t('common.ErrorTitle'),
		showDivider: false,
    showDefaultButtons: false,
		content: (
			<Typography style={{ fontSize: 18 }} className={clsx(classes.textCenter)}>
				{RenderHtml(t('SubAccount.emailUserNameExist'))}
			</Typography>
		),
    onClose: () => setDialogType(null)
	})

	const handleGetPlanForFeature = (tierMessageCode: string) => {
		const planName = findPlanByFeatureCode(
			tierMessageCode,
			availablePlans,
			currentPlan.Id
		);
		
		if (planName) {
			return t('billing.tier.featureNotAvailable').replace('{feature}', tierMessageCode).replace('{planName}', planName);
		} else {
			return t('billing.tier.noFeatureAvailable');
		}
	};

	const getTierValidationDialog = () => ({
		title: t('billing.tier.permission'),
		showDivider: false,
		content: (
			<Typography style={{ fontSize: 18 }} className={clsx(classes.textCenter)}>
				{handleGetPlanForFeature(TierMessageCode)}
			</Typography>
		),
		renderButtons: () => (
			<Grid
				container
				spacing={2}
				className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null)}
			>
				<Grid item>
					<Button
						onClick={() => {
						setDialogType(null);
						setShowTierPlans(true);
					}}
					className={clsx(classes.btn, classes.btnRounded)}
					>
						{t('billing.upgradePlan')}
					</Button>
				</Grid>
				<Grid item>
					<Button
						onClick={() => setDialogType(null)}
						className={clsx(classes.btn, classes.btnRounded)}
					>
						{t('common.cancel')}
					</Button>
				</Grid>
			</Grid>
		)
	})

	const renderDialog = () => {
		const { type } = dialogType || {}
		let currentDialog: any = {};
		if (type === 'internalError') {
			currentDialog = displayInternalErrorPopup();
		} else if (type === 'tier') {
			currentDialog = getTierValidationDialog();
		}

		if (type) {
			return (
				dialogType && <BaseDialog
          contentStyle={classes.maxWidth540}
					classes={classes}
					open={dialogType}
					onCancel={() => setDialogType(null)}
					onClose={() => setDialogType(null)}
					renderButtons={currentDialog?.renderButtons || null}
					{...currentDialog}>
					{currentDialog?.content}
				</BaseDialog>
			)
		}
	}

	const renderToast = () => {
		setTimeout(() => {
			setToastMessage(null);
		}, 2000);
		return <Toast customData={null} data={toastMessage} />;
	};

	const handleChange = (e: any) => {
    setSubAccountDetails({
      ...subAccountDetails,
      password: e?.target?.value.trim()
    });
    let trimValue = e?.target?.value.trim();
    const validPass = {
      LowerChar: !!trimValue?.match(lowerCaseLetters),
      SpecialChar: !!trimValue?.match(specialLetters),
      UpperChar: !!trimValue?.match(upperCaseLetters),
      PasswordLength: trimValue.length,
      NumberChar: !!trimValue?.match(numbers),
    } as ValidPassword;

    setPasswordValidation(validPass);
  };

	const callbackUpdateGroups = (groups: any) => {
		const found = selectedGroups.map((group: Group) => { return group.GroupID; }).includes(groups.GroupID);
		const groupList: Group[] = found
				? selectedGroups.filter((g: Group) => g.GroupID !== groups.GroupID)
				: [...selectedGroups, groups];
		setSelectedGroups(groupList);
	}

	const callbackSelectAll = () => {
		let groupList: Group[] = [];
		if (!allGroupsSelected) {
			groupList = showTestGroups ? [...testGroups, ...subAccountAllGroups] : [...subAccountAllGroups];
		} else {
			groupList = [];
		}
		setSelectedGroups(groupList);
		setAllGroupsSelected(!allGroupsSelected);
	}

	const onRemoveGroup = (leftGroups: Group[]) => {
		if (leftGroups && leftGroups?.length > 0) {
			setSelectedGroups(leftGroups);
		}
		else {
			setSelectedGroups([]);
		}
	}

	const handleKeyPress = (event: any) => {
    var isNumber = /^[0-9]*$/;
		if (!event.key.match(isNumber) || event.key === 'e') {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }

	return (
		<BaseDialog
			classes={classes}
			open={isOpen}
			title={t(`SubAccount.${ CustomGuidEnc === '' ? 'addSubAccount' : 'editSubAccount'}`)}
			icon={<div className={classes.dialogIconContent}>
				{'\uE0D5'}
			</div>}
			showDivider={false}
			onClose={() => onClose(false)}
			onCancel={() => onClose(false)}
			onConfirm={() => {}}
			reduceTitle
			style={{ minWidth: 240 }}
			renderButtons={() => (
				<Grid
					container
					spacing={2}
					className={clsx(
						classes.dialogButtonsContainer,
						isRTL ? classes.rowReverse : null
					)}
				>
					<Grid item>
						<Button
							onClick={saveSubAccountDetils}
							className={clsx(
								classes.btn,
								classes.btnRounded,
								"saveFixedDetails"
							)}
						>
							{t("common.Save")}
						</Button>
					</Grid>
					<Grid item>
						<Button
							variant='contained'
							size='small'
							onClick={() => onClose(false)}
							className={clsx(classes.btn, classes.btnRounded)}
						>
							{t("common.cancel")}
						</Button>
					</Grid>
				</Grid>
			)}
		>
			<>
				<Grid container className={classes.pb15}>
					{
						(!isGlobal || IsPoland) ? (
							<>
								<Grid item md={4} xs={12} className={clsx(classes.pb10)}>
									<b>{t("SubAccount.emailBulk")}:</b> {subAccountDetails.emailBulk || 0} {t("SubAccount.messages")}
								</Grid>
								<Grid item md={4} xs={12} className={clsx(classes.pb10)}>
									<Stack direction="row">
										<b>{t("SubAccount.SMSBulk")}:</b>
										&nbsp;{subAccountDetails.SMSBulk || 0} {t("SubAccount.credit")}
									</Stack>
								</Grid>
							</>
						) : (
							<Grid item md={4} xs={12} className={clsx(classes.pb10)}>
								<b>{t("SubAccount.balance")}:</b> { accountIsCurrencySymbolPrefix ? accountCurrencySymbol : '' } {subAccountDetails.balance || 0} { !accountIsCurrencySymbolPrefix ? accountCurrencySymbol : '' }
							</Grid>
						)
					}
				</Grid>
				<div className={clsx(classes.f18, classes.bold, classes.pb10, classes.pt10)}>{t('SubAccount.subAccountSetting')}</div>
				<Divider className={clsx(classes.mb10, classes.bgBlack)} />
				<Grid container className={clsx(classes.pb15)} spacing={ windowSize !== 'xs' ? 3 : 0}>
					<Grid item md={4} xs={12}>
						<Typography title={t("SubAccount.subAccountName")} className={classes.alignDir}>
							{t("SubAccount.subAccountName")}
						</Typography>
						<TextField
							id="subAccountName"
							label=""
							variant="outlined"
							name="subAccountName"
							value={subAccountDetails.subAccountName}
							className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
							autoComplete="off"
							onChange={(e: any) => setSubAccountDetails({
								...subAccountDetails,
								subAccountName: e.target.value
							})}
						/>
						<Box className='textBoxWrapper'>
							<Typography className={clsx(errors.subAccountName ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
								{errors.subAccountName}
							</Typography>
						</Box>
					</Grid>
					<Grid item md={4} xs={12}>
						<Typography title={t("common.Cellphone")} className={classes.alignDir}>
							{t("common.Cellphone")}
						</Typography>
						<TextField
							id="cellPhone"
							label=""
							variant="outlined"
							name="cellPhone"
							value={subAccountDetails.cellPhone}
							className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
							autoComplete="off"
							onChange={(e: any) => setSubAccountDetails({
								...subAccountDetails,
								cellPhone: IsValidPhoneNumberKeyPress(e.target.value) ? e.target.value : ''
							})}
							inputProps={{ maxlength: 16 }}
						/>
						<Box className='textBoxWrapper'>
							<Typography className={clsx(errors.cellPhone ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
								{errors.cellPhone}
							</Typography>
						</Box>
					</Grid>

					<Grid item md={4} xs={12}>
						<Typography title={t("SubAccount.accountManager")} className={classes.alignDir}>
							{t("SubAccount.accountManager")}
						</Typography>
						<TextField
							id="accountManager"
							label=""
							variant="outlined"
							name="accountManager"
							value={subAccountDetails.accountManager}
							className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
							autoComplete="off"
							onChange={(e: any) => setSubAccountDetails({
								...subAccountDetails,
								accountManager: e.target.value
							})}
						/>
					</Grid>


					{
						(!isGlobal || IsPoland) && (
							<>		
								<Grid item md={4} xs={12}>
									<FormControlLabel
										control={
											<PulseemSwitch
												id="1"
												switchType='ios'
												classes={classes}
												onColor="#0371ad"
												handleDiameter={20}
												boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
												activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
												height={15}
												className={clsx({ [classes.rtlSwitch]: isRTL })}
												checked={subAccountDetails.addEmailBulk}
												onChange={(e: any) => setSubAccountDetails({
													...subAccountDetails,
													addEmailBulk: !subAccountDetails.addEmailBulk
												})}
											/>
										}
										label={t('SubAccount.addEmailBulk')}
									/>
									{
										subAccountDetails.addEmailBulk && (
											<>
												<Typography title={t("SubAccount.emailBulkAmount")} className={clsx(classes.alignDir, classes.pt10)}>
													{t("SubAccount.emailBulkAmount")}
												</Typography>
												<TextField
													type='text'
													id="emailBulkAmount"
													label=""
													variant="outlined"
													name="emailBulkAmount"
													value={subAccountDetails.emailBulkAmount}
													className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
													autoComplete="off"
													onChange={(e: any) => {
														if (NumberWithMinusRegEx.test(e.target.value)) {
															setSubAccountDetails({
																...subAccountDetails,
																emailBulkAmount: e.target.value
															})
														}
													}}
													inputProps={{ max: 9999999999 }}
													style={{ direction: 'ltr' }}
												/>
												<Typography className={clsx('MuiFormHelperText-root', classes.f14)}>
												 	{t('SubAccount.balance')}: {get(mainAccountBalance, 'EmailBalance', 0)}
												</Typography>
												<Typography className={clsx(errors.emailBulkAmount ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
													{errors.emailBulkAmount}
												</Typography>
											</>
										)
									}
								</Grid>
								
								<Grid item md={4} xs={12}>
									<FormControlLabel
										control={
											<PulseemSwitch
												id="1"
												switchType='ios'
												classes={classes}
												onColor="#0371ad"
												handleDiameter={20}
												boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
												activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
												height={15}
												className={clsx({ [classes.rtlSwitch]: isRTL })}
												checked={subAccountDetails.addSMSBulk}
												onChange={(e: any) => setSubAccountDetails({
													...subAccountDetails,
													addSMSBulk: !subAccountDetails.addSMSBulk
												})}
											/>
										}
										label={t('SubAccount.addSMSBulk')}
									/>
									{
										subAccountDetails.addSMSBulk && (
											<>
												<Typography title={t("SubAccount.SMSBulkAmount")} className={clsx(classes.alignDir, classes.pt10)}>
													{t("SubAccount.SMSBulkAmount")}
												</Typography>
												<TextField
													type='text'
													id="SMSBulkAmount"
													label=""
													variant="outlined"
													name="SMSBulkAmount"
													value={subAccountDetails.SMSBulkAmount}
													className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
													autoComplete="off"
													onChange={(e: any) => {
														if (NumberWithMinusRegEx.test(e.target.value)) {
															setSubAccountDetails({
																...subAccountDetails,
																SMSBulkAmount: e.target.value
															})
														}
													}}
													inputProps={{ max: 9999999999 }}
													style={{ direction: 'ltr' }}
												/>
												<Typography className={clsx('MuiFormHelperText-root', classes.f14)}>
												 	{t('SubAccount.balance')}: {get(mainAccountBalance, 'SMSBalance', 0)}
												</Typography>
												<Typography className={clsx(errors.SMSBulkAmount ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
													{errors.SMSBulkAmount}
												</Typography>
											</>
										)
									}
								</Grid>

								<Grid item md={4} xs={12}>
									{/* {
										subAccountDetails.MMSBulk !== null && <>
											<FormControlLabel
												control={
													<PulseemSwitch
														id="1"
														switchType='ios'
														classes={classes}
														onColor="#0371ad"
														handleDiameter={20}
														boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
														activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
														height={15}
														className={clsx({ [classes.rtlSwitch]: isRTL })}
														checked={subAccountDetails.addMMSBulk}
														onChange={() => setSubAccountDetails({
															...subAccountDetails,
															addMMSBulk: !subAccountDetails.addMMSBulk
														})}
													/>
												}
												label={t('SubAccount.addMMSBulk')}
											/>
											{
												subAccountDetails.addMMSBulk && (
													<>
														<Typography title={t("SubAccount.MMSBulkAmount")} className={clsx(classes.alignDir, classes.pt10)}>
															{t("SubAccount.MMSBulkAmount")}
														</Typography>
														<TextField
															type='number'
															id="MMSBulkAmount"
															label=""
															variant="outlined"
															name="MMSBulkAmount"
															value={subAccountDetails.MMSBulkAmount}
															className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
															autoComplete="off"
															onChange={(e: any) => e.target.value < 0 ? (e.target.value = 0) : setSubAccountDetails({
																...subAccountDetails,
																MMSBulkAmount: Math.max(0, parseInt(e.target.value)).toString().slice(0,10)
															})}
															inputProps={{ maxLength: 10 }}
														/>
													</>
												)
											}
										</>
									} */}
								</Grid>
							</>
						)
					}

					{
						(isGlobal && !IsPoland) && (
							<>
								<Grid item md={4} xs={12}>
									<Typography title={t("SubAccount.balance")} className={clsx(classes.alignDir, classes.pt10)}>
										{t("SubAccount.addBalance")}
									</Typography>
									<TextField
										type='text'
										id="addBalance"
										label=""
										variant="outlined"
										name="addBalance"
										value={subAccountDetails.addBalance}
										className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
										autoComplete="off"
										onChange={(e: any) => {
											if (NumberWithMinusRegEx.test(e.target.value)) {
												setSubAccountDetails({
													...subAccountDetails,
													addBalance: e.target.value
												})
											}
										}}
										inputProps={{ max: 9999999999 }}
										style={{ direction: 'ltr' }}
									/>
									<Typography className={clsx('MuiFormHelperText-root', classes.f14)}>
										{t('SubAccount.balance')}: {get(mainAccountBalance, 'GlobalBalance', 0)}
									</Typography>
									<Typography className={clsx(errors.addBalance ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
										{errors.addBalance}
									</Typography>
								</Grid>
							</>
						)
					}
					
					{/* <Grid item md={4} xs={12}>
						<Typography title={t("SubAccount.automaticUserLock")} className={clsx(classes.alignDir, classes.pt10)}>
							{t("SubAccount.automaticUserLock")}
						</Typography>
						<DateField
							toolbarDisabled={false}
							classes={classes}
							placeholder={t('notifications.date')}
							value={subAccountDetails.automaticUserLock}
							onChange={(value: any) =>
								setSubAccountDetails({
									...subAccountDetails,
									automaticUserLock: moment(value).format(DateFormats.DATEPICKER_DATE_FORMAT)
								})
							}
							timePickerOpen={true}
							dateActive={true}
							minDate={undefined}
							onTimeChange={() => { }}
							timeActive={false}
							buttons={{
								ok: t("common.confirm"),
								cancel: t("common.cancel"),
							} as any}
							removePadding={true}
							hideInvalidDateMessage={true}
						/>
					</Grid> */}
				</Grid>

				<div className={clsx(classes.f18, classes.bold, classes.pb10, classes.pt30)}>{t('SubAccount.loginInformation')}</div>
				<Divider className={clsx(classes.mb10, classes.bgBlack)} />
				<Grid container spacing={ windowSize !== 'xs' ? 3 : 0}>
					<Grid item md={4} xs={12}>
						<Typography title={t("SubAccount.subAccountName")} className={classes.alignDir}>
							{t("common.Email")}
							<span className={clsx(classes.errorLabel, classes.pr10, classes.pe10)}>* {t("SubAccount.email2FA")}</span>
						</Typography>
						<TextField
							id="emailAddress"
							label=""
							variant="outlined"
							name="Name"
							value={subAccountDetails.emailAddress}
							className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
							autoComplete="off"
							onChange={(e: any) => setSubAccountDetails({
								...subAccountDetails,
								emailAddress: e.target.value.trim()
							})}
						/>
						<Box className='textBoxWrapper'>
							<Typography className={clsx(errors.emailAddress ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
								{errors.emailAddress}
							</Typography>
						</Box>
					</Grid>
				</Grid>

				<Grid container className={clsx(classes.pb15, classes.pt10)} spacing={ windowSize !== 'xs' ? 3 : 0}>
					<Grid item md={4} xs={12}>
						<Typography title={t("SubAccount.loginUserName")} className={classes.alignDir}>
							{t("SubAccount.loginUserName")}
						</Typography>
						<TextField
							id="loginUserName"
							label=""
							variant="outlined"
							name="loginUserName"
							value={subAccountDetails.loginUserName}
							className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
							autoComplete="off"
							onChange={(e: any) => setSubAccountDetails({
								...subAccountDetails,
								loginUserName: e.target.value.trim()
							})}
							disabled={CustomGuidEnc !== ''}
						/>
						<Box className='textBoxWrapper'>
							<Typography className={clsx(errors.loginUserName ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
								{errors.loginUserName}
							</Typography>
						</Box>
					</Grid>

					<Grid item md={4} xs={12}>
						<Typography title={t("common.password")} className={classes.alignDir}>
							{t("common.password")}
						</Typography>
						<Box className={classes.posRelative}>
							<Tooltip
								TransitionComponent={Zoom}
								interactive={true}
								title={<PasswordHint
									Password={passwordValidation}
									classes={classes}
								/>}
								arrow
								open={showPasswordTip}
								classes={useStylesBootstrapPasswordHint()}
							>
								<TextField
									onFocus={() => setShowPasswordTip(true)}
									onBlur={() => setShowPasswordTip(false)}
									type={subAccountDetails.isPasswordVisible ? "text" : "password"}
									variant="outlined"
									size="small"
									name="Password"
									value={subAccountDetails.password}
									onChange={handleChange}
									className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
									error={!!errors.password}
									inputProps={{ maxWidth: 50 }}
									// disabled={CustomGuidEnc !== ''}
								/>
							</Tooltip>
						</Box>
						<Box className='textBoxWrapper'>
							<Typography className={clsx(errors.password ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
								{errors.password}
							</Typography>
						</Box>
					</Grid>

					<Grid item md={4} xs={12}>
						<Typography title={t("SubAccount.confirmPassword")} className={classes.alignDir}>
							{t("SubAccount.confirmPassword")}
						</Typography>
						<TextField
							type="password"
							id="confirmPassword"
							label=""
							variant="outlined"
							name="confirmPassword"
							value={subAccountDetails.confirmPassword}
							className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
							autoComplete="off"
							onChange={(e: any) => setSubAccountDetails({
								...subAccountDetails,
								confirmPassword: e.target.value.trim()
							})}
							// disabled={CustomGuidEnc !== ''}
						/>
						<Box className='textBoxWrapper'>
							<Typography className={clsx(errors.confirmPassword ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
								{errors.confirmPassword}
							</Typography>
						</Box>
					</Grid>
				</Grid>

				{/* TODO - Commenting below as it is not working. Need to investigate */}
				{/* <div className={clsx(classes.f18, classes.bold, classes.pb10, classes.pt30)}>{t('SubAccount.addGroupsToSubAccount')}</div>
				<Divider className={clsx(classes.mb10, classes.bgBlack)} />
				<Grid container>
					<Grid item md={12} xs={12}>
						<Groups
							classes={classes}
							list={
								showTestGroups ? [...subAccountAllGroups, ...testGroups] : [...subAccountAllGroups]
							}
							selectedList={selectedGroups}
							callbackSelectedGroups={callbackUpdateGroups}
							callbackUpdateGroups={onRemoveGroup} //onUpdateGroups
							callbackSelectAll={callbackSelectAll}
							callbackReciFilter={() => { }} // onReciFilter
							callbackShowTestGroup={() => setShowTestGroups(!showTestGroups)}
							key={"dynuacGroups"}
							uniqueKey={'groups_4'}
							innerHeight={325}
							showSortBy={true}
							showFilter={false}
							showSelectAll={true}
							bsDot={null}
							isNotifications={false}
							isSms={true}
							isCampaign={false}
							noSelectionText={''}
							groupCompareKey='GroupName'
						/>
					</Grid>
				</Grid> */}
				<Loader isOpen={isLoader} />
				{toastMessage && renderToast()}
				{renderDialog()}
				{showTierPlans && <TierPlans
					classes={classes}
					isOpen={showTierPlans}
					onClose={() => setShowTierPlans(false)}
				/>}
			</>
		</BaseDialog>
	);
};

export default SaveSubAccount;
