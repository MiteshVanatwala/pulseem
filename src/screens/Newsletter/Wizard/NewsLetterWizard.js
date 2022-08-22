import React, { useEffect, useState } from 'react'
import DefaultScreen from "../../DefaultScreen";
import clsx from "clsx";
import { BiUpload } from 'react-icons/bi';
import { FaGoogle } from 'react-icons/fa';
import { IoMdImages } from 'react-icons/io';
import { Box, Divider, Typography, TextField, Checkbox, Radio, makeStyles, FormControl, Select, OutlinedInput, MenuItem, FormHelperText } from '@material-ui/core'
import { Loader } from "../../../components/Loader/Loader";
import SimpleGrid from "../../../components/Grids/SimpleGrid";
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from "react-i18next";
import { deleteCampaign } from '../../../redux/reducers/newsletterSlice';
import Toast from '../../../components/Toast/Toast.component';
import { Dialog } from "../../../components/managment/Dialog";
import CustomTooltip from '../../../components/Tooltip/CustomTooltip';
import WizardActions from '../../../components/Wizard/WizardActions';
import { saveCampaignInfo, getCampaignInfo, getVerifiedEmail } from '../../../redux/reducers/campaignEditorSlice'
import { getAccountExtraData } from "../../../redux/reducers/smsSlice";
import Gallery from '../../../components/Gallery/Gallery.component';
import { ClientFields, LangugeCode, MobileSupport, PulseemFolderType, PulseemFeatures } from "../../../model/PulseemFields/Fields";
import CustomEmojiPicker from '../../../components/icons/CustomEmojiPicker';
import PulseemTags from '../../../components/Tags/PulseemTags'
import { makeId } from '../../../helpers/functions';

