import { useState, useEffect } from 'react';
import DefaultScreen from '../../DefaultScreen'
import clsx from 'clsx';
import {
  Typography, Table, TableBody, TableRow, TableHead, TableCell, TableContainer,
  Grid, Button, TextField, Box
} from '@material-ui/core'
import {
  DeleteIcon, EditIcon, ReportsIcon, PreviewIcon
} from '../../../assets/images/managment/index'
import {
  TablePagination, ManagmentIcon, DateField, RestorDialogContent, Switch, SearchField
} from '../../../components/managment/index'
import {
  getAutomationsData, deleteAutomations, duplicateAutomations, restoreAutomations, activateAutomation
} from '../../../redux/reducers/automationsSlice'
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import 'moment/locale/he'
import { pulseemNewTab } from '../../../helpers/Functions/functions';
import { Loader } from '../../../components/Loader/Loader';
import { setRowsPerPage } from '../../../redux/reducers/coreSlice';
import CustomTooltip from '../../../components/Tooltip/CustomTooltip';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import { sendToTeamChannel } from "../../../redux/reducers/ConnectorsSlice";
import { Title } from '../../../components/managment/Title';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { DateFormats } from '../../../helpers/Constants';


const AutomationsManagnentScreen = ({ classes }) => {
  const Redirect = useNavigate();
  const { language, windowSize, rowsPerPage, isRTL } = useSelector(state => state.core)
  const { automationsData, automationsDeletedData } = useSelector(state => state.automations)
  const { t } = useTranslation()
  const [fromDate, handleFromDate] = useState(null);
  const [toDate, handleToDate] = useState(null)
  const [campaineNameSearch, setCampaineNameSearch] = useState('')
  const rowsOptions = [6, 10, 20, 50]
  const [page, setPage] = useState(1)
  const [isSearching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState(null)
  const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot }
  const cellStyle = { head: classes.tableCellHead, body: classes.tableCellBody, root: classes.tableCellRoot }
  const [dialogType, setDialogType] = useState(null)
  const [restoreArray, setRestoreArray] = useState([])
  const dateFormat = 'YYYY-MM-DD HH:mm:ss.FFF'
  const [showLoader, setLoader] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const dispatch = useDispatch()
  moment.locale(language)

  const getData = async () => {
    await dispatch(getAutomationsData())
    setLoader(false);
  }

  useEffect(() => {
    setLoader(true);
    getData();

  }, [dispatch])

  const clearSearch = () => {
    setCampaineNameSearch('')
    handleFromDate(null)
    handleToDate(null)
    setSearchResults(null)
    setSearching(false)
  }

  const renderSearchLine = () => {
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
          const { ModifiedDate, ActivatedOn } = row
          const lastUpdate = ActivatedOn ?
            moment(ActivatedOn, dateFormat).valueOf()
            : moment(ModifiedDate, dateFormat).valueOf()
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

      let sortData = automationsData
      searchArray.forEach(values => {
        sortData = sortData.filter(row => filtersObject[values.type](row, values))
      });
      setSearchResults(sortData);
      setSearching(true);
      setPage(1);
    }

    const handleKeyPress = (e) => {
      if (e.keyCode === 13 || e.code === "Enter") {
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
        <Grid container className={'searchLine'}>
          <SearchField
            classes={classes}
            value={campaineNameSearch}
            onChange={handleCampainNameChange}
            onClick={handleSearch}
            onKeyPress={handleKeyPress}
            placeholder={t('automations.labelAutomationName')}
          />
        </Grid>
      )
    }

    return (
      <Grid container spacing={2} className={clsx(classes.lineTopMarging, 'searchLine')}>
        <Grid item>
          <TextField
            variant='outlined'
            size='small'
            value={campaineNameSearch}
            onKeyPress={handleKeyPress}
            onChange={handleCampainNameChange}
            className={clsx(classes.textField, classes.minWidth252)}
            placeholder={t('automations.labelAutomationName')}
          />
        </Grid>

        {windowSize !== 'xs' ?
          <Grid item>
            <DateField
              classes={classes}
              value={fromDate}
              onChange={handleFromDateChange}
              placeholder={t('mms.locFromDateResource1.Text')}
              toolbarDisabled={false}
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
              toolbarDisabled={false}
            />
          </Grid>
          : null}

        <Grid item>
          <Button
            onClick={handleSearch}
            className={clsx(classes.btn, classes.btnRounded, classes.searchButton)}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}>
            {t('mms.locSearchCampaignResource1.Text')}
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
    return (
      <Grid container spacing={2} className={classes.linePadding} >
        {windowSize !== 'xs' && <Grid item>
          <Button
            href={`/Pulseem/CreateAutomations.aspx?fromreact=true&Culture=${isRTL ? 'he-IL' : 'en-US'}`}
            className={clsx(classes.btn, classes.btnRounded, classes.searchButton)}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}>
            {t('automations.createResource.Text')}
          </Button>
        </Grid>}
        {windowSize !== 'xs' && <Grid item>
          <Button
            className={clsx(classes.btn, classes.btnRounded, classes.searchButton)}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
            onClick={() => setDialogType({
              type: 'restore',
              data: automationsDeletedData
            })}>
            {t('automations.restoreResource.Text')}
          </Button>
        </Grid>}
        <Grid item className={classes.groupsLableContainer} >
          <Typography className={classes.groupsLable}>
            {`${isSearching ? searchResults.length : automationsData.length} ${t('automations.Automations')}`}
          </Typography>
        </Grid>
      </Grid>
    )
  }

  const renderTableHead = () => {
    return (
      <TableHead>
        <TableRow classes={rowStyle}>
          <TableCell classes={cellStyle} className={classes.flex3} align='center'>{t("automations.labelAutomationName")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("campaigns.recipients")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("automations.DaysActive")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("campaigns.lblCampaignStatusResource1.Text")}</TableCell>
          <TableCell classes={{ root: classes.tableCellRoot }} className={classes.flex5} ></TableCell>
        </TableRow>
      </TableHead>
    )
  }

  const renderCellIcons = (row) => {
    const { ID, IsActive } = row

    const iconsMap = [
      {
        key: 'preview',
        uIcon: PreviewIcon,
        lable: t('campaigns.Image1Resource1.ToolTip'),
        remove: windowSize === 'xs',
        rootClass: classes.paddingIcon,
        onClick: () => {
          pulseemNewTab(`CreateAutomations.aspx?Mode=show&AutomationID=${ID}&Culture=${isRTL ? 'he-IL' : 'en-US'}`)
        }
      },
      {
        key: 'edit',
        uIcon: EditIcon,
        lable: t('campaigns.Image2Resource1.ToolTip'),
        remove: windowSize === 'xs',
        href: !IsActive ? `/Pulseem/CreateAutomations.aspx?AutomationID=${ID}&fromreact=true&Culture=${isRTL ? 'he-IL' : 'en-US'}` : '',
        rootClass: classes.paddingIcon,
        onClick: () => {
          if (IsActive) {
            setDialogType({
              type: 'editActive',
              data: row
            })
          }
        }
      },
      //{
      //  key: 'duplicate',
      //  uIcon: DuplicateIcon,
      //  lable: t('campaigns.lnkEditResource1.ToolTip'),
      //  rootClass: classes.paddingIcon,
      //  onClick: () => {
      //    setDialogType({
      //      type: 'duplicate',
      //      data: ID
      //    })
      //  }
      //},
      {
        key: 'reports',
        uIcon: ReportsIcon,
        lable: t('campaigns.Reports'),
        remove: windowSize === 'xs',
        href: `/Pulseem/automationreport.aspx?AutomationID=${ID}&fromreact=true`,
        rootClass: classes.paddingIcon,
      },
      {
        key: 'delete',
        uIcon: DeleteIcon,
        lable: t('campaigns.DeleteResource1.HeaderText'),
        showPhone: true,
        rootClass: classes.paddingIcon,
        onClick: () => {
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
        direction={'row'}
        justifyContent={windowSize === 'xs' ? 'flex-start' : 'flex-end'}>
        {iconsMap.map(icon => (
          <Grid
            key={icon.key}
            item
            className={'rowIconContainer'}
          >
            <ManagmentIcon
              classes={classes}
              className={'rowIconContainer'}
              {...icon}
              uIcon={<icon.uIcon width={18} height={20} className={'rowIcon'} />}
            />
          </Grid>
        ))}

      </Grid>
    )
  }

  const renderStatusCell = (row) => {
    const { IsActive } = row
    const statuses = {
      true: t('automations.AutomationActiveStatusText'),
      false: t('automations.AutomatoionInActiveStatusText',)
    }
    return (
      <Box>
        <Switch
          checked={IsActive}
          onChange={() => {
            if (!row.HasNodes) {
              setErrorMessage(`${t('automations.NoNodesFound')}<br/>${t('automations.pressHereToEditAutomation').replace('##', row.ID)}`);
              setDialogType({
                type: 'noNodes',
                data: row
              })
            }
            else {
              setDialogType({
                type: 'switch',
                data: row
              })
            }
          }}
        />

        <Typography
          className={clsx(
            classes.middleText, classes.txtCenter,
            {
              [classes.switchActive]: IsActive,
              [classes.switchInactive]: !IsActive
            }
          )}
        >
          {statuses[IsActive]}
        </Typography>
      </Box>
    )
  }

  const renderRecipientsCell = (recipients = 0) => {

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

  const renderNameCell = (row) => {
    let date = null
    let text = ''
    if (!row.ActivatedOn) {
      date = moment(row.ModifiedDate, dateFormat)
      text = t('common.UpdatedOn')
    } else {
      date = moment(row.ActivatedOn, dateFormat)
      const dateMillis = date.valueOf()
      const currentDateMillis = moment().valueOf()
      text = dateMillis > currentDateMillis ? t('common.ScheduledFor') : t('common.SentOn')
    }

    return (
      <>
        <CustomTooltip
          arrow
          isSimpleTooltip={false}
          classes={classes}
          interactive={true}
          placement={'top'}
          title={<Typography noWrap={false}>{row.Name}</Typography>}
          text={row.Name}
        />
        <Typography
          className={classes.grayTextCell}>
          {`${text} ${date.format(DateFormats.DATE_TIME_24)}`}
        </Typography>
      </>
    )
  }

  const renderDaysActiveCell = (messages = 0) => {
    return (
      <>
        <Typography className={classes.middleText}>
          {messages.toLocaleString()}
        </Typography>
        <Typography className={classes.middleText}>
          {t("automations.days")}
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
          classes={cellStyle}
          align='center'
          className={classes.flex3}>
          {renderNameCell(row)}
        </TableCell>
        <TableCell
          classes={cellStyle}
          align='center'
          className={classes.flex1}>
          {renderRecipientsCell(row.Recipients)}
        </TableCell>
        <TableCell
          classes={cellStyle}
          align='center'
          className={classes.flex1}>
          {renderDaysActiveCell(row.activeDaysCount)}
        </TableCell>
        <TableCell
          classes={cellStyle}
          align='center'
          className={classes.flex1}>
          {renderStatusCell(row)}
        </TableCell>
        <TableCell
          component="th"
          scope="row"
          classes={{ root: classes.tableCellRoot }}
          className={classes.flex5}>
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
        <TableCell style={{ flex: 1 }} classes={{ root: clsx(classes.tableCellRoot, classes.tabelCellPadding) }}>
          <Box className={classes.inlineGrid}>
            {renderNameCell(row)}
          </Box>
          <Grid container justifyContent={'space-between'}>
            <Grid item container className={classes.widthUnset}>
              <Grid item className={clsx(classes.flexColumn2, classes.txtCenter, classes.pt14)}>
                {renderRecipientsCell(row.Recipients)}
              </Grid>
              <Grid item className={clsx(classes.flexColumn2, classes.txtCenter, classes.pt14)}>
                {renderDaysActiveCell(row.activeDaysCount)}
              </Grid>

            </Grid>
            <Grid item style={{ display: 'flex', alignItems: 'center' }}>
              {renderStatusCell(row)}
              {renderCellIcons(row)}
            </Grid>
          </Grid>
        </TableCell>
      </TableRow>
    )
  }

  const renderTableBody = () => {

    let rowData = searchResults || automationsData;
    let rpp = parseInt(rowsPerPage)
    rowData = rowData.slice((page - 1) * rpp, (page - 1) * rpp + rpp)
    return (
      <Box className='tableBodyContainer'>
        <TableBody>
          {rowData
            .map(windowSize === 'xs' ? renderPhoneRow : renderRow)}
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

  const renderTablePadington = () => {
    const handleRowsPerPageChange = (val) => {
      dispatch(setRowsPerPage(val))
    }
    return (
      <TablePagination
        classes={classes}
        rows={isSearching ? searchResults.length : automationsData.length}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={rowsOptions}
        page={page}
        onPageChange={setPage}
      />
    )
  }
  const handleClose = () => {
    setDialogType(null)
  }

  const handleChange = (ID) => () => {
    const found = restoreArray.indexOf(ID) > -1;

    if (found) {
      setRestoreArray(restoreArray.filter(restore => restore !== ID))
    } else {
      setRestoreArray([...restoreArray, ID])
    }
  }

  const handleActiveChange = (data, isEdit = false) => async () => {
    try {
      const response = await dispatch(activateAutomation({ ID: data.ID }))
      const resJ = JSON.parse(response.payload.d);
      if (resJ.StatusCode !== 1) {
        setErrorMessage(`${resJ.StatusMessage} <br/>${t('automations.pressHereToEditAutomation').replace('##', data.ID)}`);
        setDialogType({
          type: 'activateError',
          data: data
        })
        return;
      }

      getData()
      if (isEdit)
        Redirect({ url: `/Pulseem/CreateAutomations.aspx?AutomationID=${data.ID}&fromreact=true`, openNewTab: true })
    } catch (err) {
      setDialogType({
        type: "statusError",
        data: data.ID
      })
      dispatch(sendToTeamChannel({
        MethodName: 'handleActiveChange',
        ComponentName: 'AutomationsManagement.js',
        Text: err
      }));
    }
    handleClose()
  }

  const getRestorDialog = (data = []) => {
    if (!data || !Array.isArray(data)) return null
    return {
      title: t('automations.restoreCampaignTitle'),
      showDivider: false,
      icon: (
        <div className={classes.dialogIconContent}>
          {'\uE185'}
        </div>
      ),
      content: (
        <RestorDialogContent
          title={'common.noAutomationsToRestore'}
          classes={classes}
          data={data}
          currentChecked={restoreArray}
          onChange={handleChange}
        />
      ),
      onConfirm: async () => {
        handleClose()
        await dispatch(restoreAutomations(restoreArray))
        setRestoreArray([])
        getData()
      }
    }
  }

  const getEditActiveDialog = (data = {}) => ({
    title: t('automations.HeaderDeactivateAutomationProcess'),
    showDivider: false,
    content: (
      <Typography className={clsx(
        classes.boxDialog,
        classes.dialogErrorText
      )}>
        {t('automations.TextDeactivateAutomationProcess')}
      </Typography>
    ),
    onConfirm: handleActiveChange(data, true)
  })

  const getSwitchDialog = (data = {}) => {
    const switchOptions = {
      true: {
        title: t('automations.HeaderDeactivateAutomationProcess'),
        content: (
          <Typography>
            {t('automations.TextDeactivateAutomationProcess')}
          </Typography>
        )
      },
      false: {
        title: t('automations.HeaderActivateAutomationProcess'),
        content: (
          <Typography>
            {t('automations.TextActivateAutomationProcess')}
          </Typography>
        )
      }
    }

    const switchContent = switchOptions[data.IsActive] || {}

    return {
      title: switchContent.title,
      showDivider: false,
      content: switchContent.content,
      onConfirm: handleActiveChange(data)
    }
  }

  const getStatusErrorDioalog = () => ({
    title: t('automations.errorTitle'),
    showDivider: false,
    content: (
      <Box className={classes.boxDialog}>
        <Typography className={classes.dialogErrorText}>
          {t('automations.errorContent')}
        </Typography>
        <Grid container spacing={1}>
          <Grid item>
            <Typography className={classes.dialogErrorText}>
              {t('automations.click')}
            </Typography>
          </Grid>
          <Grid item>
            <Link className={classes.dialogErrorText}>
              {` ${t('automations.here')} `}
            </Link>
          </Grid>
          <Grid item>
            <Typography className={classes.dialogErrorText}>
              {t('automations.edit')}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    ),
    renderButtons: () => (
      <Button
        variant='contained'
        size='small'
        onClick={handleClose}
        className={clsx(
          classes.middle,
          classes.dialogButton,
          classes.dialogCancelButton
        )}>
        {t('automations.close')}
      </Button>
    )
  })

  const getDeleteDialog = (data = '') => ({
    title: t('automations.GridButtonColumnResource2.ConfirmTitle'),
    showDivider: false,
    content: (
      <Typography style={{ fontSize: 18 }}>
        {t('automations.GridButtonColumnResource2.ConfirmText')}
      </Typography>
    ),
    onConfirm: async () => {
      clearSearch()
      handleClose()
      await dispatch(deleteAutomations(data))
      getData()
    }
  })

  const getDuplicateDialog = (data = '') => ({
    title: t('automations.duplicateTitle'),
    showDivider: false,
    content: (
      <Typography style={{ fontSize: 18 }}>
        {t('automations.duplicateContent')}
      </Typography>
    ),
    onConfirm: async () => {
      clearSearch()
      handleClose()
      setPage(1)
      await dispatch(duplicateAutomations(data))
      getData()
    }
  })

  const renderErrorNotice = () => {
    function createMarkup() {
      return { __html: errorMessage };
    }
    return (
      <label dangerouslySetInnerHTML={createMarkup()}></label>
    );
  }

  const showErrorDialog = (data) => ({
    title: t('automations.errorTitle'),
    showDivider: false,
    content: (
      <Typography style={{ fontSize: 18 }}>
        {renderErrorNotice()}
      </Typography>
    ),
    onConfirm: async () => {
      window.open(`/pulseem/CreateAutomations.aspx?AutomationID=${data.ID}`, '_blank');
      handleClose();
    }
  })

  const renderDialog = () => {

    const { data, type } = dialogType || {}

    const dialogContent = {
      restore: getRestorDialog(data),
      editActive: getEditActiveDialog(data),
      switch: getSwitchDialog(data),
      statusError: getStatusErrorDioalog(data),
      delete: getDeleteDialog(data),
      duplicate: getDuplicateDialog(data),
      noNodes: showErrorDialog(data),
      activateError: showErrorDialog(data)
    }

    const currentDialog = dialogContent[type] || {}
    return (
      dialogType && <BaseDialog
        classes={classes}
        open={dialogType}
        onClose={handleClose}
        onCancel={handleClose}
        {...currentDialog}>
        {currentDialog.content}
      </BaseDialog>
    )
  }
  return (
    <DefaultScreen
      currentPage='automations'
      classes={classes}
      containerClass={clsx(classes.management, classes.mb50)}>
      <Box className={'topSection'}>
        <Title Text={t('automations.logPageHeaderResource1.Text')} classes={classes} />
        {renderSearchLine()}
      </Box>
      {renderManagmentLine()}
      {renderTable()}
      {renderTablePadington()}
      {renderDialog()}
      <Loader isOpen={showLoader} />
    </DefaultScreen>
  )
}

export default AutomationsManagnentScreen