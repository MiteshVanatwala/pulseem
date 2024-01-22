import { useEffect, useState } from 'react'
import DefaultScreen from "../../DefaultScreen";
import clsx from "clsx";
import { Grid, Box, Divider, Typography, TextField, makeStyles, FormControl, Select, OutlinedInput, FormHelperText, Button, Checkbox, FormControlLabel } from '@material-ui/core'
import { Loader } from "../../../components/Loader/Loader";
import SimpleGrid from "../../../components/Grids/SimpleGrid";
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from "react-i18next";
import { deleteCampaign, setVerificationDomain } from '../../../redux/reducers/newsletterSlice';
import { getCampaignInfo, saveCampaignInfo, getCreditsByFileTotalBytes } from '../../../redux/reducers/newsletterSlice';
import Toast from '../../../components/Toast/Toast.component';
import WizardActions from '../../../components/Wizard/WizardActions';
import { getAccountExtraData } from "../../../redux/reducers/smsSlice";
import Gallery from '../../../components/Gallery/Gallery.component';
import { ClientFields, PulseemFolderType } from "../../../model/PulseemFields/Fields";
import { RandomID } from '../../../helpers/Functions/functions';
import { getAuthorizedEmails } from '../../../redux/reducers/commonSlice';
import VerificationDialog from '../../../components/DialogTemplates/VerificationDialog';
import { useNavigate, useParams } from 'react-router-dom';
import { AdditionalText } from './components/AdditionalText';
import { AdvancedSettings } from './components/AdvancedSettings';
import { getCookie, setCookie } from '../../../helpers/Functions/cookies';
import { PulseemFeatures } from '../../../model/PulseemFields/Fields';
import EmojiPicker from '../../../components/Emojis/EmojiPicker';
import { BiSave } from 'react-icons/bi'
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import { DialogType } from '../../HtmlCampaign/helper/Config';
import Templates from '../../HtmlCampaign/modals/Templates';
import { getPublicTemplates, getAllTemplatesBySubaccountId, getTemplateById, saveCampaign } from '../../../redux/reducers/campaignEditorSlice';
import { SharedEmailDomain } from '../../../config';
import DomainVerification from '../../../Shared/Dialogs/DomainVerification';

const useStyles = makeStyles({
    iconbox: {
        marginBottom: 'auto',
        fontSize: 32,
        width: 50,
        height: 'auto',
        color: "#000000",
        '& img': {
            maxWidth: "100%"
        }
    },
    textbox: {
        '& .MuiInputBase-root': {
            '& .MuiOutlinedInput-input': {
                padding: '11.5px 14px !important'
            }

        },
        '& .MuiFormHelperText-contained': {
            marginInline: 0
        },
        '& .MuiFormHelperText-root': {
            fontSize: '1rem'
        }
    },
    autocomplete: {
        '& .MuiInputBase-root': {
            padding: '9px 40px 9px 10px !important'
        },
        '& .MuiAutocomplete-endAdornment': {
            display: 'flex',
            justifyContent: 'flex-end'
        },
        '& .MuiFormHelperText-contained': {
            marginInline: 0
        }

    },
    select: {
        width: '100%',
        '& .MuiSelect-select': {
            padding: '19.5px 24px',
            width: '100%',
            '& option': {
                fontSize: 20
            }
        }
    },
    googleCheck: {
        '& span': {
            padding: '9px 0px'
        },
        '& svg': {
            marginInline: 2
        },
        '& p': {
            marginInline: 3
        }
    },
    btnP20: {
        padding: '20px !important'
    },
    fileUploadBox: {
        background: "rgb(215, 215, 215)",
        border: "solid 1px #58585838",
        borderRadius: "3px",
        marginTop: "-2px",
        width: "100%",
        height: "39px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        '& svg': {
            fontSize: 30,
            color: '#707070'
        },
        '& input': {
            display: 'none'
        },
        '& label': {
            cursor: 'pointer'
        }
    },
    helperText: {
        marginLeft: 14,
        marginRight: 14,
        color: "rgba(0, 0, 0, 0.54)",
        margin: "0",
        fontSize: "0.75rem",
        marginTop: 3,
        textAlign: "left",
        fontFamily: "Assistant",
        fontWeight: 400,
        lineHeight: 1.66,
    },
    suHeading: {
        fontSize: 25,
        fontWeight: 700,
        paddingBottom: 10
    },
    contentCenter: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    }
})

