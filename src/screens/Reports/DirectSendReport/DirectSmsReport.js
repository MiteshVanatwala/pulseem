import React from 'react';
import {useTranslation} from 'react-i18next';
import clsx from 'clsx';
import { Box, Button, Grid, Table, TableContainer, 
  TableCell,Link,
  TableHead, TableRow, TextField, Typography, TableBody } from '@material-ui/core';
import {
  TablePagination,DateField
} from '../../../components/managment/index';
import { SearchIcon } from '../../../assets/images/managment';
import ClearIcon from '@material-ui/icons/Clear';
import { getSMSReport } from '../../../redux/reducers/reportsSlice';
import Switch from "react-switch";
import moment from 'moment';

const DirectSMSReportTab=({
  classes,
  dispatch,
  windowSize,
  isRTL,
  handleSearchInput=()=>null,
  handleSearching=()=>null,
  handlePageChange=()=>null,
  handleRowsPerPage=()=>null,
  handleShowContent=()=>null,
  handleAdvanceSearch=()=>null,
  clearSearch,
  page,
  rowsPerPage,
  searchData,
  isSearching,
  directSmsReport,
  showContent,
  advanceSearch
}) => {
  const rowsOptions=[6,12,18];
  const rowStyle={head: classes.tableRowHead,root: classes.tableRowRoot};
  const cellStyle={head: classes.tableCellHead,body: classes.tableCellBody,root: classes.tableCellRoot};
  const noborderCell={body: clsx(classes.tableCellBody,classes.noborder),root: classes.tableCellRoot};
  const {t}=useTranslation();

  const handleSearch= async() => {
    const { sms = {} } = searchData || {};
    const { FromNumber='', ToNumber='', ExternalRef='', Status='', FromDate=null, ToDate=null  } = sms || {};
    const param= { 
      FromDate,
      ToDate,
      Status,
      FromNumber,
      ToNumber,
      Reference: ExternalRef,
      PageIndex: 1,
      PageSize: rowsPerPage
    }
    let searchObjects={};
    Object.keys(param).map(item=>{
      if (param[item]) {
        searchObjects[item]=param[item];
      }
    })

    dispatch(getSMSReport(searchObjects))
    handleSearching('sms', true);
    handlePageChange(1);
  }

  const handlePageSearching=(val)=>{
    let { sms = {} } = searchData || {};
    let params={
      PageSize:rowsPerPage,
      PageIndex:val,
      ...sms
    };
    handlePageChange(val);
    dispatch(getSMSReport(params));
  }

  const handleRowsPerPageSearching=async(val)=>{
    let { sms = {} } = searchData || {};
    let params={
      PageSize:val,
      PageIndex:page,
      ...sms
    }
    dispatch(getSMSReport(params));
    handleRowsPerPage(val)
  }

  const renderCell=(data, dataType)=>{
    let text = data;
    if (dataType === 'date') {
      text = moment(text);
      text = `${text.format('DD/MM/YYYY')} ${text.format('LT')}`
    }
    
    return (
      <Typography>{text}</Typography>
    );
  }

  const renderDateFields=() => {
    const { sms={} } = searchData || {};
    const { FromDate=null, ToDate=null } = sms || {};

    const handleFromDate=(val)=> {
      let dateVal = moment(val).startOf('day').format('YYYY-MM-DD HH:mm') || null;
      handleSearchInput(dateVal,'FromDate', 'sms')
    }

    const handleToDate=(val)=> {
      let dateVal = moment(val).endOf('day').format('YYYY-MM-DD HH:mm') || null;
      handleSearchInput(dateVal,'ToDate', 'sms')
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
            minDate={FromDate? FromDate:undefined}
            rootStyle={classes.maxWidth190}
          />
        </Grid>
      </>
    )
  }

  const renderAdvanceSearch=()=>{
    const { sms = {} } = searchData || {};
    const { FromNumber='', ToNumber='', Recipient='', ExternalRef='', Status='' } = sms || {};
    return (
      <>
        <Grid item>
          <TextField
            type='tel'
            variant='outlined'
            size='small'
            value={FromNumber}
            onChange={(e)=>handleSearchInput(e.target.value,'FromNumber', 'sms')}
            className={clsx(classes.textField,classes.minWidth252)}
            placeholder={t('common.FrmNumber')}
          />
        </Grid>
        <Grid item>
          <TextField
            type='tel'
            variant='outlined'
            size='small'
            value={ToNumber}
            onChange={(e)=>handleSearchInput(e.target.value,'ToNumber', 'sms')}
            className={clsx(classes.textField,classes.minWidth252)}
            placeholder={t('common.ToNumber')}
          />
        </Grid>
        <Grid item>
          <TextField
            variant='outlined'
            size='small'
            value={Recipient}
            onChange={(e)=>handleSearchInput(e.target.value,'Recipient', 'sms')}
            className={clsx(classes.textField,classes.minWidth252)}
            placeholder={t('automations.Recipient')}
          />
        </Grid>
        {renderDateFields()}
        <Grid item>
          <TextField
            variant='outlined'
            size='small'
            value={ExternalRef}
            onChange={(e)=>handleSearchInput(e.target.value,'ExternalRef', 'sms')}
            className={clsx(classes.textField,classes.minWidth252)}
            placeholder={t('report.ExternalRef')}
          />
        </Grid>
        <Grid item>
          <TextField
            variant='outlined'
            size='small'
            value={Status}
            onChange={(e)=>handleSearchInput(e.target.value,'Status', 'sms')}
            className={clsx(classes.textField,classes.minWidth252)}
            placeholder={t('common.Status')}
          />
        </Grid>
      </>
    )
  }

  const renderSearchLine=() => {
    const { sms = false } = isSearching || {};
    return (
      <Grid container spacing={2} className={classes.lineTopMarging}>
        {advanceSearch?renderAdvanceSearch():renderDateFields()}
        <Grid item>
          <Button
            size='large'
            variant='contained'
            onClick={handleSearch}
            className={classes.searchButton}
            endIcon={<SearchIcon />}>
            {t('campaigns.btnSearchResource1.Text')}
          </Button>
          {!advanceSearch&&<Link 
            color='initial'
            component='button' 
            underline='none' 
            onClick={()=>handleAdvanceSearch(true)}
            className={clsx(classes.dBlock, classes.mt5)}>
            {t('report.AdvanceSearch')}
          </Link>}
        </Grid>

        {sms?<Grid item>
          <Button
            size='large'
            variant='contained'
            onClick={()=>clearSearch('sms')}
            className={classes.searchButton}
            endIcon={<ClearIcon />}>
            {t('common.clear')}
          </Button>
        </Grid>:null}
      </Grid>
    )
  }

  const renderToggleContent=()=>{
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
          className={clsx({[classes.rtlSwitch]: isRTL})}
          onChange={() => handleShowContent(!showContent)}
        />
        <Typography>{t('report.ShowContent')}</Typography>
      </Box>
    );
  }

  const renderTotalSection=()=>{
    const { TotalCredits=0, TotalSent=0 }=directSmsReport||{};
    return (
      <Box className={classes.mt10}>
        <Typography 
          className={clsx(classes.bold)} 
          display='inline'>
          {t('report.TotalCredits')}{` : `}{TotalCredits.toLocaleString()}
        </Typography>
        <Typography 
          className={clsx(classes.mt10, classes.ml10, classes.bold)} 
          display='inline'>
          {t('report.TotalSent')}{` : `}{TotalSent.toLocaleString()}
        </Typography>
      </Box>
    );
  }

  const renderTableHead=()=>{
    return (
      <TableHead>
        <TableRow
          classes={rowStyle}>
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
          {showContent&&<TableCell
            classes={cellStyle}
            align='center'
            className={classes.flex3}>
            {t('report.ContentOfMessage')}
          </TableCell>}
          <TableCell
            classes={cellStyle}
            align='center'
            className={classes.flexHalf}>
            {t('common.ErrorTitle')}
          </TableCell>
          <TableCell
            classes={cellStyle}
            align='center'
            className={classes.flexHalf}>
            {t('landingPages.GridBoundColumnResource1.HeaderText')}
          </TableCell>
          <TableCell
            classes={cellStyle}
            align='center'
            className={classes.flexHalf}>
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

  const renderRow=(row) => {
    return (
      <TableRow
        key={row.ID}
        classes={rowStyle}>
        <TableCell scope="row"
          classes={cellStyle}
          align='center'
          className={classes.flex1}>
          {renderCell(row.Date, 'date')}
        </TableCell>
        <TableCell
          classes={noborderCell}
          align='center'
          className={classes.flex1}>
          {renderCell(row.FromNumber)}
        </TableCell>
        <TableCell
          classes={noborderCell}
          align='center'
          className={classes.flex1}>
          {renderCell(row.ToNumber)}
        </TableCell>
        <TableCell
          classes={cellStyle}
          align='center'
          className={classes.flexHalf}>
          {renderCell(row.Status)}
        </TableCell>
        {showContent&&<TableCell
          classes={cellStyle}
          align='center'
          className={classes.flex3}>
          {renderCell(row.Text)}
        </TableCell>}
        <TableCell
          classes={noborderCell}
          align='center'
          className={classes.flexHalf}>
          {renderCell(row.ErrorType)}
        </TableCell>
        <TableCell
          classes={noborderCell}
          align='center'
          className={classes.flexHalf}>
          {renderCell(row.SMSCampaignID)}
        </TableCell>
        <TableCell
          classes={noborderCell}
          align='center'
          className={classes.flexHalf}>
          {renderCell(row.CharCount)}
        </TableCell>
        <TableCell
          classes={noborderCell}
          align='center'
          className={classes.flexHalf}>
          {renderCell(row.Credits)}
        </TableCell>
      </TableRow>
    )
  }

  const renderPhoneRow=(row) => {
    return (
      <TableRow
        key={row.ID}
        component='div'
        classes={rowStyle}>
        <TableCell style={{flex: 1}} classes={{root: classes.tableCellRoot}}>
          <Box className={classes.inlineGrid}>
            {/* {renderNameCell(row)} */}
          </Box>
          <Grid container justify={'space-between'}>
            <Grid item container className={classes.widthUnset}>
              <Grid item className={clsx(classes.flexColumn2,classes.txtCenter,classes.pt14)}>
                {/* {renderViewsCell(row.Views)} */}
              </Grid>
              <Grid item className={clsx(classes.flexColumn2,classes.txtCenter,classes.pt14)}>
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

  const renderTableBody=() => {
    let sortData=directSmsReport&&directSmsReport.DirectReport;
    if (!sortData) {
      return;
    }

    return (
      <TableBody>
        {sortData.map(renderRow)}
      </TableBody>
    )
  }

  const renderTable=()=>{
    return (
      <TableContainer className={classes.borderAround}>
        <Table className={clsx(classes.tableContainer, classes.noborder)}>
          {windowSize!=='xs'&&renderTableHead()}
          {renderTableBody()}
        </Table>
      </TableContainer>
    )
  }

  const renderTablePagination=() => {
    const smsData = directSmsReport&&directSmsReport.TotalSent || 0;
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
      {renderSearchLine()}
      {renderToggleContent()}
      {renderTotalSection()}
      {renderTable()}
      {renderTablePagination()}
    </>
  );
}

export default DirectSMSReportTab