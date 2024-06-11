import { useState, useEffect } from 'react';
import DefaultScreen from '../../DefaultScreen'
import clsx from 'clsx';
import {
  Typography, Table, TableBody, TableRow, TableHead, TableCell, TableContainer,
  Grid, Button, TextField, Box, FormControlLabel, Checkbox
} from '@material-ui/core'
import {
  AutomationIcon, DeleteIcon, DuplicateIcon, EditIcon,
  GroupsIcon, PreviewIcon, ReportsIcon, CopyIcon, SendIcon
} from '../../../assets/images/managment/index'
import {
  TablePagination, ManagmentIcon, DateField, PopMassage, RestorDialogContent
} from '../../../components/managment/index'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import {
  restoreCampaigns, deleteCampaign, duplicteCampaign, resetNewsletterInfo,
  getNewslatterParentChildData
} from '../../../redux/reducers/newsletterSlice'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import 'moment/locale/he'
import { pulseemNewTab } from '../../../helpers/Functions/functions';
import { Loader } from '../../../components/Loader/Loader';
import { setRowsPerPage } from '../../../redux/reducers/coreSlice';
import CustomTooltip from '../../../components/Tooltip/CustomTooltip';
import { useNavigate } from 'react-router-dom';
import { setCookie, getCookie } from '../../../helpers/Functions/cookies';
import { Title } from '../../../components/managment/Title';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import { PulseemFeatures } from '../../../model/PulseemFields/Fields';
import { MdArrowBackIos, MdArrowForwardIos, MdError, MdOutlineAddCircleOutline, MdOutlineRemoveCircleOutline } from 'react-icons/md';
import { sitePrefix } from '../../../config';
import VerificationDialog from '../../../components/DialogTemplates/VerificationDialog';
import { CloneOptions } from '../../../Models/Campaigns/CloneOptions';
import { getAuthorizedEmails } from '../../../redux/reducers/commonSlice';
import { getPublicTemplates, getAllTemplatesBySubaccountId } from '../../../redux/reducers/campaignEditorSlice';
import DuplicateCampaign from '../../../components/Campaigns/DuplicateCampaign';
import Toast from '../../../components/Toast/Toast.component';
import { getGroupsBySubAccountId } from '../../../redux/reducers/groupSlice';
import DomainVerification from '../../../Shared/Dialogs/DomainVerification';
import { IsSharedDomain } from '../../../helpers/Functions/DomainVerificationHelper';
import { SEND_1 } from '../../../helpers/Constants';

