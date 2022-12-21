import React, { BaseSyntheticEvent, useEffect, useMemo, useState } from 'react';
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
} from './WhatsappCampaign.types';
import { ClassesType } from '../../Classes.types';
import CampaignFields from './CampaignFields';
import clsx from 'clsx';
import WhatsappMobilePreview from '../Editor/WhatsappMobilePreview';
import {
	callToActionFieldProps,
	callToActionProps,
	callToActionRowProps,
	quickReplyButtonProps,
	quickReplyButtonsFieldProps,
	savedTemplateCallToActionProps,
	savedTemplateCardProps,
	savedTemplateDataProps,
	savedTemplateListProps,
	savedTemplateMediaProps,
	savedTemplateQuickReplyProps,
	savedTemplateTextProps,
	templateDataProps,
} from '../Editor/WhatsappCreator.types';
import Highlighter from 'react-highlight-words';
import DynamicModal from './DynamicModal';
import Buttons from './Buttons';
import uniqid from 'uniqid';
import { getSavedTemplates } from '../../../redux/reducers/whatsappSlice';
import ValidationAlert from './ValidationAlert';
import TestGroupModal from './TestGroupModal';
import { RiCloseFill } from 'react-icons/ri';
import QuickReply from '../Editor/QuickReply';
import ActionCallPopOver from '../Editor/ActionCallPopOver';
import FilterRecipientsDialog from './FilterRecipientsDialog';

