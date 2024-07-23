import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Box, Button, Divider, Grid, TextField, Typography } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { Loader } from '../../components/Loader/Loader';
import Toast from '../../components/Toast/Toast.component';
import { coreProps } from '../../model/Core/corePros.types';
import { BaseDialog } from '../../components/DialogTemplates/BaseDialog';
import { ValidateEmailAddress } from '../../helpers/Utils/common';

const DirectAccount = ({ classes, isOpen = false, onClose }: any) => {
	const dispatch: any = useDispatch();
	const { t } = useTranslation();
	const { isRTL  } = useSelector(
		(state: { core: coreProps }) => state.core
	);
	const { isGlobal } = useSelector((state: any) => state.subAccount);
	const [ isLoader, setIsLoader ] = useState<boolean>(false);
	const [ toastMessage, setToastMessage ] = useState(null);
	const [errors, setErrors] = useState({
		companyName: '',
		contactNumber: '',
		emailAddress: '',
		telephone: ''
	});
	const [ directAccountDetails, setDirectAccountDetails ] = useState<any>({
		companyName: '',
		contactNumber: '',
		emailAddress: '',
		telephone: '',
		emailBulk: '',
		SMSBulk: '',
		MMSBulk: '',
		balance: '',
		addEmailBulk: 0,
		addSMSBulk: 0,
		addMMSBulk: 0,
		addBalance: 0,
		lastEmailBulkAddedOn: '',
		lastSMSBulkAddedOn: '',
		lastMMSBulkAddedOn: '',
		lastBalanceBulkAddedOn: '',
	})

	useEffect(() => {
	}, []);

	const validateForm = () => {
		let errorsTemp = JSON.parse(JSON.stringify(errors))
		errorsTemp = {
			companyName: directAccountDetails.companyName.trim() === '' ? t('common.requiredField') : '',
			contactNumber: directAccountDetails.contactNumber.trim() === '' ? t('common.requiredField') : '',
			emailAddress: directAccountDetails.emailAddress.trim() === '' ? t('common.requiredField') : '',
			telephone: directAccountDetails.telephone.trim() === '' ? t('common.requiredField') : ''
		};

		if (!ValidateEmailAddress(directAccountDetails.emailAddress)) {
			errorsTemp = {
				...errorsTemp,
				emailAddress: t('common.invalidEmail')
			}
		}

		setErrors(errorsTemp);
		return errorsTemp.companyName === '' || errorsTemp.contactNumber === '' && errorsTemp.emailAddress === '' && errorsTemp.telephone === '';
	}

	const saveSubAccountDetils = () => {
		if (validateForm()) {
			//@ts-ignore
			// const response = await dispatch(saveLandingPage(subAccountDetails));
			// handleSaveResponse(response?.payload, redirectToNewEditor);
			setIsLoader(false);
			return true;
		} else {
			// setDialogType({ type: 'validationDialog' })
		}
	}

	const renderToast = () => {
		setTimeout(() => {
			setToastMessage(null);
		}, 2000);
		return <Toast customData={null} data={toastMessage} />;
	};

	const handleKeyPress = (event: any) => {
    var isNumber = /^[0-9]*$/;
    if (!event.key.match(isNumber) || event.key === 'e' || event.key === '.') {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }

	return (
		<BaseDialog
			classes={classes}
			open={isOpen}
			title={t('SubAccount.directAccount')}
			icon={<div className={classes.dialogIconContent}>
				{'\uE0D5'}
			</div>}
			showDivider={false}
			onClose={onClose}
			onCancel={onClose}
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
							onClick={onClose}
							className={clsx(classes.btn, classes.btnRounded)}
						>
							{t("common.cancel")}
						</Button>
					</Grid>

					<Grid item>
						<Button
							variant='contained'
							size='small'
							onClick={saveSubAccountDetils}
							className={clsx(classes.btn, classes.btnRounded)}
						>
							{t("SubAccount.createAccount")}
						</Button>
					</Grid>
				</Grid>
			)}
		>
			<>
				<div className={clsx(classes.f18, classes.bold, classes.pb10, classes.pt10)}>{t('SubAccount.accountDetails')}</div>
				<Divider className={clsx(classes.mb10, classes.bgBlack)} />
				<Grid container className={clsx(classes.pb15)} spacing={3}>
					<Grid item md={4}>
						<Typography title={t("SubAccount.subAccountName")} className={classes.alignDir}>
							{t("common.companyName")}
						</Typography>
						<TextField
							id="companyName"
							label=""
							variant="outlined"
							name="companyName"
							value={directAccountDetails.companyName}
							className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
							autoComplete="off"
							onChange={(e: any) => setDirectAccountDetails({
								...directAccountDetails,
								companyName: e.target.value.trim()
							})}
						/>
						<Box className='textBoxWrapper'>
							<Typography className={clsx(errors.companyName ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
								{errors.companyName}
							</Typography>
						</Box>
					</Grid>
					<Grid item md={4}>
						<Typography title={t("SubAccount.contactName")} className={classes.alignDir}>
							{t("SubAccount.contactName")}
						</Typography>
						<TextField
							id="contactNumber"
							label=""
							variant="outlined"
							name="contactNumber"
							value={directAccountDetails.contactNumber}
							className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
							autoComplete="off"
							onChange={(e: any) => setDirectAccountDetails({
								...directAccountDetails,
								contantNumber: e.target.value.trim()
							})}
						/>
						<Box className='textBoxWrapper'>
							<Typography className={clsx(errors.contactNumber ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
								{errors.contactNumber}
							</Typography>
						</Box>
					</Grid>

					<Grid item md={4}>
						<Typography title={t("common.Email")} className={classes.alignDir}>
							{t("common.Email")}
						</Typography>
						<TextField
							id="emailAddress"
							label=""
							variant="outlined"
							name="emailAddress"
							value={directAccountDetails.emailAddress}
							className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
							autoComplete="off"
							onChange={(e: any) => setDirectAccountDetails({
								...directAccountDetails,
								emailAddress: e.target.value.trim()
							})}
						/>
						<Typography className={clsx(errors.emailAddress ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
							{errors.emailAddress}
						</Typography>
					</Grid>

					<Grid item md={4}>
						<Typography title={t("common.telephone")} className={classes.alignDir}>
							{t("common.telephone")}
						</Typography>
						<TextField
							id="telephone"
							label=""
							variant="outlined"
							name="telephone"
							value={directAccountDetails.telephone}
							className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
							autoComplete="off"
							onChange={(e: any) => setDirectAccountDetails({
								...directAccountDetails,
								telephone: e.target.value.trim()
							})}
						/>
						<Typography className={clsx(errors.telephone ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
							{errors.telephone}
						</Typography>
					</Grid>
				</Grid>

				<div className={clsx(classes.f18, classes.bold, classes.pb10, classes.pt30)}>{t('SubAccount.creditDetails')}</div>
				<Divider className={clsx(classes.mb10, classes.bgBlack)} />
				<Grid container className={clsx(classes.pb15, classes.pt10)} spacing={3}>
					{
						!isGlobal && (
							<>
								<Grid item md={4}>
									{t("SubAccount.emailBulk")}: {directAccountDetails.emailBulk}
								</Grid>
								<Grid item md={4}>
									{t("SubAccount.SMSBulk")}: {directAccountDetails.SMSBulk}
								</Grid>
								<Grid item md={4}>
									{t("SubAccount.MMSBulk")}: {directAccountDetails.MMSBulk}
								</Grid>
								<Grid item md={4}>
									<Typography title={t("SubAccount.addBulkEmails")} className={clsx(classes.alignDir)}>
										{t("SubAccount.addBulkEmails")}
									</Typography>
									<TextField
										id="addEmailBulk"
										label=""
										variant="outlined"
										name="addEmailBulk"
										value={directAccountDetails.addEmailBulk}
										className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
										autoComplete="off"
										onChange={(e: any) => setDirectAccountDetails({
											...directAccountDetails,
											addEmailBulk: e.target.value.trim()
										})}
										onKeyPress={handleKeyPress}
									/>
								</Grid>
								
								<Grid item md={4}>
									<Typography title={t("SubAccount.addSMS")} className={clsx(classes.alignDir)}>
										{t("SubAccount.addSMS")}
									</Typography>
									<TextField
										id="addSMSBulk"
										label=""
										variant="outlined"
										name="addSMSBulk"
										value={directAccountDetails.addSMSBulk}
										className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
										autoComplete="off"
										onChange={(e: any) => setDirectAccountDetails({
											...directAccountDetails,
											addSMSBulk: e.target.value.trim()
										})}
										onKeyPress={handleKeyPress}
									/>
								</Grid>

								<Grid item md={4}>
									<Typography title={t("SubAccount.addMMS")} className={clsx(classes.alignDir)}>
										{t("SubAccount.addMMS")}
									</Typography>
									<TextField
										id="MMSBulk"
										label=""
										variant="outlined"
										name="MMSBulk"
										value={directAccountDetails.MMSBulk}
										className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
										autoComplete="off"
										onChange={(e: any) => setDirectAccountDetails({
											...directAccountDetails,
											MMSBulk: e.target.value.trim()
										})}
										onKeyPress={handleKeyPress}
									/>
								</Grid>

								<Grid item md={4} className={clsx(classes.f14, classes.pt0)}>
									{t("SubAccount.lastEmailBulkAdded")}: {directAccountDetails.lastEmailBulkAddedOn}
								</Grid>
								<Grid item md={4} className={clsx(classes.f14, classes.pt0)}>
									{t("SubAccount.lastSMSBulkAdded")}: {directAccountDetails.lastSMSBulkAddedOn}
								</Grid>
								<Grid item md={4} className={clsx(classes.f14, classes.pt0)}>
									{t("SubAccount.lastMMSBulkAdded")}: {directAccountDetails.lastMMSBulkAddedOn}
								</Grid>
							</>
						)
					}
					
					{
						isGlobal && (
							<>
								<Grid item md={4}>
									{t("SubAccount.balance")}: {directAccountDetails.balance}
								</Grid>
								<Grid item md={8}></Grid>

								<Grid item md={4}>
									<Typography title={t("SubAccount.balance")} className={clsx(classes.alignDir)}>
										{t("SubAccount.balance")}
									</Typography>
									<TextField
										id="addBalance"
										label=""
										variant="outlined"
										name="addBalance"
										value={directAccountDetails.addBalance}
										className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
										autoComplete="off"
										onChange={(e: any) => setDirectAccountDetails({
											...directAccountDetails,
											addBalance: e.target.value.trim()
										})}
										onKeyPress={handleKeyPress}
									/>
								</Grid>
								<Grid item md={8}></Grid>

								<Grid item md={4} className={clsx(classes.f14, classes.pt0)}>
									{t("SubAccount.lastBalanceAdded")}: {directAccountDetails.lastBalanceBulkAddedOn}
								</Grid>
								<Grid item md={8}></Grid>
							</>
						)
					}
				</Grid>

				<Loader isOpen={isLoader} />
				{toastMessage && renderToast()}
			</>
		</BaseDialog>
	);
};

export default DirectAccount;
