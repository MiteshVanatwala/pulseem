import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import {
  Box, Button, Grid, Table, TableContainer,
  TableCell, Link,
  TableHead, TableRow, TextField, Typography, TableBody, FormControl, Select, MenuItem
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
import { SmsStatus, ReponseType } from '../../../helpers/PulseemArrays';
import { smsStatusToString } from '../../../helpers/functions';

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
    const { FromNumber = '', ToNumber = '', ExternalRef = '', Status = '', FromDate = null, ToDate = null, ResponseType = null} = sms || {};
    const param = {
      FromDate,
      ToDate,
      Status,
      FromNumber,
      ToNumber,
      Reference: ExternalRef,
      ResponseType: ResponseType,
      PageIndex: 0,
      PageSize: rowsPerPage
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
    const { FromDate = null, ToDate = null } = sms || {};

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
          />
        </Grid>
        <Grid item>
          <DateField
            classes={classes}
            value={ToDate}
            onChange={handleToDate}
            placeholder={t('mms.locToDateResource1.Text')}
            minDate={FromDate ? FromDate : undefined}
            rootStyle={classes.maxWidth190}
          />
        </Grid>
      </>
    )
  }

  const renderAdvanceSearch = () => {
    const { sms = {} } = searchData || {};
    const { FromNumber = '', ToNumber = '', ExternalRef = '', Status = '', ResponseType = '' } = sms || {};

    return (
      <>
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
            type='tel'
            variant='outlined'
            size='small'
            value={ToNumber}
            onChange={(e) => handleSearchInput(e.target.value, 'ToNumber', 'sms')}
            className={clsx(classes.textField, classes.minWidth252)}
            placeholder={t('common.ToNumber')}
          />
        </Grid>
        {renderDateFields()}
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
          <FormControl variant="outlined" className={classes.formControl} style={{ width: '100%', maxHeight: 40 }}>
            <Select
              autoWidth
              displayEmpty
              className={clsx(classes.textField, classes.minWidth192)}
              value={Status}
              style={{ maxHeight: 40, overflow: 'hidden', paddingLeft: 0, paddingRight: 0 }}
              onChange={(e) => handleSearchInput(e.target.value, 'Status', 'sms')}
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
              <MenuItem key={-1} value="" className={classes.dropDownItem}>{t('common.Status')}</MenuItem>
              {SmsStatus.map(so => {
                return <MenuItem key={so.id} value={so.id} className={classes.dropDownItem}>{t(so.value)}</MenuItem>
              })}
            </Select>
          </FormControl>
        </Grid>
        <Grid item>
          <FormControl variant="outlined" className={classes.formControl} style={{ width: '100%', maxHeight: 40 }}>
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
          </FormControl>
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
          <Link
            color='initial'
            component='button'
            underline='none'
            onClick={() => handleAdvanceSearch(!advanceSearch)}
            className={clsx(classes.dBlock, classes.mt5)}>
            {t(!advanceSearch ? 'report.AdvanceSearch' : 'report.closeAdvanceSearch')}
          </Link>
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
      <Box className={clsx(classes.dFlex, classes.alignItemsCenter)}>
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
    const { TotalCredits = 0, TotalSent = 0, TotalRecords } = directSmsReport || {};
    return (
      <>
        <Box className={clsx(classes.mt25, classes.paddingSides25, classes.mb10, classes.reportPaperBgGray, classes.alignCenter)}>
          <Grid item container className={classes.widthUnset}>
            <Grid item className={clsx(classes.flexColumn2, classes.txtCenter, classes.pt14)}>
              <Typography className={clsx(classes.bold, classes.colorBlue)}>
                {t('report.TotalSent')}
              </Typography>
              <Typography align='center' className={clsx(classes.colorBlue)}>
                {TotalSent.toLocaleString()}
              </Typography>
            </Grid>
            <Grid item className={clsx(classes.flexColumn2, classes.txtCenter, classes.pt14)}>
              <Typography className={clsx(classes.bold, classes.colorBlue)}>
                {t('report.TotalCredits')}
              </Typography>
              <Typography align='center' className={clsx(classes.colorBlue)}>
                {TotalCredits.toLocaleString() || 0}
              </Typography>
            </Grid>
          </Grid>
        </Box>
        <Typography className={clsx(classes.colorGray, classes.mb5)}>
          {t('common.Total')} {TotalSent.toLocaleString()} {t('report.Messages')}
        </Typography>
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
            className={classes.flexHalf}>
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
        {/* <TableCell
          classes={noborderCell}
          align='center'
          className={classes.flex1}>
          {renderCell(row.SMSCampaignID)}
        </TableCell> */}
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
          className={classes.flexHalf}>
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

  const renderPhoneRow = (row) => {
    return (
      <TableRow
        key={row.ID}
        component='div'
        classes={rowStyle}>
        <TableCell style={{ flex: 1 }} classes={{ root: classes.tableCellRoot }}>
          <Box className={classes.inlineGrid}>
            {/* {renderNameCell(row)} */}
          </Box>
          <Grid container justifyContent={'space-between'}>
            <Grid item container className={classes.widthUnset}>
              <Grid item className={clsx(classes.flexColumn2, classes.txtCenter, classes.pt14)}>
                {/* {renderViewsCell(row.Views)} */}
              </Grid>
              <Grid item className={clsx(classes.flexColumn2, classes.txtCenter, classes.pt14)}>
                {/* {renderSubscribersCell(row)} */}
              </Grid>

            </Grid>
            <Grid item>
              {/* {renderCellIcons(row)} */}
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
        {sortData.map(renderRow)}
      </TableBody>
    )
  }

  const renderTable = () => {
    return (
      <TableContainer className={classes.borderAround}>
        <Table className={clsx(classes.tableContainer, classes.noborder)}>
          {windowSize !== 'xs' && renderTableHead()}
          {renderTableBody()}
        </Table>
      </TableContainer>
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
      {renderTotalSection()}
      {renderTable()}
      {renderTablePagination()}
      <Loader isOpen={showLoader} />
    </>
  );
}

export default DirectSMSReportTab