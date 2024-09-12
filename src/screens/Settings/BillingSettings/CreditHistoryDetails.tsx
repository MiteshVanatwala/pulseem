import { Button, Checkbox, Grid, MenuItem, Select, TableCell, TableHead, TableRow, TextField } from "@material-ui/core";
import { Loader } from "../../../components/Loader/Loader";
import { useDispatch, useSelector } from "react-redux";
import { StateType } from "../../../Models/StateTypes";
import clsx from 'clsx'
import { useState } from "react";
import { useTranslation } from "react-i18next";

const CreditHistoryDetails = ({ classes, data, onUpdate, onSubmit, showLoader }: any) => {

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

  const renderTableHead = () => {
    return (
      <TableHead>
        <TableRow classes={rowStyle}>
          <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t('billing.operationId')}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex2} align='center'>{t("billing.billingPeriod")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center'>{t("billing.productType")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex3} align='center'>{t("billing.productDescription")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center'>{t("billing.amount")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex2} align='center'>{t("billing.purchaseDate")}</TableCell>
        </TableRow>
      </TableHead>
    )
  }

  return <Grid container>
    <Loader isOpen={showLoader} showBackdrop={false} />
    <Grid item xs={4}>
      <Select
        value={data?.Type}
        onChange={(e: any) => {
          onUpdate('Type', e.target.value);
        }}>
        <MenuItem value="-1">הכל</MenuItem>
        <MenuItem value="0">אימייל</MenuItem>
        <MenuItem value="1">SMS</MenuItem>
        <MenuItem value="2">MMS</MenuItem>
      </Select>
    </Grid>
    <Grid item xs={4}>
      <Select
        value={data?.AccountType}
        onChange={(e: any) => {
          onUpdate('Type', e.target.value);
        }}>
        <MenuItem value="-1">הכל</MenuItem>
        <MenuItem value="0">רגיל</MenuItem>
        <MenuItem value="1">שליחה ישירה</MenuItem>
      </Select>
    </Grid>
    <Grid item xs={2}>
      <Checkbox value={data?.IsPulseemCreditOnly}
        onChange={(e: any) => {
          onUpdate('IsPulseemCreditOnly', e);

        }} />
    </Grid>
    <Grid item xs={12}>
      <Button onClick={onSubmit}>חפש</Button>
    </Grid>
  </Grid>
}

export default CreditHistoryDetails;