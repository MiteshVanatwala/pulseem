import React, { useState, useMemo } from 'react';
import {
	Button,
	Box,
	IconButton,
	Dialog,
	DialogActions,
	Grid,
} from '@material-ui/core';
import { useMediaQuery, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Close } from '@material-ui/icons';
import {
	dynamicButtonProps,
	dynamicModalProps,
	updatedVariableProps,
} from '../Types/WhatsappCampaign.types';
import { useTranslation } from 'react-i18next';
import DynamicModalFields from './DynamicModalFields';
import { fieldIDs, fieldNames } from '../../Constant';

const DynamicModal = ({
	classes,
	isDynamcFieldModal,
	onDynamcFieldModalClose,
	onDynamcFieldModalSave,
	personalFields,
	landingPageData,
	dynamicModalVariable,
	dynamicVariable,
}: dynamicModalProps) => {
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('lg'));
	const { t: translator } = useTranslation();

	const [navApp, setNavApp] = React.useState<string>('');
	const [isTrackLink, setIsTrackLink] = useState<boolean>(false);
	const [activeDynamicButton, setActiveDynamicButton] = useState<string>(
		'whatsappCampaign.pField'
	);
	const [updatedDynamicVariable, setUpdatedDynamicVariable] = useState<
		updatedVariableProps[]
	>([]);

	const onClose = () => {
		setUpdatedDynamicVariable(dynamicVariable);
		onDynamcFieldModalClose();
	};

	const dynamicButtons = useMemo<dynamicButtonProps[]>(
		() => [
			{
				tooltipTitle: 'whatsappCampaign.pField',
				buttonTitle: 'whatsappCampaign.pField',
			},
			{
				tooltipTitle: 'whatsappCampaign.text',
				buttonTitle: 'whatsappCampaign.text',
			},
			{
				tooltipTitle: 'whatsappCampaign.link',
				buttonTitle: 'whatsappCampaign.link',
			},
			{
				tooltipTitle: 'whatsappCampaign.lPage',
				buttonTitle: 'whatsappCampaign.lPage',
			},
			{
				tooltipTitle: 'whatsappCampaign.navigation',
				buttonTitle: 'whatsappCampaign.navigation',
			},
		],
		[]
	);

	const onAddRemovalLink = (isTrackLink: boolean) => {
		if (
			!getFieldValueByID(fieldIDs['link'])?.includes(
				'##WHATSAPPUnsubscribelink##'
			)
		) {
			setIsTrackLink(true);
			updateDynamicVariables(
				'link',
				'##WHATSAPPUnsubscribelink##',
				isTrackLink
			);
		}
	};

	const onSave = () => {
		onDynamcFieldModalSave(updatedDynamicVariable);
	};

	const getfieldTypeId = (field: string) => {
		switch (field) {
			case fieldNames.PERSONALFIELD:
				return fieldIDs['personalField'];
			case fieldNames.TEXT:
				return fieldIDs['text'];
			case fieldNames.LINK:
				return fieldIDs['link'];
			case fieldNames.LANDINGPAGE:
				return fieldIDs['landingPage'];
			case fieldNames.NAVIGATION:
				return fieldIDs['navigation'];
			default:
				return 0;
		}
	};

	const updateDynamicVariables = (
		field: string,
		value: string,
		isTrackLink: boolean = false
	) => {
		const isVariableUpdated = updatedDynamicVariable?.find(
			(updatedVariable: updatedVariableProps) =>
				updatedVariable.VariableIndex === dynamicModalVariable
		);
		if (!!isVariableUpdated) {
			const newDynamicVariables = updatedDynamicVariable.map(
				(updatedVariable) => {
					if (updatedVariable.VariableIndex !== dynamicModalVariable)
						return updatedVariable;

					return {
						...updatedVariable,
						VariableValue: value,
						FieldTypeId: getfieldTypeId(field),
						IsStatastic: field === 'link' ? isTrackLink : false,
					};
				}
			);
			setUpdatedDynamicVariable(newDynamicVariables);
		} else {
			setUpdatedDynamicVariable([
				...updatedDynamicVariable,
				{
					FieldTypeId: getfieldTypeId(field),
					VariableIndex: dynamicModalVariable,
					VariableValue: value,
					IsStatastic: field === 'link' ? isTrackLink : false,
				},
			]);
		}
	};

	const getFieldValueByID = (fieldID: number) => {
		const value = updatedDynamicVariable?.find(
			(updatedVariable: updatedVariableProps) =>
				updatedVariable.VariableIndex === dynamicModalVariable &&
				updatedVariable.FieldTypeId === fieldID
		)?.VariableValue;
		return value ? value : '';
	};

	return (
		<>
			<Dialog
				fullScreen={fullScreen}
				open={isDynamcFieldModal}
				onClose={onClose}
				aria-labelledby='responsive-dialog-title'>
				<div className={classes.whatsappCampaignDynamicFieldTitle}>
					<>{translator('whatsappCampaign.dfieldTitle')}</>
				</div>
				<Box className={classes.whatsappCampaignDynamicFieldClose}>
					<IconButton onClick={onClose}>
						<Close />
					</IconButton>
				</Box>
				<Box style={{ height: '203px' }}>
					<Grid
						container
						className={classes.whatsappCampaignDynamicFieldContent}>
						<Grid
							container
							className={classes.whatsappCampaignDynamicFieldContentText}>
							<Stack direction='row' spacing={0}>
								{dynamicButtons.map(
									(button: dynamicButtonProps, index: number) => (
										<Button
											key={index}
											variant='outlined'
											color='primary'
											size='small'
											style={{
												margin: '0px 6px 6px 0px',
												padding: '3px 9px',
												borderRadius: '20px',
											}}
											className={
												button.buttonTitle === activeDynamicButton
													? classes.whatsappCampaignDynamicFieldButtonActive
													: classes.whatsappCampaignDynamicFieldButton
											}
											onClick={() =>
												setActiveDynamicButton(button.buttonTitle)
											}>
											<>{translator(button.buttonTitle)}</>
										</Button>
									)
								)}
							</Stack>
						</Grid>
						<DynamicModalFields
							classes={classes}
							activeDynamicButton={activeDynamicButton}
							personalField={getFieldValueByID(fieldIDs['personalField'])}
							textInput={getFieldValueByID(fieldIDs['text'])}
							linkInput={getFieldValueByID(fieldIDs['link'])}
							navApp={navApp}
							landPage={getFieldValueByID(fieldIDs['landingPage'])}
							navAddress={getFieldValueByID(fieldIDs['navigation'])}
							setTextInput={(value: string) =>
								updateDynamicVariables('text', value)
							}
							setPersonalField={(value: string) =>
								updateDynamicVariables('personalField', value)
							}
							onAddRemovalLink={(isTrackLink) => onAddRemovalLink(isTrackLink)}
							setLinkInput={(value, isTrackLink) =>
								updateDynamicVariables('link', value, isTrackLink)
							}
							setLandPage={(value: string) =>
								updateDynamicVariables('landingPage', value)
							}
							setNavApp={setNavApp}
							setNavAddress={(value: string) =>
								updateDynamicVariables('navigation', value)
							}
							personalFields={personalFields}
							landingPageData={landingPageData}
							isTrackLink={isTrackLink}
							setIsTrackLink={() => setIsTrackLink(!isTrackLink)}
						/>
					</Grid>
				</Box>
				<DialogActions>
					<Button
						onClick={() => onClose()}
						variant='contained'
						style={{
							margin: '6px',
							padding: '3px 9px',
							borderRadius: '20px',
							backgroundColor: '#d63511',
							color: 'white',
						}}>
						Exit
					</Button>
					<Button
						onClick={() => onSave()}
						variant='contained'
						style={{
							margin: '6px',
							padding: '3px 9px',
							borderRadius: '20px',
							backgroundColor: '#1e8a22',
							color: 'white',
						}}>
						Save
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default DynamicModal;
