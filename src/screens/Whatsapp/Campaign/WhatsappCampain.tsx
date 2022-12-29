import { BaseSyntheticEvent, useEffect, useMemo, useState } from 'react';
import DefaultScreen from '../../DefaultScreen';
import { Title } from '../../../components/managment/Title';
import { useTranslation } from 'react-i18next';
import {
	Box,
	Grid,
	RadioGroup,
	FormControlLabel,
	Radio,
	FormGroup,
	Switch,
	Typography,
	TextField,
	Button,
} from '@material-ui/core';
import { Stack } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
	WhatsappCampaignProps,
	coreProps,
	testGroupDataProps,
	tagDataProps,
	personalFieldDataProps,
	personalFieldAPIProps,
	updatedVariableProps,
	landingPageDataProps,
	landingPageAPIProps,
	testGroupsProps,
	smsReducerProps,
} from './Types/WhatsappCampaign.types';
import CampaignFields from './Components/CampaignFields';
import clsx from 'clsx';
import WhatsappMobilePreview from '../Editor/Components/WhatsappMobilePreview';
import {
	buttonsDataProps,
	callToActionFieldProps,
	callToActionProps,
	callToActionRowProps,
	quickReplyButtonProps,
	quickReplyButtonsFieldProps,
	savedTemplateAPIProps,
	savedTemplateCallToActionProps,
	savedTemplateCardProps,
	savedTemplateDataProps,
	savedTemplateListProps,
	savedTemplateMediaProps,
	savedTemplateQuickReplyProps,
	savedTemplateTextProps,
	templateDataProps,
} from '../Editor/Types/WhatsappCreator.types';
import Highlighter from 'react-highlight-words';
import DynamicModal from './Popups/DynamicModal';
import Buttons from './Components/Buttons';
import uniqid from 'uniqid';
import { getSavedTemplates } from '../../../redux/reducers/whatsappSlice';
import ValidationAlert from './Popups/ValidationAlert';
import TestGroupModal from './Popups/TestGroupModal';
import { RiCloseFill } from 'react-icons/ri';
import QuickReply from '../Editor/Popups/QuickReply';
import ActionCallPopOver from '../Editor/Popups/ActionCallPopOver';
import { useNavigate } from 'react-router-dom';
import { getDynamicFields } from '../Common';
import {
	getAccountExtraData,
	getPreviousLandingData,
	getTestGroups,
} from '../../../redux/reducers/smsSlice';

