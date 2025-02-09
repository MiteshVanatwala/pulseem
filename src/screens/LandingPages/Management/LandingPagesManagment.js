import { useState, useEffect, useRef } from 'react';
import DefaultScreen from '../../DefaultScreen'
import clsx from 'clsx';
import {
  Typography, Table, TableBody, TableRow, TableHead, TableCell, TableContainer,
  Grid, Button, TextField, Box, Link
} from '@material-ui/core'
import {
  DeleteIcon, DuplicateIcon, EditIcon,
  PreviewIcon, ReportsIcon, CopyIcon, EmbedCodeIcon, SettingIcon,
  SurveryResultsIcon
} from '../../../assets/images/managment/index'
import {
  TablePagination, ManagmentIcon, RestorDialogContent, PopMassage,
} from '../../../components/managment/index'
import {
  getLandingPagesData, restoreLandingPages, deleteLandingPage,
  duplicteLandingPage, downloadReport, getPageHeight,
  exportSurvey
} from '../../../redux/reducers/landingPagesSlice'
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Loader } from '../../../components/Loader/Loader';
import { setRowsPerPage } from '../../../redux/reducers/coreSlice';
import CustomTooltip from '../../../components/Tooltip/CustomTooltip'
import { CLIENT_CONSTANTS } from '../../../model/Clients/Contants';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import { Title } from '../../../components/managment/Title';
import { ConvertObjectToQueryString } from '../../../helpers/Utils/HtmlUtils';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { PulseemFeatures } from '../../../model/PulseemFields/Fields';
import { ExportFile } from '../../../helpers/Export/ExportFile';

import { sitePrefix } from '../../../config';
import { BEE_EDITOR_TYPES } from '../../../helpers/Constants';
import { FaChartPie } from "react-icons/fa";
import { ClearPageState, GetPageNyName, SetPageState } from '../../../helpers/UI/SessionStorageManager';


