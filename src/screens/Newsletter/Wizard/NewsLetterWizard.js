import React, { useEffect, useState } from 'react'
import DefaultScreen from "../../DefaultScreen";
import clsx from "clsx";
import { Box, Divider, Typography, TextField, Button, Paper, InputAdornment, Checkbox, Radio, Grid, makeStyles, FormControl, Select, OutlinedInput, MenuItem } from '@material-ui/core'
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
import { Delete } from '@material-ui/icons';
import { Dialog } from "../../../components/managment/Dialog";
import { BiUpload } from 'react-icons/bi';
import CustomTooltip from '../../../components/Tooltip/CustomTooltip';



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
            padding: '9px 40px 9px 10px !important'
        },
        '& .MuiAutocomplete-endAdornment': {
            display: 'flex',
            justifyContent: 'flex-end'
        }

    },
    select: {
        '& .MuiSelect-select': {
            padding: '12px 24px 12px 24px',
            width: 252
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

    const ErrorTexts = {
        Name: t('campaigns.newsLetterEditor.helpTexts.Name'),
        Subject: t('campaigns.newsLetterEditor.helpTexts.Subject'),
        FromName: t('campaigns.newsLetterEditor.helpTexts.FromName'),
        FromEmail: t('campaigns.newsLetterEditor.helpTexts.FromEmail'),
    }

    const [errors, setErrors] = useState({
        Name: "",
        Subject: "",
        // personalDatatoSubject: [],
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
    const [confirmDelete, setConfirmDelete] = useState(false)

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
            // handleGetNewsletterResponse(response)
        }

        preload()
    }, [])



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

    const handleSubmit = () => {
        if (handleValidations()) {
            console.log("VALUES:", campaingnValues)
        }
    }
    const handleDelete = () => {
        setConfirmDelete(false)
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
                                            style={{ width: 300 }}
                                            options={['abc@123.com', 'bca@321.com', 'gvc@nbc.com']}
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
                                                        return <em>Select</em>;
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
                                                <MenuItem disabled value="">
                                                    <em>Select</em>
                                                </MenuItem>
                                                {['FirstName', 'LastName', 'Email', 'Mobile', 'Other'].map((item) => (
                                                    <MenuItem
                                                        key={item}
                                                        value={item}
                                                    // style={getStyles(item, personitem, theme)}
                                                    >
                                                        {item}
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
            <Typography className={localClasses.suHeading}>Heading</Typography>
            <SimpleGrid
                spacing={3}
                centerlize={true}
                gridArr={
                    [
                        {
                            content: <SimpleGrid
                                gridArr={[{
                                    content: <Typography title={t("Field1")} className={classes.alignDir}>{t("Introductory text")}</Typography>,
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
                                        helperText={t("The text will appear in the display bar in the email, before it opens")}
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
                                    content: <Typography title={t("Field2")} className={classes.alignDir}>{t("Field2")}</Typography>,
                                    gridSize: { xs: 12, sm: 12 }
                                },
                                {
                                    content: <Autocomplete
                                        id="country-select-demo"
                                        // multiple
                                        style={{ width: 300 }}
                                        options={['Option1', 'Option2', 'Option3', 'Option4', 'Option5']}
                                        className={localClasses.autocomplete}
                                        // value={campaingnValues?.personalDatatoSubject}
                                        autoHighlight
                                        getOptionLabel={(option) => option}
                                        renderOption={(option) => (
                                            <React.Fragment>
                                                {option}
                                            </React.Fragment>
                                        )}
                                        // onChange={(event, val) => {

                                        //     setCampaingnValues({ ...campaingnValues, personalDatatoSubject: val, Subject: `${campaingnValues.Subject} ##${val}##` })
                                        // }}

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
                                    content:
                                        <CustomTooltip
                                            isSimpleTooltip={false}
                                            classes={classes}
                                            interactive={true}
                                            arrow={true}
                                            placement={'top'}
                                            title={<Typography noWrap={false}>{t("Upload File")} - doc, docx, pdf, rtf, xls, xlsv, csv, txt, jpg, jpeg, ppt</Typography>}
                                            text={t("Upload File - doc, docx, pdf, rtf, xls, xlsv, csv, txt, jpg, jpeg, ppt")}
                                        />,
                                    gridSize: { xs: 12, sm: 12 }
                                },
                                {
                                    content: <>
                                        <Box className={localClasses.fileUploadBox}>
                                            <input type='file' id='upldNLFile' />
                                            <label htmlFor='upldNLFile'><BiUpload /></label>
                                        </Box>
                                        <label className={localClasses.helperText}>Popped up and attachment in the email you send</label>
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
                        {
                            content: <SimpleGrid
                                gridArr={[{
                                    content: <Typography title={t("Field4")} className={classes.alignDir}>{t("Mailing Language")}</Typography>,
                                    gridSize: { xs: 12, sm: 12 }
                                },
                                {
                                    content:
                                        <Autocomplete
                                            id="country-select-demo"
                                            // multiple
                                            style={{ width: 300 }}
                                            options={['Option1', 'Option2', 'Option3', 'Option4', 'Option5']}
                                            className={localClasses.autocomplete}
                                            // value={campaingnValues?.personalDatatoSubject}
                                            autoHighlight
                                            getOptionLabel={(option) => option}
                                            renderOption={(option) => (
                                                <React.Fragment>
                                                    {option}
                                                </React.Fragment>
                                            )}
                                            // onChange={(event, val) => {

                                            //     setCampaingnValues({ ...campaingnValues, personalDatatoSubject: val, Subject: `${campaingnValues.Subject} ##${val}##` })
                                            // }}

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
                                        />,
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
            <Typography className={localClasses.suHeading}>Text Inserts</Typography>

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

                                                            defaultChecked
                                                            color="primary"
                                                            inputProps={{ 'aria-label': 'secondary checkbox' }}
                                                        />,
                                                        gridSize: { xs: 6, sm: 2 }
                                                    },
                                                    {
                                                        content: <Typography className={classes.f14} title={t("If you do not see this email, click here")} align="left">{t("If you do not see this email, click here")}</Typography>,
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

                                                            defaultChecked
                                                            color="primary"
                                                            inputProps={{ 'aria-label': 'secondary checkbox' }}
                                                        />,
                                                        gridSize: { xs: 6, sm: 2 }
                                                    },
                                                    {
                                                        content: <Typography className={classes.f14} title={t("Print mail")} align="left">{t("Print mail")}</Typography>,
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

                                                            defaultChecked
                                                            color="primary"
                                                            inputProps={{ 'aria-label': 'secondary checkbox' }}
                                                        />,
                                                        gridSize: { xs: 6, sm: 2 }
                                                    },
                                                    {
                                                        content: <Typography className={classes.f14} title={t("Remove cunstomer from mail list")} align="left">{t("Remove cunstomer from mail list")}</Typography>,
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

                                                            defaultChecked
                                                            color="primary"
                                                            inputProps={{ 'aria-label': 'secondary checkbox' }}
                                                        />,
                                                        gridSize: { xs: 6, sm: 2 }
                                                    },
                                                    {
                                                        content: <Typography className={classes.f14} title={t("Update customer information")} align="left">{t("Update customer information")}</Typography>,
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
                                                            checked={selectedRadio === 'a'}
                                                            onChange={(e) => setSelectedRadio(e.target.value)}
                                                            value="a"
                                                            name="radio-button-demo"
                                                            inputProps={{ 'aria-label': 'A' }}
                                                        />,
                                                        gridSize: { xs: 12, sm: 3 }
                                                    },
                                                    {
                                                        content: <Typography className={classes.f14} title={t("At the beginning")} align="left">{t("At the beginning")}</Typography>,
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
                                                            checked={selectedRadio === 'b'}
                                                            onChange={(e) => setSelectedRadio(e.target.value)}
                                                            value="b"
                                                            name="radio-button-demo"
                                                            inputProps={{ 'aria-label': 'A' }}
                                                        />,
                                                        gridSize: { xs: 12, sm: 3 }
                                                    },
                                                    {
                                                        content: <Typography className={classes.f14} title={t("At the beginning")} align="left">{t("At the beginning")}</Typography>,
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
                                                            checked={selectedRadio === 'c'}
                                                            onChange={(e) => setSelectedRadio(e.target.value)}
                                                            value="c"
                                                            name="radio-button-demo"
                                                            inputProps={{ 'aria-label': 'A' }}
                                                        />,
                                                        gridSize: { xs: 12, sm: 3 }
                                                    },
                                                    {
                                                        content: <Typography className={classes.f14} title={t("At the beginning")} align="left">{t("At the beginning")}</Typography>,
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
                                                            checked={selectedRadio === 'd'}
                                                            onChange={(e) => setSelectedRadio(e.target.value)}
                                                            value="d"
                                                            name="radio-button-demo"
                                                            inputProps={{ 'aria-label': 'A' }}
                                                        />,
                                                        gridSize: { xs: 12, sm: 3 }
                                                    },
                                                    {
                                                        content: <Typography className={classes.f14} title={t("At the beginning")} align="left">{t("At the beginning")}</Typography>,
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
                                                            checked={selectedRadio === 'a'}
                                                            onChange={(e) => setSelectedRadio(e.target.value)}
                                                            value="a"
                                                            name="radio-button-demo"
                                                            inputProps={{ 'aria-label': 'A' }}
                                                        />,
                                                        gridSize: { xs: 12, sm: 3 }
                                                    },
                                                    {
                                                        content: <Typography className={classes.f14} title={t("At the bottom")} align="left">{t("At the bottom")}</Typography>,
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
                                                            checked={selectedRadio === 'b'}
                                                            onChange={(e) => setSelectedRadio(e.target.value)}
                                                            value="b"
                                                            name="radio-button-demo"
                                                            inputProps={{ 'aria-label': 'A' }}
                                                        />,
                                                        gridSize: { xs: 12, sm: 3 }
                                                    },
                                                    {
                                                        content: <Typography className={classes.f14} title={t("At the bottom")} align="left">{t("At the bottom")}</Typography>,
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
                                                            checked={selectedRadio === 'c'}
                                                            onChange={(e) => setSelectedRadio(e.target.value)}
                                                            value="c"
                                                            name="radio-button-demo"
                                                            inputProps={{ 'aria-label': 'A' }}
                                                        />,
                                                        gridSize: { xs: 12, sm: 3 }
                                                    },
                                                    {
                                                        content: <Typography className={classes.f14} title={t("At the bottom")} align="left">{t("At the bottom")}</Typography>,
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
                                                            checked={selectedRadio === 'd'}
                                                            onChange={(e) => setSelectedRadio(e.target.value)}
                                                            value="d"
                                                            name="radio-button-demo"
                                                            inputProps={{ 'aria-label': 'A' }}
                                                        />,
                                                        gridSize: { xs: 12, sm: 3 }
                                                    },
                                                    {
                                                        content: <Typography className={classes.f14} title={t("At the bottom")} align="left">{t("At the bottom")}</Typography>,
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
                <Button
                    variant='contained'
                    size='small'
                    className={clsx(localClasses.btnP20, classes.mlr10, classes.confirmButton)}
                // onClick={onConfirm}
                // className={clsx(
                //   classes.dialogButton,
                //   classes.dialogConfirmButton
                // )}
                >
                    {t('common.continue')}
                </Button>
                <Button
                    variant='contained'
                    size='small'
                    className={clsx(localClasses.btnP20, classes.mlr10, classes.saveButton)}
                    onClick={handleSubmit}
                // className={clsx(
                //   classes.dialogButton,
                //   classes.dialogCancelButton
                // )}

                >
                    {t('common.Save')}
                </Button>
                <Button
                    variant='contained'
                    size='small'
                    className={clsx(localClasses.btnP20, classes.mlr10, classes.cancelBtn)}
                    onClick={() => setConfirmDelete(true)}
                // className={clsx(
                //   classes.dialogButton,
                //   classes.dialogCancelButton
                // )}

                >
                    <Delete />
                </Button>
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
        </DefaultScreen>
    )
}

export default NewsLetterWizard