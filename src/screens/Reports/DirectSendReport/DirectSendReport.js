import { Button, Grid, Tab, Tabs } from '@material-ui/core';
import { useState, useEffect } from 'react';
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
import { exportNewsletterDirectReport, getNewsletterDirectReport, exportArchiveEmailDirectReport, getArchiveDirectReport } from '../../../redux/reducers/newsletterSlice';
import { exportSMSDirectReport, getSMSDirectReport, getArchiveSMSDirectReport, exportArchiveSmsDirect } from '../../../redux/reducers/smsSlice';
import { ExportFile } from '../../../helpers/Export/ExportFile';
import { HandleExportData } from '../../../helpers/Export/ExportHelper';
import { Loader } from '../../../components/Loader/Loader';
import { EmailStatus, SmsStatus } from '../../../helpers/Constants';
import ConfirmRadioDialog from '../../../components/DialogTemplates/ConfirmRadioDialog';
import { ExportFileTypes } from '../../../model/Export/ExportFileTypes';
import CustomTooltip from '../../../components/Tooltip/CustomTooltip';
import { useSearchParams } from 'react-router-dom';
import { Title } from '../../../components/managment/Title';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { sitePrefix } from '../../../config';

const DirectSendReport = ({ classes, isArchive = false, ...props }) => {
  const [searchParams] = useSearchParams();
  const { showContent } = useSelector(state => state.report);
  const { accountFeatures, windowSize, isRTL, rowsPerPage } = useSelector(state => state.core);
  const { directNewsletterReport } = useSelector(state => state.newsletter);
  const { directSmsReport } = useSelector(state => state.sms);
  const [searchData, setSearchData] = useState({});
  const [isSearching, setSearching] = useState({});
  const [tabValue, setTabValue] = useState(0);
  const rowsOptions = [6, 10, 20, 50];
  const [pageEmail, setPageEmail] = useState(1);
  const [pageSms, setPageSms] = useState(1);
  const [advanceSearch, setAdvanceSearch] = useState(false);
  const [showLoader, setLoader] = useState(true);
  const [exportEnable, setExportEnable] = useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const MAX_EXPORT_RECORDS = 600000;
  const [dialogType, setDialog] = useState(null);


  useEffect(() => {
    const reportTypeQS = searchParams.get('t');
    setTabValue(reportTypeQS ? parseInt(reportTypeQS) : 0);
  }, [searchParams])

  const defaultsDates = {
    archive: {
      from: moment({ hour: 0, minute: 0, second: 0 }).subtract(4, 'month').format('YYYY-MM-DD HH:mm'),
      to: moment({ hour: 23, minute: 59, second: 59 }).subtract(3, 'month').format('YYYY-MM-DD HH:mm')

    },
    current: {
      from: moment({ hour: 0, minute: 0, second: 0 }).startOf('month').format('YYYY-MM-DD HH:mm'),
      to: moment({ hour: 23, minute: 59, second: 59 }).format('YYYY-MM-DD HH:mm')
    }
  }

  const defaultRequests = {
    Email: {
      Archive: {
        PageSize: rowsPerPage,
        PageIndex: 1,
        FromDate: defaultsDates.archive.from,
        ToDate: defaultsDates.archive.to
      },
      Default: {
        PageIndex: 1,
        PageSize: rowsPerPage,
        FromDate: defaultsDates.current.from,
        ToDate: defaultsDates.current.to
      }
    },
    SMS: {
      Archive: {
        PageIndex: 1,
        PageSize: rowsPerPage,
        FromDate: defaultsDates.archive.from,
        ToDate: defaultsDates.archive.to,
        ShowContent: showContent
      },
      Default: {
        PageSize: rowsPerPage,
        PageIndex: 1,
        FromDate: defaultsDates.current.from,
        ToDate: defaultsDates.current.to,
        ShowContent: showContent
      }
    }
  };
  const getEmailReportData = async () => {
    await dispatch(isArchive ? getArchiveDirectReport(defaultRequests.Email.Archive) : getNewsletterDirectReport(defaultRequests.Email.Default));
  }
  const getSMSReportData = async () => {
    await dispatch(isArchive ? getArchiveSMSDirectReport(defaultRequests.SMS.Archive) : getSMSDirectReport(defaultRequests.SMS.Default));
  }

  const handleExportEnable = () => {
    if (tabValue === 0) {
      if (Object.keys(directSmsReport).length > 0 && directSmsReport.DirectReport !== null) {
        setExportEnable(directSmsReport.TotalSent > 0 && directSmsReport.TotalSent < MAX_EXPORT_RECORDS)
      }
      else {
        setExportEnable(false);
      }
    } else {
      if (Object.keys(directNewsletterReport).length > 0 && directNewsletterReport.DirectReport !== null) {
        setExportEnable(directNewsletterReport.TotalRecords > 0 && directNewsletterReport.TotalRecords < MAX_EXPORT_RECORDS)
      }
      else {
        setExportEnable(false);
      }
    }
  }

  useEffect(() => {
    const initData = async () => {
      setLoader(true);
      setSearchData({
        email: {
          FromDate: isArchive ? defaultsDates.archive.from : defaultsDates.current.from,
          ToDate: isArchive ? defaultsDates.archive.to : defaultsDates.current.to
        },
        sms: {
          FromDate: isArchive ? defaultsDates.archive.from : defaultsDates.current.from,
          ToDate: isArchive ? defaultsDates.archive.to : defaultsDates.current.to,
          ShowContent: showContent
        }
      });
      await getEmailReportData();
      await getSMSReportData();

      setLoader(false);
    }
    initData();
  }, [dispatch])

  useEffect(handleExportEnable, [tabValue, directNewsletterReport, directSmsReport])

  const clearSearch = async (key) => {
    setLoader(true);
    let isSearchingData = isSearching;
    let search = searchData;
    search[key] = {};
    isSearchingData[key] = false;

    if (isArchive) {
      search[key]["FromDate"] = defaultsDates.archive.from
      search[key]["ToDate"] = defaultsDates.archive.to
    }
    else {
      search[key]["FromDate"] = defaultsDates.current.from
      search[key]["ToDate"] = defaultsDates.current.to
    }

    setSearching({ ...isSearching });
    setSearchData(search);

    if (key === 'sms') {
      search[key]["ShowContent"] = searchData[key]["ShowContent"];
      setPageSms(1);
      await getSMSReportData()
    }

    if (key === 'email') {
      setPageEmail(1);
      await getEmailReportData()
    }
    setLoader(false);

  }

  const handleSearchInput = (value, key, type) => {
    let { sms = {}, email = {} } = searchData || {};
    if (key !== 'ShowContent') {
      type === 'sms' ? setPageSms(1) : setPageEmail(1);
    }
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
      "Attachments": t("mainReport.attachments"),
      "ClientStatus": t('report.clientStatus'),
      "StatusDescription": t('report.StatusDescription'),
      "ErrorData": t('report.errorReason')
    },
    SMS: {
      "DATE": t('common.CreationDate'),
      "MESSAGE": t('common.messageContent'),
      "FROM": t('common.SentFromNumber'),
      "TO": t('common.SendTo2'),
      "REFERENCE": t('report.id'),
      "STATUS": t('common.Status'),
      "ERRORCODE": t('report.errorCode'),
      "TOTALRESPONSES": t('report.totalResponses'),
      "CHARSCOUNT": t('report.Characters'),
      "Credits": t('report.Credits'),
      "StatusDescription": t('report.StatusDescription'),
      "ClientStatus": t('report.clientStatus')
    }
  };

  const handleExportFile = async (formatType) => {
    setLoader(true);
    let response, fileName = null;

    if (tabValue === 0) {
      searchData.sms.ShowContent = showContent;
      response = dispatch(isArchive ? exportArchiveSmsDirect(searchData.sms) : exportSMSDirectReport(searchData.sms));

      const exportOption = {
        OrderItems: true,
        FormatDate: true,
        ConvertStatusToString: false,
        ConvertStatusDescription: true,
        Statuses: SmsStatus,
        ReplaceClientStatus: true,
        DeleteProperties: [showContent === false ? 'MESSAGE' : ''],
        Order: Object.keys(excelHeaders.SMS)
      };

      try {
        const result = await HandleExportData(response.payload, exportOption);

        fileName = isArchive ? "Archive_Sms_DirectReports" : "Sms_DirectReports";
        ExportFile({
          data: result,
          fileName: fileName,
          exportType: 'csv',
          fields: excelHeaders.SMS
        });
      } catch (e) {
        console.log(e);
      }
      finally {
        setLoader(false);
      }

    }

    if (tabValue === 1) {
      response = dispatch(isArchive ? exportArchiveEmailDirectReport(searchData.email) : exportNewsletterDirectReport(searchData.email))
      const exportOptions = {
        OrderItems: true,
        FormatDate: true,
        ConvertStatusToString: false,
        ConvertStatusDescription: true,
        Statuses: EmailStatus,
        ReplaceClientStatus: true,
        PropertyToReplace: "Status",
        PropertyDefaultReplaceValue: t('emailStatus.noAttachments'),
        ReplaceNull: true,
        DeleteProperties: ['Status', isArchive ? "CreatedDate" : ''],
        Order: Object.keys(excelHeaders.EMAIL)
      };

      try {
        const result = await HandleExportData(response.payload, exportOptions);

        fileName = isArchive ? "Archive_Email_DirectReports" : "Email_DirectReports";
        ExportFile({
          data: result,
          fileName: fileName,
          exportType: 'csv',
          fields: excelHeaders.EMAIL
        });
      } catch (e) {
        console.log(e);
      }
      finally {
        setLoader(false);
      }
    }
  }
  const renderTabs = () => {
    return (
      <Grid container>
        <TabContext value={tabValue}>
          <Grid
            container
            justifyContent='space-between'
            alignItems='center'
            item xs={12}
            className={clsx(classes.directSendTabSection)}>

            <Tabs
              value={tabValue}
              onChange={(e, value) => { setAdvanceSearch(tabValue !== value ? false : advanceSearch); setTabValue(value) }}
              className={clsx(classes.tab, classes.tablistRoot)}
              classes={{ indicator: classes.hideIndicator }}
            >
              <Tab label={t('appBar.sms.title')} classes={{ root: classes.btnTab, selected: classes.currentActiveTab }} value={0} />
              <Tab label={t('master.lblUserMailResource1.Text')} classes={{ root: classes.btnTab, selected: classes.currentActiveTab }} value={1} />
            </Tabs>
            <Grid item>
              {!isArchive && <Button
                onClick={() => {
                  window.location = `${sitePrefix}Reports/DirectSendReport/Archive/?t=${tabValue}`
                }}
                className={clsx(
                  classes.btn, classes.btnRounded
                )}
                endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
              >
                {t('master.campaignsArchive')}
              </Button>}
              {accountFeatures?.indexOf('13') === -1 && windowSize !== 'xs' && <CustomTooltip
                style={{ fontSize: 14 }}
                text={t('report.ExportLimitation')}
                icon={<Button
                  className={clsx(
                    classes.btn, classes.btnRounded,
                    exportEnable === false ? classes.disabled : ''
                  )}
                  onClick={() => setDialog('exportFormat')}
                  endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                >
                  {t('campaigns.exportFile')}
                </Button>}
              >

              </CustomTooltip>
              }
            </Grid>
          </Grid>
          <Grid item xs={12} className={classes.lastReportsTabPanels}>
            <TabPanel value={0} index={0} className={classes.p0}>
              <DirectSMSReportTab
                classes={classes}
                title={isArchive ? t('report.ArchiveDirectSendReport') : t('report.DirectSendReport')}
                dispatch={dispatch}
                windowSize={windowSize}
                isRTL={isRTL}
                handleSearchInput={handleSearchInput}
                handleSearching={handleSearching}
                handlePageChange={setPageSms}
                handleAdvanceSearch={setAdvanceSearch}
                clearSearch={clearSearch}
                page={pageSms}
                rowsPerPage={rowsPerPage}
                searchData={searchData}
                isSearching={isSearching}
                directSmsReport={directSmsReport}
                advanceSearch={advanceSearch}
                setLoader={setLoader}
                rowsOptions={rowsOptions}
                isArchive={isArchive}
              />

            </TabPanel>
            <TabPanel value={1} index={1} className={classes.p0}>
              <DirectEmailReportTab
                classes={classes}
                title={isArchive ? t('report.ArchiveDirectSendReport') : t('report.DirectSendReport')}
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
                directEmailReport={directNewsletterReport}
                rowsOptions={rowsOptions}
                advanceSearch={advanceSearch}
                isArchive={isArchive}
              />
            </TabPanel>
          </Grid>
        </TabContext>

      </Grid>
    )
  }

  return (
    <DefaultScreen
      subPage={isArchive ? 'directSendReportArchive' : 'directSendReport'}
      currentPage='reports'
      classes={classes}
      containerClass={clsx(classes.management, classes.mb50)}>
      {renderTabs()}
      <ConfirmRadioDialog
        classes={classes}
        isOpen={dialogType === 'exportFormat'}
        title={t('campaigns.exportFile')}
        radioTitle={t('common.SelectFormat')}
        onConfirm={(e) => handleExportFile(e)}
        onCancel={() => setDialog(null)}
        cookieName={'exportFormat'}
        defaultValue="xls"
        options={ExportFileTypes}
      />
      <Loader isOpen={showLoader} showBackdrop={true} />
    </DefaultScreen>
  );
}

export default DirectSendReport