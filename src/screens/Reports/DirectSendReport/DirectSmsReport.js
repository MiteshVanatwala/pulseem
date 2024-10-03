import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import {
  Box, Button, Grid, Table, TableContainer,
  TableCell, Link, FormControl, MenuItem,
  TableHead, TableRow, TextField, Typography, TableBody, FormControlLabel
} from '@material-ui/core';
import Select from '@mui/material/Select';
import {
  TablePagination, DateField
} from '../../../components/managment/index';
import moment from 'moment';
import { getSMSDirectReport, getArchiveSMSDirectReport } from '../../../redux/reducers/smsSlice';
import { reactivateSms } from '../../../redux/reducers/clientSlice';
import { setShowContent } from '../../../redux/reducers/reportSlice';
import { Loader } from '../../../components/Loader/Loader';
import { DateFormats, SmsStatus } from '../../../helpers/Constants';
import { ConvertSmsStatusText, ConvertColorStatus, SourceType } from '../../../helpers/UI/TableText';
import TotalSection from '../../../components/managment/TotalSection';
import { setRowsPerPage } from '../../../redux/reducers/coreSlice';
import { useSelector } from 'react-redux';
import { Title } from '../../../components/managment/Title';
import PulseemSwitch from '../../../components/Controlls/PulseemSwitch';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { IoIosArrowDown } from 'react-icons/io';
import { GetGlobalAccountPackagesDetails } from '../../../redux/reducers/commonSlice';

