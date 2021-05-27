import React,{useState,useEffect} from 'react';
import DefaultScreen from './DefaultScreen'
import clsx from 'clsx';
import {
  Typography,Divider,Table,TableBody,TableRow,TableHead,TableCell,TableContainer,
  Grid,Button,TextField
} from '@material-ui/core'
import {
  DeleteIcon,DuplicateIcon,EditIcon,SearchIcon,
  PreviewIcon,ReportsIcon,CopyIcon,EmbedCodeIcon,SurveryResultsIcon
} from '../assets/images/managment/index'
import {
  TablePagination,ManagmentIcon,RestorDialogContent,Dialog,PopMassage,SearchField
} from '../components/managment/index'
import {
  getLandingPagesData,restoreLandingPages,deleteLandingPage,
  duplicteLandingPage,downloadReport
} from '../redux/reducers/landingPagesSlice'
import useCtrlHistory from '../helpers/useCtrlHistory'
import {openInNewTab} from '../helpers/functions'
import {Link} from "react-router-dom";
import {useSelector,useDispatch} from 'react-redux'
import {useTranslation} from 'react-i18next'
import Ellipsis from 'react-ellipsis-pjs';
import ClearIcon from '@material-ui/icons/Clear'

const LandingPagesesManagmentScreen=({classes}) => {
  const {windowSize}=useSelector(state => state.core)
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
  const [copyRef,setCopyRef]=useState(null)
  const [restoreArray,setRestoreArray]=useState([])
  const history=useCtrlHistory()
  const dispatch=useDispatch()

  const getData=() => {
    dispatch(getLandingPagesData())
  }

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

  const clearSearch=() => {
    setLandingPageNameSearch('');
    setSearchArray(null);
  }

  const renderSearchLine=() => {
    const handleSearch=() => {
      setSearchArray([{
        type: 'name',
        campaignName: landingPageNameSearch
      }]);
      setPage(1);
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
            href='/Pulseem/LandingPageWizard.aspx'
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
            {t("landingPages.GridBoundColumnResource2.HeaderText")}
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
            className={classes.flex5} />
        </TableRow>
      </TableHead>
    )
  }

  const renderCellIcons=(row) => {
    const {ID,IsPayment,PageLink,SurveyCount,Type,PageUrl}=row
    const copyDataObject={
      1: {
        icon: CopyIcon,
        lable: t('landingPages.copyLink'),
        copy: PageUrl
      },
      2: {
        icon: CopyIcon,
        lable: t('landingPages.copyLink'),
        copy: PageUrl
      },
      3: {
        icon: EmbedCodeIcon,
        lable: t('landingPages.embedCode'),
        copy: `<iframe src='${PageLink}' frameborder='0' style='overflow: auto;' width='100%' height='386'></iframe>`
      },
      4: {
        icon: EmbedCodeIcon,
        lable: t('landingPages.embedCode'),
        copy: `<div id='pulseem-parent'><img id='pulseem-close' onclick='pulseemClose()' src='https://www.pulseemdev.co.il/images/close_button.png' alt='' /><div id='pulseem-popup'><iframe src='${PageLink}' frameborder='0' width='100%' height='320px'></iframe></div></div><style>#pulseem-parent { width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); display: block; position: fixed; } #pulseem-popup { width: 480px; margin: auto; position: absolute; left: 0px; right: 0px; top: 100px; border-radius: 10px; box-shadow: 0px 0px 5px #888; overflow: hidden; z-index: 1024; } #pulseem-close { margin: auto; position: absolute; right: -470px; left: 0px; top: 85px; cursor: pointer; z-index: 2048; }</style><script>function pulseemClose() { var wrapper = document.getElementById('pulseem-parent'); wrapper.parentNode.removeChild(wrapper); }</script>`
      }
    }

    const copyData=copyDataObject[Type]
    const renderCopyToClipoard=(
      showCopied===ID?
      <PopMassage
        classes={classes}
        show={showCopied===ID}
        timeout={2000}
        label={t('common.copyClip')}
        innerRef={copyRef}
      /> : null
    )

    const iconsMap=[
      {
        key: 'purchase/survey',
        icon: IsPayment? ReportsIcon:SurveryResultsIcon,
        lable: IsPayment?
          t('landingPages.PurchaseExportTitle')
          :`${t('landingPages.SurveyExportTitle')} (${SurveyCount})`,
        remove: (!IsPayment&&SurveyCount===0)||windowSize==='xs',
        rootClass: classes.paddingIcon,
        onClick: async () => {
          if(IsPayment) {
            dispatch(downloadReport(row))
          }
        }
      },
      {
        key: 'preview',
        icon: PreviewIcon,
        remove: windowSize==='xs',
        lable: t('campaigns.Image1Resource1.ToolTip'),
        rootClass: classes.paddingIcon,
        onClick: () => {
          openInNewTab(PageLink)
        }
      },
      {
        key: 'edit',
        icon: EditIcon,
        remove: windowSize==='xs',
        lable: t('landingPages.EditResource1.HeaderText'),
        href: `/Pulseem/NewWebForm/NewFormEdit/${ID}`,
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
        key: 'copy',
        icon: (copyData&&copyData.icon)||null,
        lable: (copyData&&copyData.lable)||'',
        rootClass: classes.minWidth95,
        text: (copyData&&copyData.copy)||'',
        type: 'copy',
        onClick: (e) => {
          setCopyRef(e.current)
          setShowCopied(ID)
          setTimeout(() => {
            setShowCopied(null)
          },1000)
        }
      },
      {
        key: 'delete',
        icon: DeleteIcon,
        lable: t('landingPages.GridButtonColumnResource1.HeaderText'),
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
        spacing={2}
        justify={windowSize==='xs'? 'flex-start':'flex-end'}>
        {iconsMap.map(icon => (
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
    )
  }

  const renderViewsCell=(views) => {
    return (
      <>
        <Typography
          className={classes.middleText}>
          {(views&&views.toLocaleString())||0}
        </Typography>
        <Typography
          className={classes.middleText}>
          {t('landingPages.ViewsResource1.HeaderText')}
        </Typography>
      </>
    )
  }

  const renderTemplateCell=(type) => {
    const types={
      1: t('landingPages.WebForm'),
      2: t('landingPages.StaticPage'),
      3: t('landingPages.HtmlPage'),
      4: t('landingPages.Popup')
    }

    return (
      <>
        <Typography
          className={classes.middleText}>
          {types[type]}
        </Typography>
      </>
    )
  }

  const renderNameCell=(row) => {
    return (
      <>
        <Typography noWrap={false} className={classes.nameEllipsis}>
          {row.Name}
        </Typography>
        <Typography
          className={classes.grayTextCell}>
          {row.GroupNames&&row.GroupNames.join(', ')}
        </Typography>
      </>

    )
  }

  const renderSubscribersCell=({ID,Submits}) => {
    return (
      <>
        <Typography
          className={classes.middleText}>
          {(Submits&&Submits.toLocaleString())||0}
        </Typography>
        <a
          href={`/Pulseem/ClientSearchResult.aspx?FormID=${ID}`}
          className={classes.middleText}>
          {t('landingPages.SubmitsResource1.HeaderText')}
        </a>
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
          {renderTemplateCell(row.Type)}
        </TableCell>
        <TableCell
          classes={cellStyle}
          align='center'
          className={classes.flex1}>
          {renderViewsCell(row.Views)}
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
          {renderNameCell(row)}
          <Grid container justify='space-between' alignItems='center' >
            <Grid item style={{textAlign: 'center'}}>
              <Grid container spacing={4} >
                <Grid item >
                  {renderViewsCell(row.Views)}
                </Grid>
                <Grid item>
                  {renderSubscribersCell(row)}
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              {renderCellIcons(row)}
            </Grid>
          </Grid>
        </TableCell>
      </TableRow>
    )
  }

  const renderTableBody=() => {
    const filtersObject={
      name: (row,values) => {
        return String(row.Name.toLowerCase()).startsWith(values.campaignName.toLowerCase());
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
        rows={landingPagesData.length}
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
    console.log('restore',id,'found:',found)
    if(found) {
      setRestoreArray(restoreArray.filter(restore => restore!==id))
    } else {
      setRestoreArray([...restoreArray,id])
    }
  }

  const handleClose=() => {
    setDialogType(null);
    setRestoreArray([]);
  }

  const getRestorDialog=(data=[]) => {
    if(!data||!Array.isArray(data)) return null

    return {
      title: t('landingPages.restoreLandingPageTitle'),
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
        />
      ),
      onConfirm: async () => {
        await dispatch(restoreLandingPages(restoreArray))
        getData()
        handleClose()
      }
    }
  }

  const getDeleteDialog=(data='') => ({
    title: t('landingPages.GridButtonColumnResource1.ConfirmTitle'),
    showDivider: false,
    content: (
      <Typography style={{fontSize: 18}}>
        {t('landingPages.GridButtonColumnResource1.ConfirmText')}
      </Typography>
    ),
    onConfirm: async () => {
      await dispatch(deleteLandingPage(data))
      getData()
      handleClose()
      clearSearch()
    }
  })

  const getDuplicateDialog=(data='') => ({
    title: t('landingPages.dialogDuplicateTitle'),
    showDivider: false,
    content: (
      <Typography style={{fontSize: 18}}>
        {t('landingPages.dialogDuplicateContent')}
      </Typography>
    ),
    onConfirm: async () => {
      await dispatch(duplicteLandingPage(data))
      getData()
      handleClose()
      clearSearch()
    }
  })

  const renderDialog=() => {
    const {data,type}=dialogType||{}

    const dialogContent={
      restore: getRestorDialog(data),
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
      currentPage='landingPages'
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

export default LandingPagesesManagmentScreen