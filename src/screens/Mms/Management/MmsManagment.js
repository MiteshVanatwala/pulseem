import React,{useState,useEffect} from 'react';
import DefaultScreen from '../../DefaultScreen'
import clsx from 'clsx';
import {
  Typography, Divider, Table, TableBody, TableRow, TableHead, TableCell, TableContainer,
  Grid, Button, TextField, Box, Tooltip
} from '@material-ui/core'
import {
  DeleteIcon,DuplicateIcon,EditIcon,SendGreenIcon,SearchIcon,GroupsIcon,PreviewIcon
} from '../../../assets/images/managment/index'
import {
  TablePagination,ManagmentIcon,DateField,Dialog,SearchField,RestorDialogContent
} from '../../../components/managment/index'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import {getMmsData,restoreMms,deleteMms,duplicteMms,getMMSByID} from '../../../redux/reducers/mmsSlice'
import useCtrlHistory from '../../../helpers/useCtrlHistory'
import {useSelector,useDispatch} from 'react-redux'
import {useTranslation} from 'react-i18next'
import {pulseemNewTab} from '../../../helpers/functions'
import ClearIcon from '@material-ui/icons/Clear'
import moment from 'moment'
import 'moment/locale/he'
import {Preview} from '../../../components/Notifications/Preview/Preview';
import { Loader } from '../../../components/Loader/Loader';
import { setRowsPerPage } from '../../../redux/reducers/coreSlice';
import { setCookie } from '../../../helpers/cookies';

