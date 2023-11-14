import React, { useState, useEffect } from 'react';
import DefaultScreen from '../../DefaultScreen';
import clsx from 'clsx';
import {
  Typography, Table, TableBody, TableRow, TableHead, TableCell, TableContainer,
  Grid, Button, TextField, Box, Checkbox, Tooltip, FormControlLabel
} from '@material-ui/core'
import { ReportsIcon, GroupRemoval } from '../../../assets/images/managment/index'
import {
  TablePagination, ManagmentIcon, DateField, SearchField
} from '../../../components/managment/index'
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import 'moment/locale/he';
import { getNewsletterReports } from '../../../redux/reducers/newsletterSlice';
import { setRowsPerPage } from '../../../redux/reducers/coreSlice';
import { getCookie, setCookie } from '../../../helpers/Functions/cookies';
import { ExportFile } from '../../../helpers/Export/ExportFile';
import { EmailStatus } from '../../../helpers/Constants';
import { HandleExportData } from '../../../helpers/Export/ExportHelper';
import { Loader } from '../../../components/Loader/Loader';
import { useNavigate, useLocation } from 'react-router';
import { CLIENT_CONSTANTS } from '../../../model/Clients/Contants';
import { VoidFunction } from '../../../helpers/Types/common';
import { SetPageState, GetPageNyName } from '../../../helpers/UI/SessionStorageManager';
import ConfirmRadioDialog from '../../../components/DialogTemplates/ConfirmRadioDialog';
import { ExportFileTypes } from '../../../model/Export/ExportFileTypes';
import { Title } from '../../../components/managment/Title';
import PulseemSwitch from '../../../components/Controlls/PulseemSwitch';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { sitePrefix } from '../../../config';
import { PulseemFeatures } from '../../../model/PulseemFields/Fields';

