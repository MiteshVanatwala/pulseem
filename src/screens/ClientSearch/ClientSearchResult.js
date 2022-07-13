import React, { useState, useEffect, useMemo, useRef } from "react";
import DefaultScreen from "../DefaultScreen";
import { useParams } from 'react-router-dom'
import clsx from "clsx";
import {
  Typography,
  Divider,
  TableBody,
  Grid,
  Button,
  TextField,
  Box,
  useTheme,
  Link,
  TableRow,
  TableCell,
  Checkbox,
  makeStyles,
  FormControlLabel,
  Paper
} from "@material-ui/core";
import { SearchIcon, ExportIcon, EditIcon, DeleteRecipient, DeleteEmail, DeletePhone } from "../../assets/images/managment/index";
import { DateField, ManagmentIcon } from "../../components/managment/index";
import { CSVLink } from "react-csv";
import {
  TablePagination,
  SearchField,
} from "../../components/managment/index";

import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import ClearIcon from "@material-ui/icons/Clear";
import moment from "moment";
import "moment/locale/he";
import { Loader } from "../../components/Loader/Loader";
import { setRowsPerPage } from "../../redux/reducers/coreSlice";
import { setCookie } from "../../helpers/cookies";
import CustomTooltip from "../../components/Tooltip/CustomTooltip";
import DataTable from "../../components/Table/DataTable";
import Toast from '../../components/Toast/Toast.component';
import { Dialog } from '../../components/managment/index';
import {
  AddClientsToGroup,
  deleteFromGroups,
  makeInvalidClients,
  removeEmailClient,
  removeSmsClient,
  searchAllClients,
  getExportData,
  setUnsubscribedClients,
  searchAdvancedClients
} from "../../redux/reducers/clientSlice";
import { getAccountExtraData } from '../../redux/reducers/smsSlice';
import { BiSortDown, BiSortUp, BiSortAlt2 } from "react-icons/bi";
import SummaryRow from '../../components/Grids/SummaryRow';
import AddGroupPopUp from "../Groups/Management/Popup/AddGroupPopUp";
import UnsubscribeOrDeletePopup from "../Groups/Management/Popup/UnsubscribeOrDeletePopup";
import FlexGrid from "../../components/Grids/FlexGrid";
import AddRecipientPopup from "../Groups/Management/Popup/AddRecipientPopup";
import { exportFile } from '../../helpers/exportFromJson';
import { preferredOrder, flatObject, formatDateTime, replaceExtraFieldHeader, deletePropertyFromArrayObject } from '../../helpers/exportHelper';
import { ClientStatus } from "../../helpers/PulseemArrays";
import { switchClientStatus } from '../../helpers/functions';
import { useLocation } from "react-router";
import { CLIENT_CONSTANTS, CSR_FILTER_ERRORS, Static_CSR_Data } from "../../model/Clients/Contants";
import { Autocomplete } from "@material-ui/lab";

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
  }
});

