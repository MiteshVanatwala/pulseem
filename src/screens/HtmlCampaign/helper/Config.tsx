import { v4 as uuidv4 } from 'uuid';
import { TRANSLATE_HEBREW, TRANSLATE_ENGLISH } from '../../../assets/translations/BeeEditor/Languages';
import { FONTS } from '../../../helpers/Fonts/Init';
import ProductCatalog from '../../../model/ProductCatalog/ProductCatalog';

type dialog = (a: any) => void;
type save = (a: any) => void;
const AUTO_SAVE_SECONDS = 180; // 3 minutes

export interface ConfigOptions {
    classes: any;
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
    // HandleAutoSave: Function,
    t: any;
}

export const BeeConfig = (Options: ConfigOptions) => {
    const {
        classes,
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
        // HandleAutoSave,
        handleDeleteRow,
        PulseemEditBlock,
        t
    } = Options;
    return {
        uid: 'f7768f7b-06af-4ada-bbd3-18a237524c31', //needed for identify resources of the that user and billing stuff
        container: 'bee-plugin-container', //Identifies the id of div element that contains BEE Plugin
        language: Options.IsRTL ? 'he-IL' : 'en-US',
        trackChanges: true,
        //autosave: AUTO_SAVE_SECONDS,
        loadingSpinnerDisableOnSave: true,
        sidebarPosition: IsRTL ? 'right' : 'left',
        loadingSpinnerTheme: 'light',
        saveRows: true,
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
        editorFonts: FONTS(),
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
                        // newRow['container']['style']['event-type'] = newRow?.metadata?.EventType;
                        // newRow['container']['style']['category'] = newRow?.metadata?.ProductCategory;
                        // newRow['container']['style']['product-count'] = newRow?.metadata?.NumOfProdcuts;
                        newRow['metadata']['uuid'] = uuidv4();
                        newRow['metadata']['name'] = 'Product Catalog';
                        newRow['metadata']['tags'] = 'product-catalog';
                        newRow['metadata']['event-type'] = newRow?.metadata?.EventType;
                        newRow['metadata']['category'] = newRow?.metadata?.ProductCategory;
                        newRow['metadata']['product-count'] = newRow?.metadata?.NumOfProdcuts;
                        console.log(newRow);
                        await onSaveUserBlock(JSON.stringify(newRow), newRow)
                        resolve();
                    }
                }
            },
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
                HtmlData: ampHtml ?? htmlFile
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
            console.log(jsonFile);
        },
        onAutoSave: () => AutoSaveCampaign(),
        onChange: () => DesignChange()
        //#endregion
    }
};
export const DefaultContent = (IsRTL: Boolean) => {
    return {
        titleDefaultStyles: {
            h1: {
                direction: IsRTL ? "rtl" : "ltr",
                "text-align": IsRTL ? "right" : "left",
            },
            h2: {
                direction: IsRTL ? "rtl" : "ltr",
                "text-align": IsRTL ? "right" : "left",
            },
            h3: {
                direction: IsRTL ? "rtl" : "ltr",
                "text-align": IsRTL ? "right" : "left",
            },
            h4: {
                direction: IsRTL ? "rtl" : "ltr",
                "text-align": IsRTL ? "right" : "left",
            },
            h5: {
                direction: IsRTL ? "rtl" : "ltr",
                "text-align": IsRTL ? "right" : "left",
            },
        },
        contentDefaults: {
            title: {
                blockOptions: {
                    align: IsRTL ? "right" : "left",
                },
            },
            text: {
                html: IsRTL
                    ? "<p style='font-size: 14px;text-align: right; direction: rtl;'>אני בלוק טקסט מוכן לתוכן שלך.</p>"
                    : "<p style='font-size: 14px;text-align:left; direction: ltr;'>I&apos;m a new Text block ready for your content.</p>",
                styles: {
                    textAlign: IsRTL ? "right" : "left",
                    direction: IsRTL ? "rtl" : "ltr",
                },
                blockOptions: {
                    textAlign: IsRTL ? "right" : "left",
                    direction: IsRTL ? "rtl" : "ltr",
                },
            },
            paragraph: {
                styles: {
                    textAlign: IsRTL ? "right" : "left",
                    direction: IsRTL ? "rtl" : "ltr",
                },
                blockOptions: {
                    textAlign: IsRTL ? "right" : "left",
                    direction: IsRTL ? "rtl" : "ltr",
                },
            },
            list: {
                styles: {
                    textAlign: IsRTL ? "right" : "left",
                    direction: IsRTL ? "rtl" : "ltr",
                },
                blockOptions: {
                    textAlign: IsRTL ? "right" : "left",
                    direction: IsRTL ? "rtl" : "ltr",
                },
            },
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
    SAVE_TEMPLATE: "campaigns.saveTemplate"
};
