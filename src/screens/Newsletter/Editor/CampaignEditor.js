import { Button } from '@material-ui/core'
import { useRef, useState, useEffect } from 'react'
import EmailEditor from 'react-email-editor'
import DefaultScreen from '../../DefaultScreen'
import { useSelector, useDispatch } from 'react-redux';
import { getCampaignById, saveCampaign } from '../../../redux/reducers/campaignEditorSlice';
import { Loader } from '../../../components/Loader/Loader';
import { appearance, tools, options, features, fonts } from './constants'
import { ClientFields } from '../../../model/PulseemFields/Fields'
import { getAccountExtraData, getPreviousCampaignData,  getPreviousLandingData } from "../../../redux/reducers/smsSlice";
import { useTranslation } from "react-i18next";

const CampaignEditor = ({ classes, ...props }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch()
    const editorRef = useRef(null);
    const [showLoader, setLoader] = useState(true);
    const { campaign } = useSelector(state => state.campaignEditor);
    const campaignId = props.match.params.id;
    const [dataReady, setDataReady] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const { extraData, previousLandingData } = useSelector(state => state.sms);
    const [mergeData, setPulseemMergeData] = useState({});
    const [specialLinks, setSpecialLinks] = useState([]);
    const { language, isRTL, windowSize } = useSelector(state => state.core)
    const [iframeKey, setIframeKey] = useState(0);

    useEffect(() => {
      if(dataReady){
        Promise.all([initExtraDataField(), initLandingPages()]).then(() => {
          setDataLoaded(true);
        })
      }

    }, [dataReady]);
    useEffect(() => {
      if(dataLoaded){
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
      options.locale = language === 'he' ? 'he-IL' : 'en-US';
      setIframeKey(iframeKey + 1);
      setTimeout(() => {
        onLoad();
      }, 0)

    }, [language])
    const getData = async () => {
        setLoader(true);
        await dispatch(getCampaignById(props.match.params.id));
        await dispatch(getAccountExtraData());
        await dispatch(getPreviousLandingData());
        setDataReady(true);
        setLoader(false);
    }
    const initExtraDataField = () => {
      return new Promise((resolve, reject) => {
        try {
          let exData = [...ClientFields];
          Object.keys(extraData).forEach((item, i) => {
            if(Object.values(extraData)[i] && Object.values(extraData)[i] != ''){
              exData.push({ value: item, label: Object.values(extraData)[i], isExtraField: true})
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
    const exportHtml = () => {
        editorRef.current.exportHtml(data => {
            const { design, html } = data
            console.log('exportHtml', html)
            console.log('design', JSON.stringify(design))
        })
    }
    const saveDesign = (redirectAfterSave = false) => {
        return new Promise((reject, resolve) => {
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
                    resolve(response.payload);
                })
            } catch (error) {
                reject();
            }
        })

    }
    const onLoad = () => {
        try {
            // Only for premium
            editorRef.current.editor.fonts = fonts.fonts;
            // end
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
    }
    const renderEditor = () => {
        if (dataReady) {
            return <EmailEditor
                ref={editorRef}
                minHeight="calc(100vh - 100px)"
                tools={tools}
                appearance={appearance}
                options={options}
                features={features}
                key={iframeKey}
            />
        }
        return <></>
    }

    return (
        <DefaultScreen
            currentPage='campaignEditor'
            classes={classes}
            style={{paddingBottom: 100}}
        >
            <Button onClick={() => saveDesign()}>Save</Button>
            <Button onClick={() => saveDesign(true)}>Finish</Button>
            {renderEditor()}
            <Loader isOpen={showLoader} showBackdrop={false} />
        </DefaultScreen>
    )
}

export default CampaignEditor;
