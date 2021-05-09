import React,{useState,useEffect} from 'react';
import DefaultScreen from './DefaultScreen'
import clsx from 'clsx';
import {
  Typography,Divider,Table,TableBody,TableRow,TableHead,TableCell,TableContainer,
  Grid,Button,TextField,Box,List,ListItem,ListItemAvatar,Avatar,ListItemText,ListItemSecondaryAction
} from '@material-ui/core'
import {
  AutomationIcon,DeleteIcon,DuplicateIcon,EditIcon,SendGreenIcon,SearchIcon,
  GroupsIcon,PreviewIcon
} from '../assets/images/managment/index'
import {
  TablePadington,ManagmentIcon,DateField,Dialog,SearchField,RestorDialogContent
} from '../components/managment/index'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import {
  getSmsData,restoreSms,deleteSms,duplicteSms,getSmsAuthorizationData,getAuthorizeNumbers,sendVerificationCode,verifyCode
} from '../redux/reducers/smsSlice'
import {useHistory} from "react-router-dom";
import {useSelector,useDispatch} from 'react-redux'
import {useTranslation} from 'react-i18next'
import Ellipsis from 'react-ellipsis-pjs';
import ClearIcon from '@material-ui/icons/Clear'
import moment from 'moment'
import 'moment/locale/he'

