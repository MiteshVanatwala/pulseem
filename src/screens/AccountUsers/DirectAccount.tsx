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
import { get, isNull } from 'lodash';
import { AddEditDirectAccounts } from '../../redux/reducers/SubAccountSlice';
import { logout } from '../../helpers/Api/PulseemReactAPI';
import { CommonRedux } from '../Whatsapp/Editor/Types/WhatsappCreator.types';
import { NumberWithMinusRegEx } from '../../helpers/Constants';

const DirectAccount = ({ classes, isOpen = false, onClose, subAccountRecord = {} }: any) => {
	const dispatch: any = useDispatch();
	const { t } = useTranslation();
	const { isRTL  } = useSelector(
		(state: { core: coreProps }) => state.core
	);
	const { isGlobal } = useSelector((state: { common: CommonRedux }) => state.common);
	const [ isLoader, setIsLoader ] = useState<boolean>(false);
	const [ toastMessage, setToastMessage ] = useState(null);
	const [errors, setErrors] = useState({
		companyName: '',
		contactName: '',
		emailAddress: '',
		addEmailBulk: '',
		addSMSBulk: '',
	});
	const [ directAccountDetails, setDirectAccountDetails ] = useState<any>({
		companyName: '',
		contactName: '',
		emailAddress: '',
		telephone: '',
		emailBulk: '',
		SMSBulk: '',
		MMSBulk: '',
		balance: '',
		addEmailBulk: 0,
		addSMSBulk: 0,
		addMMSBulk: 0,
		addBalance: 0
	})
	const CustomGuidEnc = get(subAccountRecord, 'CustomGuidEnc', '');

	useEffect(() => {
		if (isOpen && CustomGuidEnc !== '') {
			setDirectAccountDetails({
				...directAccountDetails,
				companyName: isNull(get(subAccountRecord, 'DirectAccountCompanyName')) ? get(subAccountRecord, 'SubAccountName', '') : get(subAccountRecord, 'DirectAccountCompanyName', ''),
				contactName: get(subAccountRecord, 'DirectAccountContactName', ''),
				emailAddress: isNull(get(subAccountRecord, 'DirectAccountEmail')) ? get(subAccountRecord, 'Email', '') : get(subAccountRecord, 'DirectAccountEmail', ''),
				telephone: get(subAccountRecord, 'DirectAccountTelephone', ''),
				emailBulk: get(subAccountRecord, 'DirectBulkEmails', 0),
				SMSBulk: get(subAccountRecord, 'DirectSMSCredits', 0),
				MMSBulk: get(subAccountRecord, 'DirectMmsCredits', 0),
				addEmailBulk: 0,
				addSMSBulk: 0,
				addMMSBulk: 0,
				addBalance: 0,
			});

			setErrors({
				companyName: '',
				contactName: '',
				emailAddress: '',
				addEmailBulk: '',
				addSMSBulk: ''
			});
		}
	}, [ isOpen ]);

	const showErrorToast = (message: string) => setToastMessage({ severity: 'error', color: 'error', message, showAnimtionCheck: false } as any)

	const getTrimmedEmptyValue = (key: string) => isNull(get(directAccountDetails, key)) ? '' : get(directAccountDetails, key, '').trim();

	const validateForm = () => {
		let errorsTemp = JSON.parse(JSON.stringify(errors))
		errorsTemp = {
			companyName: getTrimmedEmptyValue('companyName') === '' ? t('common.requiredField') : '',
			// contactName: getTrimmedEmptyValue('contactName') === '' ? t('common.requiredField') : '',
			emailAddress: getTrimmedEmptyValue('emailAddress') === '' ? t('common.requiredField') : '',
			addEmailBulk: !NumberWithMinusRegEx.test(directAccountDetails.addEmailBulk) ? t('mainReport.invalidNo') : '',
			addSMSBulk: !NumberWithMinusRegEx.test(directAccountDetails.addSMSBulk) ? t('mainReport.invalidNo') : '',
		};

		if (!ValidateEmailAddress(directAccountDetails.emailAddress)) {
			errorsTemp = {
				...errorsTemp,
				emailAddress: t('common.invalidEmail')
			}
		}

		setErrors(errorsTemp);
		return errorsTemp.companyName === '' && errorsTemp.emailAddress === '' && errorsTemp.addEmailBulk === '' && errors.addSMSBulk === '';
	}
	
	const handleSaveResponse = (statusCode: number) => {
		switch (statusCode) {
			case 0: {
				showErrorToast(t('SubAccount.subAccountNotFound'));
				break;
			}
			case 1: {
				setToastMessage({ severity: 'success', color: 'success', message: t('SubAccount.directAccountSaved'), showAnimtionCheck: false } as any)
				setTimeout(() => {
					onClose(true);
				}, 2000);
				break;
			}
			case 2: {
				showErrorToast(t('SubAccount.directAccountSaveFailed'));
				break;
			}
			case 4: {
				showErrorToast(t('common.invalidEmail'));
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
			case 500:
			default: {
				showErrorToast(t('common.Error'));
				break;
			}
		}
	}

	const saveSubAccountDetils = async () => {
		if (validateForm()) {
			setIsLoader(true);
			//@ts-ignore
			const response = await dispatch(AddEditDirectAccounts({
				CustomGuidEnc,
				CompanyName: directAccountDetails.companyName,
				ContactName: directAccountDetails.contactName,
				Telephone: directAccountDetails.telephone,
				Email: directAccountDetails.emailAddress,
				BulkEmail: Number(directAccountDetails.addEmailBulk),
				SMSCredits: Number(directAccountDetails.addSMSBulk),
				MmsCredits: directAccountDetails.addMMSBulk
			}));
			setIsLoader(false);
			handleSaveResponse(response?.payload?.StatusCode);
			return true;
		}
	}

	const renderToast = () => {
		setTimeout(() => {
			setToastMessage(null);
		}, 2000);
		return <Toast customData={null} data={toastMessage} />;
	};

	const handleKeyPress = (event: any) => {
		if (!event.key.match(NumberWithMinusRegEx) || event.key === 'e') {
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

					{/* <Grid item>
						<Button
							variant='contained'
							size='small'
							onClick={saveSubAccountDetils}
							className={clsx(classes.btn, classes.btnRounded)}
						>
							{t("SubAccount.createAccount")}
						</Button>
					</Grid> */}
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
							id="contactName"
							label=""
							variant="outlined"
							name="contactName"
							value={directAccountDetails.contactName}
							className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
							autoComplete="off"
							onChange={(e: any) => setDirectAccountDetails({
								...directAccountDetails,
								contactName: e.target.value
							})}
						/>
						<Box className='textBoxWrapper'>
							<Typography className={clsx(errors.contactName ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
								{errors.contactName}
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
					</Grid>
				</Grid>

				{
					!isGlobal && (
						<>
							<div className={clsx(classes.f18, classes.bold, classes.pb10, classes.pt30)}>{t('SubAccount.creditDetails')}</div>
							<Divider className={clsx(classes.mb10, classes.bgBlack)} />
						</>
					)
				}
				<Grid container className={clsx(classes.pb15, classes.pt10)} spacing={3}>
					{
						!isGlobal && (
							<>
								<Grid item md={4}>
									{t("SubAccount.emailDirectBalance")}: {directAccountDetails.emailBulk}
								</Grid>
								<Grid item md={4}>
									{t("common.SMS")}: {directAccountDetails.SMSBulk}
								</Grid>
								<Grid item md={4}>
									{/* {t("SubAccount.directAccountMMSCredits")}: {directAccountDetails.MMSBulk} */}
								</Grid>
								<Grid item md={4}>
									<Typography title={t("SubAccount.addBulkEmails")} className={clsx(classes.alignDir)}>
										{t("SubAccount.addBulkEmails")}
									</Typography>
									<TextField
										type="text"
										id="addEmailBulk"
										label=""
										variant="outlined"
										name="addEmailBulk"
										value={directAccountDetails.addEmailBulk}
										className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
										autoComplete="off"
										onChange={(e: any) => {
											if (NumberWithMinusRegEx.test(e.target.value)) {
												setDirectAccountDetails({
													...directAccountDetails,
													addEmailBulk: e.target.value
												})
											}
										}}
										inputProps={{ max: 9999999999 }}
										// onKeyUp={handleKeyPress}
									/>
									<Typography className={clsx(errors.addEmailBulk ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
										{errors.addEmailBulk}
									</Typography>
								</Grid>
								
								<Grid item md={4}>
									<Typography title={t("SubAccount.addSMS")} className={clsx(classes.alignDir)}>
										{t("SubAccount.addSMS")}
									</Typography>
									<TextField
										type="number"
										id="addSMSBulk"
										label=""
										variant="outlined"
										name="addSMSBulk"
										value={directAccountDetails.addSMSBulk}
										className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
										autoComplete="off"
										onChange={(e: any) => {
											if (NumberWithMinusRegEx.test(e.target.value)) {
												setDirectAccountDetails({
													...directAccountDetails,
													addSMSBulk: e.target.value
												})
											}
										}}
										inputProps={{ max: 9999999999 }}
										// onKeyUp={handleKeyPress}
									/>
									<Typography className={clsx(errors.addSMSBulk ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
										{errors.addSMSBulk}
									</Typography>
								</Grid>

								<Grid item md={4}>
									{/* <Typography title={t("SubAccount.addMMS")} className={clsx(classes.alignDir)}>
										{t("SubAccount.addMMS")}
									</Typography>
									<TextField
										type="number"
										id="MMSBulk"
										label=""
										variant="outlined"
										name="MMSBulk"
										value={directAccountDetails.addMMSBulk}
										className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
										autoComplete="off"
										onChange={(e: any) => e.target.value < 0 ? (e.target.value = 0) : setDirectAccountDetails({
											...directAccountDetails,
											addMMSBulk: Math.max(0, parseInt(e.target.value)).toString().slice(0,10)
										})}
										onKeyUp={handleKeyPress}
									/> */}
								</Grid>
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
