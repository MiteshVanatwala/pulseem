import { Box, Button, Divider, Grid, Tab, Typography } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import DefaultScreen from '../../../DefaultScreen';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';
import moment from 'moment';
import DirectSMSReportTab from './DirectSmsReport';
import TabPanel from '@material-ui/lab/TabPanel';
import TabContext from '@material-ui/lab/TabContext';
import TabList from '@material-ui/lab/TabList';
import DirectEmailReportTab from './DirectEmailReport';
import { exportArchiveEmailDirectReport, getArchiveDirectReport } from '../../../../redux/reducers/newsletterSlice';
import { exportArchiveSmsDirect, getArchiveSMSDirectReport } from '../../../../redux/reducers/smsSlice';
import { preferredOrder, switchStatusDescription } from '../../../../helpers/functions';
import { exportFile } from '../../../../helpers/exportFromJson';
import { Loader } from '../../../../components/Loader/Loader';
import { EmailStatus, SmsStatus } from '../../../../helpers/PulseemArrays';
import { setCookie, getCookie } from '../../../../helpers/cookies';
import { setRowsPerPage } from '../../../../redux/reducers/coreSlice';
import queryString from 'query-string';

const DirectSendReport = ({ classes, ...props }) => {
  const qs = queryString.parse(props.location.search);
  const { windowSize, isRTL, rowsPerPage } = useSelector(state => state.core);
  const { archiveDirectNewsletterReport } = useSelector(state => state.newsletter);
  const { archiveDirectSmsReport } = useSelector(state => state.sms);
  const [searchData, setSearchData] = useState({});
  const [isSearching, setSearching] = useState({});
  const [searchParam, setSearchParam] = useState({});
  const [tabValue, setTabValue] = useState((qs.t ? parseInt(qs.t) : null) || 0);
  const rowsOptions = [6, 10, 20, 50];
  const [pageEmail, setPageEmail] = useState(1);
  const [pageSms, setPageSms] = useState(1);
  const [advanceSearch, setAdvanceSearch] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showLoader, setLoader] = useState(true);
  const [exportEnable, setExportEnable] = useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const initData = () => {
    setSearchData({
      email: {
        PageIndex: 1,
        FromDate: null,
        ToDate: moment().subtract(1, 'year').format('YYYY-MM-DD HH:mm')
      },
      sms: {
        PageIndex: 1,
        FromDate: null,
        ToDate: moment().subtract(1, 'year').format('YYYY-MM-DD HH:mm')
      }
    });
    getEmailReportData();
    getSMSReportData();
    setSearchParam({
      email: {},
      sms: {}
    })
  }

  const getEmailReportData = async () => {
    setLoader(true);
    await dispatch(getArchiveDirectReport({
      PageIndex: 1,
      PageSize: rowsPerPage,
      FromDate: null,
      ToDate: moment().subtract(1, 'year').format('YYYY-MM-DD HH:mm')
    }));
    setLoader(false);
  }
  const getSMSReportData = async () => {
    setLoader(true);
    await dispatch(getArchiveSMSDirectReport({
      PageSize: rowsPerPage,
      PageIndex: 1,
      FromDate: null,
      ToDate: moment().subtract(1, 'year').format('YYYY-MM-DD HH:mm')
    }));
    setLoader(false);
  }

  const handleExportEnable = () => {
    if (tabValue === 0) {
      setExportEnable(Object.keys(archiveDirectNewsletterReport).length > 0 && archiveDirectNewsletterReport.DirectReport !== null ? true : false)
    } else {
      setExportEnable(Object.keys(archiveDirectSmsReport).length > 0 && archiveDirectSmsReport.DirectReport !== null ? true : false)
    }
  }

  useEffect(initData, [dispatch])

  useEffect(handleExportEnable, [tabValue, archiveDirectNewsletterReport, archiveDirectSmsReport])

  const clearSearch = async (key) => {
    let isSearchingData = isSearching;
    let search = searchData;
    let params = searchParam;
    search[key] = {};
    params[key] = {};
    isSearchingData[key] = false;

    setSearching({ ...isSearching });
    setSearchData(search);

    if (key === 'sms') {
      await getSMSReportData()
    }

    if (key === 'email') {
      await getEmailReportData()
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
          {t('report.ArchiveDirectSendReport')}
        </Typography>
        <Divider />
      </>
    )
  }

  const excelHeaders = {
    EMAIL: {
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
      "PID": t('common.campaignID'),
      "DATE": t('common.CreationDate'),
      "MESSAGE": t('common.MessageContent'),
      "FROM": t('common.SentFromNumber'),
      "TO": t('common.SendTo2'),
      "REFERENCE": t('report.id'),
      "STATUS": t('common.Status'),
      "ERRORCODE": t('report.errorCode'),
      "TOTALRESPONSES": t('report.totalResponses'),
      "CHARSCOUNT": t('report.Characters'),
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
        response = await dispatch(exportArchiveEmailDirectReport(searchData.email))
        finalData = preferredOrder(response.payload, Object.keys(excelHeaders.EMAIL));
        finalData = switchStatusDescription(finalData, EmailStatus);
        headers = excelHeaders.EMAIL;
        fileName = "Email_DirectReports";
      }

      if (tabValue === 1) {
        response = await dispatch(exportArchiveSmsDirect(searchData.sms));
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
              onChange={(e, value) => { setAdvanceSearch(tabValue !== value ? false : advanceSearch); setTabValue(value) }}
              indicatorColor="primary"
            >
              <Tab label={t('master.lblUserMailResource1.Text')} classes={{ root: classes.minWidth100 }} value={0} />
              <Tab label={t('appBar.sms.title')} classes={{ root: classes.minWidth100 }} value={1} />
            </TabList>
            {windowSize !== 'xs' && <Button className={clsx(classes.actionButtonGreen, classes.exportButton, exportEnable === false ? classes.disabled : '')} onClick={handleExportFile}>
              {t('campaigns.exportFile')}
              <Box className={clsx(classes.pulseemIcon, classes.f20)}>
                {'\uE17B'}
              </Box>
            </Button>}
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
                handleAdvanceSearch={(isAdanceSearchRequested) => {
                  setAdvanceSearch(isAdanceSearchRequested)
                }}
                clearSearch={clearSearch}
                page={pageEmail}
                rowsPerPage={rowsPerPage}
                searchData={searchData}
                isSearching={isSearching}
                directEmailReport={archiveDirectNewsletterReport}
                rowsOptions={rowsOptions}
                advanceSearch={advanceSearch}
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
                handleAdvanceSearch={setAdvanceSearch}
                handleShowContent={setShowContent}
                clearSearch={clearSearch}
                page={pageSms}
                rowsPerPage={rowsPerPage}
                searchData={searchData}
                isSearching={isSearching}
                directSmsReport={archiveDirectSmsReport}
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
      subPage='directSendReportArchive'
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