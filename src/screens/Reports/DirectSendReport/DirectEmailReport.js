import React,{useState} from 'react';
import {useTranslation} from 'react-i18next';
import clsx from 'clsx';
import { Box, Button, Grid, Table, TableContainer, 
  TableCell, TableHead, TableRow, TextField, Typography, TableBody, IconButton, Collapse } from '@material-ui/core';
import { TablePagination,DateField } from '../../../components/managment/index';
import { SearchIcon } from '../../../assets/images/managment';
import ClearIcon from '@material-ui/icons/Clear';
import { getEmailReport } from '../../../redux/reducers/reportsSlice';
import ControlPointIcon from '@material-ui/icons/ControlPoint';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import VisibilityIcon from '@material-ui/icons/Visibility';
import moment from 'moment';

const RenderRow=({
  classes,
  cellStyle,
  noborderCell,
  rowStyle,
  row
}) => {
  const [open, setOpen]=useState(false);
  
  const renderCell=(data, dataType)=>{
    let text = data;
    if (dataType === 'date') {
      text = moment(text);
      text = `${text.format('DD/MM/YYYY')} ${text.format('LT')}`
    }
    
    return (
      <Typography className={dataType!=='date'?classes.wordBreak:{}}>{text}</Typography>
    );
  }

  return (
    <>
      <TableRow
        key={row.ID}
        classes={rowStyle}
        className={'directEmailRow'}>
        <TableCell className={classes.cellExpand}>
          <IconButton onClick={()=>setOpen(!open)}>
            {open?<RemoveCircleOutlineIcon />:<ControlPointIcon />}
          </IconButton>
        </TableCell>
        <TableCell component='th' scope="row"
          classes={cellStyle}
          align='center'
          className={classes.flex1}>
          {renderCell(row.Date, 'date')}
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
        <TableCell
          classes={cellStyle}
          align='center'
          className={classes.flexHalf}>
          {renderCell(row.Status)}
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
          {renderCell(row.Opening)}
        </TableCell>
      </TableRow>
      <TableRow className={clsx(classes.tableRowCollapse,'directEmailRowCollapse')}>
        <TableCell className={clsx(classes.pt0, classes.pb0)} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1} style={{display: 'flex'}}>
              <Table size="small" aria-label="purchases" style={{width: '80%'}}>
                <TableHead>
                  <TableRow>
                    <TableCell align="left" className={classes.tableCollapseHead}>Click</TableCell>
                    <TableCell align="left" className={classes.tableCollapseHead}>ExternalRef</TableCell>
                    <TableCell align="left" className={classes.tableCollapseHead}>Attached Files</TableCell>
                    <TableCell align="left" className={classes.tableCollapseHead}>Recipient Name</TableCell>
                    <TableCell align="left" className={classes.tableCollapseHead}>From Name</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell component="th" scope="row" className={classes.noborder}>{row.Click}</TableCell>
                    <TableCell align="left" className={classes.noborder}>{row.Ref}</TableCell>
                    <TableCell align="left" className={classes.noborder}>{row.attachedfiles}</TableCell>
                    <TableCell align="left" className={classes.noborder}>{row.Recipient}</TableCell>
                    <TableCell align="left" className={classes.noborder}>{row.FromName}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <Box style={{width: '20%'}}>
                <Box className={classes.floatRight}>
                  <IconButton>
                    <VisibilityIcon className={classes.black}/>
                  </IconButton>
                  <Typography display='block' align='center' className={classes.mtNeg15}>Show</Typography>
                </Box>
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
}

