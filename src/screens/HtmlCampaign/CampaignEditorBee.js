import clsx from 'clsx';
import { debounce } from 'lodash';
import BeePlugin from '@mailupinc/bee-plugin'
import { Box, Button } from '@material-ui/core'
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
  // saveTemplateToAccount,
  // getTemplateById,
  // getPublicTemplates,
  // getAllTemplatesBySubaccountId
} from '../../redux/reducers/campaignEditorSlice';
import { Loader } from '../../components/Loader/Loader';
import { getAccountExtraData, getPreviousLandingData, getTestGroups } from "../../redux/reducers/smsSlice";
import { useTranslation } from "react-i18next";
import TestSend from './modals/TestSend'
import ResponseModal from './modals/ResponseModal'
import NoCreditsModal from './modals/NoCreditsModal'
import Toast from '../../components/Toast/Toast.component';
import GenericModal from './modals/GenericModal';
import { deleteCampaign } from '../../redux/reducers/newsletterSlice';
import { getCommonFeatures, isAlive } from '../../redux/reducers/commonSlice';
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

// Generic modal component with event hooks
import useModals from './hooks/useModals'
import { DemoModal } from './components/DemoModal'
import useMockAPI from './hooks/useMockAPI';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
// // import Templates from './modals/Templates.tsx';
// // import OverwriteTemplatePopUp from '../Groups/Management/Popup/OverwriteTemplatePopUp';
// // import SaveTemplate from './modals/SaveTemplate';
/* END Bee */
import { sitePrefix } from '../../config';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { BaseDialog } from '../../components/DialogTemplates/BaseDialog';
import { getAuthorizedEmails } from '../../redux/reducers/commonSlice';
import DomainVerification from '../../Shared/Dialogs/DomainVerification';
import { SharedEmailDomain } from '../../config';

