import { useEffect, useState } from 'react';
import clsx from 'clsx';
import DefaultScreen from '../../DefaultScreen';
import { Title } from '../../../components/managment/Title';
import { useTranslation } from 'react-i18next';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Chip, Grid, IconButton, Tab, Tabs, TextField, Tooltip, Typography } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { Loader } from '../../../components/Loader/Loader';
import { ClassesType } from '../../Classes.types';
import { coreProps } from '../../Whatsapp/Campaign/Types/WhatsappCampaign.types';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import WizardActions from '../../../components/Wizard/WizardActions';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { Autocomplete } from '@mui/material';
import { BEE_EDITOR_TYPES, LandingPagesAnswerType, PlaceHolders } from '../../../helpers/Constants';
import PulseemTags from '../../../components/Tags/PulseemTags';
import { FileGallery } from '../../../Models/Files/FileGallery';
import { BiUpload } from 'react-icons/bi';
import Gallery from '../../../components/Gallery/Gallery.component';
import { PulseemFeatures, PulseemFolderType } from '../../../model/PulseemFields/Fields';
import { RandomID } from '../../../helpers/Functions/functions';
import { validateEmailAddress } from '../../../helpers/Utils/common';
import { isValidHttpUrl } from '../../../helpers/Utils/TextHelper';
import { Group } from '../../../Models/Groups/Group';
import { getGroupsBySubAccountId } from '../../../redux/reducers/groupSlice';
import { BsInfoCircle } from 'react-icons/bs';
import { getAllLPTemplatesBySubaccountId, getLPPublicTemplates, getLPTemplateById, saveLandingPage } from '../../../redux/reducers/landingPagesSlice';
import { sitePrefix } from '../../../config';
import { useNavigate, useParams } from 'react-router-dom';
// import Templates from '../../HtmlCampaign/modals/Templates';
import { GrFormAdd, GrFormSubtract } from 'react-icons/gr';
import Templates from '../../BeeEditorPage/modals/Templates';
import { getCookie } from '../../../helpers/Functions/cookies';
import { TabContext, TabPanel } from '@material-ui/lab';
import FormProperties from './Tabs/FormProperties';
import OfflineProperties from './Tabs/OfflineProperties';
import SubscriberSettings from './Tabs/SubscriberSettings';
import SeoSettings from './Tabs/SeoSettings';
import DevelopmentSettings from './Tabs/DevelopmentSettings';
import LinkPreviewSettings from './Tabs/LinkPreviewSettings';

