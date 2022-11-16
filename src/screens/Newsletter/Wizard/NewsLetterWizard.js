import { useEffect, useState } from 'react'
import DefaultScreen from "../../DefaultScreen";
import clsx from "clsx";
import { IoMdImages } from 'react-icons/io';
import { Grid, Box, Divider, Typography, TextField, makeStyles, FormControl, Select, OutlinedInput, FormHelperText } from '@material-ui/core'
import { Loader } from "../../../components/Loader/Loader";
import SimpleGrid from "../../../components/Grids/SimpleGrid";
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from "react-i18next";
import { deleteCampaign } from '../../../redux/reducers/newsletterSlice';
import Toast from '../../../components/Toast/Toast.component';
import { Dialog } from "../../../components/managment/Dialog";
import WizardActions from '../../../components/Wizard/WizardActions';
import { saveCampaignInfo, getCampaignInfo, getCreditsByFileTotalBytes } from '../../../redux/reducers/campaignEditorSlice'
import { getAccountExtraData } from "../../../redux/reducers/smsSlice";
import Gallery from '../../../components/Gallery/Gallery.component';
import { ClientFields, PulseemFolderType } from "../../../model/PulseemFields/Fields";
import CustomEmojiPicker from '../../../components/icons/CustomEmojiPicker';
import { RandomID } from '../../../helpers/Functions/functions';
import { getAuthorizedEmails } from '../../../redux/reducers/commonSlice';
import VerificationDialog from '../../../components/DialogTemplates/VerificationDialog';
import { useNavigate, useParams } from 'react-router-dom';
import { AdditionalText } from './components/AdditionalText';
import { AdvancedSettings } from './components/AdvancedSettings';
import { getCookie } from '../../../helpers/Functions/cookies';
import { PulseemFeatures } from '../../../model/PulseemFields/Fields';

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
            // marginLeft: 0,
            // marginRight: 0
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

