import React, { useState, useEffect, useRef } from 'react';
import DefaultScreen from '../../DefaultScreen';
import clsx from 'clsx';
import {
  Typography, Table, TableBody, TableRow, TableHead, TableCell, TableContainer,
  Grid, Button, TextField, InputAdornment, Box, FormControlLabel, Checkbox, RadioGroup, Radio, FormControl, Tooltip
} from '@material-ui/core'
import {
  DeleteIcon, DuplicateIcon, EditIcon,
  GroupsIcon, PreviewIcon, SendIcon
} from '../../../assets/images/managment/index'
import { TablePagination, ManagmentIcon, DateField, RestorDialogContent } from '../../../components/managment/index'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import 'moment/locale/he';
import {
  getNotificationById, getNotificationGroups, getNotificationData, getDeletedNotifications,
  duplicateNotification, deleteNotification, getNotificationGroupsById, restoreNotifications,
  getScriptPath, getSubAccountApiKey, getSubAccountRegistrations, updateScriptPath
} from '../../../redux/reducers/notificationSlice';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Preview } from '../../../components/Notifications/Preview/Preview';
import { getCookie, setCookie } from '../../../helpers/Functions/cookies';
import { actionURL } from '../../../config/index'
import { Loader } from '../../../components/Loader/Loader';
import { setRowsPerPage } from '../../../redux/reducers/coreSlice';
import { MdArrowBackIos, MdArrowForwardIos, MdNotificationsActive } from 'react-icons/md';
import useRedirect from '../../../helpers/Routes/Redirect';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import { Title } from '../../../components/managment/Title';
import { DialogTypes } from '../../../Models/PushNotifications/DialogTypes';
import { sitePrefix } from '../../../config/index';
import { DateFormats } from '../../../helpers/Constants';

