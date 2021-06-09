import React, { useState, useEffect, useRef } from 'react';
import DefaultScreen from './DefaultScreen';
import clsx from 'clsx';
import {
  Typography, Divider, Table, TableBody, TableRow, TableHead, TableCell, TableContainer, Link,
  Grid, Button, TextField, IconButton, InputAdornment, Input, Box, FormControlLabel, Checkbox, Select, MenuItem, CardMedia, Card, CardContent, RadioGroup, Radio, FormGroup, FormControl
} from '@material-ui/core'
import {
  DeleteIcon, DuplicateIcon, EditIcon, SendGreenIcon, SearchIcon,
  GroupsIcon, PreviewIcon
} from '../assets/images/managment/index'
import {
  TablePagination, ManagmentIcon, DateField, Dialog, RestorDialogContent, SearchField
} from '../components/managment/index'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import useCtrlHistory from '../helpers/useCtrlHistory';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import ClearIcon from '@material-ui/icons/Clear';
import moment from 'moment';
import 'moment/locale/he';
import {
  getNotificationById, getNotificationGroups, getNotificationData, getDeletedNotifications,
  duplicateNotification, deleteNotification, getNotificationGroupsById, restoreNotifications,
  getScriptPath, getApiToken, updateScriptPath
} from '../redux/reducers/notificationSlice';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Preview } from '../components/Notifications/Preview/Preview';
import { getCookie, setCookie } from '../helpers/cookies';
import { actionURL } from '../config/index'

