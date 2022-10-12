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
  updateUserBlock,
  deleteUserBlock
} from '../../redux/reducers/campaignEditorSlice';
import { IoMdImages } from 'react-icons/io'
import { Loader } from '../../components/Loader/Loader';
import { options, tools } from './constants'
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
import Gallery from '../../components/Gallery/Gallery.component';
import { Dialog } from '../../components/managment/index';
import { getCommonFeatures, isAlive } from '../../redux/reducers/commonSlice';
import { AiOutlineExclamationCircle } from "react-icons/ai";
import WizardActions from '../../components/Wizard/WizardActions';
import { PulseemFolderType } from '../../model/PulseemFields/Fields';
import { getBeeToken } from '../../redux/reducers/campaignEditorSlice';
import { initExtraDataField, initLandingPages } from './helper/MigratePulseemData';
import { BeeConfig, DialogType } from './helper/Config';
import { getCookie } from '../../helpers/cookies';
import { BlockMeta } from './modals/BlockMeta';

const CampaignEditor = ({ classes, ...props }) => {
  //#region State
  const { t } = useTranslation();
  const dispatch = useDispatch()
  const editorRef = useRef(null);
  const saveRef = useRef(null);
  const [showLoader, setLoader] = useState(true);
  const campaignId = props.match.params.id;
  const [dataReady, setDataReady] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
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
  const [showGallery, setShowGallery] = useState(false);
  const [isGalleryConfirmed, setIsFileSelected] = useState(false);
  const [alertLogout, setAlertLogout] = useState(false);
  const [userBlock, setUserBlock] = useState(null);
  const [genericModalData, setGenericModalData] = useState({
    title: "",
    message: ""
  })
  //#endregion State
  //#region Get Extra fields & Landing pages, after Data Ready
  useEffect(() => {
    if (dataReady) {
      const initFields = () => {
        initExtraDataField(extraData, t).then((exData) => {
          setPulseemMergeData(exData);
        })
      }
      const initLP = () => {
        initLandingPages(previousLandingData, t).then((items) => {
          setSpecialLinks(items);
        });
      }
      Promise.all([initFields(), initLP()]).then(() => {
        setDataLoaded(true);
      })
    }
  }, [dataReady]);
  //#endregion
  // Get data by campaign id
  useEffect(() => {
    if (props.match.params.id != null && props.match.params.id > 0) {
      getData();
    }
  }, [dispatch]);
  useEffect(() => {
    initOptions();
  }, [language]);


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
    await dispatch(getCampaignById(props.match.params.id));
    await dispatch(getAccountExtraData());
    await dispatch(getPreviousLandingData());
    await dispatch(getTestGroups());
    await dispatch(getUserblocks());
    setDataReady(true);
    const initBee = () => {
      dispatch(getBeeToken());
    }
    initBee();
  }
  //#region Init Bee Token & Configuration
  useEffect(() => {
    const initRepsonse = () => {
      config.clientId = getCookie("jtoken");
      config.mergeTags = mergeData;
      config.specialLinks = specialLinks;

      switch (beeToken?.StatusCode) {
        case 201: {
          const beeObject = JSON.parse(beeToken.Message);
          if (beeToken.Message === "null") {
            setDialog(DialogType.MISSING_API_KEY);
          }
          else {
            const beeTest = new BeePlugin(beeObject);
            const template = campaign.JsonData ? JSON.parse(campaign.JsonData) : {};
            beeTest.start(config, template).then((instance) => {
              editorRef.current = instance;
              editorRef.current.load();
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
    if (beeToken) {
      initRepsonse();
    }
  }, [beeToken])

  const initOptions = async () => {
    if (!accountSettings || accountSettings.SubAccountSettings) {
      await dispatch(getCommonFeatures());
    }
    if (editorRef.current) {
      editorRef.current.loadConfig(BeeConfig(saveRef, editorRef, isRTL, setDialog, campaignId, onSave, setShowGallery, setIsFileSelected, saveRowHandler));
    }
  }
  //#endregion Init Bee Token & Configuration
  // const registerEvents = () => {
  //   const unlayer = editorRef.current;
  //   if (unlayer) {
  //     // blocks
  //     try {
  //       unlayer.registerCallback('block:added', async function (newBlock, done) {
  //         // Each block should have it's own unique id
  //         const res = await dispatch(saveUserBlock(newBlock));
  //         const newId = res.payload.Block.ID;
  //         newBlock.id = newId;

  //         done(newBlock);
  //       });
  //       unlayer.registerCallback('block:modified', async function (existingBlock, done) {
  //         console.log('block:modified', existingBlock);
  //         // Update the block in your database here
  //         // and pass the updated object to done callback.
  //         await dispatch(updateUserBlock(existingBlock));

  //         done(existingBlock);
  //       });
  //       unlayer.registerCallback('block:removed', async function (existingBlock, done) {
  //         console.log('block:removed', existingBlock);

  //         // Delete the block from your database here.
  //         await dispatch(deleteUserBlock(existingBlock.id));

  //         done(existingBlock);
  //       });
  //       unlayer.editor.registerProvider('blocks', async function (params, done) {
  //         done(userBlocks);
  //       });
  //       unlayer.addEventListener('design:updated', function (data) {
  //         saveDesign(false, null, false);
  //       });
  //       unlayer.editor.reloadProvider('blocks');
  //     }
  //     catch (e) {
  //       console.error(e);
  //     }
  //   }
  // }

  //#region Pulseem Methods (Save, Delete, Exit, Back, Test Send)
  const onSave = async (args) => {
    try {
      const response = await dispatch(saveCampaign({
        campaignId: args.campaignId,
        JsonData: args.JsonData,
        HtmlData: args.HtmlData
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
    editorRef.current.save();
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
  const onTestSendSubmit = (sendRequest) => {
    setLoader(true);
    saveDesign(false, null, false).then(async (r) => {
      const reponse = await dispatch(testSend({ ...sendRequest }));
      onResponse(reponse.payload.StatusCode);
      setSummaryData(reponse.payload.Summary);
      setLoader(false);
    });

    const onResponse = (statusCode) => {
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
  //#region  Gallery Dialog
  const handleSelectedImage = (image) => {
    setShowGallery(false);
  }
  const handleGalleryConfirm = () => {
    setIsFileSelected(true);
  }
  const showGalleryModal = () => {
    if (showGallery) {
      let dialog = {};
      dialog = renderGalleryDialog();

      return (
        <Dialog
          maxHeight="calc(70vh)"
          disableBackdropClick={true}
          style={{ minHeight: 400 }}
          showDivider={false}
          classes={classes}
          open={showGallery}
          onClose={() => { setShowGallery(false) }}
          onConfirm={handleGalleryConfirm}
          {...dialog}>
          {dialog.content}
        </Dialog>
      );
    }
  }
  const renderGalleryDialog = () => {
    return {
      showDivider: false,
      icon: (
        <IoMdImages style={{ fontSize: 30, color: '#fff' }} />
      ),
      title: t("common.imageGallery"),
      content: (
        <Gallery
          classes={classes}
          isConfirm={isGalleryConfirmed}
          callbackSelectFile={handleSelectedImage}
          style={{ minWidth: 400 }}
          folderType={PulseemFolderType.CLIENT_IMAGES} />
      )
    };
  }
  //#endregion Gallery Dialog
  const handleCloseReponse = () => {
    setDialog(null);
    setIsResponseModal(false);
  }

  const saveRowHandler = (metadata) => {
    setUserBlock(metadata);
    setDialog(DialogType.SET_ROW_DETAILS);
  }
  const setBlockFinalValue = (e) => {
    setUserBlock({ ...userBlock, e });
    // Save via api
  }

  const config = BeeConfig(saveRef, editorRef, isRTL, setDialog, campaignId, onSave, setShowGallery, setIsFileSelected, saveRowHandler);

  return (
    <DefaultScreen
      currentPage='campaignEditor'
      classes={classes}
      customPadding={true}
      containerClass={[classes.fullWidth, classes.noPadding]}
    >
      {renderToast()}
      <NoCreditsModal
        classes={classes}
        onClose={() => setDialog(null)}
        isOpen={dialog === DialogType.NO_CREDITS_LEFT}
      />
      <BlockMeta
        onSubmit={setBlockFinalValue}
        isOpen={dialog === DialogType.SET_ROW_DETAILS}
        classes={classes}
        onClose={() => setDialog(null)}
      />
      <TestSend
        classes={classes}
        isOpen={dialog === DialogType.TEST_SEND}
        onClose={() => setDialog(null)}
        onSubmit={onTestSendSubmit}
        campaignId={campaignId || props.match.params.id}
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
      {showGalleryModal()}
      <WizardActions
        campaignId={campaignId}
        innerStyle={{ paddingInline: 15 }}
        classes={classes}
        onExit={onExit}
        onTestSend={() => { setIsResponseModal(false); editorRef.current.send(); }}
        onSave={saveDesign}
        onBack={onBack}
        onDelete={onDelete} />
      <Loader isOpen={showLoader} showBackdrop={false} />
    </DefaultScreen>
  )
}

export default CampaignEditor;
