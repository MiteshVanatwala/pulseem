import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import {
  Box, Button, Grid, Table, TableContainer,
  TableCell, Link,
  TableHead, TableRow, TextField, Typography, TableBody
} from '@material-ui/core';
import {
  TablePagination, DateField
} from '../../../components/managment/index';
import { SearchIcon } from '../../../assets/images/managment';
import ClearIcon from '@material-ui/icons/Clear';
import Switch from "react-switch";
import moment from 'moment';
import { getSMSDirectReport } from '../../../redux/reducers/smsSlice';
import { Loader } from '../../../components/Loader/Loader';
//import { SmsStatus, ReponseType } from '../../../helpers/PulseemArrays';
import { smsStatusToString, smsStatusColor } from '../../../helpers/functions';

const DirectSMSReportTab = ({
  classes,
  dispatch,
  windowSize,
  isRTL,
  handleSearchInput = () => null,
  handleSearching = () => null,
  handlePageChange = () => null,
  handleRowsPerPage = () => null,
  handleShowContent = () => null,
  handleAdvanceSearch = () => null,
  clearSearch,
  page,
  rowsPerPage,
  searchData,
  isSearching,
  directSmsReport,
  showContent,
  advanceSearch,
  rowsOptions
}) => {
  const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot };
  const cellStyle = { head: classes.tableCellHead, body: classes.tableCellBody, root: classes.tableCellRoot };
  const noborderCell = { body: clsx(classes.tableCellBody, classes.noborder), root: classes.tableCellRoot };
  const { t } = useTranslation();
  const [showLoader, setLoader] = useState(false)

  const handleSearch = async () => {
    setLoader(true);
    const { sms = {} } = searchData || {};
    const { FromNumber = '', ToNumber = '', ExternalRef = '', Status = '', FromDate = null, ToDate = null, ResponseType = null, Text = null } = sms || {};
    const param = {
      FromDate,
      ToDate,
      Status,
      FromNumber,
      ToNumber,
      Reference: ExternalRef,
      ResponseType: ResponseType,
      PageIndex: 1,
      PageSize: rowsPerPage,
      Text
    }
    let searchObjects = {};
    Object.keys(param).map(item => {
      if (param[item]) {
        searchObjects[item] = param[item];
      }
    })

    await dispatch(getSMSDirectReport(searchObjects))
    handleSearching('sms', true);
    handlePageChange(1);
    setLoader(false);
  }

  const handlePageSearching = async (val) => {
    setLoader(true);
    let { sms = {} } = searchData || {};
    let params = {
      PageSize: rowsPerPage,
      PageIndex: (val - 1),
      ...sms
    };
    handlePageChange(val);
    await dispatch(getSMSDirectReport(params));
    setLoader(false);
  }

  const handleRowsPerPageSearching = async (val) => {
    setLoader(true);
    let { sms = {} } = searchData || {};
    let params = {
      PageSize: val,
      PageIndex: page,
      ...sms
    }
    await dispatch(getSMSDirectReport(params));
    handleRowsPerPage(val)
    setLoader(false);
  }

  const renderCell = (data, dataType) => {
    let text = data;
    if (dataType === 'date') {
      text = moment(text);
      text = `${text.format('DD/MM/YYYY hh:mm')}`
    }
    if (dataType === 'status') {
      text = t(smsStatusToString(text));
    }

    return (
      <Typography>{text}</Typography>
    );
  }

  const renderDateFields = () => {
    const { sms = {} } = searchData || {};
    const { FromDate = null, ToDate = null, ToNumber = '' } = sms || {};

    const handleFromDate = (val) => {
      let dateVal = moment(val).startOf('day').format('YYYY-MM-DD HH:mm') || null;
      handleSearchInput(dateVal, 'FromDate', 'sms')
    }

    const handleToDate = (val) => {
      let dateVal = moment(val).endOf('day').format('YYYY-MM-DD HH:mm') || null;
      handleSearchInput(dateVal, 'ToDate', 'sms')
    }

    return (
      <>
      <Grid item>
          <DateField
            classes={classes}
            value={FromDate}
            onChange={handleFromDate}
            placeholder={t('mms.locFromDateResource1.Text')}
            rootStyle={classes.maxWidth190}
            toolbarDisabled={false}
            minDate={'2000-01-01'}
          />
        </Grid>
        <Grid item>
          <DateField
            classes={classes}
            value={ToDate}
            onChange={handleToDate}
            placeholder={t('mms.locToDateResource1.Text')}
            minDate={FromDate ? FromDate : '2000-01-01'}
            toolbarDisabled={false}
            rootStyle={classes.maxWidth190}
          />
        </Grid>
        <Grid item>
          <TextField
            type='tel'
            variant='outlined'
            size='small'
            value={ToNumber}
            onChange={(e) => handleSearchInput(e.target.value, 'ToNumber', 'sms')}
            className={clsx(classes.textField, classes.minWidth252)}
            placeholder={t('common.ToNumber')}
          />
        </Grid>
        
      </>
    )
  }

  const renderAdvanceSearch = () => {
    const { sms = {} } = searchData || {};
    const { FromNumber = '', ExternalRef = '', Status = '', ResponseType = '', Text = '' } = sms || {};

    return (
      <>
        {renderDateFields()}
        <Grid item>
          <TextField
            type='tel'
            variant='outlined'
            size='small'
            value={FromNumber}
            onChange={(e) => handleSearchInput(e.target.value, 'FromNumber', 'sms')}
            className={clsx(classes.textField, classes.minWidth252)}
            placeholder={t('common.FrmNumber')}
          />
        </Grid>
        <Grid item>
          <TextField
            variant='outlined'
            size='small'
            value={ExternalRef}
            onChange={(e) => handleSearchInput(e.target.value, 'ExternalRef', 'sms')}
            className={clsx(classes.textField, classes.minWidth252)}
            placeholder={t('report.ExternalRef')}
          />
        </Grid>
        <Grid item>
          {/* <FormControl variant="outlined" className={classes.formControl} style={{ width: '100%', maxHeight: 40 }}>
            <Select
              autoWidth
              displayEmpty
              className={clsx(classes.textField, classes.minWidth192)}
              value={ResponseType}
              style={{ maxHeight: 40, overflow: 'hidden', paddingLeft: 0, paddingRight: 0 }}
              onChange={(e) => handleSearchInput(e.target.value, 'ResponseType', 'sms')}
              MenuProps={{
                anchorOrigin: {
                  vertical: "bottom",
                  horizontal: "left"
                },
                transformOrigin: {
                  vertical: "top",
                  horizontal: "left"
                },
                getContentAnchorEl: null
              }}
            >
              <MenuItem key={-1} value="" className={clsx(classes.dropDownItem)}>{t('report.responses')}</MenuItem>
              {ReponseType.map(so => {
                return <MenuItem key={so.id} value={so.id} className={classes.dropDownItem}>{t(so.value)}</MenuItem>
              })}
            </Select>
          </FormControl> */}
          <TextField
            variant='outlined'
            size='small'
            value={Text}
            onChange={(e) => handleSearchInput(e.target.value, 'Text', 'sms')}
            className={clsx(classes.textField, classes.minWidth252)}
            placeholder={t('report.ContentOfMessage')}
          />
        </Grid>
      </>
    )
  }

  const renderSearchLine = () => {
    const { sms = false } = isSearching || {};
    return (
      <Grid container spacing={2} className={classes.lineTopMarging}>
        {advanceSearch ? renderAdvanceSearch() : renderDateFields()}
        <Grid item>
          <Button
            size='large'
            variant='contained'
            onClick={handleSearch}
            className={classes.searchButton}
            endIcon={<SearchIcon />}>
            {t('campaigns.btnSearchResource1.Text')}
          </Button>
          {windowSize !== 'xs' && <Link
            color='initial'
            component='button'
            underline='none'
            onClick={() => handleAdvanceSearch(!advanceSearch)}
            className={clsx(classes.dBlock, classes.mt5, advanceSearch && windowSize === 'lg' ? classes.mb15 : null)}>
            {t(!advanceSearch ? 'report.AdvanceSearch' : 'report.closeAdvanceSearch')}
          </Link>
          }
        </Grid>

        {sms ? <Grid item>
          <Button
            size='large'
            variant='contained'
            onClick={() => clearSearch('sms')}
            className={classes.searchButton}
            endIcon={<ClearIcon />}>
            {t('common.clear')}
          </Button>
        </Grid> : null}
      </Grid>
    )
  }

  const renderToggleContent = () => {
    return (
      <Box className={clsx(classes.dFlex, classes.alignItemsCenter, classes.mb20)}>
        <Switch
          checked={showContent}
          onColor="#0371ad"
          handleDiameter={20}
          uncheckedIcon={false}
          checkedIcon={false}
          boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
          activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
          height={15}
          width={40}
          className={clsx({ [classes.rtlSwitch]: isRTL })}
          onChange={() => handleShowContent(!showContent)}
        />
        <Typography>{t('report.ShowContent')}</Typography>
      </Box>
    );
  }

  const renderTotalSection = () => {
    const { TotalCredits = 0, TotalSent = 0, SMSCredits = 0, BulkEmails = 0, MmsCredits = 0 } = directSmsReport || {};
    return (
      <>
        <Box className={clsx(classes.paddingSides25, classes.reportPaperBgGray, classes.alignCenter)} style={{marginBottom: 50}}>
          <Grid item container className={clsx(classes.justifyEvenly)} style={{ width: '100%' }}>
            <Grid item className={clsx(classes.txtCenter, classes.pt14)}>
              <Typography className={clsx(classes.bold, classes.colorBlue)}>
                {t('report.TotalSent')}
              </Typography>
              <Typography align='center' className={clsx(classes.colorBlue)}>
                {TotalSent.toLocaleString()}
              </Typography>
            </Grid>
            <Grid item className={clsx(classes.txtCenter, classes.pt14)}>
              <Typography className={clsx(classes.bold, classes.colorBlue)}>
                {t('report.TotalCredits')}
              </Typography>
              <Typography align='center' className={clsx(classes.colorBlue)}>
                {TotalSent.toLocaleString() || 0}
              </Typography>
            </Grid>
            <Grid item className={clsx(classes.txtCenter, classes.pt14)}>
              <Typography className={clsx(classes.bold, classes.colorBlue)}>
                {t('report.remainSms')}
              </Typography>
              <Typography align='center' className={clsx(classes.colorBlue)}>
                {SMSCredits.toLocaleString() || 0}
              </Typography>
            </Grid>
            <Grid item className={clsx(classes.txtCenter, classes.pt14)}>
              <Typography className={clsx(classes.bold, classes.colorBlue)}>
                {t('report.remainEmail')}
              </Typography>
              <Typography align='center' className={clsx(classes.colorBlue)}>
                {BulkEmails.toLocaleString() || 0}
              </Typography>
            </Grid>
            <Grid item className={clsx(classes.txtCenter, classes.pt14)}>
              <Typography className={clsx(classes.bold, classes.colorBlue)}>
                {t('report.remainMms')}
              </Typography>
              <Typography align='center' className={clsx(classes.colorBlue)}>
                {MmsCredits.toLocaleString() || 0}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </>
    );
  }

  const renderTableHead = () => {
    return (
      <TableHead>
        <TableRow
          classes={rowStyle}>
          {/* <TableCell
            classes={cellStyle}
            align='center'
            className={classes.flex1}>
            {t('common.campaignID')}
          </TableCell> */}
          <TableCell
            classes={cellStyle}
            align='center'
            className={classes.flex1}>
            {t('report.SendDate')}
          </TableCell>
          <TableCell
            classes={cellStyle}
            align='center'
            className={classes.flex1}>
            {t('common.FrmNumber')}
          </TableCell>
          <TableCell
            classes={cellStyle}
            align='center'
            className={classes.flex1}>
            {t('common.ToNumber')}
          </TableCell>
          <TableCell
            classes={cellStyle}
            align='center'
            className={classes.flex1}>
            {t('common.Status')}
          </TableCell>
          {showContent && <TableCell
            classes={cellStyle}
            align='center'
            className={classes.flex3}>
            {t('report.ContentOfMessage')}
          </TableCell>}
          <TableCell
            classes={cellStyle}
            align='center'
            className={classes.flexHalf}>
            {t('report.failure')}
          </TableCell>
          <TableCell
            classes={cellStyle}
            align='center'>
            {t('report.id')}
          </TableCell>
          <TableCell
            classes={cellStyle}
            align='center'>
            {t('report.Characters')}
          </TableCell>
          <TableCell
            classes={cellStyle}
            align='center'
            className={classes.flexHalf}>
            {t('report.Credits')}
          </TableCell>
        </TableRow>
      </TableHead>
    )
  }

  const renderRow = (row) => {
    return (
      <TableRow
        classes={rowStyle}>
        <TableCell scope="row"
          classes={cellStyle}
          align='center'
          className={classes.flex1}>
          {renderCell(row.DATE, 'date')}
        </TableCell>
        {windowSize !== 'xs' && (
          <>
            <TableCell
              classes={noborderCell}
              align='center'
              className={classes.flex1}>
              {renderCell(row.FROM)}
            </TableCell>
            <TableCell
              classes={noborderCell}
              align='center'
              className={classes.flex1}>
              {renderCell(row.TO)}
            </TableCell>
          </>
        )}
        <TableCell
          classes={cellStyle}
          align='center'
          className={classes.flex1}>
          {renderCell(row.STATUS, 'status')}
        </TableCell>
        {windowSize !== 'xs' && showContent && <TableCell
          classes={cellStyle}
          align='center'
          className={classes.flex3}>
          {renderCell(row.MESSAGE)}
        </TableCell>}
        <TableCell
          classes={noborderCell}
          align='center'
          className={classes.flexHalf}>
          {renderCell(row.ERRORCODE)}
        </TableCell>
        {windowSize !== 'xs' && (
          <>
            <TableCell
              classes={noborderCell}
              align='center'
              className={classes.flexHalf}>
              {renderCell(row.REFERENCE)}
            </TableCell>
            <TableCell
              classes={noborderCell}
              align='center'
              className={classes.flexHalf}>
              {renderCell(row.CHARSCOUNT)}
            </TableCell>
          </>
        )}
        <TableCell
          classes={noborderCell}
          align='center'
          className={classes.flexHalf}>
          {renderCell(row.Credits)}
        </TableCell>
      </TableRow>
    )
  }

  const renderNameCell = (row) => {
    const { DATE } = row

    const date = DATE ? moment(DATE) : ''
    const showDate = DATE ? date.format('L') : ''
    const showTime = DATE ? date.format('LT') : ''

    return (
      <>
        <Typography className={classes.nameEllipsis}>
          {t('report.SendDate')}
        </Typography>
        <Typography className={classes.grayTextCell}>
          {t("common.SentOn")} {`${isRTL ? showDate : moment(showDate).format("DD/MM/YYYY")} ${showTime}`}
        </Typography>
      </>
    )
  }

  const renderPhoneRow = (row) => {
    const {
      PID, DATE, FROM, TO, STATUS
    } = row

    return (
      <TableRow
        key={row.ID}
        component='div'
        classes={rowStyle}>
        <TableCell classes={{ root: clsx(classes.tableCellRoot, classes.flex1, classes.tabelCellPadding) }} style={{ paddingInline: 10 }}>
          <Box className={clsx(classes.dFlex)} style={{ width: '100%', justifyContent: 'space-between' }}>
            <Box className={classes.dFlex} style={{ flexDirection: 'column', justifySelf: 'flex-start' }}>
              {renderNameCell({ PID, DATE, FROM, TO, STATUS })}
            </Box>
            <Box style={{ justifySelf: 'flex-end', whiteSpace: 'nowrap' }}>
              <Typography style={{ color: smsStatusColor(STATUS) }}>
                {t(smsStatusToString(STATUS))}
              </Typography>
            </Box>
          </Box>
          <Grid container spacing={2}  >
            <Grid item>
              <Typography className={classes.mobileReportHead}>
                {t('common.FrmNumber')}
              </Typography>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {FROM}
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
                {t('common.ToNumber')}
              </Typography>
              <Grid container spacing={2}>
                <Grid item>
                  {TO}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </TableCell>
      </TableRow>
    )
  }

  const renderTableBody = () => {
    let sortData = directSmsReport && directSmsReport.DirectReport;
    if (!sortData) {
      return;
    }

    // let rpp = parseInt(rowsPerPage)
    // sortData = sortData.slice((page - 1) * rpp, (page - 1) * rpp + rpp)

    return (
      <TableBody>
        {sortData.map(windowSize === 'xs' ? renderPhoneRow : renderRow)}
      </TableBody>
    )
  }

  const renderTable = () => {
    return (
      <>
        <Typography className={clsx(classes.colorGray, classes.mb5)}>
          {t('common.Total')} {directSmsReport.TotalSent ?? 0} {t('report.Messages')}
        </Typography>
        <TableContainer className={classes.borderAround}>
          <Table className={clsx(classes.tableContainer, classes.noborder)}>
            {windowSize !== 'xs' && renderTableHead()}
            {renderTableBody()}
          </Table>
        </TableContainer>
      </>
    )
  }

  const renderTablePagination = () => {
    const smsData = directSmsReport && directSmsReport.TotalSent || 0;
    return (
      <TablePagination
        classes={classes}
        rows={smsData}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageSearching}
        rowsPerPageOptions={rowsOptions}
        page={page}
        onPageChange={handlePageSearching}
        returnPageOne={true}
      />
    )
  }

  return (
    <>
      {renderSearchLine()}
      {windowSize !== 'xs' && renderToggleContent()}
      {renderTable()}
      {renderTablePagination()}
      {renderTotalSection()}
      <Loader isOpen={showLoader} />
    </>
  );
}

export default DirectSMSReportTab