import React,{useState,useEffect} from 'react';
import DefaultScreen from '../../DefaultScreen'
import clsx from 'clsx';
import {
  Typography,Divider,Table,TableBody,TableRow,TableHead,TableCell,TableContainer,
  Grid,Button,TextField,Box,List,ListItem,ListItemAvatar,Avatar,ListItemText,ListItemSecondaryAction, Link
} from '@material-ui/core'
import {
  AutomationIcon,DeleteIcon,DuplicateIcon,EditIcon,SendGreenIcon,SearchIcon,
  GroupsIcon,PreviewIcon
} from '../../../assets/images/managment/index'
import {
  TablePagination,ManagmentIcon,DateField,Dialog,SearchField,RestorDialogContent
} from '../../../components/managment/index'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import {
  getSmsData,restoreSms,deleteSms,duplicteSms,getSmsAuthorizationData,getAuthorizeNumbers,sendVerificationCode,verifyCode,getSmsByID
} from '../../../redux/reducers/smsSlice'
import {useSelector,useDispatch} from 'react-redux'
import {useTranslation} from 'react-i18next'
import ClearIcon from '@material-ui/icons/Clear'
import moment from 'moment'
import 'moment/locale/he'
import {Preview} from '../../../components/Notifications/Preview/Preview';
import { pulseemNewTab } from '../../../helpers/functions';
import { Loader } from '../../../components/Loader/Loader';
import { setRowsPerPage } from '../../../redux/reducers/coreSlice';
import { setCookie } from '../../../helpers/cookies';

