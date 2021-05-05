import React,{useState,useEffect} from 'react';
import DefaultScreen from './DefaultScreen'
import clsx from 'clsx';
import {
  Typography,Divider,Table,TableBody,TableRow,TableHead,TableCell,TableContainer,
  Grid,Button,TextField,Box
} from '@material-ui/core'
import {
  DeleteIcon,DuplicateIcon,EditIcon,ReportsIcon,SearchIcon,PreviewIcon
} from '../assets/images/managment/index'
import {
  TablePadington,ManagmentIcon,DateField,Dialog,SearchField,RestorDialogContent,Switch
} from '../components/managment/index'
import {
  getAutomationsData,deleteAutomations,duplicateAutomations,restoreAutomations,activateAutomation
} from '../redux/reducers/automationsSlice'
import {Link,useHistory} from "react-router-dom";
import {useSelector,useDispatch} from 'react-redux'
import {useTranslation} from 'react-i18next'
import Ellipsis from 'react-ellipsis-pjs';
import ClearIcon from '@material-ui/icons/Clear'
import moment from 'moment'
import 'moment/locale/he'


const AutomationsManagnentScreen=({classes}) => {
  const {language,windowSize}=useSelector(state => state.core)
  const {automationsData,automationsDataError,automationsDeletedData}=useSelector(state => state.automations)
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
  const [restoreArray,setRestoreArray]=useState([])
  const dateFormat='YYYY-MM-DD HH:mm:ss.FFF'
  const history=useHistory()
  const dispatch=useDispatch()
  moment.locale(language)


  console.log('automationsData',automationsData)
  console.log('automationsDeletedData',automationsDeletedData)

  const getData=() => {
    dispatch(getAutomationsData())
  }

  useEffect(getData,[dispatch])

  const renderHeader=() => {
    return (
      <>
        <Typography className={classes.managementTitle}>
          {t('automations.logPageHeaderResource1.Text')}
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
          placeholder={t('automations.labelAutomationName')}
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
            placeholder={t('automations.labelAutomationName')}
          />
        </Grid>

        <Grid item>
          <DateField
            classes={classes}
            value={fromDate}
            onChange={handleFromDate}
            placeholder={t('mms.locFromDateResource1.Text')}
          />
        </Grid>

        <Grid item>
          <DateField
            classes={classes}
            value={toDate}
            onChange={handleToDate}
            placeholder={t('mms.locToDateResource1.Text')}
            disabled={fromDate?false: true}
            minDate={fromDate?fromDate: null}
          />
        </Grid>

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
            onClick={() => history.push('/CreateAutomations')}
            className={clsx(
              classes.actionButton,
              classes.actionButtonLightGreen
            )}>
            {t('automations.createResource.Text')}
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
              data: automationsDeletedData
            })}>
            {t('automations.restoreResource.Text')}
          </Button>
        </Grid>}
        <Grid item className={classes.groupsLableContainer} >
          <Typography className={classes.groupsLable}>
            {`${automationsData.length} ${t('automations.Automations')}`}
          </Typography>
        </Grid>
      </Grid>
    )
  }

  const renderTableHead=() => {
    return (
      <TableHead>
        <TableRow classes={rowStyle}>
          <TableCell classes={cellStyle} className={classes.flex3} align='center'>{t("automations.labelAutomationName")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("campaigns.recipients")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("automations.DaysActive")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("campaigns.lblCampaignStatusResource1.Text")}</TableCell>
          <TableCell classes={{root: classes.tableCellRoot}} className={classes.flex5} ></TableCell>
        </TableRow>
      </TableHead>
    )
  }

  const renderCellIcons=(row) => {
    const {ID,IsActive}=row

    const iconsMap=[
      {
        key: 'preview',
        icon: PreviewIcon,
        remove: windowSize==='xs',
        lable: t('campaigns.Image1Resource1.ToolTip'),
        onClick: () => {
          history.push(`/PreviewAutomations/${ID}`)
        }
      },
      {
        key: 'edit',
        icon: EditIcon,
        remove: windowSize==='xs',
        lable: t('campaigns.Image2Resource1.ToolTip'),
        onClick: () => {
          if(IsActive) {
            setDialogType({
              type: 'editActive',
              data: row
            })
          }
          else {
            history.push(`/EditAutomations/${ID}`)
          }
        }
      },
      {
        key: 'duplicate',
        icon: DuplicateIcon,
        lable: t('campaigns.lnkEditResource1.ToolTip'),
        onClick: () => {
          setDialogType({
            type: 'duplicate',
            data: ID
          })
        }
      },
      {
        key: 'reports',
        icon: ReportsIcon,
        remove: windowSize==='xs',
        lable: t('campaigns.Reports'),
        onClick: () => {
          history.push(`/AutomationReport/${ID}`)
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
            data: ID
          })
        }
      }
    ]
    return (
      <Grid
        container
        spacing={1}
        direction={'row'}
        justify={windowSize==='xs'? 'flex-start':'flex-end'}>
        {iconsMap.map(icon => (
          <Grid
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

  const renderStatusCell=(row) => {
    const {IsActive}=row
    const statuses={
      true: t('automations.AutomationActiveStatusText'),
      false: t('automations.AutomatoionInActiveStatusText',)
    }
    return (
      <Box>
        <Switch
          checked={IsActive}
          onChange={() => {
            setDialogType({
              type: 'switch',
              data: row
            })
          }}
        />

        <Typography
          className={clsx(
            classes.middleText,
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

  const renderRecipientsCell=(recipients=0) => {

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
            fontFamily: 'Assistant'
          }}
        />
        <Typography
          className={classes.grayTextCell}>
          {`${text} ${date.format('L')} ${date.format('LT')}`}
        </Typography>
      </>
    )
  }

  const renderDaysActiveCell=(messages=0) => {
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
        const {LastUpdate,SendDate}=row
        const lastUpdate=SendDate?
          moment(SendDate,dateFormat).valueOf()
          :moment(LastUpdate,dateFormat).valueOf()
        if(fromDate&&toDate)
          return ((lastUpdate>=values.fromDate.valueOf())&&(lastUpdate<=values.toDate.valueOf()))
        if(fromDate)
          return lastUpdate>=values.fromDate.valueOf()
        if(toDate)
          return lastUpdate<=values.toDate.valueOf()
        return true
      }
    }

    let sortData=automationsData
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
        rows={automationsData.length}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={setRowsPerPage}
        rowsPerPageOptions={rowsOptions}
        page={page}
        onPageChange={setPage}
      />
    )
  }

  const renderDialog=() => {

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
      setRestoreArray([])
      setDialogType(null)
    }

    const switchOptions={
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

    const handleActiveChange=(data,isEdit=false) => async () => {
      try {
        await dispatch(activateAutomation(data))
        getData()
        if(isEdit)
          history.push(`/EditAutomations/${data.ID}`)
      } catch(err) {
        console.log('AutomationManagment.ChangeStatus',err)
        setDialogType({
          type: "statusError",
          data: data.ID
        })
      }
      handleClose()
    }

    const switchContent=(dialogType&&dialogType.type==='switch'&&switchOptions[dialogType.data.IsActive])||{}

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
          />
        ),
        onConfirm: async () => {
          console.log("restoreArray",restoreArray)
          await dispatch(restoreAutomations(restoreArray))
          getData()
          handleClose()
        }
      },
      editActive: {
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
        onConfirm: handleActiveChange((dialogType&&dialogType.data)||{},true)
      },
      switch: {
        title: switchContent.title,
        showDivider: false,
        content: switchContent.content,
        onConfirm: handleActiveChange((dialogType&&dialogType.data)||{})
      },
      statusError: {
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
      },
      delete: {
        title: t('automations.GridButtonColumnResource2.ConfirmTitle'),
        showDivider: false,
        content: (
          <Typography style={{fontSize: 18}}>
            {t('automations.GridButtonColumnResource2.ConfirmText')}
          </Typography>
        ),
        onConfirm: async () => {
          await dispatch(deleteAutomations(dialogType.data))
          getData()
          handleClose()
        }
      },
      duplicate: {
        title: t('automations.duplicateTitle'),
        showDivider: false,
        content: (
          <Typography style={{fontSize: 18}}>
            {t('automations.duplicateContent')}
          </Typography>
        ),
        onConfirm: async () => {
          await dispatch(duplicateAutomations(dialogType.data))
          getData()
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
      currentPage='automations'
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

export default AutomationsManagnentScreen