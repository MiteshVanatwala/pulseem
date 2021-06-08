import React,{useState,useEffect,useRef} from 'react';
import DefaultScreen from '../DefaultScreen';
import clsx from 'clsx';
import {
  Typography,Divider,Table,TableBody,TableRow,TableHead,TableCell,TableContainer,Link,
  Grid,Button,TextField,IconButton,InputAdornment,Input,Box,FormControlLabel,Checkbox,Select,MenuItem,CardMedia,Card,CardContent,RadioGroup,Radio,FormGroup,FormControl
} from '@material-ui/core'
import {
  SendGreenIcon,SearchIcon,ExportIcon,ReportsIcon
} from '../../assets/images/managment/index'
import {
  TablePagination,ManagmentIcon,DateField,Dialog,RestorDialogContent,SearchField
} from '../../components/managment/index'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import useCtrlHistory from '../../helpers/useCtrlHistory';
import {useSelector,useDispatch} from 'react-redux';
import {useTranslation} from 'react-i18next';
import ClearIcon from '@material-ui/icons/Clear';
import moment from 'moment';
import 'moment/locale/he';
import {getNewsletterReports} from '../../redux/reducers/newsletterSlice';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {Preview} from '../../components/Notifications/Preview/Preview';
import {getCookie,setCookie} from '../../helpers/cookies';

