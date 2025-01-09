import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { StateType } from "../../Models/StateTypes";
import { Box, Button, Divider, Grid, TextField, Tooltip, Typography, Zoom } from "@material-ui/core";
import clsx from 'clsx';
import PasswordHint from "../../screens/Settings/AccountSettings/Password/PasswordHint";
import { ValidPassword } from "../../screens/Settings/AccountSettings/Password/Types";
import { useStylesBootstrapPasswordHint } from "../../helpers/Utils/HtmlUtils";
import { lowerCaseLetters, numbers, specialLetters, upperCaseLetters } from "../../helpers/Constants";
import { BaseDialog } from "../DialogTemplates/BaseDialog";
import { CommonRedux } from "../../screens/Whatsapp/Editor/Types/WhatsappCreator.types";
import { IsValidNonGlobalPhoneNumber, IsValidPhoneNumberKeyPress, IsValidPhoneNumberWithCountryCode } from "../../helpers/Utils/Validations";
import { ValidateEmailAddress } from "../../helpers/Utils/common";
import { MdOutlinePersonAddAlt } from "react-icons/md";

const passwordValidationInit = {
	LowerChar: false,
	SpecialChar: false,
	UpperChar: false,
	PasswordLength: 0,
	NumberChar: false,
}

const userDetailsInit = {
	cellPhone: '',
	emailAddress: '',
	loginUserName: '',
	password: '',
	confirmPassword: ''
}

const errorsInit = {
	cellPhone: '',
	emailAddress: '',
	loginUserName: '',
	password: '',
	confirmPassword: ''
}

