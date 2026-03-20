import clsx from 'clsx';
import { debounce, get } from 'lodash';
import BeePlugin from '@mailupinc/bee-plugin'
import { Box, Button, Grid, Typography, Tooltip, LinearProgress, makeStyles } from '@material-ui/core'
import { IoMdInformationCircleOutline } from 'react-icons/io';
import { useRef, useState, useEffect } from 'react'
import DefaultScreen from '../DefaultScreen'
import { useSelector, useDispatch } from 'react-redux';
import {
  getCampaignById,
  saveCampaign,
  getUserblocks,
  testSend,
  saveUserBlock,
  deleteUserBlock,
  saveTemplateToAccount,
  getTemplateById,
  getPublicTemplates,
  getAllTemplatesBySubaccountId
} from '../../redux/reducers/campaignEditorSlice';
import { Loader } from '../../components/Loader/Loader';
import { getAccountExtraData, getPreviousLandingData } from "../../redux/reducers/smsSlice";
import { getTestGroups } from '../../redux/reducers/groupSlice';
import { useTranslation } from "react-i18next";
import TestSend from './modals/TestSend'
import ResponseModal from './modals/ResponseModal'
import NoCreditsModal from './modals/NoCreditsModal'
import Toast from '../../components/Toast/Toast.component';
import GenericModal from './modals/GenericModal';
import { deleteCampaign } from '../../redux/reducers/newsletterSlice';
import { getCommonFeatures, isAlive } from '../../redux/reducers/commonSlice';
import { findPlanByFeatureCode } from '../../redux/reducers/TiersSlice';
import WizardActions from '../../components/Wizard/WizardActions';
import { getBeeToken } from '../../redux/reducers/campaignEditorSlice';
import { initExtraDataField, initLandingPages } from './helper/MigratePulseemData';
import { BeeConfig, DialogType, DefaultContent } from './helper/Config';
import { IoMdImages } from 'react-icons/io';
import Gallery from '../../components/Gallery/Gallery.component';
import { PulseemFeatures, PulseemFolderType } from "../../model/PulseemFields/Fields";
import { getFileGallery } from '../../redux/reducers/gallerySlice';
import { BiSave } from 'react-icons/bi'
// User input controls
import { EditRow } from './components/ContentDialogs'
import { GiMagicBroom } from "react-icons/gi";


// Generic modal component with event hooks
import useModals from './hooks/useModals'
import { DemoModal } from './components/DemoModal'
import useMockAPI from './hooks/useMockAPI';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import Templates from './modals/Templates';
import OverwriteTemplatePopUp from '../Groups/Management/Popup/OverwriteTemplatePopUp';
import SaveTemplate from './modals/SaveTemplate';
/* END Bee */
import { sitePrefix } from '../../config';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { BaseDialog } from '../../components/DialogTemplates/BaseDialog';
import { getAuthorizedEmails } from '../../redux/reducers/commonSlice';
import DomainVerification from '../../Shared/Dialogs/DomainVerification';
import { SharedEmailDomain } from '../../config';
import { getCategories, GetProductsList } from '../../redux/reducers/productSlice';
import { RenderHtml } from '../../helpers/Utils/HtmlUtils';
import { NO_IMAGE_URL, TierFeatures } from '../../helpers/Constants';
import { logout } from '../../helpers/Api/PulseemReactAPI';
import { UserRoles } from '../../Models/SubUser/SubUsers';
import AITemplateCreatorAccordion from './modals/AI_TemplateCreatorAccordion';
import { BsMagic } from 'react-icons/bs';
import TierPlans from '../../components/TierPlans/TierPlans';
import PayPerRecipientNew from '../../components/PayPerRecipient/PayPerRecipientNew';
import { getPackagesDetails } from '../../redux/reducers/dashboardSlice';

const useComponentStyles = makeStyles((theme) => ({
  emailSizeContainer: {
    position: 'fixed',
    top: 0,
    backgroundColor: '#fff',
    padding: '12px 16px',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    zIndex: 0,
    minWidth: 280,
    maxWidth: 300
  },
  emailSizeContainerRTL: {
    left: '20%'
  },
  emailSizeContainerLTR: {
    right: '20%'
  },
  emailSizeHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  emailSizeLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: '#333'
  },
  emailSizeTooltipContent: {
    fontSize: 13,
    padding: 4
  },
  emailSizeTooltipSpacer: {
    marginTop: 4
  },
  emailSizeIcon: {
    fontSize: 18,
    color: '#666',
    cursor: 'pointer',
    marginLeft: 8
  },
  emailSizeValue: {
    fontSize: 16,
    fontWeight: 700,
  },
 emailSizeValueRTL: {
    textAlign: 'right'
  },
  emailSizeValueLTR: {
    textAlign: 'left'
  }, 
  emailSizeProgressContainer: {
    marginTop: 8,
    marginBottom: 4
  },
  emailSizeProgress: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0'
  },
  emailSizeWarning: {
    fontSize: 12,
    marginTop: 8,
    padding: '6px 8px',
    borderRadius: 4
  },
  emailSizeWarningOver: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    fontWeight: 600
  },
  emailSizeWarningCritical: {
    backgroundColor: '#fff3e0',
    color: '#e65100',
    fontWeight: 400
  },
  exceededDialogSubtitle: {
    marginBottom: 12
  },
  exceededDialogSizeBox: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 4,
    border: '1px solid #ef5350'
  },
  exceededDialogCurrentSize: {
    fontSize: 16,
    fontWeight: 600,
    color: '#c62828'
  },
  exceededDialogMaxSize: {
    fontSize: 14,
    color: '#666'
  },
  exceededDialogWarning: {
    marginBottom: 16,
    color: '#666'
  },
  exceededDialogDescription: {
    fontSize: 14,
    color: '#888'
  },
}));