const NewslettersReport=({classes}) => {
  const {language,windowSize}=useSelector(state => state.core)
  const {newslettersReports}=useSelector(state => state.newsletter)
  const {t}=useTranslation()
  const [fromDate,handleFromDate]=useState(null);
  const [toDate,handleToDate]=useState(null);
  const [scriptDialog,handleScriptDialogCheck]=useState(false);
  const [notificationNameSearch,setNotificationNameSearch]=useState('');
  const [scriptDirectory,setScriptDirectory]=useState(0);
  const [copyStatus,setCopyStatus]=useState(false);
  const [scriptPath,setScriptPath]=useState(0);
  const [apiToken,setApiToken]=useState(0);
  const rowsOptions=[6,12,18]
  const [rowsPerPage,setRowsPerPage]=useState(rowsOptions[0])
  const [page,setPage]=useState(1)
  const [isSearching,setSearching]=useState(false)
  const [searchResults,setSearchResults]=useState(null)
  const [toFileArray,setToFileArray]=useState([])
  const [dialogType,setDialogType]=useState(null)
  const [restoreArray,setRestoreArray]=useState([]);
  const [isDemoSend,setIsDemoSend]=useState(false)
  const history=useCtrlHistory()
  const dateFormat='YYYY-MM-DD HH:mm:ss.FFF'
  const dispatch=useDispatch()
  const rowStyle={head: classes.tableRowReportHead,root: classes.tableRowRoot}
  const cellStyle={head: classes.tableCellHead,root: clsx(classes.tableCellRoot,classes.paddingHead)}
  const cell50wStyle={head: clsx(classes.tableCellHead),root: clsx(classes.tableCellRoot,classes.paddingHead,classes.minWidth75)}
  const cellBodyStyle={body: clsx(classes.tableCellBody),root: clsx(classes.tableCellRoot)}
  const noBorderCellStyle={body: classes.tableCellBodyNoBorder,root: clsx(classes.tableCellRoot,classes.minWidth75)}
  const borderCellStyle={body: clsx(classes.tableCellBody),root: clsx(classes.tableCellRoot,classes.minWidth75)}
  const baseUrl='https://www.pulseemdev.co.il/pulseem';
  const scriptDialogCookie=getCookie('scriptDialog')
  const hideScriptDialog=(scriptDialogCookie==='true')
  const [showScriptDialog,setShowScriptDialog]=useState(!hideScriptDialog)
  const refScriptCode=useRef(null);
  moment.locale(language)

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
      <Grid container spacing={2} className={classes.lineTopMarging}>
        <Grid item>
          <TextField
            variant='outlined'
            size='small'
            value={notificationNameSearch}
            onChange={handleNotificationNameChange}
            className={clsx(classes.textField,classes.minWidth252)}
            placeholder={t('mainReport.GridBoundColumnResource2.HeaderText')}
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

        <Grid item >
          <FormControlLabel
            control={<Checkbox color='primary' checked={isDemoSend} onChange={() => setIsDemoSend(!isDemoSend)} />}
            label="שליחת ניסיון"
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
    const dataLength=isSearching? searchResults.length:newslettersReports.length;
    return (
      <Grid container spacing={2} className={classes.linePadding} >
        {windowSize!=='xs'&&<Grid item>
          <Button
            variant='contained'
            size='medium'
            href='/react/Notification/create'
            className={clsx(
              classes.actionButton,
              classes.actionButtonLightBlue
            )}>
            {t('notifications.buttons.createNotification')}
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
            //onClick={}
            startIcon={<ExportIcon />}>
            {t('notifications.restoreDeleted')}
          </Button>
        </Grid>}
        <Grid item className={classes.groupsLableContainer} >
          <Typography className={classes.groupsLable}>
            {`${dataLength} ${t('notifications.notifications')}`}
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

          <TableCell classes={cell50wStyle} className={classes.flex1} align='center'>{t("notifications.tblHeader.toSend")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center'>{t("notifications.tblHeader.toSend")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center'>{t("campaigns.GridBoundColumnResource4.HeaderText")}</TableCell>

          <TableCell classes={cell50wStyle} className={classes.flex1} align='center' />
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center'>{t("notifications.tblHeader.sent")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center' />

          <TableCell classes={cell50wStyle} className={classes.flex1} align='center' />
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center'>{t("notifications.tblHeader.sent")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center' />

          <TableCell classes={cell50wStyle} className={classes.flex1} align='center'>{t("notifications.tblHeader.toSend")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex2} align='center' style={{}}>{t("notifications.tblHeader.failed")}</TableCell>

          <TableCell classes={cellStyle} className={classes.flex1} ></TableCell>
        </TableRow>
      </TableHead>
    )
  }

  const renderCellIcons=(row) => {
    const {StatusID,HasGroups,ID}=row

    return (
      <Box style={{display: 'flex',flex: 1,alignItems: 'center',alignSelf: 'center',justifyContent: 'center'}}>
        <ManagmentIcon
          classes={classes}
          icon={ReportsIcon}
          lable={t('campaigns.Reports')}
        //href={`/react/Notification/send/${ID}`}
        />
      </Box>
    )
  }

  const renderStatusCell=(status) => {
    const statuses={
      0: 'common.Created',
      2: 'common.Pending',
      3: 'common.Sending',
      4: 'common.Sent',
      5: 'common.ScheduledDate',
      7: 'common.failedStatus'
    }
    return (
      <>
        <Typography className={clsx(
          classes.wrapText,
          classes.recipientsStatus,
          {
            [classes.statusCreated]: status===0,
            [classes.statusPending]: status===2,
            [classes.statusSending]: status===3,
            [classes.statusSent]: status===4,
            [classes.statusScheduled]: status===5,
            [classes.statusFailed]: status===7,
          }
        )}>
          {t(statuses[status])}
        </Typography>
      </>
    )
  }

  const renderNameCell=(row) => {
    const {CampaignID,Name}=row
    return (
      <Grid container wrap="nowrap" spacing={1} alignItems='center'>
        <Grid item zeroMinWidth>
          <Checkbox
            color='primary'
            value={toFileArray.includes(CampaignID)}
            onChange={() => {
              if(toFileArray.includes(CampaignID)) {
                setToFileArray(toFileArray.filter(item => item!==CampaignID))
              } else {
                setToFileArray([...toFileArray,CampaignID])
              }
            }}
          />
        </Grid>
        <Grid zeroMinWidth item>
          <Typography noWrap className={classes.nameEllipsis}>
            {Name}
          </Typography>
        </Grid>
      </Grid>
    )
  }

  const renderDateCell=(sendDate) => {
    if(!sendDate)
      return null
    const date=moment(sendDate)
    const showDate=date.format('L')
    const showTime=date.format('LT')

    return (
      <>
        <Typography>{showDate}</Typography>
        <Typography>{showTime}</Typography>
      </>
    )
  }


  const colorTextStyle={
    red: classes.textColorRed,
    blue: classes.textColorBlue,
    green: classes.sendIconText
  }
  const renderPercetangeData=(percentage,type,href) => {
    return (
      <>
        <Typography component={href? 'a':'p'} href={href} className={clsx(classes.middleText,colorTextStyle[type]||'')}>
          {`${percentage||'0'}%`}
        </Typography>
        <Typography component={href? 'a':'p'} href={href} className={clsx(classes.middleText,colorTextStyle[type]||'')}>
          {t("notifications.tblBody.total")}
        </Typography>
      </>
    )
  }

  const renderIntData=(value,type,href) => {

    return (
      <Box style={{display: 'flex',flexDirection: 'column'}} >
        <Typography component={href? 'a':'p'} href={href} className={clsx(classes.middleText,colorTextStyle[type]||'')}>
          {value&&value.toLocaleString()||'0'}
        </Typography>
        <Typography component={href? 'a':'p'} href={href} className={clsx(classes.middleText,colorTextStyle[type])}>
          {t("notifications.tblBody.total")}
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
      PercetangeClicks
    }=row

    const hrefs={
      TotalSendCompleted: `/Pulseem/ClientSearchResult.aspx?SentToCampaignID=${CampaignID}`,
      OpenCount: `/Pulseem/ClientSearchResult.aspx?OpenedCampaignID=${CampaignID}`,
      OpenCountUnique: `/Pulseem/ClientSearchResult.aspx?OpenedCampaignID=${CampaignID}`,
      ClickCount: `/Pulseem/LinksClicksReport.aspx?CampaignID=${CampaignID}`,
      ClickCountUnique: `/Pulseem/LinksClicksReport.aspx?CampaignID=${CampaignID}`,
      RemovedClients: `/Pulseem/ClientSearchResult.aspx?RemovedClientsCampaignID=${CampaignID}`,
      SendError: `/Pulseem/CampaignErrorReport.aspx?CampaignID=${CampaignID}`,
      PercetangeRemovedClients: '',
      PercentageOpens: `/Pulseem/ClientSearchResult.aspx?OpenedCampaignID=${CampaignID}`,
      PercetangeClicks: `/Pulseem/LinksClicksReport.aspx?CampaignID=${CampaignID}`
    }
    return (
      <TableRow
        key={CampaignID}
        classes={rowStyle}>
        <TableCell
          classes={cellBodyStyle}
          align='center'
          className={clsx(classes.flex3)}>
          {renderNameCell({CampaignID,Name})}
        </TableCell>
        <TableCell
          classes={noBorderCellStyle}
          align='center'
          className={classes.flex1}>
          {renderDateCell(SendDate)}
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
          {renderIntData(OpenCount,'green',hrefs.OpenCount)}
        </TableCell>
        <TableCell
          classes={noBorderCellStyle}
          align='center'
          className={classes.flex1}>
          {renderIntData(OpenCountUnique,'green',hrefs.OpenCountUnique)}
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
          {renderIntData(ClickCount,'blue',hrefs.ClickCount)}
        </TableCell>
        <TableCell
          classes={noBorderCellStyle}
          align='center'
          className={classes.flex1}>
          {renderIntData(ClickCountUnique,'blue',hrefs.ClickCountUnique)}
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
          classes={borderCellStyle}
          align='center'
          className={classes.flex2}>
          <Grid container justify='space-between' style={{paddingInline: 25}} >
            <Grid item>
              {renderIntData(RemovedClients,'red',hrefs.RemovedClients)}
            </Grid>
            <Grid item>
              {renderPercetangeData(PercetangeRemovedClients,'red',hrefs.PercetangeRemovedClients)}
            </Grid>
          </Grid>
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
    return (
      <TableRow
        key={row.ID}
        component='div'
        classes={rowStyle}>
        <TableCell classes={{root: clsx(classes.tableCellRoot,classes.flex1)}}>
          <Box className={classes.justifyBetween}>
            <Box className={classes.inlineGrid}>
              {renderNameCell(row)}
            </Box>
            <Box>
              {renderStatusCell(row.StatusID)}
            </Box>
          </Box>
          {renderCellIcons(row)}
        </TableCell>
      </TableRow>
    )
  }

  const renderTableBody=() => {
    let rowData=searchResults||newslettersReports;
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
        rows={isSearching? searchResults.length:newslettersReports.length}
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
      currentPage='notifications'
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