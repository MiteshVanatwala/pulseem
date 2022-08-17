import clsx from 'clsx';
import { Box, Button } from '@material-ui/core'
import React, { useRef, useState, useEffect } from 'react'
import EmailEditor from 'react-email-editor'
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
import { options } from './constants'
import { ClientFields } from '../../model/PulseemFields/Fields'
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

const CampaignEditor = ({ classes, ...props }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch()
  const editorRef = useRef(null);
  const [showLoader, setLoader] = useState(true);
  const campaignId = props.match.params.id;
  const [dataReady, setDataReady] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [mergeData, setPulseemMergeData] = useState({});
  const [specialLinks, setSpecialLinks] = useState([]);
  const { campaign, userBlocks, ToastMessages } = useSelector(state => state.campaignEditor);
  const { extraData, previousLandingData } = useSelector(state => state.sms);
  const { language, isRTL, accountSettings } = useSelector(state => state.core)
  const { tokenAlive } = useSelector(state => state.common)
  const [iframeKey, setIframeKey] = useState(0);
  const [dialog, setDialog] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [isResponseModal, setIsResponseModal] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [isGalleryConfirmed, setIsFileSelected] = useState(false);
  const [alertLogout, setAlertLogout] = useState(false);
  const [genericModalData, setGenericModalData] = useState({
    title: "",
    message: ""
  })
  const DialogType = {
    TEST_SEND: "testSend",
    DELETE: "delete",
    SUCCESS_SENT: "campaigns.successSent",
    MISSING_API_KEY: "campaigns.missingApi",
    CAMPAIGN_NOT_FOUND: "campaigns.campaignNotFound",
    CANNOT_CREATE_GROUP: "campaigns.cannotCreateGroup",
    ERROR_OCCURED: "campaigns.errorOccured",
    NONE_ACTIVE_RECIPIENT: "campaigns.noneActiveRecipientsFound",
    GENERIC: "generic",
    NO_CREDITS_LEFT: "sms.noCredits"
  };
  useEffect(() => {
    if (dataReady) {
      Promise.all([initExtraDataField(), initLandingPages()]).then(() => {
        setDataLoaded(true);
      })
    }
  }, [dataReady]);
  useEffect(() => {
    if (dataLoaded) {
      setTimeout(() => {
        onLoad();
      }, 1000)
    }
  }, [dataLoaded]);
  useEffect(() => {
    if (props.match.params.id != null && props.match.params.id > 0) {
      getData();
    }
  }, [dispatch]);
  useEffect(() => {
    initOptions();
    setTimeout(() => {
      if (dataLoaded) {
        onLoad();
      }
    }, 0);
  }, [language]);


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


  const getData = async () => {
    setLoader(true);
    await dispatch(getCampaignById(props.match.params.id));
    await dispatch(getAccountExtraData());
    await dispatch(getPreviousLandingData());
    await dispatch(getTestGroups());
    await dispatch(getUserblocks());
    setDataReady(true);
    setLoader(false);
  }
  const initExtraDataField = () => {
    return new Promise((resolve, reject) => {
      try {
        let exData = [...ClientFields];
        Object.keys(extraData).forEach((item, i) => {
          if (Object.values(extraData)[i] && Object.values(extraData)[i] != '') {
            exData.push({ value: item, label: Object.values(extraData)[i], isExtraField: true })
          }
        });

        const mData = {};
        exData.forEach((ed) => {
          mData[ed.value] = {
            name: !ed.isExtraField ? t(ed.label) : ed.label,
            value: "##" + ed.value + "##"
          }
        });
        setPulseemMergeData(mData);
      } catch (e) {
        reject(e);
      } finally {
        resolve();
      }
    });

  }
  const initLandingPages = () => {
    return new Promise((resolve, reject) => {
      try {
        const titleName = t('landingPages.landingPages');
        const sLinks = [{
          name: titleName,
          specialLinks: []
        }];

        previousLandingData.forEach((item, i) => {
          sLinks[0].specialLinks.push({
            name: item.CampaignName,
            href: item.PageHref,
            target: '_blank'
          });
        });
        setSpecialLinks(sLinks);
      }
      catch (e) {
        reject(e);
      }
      finally {
        resolve();
      }
    });
  }
  const initOptions = async () => {
    if (!accountSettings || accountSettings.SubAccountSettings) {
      await dispatch(getCommonFeatures());
    }
    options.locale = language === 'he' ? 'he-IL' : 'en-US';
    options.user = {
      id: accountSettings?.SubAccountSettings.UnlayerUniqueID
    }
    setIframeKey(iframeKey + 1);
  }
  const registerEvents = () => {
    const unlayer = editorRef.current;
    if (unlayer) {
      // Images
      unlayer.registerCallback('selectImage', function (data, done) {
        setShowGallery(true);
        setIsFileSelected(false);

        const button = document.querySelector('[name="btnConfirm"]');
        if (button) {
          button.addEventListener('mouseup', (event) => {
            const modal = document.querySelector('.MuiDialog-paper');
            const selectedIcon = modal.querySelector(".image-info svg");
            if (selectedIcon) {
              const imgElement = selectedIcon.parentNode.previousElementSibling;
              const style = imgElement.currentStyle || window.getComputedStyle(imgElement, false);
              const selectedImage = style.backgroundImage.slice(4, -1).replace(/"/g, "");
              done({ url: selectedImage });
            }
          });
        }
      });
      // blocks
      try {
        unlayer.registerCallback('block:added', async function (newBlock, done) {
          // Each block should have it's own unique id
          const res = await dispatch(saveUserBlock(newBlock));
          const newId = res.payload.Block.ID;
          newBlock.id = newId;

          done(newBlock);
        });
        unlayer.registerCallback('block:modified', async function (existingBlock, done) {
          console.log('block:modified', existingBlock);

          // Update the block in your database here
          // and pass the updated object to done callback.
          await dispatch(updateUserBlock(existingBlock));

          done(existingBlock);
        });
        unlayer.registerCallback('block:removed', async function (existingBlock, done) {
          console.log('block:removed', existingBlock);

          // Delete the block from your database here.
          await dispatch(deleteUserBlock(existingBlock.id));

          done(existingBlock);
        });
        unlayer.editor.registerProvider('blocks', async function (params, done) {
          done(userBlocks);
        });
        unlayer.addEventListener('design:updated', function (data) {
          // var type = data.type; // body, row, content
          // var item = data.item;
          // var changes = data.changes;
          // //const heading = editorRef.current.editor.frame.iframe.getElementsByClassName("u_content_heading");
          // if (changes.name === 'textAlign') {
          //   console.log(isRTL);
          //   item.values.direction = "rtl";
          // }
          // console.log('design:updated', type, item, changes);
          saveDesign(false, null, false);
        });
        unlayer.editor.reloadProvider('blocks');
      }
      catch (e) {
        console.error(e);
      }
    }
  }
  const onReady = () => {
    editorRef.current.editor.setBodyValues({
      backgroundColor: "#e7e7e7",
      contentWidth: "600px",
      preheaderText: ""
    });
    if (!campaign.JsonData && !campaign.HtmlData) {
      saveDesign(false, null, false);
    }
  }
  const onLoad = () => {
    try {
      editorRef.current.setMergeTags(mergeData);
      editorRef.current.editor.setSpecialLinks(specialLinks);

      if (!campaign && (!campaign.HTMLtoSend || campaign.HTMLtoSend === '') && !campaign.JsonData && campaign.HtmlData) {
        setLoader(false);
        return;
      }
      else {
        if (campaign.JsonData) {
          editorRef.current.loadDesign(JSON.parse(campaign.JsonData));
          setLoader(false);
          return;
        }
        else if (campaign.HtmlData) {
          editorRef.current.loadDesign({
            html: campaign.HTMLtoSend,
            classic: true
          });
          setLoader(false);

          return;
        }
        else if (campaign.HTMLtoSend) {
          editorRef.current.loadDesign({
            html: campaign.HTMLtoSend,
            classic: true
          });
          setLoader(false);
          return;
        }
      }
    }
    catch (e) {
      console.error(e);
      return;
    }
    finally {
      registerEvents();
    }
  }
  const saveDesign = (redirectAfterSave = false, redirectUrl = null, showAnimation = true) => {
    return new Promise((resolve, reject) => {
      try {
        editorRef.current.exportHtml(async (data) => {
          const { design, html } = data;
          const response = await dispatch(saveCampaign({ campaignId: campaignId, JsonData: JSON.stringify(design), HtmlData: html }));
          if (response.payload === true) {
            if (redirectAfterSave) {
              window.location = redirectUrl ?? `/Pulseem/SendCampaign.aspx?CampaignID=${campaignId}&fromreact=true`;
            }
            else if (showAnimation) {
              setToastMessage(ToastMessages.CAMPAIGN_SAVED);
            }
          }
          else {
            console.log(response);
          }
          resolve();
        })
      } catch (error) {
        reject();
      }
    })

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
  const onLogoutAlert = () => {
    setIsResponseModal(false);
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
  /* #region  Gallery Dialog */
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
  /* #endregion */
  const renderEditor = () => {
    if (dataLoaded) {
      return <React.StrictMode>
        <EmailEditor
          style={{ direction: isRTL ? 'rtl' : 'ltr' }}
          onReady={onReady}
          editorId="campaign-editor"
          ref={editorRef}
          minHeight="calc(100vh - 120px)"
          options={options}
          key={iframeKey}
          projectId={71525}
        />
      </React.StrictMode>
    }
    return <Box className={classes.containerFullHeight}></Box>
  }

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
        onClose={() => setDialog(null)}
        onConfirm={() => setDialog(null)}
        summaryData={summaryData}
        message={dialog}
      />
      {renderEditor()}
      {showGalleryModal()}

      <WizardActions
        campaignId={campaignId}
        innerStyle={{ paddingInline: 15 }}
        classes={classes}
        onExit={onExit}
        onTestSend={() => { setIsResponseModal(false); setDialog(DialogType.TEST_SEND) }}
        onSave={saveDesign}
        onBack={onBack}
        onDelete={onDelete} />
      <Loader isOpen={showLoader} showBackdrop={false} />
    </DefaultScreen>
  )
}

export default CampaignEditor;