const useStyles = makeStyles({
    iconbox: {
        marginBottom: 'auto',
        width: 40,
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
            width: '100%'
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

const NewsLetterWizard = ({ classes, ...props }) => {
    const { accountFeatures } = useSelector((state) => state.core);
    const { t } = useTranslation();
    const localClasses = useStyles()
    const dispatch = useDispatch()
    const [toastMessage, setToastMessage] = useState(null);
    const [showLoader, setLoader] = useState(true);
    const [extraAccountDATA, setextraAccountDATA] = useState([]);
    const { campaignInfo, verifiedEmails } = useSelector(state => state.campaignEditor);
    const { ToastMessages } = useSelector(state => state.newsletter);
    const [showGallery, setShowGallery] = useState(false);
    const [isGalleryConfirmed, setIsFileSelected] = useState(false);
    const [isSilenceUpdated, setIsSilenceUpdated] = useState(false);
    const [showCostLoader, setShowCostLoader] = useState(false);

    const ErrorTexts = {
        Name: t('campaigns.newsLetterEditor.helpTexts.Name'),
        Subject: t('campaigns.newsLetterEditor.helpTexts.Subject'),
        FromName: t('common.requiredField'),
        FromEmail: t('common.requiredField'),
    }

    const [errors, setErrors] = useState({
        Name: "",
        Subject: "",
        FromName: "",
        FromEmail: ""
    })

    const [campaingnValues, setCampaingnValues] = useState({
        LanguageCode: 0,
        CampaignID: "",
        Name: "",
        Subject: "",
        personalDatatoSubject: "",
        FromName: "",
        FromEmail: "",
        WebViewLocation: 0,
        PrintLocation: 0,
        UnsubscribeLocation: 0,
        UpdateClient: 0,
        IsResponsive: 1
    })

    const [selectedRadio, setSelectedRadio] = useState({ a: null, b: null, c: null, d: null })
    const [selectedCheck, setSelectedCheck] = useState({ WebViewLocation: false, PrintLocation: false, UnsubscribeLocation: false, UpdateClient: false })
    const [confirmDelete, setConfirmDelete] = useState(false)




    const handleGetNewsletterResponse = (res) => {
        switch (res?.StatusCode || 201) {
            case 200: {
                setToastMessage(res?.Message)
                break;
            }
            case 201: {
                setCampaingnValues({ ...JSON.parse(res?.Message) })
                break;
            }
            case 202: {
                setToastMessage(res?.Message)
                break;
            }
            case 404: {
                setToastMessage(res?.Message)
                break;
            }
            case 400: {
                setToastMessage(res?.Message)
                break;
            }
            default: {
                setToastMessage(res?.Message)
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
            await dispatch(getVerifiedEmail());
            if (props.match.params.id != null && parseInt(props.match.params.id) > 0) {
                const campaignId = parseInt(props.match.params.id);
                const response = await dispatch(getCampaignInfo(campaignId))
                handleGetNewsletterResponse(JSON.parse(response.payload))
            }
            setLoader(false);
            setIsSilenceUpdated(false);
        }
        const initClientFields = async () => {
            let resp = await dispatch(getAccountExtraData());
            let _clientFields = [...ClientFields];
            let arr = Object.values(resp.payload).reduce((prev, next) => {
                if (!!next) {
                    return [...prev, { value: next, label: next, selected: false }]
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

    useEffect(() => {
        const silenceSaveAndLoad = async () => {
            await dispatch(saveCampaignInfo(campaingnValues))
            const response = await dispatch(getCampaignInfo(campaingnValues.CampaignID))
            handleGetNewsletterResponse(JSON.parse(response.payload))
            setShowCostLoader(false);
        }
        if (isSilenceUpdated) {
            setShowCostLoader(true);
            silenceSaveAndLoad();
            setIsSilenceUpdated(false);
        }
    }, [campaingnValues['FilesProperties']])

    const handleSelectionRadio = (e) => {
        console.log(e.target.name, " : ", e.target.value)
        // setSelectedRadio({ ...selectedRadio, [e.target.name]: e.target.value })
        setCampaingnValues({ ...campaingnValues, [e.target.name]: Number(e.target.value) })
    }
    const handleChangeCheckbox = (e) => {
        if (selectedCheck[e.target.name]) {
            // setSelectedRadio({ ...selectedRadio, [e.target.name]: null })
            setCampaingnValues({ ...campaingnValues, [e.target.name]: 0 })
        }
        setSelectedCheck({ ...selectedCheck, [e.target.name]: !selectedCheck[e.target.name] })
    }

    const handleChange = (e) => {
        // console.log("VALUES:", e.target.name, e.target.value)

        e.preventDefault();
        setCampaingnValues({ ...campaingnValues, [e.target.name]: e.target.value })
    }

    const handleEmailValue = (e) => {
        if (!!e.target.value && (e.target.style.direction === null || !e.target.style.direction)) {
            e.target.style.direction = 'ltr'
        } else if (!e.target.value && e.target.style.direction === 'ltr') {
            e.target.style.direction = null
        }

        handleChange(e)
    }

    const handleSubmit = async (isContiue) => {
        // TODO: [PR-570] Fix this validation
        //if (handleValidations()) {
        setLoader(true);
        const response = await dispatch(saveCampaignInfo(campaingnValues));

        handleSubmitNewsletterResponse(response)

        setLoader(false);

        if (isContiue) {
            window.location = `/react/Campaigns/editor/${campaingnValues.CampaignID}`;
        }
        else if (campaingnValues.CampaignID <= 0 || campaingnValues.CampaignID === '' || !campaingnValues.CampaignID) {
            const savedCampaign = JSON.parse(response.payload);
            const saveInfo = JSON.parse(savedCampaign.Message);
            window.location = `/react/Campaigns/Create/${saveInfo.CampaignID}`
        }
        //}
    }
    const handleDelete = async () => {
        await dispatch(deleteCampaign(campaingnValues.CampaignID));
        setConfirmDelete(false)
        window.location = '/react/Campaigns'
    }


    const handleValidations = () => {
        const tempError = { ...errors }
        const data = { ...campaingnValues }
        let isError = false;

        Object.keys(tempError).forEach((key) => {
            if (!data[key]) {
                tempError[key] = "Null values not allowed";
                isError = !data[key]
            }
        })
        setErrors({ ...tempError })
        return isError
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
                                        helperText={ErrorTexts.Name}
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
                                        value={campaingnValues.FromName}
                                        className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252, localClasses.textbox)}
                                        autoComplete="off"
                                        onChange={handleChange}
                                        error={errors.FromName}
                                        helperText={ErrorTexts.FromName}
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
                                        <FormControl className={localClasses.select}>
                                            <Select
                                                displayEmpty
                                                // value={campaingnValues?.personalDatatoSubject}
                                                value={campaingnValues?.FromEmail}
                                                onChange={(event, val) => {
                                                    setCampaingnValues({ ...campaingnValues, FromEmail: event.target.value });
                                                }}

                                                name="FromEmail"
                                                input={<OutlinedInput />}
                                                renderValue={(selected) => {
                                                    if (!selected) {
                                                        return <em>{t("common.select")}</em>;
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
                                                <MenuItem disabled value="" key="-1">
                                                    <em>Select</em>
                                                </MenuItem>
                                                {verifiedEmails.map((item, index) => (
                                                    <MenuItem
                                                        key={`exd_${index}`}
                                                        value={item}
                                                    >
                                                        {t(item)}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {/* error={errors.FromEmail}
                                                    helperText={ErrorTexts.FromEmail} */}
                                            <FormHelperText>{ErrorTexts.FromEmail}</FormHelperText>
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
                                                helperText={ErrorTexts.Subject}
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
                                                displayEmpty
                                                // value={campaingnValues?.personalDatatoSubject}
                                                value={''}
                                                onChange={(event) => {
                                                    setCampaingnValues({ ...campaingnValues, personalDatatoSubject: event.target.value, Subject: `${campaingnValues.Subject} ##${event.target.value}##` })
                                                }}
                                                input={<OutlinedInput />}
                                                renderValue={(selected) => {
                                                    if (!selected) {
                                                        return <em>{t("common.select")}</em>;
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
                                                <MenuItem disabled value="" key="-1">
                                                    <em>Select</em>
                                                </MenuItem>
                                                {extraAccountDATA.map((item, index) => (
                                                    <MenuItem
                                                        key={`exd_${index}`}
                                                        value={item.value}
                                                    >
                                                        {t(item.label)}
                                                    </MenuItem>
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

    const CampaignBox2 = () => (
        <Box pt={3}>
            <Typography className={localClasses.suHeading}>{t("common.AdvancedSettings")}</Typography>
            <SimpleGrid
                spacing={3}
                centerlize={true}
                gridArr={
                    [
                        {
                            content: <SimpleGrid
                                gridArr={[{
                                    content: <Typography title={t("campaigns.newsLetterEditor.mobileSupport")} className={classes.alignDir}>{t("campaigns.newsLetterEditor.mobileSupport")}</Typography>,
                                    gridSize: { xs: 12, sm: 12 }
                                },
                                {
                                    content: <FormControl className={localClasses.select}>
                                        <Select
                                            displayEmpty
                                            value={campaingnValues?.IsResponsive ? 1 : 0}
                                            onChange={(event) => {
                                                setCampaingnValues({
                                                    ...campaingnValues,
                                                    IsResponsive: event.target.value === 1 ? true : false
                                                })
                                            }}
                                            input={<OutlinedInput />}
                                            renderValue={(selected) => {
                                                const lc = MobileSupport.find(e => { return e.value === selected });
                                                return t(lc.label);
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
                                            {MobileSupport.map((item) => (
                                                <MenuItem
                                                    key={item.value}
                                                    value={item.value}
                                                >
                                                    {t(item.label)}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>,
                                    gridSize: { xs: 12, sm: 12 },
                                }
                                ]}
                                spacing={1}
                                gridStyles={localClasses.contentCenter}
                            />,
                            gridSize: { xs: 12, sm: 6 }
                        },
                        {
                            content: <SimpleGrid
                                gridArr={[{
                                    content: <Typography title={t("campaigns.newsLetterEditor.pre_text")} className={classes.alignDir}>{t("campaigns.newsLetterEditor.pre_text")}</Typography>,
                                    gridSize: { xs: 12, sm: 12 }
                                },
                                {
                                    content: <TextField
                                        id="outlined-basic"
                                        label=""
                                        variant="outlined"
                                        name="Name"
                                        // value={campaingnValues.Name}
                                        className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252, localClasses.textbox)}
                                        autoComplete="off"
                                        // onChange={handleChange}
                                        // error={errors.Name}
                                        helperText={t("campaigns.newsLetterEditor.helpTexts.pre_helper_text")}
                                    />,
                                    gridSize: { xs: 12, sm: 12 },
                                }
                                ]}
                                spacing={1}
                                gridStyles={localClasses.contentCenter}
                            />,
                            gridSize: { xs: 12, sm: 6 }
                        },

                        {
                            content: <SimpleGrid
                                gridArr={[{
                                    content: <Typography title={t("campaigns.newsLetterEditor.language")} className={classes.alignDir}>{t("campaigns.newsLetterEditor.language")}</Typography>,
                                    gridSize: { xs: 12, sm: 12 }
                                },
                                {
                                    content:
                                        <FormControl className={localClasses.select}>
                                            <Select
                                                displayEmpty
                                                // value={campaingnValues?.personalDatatoSubject}
                                                value={campaingnValues.LanguageCode}
                                                onChange={(event) => {
                                                    setCampaingnValues({ ...campaingnValues, LanguageCode: event.target.value })
                                                }}
                                                input={<OutlinedInput />}
                                                renderValue={(selected) => {
                                                    const lc = LangugeCode.find(e => { return e.value === selected });
                                                    return t(lc.label);
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
                                                {LangugeCode.map((item) => (
                                                    <MenuItem
                                                        key={item.value}
                                                        value={item.value}
                                                    >
                                                        {t(item.label)}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>,
                                    gridSize: { xs: 12, sm: 12 },

                                }, {

                                    content: accountFeatures?.indexOf(PulseemFeatures.GOOGLE_LINKS) > -1 && <Box className={clsx(classes.flex, localClasses.googleCheck)}>
                                        <Checkbox
                                            color="primary"
                                            inputProps={{ 'aria-label': 'secondary checkbox' }}
                                            name='googleAnalytics'
                                            // className={ }
                                            checked={campaingnValues.GoogleAnalytics === true}
                                            onClick={() => {
                                                setCampaingnValues({ ...campaingnValues, GoogleAnalytics: !campaingnValues.GoogleAnalytics })
                                            }}
                                        />
                                        <FaGoogle />
                                        <Typography className={classes.f14} title={t("campaigns.newsLetterEditor.gAnalytics")} align="left">{t("campaigns.newsLetterEditor.gAnalytics")}</Typography>
                                    </Box>
                                    ,
                                    gridSize: { xs: 12, sm: 12 }
                                }
                                ]}
                                spacing={1}
                                gridStyles={localClasses.contentCenter}
                            />,
                            gridSize: { xs: 12, sm: 6 }
                        },
                        {
                            content: accountFeatures?.indexOf(PulseemFeatures.FILE_ATTACHMENT) > -1 &&
                                campaingnValues.CampaignID && <SimpleGrid
                                    gridArr={[{
                                        content:
                                            <CustomTooltip
                                                isSimpleTooltip={false}
                                                classes={classes}
                                                interactive={true}
                                                arrow={true}
                                                placement={'top'}
                                                title={<Typography noWrap={false}>{t("Upload File")} - doc, docx, pdf, rtf, xls, xlsv, csv, txt, jpg, jpeg, ppt</Typography>}
                                                text={t("Upload File - doc, docx, pdf, rtf, xls, xlsv, csv, txt, jpg, jpeg, ppt")}
                                            >
                                                <Typography noWrap={false}>{t("common.UploadFile")} - doc, docx, pdf, rtf, xls, xlsv, csv, txt, jpg, jpeg, ppt</Typography>
                                            </CustomTooltip>,
                                        gridSize: { xs: 12, sm: 12 }
                                    },
                                    {
                                        content: campaingnValues.CampaignID && <>
                                            <PulseemTags
                                                title={""}
                                                style={null}
                                                classes={classes}
                                                tagStyle={{ maxWidth: 150 }}
                                                items={campaingnValues.FilesProperties?.map((f) => {
                                                    return {
                                                        Name: f.Name ?? f.FileName,
                                                        ID: f.ID
                                                    };
                                                })}
                                                onShowModal={() => setShowGallery(true)}
                                                handleRemove={removeAttachmentFile}
                                                icon={<BiUpload />}
                                            />
                                            <label className={localClasses.helperText}>{t("campaigns.newsLetterEditor.helpTexts.upload")}</label>
                                        </>
                                        ,
                                        gridSize: { xs: 12, sm: 12 },
                                    },
                                    {
                                        content: campaingnValues.FilesProperties?.length > 0 && <>
                                            <Box className={classes.dFlex} style={{ justifyContent: 'space-between' }}>
                                                <Box className={classes.lightBlueTicket}>
                                                    <label className={localClasses.helperText}>{t('campaigns.totalSize')} {campaingnValues.TotalBytes.toLocaleString()} {t('campaigns.kb')}</label>
                                                    <Loader isOpen={showCostLoader} key="campaigns.kb" size={25} showBackdrop={false} color={"#c9302c"} />
                                                </Box>
                                                <Box className={classes.lightBlueTicket}>
                                                    <label className={localClasses.helperText}>{t('campaigns.summaryTotal')} {campaingnValues.TotalCost.toLocaleString()} {t('report.Credits')}</label>
                                                    <Loader isOpen={showCostLoader} key="report.Credits" size={25} showBackdrop={false} color={"#c9302c"} />
                                                </Box>
                                            </Box>
                                        </>
                                        ,
                                        gridSize: { xs: 12, sm: 12 },
                                    }
                                    ]}
                                    spacing={1}
                                    gridStyles={localClasses.contentCenter}
                                />,
                            gridSize: { xs: 12, sm: 6 }
                        },
                    ]
                }

            />
        </Box>
    )

    const CampaignBox3 = () => (
        <Box pt={3}>
            <Typography className={localClasses.suHeading}>{t("campaigns.newsLetterEditor.textAdditions")}</Typography>

            <SimpleGrid
                spacing={2}
                centerlize={true}
                gridArr={
                    [
                        {
                            content: <SimpleGrid
                                spacing={2}
                                centerlize={true}
                                gridArr={
                                    [
                                        {
                                            content: <SimpleGrid
                                                gridArr={[
                                                    {
                                                        content: <Checkbox

                                                            color="primary"
                                                            inputProps={{ 'aria-label': 'secondary checkbox' }}
                                                            name='WebViewLocation'
                                                            checked={!!selectedCheck.WebViewLocation}
                                                            onClick={handleChangeCheckbox}
                                                        />,
                                                        gridSize: { xs: 6, sm: 2 }
                                                    },
                                                    {
                                                        content: <Typography className={classes.f14} title={t("campaigns.newsLetterEditor.dontSee_clickHere_mail")} align="left">{t("campaigns.newsLetterEditor.dontSee_clickHere_mail")}</Typography>,
                                                        gridSize: { xs: 6, sm: 10 }
                                                    },

                                                ]}
                                                spacing={1}
                                                gridStyles={localClasses.contentCenter}
                                            />,
                                            gridSize: { xs: 12, sm: 12 },
                                        },
                                        {
                                            content: <SimpleGrid
                                                gridArr={[
                                                    {
                                                        content: <Checkbox

                                                            color="primary"
                                                            inputProps={{ 'aria-label': 'secondary checkbox' }}
                                                            name='PrintLocation'
                                                            checked={!!selectedCheck.PrintLocation}
                                                            onClick={handleChangeCheckbox}
                                                        />,
                                                        gridSize: { xs: 6, sm: 2 }
                                                    },
                                                    {
                                                        content: <Typography className={classes.f14} title={t("campaigns.newsLetterEditor.printMail")} align="left">{t("campaigns.newsLetterEditor.printMail")}</Typography>,
                                                        gridSize: { xs: 6, sm: 10 }
                                                    },

                                                ]}
                                                spacing={1}
                                                gridStyles={localClasses.contentCenter}
                                            />,
                                            gridSize: { xs: 12, sm: 12 }
                                        },

                                        {
                                            content: <SimpleGrid
                                                gridArr={[
                                                    {
                                                        content: <Checkbox

                                                            color="primary"
                                                            inputProps={{ 'aria-label': 'secondary checkbox' }}
                                                            name='UnsubscribeLocation'
                                                            checked={!!selectedCheck.UnsubscribeLocation}
                                                            onClick={handleChangeCheckbox}
                                                        />,
                                                        gridSize: { xs: 6, sm: 2 }
                                                    },
                                                    {
                                                        content: <Typography className={classes.f14} title={t("campaigns.newsLetterEditor.removeCustomerFromMail")} align="left">{t("campaigns.newsLetterEditor.removeCustomerFromMail")}</Typography>,
                                                        gridSize: { xs: 6, sm: 10 }
                                                    },

                                                ]}
                                                spacing={1}
                                                gridStyles={localClasses.contentCenter}
                                            />,
                                            gridSize: { xs: 12, sm: 12 }
                                        },
                                        {
                                            content: <SimpleGrid
                                                gridArr={[
                                                    {
                                                        content: <Checkbox

                                                            color="primary"
                                                            inputProps={{ 'aria-label': 'secondary checkbox' }}
                                                            name='UpdateClient'
                                                            checked={!!selectedCheck.UpdateClient}
                                                            onClick={handleChangeCheckbox}
                                                        />,
                                                        gridSize: { xs: 6, sm: 2 }
                                                    },
                                                    {
                                                        content: <Typography className={classes.f14} title={t("campaigns.newsLetterEditor.updateCustomerInfo")} align="left">{t("campaigns.newsLetterEditor.updateCustomerInfo")}</Typography>,
                                                        gridSize: { xs: 6, sm: 10 }
                                                    },

                                                ]}
                                                spacing={1}
                                                gridStyles={localClasses.contentCenter}
                                            />,
                                            gridSize: { xs: 12, sm: 12 }
                                        },
                                    ]
                                }
                            />,
                            gridSize: { xs: 12, sm: 6 }
                        },
                        {
                            content: <SimpleGrid
                                spacing={2}
                                centerlize={true}
                                gridArr={
                                    [
                                        {
                                            content: <SimpleGrid
                                                gridArr={[
                                                    {
                                                        content: <Radio
                                                            // checked={selectedRadio.a === 'a1' }
                                                            checked={campaingnValues.WebViewLocation === 1}
                                                            onChange={handleSelectionRadio}
                                                            disabled={!!!selectedCheck.WebViewLocation}
                                                            // value="a1"
                                                            value={1}
                                                            // name="a"
                                                            name="WebViewLocation"
                                                            inputProps={{ 'aria-label': 'A' }}
                                                        />,
                                                        gridSize: { xs: 12, sm: 3 }
                                                    },
                                                    {
                                                        content: <Typography className={classes.f14} title={t("campaigns.newsLetterEditor.atBeginning")} align="left">{t("campaigns.newsLetterEditor.atBeginning")}</Typography>,
                                                        gridSize: { xs: 12, sm: 9 }
                                                    },

                                                ]}
                                                spacing={1}
                                                gridStyles={localClasses.contentCenter}
                                            />,
                                            gridSize: { xs: 12, sm: 12 }
                                        },
                                        {
                                            content: <SimpleGrid
                                                gridArr={[
                                                    {
                                                        content: <Radio
                                                            checked={campaingnValues.PrintLocation === 1}
                                                            onChange={handleSelectionRadio}
                                                            disabled={!!!selectedCheck.PrintLocation}
                                                            value={1}
                                                            name="PrintLocation"
                                                            inputProps={{ 'aria-label': 'A' }}
                                                        />,
                                                        gridSize: { xs: 12, sm: 3 }
                                                    },
                                                    {
                                                        content: <Typography className={classes.f14} title={t("campaigns.newsLetterEditor.atBeginning")} align="left">{t("campaigns.newsLetterEditor.atBeginning")}</Typography>,
                                                        gridSize: { xs: 12, sm: 9 }
                                                    },

                                                ]}
                                                spacing={1}
                                                gridStyles={localClasses.contentCenter}
                                            />,
                                            gridSize: { xs: 12, sm: 12 }
                                        },
                                        {
                                            content: <SimpleGrid
                                                gridArr={[
                                                    {
                                                        content: <Radio
                                                            checked={campaingnValues.UnsubscribeLocation === 1}
                                                            onChange={handleSelectionRadio}
                                                            disabled={!!!selectedCheck.UnsubscribeLocation}
                                                            value={1}
                                                            name="UnsubscribeLocation"
                                                            inputProps={{ 'aria-label': 'A' }}
                                                        />,
                                                        gridSize: { xs: 12, sm: 3 }
                                                    },
                                                    {
                                                        content: <Typography className={classes.f14} title={t("campaigns.newsLetterEditor.atBeginning")} align="left">{t("campaigns.newsLetterEditor.atBeginning")}</Typography>,
                                                        gridSize: { xs: 12, sm: 9 }
                                                    },

                                                ]}
                                                spacing={1}
                                                gridStyles={localClasses.contentCenter}
                                            />,
                                            gridSize: { xs: 12, sm: 12 }
                                        },
                                        {
                                            content: <SimpleGrid
                                                gridArr={[
                                                    {
                                                        content: <Radio
                                                            checked={campaingnValues.UpdateClient === 1}
                                                            onChange={handleSelectionRadio}
                                                            disabled={!!!selectedCheck.UpdateClient}
                                                            value={1}
                                                            name="UpdateClient"
                                                            inputProps={{ 'aria-label': 'A' }}
                                                        />,
                                                        gridSize: { xs: 12, sm: 3 }
                                                    },
                                                    {
                                                        content: <Typography className={classes.f14} title={t("campaigns.newsLetterEditor.atBeginning")} align="left">{t("campaigns.newsLetterEditor.atBeginning")}</Typography>,
                                                        gridSize: { xs: 12, sm: 9 }
                                                    },

                                                ]}
                                                spacing={1}
                                                gridStyles={localClasses.contentCenter}
                                            />,
                                            gridSize: { xs: 12, sm: 12 }
                                        },
                                    ]
                                }

                            />,
                            gridSize: { xs: 12, sm: 3 }
                        },
                        {
                            content: <SimpleGrid
                                spacing={2}
                                centerlize={true}
                                gridArr={
                                    [
                                        {
                                            content: <SimpleGrid
                                                gridArr={[
                                                    {
                                                        content: <Radio
                                                            // checked={selectedRadio.a === 'a1' }
                                                            checked={campaingnValues.WebViewLocation === 2}
                                                            onChange={handleSelectionRadio}
                                                            disabled={!!!selectedCheck.WebViewLocation}
                                                            // value="a1"
                                                            value={2}
                                                            // name="a"
                                                            name="WebViewLocation"
                                                            inputProps={{ 'aria-label': 'A' }}
                                                        />,
                                                        // content: <Radio
                                                        //     checked={selectedRadio.a === 'a2'}
                                                        //     onChange={handleSelectionRadio}
                                                        //     disabled={!!!selectedCheck.a}
                                                        //     value="a2"
                                                        //     name="a"
                                                        //     inputProps={{ 'aria-label': 'A' }}
                                                        // />,
                                                        gridSize: { xs: 12, sm: 3 }
                                                    },
                                                    {
                                                        content: <Typography className={classes.f14} title={t("campaigns.newsLetterEditor.atBottom")} align="left">{t("campaigns.newsLetterEditor.atBottom")}</Typography>,
                                                        gridSize: { xs: 12, sm: 9 }
                                                    },

                                                ]}
                                                spacing={1}
                                                gridStyles={localClasses.contentCenter}
                                            />,
                                            gridSize: { xs: 12, sm: 12 }
                                        },
                                        {
                                            content: <SimpleGrid
                                                gridArr={[
                                                    {
                                                        content: <Radio
                                                            checked={campaingnValues.PrintLocation === 2}
                                                            onChange={handleSelectionRadio}
                                                            disabled={!!!selectedCheck.PrintLocation}
                                                            value={2}
                                                            name="PrintLocation"
                                                            inputProps={{ 'aria-label': 'A' }}
                                                        />,
                                                        gridSize: { xs: 12, sm: 3 }
                                                    },
                                                    {
                                                        content: <Typography className={classes.f14} title={t("campaigns.newsLetterEditor.atBottom")} align="left">{t("campaigns.newsLetterEditor.atBottom")}</Typography>,
                                                        gridSize: { xs: 12, sm: 9 }
                                                    },

                                                ]}
                                                spacing={1}
                                                gridStyles={localClasses.contentCenter}
                                            />,
                                            gridSize: { xs: 12, sm: 12 }
                                        },

                                        {
                                            content: <SimpleGrid
                                                gridArr={[
                                                    {
                                                        content: <Radio
                                                            checked={campaingnValues.UnsubscribeLocation === 2}
                                                            onChange={handleSelectionRadio}
                                                            disabled={!!!selectedCheck.UnsubscribeLocation}
                                                            value={2}
                                                            name="UnsubscribeLocation"
                                                            inputProps={{ 'aria-label': 'A' }}
                                                        />,
                                                        gridSize: { xs: 12, sm: 3 }
                                                    },
                                                    {
                                                        content: <Typography className={classes.f14} title={t("campaigns.newsLetterEditor.atBottom")} align="left">{t("campaigns.newsLetterEditor.atBottom")}</Typography>,
                                                        gridSize: { xs: 12, sm: 9 }
                                                    },

                                                ]}
                                                spacing={1}
                                                gridStyles={localClasses.contentCenter}
                                            />,
                                            gridSize: { xs: 12, sm: 12 }
                                        },
                                        {
                                            content: <SimpleGrid
                                                gridArr={[
                                                    {
                                                        content: <Radio
                                                            checked={campaingnValues.UpdateClient === 2}
                                                            onChange={handleSelectionRadio}
                                                            disabled={!!!selectedCheck.UpdateClient}
                                                            value={2}
                                                            name="UpdateClient"
                                                            inputProps={{ 'aria-label': 'A' }}
                                                        />,
                                                        gridSize: { xs: 12, sm: 3 }
                                                    },
                                                    {
                                                        content: <Typography className={classes.f14} title={t("campaigns.newsLetterEditor.atBottom")} align="left">{t("campaigns.newsLetterEditor.atBottom")}</Typography>,
                                                        gridSize: { xs: 12, sm: 9 }
                                                    },

                                                ]}
                                                spacing={1}
                                                gridStyles={localClasses.contentCenter}
                                            />,
                                            gridSize: { xs: 12, sm: 12 }
                                        },
                                    ]
                                }

                            />,
                            gridSize: { xs: 12, sm: 3 }
                        },

                    ]}

            />
        </Box>
    )

    const removeAttachmentFile = (event, fileId) => {
        event.preventDefault();
        event.stopPropagation();
        const newAttachments = [...campaingnValues.FilesProperties];
        setCampaingnValues({ ...campaingnValues, FilesProperties: newAttachments.filter((f) => f.ID !== fileId) });
        setIsSilenceUpdated(true);
    }

    const getDeleteStatus = () => {
        return setConfirmDelete(true)
    }
    const handleGalleryConfirm = () => {
        setIsFileSelected(true);
    }
    const handleSelectedImage = (files) => {
        const existsFiles = [...campaingnValues.FilesProperties];

        files = files.split(',');

        for (var i = 0; i < files.length; i++) {
            const file = files[i];
            let fileName = file.split('/')[file.split('/').length - 1];
            const newFile = {
                Name: fileName,
                FileName: fileName,
                FolderType: PulseemFolderType.DOCUMENT,
                FileURL: file,
                ID: makeId()
            }
            existsFiles.push(newFile);
        }

        setCampaingnValues({ ...campaingnValues, FilesProperties: [...existsFiles] })
        setShowGallery(false);
        setIsFileSelected(false);
        setIsSilenceUpdated(true);
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
            title: t("common.imageGallery"),
            content: (
                <Gallery
                    classes={classes}
                    isConfirm={isGalleryConfirmed}
                    callbackSelectFile={handleSelectedImage}
                    style={{ minWidth: 400 }}
                    multiSelect={true}
                    folderType={PulseemFolderType.DOCUMENT} />
            )
        };
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
            <SimpleGrid
                spacing={3}
                centerlize={true}
                gridArr={[
                    {
                        content: <CampaignBox3 />,
                        gridSize: { xs: 12, sm: 5 }
                    },
                    {
                        content: <CampaignBox2 />,
                        gridSize: { xs: 12, sm: 7 }
                    },
                ]}
            />

            <Box className={classes.flex} style={{ justifyContent: 'end', marginTop: 25 }}>
                <WizardActions
                    classes={classes}
                    onSave={handleSubmit}
                    onBack={() => { console.log('show return message') }}
                    onDelete={props.match.params.id > 0 && getDeleteStatus}
                />
            </Box>
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
            <Loader isOpen={showLoader} />
        </DefaultScreen>
    )
}

export default NewsLetterWizard