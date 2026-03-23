import { v4 as uuidv4 } from 'uuid';
import { FONTS } from '../../../helpers/Fonts/Init';
import { BEE_EDITOR_TYPES, reCAPTCHAKey } from '../../../helpers/Constants';
import { isProdMode } from '../../../config';
type dialog = (a: any) => void;
type save = (a: any) => void;

export interface ConfigOptions {
  moduleType: string;
  classes: any;
  onSaveUserBlock: Function;
  IsRTL: Boolean;
  openModal: any;
  // SetDialog: dialog;
  EditRow: Function;
  Save: save;
  AutoSave: Function,
  DesignChange: Function,
  DeleteBlock: Function;
  Id: Number;
  PulseemEditBlock: Function;
  getRows: Function;
  handleDeleteRow: Function;
  handleEditRow: Function;
  t: any;
  form: any;
  onFormAdded: Function;
  BasedOnRTL: any;
  languageCode: any;
  recaptchaConfig?: {
    enabled: boolean;
    siteKey: string;
  };
}
export const BeeConfig = (Options: ConfigOptions) => {
  const {
    moduleType,
    classes,
    onSaveUserBlock,
    IsRTL,
    EditRow,
    openModal,
    // SetDialog,
    Id,
    DeleteBlock,
    Save,
    AutoSave,
    DesignChange,
    getRows,
    handleEditRow,
    // HandleAutoSave,
    handleDeleteRow,
    PulseemEditBlock,
    t,
    form,
    onFormAdded,
    BasedOnRTL,
    languageCode,
    recaptchaConfig
  } = Options;

  const layout = [];
  Object.keys(form).forEach((key, index) => {
    layout.push([`${key}`]);
  });
  layout.push(['optIn']);
  layout.push(['submit']);

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

  const submitAttributes: any = {
    value: BasedOnRTL ? 'שלח' : 'Submit',
    name: "submit_button",
    "data-action": "submit",
    "data-submit": 'true'
  };

  if (recaptchaConfig?.enabled) {
    submitAttributes.class = "g-recaptcha";
    submitAttributes["data-sitekey"] = recaptchaConfig.siteKey;
    submitAttributes["data-callback"] = "onSubmit";
  }


  return {
    uid: 'e945eb6b-249c-4dea-bee1-e4b98b8719cc', //needed for identify resources of the that user and billing stuff
    container: 'page-bee-plugin-container', //Identifies the id of div element that contains BEE Plugin
    language: editorLanguage[languageCode], //IsRTL ? 'he-IL' : 'en-US',
    customCss: 'https://www.pulseem.co.il/Pulseem/Css/beefreeRtlFixes.css',
    trackChanges: true,
    //autosave: AUTO_SAVE_SECONDS,
    loadingSpinnerDisableOnSave: true,
    sidebarPosition: IsRTL ? 'right' : 'left',
    loadingSpinnerTheme: 'light',
    saveRows: true,
    rowsConfiguration: {
      emptyRows: true,
      defaultRows: false,
    },
    editorFonts: FONTS(true),
    workspace: {
      type: 'default', // 'mixed'|'amp_only'|'html_only'
    },
    defaultForm: {
      structure: {
        title: BasedOnRTL ? 'כותרת הטופס' : 'Form Title',
        description: BasedOnRTL ? "טופס הרשמה" : 'Registeration Form',
        fields: {
          ...form,
          optIn: {
            type: 'checkbox', label: BasedOnRTL ? 'אני מאשר/ת קבלת דיוור' : 'I agree to receiving marketing content',
            canBeRemovedFromLayout: true,
            attributes: { dir: BasedOnRTL ? 'right' : 'left' }
          },
          submit: {
            type: 'submit',
            label: '',
            canBeRemovedFromLayout: false,
            attributes: submitAttributes
          },
        },
        layout: layout,
        attributes: {
          "accept-charset": "UTF-8",
          // action: "https://stage.l-p.site/submithandler.axd",
          action: isProdMode ? "https://l-p.site/submithandler.axd" : "https://stage.l-p.site/submithandler.axd",
          autocomplete: "on",
          enctype: "multipart/form-data",
          method: "post",
          novalidate: false,
          target: "_self",
          dir: BasedOnRTL ? 'rtl' : 'ltr'
        },
      }
    },
    defaultModulesOrder: [
      'Form',
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
      if (jsonFile) onSaveUserBlock(jsonFile, JSON.parse(jsonFile));
    },
    contentDialog: {
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
      // manageForm: {
      //   label: 'Edit form',
      //   handler: async (resolve: any, reject: any, args: any) => {
      //     //   const structure = await onHandleManageForm(args)
      //     //   structure ? resolve(structure) : reject()
      //     reject()
      //   }
      // },
    },
    //#region Methods
    onSave: async (jsonFile: any, htmlFile: any, ampHtml: any) => {
      await Save({
        campaignId: Id,
        JsonData: jsonFile,
        HtmlData: ampHtml ?? htmlFile
      });
    },
    onSend: () => {
      // SetDialog(DialogType.TEST_SEND);
    },
    onWarning: (alertMessage: any) => {
      // console.log('onWarning ', alertMessage)
    },
    onError: (errorMessage: any) => {
      // console.log('onError ', errorMessage)
    },
    onLoad: (jsonFile: any) => {
      // console.log(jsonFile);
    },
    onAutoSave: () => moduleType === BEE_EDITOR_TYPES.CAMPAIGN ? AutoSave() : {},
    onChange: (jsonFile: any, response: any) => {
      // https://docs.beefree.io/beefree-sdk/tracking-message-changes#content-codes - Codes
      // Every code should get "00" in the end
      switch (response.code) {
        case '0780': {
          return;
        }
        case "0900": {
          const formsCount = getFormsCount(jsonFile);
          onFormAdded(formsCount);
          break;
        }
        default: {
          DesignChange();
        }
      }
    }
    //#endregion
  };
};

