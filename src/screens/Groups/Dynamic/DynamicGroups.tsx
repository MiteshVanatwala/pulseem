import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect, memo, useRef } from 'react';
import DefaultScreen from '../../DefaultScreen';
import clsx from 'clsx';
import DataTable from "../../../components/Table/DataTable";
import {
    Box, Typography, TableBody, TableRow, TableCell,
    Grid, Button, TextField, Checkbox, GridSize
} from '@material-ui/core'
import { PreviewIcon, ResetIcon, SettingIcon, AutomationIcon, DeleteIcon, EditIcon } from '../../../assets/images/managment/index'
import { TablePagination, ManagmentIcon } from '../../../components/managment/index'
import FlexGrid from "../../../components/Grids/FlexGrid";
import NameValueGridStructure from "../../../components/Grids/NameValueGridStructure";
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import 'moment/locale/he';
import {
    exportGroupsClients,
    deleteGroups,
    ClientExportRequest
} from "../../../redux/reducers/DynamicGroupsSlice";
import { getAccountExtraData } from "../../../redux/reducers/smsSlice";
import { setRowsPerPage } from '../../../redux/reducers/coreSlice';
import AddGroupPopUp from '../Management/Popup/AddGroupPopUp';
import ConfirmDeletePopUp from '../Management/Popup/ConfirmDeletePopUp';
import CustomTooltip from "../../../components/Tooltip/CustomTooltip";
import { Loader } from '../../../components/Loader/Loader';
import { MdArrowBackIos, MdArrowForwardIos, MdOutlineLockClock } from "react-icons/md"
import { RiPagesLine } from "react-icons/ri"
import IconWrapper from "../../../components/icons/IconWrapper";
import EditGroupPopup from '../Management/Popup/EditGroupPopup';
import ResetGroupPopup from '../Management/Popup/ResetGroupPopup';
import Toast from '../../../components/Toast/Toast.component';
import { useNavigate, useLocation } from 'react-router';
import { CLIENT_CONSTANTS } from '../../../model/Clients/Contants';
import ConfirmRadioDialog from '../../../components/DialogTemplates/ConfirmRadioDialog'
import { ExportFileTypes } from '../../../model/Export/ExportFileTypes'
import { SetPageState, GetPageNyName, PageProperty, ClearPageState } from '../../../helpers/UI/SessionStorageManager';
import { RenderHtml } from '../../../helpers/Utils/HtmlUtils';
import { Title } from '../../../components/managment/Title';
import { PulseemFeatures } from '../../../model/PulseemFields/Fields';
import { HandleExportData } from '../../../helpers/Export/ExportHelper';
import { ClientStatus } from '../../../helpers/Constants';
import { ReplaceExtraFieldHeader } from '../../../helpers/UI/AccountExtraField';
import { ExportFile } from '../../../helpers/Export/ExportFile';
import { Client } from '../../../Models/Clients/Client';
import queryString from 'query-string';
import {
    getGroups,
    getGroupsBySubAccountId
} from "../../../redux/reducers/groupSlice";
import { GroupData } from '../../../Models/Groups/Group';
import { sitePrefix } from '../../../config';
import AddRecipientResponse from '../Management/Popup/AddRecipientResponse';

