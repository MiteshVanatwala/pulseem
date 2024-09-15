import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import {
  Box, Button, Grid, Table, TableContainer, Link,
  TableCell, TableHead, TableRow, TextField, Typography, TableBody, IconButton, Collapse, FormControl, MenuItem
} from '@material-ui/core';
import Select from '@mui/material/Select';
import { TablePagination, DateField } from '../../../components/managment/index';
import ControlPointIcon from '@material-ui/icons/ControlPoint';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import VisibilityIcon from '@material-ui/icons/Visibility';
import moment from 'moment';
import { getNewsletterDirectReport, getArchiveDirectReport } from '../../../redux/reducers/newsletterSlice';
import { reactivateEmail } from '../../../redux/reducers/clientSlice';
import { Loader } from '../../../components/Loader/Loader';
import { useSelector } from 'react-redux';
import { EmailStatus } from '../../../helpers/Constants';
import { ConvertColorStatus, ConvertEmailStatusText, EllipsisText, SourceType } from '../../../helpers/UI/TableText';
import { actionURL } from '../../../config/index'
import TotalSection from '../../../components/managment/TotalSection';
import { setRowsPerPage } from '../../../redux/reducers/coreSlice';
import { Title } from '../../../components/managment/Title';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { IoIosArrowDown } from 'react-icons/io';

