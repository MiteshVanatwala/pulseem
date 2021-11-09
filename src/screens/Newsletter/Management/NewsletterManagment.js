import React, { useState, useEffect } from 'react';
import DefaultScreen from '../../DefaultScreen'
import clsx from 'clsx';
import {
  Typography, Divider, Table, TableBody, TableRow, TableHead, TableCell, TableContainer,
  Grid, Button, TextField, Box, Tooltip
} from '@material-ui/core'
import { withStyles, makeStyles } from '@material-ui/core/styles';
import {
  AutomationIcon, DeleteIcon, DuplicateIcon, EditIcon, SendGreenIcon, SearchIcon,
  GroupsIcon, PreviewIcon, ReportsIcon, CopyIcon
} from '../../../assets/images/managment/index'
import {
  TablePagination, ManagmentIcon, DateField, Dialog, PopMassage, SearchField, RestorDialogContent
} from '../../../components/managment/index'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import {
  getNewslatterData, restoreCampaigns, deleteCampaign, duplicteCampaign
} from '../../../redux/reducers/newsletterSlice'
import useCtrlHistory from '../../../helpers/useCtrlHistory'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import ClearIcon from '@material-ui/icons/Clear'
import moment from 'moment'
import 'moment/locale/he'
import { pulseemNewTab } from '../../../helpers/functions';
import { Loader } from '../../../components/Loader/Loader';
import { setRowsPerPage } from '../../../redux/reducers/coreSlice';
import { setCookie } from '../../../helpers/cookies';
import CustomTooltip from '../../../components/Tooltip/CustomTooltip';