const DynamicGroups = ({ classes }: any) => {
    const dispatch: any = useDispatch();
    const { t } = useTranslation();
    const dateFormat = 'YYYY-MM-DD HH:mm:ss.FFF';
    const { extraData } = useSelector((state: any) => state.sms);
    const { accountFeatures } = useSelector((state: any) => state.common);
    const { groupData, ToastMessages, subAccountAllGroups } = useSelector((state: any) => state.group);
    const { language, windowSize, isRTL, rowsPerPage, CoreToastMessages } = useSelector((state: any) => state.core)
    const rowsOptions = [6, 10, 20, 50];
    const [selectedGroups, setSelectedGroups] = useState<any>([]);
    const rowStyle = { head: classes.tableRowReportHead, root: clsx(classes.tableRowRoot) };
    const cellStyle = { head: classes.tableCellHead, body: classes.tableCellBody, root: clsx(classes.tableCellRoot) };
    const cellBodyStyle = { body: clsx(classes.tableCellBody), root: clsx(classes.tableCellRoot, classes.tableCellRootResponsive) };
    const noBorderCellStyle = { body: classes.tableCellBodyNoBorder, root: clsx(classes.tableCellRoot, classes.minWidth50) };
    const colorTextStyle = { red: classes.textColorRed, blue: classes.textColorBlue, green: classes.sendIconText, grey: classes.textColorGrey };
    const [toastMessage, setToastMessage] = useState<any | never>(null);
    const [showLoader, setLoader] = useState(true);
    const [responseMessage, setResponseMessage] = useState({ title: "", message: "", summary: null });
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [dialog, setDialog] = useState<any | never>(null);
    const [searchStr, setSearchStr] = useState("");
    const [serachData, setSearchData] = useState<any>({
        PageIndex: 1,
        PageSize: rowsPerPage,
        SearchTerm: "",
        IsDynamic: true
    });
    const navigate = useNavigate()
    moment.locale(language);
    const { state } = useLocation();
    const from = state?.from || "/";
    const pageProperty = useRef<any>();
    const qs = (window.location.search && queryString.parse(window.location.search)) || state;
    const exportColumnHeader = useRef(null);

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
            } as any;
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
        EXPORT_IN_PROGRESS: "EXPORT_IN_PROGRESS"
    };
    const TABLE_HEAD = [
        {
            label: t("common.GroupName"),
            classes: cellStyle,
            className: classes.flex3,
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
            className: clsx(classes.flex3),
            align: "center",
        },
        {
            label: "",
            classes: cellStyle,
            className: clsx(classes.flex3),
            align: "center",
        },
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

    const getData = async (customSearch: any | never = null) => {
        const search: any = { ...serachData, PageSize: rowsPerPage || 6, ...customSearch };
        setLoader(true);
        // @ts-ignore
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
        const queryState = from?.toLowerCase().indexOf('editdynamicgroup') > -1;
        if (queryState || serachData.SearchTerm !== '') {
            reSearch();
        }
        else {
            getData();
        }
    }, [serachData.SearchTerm]);

    // useEffect(() => {
    //     getData();
    // }, [])

    const reSearch = () => {
        const queryState = from?.toLowerCase().indexOf('editdynamicgroup') > -1;
        pageProperty.current = GetPageNyName('dynamicGroups');
        let lastSearch = { ...serachData, PageSize: rowsPerPage };
        if (queryState && pageProperty.current) {
            let tempSearchData = pageProperty.current?.SearchData;
            lastSearch = { ...serachData, ...tempSearchData, PageIndex: pageProperty.current?.PageNumber ?? 1 };
            ClearPageState();
        }

        SetPageState({
            "PageName": "dynamicGroups",
            "PageNumber": lastSearch?.PageNumber,
            "SearchData": lastSearch,
            "SearchTerm": lastSearch.SearchTerm,
            "IsDynamic": true
        } as PageProperty);

        if (lastSearch?.SearchTerm) {
            setSearchStr(lastSearch?.SearchTerm ?? "");
        }

        setSearchData(lastSearch);
        getData(lastSearch);
    }

    useEffect(() => {
        if (qs?.NewGroup === 'true') {
            setDialog(DialogType.ADD_GROUP)
        }
    }, [])

    const renderSearchSection = () => {
        const handleKeyDown = (event: any) => {
            if (event.keyCode === 13 || event.code === "Enter") {
                initPageState(rowsPerPage, 1);
            }
        };

        return (
            <Grid container spacing={2} className={clsx(classes.lineTopMarging, 'searchLine')}>
                <Grid item>
                    <TextField
                        variant="outlined"
                        size="small"
                        value={searchStr}
                        onKeyPress={handleKeyDown}
                        onChange={(e: any) => setSearchStr(e.target.value)}
                        className={clsx(classes.textField, classes.minWidth252)}
                        placeholder={t("common.GroupName")}
                    />
                </Grid>
                <Grid item>
                    <Button
                        onClick={() => {
                            initPageState(rowsPerPage, 1);
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
                                    IsDynamic: true
                                };
                                setSearchData(searchObject);

                                SetPageState({
                                    "PageName": "dynamicGroups",
                                    "PageNumber": 1,
                                    "SearchData": searchObject,
                                    "SearchTerm": "",
                                    "IsDynamic": true
                                } as PageProperty);

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
            </Grid>
        );
    };

    const renderManagmentLine = () => {
        const colSize = windowSize === "xs" ? 12 : undefined;
        return (
            <Grid container spacing={2} className={classes.linePadding}>
                <Grid item xs={colSize}>
                    <Button
                        className={clsx(classes.btn, classes.btnRounded)}
                        endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                        onClick={() => setDialog(DialogType.ADD_GROUP)}
                    >
                        {t("group.new")}
                    </Button>
                </Grid>
                {windowSize !== "xs" && (
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
                {
                    accountFeatures?.indexOf(PulseemFeatures.LOCK_EXPORT_DATA) === -1 &&
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

    const renderNameCell = (row: GroupData) => {
        let date = null;
        const { GroupID, GroupName } = row;
        let text = "";
        if (!row.UpdateDate) {
            date = moment(row?.CreationDate, dateFormat);
            text = t("common.CreatedOn");
        } else {
            date = moment(row?.UpdateDate, dateFormat);
            text = t("common.UpdatedOn");
        }

        return (
            <Grid container wrap="nowrap" spacing={1} alignItems='center'>
                {windowSize !== 'xs' && <Grid item sm={2} className={['xs', 'sm'].indexOf(windowSize) > -1 ? classes.flexJustifyCenter : ''}>
                    <Checkbox
                        color="primary"
                        checked={selectedGroups && selectedGroups.indexOf(GroupID as never) > -1}
                        onClick={() => {
                            if (selectedGroups.indexOf(GroupID as never) > -1) {
                                setSelectedGroups(selectedGroups.filter((item: any) => item !== GroupID))
                            } else {
                                setSelectedGroups([...selectedGroups, GroupID])
                            }
                        }}
                    />

                </Grid>}
                <Grid item sm={10} className='rowTitle'>
                    {/* @ts-ignore */}
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
                        <Typography className={clsx(classes.nameEllipsis, classes.groupName)}>
                            {GroupName}
                        </Typography>
                    </CustomTooltip>
                    <Typography className={clsx(classes.grayTextCell, classes.date)}>
                        {`${text} ${date.format("DD/MM/YYYY")} ${date.format("LT")}`}
                    </Typography>
                </Grid>
            </Grid>
        );
    };


    const renderCellIcons = (row: GroupData) => {
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
                    (e: any) => {
                        navigate(CLIENT_CONSTANTS.BASEURL, {
                            state: {
                                ...CLIENT_CONSTANTS.QUERY_PARAMS,
                                PageType: CLIENT_CONSTANTS.PAGE_TYPES.ShowGroup,
                                GroupIds: [GroupID],
                                ResultTitle: GroupName,
                                PageProperty: pageProperty.current,
                                IsDynamic: true
                            }
                        })
                    }
            },
            {
                key: 'edit',
                uIcon: EditIcon,
                lable: t('campaigns.Image2Resource1.ToolTip'),
                rootClass: classes.paddingIcon,
                onClick: () => {
                    navigate(`${sitePrefix}groups/dynamic/edit/${GroupID}`)
                }
            },
            {
                key: 'reset',
                uIcon: ResetIcon,
                lable: t("recipient.reset"),
                remove: windowSize === 'xs',
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
                direction={windowSize === 'sm' ? 'column' : 'row'}
                justifyContent={windowSize === 'xs' ? 'flex-start' : 'space-between'}
                className={classes.paddingSides15}
            >
                {iconsMap.map(icon => (
                    <Grid
                        className={clsx(icon.disable && classes.disabledCursor, classes.smallActionIcons, 'rowIconContainer', classes.justifyCenter, classes.alignSelfCenter)}
                        key={icon.key}
                        item >
                        {/* @ts-ignore */}
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

    const renderRow = (row: GroupData) => {
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
        } = row;
        let iconsCells = [row.IsAutoResponder, row.IsConnectedToWebForm].filter((e: any) => {
            return e === true
        }).length as Number;

        const colSize = 12 - parseInt(iconsCells.toString()) as GridSize;

        return (
            <TableRow
                key={GroupID}
                classes={rowStyle}
                className={clsx(classes.maxHeightReponsive)}
            >
                <TableCell
                    classes={cellBodyStyle}
                    align='center'
                    className={clsx(classes.flex3)}>
                    <Grid container direction="row">
                        <Grid item sm={colSize}>
                            {renderNameCell({ GroupID, GroupName, IsChecked: true, CreationDate, UpdateDate } as GroupData)}
                        </Grid>
                        {
                            row.IsAutoResponder === true ? (
                                <Grid item sm={1} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {/* @ts-ignore */}
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
                                    {/* @ts-ignore */}
                                    <CustomTooltip
                                        isSimpleTooltip={true}
                                        // iconStyle={{ color: '#000' } as never}
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
                                                value: (ActiveEmails || 0) + (RemovedEmails || 0) + (RestrictedEmails || 0) + (InvalidEmails || 0) + (PendingClients || 0),
                                                classes: {
                                                    name: clsx(colorTextStyle.blue, classes.f09rem, classes.noDecoration),
                                                    value: clsx(colorTextStyle.blue, classes.grpDataBoxText, classes.f09rem, classes.noDecoration),
                                                    href: ''
                                                },
                                                onClick: (e: any) => {
                                                    e?.preventDefault();
                                                    if (((ActiveEmails || 0) + (RemovedEmails || 0) + (RestrictedEmails || 0) + (InvalidEmails || 0) + (PendingClients || 0)) > 0) {
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
                                        gridSize={{ xs: 12, sm: 12 }}
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
                                                    name: clsx(colorTextStyle.green, classes.f09rem, classes.noDecoration),
                                                    value: clsx(colorTextStyle.green, classes.grpDataBoxText, classes.f09rem, classes.noDecoration),
                                                    href: ''
                                                },
                                                onClick: (e: any) => {
                                                    e?.preventDefault();
                                                    if ((ActiveEmails || 0) > 0) {
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
                                        gridSize={{ xs: 12, sm: 12 }}
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
                                                    name: clsx(colorTextStyle.red, classes.f09rem, classes.noDecoration),
                                                    value: clsx(colorTextStyle.red, classes.grpDataBoxText, classes.f09rem, classes.noDecoration),
                                                    href: ''
                                                },
                                                onClick: (e: any) => {
                                                    e?.preventDefault();
                                                    if ((RemovedEmails || 0) > 0) {
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
                                        gridSize={{ xs: 12, sm: 12 }}
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
                                                    name: clsx(colorTextStyle.red, classes.f09rem, classes.noDecoration),
                                                    value: clsx(colorTextStyle.red, classes.grpDataBoxText, classes.f09rem, classes.noDecoration),
                                                    href: ''
                                                },
                                                onClick: (e: any) => {
                                                    e?.preventDefault();
                                                    if ((InvalidEmails || 0) > 0) {
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
                                        gridSize={{ xs: 12, sm: 12 }}
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
                                                    name: clsx(colorTextStyle.grey, classes.f09rem, classes.noDecoration),
                                                    value: clsx(colorTextStyle.grey, classes.grpDataBoxText, classes.f09rem, classes.noDecoration),
                                                    href: ''
                                                },
                                                onClick: (e: any) => {
                                                    e?.preventDefault();
                                                    if ((PendingClients || 0) > 0) {
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
                                        gridSize={{ xs: 12, sm: 12 }}
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
                                                value: (ActiveCell || 0) + (RemovedCell || 0) + (InvalidCell || 0) + (PendingSmsClients || 0),
                                                classes: {
                                                    name: clsx(colorTextStyle.blue, classes.f09rem, classes.noDecoration),
                                                    value: clsx(colorTextStyle.blue, classes.grpDataBoxText, classes.f09rem, classes.noDecoration),
                                                    href: ''
                                                },
                                                onClick: (e: any) => {
                                                    e?.preventDefault();
                                                    if (((ActiveCell || 0) + (RemovedCell || 0) + (InvalidCell || 0) + (PendingSmsClients || 0)) > 0) {
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
                                        gridSize={{ xs: 12, sm: 12 }}
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
                                                    name: clsx(colorTextStyle.green, classes.f09rem, classes.noDecoration),
                                                    value: clsx(colorTextStyle.green, classes.grpDataBoxText, classes.f09rem, classes.noDecoration),
                                                    href: ''
                                                },
                                                onClick: (e: any) => {
                                                    e?.preventDefault();
                                                    if ((ActiveCell || 0) > 0) {
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
                                        gridSize={{ xs: 12, sm: 12 }}
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
                                                    name: clsx(colorTextStyle.red, classes.f09rem, classes.noDecoration),
                                                    value: clsx(colorTextStyle.red, classes.grpDataBoxText, classes.f09rem, classes.noDecoration),
                                                    href: ''
                                                },
                                                onClick: (e: any) => {
                                                    e?.preventDefault();
                                                    if ((RemovedCell || 0) > 0) {
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
                                        gridSize={{ xs: 12, sm: 12 }}
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
                                                    name: clsx(colorTextStyle.red, classes.f09rem, classes.noDecoration),
                                                    value: clsx(colorTextStyle.red, classes.grpDataBoxText, classes.f09rem, classes.noDecoration),
                                                    href: ''
                                                },
                                                onClick: (e: any) => {
                                                    e?.preventDefault();
                                                    if ((InvalidCell || 0) > 0) {
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
                                        gridSize={{ xs: 12, sm: 12 }}
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
                                                    name: clsx(colorTextStyle.grey, classes.f09rem, classes.noDecoration),
                                                    value: clsx(colorTextStyle.grey, classes.grpDataBoxText, classes.f09rem, classes.noDecoration),
                                                    href: ''
                                                },
                                                onClick: (e: any) => {
                                                    e?.preventDefault();
                                                    if ((PendingSmsClients || 0) > 0) {
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
                                        gridSize={{ xs: 12, sm: 12 }}
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
                    // align="center"
                    // className={clsx(classes.flex5, classes.p0)}
                    component="th"
                    scope="row"
                    className={clsx(
                        classes.flex3,
                        classes.tableCellRoot
                    )}
                >
                    {renderCellIcons(row)}
                </TableCell>
            </TableRow>
        )

    }

    const renderPhoneRow = (row: GroupData) => {
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
                            justifyContent={"space-between" as never}
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
                                                    href: ''
                                                },
                                                onClick: (e: any) => {
                                                    e?.preventDefault();
                                                    if (((ActiveEmails || 0) + (RemovedEmails || 0) + (RestrictedEmails || 0) + (InvalidEmails || 0)) > 0) {
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
                                                value: ActiveEmails,
                                                classes: {
                                                    name: colorTextStyle.green,
                                                    value: colorTextStyle.green,
                                                    href: ''
                                                },
                                                onClick: (e: any) => {
                                                    e?.preventDefault();
                                                    if ((ActiveEmails || 0) > 0) {
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
                                                value: RemovedEmails,
                                                classes: {
                                                    name: colorTextStyle.red,
                                                    value: colorTextStyle.red,
                                                    href: ''
                                                },
                                                onClick: (e: any) => {
                                                    e?.preventDefault();
                                                    if ((RemovedEmails || 0) > 0) {
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
                                                value: InvalidEmails,
                                                classes: {
                                                    name: colorTextStyle.red,
                                                    value: colorTextStyle.red,
                                                    href: ''
                                                },
                                                onClick: (e: any) => {
                                                    e?.preventDefault();
                                                    if ((InvalidEmails || 0) > 0) {
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
                                        <NameValueGridStructure
                                            rootClass={classes.textCenter}
                                            gridSize={{ xs: 12, sm: 12 }}
                                            gridArr={[{
                                                name: t("recipient.Pending"),
                                                value: PendingSmsClients || 0,
                                                classes: {
                                                    name: colorTextStyle.grey,
                                                    value: colorTextStyle.grey,
                                                    href: ''
                                                },
                                                onClick: (e: any) => {
                                                    e?.preventDefault();
                                                    if ((PendingSmsClients || 0) > 0) {
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
                        <Typography style={{ maxWidth: '100%' }} className={clsx(classes.nameEllipsis, classes.fullWidth)}>{t("recipient.sms/mms")}</Typography>
                        <FlexGrid
                            justifyContent={"space-between" as never}
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
                                                    href: ''
                                                },
                                                onClick: (e: any) => {
                                                    e?.preventDefault();
                                                    if (((ActiveCell || 0) + (RemovedCell || 0) + (InvalidCell || 0)) > 0) {
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
                                                value: ActiveCell,
                                                classes: {
                                                    name: colorTextStyle.green,
                                                    value: colorTextStyle.green,
                                                    href: ''
                                                },
                                                onClick: (e: any) => {
                                                    e?.preventDefault();
                                                    if ((ActiveCell || 0) > 0) {
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
                                                value: RemovedCell,
                                                classes: {
                                                    name: colorTextStyle.red,
                                                    value: colorTextStyle.red,
                                                    href: ''
                                                },
                                                onClick: (e: any) => {
                                                    e?.preventDefault();
                                                    if ((RemovedCell || 0) > 0) {
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
                                                value: InvalidCell,
                                                classes: {
                                                    name: colorTextStyle.red,
                                                    value: colorTextStyle.red,
                                                    href: ''
                                                },
                                                onClick: (e: any) => {
                                                    e?.preventDefault();
                                                    if ((InvalidCell || 0) > 0) {
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
                                        accountFeatures?.indexOf(PulseemFeatures.OPTIN) > -1 && <NameValueGridStructure
                                            rootClass={classes.textCenter}
                                            gridSize={{ xs: 12, sm: 12 }}
                                            gridArr={[{
                                                name: t("recipient.Pending"),
                                                value: PendingClients || 0,
                                                classes: {
                                                    name: colorTextStyle.grey,
                                                    value: colorTextStyle.grey,
                                                    href: ''
                                                },
                                                onClick: (e: any) => {
                                                    e?.preventDefault();
                                                    if ((PendingClients || 0) > 0) {
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
                    } as never}
                    table={{ className: classes.tableContainer } as never}
                    tableHead={{
                        tableHeadCells: TABLE_HEAD,
                        classes: rowStyle,
                        className: windowSize === "xs" ? classes.dNone : null,
                    } as never}
                >
                    <TableBody>
                        {
                            groupData.Groups.length
                                ? groupData.Groups
                                    .map(windowSize === 'xs' ? renderPhoneRow : renderRow)
                                : (
                                    <Box className={clsx(classes.p10, classes.mt15, classes.mb15, classes.colorBlue)}>
                                        <Grid container spacing={2} className={clsx(classes.flexJustifyCenter, classes.alignCenter, classes.textCenter, classes.pr25, classes.pe25)} style={{ minHeight: 70 }}>
                                            {t('common.NoDataTryFilter')}
                                        </Grid>
                                    </Box>
                                )
                        }
                    </TableBody>
                </DataTable>
            )
        }
        return <></>;

    }
    const initPageState = (pageSize: Number, pageIndex: Number, props: any = null) => {
        const searchObject = {
            PageIndex: pageIndex,
            PageSize: pageSize,
            SearchTerm: searchStr,
            IsDynamic: true
        };
        setSearchData(searchObject);

        SetPageState({
            "PageName": "dynamicGroups",
            "PageNumber": pageIndex,
            "SearchData": (serachData.SearchTerm !== '') ? {
                SearchTerm: serachData.SearchTerm,
                PageIndex: pageIndex,
                PageSize: pageSize
            } : null,
            "IsDynamic": true
        } as PageProperty);
    }

    const handleRowsPerPageChange = (val: Number) => {
        initPageState(serachData.PageSize, serachData?.PageNumber);
        dispatch(setRowsPerPage(val));
        getData({ ...serachData, PageSize: val });
    }
    const handlePageChange = (val: Number) => {
        initPageState(rowsPerPage, val);
        const lastSearch = { ...serachData, PageIndex: val, PageSize: rowsPerPage };
        getData(lastSearch);
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
    const handleDownloadFile = async (response: any, formatType: any) => {
        let orderList = await response?.Clients.map((client: Client) => {
            let tempStatus = ClientStatus.Email.find((status) => status.id === client.Status) as any
            let tempSmsStatus = ClientStatus.Sms.find((status) => status.id === client.SmsStatus) as any
            client.Status = t(tempStatus.value);
            client.SmsStatus = t(tempSmsStatus.value);
            return client;
        }, []);

        const exportOptions = {
            OrderItems: true,
            FormatDate: true,
            ConvertStatusToString: false,
            Order: Object.keys(exportColumnHeader.current as any),
            DeleteProperties: ["Revenue", "SendDate"],
            ReplaceNull: true
        } as any;

        HandleExportData(orderList, exportOptions).then(async (result) => {
            ExportFile({
                data: result,
                exportType: formatType,
                fields: exportColumnHeader.current,
                fileName: 'PulseemClientsExport'
            });
        });
    }
    const handleConfirmExport = async (formatType: any, notifyEmail: boolean) => {
        setShowConfirmDialog(false);
        setLoader(true);
        const group = subAccountAllGroups.find((g: any) => { return g.GroupID === selectedGroups[0] });

        const requestObject: ClientExportRequest = {
            GroupIds: selectedGroups,
            NotifyEmail: notifyEmail,
            FileType: formatType,
            Culture: isRTL ? 0 : 1,
            FileName: selectedGroups.length === 1 ? group.GroupName : 'PulseemGroups'
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
                        summary: null,
                        message:
                            RenderHtml(t("recipient.exportGroups.inProgress")
                                .replace("##notifyEmailPlaceHolder##", notifyEmail !== null ? t('recipient.exportGroups.inProgressNotifyOnDone')
                                    .replace("##notifyEmail##", `<b>${notifyEmail}</b>`) : t('recipient.exportGroups.downloadPageRedirect')))
                    } as any)
                    setDialog(DialogType.MESSAGE);
                    break;
                }
                case 403: { // Feature not allowed
                    break;
                }
                case 405: {
                    setResponseMessage({ title: '', message: RenderHtml(t("recipient.exportGroups.exportLimitationErrorMessage")), summary: null } as any)
                    setDialog(DialogType.MESSAGE);
                    break;
                }

                default:
                case 500: {
                    setResponseMessage({ title: '', message: t("common.somethingWentWrong"), summary: null })
                    setDialog(DialogType.MESSAGE);
                    break;
                }
            }
        } catch (e: any) {
            // Log
        }
        finally {
            setLoader(false);
        }
    }
    const renderConfirmDialog = () => {
        let csvOnly = false;
        let exportTypeOptions: any = ExportFileTypes;

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
                onConfirm={(e: any, notifyEmail: any) => handleConfirmExport(e, notifyEmail)}
                onCancel={() => setShowConfirmDialog(false)}
                cookieName={'exportFormat'}
                defaultValue={csvOnly ? 'csv' : 'xls'}
                showEmailToNotify={csvOnly}
                options={csvOnly ? null : exportTypeOptions}
            />
        );
    }

    const handleDeleteGroup = async () => {
        setLoader(true);
        setDialog(null);
        await dispatch(deleteGroups(selectedGroups));
        await dispatch(getGroupsBySubAccountId())
        setSelectedGroups([]);
        getData(null);
        setLoader(false);
    };

    const handleResponses = (response: any, actions = {
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
                setDialog(null);
                getData(null)
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

    const showDialog = () => {
        if (dialog !== null) {
            switch (dialog) {
                case DialogType.ADD_GROUP: {
                    // @ts-ignore
                    return <AddGroupPopUp
                        isDynamic={true}
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
                        addAnotherRecCallback={(groupId: any) => {
                            setSelectedGroups([...selectedGroups, groupId]);
                            setDialog(DialogType.ADD_RECIPIENTS)
                        }}
                        getData={() => getData(null)}
                        handleResponses={(response: any, actions: any) => { setDialog(null); handleResponses(response, actions) }}
                    />
                }
                case DialogType.EDIT_GROUP: {
                    return <EditGroupPopup
                        isDynamic={true}
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
                        handleResponses={(response: any, actions: any) => handleResponses(response, actions)}
                    />
                }
                case DialogType.DELETE_GROUP: {
                    return <ConfirmDeletePopUp
                        classes={classes}
                        isOpen={dialog === DialogType.DELETE_GROUP}
                        onClose={() => { setDialog(null); setSelectedGroups([]); }}
                        onCancel={() => { setDialog(null); setSelectedGroups([]); }}
                        windowSize={windowSize}
                        handleDeleteGroup={() => handleDeleteGroup()}
                    />
                }
                default: {
                    return <></>
                }
                case DialogType.RESET_GROUP: {
                    if (selectedGroups.length === 1) {
                        return <ResetGroupPopup
                            classes={classes}
                            isOpen={dialog === DialogType.RESET_GROUP}
                            onClose={() => { setDialog(null); setSelectedGroups([]) }}
                            windowSize={windowSize}
                            selectedGroup={{ GroupID: selectedGroups[0] }}
                            getData={() => getData(null)}
                            handleResponses={(response, actions) => handleResponses(response, actions)}
                        />
                    }
                    return <></>
                }
                case DialogType.MESSAGE: {
                    return <AddRecipientResponse
                        classes={classes}
                        isOpen={dialog === DialogType.MESSAGE}
                        onClose={() => { setDialog(null); setSelectedGroups([]); getData(); }}
                        title={responseMessage.title}
                        message={responseMessage.message}
                        summary={responseMessage?.summary}
                    />
                }
            }
        }
        return <></>;
    }


    return (
        <DefaultScreen
            key="groups"
            currentPage='groups'
            subPage='dynamicGroups'
            classes={classes}
            containerClass={clsx(classes.management, classes.mb50)}
        >
            <Box className={classes.mb50}>
                {toastMessage && renderToast()}
                <Box className={'topSection'}>
                    <Title Text={t('recipient.logPageHeaderResource1.Dynamic')} classes={classes} />
                    {renderSearchSection()}
                </Box>
                {windowSize !== 'xs' ? renderManagmentLine() :
                    <Grid
                        item
                        xs={windowSize === "xs" && 12}
                        className={clsx(classes.groupsLableContainer, classes.mt20)}
                    >
                        <Typography className={classes.groupsLable}>
                            {`${groupData ? groupData.RecordCount : 0} ${t("common.Groups")}`}
                        </Typography>
                    </Grid>
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

export default memo(DynamicGroups);