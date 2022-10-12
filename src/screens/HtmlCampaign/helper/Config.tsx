type showGallery = (a: Boolean) => void;
type fileSelected = (a: Boolean) => void;
type dialog = (a: any) => void;
type save = (a: any) => void;


export const BeeConfig = (
    saveRef: any,
    editorRef: any,
    isRTL: Boolean,
    setDialog: dialog,
    campaignId: Number,
    saveCampaign: save,
    setShowGallery: showGallery,
    setIsFileSelected: fileSelected,
    t: any
) => {
    return {
        uid: 'f7768f7b-06af-4ada-bbd3-18a237524c31', //needed for identify resources of the that user and billing stuff
        container: 'bee-plugin-container', //Identifies the id of div element that contains BEE Plugin
        language: isRTL ? 'he-IL' : 'en-US',
        trackChanges: true,
        autosave: 60,
        customCss: 'https://unlayer.reactstage.club/Content/BeeFree/custom-bee.css',
        translationsUrl: `https://unlayer.reactstage.club/Content/BeeFree/${isRTL ? 'he.json' : 'en.json'}`,
        sidebarPosition: isRTL ? 'right' : 'left',
        loadingSpinnerTheme: 'light',
        contentDialog: {
            filePicker: (resolve: Function, reject: Function, args: any) => {
                setShowGallery(true);
                setIsFileSelected(false);
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
            saveCampaign({
                campaignId: campaignId,
                JsonData: jsonFile,
                HtmlData: htmlFile
            });
        },
        onSend: () => {
            setDialog(DialogType.TEST_SEND);
        },
        onAutoSave: () => {
            //saveDesign(false, null, false);
        },
        onChange: () => {
            saveRef.current = { redirectAfterSave: false, redirectUrl: null, showAnimation: false };
            editorRef.current.save();
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
    NO_CREDITS_LEFT: "sms.noCredits"
};