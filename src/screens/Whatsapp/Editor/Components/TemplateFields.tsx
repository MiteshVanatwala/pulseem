import React, {
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
	MenuItem,
	Box,
	FormControl,
} from '@material-ui/core';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useTranslation } from 'react-i18next';
import { Autocomplete } from '@mui/material';
import {
	getTemplateIdByName,
	getTemplateName,
	getTemplateNameById,
} from '../../Common';
import { IoIosArrowDown } from 'react-icons/io';
import { authenticationTypes } from '../../Constant';
import { commonProps } from '../../../../model/Common/commonProps.types';

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
	const { isPoland  } = useSelector(
		(state: { common: commonProps }) => state.common
	);
	const { t: translator } = useTranslation();
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

					<Grid item xs={12} md={6} sm={12} className={clsx(classes.buttonForm, savedTemplateList !== null && savedTemplateList?.length === 0 ? classes.disabled : null)}>
						<Typography className={classes.buttonHead}>
							<>{translator('whatsapp.selectSavedTemplate')}</>
						</Typography>

						<Autocomplete
							id='template-list'
							className={clsx(
								classes.buttonWhatsappAutocomplete
							)}
							// @ts-ignore
							options={autoCompleteOptions}
							renderOption={renderOptions}
							style={{ direction: isRTL ? 'rtl' : 'ltr' }}
							// @ts-ignore
							renderInput={(params: any) => <TextField {...params} />}
							onChange={(_event: any, value: any) => onTemplateChange(value)}
							value={getTemplateNameById(savedTemplateList, savedTemplate)}
						/>
					</Grid>
				</Grid>
			</Grid>

			<Grid item xs={12} sm={12} md={12} lg={5}>
				<Grid container spacing={windowSize === 'xs' ? 0 : 2}>
					<Grid item xs={12} md={6} sm={12} className={classes.buttonForm}>
						<Typography className={classes.buttonHead}>
							{translator('report.ProductsReport.category')}
						</Typography>
						<FormControl variant='standard' className={clsx(classes.selectInputFormControl, classes.w100)} style={{ marginTop: 4 }}>
							<Select
								variant="standard"
								displayEmpty
								value={category}
								onChange={(event: SelectChangeEvent) => onCategoryChange(event.target.value)}
								IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
								className={classes.pbt5}
								// @ts-ignore
								MenuProps={{
									// @ts-ignore
									PaperProps: {
										style: {
											maxHeight: 300,
											direction: isRTL ? 'rtl' : 'ltr'
										},
									},
								}}
								placeholder={translator('report.ProductsReport.category')}
							>
								<MenuItem key={'marketing'} value={'marketing'}>
									{translator('whatsapp.marketing')}
								</MenuItem>
								<MenuItem key={'utility'} value={'utility'}>
									{translator('whatsapp.utility')}
								</MenuItem>
								<MenuItem value={authenticationTypes.AUTHENTICATIONEN}>
									{translator('whatsapp.authenticationEn')}
								</MenuItem>
								{
									!isPoland && (
										<MenuItem value={authenticationTypes.AUTHENTICATIONHEBREW}>
											{translator('whatsapp.authenticationHebrew')}
										</MenuItem>
									)
								}
								<MenuItem value={authenticationTypes.AUTHENTICATIONPOLSKI}>
									{translator('whatsapp.authenticationPolski')}
								</MenuItem>
							</Select>
						</FormControl>
					</Grid>
				</Grid>
			</Grid>
		</Grid>
	);
};

export default React.memo(TemplateFields);
