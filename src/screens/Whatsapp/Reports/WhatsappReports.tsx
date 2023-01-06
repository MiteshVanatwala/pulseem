import {
  Button,
  Grid,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  CalendarIcon,
  SearchIcon,
} from "../../../assets/images/managment/index";
import {
  DateField,
  TablePagination,
} from "../../../components/managment/index";
import ExcelImg from "../../../assets/images/excel.png";
import { Title } from "../../../components/managment/Title";
import { ClassesType } from "../../Classes.types";
import DefaultScreen from "../../DefaultScreen";
import { coreProps } from "../Editor/Types/WhatsappCreator.types";
import ClearIcon from "@material-ui/icons/Clear";
import clsx from "clsx";
import { BaseSyntheticEvent, useEffect, useState } from "react";
import moment from "moment";
import CustomTooltip from "../../../components/Tooltip/CustomTooltip";
import Pagination from "../management/Component/Pagination";
import { DatePicker, KeyboardDatePicker } from "@material-ui/pickers";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import { reportData } from "../Constant";
import {
  campaignDataProps,
  exportDataProps,
  filtersObjectProps,
  reportDataProps,
  searchArrayProps,
} from "../Campaign/Types/WhatsappCampaign.types";
import { exportAsXLSX } from "../../../helpers/Export/ExportFile";

