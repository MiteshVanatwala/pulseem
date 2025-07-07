import { useSelector, useDispatch } from 'react-redux';
import React, { useState, useEffect, memo, useRef } from 'react';
import DefaultScreen from '../../DefaultScreen';
import clsx from 'clsx';
import DataTable from "../../../components/Table/DataTable";
import {
    Box, Typography, TableBody, TableRow, TableCell,
    Grid, Button, TextField, Checkbox,
    FormControl,
    FormGroup,
    FormControlLabel
} from '@material-ui/core'
import { PreviewIcon, AddRecipient, AddRecipients, ResetIcon, SettingIcon, AutomationIcon, DeleteIcon } from '../../../assets/images/managment/index'
import { TablePagination, ManagmentIcon } from '../../../components/managment/index'
import FlexGrid from "../../../components/Grids/FlexGrid";
import NameValueGridStructure from "../../../components/Grids/NameValueGridStructure";
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import 'moment/locale/he';
import {
    getGroups,
    deleteGroups,
    getGroupsBySubAccountId
} from "../../../redux/reducers/groupSlice";
import { exportGroupsClients } from '../../../redux/reducers/clientSlice';
import { getAccountExtraData } from "../../../redux/reducers/smsSlice";
import { setRowsPerPage } from '../../../redux/reducers/coreSlice';
import AddGroupPopUp from "./Popup/AddGroupPopUp";
import AddRecipientPopup from "./Popup/AddRecipientPopup";
import ConfirmDeletePopUp from "./Popup/ConfirmDeletePopUp";
import CustomTooltip from "../../../components/Tooltip/CustomTooltip";
import { Loader } from '../../../components/Loader/Loader';
import { MdArrowBackIos, MdArrowForwardIos, MdOutlineLockClock } from "react-icons/md"
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
import ConfirmRadioDialog from '../../../components/DialogTemplates/ConfirmRadioDialog'
import { ExportFileTypes } from '../../../model/Export/ExportFileTypes'
import { SetPageState, GetPageNyName } from '../../../helpers/UI/SessionStorageManager';
import { RenderHtml } from '../../../helpers/Utils/HtmlUtils';
import { Title } from '../../../components/managment/Title';
import queryString from 'query-string';
import { PulseemFeatures } from '../../../model/PulseemFields/Fields';
import { HandleExportData } from '../../../helpers/Export/ExportHelper';
import { ClientStatus, DateFormats } from '../../../helpers/Constants';
import { ReplaceExtraFieldHeader } from '../../../helpers/UI/AccountExtraField';
import { ExportFile } from '../../../helpers/Export/ExportFile';
import Sort from '../../../components/Sort/Sort';
import { SortColumns, SortDirection } from '../../../Models/PushNotifications/Enums';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';

// very first structure for next refactor
// import { GetExtraFields } from '../../../redux/reducers/ExtraFieldsSlice';

