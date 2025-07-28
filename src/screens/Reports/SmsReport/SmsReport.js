import React, { useState, useEffect, useRef } from 'react';
import DefaultScreen from '../../DefaultScreen';
import clsx from 'clsx';
import {
  Typography, Table, TableBody, TableRow, TableHead, TableCell, TableContainer, Grid, Button, TextField, Box, FormControlLabel, Tooltip, Checkbox
} from '@material-ui/core'
import {
  TablePagination, DateField
} from '../../../components/managment/index'
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import 'moment/locale/he';
import { getSmsReport, getSmsGraph } from '../../../redux/reducers/smsSlice';
import { Loader } from '../../../components/Loader/Loader';
import { ExportFile } from '../../../helpers/Export/ExportFile';
import { DateFormats, SizeOptionsOfHandHeldDevices, smsReportStatus } from '../../../helpers/Constants';
import { HandleExportData } from '../../../helpers/Export/ExportHelper';
import GraphReport from '../../../components/Reports/GraphReport';
import { useNavigate, useLocation } from 'react-router';
import { CLIENT_CONSTANTS } from '../../../model/Clients/Contants';
import { VoidFunction } from '../../../helpers/Types/common';
import { SetPageState, GetPageNyName, ClearPageState } from '../../../helpers/UI/SessionStorageManager';
import ConfirmRadioDialog from '../../../components/DialogTemplates/ConfirmRadioDialog';
import { ExportFileTypes } from '../../../model/Export/ExportFileTypes';
import { Title } from '../../../components/managment/Title';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import { RenderHtml } from '../../../helpers/Utils/HtmlUtils';
import { getCookie, setCookie } from '../../../helpers/Functions/cookies';
import PulseemSwitch from '../../../components/Controlls/PulseemSwitch';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { sitePrefix } from '../../../config';
import { PulseemFeatures } from '../../../model/PulseemFields/Fields';
import queryString from 'query-string';
import { LinksClicksReport } from '../../../config/enum';