const CreateLandingPage = ({ classes }: ClassesType) => {
	const { id } = useParams();
	const dispatch: any = useDispatch();
	const navigate = useNavigate();
	const { t: translator } = useTranslation();
	const { isRTL } = useSelector(
		(state: { core: coreProps }) => state.core
	);
	const [isLoader, setIsLoader] = useState<boolean>(false);
	const [dialogType, setDialogType] = useState<{
		type: string;
	} | null>(null);
	const { subAccountAllGroups } = useSelector((state: any) => state.group);
	const { accountFeatures } = useSelector((state: any) => state.common);
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
		duplicateMailConfirmation: true,
		IsNewEditor: true
	})
	const [expandedIndexes, setExpandedIndexes] = useState([1, 2, 3, 4]);
	const [tabValue, setTabValue] = useState<string>('1');
	const [template, setTemplate] = useState('');
	const { publicTemplates, templatesBySubAccount } = useSelector(
		(state: { landingPages: any }) => state.landingPages
	);

	const getData = async () => {
		setIsLoader(true);

		if (subAccountAllGroups.length === 0) {
			dispatch(getGroupsBySubAccountId());
		}

		//@ts-ignore
		if (!publicTemplates.length) dispatch(getLPPublicTemplates(isRTL));
		if (!templatesBySubAccount.length) dispatch(getAllLPTemplatesBySubaccountId());
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
		onConfirm: async () => { }
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
				navigate(`${sitePrefix}LandingPages`);
			},
			onClose: () => {
				setDialogType(null);
				navigate(`${sitePrefix}LandingPages`);
			},
		};
	}

	const renderTemplateDialog = () => {
		return {
			showDivider: false,
			title: translator("common.SelectTemplate"),
			showDefaultButtons: false,
			content: (
				<Templates
					isCreateLandingPage={true}
					classes={classes}
					onClose={async (template: any) => {
						setDialogType(null);
						if (template !== undefined) {
							//@ts-ignore
							const response = await dispatch(getLPTemplateById(template.ID));
							if (response.payload.StatusCode === 201) {
								setTemplate(response?.payload?.Data);
							}
						}
					}}
				/>
			),
			onConfirm: async () => {
				const response = await save();
				navigate(`${sitePrefix}LandingPages`);
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
			offlineURL: formValues.offlineDate && !isValidHttpUrl(formValues.offlineURL) ? translator('landingPages.invalidRedirectURLWhenOffline') : '',
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
		navigate(`${sitePrefix}BeeEditor/${BEE_EDITOR_TYPES.LANDING_PAGE}/1`);
	}

	const renderButtons = () => {
		const wizardButtons = [];
		const showCautionOldEditor = getCookie('showCautionOldEditor') !== "false" && accountFeatures?.indexOf(PulseemFeatures.BEE_EDITOR) > -1
		const showCautionNewEditor = getCookie('showCautionNewEditor') !== "false" && accountFeatures?.indexOf(PulseemFeatures.BEE_EDITOR) > -1
		if (accountFeatures?.indexOf(PulseemFeatures.BEE_EDITOR) === -1) {
			wizardButtons.push(
				<>
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
						{translator("common.save")}
					</Button>
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
						{translator('common.continue')}
					</Button>
				</>
			);
		}
		else {
			if (id !== null && formValues?.IsNewEditor === true) {
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
						key='newEditor'
					>
						{translator('master.continueToNewEditor')}
					</Button>
				);
			} else {
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
			}
		}
		return wizardButtons.map((b) => b);
	}

	const renderTemplateButtons = () => {
		return (
			<Button
				onClick={() => setDialogType({ type: 'template' })}
				className={clsx(classes.btn, classes.btnRounded)}
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

	const SEOSettings = () => {
		return (
			<Accordion expanded={expandedIndexes.indexOf(4) !== -1}>
				<AccordionSummary
					aria-controls="panel1a-content"
					id="panel1a-header"
					expandIcon={expandedIndexes.indexOf(4) === -1 ? <GrFormAdd size={26} /> : <GrFormSubtract size={26} />}
					onClick={() => setExpandedIndexes(expandedIndexes.indexOf(4) === -1 ? expandedIndexes.concat(4) : expandedIndexes.filter(item => item !== 4))}
					className={classes.greyBackground}
				>
					<Typography className={clsx(classes.fBlack, classes.bold)}>{translator('landingPages.SEOSettings')}</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Grid container spacing={3} className={clsx(classes.p15)}>
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
				</AccordionDetails>
			</Accordion>
		);
	}

	const linkPreviewSettings = () => {
		return (
			<Accordion expanded={expandedIndexes.indexOf(6) !== -1}>
				<AccordionSummary
					aria-controls="panel1a-content"
					id="panel1a-header"
					expandIcon={expandedIndexes.indexOf(6) === -1 ? <GrFormAdd size={26} /> : <GrFormSubtract size={26} />}
					onClick={() => setExpandedIndexes(expandedIndexes.indexOf(6) === -1 ? expandedIndexes.concat(6) : expandedIndexes.filter(item => item !== 6))}
					className={classes.greyBackground}
				>
					<Typography className={clsx(classes.fBlack, classes.bold)}>
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
				</AccordionSummary>
				<AccordionDetails>
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
									onShowModal={() => filesProperties.length === 0 && setDialogType({ type: 'galleryDialog' })}
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
				</AccordionDetails>
			</Accordion>
		);
	}

	return (
		<DefaultScreen
			currentPage="landingPages"
			subPage={"newsletterInfo"}
			classes={classes}
			customPadding={true}
			containerClass={clsx(classes.mb50, classes.editorCont)}
		>
			<Box className="head">
				<Title Text={translator("landingPages.createLandingPage")} classes={classes} />
			</Box>
			<Box className={"containerBody"}>
				<Tabs
					value={tabValue}
					onChange={(e, value) => setTabValue(value)}
					className={clsx(classes.mr15, classes.ml15)}
					classes={{ indicator: classes.hideIndicator }}
				>
					<Tab
						label={translator('landingPages.formProperties')}
						classes={{ root: classes.tabText, selected: classes.activeTab }}
						className={classes.iconTab}
						value='1'
					/>
					<Tab
						label={<>
							<Typography style={{ whiteSpace: 'nowrap', textAlign: 'center', fontSize: 20, fontWeight: 500 }}>
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
						</>}
						classes={{ root: classes.tabText, selected: classes.activeTab }}
						className={classes.iconTab}
						value='2'
					/>
					<Tab
						label={translator('landingPages.subscriberSettings')}
						classes={{ root: classes.tabText, selected: classes.activeTab }}
						className={classes.iconTab}
						value='3'
					/>
					<Tab
						label={translator('landingPages.SEOSettings')}
						classes={{ root: classes.tabText, selected: classes.activeTab }}
						className={classes.iconTab}
						value='4'
					/>
					<Tab
						label={translator('landingPages.developmentSettings')}
						classes={{ root: classes.tabText, selected: classes.activeTab }}
						className={classes.iconTab}
						value='5'
					/>
					<Tab
						label={<>
							<Typography style={{ whiteSpace: 'nowrap', textAlign: 'center', fontSize: 20, fontWeight: 500 }}>
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
						</>}
						classes={{ root: classes.tabText, selected: classes.activeTab }}
						className={classes.iconTab}
						value='6'
					/>
				</Tabs>
				<TabContext value={`${tabValue}`}>
					<TabPanel value='1'>
						<FormProperties classes={classes} data={formValues} onUpdate={setFormValues} onSetDialog={setDialogType} />
					</TabPanel>
					<TabPanel value='2'>
						<OfflineProperties classes={classes} data={formValues} onUpdate={setFormValues} />
					</TabPanel>
					<TabPanel value='3'>
						<SubscriberSettings
							classes={classes}
							data={formValues}
							onUpdate={setFormValues}
							onSetDialog={setDialogType}
							callbackSelectAll={callbackSelectAll}
							removeEmailId={removeEmailId}
							callbackUpdateGroups={callbackUpdateGroups}
						/>
					</TabPanel>
					<TabPanel value='4'>
						<SeoSettings classes={classes} data={formValues} onUpdate={setFormValues} />
					</TabPanel>
					<TabPanel value='5'>
						<DevelopmentSettings classes={classes} data={formValues} onUpdate={setFormValues} />
					</TabPanel>
					<TabPanel value='6'>
						<LinkPreviewSettings
							classes={classes}
							data={formValues}
							onUpdate={setFormValues}
							filesProperties={filesProperties}
							onSetDialog={setDialogType}
							removeAttachmentFile={removeAttachmentFile} />
					</TabPanel>

				</TabContext>

				<Box className={classes.flex}>
					<WizardActions
						classes={classes}
						// @ts-ignore
						onBack={{
							callback: () => setDialogType({ type: 'confirmExit' })
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
