import { Button } from '@material-ui/core'
import { useRef } from 'react'
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
                dock: 'left'
            }
        }
    }

    const tools = {
        html: {
            enabled: false
        },
        ido: {
            name: 'my_tool',
            label: 'My Tool',
            icon: 'fa-smile',
            supportedDisplayModes: ['web', 'email'],
            options: {},
            values: {},
            renderer: {
                Viewer: (values) => {
                    return "<div>I am a custom tool.</div>"
                },
                exporters: {
                    web: function (values) {
                        return "<div>I am a custom tool.</div>"
                    },
                    email: function (values) {
                        return "<div>I am a custom tool.</div>"
                    }
                },
                head: {
                    css: function (values) { },
                    js: function (values) { }
                }

            }
        }
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
            />
        </DefaultScreen>
    )
}

export default CampaignEditor;