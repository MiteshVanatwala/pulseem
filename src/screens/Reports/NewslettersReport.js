import React,{useState,useEffect,useRef} from 'react';
import DefaultScreen from '../DefaultScreen';
import clsx from 'clsx';
import {
  Typography,Divider,Table,TableBody,TableRow,TableHead,TableCell,TableContainer,Link,
  Grid,Button,TextField,InputAdornment,Input,Box,FormControlLabel,Checkbox,Select,MenuItem,CardMedia,Card,CardContent,RadioGroup,Radio,FormGroup,FormControl, Tooltip
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
import { setRowsPerPage } from '../../redux/reducers/coreSlice';
import { setCookie } from '../../helpers/cookies';

const NewslettersReport=({classes}) => {
  const {language,windowSize,isRTL,rowsPerPage}=useSelector(state => state.core)
  const {newslettersReports}=useSelector(state => state.newsletter)
  const {t}=useTranslation()
  const [fromDate,handleFromDate]=useState(null);
  const [toDate,handleToDate]=useState(null);
  const [notificationNameSearch,setNotificationNameSearch]=useState('');
  const rowsOptions=[6,12,18]
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
    dispatch(getNewsletterReports(isDemoSend));
  }

  useEffect(getData,[dispatch,isDemoSend]);


  const renderHeader=() => {
    return (
      <>
        <Typography className={classes.managementTitle}>
          {t('mainReport.logPageHeaderResource1.Text')}
        </Typography>
        <Divider />
      </>
    )
  }

  const clearSearch=() => {
    setNotificationNameSearch('')
    handleFromDate(null)
    handleToDate(null)
    setSearchResults(null)
    setSearching(false)
  }

  const handleDownloadCsv=async () => {
    //window.open(`${apiURL}email/EmailReportsByIds/${toFileArray.toString()}`)
    //const {payload}=await
    let fileArray = toFileArray
    if (!toFileArray.length) {
      fileArray = newslettersReports.map(a => a.CampaignID);
    }

    dispatch(downloadNewsletterReport(fileArray))
    //if(payload.error) {
    //  return
    //}
    //console.log("csv data",payload)
    //setCsvData(payload)
    //csvLinkRef.current.link.click()
  }

  const renderSearchSection=() => {
    const handleSearch=() => {
      const searchArray=[{
        type: 'name',
        notificationName: notificationNameSearch
      },{
        type: 'date',
        fromDate,
        toDate
      }];

      const filtersObject={
        name: (row,values) => {
          return String(row.Name.toLowerCase()).includes(values.notificationName.toLowerCase());
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

      let sortData=newslettersReports;
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

    const handleNotificationNameChange=event => {
      setNotificationNameSearch(event.target.value)
    }

    if(windowSize==='xs') {
      return (
        <SearchField
          classes={classes}
          value={notificationNameSearch}
          onChange={handleNotificationNameChange}
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
            value={notificationNameSearch}
            onChange={handleNotificationNameChange}
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
            className={clsx({[classes.rtlSwitch]: isRTL})}
            onChange={() => setIsDemoSend(!isDemoSend)}
          />
          <Typography style={{marginInlineStart: 8}}>
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
    const dataLength=isSearching? searchResults.length:newslettersReports.length;
    return (
      <Grid container spacing={2} className={classes.linePadding} >
        {windowSize!=='xs'&&<Grid item>
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
        </Grid>}
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
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center'>{t("mainReport.GridButtonColumnResource1.HeaderText")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center' />

          <TableCell classes={cell50wStyle} className={classes.flex1} align='center' />
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center'>{t("mainReport.GridButtonColumnResource2.HeaderText")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center' />

          <TableCell classes={cell50wStyle} className={classes.flex1} align='center'>{t("mainReport.GridButtonColumnResource4.HeaderText")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center'>{t("mainReport.removals")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center' >{t("mainReport.GridButtonColumnResource3.HeaderText")}</TableCell>

          <TableCell classes={cell50wStyle} className={classes.flex1} align='center' >{t("mainReport.reasons")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex1} ></TableCell>
        </TableRow>
      </TableHead>
    )
  }

  const renderCellIcons=(row) => {
    const {CampaignID}=row

    return (
      <Box style={{display: 'flex',flex: 1,alignItems: 'center',alignSelf: 'center',justifyContent: 'center'}}>
        <ManagmentIcon
          classes={classes}
          icon={ReportsIcon}
          lable={t('mainReport.locGraph.HeaderText')}
          href={`/Pulseem/CampaignStatistics.aspx?CampaignID=${CampaignID}&fromreact=true`}
        />
      </Box>
    )
  }

  const renderNameCell=(row) => {
    const {CampaignID,Name,SendDate,isChecked=false}=row

    const date=SendDate? moment(SendDate):''
    const showDate=SendDate? date.format('DD/MM/YYYY'):''
    const showTime=SendDate? date.format('LT'):''
    return (
      <Grid container wrap="nowrap" spacing={1} alignItems='center'>
        <Grid item zeroMinWidth>
          {isChecked&&<Checkbox
            color='primary'
            value={toFileArray.includes(CampaignID)}
            onChange={() => {
              if(toFileArray.includes(CampaignID)) {
                setToFileArray(toFileArray.filter(item => item!==CampaignID))
              } else {
                setToFileArray([...toFileArray,CampaignID])
              }
            }}
          />}
        </Grid>
        <Grid zeroMinWidth item>
          <Typography noWrap className={classes.nameEllipsis}>
            {Name}
          </Typography>
          <Typography className={classes.grayTextCell}>
            {`${showDate} ${showTime}`}
          </Typography>
        </Grid>
      </Grid>
    )
  }

  const colorTextStyle={
    red: classes.textColorRed,
    blue: classes.textColorBlue,
    green: classes.sendIconText
  }
  const renderPercetangeData=(percentage=0,type,data={}) => {
    const {title='',href='',icon=''}=data
    return (
      <Box style={{display: 'flex',flexDirection: 'column',flexWrap: 'wrap'}} >
        <Typography component={href? 'a':'p'} href={href} className={clsx(
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

  const renderDataTooltip=(value,type,data={},tooltip) => {
    const {title=t("notifications.tblBody.total"),href=''}=data
    return (
      <Tooltip 
        title={`${t(tooltip)}`} 
        arrow 
        placement={'right-end'}
        classes={{
          tooltip: classes.tooltipBlack, 
          arrow: classes.fBlack
        }}>
        <Box style={{display: 'flex',flexDirection: 'column'}} >
          <Typography 
            component='a' 
            href={href} 
            className={clsx(classes.middleText,colorTextStyle[type]||'')}>
            {value&&value.toLocaleString()||'0'}
          </Typography>
          <Typography className={clsx(classes.middleWrapText,colorTextStyle[type])}>
            {title}
          </Typography>
        </Box>
      </Tooltip>
    );
  }

  const renderIntData=(value,type,data={}) => {
    const {title=t("notifications.tblBody.total"),href=''}=data
    return (
      <Box style={{display: 'flex',flexDirection: 'column'}} >
        <Typography component={href? 'a':'p'} href={href} className={clsx(classes.middleText,colorTextStyle[type]||'')}>
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
      CampaignID,
      Name,
      SendDate,
      TotalSendPlan,
      TotalSendCompleted,
      OpenCount,
      OpenCountUnique,
      ClickCount,
      ClickCountUnique,
      RemovedClients,
      SendError,
      PercetangeRemovedClients,
      PercentageOpens,
      PercetangeClicks,
      NotOpened
    }=row
    const hrefs=getHrefs(CampaignID)
    return (
      <TableRow
        key={CampaignID}
        classes={rowStyle}>
        <TableCell
          classes={cellBodyStyle}
          align='center'
          className={clsx(classes.flex3)}>
          {renderNameCell({CampaignID,Name,SendDate,isChecked: true})}
        </TableCell>
        <TableCell
          classes={noBorderCellStyle}
          align='center'
          className={classes.flex1}>
          {renderIntData(TotalSendPlan,'')}
        </TableCell>
        <TableCell
          classes={borderCellStyle}
          align='center'
          className={classes.flex1}>
          {renderIntData(TotalSendCompleted,'',hrefs.TotalSendCompleted)}
        </TableCell>
        <TableCell
          classes={noBorderCellStyle}
          align='center'
          className={classes.flex1}>
          {renderDataTooltip(OpenCount,'green',hrefs.OpenCount,'mainReport.OpensTotalTooltip.Text')}
        </TableCell>
        <TableCell
          classes={noBorderCellStyle}
          align='center'
          className={classes.flex1}>
          {renderDataTooltip(OpenCountUnique,'green',hrefs.OpenCountUnique, 'mainReport.OpensUniqueTooltip.Text')}
        </TableCell>
        <TableCell
          classes={borderCellStyle}
          align='center'
          className={classes.flex1}>
          {renderPercetangeData(PercentageOpens,'green',hrefs.PercentageOpens)}
        </TableCell>
        <TableCell
          classes={noBorderCellStyle}
          align='center'
          className={classes.flex1}>
          {renderDataTooltip(ClickCount,'blue',hrefs.ClickCount, 'mainReport.ClicksTotalTooltip.Text')}
        </TableCell>
        <TableCell
          classes={noBorderCellStyle}
          align='center'
          className={classes.flex1}>
          {renderDataTooltip(ClickCountUnique,'blue',hrefs.ClickCountUnique, 'mainReport.ClicksUniqueTooltip.Text')}
        </TableCell>
        <TableCell
          classes={borderCellStyle}
          align='center'
          className={classes.flex1}>
          {renderPercetangeData(PercetangeClicks,'blue',hrefs.PercetangeClicks)}
        </TableCell>
        <TableCell
          classes={noBorderCellStyle}
          align='center'
          className={classes.flex1}>
          {renderIntData(SendError,'red',hrefs.SendError)}
        </TableCell>

        <TableCell
          classes={noBorderCellStyle}
          align='center'
          className={classes.flex1}>
          {renderIntData(RemovedClients,'red',hrefs.RemovedClients)}
        </TableCell>
        <TableCell classes={borderCellStyle}
          align='center'
          className={classes.flex1}>
          {renderIntData(NotOpened,'red',hrefs.NotOpened)}
        </TableCell>
        <TableCell classes={borderCellStyle}
          align='center'
          className={classes.flex1}>
          <ManagmentIcon
            classes={classes}
            uIcon={<div className={classes.managmentUicon}>
              {'\uE15D'}
            </div>}
            lable={hrefs.RemoveReasons.title}
            href={hrefs.RemoveReasons.href}
          />
        </TableCell>
        <TableCell
          component="th"
          scope="row"
          classes={{root: clsx(classes.tableCellRoot,classes.paddingRightLeft10)}}
          className={classes.flex1}>
          {renderCellIcons(row)}
        </TableCell>
      </TableRow>
    )
  }

  const renderPhoneRow=(row) => {
    const {
      CampaignID,
      Name,
      SendDate,
      TotalSendPlan,
      TotalSendCompleted,
      OpenCount,
      OpenCountUnique,
      ClickCount,
      ClickCountUnique,
      RemovedClients,
      SendError,
      PercetangeRemovedClients,
      PercentageOpens,
      PercetangeClicks,
      NotOpened
    }=row
    const hrefs=getHrefs(CampaignID)
    return (
      <TableRow
        key={row.ID}
        component='div'
        classes={rowStyle}>
        <TableCell classes={{root: clsx(classes.tableCellRoot,classes.flex1,classes.tabelCellPadding)}}>
          <Box className={classes.justifyBetween}>
            <Box className={classes.inlineGrid}>
              {renderNameCell(row)}
            </Box>
            <Box>
              {renderCellIcons(row)}
            </Box>
          </Box>
          <Box>
            <Typography className={classes.mobileReportHead}>
              {t("mainReport.GridButtonColumnResource1.HeaderText")}
            </Typography>
            <Grid container spacing={2} style={{paddingInlineStart: 10}} >
              <Grid item>
                {renderIntData(OpenCount,'green',hrefs.OpenCount)}
              </Grid>
              <Grid item>
                {renderIntData(OpenCountUnique,'green',hrefs.OpenCountUnique)}
              </Grid>
              <Grid item>
                {renderPercetangeData(PercentageOpens,'green',hrefs.PercentageOpens)}
              </Grid>
            </Grid>
            <Typography className={classes.mobileReportHead}>
              {t("mainReport.GridButtonColumnResource2.HeaderText")}
            </Typography>
            <Grid container spacing={2} style={{paddingInlineStart: 10}}>
              <Grid item>
                {renderIntData(ClickCount,'blue',hrefs.ClickCount)}
              </Grid>
              <Grid item>
                {renderIntData(ClickCountUnique,'blue',hrefs.ClickCountUnique)}
              </Grid>
              <Grid item>
                {renderPercetangeData(PercetangeClicks,'blue',hrefs.PercetangeClicks)}
              </Grid>
            </Grid>
          </Box>

        </TableCell>
      </TableRow>
    )
  }

  const renderTableBody=() => {
    let rowData=searchResults||newslettersReports;
    let rpp=parseInt(rowsPerPage)
    rowData=rowData.slice((page-1)*rpp,(page-1)*rpp+rpp)
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
    const handleRowsPerPageChange=(val) => {
      dispatch(setRowsPerPage(val))
      setCookie('rpp', val, { maxAge: 2147483647 })
    }
    return (
      <TablePagination
        classes={classes}
        rows={isSearching? searchResults.length:newslettersReports.length}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={rowsOptions}
        page={page}
        onPageChange={setPage}
      />
    )
  }


  return (
    <DefaultScreen
      currentPage='reports'
      classes={classes}>
      {renderHeader()}
      {renderSearchSection()}
      {renderManagmentLine()}
      {renderTable()}
      {renderTablePagination()}
    </DefaultScreen>
  )
}

export default NewslettersReport