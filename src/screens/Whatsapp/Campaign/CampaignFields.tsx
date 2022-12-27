import {
	Box,
	TextField,
	Typography,
	MenuItem,
	Grid,
	Button,
} from '@material-ui/core';
import { ClassesType } from '../../Classes.types';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { campaignFielsProps, coreProps } from './WhatsappCampaign.types';
import clsx from 'clsx';
import { BaseSyntheticEvent, useState } from 'react';

const CampaignFields = ({
	classes,
	savedTemplateList,
	savedTemplate,
	onSavedTemplateChange,
	campaignName,
	onCampaignNameChange,
	from,
	onFromChange,
	onCampaignFromRestore,
}: campaignFielsProps) => {
	const { t: translator } = useTranslation();
	const { isRTL, windowSize } = useSelector(
		(state: { core: coreProps }) => state.core
	);
	const [isCampaign, setIsCampaign] = useState<boolean>(false);

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
						isCampaign
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
					<Typography
						className={classes.restoreBtn}
						onClick={() => {
							onCampaignFromRestore();
						}}>
						<>{translator('whatsappCampaign.restore')}</>
					</Typography>
				</Box>
				<TextField
					required
					id='templateName'
					type='text'
					className={
						isCampaign
							? clsx(classes.buttonField, classes.error)
							: clsx(classes.buttonField, classes.success)
					}
					onChange={(e: BaseSyntheticEvent) => onFromChange(e.target.value)}
					value={from}
				/>
				{/* <TextField
					select
					type='text'
					className={
						isCampaign
							? clsx(classes.buttonField, classes.error)
							: clsx(classes.buttonField, classes.success)
					}
					onChange={onSavedTemplateChange}
					value={savedTemplate}>
					{savedTemplateList?.length > 0 ? (
						savedTemplateList.map((template) => (
							<MenuItem key={template.TemplateId} value={template.TemplateId}>
								{template.TemplateName}
							</MenuItem>
						))
					) : (
						<MenuItem key={'no-data-template'} disabled>
							<>{translator('whatsapp.noTemplateAaliable')}</>
						</MenuItem>
					)}
				</TextField> */}
				<Typography
					className={clsx(classes.WhatsappCampainButtonContent, 'red')}>
					<>{translator('whatsappCampaign.fromDesc')}</>
				</Typography>
			</Grid>

			<Grid item xs={12} md={12} sm={12} className={classes.buttonForm}>
				<Typography className={classes.buttonHead}>
					<>{translator('whatsappCampaign.chooseTemplate')}</>
				</Typography>

				<TextField
					select
					id='selectSavedTemplate'
					type='text'
					className={
						isCampaign
							? clsx(classes.buttonField, classes.error)
							: clsx(classes.buttonField, classes.success)
					}
					onChange={onSavedTemplateChange}
					value={savedTemplate}>
					{savedTemplateList?.length > 0 ? (
						savedTemplateList.map((template) => (
							<MenuItem key={template.TemplateId} value={template.TemplateId}>
								{template.TemplateName}
							</MenuItem>
						))
					) : (
						<MenuItem key={'no-data-template'} disabled>
							<>{translator('whatsapp.noTemplateAaliable')}</>
						</MenuItem>
					)}
				</TextField>
				<Typography className={classes.WhatsappCampainButtonContent}>
					<>{translator('whatsappCampaign.chooseTemplateDesc')}</>
				</Typography>
			</Grid>
		</Grid>
	);
};

export default CampaignFields;
