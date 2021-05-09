import React,{useState,useEffect,useRef} from 'react';
import DefaultScreen from './DefaultScreen'
import clsx from 'clsx';
import {
  Typography,Divider,Table,TableBody,TableRow,TableHead,TableCell,TableContainer,
  Grid,Button,TextField,IconButton,InputAdornment,Input,Box,FormControlLabel,Checkbox,Select,MenuItem,CardMedia,Card,CardContent,RadioGroup,Radio
} from '@material-ui/core'
import {
  DeleteIcon,DuplicateIcon,EditIcon,SendGreenIcon,SearchIcon,
  GroupsIcon,PreviewIcon
} from '../assets/images/managment/index'
import {
  TablePagination,ManagmentIcon,DateField,Dialog
} from '../components/managment/index'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import {useHistory} from "react-router-dom";
import {useSelector,useDispatch} from 'react-redux'
import {useTranslation} from 'react-i18next'
import Ellipsis from 'react-ellipsis-pjs';
import ClearIcon from '@material-ui/icons/Clear'
import moment from 'moment'
import 'moment/locale/he'
import {
  getNotificationById,getNotificationGroups,getNotificationData,getDeletedNotifications,
  duplicateNotification,deleteNotification,getNotificationGroupsById,restoreNotifications,
  getScriptPath,getApiToken,updateScriptPath
} from '../redux/reducers/notificationSlice';

