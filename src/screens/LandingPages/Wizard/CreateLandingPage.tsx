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
import { TabContext, TabPanel } from '@material-ui/lab';
import FormProperties from './Tabs/FormProperties';
import OfflineProperties from './Tabs/OfflineProperties';
import SubscriberSettings from './Tabs/SubscriberSettings';
import SeoSettings from './Tabs/SeoSettings';
import DevelopmentSettings from './Tabs/DevelopmentSettings';
import LinkPreviewSettings from './Tabs/LinkPreviewSettings';
import { BeeEditorStoreModel, LandingPageModel } from '../../../Models/LandingPage/LandingPage';
import { PulseemResponse } from '../../../Models/APIResponse';
import { logout } from '../../../helpers/Api/PulseemReactAPI';
import Toast from '../../../components/Toast/Toast.component';
import SubscriberGroup from './Tabs/SubscriberGroup';

const CreateLandingPage = ({ classes }: ClassesType) => {
	const { id } = useParams();
	const dispatch: any = useDispatch();
	const navigate = useNavigate();
	const { t } = useTranslation();
	const { isRTL, windowSize } = useSelector(
		(state: { core: coreProps }) => state.core
	);
	const [isLoader, setIsLoader] = useState<boolean>(false);
	const [dialogType, setDialogType] = useState<{
		type: string;
	} | null>(null);
	const { subAccountAllGroups } = useSelector((state: any) => state.group);
	const { accountFeatures } = useSelector((state: any) => state.common);
	const { ToastMessages } = useSelector((state: { landingPages: BeeEditorStoreModel }) => state.landingPages)
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
		DepartmentId: '',
		DownloadUrl: ''
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
		PageType: 1,
		AnswerType: 1,
		IsResponsive: true,
		DownloadUrl: '',
		OfflineDate: '',
		OfflineUrl: '',
		HtmlToEdit: '',
		HtmlFile: '',
		BaseLanguage: 0,
		IsTemplate: false,
		CategoryID: null,
		IsUpdate: false,
		IsAccessibility: true,
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
		Systems: [],
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
		IsNewEditor: null,
		WebformsToReportLeadByApi: null
	});

	const [tabValue, setTabValue] = useState<string>('1');
	// const [template, setTemplate] = useState('');
	const { publicTemplates, templatesBySubAccount } = useSelector(
		(state: { landingPages: any }) => state.landingPages
	);

	enum EditorType {
		SAVE_ONLY = 0,
		BEE = 1,
		OLD = 2
	}
	const ClientScriptsWrapper = {
		Facebook_Pixel: '<!-- Facebook Pixel Start -->##code##<!-- Facebook Pixel End -->', // Head
		Google_Analytics: '<!-- Google Analytics Start -->##code##<!-- Google Analytics End -->', // Head
		Google_Tag_Manager: '<!-- Google Tag Manager Start -->##code##<!-- Google Tag Manager End -->', // Head
		Google_Conversion: '<!-- Google Convertion Start -->##code##<!-- Google Convertion End -->' // Body
	} as any;

	const getData = async () => {
		setIsLoader(true);

		const lpId: number | any = id || -1;
		// @ts-ignore
		const res = await dispatch(getById(lpId));
		const response = res.payload as PulseemResponse;
		if (response.StatusCode === 201) {
			setLandingPageModel({
				...response.Data?.WebForm,
				EmailsToReport: response.Data?.WebForm?.EmailsToReport?.length > 0 ? response.Data?.WebForm?.EmailsToReport?.split(',') : [],
				CmbSelection: response.Data?.WebForm?.CmbSelection || '',
				HtmlFileName: response.Data?.WebForm?.HtmlFileName || '',
				ButtonText: response.Data?.WebForm?.ButtonText || '',
				PageName: response.Data?.WebForm?.PageName || '',
				AnswerOption: response.Data?.WebForm?.AnswerOption || '',
				AnswerData: response.Data?.WebForm?.AnswerData || '',
				ConfirmationText: response.Data?.WebForm?.ConfirmationText || '',
				PageHtml: response.Data?.WebForm?.PageHtml || '',
				PrefunImage: response.Data?.WebForm?.PrefunImage || '',
				PageUrl: response.Data?.WebForm?.PageUrl || '',
				DownloadUrl: response.Data?.WebForm?.DownloadUrl || '',
				OfflineDate: response.Data?.WebForm?.OfflineDate || '',
				OfflineUrl: response.Data?.WebForm?.OfflineUrl || '',
				HtmlToEdit: response.Data?.WebForm?.HtmlToEdit || '',
				HtmlFile: response.Data?.WebForm?.HtmlFile || '',
				TerminalNumber: response.Data?.WebForm?.TerminalNumber || '',
				APIUserName: response.Data?.WebForm?.APIUserName || '',
				LinkPreviewTitle: response.Data?.WebForm?.LinkPreviewTitle || '',
				LinkPreviewIconName: response.Data?.WebForm?.LinkPreviewIconName || '',
				LinkPreviewDescription: response.Data?.WebForm?.LinkPreviewDescription || '',
				LinkPreviewIconExtrnalURL: response.Data?.WebForm?.LinkPreviewIconExtrnalURL || '',
				Systems: response.Data?.WebForm?.Systems || [],
				FacebookPageID: response.Data?.WebForm?.FacebookPageID || '',
				FacebookPrefunImage: response.Data?.WebForm?.FacebookPrefunImage || '',
				ClientJavaScript: response.Data?.WebForm?.ClientJavaScript || '',
				ClientBodyScript: response.Data?.WebForm?.ClientBodyScript || '',
				ClientHtmlCode: response.Data?.WebForm?.ClientHtmlCode || '',
				ClientCssStyle: response.Data?.WebForm?.ClientCssStyle || '',
				PageTitle: response.Data?.WebForm?.PageTitle || '',
				MetaDescription: response.Data?.WebForm?.MetaDescription || '',
				MetaKeywords: response.Data?.WebForm?.MetaKeywords || '',
				GoogleAnalyticsCode: response.Data?.WebForm?.GoogleAnalyticsCode || '',
				GoogleConvertionCode: response.Data?.WebForm?.GoogleConvertionCode || '',
				GoogleTagManagerCode: response.Data?.WebForm?.GoogleTagManagerCode || '',
				FacebookPixelCode: response.Data?.WebForm?.FacebookPixelCode || '',
				GroupIDs: response.Data?.WebForm?.GroupIDs?.split(',') || [],
				WebformsToReportLeadByApi: response.Data?.WebformsToReportLeadByApi || [],
				IsNewEditor: response.Data?.WebForm?.IsNewEditor,
				IsAccessibility: (lpId && lpId > 0) ? response.Data?.WebForm?.IsAccessibility : true,
				AnswerType: (lpId && lpId > 0) ? response.Data?.WebForm?.AnswerType : 1,
				IsResponsive: (lpId && lpId > 0) ? response.Data?.WebForm?.IsResponsive : true,
				IsTemplate: (lpId && lpId > 0) ? response.Data?.WebForm?.IsTemplate : false
			});
			if (response.Data?.WebForm?.LinkPreviewIconName !== '') {
				handleSelectedImage(response.Data?.WebForm?.LinkPreviewIconName, true);
			}
		}
		else if (response.StatusCode === 403) {
			setLandingPageModel({
				...response.Data?.WebForm,
				WebformsToReportLeadByApi: response.Data?.WebformsToReportLeadByApi || [],
				IsAccessibility: true,
				AnswerType: 1,
				IsResponsive: true,
				IsTemplate: false,
				PageType: 1,
				DownloadUrl: '',
				Status: 1,
				GoogleAnalyticsCode: '',
				GoogleConvertionCode: '',
				GoogleTagManagerCode: '',
				FacebookPixelCode: '',
				BaseLanguage: isRTL ? 0 : 1
			});
		}

		if (subAccountAllGroups?.length === 0) {
			dispatch(getGroupsBySubAccountId());
		}

		//@ts-ignore
		if (!publicTemplates.length) dispatch(getLPPublicTemplates(isRTL));
		if (!templatesBySubAccount.length) dispatch(getAllLPTemplatesBySubaccountId());
		setIsLoader(false);
	};

	useEffect(() => {
		getData();
	}, [, isRTL]);


	const handleSelectedImage = async (file: string, preventUpdateModel: boolean) => {
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
			let iconName = `${file?.split('/')[file?.split('/')?.length - 2]}/${file.split('/')[file.split('/').length - 1]}`;
			const newFile = {
				Name: fileName,
				FileName: fileName,
				FolderType: PulseemFolderType.CLIENT_IMAGES,
				FileURL: file,
				ID: RandomID()
			}
			if (!preventUpdateModel) {
				setLandingPageModel({ ...landingPageModel, LinkPreviewIconName: iconName })
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
			title: t("common.documentGallery"),
			content: (
				<Gallery
					classes={classes}
					isConfirm={isGalleryConfirmed}
					callbackSelectFile={handleSelectedImage}
					multiSelect={false}
					selected={[]}
					folderType={PulseemFolderType.CLIENT_IMAGES}
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
			emailId: isValid ? '' : t('common.invalidEmail')
		});

		if (isValid && landingPageModel?.EmailsToReport?.length > 0 && landingPageModel?.EmailsToReport?.indexOf(emailId) > -1) {
			setErrors({
				...errors,
				emailId: t('common.EmailExist')
			});
			isValid = false;
		}

		if (isValid) {
			setLandingPageModel({
				...landingPageModel,
				EmailsToReport: [...landingPageModel?.EmailsToReport || [], emailId]
			});
			setDialogType(null);
			setEmailId('');
		}
	}

	const renderAddEmailIdDialog = () => {
		return {
			showDivider: false,
			title: t("landingPages.addEmailAddress"),
			content: (
				<Box>
					<Typography title={t("common.Email")} className={classes.alignDir}>
						{t("common.Email")}
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
							{t("mainReport.add")}
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
							{t('common.cancel')}
						</Button>
					</Grid>
				</Grid>
			)
		};
	}

	const renderConfirmExitDialog = () => {
		return {
			showDivider: false,
			title: t("common.SaveExit"),
			content: (
				<Box>
					<Typography variant="subtitle1">
						{t("landingPages.confirmExit")}
					</Typography>
				</Box>
			),
			confirmText: "common.Yes",
			cancelText: "common.No",
			onConfirm: async () => {
				await save(0);
				navigate(`${sitePrefix}EditRegistrationPage`);
			},
			onClose: () => {
				setDialogType(null);
				navigate(`${sitePrefix}EditRegistrationPage`);
			},
		};
	}

	const getValidationDialog = () => ({
		title: t('whatsappCampaign.sendValidation'),
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
		title: t('landingPages.DeleteTitle'),
		showDivider: false,
		content: (
			<Typography style={{ fontSize: 18 }} className={clsx(classes.textCenter)}>
				{t('landingPages.DeleteBody')}
			</Typography>
		),
		cancelText: t('common.No'),
		confirmText: t('common.Yes')
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

	const prepareHeadScript = () => {
		let result = '';
		if (landingPageModel.GoogleAnalyticsCode !== '') {
			result = ClientScriptsWrapper.Google_Analytics.replace('##code##', landingPageModel.GoogleAnalyticsCode);
		}
		if (landingPageModel.GoogleTagManagerCode !== '') {
			const headTagManager = landingPageModel.GoogleTagManagerCode.split('</script>')[0] + '</script>';
			result += ClientScriptsWrapper.Google_Tag_Manager.replace('##code##', headTagManager);
		}
		if (landingPageModel.FacebookPixelCode !== '') {
			result += ClientScriptsWrapper.Facebook_Pixel.replace('##code##', landingPageModel.FacebookPixelCode);
		}

		return result as string;
	}

	const prepareBodyScript = () => {
		let result = '';
		if (landingPageModel.GoogleConvertionCode !== '') {
			result += ClientScriptsWrapper.Google_Conversion.replace('##code##', landingPageModel.GoogleConvertionCode);
		}
		if (landingPageModel.GoogleTagManagerCode !== '') {
			const bodyTagManager = '<noscript>' + landingPageModel.GoogleTagManagerCode.split('<noscript>')[1];
			result += ClientScriptsWrapper.Google_Tag_Manager.replace('##code##', bodyTagManager);
		}

		return result as string;
	}

	const save = async (editorType: EditorType) => {
		const errorDump = {
			...errors,
			PageName: !landingPageModel.PageName?.trim() ? t('landingPages.formNameRequired') : '',
			shortURL: !landingPageModel.PageUrl?.trim() ? t('landingPages.shortURLRequired') : '',
			answerMessage: [
				LandingPagesAnswerType.POPUP_MESSAGE,
				LandingPagesAnswerType.REDIRECT_URL
			].indexOf(landingPageModel.AnswerType) > -1 && !landingPageModel.AnswerData?.trim() ? t('landingPages.answerMessageRequired') : '',
			// paymentURL: [
			// 	LandingPagesAnswerType.TRANSFER_TO_PAYMENT_PAGE
			// ].indexOf(landingPageModel.AnswerType) > -1 && !landingPageModel.AnswerData?.trim() ? t('landingPages.URLRequired') : '',
			// paymentAPIUsername: [
			// 	LandingPagesAnswerType.TRANSFER_TO_PAYMENT_PAGE
			// ].indexOf(landingPageModel.AnswerType) > -1 && !landingPageModel.APIUserName?.trim() ? t('landingPages.APIUsernameRequired') : '',
			// paymentTerminalNumber: [
			// 	LandingPagesAnswerType.TRANSFER_TO_PAYMENT_PAGE
			// ].indexOf(landingPageModel.AnswerType) > -1 && !landingPageModel.TerminalNumber?.trim() ? t('landingPages.terminalNumberRequired') : '',
			offlineURL: landingPageModel?.OfflineDate && !isValidHttpUrl(landingPageModel.OfflineUrl) ? t('landingPages.invalidRedirectURLWhenOffline') : '' //,
			// DownloadUrl: [LandingPagesAnswerType.DOWNLOAD_FILE].indexOf(landingPageModel.AnswerType) > -1 && !landingPageModel.DownloadUrl?.trim() ? t('landingPages.invalidDownloadURL') : ''
		};
		setErrors(errorDump);
		if (Object.values(errorDump).filter(x => x !== '').length <= 0) {
			setIsLoader(true);
			let headScript, bodyScript = '';

			headScript = prepareHeadScript();
			bodyScript = prepareBodyScript();

			const req = {
				...landingPageModel,
				SelectedGroupList: null,
				EmailsToReport: landingPageModel?.EmailsToReport?.join(','),
				GroupIDs: landingPageModel?.GroupIDs?.join(','),
				IsNewEditor: editorType === EditorType.BEE,
				ID: landingPageModel.ID || id,
				ClientJavaScript: headScript,
				ClientBodyScript: bodyScript
			};
			//@ts-ignore
			const response = await dispatch(saveLandingPage(req));
			setIsLoader(false);
			handleSaveResponse(response?.payload, editorType);
			return true;
		} else {
			setDialogType({ type: 'validationDialog' })
		}
	}

	const showErrorToast = (message: string) => setToastMessage({ severity: 'error', color: 'error', message, showAnimtionCheck: false } as any)

	const handleSaveResponse = (response: any, editorType: EditorType) => {
		switch (response.StatusCode) {
			case 201: {
				handleContinueToEditor(editorType, response.Data.ID);
				break;
			}
			case 400: {
				showErrorToast(t('common.Error'));
				break;
			}
			case 401: {
				logout();
				break;
			}
			case 402: {
				showErrorToast(t('common.Error'));
				break;
			}
			case 404: {
				showErrorToast(t('common.Error'));
				break;
			}
			case 405: {
				showErrorToast(t('landingPages.shortUrlExist'));
				setErrors({
					...errors,
					shortURL: t('landingPages.shortURLExist')
				})
				break;
			}
			case 500:
			default: {
				showErrorToast(t('common.Error'));
				break;
			}
		}
	}

	const saveAndContinueToOldEditor = async () => {
		await save(2);
	}

	const saveAndContinue = async (editorType: EditorType) => {
		await save(editorType);
	}

	// const saveAndContinueToNewEditor = async () => {
	// 	await save(1);
	// }

	// navigateBeEditor
	// 0 - Don't redirect, 1 - New Editor, 2 - Old Editor
	const handleContinueToEditor = (editorType: EditorType, savedPageID: number) => {
		const isBeeEditor = (accountFeatures?.indexOf(PulseemFeatures.BEE_EDITOR) > -1 && editorType === EditorType.BEE);
		const pageId = id || savedPageID;
		let redirectUrl = isBeeEditor ? `${sitePrefix}editor/${BEE_EDITOR_TYPES.LANDING_PAGE}/${pageId}` : `/Pulseem/NewWebForm/NewFormEdit/${pageId}?fromreact=true`;

		switch (editorType) {
			case EditorType.BEE: {
				navigate(redirectUrl);
				break;
			}
			case EditorType.OLD: {
				window.location.href = redirectUrl;
				break;
			}
			case EditorType.SAVE_ONLY:
			default: {
				if (!id && savedPageID) navigate(`${sitePrefix}LandingPages/Create/${savedPageID}`);
				// @ts-ignore
				setToastMessage(ToastMessages?.LANDING_PAGE_SAVED);
				return false;
			}
		}

	};

	const renderButtons = () => {
		const wizardButtons = [];
		if (accountFeatures?.indexOf(PulseemFeatures.BEE_EDITOR) === -1) {
			wizardButtons.push(
				<>
					<Button
						onClick={() => { saveAndContinue(EditorType.SAVE_ONLY) }}
						className={clsx(
							classes.btn,
							classes.btnRounded,
							classes.backButton
						)}
						style={{ margin: '8px' }}
						endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
					>
						{t("common.save")}
					</Button>
					<Button
						onClick={() => { saveAndContinue(EditorType.OLD) }}
						className={clsx(
							classes.btn,
							classes.btnRounded,
							classes.backButton
						)}
						style={{ margin: '8px' }}
						endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
					>
						{t('common.continue')}
					</Button>
				</>
			);
		}
		else {
			if (!landingPageModel.IsNewEditor) {
				wizardButtons.push(
					<Button
						onClick={() => { saveAndContinue(EditorType.OLD) }}
						className={clsx(
							classes.btn,
							classes.btnRounded,
							classes.backButton
						)}
						style={{ margin: '8px' }}
						endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
						key="saveContinue"
					>
						<>{t('common.saveAndContinue')}</>
					</Button>
				);
			}

			if (landingPageModel.IsNewEditor || !id) {
				wizardButtons.push(
					<Button
						onClick={() => { saveAndContinue(EditorType.BEE) }}
						className={clsx(
							classes.btn,
							classes.btnRounded,
							classes.backButton
						)}
						style={{ margin: '8px' }}
						endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
						key='newEditor'
					>
						{t('master.continueToNewEditor')}
					</Button>
				);
			}

		}
		return wizardButtons.map((b) => b);
	}

	const renderToast = () => {
		setTimeout(() => {
			setToastMessage(null);
		}, 2000);
		return <Toast customData={null} data={toastMessage} />;
	};

	return (
		<DefaultScreen
			currentPage="landingPages"
			subPage={id ? "EditLandingPage" : "CreateLandingPage"}
			classes={classes}
			customPadding={true}
			containerClass={clsx(classes.mb50, classes.editorCont)}
		>
			<Box className="head">
				<Title Text={t("landingPages.createLandingPage")} classes={classes} />
			</Box>
			<Box className={"containerBody"}>
				<Tabs
					variant='scrollable'
					scrollButtons="auto"
					value={tabValue}
					onChange={(e, value) => setTabValue(value)}
					className={clsx(classes.mr15, classes.ml15)}
					classes={{ indicator: classes.hideIndicator }}
				>
					<Tab
						label={t('landingPages.formProperties')}
						classes={{ root: classes.tabText, selected: classes.activeTab }}
						className={clsx(classes.iconTab, classes.f18)}
						value='1'
					/>
					{landingPageModel.PageType !== 3 && <Tab
						label={t('landingPages.SEOSettings')}
						classes={{ root: classes.tabText, selected: classes.activeTab }}
						className={clsx(classes.iconTab, classes.f18)}
						value='2'
					/>}
					<Tab
						label={t('landingPages.developmentSettings')}
						classes={{ root: classes.tabText, selected: classes.activeTab }}
						className={clsx(classes.iconTab, classes.f18)}
						value='3'
					/>
					<Tab
						style={{ overflow: 'unset' }}
						label={<>
							<Typography style={{ whiteSpace: 'nowrap', textAlign: 'center', fontSize: 18, fontWeight: 500 }}>
								{t("landingPages.linkPreviewSettings")}
								<Tooltip
									disableFocusListener
									title={t('landingPages.linkPreviewTooltip')}
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
					<Tab
						label={t('common.Groups')}
						classes={{ root: classes.tabText, selected: classes.activeTab }}
						className={clsx(classes.iconTab, classes.f18)}
						value='5'
					/>
				</Tabs>
				<TabContext value={`${tabValue}`}>
					<TabPanel value='1' className={clsx(windowSize === 'xs' ? classes.noPadding : '')}>
						<FormProperties
							classes={classes}
							data={landingPageModel}
							onUpdate={setLandingPageModel}
							onSetDialog={setDialogType}
							errors={errors}
							setErrors={setErrors}
						/>

						<Grid container spacing={3}>
							{landingPageModel.PageType !== 2 && <Grid item md={6}>
								<Typography title={t("landingPages.subscriberSettings")} className={clsx(classes.bold, classes.font18)}>
									{t("landingPages.subscriberSettings")}
								</Typography>
								<SubscriberSettings
									classes={classes}
									data={landingPageModel}
									onUpdate={setLandingPageModel}
									onSetDialog={setDialogType}
									removeEmailId={removeEmailId}
									errors={errors}
									onDone={getData}
								/>
							</Grid>}
							{landingPageModel.PageType < 3 && <Grid item md={6}>
								<Typography className={clsx(classes.bold, classes.font18)}>
									{t("landingPages.formOfflineProperties")}
									<Tooltip
										disableFocusListener
										title={t('landingPages.formOfflineDateTooltip')}
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

								<OfflineProperties
									classes={classes}
									data={landingPageModel}
									onUpdate={setLandingPageModel}
									errors={errors}
									setErrors={setErrors}
								/>
							</Grid>}
						</Grid>
					</TabPanel>
					<TabPanel value='2' className={clsx(windowSize === 'xs' ? classes.noPadding : '')}>
						<SeoSettings classes={classes} data={landingPageModel} onUpdate={setLandingPageModel} errors={errors} />
					</TabPanel>
					<TabPanel value='3' className={clsx(windowSize === 'xs' ? classes.noPadding : '')}>
						<DevelopmentSettings classes={classes} data={landingPageModel} onUpdate={setLandingPageModel} />
					</TabPanel>
					<TabPanel value='4' className={clsx(windowSize === 'xs' ? classes.noPadding : '')}>
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
					<TabPanel value='5' className={clsx(windowSize === 'xs' ? classes.noPadding : '')}>
						<Typography title={t("landingPages.redirectURLWhenOffline")} className={clsx(classes.alignDir, classes.pb10, classes.bold, classes.font18)}>
							{t("landingPages.addSubscribersToGroups")} {landingPageModel.PageType === 2 ? <i style={{ fontWeight: 400 }}>({t('landingPages.noRequiredGroupSelection')})</i> : ''}
						</Typography>
						<SubscriberGroup
							classes={classes}
							data={landingPageModel}
							onUpdate={setLandingPageModel}
							onSetDialog={setDialogType}
							removeEmailId={removeEmailId}
							errors={errors}
						/>
					</TabPanel>
				</TabContext>

				<Box>
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
			</Box >
			{renderDialog()}
			{toastMessage && renderToast()}
		</DefaultScreen >
	)
}

export default CreateLandingPage;
