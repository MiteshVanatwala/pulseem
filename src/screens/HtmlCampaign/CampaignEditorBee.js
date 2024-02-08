import clsx from 'clsx';
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
  deleteUserBlock
} from '../../redux/reducers/campaignEditorSlice';
import { Loader } from '../../components/Loader/Loader';
import { getAccountExtraData, getPreviousLandingData, getTestGroups } from "../../redux/reducers/smsSlice";
import { useTranslation } from "react-i18next";
import TestSend from './modals/TestSend'
import ResponseModal from './modals/ResponseModal'
import NoCreditsModal from './modals/NoCreditsModal'
import Toast from '../../components/Toast/Toast.component';
import GenericModal from './modals/GenericModal';
import { GiExitDoor } from 'react-icons/gi'
import { BsTrash } from "react-icons/bs";
import { deleteCampaign } from '../../redux/reducers/newsletterSlice';
import { getCommonFeatures, isAlive } from '../../redux/reducers/commonSlice';
import { AiOutlineExclamationCircle } from "react-icons/ai";
import WizardActions from '../../components/Wizard/WizardActions';
import { getBeeToken } from '../../redux/reducers/campaignEditorSlice';
import { initExtraDataField, initLandingPages } from './helper/MigratePulseemData';
import { BeeConfig, DialogType, DefaultContent } from './helper/Config';
import { IoMdImages } from 'react-icons/io';
import { Dialog } from "../../components/managment/Dialog";
import Gallery from '../../components/Gallery/Gallery.component';
import { PulseemFolderType } from "../../model/PulseemFields/Fields";
import { getFileGallery } from '../../redux/reducers/gallerySlice';
import { BiSave } from 'react-icons/bi'

// User input controls
import { EditRow } from './components/ContentDialogs'

// Generic modal component with event hooks
import useModals from './hooks/useModals'
import { DemoModal } from './components/DemoModal'
import useMockAPI from './hooks/useMockAPI';
import { useParams } from 'react-router-dom';
/* END Bee */