const NewsletterManagnentScreen = ({ classes }) => {
  const { language, windowSize, rowsPerPage } = useSelector(state => state.core)
  const { newslettersData, newslettersDataError, newslettersDeletedData } = useSelector(state => state.newsletter)
  const { t } = useTranslation()
  const [fromDate, handleFromDate] = useState(null);
  const [toDate, handleToDate] = useState(null)
  const [campaineNameSearch, setCampaineNameSearch] = useState('')
  const rowsOptions = [6, 10, 20, 50]
  const [page, setPage] = useState(1)
  const [isSearching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot }
  const cellStyle = { head: classes.tableCellHead, body: classes.tableCellBody, root: classes.tableCellRoot }
  const [dialogType, setDialogType] = useState(null)
  const [showCopied, setShowCopied] = useState(null)
  const [copyRef, setCopyRef] = useState(null)
  const [restoreArray, setRestoreArray] = useState([])
  const [showLoader, setLoader] = useState(true);
  const history = useCtrlHistory()
  const dateFormat = 'YYYY-MM-DD HH:mm:ss.FFF'
  const dispatch = useDispatch()
  moment.locale(language)

  const getData = async () => {
    await dispatch(getNewslatterData())
    setLoader(false);
  }

  useEffect(() => {
    setLoader(true);
    getData();
  }, [dispatch])

  const renderHeader = () => {
    return (
      <>
        <Typography className={classes.managementTitle}>
          {t('campaigns.logPageHeaderResource1.Text')}
        </Typography>
        <Divider />
      </>
    )
  }

  const clearSearch = () => {
    setCampaineNameSearch('');
    handleFromDate(null);
    handleToDate(null);
    setSearchResults(null);
    setSearching(false);
  }

  const renderSearchLine = () => {
    const handleKeyDown = (event) => {
      if (event.keyCode === 13 || event.key === 'Enter') {
        handleSearch();
      }
    }
    const handleSearch = () => {
      const searchArray = [{
        type: 'name',
        campaineName: campaineNameSearch
      }, {
        type: 'date',
        fromDate,
        toDate
      }];

      const filtersObject = {
        name: (row, values) => {
          return String(row.Name.toLowerCase()).includes(values.campaineName.toLowerCase());
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

      let sortData = newslettersData
      searchArray.forEach(values => {
        sortData = sortData.filter(row => filtersObject[values.type](row, values))
      });
      setSearchResults(sortData);
      setSearching(true);
      setPage(1);
    }

    const handleKeyPress = (e) => {
      if (e.charCode === 13) {
        handleSearch()
      }
    }

    const handleFromDateChange = (value) => {
      if (value > toDate) {
        handleToDate(null);
      }
      handleFromDate(value);
    }

    const handleCampainNameChange = event => {
      setCampaineNameSearch(event.target.value)
    }

    if (windowSize === 'xs') {
      return (
        <SearchField
          classes={classes}
          value={campaineNameSearch}
          onChange={handleCampainNameChange}
          onKeyPress={handleSearch}
          onClick={handleSearch}
          onKeyPress={handleKeyPress}
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
            value={campaineNameSearch}
            onKeyPress={handleKeyDown}
            onChange={handleCampainNameChange}
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

        <Grid item>
          <Button
            size='large'
            variant='contained'
            onClick={handleSearch}
            className={classes.searchButton}
            endIcon={<SearchIcon />}>
            {t('campaigns.btnSearchResource1.Text')}
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
    return (
      <Grid container spacing={2} className={classes.linePadding} >
        {windowSize !== 'xs' && <Grid item>
          <Button
            variant='contained'
            size='medium'
            href='/Pulseem/Editor/CampaignInfo?new=1&fromreact=true'
            className={clsx(
              classes.actionButton,
              classes.actionButtonLightGreen
            )}>
            {t('campaigns.create')}
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
            onClick={() => setDialogType({
              type: 'restore',
              data: newslettersDeletedData
            })}>
            {t('campaigns.restoreDeleted')}
          </Button>
        </Grid>}
        <Grid item className={classes.groupsLableContainer} >
          <Typography className={classes.groupsLable}>
            {`${isSearching ? searchResults.length : newslettersData.length} ${t('campaigns.newsletters')}`}
          </Typography>
        </Grid>
      </Grid>
    )
  }

  const renderTableHead = () => {
    return (
      <TableHead>
        <TableRow classes={rowStyle}>
          <TableCell classes={cellStyle} className={classes.flex3} align='center'>{t("common.CampaignName")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("campaigns.recipients")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("campaigns.lblCampaignStatusResource1.Text")}</TableCell>
          <TableCell classes={{ root: classes.tableCellRoot }} className={classes.flex12} ></TableCell>
        </TableRow>
      </TableHead>
    )
  }

  const renderCellIcons = (row) => {
    const { Status, Groups, AutomationID, CampaignID, shareUrl, AutomationTriggerInActive } = row

    const renderCopyToClipoard = (
      showCopied === CampaignID ?
        <PopMassage
          classes={classes}
          show={showCopied === CampaignID}
          timeout={2000}
          label={t('common.copyClip')}
          innerRef={copyRef}
        /> : null
    )

    const iconsMap = [[
      {
        key: 'send',
        icon: SendGreenIcon,
        lable: t('campaigns.imgSendResource1.ToolTip'),
        remove: Status !== 1 || (AutomationID !== 0 && AutomationTriggerInActive === false),
        rootClass: classes.sendIcon,
        textClass: classes.sendIconText,
        href: `/Pulseem/SendCampaign.aspx?CampaignID=${CampaignID}&fromreact=true`
      },
      {
        key: 'preview',
        icon: PreviewIcon,
        lable: t('campaigns.Image1Resource1.ToolTip'),
        remove: windowSize === 'xs',
        rootClass: classes.paddingIcon,
        onClick: () => {
          pulseemNewTab(`PreviewCampaign.aspx?CampaignID=${CampaignID}&fromreact=true`)
        }
      },
      {
        key: 'edit',
        icon: EditIcon,
        disable: Status !== 1 || AutomationID !== 0,
        lable: t('campaigns.Image2Resource1.ToolTip'),
        remove: windowSize === 'xs',
        href: `/Pulseem/Editor/CampaignEdit/${CampaignID}?fromreact=true`,
        rootClass: classes.paddingIcon,
      },
      {
        key: 'duplicate',
        icon: DuplicateIcon,
        lable: t('campaigns.lnkEditResource1.ToolTip'),
        rootClass: classes.paddingIcon,
        onClick: () => {
          setDialogType({
            type: 'duplicate',
            data: CampaignID
          })
        }
      },
      {
        key: 'groups',
        icon: GroupsIcon,
        disable: Groups && Groups.length === 0,
        lable: t('campaigns.lnkPreviewResource1.ToolTip'),
        remove: windowSize === 'xs',
        rootClass: classes.paddingIcon,
        onClick: () => {
          setDialogType({
            type: 'groups',
            data: row.Groups
          })
        }
      },
      {
        key: 'copy',
        icon: CopyIcon,
        lable: t('campaigns.CloneResource1.HeaderText'),
        rootClass: classes.paddingIcon,
        text: shareUrl || '',
        type: 'copy',
        onClick: (e) => {
          setCopyRef(e.current)
          setShowCopied(CampaignID)
          setTimeout(() => {
            setShowCopied(null)
          }, 1000)
        }
      },
      {
        key: 'reports',
        icon: ReportsIcon,
        disable: Status === 1,
        lable: t('campaigns.Reports'),
        remove: windowSize === 'xs',
        href: `/Pulseem/CampaignStatistics.aspx?CampaignID=${CampaignID}&fromreact=true`,
        rootClass: classes.paddingIcon,
      },
      {
        key: 'automation',
        icon: AutomationIcon,
        disable: AutomationID === 0,
        lable: t('campaigns.automation'),
        remove: windowSize === 'xs',
        onClick: () => {
          pulseemNewTab(`CreateAutomations.aspx?Mode=show&AutomationID=${AutomationID}&fromreact=true`)
        },
        rootClass: classes.paddingIcon,
      },
      {
        key: 'delete',
        icon: DeleteIcon,
        lable: t('campaigns.DeleteResource1.HeaderText'),
        rootClass: classes.paddingIcon,
        disable: AutomationID !== 0,
        showPhone: true,
        onClick: () => {
          setDialogType({
            type: 'delete',
            data: CampaignID
          })
        }
      }
    ]
    ]
    return (
      <Grid
        container
        direction={windowSize === 'sm' ? 'column' : 'row'}
        justifyContent={windowSize === 'xs' ? 'flex-start' : 'flex-end'}>
        {iconsMap.map((map, index) => (
          <Grid
            key={index}
            item>
            <Grid
              container>
              {map.map(icon => (
                <Grid
                  className={clsx(icon.disable && classes.disabledCursor)}
                  key={icon.key}
                  item >
                  <ManagmentIcon
                    classes={classes}
                    {...icon}
                  />
                  {icon.key === 'copy' && renderCopyToClipoard}
                </Grid>
              ))}
            </Grid>
          </Grid>
        ))}
      </Grid>
    )
  }

  const renderStatusCell = (status) => {
    const statuses = {
      1: 'common.Created',
      2: 'common.Sending',
      3: 'campaigns.Stopped',
      4: 'common.Sent',
      5: 'campaigns.Canceled',
      6: 'campaigns.Optin',
      7: 'campaigns.Approve'
    }
    return (
      <>
        <Typography className={clsx(
          classes.middleText,
          classes.recipientsStatus,
          {
            [classes.recipientsStatusCreated]: status === 1,
            [classes.recipientsStatusSent]: status === 4,
            [classes.recipientsStatusSending]: status === 2,
            [classes.recipientsStatusCanceled]: status === 5
          }
        )}>
          {t(statuses[status])}
        </Typography>
      </>
    )
  }

  const renderRecipientsCell = (recipients) => {

    return (
      <>
        <Typography className={classes.middleText}>
          {recipients.toLocaleString()}
        </Typography>
        <Typography className={classes.middleText}>
          {t("campaigns.recipients")}
        </Typography>
      </>
    )
  }

  const HtmlTooltip = withStyles((theme) => ({
    tooltip: {
      maxWidth: 220
    },
  }))(Tooltip);

  const renderNameCell = (row) => {
    let date = null
    let text = ''
    if (!row.SendDate) {
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
        <CustomTooltip
          classes={classes}
          interactive={true}
          arrow={true}
          placement={'top'}
          title={<Typography noWrap={false}>{row.Name}</Typography>}
          text={row.Name}
        />
        <Typography className={classes.f14}>
          {`${t("mainReport.CampaignID")} ${row.CampaignID}`}
        </Typography>
        <Typography
          className={classes.grayTextCell}>
          {`${text} ${date.format('DD/MM/YYYY')} ${date.format('LT')}`}
        </Typography>
      </>
    )
  }

  const renderRow = (row) => {
    return (
      <TableRow
        key={row.CampaignID}
        classes={rowStyle}>
        <TableCell
          classes={cellStyle}
          align='center'
          className={classes.flex3}>
          {renderNameCell(row)}
        </TableCell>
        <TableCell
          classes={cellStyle}
          align='center'
          className={classes.flex1}>
          {renderRecipientsCell(row.SentCount)}
        </TableCell>
        <TableCell
          classes={cellStyle}
          align='center'
          className={classes.flex1}>
          {renderStatusCell(row.Status)}
        </TableCell>
        <TableCell
          component="th"
          scope="row"
          classes={{ root: classes.tableCellRoot }}
          className={classes.flex12}>
          {renderCellIcons(row)}

        </TableCell>
      </TableRow>
    )
  }

  const renderPhoneRow = (row) => {
    return (
      <TableRow
        key={row.CampaignID}
        component='div'
        classes={rowStyle}>
        <TableCell style={{ flex: 1 }} classes={{ root: classes.tableCellRoot }}>
          <Box className={classes.justifyBetween}>
            <Box className={classes.inlineGrid}>
              {renderNameCell(row)}
            </Box>
            <Box>
              {renderStatusCell(row.Status)}
            </Box>
          </Box>
          {renderCellIcons(row)}
        </TableCell>
      </TableRow>
    )
  }

  const renderTableBody = () => {
    let sortData = isSearching ? searchResults : newslettersData;
    let rpp = parseInt(rowsPerPage)
    sortData = sortData.slice((page - 1) * rpp, (page - 1) * rpp + rpp)
    return (
      <TableBody>
        {sortData
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
    return (
      <TablePagination
        classes={classes}
        rows={isSearching ? searchResults.length : newslettersData.length}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={rowsOptions}
        page={page}
        onPageChange={setPage}
      />
    )
  }

  const handleChange = (CampaignID) => () => {
    const found = restoreArray.includes(CampaignID)
    if (found) {
      setRestoreArray(restoreArray.filter(restore => restore !== CampaignID))
    } else {
      setRestoreArray([...restoreArray, CampaignID])
    }

  }

  const handleClose = () => {
    setDialogType(null)
  }

  const getRestorDialog = (data = []) => {
    if (!data || !Array.isArray(data)) return null
    return {
      title: t('campaigns.restoreCampaignTitle'),
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
          dataIdVar='CampaignID'
        />
      ),
      onConfirm: async () => {
        handleClose()
        await dispatch(restoreCampaigns(restoreArray))
        setRestoreArray([])
        getData()
      }
    }
  }

  const getGruopsDialog = (data = []) => {
    if (!data || !Array.isArray(data)) return null
    return {
      title: t('campaigns.ShowGroupsTitle'),
      showDivider: false,
      icon: (
        <div className={classes.dialogIconContent}>
          {'\uE0D5'}
        </div>
      ),
      content: (
        <Box
          className={classes.gruopsDialogContent}>
          {data.map(group => {
            return (
              <Typography
                key={group}
                className={classes.gruopsDialogText}>
                <FiberManualRecordIcon
                  className={classes.gruopsDialogBullet} />
                {group}
              </Typography>
            )
          })}
        </Box>
      ),
      renderButtons: () => (
        <Button
          variant='contained'
          size='small'
          onClick={handleClose}
          className={clsx(
            classes.gruopsDialogButton,
            classes.dialogConfirmButton,
          )}>
          {t('common.Ok')}
        </Button>
      )
    }
  }

  const getDeleteDialog = (data = '') => ({
    title: t('campaigns.GridButtonColumnResource2.ConfirmTitle'),
    showDivider: false,
    icon: (
      <Box className={classes.dialogAlertIcon}>
        !
      </Box>
    ),
    content: (
      <Typography style={{ fontSize: 18 }}>
        {t('campaigns.GridButtonColumnResource2.ConfirmText')}
      </Typography>
    ),
    onConfirm: async () => {
      clearSearch()
      handleClose()
      await dispatch(deleteCampaign(data))
      getData()
    }
  })

  const getDuplicateDialog = (data = '') => ({
    title: t('campaigns.dialogDuplicateTitle'),
    showDivider: false,
    icon: (
      <Box className={classes.dialogAlertIcon}>
        !
      </Box>
    ),
    content: (
      <Typography style={{ fontSize: 18 }}>
        {t('campaigns.dialogDuplicateContent')}
      </Typography>
    ),
    onConfirm: async () => {
      clearSearch()
      handleClose()
      setPage(1)
      await dispatch(duplicteCampaign(data))
      getData()
    }
  })
  const renderDialog = () => {
    const { data, type } = dialogType || {}

    const dialogContent = {
      restore: getRestorDialog(data),
      groups: getGruopsDialog(data),
      delete: getDeleteDialog(data),
      duplicate: getDuplicateDialog(data)
    }

    const currentDialog = dialogContent[type] || {}
    return (
      dialogType && <Dialog
        classes={classes}
        open={dialogType}
        onClose={handleClose}
        {...currentDialog}>
        {currentDialog.content}
      </Dialog>
    )
  }

  return (
    <DefaultScreen
      currentPage='newsletter'
      classes={classes}
      containerClass={classes.management}>
      {renderHeader()}
      {renderSearchLine()}
      {renderManagmentLine()}
      {renderTable()}
      {renderTablePagination()}
      {renderDialog()}
      <Loader isOpen={showLoader} />
    </DefaultScreen>
  )
}

export default NewsletterManagnentScreen