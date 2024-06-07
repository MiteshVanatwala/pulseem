import React, { useState, useEffect } from 'react';
import {
	Button,
	Box,
	DialogActions,
	Grid,
} from '@material-ui/core';
import clsx from 'clsx';
import { Stack } from '@mui/material';
import {
	dynamicButtonProps,
	dynamicModalProps,
	updatedVariable,
} from '../Types/WhatsappCampaign.types';
import { useTranslation } from 'react-i18next';
import DynamicModalFields from './DynamicModalFields';
import { fieldIDs, fieldNames } from '../../Constant';
import { useParams } from 'react-router-dom';
import { RemoveNewLineAndConsecutiveSpaces } from '../../../../helpers/Utils/TextHelper';
import { IsValidURL } from '../../../../helpers/Utils/Validations';
import { DynamicProductLink } from '../../../../Models/PushNotifications/Enums';

const DynamicModal = ({
	classes,
	onDynamcFieldModalClose,
	onDynamcFieldModalSave,
	personalFields,
	landingPageData,
	dynamicModalVariable,
	dynamicVariable,
	isTrackLink,
	setIsTrackLink,
	savedTemplate,
	templateCategory = 0,
}: dynamicModalProps) => {
	const { campaignID } = useParams();
	const { t: translator } = useTranslation();

	const [navApp, setNavApp] = React.useState<string>('Google Maps');
	const [isDynamcVariableUpdated, setIsDynamcVariableUpdated] =
		useState<boolean>(false);

	const [activeDynamicButton, setActiveDynamicButton] = useState<string>(
		templateCategory === 3 ? 'whatsappCampaign.text' : 'whatsappCampaign.pField'
	);
	const [isValidationAlert, setIsValidationAlert] = useState<boolean>(false);
	const [validationErrors, setValidationErrors] = useState<string[]>([]);
	const [updatedDynamicVariable, setUpdatedDynamicVariable] = useState<
		updatedVariable[]
	>(dynamicVariable || []);
	const [dynamicProductType, setDynamicProductType] = useState<string>('');
	const [dynamicProductFallbackURL, setDynamicProductFallbackURL] = useState<string>('');
	
	useEffect(() => {
		if (campaignID && !isDynamcVariableUpdated && dynamicVariable?.length > 0) {
			setUpdatedDynamicVariable(dynamicVariable);
			setIsDynamcVariableUpdated(true);
		}
		const isDynamicProduct = getFieldValueByID(fieldIDs[fieldNames.LINK]);
		if (isDynamicProduct.indexOf('dynamic') > -1) {
			setDynamicProductType(isDynamicProduct.indexOf('?Purchase') > -1 ? DynamicProductLink.LATEST_PURCHASE : DynamicProductLink.LATEST_ABANDONMENT)
			setDynamicProductFallbackURL(updatedDynamicVariable?.find(
				(updatedVariable: updatedVariable) =>
					updatedVariable?.VariableIndex === dynamicModalVariable &&
					updatedVariable?.FieldTypeId === fieldIDs[fieldNames.LINK]
			)?.FallbackUrl || '')
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dynamicVariable]);

	useEffect(() => {
		if (dynamicModalVariable !== 0) {
			const activeModalData = dynamicVariable?.find(
				(variable) => variable?.VariableIndex === dynamicModalVariable
			);

			if (activeModalData?.FieldTypeId) {
				switch (activeModalData?.FieldTypeId) {
					case 1:
						setActiveDynamicButton('whatsappCampaign.pField');
						break;
					case 2:
						setActiveDynamicButton('whatsappCampaign.text');
						break;
					case 3:
						setActiveDynamicButton('whatsappCampaign.link');
						break;
					case 4:
						setActiveDynamicButton('whatsappCampaign.lPage');
						break;
					case 5:
						setActiveDynamicButton('whatsappCampaign.navigation');
						break;

					default:
						setActiveDynamicButton('whatsappCampaign.pField');
						break;
				}
			}

			if (activeModalData?.FieldTypeId === 5) {
				if (activeModalData?.VariableValue?.includes('https://waze.to/?q=')) {
					setNavApp('Waze');
				} else {
					setNavApp('Google Maps');
				}
			}

			if (templateCategory === 3) setActiveDynamicButton('whatsappCampaign.text');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dynamicModalVariable]);

	useEffect(() => {
		// setUpdatedDynamicVariable([]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [savedTemplate]);

	const onClose = () => {
		setUpdatedDynamicVariable(dynamicVariable);
		onDynamcFieldModalClose();
		setUpdatedDynamicVariable([]);
	};

	const dynamicButtons: dynamicButtonProps[] = [
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
	];

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

	const validateDynamicField = () => {
		let validationErrors: string[] = [];
		let isValidated = true;
		updatedDynamicVariable?.forEach((variable) => {
			if (
				variable?.FieldTypeId === 3 &&
				// activeDynamicButton === 'whatsappCampaign.link' &&
				!variable?.VariableValue?.includes('##WHATSAPPUnsubscribelink##')
			) {
				var isLinkValid = variable?.VariableValue?.match(
					/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
				);
				if (isLinkValid == null) {
					validationErrors.push(translator('whatsappCampaign.validLink'));
					isValidated = false;
				}
			}
		});

		if (activeDynamicButton === 'whatsappCampaign.link' && dynamicProductType !== '' && !IsValidURL(dynamicProductFallbackURL)) {
			validationErrors.push(translator('common.invalidURL'));
			isValidated = false;
		}

		if (!isValidated) {
			setValidationErrors([...validationErrors]);
			setIsValidationAlert(true);
		}
		
		return isValidated;
	};

	const onSave = () => {
		if (validateDynamicField()) {
			onDynamcFieldModalSave(updatedDynamicVariable);
			setUpdatedDynamicVariable([]);
		}
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
		isTrackLink: boolean = false,
		fallbackUrl: string = ''
	) => {
		const isVariableUpdated = updatedDynamicVariable?.find(
			(updatedVariable: updatedVariable) =>
				updatedVariable?.VariableIndex === dynamicModalVariable
		);
		if (field === 'link') {
			setIsTrackLink(isTrackLink);
		}
		if (!!isVariableUpdated) {
			const newDynamicVariables = updatedDynamicVariable.map(
				(updatedVariable: any) => {
					if (updatedVariable?.VariableIndex !== dynamicModalVariable)
						return updatedVariable;

					return {
						...updatedVariable,
						VariableValue: field === 'text' ? RemoveNewLineAndConsecutiveSpaces(value) : value,
						FieldTypeId: getfieldTypeId(field),
						IsStatastic: field === 'link' ? isTrackLink : false,
						FallbackUrl: fallbackUrl
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
					VariableValue: field === 'text' ? RemoveNewLineAndConsecutiveSpaces(value) : value,
					IsStatastic: field === 'link' ? isTrackLink : false,
					FallbackUrl: fallbackUrl
				},
			]);
		}
	};

	const getFieldValueByID = (fieldID: number) => {
		const value = updatedDynamicVariable?.find(
			(updatedVariable: updatedVariable) =>
				updatedVariable?.VariableIndex === dynamicModalVariable &&
				updatedVariable?.FieldTypeId === fieldID
		)?.VariableValue;
		return value ? value : '';
	};

	return (
		<>
			<Box>
				<Grid
					container
					className={classes.whatsappCampaignDynamicFieldContent}>
					<Grid
						container
						className={classes.whatsappCampaignDynamicFieldContentText}>
						<Stack direction='row' spacing={0} className={classes.dBlock}>
							{templateCategory !== 3 && dynamicButtons.map(
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
							updateDynamicVariables('link', value, isTrackLink, dynamicProductFallbackURL)
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
						dynamicProductType={dynamicProductType}
						setDynamicProductType={(value: string) => {
							setDynamicProductType(value);
							updateDynamicVariables('link', value, true, dynamicProductFallbackURL);
						}}
						dynamicProductFallbackURL={dynamicProductFallbackURL}
						setDynamicProductFallbackURL={(val: string) => {
							setDynamicProductFallbackURL(val);
							updateDynamicVariables('link', dynamicProductType, true, val);
						}}
					/>
				</Grid>
			</Box>
			<Box>
				<ul className={clsx(classes.noMargin, classes.mb20, classes.pt20)}>
					{validationErrors?.map((requiredField: string, index: number) => (
						<li key={index} className={clsx(classes.validationAlertModalLi, classes.errorLabel, classes.f16)}>
							{requiredField}
						</li>
					))}
				</ul>
			</Box>
			<DialogActions className={classes.pt25}>
				<Button
					onClick={() => onClose()}
					variant='contained'
					className={clsx(classes.btn, classes.btnRounded, classes.mlr10)}
				>
					<>{translator('whatsappCampaign.exit')}</>
				</Button>
				<Button
					onClick={() => onSave()}
					variant='contained'
					className={clsx(classes.btn, classes.btnRounded, classes.redButton)}
				>
					<>{translator('whatsappCampaign.save')}</>
				</Button>
			</DialogActions>
		</>
	);
};

export default DynamicModal;
