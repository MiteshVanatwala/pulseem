import React, {
	BaseSyntheticEvent,
	HtmlHTMLAttributes,
	useEffect,
	useState,
} from 'react';
import {
	Box,
	Button,
	DialogActions,
	DialogContentText,
	FormGroup,
	Grid,
	IconButton,
	MenuItem,
	Switch,
	TextField,
	Typography
} from '@material-ui/core';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import {
	actionProps,
	callToActionFieldProps,
	callToActionRowProps,
	coreProps,
} from '../Types/WhatsappCreator.types';
import { useTranslation } from 'react-i18next';
import { buttonTextLimits, countryCodes } from '../../Constant';
import clsx from 'clsx';
import { Autocomplete } from '@mui/material';
import { useSelector } from 'react-redux';
import { AiOutlinePlusCircle } from 'react-icons/ai';
import { BaseDialog } from '../../../../components/DialogTemplates/BaseDialog';

const ActionCallPopOver = ({
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
	const { windowSize, isRTL } = useSelector((state: { core: coreProps }) => state.core);
	const [autoCompleteOptions, setAutoCompleteOptions] = useState<string[]>([]);
	const [validationErrors, setValidationErrors] = useState<string[]>([]);
	const [dialogType, setDialogType] = useState<any>({
		type: ''
	});

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
					if (field?.fieldName === f?.fieldName) {
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
			setDialogType({
				type: 'limit'
			});
		} else {
			setCallToActionFieldRows(callToActionFieldRows);
			updateTemplateData(callToActionFieldRows);
			closeCallToAction(false);
		}
	};

	const onConfirmTextLimit = () => {
		setCallToActionFieldRows(callToActionFieldRows);
		updateTemplateData(callToActionFieldRows);
		closeCallToAction(false);
	};

	const onCancelTextLimit = () => {
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
			setDialogType({
				type: 'validation'
			});
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

	const getValidationDialog = () => ({
		title: translator('whatsappCampaign.sendValidation'),
		showDivider: false,
		content: (
			<ul className={clsx(classes.noMargin, classes.mb20)}>
				{validationErrors?.map((requiredField: string, index: number) => (
					<li key={index} className={classes.validationAlertModalLi}>
						{requiredField}
					</li>
				))}
			</ul>
		),
		onConfirm: async () => {
			setDialogType({
				type: '',
				data: ''
			});
		}
	})

	const getLimitDialog = () => ({
		title: '',
		showDivider: false,
		content: (
			<Typography style={{ fontSize: 18 }} className={clsx(classes.textCenter)}>
				{translator('whatsapp.template.textLimitAlertDesc')}
			</Typography>
		),
		onConfirm: async () => {
			setDialogType({
				type: '',
				data: ''
			});
			onConfirmTextLimit();
		},
	})

	const renderDialog = () => {
		const { data, type } = dialogType || {}
		let currentDialog: any = {};
		if (type === 'limit') {
			currentDialog = getLimitDialog();
		} else if (type === 'validation') {
			currentDialog = getValidationDialog();
		}

		if (type) {
			return (
				dialogType && <BaseDialog
					classes={classes}
					open={dialogType}
					onCancel={() => setDialogType({})}
					onClose={() => setDialogType({})}
					renderButtons={currentDialog?.renderButtons || null}
					{...currentDialog}>
					{currentDialog?.content}
				</BaseDialog>
			)
		}
	}

	return (
		<>
			<DialogContentText
				className={clsx(classes.callToActionDialogHeaderDescription, classes.f16, classes.pb15)}>
				<>{translator('whatsapp.callToActionDialogContentText')}</>
			</DialogContentText>
			<form>
				<Grid container className={classes.callToActionFields}>
					{callToActionFieldRows.map(
						(row: callToActionRowProps, index: number) => (
							<Grid container spacing={3} key={'TOC' + index} className={classes.noMargin}>
								<Grid item xs={12} sm={6} md={2}>
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
									 field.type && (field.type !== 'select' ? (
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
													renderInput={(params: any) => (
														<TextField {...params} />
													)}
													onChange={(_e, value) =>
														onTypeOfActionFieldChange(value!, row, field)
													}
													value={field.value}
													disabled={!isEditable}
												/>
											</Grid>
										)
								))}
								{
									row.typeOfAction === 'website' && (
										<Grid
											item
											xs={12}
											sm={6}
											md={3}
										>
											<Box className={clsx(classes.dFlex)}>
												<FormGroup>
													<Switch
														disabled={!isEditable}
														className={
															isRTL
																? clsx(
																		classes.reactSwitchHe,
																		'react-switch',
																		'dynamic-link-switch'
																	)
																: clsx(
																		classes.reactSwitch,
																		'react-switch',
																		'dynamic-link-switch'
																	)
														}
														checked={row?.fields.length>1 && row?.fields[2]?.value === 'true'}
														onChange={() => onTypeOfActionFieldChange(
															`${row?.fields[2]?.value === 'true' ? 'false' : 'true'}`,
															row,
															row?.fields[2]
														)}
													/>
												</FormGroup>
												<Box>
													<Typography className='keep-track'>{translator('mainReport.keepTrack')}</Typography>
												</Box>
											</Box>
											<Box>
												<Typography className='keep-track-desc'>{translator('mainReport.keepDesc')}</Typography>
											</Box>
										</Grid>
									)
								}
								{isEditable && (
									<Grid item md={1} xs={12} style={{ textAlign: isRTL ? 'left': 'right' }}>
										<IconButton
											color='secondary'
											onClick={() => onDeleteRow(row)}
											className={ windowSize !== 'xs' ? classes.mt24 : ''}
										>
											<DeleteOutlineIcon />
										</IconButton>
									</Grid>
								)}
							</Grid>
						)
					)}
				</Grid>

			<DialogActions className={classes.pt50}>
					<Grid container>
						<Grid item md={6} xs={6}>
							{callToActionFieldRows?.length < 2 && (
								<Button
									disabled={!isEditable}
									variant='contained'
									onClick={addMore}
									className={clsx(classes.btn, classes.btnRounded, classes.mt10)}
								>
									<AiOutlinePlusCircle className={clsx(classes.mr10, classes.f18)} />
									{translator('whatsapp.quickReply.addMore')}
								</Button>
							)}
						</Grid>

						<Grid item className={clsx(classes.justifyContentEnd)} md={6} xs={6}>
							<Button
								onClick={() => closeCallToAction(true)}
								variant='contained'
								color='secondary'
								className={clsx(classes.btn, classes.btnRounded, classes.mlr10, classes.mt10)}
							>
								{translator('whatsapp.callToActionExitButton')}
							</Button>
							{isEditable && (
								<Button
									onClick={onButtonSubmit}
									disabled={callToActionFieldRows?.length === 0 ? true : false}
									variant='contained'
									className={clsx(classes.btn, classes.btnRounded, classes.redButton, classes.mt10)}
								>
									{translator('whatsapp.callToActionSaveButton')}
								</Button>
							)}
						</Grid>
					</Grid>
				</DialogActions>
			</form>
			{renderDialog()}
		</>
	);
};

export default React.memo(ActionCallPopOver);
