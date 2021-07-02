import { Box, Button, Divider, Grid, Tab,Typography} from '@material-ui/core';
import React,{useState,useEffect} from 'react';
import DefaultScreen from '../../DefaultScreen';
import {useTranslation} from 'react-i18next';
import {useSelector,useDispatch} from 'react-redux';
import clsx from 'clsx';
import { exportEmailReport, exportSMSReport, getEmailReport, getSMSReport } from '../../../redux/reducers/reportsSlice';
import moment from 'moment';
import DirectSMSReportTab from './DirectSmsReport';
import TabPanel from '@material-ui/lab/TabPanel';
import TabContext from '@material-ui/lab/TabContext';
import TabList from '@material-ui/lab/TabList';
import DirectEmailReportTab from './DirectEmailReport';

const DirectSendReport=({classes}) => {
  const {windowSize, isRTL}=useSelector(state => state.core);
  const {directEmailReport, directSmsReport}=useSelector(state => state.report);
  const [searchData, setSearchData]=useState({});
  const [isSearching,setSearching]=useState({});
  const [searchParam,setSearchParam]=useState({});
  const [tabValue, setTabValue]=useState(0);
  const rowsOptions=[6,12,18];
  const [rowsPerPageEmail,setRowsPerPageEmail]=useState(rowsOptions[0]);
  const [rowsPerPageSms,setRowsPerPageSms]=useState(rowsOptions[0]);
  const [pageEmail,setPageEmail]=useState(1);
  const [pageSms,setPageSms]=useState(1);
  const [advanceSearch,setAdvanceSearch]=useState(false);
  const [showContent,setShowContent]=useState(false);
  const {t}=useTranslation();
  const dispatch=useDispatch();

  const initData=()=>{
    getEmailReportData();
    getSMSReportData();
    setSearchData({
      email: {},
      sms: {}
    });
    setSearchParam({
      email: {},
      sms: {}
    })
  }

  const getEmailReportData=() => {
    const startDate = moment(new Date()).startOf('month').format('L');
    const endDate = moment(new Date()).endOf('month').format('L');
    dispatch(getEmailReport({FROMDATE: startDate, TODATE: endDate}));
  }
  const getSMSReportData=() => {
    dispatch(getSMSReport({PageSize:6, PageIndex: 1}));
  }

  useEffect(initData,[dispatch])

  const clearSearch=(key) => {
    let isSearchingData = isSearching;
    let search=searchData;
    let params=searchParam;
    search[key]={};
    params[key]={};
    isSearchingData[key]=false;

    setSearching({...isSearching});
    setSearchData(search);

    if (key==='sms') {
      getSMSReportData()
    }

    if (key==='email') {
      getEmailReportData()
    }

  }

  const handleSearchInput=(value,key,type)=>{
    let { sms = {}, email = {} } = searchData || {};
    if (type==='sms') {
      sms[key]=value;
    }
    if (type==='email') {
      email[key]=value;
    }

    setSearchData({email, sms});
  }

  const handleSearching=(key,value)=> {
    let isSearchingData = isSearching;
    isSearchingData[key]=value;

    setSearching({...isSearching})
  }

  const renderHeader=() => {
    return (
      <>
        <Typography className={classes.managementTitle}>
          {t('report.DirectSendReport')}
        </Typography>
        <Divider />
      </>
    )
  }

  const renderTabs=()=>{
    const handleExportFile=()=> {
      if (tabValue===0) {
        dispatch(exportEmailReport())
      }

      if (tabValue===1) {
        dispatch(exportSMSReport())
      }
    }

    return (
      <Grid container>
        <TabContext value={tabValue}>
          <Grid 
            container 
            justify='space-between' 
            alignItems='center'
            item xs={12} 
            className={classes.borderBottom1}>
            <TabList
              onChange={(e, value) => setTabValue(value)}
              indicatorColor="primary"
              >
              <Tab label={t('master.lblUserMailResource1.Text')} classes={{root: classes.minWidth100}} value={0}/>
              <Tab label={t('appBar.sms.title')} classes={{root: classes.minWidth100}} value={1}/>
            </TabList>
            <Button className={clsx(classes.actionButtonGreen, classes.exportButton)} onClick={handleExportFile}>
              {t('campaigns.exportFile')}
              <Box className={clsx(classes.pulseemIcon, classes.f20)}>
                {'\uE17B'}
              </Box>
            </Button>
          </Grid>
          <Grid item xs={12} className={classes.lastReportsTabPanels}>
            <TabPanel value={0} index={0} className={classes.p0}>
              <DirectEmailReportTab
                classes={classes}
                dispatch={dispatch}
                windowSize={windowSize}
                isRTL={isRTL}
                handleSearchInput={handleSearchInput}
                handleSearching={handleSearching}
                handlePageChange={setPageEmail}
                handleRowsPerPage={setRowsPerPageEmail}
                clearSearch={clearSearch}
                page={pageEmail}
                rowsPerPage={rowsPerPageEmail}
                searchData={searchData}
                isSearching={isSearching}
                directEmailReport={directEmailReport}
              />
            </TabPanel>
            <TabPanel value={1} index={1} className={classes.p0}>
              <DirectSMSReportTab
                classes={classes}
                dispatch={dispatch}
                windowSize={windowSize}
                isRTL={isRTL}
                handleSearchInput={handleSearchInput}
                handleSearching={handleSearching}
                handlePageChange={setPageSms}
                handleRowsPerPage={setRowsPerPageSms}
                handleAdvanceSearch={setAdvanceSearch}
                handleShowContent={setShowContent}
                clearSearch={clearSearch}
                page={pageSms}
                rowsPerPage={rowsPerPageSms}
                searchData={searchData}
                isSearching={isSearching}
                directSmsReport={directSmsReport}
                showContent={showContent}
                advanceSearch={advanceSearch}
              />
            </TabPanel>
          </Grid>
        </TabContext>

      </Grid>
    )
  }

  return (
    <DefaultScreen
      currentPage='reports'
      classes={classes}>
      {renderHeader()}
      {renderTabs()}
    </DefaultScreen>
  );
}

export default DirectSendReport