const WhatsappCampaign = ({ classes }: WhatsappCampaignProps) => {
	const { t: translator } = useTranslation();
	const dispatch = useDispatch();
	const testGroupData: testGroupDataProps[] = [
		{
			GroupID: 89979,
			GroupName: 'ccccc (Testing)',
			SubAccountID: 0,
			CreationDate: '2017-08-20T11:02:08.933',
			UpdateDate: '2017-08-20T11:02:08.933',
			IsTestGroup: false,
			IsDynamic: false,
			Recipients: 0,
		},
		{
			GroupID: 89980,
			GroupName: 'cdgsfsgdf (Testing)',
			SubAccountID: 0,
			CreationDate: '2017-08-20T11:02:39.197',
			UpdateDate: '2017-08-20T12:44:55.69',
			IsTestGroup: true,
			IsDynamic: false,
			Recipients: 5,
		},
		{
			GroupID: 166670,
			GroupName: 'left123',
			SubAccountID: 0,
			CreationDate: '2022-04-08T14:41:09.493',
			UpdateDate: '2022-04-17T12:46:45.297',
			IsTestGroup: true,
			IsDynamic: false,
			Recipients: 1,
		},
		{
			GroupID: 165652,
			GroupName: 'MeitalTest (Testing)',
			SubAccountID: 0,
			CreationDate: '2022-03-10T14:33:53.9',
			UpdateDate: '2022-03-10T14:33:53.9',
			IsTestGroup: true,
			IsDynamic: false,
			Recipients: 0,
		},
		{
			GroupID: 81457,
			GroupName: 'omer (Testing)',
			SubAccountID: 0,
			CreationDate: '2017-05-21T14:44:26.487',
			UpdateDate: '2017-05-21T14:45:34.537',
			IsTestGroup: true,
			IsDynamic: false,
			Recipients: 0,
		},
		{
			GroupID: 55962,
			GroupName: 'בדיקה (Testing)',
			SubAccountID: 0,
			CreationDate: '2016-01-18T18:24:45.42',
			UpdateDate: '2016-01-18T18:28:09.06',
			IsTestGroup: true,
			IsDynamic: false,
			Recipients: 2,
		},
	];
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
	const [isCampaign, setIsCampaign] = useState<boolean>(false);
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
	const [savedTemplateList, setSavedTemplateList] = useState<
		savedTemplateListProps[]
	>([]);
	const [dynamicVariable, setDynamicVariable] = useState<string[]>([
		'and',
		'the',
	]);
	const [updatedDynamicVariable, setUpdatedDynamicVariable] = useState<
		string[]
	>(['or']);
	const [groupSendValidationErrors, setGroupSendValidationErrors] = useState<
		string[]
	>([]);
	const [selectedTestGroup, setSelectedTestGroup] = useState<
		testGroupDataProps[]
	>([]);

	const [callToActionFieldRows, setCallToActionFieldRows] =
		useState<callToActionProps>([initialFieldRow]);
	const [linkCount, setlinkCount] = useState(0);
	const [messageCount, setMessageCount] = useState(0);

	const [quickReplyButtons, setQuickReplyButtons] = useState<
		quickReplyButtonProps[]
	>(initialQuickReplyButtons);

	const getSavedTemplateFields = async () => {
		let savedTemplate: any = await dispatch(
			getSavedTemplates({ templateStatus: 3 })
		);
		setSavedTemplateList(savedTemplate.payload.Items);
	};

	useEffect(() => {
		getSavedTemplateFields();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleSubmit = () => {};

	const isUpdatedVaraiable = (variable: string) => {
		return updatedDynamicVariable.includes(variable?.toLowerCase())
			? true
			: false;
	};

	const highlightText = ({ children, highlightIndex }: any) => {
		return (
			<strong
				className={clsx(
					classes.whatsappCampainHighlightText,
					`${isUpdatedVaraiable(children) && 'updated'}`
				)}
				onClick={() => setIsDynamcFieldModal(true)}>
				{children}
			</strong>
		);
	};

	const setButtonsData = (buttonType: string, data: any) => {
		if (buttonType === 'quickReply') {
			const buttonData = data?.map((button: any) => {
				return {
					id: uniqid(),
					typeOfAction: '',
					fields: [
						{
							fieldName: translator('whatsapp.websiteButtonText'),
							type: 'text',
							placeholder: translator('whatsapp.websiteButtonTextPlaceholder'),
							value: button.title,
						},
					],
				};
			});
			return buttonData;
		} else {
			const buttonData = data?.map((button: any) => {
				if (button?.type === 'PHONE') {
					return {
						id: uniqid(),
						typeOfAction: 'phonenumber',
						fields: [
							{
								fieldName: translator('whatsapp.phoneButtonText'),
								type: 'text',
								placeholder: translator('whatsapp.phoneButtonTextPlaceholder'),
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
			return buttonData;
		}
	};

	const onSavedTemplateChange = (TemplateId: string) => {
		setSavedTemplate(TemplateId);
		const savedTemplateData: savedTemplateListProps | undefined =
			savedTemplateList?.find((template) => template.TemplateId === TemplateId);
		const templateData: savedTemplateDataProps | undefined =
			savedTemplateData?.Data;
		let updatedTemplateData: templateDataProps = {
			templateText: '',
			templateButtons: [],
		};
		let updatedButtonType = '';
		let updatedFileData = '';
		if (templateData) {
			if ('quick-reply' in templateData?.types) {
				const quickReplyData: savedTemplateQuickReplyProps =
					templateData?.types['quick-reply'];
				updatedButtonType = 'quickReply';
				const buttonData = setButtonsData(
					'quickReply',
					quickReplyData?.actions
				);
				updatedTemplateData.templateText = quickReplyData?.body;
				updatedTemplateData.templateButtons = buttonData ? buttonData : [];
			}
			if ('call-to-action' in templateData?.types) {
				const callToActionData: savedTemplateCallToActionProps =
					templateData?.types['call-to-action'];
				updatedButtonType = 'callToAction';
				const buttonData = setButtonsData(
					'callToAction',
					callToActionData?.actions
				);
				updatedTemplateData.templateText = callToActionData?.body;
				updatedTemplateData.templateButtons = buttonData ? buttonData : [];
			} else if ('card' in templateData?.types) {
				const cardData: savedTemplateCardProps = templateData?.types['card'];
				updatedTemplateData.templateText = cardData?.title;
				if (cardData?.actions?.length > 0) {
					if (cardData?.actions[0]?.type !== 'QUICK_REPLY') {
						updatedButtonType = 'callToAction';
						const buttonData = setButtonsData(
							'callToAction',
							cardData?.actions
						);
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
			} else if ('media' in templateData?.types) {
				const mediaData: savedTemplateMediaProps = templateData?.types['media'];
				updatedTemplateData.templateText = mediaData?.body;
				if (mediaData?.media?.length > 0) {
					updatedFileData = mediaData?.media[0];
				}
			} else if ('text' in templateData?.types) {
				const textData: savedTemplateTextProps = templateData?.types['text'];
				updatedTemplateData.templateText = textData?.body;
			}
		}
		setFileData(updatedFileData);
		// setTemplateName(savedTemplateData?.TemplateName || '');
		setButtonType(updatedButtonType);
		setTemplateData(updatedTemplateData);
		if (updatedButtonType === 'quickReply') {
			setQuickReplyButtons(updatedTemplateData.templateButtons);
		} else {
			setCallToActionFieldRows(updatedTemplateData.templateButtons);
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

	const onOkTestSending = () => {
		if (campaignName?.length <= 0 || from?.length <= 0) {
			let validationErrors = [];
			if (campaignName?.length <= 0 && from?.length <= 0) {
				validationErrors.push('Campaign name - required fields');
				validationErrors.push('Text for sending - required fields');
			} else if (campaignName?.length <= 0) {
				validationErrors.push('Campaign name - required fields');
			} else if (from?.length <= 0) {
				validationErrors.push('Text for sending - required fields');
			}
			setGroupSendValidationErrors([...validationErrors]);
			setIsTestGroupModal(false);
			setIsValidationAlert(true);
		}
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
							{translator('whatsappCampaign.note')}
							<br />
							<span style={{ marginRight: 300 }}>
								Check your limit{' '}
								<a href='https://business.facebook.com/settings/whatsapp-business-accounts/'>
									here
								</a>
							</span>
						</b>
					</div>
				</Box>
			</Grid>

			<DynamicModal
				classes={classes}
				isDynamcFieldModal={isDynamcFieldModal}
				onDynamcFieldModalClose={() => setIsDynamcFieldModal(false)}
			/>
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
								/>
							</Grid>
							<Grid className={classes.WhatsappCampainTextarea} md={12} lg={12}>
								<div className={classes.whatsappCampainHighlightContent}>
									<div className={classes.whatsappCampainHighlightTextWrapper}>
										<Highlighter
											searchWords={[
												...dynamicVariable,
												...updatedDynamicVariable,
											]}
											autoEscape={true}
											textToHighlight="The dog is chasing the cat. Or perhaps they're just playing?"
											highlightTag={highlightText}
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
											{linkCount === 1
												? translator('whatsappCampaign.link')
												: translator('whatsappCampaign.links')}
										</span>
										&nbsp;{linkCount}
									</span>

									<span className={classes.textInfoWrapper}>
										<span className={classes.textInfo}>
											{messageCount === 1
												? translator('whatsappCampaign.dfield')
												: translator('whatsappCampaign.dfields')}
										</span>
										&nbsp;{messageCount}
									</span>

									<span className={classes.textInfoWrapper}>
										{/* {templateText?.length} */}
										<span className={classes.textInfo}>
											{translator('whatsappCampaign.char')}
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
											{translator('whatsappCampaign.tsend')}
										</Typography>
										<Typography className={classes.descSwitch}>
											{translator('whatsappCampaign.tsendDesc')}
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
														Send to one contact
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
													className={
														isCampaign
															? clsx(classes.buttonField, classes.error)
															: clsx(classes.buttonField, classes.success)
													}
													disabled={testSendSelection !== 'onecontact'}
													//   onChange={onTemplateNameChange}
													//   value={templateName}
												/>
												<Button
													disabled={testSendSelection !== 'onecontact'}
													variant='outlined'
													color='primary'
													className={classes.testOneContactSendButton}>
													SEND
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
															Send to test groups
														</Typography>
													}
												/>
												<span className={classes.testSendNewTag}>
													{translator('mainReport.newFeature')}
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
																	{translator('mainReport.ChooseLinks')}
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
			<ValidationAlert
				classes={classes}
				isOpen={isValidationAlert}
				onClose={() => setIsValidationAlert(false)}
				title={'The following fields are invalid'}
				requiredFields={groupSendValidationErrors}
			/>

			<TestGroupModal
				classes={classes}
				isOpen={isTestGroupModal}
				onClose={() => setIsTestGroupModal(false)}
				title={'Select group for test sending'}
				testGroupData={testGroupData}
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
				isEdiable={false}
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
				isEdiable={false}
			/>
		</DefaultScreen>
	);
};

export default WhatsappCampaign;