const SmsManagnentScreen=({classes}) => {
  const {language,windowSize}=useSelector(state => state.core)
  const {smsData,smsDataError,smsDeletedData,authorizationData}=useSelector(state => state.sms)
  const {t}=useTranslation()
  const [fromDate,handleFromDate]=useState(null);
  const [toDate,handleToDate]=useState(null);
  const [number,handleNumber]=useState('');
  const [numberError,handleNumberError]=useState(false);
  const [verificationCode,handleVerificationCodeInput]=useState('');
  const [verificationCodeError,handleVerificationCodeError]=useState(false);
  const [campaineNameSearch,setCampaineNameSearch]=useState('')
  const rowsOptions=[6,12,18]
  const [rowsPerPage,setRowsPerPage]=useState(rowsOptions[0])
  const [page,setPage]=useState(1)
  const [searchArray,setSearchArray]=useState(null)
  const rowStyle={head: classes.tableRowHead,root: classes.tableRowRoot}
  const cellStyle={head: classes.tableCellHead,body: classes.tableCellBody,root: classes.tableCellRoot}
  const [dialogType,setDialogType]=useState(null)
  const [restoreArray,setRestoreArray]=useState([])
  const history=useHistory()
  const dateFormat='YYYY-MM-DD HH:mm:ss.FFF'
  const dispatch=useDispatch()
  moment.locale(language)

  const getData=() => {
    dispatch(getSmsData())
  }

  useEffect(getData,[dispatch]);

  const renderHeader=() => {
    return (
      <>
        <Typography className={classes.managementTitle}>
          {t('sms.PageResource1.Title')}
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
    const handleVerificationDialog=async () => {
      const numbers=await dispatch(getAuthorizeNumbers());
      setDialogType({
        type: 'verify',
        data: numbers.payload
      })
    }
    return (
      <Grid container spacing={2} className={classes.linePadding} >
        {windowSize!=='xs'&&<Grid item>
          <Button
            variant='contained'
            size='medium'
            onClick={() => history.push('/SMSCampaignEdit')}
            className={clsx(
              classes.actionButton,
              classes.actionButtonLightGreen
            )}>
            {t('sms.create')}
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
              data: smsDeletedData
            })}>
            {t('campaigns.restoreDeleted')}
          </Button>
        </Grid>}
        {windowSize!=='xs'&&<Grid item>
          <Button
            variant='contained'
            size='medium'
            className={clsx(
              classes.actionButton,
              classes.actionButtonDarkBlue
            )}
            onClick={handleVerificationDialog}>
            {t('sms.verification')}
          </Button>
        </Grid>}
        <Grid item className={classes.groupsLableContainer} >
          <Typography className={classes.groupsLable}>
            {`${smsData.length} ${t('campaigns.newsletters')}`}
          </Typography>
        </Grid>
      </Grid>
    )
  }

  const renderTableHead=() => {
    return (
      <TableHead>
        <TableRow classes={rowStyle}>
          <TableCell classes={cellStyle} className={classes.flex3} align='center'>{t("sms.GridBoundColumnResource2.HeaderText")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("campaigns.recipients")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("sms.CreditsResource1.HeaderText")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("sms.StatusResource1.HeaderText")}</TableCell>
          <TableCell classes={{root: classes.tableCellRoot}} className={classes.flex5} ></TableCell>
        </TableRow>
      </TableHead>
    )
  }

  const renderCellIcons=(row) => {
    const {Status,Groups,AutomationId,Id}=row

    const iconsMap=[
      {
        key: 'send',
        icon: SendGreenIcon,
        lable: t('campaigns.imgSendResource1.ToolTip'),
        remove: Status!==1,
        rootClass: classes.sendIcon,
        textClass: classes.sendIconText,
        onClick: () => {
          history.push('/SendCampaign/'+Id)
        }
      },
      {
        key: 'preview',
        icon: PreviewIcon,
        remove: windowSize==='xs',
        lable: t('campaigns.Image1Resource1.ToolTip'),
        onClick: () => {
          history.push('/SMSPreviewCampaign/'+Id)
        }
      },
      {
        key: 'edit',
        icon: EditIcon,
        remove: windowSize==='xs',
        disable: Status!==1,
        lable: t('campaigns.Image2Resource1.ToolTip'),
        onClick: () => {
          history.push('/Editor/CampaignEdit/'+Id)
        }
      },
      {
        key: 'duplicate',
        icon: DuplicateIcon,
        lable: t('campaigns.lnkEditResource1.ToolTip'),
        onClick: () => {
          setDialogType({
            type: 'duplicate',
            data: Id
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
      {
        key: 'automation',
        icon: AutomationIcon,
        remove: windowSize==='xs',
        disable: AutomationId===0,
        lable: t('campaigns.automation'),
        onClick: () => {
          history.push('/CampaignStatistics/'+AutomationId)
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
            data: Id
          })
        }
      }
    ]
    return (
      <Grid
        container
        direction={windowSize==='sm'? 'column':'row'}
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

  const renderMessagesCell=(messages) => {
    return (
      <>
        <Typography className={classes.middleText}>
          {messages.toLocaleString()}
        </Typography>
        <Typography className={classes.middleText}>
          {t("sms.CreditsResource1.HeaderText")}
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
        key={row.Id}
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
          {renderMessagesCell(row.CreditsPerSms)}
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
        key={row.Id}
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

    let sortData=smsData
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
        rows={smsData.length}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={setRowsPerPage}
        rowsPerPageOptions={rowsOptions}
        page={page}
        onPageChange={setPage}
      />
    )
  }

  const renderDialog=() => {

    const handleChange=(Id) => () => {
      const found=restoreArray.includes(Id)
      if(found) {
        setRestoreArray(restoreArray.filter(restore => restore!==Id))
      } else {
        setRestoreArray([...restoreArray,Id])
      }
    }

    const handleShortVerify=async (number) => {
      handleVerificationCodeInput('');
      setDialogType({
        type: 'shortVerify',
        data: number
      });
    }

    const handleSendVerificationCode=async () => {
      const value=(dialogType&&dialogType.type==='shortVerify'&&dialogType.data)? dialogType.data:number;
      console.log("length",value.length)
      if(!value||value.length<10) {
        handleNumberError(true);
        return
      }

      const result=await dispatch(sendVerificationCode({userName: null,number: value}));

      if(!result.error) {
        setDialogType({
          type: 'verificationSent',
          data: value
        })
      }
    }

    const handleConfirmCode=async () => {
      const result=await dispatch(verifyCode(verificationCode));
      if(result.error) {
        handleVerificationCodeError(true);
      } else {
        handleClose();
      }
    }

    const handleClose=() => {
      setRestoreArray([]);
      setDialogType(null);
      handleVerificationCodeError(false);
      handleNumberError(false);
      handleNumber('');
      handleVerificationCodeInput('');
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
            dataIdVar='Id'
          />
        ),
        onConfirm: async () => {
          await dispatch(restoreSms(restoreArray))
          getData()
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
          await dispatch(deleteSms(dialogType.data))
          getData()
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
        onConfirm: async () => {
          await dispatch(duplicteSms(dialogType.data))
          getData()
          handleClose()
        }
      },
      verify: {
        title: t('sms.verificationDialogTitle'),
        showDivider: false,
        icon: (
          <div className={classes.dialogIconContent}>
            {'\uE11B'}
          </div>
        ),
        content: (
          <Box>
            <Typography style={{fontSize: 15}} align={'justify'}>
              {t('sms.verificationBody')}
              <b>{t('sms.oneTimeProcess')}</b>
              {t('sms.foreachSubmission')}
            </Typography>
            <br />
            <Typography style={{fontSize: 15,textDecoration: 'underline'}}>
              {t('sms.verificationNote')}
            </Typography>
            <hr />
            <Box style={{display: 'flex',justifyContent: 'space-between',marginBottom: 10}}>
              <Typography style={{fontSize: 15}}>
                {t('sms.numbersAccount')}
              </Typography>
              <Button
                variant='contained'
                size='small'
                color='primary'
                onClick={() => handleShortVerify()}
              >{t('sms.verifyAnotherNumber')}
              </Button>
            </Box>
            <List style={{padding: 0,overflow: 'auto',height: 'calc(100vh - 500px)'}}>
              {dialogType&&dialogType.type==='verify'&&dialogType.data
                .map(item => {
                  return (
                    <ListItem style={{padding: 0}} key={`verificationNumber${item.ID}`}>
                      <ListItemAvatar style={{minWidth: 25}}>
                        <Avatar className={item.IsOptIn? classes.checkIcon:classes.redIcon}>
                          <div className={clsx(classes.avatarIcon)}>
                            {item.IsOptIn? '\uE134':'\uE0A7'}
                          </div>
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        style={{margin: 0}}
                        primary={
                          <Typography variant="body2">
                            {item.Number}
                            {!item.IsOptIn&&
                              <a
                                href=""
                                className={classes.verifyLink}
                                onClick={() => handleShortVerify(item.Number)}
                              >{t('sms.verifyNumber')}</a>
                            }
                          </Typography>}
                      />
                      <ListItemSecondaryAction>

                      </ListItemSecondaryAction>
                    </ListItem>
                  );
                })}
            </List>

          </Box>
        ),
        renderButtons: () => (
          <Button
            variant='contained'
            size='small'
            style={{maxWidth: 100}}
            onClick={handleClose}
            className={clsx(
              classes.gruopsDialogButton,
              classes.dialogConfirmButton,
            )}>
            {t('common.Ok')}
          </Button>
        )
      },
      shortVerify: {
        showDivider: false,
        icon: (
          <div className={classes.dialogIconContent}>
            {'\uE11B'}
          </div>
        ),
        content: (
          <Box style={{textAlign: 'center'}}>
            <Typography align='center' style={{fontWeight: 'bold',fontSize: 25}}>{t('sms.shortVerificationTitle')}</Typography>
            <Typography style={{fontSize: 15}} align={'justify'}>
              {t('sms.verificationBody')}
              <b>{t('sms.oneTimeProcess')}</b>
              {t('sms.foreachSubmission')}
            </Typography>
            <br />
            <TextField
              error={numberError}
              helperText={numberError? t('sms.numberError'):''}
              variant='outlined'
              placeholder={t('sms.enterNumberText')}
              value={(dialogType&&dialogType.type==='shortVerify'&&dialogType.data!=='')? dialogType.data:number}
              onChange={e => handleNumber(e.target.value)}
              size='small'
              type='tel'
              readOnly={dialogType&&dialogType.type==='shortVerify'&&dialogType.data!==''}
            />
            <br /><br />
            <Button
              variant='contained'
              onClick={handleSendVerificationCode}
              style={{background: 'green',textTransform: 'capitalize',color: 'white'}}
            >{t('sms.verificationButtonText')}</Button>
            <Typography className={clsx(classes.contactUs,classes.newLine)}>{t('sms.havingIssuesMessage')}</Typography>
          </Box>
        ),
        renderButtons: () => null
      },
      verificationSent: {
        showDivider: false,
        icon: (
          <div className={classes.dialogIconContent}>
            {'\uE11B'}
          </div>
        ),
        content: (
          <Box style={{textAlign: 'center'}}>
            <Typography align='center' style={{fontWeight: 'bold',fontSize: 25}}>{t('common.Sent')}!</Typography>
            <Typography style={{fontSize: 15}} align={'center'}>
              {t('sms.verificationSentToNumber')}{dialogType&&dialogType.type==='verificationSent'? dialogType.data:null}
              <br />
              {t('sms.pleaseNoteCode')}
            </Typography>
            <br />
            <TextField
              error={verificationCodeError}
              helperText={verificationCodeError? t('sms.verificationCodeError'):''}
              variant='outlined'
              placeholder={t('sms.enterCode')}
              value={verificationCode}
              onChange={(e) => handleVerificationCodeInput(e.target.value)}
              size='small'
            />
            <br /><br />
            <Button
              variant='contained'
              onClick={() => handleConfirmCode(verificationCode)}
              color='primary'
              style={{minWidth: 150}}
            >{t('common.Ok')}</Button>
            <Typography style={{paddingTop: 20}}>
              {t('sms.didNotReceived')}
              <a href="#"
                onClick={() => handleShortVerify(dialogType.data)}
                style={{textDecoration: 'underline',margin: '0 5px'}}
              >{t('sms.resend')}</a>
            </Typography>
          </Box>
        ),
        renderButtons: () => null
      },
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
      currentPage='sms'
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

export default SmsManagnentScreen