const DirectEmailReportTab=({
  classes,
  dispatch,
  windowSize,
  handleSearchInput=()=>null,
  handleSearching=()=>null,
  handlePageChange=()=>null,
  handleRowsPerPage=()=>null,
  clearSearch,
  page,
  rowsPerPage,
  searchData,
  isSearching,
  directEmailReport,
}) => {
  const rowsOptions=[6,12,18];
  const rowStyle={head: classes.tableRowHead,root: classes.tableRowRoot};
  const cellStyle={head: classes.tableCellHead,body: classes.tableCellBody,root: classes.tableCellRoot};
  const noborderCell={body: clsx(classes.tableCellBody,classes.noborder),root: classes.tableCellRoot};
  const {t}=useTranslation();

  const handleSearch= async() => {
    const { email = {} } = searchData || {};
    const { FromEmail='', ToEmail='', ExternalRef='', Status='', FromDate=null, ToDate=null  } = email || {};
    const param= { 
      FromDate,
      ToDate,
      Status,
      FromEmail,
      ToEmail,
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

    dispatch(getEmailReport(searchObjects))
    handleSearching('email', true);
    handlePageChange(1);
  }

  const handlePageSearching=(val)=>{
    let { email = {} } = searchData || {};
    let params={
      PageSize:rowsPerPage,
      PageIndex:val,
      ...email
    };
    handlePageChange(val);
    dispatch(getEmailReport(params));
  }

  const handleRowsPerPageSearching=async(val)=>{
    let { email = {} } = searchData || {};
    let params={
      PageSize:val,
      PageIndex:page,
      ...email
    }
    await dispatch(getEmailReport(params));
    handleRowsPerPage(val)
  }


  const renderDateFields=() => {
    const { email={} } = searchData || {};
    const { FromDate=null, ToDate=null } = email || {};

    const handleFromDate=(val)=> {
      let dateVal = moment(val).startOf('day').format('YYYY-MM-DD HH:mm') || null;
      handleSearchInput(dateVal,'FromDate', 'email')
    }

    const handleToDate=(val)=> {
      let dateVal = moment(val).endOf('day').format('YYYY-MM-DD HH:mm') || null;
      handleSearchInput(dateVal,'ToDate', 'email')
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
    const { email = {} } = searchData || {};
    const { FromEmail='', ToEmail='', Recipient='', ExternalRef='', Status='' } = email || {};
    return (
      <>
        <Grid item>
          <TextField
            type='tel'
            variant='outlined'
            size='small'
            value={FromEmail}
            onChange={(e)=>handleSearchInput(e.target.value,'FromEmail', 'email')}
            className={clsx(classes.textField,classes.minWidth252)}
            placeholder={t('report.FromEmail')}
          />
        </Grid>
        <Grid item>
          <TextField
            type='tel'
            variant='outlined'
            size='small'
            value={ToEmail}
            onChange={(e)=>handleSearchInput(e.target.value,'ToEmail', 'email')}
            className={clsx(classes.textField,classes.minWidth252)}
            placeholder={t('report.ToEmail')}
          />
        </Grid>
        <Grid item>
          <TextField
            variant='outlined'
            size='small'
            value={Recipient}
            onChange={(e)=>handleSearchInput(e.target.value,'Recipient', 'email')}
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
            onChange={(e)=>handleSearchInput(e.target.value,'ExternalRef', 'email')}
            className={clsx(classes.textField,classes.minWidth252)}
            placeholder={t('report.ExternalRef')}
          />
        </Grid>
        <Grid item>
          <TextField
            variant='outlined'
            size='small'
            value={Status}
            onChange={(e)=>handleSearchInput(e.target.value,'Status', 'email')}
            className={clsx(classes.textField,classes.minWidth252)}
            placeholder={t('common.Status')}
          />
        </Grid>
      </>
    )
  }

  const renderSearchLine=() => {
    const { email = false } = isSearching || {};
    return (
      <Grid container spacing={2} className={classes.lineTopMarging}>
        {renderAdvanceSearch()}
        <Grid item>
          <Button
            size='large'
            variant='contained'
            onClick={handleSearch}
            className={classes.searchButton}
            endIcon={<SearchIcon />}>
            {t('campaigns.btnSearchResource1.Text')}
          </Button>
          
        </Grid>

        {email?<Grid item>
          <Button
            size='large'
            variant='contained'
            onClick={()=>clearSearch('email')}
            className={classes.searchButton}
            endIcon={<ClearIcon />}>
            {t('common.clear')}
          </Button>
        </Grid>:null}
      </Grid>
    )
  }

  const renderTotalSection=()=>{
    const { TotalCredits=0, TotalSent=0 }=directEmailReport||{};
    const totalMessages=100000;
    return (
      <>
        <Box className={clsx(classes.mt25, classes.mb10, classes.reportPaperBgGray, classes.alignCenter)}>
          <Box>
            <Typography className={clsx(classes.bold, classes.colorBlue)}>
              {t('report.TotalCredits')}
            </Typography>
            <Typography align='center'  className={clsx(classes.colorBlue)}>
              {TotalCredits.toLocaleString()}
            </Typography>
          </Box>
          <Box className={classes.ml25}>
            <Typography className={clsx(classes.bold, classes.colorBlue)}>
              {t('report.TotalSent')}
            </Typography>
            <Typography align='center' className={clsx(classes.colorBlue)}>
              {TotalSent.toLocaleString()}
            </Typography>
          </Box>
        </Box>
        <Typography className={clsx(classes.colorGray, classes.mb5)}>
          {t('common.Total')} {totalMessages.toLocaleString()} {t('report.Messages')}
        </Typography>
      </>
    );
  }

  const renderTableHead=()=>{
    return (
      <TableHead>
        <TableRow
          classes={rowStyle}>
          <TableCell scope="row"
            style={{padding:'16px 0px', minWidth: 30}}
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
            className={classes.flexHalf}>
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
    let sortData=directEmailReport&&directEmailReport.DirectReport;

    if (!sortData) {
      return;
    }
    sortData=sortData.slice((page-1)*rowsPerPage,(page-1)*rowsPerPage+rowsPerPage)
    return (
      <TableBody className={classes.tableDirectRow}>
        {sortData.map(row=>windowSize==='xs'? renderPhoneRow:
          <RenderRow 
            classes={classes} 
            row={row} 
            noborderCell={noborderCell} 
            cellStyle={cellStyle} 
            rowStyle={rowStyle}/>
        )}
      </TableBody>
    )
  }

  const renderTable=()=>{
    return (
      <TableContainer className={classes.borderAround}>
        <Table className={clsx(classes.tableContainer, classes.noborder)}  aria-label="collapsible table">
          {windowSize!=='xs'&&renderTableHead()}
          {renderTableBody()}
        </Table>
      </TableContainer>
    )
  }

  const renderTablePagination=() => {
    const emailData = directEmailReport&&directEmailReport.TotalSent || 0;
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
      {renderSearchLine()}
      {renderTotalSection()}
      {renderTable()}
      {renderTablePagination()}
    </>
  );
}

export default DirectEmailReportTab