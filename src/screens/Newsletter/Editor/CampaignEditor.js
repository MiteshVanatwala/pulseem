import { Button } from '@material-ui/core'
import { useRef, useState } from 'react'
import EmailEditor from 'react-email-editor'
import DefaultScreen from '../../DefaultScreen'

const CampaignEditor = ({ classes, id = 2 }) => {
    const editorRef = useRef(null);

    const savedDesign = {
        "counters":
        {
            "u_column": 2,
            "u_row": 2,
            "u_content_carousel": 1,
            "u_content_image": 5,
            "u_content_heading": 1,
            "u_content_text": 1
        },
        "body":
        {
            "id":
                "IewoxQcGEC",
            "rows":
                [
                    {
                        "id": "L_wWJU0c6G",
                        "cells": [1],
                        "columns":
                            [
                                {
                                    "id": "QKY97jUj1U",
                                    "contents": [
                                        {
                                            "id": "FcSPVYECqg", "type": "carousel", "values":
                                            {
                                                "showPreviews": true, "previewWidth": "100px", "autoplay": false, "loop": false, "displayCondition": null, "containerPadding": "10px", "anchor": "", "_meta": { "htmlID": "u_content_carousel_1", "htmlClassNames": "u_content_carousel" },
                                                "selectable": true, "draggable": true, "duplicatable": true, "deletable": true, "hideable": true
                                            },
                                            "embedded": {
                                                "images": {
                                                    "type": "image", "ids": ["zLVhAlcU0V", "f4hHrabKMh", "H1qafpTwJD"],
                                                    "values": [
                                                        {
                                                            "src":
                                                                { "url": "https://unroll-images-production.s3.amazonaws.com/projects/0/1646320231691-IMG_8982.jpg", "width": 2048, "height": 1365 }, "altText": "Slide Image", "action": { "name": "web", "values": { "href": "", "target": "_blank" } }, "_meta": { "htmlID": "u_content_image_1", "htmlClassNames": "u_content_image" }
                                                        },
                                                        {
                                                            "src": { "url": "https://unroll-images-production.s3.amazonaws.com/projects/0/1646320242103-IMG_8715.jpg", "width": 2048, "height": 1365 }, "altText": "Slide Image", "action": { "name": "web", "values": { "href": "", "target": "_blank" } }, "_meta": { "htmlID": "u_content_image_2", "htmlClassNames": "u_content_image" }
                                                        },
                                                        {
                                                            "src": { "url": "https://unroll-images-production.s3.amazonaws.com/projects/0/1646320251734-IMG_12447056226816.jpeg", "width": 884, "height": 589 }, "altText": "Slide Image", "action": { "name": "web", "values": { "href": "", "target": "_blank" } }, "_meta": { "htmlID": "u_content_image_3", "htmlClassNames": "u_content_image" }
                                                        }]
                                                }
                                            }
                                        }],
                                    "values":
                                    {
                                        "backgroundColor": "", "padding": "0px", "border": {}, "_meta": { "htmlID": "u_column_1", "htmlClassNames": "u_column" }
                                    }
                                }],
                        "values":
                        {
                            "displayCondition": null, "columns": false, "backgroundColor": "", "columnsBackgroundColor": "", "backgroundImage": { "url": "", "fullWidth": true, "repeat": false, "center": true, "cover": false }, "padding": "0px", "anchor": "", "hideDesktop": false, "_meta": { "htmlID": "u_row_1", "htmlClassNames": "u_row" }, "selectable": true, "draggable": true, "duplicatable": true, "deletable": true, "hideable": true
                        }
                    },
                    {
                        "id": "EwYHFSw_yC", "cells": [1],
                        "columns":
                            [
                                {
                                    "id": "SlDdUgWWSL", "contents":
                                        [
                                            {
                                                "id": "GbGWPx1PAj", "type": "heading", "values": { "containerPadding": "10px", "anchor": "", "headingType": "h1", "fontFamily": { "label": "Arial", "value": "arial,helvetica,sans-serif" }, "fontSize": "22px", "textAlign": "left", "lineHeight": "140%", "linkStyle": { "inherit": true, "linkColor": "#0000ee", "linkHoverColor": "#0000ee", "linkUnderline": true, "linkHoverUnderline": true }, "displayCondition": null, "_meta": { "htmlID": "u_content_heading_1", "htmlClassNames": "u_content_heading" }, "selectable": true, "draggable": true, "duplicatable": true, "deletable": true, "hideable": true, "text": "Heading" }
                                            },
                                            {
                                                "id": "e4tQQlH0EN", "type": "text", "values": { "containerPadding": "10px", "anchor": "", "textAlign": "left", "lineHeight": "140%", "linkStyle": { "inherit": true, "linkColor": "#0000ee", "linkHoverColor": "#0000ee", "linkUnderline": true, "linkHoverUnderline": true }, "displayCondition": null, "_meta": { "htmlID": "u_content_text_1", "htmlClassNames": "u_content_text" }, "selectable": true, "draggable": true, "duplicatable": true, "deletable": true, "hideable": true, "text": "<p style=\"font-size: 14px; line-height: 140%;\">This is a new Text block. Change the text.</p>" }
                                            }],
                                    "values":
                                    {
                                        "backgroundColor": "", "padding": "0px", "border": {}, "borderRadius": "0px", "_meta": { "htmlID": "u_column_2", "htmlClassNames": "u_column" }
                                    }
                                }],
                        "values":
                        {
                            "displayCondition": null, "columns": false, "backgroundColor": "", "columnsBackgroundColor": "",
                            "backgroundImage":
                            {
                                "url": "", "fullWidth": true, "repeat": false, "center": true, "cover": false
                            },
                            "padding": "0px", "anchor": "", "_meta": { "htmlID": "u_row_2", "htmlClassNames": "u_row" }, "selectable": true, "draggable": true, "duplicatable": true, "deletable": true, "hideable": true
                        }
                    }],
            "values":
            {
                "textColor": "#000000", "backgroundColor": "#e7e7e7",
                "backgroundImage":
                {
                    "url": "", "fullWidth": true, "repeat": false, "center": true, "cover": false
                },
                "contentWidth": "500px", "contentAlign": "center", "fontFamily": { "label": "Arial", "value": "arial,helvetica,sans-serif" }, "preheaderText": "", "linkStyle": { "body": true, "linkColor": "#0000ee", "linkHoverColor": "#0000ee", "linkUnderline": true, "linkHoverUnderline": true }, "_meta": { "htmlID": "u_body", "htmlClassNames": "u_body" }
            }
        }, "schemaVersion": 7
    };

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

    const appearance = {
        panels: {
            dock: 'right'
        }
    }

    const tools = {
        html: {
            enabled: true
        },
        social: {
            enabled: true
        },
        timer: {
            enabled: true
        },
        video: {
            enabled: true
        },
        form: {
            enabled: true,
            usageLimit: 1,
            properties: {
                fields: { // Put pulseem defaults here
                    editor: {
                        data: {
                            defaultFields: [
                                { name: "birthday", label: "Birthday", type: "date" },
                                { name: "company", label: "Company", type: "text" },
                                { name: "email", label: "Email", type: "email" },
                                { name: "first_name", label: "First Name", type: "text" },
                                { name: "last_name", label: "Last Name", type: "text" },
                                { name: "phone_number", label: "Phone Number", type: "text" },
                                { name: "website", label: "Website", type: "text" },
                                { name: "zip_code", label: "Zip Code", type: "text" }
                            ]
                        }
                    }
                },
                action: {
                    editor: {
                        data: {
                            actions: [
                                {
                                    label: 'Marketing',
                                    method: 'POST',
                                    url: 'http://whatever.com/marketing-form-submission',
                                },
                                {
                                    label: 'Sales',
                                    method: 'POST',
                                    target: '_blank',
                                    url: 'http://whatever.com/sales-form-submission',
                                }
                            ]
                        }
                    }
                }
            }
        }
    };

    const options = {
        amp: true
    }

    const features = {
        imageEditor: true,
        userUploads: true,
        pageAnchors: true,
        undoRedo: true,
        textEditor: {
            tables: true,
            emojis: true
        }
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
            editorRef.current.loadDesign(savedDesign);
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