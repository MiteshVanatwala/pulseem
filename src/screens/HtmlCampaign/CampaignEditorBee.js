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
import { BeeConfig, DialogType } from './helper/Config';
import { IoMdImages } from 'react-icons/io';
import { Dialog } from "../../components/managment/Dialog";
import Gallery from '../../components/Gallery/Gallery.component';
import { PulseemFolderType } from "../../model/PulseemFields/Fields";
import { getFileGallery } from '../../redux/reducers/gallerySlice';

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
  const [specialLinks, setSpecialLinks] = useState([]);
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

  //#endregion State

  //#region Get Extra fields & Landing pages, after Data Ready
  useEffect(() => {
    if (dataReady) {
      const initFields = () => {
        initExtraDataField(extraData, t).then((exData) => {
          setPulseemMergeData(exData);
        })
      }
      const initSpecialLinks = () => {
        initLandingPages(previousLandingData, t).then((items) => {
          dispatch(getFileGallery(PulseemFolderType.DOCUMENT)).then((response) => {
            const gallery = response.payload;
            const specialLinksFiles = items;

            gallery?.Files?.forEach((file) => {
              specialLinksFiles.push({
                type: file.FolderName.indexOf('\\') > -1 ? file.FolderName.split('\\')[1] : file.FolderName,
                label: file.FileName,
                link: file.FileURL
              })
            });
            setSpecialLinks(specialLinksFiles);
          });
        });
      }
      Promise.all([initFields(), initSpecialLinks()]).then(() => {
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
    }, 30000);
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
  //#region Init Bee Token & Configuration
  const initTags = () => {
    let tempTags = [...new Set(userBlocks.map(item => item.tags))];
    var tags = [].concat.apply([], tempTags);
    if (tags && tags?.length > 0) {
      config.rowsConfiguration.externalContentURLs = [];
      tags?.forEach((tag, idx) => {
        if (tag && tag !== undefined && tag !== null) {
          config.rowsConfiguration.externalContentURLs.push({
            name: tag,
            value: tag.replace(' ', ''),
            handle: tag.replace(' ', ''),
            isLocal: true,
            behaviors: {
              canEdit: true,
              canDelete: true,
            },
          });
        }
      });
    }
  }
  const initBeeEditor = () => {
    config.uid = accountSettings?.SubAccountSettings?.BeeUniqueID;
    config.mergeTags = mergeData;
    config.specialLinks = specialLinks;

    initTags();

    switch (beeToken?.StatusCode) {
      case 201: {
        const beeObject = JSON.parse(beeToken.Message);
        if (beeToken.Message === "null" || beeToken.Message === null) {
          setDialog(DialogType.MISSING_API_KEY);
        }
        else {
          const beeTest = new BeePlugin(beeObject);
          const template = campaign?.JsonData ? JSON.parse(campaign?.JsonData) : { messageWidth: '600px' };
          beeTest.start(config, template).then((instance) => {
            editorRef.current = instance;
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
  }
  useEffect(() => {
    if (beeToken) {
      initBeeEditor();
    }
  }, [beeToken]);

  const initOptions = async () => {
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
    try {
      const response = await dispatch(saveCampaign({
        Name: campaign.Name,
        campaignId: args.campaignId,
        JsonData: args.JsonData,
        HTML: args.HtmlData
      }));

      if (response.payload === true) {
        if (saveRef.current?.redirectAfterSave) {
          window.location = saveRef.current?.redirectUrl ?? `/Pulseem/SendCampaign.aspx?CampaignID=${args.campaignId}&fromreact=true`;
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
    saveDesign(true, `/react/Campaigns/Create/${campaignId}`)
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
    dispatch(saveUserBlock(blockRequest)).then(() => {
      setLoader(false);
      dispatch(getUserblocks());
      setRow(json);
    });
  }
  const onEditBlock = (blockRequest) => {
    setLoader(true);
    dispatch(saveUserBlock(blockRequest)).then(() => {
      setLoader(false);
      setRow(JSON.stringify(blockRequest?.Json));
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
            // isConfirm={isGalleryConfirmed}
            // callbackSelectFile={handleSelectedImage}
            style={{ minWidth: 400 }}
            multiSelect={false}
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
          onClose={() => { setShowGallery(false) }}
          onConfirm={() => { setShowGallery(false) }}
          {...dialog}>
          {dialog.content}
        </Dialog>
      );
    }
  }

  return (
    <DefaultScreen
      currentPage='campaignEditor'
      classes={classes}
      customPadding={true}
      containerClass={[classes.fullWidth, classes.noPadding]}
    >
      {renderToast()}
      {showGalleryModal()}
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
        onExit={onExit}
        onTestSend={handleOpenTestSend}
        onSave={saveDesign}
        onBack={onBack}
        onDelete={onDelete}
        onShowGallery={() => { setShowGallery(true) }}
      />
      <Loader isOpen={showLoader} showBackdrop={false} />
    </DefaultScreen>
  )
}

export default CampaignEditor;
