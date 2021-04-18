import React,{useState,useEffect} from 'react';
import DefaultScreen from './DefaultScreen'
import clsx from 'clsx';
import {
  Typography,Divider,Table,TableBody,TableRow,TableHead,TableCell,TableContainer,
  Grid,Button,TextField,IconButton,InputAdornment,Input,Box,FormControlLabel,Checkbox
} from '@material-ui/core'
import {
  AutomationIcon,DeleteIcon,DuplicateIcon,EditIcon,SendGreenIcon,SearchIcon,
  GroupsIcon,PreviewIcon,ReportsIcon,CopyIcon
} from '../assets/images/managment/index'
import {
  TablePadington,ManagmentIcon,DateField,Dialog,PopMassage,SearchField
} from '../components/managment/index'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import {getLandingPagesData} from '../redux/reducers/landingPagesSlice'
//import {useHistory} from "react-router-dom";
import {history} from '../helpers/history'
import {useSelector,useDispatch} from 'react-redux'
import {useTranslation} from 'react-i18next'
import Ellipsis from 'react-ellipsis-pjs';
import ClearIcon from '@material-ui/icons/Clear'
import instence from '../helpers/api'
import moment from 'moment'
import 'moment/locale/he'



const LandingPagesesManagmentScreen=({classes}) => {
  const {language,windowSize}=useSelector(state => state.core)
  const {landingPagesData,landingPagesDataError,landingPagesDeletedData}=useSelector(state => state.landingPages)
  const {t}=useTranslation()
  const [landingPageNameSearch,setLandingPageNameSearch]=useState('')
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
  const dispatch=useDispatch()
  moment.locale(language)

  const getData=() => {
    dispatch(getLandingPagesData())
  }

  console.log("landingPagesData",landingPagesData)

  useEffect(getData,[dispatch])

  const renderHeader=() => {
    return (
      <>
        <Typography className={classes.managementTitle}>
          {t('landingPages.logPageHeaderResource1.Text')}
        </Typography>
        <Divider />
      </>
    )
  }

  const renderSearchLine=() => {
    const handleSearch=() => {
      setSearchArray([{
        type: 'name',
        campaineName: landingPageNameSearch
      }])
    }

    const clearSearch=() => {
      setLandingPageNameSearch('')
      setSearchArray(null)
    }

    const handleCampainNameChange=event => {
      setLandingPageNameSearch(event.target.value)
    }

    const placeholder=t('landingPages.GridBoundColumnResource2.HeaderText')

    if(windowSize==='xs') {
      return (
        <SearchField
          classes={classes}
          value={landingPageNameSearch}
          onChange={handleCampainNameChange}
          onClick={handleSearch}
          placeholder={placeholder}
        />
      )
    }
    return (
      <Grid container spacing={2} className={classes.lineTopMarging}>
        <Grid item>
          <TextField
            variant='outlined'
            size='small'
            value={landingPageNameSearch}
            onChange={handleCampainNameChange}
            className={classes.textField}
            placeholder={placeholder}
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
            onClick={() => history.push('LandingPageWizard')}
            className={clsx(
              classes.actionButton,
              classes.actionButtonLightGreen
            )}>
            {t('landingPages.CreateNewResource.Text')}
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
              data: landingPagesDeletedData
            })}>
            {t('campaigns.restoreDeleted')}
          </Button>
        </Grid>}
        <Grid item className={classes.groupsLableContainer} >
          <Typography className={classes.groupsLable}>
            {`${landingPagesData.length} ${t('landingPages.landingPages')}`}
          </Typography>
        </Grid>
      </Grid>
    )
  }

  const renderTableHead=() => {
    return (
      <TableHead>
        <TableRow
          classes={rowStyle}>
          <TableCell
            classes={cellStyle}
            className={classes.flex3}
            align='center'>
            {t("landingPages.name")}
          </TableCell>
          <TableCell
            classes={cellStyle}
            className={classes.flex1}
            align='center'>
            {t("landingPages.template")}
          </TableCell>
          <TableCell
            classes={cellStyle}
            className={classes.flex1}
            align='center'>
            {t("landingPages.ViewsResource1.HeaderText")}
          </TableCell>
          <TableCell
            classes={cellStyle}
            className={classes.flex1}
            align='center'>
            {t("landingPages.SubmitsResource1.HeaderText")}
          </TableCell>
          <TableCell
            classes={{root: classes.tableCellRoot}}
            className={classes.flex12} />
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

  const renderViewsCell=(status) => {
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

  const renderTemplateCell=(recipients) => {
    if(recipients===0) return null

    return (
      <>
        <Typography className={classes.middleText}>
          {recipients}
        </Typography>
      </>
    )
  }

  const renderNameCell=(row) => {
    return (
      <Ellipsis
        text={row.FormName}
        lines={1}
        style={{
          fontSize: 17,
          fontWeight: 700,
          marginBottom: '0.5rem',
          color: '#333333',
          fontFamily: 'Assistant'
        }}
      />

    )
  }

  const renderSubscribersCell=() => {
    return (
      null
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
          {renderTemplateCell(row.SentCount)}
        </TableCell>
        <TableCell
          classes={cellStyle}
          align='center'
          className={classes.flex1}>
          {renderViewsCell(row.Status)}
        </TableCell>
        <TableCell
          classes={cellStyle}
          align='center'
          className={classes.flex1}>
          {renderSubscribersCell(row)}
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
              {renderViewsCell(row.Status)}
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
        return row.Name.includes(values.FormName)
      }
    }

    let sortData=landingPagesData
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
        rows={landingPagesData.length}
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
      currentPage='landingPages'
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

export default LandingPagesesManagmentScreen