import { useEffect, useState } from 'react';
import clsx from 'clsx';
import DefaultScreen from '../../DefaultScreen';
import { Title } from '../../../components/managment/Title';
import { useTranslation } from 'react-i18next';
import { Box, Button, Checkbox, Chip, FormControl, FormControlLabel, Grid, IconButton, MenuItem, TextField, Tooltip, Typography } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { Loader } from '../../../components/Loader/Loader';
import { ClassesType } from '../../Classes.types';
import { coreProps } from '../../Whatsapp/Campaign/Types/WhatsappCampaign.types';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import WizardActions from '../../../components/Wizard/WizardActions';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { Autocomplete, Select } from '@mui/material';
import { IoIosArrowDown } from 'react-icons/io';
import { LandingPagesAnswerType, PlaceHolders } from '../../../helpers/Constants';
import { DateField } from '../../../components/managment';
import moment from 'moment';
import PulseemTags from '../../../components/Tags/PulseemTags';
import { FileGallery } from '../../../Models/Files/FileGallery';
import { BiPlus, BiUpload } from 'react-icons/bi';
import Gallery from '../../../components/Gallery/Gallery.component';
import { PulseemFolderType } from '../../../model/PulseemFields/Fields';
import { RandomID } from '../../../helpers/Functions/functions';
import { validateEmailAddress } from '../../../helpers/Utils/common';
import { isValidHttpUrl } from '../../../helpers/Utils/TextHelper';
import Groups from '../../../components/Groups/GroupsHandler/Groups';
import { Group } from '../../../Models/Groups/Group';
import { getGroupsBySubAccountId } from '../../../redux/reducers/groupSlice';
import { BsInfoCircle } from 'react-icons/bs';
import { saveLandingPage } from '../../../redux/reducers/landingPagesSlice';
import { sitePrefix } from '../../../config';
import { useNavigate } from 'react-router-dom';
import Templates from '../../HtmlCampaign/modals/Templates';