const NewslettersReport = ({ classes }) => {
  const navigate = useNavigate()
  const { state } = useLocation();
  const from = state?.from || "/";

  const { language, windowSize, isRTL, rowsPerPage } = useSelector(state => state.core)
  const { accountFeatures } = useSelector(state => state.common);
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
  const dateFormat = 'YYYY-MM-DD HH:mm:ss.FFF'
  const dispatch = useDispatch()
  const rowStyle = { head: classes.tableRowReportHead, root: clsx(classes.tableRowRoot) }
  const cellStyle = { head: classes.tableCellHead, root: clsx(classes.tableCellRoot, classes.paddingHead) }
  const cell50wStyle = { head: clsx(classes.tableCellHead), root: clsx(classes.tableCellRoot, classes.paddingHead, classes.minWidth50) }
  const cellBodyStyle = { body: clsx(classes.tableCellBody), root: clsx(classes.tableCellRoot, classes.tableCellRootResponsive) }
  const noBorderCellStyle = { body: classes.tableCellBodyNoBorder, root: clsx(classes.tableCellRoot, classes.minWidth50) }
  const borderCellStyle = { body: clsx(classes.tableCellBody), root: clsx(classes.tableCellRoot, classes.minWidth50) }
  const [showLoader, setLoader] = useState(true);
  const [hasRevenue, setHasRevenue] = useState(false);
  const [dialogType, setDialog] = useState(null);


  moment.locale(language)

  const getHrefs = (id, revenue = 0) => ({
    TotalSendCompleted: {
      href: `/Pulseem/ClientSearchResult.aspx?SentToCampaignID=${id}&fromreact=true`,
      onClick: () => navigate(CLIENT_CONSTANTS.BASEURL, {
        state: {
          ...CLIENT_CONSTANTS.QUERY_PARAMS,
          CampaignID: id,
          ReportType: CLIENT_CONSTANTS.REPORT_TYPE.ShowMails,
          PageType: CLIENT_CONSTANTS.PAGE_TYPES.SentToCampaignID,
          ResultTitle: t('common.Sent') + ' - ' + t('common.campaignID') + ' ' + id,
          PageProperty: GetPageNyName('reports/NewsletterReports')
        }
      }),
    },
    OpenCount: {
      title: windowSize === 'xs' ? t('common.Total') : t('mainReport.GridButtonColumnResource1.HeaderText'),
      href: ``,
      clickable: false
    },
    OpenCountUnique: {
      title: t('common.Unique'),
      href: `/Pulseem/ClientSearchResult.aspx?OpenedCampaignID=${id}&fromreact=true`,
      onClick: () => navigate(CLIENT_CONSTANTS.BASEURL, {
        state: {
          ...CLIENT_CONSTANTS.QUERY_PARAMS,
          CampaignID: id,
          PageType: CLIENT_CONSTANTS.PAGE_TYPES.OpenedCampaignID,
          TestStatusOfEmailElseSms: 1,
          ResultTitle: t('common.OpensUnique') + ' - ' + t('common.campaignID') + ' ' + id,
          PageProperty: GetPageNyName('reports/NewsletterReports')
        }
      }),
      clickable: true
    },
    ClickCount: {
      title: windowSize === 'xs' ? t('common.Total') : t('common.Clicks'),
      href: ``,
      clickable: false
    },
    ClickCountUnique: {
      title: t('common.Unique'),
      href: `/Pulseem/LinksClicksReport.aspx?CampaignID=${id}&fromreact=true`,
      clickable: true,
      onClick: () => window.location = `/Pulseem/LinksClicksReport.aspx?CampaignID=${id}&fromreact=true`
      // onClick: () => navigate(`/Pulseem/LinksClicksReport.aspx?CampaignID=${id}&fromreact=true`)
    },
    RemovedClients: {
      title: windowSize === 'xs' ? '' : t('common.Removed'),
      href: `/Pulseem/ClientSearchResult.aspx?RemovedClientsCampaignID=${id}&fromreact=true`,
      onClick: () => navigate(CLIENT_CONSTANTS.BASEURL, {
        state: {
          ...CLIENT_CONSTANTS.QUERY_PARAMS,
          CampaignID: id,
          PageType: CLIENT_CONSTANTS.PAGE_TYPES.RemovedClientsCampaignID,
          TestStatusOfEmailElseSms: 1,
          Status: CLIENT_CONSTANTS.NEWSlETTER_STATUS.Removed,
          ResultTitle: t('common.Removed') + ' - ' + t('common.campaignID') + ' ' + id,
          PageProperty: GetPageNyName('reports/NewsletterReports')
        }
      }),
    },
    SendError: {
      title: windowSize === 'xs' ? '' : t('mainReport.GridButtonColumnResource4.HeaderText'),
      href: `/Pulseem/CampaignErrorReport.aspx?CampaignID=${id}&fromreact=true`,
      onClick: () => { window.location = `/Pulseem/CampaignErrorReport.aspx?CampaignID=${id}&fromreact=true` }
      // onClick: () => navigate(CLIENT_CONSTANTS.BASEURL, {
      //   state: {
      //     ...CLIENT_CONSTANTS.QUERY_PARAMS,
      //     CampaignID: id,
      //     PageType: CLIENT_CONSTANTS.PAGE_TYPES.ClientStatus,
      //     TestStatusOfEmailElseSms: 1,
      //     Status: CLIENT_CONSTANTS.NEWSlETTER_STATUS.Invalid,
      //     ResultTitle: t('common.charStatus.error') + ' - ' + t('common.campaignID') + ' ' + id
      //   }
      // }),
    },
    PercetangeRemovedClients: {
      title: t('mainReport.removedPercents'),
      href: ``,
      //href: `/Pulseem/CampaignErrorReport.aspx?CampaignID=${id}&fromreact=true`,
      clickable: false,
    },
    PercentageOpens: {
      title: t('mainReport.GridButtonColumnResource1.UniquePercentage'),
      href: `/Pulseem/ClientSearchResult.aspx?OpenedCampaignID=${id}&fromreact=true`,
      onClick: () => null,
    },
    PercetangeClicks: {
      title: t('mainReport.GridButtonColumnResource1.UniquePercentage'),
      href: ``,
      //href: `/Pulseem/LinksClicksReport.aspx?CampaignID=${id}&fromreact=true`
      clickable: false
    },
    NotOpened: {
      title: windowSize === 'xs' ? '' : t("mainReport.GridButtonColumnResource3.HeaderText"),
      href: `/Pulseem/ClientSearchResult.aspx?NotOpenedCampaignID=${id}&fromreact=true`,
      onClick: () => navigate(CLIENT_CONSTANTS.BASEURL, {
        state: {
          ...CLIENT_CONSTANTS.QUERY_PARAMS,
          CampaignID: id,
          PageType: CLIENT_CONSTANTS.PAGE_TYPES.NotOpenedCampaignID,
          TestStatusOfEmailElseSms: 1,
          ResultTitle: t('common.NoOpened') + ' - ' + t('common.campaignID') + ' ' + id,
          PageProperty: GetPageNyName('reports/NewsletterReports')
        }
      }),
    },
    RemoveReasons: {
      title: t("mainReport.locRemovedReason.HeaderText"),
      href: `/Pulseem/RemovedStats.aspx?CampaignID=${id}&fromreact=true`,
      onClick: () => navigate(`/Pulseem/RemovedStats.aspx?CampaignID=${id}&fromreact=true`),
      icon: '\uE15D'
    },
    Revenue: {
      title: '',
      href: `${sitePrefix}ClientSearchResult/${id}`,
      onClick: () => navigate(CLIENT_CONSTANTS.BASEURL, {
        state: {
          ...CLIENT_CONSTANTS.QUERY_PARAMS,
          CampaignID: id,
          TestStatusOfEmailElseSms: 1,
          PageType: CLIENT_CONSTANTS.PAGE_TYPES.Revenue,
          ReportType: CLIENT_CONSTANTS.REPORT_TYPE.ShowMails,
          PageProperty: GetPageNyName('reports/NewsletterReports')
        }
      }),
      textStyle: { fontWeight: 900 },
      isRevenueCol: revenue > 0
    }
  })

  const exportColumnHeader = {
    "Name": t('common.CampaignName'),
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
    "GroupsNames": t('mainReport.groupsNames'),
    "Attachments": t('mainReport.attachments'),
    "Status": t('common.Status'),
    "StatusName": t('mainReport.statusName'),
  }

  const getData = async () => {
    setLoader(true);
    await dispatch(getNewsletterReports(isDemoSend));
    setLoader(false);
    const queryState = from?.toLowerCase().indexOf('clientsearchresult') > -1;
    if (queryState) {
      const pageStateProperty = GetPageNyName('reports/NewsletterReports');
      if (pageStateProperty) {
        if (pageStateProperty.SearchData) {
          setNotificationNameSearch(pageStateProperty.SearchData?.CampaignName);
          handleFromDate(pageStateProperty.SearchData?.FromDate);
          handleToDate(pageStateProperty.SearchData?.ToDate);
          setSearching(true);
        }
        else {
          setPage(pageStateProperty.PageNumber);
        }
      }
    }
  }

  useEffect(() => {
    if (accountFeatures && accountFeatures?.indexOf(PulseemFeatures.REVENUE) > -1) {
      setHasRevenue(true);
    }
  }, [accountFeatures])

  useEffect(() => {
    getData();
    const lastPage = getCookie('newsletterReportlastPage') || 1;
    setPage(parseInt(lastPage))
    setCookie('newsletterReportlastPage', '', { maxAge: -1 })
  }, [dispatch, isDemoSend]);


  useEffect(() => {
    handleSearch();
  }, [newslettersReports, isSearching])

  const clearSearch = () => {
    setNotificationNameSearch('')
    handleFromDate(null)
    handleToDate(null)
    setSearchResults(null)
    setSearching(false)
  }

  const handleDownloadCsv = async (formatType) => {
    setLoader(true);
    setDialog(null)
    if (hasRevenue)
      exportColumnHeader["Revenue"] = t("common.revenue");
    let listToExport = null;

    if (toFileArray.length > 0) {
      listToExport = newslettersReports.filter(a => toFileArray.includes(a.CampaignID));
    }
    else {
      listToExport = searchResults || newslettersReports;
    }

    const exportOptions = {
      OrderItems: true,
      FormatDate: true,
      ConvertStatusToString: true,
      Statuses: EmailStatus,
      Order: Object.keys(exportColumnHeader),
      DeleteProperties: ["Status"]
    };

    try {
      const result = await HandleExportData(listToExport, exportOptions);
      ExportFile({
        data: result,
        fileName: 'emailReport',
        exportType: formatType,
        fields: exportColumnHeader
      });

      setToFileArray([]);
      setDialog(null)
    } catch (error) {
      console.log(error);
    }
    finally {
      setLoader(false);
    }
  }


  const handleSearch = () => {
    if (notificationNameSearch === '' && !fromDate && !toDate) {
      return;
    }
    const searchArray = [{
      type: 'name',
      notificationName: notificationNameSearch
    }, {
      type: 'date',
      fromDate,
      toDate
    }];

    SetPageState({
      "PageName": "reports/NewsletterReports",
      "PageNumber": page,
      "SearchData": { CampaignName: notificationNameSearch, FromDate: fromDate, ToDate: toDate }
    });

    const filtersObject = {
      name: (row, values) => {
        return String(row.Name.toLowerCase()).includes(values.notificationName.toLowerCase());
      },
      date: (row, values) => {
        const { LastEditDate, SendDate } = row
        const lastUpdate = SendDate ?
          moment(SendDate, dateFormat).valueOf()
          : moment(LastEditDate, dateFormat).valueOf()
        const startFromDate = (values.fromDate && moment(values.fromDate).hour(0).minute(0).valueOf()) || null
        const endToDate = (values.toDate && moment(values.toDate).hour(23).minute(59).valueOf()) || null

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
    if (newslettersReports.length !== sortData.length) {
      setSearching(true);
      setPage(1);
    }
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

  const handleSearchKeyPress = event => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }
  }
  const renderSearchSection = () => {


    if (windowSize === 'xs') {
      return (
        <SearchField
          classes={classes}
          value={notificationNameSearch}
          onKeyPress={handleSearchKeyPress}
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
        className={clsx(classes.lineTopMarging, 'searchLine')}>
        <Grid item>
          <TextField
            variant="standard"
            size='small'
            value={notificationNameSearch}
            onKeyPress={handleSearchKeyPress}
            onChange={handleNotificationNameChange}
            className={clsx(classes.textField, classes.minWidth252)}
            placeholder={t('common.CampaignName')}
          />
        </Grid>

        {windowSize !== 'xs' ?
          <Grid item>
            <DateField
              toolbarDisabled={false}
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
              toolbarDisabled={false}
              classes={classes}
              value={toDate}
              onChange={handleToDate}
              placeholder={t('mms.locToDateResource1.Text')}
              minDate={fromDate ? fromDate : undefined}
            />
          </Grid>
          : null}

        <Grid item style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <PulseemSwitch
                switchType='ios'
                classes={classes}
                checked={isDemoSend}
                onColor="#0371ad"
                handleDiameter={20}
                boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                height={15}
                width={40}
                className={clsx(classes.inputSwitch, { [classes.rtlSwitch]: isRTL })}
                onChange={() => setIsDemoSend(!isDemoSend)}
              />
            }
            label={t('mainReport.locShowTestCampaigns.Text')}
          />
        </Grid>
        <Grid item>
          <Button
            onClick={handleSearch}
            className={clsx(classes.btn, classes.btnRounded, classes.searchButton)}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}>
            {t('notifications.buttons.search')}
          </Button>
        </Grid>
        {isSearching && <Grid item>
          <Button
            onClick={clearSearch}
            className={clsx(classes.btn, classes.btnRounded)}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}>
            {t('common.clear')}
          </Button>
        </Grid>}
        {accountFeatures?.indexOf(PulseemFeatures.LOCK_EXPORT_DATA) === -1 && windowSize !== 'xs' && <Grid
          item
          style={{
            display: 'flex', flexDirection: 'row', alignItems: 'center', marginInlineStart: 'auto', marginInlineEnd: 45
          }}>
          <Button
            className={clsx(
              classes.btn,
              classes.btnRounded,
              newslettersReports.length > 0 && toFileArray?.length > 0 ? null : classes.disabled
            )}
            onClick={() => setDialog('exportFormat')}
            disabled={isSearching && !searchResults?.length}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}>
            {t('campaigns.exportFile')}
          </Button>
        </Grid>}
      </Grid>
    )
  }

  const renderManagmentLine = () => {
    const dataLength = isSearching ? (searchResults?.length ?? 0) : (newslettersReports?.length ?? 0);
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
          <TableCell classes={cellStyle} className={clsx(classes.flex4, classes.f16)} align='center'>{t('campaigns.camapignName')}</TableCell>
          <TableCell classes={cell50wStyle} className={clsx(classes.flex1, classes.noPonSmallScreen, classes.f16)} align='center'><span className={classes.hideOnSmallScreen}>{t("mainReport.locTotalSendPlan.HeaderText")}</span></TableCell>
          <TableCell classes={cell50wStyle} className={clsx(classes.flex1, classes.noPonSmallScreen, classes.f16)} align='center'><span className={classes.hideOnSmallScreen}>{t("mainReport.ToalSent")}</span> </TableCell>
          <TableCell classes={cell50wStyle} className={clsx(classes.flex4, classes.f16)} align='center'>{t("mainReport.GridButtonColumnResource1.HeaderText")}</TableCell>
          <TableCell classes={cell50wStyle} className={clsx(classes.flex4, classes.f16)} align='center'>{t("mainReport.GridButtonColumnResource2.HeaderText")}</TableCell>
          <TableCell classes={cell50wStyle} className={clsx(classes.flex3, classes.f16)} align='center'></TableCell>
          <TableCell classes={cell50wStyle} className={clsx(classes.flex1, classes.hideOnSmallScreen, classes.f16)} align='center'></TableCell>
          <TableCell classes={cellStyle} className={classes.flex1} ></TableCell>
          {hasRevenue && <TableCell classes={cell50wStyle} className={clsx(classes.flex1, classes.f16)} align='center' >{t("common.revenue")}</TableCell>}
        </TableRow>
      </TableHead>
    )
  }

  const renderCellIcons = (RowIcon, row, index, mgmtIconProps) => {

    return (
      <Box style={{ display: 'flex', flex: 1, alignItems: 'center', alignSelf: 'center', justifyContent: 'center' }} className={'rowIconContainer'}>
        <ManagmentIcon
          classes={classes}
          iconClass={classes.w25}
          textClass={classes.lineHeight1point2}
          uIcon={<RowIcon width={18} height={20} className={'rowIcon'} />}
          // lable={t('mainReport.locGraph.HeaderText')}
          // href={`/Pulseem/CampaignStatistics.aspx?CampaignID=${CampaignID}`}
          {...mgmtIconProps}
        />
      </Box>
    )
  }

  const renderNameCell = (row) => {
    const { CampaignID, Name, SendDate, isChecked = false, Status, LastEditDate } = row

    const date = SendDate ? moment(SendDate) : ''
    const showDate = SendDate ? date.format('L') : ''
    const showTime = SendDate ? date.format('LT') : ''
    const udate = LastEditDate ? moment(LastEditDate) : '';
    const showUpdateDate = LastEditDate ? udate.format('L') : '';
    const showTimeUpdate = LastEditDate ? udate.format('LT') : '';

    if (windowSize === 'xs') {
      return (
        <>
          <Typography noWrap={false} className={classes.nameEllipsis}>
            {Name}
          </Typography>
          {Status === 5 ? <Typography className={clsx(classes.f14, classes.red)}>({t("campaigns.Canceled")})</Typography> : null}
          {SendDate !== null && SendDate !== '' ?
            (
              <Typography className={classes.grayTextCell}>
                {t("common.SentOn")} {`${showDate} ${showTime}`}
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
        <Grid item className={clsx(windowSize !== 'xs' ? classes.w80 : '', 'rowTitle')}>
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
              {row.Status === 5 ? <Typography className={clsx(classes.f14, classes.red)}>({t("campaigns.Canceled")})</Typography> : null}
            </Typography>
          </Tooltip>
          {SendDate !== null && SendDate !== '' ?
            (
              <Typography className={classes.grayTextCell}>
                {t("common.SentOn")} {`${showDate} ${showTime}`}
              </Typography>
            ) :
            (
              <Typography className={classes.grayTextCell}>
                {t("common.UpdatedOn")} {`${isRTL ? showUpdateDate : moment(showUpdateDate).format("DD/MM/YYYY")} ${showTimeUpdate}`}
              </Typography>
            )}
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
    const { title = '', href = '', icon = '', onClick } = data;
    // const innerHref = clickable ? href : '';
    return (
      <Box style={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap' }} >
        {/* <Typography component={innerHref ? 'a' : 'p'} */}
        <Typography component={'p'}
          // href={innerHref}
          onClick={onClick}
          className={clsx(
            classes.middleTxt,
            colorTextStyle[type] || '',
            { [classes.iconsFont]: !!icon })}
          target="_blank">
          {icon ? icon : `${percentage?.toString().substring(0, 4) ?? '0'}%`}
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
    const { title = t("notifications.tblBody.total"), textStyle = null, onClick } = data
    const isLink = onClick && onClick !== null && value > 0;
    return (
      <Tooltip
        title={`${t(tooltip)}`}
        arrow
        placement={isRTL ? 'left-end' : 'right-end'}
        classes={{
          tooltip: classes.tooltipBlack,
          arrow: classes.fBlack
        }}>
        <Box className={classes.cellText}
          style={{ ...textStyle, cursor: isLink ? 'pointer' : null }}
          onClick={isLink ? onClick : VoidFunction}>
          <Typography
            // component={clickable && value > 0 ? 'a' : 'p'}
            component={'p'}
            style={{ textDecoration: isLink ? 'underline' : null }}
            // href={href}
            className={clsx(classes.middleText, colorTextStyle[type] || '')}
            target="_blank">
            {value?.toLocaleString() ?? '0'}
          </Typography>
          <Typography style={{ textDecoration: isLink ? 'underline' : null }}
            className={clsx(classes.middleWrapText, colorTextStyle[type])}>
            {title}
          </Typography>
        </Box >
      </Tooltip >
    );
  }

  const renderIntData = (value, type, data = {}, clickable, innerTitle = '') => {
    const { title = windowSize === 'xs' ? '' : t("notifications.tblBody.total"), onClick, textStyle = null, isRevenueCol = false } = data
    const isLink = (value > 0 && clickable) || isRevenueCol;
    return (
      <Box className={classes.cellText}
        onClick={isLink ? onClick : VoidFunction}
        style={{ ...textStyle, cursor: isLink ? 'pointer' : null }}>
        <Typography component={isLink ? 'a' : 'p'}
          style={{ textDecoration: isLink ? 'underline' : null }}
          className={clsx(classes.middleTxt, colorTextStyle[type] || '')}
          target="_blank">
          {(value && value.toLocaleString()) || '0'}
        </Typography>
        <Typography
          className={clsx(classes.middleWrapText, colorTextStyle[type])}
          style={{ textDecoration: isLink ? 'underline' : null }}>
          <span className={classes.hideInMiddleScreen} style={textStyle}>{title}</span> {innerTitle !== '' ? <span className={classes.showTitleInline}>{innerTitle}</span> : null}
        </Typography>
      </Box>
    )

  }
  const renderRevenueData = (value, type, data = {}) => {
    const { textStyle = null, isRevenueCol = false, onClick = () => null } = data
    return (
      <Box style={{ display: 'flex', flexDirection: 'column' }} onClick={(isRevenueCol && value > 0) ? onClick : VoidFunction}>
        <Typography
          component={'p'}
          style={{ ...textStyle, textDecoration: (value > 0 || (isRevenueCol && value > 0)) ? 'underline' : null, cursor: (value > 0 || (isRevenueCol && value > 0)) ? 'pointer' : null }}
          className={clsx(classes.middleText, colorTextStyle[type] || '')}
          target="_blank">
          {(value && value.toLocaleString()) || '0'}  {t("common.NIS")}
        </Typography>
        {/* <Typography
          onClick={() => {
            onClick()
          }}
          component={href !== '' && (value > 0 || (isRevenueCol && value > 0)) ? 'a' : 'p'}
          href={href !== '' ? href : ''}
          className={clsx(classes.middleText, colorTextStyle[type] || '')}
          style={textStyle}
        >
          {(value && value.toLocaleString()) || '0'} {t("common.NIS")}
        </Typography> */}
      </Box>
    )
  }

  const renderRow = (row, index) => {
    const {
      CampaignID,
      Name,
      SendDate,
      LastEditDate,
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
      NotOpened,
      Revenue = 0
    } = row
    const hrefs = getHrefs(CampaignID, Revenue)
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
          {renderNameCell({ CampaignID, Name, SendDate, isChecked: true, Status, LastEditDate })}
        </TableCell>
        <TableCell
          align='center'
          classes={noBorderCellStyle}
          className={classes.flex1}>
          {renderIntData(TotalSendPlan, '', row, false, t("mainReport.totalSendPlan"))}
        </TableCell>
        <TableCell
          classes={borderCellStyle}
          align='center'
          className={classes.flex1}>
          {renderIntData(TotalSendCompleted, '', hrefs.TotalSendCompleted, windowSize !== 'xs', t("mainReport.ToalSent"))}
        </TableCell>
        <TableCell
          classes={borderCellStyle}
          align='center'
          className={classes.flex4}>
          <Grid container className={clsx(classes.justifyEvenly, classes.responsiveFlex)}>
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
          <Grid container className={clsx(classes.justifyEvenly, classes.responsiveFlex)}>
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
          className={classes.flex3}>
          <Grid container className={clsx(classes.justifyEvenly, classes.responsiveFlex)}>
            <Grid item className={clsx(classes.plr10, classes.reponsivePB5)}>
              {renderIntData(SendError, 'red', hrefs.SendError, true, t('mainReport.GridButtonColumnResource4.HeaderText'))}
            </Grid>
            <Grid item className={clsx(classes.plr10, classes.reponsivePB5)}>
              {renderIntData(RemovedClients, 'red', hrefs.RemovedClients, true, t('mainReport.removedClients'))}
            </Grid>
            <Grid item className={clsx(classes.plr10, classes.reponsivePB5)}>
              {renderIntData(NotOpened, 'red', hrefs.NotOpened, true, t("mainReport.GridButtonColumnResource3.HeaderText"))}
            </Grid>
          </Grid>
        </TableCell>
        <TableCell classes={borderCellStyle}
          align='center'
          className={clsx(classes.flex1, classes.hideOnSmallScreen)}>
          {renderCellIcons(GroupRemoval, row, index, {
            lable: hrefs.RemoveReasons.title,
            href: hrefs.RemoveReasons.href,
            onClick: () => {
              setCookie('newsletterReportlastPage', page)
            },
            disable: !RemovedClients || RemovedClients === 0,
          })}
        </TableCell>
        <TableCell
          component="th"
          scope="row"
          classes={hasRevenue ? borderCellStyle : noBorderCellStyle}
          className={classes.flex1}>
          {renderCellIcons(ReportsIcon, row, index, {
            lable: t('mainReport.locGraph.HeaderText'),
            href: `/Pulseem/CampaignStatistics.aspx?CampaignID=${CampaignID}`
          })}
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
      CampaignID,
      TotalSendPlan,
      OpenCount,
      OpenCountUnique,
      ClickCount,
      ClickCountUnique,
      RemovedClients,
      SendError,
      NotOpened,
      Revenue = 0
    } = row
    const hrefs = getHrefs(CampaignID)
    return (
      <TableRow
        key={row.ID}
        component='div'
        classes={rowStyle}>
        <TableCell classes={{ root: clsx(classes.tableCellRoot, classes.flex1, classes.tabelCellPadding) }} >
          <Box className={classes.inlineGrid} style={{ paddingInlineStart: 10 }}>
            {renderNameCell(row)}
          </Box>
          <Box className={classes.ml10}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
                  {t("mainReport.GridButtonColumnResource1.HeaderText")}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    {renderIntData(OpenCount, 'green', hrefs.OpenCount, false)}
                  </Grid>
                  <Grid item xs={6}>
                    {renderIntData(OpenCountUnique, 'green', hrefs.OpenCountUnique, false)}
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={6}>
                <Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
                  {t("mainReport.GridButtonColumnResource2.HeaderText")}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    {renderIntData(ClickCount, 'blue', hrefs.ClickCount, false)}
                  </Grid>
                  <Grid item xs={6}>
                    {renderIntData(ClickCountUnique, 'blue', hrefs.ClickCountUnique, false)}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
          <Grid container spacing={2} style={{ paddingInlineStart: 10 }} >
            <Grid item xs={3}>
              <Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
                {t("common.Sent")}
              </Typography>
              <Grid container spacing={2}>
                <Grid item>
                  {renderIntData(TotalSendPlan, '')}
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
                {t("mainReport.GridButtonColumnResource4.HeaderText")}
              </Typography>
              {renderIntData(SendError, 'red', hrefs.SendError, false)}
            </Grid>
            <Grid item xs={3}>
              <Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
                {t("mainReport.removals")}
              </Typography>
              {renderIntData(RemovedClients, 'red', hrefs.RemovedClients, false)}
            </Grid>
            <Grid item xs={3}>
              <Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
                {t("mainReport.GridButtonColumnResource3.HeaderText")}
              </Typography>
              {renderIntData(NotOpened, 'red', hrefs.NotOpened, false)}
            </Grid>
            {hasRevenue && <Grid item xs={3}>
              <Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
                {t("common.revenue")}
              </Typography>
              <Grid container spacing={2}>
                <Grid item>
                  {renderIntData(Revenue, 'black', hrefs.Revenue, true)}
                </Grid>
              </Grid>
            </Grid>}
          </Grid>
        </TableCell>
      </TableRow>
    )
  }

  const renderTableBody = () => {
    let rowData = searchResults || newslettersReports;
    if (rowData.length > 0) {
      let rpp = parseInt(rowsPerPage)
      rowData = rowData.slice((page - 1) * rpp, (page - 1) * rpp + rpp)
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
    const handleRowsPerPageChange = (val) => {
      dispatch(setRowsPerPage(val))
    }
    const handlePageChange = (val) => {
      setPage(val);
    }

    return (
      <TablePagination
        classes={classes}
        rows={isSearching ? (searchResults?.length ?? 0) : (newslettersReports?.length ?? 0)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={rowsOptions}
        page={page}
        onPageChange={(e) => {
          SetPageState({
            "PageName": "reports/NewsletterReports",
            "PageNumber": e,
            "SearchData": (notificationNameSearch !== '' || fromDate || toDate) ? { CampaignName: notificationNameSearch, FromDate: fromDate, ToDate: toDate } : null
          });
          handlePageChange(e)
        }}
      />
    )
  }


  return (
    <DefaultScreen
      currentPage='reports'
      classes={classes}
      containerClass={clsx(classes.management, classes.mb50)}>
      <Box className={'topSection'}>
        <Title Text={t('mainReport.logPageHeaderResource1.Text')} classes={classes} />
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
        onCancel={() => setDialog(null)}
        cookieName={'exportFormat'}
        defaultValue="xls"
        options={ExportFileTypes}
      />
      <Loader isOpen={showLoader} showBackdrop={true} />
    </DefaultScreen>
  )
}

export default NewslettersReport