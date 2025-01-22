import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { StateType } from "../../Models/StateTypes";
import { Box, Button, Divider, Grid, IconButton, InputAdornment, makeStyles, TextField, Tooltip, Typography, Zoom } from "@material-ui/core";
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
import { eSubUserAction, SubUserModel } from "../../Models/SubUser/SubUsers";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import Permissions from "../Permissions/Permissions";
import PermissionItems from "../Permissions/PermissionItems";

const passwordValidationInit = {
	LowerChar: false,
	SpecialChar: false,
	UpperChar: false,
	PasswordLength: 0,
	NumberChar: false,
}

const errorsInit = {
	cellPhone: '',
	emailAddress: '',
	loginUserName: '',
	password: '',
	confirmPassword: '',
	firstName: '',
	lastName: '',
}

const initSubUser = {
	Cellphone: '',
	Email: '',
	FirstName: '',
	LastName: '',
	Password: '',
	ActionType: eSubUserAction.NewUser,
	SubUserPermissions: [],
	UserName: '',
	UserPermissionsList: '',
	ConfirmPassword: ''
} as SubUserModel;

const useStyles = makeStyles({
	pwdEveButton: {
		width: 25,
		padding: 5,
		minWidth: 10,
		marginRight: 5,
	},
});

const User = ({ classes, isOpen, onClose, onConfirm, CustomGuidEnc }: any) => {
	const localClasses = useStyles();
	const { isRTL, windowSize } = useSelector((state: StateType) => state.core);
	const { isGlobal, countryCodeList } = useSelector((state: { common: CommonRedux }) => state.common);
	const { t } = useTranslation();
	const [showPasswordTip, setShowPasswordTip] = useState<boolean>(false);
	const [passwordValidation, setPasswordValidation] = useState<ValidPassword>(passwordValidationInit as ValidPassword);
	const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
	const [userDetails, setUserDetails] = useState<SubUserModel>(initSubUser);
	const [errors, setErrors] = useState(errorsInit);
	const [permissions, setPermissions] = useState({
		accessType: '',
		allowSending: false,
		allowExport: false,
		allowDeleting: false,
		allowSubUsers: false
	})

	useEffect(() => {
		if (isOpen) {
			setPasswordValidation(passwordValidationInit);
			setUserDetails(initSubUser)
			setErrors(errorsInit);
		}
	}, [isOpen])

	const handleChange = (e: any) => {
		setUserDetails({
			...userDetails,
			Password: e?.target?.value.trim()
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
			cellPhone: (isGlobal ? !IsValidPhoneNumberWithCountryCode(userDetails.Cellphone.trim(), countryCodeList) : !IsValidNonGlobalPhoneNumber(userDetails.Cellphone.trim())) ? t('recipient.errors.cellPhone') : '',
			emailAddress: userDetails.Email.trim() === '' ? t('common.requiredField') : '',
			loginUserName: userDetails.UserName.trim() === '' ? t('common.requiredField') : '',
			password: '',
			confirmPassword: userDetails.ConfirmPassword.trim() !== '' && userDetails.ConfirmPassword.trim() === '' ? t('common.requiredField') : ''
		};

		if (userDetails.Password.trim() !== '' && (!passwordValidation.LowerChar || !passwordValidation.NumberChar || !passwordValidation.PasswordLength || !passwordValidation.SpecialChar || !passwordValidation.UpperChar)) {
			errorsTemp.password = t('SignUp.InvalidPassword');
		} else if (userDetails.Password.trim() === '') {
			errorsTemp.password = t('SignUp.PasswordRequired');
		}

		if ((userDetails.Password !== '' || userDetails.ConfirmPassword !== '') && userDetails.Password !== userDetails.ConfirmPassword) {
			errorsTemp = {
				...errorsTemp,
				confirmPassword: t('common.confirmPasswordNotMatch')
			}
		} else if (userDetails.ConfirmPassword.trim() === '') {
			errorsTemp.confirmPassword = t('SignUp.PasswordRequired');
		}

		if (!ValidateEmailAddress(userDetails.Email)) {
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
							value={userDetails.Email}
							className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
							autoComplete="off"
							onChange={(e: any) => setUserDetails({
								...userDetails,
								Email: e.target.value.trim()
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
							value={userDetails.Cellphone}
							className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
							autoComplete="off"
							onChange={(e: any) => setUserDetails({
								...userDetails,
								Cellphone: IsValidPhoneNumberKeyPress(e.target.value) ? e.target.value : ''
							})}
							inputProps={{ maxlength: 16 }}
						/>
						<Box className='textBoxWrapper'>
							<Typography className={clsx(errors.cellPhone ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
								{errors.cellPhone}
							</Typography>
						</Box>
					</Grid>
					<Grid item md={4} xs={4}></Grid>
					<Grid item md={4} xs={12}>
						<Typography title={t("SignUp.FirstName")} className={classes.alignDir}>
							{t("SignUp.FirstName")}
							<span className={clsx(classes.errorLabel, classes.pl5, classes.pe5)}>*</span>
						</Typography>
						<TextField
							id="firstName"
							label=""
							variant="outlined"
							name="Name"
							value={userDetails.FirstName}
							className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
							autoComplete="off"
							onChange={(e: any) => setUserDetails({
								...userDetails,
								FirstName: e.target.value.trim()
							})}
						/>
						<Box className='textBoxWrapper'>
							<Typography className={clsx(errors.firstName ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
								{errors.firstName}
							</Typography>
						</Box>
					</Grid>
					<Grid item md={4} xs={12}>
						<Typography title={t("SignUp.LastName")} className={classes.alignDir}>
							{t("SignUp.LastName")}
							<span className={clsx(classes.errorLabel, classes.pl5, classes.pe5)}>*</span>
						</Typography>
						<TextField
							id="lastName"
							label=""
							variant="outlined"
							name="Name"
							value={userDetails.LastName}
							className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
							autoComplete="off"
							onChange={(e: any) => setUserDetails({
								...userDetails,
								LastName: e.target.value.trim()
							})}
						/>
						<Box className='textBoxWrapper'>
							<Typography className={clsx(errors.lastName ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
								{errors.lastName}
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
							<span className={clsx(classes.errorLabel, classes.pl5, classes.pe5)}>*</span>
						</Typography>
						<TextField
							id="loginUserName"
							label=""
							variant="outlined"
							name="loginUserName"
							value={userDetails.UserName}
							className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
							autoComplete="off"
							onChange={(e: any) => setUserDetails({
								...userDetails,
								UserName: e.target.value.trim()
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
							<span className={clsx(classes.errorLabel, classes.pl5, classes.pe5)}>*</span>
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
									type={passwordVisible ? "text" : "password"}
									variant="outlined"
									size="small"
									name="Password"
									value={userDetails.Password}
									onChange={handleChange}
									className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
									error={!!errors.password}
									InputProps={{
										endAdornment: (
											<InputAdornment position="end">
												<IconButton
													onClick={() => setPasswordVisible(!passwordVisible)}
													className={localClasses.pwdEveButton}
													edge="end"
												>
													{!passwordVisible ? (
														<VisibilityOff style={{ fontSize: 15 }} />
													) : (
														<Visibility style={{ fontSize: 15 }} />
													)}
												</IconButton>
											</InputAdornment>
										)
									}}
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
							<span className={clsx(classes.errorLabel, classes.pl5, classes.pe5)}>*</span>
						</Typography>
						<TextField
							type={passwordVisible ? "text" : "password"}
							id="confirmPassword"
							label=""
							variant="outlined"
							name="confirmPassword"
							value={userDetails.ConfirmPassword}
							className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
							autoComplete="off"
							onChange={(e: any) => setUserDetails({
								...userDetails,
								ConfirmPassword: e.target.value.trim()
							})}
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<IconButton
											onClick={() => setPasswordVisible(!passwordVisible)}
											className={localClasses.pwdEveButton}
											edge="end"
										>
											{!passwordVisible ? (
												<VisibilityOff style={{ fontSize: 15 }} />
											) : (
												<Visibility style={{ fontSize: 15 }} />
											)}
										</IconButton>
									</InputAdornment>
								)
							}}
						/>
						<Box className='textBoxWrapper'>
							<Typography className={clsx(errors.confirmPassword ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
								{errors.confirmPassword}
							</Typography>
						</Box>
					</Grid>
				</Grid>

				<PermissionItems
					classes={classes}
					permissions={permissions}
					updatePermissions={setPermissions}
					updateSubUserDetails={setUserDetails}
					userDetails={userDetails}
				/>
			</Box>
		</BaseDialog>
	)
}

export default User;