const SmsReport = ({ classes }) => {
  const priorDate = moment().subtract(30, 'days').utcOffset(0);
  priorDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
  const navigate = useNavigate();
  const { state } = useLocation();
  const from = state?.from || "/";
  const { accountFeatures, currencySymbol, isCurrencySymbolPrefix } = useSelector(state => state.common);
  const { language, windowSize, isRTL, userRoles } = useSelector(state => state.core)
  const { smsReport, smsGraph } = useSelector(state => state.sms)
  const { t } = useTranslation()
  const rowsOptions = [6, 10, 20, 50]
  const [rowsPerPage, setRowsPerPage] = useState(rowsOptions[0])
  const [page, setPage] = useState(1)
  const [isSearching, setSearching] = useState(false)
  const dispatch = useDispatch()
  const rowStyle = { head: classes.tableRowReportHead, root: clsx(classes.tableRowRoot) }
  const cellStyle = { head: classes.tableCellHead, root: clsx(classes.tableCellRoot, classes.paddingHead) }
  const cell50wStyle = { head: clsx(classes.tableCellHead), root: clsx(classes.tableCellRoot, classes.paddingHead, classes.minWidth50) }
  const cellBodyStyle = { body: clsx(classes.tableCellBody), root: clsx(classes.tableCellRoot) }
  const noBorderCellStyle = { body: classes.tableCellBodyNoBorder, root: clsx(classes.tableCellRoot, classes.minWidth50) }
  const borderCellStyle = { body: clsx(classes.tableCellBody), root: clsx(classes.tableCellRoot, classes.minWidth50) }
  const [showLoader, setLoader] = useState(true);
  const [smsQuery, setSmsQuery] = useState({ SerachTxt: '', From: priorDate, To: null, ShowTestCampaigns: false, SmsCampaignID: null })
  const [hasRevenue, setHasRevenue] = useState(false);
  const [showNoticeDialog, setShowNoticeDialog] = useState(false);
  const [dialogType, setDialogType] = useState(null);
  const qs = (window.location.search && queryString.parse(window.location.search)) || state;

  moment.locale(language)

  const getHrefs = (id, Name) => ({
    TotalSendTo: {
      href: `/Pulseem/ClientSearchResult.aspx?TotalCountSMSCampaignID=${id}&Culture=${isRTL ? 'he-IL' : 'en-US'}`,
      onClick: () => !userRoles?.HideRecipients && navigate(CLIENT_CONSTANTS.BASEURL, {
        state: {
          ...CLIENT_CONSTANTS.QUERY_PARAMS, CampaignID: id, PageType: CLIENT_CONSTANTS.PAGE_TYPES.TotalCountSMSCampaignID,
          FromDate: smsQuery.From ? moment(smsQuery.From).format(DateFormats.FULL_DATE_START) : null,
          ToDate: smsQuery.To ? moment(smsQuery.To).format(DateFormats.FULL_DATE_START) : null,
          PageProperty: GetPageNyName('reports/SMSMainReport')
        }
      }),
    },
    ClickCountUnique: {
      title: t('common.Unique'),
      onClick: () => {
        if (userRoles?.HideRecipients) {
          return;
        }
        navigate(`${sitePrefix}reports/LinksClicksReport`, {
          state: {
            type: LinksClicksReport.SMS,
            campaignId: id,
            campaignName: Name,
            isVerified: false
          }
        })
      }
    },
    VerifiedCount: {
      title: t('mainReport.verifiedCount'),
      onClick: () => {
        if (userRoles?.HideRecipients) {
          return;
        }
        navigate(`${sitePrefix}reports/LinksClicksReport`, {
          state: {
            type: LinksClicksReport.SMS,
            campaignId: id,
            campaignName: Name,
            isVerified: true
          }
        })
      }
    },
    ClickCount: {
      title: SizeOptionsOfHandHeldDevices.indexOf(windowSize) > -1 ? t('common.Total') : t('common.Clicks'),
      href: null,
      onClick: null
    },
    PercetangeClicks: {
      title: t('mainReport.locUniqueClicksPercents.HeaderText'),
      href: `/Pulseem/LinksClicksReport.aspx?CampaignID=${id}&fromreact=true&Culture=${isRTL ? 'he-IL' : 'en-US'}`,
      onClick: () => {
        if (userRoles?.HideRecipients) {
          return;
        }
        window.location = `/Pulseem/LinksClicksReport.aspx?CampaignID=${id}&fromreact=true&Culture=${isRTL ? 'he-IL' : 'en-US'}`
      }
    },
    Failed: {
      title: SizeOptionsOfHandHeldDevices.indexOf(windowSize) > -1 ? '' : t("common.failedStatus"),
      href: `/Pulseem/ClientSearchResult.aspx?FailureCountSMSCampaignID=${id}&Culture=${isRTL ? 'he-IL' : 'en-US'}`,
      onClick: () => !userRoles?.HideRecipients && navigate(CLIENT_CONSTANTS.BASEURL, {
        state: {
          ...CLIENT_CONSTANTS.QUERY_PARAMS, CampaignID: id, PageType: CLIENT_CONSTANTS.PAGE_TYPES.FailureCountSMSCampaignID,
          FromDate: smsQuery.From ? moment(smsQuery.From).format(DateFormats.FULL_DATE_START) : null,
          ToDate: smsQuery.To ? moment(smsQuery.To).format(DateFormats.FULL_DATE_START) : null,
          PageProperty: GetPageNyName('reports/SMSMainReport')
        }
      })
    },
    Removed: {
      title: SizeOptionsOfHandHeldDevices.indexOf(windowSize) > -1 ? '' : t('mainReport.removed'),
      onClick: () => !userRoles?.HideRecipients && navigate(CLIENT_CONSTANTS.BASEURL, {
        state: {
          ...CLIENT_CONSTANTS.QUERY_PARAMS, CampaignID: id, PageType: CLIENT_CONSTANTS.PAGE_TYPES.RemovedCountSMSCampaignID,
          FromDate: smsQuery.From ? moment(smsQuery.From).format(DateFormats.FULL_DATE_START) : null,
          ToDate: smsQuery.To ? moment(smsQuery.To).format(DateFormats.FULL_DATE_START) : null,
          PageProperty: GetPageNyName('reports/SMSMainReport')
        }
      })
    },
    Replies: {
      title: t('common.Total'),
      href: `/Pulseem/ResponsesReport.aspx?SmsCampaignID=${id}&Culture=${isRTL ? 'he-IL' : 'en-US'}`,
      onClick: () => {
        if (userRoles?.HideRecipients) {
          return;
        }
        window.location = `/Pulseem/ResponsesReport.aspx?SmsCampaignID=${id}&Culture=${isRTL ? 'he-IL' : 'en-US'}`
      }
    },
    DLR: {
      title: SizeOptionsOfHandHeldDevices.indexOf(windowSize) > -1 ? '' : t('common.DLR'),
      href: `/Pulseem/ClientSearchResult.aspx?SuccessCountSMSCampaignID=${id}&Culture=${isRTL ? 'he-IL' : 'en-US'}`,
      onClick: () => !userRoles?.HideRecipients && navigate(CLIENT_CONSTANTS.BASEURL, {
        state: {
          ...CLIENT_CONSTANTS.QUERY_PARAMS, CampaignID: id, PageType: CLIENT_CONSTANTS.PAGE_TYPES.SuccessCountSMSCampaignID,
          FromDate: smsQuery.From ? moment(smsQuery.From).format(DateFormats.FULL_DATE_START) : null,
          ToDate: smsQuery.To ? moment(smsQuery.To).format(DateFormats.FULL_DATE_START) : null,
          PageProperty: GetPageNyName('reports/SMSMainReport')
        }
      }),
    },
    Revenue: {
      title: '',
      href: `${sitePrefix}ClientSearchResult`,
      isRevenueCol: true,
      onClick: () => {
        navigate(`${CLIENT_CONSTANTS.BASEURL}`, {
          state:
          {
            ...CLIENT_CONSTANTS.QUERY_PARAMS,
            CampaignID: id,
            PageType: CLIENT_CONSTANTS.PAGE_TYPES.Revenue,
            ReportType: CLIENT_CONSTANTS.REPORT_TYPE.ShowSms,
            FromDate: smsQuery.From ? moment(smsQuery.From).format(DateFormats.FULL_DATE_START) : null,
            ToDate: smsQuery.To ? moment(smsQuery.To).format(DateFormats.FULL_DATE_START) : null,
            PageProperty: GetPageNyName('reports/SMSMainReport')
          }
        })
      },
      textStyle: { fontWeight: 900 }
    }
  })

  useEffect(() => {
    const queryState = from?.toLowerCase().indexOf('clientsearchresult') > -1;
    const pageStateProperty = GetPageNyName('reports/SMSMainReport');
    let searchData = { ...smsQuery, SerachTxt: qs !== null && qs?.name ? qs?.name : smsQuery.SerachTxt, From: qs !== null && qs?.name ? null : priorDate };
    if (queryState && pageStateProperty) {
      if (pageStateProperty.SearchData) {
        searchData = {
          SerachTxt: pageStateProperty.SearchData?.SerachTxt ?? '',
          From: pageStateProperty.SearchData?.From ?? null,
          To: pageStateProperty.SearchData?.To ?? null,
          FromDate: smsQuery.From ? moment(smsQuery.From).format(DateFormats.FULL_DATE_START) : null,
          ToDate: smsQuery.To ? moment(smsQuery.To).format(DateFormats.FULL_DATE_START) : null,
          ShowTestCampaigns: pageStateProperty.SearchData?.ShowTestCampaigns ? pageStateProperty.SearchData?.ShowTestCampaigns : smsQuery.ShowTestCampaigns,
          CampaignID: pageStateProperty.SearchData?.CampaignID ?? null,
        }
        setSearching(true);
      }
      searchData.PageNumber = pageStateProperty.PageNumber;
    }
    setSmsQuery(searchData);
    getData(searchData);
    SetPageState({
      "PageName": "reports/SMSMainReport",
      "PageNumber": page,
      "SearchData": searchData
    });

  }, [smsQuery.ShowTestCampaigns])

  const getData = async (query) => {
    setLoader(true);
    await dispatch(getSmsReport(query));
    setLoader(false);
    setPage(query.PageNumber ?? page);
  }

  const usePrevious = (value) => {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  }

  const prevShowTestCampaign = usePrevious(smsQuery.ShowTestCampaigns);

  useEffect(() => {
    if (smsQuery.SerachTxt !== '' ||
      JSON.stringify(smsQuery.From) !== JSON.stringify(priorDate) ||
      smsQuery.To !== null ||
      (prevShowTestCampaign !== undefined && prevShowTestCampaign !== smsQuery.ShowTestCampaigns)) {
      setPage(1);
      setSearching(true);
    }
  }, [dispatch, smsQuery.ShowTestCampaigns, isSearching]);

  useEffect(() => {
    if (accountFeatures && accountFeatures?.indexOf(PulseemFeatures.REVENUE) > -1) {
      setHasRevenue(true);
    }
  }, [accountFeatures])


  useEffect(() => {
    const getGraph = async () => {
      await dispatch(getSmsGraph());
    }
    if (!smsGraph)
      getGraph();

    if (!getCookie('SMSReportNotice')) {
      setDialogType({
        type: 'featureNotice'
      })
    }
  }, [])

  const exportColumnHeader = {
    "SMSCampaignID": t('common.campaignID'),
    "Status": t('common.Status'),
    "Name": t('common.CampaignName'),
    "Type": t('common.campaignType'),
    "UpdateDate": t('common.UpdateDate'),
    "SendDate": t('common.SendDate'),
    "ClicksCount": t('mainReport.clickCount'),
    "VerifiedCount": t('mainReport.verifiedCount'),
    "UniqueClicksCount": t('common.ClicksUnique'),
    "RealClicks": t('mainReport.verifiedCount'),
    "TotalSendPlan": t('mainReport.totalSendPlan'),
    "CreditsPerSms": `${t('report.Credits')} ${t('mainReport.postCredits')}`,
    "IsResponse": t('mainReport.isResponse'),
    "totalSent": t('report.TotalSent'),
    "success": t('report.success'),
    "failure": t('report.failure'),
    "removed": t('common.Removed'),
    "replies": t('common.Comments'),
    "futureSends": t('campaigns.FutureSend'),
    "StatusName": t('mainReport.statusName'),
    "Revenue": t('common.revenue')
  }

  const clearSearch = () => {
    const resetSmsQuery = {
      ...smsQuery,
      From: priorDate,
      To: null,
      SerachTxt: '',
      ShowTestCampaigns: false,
      SmsCampaignID: null,
      PageNumber: 1
    };
    setSmsQuery(resetSmsQuery);
    setSearching(false);
    getData(resetSmsQuery);
    SetPageState({
      "PageName": "reports/SMSMainReport",
      "PageNumber": page,
      "SearchData": resetSmsQuery
    });
    ClearPageState('reports/SMSMainReport');
  }

  const handleDownloadCsv = async (formatType) => {
    setDialogType(null);
    setLoader(true);

    if (hasRevenue)
      exportColumnHeader["Revenue"] = t("common.revenue");

    const fields = { ...exportColumnHeader };

    const exportOptions = {
      OrderItems: true,
      FormatDate: true,
      ConvertStatusToString: true,
      IsBoolean: true,
      BooleanToNumber: true,
      PropertyToReplace: 'IsResponse',
      PropertyDefaultReplaceValue: t('common.No'),
      Statuses: smsReportStatus,
      Order: Object.keys(fields),
      DeleteProperties: ["Status"]
    };

    try {
      const result = await HandleExportData([...smsReport], exportOptions);
      delete fields["Status"];

      ExportFile({
        data: result,
        fileName: 'smsReport',
        exportType: formatType,
        fields: fields
      });
    } catch (e) {
      console.log(e);
      // dispatch(sendToTeamChannel({
      //   MethodName: 'handleDownloadCsv',
      //   ComponentName: 'ArchiveManagement.js',
      //   Text: e
      // }));
    }
    finally {
      setLoader(false);
    }
  }


  const handleSearch = () => {
    if (smsQuery.SerachTxt === '' && !smsQuery.From && !smsQuery.To) {
      return;
    }

    setSmsQuery(smsQuery);
    setSearching(true);
    SetPageState({
      "PageName": "reports/SMSMainReport",
      "PageNumber": page,
      "SearchData": smsQuery
    });
    getData(smsQuery);
  }

  const handleKeyPress = (event) => {
    if (event.keyCode === 13 || event.code === 'Enter') {
      handleSearch();
    }
  }

  const renderSearchSection = () => {
    return (
      <Grid
        container
        spacing={2}
        className={clsx(SizeOptionsOfHandHeldDevices.indexOf(windowSize) > -1 ? classes.mt15 : classes.lineTopMarging, 'searchLine')}>
        <Grid item>
          <TextField
            variant='outlined'
            size='small'
            value={smsQuery.SerachTxt}
            onKeyPress={handleKeyPress}
            onChange={(e) => {
              setSmsQuery({
                ...smsQuery,
                SerachTxt: e.target.value
              })
            }}
            className={clsx(classes.textField, classes.minWidth252)}
            placeholder={t('common.CampaignName')}
          />
        </Grid>

        {SizeOptionsOfHandHeldDevices.indexOf(windowSize) === -1 ?
          <Grid item>
            <DateField
              toolbarDisabled={false}
              classes={classes}
              value={smsQuery.From}
              onChange={(value) => {
                setSmsQuery({
                  ...smsQuery,
                  From: value.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
                })
              }}
              placeholder={t('mms.locFromDateResource1.Text')}
            />
          </Grid>
          : null}

        {SizeOptionsOfHandHeldDevices.indexOf(windowSize) === -1 ?
          <Grid item>
            <DateField
              toolbarDisabled={false}
              classes={classes}
              value={smsQuery.To}
              onChange={(value) => {
                setSmsQuery({
                  ...smsQuery,
                  To: value.set({ hour: 23, minute: 59, second: 59, millisecond: 59 })
                })
              }}
              placeholder={t('mms.locToDateResource1.Text')}
              minDate={smsQuery.From ? smsQuery.From : undefined}
            />
          </Grid>
          : null}

        <Grid item style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <PulseemSwitch
                switchType='ios'
                classes={classes}
                checked={smsQuery.ShowTestCampaigns}
                onColor="#0371ad"
                handleDiameter={20}
                boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                height={15}
                width={40}
                className={clsx({ [classes.rtlSwitch]: isRTL })}
                onChange={() => {
                  const p = GetPageNyName('reports/SMSMainReport');
                  if (p.SearchData) {
                    ClearPageState('reports/SMSMainReport');
                  }
                  setSmsQuery({ ...smsQuery, ShowTestCampaigns: !smsQuery.ShowTestCampaigns })
                }}
              />
            }
            label={t('mainReport.locShowTestCampaigns.Text')}
          />
          {/* <Switch
            checked={smsQuery.ShowTestCampaigns}
            onColor="#0371ad"
            handleDiameter={20}
            uncheckedIcon={false}
            checkedIcon={false}
            boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
            activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
            height={15}
            width={40}
            className={clsx({ [classes.rtlSwitch]: isRTL })}
            onChange={() => { setSmsQuery({ ...smsQuery, ShowTestCampaigns: !smsQuery.ShowTestCampaigns }) }}
          /> */}
        </Grid>
        <Grid item>
          <Button
            onClick={() => handleSearch()}
            className={clsx(classes.btn, classes.btnRounded, classes.searchButton)}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}>
            {t('notifications.buttons.search')}
          </Button>
        </Grid>
        {isSearching && <Grid item>
          <Button
            onClick={() => clearSearch()}
            className={clsx(classes.btn, classes.btnRounded, classes.searchButton)}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}>
            {t('common.clear')}
          </Button>
        </Grid>}
      </Grid>
    )
  }

  const renderManagmentLine = () => {
    const dataLength = smsReport.length;
    return (
      <Grid container spacing={2} className={clsx(classes.linePadding, classes.pb10)} >
        {userRoles?.AllowExport && accountFeatures?.indexOf(PulseemFeatures.LOCK_EXPORT_DATA) === -1 && SizeOptionsOfHandHeldDevices.indexOf(windowSize) === -1 && <Grid item>
          <Button
            className={clsx(
              classes.btn, classes.btnRounded,
              smsReport.length > 0 ? null : classes.disabled
            )}
            onClick={() => setDialogType('exportFormat')}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}>
            {t('campaigns.exportFile')}
          </Button>
        </Grid>}
        <Grid item className={classes.groupsLableContainer} >
          <Typography className={classes.groupsLable}>
            {`${dataLength} ${t('mms.campaigns')}`}
          </Typography>
        </Grid>
      </Grid>
    )
  }

  const renderTableHead = () => {
    return (
      <TableHead>
        <TableRow classes={rowStyle}>
          <TableCell classes={cellStyle} className={classes.flex3} align='center'>{t('campaigns.camapignName')}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center'>{t("mainReport.locTotalSendPlan.HeaderText")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center'>{t("mainReport.ToalSent")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex3} align='center'>{t("common.Clicks")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center'>{t("mainReport.feedback")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center'></TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center'></TableCell>
          <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t("smsReport.credits")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center' >{t("common.DLR")}</TableCell>
          {hasRevenue && <TableCell classes={cell50wStyle} className={classes.flex1} align='center' >{t("common.revenue")}</TableCell>}
        </TableRow>
      </TableHead>
    )
  }

  const renderNameCell = (row) => {
    const { Name, SendDate, UpdateDate, Status } = row

    const date = SendDate ? moment(SendDate) : ''
    const udate = UpdateDate ? moment(UpdateDate) : '';
    const showDate = SendDate ? date.format(DateFormats.DATE_ONLY) : ''
    const showTime = SendDate ? date.format(DateFormats.TIME_ONLY) : ''
    //const now =  moment().add('months',-1).utc();
    //const isSchedule = moment(SendDate).isAfter(now.format());
    const isSchedule = moment(SendDate) > moment();
    const showUpdateDate = UpdateDate ? udate.format(DateFormats.DATE_ONLY) : '';
    const showTimeUpdate = UpdateDate ? udate.format(DateFormats.TIME_ONLY) : '';

    return (
      <>
        <Typography className={classes.nameEllipsis}>
          {Name}
        </Typography>
        {Status === 5 ? <Typography className={clsx(classes.dInlineBlock, classes.f14, classes.red)}>({t("campaigns.Canceled")})</Typography> : null}
        {SendDate !== null ?
          (
            <Typography className={classes.grayTextCell}>
              {isSchedule ? t("common.ScheduledFor") : t("common.SentOn")} {`${isRTL ? showDate : moment(showDate).format(DateFormats.DATE_ONLY)} ${showTime}`}
            </Typography>
          ) :
          (
            <Typography className={classes.grayTextCell}>
              {t("common.UpdatedOn")} {`${isRTL ? showUpdateDate : moment(showUpdateDate).format(DateFormats.DATE_ONLY)} ${showTimeUpdate}`}
            </Typography>
          )
        }

      </>
    )
  }

  const colorTextStyle = {
    red: classes.textColorRed,
    blue: classes.textColorBlue,
    green: classes.sendIconText
  }

  const renderIntData = (value, type, data = {}) => {
    const { title = SizeOptionsOfHandHeldDevices.indexOf(windowSize) > -1 ? '' : t("notifications.tblBody.total"), textStyle = null, onClick = null } = data
    const isLink = value > 0 && !!onClick;
    return (
      <Box className={userRoles?.HideRecipients && classes.disabled} style={{ display: 'flex', flexDirection: 'column', cursor: isLink ? 'pointer' : null }}
        onClick={isLink ? onClick : VoidFunction}>
        <Typography
          component={'a'}
          className={clsx(classes.middleText, colorTextStyle[type] || '')}
          style={{ ...textStyle, textDecoration: isLink ? 'underline' : null }}
          target="_blank">
          {(value && value.toLocaleString()) || '0'}
        </Typography>
        <Typography
          className={clsx(classes.middleWrapText, colorTextStyle[type])}
          style={{ ...textStyle, textDecoration: isLink ? 'underline' : null }}>
          {title}
        </Typography>
      </Box>
    )
  }
  const renderRevenueData = (value, type, data = {}) => {
    const { textStyle = null, onClick = null } = data
    return (
      <Box className={userRoles?.HideRecipients && classes.disabled} style={{ display: 'flex', flexDirection: 'column' }} >
        <Typography component={value > 0 ? 'a' : 'p'}
          onClick={() => {
            if (value > 0) {
              onClick();
            }
          }}
          className={clsx(classes.middleText, colorTextStyle[type] || '')}
          style={{ ...textStyle, textDecoration: value > 0 && 'underline', cursor: value > 0 && 'pointer' }}>
          {isCurrencySymbolPrefix ? currencySymbol : ''} {(value && value.toLocaleString()) || '0'} {!isCurrencySymbolPrefix ? currencySymbol : ''}
        </Typography>
      </Box>
    )
  }

  const renderRow = (row) => {
    const {
      SMSCampaignID,
      success,
      ClicksCount,
      UniqueClicksCount,
      RealClicks = 0,
      removed,
      replies,
      CreditsPerSms,
      failure,
      TotalSendPlan,
      totalSent,
      Revenue = 0,
      Name
    } = row
    const hrefs = getHrefs(SMSCampaignID, Name)
    return (
      <TableRow
        key={SMSCampaignID}
        classes={rowStyle}>
        <TableCell
          classes={cellBodyStyle}
          align='center'
          className={clsx(classes.flex3)}>
          {renderNameCell(row)}
        </TableCell>
        <TableCell
          classes={noBorderCellStyle}
          align='center'
          className={classes.flex1}>
          {renderIntData(TotalSendPlan, '', { textDecoration: 'none' }, false)}
        </TableCell>
        <TableCell
          classes={borderCellStyle}
          align='center'
          className={classes.flex1}>
          {renderIntData(totalSent, '', hrefs.TotalSendTo)}
        </TableCell>
        <TableCell
          classes={borderCellStyle}
          align='center'
          className={classes.flex3}>
          <Grid container direction={'row'} className={classes.justifyEvenly}>
            <Grid item className={classes.plr10}>
              <Tooltip
                title={t('mainReport.clickCountTooltip')}
                arrow
                placement={'top'}
                classes={{ tooltip: clsx(classes.tooltipBlack, classes.tooltipPlacement), arrow: classes.black }}
              >
                {renderIntData(ClicksCount, 'blue', hrefs.ClickCount)}
              </Tooltip>
            </Grid>
            <Grid item className={classes.plr10}>
              <Tooltip
                title={t('mainReport.uniqueClickCountTooltip')}
                arrow
                placement={'top'}
                classes={{ tooltip: clsx(classes.tooltipBlack, classes.tooltipPlacement), arrow: classes.black }}
              >
                {renderIntData(UniqueClicksCount, 'blue', hrefs.ClickCountUnique)}
              </Tooltip>
            </Grid>
            <Grid item className={classes.plr10}>
              <Tooltip
                title={t('mainReport.verifiedTooltip')}
                arrow
                placement={'top'}
                classes={{ tooltip: clsx(classes.tooltipBlack, classes.tooltipPlacement), arrow: classes.black }}
              >
                {renderIntData(RealClicks, 'blue', hrefs.VerifiedCount)}
              </Tooltip>
            </Grid>
          </Grid>
        </TableCell>
        <TableCell
          classes={borderCellStyle}
          align='center'
          className={classes.flex1}>
          {renderIntData(replies, 'blue', hrefs.Replies)}
        </TableCell>
        <TableCell
          classes={noBorderCellStyle}
          align='center'
          className={classes.flex1}>
          {renderIntData(failure, 'red', hrefs.Failed)}
        </TableCell>
        <TableCell
          classes={borderCellStyle}
          align='center'
          className={classes.flex1}>
          {renderIntData(removed, 'red', hrefs.Removed)}
        </TableCell>
        <TableCell
          classes={borderCellStyle}
          align='center'
          className={classes.flex2}>
          <Grid container direction={'row'} className={classes.justifyEvenly} style={{ flexWrap: 'initial' }}>
            <Grid item className={classes.plr10}>
              {renderIntData(CreditsPerSms, '', { title: t("mainReport.postCredits") })}
            </Grid>
            <Grid item className={clsx(classes.plr10)}>
              {renderIntData((totalSent * CreditsPerSms), '', { title: t("common.Total") })}
            </Grid>
          </Grid>
        </TableCell>
        <TableCell
          classes={hasRevenue ? borderCellStyle : noBorderCellStyle}
          align='center'
          className={classes.flex1}>
          {renderIntData(success, '', hrefs.DLR)}
        </TableCell>
        {hasRevenue && <TableCell
          classes={noBorderCellStyle}
          align='center'
          className={classes.flex1}>
          {renderRevenueData(Revenue, '', hrefs.Revenue)}
        </TableCell>}
      </TableRow>
    )
  }

  const renderPhoneRow = (row) => {
    const {
      SMSCampaignID,
      Name,
      SendDate,
      UpdateDate,
      ClicksCount,
      UniqueClicksCount,
      RealClicks = 0,
      removed,
      failure,
      totalSent,
      success,
      Revenue = 0
    } = row
    const hrefs = getHrefs(SMSCampaignID, Name)
    return (
      <TableRow
        key={row.ID}
        component='div'
        classes={rowStyle}>
        <TableCell classes={{ root: clsx(classes.tableCellRoot, classes.flex1, classes.tabelCellPadding) }}>
          <Box className={classes.inlineGrid} style={{ paddingInlineStart: 10 }}>
            {renderNameCell({ SMSCampaignID, Name, SendDate, UpdateDate })}
          </Box>
          <Grid container spacing={2} style={{ paddingInlineStart: 10 }} >
            <Grid item>
              <Typography className={classes.mobileReportHead}>
                {t("mainReport.GridButtonColumnResource2.HeaderText")}
              </Typography>
            </Grid>
          </Grid>
          <Grid container spacing={2} style={{ paddingInlineStart: 10 }}>
            <Grid item xs={3}>
              {renderIntData(ClicksCount, 'blue', hrefs.ClickCount, false)}
            </Grid>
            <Grid item xs={3}>
              {renderIntData(UniqueClicksCount, 'blue', hrefs.ClickCountUnique, false)}
            </Grid>
            <Grid item xs={3}>
              {renderIntData(RealClicks, 'blue', hrefs.VerifiedCount, false)}
            </Grid>
          </Grid>
          <Grid container spacing={2} style={{ paddingInlineStart: 10 }} >
            <Grid item xs={3}>
              <Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
                {t("common.Sent")}
              </Typography>
              <Grid container spacing={2}>
                <Grid item>
                  {renderIntData(totalSent, '', {}, false)}
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
                {t("common.failedStatus")}
              </Typography>
              <Grid container spacing={2}>
                <Grid item>
                  {renderIntData(failure, 'red', hrefs.Failed, false)}
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
                {t("common.Removed")}
              </Typography>
              <Grid container spacing={2}>
                <Grid item>
                  {renderIntData(removed, 'red', hrefs.Removed, false)}
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
                {t("common.DLR")}
              </Typography>
              <Grid container spacing={2}>
                <Grid item>
                  {renderIntData(success, '', hrefs.DLR)}
                </Grid>
              </Grid>
            </Grid>
            {hasRevenue && <Grid item xs={3}>
              <Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
                {t("common.revenue")}
              </Typography>
              <Grid container spacing={2}>
                <Grid item>
                  {renderIntData(Revenue, '', hrefs.Revenue)}
                </Grid>
              </Grid>
            </Grid>}
          </Grid>

        </TableCell>
      </TableRow>
    )
  }

  const renderTableBody = () => {
    let rowData = smsReport;
    if (rowData.length > 0) {
      rowData = rowData.slice((page - 1) * rowsPerPage, (page - 1) * rowsPerPage + rowsPerPage)
      return (
        <Box className='tableBodyContainer'>
          <TableBody>
            {rowData
              .map(SizeOptionsOfHandHeldDevices.indexOf(windowSize) > -1 ? renderPhoneRow : renderRow)}
          </TableBody>
        </Box>
      )
    }
    return <Box className={clsx(classes.flex, classes.justifyCenterOfCenter)} style={{ height: 50 }}>
      <Typography>{t("common.NoDataTryFilter")}</Typography>
    </Box>

  }

  const renderTable = () => {
    return (
      <TableContainer className={classes.tableStyle}>
        <Table className={classes.tableContainer}>
          {SizeOptionsOfHandHeldDevices.indexOf(windowSize) === -1 && renderTableHead()}
          {renderTableBody()}
        </Table>
      </TableContainer>
    )
  }

  const renderTablePagination = () => {
    return (
      <TablePagination
        classes={classes}
        rows={smsReport?.length}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={setRowsPerPage}
        rowsPerPageOptions={rowsOptions}
        page={page}
        onPageChange={(e) => {
          SetPageState({
            "PageName": "reports/SMSMainReport",
            "PageNumber": e,
            "SearchData": (smsQuery.SerachTxt !== '' || smsQuery.From || smsQuery.To || smsQuery.ShowTestCampaigns || smsQuery.SmsCampaignID) ? {
              SerachTxt: smsQuery.SerachTxt,
              From: smsQuery.From,
              To: smsQuery.To,
              ShowTestCampaigns: smsQuery.ShowTestCampaigns,
              CampaignID: smsQuery.SmsCampaignID
            } : null
          });
          setPage(e)
        }}
      />
    )
  }

  const getFeatureNoticeDialog = () => {
    return {
      title: t("mainReport.SMSReportNote1"),
      showDivider: true,
      exitButton: false,
      content: (
        <>
          <Typography className={classes.f18}>
            {RenderHtml(t("mainReport.SMSReportNote2"))}
          </Typography>
          <FormControlLabel
            label={t("common.doNotShow")}
            className={classes.pt10}
            control={
              <Checkbox
                color="primary"
                checked={showNoticeDialog}
                onClick={() => {
                  setShowNoticeDialog(!showNoticeDialog)
                }}
              />
            }
          />
        </>

      ),
      onClose: () => { setDialogType(null) },
      onConfirm: async () => {
        setDialogType(null);
        if (showNoticeDialog) {
          setCookie('SMSReportNotice', showNoticeDialog);
        }
      }
    }
  }
  const renderDialog = () => {
    const { type } = dialogType || {}
    const dialogContent = {
      featureNotice: getFeatureNoticeDialog(),
    }
    if (dialogContent[type]) {
      const currentDialog = dialogContent[type] || {}
      return (
        dialogType && <BaseDialog
          classes={classes}
          open={dialogType}
          onClose={() => setDialogType(null)}
          onCancel={() => setDialogType(null)}
          {...currentDialog}
        >
          {currentDialog.content}
        </BaseDialog>
      )
    }
  }

  return (
    <DefaultScreen
      classes={classes}
      containerClass={clsx(classes.management, classes.mb50)}
      currentPage="reports"
      subPage="SmsReport">
      <Box className={'topSection'}>
        <Title Text={t('common.SMSReports')} classes={classes} />
        {renderSearchSection()}
      </Box>
      {renderManagmentLine()}
      {renderTable()}
      {renderTablePagination()}
      <ConfirmRadioDialog
        classes={classes}
        isOpen={dialogType === 'exportFormat'}
        title={t('campaigns.exportFile')}
        radioTitle={t('common.SelectFormat')}
        onConfirm={(e) => handleDownloadCsv(e)}
        onCancel={() => setDialogType(null)}
        cookieName={'exportFormat'}
        defaultValue="xlsx"
        options={ExportFileTypes}
      />
      <GraphReport classes={classes} showLoader={!smsGraph} reportData={smsGraph} />
      {renderDialog()}
      <Loader isOpen={showLoader} showBackdrop={true} />
      {renderDialog()}
    </DefaultScreen>
  )
}

export default SmsReport