const CampaignEditor = ({ classes, ...props }) => {
  //#region State
  const { t } = useTranslation();
  const dispatch = useDispatch()
  const navigate = useNavigate();
  const params = useParams();
  const componentClasses = useComponentStyles();
  const editorRef = useRef(null);
  const saveRef = useRef(null);
  const emailSizeRef = useRef({ totalKB: 0, htmlKB: 0, ampKB: 0, totalBytes: 0 });
  const designChangedRef = useRef(false);
  const editorReadyRef = useRef(false);
  const [showLoader, setLoader] = useState(true);
  const campaignId = params?.id;
  const [dataReady, setDataReady] = useState(false);
  const [mergeData, setPulseemMergeData] = useState({});
  const { productList } = useSelector(state => state.product)
  const { campaign, userBlocks, ToastMessages, beeToken, publicTemplates, templatesBySubAccount } = useSelector(state => state.campaignEditor);
  const { extraData, previousLandingData } = useSelector(state => state.sms);
  const { language, isRTL, userRoles } = useSelector(state => state.core)
  const { tokenAlive, accountSettings, accountFeatures, verifiedEmails, subAccount } = useSelector(state => state.common)
  const { productCategories } = useSelector(state => state.product);
  const { currentPlan, availablePlans } = useSelector((state) => state.tiers);
  const [dialog, setDialog] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [isResponseModal, setIsResponseModal] = useState(false);
  const [alertLogout, setAlertLogout] = useState(false);
  const [genericModalData, setGenericModalData] = useState({
    title: "",
    message: ""
  })
  const { modals, openModal } = useModals()
  const { setRow, getRows, handleDeleteRow, handleEditRow } = useMockAPI();
  const [showGallery, setShowGallery] = useState(false);
  const [showDocs, setShowDocuments] = useState(false);
  const queryParams = new URLSearchParams(window.location.search)
  const isFromAutomation = queryParams.get("FromAutomation");
  const NodeToEdit = queryParams.get("NodeToEdit");
  const fromLink = queryParams.get("fromLink");
  const [lastSaveText, setLastSaveText] = useState(null);
  const [silentSave, setSilentSave] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [overwriteTemplateDialog, setOverwriteTemplateDialog] = useState(false);
  const [newTemplate, setNewTemplate] = useState('');
  const [showTierPlans, setShowTierPlans] = useState(false);
  const [domainAddressError, setDomainAddressError] = useState({
    display: false,
    address: '',
    verifySharedCallback: null,
    isSummary: false,
    isFullDescription: false,
    preText: '',
    showSkip: false
  });
  const [showDomainVerification, setShowDomainVerification] = useState(false);
  const [emailProps, setEmailProps] = useState(null);
  const [dialogType, setDialogType] = useState(null);
  const [TierMessageCode, setTierMessageCode] = useState("");
  const [ isOpenPayPerRecipient, setIsOpenPayPerRecipient ] = useState(false);
  const [emailSize, setEmailSize] = useState({
    totalKB: 0,
    htmlKB: 0,
    ampKB: 0,
    totalBytes: 0
  });
  const [pendingAction, setPendingAction] = useState(null);
  //#endregion State

  //#region Get Extra fields & Landing pages, after Data Ready
  const initFields = () => {
    initExtraDataField(extraData, t).then((exData) => {
      setPulseemMergeData(exData);
    })
  }
  const initSpecialLinks = () => {
    return new Promise((resolve, reject) => {
      try {
        initLandingPages(previousLandingData, t).then((items) => {
          dispatch(getFileGallery(PulseemFolderType.DOCUMENT)).then((response) => {
            const gallery = response.payload;
            const specialLinksFiles = items;
            const folderExtName = t('common.files');

            gallery?.Files?.forEach((file) => {
              let folderName = file.FolderName === 'main' ? t('common.main') : file.FolderName;
              if (file.FolderName.indexOf('\\') > -1) {
                folderName = file.FolderName.split('\\')[1]
              }

              specialLinksFiles.push({
                type: `${folderExtName} ${folderName}`,
                label: file.FileName,
                link: file.FileURL
              })
            });
            resolve(specialLinksFiles);
          });
        });
      }
      catch (e) {
        console.error(e);
        reject();
      }
    })

  }

  useEffect(() => {
    if (dataReady) {
      Promise.all([initFields()]).then(() => {
        return true;
      });
    }

  }, [dataReady]);
  //#endregion
  useEffect(() => {
    if (editorRef && editorRef.current) {
      initBeeEditor();
    }

  }, [isRTL]);

  // Get data by campaign id
  useEffect(() => {
    if (params?.id > 0) {
      if (localStorage.getItem('reloadBeeEditor') === '1') {
        localStorage.removeItem('reloadBeeEditor');
        window.location.reload(true);
      } else getData();
    }
    if (!publicTemplates.length) dispatch(getPublicTemplates(isRTL));
    if (!productList?.length) dispatch(GetProductsList());
    dispatch(getAllTemplatesBySubaccountId());
  }, []);

  useEffect(() => {
    if (userBlocks) {
      return new Promise((resolve) => {
        userBlocks.forEach(x => setRow(x.data));
        resolve();
      });
    }
    else {
      initOptions();
    }

  }, [language, userBlocks]);

  //#region Check session token -> tokenAlive
  useEffect(() => {
    setInterval(() => {
      if (tokenAlive) {
        dispatch(isAlive());
      }
    }, 300000);
    try {
      document.removeEventListener('setAlert', null);
    }
    catch (e) {
      console.error(e);
    }
    if (alertLogout === true) {
      onLogoutAlert();
    }

  }, [alertLogout]);

  document.addEventListener('setAlert', () => {
    setAlertLogout(true);
  });
  const onLogoutAlert = () => {
    setIsResponseModal(false);
    setLoader(false);
    setGenericModalData({
      title: t('common.systemNotice'),
      message: t("common.autoLogoutMessage"),
      showDefaultButtons: false,
      renderButtons: () =>
      (<Button
        size='small'
        variant='contained'
        className={clsx(
          classes.btn,
          classes.btnRounded,
          classes.middle
        )}
        onClick={() => { window.location.href = '/Pulseem/Login.aspx?ReturnUrl=/Pulseem/HomePageMiddleware.aspx?fromreact=true' }}
      >
        {t('common.confirm')}
      </Button>
      ),
      onCancel: () => { window.location.href = '/Pulseem/Login.aspx?ReturnUrl=/Pulseem/HomePageMiddleware.aspx?fromreact=true' },
      onClose: () => { window.location.href = '/Pulseem/Login.aspx?ReturnUrl=/Pulseem/HomePageMiddleware.aspx?fromreact=true' }
    });
    setDialog(DialogType.GENERIC);
  }
  //#endregion 

  const getData = async (defaultShowLoader = true) => {
    setLoader(defaultShowLoader);
    await dispatch(getCampaignById(params?.id));
    await dispatch(getAccountExtraData());
    await dispatch(getPreviousLandingData());
    await dispatch(getTestGroups(false));
    await dispatch(getUserblocks());
    await dispatch(getAuthorizedEmails());

    if (productCategories?.length <= 0) {
      getProductCategories();
    }
    setDataReady(true);
    const initBeeToken = () => {
      dispatch(getBeeToken());
    }
    initBeeToken();
  }

  const initRestrictions = async () => {
    const subAccountEmails = verifiedEmails?.filter((ve) => { return ve?.Number === campaign.FromEmail })[0];
    setEmailProps(subAccountEmails);
  }
  useEffect(() => {
    if (campaign && campaign.CampaignID && verifiedEmails?.length > 0) {
      initRestrictions();
    }
  }, [campaign, verifiedEmails]);
  //#region Init Bee Token & Configuration
  const initTags = () => {
    let tempTags = [...new Set(userBlocks?.map(item => item.tags))];
    var tags = [].concat.apply([], tempTags);
    let tempRows = [{
      name: 'Dynamic-Products',
      value: 'Dynamic-Products',
      handle: 'Dynamic-Products',
      isLocal: true,
      behaviors: {
        canEdit: true,
        canDelete: userRoles?.AllowDelete,
      }
    }]
    if (tags && tags?.length > 0) {
      config.rowsConfiguration.externalContentURLs = [];
      tags?.forEach((tag, idx) => {
        if (tag && tag !== undefined && tag !== null && tag.trim() !== 'Dynamic-Products') {
          const tagObj = {
            name: tag.trim(),
            value: tag.replace(' ', ''),
            handle: tag.replace(' ', ''),
            isLocal: true,
            behaviors: {
              canEdit: true,
              canDelete: userRoles?.AllowDelete,
            },
          };
          tempRows.push(tagObj);
        }
      });
      tempRows = tempRows.filter((value, index) => {
        const _value = JSON.stringify(value);
        return index === tempRows.findIndex(obj => {
          return JSON.stringify(obj) === _value;
        });
      });
    }
    config.rowsConfiguration.externalContentURLs = tempRows;
  }
  const initBeeEditor = (templateId = null) => {
    editorReadyRef.current = false;
    initSpecialLinks().then(async (specialLinksFiles) => {
      const isRtlLang = campaign?.LanguageCode === 0 || campaign?.LanguageCode === 8 ? true : false;
      let forceTemplate = null;
      let defaultContent = DefaultContent(isRtlLang, campaign?.LanguageCode);
      if (templateId !== null) {
        const templateResponse = await dispatch(getTemplateById(templateId));

        if (templateResponse?.payload?.StatusCode === 201) {
          const responseData = templateResponse?.payload?.Data;
          setNewTemplate(responseData)
          forceTemplate = responseData?.JsonData ? JSON.parse(responseData?.JsonData) : defaultContent.defaultTemplate;
        } else if (templateResponse?.payload?.StatusCode === 927) {
          // NEWSLETTER_TEMPLATES
          setTierMessageCode(templateResponse?.payload?.Message);
          setDialogType({ type: 'tier' });
        } else {
          setToastMessage({ severity: 'error', color: 'error', message: templateResponse?.payload.Message, showAnimtionCheck: false });
        }
      }

      config.uid = accountSettings?.SubAccountSettings?.BeeUniqueID;
      config.mergeTags = mergeData;
      config.specialLinks = specialLinksFiles;
      config.titleDefaultStyles = defaultContent.titleDefaultStyles;
      config.contentDefaults = defaultContent.contentDefaults;
      if (accountFeatures?.indexOf(PulseemFeatures.BEE_AMP) > -1) {
        config.workspace.type = 'mixed';
      }

      initTags();

      switch (beeToken?.StatusCode) {
        case 201: {
          const beeObject = JSON.parse(beeToken.Message);
          if (beeToken.Message === "null" || beeToken.Message === null) {
            setDialog(DialogType.MISSING_API_KEY);
          }
          else {
            const beeTest = new BeePlugin(beeObject);
            let template = campaign?.JsonData ? JSON.parse(campaign?.JsonData) : defaultContent.defaultTemplate;

            if (forceTemplate !== null) {
              template = forceTemplate;
            }
            else {
              template = campaign?.JsonData ? JSON.parse(campaign?.JsonData) : defaultContent.defaultTemplate;
            }

            beeTest.start(config, template).then((instance) => {
              editorRef.current = instance;
              if ((!campaign || !campaign.HtmlData) && (!params?.id || params?.id === 0)) {
                saveDesign(false, null, false);
              }
              setTimeout(() => {
                editorReadyRef.current = true; 
                setButtonDisabled(false);
              }, 2000);
            });
          }
          break;
        }
        case 401: {
          setDialog(DialogType.MISSING_API_KEY);
          break;
        }
        case 404: {
          setDialog(DialogType.CAMPAIGN_NOT_FOUND);
          break;
        }
        case 500:
        default: {
          setDialog(DialogType.ERROR_OCCURED);
          break;
        }
      }
      setLoader(false);
    })
  }

  const getProductCategories = async () => {
    await dispatch(getCategories());
  }

  const checkEmailSizeBeforeAction = (actionType) => {
    if (designChangedRef.current) {
      setToastMessage({
        severity: 'info',
        color: 'info',
        message: t('campaigns.emailSize.calculating'),
        showAnimtionCheck: false
      });
      return true;
    }
    const sizeInfo = emailSizeRef.current;
    if (sizeInfo.totalKB > 102) {
      setPendingAction(actionType);
      setDialogType({
        type: 'emailSizeExceeded',
        data: {
          currentSize: sizeInfo.totalKB,
          reductionNeeded: (sizeInfo.totalKB - 102).toFixed(1)
        }
      });
      return false;
    }
    return true;
  };

  const executePendingAction = (buttonAction) => {
    const action = pendingAction;
    setPendingAction(null);
    setDialogType(null);

    if (buttonAction === 'back') return;
    if (action === 'testSend' && buttonAction === 'testSend') {
      // User clicked "Continue to test sending" - open test send modal
      const isSharedDomain = campaign.FromEmail.split("@").pop() === SharedEmailDomain;
      if (!isSharedDomain && (!emailProps?.IsVerified || emailProps?.IsRestricted)) {
        const domainErrorObj = {
          display: false,
          address: campaign.FromEmail,
          verifySharedCallback: null,
          isSummary: false,
          isFullDescription: false,
          preText: t(`common.domainVerification.campaignEditor.${emailProps?.IsRestricted ? 'restricted' : 'nonVerified'}.preText`).replace('##campaignId##', campaign.CampaignID),
          showSkip: false,
          options: [{
            text: t('common.CampaignSettings'),
            onCallback: () => {
              window.location = `/react/Campaigns/Create/${campaign.CampaignID}`
            }
          }]
        };
        setDomainAddressError(domainErrorObj);
        setShowDomainVerification(true);
      } else {
        setLoader(true);
        setIsResponseModal(false);
        editorRef.current.send();
      }
    } else if (action === 'continue') {
      handleContinueFlow(true);
    } else if (action === 'save') {
      saveDesign(false, null, true, true, '', true).then(async () => {
        setIsResponseModal(false);
      });
    }
  };

  const handleContinueFlow = (skipSizeCheck = false) => {
    saveDesign(false, null, false, false, '', skipSizeCheck);

    const isSharedDomain = campaign.FromEmail.split("@").pop() === SharedEmailDomain;
    if (!isSharedDomain && (!emailProps?.IsVerified || emailProps?.IsRestricted)) {
      const domainErrorObj = {
        display: false,
        address: campaign.FromEmail,
        verifySharedCallback: null,
        isSummary: false,
        isFullDescription: false,
        preText: t(`common.domainVerification.campaignEditor.${emailProps?.IsRestricted ? 'restricted' : 'nonVerified'}.preText`).replace('##campaignId##', campaign.CampaignID),
        showSkip: false,
        options: [{
          text: t('common.CampaignSettings'),
          onCallback: () => {
            window.location = `/react/Campaigns/Create/${campaign.CampaignID}`
          }
        }]
      };
      setDomainAddressError(domainErrorObj);
      setShowDomainVerification(true);
    } else {
      saveDesign(true, null, true, true, '', skipSizeCheck);
    }
  };

  /**
   * Calculate email size - includes HTML + AMP (all embedded images, videos, components)
   * JSON data is NOT included as it's only for editor state
   */
  const calculateEmailSize = (html = '', ampData = '') => {
    try {
      const htmlSize = new Blob([html || '']).size;
      const ampSize = ampData ? new Blob([ampData]).size : 0;
      const totalBytes = htmlSize + ampSize;
      const totalKB = totalBytes / 1024;

      return {
        totalKB: parseFloat(totalKB.toFixed(1)),
        totalBytes,
        htmlKB: parseFloat((htmlSize / 1024).toFixed(1)),
        ampKB: parseFloat((ampSize / 1024).toFixed(1)),
        htmlBytes: htmlSize,
        ampBytes: ampSize
      };
    } catch (error) {
      console.error('Error calculating email size:', error);
      return { totalKB: 0, totalBytes: 0, htmlKB: 0, ampKB: 0, htmlBytes: 0, ampBytes: 0 };
    }
  };

  /**
   * Get size status for UI coloring and messaging
   */
  const getSizeStatus = (sizeKB) => {
    if (sizeKB >= 102) return 'over';
    if (sizeKB >= 95) return 'critical';
    if (sizeKB >= 80) return 'warning';
    return 'safe';
  };

  const getSizeColor = (status) => {
    const colors = {
      safe: '#4caf50',
      warning: '#ff9800',
      critical: '#ff5722',
      over: '#f44336'
    };
    return colors[status] || colors.safe;
  };

  useEffect(() => {
    if (beeToken) {
      initBeeEditor();
    }

  }, [beeToken]);

  useEffect(() => {
    if (dialog === DialogType.TEST_SEND) {
      setLoader(false);
    }
  }, [dialog]);

  const initOptions = async () => {
    initTags();
    if (!accountSettings || accountSettings.SubAccountSettings) {
      await dispatch(getCommonFeatures());
    }
    if (editorRef.current) {
      const c = getConfig();
      editorRef.current.loadConfig(c);
      editorRef.current.load();
    }
  }


  //#endregion Init Bee Token & Configuration
  //#region Pulseem Methods (Save, Delete, Exit, Back, Test Send)
  const onSave = async (args) => {
    // Calculate email size BEFORE any other validations
    const sizeInfo = calculateEmailSize(args.HtmlData, args.AmpData);
    updateEmailSize(sizeInfo);
    designChangedRef.current = false;
    setToastMessage(prev =>
      prev?.severity === 'info' && prev?.message === t('campaigns.emailSize.calculating')
        ? null
        : prev
    );

    if (sizeInfo.totalKB > 102 && !saveRef.current?.skipSizeCheck) {
      setLoader(false);
      setDialogType({
        type: 'emailSizeExceeded',
        data: {
          currentSize: sizeInfo.totalKB,
          reductionNeeded: (sizeInfo.totalKB - 102).toFixed(1)
        }
      });
      return false;
    }

    const dynamicBlocks = (args.HtmlData?.match(/product-block-container/g) || []).length;
    if (saveRef.current?.checkDynamicBlock && dynamicBlocks > 0) {
      if (dynamicBlocks > 1) {
        setDialogType({ type: 'moreThanOneDynamicBlock', data: saveRef.current?.operation })
        return false;
      } else if (['save', 'exit'].indexOf(saveRef.current?.operation) === -1) {
        setDialogType({
          type: 'productCatalogPrompt',
          data: args
        });
        return false;
      }
    } else if (dynamicBlocks > 1) {
      return false;
    }

    const reInit = saveRef.current?.reInitEditor;

    try {
      if (saveRef.current?.showAnimation) setLoader(true);
      let finalHtml = args.HtmlData;
      let finalJson = args.JsonData;
      let finalAmpData = args.AmpData;

      if (finalJson.indexOf('!DOCTYPE') > -1 || finalJson.indexOf('<body') > -1 || finalJson.indexOf('<html') > -1) {
        setToastMessage(ToastMessages.HTML_DOCTYPE_ERROR);
        return false;
      }

      const response = await dispatch(saveCampaign({
        Name: campaign?.Name || '',
        campaignId: args.campaignId,
        JsonData: finalJson,
        HTML: finalHtml,
        AmpData: finalAmpData,
        IsAutoResponder: fromLink?.toLowerCase() === 'autoresponder'
      }));

      switch (response?.payload?.StatusCode) {
        case 201:
        default: {
          const now = moment();
          setLastSaveText(`${t('common.lastSaveAt')} ${moment(now).format("hh:mm:ss")}`)
          if (saveRef.current?.redirectAfterSave) {
            const isAutoResponder = fromLink?.toLowerCase() === 'autoresponder';
            localStorage.setItem('reloadBeeEditor', 1);

            if (isAutoResponder || isFromAutomation) {
              window.location.href = saveRef.current?.redirectUrl ?? `${sitePrefix}Campaigns/SendSettings/${args.campaignId}`;
            }
            else {
              navigate(saveRef.current?.redirectUrl ?? `${sitePrefix}Campaigns/SendSettings/${args.campaignId}`);
            }
            return false;
          }
          else if (saveRef.current?.showAnimation && !saveRef.current?.saveTemplate) {
            setToastMessage(ToastMessages.CAMPAIGN_SAVED);
          }

          if (reInit && !saveRef.current?.saveTemplate) {
            getData();
          }
          break;
        }
        case 401: {
          logout();
          return false;
        }
        case 500: {
          setToastMessage(ToastMessages.ERROR_OCCURED);
          return false;
        }
        case 501: {
          if (response?.payload?.Message === 'webp_not_allowd') {
            setToastMessage(ToastMessages.WEBP_NOT_SUPPORTED);
          }
          return false;
        }
        case 927: {
          if (saveRef.current?.operation !== 'exit') {
            // EMAIL_BASIC, BASIC_PERSONALIZATION
            setTierMessageCode(response?.payload?.Message);
            setDialogType({ type: 'tier' });
          }
          return false;
        }
      }

      if (saveRef.current?.operation === 'testSend') {
        saveRef.current.operation = '';
        if (editorRef.current) {
          setLoader(false);
          editorRef.current.send();
        }
      }

      if (saveRef.current?.saveTemplate) {
        const isTemplateExists = templatesBySubAccount?.filter((template) => {
          return template?.Name === saveRef.current?.templateName && saveRef.current?.templateCategory?.split(',').indexOf(template?.Category) > -1
        });
        if (isTemplateExists && isTemplateExists?.length > 0) {
          const existsCategories = isTemplateExists?.map((item) => { return item?.Category })?.join(',');
          onExistTemplate(finalJson, finalHtml, saveRef.current?.templateName, existsCategories);
        }
        else {
          forceSaveTemplate(finalJson, finalHtml)
        }
      }
    } catch (e) {
      console.error(e);
    }
    finally {
      setLoader(false);
    }
  }
  const saveDesign = async (redirectAfterSave = false, redirectUrl = null, showAnimation = true, checkDynamicBlock = false, operation = '', skipSizeCheck = false) => {
    saveRef.current = { redirectAfterSave: redirectAfterSave, redirectUrl: redirectUrl, showAnimation: showAnimation, checkDynamicBlock: checkDynamicBlock, operation: operation, skipSizeCheck: skipSizeCheck };
    await editorRef.current.save();
    setTimeout(() => {
      // const now = moment();
      // setLastSaveText(`${t('common.lastSaveAt')} ${moment(now).format("hh:mm:ss")}`)
      setSilentSave(false)
    }, 2000);
  }
  
  const updateEmailSize = (sizeInfo) => {
    emailSizeRef.current = sizeInfo;
    setEmailSize(sizeInfo);
  };

  const onAutoSaveCampaign = debounce(() => {
    setSilentSave(true)
    saveDesign(false, null, false, false, '', true);
  }, 5000);

  const onDesignChange = async () => {
    if (!editorReadyRef.current) return;
    designChangedRef.current = true;
    onAutoSaveCampaign();
  }

  const deleteNewsletter = async () => {
    setDialog(null);
    await dispatch(deleteCampaign(campaignId));
    window.location = `${sitePrefix}Campaigns`;
  }
  const onDelete = () => {
    setIsResponseModal(false);
    setGenericModalData({
      title: t('campaigns.GridButtonColumnResource2.ConfirmTitle'),
      message: t("mainReport.confirmSure"),
      onConfirm: () => deleteNewsletter(),
      onCancel: () => setDialog(null),
      onClose: () => setDialog(null)
    });
    setDialog(DialogType.GENERIC);
  }
  const onExistTemplate = (finalJson, finalHtml, name, category) => {
    setGenericModalData({
      title: t('common.payAttention'),
      content: <Box style={{ marginBottom: 25 }}>
        <Typography>{RenderHtml(t("campaigns.GridButtonColumnResource2.existTemplateDescription").replace('#name#', name).replace('#category#', category))}</Typography>
      </Box>,
      message: null,
      onConfirm: () => {
        forceSaveTemplate(finalJson, finalHtml);
        setDialog(null);
      },
      onCancel: () => setDialog(null),
      onClose: () => setDialog(DialogType.SAVE_TEMPLATE)
    });
    setDialog(DialogType.GENERIC);
  }

  const forceSaveTemplate = async (finalJson, finalHtml) => {
    const templateResponse = await dispatch(saveTemplateToAccount({
      Name: saveRef.current?.templateName,
      JsonData: finalJson,
      HTML: finalHtml,
      Category: saveRef.current?.templateCategory
    }));

    // Check for tier validation
    if (templateResponse?.payload?.StatusCode === 927) {
      // NEWSLETTER_TEMPLATES
      setTierMessageCode(templateResponse?.payload?.Message);
      setDialogType({ type: 'tier' });
      return;
    }

    if (!templateResponse.payload.Data) {
      setToastMessage({ severity: 'error', color: 'error', message: templateResponse.payload.Message, showAnimtionCheck: false });
    }
    else {
      setToastMessage(ToastMessages.TEMPLATE_SAVED);
    }
    dispatch(getAllTemplatesBySubaccountId());
    getData(false);
  }

  const handleExitCampaign = (saveBeforeExit = true) => {
    setDialog(null);
    const isAutoResponder = fromLink?.toLowerCase() === 'autoresponder';
    const redirectLink = isAutoResponder ? `/Pulseem/AutoSendPlans.aspx?Culture=${isRTL ? 'he-IL' : 'en-US'}` : `${sitePrefix}Campaigns`;

    if (saveBeforeExit) {
      saveDesign(true, redirectLink, false, true, 'exit', true);
    }
    else {
      if (isAutoResponder) window.location.href = redirectLink;
      else navigate(redirectLink);
    }
  }
  const onExit = () => {
    setGenericModalData({
      title: t('mainReport.handleExitTitle'),
      message: t("mainReport.leaveCampaign"),
      onClose: () => handleExitCampaign(false),
      onConfirm: () => handleExitCampaign(true),
      onCancel: () => setDialog(null)
    });
    setDialog(DialogType.GENERIC);
  }
  const onBack = () => {
    if (isFromAutomation) {
      saveDesign(true, `${sitePrefix}Campaigns/Create/${campaignId}?FromAutomation=${isFromAutomation}&NodeToEdit=${NodeToEdit}`)
    }
    else {
      saveDesign(true, `${sitePrefix}Campaigns/Create/${campaignId}`)
    }
  }
  const onTestSendSubmit = async (sendRequest) => {
    setLoader(true);
    const reponse = await dispatch(testSend({ ...sendRequest }));
    onTestSendResponse(reponse.payload.StatusCode, reponse.payload.Message);
    setSummaryData(reponse.payload.Summary);
    setLoader(false);
  }
  const onTestSendResponse = (statusCode, message = '') => {
    setIsResponseModal(statusCode !== 402);
    switch (statusCode) {
      case 200: 
      case 201: {
        setDialog(DialogType.SUCCESS_SENT);
        break;
      }
      case 401: {
        setDialog(DialogType.MISSING_API_KEY);
        break;
      }
      case 402: {
        setDialog(DialogType.NO_CREDITS_LEFT);
        break;
      }
      case 404: {
        setDialog(DialogType.CAMPAIGN_NOT_FOUND);
        break;
      }
      case 405: {
        setDialog(DialogType.CANNOT_CREATE_GROUP);
        break;
      }
      case 406: {
        setDialog(null);
        setToastMessage(ToastMessages.RECIPIENT_BLOCKED);
        break;
      }
      case 550: {
        setDialog(DialogType.PENDING_APPROVAL);
        break;
      }
      case 551: {
        setDialog(DialogType.UNDER_REVIEW);
        break;
      }
      case 927: {
        // FILE_ATTACHMENT, EMAIL_BASIC
        setTierMessageCode(message);
        setDialogType({ type: 'tier' });
        break;
      }
      case 553: {
        setIsResponseModal(false);
        setGenericModalData({
          title: t('campaigns.newsLetterEditor.errors.paymentfailed553Title'),
          message: t("campaigns.newsLetterEditor.errors.paymentfailed553Desc"),
          onConfirm: () => {},
          onCancel: () => setDialog(null),
          onClose: () => setDialog(null),
          showDefaultButtons: false,
          renderButtons: () => (
            <Grid
              container
              spacing={2}
              className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null)}
            >
              <Grid item>
                <Button
                  onClick={() => {
                    setDialog(null);
                    dispatch(getPackagesDetails());
                    setIsOpenPayPerRecipient(true)
                  }}
                  className={clsx(
                    classes.btn,
                    classes.btnRounded
                  )}>
                  {t('campaigns.newsLetterEditor.errors.paymentfailed553Button')}
                </Button>
              </Grid>
            </Grid>
          )
        });
        setDialog(DialogType.GENERIC);
        break;
      }
      case 552: {
        setDialog(DialogType.PAYMENT_PROCESSING);
        break;
      }
      case 500:
      default: {
        setDialog(DialogType.ERROR_OCCURED);
        break;
      }
    }
  }
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
  //#endregion Pulseem Methods (Save, Delete, Exit, Back, Test Send)
  const handleCloseReponse = () => {
    setDialog(null);
    setIsResponseModal(false);
  }

  const onSaveUserBlock = (json, block) => {
    setLoader(true);
    const blockRequest = {
      Data: JSON.stringify(json),
      Category: block?.metadata?.name,
      Tags: block?.metadata?.tags?.split(','),
      uuid: block?.metadata?.uuid
    };
    dispatch(saveUserBlock(blockRequest)).then(async () => {
      let tempTags = [...new Set(userBlocks?.map(item => item.tags))];
      var tags = [].concat.apply([], tempTags);
      if (tags && tags?.length > 0) {
        setSilentSave(true)
        await saveDesign(false, null, false);
      }
      getData();
    });
  }
  const onEditBlock = (blockRequest) => {
    setLoader(true);
    dispatch(saveUserBlock(blockRequest)).then(async () => {
      setLoader(false);
      getData();
    });
  }
  const handleDeleteBlock = (e, row_id) => {
    dispatch(deleteUserBlock(row_id)).then((result) => {
      getData();
    })
  }
  const handleOpenTestSend = async () => {
    setPendingAction('testSend');
    const canProceed = checkEmailSizeBeforeAction('testSend');
    if (!canProceed) return;   
    const isSharedDomain = campaign.FromEmail.split("@").pop() === SharedEmailDomain;
    if (!isSharedDomain && (!emailProps?.IsVerified || emailProps?.IsRestricted)) {
      const domainErrorObj = {
        display: false,
        address: campaign.FromEmail,
        verifySharedCallback: null,
        isSummary: false,
        isFullDescription: false,
        preText: t(`common.domainVerification.campaignEditor.${emailProps?.IsRestricted ? 'restricted' : 'nonVerified'}.preText`).replace('##campaignId##', campaign.CampaignID),
        showSkip: false,
        options: [{
          text: t('common.CampaignSettings'),
          onCallback: () => {
            window.location = `/react/Campaigns/Create/${campaign.CampaignID}`
          }
        }]
      }
      setDomainAddressError(domainErrorObj);
      setShowDomainVerification(true)
    }
    else {
      try {
        setLoader(true);
        setIsResponseModal(false);
        await saveDesign(false, null, false, true, 'testSend');
      } catch (e) {
        console.error('Test send save failed:', e);
        setLoader(false);
      }
    }
  }

  // const handleUndoChange = (code) => {
  //   switch (code) {
  //     case '0780': {
  //       setToastMessage(ToastMessages.HTML_DOCTYPE_ERROR);
  //       getData();
  //       return false;
  //     }
  //     default: {
  //       return false;
  //     }
  //   }
  // }

  const getConfig = () => {
    return BeeConfig({
      classes,
      onSaveUserBlock,
      IsRTL: isRTL,
      EditRow: EditRow,
      openModal: openModal,
      SaveCampaign: onSave,
      AutoSaveCampaign: onAutoSaveCampaign,
      DesignChange: onDesignChange,
      SetDialog: setDialog,
      CampaignId: campaignId,
      PulseemEditBlock: onEditBlock,
      DeleteBlock: handleDeleteBlock,
      // HandleAutoSave: handleAutoSave,
      getRows,
      handleEditRow,
      handleDeleteRow,
      t: t,
      languageCode: language
      // handleUndoChange
    });
  }
  const config = getConfig();

  // Email Size Indicator
  const EmailSizeIndicator = () => {
    if (emailSize.totalKB === 0) return null;

    const status = getSizeStatus(emailSize.totalKB);
    const color = getSizeColor(status);
    const percentage = Math.min((emailSize.totalKB / 102) * 100, 100);

    const getWarningText = () => {
      const reductionNeeded = (emailSize.totalKB - 102).toFixed(1);
      switch (status) {
        case 'over':
          return t('campaigns.emailSize.overLimitWarning', { reduction: reductionNeeded });
        default:
          return null;
      }
    };

    const warningText = getWarningText();

    return (
      <Box
        className={clsx(
          componentClasses.emailSizeContainer,
          isRTL ? componentClasses.emailSizeContainerRTL : componentClasses.emailSizeContainerLTR
        )}
      >
        <Box className={componentClasses.emailSizeHeader}>
          <Typography className={componentClasses.emailSizeLabel}>
            {t('campaigns.emailSize.label')}
          </Typography>
          <Tooltip
            title={
              <Box className={componentClasses.emailSizeTooltipContent}>
                <Typography variant="body2">{t('campaigns.emailSize.htmlSize')}: {emailSize.htmlKB} KB</Typography>
                {emailSize.ampKB > 0 && (
                  <Typography variant="body2">{t('campaigns.emailSize.ampSize')}: {emailSize.ampKB} KB</Typography>
                )}
                <Typography variant="body2" className={componentClasses.emailSizeTooltipSpacer}>
                  {t('campaigns.emailSize.tooltipInfo')}
                </Typography>
              </Box>
            }
            arrow
          >
            <Box component="span">
              <IoMdInformationCircleOutline className={componentClasses.emailSizeIcon} />
            </Box>
          </Tooltip>
        </Box>

        <Typography
          className={clsx(
            componentClasses.emailSizeValue,
            isRTL ? componentClasses.emailSizeValueRTL : componentClasses.emailSizeValueLTR
          )}
          style={{ direction: 'ltr', color }}
        >
          {emailSize.totalKB} KB / 102 KB
        </Typography>

        <Box className={componentClasses.emailSizeProgressContainer}>
          <LinearProgress
            variant="determinate"
            value={percentage}
            className={componentClasses.emailSizeProgress}
            classes={{
              bar: classes.progressBar
            }}
          />
        </Box>

        {warningText && (
          <Typography
            className={clsx(
              componentClasses.emailSizeWarning,
              status === 'over' 
                ? componentClasses.emailSizeWarningOver 
                : componentClasses.emailSizeWarningCritical
            )}
          >
            {warningText}
          </Typography>
        )}
      </Box>
    );
  };

  const saveTemplate = async (name, category) => {
    saveRef.current = { templateName: name, templateCategory: category, saveTemplate: true, showAnimation: true };
    await editorRef.current.save();
  }

  const onBeforeReinit = async () => {
    saveRef.current = { showAnimation: false, reInitEditor: true };
    await editorRef.current.save();
  }

  const showGalleryModal = () => {
    if (showGallery) {
      let dialog = {
        showDivider: false,
        icon: (
          <IoMdImages />
        ),
        title: t("common.imageGallery"),
        content: (
          <Gallery
            classes={classes}
            style={{ minWidth: 400 }}
            multiSelect={false}
            forceReload={true}
            folderType={PulseemFolderType.CLIENT_IMAGES} />
        )
      };

      return (
        <BaseDialog
          maxHeight="calc(70vh)"
          disableBackdropClick={true}
          style={{ minHeight: 400 }}
          showDivider={false}
          classes={classes}
          open={showGallery}
          onClose={() => { setShowGallery(false); }}
          onCancel={() => { setShowGallery(false); }}
          onConfirm={() => { setShowGallery(false); }}
          {...dialog}>
          {dialog.content}
        </BaseDialog>
      );
    }
  }
  const showDocumentsModal = () => {
    if (showDocs) {
      let dialog = {
        showDivider: false,
        title: t("common.documentGallery"),
        content: (
          <Gallery
            classes={classes}
            style={{ minWidth: 400 }}
            multiSelect={false}
            forceReload={true}
            folderType={PulseemFolderType.DOCUMENT} />
        )
      };

      return (
        <BaseDialog
          maxHeight="calc(70vh)"
          disableBackdropClick={true}
          style={{ minHeight: 400 }}
          showDivider={false}
          classes={classes}
          open={showDocs}
          onClose={() => { setShowDocuments(false); }}
          onCancel={() => { setShowDocuments(false); }}
          onConfirm={() => { setShowDocuments(false); onBeforeReinit(); }}
          {...dialog}>
          {dialog.content}
        </BaseDialog>
      );
    }
  }

  const renderTemplateButtons = () => {
    return <>
      <Button onClick={() => {
        setLoader(true);
        setTimeout(() => {
          setDialog(DialogType.Templates);
        }, 1000);

        setTimeout(() => {
          setLoader(false);
        }, 2000);
      }}
        variant='contained'
        size='small'
        className={clsx(
          classes.btn,
          classes.btnRounded
        )}
        style={{ margin: '8px' }}
      >
        {t('common.templates')}
      </Button>
      <Button onClick={() => setDialog(DialogType.SAVE_TEMPLATE)}
        variant='contained'
        size='small'
        className={clsx(
          classes.btn,
          classes.btnRounded
        )}
        style={{ margin: '8px', boxShadow: '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)' }}
        startIcon={<BiSave />}
      >
        {t('common.saveTemplate')}
      </Button>
      {accountFeatures?.indexOf(PulseemFeatures.NewsletterAI) > -1 && <Button
        onClick={() => { setDialogType({ type: "AIDialog" }) }}
        className={clsx(
          classes.btn,
          classes.btnRounded,
          classes.redButton
        )}
        style={{ margin: 8 }}
        size='small'
        startIcon={<GiMagicBroom />}
        // color="primary"
        key={'aiButton'}
      >{t('campaigns.aiDeisgner')}</Button>
      }
    </>
  }

  //       setTimeout(() => {
  //         setLoader(false);
  //       }, 2000);
  //     }}
  //       variant='contained'
  //       size='medium'
  //       className={clsx(
  //         classes.actionButton,
  //         classes.actionButtonOutlinedBlue
  //       )}
  //       style={{ margin: '8px' }}
  //     >
  //       {t('common.templates')}
  //     </Button>
  //     <Button onClick={() => setDialog(DialogType.SAVE_TEMPLATE)}
  //       variant='contained'
  //       size='medium'
  //       className={clsx(
  //         classes.actionButton,
  //         classes.actionButtonOutlinedBlue,
  //       )}
  //       style={{ margin: '8px' }}
  //       startIcon={<BiSave />}
  //     >
  //       {t('common.saveTemplate')}
  //     </Button></>
  // }

  const productCatalogModal = (args) => {
    return {
      showDivider: false,
      title: t("common.important"),
      content: (
        <Box>
          <Typography title={t("common.dynamicProductNotice")} className={classes.alignDir}>
            {RenderHtml(t("common.dynamicProductNotice"))}
          </Typography>
        </Box>
      ),
      renderButtons: () => (
        <Grid
          container
          spacing={4}
          className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null)}
        >
          <Grid item>
            <Button
              variant='contained'
              size='small'
              onClick={() => {
                setDialogType(null);
                saveRef.current = { ...saveRef.current, checkDynamicBlock: false };
                onSave(args);
              }}
              className={clsx(
                classes.btn,
                classes.btnRounded
              )}>
              {t('common.Ok')}
            </Button>
          </Grid>
        </Grid>
      )
    };
  }

  const AI_Dialog = () => {
    return {
      showDivider: false,
      icon: <BsMagic />,
      title: t("AI.popup.designWithAI"),
      content: (
        <AITemplateCreatorAccordion
          classes={classes}
          campaignId={campaignId}
          onRestore={(templateData) => {
            if (templateData) {
              setDialogType(null);
              loadNewTemplate(templateData);
            }
          }}
          onUpdate={(status, templateData) => {
            if (status === 'success' && templateData) {
              setDialogType(null);
              loadNewTemplate(templateData);
            }
          }} />
      ),
      showDefaultButtons: false
    };
  }

  const loadNewTemplate = async (templateData) => {
    setLoader(true);
    try {
      if (editorRef.current) {
        // If template is a string, parse it to JSON
        const templateJson = typeof templateData === 'string'
          ? JSON.parse(templateData)
          : templateData;

        // Load the template into the existing editor
        await editorRef.current.load(templateJson);

        // Save the newly loaded template
        saveDesign(false, null, false);
      }
    } catch (error) {
      console.error('Error loading template:', error);
      setToastMessage({ severity: 'error', color: 'error', message: 'Failed to load template', showAnimtionCheck: false });
    } finally {
      setLoader(false);
    }
  };

  const moreThanOneDynamicBlockModal = (data = '') => {
    const message = t(
      data === 'save' ? "common.noMoreThanOneDynamicBlockSave"
        : (data === "exit" ? "common.noMoreThanOneDynamicBlockExit" : "common.noMoreThanOneDynamicBlock")
    );
    return {
      showDivider: false,
      title: t("common.pleaseNotice"),
      content: (
        <Box>
          <Typography title={message} className={classes.alignDir}>
            {RenderHtml(message)}
          </Typography>
        </Box>
      ),
      renderButtons: () => (
        <Grid
          container
          spacing={4}
          className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null)}
        >
          <Grid item>
            <Button
              variant='contained'
              size='small'
              onClick={() => setDialogType(null)}
              className={clsx(
                classes.btn,
                classes.btnRounded
              )}>
              {t('common.Ok')}
            </Button>
          </Grid>
        </Grid>
      )
    };
  }

  const handleGetPlanForFeature = (tierMessageCode) => {
      const planName = findPlanByFeatureCode(
          tierMessageCode,
          availablePlans,
          currentPlan.Id
      );
      
      if (planName) {
          return t('billing.tier.featureNotAvailable').replace('{feature}', t(TierFeatures[tierMessageCode] || tierMessageCode)).replace('{planName}', planName);
      } else {
          return t('billing.tier.noFeatureAvailable');
      }
  };

  const getTierValidationDialog = () => ({
    title: t('billing.tier.permission'),
    showDivider: false,
    content: (
      <Typography style={{ fontSize: 18 }} className={clsx(classes.textCenter)}>
        {handleGetPlanForFeature(TierMessageCode)}
      </Typography>
    ),
    renderButtons: () => (
      <Grid
          container
          spacing={2}
          className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null, !get(subAccount, 'CompanyAdmin', false) ? classes.dNone : '')}
      >
          <Grid item>
              <Button
                  onClick={() => {
                      setShowTierPlans(true);
                  }}
                  className={clsx(classes.btn, classes.btnRounded)}
              >
                  {t('billing.upgradePlan')}
              </Button>
          </Grid>
          <Grid item>
              <Button
                  onClick={() => setDialogType(null)}
                  className={clsx(classes.btn, classes.btnRounded)}
              >
                  {t('common.cancel')}
              </Button>
          </Grid>
      </Grid>
    )
  });

  const getPendingApprovalModal = (code) => ({
    title: t('campaigns.newsLetterEditor.errors.pendingApproval'),
    showDivider: false,
    content: (
      <Typography style={{ fontSize: 18 }} className={clsx(classes.textCenter)}>
        {t(code === 550 ? "campaigns.newsLetterEditor.errors.PendingApprovalDesc" : "campaigns.newsLetterEditor.errors.PendingApproval551Desc")}
      </Typography>
    ),
    onConfirm: async () => {
      setDialogType({
        type: '',
        data: ''
      });
    }
  })

  // Email Size Exceeded Dialog
  const getEmailSizeExceededDialog = (data = {}) => ({
    title: t('campaigns.emailSize.exceeded.title'),
    showDivider: false,
    contentStyle: classes.maxWidth400,
    content: (
      <Box>
        <Typography className={clsx(classes.textCenter, classes.font18, componentClasses.exceededDialogSubtitle)}>
          {t('campaigns.emailSize.exceeded.mainText')}
        </Typography>

        <Box className={componentClasses.exceededDialogSizeBox}>
          <Typography className={componentClasses.exceededDialogCurrentSize}>
            {data.currentSize} KB
          </Typography>
          <Typography className={componentClasses.exceededDialogMaxSize}>
            / 102 KB
          </Typography>
        </Box>

        <Typography className={clsx(classes.textCenter, classes.font16, componentClasses.exceededDialogWarning)}>
          {t('campaigns.emailSize.exceeded.recommendation')}
        </Typography>
      </Box>
    ),
    renderButtons: () => {
      // Default for save action - just one button
      return (
        <Grid
          container
          spacing={2}
          className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null)}
        >
          <Grid item>
            <Button
              onClick={() => executePendingAction('back')}
              className={clsx(classes.btn, classes.btnRounded)}
            >
              {t('campaigns.emailSize.exceeded.backToEditor')}
            </Button>
          </Grid>
          {
            (pendingAction === 'testSend' || pendingAction === 'save' || pendingAction === 'continue') && (
              <Grid item>
                <Button
                  onClick={() => {
                    executePendingAction(pendingAction);
                  }}
                  variant='contained'
                  className={clsx(classes.btn, classes.btnRounded)}
                >
                  {
                    pendingAction === 'testSend' 
                      ? t('campaigns.emailSize.exceeded.continueToTestSending')
                      : (pendingAction === 'save' ? t('campaigns.emailSize.exceeded.continueToSave') : t('campaigns.emailSize.exceeded.continueToSendSettings'))
                  }
                </Button>
              </Grid>
            )
          }
        </Grid>
      );
    }
  });

  const renderDialog = () => {
    const { type, data } = dialogType || {}
    let currentDialog = {};
    if (type === 'emailSizeExceeded') {
      currentDialog = getEmailSizeExceededDialog(data);
    } else if (type === 'productCatalogPrompt') {
      currentDialog = productCatalogModal(data);
    } else if (type === 'moreThanOneDynamicBlock') {
      currentDialog = moreThanOneDynamicBlockModal(data);
    } else if (type === DialogType.PENDING_APPROVAL) {
      currentDialog = getPendingApprovalModal(data);
    } else if (type === DialogType.UNDER_REVIEW) {
      currentDialog = getPendingApprovalModal(551);
    } else if (type === 'tier') {
      currentDialog = getTierValidationDialog();
    }
    else if (type === 'AIDialog') {
      currentDialog = AI_Dialog();
    }

    if (type) {
      return (
        dialogType && <BaseDialog
          classes={classes}
          open={dialogType}
          onCancel={() => setDialogType(null)}
          onClose={() => setDialogType(null)}
          renderButtons={currentDialog?.renderButtons || null}
          {...currentDialog}>
          {currentDialog?.content}
        </BaseDialog>
      )
    }
  }

  const handleContinueClick = () => {
    setPendingAction('continue');
    const canProceed = checkEmailSizeBeforeAction('continue');
    if (!canProceed) return;
    setLoader(true);
    handleContinueFlow(false);
  };

  const renderButtons = () => {
    const wizardButtons = [];
    if (!isFromAutomation) {
      wizardButtons.push(<>
        <Button
          size='small'
          onClick={() => {
            setPendingAction('save');
            const canProceed = checkEmailSizeBeforeAction('save');
            if (!canProceed) return;
            saveDesign(false, null, true, true, 'save');
          }}
          className={clsx(
            classes.btn,
            classes.btnRounded,
            classes.backButton
          )}
          style={{ margin: '8px' }}
          startIcon={silentSave ? <Loader isOpen={silentSave} size={20} showBackdrop={false} contained={true} /> : <BiSave />}
          color="primary"
          key={'saveButton'}
        >{t("common.save")}
        </Button>
        {fromLink?.toLowerCase() !== 'autoresponder' && <Button onClick={handleContinueClick}
          variant='contained'
          size='small'
          className={clsx(
            classes.btn,
            classes.btnRounded,
            classes.backButton
          )}
          endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
          style={{ marginInlineStart: '8px' }}
          color="primary"
          key={'createButton'}
        >{t('common.continue')}</Button>
        }
      </>)
    }
    else {
      wizardButtons.push(<>
        <Button
          size="small"
          onClick={() =>
            saveDesign(false, null, true)}
          className={clsx(
            classes.btn,
            classes.btnRounded,
            classes.backButton
          )}
          endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
          style={{ margin: '8px' }}
          startIcon={<BiSave />}
          color="primary"
          key={'saveAutomationButton'}
        >{t("common.save")}
        </Button>
        <Button onClick={() => {
          saveDesign(true, `/Pulseem/CreateAutomations.aspx?AutomationID=${isFromAutomation}&NodeToEdit=${NodeToEdit}&fromreact=true&Culture=${isRTL ? 'he-IL' : 'en-US'}`, false);
        }}
          className={clsx(
            classes.btn,
            classes.btnRounded,
            classes.backButton
          )}
          endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
          style={{ marginInlineStart: '8px' }}
          color="primary"
          key={'createAutomationButton'}
          size="small"
        >{t('common.backToAutomation')}</Button>
      </>)
    }

    return wizardButtons.map((b) => b);
  }
  return (
    <DefaultScreen
      showAppBar={false}
      currentPage='campaignEditor'
      classes={classes}
      customPadding={true}
      containerClass={[classes.fullWidth, classes.noPadding]}
    >
      {renderToast()}
      {showGalleryModal()}
      {showDocumentsModal()}
      {/* {emailSize.totalKB > 0 && <EmailSizeIndicator />} */}
      {
        dialog === DialogType.Templates && <Templates
          classes={classes}
          onClose={(template) => {
            setDialog(null);
            if (template !== undefined) {
              setOverwriteTemplateDialog(true);
              setNewTemplate(template);
            }
          }}
          isOpen={dialog === DialogType.Templates}
        />
      }
      <NoCreditsModal
        classes={classes}
        onClose={() => setDialog(null)}
        isOpen={dialog === DialogType.NO_CREDITS_LEFT}
      />
      <DemoModal modals={modals} />
      <TestSend
        classes={classes}
        isOpen={dialog === DialogType.TEST_SEND}
        onClose={() => setDialog(null)}
        onSubmit={onTestSendSubmit}
        campaignId={campaignId || params?.id}
      />
      <GenericModal
        classes={classes}
        modalData={genericModalData}
        isOpen={dialog === DialogType.GENERIC}
      />
      <ResponseModal
        classes={classes}
        isOpen={dialog && isResponseModal}
        onClose={handleCloseReponse}
        onConfirm={handleCloseReponse}
        summaryData={summaryData}
        message={dialog}
      />
      <Box className={classes.containerFullHeight}>
        <div id="bee-plugin-container" className={classes.containerFullHeight}></div>
      </Box>
      <WizardActions
        disabled={buttonDisabled}
        campaignId={campaignId}
        ignorePaddingBottom={true}
        innerStyle={{ paddingInline: 15 }}
        classes={classes}
        onExit={!isFromAutomation && onExit}
        onTestSend={campaign?.IsFirstCampaign === false && handleOpenTestSend}
        onBack={
          fromLink?.toLowerCase() !== 'autoresponder' && {
            callback: () => { onBack() },
            text: t('campaigns.newsletterSetUp')
          }
        }
        onDelete={userRoles?.AllowDelete && fromLink?.toLowerCase() !== 'autoresponder' && onDelete}
        // onShowGallery={() => { setShowGallery(true) }}
        onShowDocuments={() => { setShowDocuments(true) }}
        additionalButtons={renderButtons()}
        additionalButtonsOnStart={renderTemplateButtons()}
        helperText={<label style={{ fontSize: 14 }}>{lastSaveText}</label>}
      />
      <OverwriteTemplatePopUp
        classes={classes}
        onClose={(resp) => {
          if (resp) {
            setOverwriteTemplateDialog(false);
            initBeeEditor(newTemplate.ID);
          }
          setOverwriteTemplateDialog(false);
        }}
        isOpen={overwriteTemplateDialog}
      />
      <SaveTemplate
        classes={classes}
        onClose={(resp) => {
          setDialog(null);
          if (resp !== undefined) saveTemplate(resp.name, resp.category);
        }}
        isOpen={dialog === DialogType.SAVE_TEMPLATE}
      />
      <DomainVerification
        classes={classes}
        domain={domainAddressError}
        forceShow={showDomainVerification}
        key={"fromBeeEditor"}
        onClose={() => {
          setShowDomainVerification(false)
        }}
      />
      <PayPerRecipientNew
        classes={classes}
        isOpen={isOpenPayPerRecipient}
        onClose={() => {
          setIsOpenPayPerRecipient(false);
        }}
        jumpToStep={2}
      />
      {renderDialog()}
      <Loader isOpen={showLoader} showBackdrop={false} />
      {showTierPlans && <TierPlans
        classes={classes}
        isOpen={showTierPlans}
        onClose={() => setShowTierPlans(false)}
      />}
    </DefaultScreen>
  )
}

export default CampaignEditor;
