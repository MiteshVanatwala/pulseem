import { useState, useEffect, useRef } from "react";
import DefaultScreen from "../DefaultScreen";
import { useParams, useSearchParams } from 'react-router-dom'
import clsx from "clsx";
import {
  Box,
  Typography,
  TableBody,
  Grid,
  Button,
  TextField,
  TableRow,
  TableCell,
  makeStyles,
} from "@material-ui/core";
import { ExportIcon, EditIcon, DeleteRecipient, RemovePhone, RemoveEmail } from "../../assets/images/managment/index";
import { DateField, ManagmentIcon } from "../../components/managment/index";
import {
  TablePagination,
  SearchField,
} from "../../components/managment/index";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import moment from "moment";
import "moment/locale/he";
import { Loader } from "../../components/Loader/Loader";
import { setRowsPerPage } from "../../redux/reducers/coreSlice";
import CustomTooltip from "../../components/Tooltip/CustomTooltip";
import DataTable from "../../components/Table/DataTable";
import Toast from '../../components/Toast/Toast.component';
import { BaseDialog } from "../../components/DialogTemplates/BaseDialog";
import {
  AddClientsToGroup,
  deleteFromGroups,
  makeInvalidClients,
  removeEmailClient,
  removeSmsClient,
  searchAllClients,
  getExportData,
  setUnsubscribedClients,
  getClientsById
} from "../../redux/reducers/clientSlice";
import { getAccountExtraData } from '../../redux/reducers/smsSlice';
import { BiSortDown, BiSortUp } from "react-icons/bi";
import SummaryRow from '../../components/Grids/SummaryRow';
import AddGroupPopUp from "../Groups/Management/Popup/AddGroupPopUp";
import UnsubscribeOrDeletePopup from "../Groups/Management/Popup/UnsubscribeOrDeletePopup";
import FlexGrid from "../../components/Grids/FlexGrid";
import AddRecipientPopup from "../Groups/Management/Popup/AddRecipientPopup";
import { exportAsXLSX, ExportFile } from '../../helpers/Export/ExportFile';
import { HandleExportData, DeletePropertyFromArrayObject, SwitchStatusByCondition, FlatObject } from '../../helpers/Export/ExportHelper';
import { ClientStatus } from "../../helpers/Constants";
import { useLocation } from "react-router";
import { CLIENT_CONSTANTS } from "../../model/Clients/Contants";
import { getGroupsBySubAccountId } from "../../redux/reducers/groupSlice";
import { useNavigate } from 'react-router';
import ConfirmRadioDialog from '../../components/DialogTemplates/ConfirmRadioDialog'
import { ExportFileTypes } from '../../model/Export/ExportFileTypes'
import { ReplaceExtraFieldHeader } from "../../helpers/UI/AccountExtraField";
import { ConvertClientStatus, SourceType } from "../../helpers/UI/TableText";
import { Title } from "../../components/managment/Title";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { PulseemFeatures } from "../../model/PulseemFields/Fields";
import { RenderHtml } from "../../helpers/Utils/HtmlUtils";
import { getErrorMessageFromTwilioLink } from "../Whatsapp/Common";
import { getCookie, setCookie } from "../../helpers/Functions/cookies";
const useStyles = makeStyles({
  groupName: {
    "@media screen and (max-width: 1160px)": {
      fontSize: '16px'
    }
  },
  noWrap: {
    whiteSpace: 'nowrap',
    '& p': {
      whiteSpace: 'nowrap',
    }
  },
  dataBox: {
    whiteSpaces: 'nowrap',
    "@media screen and (max-width: 1350px)": {
      fontSize: '14px'
    }
  },
  date: {
    "@media screen and (max-width: 1160px)": {
      fontSize: '13px'
    }
  },
  actionButtons: {
    "& button": {
      minWidth: 'auto'
    }
  }
});
const ClientSearchResult = ({ classes }) => {
  const {
    language,
    windowSize,
    rowsPerPage,
    isRTL
  } = useSelector((state) => state.core);
  const { accountFeatures } = useSelector(state => state.common);
  const { t } = useTranslation();
  const { extraData } = useSelector(state => state.sms);
  const navigate = useNavigate()
  const { groupData, subAccountAllGroups } = useSelector((state) => state.group);
  const { ClientData, TotalCount, TotalRevenue, CampaignClicks, ToastMessages, downloadProgress } = useSelector(state => state.client);
  const localClasses = useStyles();
  const location = useLocation()
  const [selectedClients, setSelectedClients] = useState([]);
  const [searchStr, setSearchStr] = useState("");
  const [page, setPage] = useState(1);
  const [toastMessage, setToastMessage] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [descSortDirection, setSortDirection] = useState(true);
  const [filterMin, setFilterMin] = useState("");
  const [filterMax, setFilterMax] = useState("");
  // const [isSearching, setIsSearching] = useState(false);
  const [revenueSummary, setRevenueSummary] = useState(null);
  const [searchData, setSearchData] = useState(null);
  const [filterSearch, setFilterSearch] = useState(null);
  const [searchReferrer, setSearchReferrer] = useState(false);
  //eslint-disable-next-line
  const [clientToEdit, setClientToEdit] = useState(null);
  const [isDownloadProgress, setIsDownloadProgress] = useState(false);
  const [emailToNotify, setEmailToNotify] = useState('');
  const [searchParams] = useSearchParams();
  const [date, setDate] = useState({
    FromDate: null,
    ToDate: null,
  });
  const exportColumnHeader = useRef(null);
  const assignClientsActions =
  {
    S_201: {
      code: 201,
      message: ToastMessages.RECIPIENT_ADDED_TO_GROUP,
      Func: () => null
    },
    S_400: {
      code: 400,
      message: ToastMessages.GROUP_INPUT_INCORRECT,
      Func: () => null
    },
    S_401: {
      code: 401,
      message: ToastMessages.GROUP_INVALID_API,
      Func: () => null
    },
    S_405: {
      code: 405,
      message: ToastMessages.GROUP_ERROR,
      Func: () => null
    },
    S_422: {
      code: 422,
      message: ToastMessages.GROUP_ALREADY_EXIST,
      Func: () => null
    },
    S_406: {
      code: 406,
      message: ToastMessages.GROUP_ERROR,
      Func: () => null
    },
    default: {
      message: ToastMessages.GROUP_ERROR,
      Func: () => null
    },
  };
  const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot };
  const cellStyle = {
    head: classes.tableCellHead,
    body: classes.tableCellBody,
    root: classes.tableCellRoot,
  };
  const [dialog, setDialog] = useState(null);
  const [showLoader, setLoader] = useState(false);
  const dateFormat = "YYYY-MM-DD HH:mm:ss.FFF";
  const dispatch = useDispatch();
  moment.locale(language);
  const DialogType = {
    ADD_GROUP: "ADD_GROUP",
    EDIT_RECIPIENT: "EDIT_RECIPIENT",
    CONFIRM_DELETE_FROM_GROUPS: "CONFIRM_DELETE_FROM_GROUPS",
    CONFIRM_REMOVE_EMAIL: "CONFIRM_REMOVE_EMAIL",
    CONFIRM_REMOVE_PHONE: "CONFIRM_REMOVE_PHONE",
    UNSUB_RECIPIENT: "UNSUB_RECIPIENT",
    CONFIRM_INVALID: "CONFIRM_INVALID",
    EXPORT_FORMAT: "EXPORT_FORMAT",
    UNSUBSCRIBED_IN_PROGRESS: "UNSUBSCRIBED_IN_PROGRESS",
    EXPORT_IN_PROGRESS: "EXPORT_IN_PROGRESS"
  };

  useEffect(() => {
    window.addEventListener('beforeunload', () => null);

    return () => {
      window.removeEventListener('beforeunload', () => null);
      sessionStorage.removeItem('searchData')
    };
  }, []);


  useEffect(() => {
    const initExtraFields = async () => {
      dispatch(getAccountExtraData());
      if (subAccountAllGroups.length === 0) {
        dispatch(getGroupsBySubAccountId());
      }
    }
    const initSearchData = () => {
      let overwriteObject = location?.state;
      const referrer = document.referrer.split('/')[document.referrer.split('/').length - 1];
      const isSearchByFilter = referrer.toLowerCase().indexOf('clientsearch') > -1 && referrer.toLowerCase().indexOf('result') === -1;
      let isSessionStorageData = referrer.toLowerCase().indexOf('automationreport') > -1 ||
        referrer.toLowerCase().indexOf('createautomations') > -1 ||
        referrer.toLowerCase().indexOf('campaignstatistics') > -1 ||
        referrer.toLowerCase().indexOf('dynamicgroups') > -1 ||
        (isSearchByFilter || searchReferrer === true);
      if (!overwriteObject || isSessionStorageData) {
        const sessionData = window.sessionStorage?.getItem('searchData');
        if (sessionData) {
          setSearchReferrer(true);
          overwriteObject = JSON.parse(sessionData);
          overwriteObject.IsSearchByFilter = ((isSearchByFilter || referrer === '') && !overwriteObject?.PageType);
          setFilterSearch(overwriteObject);
        }
      }

      if (overwriteObject === null) {
        overwriteObject = {
          PageIndex: searchParams.get("PageIndex") ? parseInt(searchParams.get("PageIndex")) : null,
          SearchTerm: searchParams.get("SearchTerm") ?? '',
          Status: searchParams.get("Status") ? parseInt(searchParams.get("Status")) : null,
          PageType: searchParams.get("PageType") ? parseInt(searchParams.get("PageType")) : null,
          ReportType: searchParams.get("ReportType") ? parseInt(searchParams.get("ReportType")) : null,
          TestStatusOfEmailElseSms: searchParams.get("TestStatusOfEmailElseSms") ? parseInt(searchParams.get("TestStatusOfEmailElseSms")) : null, // 0 or null = sms, 1 = email
          Switch: searchParams.get("Switch"), // Not in use for now.
          CountryOrRegion: searchParams.get("CountryOrRegion"),// Not in use for now.
          GroupIds: searchParams.get("GroupIds") ? searchParams.get("GroupIds").split(',').map((g) => { return parseInt(g) }) : [], // List of 1 groupId
          NodeID: searchParams.get("NodeID") ?? "", // Not in use for now
          CampaignID: searchParams.get("CampaignID") ? parseInt(searchParams.get("CampaignID")) : null,
          FromDate: searchParams.get("FromDate"),
          ToDate: searchParams.get("ToDate"),
          ResultTitle: searchParams.get("ResultTitle")
        }
      }

      if (overwriteObject.ResultTitle === null) {
        overwriteObject = getCookie('recipientSearchResultSearchparam');
      } else {
        setCookie('recipientSearchResultSearchparam', JSON.stringify(overwriteObject));
      }
      let isSmsReport = false;

      if (document.referrer.toLowerCase().indexOf('smsmainreport') > -1 || overwriteObject?.PageType === CLIENT_CONSTANTS.PAGE_TYPES.FailureCountSMSCampaignID) {
        isSmsReport = true;
      }

      // On load
      let initSearchData = {
        IsSearchByFilter: false,
        IsAdvanced: false,
        PageSize: rowsPerPage,
        PageIndex: page,
        SearchTerm: "",
        Status: location?.state?.Status ?? overwriteObject?.Status ?? null,
        PageType: location?.state?.PageType ?? overwriteObject?.PageType ?? null,
        ReportType: isSmsReport ? 20 : 10,
        TestStatusOfEmailElseSms: location?.state?.TestStatusOfEmailElseSms ?? overwriteObject?.TestStatusOfEmailElseSms ?? null,
        CampaignID: id,
        Switch: "",
        CountryOrRegion: "",
        GroupIds: [],
        NodeID: "",
        OrderBy: 0,
        ...overwriteObject,
      };
      setSearchData(initSearchData);
    }
    initSearchData();
    initExtraFields();

  }, []);
  useEffect(() => {
    if (extraData && Object.entries(extraData).length > 0) {
      let updatingObject = {
        "Status": t('common.Status'),
        "SmsStatus": (location?.state?.PageType ?? searchData?.PageType) === CLIENT_CONSTANTS.PAGE_TYPES.Revenue ? t('common.smsStatus') : t('common.whatsappStatus'),
        "CreationDate": (location?.state?.PageType ?? searchData?.PageType) === CLIENT_CONSTANTS.PAGE_TYPES.FormID ? t('client.subscribedOn') : t('common.CreationDate'),
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
      };
      if (location?.state?.PageType === CLIENT_CONSTANTS.PAGE_TYPES.Revenue || location?.state?.PageType === CLIENT_CONSTANTS.PAGE_TYPES.WhatsappRevenue || location?.state?.PageType === CLIENT_CONSTANTS.PAGE_TYPES.Product) {
        updatingObject["Revenue"] = t('common.campaignRevenue');
      }
      if ((searchData?.PageType ?? searchData?.PageType) === CLIENT_CONSTANTS.PAGE_TYPES.FailureCountSMSCampaignID) {
        updatingObject["ErrorTypeText"] = t('recipient.errorMessage');
      }
      if ((searchData?.PageType ?? searchData?.PageType) === CLIENT_CONSTANTS.PAGE_TYPES.OpenedCampaignID) {
        updatingObject["snt_OpeningDate"] = t('common.OpenTime');
      }
      if ((searchData?.PageType ?? searchData?.PageType) === CLIENT_CONSTANTS.PAGE_TYPES.TotalCountSMSCampaignID ||
        (searchData?.PageType ?? searchData?.PageType) === CLIENT_CONSTANTS.PAGE_TYPES.SentToCampaignID) {
        updatingObject["SentDate"] = t('sms.sendingTime');
      }
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
      if (searchData?.PageType) {
        if (searchData?.PageType === CLIENT_CONSTANTS.PAGE_TYPES.WhatsappSentCount ||
          searchData?.PageType === CLIENT_CONSTANTS.PAGE_TYPES.WhatsappRead ||
          searchData?.PageType === CLIENT_CONSTANTS.PAGE_TYPES.WhatsappFailed ||
          searchData?.PageType === CLIENT_CONSTANTS.PAGE_TYPES.WhatsappRemoved ||
          searchData?.PageType === CLIENT_CONSTANTS.PAGE_TYPES.WhatsappUniqueClick ||
          searchData?.PageType === CLIENT_CONSTANTS.PAGE_TYPES.WhatsappRevenue) {
          delete updatingObject.Status
        }
      }
      updatingObject = ReplaceExtraFieldHeader(updatingObject, extraData);
      exportColumnHeader.current = updatingObject;
    }

  }, [extraData])


  useEffect(() => {
    if (searchData) {
      if (!searchData.IsAdvanced && !searchData.IsSearchByFilter && document.referrer.toLocaleLowerCase().indexOf('campaignstatistics') < 0) {
        sessionStorage.removeItem('searchData')
      }
      getData();
    }

  }, [dispatch, searchData, page, rowsPerPage]);

  const handleFromDateChange = (value) => {
    if (value > date.ToDate) {
      setDate({ ...date, ToDate: null });
    }
    setDate({ ...date, FromDate: value });
  }
  const handleKeyDown = (event) => {
    if (event.keyCode === 13 || event.code === "Enter" || event.code === 'NumpadEnter') {
      setSearchData({
        ...searchData,
        PageIndex: 1,
        PageSize: rowsPerPage,
        // PageType: CLIENT_CONSTANTS.PAGE_TYPES.ClientStatus,
        FromDate: date.FromDate,
        ToDate: date.ToDate,
        SearchTerm: searchStr,
        MyActivities: null,
        MyConditions: null
      });
      setPage(1);
      handleFilter();
    }
  };
  const handleKeyPress = (e) => {
    if (e.charCode === 13 || e.code === "Enter") {
      setSearchData({
        ...searchData,
        PageIndex: 1,
        PageSize: rowsPerPage,
        FromDate: date.FromDate,
        ToDate: date.ToDate,
        SearchTerm: searchStr,
        MyActivities: null,
        MyConditions: null
      });
      setPage(1);
      handleFilter();
    }
  };
  const handleDownloadCsv = async (formatType, notifyEmail) => {
    setLoader(true);
    setDialog(null);
    setShowConfirmDialog(false);
    setIsDownloadProgress(true);
    setEmailToNotify(notifyEmail);
    const fileName = (location?.state && location?.state.ResultTitle) ? location?.state.ResultTitle.replace(' ', '_').replace('/', '_') : 'ClientSearchResult';

    const response = await dispatch(getExportData({ ...searchData, PageSize: TotalCount, ExportFileName: fileName, NotifyEmail: notifyEmail }));
    if (response && response.payload) {
      const data = response.payload;

      switch (data?.StatusCode) {
        case 201: {
          const promiseArray = [];
          let orderList = [];
          const deletedProperties = [];
          orderList = data.Clients.map((ol) => ol);
          if ((searchData.PageType ?? searchData?.PageType) !== CLIENT_CONSTANTS.PAGE_TYPES.Revenue && (searchData.PageType ?? searchData?.PageType) !== CLIENT_CONSTANTS.PAGE_TYPES.WhatsappRevenue) {
            deletedProperties.push("Revenue");
          }
          if (searchData.PageType !== CLIENT_CONSTANTS.PAGE_TYPES.SentToCampaignID || searchData.PageType !== CLIENT_CONSTANTS.PAGE_TYPES.FailureCountSMSCampaignID ||
            searchData.PageType !== CLIENT_CONSTANTS.PAGE_TYPES.OpenedCampaignID) {
            deletedProperties.push("SendDate");
          }

          Promise.all(promiseArray).then(() => {
            const fileName = searchData?.ResultTitle ? searchData?.ResultTitle.replace(' ', '_').replace('/', '_') : 'ClientSearchResult';
            const exportOptions = {
              OrderItems: true,
              FormatDate: true,
              ConvertStatusToString: false,
              DeleteProperties: deletedProperties.length > 0 ? deletedProperties : null,
              Order: Object.keys(exportColumnHeader.current),
              ReplaceNull: true
            };

            HandleExportData(orderList, exportOptions).then(async (result) => {
              // Pay attention -> We set XLSX for better header's order.
              // CSV not supporting numeric extra fields order.
              result = await SwitchStatusByCondition(result, ClientStatus.Email, true);
              result = await SwitchStatusByCondition(result, ClientStatus.Sms, false);

              ExportFile({
                data: result,
                exportType: formatType,
                fields: exportColumnHeader.current,
                fileName: fileName
              });
            });
          });
          break;
        }
        case 202: {
          setDialog(DialogType.EXPORT_IN_PROGRESS);
          break;
        }
        case 403: { // Feature not allowed
          break;
        }
        case 405: {
          setToastMessage(RenderHtml(t("recipient.exportGroups.exportLimitationErrorMessage")));
          break;
        }
        default: {
          setToastMessage(ToastMessages.GENERIC_ERROR);
          break;
        }
      }

    }
    setLoader(false);
    setIsDownloadProgress(false);
  }
  const sortData = (key) => {
    if (key === 'CreationDate' || key === 'Date') {
      setSearchData({
        ...searchData,
        OrderBy: descSortDirection ? 0 : 1
      });
      setSortDirection(!descSortDirection);
    }
    else {
      if (data && data.length > 0) {
        let tempData = [...data].sort((a, b) => {
          return a.Revenue !== null && b.Revenue !== null
            ? (descSortDirection ? (b.Revenue - a.Revenue) : (a.Revenue - b.Revenue))
            : -1
        }
        );
        setData(tempData);
        setSortDirection(!descSortDirection);
      }
    }
    return;
  }
  const handleFilter = () => {
    // setIsSearching(true);
    if (filterMin !== '' || filterMax !== '') {
      const sortedData = [...ClientData].filter((f) => {
        return f.Revenue >= parseInt(filterMin !== "" ? filterMin : 0) && f.Revenue <= parseInt(filterMax !== "" ? filterMax : 1000000)
      });
      setData(sortedData);
    }
  }
  const handlePageChange = (val) => {
    setPage(val);
    setSearchData({ ...searchData, PageIndex: val });
  }
  const Min = () => <Grid item>
    <TextField
      variant="outlined"
      size="small"
      value={filterMin}
      onChange={(e) => setFilterMin(e.target.value)}
      className={clsx(classes.textField, classes.minWidth252)}
      placeholder={t("siteTracking.minimumRevenue")}
      type="number"
    />
  </Grid>
  const Max = () => <Grid item>
    <TextField
      variant="outlined"
      size="small"
      value={filterMax}
      onChange={(e) => setFilterMax(e.target.value)}
      className={clsx(classes.textField, classes.minWidth252)}
      placeholder={t("siteTracking.maximumRevenue")}
      type="number"
    />
  </Grid>
  const EL_FromDate = () => windowSize !== 'xs' ?
    <Grid item>
      <DateField
        classes={classes}
        toolbarDisabled={false}
        value={date.FromDate}
        onChange={handleFromDateChange}
        placeholder={t('mms.locFromDateResource1.Text')}
      />
    </Grid>
    : null
  const EL_ToDate = () => windowSize !== 'xs' ?
    <Grid item>
      <DateField
        classes={classes}
        toolbarDisabled={false}
        value={date.ToDate}
        onChange={(value) => setDate({ ...date, ToDate: value })}
        placeholder={t('mms.locToDateResource1.Text')}
        minDate={date.FromDate ? date.FromDate : undefined}
      />
    </Grid>
    : null
  const PageTypeObject = {
    '1': {
      title: t("common.OpenDate"),
      sortKey: 'Date',
      component: {
        mobile: ({ snt_OpeningDate = null, ...rest }) => (<>
          <Typography className={classes.bold}>
            {t("common.OpenTime")}
          </Typography>
          <Typography>
            {snt_OpeningDate ? moment(snt_OpeningDate).format('DD/MM/YYYY HH:mm') : ''}
          </Typography>
        </>),
        web: ({ snt_OpeningDate = null, ...rest }) => (
          <Typography className={clsx(classes.bold, classes.f16)}>
            {snt_OpeningDate ? moment(snt_OpeningDate).format('DD/MM/YYYY HH:mm') : ''}
          </Typography>
        )
      },
      filterComponents: [EL_FromDate, EL_ToDate]
    },
    '4': {
      title: t("common.SendDate"),
      sortKey: 'Date',
      component: {
        mobile: ({ SentDate = null, ...rest }) => (<>
          <Typography className={classes.bold}>
            {t("common.OpenTime")}
          </Typography>
          <Typography>
            {SentDate ? moment(SentDate).format('DD/MM/YYYY HH:mm') : ''}
          </Typography>
        </>),
        web: ({ SentDate = null, ...rest }) => (
          <Typography className={clsx(classes.bold, classes.f16)}>
            {SentDate ? moment(SentDate).format('DD/MM/YYYY HH:mm') : ''}
          </Typography>
        )
      },
      filterComponents: [EL_FromDate, EL_ToDate]
    },
    '3': {
      title: t("client.subscribedOn"),
      sortKey: 'Date',
      component: {
        mobile: ({ CreationDate = null, ...rest }) => (<>
          <Typography className={classes.bold}>
            {t("sms.sendingTime")}
          </Typography>
          <Typography>
            {CreationDate ? moment(CreationDate).format('DD/MM/YYYY HH:mm') : ''}
          </Typography>
        </>),
        web: ({ CreationDate = null, ...rest }) => (
          <Typography className={clsx(classes.bold, classes.f16)}>
            {CreationDate ? moment(CreationDate).format('DD/MM/YYYY HH:mm') : ''}
          </Typography>
        )
      },
      filterComponents: [EL_FromDate, EL_ToDate]
    },
    '8': {
      title: t("common.SendDate"),
      // sortKey: 'SentDate',
      component: {
        mobile: ({ SentDate = null, ...rest }) => (<>
          <Typography className={classes.bold}>
            {t("common.SendDate")}
          </Typography>
          <Typography>
            {SentDate ? moment(SentDate).format('DD/MM/YYYY HH:mm') : ''}
          </Typography>
        </>),
        web: ({ SentDate = null, ...rest }) => (
          <Typography className={clsx(classes.bold, classes.f16)}>
            {SentDate ? moment(SentDate).format('DD/MM/YYYY HH:mm') : ''}
          </Typography>
        )
      },
      filterComponents: [EL_FromDate, EL_ToDate]
    },
    '10': {
      title: t("common.ErrorEmail"),
      sortKey: '',
      component: {
        mobile: ({ LogSms_ErrorType = '', ...rest }) => (<>
          <Typography className={classes.bold}>
            {t("common.ErrorEmail")}
          </Typography>
          <Typography>
            {LogSms_ErrorType}
          </Typography>
        </>),
        web: ({ LogSms_ErrorType = '', ...rest }) => (
          <Typography className={clsx(classes.bold, classes.f16)}>
            {LogSms_ErrorType}
          </Typography>
        )
      },
      // filterComponents: [ErrorDropDown]
    },
    '15': {
      title: t("common.campaignRevenue"),
      sortKey: 'Number',
      component: {
        mobile: ({ Revenue = 0, ...rest }) => (<>
          <Typography className={classes.bold}>
            {t("common.campaignRevenue")}
          </Typography>
          <Typography>
            {Revenue} {t("common.NIS")}
          </Typography>
        </>),
        web: ({ Revenue = 0, ...rest }) => (
          <Typography className={clsx(classes.bold, classes.f16)}>
            {Revenue} {t("common.NIS")}
          </Typography>
        )
      },
      filterComponents: [Min, Max]
    },
    '17': {
      title: t("common.campaignRevenue"),
      sortKey: 'Number',
      component: {
        mobile: ({ Revenue = 0, ...rest }) => (<>
          <Typography className={classes.bold}>
            {t("common.campaignRevenue")}
          </Typography>
          <Typography>
            {Revenue} {t("common.NIS")}
          </Typography>
        </>),
        web: ({ Revenue = 0, ...rest }) => (
          <Typography className={clsx(classes.bold, classes.f16)}>
            {Revenue} {t("common.NIS")}
          </Typography>
        )
      },
      // filterComponents: [Min, Max]
    },
    // Whatsapp successfully sent messages number
    '18': {
      title: t("common.SendDate"),
      sortKey: 'Date',
      component: {
        mobile: ({ SentDate = null, ...rest }) => (<>
          <Typography className={classes.bold}>
            {t("common.SendDate")}
          </Typography>
          <Typography>
            {SentDate ? moment(SentDate).format('DD/MM/YYYY HH:mm') : ''}
          </Typography>
        </>),
        web: ({ SentDate = null, ...rest }) => (
          <Typography className={clsx(classes.bold, classes.f16)}>
            {SentDate ? moment(SentDate).format('DD/MM/YYYY HH:mm') : ''}
          </Typography>
        )
      },
      filterComponents: [EL_FromDate, EL_ToDate]
    },
    // Whatsapp Read Date
    '19': {
      title: t("common.ReadTime"),
      sortKey: 'Date',
      component: {
        mobile: ({ OpenTime = null, ...rest }) => (<>
          <Typography className={classes.bold}>
            {t("common.ReadTime")}
          </Typography>
          <Typography>
            {OpenTime ? moment(OpenTime).format('DD/MM/YYYY HH:mm') : ''}
          </Typography>
        </>),
        web: ({ OpenTime = null, ...rest }) => (
          <Typography className={clsx(classes.bold, classes.f16)}>
            {OpenTime ? moment(OpenTime).format('DD/MM/YYYY HH:mm') : ''}
          </Typography>
        )
      },
      filterComponents: [EL_FromDate, EL_ToDate]
    },
    // Whatsapp failed messages with reason
    '20': {
      title: t("common.ErrorEmail"),
      sortKey: '',
      component: {
        mobile: ({ LogSms_ErrorType = '', ...rest }) => (<>
          <Typography className={classes.bold}>
            {t("common.ErrorEmail")}
          </Typography>
          <Typography className={classes.whatsappReportErrorCell}>
            {/* {LogSms_ErrorType} */}
            {LogSms_ErrorType && t(getErrorMessageFromTwilioLink(LogSms_ErrorType))}
          </Typography>
        </>),
        web: ({ LogSms_ErrorType = '', ...rest }) => (
          <Typography className={clsx(classes.bold, classes.f16, classes.whatsappReportErrorCell)}>
            {/* {LogSms_ErrorType} */}
            {LogSms_ErrorType && t(getErrorMessageFromTwilioLink(LogSms_ErrorType))}
          </Typography>
        )
      },
      // filterComponents: [ErrorDropDown]
    },
    // Whatsapp Revenue
    '23': {
      title: t("common.campaignRevenue"),
      sortKey: 'Number',
      component: {
        mobile: ({ Revenue = 0, ...rest }) => (<>
          <Typography className={classes.bold}>
            {t("common.campaignRevenue")}
          </Typography>
          <Typography>
            {Revenue} {t("common.NIS")}
          </Typography>
        </>),
        web: ({ Revenue = 0, ...rest }) => (
          <Typography className={clsx(classes.bold, classes.f16)}>
            {Revenue} {t("common.NIS")}
          </Typography>
        )
      },
      filterComponents: [Min, Max]
    },
  }
  const TABLE_HEAD = [
    {
      label: t("common.RecipientsName"),
      classes: cellStyle,
      className: classes.flex4,
      align: "center",
    },
    {
      label: t(""),
      classes: cellStyle,
      className: classes.flex6,
      align: "center",
    },
    {
      label: t("common.Mail"),
      classes: cellStyle,
      className: classes.flex4,
      align: "center",
    },
    {
      label: t("common.Cellphone"),
      classes: cellStyle,
      className: classes.flex3,
      align: "center",
    },
  ];
  const getData = async () => {
    setLoader(true);
    await dispatch(searchAllClients({ ...searchData, PageSize: rowsPerPage, PageIndex: page, SearchTerm: searchStr !== '' ? searchStr : searchData.SearchTerm }));
    setLoader(false);
  };
  // const getSearchData = async () => {
  //   setLoader(true);
  //   await dispatch(searchAdvancedClients({ ...searchData, PageSize: rowsPerPage, PageIndex: page }));
  //   setLoader(false);
  // }
  useEffect(() => {
    // setData(Static_CSR_Data)
    setData(ClientData);
    if (TotalRevenue) {
      handleFilter();
      setRevenueSummary([
        { title: t('client.Purchased'), value: TotalCount },
        { title: t('client.totalRevenue'), value: `${TotalRevenue?.toLocaleString()} ${t('common.NIS')}` },
        { title: t('client.avgOrderRevenue'), value: `${(TotalRevenue / TotalCount)?.toFixed(0).toLocaleString()} ${t('common.NIS')}` },
        { title: t('client.conversionRate'), value: `${((TotalCount / CampaignClicks) * 100)?.toFixed(1)}%`, style: { direction: isRTL ? 'rtl' : 'ltr' } }
      ]);
    }

  }, [ClientData, isRTL]);
  //  HANDLERS  //
  const handleResponses = (response, actions = {
    'S_200': {
      code: 200,
      message: '',
      Func: () => null
    },
    'S_201': {
      code: 201,
      message: '',
      Func: () => getData()
    },
    'S_202': {
      code: 202,
      message: '',
      Func: () => setDialog(DialogType.UNSUBSCRIBED_IN_PROGRESS)
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
    'S_404': {
      code: 404,
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
    switch (response.payload?.StatusCode || response.payload?.Message.StatusCode) {
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
        // actions?.S_201?.message && setToastMessage(actions?.S_201?.message);
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
      case 404: {
        actions?.S_404?.Func?.();
        actions?.S_404?.message && setToastMessage(actions?.S_404?.message);
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
    setLoader(false);
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
  const makeInvalid = async () => {
    setLoader(true);
    setDialog(null);
    await dispatch(makeInvalidClients({ ...searchData, PageSize: TotalCount })).then((res) => {
      handleResponses(res, {
        'S_200': {
          code: 200,
          message: ToastMessages.SUCCESS,
          Func: () => setDialog(null)
        },
        'S_201': {
          code: 201,
          message: ToastMessages.SET_INVALID_SUCCESS,
          Func: () => {
            getData();
          }
        },
        'S_401': {
          code: 401,
          message: ToastMessages.GROUP_INVALID_API,
          Func: () => null
        },
        'S_404': {
          code: 404,
          message: ToastMessages.NO_CLIENTS_FOUND,
          Func: () => null
        },
        'S_500': {
          code: 500,
          message: ToastMessages.GROUP_ERROR,
          Func: () => null
        },
      })
    })
  }
  const removeRecipientFromAllGroups = async () => {
    setDialog(null);
    setLoader(true);
    const response = await dispatch(deleteFromGroups(selectedClients[0]))
    //TODO: (Rishabh) add handle response for delete responses
    if (response && response.payload === 'true') {
      setToastMessage(ToastMessages.RECIPIENT_DELETED_FROM_GROUP);
      getData();
    }
    else {
      // show delete failed message
    }
    setLoader(false);
  }
  const removeEmailRecipient = async () => {
    setDialog(null);
    setLoader(true);
    const response = await dispatch(removeEmailClient(selectedClients[0]))
    if (response) {
      //TODO: show delete success message
      handleResponses(response,
        {
          S_201: {
            code: 201,
            message: ToastMessages.SUCCESS,
            Func: () => null
          },
          S_202: {
            code: 202,
            Func: () => setDialog(DialogType.UNSUBSCRIBED_IN_PROGRESS)
          },
          S_400: {
            code: 400,
            message: ToastMessages.SOMETHING_WENT_WRONG,
            Func: () => null
          },
          'S_401': {
            code: 401,
            message: ToastMessages.GROUP_INVALID_API,
            Func: () => null
          },
          'S_404': {
            code: 404,
            message: ToastMessages.NO_CLIENTS_FOUND,
            Func: () => null
          },
          'S_500': {
            code: 500,
            message: ToastMessages.GROUP_ERROR,
            Func: () => null
          },
        }
      );
      getData();
      setDialog(null);
    }
    setLoader(false);
  }
  const removeSMSRecipient = async () => {
    setDialog(null);
    setLoader(true);
    const response = await dispatch(removeSmsClient(selectedClients[0]))
    if (response) {
      //TODO: show delete success message
      handleResponses(response,
        {
          S_201: {
            code: 201,
            message: ToastMessages.SUCCESS,
            Func: () => null
          },
          S_202: {
            code: 202,
            Func: () => setDialog(DialogType.UNSUBSCRIBED_IN_PROGRESS)
          },
          S_400: {
            code: 400,
            message: ToastMessages.SOMETHING_WENT_WRONG,
            Func: () => null
          },
          'S_401': {
            code: 401,
            message: ToastMessages.GROUP_INVALID_API,
            Func: () => null
          },
          'S_404': {
            code: 404,
            message: ToastMessages.NO_CLIENTS_FOUND,
            Func: () => null
          },
          'S_500': {
            code: 500,
            message: ToastMessages.GROUP_ERROR,
            Func: () => null
          },
        }
      );
      getData()
      setDialog(null);
    }
    setLoader(false);
  }
  const handleAssignClientsToGroup = async (groupData) => {
    setDialog(null);
    setLoader(true);
    const response = await dispatch(AddClientsToGroup({
      ...searchData,
      GroupName: groupData.GroupName,
      IsTestGroup: groupData.IsTestGroup,
      PageSize: TotalCount
    }));
    handleResponses(response, assignClientsActions);
    setLoader(false);
    dispatch(getGroupsBySubAccountId());
    getData();
  }
  const handleUnSubscribe = async (opt, notifyEmail) => {
    setDialog(null);
    setLoader(true);
    setEmailToNotify(notifyEmail === -1 ? '' : notifyEmail);

    await dispatch(setUnsubscribedClients({
      ...searchData,
      RemovingOption: opt, PageSize: TotalCount, GroupName: searchData.ResultTitle, NotifyEmail: notifyEmail === -1 ? '' : notifyEmail
    })).then(res => {
      handleResponses(res, {
        'S_200': {
          code: 200,
          message: ToastMessages.SUCCESS,
          Func: () => setDialog(null)
        },
        'S_201': {
          code: 201,
          message: ToastMessages.UNSUBSCRIBED_SUCCESS,
          Func: () => {
            setDialog(null)
            setTimeout(() => {
              sessionStorage.removeItem('searchData');
              window.history.back();
            }, 4000);
            //getData()
          }
        },
        'S_202': {
          code: 202,
          // message: ToastMessages.UNSUBSCRIBED_IN_PROGRESS,
          Func: () => {
            setDialog(DialogType.UNSUBSCRIBED_IN_PROGRESS);
          }
        },
        'S_401': {
          code: 401,
          message: ToastMessages.GROUP_INVALID_API,
          Func: () => null
        },
        'S_404': {
          code: 404,
          message: ToastMessages.NO_CLIENTS_FOUND,
          Func: () => null
        },
        'S_500': {
          code: 500,
          message: ToastMessages.GROUP_ERROR,
          Func: () => null
        },
      })
    })
  }
  //  COMPONENTS  //
  const renderHeader = () => {
    return (
      <>
        <Box className={clsx(classes.flex, classes.spaceBetween, classes.flexWrap)} >
          <Typography
            style={{ width: windowSize !== "xs" ? 'auto' : '' }}
            className={clsx(classes.managementTitle, "mgmtTitle", windowSize === "xs" ? classes.w70 : '')}
          >
            {t("client.logPageHeaderResource1.Text")} {searchData?.ResultTitle ? " - " : ""} {searchData?.ResultTitle}
          </Typography>
          {window.history.state &&
            <Button
              className={clsx(classes.btn, classes.btnRounded)}
              onClick={() => {
                if (searchData?.PageProperty || searchData?.PageName) {
                  navigate(`/react/${searchData?.PageProperty?.PageName ?? searchData?.PageName}`, {
                    state: {
                      from: 'clientsearchresult'
                    }
                  })
                }
                else {
                  sessionStorage.removeItem('searchData');
                  window.history.back()
                }
              }
              }
              startIcon={!isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
            > {t("common.back")}</Button>
          }
        </Box>
      </>
    );
  };
  const handleSearch = (searchData) => {
    let sessionSearchData = null;
    if (searchReferrer === true) {
      sessionSearchData = JSON.parse(window.sessionStorage?.getItem('searchData'));
      if (sessionSearchData)
        sessionSearchData.IsSearchByFilter = true;
    }
    setSearchData({ ...sessionSearchData, ...searchData })
  }
  // DONE
  const renderSearchLine = () => {
    return (
      <Grid container spacing={2} className={clsx(classes.lineTopMarging, 'searchLine')}>
        <Grid item>
          <TextField
            variant="outlined"
            size="small"
            value={searchStr}
            onKeyPress={handleKeyDown}
            onChange={(e) => setSearchStr(e.target.value)}
            className={clsx(classes.textField, classes.minWidth252)}
            placeholder={t("appBar.groups.search")}
          />
        </Grid>
        {PageTypeObject[`${searchData?.PageType || CLIENT_CONSTANTS.PAGE_TYPES.Undefined}`]?.filterComponents?.map(comp => comp?.())}
        <Grid item>
          <Button
            onClick={() => {
              handleSearch({
                ...searchData,
                PageIndex: 1,
                PageSize: rowsPerPage,
                FromDate: date.FromDate,
                ToDate: date.ToDate,
                SearchTerm: searchStr,
                MyActivities: null,
                MyConditions: null,
                IsAdvanced: false,
                IsSearchByFilter: false,
              });
              setPage(1);
              handleFilter();
            }}
            className={clsx(classes.btn, classes.btnRounded, classes.searchButton)}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
          >
            {t("campaigns.btnSearchResource1.Text")}
          </Button>
        </Grid>
        {
          (searchData?.SearchTerm || searchData?.FromDate || searchData?.ToDate) && (
            <Grid item>
              <Button
                onClick={() => {
                  setDate({ FromDate: null, ToDate: null });
                  handleSearch({ ...searchData, SearchTerm: "", FromDate: null, ToDate: null, ...filterSearch });
                  setSearchStr("");
                  setPage(1);
                  handleFilter();
                }}
                className={clsx(classes.btn, classes.btnRounded, classes.searchButton)}
                endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
              >
                {t("common.clear")}
              </Button>
            </Grid>
          )
        }
      </Grid >
    );
  };
  const renderManagmentLine = () => {
    return (
      <Grid container spacing={2} className={classes.linePadding} style={{ width: '100%' }}>
        <Grid item xs={windowSize === "xs" && 12}>
          <Button
            className={clsx(
              classes.btn, classes.btnRounded
            )}
            onClick={() => setDialog(DialogType.ADD_GROUP)}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
          >
            {t("group.new")}
          </Button>
        </Grid>
        <Grid item xs={windowSize === "xs" && 12}>
          <Button
            className={clsx(classes.btn, classes.btnRounded)}
            onClick={() => setDialog(DialogType.UNSUB_RECIPIENT)}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
          >
            {t("recipient.unsubscribe")}
          </Button>
        </Grid>
        {windowSize !== "xs" && (
          <Grid item>
            <Button
              className={clsx(classes.btn, classes.btnRounded)}
              onClick={() => setDialog(DialogType.CONFIRM_INVALID)}
              endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
            >
              {t("client.makeInvalid")}
            </Button>
          </Grid>
        )}
        {
          accountFeatures?.indexOf(PulseemFeatures.LOCK_EXPORT_DATA) === -1 && <Grid item xs={windowSize === "xs" && 12}>
            <Button
              className={clsx(
                !data ? classes.disabled : null,
                classes.btn, classes.btnRounded
              )}
              onClick={() => setDialog(DialogType.EXPORT_FORMAT)}
              endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
            >
              {t("campaigns.exportFile")}
            </Button>
          </Grid>
        }

        {searchData?.PageType !== CLIENT_CONSTANTS.PAGE_TYPES.Revenue && searchData?.PageType !== CLIENT_CONSTANTS.PAGE_TYPES.WhatsappRevenue &&
          <Grid item xs={windowSize === "xs" && 12} className={clsx(classes.groupsLableContainer)} style={{ alignItems: 'center' }}>
            <Box>
              <Typography className={clsx(classes.groupsLable, classes.f18, classes.bold)}>
                {`${TotalCount.toLocaleString()} ${t("common.Clients")}`}
              </Typography>
            </Box>
          </Grid>
        }
        {(searchData?.PageType === CLIENT_CONSTANTS.PAGE_TYPES.Revenue || searchData?.PageType === CLIENT_CONSTANTS.PAGE_TYPES.WhatsappRevenue) &&
          <Grid item xs={windowSize === "xs" && 12} style={{ paddingTop: 0, margin: '0 auto' }}>
            {revenueSummary && <SummaryRow
              classes={classes}
              data={revenueSummary} />
            }
          </Grid>},
        {location?.state?.PageType === CLIENT_CONSTANTS.PAGE_TYPES.Revenue && <Grid item xs={windowSize === "xs" && 12} style={{ paddingTop: 0, margin: '0 auto' }}>
          {revenueSummary && <SummaryRow
            data={revenueSummary}
            classes={classes} />
          }
        </Grid>}
      </Grid>
    );
  };
  const handleRowsPerPageChange = (val) => {
    dispatch(setRowsPerPage(val))
  }
  const renderPhoneNameCell = (row, fullwidth) => {
    let date = null;
    const { FirstName, LastName, CreationDate } = row;
    let text = t("common.UpdatedOn");
    date = moment(CreationDate, dateFormat);
    return (
      <>
        {
          (FirstName || LastName) && (
            <CustomTooltip
              isSimpleTooltip={false}
              interactive={true}
              classes={{
                tooltip: clsx(classes.tooltipBlack, classes.tooltipPlacement),
                arrow: classes.fBlack,
              }}
              arrow={true}
              style={{ fontSize: 18, fontWeight: "bold", direction: isRTL ? 'rtl' : 'ltr' }}
              placement={"top"}
              title={<Typography noWrap={false}>{FirstName} {LastName}</Typography>}
              text={`${FirstName} ${LastName}`}
            >
              {fullwidth ? (
                <Typography
                  className={clsx(classes.nameEllipsis, classes.fullWidth)}
                  style={{ maxWidth: "100%", minHeight: 28 }}
                >
                  {FirstName} {LastName}
                </Typography>
              ) : (
                <Typography className={classes.nameEllipsis} style={{ minHeight: 28 }}>
                  {FirstName} {LastName}
                </Typography>
              )}
            </CustomTooltip>
          )
        }
        <Typography className={classes.grayTextCell}>
          {`${text} ${date.format("DD/MM/YYYY")} ${date.format("LT")}`}
        </Typography>
      </>
    );
  };
  const renderWebNameCell = (row, fullwidth) => {
    let date = null;
    const { FirstName, LastName, CreationDate } = row;
    let text = t("common.UpdatedOn");
    date = CreationDate ? moment(CreationDate, dateFormat) : null;
    return (
      <Grid container spacing={1}>
        <Grid item sm={12} style={{ textAlign: 'start' }}>
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
            title={<Typography noWrap={false}>{FirstName} {LastName}</Typography>}
            text={`${FirstName} ${LastName}`}
          >
            <Typography noWrap={false} style={{ minHeight: 28 }} className={classes.nameEllipsis}>{FirstName} {LastName}</Typography>
          </CustomTooltip>
          <Typography
            className={classes.grayTextCell}>
            {date ? `${text} ${date.format('DD/MM/YYYY')} ${date.format('LT')}` : text}
          </Typography>
        </Grid>
      </Grid>
    );
  };
  const RenderWebRow = (row) => {
    //TODO: Translation left, confirm keys
    // const { t } = useTranslation();
    const {
      Revenue,
      ClientID,
      Email,
      Status,
      SmsStatus,
      Cellphone,
      FirstName,
      LastName,
      UpdateDate,
      SentDate,
      CreationDate,
      LastSendDate,
      snt_OpeningDate,
      ErrorTypeText,
      OpenTime
    } = row;
    let iconsCells = [row.IsAutoResponder, row.IsConnectedToWebForm].filter((e) => {
      return e === true
    }).length;
    const renderCellIcons = () => {
      const iconsMap = [
        {
          key: 'edit',
          uIcon: EditIcon,
          lable: t("common.edit"),
          rootClass: classes.paddingIcon,
          onClick: async () => {
            setLoader(true);
            setSelectedClients([ClientID]);
            const recipientRequest = await dispatch(getClientsById([ClientID]));
            const cte = recipientRequest?.payload?.Data?.length > 0 && recipientRequest?.payload?.Data[0];
            //const existsClient = data.find((c) => { return c.ClientID === ClientID });
            //const tempData = data.filter((c) => { return c.ClientID !== ClientID });
            //setData([ ...tempData, clientToEdit ])
            setClientToEdit(cte);
            setDialog(DialogType.EDIT_RECIPIENT);
            setLoader(false);
          }
        },
        {
          key: 'deleteFromGroups',
          uIcon: DeleteRecipient,
          lable: t("recipient.deleteFromGroups"),
          rootClass: classes.paddingIcon,
          onClick: () => {
            setSelectedClients([ClientID])
            setDialog(DialogType.CONFIRM_DELETE_FROM_GROUPS)
          }
        },
        {
          key: 'deleteFromEmail',
          uIcon: RemoveEmail,
          lable: t("recipient.deleteEmail"),
          rootClass: classes.paddingIcon,
          onClick: () => {
            setSelectedClients([ClientID])
            setDialog(DialogType.CONFIRM_REMOVE_EMAIL)
          }
        },
        {
          key: 'deleteFromPhone',
          uIcon: RemovePhone,
          lable: t("recipient.deletePhone"),
          remove: windowSize === 'xs',
          rootClass: classes.paddingIcon,
          onClick: () => {
            setSelectedClients([ClientID])
            setDialog(DialogType.CONFIRM_REMOVE_PHONE)
          }
        },
      ]
      return (
        <Grid
          container
          direction='row'
          justifyContent={windowSize === 'xs' ? 'flex-start' : 'space-evenly'}
          className={localClasses.actionButtons}
        >
          {iconsMap.map(icon => (
            <Grid
              style={{ flex: 1, alignItems: 'center', }}
              className={clsx(icon.disable && classes.disabledCursor, 'rowIconContainer')}
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
    const switchStatus = (isEmail) => {
      if (Email && isEmail && Email !== '') {
        return t(ConvertClientStatus(SourceType.EMAIL, Status))
      }
      else if (Cellphone && !isEmail && Cellphone !== '') {
        return t(ConvertClientStatus(SourceType.SMS, SmsStatus))
      }
      return t("emailStatus.noStatus")
    }
    const cssClasses = (isEmail) => {
      if (isEmail) {
        switch (Status) {
          case 1: {
            return classes.sendIconText;
          }
          case 5: {
            return classes.grayTextCell;
          }
          default: {
            return Email ? classes.textColorRed : classes.textColorBlue;
          }
        }
      }
      else {
        switch (SmsStatus) {
          case 0: {
            return classes.sendIconText;
          }
          case 5: {
            return classes.grayTextCell;
          }
          default: {
            return Cellphone ? classes.textColorRed : classes.textColorBlue;
          }
        }
      }
    }
    return (
      <TableRow key={Math.round(Math.random() * 999999999)} classes={rowStyle}>
        <TableCell classes={cellStyle} align="center" className={classes.flex4}>
          <Grid container direction="row">
            <Grid item sm={12 - iconsCells}>
              {/* {renderNameCell({ GroupID, GroupName, isChecked: true, CreationDate, UpdateDate })} */}
              {renderWebNameCell({ ClientID, FirstName, LastName, isChecked: true, CreationDate, UpdateDate })}
            </Grid>
          </Grid>
        </TableCell>
        <TableCell
          classes={cellStyle}
          align="center"
          className={classes.flex6}
        >
          {renderCellIcons()}
        </TableCell>
        {PageTypeObject[`${searchData?.PageType || CLIENT_CONSTANTS.PAGE_TYPES.Undefined}`]?.component?.web &&
          <TableCell classes={cellStyle} align="center" className={classes.flex2}>
            {PageTypeObject[`${searchData?.PageType || CLIENT_CONSTANTS.PAGE_TYPES.Undefined}`]?.component?.web({
              Revenue: Revenue,
              snt_OpeningDate: snt_OpeningDate,
              LastSendDate: LastSendDate,
              SentDate: SentDate,
              CreationDate: CreationDate,
              LogSms_ErrorType: ErrorTypeText,
              OpenTime: OpenTime,
            })}
          </TableCell>}
        <TableCell classes={cellStyle} align="center" className={classes.flex4}>
          <FlexGrid
            customStyle={{ justifyContent: 'space-between' }}
            gridArr={[
              {
                label: t(""),
                component: (
                  <CustomTooltip
                    isSimpleTooltip={false}
                    interactive={true}
                    classes={{
                      tooltip: clsx(classes.tooltipBlack, classes.tooltipPlacement),
                      arrow: classes.fBlack,
                    }}
                    arrow={true}
                    style={{ fontWeight: "bold" }}
                    placement={"top"}
                    title={<Typography title={Email} className={classes.bold}>{`${Email}`}</Typography>}
                    text={`${Email && Email.length > 20 ? Email.substring(0, 20) + '...' : Email}`}
                  >
                  </CustomTooltip>
                ),
                classes: { text: localClasses.noWrap },
              },
              {
                label: "",
                component: <Typography className={clsx(classes.bold, cssClasses(true))}>{switchStatus(true)}</Typography>,
                classes: { text: localClasses.noWrap },
              }
            ]}
            variant="body1"
            align="center"
          />
        </TableCell>
        <TableCell classes={cellStyle} align="center" className={classes.flex3} style={{ border: 'none' }}>
          <FlexGrid
            customStyle={{ justifyContent: 'space-between' }}
            gridArr={[
              {
                label: t(""),
                component: (
                  <Typography className={classes.bold}>{Cellphone}</Typography>
                ),
                classes: { text: localClasses.noWrap },
              },
              {
                label: "",
                component: <Typography className={clsx(classes.bold, cssClasses(false))}>{switchStatus(false)}</Typography>,
                classes: { text: localClasses.noWrap },
              }
            ]}
            variant="body1"
            align="center"
          />
        </TableCell>
      </TableRow>
    );
  };
  const RenderPhoneRow = (row) => {
    const {
      Revenue,
      ClientID,
      Email,
      Status,
      SmsStatus,
      SentDate,
      Cellphone,
      LogSms_ErrorType,
      LastSendDate,
      snt_OpeningDate
    } = row;
    return (
      <TableRow key={ClientID} component="div" classes={rowStyle}>
        <TableCell
          style={{ flex: 1 }}
          classes={{ root: classes.tableCellRoot }}
          className={classes.p20}
        >
          <Box className={classes.spaceBetween}>
            <Box className={classes.inlineGrid}>
              {renderPhoneNameCell(row)}
            </Box>
            <Box className={clsx(classes.inlineGrid, classes.textCenter)}>
              {PageTypeObject[`${searchData?.PageType || CLIENT_CONSTANTS.PAGE_TYPES.Undefined}`]?.component?.mobile && PageTypeObject[`${searchData?.PageType || CLIENT_CONSTANTS.PAGE_TYPES.Undefined}`]?.component?.mobile({ Revenue: Revenue, snt_OpeningDate: snt_OpeningDate, LastSendDate: LastSendDate, LogSms_ErrorType: LogSms_ErrorType, SentDate: SentDate })}
              {/* <Typography className={classes.bold}>
                {t("common.campaignRevenue")}
              </Typography>
              <Typography>
                {Revenue}
              </Typography> */}
            </Box>
          </Box>
          <Box className={clsx(classes.mt5)} style={{ maxWidth: '90%' }}>
            <Box className={classes.flex}>
              <Box className={clsx(classes.flex6)}>
                <Typography className={classes.bold}>{t("recipient.emails")}</Typography>
                <Typography >{Email}</Typography>
              </Box>
              <Box className={clsx(classes.flex4)}>
                <Typography align='left' className={clsx(classes.middle, classes.bold, Status === 1 ? classes.sendIconText : classes.textColorRed)}>{Status === 1 ? t("common.statusActive") : t("common.Unsubscribed")}</Typography>
              </Box>
            </Box>
          </Box>
          <Box className={clsx(classes.mt2)} style={{ maxWidth: '90%' }}>
            <Box className={classes.flex}>
              <Box className={clsx(classes.flex6)}>
                <Typography className={classes.bold}>{t("common.Cellphone")}</Typography>
                <Typography >{Cellphone}</Typography>
              </Box>
              <Box className={clsx(classes.flex4)}>
                <Typography align='left' className={clsx(classes.middle, classes.bold, SmsStatus === 0 ? classes.sendIconText : classes.textColorRed)}>{SmsStatus === 0 ? t("common.statusActive") : t("common.Unsubscribed")}</Typography>
              </Box>
            </Box>
          </Box>
        </TableCell>
      </TableRow>
    )
  }
  const ConfirmDialog = () => {
    const DialogObject = {
      "CONFIRM_INVALID": {
        title: t("client.confirmMakeInvalidTitle"),
        bodyText: t("client.confirmMakeInvalidText"),
        onClose: () => setDialog(null),
        onConfirm: makeInvalid,
      },
      "CONFIRM_DELETE_FROM_GROUPS": {
        title: t('recipient.deleteRecipientFromGroup'),
        bodyText: t('client.confirmDeleteFromAllGroups'),
        onClose: () => setDialog(null),
        onConfirm: removeRecipientFromAllGroups,
      },
      "CONFIRM_REMOVE_EMAIL": {
        title: t('recipient.removeRecipientEmail'),
        bodyText: t('client.confirmRemoveEmail'),
        onClose: () => setDialog(null),
        onConfirm: removeEmailRecipient,
      },
      "CONFIRM_REMOVE_PHONE": {
        title: t('recipient.removeRecipientPhone'),
        bodyText: t('client.confirmRemovePhone'),
        onClose: () => setDialog(null),
        onConfirm: removeSMSRecipient,
      },
    };
    return (
      <BaseDialog
        classes={classes}
        open={
          dialog === DialogType.CONFIRM_INVALID ||
          dialog === DialogType.CONFIRM_DELETE_FROM_GROUPS ||
          dialog === DialogType.CONFIRM_REMOVE_EMAIL ||
          dialog === DialogType.CONFIRM_REMOVE_PHONE
        }
        // title={t("group.delete")}
        title={DialogObject[dialog]?.title || ''}
        showDivider={false}
        onClose={DialogObject[dialog]?.onClose || ''}
        onCancel={DialogObject[dialog]?.onClose || ''}
        onConfirm={DialogObject[dialog]?.onConfirm || null}
        cancelText="common.No"
        confirmText="common.Yes"
      >
        <Box>
          <Typography variant="subtitle1">
            {DialogObject[dialog]?.bodyText || ''}
          </Typography>
        </Box>
      </BaseDialog>
    )
  }
  const renderTableBody = () => {
    let sortedData = data ?? null; // data : [];
    let rpp = parseInt(rowsPerPage)
    if (sortedData && sortData.length > 0) {
      sortedData = (searchData?.PageType) === 15 ? data.slice((page - 1) * rpp, (page - 1) * rpp + rpp) : sortedData;
    }
    if (PageTypeObject[`${searchData?.PageType || CLIENT_CONSTANTS.PAGE_TYPES.Undefined}`]?.title) {
      TABLE_HEAD.splice(2, 0, {
        label: <div className={classes.flex}>
          <div className={classes.flex4} style={{ whiteSpace: 'break-spaces' }}>
            {PageTypeObject[`${searchData?.PageType || CLIENT_CONSTANTS.PAGE_TYPES.Undefined}`]?.title}
          </div>
          {!!PageTypeObject[`${searchData?.PageType || CLIENT_CONSTANTS.PAGE_TYPES.Undefined}`]?.sortKey &&
            //TODO: SORTING is left for multiple sort keys
            <div className={classes.flex1}>
              <Button className={clsx(classes.formControl, classes.dropDown, classes.controlField)}
                onClick={() => { sortData(PageTypeObject[`${searchData?.PageType || CLIENT_CONSTANTS.PAGE_TYPES.Undefined}`]?.sortKey) }}
                style={{ minWidth: 40 }}>
                {descSortDirection ? <BiSortDown /> : <BiSortUp />}
              </Button>
            </div>
          }
        </div>,
        classes: cellStyle,
        className: clsx(classes.flex2),
        align: "center",
      })
    }
    return (
      <>
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
          <Box className='tableBodyContainer'>
            <TableBody>
              {!sortedData || sortedData.length === 0 ?
                <Box className={clsx(classes.flex, classes.justifyCenterOfCenter)} style={{ height: 50 }}>
                  <Typography>{t("common.NoDataTryFilter")}</Typography>
                </Box> :
                sortedData.map((obj, idx) => windowSize === "xs" ? RenderPhoneRow(obj) : RenderWebRow(obj))}
            </TableBody>
          </Box>
        </DataTable>
        <TablePagination
          classes={classes}
          rows={TotalCount}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[6, 10, 20, 50]}
          page={page}
          onPageChange={(val) => {
            handlePageChange(val);
          }}
        />
      </>
    );
  };
  const renderConfirmDialog = () => {
    if (showConfirmDialog) {
      let dialog = {
        showDivider: true,
        icon: <ExportIcon />,
        title: t("common.ExportGroups"),
        content: (
          <Typography style={{ marginBottom: 20 }}>
            {!selectedClients || selectedClients.length === 0 ? t('common.IsExportGroups') : t("common.IsExportGroup")}
          </Typography>
        )
      }
      return (
        <BaseDialog
          classes={classes}
          cancelText="common.Cancel"
          confirmText="common.Yes"
          disableBackdropClick={true}
          open={showConfirmDialog}
          onCancel={() => setShowConfirmDialog(false)}
          onClose={() => setShowConfirmDialog(false)}
          {...dialog}>
          {dialog.content}
        </BaseDialog>
      );
    }
  }
  const showDialog = () => {
    if (dialog !== null) {
      switch (dialog) {
        case DialogType.ADD_GROUP: {
          return <AddGroupPopUp
            classes={classes}
            isOpen={dialog === DialogType.ADD_GROUP}
            onClose={() => setDialog(null)}
            windowSize={windowSize}
            ToastMessages={ToastMessages}
            setToastMessage={setToastMessage}
            addClientByQuery={true}
            createGroupCallback={(groupData) => { handleAssignClientsToGroup(groupData); }}
            handleResponses={(response, actions) => handleResponses(response, actions)}
            getData={() => null}
          />
        }
        case DialogType.EDIT_RECIPIENT: {
          let mappedGroups = [];
          if (data && data?.find((obj) => obj.ClientID === selectedClients[0])?.GroupIds?.length > 0) {
            mappedGroups = data?.find((obj) => obj.ClientID === selectedClients[0])?.GroupIds?.split(',')?.map(function (x) {
              return parseInt(x, 10);
            });
          }
          else if (searchData?.GroupIds && searchData?.GroupIds?.length > 0) {
            mappedGroups = searchData?.GroupIds?.map(function (x) {
              return parseInt(x, 10);
            })
          }

          return <AddRecipientPopup
            classes={classes}
            isOpen={selectedClients.length === 1 && dialog === DialogType.EDIT_RECIPIENT}
            onClose={() => { setDialog(null); setSelectedClients([]); }}
            setLoader={setLoader}
            windowSize={windowSize}
            ToastMessages={ToastMessages}
            setToastMessage={setToastMessage}
            Groups={groupData?.Groups?.reduce((prevVal, newVal) => [...prevVal, { GroupID: newVal.GroupID, GroupName: newVal.GroupName }], []) || []}
            DialogType={DialogType}
            selectedGroups={mappedGroups}
            setDialog={setDialog}
            handleResponses={(response, actions) => { handleResponses(response, actions); }}
            onAddRecipient={(closeDialog = true) => {
              closeDialog && setDialog(null);
              getData();
            }}
            recipientData={clientToEdit}
          />
        }
        case DialogType.UNSUB_RECIPIENT: {
          return <UnsubscribeOrDeletePopup
            classes={classes}
            isOpen={dialog === DialogType.DELETE_RECIPIENT || dialog === DialogType.UNSUB_RECIPIENT}
            onClose={() => { setDialog(null); }}
            setLoader={setLoader}
            windowSize={windowSize}
            ToastMessages={ToastMessages}
            setToastMessage={setToastMessage}
            // selectedGroups={selectedGroups}
            onSubmit={(opt, notifyEmail) => handleUnSubscribe(opt, notifyEmail)}
            clientData={{ ...searchData }}
            dialogType={dialog}
            getData={getData}
            handleResponses={(response, actions) => handleResponses(response, actions)}
            showDropBox={false}
            showEmailToNotify={TotalCount > 10000}
          />;
        }
        case DialogType.EXPORT_IN_PROGRESS: {
          return <BaseDialog
            showDefaultButtons={false}
            classes={classes}
            contentStyle={classes.maxWidth900}
            open={dialog === DialogType.EXPORT_IN_PROGRESS}
            renderButtons={() => (<>
              <Grid
                container
                spacing={2}
                className={classes.dialogButtonsContainer}
              >
                <Grid item>
                  <Button
                    variant='contained'
                    size='small'
                    onClick={() => {
                      setDialog(null)
                    }}
                    className={clsx(
                      classes.btn,
                      classes.btnRounded
                    )}>
                    {t('common.confirm')}
                  </Button>
                </Grid>
              </Grid>
            </>)}
          >
            {RenderHtml(t("recipient.exportGroups.inProgress").replace("##notifyEmailPlaceHolder##", emailToNotify !== '' ? t('recipient.exportGroups.inProgressNotifyOnDone').replace("##notifyEmail##", `<b>${emailToNotify}</b>`) : ''))}
          </BaseDialog>
        }
        case DialogType.UNSUBSCRIBED_IN_PROGRESS: {
          return <BaseDialog
            showDefaultButtons={false}
            classes={classes}
            contentStyle={classes.maxWidth900}
            open={dialog === DialogType.UNSUBSCRIBED_IN_PROGRESS}
            renderButtons={() => (<>
              <Grid
                container
                spacing={2}
                className={classes.dialogButtonsContainer}
              >
                <Grid item>
                  <Button
                    variant='contained'
                    size='small'
                    onClick={() => {
                      sessionStorage.removeItem('searchData');
                      window.history.back();
                    }}
                    className={clsx(
                      classes.solidDialogButton,
                      classes.dialogConfirmButton
                    )}>
                    {t('common.confirm')}
                  </Button>
                </Grid>
              </Grid>
            </>)}
          >
            {RenderHtml(t("recipient.unsubscribed.inProgress").replace("##notifyEmailPlaceHolder##", emailToNotify !== '' ? t('recipient.unsubscribed.inProgressNotifyOnDone').replace("##notifyEmail##", `<b>${emailToNotify}</b>`) : ''))}
          </BaseDialog>
        }
        case DialogType.CONFIRM_INVALID:
        case DialogType.CONFIRM_DELETE_FROM_GROUPS:
        case DialogType.CONFIRM_REMOVE_EMAIL:
        case DialogType.CONFIRM_REMOVE_PHONE:
          {
            return ConfirmDialog()
          }
        default: {
          return <></>
        }
      }
    }
    return <></>;
  }

  useEffect(() => {
    if (downloadProgress) {
      setIsDownloadProgress(false);
    }
  }, [downloadProgress])
  return (
    <DefaultScreen
      currentPage="groups"
      containerClass={clsx(classes.management, classes.mb50)}
      classes={classes}
    >
      <Box className={'topSection'}>
        <Title
          classes={classes}
          Element={renderHeader()}
        />
        {renderSearchLine()}
      </Box>
      {toastMessage && renderToast()}
      {windowSize !== "xs" ? renderManagmentLine() : null}
      {renderTableBody()}
      {renderConfirmDialog()}
      {showDialog()}
      <ConfirmRadioDialog
        classes={classes}
        isOpen={dialog === DialogType.EXPORT_FORMAT}
        title={t('campaigns.exportFile')}
        radioTitle={TotalCount > 100000 ? '' : t('common.SelectFormat')}
        onConfirm={(e, notifyEmail) => handleDownloadCsv(e, notifyEmail)}
        onCancel={() => setDialog(null)}
        cookieName={'exportFormat'}
        defaultValue={TotalCount > 100000 ? "csv" : "xls"}
        showEmailToNotify={TotalCount > 100000}
        options={TotalCount > 100000 ? null : ExportFileTypes}
      />
      <Loader isOpen={showLoader} progress={downloadProgress} message={t("common.downloadInProgress")} isDownloadProgress={isDownloadProgress} />
    </DefaultScreen>
  );
};
export default ClientSearchResult;