const NewsLetterInfo = ({ classes }) => {
    const { id } = useParams();
    const queryParams = new URLSearchParams(window.location.search)
    const isNew = queryParams.get("new")
    const isFromAutomation = queryParams.get("FromAutomation")
    const NodeToEdit = queryParams.get("NodeToEdit")

    const { isRTL, CoreToastMessages } = useSelector((state) => state.core);
    const { publicTemplates, templatesBySubAccount } = useSelector(state => state.campaignEditor);
    const { t } = useTranslation();
    const localClasses = useStyles()
    const dispatch = useDispatch()
    const [toastMessage, setToastMessage] = useState(null);
    const [showLoader, setLoader] = useState(true);
    const [extraAccountDATA, setextraAccountDATA] = useState([]);
    const { verifiedEmails, accountSettings, accountFeatures } = useSelector(state => state.common);
    const { ToastMessages } = useSelector(state => state.newsletter);
    const [showGallery, setShowGallery] = useState(false);
    const [isGalleryConfirmed, setIsFileSelected] = useState(false);
    const [isSilenceUpdated, setIsSilenceUpdated] = useState(false);
    const [campaignLoaded, setCampaignLoaded] = useState(false);
    const [newEditorDisabled, setNewEditorDisabled] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [template, setTemplate] = useState('');
    const [showDomainVerification, setShowDomainVerification] = useState(false);
    const [domainAddressError, setDomainAddressError] = useState({
        display: false,
        address: '',
        verifySharedCallback: null,
        isSummary: false,
        isFullDescription: false,
        preText: '',
        showSkip: false
    });

    const navigate = useNavigate();
    const maxCharLimits = {
        Name: 100,
        Subject: 200,
        FromName: 100,
        PreviewText: 200
    }
    const [errors, setErrors] = useState({
        Name: "",
        Subject: "",
        FromName: "",
        FromEmail: ""
    })

    const helperTexts = {
        Name: t('campaigns.newsLetterEditor.helpTexts.Name'),
        Subject: t('campaigns.newsLetterEditor.helpTexts.Subject'),
        FromName: t('common.requiredField'),
        FromEmail: t('campaigns.newsLetterEditor.helpTexts.FromEmail'),
        PreviewText: t('campaigns.newsLetterEditor.helpTexts.pre_helper_text'),
        ReplyEmail: t('campaigns.newsLetterEditor.helpTexts.ReplyEmail')
    }

    const ErrorTexts = {
        Name: t('campaigns.newsLetterEditor.errors.fromName'),
        Subject: t('campaigns.newsLetterEditor.errors.campaignSubject'),
        FromName: t('campaigns.newsLetterEditor.errors.fromName'),
        FromEmail: t('campaigns.newsLetterEditor.errors.fromEmail')
    }

    const [campaingnValues, setCampaingnValues] = useState({
        LanguageCode: 0,
        CampaignID: "",
        Name: "",
        Subject: "",
        personalDatatoSubject: "",
        FromName: "",
        FromEmail: "-1",
        WebViewLocation: 1,
        PreviewText: "",
        PrintLocation: 0,
        UnsubscribeLocation: 2,
        UpdateClient: 0,
        IsResponsive: 1,
        FilesProperties: [],
        HtmlToEdit: '',
        HtmlToSend: '',
        ReplyTo: ''
    })

    const [selectedCheck, setSelectedCheck] = useState({ WebViewLocation: false, PrintLocation: false, UnsubscribeLocation: false, UpdateClient: false })
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [confirmExit, setConfirmExit] = useState(false)
    const [verPopupOpen, setVerPopupOpen] = useState(false)
    const [dialogType, setDialogType] = useState(null)

    const [hideCautionNewMessage, setHideCautionNewMessage] = useState(false)
    const [hideCautionOldMessage, setHideCautionOldMessage] = useState(false)

    const defaultValues = { WebViewLocation: 1, PrintLocation: 2, UnsubscribeLocation: 2, UpdateClient: 2 }

    //#region default values
    useEffect(() => {
        if (accountSettings) {
            setDefaultEmailAndName();
        }
    }, [verifiedEmails, accountSettings, campaignLoaded]);

    useEffect(() => {
        handleInitialValues();
    }, [campaingnValues]);

    const handleInitialValues = () => {
        setSelectedCheck({
            ...selectedCheck,
            UpdateClient: campaingnValues.UpdateClient && campaingnValues.UpdateClient !== 0,
            PrintLocation: campaingnValues.PrintLocation && campaingnValues.PrintLocation !== 0,
            WebViewLocation: campaingnValues.WebViewLocation && campaingnValues.WebViewLocation !== 0,
            UnsubscribeLocation: campaingnValues.UnsubscribeLocation && campaingnValues.UnsubscribeLocation !== 0,
        });

        if ((!campaingnValues?.ReplyTo || campaingnValues?.ReplyTo === '') && (campaingnValues.FromEmail !== '' && campaingnValues.FromEmail !== '-1')) {
            const sharedDomainAddress = accountSettings?.SubAccountSettings?.SharedEmailDomain;
            if (campaingnValues.FromEmail !== sharedDomainAddress) {
                setCampaingnValues({ ...campaingnValues, ReplyTo: campaingnValues.FromEmail });
            }
            else {
                setCampaingnValues({ ...campaingnValues, ReplyTo: verifiedEmails[0]?.Number });
            }
        }
    }
    // const handleClickOutsideEmoji = () => {
    //     setShowEmoji(false);
    // }

    // useEffect(() => {
    //     const htmlTemplate = sessionStorage.getItem("Newlsetter_Html_Template");
    //     if (htmlTemplate && htmlTemplate !== '') {
    //         setNewEditorDisabled(true);
    //         setCampaingnValues({ ...campaingnValues, HtmlToEdit: htmlTemplate, HtmlToSend: htmlTemplate });
    //         sessionStorage.removeItem("Newlsetter_Html_Template");
    //     }
    //     if (!publicTemplates.length) dispatch(getPublicTemplates(isRTL));
    //     if (!templatesBySubAccount.length) dispatch(getAllTemplatesBySubaccountId());
    // }, []);

    // useEffect(() => {
    //     dispatch(getPublicTemplates(isRTL));
    // }, [isRTL])

    const setDefaultEmailAndName = () => {
        if (accountSettings) {
            if ((campaingnValues.FromEmail === '' || campaingnValues.FromEmail === '-1') && verifiedEmails) {
                if (campaingnValues?.CampaignID === '') {
                    const defaultEmail = verifiedEmails.find((email) => {
                        return email?.Number === accountSettings?.DefaultFromMail;
                    });
                    if (defaultEmail?.IsOptIn) {
                        campaingnValues.FromEmail = defaultEmail.Number;
                    }
                    else {
                        campaingnValues.FromEmail = '-1';
                    }
                }
                else {
                    const emailVerified = verifiedEmails.find((email) => {
                        return email?.Number === campaingnValues?.FromEmail;
                    });
                    if (!emailVerified && Number(campaingnValues?.CampaignID) > 0) {
                        campaingnValues.FromEmail = '-1';
                    }
                }
            }
            if (accountSettings?.DefaultFromName && accountSettings?.DefaultFromName !== '') {
                setCampaingnValues({ ...campaingnValues, FromName: campaingnValues.FromName === '' ? accountSettings?.DefaultFromName : campaingnValues.FromName });
            }
        }
    }
    //#endregion

    const handleGetNewsletterResponse = (res) => {
        switch (res?.StatusCode || 201) {
            case 201: {
                setCampaingnValues({ ...res?.Message })
                setCampaignLoaded(true);
                break;
            }
            case 401: {
                setToastMessage(ToastMessages.INVALID_API_MISSING_KEY)
                break;
            }
            case 402: {
                setToastMessage(ToastMessages.INVALID_CAMPAIGN_ID)
                break;
            }
            case 403: {
                setToastMessage(CoreToastMessages?.XSS_ERROR);
                break;
            }
            case 404: {
                setToastMessage(ToastMessages.CAMPAIGN_NOT_FOUND)
                break;
            }
            case 200:
            case 500:
            default: {
                setToastMessage(ToastMessages.GENERAL_ERROR)
                break;
            }
        }
    }
    const handleSubmitNewsletterResponse = (res, isExit, isNewEditor) => {
        switch (res?.StatusCode) {
            case 201: {
                setToastMessage(ToastMessages.SUCEESS)
                break;
            }
            case 401: {
                setToastMessage(ToastMessages.INVALID_API_MISSING_KEY)
                break;
            }
            case 403: {
                setToastMessage(CoreToastMessages.XSS_ERROR)
                break;
            }
            case 406: {
                setToastMessage(ToastMessages.NULL_FILE)
                break;
            }
            case 451: {
                if (!isExit) {
                    const saveInfo = JSON.parse(res.Message);
                    const emailProps = verifiedEmails.filter((ve) => { return ve.Number === campaingnValues.FromEmail })[0];
                    const isSharedDomain = campaingnValues.FromEmail.split("@").pop() === SharedEmailDomain;

                    const emailObj = {
                        NonVerified: 'common.domainVerification.campaignCreation.nonVerified.preText',
                        Restricted: 'common.domainVerification.campaignCreation.restricted.preText',
                    }

                    const domainErrorObj = {
                        display: true,
                        address: campaingnValues.FromEmail,
                        verifySharedCallback: async (obj) => {
                            if (obj && obj.Skip === true) {
                                handleContinueToEditor(isNewEditor, saveInfo.CampaignID);
                            }
                            else {
                                if (obj && obj.ReplyTo && obj.FromEmail) {
                                    setCampaingnValues({ ...campaingnValues, FromEmail: obj.FromEmail, ReplyTo: obj.ReplyTo });
                                    await dispatch(saveCampaignInfo({ ...campaingnValues, FromEmail: obj.FromEmail, ReplyTo: obj.ReplyTo, IsNewEditor: isNewEditor }));
                                }
                            }
                            setShowDomainVerification(false);
                        },
                        isFullDescription: true,
                        preText: t(emailObj[emailProps?.IsRestricted ? 'Restricted' : 'NonVerified']),
                        replyTo: isSharedDomain ? (campaingnValues.ReplyTo || verifiedEmails[0].Number) : (campaingnValues.ReplyTo || campaingnValues.FromEmail),
                        showSkip: false,
                        options: [{
                            text: t('common.skip'),
                            onCallback: () => {
                                handleContinueToEditor(isNewEditor, saveInfo.CampaignID);
                            }
                        }]
                    }

                    setDomainAddressError(domainErrorObj);
                    setShowDomainVerification(true);
                }
                else {
                    navigate(`/react/Campaigns`);
                }
                break;
            }
            case 500: {
                setToastMessage(ToastMessages.GENERAL_ERROR)
                break;
            }
            default: {
                setToastMessage(ToastMessages.GENERAL_ERROR)
            }
        }
    }
    useEffect(() => {
        const preload = async () => {
            await dispatch(getAuthorizedEmails());
            if (id != null && parseInt(id) > 0) {
                const campaignId = parseInt(id);
                const response = await dispatch(getCampaignInfo(campaignId))
                handleGetNewsletterResponse(response.payload)
            }
            setLoader(false);
            setIsSilenceUpdated(false);
        }
        const initClientFields = async () => {
            let resp = await dispatch(getAccountExtraData());
            let _clientFields = [...ClientFields];
            let arr = Object.keys(resp.payload).reduce((prev, next) => {
                if (!!next && resp.payload[next] !== '') {
                    return [...prev, { value: next, label: resp.payload[next], selected: false }]
                }
                else {
                    return prev
                }
            }, [])

            setextraAccountDATA([..._clientFields, ...arr])
        }

        initClientFields();
        preload();
    }, [])

    const initFilesAndCredits = async (cid) => {
        if (campaingnValues.FilesProperties) {
            const response = await dispatch(getCampaignInfo(cid))
            handleGetNewsletterResponse(response.payload)
        }
    }
    const silenceSave = async () => {
        await dispatch(saveCampaignInfo(campaingnValues))
    }

    const renderTemplateButtons = () => !parseInt(id) && <Button onClick={() => {
        setLoader(true);
        setTimeout(() => {
            setDialogType(DialogType.Templates);
        }, 1000);

        setTimeout(() => {
            setLoader(false);
        }, 2000);
    }}
        variant='contained'
        size='medium'
        className={clsx(
            classes.actionButton,
            classes.actionButtonOutlinedBlue
        )}
        style={{ margin: '8px' }}
    >
        {t('common.templates')}
    </Button>

    useEffect(() => {
        if (isSilenceUpdated && campaingnValues?.CampaignID && campaingnValues?.CampaignID > 0) {
            silenceSave().then(() => {
                initFilesAndCredits(campaingnValues?.CampaignID);
                setIsSilenceUpdated(false);
            })
        }
    }, [isSilenceUpdated])

    const handleSelectionRadio = (e) => {
        setCampaingnValues({ ...campaingnValues, [e.target.name]: Number(e.target.value) })
    }
    const handleChangeCheckbox = (e) => {
        if (selectedCheck[e.target.name]) {
            setCampaingnValues({ ...campaingnValues, [e.target.name]: 0 })
        }
        else {
            setCampaingnValues({ ...campaingnValues, [e.target.name]: defaultValues[e.target.name] })
        }
        setSelectedCheck({ ...selectedCheck, [e.target.name]: !selectedCheck[e.target.name] })
    }

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.value.length < maxCharLimits[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' })
            setCampaingnValues({ ...campaingnValues, [e.target.name]: e.target.value })
        }
    }

    const handleFromEmailChange = (event) => {
        const isSharedDomain = event.target.value.split("@").pop() === SharedEmailDomain;
        const fromEmailProperty = verifiedEmails.filter((ve) => { return ve.Number === event.target.value })[0];
        setCampaingnValues({
            ...campaingnValues,
            FromEmail: event.target.value,
            ReplyTo: isSharedDomain ? ((campaingnValues.ReplyTo !== '' && campaingnValues.ReplyTo) || verifiedEmails[0].Number) : event.target.value
        });
        setErrors({ ...errors, FromEmail: '' });
        if (!isSharedDomain && (!fromEmailProperty.IsVerified || fromEmailProperty.IsRestricted === true)) {

            const emailObj = {
                NonVerified: 'common.domainVerification.campaignCreation.nonVerified.preText',
                Restricted: 'common.domainVerification.campaignCreation.restricted.preText',
            }

            const domainErrorObj = {
                display: true,
                address: fromEmailProperty.Number,
                verifySharedCallback: async (obj) => {
                    setCampaingnValues({ ...campaingnValues, FromEmail: obj.FromEmail, ReplyTo: obj.ReplyTo });
                    await dispatch(saveCampaignInfo({ ...campaingnValues, FromEmail: obj.FromEmail, ReplyTo: obj.ReplyTo }));
                    setShowDomainVerification(false);
                },
                isFullDescription: true,
                preText: t(emailObj[fromEmailProperty?.IsRestricted ? 'Restricted' : 'NonVerified']),
                showSkip: false,
                replyTo: isSharedDomain ? (campaingnValues.ReplyTo || verifiedEmails[0].Number) : event.target.value
            }

            setDomainAddressError(domainErrorObj);
            setShowDomainVerification(true);
        }
    }

    const handleHideNewCautionMessage = (e) => {
        setHideCautionNewMessage(e);
        if (e === true) {
            setCookie("showCautionOldEditor", "false");
        }
        else {
            setCookie("showCautionOldEditor", "true");
        }
    }

    const handleHideOldCautionMessage = (e) => {
        setHideCautionOldMessage(e);
        if (e === true) {
            setCookie("showCautionNewEditor", "false");
        }
        else {
            setCookie("showCautionNewEditor", "true");
        }
    }

    const handleValidations = () => {
        const tempError = { ...errors }
        const data = { ...campaingnValues }
        let isError = false;

        Object.keys(tempError).forEach((key) => {
            if (key === 'FromEmail' && data[key] === '-1') {
                tempError[key] = ErrorTexts[key];
                isError = true
            }
            else {
                if (!data[key] || !data[key].trim()) {
                    tempError[key] = ErrorTexts[key];
                    isError = !data[key]
                }
            }
        })
        setErrors({ ...tempError })
        return isError
    }

    const handleContinueToEditor = (isNewEditor = false, campaignId) => {
        const isBeeEditor = (accountFeatures?.indexOf(PulseemFeatures.BEE_EDITOR) > -1 && isNewEditor);
        let redirectUrl = isBeeEditor ? `/react/Campaigns/editor/${campaignId}` : `/Pulseem/Editor/CampaignEdit/${campaignId}`;
        if (isFromAutomation) {
            if (isNew) {
                redirectUrl += `?new=${isNew}&FromAutomation=${isFromAutomation}&NodeToEdit=${NodeToEdit}`;
            }
            else {
                redirectUrl += `?FromAutomation=${isFromAutomation}&NodeToEdit=${NodeToEdit}`;
            }
        }
        window.location = redirectUrl;
    }

    const handleSubmit = async (isContiue, isExit = false, isNewEditor = false) => {
        if (!handleValidations()) {
            setLoader(true);
            await dispatch(saveCampaignInfo({ ...campaingnValues, IsNewEditor: isNewEditor })).then(async (response) => {
                setLoader(false);

                const savedCampaign = response.payload;
                handleSubmitNewsletterResponse(savedCampaign, isExit, isNewEditor);
                if (savedCampaign?.StatusCode === 403 || savedCampaign?.StatusCode === 451) {
                    return false;
                }

                const saveInfo = JSON.parse(savedCampaign.Message);

                if (template?.Html && template?.JsonData) {
                    await dispatch(saveCampaign({
                        Name: campaingnValues.Name,
                        campaignId: saveInfo.CampaignID,
                        JsonData: template?.JsonData,
                        HTML: template?.Html
                    }));
                }

                if (isContiue) {
                    handleContinueToEditor(isNewEditor, saveInfo?.CampaignID);
                }
                else if (isExit === true) {
                    if (isFromAutomation) {
                        window.location = `/Pulseem/CreateAutomations.aspx?AutomationID=${isFromAutomation}&NodeToEdit=${NodeToEdit}&fromreact=true&Culture=${isRTL ? 'he-IL' : 'en-US'}`
                        return false;
                    }
                    navigate(`/react/Campaigns`);
                }
                else if (campaingnValues.CampaignID <= 0 || campaingnValues.CampaignID === '' || !campaingnValues.CampaignID) {
                    if (isFromAutomation) {
                        navigate(`/react/Campaigns/Create/${saveInfo.CampaignID}?new=${isNew}&FromAutomation=${isFromAutomation}&NodeToEdit=${NodeToEdit}`)
                    }
                    else {
                        navigate(`/react/Campaigns/Create/${saveInfo.CampaignID}`)
                    }
                    initFilesAndCredits(saveInfo.CampaignID);
                }
            });
        }
    }
    const handleDelete = async () => {
        await dispatch(deleteCampaign(campaingnValues.CampaignID));
        setConfirmDelete(false)
        navigate('/react/Campaigns');
    }
    const renderToast = () => {
        if (toastMessage) {

            setTimeout(() => {
                setToastMessage(null);
            }, 4000);
            return (
                <Toast data={toastMessage} />
            );
        }
        return null;
    }
    const CampaignBox1 = () => (
        <Box py={3}>
            <SimpleGrid
                spacing={3}
                centerlize={true}
                gridArr={
                    [
                        {
                            content: <SimpleGrid
                                gridArr={[{
                                    content: <Typography title={t("campaigns.camapignName")} className={classes.alignDir}>{t("campaigns.camapignName")}</Typography>,
                                    gridSize: { xs: 12, sm: 12 }
                                },
                                {
                                    content: <TextField
                                        id="campaignName"
                                        label=""
                                        variant="outlined"
                                        name="Name"
                                        value={campaingnValues.Name}
                                        className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252, localClasses.textbox)}
                                        autoComplete="off"
                                        onChange={handleChange}
                                        error={errors.Name}
                                        title={campaingnValues.Name}
                                        helperText={errors.Name ? errors.Name : helperTexts.Name}
                                    />,
                                    gridSize: { xs: 12, sm: 12 }
                                }
                                ]}
                            />,
                            gridSize: { xs: 12, sm: 4 }
                        },
                        {
                            content: <SimpleGrid
                                gridArr={[{
                                    content: <Typography title={t("campaigns.newsLetterEditor.campaignSubject")} className={classes.alignDir}>{t("campaigns.newsLetterEditor.campaignSubject")}</Typography>,
                                    gridSize: { xs: 12, sm: 12 }
                                },
                                {
                                    content:
                                        <Box className={classes.flex}>
                                            <TextField
                                                id="outlined-basic"
                                                label=""
                                                variant="outlined"
                                                name="Subject"
                                                value={campaingnValues.Subject}
                                                className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252, localClasses.textbox)}
                                                autoComplete="off"
                                                onChange={handleChange}
                                                error={errors.Subject}
                                                title={campaingnValues.Subject}
                                                helperText={errors.Subject ? errors.Subject : helperTexts.Subject}
                                            />
                                            <EmojiPicker
                                                classes={classes}
                                                boxStyles={{ marginTop: 30 }}
                                                OnSelectEmoji={(emoji) => {
                                                    setCampaingnValues({ ...campaingnValues, Subject: campaingnValues.Subject + emoji })
                                                }}
                                            />
                                        </Box>,
                                    gridSize: { xs: 12, sm: 12 }
                                }
                                ]}
                            />,
                            gridSize: { xs: 12, sm: 6 }
                        },
                        {
                            content: <SimpleGrid
                                gridArr={[{
                                    content: <Typography title={t("campaigns.newsLetterEditor.personalization")} className={classes.alignDir}>{t("campaigns.newsLetterEditor.personalization")}</Typography>,
                                    gridSize: { xs: 12, sm: 12 }
                                },
                                {
                                    content: <>
                                        <FormControl className={localClasses.select}>
                                            <Select
                                                native
                                                displayEmpty
                                                value={''}
                                                onChange={(event) => {
                                                    setCampaingnValues(
                                                        {
                                                            ...campaingnValues,
                                                            personalDatatoSubject: event.target.value,
                                                            Subject: `${campaingnValues.Subject} ##${event.target.value}##`
                                                        })
                                                }}
                                                input={<OutlinedInput />}
                                                renderValue={(selected) => {
                                                    if (!selected) {
                                                        return <option>{t("common.select")}</option>;
                                                    }

                                                    return selected;
                                                }}
                                                MenuProps={{
                                                    PaperProps: {
                                                        style: {
                                                            maxHeight: 48 * 4.5 + 8,
                                                            width: 250,
                                                        },
                                                    },
                                                }}
                                                inputProps={{ 'aria-label': 'Without label' }}
                                            >
                                                <option>{t("common.select")}</option>;
                                                {extraAccountDATA.map((item, index) => (
                                                    <option
                                                        key={`exd_${index}`}
                                                        value={item.value}
                                                    >
                                                        {t(item.label)}
                                                    </option>
                                                ))}
                                            </Select>
                                        </FormControl>


                                    </>,
                                    gridSize: { xs: 12, sm: 12 }
                                }
                                ]}
                            />,
                            gridSize: { xs: 12, sm: 2 }
                        },
                        {
                            content: <SimpleGrid
                                gridArr={[{
                                    content: <Typography title={t("campaigns.newsLetterEditor.fromName")} className={classes.alignDir}>{t("campaigns.newsLetterEditor.fromName")}</Typography>,
                                    gridSize: { xs: 12, sm: 12 }
                                },
                                {
                                    content: <TextField
                                        id="outlined-basic"
                                        label=""
                                        variant="outlined"
                                        name="FromName"
                                        value={campaingnValues.FromName !== '' ? campaingnValues.FromName : accountSettings?.DefaultFromName}
                                        className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252, localClasses.textbox)}
                                        autoComplete="off"
                                        onChange={handleChange}
                                        error={errors.FromName}
                                        title={campaingnValues.FromName}
                                        helperText={errors.FromName ? errors.FromName : helperTexts.FromName}
                                    />,
                                    gridSize: { xs: 12, sm: 12 }
                                }
                                ]}
                            />,
                            gridSize: { xs: 12, sm: 4 }
                        },
                        {
                            content: <SimpleGrid
                                gridArr={[{
                                    content: <Typography title={t("campaigns.newsLetterEditor.fromEmail")} className={classes.alignDir}>{t("campaigns.newsLetterEditor.fromEmail")}</Typography>,
                                    gridSize: { xs: 12, sm: 12 }
                                },
                                {
                                    content:
                                        <FormControl className={localClasses.select} error={errors.FromEmail}>
                                            <Select
                                                native
                                                displayEmpty
                                                value={campaingnValues?.FromEmail}
                                                onChange={(event, val) => {
                                                    handleFromEmailChange(event);
                                                }}

                                                name="FromEmail"
                                                input={<OutlinedInput />}
                                                MenuProps={{
                                                    PaperProps: {
                                                        style: {
                                                            maxHeight: 48 * 4.5 + 8,
                                                            width: 250,
                                                        },
                                                    },
                                                }}
                                                inputProps={{ 'aria-label': 'Without label' }}
                                            >
                                                <option disabled value="-1" key="-1">{t("common.select")}</option>
                                                {verifiedEmails.map((item, index) => {
                                                    if (item.IsOptIn) {
                                                        return <option
                                                            key={`exd_${index}`}
                                                            value={item.Number}
                                                        >
                                                            {t(item.Number)}
                                                        </option>
                                                    }
                                                }
                                                )}
                                                {accountSettings?.SubAccountSettings?.SharedEmailDomain &&
                                                    <option
                                                        key={verifiedEmails.length + 1}
                                                        value={accountSettings?.SubAccountSettings?.SharedEmailDomain}
                                                    >
                                                        {t(accountSettings?.SubAccountSettings?.SharedEmailDomain)}
                                                    </option>}
                                            </Select>
                                            <FormHelperText style={{ fontSize: '1rem' }}>
                                                {errors.FromEmail ? errors.FromEmail : helperTexts.FromEmail + ' '}
                                                <strong className={clsx(classes.link, classes.textRed)} onClick={() => setVerPopupOpen(true)}>{t('campaigns.newsLetterEditor.helpTexts.clickToVerify')}</strong>
                                            </FormHelperText>
                                        </FormControl>,
                                    gridSize: { xs: 12, sm: 12 }
                                }
                                ]}
                            />,
                            gridSize: { xs: 12, sm: 4 }
                        },
                        {
                            content: <SimpleGrid
                                gridArr={[{
                                    content: <Typography title={t("campaigns.newsLetterEditor.replyTo")} className={classes.alignDir}>{t("campaigns.newsLetterEditor.replyTo")}</Typography>,
                                    gridSize: { xs: 12, sm: 12 }
                                },
                                {
                                    content:
                                        <FormControl className={localClasses.select}>
                                            <Select
                                                native
                                                displayEmpty
                                                name="ReplyTo"
                                                value={campaingnValues?.ReplyTo}
                                                input={<OutlinedInput />}
                                                MenuProps={{
                                                    PaperProps: {
                                                        style: {
                                                            maxHeight: 48 * 4.5 + 8,
                                                            width: 250,
                                                        },
                                                    },
                                                }}
                                                inputProps={{ 'aria-label': 'Without label' }}
                                                onChange={(event, val) => {

                                                    setCampaingnValues({ ...campaingnValues, ReplyTo: event.target.value });
                                                    setErrors({ ...errors, ReplyTo: '' });
                                                }}
                                            >
                                                <option
                                                    key='-1'
                                                    value='-1'
                                                    disabled
                                                >
                                                    {t("common.select")}
                                                </option>
                                                {verifiedEmails.map((item, index) => {
                                                    return item.Number.split("@").pop() !== SharedEmailDomain && <option
                                                        key={index}
                                                        value={item.Number}
                                                        name={item.Number}
                                                    >
                                                        {campaingnValues?.FromEmail === item.Number ? t("campaigns.newsLetterEditor.helpTexts.useFromEmailAsReply") : item.Number}
                                                    </option>
                                                })}
                                            </Select>
                                            <FormHelperText style={{ fontSize: '1rem' }} className={clsx(errors.ReplyTo ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
                                                {helperTexts.ReplyEmail}
                                            </FormHelperText>
                                        </FormControl>,
                                    gridSize: { xs: 12, sm: 12 }
                                }
                                ]}
                            />,
                            gridSize: { xs: 12, sm: 4 }
                        }
                    ]
                }

            />
        </Box>
    )
    const removeAttachmentFile = async (event, fileId) => {
        event.preventDefault();
        event.stopPropagation();
        const newAttachments = [...campaingnValues.FilesProperties];
        setCampaingnValues({ ...campaingnValues, FilesProperties: newAttachments.filter((f) => f.ID !== fileId) });
        setIsSilenceUpdated(true);

        const filteredAttachments = newAttachments.filter((f) => f.ID !== fileId);
        if (filteredAttachments.length > 0) {
            const response = await dispatch(getCreditsByFileTotalBytes({ ...campaingnValues, FilesProperties: filteredAttachments }));
            handleGetNewsletterResponse(response.payload)
        }
    }
    const getDeleteStatus = () => {
        return setConfirmDelete(true)
    }
    const handleGalleryConfirm = () => {
        setIsFileSelected(true);
    }
    const handleSelectedImage = async (files) => {
        const existsFiles = [...campaingnValues.FilesProperties];

        if (!files || files[0] === '') {
            setShowGallery(false);
            setIsFileSelected(false);
            return;
        }

        files = files.split(',');

        for (var i = 0; i < files.length; i++) {
            const file = files[i];

            const existFile = campaingnValues.FilesProperties.find((f) => {
                return f.FileURL === file
            });

            if (!existFile) {
                let fileName = file.split('/')[file.split('/').length - 1];
                const newFile = {
                    Name: fileName,
                    FileName: fileName,
                    FolderType: PulseemFolderType.DOCUMENT,
                    FileURL: file,
                    ID: RandomID()
                }
                existsFiles.push(newFile);
            }
        }

        setCampaingnValues({ ...campaingnValues, FilesProperties: [...existsFiles] })
        setShowGallery(false);
        setIsFileSelected(false);
        setIsSilenceUpdated(true);
        const response = await dispatch(getCreditsByFileTotalBytes({ ...campaingnValues, FilesProperties: [...existsFiles] }));
        handleGetNewsletterResponse(response.payload)
    }
    const showGalleryModal = () => {
        if (showGallery) {
            let dialog = {};
            dialog = renderGalleryDialog();

            return (
                <BaseDialog
                    maxHeight="calc(70vh)"
                    disableBackdropClick={true}
                    style={{ minHeight: 400 }}
                    showDivider={false}
                    classes={classes}
                    open={showGallery}
                    onClose={() => { setShowGallery(false) }}
                    onCancel={() => { setShowGallery(false) }}
                    onConfirm={handleGalleryConfirm}
                    {...dialog}>
                    {dialog.content}
                </BaseDialog>
            );
        }
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
                    style={{ minWidth: 400 }}
                    multiSelect={true}
                    selected={campaingnValues?.FilesProperties ? campaingnValues?.FilesProperties.map(f => f.FileName) : []}
                    folderType={PulseemFolderType.DOCUMENT} />
            )
        };
    }

    const handleExit = (confirmSave) => {
        setConfirmExit(false);
        if (confirmSave === null) {
            return false;
        }
        if (confirmSave === true) {
            handleSubmit(false, true);
        }
        else {
            if (isFromAutomation) {
                window.location = `/Pulseem/CreateAutomations.aspx?AutomationID=${isFromAutomation}&NodeToEdit=${NodeToEdit}&fromreact=true&Culture=${isRTL ? 'he-IL' : 'en-US'}`
                return false;
            }
            navigate('/react/Campaigns');
        }
    }

    const renderButtons = () => {
        const wizardButtons = [];
        const showCautionOldEditor = getCookie('showCautionOldEditor') !== "false" && accountFeatures.indexOf(PulseemFeatures.BEE_EDITOR) > -1
        const showCautionNewEditor = getCookie('showCautionNewEditor') !== "false" && accountFeatures.indexOf(PulseemFeatures.BEE_EDITOR) > -1
        if (accountFeatures.indexOf(PulseemFeatures.BEE_EDITOR) === -1) {
            wizardButtons.push(<>
                <Button
                    onClick={() =>
                        handleSubmit()}
                    variant='contained'
                    size='medium'
                    className={clsx(
                        classes.actionButton,
                        classes.actionButtonLightBlue,
                        classes.backButton
                    )}
                    style={{ margin: '8px' }}
                    startIcon={<BiSave />}
                    color="primary"
                >{t("common.save")}
                </Button>
                <Button onClick={() => handleSubmit(true, false, false)}
                    variant='contained'
                    size='medium'
                    className={clsx(
                        classes.actionButton,
                        classes.actionButtonLightGreen,
                        classes.backButton
                    )}
                    style={{ marginInlineStart: '8px' }}
                    color="primary"
                >{t('common.continue')}</Button>
            </>);
        }
        else {
            if (id !== null && campaingnValues.IsNewEditor === true) {
                wizardButtons.push(<Button
                    onClick={() => handleSubmit(true, false, true)}
                    variant='contained'
                    size='medium'
                    className={clsx(
                        classes.actionButton,
                        classes.actionButtonLightGreen,
                        classes.backButton,
                        classes.ribbonContainer
                    )}
                    style={{ marginInlineStart: '8px' }}
                    color="primary"
                >
                    {t('master.continueToNewEditor')}
                    <div className="wrap">
                        <span className="ribbon">{t('mainReport.newFeature')}</span>
                    </div>
                </Button>)
            }
            else {
                wizardButtons.push(<><Button
                    onClick={() => showCautionOldEditor ? setDialogType({ type: "cautionNewEditor" }) : handleSubmit(true, false, false)}
                    variant='contained'
                    size='medium'
                    className={clsx(
                        classes.actionButton,
                        classes.actionButtonLightGreen,
                        classes.backButton
                    )}
                    style={{ marginInlineStart: '8px' }}
                    color="primary"
                >{t('common.saveAndContinue')}</Button>
                    {(id === null || id === undefined) && <Button
                        disabled={newEditorDisabled}
                        onClick={() => showCautionNewEditor ? setDialogType({ type: "cautionOldEditor" }) : handleSubmit(true, false, true)}
                        variant='contained'
                        size='medium'
                        className={clsx(
                            classes.actionButton,
                            classes.actionButtonLightGreen,
                            classes.backButton,
                            classes.ribbonContainer
                        )}
                        style={{ marginInlineStart: '8px' }}
                        color="primary"
                    >
                        {t('master.continueToNewEditor')}
                        <div className="wrap">
                            <span className="ribbon">{t('mainReport.newFeature')}</span>
                        </div>
                    </Button>}
                </>)
            }
        }
        return wizardButtons.map((b) => b);
    }

    const getCautionNewEditorDialog = (data = {}) => {
        return {
            title: '',
            showDivider: false,
            icon: false,
            exit: <Box
                onClick={() => setDialogType(null)}
                className={clsx(
                    classes.dialogExitButton,
                    classes.btnNoBgExitDialog,
                    classes.f25,
                    {
                        [classes.dialogExitButtonRTL]: !isRTL,
                        [classes.dialogExitButtonLTR]: isRTL
                    }
                )}>
                x
            </Box>,
            contentStyle: classes.noBorder,
            content: (
                <Grid container>
                    <Grid item xs={12} className={clsx(classes.mb4)} style={{ textAlign: 'center' }}>
                        <Typography className={clsx(classes.pbt5, classes.f25)}>
                            {t('campaigns.newsLetterMgmt.payAttention')}
                            {/* Pay attention! */}
                        </Typography>
                        <Typography className={classes.f20}>
                            {t('campaigns.newsLetterMgmt.newsLetterWizard.continueEditingInNewEditor')}
                        </Typography>
                        <Typography className={classes.f20}>
                            {t('campaigns.newsLetterMgmt.newsLetterWizard.recreateInOldEditor')}
                        </Typography>

                        <Box className={classes.mt15}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={hideCautionNewMessage}
                                        onChange={() => handleHideNewCautionMessage(!hideCautionNewMessage)}
                                        name="checkedB"
                                        color="primary"
                                    />
                                }
                                label={t('notifications.implementDialog.dontShowThisMessage')}
                            />
                        </Box>
                    </Grid>
                </Grid>
            ),
            onConfirm: async () => {
                handleSubmit(true, false, false)
                setDialogType(null)
            }
        }
    }

    const getCautionOldEditorDialog = (data = {}) => {
        return {
            title: '',
            showDivider: false,
            icon: false,
            exit: <Box
                onClick={() => setDialogType(null)}
                className={clsx(
                    classes.dialogExitButton,
                    classes.btnNoBgExitDialog,
                    classes.f25,
                    {
                        [classes.dialogExitButtonRTL]: !isRTL,
                        [classes.dialogExitButtonLTR]: isRTL
                    }
                )}>
                x
            </Box>,
            contentStyle: classes.noBorder,
            content: (
                <Grid container>
                    <Grid item xs={12} className={clsx(classes.mb4)} style={{ textAlign: 'center' }}>
                        <Typography className={clsx(classes.pbt5, classes.f25)}>
                            {t('campaigns.newsLetterMgmt.payAttention')}
                            {/* Pay attention! */}
                        </Typography>
                        <Typography className={classes.f20}>
                            {t('campaigns.newsLetterMgmt.newsLetterWizard.continueEditingInOldEditor')}
                        </Typography>
                        <Typography className={classes.f20}>
                            {t('campaigns.newsLetterMgmt.newsLetterWizard.recreateInNewEditor')}
                        </Typography>

                        <Box className={classes.mt15}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={hideCautionOldMessage}
                                        onChange={() => handleHideOldCautionMessage(!hideCautionOldMessage)}
                                        name="checkedB"
                                        color="primary"
                                    />
                                }
                                label={t('notifications.implementDialog.dontShowThisMessage')}
                            />
                        </Box>
                    </Grid>
                </Grid>
            ),
            onConfirm: async () => {
                handleSubmit(true, false, true)
                setDialogType(null)
            }
        }
    }


    const renderDialog = () => {
        const { data, type } = dialogType || {}

        const dialogContent = {
            cautionNewEditor: getCautionNewEditorDialog(data),
            cautionOldEditor: getCautionOldEditorDialog(data),
        }

        const currentDialog = dialogContent[type] || {}
        return (
            dialogType && <BaseDialog
                classes={classes}
                open={dialogType}
                onCancel={() => setDialogType(null)}
                onClose={() => setDialogType(null)}
                renderButtons={currentDialog.renderButtons || null}
                {...currentDialog}>
                {currentDialog.content}
            </BaseDialog>
        )
    }

    return (
        <DefaultScreen
            currentPage="newsletter"
            subPage={"newsletterInfo"}
            classes={classes}
            containerClass={clsx(classes.management, classes.mb50)}
        >
            {renderDialog()}
            {showGalleryModal()}
            {renderToast()}
            <Typography className={classes.managementTitle}>
                {t("campaigns.createNewsLetterHeader")}
            </Typography>
            <Divider />
            {CampaignBox1()}
            <Divider />
            <Grid container spacing={3}>
                {/* Additional Text */}
                <Grid item xs={12} sm={5}>
                    <AdditionalText
                        classes={classes}
                        localClasses={localClasses}
                        selectedCheck={{ ...selectedCheck }}
                        campaingnValues={{ ...campaingnValues }}
                        handleChangeCheckbox={handleChangeCheckbox}
                        handleSelectionRadio={handleSelectionRadio}
                    />
                </Grid>
                {/* Advanced settings */}
                <Grid item xs={12} sm={7}>
                    <AdvancedSettings
                        classes={classes}
                        localClasses={localClasses}
                        campaingnValues={{ ...campaingnValues }}
                        setCampaingnValues={setCampaingnValues}
                        setShowGallery={setShowGallery}
                        removeAttachmentFile={removeAttachmentFile}
                    />
                </Grid>
            </Grid>

            <Box className={classes.flex} style={{ justifyContent: 'end', marginTop: 25 }}>
                <WizardActions
                    classes={classes}
                    onBack={{
                        callback: () => { setConfirmExit(true) }
                    }}
                    onDelete={id > 0 && !isFromAutomation && getDeleteStatus}
                    additionalButtons={renderButtons()}
                // additionalButtonsOnStart={renderTemplateButtons()}
                />
            </Box>
            <BaseDialog
                classes={classes}
                open={confirmExit}
                title={t("campaigns.GridButtonColumnResource2.confirmExit")}
                showDivider={true}
                onClose={() => handleExit(false)}
                onCancel={() => handleExit(null)}
                onConfirm={() => handleExit(true)}
                disableBackdropClick={true}
                cancelText="common.No"
                confirmText="common.Yes"
            >
                <Box>
                    <Typography variant="subtitle1">
                        {t("campaigns.GridButtonColumnResource2.confirmExitText")}
                    </Typography>
                </Box>
            </BaseDialog>
            <BaseDialog
                classes={classes}
                open={confirmDelete}
                title={t("campaigns.GridButtonColumnResource2.ConfirmTitle")}
                showDivider={true}
                onClose={() => setConfirmDelete(false)}
                onCancel={() => setConfirmDelete(false)}
                onConfirm={() => handleDelete()}
                cancelText="common.Cancel"
                confirmText="common.Ok"
            >
                <Box>
                    <Typography variant="subtitle1">
                        {t("campaigns.GridButtonColumnResource2.ConfirmText")}
                    </Typography>
                </Box>
            </BaseDialog>
            {verPopupOpen && <VerificationDialog classes={classes} isOpen={verPopupOpen} onClose={() => setVerPopupOpen(false)} />}
            {
                dialogType === DialogType.Templates && <Templates
                    isCreateCampaign={true}
                    classes={classes}
                    onClose={async (template) => {
                        setDialogType(null);
                        if (template !== undefined) {
                            const response = await dispatch(getTemplateById(template.ID));
                            if (response.payload.StatusCode === 201) {
                                setTemplate(response?.payload?.Data);
                            }
                        }
                    }}
                    isOpen={dialogType === DialogType.Templates}
                />
            }
            {/* Here we are using DomainVerification as a component and not via React Store */}
            {showDomainVerification && <DomainVerification
                classes={classes}
                domain={domainAddressError}
                forceShow={showDomainVerification}
                key={"fromManagement"}
                onClose={() => {
                    setShowDomainVerification(false)
                }}
            />}
            <Loader isOpen={showLoader} />
        </DefaultScreen >
    )
}

export default NewsLetterInfo;
