import { Button } from '@material-ui/core'
import { useRef, useState, useEffect } from 'react'
import EmailEditor from 'react-email-editor'
import DefaultScreen from '../../DefaultScreen'
import { useSelector, useDispatch } from 'react-redux';
import { getCampaignById, saveCampaign } from '../../../redux/reducers/campaignEditorSlice';
import { Loader } from '../../../components/Loader/Loader';
import { appearance, tools, options, features, savedDesign } from './constants'

const CampaignEditor = ({ classes, ...props }) => {
    const dispatch = useDispatch()
    const editorRef = useRef(null);
    const [showLoader, setLoader] = useState(true);
    const { campaign } = useSelector(state => state.campaignEditor);
    const campaignId = props.match.params.id;

    const getData = async () => {
        setLoader(true);
        await dispatch(getCampaignById(props.match.params.id));
        setLoader(false);
    }

    useEffect(() => {
        onLoad();
    }, [campaign]);

    useEffect(() => {
        if (campaignId != null && campaignId > 0) {
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
    const saveDesign = () => {
        return new Promise((reject, resolve) => {
            try {
                editorRef.current.exportHtml(async (data) => {
                    const { design, html } = data;
                    const response = await dispatch(saveCampaign({ campaignId: campaignId, JsonData: JSON.stringify(design), HtmlData: html }));
                    if (response === 'true') {
                        console.log('saved!');
                    }
                    else {
                        console.log(response);
                    }
                    resolve(response);
                })
            } catch (error) {
                reject();
            }
        })

    }

    const finish = () => {
        saveDesign().then((res) => {
            if (res === 'true') {
                window.location = `/Pulseem/SendCampaign.aspx?CampaignID=${campaignId}&fromreact=true`;
            }
            else {
                console.log(res);
            }
        });
        // editorRef.current.saveDesign(design => {
        //     console.log('saveDesign', design);
        //     //window.location = `/Pulseem/SendCampaign.aspx?CampaignID=${props.match.params.id}&fromreact=true`;
        // })
    }

    const onRegisterTabs = () => {
        const MyPanel = () => (
            <div>I am a custom tab.</div>
        );
        return {
            name: 'my_tab',
            label: 'My Tab',
            icon: 'fa-smile',
            supportedDisplayModes: ['web', 'email'],
            renderer: {
                Panel: MyPanel
            }
        }
    }

    const onLoad = () => {
        if (props.match.params.id) {
            if (!campaign || !campaign.HTMLtoSend || campaign.HTMLtoSend === '') {
                setLoader(false);
            }
            else {
                if (campaign.JsonData) {
                    setTimeout(() => {
                        editorRef.current.loadDesign(campaign.JsonData);
                    }, 500);
                }
                else if (campaign.HtmlData) {
                    setTimeout(() => {
                        editorRef.current.loadDesign({
                            html: campaign.HTMLtoSend,
                            classic: true
                        });
                    }, 500);
                }
                else if (campaign.HTMLtoSend) {
                    setTimeout(() => {
                        editorRef.current.loadDesign({
                            html: campaign.HTMLtoSend,
                            classic: true
                        });
                    }, 500);
                }
            }
        }
        setLoader(false);
        return;
    }

    return (
        <DefaultScreen
            currentPage='campaignEditor'
            classes={classes}
        >
            {/* <Button onClick={() => exportHtml()}>Export HTML</Button> */}
            <Button onClick={() => saveDesign()}>Save</Button>
            <Button onClick={() => finish()}>Finish</Button>
            <EmailEditor
                ref={editorRef}
                minHeight="calc(100vh - 100px)"
                tools={tools}
                appearance={appearance}
                options={options}
                features={features}
                registerTab={onRegisterTabs}
            // onLoad={onLoad}
            />
            <Loader isOpen={showLoader} showBackdrop={false} />
        </DefaultScreen>
    )
}

export default CampaignEditor;