const CampaignEditor = ({ classes, ...props }) => {
  //#region State
  const { t } = useTranslation();
  const dispatch = useDispatch()
  const navigate = useNavigate();
  const params = useParams();
  const editorRef = useRef(null);
  const saveRef = useRef(null);
  const [showLoader, setLoader] = useState(true);
  const campaignId = params?.id;
  const [dataReady, setDataReady] = useState(false);
  const [mergeData, setPulseemMergeData] = useState({});
  const { campaign, userBlocks, ToastMessages, beeToken, publicTemplates } = useSelector(state => state.campaignEditor);
  const { extraData, previousLandingData } = useSelector(state => state.sms);
  const { language, isRTL } = useSelector(state => state.core)
  const { tokenAlive, accountSettings, accountFeatures, verifiedEmails } = useSelector(state => state.common)
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
  // const [overwriteTemplateDialog, setOverwriteTemplateDialog] = useState(false);
  // const [newTemplate, setNewTemplate] = useState('');
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
      })
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
    // if (!publicTemplates.length) dispatch(getPublicTemplates(isRTL));
    // dispatch(getAllTemplatesBySubaccountId());
    // if (!publicTemplates.length) dispatch(getPublicTemplates(isRTL));
    // dispatch(getAllTemplatesBySubaccountId());
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

  const getData = async () => {
    setLoader(true);
    await dispatch(getCampaignById(params?.id));
    await dispatch(getAccountExtraData());
    await dispatch(getPreviousLandingData());
    await dispatch(getTestGroups());
    await dispatch(getUserblocks());
    await dispatch(getAuthorizedEmails());
    await dispatch(getAuthorizedEmails());
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
    if (tags && tags?.length > 0) {
      config.rowsConfiguration.externalContentURLs = [];
      let tempRows = [];
      tags?.forEach((tag, idx) => {
        if (tag && tag !== undefined && tag !== null) {
          const tagObj = {
            name: tag.trim(),
            value: tag.replace(' ', ''),
            handle: tag.replace(' ', ''),
            isLocal: true,
            behaviors: {
              canEdit: true,
              canDelete: true,
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
      config.rowsConfiguration.externalContentURLs = tempRows;
    }
  }
  const initBeeEditor = (templateId = null) => {
    initSpecialLinks().then(async (specialLinksFiles) => {
      const isRtlLang = campaign?.LanguageCode === 0 || campaign?.LanguageCode === 8 ? true : false;
      let forceTemplate = null;
      let defaultContent = DefaultContent(isRtlLang);
      // if (templateId !== null) {
      //   const templateResponse = await dispatch(getTemplateById(templateId));

      // //   if (templateResponse?.payload?.StatusCode === 201) {
      // //     const responseData = templateResponse?.payload?.Data;
      // //     setNewTemplate(responseData)
      // //     forceTemplate = responseData?.JsonData ? JSON.parse(responseData?.JsonData) : defaultContent.defaultTemplate;
      // //   } else {
      // //     setToastMessage({ severity: 'error', color: 'error', message: templateResponse?.payload.Message, showAnimtionCheck: false });
      // //   }
      // // }

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

            // if (forceTemplate !== null) {
            //   template = forceTemplate;
            // }
            // else {
            //   template = campaign?.JsonData ? JSON.parse(campaign?.JsonData) : defaultContent.defaultTemplate;
            // }

            beeTest.start(config, template).then((instance) => {
              editorRef.current = instance;
              if ((!campaign || !campaign.HtmlData) && (!params?.id || params?.id === 0)) {
                saveDesign(false, null, false);
              }
              setTimeout(() => {
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
  useEffect(() => {
    if (beeToken) {
      initBeeEditor();
    }

  }, [beeToken]);

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
    const reInit = saveRef.current?.reInitEditor;

    try {
      if (saveRef.current?.showAnimation) setLoader(true);
      let finalHtml = args.HtmlData;
      let finalJson = args.JsonData;

      const response = await dispatch(saveCampaign({
        Name: campaign.Name,
        campaignId: args.campaignId,
        JsonData: finalJson,
        HTML: finalHtml,
        IsAutoResponder: fromLink?.toLowerCase() === 'autoresponder'
      }));

      if (response.payload === true) {
        if (saveRef.current?.redirectAfterSave) {
          const isAutoResponder = fromLink?.toLowerCase() === 'autoresponder';
          localStorage.setItem('reloadBeeEditor', 1);

          if (isAutoResponder) {
            window.location.href = saveRef.current?.redirectUrl ?? `${sitePrefix}Campaigns/SendSettings/${args.campaignId}`;
          }
          else {
            navigate(saveRef.current?.redirectUrl ?? `${sitePrefix}Campaigns/SendSettings/${args.campaignId}`);
          }
          return false;
        }
        else if (saveRef.current?.showAnimation) {
          // setToastMessage(saveRef.current?.saveTemplate ? ToastMessages.TEMPLATE_SAVED : ToastMessages.CAMPAIGN_SAVED);
          setToastMessage(ToastMessages.CAMPAIGN_SAVED);
        }

        if (reInit) {
          getData();
        }
      }

      // if (saveRef.current?.saveTemplate) {
      //   const templateResponse = await dispatch(saveTemplateToAccount({
      //     Name: saveRef.current?.templateName,
      //     JsonData: finalJson,
      //     HTML: finalHtml,
      //     Category: saveRef.current?.templateCategory
      //   }));
      //   if (!templateResponse.payload.Data) {
      //     setToastMessage({ severity: 'error', color: 'error', message: templateResponse.payload.Message, showAnimtionCheck: false });
      //   }
      //   dispatch(getAllTemplatesBySubaccountId());
      // }
    } catch (e) {
      console.error(e);
    }
    finally {
      setLoader(false);
    }
  }
  const saveDesign = async (redirectAfterSave = false, redirectUrl = null, showAnimation = true) => {
    saveRef.current = { redirectAfterSave: redirectAfterSave, redirectUrl: redirectUrl, showAnimation: showAnimation };
    await editorRef.current.save();
    setTimeout(() => {
      const now = moment();
      setLastSaveText(`${t('common.lastSaveAt')} ${moment(now).format("hh:mm:ss")}`)
      setSilentSave(false)
    }, 2000);
  }

  const onAutoSaveCampaign = debounce(() => {
    setSilentSave(true)
    saveDesign(false, null, false);
  }, 5000);

  const onDesignChange = async () => {
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
  const handleExitCampaign = (saveBeforeExit = true) => {
    setDialog(null);
    const isAutoResponder = fromLink?.toLowerCase() === 'autoresponder';
    const redirectLink = isAutoResponder ? `/Pulseem/AutoSendPlans.aspx?Culture=${isRTL ? 'he-IL' : 'en-US'}` : `${sitePrefix}Campaigns`;

    if (saveBeforeExit) {
      saveDesign(true, redirectLink, false);
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
    onTestSendResponse(reponse.payload.StatusCode);
    setSummaryData(reponse.payload.Summary);
    setLoader(false);
  }
  const onTestSendResponse = (statusCode) => {
    setIsResponseModal(statusCode !== 402);
    switch (statusCode) {
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
      }, 2000);
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
      setLoader(false);
      dispatch(getUserblocks());
      await setRow(json);
    });
  }
  const onEditBlock = (blockRequest) => {
    setLoader(true);
    dispatch(saveUserBlock(blockRequest)).then(async () => {
      setLoader(false);
      await setRow(JSON.stringify(blockRequest?.Json));
    });
  }
  const handleDeleteBlock = (e, row_id) => {
    dispatch(deleteUserBlock(row_id)).then((result) => {
      console.log(result);
    })
  }
  const handleOpenTestSend = () => {
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
      saveDesign(false, null, false).then(async (r) => {
        setIsResponseModal(false);
        editorRef.current.send();
      });
    }
  }

  // const handleAutoSave = () => {
  //   saveDesign(false, null, false);
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
      t: t
    });
  }
  const config = getConfig();


  // const saveTemplate = async (name, category) => {
  //   saveRef.current = { templateName: name, templateCategory: category, saveTemplate: true, showAnimation: true };
  //   await editorRef.current.save();
  // }

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

  // const renderTemplateButtons = () => {
  //   return <>
  //     <Button onClick={() => {
  //       setLoader(true);
  //       setTimeout(() => {
  //         setDialog(DialogType.Templates);
  //       }, 1000);

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
  const renderButtons = () => {
    const wizardButtons = [];
    if (!isFromAutomation) {
      wizardButtons.push(<>
        <Button
          onClick={() =>
            saveDesign(false, null, true)}
          className={clsx(
            classes.btn,
            classes.btnRounded,
            classes.backButton
          )}
          style={{ margin: '8px' }}
          startIcon={silentSave ? <Loader isOpen={silentSave} size={20} showBackdrop={false} contained={true} /> : <BiSave />}
          color="primary"
        >{t("common.save")}
        </Button>
        {fromLink?.toLowerCase() !== 'autoresponder' && <Button onClick={() => {
          saveDesign(false, null, false);
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
            saveDesign(true);
          }

        }}
          variant='contained'
          size='medium'
          className={clsx(
            classes.btn,
            classes.btnRounded,
            classes.backButton
          )}
          endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
          style={{ marginInlineStart: '8px' }}
          color="primary"
        >{t('common.continue')}</Button>
        }
      </>)
    }
    else {
      wizardButtons.push(<>
        <Button
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
      {/* {
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
      } */}
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
        innerStyle={{ paddingInline: 15, marginBottom: 40 }}
        classes={classes}
        onExit={!isFromAutomation && onExit}
        onTestSend={campaign?.IsFirstCampaign === false && handleOpenTestSend}
        onBack={
          fromLink?.toLowerCase() !== 'autoresponder' && {
            callback: () => { onBack() },
            text: t('campaigns.newsletterSetUp')
          }
        }
        onDelete={fromLink?.toLowerCase() !== 'autoresponder' && onDelete}
        // onShowGallery={() => { setShowGallery(true) }}
        onShowDocuments={() => { setShowDocuments(true) }}
        additionalButtons={renderButtons()}
        // additionalButtonsOnStart={renderTemplateButtons()}
        helperText={<label style={{ fontSize: 14 }}>{lastSaveText}</label>}
      />
      {/* <OverwriteTemplatePopUp
      {/* <OverwriteTemplatePopUp
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
      /> */}
      <DomainVerification
        classes={classes}
        domain={domainAddressError}
        forceShow={showDomainVerification}
        key={"fromBeeEditor"}
        onClose={() => {
          setShowDomainVerification(false)
        }}
      />
      <Loader isOpen={showLoader} showBackdrop={false} />
    </DefaultScreen>
  )
}

export default CampaignEditor;
