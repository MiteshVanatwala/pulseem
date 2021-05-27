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
  TablePagination,ManagmentIcon,DateField,Dialog,PopMassage,SearchField,RestorDialogContent
} from '../components/managment/index'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import {
  getNewslatterData,restoreCampaigns,deleteCampaign,duplicteCampaign
} from '../redux/reducers/newsletterSlice'
import useCtrlHistory from '../helpers/useCtrlHistory'
import {useSelector,useDispatch} from 'react-redux'
import {useTranslation} from 'react-i18next'
import ClearIcon from '@material-ui/icons/Clear'
import moment from 'moment'
import 'moment/locale/he'
import { pulseemNewTab } from '../helpers/functions';

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
  const [copyRef,setCopyRef]=useState(null)
  const [restoreArray,setRestoreArray]=useState([])
  const history=useCtrlHistory()
  const dateFormat='YYYY-MM-DD HH:mm:ss.FFF'
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

  const clearSearch=() => {
    setCampaineNameSearch('')
    handleFromDate(null)
    handleToDate(null)
    setSearchArray(null)
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
      }]);
      setPage(1);
    }

    const handleFromDateChange=(value) => {
      if(value>toDate) {
        handleToDate(null);
      }
      handleFromDate(value);
    }

    const handleCampainNameChange=event => {
      setCampaineNameSearch(event.target.value)
    }

    // if(windowSize==='xs') {
    //   return (
    //     <SearchField
    //       classes={classes}
    //       value={campaineNameSearch}
    //       onChange={handleCampainNameChange}
    //       onClick={handleSearch}
    //       placeholder={t('common.CampaignName')}
    //     />
    //   )
    // }
    return (
      <Grid container spacing={2} className={classes.lineTopMarging}>
        <Grid item>
          <TextField
            variant='outlined'
            size='small'
            value={campaineNameSearch}
            onChange={handleCampainNameChange}
            className={classes.textField}
            placeholder={t('common.CampaignName')}
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
        <Grid item>
          <Button
            variant='contained'
            size='medium'
            href='/Pulseem/Editor/CampaignInfo?new=1'
            className={clsx(
              classes.actionButton,
              classes.actionButtonLightGreen
            )}>
            {t('campaigns.create')}
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
              data: newslettersDeletedData
            })}>
            {t('campaigns.restoreDeleted')}
          </Button>
        </Grid>
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
          <TableCell classes={cellStyle} className={classes.flex3} align='center'>{t("common.CampaignName")}</TableCell>
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
      showCopied===CampaignID?
      <PopMassage
        classes={classes}
        show={showCopied===CampaignID}
        timeout={2000}
        label={t('common.copyClip')}
        innerRef={copyRef}
      /> : null
    )

    const iconsMap=[[
      {
        key: 'send',
        icon: SendGreenIcon,
        lable: t('campaigns.imgSendResource1.ToolTip'),
        remove: Status!==1,
        rootClass: classes.sendIcon,
        textClass: classes.sendIconText,
        href: `/Pulseem/SendCampaign.aspx?CampaignID=${CampaignID}`
      },
      {
        key: 'preview',
        icon: PreviewIcon,
        lable: t('campaigns.Image1Resource1.ToolTip'),
        rootClass: classes.paddingIcon,
        onClick: () => {
          pulseemNewTab(`PreviewCampaign.aspx?CampaignID=${CampaignID}`)
        }
      },
      {
        key: 'edit',
        icon: EditIcon,
        disable: Status!==1,
        lable: t('campaigns.Image2Resource1.ToolTip'),
        href: `/Pulseem/Editor/CampaignEdit/${CampaignID}`,
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
        disable: Groups&&Groups.length===0,
        lable: t('campaigns.lnkPreviewResource1.ToolTip'),
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
        text: shareUrl||'',
        type: 'copy',
        onClick: (e) => {
          setCopyRef(e.current)
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
        lable: t('campaigns.Reports'),
        href: `/Pulseem/CampaignStatistics.aspx?CampaignID=${CampaignID}`,
        rootClass: classes.paddingIcon,
      },
      {
        key: 'automation',
        icon: AutomationIcon,
        disable: AutomationID===0,
        lable: t('campaigns.automation'),
        href: `/Pulseem/CreateAutomations.aspx?Mode=show&AutomationID=${AutomationID}`,
        rootClass: classes.paddingIcon,
      },
      {
        key: 'delete',
        icon: DeleteIcon,
        lable: t('campaigns.DeleteResource1.HeaderText'),
        rootClass: classes.paddingIcon,
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
        <Typography noWrap={false} className={classes.nameEllipsis}>
          {row.Name}
        </Typography>
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
        return String(row.Name.toLowerCase()).startsWith(values.campaineName.toLowerCase());
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
        rows={newslettersData.length}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={setRowsPerPage}
        rowsPerPageOptions={rowsOptions}
        page={page}
        onPageChange={setPage}
      />
    )
  }

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

  const getRestorDialog=(data=[]) => {
    if(!data||!Array.isArray(data)) return null
    return {
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
          data={data}
          currentChecked={restoreArray}
          onChange={handleChange}
          dataIdVar='CampaignID'
        />
      ),
      onConfirm: async () => {
        await dispatch(restoreCampaigns(restoreArray))
        getData()
        handleClose()
      }
    }
  }

  const getGruopsDialog=(data=[]) => {
    if(!data||!Array.isArray(data)) return null
    return {
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

  const getDeleteDialog=(data='') => ({
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
      await dispatch(deleteCampaign(data))
      getData()
      handleClose()
      clearSearch()
    }
  })

  const getDuplicateDialog=(data='') => ({
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
    onConfirm: async () => {
      await dispatch(duplicteCampaign(data))
      getData()
      handleClose()
      clearSearch()
    }
  })
  const renderDialog=() => {
    const {data,type}=dialogType||{}

    const dialogContent={
      restore: getRestorDialog(data),
      groups: getGruopsDialog(data),
      delete: getDeleteDialog(data),
      duplicate: getDuplicateDialog(data)
    }

    const currentDialog=dialogContent[type]||{}
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
      {renderTablePagination()}
      {renderDialog()}
    </DefaultScreen>
  )
}

export default NewsletterManagnentScreen