import { useSelector, useDispatch } from 'react-redux';
import React, { useState, useEffect, memo, useRef } from 'react';
import DefaultScreen from '../../DefaultScreen';
import clsx from 'clsx';
import DataTable from "../../../components/Table/DataTable";
import {
    Box, Typography, Divider, TableBody, TableRow, TableCell,
    Grid, Button, TextField, Checkbox
} from '@material-ui/core'
import { SearchIcon, ExportIcon } from '../../../assets/images/managment/index'
import { TablePagination, SearchField } from '../../../components/managment/index'
import FlexGrid from "../../../components/Grids/FlexGrid";
import NameValueGridStructure from "../../../components/Grids/NameValueGridStructure";
import { useTranslation } from 'react-i18next';
import ClearIcon from '@material-ui/icons/Clear';
import moment from 'moment';
import 'moment/locale/he';
import {
    getGroups,
    deleteGroups,
    getGroupsBySubAccountId
} from "../../../redux/reducers/groupSlice";
import { getAccountExtraData } from "../../../redux/reducers/smsSlice";
import { setRowsPerPage } from '../../../redux/reducers/coreSlice';
import AddGroupPopUp from "./Popup/AddGroupPopUp";
import AddRecipientPopup from "./Popup/AddRecipientPopup";
import ConfirmDeletePopUp from "./Popup/ConfirmDeletePopUp";
import CustomTooltip from "../../../components/Tooltip/CustomTooltip";
import { Loader } from '../../../components/Loader/Loader';
import { MdOutlineLockClock } from "react-icons/md"
import { RiPagesLine } from "react-icons/ri"
import IconWrapper from "../../../components/icons/IconWrapper";
import AddBulkRecipientPopup from "./Popup/AddBulkRecipientPopup";
import AddRecipientResponse from "./Popup/AddRecipientResponse";
import EditGroupPopup from "./Popup/EditGroupPopup";
import ResetGroupPopup from "./Popup/ResetGroupPopup";
import SimplyClubPupup from "./Popup/SimplyClubPupup";
import Toast from '../../../components/Toast/Toast.component';
import UnsubscribeOrDeletePopup from "./Popup/UnsubscribeOrDeletePopup";
import { useNavigate, useLocation } from 'react-router';
import { CLIENT_CONSTANTS } from '../../../model/Clients/Contants';
import { voidFunction } from '../../../helpers/utils';
import ConfirmRadioDialog from '../../../components/DialogTemplates/ConfirmRadioDialog'
import { ExportFileTypes } from '../../../model/Export/ExportFileTypes'
import { SetPageState, GetPageNyName } from '../../../helpers/UI/SessionStorageManager';
import queryString from 'query-string';