const User = ({ classes, isOpen, onClose, onConfirm, CustomGuidEnc }: any) => {
	const { isRTL, windowSize } = useSelector((state: StateType) => state.core);
	const { isGlobal, countryCodeList, accountCurrencySymbol, accountIsCurrencySymbolPrefix } = useSelector((state: { common: CommonRedux }) => state.common);
	const { t } = useTranslation();
	const [showPasswordTip, setShowPasswordTip] = useState<boolean>(false);
	const [passwordValidation, setPasswordValidation] = useState<ValidPassword>(passwordValidationInit as ValidPassword);
	const [userDetails, setUserDetails] = useState<any>(userDetailsInit);
	const [errors, setErrors] = useState(errorsInit);

	useEffect(() => {
		if (isOpen) {
			setPasswordValidation(passwordValidationInit);
			setUserDetails(userDetailsInit)
			setErrors(errorsInit);
		}
	}, [isOpen])

	const handleChange = (e: any) => {
		setUserDetails({
			...userDetails,
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

	const saveUser = () => {
		let errorsTemp = JSON.parse(JSON.stringify(errors))
		errorsTemp = {
			cellPhone: (isGlobal ? !IsValidPhoneNumberWithCountryCode(userDetails.cellPhone.trim(), countryCodeList) : !IsValidNonGlobalPhoneNumber(userDetails.cellPhone.trim())) ? t('recipient.errors.cellPhone') : '',
			emailAddress: userDetails.emailAddress.trim() === '' ? t('common.requiredField') : '',
			loginUserName: userDetails.loginUserName.trim() === '' ? t('common.requiredField') : '',
			password: '',
			confirmPassword: userDetails.confirmPassword.trim() !== '' && userDetails.confirmPassword.trim() === '' ? t('common.requiredField') : ''
		};

		if (userDetails.password.trim() !== '' && (!passwordValidation.LowerChar || !passwordValidation.NumberChar || !passwordValidation.PasswordLength || !passwordValidation.SpecialChar || !passwordValidation.UpperChar)) {
			errorsTemp.password = t('SignUp.InvalidPassword');
		} else if (userDetails.password.trim() === '') {
			errorsTemp.password = t('SignUp.PasswordRequired');
		}

		if ((userDetails.password !== '' || userDetails.confirmPassword !== '') && userDetails.password !== userDetails.confirmPassword) {
			errorsTemp = {
				...errorsTemp,
				confirmPassword: t('common.confirmPasswordNotMatch')
			}
		} else if (userDetails.confirmPassword.trim() === '') {
			errorsTemp.confirmPassword = t('SignUp.PasswordRequired');
		}

		if (!ValidateEmailAddress(userDetails.emailAddress)) {
			errorsTemp = {
				...errorsTemp,
				emailAddress: t('common.invalidEmail')
			}
		}
		setErrors(errorsTemp);

		if (errorsTemp.cellPhone === '' && errorsTemp.emailAddress === '' && errorsTemp.loginUserName === '' && errorsTemp.password === '' && errorsTemp.confirmPassword === '') {

		}
	}

	return (
		<BaseDialog
			classes={classes}
			open={isOpen}
			title={t('SubUsers.addUser')}
			icon={<MdOutlinePersonAddAlt />}
			showDivider={false}
			onClose={() => onClose(false)}
			onCancel={() => onClose(false)}
			onConfirm={() => { }}
			reduceTitle
			style={{ minWidth: 240 }}
			paperStyle={clsx(windowSize !== 'xs' ? classes.w50VW : null)}
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
							onClick={saveUser}
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
			<Box>
				<div className={clsx(classes.f18, classes.bold, classes.pb10)}>{t('SubUsers.userDetails')}</div>
				<Divider className={clsx(classes.mb20, classes.bgBlack)} />
				<Grid container spacing={3}>
					<Grid item md={4} xs={12}>
						<Typography title={t("common.Email")} className={classes.alignDir}>
							{t("common.Email")}
							<span className={clsx(classes.errorLabel, classes.pl5, classes.pe5)}>*</span>
							<div className={clsx(classes.errorLabel)} style={{ marginTop: 0 }}>{t("SubAccount.email2FA")}</div>
						</Typography>
						<TextField
							id="emailAddress"
							label=""
							variant="outlined"
							name="Name"
							value={userDetails.emailAddress}
							className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
							autoComplete="off"
							onChange={(e: any) => setUserDetails({
								...userDetails,
								emailAddress: e.target.value.trim()
							})}
						/>
						<Box className='textBoxWrapper'>
							<Typography className={clsx(errors.emailAddress ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
								{errors.emailAddress}
							</Typography>
						</Box>
					</Grid>

					<Grid item md={4} xs={12}>
						<Typography title={t("SubUsers.cellphone")} className={classes.alignDir}>
							{t("SubUsers.cellphone")}
							<span className={clsx(classes.errorLabel, classes.pl5, classes.pe5)}>*</span>
							<div className={clsx(classes.errorLabel)} style={{ marginTop: 0 }}>{t("SubAccount.cellPhone2FA")}</div>
						</Typography>
						<TextField
							id="cellphone"
							label=""
							variant="outlined"
							name="Name"
							value={userDetails.cellPhone}
							className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
							autoComplete="off"
							onChange={(e: any) => setUserDetails({
								...userDetails,
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
				</Grid>

				<div className={clsx(classes.f18, classes.bold, classes.pb10, classes.mt25, classes.pt10)}>{t('SubUsers.loginInformation')}</div>
				<Divider className={clsx(classes.mb20, classes.bgBlack)} />
				<Grid container className={clsx(classes.pb15, classes.pt10)} spacing={2}>
					<Grid item md={4} xs={12}>
						<Typography title={t("SubAccount.loginUserName")} className={classes.alignDir}>
							{t("SubAccount.loginUserName")}
						</Typography>
						<TextField
							id="loginUserName"
							label=""
							variant="outlined"
							name="loginUserName"
							value={userDetails.loginUserName}
							className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
							autoComplete="off"
							onChange={(e: any) => setUserDetails({
								...userDetails,
								loginUserName: e.target.value.trim()
							})}
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
									type={userDetails.isPasswordVisible ? "text" : "password"}
									variant="outlined"
									size="small"
									name="Password"
									value={userDetails.password}
									onChange={handleChange}
									className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
									error={!!errors.password}
									inputProps={{ maxWidth: 50 }}
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
							value={userDetails.confirmPassword}
							className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
							autoComplete="off"
							onChange={(e: any) => setUserDetails({
								...userDetails,
								confirmPassword: e.target.value.trim()
							})}
						/>
						<Box className='textBoxWrapper'>
							<Typography className={clsx(errors.confirmPassword ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
								{errors.confirmPassword}
							</Typography>
						</Box>
					</Grid>
				</Grid>
			</Box>
		</BaseDialog>
	)
}

export default User;