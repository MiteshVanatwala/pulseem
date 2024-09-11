import { Box, Grid, Link, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@material-ui/core";
import { Loader } from "../../../components/Loader/Loader";
import { useState } from "react";
import { rowsOptions, SizeOptionsOfHandHeldDevices } from "../../../helpers/Constants";
import { useDispatch, useSelector } from "react-redux";
import { StateType } from "../../../Models/StateTypes";
import clsx from 'clsx';
import moment from "moment";
import { PurchaseHistoryModel } from "../../../Models/Account/AccountBilling";
import { useTranslation } from "react-i18next";
import { TablePagination } from '../../../components/managment/index'
import { setRowsPerPage } from "../../../redux/reducers/coreSlice";

const PurchaseTableTemplate = ({ classes, data, showLoader, isPaid }: any) => {
  const { language, windowSize, isRTL, rowsPerPage } = useSelector((state: StateType) => state.core)

  const rowStyle = { head: classes.tableRowReportHead, root: clsx(classes.tableRowRoot) }
  const cellStyle = { head: classes.tableCellHead, root: clsx(classes.tableCellRoot, classes.paddingHead) }
  const cell50wStyle = { head: clsx(classes.tableCellHead), root: clsx(classes.tableCellRoot, classes.paddingHead, classes.minWidth50) }
  const cellBodyStyle = { body: clsx(classes.tableCellBody), root: clsx(classes.tableCellRoot) }
  const noBorderCellStyle = { body: classes.tableCellBodyNoBorder, root: clsx(classes.tableCellRoot, classes.minWidth50) }
  const borderCellStyle = { body: clsx(classes.tableCellBody), root: clsx(classes.tableCellRoot, classes.minWidth50) }

  const [page, setPage] = useState<number>(1);
  const { t } = useTranslation();
  const dispatch = useDispatch();


  const renderTableHead = () => {
    return (
      <TableHead>
        <TableRow classes={rowStyle}>
          <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t('billing.operationId')}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex2} align='center'>{t("billing.purchaseDate")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex2} align='center'>{t("billing.billingPeriod")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center'>{t("billing.productType")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex3} align='center'>{t("billing.productDescription")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center'>{t("billing.amount")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center'>{t("billing.forPayment")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center'>{t("billing.includingVat")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center' >{t("billing.invoice")}</TableCell>
          {isPaid && <TableCell classes={cell50wStyle} className={classes.flex1} align='center' >{t("billing.credit")}</TableCell>}
          {isPaid && <TableCell classes={cell50wStyle} className={classes.flex1} align='center' >{t("billing.receipt")}</TableCell>}
        </TableRow>
      </TableHead>
    )
  }
  const renderTableBody = () => {
    let rowData = data;
    if (rowData?.length > 0) {
      rowData = rowData.slice((page - 1) * rowsPerPage, (page - 1) * rowsPerPage + rowsPerPage)
      return (
        <Box className='tableBodyContainer'>
          <TableBody>
            {rowData
              .map(SizeOptionsOfHandHeldDevices.indexOf(windowSize) > -1 ? renderPhoneRow : renderRow)}
          </TableBody>
        </Box>
      )
    }
    return <Box className={clsx(classes.flex, classes.justifyCenterOfCenter)} style={{ height: 50 }}>
      <Typography>{t("common.NoDataTryFilter")}</Typography>
    </Box>
  }

  const renderRow = (row: PurchaseHistoryModel) => {
    const {
      InvoiceID,
      CreditInvoiceID,
      OperationID,
      BillingPeriod,
      AccountPurchaseID,
      BillingType,
      ProdctDesciption,
      NumberOfProducts,
      OpenDate,
      OperationDate,
      AmountToPay,
      AmountWithVat,
      InvoiceRecieptName,
      InvoiceURL,
      RecieptURL,
      ReceiptID
    } = row
    return (
      <TableRow
        key={OperationID}
        classes={rowStyle}>
        <TableCell
          classes={cellBodyStyle}
          align='center'
          className={clsx(classes.flex1)}>
          {OperationID}
        </TableCell>
        <TableCell
          classes={borderCellStyle}
          align='center'
          className={classes.flex2}>
          {moment(OperationDate).format('DD/MM/yyyy')}
        </TableCell>
        <TableCell
          classes={cellBodyStyle}
          align='center'
          className={classes.flex2}>
          {BillingPeriod}
        </TableCell>
        <TableCell
          classes={borderCellStyle}
          align='center'
          className={classes.flex1}>
          {BillingType}
        </TableCell>
        <TableCell
          classes={borderCellStyle}
          align='center'
          className={classes.flex3}>
          {ProdctDesciption}
        </TableCell>
        <TableCell
          classes={borderCellStyle}
          align='center'
          className={classes.flex1}>
          {NumberOfProducts}
        </TableCell>
        <TableCell
          classes={borderCellStyle}
          align='center'
          className={classes.flex1}>
          {AmountToPay?.toFixed(2).toLocaleString()}
        </TableCell>
        <TableCell
          classes={borderCellStyle}
          align='center'
          className={classes.flex1}>
          <Grid container direction={'row'} className={classes.justifyEvenly} style={{ flexWrap: 'initial' }}>
            {AmountWithVat?.toFixed(2)?.toLocaleString()}
          </Grid>
        </TableCell>
        <TableCell
          classes={cellBodyStyle}
          align='center'
          className={classes.flex1}>
          <Link href={InvoiceURL} target='_blank' style={{ textDecoration: 'underline' }}>
            {InvoiceID}
          </Link>
        </TableCell>
        {isPaid && <TableCell
          classes={cellBodyStyle}
          align='center'
          className={clsx(classes.flex1)}>
          {CreditInvoiceID}
        </TableCell>}
        {isPaid && <TableCell
          classes={noBorderCellStyle}
          align='center'
          className={clsx(classes.flex1)}>
          <Link href={RecieptURL} target='_blank' style={{ textDecoration: 'underline' }}>
            {ReceiptID}
          </Link>
        </TableCell>}
      </TableRow>
    )
  }

  const renderPhoneRow = (row: PurchaseHistoryModel) => {
    const {
      InvoiceID,
      CreditInvoiceID,
      OperationID,
      BillingPeriod,
      AccountPurchaseID,
      BillingType,
      ProdctDesciption,
      NumberOfProducts,
      OpenDate,
      OperationDate,
      AmountToPay,
      AmountWithVat,
      InvoiceRecieptName
    } = row
    return (
      <TableRow
        key={OperationID}
        component='div'
        classes={rowStyle}>
        <TableCell classes={{ root: clsx(classes.tableCellRoot, classes.flex1, classes.tabelCellPadding) }}>
          <Box className={classes.inlineGrid} style={{ paddingInlineStart: 10 }}>
            {OperationID}
          </Box>
          <Grid container spacing={2} style={{ paddingInlineStart: 10 }} >
            <Grid item>
              <Typography className={classes.mobileReportHead}>
                {BillingType}
              </Typography>
            </Grid>
          </Grid>
          <Grid container spacing={2} style={{ paddingInlineStart: 10 }} >
            {BillingPeriod}
          </Grid>
          <Grid container spacing={2} style={{ paddingInlineStart: 10 }}>
            {ProdctDesciption}
          </Grid>
          <Grid item xs={3}>
            <Grid container spacing={2}>
              <Grid item>
                {NumberOfProducts}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={3}>
            {moment(OperationDate).format('0:dd/MM/yyyy')}
          </Grid>
          <Grid item xs={3}>
            {AmountToPay}
          </Grid>
          <Grid item xs={3}>
            {AmountWithVat}
          </Grid>
          <Grid item xs={3}>
            {InvoiceID}
          </Grid>
          <Grid item xs={3}>
            {CreditInvoiceID}
          </Grid>
        </TableCell>
      </TableRow >
    )
  }

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

  const handleRowsPerPageChange = (val: any) => {
    dispatch(setRowsPerPage(val))
  }
  const renderTablePagination = () => {
    return (<TablePagination
      classes={classes}
      rows={data?.length}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={handleRowsPerPageChange}
      rowsPerPageOptions={rowsOptions}
      page={page}
      onPageChange={setPage}
    />
    )
  }


  return <Box style={{ position: 'relative', width: '100%' }}>
    <Loader isOpen={showLoader} showBackdrop={false} />
    {data?.length > 0 ? renderTable() :
      (
        <Box className={clsx(classes.p10, classes.mt15, classes.mb15, classes.colorBlue)}>
          <Grid container spacing={2} className={clsx(classes.flexJustifyCenter, classes.alignCenter, classes.textCenter, classes.pr25, classes.pe25)} style={{ minHeight: 70 }}>
            {t('common.NoDataTryFilter')}
          </Grid>
        </Box>
      )
    }
    <>{renderTablePagination()}</>

  </Box>
}

export default PurchaseTableTemplate;