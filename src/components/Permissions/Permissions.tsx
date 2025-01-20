import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { StateType } from "../../Models/StateTypes";
import { Box, Button, Divider, FormControlLabel, Grid, TextField, Typography } from "@material-ui/core";
import clsx from 'clsx';
import { BaseDialog } from "../DialogTemplates/BaseDialog";
import { MdTaskAlt } from "react-icons/md";
import PulseemSwitch from "../Controlls/PulseemSwitch";
import { PermissionTypes } from "../../config/enum";
import { IsValidNonGlobalPhoneNumber, IsValidPhoneNumberKeyPress, IsValidPhoneNumberWithCountryCode } from "../../helpers/Utils/Validations";
import { CommonRedux } from "../../screens/Whatsapp/Editor/Types/WhatsappCreator.types";
import { ValidateEmailAddress } from "../../helpers/Utils/common";
import { eSubUserPermissions, SubUserModel } from "../../Models/SubUser/SubUsers";

const Permissions = ({ classes, isOpen, subUser, onClose, onConfirm }: any) => {
	const { isRTL, windowSize } = useSelector((state: StateType) => state.core);
	const { isGlobal, countryCodeList } = useSelector((state: { common: CommonRedux }) => state.common);
	const { t } = useTranslation();
	const [permissions, setPermissions] = useState({
		accessType: '',
		allowSending: false,
		allowExport: false,
		allowDeleting: false,
		allowSubUsers: false
	})
	const [userDetails, setUserDetails] = useState<SubUserModel | any>(null);
	const [errors, setErrors] = useState({
		cellPhone: '',
		emailAddress: '',
		accessType: '',
		limitedAccess: '',
	});

	const adminPermissions = [
		eSubUserPermissions.AllowSend,
		eSubUserPermissions.AllowDelete,
		eSubUserPermissions.AllowExport,
		eSubUserPermissions.AllowSubUsers,
	];

	const reloadForm = () => {
		setErrors({
			cellPhone: '',
			emailAddress: '',
			accessType: '',
			limitedAccess: '',
		});

		const isAdmin = adminPermissions.every(permission =>
			subUser?.UserPermissionsList?.indexOf(permission) > -1
		);

		if (isAdmin) {
			setPermissions({
				accessType: PermissionTypes.Admin,
				allowSending: true,
				allowExport: true,
				allowDeleting: true,
				allowSubUsers: true
			})
		}
	}

	useEffect(() => {
		setUserDetails(subUser)
		reloadForm();
	}, [isOpen])

	const savePermissions = () => {
		let errorsTemp = JSON.parse(JSON.stringify(errors))
		errorsTemp = {
			cellPhone: (isGlobal ? !IsValidPhoneNumberWithCountryCode(userDetails?.Cellphone.trim(), countryCodeList) : !IsValidNonGlobalPhoneNumber(userDetails?.Cellphone.trim())) ? t('recipient.errors.cellPhone') : '',
			emailAddress: userDetails?.Email?.trim() === '' ? t('common.requiredField') : '',
			accessType: permissions.accessType === '' ? t('SubUsers.permissionIsRequired') : '',
			limitedAccess: permissions.accessType === PermissionTypes.LimitedAccess && permissions.allowSending === false && permissions.allowExport === false && permissions.allowDeleting === false ? t('SubUsers.limitedPermissionIsRequired') : ''
		};

		if (!ValidateEmailAddress(userDetails?.Email)) {
			errorsTemp = {
				...errorsTemp,
				emailAddress: t('common.invalidEmail')
			}
		}
		setErrors(errorsTemp);

		if (errorsTemp.cellPhone === '' && errorsTemp.emailAddress === '' && errorsTemp.accessType === '' && errorsTemp.limitedAccess === '') {
			console.log(permissions)
			console.log(userDetails);
			onConfirm(userDetails)
		}
	}

	return (
		<BaseDialog
			classes={classes}
			open={isOpen}
			title={t('SubUsers.permissions')}
			icon={<MdTaskAlt />}
			showDivider={false}
			onClose={() => onClose(false)}
			onCancel={() => onClose(false)}
			reduceTitle
			paperStyle={clsx(windowSize !== 'xs' ? classes.w50VW : null)}
			childrenPadding={false}
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
							onClick={savePermissions}
							className={clsx(
								classes.btn,
								classes.btnRounded
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
				<Grid container spacing={2}>
					<Grid item md={12} xs={12}>
						<div className={clsx(classes.f18, classes.bold, classes.pb10)}>{t('SubAccount.loginInformation')}</div>
						<Divider className={clsx(classes.bgBlack)} />
					</Grid>
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
							value={userDetails?.Email}
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
							value={userDetails?.Cellphone}
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
				</Grid>

				<Grid container className={clsx(isRTL ? classes.rowReverse : null)} spacing={2}>
					<Grid item md={12} xs={12}>
						<div className={clsx(classes.f18, classes.bold, classes.pb10, classes.pt30)}>{t('SubUsers.permissions')}</div>
						<Divider className={clsx(classes.mb10, classes.bgBlack)} />
					</Grid>
					<Grid item md={8} xs={8}>
						<Typography>
							{t('SubUsers.admin')}
						</Typography>
					</Grid>
					<Grid item md={4} xs={4} className={clsx(classes.textRight)}>
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
									checked={permissions.accessType === PermissionTypes.Admin}
									onChange={(e: any) => setPermissions({
										...permissions,
										accessType: permissions.accessType === PermissionTypes.Admin ? '' : PermissionTypes.Admin
									})}
								/>
							}
							label=''
						/>
					</Grid>
				</Grid>

				<Grid container className={clsx(isRTL ? classes.rowReverse : null)}>
					<Grid item md={8} xs={8} className={clsx(classes.pt10)}>
						<Typography>
							{t('SubUsers.limitedAccess')}
							<Typography className={clsx(errors.limitedAccess ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
								{errors.limitedAccess}
							</Typography>
						</Typography>
					</Grid>
					<Grid item md={4} xs={4} className={clsx(classes.textRight, classes.pt10)}>
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
									checked={permissions.accessType === PermissionTypes.LimitedAccess}
									onChange={(e: any) => {
										setPermissions({
											...permissions,
											accessType: permissions.accessType === PermissionTypes.LimitedAccess ? '' : PermissionTypes.LimitedAccess
										})
									}}
								/>
							}
							label=''
							style={{
								marginTop: '7px'
							}}
						/>
					</Grid>

					{
						permissions.accessType === PermissionTypes.LimitedAccess && (
							<>
								<Grid container className={clsx(isRTL ? classes.rowReverse : null)}>
									<Grid item md={8} xs={8} className={clsx(classes.pt10, isRTL ? classes.pr30 : classes.pl30)}>
										{t('SubUsers.allowSending')}
									</Grid>
									<Grid item md={4} xs={4} className={clsx(classes.textRight, classes.pt10)}>
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
													checked={permissions.allowSending === true}
													onChange={(e: any) => {
														if (!e.target.checked) {
															setPermissions({ ...permissions, allowSending: false })
															setUserDetails({
																...userDetails,
																SubUserPermissions: userDetails.UserPermissionsList.filter((x: any) => { return x !== eSubUserPermissions.AllowSend }).join(','),
																UserPermissionsList: userDetails.UserPermissionsList.filter((x: any) => { return x !== eSubUserPermissions.AllowSend })
															})
														}
														else {
															setPermissions({ ...permissions, allowSending: true })
															setUserDetails({
																...userDetails,
																SubUserPermissions: [...userDetails.UserPermissionsList, eSubUserPermissions.AllowSend].join(','),
																UserPermissionsList: [...userDetails.UserPermissionsList, eSubUserPermissions.AllowSend]
															})

														}
													}}
												/>
											}
											label=''
										/>
									</Grid>
								</Grid>

								<Grid container className={clsx(isRTL ? classes.rowReverse : null)}>
									<Grid item md={8} xs={8} className={clsx(classes.pt10, isRTL ? classes.pr30 : classes.pl30)}>
										{t('SubUsers.allowExport')}
									</Grid>
									<Grid item md={4} xs={4} className={clsx(classes.textRight, classes.pt10)}>
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
													checked={permissions.allowExport === true}
													onChange={(e: any) => {
														if (!e.target.checked) {
															setPermissions({ ...permissions, allowExport: false })
															setUserDetails({
																...userDetails,
																SubUserPermissions: userDetails.UserPermissionsList.filter((x: any) => { return x !== eSubUserPermissions.AllowExport }).join(','),
																UserPermissionsList: userDetails.UserPermissionsList.filter((x: any) => { return x !== eSubUserPermissions.AllowExport })
															})
														}
														else {
															setPermissions({ ...permissions, allowExport: true })
															setUserDetails({
																...userDetails,
																SubUserPermissions: [...userDetails.UserPermissionsList, eSubUserPermissions.AllowExport].join(','),
																UserPermissionsList: [...userDetails.UserPermissionsList, eSubUserPermissions.AllowExport]
															})

														}
													}}
												/>
											}
											label=''
										/>
									</Grid>
								</Grid>

								<Grid container className={clsx(isRTL ? classes.rowReverse : null)}>
									<Grid item md={8} xs={8} className={clsx(classes.pt10, isRTL ? classes.pr30 : classes.pl30)}>
										{t('SubUsers.allowDeleting')}
									</Grid>
									<Grid item md={4} xs={4} className={clsx(classes.textRight, classes.pt10)}>
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
													checked={permissions.allowDeleting === true}
													onChange={(e: any) => {
														if (!e.target.checked) {
															setPermissions({ ...permissions, allowDeleting: false })
															setUserDetails({
																...userDetails,
																SubUserPermissions: userDetails.UserPermissionsList.filter((x: any) => { return x !== eSubUserPermissions.AllowDelete }).join(','),
																UserPermissionsList: userDetails.UserPermissionsList.filter((x: any) => { return x !== eSubUserPermissions.AllowDelete })
															})
														}
														else {
															setPermissions({ ...permissions, allowDeleting: true })
															setUserDetails({
																...userDetails,
																SubUserPermissions: [...userDetails.UserPermissionsList, eSubUserPermissions.AllowDelete].join(','),
																UserPermissionsList: [...userDetails.UserPermissionsList, eSubUserPermissions.AllowDelete]
															})

														}
													}}
												/>
											}
											label=''
										/>
									</Grid>
								</Grid>

								<Grid container className={clsx(isRTL ? classes.rowReverse : null)}>
									<Grid item md={8} xs={8} className={clsx(classes.pt10, isRTL ? classes.pr30 : classes.pl30)}>
										{t('SubUsers.userCreation')}
									</Grid>
									<Grid item md={4} xs={4} className={clsx(classes.textRight, classes.pt10)}>
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
													checked={permissions.allowSubUsers === true}
													onChange={(e: any) => {
														if (!e.target.checked) {
															setPermissions({ ...permissions, allowSubUsers: false })
															setUserDetails({
																...userDetails,
																SubUserPermissions: userDetails.UserPermissionsList.filter((x: any) => { return x !== eSubUserPermissions.AllowSubUsers }).join(','),
																UserPermissionsList: userDetails.UserPermissionsList.filter((x: any) => { return x !== eSubUserPermissions.AllowSubUsers })
															})
														}
														else {
															setPermissions({ ...permissions, allowSubUsers: true })
															setUserDetails({
																...userDetails,
																SubUserPermissions: [...userDetails.UserPermissionsList, eSubUserPermissions.AllowSubUsers].join(','),
																UserPermissionsList: [...userDetails.UserPermissionsList, eSubUserPermissions.AllowSubUsers]
															})

														}
													}}
												/>
											}
											label=''
										/>
									</Grid>
								</Grid>

							</>
						)
					}
				</Grid>

				<Grid container className={clsx(isRTL ? classes.rowReverse : null)}>
					<Grid item md={8} xs={8} className={clsx(classes.pt10)}>
						{t('SubUsers.readOnly')}
					</Grid>
					<Grid item md={4} xs={4} className={clsx(classes.textRight, classes.pt10)}>
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
									checked={permissions.accessType === PermissionTypes.ReadOnly}
									onChange={(e: any) => {
										if (permissions.accessType !== PermissionTypes.ReadOnly) {
											setUserDetails({
												...userDetails,
												SubUserPermissions: '5',
												UserPermissionsList: [eSubUserPermissions.HideRecipietns]
											})
										}
										else {
											setUserDetails({
												...userDetails,
												SubUserPermissions: '',
												UserPermissionsList: []
											})
										}
										setPermissions({
											...permissions,
											accessType: permissions.accessType === PermissionTypes.ReadOnly ? '' : PermissionTypes.ReadOnly
										})
									}}
								/>
							}
							label=''
						/>
					</Grid>
				</Grid>

				<Box className='textBoxWrapper'>
					<Typography className={clsx(errors.accessType ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
						{errors.accessType}
					</Typography>
				</Box>
			</Box>
		</BaseDialog>
	)
}

export default Permissions;