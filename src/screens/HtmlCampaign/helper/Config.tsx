import { v4 as uuidv4 } from 'uuid';
import { TRANSLATE_HEBREW, TRANSLATE_ENGLISH } from '../../../assets/translations/BeeEditor/Languages';
import { FONTS } from '../../../helpers/Fonts/Init';
import ProductCatalog from '../../../model/ProductCatalog/ProductCatalog';
import { AddProductCatalogType } from '../../../config/enum';
import { DisplayConditionsDialog } from '../components/ContentDialogs';
import { getDisplayConditions, deleteDisplayCondition } from '../../../redux/reducers/campaignEditorSlice';

type dialog = (a: any) => void;
type save = (a: any) => void;
const AUTO_SAVE_SECONDS = 180; // 3 minutes

export interface ConfigOptions {
    classes: any;
    displayConditions?: any[];
    onSaveUserBlock: Function;
    IsRTL: Boolean;
    openModal: any;
    SetDialog: dialog;
    EditRow: Function;
    SaveCampaign: save;
    AutoSaveCampaign: Function,
    DesignChange: Function,
    DeleteBlock: Function;
    CampaignId: Number;
    PulseemEditBlock: Function;
    getRows: Function;
    handleDeleteRow: Function;
    handleEditRow: Function;
    t: any;
    languageCode: number;
    dispatch?: any;
    editorFonts?: any;
}