const LandingPagesesManagment = ({ classes }) => {
  const navigate = useNavigate()
  const { windowSize, rowsPerPage, isRTL, userRoles } = useSelector(state => state.core)
  const { accountFeatures } = useSelector(state => state.common);
  const { landingPagesData, landingPagesDeletedData } = useSelector(state => state.landingPages)
  const { t } = useTranslation()
  const [landingPageNameSearch, setLandingPageNameSearch] = useState('')
  const rowsOptions = [6, 10, 20, 50]
  const [page, setPage] = useState(1)
  const [isSearching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState(null)
  const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot }
  const cellStyle = { head: classes.tableCellHead, body: classes.tableCellBody, root: classes.tableCellRoot }
  const [dialogType, setDialogType] = useState(null)
  const [showCopied, setShowCopied] = useState(null)
  const [copyRef, setCopyRef] = useState(null)
  const [restoreArray, setRestoreArray] = useState([])
  const dispatch = useDispatch()
  const [showLoader, setLoader] = useState(true);

  const { state } = useLocation();
  const from = state?.from || "/";
  const pageProperty = useRef();

  const getData = async () => {
    await dispatch(getLandingPagesData())
    setLoader(false);
  }

  useEffect(() => {
    setLoader(true);
    reSearch();
  }, [dispatch])

  useEffect(() => {
    reSearch();
  }, [rowsPerPage]);

  const reSearch = () => {
    const queryState = from?.toLowerCase().indexOf('surveydetails') > -1;
    pageProperty.current = GetPageNyName('landingPagesManagement');
    let lastSearch = { PageSize: rowsPerPage };
    if (queryState && pageProperty.current) {
      let tempSearchData = pageProperty.current;
      lastSearch = {
        ...tempSearchData,
        PageNumber: tempSearchData.SearchTerm !== '' ? 1 : (pageProperty.current?.PageNumber || 1)
      };

      getData().then(() => {
        setLandingPageNameSearch(lastSearch.SearchTerm || landingPageNameSearch);
        if (lastSearch.SearchTerm && lastSearch.SearchTerm !== '') {
          handleSearch();
        }
        setPage((lastSearch?.SearchTerm && landingPageNameSearch) === '' ? lastSearch.PageNumber : 1);
      });
    }
    else {
      getData();
    }
  }

  const clearSearch = () => {
    setLandingPageNameSearch('');
    setSearchResults(null);
    setSearching(false);
    ClearPageState();
  }

  const handleSearch = () => {
    ClearPageState();
    const searchTxt = landingPageNameSearch !== '' ? landingPageNameSearch : (pageProperty.current && pageProperty.current?.SearchTerm);
    let sortData = landingPagesData?.filter((lp) => { return lp.Name.toLowerCase().indexOf(searchTxt.toLowerCase()) > -1 });
    setSearchResults(sortData);
    setSearching(true);
    setPage(1);

    SetPageState({
      "PageName": "landingPagesManagement",
      "PageNumber": 1,
      "SearchTerm": searchTxt
    });
  }

  const renderSearchLine = () => {
    const handleKeyDown = (event) => {
      if (event.keyCode === 13 || event.code === 'Enter') {
        handleSearch();
      }
    }


    // const handleKeyPress = (e) => {
    //   if (e.charCode === 13) {
    //     handleSearch()
    //   }
    // }

    const handleCampainNameChange = event => {
      setLandingPageNameSearch(event.target.value)
    }

    return (
      <Grid container spacing={2} className={clsx(windowSize === 'xs' || windowSize === 'sm' ? classes.mt15 : classes.lineTopMarging, 'searchLine')}>
        <Grid item>
          <TextField
            variant='outlined'
            size='small'
            value={landingPageNameSearch}
            onKeyPress={handleKeyDown}
            onChange={handleCampainNameChange}
            className={clsx(classes.textField, classes.minWidth252)}
            placeholder={t('landingPages.GridBoundColumnResource2.HeaderText')}
          />
        </Grid>

        <Grid item>
          <Button
            onClick={handleSearch}
            className={clsx(classes.btn, classes.btnRounded)}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}>
            {t('campaigns.btnSearchResource1.Text')}
          </Button>
        </Grid>
        {isSearching && <Grid item>
          <Button
            onClick={clearSearch}
            className={clsx(classes.btn, classes.btnRounded)}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}>
            {t('common.clear')}
          </Button>
        </Grid>}
      </Grid>
    )
  }

  const renderManagmentLine = () => {
    return (
      <Grid container spacing={2} className={clsx(classes.linePadding, classes.pb10)} >
        {windowSize !== 'xs' && <Grid item>
          <Button
            onClick={() => navigate(`${sitePrefix}LandingPages/Create`)}
            className={clsx(classes.btn, classes.btnRounded)}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
          >
            {t('landingPages.CreateNewResource.Text')}
          </Button>
        </Grid>}
        {windowSize !== 'xs' && <Grid item>
          <Button
            disabled={!landingPagesDeletedData || landingPagesDeletedData?.length === 0}
            className={clsx(classes.btn, classes.btnRounded)}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
            onClick={() => setDialogType({
              type: 'restore',
              data: landingPagesDeletedData
            })}>
            {t('campaigns.restoreDeleted')}
          </Button>
        </Grid>}
        <Grid item className={classes.groupsLableContainer} >
          <Typography className={classes.groupsLable}>
            {`${isSearching ? searchResults?.length : landingPagesData?.length} ${t('landingPages.landingPages')}`}
          </Typography>
        </Grid>
      </Grid>
    )
  }

  const renderTableHead = () => {
    return (
      <TableHead>
        <TableRow
          classes={rowStyle}>
          <TableCell
            classes={cellStyle}
            className={classes.flex2}
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
            classes={{ root: classes.tableCellRoot }}
            className={classes.flex6} />
        </TableRow>
      </TableHead>
    )
  }

  const onExportSurvey = async (id) => {
    const surveysResponse = await dispatch(exportSurvey(id));
    const surveys = surveysResponse?.payload;
    const fields = surveys?.length > 0 && Object.keys(surveys[0]);
    ExportFile({
      data: surveys,
      fileName: 'surveyReport',
      exportType: 'xls',
      fields: fields
    });
  }

  const onExportPayment = async (id) => {
    const purchasesResponse = await dispatch(downloadReport(id));
    const purchases = purchasesResponse?.payload;
    const fields = purchases?.length > 0 && Object.keys(purchases[0]);
    ExportFile({
      data: purchases,
      fileName: 'purchaseReport',
      exportType: 'xls',
      fields: fields
    });
  }

  const renderCellIcons = (row) => {
    const { ID, IsPayment, PageLink, SurveyCount, Type, PageUrl, IsSurvey, IsNewEditor } = row
    const copyDataObject = {
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
        copy: `<iframe src='${PageLink}' frameborder='0' style='overflow: auto;' width='100%' height='##pageHeight##'></iframe>`
      },
      4: {
        icon: EmbedCodeIcon,
        lable: t('landingPages.embedCode'),
        copy: `<div id='pulseem-parent'><img id='pulseem-close' onclick='pulseemClose()' src='https://www.pulseem.co.il/images/close_button.png' alt='' /><div id='pulseem-popup'><iframe src='${PageLink}' frameborder='0' width='100%' height='##pageHeight##'></iframe></div></div><style>#pulseem-parent { width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); display: block; position: fixed; } #pulseem-popup { width: 480px; margin: auto; position: absolute; left: 0px; right: 0px; top: 100px; border-radius: 10px; box-shadow: 0px 0px 5px #888; overflow: hidden; z-index: 1024; } #pulseem-close { margin: auto; position: absolute; right: -470px; left: 0px; top: 85px; cursor: pointer; z-index: 2048; }</style><script>function pulseemClose() { var wrapper = document.getElementById('pulseem-parent'); wrapper.parentNode.removeChild(wrapper); }</script>`
      }
    }

    const copyData = copyDataObject[1]
    const embedData = copyDataObject[Type < 3 ? 3 : Type];

    const renderCopyToClipoard = (
      showCopied === ID ?
        <PopMassage
          classes={classes}
          show={showCopied === ID}
          timeout={2000}
          label={t('common.copyClip')}
          innerRef={copyRef}
        /> : null
    )

    const iconsMap = [
      {
        key: IsNewEditor ? `${ID}_surveyGraph` : `${ID}_surveyExport`,
        uIcon: IsNewEditor ? FaChartPie : SurveryResultsIcon,
        lable: IsNewEditor ? t('landingPages.SurveyExportTitle') : `${t('landingPages.SurveyExportTitle')} (${SurveyCount})`,
        remove: (windowSize === 'xs' || (!IsSurvey || SurveyCount === 0)),
        onClick: () => {
          if (IsNewEditor) {
            navigate(`${sitePrefix}LandingPages/SurveyDetails/${ID}`, {
              state: {
                PageProperty: GetPageNyName('landingPagesManagement'),
              }
            })
          }
          else {
            onExportSurvey(ID);
          }
        },
        rootClass: classes.paddingIcon,
      },
      {
        key: `${ID}_purchase/survey`,
        uIcon: ReportsIcon,
        lable: t('landingPages.PurchaseExportTitle'),
        remove: (windowSize === 'xs' || !IsPayment),
        rootClass: clsx(classes.paddingIcon, classes.minWidth95),
        disable: accountFeatures?.indexOf(PulseemFeatures.LOCK_EXPORT_DATA) > -1,
        onClick: async () => {
          onExportPayment(ID);
        }
      },
      {
        key: 'settings',
        uIcon: SettingIcon,
        lable: t("recipient.settings"),
        remove: windowSize === 'xs',
        onClick: () => {
          navigate(`${sitePrefix}LandingPages/Create/${ID}`)
        },
        rootClass: classes.paddingIcon,
      },
      {
        key: 'preview',
        uIcon: PreviewIcon,
        lable: t('campaigns.Image1Resource1.ToolTip'),
        remove: windowSize === 'xs',
        disable: !PageLink,
        rootClass: classes.paddingIcon,
        onClick: () => {
          const previewLink = `${sitePrefix}previewer/landingpage/${ID}`;
          window.open(previewLink, '_blank');
        }
      },
      {
        key: 'edit',
        uIcon: EditIcon,
        lable: t('landingPages.EditResource1.HeaderText'),
        remove: windowSize === 'xs',
        href: IsNewEditor ? `${sitePrefix}editor/${BEE_EDITOR_TYPES.LANDING_PAGE}/${ID}` : `/Pulseem/NewWebForm/NewFormEdit/${ID}?fromreact=true`,
        rootClass: classes.paddingIcon,
      },
      {
        key: 'duplicate',
        uIcon: DuplicateIcon,
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
        uIcon: CopyIcon,
        lable: (copyData && copyData.lable) || '',
        rootClass: classes.minWidth95,
        text: (copyData && copyData.copy) || '',
        disable: !PageLink,
        type: 'copy',
        onClick: (e) => {
          setCopyRef(e.current)
          setShowCopied(ID)
          setTimeout(() => {
            setShowCopied(null)
          }, 1000)
        }
      },
      {
        key: 'embed',
        uIcon: CopyIcon,
        lable: (embedData && embedData.lable) || '',
        rootClass: classes.minWidth95,
        text: (embedData && embedData.copy) || '',
        disable: !PageLink,
        type: 'embed',
        onClick: async (e) => {
          let iframe = embedData.copy;
          const res = await dispatch(getPageHeight(ID));
          if (res.payload?.StatusCode === 201) {
            const height = res.payload?.Data;
            iframe = iframe.replace('##pageHeight##', height)
            navigator.clipboard.writeText(iframe);

            setCopyRef(e.current)
            setShowCopied(ID)
            setTimeout(() => {
              setShowCopied(null)
            }, 1000)
          }


        }
      },
      {
        key: 'delete',
        uIcon: DeleteIcon,
        lable: t('landingPages.GridButtonColumnResource1.HeaderText'),
        showPhone: true,
        remove: !userRoles?.AllowDelete,
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
        justifyContent={windowSize === 'xs' ? 'flex-start' : 'flex-end'}>
        {iconsMap.map(icon => (
          <Grid
            className={'rowIconContainer'}
            key={icon.key}
            item >
            <ManagmentIcon
              classes={classes}
              {...icon}
              uIcon={<icon.uIcon width={18} height={20} className={'rowIcon'} />}
            />
            {icon.key === 'copy' && renderCopyToClipoard}
          </Grid>
        ))}
      </Grid>
    )
  }

  const renderViewsCell = (views) => {
    return (
      <>
        <Typography
          className={classes.middleText}>
          {(views && views.toLocaleString()) || '0'}
        </Typography>
        <Typography
          className={classes.middleText}>
          {t('landingPages.ViewsResource1.HeaderText')}
        </Typography>
      </>
    )
  }

  const renderTemplateCell = (type) => {
    const types = {
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

  const renderGroupNames = () => {
    function createMarkup() {
      return { __html: `${t("common.Groups")}: ` };
    }
    return (
      <label dangerouslySetInnerHTML={createMarkup()} style={{ fontWeight: 400 }}></label>
    );
  }

  const seperateGroupNames = (groups) => {
    const splittedGroups = groups.split('##', -1);
    if (splittedGroups?.length === 1) {
      return splittedGroups.join().replace('#', '');
    }
    return splittedGroups.join(', ').replace('#', '');
  }

  const renderNameCell = (row) => {
    return (
      <>
        <CustomTooltip
          isSimpleTooltip={false}
          classes={classes}
          interactive={true}
          arrow={true}
          placement={'top'}
          title={<Typography noWrap={false}>{row.Name}</Typography>}
          text={row.Name}
        />
        <Typography
          className={classes.grayTextCell}>
          {row.GroupNames && row.GroupNames?.length > 0 && <span>{renderGroupNames()}<b>{seperateGroupNames(row.GroupNames)}</b></span>}
        </Typography>
      </>

    )
  }

  const renderSubscribersCell = ({ ID, Submits, Name }) => {
    const subscribtions = Submits && Submits > 0;
    return (
      <>
        <Link
          component='a'
          href={!userRoles?.HideRecipients && `${CLIENT_CONSTANTS.BASEURL}${ConvertObjectToQueryString({
            ...CLIENT_CONSTANTS.QUERY_PARAMS,
            CampaignID: ID,
            PageType: CLIENT_CONSTANTS.PAGE_TYPES.FormID,
            ResultTitle: `${t("common.clientSubscriptionResultTitle")} "${Name}"`
          })}`}
          style={{ cursor: subscribtions ? 'pointer' : null, textDecoration: subscribtions ? 'underline' : null }}
          onClick={(e) => {
            e.preventDefault();
            if (Submits && Submits > 0 && !userRoles?.HideRecipients) {
              navigate(CLIENT_CONSTANTS.BASEURL, {
                state: {
                  ...CLIENT_CONSTANTS.QUERY_PARAMS,
                  CampaignID: ID,
                  PageType: CLIENT_CONSTANTS.PAGE_TYPES.FormID,
                  ResultTitle: `${t("common.clientSubscriptionResultTitle")} "${Name}"`
                }
              })
            } else { return false }
          }
          }
          className={clsx(classes.middleText, classes.pt2, userRoles?.HideRecipients && classes.disabled)}>
          <Typography
            className={classes.middleText}>
            {(Submits && Submits.toLocaleString()) || 0}
          </Typography>
          {t('landingPages.SubmitsResource1.HeaderText')}
        </Link>
      </>
    )
  }

  const renderRow = (row) => {
    return (
      <TableRow
        style={{ alignItems: 'center' }}
        key={row.ID}
        classes={rowStyle}>
        <TableCell
          classes={cellStyle}
          align='center'
          className={classes.flex2}>
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
          classes={{ root: classes.tableCellRoot }}
          className={classes.flex6}>
          {renderCellIcons(row)}
        </TableCell>
      </TableRow>
    )
  }

  const renderPhoneRow = (row) => {
    return (
      <TableRow
        key={row.ID}
        component='div'
        classes={rowStyle}>
        <TableCell style={{ flex: 1 }} classes={{ root: clsx(classes.tableCellRoot, classes.tabelCellPadding) }}>
          <Box className={classes.inlineGrid}>
            {renderNameCell(row)}
          </Box>
          <Grid container justifyContent={'space-between'}>
            <Grid item container className={classes.widthUnset}>
              <Grid item className={clsx(classes.flexColumn2, classes.txtCenter, classes.pt14)}>
                {renderViewsCell(row.Views)}
              </Grid>
              <Grid item className={clsx(classes.flexColumn2, classes.txtCenter, classes.pt14)}>
                {renderSubscribersCell(row)}
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

  const renderTableBody = () => {
    let rpp = parseInt(rowsPerPage)
    const sortData = (isSearching ? searchResults : landingPagesData)?.slice((page - 1) * rpp, (page - 1) * rpp + rpp);
    if (!sortData?.length) {
      return (
        <Box className={clsx(classes.flex, classes.justifyCenterOfCenter)} style={{ height: 50 }} >
          <Typography>{t('common.NoDataTryFilter')}</Typography>
        </Box>
      )
    }
    return (
      <Box className='tableBodyContainer'>
        <TableBody>
          {sortData
            .map(windowSize === 'xs' ? renderPhoneRow : renderRow)}
        </TableBody>
      </Box>
    )
  }

  const renderTable = () => {
    return (
      <TableContainer className={classes.tableStyle}>
        <Table className={classes.tableContainer}>
          {windowSize !== 'xs' && renderTableHead()}
          {renderTableBody()}
        </Table>
      </TableContainer>
    )
  }

  const renderTablePagination = () => {
    const handleRowsPerPageChange = (val) => {
      dispatch(setRowsPerPage(val))
    }
    return (
      <TablePagination
        classes={classes}
        rows={isSearching ? searchResults?.length : landingPagesData?.length}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={rowsOptions}
        page={page}
        onPageChange={(e) => {
          SetPageState({
            "PageName": "landingPagesManagement",
            "PageNumber": e,
            "SearchTerm": landingPageNameSearch
          });
          setPage(e)
        }}
      />
    )
  }
  const handleChange = (id) => () => {
    const found = restoreArray.includes(id)
    console.log('restore', id, 'found:', found)
    if (found) {
      setRestoreArray(restoreArray.filter(restore => restore !== id))
    } else {
      setRestoreArray([...restoreArray, id])
    }
  }

  const handleClose = () => {
    setDialogType(null);
  }

  const getRestorDialog = (data = []) => {
    if (!data || !Array.isArray(data)) return null

    return {
      title: t('landingPages.restoreLandingPageTitle'),
      showDivider: false,
      icon: (
        <div className={clsx(classes.dialogIconContent, 'unicode')}>
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
        await dispatch(restoreLandingPages(restoreArray))
        setRestoreArray([]);
        getData()
      }
    }
  }

  const getDeleteDialog = (data = '') => ({
    title: t('landingPages.GridButtonColumnResource1.ConfirmTitle'),
    showDivider: false,
    content: (
      <Typography style={{ fontSize: 18 }}>
        {t('landingPages.GridButtonColumnResource1.ConfirmText')}
      </Typography>
    ),
    onConfirm: async () => {
      setLoader(true);
      handleClose()
      clearSearch()
      await dispatch(deleteLandingPage(data))
      getData()
      setLoader(false);
    }
  })

  const getDuplicateDialog = (data = '') => ({
    title: t('landingPages.dialogDuplicateTitle'),
    showDivider: false,
    content: (
      <Typography style={{ fontSize: 18 }}>
        {t('landingPages.dialogDuplicateContent')}
      </Typography>
    ),
    onConfirm: async () => {
      clearSearch()
      handleClose()
      setPage(1)
      setLoader(true);
      await dispatch(duplicteLandingPage(data))
      await getData()
      setLoader(false);
    }
  })

  // const getDuplicateSuccessfulDialog = (data = '') => ({
  //   paperStyle: classes.maxWidth540,
  //   childrenStyle: classes.duplicateSuccessMsg,
  //   title: t('landingPages.duplicationSuccessful'),
  //   showDivider: false,
  //   content: (
  //     <Typography style={{ fontSize: 18 }}>
  //       {t('landingPages.duplicationSuccessfulMessage')}
  //     </Typography>
  //   ),
  //   renderButtons: () => (
  //     <Box className={classes.spaceEvenly}>
  //       <Button
  //         variant='contained'
  //         size='small'
  //         onClick={handleClose}
  //         className={clsx(
  //           classes.gruopsDialogButton,
  //           classes.dialogCancelButton,
  //         )}>
  //         {t('common.Cancel')}
  //       </Button>
  //       <Button
  //         variant='contained'
  //         size='small'
  //         onClick={handleClose}
  //         href={`/Pulseem/NewWebForm/NewFormInfo/${data}`}
  //         className={clsx(
  //           classes.gruopsDialogButton,
  //           classes.dialogConfirmButton,
  //         )}>
  //         {t('common.Edit')}
  //       </Button>
  //     </Box>
  //   )
  // })

  const renderDialog = () => {
    const { data, type } = dialogType || {}
    const dialogContent = {
      restore: getRestorDialog(data),
      delete: getDeleteDialog(data),
      duplicate: getDuplicateDialog(data) //,
      // duplicateSuccessful: getDuplicateSuccessfulDialog(data)
    }

    const currentDialog = dialogContent[type] || {}
    return (
      dialogType && <BaseDialog
        classes={classes}
        open={dialogType}
        onClose={handleClose}
        onCancel={handleClose}
        {...currentDialog}>
        {currentDialog.content}
      </BaseDialog>
    )
  }
  return (
    <DefaultScreen
      currentPage='landingPages'
      classes={classes}
      containerClass={clsx(classes.management, classes.mb50)}>
      <Box className={'topSection'}>
        <Title Text={t('landingPages.logPageHeaderResource1.Text')} classes={classes} />
        {renderSearchLine()}
      </Box>
      {renderManagmentLine()}
      {renderTable()}
      {renderTablePagination()}
      {renderDialog()}
      <Loader isOpen={showLoader} />
    </DefaultScreen>
  )
}

export default LandingPagesesManagment