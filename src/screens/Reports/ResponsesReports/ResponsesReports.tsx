import React, { useState, useEffect } from "react";
import DefaultScreen from "../../DefaultScreen";
import clsx from "clsx";
import {
  Typography,
  TableBody,
  TableRow,
  TableCell,
  Grid,
  Button,
  TextField,
  Box,
  Tabs,
  Tab,
} from "@material-ui/core";
import { EditIcon } from "../../../assets/images/managment/index";
import {
  DateField,
  TablePagination,
} from "../../../components/managment/index";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import moment from "moment";
import "moment/locale/he";
import { Loader } from "../../../components/Loader/Loader";
import { setRowsPerPage } from "../../../redux/reducers/coreSlice";
import DataTable from "../../../components/Table/DataTable";
import { useNavigate } from "react-router";
import { GetResponsesReports } from "../../../redux/reducers/reportSlice";
import ConfirmRadioDialog from "../../../components/DialogTemplates/ConfirmRadioDialog";
import { ExportFile } from "../../../helpers/Export/ExportFile";
import { ExportFileTypes } from "../../../model/Export/ExportFileTypes";
import { HandleExportData } from "../../../helpers/Export/ExportHelper";
import { Title } from "../../../components/managment/Title";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import useCore from "../../../helpers/hooks/Core";
import { TabContext } from "@material-ui/lab";
import { StateType } from "../../../Models/StateTypes";
import {
  ResponsesFilter,
  ResponsesRowType,
} from "../../../Models/Reports/ResponsesReports";

const DEFAULT_FILTER: ResponsesFilter = {
  FromDate: null,
  ToDate: null,
  FromNumber: "",
  PageIndex: 1,
  PageSize: 6,
  IsExport: false,
};

