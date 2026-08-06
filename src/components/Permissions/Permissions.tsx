import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { StateType } from "../../Models/StateTypes";
import { Box, Button, Divider, FormControlLabel, Grid, TextField, Tooltip, Typography } from "@material-ui/core";
import clsx from 'clsx';
import { BaseDialog } from "../DialogTemplates/BaseDialog";
import { MdTaskAlt } from "react-icons/md";
import PulseemSwitch from "../Controlls/PulseemSwitch";
import { PermissionTypes } from "../../config/enum";
import { IsValidNonGlobalPhoneNumber, IsValidPhoneNumberKeyPress, IsValidPhoneNumberWithCountryCode } from "../../helpers/Utils/Validations";
import { CommonRedux } from "../../screens/Whatsapp/Editor/Types/WhatsappCreator.types";
import { ValidateEmailAddress } from "../../helpers/Utils/common";
import { eSubUserAction, eSubUserPermissions, SubUserModel } from "../../Models/SubUser/SubUsers";
import { useServiceLimits } from "../../hooks/useServiceLimits";
import UsageCounter from "../UsageCounter/UsageCounter";
import UpgradePrompt from "../UpgradePrompt/UpgradePrompt";

const Permissions = ({ classes, isOpen, subUser, onClose, onConfirm, showButtons }: any) => {
	const { isRTL, windowSize } = useSelector((state: StateType) => state.core);
	const { isGlobal, countryCodeList } = useSelector((state: { common: CommonRedux }) => state.common);
	const { t } = useTranslation();
	const [permissions, setPermissions] = useState({
		accessType: '',
		allowSending: false,
		allowExport: false,
		allowDeleting: false,
		allowWhatsAppAgent: false,
	})
	const [userDetails, setUserDetails] = useState<SubUserModel | any>(subUser);
	const [errors, setErrors] = useState({
		cellPhone: '',
		emailAddress: '',
		accessType: '',
		limitedAccess: '',
		firstName: '',
		lastName: ''
	});

	const adminPermissions = [
		eSubUserPermissions.AllowSend,
		eSubUserPermissions.AllowDelete,
		eSubUserPermissions.AllowExport
	];

	const { usage, getLimit, isAtLimit } = useServiceLimits();
	const agentCount = usage?.serviceAgents as number;
	const maxServiceAgents = getLimit('maxServiceAgents');
	const alreadyHasAgentPermission = subUser?.UserPermissionsList?.indexOf(eSubUserPermissions.AllowWhatsAppToAgent) > -1;
	const agentLimitReached = isAtLimit('maxServiceAgents', agentCount);
	const disableAgentToggle = agentLimitReached && !alreadyHasAgentPermission;

	const reloadForm = () => {
		setErrors({
			cellPhone: '',
			emailAddress: '',
			accessType: '',
			limitedAccess: '',
			firstName: '',
			lastName: ''
		});

		const isAdmin = adminPermissions.every(permission =>
			subUser?.UserPermissionsList?.indexOf(permission) > -1
		);

		const hasWhatsApp = subUser?.UserPermissionsList?.indexOf(eSubUserPermissions.AllowWhatsAppToAgent) > -1;
		const isReadOnly = subUser?.UserPermissionsList?.indexOf(eSubUserPermissions.HideRecipients) > -1;
		const hasSend = subUser?.UserPermissionsList?.indexOf(eSubUserPermissions.AllowSend) > -1;
		const hasExport = subUser?.UserPermissionsList?.indexOf(eSubUserPermissions.AllowExport) > -1;
		const hasDelete = subUser?.UserPermissionsList?.indexOf(eSubUserPermissions.AllowDelete) > -1;

		if (isAdmin) {
			setPermissions({
				accessType: PermissionTypes.Admin,
				allowSending: true,
				allowExport: true,
				allowDeleting: true,
				allowWhatsAppAgent: hasWhatsApp
			})
		}
		else if (isReadOnly) {
			setPermissions({
				accessType: PermissionTypes.ReadOnly,
				allowSending: false,
				allowExport: false,
				allowDeleting: false,
				allowWhatsAppAgent: hasWhatsApp
			});
		}
		else if (hasSend || hasExport || hasDelete) {
			setPermissions({
				accessType: PermissionTypes.LimitedAccess,
				allowSending: hasSend,
				allowExport: hasExport,
				allowDeleting: hasDelete,
				allowWhatsAppAgent: hasWhatsApp
			});
		}
		else {
			setPermissions({
				accessType: '',
				allowSending: false,
				allowExport: false,
				allowDeleting: false,
				allowWhatsAppAgent: hasWhatsApp
			});
		}
	}

	useEffect(() => {
		if (isOpen) {
			reloadForm();
			setUserDetails({ ...subUser, ActionType: eSubUserAction.Update })
		}
	}, [isOpen])

	const savePermissions = () => {
		let errorsTemp = JSON.parse(JSON.stringify(errors))
		errorsTemp = {
			cellPhone: (isGlobal ? !IsValidPhoneNumberWithCountryCode(userDetails?.Cellphone.trim(), countryCodeList) : !IsValidNonGlobalPhoneNumber(userDetails?.Cellphone.trim())) ? t('recipient.errors.cellPhone') : '',
			emailAddress: userDetails?.Email?.trim() === '' ? t('common.requiredField') : '',
			accessType: permissions.accessType === '' && !permissions.allowWhatsAppAgent ? t('SubUsers.permissionIsRequired') : '',
			limitedAccess: permissions.accessType === PermissionTypes.LimitedAccess && permissions.allowSending === false && permissions.allowExport === false && permissions.allowDeleting === false ? t('SubUsers.limitedPermissionIsRequired') : '',
			firstName: userDetails.FirstName === '' ? t('common.requiredField') : '',
			lastName: userDetails.LastName === '' ? t('common.requiredField') : '',
		};

		if (!ValidateEmailAddress(userDetails?.Email)) {
			errorsTemp = {
				...errorsTemp,
				emailAddress: t('common.invalidEmail')
			}
		}
		setErrors(errorsTemp);

		if (errorsTemp.cellPhone === '' && errorsTemp.emailAddress === '' && errorsTemp.accessType === '' && errorsTemp.limitedAccess === ''
			&& errorsTemp.firstName === '' && errorsTemp.lastName === ''
		) {
			onConfirm(userDetails)
		}
	}
	const scrollToSection = () => {
		document?.getElementById('permissionAnchor')?.scrollIntoView({ behavior: 'smooth' });
	};

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
				showButtons && <Grid
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
							disabled={true}
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
							disabled={true}
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
					<Grid item md={4} xs={12}></Grid>
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
							value={userDetails?.FirstName}
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
							value={userDetails?.LastName}
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

				<Grid container spacing={2}>
					<Grid item md={12} xs={12}>
						<Box className={clsx(classes.dFlex, classes.spaceBetween, classes.pb10, classes.pt30)}>
							<div className={clsx(classes.f18, classes.bold)}>{t('SubUsers.permissions')}</div>
							<FormControlLabel
								id="permissionAnchor"
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
										checked={userDetails.IsApproved}
										onChange={(e: any) => {
											setUserDetails({
												...userDetails,
												IsApproved: e.target.checked
											})
										}}
									/>
								}
								label={t('common.statusActive')}
							/>
						</Box>
						<Divider className={clsx(classes.mb10, classes.bgBlack)} />
					</Grid>
					<Grid item md={1} xs={1} className={clsx(isRTL && classes.textRight)}>
						<FormControlLabel
							id="permissionAnchor"
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
									onChange={(e: any) => {
										if (e.target.checked) {
											// Checking Admin - set admin permissions, preserve WhatsApp
											const newPermissions = [eSubUserPermissions.AllowSend, eSubUserPermissions.AllowExport, eSubUserPermissions.AllowDelete];
											if (permissions.allowWhatsAppAgent) {
												newPermissions.push(eSubUserPermissions.AllowWhatsAppToAgent);
											}
											setUserDetails({
												...userDetails,
												SubUserPermissions: newPermissions.join(','),
												UserPermissionsList: newPermissions
											})
											setPermissions({
												...permissions,
												accessType: PermissionTypes.Admin,
												allowSending: true,
												allowExport: true,
												allowDeleting: true
											})
										} else {
											// Unchecking Admin - preserve only WhatsApp
											const newPermissions = permissions.allowWhatsAppAgent ? [eSubUserPermissions.AllowWhatsAppToAgent] : [];
											setUserDetails({
												...userDetails,
												SubUserPermissions: newPermissions.join(','),
												UserPermissionsList: newPermissions
											})
											setPermissions({
												...permissions,
												accessType: '',
												allowSending: false,
												allowExport: false,
												allowDeleting: false
											})
										}
									}}
								/>
							}
							label=''
						/>
					</Grid>
					<Grid item md={11} xs={11} className={clsx(classes.pt10, classes.dFlex, classes.alignItemsCenter)}>
						<Typography style={{ marginInline: 10 }}>
							{t('SubUsers.admin')}
						</Typography>
					</Grid>
				</Grid>

				<Grid container>
					<Grid item md={1} xs={1} className={clsx(isRTL && classes.textRight, classes.pt10)}>
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
										scrollToSection();
										if (e.target.checked) {
											// Checking Limited Access - set all three sub-permissions, preserve WhatsApp
											const newPermissions = [eSubUserPermissions.AllowSend, eSubUserPermissions.AllowDelete, eSubUserPermissions.AllowExport];
											if (permissions.allowWhatsAppAgent) {
												newPermissions.push(eSubUserPermissions.AllowWhatsAppToAgent);
											}
											setUserDetails({
												...userDetails,
												SubUserPermissions: newPermissions.join(','),
												UserPermissionsList: newPermissions
											})
											setPermissions({
												...permissions,
												accessType: PermissionTypes.LimitedAccess,
												allowSending: true,
												allowExport: true,
												allowDeleting: true
											})
										}
										else {
											// Unchecking Limited Access - preserve only WhatsApp
											const newPermissions = permissions.allowWhatsAppAgent ? [eSubUserPermissions.AllowWhatsAppToAgent] : [];
											setUserDetails({
												...userDetails,
												SubUserPermissions: newPermissions.join(','),
												UserPermissionsList: newPermissions
											})
											setPermissions({
												...permissions,
												accessType: '',
												allowSending: false,
												allowExport: false,
												allowDeleting: false
											})
										}
									}}
								/>
							}
							label=''
						/>
					</Grid>
					<Grid item md={11} xs={11} className={clsx(classes.pt10, classes.dFlex, classes.alignItemsCenter)}>
						<Typography style={{ marginInline: 10 }}>
							{t('SubUsers.limitedAccess')}
							<Typography className={clsx(errors.limitedAccess ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
								{errors.limitedAccess}
							</Typography>
						</Typography>
					</Grid>
					{
						permissions.accessType === PermissionTypes.LimitedAccess && (
							<>
								<Grid container style={{ marginInline: 55 }}>
									<Grid item md={1} xs={1} className={clsx(classes.textRight, classes.pt10)}>
										<FormControlLabel
											id="permissionAnchor"
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
															const permissionsList = userDetails.UserPermissionsList.filter((x: any) => { return x !== eSubUserPermissions.AllowSend });
															setUserDetails({
																...userDetails,
																UserPermissionsList: permissionsList,
																SubUserPermissions: permissionsList.join(',')
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
									<Grid item md={11} xs={11} className={clsx(classes.pt10, classes.dFlex, classes.alignItemsCenter)} style={{ paddingInline: 10 }}>
										{t('SubUsers.allowSending')}
									</Grid>

								</Grid>

								<Grid container style={{ marginInline: 55 }}>
									<Grid item md={1} xs={1} className={clsx(classes.textRight, classes.pt10)}>
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
															const permissionsList = userDetails.UserPermissionsList.filter((x: any) => { return x !== eSubUserPermissions.AllowExport });
															setUserDetails({
																...userDetails,
																UserPermissionsList: permissionsList,
																SubUserPermissions: permissionsList.join(',')
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
									<Grid item md={11} xs={11} className={clsx(classes.pt10, classes.dFlex, classes.alignItemsCenter)} style={{ paddingInline: 10 }}>
										{t('SubUsers.allowExport')}
									</Grid>
								</Grid>

								<Grid container style={{ marginInline: 55 }}>
									<Grid item md={1} xs={1} className={clsx(classes.textRight, classes.pt10)}>
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
															const permissionsList = userDetails.UserPermissionsList.filter((x: any) => { return x !== eSubUserPermissions.AllowDelete });
															setUserDetails({
																...userDetails,
																UserPermissionsList: permissionsList,
																SubUserPermissions: permissionsList.join(',')
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
									<Grid item md={11} xs={11} className={clsx(classes.pt10, classes.dFlex, classes.alignItemsCenter)} style={{ paddingInline: 10 }}>
										{t('SubUsers.allowDeleting')}
									</Grid>
								</Grid>
							</>
						)
					}
				</Grid>

				<Grid container>
					<Grid item md={1} xs={1} className={clsx(isRTL && classes.textRight, classes.pt10)}>
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
											// Checking ReadOnly - set read-only permission, preserve WhatsApp
											const newPermissions = [eSubUserPermissions.HideRecipients];
											if (permissions.allowWhatsAppAgent) {
												newPermissions.push(eSubUserPermissions.AllowWhatsAppToAgent);
											}
											setUserDetails({
												...userDetails,
												SubUserPermissions: newPermissions.join(','),
												UserPermissionsList: newPermissions
											})
											setPermissions({
												...permissions,
												accessType: PermissionTypes.ReadOnly,
												allowSending: false,
												allowExport: false,
												allowDeleting: false
											})
										}
										else {
											// Unchecking ReadOnly - preserve only WhatsApp
											const newPermissions = permissions.allowWhatsAppAgent ? [eSubUserPermissions.AllowWhatsAppToAgent] : [];
											setUserDetails({
												...userDetails,
												SubUserPermissions: newPermissions.join(','),
												UserPermissionsList: newPermissions
											})
											setPermissions({
												...permissions,
												accessType: ''
											})
										}
									}}
								/>
							}
							label=''
						/>
					</Grid>
					<Grid item md={11} xs={11} className={clsx(classes.pt10, classes.dFlex, classes.alignItemsCenter)}>
						<Typography style={{ marginInline: 10 }}>{t('SubUsers.readOnly')}</Typography>
					</Grid>
				</Grid>

				<UsageCounter
					current={agentCount}
					max={maxServiceAgents}
					labelKey='SubUsers.serviceLimits.agentsLabel'
				/>

				<Grid container>
					<Grid item md={1} xs={1} className={clsx(isRTL && classes.textRight, classes.pt10)}>
						<FormControlLabel
							control={
								<Tooltip
									title={disableAgentToggle ? t('SubUsers.serviceLimits.agentLimitReached') : ''}
									disableHoverListener={!disableAgentToggle}
								>
									<span>
										<PulseemSwitch
											id="whatsapp-agent"
											switchType='ios'
											classes={classes}
											onColor="#0371ad"
											handleDiameter={20}
											boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
											activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
											height={15}
											className={clsx({ [classes.rtlSwitch]: isRTL })}
											checked={permissions.allowWhatsAppAgent}
											disabled={disableAgentToggle}
											onChange={(e: any) => {
												if (e.target.checked) {
													setPermissions({ ...permissions, allowWhatsAppAgent: true });
													setUserDetails({
														...userDetails,
														SubUserPermissions: [...userDetails.UserPermissionsList, eSubUserPermissions.AllowWhatsAppToAgent].join(','),
														UserPermissionsList: [...userDetails.UserPermissionsList, eSubUserPermissions.AllowWhatsAppToAgent]
													})
												} else {
													setPermissions({ ...permissions, allowWhatsAppAgent: false });
													const filteredPermissions = userDetails.UserPermissionsList.filter((x: any) => x !== eSubUserPermissions.AllowWhatsAppToAgent);
													setUserDetails({
														...userDetails,
														SubUserPermissions: filteredPermissions.join(','),
														UserPermissionsList: filteredPermissions
													})
												}
											}}
										/>
									</span>
								</Tooltip>
							}
							label=''
						/>
					</Grid>
					<Grid item md={11} xs={11} className={clsx(classes.pt10, classes.dFlex, classes.alignItemsCenter)}>
						<Typography style={{ marginInline: 10 }}>{t('SubUsers.whatsappAgent')}</Typography>
					</Grid>
				</Grid>

				{agentLimitReached && (
					<UpgradePrompt
						classes={classes}
						messageKey='SubUsers.serviceLimits.agentLimitReached'
					/>
				)}

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