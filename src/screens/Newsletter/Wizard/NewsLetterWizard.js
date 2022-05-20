import React, { useEffect, useState } from 'react'
import DefaultScreen from "../../DefaultScreen";
import clsx from "clsx";
import { Box, Divider, Typography, TextField, Button, Paper, InputAdornment, Checkbox, Radio, Grid, makeStyles } from '@material-ui/core'
import { Loader } from "../../../components/Loader/Loader";
import SimpleGrid from "../../../components/Grids/SimpleGrid";
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from "react-i18next";
import { getNewsletterReportsByIds } from '../../../redux/reducers/newsletterSlice';
import Toast from '../../../components/Toast/Toast.component';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { campaignData, countries } from '../tempConstants';
// import IconWrapper from '../../../components/icons/IconWrapper';
import { ManagmentIcon } from '../../../components/managment';
import SmileIcon from '../../../assets/images/smile.png'


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

        }
    },
    autocomplete: {
        '& .MuiInputBase-root': {
            // '& .MuiOutlinedInput-input': {
            padding: '9px 40px 9px 10px !important'
            // }
        },
        '& .MuiAutocomplete-endAdornment': {
            display: 'flex',
            justifyContent: 'flex-end'
        }

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

    const ErrorTexts = {
        Name: t('campaigns.newsLetterEditor.helpTexts.Name'),
        Subject: t('campaigns.newsLetterEditor.helpTexts.Subject'),
        FromName: t('campaigns.newsLetterEditor.helpTexts.FromName'),
        FromEmail: t('campaigns.newsLetterEditor.helpTexts.FromEmail'),
    }

    const [errors, setErrors] = useState({
        Name: "",
        Subject: "",
        personalDatatoSubject: "",
        FromName: "",
        FromEmail: ""
    })

    const [campaingnValues, setCampaingnValues] = useState({
        CampaignID: "",
        Name: "",
        Subject: "",
        personalDatatoSubject: "",
        FromName: "",
        FromEmail: ""
    })

    const [selectedRadio, setSelectedRadio] = useState(null)
    const [selectedCheck, setSelectedCheck] = useState([])

    const handleGetNewsletterResponse = (res) => {
        switch (res?.payload?.StatusCode || 201) {
            case 200: {
                setToastMessage(res.payload.message)
                break;
            }
            case 201: {
                // console.log(res.payload)
                // setCampaingnValues({ ...campaingnValues, ...res.payload.campaign })
                setCampaingnValues({ ...campaignData })
                break;
            }
            case 202: {
                setToastMessage(res.payload.message)
                break;
            }
            case 404: {
                setToastMessage(res.payload.message)
                break;
            }
            case 400: {
                setToastMessage(res.payload.message)
                break;
            }
            default: {
                setToastMessage(res.payload.message)
            }
        }
    }



    useEffect(() => {
        const preload = () => {
            const response = dispatch(getNewsletterReportsByIds(1))
            handleGetNewsletterResponse(response)
        }

        preload()
    }, [])



    const handleChange = (e) => {
        console.log("VALUES:", e.target.name, e.target.value)
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

    const handleSubmit = () => {
        if (handleValidations()) {
            console.log("VALUES:", campaingnValues)
        }
    }

    const handleValidations = () => {
        const tempError = { ...errors }
        const data = { ...campaingnValues }
        let isError = false;

        Object.entries(data).forEach(([key, value]) => {
            if (!value) {
                tempError[key] = "Null values not allowed";
                isError = !value
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
        <Box p={5}>
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
                                        id="outlined-basic"
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
                                    content: <Typography title={t("From Name")} className={classes.alignDir}>{t("From Name")}</Typography>,
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
                                    content: <Typography title={t("From Email")} className={classes.alignDir}>{t("From Email")}</Typography>,
                                    gridSize: { xs: 12, sm: 12 }
                                },
                                {
                                    content:
                                        <Autocomplete
                                            id="fromEmailSelect"
                                            style={{ width: 300 }}
                                            options={['abc@123.com', 'bca@321.com', 'gvc@nbc.com']}
                                            className={localClasses.autocomplete}
                                            name="FromEmail"
                                            value={campaingnValues.FromEmail}
                                            autoHighlight
                                            getOptionLabel={(option) => option}
                                            renderOption={(option) => (
                                                <React.Fragment>
                                                    {option}
                                                </React.Fragment>
                                            )}
                                            onInputChange={(event, val) => {
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
                                    content: <Typography title={t("Campaign Subject")} className={classes.alignDir}>{t("Campaign Subject")}</Typography>,
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
                                        </Box>

                                    ,
                                    gridSize: { xs: 12, sm: 12 }
                                }
                                ]}
                            />,
                            gridSize: { xs: 12, sm: 8 }
                        },
                        {
                            content: <SimpleGrid
                                gridArr={[{
                                    content: <Typography title={t("Add Personal Data To The Subject")} className={classes.alignDir}>{t("Add Personal Data To The Subject")}</Typography>,
                                    gridSize: { xs: 12, sm: 12 }
                                },
                                {
                                    content:
                                        <Autocomplete
                                            id="country-select-demo"
                                            style={{ width: 300 }}
                                            options={['abc', 'xyz', 'rst', 'uvw', 'axy']}
                                            className={localClasses.autocomplete}
                                            autoHighlight
                                            getOptionLabel={(option) => option}
                                            renderOption={(option) => (
                                                <React.Fragment>
                                                    {option}
                                                </React.Fragment>
                                            )}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    variant="outlined"
                                                    style={{ padding: '1.5px 6px !important' }}
                                                    inputProps={{
                                                        ...params.inputProps,
                                                        autoComplete: 'new-password',
                                                        style: { padding: '2px 4px' }
                                                    }}
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
                    ]
                }

            />
        </Box>
    )

    const CampaignBox2 = () => (
        <Box p={5}>
            <SimpleGrid
                spacing={3}
                centerlize={true}
                gridArr={
                    [
                        {
                            content: <SimpleGrid
                                gridArr={[{
                                    content: <Typography title={t("Field1")} className={classes.alignDir}>{t("Field1")}</Typography>,
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
                                    // helperText={ErrorTexts.Name}
                                    />,
                                    gridSize: { xs: 12, sm: 12 }
                                }
                                ]}
                            />,
                            gridSize: { xs: 12, sm: 6 }
                        },
                        {
                            content: <SimpleGrid
                                gridArr={[{
                                    content: <Typography title={t("Field2")} className={classes.alignDir}>{t("Field2")}</Typography>,
                                    gridSize: { xs: 12, sm: 12 }
                                },
                                {
                                    content: <TextField
                                        id="outlined-basic"
                                        label=""
                                        variant="outlined"
                                        name="FromName"
                                        // // value={campaingnValues.FromName}
                                        className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252, localClasses.textbox)}
                                        autoComplete="off"
                                    // onChange={handleChange}
                                    // error={errors.FromName}
                                    // helperText={ErrorTexts.FromName}
                                    />,
                                    gridSize: { xs: 12, sm: 12 }
                                }
                                ]}
                            />,
                            gridSize: { xs: 12, sm: 6 }
                        },

                        {
                            content: <SimpleGrid
                                gridArr={[{
                                    content: <Typography title={t("Field2")} className={classes.alignDir}>{t("Field2")}</Typography>,
                                    gridSize: { xs: 12, sm: 12 }
                                },
                                {
                                    content:
                                        <TextField
                                            id="outlined-basic"
                                            label=""
                                            variant="outlined"
                                            name="Subject"
                                            // // value={campaingnValues.Subject}
                                            className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                                            autoComplete="off"
                                        // onChange={handleChange}
                                        // error={errors.Subject}
                                        // helperText={ErrorTexts.Subject}
                                        />,
                                    gridSize: { xs: 12, sm: 12 }
                                }
                                ]}
                            />,
                            gridSize: { xs: 12, sm: 6 }
                        },
                        {
                            content: <SimpleGrid
                                gridArr={[{
                                    content: <Typography title={t("Field4")} className={classes.alignDir}>{t("Field4")}</Typography>,
                                    gridSize: { xs: 12, sm: 12 }
                                },
                                {
                                    content:
                                        <TextField
                                            id="outlined-basic"
                                            label=""
                                            variant="outlined"
                                            name="Subject"
                                            // // value={campaingnValues.Subject}
                                            className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                                            autoComplete="off"
                                        // onChange={handleChange}
                                        // error={errors.Subject}
                                        // helperText={ErrorTexts.Subject}
                                        />,
                                    gridSize: { xs: 12, sm: 12 }
                                }
                                ]}
                            />,
                            gridSize: { xs: 12, sm: 6 }
                        },

                    ]
                }

            />
        </Box>
    )

    const CampaignBox3 = () => (
        <Box p={5}>

            <SimpleGrid
                spacing={3}
                centerlize={true}
                gridArr={
                    [
                        {
                            content: <SimpleGrid
                                spacing={3}
                                centerlize={true}
                                gridArr={
                                    [
                                        {
                                            content: <SimpleGrid
                                                gridArr={[{
                                                    content: <Typography title={t("Field1")} align="right">{t("Field1")}</Typography>,
                                                    gridSize: { xs: 12, sm: 10 }
                                                },
                                                {
                                                    content: <Radio
                                                        checked={selectedRadio === 'a'}
                                                        onChange={(e) => setSelectedRadio(e.target.value)}
                                                        value="a"
                                                        name="radio-button-demo"
                                                        inputProps={{ 'aria-label': 'A' }}
                                                    />,
                                                    gridSize: { xs: 12, sm: 2 }
                                                }
                                                ]}
                                            />,
                                            gridSize: { xs: 12, sm: 12 }
                                        },

                                        {
                                            content: <SimpleGrid
                                                gridArr={[{
                                                    content: <Typography title={t("Field2")} align="right">{t("Field2")}</Typography>,
                                                    gridSize: { xs: 12, sm: 10 }
                                                },
                                                {
                                                    content: <Radio
                                                        checked={selectedRadio === 'b'}
                                                        onChange={(e) => setSelectedRadio(e.target.value)}
                                                        value="b"
                                                        name="radio-button-demo"
                                                        inputProps={{ 'aria-label': 'A' }}
                                                    />,
                                                    gridSize: { xs: 12, sm: 2 }
                                                }
                                                ]}
                                            />,
                                            gridSize: { xs: 12, sm: 12 }
                                        },

                                        {
                                            content: <SimpleGrid
                                                gridArr={[{
                                                    content: <Typography title={t("Field2")} align="right">{t("Field2")}</Typography>,
                                                    gridSize: { xs: 12, sm: 10 }
                                                },
                                                {
                                                    content:
                                                        <Radio
                                                            checked={selectedRadio === 'c'}
                                                            onChange={(e) => setSelectedRadio(e.target.value)}
                                                            value="c"
                                                            name="radio-button-demo"
                                                            inputProps={{ 'aria-label': 'A' }}
                                                        />,
                                                    gridSize: { xs: 12, sm: 2 }
                                                }
                                                ]}
                                            />,
                                            gridSize: { xs: 12, sm: 12 }
                                        },
                                        {
                                            content: <SimpleGrid
                                                gridArr={[{
                                                    content: <Typography title={t("Field4")} align="right">{t("Field4")}</Typography>,
                                                    gridSize: { xs: 12, sm: 10 }
                                                },
                                                {
                                                    content:
                                                        <Radio
                                                            checked={selectedRadio === 'd'}
                                                            onChange={(e) => setSelectedRadio(e.target.value)}
                                                            value="d"
                                                            name="radio-button-demo"
                                                            inputProps={{ 'aria-label': 'A' }}
                                                        />,
                                                    gridSize: { xs: 12, sm: 2 }
                                                }
                                                ]}
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
                                spacing={3}
                                centerlize={true}
                                gridArr={
                                    [
                                        {
                                            content: <SimpleGrid
                                                gridArr={[{
                                                    content: <Typography title={t("Field1")} align="right">{t("Field1")}</Typography>,
                                                    gridSize: { xs: 6, sm: 10 }
                                                },
                                                {
                                                    content: <Checkbox
                                                        defaultChecked
                                                        color="primary"
                                                        inputProps={{ 'aria-label': 'secondary checkbox' }}
                                                    />,
                                                    gridSize: { xs: 6, sm: 2 }
                                                }
                                                ]}
                                            />,
                                            gridSize: { xs: 12, sm: 12 }
                                        },
                                        {
                                            content: <SimpleGrid
                                                gridArr={[{
                                                    content: <Typography title={t("Field2")} align="right">{t("Field2")}</Typography>,
                                                    gridSize: { xs: 6, sm: 10 }
                                                },
                                                {
                                                    content: <Checkbox
                                                        defaultChecked
                                                        color="primary"
                                                        inputProps={{ 'aria-label': 'secondary checkbox' }}
                                                    />,
                                                    gridSize: { xs: 6, sm: 2 }
                                                }
                                                ]}
                                            />,
                                            gridSize: { xs: 12, sm: 12 }
                                        },

                                        {
                                            content: <SimpleGrid
                                                gridArr={[{
                                                    content: <Typography title={t("Field2")} align="right">{t("Field2")}</Typography>,
                                                    gridSize: { xs: 6, sm: 10 }
                                                },
                                                {
                                                    content:
                                                        <Checkbox
                                                            defaultChecked
                                                            color="primary"
                                                            inputProps={{ 'aria-label': 'secondary checkbox' }}
                                                        />,
                                                    gridSize: { xs: 6, sm: 2 }
                                                }
                                                ]}
                                            />,
                                            gridSize: { xs: 12, sm: 12 }
                                        },
                                        {
                                            content: <SimpleGrid
                                                gridArr={[{
                                                    content: <Typography title={t("Field4")} align="right">{t("Field4")}</Typography>,
                                                    gridSize: { xs: 6, sm: 10 }
                                                },
                                                {
                                                    content:
                                                        <Checkbox
                                                            defaultChecked
                                                            color="primary"
                                                            inputProps={{ 'aria-label': 'secondary checkbox' }}
                                                        />,
                                                    gridSize: { xs: 6, sm: 2 }
                                                }
                                                ]}
                                            />,
                                            gridSize: { xs: 12, sm: 12 }
                                        },
                                    ]
                                }
                            />,
                            gridSize: { xs: 12, sm: 6 }
                        }
                    ]}

            />
        </Box>
    )

    return (
        <DefaultScreen
            currentPage="Campaingn Settings"
            classes={classes}
            containerClass={clsx(classes.management, classes.mb50)}
        >
            {renderToast()}
            <Typography className={classes.managementTitle}>
                {t("campaigns.createNewsLetterHeader")}
            </Typography>
            <Divider />
            <CampaignBox1 />
            <Divider />
            <SimpleGrid
                spacing={3}
                centerlize={true}
                gridArr={[
                    {
                        content: <CampaignBox2 />,
                        gridSize: { xs: 12, sm: 7 }
                    },
                    {
                        content: <CampaignBox3 />,
                        gridSize: { xs: 12, sm: 5 }
                    },
                ]}
            />

            <Box className={classes.flex}>

                <Button
                    variant='contained'
                    size='small'
                    className={clsx(classes.m10, classes.confirmButton)}
                // onClick={onConfirm}
                // className={clsx(
                //   classes.dialogButton,
                //   classes.dialogConfirmButton
                // )}
                >
                    Confirm
                </Button>
                <Button
                    variant='contained'
                    size='small'
                    className={clsx(classes.m10, classes.confirmButton)}
                // onClick={onClose}
                // className={clsx(
                //   classes.dialogButton,
                //   classes.dialogCancelButton
                // )}

                >
                    Save
                </Button>
            </Box>
        </DefaultScreen>
    )
}

export default NewsLetterWizard