const CampaignEditor = ({ classes, ...props }) => {
  //#region State
  const { t } = useTranslation();
  const dispatch = useDispatch()
  const params = useParams();
  const editorRef = useRef(null);
  const saveRef = useRef(null);
  const [showLoader, setLoader] = useState(true);
  const campaignId = params?.id;
  const [dataReady, setDataReady] = useState(false);
  const [mergeData, setPulseemMergeData] = useState({});
  const { campaign, userBlocks, ToastMessages, beeToken } = useSelector(state => state.campaignEditor);
  const { extraData, previousLandingData } = useSelector(state => state.sms);
  const { language, isRTL, accountSettings } = useSelector(state => state.core)
  const { tokenAlive } = useSelector(state => state.common)
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
  const [isSiteTracking, setIsSiteTracking] = useState(false);
  const queryParams = new URLSearchParams(window.location.search)
  const isFromAutomation = queryParams.get("FromAutomation");
  const NodeToEdit = queryParams.get("NodeToEdit");

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
      Promise.all([initFields(), siteTrackingLogic()]).then(() => {
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
    if (params?.id != null && params?.id > 0) {
      getData();
    }
  }, [dispatch]);
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
      icon: (
        <AiOutlineExclamationCircle
          style={{ fontSize: 30, color: "#fff" }}
        />
      ),
      showDefaultButtons: false,
      renderButtons: () =>
      (<Button
        size='small'
        variant='contained'
        className={clsx(
          classes.confirmButton,
          classes.dialogConfirmButton,
          classes.dialogButtonCenter
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
    setDataReady(true);
    const initBeeToken = () => {
      dispatch(getBeeToken());
    }
    initBeeToken();
  }
  const siteTrackingLogic = () => {
    if (accountSettings?.SubAccountSettings.DomainAddress && accountSettings?.SubAccountSettings.DomainAddress !== '') {
      const domainName = accountSettings?.SubAccountSettings.DomainAddress.replace('https://', '').replace('http://', '').replace('www.', '');
      if (campaign?.HtmlData?.indexOf(domainName) > -1) {
        setIsSiteTracking(true);
      }
      else {
        setIsSiteTracking(false);
      }
    }
  }
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
  const initBeeEditor = () => {
    initSpecialLinks().then((specialLinksFiles) => {
      const isRtlLang = campaign?.LanguageCode === 0 || campaign?.LanguageCode === 8 ? true : false;
      const defaultContent = DefaultContent(isRtlLang);
      config.uid = accountSettings?.SubAccountSettings?.BeeUniqueID;
      config.mergeTags = mergeData;
      config.specialLinks = specialLinksFiles;
      config.titleDefaultStyles = defaultContent.titleDefaultStyles;
      config.contentDefaults = defaultContent.contentDefaults;

      initTags();

      switch (beeToken?.StatusCode) {
        case 201: {
          const beeObject = JSON.parse(beeToken.Message);
          if (beeToken.Message === "null" || beeToken.Message === null) {
            setDialog(DialogType.MISSING_API_KEY);
          }
          else {
            const beeTest = new BeePlugin(beeObject);
            const template = campaign?.JsonData ? JSON.parse(campaign?.JsonData) : defaultContent.defaultTemplate;
            beeTest.start(config, template).then((instance) => {
              editorRef.current = instance;
              if (!campaign || !campaign.HtmlData) {
                saveDesign(false, null, false);
              }
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
  const doaminWithClientRef = (str) => {
    let finalStr = str;
    const startIndex = finalStr.substring(finalStr.indexOf(accountSettings?.SubAccountSettings.DomainAddress));
    const originalLink = startIndex.split(/[\s\n]+/);
    let originUrl = originalLink[0].replace('\"', '').replace('\\', '');
    let newUrl = originUrl.trim();
    if (newUrl.indexOf('ClientIDEnc') === -1) {
      newUrl += newUrl.indexOf('?') > -1 ? '&ref=##ClientIDEnc##' : '?ref=##ClientIDEnc##';
      finalStr = finalStr.replace(originUrl, newUrl);
    }
    return finalStr;
  }
  const onSave = async (args) => {
    try {
      setLoader(true);
      let finalHtml = args.HtmlData;
      let finalJson = args.JsonData;

      if (isSiteTracking === true) {
        if (!args.HtmlData.indexOf('ref') > -1) {
          finalHtml = doaminWithClientRef(args.HtmlData);
          finalJson = doaminWithClientRef(args.JsonData);
        }
      }
      const response = await dispatch(saveCampaign({
        Name: campaign.Name,
        campaignId: args.campaignId,
        JsonData: finalJson,
        HTML: finalHtml
      }));

      if (response.payload === true) {
        if (saveRef.current?.redirectAfterSave) {
          window.location = saveRef.current?.redirectUrl ?? `/Pulseem/SendCampaign.aspx?CampaignID=${args.campaignId}&fromreact=true`;
          return false;
        }
        else if (saveRef.current?.showAnimation) {
          setToastMessage(ToastMessages.CAMPAIGN_SAVED);
        }
      }
      else {
        console.log(response);
      }
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
  }
  const deleteNewsletter = async () => {
    setDialog(null);
    await dispatch(deleteCampaign(campaignId));
    window.location = `/react/Campaigns`;
  }
  const onDelete = () => {
    setIsResponseModal(false);
    setGenericModalData({
      title: t('campaigns.GridButtonColumnResource2.ConfirmTitle'),
      message: t("mainReport.confirmSure"),
      icon: <BsTrash />,
      onConfirm: () => deleteNewsletter(),
      onCancel: () => setDialog(null),
      onClose: () => setDialog(null)
    });
    setDialog(DialogType.GENERIC);
  }
  const handleExitCampaign = (saveBeforeExit = true) => {
    setDialog(null);
    if (saveBeforeExit) {
      saveDesign(true, '/react/Campaigns', false);
    }
    else {
      window.location.href = '/react/Campaigns';
    }
  }
  const onExit = () => {
    setGenericModalData({
      title: t('mainReport.handleExitTitle'),
      message: t("mainReport.leaveCampaign"),
      icon: <GiExitDoor />,
      onClose: () => handleExitCampaign(false),
      onConfirm: () => handleExitCampaign(true),
      onCancel: () => setDialog(null)
    });
    setDialog(DialogType.GENERIC);
  }
  const onBack = () => {
    if (isFromAutomation) {
      saveDesign(true, `/react/Campaigns/Create/${campaignId}?FromAutomation=${isFromAutomation}&NodeToEdit=${NodeToEdit}`)
    }
    else {
      saveDesign(true, `/react/Campaigns/Create/${campaignId}`)
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
      }, 4000);
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
    });
  }
  const onEditBlock = (blockRequest) => {
    setLoader(true);
    dispatch(saveUserBlock(blockRequest)).then(async () => {
      setLoader(false);
      dispatch(getUserblocks());
    });
  }
  const handleDeleteBlock = (e, row_id) => {
    dispatch(deleteUserBlock(row_id)).then((result) => {
      console.log(result);
    })
  }
  const handleOpenTestSend = () => {
    saveDesign(false, null, false).then(async (r) => {
      setIsResponseModal(false);
      editorRef.current.send();
    });
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

  const showGalleryModal = () => {
    if (showGallery) {
      let dialog = {
        showDivider: false,
        icon: (
          <IoMdImages style={{ fontSize: 30, color: '#fff' }} />
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
        <Dialog
          maxHeight="calc(70vh)"
          disableBackdropClick={true}
          style={{ minHeight: 400 }}
          showDivider={false}
          classes={classes}
          open={showGallery}
          onClose={() => { setShowGallery(false); }}
          onConfirm={() => { setShowGallery(false); }}
          {...dialog}>
          {dialog.content}
        </Dialog>
      );
    }
  }
  const showDocumentsModal = () => {
    if (showDocs) {
      let dialog = {
        showDivider: false,
        icon: (
          <IoMdImages style={{ fontSize: 30, color: '#fff' }} />
        ),
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
        <Dialog
          maxHeight="calc(70vh)"
          disableBackdropClick={true}
          style={{ minHeight: 400 }}
          showDivider={false}
          classes={classes}
          open={showDocs}
          onClose={() => { setShowDocuments(false); }}
          onConfirm={() => { setShowDocuments(false); initBeeEditor(); }}
          {...dialog}>
          {dialog.content}
        </Dialog>
      );
    }
  }

  const renderButtons = () => {
    const wizardButtons = [];
    if (!isFromAutomation) {
      wizardButtons.push(<>
        <Button
          onClick={() =>
            saveDesign(false, null, true)}
          variant='contained'
          size='medium'
          className={clsx(
            classes.actionButton,
            classes.actionButtonLightBlue,
            classes.backButton
          )}
          style={{ margin: '8px' }}
          startIcon={<BiSave />}
          color="primary"
        >{t("common.save")}
        </Button>
        <Button onClick={saveDesign}
          variant='contained'
          size='medium'
          className={clsx(
            classes.actionButton,
            classes.actionButtonLightGreen,
            classes.backButton
          )}
          style={{ marginInlineStart: '8px' }}
          color="primary"
        >{t('common.continue')}</Button>
      </>)
    }
    else {
      wizardButtons.push(<>
        <Button
          onClick={() =>
            saveDesign(false, null, true)}
          variant='contained'
          size='medium'
          className={clsx(
            classes.actionButton,
            classes.actionButtonLightBlue,
            classes.backButton
          )}
          style={{ margin: '8px' }}
          startIcon={<BiSave />}
          color="primary"
        >{t("common.save")}
        </Button>
        <Button onClick={() => {
          saveDesign(true, `/Pulseem/CreateAutomations.aspx?AutomationID=${isFromAutomation}&NodeToEdit=${NodeToEdit}&fromreact=true`, false);
        }}
          variant='contained'
          size='medium'
          className={clsx(
            classes.actionButton,
            classes.actionButtonLightGreen,
            classes.backButton
          )}
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
        campaignId={campaignId}
        innerStyle={{ paddingInline: 15 }}
        classes={classes}
        onExit={!isFromAutomation && onExit}
        onTestSend={campaign?.IsFirstCampaign === false && handleOpenTestSend}
        onBack={{
          callback: () => { onBack() },
          text: t('campaigns.newsletterSetUp')
        }}
        onDelete={onDelete}
        // onShowGallery={() => { setShowGallery(true) }}
        onShowDocuments={() => { setShowDocuments(true) }}
        additionalButtons={renderButtons()}
      />
      <Loader isOpen={showLoader} showBackdrop={false} />
    </DefaultScreen>
  )
}

export default CampaignEditor;