const NewsletterManagnentScreen = ({ classes }) => {
  const { accountFeatures, verifiedEmails } = useSelector(state => state.common);
  const { language, windowSize, rowsPerPage, isRTL } = useSelector(state => state.core)
  const { newslettersDeletedData, newslettersParentCampaigns, newslettersChildCampaigns } = useSelector(state => state.newsletter)
  const { ToastMessages } = useSelector(state => state.client);
  const { t } = useTranslation()
  const [fromDate, handleFromDate] = useState(null);
  const [toDate, handleToDate] = useState(null)
  const [campaineNameSearch, setCampaineNameSearch] = useState('')
  const rowsOptions = [6, 10, 20, 50]
  const [page, setPage] = useState(1)
  const [isSearching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot }
  const cellStyle = { head: classes.tableCellHead, body: classes.tableCellBody, root: classes.tableCellRoot }
  const [dialogType, setDialogType] = useState(null)
  const [showCopied, setShowCopied] = useState(null)
  const [copyRef, setCopyRef] = useState(null)
  const [restoreArray, setRestoreArray] = useState([])
  const [showLoader, setLoader] = useState(true);
  const dateFormat = 'YYYY-MM-DD HH:mm:ss.FFF'
  const dispatch = useDispatch();
  const [hideDuplicateCautionMessage, setHideDuplicateCautionMessage] = useState(false)
  const navigate = useNavigate();
  const [duplicateOptions, setDuplicateOptions] = useState([])
  const { publicTemplates } = useSelector(state => state.campaignEditor);
  const [duplicateDialog, setDuplicateDialog] = useState({});
  const [toastMessage, setToastMessage] = useState(null);
  const [showDomainVerification, setShowDomainVerification] = useState(false);
  const [verificationDialog, setVerificationDialog] = useState(false)
  const [domainAddressError, setDomainAddressError] = useState({
    display: false,
    address: '',
    verifySharedCallback: null,
    isSummary: false,
    isFullDescription: false,
    preText: '',
    showSkip: false
  });
  const [ expandedIds, setExpandedIds ] = useState([]);
  const [ parentCampaignsWithChild, setParentCampaignsWithChild ] = useState([]);

  moment.locale(language);

  const renderToast = () => {
    if (toastMessage) {
      setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return (
        <Toast data={toastMessage} />
      );
    }
    return null;
  }
  

  const getData = async () => {
    await dispatch(getNewslatterParentChildData())
    dispatch(getAuthorizedEmails());
    setLoader(false);
  }

  useEffect(() => {
    setLoader(true);
    getData();
  }, [dispatch]);

  useEffect(() => {
    if (!publicTemplates.length) dispatch(getPublicTemplates(isRTL));
    dispatch(getAllTemplatesBySubaccountId());
  }, [])

  useEffect(() => {
    dispatch(getPublicTemplates(isRTL));
  }, [isRTL])

  useEffect(() => {
    let ids = [];
    if (newslettersChildCampaigns.length > 0) {
      ids = newslettersParentCampaigns.reduce((prevVal, campaign) => {
        const isExist = newslettersChildCampaigns.filter((childCampaign) => childCampaign?.ParentCampaignId === campaign?.CampaignID).length;
        return isExist ? [...prevVal, campaign?.CampaignID] : prevVal;
      }, []);
    }
    setParentCampaignsWithChild(ids);
  }, [ newslettersParentCampaigns, newslettersChildCampaigns ]);

  const clearSearch = () => {
    setCampaineNameSearch('');
    handleFromDate(null);
    handleToDate(null);
    setSearchResults(null);
    setSearching(false);
  }

  useEffect(() => {
    if (duplicateOptions.indexOf(CloneOptions.Groups) === -1 && duplicateOptions.indexOf(CloneOptions.Pulses) !== -1) {
      handleDuplicateOptions(CloneOptions.Pulses);
    }
  }, [duplicateOptions])

  const renderSearchLine = () => {
    const handleKeyDown = (event) => {
      if (event.keyCode === 13 || event.key === 'Enter') {
        handleSearch();
      }
    }
    const handleSearch = () => {
      const searchArray = [{
        type: 'name',
        campaineName: campaineNameSearch
      }, {
        type: 'date',
        fromDate,
        toDate
      }];

      const filtersObject = {
        name: (row, values) => {
          return String(row.Name.toLowerCase()).includes(values.campaineName.toLowerCase());
        },
        date: (row, values) => {
          const { UpdatedDate, SendDate } = row
          const lastUpdate = SendDate ?
            moment(SendDate, dateFormat).valueOf()
            : moment(UpdatedDate, dateFormat).valueOf()
          const startFromDate = (values.fromDate && moment(values.fromDate).hour(0).minute(0).valueOf()) ?? null
          const endToDate = (values.toDate && moment(values.toDate).hour(23).minute(59).valueOf()) ?? null

          if (!values)
            return true
          if (fromDate && toDate && startFromDate && endToDate)
            return ((lastUpdate >= startFromDate) && (lastUpdate <= endToDate))
          if (fromDate && startFromDate)
            return (lastUpdate >= startFromDate)
          if (toDate && endToDate)
            return (lastUpdate <= endToDate)
          return true
        }
      }

      let sortData = newslettersParentCampaigns
      searchArray.forEach(values => {
        sortData = sortData.filter(row => filtersObject[values.type](row, values))
      });
      setSearchResults(sortData);
      setSearching(true);
      setPage(1);
    }

    const handleKeyPress = (e) => {
      if (e.charCode === 13) {
        handleSearch()
      }
    }

    const handleFromDateChange = (value) => {
      if (value > toDate) {
        handleToDate(null);
      }
      handleFromDate(value);
    }

    const handleCampainNameChange = event => {
      setCampaineNameSearch(event.target.value)
    }

    return (
      <Grid container spacing={2} className={clsx(windowSize === 'xs' || windowSize === 'sm' ? classes.mt15 : classes.lineTopMarging, 'searchLine')}>
        <Grid item>
          <TextField
            variant='outlined'
            size='small'
            value={campaineNameSearch}
            onKeyPress={handleKeyDown}
            onChange={handleCampainNameChange}
            className={clsx(classes.textField, classes.minWidth252)}
            placeholder={t('common.CampaignName')}
          />
        </Grid>

        {windowSize !== 'xs' ?
          <Grid item>
            <DateField
              toolbarDisabled={false}
              classes={classes}
              value={fromDate}
              onChange={handleFromDateChange}
              placeholder={t('mms.locFromDateResource1.Text')}
            />
          </Grid>
          : null}

        {windowSize !== 'xs' ?
          <Grid item>
            <DateField
              toolbarDisabled={false}
              classes={classes}
              value={toDate}
              onChange={handleToDate}
              placeholder={t('mms.locToDateResource1.Text')}
              minDate={fromDate ? fromDate : undefined}
            />
          </Grid>
          : null}

        <Grid item>
          <Button
            onClick={handleSearch}
            className={clsx(classes.searchButton, classes.btn, classes.btnRounded)}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}>
            {t('campaigns.btnSearchResource1.Text')}
          </Button>
        </Grid>
        {isSearching && <Grid item>
          <Button
            onClick={clearSearch}
            className={clsx(classes.searchButton, classes.btn, classes.btnRounded)}
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
            component="a"
            onClick={() => {
              navigate(`${sitePrefix}Campaigns/Create`);
            }}
            className={clsx(
              classes.btn,
              classes.btnRounded,
            )}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
          >
            {t('campaigns.create')}
          </Button>
        </Grid>}
        {windowSize !== 'xs' && <Grid item>
          <Button
            className={clsx(
              classes.btn,
              classes.btnRounded,
            )}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
            onClick={() => setDialogType({
              type: 'restore',
              data: newslettersDeletedData
            })}>
            {t('campaigns.restoreDeleted')}
          </Button>
        </Grid>}
        <Grid item xs={windowSize === 'xs' && 12}>
          <Button
            component="a"
            href={`${sitePrefix}Campaigns/Archive`}
            className={clsx(
              classes.btn,
              classes.btnRounded,
            )}
            onClick={(e) => {
              e.preventDefault();
              navigate(`${sitePrefix}Campaigns/Archive`)
            }}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
          >
            {t('master.redirectToArchive')}
          </Button>
        </Grid>
        <Grid item xs={windowSize === 'xs' && 12}>
          <Button
            className={clsx(
              classes.btn,
              classes.btnRounded,
            )}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
            onClick={() => setDialogType({ type: 'verifyEmail' })}
          >
            {t('campaigns.newsLetterMgmt.emailVerification.emailVerificationBtnText')}
          </Button>
        </Grid>
        <Grid item xs={windowSize === 'xs' && 12} className={classes.groupsLableContainer} >
          <Typography className={classes.groupsLable}>
            {`${isSearching ? searchResults.length : newslettersParentCampaigns.length} ${t('campaigns.newsletters')}`}
          </Typography>
        </Grid>
      </Grid>
    )
  }

  const renderTableHead = () => {
    return (
      <TableHead>
        <TableRow classes={rowStyle}>
          <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t("common.CampaignName")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("campaigns.recipients")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("campaigns.lblCampaignStatusResource1.Text")}</TableCell>
          <TableCell classes={{ root: classes.tableCellRoot }} className={classes.flex6} ></TableCell>
        </TableRow>
      </TableHead>
    )
  }

  const renderCellIcons = (row) => {
    const { Status, Groups, AutomationID, CampaignID, shareUrl, AutomationTriggerInActive, IsNewEditor, FromEmail, IsBasicEditor } = row

    const cautionPopup = getCookie('showCautionDuplicateCampaign');
    const showCautionNewEditor = !IsNewEditor && (cautionPopup !== "false" ?? false);
    const emailProps = verifiedEmails?.filter((ve) => { return ve?.Number === FromEmail })[0];

    const campaignSettingsUrl = `/react/Campaigns/Create/${CampaignID}`;
    const editUrlArray = { NEW: `/react/Campaigns/Editor/${CampaignID}`, OLD: `/Pulseem/Editor/CampaignEdit/${CampaignID}?fromreact=true`, BASIC: `/Pulseem/CampaignEdit.aspx?CampaignID=${CampaignID}&Culture=he-IL&fromreact=true` };

    const domainErrorObj = {
      display: false,
      address: FromEmail,
      verifySharedCallback: null,
      isSummary: false,
      isFullDescription: false,
      preText: t(`common.domainVerification.campaignManagement.send.${emailProps?.IsRestricted ? 'restricted' : 'nonVerified'}.preText`).replace('##campaignId##', CampaignID),
      showSkip: false,
      options: null
    }

    const renderCopyToClipoard = (
      showCopied === CampaignID ?
        <PopMassage
          classes={classes}
          show={showCopied === CampaignID}
          timeout={2000}
          label={t('common.copyClip')}
          innerRef={copyRef}
        /> : null
    )

    const iconsMap = [[
      {
        key: 'preview',
        uIcon: PreviewIcon,
        lable: t('campaigns.Image1Resource1.ToolTip'),
        remove: windowSize === 'xs',
        rootClass: classes.paddingIcon,
        onClick: () => {
          pulseemNewTab(`PreviewCampaign.aspx?CampaignID=${CampaignID}&fromreact=true`)
        }
      },
      {
        key: 'edit',
        uIcon: EditIcon,
        disable: Status !== 1 || AutomationID !== 0,
        lable: t('campaigns.Image2Resource1.ToolTip'),
        remove: windowSize === 'xs',
        onClick: () => {
          if ((!emailProps?.IsVerified || emailProps?.IsRestricted) && !IsSharedDomain(FromEmail)) {
            domainErrorObj.preText = t(`common.domainVerification.campaignManagement.edit.${emailProps?.IsRestricted ? 'restricted' : 'nonVerified'}.preText`).replace('##campaignId##', CampaignID);
            if (!IsBasicEditor) {
              domainErrorObj.options = [{
                text: t('campaigns.newsletterSetUp'),
                onCallback: () => {
                  navigate(campaignSettingsUrl)
                }
              },
              {
                text: t('campaigns.skipToEditor'),
                onCallback: () => {
                  if (row.IsNewEditor && accountFeatures.indexOf(PulseemFeatures.BEE_EDITOR) > -1) {
                    navigate(editUrlArray.NEW)
                  }
                  else {
                    window.location = editUrlArray.OLD
                  }
                }
              }];
            }
            else {
              domainErrorObj.options = [{
                text: t('campaigns.newsletterSetUp'),
                onCallback: () => {
                  window.location = editUrlArray.BASIC
                }
              }]
            }
            setDomainAddressError(domainErrorObj);
            setShowDomainVerification(true)
          }
          else {
            dispatch(resetNewsletterInfo());
            if (row.IsNewEditor && accountFeatures.indexOf(PulseemFeatures.BEE_EDITOR) > -1) {
              navigate(editUrlArray.NEW)
            }
            else {
              window.location = editUrlArray.OLD
            }
          }
        },
        rootClass: classes.paddingIcon,
      },
      {
        key: 'duplicate',
        uIcon: DuplicateIcon,
        lable: t('campaigns.lnkEditResource1.ToolTip'),
        rootClass: classes.paddingIcon,
        onClick: () => {
          if (showCautionNewEditor && accountFeatures.indexOf(PulseemFeatures.BEE_EDITOR) > -1) {
            setDialogType({
              type: 'cautionEditorChange',
              data: { CampaignID: CampaignID }
            });
          } else {
            const campaign = newslettersParentCampaigns?.find((e) => { return parseInt(e.CampaignID) === parseInt(CampaignID) });
            setDuplicateDialog({
              id: CampaignID,
              name: campaign?.Name
            });
          }
        }
      },
      {
        key: 'groups',
        uIcon: GroupsIcon,
        disable: Groups && Groups.length === 0,
        lable: t('campaigns.lnkPreviewResource1.ToolTip'),
        remove: windowSize === 'xs',
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
        uIcon: CopyIcon,
        lable: t('campaigns.CloneResource1.HeaderText'),
        noWrap: true,
        rootClass: classes.paddingIcon,
        text: shareUrl || '',
        type: 'copy',
        onClick: (e) => {
          setCopyRef(e.current)
          setShowCopied(CampaignID)
          setTimeout(() => {
            setShowCopied(null)
          }, 1000)
        }
      },
      {
        key: 'reports',
        uIcon: ReportsIcon,
        disable: Status === 1,
        lable: t('campaigns.Reports'),
        remove: windowSize === 'xs',
        href: `/Pulseem/CampaignStatistics.aspx?CampaignID=${CampaignID}&fromreact=true`,
        rootClass: classes.paddingIcon,
      },
      {
        key: 'automation',
        uIcon: AutomationIcon,
        disable: AutomationID === 0,
        lable: t('campaigns.automation'),
        remove: windowSize === 'xs',
        onClick: () => {
          pulseemNewTab(`CreateAutomations.aspx?Mode=show&AutomationID=${AutomationID}&fromreact=true&Culture=${isRTL ? 'he-IL' : 'en-US'}`)
        },
        rootClass: classes.paddingIcon,
      },
      {
        key: 'delete',
        uIcon: DeleteIcon,
        lable: t('campaigns.DeleteResource1.HeaderText'),
        rootClass: classes.paddingIcon,
        disable: AutomationID !== 0,
        showPhone: true,
        onClick: () => {
          setDialogType({
            type: 'delete',
            data: CampaignID
          })
        }
      },
      {
        key: 'send',
        uIcon: SendIcon,
        lable: t('campaigns.imgSendResource1.ToolTip'),
        remove: Status !== 1 || (AutomationID !== 0 && AutomationTriggerInActive === false),
        rootClass: clsx(classes.sendIcon, 'sendIcon'),
        textClass: classes.sendIconText,
        errorElement: (!emailProps?.IsVerified || emailProps?.IsRestricted) === true && !IsSharedDomain(FromEmail) && Status === 1 && <MdError
          title={t('campaigns.imgSendResource1.nonVerifiedDomain')}
          className={classes.errorIcon}
        />,
        onClick: () => {
          if ((!emailProps?.IsVerified || emailProps?.IsRestricted) && !IsSharedDomain(FromEmail)) {
            if (!IsBasicEditor) {
              domainErrorObj.options = [{
                text: t('campaigns.newsletterSetUp'),
                onCallback: () => {
                  navigate(campaignSettingsUrl);
                }
              }];
            }
            setDomainAddressError(domainErrorObj);
            setShowDomainVerification(true)
          }
          else {
            dispatch(resetNewsletterInfo());
            dispatch(getGroupsBySubAccountId());
            navigate(`/react/Campaigns/SendSettings/${CampaignID}`);
          }
        }
      },
    ]]
    return (
      <Grid
        container
        direction={windowSize === 'sm' ? 'column' : 'row'}
        justifyContent={windowSize === 'xs' ? 'flex-start' : 'flex-end'}>
        {iconsMap.map((map, index) => (
          <Grid
            key={index}
            item>
            <Grid
              container
              className={windowSize === 'xs' ? classes.mt1 : ''}
            >
              {map.map(icon => (
                <Grid
                  style={{ flex: 1, alignItems: 'center', position: 'relative' }}
                  className={clsx(icon.disable && classes.disabledCursor, 'rowIconContainer', classes.justifyCenter, classes.alignSelfCenter)}
                  key={icon.key}
                  item>
                  {icon?.errorElement}
                  <ManagmentIcon
                    classes={classes}
                    {...icon}
                    uIcon={<icon.uIcon width={18} height={20} className={'rowIcon'} />}
                  />
                  {icon.key === 'copy' && renderCopyToClipoard}
                </Grid>
              ))}
            </Grid>
          </Grid>
        ))}
      </Grid>
    )
  }

  const renderStatusCell = (status) => {
    const statuses = {
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
            [classes.recipientsStatusCreated]: status === 1,
            [classes.recipientsStatusSent]: status === 4,
            [classes.recipientsStatusSending]: status === 2,
            [classes.recipientsStatusCanceled]: status === 5
          }
        )}>
          {t(statuses[status])}
        </Typography>
      </>
    )
  }

  const renderRecipientsCell = (recipients) => {

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

  const renderNameCell = (row, isParent = false) => {
    let date = null
    let text = ''
    let separator = windowSize === 'xs' ? ":" : "";
    if (!row.SendDate || row.Status === 1) {
      date = moment(row.UpdatedDate, dateFormat)
      text = t('common.UpdatedOn')
    } else {
      date = moment(row.SendDate, dateFormat)
      const dateMillis = date.valueOf()
      const currentDateMillis = moment().valueOf()
      text = dateMillis > currentDateMillis ? t('common.ScheduledFor') : t('common.SentOn')
    }
    const isParentCampaignWithChild = parentCampaignsWithChild.indexOf(row.CampaignID) > -1;

    return (
      <>
        <CustomTooltip
          isSimpleTooltip={false}
          classes={classes}
          interactive={true}
          arrow={true}
          placement={'top'}
          title={<Typography noWrap={false}>{row.Name}</Typography>}
          text={!(expandedIds.indexOf(row.CampaignID) > -1 && isParent) && <div>{isParentCampaignWithChild && isParent ? row.Name.replace(SEND_1, '') : row.Name}</div>}
        />
          <Grid container wrap="nowrap">
            <Grid item md={1}>
              {
                isParentCampaignWithChild && isParent && <>
                  {
                    expandedIds.indexOf(row.CampaignID) === -1
                    ? <MdOutlineAddCircleOutline className={clsx(classes.f20, classes.p5, classes.cursorPointer)} onClick={() => setExpandedIds([...expandedIds, row.CampaignID])} />
                    : <MdOutlineRemoveCircleOutline className={clsx(classes.f20, classes.p5, classes.cursorPointer)} onClick={() => setExpandedIds(expandedIds.filter((id) => id !== row.CampaignID))} />
                  }
                </>
              }
            </Grid>
            {
              !(expandedIds.indexOf(row.CampaignID) > -1 && isParent) ? (
                <Grid item md={11}>
                  <Typography className={classes.f14}>
                    {`${t("mainReport.CampaignID")}${separator} ${row.CampaignID}`}
                  </Typography>
                  <Typography
                    className={classes.grayTextCell}>
                    {`${text}${separator} ${date.format('DD/MM/YYYY')} ${date.format('LT')}`}
                  </Typography>
                </Grid>
              ) : (
                <div className={clsx(isParentCampaignWithChild ? classes.paddingInline30 : '', classes.bold, classes.pt5, classes.f16)}>
                  {isParentCampaignWithChild && isParent ? row.Name.replace(SEND_1, '') : row.Name}
                </div>
              )
            }
          </Grid>
      </>
    )
  }

  const renderRow = (row, isParent = true, isEven = false) => {
    const childItems  = (isParent ? newslettersChildCampaigns.filter(childCampaign => childCampaign?.ParentCampaignId === row?.CampaignID) : []).sort((a, b) => a.CampaignID - b.CampaignID);
    const isExpanded = expandedIds.indexOf(row.CampaignID) > -1;
    return (
      <>
        <TableRow
          key={row.CampaignID}
          classes={rowStyle}
          className={clsx(
            isEven ? classes.evenRowBackground : classes.bgWhite
          )}
        >
          <TableCell
            classes={cellStyle}
            align='center'
            className={classes.flex2}>
            {renderNameCell(row, isParent)}
          </TableCell>
          <TableCell
            classes={cellStyle}
            align='center'
            className={classes.flex1}>
            {renderRecipientsCell(childItems.reduce((sum, childCampaign) => sum = sum + childCampaign.SentCount, row.SentCount))}
          </TableCell>
          <TableCell
            classes={cellStyle}
            align='center'
            className={classes.flex1}>
            {!(isExpanded && isParent) && renderStatusCell(row.Status)}
          </TableCell>
          <TableCell
            component='th'
            scope='row'
            classes={{ root: classes.tableCellRoot }}
            className={classes.flex6}>
            {!(isExpanded && isParent) && accountFeatures && renderCellIcons(row)}
          </TableCell>
        </TableRow>
        {
          isParent === true && isExpanded && (
            <>
              {renderRow(row, false, isEven)}
              {
                childItems.map((campaign) => renderRow(campaign, false, isEven))
              }
            </>
          )
        }
      </>
    )
  }

  const renderPhoneRow = (row, isParent = true, isEven = false) => {
    const childItems  = (isParent ? newslettersChildCampaigns.filter(childCampaign => childCampaign?.ParentCampaignId === row?.CampaignID) : []).sort((a, b) => a.CampaignID - b.CampaignID);
    const isExpanded = expandedIds.indexOf(row.CampaignID) > -1;
    return (
      <>
        <TableRow
          key={row.CampaignID}
          component='div'
          classes={rowStyle}
          className={clsx(
            isEven ? classes.evenRowBackground : classes.bgWhite
          )}
        >
          <TableCell style={{ flex: 1 }} classes={{ root: clsx(classes.tableCellRoot, classes.p10) }}>
            <Box className={classes.justifyBetween}>
              <Box className={classes.inlineGrid}>
                {renderNameCell(row, isParent)}
              </Box>
              <Box>
                {!(isExpanded && isParent) && renderStatusCell(row.Status)}
              </Box>
            </Box>
            {renderCellIcons(row)}
          </TableCell>
        </TableRow>
        {
          isParent === true && isExpanded && (
            <>
              {renderPhoneRow(row, false, isEven)}
              {childItems.map((campaign) => renderPhoneRow(campaign, false, isEven))}
            </>
          )
        }
      </>
    )
  }

  const renderTableBody = () => {
    let sortData = isSearching ? searchResults : newslettersParentCampaigns;
    let rpp = parseInt(rowsPerPage)
    sortData = sortData.slice((page - 1) * rpp, (page - 1) * rpp + rpp)
    return (
      <Box className='tableBodyContainer'>
        <TableBody>
          {sortData
            .map((item, index) => windowSize === 'xs' ? renderPhoneRow(item, true, index % 2) : renderRow(item, true, index % 2))}
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
        rows={isSearching ? searchResults.length : newslettersParentCampaigns.length}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={rowsOptions}
        page={page}
        onPageChange={setPage}
      />
    )
  }

  const handleChange = (CampaignID) => () => {
    const found = restoreArray.includes(CampaignID)
    if (found) {
      setRestoreArray(restoreArray.filter(restore => restore !== CampaignID))
    } else {
      setRestoreArray([...restoreArray, CampaignID])
    }
  }

  const handleDuplicateOptions = (option) => {
    let tempArray = [...duplicateOptions]
    if (tempArray.indexOf(option) > -1) {
      tempArray = tempArray.filter((opt) => opt !== option)
    }
    else {
      tempArray = [...tempArray, option]
    }
    setDuplicateOptions(tempArray)
  }

  const handleHideDuplicateCationMessage = (e) => {
    setHideDuplicateCautionMessage(e);
    if (e === true) {
      setCookie("showCautionDuplicateCampaign", "false");
    }
    else {
      setCookie("showCautionDuplicateCampaign", "true");
    }
  }

  const handleClose = () => {
    setDialogType(null)
  }

  const getCautionEditorChangeDialog = (data = {}) => {
    return {
      title: '',
      showDivider: false,
      icon: false,
      contentStyle: classes.noBorder,
      content: (
        <Grid container>
          <Grid item xs={12} className={clsx(classes.mb4)} style={{ textAlign: 'center' }}>
            <Typography className={clsx(classes.pbt5, classes.f25)}>
              {t('campaigns.newsLetterMgmt.payAttention')}
              {/* Pay attention! */}
            </Typography>
            <Typography className={classes.f20}>
              {t('campaigns.newsLetterMgmt.campMadewithOldEditor')}
            </Typography>
            <Typography className={classes.f20}>
              {t('campaigns.newsLetterMgmt.chooseNewEditorToCreateCamp')}
            </Typography>

            <Box className={classes.mt15}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={hideDuplicateCautionMessage}
                    onChange={() => handleHideDuplicateCationMessage(!hideDuplicateCautionMessage)}
                    name="checkedB"
                    color="primary"
                  />
                }
                label={t('notifications.implementDialog.dontShowThisMessage')}
              />
            </Box>
          </Grid>
        </Grid>
      ),
      onConfirm: async () => {
        handleClose();
        setDuplicateDialog({
          id: data.CampaignID,
          name: data?.Name
        });
      }
    }
  }

  const getRestorDialog = (data = []) => {
    if (!data || !Array.isArray(data)) return null
    return {
      title: t('campaigns.restoreCampaignTitle'),
      showDivider: true,
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
        handleClose()
        await dispatch(restoreCampaigns(restoreArray))
        setRestoreArray([])
        getData()
      }
    }
  }

  const getGruopsDialog = (data = []) => {
    if (!data || !Array.isArray(data)) return null
    return {
      title: t('campaigns.ShowGroupsTitle'),
      showDivider: false,
      icon: (
        <div className={classes.dialogIconContent}>
          {'\uE0D5'}
        </div>
      ),
      renderButtons: () => (null),
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
      onConfirm: () => handleClose()
    }
  }

  const getDeleteDialog = (data = '') => ({
    title: t('campaigns.GridButtonColumnResource2.ConfirmTitle'),
    showDivider: false,
    content: (
      <Typography style={{ fontSize: 18 }} className={clsx(classes.textCenter)}>
        {t('campaigns.GridButtonColumnResource2.ConfirmText')}
      </Typography>
    ),
    onConfirm: async () => {
      setLoader(true);
      clearSearch()
      handleClose()
      const response = await dispatch(deleteCampaign(data))
      if (response && response?.payload === 200) {
        setToastMessage(ToastMessages.CAMPAIGN_DELETED_SUCCESS);
        getData();
      }
      setLoader(false);
    }
  })

  const renderDialog = () => {
    const { data, type } = dialogType || {}

    const dialogContent = {
      restore: getRestorDialog(data),
      groups: getGruopsDialog(data),
      delete: getDeleteDialog(data),
      // duplicate: getDuplicateDialog(campaign?.CampaignID, campaign?.Name),
      cautionEditorChange: getCautionEditorChangeDialog(data),
    }

    const currentDialog = dialogContent[type] || {}
    return (
      dialogType && <BaseDialog
        classes={classes}
        open={dialogType}
        onCancel={handleClose}
        onClose={handleClose}
        renderButtons={currentDialog.renderButtons || null}
        {...currentDialog}>
        {currentDialog.content}
      </BaseDialog>
    )
  }

  return (
    <DefaultScreen
      currentPage='newsletter'
      classes={classes}
      containerClass={clsx(classes.management, classes.mb50)}>
      <Box className={'topSection'}>
        <Title Text={t('campaigns.logPageHeaderResource1.Text')} classes={classes} />
        {renderSearchLine()}
      </Box>
      {renderManagmentLine()}
      {renderTable()}
      {renderTablePagination()}
      {renderDialog()}

      <VerificationDialog isOpen={dialogType?.type === "verifyEmail"} onClose={() => setDialogType(null)} variant="email" classes={classes} />
      <DuplicateCampaign
        title={t('campaigns.dialogDuplicateTitle')}
        classes={classes}
        isOpen={!!duplicateDialog?.id}
        duplicateOptions={[]}
        handleClose={async (selectedOptions) => {
          setDuplicateDialog({});
          if (selectedOptions !== undefined) {
            clearSearch()
            // handleClose()
            setPage(1)
            await dispatch(duplicteCampaign({ CampaignID: duplicateDialog?.id, CloneOptions: selectedOptions }))
            getData()
          }
        }}
        campaignName={duplicateDialog?.name}
      />
      {/* Here we are using DomainVerification as a component and not via React Store */}
      <DomainVerification
        classes={classes}
        domain={domainAddressError}
        forceShow={showDomainVerification}
        key={"fromManagement"}
        onClose={() => {
          setShowDomainVerification(false)
        }}
      />
      <Loader isOpen={showLoader} />
      {renderToast()}
    </DefaultScreen >
  )
}

export default NewsletterManagnentScreen;
