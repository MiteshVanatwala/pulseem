import React,{useState,useEffect,useRef} from 'react';
import DefaultScreen from '../DefaultScreen';
import clsx from 'clsx';
import {
  Typography,Divider,Table,TableBody,TableRow,TableHead,TableCell,TableContainer,Link,
  Grid,Button,TextField,InputAdornment,Input,Box,FormControlLabel,Checkbox,Select,MenuItem,CardMedia,Card,CardContent,RadioGroup,Radio,FormGroup,FormControl
} from '@material-ui/core'
import Switch from "react-switch";
import {
  SendGreenIcon,SearchIcon,ExportIcon,ReportsIcon
} from '../../assets/images/managment/index'
import {
  TablePagination,ManagmentIcon,DateField,Dialog,RestorDialogContent,SearchField
} from '../../components/managment/index'
import useCtrlHistory from '../../helpers/useCtrlHistory';
import {useSelector,useDispatch} from 'react-redux';
import {useTranslation} from 'react-i18next';
import ClearIcon from '@material-ui/icons/Clear';
import moment from 'moment';
import 'moment/locale/he';
import {apiURL} from '../../config/index'
import {CSVLink} from 'react-csv'
import {getNewsletterReports,downloadNewsletterReport} from '../../redux/reducers/newsletterSlice';
import {exportSmsReport, getSmsReport} from '../../redux/reducers/smsSlice';