const NotificationManagement=({classes}) => {
  const {language,windowSize}=useSelector(state => state.core)
  const {notificationData}=useSelector(state => state.notification)
  const {t}=useTranslation()
  const [fromDate,handleFromDate]=useState(null);
  const [toDate,handleToDate]=useState(null)
  const [notificationNameSearch,setNotificationNameSearch]=useState('');
  const [statusSearch,setStatusSearch]=useState(-1);
  const [scriptDirectory,setScriptDirectory]=useState(0);
  const [copyStatus,setCopyStatus]=useState(false);
  const [scriptPath,setScriptPath]=useState(0);
  const [apiToken,setApiToken]=useState(0);
  const rowsOptions=[6,12,18]
  const [rowsPerPage,setRowsPerPage]=useState(rowsOptions[0])
  const [page,setPage]=useState(1)
  const [searchArray,setSearchArray]=useState(null)
  const [dialogType,setDialogType]=useState(null)
  const [restoreArray,setRestoreArray]=useState([]);
  const history=useHistory()
  const dateFormat='YYYY-MM-DD HH:mm:ss.FFF'
  const dispatch=useDispatch()
  const rowStyle={head: classes.tableRowHead,root: classes.tableRowRoot}
  const cellStyle={head: classes.tableCellHead,root: clsx(classes.tableCellRoot,classes.paddingHead)}
  const cell50wStyle={head: clsx(classes.tableCellHead),root: clsx(classes.tableCellRoot,classes.paddingHead)}
  const cellBodyStyle={body: clsx(classes.tableCellBody),root: clsx(classes.tableCellRoot,classes.paddingRightLeft10)}
  const noBorderCellStyle={body: classes.tableCellBodyNoBorder,root: clsx(classes.tableCellRoot,classes.paddingRightLeft10)}
  const borderCellStyle={body: clsx(classes.tableCellBody),root: clsx(classes.tableCellRoot,classes.paddingRightLeft10)}
  const baseUrl='https://www.pulseemdev.co.il/pulseem';
  const refScriptCode=useRef(null);
  moment.locale(language)

  const getData=() => {
    dispatch(getNotificationData());
  }

  useEffect(getData,[dispatch]);

  const handleImplementScript=async () => {
    handleScriptPath();
    handleApiToken();
    setDialogType({
      type: 'implement',
      data: {}
    });
  }

  const handleScriptPath=async () => {
    const scriptPath=await dispatch(getScriptPath());
    const path=(scriptPath&&scriptPath.payload)||'';
    setScriptPath(path);
  }

  const handleApiToken=async () => {
    const apiToken=await dispatch(getApiToken());
    const token=(apiToken&&apiToken.payload&&apiToken.payload.PublicKey)||'';
    setApiToken(token);
  }

  const handleScriptDirectory=async (event) => {
    const value=parseInt(event.target.value);
    setScriptDirectory(value);
  }

  const handleCopyScript=() => {
    navigator.clipboard.writeText(refScriptCode.current.innerText);
    setCopyStatus(true);

    setTimeout(() => {
      setCopyStatus(false);
    },1000);
  }

  const handleScriptPathChange=(event) => {
    setScriptPath(event.target.value);
  }

  const handlePreview=async (ID) => {
    const item=await dispatch(getNotificationById(ID));
    setDialogType({
      type: 'preview',
      data: item.payload
    })
  }

  const handleShowGroups=async (ID) => {
    const item=await dispatch(getNotificationGroups(ID));
    if(item&&item.payload) {

    }
    setDialogType({
      type: 'groups',
      data: item.payload
    })
  }

  const handleShowGroupsById=async (ID) => {
    const item=await dispatch(getNotificationGroupsById(ID));
    setDialogType({
      type: 'groupsById',
      data: item.payload
    })
  }

  const handleDuplicate=async (ID) => {
    const res=await dispatch(duplicateNotification(ID));
    if(!res.error) {
      dispatch(getNotificationData());
    }
    handleDialogClose();
  }

  const handleDeleteNotification=async (ID) => {
    const res=await dispatch(deleteNotification(ID));
    if(res.payload===true&&!res.error) {
      dispatch(getNotificationData());
    }
    handleDialogClose();
  }

  const handleShowDeletedItems=async () => {
    const res=await dispatch(getDeletedNotifications());
    if(!res.error) {
      setDialogType({
        type: 'restore',
        data: res.payload
      });
    }
  }

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
        type: 'status',
        status: statusSearch
      },{
        type: 'date',
        fromDate,
        toDate
      }])
    }

    const clearSearch=() => {
      setNotificationNameSearch('')
      setStatusSearch(-1)
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
            id="statusSelect"
            variant="outlined"
            onChange={handleStatusChange}
            value={statusSearch}
            className={classes.formControlSelect}
          >
            <MenuItem value={-1} disabled><div style={{color: 'rgba(0,0,0,0.40)'}}>{t('common.Status')}</div></MenuItem>
            <MenuItem value={0}>{t('common.draft')}</MenuItem>
            <MenuItem value={1}>{t('common.deleted')}</MenuItem>
            <MenuItem value={2}>{t('common.Pending')}</MenuItem>
            <MenuItem value={3}>{t('common.Sending')}</MenuItem>
            <MenuItem value={4}>{t('common.Sent')}</MenuItem>
            <MenuItem value={5}>{t('common.ScheduledDate')}</MenuItem>
            <MenuItem value={7}>{t('common.failedStatus')}</MenuItem>
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
            onClick={() => history.push('/Notification/create')}
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
              classes.actionButtonRed
            )}
            onClick={handleShowDeletedItems}>
            {t('notifications.restoreDeleted')}
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
            onClick={handleImplementScript}>
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
            onClick={handleShowGroups}>
            {t('notifications.buttons.groups')}
          </Button>
        </Grid>
        <Grid item className={classes.groupsLableContainer} >
          <Typography className={classes.groupsLable}>
            {`${notificationData.length} ${t('notifications.notifications')}`}
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
          <TableCell classes={cell50wStyle} className={classes.flex15} align='center'>{t("notifications.tblHeader.toSend")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex15} align='center'>{t("notifications.tblHeader.sent")}</TableCell>
          <TableCell classes={cell50wStyle} className={classes.flex15} align='center'>{t("notifications.tblHeader.failed")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex15} align='center'>{t("notifications.tblHeader.clicks")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex15} align='center'>{t("notifications.tblHeader.status")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex12} ></TableCell>
        </TableRow>
      </TableHead>
    )
  }

  const renderCellIcons=(row) => {
    const {StatusID,groups,ID}=row

    const iconsMap=[
      {
        key: 'send',
        icon: SendGreenIcon,
        lable: t('notifications.buttons.send'),
        remove: StatusID!==0,
        rootClass: classes.sendIcon,
        textClass: classes.sendIconText,
        onClick: () => {
          // history.push('/SendCampaign/'+id)
        }
      },
      {
        key: 'preview',
        icon: PreviewIcon,
        remove: windowSize==='xs',
        lable: t('notifications.buttons.preview'),
        onClick: () => {
          handlePreview(ID);
        }
      },
      {
        key: 'edit',
        icon: EditIcon,
        remove: windowSize==='xs',
        disable: StatusID!==0,
        lable: t('notifications.buttons.edit'),
        onClick: () => {
          history.push(`/notifications/edit/${ID}`);
        }
      },
      {
        key: 'duplicate',
        icon: DuplicateIcon,
        lable: t('notifications.buttons.duplicate'),
        onClick: () => {
          setDialogType({
            type: "duplicate",
            data: ID
          });
        }
      },
      {
        key: 'groups',
        icon: GroupsIcon,
        remove: windowSize==='xs',
        disable: groups&&groups.length===0,
        lable: t('notifications.buttons.groups'),
        onClick: () => {
          handleShowGroupsById(ID);
        }
      },
      {
        key: 'delete',
        icon: DeleteIcon,
        lable: t('notifications.buttons.delete'),
        showPhone: true,
        onClick: async () => {
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
        direction='row'
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
      0: 'common.draft',
      1: 'common.deleted',
      2: 'common.Pending',
      3: 'common.Sending',
      4: 'common.Sent',
      5: 'common.ScheduledDate',
      7: 'common.failedStatus'
    }
    return (
      <>
        <Typography className={clsx(
          classes.wrapText,
          classes.recipientsStatus,
          {
            [classes.statusDraft]: status===0,
            [classes.statusFailed]: status===1,
            [classes.statusPending]: status===2,
            [classes.statusSending]: status===3,
            [classes.statusSent]: status===4,
            [classes.statusScheduled]: status===5,
            [classes.statusFailed]: status===7,
          }
        )}>
          {t(statuses[status])}
        </Typography>
      </>
    )
  }

  const renderTotalCell=(value,type) => {
    let count=value;
    if(type==="error") {
      count=value.UnSubscribed+value.FailedCount;
    }

    return (
      <div>
        <Typography className={clsx(classes.middleText,classes.fontBold,type==="error"&&classes.errorText)}>
          {count.toLocaleString()}
        </Typography>
        <Typography className={clsx(classes.middleText,type==="error"&&classes.errorText)}>
          {t("notifications.tblBody.total")}
        </Typography>
      </div>
    )
  }

  const renderClickCell=(value,type) => {
    return (
      <>
        <Typography className={clsx(classes.middleText,classes.fontBold,type==="error"&&classes.errorText)}>
          {value.toLocaleString()}
        </Typography>
        <Typography className={clsx(classes.middleText,type==="error"&&classes.errorText)}>
          {t("notifications.tblBody.clicks")}
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
        key={row.ID}
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
          className={classes.flex15}>
          {renderTotalCell(row.SentCount)}
        </TableCell>
        <TableCell
          classes={noBorderCellStyle}
          align='center'
          className={classes.flex15}>
          {renderTotalCell(row.ReceivedCount)}
        </TableCell>
        <TableCell
          classes={borderCellStyle}
          align='center'
          className={classes.flex15}>
          {renderTotalCell(row,"error")}
        </TableCell>
        <TableCell
          classes={cellBodyStyle}
          align='center'
          className={classes.flex15}>
          {renderClickCell(row.ClickCount)}
        </TableCell>
        <TableCell
          classes={cellBodyStyle}
          align='center'
          className={classes.flex15}>
          {renderStatusCell(row.StatusID)}
        </TableCell>
        <TableCell
          component="th"
          scope="row"
          classes={{root: clsx(classes.tableCellRoot,classes.paddingRightLeft10)}}
          className={classes.flex12}>
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
              {renderStatusCell(row.StatusID)}
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
        return row.Name.toLowerCase().includes(values.notificationName)
      },
      status: (row,values) => {
        if(values.status<0) {
          return true;
        } else {
          return row.StatusID===values.status
        }
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

    let sortData=notificationData;
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
        rows={notificationData.length}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={setRowsPerPage}
        rowsPerPageOptions={rowsOptions}
        page={page}
        onPageChange={setPage}
      />
    )
  }

  const handleChange=(id) => () => {
    const found=restoreArray.includes(id)
    if(found) {
      setRestoreArray(restoreArray.filter(restore => restore!==id))
    } else {
      setRestoreArray([...restoreArray,id])
    }
  }

  const handleDialogClose=() => {
    setDialogType(null)
  }

  const renderPreview=() => {
    const image=(dialogType&&dialogType.data&&dialogType.data.Image)||'';
    const name=(dialogType&&dialogType.data&&dialogType.data.Name)||'';
    const body=(dialogType&&dialogType.data&&dialogType.data.Body)||'';
    return {
      showDivider: false,
      icon: (
        <div className={classes.dialogIconContent}>
          {'\uE0F8'}
        </div>
      ),
      content: (
        <Box className={classes.dialogBox}>
          <Card>
            {image?
              <CardMedia
                className={classes.cardMedia}
                image={image}
                title="Contemplative Reptile"
              />:null}
            <CardContent>
              <Typography variant="h5" component="h2">
                {name}
              </Typography>
              <Typography variant="body2" color="textSecondary" component="p">
                {body}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      ),
      renderButtons: () => (
        <Button
          variant='contained'
          size='small'
          onClick={handleDialogClose}
          className={clsx(
            classes.confirmButton,
            classes.dialogConfirmButton,
          )}>
          {t('common.confirm')}
        </Button>
      )
    };
  }

  const renderRestore=(data) => {
    return {
      title: t('notifications.restoreTitle'),
      showDivider: false,
      icon: (
        <div className={classes.dialogIconContent}>
          {'\uE185'}
        </div>
      ),
      content: (
        <Box
          className={clsx(classes.restorDialogContent,classes.dialogBox)}>
          { dialogType&&dialogType.type==='restore'&&dialogType.data.map(row => {
            const checked=restoreArray.includes(row.ID)
            return (
              <FormControlLabel
                key={row.ID}
                className={classes.restoreDialogCheckBoxLable}
                control={
                  <Checkbox
                    checked={checked}
                    onChange={handleChange(row.ID)}
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
      onConfirm: async () => {
        const res=await dispatch(restoreNotifications(restoreArray));
        if(!res.error) {
          dispatch(getNotificationData());
        }
        handleDialogClose();
      }
    }
  }

  const renderGroups=() => {
    return {
      title: t('campaigns.ShowGroupsTitle'),
      showDivider: false,
      icon: (
        <div className={classes.dialogIconContent}>
          {'\uE0D5'}
        </div>
      ),
      content: (
        <Box className={classes.dialogBox}>
          <Table>
            <TableHead >
              <TableRow>
                <TableCell>{t('notifications.groupName')}</TableCell>
                <TableCell align="center">{t('notifications.recipients')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dialogType&&dialogType.type==='groups'&&dialogType.data
                .map(group => {
                  return (
                    <TableRow key={group.Id}>
                      <TableCell>{group.GroupName}</TableCell>
                      <TableCell align="center">{group.Members}</TableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
        </Box>
      ),
      renderButtons: () => (
        <Button
          variant='contained'
          size='small'
          onClick={handleDialogClose}
          className={clsx(
            classes.gruopsDialogButton,
            classes.dialogConfirmButton,
          )}>
          {t('common.Ok')}
        </Button>
      )
    }
  }

  const renderGroupsById=() => {
    return {
      title: t('notifications.groupsByIdTitle'),
      showDivider: false,
      icon: (
        <div className={classes.dialogIconContent}>
          {'\uE0D5'}
        </div>
      ),
      content: (
        <Box
          className={clsx(classes.gruopsDialogContent,classes.dialogBox)}>
          {dialogType&&dialogType.type==='groupsById'&&dialogType.data
            .map(group => {
              return (
                <Typography
                  key={group.Id}
                  className={classes.gruopsDialogText}>
                  <FiberManualRecordIcon
                    className={classes.gruopsDialogBullet} />
                  {group.GroupName}
                </Typography>
              )
            })}
        </Box>
      ),
      renderButtons: () => (
        <Button
          variant='contained'
          size='small'
          onClick={handleDialogClose}
          className={clsx(
            classes.gruopsDialogButton,
            classes.dialogConfirmButton,
          )}>
          {t('common.Ok')}
        </Button>
      )
    }
  }

  const renderDelete=(ID) => {
    return {
      title: t('notifications.deleteTitle'),
      showDivider: false,
      icon: (
        <div className={classes.dialogIconContent}>
          {'\uE0D2'}
        </div>
      ),
      content: (
        <Box className={classes.dialogBox}>
          <Typography style={{fontSize: 18}}>
            {t('notifications.deleteConfirmation')}
          </Typography>
        </Box>
      ),
      onConfirm: async () => {
        handleDeleteNotification(ID);
      }
    }
  }

  const renderDuplicate=(ID) => {
    return {
      title: t('notifications.duplicateTitle'),
      showDivider: false,
      icon: (
        <div className={classes.dialogIconContent}>
          {'\uE038'}
        </div>
      ),
      content: (
        <Box className={classes.dialogBox}>
          <Typography style={{fontSize: 18}}>
            {t('notifications.duplicateConfirmation')}
          </Typography>
        </Box>
      ),
      onConfirm: async () => {
        handleDuplicate(ID);
      }
    }
  }

  const renderScriptCode=() => {
    let scriptCode=`&lt;script type="text/javascript"&gt;
    (function(d, t) {
        var g = d.createElement(t),
        s = d.getElementsByTagName(t)[0];
        g.src="#scriptSource#?d=" + Math.floor(Date.now() / 1000);
        g.setAttribute("key", #key#);
        #scriptpath#
        s.parentNode.insertBefore(g, s);
    }(document, "script"))
&lt;/script&gt;`;

    return scriptCode
      .replace("#key#",'"'+encodeURI(apiToken)+'"')
      .replace("&lt;","<")
      .replace("&gt;",">")
      .replace("&lt;","<")
      .replace("&gt;",">")
      .replace("#scriptSource#",baseUrl)
      .replace(
        "#scriptpath#",
        scriptDirectory!==0&&scriptPath!==''
          ? 'g.setAttribute("swfolder", "'+scriptPath+'");'
          :""
      )
      .replace(/(^[ \t]*\n)/gm,"");
  }

  const renderImplement=() => {
    return {
      title: t('notifications.implementTitle'),
      showDivider: false,
      icon: (
        <div className={classes.dialogIconContent}>
          {'\u005E'}
        </div>
      ),
      content: (
        <Box className={classes.dialogBox}>
          <Typography>
            1. {t('notifications.downloadThe')}
            <a target="_blank" rel="noreferrer" href="https://pn.pulseem.com/assets/scripts/service-worker.js" download>{t('notifications.attachedScript')}</a>
          </Typography>
          <hr />
          <Grid container direction={'row'} alignItems="center">
            <Typography>
              2. {t('notifications.chooseSaveLocation')}
            </Typography>
            <RadioGroup row value={scriptDirectory} onChange={handleScriptDirectory} className={classes.radioGroup}>
              <FormControlLabel
                key={Math.round(Math.random()*999999999)}
                value={0}
                control={<Radio color="primary" />}
                label={t("notifications.siteMainDirectory")}
              />
              <FormControlLabel
                key={Math.round(Math.random()*999999999)}
                value={1}
                control={<Radio color="primary" />}
                label={t("notifications.anotherDirectory")}
              />
            </RadioGroup>
          </Grid>
          {scriptDirectory===1?
            <Box>
              <Box className={classes.directoryField}>
                <Typography>{t("notifications.enterDirectory")}</Typography>
                <Typography variant="body2">{t("notifications.example")}: /examplefolder1/examplefodler2/</Typography>
              </Box>
              <TextField
                variant="outlined"
                size="small"
                fullWidth
                style={{maxWidth: 400}}
                onChange={handleScriptPathChange}
                value={scriptPath}
              />
            </Box>:null}
          <hr />
          <Typography>
            3. {t('notifications.copyLineCodeText')}
          </Typography>
          <Typography style={{fontWeight: 'bold',padding: '10px 0'}}>
            {t('notifications.payAttentionText')}
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={handleCopyScript}
            startIcon={<div className={classes.copyIcon}>{copyStatus? '\uE134':'\ue0b0'}</div>}
          >
            {copyStatus? t('notifications.copied'):t('notifications.copy')}
          </Button>
          <Typography style={{fontWeight: 'bold',fontSize: 14}}>
            {t('notifications.headTagOpenText')} {'<head>'}
          </Typography>
          <pre>
            <div ref={refScriptCode} style={{background: '#eee',fontSize: 12,wordBreak: 'break-all',overflow: 'auto'}}>
              {renderScriptCode()}
            </div>
          </pre>
          <Typography style={{fontWeight: 'bold',fontSize: 14}}>
            {t('notifications.headTagClosesText')} {'</head>'}
          </Typography>
        </Box>
      ),
      onConfirm: () => {
        dispatch(updateScriptPath(scriptPath));
      }
    }
  }

  const renderDialog=() => {
    if(!dialogType||!dialogType.data) {
      return;
    }

    let {data,type}=dialogType;


    const dialogContent={
      preview: renderPreview(data),
      duplicate: renderDuplicate(data),
      groupsById: renderGroupsById(data),
      groups: renderGroups(data),
      delete: renderDelete(data),
      restore: renderRestore(data),
      implement: renderImplement(data),
    }
    const dialog=dialogContent[type];
    return (
      <Dialog
        classes={classes}
        open={dialogType}
        onClose={handleDialogClose}
        {...dialog}>
        {dialog.content}
      </Dialog>
    );
  }

  return (
    <DefaultScreen
      currentPage='notifications'
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