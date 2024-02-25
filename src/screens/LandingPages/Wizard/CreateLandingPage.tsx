import { useEffect, useState } from 'react';
import clsx from 'clsx';
import DefaultScreen from '../../DefaultScreen';
import { Title } from '../../../components/managment/Title';
import { useTranslation } from 'react-i18next';
import { Box, Button, Divider, Grid, IconButton, Tab, Tabs, TextField, Tooltip, Typography } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { Loader } from '../../../components/Loader/Loader';
import { ClassesType } from '../../Classes.types';
import { coreProps } from '../../Whatsapp/Campaign/Types/WhatsappCampaign.types';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import WizardActions from '../../../components/Wizard/WizardActions';
import { MdArrowBackIos, MdArrowForwardIos, MdSave } from 'react-icons/md';
import { BEE_EDITOR_TYPES, LandingPagesAnswerType } from '../../../helpers/Constants';
import { FileGallery } from '../../../Models/Files/FileGallery';
import Gallery from '../../../components/Gallery/Gallery.component';
import { PulseemFeatures, PulseemFolderType } from '../../../model/PulseemFields/Fields';
import { RandomID } from '../../../helpers/Functions/functions';
import { ValidateEmailAddress } from '../../../helpers/Utils/common';
import { isValidHttpUrl } from '../../../helpers/Utils/TextHelper';
import { getGroupsBySubAccountId } from '../../../redux/reducers/groupSlice';
import { BsInfoCircle } from 'react-icons/bs';
import { getById, getAllLPTemplatesBySubaccountId, getLPPublicTemplates, saveLandingPage } from '../../../redux/reducers/landingPagesSlice';
import { sitePrefix } from '../../../config';
import { useNavigate, useParams } from 'react-router-dom';
// import Templates from '../../HtmlCampaign/modals/Templates';
import Templates from '../../BeeEditorPage/modals/Templates';
import { TabContext, TabPanel } from '@material-ui/lab';
import FormProperties from './Tabs/FormProperties';
import OfflineProperties from './Tabs/OfflineProperties';
import SubscriberSettings from './Tabs/SubscriberSettings';
import SeoSettings from './Tabs/SeoSettings';
import DevelopmentSettings from './Tabs/DevelopmentSettings';
import LinkPreviewSettings from './Tabs/LinkPreviewSettings';
import { LandingPageModel } from '../../../Models/LandingPage/LandingPage';
import { PulseemResponse } from '../../../Models/APIResponse';
import { logout } from '../../../helpers/Api/PulseemReactAPI';
import Toast from '../../../components/Toast/Toast.component';

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
	const [toastMessage, setToastMessage] = useState(null);
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

		if (id) {
			// @ts-ignore
			const res = await dispatch(getById(id));
			const response = res.payload as PulseemResponse;
			if (response.StatusCode === 201) {
				setLandingPageModel({
					...response.Data,
					EmailsToReport: response.Data?.EmailsToReport?.length > 0 ? response.Data?.EmailsToReport?.split(',') : [],
					CmbSelection: response.Data?.CmbSelection || '',
					HtmlFileName: response.Data?.HtmlFileName || '',
					ButtonText: response.Data?.ButtonText || '',
					PageName: response.Data?.PageName || '',
					AnswerOption: response.Data?.AnswerOption || '',
					AnswerData: response.Data?.AnswerData || '',
					ConfirmationText: response.Data?.ConfirmationText || '',
					PageHtml: response.Data?.PageHtml || '',
					PrefunImage: response.Data?.PrefunImage || '',
					PageUrl: response.Data?.PageUrl || '',
					DownloadUrl: response.Data?.DownloadUrl || '',
					OfflineDate: response.Data?.OfflineDate || '',
					OfflineUrl: response.Data?.OfflineUrl || '',
					HtmlToEdit: response.Data?.HtmlToEdit || '',
					HtmlFile: response.Data?.HtmlFile || '',
					TerminalNumber: response.Data?.TerminalNumber || '',
					APIUserName: response.Data?.APIUserName || '',
					LinkPreviewTitle: response.Data?.LinkPreviewTitle || '',
					LinkPreviewIconName: response.Data?.LinkPreviewIconName || '',
					LinkPreviewDescription: response.Data?.LinkPreviewDescription || '',
					LinkPreviewIconExtrnalURL: response.Data?.LinkPreviewIconExtrnalURL || '',
					Systems: response.Data?.Systems || '',
					FacebookPageID: response.Data?.FacebookPageID || '',
					FacebookPrefunImage: response.Data?.FacebookPrefunImage || '',
					ClientJavaScript: response.Data?.ClientJavaScript || '',
					ClientBodyScript: response.Data?.ClientBodyScript || '',
					ClientHtmlCode: response.Data?.ClientHtmlCode || '',
					ClientCssStyle: response.Data?.ClientCssStyle || '',
					PageTitle: response.Data?.PageTitle || '',
					MetaDescription: response.Data?.MetaDescription || '',
					MetaKeywords: response.Data?.MetaKeywords || '',
					GoogleAnalyticsCode: response.Data?.GoogleAnalyticsCode || '',
					GoogleConvertionCode: response.Data?.GoogleConvertionCode || '',
					GoogleTagManagerCode: response.Data?.GoogleTagManagerCode || '',
					FacebookPixelCode: response.Data?.FacebookPixelCode || '',
					GroupIDs: response.Data?.GroupIDs?.split(',') || []
				});
			}
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
		let isValid = ValidateEmailAddress(emailId);
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
				await save(0);
				navigate(`${sitePrefix}LandingPages`);
			},
			onClose: () => {
				setDialogType(null);
				navigate(`${sitePrefix}LandingPages`);
			},
		};
	}

	const getValidationDialog = () => ({
		title: translator('whatsappCampaign.sendValidation'),
		showDivider: false,
		childrenStyle: classes.noPadding,
		showDefaultButtons: false,
		content: (
			<ul className={clsx(classes.noMargin, classes.mb20, classes.errorText)}>
				{
					Object.values(errors).map((error: any) => error && (
						<li className={classes.validationAlertModalLi}>
							{error}
						</li>
					))
				}
			</ul>
		)
	})

	const getDeleteDialog = () => ({
		title: translator('landingPages.DeleteTitle'),
		showDivider: false,
		content: (
			<Typography style={{ fontSize: 18 }} className={clsx(classes.textCenter)}>
				{translator('landingPages.DeleteBody')}
			</Typography>
		),
		cancelText: translator('common.No'),
		confirmText: translator('common.Yes')
	})

	const renderDialog = () => {
		const { type } = dialogType || {}
		let currentDialog: any = {};
		if (type === 'galleryDialog') {
			currentDialog = renderGalleryDialog();
		} else if (type === 'addEmailId') {
			currentDialog = renderAddEmailIdDialog();
		} else if (type === 'confirmExit') {
			currentDialog = renderConfirmExitDialog();
		} else if (type === 'validationDialog') {
			currentDialog = getValidationDialog();
		} else if (type === 'delete') {
			currentDialog = getDeleteDialog();
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

	const save = async (redirectToNewEditor: number) => {
		const errorDump = {
			...errors,
			PageName: !landingPageModel.PageName?.trim() ? translator('landingPages.formNameRequired') : '',
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
			offlineURL: landingPageModel?.OfflineDate && !isValidHttpUrl(landingPageModel.OfflineUrl) ? translator('landingPages.invalidRedirectURLWhenOffline') : '',
			group: landingPageModel?.GroupIDs?.length === 0 ? translator('landingPages.selectAtleastOneGroup') : ''
		};
		setErrors(errorDump);
		if (!errorDump.PageName && !errorDump.shortURL && !errorDump.answerMessage && !errorDump.paymentURL && !errorDump.paymentAPIUsername && !errorDump.paymentTerminalNumber && !errorDump.offlineURL && !errorDump.group) {
			setIsLoader(true);
			const req = {
				...landingPageModel,
				SelectedGroupList: null,
				EmailsToReport: landingPageModel?.EmailsToReport?.join(','),
				GroupIDs: landingPageModel?.GroupIDs.join(',')
			};
			//@ts-ignore
			const response = await dispatch(saveLandingPage(req));
			handleSaveResponse(response?.payload, redirectToNewEditor);
			setIsLoader(false);
			return true;
		} else {
			setDialogType({ type: 'validationDialog' })
		}
	}

	const showErrorToast = (message: string) => setToastMessage({ severity: 'error', color: 'error', message, showAnimtionCheck: false } as any)

	const handleSaveResponse = (response: any, redirectToNewEditor: number) => {
		switch (response.StatusCode) {
			case 201: {
				console.log(response)
				handleContinueToEditor(redirectToNewEditor, response.Data.ID);
				break;
			}
			case 400: {
				showErrorToast(translator('common.Error'));
				break;
			}
			case 401: {
				logout();
				break;
			}
			case 402: {
				showErrorToast(translator('common.Error'));
				break;
			}
			case 404: {
				showErrorToast(translator('common.Error'));
				break;
			}
			case 405: {
				showErrorToast(response.Message);
				break;
			}
			case 500:
			default: {
				showErrorToast(translator('common.Error'));
				break;
			}
		}
	}

	const saveAndContinueToOldEditor = async () => {
		await save(2);
	}

	const saveAndContinueToNewEditor = async () => {
		await save(1);
	}

	// navigateBeEditor
	// 0 - Don't redirect, 1 - New Editor, 2 - Old Editor
	const handleContinueToEditor = (navigateBeEditor = 0, savedPageID: number) => {
		const isBeeEditor = (accountFeatures?.indexOf(PulseemFeatures.BEE_EDITOR) > -1 && !navigateBeEditor);
		let redirectUrl = isBeeEditor ? `${sitePrefix}BeeEditor/${BEE_EDITOR_TYPES.LANDING_PAGE}/${id}` : `/Pulseem/NewWebForm/NewFormEdit/${id}?fromreact=true`;
		if (!navigateBeEditor) {
			if (!id && savedPageID) navigate(`${sitePrefix}LandingPages/Create/${savedPageID}`)
			return false;
		}
		else if (navigateBeEditor === 1) navigate(redirectUrl);
		else window.location.href = redirectUrl;
	}

	const renderButtons = () => {
		const wizardButtons = [];
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
			wizardButtons.push(
				<Button
					onClick={() => save(0)}
					className={clsx(
						classes.btn,
						classes.btnRounded,
						classes.backButton
					)}
					style={{ margin: '8px' }}
					endIcon={<MdSave />}
					key="save"
				>
					{translator("common.save")}
				</Button>
			);

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
					key="saveContinue"
				>
					<>{translator('common.saveAndContinue')}</>
				</Button>
			);

			// wizardButtons.push(
			// 	<Button
			// 		onClick={saveAndContinueToNewEditor}
			// 		className={clsx(
			// 			classes.btn,
			// 			classes.btnRounded,
			// 			classes.backButton
			// 		)}
			// 		style={{ margin: '8px' }}
			// 		endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
			// 		key='newEditor'
			// 	>
			// 		{translator('master.continueToNewEditor')}
			// 	</Button>
			// );
		}
		return wizardButtons.map((b) => b);
	}

	const renderToast = () => {
		setTimeout(() => {
			setToastMessage(null);
		}, 4000);
		return <Toast customData={toastMessage} data={null} />;
	};

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
						label={translator('landingPages.SEOSettings')}
						classes={{ root: classes.tabText, selected: classes.activeTab }}
						className={clsx(classes.iconTab, classes.f18)}
						value='2'
					/>
					<Tab
						label={translator('landingPages.developmentSettings')}
						classes={{ root: classes.tabText, selected: classes.activeTab }}
						className={clsx(classes.iconTab, classes.f18)}
						value='3'
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
						value='4'
					/>
				</Tabs>
				<TabContext value={`${tabValue}`}>
					<TabPanel value='1'>
						<Typography title={translator("campaigns.camapignName")} className={clsx(classes.bold)}>
							{translator("landingPages.formName")}
						</Typography>
						<Divider className={clsx(classes.mt2, classes.mb2)} />
						<FormProperties
							classes={classes}
							data={landingPageModel}
							onUpdate={setLandingPageModel}
							onSetDialog={setDialogType}
							errors={errors}
							setErrors={setErrors}
						/>

						<Typography className={clsx(classes.bold, classes.mt6)}>
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
						<Divider className={clsx(classes.mt2, classes.mb2)} />
						<OfflineProperties
							classes={classes}
							data={landingPageModel}
							onUpdate={setLandingPageModel}
							errors={errors}
							setErrors={setErrors}
						/>

						<Typography title={translator("landingPages.subscriberSettings")} className={clsx(classes.bold, classes.mt6)}>
							{translator("landingPages.subscriberSettings")}
						</Typography>
						<Divider className={clsx(classes.mt2, classes.mb2)} />
						<SubscriberSettings
							classes={classes}
							data={landingPageModel}
							onUpdate={setLandingPageModel}
							onSetDialog={setDialogType}
							removeEmailId={removeEmailId}
							errors={errors}
						/>
					</TabPanel>
					{/* <TabPanel value='2'>
						<OfflineProperties
							classes={classes}
							data={landingPageModel}
							onUpdate={setLandingPageModel}
							errors={errors}
							setErrors={setErrors}
						/>
					</TabPanel>
					<TabPanel value='3'>
						<SubscriberSettings
							classes={classes}
							data={landingPageModel}
							onUpdate={setLandingPageModel}
							onSetDialog={setDialogType}
							removeEmailId={removeEmailId}
							errors={errors}
						/>
					</TabPanel> */}
					<TabPanel value='2'>
						<SeoSettings classes={classes} data={landingPageModel} onUpdate={setLandingPageModel} errors={errors} />
					</TabPanel>
					<TabPanel value='3'>
						<DevelopmentSettings classes={classes} data={landingPageModel} onUpdate={setLandingPageModel} />
					</TabPanel>
					<TabPanel value='4'>
						<LinkPreviewSettings
							classes={classes}
							data={landingPageModel}
							onUpdate={setLandingPageModel}
							filesProperties={filesProperties}
							onSetDialog={setDialogType}
							removeAttachmentFile={removeAttachmentFile}
							errors={errors}
						/>
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
						onDelete={id ? () => setDialogType({ type: "delete" }) : null}
						// @ts-ignore
						onExit={() => setDialogType({ type: 'confirmExit' })}
						// @ts-ignore
						additionalButtons={renderButtons()}
					/>
				</Box>
				<Loader isOpen={isLoader} />
			</Box>
			{renderDialog()}
			{toastMessage && renderToast()}
		</DefaultScreen>
	);
};

export default CreateLandingPage;
