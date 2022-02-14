import React, { useState, useEffect } from 'react';
import DefaultScreen from '../../DefaultScreen'
import clsx from 'clsx';
import {
    Typography, Divider, Table, TableBody, TableRow, TableHead, TableCell, TableContainer,
    Grid, Button, TextField, Box, List, ListItem, ListItemAvatar, Avatar, ListItemText, ListItemSecondaryAction, Checkbox, FormControlLabel
} from '@material-ui/core'
import {
    AutomationIcon, DeleteIcon, DuplicateIcon, EditIcon, SendGreenIcon, SearchIcon,
    GroupsIcon, PreviewIcon, ExportIcon
} from '../../../assets/images/managment/index'
import { CSVLink } from 'react-csv'
import {
    TablePagination, ManagmentIcon, DateField, Dialog, SearchField, RestorDialogContent
} from '../../../components/managment/index'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import {
    getSmsData, restoreSms, deleteSms, duplicteSms, getSmsAuthorizationData, getAuthorizeNumbers, sendVerificationCode, verifyCode, getSmsByID
} from '../../../redux/reducers/smsSlice'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import ClearIcon from '@material-ui/icons/Clear'
import moment from 'moment'
import 'moment/locale/he'
import { Preview } from '../../../components/Notifications/Preview/Preview';
import { pulseemNewTab } from '../../../helpers/functions';
import { Loader } from '../../../components/Loader/Loader';
import { setRowsPerPage } from '../../../redux/reducers/coreSlice';
import { setCookie } from '../../../helpers/cookies';
import CustomTooltip from '../../../components/Tooltip/CustomTooltip';
import DataTable from '../../../components/Table/DataTable';
import NameValueGridStructure from '../../../components/Grids/NameValueGridStructure';
import IconWrapper from '../../../components/icons/IconWrapper';
import FlexGrid from '../../../components/Grids/FlexGrid';

