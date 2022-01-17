import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import {
  Box, Button, Grid, Table, TableContainer, Link,
  TableCell, TableHead, TableRow, TextField, Typography, TableBody, IconButton, Collapse, FormControl, InputLabel, Select, MenuItem
} from '@material-ui/core';
import { TablePagination, DateField } from '../../../components/managment/index';
import { SearchIcon } from '../../../assets/images/managment';
import ClearIcon from '@material-ui/icons/Clear';
import ControlPointIcon from '@material-ui/icons/ControlPoint';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import VisibilityIcon from '@material-ui/icons/Visibility';
import moment from 'moment';
import { getNewsletterDirectReport } from '../../../redux/reducers/newsletterSlice';
import { Loader } from '../../../components/Loader/Loader';
import { useSelector } from 'react-redux';
import { EmailStatus } from '../../../helpers/PulseemArrays';
import { emailStatusToString, emailStatusColor } from '../../../helpers/functions';
import { actionURL } from '../../../config/index'

const RenderRow = ({
  classes,
  cellStyle,
  noborderCell,
  rowStyle,
  row,
  t = () => null,
  windowSize
}) => {
  const [open, setOpen] = useState(false);
  const [noDataToPresnt, setNoDataToPresent] = useState(true);

  const renderCell = (data, dataType) => {
    let text = data;
    if (dataType === 'date') {
      text = moment(text);
      text = `${text.format('DD/MM/YYYY')} ${text.format('LT')}`
    }
    if (dataType === 'status') {
      text = t(emailStatusToString(data))
    }

    return (
      <Typography className={dataType !== 'date' ? classes.wordBreak : {}}>{text}</Typography>
    );
  }

  const renderCollapsibleRow = (row) => {
    return (
      <TableRow className={clsx(classes.tableRowCollapse, 'directEmailRowCollapse')}>
        <TableCell className={clsx(classes.pt0, classes.pb0)} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1} className={classes.dFlex}>
              <Table size="small" className={classes.w80}>
                <TableHead>
                  <TableRow>
                    <TableCell align="left" className={classes.tableCollapseHead}>{t('automations.click')}</TableCell>
                    <TableCell align="left" className={classes.tableCollapseHead}>{t('common.ExternalRef')}</TableCell>
                    <TableCell align="left" className={classes.tableCollapseHead}>{t('report.Attachments')}</TableCell>
                    <TableCell align="left" className={classes.tableCollapseHead}>{t('report.ToName')}</TableCell>
                    <TableCell align="left" className={classes.tableCollapseHead}>{t('report.FromName')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell component="th" scope="row" className={classes.noborder}>{row.ClickCount}</TableCell>
                    <TableCell align="left" className={classes.noborder}>{row.ExternalRef}</TableCell>
                    <TableCell align="left" className={classes.noborder}>
                      {row.Attachments ?
                        <Link
                          color="primary"
                          href={row.Attachments}
                          className={classes.f16}>
                          {t('landingPages.GridTemplateColumnResource1.HeaderText')}
                        </Link>
                        : t('report.None')
                      }
                    </TableCell>
                    <TableCell align="left" className={classes.noborder}>{row.ToName}</TableCell>
                    <TableCell align="left" className={classes.noborder}>{row.FromName}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <Box className={classes.w20}>
                <Box className={clsx(classes.floatRight, classes.txtCenter)} onClick={() => {
                  window.open(`${actionURL}DirectEmailPreview.aspx?id=${row.SendID}`, '_blank')
                }}>
                  <IconButton>
                    <VisibilityIcon className={classes.black} />
                  </IconButton>
                  <Typography display='block' align='center' className={classes.mtNeg15}>{t('common.Preview')}</Typography>
                </Box>
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <>
      <TableRow
        key={row.ID}
        classes={rowStyle}
        className={'directEmailRow'}>
        <TableCell className={classes.cellExpand}>
          <IconButton onClick={() => setOpen(!open)}>
            {open ? <RemoveCircleOutlineIcon /> : <ControlPointIcon />}
          </IconButton>
        </TableCell>
        <TableCell component='th' scope="row"
          classes={cellStyle}
          align='center'
          className={classes.flex1}>
          {renderCell(row.SendDate, 'date')}
        </TableCell>
        <TableCell
          classes={noborderCell}
          align='center'
          className={classes.flex1}>
          {renderCell(row.FromEmail)}
        </TableCell>
        <TableCell
          classes={cellStyle}
          align='center'
          className={classes.flex1}>
          {renderCell(row.ToEmail)}
        </TableCell>
        {windowSize !== 'xs' && (
          <>
            <TableCell
              classes={cellStyle}
              align='center'
              className={classes.flex1}>
              {renderCell(row.Status, 'status')}
            </TableCell>
            <TableCell
              classes={cellStyle}
              align='center'
              className={classes.flex2}>
              {renderCell(row.Subject)}
            </TableCell>
            <TableCell
              classes={noborderCell}
              align='center'
              className={classes.flexHalf}>
              {renderCell(row.OpenCount)}
            </TableCell>
          </>
        )}
      </TableRow>
      {renderCollapsibleRow(row)}
    </>
  )
}

const DirectEmailReportTab = ({
  classes,
  dispatch,
  windowSize,
  handleSearchInput = () => null,
  handleSearching = () => null,
  handlePageChange = () => null,
  handleRowsPerPage = () => null,
  handleAdvanceSearch = () => null,
  clearSearch,
  page,
  rowsPerPage,
  searchData,
  isSearching,
  directEmailReport,
  rowsOptions,
  advanceSearch
}) => {
  const { isRTL } = useSelector(state => state.core);
  const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot };
  const cellStyle = { head: classes.tableCellHead, body: classes.tableCellBody, root: classes.tableCellRoot };
  const noborderCell = { body: clsx(classes.tableCellBody, classes.noborder), root: classes.tableCellRoot };
  const { t } = useTranslation();
  const [showLoader, setLoader] = useState(false)

  const handleSearch = async () => {
    const { email = {} } = searchData || {};
    const { FromEmail = '', ToEmail = '', ExternalRef = '', Status = '', FromDate = null, ToDate = null, ToName = '' } = email || {};
    const param = {
      FromDate,
      ToDate,
      Status,
      FromEmail,
      ToEmail,
      Reference: ExternalRef,
      ToName,
      PageIndex: 1,
      PageSize: rowsPerPage
    }
    let searchObjects = {};
    Object.keys(param).map(item => {
      if (param[item]) {
        searchObjects[item] = param[item];
      }
    })

    setLoader(true)
    dispatch(getNewsletterDirectReport(searchObjects))
    handleSearching('email', true);
    handlePageChange(1);
    setLoader(false)
  }

  const handlePageSearching = (val) => {
    let { email = {} } = searchData || {};
    let params = {
      PageSize: rowsPerPage,
      PageIndex: val,
      ...email
    };
    handlePageChange(val);
    dispatch(getNewsletterDirectReport(params));
  }

  const handleRowsPerPageSearching = async (val) => {
    setLoader(true);
    let { email = {} } = searchData || {};
    let params = {
      PageSize: val,
      PageIndex: page,
      ...email
    }
    await dispatch(getNewsletterDirectReport(params));
    handleRowsPerPage(val)
    setLoader(false);
  }

  const handleFromDate = (val) => {
    let dateVal = moment(val).startOf('day').format('YYYY-MM-DD HH:mm') || null;
    handleSearchInput(dateVal, 'FromDate', 'email')
  }

  const handleToDate = (val) => {
    let dateVal = moment(val).endOf('day').format('YYYY-MM-DD HH:mm') || null;
    handleSearchInput(dateVal, 'ToDate', 'email')
  }
  const renderDateFields = () => {
    const { email = {} } = searchData || {};
    const { FromDate = null, ToDate = null, ToName = '' } = email || {};

    return (
      <>
        {windowSize !== 'xs' && <Grid item>
          <TextField
            variant='outlined'
            size='small'
            value={ToName}
            onChange={(e) => handleSearchInput(e.target.value, 'ToName', 'email')}
            className={clsx(classes.textField, classes.minWidth252)}
            placeholder={t('automations.Recipient')}
          />
        </Grid>
        }
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
            minDate={FromDate ? FromDate : undefined}
            rootStyle={classes.maxWidth190}
            toolbarDisabled={false}
            minDate={'2000-01-01'}
          />
        </Grid>
      </>
    )
  }


  const renderAdvanceSearch = () => {
    const { email = {} } = searchData || {};
    const { FromEmail = '', ToEmail = '', Recipient = '', ExternalRef = '', Status = '', ToName = '', FromName = '', Subject = '' } = email || {};

    return (
      <>
        <Grid item>
          <TextField
            type='tel'
            variant='outlined'
            size='small'
            value={FromEmail}
            onChange={(e) => handleSearchInput(e.target.value, 'FromEmail', 'email')}
            className={clsx(classes.textField, classes.minWidth252)}
            placeholder={t('report.FromEmail')}
          />
        </Grid>
        <Grid item>
          <TextField
            type='tel'
            variant='outlined'
            size='small'
            value={ToEmail}
            onChange={(e) => handleSearchInput(e.target.value, 'ToEmail', 'email')}
            className={clsx(classes.textField, classes.minWidth252)}
            placeholder={t('report.ToEmail')}
          />
        </Grid>
        {renderDateFields()}
        <Grid item>
          <TextField
            variant='outlined'
            size='small'
            value={FromName}
            onChange={(e) => handleSearchInput(e.target.value, 'FromName', 'email')}
            className={clsx(classes.textField, classes.minWidth252)}
            placeholder={t('report.FromName')}
          />
        </Grid>
        <Grid item>
          <TextField
            variant='outlined'
            size='small'
            value={ExternalRef}
            onChange={(e) => handleSearchInput(e.target.value, 'ExternalRef', 'email')}
            className={clsx(classes.textField, classes.minWidth252)}
            placeholder={t('report.ExternalRef')}
          />
        </Grid>
        <Grid item>
          <TextField
            variant='outlined'
            size='small'
            value={Subject}
            onChange={(e) => handleSearchInput(e.target.value, 'Subject', 'email')}
            className={clsx(classes.textField, classes.minWidth252)}
            placeholder={t('report.Subject')}
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
              onChange={(e) => handleSearchInput(e.target.value, 'Status', 'email')}
            >
              <MenuItem key={-1} value="" className={classes.dropDownItem}>{t('common.Status')}</MenuItem>
              {EmailStatus.map(so => {
                return <MenuItem key={so.id} value={so.id} className={classes.dropDownItem}>{t(so.value)}</MenuItem>
              })}
            </Select>
          </FormControl>
        </Grid>
      </>
    )
  }

  const renderSearchLine = () => {
    const { email = false } = isSearching || {};
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
            className={clsx(classes.dBlock, classes.mt5, windowSize === 'xs' ? classes.hidden : null)}>
            {t(!advanceSearch ? 'report.AdvanceSearch' : 'report.closeAdvanceSearch')}
          </Link>
        </Grid>

        {email ? <Grid item>
          <Button
            size='large'
            variant='contained'
            onClick={() => {
              clearSearch('email');
              handleFromDate(moment().startOf('month').format('YYYY-MM-DD HH:mm'));
              handleToDate(moment().format('YYYY-MM-DD HH:mm'));
            }}
            className={classes.searchButton}
            endIcon={<ClearIcon />}>
            {t('common.clear')}
          </Button>
        </Grid> : null}
      </Grid>
    )
  }

  const renderTotalSection = () => {
    const { TotalCredits = 0, TotalRecords = 0, SMSCredits = 0, BulkEmails = 0, MmsCredits = 0 } = directEmailReport || {};
    return (
      <>
        <Box className={clsx(classes.paddingSides25, classes.mb10, classes.reportPaperBgGray, classes.alignCenter)} style={{ marginBottom: 50 }}>
          <Grid item container className={clsx(classes.justifyEvenly)} style={{ width: '100%' }}>
            <Grid item className={clsx(classes.txtCenter, classes.pt14)}>
              <Typography className={clsx(classes.bold, classes.colorBlue)}>
                {t('report.TotalSent')}
              </Typography>
              <Typography align='center' className={clsx(classes.colorBlue)}>
                {TotalRecords.toLocaleString()}
              </Typography>
            </Grid>
            <Grid item className={clsx(classes.txtCenter, classes.pt14)}>
              <Typography className={clsx(classes.bold, classes.colorBlue)}>
                {t('report.TotalCredits')}
              </Typography>
              <Typography align='center' className={clsx(classes.colorBlue)}>
                {TotalCredits.toLocaleString() || 0}
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
          <TableCell scope="row"
            style={{ padding: '16px 0px', minWidth: 20 }}
            align='center'>
          </TableCell>
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
            {t('report.FromEmail')}
          </TableCell>
          <TableCell
            classes={cellStyle}
            align='center'
            className={classes.flex1}>
            {t('report.ToEmail')}
          </TableCell>
          <TableCell
            classes={cellStyle}
            align='center'
            className={classes.flex1}>
            {t('common.Status')}
          </TableCell>
          <TableCell
            classes={cellStyle}
            align='center'
            className={classes.flex2}>
            {t('report.Subject')}
          </TableCell>
          <TableCell
            classes={cellStyle}
            align='center'
            className={classes.flexHalf}>
            {t('report.Opening')}
          </TableCell>
        </TableRow>
      </TableHead>
    )
  }

  const renderNameCell = (row) => {
    const { SendDate, UpdateDate, CreatedDate } = row

    const date = SendDate ? moment(SendDate) : ''
    const udate = UpdateDate ? moment(UpdateDate) : '';
    const showDate = SendDate ? date.format('L') : ''
    const showTime = SendDate ? date.format('LT') : ''
    const isSchedule = moment(SendDate) > moment();
    const showUpdateDate = UpdateDate ? udate.format('L') : '';
    const showTimeUpdate = UpdateDate ? udate.format('LT') : '';

    return (
      <>
        <Typography className={classes.nameEllipsis}>
          {t('report.SendDate')}
        </Typography>
        {SendDate !== null ?
          (
            <Typography className={classes.grayTextCell}>
              {isSchedule ? t("common.ScheduledFor") : t("common.SentOn")} {`${isRTL ? showDate : moment(showDate).format("DD/MM/YYYY")} ${showTime}`}
            </Typography>
          ) :
          (
            <Typography className={classes.grayTextCell}>
              {t("common.UpdatedOn")} {`${isRTL ? showUpdateDate : moment(showUpdateDate).format("DD/MM/YYYY")} ${showTimeUpdate}`}
            </Typography>
          )
        }

      </>
    )
  }

  const renderPhoneRow = (row) => {
    const {
      SendID,
      Name,
      SendDate,
      UpdateDate,
      CreatedDate,
      ToEmail,
      FromEmail,
      Status
    } = row

    return (
      <TableRow
        key={row.ID}
        component='div'
        classes={rowStyle}>
        <TableCell classes={{ root: clsx(classes.tableCellRoot, classes.flex1, classes.tabelCellPadding) }} style={{ paddingInline: 10 }}>
          <Box className={clsx(classes.dFlex)} style={{ width: '100%', justifyContent: 'space-between' }}>
            <Box className={classes.dFlex} style={{ flexDirection: 'column', justifySelf: 'flex-start' }}>
              {renderNameCell({ SendID, Name, SendDate, UpdateDate, Status, CreatedDate })}
            </Box>
            <Box style={{ justifySelf: 'flex-end', whiteSpace: 'nowrap' }}>
              <Typography style={{ color: emailStatusColor(Status) }}>
                {t(emailStatusToString(Status))}
              </Typography>
            </Box>
          </Box>
          <Grid container spacing={2}  >
            <Grid item>
              <Typography className={classes.mobileReportHead}>
                {t('report.FromEmail')}
              </Typography>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {FromEmail}
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
                {t('report.ToEmail')}
              </Typography>
              <Grid container spacing={2}>
                <Grid item>
                  {ToEmail}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </TableCell>
      </TableRow>
    )
  }

  const renderTableBody = () => {
    let sortData = directEmailReport && directEmailReport.DirectReport;

    return (
      <TableBody className={classes.tableDirectRow}>
        {!sortData ?
          <Box className={clsx(classes.flex, classes.justifyCenterOfCenter)} style={{ height: 50 }}>
            <Typography>{t("common.NoDataTryFilter")}</Typography>
          </Box> :
          sortData.map(row =>
            windowSize === 'xs' ? renderPhoneRow(row) :
              <RenderRow
                windowSize={windowSize}
                classes={classes}
                row={row}
                noborderCell={noborderCell}
                cellStyle={cellStyle}
                rowStyle={rowStyle}
                t={t} />
          )
        }
      </TableBody>
    )
  }

  const renderTable = () => {
    return (
      <>
        <Typography className={clsx(classes.colorGray, classes.mb5)}>
          {t('common.Total')} {directEmailReport.TotalRecords} {t('report.Messages')}
        </Typography>
        <TableContainer className={clsx(classes.borderAround, classes.mt25)}>
          <Table className={clsx(classes.tableContainer, classes.noborder)} aria-label="collapsible table">
            {windowSize !== 'xs' && renderTableHead()}
            {renderTableBody()}
          </Table>
        </TableContainer>
      </>
    )
  }

  const renderTablePagination = () => {
    const emailData = (directEmailReport && directEmailReport.TotalRecords) || 1;
    return (
      <TablePagination
        style={{ flexWrap: 'nowrap' }}
        classes={classes}
        rows={emailData}
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
      {renderTable()}
      {renderTablePagination()}
      {renderTotalSection()}
      <Loader isOpen={showLoader} />
    </>
  );
}

export default DirectEmailReportTab