const NewsLetterWizard = ({ classes }) => {
    const { id } = useParams();
    const queryParams = new URLSearchParams(window.location.search)
    const isNew = queryParams.get("new")
    const isFromAutomation = queryParams.get("FromAutomation")
    const NodeToEdit = queryParams.get("NodeToEdit")

    const { accountSettings } = useSelector((state) => state.core);
    const { t } = useTranslation();
    const localClasses = useStyles()
    const dispatch = useDispatch()
    const [toastMessage, setToastMessage] = useState(null);
    const [showLoader, setLoader] = useState(true);
    const [extraAccountDATA, setextraAccountDATA] = useState([]);
    const { verifiedEmails } = useSelector(state => state.common);
    const { ToastMessages } = useSelector(state => state.newsletter);
    const [showGallery, setShowGallery] = useState(false);
    const [isGalleryConfirmed, setIsFileSelected] = useState(false);
    const [isSilenceUpdated, setIsSilenceUpdated] = useState(false);
    const [campaignLoaded, setCampaignLoaded] = useState(false);
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
        PreviewText: t('campaigns.newsLetterEditor.helpTexts.pre_helper_text')
    }

    const ErrorTexts = {
        Name: t('campaigns.newsLetterEditor.errors.fromName'),
        Subject: t('campaigns.newsLetterEditor.errors.campaignSubject'),
        FromName: t('campaigns.newsLetterEditor.errors.fromName'),
        FromEmail: t('campaigns.newsLetterEditor.errors.fromEmail'),
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
        FilesProperties: []
    })

    const [selectedCheck, setSelectedCheck] = useState({ WebViewLocation: false, PrintLocation: false, UnsubscribeLocation: false, UpdateClient: false })
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [confirmExit, setConfirmExit] = useState(false)
    const [verPopupOpen, setVerPopupOpen] = useState(false)

    const defaultValues = { WebViewLocation: 1, PrintLocation: 2, UnsubscribeLocation: 2, UpdateClient: 2 }
    const accountFeatures = getCookie("accountFeatures")

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
    }

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
                setCampaingnValues({ ...campaingnValues, FromName: accountSettings?.DefaultFromName });
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
    const handleSubmitNewsletterResponse = (res) => {
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
                setToastMessage(ToastMessages.FILE_EXT_NOT_ALWD)
                break;
            }
            case 406: {
                setToastMessage(ToastMessages.NULL_FILE)
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

    const handleSubmit = async (isContiue, isExit = false) => {
        // TODO: [PR-570] Fix this validation
        if (!handleValidations()) {
            setLoader(true);
            dispatch(saveCampaignInfo(campaingnValues)).then((response) => {
                setLoader(false);

                const savedCampaign = response.payload;
                handleSubmitNewsletterResponse(savedCampaign)
                const saveInfo = JSON.parse(savedCampaign.Message);

                if (isContiue) {
                    let redirectUrl = accountFeatures.indexOf(PulseemFeatures.BEE_EDITOR) > -1 ? `/react/Campaigns/editor/${saveInfo.CampaignID}` : `/Pulseem/Editor/CampaignEdit/${saveInfo.CampaignID}`;
                    if (isFromAutomation) {
                        if (isNew) {
                            redirectUrl += `?new=${isNew}&FromAutomation=${isFromAutomation}&NodeToEdit=${NodeToEdit}`;
                        }
                        else {
                            redirectUrl += `?FromAutomation=${isFromAutomation}&NodeToEdit=${NodeToEdit}`;
                        }
                    }
                    navigate(redirectUrl);
                }
                else if (isExit === true) {
                    navigate(`/Campaigns`);
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
        navigate('/Campaigns');
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
                                                // value={campaingnValues?.personalDatatoSubject}
                                                value={campaingnValues?.FromEmail}
                                                onChange={(event, val) => {
                                                    setCampaingnValues({ ...campaingnValues, FromEmail: event.target.value });
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
                                            </Select>
                                            <FormHelperText>{errors.FromEmail ? errors.FromEmail : helperTexts.FromEmail + ' '}{!errors.FromEmail && <strong className={classes.link} onClick={() => setVerPopupOpen(true)}>{t('campaigns.newsLetterEditor.helpTexts.clickToVerify')}</strong>}</FormHelperText>
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
                                            <Box
                                                className={clsx(localClasses.iconbox)}
                                            >
                                                {/* <img src={SmileIcon} alt="smile" /> */}
                                                <CustomEmojiPicker onSelectEmoji={(emoji) => setCampaingnValues({ ...campaingnValues, Subject: campaingnValues.Subject + emoji })} />
                                            </Box>
                                        </Box>,
                                    gridSize: { xs: 12, sm: 12 }
                                }
                                ]}
                            />,
                            gridSize: { xs: 12, sm: 8 }
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
                                                // value={campaingnValues?.personalDatatoSubject}
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
                            gridSize: { xs: 12, sm: 4 }
                        },
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
                <Dialog
                    maxHeight="calc(70vh)"
                    disableBackdropClick={true}
                    style={{ minHeight: 400 }}
                    showDivider={false}
                    classes={classes}
                    open={showGallery}
                    onClose={() => { setShowGallery(false) }}
                    onConfirm={handleGalleryConfirm}
                    {...dialog}>
                    {dialog.content}
                </Dialog>
            );
        }
    }
    const renderGalleryDialog = () => {
        return {
            showDivider: false,
            icon: (
                <IoMdImages style={{ fontSize: 30, color: '#fff' }} />
            ),
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
            navigate(`/Campaigns`);
        }
    }

    return (
        <DefaultScreen
            currentPage="Campaingn Settings"
            classes={classes}
            containerClass={clsx(classes.management, classes.mb50)}
        >
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
                    onSave={handleSubmit}
                    onBack={() => { setConfirmExit(true) }}
                    onDelete={id > 0 && !isFromAutomation && getDeleteStatus}
                />
            </Box>
            <Dialog
                classes={classes}
                open={confirmExit}
                title={t("campaigns.GridButtonColumnResource2.confirmExit")}
                icon={<Box className={classes.dialogAlertIcon}>
                    !
                </Box>}
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
            </Dialog>
            <Dialog
                classes={classes}
                open={confirmDelete}
                title={t("campaigns.GridButtonColumnResource2.ConfirmTitle")}
                icon={<Box className={classes.dialogAlertIcon}>
                    !
                </Box>}
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
            </Dialog>
            {verPopupOpen && <VerificationDialog classes={classes} isOpen={verPopupOpen} onClose={() => setVerPopupOpen(false)} />}
            <Loader isOpen={showLoader} />
        </DefaultScreen >
    )
}

export default NewsLetterWizard