const StaticData = [
    {
        "ActiveCell": 411,
        "ActiveEmails": 275,
        "DynamicData": null,
        "DynamicLastUpdate": null,
        "DynamicUpdatePolicy": null,
        "GroupID": 842297,
        "InvalidCell": 850,
        "InvalidEmails": 641,
        "IsDynamic": true,
        "IsTestGroup": null,
        "PendingEmails": 256,
        "Recipients": 917,
        "RemovedCell": 132,
        "RemovedEmails": 102,
        "RestrictedEmails": 454,
        "SubAccountID": 852,
        "TotalRecipients": 123,
        "GroupName": "Mayo Kim",
        "UpdatedDate": "2018-09-22T03:29:28 -06:-30",
        "CreatedDate": "2020-03-30T07:49:24 -06:-30"
    },
    {
        "ActiveCell": 517,
        "ActiveEmails": 651,
        "DynamicData": null,
        "DynamicLastUpdate": null,
        "DynamicUpdatePolicy": null,
        "GroupID": 448132,
        "InvalidCell": 955,
        "InvalidEmails": 407,
        "IsDynamic": false,
        "IsTestGroup": null,
        "PendingEmails": 357,
        "Recipients": 534,
        "RemovedCell": 838,
        "RemovedEmails": 571,
        "RestrictedEmails": 688,
        "SubAccountID": 99,
        "TotalRecipients": 528,
        "GroupName": "Barbra Lopez",
        "UpdatedDate": "2016-04-09T04:46:31 -06:-30",
        "CreatedDate": "2015-05-31T05:05:56 -06:-30"
    },
    {
        "ActiveCell": 872,
        "ActiveEmails": 794,
        "DynamicData": null,
        "DynamicLastUpdate": null,
        "DynamicUpdatePolicy": null,
        "GroupID": 715956,
        "InvalidCell": 831,
        "InvalidEmails": 556,
        "IsDynamic": true,
        "IsTestGroup": null,
        "PendingEmails": 694,
        "Recipients": 605,
        "RemovedCell": 625,
        "RemovedEmails": 776,
        "RestrictedEmails": 598,
        "SubAccountID": 48,
        "TotalRecipients": 198,
        "GroupName": "Mejia Mills",
        "UpdatedDate": "2021-08-17T01:33:28 -06:-30",
        "CreatedDate": "2018-09-03T11:43:00 -06:-30"
    },
    {
        "ActiveCell": 200,
        "ActiveEmails": 583,
        "DynamicData": null,
        "DynamicLastUpdate": null,
        "DynamicUpdatePolicy": null,
        "GroupID": 827193,
        "InvalidCell": 142,
        "InvalidEmails": 381,
        "IsDynamic": true,
        "IsTestGroup": null,
        "PendingEmails": 666,
        "Recipients": 17,
        "RemovedCell": 340,
        "RemovedEmails": 949,
        "RestrictedEmails": 934,
        "SubAccountID": 170,
        "TotalRecipients": 304,
        "GroupName": "Mcmillan Jenkins",
        "UpdatedDate": "2018-02-11T11:03:51 -06:-30",
        "CreatedDate": "2022-02-06T04:02:39 -06:-30"
    },
    {
        "ActiveCell": 884,
        "ActiveEmails": 512,
        "DynamicData": null,
        "DynamicLastUpdate": null,
        "DynamicUpdatePolicy": null,
        "GroupID": 451184,
        "InvalidCell": 940,
        "InvalidEmails": 446,
        "IsDynamic": true,
        "IsTestGroup": null,
        "PendingEmails": 179,
        "Recipients": 379,
        "RemovedCell": 430,
        "RemovedEmails": 156,
        "RestrictedEmails": 780,
        "SubAccountID": 7,
        "TotalRecipients": 621,
        "GroupName": "Bray Bell",
        "UpdatedDate": "2014-08-10T08:30:25 -06:-30",
        "CreatedDate": "2014-11-10T02:20:12 -06:-30"
    },
    {
        "ActiveCell": 183,
        "ActiveEmails": 493,
        "DynamicData": null,
        "DynamicLastUpdate": null,
        "DynamicUpdatePolicy": null,
        "GroupID": 936792,
        "InvalidCell": 66,
        "InvalidEmails": 279,
        "IsDynamic": true,
        "IsTestGroup": null,
        "PendingEmails": 706,
        "Recipients": 365,
        "RemovedCell": 479,
        "RemovedEmails": 419,
        "RestrictedEmails": 266,
        "SubAccountID": 450,
        "TotalRecipients": 395,
        "GroupName": "Brown Banks",
        "UpdatedDate": "2019-04-19T08:28:11 -06:-30",
        "CreatedDate": "2021-08-01T09:32:40 -06:-30"
    },
    {
        "ActiveCell": 457,
        "ActiveEmails": 827,
        "DynamicData": null,
        "DynamicLastUpdate": null,
        "DynamicUpdatePolicy": null,
        "GroupID": 182670,
        "InvalidCell": 530,
        "InvalidEmails": 193,
        "IsDynamic": false,
        "IsTestGroup": null,
        "PendingEmails": 671,
        "Recipients": 469,
        "RemovedCell": 154,
        "RemovedEmails": 736,
        "RestrictedEmails": 756,
        "SubAccountID": 525,
        "TotalRecipients": 52,
        "GroupName": "Opal Case",
        "UpdatedDate": "2018-05-31T07:25:09 -06:-30",
        "CreatedDate": "2018-06-08T06:18:53 -06:-30"
    },
    {
        "ActiveCell": 650,
        "ActiveEmails": 565,
        "DynamicData": null,
        "DynamicLastUpdate": null,
        "DynamicUpdatePolicy": null,
        "GroupID": 983492,
        "InvalidCell": 21,
        "InvalidEmails": 90,
        "IsDynamic": true,
        "IsTestGroup": null,
        "PendingEmails": 753,
        "Recipients": 875,
        "RemovedCell": 19,
        "RemovedEmails": 71,
        "RestrictedEmails": 843,
        "SubAccountID": 429,
        "TotalRecipients": 74,
        "GroupName": "Cohen Mccarthy",
        "UpdatedDate": "2018-08-09T02:50:28 -06:-30",
        "CreatedDate": "2017-05-31T03:45:47 -06:-30"
    },
    {
        "ActiveCell": 275,
        "ActiveEmails": 577,
        "DynamicData": null,
        "DynamicLastUpdate": null,
        "DynamicUpdatePolicy": null,
        "GroupID": 324693,
        "InvalidCell": 274,
        "InvalidEmails": 833,
        "IsDynamic": false,
        "IsTestGroup": null,
        "PendingEmails": 316,
        "Recipients": 275,
        "RemovedCell": 829,
        "RemovedEmails": 633,
        "RestrictedEmails": 382,
        "SubAccountID": 598,
        "TotalRecipients": 32,
        "GroupName": "Silva Holloway",
        "UpdatedDate": "2015-09-14T02:37:55 -06:-30",
        "CreatedDate": "2016-03-29T04:05:44 -06:-30"
    },
    {
        "ActiveCell": 452,
        "ActiveEmails": 204,
        "DynamicData": null,
        "DynamicLastUpdate": null,
        "DynamicUpdatePolicy": null,
        "GroupID": 652985,
        "InvalidCell": 374,
        "InvalidEmails": 264,
        "IsDynamic": true,
        "IsTestGroup": null,
        "PendingEmails": 260,
        "Recipients": 652,
        "RemovedCell": 200,
        "RemovedEmails": 425,
        "RestrictedEmails": 517,
        "SubAccountID": 715,
        "TotalRecipients": 382,
        "GroupName": "Kristine Ramirez",
        "UpdatedDate": "2019-10-29T01:08:52 -06:-30",
        "CreatedDate": "2015-11-22T04:09:21 -06:-30"
    },
    {
        "ActiveCell": 664,
        "ActiveEmails": 301,
        "DynamicData": null,
        "DynamicLastUpdate": null,
        "DynamicUpdatePolicy": null,
        "GroupID": 114051,
        "InvalidCell": 567,
        "InvalidEmails": 518,
        "IsDynamic": false,
        "IsTestGroup": null,
        "PendingEmails": 844,
        "Recipients": 999,
        "RemovedCell": 114,
        "RemovedEmails": 822,
        "RestrictedEmails": 790,
        "SubAccountID": 428,
        "TotalRecipients": 857,
        "GroupName": "Concepcion Sanford",
        "UpdatedDate": "2016-07-21T11:35:21 -06:-30",
        "CreatedDate": "2022-01-08T11:45:33 -06:-30"
    },
    {
        "ActiveCell": 287,
        "ActiveEmails": 442,
        "DynamicData": null,
        "DynamicLastUpdate": null,
        "DynamicUpdatePolicy": null,
        "GroupID": 602466,
        "InvalidCell": 499,
        "InvalidEmails": 188,
        "IsDynamic": true,
        "IsTestGroup": null,
        "PendingEmails": 189,
        "Recipients": 484,
        "RemovedCell": 648,
        "RemovedEmails": 54,
        "RestrictedEmails": 963,
        "SubAccountID": 253,
        "TotalRecipients": 957,
        "GroupName": "Hickman Bentley",
        "UpdatedDate": "2017-08-09T12:25:55 -06:-30",
        "CreatedDate": "2019-12-16T04:13:49 -06:-30"
    },
    {
        "ActiveCell": 816,
        "ActiveEmails": 645,
        "DynamicData": null,
        "DynamicLastUpdate": null,
        "DynamicUpdatePolicy": null,
        "GroupID": 188716,
        "InvalidCell": 894,
        "InvalidEmails": 151,
        "IsDynamic": true,
        "IsTestGroup": null,
        "PendingEmails": 760,
        "Recipients": 939,
        "RemovedCell": 138,
        "RemovedEmails": 107,
        "RestrictedEmails": 583,
        "SubAccountID": 585,
        "TotalRecipients": 88,
        "GroupName": "Leta Williamson",
        "UpdatedDate": "2016-07-25T03:25:25 -06:-30",
        "CreatedDate": "2018-04-15T10:52:01 -06:-30"
    },
    {
        "ActiveCell": 628,
        "ActiveEmails": 422,
        "DynamicData": null,
        "DynamicLastUpdate": null,
        "DynamicUpdatePolicy": null,
        "GroupID": 937434,
        "InvalidCell": 875,
        "InvalidEmails": 55,
        "IsDynamic": false,
        "IsTestGroup": null,
        "PendingEmails": 119,
        "Recipients": 456,
        "RemovedCell": 562,
        "RemovedEmails": 389,
        "RestrictedEmails": 940,
        "SubAccountID": 219,
        "TotalRecipients": 385,
        "GroupName": "Guerrero Parrish",
        "UpdatedDate": "2019-10-11T01:46:25 -06:-30",
        "CreatedDate": "2021-03-20T10:37:11 -06:-30"
    },
    {
        "ActiveCell": 126,
        "ActiveEmails": 629,
        "DynamicData": null,
        "DynamicLastUpdate": null,
        "DynamicUpdatePolicy": null,
        "GroupID": 825098,
        "InvalidCell": 968,
        "InvalidEmails": 679,
        "IsDynamic": false,
        "IsTestGroup": null,
        "PendingEmails": 874,
        "Recipients": 148,
        "RemovedCell": 678,
        "RemovedEmails": 477,
        "RestrictedEmails": 913,
        "SubAccountID": 963,
        "TotalRecipients": 875,
        "GroupName": "Avila Ross",
        "UpdatedDate": "2020-09-24T12:50:32 -06:-30",
        "CreatedDate": "2019-07-29T10:14:37 -06:-30"
    },
    {
        "ActiveCell": 676,
        "ActiveEmails": 473,
        "DynamicData": null,
        "DynamicLastUpdate": null,
        "DynamicUpdatePolicy": null,
        "GroupID": 920988,
        "InvalidCell": 839,
        "InvalidEmails": 763,
        "IsDynamic": true,
        "IsTestGroup": null,
        "PendingEmails": 416,
        "Recipients": 32,
        "RemovedCell": 451,
        "RemovedEmails": 920,
        "RestrictedEmails": 24,
        "SubAccountID": 570,
        "TotalRecipients": 996,
        "GroupName": "Nicole Haney",
        "UpdatedDate": "2014-06-24T02:46:45 -06:-30",
        "CreatedDate": "2020-06-01T08:02:50 -06:-30"
    }
]