export const BeeConfig = (Options: ConfigOptions) => {
    const {
        classes,
        displayConditions,
        onSaveUserBlock,
        IsRTL,
        EditRow,
        openModal,
        SetDialog,
        CampaignId,
        DeleteBlock,
        SaveCampaign,
        AutoSaveCampaign,
        DesignChange,
        getRows,
        handleEditRow,
        handleDeleteRow,
        PulseemEditBlock,
        t,
        languageCode,
        dispatch,
        editorFonts
    } = Options;

    const editorLanguage = {
        'he': 'he-IL',
        'en': 'en-US',
        'fr': 'fr-FR', // French
        'es': 'es-ES', // Spanish
        'de': 'de-DE', // German
        'ru': 'ru-RU', // Russian
        'ja': 'ja-JP', // Japanese
        'ro': 'ro-RO', // Romanian
        'ar': 'ar-SA', // Arabic
        'hu': 'hu-HU', // Hungarian
        'sk': 'sk-SK', // Slovak
        'pt': 'pt-PT', // Portuguese
        'nl': 'nl-NL', // Dutch
        'pl': 'pl-PL'  // Polish
    } as any;

    const conditionsWithIds = (displayConditions || []).map((cond: any) => ({
        ...cond,
        id: cond.id || cond.ID || Math.random().toString(36).substr(2, 9)
    }));

    return {
        uid: 'f7768f7b-06af-4ada-bbd3-18a237524c31', //needed for identify resources of the that user and billing stuff
        container: 'bee-plugin-container', //Identifies the id of div element that contains BEE Plugin
        language: editorLanguage[languageCode], //Options.IsRTL ? 'he-IL' : 'en-US',
        customCss: 'https://pulseem.co.il/pulseem/css/beefreeRtlFixes.css',
        inlineCSS: `
          /* Hide Add condition button in left sidebar */
          .row-display-condition-add-button--cs {
            display: none !important;
            visibility: hidden !important;
          }
          /* Make display condition buttons same width and padding */
          .row-display-condition-select-button--cs,
          .row-display-condition-open-builder-button--cs {
            min-width: 140px !important;
            width: 140px !important;
            max-width: 140px !important;
            flex: 0 0 140px !important;
            padding: 8px 16px !important;
          }
          /* Show delete button for display conditions */
          .row-display-condition-delete-button--cs {
            display: inline-block !important;
            visibility: visible !important;
          }
        `,
        trackChanges: true,
        //autosave: AUTO_SAVE_SECONDS,
        loadingSpinnerDisableOnSave: true,
        sidebarPosition: IsRTL ? 'right' : 'left',
        loadingSpinnerTheme: 'light',
        saveRows: true,
        rowDisplayConditions: conditionsWithIds,
        rowsConfiguration: {
            emptyRows: true,
            defaultRows: false,
            // externalContentURLs: [{
            //     name: "Saved Rows",
            //     value: "saved-rows",
            //     handle: 'saved-rows',
            //     isLocal: true,
            //     behaviors: {
            //       canEdit: true,
            //       canDelete: true,
            //     },
            // }]
        },
        editorFonts: editorFonts,
        workspace: {
            type: 'default', // 'mixed'|'amp_only'|'html_only'
        },
        defaultModulesOrder: [
            'Heading',
            'Text',
            'Image',
            'Button',
            'Menu',
            'Divider',
            'Spacer',
            'Icons',
            'Video',
            'Social',
            'Stickers',
            'Carousel',
            'Gifs'
        ],
        hooks: {
            getRows: {
                handler: async (resolve: Function, reject: Function, args: any) => {
                    const rows = await getRows(args?.handle);
                    resolve(rows);
                }
            }
        },
        onSaveRow: async (jsonFile: any) => {
            if (jsonFile) {
                const json = JSON.parse(jsonFile)
                //const rowName = json.metadata.name;
                onSaveUserBlock(jsonFile, json);
            }
        },
        contentDialog: {
            externalContentURLs: {
                label: t('campaigns.addProductBlock'),
                handler: async function (resolve: any, reject: any) {
                    const results = await openModal(ProductCatalog, {}, classes);
                    let newRow = results.row;
                    if (newRow === '') reject();
                    else {
                        newRow['uuid'] = uuidv4();
                        if (newRow?.metadata?.StaticOrDynamic === AddProductCatalogType.Dynamic) {
                            newRow['container']['style']['event-type-enabled'] = newRow?.metadata?.EventTypeEnabled;
                            newRow['container']['style']['event-type'] = newRow?.metadata?.EventType;
                            newRow['container']['style']['category-enabled'] = newRow?.metadata?.ProductCategoryEnabled;
                            newRow['container']['style']['category'] = newRow?.metadata?.ProductCategory;
                            newRow['container']['style']['product-count'] = newRow?.metadata?.NumOfProdcuts;
                        }
                        newRow['metadata']['uuid'] = uuidv4();
                        newRow['metadata']['name'] = `#${newRow?.metadata?.NumOfProdcuts} - ${newRow?.metadata?.EventType} - ${newRow?.metadata?.category} - ${newRow?.metadata?.order} - ${newRow?.metadata?.direction}`;
                        newRow['metadata']['tags'] = newRow?.metadata?.StaticOrDynamic === AddProductCatalogType.Dynamic ? 'Dynamic-Products' : 'Products';
                        await onSaveUserBlock(JSON.stringify(newRow), newRow)
                        resolve();
                    }
                }
            },
            rowDisplayConditions: {
                label: t('campaigns.displayConditions.openBuilder') || 'Open builder',
                handler: async (resolve: Function, reject: Function, currentCondition?: any) => {
                    try {
                        const result: any = await openModal(
                            DisplayConditionsDialog,
                            { currentCondition },
                            classes
                        );

                        if (result && result.before && result.after) {
                            if (dispatch) {
                                dispatch(getDisplayConditions());
                            }
                            resolve(result);
                        } else {
                            reject();
                        }
                    } catch (e) {
                        reject();
                    }
                }
            },
            onEditRowDisplayCondition: {
                handler: async (resolve: Function, reject: Function, currentCondition?: any) => {
                    try {
                        const result: any = await openModal(
                            DisplayConditionsDialog,
                            { currentCondition },
                            classes
                        );

                        if (result && result.before && result.after) {
                            if (dispatch) {
                                dispatch(getDisplayConditions());
                            }
                            resolve(result);
                        } else {
                            reject();
                        }
                    } catch (e) {
                        reject();
                    }
                }
            },
            // onDeleteRowDisplayCondition: {
            //     handler: async (resolve: Function, reject: Function, condition?: any) => {
            //         try {
            //             if (condition?.id) {
            //                 await dispatch(deleteDisplayCondition(condition.id));
            //                 await dispatch(getDisplayConditions());
            //             }
            //             resolve(true);
            //         } catch (e) {
            //             reject();
            //         }
            //     }
            // },
            saveRow: {
                handler: async (resolve: Function, reject: Function, args: any) => {
                    const results = await openModal(EditRow, args, classes);
                    if (results?.name) {
                        const metadata: any = {
                            name: results?.name,
                            tags: results?.tags ?? t('campaigns.savedBlocks'),
                            uuid: uuidv4()
                        }
                        resolve(metadata);
                    }
                    else {
                        reject();
                    }
                }
            },
            onDeleteRow: {
                handler: async (resolve: Function, reject: Function, args: any) => {
                    const row_id = args?.row?.metadata?.uuid;
                    await DeleteBlock(args, row_id);
                    handleDeleteRow(args);
                    resolve(true)
                }
            },
            // onEditRow
            onEditRow: {
                handler: async (resolve: Function, reject: Function, args: any) => {
                    try {
                        const results = await openModal(EditRow, args, classes);
                        if (results?.name) {
                            args.row.metadata.name = results?.name;
                            args.row.metadata.tags = results?.tags ?? t('campaigns.savedBlocks');

                            const rows = await getRows(args.handle);
                            const row = rows.find((r: any) => {
                                return r.metadata.uuid === args.row?.metadata?.uuid;
                            });

                            row.metadata.name = results?.name;
                            row.metadata.tags = results?.tags ?? t("campaigns.savedBlocks");

                            const saveBlockObj = {
                                Category: results?.name,
                                Tags: results?.tags?.split(',') ?? t('campaigns.savedBlocks'),
                                Data: JSON.stringify(JSON.stringify(row)),
                                uuid: args.row?.metadata?.uuid ?? uuidv4(),
                                Json: row
                            }
                            await PulseemEditBlock(saveBlockObj);
                            await handleEditRow(args, results?.name, results?.tags ?? t('campaigns.savedBlocks'));
                        }
                        resolve(true);
                    }
                    catch (e) {
                        reject(e);
                    }

                }

            },
        },
        //#region Methods
        onSave: async (jsonFile: any, htmlFile: any, ampHtml: any) => {
            await SaveCampaign({
                campaignId: CampaignId,
                JsonData: jsonFile,
                HtmlData: htmlFile,
                AmpData: ampHtml
            });
        },
        onSend: () => {
            SetDialog(DialogType.TEST_SEND);
        },
        onWarning: (alertMessage: any) => {
            // console.log('onWarning ', alertMessage)
        },
        onError: (errorMessage: any) => {
            // console.log('onError ', errorMessage)
        },
        onLoad: async (jsonFile: any) => {
            // console.log(jsonFile);
        },
        onAutoSave: () => AutoSaveCampaign(),
        onChange: () => DesignChange()
        // onChange: (jsonFile: any, response: any) => {
        // https://docs.beefree.io/beefree-sdk/tracking-message-changes#content-codes - Codes
        // Every code should get "00" in the end
        // switch (response.code) {
        //     case "0780": { // HTML Block event
        //         if (response?.value.indexOf('!DOCTYPE') > -1 || response?.value.indexOf('<body') > -1 || response?.value.indexOf('<html') > -1) {
        //             handleUndoChange('0780', true);
        //             return false;
        //         }
        //         else {
        //             handleUndoChange('0780', false);
        //             DesignChange();
        //         }
        //         break;
        //     }
        //     default: {
        //         DesignChange();
        //     }
        // }
        //}
        //#endregion
    }
};
export const DefaultContent = (IsRTL: Boolean, languageCode: number) => {
    const isRTLdirection: boolean = languageCode === 0 || languageCode === 8;

    return {
        titleDefaultStyles: {
            h1: {
                direction: isRTLdirection ? "rtl" : "ltr",
                "text-align": isRTLdirection ? "right" : "left",
            },
            h2: {
                direction: isRTLdirection ? "rtl" : "ltr",
                "text-align": isRTLdirection ? "right" : "left",
            },
            h3: {
                direction: isRTLdirection ? "rtl" : "ltr",
                "text-align": isRTLdirection ? "right" : "left",
            },
            h4: {
                direction: isRTLdirection ? "rtl" : "ltr",
                "text-align": isRTLdirection ? "right" : "left",
            },
            h5: {
                direction: isRTLdirection ? "rtl" : "ltr",
                "text-align": isRTLdirection ? "right" : "left",
            },
        },
        translations: {
            "mailup-bee-common-widgets-heading": {
                "default-text": languageCode === 0 ? "אני כותרת מוכנה לתוכן שלך" : "I&apos;m a new title block",
            }
        },
        contentDefaults: {
            title: {
                html: languageCode === 0
                    ? "<h3>אני כותרת מוכנה לתוכן שלך.</h3>"
                    : "<h3>I&apos;m a new title 1111.</h3>",
                text: languageCode === 0
                    ? "<h3>אני כותרת מוכנה לתוכן שלך.</h3>"
                    : "<h3>I&apos;m a new title 1111.</h3>",
                styles: {
                    textAlign: isRTLdirection ? "right" : "left",
                    direction: isRTLdirection ? "rtl" : "ltr",
                },
                blockOptions: {
                    align: isRTLdirection ? "right" : "left",
                    textAlign: isRTLdirection ? "right" : "left",
                    direction: isRTLdirection ? "rtl" : "ltr",
                },
            },
            text: {
                html: languageCode === 0 ? "<p style='font-size: 14px;text-align: right; direction: rtl;'>אני בלוק טקסט מוכן לתוכן שלך.</p>" :
                    languageCode === 14 ? "<p style='font-size: 14px;text-align: left; direction: ltr;'>Jestem gotowym blokiem tekstu dla twojej treści.</p>" :
                        "<p style='font-size: 14px;text-align:left; direction: ltr;'>I&apos;m a new Text block ready for your content.</p>",
                styles: {
                    textAlign: isRTLdirection ? "right" : "left",
                    direction: isRTLdirection ? "rtl" : "ltr",
                },
                blockOptions: {
                    textAlign: isRTLdirection ? "right" : "left",
                    direction: isRTLdirection ? "rtl" : "ltr",
                },
            },
            paragraph: {
                html: languageCode === 0
                    ? "אני שורת טקסט מוכן לתוכן שלך."
                    : "I&apos;m a new text block.",
                styles: {
                    textAlign: isRTLdirection ? "right" : "left",
                    direction: isRTLdirection ? "rtl" : "ltr",
                },
                blockOptions: {
                    textAlign: isRTLdirection ? "right" : "left",
                    direction: isRTLdirection ? "rtl" : "ltr",
                },
            },
            list: {
                html: languageCode === 0
                    ? "<li>שורה 1 ברשימה</li>"
                    : "<li>This is an unordered list</li>",
                styles: {
                    textAlign: isRTLdirection ? "right" : "left",
                    direction: isRTLdirection ? "rtl" : "ltr",
                },
                blockOptions: {
                    textAlign: isRTLdirection ? "right" : "left",
                    direction: isRTLdirection ? "rtl" : "ltr",
                },
            },
            button: {
                label: languageCode === 0 ? 'כפתור' : 'Button'
            },
            table: {
                rows: [{
                    cells: [
                        { html: languageCode === 0 ? "עמודת-טקסט" : "new-default-text" }, { html: languageCode === 0 ? "טקסט-משני" : "second text" }
                    ]
                }, {
                    cells: [
                        { html: languageCode === 0 ? "עמודת-טקסט" : "third" }, { html: languageCode === 0 ? "טקסט-משני" : "last text" }
                    ]
                }],
                headers: [{
                    cells: [{ html: languageCode === 0 ? "כותרת 1" : "header 1" }, { html: languageCode === 0 ? "כותרת 2" : "header 2" }]
                }],
                styles: {
                    fontWeight: "200",
                    fontSize: "14px",
                    textAlign: languageCode === 0 ? "right" : "left",
                    lineHeight: "200%",
                    direction: languageCode === 0 ? "rtl" : "ltr",
                    headersFontSize: "16px",
                    headersFontWeight: "400",
                    headersTextAlign: languageCode === 0 ? "right" : "left"
                },
            }
        },
        defaultTemplate: {
            page: {
                title: "Template Base",
                description: "Test template for BEE",
                template: {
                    name: "template-base",
                    type: "basic",
                    version: "0.0.1",
                },
                body: {
                    type: "mailup-bee-page-proprerties",
                    container: {
                        style: {
                            "background-color": "#FFFFFF",
                        },
                    },
                    content: {
                        style: {
                            "font-family": "Arial, 'Helvetica Neue', Helvetica, sans-serif",
                            color: "#000000",
                        },
                        computedStyle: {
                            linkColor: "#0068A5",
                            messageBackgroundColor: "transparent",
                            messageWidth: "600px",
                        },
                    },
                    webFonts: [],
                },
                rows: [
                    {
                        type: "one-column-empty",
                        container: {
                            style: {
                                "background-color": "transparent",
                                "background-image": "none",
                                "background-repeat": "no-repeat",
                                "background-position": "top left",
                            },
                        },
                        content: {
                            style: {
                                "background-color": "transparent",
                                color: "#000000",
                                width: "600px",
                                "background-image": "none",
                                "background-repeat": "no-repeat",
                                "background-position": "top left",
                            },
                            computedStyle: {
                                rowColStackOnMobile: true,
                                rowReverseColStackOnMobile: false,
                            },
                        },
                        columns: [
                            {
                                "grid-columns": 12,
                                modules: [],
                                style: {
                                    "background-color": "transparent",
                                    "padding-top": "5px",
                                    "padding-right": "0px",
                                    "padding-bottom": "5px",
                                    "padding-left": "0px",
                                    "border-top": "0px solid transparent",
                                    "border-right": "0px solid transparent",
                                    "border-bottom": "0px solid transparent",
                                    "border-left": "0px solid transparent",
                                },
                                uuid: uuidv4(),
                            },
                        ],
                        uuid: uuidv4(),
                    },
                ],
            },
            comments: {},
        },
    };
};

export const DialogType = {
    TEST_SEND: "testSend",
    DELETE: "delete",
    SUCCESS_SENT: "campaigns.successSent",
    MISSING_API_KEY: "common.missingApi",
    CAMPAIGN_NOT_FOUND: "campaigns.campaignNotFound",
    CANNOT_CREATE_GROUP: "campaigns.cannotCreateGroup",
    ERROR_OCCURED: "common.ErrorOccured",
    NONE_ACTIVE_RECIPIENT: "campaigns.noneActiveRecipientsFound",
    GENERIC: "generic",
    NO_CREDITS_LEFT: "sms.noCredits",
    Templates: "templates",
    SET_USER_BLOCK: "campaigns.saveBlock",
    SAVE_TEMPLATE: "campaigns.saveTemplate",
    PENDING_APPROVAL: "campaigns.newsLetterEditor.errors.PendingApprovalDesc",
    UNDER_REVIEW: "campaigns.newsLetterEditor.errors.PendingApproval551Desc",
    PAYMENT_FAILED: "campaigns.newsLetterEditor.errors.paymentfailed553Desc",
    PAYMENT_PROCESSING: "campaigns.newsLetterEditor.errors.paymentProcessing552Desc",
};