const NotificationManagement = ({ classes }) => {
  const Redirect = useRedirect();
  const { language, windowSize, rowsPerPage, isRTL, userRoles } = useSelector(state => state.core)
  const { notificationData, subAccountApiKey } = useSelector(state => state.notification)
  const { t } = useTranslation()
  const [fromDate, handleFromDate] = useState(null);
  const [toDate, handleToDate] = useState(null);
  const [scriptDialog, handleScriptDialogCheck] = useState(false);
  const [notificationNameSearch, setNotificationNameSearch] = useState('');
  const [scriptDirectory, setScriptDirectory] = useState(0);
  const [copyStatus, setCopyStatus] = useState(false);
  const [scriptPath, setScriptPath] = useState('');
  const rowsOptions = [6, 10, 20, 50]
  const [page, setPage] = useState(1)
  const [isSearching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState(null)
  const [dialogType, setDialogType] = useState(null)
  const [restoreArray, setRestoreArray] = useState([]);
  const dateFormat = 'YYYY-MM-DD HH:mm:ss.FFF'
  const dispatch = useDispatch()
  const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot }
  const cellStyle = { head: classes.tableCellHead, root: clsx(classes.tableCellRoot, classes.paddingHead) }
  const cell50wStyle = { head: clsx(classes.tableCellHead), root: clsx(classes.tableCellRoot, classes.paddingHead, classes.minWidth75) }
  const cellBodyStyle = { body: clsx(classes.tableCellBody), root: clsx(classes.tableCellRoot) }
  const noBorderCellStyle = { body: classes.tableCellBodyNoBorder, root: clsx(classes.tableCellRoot, classes.minWidth75) }
  const borderCellStyle = { body: clsx(classes.tableCellBody), root: clsx(classes.tableCellRoot, classes.minWidth75) }
  const scriptDialogCookie = getCookie('scriptDialog')
  const hideScriptDialog = (scriptDialogCookie === 'true')
  const [showScriptDialog, setShowScriptDialog] = useState(!hideScriptDialog)
  const [showLoader, setLoader] = useState(true);
  const [forceShowImplementation, setForceShowImplementation] = useState(false);
  const refScriptCode = useRef(null);
  moment.locale(language)
  const [pathError, setPathError] = useState(false);

  const handleScriptPath = async () => {
    if (!scriptPath || scriptPath === '') {
      const scrPathResponse = await dispatch(getScriptPath())
      if (scrPathResponse?.payload && scrPathResponse?.payload !== '') {
        setScriptPath(scrPathResponse?.payload);
        setScriptDirectory(1);
      }
    }
  }
  useEffect(() => {
    setLoader(true);

    const handleApiKey = async () => {
      await dispatch(getSubAccountApiKey());
      setLoader(false);
    }

    const getData = async () => {
      await dispatch(getNotificationData());
      setLoader(false);
    }

    if (!subAccountApiKey || subAccountApiKey === "") {
      handleApiKey();
    }
    else {
      getData();
    }

    handleScriptPath();
  }, [dispatch, subAccountApiKey]);





  const handleScriptDirectory = (event) => {
    const value = parseInt(event.target.value);
    setScriptDirectory(value);
    // if (value === 0) {
    //   setScriptPath('');
    // }
  }

  const handleCopyScript = () => {
    setCopyStatus(true);
    setTimeout(() => {
      setCopyStatus(false);
    }, 1000);
  }

  const handleScriptPathChange = (event) => {
    setScriptPath(event.target.value);
  }

  const handlePreview = async (ID) => {
    setLoader(true);
    const item = await dispatch(getNotificationById(ID));
    setLoader(false);
    setDialogType({
      type: DialogTypes.PREVIEW,
      data: item.payload
    })
  }

  const handleShowGroups = async (ID) => {
    const item = await dispatch(getNotificationGroups(ID));
    if (item && item.payload) {

    }
    setDialogType({
      type: DialogTypes.GROUPS,
      data: item.payload
    })
  }

  const handleShowSubscribers = async () => {
    const item = await dispatch(getSubAccountRegistrations());

    setDialogType({
      type: DialogTypes.SUBSCRIBERS,
      data: item.payload
    })
  }

  const handleShowGroupsById = async (ID) => {
    const item = await dispatch(getNotificationGroupsById(ID));
    setDialogType({
      type: DialogTypes.GROUPS_BY_ID,
      data: item.payload
    })
  }

  const handleDuplicate = async (ID) => {
    setDialogType(null);
    setLoader(true);
    const res = await dispatch(duplicateNotification(ID));
    clearSearch();
    if (!res.error) {
      dispatch(getNotificationData());
    }
    handleDialogClose();
    setLoader(false);
  }

  const handleDeleteNotification = async (ID) => {
    const res = await dispatch(deleteNotification(ID));
    if (res.payload === true && !res.error) {
      dispatch(getNotificationData());
    }
    handleDialogClose();
  }

  const handleShowDeletedItems = async () => {
    const res = await dispatch(getDeletedNotifications());
    if (!res.error) {
      setDialogType({
        type: DialogTypes.RESTORE,
        data: res.payload
      });
    }
  }

  const handleImplementScript = () => {
    if (!forceShowImplementation) {
      setCookie('scriptDialog', scriptDialog, { maxAge: 2147483647 });
    }
    dispatch(updateScriptPath(scriptPath));
    setShowScriptDialog(false)
  }

  const renderImplementDialog = () => {
    if (scriptDialogCookie && !forceShowImplementation) {
      return;
    }

    const dialog = renderImplement();
    return (
      <BaseDialog
        classes={classes}
        open={showScriptDialog}
        onCancel={() => setShowScriptDialog(false)}
        onClose={() => setShowScriptDialog(false)}
        {...dialog}>
        {dialog.content}
      </BaseDialog>
    );
  }

  const clearSearch = () => {
    setNotificationNameSearch('')
    handleFromDate(null)
    handleToDate(null)
    setSearchResults(null)
    setSearching(false)
  }

  const renderSearchSection = () => {
    const handleKeyDown = (event) => {
      if (event.keyCode === 13 || event.code === 'Enter') {
        handleSearch();
      }
    }
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
          const startFromDate = (values.fromDate && moment(values.fromDate).hour(0).minute(0).valueOf()) ?? null
          const endToDate = (values.toDate && moment(values.toDate).hour(23).minute(59).valueOf()) ?? null

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

      let sortData = notificationData;
      searchArray.forEach(values => {
        sortData = sortData?.filter(row => filtersObject[values.type](row, values))
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

    return (
      <Grid container spacing={2} className={clsx(windowSize === 'xs' || windowSize === 'sm' ? classes.mt15 : classes.lineTopMarging, 'searchLine')}>
        <Grid item>
          <TextField
            variant='outlined'
            size='small'
            value={notificationNameSearch}
            onKeyPress={handleKeyDown}
            onChange={handleNotificationNameChange}
            className={clsx(classes.textField, classes.minWidth252)}
            placeholder={t('notifications.searchSection.notificationName')}
          />
        </Grid>

        {windowSize !== 'xs' ?
          <Grid item>
            <DateField
              toolbarDisabled={false}
              classes={classes}
              value={fromDate}
              onChange={handleFromDateChange}
              placeholder={t('notifications.searchSection.fromDate')}
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
              placeholder={t('notifications.searchSection.toDate')}
              minDate={fromDate ? fromDate : undefined}
            />
          </Grid>
          : null}

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
            className={clsx(classes.btn, classes.btnRounded, classes.searchButton)}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}>
            {t('common.clear')}
          </Button>
        </Grid>}
      </Grid>
    )
  }

  const renderManagmentLine = () => {
    const dataLength = isSearching ? searchResults?.length : notificationData?.length;
    return (
      <Grid container spacing={2} className={clsx(classes.linePadding, classes.pb10)} >
        {<Grid item>
          <Button
            component="a"
            href={`${sitePrefix}Notification/create`}
            onClick={(e) => {
              e.preventDefault()
              Redirect({ url: `${sitePrefix}Notification/create` })
            }}
            className={clsx(classes.btn, classes.btnRounded, classes.searchButton)}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}>
            {t('notifications.buttons.createNotification')}
          </Button>
        </Grid>}
        {windowSize !== 'xs' && <Grid item>
          <Button
            className={clsx(classes.btn, classes.btnRounded, classes.searchButton)}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
            onClick={handleShowDeletedItems}>
            {t('notifications.restoreDeleted')}
          </Button>
        </Grid>}
        {windowSize !== 'xs' && <Grid item>
          <Button
            className={clsx(classes.btn, classes.btnRounded, classes.searchButton)}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
            onClick={handleShowGroups}>
            {t('notifications.buttons.groups')}
          </Button>
        </Grid>}
        {windowSize !== 'xs' && <Grid item>
          <Button
            className={clsx(classes.btn, classes.btnRounded, classes.searchButton)}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
            onClick={handleShowSubscribers}>
            {t('notifications.buttons.subscribers')}
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

  const renderTableHead = () => {
    return (
      <TableHead>
        <TableRow classes={rowStyle}>
          <TableCell classes={cellStyle} className={classes.flex3} align='center'>{t("notifications.searchSection.notificationName")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center'>{t("notifications.tblHeader.toSend")}</TableCell>
          <Tooltip
            title={t('notifications.arrivedTootltip')}
            arrow
            placement={'top'}
            classes={{ tooltip: clsx(classes.tooltipBlack, classes.tooltipPlacement), arrow: classes.black }}>
            <TableCell classes={cell50wStyle} className={classes.flex1} align='center'>
              {t("notifications.arrived")}
            </TableCell>
          </Tooltip>
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center'>{t("notifications.tblHeader.failed")}</TableCell>
          <TableCell classes={cellStyle} className={clsx(classes.flex1, classes.minWidth75)} align='center'>{t("notifications.tblHeader.clicks")}</TableCell>
          <TableCell classes={cellStyle} className={clsx(classes.flex1, classes.minWidth75)} align='center'>{t("notifications.tblHeader.status")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex12} ></TableCell>
        </TableRow>
      </TableHead>
    )
  }

  const renderCellIcons = (row) => {
    const { StatusID, HasGroups, ID } = row

    const iconsMap = [
      {
        key: 'preview',
        uIcon: PreviewIcon,
        lable: t('notifications.buttons.preview'),
        remove: windowSize === 'xs',
        rootClass: classes.paddingIcon,
        onClick: () => {
          handlePreview(ID);
        }
      },
      {
        key: 'edit',
        uIcon: EditIcon,
        disable: StatusID !== 0,
        lable: t('notifications.buttons.edit'),
        rootClass: classes.paddingIcon,
        onClick: () => Redirect({ url: `${sitePrefix}notification/Edit/${ID}` })
      },
      {
        key: 'duplicate',
        uIcon: DuplicateIcon,
        lable: t('notifications.buttons.duplicate'),
        rootClass: classes.paddingIcon,
        onClick: () => {
          setDialogType({
            type: DialogTypes.DUPLICATE,
            data: ID
          });
        }
      },
      {
        key: 'groups',
        uIcon: GroupsIcon,
        disable: (!HasGroups),
        lable: t('notifications.buttons.groups'),
        rootClass: classes.paddingIcon,
        onClick: () => {
          handleShowGroupsById(ID);
        }
      },
      {
        key: 'delete',
        uIcon: DeleteIcon,
        lable: t('notifications.buttons.delete'),
        showPhone: true,
        remove: !userRoles?.AllowDelete,
        rootClass: classes.paddingIcon,
        onClick: async () => {
          setDialogType({
            type: DialogTypes.DELETE,
            data: ID
          })
        }
      },
      {
        key: 'send',
        uIcon: SendIcon,
        lable: t('notifications.buttons.send'),
        remove: StatusID !== 0,
        rootClass: clsx(classes.sendIcon, 'sendIcon'),
        textClass: classes.sendIconText,
        onClick: () => {
          Redirect({ url: `${sitePrefix}Notification/send/${ID}` });
        }
      }
    ]
    return (
      <Grid
        container
        direction='row'
        justifyContent={windowSize === 'xs' ? 'flex-start' : 'flex-end'}>
        {iconsMap.map(icon => (
          <Grid
            className={clsx(icon.disable && classes.disabledCursor, 'rowIconContainer')}
            key={icon.key}
            item >
            <ManagmentIcon
              classes={classes}
              {...icon}
              uIcon={<icon.uIcon width={18} height={20} className={'rowIcon'} />}
            />
          </Grid>
        ))}
      </Grid>
    )
  }

  const renderStatusCell = (status) => {
    const statuses = {
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
            [classes.statusCreated]: status === 0,
            [classes.statusPending]: status === 2,
            [classes.statusSending]: status === 3,
            [classes.statusSent]: status === 4,
            [classes.statusScheduled]: status === 5,
            [classes.statusFailed]: status === 7,
          }
        )}>
          {t(statuses[status])}
        </Typography>
      </>
    )
  }

  const renderTotalCell = (value, type) => {
    let count = value;
    if (type === "error") {
      count = value.UnSubscribed + value.FailedCount;
    }

    return (
      <div>
        <Typography className={clsx(classes.middleText, classes.fontBold, type === "error" && classes.errorText)}>
          {count.toLocaleString()}
        </Typography>
        <Typography className={clsx(classes.middleText, type === "error" && classes.errorText)}>
          {t("notifications.tblBody.total")}
        </Typography>
      </div>
    )
  }

  const renderClickCell = (value, type) => {
    return (
      <>
        <Typography className={clsx(classes.middleText, classes.fontBold, type === "error" && classes.errorText)}>
          {value.toLocaleString()}
        </Typography>
        <Typography className={clsx(classes.middleText, type === "error" && classes.errorText)}>
          {t("notifications.tblBody.clicks")}
        </Typography>
      </>
    )
  }

  const renderNameCell = (row) => {
    let date = null
    let text = ''
    if (!row.SendDate || row.StatusID === 0) {
      date = moment(row.UpdatedDate, dateFormat)
      text = t('common.UpdatedOn')
    } else {
      date = moment(row.SendDate, dateFormat)
      const dateMillis = date.valueOf()
      const currentDateMillis = moment().valueOf()
      text = dateMillis > currentDateMillis ? t('common.ScheduledFor') : t('common.SentOn')
    }

    return (
      <>
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
        <Typography style={{ 'WebkitLineClamp': 1 }}>
          {`${text} ${date.format(DateFormats.DATE_TIME_24)}`}
        </Typography>
      </>
    )
  }

  const renderRow = (row) => {
    return (
      <TableRow
        key={row.ID}
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
          {renderTotalCell(row.SentCount)}
        </TableCell>
        <TableCell
          classes={noBorderCellStyle}
          align='center'
          className={classes.flex1}>
          {renderTotalCell(row.ReceivedCount)}
        </TableCell>
        <TableCell
          classes={borderCellStyle}
          align='center'
          className={classes.flex1}>
          {renderTotalCell(row, "error")}
        </TableCell>
        <TableCell
          classes={cellBodyStyle}
          align='center'
          className={clsx(classes.flex1, classes.minWidth75)}>
          {renderClickCell(row.ClickCount)}
        </TableCell>
        <TableCell
          classes={cellBodyStyle}
          align='center'
          className={clsx(classes.flex1, classes.minWidth75)}>
          {renderStatusCell(row.StatusID)}
        </TableCell>
        <TableCell
          component="th"
          scope="row"
          classes={{ root: clsx(classes.tableCellRoot, classes.paddingRightLeft10) }}
          className={classes.flex12}>
          {renderCellIcons(row)}

        </TableCell>
      </TableRow>
    )
  }

  const renderPhoneRow = (row) => {
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
              {renderStatusCell(row.StatusID)}
            </Box>
          </Box>
          {renderCellIcons(row)}
        </TableCell>
      </TableRow>
    )
  }

  const renderTableBody = () => {
    let rowData = searchResults || notificationData;
    let rpp = parseInt(rowsPerPage)
    rowData = rowData?.slice((page - 1) * rpp, (page - 1) * rpp + rpp)
    return (
      <Box className='tableBodyContainer'>
        <TableBody>
          {rowData
            ?.map(windowSize === 'xs' ? renderPhoneRow : renderRow)}
        </TableBody>
      </Box>
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
    }
    return (
      <TablePagination
        classes={classes}
        rows={isSearching ? searchResults?.length : notificationData?.length}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={rowsOptions}
        page={page}
        onPageChange={setPage}
      />
    )
  }

  const handleChange = (id) => () => {
    const found = restoreArray.includes(id)
    if (found) {
      setRestoreArray(restoreArray.filter(restore => restore !== id))
    } else {
      setRestoreArray([...restoreArray, id])
    }
  }

  const handleDialogClose = () => {
    setDialogType(null);
  }

  const renderPreview = (data = {}) => {
    return {
      childrenStyle: classes.previewPaper,
      showDivider: false,
      title: <><b>{t('common.campaignID')}</b>:&nbsp;{data?.SMSCampaignID || data?.MmsCampaignID || data?.ID || ''}</>,
      icon: (
        <div className={classes.dialogIconContent}>
          {'\uE0F8'}
        </div>
      ),
      content: (
        <Box className={classes.dialogBox}>
          <Preview classes={classes}
            model={data}
            ShowRedirectButton={data.RedirectButtonText && data.RedirectButtonText !== ''}
            showID={true}
            showTitle={false}
            showOSScreen={false}
          />
        </Box>
      ),
      renderButtons: () => (
        <Button
          variant='contained'
          size='small'
          onClick={handleDialogClose}
          className={clsx(
            classes.btn,
            classes.btnRounded,
            classes.middle
          )}>
          {t('common.Ok')}
        </Button>
      )
    };
  }


  const renderSubscribers = (data = {}) => {
    if (!data) return null
    const d = JSON.parse(data);

    return {
      title: t('notifications.buttons.subscribers'),
      showDivider: true,
      icon: (
        <MdNotificationsActive style={{ fontSize: 30 }} />
      ),
      content: (
        <Box className={classes.dialogBox}>
          <Typography className={classes.bold} display='inline'>
            {t('notifications.activeSubscribers')}
          </Typography> {d.Count}
        </Box>
      ),
      renderButtons: () => (
        <Button
          variant='contained'
          size='small'
          onClick={handleDialogClose}
          className={clsx(
            classes.confirmButton,
            classes.btn,
            classes.btnRounded,
            classes.middle
          )}>
          {t('common.Ok')}
        </Button>
      )
    };
  }


  const renderRestore = (data = []) => {
    if (!data || !Array.isArray(data)) return null
    return {
      title: t('notifications.restoreTitle'),
      showDivider: false,
      icon: (
        <div className={clsx(classes.dialogIconContent, 'unicode')}>
          {'\uE185'}
        </div>
      ),
      content: (
        <RestorDialogContent
          classes={classes}
          data={data}
          currentChecked={restoreArray}
          onChange={handleChange}
          dataIdVar='ID'
        />
      ),
      onConfirm: async () => {
        handleDialogClose();
        const res = await dispatch(restoreNotifications(restoreArray));
        if (!res.error) {
          dispatch(getNotificationData());
        }
        setRestoreArray([]);
      }
    }
  }

  const renderGroups = (data = []) => {
    if (!data || !Array.isArray(data)) return null
    return {
      title: null,
      renderTitle: () => (
        <Box className={classes.myGroupsTitleSection} style={{ justifyContent: 'center', flexDirection: 'row', alignItems: 'center', direction: isRTL ? 'rtl' : 'ltr' }}>
          <Typography className={classes.dialogTitle}>{t('notifications.myGroups')}</Typography>
          <Typography className={clsx(classes.link, classes.bold)} onClick={() => {
            setDialogType({
              type: DialogTypes.CREATE_GROUP,
              data: {}
            })
          }}>({t('notifications.howToCreateGroup')})</Typography>
        </Box>
      ),
      showDivider: false,
      icon: (
        <div className={clsx(classes.dialogIconContent, classes.mt1, 'unicode')}>
          {'\uE0D5'}
        </div>
      ),
      content: (
        <Box className={clsx(classes.dialogBox, classes.pt0)}>
          <Table>
            <TableHead >
              <TableRow>
                <TableCell>{t('notifications.groupName')}</TableCell>
                <TableCell align="center">{t('notifications.recipients')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map(group => {
                return (
                  <TableRow key={group.Id}>
                    <TableCell>
                      <Box style={{ display: 'inline-grid' }}>
                        <Typography style={{ overflow: 'hidden', whiteSpace: 'noWrap', textOverflow: 'ellipsis' }}>
                          {group.GroupName}
                        </Typography>

                      </Box>
                    </TableCell>
                    <TableCell align="center">{group.Members}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Box>
      ),
      renderButtons: () => (
        <Button
          variant='contained'
          size='small'
          onClick={handleDialogClose}
          className={clsx(
            classes.middle,
            classes.width100,
            classes.btn,
            classes.btnRounded
          )}>
          {t('common.Ok')}
        </Button>
      )
    }
  }

  const renderCreateGroup = () => {
    return {
      title: t('notifications.howToCreateGroup'),
      paperStyle: classes.maxWidth540,
      showDivider: false,
      icon: (
        <div className={clsx(classes.dialogIconContent, 'unicode')}>
          {'\uE0D5'}
        </div>
      ),
      content: (
        <Box className={classes.pb10}>
          <Typography>{t('notifications.assigningRecipientsToGroupMessage')}</Typography>
          <Typography variant='body'>{t('common.pulseemLink')}</Typography>
          <Typography className={classes.mt10}>{t('notifications.thenYouWillAdd')}</Typography>
          <TextField
            dir="ltr"
            readOnly
            fullWidth
            size="small"
            variant='outlined'
            className={classes.mt10}
            value={t('notifications.sampleUrl')}
            disabled
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Box className={clsx(classes.pulseemIcon, classes.bold)}>{'\u0075'}</Box>
                </InputAdornment>
              ),
            }}
          />
          <Typography className={classes.mt10}>{t('notifications.onceYouHaveCreatedTheUrl')}</Typography>
        </Box>
      ),
      renderButtons: () => (
        <Button
          variant='contained'
          size='small'
          onClick={handleShowGroups}
          className={clsx(
            classes.middle,
            classes.width100,
            classes.btn,
            classes.btnRounded
          )}>
          {t('common.back')}
        </Button>
      )
    }
  }

  const renderGroupsById = (data = []) => {
    if (!data || !Array.isArray(data)) return null
    return {
      title: t('notifications.groupsByIdTitle'),
      showDivider: false,
      icon: (
        <div className={clsx(classes.dialogIconContent, 'unicode')}>
          {'\uE0D5'}
        </div>
      ),
      content: (
        <Box
          className={clsx(classes.gruopsDialogContent, classes.dialogBox)}>
          {data.map(group => {
            return (
              <Typography
                key={group.Id}
                className={classes.gruopsDialogText}>
                <FiberManualRecordIcon
                  className={classes.gruopsDialogBullet} />
                {group.GroupName}
              </Typography>
            )
          })}
        </Box>
      ),
      renderButtons: () => (
        <Box className={clsx(classes.flex, classes.flexCenter)}>
          <Button
            variant='contained'
            size='small'
            onClick={handleDialogClose}
            style={{ justifyContent: 'flex-center' }}
            className={clsx(
              classes.btn,
              classes.btnRounded,
            )}
          >
            {t('common.Ok')}
          </Button>
        </Box>
      )
    }
  }

  const renderDelete = (ID) => {
    return {
      title: t('notifications.deleteTitle'),
      showDivider: false,
      icon: (
        <div className={clsx(classes.dialogIconContent, 'unicode')}>
          {'\uE0D2'}
        </div>
      ),
      content: (
        <Box className={classes.dialogBox}>
          <Typography className={classes.f18}>
            {t('notifications.deleteConfirmation')}
          </Typography>
        </Box>
      ),
      onConfirm: async () => {
        handleDeleteNotification(ID);
        clearSearch()
      }
    }
  }

  const renderDuplicate = (ID) => {
    return {
      title: t('notifications.duplicateTitle'),
      showDivider: false,
      icon: (
        <div className={clsx(classes.dialogIconContent, 'unicode')}>
          {'\uE038'}
        </div>
      ),
      content: (
        <Box className={classes.dialogBox}>
          <Typography className={classes.f18}>
            {t('notifications.duplicateConfirmation')}
          </Typography>
        </Box>
      ),
      onConfirm: async () => {
        handleDuplicate(ID);
        setPage(1)
        clearSearch()
      }
    }
  }

  const renderScriptCode = () => {
    let scriptCode = `&lt;script type="text/javascript"&gt;
    (function(d, t) {
        var g = d.createElement(t),
        s = d.getElementsByTagName(t)[0];
        g.src="#scriptSource#scripts/application.js?d=" + Math.floor(Date.now() / 1000);
        g.setAttribute("key", #key#);
        #scriptpath#
        s.parentNode.insertBefore(g, s);
    }(document, "script"))
&lt;/script&gt;`;

    return scriptCode
      .replace("#key#", '"' + encodeURI(subAccountApiKey) + '"')
      .replace("&lt;", "<")
      .replace("&gt;", ">")
      .replace("&lt;", "<")
      .replace("&gt;", ">")
      .replace("#scriptSource#", actionURL)
      .replace(
        "#scriptpath#",
        scriptDirectory !== 0 && scriptPath !== ''
          ? 'g.setAttribute("swfolder", "' + scriptPath + '");'
          : ""
      )
      .replace(/(^[ \t]*\n)/gm, "");
  }

  const handleDontShowAgain = (value) => {
    setCookie('scriptDialog', !value, { maxAge: 2147483647 });
    handleScriptDialogCheck(value)
  }
  const renderImplement = () => {
    return {
      title: t('notifications.implementDialog.beforeYouStarted'),
      showDivider: false,
      icon: (
        <div className={clsx(classes.dialogIconContent, 'unicode')}>
          {'\u005E'}
        </div>
      ),
      content: (
        <Box className={clsx(classes.pt0, classes.dialogBox)}>
          <Typography
            className={clsx(classes.f20, classes.pb10)}>
            {t('notifications.implementDialog.startSendingOutMessage')}
          </Typography>
          <Typography className={classes.f18}>
            1. {t('notifications.downloadThe')}
            <a
              download="service-worker.js"
              className={clsx(classes.link, classes.colrPrimary)}
              href={process.env.PUBLIC_URL + '/assets/scripts/service-worker.js'}>
              {t('notifications.attachedScript')}
            </a>
          </Typography>
          <hr />
          <Grid container direction={'row'} alignItems="center">
            <Typography className={classes.f18}>
              2. {t('notifications.chooseSaveLocation')}
            </Typography>
            <RadioGroup row value={scriptDirectory} onChange={handleScriptDirectory} className={classes.radioGroup}>
              <FormControlLabel
                key={Math.round(Math.random() * 999999999)}
                value={0}
                className={classes.f18}
                control={<Radio color="primary" />}
                label={t("notifications.siteMainDirectory")}
              />
              <FormControlLabel
                key={Math.round(Math.random() * 999999999)}
                value={1}
                className={classes.f18}
                control={<Radio color="primary" />}
                label={t("notifications.anotherDirectory")}
              />
            </RadioGroup>
          </Grid>
          {scriptDirectory === 1 ?
            <Box>
              <Box className={clsx(classes.directoryField)}>
                <Typography className={classes.f16}>
                  {t("notifications.enterDirectory") + ':'}
                </Typography>
              </Box>
              <TextField
                variant="outlined"
                size="small"
                fullWidth
                placeholder={pathError && t('common.requiredField')}
                className={clsx(classes.textField, classes.maxWidth400, pathError && classes.error)}
                onChange={handleScriptPathChange}
                value={scriptPath}
              />
              <Typography
                variant="body2" className={classes.f14}>
                {t("notifications.example")}: /examplefolder1/examplefodler2/
              </Typography>
            </Box> : null}
          <hr />
          <Typography className={classes.f18}>
            3. {t('notifications.copyLineCodeText')}
          </Typography>
          <Typography className={clsx(classes.bold, classes.pb10, classes.pt10, classes.f18)}>
            {t('notifications.payAttentionText')}
          </Typography>
          <CopyToClipboard text={renderScriptCode()} onCopy={handleCopyScript}>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<div className={classes.copyIcon}>{copyStatus ? '\uE134' : '\ue0b0'}</div>}
            >
              {copyStatus ? t('notifications.copied') : t('notifications.copy')}
            </Button>
          </CopyToClipboard>
          <Box style={{ direction: 'ltr' }}>
            <Typography className={clsx(classes.bold, classes.f16)}>
              {t('notifications.headTagOpenText')} {'<head>'}
            </Typography>
            <pre>
              <div ref={refScriptCode} className={classes.scriptCode}>
                {renderScriptCode()}
              </div>
            </pre>
            <Typography className={clsx(classes.bold, classes.f16)}>
              {t('notifications.headTagClosesText')} {'</head>'}
            </Typography>
          </Box>
        </Box>
      ),
      renderButtons: () => (
        <Grid
          container
          spacing={2}
          className={clsx(classes.dialogButtonsContainer)}
        >
          <Grid item md={12} sm={12} lg={12} xs={12}>
            <FormControl className={classes.ps25}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={scriptDialog}
                    className={classes.checkbox}
                    onChange={() => handleDontShowAgain(!scriptDialog)}
                  />
                }
                label={t('notifications.implementDialog.dontShowThisMessage')} />
            </FormControl>
          </Grid>

          <Grid item md={12} className={classes.textCenter}>
            <Button
              variant='contained'
              size='small'
              onClick={() => {
                if (scriptDirectory === 1 && scriptPath === '') {
                  setPathError(true);
                  return false;
                }

                handleImplementScript();
                setShowScriptDialog(false)
              }}
              className={clsx(
                classes.btn,
                classes.btnRounded
              )}
            >
              {t('common.Ok')}
            </Button>
          </Grid>
        </Grid>
      )
    }
  }

  const renderDialog = () => {
    if (!dialogType || !dialogType.data) {
      return;
    }

    const { data, type } = dialogType || {};
    let dialog = null;

    switch (type) {
      case DialogTypes.PREVIEW: {
        dialog = renderPreview(data)
        break;
      }
      case DialogTypes.DUPLICATE: {
        dialog = renderDuplicate(data)
        break;
      }
      case DialogTypes.GROUPS_BY_ID: {
        dialog = renderGroupsById(data)
        break;
      }
      case DialogTypes.GROUPS: {
        dialog = renderGroups(data)
        break;
      }
      case DialogTypes.DELETE: {
        dialog = renderDelete(data)
        break;
      }
      case DialogTypes.RESTORE: {
        dialog = renderRestore(data)
        break;
      }
      case DialogTypes.IMPLEMENT: {
        dialog = renderImplement(data)
        break;
      }
      case DialogTypes.CREATE_GROUP: {
        dialog = renderCreateGroup(data)
        break;
      }
      case DialogTypes.SUBSCRIBERS: {
        dialog = renderSubscribers(data)
        break;
      }
      default: {
        return false;
      }
    }

    if (dialog) {
      return (<BaseDialog
        classes={classes}
        open={dialogType}
        onClose={handleDialogClose}
        onCancel={handleDialogClose}
        {...dialog}>
        {dialog.content}
      </BaseDialog>);
    }
    return (
      <></>
    );
  }

  return (
    <DefaultScreen
      key='notifications'
      subPage='notifications'
      currentPage='notifications'
      classes={classes}
      containerClass={clsx(classes.management, classes.mb50)}>
      <Box className={'topSection'}>
        <Title
          style={{ width: windowSize !== "xs" ? 'auto' : '' }}
          classes={classes}
          Element={
            <Box className={clsx(windowSize !== 'xs' ? classes.dFlex : '', classes.flexWrap)}>
              <Typography className={clsx(classes.managementTitle, "mgmtTitle")} style={{ width: 'auto' }}>{t('notifications.notificationManagement')}</Typography>
              <Button onClick={() => {
                setForceShowImplementation(true);
                setCookie('scriptDialog', true);
                setShowScriptDialog(true);
              }}
                className={clsx(
                  windowSize !== "xs" ? classes.implementButtonFlex : classes.mt10,
                  classes.btn, classes.btnRounded,
                )}
                style={{ alignSelf: 'flex-end' }}
                endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
              >{t('master.implementScript')}</Button>
            </Box>
          } />
        {renderSearchSection()}
      </Box>
      {renderManagmentLine()}
      {renderTable()}
      {renderTablePagination()}
      {renderDialog()}
      {renderImplementDialog()}
      <Loader isOpen={showLoader} />
    </DefaultScreen >
  )
}

export default NotificationManagement