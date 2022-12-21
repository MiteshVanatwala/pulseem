import React, { BaseSyntheticEvent } from 'react';
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Grid,
	IconButton,
	MenuItem,
	TextField,
	Typography,
} from '@material-ui/core';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import CloseIcon from '@material-ui/icons/Close';
import {
	actionProps,
	callToActionFieldProps,
	callToActionRowProps,
} from './WhatsappCreator.types';
import { useTranslation } from 'react-i18next';

const ActionCallPopOver = ({
	isCallToActionOpen,
	closeCallToAction,
	classes,
	callToActionFieldRows,
	setCallToActionFieldRows,
	phoneNumberField,
	websiteField,
	addMore,
	updateTemplateData,
}: actionProps) => {
	const { t: translator } = useTranslation();

	const countryCodes = [
		'+93 AF',
		'+355 AL',
		'+213 DZ',
		'+1-684 AS',
		'+376 AD',
		'+244 AO',
		'+1-264 AI',
		'+672 AQ',
		'+1-268 AG',
		'+54 AR',
		'+374 AM',
		'+297 AW',
		'+61 AU',
		'+43 AT',
		'+994 AZ',
		'+1-242 BS',
		'+973 BH',
		'+880 BD',
		'+1-246 BB',
		'+375 BY',
		'+32 BE',
		'+501 BZ',
		'+229 BJ',
		'+1-441 BM',
		'+975 BT',
		'+591 BO',
		'+387 BA',
		'+267 BW',
		'+55 BR',
		'+673 BN',
		'+359 BG',
		'+226 BF',
		'+257 BI',
		'+855 KH',
		'+237 CM',
		'+1 CA',
		'+238 CV',
		'+1-345 KY',
		'+236 CF',
		'+235 TD',
		'+56 CL',
		'+86 CN',
		'+53 CX',
		'+61 CC',
		'+57 CO',
		'+269 KM',
		'+243 CD',
		'+242 CG',
		'+682 CK',
		'+506 CR',
		'+225 CI',
		'+385 HR',
		'+53 CU',
		'+357 CY',
		'+420 CZ',
		'+45 DK',
		'+253 DJ',
		'+1-767 DM',
		'+1-809 DO',
		'+670 TP',
		'+593  EC',
		'+20 EG',
		'+503 SV',
		'+240 GQ',
		'+291 ER',
		'+372 EE',
		'+251 ET',
		'+500 FK',
		'+298 FO',
		'+679 FJ',
		'+358 FI',
		'+33 FR',
		'+594 GF',
		'+689 PF',
		'+241 GA',
		'+220 GM',
		'+995 GE',
		'+49 DE',
		'+233 GH',
		'+350 GI',
		'+30 GR',
		'+299 GL',
		'+1-473 GD',
		'+590 GP',
		'+1-671 GU',
		'+502 GT',
		'+224 GN',
		'+245 GW',
		'+592 GY',
		'+509 HT',
		'+504 HN',
		'+852 HK',
		'+36 HU',
		'+354 IS',
		'+91 IN',
		'+62 ID',
		'+98 IR',
		'+964 IQ',
		'+353 IE',
		'+972 IL',
		'+39 IT',
		'+1-876 JM',
		'+81 JP',
		'+962 JO',
		'+7 KZ',
		'+254 KE',
		'+686 KI',
		'+850 KP',
		'+82 KR',
		'+965 KW',
		'+996 KG',
		'+856 LA',
		'+371 LV',
		'+961 LB',
		'+266 LS',
		'+231 LR',
		'+218 LY',
		'+423 LI',
		'+370 LT',
		'+352 LU',
		'+853 MO',
		'+389 MK',
		'+261 MG',
		'+265 MW',
		'+60 MY',
		'+960 MV',
		'+223 ML',
		'+356 MT',
		'+692 MH',
		'+596 MQ',
		'+222 MR',
		'+230 MU',
		'+269 YT',
		'+52 MX',
		'+691 FM',
		'+373 MD',
		'+377 MC',
		'+976 MN',
		'+1-664 MS',
		'+212 MA',
		'+258 MZ',
		'+95 MM',
		'+264 NA',
		'+674 NR',
		'+977 NP',
		'+31 NL',
		'+599 AN',
		'+687 NC',
		'+64 NZ',
		'+505 NI',
		'+227 NE',
		'+234 NG',
		'+683 NU',
		'+672 NF',
		'+1-670 MP',
		'+47 NO',
		'+968 OM',
		'+92 PK',
		'+680 PW',
		'+970 PS',
		'+507 PA',
		'+675 PG',
		'+595 PY',
		'+51 PE',
		'+63 PH',
		'+48 PL',
		'+351 PT',
		'+1-787 PR',
		'+974  QA',
		'+262 RE',
		'+40 RO',
		'+7 RU',
		'+250 RW',
		'+290 SH',
		'+1-869 KN',
		'+1-758 LC',
		'+508 PM',
		'+1-784 VC',
		'+685 WS',
		'+378 SM',
		'+239 ST',
		'+966 SA',
		'+221 SN',
		'+248 SC',
		'+232 SL',
		'+65 SG',
		'+421 SK',
		'+386 SI',
		'+677 SB',
		'+252 SO',
		'+27 ZA',
		'+34 ES',
		'+94 LK',
		'+249 SD',
		'+597 SR',
		'+268 SZ',
		'+46 SE',
		'+41 CH',
		'+963 SY',
		'+886 TW',
		'+992 TJ',
		'+255 TZ',
		'+66 TH',
		'+690 TK',
		'+676 TO',
		'+1-868 TT',
		'+216 TN',
		'+90 TR',
		'+993 TM',
		'+1-649 TC',
		'+688 TV',
		'+256 UG',
		'+380 UA',
		'+971 AE',
		'+44 GB',
		'+1 US',
		'+598 UY',
		'+998 UZ',
		'+678 VU',
		'+418 VA',
		'+58 VE',
		'+84 VN',
		'+1-284 VI',
		'+1-340 VQ',
		'+681 WF',
		'+967 YE',
		'+260 ZM',
		'+263 ZW',
	];

	const onTypeOfActionChange = (
		e: BaseSyntheticEvent,
		row: callToActionRowProps
	) => {
		let updatedRows = callToActionFieldRows?.map((r: callToActionRowProps) => {
			if (r.id !== row.id) return r;
			if (e.target.value === 'phonenumber') {
				return {
					...r,
					fields: phoneNumberField,
					typeOfAction: 'phonenumber',
				};
			}
			return { ...r, fields: websiteField, typeOfAction: 'website' };
		});
		setCallToActionFieldRows([...updatedRows]);
	};

	const onTypeOfActionFieldChange = (
		e: BaseSyntheticEvent,
		row: callToActionRowProps,
		field: callToActionFieldProps
	) => {
		let updatedRows: callToActionRowProps[] = callToActionFieldRows?.map(
			(r: callToActionRowProps) => {
				if (r.id !== row.id) return r;
				const updatedFields = r.fields.map((f: callToActionFieldProps) => {
					if (field.fieldName === f.fieldName) {
						if (field.fieldName !== 'Phone Number')
							return { ...f, value: e.target.value };
						return { ...f, value: e.target.value?.replace(/\D/g, '') };
					}
					return f;
				});
				return { ...r, fields: updatedFields };
			}
		);
		setCallToActionFieldRows([...updatedRows]);
	};

	const onDeleteRow = (row: callToActionRowProps) => {
		let updatedRows = callToActionFieldRows.filter(
			(r: callToActionRowProps) => r.id !== row.id
		);
		setCallToActionFieldRows([...updatedRows]);
	};

	const onSubmit = (e: BaseSyntheticEvent) => {
		e.preventDefault();
		setCallToActionFieldRows(callToActionFieldRows);
		updateTemplateData(callToActionFieldRows);
		closeCallToAction(false);
	};

	return (
		<Dialog
			open={isCallToActionOpen}
			onClose={() => closeCallToAction(true)}
			aria-labelledby='form-dialog-title'
			fullWidth
			maxWidth='md'>
			<DialogTitle
				id='form-dialog-title'
				className={classes.callToActionDialogHeaderTitle}>
				<>
					{translator('whatsapp.callToActionTitle')}
					<IconButton
						aria-label='close'
						onClick={() => closeCallToAction(true)}
						className={classes.callToActionDialogClose}>
						<CloseIcon />
					</IconButton>
				</>
			</DialogTitle>
			<DialogContent>
				<DialogContentText
					className={classes.callToActionDialogHeaderDescription}>
					<>{translator('whatsapp.callToActionDialogContentText')}</>
				</DialogContentText>
				<form onSubmit={onSubmit}>
					<Grid container className={classes.callToActionFields} spacing={1}>
						{callToActionFieldRows.map(
							(row: callToActionRowProps, index: number) => (
								<Grid container spacing={3} key={'TOC' + index}>
									<Grid item md={3}>
										<Typography>
											<>{translator('whatsapp.typeOfAction')}</>
										</Typography>
										<TextField
											select
											required
											name='typeofaction'
											placeholder='Enter Your Type Of Action'
											variant='outlined'
											onChange={(e) => onTypeOfActionChange(e, row)}
											value={row.typeOfAction}
											fullWidth>
											<MenuItem value='phonenumber'>
												<>{translator('whatsapp.phoneNumber')}</>
											</MenuItem>
											<MenuItem value='website'>
												<>{translator('whatsapp.website')}</>
											</MenuItem>
										</TextField>
									</Grid>

									{row?.fields.map(
										(field: callToActionFieldProps, fIndex: number) =>
											field.fieldName !== 'Country' ? (
												<Grid item md={3} key={'TOCF' + fIndex}>
													<Typography>{field.fieldName}</Typography>
													<TextField
														required={true}
														type={field.type}
														name={field.fieldName}
														inputProps={
															field.fieldName === 'Phone Number'
																? {
																		maxLength: 20,
																  }
																: field.fieldName === 'Website URL'
																? { maxLength: 2000 }
																: { maxLength: 20 }
														}
														helperText={
															field.fieldName === 'Website URL'
																? `${field.value?.length || 0}/${2000}`
																: `${field.value?.length || 0}/${20}`
														}
														placeholder={field.placeholder}
														variant='outlined'
														onChange={(e) =>
															onTypeOfActionFieldChange(e, row, field)
														}
														value={field.value}
														fullWidth
													/>
												</Grid>
											) : (
												<Grid item md={2} key={'TOCF' + fIndex}>
													<Typography>{field.fieldName}</Typography>
													<TextField
														select
														required
														name={field.fieldName}
														placeholder={field.placeholder}
														variant='outlined'
														onChange={(e) =>
															onTypeOfActionFieldChange(e, row, field)
														}
														value={field.value}
														fullWidth>
														{countryCodes.map((countryCode) => (
															<MenuItem key={countryCode} value={countryCode}>
																{countryCode}
															</MenuItem>
														))}
													</TextField>
												</Grid>
											)
									)}

									<Grid item md={1}>
										<Typography style={{ visibility: 'hidden' }}>
											<>{translator('whatsapp.callToActionRemoveButton')}</>
										</Typography>
										<IconButton
											color='secondary'
											onClick={() => onDeleteRow(row)}>
											<DeleteOutlineIcon />
										</IconButton>
									</Grid>
								</Grid>
							)
						)}
					</Grid>

					<DialogActions>
						{callToActionFieldRows?.length < 2 && (
							<Button variant='contained' color='primary' onClick={addMore}>
								<>{translator('whatsapp.callToActionAddMoreButton')}</>
							</Button>
						)}
						<Button
							type='submit'
							onClick={() => closeCallToAction(true)}
							variant='contained'
							color='secondary'>
							<>{translator('whatsapp.callToActionExitButton')}</>
						</Button>
						<Button
							type='submit'
							disabled={callToActionFieldRows?.length === 0 ? true : false}
							variant='contained'
							style={
								callToActionFieldRows?.length > 0
									? { backgroundColor: 'green', color: 'white' }
									: {}
							}>
							<>{translator('whatsapp.callToActionSaveButton')}</>
						</Button>
					</DialogActions>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default React.memo(ActionCallPopOver);