const DirectSMSReportTab = ({
  classes,
  title,
  dispatch,
  windowSize,
  isRTL,
  handleSearchInput = () => null,
  handleSearching = () => null,
  handlePageChange = () => null,
  handleAdvanceSearch = () => null,
  clearSearch,
  page,
  rowsPerPage,
  searchData,
  isSearching,
  directSmsReport,
  advanceSearch,
  rowsOptions,
  isArchive = false
}) => {
  const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot };
  const cellStyle = { head: classes.tableCellHead, body: classes.tableCellBody, root: classes.tableCellRoot };
  const noborderCell = { body: clsx(classes.tableCellBody, classes.noborder), root: classes.tableCellRoot };
  const { t } = useTranslation();
  const [showLoader, setLoader] = useState(false)
  const { showContent } = useSelector(state => state.report);
  const { isGlobal } = useSelector((state) => state.common)

  const handleSearch = async () => {
    setLoader(true);
    const { sms = {} } = searchData || {};
    const { FromNumber = '', ToNumber = '', Reference = '', Status = '', FromDate = null, ToDate = null, ResponseType = null, Text = null } = sms || {};
    const param = {
      FromDate,
      ToDate,
      Status,
      FromNumber,
      ToNumber,
      Reference: Reference,
      ResponseType: ResponseType,
      PageIndex: page,
      PageSize: rowsPerPage,
      Text,
      ShowContent: sms.ShowContent ?? showContent
    }
    let searchObjects = {};
    Object.keys(param).forEach(item => {
      if (param[item]) {
        searchObjects[item] = param[item];
      }
    })

    await dispatch(isArchive ? getArchiveSMSDirectReport(searchObjects) : getSMSDirectReport(searchObjects))
    if (isGlobal) dispatch(GetGlobalAccountPackagesDetails());
    handleSearching('sms', true);
    setLoader(false);
  }

  const searchRequest = async (pageSize, pageIndex) => {
    setLoader(true);
    let { sms = {} } = searchData || {};
    let params = {
      PageSize: pageSize,
      PageIndex: pageIndex,
      ...sms
    };
    params["ShowContent"] = sms.ShowContent ?? showContent;
    await dispatch(isArchive ? getArchiveSMSDirectReport(params) : getSMSDirectReport(params))
    setLoader(false);
  }

  const handlePageSearching = (val) => {
    searchRequest(rowsPerPage, val);
    handlePageChange(val);
  }

  const handleRowsPerPageSearching = (val) => {
    dispatch(setRowsPerPage(val))
    searchRequest(val, page);
  }

  const renderCell = (data, dataType) => {
    let text = data;
    if (dataType === 'date') {
      text = moment(text);
      text = `${text.format(DateFormats.DATE_TIME_24)}`
    }
    if (dataType === 'status') {
      text = t(ConvertSmsStatusText(`${text}`));
      return (
        <Typography style={{ color: ConvertColorStatus(data, SourceType.SMS), fontWeight: 600 }}>{text}</Typography>
      )
    }

    return (
      <Typography style={{ wordBreak: dataType === 'content' ? 'break-word' : null }}>{text}</Typography>
    );
  }

  const handleFromDate = (val) => {
    if (val) {
      let dateVal = moment(val).startOf('day').format('YYYY-MM-DD HH:mm') || null;
      handleSearchInput(dateVal, 'FromDate', 'sms')
    }
  }

  const handleToDate = (val) => {
    if (val) {
      let dateVal = moment(val).endOf('day').format('YYYY-MM-DD HH:mm') || null;
      handleSearchInput(dateVal, 'ToDate', 'sms')
    }
  }

  const renderDateFields = () => {
    const { sms = {} } = searchData || {};
    const { FromDate = null, ToDate = null, ToNumber = '' } = sms || {};

    return (
      <>
        <Grid item>
          <DateField
            classes={classes}
            value={FromDate}
            onChange={(v) => handleFromDate(v)}
            placeholder={t('mms.locFromDateResource1.Text')}
            rootStyle={classes.maxWidth190}
            toolbarDisabled={false}
            minDate={'2000-01-01'}
            isRoundedOnMobile={windowSize === 'xs'}
          />
        </Grid>
        <Grid item>
          <DateField
            classes={classes}
            value={ToDate}
            onChange={(v) => handleToDate(v)}
            placeholder={t('mms.locToDateResource1.Text')}
            minDate={FromDate ? FromDate : '2000-01-01'}
            toolbarDisabled={false}
            rootStyle={classes.maxWidth190}
            isRoundedOnMobile={windowSize === 'xs'}
          />
        </Grid>
        {windowSize !== 'xs' && <Grid item>
          <TextField
            type='tel'
            inputProps={{
              style: {
                textAlign: isRTL ? 'right' : 'left'
              }
            }}
            variant='outlined'
            size='small'
            value={ToNumber}
            onChange={(e) => handleSearchInput(e.target.value, 'ToNumber', 'sms')}
            className={clsx(classes.textField, classes.minWidth252)}
            placeholder={t('common.ToNumber')}
          />
        </Grid>
        }
      </>
    )
  }

  const renderAdvanceSearch = () => {
    const { sms = {} } = searchData || {};
    const { FromNumber = '', Reference = '', Status = '', Text = '', FromDate = null, ToDate = null, ToNumber = '' } = sms || {};

    return (
      <>
        <Grid item>
          <TextField
            type='tel'
            variant='outlined'
            size='small'
            value={FromNumber}
            inputProps={{
              style: {
                textAlign: isRTL ? 'right' : 'left'
              }
            }}
            onChange={(e) => handleSearchInput(e.target.value, 'FromNumber', 'sms')}
            className={clsx(classes.textField, classes.minWidth252)}
            placeholder={t('common.FrmNumber')}
          />
        </Grid>
        <Grid item>
          <TextField
            type='tel'
            variant='outlined'
            size='small'
            inputProps={{
              style: {
                textAlign: isRTL ? 'right' : 'left'
              }
            }}
            value={ToNumber}
            onChange={(e) => handleSearchInput(e.target.value, 'ToNumber', 'sms')}
            className={clsx(classes.textField, classes.minWidth252)}
            placeholder={t('common.ToNumber')}
          />
        </Grid>
        <Grid item>
          <TextField
            variant='outlined'
            size='small'
            inputProps={{
              style: {
                textAlign: isRTL ? 'right' : 'left'
              }
            }}
            value={Text}
            onChange={(e) => handleSearchInput(e.target.value, 'Text', 'sms')}
            className={clsx(classes.textField, classes.minWidth252)}
            placeholder={t('report.ContentOfMessage')}
          />
        </Grid>
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
            variant='outlined'
            size='small'
            value={Reference}
            onChange={(e) => handleSearchInput(e.target.value, 'Reference', 'sms')}
            className={clsx(classes.textField, classes.minWidth252)}
            placeholder={t('report.ExternalRef')}
          />
        </Grid>
        <Grid item>
          <FormControl variant='standard' className={clsx(classes.selectInputFormControl, classes.w100)}>
            <Select
              variant="standard"
              autoWidth
              displayEmpty
              value={Status}
              onChange={(e) => handleSearchInput(e.target.value, 'Status', 'sms')}
              IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 200,
                    direction: isRTL ? 'rtl' : 'ltr'
                  },
                },
              }}
            >
              <MenuItem value="">{t("common.Status")}</MenuItem>
              {SmsStatus.map(so => <MenuItem key={so.id} value={so.id}>{t(so.value)}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
      </>
    )
  }

  const renderSearchLine = () => {
    const { sms = false } = isSearching || {};
    return (
      <Grid container spacing={2} className={clsx(windowSize === 'xs' || windowSize === 'sm' ? classes.mt15 : classes.lineTopMarging, 'searchLine')}>
        {advanceSearch ? renderAdvanceSearch() : renderDateFields()}
        <Grid item>
          <Button
            onClick={handleSearch}
            className={clsx(classes.btn, classes.btnRounded)}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}>
            {t('campaigns.btnSearchResource1.Text')}
          </Button>
          {windowSize !== 'xs' && <Link
            color='initial'
            component='button'
            underline='none'
            onClick={() => handleAdvanceSearch(!advanceSearch)}
            className={clsx(classes.dBlock, classes.mt1, advanceSearch && windowSize === 'lg' ? classes.mb15 : null)}>
            {t(!advanceSearch ? 'report.AdvanceSearch' : 'report.closeAdvanceSearch')}
          </Link>
          }
        </Grid>

        {sms ? <Grid item>
          <Button
            onClick={() => {
              clearSearch('sms');
            }}
            className={clsx(classes.btn, classes.btnRounded)}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}>
            {t('common.clear')}
          </Button>
        </Grid> : null}
      </Grid>
    )
  }

  const handleShowContent = async (toggleValue) => {
    await dispatch(setShowContent(toggleValue));
    handleSearchInput(toggleValue, 'ShowContent', 'sms');
    handleSearch();
  }

  const renderToggleContent = () => {
    return (
      <Box className={clsx(classes.dFlex, classes.alignItemsCenter, classes.mb20, classes.mt20)}>
        <FormControlLabel
          control={
            <PulseemSwitch
              switchType='ios'
              classes={classes}
              checked={showContent}
              onColor="#0371ad"
              handleDiameter={20}
              boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
              activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
              height={15}
              width={40}
              className={clsx({ [classes.rtlSwitch]: isRTL })}
              onChange={(e) => handleShowContent(!showContent)}
            />
          }
          label={t('report.ShowContent')}
        />
      </Box>
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
            className={classes.flex2}>
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
            className={classes.flex1}>
            {t('report.failure')}
          </TableCell>
          <TableCell
            classes={cellStyle}
            className={classes.flex1}
            style={{ inlineSize: 90 }}
            align='center'>
            {t('report.id')}
          </TableCell>
          <TableCell
            classes={cellStyle}
            className={classes.flex1}
            align='center'>
            {t('report.Characters')}
          </TableCell>
          <TableCell
            classes={cellStyle}
            align='center'
            className={classes.flex1}>
            {t('report.Credits')}
          </TableCell>
        </TableRow>
      </TableHead>
    )
  }

  const renderReactivate = (row) => {
    const reactivate = async () => {
      const request = {
        To: row.TO
      };
      await dispatch(reactivateSms(request));
      handleSearch();
    }
    return (<Link
      color="primary"
      onClick={() => { reactivate() }}
      target='_blank'
      className={clsx(classes.f16, classes.redLink)}>
      {t('report.Reactivate')}
    </Link>)
  }

  const renderRow = (row) => {
    return (
      <TableRow
        classes={rowStyle}>
        <TableCell scope="row"
          classes={cellStyle}
          align='center'
          className={classes.flex2}>
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
              {(row.ClientStatus === 1) && renderReactivate(row)}
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
          {renderCell(row.MESSAGE, 'content')}
        </TableCell>}
        <TableCell
          classes={noborderCell}
          align='center'
          className={classes.flex1}>
          {renderCell(row.ERRORCODE)}
        </TableCell>
        {windowSize !== 'xs' && (
          <>
            <TableCell
              classes={noborderCell}
              align='center'
              className={classes.flex1}>
              {renderCell(row.REFERENCE)}
            </TableCell>
            <TableCell
              classes={noborderCell}
              align='center'
              className={classes.flex1}>
              {renderCell(row.CHARSCOUNT)}
            </TableCell>
          </>
        )}
        <TableCell
          classes={noborderCell}
          align='center'
          className={classes.flex1}>
          {renderCell(row.Credits)}
        </TableCell>
      </TableRow>
    )
  }

  const renderNameCell = (row) => {
    const { DATE } = row
    let d = moment(DATE);
    d = `${d.format(DateFormats.DATE_TIME_24)}`

    return (
      <>
        <Typography className={classes.nameEllipsis}>
          {t('report.SendDate')}
        </Typography>
        <Typography className={classes.grayTextCell}>
          {t("common.SentOn")} {d}
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
              <Typography style={{ color: ConvertColorStatus(STATUS, SourceType.SMS) }}>
                {t(ConvertSmsStatusText(`${STATUS}`))}
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
    let sortData = directSmsReport && directSmsReport.DirectReport ? directSmsReport.DirectReport : null;

    return (
      <Box className='tableBodyContainer'>
        <TableBody>
          {!sortData || sortData.length === 0 ? <Box className={clsx(classes.flex, classes.justifyCenterOfCenter)} style={{ height: 50 }}>
            <Typography>{t("common.NoDataTryFilter")}</Typography>
          </Box> :
            sortData.map(windowSize === 'xs' ? renderPhoneRow : renderRow)
          }
        </TableBody>
      </Box>
    )
  }

  const renderTable = () => {
    return (
      <>
        <Grid container style={{ justifyContent: windowSize === 'xs' ? 'flex-start' : 'flex-end' }}>
          <Grid item className={windowSize === 'xs' ? classes.mt15 : null} style={{ textAlign: isRTL ? 'right' : 'left' }}>
            <Typography className={clsx(classes.groupsLable, classes.mb5)}>
              {t('common.Total')} {directSmsReport?.TotalSent?.toLocaleString() ?? 0} {t('report.Messages')}
            </Typography>
            <Typography className={clsx(classes.groupsLable, classes.mb5)}>
              {t('common.Total')} {directSmsReport?.TotalCredits?.toLocaleString() ?? 0} {t('report.Credits')}
            </Typography>
          </Grid>
        </Grid>
        <TableContainer className={clsx(classes.tableStyle, classes.mt10)}>
          <Table className={clsx(classes.tableContainer)}>
            {windowSize !== 'xs' && renderTableHead()}
            {renderTableBody()}
          </Table>
        </TableContainer>
      </>
    )
  }

  const renderTablePagination = () => {
    const smsData = (directSmsReport && directSmsReport.TotalSent) || 0;
    return (
      <TablePagination
        classes={classes}
        rows={smsData}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageSearching}
        rowsPerPageOptions={rowsOptions}
        page={page}
        onPageChange={handlePageSearching}
        returnPageOne={false}
      />
    )
  }

  return (
    <>
      <Box className={clsx('topSection', classes.mt10)}>
        <Title Text={title} classes={classes} />
        {renderSearchLine()}
      </Box>
      {windowSize !== 'xs' && renderToggleContent()}
      {renderTable()}
      {renderTablePagination()}
      {directSmsReport && <TotalSection classes={classes} TotalObject={directSmsReport} callerType="sms" />}
      <Loader isOpen={showLoader} />
    </>
  );
}

export default DirectSMSReportTab