const SmsReport=({classes}) => {
  const {language,windowSize,isRTL}=useSelector(state => state.core)
  const {smsReport}=useSelector(state => state.sms)
  const {t}=useTranslation()
  const [fromDate,handleFromDate]=useState(null);
  const [toDate,handleToDate]=useState(null);
  const [campaignName,setCampaignNameSearch]=useState('');
  const rowsOptions=[6,12,18]
  const [rowsPerPage,setRowsPerPage]=useState(rowsOptions[0])
  const [page,setPage]=useState(1)
  const [isSearching,setSearching]=useState(false)
  const [searchResults,setSearchResults]=useState(null)
  const [toFileArray,setToFileArray]=useState([])
  const [isDemoSend,setIsDemoSend]=useState(false)
  const [csvData,setCsvData]=useState('')
  const dateFormat='YYYY-MM-DD HH:mm:ss.FFF'
  const dispatch=useDispatch()
  const rowStyle={head: classes.tableRowReportHead,root: classes.tableRowRoot}
  const cellStyle={head: classes.tableCellHead,root: clsx(classes.tableCellRoot,classes.paddingHead)}
  const cell50wStyle={head: clsx(classes.tableCellHead),root: clsx(classes.tableCellRoot,classes.paddingHead,classes.minWidth50)}
  const cellBodyStyle={body: clsx(classes.tableCellBody),root: clsx(classes.tableCellRoot)}
  const noBorderCellStyle={body: classes.tableCellBodyNoBorder,root: clsx(classes.tableCellRoot,classes.minWidth50)}
  const borderCellStyle={body: clsx(classes.tableCellBody),root: clsx(classes.tableCellRoot,classes.minWidth50)}
  const csvLinkRef=useRef(null)

  moment.locale(language)

  const getHrefs=(id) => ({
    TotalSendCompleted: {
      href: `/Pulseem/ClientSearchResult.aspx?SentToCampaignID=${id}&fromreact=true`
    },
    OpenCount: {
      title: t('mainReport.GridButtonColumnResource1.HeaderText'),
      href: `/Pulseem/ClientSearchResult.aspx?OpenedCampaignID=${id}&fromreact=true`
    },
    OpenCountUnique: {
      title: t('common.Unique'),
      href: `/Pulseem/ClientSearchResult.aspx?OpenedCampaignID=${id}&fromreact=true`
    },
    ClickCount: {
      title: t('common.Clicks'),
      href: `/Pulseem/LinksClicksReport.aspx?CampaignID=${id}&fromreact=true`
    },
    ClickCountUnique: {
      title: t('common.Unique'),
      href: `/Pulseem/LinksClicksReport.aspx?CampaignID=${id}&fromreact=true`
    },
    RemovedClients: {
      title: t('mainReport.removed'),
      href: `/Pulseem/ClientSearchResult.aspx?RemovedClientsCampaignID=${id}&fromreact=true`
    },
    SendError: {
      title: t('mainReport.GridButtonColumnResource4.HeaderText'),
      href: `/Pulseem/CampaignErrorReport.aspx?CampaignID=${id}&fromreact=true`
    },
    PercetangeRemovedClients: {
      title: t('mainReport.removedPercents'),
      href: `/Pulseem/CampaignErrorReport.aspx?CampaignID=${id}&fromreact=true`
    },
    PercentageOpens: {
      title: t('mainReport.locUniqueOpensPercents.HeaderText'),
      href: `/Pulseem/ClientSearchResult.aspx?OpenedCampaignID=${id}&fromreact=true`
    },
    PercetangeClicks: {
      title: t('mainReport.locUniqueClicksPercents.HeaderText'),
      href: `/Pulseem/LinksClicksReport.aspx?CampaignID=${id}&fromreact=true`
    },
    NotOpened: {
      title: t("mainReport.GridButtonColumnResource3.HeaderText"),
      href: `/Pulseem/ClientSearchResult.aspx?NotOpenedCampaignID=${id}&fromreact=true`
    },
    RemoveReasons: {
      title: t("mainReport.locRemovedReason.HeaderText"),
      href: `/Pulseem/RemovedStats.aspx?CampaignID=${id}&fromreact=true`,
      icon: '\uE15D'
    }
  })

  const getData=() => {
    dispatch(getSmsReport(isDemoSend));
  }

  useEffect(getData,[dispatch,isDemoSend]);


  const renderHeader=() => {
    return (
      <>
        <Typography className={classes.managementTitle}>
          {t('common.SMSReports')}
        </Typography>
        <Divider />
      </>
    )
  }

  const clearSearch=() => {
    setCampaignNameSearch('')
    handleFromDate(null)
    handleToDate(null)
    setSearchResults(null)
    setSearching(false)
  }

  const handleDownloadCsv=async () => {
    dispatch(exportSmsReport())
  }

  const renderSearchSection=() => {
    const handleSearch=() => {
      const searchArray=[{
        type: 'name',
        campaignName: campaignName
      },{
        type: 'date',
        fromDate,
        toDate
      }];

      const filtersObject={
        name: (row,values) => {
          return String(row.Name.toLowerCase()).includes(values.campaignName.toLowerCase());
        },
        date: (row,values) => {
          const {UpdatedDate,SendDate}=row
          const lastUpdate=SendDate?
            moment(SendDate,dateFormat).valueOf()
            :moment(UpdatedDate,dateFormat).valueOf()
          const startFromDate=values.fromDate&&values.fromDate.hour(0).minute(0).valueOf()||null
          const endToDate=values.toDate&&values.toDate.hour(23).minute(59).valueOf()||null

          if(!values)
            return true
          if(fromDate&&toDate&&startFromDate&&endToDate)
            return ((lastUpdate>=startFromDate)&&(lastUpdate<=endToDate))
          if(fromDate&&startFromDate)
            return (lastUpdate>=startFromDate)
          if(toDate&&endToDate)
            return (lastUpdate<=endToDate)
          return true
        }
      }

      let sortData=smsReport;
      searchArray.forEach(values => {
        sortData=sortData.filter(row => filtersObject[values.type](row,values))
      });
      setSearchResults(sortData);
      setSearching(true);
      setPage(1);
    }

    const handleFromDateChange=(value) => {
      if(value>toDate) {
        handleToDate(null);
      }
      handleFromDate(value);
    }

    if(windowSize==='xs') {
      return (
        <SearchField
          classes={classes}
          value={campaignName}
          onChange={setCampaignNameSearch}
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
            onChange={setCampaignNameSearch}
            className={clsx(classes.textField,classes.minWidth252)}
            placeholder={t('common.CampaignName')}
          />
        </Grid>

        {windowSize!=='xs'?
          <Grid item>
            <DateField
              classes={classes}
              value={fromDate}
              onChange={handleFromDateChange}
              placeholder={t('mms.locFromDateResource1.Text')}
            />
          </Grid>
          :null}

        {windowSize!=='xs'?
          <Grid item>
            <DateField
              classes={classes}
              value={toDate}
              onChange={handleToDate}
              placeholder={t('mms.locToDateResource1.Text')}
              minDate={fromDate? fromDate:undefined}
            />
          </Grid>
          :null}

        <Grid item style={{display: 'flex',flexDirection: 'row',alignItems: 'center'}}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isDemoSend}
                onChange={()=>setIsDemoSend(!isDemoSend)}
                name="checkedB"
                color="primary"
              />
            }
            label={t('mainReport.locShowTestCampaigns.Text')}
          />
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
        {isSearching&&<Grid item>
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

  const renderManagmentLine=() => {
    const dataLength=isSearching? searchResults.length:smsReport.length;
    return (
      <Grid container spacing={2} className={classes.linePadding} >
        {/* {windowSize!=='xs'&&<Grid item>
          <Button
            variant='contained'
            size='medium'
            href='/Pulseem/CampaignComparison.aspx?fromreact=true'
            className={clsx(
              classes.actionButton,
              classes.actionButtonLightBlue
            )}>
            {t('mainReport.compareCampaigns')}
          </Button>
        </Grid>} */}
        {windowSize!=='xs'&&<Grid item>
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

  const renderTableHead=() => {
    return (
      <TableHead>
        <TableRow classes={rowStyle}>
          <TableCell classes={cellStyle} className={classes.flex3} align='center'>{t('campaigns.camapignName')}</TableCell>
          
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center'>{t("mainReport.locTotalSendPlan.HeaderText")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center'>{t("mainReport.ToalSent")}</TableCell>

          <TableCell classes={cell50wStyle} className={classes.flex1} align='center' />
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center'>{t("common.Clicks")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center' />

          <TableCell classes={cell50wStyle} className={classes.flex1} align='center'>{t("mainReport.removals")}</TableCell>

          <TableCell classes={cell50wStyle} className={classes.flex2} align='center'>{t("smsReport.credits")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center' >{t("common.DLR")}</TableCell>
        </TableRow>
      </TableHead>
    )
  }

  const renderNameCell=(row) => {
    const {CampaignID,Name,SendDate,isChecked=false}=row

    const date=SendDate? moment(SendDate):''
    const showDate=SendDate? date.format('L'):''
    const showTime=SendDate? date.format('LT'):''
    return (
      <>
        <Typography noWrap className={classes.nameEllipsis}>
          {Name}
        </Typography>
        <Typography className={classes.grayTextCell}>
          {`${showDate} ${showTime}`}
        </Typography>
      </>
    )
  }

  const colorTextStyle={
    red: classes.textColorRed,
    blue: classes.textColorBlue,
    green: classes.sendIconText
  }
  const renderPercetangeData=(percentage=0,type,data={},clickable=true) => {
    const {title='',href='',icon=''}=data
    const innerRef=clickable?href:'';
    return (
      <Box style={{display: 'flex',flexDirection: 'column',flexWrap: 'wrap'}} >
        <Typography component={innerRef? 'a':'p'} href={innerRef} className={clsx(
          classes.middleText,
          colorTextStyle[type]||'',
          {[classes.iconsFont]: !!icon})}>
          {icon? icon:`${percentage||'0'}%`}
        </Typography>
        <Typography className={clsx(
          classes.middleWrapText,
          colorTextStyle[type]||'',
          //{[classes.f15]: !!icon}
        )}>
          {title}
        </Typography>
      </Box>
    )
  }

  const renderIntData=(value,type,data={},clickable=true) => {
    const {title=t("notifications.tblBody.total"),href=''}=data
    const innerRef=clickable?href:'';
    return (
      <Box style={{display: 'flex',flexDirection: 'column'}} >
        <Typography component={innerRef? 'a':'p'} href={innerRef} className={clsx(classes.middleText,colorTextStyle[type]||'')}>
          {value&&value.toLocaleString()||'0'}
        </Typography>
        <Typography className={clsx(classes.middleWrapText,colorTextStyle[type])}>
          {title}
        </Typography>
      </Box>
    )

  }

  const renderRow=(row) => {
    const {
      SMSCampaignID,
      Name,
      SendDate,
      FutureSends,
      Success,
      ClicksCount,
      UniqueClicksCount,
      Removed,
      CreditsPerSms,
      Failure,
      IsResponse,
      TotalSendPlan,
      TotalSent,
      Type,
    }=row
    const hrefs=getHrefs(SMSCampaignID)
    return (
      <TableRow
        key={SMSCampaignID}
        classes={rowStyle}>
        <TableCell
          classes={cellBodyStyle}
          align='center'
          className={clsx(classes.flex3)}>
          {renderNameCell({SMSCampaignID,Name,SendDate})}
        </TableCell>
        <TableCell
          classes={noBorderCellStyle}
          align='center'
          className={classes.flex1}>
          {renderIntData(TotalSendPlan,'',hrefs.TotalSendCompleted)}
        </TableCell>
        <TableCell
          classes={borderCellStyle}
          align='center'
          className={classes.flex1}>
          {renderIntData(TotalSent,'',hrefs.TotalSendCompleted)}
        </TableCell>
        <TableCell
          classes={noBorderCellStyle}
          align='center'
          className={classes.flex1}>
          {renderIntData(ClicksCount,'blue',hrefs.ClickCount)}
        </TableCell>
        <TableCell
          classes={noBorderCellStyle}
          align='center'
          className={classes.flex1}>
          {renderIntData(UniqueClicksCount,'blue',hrefs.ClickCountUnique)}
        </TableCell>
        <TableCell
          classes={borderCellStyle}
          align='center'
          className={classes.flex1}>
          {renderPercetangeData(UniqueClicksCount,'blue',hrefs.PercetangeClicks)}
        </TableCell>
        <TableCell
          classes={borderCellStyle}
          align='center'
          className={classes.flex1}>
          {renderIntData(Failure,'red',hrefs.RemovedClients)}
        </TableCell>

        <TableCell
          classes={noBorderCellStyle}
          align='center'
          className={classes.flex1}>
          {renderIntData(TotalSendPlan,'',{title: t("mainReport.billingCredits")})}
        </TableCell>
        <TableCell
          classes={borderCellStyle}
          align='center'
          className={classes.flex1}>
          {renderIntData(TotalSendPlan,'',{title: t("mainReport.postCredits")})}
        </TableCell>
        <TableCell
          classes={noBorderCellStyle}
          align='center'
          className={classes.flex1}>
          {renderIntData(TotalSendPlan,'')}
        </TableCell>
      </TableRow>
    )
  }

  const renderPhoneRow=(row) => {
    const {
      SMSCampaignID,
      Name,
      SendDate,
      FutureSends,
      Success,
      ClicksCount,
      UniqueClicksCount,
      Removed,
      CreditsPerSms,
      Failure,
      IsResponse,
      TotalSendPlan,
      TotalSent,
      Type,
    }=row
    const hrefs=getHrefs(SMSCampaignID)
    return (
      <TableRow
        key={row.ID}
        component='div'
        classes={rowStyle}>
        <TableCell classes={{root: clsx(classes.tableCellRoot,classes.flex1,classes.tabelCellPadding)}}>
          <Box className={classes.justifyBetween}>
            <Box className={classes.inlineGrid}>
              {renderNameCell({SMSCampaignID,Name,SendDate})}
            </Box>
          </Box>
          <Box>
            <Grid container spacing={2} style={{paddingInlineStart: 10}} >
              <Grid item>
                <Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
                  {t("mainReport.locTotalSendPlan.HeaderText")}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item>
                    {renderIntData(TotalSendPlan,'',hrefs.TotalSendCompleted, false)}
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                <Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
                  {t("common.Sent")}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item>
                    {renderIntData(TotalSent,'',hrefs.TotalSendCompleted, false)}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Typography className={classes.mobileReportHead}>
              {t("mainReport.GridButtonColumnResource2.HeaderText")}
            </Typography>
            <Grid container spacing={2} style={{paddingInlineStart: 10}}>
              <Grid item>
                {renderIntData(ClicksCount,'blue',hrefs.ClickCount, false)}
              </Grid>
              <Grid item>
                {renderIntData(UniqueClicksCount,'blue',hrefs.ClickCountUnique, false)}
              </Grid>
              <Grid item>
                {renderPercetangeData(UniqueClicksCount,'blue',hrefs.PercetangeClicks, false)}
              </Grid>
            </Grid>
            <Typography className={classes.mobileReportHead}>
              {t("mainReport.removals")}
            </Typography>
            <Grid container spacing={2} style={{paddingInlineStart: 10}}>
              <Grid item>
                {renderIntData(Failure,'red',hrefs.RemovedClients, false)}
              </Grid>
            </Grid>
          </Box>

        </TableCell>
      </TableRow>
    )
  }

  const renderTableBody=() => {
    let rowData=searchResults||smsReport;
    rowData=rowData.slice((page-1)*rowsPerPage,(page-1)*rowsPerPage+rowsPerPage)
    return (
      <TableBody>
        {rowData
          .map(windowSize==='xs'? renderPhoneRow:renderRow)}
      </TableBody>
    )
  }

  const renderTable=() => {
    return (
      <TableContainer className={classes.tableStyle}>
        <Table className={classes.tableContainer}>
          {windowSize!=='xs'&&renderTableHead()}
          {renderTableBody()}
        </Table>
      </TableContainer>
    )
  }

  const renderTablePagination=() => {
    return (
      <TablePagination
        classes={classes}
        rows={isSearching? searchResults.length:smsReport.length}
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
      classes={classes}>
      {renderHeader()}
      {renderSearchSection()}
      {renderManagmentLine()}
      {renderTable()}
      {renderTablePagination()}
    </DefaultScreen>
  )
}

export default SmsReport