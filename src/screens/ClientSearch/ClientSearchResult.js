import React, { useState, useEffect, useMemo } from "react";
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
  FormControlLabel
} from "@material-ui/core";
import { SearchIcon, ExportIcon, EditIcon, DeleteRecipient, DeleteEmail, DeletePhone } from "../../assets/images/managment/index";
import { ManagmentIcon } from "../../components/managment/index";
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
import { addClientsToNewGroup, deleteFromGroups, makeInvalidClients, removeEmailClient, removeSmsClient, searchAllClients } from "../../redux/reducers/clientSlice";
import { BiSortDown, BiSortUp, BiSortAlt2 } from "react-icons/bi";
import SummaryRow from '../../components/Grids/SummaryRow';
import AddGroupPopUp from "../Groups/Management/Popup/AddGroupPopUp";
import UnsubscribeOrDeletePopup from "../Groups/Management/Popup/UnsubscribeOrDeletePopup";
import { Static_CSR_Data } from "./tempConstants";
import FlexGrid from "../../components/Grids/FlexGrid";
import AddRecipientPopup from "../Groups/Management/Popup/AddRecipientPopup";
import { exportFile } from '../../helpers/exportFromJson';
import { preferredOrder, statusNumberToString, formatDateTime, booleanToNumber } from '../../helpers/exportHelper';
import { ClientStatus } from "../../helpers/PulseemArrays";




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


