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
  useTheme,
  Link
} from "@material-ui/core";
import { SearchIcon, ExportIcon } from "../../assets/images/managment/index";
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
import RenderRow from "./SubComp/RenderRow";
import RenderPhoneRow from "./SubComp/RenderPhoneRow";
import Toast from '../../components/Toast/Toast.component';
import { Dialog } from '../../components/managment/index';
import { searchAllClients } from "../../redux/reducers/clientSlice";
import { BiSortDown, BiSortUp } from "react-icons/bi";
import SummaryRow from '../../components/Grids/SummaryRow';

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
  const [selectedClients, setSelectedClients] = useState([]);
  const [searchStr, setSearchStr] = useState("");
  const [page, setPage] = useState(1);
  const [toastMessage, setToastMessage] = useState(null);

  const [responseMessage, setResponseMessage] = useState({ title: "", message: "" });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { ClientData, TotalCount, TotalRevenue, CampaignClicks } = useSelector(state => state.client);
  const { referrer, id } = useParams();
  const [data, setData] = useState([]);
  const [descSortDirection, setSortDirection] = useState(true);
  const [filterMin, setFilterMin] = useState("");
  const [filterMax, setFilterMax] = useState("");
  const [filterSearch, setFilterSearch] = useState(false);
  const [totalClients, setTotalClients] = useState(TotalCount);
  const [isSearching, setIsSearching] = useState(false);
  const [revenueSummary, setRevenueSummary] = useState(null);
  const [serachData, setSearchData] = useState({
    PageSize: 6,
    PageIndex: 0,
    SearchTerm: "",
    Status: 0,
    PageType: 15,
    ReportType: referrer === 'sms' ? 20 : 10,
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
    ADD_GROUP: "addGroup",
    EDIT_GROUP: "editGroup",
    DELETE_GROUP: "delete group",
    ADD_RECIPIENT: "add recipient",
    ADD_RECIPIENTS: "add recipients",
    UNSUB_RECIPIENT: "unsubscribe recipients",
    DELETE_RECIPIENT: "delete recipients",
    RESET_GROUP: 'reset group',
    MESSAGE: "message",
    SUMMARY: "summary",
    EXPORT_ALL: "exportAll",
    EXPORT_SELECTED: "exportSelected",
    SIMPLY_CLUB: "simplyclub"
  };

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
    // {
    //   label: t(""),
    //   classes: cellStyle,
    //   className: classes.flex6,
    //   align: "center",
    // },
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
      className: clsx(classes.flex2),
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
    setData(ClientData);

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

  const handleSelected = (id) => {
    const index = selectedClients.indexOf(id);
    if (index !== -1) {
      let temp = [...selectedClients];
      temp.splice(index, 1);
      setSelectedClients([...temp]);
    } else setSelectedClients([...selectedClients, id]);
  };


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
            // onClick={() => {
            //   selectedClients.length === 0 ? setToastMessage(ToastMessages.GROUP_ZERO_SELECT) : setDialog(DialogType.DELETE_GROUP)
            // }}
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
            onClick={() => setShowConfirmDialog(true)}
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
  const renderNameCell = (row, fullwidth) => {
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

  const renderTableBody = useMemo(() => {
    let sortedData = data ? data : [];
    let rpp = parseInt(rowsPerPage)
    if (sortedData.length <= 0) {
      return <></>;
    }

    sortedData = data.slice((page - 1) * rpp, (page - 1) * rpp + rpp)

    return (
      <TableBody>
        {sortedData.map((obj, idx) =>
          windowSize === "xs" ?
            (
              <RenderPhoneRow
                key={idx}
                row={obj}
                rowStyle={rowStyle}
                name={renderNameCell(obj, true)}
                classes={classes}
                colorTextStyle={colorTextStyle}
              // setSelectedClients={(id) => setSelectedClients([id])}
              // DialogType={DialogType}
              // setDialog={(val) => setDialog(val)}
              />
            )
            : (
              <RenderRow
                key={idx}
                row={obj}
                classes={classes}
                // setDialog={(val) => setDialog(val)}
                handleSelected={(id) => handleSelected(id)}
                selectedClients={selectedClients}
                setSelectedClients={(id) => setSelectedClients([id])}
                // DialogType={DialogType}
                windowSize={windowSize}
                dateFormat={dateFormat}
                rowStyle={rowStyle}
                cellStyle={cellStyle}
                noBorderCellStyle={noBorderCellStyle}
                colorTextStyle={colorTextStyle}
              // handleDeleteGroup={handleDeleteGroup}
              />
            )
        )}
      </TableBody>
    );
  }, [data, rowsPerPage, page, classes, selectedClients]);

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

  return (
    <DefaultScreen
      currentPage="groups"
      classes={classes}
      containerClass={clsx(classes.management, classes.mb50)}
    >
      {renderToast()}
      {renderHeader()}
      {/* {renderSearchLine()} */}
      {/* {windowSize !== "xs" ? renderManagmentLine() : null} */}
      <Grid item lg={8} xs={windowSize === "xs" && 12} style={{ paddingTop: 40, margin: '0 auto' }}>
        {revenueSummary && <SummaryRow
          data={revenueSummary}
          classes={classes} />
        }
      </Grid>
      <DataTable
        tableContainer={{
          className:
            windowSize === "xs"
              ? clsx(classes.mt3, classes.tableStyle)
              : clsx(classes.tableStyle, classes.mt25),
        }}
        table={{ className: classes.tableContainer }}
        tableHead={{
          tableHeadCells: TABLE_HEAD,
          classes: rowStyle,
          className: windowSize === "xs" && classes.dNone,
        }}
      >
        {renderTableBody}
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
      {renderConfirmDialog()}
      <Loader isOpen={showLoader} />
    </DefaultScreen>
  );
};

export default ClientSearchResult;