const GroupsManagement = ({ classes }) => {
    const { language, windowSize, email, phone, rowsPerPage, smsOldVersion, isRTL } = useSelector(state => state.core)
    const { smsData, smsDataError, smsDeletedData, authorizationData } = useSelector(state => state.sms)
    const { username } = useSelector(state => state.user)
    const { t } = useTranslation()
    const [filteredData, setFilteredData] = useState([])
    const [selectedGroups, setSelectedGroups] = useState([])
    const [searchStr, setSearchStr] = useState('');
    const [filter, setFilter] = useState(false);
    const [fromDate, handleFromDate] = useState(null);
    const [toDate, handleToDate] = useState(null);
    const [number, handleNumber] = useState('');
    const [numberError, handleNumberError] = useState(false);
    const [verificationCode, handleVerificationCodeInput] = useState('');
    const [verificationCodeError, handleVerificationCodeError] = useState(false);
    const [groupNameSearch, setGroupNameSearch] = useState('')
    const rowsOptions = [6, 10, 20, 50]
    const [page, setPage] = useState(1)
    const [isSearching, setSearching] = useState(false)
    const [searchResults, setSearchResults] = useState(null)
    const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot }
    const cellStyle = { head: classes.tableCellHead, body: classes.tableCellBody, root: classes.tableCellRoot }
    const [dialogType, setDialogType] = useState(null)
    const [restoreArray, setRestoreArray] = useState([])
    const [showLoader, setLoader] = useState(true);
    const dateFormat = 'YYYY-MM-DD HH:mm:ss.FFF'
    const dispatch = useDispatch()
    moment.locale(language)

    const colorTextStyle = {
        red: classes.textColorRed,
        blue: classes.textColorBlue,
        green: classes.sendIconText
    }


    const HeaderCheck = (label) => <FormControlLabel
        label={label}
        control={
            <Checkbox
                checked={selectedGroups.length === filteredData.length}
                // indeterminate={}
                onClick={() => {
                    if (selectedGroups.length === filteredData.length) {
                        return setSelectedGroups([])
                    }
                    const allGroups = filteredData.reduce((previous, current) => [...previous, current.GroupID], [])
                    setSelectedGroups(allGroups)
                }
                }
            />
        }
    />


    const TABLE_HEAD = [
        { label: HeaderCheck(''), align: 'center' },
        { label: t("common.GroupName"), classes: cellStyle, className: classes.flex2, align: 'center' },
        { label: t("recipient.emails"), classes: cellStyle, className: classes.flex2, align: 'center' },
        { label: t('recipient.sms/mms'), classes: cellStyle, className: classes.flex2, align: 'center' },
        { label: '', classes: cellStyle, className: classes.flex3, align: 'center' },
    ]

    const getData = async () => {
        await dispatch(getSmsData())
        setLoader(false);
    }

    useEffect(() => {
        // setLoader(true);
        // getData();
        handleSearch(searchStr);
    }, [dispatch])

    const handleSearch = (values) => {
        const data = StaticData; //TODO: Replace StaticData from Data from redux
        const result = data.filter((obj) => obj.GroupName.includes(values))
        setFilteredData(result);
        console.log("RESULT:", result)
        setPage(1);
    }

    const handleSelected = (id) => {
        const index = selectedGroups.indexOf(id)
        if (index !== -1) {
            let temp = [...selectedGroups]
            temp.splice(index, 1)
            setSelectedGroups([...temp])
            // setSelectedGroups(temp)
        }
        else
            setSelectedGroups([...selectedGroups, id])
    }

    const renderHeader = () => {
        return (
            <>
                <Typography className={classes.managementTitle}>
                    {t('recipient.PageResource1.Title')}
                </Typography>
                <Divider />
            </>
        )
    }

    const clearSearch = () => {
        setGroupNameSearch('')
        handleFromDate(null)
        handleToDate(null)
        setSearchResults(null)
        setSearching(false)
    }
    // DONE
    const renderSearchLine = () => {
        const handleKeyDown = (event) => {
            if (event.keyCode === 13 || event.code === 'Enter') {
                handleSearch();
            }
        }

        const handleKeyPress = (e) => {
            if (e.charCode === 13 || e.code === "Enter") {
                handleSearch()
            }
        }

        const handleGroupNameChange = event => {
            setGroupNameSearch(event.target.value)
        }

        if (windowSize === 'xs') {
            return (
                <SearchField
                    classes={classes}
                    value={searchStr}
                    onChange={(e) => setSearchStr(e.target.value)}
                    onClick={handleSearch}
                    onKeyPress={handleKeyPress}
                    placeholder={t('common.CampaignName')}
                />
            )
        }

        return (
            <Grid container spacing={2} className={classes.lineTopMarging}>
                <Grid item>
                    <TextField
                        variant='outlined'
                        size='small'
                        value={searchStr}
                        onKeyPress={handleKeyDown}
                        onChange={(e) => setSearchStr(e.target.value)}
                        className={clsx(classes.textField, classes.minWidth252)}
                        placeholder={t('common.GroupName')}
                    />
                </Grid>
                <Grid item>
                    <Button
                        size='large'
                        variant='contained'
                        onClick={() => {
                            handleSearch(searchStr)
                            setFilter(true)
                        }}
                        className={classes.searchButton}
                        endIcon={<SearchIcon />}>
                        {t('campaigns.btnSearchResource1.Text')}
                    </Button>
                </Grid>
                {searchStr && <Grid item>
                    <Button
                        size='large'
                        variant='contained'
                        onClick={() => {
                            setSearchStr('')
                            if (filter) {
                                handleSearch('')
                                setFilter(false)
                            }
                        }}
                        className={classes.searchButton}
                        endIcon={<ClearIcon />}>
                        {t('common.clear')}
                    </Button>
                </Grid>}
            </Grid>
        )
    }

    const renderManagmentLine = () => {
        const handleVerificationDialog = async () => {
            const numbers = await dispatch(getAuthorizeNumbers());
            setDialogType({
                type: 'verify',
                data: numbers.payload
            })
        }
        return (
            <Grid container spacing={2} className={classes.linePadding} >
                <Grid item xs={windowSize === 'xs' && 12}>
                    <Button
                        variant='contained'
                        size='medium'
                        href={smsOldVersion === "true" ? `/Pulseem/SMSCampaignEdit.aspx?OldVersion=true&Culture=${isRTL ? 'he-IL' : 'en-US'}` : "/react/sms/create"}
                        className={clsx(
                            classes.actionButton,
                            classes.actionButtonLightGreen
                        )}>
                        {t('group.new')}
                    </Button>
                </Grid>

                {windowSize !== 'xs' && <Grid item>
                    <Button
                        variant='contained'
                        size='medium'
                        className={clsx(
                            classes.actionButton,
                            classes.actionButtonRed
                        )}
                        onClick={() => setDialogType({
                            type: 'restore',
                            data: smsDeletedData
                        })}>
                        {t('group.delete')}
                    </Button>
                </Grid>}
                <Grid item xs={windowSize === 'xs' && 12}>
                    <Button
                        variant='contained'
                        size='medium'
                        href={smsOldVersion === "true" ? `/Pulseem/SMSCampaignEdit.aspx?OldVersion=true&Culture=${isRTL ? 'he-IL' : 'en-US'}` : "/react/sms/create"}
                        className={clsx(
                            classes.actionButton,
                            classes.actionButtonRed
                        )}>
                        {t('recipient.delete')}
                    </Button>
                </Grid>
                <Grid item xs={windowSize === 'xs' && 12}>
                    <Button
                        variant='contained'
                        size='medium'
                        href={smsOldVersion === "true" ? `/Pulseem/SMSCampaignEdit.aspx?OldVersion=true&Culture=${isRTL ? 'he-IL' : 'en-US'}` : "/react/sms/create"}
                        className={clsx(
                            classes.actionButton,
                            classes.actionButtonLightGreen
                        )}>
                        {t('recipient.unsubscribe')}
                    </Button>
                </Grid>
                {/* <Grid item xs={windowSize === 'xs' && 12}> */}
                <Grid item xs={windowSize === 'xs' && 12}>
                    <Button
                        variant='contained'
                        size='medium'
                        className={clsx(
                            classes.actionButton,
                            classes.actionButtonGreen,
                            //   smsReport.length > 0 ? null : classes.disabled
                        )}
                        // onClick={handleDownloadCsv}
                        onClick={() => true}
                        startIcon={<ExportIcon />}>
                        {t('campaigns.exportFile')}
                    </Button>
                    <CSVLink
                        // data={csvData ?? null}
                        data={[
                            ["firstname", "lastname", "email"],
                            ["Ahmed", "Tomi", "ah@smthing.co.com"],
                            ["Raed", "Labes", "rl@smthing.co.com"],
                            ["Yezzi", "Min l3b", "ymin@cocococo.com"]
                        ]}
                        filename='report.csv'
                        className='hidden'
                        // ref={csvLinkRef ?? null}
                        ref={null}
                        target='_blank'
                    />
                </Grid>
                {/* </Grid> */}

                <Grid item xs={windowSize === 'xs' && 12} className={classes.groupsLableContainer} >
                    <Typography className={classes.groupsLable}>
                        {`${filteredData.length} ${t('mms.campaigns')}`}
                    </Typography>
                </Grid>
            </Grid>
        )
    }

    const renderTableHead = () => {
        return (
            <TableHead>
                <TableRow classes={rowStyle}>
                    <TableCell classes={cellStyle} className={classes.flex3} align='center'>{t("sms.GridBoundColumnResource2.HeaderText")}</TableCell>
                    <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("campaigns.recipients")}</TableCell>
                    <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("sms.CreditsResource1.HeaderText")}</TableCell>
                    <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("sms.StatusResource1.HeaderText")}</TableCell>
                    <TableCell classes={{ root: classes.tableCellRoot }} className={classes.flex5} ></TableCell>
                </TableRow>
            </TableHead>
        )
    }

    const renderCellIcons = (row) => {
        const { Status, Groups, AutomationID, Id, AutomationTriggerInActive } = row

        const iconsMap = [
            {
                key: 'send',
                icon: SendGreenIcon,
                lable: t('campaigns.imgSendResource1.ToolTip'),
                remove: Status !== 1 || (AutomationID !== 0 && AutomationTriggerInActive === false),
                rootClass: classes.sendIcon,
                textClass: classes.sendIconText,
                href: smsOldVersion === "true" ? `/Pulseem/SendSMSCampaign.aspx?SMSCampaignID=${Id}&Culture=${isRTL ? 'he-IL' : 'en-US'}` : `/react/sms/send/${Id}`
            },
            {
                key: 'preview',
                icon: PreviewIcon,
                lable: t('campaigns.Image1Resource1.ToolTip'),
                remove: windowSize === 'xs',
                rootClass: classes.paddingIcon,
                onClick: async () => {
                    const sms = await dispatch(getSmsByID(Id));
                    setDialogType({
                        type: 'preview',
                        data: sms.payload
                    })
                }
            },
            {
                key: 'edit',
                icon: EditIcon,
                disable: Status !== 1 || AutomationID !== 0,
                lable: t('campaigns.Image2Resource1.ToolTip'),
                href: smsOldVersion === "true" ? `/Pulseem/SMSCampaignEdit.aspx?SMSCampaignID=${Id}&Culture=${isRTL ? 'he-IL' : 'en-US'}` : `/react/sms/edit/${Id}`,
                rootClass: classes.paddingIcon
            },
            {
                key: 'duplicate',
                icon: DuplicateIcon,
                lable: t('campaigns.lnkEditResource1.ToolTip'),
                rootClass: classes.paddingIcon,
                onClick: () => {
                    setDialogType({
                        type: 'duplicate',
                        data: Id
                    })
                }
            },
            {
                key: 'groups',
                icon: GroupsIcon,
                disable: Groups && Groups.length === 0,
                lable: t('campaigns.lnkPreviewResource1.ToolTip'),
                remove: windowSize === 'xs',
                rootClass: classes.paddingIcon,
                onClick: () => {
                    setDialogType({
                        type: 'groups',
                        data: row.Groups
                    })
                }
            },
            {
                key: 'automation',
                icon: AutomationIcon,
                disable: AutomationID === 0,
                lable: t('campaigns.automation'),
                remove: windowSize === 'xs',
                onClick: () => {
                    pulseemNewTab(`CreateAutomations.aspx?Mode=show&AutomationID=${AutomationID}&fromreact=true`)
                },
                rootClass: classes.paddingIcon,
            },
            {
                key: 'delete',
                icon: DeleteIcon,
                lable: t('campaigns.DeleteResource1.HeaderText'),
                showPhone: true,
                disable: AutomationID !== 0,
                rootClass: classes.paddingIcon,
                onClick: () => {
                    setDialogType({
                        type: 'delete',
                        data: Id
                    })
                }
            }
        ]
        return (
            <Grid
                container
                direction='row'
                justifyContent={windowSize === 'xs' ? 'flex-start' : 'flex-end'}>
                {iconsMap.map(icon => (
                    <Grid
                        className={icon.disable && classes.disabledCursor}
                        key={icon.key}
                        item >
                        <ManagmentIcon
                            classes={classes}
                            {...icon}
                        />
                    </Grid>
                ))}
            </Grid>
        )
    }

    const renderStatusCell = (status) => {
        const statuses = {
            1: 'common.Created',
            2: 'common.Sending',
            3: 'campaigns.Stopped',
            4: 'common.Sent',
            5: 'campaigns.Canceled',
            6: 'campaigns.Optin',
            7: 'campaigns.Approve'
        }
        return (
            <>
                <Typography className={clsx(
                    classes.middleText,
                    classes.recipientsStatus,
                    {
                        [classes.recipientsStatusCreated]: status === 1,
                        [classes.recipientsStatusSent]: status === 4,
                        [classes.recipientsStatusSending]: status === 2,
                        [classes.recipientsStatusCanceled]: status === 5
                    }
                )}>
                    {t(statuses[status])}
                </Typography>
            </>
        )
    }

    const renderRecipientsCell = (recipients) => {
        return (
            <>
                <Typography className={classes.middleText}>
                    {recipients.toLocaleString()}
                </Typography>
                <Typography className={classes.middleText}>
                    {t("campaigns.recipients")}
                </Typography>
            </>
        )
    }

    const renderMessagesCell = (messages) => {
        return (
            <>
                <Typography className={classes.middleText}>
                    {messages.toLocaleString()}
                </Typography>
                <Typography className={classes.middleText}>
                    {t("sms.CreditsResource1.HeaderText")}
                </Typography>
            </>
        )
    }

    const handleRowsPerPageChange = (val) => {
        dispatch(setRowsPerPage(val))
        setCookie('rpp', val, { maxAge: 2147483647 })
    }

    const handleChange = (Id) => () => {
        const found = restoreArray.includes(Id)
        if (found) {
            setRestoreArray(restoreArray.filter(restore => restore !== Id))
        } else {
            setRestoreArray([...restoreArray, Id])
        }
    }

    const handleShortVerify = async (number) => {
        handleVerificationCodeInput('');
        handleNumber(number)
        setDialogType({
            type: 'shortVerify',
            data: number
        });
    }

    const handleSendVerificationCode = async () => {
        const value = (dialogType && dialogType.type === 'shortVerify' && dialogType.data) ? dialogType.data : number;
        if (!value || value.length < 10) {
            handleNumberError(true);
            return
        }
        const result = await dispatch(sendVerificationCode({ username, number: value }));

        if (!result.error) {
            setDialogType({
                type: 'verificationSent',
                data: value
            })
        }
    }

    const handleConfirmCode = async () => {
        const result = await dispatch(verifyCode({
            optinCode: verificationCode,
            phoneNumber: number
        }));
        if (result.error || result.payload === 'NotMatch') {
            handleVerificationCodeError(true);
        } else {
            setDialogType({
                type: 'verificationSuccess',
                data: {}
            });
        }
    }

    const handleClose = () => {
        setDialogType(null);
        handleVerificationCodeError(false);
        handleNumberError(false);
        handleNumber('');
        handleVerificationCodeInput('');
    }

    const getRestorDialog = (data = []) => {
        if (!data || !Array.isArray(data)) return null
        return {
            title: t('sms.restoreCampaignTitle'),
            showDivider: false,
            icon: (
                <div className={classes.dialogIconContent}>
                    {'\uE185'}
                </div>
            ),
            content: (
                <RestorDialogContent
                    classes={classes}
                    data={data}
                    currentChecked={restoreArray}
                    onChange={handleChange}
                    dataIdVar='Id'
                />
            ),
            onConfirm: async () => {
                handleClose()
                await dispatch(restoreSms(restoreArray))
                setRestoreArray([]);
                getData()
            }
        }
    }

    const getGroupsDialog = (data = []) => {
        if (!data || !Array.isArray(data)) return null

        return ({
            title: t('campaigns.ShowGroupsTitle'),
            showDivider: false,
            icon: (
                <div className={classes.dialogIconContent}>
                    {'\uE0D5'}
                </div>
            ),
            content: (
                <Box
                    className={classes.gruopsDialogContent}>
                    {data.map(group => {
                        return (
                            <Typography
                                key={group}
                                className={classes.gruopsDialogText}>
                                <FiberManualRecordIcon
                                    className={classes.gruopsDialogBullet} />
                                {group}
                            </Typography>
                        )
                    })}
                </Box>
            ),
            renderButtons: () => (
                <Button
                    variant='contained'
                    size='small'
                    onClick={handleClose}
                    className={clsx(
                        classes.gruopsDialogButton,
                        classes.dialogConfirmButton,
                    )}>
                    {t('common.Ok')}
                </Button>
            )
        })
    }

    const getDeleteDialog = (data = '') => ({
        title: t('campaigns.GridButtonColumnResource2.ConfirmTitle'),
        showDivider: false,
        icon: (
            <Box className={classes.dialogAlertIcon}>
                !
            </Box>
        ),
        content: (
            <Typography style={{ fontSize: 18 }}>
                {t('campaigns.GridButtonColumnResource2.ConfirmText')}
            </Typography>
        ),
        onConfirm: async () => {
            clearSearch()
            handleClose()
            await dispatch(deleteSms(data))
            getData()
        }
    })

    const getDuplicateDialog = (data = '') => ({
        title: t('campaigns.dialogDuplicateTitle'),
        showDivider: false,
        icon: (
            <Box className={classes.dialogAlertIcon}>
                !
            </Box>
        ),
        content: (
            <Typography style={{ fontSize: 18 }}>
                {t('campaigns.dialogDuplicateContent')}
            </Typography>
        ),
        onConfirm: async () => {
            clearSearch()
            handleClose()
            setPage(1)
            await dispatch(duplicteSms(data))
            getData()
        }
    })

    const getPreviewDialog = (data = {}) => {
        return {
            childrenPadding: false,
            contentStyle: classes.pt2rem,
            showDivider: false,
            icon: (
                <div className={classes.dialogIconContent}>
                    {'\uE0F8'}
                </div>
            ),
            content: (
                <Box>
                    <Preview classes={classes}
                        mobileFullsize={true}
                        model={data}
                        ShowRedirectButton={data.RedirectButtonText && data.RedirectButtonText !== ''}
                        showTitle={false}
                        showID={true}
                        isSMS={true}
                    />
                </Box>
            ),
            renderButtons: () => (
                <Button
                    variant='contained'
                    size='small'
                    onClick={handleClose}
                    className={clsx(
                        classes.confirmButton,
                        classes.dialogConfirmButton,
                    )}>
                    {t('common.confirm')}
                </Button>
            )
        };
    }

    const getVerifyDialog = (data = []) => {
        if (!data || !Array.isArray(data)) return null
        return {
            title: t('sms.verificationDialogTitle'),
            showDivider: false,
            icon: (
                <div className={classes.dialogIconContent}>
                    {'\uE11B'}
                </div>
            ),
            content: (
                <Box>
                    <Typography style={{ fontSize: 15 }} align={'justify'}>
                        {t('sms.verificationBody')}
                        <b>{t('sms.oneTimeProcess')}</b>
                        {t('sms.foreachSubmission')}
                    </Typography>
                    <br />
                    <Typography style={{ fontSize: 15, textDecoration: 'underline' }}>
                        {t('sms.verificationNote')}
                    </Typography>
                    <hr />
                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                        <Typography style={{ fontSize: 15 }}>
                            {t('sms.numbersAccount')}
                        </Typography>
                        <Button
                            variant='contained'
                            size='small'
                            color='primary'
                            onClick={() => handleShortVerify()}
                        >{t('sms.verifyAnotherNumber')}
                        </Button>
                    </Box>
                    <List style={{ padding: 0, overflow: 'auto', height: 'calc(100vh - 500px)' }}>
                        {data.map(item => {
                            return (
                                <ListItem style={{ padding: 0 }} key={`verificationNumber${item.ID}`}>
                                    <ListItemAvatar style={{ minWidth: 25 }}>
                                        <Avatar className={item.IsOptIn ? classes.checkIcon : classes.redIcon}>
                                            <div className={clsx(classes.avatarIcon)}>
                                                {item.IsOptIn ? '\uE134' : '\uE0A7'}
                                            </div>
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        style={{ margin: 0 }}
                                        primary={
                                            <Grid container >
                                                <Grid item>
                                                    <Typography variant="body2">
                                                        {item.Number}
                                                    </Typography>
                                                </Grid>
                                                {!item.IsOptIn && <Grid item>
                                                    <Typography
                                                        className={classes.verifyLink}
                                                        onClick={() => handleShortVerify(item.Number)}>
                                                        {t('sms.verifyNumber')}
                                                    </Typography>
                                                </Grid>
                                                }

                                            </Grid>
                                        }
                                    />
                                    <ListItemSecondaryAction>

                                    </ListItemSecondaryAction>
                                </ListItem>
                            );
                        })}
                    </List>

                </Box>
            ),
            renderButtons: () => (
                <Button
                    variant='contained'
                    size='small'
                    style={{ maxWidth: 100 }}
                    onClick={handleClose}
                    className={clsx(
                        classes.gruopsDialogButton,
                        classes.dialogConfirmButton,
                    )}>
                    {t('common.Ok')}
                </Button>
            )
        }
    }

    const getShortVerifyDialog = (data = '') => ({
        showDivider: false,
        icon: (
            <div className={classes.dialogIconContent}>
                {'\uE11B'}
            </div>
        ),
        content: (
            <Box style={{ textAlign: 'center' }}>
                <Typography align='center' style={{ fontWeight: 'bold', fontSize: 25 }}>{t('sms.shortVerificationTitle')}</Typography>
                <Typography style={{ fontSize: 15 }} align={'justify'}>
                    {t('sms.verificationBody')}
                    <b>{t('sms.oneTimeProcess')}</b>
                    {t('sms.foreachSubmission')}
                </Typography>
                <br />
                <TextField
                    autoFocus
                    error={numberError}
                    helperText={numberError ? t('sms.numberError') : ''}
                    variant='outlined'
                    placeholder={t('sms.enterNumberText')}
                    value={data || number}
                    onChange={e => handleNumber(e.target.value)}
                    size='small'
                    type='tel'
                    className={!data && classes.verifyField}
                    readOnly={!!data}
                />
                <br /><br />
                <Button
                    size={!data ? "large" : "medium"}
                    variant='contained'
                    onClick={handleSendVerificationCode}
                    className={clsx(classes.verifyButton, !data && classes.f20)}
                >{t('sms.verificationButtonText')}</Button>
                <Typography className={clsx(classes.contactUs, classes.newLine)}>
                    {t('sms.havingIssuesMessage')}
                </Typography>
            </Box>
        ),
        renderButtons: () => null
    })

    const getVerificationSentDialog = (data = '') => ({
        showDivider: false,
        icon: (
            <div className={classes.dialogIconContent}>
                {'\uE11B'}
            </div>
        ),
        content: (
            <Box style={{ textAlign: 'center' }}>
                <Typography
                    align='center'
                    className={classes.verificationTitle}>
                    {t('common.Sent')}
                </Typography>
                <Typography style={{ fontSize: 15 }} align={'center'}>
                    {t('sms.verificationSentToNumber')}{data}
                    <br />
                    {t('sms.pleaseNoteCode')}
                </Typography>
                <br />
                <TextField
                    error={verificationCodeError}
                    helperText={verificationCodeError ? t('sms.verificationCodeError') : ''}
                    variant='outlined'
                    placeholder={t('sms.enterCode')}
                    value={verificationCode}
                    onChange={(e) => handleVerificationCodeInput(e.target.value)}
                    size='small'
                />
                <br /><br />
                <Button
                    variant='contained'
                    onClick={() => handleConfirmCode(verificationCode)}
                    color='primary'
                    style={{ minWidth: 150 }}>
                    {t('common.Ok')}
                </Button>
                <Grid
                    container
                    style={{ marginTop: 20 }}
                    justifyContent='center'>
                    <Grid item>
                        <Typography >
                            {t('sms.didNotReceived')}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography
                            onClick={() => handleShortVerify(data)}
                            style={{ textDecoration: 'underline', margin: '0 5px', cursor: 'pointer' }}>
                            {t('sms.resend')}
                        </Typography>

                    </Grid>
                </Grid>

            </Box>
        ),
        renderButtons: () => null
    });

    const getVerificationSuccessDialog = () => ({
        showDivider: false,
        icon: (
            <div className={classes.dialogIconContent}>
                {'\uE11B'}
            </div>
        ),
        content: (
            <Box style={{ textAlign: 'center' }}>
                <Typography
                    align='center'
                    className={clsx(classes.verificationTitle, classes.green)}>
                    {t('sms.verificationSuccessful')}
                </Typography>
                <Typography style={{ fontSize: 15 }} align={'center'}>
                    {t('sms.verificationSuccessMessage')}
                </Typography>
                <br />
                <div className={classes.verifySuccessIcon}>{'\uE134'}</div>
            </Box>
        ),
        renderButtons: () => null
    });

    const renderDialog = () => {
        const { data, type } = dialogType || {};

        const dialogContent = {
            restore: getRestorDialog(data),
            groups: getGroupsDialog(data),
            delete: getDeleteDialog(data),
            duplicate: getDuplicateDialog(data),
            preview: getPreviewDialog(data),
            verify: getVerifyDialog(data),
            shortVerify: getShortVerifyDialog(data),
            verificationSent: getVerificationSentDialog(data),
            verificationSuccess: getVerificationSuccessDialog(data)
        }

        const currentDialog = dialogContent[type] || {}
        return (
            dialogType && <Dialog
                classes={classes}
                open={dialogType}
                onClose={handleClose}
                {...currentDialog}>
                {currentDialog.content}
            </Dialog>
        )
    }



    const renderNameCell = (row, fullwidth) => {
        let date = null
        const { GroupName } = row;
        let text = '';
        if (!row.SendDate) {
            date = moment(row.UpdatedDate, dateFormat)
            text = t('common.UpdatedOn')
        } else {
            date = moment(row.SendDate, dateFormat)
            const dateMillis = date.valueOf()
            const currentDateMillis = moment().valueOf()
            text = dateMillis > currentDateMillis ? t('common.ScheduledFor') : t('common.SentOn')
        }

        return (
            <>
                <CustomTooltip
                    isSimpleTooltip={false}
                    interactive={true}
                    classes={{
                        tooltip: clsx(classes.tooltipBlack, classes.tooltipPlacement),
                        arrow: classes.fBlack
                    }}
                    arrow={true}
                    style={{ fontSize: 18, fontWeight: 'bold' }}
                    placement={'top'}
                    title={<Typography noWrap={false}>{GroupName}</Typography>}
                    text={GroupName}

                >
                    {
                        fullwidth ? <Typography className={classes.nameEllipsis} style={{ maxWidth: "100%" }}>
                            {GroupName}
                        </Typography> :
                            <Typography className={classes.nameEllipsis} >
                                {GroupName}
                            </Typography>

                    }
                </CustomTooltip>
                <Typography
                    className={classes.grayTextCell}>
                    {`${text} ${date.format('DD/MM/YYYY')} ${date.format('LT')}`}
                </Typography>
            </>
        )
    }

    const renderRow = (row) => { //TODO: Translation left, confirm keys

        const {
            ActiveCell,
            ActiveEmails,
            CreatedDate,
            DynamicData,
            DynamicLastUpdate,
            DynamicUpdatePolicy,
            GroupID,
            GroupName,
            InvalidCell,
            InvalidEmails,
            IsDynamic,
            IsTestGroup,
            PendingEmails,
            Recipients,
            RemovedCell,
            RemovedEmails,
            RestrictedEmails,
            SubAccountID,
            TotalRecipients,
            UpdatedDate
        } = row
        return (
            <TableRow
                key={Math.round(Math.random() * 999999999)}
                classes={rowStyle}>
                <TableCell align='center'>
                    <FormControlLabel
                        label=''
                        control={
                            <Checkbox
                                checked={selectedGroups.indexOf(GroupID) !== -1}
                                // indeterminate={}
                                onClick={() => { handleSelected(GroupID) }}
                            />
                        }
                    />
                </TableCell>
                <TableCell
                    classes={cellStyle}
                    align='center'
                    className={classes.flex2}>
                    {renderNameCell(row)}
                </TableCell>
                <TableCell
                    classes={cellStyle}
                    align='center'
                    className={classes.flex2}>
                    <NameValueGridStructure
                        gridArr={[
                            { name: 'Total Recipients', value: TotalRecipients, classes: { name: colorTextStyle.blue, value: colorTextStyle.blue } },
                            { name: 'Active', value: ActiveEmails, classes: { name: colorTextStyle.green, value: colorTextStyle.green } },
                            { name: 'Removed', value: RemovedEmails, classes: { name: colorTextStyle.red, value: colorTextStyle.red } },
                            { name: 'Bounced', value: InvalidEmails, classes: { name: colorTextStyle.red, value: colorTextStyle.red } },
                        ]}
                        gridSize={{ xs: 12, sm: 3 }}
                        variant="body1"
                        align="center"
                    />
                </TableCell>
                <TableCell
                    classes={cellStyle}
                    align='center'
                    className={classes.flex2}>
                    <NameValueGridStructure
                        gridArr={[
                            { name: 'Total Recipients', value: TotalRecipients, classes: { name: colorTextStyle.blue, value: colorTextStyle.blue } },
                            { name: 'Active', value: ActiveCell, classes: { name: colorTextStyle.green, value: colorTextStyle.green } },
                            { name: 'Removed', value: RemovedCell, classes: { name: colorTextStyle.red, value: colorTextStyle.red } },
                            { name: 'Bounced', value: InvalidCell, classes: { name: colorTextStyle.red, value: colorTextStyle.red } },
                        ]}
                        gridSize={{ xs: 12, sm: 3 }}
                        variant="body1"
                        align="center"
                    />
                </TableCell>
                <TableCell
                    classes={cellStyle}
                    align='center'
                    className={classes.flex4}
                >
                    <FlexGrid
                        gridArr={[
                            { label: "Preview", component: <IconWrapper iconName='preview' /> },
                            { label: "Automation", component: <IconWrapper iconName='automation' /> },
                            { label: "Delete", component: <IconWrapper iconName='delete' /> },
                            { label: "Add Recipient", component: <IconWrapper /> },
                            { label: "Add Recipients", component: <IconWrapper /> },
                            // { label: "Reset", component: <IconWrapper /> },
                            // { label: "Settings", component: <IconWrapper /> }

                        ]}
                        gridSize={{ xs: 12, sm: 2 }}
                        variant="body1"
                        align="center"
                    />
                    {/* <IconWrapper iconName='alert' classes={clsx(classes.dialogAlertIcon, colorTextStyle.red)} />
                    <IconWrapper iconName='copy' classes={colorTextStyle.blue} /> */}
                </TableCell>
            </TableRow>
        )
    }

    const renderPhoneRow = (row) => { //PENDING 
        return (
            <TableRow
                key={row.Id}
                component='div'
                classes={rowStyle}>
                <TableCell style={{ flex: 1 }} classes={{ root: classes.tableCellRoot }}>
                    <Box className={classes.justifyBetween}>
                        <Box className={classes.inlineGrid}>
                            {renderNameCell(row)}
                        </Box>
                        <Box>
                            {renderStatusCell(row.Status)}
                        </Box>
                    </Box>
                    {renderCellIcons(row)}
                </TableCell>
            </TableRow>
        )
    }

    const renderTableBody = () => {
        let sortData = filteredData;
        let rpp = parseInt(rowsPerPage)
        sortData = sortData.slice((page - 1) * rpp, (page - 1) * rpp + rpp)
        return (
            <TableBody>
                {sortData
                    .map(windowSize === 'xs' ? renderPhoneRow : renderRow)}
            </TableBody>
        )
    }

    return (
        <DefaultScreen
            currentPage='groups'
            classes={classes}
            containerClass={classes.management}>
            {renderHeader()}
            {renderSearchLine()}
            {renderManagmentLine()}
            <DataTable
                tableContainer={{ className: classes.tableStyle }}
                table={{ className: classes.tableContainer }}
                tableHead={{ tableHeadCells: TABLE_HEAD, classes: rowStyle, className: windowSize === 'xs' && classes.dNone }}
            >
                {renderTableBody()}
            </DataTable>
            <TablePagination
                classes={classes}
                // rows={isSearching ? searchResults.length : smsData.length}
                rows={filteredData.length}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleRowsPerPageChange}
                rowsPerPageOptions={[6, 10, 20, 50]}
                page={page}
                onPageChange={setPage}
            />
            {/* {renderDialog()} */}
            {/* 
            {renderSearchLine()}
            {renderManagmentLine()}
            {renderTable()}
            {renderTablePagination()}
            {renderDialog()} */}
            {/* <Loader isOpen={showLoader} /> */}
        </DefaultScreen>
    )
}

export default GroupsManagement