const MmsManagnentScreen = ({ classes }) => {
  const { language, windowSize, rowsPerPage } = useSelector(state => state.core)
  const { mmsData, mmsDataError, mmsDeletedData } = useSelector(state => state.mms)
  const { t } = useTranslation()
  const [fromDate, handleFromDate] = useState(null);
  const [toDate, handleToDate] = useState(null)
  const [campaineNameSearch, setCampaineNameSearch] = useState('')
  const rowsOptions = [6, 10, 20, 50]
  const [page, setPage] = useState(1)
  const [searchResults, setSearchResults] = useState(null)
  const [isSearching, setSearching] = useState(false)
  const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot }
  const cellStyle = { head: classes.tableCellHead, body: classes.tableCellBody, root: classes.tableCellRoot }
  const [dialogType, setDialogType] = useState(null)
  const [restoreArray, setRestoreArray] = useState([])
  const dateFormat = 'YYYY-MM-DD HH:mm:ss.FFF'
  const [showLoader, setLoader] = useState(true);
  const history=useCtrlHistory()
  const dispatch=useDispatch()
  moment.locale(language)

  const getData= async () => {
    await dispatch(getMmsData())
    setLoader(false);
  }

  useEffect(() =>{
    setLoader(true);
    getData();
  },[dispatch])

  const renderHeader=() => {
    return (
      <>
        <Typography className={classes.managementTitle}>
          {t('mms.logPageHeaderResource1.Text')}
        </Typography>
        <Divider />
      </>
    )
  }

  const clearSearch=() => {
    setCampaineNameSearch('')
    handleFromDate(null)
    handleToDate(null)
    setSearchResults(null)
    setSearching(false)
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
      },{
        type: 'date',
        fromDate,
        toDate
      }];

      const filtersObject={
        name: (row,values) => {
          return String(row.Name.toLowerCase()).includes(values.campaineName.toLowerCase());
        },
        date: (row,values) => {
          const {LastUpdate,SendDate}=row
          const lastUpdate=SendDate?
            moment(SendDate,dateFormat).valueOf()
            :moment(LastUpdate,dateFormat).valueOf()
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

      let sortData=mmsData
      searchArray.forEach(values => {
        sortData=sortData.filter(row => filtersObject[values.type](row,values))
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

    const handleCampainNameChange=event => {
      setCampaineNameSearch(event.target.value)
    }

    if(windowSize==='xs') {
      return (
        <SearchField
          classes={classes}
          value={campaineNameSearch}
          onChange={handleCampainNameChange}
          onClick={handleSearch}
          onKeyPress={handleKeyPress}
          placeholder={t('mms.GridBoundColumnResource2.HeaderText')}
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
            className={clsx(classes.textField,classes.minWidth252)}
            placeholder={t('mms.GridBoundColumnResource2.HeaderText')}
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

        <Grid item>
          <Button
            size='large'
            variant='contained'
            onClick={handleSearch}
            className={classes.searchButton}
            endIcon={<SearchIcon />}>
            {t('mms.locSearchCampaignResource1.Text')}
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
    return (
      <Grid container spacing={2} className={classes.linePadding} >
        {windowSize!=='xs'&&<Grid item>
          <Button
            variant='contained'
            size='medium'
            href='/Pulseem/MmsCampaignEdit.aspx?fromreact=true'
            className={clsx(
              classes.actionButton,
              classes.actionButtonLightGreen
            )}>
            {t('mms.create')}
          </Button>
        </Grid>}
        {windowSize!=='xs'&&<Grid item>
          <Button
            variant='contained'
            size='medium'
            className={clsx(
              classes.actionButton,
              classes.actionButtonLightBlue
            )}
            onClick={() => setDialogType({
              type: 'restore',
              data: mmsDeletedData
            })}>
            {t('mms.restoreResource.Text')}
          </Button>
        </Grid>}
        <Grid item xs={windowSize==='xs'&&12} className={classes.groupsLableContainer} >
          <Typography className={classes.groupsLable}>
            {`${isSearching? searchResults.length:mmsData.length} ${t('mms.campaigns')}`}
          </Typography>
        </Grid>
      </Grid>
    )
  }

  const renderTableHead=() => {
    return (
      <TableHead>
        <TableRow classes={rowStyle}>
          <TableCell classes={cellStyle} className={classes.flex3} align='center'>{t("common.CampaignName")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("campaigns.recipients")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("mms.CreditsResource1.HeaderText")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("campaigns.lblCampaignStatusResource1.Text")}</TableCell>
          <TableCell classes={{root: classes.tableCellRoot}} className={classes.flex5} ></TableCell>
        </TableRow>
      </TableHead>
    )
  }

  const renderCellIcons=(row) => {
    const {Status,ID,GroupNames}=row

    const iconsMap=[
      {
        key: 'send',
        icon: SendGreenIcon,
        lable: t('campaigns.imgSendResource1.ToolTip'),
        remove: windowSize === 'xs' || Status !== 1,
        rootClass: classes.sendIcon,
        textClass: classes.sendIconText,
        href: `/Pulseem/SendMmsCampaign.aspx?MmsCampaignID=${ID}&fromreact=true`
      },
      {
        key: 'preview',
        icon: PreviewIcon,
        lable: t('campaigns.Image1Resource1.ToolTip'),
        remove: windowSize==='xs',
        rootClass: classes.paddingIcon,
        onClick: async () => {
          const mms=await dispatch(getMMSByID(ID));
          setDialogType({
            type: 'preview',
            data: mms.payload
          })
        }
      },
      {
        key: 'edit',
        icon: EditIcon,
        disable: Status!==1,
        lable: t('campaigns.Image2Resource1.ToolTip'),
        remove: windowSize==='xs',
        href: `/Pulseem/MmsCampaignEdit.aspx?MmsCampaignID=${ID}&fromreact=true`,
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
            data: ID
          })
        }
      },
      {
        key: 'groups',
        icon: GroupsIcon,
        disable: GroupNames.length===0,
        lable: t('campaigns.lnkPreviewResource1.ToolTip'),
        remove: windowSize==='xs',
        rootClass: classes.paddingIcon,
        onClick: () => {
          setDialogType({
            type: 'groups',
            data: GroupNames
          })
        }
      },
      {
        key: 'delete',
        icon: DeleteIcon,
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
        justify={windowSize==='xs'? 'flex-start':'flex-end'}>
        {iconsMap.map(icon => (
          <Grid
            className={icon.disable&&classes.disabledCursor}
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

  const renderStatusCell=(status) => {
    const statuses={
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
            [classes.recipientsStatusCreated]: status===1,
            [classes.recipientsStatusSent]: status===4,
            [classes.recipientsStatusSending]: status===2,
            [classes.recipientsStatusCanceled]: status===5
          }
        )}>
          {t(statuses[status])}
        </Typography>
      </>
    )
  }

  const renderRecipientsCell=(recipients) => {

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

  const renderNameCell=(row) => {
    let date=null
    let text=''
    if(!row.SendDate) {
      date=moment(row.LastUpdate,dateFormat)
      text=t('common.UpdatedOn')
    } else {
      date=moment(row.SendDate,dateFormat)
      const dateMillis=date.valueOf()
      const currentDateMillis=moment().valueOf()
      text=dateMillis>currentDateMillis? t('common.ScheduledFor'):t('common.SentOn')
    }

    return (
      <>
        <Tooltip
          arrow 
          title={row.Name} 
          placement={'top'} 
          classes={{
            tooltip: clsx(classes.tooltipBlack, classes.tooltipPlacement), 
            arrow: classes.black}}
          >
          <Typography noWrap={false} className={classes.nameEllipsis}>
            {row.Name}
          </Typography>
        </Tooltip>
        <Typography
          className={classes.grayTextCell}>
          {`${text} ${date.format('DD/MM/YYYY')} ${date.format('LT')}`}
        </Typography>
      </>
    )
  }

  const renderMessagesCell=(messages) => {
    return (
      <>
        <Typography className={classes.middleText}>
          {messages.toLocaleString()}
        </Typography>
        <Typography className={classes.middleText}>
          {t("mms.CreditsResource1.HeaderText")}
        </Typography>
      </>
    )
  }

  const renderRow=(row) => {
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
          {renderRecipientsCell(row.SentCount)}
        </TableCell>
        <TableCell
          classes={cellStyle}
          align='center'
          className={classes.flex1}>
          {renderMessagesCell(row.CreditsPerMms)}
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
          classes={{root: classes.tableCellRoot}}
          className={classes.flex5}>
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
        <TableCell style={{flex: 1}} classes={{root: classes.tableCellRoot}}>
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

  const renderTableBody=() => {

    let sortData = isSearching ? searchResults : mmsData;
    let rpp = parseInt(rowsPerPage)
    sortData = sortData.slice((page - 1) * rpp, (page - 1) * rpp + rpp)
    return (
      <TableBody>
        {sortData
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
        rows={isSearching? searchResults.length:mmsData.length}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={rowsOptions}
        page={page}
        onPageChange={setPage}
      />
    )
  }

  const handleChange=(id) => () => {
    const found=restoreArray.includes(id)
    console.log('restore',id,'found:',found)
    if(found) {
      setRestoreArray(restoreArray.filter(restore => restore!==id))
    } else {
      setRestoreArray([...restoreArray,id])
    }
  }

  const handleClose=() => {
    setDialogType(null)
  }

  const getRestoreDialog=(data=[]) => {
    if(!data||!Array.isArray(data)) return null
    return {
      title: t('mms.restoreCampaignTitle'),
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
          dataIdVar='ID'
        />
      ),
      onConfirm: async () => {
        handleClose()
        await dispatch(restoreMms(restoreArray))
        setRestoreArray([])
        getData()
      }
    }
  }

  const getGroupsDialog=(data=[]) => {
    if(!data||!Array.isArray(data)) return null
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
          {data
            .map((group,index) => {
              return (
                <Typography
                  key={index}
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

  const getDeleteDialog=(data='') => ({
    title: t('campaigns.GridButtonColumnResource2.ConfirmTitle'),
    showDivider: false,
    content: (
      <Typography style={{fontSize: 18}}>
        {t('campaigns.GridButtonColumnResource2.ConfirmText')}
      </Typography>
    ),
    onConfirm: async () => {
      clearSearch()
      handleClose()
      await dispatch(deleteMms(data))
      getData()
    }
  })

  const getDuplicateDialog=(data='') => ({
    title: t('campaigns.dialogDuplicateTitle'),
    showDivider: false,
    content: (
      <Typography style={{fontSize: 18}}>
        {t('campaigns.dialogDuplicateContent')}
      </Typography>
    ),
    onConfirm: async () => {
      clearSearch()
      handleClose()
      setPage(1)
      await dispatch(duplicteMms(data))
      getData()
    }
  })

  const getPreviewDialog=(data={}) => {
    return {
      childrenPadding: false,
      contentStyle: classes.pt2rem,
      isMMS: true,
      showDivider: false,
      icon: (
        <div className={classes.dialogIconContent}>
          {'\uE0F8'}
        </div>
      ),
      content: (
        <Box>
          <Preview classes={classes}
            mobileFullsize={true}
            model={data}
            ShowRedirectButton={data.RedirectButtonText&&data.RedirectButtonText!=''}
            showTitle={false}
            showID={true}
            isMMS={true}
          />
        </Box>
      ),
      renderButtons: () => (
        <Button
          variant='contained'
          size='small'
          onClick={handleClose}
          className={clsx(
            classes.confirmButton,
            classes.dialogConfirmButton,
          )}>
          {t('common.confirm')}
        </Button>
      )
    };
  }

  const renderDialog=() => {

    const {data,type}=dialogType||{}

    let currentDialog = null;

    switch (type) {
      case 'restore': {
        currentDialog = getRestoreDialog(data);
        break;
      }
      case 'groups': {
        currentDialog = getGroupsDialog(data);
        break;
      }
      case 'delete': {
        currentDialog = getDeleteDialog(data);
        break;
      }
      case 'duplicate': {
        currentDialog = getDuplicateDialog(data);
        break;
      }
      case 'preview': {
        currentDialog = getPreviewDialog(data);
        break;
      }
    }

    return (
      dialogType&&<Dialog
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
      currentPage='mms'
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

export default MmsManagnentScreen