const ClientSearchResult = ({ classes }) => {
  const {
    language,
    windowSize,
    email,
    phone,
    rowsPerPage,
    smsOldVersion,
    isRTL,
    ...props
  } = useSelector((state) => state.core);

  const { t } = useTranslation();
  const localClasses = useStyles();
  // const { groupData, ToastMessages } = useSelector((state) => state.group);
  const [selectedClients, setSelectedClients] = useState([]);
  const [searchStr, setSearchStr] = useState("");
  const [page, setPage] = useState(1);
  const [toastMessage, setToastMessage] = useState(null);
  const [responseMessage, setResponseMessage] = useState({ title: "", message: "" });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { ClientData, TotalCount, TotalRevenue, CampaignClicks, ToastMessages } = useSelector(state => state.client);
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [descSortDirection, setSortDirection] = useState(true);
  const [filterMin, setFilterMin] = useState("");
  const [filterMax, setFilterMax] = useState("");
  const [filterSearch, setFilterSearch] = useState(false);
  const [totalClients, setTotalClients] = useState(TotalCount);
  // const [avaregeRevenue, setAvaregeRevenue] = useState(TotalRevenue);
  const [isSearching, setIsSearching] = useState(false);
  const [revenueSummary, setRevenueSummary] = useState(null);
  const [serachData, setSearchData] = useState({
    PageSize: 6,
    PageIndex: 0,
    SearchTerm: "",
    Status: 0,
    PageType: 15,
    ReportType: document.referrer.toLowerCase().includes('smsmainreport') ? 20 : 10,
    IsSmsCampaign: false,
    CampaignID: id,
    Switch: "",
    CountryOrRegion: "",
    GroupIds: [],
    NodeID: ""
  });

  const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot };
  const cellStyle = {
    head: classes.tableCellHead,
    body: classes.tableCellBody,
    root: classes.tableCellRoot,
  };
  const noBorderCellStyle = {
    body: classes.tableCellBodyNoBorder,
    root: clsx(classes.tableCellRoot, classes.minWidth50),
  };
  const [dialog, setDialog] = useState(null);
  const [showLoader, setLoader] = useState(false);
  const dateFormat = "YYYY-MM-DD HH:mm:ss.FFF";
  const dispatch = useDispatch();
  moment.locale(language);
  const theme = useTheme();

  const colorTextStyle = {
    red: classes.textColorRed,
    blue: classes.textColorBlue,
    green: classes.sendIconText,
  };

  const DialogType = {
    ADD_GROUP: "ADD_GROUP",
    EDIT_RECIPIENT: "EDIT_RECIPIENT",
    CONFIRM_DELETE_FROM_GROUPS: "CONFIRM_DELETE_FROM_GROUPS",
    CONFIRM_REMOVE_EMAIL: "CONFIRM_REMOVE_EMAIL",
    CONFIRM_REMOVE_PHONE: "CONFIRM_REMOVE_PHONE",
    UNSUB_RECIPIENT: "UNSUB_RECIPIENT",
    CONFIRM_INVALID: "CONFIRM_INVALID"
  };

  const exportColumnHeader = {
    "FirstName": t('smsReport.firstName'),
    "LastName": t('smsReport.lastName'),
    "Revenue": t('common.campaignRevenue'),
    "Email": t("common.Mail"),
    "Status": t('common.Status'),
    "Cellphone": t('common.Cellphone'),
    "SmsStatus": t('common.smsStatus'),
    "CreationDate": t('common.CreationDate'),
    "UpdateDate": t('common.UpdateDate'),
  }

  const handleDownloadCsv = async () => {
    let orderList = await data.reduce((prev, next) => {
      let tempStatus = ClientStatus.Email.find((status) => status.id === next.Status)
      let tempSmsStatus = ClientStatus.Sms.find((status) => status.id === next.SmsStatus)
      return [...prev, { ...next, Status: t(tempStatus.value), SmsStatus: t(tempSmsStatus.value) }]
    }, []);
    console.log("ORDERLIST: ", orderList)
    orderList = preferredOrder(orderList, Object.keys(exportColumnHeader));
    // orderList = await statusNumberToString(t, orderList, ClientStatus);
    // orderList = await formatDateTime(orderList, t);
    // orderList = await booleanToNumber(orderList, 'IsResponse', true, t);
    exportFile({
      data: orderList,
      fileName: 'ClientSearchResult',
      exportType: 'csv',
      fields: exportColumnHeader
    });
  }

  const sortData = () => {
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
    return;
  }

  const handleFilter = () => {
    if (filterMin !== '' || filterMax !== '') {
      const sortedData = [...ClientData].filter((f) => {
        return f.Revenue >= parseInt(filterMin !== "" ? filterMin : 0) && f.Revenue <= parseInt(filterMax !== "" ? filterMax : 1000000)
      });
      setData(sortedData);
      setTotalClients(sortedData.length);
      setIsSearching(true);
    }
    else {
      resetSearch();
    }
  }

  const resetSearch = () => {
    setData(ClientData);
    setFilterMin("");
    setFilterMax("");
    setIsSearching(false);
    setTotalClients(ClientData ? ClientData.length : 0);
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
      label: <div className={classes.flex}>
        <div className={classes.flex4} style={{ whiteSpace: 'break-spaces' }}>{t("common.campaignRevenue")}</div>
        <div className={classes.flex1}>
          <Button className={clsx(classes.formControl, classes.dropDown, classes.controlField)}
            onClick={() => { sortData() }}
            style={{ minWidth: 40 }}>
            {descSortDirection ? <BiSortDown /> : <BiSortUp />}
          </Button>
        </div>
      </div>,
      classes: cellStyle,
      className: clsx(classes.flex2, classes.textUppercase),
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
    if (serachData.CampaignID > -1) {
      await dispatch(searchAllClients(serachData));
    }
    setLoader(false);
  };

  useEffect(() => {
    getData(); // BUG: UNCOMMENT THIS
  }, [dispatch, serachData]);

  useEffect(() => {
    handleFilter();
    // setData(ClientData);
    setData(Static_CSR_Data);

    if (TotalRevenue) {
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

  // const handleSelected = (id) => {
  //   const index = selectedClients.indexOf(id);
  //   if (index !== -1) {
  //     let temp = [...selectedClients];
  //     temp.splice(index, 1);
  //     setSelectedClients([...temp]);
  //   } else setSelectedClients([...selectedClients, id]);
  // };

  const makeInvalid = () => {
    dispatch(makeInvalidClients(selectedClients))
  }

  const removeRecipientFromAllGroups = () => {
    dispatch(deleteFromGroups)
  }
  const removeEmailRecipient = () => {
    dispatch(removeEmailClient)
  }
  const removeSMSRecipient = () => {
    dispatch(removeSmsClient)
  }

  const handleAddRecipients = async (groupId) => {

    const tempClientIds = await new Promise((resolve, reject) => {
      let allClientIds = data.reduce((prev, next) => [...prev, next.ClientID], [])
      resolve(allClientIds)
    })

    const tempData = {
      GroupId: '',
      ClientIds: [...tempClientIds]
    }

    dispatch(addClientsToNewGroup(tempData))
  }


  //  COMPONENTS  //

  const renderHeader = () => {
    return (
      <>
        <Typography className={classes.managementTitle}>
          {t("client.logPageHeaderResource1.Text")}
        </Typography>
        <Divider />
      </>
    );
  };
  // DONE
  const renderSearchLine = () => {
    const handleKeyDown = (event) => {
      if (event.keyCode === 13 || event.code === "Enter") {
        setSearchData({
          PageIndex: 1,
          PageSize: rowsPerPage,
          SearchTerm: searchStr,
        });
        setPage(1);
        handleFilter();
      }
    };

    const handleKeyPress = (e) => {
      if (e.charCode === 13 || e.code === "Enter") {
        setSearchData({
          PageIndex: 1,
          PageSize: rowsPerPage,
          SearchTerm: searchStr,
        });
        setPage(1);
        handleFilter();
      }
    };

    if (windowSize === "xs") {
      return (
        <SearchField
          classes={classes}
          value={searchStr}
          onChange={(e) => setSearchStr(e.target.value)}
          onClick={() => {
            setSearchData({
              PageIndex: 1,
              PageSize: rowsPerPage,
              SearchTerm: searchStr,
            });
            setPage(1);
          }}
          onKeyPress={handleKeyPress}
          placeholder={t("common.CampaignName")}
        />
      );
    }

    // const handleFilterSearch = () => {
    //   setFilterSearch(!filterSearch);
    // }

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
        {filterSearch && <>
          <Grid item>
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
          <Grid item>
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
        </>}
        <Grid item>
          <Button
            size="large"
            variant="contained"
            onClick={() => {
              setSearchData({
                PageIndex: 1,
                PageSize: rowsPerPage,
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
          <Link
            color='initial'
            component='button'
            underline='none'
            onClick={() => setFilterSearch(!filterSearch)}
            className={clsx(classes.dBlock, classes.mt5, filterSearch && windowSize === 'lg' ? classes.mb15 : null)}>
            {t(!filterSearch ? 'report.filterSearch' : 'report.closeFilterSearch')}
          </Link>
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
          serachData.SearchTerm && (
            <Grid item>
              <Button
                size="large"
                variant="contained"
                onClick={() => {
                  setSearchData({ ...serachData, SearchTerm: "" });
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
      <Grid container spacing={2} className={classes.linePadding}>
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
          <CSVLink
            data={[
              ["firstname", "lastname", "email"],
              ["Ahmed", "Tomi", "ah@smthing.co.com"],
              ["Raed", "Labes", "rl@smthing.co.com"],
              ["Yezzi", "Min l3b", "ymin@cocococo.com"],
            ]}
            filename="report.csv"
            className="hidden"
            ref={null}
            target="_blank"
          />
        </Grid>
        <Grid item xs={windowSize === "xs" && 12} style={{ paddingTop: 0, margin: '0 auto' }}>
          {revenueSummary && <SummaryRow
            data={revenueSummary}
            classes={classes} />
          }
        </Grid>

        {/* <Grid
          item
          xs={windowSize === "xs" && 12}
          className={clsx(classes.groupsLableContainer)}
          style={{ alignItems: 'center' }}
        >
          <Box>
            <Typography className={clsx(classes.groupsLable, classes.f18, classes.bold)}>
              {`${data && totalClients !== 0 ? totalClients : 0} ${t("common.Clients")}`}
            </Typography>
          </Box>

        </Grid> */}
      </Grid>
    );
  };
  const handleRowsPerPageChange = async (val) => {
    await dispatch(setRowsPerPage(val));
    setSearchData({
      ...serachData,
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
      <Grid container wrap="nowrap" spacing={1} alignItems='center'>
        {/* <Grid item sm={2}>
          <Checkbox
            color="primary"
            checked={selectedClients && selectedClients.indexOf(ClientID) !== -1}
            // indeterminate={}
            onClick={() => {
              if (selectedClients.indexOf(ClientID) !== -1) {
                setSelectedClients(selectedClients.filter(item => item !== ClientID))
              } else {
                setSelectedClients([...selectedClients, ClientID])
              }
            }}
          />

        </Grid> */}
        {/* <Grid item sm={10}> */}
        <Grid item sm={12}>
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
            title={<Typography noWrap={false}>{FirstName}{LastName}</Typography>}
            text={`${FirstName} ${LastName}`}

          >
            <Typography noWrap={false} style={{ minHeight: 28 }} className={classes.nameEllipsis}>{FirstName}{LastName}</Typography>
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
      CreationDate
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
        return Status === 1 ? t("common.statusActive") : t("common.Unsubscribed")
      }
      else if (Cellphone && !isEmail && Cellphone !== '') {
        return SmsStatus === 0 ? t("common.statusActive") : t("common.Unsubscribed")
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
        <TableCell classes={cellStyle} align="center" className={classes.flex2}>
          <Typography className={clsx(classes.bold, classes.f16)}>
            {Revenue} {t("common.NIS")}
          </Typography>
        </TableCell>
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

              <Typography className={classes.bold}>
                {t("common.campaignRevenue")}
              </Typography>
              <Typography>
                {Revenue}
              </Typography>

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

    sortedData = data.slice((page - 1) * rpp, (page - 1) * rpp + rpp)

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
          rows={clientLength}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[6, 10, 20, 50]}
          page={page}
          onPageChange={(val) => {
            setPage(val);
          }}
        />
      </>
    );
  };

  const clientLength = totalClients !== 0 ? totalClients : 0;

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
            createGroupCallback={(groupId) => { handleAddRecipients(groupId); setDialog(null) }}
            getData={getData}
            handleResponses={(response, actions) => handleResponses(response, actions)}
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
            DialogType={DialogType}
            setDialog={setDialog}
            handleResponses={(response, actions) => handleResponses(response, actions)}
            onRecipientAdded={() => { setDialog(null); getData(); }}
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
            dialogType={dialog}
            getData={getData}
            handleResponses={(response, actions) => handleResponses(response, actions)}
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
