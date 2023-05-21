import React, { BaseSyntheticEvent, useState } from 'react';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { coreProps, TemplateFieldsProps } from '../Types/WhatsappCreator.types';
import { ClassesType } from '../../../Classes.types';
import {
	TextField,
	Typography,
	Grid,
	Button,
	Select,
	MenuItem,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import AlertModal from '../Popups/AlertModal';
import { Autocomplete } from '@mui/material';
import {
	getTemplateIdByName,
	getTemplateName,
	getTemplateNameById,
} from '../../Common';

const TemplateFields = ({
	classes,
	templateName,
	savedTemplate,
	onTemplateNameChange,
	onSavedTemplateChange,
	fileData,
	setFileData,
	savedTemplateList,
	onCategoryChange,
	category,
	showValidation,
}: TemplateFieldsProps & ClassesType) => {
	const { windowSize, isRTL } = useSelector(
		(state: { core: coreProps }) => state.core
	);
	const { t: translator } = useTranslation();
	const [isAlert, setIsAlert] = useState(false);

	const units = ['bytes', 'KB', 'MB'];

	function niceBytes(x: string) {
		let l = 0,
			n = parseInt(x, 10) || 0;

		while (n >= 1024 && ++l) {
			n = n / 1024;
		}
		return n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l];
	}

	const [fileSize, setFileSize] = useState<string>('');
	const onFileUploadChange = (e: BaseSyntheticEvent) => {
		if (e.target.files?.length > 0) {
			if (e.target.files[0].size < 16777216) {
				setFileData(e.target.files[0]);
				setFileSize(niceBytes(e.target.files[0].size));
			} else {
				setIsAlert(true);
			}
		}
	};

	const onFileDeselect = (e: BaseSyntheticEvent) => {
		e.preventDefault();
		setFileData(undefined);
	};

	const onTemplateChange = (e: BaseSyntheticEvent) => {
		if (e.target.textContent !== '') {
			const templateId = getTemplateIdByName(
				savedTemplateList,
				e.target.textContent
			);
			if (templateId) {
				onSavedTemplateChange(templateId);
			}
		} else {
			onSavedTemplateChange('');
		}
	};

	return (
		<Grid container spacing={windowSize === 'xs' ? 0 : 2}>
			<Grid item xs={12} sm={12} md={12} lg={5}>
				<Grid container spacing={windowSize === 'xs' ? 0 : 2}>
					<Grid item xs={12} md={6} sm={12} className={classes.buttonForm}>
						<Typography className={classes.buttonHead}>
							<>{translator('whatsapp.templateName')}</>
						</Typography>

						<TextField
							required
							id='templateName'
							type='text'
							placeholder={translator('whatsapp.templateNamePlaceholder')}
							className={
								showValidation && templateName?.length === 0
									? clsx(classes.buttonField, classes.error)
									: clsx(classes.buttonField, classes.success)
							}
							onChange={onTemplateNameChange}
							value={templateName}
						/>

						<Typography className={classes.buttonContent}>
							<>{translator('whatsapp.templateDesc')}</>
						</Typography>
					</Grid>

					<Grid item xs={12} md={6} sm={12} className={classes.buttonForm}>
						<Typography className={classes.buttonHead}>
							<>{translator('whatsapp.selectSavedTemplate')}</>
						</Typography>

						<Autocomplete
							id='template-list'
							className={clsx(
								classes.buttonField,
								classes.buttonWhatsappAutocomplete
							)}
							options={savedTemplateList?.map((template) =>
								getTemplateName(template)
							)}
							renderInput={(params) => <TextField
							//{...params} 
							/>}
							onChange={onTemplateChange}
							value={getTemplateNameById(savedTemplateList, savedTemplate)}
						/>
					</Grid>
				</Grid>
			</Grid>

			<Grid item xs={12} sm={12} md={12} lg={5}>
				<Grid container spacing={windowSize === 'xs' ? 0 : 2}>
					<Grid item xs={12} md={6} sm={12} className={classes.buttonForm}>
						<Typography className={classes.buttonHead}>
							<>{translator('report.ProductsReport.category')}</>
						</Typography>

						<Select
							type='text'
							className={classes.buttonField}
							onChange={(e: BaseSyntheticEvent) =>
								onCategoryChange(e.target.value)
							}
							placeholder={translator('report.ProductsReport.category')}
							value={category}>
							<MenuItem key={'marketing'} value={'marketing'}>
								<>{translator('whatsapp.marketing')}</>
							</MenuItem>
							<MenuItem key={'utility'} value={'utility'}>
								<>{translator('whatsapp.utility')}</>
							</MenuItem>
							<MenuItem key={'authentication'} value={'authentication'}>
								<>{translator('whatsapp.authentication')}</>
							</MenuItem>
						</Select>
					</Grid>

					<Grid item xs={12} md={6} sm={12} className={classes.buttonForm}>
						<Typography className={classes.buttonHead}>
							<>{translator('whatsapp.uploadFileTitle')}</>
						</Typography>
						<label
							className={classes.customFileUpload}
							style={{
								padding:
									fileData?.fileLink?.length > 0
										? '14px 15px 12px 7px'
										: '17px 15px 15px 7px',
							}}>
							<input
								type='file'
								className={classes.formFieldInput}
								accept='image/png, image/jpeg, application/pdf, video/mp4'
								onChange={(e) => onFileUploadChange(e)}
							/>
							{fileData?.fileLink?.length > 0 ? (
								<div style={{ marginRight: 'auto', width: '100%' }}>
									<Button
										variant='contained'
										color='primary'
										size='small'
										style={{
											borderRadius: '22px',
											padding: '0px 10px 0px 10px',
											width: '100%',
										}}
										onClick={(e) => onFileDeselect(e)}>
										{fileData?.fileLink
											?.split('/')
										[fileData?.fileLink?.split('/')?.length - 1]?.substring(
											0,
											25
										) + '...'}
										&emsp;
										<i className='zmdi zmdi-close'></i>
									</Button>
								</div>
							) : (
								<i className='zmdi zmdi-upload'></i>
							)}
						</label>

						<Typography className={classes.buttonContent}>
							{fileData?.fileLink?.length > 0 ? (
								<>
									{isRTL
										? `${fileSize} ${translator('whatsapp.totalSize')}`
										: `${translator('whatsapp.totalSize')} ${fileSize}`}
								</>
							) : (
								<>{translator('whatsapp.fileDescription')}</>
							)}
						</Typography>
					</Grid>
				</Grid>
			</Grid>

			<AlertModal
				classes={classes}
				isOpen={isAlert}
				onClose={() => setIsAlert(false)}
				title={translator('whatsapp.alertModal.alert')}
				subtitle={translator('whatsapp.alertModal.fileSizeAlert')}
				type='alert'
				onConfirmOrYes={() => setIsAlert(false)}
			/>
		</Grid>
	);
};

export default React.memo(TemplateFields);