const ClientSearchResult = ({ props, classes }) => {
  const {
    language,
    windowSize,
    email,
    phone,
    rowsPerPage,
    smsOldVersion,
    isRTL
  } = useSelector((state) => state.core);
  const { t } = useTranslation();
  const { extraData } = useSelector(state => state.sms);
  const { groupData, subAccountAllGroups } = useSelector((state) => state.group);
  const { ClientData, TotalCount, TotalRevenue, CampaignClicks, ToastMessages } = useSelector(state => state.client);
  const localClasses = useStyles();
  const location = useLocation()
  // const { groupData, ToastMessages } = useSelector((state) => state.group);
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
  const [filterSearch, setFilterSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [revenueSummary, setRevenueSummary] = useState(null);
  const [searchData, setSearchData] = useState(null);
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
    CONFIRM_INVALID: "CONFIRM_INVALID"
  };

  useEffect(() => {
    const initExtraFields = async () => {
      await dispatch(getAccountExtraData());
    }
    let isSessionStorageData = null;
    let overwriteObject = location?.state;

    const referrer = document.referrer.split('/')[document.referrer.split('/').length - 1];

    if (referrer && referrer !== '') {
      isSessionStorageData = referrer.toLowerCase().includes('automationreport') || (referrer.toLowerCase().includes('clientsearch') && !referrer.toLowerCase().includes('result'))
      if (isSessionStorageData) {
        overwriteObject = JSON.parse(window.sessionStorage?.getItem('searchData'));
      }
    }
    // On load
    let initSearchData = {
      IsAdvanced: false,
      PageSize: rowsPerPage,
      PageIndex: page,
      SearchTerm: "",
      Status: location?.state?.Status ?? null,
      PageType: location?.state?.PageType ?? null,
      ReportType: document.referrer.toLowerCase().includes('smsmainreport') ? 20 : 10,
      TestStatusOfEmailElseSms: location?.state?.TestStatusOfEmailElseSms ?? null,
      CampaignID: id,
      Switch: "",
      CountryOrRegion: "",
      GroupIds: [],
      NodeID: "",
      ...overwriteObject,
    };

    setSearchData(initSearchData);
    initExtraFields();
  }, []);

  useEffect(() => {
    if (extraData && Object.entries(extraData).length > 0) {
      let updatingObject = {
        "Status": t('common.Status'),
        "SmsStatus": t('common.smsStatus'),
        "CreationDate": location?.state?.PageType === CLIENT_CONSTANTS.PAGE_TYPES.FormID ? t('client.subscribedOn') : t('common.CreationDate'),
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
        "ErrorTypeText": t('recipient.errorMessage'),
        "Revenue": t('common.campaignRevenue'),
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
      };
      if (location?.state?.PageType === CLIENT_CONSTANTS.PAGE_TYPES.OpenedCampaignID) {
        updatingObject["snt_OpeningDate"] = t('common.OpenTime');
      }
      updatingObject = replaceExtraFieldHeader(updatingObject, extraData);
      exportColumnHeader.current = updatingObject;
    }
  }, [extraData])

  useEffect(() => {
    if (searchData) {
      if (searchData.IsAdvanced) {
        getSearchData();
      }
      else {
        getData();
      }
    }
  }, [searchData]);


  const handleFromDateChange = (value) => {
    if (value > date.ToDate) {
      setDate({ ...date, ToDate: null });
    }
    setDate({ ...date, FromDate: value });
  }

  const handleKeyDown = (event) => {
    if (event.keyCode === 13 || event.code === "Enter") {
      setSearchData({
        ...searchData,
        PageIndex: 1,
        PageSize: rowsPerPage,
        FromDate: date.FromDate,
        ToDate: date.ToDate,
        SearchTerm: searchStr,
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
      });
      setPage(1);
      handleFilter();
    }
  };


  const handleDownloadCsv = async () => {
    setLoader(true);
    const response = await dispatch(getExportData(searchData));
    if (response && response.payload) {
      const data = response.payload;
      if (data.StatusCode === 201) {
        let orderList = await data.Clients.reduce((prev, next) => {
          let tempStatus = ClientStatus.Email.find((status) => status.id === next.Status)
          let tempSmsStatus = ClientStatus.Sms.find((status) => status.id === next.SmsStatus)
          return [...prev, { ...next, Status: t(tempStatus.value), SmsStatus: t(tempSmsStatus.value) }]
        }, []);

        orderList = orderList.map((ol) => { return flatObject(ol) });
        if (searchData.PageType !== CLIENT_CONSTANTS.PAGE_TYPES.Revenue) {
          orderList = deletePropertyFromArrayObject(orderList, "Revenue");
        }
        orderList = preferredOrder(orderList, Object.keys(exportColumnHeader.current));
        orderList = formatDateTime(orderList, t);

        exportFile({
          data: orderList,
          fileName: (location?.state && location?.state.ResultTitle) ? location?.state.ResultTitle.replace(' ', '_').replace('/', '_') : 'ClientSearchResult',
          exportType: 'csv',
          fields: exportColumnHeader.current
        });
      }
      else {
        setToastMessage(t('common.errorOccured'));
      }
    }
    setLoader(false);
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
    if (filterMin !== '' || filterMax !== '') {
      const sortedData = [...ClientData].filter((f) => {
        return f.Revenue >= parseInt(filterMin !== "" ? filterMin : 0) && f.Revenue <= parseInt(filterMax !== "" ? filterMax : 1000000)
      });
      setData(sortedData);
      setIsSearching(true);
    }
    else {
      resetSearch();
    }
  }
  const handlePageChange = (val) => {
    setPage(val);
    setSearchData({ ...searchData, PageIndex: val });
  }

  const resetSearch = () => {
    setData(ClientData);
    setFilterMin("");
    setFilterMax("");
    setDate({
      FromDate: null,
      ToDate: null,
    })
    setIsSearching(false);
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

  const FromDate = () => windowSize !== 'xs' ?
    <Grid item>
      <DateField
        toolbarDisabled={false}
        classes={classes}
        value={date.FromDate}
        onChange={handleFromDateChange}
        placeholder={t('mms.locFromDateResource1.Text')}
      />
    </Grid>
    : null

  const ToDate = () => windowSize !== 'xs' ?
    <Grid item>
      <DateField
        toolbarDisabled={false}
        classes={classes}
        value={date.ToDate}
        onChange={(value) => setDate({ ...date, ToDate: value })}
        placeholder={t('mms.locToDateResource1.Text')}
        minDate={date.FromDate ? date.FromDate : undefined}
      />
    </Grid>
    : null

  const PageTypeObject = {
    '1': {
      title: t("common.SendDate"),
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
      filterComponents: [FromDate, ToDate]
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
      filterComponents: [FromDate, ToDate]
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
      filterComponents: [FromDate, ToDate]
    },
    '8': {
      title: t("sms.sendingTime"),
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
      filterComponents: [FromDate, ToDate]
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
    await dispatch(searchAllClients(searchData));
    setLoader(false);
  };

  const getSearchData = async () => {
    setLoader(true);
    await dispatch(searchAdvancedClients(searchData));
    setLoader(false);
  }

  useEffect(() => {
    // setData(Static_CSR_Data)
    if (ClientData) {
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
    switch (response.payload.StatusCode || response.payload.Message.StatusCode) {
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
        setLoader(false);
    }
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
    await dispatch(makeInvalidClients(searchData)).then((res) => {
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
            getData()
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
      if (response.payload === 'true') {
        response.payload = { ...response.payload, StatusCode: 201 }
      }
      //TODO: show delete success message
      handleResponses(response,
        {
          S_201: {
            code: 201,
            message: ToastMessages.SUCCESS,
            Func: () => null
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
      if (response.payload === 'true') {
        response.payload = { ...response.payload, StatusCode: 201 }
      }
      //TODO: show delete success message
      handleResponses(response,
        {
          S_201: {
            code: 201,
            message: ToastMessages.SUCCESS,
            Func: () => null
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

  const handleAssignClientsToGroup = async (groupName) => {
    setLoader(true);
    const response = await dispatch(AddClientsToGroup({ ...searchData, GroupName: groupName }));
    handleResponses(response, assignClientsActions);
    setLoader(false);
    setDialog(null);
  }

  const handleUnSubscribe = async (opt) => {
    setDialog(null);
    setLoader(true);
    await dispatch(setUnsubscribedClients({ ...searchData, RemovingOption: opt })).then(res => {
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
            getData()
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
        <Box className={clsx(classes.flex, classes.spaceBetween)}>
          <Typography className={classes.managementTitle}>
            {t("client.logPageHeaderResource1.Text")} {location?.state && location?.state?.ResultTitle ? " - " : ""} {location?.state?.ResultTitle}
          </Typography>
          <Typography style={{ cursor: 'pointer', alignSelf: 'flex-end' }} onClick={() => window.history.back()}> {t("common.back")}</Typography>
        </Box>
        <Divider />
      </>
    );
  };


  // DONE
  const renderSearchLine = () => {


    if (windowSize === "xs") {
      return (
        <SearchField
          classes={classes}
          value={searchStr}
          onChange={(e) => setSearchStr(e.target.value)}
          onClick={() => {
            setSearchData({
              ...searchData,
              PageIndex: 1,
              PageSize: rowsPerPage,
              SearchTerm: searchStr,
            });
            setPage(1);
          }}
          onKeyPress={handleKeyPress}
          placeholder={t("report.clientName")}
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
            placeholder={t("report.clientName")}
          />
        </Grid>

        {filterSearch && PageTypeObject[`${searchData?.PageType || CLIENT_CONSTANTS.PAGE_TYPES.Undefined}`]?.filterComponents?.map(comp => comp?.())}
        <Grid item>
          <Button
            size="large"
            variant="contained"
            onClick={() => {
              setSearchData({
                ...searchData,
                PageIndex: 1,
                PageSize: rowsPerPage,
                FromDate: date.FromDate,
                ToDate: date.ToDate,
                SearchTerm: searchStr,
              });
              setPage(1);
              handleFilter();
            }}
            className={classes.searchButton}
            endIcon={<SearchIcon />}
          >
            {t("campaigns.btnSearchResource1.Text")}
          </Button>

          {
            [
              CLIENT_CONSTANTS.PAGE_TYPES.Revenue,
              CLIENT_CONSTANTS.PAGE_TYPES.FormID,
              CLIENT_CONSTANTS.PAGE_TYPES.TotalCountSMSCampaignID,
              CLIENT_CONSTANTS.PAGE_TYPES.OpenedCampaignID
            ].indexOf(location?.state?.PageType) !== -1 && <Link
              // {location?.state?.PageType === CLIENT_CONSTANTS.PAGE_TYPES.Revenue && <Link
              color='initial'
              component='button'
              underline='none'
              onClick={() => setFilterSearch(!filterSearch)}
              className={clsx(classes.dBlock, classes.mt5, filterSearch && windowSize === 'lg' ? classes.mb15 : null)}>
              {t(!filterSearch ? 'report.filterSearch' : 'report.closeFilterSearch')}
            </Link>
          }
        </Grid>
        {isSearching && <Grid item>
          <Button
            size='large'
            variant='contained'
            onClick={() => {
              resetSearch();
            }}
            className={classes.searchButton}
            endIcon={<ClearIcon />}>
            {t('common.clear')}
          </Button>
        </Grid>}
        {
          searchData?.SearchTerm && (
            <Grid item>
              <Button
                size="large"
                variant="contained"
                onClick={() => {
                  setSearchData({ ...searchData, SearchTerm: "" });
                  setSearchStr("");
                  setPage(1);
                  handleFilter();
                }}
                className={classes.searchButton}
                endIcon={<ClearIcon />}
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
        <Grid item xs={windowSize === "xs" && 12}>
          <Button
            variant="contained"
            size="medium"
            className={clsx(classes.actionButton, classes.actionButtonRed)}
            onClick={() => setDialog(DialogType.UNSUB_RECIPIENT)}
          >
            {t("recipient.unsubscribe")}
          </Button>
        </Grid>
        {windowSize !== "xs" && (
          <Grid item>
            <Button
              variant="contained"
              size="medium"
              className={clsx(classes.actionButton, classes.actionButtonRed)}
              // onClick={() => selectedClients.length === 0 ? setToastMessage(ToastMessages.CLIENT_ZERO_SELECT) : setDialog(DialogType.CONFIRM_INVALID)}
              onClick={() => setDialog(DialogType.CONFIRM_INVALID)}
            >
              {t("client.makeInvalid")}
            </Button>
          </Grid>
        )}

        <Grid item xs={windowSize === "xs" && 12}>
          <Button
            variant="contained"
            size="medium"
            className={clsx(
              classes.actionButton,
              classes.actionButtonGreen
            )}
            onClick={handleDownloadCsv}
            startIcon={<ExportIcon />}
          >
            {t("campaigns.exportFile")}
          </Button>
        </Grid>
        {location?.state?.PageType !== CLIENT_CONSTANTS.PAGE_TYPES.Revenue &&
          <Grid item xs={windowSize === "xs" && 12} className={clsx(classes.groupsLableContainer)} style={{ alignItems: 'center' }}>
            <Box>
              <Typography className={clsx(classes.groupsLable, classes.f18, classes.bold)}>
                {`${TotalCount} ${t("common.Clients")}`}
              </Typography>
            </Box>
          </Grid>
        }
        {location?.state?.PageType === CLIENT_CONSTANTS.PAGE_TYPES.Revenue && <Grid item xs={windowSize === "xs" && 12} style={{ paddingTop: 0, margin: '0 auto' }}>
          {revenueSummary && <SummaryRow
            data={revenueSummary}
            classes={classes} />
          }
        </Grid>}
      </Grid>
    );
  };
  const handleRowsPerPageChange = async (val) => {
    await dispatch(setRowsPerPage(val));
    setSearchData({
      ...searchData,
      PageSize: val
    })
    setCookie("rpp", val, { maxAge: 2147483647 });
  };
  const renderPhoneNameCell = (row, fullwidth) => {
    let date = null;
    const { FirstName, LastName } = row;
    let text = t("common.UpdatedOn");
    date = moment(row.CreationDate, dateFormat);

    return (
      <>
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
          title={<Typography noWrap={false}>{FirstName}{LastName}</Typography>}
          text={`${FirstName} ${LastName}`}
        >
          {fullwidth ? (
            <Typography
              className={clsx(classes.nameEllipsis, classes.fullWidth)}
              style={{ maxWidth: "100%", minHeight: 28 }}
            >
              {FirstName}{LastName}
            </Typography>
          ) : (
            <Typography className={classes.nameEllipsis} style={{ minHeight: 28 }}>
              {FirstName}{LastName}
            </Typography>
          )}
        </CustomTooltip>
        <Typography className={classes.grayTextCell}>
          {`${text} ${date.format("DD/MM/YYYY")} ${date.format("LT")}`}
        </Typography>
      </>
    );
  };
  const renderWebNameCell = (row, fullwidth) => {
    let date = null;
    const { FirstName, LastName, CreationDate, ClientID } = row;
    let text = t("common.UpdatedOn");
    date = moment(row.CreationDate, dateFormat);

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
            {`${text} ${date.format('DD/MM/YYYY')} ${date.format('LT')}`}
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
      LogSms_ErrorType,
      SentDate,
      CreationDate,
      LastSendDate,
      snt_OpeningDate,
      ErrorTypeText

    } = row;

    let iconsCells = [row.IsAutoResponder, row.IsConnectedToWebForm].filter((e) => {
      return e === true
    }).length;


    const renderCellIcons = () => {

      const iconsMap = [
        {
          key: 'edit',
          icon: EditIcon,
          lable: t("common.edit"),
          rootClass: classes.paddingIcon,
          onClick: () => {
            setSelectedClients([ClientID])
            setDialog(DialogType.EDIT_RECIPIENT)
          }
        },

        {
          key: 'deleteFromGroups',
          icon: DeleteRecipient,
          lable: t("recipient.deleteFromGroups"),
          rootClass: classes.paddingIcon,
          onClick: () => {
            setSelectedClients([ClientID])
            setDialog(DialogType.CONFIRM_DELETE_FROM_GROUPS)
          }
        },
        {
          key: 'deleteFromEmail',
          icon: DeleteEmail,
          lable: t("recipient.deleteEmail"),
          rootClass: classes.paddingIcon,
          onClick: () => {
            setSelectedClients([ClientID])
            setDialog(DialogType.CONFIRM_REMOVE_EMAIL)
          }
        },
        {
          key: 'deleteFromPhone',
          icon: DeletePhone,
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
          justifyContent={windowSize === 'xs' ? 'flex-start' : 'space-evenly'}>
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

    const switchStatus = (isEmail) => {
      if (Email && isEmail && Email !== '') {
        return t(switchClientStatus('email', Status))
      }
      else if (Cellphone && !isEmail && Cellphone !== '') {
        return t(switchClientStatus('sms', SmsStatus))
      }
      return t("emailStatus.noStatus")
    }

    const cssClasses = (isEmail) => {
      if (isEmail) {
        return Status === 1 ? classes.sendIconText : Email ? classes.textColorRed : classes.textColorBlue;
      }
      else {
        return SmsStatus === 0 ? classes.sendIconText : Cellphone ? classes.textColorRed : classes.textColorBlue
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
              LogSms_ErrorType: ErrorTypeText
            })}
          </TableCell>}


        {/* <TableCell classes={cellStyle} align="center" className={classes.flex2}>
          <Typography className={clsx(classes.bold, classes.f16)}>
            {Revenue} {t("common.NIS")}
          </Typography>
        </TableCell> */}
        <TableCell classes={cellStyle} align="center" className={classes.flex4}>
          <FlexGrid
            customStyle={{ justifyContent: 'space-between' }}
            gridArr={[
              {
                label: t(""),
                component: (
                  <Typography title={Email} className={classes.bold}>{`${Email && Email.length > 18 ? Email.substring(0, 18) + '...' : Email}`}</Typography>
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
              {PageTypeObject[`${searchData?.PageType || CLIENT_CONSTANTS.PAGE_TYPES.Undefined}`]?.component?.mobile && PageTypeObject[`${searchData?.PageType || CLIENT_CONSTANTS.PAGE_TYPES.Undefined}`]?.component?.mobile({ Revenue: Revenue, snt_OpeningDate: snt_OpeningDate, LastSendDate: LastSendDate, LogSms_ErrorType: LogSms_ErrorType })}

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
      <Dialog
        classes={classes}
        open={
          dialog === DialogType.CONFIRM_INVALID ||
          dialog === DialogType.CONFIRM_DELETE_FROM_GROUPS ||
          dialog === DialogType.CONFIRM_REMOVE_EMAIL ||
          dialog === DialogType.CONFIRM_REMOVE_PHONE
        }

        // title={t("group.delete")}
        title={DialogObject[dialog]?.title || ''}
        icon={<Box className={classes.dialogAlertIcon}>
          !
        </Box>}
        showDivider={true}
        onClose={DialogObject[dialog]?.onClose || ''}
        onCancel={DialogObject[dialog]?.onClose || ''}
        onConfirm={DialogObject[dialog]?.onConfirm || null}
        cancelText="common.Cancel"
        confirmText="common.Ok"
      >
        <Box>
          <Typography variant="subtitle1">
            {DialogObject[dialog]?.bodyText || ''}
          </Typography>
        </Box>
      </Dialog>
    )
  }


  const renderTableBody = () => {
    let sortedData = data ? data : [];
    let rpp = parseInt(rowsPerPage)
    if (sortedData.length <= 0) {
      return <></>;
    }

    sortedData = searchData?.PageType === 15 ? data.slice((page - 1) * rpp, (page - 1) * rpp + rpp) : sortedData;

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
          <TableBody>
            {sortedData.map((obj, idx) => windowSize === "xs" ? RenderPhoneRow(obj) : RenderWebRow(obj))}
          </TableBody>
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
        <Dialog
          cancelText="common.Cancel"
          confirmText="common.Yes"
          disableBackdropClick={true}
          classes={classes}
          open={showConfirmDialog}
          onCancel={() => setShowConfirmDialog(false)}
          onClose={() => setShowConfirmDialog(false)}
          // onConfirm={() => handleConfirmExport()}
          {...dialog}>
          {dialog.content}
        </Dialog>
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
            setLoader={setLoader}
            windowSize={windowSize}
            ToastMessages={ToastMessages}
            setToastMessage={setToastMessage}
            addClientByQuery={true}
            createGroupCallback={(groupName) => { handleAssignClientsToGroup(groupName); }}
            handleResponses={(response, actions) => handleResponses(response, actions)}
            getData={() => null}
          />
        }
        case DialogType.EDIT_RECIPIENT: {
          return <AddRecipientPopup
            classes={classes}
            isOpen={selectedClients.length === 1 && dialog === DialogType.EDIT_RECIPIENT}
            onClose={() => { setDialog(null); setSelectedClients([]); }}
            setLoader={setLoader}
            windowSize={windowSize}
            ToastMessages={ToastMessages}
            setToastMessage={setToastMessage}
            Groups={groupData?.Groups?.reduce((prevVal, newVal) => [...prevVal, { GroupID: newVal.GroupID, GroupName: newVal.GroupName }], []) || []}
            // selectGroup={(idArr) => setSelectedGroups(idArr)}
            DialogType={DialogType}
            selectedGroups={data.find((obj) => obj.ClientID === selectedClients[0])?.GroupIds || searchData?.GroupIds || []}
            setDialog={setDialog}
            handleResponses={(response, actions) => handleResponses(response, actions)}
            onAddRecipient={() => { getData(); }}
            recipientData={
              selectedClients[0] && (data.find((obj) => obj.ClientID === selectedClients[0]))
            }
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
            onSubmit={(opt) => handleUnSubscribe(opt)}
            clientData={{ ...searchData }}
            dialogType={dialog}
            getData={getData}
            handleResponses={(response, actions) => handleResponses(response, actions)}
            showDropBox={false}
          />;
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

  return (
    <DefaultScreen
      currentPage="groups"
      classes={classes}
      containerClass={clsx(classes.management, classes.mb50)}
    >
      {toastMessage && renderToast()}
      {renderHeader()}
      {renderSearchLine()}
      {windowSize !== "xs" ? renderManagmentLine() : null}
      {renderTableBody()}
      {renderConfirmDialog()}
      {showDialog()}
      <Loader isOpen={showLoader} />
    </DefaultScreen>
  );
};

export default ClientSearchResult;
