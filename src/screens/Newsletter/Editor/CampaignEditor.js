import { Button } from '@material-ui/core'
import { useRef, useState } from 'react'
import EmailEditor from 'react-email-editor'
import DefaultScreen from '../../DefaultScreen'
import { appearance, tools, options, features, savedDesign } from './constants'

const CampaignEditor = ({ classes, id = 2 }) => {
    const editorRef = useRef(null);

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
        if (id && savedDesign !== null) {
            // editorRef.current.loadDesign(savedDesign);
            editorRef.current.loadDesign(
                {
                    html: '<html><body><div>This is a legacy HTML template.</div></body></html>',
                    classic: true
                }
            );
        }
    }

    return (
        <DefaultScreen
            currentPage='campaignEditor'
            classes={classes}
        >
            <Button onClick={exportHtml}>Export HTML</Button>
            <Button onClick={saveDesign}>Save Design</Button>
            <EmailEditor
                onLoad={onLoad}
                ref={editorRef}
                minHeight="calc(100vh - 100px)"
                tools={tools}
                appearance={appearance}
                options={options}
                features={features}
                registerTab={onRegisterTabs}
            />
        </DefaultScreen>
    )
}

export default CampaignEditor;