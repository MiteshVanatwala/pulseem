import { v4 as uuidv4 } from 'uuid';
import { TRANSLATE_HEBREW, TRANSLATE_ENGLISH } from './Languages';

type dialog = (a: any) => void;
type save = (a: any) => void;
const AUTO_SAVE_SECONDS = 60000; // 1 minute

export interface ConfigOptions {
    classes: any,
    onSaveUserBlock: Function,
    IsRTL: Boolean,
    openModal: any,
    SetDialog: dialog,
    EditRow: Function,
    SaveCampaign: save,
    DeleteBlock: Function,
    CampaignId: Number,
    PulseemEditBlock: Function,
    getRows: Function,
    setRow: Function,
    handleDeleteRow: Function,
    handleEditRow: Function,
    t: any
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
        setRow,
        getRows,
        handleEditRow,
        handleDeleteRow,
        PulseemEditBlock,
        t
    } = Options;
    return {
        uid: 'f7768f7b-06af-4ada-bbd3-18a237524c31', //needed for identify resources of the that user and billing stuff
        container: 'bee-plugin-container', //Identifies the id of div element that contains BEE Plugin
        language: Options.IsRTL ? 'he-IL' : 'en-US',
        trackChanges: true,
        autosave: 60,
        translations: IsRTL ? TRANSLATE_HEBREW : TRANSLATE_ENGLISH,
        sidebarPosition: IsRTL ? 'right' : 'left',
        loadingSpinnerTheme: 'light',
        saveRows: true,
        defaultForm: {

        },
        workspace: {
            type: 'mixed',
            contentWidth: 600,
            popup: {
                contentWidth: 600,
                contentWidthMobile: 300
            }
        },
        rowsConfiguration: {
            emptyRows: true,
            defaultRows: false,
            externalContentURLs: [
                {
                    name: t("campaigns.savedBlocks"),
                    value: "saved-rows",
                    handle: 'saved-rows',
                    isLocal: true,
                    behaviors: {
                        canEdit: true,
                        canDelete: true,
                    },
                }
            ]
        },
        hooks: {
            getRows: {
                handler: async (resolve: Function, reject: Function, args: any) => {
                    const rows = await getRows(args.handle);
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
            saveRow: {
                handler: async (resolve: Function, reject: Function, args: any) => {
                    const results = await openModal(EditRow, args, classes);
                    if (results?.name) {
                        const metadata: any = {
                            name: results?.name,
                            tags: results?.tags ?? 'saved-rows',
                            uuid: uuidv4()
                        }
                        resolve(metadata);
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
                            args.row.metadata.tags = results?.tags ?? 'saved-rows';

                            const rows = await getRows(args.handle);
                            const row = rows.find((r: any) => {
                                return r.metadata.uuid === args.row?.metadata?.uuid
                            });

                            row.metadata.name = results?.name;
                            row.metadata.tags = results?.tags ?? 'saved-rows';

                            const saveBlockObj = {
                                Category: results?.name,
                                Tags: results?.tags?.split(',') ?? 'saved-rows',
                                Data: JSON.stringify(JSON.stringify(row)),
                                uuid: args.row?.metadata?.uuid ?? uuidv4(),
                                Json: row
                            }
                            await PulseemEditBlock(saveBlockObj);
                            await handleEditRow(args, results?.name, results?.tags ?? 'saved-rows');
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
            console.log('onWarning ', alertMessage)
        },
        onError: (errorMessage: any) => {
            console.log('onError ', errorMessage)
        },
        onLoad: (jsonFile: any) => {
            console.log(jsonFile);
        },
        // Auto Save here
        onChange: (jsonFile: any) => {
            const interval = setInterval(() => {
                SaveCampaign({
                    campaignId: CampaignId,
                    JsonData: jsonFile,
                    HtmlData: null
                });
                clearInterval(interval);
            }, AUTO_SAVE_SECONDS);
        }
        //#endregion
    }
};

export const DialogType = {
    TEST_SEND: "testSend",
    DELETE: "delete",
    SUCCESS_SENT: "campaigns.successSent",
    MISSING_API_KEY: "campaigns.missingApi",
    CAMPAIGN_NOT_FOUND: "campaigns.campaignNotFound",
    CANNOT_CREATE_GROUP: "campaigns.cannotCreateGroup",
    ERROR_OCCURED: "campaigns.errorOccured",
    NONE_ACTIVE_RECIPIENT: "campaigns.noneActiveRecipientsFound",
    GENERIC: "generic",
    NO_CREDITS_LEFT: "sms.noCredits",
    SET_USER_BLOCK: "campaigns.saveBlock"
};