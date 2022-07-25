import React, { useEffect, useState } from "react";
import clsx from "clsx";
import {
    Grid,
    Typography,
    Divider,
    Button,
    TextField,
    Box,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    makeStyles,
    Checkbox,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,

} from "@material-ui/core";
import { DateField } from '../../../../components/managment/index'

import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import moment from "moment";
import "moment/locale/he";
import { GrFormAdd } from "react-icons/gr";
import { addRecipient, getGroupsBySubAccountId } from "../../../../redux/reducers/groupSlice";
import { Dialog } from "../../../../components/managment/Dialog";
import SimpleGrid from "../../../../components/Grids/SimpleGrid";
import { DEFAULT_RECIPIENT_DATA, ADD_RECIPIENT_TABS, ADD_RECIPIENT_REQUIRED_ERRORS } from "../../../../model/Groups/Contants";
import GroupTags from "../../../../components/Groups/GroupTags";
import { replaceExtraFieldHeader } from '../../../../helpers/exportHelper';

import { ValidateEmail, ValidateNumber } from "../../../../helpers/utils";


import { Loader } from "../../../../components/Loader/Loader";
import { getAccountExtraData } from "../../../../redux/reducers/smsSlice";
import { Autocomplete } from "@material-ui/lab";
import { CLIENT_CONSTANTS } from "../../../../model/Clients/Contants";
import { changeClientStatus } from "../../../../redux/reducers/clientSlice";
import { Close } from "@material-ui/icons";
import { IoMdClose } from "react-icons/io";


const useStyles = makeStyles({
    contentBox: {
        "height": '40vh'
    },
    accordionIcons: {
        position: 'absolute',
        '& path': {
            stroke: '#0371ad'
        }
    },
    expandedBox: {
        margin: '0 !important',
        '& .MuiAccordionSummary-root': {
            minHeight: 30,
            maxHeight: 48
        },
        '& .MuiAccordionSummary-content': {
            margin: 0
        }
    },
    dateBox: {
        position: 'relative',
        '& .resetDate': {
            fontSize: 19,
            position: 'absolute',
            right: 40,
            top: 8.5,
            opacity: 0.6,
            cursor: 'pointer',
            width: 26,
            textAlign: 'center',
            '&:hover': {
                opacity: 0.8,
                background: '#f5f5f5',
                borderRadius: '50%'
            }
        }
    }
});

