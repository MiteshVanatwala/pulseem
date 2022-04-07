import { Button } from '@material-ui/core'
import React, { useRef, useState, useEffect } from 'react'
import EmailEditor from 'react-email-editor'
import DefaultScreen from '../DefaultScreen'
import { useSelector, useDispatch } from 'react-redux';
import { getCampaignById, saveCampaign, getUserblocks, saveUserBlock, updateUserBlock, deleteUserBlock, testSend } from '../../redux/reducers/campaignEditorSlice';
import { Loader } from '../../components/Loader/Loader';
import { appearance, tools, options, features, fonts } from './constants'
import { ClientFields } from '../../model/PulseemFields/Fields'
import { getAccountExtraData, getPreviousLandingData, getTestGroups } from "../../redux/reducers/smsSlice";
import { useTranslation } from "react-i18next";
import { getCookie } from '../../helpers/cookies'
import TopEditor from './TopEditor';
import TestSend from './modals/TestSend'
import ResponseModal from './modals/ResponseModal'
import { TreeItem } from '@material-ui/lab';

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
  const { campaign, userBlocks } = useSelector(state => state.campaignEditor);
  const { extraData, previousLandingData } = useSelector(state => state.sms);
  const { language } = useSelector(state => state.core)
  const [iframeKey, setIframeKey] = useState(0);
  const [dialog, setDialog] = useState(null);
  const subAccountSettings = getCookie("subAccountSettings");
  const DialogType = {
    TEST_SEND: "testSend",
    DELETE: "delete",
    SUCCESS_SENT: "campaigns.successSent",
    MISSING_API_KEY: "campaigns.missingApi",
    CAMPAIGN_NOT_FOUND: "campaigns.campaignNotFound",
    CANNOT_CREATE_GROUP: "campaigns.cannotCreateGroup",
    ERROR_OCCURED: "campaigns.errorOccured",
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
      id: subAccountSettings.UnlayerUniqueID //,
      // name: username,
      // email: 'ido@pulseem.com'
    }
    options.customJS= ['console.log("123123")', `${process.env.PUBLIC_URL}/assets/scripts/CompanyDetails.js`];
    setIframeKey(iframeKey + 1);
  }
  const registerEvents = () => {
    const unlayer = editorRef.current;
    if (unlayer) {
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
      unlayer.customJS = ['console.log(123123)', 'https://www.pulseemdev.co.il/pulseem/CompanyDetails.js'];
      unlayer.editor.reloadProvider('blocks');
    }

  }
  const onLoad = () => {
    try {
      editorRef.current.editor.customJS = ['console.log(123123)'];
      editorRef.current.editor.fonts = fonts;
      editorRef.current.editor.setSpecialLinks(specialLinks);
      editorRef.current.setMergeTags(mergeData);
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
  const renderEditor = () => {
    if (dataReady) {
      return <React.StrictMode>
        <EmailEditor
          editorId="campaign-editor"
          ref={editorRef}
          minHeight="calc(100vh - 100px)"
          tools={tools}
          appearance={appearance}
          options={options}
          features={features}
          key={iframeKey}
          projectId={71525}
        />
      </React.StrictMode>
    }
    return <></>
  }
  const saveDesign = (redirectAfterSave = false) => {
    return new Promise((resolve, reject) => {
      try {
        editorRef.current.exportHtml(async (data) => {
          const { design, html } = data;
          const response = await dispatch(saveCampaign({ campaignId: campaignId, JsonData: JSON.stringify(design), HtmlData: html }));
          if (response.payload === true) {
            if (redirectAfterSave) {
              window.location = `/Pulseem/SendCampaign.aspx?CampaignID=${campaignId}&fromreact=true`;
            }
            console.log('saved!');
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
  const onDelete = () => {
    console.log('delete');
    //TODO: Show confirm modal
  }
  const onTestSendSubmit = (sendRequest) => {
    setLoader(true);
    saveDesign().then(async (r) => {
      const reponse = await dispatch(testSend({...sendRequest}));
      onResponse(reponse.payload.StatusCode);
      setLoader(false);
    });

    const onResponse = (statusCode) => {
      switch(statusCode){
        case 201:{
        setDialog(DialogType.SUCCESS_SENT);
          break;
        }
        case 401:{
          setDialog(DialogType.MISSING_API_KEY);
          break;
        }
        case 404:{
          setDialog(DialogType.CAMPAIGN_NOT_FOUND);
          break;
        }
        case 405:{
          setDialog(DialogType.CANNOT_CREATE_GROUP);
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
  return (
    <DefaultScreen
      currentPage='campaignEditor'
      classes={classes}
      style={{ paddingBottom: 100 }}
    >
      <TopEditor
        classes={classes}
        onTestSend={() => { setDialog(DialogType.TEST_SEND) }}
        onSave={saveDesign}
        onDelete={onDelete} />
      <TestSend
        classes={classes}
        isOpen={dialog === DialogType.TEST_SEND}
        onClose={() => setDialog(null)}
        onSubmit={onTestSendSubmit}
        campaignId={campaignId || props.match.params.id}
      />
      <ResponseModal
        classes={classes}
        isOpen={dialog && dialog !== DialogType.TEST_SEND}
        onClose={() => setDialog(null)}
        onConfirm={() => setDialog(null)}
        message={dialog}
      />
      {renderEditor()}
      <Loader isOpen={showLoader} showBackdrop={false} />
    </DefaultScreen>
  )
}

export default CampaignEditor;
