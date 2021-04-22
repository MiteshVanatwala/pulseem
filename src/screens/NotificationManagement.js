import React,{useState,useEffect} from 'react';
import DefaultScreen from './DefaultScreen'
import clsx from 'clsx';
import {
  Typography,Divider,Table,TableBody,TableRow,TableHead,TableCell,TableContainer,
  Grid,Button,TextField,IconButton,InputAdornment,Input,Box,FormControlLabel,Checkbox, Select, MenuItem
} from '@material-ui/core'
import {
  DeleteIcon,DuplicateIcon,EditIcon,SendGreenIcon,SearchIcon,
  GroupsIcon,PreviewIcon
} from '../assets/images/managment/index'
import {
  TablePagination,ManagmentIcon,DateField,Dialog,PopMassage
} from '../components/managment/index'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import {getNewslatterData} from '../redux/reducers/apiSlice'
import {useHistory} from "react-router-dom";
//import {history} from '../helpers/history'
import {useSelector,useDispatch} from 'react-redux'
import {useTranslation} from 'react-i18next'
import Ellipsis from 'react-ellipsis-pjs';
import ClearIcon from '@material-ui/icons/Clear'
import instence from '../helpers/api'
import moment from 'moment'
import 'moment/locale/he'

const NotificationManagement=({classes}) => {
  const {language,windowSize}=useSelector(state => state.core)
  console.log(`windowSize`, windowSize)
  const {notificationData,notificationDataError,notificationDeletedData}=useSelector(state => state.api)
  const {t}=useTranslation()
  const [fromDate,handleFromDate]=useState(null);
  const [toDate,handleToDate]=useState(null)
  const [notificationNameSearch,setNotificationNameSearch]=useState('');
  const [statusSearch, setStatusSearch] = useState('');
  const rowsOptions=[6,12,18]
  const [rowsPerPage,setRowsPerPage]=useState(rowsOptions[0])
  const [page,setPage]=useState(1)
  const [searchArray,setSearchArray]=useState(null)
  const [dialogType,setDialogType]=useState(null)
  const [showCopied,setShowCopied]=useState(null)
  const [restoreArray,setRestoreArray]=useState([]);
  const history=useHistory()
  const dateFormat='YYYY-MM-DD HH:mm:ss.FFF'
  const dispatch=useDispatch()
  const rowStyle={head: classes.tableRowHead,root: classes.tableRowRoot}
  const cellStyle={head: classes.tableCellHead, root: clsx(classes.tableCellRoot, classes.paddingHead)}
  const cell50wStyle={head: clsx(classes.tableCellHead), root: clsx(classes.tableCellRoot, classes.paddingHead)}
  const cellBodyStyle={body: clsx(classes.tableCellBody), root: clsx(classes.tableCellRoot, classes.paddingRightLeft10)}
  const noBorderCellStyle={body: classes.tableCellBodyNoBorder, root: clsx(classes.tableCellRoot, classes.paddingRightLeft10)}
  const borderCellStyle={body: clsx(classes.tableCellBody), root: clsx(classes.tableCellRoot, classes.paddingRightLeft10)}
  moment.locale(language)

  const dummyNotificationData = [
    {
      id: Math.random(3453*5),
      name: "Experience 2 - Mailing Doge Carmela A name longer than a line",
      lastUpdate:  new Date(),
      sendDate:  new Date(),
      toSent: 19999,
      sent: 19999,
      errors: 19999,
      clicks: 7,
      status: 1
    },
    {
      id: Math.random(3453*5),
      name: "Active Customers",
      lastUpdate:  new Date(),
      sendDate:  new Date(),
      toSent: 19999,
      sent: 19999,
      errors: 19999,
      clicks: 7,
      status: 2
    },
    {
      id: Math.random(3453*5),
      name: "Active Customers",
      lastUpdate:  new Date(),
      sendDate:  new Date(),
      toSent: 19999,
      sent: 19999,
      errors: 19999,
      clicks: 7,
      status: 1
    },
    {
      id: Math.random(3453*5),
      name: "Active Customers",
      lastUpdate:  new Date(),
      sendDate:  new Date(),
      toSent: 999,
      sent: 999,
      errors: 999,
      clicks: 7,
      status: 3
    },
    {
      id: Math.random(3453*5),
      name: "Active Customers",
      lastUpdate:  new Date(),
      sendDate:  new Date(),
      toSent: 999,
      sent: 999,
      errors: 999,
      clicks: 7,
      status: 4
    },
    {
      id: Math.random(3453*5),
      name: "Active Customers",
      lastUpdate:  new Date(),
      sendDate:  new Date(),
      toSent: 999,
      sent: 999,
      errors: 999,
      clicks: 7,
      status: 5
    },
    {
      id: Math.random(3453*5),
      name: "Active Customers",
      lastUpdate:  new Date(),
      sendDate:  new Date(),
      toSent: 999,
      sent: 999,
      errors: 999,
      clicks: 7,
      status: 6
    },
    {
      id: Math.random(3453*5),
      name: "Active Customers",
      lastUpdate:  new Date(),
      sendDate:  new Date(),
      toSent: 999,
      sent: 999,
      errors: 999,
      clicks: 7,
      status: 7
    },
  ]
  const getData=() => {
    dispatch(getNewslatterData())
  }

  useEffect(getData,[dispatch])

  const renderHeader=() => {
    return (
      <>
        <Typography className={classes.managementTitle}>
          {t('notifications.notificationManagement')}
        </Typography>
        <Divider />
      </>
    )
  }

  const renderSearchSection=() => {
    const handleSearch=() => {
      setSearchArray([{
        type: 'name',
        notificationName: notificationNameSearch
      },{
        type: 'date',
        fromDate,
        toDate
      }])
    }

    const clearSearch=() => {
      setNotificationNameSearch('')
      setStatusSearch('')
      handleFromDate(null)
      handleToDate(null)
      setSearchArray(null)
    }

    const handleNotificationNameChange=event => {
      setNotificationNameSearch(event.target.value)
    }

    const handleStatusChange=event => {
      setStatusSearch(event.target.value)
    }

    if(windowSize==='xs') {
      return (
        <Input
          classes={{
            underline: classes.phoneSearchBar
          }}
          value={notificationNameSearch}
          onChange={handleNotificationNameChange}
          placeholder={t('notifications.searchSection.notificationName')}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                onClick={handleSearch}
                className={classes.phoneSearchBarIcon}>
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          }>
        </Input>
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
            className={classes.textField}
            placeholder={t('notifications.searchSection.notificationName')}
          />
        </Grid>
        <Grid item>
          <Select
            variant='outlined'
            size='small'
            onChange={handleStatusChange}
            className={classes.selectField}
            value={0}
          >
            <MenuItem value={0} disabled>{t('notifications.status.text')}</MenuItem>
            <MenuItem value={1}>{t('notifications.status.created')}</MenuItem>
            <MenuItem value={2}>{t('notifications.status.sending')}</MenuItem>
            <MenuItem value={3}>{t('notifications.status.stopped')}</MenuItem>
            <MenuItem value={4}>{t('notifications.status.sent')}</MenuItem>
            <MenuItem value={5}>{t('notifications.status.cancelled')}</MenuItem>
            <MenuItem value={6}>{t('notifications.status.approved')}</MenuItem>
          </Select>
        </Grid>

        <Grid item>
          <DateField
            classes={classes}
            value={fromDate}
            onChange={handleFromDate}
            placeholder={t('notifications.searchSection.fromDate')}
          />
        </Grid>

        <Grid item>
          <DateField
            classes={classes}
            value={toDate}
            onChange={handleToDate}
            placeholder={t('notifications.searchSection.toDate')}
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
        {searchArray&&<Grid item>
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
            onClick={() => history.push('#')}
            className={clsx(
              classes.actionButton,
              classes.actionButtonLightGreen
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
              classes.actionButtonLightBlue
            )}
            onClick={() => setDialogType({
              type: 'restore',
              data: dummyNotificationData
            })}>
            {t('notifications.buttons.recover')}
          </Button>
        </Grid>}
        <Grid item>
          <Button
            variant='contained'
            size='medium'
            className={clsx(
              classes.actionButton,
              classes.actionButtonLightBlue
            )}
            onClick={() => setDialogType({
              type: 'restore',
              data: dummyNotificationData
            })}>
            {t('notifications.buttons.implementScript')}
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant='contained'
            size='medium'
            className={clsx(
              classes.actionButton,
              classes.actionButtonLightBlue
            )}
            onClick={() => setDialogType({
              type: 'restore',
              data: dummyNotificationData
            })}>
            {t('notifications.buttons.groups')}
          </Button>
        </Grid>
        <Grid item className={classes.groupsLableContainer} >
          <Typography className={classes.groupsLable}>
            {`${dummyNotificationData.length} ${t('notifications.notifications')}`}
          </Typography>
        </Grid>
      </Grid>
    )
  }

  const renderTableHead=() => {
    return (
      <TableHead>
        <TableRow classes={rowStyle}>
          <TableCell classes={cellStyle} className={classes.flex5} align='center'>{t("notifications.notificationManagement")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center'>{t("notifications.tblHeader.toSend")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center'>{t("notifications.tblHeader.sent")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex1} align='center'>{t("notifications.tblHeader.failed")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("notifications.tblHeader.clicks")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("notifications.tblHeader.status")}</TableCell>
          <TableCell classes={{root: classes.tableCellRoot}} className={classes.flex12} ></TableCell>
        </TableRow>
      </TableHead>
    )
  }

  const renderCellIcons=(row) => {
    const {status,groups,id,shareUrl}=row

    const renderCopyToClipoard=(
      <PopMassage
        classes={classes}
        show={showCopied===id}
        timeout={500}
        label={t('common.copyClip')}
      />
    )

    const iconsMap=[[
      {
        key: 'send',
        icon: SendGreenIcon,
        lable: t('notifications.buttons.send'),
        remove: status!==1,
        rootClass: classes.sendIcon,
        textClass: classes.sendIconText,
        onClick: () => {
          history.push('/SendCampaign/'+id)
        }
      },
      {
        key: 'preview',
        icon: PreviewIcon,
        remove: windowSize==='xs',
        lable: t('notifications.buttons.preview'),
        onClick: () => {
          history.push('/PreviewCampaign/'+id)
        }
      },
      {
        key: 'edit',
        icon: EditIcon,
        remove: windowSize==='xs',
        disable: status!==1,
        lable: t('notifications.buttons.edit'),
        onClick: () => {
          history.push('/Editor/CampaignEdit/'+id)
        }
      },
      {
        key: 'duplicate',
        icon: DuplicateIcon,
        lable: t('notifications.buttons.duplicate'),
        onClick: () => {
          setDialogType({
            type: 'duplicate',
            data: id
          })
        }
      },
      {
        key: 'groups',
        icon: GroupsIcon,
        remove: windowSize==='xs',
        disable: groups&&groups.length===0,
        lable: t('notifications.buttons.groups'),
        onClick: () => {
          setDialogType({
            type: 'groups',
            data: row.groups
          })
        }
      },
      {
        key: 'delete',
        icon: DeleteIcon,
        lable: t('notifications.buttons.delete'),
        showPhone: true,
        onClick: () => {
          setDialogType({
            type: 'delete',
            data: row
          })
        }
      }
    ]]
    return (
      <Grid
        container
        direction={windowSize==='sm'? 'column':'row'}
        justify={windowSize==='xs'? 'flex-start':'flex-end'}>
        {iconsMap.map((map,index) => (
          <Grid
            key={index}
            item>
            <Grid
              container>
              {map.map(icon => (
                <Grid
                  key={icon.key}
                  item >
                  <ManagmentIcon
                    classes={classes}
                    {...icon}
                  />
                  {icon.key==='copy'&&renderCopyToClipoard}
                </Grid>
              ))}
            </Grid>
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
          classes.wrapText,
          classes.recipientsStatus,
          {
            [classes.recipientsStatusCreated]: status===1,
            [classes.recipientsStatusSent]: status===4,
            [classes.recipientsStatusStopped]: status===3,
            [classes.recipientsStatusSending]: status===2,
            [classes.recipientsStatusCanceled]: status===5
          }
        )}>
          {t(statuses[status])}
        </Typography>
      </>
    )
  }

  const renderTotalCell = (value, type) => {
    return (
      <div>
        <Typography className={clsx(classes.middleText, type === "error" && classes.errorText)}>
          {value.toLocaleString()}
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
        <Typography className={clsx(classes.middleText, type === "error" && classes.errorText)}>
          {value.toLocaleString()}
        </Typography>
        <Typography className={clsx(classes.middleText, type === "error" && classes.errorText)}>
          {t("notifications.tblBody.clicks")}
        </Typography>
      </>
    )
  }

  const renderNameCell=(row) => {
    let date=null
    let text=''
    if(!row.sendDate) {
      date=moment(row.lastUpdate,dateFormat)
      text=t('common.UpdatedOn')
    } else {
      date=moment(row.sendDate,dateFormat)
      const dateMillis=date.valueOf()
      const currentDateMillis=moment().valueOf()
      text=dateMillis>currentDateMillis? t('common.WillBeSentOn'):t('common.SentOn')
    }

    return (
      <>
        <Ellipsis
          text={row.name}
          lines={1}
          style={{
            fontSize: 17,
            fontWeight: 700,
            marginBottom: '0.5rem',
            color: '#333333',
            fontFamily: 'Assistant'
          }}
        />
        <Typography style={{'WebkitLineClamp': 1}}>
          {`${text} ${date.format('L')} ${date.format('LT')}`}
        </Typography>
      </>
    )
  }

  const renderRow=(row) => {
    return (
      <TableRow
        key={row.id}
        classes={rowStyle}>
        <TableCell
          classes={cellBodyStyle}
          align='center'
          className={classes.flex5}>
          {renderNameCell(row)}
        </TableCell>
        <TableCell
          classes={noBorderCellStyle}
          align='center'
          className={classes.flex1}>
          {renderTotalCell(row.toSent)}
        </TableCell>
        <TableCell
          classes={noBorderCellStyle}
          align='center'
          className={classes.flex1}>
          {renderTotalCell(row.sent)}
        </TableCell>
        <TableCell
          classes={borderCellStyle}
          align='center'
          className={classes.flex1}>
          {renderTotalCell(row.errors, "error")}
        </TableCell>
        <TableCell
          classes={cellBodyStyle}
          align='center'
          className={classes.flex1}>
          {renderClickCell(row.clicks)}
        </TableCell>
        <TableCell
          classes={cellBodyStyle}
          align='center'
          className={classes.flex1}>
          {renderStatusCell(row.status)}
        </TableCell>
        <TableCell
          component="th"
          scope="row"
          classes={{root: clsx(classes.tableCellRoot, classes.paddingRightLeft10)}}
          className={classes.flex12}>
          {renderCellIcons(row)}

        </TableCell>
      </TableRow>
    )
  }

  const renderPhoneRow=(row) => {
    return (
      <TableRow
        key={row.CampaignID}
        component='div'
        classes={rowStyle}>
        <TableCell style={{flex: 1}} classes={{root: classes.tableCellRoot}}>
          <Grid container justify='space-between'>
            <Grid item>
              {renderNameCell(row)}
            </Grid>
            <Grid item>
              {renderStatusCell(row.status)}
            </Grid>
          </Grid>
          {renderCellIcons(row)}
        </TableCell>
      </TableRow>
    )
  }

  const renderTableBody=() => {
    const filtersObject={
      name: (row,values) => {
        return row.Name.includes(values.notificationName)
      },
      date: (row,values) => {
        const {UpdatedDate,SendDate}=row
        const lastUpdate=SendDate?
          moment(SendDate,dateFormat).valueOf()
          :moment(UpdatedDate,dateFormat).valueOf()
        if(fromDate&&toDate)
          return ((lastUpdate>=values.fromDate.valueOf())&&(lastUpdate<=values.toDate.valueOf()))
        if(fromDate)
          return lastUpdate>=values.fromDate.valueOf()
        if(toDate)
          return lastUpdate<=values.toDate.valueOf()
        return true
      }
    }

    let sortData=dummyNotificationData;
    if(searchArray) {
      searchArray.forEach(values => {
        sortData=sortData.filter(row => filtersObject[values.type](row,values))
      })
    }
    
    sortData=sortData.slice((page-1)*rowsPerPage,(page-1)*rowsPerPage+rowsPerPage)
    return (
      <TableBody>
        {sortData
          .map(windowSize==='xs'? renderPhoneRow:renderRow)}
      </TableBody>
    )
  }

  const renderTable=() => {
    return (
      <TableContainer>
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
        rows={dummyNotificationData.length}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={setRowsPerPage}
        rowsPerPageOptions={rowsOptions}
        page={page}
        onPageChange={setPage}
      />
    )
  }

  const renderDialog=() => {

    const handleChange=(CampaignID) => () => {
      const found=restoreArray.includes(CampaignID)
      console.log('restore',CampaignID,'found:',found)
      if(found) {
        setRestoreArray(restoreArray.filter(restore => restore!==CampaignID))
      } else {
        setRestoreArray([...restoreArray,CampaignID])
      }
    }

    const handleClose=() => {
      setDialogType(null)
    }

    const dialogContent={
      restore: {
        title: t('campaigns.restoreCampaginTitle'),
        showDivider: false,
        icon: (
          <div className={classes.dialogIconContent}>
            {'\uE185'}
          </div>
        ),
        content: (
          <Box
            className={classes.restorDialogContent}>
            {dialogType&&dialogType.type==='restore'&&dialogType.data
              .map(row => {
                const checked=restoreArray.includes(row.CampaignID)
                return (
                  <FormControlLabel
                    key={row.CampaignID}
                    className={classes.restoreDialogCheckBoxLable}
                    control={
                      <Checkbox
                        checked={checked}
                        onChange={handleChange(row.CampaignID)}
                        className={classes.restoreDialogCheckBox}
                        color='primary'
                        size='small'
                      />
                    }
                    label={row.Name}
                  />
                )
              })}
          </Box>
        ),
        onConfirm: () => {
          instence.put('email/restoreEmailCampaigns',
            restoreArray)
            .then(res => {
              console.log("duplicate res",res)
              getData()
            })
            .catch(err => console.log('duplicate Error',err))
          handleClose()
        }
      },
      groups: {
        title: t('campaigns.ShowGroupsTitle'),
        showDivider: false,
        icon: (
          <div className={classes.dialogIconContent}>
            {'\uE185'}
          </div>
        ),
        content: (
          <Box
            className={classes.gruopsDialogContent}>
            {dialogType&&dialogType.type==='groups'&&dialogType.data
              .map(group => {
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
      },
      delete: {
        title: t('campaigns.GridButtonColumnResource2.ConfirmTitle'),
        showDivider: false,
        icon: (
          <Box className={classes.dialogAlertIcon}>
            !
          </Box>
        ),
        content: (
          <Typography style={{fontSize: 18}}>
            {t('campaigns.GridButtonColumnResource2.ConfirmText')}
          </Typography>
        ),
        onConfirm: async () => {
          instence
            .delete(`email/deleteEmailCampaign/${dialogType.data.CampaignID}`)
            .then(res => {
              console.log("Delete res",res)
              getData()
            })
            .catch(err => console.log('delete Error',err))
          handleClose()
        }
      },
      duplicate: {
        title: t('campaigns.dialogDuplicateTitle'),
        showDivider: false,
        icon: (
          <Box className={classes.dialogAlertIcon}>
            !
          </Box>
        ),
        content: (
          <Typography style={{fontSize: 18}}>
            {t('campaigns.dialogDuplicateContent')}
          </Typography>
        ),
        onConfirm: () => {
          instence
            .put(`email/cloneCampaign/${dialogType.data}`)
            .then(res => {
              console.log("duplicate res",res)
              getData()
            })
            .catch(err => console.log('duplicate Error',err))
          handleClose()
        }
      }
    }

    const currentDialog=(dialogType&&dialogContent[dialogType.type])||{}
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
      currentPage='newsletter'
      classes={classes}>
      {renderHeader()}
      {renderSearchSection()}
      {renderManagmentLine()}
      {renderTable()}
      {renderTablePagination()}
      {renderDialog()}
    </DefaultScreen>
  )
}

export default NotificationManagement