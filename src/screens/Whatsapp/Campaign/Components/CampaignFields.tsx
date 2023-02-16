import {
	Box,
	TextField,
	Typography,
	MenuItem,
	Grid,
	Select,
	ListSubheader,
	InputAdornment,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { campaignFielsProps, coreProps } from '../Types/WhatsappCampaign.types';
import clsx from 'clsx';
import { BaseSyntheticEvent } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import { useState, useMemo } from 'react';
import SearchIcon from '@mui/material/IconButton/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import { getTemplateIdByName, getTemplateNameById } from '../../Common';

// const containsText = (text: any, searchText: any) =>
// 	text.toLowerCase().indexOf(searchText.toLowerCase()) > -1;

const useStyles = makeStyles((theme) => ({
	selectEmpty: {
		marginTop: theme.spacing(2),
	},
	menuPaper: {
		maxHeight: 400,
	},
}));

const CampaignFields = ({
	classes,
	savedTemplateList,
	savedTemplate,
	onSavedTemplateChange,
	campaignName,
	onCampaignNameChange,
	from,
	onFromChange,
	showValidation,
	phoneNumbersList,
}: campaignFielsProps) => {
	const { t: translator } = useTranslation();
	const { windowSize } = useSelector(
		(state: { core: coreProps }) => state.core
	);

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
			<Grid item xs={12} md={6} sm={12} className={classes.buttonForm}>
				<Typography className={classes.buttonHead}>
					<>{translator('whatsappCampaign.campaignName')}</>
				</Typography>
				<TextField
					required
					id='campaignName'
					type='text'
					placeholder={translator('whatsappCampaign.campaignNamePlaceholder')}
					className={
						showValidation && campaignName?.length === 0
							? clsx(classes.buttonField, classes.error)
							: clsx(classes.buttonField, classes.success)
					}
					onChange={(e: BaseSyntheticEvent) =>
						onCampaignNameChange(e.target.value)
					}
					value={campaignName}
				/>
				<Typography className={classes.WhatsappCampainButtonContent}>
					<>{translator('whatsappCampaign.campaignDesc')}</>
				</Typography>
			</Grid>
			<Grid item xs={12} md={6} sm={12} className={classes.buttonForm}>
				<Box className={classes.inputCampDiv}>
					<Typography className={classes.buttonHead}>
						<>{translator('whatsappCampaign.from')}</>
					</Typography>
				</Box>
				{phoneNumbersList?.length === 1 ? (
					<TextField
						required
						type='text'
						disabled
						className={clsx(classes.buttonField)}
						onChange={(e: BaseSyntheticEvent) =>
							onFromChange(e.target.value?.replace(/\D/g, ''))
						}
						value={from}
					/>
				) : (
					<TextField
						select
						type='text'
						className={classes.buttonField}
						onChange={(e: BaseSyntheticEvent) =>
							onFromChange(e.target.value?.replace(/\D/g, ''))
						}
						value={from}>
						{phoneNumbersList?.length > 0 ? (
							phoneNumbersList?.map((phone: string, index: number) => (
								<MenuItem key={index} value={phone}>
									{phone}
								</MenuItem>
							))
						) : (
							<MenuItem key={'no-data-template'} disabled>
								<>{translator('whatsapp.noTemplateAaliable')}</>
							</MenuItem>
						)}
					</TextField>
				)}
			</Grid>

			<Grid item xs={12} md={12} sm={12} className={classes.buttonForm}>
				<Typography className={classes.buttonHead}>
					<>{translator('whatsappCampaign.chooseTemplate')}</>
				</Typography>
				<Autocomplete
					id='template-list'
					className={
						showValidation && savedTemplate?.length === 0
							? clsx(classes.buttonField, classes.error)
							: clsx(classes.buttonField, classes.success)
					}
					options={savedTemplateList.map((template) =>
						template.FriendlyTemplateName !== ''
							? template.FriendlyTemplateName
							: template.TemplateName
					)}
					renderInput={(params) => <TextField {...params} />}
					onChange={onTemplateChange}
					value={getTemplateNameById(savedTemplateList, savedTemplate)}
				/>

				<Typography className={classes.WhatsappCampainButtonContent}>
					<>{translator('whatsappCampaign.chooseTemplateDesc')}</>
				</Typography>
			</Grid>
		</Grid>
	);
};

export default CampaignFields;
