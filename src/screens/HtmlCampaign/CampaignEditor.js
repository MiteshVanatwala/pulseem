import { Button } from '@material-ui/core'
import React, { useRef, useState, useEffect } from 'react'
import EmailEditor from 'react-email-editor'
import DefaultScreen from '../DefaultScreen'
import { useSelector, useDispatch } from 'react-redux';
import {
  getCampaignById,
  saveCampaign,
  getUserblocks,
  saveUserBlock,
  updateUserBlock,
  deleteUserBlock,
  testSend
} from '../../redux/reducers/campaignEditorSlice';
import { Loader } from '../../components/Loader/Loader';
import { appearance, tools, options, features, fonts, tabs } from './constants'
import { ClientFields } from '../../model/PulseemFields/Fields'
import { getAccountExtraData, getPreviousLandingData, getTestGroups } from "../../redux/reducers/smsSlice";
import { useTranslation } from "react-i18next";
import { getCookie } from '../../helpers/cookies'
import EditorActions from './EditorActions';
import TestSend from './modals/TestSend'
import ResponseModal from './modals/ResponseModal'
import NoCreditsModal from './modals/NoCreditsModal'
import Toast from '../../components/Toast/Toast.component';
import GenericModal from './modals/GenericModal';
import { GiExitDoor } from 'react-icons/gi'
import { BsTrash } from "react-icons/bs";
import { deleteCampaign } from '../../redux/reducers/newsletterSlice';

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
  const { language } = useSelector(state => state.core)
  const [iframeKey, setIframeKey] = useState(0);
  const [dialog, setDialog] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const subAccountSettings = getCookie("subAccountSettings");
  const [toastMessage, setToastMessage] = useState(null);
  const [redirectOnExit, setRedirectOnExit] = useState('');
  const [isResponseModal, setIsResponseModal] = useState(false);
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
      Promise.all([initExtraDataField(), initLandingPages(), initUserBlocks()]).then(() => {
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
      onLoad();
    }, 0);
  }, [language])
  const getData = async () => {
    setLoader(true);
    await dispatch(getCampaignById(props.match.params.id));
    await dispatch(getAccountExtraData());
    await dispatch(getPreviousLandingData());
    await dispatch(getTestGroups())
    setDataReady(true);
    setLoader(false);
  }
  const initUserBlocks = () => {
    return new Promise(async (resolve) => {
      await dispatch(getUserblocks());
      resolve();
    });
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
  const initOptions = () => {
    options.locale = language === 'he' ? 'he-IL' : 'en-US';
    appearance.panels.dock = language === 'he' ? 'right' : 'left';
    options.user = {
      id: subAccountSettings.UnlayerUniqueID
    }
    setIframeKey(iframeKey + 1);
  }
  const registerEvents = () => {
    const unlayer = editorRef.current;
    if (unlayer) {
      // Blocks
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
        if (params.userId) {
          done(userBlocks);
        }
      });
      // Gallery
      unlayer.registerCallback('selectImage', function (data, done) {
        console.log(data);
        console.log(done);
      });
      unlayer.editor.reloadProvider('blocks');


    }

  }
  const onLoad = () => {
    try {
      editorRef.current.editor.fonts = fonts;
      editorRef.current.customCSS = ["body { background-color: black }"];
      editorRef.current.editor.setSpecialLinks(specialLinks);
      editorRef.current.setMergeTags(mergeData);
      editorRef.current.editor.customJS = ['console.log("123123")', `${process.env.PUBLIC_URL}/assets/scripts/CompanyDetails.js`];
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
            else if(showAnimation) {
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
  const deleteNewsllter = async () => {
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
      onConfirm: () => deleteNewsllter(),
      onCancel: () => setDialog(null),
      onClose: () => setDialog(null)
    });
    setDialog(DialogType.GENERIC);
  }
  const handleExitCampaign = (saveBeforeExit = true) => {
    setDialog(null);
    if (saveBeforeExit) {
      saveDesign().then(() => {
        setTimeout(() => {
          window.location.href = redirectOnExit;
        }, 3000);
      })
    }
    else {
      window.location.href = redirectOnExit;
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
    setRedirectOnExit(`/react/Campaigns`);
    setDialog(DialogType.GENERIC);
  }
  const onBack = () => {
    saveDesign(true, `/Pulseem/Editor/CampaignInfo/${campaignId}`)
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
  const renderEditor = () => {
    if (dataReady) {
      return <React.StrictMode>
        <EmailEditor
          editorId="campaign-editor"
          ref={editorRef}
          minHeight="calc(100vh - 120px)"
          tools={tools}
          appearance={appearance}
          options={options}
          features={features}
          tabs={tabs}
          key={iframeKey}
          projectId={71525}
          customJS={['console.log("123123")', `${process.env.PUBLIC_URL}/assets/scripts/CompanyDetails.js`]}
        />
      </React.StrictMode>
    }
    return <></>
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
      <EditorActions
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
