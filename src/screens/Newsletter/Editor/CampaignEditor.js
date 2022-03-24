import { Button } from '@material-ui/core'
import { useRef, useState, useEffect } from 'react'
import EmailEditor from 'react-email-editor'
import DefaultScreen from '../../DefaultScreen'
import { useSelector, useDispatch } from 'react-redux';
import { getCampaignById, saveCampaign } from '../../../redux/reducers/campaignEditorSlice';
import { Loader } from '../../../components/Loader/Loader';
import { appearance, tools, options, features } from './constants'
import { ClientFields } from '../../../model/PulseemFields/Fields'
import { getAccountExtraData } from "../../../redux/reducers/smsSlice";
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
    const { extraData } = useSelector(state => state.sms);
    const [mergeData, setPulseemMergeData] = useState({});

    const getData = async () => {
        setLoader(true);
        await dispatch(getCampaignById(props.match.params.id));
        await dispatch(getAccountExtraData());
        setDataReady(true);
        setLoader(false);
    }

    useEffect(() => {
      if(dataReady){
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
        setDataLoaded(true);
      }

    }, [dataReady]);

    useEffect(() => {
      if(dataLoaded){
        onLoad();
      }
    }, [dataLoaded])

    useEffect(() => {
        if (props.match.params.id != null && props.match.params.id > 0) {
            getData();
        }
    }, [dispatch]);

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
            if (!campaign && (!campaign.HTMLtoSend || campaign.HTMLtoSend === '') && !campaign.JsonData && campaign.HtmlData) {
                setLoader(false);
                return;
            }
            else {
                if (campaign.JsonData) {
                    setTimeout(() => {
                        editorRef.current.loadDesign(JSON.parse(campaign.JsonData));
                        setLoader(false);
                        editorRef.current.setMergeTags(mergeData);
                        return;
                    }, 1000);
                }
                else if (campaign.HtmlData) {
                    setTimeout(() => {
                      editorRef.current.mergeTags = {
                        first_name: {
                          name: "first Name",
                          value: "{{first_name}}",
                          sample: "John"
                        }
                      };
                        editorRef.current.loadDesign({
                            html: campaign.HTMLtoSend,
                            classic: true
                        });
                        setLoader(false);

                        return;
                    }, 1000);
                }
                else if (campaign.HTMLtoSend) {
                    setTimeout(() => {
                        editorRef.current.loadDesign({
                            html: campaign.HTMLtoSend,
                            classic: true
                        });
                        setLoader(false);
                        return;
                    }, 500);
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
            // onLoad={onLoad}
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
