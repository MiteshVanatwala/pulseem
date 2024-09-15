import { Box, Button, Checkbox, Grid, MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@material-ui/core";
import { Loader } from "../../../components/Loader/Loader";
import { useDispatch, useSelector } from "react-redux";
import { StateType } from "../../../Models/StateTypes";
import clsx from 'clsx'
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { rowsOptions, SizeOptionsOfHandHeldDevices } from "../../../helpers/Constants";
import { CreditHistory, CreditHistoryRequest } from "../../../Models/Account/AccountBilling";
import moment from "moment";
import { TablePagination } from "../../../components/managment";
import { setRowsPerPage } from "../../../redux/reducers/coreSlice";
import { getBulkHistory } from "../../../redux/reducers/BillingSlice";

const CreditHistoryDetails = ({ classes }: any) => {

  const { windowSize, rowsPerPage } = useSelector((state: StateType) => state.core)

  const rowStyle = { head: classes.tableRowReportHead, root: clsx(classes.tableRowRoot) }
  const cellStyle = { head: classes.tableCellHead, root: clsx(classes.tableCellRoot, classes.paddingHead) }
  const cell50wStyle = { head: clsx(classes.tableCellHead), root: clsx(classes.tableCellRoot, classes.paddingHead, classes.minWidth50) }
  const cellBodyStyle = { body: clsx(classes.tableCellBody), root: clsx(classes.tableCellRoot) }
  const noBorderCellStyle = { body: classes.tableCellBodyNoBorder, root: clsx(classes.tableCellRoot, classes.minWidth50) }
  const borderCellStyle = { body: clsx(classes.tableCellBody), root: clsx(classes.tableCellRoot, classes.minWidth50) }

  const [page, setPage] = useState<number>(1);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [creditHistories, setCreditHistories] = useState<CreditHistory[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [creditHistoryRequest, setCreditHistoryRequest] = useState<CreditHistoryRequest>({
    PageIndex: 1,
    PageSize: rowsPerPage,
    AccountType: null,
    Type: null,
    IsPulseemCreditOnly: true,
    FromDate: null,
    ToDate: null
  });

  const requestCreditHistory = async () => {
    setCreditHistories(null);
    setShowLoader(true);
    const c = await dispatch(getBulkHistory(creditHistoryRequest)) as any;
    if (c && c?.payload?.StatusCode === 201) {
      setCreditHistories(c?.payload?.Data);
      setTotalRecords(c?.payload?.Message);
    }
    setShowLoader(false);
  }

  useEffect(() => {
    requestCreditHistory();
  }, [creditHistoryRequest])

  const renderTable = () => {
    return (
      <TableContainer className={classes.tableStyle}>
        <Table className={classes.tableContainer}>
          {SizeOptionsOfHandHeldDevices.indexOf(windowSize) === -1 && renderTableHead()}
          {renderTableBody()}
        </Table>
      </TableContainer>
    )
  }

  const renderTableHead = () => {
    return (
      <TableHead>
        <TableRow classes={rowStyle}>
          <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t('report.date')}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex2} align='center'>{t("billing.amount")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex2} align='center'>{t("billing.accountType")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center'>{t("billing.type")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center'>{t("billing.transferedFrom")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex2} align='center'>{t("billing.transferredToName")}</TableCell>
        </TableRow>
      </TableHead>
    )
  }

  const renderTableBody = () => {
    if (creditHistories?.length > 0) {
      return (
        <Box className='tableBodyContainer'>
          <TableBody>
            {creditHistories
              .map(SizeOptionsOfHandHeldDevices.indexOf(windowSize) > -1 ? renderPhoneRow : renderRow)}
          </TableBody>
        </Box>
      )
    }
    return <Box className={clsx(classes.flex, classes.justifyCenterOfCenter)} style={{ height: 50 }}>
      <Typography>{t("common.NoDataTryFilter")}</Typography>
    </Box>
  }

  const renderRow = (row: CreditHistory) => {
    const renderType = (typeNumber: number) => {
      switch (typeNumber) {
        case 1: {
          return "email"
        }
        case 2:
        default: {
          return "sms"
        }
      }
    }
    const {
      Date,
      Amount,
      AccountType,
      Type,
      TransferedFromSubAccountName,
      TransferredToName
    } = row
    return (
      <TableRow
        key={Date}
        classes={rowStyle}>
        <TableCell
          classes={borderCellStyle}
          align='center'
          className={classes.flex2}>
          {moment(Date).format('HH:mm:ss - DD/MM/yyyy')}
        </TableCell>
        <TableCell
          classes={borderCellStyle}
          align='center'
          className={classes.flex2}>
          {`${Amount?.toLocaleString()} ${t('common.NIS')}`}
        </TableCell>
        <TableCell
          classes={borderCellStyle}
          align='center'
          className={classes.flex2}>
          {renderType(Type)}
        </TableCell>
        <TableCell
          classes={cellBodyStyle}
          align='center'
          className={clsx(classes.flex1)}>
          {!AccountType ? "רגיל" : "שליחה ישירה	"}
        </TableCell>
        <TableCell
          classes={cellBodyStyle}
          align='center'
          className={clsx(classes.flex1)}>
          {TransferedFromSubAccountName}
        </TableCell>
        <TableCell
          classes={cellBodyStyle}
          align='center'
          className={clsx(classes.flex2)}>
          {TransferredToName}
        </TableCell>
      </TableRow>
    )
  }

  const renderPhoneRow = (row: CreditHistory) => {
    const {
      AccountType,
      Amount,
      Date,
      TransferedFromSubAccountName,
      TransferredToName,
      Type
    } = row
    return (
      <TableRow
        key={Date}
        component='div'
        classes={rowStyle}>
        <TableCell classes={{ root: clsx(classes.tableCellRoot, classes.flex1, classes.tabelCellPadding) }}>
          <Box className={classes.inlineGrid} style={{ paddingInlineStart: 10 }}>
            {moment(Date).format('DD/MM/yyyy')}
          </Box>
          <Grid container spacing={2} style={{ paddingInlineStart: 10 }} >
            <Grid item>
              <Typography className={classes.mobileReportHead}>
                {`${Amount?.toLocaleString()} ${t('common.NIS')}`}
              </Typography>
            </Grid>
          </Grid>
          <Grid container spacing={2} style={{ paddingInlineStart: 10 }} >
            {Type}
          </Grid>
          <Grid container spacing={2} style={{ paddingInlineStart: 10 }}>
            {AccountType}
          </Grid>
          <Grid item xs={3}>
            <Grid container spacing={2}>
              <Grid item>
                {TransferedFromSubAccountName}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={3}>
            {TransferredToName}
          </Grid>
        </TableCell>
      </TableRow >
    )
  }

  const handleRowsPerPageChange = (val: any) => {
    dispatch(setRowsPerPage(val));
    setCreditHistoryRequest({ ...creditHistoryRequest, PageIndex: 1, PageSize: val })
  }
  const handlePageChange = (val: any) => {
    setPage(val);
    setCreditHistoryRequest({ ...creditHistoryRequest, PageIndex: val })
  }

  const renderTablePagination = () => {
    return (<TablePagination
      classes={classes}
      rows={totalRecords ?? 0}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={handleRowsPerPageChange}
      rowsPerPageOptions={rowsOptions}
      page={page}
      onPageChange={handlePageChange}
    />
    )
  }

  // useEffect(() => { }, [])

  return <Grid container style={{ position: 'relative', width: '100%' }}>
    <Loader isOpen={showLoader} showBackdrop={false} />
    <Grid item xs={4}>
      <Select
        value={creditHistoryRequest?.Type}
        onChange={(e: any) => {
          setCreditHistoryRequest({ ...creditHistoryRequest, Type: e.target.value })
        }}>
        <MenuItem value="-1">הכל</MenuItem>
        <MenuItem value="0">אימייל</MenuItem>
        <MenuItem value="1">SMS</MenuItem>
        <MenuItem value="2">MMS</MenuItem>
      </Select>
    </Grid>
    <Grid item xs={4}>
      <Select
        value={creditHistoryRequest?.AccountType}
        onChange={(e: any) => {
          setCreditHistoryRequest({ ...creditHistoryRequest, AccountType: e.target.value })
        }}>
        <MenuItem value="-1">הכל</MenuItem>
        <MenuItem value="0">רגיל</MenuItem>
        <MenuItem value="1">שליחה ישירה</MenuItem>
      </Select>
    </Grid>
    <Grid item xs={2}>
      <Checkbox value={creditHistoryRequest?.IsPulseemCreditOnly}
        onChange={(e: any) => {
          console.log(e);
          setCreditHistoryRequest({ ...creditHistoryRequest, IsPulseemCreditOnly: e })
        }} />
    </Grid>
    <Grid item xs={12}>
      {t('reports.TotalRecords')}
    </Grid>
    <Grid item xs={12}>
      {renderTable()}
    </Grid>
    <>{renderTablePagination()}</>
  </Grid>
}

export default CreditHistoryDetails;