const NotificationManagement = ({ classes }) => {
  const { language, windowSize } = useSelector(state => state.core)
  const { notificationData } = useSelector(state => state.notification)
  const { t } = useTranslation()
  const [fromDate, handleFromDate] = useState(null);
  const [toDate, handleToDate] = useState(null);
  const [scriptDialog, handleScriptDialogCheck] = useState(false);
  const [notificationNameSearch, setNotificationNameSearch] = useState('');
  const [scriptDirectory, setScriptDirectory] = useState(0);
  const [copyStatus, setCopyStatus] = useState(false);
  const [scriptPath, setScriptPath] = useState(0);
  const [apiToken, setApiToken] = useState(0);
  const rowsOptions = [6, 12, 18]
  const [rowsPerPage, setRowsPerPage] = useState(rowsOptions[0])
  const [page, setPage] = useState(1)
  const [isSearching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState(null)
  const [dialogType, setDialogType] = useState(null)
  const [restoreArray, setRestoreArray] = useState([]);
  const history = useCtrlHistory()
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
  const refScriptCode = useRef(null);
  moment.locale(language)

  const getData = () => {
    dispatch(getNotificationData());
  }

  useEffect(() => {
    handleScriptPath();
    handleApiToken();
    getData();
  }, [dispatch]);

  const handleScriptPath = async () => {
    const scriptPath = await dispatch(getScriptPath());
    const path = (scriptPath && scriptPath.payload) || '';
    setScriptPath(path);
  }

  const handleApiToken = async () => {
    const apiToken = await dispatch(getApiToken());
    const token = (apiToken && apiToken.payload && apiToken.payload.PublicKey) || '';
    setApiToken(token);
  }

  const handleScriptDirectory = async (event) => {
    const value = parseInt(event.target.value);
    setScriptDirectory(value);
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
    const item = await dispatch(getNotificationById(ID));
    setDialogType({
      type: 'preview',
      data: item.payload
    })
  }

  const handleShowGroups = async (ID) => {
    const item = await dispatch(getNotificationGroups(ID));
    if (item && item.payload) {

    }
    setDialogType({
      type: 'groups',
      data: item.payload
    })
  }

  const handleShowGroupsById = async (ID) => {
    const item = await dispatch(getNotificationGroupsById(ID));
    setDialogType({
      type: 'groupsById',
      data: item.payload
    })
  }

  const handleDuplicate = async (ID) => {
    const res = await dispatch(duplicateNotification(ID));
    clearSearch();
    if (!res.error) {
      dispatch(getNotificationData());
    }
    handleDialogClose();
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
        type: 'restore',
        data: res.payload
      });
    }
  }

  const handleImplementScript = (value) => {
    if (value) {
      setCookie('scriptDialog', scriptDialog, { maxAge: 2147483647 });
      dispatch(updateScriptPath(scriptPath));
    }
    setShowScriptDialog(false)
  }

  const renderImplementDialog = () => {
    if (hideScriptDialog) {
      return;
    }

    const dialog = renderImplement();
    return (
      <Dialog
        classes={classes}
        open={showScriptDialog}
        onClose={() => handleImplementScript(false)}
        {...dialog}>
        {dialog.content}
      </Dialog>
    );
  }

  const renderHeader = () => {
    return (
      <>
        <Typography className={classes.managementTitle}>
          {t('notifications.notificationManagement')}
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

      let sortData = notificationData;
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
      <Grid container spacing={2} className={classes.lineTopMarging}>
        <Grid item>
          <TextField
            variant='outlined'
            size='small'
            value={notificationNameSearch}
            onChange={handleNotificationNameChange}
            className={clsx(classes.textField, classes.minWidth252)}
            placeholder={t('notifications.searchSection.notificationName')}
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
    const dataLength = isSearching ? searchResults.length : notificationData.length;
    return (
      <Grid container spacing={2} className={classes.linePadding} >
        {windowSize !== 'xs' && <Grid item>
          <Button
            variant='contained'
            size='medium'
            href='/react/Notification/create'
            className={clsx(
              classes.actionButton,
              classes.actionButtonLightGreen
            )}>
            {t('notifications.buttons.createNotification')}
          </Button>
        </Grid>}
        {windowSize !== 'xs' && <Grid item>
          <Button
            variant='contained'
            size='medium'
            className={clsx(
              classes.actionButton,
              classes.actionButtonLightBlue
            )}
            onClick={handleShowDeletedItems}>
            {t('notifications.restoreDeleted')}
          </Button>
        </Grid>}
        {windowSize !== 'xs' && <Grid item>
          <Button
            variant='contained'
            size='medium'
            className={clsx(
              classes.actionButton,
              classes.actionButtonLightBlue
            )}
            onClick={handleShowGroups}>
            {t('notifications.buttons.groups')}
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
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center'>{t("notifications.tblHeader.sent")}</TableCell>
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
        key: 'send',
        icon: SendGreenIcon,
        lable: t('notifications.buttons.send'),
        remove: StatusID !== 0,
        rootClass: classes.sendIcon,
        textClass: classes.sendIconText,
        href: `/react/Notification/send/${ID}`
      },
      {
        key: 'preview',
        icon: PreviewIcon,
        lable: t('notifications.buttons.preview'),
        remove: windowSize === 'xs',
        rootClass: classes.paddingIcon,
        onClick: () => {
          handlePreview(ID);
        }
      },
      {
        key: 'edit',
        icon: EditIcon,
        disable: StatusID !== 0,
        lable: t('notifications.buttons.edit'),
        remove: windowSize === 'xs',
        href: `/react/notification/Edit/${ID}`,
        rootClass: classes.paddingIcon
      },
      {
        key: 'duplicate',
        icon: DuplicateIcon,
        lable: t('notifications.buttons.duplicate'),
        rootClass: classes.paddingIcon,
        onClick: () => {
          setDialogType({
            type: "duplicate",
            data: ID
          });
        }
      },
      {
        key: 'groups',
        icon: GroupsIcon,
        disable: (!HasGroups),
        lable: t('notifications.buttons.groups'),
        rootClass: classes.paddingIcon,
        onClick: () => {
          handleShowGroupsById(ID);
        }
      },
      {
        key: 'delete',
        icon: DeleteIcon,
        lable: t('notifications.buttons.delete'),
        showPhone: true,
        rootClass: classes.paddingIcon,
        onClick: async () => {
          setDialogType({
            type: 'delete',
            data: ID
          })
        }
      }
    ]
    return (
      <Grid
        container
        direction='row'
        justify={windowSize === 'xs' ? 'flex-start' : 'flex-end'}>
        {iconsMap.map(icon => (
          <Grid
            className={icon.disable && classes.disabledCursor}
            key={icon.key}
            item >
            <ManagmentIcon
              classes={classes}
              {...icon}
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
    if (!row.SendDate || row.StatusID == 0) {
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
        <Typography noWrap={false} className={classes.nameEllipsis}>
          {row.Name}
        </Typography>
        <Typography style={{ 'WebkitLineClamp': 1 }}>
          {`${text} ${date.format('L')} ${date.format('LT')}`}
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
        <TableCell classes={{ root: clsx(classes.tableCellRoot, classes.flex1) }}>
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
        rows={isSearching ? searchResults.length : notificationData.length}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={setRowsPerPage}
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
    setRestoreArray([]);
  }

  const renderPreview = (data = {}) => {
    return {
      showDivider: false,
      icon: (
        <div className={classes.dialogIconContent}>
          {'\uE0F8'}
        </div>
      ),
      content: (
        <Box className={classes.dialogBox}>
          <Preview classes={classes}
            model={data}
            ShowRedirectButton={data.RedirectButtonText && data.RedirectButtonText != ''}
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
            classes.confirmButton,
            classes.dialogConfirmButton,
          )}>
          {t('common.confirm')}
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
        <div className={classes.dialogIconContent}>
          {'\uE185'}
        </div>
      ),
      content: (
        <RestorDialogContent
          classes={classes}
          data={data}
          currentChecked={restoreArray}
          onChange={handleChange}
        />
      ),
      onConfirm: async () => {
        const res = await dispatch(restoreNotifications(restoreArray));
        if (!res.error) {
          dispatch(getNotificationData());
        }
        handleDialogClose();
      }
    }
  }

  const renderGroups = (data = []) => {
    if (!data || !Array.isArray(data)) return null
    return {
      title: null,
      renderTitle: () => (
        <Box className={classes.myGroupsTitleSection}>
          <Typography className={classes.dialogTitle}>{t('notifications.myGroups')}</Typography>
          <Link
            className={clsx(classes.f15, classes.bold, classes.mt5)}
            component="button"
            color="textPrimary"
            underline="always"
            onClick={() => {
              setDialogType({
                type: 'createGroup',
                data: {}
              })
            }}>
            {t('notifications.howToCreateGroup')}
          </Link>
        </Box>
      ),
      showDivider: false,
      icon: (
        <div className={classes.dialogIconContent}>
          {'\uE0D5'}
        </div>
      ),
      content: (
        <Box className={classes.dialogBox}>
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
            classes.gruopsDialogButton,
            classes.dialogConfirmButton,
          )}>
          {t('common.Ok')}
        </Button>
      )
    }
  }

  const renderCreateGroup = () => {
    return {
      title: null,
      paperStyle: classes.maxWidth540,
      showDivider: false,
      icon: (
        <div className={classes.dialogIconContent}>
          {'\uE0D5'}
        </div>
      ),
      content: (
        <Box className={classes.dialogBox}>
          <Typography variant="h6" className={classes.bold}>{t('notifications.howToCreateGroup')}</Typography>
          <Typography>{t('notifications.assigningRecipientsToGroupMessage')}</Typography>
          <Typography>{t('notifications.doneByMessage')}</Typography>
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
          onClick={handleDialogClose}
          className={clsx(
            classes.gruopsDialogButton,
            classes.dialogConfirmButton,
          )}>
          {t('common.confirm')}
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
        <div className={classes.dialogIconContent}>
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
        <Button
          variant='contained'
          size='small'
          onClick={handleDialogClose}
          className={clsx(
            classes.gruopsDialogButton,
            classes.dialogConfirmButton,
          )}>
          {t('common.Ok')}
        </Button>
      )
    }
  }

  const renderDelete = (ID) => {
    return {
      title: t('notifications.deleteTitle'),
      showDivider: false,
      icon: (
        <div className={classes.dialogIconContent}>
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
        <div className={classes.dialogIconContent}>
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
        clearSearch()
      }
    }
  }

  const renderScriptCode = () => {
    let scriptCode = `&lt;script type="text/javascript"&gt;
    (function(d, t) {
        var g = d.createElement(t),
        s = d.getElementsByTagName(t)[0];
        g.src="#scriptSource#?d=" + Math.floor(Date.now() / 1000);
        g.setAttribute("key", #key#);
        #scriptpath#
        s.parentNode.insertBefore(g, s);
    }(document, "script"))
&lt;/script&gt;`;

    return scriptCode
      .replace("#key#", '"' + encodeURI(apiToken) + '"')
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

  const renderImplement = () => {
    return {
      title: null,
      showDivider: false,
      icon: (
        <div className={classes.dialogIconContent}>
          {'\u005E'}
        </div>
      ),
      content: (
        <Box className={classes.dialogBox}>
          <Typography
            className={classes.f28}>
            {t('notifications.implementDialog.beforeYouStarted')}
          </Typography>
          <Typography
            className={clsx(classes.f20, classes.pb10)}>
            {t('notifications.implementDialog.startSendingOutMessage')}
          </Typography>
          <Typography className={classes.f18}>
            1. {t('notifications.downloadThe')}
            <a
              download
              target="_blank"
              rel="noreferrer"
              href="https://pn.pulseem.com/assets/scripts/service-worker.js">
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
              <Box className={classes.directoryField}>
                <Typography className={classes.f16}>
                  {t("notifications.enterDirectory")}
                </Typography>
                <Typography
                  variant="body2" className={classes.f16}>
                  {t("notifications.example")}: /examplefolder1/examplefodler2/
                  </Typography>
              </Box>
              <TextField
                variant="outlined"
                size="small"
                fullWidth
                className={classes.maxWidth400}
                onChange={handleScriptPathChange}
                value={scriptPath}
              />
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
        <>
          <FormControl className={classes.ps25}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={scriptDialog}
                  onChange={() => handleScriptDialogCheck(!scriptDialog)}
                  color="primary"
                />
              }
              label={t('notifications.implementDialog.dontShowThisMessage')} />
          </FormControl>
          <Button
            variant='contained'
            size='small'
            onClick={() => handleImplementScript(true)}
            className={clsx(
              classes.gruopsDialogButton,
              classes.dialogConfirmButton,
            )}>
            {t('common.Ok')}
          </Button>
        </>
      )
    }
  }

  const renderDialog = () => {
    if (!dialogType || !dialogType.data) {
      return;
    }

    const { data, type } = dialogType || {};

    const dialogContent = {
      preview: renderPreview(data),
      duplicate: renderDuplicate(data),
      groupsById: renderGroupsById(data),
      groups: renderGroups(data),
      delete: renderDelete(data),
      restore: renderRestore(data),
      implement: renderImplement(data),
      createGroup: renderCreateGroup(),
    }
    const dialog = dialogContent[type];
    return (
      <Dialog
        classes={classes}
        open={dialogType}
        onClose={handleDialogClose}
        {...dialog}>
        {dialog.content}
      </Dialog>
    );
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
      {renderDialog()}
      {renderImplementDialog()}
    </DefaultScreen>
  )
}

export default NotificationManagement