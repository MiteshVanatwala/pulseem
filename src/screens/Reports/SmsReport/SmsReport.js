import React, { useState, useEffect, useRef } from 'react';
import DefaultScreen from '../../DefaultScreen';
import clsx from 'clsx';
import {
  Typography, Table, TableBody, TableRow, TableHead, TableCell, TableContainer, Grid, Button, TextField, Box
} from '@material-ui/core'
import Switch from "react-switch";
import {
  SearchIcon, ExportIcon
} from '../../../assets/images/managment/index'
import {
  TablePagination, DateField, SearchField
} from '../../../components/managment/index'
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import ClearIcon from '@material-ui/icons/Clear';
import moment from 'moment';
import 'moment/locale/he';
import { getSmsReport, getSmsGraph } from '../../../redux/reducers/smsSlice';
import { Loader } from '../../../components/Loader/Loader';
import { ExportFile } from '../../../helpers/Export/ExportFile';
import { smsReportStatus } from '../../../helpers/Constants';
import { HandleExportData } from '../../../helpers/Export/ExportHelper';
import GraphReport from '../../../components/Reports/GraphReport';
import { Title } from '../../../components/managment/Title';

const SmsReport = ({ classes }) => {
  const priorDate = moment().subtract(30, 'days').utcOffset(0);
  priorDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })

  const { language, windowSize, isRTL, accountFeatures } = useSelector(state => state.core)
  const { smsReport, smsGraph } = useSelector(state => state.sms)
  const { t } = useTranslation()
  const [campaignName, setCampaignNameSearch] = useState('');
  const rowsOptions = [6, 10, 20, 50]
  const [rowsPerPage, setRowsPerPage] = useState(rowsOptions[0])
  const [page, setPage] = useState(1)
  const [isSearching, setSearching] = useState(false)
  const dispatch = useDispatch()
  const rowStyle = { head: classes.tableRowReportHead, root: clsx(classes.tableRowRoot, classes.maxHeight87) }
  const cellStyle = { head: classes.tableCellHead, root: clsx(classes.tableCellRoot, classes.paddingHead) }
  const cell50wStyle = { head: clsx(classes.tableCellHead), root: clsx(classes.tableCellRoot, classes.paddingHead, classes.minWidth50) }
  const cellBodyStyle = { body: clsx(classes.tableCellBody), root: clsx(classes.tableCellRoot) }
  const noBorderCellStyle = { body: classes.tableCellBodyNoBorder, root: clsx(classes.tableCellRoot, classes.minWidth50) }
  const borderCellStyle = { body: clsx(classes.tableCellBody), root: clsx(classes.tableCellRoot, classes.minWidth50) }
  const [showLoader, setLoader] = useState(true);
  const [smsQuery, setSmsQuery] = useState({ SerachTxt: '', From: priorDate, To: null, ShowTestCampaigns: false, SmsCampaignID: null })
  const [hasRevenue, setHasRevenue] = useState(false);

  moment.locale(language)

  const getHrefs = (id) => ({
    TotalSendTo: {
      href: `/Pulseem/ClientSearchResult.aspx?TotalCountSMSCampaignID=${id}&Culture=${isRTL ? 'he-IL' : 'en-US'}`
    },
    ClickCountUnique: {
      title: t('common.Unique'),
      href: `/Pulseem/SMSLinksClicksReport.aspx?CampaignID=${id}&fromreact=true&Culture=${isRTL ? 'he-IL' : 'en-US'}`
      //href: `/Pulseem/LinksClicksReport.aspx?CampaignID=${id}&fromreact=true&Culture=${isRTL ? 'he-IL' : 'en-US'}`
    },
    ClickCount: {
      title: windowSize === 'xs' ? t('common.Total') : t('common.Clicks'),
      href: ``
      //href: `/Pulseem/LinksClicksReport.aspx?CampaignID=${id}&fromreact=true&Culture=${isRTL ? 'he-IL' : 'en-US'}`
    },
    PercetangeClicks: {
      title: t('mainReport.locUniqueClicksPercents.HeaderText'),
      href: `/Pulseem/LinksClicksReport.aspx?CampaignID=${id}&fromreact=true&Culture=${isRTL ? 'he-IL' : 'en-US'}`
    },
    Failed: {
      title: windowSize === 'xs' ? '' : t("common.failedStatus"),
      href: `/Pulseem/ClientSearchResult.aspx?FailureCountSMSCampaignID=${id}&Culture=${isRTL ? 'he-IL' : 'en-US'}`
    },
    Removed: {
      title: windowSize === 'xs' ? '' : t('mainReport.removed'),
      href: `/Pulseem/ClientSearchResult.aspx?RemovedCountSMSCampaignID=${id}&Culture=${isRTL ? 'he-IL' : 'en-US'}`
    },
    Replies: {
      title: t('common.Total'),
      //href: `/react/reports/SmsReplies/${id}`
      href: `/Pulseem/ResponsesReport.aspx?SmsCampaignID=${id}&Culture=${isRTL ? 'he-IL' : 'en-US'}`
    },
    DLR: {
      title: windowSize === 'xs' ? '' : t('common.DLR'),
      href: `/Pulseem/ClientSearchResult.aspx?SuccessCountSMSCampaignID=${id}&Culture=${isRTL ? 'he-IL' : 'en-US'}`
    },
    Revenue: {
      title: '',
      href: `/react/ClientSearchResult/sms/${id}`,
      textStyle: { fontWeight: 900 },
      isRevenueCol: true
    }
  })

  const getData = async (query) => {
    setLoader(true);
    await dispatch(getSmsReport(query));
    setLoader(false);
    await dispatch(getSmsGraph());
  }

  useEffect(() => {
    if (accountFeatures && accountFeatures.includes('42')) {
      setHasRevenue(true);
    }
  }, [accountFeatures])

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
    getData(smsQuery);
  }, [isSearching, smsQuery.ShowTestCampaigns])


  const exportColumnHeader = {
    "SMSCampaignID": t('common.campaignID'),
    "Status": t('common.Status'),
    "Name": t('common.CampaignName'),
    "Type": t('common.campaignType'),
    "UpdateDate": t('common.UpdateDate'),
    "SendDate": t('common.SendDate'),
    "ClicksCount": t('mainReport.clickCount'),
    "UniqueClicksCount": t('common.ClicksUnique'),
    "TotalSendPlan": t('mainReport.totalSendPlan'),
    "CreditsPerSms": t('mainReport.postCredits'),
    "IsResponse": t('mainReport.isResponse'),
    "totalSent": t('report.TotalSent'),
    "success": t('report.success'),
    "failure": t('report.failure'),
    "removed": t('common.Removed'),
    "replies": t('common.Comments'),
    "futureSends": t('campaigns.FutureSend'),
    "StatusName": t('mainReport.statusName'),
  }

  const clearSearch = () => {
    const resetSmsQuery = { ...smsQuery, From: priorDate, To: null, SerachTxt: '', ShowTestCampaigns: false, SmsCampaignID: null };
    setSmsQuery(resetSmsQuery);
    getData(resetSmsQuery)
    setSearching(false);
    setPage(1);
  }

  const handleDownloadCsv = async () => {
    let orderList = [...smsReport];
    //await OrderItems(searchResults || smsReport, Object.keys(exportColumnHeader));

    const exportOptions = {
      OrderItems: true,
      FormatDate: true,
      IsBoolean: true,
      BooleanToNumber: true,
      Statuses: smsReportStatus,
      ConvertStatusToString: true,
      PropertyToReplace: 'IsResponse',
      Order: Object.keys(exportColumnHeader),
      DeleteProperties: ["Status"]
    };

    try {
      const result = await HandleExportData(orderList, exportOptions);
      ExportFile({
        data: result,
        fileName: 'smsReport',
        exportType: 'csv',
        fields: exportColumnHeader
      });
    } catch (error) {
      console.log(error);
    }
  }

  const renderSearchSection = () => {
    const handleSearch = () => {
      if (campaignName === '' && !smsQuery.From && !smsQuery.To) {
        return;
      }
      setSearching(true);
      getData(smsQuery);
    }

    const handleKeyPress = (event) => {
      if (event.keyCode === 13 || event.code === 'Enter') {
        handleSearch();
      }
    }

    if (windowSize === 'xs') {
      return (
        <SearchField
          classes={classes}
          value={campaignName}
          onChange={(e) => setCampaignNameSearch(e.target.value)}
          onClick={handleSearch}
          placeholder={t('common.CampaignName')}
        />
      )
    }

    return (
      <Grid
        container
        spacing={2}
        className={classes.lineTopMarging}>
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

        {windowSize !== 'xs' ?
          <Grid item>
            <DateField
              toolbarDisabled={false}
              classes={classes}
              value={smsQuery.From}
              onChange={(value) => {
                setSmsQuery({
                  ...smsQuery,
                  From: value
                })
              }}
              placeholder={t('mms.locFromDateResource1.Text')}
            />
          </Grid>
          : null}

        {windowSize !== 'xs' ?
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
          <Switch
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
          />
          <Typography style={{ marginInlineStart: 8 }}>
            {t('mainReport.locShowTestCampaigns.Text')}
          </Typography>
        </Grid>
        <Grid item>
          <Button
            size='large'
            variant='contained'
            onClick={handleSearch}
            className={classes.searchButton}
            endIcon={<SearchIcon />}>
            {t('notifications.buttons.search')}
          </Button>
        </Grid>
        {isSearching && <Grid item>
          <Button
            size='large'
            variant='contained'
            onClick={() => clearSearch()}
            className={classes.searchButton}
            endIcon={<ClearIcon />}>
            {t('common.clear')}
          </Button>
        </Grid>}
      </Grid>
    )
  }

  const renderManagmentLine = () => {
    const dataLength = smsReport.length;
    return (
      <Grid container spacing={2} className={classes.linePadding} >
        {windowSize !== 'xs' && <Grid item>
          <Button
            variant='contained'
            size='medium'
            className={clsx(
              classes.actionButton,
              classes.actionButtonGreen,
              smsReport.length > 0 ? null : classes.disabled
            )}
            onClick={handleDownloadCsv}
            startIcon={<ExportIcon />}>
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
          <TableCell classes={cell50wStyle} className={classes.flex2} align='center'>{t("common.Clicks")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center'>{t("mainReport.feedback")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center'></TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center'></TableCell>
          <TableCell classes={cellStyle} className={classes.flex3} align='center'>{t("smsReport.credits")}</TableCell>
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
    const showDate = SendDate ? date.format('L') : ''
    const showTime = SendDate ? date.format('LT') : ''
    const isSchedule = moment(SendDate) > moment();
    const showUpdateDate = UpdateDate ? udate.format('L') : '';
    const showTimeUpdate = UpdateDate ? udate.format('LT') : '';

    return (
      <>
        <Typography className={classes.nameEllipsis}>
          {Name}
        </Typography>
        {Status === 5 ? <Typography className={clsx(classes.dInlineBlock, classes.f14, classes.red)}>({t("campaigns.Canceled")})</Typography> : null}
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

  const colorTextStyle = {
    red: classes.textColorRed,
    blue: classes.textColorBlue,
    green: classes.sendIconText
  }

  const renderIntData = (value, type, data = {}, clickable = true) => {
    const { title = windowSize === 'xs' ? '' : t("notifications.tblBody.total"), href = '', textStyle = null } = data
    return (
      <Box style={{ display: 'flex', flexDirection: 'column' }} >
        <Typography component={href !== '' && clickable && value > 0 ? 'a' : 'p'}
          href={href !== '' ? href : ''}
          className={clsx(classes.middleText, colorTextStyle[type] || '')}
          style={textStyle}
          target="_blank">
          {(value && value.toLocaleString()) || '0'}
        </Typography>
        <Typography component={href !== '' && clickable && value > 0 ? 'a' : 'p'}
          href={href !== '' ? href : ''}
          style={textStyle}
          target="_blank"
          className={clsx(classes.middleWrapText, colorTextStyle[type])}>
          {title}
        </Typography>
      </Box>
    )
  }
  const renderRevenueData = (value, type, data = {}) => {
    const { href = '', textStyle = null, isRevenueCol = false } = data
    return (
      <Box style={{ display: 'flex', flexDirection: 'column' }} >
        <Typography component={href !== '' && (value > 0 || (isRevenueCol && value > 0)) ? 'a' : 'p'}
          href={href !== '' ? href : ''}
          className={clsx(classes.middleText, colorTextStyle[type] || '')}
          style={textStyle}
          target="_blank">
          {(value && value.toLocaleString()) || '0'} {t("common.NIS")}
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
      removed,
      replies,
      CreditsPerSms,
      failure,
      TotalSendPlan,
      totalSent,
      Revenue = 0
    } = row
    const hrefs = getHrefs(SMSCampaignID)
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
          className={classes.flex2}>
          <Grid container direction={'row'} className={classes.justifyEvenly}>
            <Grid item className={classes.plr10}>
              {renderIntData(ClicksCount, 'blue', hrefs.ClickCount)}
            </Grid>
            <Grid item className={classes.plr10}>
              {renderIntData(UniqueClicksCount, 'blue', hrefs.ClickCountUnique)}
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
          className={classes.flex3}>
          <Grid container direction={'row'} className={classes.justifyEvenly}>
            <Grid item className={classes.plr10}>
              {renderIntData(CreditsPerSms, '', { title: t("mainReport.postCredits") })}
            </Grid>
            <Grid item className={clsx(classes.plr10)}>
              {renderIntData((totalSent * CreditsPerSms), '', { title: t("report.TotalCredits") })}
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
      removed,
      failure,
      totalSent,
      success,
      Revenue = 0
    } = row
    const hrefs = getHrefs(SMSCampaignID)
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
        <TableBody>
          {rowData
            .map(windowSize === 'xs' ? renderPhoneRow : renderRow)}
        </TableBody>
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
          {windowSize !== 'xs' && renderTableHead()}
          {renderTableBody()}
        </Table>
      </TableContainer>
    )
  }

  const renderTablePagination = () => {
    return (
      <TablePagination
        classes={classes}
        rows={isSearching && smsReport.length}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={setRowsPerPage}
        rowsPerPageOptions={rowsOptions}
        page={page}
        onPageChange={setPage}
      />
    )
  }

  return (
    <DefaultScreen
      classes={classes}
      containerClass={classes.management}
      currentPage="reports"
      subPage="SmsReport">
      <Title Text={t('common.SMSReports')} Classes={classes.managementTitle} />
      {renderSearchSection()}
      {renderManagmentLine()}
      {renderTable()}
      {renderTablePagination()}
      <GraphReport classes={classes} showLoader={!smsGraph} reportData={smsGraph} />
      <Loader isOpen={showLoader} showBackdrop={true} />
    </DefaultScreen>
  )
}

export default SmsReport