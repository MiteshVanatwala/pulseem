import React, { BaseSyntheticEvent, useMemo, useState } from 'react';
import DefaultScreen from '../../DefaultScreen';
import uniqid from 'uniqid';
import { Title } from '../../../components/managment/Title';
import TemplateFields from './TemplateFields';
import ActionCallPopOver from './ActionCallPopOver';
import Buttons from './Buttons';
import Phone from './Phone';
import {
	callToActionFieldProps,
	callToActionProps,
	callToActionRowProps,
	quickReplyButtonProps,
	templateDataProps,
	WhatsappCreatorProps,
} from './WhatsappCreator.types';
import { ClassesType } from '../../Classes.types';
import { useTranslation } from 'react-i18next';
import { Box, Grid } from '@material-ui/core';
import WhatsappTemplateEditor from './WhatsappTemplateEditor';
import { actionButtonProps } from './WhatsappCreator.types';
import QuickReply from './QuickReply';

const WhatsappCreator = ({ classes }: WhatsappCreatorProps & ClassesType) => {
	const { t: translator } = useTranslation();
	const initialQuickReplyButtons = [
		{
			id: uniqid(),
			value: '',
		},
	];
	const [templateName, setTemplateName] = useState<string>('');
	const [savedTemplate, setSavedTemplate] = useState<string>('');
	const [buttonType, setButtonType] = useState<string>('');
	const [templateData, setTemplateData] = useState<templateDataProps>({
		templateText: '',
		templateButtons: [],
	});
	const [isQuickReplyOpen, setIsQuickReplyOpen] = useState<boolean>(false);
	const [isCallToActionOpen, setIsCallToActionOpen] = useState<boolean>(false);
	const [quickReplyButtons, setQuickReplyButtons] = useState<
		quickReplyButtonProps[]
	>(initialQuickReplyButtons);

	const websiteField = useMemo<callToActionFieldProps[]>(
		() => [
			{
				fieldName: translator('whatsapp.websiteButtonText'),
				type: 'text',
				placeholder: translator('whatsapp.websiteButtonTextPlaceholder'),
				value: '',
			},
			{
				fieldName: translator('whatsapp.websiteURL'),
				type: 'text',
				placeholder: translator('whatsapp.websiteURLPlaceholder'),
				value: '',
			},
		],
		[translator]
	);
	const phoneNumberField = useMemo<callToActionFieldProps[]>(
		() => [
			{
				fieldName: translator('whatsapp.phoneButtonText'),
				type: 'text',
				placeholder: translator('whatsapp.phoneButtonTextPlaceholder'),
				value: '',
			},
			{
				fieldName: translator('whatsapp.country'),
				type: 'select',
				placeholder: 'Select Your Country Code',
				value: '+972 Israel',
			},
			{
				fieldName: translator('whatsapp.phoneNumber'),
				type: 'tel',
				placeholder: translator('whatsapp.phoneNumberPlaceholder'),
				value: '',
			},
		],
		[translator]
	);

	const initialFieldRow = {
		id: uniqid(),
		typeOfAction: 'phonenumber',
		fields: phoneNumberField,
	};

	const [callToActionFieldRows, setCallToActionFieldRows] =
		useState<callToActionProps>([initialFieldRow]);

	const onTemplateNameChange = (e: BaseSyntheticEvent) => {
		console.log(e.target.value);
		setTemplateName(e.target.value.toLowerCase());
	};

	const onSavedTemplateChange = (e: BaseSyntheticEvent) => {
		console.log(e.target.value);
		setSavedTemplate(e.target.value);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setTemplateName('');
		setSavedTemplate('');
		console.log('Form Submitted with these - ', templateName, savedTemplate);
	};

	const onButtonClick = (button: actionButtonProps) => {
		if (button.buttonTitle.includes('callToAction')) {
			setIsCallToActionOpen(true);
		} else if (button.buttonTitle.includes('quickReplay')) {
			setIsQuickReplyOpen(true);
		}
	};

	const onActionButtonDelete = (
		button: quickReplyButtonProps | callToActionRowProps
	) => {
		if (buttonType === 'quickreply') {
			const updatedQuickButtonsData = quickReplyButtons.filter(
				(quickButton: quickReplyButtonProps) => quickButton.id !== button.id
			);
			setTemplateData({
				...templateData,
				templateButtons: updatedQuickButtonsData,
			});
			setQuickReplyButtons([...updatedQuickButtonsData]);
			if (updatedQuickButtonsData?.length <= 0) {
				setButtonType('');
			}
		} else {
			const updatedCallToActionFieldRows = callToActionFieldRows.filter(
				(fieldRow: callToActionRowProps) => fieldRow.id !== button.id
			);
			setTemplateData({
				...templateData,
				templateButtons: updatedCallToActionFieldRows,
			});
			setCallToActionFieldRows([...updatedCallToActionFieldRows]);
			if (updatedCallToActionFieldRows?.length <= 0) {
				setButtonType('');
			}
		}
	};

	const updateTemplateData = (
		buttons: quickReplyButtonProps[] | callToActionProps,
		buttonsType: string
	) => {
		setTemplateData({ ...templateData, templateButtons: buttons });
		buttons?.length > 0 ? setButtonType(buttonsType) : setButtonType('');
	};

	const addMore = () => {
		setCallToActionFieldRows([...callToActionFieldRows, initialFieldRow]);
	};

	return (
		<form onSubmit={handleSubmit}>
			<DefaultScreen
				subPage={'create'}
				currentPage='whatsapp'
				classes={classes}
				customPadding={true}>
				<Title
					Text={translator('whatsapp.header')}
					Classes={classes.whatsappTemplateTitle}
					ContainerStyle={{}}
					Element={null}
				/>
				<br />
				<Grid container>
					<Grid item xs={12} md={5} sm={12}>
						<TemplateFields
							classes={classes}
							templateName={templateName}
							savedTemplate={savedTemplate}
							onTemplateNameChange={(e) => onTemplateNameChange(e)}
							onSavedTemplateChange={(e) => onSavedTemplateChange(e)}
						/>
						<ActionCallPopOver
							isCallToActionOpen={isCallToActionOpen}
							closeCallToAction={() => setIsCallToActionOpen(false)}
							classes={classes}
							callToActionFieldRows={callToActionFieldRows}
							setCallToActionFieldRows={(data) =>
								setCallToActionFieldRows(data)
							}
							phoneNumberField={phoneNumberField}
							websiteField={websiteField}
							addMore={() => addMore()}
							updateTemplateData={(data: callToActionProps) =>
								updateTemplateData(data, 'callToAction')
							}
						/>
					</Grid>
					<Grid container>
						<Grid item xs={12} sm={12} md={12} lg={5}>
							<WhatsappTemplateEditor
								classes={classes}
								onButtonClick={(button: actionButtonProps) =>
									onButtonClick(button)
								}
								buttons={templateData.templateButtons}
								onButtonDelete={(button) => onActionButtonDelete(button)}
								buttonType={buttonType}
							/>
						</Grid>

						<Grid item xs={12} sm={12} md={12} lg={7}>
							<Grid container>
								<Grid item xs={12} sm={12} md={12} lg={6}></Grid>
								<Grid item xs={12} sm={12} md={12} lg={6}>
									<Box style={{ maxWidth: 420, marginTop: 20 }}>
										<Phone classes={classes} />
									</Box>
								</Grid>
							</Grid>
							<Buttons classes={classes} />
						</Grid>
					</Grid>
				</Grid>
				<QuickReply
					classes={classes}
					isQuickReplyOpen={isQuickReplyOpen}
					closeQuickReply={() => setIsQuickReplyOpen(false)}
					quickReplyButtons={quickReplyButtons}
					setQuickReplyButtons={(data: quickReplyButtonProps[]) =>
						setQuickReplyButtons(data)
					}
					updateTemplateData={(data: quickReplyButtonProps[]) =>
						updateTemplateData(data, 'quickReply')
					}
				/>
			</DefaultScreen>
		</form>
	);
};

export default WhatsappCreator;