const WhatsappCampaign = ({ classes }: WhatsappCampaignProps) => {
	const { t: translator } = useTranslation();
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const { testGroups } = useSelector(
		(state: { sms: smsReducerProps }) => state.sms
	);
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
	const initialQuickReplyButtons = [
		{
			id: uniqid(),
			typeOfAction: '',
			fields: [
				{
					fieldName: translator('whatsapp.websiteButtonText'),
					type: 'text',
					placeholder: translator('whatsapp.websiteButtonTextPlaceholder'),
					value: '',
				},
			],
		},
	];
	const initialFieldRow = {
		id: uniqid(),
		typeOfAction: 'phonenumber',
		fields: phoneNumberField,
	};
	const { isRTL } = useSelector((state: { core: coreProps }) => state.core);
	const [isDynamcFieldModal, setIsDynamcFieldModal] = useState<boolean>(false);
	const [campaignName, setCampaignName] = useState<string>('');
	const [from, setFrom] = useState<string>('');
	const [showValidation, setShowValidation] = useState<boolean>(false);
	const [isValidationAlert, setIsValidationAlert] = useState<boolean>(false);
	const [isTestGroupModal, setIsTestGroupModal] = useState<boolean>(false);
	const [isQuickReplyOpen, setIsQuickReplyOpen] = useState<boolean>(false);
	const [isCallToActionOpen, setIsCallToActionOpen] = useState<boolean>(false);
	const [isTestSend, setIsTestSend] = useState<boolean>(false);
	const [testSendSelection, setTestSendSelection] =
		useState<string>('onecontact');
	const [fileData, setFileData] = useState<string>('');
	const [savedTemplate, setSavedTemplate] = useState<string>('');
	const [buttonType, setButtonType] = useState<string>('');
	const [templateData, setTemplateData] = useState<templateDataProps>({
		templateText: '',
		templateButtons: [],
	});
	const [personalFields, setpersonalFields] = useState<personalFieldDataProps>(
		{}
	);
	const [landingPages, setLandingPages] = useState<landingPageDataProps[]>([]);
	const [savedTemplateList, setSavedTemplateList] = useState<
		savedTemplateListProps[]
	>([]);
	const [dynamicVariable, setDynamicVariable] = useState<string[]>([]);
	const [updatedDynamicVariable, setUpdatedDynamicVariable] = useState<
		updatedVariableProps[]
	>([]);
	const [groupSendValidationErrors, setGroupSendValidationErrors] = useState<
		string[]
	>([]);
	const [selectedTestGroup, setSelectedTestGroup] = useState<
		testGroupDataProps[]
	>([]);

	const [callToActionFieldRows, setCallToActionFieldRows] =
		useState<callToActionProps>([initialFieldRow]);
	const [linkCount, setlinkCount] = useState<number>(0);
	const [dynamicFieldCount, setDynamicFieldCount] = useState<number>(0);
	const [dynamicModalVariable, setDynamicModalVariable] = useState<number>(0);

	const [testSendOneContact, setTestSendOneContact] = useState<string>('');

	const [quickReplyButtons, setQuickReplyButtons] = useState<
		quickReplyButtonProps[]
	>(initialQuickReplyButtons);

	let updatedTemplateData: templateDataProps = {
		templateText: '',
		templateButtons: [],
	};
	let updatedButtonType: string = '';
	let updatedFileData: string = '';

	const getSavedTemplateFields = async () => {
		let savedTemplate: savedTemplateAPIProps = await dispatch<any>(
			getSavedTemplates({ templateStatus: 3 })
		);
		setSavedTemplateList(savedTemplate.payload.Items);
	};

	useEffect(() => {
		getSavedTemplateFields();
		if (!testGroups || testGroups?.length === 0) {
			dispatch(getTestGroups());
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleSubmit = () => {
		navigate('/react/Whatsapp/send/page2');
	};

	const getDynamicModalValues = async () => {
		const staticPersonalField: personalFieldDataProps = {
			Status: translator('common.Status'),
			SmsStatus: translator('common.smsStatus'),
			CreationDate: translator('client.subscribedOn'),
			FirstName: translator('smsReport.firstName'),
			LastName: translator('smsReport.lastName'),
			Email: translator('common.Mail'),
			Telephone: translator('common.telephone'),
			Cellphone: translator('common.Cellphone'),
			Address: translator('common.address'),
			BirthDate: translator('common.birthDate'),
			City: translator('common.city'),
			State: translator('common.state'),
			Country: translator('common.country'),
			Zip: translator('common.zip'),
			Company: translator('common.company'),
			ReminderDate: translator('recipient.reminderDate'),
		};
		const { payload: personalFieldData }: personalFieldAPIProps =
			await dispatch<any>(getAccountExtraData());
		const { payload: landingPageData }: landingPageAPIProps =
			await dispatch<any>(getPreviousLandingData());
		setLandingPages(landingPageData);
		setpersonalFields({ ...staticPersonalField, ...personalFieldData });
	};

	const openDynamcFieldModal = async (variable: string) => {
		if (!personalFields || landingPages?.length <= 0) {
			await getDynamicModalValues();
		}
		setDynamicModalVariable(Number(variable?.replace(/[{}]/g, '')));
		setIsDynamcFieldModal(true);
	};

	const isUpdatedVaraiable = (variable: string) => {
		let updatedVariable = variable?.replace(/[{}]/g, '');
		const isAvaliable = updatedDynamicVariable?.find(
			(dynamicVariable: updatedVariableProps) =>
				dynamicVariable.VariableIndex === Number(updatedVariable)
		);
		return !!isAvaliable;
	};

	const getUpdatedVariableValue = (variable: string) => {
		let updatedVariable = variable?.replace(/[{}]/g, '');
		const variableValue = updatedDynamicVariable?.find(
			(dynamicVariable: updatedVariableProps) =>
				dynamicVariable.VariableIndex === Number(updatedVariable)
		)?.VariableValue;
		return variableValue ? variableValue : variable;
	};

	const highlightText = (tagData: tagDataProps) => {
		const isUpdated = isUpdatedVaraiable(tagData?.children);
		return (
			<strong
				className={clsx(
					classes.whatsappCampainHighlightText,
					`${isUpdated && 'updated'}`
				)}
				onClick={() => openDynamcFieldModal(tagData?.children)}>
				{isUpdated
					? getUpdatedVariableValue(tagData?.children)
					: tagData?.children}
			</strong>
		);
	};

	const setButtonsData = (buttonType: string, data: buttonsDataProps[]) => {
		let buttonData: quickReplyButtonProps[] | callToActionProps = [];
		switch (buttonType) {
			case 'quickReply':
				buttonData = data?.map((button: buttonsDataProps) => {
					return {
						id: uniqid(),
						typeOfAction: '',
						fields: [
							{
								fieldName: translator('whatsapp.websiteButtonText'),
								type: 'text',
								placeholder: translator(
									'whatsapp.websiteButtonTextPlaceholder'
								),
								value: button.title,
							},
						],
					};
				});
				return buttonData ? buttonData : [];
			case 'callToAction':
				buttonData = data?.map((button: buttonsDataProps) => {
					if (button?.type === 'PHONE') {
						return {
							id: uniqid(),
							typeOfAction: 'phonenumber',
							fields: [
								{
									fieldName: translator('whatsapp.phoneButtonText'),
									type: 'text',
									placeholder: translator(
										'whatsapp.phoneButtonTextPlaceholder'
									),
									value: button.title,
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
									value: button.phone,
								},
							],
						};
					} else {
						return {
							id: uniqid(),
							typeOfAction: 'website',
							fields: [
								{
									fieldName: translator('whatsapp.websiteButtonText'),
									type: 'text',
									placeholder: translator(
										'whatsapp.websiteButtonTextPlaceholder'
									),
									value: button.title,
								},
								{
									fieldName: translator('whatsapp.websiteURL'),
									type: 'text',
									placeholder: translator('whatsapp.websiteURLPlaceholder'),
									value: button.url,
								},
							],
						};
					}
				});
				return buttonData ? buttonData : [];
		}
	};

	const saveQuickreplyTemplate = (templateData: savedTemplateDataProps) => {
		const quickReplyData: savedTemplateQuickReplyProps =
			templateData?.types['quick-reply'];
		updatedButtonType = 'quickReply';
		const buttonData = setButtonsData('quickReply', quickReplyData?.actions);
		updatedTemplateData.templateText = quickReplyData?.body;
		updatedTemplateData.templateButtons = buttonData ? buttonData : [];
	};

	const saveCallToActionTemplate = (templateData: savedTemplateDataProps) => {
		const callToActionData: savedTemplateCallToActionProps =
			templateData?.types['call-to-action'];
		updatedButtonType = 'callToAction';
		const buttonData = setButtonsData(
			'callToAction',
			callToActionData?.actions
		);
		updatedTemplateData.templateText = callToActionData?.body;
		updatedTemplateData.templateButtons = buttonData ? buttonData : [];
	};

	const saveCardTemplate = (templateData: savedTemplateDataProps) => {
		const cardData: savedTemplateCardProps = templateData?.types['card'];
		updatedTemplateData.templateText = cardData?.title;
		if (cardData?.actions?.length > 0) {
			if (cardData?.actions[0]?.type !== 'QUICK_REPLY') {
				updatedButtonType = 'callToAction';
				const buttonData = setButtonsData('callToAction', cardData?.actions);
				updatedTemplateData.templateButtons = buttonData ? buttonData : [];
			} else {
				updatedButtonType = 'quickReply';
				const buttonData = setButtonsData('quickReply', cardData?.actions);
				updatedTemplateData.templateButtons = buttonData ? buttonData : [];
			}
		}
		if (cardData?.media?.length > 0) {
			updatedFileData = cardData?.media[0];
		}
	};

	const saveMediaTemplate = (templateData: savedTemplateDataProps) => {
		const mediaData: savedTemplateMediaProps = templateData?.types['media'];
		updatedTemplateData.templateText = mediaData?.body;
		if (mediaData?.media?.length > 0) {
			updatedFileData = mediaData?.media[0];
		}
	};

	const saveTextTemplate = (templateData: savedTemplateDataProps) => {
		const textData: savedTemplateTextProps = templateData?.types['text'];
		updatedTemplateData.templateText = textData?.body;
	};

	const setUpdatedTemplateData = (templateData: savedTemplateDataProps) => {
		if ('quick-reply' in templateData?.types) {
			saveQuickreplyTemplate(templateData);
		}
		if ('call-to-action' in templateData?.types) {
			saveCallToActionTemplate(templateData);
		} else if ('card' in templateData?.types) {
			saveCardTemplate(templateData);
		} else if ('media' in templateData?.types) {
			saveMediaTemplate(templateData);
		} else if ('text' in templateData?.types) {
			saveTextTemplate(templateData);
		}
	};

	const resetDynamicFields = () => {
		setDynamicVariable([]);
		setUpdatedDynamicVariable([]);
		setDynamicModalVariable(0);
	};

	const onSavedTemplateChange = (TemplateId: string) => {
		resetDynamicFields();

		setSavedTemplate(TemplateId);
		const savedTemplateData: savedTemplateListProps | undefined =
			savedTemplateList?.find((template) => template.TemplateId === TemplateId);
		const templateData: savedTemplateDataProps | undefined =
			savedTemplateData?.Data;
		if (templateData) {
			setUpdatedTemplateData(templateData);
		}
		setFileData(updatedFileData);
		// setTemplateName(savedTemplateData?.TemplateName || '');
		setButtonType(updatedButtonType);
		setTemplateData(updatedTemplateData);
		setDynamicVariable(getDynamicFields(updatedTemplateData.templateText));
		if (updatedButtonType === 'quickReply') {
			setQuickReplyButtons(updatedTemplateData.templateButtons);
		} else {
			setCallToActionFieldRows(updatedTemplateData.templateButtons);
		}
		if (templateData?.variables) {
			setDynamicFieldCount(Object.keys(templateData?.variables)?.length);
		}
	};

	const onChangeTestSendRadio = (value: string) => {
		if (value === 'testgroup') {
			setIsTestGroupModal(true);
		}
		setTestSendSelection(value);
	};

	const onRemoveGroupSelection = (e: BaseSyntheticEvent, GroupID: number) => {
		e.stopPropagation();
		e.preventDefault();
		const updatedSelectedGroup = selectedTestGroup.filter(
			(selectedGroup: testGroupDataProps) => selectedGroup?.GroupID !== GroupID
		);
		setSelectedTestGroup(updatedSelectedGroup);
	};

	const validateSaveCampaign = () => {
		if (campaignName?.length <= 0 || savedTemplate?.length <= 0) {
			let validationErrors = [];
			if (campaignName?.length <= 0 && savedTemplate?.length <= 0) {
				validationErrors.push('Campaign name - required fields');
				validationErrors.push('Template for sending - required fields');
			} else if (campaignName?.length <= 0) {
				validationErrors.push('Campaign name - required fields');
			} else if (savedTemplate?.length <= 0) {
				validationErrors.push('Template for sending - required fields');
			}
			setGroupSendValidationErrors([...validationErrors]);
			setShowValidation(true);
			return false;
		} else {
			return true;
		}
	};

	const onOkTestSending = () => {
		if (validateSaveCampaign()) {
		} else {
			setIsTestGroupModal(false);
			setIsValidationAlert(true);
		}
	};

	const onTestOneSend = () => {
		if (validateSaveCampaign()) {
		} else {
			setIsValidationAlert(true);
		}
	};

	const onCampaignFromRestore = () => {
		setFrom('012345689');
	};

	const onDynamcFieldModalSave = (
		updatedDynamicVariable: updatedVariableProps[]
	) => {
		setUpdatedDynamicVariable(updatedDynamicVariable);
		setIsDynamcFieldModal(false);
	};

	return (
		<DefaultScreen
			subPage={'create'}
			currentPage='whatsapp'
			classes={classes}
			customPadding={true}>
			<Grid container justifyContent='space-between' alignItems='center'>
				<Title
					Text={translator('whatsappCampaign.header')}
					Classes={classes.WhatsappCampainP1Title}
					ContainerStyle={{}}
					Element={null}
				/>
				<Box>
					<div style={{ textAlign: 'right', color: '#DC3D1B' }}>
						<b>
							<>{translator('whatsappCampaign.note')}</>
							<br />
							<span style={isRTL ? { marginRight: 180 } : { marginRight: 300 }}>
								{translator('whatsappCampaign.checkLimit')}{' '}
								<a href='https://business.facebook.com/settings/whatsapp-business-accounts/'>
									{translator('whatsappCampaign.here')}
								</a>
							</span>
						</b>
					</div>
				</Box>
			</Grid>
			<br />
			<form onSubmit={handleSubmit}>
				<Grid container className={classes.WhatsappCampainP1}>
					<Grid className={classes.WhatsappCampainP1Left} item md={12} lg={6}>
						<Grid container>
							<Grid className={classes.WhatsappCampainFields} md={12} lg={12}>
								<CampaignFields
									classes={classes}
									savedTemplateList={savedTemplateList}
									savedTemplate={savedTemplate}
									onSavedTemplateChange={(e) =>
										onSavedTemplateChange(e.target.value)
									}
									campaignName={campaignName}
									onCampaignNameChange={(campaignName) =>
										setCampaignName(campaignName)
									}
									from={from}
									onFromChange={(from) => setFrom(from)}
									onCampaignFromRestore={() => onCampaignFromRestore()}
									showValidation={showValidation}
								/>
							</Grid>
							<Grid className={classes.WhatsappCampainTextarea} md={12} lg={12}>
								<div className={classes.whatsappCampainHighlightContent}>
									<div className={classes.whatsappCampainHighlightTextWrapper}>
										<Highlighter
											searchWords={[
												...dynamicVariable,
												// ...updatedDynamicVariable,
											]}
											autoEscape={true}
											textToHighlight={templateData.templateText}
											highlightTag={(tagData: tagDataProps) =>
												highlightText(tagData)
											}
										/>
									</div>
									<Box
										className={classes.whatsappCampaignActionButtonsWrapper}
										id='buttons-wrapper'>
										{templateData.templateButtons?.map(
											(button: quickReplyButtonProps | callToActionRowProps) =>
												button.fields.map(
													(
														field:
															| quickReplyButtonsFieldProps
															| callToActionFieldProps
													) =>
														field.fieldName ===
															translator('whatsapp.phoneButtonText') && (
															<Box
																key={button.id}
																className={
																	classes.whatsappCampaignActionButtonsBox
																}>
																<Button
																	className={classes.whatsappActionButtons}
																	onClick={() =>
																		buttonType === 'quickReply'
																			? setIsQuickReplyOpen(true)
																			: setIsCallToActionOpen(true)
																	}>
																	{field.value}
																</Button>
															</Box>
														)
												)
										)}
									</Box>
								</div>
								<Box className={classes.whatsappSmallInfoDiv}>
									<span className={classes.textInfoWrapper}>
										<span className={classes.textInfo}>
											{linkCount === 1 ? (
												<>{translator('whatsappCampaign.link')}</>
											) : (
												<>{translator('whatsappCampaign.links')}</>
											)}
										</span>
										&nbsp;{linkCount}
									</span>

									<span className={classes.textInfoWrapper}>
										<span className={classes.textInfo}>
											{dynamicFieldCount === 1 ? (
												<>{translator('whatsappCampaign.dfield')}</>
											) : (
												<>{translator('whatsappCampaign.dfields')}</>
											)}
										</span>
										&nbsp;{dynamicFieldCount}
									</span>

									<span className={classes.textInfoWrapper}>
										{/* {templateText?.length} */}
										<span className={classes.textInfo}>
											<>{translator('whatsappCampaign.char')}</>
										</span>
										&nbsp;0/1024
									</span>
								</Box>
							</Grid>
						</Grid>
					</Grid>
					<Grid className={classes.WhatsappCampainP1Right} item md={12} lg={6}>
						<Grid container>
							<Grid item xs={12} sm={12} md={12} lg={12}>
								<Box>
									<WhatsappMobilePreview
										classes={classes}
										campaignNumber='1'
										templateData={templateData}
										buttonType={buttonType}
										fileData={fileData}
									/>
								</Box>
							</Grid>
							<Grid item xs={12} sm={12} md={12} lg={12}>
								<Box className={classes.switchDiv}>
									<FormGroup>
										<Switch
											checked={isTestSend}
											onChange={() => setIsTestSend(!isTestSend)}
											className={clsx(
												{ [classes.rtlSwitch]: isRTL },
												classes.WhatsappCampainSwitch
											)}
										/>
									</FormGroup>

									<Box className={classes.radio}>
										<Typography style={{ fontSize: '18px' }}>
											<>{translator('whatsappCampaign.tsend')}</>
										</Typography>
										<Typography className={classes.descSwitch}>
											<>{translator('whatsappCampaign.tsendDesc')}</>
										</Typography>
									</Box>
								</Box>

								{isTestSend && (
									<Box className={clsx(classes.radio, classes.testSendRadio)}>
										<RadioGroup
											aria-labelledby='demo-controlled-radio-buttons-group'
											defaultValue='onecontact'
											name='radio-buttons-group'
											onChange={(e: BaseSyntheticEvent) =>
												onChangeTestSendRadio(e.target.value)
											}>
											<FormControlLabel
												value='onecontact'
												control={
													<Radio
														className={classes.WhatsappCampainRadioButton}
													/>
												}
												label={
													<Typography style={{ fontSize: 18 }}>
														{translator('whatsappCampaign.oneContact')}
													</Typography>
												}
											/>
											<Stack direction='row' spacing={0.5} height={40}>
												<TextField
													required
													size='small'
													id='templateName'
													placeholder={translator(
														'whatsappCampaign.oneContactPlaceholder'
													)}
													className={clsx(classes.buttonField, classes.success)}
													disabled={testSendSelection !== 'onecontact'}
													onChange={(e: BaseSyntheticEvent) =>
														setTestSendOneContact(
															e.target.value?.replace(/\D/g, '')
														)
													}
													value={testSendOneContact}
												/>
												<Button
													disabled={
														testSendSelection !== 'onecontact' ||
														testSendOneContact?.length === 0
													}
													variant='outlined'
													color='primary'
													className={classes.testOneContactSendButton}
													onClick={() => onTestOneSend()}>
													{translator('whatsappCampaign.sendButton')}
												</Button>
											</Stack>
											<br />
											<Stack
												direction='row'
												alignItems={'center'}
												spacing={0.5}
												height={40}>
												<FormControlLabel
													value='testgroup'
													control={
														<Radio
															className={classes.WhatsappCampainRadioButton}
														/>
													}
													label={
														<Typography style={{ fontSize: 18 }}>
															{translator('whatsappCampaign.testGroups')}
														</Typography>
													}
												/>
												<span className={classes.testSendNewTag}>
													<>{translator('mainReport.newFeature')}</>
												</span>
											</Stack>
											{testSendSelection === 'testgroup' && (
												<Stack>
													<div className={classes.rightForm}>
														<div
															className={classes.contactGroupDiv}
															onClick={() => {
																setIsTestGroupModal(true);
															}}>
															{selectedTestGroup.length <= 0 && (
																<div>
																	{' '}
																	<>{translator('mainReport.ChooseLinks')}</>
																</div>
															)}
															{selectedTestGroup.length > 0 ? (
																<div className={classes.mappedGroup}>
																	{selectedTestGroup.map((item, index) => {
																		return (
																			<div
																				key={index}
																				className={classes.selectedGroupsDiv}>
																				<span className={classes.nameGroup}>
																					{item.GroupName}
																				</span>
																				<RiCloseFill
																					className={classes.groupCloseicn}
																					onClick={(event) => {
																						onRemoveGroupSelection(
																							event,
																							item.GroupID
																						);
																					}}
																				/>
																			</div>
																		);
																	})}
																</div>
															) : null}
														</div>
													</div>
												</Stack>
											)}
										</RadioGroup>
									</Box>
								)}
							</Grid>
						</Grid>
					</Grid>
				</Grid>
				<Grid container>
					<Buttons classes={classes} onFormButtonClick={() => {}} />
				</Grid>
			</form>

			<DynamicModal
				classes={classes}
				isDynamcFieldModal={isDynamcFieldModal}
				onDynamcFieldModalClose={() => setIsDynamcFieldModal(false)}
				personalFields={personalFields}
				landingPageData={landingPages}
				dynamicModalVariable={dynamicModalVariable}
				onDynamcFieldModalSave={(updatedDynamicVariable) =>
					onDynamcFieldModalSave(updatedDynamicVariable)
				}
				dynamicVariable={updatedDynamicVariable}
			/>

			<ValidationAlert
				classes={classes}
				isOpen={isValidationAlert}
				onClose={() => setIsValidationAlert(false)}
				title={translator('whatsappCampaign.sendValidation')}
				requiredFields={groupSendValidationErrors}
			/>

			<TestGroupModal
				classes={classes}
				isOpen={isTestGroupModal}
				onClose={() => setIsTestGroupModal(false)}
				title={translator('whatsappCampaign.sendTitle')}
				testGroupData={testGroups}
				selectedTestGroup={selectedTestGroup}
				setSelectedTestGroup={(updatedSelectedGroup) =>
					setSelectedTestGroup(updatedSelectedGroup)
				}
				onConfirmOrYes={() => onOkTestSending()}
			/>

			<QuickReply
				classes={classes}
				isQuickReplyOpen={isQuickReplyOpen}
				closeQuickReply={() => setIsQuickReplyOpen(false)}
				quickReplyButtons={quickReplyButtons}
				setQuickReplyButtons={() => {}}
				updateTemplateData={() => {}}
				templateButtons={templateData.templateButtons}
				isEditable={false}
			/>
			<ActionCallPopOver
				isCallToActionOpen={isCallToActionOpen}
				closeCallToAction={() => setIsCallToActionOpen(false)}
				classes={classes}
				callToActionFieldRows={callToActionFieldRows}
				setCallToActionFieldRows={(data) => setCallToActionFieldRows(data)}
				phoneNumberField={phoneNumberField}
				websiteField={websiteField}
				addMore={() => {}}
				updateTemplateData={() => {}}
				isEditable={false}
			/>
		</DefaultScreen>
	);
};

export default WhatsappCampaign;
