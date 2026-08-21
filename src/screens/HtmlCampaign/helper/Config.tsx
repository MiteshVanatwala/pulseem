import { v4 as uuidv4 } from 'uuid';
import { TRANSLATE_HEBREW, TRANSLATE_ENGLISH } from '../../../assets/translations/BeeEditor/Languages';
import { FONTS } from '../../../helpers/Fonts/Init';
import ProductCatalog from '../../../model/ProductCatalog/ProductCatalog';
import { AddProductCatalogType } from '../../../config/enum';
import { DisplayConditionsDialog, ConfirmDeleteRowDialog, ConfirmDeleteRowDisplayConditionDialog } from '../components/ContentDialogs';
import { deleteDisplayCondition } from '../../../redux/reducers/campaignEditorSlice';


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
    onRefreshConditions?: Function;
    onConditionDeletedFromDesign?: Function;
    onEditorJsonChange?: Function;
    setIsDisplayConditionDialogOpen?: Function;
    hasDisplayConditions?: boolean;
    /** Called on every onChange with the full editor JSON so the parent can scan all font-family values. */
    onFontChange?: (jsonFile: any) => void;
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
        editorFonts,
        onRefreshConditions,
        onConditionDeletedFromDesign,
        onEditorJsonChange,
        setIsDisplayConditionDialogOpen,
        hasDisplayConditions,
        onFontChange,
    } = Options;

    const getConditionId = (condition?: any) => condition?.id ?? condition?.ID ?? null;

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
        id: cond.id || cond.ID || Math.random().toString(36).substr(2, 9),
        type: IsRTL ? 'תנאים' : 'Conditions'
    }));
    const removeFromRowLabel = t('campaigns.displayConditions.removeFromRow') || (IsRTL ? 'הסרה משורה' : 'Remove from row');

    return {
        uid: 'f7768f7b-06af-4ada-bbd3-18a237524c31', //needed for identify resources of the that user and billing stuff
        container: 'bee-plugin-container', //Identifies the id of div element that contains BEE Plugin
        language: editorLanguage[languageCode], //Options.IsRTL ? 'he-IL' : 'en-US',
        // translations: IsRTL ? TRANSLATE_HEBREW : TRANSLATE_ENGLISH,
        customCss: (() => {
            const sidebarCss = [
                `@import url('https://pulseem.co.il/pulseem/css/beefreeRtlFixes.css');`,
                // Hide the "Add condition" button in the display conditions sidebar
                `.row-display-condition-add-button--cs {`,
                `  display: none !important;`,
                `  visibility: hidden !important;`,
                `  width: 10 !important;`,
                `  height: 10 !important;`,
                `  margin: 0 !important;`,
                `  padding: 0 !important;`,
                `  border: none !important;`,
                `  pointer-events: none !important;`,
                `}`,
                // Force parent container to flex so buttons split evenly
                `.row-display-condition-buttons-container--cs {`,
                `  display: flex !important;`,
                `  flex-direction: row !important;`,
                `  gap: 8px !important;`,
                `  width: 100% !important;`,
                `}`,
                // Equal width — exactly half the container each
                `.row-display-condition-select-button--cs,`,
                `.row-display-condition-open-builder-button--cs {`,
                `  flex: 1 1 0% !important;`,
                `  width: 35% !important;`,
                `  min-width: 0 !important;`,
                `  max-width: 35% !important;`,
                `  box-sizing: border-box !important;`,
                `  text-align: center !important;`,
                `}`,
                `.row-display-condition-open-builder-button--cs,`,
                `.row-display-condition-open-builder-button--cs:hover,`,
                `.row-display-condition-open-builder-button--cs:focus,`,
                `.row-display-condition-open-builder-button--cs:active,`,
                `.row-display-condition-open-builder-button--cs.Button_button__IQK4r.Button_text__IQK4r.Button_primary__IQK4r,`,
                `.row-display-condition-open-builder-button--cs.Button_button__IQK4r.Button_text__IQK4r.Button_primary__IQK4r:hover,`,
                `.row-display-condition-open-builder-button--cs.Button_button__IQK4r.Button_text__IQK4r.Button_primary__IQK4r:focus,`,
                `.row-display-condition-open-builder-button--cs.Button_button__IQK4r.Button_text__IQK4r.Button_primary__IQK4r:active {`,
                `  --custom-brand-primary-color: #ff0054 !important;`,
                `  background: #ff0054 !important;`,
                `  background-color: #ff0054 !important;`,
                `  background-image: none !important;`,
                `  color: #bd2121 !important;`,
                `  fill: #ffffff !important;`,
                `  border-color: #ff0054 !important;`,
                `}`,
                `.row-display-condition-open-builder-button--cs *,`,
                `.row-display-condition-open-builder-button--cs:hover *,`,
                `.row-display-condition-open-builder-button--cs:focus *,`,
                `.row-display-condition-open-builder-button--cs:active * {`,
                `  color: #ffffff !important;`,
                `  fill: #ffffff !important;`,
                `}`,
                // Show delete button — only if user has display conditions feature
                ...(hasDisplayConditions ? [
                `.row-display-condition-remove-button--cs {`,
                `  display: inline-block !important;`,
                `  visibility: visible !important;`,
                `  color: transparent !important;`,
                `  position: relative !important;`,
                `}`,
                `.row-display-condition-remove-button--cs::after {`,
                `  content: "${String(removeFromRowLabel).replace(/"/g, '\\"')}" !important;`,
                `  color: #d12f19 !important;`,
                `  font-size: 14px !important;`,
                `  line-height: 1.4 !important;`,
                `}`,
                ] : [
                // Hide entire display condition section for users without feature 74
                `.row-display-condition-add-button--cs,`,
                `.row-display-condition-select-button--cs,`,
                `.row-display-condition-open-builder-button--cs,`,
                `.row-display-condition-remove-button--cs,`,
                `.row-display-condition-buttons-container--cs,`,
                `[class*="DisplayCondition"],`,
                `[class*="display-condition"],`,
                `[class*="row-display-condition"] {`,
                `  display: none !important;`,
                `  visibility: hidden !important;`,
                `  height: 0 !important;`,
                `  margin: 0 !important;`,
                `  padding: 0 !important;`,
                `  pointer-events: none !important;`,
                `}`,
                ]),
                // Hide the Edit action in the selected display condition card
                `.row-display-condition-edit-button--cs,`,
                `.row-display-condition-edit-button--cs:hover,`,
                `.row-display-condition-edit-button--cs:focus,`,
                `.row-display-condition-edit-button--cs:active {`,
                `  display: none !important;`,
                `  visibility: hidden !important;`,
                `  width: 0 !important;`,
                `  height: 0 !important;`,
                `  margin: 0 !important;`,
                `  padding: 0 !important;`,
                `  border: none !important;`,
                `  pointer-events: none !important;`,
                `}`,
                // Hide Before/After syntax blocks in the selected condition card
                `.display-condition-label_before--cs,`,
                `.display-condition-label_after--cs,`,
                `.display-condition-before--cs,`,
                `.display-condition-after--cs {`,
                `  display: none !important;`,
                `  visibility: hidden !important;`,
                `  height: 0 !important;`,
                `  margin: 0 !important;`,
                `  padding: 0 !important;`,
                `  overflow: hidden !important;`,
                `}`,
                // Style the condition card background
                `.display-condition-card--cs {`,
                `  background-color: transparent !important;`,
                `  border: 1px solid #dde3f0 !important;`,
                `  border-radius: 6px !important;`,
                `}`,
                `.display-condition-label--cs {`,
                `  font-size: 15px !important;`,
                `  font-weight: 400 !important;`,
                `  color: #888 !important;`,
                `  line-height: 1.5 !important;`,
                `  word-break: break-word !important;`,
                `  white-space: pre-line !important;`,
                `  direction: ${IsRTL ? 'rtl' : 'ltr'} !important;`,
                `  text-align: ${IsRTL ? 'right' : 'left'} !important;`,
                `}`,
                `.display-condition-label--cs::first-line {`,
                `  font-size: 16px !important;`,
                `  font-weight: 600 !important;`,
                `  color: #333 !important;`,
                `}`,
                // Style description in the selected condition card
                `.display-condition-description--cs {`,
                `  display: block !important;`,
                `  visibility: visible !important;`,
                `  margin-top: 6px !important;`,
                `  font-size: 14px !important;`,
                `  font-weight: 400 !important;`,
                `  color: #666 !important;`,
                `  line-height: 1.4 !important;`,
                `  white-space: pre-line !important;`,
                `  word-break: break-word !important;`,
                `  direction: ${IsRTL ? 'rtl' : 'ltr'} !important;`,
                `  text-align: ${IsRTL ? 'right' : 'left'} !important;`,
                `}`,
                // RTL fixes for the condition selector modal
                ...(IsRTL ? [
                `[class*="RowDisplayConditionSelector"],`,
                `[class*="row-display-condition-selector"],`,
                `[class*="DisplayConditionSelector"],`,
                `[class*="ConditionSelector"] {`,
                `  direction: rtl !important;`,
                `}`,
                `[class*="RowDisplayConditionSelector"] *,`,
                `[class*="row-display-condition-selector"] *,`,
                `[class*="DisplayConditionSelector"] *,`,
                `[class*="ConditionSelector"] * {`,
                `  direction: rtl !important;`,
                `  text-align: right !important;`,
                `}`,
                `[class*="RowDisplayConditionSelector"] input,`,
                `[class*="DisplayConditionSelector"] input {`,
                `  text-align: right !important;`,
                `}`,
                ] : []),
            ].join('\n');
            return `data:text/css;charset=utf-8,${encodeURIComponent(sidebarCss)}`;
        })(),
        inlineCSS: ``,
        trackChanges: true,
        //autosave: AUTO_SAVE_SECONDS,
        loadingSpinnerDisableOnSave: true,
        sidebarPosition: IsRTL ? 'right' : 'left',
        loadingSpinnerTheme: 'light',
        saveRows: true,
        translations: {
            ...(IsRTL ? TRANSLATE_HEBREW : TRANSLATE_ENGLISH),
            "bee-newsletter-modules-html": {
                ...(IsRTL ? TRANSLATE_HEBREW : TRANSLATE_ENGLISH)["bee-newsletter-modules-html"],
                "widget-warning-desc": t('campaigns.htmlDocTypeNotAllowedWarning'),
            }
        },
        rowDisplayConditions: hasDisplayConditions ? conditionsWithIds : [],
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
            ...(hasDisplayConditions ? {
            rowDisplayConditions: {
                label: t('campaigns.displayConditions.openBuilder') || 'Open builder',
                handler: async (resolve: Function, reject: Function, currentCondition?: any) => {
                    try {
                        setIsDisplayConditionDialogOpen?.(true);
                        const result: any = await openModal(
                            DisplayConditionsDialog,
                            { currentCondition, onRefreshConditions },
                            classes
                        );
                        setIsDisplayConditionDialogOpen?.(false);

                        if (result?.deleted) {
                            await onConditionDeletedFromDesign?.(result.id);
                            resolve(true);
                        } else if (result && result.before && result.after) {
                            resolve(result);
                        } else {
                            reject();
                        }
                    } catch (e) {
                        setIsDisplayConditionDialogOpen?.(false);
                        reject();
                    }
                }
            },
            onEditRowDisplayCondition: {
                handler: async (resolve: Function, reject: Function, currentCondition?: any) => {
                    try {
                        setIsDisplayConditionDialogOpen?.(true);
                        const result: any = await openModal(
                            DisplayConditionsDialog,
                            { currentCondition, onRefreshConditions },
                            classes
                        );
                        setIsDisplayConditionDialogOpen?.(false);

                        if (result?.deleted) {
                            await onConditionDeletedFromDesign?.(result.id);
                            resolve(true);
                        } else if (result && result.before && result.after) {
                            resolve(result);
                        } else {
                            reject();
                        }
                    } catch (e) {
                        setIsDisplayConditionDialogOpen?.(false);
                        reject();
                    }
                }
            },
            onDeleteRowDisplayCondition: {
                handler: async (resolve: Function, reject: Function, condition?: any) => {
                    console.log('[onDeleteRowDisplayCondition] fired', condition);
                    try {
                        const conditionId = getConditionId(condition);
                        const result: any = await openModal(ConfirmDeleteRowDisplayConditionDialog, { condition }, classes);
                        if (result?.confirmed) {
                            if (conditionId) {
                                await dispatch((deleteDisplayCondition as any)(conditionId)).unwrap();
                                await onRefreshConditions?.();
                                await onConditionDeletedFromDesign?.(conditionId);
                            }
                            resolve(true);
                        } else {
                            reject();
                        }
                    } catch (e) {
                        reject();
                    }
                }
            },
            } : {}),
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
                    try {
                        const result: any = await openModal(ConfirmDeleteRowDialog, args, classes);
                        if (result?.confirmed) {
                            const row_id = args?.row?.metadata?.uuid;
                            await DeleteBlock(args, row_id);
                            handleDeleteRow(args);
                            resolve(true);
                        } else {
                            reject();
                        }
                    } catch (e) {
                        reject();
                    }
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
            onEditorJsonChange?.(jsonFile);
        },
        onAutoSave: () => AutoSaveCampaign(),
        onChange: (jsonFile: any) => {
            onEditorJsonChange?.(jsonFile);
            DesignChange();
            // Forward full JSON to parent for complete font-change detection
            // (covers global, block-level, and inline text toolbar font changes)
            onFontChange?.(jsonFile);
        }
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
