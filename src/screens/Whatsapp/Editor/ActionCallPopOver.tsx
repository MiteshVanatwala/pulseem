import React, { BaseSyntheticEvent, useState, useMemo } from 'react';
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
  updateTemplateData
}: actionProps) => {
	const { t: translator } = useTranslation();

	const onTypeOfActionChange = (
		e: BaseSyntheticEvent,
		row: callToActionRowProps
	) => {
		console.log('onTypeOfActionChange::e::', e);
		console.log('onTypeOfActionChange::row::', row);
		let updatedRows = callToActionFieldRows?.map((r: callToActionRowProps) => {
			if (r.id === row.id) {
				if (e.target.value === 'phonenumber') {
					return {
						...r,
						fields: phoneNumberField,
						typeOfAction: 'phonenumber',
					};
				}
				return { ...r, fields: websiteField, typeOfAction: 'website' };
			}
			return r;
		});
		console.log('onTypeOfActionChange::updatedRows::', updatedRows);
		setCallToActionFieldRows([...updatedRows]);
	};

	const onTypeOfActionFieldChange = (
		e: BaseSyntheticEvent,
		row: callToActionRowProps,
		field: callToActionFieldProps
	) => {
		let updatedRows: callToActionRowProps[] = callToActionFieldRows?.map(
			(r: callToActionRowProps) => {
				if (r.id === row.id) {
					const updatedFields = r.fields.map((f: callToActionFieldProps) => {
						if (field.fieldName === f.fieldName) {
							return { ...f, value: e.target.value };
						}
						return f;
					});
					return { ...r, fields: updatedFields };
				}
				return r;
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

	const handleSubmit = () => {
		setCallToActionFieldRows(callToActionFieldRows);
		updateTemplateData(callToActionFieldRows);
		closeCallToAction();
	};

	return (
		<Dialog
			open={isCallToActionOpen}
			onClose={closeCallToAction}
			aria-labelledby='form-dialog-title'
			fullWidth
			maxWidth='md'>
			<DialogTitle
				id='form-dialog-title'
				className={classes.callToActionDialogHeaderTitle}>
				{translator('whatsapp.callToActionTitle')}
				<IconButton
					aria-label='close'
					onClick={closeCallToAction}
					className={classes.callToActionDialogClose}>
					<CloseIcon />
				</IconButton>
			</DialogTitle>
			<DialogContent>
				<DialogContentText
					className={classes.callToActionDialogHeaderDescription}>
					{translator('whatsapp.callToActionDialogContentText')}
				</DialogContentText>
				<form onSubmit={handleSubmit}>
					<Grid container className={classes.callToActionFields} spacing={1}>
						{callToActionFieldRows.map(
							(row: callToActionRowProps, index: number) => (
								<Grid container spacing={3} key={'TOC' + index}>
									<Grid item md={3}>
										<Typography>
											{translator('whatsapp.typeOfAction')}
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
											<MenuItem value='phonenumber'>Phone Number</MenuItem>
											<MenuItem value='website'>Website</MenuItem>
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
																		maxlength: 20,
																  }
																: field.fieldName === 'Website URL'
																? { maxLength: 2000 }
																: { maxLength: 20 }
														}
														helperText={
															field.fieldName === 'Website URL'
																? `${field.value.length}/${2000}`
																: `${field.value.length}/${20}`
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
														<MenuItem value='+972 Israel'>+972 Israel</MenuItem>
														<MenuItem value='+91 India'>+91 India</MenuItem>
													</TextField>
												</Grid>
											)
									)}

									<Grid item md={1}>
										<Typography style={{ visibility: 'hidden' }}>
											{translator('whatsapp.callToActionRemoveButton')}
										</Typography>
										<IconButton color='secondary'>
											<DeleteOutlineIcon onClick={() => onDeleteRow(row)} />
										</IconButton>
									</Grid>
								</Grid>
							)
						)}
					</Grid>

					<DialogActions>
						{callToActionFieldRows.length < 2 && (
							<Button variant='contained' color='primary' onClick={addMore}>
								{translator('whatsapp.callToActionAddMoreButton')}
							</Button>
						)}
						<Button
							onClick={closeCallToAction}
							variant='contained'
							color='secondary'>
							{translator('whatsapp.callToActionExitButton')}
						</Button>
						<Button
							type='submit'
							disabled={callToActionFieldRows.length === 0 ? true : false}
							variant='contained'
							style={
								callToActionFieldRows.length > 0
									? { backgroundColor: 'green', color: 'white' }
									: {}
							}>
							{translator('whatsapp.callToActionSaveButton')}
						</Button>
					</DialogActions>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default React.memo(ActionCallPopOver);
