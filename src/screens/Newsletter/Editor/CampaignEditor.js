import { Button } from '@material-ui/core'
import { useRef, useState } from 'react'
import EmailEditor from 'react-email-editor'
import DefaultScreen from '../../DefaultScreen'

const CampaignEditor = ({ classes }) => {
    const editorRef = useRef(null);

    const exportHtml = () => {
        editorRef.current.exportHtml(data => {
            const { design, html } = data
            console.log('exportHtml', html)
            console.log('design', design)
        })
    }
    const saveDesign = () => {
        editorRef.current.saveDesign(design => {
            console.log('saveDesign', design)
        })
    }

    const appearance = {
        panels: {
            tools: {
                dock: 'dark'
            }
        }
    }

    const tools = {
        html: {
            enabled: true
        },
        amp: "true",
        
    };

    return (
        <DefaultScreen
            currentPage='campaignEditor'
            classes={classes}
        >
            <Button onClick={exportHtml}>Export HTML</Button>
            <Button onClick={saveDesign}>Save Design</Button>
            <EmailEditor
                ref={editorRef}
                minHeight="calc(100vh - 100px)"
                tools={tools}
                appearance={appearance}
                amp={true}
            />
        </DefaultScreen>
    )
}

export default CampaignEditor;