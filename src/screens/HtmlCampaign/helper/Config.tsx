import { useDispatch } from 'react-redux';

type showGallery = (a: Boolean) => void;
type fileSelected = (a: Boolean) => void;
type dialog = (a: any) => void;
type save = (a: any) => void;

export interface ConfigOptions {
    classes: any,
    onSaveUserBlock: Function,
    IsRTL: Boolean,
    openModal: any,
    SetDialog: dialog,
    EditRow: Function,
    SaveCampaign: save,
    SetShowGallery: showGallery,
    SetIsFileSelected: fileSelected,
    DeleteBlock: Function,
    EditBlock: Function,
    CampaignId: Number,
    UserBlocks: any,
    OnReload: Function,
    t: any
}

export const BeeConfig = (Options: ConfigOptions) => {
    const {
        classes,
        onSaveUserBlock,
        IsRTL,
        EditRow,
        openModal,
        EditBlock,
        OnReload,
        SetDialog,
        CampaignId,
        UserBlocks,
        DeleteBlock,
        SaveCampaign,
        SetShowGallery,
        SetIsFileSelected,
        t
    } = Options;
    return {
        uid: 'f7768f7b-06af-4ada-bbd3-18a237524c31', //needed for identify resources of the that user and billing stuff
        container: 'bee-plugin-container', //Identifies the id of div element that contains BEE Plugin
        language: Options.IsRTL ? 'he-IL' : 'en-US',
        trackChanges: true,
        autosave: 60,
        customCss: 'https://unlayer.reactstage.club/Content/BeeFree/custom-bee.css',
        translationsUrl: `https://unlayer.reactstage.club/Content/BeeFree/${IsRTL ? 'he.json' : 'en.json'}`,
        sidebarPosition: IsRTL ? 'right' : 'left',
        loadingSpinnerTheme: 'light',
        saveRows: true,
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
                    resolve(UserBlocks);
                }
            }
        },
        onSaveRow: async (jsonFile: any) => {
            if (jsonFile) {
                const json = JSON.parse(jsonFile)
                const rowName = json.metadata.name;
                onSaveUserBlock(jsonFile, rowName);
                OnReload();
            }
        },
        contentDialog: {
            saveRow: {
                handler: async (resolve: Function, reject: Function, args: any) => {
                    const results = await openModal(EditRow, args, classes);
                    if (results?.name) {
                        const metadata: any = {
                            name: results?.name
                        }
                        resolve(metadata);
                    }
                    reject();
                }
            },
            onDeleteRow: {
                handler: async (resolve: Function, reject: Function, args: any) => {
                    await DeleteBlock(args);
                    resolve(true);
                }
            },
            onEditRow: {
                handler: async (resolve: Function, reject: Function, args: any) => {
                    await EditBlock(args);
                    resolve(true);
                }
            },
            filePicker: (resolve: Function, reject: Function, args: any) => {
                SetShowGallery(true);
                SetIsFileSelected(false);
                const button = document.querySelector('[name="btnConfirm"]');
                if (button) {
                    button.addEventListener('mouseup', (event) => {
                        const modal = document.querySelector('.MuiDialog-paper');
                        const selectedIcon = modal?.querySelector(".image-info svg");
                        if (selectedIcon) {
                            const imgElement: ChildNode | any = selectedIcon?.parentNode?.previousSibling;
                            const style = imgElement?.currentStyle || window.getComputedStyle(imgElement, 'false');
                            const selectedImage = style.backgroundImage.slice(4, -1).replace(/"/g, "");
                            resolve({ url: selectedImage, context: selectedImage });
                        }
                    });
                }
            }
        },
        //#region Methods
        onSave: async (jsonFile: any, htmlFile: any) => {
            SaveCampaign({
                campaignId: CampaignId,
                JsonData: jsonFile,
                HtmlData: htmlFile
            });
        },
        onSend: () => {
            SetDialog(DialogType.TEST_SEND);
        },
        onAutoSave: () => {
            //saveDesign(false, null, false);
        },
        onChange: () => {
            // saveRef.current = { redirectAfterSave: false, redirectUrl: null, showAnimation: false };
            // editorRef.current.save();
        },
        onWarning: (alertMessage: any) => {
            console.log('onWarning ', alertMessage)
        },
        onError: (errorMessage: any) => {
            console.log('onError ', errorMessage)
        },
        onLoad: (jsonFile: any) => {
            console.log(jsonFile);
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