import React, { useState, useEffect, BaseSyntheticEvent } from 'react';
import {
	Box,
	Button,
	FormControlLabel,
	Grid,
	MenuItem,
	OutlinedInput,
	Radio,
	RadioGroup,
	Select,
	TextField,
	Typography,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { Title } from '../../../components/managment/Title';
import { AccDtlPropTypes } from '../../../Models/Settings/AccountDetails';
import useCore from '../../../helpers/hooks/Core';
import { IsNumberField } from '../../../helpers/Utils/Validations';
import { AccountSettings } from '../../../Models/Account/AccountSettings';
import { tierSetting } from '../../Whatsapp/Constant';

const FORM_ACCOUNT_DETAILS = ({
	setToastMessage,
	ToastMessages,
	Settings,
	OnUpdate,
	selectedTier,
  onTierChange
}: AccDtlPropTypes) => {
	const { t } = useTranslation();
	const { classes } = useCore();
	const { isRTL } = useSelector((state: any) => state.core);
	const dispatch = useDispatch();

	const [accountDetails, setAccountDetails] = useState<AccountSettings | null>({
		DefaultFromMail: '',
		DefaultFromName: '',
		DefaultCellNumber: '',
		UnsubscribeType: false,
		IsSmsImmediateUnsubscribeLink: false,
	} as AccountSettings);

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

	return (
		<Box
			style={{ marginTop: 10, paddingInline: 15 }}
			className={'settingsWrapper'}>
			<Title
				Text={t('settings.accountSettings.actDetails.title')}
				Classes={classes}
				ContainerStyle={undefined}
				Element={null}
			/>
			<Box className={'formContainer'}>
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
						<Grid item xs={12} sm={6} md={8} className={'textBoxWrapper'}>
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
              <Typography>
								<>
									{t(
										'settings.accountSettings.actDetails.fields.checkTier'
									)}
								</>
							</Typography>
						</Grid>
						<Grid item xs={12} sm={6} md={8} className={'textBoxWrapper'}>
							<Select
								native
								MenuProps={{
									PaperProps: {
										style: {
											maxHeight: 40,
										},
									},
								}}
								input={<OutlinedInput />}
								inputProps={{
									'aria-label': 'Without label',
									style: {
										padding: 10,
										maxWidth: 210,
										paddingInlineStart: 15,
									},
								}}
								autoWidth
								value={selectedTier}
								name='TwoFactorAuthOptionID'
								onChange={(e: BaseSyntheticEvent) =>
									onTierChange(e.target.value)
								}>
								{tierSetting?.map((tier, index) => {
									return (
										<option
											key={index}
											value={tier.value}
											className={classes.dropDownItem}>
											{t(tier.name)}
										</option>
									);
								})}
							</Select>
						</Grid>

						<Grid item xs={12} className={classes.justifyContentEnd}>
							<Button
								variant='contained'
								size='medium'
								onClick={handleSave}
								endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
								className={clsx(
									classes.mt5,
									classes.actionButton,
									classes.actionButtonLightGreen
								)}>
								{/* @ts-ignore */}
								{t('settings.accountSettings.actDetails.btnUpdate')}
							</Button>
						</Grid>
					</Grid>
				</Grid>
			</Box>
		</Box>
	);
};
export default FORM_ACCOUNT_DETAILS;
