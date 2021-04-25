import React,{useState,useEffect} from 'react';
import DefaultScreen from './DefaultScreen'
import clsx from 'clsx';
import {
  Typography,Divider,Table,TableBody,TableRow,TableHead,TableCell,TableContainer,
  Grid,Button,TextField,Box
} from '@material-ui/core'
import {
  AutomationIcon,DeleteIcon,DuplicateIcon,EditIcon,SendGreenIcon,SearchIcon,
  GroupsIcon,PreviewIcon,ReportsIcon,CopyIcon
} from '../assets/images/managment/index'
import {
  TablePadington,ManagmentIcon,DateField,Dialog,PopMassage,SearchField,RestorDialogContent
} from '../components/managment/index'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import {getNewslatterData} from '../redux/reducers/newsletterSlice'
import {useHistory} from "react-router-dom";
import {useSelector,useDispatch} from 'react-redux'
import {useTranslation} from 'react-i18next'
import Ellipsis from 'react-ellipsis-pjs';
import ClearIcon from '@material-ui/icons/Clear'
import instence from '../helpers/api'
import moment from 'moment'
import 'moment/locale/he'

const NewsletterManagnentScreen=({classes}) => {
  const {language,windowSize}=useSelector(state => state.core)
  const {newslettersData,newslettersDataError,newslettersDeletedData}=useSelector(state => state.newsletter)
  const {t}=useTranslation()
  const [fromDate,handleFromDate]=useState(null);
  const [toDate,handleToDate]=useState(null)
  const [campaineNameSearch,setCampaineNameSearch]=useState('')
  const rowsOptions=[6,12,18]
  const [rowsPerPage,setRowsPerPage]=useState(rowsOptions[0])
  const [page,setPage]=useState(1)
  const [searchArray,setSearchArray]=useState(null)
  const rowStyle={head: classes.tableRowHead,root: classes.tableRowRoot}
  const cellStyle={head: classes.tableCellHead,body: classes.tableCellBody,root: classes.tableCellRoot}
  const [dialogType,setDialogType]=useState(null)
  const [showCopied,setShowCopied]=useState(null)
  const [restoreArray,setRestoreArray]=useState([])
  const dateFormat='YYYY-MM-DD HH:mm:ss.FFF'
  const history=useHistory()
  const dispatch=useDispatch()
  moment.locale(language)

  const getData=() => {
    dispatch(getNewslatterData())
  }

  useEffect(getData,[dispatch])

  const renderHeader=() => {
    return (
      <>
        <Typography className={classes.managementTitle}>
          {t('campaigns.logPageHeaderResource1.Text')}
        </Typography>
        <Divider />
      </>
    )
  }

  const renderSearchLine=() => {
    const handleSearch=() => {
      setSearchArray([{
        type: 'name',
        campaineName: campaineNameSearch
      },{
        type: 'date',
        fromDate,
        toDate
      }])
    }

    const clearSearch=() => {
      setCampaineNameSearch('')
      handleFromDate(null)
      handleToDate(null)
      setSearchArray(null)
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
          placeholder={t('campaigns.campaginName')}
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
            onChange={handleCampainNameChange}
            className={classes.textField}
            placeholder={t('campaigns.campaginName')}
          />
        </Grid>

        <Grid item>
          <DateField
            classes={classes}
            value={fromDate}
            onChange={handleFromDate}
            placeholder={t('campaigns.locFromDateResource1.Text')}
          />
        </Grid>

        <Grid item>
          <DateField
            classes={classes}
            value={toDate}
            onChange={handleToDate}
            placeholder={t('campaigns.locToDateResource1.Text')}
          />
        </Grid>

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
            onClick={() => history.push('CampaignInfo')}
            className={clsx(
              classes.actionButton,
              classes.actionButtonLightGreen
            )}>
            {t('campaigns.create')}
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
              data: newslettersDeletedData
            })}>
            {t('campaigns.restoreDeleted')}
          </Button>
        </Grid>}
        <Grid item className={classes.groupsLableContainer} >
          <Typography className={classes.groupsLable}>
            {`${newslettersData.length} ${t('campaigns.newsletters')}`}
          </Typography>
        </Grid>
      </Grid>
    )
  }

  const renderTableHead=() => {
    return (
      <TableHead>
        <TableRow classes={rowStyle}>
          <TableCell classes={cellStyle} className={classes.flex3} align='center'>{t("campaigns.camapignName")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("campaigns.recipients")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("campaigns.lblCampaignStatusResource1.Text")}</TableCell>
          <TableCell classes={{root: classes.tableCellRoot}} className={classes.flex12} ></TableCell>
        </TableRow>
      </TableHead>
    )
  }

  const renderCellIcons=(row) => {
    const {Status,Groups,AutomationID,CampaignID,shareUrl}=row

    const renderCopyToClipoard=(
      <PopMassage
        classes={classes}
        show={showCopied===CampaignID}
        timeout={500}
        label={t('common.copyClip')}
      />
    )

    const iconsMap=[[
      {
        key: 'send',
        icon: SendGreenIcon,
        lable: t('campaigns.imgSendResource1.ToolTip'),
        remove: Status!==1,
        rootClass: classes.sendIcon,
        textClass: classes.sendIconText,
        onClick: () => {
          history.push('/SendCampaign/'+CampaignID)
        }
      },
      {
        key: 'preview',
        icon: PreviewIcon,
        remove: windowSize==='xs',
        lable: t('campaigns.Image1Resource1.ToolTip'),
        onClick: () => {
          history.push('/PreviewCampaign/'+CampaignID)
        }
      },
      {
        key: 'edit',
        icon: EditIcon,
        remove: windowSize==='xs',
        disable: Status!==1,
        lable: t('campaigns.Image2Resource1.ToolTip'),
        onClick: () => {
          history.push('/Editor/CampaignEdit/'+CampaignID)
        }
      },
      {
        key: 'duplicate',
        icon: DuplicateIcon,
        lable: t('campaigns.lnkEditResource1.ToolTip'),
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
        remove: windowSize==='xs',
        disable: Groups&&Groups.length===0,
        lable: t('campaigns.lnkPreviewResource1.ToolTip'),
        onClick: () => {
          setDialogType({
            type: 'groups',
            data: row.Groups
          })
        }
      },
    ],[
      {
        key: 'copy',
        icon: CopyIcon,
        lable: t('campaigns.CloneResource1.HeaderText'),
        onClick: () => {
          navigator.clipboard.writeText(shareUrl)
          setShowCopied(CampaignID)
          setTimeout(() => {
            setShowCopied(null)
          },1000)
        }
      },
      {
        key: 'reports',
        icon: ReportsIcon,
        disable: Status===1,
        remove: windowSize==='xs',
        lable: t('campaigns.Reports'),
        onClick: () => {
          history.push('/CampaignStatistics/'+CampaignID)
        }
      },
      {
        key: 'automation',
        icon: AutomationIcon,
        remove: windowSize==='xs',
        disable: AutomationID===0,
        lable: t('campaigns.automation'),
        onClick: () => {
          history.push('/CampaignStatistics/'+AutomationID)
        }
      },
      {
        key: 'delete',
        icon: DeleteIcon,
        lable: t('campaigns.DeleteResource1.HeaderText'),
        showPhone: true,
        onClick: () => {
          setDialogType({
            type: 'delete',
            data: row
          })
        }
      },]
    ]
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
    if(recipients===0) return null

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
      date=moment(row.UpdatedDate,dateFormat)
      text=t('common.UpdatedOn')
    } else {
      date=moment(row.SendDate,dateFormat)
      const dateMillis=date.valueOf()
      const currentDateMillis=moment().valueOf()
      text=dateMillis>currentDateMillis? t('common.WillBeSentOn'):t('common.SentOn')
    }

    return (
      <>
        <Ellipsis
          text={row.Name}
          lines={1}
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#333333',
            fontFamily: 'Assistant',
          }}
        />
        <Typography
          className={classes.grayTextCell}>
          {`${text} ${date.format('L')} ${date.format('LT')}`}
        </Typography>
      </>
    )
  }

  const renderRow=(row) => {
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
          classes={{root: classes.tableCellRoot}}
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
              {renderStatusCell(row.Status)}
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
        return row.Name.includes(values.campaineName)
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

    let sortData=newslettersData
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

  const renderTablePadington=() => {
    return (
      <TablePadington
        classes={classes}
        rows={newslettersData.length}
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
      if(found) {
        setRestoreArray(restoreArray.filter(restore => restore!==CampaignID))
      } else {
        setRestoreArray([...restoreArray,CampaignID])
      }

    }

    const handleClose=() => {
      setRestoreArray([])
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
          <RestorDialogContent
            classes={classes}
            data={dialogType&&dialogType.data}
            currentChecked={restoreArray}
            onChange={handleChange}
            dataIdVar='CampaignID'
          />
        ),
        onConfirm: () => {
          instence.put('email/restoreEmailCampaigns',
            restoreArray)
            .then(res => {
              console.log("restore res",res)
              getData()
            })
            .catch(err => console.log('restore Error',err))
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
      {renderSearchLine()}
      {renderManagmentLine()}
      {renderTable()}
      {renderTablePadington()}
      {renderDialog()}
    </DefaultScreen>
  )
}

export default NewsletterManagnentScreen