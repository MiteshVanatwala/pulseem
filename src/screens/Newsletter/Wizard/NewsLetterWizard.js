import React, { useEffect, useState } from 'react'
import DefaultScreen from "../../DefaultScreen";
import clsx from "clsx";
import { BiUpload } from 'react-icons/bi';
import { FaGoogle } from 'react-icons/fa';
import { IoMdImages } from 'react-icons/io';
import { Box, Divider, Typography, TextField, Button, Paper, InputAdornment, Checkbox, Radio, Grid, makeStyles, FormControl, Select, OutlinedInput, MenuItem } from '@material-ui/core'
import { Loader } from "../../../components/Loader/Loader";
import SimpleGrid from "../../../components/Grids/SimpleGrid";
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from "react-i18next";
import { deleteCampaign } from '../../../redux/reducers/newsletterSlice';
import Toast from '../../../components/Toast/Toast.component';
import Autocomplete from '@material-ui/lab/Autocomplete';
import SmileIcon from '../../../assets/images/smile.png'
import { Dialog } from "../../../components/managment/Dialog";
import CustomTooltip from '../../../components/Tooltip/CustomTooltip';
import WizardActions from '../../../components/Wizard/WizardActions';
import { saveCampaignInfo, getCampaignInfo, getVerifiedEmail } from '../../../redux/reducers/campaignEditorSlice'
import { getAccountExtraData } from "../../../redux/reducers/smsSlice";
import Gallery from '../../../components/Gallery/Gallery.component';
import { ClientFields, LangugeCode, MobileSupport, PulseemFolderType } from "../../../model/PulseemFields/Fields";


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
            padding: '12px 24px 12px 24px',
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
    const {
        language,
        windowSize,
        email,
        phone,
        rowsPerPage,
        smsOldVersion,
        isRTL,
    } = useSelector((state) => state.core);
    const { t } = useTranslation();
    const localClasses = useStyles()
    const dispatch = useDispatch()
    const [toastMessage, setToastMessage] = useState(null);
    const [showLoader, setLoader] = useState(true);
    const [extraAccountDATA, setextraAccountDATA] = useState([]);
    const { campaignInfo, verifiedEmails } = useSelector(state => state.campaignEditor);
    const [showGallery, setShowGallery] = useState(false);
    const [isGalleryConfirmed, setIsFileSelected] = useState(false);

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
        IsResponsive: 1
    })

    const [selectedRadio, setSelectedRadio] = useState({ a: null, b: null, c: null, d: null })
    const [selectedCheck, setSelectedCheck] = useState({ a: false, b: false, c: false, d: false })
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



    useEffect(() => {
        const preload = async () => {
            await dispatch(getVerifiedEmail());
            if (props.match.params.id != null && parseInt(props.match.params.id) > 0) {
                const campaignId = parseInt(props.match.params.id);
                const response = await dispatch(getCampaignInfo(campaignId))
                handleGetNewsletterResponse(JSON.parse(response.payload))
            }
            setLoader(false);
        }
        const initClientFields = async () => {
            let resp = await dispatch(getAccountExtraData());
            let _clientFields = [...ClientFields];
            let arr = Object.keys(resp.payload)
            let additionalExtraData = arr.map(function (key) {
                return { [key]: resp.payload[key] };
            })

            for (let i = 0; i < additionalExtraData.length; i++) {
                _clientFields.push({ ...additionalExtraData[i], selected: false })
            }
            setextraAccountDATA(_clientFields)
        }

        initClientFields();
        preload();
    }, [])

    const handleSelectionRadio = (e) => {
        setSelectedRadio({ ...selectedRadio, [e.target.name]: e.target.value })
    }
    const handleChangeCheckbox = (e) => {
        if (selectedCheck[e.target.name]) {
            setSelectedRadio({ ...selectedRadio, [e.target.name]: null })
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
        console.log("VALUES:", campaingnValues)
        const response = await dispatch(saveCampaignInfo(campaingnValues));
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
                                        <Autocomplete
                                            id="fromEmailSelect"
                                            // style={{ width: 300 }}
                                            options={verifiedEmails}
                                            className={localClasses.autocomplete}
                                            name="FromEmail"
                                            value={campaingnValues?.FromEmail}
                                            autoHighlight
                                            getOptionLabel={(option) => option}
                                            renderOption={(option) => (
                                                <React.Fragment>
                                                    {option}
                                                </React.Fragment>
                                            )}
                                            onChange={(event, val) => {
                                                setCampaingnValues({ ...campaingnValues, FromEmail: val });
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    variant="outlined"
                                                    inputProps={{
                                                        ...params.inputProps,
                                                        autoComplete: 'new-password',
                                                        style: { padding: '2px 4px' },
                                                        name: "FromEmail"
                                                    }}
                                                    error={errors.FromEmail}
                                                    helperText={ErrorTexts.FromEmail}
                                                />
                                            )}
                                            PaperComponent={({ children }) => (
                                                <Paper className={classes.groupsAutoComplete}>{children}</Paper>
                                            )}
                                        />
                                    ,
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
                                                <img src={SmileIcon} alt="smile" />
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
                                    content: <>
                                        <Box className={localClasses.fileUploadBox}>
                                            <Button
                                                onClick={() => {
                                                    setShowGallery(true);
                                                }}>
                                                <label htmlFor='upldNLFile'><BiUpload /></label>
                                            </Button>
                                        </Box>
                                        <label className={localClasses.helperText}>{t("campaigns.newsLetterEditor.helpTexts.upload")}</label>
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
            <Box className={clsx(classes.flex, localClasses.googleCheck)}>
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
                                                            name='a'
                                                            checked={!!selectedCheck['a']}
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
                                                            name='b'
                                                            checked={!!selectedCheck['b']}
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
                                                            name='c'
                                                            checked={!!selectedCheck['c']}
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
                                                            name='d'
                                                            checked={!!selectedCheck['d']}
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
                                                            checked={selectedRadio.a === 'a1'}
                                                            onChange={handleSelectionRadio}
                                                            disabled={!!!selectedCheck.a}
                                                            value="a1"
                                                            name="a"
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
                                                            checked={selectedRadio.b === 'b1'}
                                                            onChange={handleSelectionRadio}
                                                            disabled={!!!selectedCheck.b}
                                                            value="b1"
                                                            name="b"
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
                                                            checked={selectedRadio.c === 'c1'}
                                                            onChange={handleSelectionRadio}
                                                            disabled={!!!selectedCheck.c}
                                                            value="c1"
                                                            name="c"
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
                                                            checked={selectedRadio.d === 'd1'}
                                                            onChange={handleSelectionRadio}
                                                            disabled={!!!selectedCheck.d}
                                                            value="d1"
                                                            name="d"
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
                                                            checked={selectedRadio.a === 'a2'}
                                                            onChange={handleSelectionRadio}
                                                            disabled={!!!selectedCheck.a}
                                                            value="a2"
                                                            name="a"
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
                                                            checked={selectedRadio.b === 'b2'}
                                                            onChange={handleSelectionRadio}
                                                            disabled={!!!selectedCheck.b}
                                                            value="b2"
                                                            name="b"
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
                                                            checked={selectedRadio.c === 'c2'}
                                                            onChange={handleSelectionRadio}
                                                            disabled={!!!selectedCheck.c}
                                                            value="c2"
                                                            name="c"
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
                                                            checked={selectedRadio.d === 'd2'}
                                                            onChange={handleSelectionRadio}
                                                            disabled={!!!selectedCheck.d}
                                                            value="d2"
                                                            name="d"
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

    const getDeleteStatus = () => {
        return setConfirmDelete(true)
    }
    const handleGalleryConfirm = () => {
        setIsFileSelected(true);
    }
    const handleSelectedImage = (image) => {
        setShowGallery(false);
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

            <Box className={classes.flex} style={{ justifyContent: 'end' }}>
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