const WhatsappReports = ({ classes }: ClassesType) => {
  const { t: translator } = useTranslation();
  const { windowSize } = useSelector(
    (state: { core: coreProps }) => state.core
  );
  const [fromDate, handleFromDate] = useState<MaterialUiPickersDate | null>(
    null
  );
  const [toDate, handleToDate] = useState<MaterialUiPickersDate | null>(null);
  const [campaignNameSearch, setCampaineNameSearch] = useState<string>("");
  const [isSearching, setSearching] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(6);

  const [isFromDatePickerOpen, setIsFromDatePickerOpen] =
    useState<boolean>(false);
  const [isToDatePickerOpen, setIsToDatePickerOpen] = useState<boolean>(false);

  const [tableData, setTableData] = useState<reportDataProps[]>(reportData);

  const rows: any = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot };
  const cellStyle = {
    head: classes.tableCellHead,
    body: classes.tableCellBody,
    root: classes.tableCellRoot,
  };
  const dateFormat = "YYYY-MM-DD HH:mm:ss.FFF";
  useEffect(() => {
    if (
      (fromDate && moment(fromDate).format("DD/MM/YYYY")?.length > 0) ||
      (toDate && moment(toDate).format("DD/MM/YYYY")?.length > 0) ||
      campaignNameSearch?.length > 0
    ) {
      setSearching(true);
    }
  }, [fromDate, toDate, campaignNameSearch]);
  const handleFromDateChange = (value: any) => {
    if (toDate && value > toDate) {
      handleToDate(null);
    }
    handleFromDate(value);
  };
  const handleCampainNameChange = (event: BaseSyntheticEvent) => {
    setCampaineNameSearch(event.target.value);
  };
  const clearSearch = () => {
    setCampaineNameSearch("");
    handleFromDate(null);
    handleToDate(null);
    setSearching(false);
    setTableData(reportData);
  };
  const renderNameCell = (row: reportDataProps) => {
    let date = null;
    let text = "";
    if (!row.sendDate) {
      date = moment(row.updatedDate, dateFormat);
      text = translator("common.UpdatedOn");
    } else {
      date = moment(row.sendDate, dateFormat);
      const dateMillis = date.valueOf();
      const currentDateMillis = moment().valueOf();
      text =
        dateMillis > currentDateMillis
          ? translator("common.ScheduledFor")
          : translator("common.SentOn");
    }

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
          style={{ fontSize: 18, fontWeight: "bold" }}
          placement={"top"}
          title={<Typography noWrap={false}>{row.campaignName}</Typography>}
          text={row.campaignName}
          children={undefined}
          icon={undefined}
        />
        <Typography className={classes.grayTextCell}>
          {`${text} ${date.format("DD/MM/YYYY")} ${date.format("LT")}`}
        </Typography>
      </>
    );
  };

  const getSearchedCampaign = () => {
    const searchArray: searchArrayProps[] = [
      {
        type: "name",
        campaignName: campaignNameSearch,
      },
      {
        type: "date",
        fromDate,
        toDate,
      },
    ];
    const filtersObject: filtersObjectProps = {
      name: (row: reportDataProps) => {
        return String(row.campaignName.toLowerCase()).includes(
          campaignNameSearch.toLowerCase()
        );
      },
      date: (row: reportDataProps, values: searchArrayProps) => {
        const { updatedDate, sendDate } = row;
        const lastUpdate = sendDate
          ? moment(sendDate, dateFormat).valueOf()
          : moment(updatedDate, dateFormat).valueOf();
        const startFromDate =
          (values.fromDate && values.fromDate.hour(0).minute(0).valueOf()) ||
          null;
        const endToDate =
          (values.toDate && values.toDate.hour(23).minute(59).valueOf()) ||
          null;

        if (!values) return true;
        if (fromDate && toDate && startFromDate && endToDate)
          return lastUpdate >= startFromDate && lastUpdate <= endToDate;
        if (fromDate && startFromDate) return lastUpdate >= startFromDate;
        if (toDate && endToDate) return lastUpdate <= endToDate;
        return true;
      },
    };

    let sortData = reportData;
    searchArray.forEach((values: searchArrayProps) => {
      sortData = sortData.filter((row: reportDataProps) =>
        filtersObject[values.type](row, values)
      );
    });
    return sortData;
  };

  const getRows = () => {
    let sortData = tableData;
    sortData = sortData.slice(
      (page - 1) * rowsPerPage,
      (page - 1) * rowsPerPage + rowsPerPage
    );

    return sortData?.length > 0 ? sortData : [];
  };

  const onSearch = () => {
    setPage(1);
    setTableData(getSearchedCampaign());
  };

  const getTableTypographyCells = (title: string, value: string | number) => {
    return (
      <>
        <Typography className={classes.middleText}>{value}</Typography>
        <Typography className={classes.middleText}>{title}</Typography>
      </>
    );
  };

  const onExport = async () => {
    const header: {} = {
      1: "Campaign Id",
      3: "Status",
      4: "Campaign Name",
      5: "Total Send Plan",
      6: "Total Sent",
      7: "Total Read",
      8: "Clicks Count",
      9: "Unique Clicks Count",
      10: "Total Feedback",
      11: "Removed",
      12: "Failure",
      13: "Updated Date",
      14: "Send Date",
    };
    const exportData: exportDataProps[] = tableData?.map(
      (row: reportDataProps) => {
        let updatedRow: exportDataProps = {
          ...row,
          updatedDate: row.updatedDate
            ? moment(row.updatedDate).format("DD/MM/YYYY")
            : "",
          sendDate: row.sendDate
            ? moment(row.sendDate).format("DD/MM/YYYY")
            : "",
        };
        delete updatedRow.statusId;
        return updatedRow;
      }
    );
    exportAsXLSX(exportData, header, "pulseemExport.XLSX", "Sheet1");
  };

  return (
    <DefaultScreen
      subPage={"manage"}
      currentPage="whatsapp"
      classes={classes}
      customPadding={true}
    >
      <Title
        Text={translator("whatsappReport.report")}
        Classes={classes.whatsappTemplateTitle}
        ContainerStyle={{}}
        Element={null}
      />

      <div className={classes.manageWhatsappTemplates}>
        <Grid container spacing={2} className={classes.lineTopMarging}>
          <Grid item>
            <TextField
              variant="outlined"
              size="small"
              value={campaignNameSearch}
              onChange={handleCampainNameChange}
              className={clsx(classes.textField, classes.minWidth252)}
              placeholder={translator(
                "sms.GridBoundColumnResource2.HeaderText"
              )}
            />
          </Grid>

          {windowSize !== "xs" && (
            <Grid item>
              <KeyboardDatePicker
                inputVariant="outlined"
                className={clsx(classes.textField)}
                inputProps={{
                  className: classes.datePickerInput,
                }}
                variant="inline"
                keyboardIcon={<CalendarIcon />}
                format={"DD/MM/YYYY"}
                placeholder={translator("whatsappReport.fromDate")}
                initialFocusedDate={moment()}
                value={fromDate}
                onChange={handleFromDate}
                onClose={() => setIsFromDatePickerOpen(false)}
                open={isFromDatePickerOpen}
                onClick={() => setIsFromDatePickerOpen(true)}
                autoOk={true}
              />
            </Grid>
          )}

          {windowSize !== "xs" && (
            <Grid item>
              <KeyboardDatePicker
                inputVariant="outlined"
                className={clsx(classes.textField)}
                inputProps={{
                  className: classes.datePickerInput,
                }}
                variant="inline"
                keyboardIcon={<CalendarIcon />}
                format={"DD/MM/YYYY"}
                placeholder={translator("whatsappReport.toDate")}
                initialFocusedDate={moment()}
                value={toDate}
                onChange={handleToDate}
                onClose={() => setIsToDatePickerOpen(false)}
                open={isToDatePickerOpen}
                onClick={() => setIsToDatePickerOpen(true)}
                autoOk={true}
              />
            </Grid>
          )}

          <Grid item>
            <Button
              size="large"
              variant="contained"
              onClick={onSearch}
              className={classes.searchButton}
              endIcon={<SearchIcon />}
            >
              {translator("campaigns.btnSearchResource1.Text")}
            </Button>
          </Grid>
          {isSearching && (
            <Grid item>
              <Button
                size="large"
                variant="contained"
                onClick={clearSearch}
                className={classes.searchButton}
                endIcon={<ClearIcon />}
              >
                {translator("common.clear")}
              </Button>
            </Grid>
          )}
        </Grid>

        <Grid
          container
          spacing={2}
          className={classes.whatsappReportHeaderButtons}
        >
          <div className={classes.whatsappReportHeaderExportButton}>
            <Button onClick={onExport}>
              <img src={ExcelImg} alt="excel-icon" />
              {translator("whatsappReport.export")}
            </Button>
          </div>

          <span className={classes.whatsappReportCampaignCount}>
            {tableData?.length || 0} {translator("whatsappReport.campaigns")}
          </span>
        </Grid>

        <Grid
          container
          spacing={2}
          className={classes.whatsappReportTableWrapper}
        >
          <TableContainer>
            <Table className={classes.tableContainer}>
              {windowSize !== "xs" && (
                <TableHead>
                  <TableRow classes={rowStyle}>
                    <TableCell classes={cellStyle} align="center">
                      <>
                        {translator("sms.GridBoundColumnResource2.HeaderText")}
                      </>
                    </TableCell>
                    <TableCell classes={cellStyle} align="center">
                      <Grid container justifyContent="space-around">
                        <Grid item>
                          <>{"To send"}</>
                        </Grid>
                        <Grid item>
                          <>{translator("common.Sent")}</>
                        </Grid>
                      </Grid>
                    </TableCell>
                    <TableCell classes={cellStyle} align="center">
                      <>{translator("whatsappReport.read")}</>
                    </TableCell>
                    <TableCell classes={cellStyle} align="center">
                      <>{translator("common.Clicks")}</>
                    </TableCell>
                    <TableCell classes={cellStyle} align="center">
                      <>{translator("common.Feedback")}</>
                    </TableCell>
                    <TableCell classes={cellStyle} align="center">
                      <>{}</>
                    </TableCell>
                    <TableCell classes={cellStyle} align="center">
                      <>{translator("common.revenue")}</>
                    </TableCell>
                  </TableRow>
                </TableHead>
              )}
              {getRows()?.map((report: reportDataProps) => (
                <TableRow
                  key={Math.round(Math.random() * 999999999)}
                  classes={rowStyle}
                >
                  <TableCell
                    classes={cellStyle}
                    align="center"
                    className={clsx(classes.tableCellBody)}
                  >
                    {renderNameCell(report)}
                  </TableCell>
                  <TableCell
                    classes={cellStyle}
                    align="center"
                    className={clsx(classes.tableCellBody)}
                  >
                    <Grid container justifyContent="space-around">
                      <Grid item>
                        {getTableTypographyCells(
                          "To Send",
                          report.totalSendPlan
                        )}
                      </Grid>
                      <Grid item>
                        {getTableTypographyCells("Sent", report.totalSent)}
                      </Grid>
                    </Grid>
                  </TableCell>
                  <TableCell
                    classes={cellStyle}
                    align="center"
                    className={clsx(classes.tableCellBody)}
                  >
                    {getTableTypographyCells("Read", report.totalRead)}
                  </TableCell>
                  <TableCell
                    classes={cellStyle}
                    align="center"
                    className={clsx(classes.tableCellBody)}
                  >
                    <Grid container justifyContent="space-around">
                      <Grid item>
                        {getTableTypographyCells("Clicks", report.clicksCount)}
                      </Grid>
                      <Grid item>
                        {getTableTypographyCells(
                          "Unique",
                          report.uniqueClicksCount
                        )}
                      </Grid>
                    </Grid>
                  </TableCell>
                  <TableCell
                    classes={cellStyle}
                    align="center"
                    className={clsx(classes.tableCellBody)}
                  >
                    {getTableTypographyCells("Total", report.totalFeedback)}
                  </TableCell>
                  <TableCell
                    classes={cellStyle}
                    align="center"
                    className={clsx(classes.tableCellBody)}
                  >
                    <Grid container justifyContent="space-around">
                      <Grid item>
                        {getTableTypographyCells("Removed", report.removed)}
                      </Grid>
                      <Grid item>
                        {getTableTypographyCells("Failed", report.failure)}
                      </Grid>
                    </Grid>
                  </TableCell>
                  <TableCell
                    component="th"
                    scope="row"
                    className={clsx(classes.tableCellRoot)}
                  >
                    {/* {'Revenue'} */}
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          </TableContainer>
        </Grid>
        <Pagination
          classes={classes}
          rows={tableData?.length}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(rowsNumber: number) =>
            setRowsPerPage(rowsNumber)
          }
          rowsPerPageOptions={[6, 10, 20, 50]}
          page={page}
          onPageChange={(pageNumber: number) => setPage(pageNumber)}
          returnPageOne={false}
        />
      </div>
    </DefaultScreen>
  );
};

export default WhatsappReports;
