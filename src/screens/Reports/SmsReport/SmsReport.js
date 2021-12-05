import React, { useState, useEffect, useRef } from 'react';
import DefaultScreen from '../../DefaultScreen';
import clsx from 'clsx';
import {
  Typography, Divider, Table, TableBody, TableRow, TableHead, TableCell, TableContainer, Link,
  Grid, Button, TextField, Box, Paper
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
import { CSVLink } from 'react-csv'
import { exportSmsReport, getSmsReport } from '../../../redux/reducers/smsSlice';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import arrowDown from "../../../assets/images/down-arrow-splash.png"
import * as am4plugins_annotation from "@amcharts/amcharts4/plugins/annotation";
import { Loader } from '../../../components/Loader/Loader';
import { exportFile } from '../../../helpers/exportFromJson';
import { SmsStatus } from '../../../helpers/PulseemArrays';
import { preferredOrder, statusNumberToString } from '../../../helpers/functions';

const SmsReport = ({ classes }) => {
  const { language, windowSize, isRTL } = useSelector(state => state.core)
  const { smsReport, smsGraph } = useSelector(state => state.sms)
  const { t } = useTranslation()
  const [fromDate, handleFromDate] = useState(null);
  const [toDate, handleToDate] = useState(null);
  const [campaignName, setCampaignNameSearch] = useState('');
  const rowsOptions = [6, 10, 20, 50]
  const [rowsPerPage, setRowsPerPage] = useState(rowsOptions[0])
  const [page, setPage] = useState(1)
  const [isSearching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState(null)
  const [isDemoSend, setIsDemoSend] = useState(false)
  const [csvData, setCsvData] = useState('')
  const dateFormat = 'YYYY-MM-DD HH:mm:ss.FFF'
  const dispatch = useDispatch()
  const rowStyle = { head: classes.tableRowReportHead, root: clsx(classes.tableRowRoot, classes.maxHeight87) }
  const cellStyle = { head: classes.tableCellHead, root: clsx(classes.tableCellRoot, classes.paddingHead) }
  const cell50wStyle = { head: clsx(classes.tableCellHead), root: clsx(classes.tableCellRoot, classes.paddingHead, classes.minWidth50) }
  const cellBodyStyle = { body: clsx(classes.tableCellBody), root: clsx(classes.tableCellRoot) }
  const noBorderCellStyle = { body: classes.tableCellBodyNoBorder, root: clsx(classes.tableCellRoot, classes.minWidth50) }
  const borderCellStyle = { body: clsx(classes.tableCellBody), root: clsx(classes.tableCellRoot, classes.minWidth50) }
  const csvLinkRef = useRef(null)
  const [showLoader, setLoader] = useState(true);
  const [smsQuery, setSmsQuery] = useState({ SerachTxt: '', From: null, To: null, ShowTestCampaigns: false, SmsCampaignID: null })

  let chart;
  am4core.useTheme(am4themes_animated);

  moment.locale(language)

  const getHrefs = (id) => ({
    TotalSendTo: {
      href: `/Pulseem/ClientSearchResult.aspx?TotalCountSMSCampaignID=${id}&Culture=${isRTL ? 'he-IL' : 'en-US'}`
    },
    ClickCountUnique: {
      title: t('common.Unique'),
      href: ``
      //href: `/Pulseem/LinksClicksReport.aspx?CampaignID=${id}&fromreact=true&Culture=${isRTL ? 'he-IL' : 'en-US'}`
    },
    ClickCount: {
      title: t('common.Clicks'),
      href: ``
      //href: `/Pulseem/LinksClicksReport.aspx?CampaignID=${id}&fromreact=true&Culture=${isRTL ? 'he-IL' : 'en-US'}`
    },
    PercetangeClicks: {
      title: t('mainReport.locUniqueClicksPercents.HeaderText'),
      href: `/Pulseem/LinksClicksReport.aspx?CampaignID=${id}&fromreact=true&Culture=${isRTL ? 'he-IL' : 'en-US'}`
    },
    Failed: {
      title: t("common.failedStatus"),
      href: `/Pulseem/ClientSearchResult.aspx?FailureCountSMSCampaignID=${id}&Culture=${isRTL ? 'he-IL' : 'en-US'}`
    },
    Removed: {
      title: t('mainReport.removed'),
      href: `/Pulseem/ClientSearchResult.aspx?RemovedCountSMSCampaignID=${id}&Culture=${isRTL ? 'he-IL' : 'en-US'}`
    },
    Replies: {
      title: t('common.Total'),
      href: `/Pulseem/SmsReplies.aspx?ReplyCountSMSCampaignID=${id}&Culture=${isRTL ? 'he-IL' : 'en-US'}`
    },
    DLR: {
      title: t('common.DLR'),
      href: `/Pulseem/ClientSearchResult.aspx?SuccessCountSMSCampaignID=${id}&Culture=${isRTL ? 'he-IL' : 'en-US'}`
    }
  })

  const getData = async () => {
    await dispatch(getSmsReport(smsQuery));
    setLoader(false);
  }

  useEffect(() => {
    getData();
    // initChart();
  }, [dispatch, isDemoSend]);


  const exportColumnHeader = {
    "SMSCampaignID": t('common.campaignID'),
    "Status": t('common.Status'),
    "Name": t('common.CampaignName'),
    "Type": t('common.campaignType'),
    "UpdateDate": t('common.UpdateDate'),
    "SendDate": t('common.SendDate'),
    "ClicksCount": t('mainReport.clickCount'),
    "UniqueClicksCount": t('common.ClicksUnique'),
    "TotalSendPlan": t('mainReport.locTotalSendPlan.HeaderText'),
    "CreditsPerSms": t('mainReport.postCredits'),
    "IsResponse": t('mainReport.notOpened'), // todo
    "totalSent": t('report.TotalSent'),
    "success": t('report.success'),
    "failure": t('report.failure'),
    "removed": t('common.Removed'),
    "replies": t('common.Comments'),
    "futureSends": t('campaigns.FutureSend')
  }

  const renderHeader = () => {
    return (
      <>
        <Typography className={classes.managementTitle}>
          {t('common.SMSReports')}
        </Typography>
        <Divider />
      </>
    )
  }

  const clearSearch = () => {
    setCampaignNameSearch('')
    handleFromDate(null)
    handleToDate(null)
    setSearchResults(null)
    setSearching(false)
  }

  const handleDownloadCsv = async () => {
    let orderList = preferredOrder(searchResults || smsReport, Object.keys(exportColumnHeader));
    orderList = await statusNumberToString(t, orderList, SmsStatus);
    exportFile({
      data: orderList,
      fileName: 'smsReport',
      exportType: 'xls',
      fields: exportColumnHeader
    });
  }

  const renderSearchSection = () => {
    const handleSearch = () => {
      const searchArray = [{
        type: 'name',
        campaignName: campaignName
      }, {
        type: 'date',
        fromDate,
        toDate
      }];

      const filtersObject = {
        name: (row, values) => {
          return String(row.Name.toLowerCase()).includes(values.campaignName.toLowerCase());
        },
        date: (row, values) => {
          const { UpdateDate, SendDate } = row
          const lastUpdate = SendDate ?
            moment(SendDate, dateFormat).valueOf()
            : moment(UpdateDate, dateFormat).valueOf()
          const startFromDate = values.fromDate && values.fromDate.hour(0).minute(0).valueOf() || null
          const endToDate = values.toDate && values.toDate.hour(23).minute(59).valueOf() || null

          if (!values)
            return true
          if (fromDate && toDate && startFromDate && endToDate)
            return ((lastUpdate >= startFromDate) && (lastUpdate <= endToDate))
          if (fromDate && startFromDate)
            return (lastUpdate >= startFromDate)
          if (toDate && endToDate)
            return (lastUpdate <= endToDate)
          return true
        }
      }

      let sortData = smsReport;
      searchArray.forEach(values => {
        sortData = sortData.filter(row => filtersObject[values.type](row, values))
      });
      setSearchResults(sortData);
      if (smsReport.length !== sortData.length) {
        setSearching(true);
        setPage(1);
      }
    }

    const handleKeyPress = (event) => {
      if (event.keyCode === 13 || event.code === 'Enter') {
        handleSearch();
      }
    }

    const handleFromDateChange = (value) => {
      if (value > toDate) {
        handleToDate(null);
      }
      handleFromDate(value);
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
            value={campaignName}
            onKeyPress={handleKeyPress}
            onChange={(e) => setCampaignNameSearch(e.target.value)}
            className={clsx(classes.textField, classes.minWidth252)}
            placeholder={t('common.CampaignName')}
          />
        </Grid>

        {windowSize !== 'xs' ?
          <Grid item>
            <DateField
              classes={classes}
              value={fromDate}
              onChange={handleFromDateChange}
              placeholder={t('mms.locFromDateResource1.Text')}
            />
          </Grid>
          : null}

        {windowSize !== 'xs' ?
          <Grid item>
            <DateField
              classes={classes}
              value={toDate}
              onChange={handleToDate}
              placeholder={t('mms.locToDateResource1.Text')}
              minDate={fromDate ? fromDate : undefined}
            />
          </Grid>
          : null}

        <Grid item style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <Switch
            checked={isDemoSend}
            onColor="#0371ad"
            //onHandleColor="#e6f6ff"
            handleDiameter={20}
            uncheckedIcon={false}
            checkedIcon={false}
            boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
            activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
            height={15}
            width={40}
            className={clsx({ [classes.rtlSwitch]: isRTL })}
            onChange={() => setIsDemoSend(!isDemoSend)}
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
            onClick={clearSearch}
            className={classes.searchButton}
            endIcon={<ClearIcon />}>
            {t('common.clear')}
          </Button>
        </Grid>}
      </Grid>
    )
  }

  const renderManagmentLine = () => {
    const dataLength = isSearching ? searchResults.length : smsReport.length;
    return (
      <Grid container spacing={2} className={classes.linePadding} >
        {windowSize !== 'xs' && <Grid item>
          <Button
            variant='contained'
            size='medium'
            className={clsx(
              classes.actionButton,
              classes.actionButtonGreen
            )}
            onClick={handleDownloadCsv}
            startIcon={<ExportIcon />}>
            {t('campaigns.exportFile')}
          </Button>
          <CSVLink
            data={csvData}
            filename='report.csv'
            className='hidden'
            ref={csvLinkRef}
            target='_blank'
          />
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

          {/* <TableCell classes={cell50wStyle} className={classes.flex1} align='center' /> */}
          <TableCell classes={cell50wStyle} className={classes.flex2} align='center'>{t("common.Clicks")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center'>{t("mainReport.feedback")}</TableCell>
          {/* <TableCell classes={cell50wStyle} className={classes.flex1} align='center' /> */}

          {/* <TableCell classes={cell50wStyle} className={classes.flex1} align='center'>{t("common.failedStatus")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center'>{t("mainReport.removals")}</TableCell> */}
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center'></TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center'></TableCell>

          <TableCell classes={cellStyle} className={classes.flex3} align='center'>{t("smsReport.credits")}</TableCell>

          <TableCell classes={cell50wStyle} className={classes.flex1} align='center' >{t("common.DLR")}</TableCell>
        </TableRow>
      </TableHead>
    )
  }

  const renderNameCell = (row) => {
    const { CampaignID, Name, SendDate, isChecked = false } = row

    const date = SendDate ? moment(SendDate) : ''
    const showDate = SendDate ? date.format('L') : ''
    const showTime = SendDate ? date.format('LT') : ''
    return (
      <>
        <Typography className={classes.nameEllipsis}>
          {Name}
        </Typography>
        <Typography className={classes.grayTextCell}>
          {`${showDate} ${showTime}`}
        </Typography>
      </>
    )
  }

  const colorTextStyle = {
    red: classes.textColorRed,
    blue: classes.textColorBlue,
    green: classes.sendIconText
  }
  const renderPercetangeData = (percentage = 0, type, data = {}, clickable = true) => {
    const { title = '', href = '', icon = '' } = data
    const innerRef = clickable ? href : '';
    return (
      <Box style={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap' }} >
        <Typography component={innerRef ? 'a' : 'p'} href={innerRef} className={clsx(
          classes.middleText,
          colorTextStyle[type] || '',
          { [classes.iconsFont]: !!icon })}
          target="_blank">
          {icon ? icon : `${percentage || '0'}%`}
        </Typography>
        <Typography className={clsx(
          classes.middleWrapText,
          colorTextStyle[type] || '',
        )}>
          {title}
        </Typography>
      </Box>
    )
  }

  const renderIntData = (value, type, data = {}, clickable = true) => {
    const { title = t("notifications.tblBody.total"), href = '' } = data
    const innerRef = clickable ? href : '';
    return (
      <Box style={{ display: 'flex', flexDirection: 'column' }} >
        <Typography component={innerRef ? 'a' : 'p'}
          href={innerRef}
          className={clsx(classes.middleText, colorTextStyle[type] || '')}
          target="_blank">
          {value && value.toLocaleString() || '0'}
        </Typography>
        <Typography className={clsx(classes.middleWrapText, colorTextStyle[type])}>
          {title}
        </Typography>
      </Box>
    )

  }

  const renderRow = (row) => {
    const {
      SMSCampaignID,
      Name,
      SendDate,
      FutureSends,
      success,
      ClicksCount,
      UniqueClicksCount,
      ClicksPercentage = 0,
      removed,
      replies,
      CreditsPerSms,
      failure,
      IsResponse,
      TotalSendPlan,
      totalSent,
      Type,
      PostCredits = 0
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
          {renderNameCell({ SMSCampaignID, Name, SendDate })}
        </TableCell>
        <TableCell
          classes={noBorderCellStyle}
          align='center'
          className={classes.flex1}>
          {renderIntData(TotalSendPlan, '', hrefs.TotalSendTo)}
        </TableCell>
        <TableCell
          classes={borderCellStyle}
          align='center'
          className={classes.flex1}>
          {renderIntData(totalSent, '')}
        </TableCell>
        <TableCell
          classes={borderCellStyle}
          align='center'
          className={classes.flex2}>
          <Grid container direction={'row'} className={classes.justifyBetween}>
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
          <Grid container direction={'row'} className={classes.justifyBetween}>
            <Grid item className={classes.plr10}>
              {renderIntData(CreditsPerSms, '', { title: t("mainReport.postCredits") })}
            </Grid>
            <Grid item className={clsx(classes.plr10)}>
              {renderIntData((totalSent * CreditsPerSms), '', { title: t("report.TotalCredits") })}
            </Grid>
          </Grid>
        </TableCell>
        <TableCell
          classes={noBorderCellStyle}
          align='center'
          className={classes.flex1}>
          {renderIntData(success, '', hrefs.DLR)}
        </TableCell>
      </TableRow>
    )
  }

  const renderPhoneRow = (row) => {
    const {
      SMSCampaignID,
      Name,
      SendDate,
      FutureSends,
      Success,
      ClicksCount,
      UniqueClicksCount,
      ClicksPercentage = 0,
      removed,
      CreditsPerSms,
      failure,
      IsResponse,
      TotalSendPlan,
      totalSent,
      Type,
      PostCredits = 0
    } = row
    const hrefs = getHrefs(SMSCampaignID)
    return (
      <TableRow
        key={row.ID}
        component='div'
        classes={rowStyle}>
        <TableCell classes={{ root: clsx(classes.tableCellRoot, classes.flex1, classes.tabelCellPadding) }}>
          <Box className={classes.justifyBetween}>
            <Box className={classes.inlineGrid}>
              {renderNameCell({ SMSCampaignID, Name, SendDate })}
            </Box>
          </Box>
          <Grid container spacing={2} style={{ paddingInlineStart: 10 }} >
            <Grid item>
              <Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
                {t("mainReport.locTotalSendPlan.HeaderText")}
              </Typography>
              <Grid container spacing={2}>
                <Grid item>
                  {renderIntData(TotalSendPlan, '', hrefs.TotalSendTo, false)}
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
                {t("common.Sent")}
              </Typography>
              <Grid container spacing={2}>
                <Grid item>
                  {renderIntData(totalSent, '', {}, false)}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Typography className={classes.mobileReportHead}>
            {t("mainReport.GridButtonColumnResource2.HeaderText")}
          </Typography>
          <Grid container spacing={2} style={{ paddingInlineStart: 10 }}>
            <Grid item>
              {renderIntData(ClicksCount, 'blue', hrefs.ClickCount, false)}
            </Grid>
            <Grid item>
              {renderIntData(UniqueClicksCount, 'blue', hrefs.ClickCountUnique, false)}
            </Grid>
            <Grid item>
              {renderPercetangeData(ClicksPercentage, 'blue', hrefs.PercetangeClicks, false)}
            </Grid>
          </Grid>
          <Grid container spacing={2} style={{ paddingInlineStart: 10 }} >
            <Grid item>
              <Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
                {t("common.failedStatus")}
              </Typography>
              <Grid container spacing={2}>
                <Grid item>
                  {renderIntData(failure, 'red', hrefs.Failed, false)}
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
                {t("mainReport.removals")}
              </Typography>
              <Grid container spacing={2}>
                <Grid item>
                  {renderIntData(removed, 'red', hrefs.Removed, false)}
                </Grid>
              </Grid>
            </Grid>
          </Grid>

        </TableCell>
      </TableRow>
    )
  }

  const renderTableBody = () => {
    let rowData = searchResults || smsReport;
    rowData = rowData.slice((page - 1) * rowsPerPage, (page - 1) * rowsPerPage + rowsPerPage)
    return (
      <TableBody>
        {rowData
          .map(windowSize === 'xs' ? renderPhoneRow : renderRow)}
      </TableBody>
    )
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
        rows={isSearching ? searchResults.length : smsReport.length}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={setRowsPerPage}
        rowsPerPageOptions={rowsOptions}
        page={page}
        onPageChange={setPage}
      />
    )
  }

  const renderGraph = () => {
    chart = am4core.create("chartdiv", am4charts.XYChart3D);
    chart.data = smsGraph;
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "month";
    categoryAxis.cursorTooltipEnabled = false;
    categoryAxis.renderer.labels.template.rotation = 270;

    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = `[bold]${t('mainReport.chrtMonthlySendsSmlTitle.Name')}[/]`;
    valueAxis.cursorTooltipEnabled = false;

    var series = chart.series.push(new am4charts.ColumnSeries3D());
    series.dataFields.valueY = "amount";
    series.dataFields.categoryX = "month";
    series.dataFields.color = "color";
    series.tooltipText = "{valueY}";
    series.tooltip.getFillFromObject = false;
    series.tooltip.background.strokeWidth = 2;
    series.tooltip.background.cornerRadius = 0
    series.tooltip.label.fill = am4core.color("#000000");
    series.tooltip.background.propertyFields.stroke = "color";
    series.columns.template.propertyFields.fill = "color";

    chart.cursor = new am4charts.Cursor();
    chart.exporting.menu = new am4core.ExportMenu();
    chart.exporting.menu.items = [
      {
        "label": "...",
        "menu": [
          {
            "label": "Download As ...",
            "menu": [
              { "type": "png", "label": "PNG" },
              { "type": "jpg", "label": "JPG" },
              { "type": "svg", "label": "SVG" },
              { "type": "pdf", "label": "PDF" }
            ]
          }, {
            "label": "Save As ...",
            "menu": [
              { "type": "csv", "label": "CSV" },
              { "type": "xlsx", "label": "XLSX" },
              { "type": "json", "label": "JSON" },
              { "type": "pdf", "label": "PDF" },
              { "type": "html", "label": "HTML" },
            ]
          }, {
            "label": "Print", "type": "print"
          }
        ]
      }
    ]
    chart.plugins.push(new am4plugins_annotation.Annotation());

    return (
      <>
        <Box style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <img src={arrowDown} width={50} height={50} className={classes.pl25} />
          <Typography className={clsx(classes.f28, classes.bold)} align='center'>{t('smsReport.amountSent')}</Typography>
          <img src={arrowDown} width={50} height={50} className={classes.pr25} />
        </Box>
        <Paper elevation={3} className={classes.smsGraph}>
          <div dir="ltr" id="chartdiv" style={{ width: "100%", height: "450px" }}></div>
        </Paper>
        <br />
      </>
    )
  }


  return (
    <DefaultScreen
      classes={classes}
      containerClass={classes.management}>
      {renderHeader()}
      {renderSearchSection()}
      {renderManagmentLine()}
      {renderTable()}
      {renderTablePagination()}
      {renderGraph()}
      <Loader isOpen={showLoader} showBackdrop={true} />
    </DefaultScreen>
  )
}

export default SmsReport