const Groups = ({ classes }) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const dateFormat = 'YYYY-MM-DD HH:mm:ss.FFF';
    const { language, windowSize, isRTL, rowsPerPage, CoreToastMessages, userRoles } = useSelector(state => state.core)
    const { accountFeatures } = useSelector(state => state.common);
    const { groupData, ToastMessages, subAccountAllGroups } = useSelector((state) => state.group);
    const { extraData } = useSelector(state => state.sms);
    // New Logic to implement
    // const { extraData } = useSelector(state => state.extraFields);
    const rowsOptions = [6, 10, 20, 50];
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [selectedGroupsExtraData, setSelectedGroupsExtraData] = useState([]);
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
    const [isCombinedRequest, setIsCombinedRequest] = useState(false);
    const [searchStr, setSearchStr] = useState("");
    const [serachData, setSearchData] = useState({
        PageIndex: 1,
        PageSize: rowsPerPage,
        SearchTerm: "",
        IsDynamic: false
    });
    const navigate = useNavigate()
    moment.locale(language);
    const { state } = useLocation();
    const from = state?.from || "/";
    const pageProperty = useRef();
    const qs = (window.location.search && queryString.parse(window.location.search)) || state;
    const exportColumnHeader = useRef(null);
    const [sortDirection, setSortDirection] = useState(SortDirection.DESC);
    const [sortBySelected, setSortBy] = useState(SortColumns.UPDATE_DATE);
    const [exportGroupNames, setExportGroupNames] = useState(false);
    const [showDisallowDeleteFeature, setShowDisallowDeleteFeature] = useState(false);

    useEffect(() => {
        if (extraData && Object.entries(extraData).length > 0) {
            let updatingObject = {
                "Status": t('common.Status'),
                "SmsStatus": t('common.smsStatus'),
                "CreationDate": t('common.CreationDate'),
                "FirstName": t('smsReport.firstName'),
                "LastName": t('smsReport.lastName'),
                "Email": t("common.Mail"),
                "Telephone": t('common.telephone'),
                "Cellphone": t('common.Cellphone'),
                "Address": t('common.address'),
                "BirthDate": t('common.birthDate'),
                "City": t('common.city'),
                "State": t('common.state'),
                "Country": t('common.country'),
                "Zip": t('common.zip'),
                "Company": t('common.company'),
                "ReminderDate": t('recipient.reminderDate'),
                "GroupNames": t('common.Groups'),
            };
            updatingObject = {
                ...updatingObject,
                "ExtraDate1": t('common.ExtraDate1'),
                "ExtraDate2": t('common.ExtraDate2'),
                "ExtraDate3": t('common.ExtraDate3'),
                "ExtraDate4": t('common.ExtraDate4'),
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
            }
            updatingObject = ReplaceExtraFieldHeader(updatingObject, extraData);
            exportColumnHeader.current = updatingObject;
        }
    }, [extraData])

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
        SIMPLY_CLUB: "SIMPLY_CLUB",
        EXPORT_IN_PROGRESS: "EXPORT_IN_PROGRESS",
        MERGE_GROUP: "MERGE_GROUP",
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
            className: classes.flex3,
            align: "center",
        },
        {
            label: t("recipient.sms/mms"),
            classes: cellStyle,
            className: classes.flex3,
            align: "center",
        },
        !userRoles?.HideRecipients && {
            label: "",
            classes: cellStyle,
            className: clsx(classes.flex5),
            align: "center",
        },
    ];

    const groupSortOptions = [
        {
            value: SortColumns.UPDATE_DATE,
            text: t("notifications.sort_by_updated"),
        },
        {
            value: SortColumns.GROUP_NAME,
            text: t("notifications.sort_by_group"),
        },
        {
            value: SortColumns.CREATION_DATE,
            text: t("notifications.sort_by_creation"),
        }
    ];

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
        const search = { ...serachData, PageSize: rowsPerPage, ...customSearch, SortByField: sortBySelected, SortDirection: sortDirection };
        setLoader(true);
        await dispatch(getGroups(search));
        if (!extraData || extraData.length === 0) {
            await dispatch(getAccountExtraData());
            // await dispatch(GetExtraFields());
        }
        setLoader(false);
        getSubAccountGroups();
    };
    const reSearch = () => {
        const queryState = from?.toLowerCase().indexOf('clientsearchresult') > -1;
        pageProperty.current = GetPageNyName('groups');
        let lastSearch = { ...serachData, PageSize: rowsPerPage };
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
    }
    useEffect(() => {
        reSearch();
    }, [dispatch, serachData.PageIndex, rowsPerPage, sortBySelected, sortDirection]);

    useEffect(() => {
        if (serachData.SearchTerm !== '') {
            reSearch();
        }
    }, [dispatch, serachData.SearchTerm, rowsPerPage]);

    useEffect(() => {
        if (qs?.NewGroup === 'true') {
            setDialog(DialogType.ADD_GROUP)
        }
    }, []);

    const handleSortBySelected = (event) => {
        setSearchData({
            ...serachData,
            PageIndex: 1
        });
        setSortBy(event.target.value);
    };

    const handleSortDirection = () => {
        setSearchData({
            ...serachData,
            PageIndex: 1
        });
        const selected = sortDirection === SortDirection.ASC ? SortDirection.DESC : SortDirection.ASC;
        setSortDirection(selected);
    }

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

        return (
            <Grid container spacing={2} className={clsx(windowSize === 'xs' || windowSize === 'sm' ? classes.mt15 : classes.lineTopMarging, 'searchLine')}>
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
                            // getData(searchObject);
                        }}
                        className={clsx(classes.btn, classes.btnRounded)}
                        endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                    >
                        {t("campaigns.btnSearchResource1.Text")}
                    </Button>
                </Grid>
                {serachData.SearchTerm && (
                    <Grid item>
                        <Button
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
                            className={clsx(classes.btn, classes.btnRounded)}
                            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                        >
                            {t("common.clear")}
                        </Button>
                    </Grid>
                )}
                <Grid item className={isRTL ? classes.marginRightAuto : classes.marginLeftAuto} style={{ paddingInline: 25 }}>
                    <Sort
                        sortItems={groupSortOptions}
                        sortBySelected={sortBySelected}
                        sortDirection={sortDirection}
                        handleSortDirection={handleSortDirection}
                        handleSortBySelected={handleSortBySelected}
                        classes={classes}
                    />
                </Grid>
            </Grid>
        );
    };

    const renderManagmentLine = () => {
        const colSize = windowSize === "xs" ? 12 : null;
        return (
            <Grid container spacing={2} className={classes.linePadding}>
                {!userRoles?.HideRecipients && <Grid item xs={colSize}>
                    <Button
                        className={clsx(classes.btn, classes.btnRounded)}
                        endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                        onClick={() => setDialog(DialogType.ADD_GROUP)}

                    >
                        {t("group.new")}
                    </Button>
                </Grid>}
                {!userRoles?.HideRecipients && <Grid item xs={colSize}>
                    <Button
                        className={clsx(classes.btn, classes.btnRounded, selectedGroups.length < 2 ? classes.disabled : null)}
                        endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                        onClick={() => {
                            setIsCombinedRequest(true);
                            setDialog(DialogType.MERGE_GROUP)
                        }}
                    >
                        {t("group.mergeGroup")}
                    </Button>
                </Grid>}
                {userRoles?.AllowDelete && windowSize !== "xs" && (
                    <Grid item>
                        <Button
                            className={clsx(classes.btn, classes.btnRounded)}
                            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                            onClick={() => {
                                selectedGroups.length === 0 ? setToastMessage(ToastMessages.GROUP_ZERO_SELECT) : setDialog(DialogType.DELETE_GROUP)
                            }}
                        >
                            {t("group.delete")}
                        </Button>
                    </Grid>
                )}
                {userRoles?.AllowDelete && <Grid item xs={colSize}>
                    <Button
                        className={clsx(classes.btn, classes.btnRounded)}
                        endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                        onClick={() => selectedGroups.length === 0 ? setToastMessage(ToastMessages.GROUP_ZERO_SELECT) : setDialog(DialogType.DELETE_RECIPIENT)}
                    >
                        {t("recipient.deleteRecipient")}
                    </Button>
                </Grid>}
                {accountFeatures && accountFeatures?.indexOf(PulseemFeatures.SIMPLY_CLUB) > -1 && !userRoles?.HideRecipients && (<Grid item xs={colSize}>
                    <Button
                        className={clsx(classes.btn, classes.btnRounded)}
                        endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                        onClick={() => setDialog(DialogType.SIMPLY_CLUB)}

                    >
                        {t("recipient.externalImport")}
                    </Button>
                </Grid>)}
                {
                    userRoles?.AllowExport && accountFeatures?.indexOf(PulseemFeatures.LOCK_EXPORT_DATA) === -1 &&
                    <Grid item xs={colSize}>
                        <Button
                            className={clsx(classes.btn, classes.btnRounded)}
                            onClick={() => setShowConfirmDialog(true)}
                            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
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
            <Grid container wrap="nowrap" spacing={1} alignItems='center' className={['sm', 'md'].indexOf(windowSize) > -1 ? classes.groupNameCell : ''}>
                {windowSize !== 'xs' && <Grid item sm={2} className={['xs', 'sm'].indexOf(windowSize) > -1 ? classes.flexJustifyCenter : ''}>
                    {
                        <Checkbox
                            // disabled={row.AutomationID}
                            color="primary"
                            checked={selectedGroups && selectedGroups.includes(GroupID)}
                            // indeterminate={}
                            onClick={() => {
                                if (selectedGroups.includes(GroupID)) {
                                    setSelectedGroups(selectedGroups.filter(item => item !== GroupID))
                                    setSelectedGroupsExtraData(selectedGroupsExtraData.filter(item => item.GroupID !== GroupID))
                                } else {
                                    setSelectedGroups([...selectedGroups, GroupID])
                                    const nSelected = groupData.Groups.filter((g) => { return g.GroupID === GroupID });
                                    setSelectedGroupsExtraData([...selectedGroupsExtraData, nSelected[0]]);
                                }
                            }}
                        />
                    }

                </Grid>}
                <Grid item sm={10} className='rowTitle'>
                    <CustomTooltip
                        isSimpleTooltip={false}
                        interactive={true}
                        classes={{
                            tooltip: clsx(classes.tooltipBlack, classes.tooltipPlacement),
                            arrow: classes.fBlack,
                        }}
                        arrow={true}
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
                        {`${text} ${date.format(DateFormats.DATE_TIME_24)}`}
                    </Typography>
                </Grid>
            </Grid>
        );
    };


    const renderCellIcons = (row) => {
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
            PendingClients,
            PendingSmsClients,
        } = row;

        const iconsMap = [
            {
                key: 'preview',
                uIcon: PreviewIcon,
                lable: t("recipient.preview"),
                remove: windowSize === 'xs',
                rootClass: classes.paddingIcon,
                disable: !((
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
                    ) > 0),
                onClick:
                    (e) => {
                        if (!userRoles?.HideRecipients) {
                            navigate(CLIENT_CONSTANTS.BASEURL, {
                                state: {
                                    ...CLIENT_CONSTANTS.QUERY_PARAMS,
                                    PageType: CLIENT_CONSTANTS.PAGE_TYPES.ShowGroup,
                                    GroupIds: [GroupID],
                                    ResultTitle: GroupName,
                                    PageProperty: pageProperty.current
                                }
                            })
                        }
                    }
            },
            {
                key: 'addRecipient',
                uIcon: AddRecipient,
                lable: t("recipient.addRecipient"),
                rootClass: classes.paddingIcon,
                onClick: () => {
                    setSelectedGroups([GroupID])
                    setDialog(DialogType.ADD_RECIPIENT)
                },
            },
            {
                key: 'addRecipients',
                uIcon: AddRecipients,
                lable: t("recipient.addRecipients"),
                rootClass: classes.paddingIcon,
                onClick: () => {
                    setSelectedGroups([GroupID])
                    setDialog(DialogType.ADD_RECIPIENTS)
                },
            },
            {
                key: 'reset',
                uIcon: ResetIcon,
                lable: t("recipient.reset"),
                remove: !userRoles?.AllowDelete || windowSize === 'xs',
                rootClass: classes.paddingIcon,
                onClick: () => {
                    setSelectedGroups([GroupID])
                    setDialog(DialogType.RESET_GROUP)
                },
            },
            {
                key: 'settings',
                uIcon: SettingIcon,
                lable: t("recipient.settings"),
                remove: windowSize === 'xs',
                onClick: () => {
                    setSelectedGroups([GroupID])
                    setDialog(DialogType.EDIT_GROUP)
                },
                rootClass: classes.paddingIcon,
            },
            {
                key: 'automation',
                uIcon: AutomationIcon,
                lable: t("recipient.automation"),
                disable: !AutomationID,
                rootClass: classes.paddingIcon,
                onClick: () => {
                    if (AutomationID)
                        window.open(`/Pulseem/CreateAutomations.aspx?Mode=show&AutomationID=${AutomationID}&fromreact=true`, '_blank');
                }
            },
            {
                key: 'delete',
                uIcon: DeleteIcon,
                lable: t("recipient.delete"),
                remove: !userRoles?.AllowDelete,
                disable: (AutomationID || IsConnectedToWebForm || IsAutoResponder),
                rootClass: classes.paddingIcon,
                onClick: () => {
                    if (!(AutomationID || IsConnectedToWebForm || IsAutoResponder)) {
                        setSelectedGroups([GroupID])
                        setDialog(DialogType.DELETE_GROUP)
                    }
                },
            }
        ]
        return (
            <Grid
                container
                direction='row'
                justifyContent={windowSize === 'xs' ? 'flex-start' : 'center'}
                style={{ flexWrap: 'initial' }}
            >
                {iconsMap.map(icon => (
                    <Grid
                        className={clsx(icon.disable && classes.disabledCursor, 'rowIconContainer', classes.justifyCenter, classes.alignSelfCenter)}
                        key={icon.key}
                        item >
                        <ManagmentIcon
                            classes={classes}
                            {...icon}
                            uIcon={<icon.uIcon width={18} height={20} className={'rowIcon'} />}
                        />
                    </Grid>
                ))}
            </Grid>
        )
    }

    // const REDIRECT_OPTIONS = {
    //     ShowGroup: 0,
    //     ShowMails: 10,
    //     ShowMailsActive: 11,
    //     ShowMailsRemoved: 12,
    //     ShowMailsErrored: 13,
    //     ShowSms: 20,
    //     ShowSmsActive: 21,
    //     ShowSmsRemoved: 22,
    //     ShowSmsErrored: 23
    // };

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
            CreationDate,
            UpdateDate,
            PendingClients,
            PendingSmsClients,
            AutomationID,
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
                            {renderNameCell({ GroupID, GroupName, isChecked: true, CreationDate, UpdateDate, AutomationID })}
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
                <TableCell classes={cellStyle} align="center" className={clsx(classes.flex3)}>
                    <FlexGrid
                        gridArr={[
                            {

                                component: (
                                    <NameValueGridStructure
                                        gridArr={[
                                            {
                                                name: t("campaigns.recipients"),
                                                value: ((ActiveEmails || 0) + (RemovedEmails || 0) + (RestrictedEmails || 0) + (InvalidEmails || 0) + (PendingClients || 0)).toLocaleString(),
                                                classes: {
                                                    name: clsx(colorTextStyle.blue, classes.f09rem, classes.noDecoration, userRoles?.HideRecipients && classes.disabled),
                                                    value: clsx(colorTextStyle.blue, classes.grpDataBoxText, classes.f09rem, classes.noDecoration, userRoles?.HideRecipients && classes.disabled),
                                                    href: ''
                                                },
                                                onClick: (e) => {
                                                    e?.preventDefault();
                                                    if (!userRoles?.HideRecipients && ((ActiveEmails || 0) + (RemovedEmails || 0) + (RestrictedEmails || 0) + (InvalidEmails || 0) + (PendingClients || 0)) > 0) {
                                                        navigate(CLIENT_CONSTANTS.BASEURL, {
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
                                                        })
                                                    }
                                                }
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
                                                value: ActiveEmails.toLocaleString(),
                                                classes: {
                                                    name: clsx(colorTextStyle.green, classes.f09rem, classes.noDecoration, userRoles?.HideRecipients && classes.disabled),
                                                    value: clsx(colorTextStyle.green, classes.grpDataBoxText, classes.f09rem, classes.noDecoration, userRoles?.HideRecipients && classes.disabled),
                                                    href: ''
                                                },
                                                onClick: (e) => {
                                                    e?.preventDefault();
                                                    if (!userRoles?.HideRecipients && (ActiveEmails || 0) > 0) {
                                                        navigate(CLIENT_CONSTANTS.BASEURL, {
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
                                                        })
                                                    }
                                                }
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
                                                value: RemovedEmails.toLocaleString(),
                                                classes: {
                                                    name: clsx(colorTextStyle.red, classes.f09rem, classes.noDecoration, userRoles?.HideRecipients && classes.disabled),
                                                    value: clsx(colorTextStyle.red, classes.grpDataBoxText, classes.f09rem, classes.noDecoration, userRoles?.HideRecipients && classes.disabled),
                                                    href: ''
                                                },
                                                onClick: (e) => {
                                                    e?.preventDefault();
                                                    if (!userRoles?.HideRecipients && (RemovedEmails || 0) > 0) {
                                                        navigate(CLIENT_CONSTANTS.BASEURL, {
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
                                                        })
                                                    }
                                                }
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
                                                value: InvalidEmails.toLocaleString(),
                                                classes: {
                                                    name: clsx(colorTextStyle.red, classes.f09rem, classes.noDecoration, userRoles?.HideRecipients && classes.disabled),
                                                    value: clsx(colorTextStyle.red, classes.grpDataBoxText, classes.f09rem, classes.noDecoration, userRoles?.HideRecipients && classes.disabled),
                                                    href: ''
                                                },
                                                onClick: (e) => {
                                                    e?.preventDefault();
                                                    if (!userRoles?.HideRecipients && (InvalidEmails || 0) > 0) {
                                                        navigate(CLIENT_CONSTANTS.BASEURL, {
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
                                                        })
                                                    }
                                                }
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
                                                value: PendingClients.toLocaleString() || 0,
                                                classes: {
                                                    name: clsx(colorTextStyle.grey, classes.f09rem, classes.noDecoration, userRoles?.HideRecipients && classes.disabled),
                                                    value: clsx(colorTextStyle.grey, classes.grpDataBoxText, classes.f09rem, classes.noDecoration, userRoles?.HideRecipients && classes.disabled),
                                                    href: ''
                                                },
                                                onClick: (e) => {
                                                    e?.preventDefault();
                                                    if (!userRoles?.HideRecipients && (PendingClients || 0) > 0) {
                                                        navigate(CLIENT_CONSTANTS.BASEURL, {
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
                                                        })
                                                    }
                                                }
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

                <TableCell classes={cellStyle} align="center" className={clsx(classes.flex3)}>
                    <FlexGrid
                        gridArr={[
                            {

                                component: (
                                    <NameValueGridStructure
                                        gridArr={[
                                            {
                                                name: t("campaigns.recipients"),
                                                value: ((ActiveCell || 0) + (RemovedCell || 0) + (InvalidCell || 0) + (PendingSmsClients || 0)).toLocaleString(),
                                                classes: {
                                                    name: clsx(colorTextStyle.blue, classes.f09rem, classes.noDecoration, userRoles?.HideRecipients && classes.disabled),
                                                    value: clsx(colorTextStyle.blue, classes.grpDataBoxText, classes.f09rem, classes.noDecoration, userRoles?.HideRecipients && classes.disabled),
                                                    href: ''
                                                },
                                                onClick: (e) => {
                                                    e?.preventDefault();
                                                    if (!userRoles?.HideRecipients && ((ActiveCell || 0) + (RemovedCell || 0) + (InvalidCell || 0) + (PendingSmsClients || 0)) > 0) {
                                                        navigate(CLIENT_CONSTANTS.BASEURL, {
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
                                                        })
                                                    }
                                                }
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
                                                value: ActiveCell.toLocaleString(),
                                                classes: {
                                                    name: clsx(colorTextStyle.green, classes.f09rem, classes.noDecoration, userRoles?.HideRecipients && classes.disabled),
                                                    value: clsx(colorTextStyle.green, classes.grpDataBoxText, classes.f09rem, classes.noDecoration, userRoles?.HideRecipients && classes.disabled),
                                                    href: ''
                                                },
                                                onClick: (e) => {
                                                    e?.preventDefault();
                                                    if (!userRoles?.HideRecipients && (ActiveCell || 0) > 0) {
                                                        navigate(CLIENT_CONSTANTS.BASEURL, {
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
                                                        })
                                                    }
                                                }
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
                                                value: RemovedCell.toLocaleString(),
                                                classes: {
                                                    name: clsx(colorTextStyle.red, classes.f09rem, classes.noDecoration, userRoles?.HideRecipients && classes.disabled),
                                                    value: clsx(colorTextStyle.red, classes.grpDataBoxText, classes.f09rem, classes.noDecoration, userRoles?.HideRecipients && classes.disabled),
                                                    href: ''
                                                },
                                                onClick: (e) => {
                                                    e?.preventDefault();
                                                    if (!userRoles?.HideRecipients && (RemovedCell || 0) > 0) {
                                                        navigate(CLIENT_CONSTANTS.BASEURL, {
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
                                                        })
                                                    }
                                                }
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
                                                value: InvalidCell.toLocaleString(),
                                                classes: {
                                                    name: clsx(colorTextStyle.red, classes.f09rem, classes.noDecoration, userRoles?.HideRecipients && classes.disabled),
                                                    value: clsx(colorTextStyle.red, classes.grpDataBoxText, classes.f09rem, classes.noDecoration, userRoles?.HideRecipients && classes.disabled),
                                                    href: ''
                                                },
                                                onClick: (e) => {
                                                    e?.preventDefault();
                                                    if (!userRoles?.HideRecipients && (InvalidCell || 0) > 0) {
                                                        navigate(CLIENT_CONSTANTS.BASEURL, {
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
                                                        })
                                                    }
                                                }
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
                                                value: PendingSmsClients.toLocaleString() || 0,
                                                classes: {
                                                    name: clsx(colorTextStyle.grey, classes.f09rem, classes.noDecoration, userRoles?.HideRecipients && classes.disabled),
                                                    value: clsx(colorTextStyle.grey, classes.grpDataBoxText, classes.f09rem, classes.noDecoration, userRoles?.HideRecipients && classes.disabled),
                                                    href: ''
                                                },
                                                onClick: (e) => {
                                                    e?.preventDefault();
                                                    if (!userRoles?.HideRecipients && (PendingSmsClients || 0) > 0) {
                                                        navigate(CLIENT_CONSTANTS.BASEURL, {
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
                                                        })
                                                    }
                                                }
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
                {!userRoles?.HideRecipients && <TableCell
                    classes={noBorderCellStyle}
                    align="center"
                    className={clsx(classes.flex5, classes.p0)}
                >
                    {renderCellIcons(row)}
                </TableCell>}
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
            PendingSmsClients
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
                                iconName="delete"
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
                                                value: TotalRecipients?.toLocaleString(),
                                                classes: {
                                                    name: clsx(colorTextStyle.blue, userRoles?.HideRecipients && classes.disabled),
                                                    value: clsx(colorTextStyle.blue, userRoles?.HideRecipients && classes.disabled),
                                                    href: ''
                                                },
                                                onClick: (e) => {
                                                    e?.preventDefault();
                                                    if (!userRoles?.HideRecipients && ((ActiveEmails || 0) + (RemovedEmails || 0) + (RestrictedEmails || 0) + (InvalidEmails || 0)) > 0) {
                                                        navigate(CLIENT_CONSTANTS.BASEURL, {
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
                                                        })
                                                    }
                                                }
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
                                                value: ActiveEmails?.toLocaleString(),
                                                classes: {
                                                    name: clsx(colorTextStyle.green, userRoles?.HideRecipients && classes.disabled),
                                                    value: clsx(colorTextStyle.green, userRoles?.HideRecipients && classes.disabled),
                                                    href: ''
                                                },
                                                onClick: (e) => {
                                                    e?.preventDefault();
                                                    if (!userRoles?.HideRecipients && (ActiveEmails || 0) > 0) {
                                                        navigate(CLIENT_CONSTANTS.BASEURL, {
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
                                                        })
                                                    }
                                                }
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
                                                value: RemovedEmails?.toLocaleString(),
                                                classes: {
                                                    name: clsx(colorTextStyle.red, userRoles?.HideRecipients && classes.disabled),
                                                    value: clsx(colorTextStyle.red, userRoles?.HideRecipients && classes.disabled),
                                                    href: ''
                                                },
                                                onClick: (e) => {
                                                    e?.preventDefault();
                                                    if (!userRoles?.HideRecipients && (RemovedEmails || 0) > 0) {
                                                        navigate(CLIENT_CONSTANTS.BASEURL, {
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
                                                        })
                                                    }
                                                }
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
                                                value: InvalidEmails?.toLocaleString(),
                                                classes: {
                                                    name: clsx(colorTextStyle.red, userRoles?.HideRecipients && classes.disabled),
                                                    value: clsx(colorTextStyle.red, userRoles?.HideRecipients && classes.disabled),
                                                    href: ''
                                                },
                                                onClick: (e) => {
                                                    e?.preventDefault();
                                                    if (!userRoles?.HideRecipients && (InvalidEmails || 0) > 0) {
                                                        navigate(CLIENT_CONSTANTS.BASEURL, {
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
                                                        })
                                                    }
                                                }
                                            }]} />),

                                },
                                {

                                    component: (
                                        accountFeatures.includes("6") && PendingClients > 0 && <NameValueGridStructure
                                            rootClass={classes.textCenter}
                                            gridSize={{ xs: 12, sm: 12 }}
                                            gridArr={[{
                                                name: t("recipient.Pending"),
                                                value: PendingClients?.toLocaleString() || 0,
                                                classes: {
                                                    name: clsx(colorTextStyle.grey, userRoles?.HideRecipients && classes.disabled),
                                                    value: clsx(colorTextStyle.grey, userRoles?.HideRecipients && classes.disabled),
                                                    href: ''
                                                },
                                                onClick: (e) => {
                                                    e?.preventDefault();
                                                    if (!userRoles?.HideRecipients && (PendingSmsClients || 0) > 0) {
                                                        navigate(CLIENT_CONSTANTS.BASEURL, {
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
                                                        })
                                                    }
                                                }
                                            }]} />
                                    ),

                                },

                            ]}
                            textVariant="body1"
                            align="center"
                        />
                    </Box>
                    <Box className={classes.mt3}>
                        <Typography style={{ maxWidth: '100%' }} className={clsx(classes.nameEllipsis, classes.fullWidth)}>{t("appBar.sms.title")}</Typography>
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
                                                value: TotalRecipients?.toLocaleString(),
                                                classes: {
                                                    name: clsx(colorTextStyle.blue, userRoles?.HideRecipients && classes.disabled),
                                                    value: clsx(colorTextStyle.blue, userRoles?.HideRecipients && classes.disabled),
                                                    href: ''
                                                },
                                                onClick: (e) => {
                                                    e?.preventDefault();
                                                    if (!userRoles?.HideRecipients && ((ActiveCell || 0) + (RemovedCell || 0) + (InvalidCell || 0)) > 0) {
                                                        navigate(CLIENT_CONSTANTS.BASEURL, {
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
                                                        })
                                                    }
                                                }
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
                                                value: ActiveCell?.toLocaleString(),
                                                classes: {
                                                    name: clsx(colorTextStyle.green, userRoles?.HideRecipients && classes.disabled),
                                                    value: clsx(colorTextStyle.green, userRoles?.HideRecipients && classes.disabled),
                                                    href: ''
                                                },
                                                onClick: (e) => {
                                                    e?.preventDefault();
                                                    if (!userRoles?.HideRecipients && (ActiveCell || 0) > 0) {
                                                        navigate(CLIENT_CONSTANTS.BASEURL, {
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
                                                        })
                                                    }
                                                }
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
                                                value: RemovedCell?.toLocaleString(),
                                                classes: {
                                                    name: clsx(colorTextStyle.red, userRoles?.HideRecipients && classes.disabled),
                                                    value: clsx(colorTextStyle.red, userRoles?.HideRecipients && classes.disabled),
                                                    href: ''
                                                },
                                                onClick: (e) => {
                                                    e?.preventDefault();
                                                    if (!userRoles?.HideRecipients && (RemovedCell || 0) > 0) {
                                                        navigate(CLIENT_CONSTANTS.BASEURL, {
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
                                                        })
                                                    }
                                                }
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
                                                value: InvalidCell?.toLocaleString(),
                                                classes: {
                                                    name: clsx(colorTextStyle.red, userRoles?.HideRecipients && classes.disabled),
                                                    value: clsx(colorTextStyle.red, userRoles?.HideRecipients && classes.disabled),
                                                    href: ''
                                                },
                                                onClick: (e) => {
                                                    e?.preventDefault();
                                                    if (!userRoles?.HideRecipients && (InvalidCell || 0) > 0) {
                                                        navigate(CLIENT_CONSTANTS.BASEURL, {
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
                                                        })
                                                    }
                                                }
                                            }]} />),

                                },
                                {

                                    component: (
                                        accountFeatures?.indexOf(PulseemFeatures.OPTIN) > -1 && PendingSmsClients > 0 && <NameValueGridStructure
                                            rootClass={classes.textCenter}
                                            gridSize={{ xs: 12, sm: 12 }}
                                            gridArr={[{
                                                name: t("recipient.Pending"),
                                                value: PendingSmsClients?.toLocaleString() || 0,
                                                classes: {
                                                    name: clsx(colorTextStyle.grey, userRoles?.HideRecipients && classes.disabled),
                                                    value: clsx(colorTextStyle.grey, userRoles?.HideRecipients && classes.disabled),
                                                    href: ''
                                                },
                                                onClick: (e) => {
                                                    e?.preventDefault();
                                                    if (!userRoles?.HideRecipients && (PendingClients || 0) > 0) {
                                                        navigate(CLIENT_CONSTANTS.BASEURL, {
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
                                                        })
                                                    }
                                                }
                                            }]
                                            } />
                                    ),
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
                        className: windowSize === "xs" ? classes.dNone : null,
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
        dispatch(setRowsPerPage(`${val}`))
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
                setResponseMessage({ title: t("recipient.bulkImportTitle"), message: RenderHtml(t("recipient.importResponses.fileUploaded")) })
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
    const handleDownloadFile = async (response, formatType) => {
        let orderList = await response?.Clients.map((client) => {
            let tempStatus = ClientStatus.Email.find((status) => status.id === client.Status)
            let tempSmsStatus = ClientStatus.Sms.find((status) => status.id === client.SmsStatus)
            client.Status = t(tempStatus.value);
            client.SmsStatus = t(tempSmsStatus.value);
            return client;
        }, []);


        const fields = { ...exportColumnHeader.current };

        delete fields["Revenue"];
        delete fields["SendDate"];
        !exportGroupNames && delete fields["GroupNames"];

        const exportOptions = {
            OrderItems: true,
            FormatDate: true,
            ConvertStatusToString: false,
            Order: Object.keys(fields),
            ReplaceNull: true
        };

        HandleExportData(orderList, exportOptions).then(async (result) => {

            ExportFile({
                data: result,
                exportType: formatType,
                fields: fields,
                fileName: 'PulseemClientsExport'
            });
        });
    }
    const handleConfirmExport = async (formatType, notifyEmail) => {
        setShowConfirmDialog(false);
        setLoader(true);
        const group = subAccountAllGroups.find((g) => { return g.GroupID === selectedGroups[0] });

        const requestObject = {
            GroupIds: selectedGroups,
            NotifyEmail: notifyEmail,
            FileType: formatType,
            Culture: isRTL ? 0 : 1,
            FileName: selectedGroups.length === 1 ? group.GroupName : 'PulseemGroups',
            ExportGroupNames: exportGroupNames
        };

        try {
            const response = await dispatch(exportGroupsClients(requestObject));

            switch (response?.payload?.StatusCode) {
                case 201: { // Donwloadable
                    handleDownloadFile(response?.payload, formatType);
                    break;
                }
                case 202: { // Run in background
                    setResponseMessage({
                        title: '',
                        message:
                            RenderHtml(t("recipient.exportGroups.inProgress")
                                .replace("##notifyEmailPlaceHolder##", notifyEmail !== null ? t('recipient.exportGroups.inProgressNotifyOnDone')
                                    .replace("##notifyEmail##", `<b>${notifyEmail}</b>`) : t('recipient.exportGroups.downloadPageRedirect')))
                    })
                    setDialog(DialogType.MESSAGE);
                    break;
                }
                case 403: { // Feature not allowed
                    break;
                }
                case 405: {
                    setResponseMessage({ title: '', message: RenderHtml(t("recipient.exportGroups.exportLimitationErrorMessage")) })
                    setDialog(DialogType.MESSAGE);
                    break;
                }

                default:
                case 500: {
                    setResponseMessage({ title: '', message: t("common.somethingWentWrong") })
                    setDialog(DialogType.MESSAGE);
                    break;
                }
            }
        } catch (e) {
            // Log
        }
        finally {
            setLoader(false);
            setExportGroupNames(false);
        }
    }
    const renderConfirmDialog = () => {
        let csvOnly = false;
        let exportTypeOptions = ExportFileTypes;

        if (selectedGroups && selectedGroups.length > 0) {
            const clientsTotalCount = [...groupData?.Groups].filter((g) => {
                return selectedGroups.includes(g.GroupID);
            }).reduce(
                (accumulator, currentValue) => {
                    return accumulator + currentValue.TotalRecipients
                }, 0);

            if (clientsTotalCount > 100000) {
                csvOnly = true;
                exportTypeOptions = [[...ExportFileTypes].pop()];
            }
        }
        else {
            csvOnly = true;
            exportTypeOptions = [[...ExportFileTypes].pop()];
        }

        return (
            <ConfirmRadioDialog
                classes={classes}
                isOpen={showConfirmDialog}
                title={t('common.ExportGroups')}
                text={!selectedGroups || selectedGroups.length === 0 ? t('common.IsExportAllGroups') : selectedGroups.length === 1 ? t("common.IsExportGroup") : t("common.IsExportGroups")}
                radioTitle={csvOnly ? '' : t('common.SelectFormat')}
                onConfirm={(e, notifyEmail) => handleConfirmExport(e, notifyEmail)}
                onCancel={() => { setShowConfirmDialog(false); setExportGroupNames(false) }}
                cookieName={'exportFormat'}
                defaultValue={csvOnly ? 'csv' : 'xlsx'}
                showEmailToNotify={csvOnly}
                options={csvOnly ? null : exportTypeOptions}
                exportGroupNames={<FormControl>
                    <FormGroup>
                        <FormControlLabel
                            title={t('group.exportGroupNamesTooltip')}
                            control={
                                <Checkbox
                                    color="primary"
                                    inputProps={{ "aria-label": "secondary checkbox" }}
                                    onClick={() => setExportGroupNames(!exportGroupNames)}
                                    checked={exportGroupNames}
                                />
                            }
                            label={t("group.exportGroupNames")}
                        />
                    </FormGroup>
                </FormControl>}
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
        'S_403': {
            code: 403,
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
                // setDialog(null);
                getData(null)
                break;
            }
            case 202: {
                actions?.S_202?.Func?.();
                actions?.S_202?.message && setToastMessage(actions?.S_202?.message);
                // setDialog(null);
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
            case 403: {
                setToastMessage(CoreToastMessages?.XSS_ERROR);
                // actions?.403?.Func?.();
                // actions?.403?.message && setToastMessage(CoreToastMessages?.XSS_ERROR);
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
        setDialog(null);
        setLoader(true);
        const existFeatures = selectedGroupsExtraData.filter((g) => {
            return (g.AutomationID && g.AutomationID > 0) || g.IsAutoResponder || g.IsConnectedToWebForm
        });

        if (existFeatures?.length > 0) {
            setShowDisallowDeleteFeature(true);
        }
        else {
            await dispatch(deleteGroups(selectedGroups));
            setToastMessage(ToastMessages.GROUP_DELETED);
            await dispatch(getGroupsBySubAccountId());
            getData(null);
        }
        setSelectedGroups([]);
        setSelectedGroupsExtraData([]);
        setLoader(false);
    };
    const disallowDeleteFeature = () => {
        return <BaseDialog
            title={t('common.payAttention')}
            children={<>
                {RenderHtml(t('group.featuredDisallowDeleteGroup'))}
            </>}
            open={showDisallowDeleteFeature}
            classes={classes}
            confirmText={t("common.Ok")}
            disableBackdropClick={true}
            onCancel={() => {
                setShowDisallowDeleteFeature(false);
            }}
            onClose={() => {
                setShowDisallowDeleteFeature(false);
            }}
            onConfirm={() => {
                setShowDisallowDeleteFeature(false);
            }}
            showDefaultButtons={false}
            renderTitle={null}
            renderButtons={() => {
                return <>
                    <Grid container spacing={2} className={classes.linePadding} style={{ justifyContent: 'flex-end' }}>
                        <Grid item>
                            <Button
                                className={clsx(
                                    classes.btn,
                                    classes.btnRounded,
                                    classes.middle
                                )}
                                variant='contained'
                                size='medium'
                                component="a"
                                onClick={() =>
                                    setShowDisallowDeleteFeature(false)
                                }
                            >
                                {t('common.close')}
                            </Button>
                        </Grid>

                    </Grid>
                </>
            }}
        />
    }

    const handleCombinedResponses = (response, action) => {
        console.log(action);
        if (response?.payload?.GroupID && response?.payload?.GroupID > 0) {
            setToastMessage(ToastMessages.GROUP_CREATED);
            getData(null);
        }
        else {
            setToastMessage(ToastMessages.ERROR_OCCURED);
        }
        setSelectedGroups([])
    }

    const showDialog = () => {
        if (dialog !== null) {
            switch (dialog) {
                case DialogType.ADD_GROUP: {
                    return <AddGroupPopUp
                        isCombinedRequest={false}
                        isDynamic={false}
                        classes={classes}
                        isOpen={dialog === DialogType.ADD_GROUP}
                        onClose={() => {
                            setDialog(null);
                            setSelectedGroups([])
                        }}
                        onCancel={() => {
                            setDialog(null);
                            setSelectedGroups([])
                        }}
                        windowSize={windowSize}
                        ToastMessages={ToastMessages}
                        setToastMessage={setToastMessage}
                        addClientByQuery={false}
                        addAnotherRecCallback={(groupId) => {
                            setSelectedGroups([...selectedGroups, groupId]);
                            setDialog(DialogType.ADD_RECIPIENTS)
                        }}
                        getData={() => getData(null)}
                        handleResponses={(response, actions) => { setDialog(null); handleResponses(response, actions) }}
                    />
                }
                case DialogType.MERGE_GROUP: {
                    return <AddGroupPopUp
                        classes={classes}
                        isCombinedRequest={true}
                        selectedGroupId={selectedGroups}
                        isOpen={dialog === DialogType.MERGE_GROUP}
                        onClose={() => { setDialog(null); setSelectedGroups([]) }}
                        setLoader={setLoader}
                        ToastMessages={ToastMessages}
                        setToastMessage={setToastMessage}
                        getData={() => getData(null)}
                        handleResponses={(response, actions) => { setDialog(null); handleCombinedResponses(response, actions) }}
                    />
                }
                case DialogType.EDIT_GROUP: {
                    return <EditGroupPopup
                        isDynamic={false}
                        classes={classes}
                        isOpen={dialog === DialogType.EDIT_GROUP}
                        onClose={() => { setDialog(null); setSelectedGroups([]) }}
                        onCancel={() => { setDialog(null); setSelectedGroups([]) }}
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
                            onCancel={() => { setDialog(null); setSelectedGroups([]) }}
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
                        onCancel={() => { setDialog(null); setSelectedGroups([]); }}
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
                        onCancel={() => { setDialog(null); setSelectedGroups([]); }}
                        setLoader={setLoader}
                        windowSize={windowSize}
                        ToastMessages={ToastMessages}
                        setToastMessage={setToastMessage}
                        Groups={groupData?.Groups?.reduce((prevVal, newVal) => [...prevVal, { GroupID: newVal.GroupID, GroupName: newVal.GroupName }], [])}
                        selectedGroups={selectedGroups}
                        selectGroup={(idArr) => setSelectedGroups(idArr)}
                        onAddRecipient={(_, result) => handleAddRecipientResponse(result)}
                    />
                }
                case DialogType.DELETE_RECIPIENT:
                case DialogType.UNSUB_RECIPIENT: {
                    return <UnsubscribeOrDeletePopup
                        classes={classes}
                        isOpen={dialog === DialogType.DELETE_RECIPIENT || dialog === DialogType.UNSUB_RECIPIENT}
                        onClose={() => { setDialog(null); setSelectedGroups([]); setSelectedGroupsExtraData([]) }}
                        onCancel={() => { setDialog(null); setSelectedGroups([]); setSelectedGroupsExtraData([]) }}
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
                        onClose={() => { setDialog(null); setSelectedGroups([]); setSelectedGroupsExtraData([]) }}
                        onCancel={() => { setDialog(null); setSelectedGroups([]); setSelectedGroupsExtraData([]) }}
                        windowSize={windowSize}
                        handleDeleteGroup={() => handleDeleteGroup()}
                    />
                }
                case DialogType.MESSAGE: {
                    return <AddRecipientResponse
                        classes={classes}
                        isOpen={dialog === DialogType.MESSAGE}
                        onClose={() => { setDialog(null); setSelectedGroups([]); getData(null); }}
                        onCancel={() => { setDialog(null); setSelectedGroups([]); getData(null); }}
                        windowSize={windowSize}
                        title={responseMessage.title}
                        message={responseMessage.message}
                        summary={responseMessage.summary}
                    />
                }
                case DialogType.SIMPLY_CLUB: {
                    if (accountFeatures && accountFeatures?.indexOf(PulseemFeatures.SIMPLY_CLUB) > -1) {
                        return <SimplyClubPupup
                            classes={classes}
                            isOpen={dialog === DialogType.SIMPLY_CLUB}
                            onClose={() => { setDialog(null); setSelectedGroups([]) }}
                            onCancel={() => { setDialog(null); setSelectedGroups([]) }}
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
                <Box className={'topSection'}>

                    <Title Text={t('recipient.logPageHeaderResource1.Text')} classes={classes} />
                    {renderSearchSection()}
                </Box>
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
                {showDisallowDeleteFeature && disallowDeleteFeature()}
                {dialog !== null && showDialog()}
                <Loader isOpen={showLoader} showBackdrop={true} />
            </Box>
        </DefaultScreen>
    )
}

export default memo(Groups);