const AddRecipientPopup = ({ classes,
    isOpen = false,
    onClose,
    windowSize,
    selectedGroups = [],
    selectGroup,
    ToastMessages,
    onAddRecipient = () => null,
    handleResponses = (response, actions) => null,
    setDialog = () => null,
    recipientData = null
}) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const localClasses = useStyles()
    const { groupData, subAccountAllGroups } = useSelector((state) => state.group);
    const { extraData } = useSelector((state) => state.sms);
    const { isRTL } = useSelector((state) => state.core);
    const [addRecipientData, setAddRecipientData] = useState(DEFAULT_RECIPIENT_DATA);
    const [showLaoder, setLoader] = useState(false)
    const [accountExtraFields, setAccountExtraFields] = useState(null);
    const [activeTab, setActiveTab] = useState(0)
    const [errors, setErrors] = useState({
        Email: '',
        Cellphone: '',
        Groups: ''
    })
    const [selectedLocalGroups, setSelectedLocalGroups] = useState([])
    const extraFieldsTemp = {
        "ExtraField1": t('common.ExtraField1'),
        "ExtraField2": t('common.ExtraField2'),
        "ExtraField3": t('common.ExtraField3'),
        "ExtraField4": t('common.ExtraField4'),
        "ExtraField5": t('common.ExtraField5'),
        "ExtraField6": t('common.ExtraField6'),
        "ExtraField7": t('common.ExtraField7'),
        "ExtraField8": t('common.ExtraField8'),
        "ExtraField9": t('common.ExtraField9'),
        "ExtraField10": t('common.ExtraField10'),
        "ExtraField11": t('common.ExtraField11'),
        "ExtraField12": t('common.ExtraField12'),
        "ExtraField13": t('common.ExtraField13'),
        "ExtraDate1": t('common.ExtraDate1'),
        "ExtraDate2": t('common.ExtraDate2'),
        "ExtraDate3": t('common.ExtraDate3'),
        "ExtraDate4": t('common.ExtraDate4')
    }

    const dateFormat = "yyyy-MM-dd HH:mm:ss";

    const getData = async () => {

        setLoader(true);
        if (!extraData || extraData.length === 0) {
            await dispatch(getAccountExtraData());
        }
        if (subAccountAllGroups.length === 0) {
            await dispatch(getGroupsBySubAccountId());
        }
        setLoader(false)
    };

    useEffect(() => {
        getData()
        if (recipientData) {
            let { ExtraFields, ...restData } = { ...addRecipientData, ...recipientData }
            setAddRecipientData({ ...restData, ...ExtraFields })
            setSelectedLocalGroups([...selectedLocalGroups, ...selectedGroups])
        }
    }, [recipientData])


    const handleBlur = (e) => {
        if (!e.target.value) {
            setErrors({ ...errors, [e.target.name]: t(ADD_RECIPIENT_REQUIRED_ERRORS[e.target.name]) })
        }
        if (e.target.name === "Email") {
            if (!ValidateEmail(e.target.value)) {
                setErrors({ ...errors, Email: t(ADD_RECIPIENT_REQUIRED_ERRORS.Email) })
            }
        }
        if (e.target.name === "Cellphone") {
            if (e.target.value.length > 16 || e.target.value.length < 9) {
                setErrors({ ...errors, Cellphone: t(ADD_RECIPIENT_REQUIRED_ERRORS.CellphoneLength) })
            }
            else if (!ValidateNumber(e.target.value)) {
                setErrors({ ...errors, Cellphone: t(ADD_RECIPIENT_REQUIRED_ERRORS.Cellphone) })
            }
        }
    }


    const StatusDropdown = ({ data = [], onSelect = () => null, label = '', value = null }) => {
        return (
            <FormControl variant="standard" className={classes.selectInputFormControl}>
                <Select
                    labelId="statusSelect"
                    id="statusSelect"
                    label={label}
                    value={value}
                    onChange={(e) => onSelect(e.target.value)}
                >
                    {
                        data.map(obj => <MenuItem
                            className={classes.test}
                            style={{ paddingBlockStart: 10, textAlign: isRTL ? 'right' : 'left' }}
                            disabled={obj.status === -1}
                            value={obj.status}>{t(obj.text)}</MenuItem>
                        )
                    }
                </Select>
            </FormControl >
        )
    }

    const handleChange = (e, dateField = null, isExtraData = false, customValue = null) => {

        console.log("EXTRADATA:", accountExtraFields)
        if (dateField) {
            const { date, field } = dateField;
            if (isExtraData) {
                setAccountExtraFields({
                    ...accountExtraFields, [field]: moment(date, dateFormat)
                });
            }
            else {
                setAddRecipientData({
                    ...addRecipientData, [field]: moment(date, dateFormat)
                })
            }
        }
        else {
            if (Object.keys(errors).indexOf(e.target.name) !== -1 && errors[e.target.name]) {
                setErrors({ ...errors, [e.target.name]: '' });
            }

            if (isExtraData) {
                setAccountExtraFields({
                    ...accountExtraFields, [e.target.name]: e.target.value
                });
                setAddRecipientData({
                    ...addRecipientData, [e.target.name]: e.target.value
                })
            }
            else {
                if (e.target.name === "Email") {
                    e.target.value = e.target.value.replace(/ /g, "")
                }
                setAddRecipientData({
                    ...addRecipientData, [e.target.name]: e.target.value
                })
            }
        }

    }

    const handleEmailValue = (e) => {
        if (!!e.target.value && (e.target.style.direction === null || !e.target.style.direction)) {
            e.target.style.direction = 'ltr'
        } else if (!e.target.value && e.target.style.direction === 'ltr') {
            e.target.style.direction = null
        }

        handleChange(e)
    }

    const handleSubmit = async (callback) => {
        const data = {
            ClientsData: addRecipientData,
            GroupIds: recipientData ? [...selectedLocalGroups] : [...selectedGroups]
        }
        const tempError = { ...errors }

        if (!data.ClientsData.Email &&
            !data.ClientsData.Cellphone) {
            if (!data.ClientsData.Email || !ValidateEmail(data.ClientsData.Email)) {
                tempError.Email = t(ADD_RECIPIENT_REQUIRED_ERRORS.Email)
            }
            if (data.ClientsData.Cellphone.length < 9 || data.ClientsData.Cellphone.length > 16) {
                tempError.Cellphone = t(ADD_RECIPIENT_REQUIRED_ERRORS.CellphoneLength)
            }

            setErrors({ ...tempError })
            setActiveTab(0);

            return;
        } else if (data.ClientsData.Email && !ValidateEmail(data.ClientsData.Email)) {
            tempError.Email = t(ADD_RECIPIENT_REQUIRED_ERRORS.Email)
            setErrors({ ...tempError })
            setActiveTab(0);
            return
        }
        else if (!recipientData && selectedGroups.length === 0 && selectedLocalGroups.length === 0) {
            tempError.Groups = t(ADD_RECIPIENT_REQUIRED_ERRORS.Groups)
            setErrors({ ...tempError })
            setActiveTab(4);
            return
        }
        try {
            setLoader(true)
            const clientsData = [];
            clientsData.push({ ...addRecipientData, ...accountExtraFields });
            const finalData = recipientData ? { ...addRecipientData, ...accountExtraFields, Overwrite: true, OverwriteOption: 1 } : { ...addRecipientData, ...accountExtraFields };

            const request = {
                ClientsData: [finalData],
                GroupIds: recipientData ? [...selectedLocalGroups] : [...selectedGroups]
                //BUG: INITIALLY when dialog opens local selected groups is empty, this will result in removal of clients from selected groups 
            }
            const response = await dispatch(addRecipient(request))
            handleResponses(response, {
                'S_201': {
                    code: 201,
                    message: ToastMessages.RECIPIENT_ADDED,
                    Func: new Promise(async (resolutionFunc, rejectionFunc) => {
                        resolutionFunc(onAddRecipient());
                    }).then((res) => {
                        callback?.()
                    }),
                },
                'S_400': {
                    code: 400,
                    message: ToastMessages.RECIPIENT_INPUT_INCORRECT,
                    Func: () => {
                        if (addRecipientData.Cellphone) {
                            setErrors({ ...errors, Cellphone: t(ADD_RECIPIENT_REQUIRED_ERRORS.Cellphone) })
                            document.getElementById("rec_cellphone").classList.add("error");
                            document.getElementById("rec_cellphone").focus();
                            setActiveTab(0);
                        }
                        else if (addRecipientData.Email) {
                            setErrors({ ...errors, Email: t(ADD_RECIPIENT_REQUIRED_ERRORS.Email) })
                            document.getElementById("rec_email").classList.add("error");
                            document.getElementById("rec_email").focus();
                            setActiveTab(0);
                        }
                    }
                },
                'S_401': {
                    code: 401,
                    message: ToastMessages.GROUP_INVALID_API,
                    Func: () => null
                },
                'S_405': {
                    code: 405,
                    message: '',
                    Func: () => null
                },
                'S_406': {
                    code: 406,
                    message: ToastMessages.GROUP_INVALID_ID,
                    Func: () => null
                },
                'S_422': {
                    code: 422,
                    message: '',
                    Func: () => null
                },
                'default': {
                    message: ToastMessages.GROUP_ERROR,
                    Func: () => null
                },
            })


        }
        catch (err) {
            console.log('errr:', err)
        }
        finally {
            setLoader(false)
        }

    }


    const PERSONAL_DETAILS_FORM = () => {
        const WebView = <SimpleGrid
            spacing={3}
            centerlize={true}
            gridArr={[{
                content: <SimpleGrid
                    gridArr={[{
                        content: <Typography title={t("common.first_name")} className={classes.alignDir}>{t("common.first_name")}</Typography>,
                        gridSize: { xs: 12, sm: 3 }
                    },
                    {
                        content: <TextField
                            id="outlined-basic"
                            label=""
                            variant="outlined"
                            name="FirstName"
                            value={addRecipientData.FirstName}
                            className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                            autoComplete="off"
                            onChange={handleChange}
                            error={errors.FirstName}
                            helperText={errors.FirstName}
                        />,
                        gridSize: { xs: 12, sm: 9 }
                    }
                    ]}
                />
            },
            {
                content: <SimpleGrid
                    gridArr={[{
                        content: <Typography title={t("common.last_name")} className={clsx(classes.pl5, classes.pr10, classes.alignDir)}>{t("common.last_name")}</Typography>,
                        gridSize: { xs: 12, sm: 3 }
                    },
                    {
                        content: <TextField
                            id="outlined-basic"
                            label=""
                            variant="outlined"
                            name="LastName"
                            value={addRecipientData.LastName}
                            className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                            autoComplete="off"
                            onChange={handleChange}
                            error={errors.LastName}
                            helperText={errors.LastName}
                        />,
                        gridSize: { xs: 12, sm: 9 }
                    }
                    ]}
                />
            },
            {
                content: <SimpleGrid
                    gridArr={[{
                        content: <Typography title={t("common.telephone")} className={classes.alignDir}>{t("common.telephone")}</Typography>,
                        gridSize: { xs: 12, sm: 3 }
                    },
                    {
                        content: <TextField
                            id="outlined-basic"
                            label=""
                            variant="outlined"
                            name="Telephone"
                            value={addRecipientData.Telephone}
                            className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                            autoComplete="off"
                            onChange={(e) => {
                                let tempVal = e.target.value
                                if (!tempVal) {
                                    handleChange(e)
                                }
                                else if (ValidateNumber(tempVal)) {
                                    handleChange(e)
                                }
                            }}
                        />,
                        gridSize: { xs: 12, sm: 9 }
                    }
                    ]}
                />
            },
            {
                content: <SimpleGrid
                    gridArr={[{
                        content: <Typography title={t("common.cellphone")} className={clsx(classes.pl5, classes.pr10, classes.alignDir)}>{t("common.cellphone")}</Typography>,
                        gridSize: { xs: 12, sm: 3 }
                    },
                    {
                        content: <TextField
                            id="outlined-basic"
                            label=""
                            variant="outlined"
                            name="Cellphone"
                            value={addRecipientData.Cellphone}
                            className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                            autoComplete="off"
                            onChange={(e) => {
                                if (e.target.value.length === 1 && e.target.value === "-") {
                                    return;
                                }
                                let tempVal = e.target.value
                                if (!tempVal) {
                                    handleChange(e)
                                }
                                else if (ValidateNumber(tempVal)) {
                                    handleChange(e)
                                }
                            }}
                            inputProps={{ maxlength: 16 }}
                            error={errors.Cellphone}
                            helperText={errors.Cellphone}
                            onBlur={handleBlur}
                        />,
                        gridSize: { xs: 12, sm: 9 }
                    }
                    ]}
                />
            },
            {
                content: <SimpleGrid
                    gridArr={[{
                        content: <Typography title={t("common.email")} className={classes.alignDir}>{t("common.email")}</Typography>,
                        gridSize: { xs: 12, sm: 3 }
                    },
                    {
                        content: <TextField
                            id="outlined-basic"
                            label=""
                            variant="outlined"
                            name="Email"
                            value={addRecipientData.Email}
                            className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                            autoComplete="off"
                            onChange={handleEmailValue}
                            error={errors.Email}
                            helperText={errors.Email}
                            onBlur={handleBlur}
                            style={{ textAlign: 'left' }}
                            maxlength={100}
                        />,
                        gridSize: { xs: 12, sm: 9 }
                    }
                    ]}
                />
            },
            {
                content: <SimpleGrid
                    gridArr={[{
                        content: <Typography title={t("common.company")} className={clsx(classes.pl5, classes.pr10, classes.alignDir)}>{t("common.company")}</Typography>,
                        gridSize: { xs: 12, sm: 3 }
                    },
                    {
                        content: <TextField
                            id="outlined-basic"
                            label=""
                            variant="outlined"
                            name="Company"
                            value={addRecipientData.Company}
                            className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                            autoComplete="off"
                            onChange={handleChange}
                        />,
                        gridSize: { xs: 12, sm: 9 }
                    }
                    ]}
                />
            },
            ]}
        />

        const MobileView = <SimpleGrid
            gridArr={[
                {
                    content: <TextField
                        id="outlined-basic"
                        label=""
                        placeholder={t("common.first_name")}
                        variant="outlined"
                        name="FirstName"
                        value={addRecipientData.FirstName}
                        className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                        autoComplete="off"
                        onChange={handleChange}
                        error={errors.FirstName}
                        helperText={errors.FirstName}
                    />
                },
                {
                    content: <TextField
                        id="outlined-basic"
                        label=""
                        placeholder={t("common.last_name")}
                        variant="outlined"
                        name="LastName"
                        value={addRecipientData.LastName}
                        className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                        autoComplete="off"
                        onChange={handleChange}
                        error={errors.LastName}
                        helperText={errors.LastName}
                    />
                },
                {
                    content: <TextField
                        id="rec_email"
                        label=""
                        placeholder={t("common.email")}
                        variant="outlined"
                        name="Email"
                        value={addRecipientData.Email}
                        className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                        autoComplete="off"
                        onChange={handleChange}
                        error={errors.Email}
                        helperText={errors.Email}
                        onBlur={handleBlur}
                    />
                },
                {
                    content: <TextField
                        id="rec_cellphone"
                        label=""
                        placeholder={t("common.cellphone")}
                        variant="outlined"
                        name="Cellphone"
                        value={addRecipientData.Cellphone}
                        className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                        autoComplete="off"
                        onChange={(e) => {
                            let tempVal = e.target.value
                            if (!tempVal) {
                                handleChange(e)
                            }
                            else if (ValidateNumber(tempVal)) {
                                handleChange(e)
                            }
                        }}
                        inputProps={{ maxlength: 12 }}
                        error={errors.Cellphone}
                        helperText={errors.Cellphone}
                        onBlur={handleBlur}
                    />
                },
                {
                    content: <TextField
                        id="outlined-basic"
                        label=""
                        placeholder={t("common.telephone")}
                        variant="outlined"
                        name="Telephone"
                        value={addRecipientData.Telephone}
                        className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                        autoComplete="off"
                        onChange={(e) => {
                            let tempVal = e.target.value
                            if (!tempVal) {
                                handleChange(e)
                            }
                            else if (ValidateNumber(tempVal)) {
                                handleChange(e)
                            }
                        }}
                    />
                },
                {
                    content: <TextField
                        id="outlined-basic"
                        label=""
                        placeholder={t("common.company")}
                        variant="outlined"
                        name="Company"
                        value={addRecipientData.Company}
                        className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                        autoComplete="off"
                        onChange={handleChange}
                    />
                }
            ]}
        />
        return (windowSize === 'xs' ? MobileView : WebView)
    }

    const LOCATION_DETAILS_FORM = () => {
        const WebView = <SimpleGrid
            spacing={3}
            gridArr={[{
                content: <SimpleGrid
                    gridArr={[
                        {
                            content: <Typography title={t("common.address")} className={classes.alignDir}>{t("common.address")}</Typography>,
                            gridSize: { xs: 12, sm: 3 }
                        },
                        {
                            content: <TextField
                                id="outlined-basic"
                                label=""
                                variant="outlined"
                                name="Address"
                                value={addRecipientData.Address}
                                className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                                autoComplete="off"
                                onChange={handleChange}
                            />,
                            gridSize: { xs: 12, sm: 9 }
                        }
                    ]}

                />
            },
            {
                content: <SimpleGrid
                    gridArr={[
                        {
                            content: <Typography title={t("common.city")} className={clsx(classes.pl5, classes.pr10, classes.alignDir)}>{t("common.city")}</Typography>,
                            gridSize: { xs: 12, sm: 3 }
                        },
                        {
                            content: <TextField
                                id="outlined-basic"
                                label=""
                                variant="outlined"
                                name="City"
                                value={addRecipientData.City}
                                className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                                autoComplete="off"
                                onChange={handleChange}
                            />,
                            gridSize: { xs: 12, sm: 9 }
                        }
                    ]}
                />

            },
            {
                content: <SimpleGrid
                    gridArr={[
                        {
                            content: <Typography title={t("common.state")} className={classes.alignDir}>{t("common.state")}</Typography>,
                            gridSize: { xs: 12, sm: 3 }
                        },
                        {
                            content: <TextField
                                id="outlined-basic"
                                label=""
                                variant="outlined"
                                name="State"
                                value={addRecipientData.State}
                                className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                                autoComplete="off"
                                onChange={handleChange}
                            />,
                            gridSize: { xs: 12, sm: 9 }
                        }
                    ]}
                />

            },
            {
                content: <SimpleGrid
                    gridArr={[
                        {
                            content: <Typography title={t("common.country")} className={clsx(classes.pl5, classes.pr10, classes.alignDir)}>{t("common.country")}</Typography>,
                            gridSize: { xs: 12, sm: 3 }
                        },
                        {
                            content: <TextField
                                id="outlined-basic"
                                label=""
                                variant="outlined"
                                name="Country"
                                value={addRecipientData.Country}
                                className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                                autoComplete="off"
                                onChange={handleChange}
                            />,
                            gridSize: { xs: 12, sm: 9 }
                        }
                    ]}
                />

            },
            {
                content: <SimpleGrid
                    gridArr={[
                        {
                            content: <Typography title={t("common.zip")} align="right" className={classes.alignDir}>{t("common.zip")}</Typography>,
                            gridSize: { xs: 12, sm: 3 }
                        },
                        {
                            content: <TextField
                                id="outlined-basic"
                                label=""
                                variant="outlined"
                                name="Zip"
                                value={addRecipientData.Zip}
                                className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                                autoComplete="off"
                                onChange={handleChange}
                            />,
                            gridSize: { xs: 12, sm: 9 }
                        }
                    ]}
                />

            }
            ]}
        />

        const MobileView = <SimpleGrid
            gridArr={[
                {
                    content: <TextField
                        id="outlined-basic"
                        label=""
                        placeholder={t("common.address")}
                        variant="outlined"
                        name="Address"
                        value={addRecipientData.Address}
                        className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                        autoComplete="off"
                        onChange={handleChange}
                    />
                },
                {
                    content: <TextField
                        id="outlined-basic"
                        label=""
                        placeholder={t("common.city")}
                        variant="outlined"
                        name="City"
                        value={addRecipientData.City}
                        className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                        autoComplete="off"
                        onChange={handleChange}
                    />
                },
                {
                    content: <TextField
                        id="outlined-basic"
                        label=""
                        placeholder={t("common.state")}
                        variant="outlined"
                        name="State"
                        value={addRecipientData.State}
                        className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                        autoComplete="off"
                        onChange={handleChange}
                    />
                },
                {
                    content: <TextField
                        id="outlined-basic"
                        label=""
                        placeholder={t("common.country")}
                        variant="outlined"
                        name="Country"
                        value={addRecipientData.Country}
                        className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                        autoComplete="off"
                        onChange={handleChange}
                    />
                },
                {
                    content: <TextField
                        id="outlined-basic"
                        label=""
                        placeholder={t("common.zip")}
                        variant="outlined"
                        name="Zip"
                        value={addRecipientData.Zip}
                        className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                        autoComplete="off"
                        onChange={handleChange}
                    />
                }
            ]}
        />
        return (windowSize === 'xs' ? MobileView : WebView)
    }

    const DATES_FORM = () => {

        const WebView = <SimpleGrid
            spacing={3}
            gridArr={[{
                content: <SimpleGrid
                    gridArr={[
                        {
                            content: <Typography title={t("common.birth_date")} align="right" className={classes.alignDir}>{t("common.birth_date")}</Typography>,
                            gridSize: { xs: 12, sm: 3 }
                        },
                        {
                            content: <Box className={localClasses.dateBox}>
                                <DateField
                                    name="BirthDate"
                                    classes={classes}
                                    value={addRecipientData.BirthDate}
                                    onChange={e => handleChange(e, { date: e, field: 'BirthDate' }, false)}
                                    toolbarDisabled={false}
                                />
                                {addRecipientData.BirthDate && <span className="resetDate"
                                    onClick={(e) => setAddRecipientData({ ...addRecipientData, BirthDate: null })}
                                ><IoMdClose /></span>}
                            </Box>,
                            gridSize: { xs: 12, sm: 9 }
                        }
                    ]}

                />
            },
            {
                content: <SimpleGrid
                    gridArr={[
                        {
                            content: <Typography title={t("common.reminder_date")} align="right" className={clsx(classes.pl5, classes.pr10, classes.alignDir)}>{t("common.reminder_date")}</Typography>,
                            gridSize: { xs: 12, sm: 3 }
                        },
                        {
                            content:
                                <Box className={localClasses.dateBox}>
                                    <DateField
                                        name="ReminderDate"
                                        classes={classes}
                                        value={addRecipientData.ReminderDate}
                                        onChange={e => handleChange(e, { date: e, field: 'ReminderDate' }, false)}
                                        toolbarDisabled={false}
                                    />
                                    {addRecipientData.ReminderDate && <span className="resetDate"
                                        onClick={(e) => setAddRecipientData({ ...addRecipientData, ReminderDate: null })}
                                    ><IoMdClose /></span>}
                                </Box>
                            ,
                            gridSize: { xs: 12, sm: 9 }
                        }
                    ]}
                />

            },
            ]}
        />

        const MobileView = <SimpleGrid
            gridArr={[
                {
                    content: <DateField
                        name="BirthDate"
                        classes={classes}
                        value={addRecipientData.BirthDate}
                        onChange={e => handleChange(e, { date: e, field: 'BirthDate' }, false)}
                        toolbarDisabled={false}
                    />
                },
                {
                    content: <DateField
                        name="ReminderDate"
                        classes={classes}
                        value={addRecipientData.ReminderDate}
                        onChange={e => handleChange(e, { date: e, field: 'ReminderDate' }, false)}
                        toolbarDisabled={false}
                    />
                }
            ]}

        />

        return (windowSize === 'xs' ? MobileView : WebView)
    }

    const EXTRA_DETAILS_FORM = () => {
        let temp = [];
        Object.keys(extraData).forEach((ed) => {
            temp.push({ key: ed, value: extraData[ed], order: ed.toLowerCase().indexOf('date') > -1 ? 100 : 0 });
        });
        temp = temp.sort((a, b) => { return a.order - b.order });
        let tempp = {};
        temp = temp.forEach((t) => {
            tempp[t.key] = t.value
        });
        let extraFields = Object.keys(replaceExtraFieldHeader(extraFieldsTemp, extraData));
        const json = windowSize === 'xs' ?
            extraFields.map((ef) => {
                return {
                    content: ef.toLowerCase().indexOf('date') > -1 ?
                        <Box className={localClasses.dateBox}>
                            <DateField
                                classes={classes}
                                value={accountExtraFields?.[ef] || addRecipientData?.[ef] || null}
                                onChange={e => handleChange(e, { date: e, field: ef }, true)}
                                toolbarDisabled={false}
                                removePadding
                            />
                            {accountExtraFields?.[ef] && <span className="resetDate"
                                onClick={(e) => setAccountExtraFields({ ...accountExtraFields, [ef]: null })}
                            ><IoMdClose /></span>}
                        </Box>

                        : <TextField
                            id="outlined-basic"
                            label=""
                            placeholder={extraFieldsTemp[ef]}
                            variant="outlined"
                            name={ef}
                            value={accountExtraFields?.[ef] || addRecipientData?.[ef] || ''}
                            className={clsx(classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                            autoComplete="off"
                            onChange={e => handleChange(e, null, true)}
                        />
                }
            })
            :
            extraFields.map((ef) => {
                return {
                    content: <SimpleGrid
                        gridArr={[
                            {
                                content: <Typography
                                    title={extraFieldsTemp[ef]}
                                    align="right"
                                    className={clsx(classes.pl5, classes.pr10, classes.textEllipses, classes.alignDir)}
                                >{extraFieldsTemp[ef]}</Typography>,
                                gridSize: { xs: 12, sm: 3 }
                            },
                            {
                                content: ef.toLowerCase().indexOf('date') > -1 ?
                                    <Box className={localClasses.dateBox}>
                                        <DateField
                                            classes={classes}
                                            value={accountExtraFields?.[ef] || addRecipientData?.[ef] || null}
                                            onChange={e => handleChange(e, { date: e, field: ef }, true)}
                                            toolbarDisabled={false}
                                        />
                                        {accountExtraFields?.[ef] && <span className="resetDate"
                                            onClick={(e) => setAccountExtraFields({ ...accountExtraFields, [ef]: null })}
                                        ><IoMdClose /></span>}
                                    </Box>
                                    : <TextField
                                        id="outlined-basic"
                                        label=""
                                        variant="outlined"
                                        name={ef}
                                        value={accountExtraFields?.[ef] || addRecipientData?.[ef] || ''}
                                        className={clsx(classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                                        autoComplete="off"
                                        onChange={e => handleChange(e, null, true)}
                                    />,
                                gridSize: { xs: 12, sm: 9 }
                            }
                        ]}

                    />
                };
            })

        return extraData && <SimpleGrid
            gridArr={json}
        />
    }

    const GROUPS_FORM = () => (
        <div className={classes.fullWidth}>
            <GroupTags
                classes={classes}
                title={'siteTracking.typeGroupName'}
                style={{ width: windowSize === 'xs' ? 320 : 460 }}
                dropdown
                dropDownProps={{
                    onChange: (e, val) => {
                        const idArr = val.reduce((prevVal, newVal) => [...prevVal, newVal.GroupID], [])
                        recipientData ? setSelectedLocalGroups(idArr) : selectGroup(idArr)
                        if (idArr.length > 0) {
                            setErrors({ ...errors, Groups: '' })
                        }
                    },
                    selectedGroups: recipientData ? selectedLocalGroups : selectedGroups
                }
                }
                error={errors.Groups}
                helperText={errors.Groups}
            />
        </div>)


    const handleEmailStatus = async (val) => {
        setLoader(true)
        let response = await dispatch(changeClientStatus({
            ClientID: recipientData.ClientID,
            StatusType: 1, // Email
            EmailStatus: val
        }))
        handleResponses(response, {
            S_201: {
                code: 201,
                message: ToastMessages.STATUS_UPDATED,
                Func: () => onAddRecipient()
            },
            S_400: {
                code: 400,
                message: ToastMessages.INVALID_CLIENT_ID,
                Func: () => null
            },
            S_401: {
                code: 401,
                message: ToastMessages.GROUP_INVALID_API,
                Func: () => null
            },
            S_404: {
                code: 405,
                message: ToastMessages.SOMETHING_WENT_WRONG,
                Func: () => null
            },
            default: {
                message: ToastMessages.GENERIC_ERROR,
                Func: () => null
            }
        }
        )
        setLoader(false)
    }

    const handleSmsStatus = async (val) => {
        setLoader(true)
        let response = await dispatch(changeClientStatus({
            ClientID: recipientData.ClientID,
            StatusType: 2, // Sms
            SmsStatus: val
        }))
        handleResponses(response, {
            S_201: {
                code: 201,
                message: ToastMessages.STATUS_UPDATED,
                Func: () => onAddRecipient()
            },
            S_400: {
                code: 400,
                message: ToastMessages.INVALID_CLIENT_ID,
                Func: () => null
            },
            S_401: {
                code: 401,
                message: ToastMessages.GROUP_INVALID_API,
                Func: () => null
            },
            S_404: {
                code: 405,
                message: ToastMessages.SOMETHING_WENT_WRONG,
                Func: () => null
            },
            default: {
                message: ToastMessages.GENERIC_ERROR,
                Func: () => null
            }
        }
        )
        setLoader(false)
    }

    const STATUS_FORM = () => (
        <SimpleGrid
            spacing={3}
            gridArr={[
                {
                    content: <SimpleGrid
                        spacing={3}
                        gridArr={[
                            {

                                content: <Typography title={t("common.first_name")} className={classes.alignDir}>{t('common.emailStatus')}</Typography>,
                                gridSize: { xs: 12, sm: 3 }

                            },
                            {

                                content: StatusDropdown({
                                    data: Object.values(CLIENT_CONSTANTS.STATUSES).map((obj) => obj),
                                    onSelect: (val) => {
                                        handleEmailStatus(val)
                                    },
                                    value: addRecipientData.Status ?? CLIENT_CONSTANTS.STATUSES.active.status,
                                    label: t('common.emailStatus')
                                }),
                                gridSize: { xs: 12, sm: 9 }

                            }
                        ]}
                    />,
                    gridSize: { xs: 12, sm: 6 }
                },
                {
                    content: <SimpleGrid
                        spacing={3}
                        gridArr={[
                            {

                                content: <Typography title={t("common.first_name")} className={classes.alignDir}>{t('common.smsStatus')}</Typography>,
                                gridSize: { xs: 12, sm: 3 },

                            },
                            {
                                content: StatusDropdown({
                                    data: Object.values(CLIENT_CONSTANTS.SMS_STATUSES).map((obj) => obj),
                                    onSelect: (val) => {
                                        handleSmsStatus(val)

                                    },
                                    value: addRecipientData.SmsStatus ?? CLIENT_CONSTANTS.SMS_STATUSES.noStatus.status,
                                    label: t('common.smsStatus'),
                                }),
                                gridSize: { xs: 12, sm: 6 }
                            }
                        ]}
                    />,
                    gridSize: { xs: 12, sm: 6 }
                },
            ]}
        />
    )

    const ActiveForm = (label, index) => {
        return (
            <Accordion
                expanded={activeTab === index}
                className={clsx(classes.noBoxShadow, localClasses.expandedBox)}
                key={index}
            >
                <AccordionSummary
                    expandIcon={""}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    onClick={() => {
                        setActiveTab(index)
                    }}

                >
                    <Box className={clsx(classes.mb5, classes.fullWidth)}>
                        <Typography align="left" className={clsx(classes.font18, classes.bold)}>{t(label)}
                            {
                                activeTab !== index && <GrFormAdd size={26} className={localClasses.accordionIcons} />
                            }
                        </Typography>
                        <Box style={{ padding: '5px 5px 10px 0px' }}>
                            <Divider />
                        </Box>
                    </Box>

                </AccordionSummary>

                <AccordionDetails>
                    {index === 0 && PERSONAL_DETAILS_FORM()}
                    {index === 1 && LOCATION_DETAILS_FORM()}
                    {index === 2 && DATES_FORM()}
                    {index === 3 && EXTRA_DETAILS_FORM()}
                    {index === 4 && GROUPS_FORM()}
                </AccordionDetails>
            </Accordion>
        )
    }


    return (
        <Dialog
            classes={classes}
            open={isOpen}
            title={recipientData ? t('recipient.recipientEditPopUpTitle') : t('recipient.recipientAddPopUpTitle')}
            icon={<div className={classes.dialogIconContent}>
                {'\uE0D5'}
            </div>}
            showDivider={true}
            onClose={onClose}
            onCancel={onClose}
            onConfirm={handleSubmit}
            reduceTitle
            style={{ minWidth: 240 }}
            renderButtons={() => (
                <div>
                    {recipientData && <Box style={{ paddingInline: '5%' }} container spacing={2} className={clsx(classes.responsiveLinePadding, classes.mxAuto, classes.justifyCenterOfCenter, classes.flexWrap,)}>
                        {STATUS_FORM()}
                    </Box>}

                    <Box container spacing={2} className={clsx(classes.responsiveLinePadding, classes.maxWidth540, classes.mxAuto, classes.justifyCenterOfCenter, classes.flexWrap, classes.pt0, classes.pb0)}>
                        <Box
                            item
                            xs={windowSize === "xs" && 12}
                            sm={4}
                            md={4}
                            className={clsx(classes.txtCenter, classes.mt5)}
                        >
                            <Button
                                variant="contained"
                                size="medium"
                                className={clsx(
                                    classes.dialogButton,
                                    classes.dialogButtonResponive,
                                    classes.dialogCancelButton
                                )}
                                onClick={onClose}
                            >
                                {t("group.cancel")}
                            </Button>
                        </Box>
                        <Box
                            item
                            xs={windowSize === "xs" && 12}
                            sm={4}
                            md={4}
                            className={clsx(classes.txtCenter, classes.mt5)}
                        >
                            <Button
                                variant="contained"
                                size="medium"
                                className={clsx(
                                    classes.dialogButton,
                                    classes.dialogButtonResponive,
                                    classes.dialogConfirmButton,
                                    classes.textCapitalize
                                )}

                                onClick={() => handleSubmit(onClose)}
                            >
                                {t("group.ok")}
                            </Button>
                        </Box>
                        {!recipientData && windowSize !== "xs" && <Box
                            item
                            xs={windowSize === "xs" && 12}
                            sm={4}
                            md={4}
                            className={clsx(classes.txtCenter, classes.mt5, classes.maxContent)}
                        >
                            <Button
                                variant="contained"
                                size="medium"
                                className={clsx(
                                    classes.maxContent,
                                    classes.dialogButton,
                                    classes.dialogButtonResponive,
                                    classes.dialogConfirmButton
                                )}
                                onClick={() => handleSubmit(() => {
                                    setAccountExtraFields(null)
                                    setAddRecipientData(DEFAULT_RECIPIENT_DATA)
                                })}
                            >
                                {t("recipient.addAnotherRecipient")}
                            </Button>
                        </Box>}

                    </Box>
                </div>
            )}
            customContainerStyle=""
            cancelText="common.Cancel"
            confirmText="common.Ok"
        >
            <Box className={clsx(localClasses.contentBox, classes.mt10)}>
                {
                    ADD_RECIPIENT_TABS.map((label, index) => ActiveForm(label, index))
                }
            </Box>
            <Loader isOpen={showLaoder} />
        </Dialog>
    );
};

export default AddRecipientPopup;