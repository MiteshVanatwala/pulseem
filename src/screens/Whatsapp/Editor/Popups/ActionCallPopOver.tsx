import React, {
	BaseSyntheticEvent,
	HtmlHTMLAttributes,
	useEffect,
	useState,
} from 'react';
import {
	Box,
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
	coreProps,
} from '../Types/WhatsappCreator.types';
import { useTranslation } from 'react-i18next';
import { buttonTextLimits, countryCodes } from '../../Constant';
import AlertModal from './AlertModal';
import clsx from 'clsx';
import { Autocomplete } from '@mui/material';
import { useSelector } from 'react-redux';
import ValidationAlert from '../../Campaign/Popups/ValidationAlert';

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
	isEditable,
	buttonType,
	templateText,
}: actionProps) => {
	const { t: translator } = useTranslation();
	const { isRTL } = useSelector((state: { core: coreProps }) => state.core);
	const [isTextLimitAlert, setIsTextLimitAlert] = useState(false);
	const [autoCompleteOptions, setAutoCompleteOptions] = useState<string[]>([]);
	const [validationErrors, setValidationErrors] = useState<string[]>([]);
	const [isValidationAlert, setIsValidationAlert] = useState<boolean>(false);

	useEffect(() => {
		const autoCompleteList = countryCodes?.map((country) => {
			return '+' + country?.replace(/\D/g, '');
		});
		setAutoCompleteOptions(autoCompleteList);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [countryCodes]);

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
		value: string,
		row: callToActionRowProps,
		field: callToActionFieldProps
	) => {
		let updatedRows: callToActionRowProps[] = callToActionFieldRows?.map(
			(r: callToActionRowProps) => {
				if (r.id !== row.id) return r;
				const updatedFields = r.fields.map((f: callToActionFieldProps) => {
					if (field.fieldName === f.fieldName) {
						if (field.fieldName !== 'whatsapp.phoneNumber')
							return { ...f, value: value?.replace(/_/g, '') };
						return { ...f, value: value?.replace(/\D/g, '') };
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

	const onSubmit = () => {
		if (templateText?.length >= buttonTextLimits.callToAction) {
			setIsTextLimitAlert(true);
		} else {
			setCallToActionFieldRows(callToActionFieldRows);
			updateTemplateData(callToActionFieldRows);
			closeCallToAction(false);
		}
	};

	const onConfirmTextLimit = () => {
		setIsTextLimitAlert(false);
		setCallToActionFieldRows(callToActionFieldRows);
		updateTemplateData(callToActionFieldRows);
		closeCallToAction(false);
	};

	const onCancelTextLimit = () => {
		setIsTextLimitAlert(false);
		closeCallToAction(true);
	};

	const renderOptions = (
		props: HtmlHTMLAttributes<HTMLElement>,
		option: string,
		fIndex: number
	) => {
		return (
			<Box
				component='li'
				{...props}
				key={fIndex + '_' + option}
				title={option}
				style={{ direction: isRTL ? 'rtl' : 'ltr', maxWidth: '100%' }}>
				{option}
			</Box>
		);
	};

	const validateFields = () => {
		let isValidated: boolean = true;
		let erros: string[] = [];
		callToActionFieldRows.forEach((callToActionRow) => {
			if (callToActionRow.typeOfAction === 'phonenumber') {
				callToActionRow?.fields?.forEach((callToActionField) => {
					if (
						callToActionField?.fieldName?.includes('phoneButtonText') &&
						callToActionField?.value?.length === 0
					) {
						isValidated = false;
						erros.push(translator('whatsapp.alertModal.buttonTextError'));
					}
					if (
						callToActionField?.fieldName?.includes('country') &&
						callToActionField?.value?.length === 0
					) {
						isValidated = false;
						erros.push(translator('whatsapp.alertModal.countryCodeError'));
					}
					if (callToActionField?.fieldName?.includes('phoneNumber')) {
						if (callToActionField?.value?.length === 0) {
							isValidated = false;
							erros.push(translator('whatsapp.alertModal.phoneNumberError'));
						} else if (
							callToActionField?.value?.length < 9 ||
							callToActionField?.value?.length > 16
						) {
							isValidated = false;
							erros.push(
								translator('whatsapp.alertModal.phoneNumberRangeError')
							);
						}
					}
				});
			}
			if (callToActionRow.typeOfAction === 'website') {
				callToActionRow?.fields?.forEach((callToActionField) => {
					if (
						callToActionField?.fieldName?.includes('websiteButtonText') &&
						callToActionField?.value?.length === 0
					) {
						isValidated = false;
						erros.push(translator('whatsapp.alertModal.buttonTextError'));
					}
					if (
						callToActionField?.fieldName?.includes('websiteURL') &&
						callToActionField?.value?.length === 0
					) {
						isValidated = false;
						erros.push(translator('whatsapp.alertModal.websiteTextError'));
					}
				});
			}
		});
		if (!isValidated) {
			setValidationErrors(erros);
			setIsValidationAlert(true);
		}
		return isValidated;
	};

	const onButtonSubmit = () => {
		if (validateFields()) {
			onSubmit();
		}
	};

	const isMenuItemDisabled = (
		item: string,
		currentRow: callToActionRowProps
	) => {
		let isDisabled: boolean = false;
		callToActionFieldRows.forEach((row) => {
			if (currentRow.id !== row.id) {
				row?.fields?.forEach((field) => {
					if (
						item === 'phonenumber' &&
						field.fieldName === 'whatsapp.phoneButtonText'
					) {
						isDisabled = true;
					}
					if (
						item === 'website' &&
						field.fieldName === 'whatsapp.websiteButtonText'
					) {
						isDisabled = true;
					}
				});
			}
		});
		return isDisabled;
	};

	return (
		<>
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
						<>{translator('whatsapp.callToActionTitle')}</>
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
					<form>
						<Grid container className={classes.callToActionFields} spacing={1}>
							{callToActionFieldRows.map(
								(row: callToActionRowProps, index: number) => (
									<Grid container spacing={3} key={'TOC' + index}>
										<Grid item xs={12} sm={6} md={3}>
											<Typography>
												<>{translator('whatsapp.typeOfAction')}</>
											</Typography>
											<TextField
												disabled={!isEditable}
												select
												required
												name='typeofaction'
												placeholder='Enter Your Type Of Action'
												variant='outlined'
												onChange={(e) => onTypeOfActionChange(e, row)}
												value={row.typeOfAction}
												fullWidth>
												<MenuItem
													value='phonenumber'
													disabled={isMenuItemDisabled('phonenumber', row)}>
													<>{translator('whatsapp.phoneNumber')}</>
												</MenuItem>
												<MenuItem
													value='website'
													disabled={isMenuItemDisabled('website', row)}>
													<>{translator('whatsapp.website')}</>
												</MenuItem>
											</TextField>
										</Grid>

										{row?.fields.map(
											(field: callToActionFieldProps, fIndex: number) =>
												field.type !== 'select' ? (
													<Grid
														item
														xs={12}
														sm={6}
														md={3}
														key={'TOCF' + fIndex}>
														<Typography>
															<>{translator(field?.fieldName)}</>
														</Typography>
														<TextField
															disabled={!isEditable}
															required={true}
															type={field.type}
															name={field.fieldName}
															inputProps={
																field.fieldName === 'whatsapp.phoneNumber'
																	? {
																			maxLength: 20,
																	  }
																	: field.fieldName === 'whatsapp.websiteURL'
																	? { maxLength: 2000 }
																	: { maxLength: 20 }
															}
															helperText={
																field.fieldName === 'whatsapp.websiteURL'
																	? `${field.value?.length || 0}/${2000}`
																	: `${field.value?.length || 0}/${20}`
															}
															placeholder={translator(field.placeholder)}
															variant='outlined'
															onChange={(e) =>
																onTypeOfActionFieldChange(
																	e.target.value,
																	row,
																	field
																)
															}
															value={field.value}
															fullWidth
														/>
													</Grid>
												) : (
													<Grid
														item
														xs={12}
														sm={6}
														md={2}
														key={'TOCF' + fIndex}>
														<Typography>
															<>{translator(field?.fieldName)}</>
														</Typography>
														<Autocomplete
															id='template-list'
															className={clsx(
																classes.buttonField,
																classes.buttonWhatsappAutocomplete,
																classes.buttonCallToActionAutocomplete
															)}
															options={autoCompleteOptions}
															renderOption={(props, options) =>
																renderOptions(props, options, fIndex)
															}
															style={{ direction: isRTL ? 'rtl' : 'ltr' }}
															// @ts-ignore
															renderInput={(params) => (<TextField {...params} />)}
															onChange={(_e, value) =>
																onTypeOfActionFieldChange(value!, row, field)
															}
															value={field.value}
															disabled={!isEditable}
														/>
														{/* <TextField
															disabled={!isEditable}
															select
															required
															name={field.fieldName}
															placeholder={translator(field.placeholder)}
															variant='outlined'
															onChange={(e) =>
																onTypeOfActionFieldChange(e, row, field)
															}
															value={field.value}
															fullWidth>
															{countryCodes.map((countryCode) => (
																<MenuItem
																	key={countryCode}
																	value={'+' + countryCode?.replace(/\D/g, '')}>
																	{countryCode}
																</MenuItem>
															))}
														</TextField> */}
													</Grid>
												)
										)}
										{isEditable && (
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
										)}
									</Grid>
								)
							)}
						</Grid>

						<DialogActions>
							{callToActionFieldRows?.length < 2 && (
								<Button variant='contained' color='primary' onClick={addMore}>
									<>{translator('whatsapp.quickReply.addMore')}</>
								</Button>
							)}
							<Button
								onClick={() => closeCallToAction(true)}
								variant='contained'
								color='secondary'>
								<>{translator('whatsapp.callToActionExitButton')}</>
							</Button>
							{isEditable && (
								<Button
									onClick={onButtonSubmit}
									disabled={callToActionFieldRows?.length === 0 ? true : false}
									variant='contained'
									style={
										callToActionFieldRows?.length > 0
											? { backgroundColor: 'green', color: 'white' }
											: {}
									}>
									<>{translator('whatsapp.callToActionSaveButton')}</>
								</Button>
							)}
						</DialogActions>
					</form>
				</DialogContent>
			</Dialog>

			<AlertModal
				classes={classes}
				isOpen={isTextLimitAlert}
				onClose={() => onCancelTextLimit()}
				title={''}
				subtitle={translator('whatsapp.template.textLimitAlertDesc')}
				type='delete'
				onConfirmOrYes={() => onConfirmTextLimit()}
			/>

			<ValidationAlert
				classes={classes}
				isOpen={isValidationAlert}
				onClose={() => setIsValidationAlert(false)}
				title={translator('whatsappCampaign.sendValidation')}
				requiredFields={validationErrors}
			/>
		</>
	);
};

export default React.memo(ActionCallPopOver);
