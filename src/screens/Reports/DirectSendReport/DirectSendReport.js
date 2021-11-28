import { Box, Button, Divider, Grid, Tab, Typography } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import DefaultScreen from '../../DefaultScreen';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';
import moment from 'moment';
import DirectSMSReportTab from './DirectSmsReport';
import TabPanel from '@material-ui/lab/TabPanel';
import TabContext from '@material-ui/lab/TabContext';
import TabList from '@material-ui/lab/TabList';
import DirectEmailReportTab from './DirectEmailReport';
import { exportNewsletterDirectReport, getNewsletterDirectReport } from '../../../redux/reducers/newsletterSlice';
import { exportSMSDirectReport, getSMSDirectReport } from '../../../redux/reducers/smsSlice';
import { preferredOrder, switchStatusDescription } from '../../../helpers/functions';
import { exportFile } from '../../../helpers/exportFromJson';
import { Loader } from '../../../components/Loader/Loader';
import { EmailStatus, SmsStatus } from '../../../helpers/PulseemArrays';

const DirectSendReport = ({ classes }) => {
  const { windowSize, isRTL } = useSelector(state => state.core);
  const { directNewsletterReport } = useSelector(state => state.newsletter);
  const { directSmsReport } = useSelector(state => state.sms);
  const [searchData, setSearchData] = useState({});
  const [isSearching, setSearching] = useState({});
  const [searchParam, setSearchParam] = useState({});
  const [tabValue, setTabValue] = useState(0);
  const rowsOptions = [6, 10, 20, 50];
  const [rowsPerPageEmail, setRowsPerPageEmail] = useState(rowsOptions[0]);
  const [rowsPerPageSms, setRowsPerPageSms] = useState(rowsOptions[0]);
  const [pageEmail, setPageEmail] = useState(1);
  const [pageSms, setPageSms] = useState(1);
  const [advanceSearch, setAdvanceSearch] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showLoader, setLoader] = useState(true);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const initData = () => {
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

  const getEmailReportData = () => {
    dispatch(getNewsletterDirectReport({  }));
  }
  const getSMSReportData = async () => {
    await dispatch(getSMSDirectReport({ PageSize: 6, PageIndex: 1 }));
    setLoader(false);
  }

  useEffect(initData, [dispatch])

  const clearSearch = (key) => {
    let isSearchingData = isSearching;
    let search = searchData;
    let params = searchParam;
    search[key] = {};
    params[key] = {};
    isSearchingData[key] = false;

    setSearching({ ...isSearching });
    setSearchData(search);

    if (key === 'sms') {
      getSMSReportData()
    }

    if (key === 'email') {
      getEmailReportData()
    }

  }

  const handleSearchInput = (value, key, type) => {
    let { sms = {}, email = {} } = searchData || {};
    if (type === 'sms') {
      sms[key] = value;
    }
    if (type === 'email') {
      email[key] = value;
    }

    setSearchData({ email, sms });
  }

  const handleSearching = (key, value) => {
    let isSearchingData = isSearching;
    isSearchingData[key] = value;

    setSearching({ ...isSearching })
  }

  const renderHeader = () => {
    return (
      <>
        <Typography className={classes.managementTitle}>
          {t('report.DirectSendReport')}
        </Typography>
        <Divider />
      </>
    )
  }

  const excelHeaders = {
    EMAIL: {
      "CreatedDate": t('common.CreationDate'),
      "Status": t('common.Status'),
      "ToEmail": t('report.ToEmail'),
      "ToName": t('report.ToName'),
      "FromEmail": t('report.FromEmail'),
      "FromName": t('report.FromName'),
      "Subject": t('report.Subject'),
      "SendDate": t('report.SendDate'),
      "ExternalRef": t('report.ExternalRef'),
      "OpenCount": t('mainReport.openCount'),
      "ClickCount": t('mainReport.clickCount'),
      "ClientStatus": t('report.clientStatus'),
      "StatusDescription": t('report.StatusDescription')
    },
    SMS: {
      "SMSCampaignID": t('common.campaignID'),
      "Date": t('common.CreationDate'),
      "Text": t('common.MessageContent'),
      "FromNumber": t('common.SentFromNumber'),
      "ToNumber": t('common.SendTo2'),
      "Reference": t('report.id'),
      "Status": t('common.Status'),
      "ErrorType": t('report.errorCode'),
      "TotalResponses": t('report.totalResponses'),
      "CharCount": t('report.Characters'),
      "Credits": t('report.Credits'),
      "ClientStatus": t('report.clientStatus'),
      "StatusDescription": t('report.StatusDescription')
    }
  };

  const renderTabs = () => {
    const handleExportFile = async () => {
      setLoader(true);
      let response, finalData, headers, fileName = null;

      if (tabValue === 0) {
        response = await dispatch(exportNewsletterDirectReport(searchData.email))
        finalData = preferredOrder(response.payload, Object.keys(excelHeaders.EMAIL));
        finalData = switchStatusDescription(finalData, EmailStatus);
        headers = excelHeaders.EMAIL;
        fileName = "Email_DirectReports";
      }

      if (tabValue === 1) {
        response = await dispatch(exportSMSDirectReport(searchData.sms));
        finalData = preferredOrder(response.payload, Object.keys(excelHeaders.SMS));
        finalData = switchStatusDescription(finalData, SmsStatus);
        headers = excelHeaders.SMS;
        fileName = "Sms_DirectReports";
      }

      exportFile({
        data: finalData,
        fileName: fileName,
        exportType: 'xls',
        fields: headers
      });
      setLoader(false);
    }

    return (
      <Grid container>
        <TabContext value={tabValue}>
          <Grid
            container
            justifyContent='space-between'
            alignItems='center'
            item xs={12}
            className={classes.borderBottom1}>
            <TabList
              onChange={(e, value) => setTabValue(value)}
              indicatorColor="primary"
            >
              <Tab label={t('master.lblUserMailResource1.Text')} classes={{ root: classes.minWidth100 }} value={0} />
              <Tab label={t('appBar.sms.title')} classes={{ root: classes.minWidth100 }} value={1} />
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
                directEmailReport={directNewsletterReport}
                rowsOptions={rowsOptions}
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
                setLoader={setLoader}
                rowsOptions={rowsOptions}
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
      classes={classes}
      containerClass={classes.management}>
      {renderHeader()}
      {renderTabs()}
      <Loader isOpen={showLoader} showBackdrop={true} />
    </DefaultScreen>
  );
}

export default DirectSendReport