const ResponsesReports = () => {
  const { classes } = useCore();
  const { accountFeatures, language, windowSize, isRTL, rowsPerPage } =
    useSelector((state: StateType) => state.core);
  const { responsesReportDetails } = useSelector(
    (state: StateType) => state.report
  );

  const { t } = useTranslation();
  const [searchData, setSearchData] = useState<ResponsesFilter>(DEFAULT_FILTER);
  const [isSearching, setIsSearching] = useState<boolean>(true);
  const [filter, setFilter] = useState<boolean>(false);
  // const [page, setPage] = useState<number>(1);
  const [tabValue, setTabValue] = useState<number>(0);

  const dispatch = useDispatch();
  const rowStyle = {
    head: classes.tableRowReportHead,
    root: clsx(classes.tableRowRoot, classes.maxHeight87, classes.minHeight50),
  };
  const cell50wStyle = {
    head: clsx(classes.tableCellHead),
    root: clsx(classes.tableCellRoot, classes.paddingHead, classes.minWidth50),
  };
  const cellBodyStyle = {
    body: clsx(classes.tableCellBody),
    root: clsx(classes.tableCellRoot),
  };
  const borderCellStyle = {
    body: clsx(classes.tableCellBody),
    root: clsx(classes.tableCellRoot, classes.minWidth50),
  };
  const [showLoader, setLoader] = useState<boolean>(true);
  const [dialogType, setDialogType] = useState<String | null>(null);
  const rowsOptions = [6, 10, 20, 50];

  moment.locale(language);

  const TABLE_HEAD = [
    {
      label: t("report.ResponsesReports.clientFrom"),
      classes: cell50wStyle,
      className: classes.flex2,
      align: "center",
    },
    {
      label: t("report.ResponsesReports.toNumber"),
      classes: cell50wStyle,
      className: classes.flex1,
      align: "center",
    },
    {
      label: t("report.ResponsesReports.smsStatus"),
      classes: cell50wStyle,
      className: classes.flex1,
      align: "center",
    },
    {
      label: t("report.ResponsesReports.replyDate"),
      classes: cell50wStyle,
      className: classes.flex1,
      align: "center",
    },
    {
      label: t("report.ResponsesReports.messageContent"),
      classes: cell50wStyle,
      className: classes.flex1,
      align: "center",
    },
  ];

  useEffect(() => {
    const initProducts = async () => {
      setLoader(true);
      dispatch(GetResponsesReports({ ...searchData, PageSize: rowsPerPage }));
      setIsSearching(false);
      setLoader(false);
    };
    if (isSearching) {
      initProducts();
    }
  }, [isSearching]);

  //  HANDLERS  //
  //COMMENT: LEFT
  const exportColumnHeader = {
    ResponseId: t("report.ResponsesReports.responseId"),
    ClientName: t("report.ResponsesReports.clientFrom"),
    ToNumber: t("report.ResponsesReports.toNumber"),
    ReplyDate: t("report.ResponsesReports.replyDate"),
    SmsStatus: t("report.ResponsesReports.smsStatus"),
    MessageContent: t("report.ResponsesReports.messageContent"),
  };

  const handleDownloadCsv = async (formatType: any) => {
    setDialogType(null);
    setLoader(true);
    const exportOptions = {
      OrderItems: true,
      FormatDate: true,
      Order: Object.keys(exportColumnHeader),
    };

    try {
      const result = await HandleExportData(exportPRData, exportOptions);

      ExportFile({
        data: result,
        fileName: "ResponsesReport",
        exportType: formatType,
        fields: exportColumnHeader,
      });
    } catch (e) {
      console.log(e);
      // dispatch(sendToTeamChannel({
      //     MethodName: 'handleDownloadCsv',
      //     ComponentName: 'ArchiveManagement.js',
      //     Text: e
      // }));
    } finally {
      setLoader(false);
    }
  };
  //COMMENT: LEFT

  const handleFromDateChange = (value: any) => {
    if (searchData.ToDate && value > searchData.ToDate) {
      setSearchData({ ...searchData, FromDate: null });
    }
    setSearchData({ ...searchData, FromDate: value });
  };

  //  COMPONENTS  //
  const renderFilter = () => {
    return (
      <Grid container spacing={2}>
        <Grid item>
          <DateField
            toolbarDisabled={false}
            classes={classes}
            value={searchData.FromDate}
            onChange={handleFromDateChange}
            placeholder={t("notifications.searchSection.fromDate")}
          />
        </Grid>
        <Grid item>
          <DateField
            toolbarDisabled={false}
            classes={classes}
            value={searchData.ToDate}
            onChange={(value) =>
              setSearchData({ ...searchData, ToDate: value })
            }
            placeholder={t("notifications.searchSection.toDate")}
          />
        </Grid>
        <Grid item>
          <TextField
            variant="outlined"
            size="small"
            value={searchData.FromNumber}
            onChange={(e) =>
              setSearchData({ ...searchData, FromNumber: e.target.value })
            }
            className={clsx(classes.textField, classes.minWidth252)}
            placeholder={t("common.FrmNumber")}
          />
        </Grid>

        <Grid item>
          <Button
            onClick={() => {
              if (
                searchData.FromDate ||
                searchData.ToDate ||
                searchData.FromNumber
              ) {
                setIsSearching(true);
                setFilter(true);
              }
            }}
            className={clsx(classes.btn, classes.btnRounded)}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
          >
            <>{t("notifications.buttons.search")}</>
          </Button>
          <Typography className={classes.f14}>
            <>{t("common.AdvancedSearch")}</>
          </Typography>
        </Grid>
        {filter && (
          <Grid item>
            <Button
              onClick={() => {
                setSearchData(DEFAULT_FILTER);
                setIsSearching(true);
                setFilter(false);
              }}
              className={clsx(classes.btn, classes.btnRounded)}
              endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
            >
              <>{t("common.clear")}</>
            </Button>
          </Grid>
        )}
      </Grid>
    );
  };

  const renderManagmentLine = () => {
    const dataLength = responsesReportDetails?.TotalResponses ?? 0;
    return (
      <Grid container spacing={2} className={classes.linePadding}>
        <Grid item className={classes.groupsLableContainer}>
          <Typography className={classes.groupsLable}>
            {`${dataLength} ${t("report.ProductsReport.products")}`}
          </Typography>
        </Grid>
      </Grid>
    );
  };

  const renderClientName = (name: String) => (
    <Box className={clsx(classes.dFlex, classes.spaceBetween, classes.w100)}>
      <Typography>{name}</Typography>
      <EditIcon width={16} height={18} />
    </Box>
  );

  const renderIntData = (
    value: number,
    data: { title: String; href: String; onClick: Function | null }
  ) => {
    const {
      title = windowSize === "xs" ? "" : t("notifications.tblBody.total"),
      href = "",
      onClick = null,
    } = data;
    return (
      <Box style={{ display: "flex", flexDirection: "column" }}>
        <Typography
          component={"p"}
          onClick={() => onClick?.()}
          className={clsx(
            classes.middleText,
            onClick && value > 0 ? classes.link : ""
          )}
          // target="_blank"
        >
          {(value && value.toLocaleString()) || "0"}
        </Typography>
      </Box>
    );
  };

  const renderRow = (row: ResponsesRowType) => {
    const {
      ResponseId,
      ClientName,
      ToNumber,
      ReplyDate,
      SmsStatus,
      MessageContent,
    } = row;
    // const hrefs = getHrefs(ResponseId);
    return (
      <TableRow key={`${ResponseId}`} classes={rowStyle}>
        <TableCell
          classes={cellBodyStyle}
          align="center"
          className={clsx(classes.flex2)}
        >
          {renderClientName(ClientName)}
        </TableCell>
        <TableCell
          classes={borderCellStyle}
          align="center"
          className={classes.flex2}
        >
          <Typography>{ToNumber}</Typography>
        </TableCell>
        <TableCell
          classes={borderCellStyle}
          align="center"
          className={classes.flex1}
        >
          <Typography>{SmsStatus}</Typography>
        </TableCell>
        <TableCell
          classes={borderCellStyle}
          align="center"
          className={classes.flex1}
        >
          {ReplyDate}
        </TableCell>
        <TableCell
          classes={borderCellStyle}
          align="center"
          className={classes.flex1}
        >
          {MessageContent}
        </TableCell>
      </TableRow>
    );
  };

  const renderPhoneRow = (row: ResponsesRowType) => {
    return <></>;
  };

  const handleRowsPerPageSearching = (val: number) => {
    dispatch(setRowsPerPage(val));
    setIsSearching(true);
  };
  const handlePageChange = (val: number) => {
    setSearchData({ ...searchData, PageIndex: val });
    setIsSearching(true);
  };

  const renderTableBody = () => {
    if (
      responsesReportDetails &&
      responsesReportDetails?.Responses?.length > 0
    ) {
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
          <Box className="tableBodyContainer groupsTable">
            <TableBody>
              {responsesReportDetails?.Responses.map(
                windowSize === "xs" ? renderPhoneRow : renderRow
              )}
            </TableBody>
          </Box>
        </DataTable>
      );
    }
    return (
      <Box
        className={clsx(classes.flex, classes.justifyCenterOfCenter)}
        style={{ height: 50 }}
      >
        <Typography>
          <>{t("common.NoDataTryFilter")}</>
        </Typography>
      </Box>
    );
  };

  const renderTablePagination = () => {
    return (
      <TablePagination
        classes={classes}
        rows={
          responsesReportDetails?.TotalResponses
            ? responsesReportDetails?.TotalResponses
            : 0
        }
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageSearching}
        rowsPerPageOptions={rowsOptions}
        page={searchData.PageIndex}
        onPageChange={handlePageChange}
      />
    );
  };

  return (
    <DefaultScreen
      classes={classes}
      containerClass={clsx(classes.management, classes.mb50)}
      currentPage="reports"
      subPage="productsReport"
    >
      <Box className={clsx("topSection")}>
        <Title Text={t("report.ResponsesReports.title")} classes={classes} />
        <Box className={clsx(classes.lineTopMarging, "searchLine")}>
          <TabContext value={String(tabValue)}>
            <Tabs
              value={tabValue}
              onChange={(e, value) => {
                // setAdvanceSearch(tabValue !== value ? false : advanceSearch);
                setTabValue(value);
              }}
              className={clsx(classes.tab, classes.tablistRoot)}
              classes={{ indicator: classes.hideIndicator }}
            >
              <Tab
                label={`${t("appBar.sms.title")}`}
                classes={{
                  root: classes.btnTab,
                  selected: classes.currentActiveTab,
                }}
                value={0}
              />
              <Tab
                label={
                  <Box style={{ padding: "0 2px 0 10px" }}>
                    <span>
                      <>{t("appBar.whatsapp.title")}</>
                    </span>
                    <span className={classes.comingSoonTab}>
                      {`${t("common.comingSoon")}`}
                    </span>
                  </Box>
                }
                classes={{
                  root: classes.btnTab,
                  selected: classes.currentActiveTab,
                }}
                value={1}
              />
            </Tabs>
            {accountFeatures?.indexOf("13") === -1 && windowSize !== "xs" && (
              <Grid container spacing={2} className={classes.linePadding}>
                <Button
                  className={clsx(classes.btn, classes.btnRounded)}
                  onClick={() => {
                    dispatch(
                      GetResponsesReports({ ...searchData, IsExport: true })
                    );
                    setDialogType("exportFormat");
                  }}
                  endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                >
                  <>{t("campaigns.exportFile")}</>
                </Button>
              </Grid>
            )}
            {renderFilter()}
          </TabContext>
        </Box>
      </Box>
      {renderManagmentLine()}
      {renderTableBody()}
      {renderTablePagination()}
      <ConfirmRadioDialog
        classes={classes}
        isOpen={dialogType === "exportFormat"}
        title={t("campaigns.exportFile")}
        radioTitle={t("common.SelectFormat")}
        onConfirm={(e) => handleDownloadCsv(e)}
        onCancel={() => setDialogType(null)}
        cookieName={"exportFormat"}
        defaultValue="xls"
        options={ExportFileTypes}
      />

      <Loader isOpen={showLoader} showBackdrop={true} />
    </DefaultScreen>
  );
};

export default ResponsesReports;
