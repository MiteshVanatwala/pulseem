import { Button } from '@material-ui/core'
import { useRef, useState, useEffect } from 'react'
import EmailEditor from 'react-email-editor'
import DefaultScreen from '../../DefaultScreen'
import { useSelector, useDispatch } from 'react-redux';
import { getCampaignById } from '../../../redux/reducers/campaignEditorSlice';
import { Loader } from '../../../components/Loader/Loader';
import { appearance, tools, options, features, savedDesign } from './constants'

const CampaignEditor = ({ classes, ...props }) => {
    const dispatch = useDispatch()
    const editorRef = useRef(null);
    const [showLoader, setLoader] = useState(true);
    const { campaign } = useSelector(state => state.campaignEditor);

    const getData = async () => {
        setLoader(true);
        await dispatch(getCampaignById(props.match.params.id));
        setLoader(false);
    }

    useEffect(() => {
        if (campaign !== null)
            onLoad();
    }, [campaign]);

    useEffect(() => {
        if (props && props.match.params.id != null && parseInt(props.match.params.id) > 0) {
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
        editorRef.current.saveDesign(design => {
            console.log('saveDesign', design)
        })
    }

    const finish = () => {
        editorRef.current.saveDesign(design => {
            console.log('saveDesign', design);
            window.location = `/Pulseem/SendCampaign.aspx?CampaignID=${props.match.params.id}&fromreact=true`;
        })
        //redirectionLink
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
        if (props.match.params.id && savedDesign !== null) {
            if (campaign && campaign.HTMLtoSend) {
                try {
                    editorRef.current.loadDesign({
                        html: campaign.HTMLtoSend.toString(),
                        classic: true
                    });
                } catch (error) {
                    console.error(error);
                    editorRef.current.loadDesign(null);
                }
            }
            else {
                editorRef.current.loadDesign(savedDesign);
            }
            if (props.match.params.id && savedDesign !== null) {
                // editorRef.current.loadDesign(savedDesign);
                editorRef.current.loadDesign(
                    {
                        html: '<html><body><div>This is a legacy HTML template.</div></body></html>',
                        classic: true
                    }
                );
            }
        }
    }

    return (
        <DefaultScreen
            currentPage='campaignEditor'
            classes={classes}
        >
            <Button onClick={() => exportHtml()}>Export HTML</Button>
            <Button onClick={() => saveDesign()}>Save</Button>
            <Button onClick={() => finish()}>Finish</Button>
            <EmailEditor
                onReady={onLoad}
                ref={editorRef}
                minHeight="calc(100vh - 100px)"
                tools={tools}
                appearance={appearance}
                options={options}
                features={features}
                registerTab={onRegisterTabs}
            />
            <Loader isOpen={showLoader} showBackdrop={false} />
        </DefaultScreen>
    )
}

export default CampaignEditor;