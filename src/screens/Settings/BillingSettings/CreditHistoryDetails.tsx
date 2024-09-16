import { Box, Button, Checkbox, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@material-ui/core";
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
import { IoIosArrowDown } from "react-icons/io";

const CreditHistoryDetails = ({ classes }: any) => {

  const { windowSize, rowsPerPage, isRTL } = useSelector((state: StateType) => state.core)

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
  const [totalRecords, setTotalRecords] = useState<any>(0);
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
    setCreditHistories([]);
    setShowLoader(true);
    const c = await dispatch(getBulkHistory({ ...creditHistoryRequest, PageSize: rowsPerPage })) as any;
    if (c && c?.payload?.StatusCode === 201) {
      const data = c?.payload?.Data;
      const dataWithId = data?.map((d: CreditHistory, idx: number) => { return { ...d, Id: idx } })
      setCreditHistories(dataWithId);
      setTotalRecords(c?.payload?.Message);
    }
    setShowLoader(false);
  }

  useEffect(() => {
    requestCreditHistory();
  }, [creditHistoryRequest])


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

  const renderTable = () => {
    return <TableContainer className={classes.tableStyle}>
      <Table className={classes.tableContainer} style={{ minHeight: 260 }}>
        {SizeOptionsOfHandHeldDevices.indexOf(windowSize) === -1 && renderTableHead()}
        {renderTableBody()}
      </Table>
    </TableContainer>
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
        case 0: {
          return "email"
        }
        case 1: {
          return "SMS"
        }
        case 2: {
          return "MMS"
        }
        default: {
          return "SMS"
        }
      }
    }
    const {
      Id,
      Date,
      Amount,
      AccountType,
      Type,
      TransferedFromSubAccountName,
      TransferredToName
    } = row
    return (
      <TableRow
        key={Id}
        className={Id.toString()}
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

  return <Grid container style={{ position: 'relative', width: '100%' }} spacing={2}>
    <Loader isOpen={showLoader} showBackdrop={false} />
    <Grid item xs={2}>
      <FormControl variant='standard' className={clsx(classes.selectInputFormControl, classes.w100)}>
        <Select
          variant="standard"
          placeholder={t('billing.type')}
          labelId="type"
          id="type"
          value={creditHistoryRequest?.Type}
          IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
          inputProps={{
            placeholder: t('billing.type'),
            class: creditHistoryRequest?.Type === null ? classes.selectPlaceholderInput : classes.dNone
          }}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 300,
                direction: isRTL ? 'rtl' : 'ltr'
              },
            },
          }}
          onChange={(e: any) => {
            setPage(1);
            setCreditHistoryRequest({ ...creditHistoryRequest, Type: e.target.value, PageIndex: 1 })
          }}>
          <MenuItem value="null">{t('common.all')}</MenuItem>
          <MenuItem value="0">אימייל</MenuItem>
          <MenuItem value="1">SMS</MenuItem>
          <MenuItem value="2">MMS</MenuItem>
        </Select>
      </FormControl>

    </Grid>
    <Grid item xs={2}>
      <FormControl variant='standard' className={clsx(classes.selectInputFormControl, classes.w100)}>
        <Select
          variant="standard"
          placeholder={t('billing.accountType')}
          labelId="accountType"
          id="accountType"
          value={creditHistoryRequest?.AccountType}
          IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
          inputProps={{
            placeholder: t('billing.accountType'),
            class: creditHistoryRequest?.AccountType === null ? classes.selectPlaceholderInput : classes.dNone
          }}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 300,
                direction: isRTL ? 'rtl' : 'ltr'
              },
            },
          }}
          onChange={(e: any) => {
            setPage(1);
            setCreditHistoryRequest({ ...creditHistoryRequest, AccountType: e.target.value, PageIndex: 1 })
          }}>
          <MenuItem value="null">{t('billing.accountType')}</MenuItem>
          <MenuItem value="null">{t('common.all')}</MenuItem>
          <MenuItem value="false">רגיל</MenuItem>
          <MenuItem value="true">שליחה ישירה</MenuItem>
        </Select>
      </FormControl>
    </Grid>
    <Grid item xs={2}>
      <FormControl variant='standard' className={clsx(classes.selectInputFormControl, classes.w100)} style={{ border: 'none' }}>
        <FormControlLabel
          control={<Checkbox value={creditHistoryRequest?.IsPulseemCreditOnly}
            checked={creditHistoryRequest?.IsPulseemCreditOnly}
            onChange={(e: any) => {
              setPage(1);
              setCreditHistoryRequest({ ...creditHistoryRequest, IsPulseemCreditOnly: e?.target?.checked || false, PageIndex: 1 })
            }} />}
          label={t('billing.showLoadingCreditsFromPulseemOnly')} />
      </FormControl>
    </Grid>
    <Grid item xs={12} className={clsx(classes.mt10, classes.mb5)}>
      <Box className={clsx(classes.fullFlexColumn)} style={{ alignItems: 'end' }}>
        {t('report.TotalRecords')} {totalRecords.toLocaleString()}
      </Box>
    </Grid>
    <Grid item xs={12}>
      {renderTable()}
    </Grid>
    <>{renderTablePagination()}</>
  </Grid >
}

export default CreditHistoryDetails;