const Groups = ({ classes }) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const dateFormat = 'YYYY-MM-DD HH:mm:ss.FFF';
    const { language, windowSize, isRTL, rowsPerPage, accountFeatures } = useSelector(state => state.core)
    const { groupData, ToastMessages, subAccountAllGroups } = useSelector((state) => state.group);
    const { extraData } = useSelector(state => state.sms);
    const rowsOptions = [6, 10, 20, 50];
    const [selectedGroups, setSelectedGroups] = useState([]);
    const rowStyle = { head: classes.tableRowReportHead, root: clsx(classes.tableRowRoot) };
    const cellStyle = { head: classes.tableCellHead, body: classes.tableCellBody, root: clsx(classes.tableCellRoot) };
    const cellBodyStyle = { body: clsx(classes.tableCellBody), root: clsx(classes.tableCellRoot, classes.tableCellRootResponsive) };
    const noBorderCellStyle = { body: classes.tableCellBodyNoBorder, root: clsx(classes.tableCellRoot, classes.minWidth50) };
    const colorTextStyle = { red: classes.textColorRed, blue: classes.textColorBlue, green: classes.sendIconText, grey: classes.textColorGrey };
    const [toastMessage, setToastMessage] = useState(null);
    const [showLoader, setLoader] = useState(true);
    const [responseMessage, setResponseMessage] = useState({ title: "", message: "" });
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [dialog, setDialog] = useState(null);
    const [searchStr, setSearchStr] = useState("");
    const [serachData, setSearchData] = useState({
        PageIndex: 1,
        PageSize: rowsPerPage,
        SearchTerm: "",
    });
    const navigate = useNavigate()
    moment.locale(language);
    const { state } = useLocation();
    const from = state?.from || "/";
    const pageProperty = useRef();
    const qs = (window.location.search && queryString.parse(window.location.search)) || state;

    const DialogType = {
        ADD_GROUP: "ADD_GROUP",
        EDIT_GROUP: "EDIT_GROUP",
        DELETE_GROUP: "DELETE_GROUP",
        ADD_RECIPIENT: "ADD_RECIPIENT",
        ADD_RECIPIENTS: "ADD_RECIPIENTS",
        UNSUB_RECIPIENT: "UNSUB_RECIPIENT",
        DELETE_RECIPIENT: "DELETE_RECIPIENT",
        RESET_GROUP: "RESET_GROUP",
        MESSAGE: "MESSAGE",
        SUMMARY: "SUMMARY",
        EXPORT_ALL: "EXPORT_ALL",
        EXPORT_SELECTED: "EXPORT_SELECTED",
        SIMPLY_CLUB: "SIMPLY_CLUB"
    };
    const TABLE_HEAD = [
        {
            label: t("common.GroupName"),
            classes: cellStyle,
            className: classes.flex2,
            align: "center",
        },
        {
            label: t("recipient.emails"),
            classes: cellStyle,
            className: classes.flex2,
            align: "center",
        },
        {
            label: t("recipient.sms/mms"),
            classes: cellStyle,
            className: clsx(classes.flex2, classes.textUppercase, classes.maxWidth325),
            align: "center",
        },
        {
            label: "",
            classes: cellStyle,
            className: clsx(classes.flex4, classes.maxWidth450),
            align: "center",
        },
    ];
    const renderHeader = () => {
        return (
            <>
                <Typography className={classes.managementTitle}>
                    {t("recipient.logPageHeaderResource1.Text")}
                </Typography>
                <Divider />
            </>
        );
    };
    const renderHtml = (html) => {
        function createMarkup() {
            return { __html: html };
        }
        return (
            <label dangerouslySetInnerHTML={createMarkup()}></label>
        );
    }
    const renderToast = () => {
        setTimeout(() => {
            setToastMessage(null);
        }, 4000);
        return (
            <Toast data={toastMessage} />
        );
    }
    const getSubAccountGroups = async () => {
        dispatch(getGroupsBySubAccountId());
    }
    const getData = async (customSearch = null) => {
        const search = { ...serachData, PageSize: rowsPerPage, ...customSearch };
        setLoader(true);
        await dispatch(getGroups(search));
        if (!extraData || extraData.length === 0) {
            await dispatch(getAccountExtraData());
        }
        setLoader(false);
        if (subAccountAllGroups.length === 0) {
            getSubAccountGroups();
        }
    };
    useEffect(() => {
        const queryState = from?.toLowerCase().indexOf('clientsearchresult') > -1;
        pageProperty.current = GetPageNyName('groups');
        let lastSearch = { ...serachData };
        if (queryState && pageProperty.current) {
            let tempSearchData = pageProperty.current?.SearchData;
            lastSearch = { ...serachData, ...tempSearchData };
        }
        setSearchData(lastSearch);
        SetPageState({
            "PageName": "groups",
            "PageNumber": lastSearch?.PageNumber ?? 1,
            "SearchData": lastSearch,
            "SearchTerm": lastSearch.SearchTerm
        });

        getData(lastSearch);
        if (lastSearch?.SearchTerm) {
            setSearchStr(lastSearch?.SearchTerm ?? "");
        }
    }, [dispatch, serachData.PageIndex, rowsPerPage]);

    useEffect(() => {
        if (qs?.NewGroup === 'true') {
            setDialog(DialogType.ADD_GROUP)
        }
    }, [])

    const renderSearchSection = () => {
        const handleKeyDown = (event) => {
            if (event.keyCode === 13 || event.code === "Enter") {
                const searchObject = {
                    PageIndex: 1,
                    PageSize: rowsPerPage,
                    SearchTerm: searchStr,
                };
                setSearchData(searchObject);
                SetPageState({
                    "PageName": "groups",
                    "PageNumber": 1,
                    "SearchData": searchObject,
                    "SearchTerm": searchStr
                });
            }
        };
        const handleKeyPress = (e) => {
            if (e.charCode === 13 || e.code === "Enter") {
                const searchObject = {
                    PageIndex: 1,
                    PageSize: rowsPerPage,
                    SearchTerm: searchStr,
                };

                setSearchData(searchObject);
                SetPageState({
                    "PageName": "groups",
                    "PageNumber": 1,
                    "SearchData": searchObject,
                    "SearchTerm": searchStr
                });
            }
        };

        if (windowSize === "xs") {
            return (
                <SearchField
                    classes={classes}
                    value={searchStr}
                    onChange={(e) => setSearchStr(e.target.value)}
                    onClick={() => {
                        const searchObject = {
                            PageIndex: 1,
                            PageSize: rowsPerPage,
                            SearchTerm: searchStr,
                        };

                        setSearchData(searchObject);
                        SetPageState({
                            "PageName": "groups",
                            "PageNumber": 1,
                            "SearchData": searchObject
                        });
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder={t("common.GroupName")}
                />
            );
        }

        return (
            <Grid container spacing={2} className={classes.lineTopMarging}>
                <Grid item>
                    <TextField
                        variant="outlined"
                        size="small"
                        value={searchStr}
                        onKeyPress={handleKeyDown}
                        onChange={(e) => setSearchStr(e.target.value)}
                        className={clsx(classes.textField, classes.minWidth252)}
                        placeholder={t("common.GroupName")}
                    />
                </Grid>
                <Grid item>
                    <Button
                        size="large"
                        variant="contained"
                        onClick={() => {
                            const searchObject = {
                                PageIndex: 1,
                                PageSize: rowsPerPage,
                                SearchTerm: searchStr,
                            };
                            setSearchData(searchObject);

                            SetPageState({
                                "PageName": "groups",
                                "PageNumber": 1,
                                "SearchData": searchObject
                            });
                            getData(searchObject);
                        }}
                        className={classes.searchButton}
                        endIcon={<SearchIcon />}
                    >
                        {t("campaigns.btnSearchResource1.Text")}
                    </Button>
                </Grid>
                {serachData.SearchTerm && (
                    <Grid item>
                        <Button
                            size="large"
                            variant="contained"
                            onClick={() => {
                                const searchObject = {
                                    ...serachData,
                                    PageIndex: 1,
                                    PageSize: rowsPerPage,
                                    SearchTerm: "",
                                };
                                setSearchData(searchObject);

                                SetPageState({
                                    "PageName": "groups",
                                    "PageNumber": 1,
                                    "SearchData": searchObject,
                                    "SearchTerm": ""
                                });

                                setSearchStr("");
                                getData(searchObject);
                            }}
                            className={classes.searchButton}
                            endIcon={<ClearIcon />}
                        >
                            {t("common.clear")}
                        </Button>
                    </Grid>
                )}
            </Grid>
        );
    };

    const renderManagmentLine = () => {
        const colSize = windowSize === "xs" ? 12 : null;
        return (
            <Grid container spacing={2} className={classes.linePadding}>
                <Grid item xs={colSize}>
                    <Button
                        variant="contained"
                        size="medium"
                        className={clsx(
                            classes.actionButton,
                            classes.actionButtonLightGreen
                        )}
                        onClick={() => setDialog(DialogType.ADD_GROUP)}
                    >
                        {t("group.new")}
                    </Button>
                </Grid>
                {windowSize !== "xs" && (
                    <Grid item>
                        <Button
                            variant="contained"
                            size="medium"
                            className={clsx(classes.actionButton, classes.actionButtonRed)}
                            onClick={() => {
                                selectedGroups.length === 0 ? setToastMessage(ToastMessages.GROUP_ZERO_SELECT) : setDialog(DialogType.DELETE_GROUP)
                            }}
                        >
                            {t("group.delete")}
                        </Button>
                    </Grid>
                )}
                <Grid item xs={colSize}>
                    <Button
                        variant="contained"
                        size="medium"
                        className={clsx(classes.actionButton, classes.actionButtonRed)}
                        onClick={() => selectedGroups.length === 0 ? setToastMessage(ToastMessages.GROUP_ZERO_SELECT) : setDialog(DialogType.DELETE_RECIPIENT)}
                    >
                        {t("recipient.deleteRecipient")}
                    </Button>
                </Grid>
                {/* <Grid item xs={colSize}>
                    <Button
                        variant="contained"
                        size="medium"
                        className={clsx(classes.actionButton, classes.actionButtonRed)}
                        onClick={() => setDialog(DialogType.UNSUB_RECIPIENT)}
                    >
                        {t("recipient.unsubscribe")}
                    </Button>
                </Grid> */}
                {accountFeatures && accountFeatures?.indexOf('15') > -1 && (<Grid item xs={colSize}>
                    <Button
                        variant="contained"
                        size="medium"
                        className={clsx(classes.actionButton, classes.importButtonBlue)}
                        onClick={() => setDialog(DialogType.SIMPLY_CLUB)}

                    >
                        {t("recipient.externalImport")}
                    </Button>
                </Grid>)}
                {
                    accountFeatures?.indexOf('13') === -1 &&
                    <Grid item xs={colSize}>
                        <Button
                            variant="contained"
                            size="medium"
                            className={clsx(
                                classes.actionButton,
                                classes.actionButtonGreen
                            )}
                            onClick={() => setShowConfirmDialog(true)}
                            startIcon={<ExportIcon />}
                        >
                            {t("campaigns.exportFile")}
                        </Button>
                    </Grid>
                }
                <Grid
                    item
                    xs={colSize}
                    className={classes.groupsLableContainer}
                >
                    <Typography className={classes.groupsLable}>
                        {`${groupData ? groupData.RecordCount : 0} ${t("common.Groups")}`}
                    </Typography>
                </Grid>
            </Grid>
        );
    };

    const renderNameCell = (row, fullwidth) => {
        let date = null;
        const { GroupID, GroupName } = row;
        let text = "";
        if (!row.UpdateDate) {
            date = moment(row.CreationDate, dateFormat);
            text = t("common.CreatedOn");
        } else {
            date = moment(row.UpdateDate, dateFormat);
            text = t("common.UpdatedOn");
        }

        return (
            <Grid container wrap="nowrap" spacing={1} alignItems='center'>
                {windowSize !== 'xs' && <Grid item sm={2}>
                    <Checkbox
                        color="primary"
                        checked={selectedGroups && selectedGroups.includes(GroupID)}
                        // indeterminate={}
                        onClick={() => {
                            if (selectedGroups.includes(GroupID)) {
                                setSelectedGroups(selectedGroups.filter(item => item !== GroupID))
                            } else {
                                setSelectedGroups([...selectedGroups, GroupID])
                            }
                        }}
                    />

                </Grid>}
                <Grid item sm={10}>
                    <CustomTooltip
                        isSimpleTooltip={false}
                        interactive={true}
                        classes={{
                            tooltip: clsx(classes.tooltipBlack, classes.tooltipPlacement),
                            arrow: classes.fBlack,
                        }}
                        arrow={true}
                        style={{ fontSize: 18 }}
                        placement={"top"}
                        title={<Typography noWrap={false}>{GroupName}</Typography>}
                        text={GroupName}
                    >
                        {fullwidth ? (
                            <Typography
                                className={clsx(classes.nameEllipsis, classes.groupName)}
                                style={{ maxWidth: "200px" }}
                            >
                                {GroupName}
                            </Typography>
                        ) : (
                            <Typography className={clsx(classes.nameEllipsis, classes.groupName)}>
                                {GroupName}
                            </Typography>
                        )}
                    </CustomTooltip>
                    <Typography className={clsx(classes.grayTextCell, classes.date)}>
                        {`${text} ${date.format("DD/MM/YYYY")} ${date.format("LT")}`}
                    </Typography>
                </Grid>
            </Grid>
        );
    };

    const REDIRECT_OPTIONS = {
        ShowGroup: 0,
        ShowMails: 10,
        ShowMailsActive: 11,
        ShowMailsRemoved: 12,
        ShowMailsErrored: 13,
        ShowSms: 20,
        ShowSmsActive: 21,
        ShowSmsRemoved: 22,
        ShowSmsErrored: 23
    };

    const renderRow = (row) => {
        const {
            ActiveCell,
            ActiveEmails,
            GroupID,
            GroupName,
            InvalidCell,
            InvalidEmails,
            RestrictedEmails,
            RemovedCell,
            RemovedEmails,
            IsConnectedToWebForm,
            AutomationID,
            IsAutoResponder,
            CreationDate,
            UpdateDate,
            PendingClients,
            PendingSmsClients,
            PendingEmails
        } = row;
        let iconsCells = [row.IsAutoResponder, row.IsConnectedToWebForm].filter((e) => {
            return e === true
        }).length;

        return (
            <TableRow
                key={GroupID}
                classes={rowStyle}
                className={clsx(classes.maxHeightReponsive)}
            >
                <TableCell
                    classes={cellBodyStyle}
                    align='center'
                    className={clsx(classes.flex2)}>
                    <Grid container direction="row">
                        <Grid item sm={12 - iconsCells}>
                            {renderNameCell({ GroupID, GroupName, isChecked: true, CreationDate, UpdateDate })}
                        </Grid>
                        {
                            row.IsAutoResponder === true ? (
                                <Grid item sm={1} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CustomTooltip
                                        isSimpleTooltip={true}
                                        interactive={false}
                                        classes={{
                                            tooltip: clsx(classes.tooltipBlack, classes.tooltipPlacement),
                                            arrow: classes.fBlack,
                                        }}
                                        arrow={true}
                                        style={{ fontSize: 18 }}
                                        placement={"top"}
                                        icon={<MdOutlineLockClock style={{ fontSize: 24 }} />}
                                        text={
                                            <Typography noWrap={false} className={classes.tooltipText}
                                                style={{ direction: isRTL ? 'rtl' : 'ltr', color: '#fff' }}>{t("group.autoResponderConnected")}</Typography>}
                                    ></CustomTooltip>
                                </Grid>
                            ) : null
                        }
                        {
                            row.IsConnectedToWebForm === true ? (
                                <Grid item sm={1} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CustomTooltip
                                        isSimpleTooltip={true}
                                        iconStyle={{ color: '#000' }}
                                        interactive={false}
                                        classes={{
                                            tooltip: clsx(classes.tooltipBlack, classes.tooltipPlacement),
                                            arrow: classes.fBlack,
                                        }}
                                        arrow={true}
                                        style={{ fontSize: 18 }}
                                        placement={"top"}
                                        icon={<RiPagesLine style={{ fontSize: 24 }} />}
                                        text={
                                            <Typography noWrap={false} className={classes.tooltipText}>{t("group.webformConnected")}</Typography>}
                                    ></CustomTooltip>
                                </Grid>
                            ) : null
                        }
                    </Grid>
                </TableCell>
                <TableCell classes={cellStyle} align="center" className={classes.flex3}>
                    <FlexGrid
                        gridArr={[
                            {

                                component: (
                                    <NameValueGridStructure
                                        gridArr={[
                                            {
                                                name: t("campaigns.recipients"),
                                                value: (ActiveEmails || 0) + (RemovedEmails || 0) + (RestrictedEmails || 0) + (InvalidEmails || 0) + (PendingClients || 0),
                                                classes: {
                                                    name: clsx(colorTextStyle.blue, classes.f09rem),
                                                    value: clsx(colorTextStyle.blue, classes.grpDataBoxText, classes.f09rem),
                                                },
                                                onClick: ((ActiveEmails || 0) + (RemovedEmails || 0) + (RestrictedEmails || 0) + (InvalidEmails || 0) + (PendingClients || 0)) > 0 ? () => navigate(CLIENT_CONSTANTS.BASEURL, {
                                                    state:
                                                    {
                                                        ...CLIENT_CONSTANTS.QUERY_PARAMS,
                                                        PageType: CLIENT_CONSTANTS.PAGE_TYPES.ClientStatus,
                                                        ReportType: CLIENT_CONSTANTS.REPORT_TYPE.ShowMails,
                                                        GroupIds: [GroupID],
                                                        Status: 100,
                                                        TestStatusOfEmailElseSms: 1,
                                                        ResultTitle: GroupName,
                                                        PageProperty: pageProperty.current
                                                    }
                                                }) : voidFunction
                                            }]}

                                        variant="body1"
                                        gridSize={{ xs: 12, sm: 12, md: 12, lg: 12 }}
                                    />
                                ),
                            },
                            {

                                component: (
                                    <NameValueGridStructure
                                        gridArr={[
                                            {
                                                name: t("recipient.Active"),
                                                value: ActiveEmails,
                                                classes: {
                                                    name: clsx(colorTextStyle.green, classes.f09rem),
                                                    value: clsx(colorTextStyle.green, classes.grpDataBoxText, classes.f09rem),
                                                },
                                                onClick: (ActiveEmails || 0) > 0 ? () => navigate(CLIENT_CONSTANTS.BASEURL, {

                                                    state:
                                                    {
                                                        ...CLIENT_CONSTANTS.QUERY_PARAMS,
                                                        PageType: CLIENT_CONSTANTS.PAGE_TYPES.ClientStatus,
                                                        ReportType: CLIENT_CONSTANTS.REPORT_TYPE.ShowMailsActive,
                                                        GroupIds: [GroupID],
                                                        Status: 1,
                                                        TestStatusOfEmailElseSms: 1,
                                                        ResultTitle: `${GroupName} - ${t("recipient.Active")}`,
                                                        PageProperty: pageProperty.current
                                                    }
                                                }) : voidFunction
                                            }]}

                                        variant="body1"
                                        gridSize={{ xs: 12, sm: 12, md: 12, lg: 12 }}
                                    />
                                ),
                            },
                            {

                                component: (
                                    <NameValueGridStructure
                                        gridArr={[
                                            {
                                                name: t("recipient.Removed"),
                                                value: RemovedEmails,
                                                classes: {
                                                    name: clsx(colorTextStyle.red, classes.f09rem),
                                                    value: clsx(colorTextStyle.red, classes.grpDataBoxText, classes.f09rem),
                                                },
                                                onClick: (RemovedEmails || 0) > 0 ? () => navigate(CLIENT_CONSTANTS.BASEURL, {

                                                    state:
                                                    {
                                                        ...CLIENT_CONSTANTS.QUERY_PARAMS,
                                                        PageType: CLIENT_CONSTANTS.PAGE_TYPES.ClientStatus,
                                                        ReportType: CLIENT_CONSTANTS.REPORT_TYPE.ShowMailsRemoved,
                                                        GroupIds: [GroupID],
                                                        Status: 2,
                                                        TestStatusOfEmailElseSms: 1,
                                                        ResultTitle: `${GroupName} - ${t("recipient.Removed")}`,
                                                        PageProperty: pageProperty.current
                                                    }
                                                }) : voidFunction
                                            }]}

                                        variant="body1"
                                        gridSize={{ xs: 12, sm: 12, md: 12, lg: 12 }}
                                    />
                                ),

                            },
                            {

                                component: (
                                    <NameValueGridStructure
                                        gridArr={[
                                            {
                                                name: t("recipient.Bounced"),
                                                value: InvalidEmails,
                                                classes: {
                                                    name: clsx(colorTextStyle.red, classes.f09rem),
                                                    value: clsx(colorTextStyle.red, classes.grpDataBoxText, classes.f09rem),
                                                },
                                                onClick: (InvalidEmails || 0) > 0 ? () => navigate(CLIENT_CONSTANTS.BASEURL, {

                                                    state:
                                                    {
                                                        ...CLIENT_CONSTANTS.QUERY_PARAMS,
                                                        PageType: CLIENT_CONSTANTS.PAGE_TYPES.ClientStatus,
                                                        ReportType: CLIENT_CONSTANTS.REPORT_TYPE.ShowMailsErrored,
                                                        GroupIds: [GroupID],
                                                        Status: 4,
                                                        TestStatusOfEmailElseSms: 1,
                                                        ResultTitle: `${GroupName} - ${t("recipient.Bounced")}`,
                                                        PageProperty: pageProperty.current
                                                    }
                                                }) : voidFunction
                                            }]}

                                        variant="body1"
                                        gridSize={{ xs: 12, sm: 12, md: 12, lg: 12 }}
                                    />
                                ),

                            },
                            {

                                component: (
                                    <NameValueGridStructure
                                        gridArr={[
                                            {
                                                name: t("recipient.Pending"),
                                                value: PendingClients || 0,
                                                classes: {
                                                    name: clsx(colorTextStyle.grey, classes.f09rem),
                                                    value: clsx(colorTextStyle.grey, classes.grpDataBoxText, classes.f09rem),
                                                },
                                                onClick: (PendingClients || 0) > 0 ? () => navigate(CLIENT_CONSTANTS.BASEURL, {
                                                    state:
                                                    {
                                                        ...CLIENT_CONSTANTS.QUERY_PARAMS,
                                                        PageType: CLIENT_CONSTANTS.PAGE_TYPES.ClientStatus,
                                                        ReportType: CLIENT_CONSTANTS.REPORT_TYPE.ShowMails,
                                                        GroupIds: [GroupID],
                                                        Status: 5,
                                                        TestStatusOfEmailElseSms: 1,
                                                        ResultTitle: `${GroupName} - ${t("recipient.Pending")}`,
                                                        PageProperty: pageProperty.current
                                                    }
                                                }) : voidFunction
                                            }]}

                                        variant="body1"
                                        gridSize={{ xs: 12, sm: 12, md: 12, lg: 12 }}
                                    />
                                ),

                            },

                        ]}
                        textVariant="body1"
                        align="center"
                    />
                </TableCell>

                <TableCell classes={cellStyle} align="center" className={clsx(classes.flex3, classes.maxWidth325)}>
                    <FlexGrid
                        gridArr={[
                            {

                                component: (
                                    <NameValueGridStructure
                                        gridArr={[
                                            {
                                                name: t("campaigns.recipients"),
                                                value: (ActiveCell || 0) + (RemovedCell || 0) + (InvalidCell || 0) + (PendingSmsClients || 0),
                                                classes: {
                                                    name: clsx(colorTextStyle.blue, classes.f09rem),
                                                    value: clsx(colorTextStyle.blue, classes.grpDataBoxText, classes.f09rem),
                                                },
                                                onClick: ((ActiveCell || 0) + (RemovedCell || 0) + (InvalidCell || 0) + (PendingSmsClients || 0)) > 0 ? () => navigate(CLIENT_CONSTANTS.BASEURL, {

                                                    state:
                                                    {
                                                        ...CLIENT_CONSTANTS.QUERY_PARAMS,
                                                        PageType: CLIENT_CONSTANTS.PAGE_TYPES.ClientStatus,
                                                        ReportType: CLIENT_CONSTANTS.REPORT_TYPE.ShowSms,
                                                        GroupIds: [GroupID],
                                                        Status: 100,
                                                        TestStatusOfEmailElseSms: 0,
                                                        ResultTitle: GroupName,
                                                        PageProperty: pageProperty.current
                                                    }
                                                }) : voidFunction
                                            }]}

                                        variant="body1"
                                        gridSize={{ xs: 12, sm: 12, md: 12, lg: 12 }}
                                    />
                                ),
                            },
                            {

                                component: (
                                    <NameValueGridStructure
                                        gridArr={[
                                            {
                                                name: t("recipient.Active"),
                                                value: ActiveCell,
                                                classes: {
                                                    name: clsx(colorTextStyle.green, classes.f09rem),
                                                    value: clsx(colorTextStyle.green, classes.grpDataBoxText, classes.f09rem),
                                                },
                                                onClick: (ActiveCell || 0) > 0 ? () => navigate(CLIENT_CONSTANTS.BASEURL, {

                                                    state:
                                                    {
                                                        ...CLIENT_CONSTANTS.QUERY_PARAMS,
                                                        PageType: CLIENT_CONSTANTS.PAGE_TYPES.ClientStatus,
                                                        ReportType: CLIENT_CONSTANTS.REPORT_TYPE.ShowSmsActive,
                                                        GroupIds: [GroupID],
                                                        Status: 0,
                                                        TestStatusOfEmailElseSms: 0,
                                                        ResultTitle: `${GroupName} - ${t("recipient.Active")}`,
                                                        PageProperty: pageProperty.current
                                                    }
                                                }) : voidFunction
                                            }]}

                                        variant="body1"
                                        gridSize={{ xs: 12, sm: 12, md: 12, lg: 12 }}
                                    />
                                ),
                            },
                            {

                                component: (
                                    <NameValueGridStructure
                                        gridArr={[
                                            {
                                                name: t("recipient.Removed"),
                                                value: RemovedCell,
                                                classes: {
                                                    name: clsx(colorTextStyle.red, classes.f09rem),
                                                    value: clsx(colorTextStyle.red, classes.grpDataBoxText, classes.f09rem),
                                                },
                                                onClick: (RemovedCell || 0) > 0 ? () => navigate(CLIENT_CONSTANTS.BASEURL, {

                                                    state:
                                                    {
                                                        ...CLIENT_CONSTANTS.QUERY_PARAMS,
                                                        PageType: CLIENT_CONSTANTS.PAGE_TYPES.ClientStatus,
                                                        ReportType: CLIENT_CONSTANTS.REPORT_TYPE.ShowSmsRemoved,
                                                        GroupIds: [GroupID],
                                                        Status: 1,
                                                        TestStatusOfEmailElseSms: 0,
                                                        ResultTitle: `${GroupName} - ${t("recipient.Removed")}`,
                                                        PageProperty: pageProperty.current
                                                    }
                                                }) : voidFunction
                                            }]}

                                        variant="body1"
                                        gridSize={{ xs: 12, sm: 12, md: 12, lg: 12 }}
                                    />
                                ),

                            },
                            {

                                component: (
                                    <NameValueGridStructure
                                        gridArr={[
                                            {
                                                name: t("recipient.Bounced"),
                                                value: InvalidCell,
                                                classes: {
                                                    name: clsx(colorTextStyle.red, classes.f09rem),
                                                    value: clsx(colorTextStyle.red, classes.grpDataBoxText, classes.f09rem),
                                                },
                                                onClick: (InvalidCell || 0) > 0 ? () => navigate(CLIENT_CONSTANTS.BASEURL, {
                                                    state:
                                                    {
                                                        ...CLIENT_CONSTANTS.QUERY_PARAMS,
                                                        PageType: CLIENT_CONSTANTS.PAGE_TYPES.ClientStatus,
                                                        ReportType: CLIENT_CONSTANTS.REPORT_TYPE.ShowSmsErrored,
                                                        GroupIds: [GroupID],
                                                        Status: 4,
                                                        TestStatusOfEmailElseSms: 0,
                                                        ResultTitle: `${GroupName} - ${t("recipient.Bounced")}`,
                                                        PageProperty: pageProperty.current
                                                    }
                                                }) : voidFunction
                                            }]}

                                        variant="body1"
                                        gridSize={{ xs: 12, sm: 12, md: 12, lg: 12 }}
                                    />
                                ),

                            },
                            {

                                component: (
                                    <NameValueGridStructure
                                        gridArr={[
                                            {
                                                name: t("recipient.Pending"),
                                                value: PendingSmsClients || 0,
                                                classes: {
                                                    name: clsx(colorTextStyle.grey, classes.f09rem),
                                                    value: clsx(colorTextStyle.grey, classes.grpDataBoxText, classes.f09rem),
                                                },
                                                onClick: (PendingSmsClients || 0) > 0 ? () => navigate(CLIENT_CONSTANTS.BASEURL, {
                                                    state:
                                                    {
                                                        ...CLIENT_CONSTANTS.QUERY_PARAMS,
                                                        PageType: CLIENT_CONSTANTS.PAGE_TYPES.ClientStatus,
                                                        ReportType: CLIENT_CONSTANTS.REPORT_TYPE.ShowSms,
                                                        GroupIds: [GroupID],
                                                        Status: 5,
                                                        TestStatusOfEmailElseSms: 0,
                                                        ResultTitle: `${GroupName} - ${t("recipient.Pending")}`,
                                                        PageProperty: pageProperty.current
                                                    }
                                                }) : voidFunction
                                                // onClick: () => window.open(`/Pulseem/ClientSearchResult.aspx?Src=1&ReportType=${REDIRECT_OPTIONS.ShowSmsPending}&GroupID=${GroupID}`)
                                            }]}

                                        variant="body1"
                                        gridSize={{ xs: 12, sm: 12, md: 12, lg: 12 }}
                                    />
                                ),

                            },

                        ]}
                        textVariant="body1"
                        align="center"
                    />
                </TableCell>
                <TableCell
                    classes={noBorderCellStyle}
                    align="center"
                    className={clsx(classes.flex4, classes.maxWidth450)}
                >
                    <FlexGrid
                        gridArr={[
                            {
                                onClick:
                                    (
                                        (ActiveEmails || 0) +
                                        (RemovedEmails || 0) +
                                        (RestrictedEmails || 0) +
                                        (InvalidEmails || 0) +
                                        (PendingClients || 0)
                                    ) > 0
                                        ||
                                        (
                                            (ActiveCell || 0) +
                                            (RemovedCell || 0) +
                                            (InvalidCell || 0) +
                                            (PendingSmsClients || 0)
                                        ) > 0 ?
                                        () => navigate(CLIENT_CONSTANTS.BASEURL, {
                                            state: {
                                                ...CLIENT_CONSTANTS.QUERY_PARAMS,
                                                PageType: CLIENT_CONSTANTS.PAGE_TYPES.ShowGroup,
                                                GroupIds: [GroupID],
                                                ResultTitle: GroupName,
                                                PageProperty: pageProperty.current
                                            }
                                        }) : voidFunction,
                                label: t("recipient.preview"),
                                component: (
                                    <IconWrapper iconName="preview" className={classes.mxAuto} />
                                ),
                                classes: { text: clsx(classes.noWrap, classes.f09rem) },
                            },
                            {
                                onClick: () => {
                                    setSelectedGroups([GroupID])
                                    setDialog(DialogType.ADD_RECIPIENT)
                                },
                                label: t("recipient.addRecipient"),
                                component: (
                                    <IconWrapper
                                        iconName="addRecipient"
                                        className={classes.mxAuto}

                                    />
                                ),
                                classes: { text: clsx(classes.noWrap, classes.f09rem) },
                            },
                            {
                                onClick: () => {
                                    setSelectedGroups([GroupID])
                                    setDialog(DialogType.ADD_RECIPIENTS)
                                },
                                label: t("recipient.addRecipients"),
                                component: (
                                    <IconWrapper
                                        iconName="addRecipients"
                                        className={classes.mxAuto}
                                    />
                                ),
                                classes: { text: clsx(classes.noWrap, classes.f09rem) },
                            },
                            {
                                onClick: () => {
                                    setSelectedGroups([GroupID])
                                    setDialog(DialogType.RESET_GROUP)
                                },
                                label: t("recipient.reset"),
                                component: (
                                    <IconWrapper iconName="reset" className={classes.mxAuto} />
                                ),
                                classes: { text: clsx(classes.noWrap, classes.f09rem) },
                            },
                            {
                                onClick: () => {
                                    setSelectedGroups([GroupID])
                                    setDialog(DialogType.EDIT_GROUP)
                                },
                                label: t("recipient.settings"),
                                component: (
                                    <IconWrapper iconName="settings" className={classes.mxAuto} />
                                ),
                                classes: { text: clsx(classes.noWrap, classes.f09rem) },
                            },
                            //TODO: Disable if !== null
                            {
                                label: t("recipient.automation"),
                                component: (
                                    <IconWrapper iconName="automation" className={!AutomationID ? clsx(classes.mxAuto, classes.managmentIconDisable) : classes.mxAuto}
                                        onClick={() => {
                                            if (AutomationID)
                                                window.open(`/Pulseem/CreateAutomations.aspx?Mode=show&AutomationID=${AutomationID}&fromreact=true`, '_blank');
                                        }}
                                    />
                                ),
                                classes: { text: clsx(classes.noWrap, !AutomationID ? classes.disabled : null) },
                                isDisabled: !AutomationID
                            },
                            {
                                onClick: () => {
                                    if (!(AutomationID || IsConnectedToWebForm || IsAutoResponder)) {
                                        setSelectedGroups([GroupID])
                                        setDialog(DialogType.DELETE_GROUP)
                                    }
                                },
                                label: t("recipient.delete"),
                                component: (
                                    <IconWrapper
                                        iconName="delete"
                                        className={(AutomationID || IsConnectedToWebForm || IsAutoResponder) ? clsx(classes.mxAuto, classes.managmentIconDisable) : classes.mxAuto}

                                    />
                                ),
                                classes: { text: clsx(classes.noWrap, (AutomationID || IsConnectedToWebForm || IsAutoResponder) ? classes.disabled : null) },
                                isDisabled: (AutomationID || IsConnectedToWebForm || IsAutoResponder)
                            },
                        ]}
                        variant="body1"
                        align="center"
                    />
                </TableCell>
            </TableRow>
        )

    }
    const renderPhoneRow = (row) => {
        const {
            ActiveCell,
            ActiveEmails,
            GroupID,
            InvalidCell,
            InvalidEmails,
            RemovedCell,
            RemovedEmails,
            TotalRecipients,
            RestrictedEmails,
            GroupName,
            PendingClients,
            PendingSmsClients,
        } = row;
        return (
            <TableRow key={GroupID} component="div" classes={rowStyle}>
                <TableCell
                    style={{ flex: 1 }}
                    classes={{ root: classes.tableCellRoot }}
                    className={classes.p10}
                >
                    <Box className={classes.justifyBetween}>
                        {/* <Box className={classes.inlineGrid}>{GroupName}</Box> */}
                        {renderNameCell(row)}
                        <Box className={clsx(classes.inlineGrid, classes.textCenter)}>
                            <IconWrapper
                                iconName="addRecipient"
                                className={classes.mxAuto}
                                onClick={() => {
                                    setSelectedGroups([GroupID])
                                    setDialog(DialogType.DELETE_GROUP)
                                }}
                            />
                        </Box>
                    </Box>
                    <Box className={classes.mt3}>
                        <Typography style={{ maxWidth: '100%' }} className={clsx(classes.nameEllipsis, classes.fullWidth)}>{t("recipient.emails")}</Typography>
                        <FlexGrid
                            justifyContent="space-between"
                            gridArr={[
                                {
                                    component: (
                                        <NameValueGridStructure
                                            rootClass={classes.textCenter}
                                            gridSize={{ xs: 12, sm: 12 }}
                                            gridArr={[{
                                                name: t("campaigns.recipients"),
                                                value: TotalRecipients,
                                                classes: {
                                                    name: colorTextStyle.blue,
                                                    value: colorTextStyle.blue,
                                                },
                                                onClick: ((ActiveEmails || 0) + (RemovedEmails || 0) + (RestrictedEmails || 0) + (InvalidEmails || 0)) > 0 ? () => navigate(CLIENT_CONSTANTS.BASEURL, {
                                                    state:
                                                    {
                                                        ...CLIENT_CONSTANTS.QUERY_PARAMS,
                                                        PageType: CLIENT_CONSTANTS.PAGE_TYPES.ClientStatus,
                                                        ReportType: CLIENT_CONSTANTS.REPORT_TYPE.ShowMails,
                                                        GroupIds: [GroupID],
                                                        Status: 100,
                                                        TestStatusOfEmailElseSms: 1,
                                                        ResultTitle: GroupName,
                                                        PageProperty: pageProperty.current
                                                    }
                                                }) : voidFunction
                                            }]} />
                                    ),
                                },
                                {

                                    component: (
                                        <NameValueGridStructure
                                            rootClass={classes.textCenter}
                                            gridSize={{ xs: 12, sm: 12 }}
                                            gridArr={[{
                                                name: t("recipient.Active"),
                                                value: ActiveEmails,
                                                classes: {
                                                    name: colorTextStyle.green,
                                                    value: colorTextStyle.green,
                                                },
                                                onClick: (ActiveEmails || 0) > 0 ? () => navigate(CLIENT_CONSTANTS.BASEURL, {
                                                    state:
                                                    {
                                                        ...CLIENT_CONSTANTS.QUERY_PARAMS,
                                                        PageType: CLIENT_CONSTANTS.PAGE_TYPES.ClientStatus,
                                                        ReportType: CLIENT_CONSTANTS.REPORT_TYPE.ShowMailsActive,
                                                        GroupIds: [GroupID],
                                                        Status: 1,
                                                        TestStatusOfEmailElseSms: 1,
                                                        ResultTitle: GroupName,
                                                        PageProperty: pageProperty.current
                                                    }
                                                }) : voidFunction
                                            }]} />
                                    ),
                                },
                                {

                                    component: (
                                        <NameValueGridStructure
                                            rootClass={classes.textCenter}
                                            gridSize={{ xs: 12, sm: 12 }}
                                            gridArr={[{
                                                name: t("recipient.Removed"),
                                                value: RemovedEmails,
                                                classes: {
                                                    name: colorTextStyle.red,
                                                    value: colorTextStyle.red,
                                                },
                                                onClick: (RemovedEmails || 0) > 0 ? () => navigate(CLIENT_CONSTANTS.BASEURL, {
                                                    state:
                                                    {
                                                        ...CLIENT_CONSTANTS.QUERY_PARAMS,
                                                        PageType: CLIENT_CONSTANTS.PAGE_TYPES.ClientStatus,
                                                        ReportType: CLIENT_CONSTANTS.REPORT_TYPE.ShowMailsRemoved,
                                                        GroupIds: [GroupID],
                                                        Status: 2,
                                                        TestStatusOfEmailElseSms: 1,
                                                        ResultTitle: GroupName,
                                                        PageProperty: pageProperty.current
                                                    }
                                                }) : voidFunction
                                            }]} />
                                    ),

                                },
                                {

                                    component: (
                                        <NameValueGridStructure
                                            rootClass={classes.textCenter}
                                            gridSize={{ xs: 12, sm: 12 }}
                                            gridArr={[{
                                                name: t("recipient.Bounced"),
                                                value: InvalidEmails,
                                                classes: {
                                                    name: colorTextStyle.red,
                                                    value: colorTextStyle.red,
                                                },
                                                onClick: (InvalidEmails || 0) > 0 ? () => navigate(CLIENT_CONSTANTS.BASEURL, {
                                                    state:
                                                    {
                                                        ...CLIENT_CONSTANTS.QUERY_PARAMS,
                                                        PageType: CLIENT_CONSTANTS.PAGE_TYPES.ClientStatus,
                                                        ReportType: CLIENT_CONSTANTS.REPORT_TYPE.ShowMailsErrored,
                                                        GroupIds: [GroupID],
                                                        Status: 4,
                                                        TestStatusOfEmailElseSms: 1,
                                                        ResultTitle: GroupName,
                                                        PageProperty: pageProperty.current
                                                    }
                                                }) : voidFunction
                                            }]} />),

                                },
                                {

                                    component: (
                                        <NameValueGridStructure
                                            rootClass={classes.textCenter}
                                            gridSize={{ xs: 12, sm: 12 }}
                                            gridArr={[{
                                                name: t("recipient.Pending"),
                                                value: PendingSmsClients || 0,
                                                classes: {
                                                    name: colorTextStyle.grey,
                                                    value: colorTextStyle.grey,
                                                },
                                                onClick: (PendingSmsClients || 0) > 0 ? () => navigate(CLIENT_CONSTANTS.BASEURL, {
                                                    state:
                                                    {
                                                        ...CLIENT_CONSTANTS.QUERY_PARAMS,
                                                        PageType: CLIENT_CONSTANTS.PAGE_TYPES.ClientStatus,
                                                        ReportType: CLIENT_CONSTANTS.REPORT_TYPE.ShowSms,
                                                        GroupIds: [GroupID],
                                                        Status: 5,
                                                        TestStatusOfEmailElseSms: 0,
                                                        ResultTitle: GroupName,
                                                        PageProperty: pageProperty.current
                                                    }
                                                }) : voidFunction
                                            }]} />
                                    ),

                                },

                            ]}
                            textVariant="body1"
                            align="center"
                        />
                    </Box>
                    <Box className={classes.mt3}>
                        <Typography style={{ maxWidth: '100%' }} className={clsx(classes.nameEllipsis, classes.fullWidth)}>{t("recipient.emails")}</Typography>
                        <FlexGrid
                            justifyContent="space-between"
                            gridArr={[
                                {
                                    component: (
                                        <NameValueGridStructure
                                            rootClass={classes.textCenter}
                                            gridSize={{ xs: 12, sm: 12 }}
                                            gridArr={[{
                                                name: t("campaigns.recipients"),
                                                value: TotalRecipients,
                                                classes: {
                                                    name: colorTextStyle.blue,
                                                    value: colorTextStyle.blue,
                                                },
                                                onClick: ((ActiveCell || 0) + (RemovedCell || 0) + (InvalidCell || 0)) > 0 ? () => navigate(CLIENT_CONSTANTS.BASEURL, {
                                                    state:
                                                    {
                                                        ...CLIENT_CONSTANTS.QUERY_PARAMS,
                                                        PageType: CLIENT_CONSTANTS.PAGE_TYPES.ClientStatus,
                                                        ReportType: CLIENT_CONSTANTS.REPORT_TYPE.ShowSms,
                                                        GroupIds: [GroupID],
                                                        Status: 100,
                                                        TestStatusOfEmailElseSms: 0,
                                                        ResultTitle: GroupName,
                                                        PageProperty: pageProperty.current
                                                    }
                                                }) : voidFunction
                                            }]} />
                                    ),
                                },
                                {

                                    component: (
                                        <NameValueGridStructure
                                            rootClass={classes.textCenter}
                                            gridSize={{ xs: 12, sm: 12 }}
                                            gridArr={[{
                                                name: t("recipient.Active"),
                                                value: ActiveCell,
                                                classes: {
                                                    name: colorTextStyle.green,
                                                    value: colorTextStyle.green,
                                                },
                                                onClick: () => (ActiveCell || 0) > 0 ? () => navigate(CLIENT_CONSTANTS.BASEURL, {
                                                    state:
                                                    {
                                                        ...CLIENT_CONSTANTS.QUERY_PARAMS,
                                                        PageType: CLIENT_CONSTANTS.PAGE_TYPES.ClientStatus,
                                                        ReportType: CLIENT_CONSTANTS.REPORT_TYPE.ShowSmsActive,
                                                        GroupIds: [GroupID],
                                                        Status: 0,
                                                        TestStatusOfEmailElseSms: 0,
                                                        ResultTitle: GroupName,
                                                        PageProperty: pageProperty.current
                                                    }
                                                }) : voidFunction
                                            }]} />
                                    ),
                                },
                                {

                                    component: (
                                        <NameValueGridStructure
                                            rootClass={classes.textCenter}
                                            gridSize={{ xs: 12, sm: 12 }}
                                            gridArr={[{
                                                name: t("recipient.Removed"),
                                                value: RemovedCell,
                                                classes: {
                                                    name: colorTextStyle.red,
                                                    value: colorTextStyle.red,
                                                },
                                                onClick: () => (RemovedCell || 0) > 0 ? () => navigate(CLIENT_CONSTANTS.BASEURL, {
                                                    state:
                                                    {
                                                        ...CLIENT_CONSTANTS.QUERY_PARAMS,
                                                        PageType: CLIENT_CONSTANTS.PAGE_TYPES.ClientStatus,
                                                        ReportType: CLIENT_CONSTANTS.REPORT_TYPE.ShowSmsRemoved,
                                                        GroupIds: [GroupID],
                                                        Status: 1,
                                                        TestStatusOfEmailElseSms: 0,
                                                        ResultTitle: GroupName,
                                                        PageProperty: pageProperty.current
                                                    }
                                                }) : voidFunction
                                            }]} />
                                    ),
                                },
                                {

                                    component: (
                                        <NameValueGridStructure
                                            rootClass={classes.textCenter}
                                            gridSize={{ xs: 12, sm: 12 }}
                                            gridArr={[{
                                                name: t("recipient.Bounced"),
                                                value: InvalidCell,
                                                classes: {
                                                    name: colorTextStyle.red,
                                                    value: colorTextStyle.red,
                                                },
                                                onClick: () => (InvalidCell || 0) > 0 ? () => navigate(CLIENT_CONSTANTS.BASEURL, {
                                                    state:
                                                    {
                                                        ...CLIENT_CONSTANTS.QUERY_PARAMS,
                                                        PageType: CLIENT_CONSTANTS.PAGE_TYPES.ClientStatus,
                                                        ReportType: CLIENT_CONSTANTS.REPORT_TYPE.ShowSmsErrored,
                                                        GroupIds: [GroupID],
                                                        Status: 4,
                                                        TestStatusOfEmailElseSms: 0,
                                                        ResultTitle: GroupName,
                                                        PageProperty: pageProperty.current
                                                    }
                                                }) : voidFunction
                                            }]} />),

                                },
                                {

                                    component: (
                                        accountFeatures.includes("6") && <NameValueGridStructure
                                            rootClass={classes.textCenter}
                                            gridSize={{ xs: 12, sm: 12 }}
                                            gridArr={[{
                                                name: t("recipient.Pending"),
                                                value: PendingClients || 0,
                                                classes: {
                                                    name: colorTextStyle.grey,
                                                    value: colorTextStyle.grey,
                                                },
                                                onClick: (PendingClients || 0) > 0 ? () => navigate(CLIENT_CONSTANTS.BASEURL, {
                                                    state:
                                                    {
                                                        ...CLIENT_CONSTANTS.QUERY_PARAMS,
                                                        PageType: CLIENT_CONSTANTS.PAGE_TYPES.ClientStatus,
                                                        ReportType: CLIENT_CONSTANTS.REPORT_TYPE.ShowMails,
                                                        GroupIds: [GroupID],
                                                        Status: 5,
                                                        TestStatusOfEmailElseSms: 0,
                                                        ResultTitle: GroupName,
                                                        PageProperty: pageProperty.current
                                                    }
                                                }) : voidFunction
                                            }]
                                            } />),
                                },

                            ]}
                            textVariant="body1"
                            align="center"
                        />
                    </Box>
                </TableCell>
            </TableRow>
        )
    }
    const renderTableBody = () => {
        if (groupData && groupData.Groups) {
            return (
                <DataTable
                    tableContainer={{
                        className:
                            windowSize === "xs"
                                ? clsx(classes.mt3, classes.tableStyle)
                                : classes.tableStyle,
                    }}
                    table={{ className: classes.tableContainer }}
                    tableHead={{
                        tableHeadCells: TABLE_HEAD,
                        classes: rowStyle,
                        className: windowSize === "xs" && classes.dNone,
                    }}
                >
                    <TableBody>
                        {groupData.Groups
                            .map(windowSize === 'xs' ? renderPhoneRow : renderRow)}
                    </TableBody>
                </DataTable>
            )
        }
        return <></>;

    }
    const handleRowsPerPageChange = (val) => {
        dispatch(setRowsPerPage(val))
    }
    const handlePageChange = (val) => {
        SetPageState({
            "PageName": "groups",
            "PageNumber": val,
            "SearchTerm": serachData.SearchTerm,
            "SearchData": (serachData.SearchTerm !== '') ? {
                SearchTerm: serachData.SearchTerm,
                PageIndex: val
            } : null
        });
        setSearchData({ ...serachData, PageIndex: val });
    }
    const renderTablePagination = () => {
        return (
            <TablePagination
                classes={classes}
                rows={groupData ? groupData.RecordCount : 0}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleRowsPerPageChange}
                rowsPerPageOptions={rowsOptions}
                page={serachData.PageIndex}
                onPageChange={handlePageChange}
            />
        )
    }
    const handleAddRecipientResponse = (res) => {
        switch (res.payload.StatusCode) {
            case 201: {
                setResponseMessage({ title: t("recipient.summary.summaryImportTitle"), message: '', summary: res.payload.Summary })
                setDialog(DialogType.MESSAGE);
                break;
            }
            case 202: {
                setResponseMessage({ title: t("recipient.bulkImportTitle"), message: renderHtml(t("recipient.importResponses.fileUploaded")) })
                setDialog(DialogType.MESSAGE);
                break;
            }
            case 404: {
                setResponseMessage({ title: t("common.ErrorOccured"), message: t("recipient.importResponses.noFolderFound") })
                setDialog(DialogType.MESSAGE);
                break;
            }
            case 400: {
                setResponseMessage({ title: t("common.ErrorOccured"), message: t("recipient.importResponses.listEmptyOrClientInvalid") })
                setDialog(DialogType.MESSAGE);
                break;
            }
            default: {
                setResponseMessage({ title: t("common.ErrorOccured"), message: t("recipient.importResponses.genericError") })
                setDialog(DialogType.MESSAGE);
            }
        }
    }
    const handleConfirmExport = (formatType) => {
        let queryString = `Culture=${isRTL ? 'he-IL' : 'en-US'}&formatType=${formatType}`;
        if (selectedGroups && selectedGroups.length > 0) {
            queryString += `&Groups=${selectedGroups.join(',')}`;
        }
        if (selectedGroups.length === 1) {
            const groupName = groupData.Groups.find((g) => { return g.GroupID === selectedGroups[0] }).GroupName;
            queryString += `&GroupName=${groupName.replace(' ', '-')}`;
        }
        // This should be change in the .NET site for support the format file selection POP UP 
        window.open(`/Pulseem/ClientExport.csv?${queryString}`);
        setShowConfirmDialog(false);
    }
    const renderConfirmDialog = () => {
        return (
            <ConfirmRadioDialog
                classes={classes}
                isOpen={showConfirmDialog}
                title={t('common.ExportGroups')}
                text={!selectedGroups || selectedGroups.length === 0 ? t('common.IsExportAllGroups') : selectedGroups.length === 1 ? t("common.IsExportGroup") : t("common.IsExportGroups")}
                radioTitle={t('common.SelectFormat')}
                onConfirm={(e) => handleConfirmExport(e)}
                onCancel={() => setShowConfirmDialog(false)}
                cookieName={'exportFormat'}
                defaultValue="xls"
                options={ExportFileTypes}
            />
        );
    }
    const handleResponses = (response, actions = {
        'S_200': {
            code: 200,
            message: '',
            Func: () => null
        },
        'S_201': {
            code: 201,
            message: '',
            Func: () => getData(null)
        },
        'S_202': {
            code: 202,
            message: '',
            Func: () => getData(null)
        },
        'S_400': {
            code: 400,
            message: '',
            Func: () => null
        },
        'S_401': {
            code: 401,
            message: '',
            Func: () => null
        },
        'S_405': {
            code: 405,
            message: '',
            Func: () => null
        },
        'S_406': {
            code: 406,
            message: '',
            Func: () => null
        },
        'S_422': {
            code: 422,
            message: '',
            Func: () => null
        },
        'S_500': {
            code: 500,
            message: '',
            Func: () => null
        },
        'default': {
            message: '',
            Func: () => null
        },
    }) => {
        switch (response?.payload?.StatusCode || response?.payload?.Message?.StatusCode) {
            case 200: {
                actions?.S_200?.Func?.();
                actions?.S_200?.message && setToastMessage(actions?.S_200?.message);
                break;
            }
            case 201: {
                actions?.S_201?.Func?.();
                actions?.S_201?.message && setToastMessage(actions?.S_201?.message);
                break;
            }
            case 202: {
                actions?.S_202?.Func?.();
                actions?.S_202?.message && setToastMessage(actions?.S_202?.message);
                setDialog(null);
                getData(null)
                break;
            }
            case 400: {
                actions?.S_400?.Func?.();
                actions?.S_400?.message && setToastMessage(actions?.S_400?.message);
                break;
            }
            case 401: {
                actions?.S_401?.Func?.();
                actions?.S_401?.message && setToastMessage(actions?.S_401?.message);
                break;
            }
            case 405: {
                actions?.S_405?.Func?.();
                actions?.S_405?.message && setToastMessage(actions?.S_405?.message);
                break;
            }
            case 406: {
                actions?.S_406?.Func?.();
                actions?.S_406?.message && setToastMessage(actions?.S_406?.message);
                break;
            }
            case 422: {
                actions?.S_422?.Func?.();
                actions?.S_422?.message && setToastMessage(actions?.S_422?.message);
                break;
            }
            case 500: {
                actions?.S_500?.Func?.();
                actions?.S_500?.message && setToastMessage(actions?.S_500?.message);
                break;
            }
            default: {
                actions?.default?.Func?.();
                actions?.default?.message && setToastMessage(actions?.default?.message);
                setDialog(null);
            }
        }
    }
    const handleDeleteGroup = async () => {
        await dispatch(deleteGroups(selectedGroups));
        await dispatch(getGroupsBySubAccountId())
        setSelectedGroups([]);
        setDialog(null);
        getData(null);
    };
    const showDialog = () => {
        if (dialog !== null) {
            switch (dialog) {
                case DialogType.ADD_GROUP: {
                    return <AddGroupPopUp
                        classes={classes}
                        isOpen={dialog === DialogType.ADD_GROUP}
                        onClose={() => { setDialog(null); setSelectedGroups([]) }}
                        setLoader={setLoader}
                        windowSize={windowSize}
                        ToastMessages={ToastMessages}
                        setToastMessage={setToastMessage}
                        addClientByQuery={false}
                        addAnotherRecCallback={(groupId) => { setSelectedGroups([...selectedGroups, groupId]); setDialog(DialogType.ADD_RECIPIENTS) }}
                        getData={() => getData(null)}
                        handleResponses={(response, actions) => { setDialog(null); handleResponses(response, actions) }}
                    />
                }
                case DialogType.EDIT_GROUP: {
                    return <EditGroupPopup
                        classes={classes}
                        isOpen={dialog === DialogType.EDIT_GROUP}
                        onClose={() => { setDialog(null); setSelectedGroups([]) }}
                        setLoader={setLoader}
                        windowSize={windowSize}
                        ToastMessages={ToastMessages}
                        setToastMessage={setToastMessage}
                        selectedGroup={selectedGroups[0]}
                        openARDialog={() => setDialog(DialogType.ADD_RECIPIENT)}
                        getData={() => getData(null)}
                        handleResponses={(response, actions) => handleResponses(response, actions)}
                    />
                }
                case DialogType.RESET_GROUP: {
                    if (selectedGroups.length === 1) {
                        return <ResetGroupPopup
                            classes={classes}
                            isOpen={dialog === DialogType.RESET_GROUP}
                            onClose={() => { setDialog(null); setSelectedGroups([]) }}
                            setLoader={setLoader}
                            windowSize={windowSize}
                            ToastMessages={ToastMessages}
                            setToastMessage={setToastMessage}
                            selectedGroup={{ GroupID: selectedGroups[0] }}
                            getData={() => getData(null)}
                            handleResponses={(response, actions) => handleResponses(response, actions)}
                        />
                    }
                    return <></>
                }
                case DialogType.ADD_RECIPIENT: {
                    return <AddRecipientPopup
                        classes={classes}
                        isOpen={dialog === DialogType.ADD_RECIPIENT}
                        onClose={() => { setDialog(null); setSelectedGroups([]); }}
                        setLoader={setLoader}
                        windowSize={windowSize}
                        ToastMessages={ToastMessages}
                        setToastMessage={setToastMessage}
                        Groups={groupData?.Groups?.reduce((prevVal, newVal) => [...prevVal, { GroupID: newVal.GroupID, GroupName: newVal.GroupName }], [])}
                        selectedGroups={selectedGroups}
                        selectGroup={(idArr) => setSelectedGroups(idArr)}
                        DialogType={DialogType}
                        setDialog={setDialog}
                        handleResponses={(response, actions) => handleResponses(response, actions)}
                        onRecipientAdded={() => { setDialog(null); getData(null); }}
                        onAnotherRecipientAdded={() => { setDialog(null); getData(null); setDialog(DialogType.ADD_RECIPIENT); }}
                    />;
                }
                case DialogType.ADD_RECIPIENTS: {
                    return <AddBulkRecipientPopup
                        classes={classes}
                        isOpen={dialog === DialogType.ADD_RECIPIENTS}
                        onClose={() => { setDialog(null); setSelectedGroups([]); }}
                        setLoader={setLoader}
                        windowSize={windowSize}
                        ToastMessages={ToastMessages}
                        setToastMessage={setToastMessage}
                        Groups={groupData?.Groups?.reduce((prevVal, newVal) => [...prevVal, { GroupID: newVal.GroupID, GroupName: newVal.GroupName }], [])}
                        selectedGroups={selectedGroups}
                        selectGroup={(idArr) => setSelectedGroups(idArr)}
                        onAddRecipient={handleAddRecipientResponse}
                    />
                }
                case DialogType.DELETE_RECIPIENT:
                case DialogType.UNSUB_RECIPIENT: {
                    return <UnsubscribeOrDeletePopup
                        classes={classes}
                        isOpen={dialog === DialogType.DELETE_RECIPIENT || dialog === DialogType.UNSUB_RECIPIENT}
                        onClose={() => { setDialog(null); setSelectedGroups([]); }}
                        setLoader={setLoader}
                        windowSize={windowSize}
                        ToastMessages={ToastMessages}
                        setToastMessage={setToastMessage}
                        selectedGroups={selectedGroups}
                        dialogType={dialog}
                        getData={() => getData(null)}
                        handleResponses={(response, actions) => handleResponses(response, actions)}
                    />;
                }
                case DialogType.DELETE_GROUP: {
                    return <ConfirmDeletePopUp
                        classes={classes}
                        isOpen={dialog === DialogType.DELETE_GROUP}
                        onClose={() => { setDialog(null); setSelectedGroups([]); }}
                        windowSize={windowSize}
                        handleDeleteGroup={() => handleDeleteGroup()}
                    />
                }
                case DialogType.MESSAGE: {
                    return <AddRecipientResponse
                        classes={classes}
                        isOpen={dialog === DialogType.MESSAGE}
                        onClose={() => { setDialog(null); setSelectedGroups([]); getData(null); }}
                        windowSize={windowSize}
                        title={responseMessage.title}
                        message={responseMessage.message}
                        summary={responseMessage.summary}
                    />
                }
                case DialogType.SIMPLY_CLUB: {
                    if (accountFeatures && accountFeatures.includes('15')) {
                        return <SimplyClubPupup
                            classes={classes}
                            isOpen={dialog === DialogType.SIMPLY_CLUB}
                            onClose={() => { setDialog(null); setSelectedGroups([]) }}
                            windowSize={windowSize}
                            title={responseMessage.title}
                            message={responseMessage.message}
                            summary={responseMessage.summary}
                            setToastMessage={setToastMessage}
                            handleResponses={handleResponses}
                            ToastMessages={ToastMessages}
                            SelectedGroupIds={[...selectedGroups]}
                            setSelectedGroupIds={() => setSelectedGroups([])}
                            getData={() => { setDialog(null); getData(null); }}
                        />
                    }
                    return <></>
                }
                default: {
                    return <></>
                }
            }
        }
        return <></>;
    }

    return (
        <DefaultScreen
            currentPage='groups'
            subPage='groupManagement'
            classes={classes}
            containerClass={clsx(classes.management, classes.mb50)}
        >
            <Box className={classes.mb50}>
                {toastMessage && renderToast()}
                {renderHeader()}
                {renderSearchSection()}
                {windowSize !== 'xs' ? renderManagmentLine() :
                    <Box
                        item
                        xs={windowSize === "xs" && 12}
                        className={clsx(classes.groupsLableContainer, classes.mt20)}
                    >
                        <Typography className={classes.groupsLable}>
                            {`${groupData ? groupData.RecordCount : 0} ${t("common.Groups")}`}
                        </Typography>
                    </Box>
                }
                {renderTableBody()}
                {renderTablePagination()}
                {showConfirmDialog && renderConfirmDialog()}
                {dialog !== null && showDialog()}
                <Loader isOpen={showLoader} showBackdrop={true} />
            </Box>
        </DefaultScreen>
    )
}

export default memo(Groups);