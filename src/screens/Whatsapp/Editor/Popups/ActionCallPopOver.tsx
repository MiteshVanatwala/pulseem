import React, { BaseSyntheticEvent, useState } from 'react';
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
} from '../Types/WhatsappCreator.types';
import { useTranslation } from 'react-i18next';
import { buttonTextLimits, countryCodes } from '../../Constant';
import AlertModal from './AlertModal';

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
	const [isTextLimitAlert, setIsTextLimitAlert] = useState(false);
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
						if (field.fieldName !== 'whatsapp.phoneNumber')
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
												disabled={!isEditable}
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
												field.type !== 'select' ? (
													<Grid item md={3} key={'TOCF' + fIndex}>
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
																onTypeOfActionFieldChange(e, row, field)
															}
															value={field.value}
															fullWidth
														/>
													</Grid>
												) : (
													<Grid item md={2} key={'TOCF' + fIndex}>
														<Typography>
															<>{translator(field?.fieldName)}</>
														</Typography>
														<TextField
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
														</TextField>
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
								type='submit'
								onClick={() => closeCallToAction(true)}
								variant='contained'
								color='secondary'>
								<>{translator('whatsapp.callToActionExitButton')}</>
							</Button>
							{isEditable && (
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
							)}
						</DialogActions>
					</form>
				</DialogContent>
			</Dialog>

			<AlertModal
				classes={classes}
				isOpen={isTextLimitAlert}
				onClose={() => onCancelTextLimit()}
				title={translator('whatsapp.template.textLimitAlert')}
				subtitle={translator('whatsapp.template.textLimitAlertDesc')}
				type='delete'
				onConfirmOrYes={() => onConfirmTextLimit()}
			/>
		</>
	);
};

export default React.memo(ActionCallPopOver);