const RenderRow = ({
  classes,
  cellStyle,
  noborderCell,
  rowStyle,
  row,
  t = () => null,
  windowSize,
  isArchive = false,
  dispatch,
  onRefresh = () => null
}) => {
  const [open, setOpen] = useState(false);

  const renderCell = (data, dataType) => {
    let text = data;
    if (dataType === 'date') {
      text = moment(text);
      text = `${text.format('DD/MM/YYYY')} ${text.format('LT')}`
    }
    if (dataType === 'status') {
      text = t(ConvertEmailStatusText(`${data}`))
      return (
        <Typography style={{ color: ConvertColorStatus(data, SourceType.EMAIL), fontWeight: 600 }}>{text}</Typography>
      )
    }

    return (
      <Typography className={dataType !== 'date' ? classes.wordBreak : {}}>{text}</Typography>
    );
  }

  const renderCollapsibleRow = (row) => {
    return (
      <TableRow
        key={`expand_${row.ID}`}
        classes={rowStyle}
        className={clsx(classes.tableRowCollapse, 'directEmailRowCollapse')}>
        <TableCell className={clsx(classes.noPadding, classes.dFlex, classes.fullWidth)}>
          <Collapse in={open} timeout="auto" unmountOnExit className={classes.fullWidth}>
            <Table>
              <TableHead>
                <TableRow className={clsx(classes.expandTableRow, 'directEmailRow')}

                >
                  <TableCell align="center" className={clsx(classes.tableCollapseHead)} style={{ width: 15, padding: 0 }}></TableCell>
                  <TableCell align="center" className={clsx(classes.tableCollapseHead, classes.flex1)}>{t('automations.click')}</TableCell>
                  <TableCell align="center" className={clsx(classes.tableCollapseHead, classes.flex1)}>{t('common.ExternalRef')}</TableCell>
                  <TableCell align="center" className={clsx(classes.tableCollapseHead, classes.flex1)}>{t('report.Attachments')}</TableCell>
                  <TableCell align="center" className={clsx(classes.tableCollapseHead, classes.flex1)}>{t('report.ToName')}</TableCell>
                  <TableCell align="center" className={clsx(classes.tableCollapseHead, classes.flex2)}>{t('report.FromName')}</TableCell>
                  <TableCell align="center" className={clsx(classes.tableCollapseHead, classes.flexHalf)} style={{ paddingTop: 0, position: 'relative' }}>
                    {!isArchive &&
                      <Box className={clsx(classes.txtCenter, classes.directPreview)} onClick={() => {
                        window.open(`${actionURL}DirectEmailPreview.aspx?id=${row.SendID}`, '_blank')
                      }}>
                        <IconButton style={{ paddingTop: 5 }}>
                          <VisibilityIcon className={classes.black} />
                        </IconButton>
                        <Typography display='block' align='center' className={classes.mtNeg15}>{t('common.Preview')}</Typography>
                      </Box>
                    }
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow className={clsx(classes.expandTableRow, 'directEmailRow')}>
                  <TableCell align="center" style={{ width: 15 }}></TableCell>
                  <TableCell align="center" className={clsx(classes.flex1)}>{row.ClickCount}</TableCell>
                  <TableCell align="center" className={clsx(classes.flex1, classes.ellipsisText)}
                    title={row.ExternalRef ? row.ExternalRef : t('report.None')}>
                    {row.ExternalRef ? EllipsisText(row.ExternalRef, 25) : t('report.None')
                    }</TableCell>
                  <TableCell align="center" className={clsx(classes.flex1)}>
                    {row.Attachments ? row.Attachments.split('##').map((link, index) => {
                      return (
                        <Link
                          key={index}
                          color="primary"
                          href={link}
                          target='_blank'
                          className={clsx(classes.emailAttachment, classes.f16)}>
                          {t('landingPages.GridTemplateColumnResource1.HeaderText')}
                        </Link>
                      )
                    })
                      : t('report.None')
                    }
                  </TableCell>
                  <TableCell align="center" className={clsx(classes.flex1)}>{row.ToName}</TableCell>
                  <TableCell align="center" className={clsx(classes.flex2)}>{row.FromName}</TableCell>
                  <TableCell align="center" className={clsx(classes.flexHalf)}>

                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Collapse>
        </TableCell>
      </TableRow>
    )
  }

  const renderReactivate = (row) => {
    const reactivate = async () => {
      const request = {
        From: row.FromEmail.trim().replace(' ', ''),
        To: row.ToEmail.trim().replace(' ', ''),
        ErrorCode: row.Status
      };
      await dispatch(reactivateEmail(request));
      onRefresh();
    }
    return (<Link
      color="primary"
      onClick={() => { reactivate() }}
      target='_blank'
      className={clsx(classes.f16, classes.redLink)}>
      {t('report.Reactivate')}
    </Link>)
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
          {(row.ClientStatus === 1) && renderReactivate(row)}
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
  title,
  dispatch,
  windowSize,
  handleSearchInput = () => null,
  handleSearching = () => null,
  handlePageChange = () => null,
  handleAdvanceSearch = () => null,
  clearSearch,
  page,
  rowsPerPage,
  searchData,
  isSearching,
  directEmailReport,
  rowsOptions,
  advanceSearch,
  isArchive = false
}) => {
  const { isRTL } = useSelector(state => state.core);
  const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot };
  const cellStyle = { head: classes.tableCellHead, body: classes.tableCellBody, root: classes.tableCellRoot };
  const noborderCell = { body: clsx(classes.tableCellBody, classes.noborder), root: classes.tableCellRoot };
  const { t } = useTranslation();
  const [showLoader, setLoader] = useState(false)

  const handleSearch = async () => {
    const { email = {} } = searchData || {};
    const { FromEmail = '', ToEmail = '', Reference = '', Status = '', FromDate = null, ToDate = null, ToName = '', Subject = '', FromName = '' } = email || {};
    const param = {
      FromDate,
      ToDate,
      Status,
      FromEmail: FromEmail.trim().replace(' ', ''),
      ToEmail: ToEmail.trim().replace(' ', ''),
      Reference: (Reference && Reference !== '') ? Reference.trim().replace(' ', '') : null,
      ToName,
      FromName,
      Subject,
      PageIndex: 1,
      PageSize: rowsPerPage
    }
    let searchObjects = {};
    Object.keys(param).forEach(item => {
      if (param[item]) {
        searchObjects[item] = param[item];
      }
    })

    setLoader(true)
    await dispatch(isArchive ? getArchiveDirectReport(searchObjects) : getNewsletterDirectReport(searchObjects))
    handleSearching('email', true);
    handlePageChange(1);
    setLoader(false)
  }

  const searchRequest = async (pageSize, pageIndex) => {
    setLoader(true);
    let { email = {} } = searchData || {};
    let params = {
      PageSize: pageSize,
      PageIndex: pageIndex,
      ...email
    };
    await dispatch(isArchive ? getArchiveDirectReport(params) : getNewsletterDirectReport(params))
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

  const handleFromDate = (val) => {
    if (val) {
      let dateVal = moment(val).startOf('day').format('YYYY-MM-DD HH:mm') || null;
      handleSearchInput(dateVal, 'FromDate', 'email')
    }
  }

  const handleToDate = (val) => {
    if (val) {
      let dateVal = moment(val).endOf('day').format('YYYY-MM-DD HH:mm') || null;
      handleSearchInput(dateVal, 'ToDate', 'email')
    }
  }
  const renderDateFields = () => {
    const { email = {} } = searchData || {};
    const { FromDate = null, ToDate = null, ToEmail = '' } = email || {};

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
            minDate={FromDate ? FromDate : undefined}
            rootStyle={classes.maxWidth190}
            toolbarDisabled={false}
            isRoundedOnMobile={windowSize === 'xs'}
          />
        </Grid>
        {(windowSize !== 'xs' && !advanceSearch) && <Grid item>
          <TextField
            type='tel'
            variant='outlined'
            inputProps={{
              style: {
                textAlign: isRTL ? 'right' : 'left'
              }
            }}
            size='small'
            value={ToEmail}
            onChange={(e) => handleSearchInput(e.target.value, 'ToEmail', 'email')}
            className={clsx(classes.textField, classes.minWidth252)}
            placeholder={t('report.ToEmail')}
          />
        </Grid>
        }
      </>
    )
  }


  const renderAdvanceSearch = () => {
    const { email = {} } = searchData || {};
    const { FromEmail = '', ToEmail = '', Reference = '', Status = '', ToName = '', FromName = '', Subject = '' } = email || {};

    return (
      <>
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
            inputProps={{
              style: {
                textAlign: isRTL ? 'right' : 'left'
              }
            }}
            value={ToEmail}
            onChange={(e) => handleSearchInput(e.target.value, 'ToEmail', 'email')}
            className={clsx(classes.textField, classes.minWidth252)}
            placeholder={t('report.ToEmail')}
          />
        </Grid>
        {renderDateFields()}
        {windowSize !== 'xs' && <Grid item>
          <TextField
            variant='outlined'
            size='small'
            value={ToName}
            inputProps={{
              style: {
                textAlign: isRTL ? 'right' : 'left'
              }
            }}
            onChange={(e) => handleSearchInput(e.target.value, 'ToName', 'email')}
            className={clsx(classes.textField, classes.minWidth252)}
            placeholder={t('automations.Recipient')}
          />
        </Grid>
        }
        <Grid item>
          <TextField
            variant='outlined'
            size='small'
            value={Reference}
            onChange={(e) => handleSearchInput(e.target.value !== '' ? e.target.value : null, 'Reference', 'email')}
            className={clsx(classes.textField, classes.minWidth252)}
            placeholder={t('report.ExternalRef')}
          />
        </Grid>
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
            value={Subject}
            onChange={(e) => handleSearchInput(e.target.value, 'Subject', 'email')}
            className={clsx(classes.textField, classes.minWidth252)}
            placeholder={t('report.Subject')}
          />
        </Grid>
        <Grid item>
          <FormControl variant='standard' className={clsx(classes.selectInputFormControl, classes.w100)}>
            <Select
              variant="standard"
              autoWidth
              displayEmpty
              value={Status}
              onChange={(e) => handleSearchInput(e.target.value, 'Status', 'email')}
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
              {EmailStatus.map(so => <MenuItem key={so.id} value={so.id}>{t(so.value)}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>

      </>
    )
  }

  const renderSearchLine = () => {
    const { email = false } = isSearching || {};
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
          <Link
            color='initial'
            component='button'
            underline='none'
            onClick={() => handleAdvanceSearch(!advanceSearch)}
            className={clsx(classes.dBlock, classes.mt1, windowSize === 'xs' ? classes.hidden : null)}>
            {t(!advanceSearch ? 'report.AdvanceSearch' : 'report.closeAdvanceSearch')}
          </Link>
        </Grid>

        {email ? <Grid item>
          <Button
            onClick={() => {
              clearSearch('email');
            }}
            className={clsx(classes.btn, classes.btnRounded)}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}>
            {t('common.clear')}
          </Button>
        </Grid> : null}
      </Grid>
    )
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
    const { SendDate, UpdateDate } = row

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
              <Typography style={{ color: ConvertColorStatus(Status, SourceType.EMAIL) }}>
                {t(ConvertEmailStatusText(`${Status}`))}
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
    let sortData = directEmailReport && directEmailReport.DirectReport ? directEmailReport.DirectReport : null;

    return (
      <Box className='tableBodyContainer'>
        <TableBody className={classes.tableDirectRow}>
          {!sortData || sortData.length === 0 ?
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
                  t={t}
                  isArchive={isArchive}
                  dispatch={dispatch}
                  onRefresh={handleSearch} />
            )
          }
        </TableBody>
      </Box>
    )
  }

  const renderTable = () => {
    return (
      <>
        <Grid container style={{ justifyContent: windowSize === 'xs' ? 'flex-start' : 'flex-end' }}>
          <Grid item className={classes.mt15}>
            <Typography className={clsx(classes.groupsLable, classes.mb5)}>
              {t('common.Total')} {directEmailReport?.TotalRecords?.toLocaleString()} {t('report.Messages')}
            </Typography>
          </Grid>
        </Grid>
        <TableContainer className={clsx(classes.tableStyle, classes.mt10)}>
          <Table className={clsx(classes.tableContainer)} aria-label="collapsible table">
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
        classes={classes}
        rows={emailData}
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
      {renderTable()}
      {renderTablePagination()}
      {<TotalSection classes={classes} TotalObject={directEmailReport} callerType="email" />}
      <Loader isOpen={showLoader} />
    </>
  );
}

export default DirectEmailReportTab