const SmsManagnentScreen=({classes}) => {
  const {language,windowSize,email,phone,rowsPerPage}=useSelector(state => state.core)
  const {smsData,smsDataError,smsDeletedData,authorizationData}=useSelector(state => state.sms)
  const {username}=useSelector(state => state.user)
  const {t}=useTranslation()
  const [fromDate,handleFromDate]=useState(null);
  const [toDate,handleToDate]=useState(null);
  const [number,handleNumber]=useState('');
  const [numberError,handleNumberError]=useState(false);
  const [verificationCode,handleVerificationCodeInput]=useState('');
  const [verificationCodeError,handleVerificationCodeError]=useState(false);
  const [campaineNameSearch,setCampaineNameSearch]=useState('')
  const rowsOptions=[6,12,18]
  const [page,setPage]=useState(1)
  const [isSearching,setSearching]=useState(false)
  const [searchResults,setSearchResults]=useState(null)
  const rowStyle={head: classes.tableRowHead,root: classes.tableRowRoot}
  const cellStyle={head: classes.tableCellHead,body: classes.tableCellBody,root: classes.tableCellRoot}
  const [dialogType,setDialogType]=useState(null)
  const [restoreArray,setRestoreArray]=useState([])
  const [showLoader, setLoader] = useState(true);
  const dateFormat='YYYY-MM-DD HH:mm:ss.FFF'
  const dispatch=useDispatch()
  moment.locale(language)

  const getData= async () => {
    await dispatch(getSmsData())
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
          {t('sms.PageResource1.Title')}
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

  const renderSearchLine=() => {
    const handleSearch=() => {
      const searchArray=[{
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
          const {UpdatedDate,SendDate}=row
          const lastUpdate=SendDate?
            moment(SendDate,dateFormat).valueOf()
            :moment(UpdatedDate,dateFormat).valueOf()
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

      let sortData=smsData
      searchArray.forEach(values => {
        sortData=sortData.filter(row => filtersObject[values.type](row,values))
      });
      setSearchResults(sortData);
      setSearching(true);
      setPage(1);
    }

    const handleKeyPress=(e) => {
      if (e.charCode === 13) {
        handleSearch()
      }
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

    if(windowSize==='xs') {
      return (
        <SearchField
          classes={classes}
          value={campaineNameSearch}
          onChange={handleCampainNameChange}
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
            onChange={handleCampainNameChange}
            className={clsx(classes.textField,classes.minWidth252)}
            placeholder={t('sms.GridBoundColumnResource2.HeaderText')}
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
    const handleVerificationDialog=async () => {
      const numbers=await dispatch(getAuthorizeNumbers());
      setDialogType({
        type: 'verify',
        data: numbers.payload
      })
    }
    return (
      <Grid container spacing={2} className={classes.linePadding} >
        <Grid item xs={windowSize==='xs'&&12}>
          <Button
            variant='contained'
            size='medium'
            href={"/Pulseem/SMSCampaignEdit.aspx?action=edit&t=create&fromreact=true"}
            className={clsx(
              classes.actionButton,
              classes.actionButtonLightGreen
            )}>
            {t('sms.create')}
          </Button>
        </Grid>
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
            {t('sms.verificationDialogTitle')}
          </Button>
        </Grid>}
        <Grid item xs={windowSize==='xs'&&12} className={classes.groupsLableContainer} >
          <Typography className={classes.groupsLable}>
            {`${isSearching? searchResults.length:smsData.length} ${t('mms.campaigns')}`}
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
    const {Status,Groups,AutomationID,Id}=row

    const iconsMap=[
      {
        key: 'send',
        icon: SendGreenIcon,
        lable: t('campaigns.imgSendResource1.ToolTip'),
        remove: Status!==1,
        rootClass: classes.sendIcon,
        textClass: classes.sendIconText,
        href: `/Pulseem/SendSMSCampaign.aspx?SMSCampaignID=${Id}&fromreact=true`
      },
      {
        key: 'preview',
        icon: PreviewIcon,
        lable: t('campaigns.Image1Resource1.ToolTip'),
        remove: windowSize==='xs',
        rootClass: classes.paddingIcon,
        onClick: async () => {
          const sms=await dispatch(getSmsByID(Id));
          setDialogType({
            type: 'preview',
            data: sms.payload
          })
        }
      },
      {
        key: 'edit',
        icon: EditIcon,
        disable: Status!==1 || AutomationID!==0,
        lable: t('campaigns.Image2Resource1.ToolTip'),
        remove: windowSize==='xs',
        href: `/Pulseem/SMSCampaignEdit.aspx?SMSCampaignID=${Id}&fromreact=true`,
        rootClass: classes.paddingIcon
      },
      {
        key: 'duplicate',
        icon: DuplicateIcon,
        lable: t('campaigns.lnkEditResource1.ToolTip'),
        rootClass: classes.paddingIcon,
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
        disable: Groups&&Groups.length===0,
        lable: t('campaigns.lnkPreviewResource1.ToolTip'),
        remove: windowSize==='xs',
        rootClass: classes.paddingIcon,
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
        disable: AutomationID===0,
        lable: t('campaigns.automation'),
        remove: windowSize==='xs',
        onClick: () => {
          pulseemNewTab(`CreateAutomations.aspx?Mode=show&AutomationID=${AutomationID}&fromreact=true`)
        },
        rootClass: classes.paddingIcon,
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
            data: Id
          })
        }
      }
    ]
    return (
      <Grid
        container
        direction='row'
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
      text=dateMillis>currentDateMillis? t('common.ScheduledFor'):t('common.SentOn')
    }

    return (
      <>
        <Typography noWrap={false} className={classes.nameEllipsis}>
          {row.Name}
        </Typography>
        <Typography
          className={classes.grayTextCell}>
          {`${text} ${date.format('DD/MM/YYYY')} ${date.format('LT')}`}
        </Typography>
      </>
    )
  }

  const renderRow=(row) => {
    return (
      <TableRow
        key={Math.round(Math.random()*999999999)}
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
          className={clsx(classes.flex1,classes.maxnWidth75)}>
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
    let sortData=isSearching? searchResults:smsData;
    let rpp=parseInt(rowsPerPage)
    sortData=sortData.slice((page-1)*rpp,(page-1)*rpp+rpp)
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
    const handleRowsPerPageChange=(val) => {
      dispatch(setRowsPerPage(val))
      setCookie('rpp', val, { maxAge: 2147483647 })
    }
    return (
      <TablePagination
        classes={classes}
        rows={isSearching? searchResults.length:smsData.length}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={rowsOptions}
        page={page}
        onPageChange={setPage}
      />
    )
  }

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
    handleNumber(number)
    setDialogType({
      type: 'shortVerify',
      data: number
    });
  }

  const handleSendVerificationCode=async () => {
    const value=(dialogType&&dialogType.type==='shortVerify'&&dialogType.data)? dialogType.data:number;
    if(!value||value.length<10) {
      handleNumberError(true);
      return
    }
    const result=await dispatch(sendVerificationCode({username,number: value}));

    if(!result.error) {
      setDialogType({
        type: 'verificationSent',
        data: value
      })
    }
  }

  const handleConfirmCode=async () => {
    const result=await dispatch(verifyCode({
      optinCode: verificationCode,
      phoneNumber: number
    }));
    if(result.error) {
      handleVerificationCodeError(true);
    } else {
      setDialogType({
        type: 'verificationSuccess',
        data: {}
      });
    }
  }

  const handleClose=() => {
    setDialogType(null);
    handleVerificationCodeError(false);
    handleNumberError(false);
    handleNumber('');
    handleVerificationCodeInput('');
  }

  const getRestorDialog=(data=[]) => {
    if(!data||!Array.isArray(data)) return null
    return {
      title: t('sms.restoreCampaignTitle'),
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
          dataIdVar='Id'
        />
      ),
      onConfirm: async () => {
        handleClose()
        await dispatch(restoreSms(restoreArray))
        setRestoreArray([]);
        getData()
      }
    }
  }

  const getGroupsDialog=(data=[]) => {
    if(!data||!Array.isArray(data)) return null

    return ({
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
    })
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
      clearSearch()
      handleClose()
      await dispatch(deleteSms(data))
      getData()
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
      clearSearch()
      handleClose()
      setPage(1)
      await dispatch(duplicteSms(data))
      getData()
    }
  })

  const getPreviewDialog=(data={}) => {
    return {
      childrenPadding: false,
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
            isSMS={true}
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

  const getVerifyDialog=(data=[]) => {
    if(!data||!Array.isArray(data)) return null
    return {
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
            {data.map(item => {
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
                      <Grid container >
                        <Grid item>
                          <Typography variant="body2">
                            {item.Number}
                          </Typography>
                        </Grid>
                        {!item.IsOptIn&&<Grid item>
                          <Typography
                            className={classes.verifyLink}
                            onClick={() => handleShortVerify(item.Number)}>
                            {t('sms.verifyNumber')}
                          </Typography>
                        </Grid>
                        }

                      </Grid>
                    }
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
    }
  }

  const getShortVerifyDialog=(data='') => ({
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
          autoFocus
          error={numberError}
          helperText={numberError? t('sms.numberError'):''}
          variant='outlined'
          placeholder={t('sms.enterNumberText')}
          value={data||number}
          onChange={e => handleNumber(e.target.value)}
          size='small'
          type='tel'
          className={!data&&classes.verifyField}
          readOnly={!!data}
        />
        <br /><br />
        <Button
          size={!data? "large":"medium"}
          variant='contained'
          onClick={handleSendVerificationCode}
          className={clsx(classes.verifyButton,!data&&classes.f20)}
        >{t('sms.verificationButtonText')}</Button>
        <Typography className={clsx(classes.contactUs,classes.newLine)}>
          {t('sms.havingIssuesMessage')}
        </Typography>
      </Box>
    ),
    renderButtons: () => null
  })

  const getVerificationSentDialog=(data='') => ({
    showDivider: false,
    icon: (
      <div className={classes.dialogIconContent}>
        {'\uE11B'}
      </div>
    ),
    content: (
      <Box style={{textAlign: 'center'}}>
        <Typography
          align='center'
          className={classes.verificationTitle}>
          {t('common.Sent')}
        </Typography>
        <Typography style={{fontSize: 15}} align={'center'}>
          {t('sms.verificationSentToNumber')}{data}
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
          style={{minWidth: 150}}>
          {t('common.Ok')}
        </Button>
        <Grid
          container
          style={{marginTop: 20}}
          justify='center'>
          <Grid item>
            <Typography >
              {t('sms.didNotReceived')}
            </Typography>
          </Grid>
          <Grid item>
            <Typography
              onClick={() => handleShortVerify(data)}
              style={{textDecoration: 'underline',margin: '0 5px',cursor: 'pointer'}}>
              {t('sms.resend')}
            </Typography>

          </Grid>
        </Grid>

      </Box>
    ),
    renderButtons: () => null
  });

  const getVerificationSuccessDialog=() => ({
    showDivider: false,
    icon: (
      <div className={classes.dialogIconContent}>
        {'\uE11B'}
      </div>
    ),
    content: (
      <Box style={{textAlign: 'center'}}>
        <Typography
          align='center'
          className={clsx(classes.verificationTitle,classes.green)}>
          {t('sms.verificationSuccessful')}
        </Typography>
        <Typography style={{fontSize: 15}} align={'center'}>
          {t('sms.verificationSuccessMessage')}
        </Typography>
        <br />
        <div className={classes.verifySuccessIcon}>{'\uE134'}</div>
      </Box>
    ),
    renderButtons: () => null
  });

  const renderDialog=() => {
    const {data,type}=dialogType||{};

    const dialogContent={
      restore: getRestorDialog(data),
      groups: getGroupsDialog(data),
      delete: getDeleteDialog(data),
      duplicate: getDuplicateDialog(data),
      preview: getPreviewDialog(data),
      verify: getVerifyDialog(data),
      shortVerify: getShortVerifyDialog(data),
      verificationSent: getVerificationSentDialog(data),
      verificationSuccess: getVerificationSuccessDialog(data)
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
      currentPage='sms'
      classes={classes}>
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

export default SmsManagnentScreen