const getFormsCount = (obj: any) => {
  let formsCount: number = 0;
  const json = JSON.parse(obj);
  json?.page?.rows?.forEach((row: any, idx: any) => {
    row?.columns.forEach((col: any, index: any) => {
      col?.modules?.forEach((module: any, index: any) => {
        if (module?.descriptor.form && module?.descriptor.form !== null && module?.descriptor.form !== undefined) {
          formsCount++;
          if (formsCount > 0) {
            return false;
          }
        }
      });
    })
  });

  return formsCount;
}
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
      titleDefaultConfig: {
        bold: true,
      },
      title: {
        html: languageCode === 0
          ? "<h1>אני כותרת מוכנה לתוכן שלך</h1>"
          : "<h1>I&apos;m a new title block</h1>",
        styles: {
          textAlign: isRTLdirection ? "right" : "left",
          direction: isRTLdirection ? "rtl" : "ltr",
        },
        blockOptions: {
          align: isRTLdirection ? "right" : "left",
        },
        defaultHeadingLevel: 'h1',
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
      form: {
        labelsOptions: {
          align: isRTLdirection ? "right" : "left"
        },
        fieldsOptions: {
          align: isRTLdirection ? "right" : "left"
        },
        buttonsOptions: {
          align: isRTLdirection ? "right" : "left"
        },
        blockOptions: {
          align: isRTLdirection ? "right" : "left"
        }
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
  DELETE: "delete",
  MISSING_API_KEY: "common.missingApi",
  CAMPAIGN_NOT_FOUND: "landingPages.landingPageNotFound",
  ERROR_OCCURED: "common.ErrorOccured",
  GENERIC: "generic",
  NO_CREDITS_LEFT: "sms.noCredits",
  Templates: "templates",
  SAVE_TEMPLATE: "saveTemplate",
  LOGOUT: "logout",
  EXIT: "exit",
  RENDER_TEMPLATE_CONFIRMATION: "RenderTemplateConfirmation",
  EDIT_ROW: "EditRow",
  TEMPLAGE_EXISTS: "templateExists"
};