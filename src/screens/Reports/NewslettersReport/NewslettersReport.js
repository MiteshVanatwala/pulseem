import React, { useState, useEffect, useRef } from 'react';
import DefaultScreen from '../../DefaultScreen';
import clsx from 'clsx';
import {
  Typography, Divider, Table, TableBody, TableRow, TableHead, TableCell, TableContainer,
  Grid, Button, TextField, Box, Checkbox, Tooltip
} from '@material-ui/core'
import Switch from "react-switch";
import { SearchIcon, ExportIcon, ReportsIcon } from '../../../assets/images/managment/index'
import {
  TablePagination, ManagmentIcon, DateField, SearchField
} from '../../../components/managment/index'
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import ClearIcon from '@material-ui/icons/Clear';
import moment from 'moment';
import 'moment/locale/he';
import { CSVLink } from 'react-csv'
import { getNewsletterReports } from '../../../redux/reducers/newsletterSlice';
import { setRowsPerPage } from '../../../redux/reducers/coreSlice';
import { getCookie, setCookie } from '../../../helpers/cookies';
import { exportFile } from '../../../helpers/exportFromJson';

const NewslettersReport = ({ classes }) => {
  const { language, windowSize, isRTL, rowsPerPage } = useSelector(state => state.core)
  const { newslettersReports } = useSelector(state => state.newsletter)
  const { t } = useTranslation()
  const [fromDate, handleFromDate] = useState(null);
  const [toDate, handleToDate] = useState(null);
  const [notificationNameSearch, setNotificationNameSearch] = useState('');
  const rowsOptions = [6, 10, 20, 50]
  const [page, setPage] = useState(1)
  const [isSearching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState(null)
  const [toFileArray, setToFileArray] = useState([])
  const [isDemoSend, setIsDemoSend] = useState(false)
  const [csvData, setCsvData] = useState('')
  const dateFormat = 'YYYY-MM-DD HH:mm:ss.FFF'
  const dispatch = useDispatch()
  const rowStyle = { head: classes.tableRowReportHead, root: clsx(classes.tableRowRoot) }
  const cellStyle = { head: classes.tableCellHead, root: clsx(classes.tableCellRoot, classes.paddingHead) }
  const cell50wStyle = { head: clsx(classes.tableCellHead), root: clsx(classes.tableCellRoot, classes.paddingHead, classes.minWidth50) }
  const cellBodyStyle = { body: clsx(classes.tableCellBody), root: clsx(classes.tableCellRoot, classes.tableCellRootResponsive) }
  const noBorderCellStyle = { body: classes.tableCellBodyNoBorder, root: clsx(classes.tableCellRoot, classes.minWidth50) }
  const borderCellStyle = { body: clsx(classes.tableCellBody), root: clsx(classes.tableCellRoot, classes.minWidth50) }
  const csvLinkRef = useRef(null)

  moment.locale(language)

  const getHrefs = (id) => ({
    TotalSendCompleted: {
      href: `/Pulseem/ClientSearchResult.aspx?SentToCampaignID=${id}&fromreact=true`
      //href: `/CampaignStatistics/${id}`
    },
    OpenCount: {
      title: t('mainReport.GridButtonColumnResource1.HeaderText'),
      href: ``,
      clickable: false
      //href: `/CampaignStatistics/${id}?tab=2`
    },
    OpenCountUnique: {
      title: t('common.Unique'),
      href: `/Pulseem/ClientSearchResult.aspx?OpenedCampaignID=${id}&fromreact=true`,
      clickable: true
      //href: `/CampaignStatistics/${id}?tab=2`
    },
    ClickCount: {
      title: t('common.Clicks'),
      href: `/Pulseem/LinksClicksReport.aspx?CampaignID=${id}&fromreact=true`,
      clickable: false
      //href: `/CampaignStatistics/${id}?tab=2`
    },
    ClickCountUnique: {
      title: t('common.Unique'),
      href: `/Pulseem/LinksClicksReport.aspx?CampaignID=${id}&fromreact=true`,
      clickable: true
      //href: `/CampaignStatistics/${id}?tab=2`
    },
    RemovedClients: {
      title: t('mainReport.removed'),
      href: `/Pulseem/ClientSearchResult.aspx?RemovedClientsCampaignID=${id}&fromreact=true`
      //href: `/CampaignStatistics/${id}?tab=2`
    },
    SendError: {
      title: t('mainReport.GridButtonColumnResource4.HeaderText'),
      href: `/Pulseem/CampaignErrorReport.aspx?CampaignID=${id}&fromreact=true`
      //href: `/CampaignStatistics/${id}?tab=2`
    },
    PercetangeRemovedClients: {
      title: t('mainReport.removedPercents'),
      href: `/Pulseem/CampaignErrorReport.aspx?CampaignID=${id}&fromreact=true`
      //href: `/CampaignStatistics/${id}?tab=2`
    },
    PercentageOpens: {
      title: t('mainReport.GridButtonColumnResource1.UniquePercentage'),
      href: `/Pulseem/ClientSearchResult.aspx?OpenedCampaignID=${id}&fromreact=true`
      //href: `/CampaignStatistics/${id}?tab=2`
    },
    PercetangeClicks: {
      title: t('mainReport.GridButtonColumnResource1.UniquePercentage'),
      href: `/Pulseem/LinksClicksReport.aspx?CampaignID=${id}&fromreact=true`
      //href: `/CampaignStatistics/${id}?tab=2`
    },
    NotOpened: {
      title: t("mainReport.GridButtonColumnResource3.HeaderText"),
      href: `/Pulseem/ClientSearchResult.aspx?NotOpenedCampaignID=${id}&fromreact=true`
      //href: `/CampaignStatistics/${id}?tab=2`
    },
    RemoveReasons: {
      title: t("mainReport.locRemovedReason.HeaderText"),
      href: `/Pulseem/RemovedStats.aspx?CampaignID=${id}&fromreact=true`,
      icon: '\uE15D'
    }
  })

  // const columnHead = {
  //   CampaignID: t('mainReport.CampaignID'),
  //   Name: t('master.lblContactNameResource1.Text'),
  //   Names: t('mainReport.names'),
  //   SendDate: t('mainReport.GridBoundColumnResource3.HeaderText'),
  //   FixedSendingDate: t('mainReport.fixedSendingDate'),
  //   TotalSendCompleted: t('mainReport.totalSendCompleted'),
  //   TotalSendPlan: t('mainReport.totalSendPlan'),
  //   OpenCount: t('mainReport.openCount'),
  //   OpenCountUnique: t('mainReport.openCountUnique'),
  //   ClickCount: t('mainReport.clickCount'),
  //   ClickCountUnique: t('mainReport.clickCountUnique'),
  //   NotOpened: t('mainReport.notOpened'),
  //   SendError: t('mainReport.sendError'),
  //   RemovedClients: t('mainReport.removedClients'),
  //   GroupsNames: t('mainReport.groupsNames'),
  //   Status: t('common.Status'),
  //   Files: t('mainReport.files'),
  //   FileNames: t('mainReport.fileNames'),
  //   PercentageOpens: t('mainReport.percentageOpens'),
  //   PercetangeClicks: t('mainReport.percetangeClicks'),
  //   PercetangeRemovedClients: t('mainReport.percetangeRemovedClients'),
  //   Attachments: t('mainReport.attachments'),
  //   TotalBytes: t('mainReport.totalBytes')
  // }
  const exportColumnHeader = {
    "Name": t('master.lblContactNameResource1.Text'),
    "SendDate": t('mainReport.GridBoundColumnResource3.HeaderText'),
    "TotalSendPlan": t('mainReport.totalSendPlan'),
    "TotalSendCompleted": t('mainReport.totalSendCompleted'),
    "OpenCount": t('mainReport.openCount'),
    "OpenCountUnique": t('mainReport.openCountUnique'),
    "PercentageOpens": t('mainReport.percentageOpens'),
    "ClickCount": t('mainReport.clickCount'),
    "ClickCountUnique": t('mainReport.clickCountUnique'),
    "PercetangeClicks": t('mainReport.percetangeClicks'),
    "NotOpened": t('mainReport.notOpened'),
    "SendError": t('mainReport.sendError'),
    "RemovedClients": t('mainReport.removedClients'),
    "FileNames": t('mainReport.fileNames'),
    "Attachments": t('mainReport.attachments'),
    "Status": t('common.Status')
  }

  const getData = () => {
    dispatch(getNewsletterReports(isDemoSend));
  }

  useEffect(() => {
    getData();

    const lastPage = getCookie('newsletterReportlastPage') || 1;
    setPage(parseInt(lastPage))
    setCookie('newsletterReportlastPage', '', { maxAge: -1 })

  }, [dispatch, isDemoSend]);


  const renderHeader = () => {
    return (
      <>
        <Typography className={classes.managementTitle}>
          {t('mainReport.logPageHeaderResource1.Text')}
        </Typography>
        <Divider />
      </>
    )
  }

  const clearSearch = () => {
    setNotificationNameSearch('')
    handleFromDate(null)
    handleToDate(null)
    setSearchResults(null)
    setSearching(false)
  }

  const handleDownloadCsv = async () => {
    let orderList = [];
    function preferredOrder(obj, order) {
      const arr = [];
      for (var i = 0; i < obj.length; i++) {
        var newObject = {};
        order.map((o) => {
          newObject[o] = obj[i][o];
        });
        arr.push(newObject);
      }
      return arr;
    }

    if (toFileArray.length > 0) {
      const fileArray = newslettersReports.filter(a => toFileArray.includes(a.CampaignID));
      orderList = preferredOrder(fileArray, Object.keys(exportColumnHeader));
      exportFile({
        data: orderList,
        fileName: 'emailReport',
        exportType: 'xls',
        fields: exportColumnHeader
      });
    }
    else {
      orderList = preferredOrder(searchResults || newslettersReports, Object.keys(exportColumnHeader));
      exportFile({
        data: orderList,
        fileName: 'emailReport',
        exportType: 'xls',
        fields: exportColumnHeader
      });
    }

    setToFileArray([]);

  }


  const renderSearchSection = () => {
    const handleSearch = () => {
      const searchArray = [{
        type: 'name',
        notificationName: notificationNameSearch
      }, {
        type: 'date',
        fromDate,
        toDate
      }];

      const filtersObject = {
        name: (row, values) => {
          return String(row.Name.toLowerCase()).includes(values.notificationName.toLowerCase());
        },
        date: (row, values) => {
          const { UpdatedDate, SendDate } = row
          const lastUpdate = SendDate ?
            moment(SendDate, dateFormat).valueOf()
            : moment(UpdatedDate, dateFormat).valueOf()
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

      let sortData = newslettersReports;
      searchArray.forEach(values => {
        sortData = sortData.filter(row => filtersObject[values.type](row, values))
      });
      setSearchResults(sortData);
      setSearching(true);
      setPage(1);
    }

    const handleFromDateChange = (value) => {
      if (value > toDate) {
        handleToDate(null);
      }
      handleFromDate(value);
    }

    const handleNotificationNameChange = event => {
      setNotificationNameSearch(event.target.value)
    }

    if (windowSize === 'xs') {
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
    const dataLength = isSearching ? searchResults.length : newslettersReports.length;
    return (
      <Grid container spacing={2} className={classes.linePadding}>
        {/* {windowSize !== 'xs' && <Grid item>
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
          <TableCell classes={cellStyle} className={classes.flex4} align='center'>{t('campaigns.camapignName')}</TableCell>
          <TableCell classes={cell50wStyle} className={clsx(classes.flex1, classes.noPonSmallScreen)} align='center'><span className={classes.hideOnSmallScreen}>{t("mainReport.locTotalSendPlan.HeaderText")}</span></TableCell>
          <TableCell classes={cell50wStyle} className={clsx(classes.flex1, classes.noPonSmallScreen)} align='center'><span className={classes.hideOnSmallScreen}>{t("mainReport.ToalSent")}</span> </TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex4} align='center'>{t("mainReport.GridButtonColumnResource1.HeaderText")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex4} align='center'>{t("mainReport.GridButtonColumnResource2.HeaderText")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex4} align='center'></TableCell>
          <TableCell classes={cell50wStyle} className={clsx(classes.flex1, classes.hideOnSmallScreen)} align='center'></TableCell>
          <TableCell classes={cellStyle} className={classes.flex1} ></TableCell>
        </TableRow>
      </TableHead>
    )
  }

  const renderCellIcons = (row) => {
    const { CampaignID } = row

    return (
      <Box style={{ display: 'flex', flex: 1, alignItems: 'center', alignSelf: 'center', justifyContent: 'center' }}>
        <ManagmentIcon
          classes={classes}
          iconClass={classes.w25}
          textClass={classes.lineHeight1point2}
          icon={ReportsIcon}
          lable={t('mainReport.locGraph.HeaderText')}
          href={`/Pulseem/CampaignStatistics.aspx?CampaignID=${CampaignID}`}
        />
      </Box>
    )
  }

  const renderNameCell = (row) => {
    const { CampaignID, Name, SendDate, isChecked = false, Status } = row

    const date = SendDate ? moment(SendDate) : ''
    const showDate = SendDate ? date.format('DD/MM/YYYY') : ''
    const showTime = SendDate ? date.format('LT') : ''

    if (windowSize === 'xs') {
      return (
        <>
          <Tooltip
            arrow
            title={Name}
            placement={'top'}
            classes={{
              tooltip: clsx(classes.tooltipBlack, classes.tooltipPlacement),
              arrow: classes.fBlack
            }}
          >
            <Typography noWrap={false} className={classes.nameEllipsis}>
              {Name}
            </Typography>
          </Tooltip>
          <Typography className={classes.grayTextCell}>
            {t("report.SendDate")} {`${showDate} ${showTime}`}
            {row.Status === 5 ? <Typography className={clsx(classes.f14, classes.red)}>({t("campaigns.Canceled")})</Typography> : null}
          </Typography>
        </>
      )
    }
    return (
      <Grid container wrap="nowrap" spacing={1} alignItems='center'>
        <Grid item className={clsx(windowSize !== 'xs' && classes.w20)}>
          {isChecked && <Checkbox
            color='primary'
            checked={toFileArray.includes(CampaignID)}
            onChange={() => {
              if (toFileArray.includes(CampaignID)) {
                setToFileArray(toFileArray.filter(item => item !== CampaignID))
              } else {
                setToFileArray([...toFileArray, CampaignID])
              }
            }}
          />}
        </Grid>
        <Grid item className={clsx(windowSize !== 'xs' && classes.w80)}>
          <Tooltip
            arrow
            title={row.Name}
            placement={'top'}
            classes={{
              tooltip: clsx(classes.tooltipBlack, classes.tooltipPlacement),
              arrow: classes.fBlack
            }}
          >
            <Typography noWrap={false} className={classes.nameEllipsis}>
              {row.Name}
            </Typography>
          </Tooltip>
          <Typography className={classes.grayTextCell}>
            {t("report.SendDate")} {`${showDate} ${showTime}`}
            {row.Status === 5 ? <Typography className={clsx(classes.f14, classes.red)}>({t("campaigns.Canceled")})</Typography> : null}
          </Typography>
        </Grid>
      </Grid>
    )
  }

  const colorTextStyle = {
    red: classes.textColorRed,
    blue: classes.textColorBlue,
    green: classes.sendIconText
  }
  const renderPercetangeData = (percentage = 0, type, data = {}, clickable = true) => {
    const { title = '', href = '', icon = '' } = data;
    const innerHref = clickable ? href : '';
    return (
      <Box style={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap' }} >
        <Typography component={innerHref ? 'a' : 'p'} href={innerHref} className={clsx(
          classes.middleTxt,
          colorTextStyle[type] || '',
          { [classes.iconsFont]: !!icon })}>
          {icon ? icon : `${percentage || '0'}%`}
        </Typography>
        <Typography className={clsx(
          classes.middleWrapText, classes.lineHeight1point2,
          colorTextStyle[type] || '',
        )}>
          {title}
        </Typography>
      </Box>
    )
  }

  const renderDataTooltip = (value, type, data = {}, tooltip) => {
    const { title = t("notifications.tblBody.total"), href = '', clickable = false } = data
    return (
      <Tooltip
        title={`${t(tooltip)}`}
        arrow
        placement={isRTL ? 'left-end' : 'right-end'}
        classes={{
          tooltip: classes.tooltipBlack,
          arrow: classes.fBlack
        }}>
        <Box className={classes.cellText}>
          <Typography
            component={clickable ? 'a' : 'p'}
            href={href}
            className={clsx(classes.middleText, colorTextStyle[type] || '')}>
            {value && value.toLocaleString() || '0'}
          </Typography>
          <Typography className={clsx(classes.middleWrapText, colorTextStyle[type])}>
            {title}
          </Typography>
        </Box>
      </Tooltip>
    );
  }

  const renderIntData = (value, type, data = {}, clickable, innerTitle = '') => {
    const { title = t("notifications.tblBody.total"), href = '' } = data
    return (
      <Box className={classes.cellText}>
        <Typography component={href !== '' && clickable ? 'a' : 'p'} href={href ? href : ''} className={clsx(classes.middleTxt, colorTextStyle[type] || '')}>
          {value && value.toLocaleString() || '0'}
        </Typography>
        <Typography className={clsx(classes.middleWrapText, colorTextStyle[type])}>
          {title} {innerTitle !== '' ? <span className={classes.showTitleInline}>{innerTitle}</span> : null}
        </Typography>
      </Box>
    )

  }

  const renderRow = (row) => {
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
      Status,
      PercentageOpens,
      PercetangeClicks,
      NotOpened
    } = row
    const hrefs = getHrefs(CampaignID)
    return (
      <TableRow
        key={CampaignID}
        classes={rowStyle}
        className={clsx(classes.maxHeight87, classes.maxHeightReponsive)}
      >
        <TableCell
          classes={cellBodyStyle}
          align='center'
          className={clsx(classes.flex4)}>
          {renderNameCell({ CampaignID, Name, SendDate, isChecked: true, Status })}
        </TableCell>


        <TableCell
          classes={borderCellStyle}
          align='center'
          className={classes.flex2}>
          <Grid container className={clsx(classes.justifyBetween, classes.responsiveFlex)}>
            <Grid item className={clsx(classes.plr10, classes.reponsivePB5)}>
              {renderIntData(TotalSendPlan, '', row, windowSize !== 'xs', t("mainReport.totalSendPlan"))}
            </Grid>
            <Grid item className={clsx(classes.plr10, classes.reponsivePB5)}>
              {renderIntData(TotalSendCompleted, '', hrefs.TotalSendCompleted, windowSize !== 'xs', t("mainReport.ToalSent"))}
            </Grid>
          </Grid>
        </TableCell>
        <TableCell
          classes={borderCellStyle}
          align='center'
          className={classes.flex4}>
          <Grid container className={clsx(classes.justifyBetween, classes.responsiveFlex)}>
            <Grid item className={clsx(classes.plr10, classes.reponsivePB5)}>
              {renderDataTooltip(OpenCount, 'green', hrefs.OpenCount, 'mainReport.OpensTotalTooltip.Text', row.CampaignID)}
            </Grid>
            <Grid item className={clsx(classes.plr10, classes.reponsivePB5)}>
              {renderDataTooltip(OpenCountUnique, 'green', hrefs.OpenCountUnique, 'mainReport.OpensUniqueTooltip.Text', row.CampaignID)}
            </Grid>
            <Grid item className={clsx(classes.plr10, classes.reponsivePB5)}>
              {renderPercetangeData(PercentageOpens, 'green', hrefs.PercentageOpens, row.CampaignID)}
            </Grid>
          </Grid>
        </TableCell>


        <TableCell
          classes={borderCellStyle}
          align='center'
          className={classes.flex4}>
          <Grid container className={clsx(classes.justifyBetween, classes.responsiveFlex)}>
            <Grid item className={clsx(classes.plr10, classes.reponsivePB5)}>
              {renderDataTooltip(ClickCount, 'blue', hrefs.ClickCount, 'mainReport.ClicksTotalTooltip.Text')}
            </Grid>
            <Grid item className={clsx(classes.plr10, classes.reponsivePB5)}>
              {renderDataTooltip(ClickCountUnique, 'blue', hrefs.ClickCountUnique, 'mainReport.ClicksUniqueTooltip.Text')}
            </Grid>
            <Grid item className={clsx(classes.plr10, classes.reponsivePB5)}>
              {renderPercetangeData(PercetangeClicks, 'blue', hrefs.PercetangeClicks)}
            </Grid>
          </Grid>
        </TableCell>

        <TableCell
          classes={borderCellStyle}
          align='center'
          className={classes.flex4}>
          <Grid container className={clsx(classes.justifyBetween, classes.responsiveFlex)}>
            <Grid item className={clsx(classes.plr10, classes.reponsivePB5)}>
              {renderIntData(SendError, 'red', hrefs.SendError, true)}
            </Grid>
            <Grid item className={clsx(classes.plr10, classes.reponsivePB5)}>
              {renderIntData(RemovedClients, 'red', hrefs.RemovedClients, true)}
            </Grid>
            <Grid item className={clsx(classes.plr10, classes.reponsivePB5)}>
              {renderIntData(NotOpened, 'red', hrefs.NotOpened, true)}
            </Grid>
          </Grid>
        </TableCell>
        <TableCell classes={borderCellStyle}
          align='center'
          className={clsx(classes.flex1, classes.hideOnSmallScreen)}>
          <ManagmentIcon
            classes={classes}
            textClass={classes.lineHeight1point2}
            uIcon={<div className={clsx(classes.managmentUicon, classes.f25, !RemovedClients || RemovedClients === 0 ? classes.disabled : null)}>
              {'\uE15D'}
            </div>}
            lable={hrefs.RemoveReasons.title}
            href={hrefs.RemoveReasons.href}
            onClick={() => {
              setCookie('newsletterReportlastPage', page)
            }}
            disable={!RemovedClients || RemovedClients === 0}
          />
        </TableCell>
        <TableCell
          component="th"
          scope="row"
          classes={{ root: clsx(classes.tableCellRoot, classes.paddingRightLeft10) }}
          className={classes.flex1}>
          {renderCellIcons(row)}
        </TableCell>
      </TableRow>
    )
  }

  const renderPhoneRow = (row) => {
    const {
      CampaignID,
      TotalSendPlan,
      OpenCount,
      OpenCountUnique,
      ClickCount,
      ClickCountUnique,
      RemovedClients,
      SendError,
      NotOpened
    } = row
    const hrefs = getHrefs(CampaignID)
    return (
      <TableRow
        key={row.ID}
        component='div'
        classes={rowStyle}>
        <TableCell classes={{ root: clsx(classes.tableCellRoot, classes.flex1, classes.tabelCellPadding) }}>
          <Box className={classes.justifyBetween}>
            <Box className={classes.inlineGrid}>
              {renderNameCell(row)}
            </Box>
            <Box>
              <ManagmentIcon
                classes={classes}
                iconClass={classes.w25}
                textClass={classes.lineHeight1point2}
                icon={ReportsIcon}
                lable={t('mainReport.locGraph.HeaderText')}
                href={`/Pulseem/CampaignStatistics.aspx?CampaignID=${CampaignID}`}
              />
            </Box>
          </Box>
          <Grid container spacing={2} style={{ paddingInlineStart: 10 }} >
            <Grid item>
              <Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
                {t("mainReport.locTotalSendPlan.HeaderText")}
              </Typography>
              <Grid container spacing={2}>
                <Grid item>
                  {renderIntData(TotalSendPlan, '')}
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
                {t("common.Sent")}
              </Typography>
              <Grid container spacing={2}>
                <Grid item>
                  {renderIntData(TotalSendPlan, '')}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Box className={classes.ml10}>
            <Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
              {t("mainReport.GridButtonColumnResource1.HeaderText")}
            </Typography>
            <Grid container spacing={2}>
              <Grid item>
                {renderIntData(OpenCount, 'green', hrefs.OpenCount, false)}
              </Grid>
              <Grid item>
                {renderIntData(OpenCountUnique, 'green', hrefs.OpenCountUnique, false)}
              </Grid>
            </Grid>
            <Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
              {t("mainReport.GridButtonColumnResource2.HeaderText")}
            </Typography>
            <Grid container spacing={2}>
              <Grid item>
                {renderIntData(ClickCount, 'blue', hrefs.ClickCount, false)}
              </Grid>
              <Grid item>
                {renderIntData(ClickCountUnique, 'blue', hrefs.ClickCountUnique, false)}
              </Grid>
            </Grid>
          </Box>
          <Grid container spacing={2} style={{ paddingInlineStart: 10 }} >
            <Grid item>
              <Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
                {t("mainReport.GridButtonColumnResource4.HeaderText")}
              </Typography>
              {renderIntData(SendError, 'red', hrefs.SendError, false)}
            </Grid>
            <Grid item>
              <Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
                {t("mainReport.removals")}
              </Typography>
              {renderIntData(RemovedClients, 'red', hrefs.RemovedClients, false)}
            </Grid>
            <Grid item>
              <Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
                {t("mainReport.GridButtonColumnResource3.HeaderText")}
              </Typography>
              {renderIntData(NotOpened, 'red', hrefs.NotOpened, false)}
            </Grid>
          </Grid>
        </TableCell>
      </TableRow>
    )
  }

  const renderTableBody = () => {
    let rowData = searchResults || newslettersReports;
    let rpp = parseInt(rowsPerPage)
    rowData = rowData.slice((page - 1) * rpp, (page - 1) * rpp + rpp)
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
    const handleRowsPerPageChange = (val) => {
      dispatch(setRowsPerPage(val))
      setCookie('rpp', val, { maxAge: 2147483647 })
    }
    const handlePageChange = (val) => {
      setPage(val);
    }

    return (
      <TablePagination
        classes={classes}
        rows={isSearching ? searchResults.length : newslettersReports.length}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={rowsOptions}
        page={page}
        onPageChange={handlePageChange}
      />
    )
  }


  return (
    <DefaultScreen
      currentPage='reports'
      classes={classes}
      containerClass={classes.management}>
      {renderHeader()}
      {renderSearchSection()}
      {renderManagmentLine()}
      {renderTable()}
      {renderTablePagination()}
    </DefaultScreen>
  )
}

export default NewslettersReport