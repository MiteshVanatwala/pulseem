import React, {
	BaseSyntheticEvent,
	HtmlHTMLAttributes,
	useEffect,
	useState,
} from 'react';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { coreProps, TemplateFieldsProps } from '../Types/WhatsappCreator.types';
import { ClassesType } from '../../../Classes.types';
import {
	TextField,
	Typography,
	Grid,
	Select,
	MenuItem,
	Box,
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
	savedTemplateList,
	onCategoryChange,
	category,
	showValidation,
}: TemplateFieldsProps & ClassesType) => {
	const { windowSize, isRTL } = useSelector(
		(state: { core: coreProps }) => state.core
	);
	const { t: translator } = useTranslation();
	const [isFileSizeAlert, setIsFileSizeAlert] = useState<boolean>(false);
	const [isFileUploadAlert, setIsFileUploadAlert] = useState<boolean>(false);
	const [autoCompleteOptions, setAutoCompleteOptions] = useState<string[]>([]);

	useEffect(() => {
		const autoCompleteList = savedTemplateList?.map((template) => {
			return getTemplateName(template);
		});
		setAutoCompleteOptions(autoCompleteList);
	}, [savedTemplateList]);

	const onTemplateChange = (value: string | null) => {
		if (value && value !== '') {
			const templateId = getTemplateIdByName(savedTemplateList, value);
			if (templateId) {
				onSavedTemplateChange(templateId);
			}
		} else {
			onSavedTemplateChange('');
		}
	};

	const renderOptions = (
		props: HtmlHTMLAttributes<HTMLElement>,
		option: string
	) => {
		return (
			<Box
				component='li'
				{...props}
				key={option}
				title={option}
				style={{ direction: isRTL ? 'rtl' : 'ltr', maxWidth: '100%' }}>
				{option}
			</Box>
		);
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
							options={autoCompleteOptions}
							renderOption={renderOptions}
							style={{ direction: isRTL ? 'rtl' : 'ltr' }}
							// @ts-ignore
							renderInput={(params) => <TextField {...params} />}
							onChange={(_event, value) => onTemplateChange(value)}
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
							MenuProps={{
								PaperProps: {
									style: {
										direction: isRTL ? 'rtl' : 'ltr',
									},
								},
							}}
							placeholder={translator('report.ProductsReport.category')}
							value={category}>
							<MenuItem key={'marketing'} value={'marketing'}>
								{translator('whatsapp.marketing')}
							</MenuItem>
							<MenuItem key={'utility'} value={'utility'}>
								{translator('whatsapp.utility')}
							</MenuItem>
							<MenuItem value='authenticationEn'>
								{translator('whatsapp.authenticationEn')}
							</MenuItem>
							<MenuItem value='authenticationHebrew'>
								{translator('whatsapp.authenticationHebrew')}
							</MenuItem>
						</Select>
					</Grid>
				</Grid>
			</Grid>

			<AlertModal
				classes={classes}
				isOpen={isFileSizeAlert}
				onClose={() => setIsFileSizeAlert(false)}
				title={translator('whatsapp.alertModal.alert')}
				subtitle={translator('whatsapp.alertModal.fileSizeAlert')}
				type='alert'
				onConfirmOrYes={() => setIsFileSizeAlert(false)}
			/>

			<AlertModal
				classes={classes}
				isOpen={isFileUploadAlert}
				onClose={() => setIsFileUploadAlert(false)}
				title={translator('whatsapp.alertModal.alert')}
				subtitle={translator('whatsapp.alertModal.fileUploadAlert')}
				type='alert'
				onConfirmOrYes={() => setIsFileUploadAlert(false)}
			/>
		</Grid>
	);
};

export default React.memo(TemplateFields);
