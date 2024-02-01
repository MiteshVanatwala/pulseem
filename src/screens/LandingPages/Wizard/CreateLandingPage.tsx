import { useEffect, useState } from 'react';
import clsx from 'clsx';
import DefaultScreen from '../../DefaultScreen';
import { Title } from '../../../components/managment/Title';
import { useTranslation } from 'react-i18next';
import { Box, Button, Grid, IconButton, Tab, Tabs, TextField, Tooltip, Typography } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { Loader } from '../../../components/Loader/Loader';
import { ClassesType } from '../../Classes.types';
import { coreProps } from '../../Whatsapp/Campaign/Types/WhatsappCampaign.types';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import WizardActions from '../../../components/Wizard/WizardActions';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { BEE_EDITOR_TYPES, LandingPagesAnswerType } from '../../../helpers/Constants';
import { FileGallery } from '../../../Models/Files/FileGallery';
import Gallery from '../../../components/Gallery/Gallery.component';
import { PulseemFeatures, PulseemFolderType } from '../../../model/PulseemFields/Fields';
import { RandomID } from '../../../helpers/Functions/functions';
import { validateEmailAddress } from '../../../helpers/Utils/common';
import { isValidHttpUrl } from '../../../helpers/Utils/TextHelper';
import { getGroupsBySubAccountId } from '../../../redux/reducers/groupSlice';
import { BsInfoCircle } from 'react-icons/bs';
import { getById, getAllLPTemplatesBySubaccountId, getLPPublicTemplates, getLPTemplateById, saveLandingPage } from '../../../redux/reducers/landingPagesSlice';
import { sitePrefix } from '../../../config';
import { useNavigate, useParams } from 'react-router-dom';
// import Templates from '../../HtmlCampaign/modals/Templates';
import Templates from '../../BeeEditorPage/modals/Templates';
import { getCookie } from '../../../helpers/Functions/cookies';
import { TabContext, TabPanel } from '@material-ui/lab';
import FormProperties from './Tabs/FormProperties';
import OfflineProperties from './Tabs/OfflineProperties';
import SubscriberSettings from './Tabs/SubscriberSettings';
import SeoSettings from './Tabs/SeoSettings';
import DevelopmentSettings from './Tabs/DevelopmentSettings';
import LinkPreviewSettings from './Tabs/LinkPreviewSettings';
import { LandingPageModel } from '../../../Models/LandingPage/LandingPage';
import { PulseemResponse } from '../../../Models/APIResponse';

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
	const [errors, setErrors] = useState({
		PageName: '',
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
	const [landingPageModel, setLandingPageModel] = useState<LandingPageModel>({
		ID: 0,
		GroupID: 0,
		GroupIDs: [],
		IsClientScript: false,
		CmbSelection: '',
		HtmlFileName: '',
		ButtonText: '',
		PageName: '',
		AnswerOption: '',
		AnswerData: '',
		SubmitCounter: 0,
		ViewCounter: 0,
		ConfirmationText: '',
		Status: 1,
		PageHtml: '',
		HasPrefunpage: false,
		PrefunImage: '',
		HasComments: false,
		PageUrl: '',
		PageType: 0,
		AnswerType: 0,
		IsResponsive: false,
		DownloadUrl: '',
		OfflineDate: '',
		OfflineUrl: '',
		HtmlToEdit: '',
		HtmlFile: '',
		BaseLanguage: 0,
		IsTemplate: null,
		CategoryID: null,
		IsUpdate: false,
		IsAccessibility: false,
		TerminalNumber: '',
		APIUserName: '',
		DepartmentId: null,
		LinkPreviewTitle: '',
		LinkPreviewIcon: '',
		LinkPreviewIconName: '',
		LinkPreviewDescription: '',
		LinkPreviewIconExtrnalURL: '',
		IsPreviewIconFromExtrnalURL: false,
		EmailsToReport: [],
		SplitRegistrations: false,
		DoubleOptin: false,
		SubscriptionsLimit: null,
		Systems: '',
		FacebookPageID: '',
		FacebookPrefunPage: false,
		FacebookPrefunImage: '',
		FacebookComments: false,
		ClientJavaScript: '',
		ClientBodyScript: '',
		ClientHtmlCode: '',
		ClientCssStyle: '',
		PageTitle: '',
		MetaDescription: '',
		MetaKeywords: '',
		GoogleAnalyticsCode: '',
		GoogleConvertionCode: '',
		GoogleTagManagerCode: '',
		FacebookPixelCode: '',
		IsNewEditor: null
	});

	const [tabValue, setTabValue] = useState<string>('1');
	const [template, setTemplate] = useState('');
	const { publicTemplates, templatesBySubAccount } = useSelector(
		(state: { landingPages: any }) => state.landingPages
	);

	const getData = async () => {
		setIsLoader(true);

		// @ts-ignore
		const res = await dispatch(getById(id));
		const response = res.payload as PulseemResponse;

		if (response.StatusCode === 201) {
			setLandingPageModel(response.Data);
		}

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
		setLandingPageModel({
			...landingPageModel,
			EmailsToReport: landingPageModel.EmailsToReport.filter((f: string) => f !== fileId)
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

	const addEmailId = () => {
		let isValid = validateEmailAddress(emailId);
		setErrors({
			...errors,
			emailId: isValid ? '' : translator('common.invalidEmail')
		});

		if (isValid && landingPageModel.EmailsToReport.indexOf(emailId) !== -1) {
			setErrors({
				...errors,
				emailId: translator('common.EmailExist')
			});
			isValid = false;
		}

		if (isValid) {
			setLandingPageModel({
				...landingPageModel,
				EmailsToReport: [...landingPageModel.EmailsToReport, emailId]
			});
			setDialogType(null);
			setEmailId('');
		}
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
						onKeyUp={(e: any) => (e.keyCode === 13 || e.code === "Enter") && addEmailId()}
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
							onClick={addEmailId}
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
								setErrors({ ...errors, emailId: '' });
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
			PageName: !landingPageModel.PageName?.trim() ? translator('landingPages.PageNameRequired') : '',
			shortURL: !landingPageModel.PageUrl?.trim() ? translator('landingPages.shortURLRequired') : '',
			answerMessage: [
				LandingPagesAnswerType.POPUP_MESSAGE,
				LandingPagesAnswerType.REDIRECT_URL,
				LandingPagesAnswerType.DOWNLOAD_FILE
			].indexOf(landingPageModel.AnswerType) > -1 && !landingPageModel.AnswerData?.trim() ? translator('landingPages.answerMessageRequired') : '',
			paymentURL: [
				LandingPagesAnswerType.TRANSFER_TO_PAYMENT_PAGE
			].indexOf(landingPageModel.AnswerType) > -1 && !landingPageModel.AnswerData?.trim() ? translator('landingPages.URLRequired') : '',
			paymentAPIUsername: [
				LandingPagesAnswerType.TRANSFER_TO_PAYMENT_PAGE
			].indexOf(landingPageModel.AnswerType) > -1 && !landingPageModel.APIUserName?.trim() ? translator('landingPages.APIUsernameRequired') : '',
			paymentTerminalNumber: [
				LandingPagesAnswerType.TRANSFER_TO_PAYMENT_PAGE
			].indexOf(landingPageModel.AnswerType) > -1 && !landingPageModel.TerminalNumber?.trim() ? translator('landingPages.terminalNumberRequired') : '',
			offlineURL: landingPageModel.OfflineDate && !isValidHttpUrl(landingPageModel.OfflineUrl) ? translator('landingPages.invalidRedirectURLWhenOffline') : '',
			group: landingPageModel.GroupIDs.length === 0 ? translator('landingPages.selectAtleastOneGroup') : ''
		};
		setErrors(errorDump);

		if (!errorDump.PageName && !errorDump.shortURL && !errorDump.answerMessage && !errorDump.paymentURL && !errorDump.paymentAPIUsername && !errorDump.paymentTerminalNumber && !errorDump.offlineURL && !errorDump.group) {

			const req = { ...landingPageModel, SelectedGroupList: null, EmailsToReport: landingPageModel?.EmailsToReport?.join(',') };
			//@ts-ignore
			const response = await dispatch(saveLandingPage(req));
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
			if (id !== null && landingPageModel?.IsNewEditor === true) {
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
						className={clsx(classes.iconTab, classes.f18)}
						value='1'
					/>
					<Tab
						label={<>
							<Typography style={{ whiteSpace: 'nowrap', textAlign: 'center', fontSize: 18, fontWeight: 500 }}>
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
						className={clsx(classes.iconTab, classes.f18)}
						value='2'
					/>
					<Tab
						label={translator('landingPages.subscriberSettings')}
						classes={{ root: classes.tabText, selected: classes.activeTab }}
						className={clsx(classes.iconTab, classes.f18)}
						value='3'
					/>
					<Tab
						label={translator('landingPages.SEOSettings')}
						classes={{ root: classes.tabText, selected: classes.activeTab }}
						className={clsx(classes.iconTab, classes.f18)}
						value='4'
					/>
					<Tab
						label={translator('landingPages.developmentSettings')}
						classes={{ root: classes.tabText, selected: classes.activeTab }}
						className={clsx(classes.iconTab, classes.f18)}
						value='5'
					/>
					<Tab
						style={{ overflow: 'unset' }}
						label={<>
							<Typography style={{ whiteSpace: 'nowrap', textAlign: 'center', fontSize: 18, fontWeight: 500 }}>
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
						className={clsx(classes.iconTab, classes.f18)}
						value='6'
					/>
				</Tabs>
				<TabContext value={`${tabValue}`}>
					<TabPanel value='1'>
						<FormProperties classes={classes} data={landingPageModel} onUpdate={setLandingPageModel} onSetDialog={setDialogType} />
					</TabPanel>
					<TabPanel value='2'>
						<OfflineProperties classes={classes} data={landingPageModel} onUpdate={setLandingPageModel} />
					</TabPanel>
					<TabPanel value='3'>
						<SubscriberSettings
							classes={classes}
							data={landingPageModel}
							onUpdate={setLandingPageModel}
							onSetDialog={setDialogType}
							removeEmailId={removeEmailId}
						/>
					</TabPanel>
					<TabPanel value='4'>
						<SeoSettings classes={classes} data={landingPageModel} onUpdate={setLandingPageModel} />
					</TabPanel>
					<TabPanel value='5'>
						<DevelopmentSettings classes={classes} data={landingPageModel} onUpdate={setLandingPageModel} />
					</TabPanel>
					<TabPanel value='6'>
						<LinkPreviewSettings
							classes={classes}
							data={landingPageModel}
							onUpdate={setLandingPageModel}
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
