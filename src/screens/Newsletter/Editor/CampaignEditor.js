import { Button } from '@material-ui/core'
import { useRef } from 'react'
import EmailEditor from 'react-email-editor'
import DefaultScreen from '../../DefaultScreen'

const CampaignEditor = ({ classes }) => {
    const editor = useRef(null);

    const exportHtml = () => {
        editor.current.exportHtml(data => {
            const { design, html } = data
            console.log('exportHtml', html)
            console.log('design', design)
        })
    }
    const saveDesign = () => {
        editor.current.saveDesign(design => {
            console.log('saveDesign', design)
        })
    }

    const onLoad = () => {
        console.log('onReady');
        editor.current.tools = {
            html: {
                enabled: false
            }
        }

    };

    return (
        <DefaultScreen
            currentPage='campaignEditor'
            classes={classes}
        >
            <EmailEditor ref={editor} minHeight="calc(100vh - 100px)" onLoad={onLoad} />
            <Button onClick={exportHtml}>Export HTML</Button>
            <Button onClick={saveDesign}>Save Design</Button>
        </DefaultScreen>
    )
}

export default CampaignEditor;