const CreateLandingPage = ({ classes }: ClassesType) => {
	const dispatch: any = useDispatch();
	const navigate = useNavigate();
	const { t: translator } = useTranslation();
	const { isRTL, windowSize } = useSelector(
		(state: { core: coreProps }) => state.core
	);
	const [isLoader, setIsLoader] = useState<boolean>(false);
	const [dialogType, setDialogType] = useState<{
		type: string;
	} | null>(null);
	const [confirmExit, setConfirmExit] = useState<boolean>(false);
	const { subAccountAllGroups } = useSelector((state: any) => state.group);
	const { testGroups } = useSelector((state: any) => state.sms);
	const [errors, setErrors] = useState({
		formName: '',
		formLanguage: '',
		shortURL: '',
		pageTitle: '',
		answerMessage: '',
		paymentURL: '',
		paymentAPIUsername: '',
		paymentTerminalNumber: '',
		offlineURL: '',
		group: '',
		pageDescription: '',
		googleAnalytics: '',
		googleConvertion: '',
		googleTagManager: '',
		facebookPixel: '',
		cssStyle: '',
		previewTitle: '',
		previewIcon: '',
		previewDescription: '',
		seoPageTitle: '',
		seoKeywords: '',
		seoDescription: '',
		reportLeadsToEmails: '',
		updateExistingRecipients: '',
		limitSubscribers: '',
		emailId: '',
	});
	const [filesProperties, setFilesProperties] = useState<FileGallery[]>([]);
	const [isGalleryConfirmed, setIsFileSelected] = useState(false);
	const [emailId, setEmailId] = useState('');
	const [showTestGroups, setShowTestGroups] = useState(false);
	const [selectedGroups, setSelectedGroups] = useState<any>([]);
	const [allGroupsSelected, setAllGroupsSelected] = useState(false);
	const [formValues, setFormValues] = useState<any>({
		formName: '',
		formLanguage: isRTL ? 0 : 1,
		shortURL: '',
		answerType: 0,
		pageTitle: '',
		answerMessage: '',
		paymentURL: '',
		paymentAPIUsername: '',
		paymentTerminalNumber: '',
		offlineDate: null,
		offlineURL: null,
		pageDescription: '',
		googleAnalytics: '',
		googleConvertion: '',
		googleTagManager: '',
		facebookPixel: '',
		cssStyle: '',
		previewTitle: '',
		previewIcon: '',
		previewDescription: '',
		seoPageTitle: '',
		seoKeywords: [],
		seoDescription: '',
		reportLeadsToEmails: [],
		updateExistingRecipients: 0,
		limitSubscribers: '',
		duplicateMailConfirmation: true
	})

	const getData = async () => {
		setIsLoader(true);

		if (subAccountAllGroups.length === 0) {
			dispatch(getGroupsBySubAccountId());
		}
		setIsLoader(false);
  };

	useEffect(() => {
		getData();
	}, []);

	const getSendWebhookDialog = (data = '') => ({
    title: translator('landingPages.sendWebhook'),
    showDivider: false,
    content: (
      <Typography style={{ fontSize: 18 }}>
        {translator('landingPages.sendWebhook')}
      </Typography>
    ),
    onConfirm: async () => {}
  })

	const handleSelectedImage = async (file: string) => {
		if (!file || file[0] === '') {
				setIsFileSelected(false);
				return;
		}
		const existsFiles = [...filesProperties];

		const existFile = filesProperties.find((f) => {
			return f.FileURL === file
		});

		if (!existFile) {
			let fileName = file.split('/')[file.split('/').length - 1];
			const newFile = {
				Name: fileName,
				FileName: fileName,
				FolderType: PulseemFolderType.CLIENT_IMAGES,
				FileURL: file,
				ID: RandomID()
			}
			existsFiles.push(newFile as any);
		}
		setFilesProperties(existsFiles);
		setDialogType(null);
	}

	const removeAttachmentFile = async (event: any, fileId: number) => {
		event.preventDefault();
		event.stopPropagation();
		setFilesProperties(filesProperties.filter((f: any) => f.ID !== fileId));
	}

	const removeEmailId = async (event: any, fileId: string) => {
		event.preventDefault();
		event.stopPropagation();
		setFormValues({
			...formValues,
			reportLeadsToEmails: formValues.reportLeadsToEmails.filter((f: string) => f !== fileId)
		});
	}

	const renderGalleryDialog = () => {
		return {
			showDivider: false,
			title: translator("common.documentGallery"),
			content: (
				<Gallery
					classes={classes}
					isConfirm={isGalleryConfirmed}
					callbackSelectFile={handleSelectedImage}
					multiSelect={false}
					selected={[]}
					folderType={PulseemFolderType.DOCUMENT}
				/>
			),
			onConfirm: () => {
				setIsFileSelected(true);
			},
			onCancel: () => setIsFileSelected(false)
		};
	}
	
	const renderAddEmailIdDialog = () => {
		return {
			showDivider: false,
			title: translator("landingPages.addEmailAddress"),
			content: (
				<Box>
					<Typography title={translator("common.Email")} className={classes.alignDir}>
						{translator("common.Email")}
					</Typography>
					<TextField
						id="campaignName"
						label=""
						variant="outlined"
						name="Name"
						value={emailId}
						className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
						autoComplete="off"
						onChange={(e: any) => setEmailId(e.target.value.trim())}
						title={emailId}
					/>
					<Box className='textBoxWrapper'>
						<Typography className={clsx(errors.emailId ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
							{errors.emailId ?? errors.emailId}
						</Typography>
					</Box>
				</Box>
			),
			renderButtons: () => (
				<Grid
					container
					spacing={2}
					className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null)}
				>
					<Grid item>
						<Button
							onClick={() => {
								let isValid = validateEmailAddress(emailId);
								setErrors({
									...errors,
									emailId: isValid ? '' : translator('common.invalidEmail')
								});

								if (isValid && formValues.reportLeadsToEmails.indexOf(emailId) !== -1) {
									setErrors({
										...errors,
										emailId: translator('common.EmailExist')
									});
									isValid = false;
								}

								if (isValid) {
									setFormValues({
										...formValues,
										reportLeadsToEmails: [...formValues.reportLeadsToEmails, emailId]
									});
									setDialogType(null);
									setEmailId('');
								}
							}}
							className={clsx(
								classes.btn,
								classes.btnRounded
							)}
						>
							{translator("mainReport.add")}
						</Button>
					</Grid>
					<Grid item>
						<Button
							onClick={() => {
								setDialogType(null);
								setEmailId('');
							}}
							className={clsx(
								classes.btn,
								classes.btnRounded
							)}
						>
							{translator('common.cancel')}
						</Button>
					</Grid>
				</Grid>
			)
		};
	}

	const renderConfirmExitDialog = () => {
		return {
			showDivider: false,
			title: translator("common.SaveExit"),
			content: (
				<Box>
					<Typography variant="subtitle1">
						{translator("landingPages.confirmExit")}
					</Typography>
				</Box>
			),
  		confirmText: "common.Yes",
			cancelText: "common.No",
			onConfirm: async () => {
				const response = await save();
				navigate(`${sitePrefix}EditRegistrationPage`);
			},
			onClose: () => {
				setDialogType(null);
				navigate(`${sitePrefix}EditRegistrationPage`);
			},
		};
	}

	const renderTemplateDialog = () => {
		return {
			showDivider: false,
			title: translator("common.SelectTemplate"),
			showDefaultButtons: false,
			content: (
				// <Templates
				// 	isCreateCampaign={true}
				// 	classes={classes}
				// 	onClose={async (template: any) => {
				// 			// setDialogType(null);
				// 			// if (template !== undefined) {
				// 			// 		const response = await dispatch(getTemplateById(template.ID));
				// 			// 		if (response.payload.StatusCode === 201) {
				// 			// 				setTemplate(response?.payload?.Data);
				// 			// 		}
				// 			// }
				// 	}}
				// 	isOpen={true}
				// />
				<>
				</>
			),
			onConfirm: async () => {
				const response = await save();
				navigate(`${sitePrefix}EditRegistrationPage`);
			},
		};
	}
	
	const renderDialog = () => {
		const { type } = dialogType || {}
		let currentDialog: any = {};
		if (type === 'sendWebhook') {
			currentDialog = getSendWebhookDialog();
		} else if (type === 'galleryDialog') {
			currentDialog = renderGalleryDialog();
		} else if (type === 'addEmailId') {
			currentDialog = renderAddEmailIdDialog();
		} else if (type === 'confirmExit') {
			currentDialog = renderConfirmExitDialog();
		} else if (type === 'template') {
			currentDialog = renderTemplateDialog();
		}

		if (type) {
			return (
				dialogType && <BaseDialog
					classes={classes}
					open={dialogType}
					onCancel={() => setDialogType(null)}
					onClose={() => setDialogType(null)}
					renderButtons={currentDialog?.renderButtons || null}
					{...currentDialog}>
					{currentDialog?.content}
				</BaseDialog>
			)
		}
	}

	const save = async () => {
		const errorDump = {
			...errors,
			formName: !formValues.formName.trim() ? translator('landingPages.formNameRequired') : '',
			shortURL: !formValues.shortURL.trim() ? translator('landingPages.shortURLRequired') : '',
			answerMessage: [
					LandingPagesAnswerType.POPUP_MESSAGE,
					LandingPagesAnswerType.REDIRECT_URL,
					LandingPagesAnswerType.DOWNLOAD_FILE
				].indexOf(formValues.answerType) > -1 && !formValues.answerMessage.trim() ? translator('landingPages.answerMessageRequired') : '',
			paymentURL: [
					LandingPagesAnswerType.TRANSFER_TO_PAYMENT_PAGE
				].indexOf(formValues.answerType) > -1 && !formValues.paymentURL.trim() ? translator('landingPages.URLRequired') : '',
			paymentAPIUsername: [
					LandingPagesAnswerType.TRANSFER_TO_PAYMENT_PAGE
				].indexOf(formValues.answerType) > -1 && !formValues.paymentAPIUsername.trim() ? translator('landingPages.APIUsernameRequired') : '',
			paymentTerminalNumber: [
					LandingPagesAnswerType.TRANSFER_TO_PAYMENT_PAGE
				].indexOf(formValues.answerType) > -1 && !formValues.paymentTerminalNumber.trim() ? translator('landingPages.terminalNumberRequired') : '',
			offlineURL:	formValues.offlineDate && !isValidHttpUrl(formValues.offlineURL) ? translator('landingPages.invalidRedirectURLWhenOffline') : '',
			group: selectedGroups.length === 0 ? translator('landingPages.selectAtleastOneGroup') : ''
		};
		setErrors(errorDump);

		if (!errorDump.formName && !errorDump.shortURL && !errorDump.answerMessage && !errorDump.paymentURL && !errorDump.paymentAPIUsername && !errorDump.paymentTerminalNumber && !errorDump.offlineURL && !errorDump.group) {
			//@ts-ignore
			const response = await dispatch(saveLandingPage(formValues));
			console.log(response);
			return true;
		}
	}

	const saveAndContinueToOldEditor = async () => {
		const response = await save();
		console.log(response);
	}

	const saveAndContinueToNewEditor = async () => {
		const response = await save();
		console.log(response);
	}

	const renderButtons = () => {
		const wizardButtons = [];

		wizardButtons.push(
			<Button
				onClick={saveAndContinueToOldEditor}
				className={clsx(
						classes.btn,
						classes.btnRounded,
						classes.backButton
				)}
				style={{ margin: '8px' }}
				endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
			>
				{translator('common.saveAndContinue')}
			</Button>
		);

		wizardButtons.push(
			<Button
				onClick={saveAndContinueToNewEditor}
				className={clsx(
						classes.btn,
						classes.btnRounded,
						classes.backButton
				)}
				style={{ margin: '8px' }}
				endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
			>
				{translator('master.continueToNewEditor')}
			</Button>
		);
		return wizardButtons.map((b) => b);
	}

	const renderTemplateButtons = () => {
		return (
			<Button 
				onClick={() => setDialogType({type: 'template'})}
				className={clsx(classes.btn, classes.btnRounded )}
				style={{ margin: '8px' }}
			>
				{translator('common.templates')}
			</Button>
		);
	}

	const callbackUpdateGroups = (groups: any) => {
		const found = selectedGroups.map((group: Group) => { return group.GroupID; }).includes(groups.GroupID);
		const groupList: Group[] = found
				? selectedGroups.filter((g: Group) => g.GroupID !== groups.GroupID)
				: [...selectedGroups, groups];
		setSelectedGroups(groupList);
	}

	const callbackSelectAll = () => {
		let groupList: Group[] = [];
		if (!allGroupsSelected) {
			groupList = showTestGroups ? [...testGroups, ...subAccountAllGroups] : [...subAccountAllGroups];
		} else {
			groupList = [];
		}
		setSelectedGroups(groupList);
		setAllGroupsSelected(!allGroupsSelected);
	}

	return (
		<DefaultScreen
			currentPage="newsletter"
			subPage={"newsletterInfo"}
			classes={classes}
			customPadding={true}
			containerClass={clsx(classes.mb50, classes.editorCont)}
		>
			<Box className="head">
				<Title Text={translator("landingPages.createLandingPage")} classes={classes} />
			</Box>
			<Box className={"containerBody"}>
				<Grid container spacing={3} className={clsx(classes.p15)}>
					<Grid item md={12}>
						<Typography className={clsx(classes.f22, classes.bold, classes.pb5)}>{translator("landingPages.formProperties")}</Typography>
					</Grid>
					<Grid item md={4}>
						<Box>
							<Typography title={translator("campaigns.camapignName")} className={classes.alignDir}>
								{translator("landingPages.formName")}
							</Typography>
							<TextField
								id="campaignName"
								label=""
								variant="outlined"
								name="Name"
								value={formValues.formName}
								className={clsx(classes.NoPaddingtextField, classes.textField, classes.w100, { [classes.textFieldError]: !!errors.formName })}
								autoComplete="off"
								onChange={(e: any) => setFormValues({ ...formValues, formName: e.target.value })}
								error={!!errors.formName}
								title={formValues.formName}
							/>
							<Box className='textBoxWrapper'>
								<Typography className={clsx(errors.formName ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
									{errors.formName ?? errors.formName}
								</Typography>
							</Box>
						</Box>
					</Grid>
					
					<Grid item md={4}>
						<Box>
							<Typography title={translator("landingPages.formLanguage")} className={classes.alignDir}>
								{translator("landingPages.formLanguage")}
							</Typography>
							<FormControl variant='standard' className={clsx(classes.selectInputFormControl, classes.w100)}>
								<Select
									variant="standard"
									name="FromEmail"
									value={formValues.formLanguage}
									className={classes.pbt5}
									onChange={(event, val) => {
											setFormValues({ ...formValues, formLanguage: event.target.value });
											setErrors({ ...errors, formLanguage: '' });
									}}
									IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
									MenuProps={{
										PaperProps: {
											style: {
												maxHeight: 300,
											},
										},
									}}
								>
									<MenuItem value={0}>{translator("languages.langCodes.hebrew")}</MenuItem>
									<MenuItem value={1}>{translator("languages.langCodes.english")}</MenuItem>
								</Select>
							</FormControl>
							<Box className='textBoxWrapper'>
								<Typography className={clsx(errors.formLanguage ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
									{errors.formLanguage ?? errors.formLanguage}
								</Typography>
							</Box>
						</Box>
					</Grid>
					
					<Grid item md={4}>
						<Box>
							<Typography title={translator("landingPages.shortURL")} className={classes.alignDir}>
								{translator("landingPages.shortURL")}
								<Tooltip
									disableFocusListener
									title={translator('landingPages.shortURLTooltip')}
									classes={{
										tooltip: clsx(classes.tooltipBlack, classes.tooltipPlacement),
										arrow: classes.fBlack
									}}
									enterTouchDelay={50}
									placement={"top"}
								>
									<IconButton className={clsx(classes.icon_Info, classes.noPadding, classes.ml5)}>
										<BsInfoCircle />
									</IconButton>
								</Tooltip>
							</Typography>
							<TextField
								id="shortURL"
								label=""
								variant="outlined"
								name="Name"
								value={formValues.shortURL}
								className={clsx(classes.NoPaddingtextField, classes.textField, classes.w100, { [classes.textFieldError]: !!errors.shortURL })}
								autoComplete="off"
								onChange={(e: any) => setFormValues({ ...formValues, shortURL: e.target.value })}
								error={!!errors.shortURL}
								title={formValues.shortURL}
							/>
							<Box className='textBoxWrapper'>
								<Typography className={clsx(classes.f16)}>
									https://testpul.site/{formValues.shortURL}
								</Typography>
								<Typography className={clsx(classes.errorText, classes.f14)}>
									{errors.shortURL ?? errors.shortURL}
								</Typography>
							</Box>
						</Box>
					</Grid>

					<Grid item md={4}>
						<Box>
							<Typography title={translator("landingPages.answerType")} className={classes.alignDir}>
								{translator("landingPages.answerType")}
							</Typography>
							<FormControl variant='standard' className={clsx(classes.selectInputFormControl, classes.w100)}>
								<Select
									variant="standard"
									name="FromEmail"
									value={formValues.answerType}
									className={classes.pbt5}
									onChange={(event, val) => {
											setFormValues({ ...formValues, answerType: event.target.value });
											if (event.target.value === LandingPagesAnswerType.SEND_WEBHOOK) setDialogType({type: 'sendWebhook'})
									}}
									IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
									MenuProps={{
										PaperProps: {
											style: {
												maxHeight: 300,
											},
										},
									}}
								>
									<MenuItem value={LandingPagesAnswerType.SYSTEM_DEFAULT_MESSAGE}>{translator("landingPages.systemDefaultMessage")}</MenuItem>
									<MenuItem value={LandingPagesAnswerType.POPUP_MESSAGE}>{translator("landingPages.popupMessage")}</MenuItem>
									<MenuItem value={LandingPagesAnswerType.REDIRECT_URL}>{translator("landingPages.redirectToURL")}</MenuItem>
									<MenuItem value={LandingPagesAnswerType.DOWNLOAD_FILE}>{translator("landingPages.downloadFile")}</MenuItem>
									<MenuItem value={LandingPagesAnswerType.TRANSFER_TO_PAYMENT_PAGE}>{translator("landingPages.transferToPaymentPage")}</MenuItem>
									<MenuItem value={LandingPagesAnswerType.SEND_WEBHOOK}>{translator("landingPages.sendWebhook")}</MenuItem>
								</Select>
							</FormControl>
						</Box>
					</Grid>

					{
						[LandingPagesAnswerType.POPUP_MESSAGE,
							LandingPagesAnswerType.REDIRECT_URL,
							LandingPagesAnswerType.DOWNLOAD_FILE
						].indexOf(formValues.answerType) > -1 && (
							<Grid item md={4}>
								<Box>
									<Typography title={translator("landingPages.answerMessage")} className={classes.alignDir}>
										{translator("landingPages.answerMessage")}
									</Typography>
									<TextField
										label=""
										variant="outlined"
										value={formValues.answerMessage}
										className={clsx(classes.NoPaddingtextField, classes.textField, classes.w100, { [classes.textFieldError]: !!errors.answerMessage })}
										autoComplete="off"
										onChange={(e: any) => setFormValues({ ...formValues, answerMessage: e.target.value })}
										error={!!errors.answerMessage}
										title={formValues.answerMessage}
									/>
									<Box className='textBoxWrapper'>
										<Typography className={clsx(errors.answerMessage ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
											{errors.answerMessage ?? errors.answerMessage}
										</Typography>
									</Box>
								</Box>
							</Grid>
						)
					}

					{
						formValues.answerType === LandingPagesAnswerType.TRANSFER_TO_PAYMENT_PAGE && (
							<>
								<Grid item md={3}>
									<Box>
										<Typography title={translator("landingPages.URL")} className={classes.alignDir}>
											{translator("landingPages.URL")}
										</Typography>
										<TextField
											label=""
											variant="outlined"
											value={formValues.paymentURL}
											className={clsx(classes.NoPaddingtextField, classes.textField, classes.w100, { [classes.textFieldError]: !!errors.paymentURL })}
											autoComplete="off"
											onChange={(e: any) => setFormValues({ ...formValues, paymentURL: e.target.value })}
											error={!!errors.paymentURL}
											title={formValues.paymentURL}
										/>
										<Box className='textBoxWrapper'>
											<Typography className={clsx(errors.paymentURL ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
												{errors.paymentURL ?? errors.paymentURL}
											</Typography>
										</Box>
									</Box>
								</Grid>

								<Grid item md={3}>
									<Box>
										<Typography title={translator("landingPages.APIUsername")} className={classes.alignDir}>
											{translator("landingPages.APIUsername")}
										</Typography>
										<TextField
											label=""
											variant="outlined"
											value={formValues.paymentAPIUsername}
											className={clsx(classes.NoPaddingtextField, classes.textField, classes.w100, { [classes.textFieldError]: !!errors.paymentAPIUsername })}
											autoComplete="off"
											onChange={(e: any) => setFormValues({ ...formValues, paymentAPIUsername: e.target.value })}
											error={!!errors.paymentAPIUsername}
											title={formValues.paymentAPIUsername}
										/>
										<Box className='textBoxWrapper'>
											<Typography className={clsx(errors.paymentAPIUsername ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
												{errors.paymentAPIUsername ?? errors.paymentAPIUsername}
											</Typography>
										</Box>
									</Box>
								</Grid>

								<Grid item md={2}>
									<Box>
										<Typography title={translator("landingPages.terminalNumber")} className={classes.alignDir}>
											{translator("landingPages.terminalNumber")}
										</Typography>
										<TextField
											label=""
											variant="outlined"
											value={formValues.paymentTerminalNumber}
											className={clsx(classes.NoPaddingtextField, classes.textField, classes.w100, { [classes.textFieldError]: !!errors.paymentTerminalNumber })}
											autoComplete="off"
											onChange={(e: any) => setFormValues({ ...formValues, paymentTerminalNumber: e.target.value })}
											error={!!errors.paymentTerminalNumber}
											title={formValues.paymentTerminalNumber}
										/>
										<Box className='textBoxWrapper'>
											<Typography className={clsx(errors.paymentTerminalNumber ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
												{errors.paymentTerminalNumber ?? errors.paymentTerminalNumber}
											</Typography>
										</Box>
									</Box>
								</Grid>
							</>
						)
					}
				</Grid>

				<Grid container spacing={3} className={clsx(classes.p15, classes.pt2rem)}>
					<Grid item md={12}>
						<Typography className={clsx(classes.f22, classes.bold, classes.pb5)}>
							{translator("landingPages.formOfflineProperties")}
							<Tooltip
								disableFocusListener
								title={translator('landingPages.formOfflineDateTooltip')}
								classes={{
									tooltip: clsx(classes.tooltipBlack, classes.tooltipPlacement),
									arrow: classes.fBlack
								}}
								enterTouchDelay={50}
								placement={"top"}
							>
								<IconButton className={clsx(classes.icon_Info, classes.noPadding, classes.ml5)}>
									<BsInfoCircle />
								</IconButton>
							</Tooltip>
						</Typography>
					</Grid>

					<Grid item md={2}>
						<Box>
							<Typography title={translator("landingPages.formOfflineDate")} className={classes.alignDir}>
								{translator("landingPages.formOfflineDate")}
							</Typography>
							<DateField
								minDate={moment()}
								maximumDate={moment().add(100, 'y')}
								classes={classes}
								value={formValues.offlineDate}
								onChange={(value: any) => {
									setFormValues({
										...formValues,
										offlineDate: value
									})
								}}
								placeholder={translator('common.FromDate')}
								timePickerOpen={false}
								dateActive={true}
								onTimeChange={() => {}}
								timeActive={false}
								buttons={[]}    
								removePadding={true}
								hideInvalidDateMessage={true}
							/>
							{
								formValues.offlineDate && (
									<Button
										className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)}
										onClick={() => {
											setFormValues({
												...formValues,
												offlineDate: null,
												offlineURL: '',
											});

											setErrors({
												...errors,
												offlineURL: '',
											})
										}}
									>
										{translator("recipient.reset")}
									</Button>
								)
							}
						</Box>
					</Grid>

					<Grid item md={4}>
						<Box>
							<Typography title={translator("landingPages.redirectURLWhenOffline")} className={classes.alignDir}>
								{translator("landingPages.redirectURLWhenOffline")}
							</Typography>
							<TextField
								id="redirectURLWhenOffline"
								label=""
								variant="outlined"
								name="redirectURLWhenOffline"
								value={formValues.offlineURL}
								className={clsx(classes.NoPaddingtextField, classes.textField, classes.w100, { [classes.textFieldError]: !!errors.offlineURL })}
								autoComplete="off"
								onChange={(e: any) => setFormValues({ ...formValues, offlineURL: e.target.value })}
								error={!!errors.offlineURL}
								title={formValues.offlineURL}
							/>
							<Box className='textBoxWrapper'>
								<Typography className={clsx(errors.offlineURL ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
									{errors.offlineURL ?? errors.offlineURL}
								</Typography>
							</Box>
						</Box>
					</Grid>
				</Grid>

				<Grid container spacing={3} className={clsx(classes.p15, classes.pt2rem)}>
					<Grid item md={12}>
						<Typography className={clsx(classes.f22, classes.bold, classes.pb5)}>{translator("landingPages.subscriberSettings")}</Typography>
					</Grid>

					<Grid item md={12}>
						<Box>
							<Typography title={translator("landingPages.redirectURLWhenOffline")} className={clsx(classes.alignDir, classes.pb10, classes.bold)}>
								{translator("landingPages.addSubscribersToGroups")}
							</Typography>
							<Groups
								classes={classes}
								list={
									showTestGroups ? [...subAccountAllGroups, ...testGroups] : [...subAccountAllGroups]
								}
								showTestGroups={showTestGroups}
								// test={showTestGroups}
								selectedList={selectedGroups}
								//@ts-ignore
								callbackSelectedGroups={callbackUpdateGroups}
								//@ts-ignore
								callbackSelectAll={callbackSelectAll}
								//@ts-ignore
								callbackShowTestGroup={() => setShowTestGroups(!showTestGroups)}
								showSortBy={true}
								showFilter={false}
								showSelectAll={true}
								isFilterSelected={false}
								bsDot={null}
								isNotifications={false}
								isSms={true}
								isCampaign={false}
								noSelectionText={''}
								// isFilterSelected={false}
							/>
							<Box className='textBoxWrapper'>
								<Typography className={clsx(errors.group ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
									{errors.group ?? errors.group}
								</Typography>
							</Box>
						</Box>
					</Grid>

					<Grid item md={4}>
						<Box>
							<Typography title={translator("landingPages.reportLeadsToEmails")} className={classes.alignDir}>
								{translator("landingPages.reportLeadsToEmails")}
							</Typography>
							<PulseemTags
								title={""}
								style={null}
								classes={classes}
								tagStyle={{ maxWidth: 150 }}
								// @ts-ignore
								items={formValues.reportLeadsToEmails?.map((f) => {
										return {
												Name: f,
												ID: f
										};
								})}
								// @ts-ignore
								onShowModal={() => setDialogType({type: 'addEmailId'})}
								// @ts-ignore
								handleRemove={removeEmailId}
								// @ts-ignore
								icon={<BiPlus />}
							/>
							<Box className='textBoxWrapper'>
								<Typography className={clsx(errors.reportLeadsToEmails ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
									{errors.reportLeadsToEmails ?? errors.reportLeadsToEmails}
								</Typography>
							</Box>
						</Box>
					</Grid>
					
					<Grid item md={4}>
						<Box>
							<Typography title={translator("landingPages.updateExistingRecipients")} className={classes.alignDir}>
								{translator("landingPages.updateExistingRecipients")}
							</Typography>
							<FormControl variant='standard' className={clsx(classes.selectInputFormControl, classes.w100)}>
								<Select
									variant="standard"
									name="FromEmail"
									value={formValues.updateExistingRecipients}
									className={classes.pbt5}
									onChange={(event, val) => setFormValues({ ...formValues, updateExistingRecipients: event.target.value })}
									IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
									MenuProps={{
										PaperProps: {
											style: {
												maxHeight: 300,
											},
										},
									}}
								>
									<MenuItem value={0}>{translator("common.disabled")}</MenuItem>
									<MenuItem value={1}>{translator("common.enabled")}</MenuItem>
								</Select>
							</FormControl>
						</Box>
					</Grid>
					
					<Grid item md={4}>
						<Box>
							<Typography title={translator("landingPages.limitNumberOfSubscribers")} className={classes.alignDir}>
								{translator("landingPages.limitNumberOfSubscribers")}
							</Typography>
							<TextField
								id="limitNumberOfSubscribers"
								label=""
								variant="outlined"
								name="Name"
								value={formValues.limitNumberOfSubscribers}
								className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
								autoComplete="off"
								onChange={(e: any) => setFormValues({ ...formValues, limitNumberOfSubscribers: e.target.value < 0 ? 0 : e.target.value })}
								title={formValues.limitNumberOfSubscribers}
								type='number'
							/>
						</Box>
					</Grid>

					<Grid item md={12}>
						<FormControlLabel
              control={
                <Checkbox
                  color="primary"
                  inputProps={{ "aria-label": "secondary checkbox" }}
                  onClick={() => setFormValues({
										...formValues,
										duplicateMailConfirmation: !formValues.duplicateMailConfirmation
									})}
                  checked={formValues.duplicateMailConfirmation}
                />
              }
              label={translator("landingPages.duplicateEmailConfirmation")}
            />
					</Grid>
				</Grid>

				<Grid container spacing={3} className={clsx(classes.p15, classes.pt2rem)}>
					<Grid item md={12}>
						<Typography className={clsx(classes.f22, classes.bold, classes.pb5)}>{translator("landingPages.SEOSettings")}</Typography>
					</Grid>

					<Grid item md={12}>
						<Box>
							<Typography title={translator("landingPages.pageTitle")} className={classes.alignDir}>
								{translator("landingPages.pageTitle")}
							</Typography>
							<TextField
								id="pageTitle"
								label=""
								variant="outlined"
								name="pageTitle"
								value={formValues.seoPageTitle}
								className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100, { [classes.textFieldError]: !!errors.seoPageTitle })}
								autoComplete="off"
								onChange={(e: any) => setFormValues({ ...formValues, seoPageTitle: e.target.value })}
								error={!!errors.seoPageTitle}
								title={formValues.seoPageTitle}
							/>
						</Box>
					</Grid>

					<Grid item md={12}>
						<Box>
							<Typography title={translator("landingPages.keywords")} className={classes.alignDir}>
								{translator("landingPages.keywords")}
							</Typography>
							<Autocomplete
								clearIcon={false}
								options={[]}
								freeSolo
								multiple
								value={formValues.seoKeywords}
								onChange={(event: any, value: any, reason: any) => {
									setFormValues({
										...formValues,
										seoKeywords: value
									})
								}}
								renderTags={(value: any, props: any) =>
									value.map((option: string, index: any) => (
										<Chip label={option} {...props({ index })} className={clsx(classes.MuiChipRoot)} />
									))
								}
								renderInput={(params: any) => <TextField {...params} className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100, { [classes.textFieldError]: !!errors.formName })} />}
							/>
							{/* <TextField
								id="pageTitle"
								label=""
								variant="outlined"
								name="pageTitle"
								value={formValues.keywords}
								className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100, { [classes.textFieldError]: !!errors.formName })}
								autoComplete="off"
								onChange={(e: any) => setFormValues({ ...formValues, pageTitle: e.target.value })}
								error={!!errors.pageTitle}
								title={formValues.pageTitle}
							/> */}
						</Box>
					</Grid>

					<Grid item md={12}>
						<Box>
							<Typography title={translator("landingPages.description")} className={classes.alignDir}>
								{translator("landingPages.description")}
							</Typography>
							<textarea
								placeholder={translator("landingPages.description")}
								maxLength={1000}
								id="yourMessage"
								className={clsx(classes.textarea, classes.sidebar)}
								// style={{ textAlign: alignment }}
								onChange={(e: any) => setFormValues({ ...formValues, pageDescription: e.target.value })}
								value={formValues.pageDescription}
							></textarea>
						</Box>
					</Grid>

					<Grid item md={3}>
						<Box>
							<Typography title={translator("landingPages.googleAnalytics")} className={classes.alignDir}>
								{translator("landingPages.googleAnalytics")}
							</Typography>
							<textarea
								placeholder={PlaceHolders.GOOGLE_ANALYTICS}
								maxLength={1000}
								id="yourMessage"
								className={clsx(classes.textarea, classes.sidebar)}
								// style={{ textAlign: alignment }}
								onChange={(e: any) => setFormValues({ ...formValues, googleAnalytics: e.target.value })}
								value={formValues.googleAnalytics}
							></textarea>
						</Box>
					</Grid>

					<Grid item md={3}>
						<Box>
							<Typography title={translator("landingPages.googleConvertion")} className={classes.alignDir}>
								{translator("landingPages.googleConvertion")}
							</Typography>
							<textarea
								placeholder={PlaceHolders.GOOGLE_CONVERSION}
								maxLength={1000}
								id="yourMessage"
								className={clsx(classes.textarea, classes.sidebar)}
								// style={{ textAlign: alignment }}
								onChange={(e: any) => setFormValues({ ...formValues, googleConvertion: e.target.value })}
								value={formValues.googleConvertion}
							></textarea>
						</Box>
					</Grid>

					<Grid item md={3}>
						<Box>
							<Typography title={translator("landingPages.googleTagManager")} className={classes.alignDir}>
								{translator("landingPages.googleTagManager")}
							</Typography>
							<textarea
								placeholder={PlaceHolders.GOOGLE_TAG_MANAGER}
								maxLength={1000}
								id="yourMessage"
								className={clsx(classes.textarea, classes.sidebar)}
								onChange={(e: any) => setFormValues({ ...formValues, googleTagManager: e.target.value })}
								value={formValues.googleTagManager}
							></textarea>
						</Box>
					</Grid>
					
					<Grid item md={3}>
						<Box>
							<Typography title={translator("landingPages.facebookPixel")} className={classes.alignDir}>
								{translator("landingPages.facebookPixel")}
							</Typography>
							<textarea
								placeholder={PlaceHolders.FACEBOOK_PIXEL}
								maxLength={1000}
								id="facebookPixel"
								className={clsx(classes.textarea, classes.sidebar)}
								// style={{ textAlign: alignment }}
								onChange={(e: any) => setFormValues({ ...formValues, facebookPixel: e.target.value })}
								value={formValues.facebookPixel}
							></textarea>
						</Box>
					</Grid>
				</Grid>

				<Grid container spacing={3} className={clsx(classes.p15, classes.pt2rem)}>
					<Grid item md={12}>
						<Typography className={clsx(classes.f22, classes.bold, classes.pb5)}>{translator("landingPages.developmentSettings")}</Typography>
					</Grid>
					<Grid item md={12}>
						<Box>
							<Typography title={translator("landingPages.CSSDesign")} className={classes.alignDir}>
								{translator("landingPages.CSSDesign")}
							</Typography>
							<textarea
								placeholder={PlaceHolders.CSS_STYLE}
								maxLength={1000}
								id="yourMessage"
								className={clsx(classes.textarea, classes.sidebar)}
								// style={{ textAlign: alignment }}
								onChange={(e: any) => setFormValues({ ...formValues, cssStyle: e.target.value })}
								value={formValues.cssStyle}
							></textarea>
						</Box>
					</Grid>
				</Grid>
				
				<Grid container spacing={3} className={clsx(classes.p15, classes.pt2rem)}>
					<Grid item md={12}>
						<Typography className={clsx(classes.f22, classes.bold, classes.pb5)}>
							{translator("landingPages.linkPreviewSettings")}
							<Tooltip
								disableFocusListener
								title={translator('landingPages.linkPreviewTooltip')}
								classes={{
									tooltip: clsx(classes.tooltipBlack, classes.tooltipPlacement),
									arrow: classes.fBlack
								}}
								enterTouchDelay={50}
								placement={"top"}
							>
								<IconButton className={clsx(classes.icon_Info, classes.noPadding, classes.ml5)}>
									<BsInfoCircle />
								</IconButton>
							</Tooltip>
						</Typography>
					</Grid>

					<Grid item md={4}>
						<Box>
							<Typography title={translator("landingPages.previewTitle")} className={classes.alignDir}>
								{translator("landingPages.previewTitle")}
							</Typography>
							<TextField
								id="previewTitle"
								label=""
								variant="outlined"
								name="Name"
								value={formValues.previewTitle}
								className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100, { [classes.textFieldError]: !!errors.previewTitle })}
								autoComplete="off"
								onChange={(e: any) => setFormValues({ ...formValues, previewTitle: e.target.value })}
								error={!!errors.previewTitle}
								title={formValues.previewTitle}
							/>
							<Box className='textBoxWrapper'>
								<Typography className={clsx(errors.previewTitle ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
									{errors.previewTitle ?? errors.previewTitle}
								</Typography>
							</Box>
						</Box>
					</Grid>
					
					<Grid item md={4}>
						<Box>
							<Typography title={translator("landingPages.previewIcon")} className={classes.alignDir}>
								{translator("landingPages.previewIcon")}
							</Typography>
							<PulseemTags
								title={""}
								style={null}
								classes={classes}
								tagStyle={{ maxWidth: 150 }}
								// @ts-ignore
								items={filesProperties?.map((f) => {
										return {
												Name: f.FileName,
												ID: f.ID
										};
								})}
								// @ts-ignore
								onShowModal={() => filesProperties.length === 0 && setDialogType({type: 'galleryDialog'})}
								// @ts-ignore
								handleRemove={removeAttachmentFile}
								// @ts-ignore
								icon={<BiUpload />}
							/>
							<Box className='textBoxWrapper'>
								<Typography className={clsx(errors.formName ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
									{errors.previewIcon ?? errors.previewIcon}
								</Typography>
							</Box>
						</Box>
					</Grid>
					
					<Grid item md={4}>
						<Box>
							<Typography title={translator("landingPages.previewDescription")} className={classes.alignDir}>
								{translator("landingPages.previewDescription")}
							</Typography>
							<TextField
								id="previewDescription"
								label=""
								variant="outlined"
								name="Name"
								value={formValues.previewDescription}
								className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100, { [classes.textFieldError]: !!errors.previewDescription })}
								autoComplete="off"
								onChange={(e: any) => setFormValues({ ...formValues, previewDescription: e.target.value })}
								error={!!errors.previewDescription}
								title={formValues.previewDescription}
							/>
							<Box className='textBoxWrapper'>
								<Typography className={clsx(errors.previewDescription ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
									{errors.previewDescription ?? errors.previewDescription}
								</Typography>
							</Box>
						</Box>
					</Grid>
				</Grid>

				<Box className={classes.flex}>
					<WizardActions
						classes={classes}
						// @ts-ignore
						onBack={{
							callback: () => setDialogType({type: 'confirmExit'})
						}}
						// @ts-ignore
						additionalButtons={renderButtons()}
						// @ts-ignore
						additionalButtonsOnStart={renderTemplateButtons()}
					/>
				</Box>
				<Loader isOpen={isLoader} />
			</Box>
			{renderDialog()}
		</DefaultScreen>
	);
};

export default CreateLandingPage;
