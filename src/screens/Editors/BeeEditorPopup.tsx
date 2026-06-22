import clsx from 'clsx';
import { debounce, includes } from 'lodash';
import BeePlugin from '@mailupinc/bee-plugin'
import { Box, Button, Divider, Grid, Menu, MenuItem, TextField, Typography } from '@material-ui/core'
import { useRef, useState, useEffect } from 'react'
import DefaultScreen from '../DefaultScreen'
import { useSelector, useDispatch } from 'react-redux';
import { Loader } from '../../components/Loader/Loader';
import { useTranslation } from "react-i18next";
import ResponseModal from './modals/ResponseModal'
import Toast from '../../components/Toast/Toast.component';
import { getAuthorizedEmails, getCommonFeatures, isAlive } from '../../redux/reducers/commonSlice';
import WizardActions from '../../components/Wizard/WizardActions';
import { getById, deleteLPUserBlock, deleteLandingPage, getAllLPTemplatesBySubaccountId, getLPPublicTemplates, getLPTemplateById, getLPUserblocks, saveLPTemplateToAccount, saveLPUserBlock, saveWebform, publish, setWebformGroups } from '../../redux/reducers/PopupSlice';
import { getPopupSteps, addPopupStep, deletePopupStep, savePopupStepContent, PopupStep } from '../../redux/reducers/popUpManagementSlice';
import { initClientForm, initExtraDataField, initLandingPages } from './helper/MigratePulseemData';
import { DialogType, DefaultContent, BeeConfig } from './helper/configPopup';
import { IoMdImages } from 'react-icons/io';
import Gallery from '../../components/Gallery/Gallery.component';
import { PulseemFeatures, PulseemFolderType } from "../../model/PulseemFields/Fields";
import { getFileGallery } from '../../redux/reducers/gallerySlice';
import { BiSave } from 'react-icons/bi'
// User input controls
import { EditRow } from './components/ContentDialogs'
// Generic modal component with event hooks
import useModals from './hooks/useModals'
import useMockAPI from './hooks/useMockAPI';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
/* END Bee */
import { loginURL, sitePrefix } from '../../config';
import { MdArrowBackIos, MdArrowForwardIos, MdCheck, MdGroups, MdOutlinePublic, MdAdd, MdKeyboardArrowDown, MdMoreVert, MdDelete } from 'react-icons/md';
import { BaseDialog } from '../../components/DialogTemplates/BaseDialog';
import { BEE_EDITOR_TYPES } from '../../helpers/Constants';
import { RenderHtml } from '../../helpers/Utils/HtmlUtils';
import { getActiveFieldKeysFromJson, checkFormContactRequirement } from '../../helpers/Utils/formContactValidation';
import { StateType } from '../../Models/StateTypes';
import { commonProps } from '../../model/Common/commonProps.types';
import { BeeEditorModel, BeeEditorStoreModel, LandingPageRow, LandingPageTemplate, LandingPageUserBlocks, SaveLandingPageArguments } from '../../Models/LandingPage/LandingPage';
import { SMSStoreProps } from '../../model/Sms/Sms.types';
import { FileGallery } from '../../Models/Files/FileGallery';
import { DemoModal } from '../HtmlCampaign/components/DemoModal';
import { ClientForm } from '../../Models/BeeModels/BeeModel';
import { getAccountExtraData, getPreviousLandingData, getTestGroups } from '../../redux/reducers/smsSlice';
import GroupSelectorPopUp from '../Groups/GroupSelectorPopUp';
import LPTemplates from './modals/Templates';
import { GenericModal } from '../HtmlCampaign/components/GenericModal';
import SaveTemplate from '../HtmlCampaign/modals/SaveTemplate';
import { getLPBeeToken } from '../../redux/reducers/landingPagesSlice';
import TierPlans from '../../components/TierPlans/TierPlans';
import { findPlanByFeatureCode } from '../../redux/reducers/TiersSlice';
import { TierFeatures } from '../../helpers/Constants';

interface BeeEditorPopupProps extends BeeEditorModel {
  clientId?: string;
  clientSecret?: string;
  isPopupBuilder?: boolean;
}


const BeeEditorPopup = ({ classes, clientId: propClientId, clientSecret: propClientSecret, isPopupBuilder: propIsPopupBuilder }: BeeEditorPopupProps) => {
  //#region State
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();
  const editorRef = useRef(null);
  const saveRef = useRef(null);
  const moduleId = params?.id || 0;
  const moduleType = params?.type;

  const { extraData, previousLandingData } = useSelector((state: { sms: SMSStoreProps }) => state.sms);
  const { language, isRTL, userRoles } = useSelector((state: StateType) => state.core);
  const { tokenAlive, accountSettings, accountFeatures } = useSelector((state: { common: commonProps }) => state.common);
  const { currentPlan, availablePlans } = useSelector((state: any) => state.tiers);
  const { landingPage, landingPageUserBlocks, ToastMessages, LPBeeToken, publicTemplates, templatesBySubAccount } = useSelector((state: { landingPages: BeeEditorStoreModel }) => state.landingPages)
  // const { BeeToken } = useSelector((state: { popup: any }) => state.popup)
  const [showLoader, setLoader] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [dialogType, setDialogType] = useState<{
    type: string;
    data?: any;
  } | null>(null);
  const [mergeData, setPulseemMergeData] = useState({});
  const [dialog, setDialog] = useState<any>(null);
  const [summaryData, setSummaryData] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [isResponseModal, setIsResponseModal] = useState(false);
  const [alertLogout, setAlertLogout] = useState(false);
  const [genericModalData, setGenericModalData] = useState<any>({
    title: "",
    message: ""
  })
  const { modals, openModal } = useModals()
  const { setRow, getRows, handleDeleteRow, handleEditRow } = useMockAPI();
  const [showGallery, setShowGallery] = useState(false);
  const [showDocs, setShowDocuments] = useState(false);
  const queryParams = new URLSearchParams(window.location.search)
  const isFromAutomation = queryParams.get("FromAutomation");
  const baseLanguageParam = queryParams.get("baseLanguage");
  const NodeToEdit = queryParams.get("NodeToEdit");
  const fromLink = queryParams.get("fromLink");
  const [lastSaveText, setLastSaveText] = useState<string | null>(null);
  const [silentSave, setSilentSave] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [newTemplate, setNewTemplate] = useState('');
  const [saveTemplateDetails, setSaveTemplateDetails] = useState({
    templateName: '',
    categoryName: '',
  });
  const [errors, setErrors] = useState({
    templateName: '',
    categoryName: '',
  });

  const [clientForm, setClientForm] = useState<ClientForm>({});
  const [reInit, setReinit] = useState<boolean>(false);
  const [showGroupSelection, setShowGroupSelection] = useState<boolean>(false);
  const [selectedGroups, setSelectedGroups] = useState<any>([]);
  
  // Popup Builder specific state
  const [clientId, setClientId] = useState<string>(propClientId || ''); // Use props or environment
  const [clientSecret, setClientSecret] = useState<string>(propClientSecret || ''); // Use props or environment
  const [isPopupBuilder, setIsPopupBuilder] = useState<boolean>(propIsPopupBuilder || false);
  // Draft credentials for dialog (avoid hooks inside non-component functions)
  const [popupDraftClientId, setPopupDraftClientId] = useState<string>(propClientId || '');
  const [popupDraftClientSecret, setPopupDraftClientSecret] = useState<string>(propClientSecret || '');
  // Multi-step state
  const stepParam = parseInt(new URLSearchParams(window.location.search).get("step") || "1");
  const [currentStep, setCurrentStep] = useState<number>(stepParam);
  const [steps, setSteps] = useState<number[]>([1]);
  const [showDeleteStepConfirm, setShowDeleteStepConfirm] = useState<number | null>(null);
  const [showContactFieldWarning, setShowContactFieldWarning] = useState<boolean>(false);
  const stepDataRef = useRef<PopupStep[]>([]);
  const currentStepRef = useRef<number>(stepParam);
  const isSwitchingStep = useRef(false);
  const prevPulseemLinksRef = useRef<Set<string>>(new Set());
  const [stepOptionsAnchor, setStepOptionsAnchor] = useState<null | HTMLElement>(null);
  const [optionsForStep, setOptionsForStep] = useState<number>(0);
  const [showAddStepOptions, setShowAddStepOptions] = useState(false);
  const [showTierPlans, setShowTierPlans] = useState(false);
  const [tierMessageCode, setTierMessageCode] = useState('');
  //#endregion State

  const getLanguageCodeFromBaseLanguage = (baseLanguage: number): string => {
    const languageMap: { [key: number]: string } = {
      0: 'he-IL',  // Hebrew
      1: 'en-US',  // English
      2: 'fr-FR',  // French
      3: 'es-ES',  // Spanish
      4: 'de-DE',  // German
      5: 'ru-RU',  // Russian
      14: 'pl-PL', // Polish
    };
    return languageMap[baseLanguage] || 'en-US';
  };
  const editorLanguage = baseLanguageParam
    ? getLanguageCodeFromBaseLanguage(parseInt(baseLanguageParam))
    : getLanguageCodeFromBaseLanguage(landingPage?.Data?.WebForm?.BaseLanguage || 1);


  //#region Get Extra fields & Landing pages, after Data Ready
  const loadAccountExtraData = () => {
    return new Promise(async (resolve: any) => {
      const res: any = await dispatch(getAccountExtraData());
      const entries = res?.payload;
      const cleanedObject = Object.entries(entries).filter(([key, value]) => value !== null)

      if (cleanedObject) {
        interface FlatObject {
          [key: string]: string; // This allows any string key with a string value
        }
        const flatObject: FlatObject = cleanedObject.reduce((acc: any, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {} as FlatObject); // Type assertion to specify the initial value

        resolve(flatObject);
      }
      else {
        resolve(res?.payload);
      }
    });
  }
  const initFields = () => {
    loadAccountExtraData().then((ed: any) => {
      initExtraDataField(extraData, t).then((exData) => {
        setPulseemMergeData(exData);
        initClientForm(ed, t, landingPage?.Data?.WebForm?.BaseLanguage).then((res) => {
          setClientForm(res);
        })
      })
    });
  }
  const initSpecialLinks = () => {
    return new Promise((resolve, reject) => {
      try {
        initLandingPages(previousLandingData, t).then((items) => {
          //@ts-ignore
          dispatch(getFileGallery(PulseemFolderType.DOCUMENT)).then((response) => {
            const gallery = response.payload;
            const specialLinksFiles = items;

            if (isPopupBuilder) {
              specialLinksFiles.push(
                { type: 'Popup Navigation', label: 'Next Step',     link: 'pulseem://next-step' },
                { type: 'Popup Navigation', label: 'Previous Step', link: 'pulseem://prev-step' },
                { type: 'Popup Navigation', label: 'Skip Step',     link: 'pulseem://skip-step' }
              );
            }

            const folderExtName = t('common.files');
            gallery?.Files?.forEach((file: FileGallery) => {
              let folderName = file.FolderName === 'main' ? t('common.main') : file.FolderName;
              if (file.FolderName.indexOf('\\') > -1) {
                folderName = file.FolderName.split('\\')[1]
              }
              specialLinksFiles.push({
                type: `${folderExtName} ${folderName}`,
                label: file.FileName,
                link: file.FileURL
              })
            });
            resolve(specialLinksFiles);
          });
        });
      }
      catch (e) {
        console.error(e);
        reject();
      }
    })
  }
  useEffect(() => {
    if (dataReady) {
      if (stepParam > 1 && (currentPlan?.Id || 0) < 3) {
        const url = new URL(window.location.href);
        url.searchParams.set('step', '1');
        window.history.replaceState({}, '', url.toString());
        currentStepRef.current = 1;
        setCurrentStep(1);
      }
      Promise.all([initFields()]).then(() => {
        return true;
      })
    }
  }, [dataReady]);

  //#endregion
  useEffect(() => {
    if (editorRef && editorRef.current) {
      initLPBeeEditor();
    }
  }, [isRTL]);

  useEffect(() => {
    if (Number(moduleId) > 0 && reInit === true) {
      window.location.reload();
    }
  }, [reInit]);

  useEffect(() => {
    getData();
    //@ts-ignore
    if (!publicTemplates.length) dispatch(getLPPublicTemplates({
      isRTL,
      isPopup: true
    }, true));
    //@ts-ignore
    if (!templatesBySubAccount.length) dispatch(getAllLPTemplatesBySubaccountId(true));
  }, []);

  //@ts-ignore
  useEffect(() => {
    if (landingPageUserBlocks) {
      return new Promise((resolve: any) => {
        landingPageUserBlocks.forEach((block: LandingPageUserBlocks) => setRow(block.data));
        resolve();
      });
    }
    else {
      initOptions();
    }
  }, [language, landingPageUserBlocks]);
  //#region Check session token -> tokenAlive
  useEffect(() => {
    if (landingPage && landingPage?.Data?.WebForm?.SelectedGroupList.length > 0) {
      const groups: [] = landingPage?.Data?.WebForm?.SelectedGroupList?.map((gid: any) => parseInt(gid));
      setSelectedGroups(groups);
      saveRef.current = {
        //@ts-ignore
        ...saveRef.current,
        showGroupPopup: landingPage?.Data?.WebForm?.HtmlData?.indexOf('submithandler.axd') > -1 && groups?.length <= 0,
        groups: groups
      }
    }
  }, [landingPage]);
  useEffect(() => {
    setInterval(() => {
      if (tokenAlive) {
        dispatch(isAlive());
      }
    }, 300000);
    try {
      //@ts-ignore
      document.removeEventListener('setAlert', null);
    }
    catch (e) {
      console.error(e);
    }
    if (alertLogout === true) {
      onLogoutAlert();
    }
  }, [alertLogout]);
  document.addEventListener('setAlert', () => {
    setAlertLogout(true);
  });
  const navigateToLandingPageManagement = () => {
    // navigate(`${sitePrefix}EditRegistrationPage`);
    return false;
  }
  const onLogoutAlert = () => {
    setIsResponseModal(false);
    setLoader(false);
    setDialogType({ type: DialogType.LOGOUT })
  }
  //#endregion 
  const getData = async (defaultShowLoader: boolean = true) => {
    setLoader(defaultShowLoader);
    //@ts-ignore
    await dispatch(getById(params.id))
    // await dispatch(getAccountExtraData());
    // await dispatch(getPreviousLandingData());
    await dispatch(getTestGroups());
    await dispatch(getLPUserblocks());
    await dispatch(getAuthorizedEmails());
    if (Number(moduleId) > 0) {
      //@ts-ignore
      const stepsResult = await dispatch(getPopupSteps(Number(moduleId))) as any;
      const stepsData: PopupStep[] = stepsResult?.payload?.Data || [];
      stepDataRef.current = stepsData;
      setSteps(stepsData.length > 0 ? stepsData.map((s: PopupStep) => s.StepNumber) : [1]);
    }
    setDataReady(true);
    const initBeeToken = async () => {
      await dispatch(getLPBeeToken());
    }
    initBeeToken();
  }
  //#region Init Bee Token & Configuration
  const initTags = () => {
    //@ts-ignore
    let tempTags = [...new Set(landingPageUserBlocks?.map(item => item.tags))];
    var tags: string[] = [].concat.apply([], tempTags);
    if (tags && tags?.length > 0) {
      //@ts-ignore
      config.rowsConfiguration.externalContentURLs = [];
      let tempRows: LandingPageRow[] = [];
      tags?.forEach((tag: string) => {
        if (tag && tag !== undefined && tag !== null) {
          const tagObj = {
            name: tag.trim(),
            value: tag.replace(' ', ''),
            handle: tag.replace(' ', ''),
            isLocal: true,
            behaviors: {
              canEdit: true,
              canDelete: userRoles?.AllowDelete,
            },
          };
          tempRows.push(tagObj);
        }
      });
      tempRows = tempRows.filter((value: LandingPageRow, index: number) => {
        const _value = JSON.stringify(value);
        return index === tempRows.findIndex((obj: LandingPageRow) => {
          return JSON.stringify(obj) === _value;
        });
      });
      //@ts-ignore
      config.rowsConfiguration.externalContentURLs = tempRows;
    }
  }
  const initPopupBuilder = async (templateId: number | null = null) => {
    let shouldReSave: boolean = false;
    initSpecialLinks().then(async (specialLinksFiles) => {
      const webform = landingPage?.Data?.WebForm;
      const isRtlLang = webform?.BaseLanguage === 0 || webform?.BaseLanguage === 8 ? true : false;
      let forceTemplate = null;
      let defaultContent = {
        defaultTemplate: ''
      };
      
      if (templateId !== null) {
        //@ts-ignore
        const templateResponse = await dispatch(getLPTemplateById(templateId)) as any;

        if (templateResponse?.payload?.StatusCode === 201) {
          const responseData = templateResponse?.payload?.Data;
          setNewTemplate(responseData)
          forceTemplate = responseData?.JsonData ? JSON.parse(responseData?.JsonData) : defaultContent?.defaultTemplate;
          shouldReSave = true;
        } else {
          // @ts-ignore
          setToastMessage({ severity: 'error', color: 'error', message: templateResponse?.payload.Message, showAnimtionCheck: false });
        }
      }

      // // Get popup configuration
      // const popupConfig = getPopupConfig();
      // popupConfig.uid = accountSettings?.SubAccountSettings?.BeeUniqueID;
      // popupConfig.mergeTags = mergeData;
      // popupConfig.specialLinks = specialLinksFiles;
      // popupConfig.titleDefaultStyles = defaultContent.titleDefaultStyles;
      // popupConfig.contentDefaults = defaultContent.contentDefaults;

      // initTags();
      
      // // Initialize popup builder with Client ID and Client Secret
      // if (clientId && clientSecret) {
      //   try {
      //     const beeTest = new BeePlugin();
          
      //     // Get token using Client ID and Client Secret
      //     const tokenResponse = await beeTest.getToken(clientId, clientSecret);
          
      //     if (tokenResponse) {
      //       const template = forceTemplate !== null ? forceTemplate : webform?.JsonData ? JSON.parse(webform?.JsonData) : defaultContent.defaultTemplate;

      //       //@ts-ignore
      //       beeTest.start(popupConfig, template).then((instance) => {
      //         //@ts-ignore
      //         editorRef.current = instance;
      //         //@ts-ignore
      //         if ((!landingPage || !landingPage.HtmlData) && (!params?.id || params?.id === 0)) {
      //           saveDesign(false, null, false);
      //         }
      //         setTimeout(() => {
      //           setButtonDisabled(false);
      //         }, 2000);
      //       });
      //     } else {
      //       setDialogType({
      //         type: DialogType.GENERIC,
      //         data: t('popupBuilder.authenticationFailed')
      //       });
      //     }
      //   } catch (error) {
      //     console.error('Popup builder initialization error:', error);
      //     setDialogType({
      //       type: DialogType.GENERIC,
      //       data: t('popupBuilder.initializationError')
      //     });
      //   }
      // } else {
      //   setDialogType({
      //     type: DialogType.GENERIC,
      //     data: t('popupBuilder.missingCredentials')
      //   });
      // }
      
      setLoader(false);

      if (shouldReSave === true) {
        setTimeout(() => {
          onAutoSavePage(false);
        }, 3000);
      }
    })
  }

  const initLPBeeEditor = (templateId: number | null = null) => {
    let shouldReSave: boolean = false;
    initSpecialLinks().then(async (specialLinksFiles) => {
      const webform = landingPage?.Data?.WebForm;
      const isRtlLang = webform?.BaseLanguage === 0 || webform?.BaseLanguage === 8 ? true : false;
      let forceTemplate = null;
      let defaultContent = DefaultContent(isRtlLang, webform?.BaseLanguage);
      if (templateId !== null) {
        //@ts-ignore
        const templateResponse = await dispatch(getLPTemplateById(templateId)) as any;

        if (templateResponse?.payload?.StatusCode === 201) {
          const responseData = templateResponse?.payload?.Data;
          setNewTemplate(responseData)
          forceTemplate = responseData?.JsonData ? JSON.parse(responseData?.JsonData) : defaultContent.defaultTemplate;
          shouldReSave = true;
        } else {
          // @ts-ignore
          setToastMessage({ severity: 'error', color: 'error', message: templateResponse?.payload.Message, showAnimtionCheck: false });
        }
      }
      config.uid = accountSettings?.SubAccountSettings?.BeeUniqueID;
      config.mergeTags = mergeData;
      config.specialLinks = specialLinksFiles;

      if (isPopupBuilder && !(config as any).__pulseemNavWrapped) {
        (config as any).__pulseemNavWrapped = true;
        const _prevOnChange = config.onChange;

        // Seed the ref with whatever pulseem links already exist in the current template
        // so loading a step that already has navigation links does NOT trigger the dialog.
        const initialJson = typeof webform?.JsonData === 'string' ? webform.JsonData : '';
        prevPulseemLinksRef.current = new Set(
          (initialJson.match(/pulseem:\/\/[^"'\s]*/g) || [])
        );

        config.onChange = (jsonFile: any, response: any) => {
          if ((currentPlan?.Id || 0) < 3 && typeof jsonFile === 'string') {
            const currentLinks = new Set<string>(
              (jsonFile.match(/pulseem:\/\/[^"'\s]*/g) || [])
            );
            // Show dialog if ANY link in the current snapshot is new (not in the previous snapshot).
            // This fires on first add AND on every subsequent change (next→prev, etc.).
            const hasNewLink = Array.from(currentLinks).some(
              link => !prevPulseemLinksRef.current.has(link)
            );
            if (hasNewLink) {
              setTierMessageCode('POPUP_STEPS');
              setDialogType({ type: 'tier' });
              (editorRef.current as any)?.load(JSON.parse(jsonFile.replace(/pulseem:\/\/[^"'\s]*/g, '')));
            }
            prevPulseemLinksRef.current = currentLinks;
          }
          _prevOnChange?.(jsonFile, response);
        };
      } else if (isPopupBuilder) {
        // On step switch: re-seed the ref so existing links on the new step don't false-positive
        const initialJson = typeof webform?.JsonData === 'string' ? webform.JsonData : '';
        prevPulseemLinksRef.current = new Set(
          (initialJson.match(/pulseem:\/\/[^"'\s]*/g) || [])
        );
      }

      config.titleDefaultStyles = defaultContent.titleDefaultStyles;
      config.contentDefaults = defaultContent.contentDefaults;
      config.language = editorLanguage;

      if (accountFeatures?.indexOf(PulseemFeatures.BEE_AMP) > -1) {
        config.workspace.type = 'mixed';
      }

      initTags();
      switch (LPBeeToken?.StatusCode) {
        case 201: {
          if (LPBeeToken.Message === "null" || LPBeeToken.Message === null) {
            setDialogType({
              type: DialogType.GENERIC,
              data: t(DialogType.MISSING_API_KEY)
            });
          }
          else {
            const beeTest = new BeePlugin(JSON.parse(LPBeeToken.Message));
            const currentStepData = stepDataRef.current.find((s: PopupStep) => s.StepNumber === currentStep);
            const stepJson = currentStepData?.JsonData ?? null;
            const template = forceTemplate !== null
              ? forceTemplate
              : stepJson
                ? JSON.parse(stepJson)
                : currentStep === 1 && webform?.JsonData
                  ? JSON.parse(webform?.JsonData)
                  : defaultContent.defaultTemplate;

            //@ts-ignore
            beeTest.start(config, template).then((instance) => {
              //@ts-ignore
              editorRef.current = instance;
              //@ts-ignore
              if ((!landingPage || !landingPage.HtmlData) && (!params?.id || params?.id === 0)) {
                saveDesign(false, null, false);
              }
              setTimeout(() => {
                setButtonDisabled(false);
              }, 2000);
            });
          }
          break;
        }
        case 401: {
          setDialogType({
            type: DialogType.GENERIC,
            data: t(DialogType.MISSING_API_KEY)
          });
          break;
        }
        case 404: {
          setDialogType({
            type: DialogType.GENERIC,
            data: t(DialogType.CAMPAIGN_NOT_FOUND)
          });
          break;
        }
        case 500:
        default: {
          setDialogType({
            type: DialogType.GENERIC,
            data: t(DialogType.ERROR_OCCURED)
          });
          break;
        }
      }
      setLoader(false);

      if (shouldReSave === true) {
        setTimeout(() => {
          onAutoSavePage(false);
        }, 3000);
      }
    })
  }
  useEffect(() => {
    if (LPBeeToken) {
      // Check if this is a popup builder instance
      initLPBeeEditor();
    }
  }, [LPBeeToken, isPopupBuilder]);
  const initOptions = async () => {
    initTags();
    //@ts-ignore
    if (!accountSettings || accountSettings.SubAccountSettings) {
      await dispatch(getCommonFeatures());
    }
    if (editorRef.current) {
      const c = getConfig();
      //@ts-ignore
      editorRef.current.loadConfig(c);
      //@ts-ignore
      editorRef.current.load();
    }
  }
  //#endregion Init Bee Token & Configuration

  //#region Pulseem Methods (Save, Delete, Exit, Back, Test Send)
  const onSave = async (args: SaveLandingPageArguments) => {
    // Discard saves fired by BeePlugin during load() on a step switch —
    // the previous step's content was already persisted before switchToStep ran.
    if (isSwitchingStep.current) {
      isSwitchingStep.current = false;
      return;
    }
    // Capture the target step once so that if switchToStep() is called later
    // in this same callback (changing the ref), the step number stays consistent.
    const savedForStep = currentStepRef.current;

    // Duplicate-field guard using the actual current editor JSON (args.JsonData),
    // which is more accurate than stepDataRef for the current step.
    if (stepDataRef.current.length > 1) {
      const _webform = landingPage?.Data?.WebForm;
      const currentActiveFields = getActiveFieldKeysFromJson(args.JsonData);
      const otherStepsFields = new Set<string>();
      stepDataRef.current.forEach((step) => {
        if (step.StepNumber === savedForStep) return;
        const json = step.StepNumber === 1
          ? (step.JsonData ?? _webform?.JsonData)
          : step.JsonData;
        getActiveFieldKeysFromJson(json).forEach(k => otherStepsFields.add(k));
      });
      const duplicates = Array.from(currentActiveFields).filter(k => otherStepsFields.has(k));
      if (duplicates.length > 0) {
        if (!(saveRef.current as any)?.isAutoSave) {
            // @ts-ignore
          setToastMessage({ severity: 'error', color: 'error', message: t('Popup.duplicateFieldAcrossSteps', { fields: duplicates.join(', ') }), showAnimtionCheck: false } as any);
        }
        return;
      }
    }

    // Contact-field guard — opt-in only. Explicit Save / Continue clicks set
    // saveRef.current.contactFieldCheckMode via saveDesign(). The flag is
    // consumed (read once, then cleared) here so it can never leak into later
    // internal saves (step switch, duplicate step, auto-save, re-init) that
    // mutate saveRef.current directly without going through saveDesign().
    //   'warn'  → show the dialog but let the save proceed (Save button)
    //   'block' → show the dialog and stop the save (Continue button)
    const _contactFieldCheckMode = (saveRef.current as any)?.contactFieldCheckMode as ('warn' | 'block' | undefined);
    if (_contactFieldCheckMode) {
      // @ts-ignore
      saveRef.current = { ...(saveRef.current as any), contactFieldCheckMode: undefined };

      const _webform = landingPage?.Data?.WebForm;
      const jsonsToCheck: (string | null | undefined)[] =
        stepDataRef.current.length > 0
          ? stepDataRef.current.map((s: PopupStep) => {
              if (s.StepNumber === savedForStep) return args.JsonData;
              return s.StepNumber === 1 ? (s.JsonData ?? _webform?.JsonData) : s.JsonData;
            })
          : [args.JsonData];

      const { hasForm, hasContactField } = checkFormContactRequirement(jsonsToCheck);
      if (hasForm && !hasContactField) {
        setShowContactFieldWarning(true);
        if (_contactFieldCheckMode === 'block') {
          return;
        }
        // 'warn' mode: fall through — the save below still proceeds normally.
      }
    }

    //@ts-ignore
    const reInit = saveRef.current?.reInitEditor;
    try {
      //@ts-ignore
      if (saveRef.current?.showAnimation) setLoader(true);
      let finalHtml = args.HtmlData;
      let finalJson = args.JsonData;

      if (!finalHtml.includes('id="popup-form-fix"')) {
        const cssInjection = `
        <style id="popup-form-fix">
          .bee-form .bee-form-row.bee-form-row-multicolumn {
            display: flex !important;
            flex-wrap: wrap !important;
          }
        </style>
      `;

        if (finalHtml.includes('</head>')) {
          finalHtml = finalHtml.replace('</head>', `${cssInjection}</head>`);
        } else if (finalHtml.includes('<body')) {
          finalHtml = finalHtml.replace(/<body([^>]*)>/, `<body$1>${cssInjection}`);
        } else {
          finalHtml = finalHtml.replace(/(<html[^>]*>)/i, `$1${cssInjection}`);
        }
      }

      // Always persist step content to the steps table
      //@ts-ignore
      await dispatch(savePopupStepContent({
        webFormId: Number(args.campaignId),
        stepNumber: savedForStep,
        htmlContent: finalHtml,
        jsonData: finalJson,
      }));
      // Keep stepDataRef in sync so switchToStep can load the latest saved content
      stepDataRef.current = stepDataRef.current.map(s =>
        s.StepNumber === savedForStep ? { ...s, HtmlContent: finalHtml, JsonData: finalJson } : s
      );

      // Handle pending duplicate — create new step and copy current content into it
      //@ts-ignore
      if (saveRef.current?.pendingDuplicateStep) {
        //@ts-ignore
        saveRef.current = { ...saveRef.current, pendingDuplicateStep: false };
        //@ts-ignore
        const dupResult = await dispatch(addPopupStep(Number(args.campaignId))) as any;
        if (dupResult?.payload?.StatusCode === 201) {
          const newStep = dupResult.payload.Data?.StepNumber;
          //@ts-ignore
          await dispatch(savePopupStepContent({
            webFormId: Number(args.campaignId),
            stepNumber: newStep,
            htmlContent: finalHtml,
            jsonData: finalJson,
          }));
          //@ts-ignore
          const refreshResult = await dispatch(getPopupSteps(Number(args.campaignId))) as any;
          const refreshedSteps: PopupStep[] = refreshResult?.payload?.Data || [];
          stepDataRef.current = refreshedSteps;
          setSteps(refreshedSteps.length > 0 ? refreshedSteps.map((s: PopupStep) => s.StepNumber) : [1]);
          switchToStep(newStep, refreshedSteps);
        } else if (dupResult?.payload?.StatusCode === 927) {
          setTierMessageCode(dupResult?.payload?.Message || 'POPUP_STEPS');
          setDialogType({ type: 'tier' });
        } else {
          // @ts-ignore
          setToastMessage({ severity: 'error', color: 'error', message: dupResult?.payload?.Message, showAnimtionCheck: false });
        }
        setLoader(false);
        return;
      }

      // Handle pending step switch — reload canvas only, no full page reload
      //@ts-ignore
      if (saveRef.current?.pendingStepSwitch != null) {
        //@ts-ignore
        const targetStep = saveRef.current.pendingStepSwitch;
        //@ts-ignore
        saveRef.current = { ...saveRef.current, pendingStepSwitch: null };
        switchToStep(targetStep);
        return;
      }

      // For step > 1, skip saveWebform (to avoid overwriting step 1 WebForm data)
      if (savedForStep > 1) {
        //@ts-ignore
        if (saveRef.current?.showAnimation && !saveRef.current?.saveTemplate) {
          // @ts-ignore
          setToastMessage({
            severity: 'success',
            color: 'success',
            message: t('PopupTriggers.popupSaved'),
            showAnimtionCheck: true
          } as any);
        }
        return;
      }

      //@ts-ignore
      let response: any = await dispatch(saveWebform({
        Name: '',
        ID: args.campaignId,
        JsonData: finalJson,
        HtmlData: finalHtml,
        //@ts-ignore
        GroupIDs: saveRef.current.groups ? saveRef.current.groups.join(',') : ''
      }));

      switch (response.payload.StatusCode) {
        case 201: {
          //@ts-ignore
          if (saveRef.current?.showGroupPopup) {
            setShowGroupSelection(true);
            saveRef.current = {
              //@ts-ignore
              ...saveRef.current,
              showGroupPopup: false
            }
            return false;
          }

          //@ts-ignore
          if (saveRef.current?.isPublish) {
            //@ts-ignore
            response = await dispatch(publish(args?.campaignId));

            if (response.payload?.StatusCode === 201) {
              if (isFromAutomation) {
                window.location.href = `/pulseem/CreateAutomations.aspx?AutomationID=${isFromAutomation}&NodeToEdit=${NodeToEdit}&id=${args.campaignId}&fromreact=true&Culture=${isRTL ? 'he-IL' : 'en-US'}`;
              } else {
                navigate(`${sitePrefix}landingpages/LandingPages/Summary/${args?.campaignId}`)
              }
            }
            else {
              // TODO: Handle publish response
            }
          }

          //@ts-ignore
          if (saveRef.current?.redirectAfterSave) {
            if (isFromAutomation) {
              window.location.href = `/pulseem/CreateAutomations.aspx?AutomationID=${isFromAutomation}&NodeToEdit=${NodeToEdit}&id=${args.campaignId}&fromreact=true&Culture=${isRTL ? 'he-IL' : 'en-US'}`;
            } else {
              localStorage.setItem('reloadLPBeeEditor', '1');
              //@ts-ignore
              navigate(saveRef.current?.redirectUrl ?? `${sitePrefix}LandingPages/Summary/${args.campaignId}`);
              return false;
            }
          }
          //@ts-ignore
          else if (saveRef.current?.showAnimation && !saveRef.current?.saveTemplate) {
            // @ts-ignore
            setToastMessage({
              severity: 'success',
              color: 'success',
              message: t('PopupTriggers.popupSaved'),
              showAnimtionCheck: true
            } as any);
          }
          //@ts-ignore
          if (reInit && !saveRef.current?.saveTemplate) {
            getData();
          }
          break;
        }
        case 405: {
          setLoader(false);
          // @ts-ignore
          setToastMessage(ToastMessages.MULTIPLE_FORMS_NOT_ALLOWED);
          return false;
        }
        case 406: {
          setToastMessage({ severity: 'error', color: 'error', message: t('landingPages.selectAtleastOneGroup'), showAnimtionCheck: false } as any);
          setShowGroupSelection(true);
          break;
        }
        case 412: {
          // @ts-ignore
          setToastMessage(ToastMessages.HTML_DOCTYPE_ERROR);
          break;
        }
      }
      //@ts-ignore
      if (saveRef.current?.saveTemplate) {
        const isTemplateExists = templatesBySubAccount?.filter((template: any) => {
          //@ts-ignore
          return template?.Name === saveRef.current?.templateName && saveRef.current?.templateCategory?.split(',').indexOf(template?.Category) > -1
        });
        if (isTemplateExists && isTemplateExists?.length > 0) {
          setDialogType({
            type: DialogType.TEMPLAGE_EXISTS,
            data: {
              finalJson: finalJson,
              finalHtml: finalHtml,
              //@ts-ignore
              name: saveRef.current?.templateName,
              //@ts-ignore
              category: isTemplateExists?.map((item: any) => { return item?.Category })?.join(',')
            }
          })
        }
        else {
          forceSaveTemplate(finalJson, finalHtml);
        }
      }
    } catch (e) {
      console.error(e);
    }
    finally {
      setLoader(false);
    }
  }
  const getDuplicateFieldsAcrossSteps = (): Set<string> => {
    if (stepDataRef.current.length <= 1) return new Set();
    const webform = landingPage?.Data?.WebForm;
    const fieldToSteps = new Map<string, number[]>();
    stepDataRef.current.forEach((step) => {
      const json = step.StepNumber === 1
        ? (step.JsonData ?? webform?.JsonData)
        : step.JsonData;
      const keys = getActiveFieldKeysFromJson(json);
      keys.forEach((key) => {
        const existing = fieldToSteps.get(key) ?? [];
        fieldToSteps.set(key, [...existing, step.StepNumber]);
      });
    });
    const duplicates = new Set<string>();
    fieldToSteps.forEach((stepNumbers, key) => {
      if (stepNumbers.length > 1) duplicates.add(key);
    });
    return duplicates;
  };

  const saveDesign = async (redirectAfterSave = false, redirectUrl: string | null | undefined = null, showAnimation = true, isPublish: boolean = false, isAutoSave: boolean = false, contactFieldCheckMode: 'warn' | 'block' | undefined = undefined) => {
    const duplicates = getDuplicateFieldsAcrossSteps();
    if (duplicates.size > 0) {
      if (!isAutoSave) {
        // @ts-ignore
        setToastMessage({ severity: 'error', color: 'error', message: t('Popup.duplicateFieldAcrossSteps', { fields: Array.from(duplicates).join(', ') }), showAnimtionCheck: false } as any);
      }
      return;
    }
    //@ts-ignore
    saveRef.current = { ...saveRef.current, redirectAfterSave: redirectAfterSave, redirectUrl: redirectUrl, showAnimation: showAnimation, isPublish: isPublish, isAutoSave: isAutoSave, contactFieldCheckMode: contactFieldCheckMode };
    //@ts-ignore
    await editorRef.current.save();
    setTimeout(() => {
      const now = moment();
      setLastSaveText(`${t('common.lastSaveAt')} ${moment(now).format("hh:mm:ss")}`)
      setSilentSave(false)
    }, 2000);
  }
  const onAutoSavePage = debounce((showGroupPopup: boolean = false) => {
    if (showGroupPopup) {
      saveRef.current = {
        //@ts-ignore
        ...saveRef.current,
        showGroupPopup: true
      }
    }
    setSilentSave(true)
    saveDesign(false, null, false, false, true);
  }, 100);
  const deleteCurrentLandingPage = async () => {
    //@ts-ignore
    await dispatch(deleteLandingPage(moduleId));
    navigateToLandingPageManagement();
  }
  const onDelete = () => {
    setDialogType({
      type: DialogType.DELETE
    })
  }

  const renderTemplateExistsDialog = (data: any) => {
    const { finalJson, finalHtml, name, category } = data;
    return {
      showDivider: false,
      title: t('common.payAttention'),
      showDefaultButtons: false,
      content: <Box style={{ marginBottom: 25 }}>
        <Typography>{RenderHtml(t("campaigns.GridButtonColumnResource2.existTemplateDescription").replace('#name#', name).replace('#category#', category))}</Typography>
      </Box>,
      renderButtons: () => (
        <Grid container
          spacing={4}
          className={clsx(classes.dialogButtonsContainer, classes.mt30, isRTL ? classes.rowReverse : null)}>
          <Button
            size='small'
            variant='contained'
            className={clsx(
              classes.btn,
              classes.btnRounded,
              classes.marginInlineStart15,
              classes.marginInlineEnd15
            )}
            onClick={() => {
              forceSaveTemplate(finalJson, finalHtml);
              setDialogType(null);
            }}
          >
            {t('common.confirm')}
          </Button>
          <Button
            size='small'
            variant='contained'
            className={clsx(
              classes.btn,
              classes.btnRounded
            )}
            onClick={() => {
              //@ts-ignore
              saveRef.current = { ...saveRef.current, saveTemplate: false };
              setDialogType(null);
              setDialog(DialogType.SAVE_TEMPLATE)
            }}
          >
            {t('common.cancel')}
          </Button>
        </Grid >
      ),
      onCancel: () => setDialogType(null),
      onClose: () => setDialogType(null)
    };
  }
  const forceSaveTemplate = async (finalJson: any, finalHtml: any) => {
    setLoader(true);
    //@ts-ignore
    const templateResponse = await dispatch(saveLPTemplateToAccount({
      //@ts-ignore
      Name: saveRef.current?.templateName,
      JsonData: finalJson,
      HTML: finalHtml,
      //@ts-ignore
      Category: saveRef.current?.templateCategory,
      IsPopUP: true
    }));
    //@ts-ignore
    if (!templateResponse.payload.Data) {
      //@ts-ignore
      setToastMessage({ severity: 'error', color: 'error', message: templateResponse.payload.Message, showAnimtionCheck: false });
    }
    else {
      //@ts-ignore
      setToastMessage(ToastMessages.TEMPLATE_SAVED);
      //@ts-ignore
      saveRef.current = { ...saveRef.current, saveTemplate: false };

    }
    setDialogType(null);
    setLoader(false);
    dispatch(getAllLPTemplatesBySubaccountId());
    getData(false);
  }

  const handleExitLandingPage = (saveBeforeExit = true) => {
    setDialogType(null);
    const isAutoResponder = fromLink?.toLowerCase() === 'autoresponder';
    const redirectLink = isAutoResponder ? `/Pulseem/AutoSendPlans.aspx?Culture=${isRTL ? 'he-IL' : 'en-US'}` : `${sitePrefix}PopUpManagement`;
    if (saveBeforeExit) {
      saveDesign(true, redirectLink, false, false);
    }
    else {
      window.location.href = redirectLink;
    }
  }
  const onExit = () => setDialogType({ type: DialogType.EXIT })

  // const onBack = () => saveDesign(true, `${sitePrefix}LandingPages/Create/${moduleId}`);
  const onBack = () => { saveDesign(true, `${sitePrefix}Popups/Create/${moduleId}`); };
  const renderToast = () => {
    if (toastMessage) {
      setTimeout(() => {
        setToastMessage(null);
      }, 2000);
      return (
        <Toast data={toastMessage} />
      );
    }
    return null;
  }
  //#endregion Pulseem Methods (Save, Delete, Exit, Back, Test Send)
  const onSaveUserBlock = (json: any, block: any) => {
    setLoader(true);
    const blockRequest = {
      Data: JSON.stringify(json),
      Category: block?.metadata?.name,
      Tags: block?.metadata?.tags?.split(','),
      uuid: block?.metadata?.uuid
    };
    //@ts-ignore
    dispatch(saveLPUserBlock(blockRequest)).then(async () => {
      setLoader(false);
      dispatch(getLPUserblocks());
      //@ts-ignore
      setToastMessage(ToastMessages.USER_BLOCK_SAVED);
      getData();
    });
  }
  const onEditBlock = (blockRequest: any) => {
    setLoader(true);
    //@ts-ignore
    dispatch(saveLPUserBlock(blockRequest)).then(async () => {
      setLoader(false);
      getData();
    });
  }
  const handleDeleteBlock = (e: any, row_id: string) => {
    if (!userRoles?.AllowDelete) {
      return false;
    }
    //@ts-ignore
    dispatch(deleteLPUserBlock(row_id)).then((result) => {
      console.log(result);
    })
  }
  const saveTemplate = async (name: string, category: string) => {
    saveRef.current = {
      //@ts-ignore
      ...saveRef.current,
      templateName: name,
      templateCategory: category,
      saveTemplate: true,
      showAnimation: true
    };
    //@ts-ignore
    await editorRef.current.save();
  }
  const onBeforeReinit = async () => {
    //@ts-ignore
    saveRef.current = { showAnimation: false, reInitEditor: true };
    //@ts-ignore
    await editorRef.current.save();
  }
  //#region Step management
  // Reloads only the editor canvas for the target step — no full page reload
  const switchToStep = (targetStep: number, updatedStepData?: PopupStep[]) => {
    const stepData = updatedStepData ?? stepDataRef.current;
    const webform = landingPage?.Data?.WebForm;
    const isRtlLang = webform?.BaseLanguage === 0 || webform?.BaseLanguage === 8 ? true : false;
    const defaultContent = DefaultContent(isRtlLang, webform?.BaseLanguage);

    const targetStepData = stepData.find((s: PopupStep) => s.StepNumber === targetStep);
    const stepJson = targetStepData?.JsonData ?? null;
    const template = stepJson
      ? JSON.parse(stepJson)
      : targetStep === 1 && webform?.JsonData
        ? JSON.parse(webform.JsonData)
        : defaultContent.defaultTemplate;

    // Update URL param without triggering a navigation/reload
    const url = new URL(window.location.href);
    url.searchParams.set('step', String(targetStep));
    window.history.replaceState({}, '', url.toString());

    // Keep ref and state in sync so subsequent saves target the right step
    currentStepRef.current = targetStep;
    setCurrentStep(targetStep);

    // Reload only the canvas — BeePlugin loads the new template in-place
    if (editorRef.current) {
      isSwitchingStep.current = true;
      // @ts-ignore
      editorRef.current.load(template);
      // Reset after the current call stack clears so any onSave fired
      // synchronously by load() is caught and discarded above
      setTimeout(() => { isSwitchingStep.current = false; }, 0);
    }
  };

  const handleGetPlanForFeature = (code: string) => {
    const planName = findPlanByFeatureCode(code, availablePlans, currentPlan?.Id);
    if (planName) {
      return t('billing.tier.featureNotAvailable')
        .replace('{feature}', t(TierFeatures[code as keyof typeof TierFeatures] || code))
        .replace('{planName}', planName);
    }
    return t('billing.tier.noFeatureAvailable');
  };

  const handleStepSwitch = (targetStep: number) => {
    if (targetStep === currentStep) return;
    if (targetStep > 1 && (currentPlan?.Id || 0) < 3) {
      setTierMessageCode('POPUP_STEPS');
      setDialogType({ type: 'tier' });
      return;
    }
    //@ts-ignore
    saveRef.current = { ...saveRef.current, pendingStepSwitch: targetStep, showAnimation: false };
    //@ts-ignore
    editorRef.current.save();
  };

  const handleAddStepClick = () => {
    if ((currentPlan?.Id || 0) < 3) {
      setTierMessageCode('POPUP_STEPS');
      setDialogType({ type: 'tier' });
      return;
    }
    setShowAddStepOptions(true);
  };

  const handleAddStepBlank = async () => {
    setShowAddStepOptions(false);
    setLoader(true);
    //@ts-ignore
    const result = await dispatch(addPopupStep(Number(moduleId))) as any;
    if (result?.payload?.StatusCode === 201) {
      const newStep = result.payload.Data?.StepNumber;
      //@ts-ignore
      const stepsResult = await dispatch(getPopupSteps(Number(moduleId))) as any;
      const stepsData: PopupStep[] = stepsResult?.payload?.Data || [];
      stepDataRef.current = stepsData;
      setSteps(stepsData.length > 0 ? stepsData.map((s: PopupStep) => s.StepNumber) : [1]);
      setLoader(false);
      switchToStep(newStep, stepsData);
    } else if (result?.payload?.StatusCode === 927) {
      setTierMessageCode(result?.payload?.Message || 'POPUP_STEPS');
      setDialogType({ type: 'tier' });
      setLoader(false);
    } else {
      // @ts-ignore
      setToastMessage({ severity: 'error', color: 'error', message: result?.payload?.Message, showAnimtionCheck: false });
      setLoader(false);
    }
  };

  const handleAddStepDuplicate = () => {
    setShowAddStepOptions(false);
    setLoader(true);
    //@ts-ignore
    saveRef.current = { ...saveRef.current, pendingDuplicateStep: true, showAnimation: false };
    //@ts-ignore
    editorRef.current.save();
  };

  const handleDeleteStep = async (stepNumber: number) => {
    setShowDeleteStepConfirm(null);
    setLoader(true);
    //@ts-ignore
    const result = await dispatch(deletePopupStep({ webFormId: Number(moduleId), stepNumber })) as any;
    if (result?.payload?.StatusCode === 201) {
      //@ts-ignore
      const stepsResult = await dispatch(getPopupSteps(Number(moduleId))) as any;
      const stepsData: PopupStep[] = stepsResult?.payload?.Data || [];
      stepDataRef.current = stepsData;
      setSteps(stepsData.length > 0 ? stepsData.map((s: PopupStep) => s.StepNumber) : [1]);
      setLoader(false);
      switchToStep(1, stepsData);
    } else {
      // @ts-ignore
      setToastMessage({ severity: 'error', color: 'error', message: result?.payload?.Message, showAnimtionCheck: false });
      setLoader(false);
    }
  };
  //#endregion Step management

  //#region Wizard buttons
  const renderTemplateButtons = () => {
    return <>
      <Button onClick={() => {
        // setLoader(true);
        setTimeout(() => {
          setDialogType({
            type: DialogType.Templates
          });
        }, 1000);
        setTimeout(() => {
          setLoader(false);
        }, 3000);
      }}
        variant='contained'
        size='medium'
        className={clsx(
          classes.btn,
          classes.btnRounded,
          classes.backButton
        )}
        style={{ margin: '8px' }}
      >
        {t('common.templates')}
      </Button>
      <Button onClick={() => setDialog(DialogType.SAVE_TEMPLATE)}
        variant='contained'
        size='medium'
        className={clsx(
          classes.btn,
          classes.btnRounded,
          classes.backButton
        )}
        style={{ margin: '8px' }}
        startIcon={<BiSave />}
      >
        {t('common.saveTemplate')}
      </Button>
      <Button onClick={() => setShowGroupSelection(true)}
        variant='contained'
        size='medium'
        className={clsx(
          classes.btn,
          classes.btnRounded,
          classes.backButton
        )}
        style={{ margin: '8px' }}
        startIcon={<MdGroups />}
      >
        {t('common.Groups')}
      </Button>
      {/* Steps segmented control — only render after data is ready to avoid flash of Step 1 */}
      {dataReady && (
        <>
          <Box
            style={{
              display: 'inline-flex',
              alignItems: 'stretch',
              border: '2px solid #F65026',
              borderRadius: 20,
              overflow: 'hidden',
              background: '#fff',
              margin: '4px 8px',
              minHeight: 34,
            }}
          >
            {steps.map((stepNum, index) => {
              const isActive = currentStep === stepNum;
              return (
                <Box key={stepNum} style={{ display: 'inline-flex', alignItems: 'stretch' }}>
                  {index > 0 && (
                    <Box style={{ width: 2, backgroundColor: '#F65026', flexShrink: 0 }} />
                  )}
                  <Button
                    size='medium'
                    className={clsx(classes.btn, isActive && classes.btnStepActive)}
                    onClick={() => handleStepSwitch(stepNum)}
                    style={{
                      border: 'none',
                      borderRadius: 0,
                      boxShadow: 'none',
                      padding: '4px 14px',
                      whiteSpace: 'nowrap',
                      minWidth: 'unset',
                    }}
                  >
                    {t('Popup.popup_step_n', { n: stepNum })}
                  </Button>
                  {stepNum > 1 && isActive && (
                    <Button
                      size='small'
                      className={clsx(classes.btn, classes.btnStepActive)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOptionsForStep(stepNum);
                        setStepOptionsAnchor(e.currentTarget);
                      }}
                      style={{
                        border: 'none',
                        borderRadius: 0,
                        minWidth: 'unset',
                        padding: '4px 8px',
                        boxShadow: 'none',
                      }}
                    >
                      <MdMoreVert style={{ fontSize: 18 }} />
                    </Button>
                  )}
                </Box>
              );
            })}
            {steps.length < 3 && (
              <Box style={{ display: 'inline-flex', alignItems: 'stretch' }}>
                <Box style={{ width: 2, backgroundColor: '#F65026', flexShrink: 0 }} />
                <Button
                  size='medium'
                  className={clsx(classes.btn)}
                  onClick={handleAddStepClick}
                  style={{
                    border: 'none',
                    borderRadius: 0,
                    boxShadow: 'none',
                    padding: '4px 10px',
                    minWidth: 'unset',
                  }}
                >
                  <MdAdd style={{ fontSize: 20 }} />
                </Button>
              </Box>
            )}
          </Box>

          {/* Step options menu — delete for steps 2 and 3 */}
          <Menu
            anchorEl={stepOptionsAnchor}
            open={Boolean(stepOptionsAnchor)}
            onClose={() => setStepOptionsAnchor(null)}
            getContentAnchorEl={null}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <MenuItem
              onClick={() => {
                setStepOptionsAnchor(null);
                setShowDeleteStepConfirm(optionsForStep);
              }}
              style={{ color: '#d32f2f' }}
            >
              <MdDelete style={{ marginInlineEnd: 6, fontSize: 18 }} />
              {t('common.Delete')}
            </MenuItem>
          </Menu>
        </>
      )}
    </>
  }
  const renderButtons = () => {
    const wizardButtons = [];
    if (!isFromAutomation) {
      wizardButtons.push(
        <>
          <Button
            onClick={() => {
              saveRef.current = {
                //@ts-ignore
                ...saveRef.current,
                showGroupPopup: showGroupSelection && selectedGroups?.length <= 0
              };
              saveDesign(false, null, true, false, false, 'warn')
            }}
            className={clsx(
              classes.btn,
              classes.btnRounded,
              classes.backButton
            )}
            style={{ margin: '8px' }}
            startIcon={silentSave ? <Loader isOpen={silentSave} size={20} showBackdrop={false} contained={true} /> : <BiSave />}
            color="primary"
          >
            {t("common.save")}
          </Button>
          {
            fromLink?.toLowerCase() !== 'autoresponder' && (
              <>
                {/* @ts-ignore */}
                {/* <Button onClick={() => {
                  setLoader(true);
                  saveRef.current = {
                    //@ts-ignore
                    ...saveRef.current,
                    showGroupPopup: showGroupSelection && selectedGroups?.length <= 0
                  };
                  saveDesign(true, null, false, true);
                }}
                  variant='contained'
                  size='medium'
                  className={clsx(
                    classes.btn,
                    classes.btnRounded,
                    classes.backButton
                  )}
                  startIcon={<MdOutlinePublic />}
                  style={{ marginInlineStart: '8px' }}
                  color="primary"
                >
                  {t('common.publish')}
                </Button> */}
                {/* @ts-ignore */}
                <Button onClick={() => {
                  saveRef.current = {
                    //@ts-ignore
                    ...saveRef.current,
                    showGroupPopup: showGroupSelection && selectedGroups?.length <= 0
                  };
                  saveDesign(true, `${sitePrefix}Popups/DisplayRules/${moduleId}?from=editor`, false, landingPage.Status === 2, false, 'block');
                }}
                  variant='contained'
                  size='medium'
                  className={clsx(
                    classes.btn,
                    classes.btnRounded,
                    classes.backButton
                  )}
                  endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                  style={{ marginInlineStart: '8px' }}
                  color="primary"
                >
                  {t('common.continue')}
                </Button>
              </>
            )
          }
        </>)
    }
    else {
      wizardButtons.push(<>
        <Button
          onClick={() =>
            saveDesign(false, null, true)}
          className={clsx(
            classes.btn,
            classes.btnRounded,
            classes.backButton
          )}
          endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
          style={{ margin: '8px' }}
          startIcon={<BiSave />}
          color="primary"
        >{t("common.save")}
        </Button>
        {/* @ts-ignore */}
        <Button
          onClick={() => {
            setLoader(true);
            saveRef.current = {
              //@ts-ignore
              ...saveRef.current,
              showGroupPopup: showGroupSelection && selectedGroups?.length <= 0
            };
            saveDesign(true, null, false, true);
          }}
          variant='contained'
          size='medium'
          className={clsx(
            classes.btn,
            classes.btnRounded,
            classes.backButton
          )}
          startIcon={<MdOutlinePublic />}
          style={{ marginInlineStart: '8px' }}
          color="primary"
        >
          {t('common.publish')}
        </Button>
        <Button onClick={() => {
          saveDesign(true, `/Pulseem/CreateAutomations.aspx?AutomationID=${isFromAutomation}&NodeToEdit=${NodeToEdit}&fromreact=true`, false);
        }}
          className={clsx(
            classes.btn,
            classes.btnRounded,
            classes.backButton
          )}
          endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
          style={{ marginInlineStart: '8px' }}
          color="primary"
        >{t('common.backToAutomation')}</Button>
      </>)
    }
    return wizardButtons.map((b) => b);
  }
  const getBackButtonText = () => {
    switch (moduleType?.toLowerCase()) {
      case BEE_EDITOR_TYPES.LANDING_PAGE.toLowerCase():
        return 'common.backToSettings';
      default:
        return 'common.back'
    }
  }
  //#endregion
  //#region Dialogs
  const showGalleryModal = () => {
    if (showGallery) {
      let dialog = {
        showDivider: false,
        icon: (
          <IoMdImages />
        ),
        title: t("common.imageGallery"),
        content: (
          <Gallery
            classes={classes}
            //@ts-ignore
            style={{ minWidth: 400 }}
            multiSelect={false}
            forceReload={true}
            folderType={PulseemFolderType.CLIENT_IMAGES} />
        )
      };
      return (
        <BaseDialog
          maxHeight="calc(70vh)"
          disableBackdropClick={true}
          style={{ minHeight: 400 }}
          //@ts-ignore
          showDivider={false}
          classes={classes}
          open={showGallery}
          onClose={() => { setShowGallery(false); }}
          onCancel={() => { setShowGallery(false); }}
          onConfirm={() => { setShowGallery(false); }}
          {...dialog}>
          {dialog.content}
        </BaseDialog>
      );
    }
  }
  const showDocumentsModal = () => {
    if (showDocs) {
      let dialog = {
        showDivider: false,
        title: t("common.documentGallery"),
        content: (
          <Gallery
            classes={classes}
            //@ts-ignore
            style={{ minWidth: 400 }}
            multiSelect={false}
            forceReload={true}
            folderType={PulseemFolderType.DOCUMENT} />
        )
      };
      return (
        <BaseDialog
          maxHeight="calc(70vh)"
          disableBackdropClick={true}
          style={{ minHeight: 400 }}
          //@ts-ignore
          showDivider={false}
          classes={classes}
          open={showDocs}
          onClose={() => { setShowDocuments(false); }}
          onCancel={() => { setShowDocuments(false); }}
          onConfirm={() => { setShowDocuments(false); onBeforeReinit(); setReinit(true); }}
          {...dialog}>
          {dialog.content}
        </BaseDialog>
      );
    }
  }
  const renderTemplateDialog = () => {
    return {
      showDivider: false,
      title: t("common.SelectTemplate"),
      showDefaultButtons: false,
      content: (
        <LPTemplates
          isOpen={dialogType?.type === DialogType.Templates}
          isCreateLandingPage={true}
          classes={classes}
          onClose={async (template: LandingPageTemplate) => {
            if (template !== undefined) {
              //@ts-ignore
              if (template !== undefined) {
                setDialogType({ type: DialogType.RENDER_TEMPLATE_CONFIRMATION, data: template });
              }
            } else {
              setDialogType(null);
            }
          }}
        />
      ),
      onConfirm: async () => {
      },
    };
  }
  const logoutDialog = () => {
    return {
      showDivider: false,
      title: t("common.systemNotice"),
      showDefaultButtons: false,
      content: (
        <Typography>
          {RenderHtml(t('common.autoLogoutMessage'))}
        </Typography>
      ),
      renderButtons: () => (
        <Button
          size='small'
          variant='contained'
          className={clsx(
            classes.btn,
            classes.btnRounded,
            classes.middle
          )}
          onClick={() => window.location.href = loginURL}
        >
          {t('common.confirm')}
        </Button>
      ),
      onClose: () => window.location.href = loginURL,
      onCancel: () => window.location.href = loginURL,
    };
  }
  const exitDialog = () => {
    return {
      showDivider: false,
      title: t('Popup.handleExitTitle'),
      cancelText: 'common.No',
      confirmText: 'common.Yes',
      content: (
        <Typography>
          {RenderHtml(t("Popup.confirmExit"))}
        </Typography>
      ),
      onConfirm: () => handleExitLandingPage(true),
      onClose: () => handleExitLandingPage(false)
    };
  }
  const deleteDialog = () => {
    return {
      showDivider: false,
      title: t('Popup.DeleteConfirmTitle'),
      confirmText: t('common.Yes'),
      cancelText: t('common.No'),
      content: (
        <Typography>
          {RenderHtml(t("Popup.DeleteConfirmText"))}
        </Typography>
      ),
      onConfirm: () => deleteCurrentLandingPage(),
      onClose: () => navigateToLandingPageManagement(),
    };
  }
  const renderTemplateConfirmationDialog = (newTemplate: LandingPageTemplate) => {
    return {
      showDivider: false,
      title: t('common.doYouWantToProceed'),
      confirmText: t('common.Yes'),
      cancelText: t('common.No'),
      content: (
        <Typography>
          {RenderHtml(t("common.overwriteTemplate"))}
        </Typography>
      ),
      onConfirm: () => {
        setDialogType(null);
        initLPBeeEditor(newTemplate.ID);
      }
    };
  }
  const renderNoCreditLeftDialog = () => {
    return {
      showDivider: false,
      title: t('common.ErrorTitle'),
      showDefaultButtons: false,
      content: (
        <Box style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
          <Typography style={{ textAlign: 'center' }}>{RenderHtml(t("sms.notEnoughCreditLeft"))}</Typography>
          <Typography style={{ textAlign: 'center' }}>{RenderHtml(t("sms.notEnoughCreditLeftDesc"))}</Typography>
        </Box>
      ),
      renderButtons: () => (
        <Button
          size='small'
          variant='contained'
          className={clsx(
            classes.btn,
            classes.btnRounded,
            classes.middle
          )}
          onClick={() => setDialogType(null)}
        >
          {t("common.Ok")}
        </Button>
      ),
    };
  }
  const renderGenericDialog = (message: string) => {
    return {
      showDivider: false,
      title: t('common.Notice'),
      showDefaultButtons: false,
      content: <Typography>{RenderHtml(message)}</Typography>
    };
  }
  const renderDialog = () => {
    const { type, data } = dialogType || {}
    let currentDialog = {};
    if (type === 'tier') {
      currentDialog = {
        showDivider: false,
        title: t('billing.tier.permission'),
        showDefaultButtons: false,
        content: (
          <Typography style={{ fontSize: 16, textAlign: 'center' }}>
            {handleGetPlanForFeature(tierMessageCode)}
          </Typography>
        ),
        renderButtons: () => (
          <Grid container spacing={2} justifyContent='center' style={{ marginTop: 8 }}>
            <Grid item>
              <Button
                size='small'
                variant='contained'
                className={clsx(classes.btn, classes.btnRounded)}
                onClick={() => { setDialogType(null); setShowTierPlans(true); }}
              >
                {t('billing.upgradePlan')}
              </Button>
            </Grid>
            <Grid item>
              <Button
                size='small'
                variant='contained'
                className={clsx(classes.btn, classes.btnRounded)}
                onClick={() => setDialogType(null)}
              >
                {t('common.cancel')}
              </Button>
            </Grid>
          </Grid>
        ),
        onClose: () => setDialogType(null),
        onCancel: () => setDialogType(null),
      };
    } else if (type === DialogType.Templates) {
      currentDialog = renderTemplateDialog();
    } else if (type === DialogType.LOGOUT) {
      currentDialog = logoutDialog();
    } else if (type === DialogType.EXIT) {
      currentDialog = exitDialog();
    } else if (type === DialogType.DELETE) {
      currentDialog = deleteDialog();
    } else if (type === DialogType.RENDER_TEMPLATE_CONFIRMATION) {
      currentDialog = renderTemplateConfirmationDialog(data);
    } else if (type === DialogType.NO_CREDITS_LEFT) {
      //@ts-ignore
      currentDialog = renderNoCreditLeftDialog(data);
    } else if (type === DialogType.GENERIC) {
      currentDialog = renderGenericDialog(data);
    } else if (type === DialogType.TEMPLAGE_EXISTS) {
      currentDialog = renderTemplateExistsDialog(data);
    }

    if (type) {
      return (
        dialogType && <BaseDialog
          classes={classes}
          //@ts-ignore
          open={dialogType}
          childrenStyle={classes.mb25}
          onClose={() => setDialogType(null)}
          onCancel={() => setDialogType(null)}
          {...currentDialog}>
          {/* @ts-ignore */}
          {currentDialog.content}
        </BaseDialog>
      )
    }
    return <></>
  }
  //#endregion Dialogs
  //#region Forms
  const onFormAdded = (formsCount: number) => {
    if (formsCount > 1) {
      // @ts-ignore
      setToastMessage(ToastMessages.MULTIPLE_FORMS_NOT_ALLOWED);
    }
    else {
      onAutoSavePage(true);
    }
  }
  const updateWebFormGroups = async (list: Array<number>) => {
    if (landingPage?.Data?.WebForm?.HtmlData?.indexOf('submithandler.axd') > -1 && list?.length === 0) {
      // @ts-ignore
      setToastMessage({ severity: 'error', color: 'error', message: t('group.typeGroupNameAutocomplete'), showAnimtionCheck: false });
    } else {
      setLoader(true);
      const requestParams = { WebformID: params.id, GroupID: list };
      // @ts-ignore
      const response = await dispatch(setWebformGroups(requestParams)) as any;
  
      if (response.payload.StatusCode === 201) {
        setShowGroupSelection(false);
        if (list?.length === 0) {
          setSelectedGroups([]);
        }
        else {
          const tempArr = [...selectedGroups, ...list];
          setSelectedGroups(tempArr);
          saveRef.current = {
            //@ts-ignore
            ...saveRef.current,
            showGroupPopup: false,
            groups: tempArr
          };
          //@ts-ignore
          await editorRef.current.save();
        }
      }
      else {
        // @ts-ignore
        setToastMessage({ severity: 'error', color: 'error', message: t('common.ErrorOccured'), showAnimtionCheck: false });
      }
      // getData();
      setLoader(false);
    }
  }
  //#endregion Forms 
  const getConfig = () => {
    return BeeConfig({
      //@ts-ignore
      moduleType,
      classes,
      onSaveUserBlock,
      IsRTL: isRTL,
      BasedOnRTL: (landingPage?.Data?.WebForm?.BaseLanguage === 0 || landingPage?.Data?.WebForm?.BaseLanguage === 8),
      EditRow: EditRow,
      openModal: openModal,
      Save: onSave,
      AutoSave: onAutoSavePage,
      DesignChange: onAutoSavePage,
      SetDialog: setDialogType,
      //@ts-ignore
      Id: moduleId,
      PulseemEditBlock: onEditBlock,
      DeleteBlock: handleDeleteBlock,
      // HandleAutoSave: handleAutoSave,
      getRows,
      handleEditRow,
      handleDeleteRow,
      t: t,
      form: clientForm,
      onFormAdded: onFormAdded,
      // languageCode: language
      languageCode: editorLanguage
    }) as any;
  }

  const config = getConfig();

  return (
    <DefaultScreen
      showAppBar={false}
      currentPage='campaignEditor'
      classes={classes}
      customPadding={true}
      containerClass={[classes.fullWidth, classes.noPadding]}
    >
      {renderToast()}
      {showGalleryModal()}
      {showDocumentsModal()}
      <GenericModal
        classes={classes}
        modalData={genericModalData}
        isOpen={dialog && dialog === DialogType.GENERIC}
      />
      <ResponseModal
        classes={classes}
        //@ts-ignore
        isOpen={dialog && isResponseModal}
        onClose={() => setIsResponseModal(false)}
        //@ts-ignore
        onConfirm={() => setIsResponseModal(false)}
        summaryData={summaryData}
        message={dialog}
      />
      <Box className={classes.containerFullHeight}>
        <div id="page-bee-plugin-container-popup" className={classes.containerFullHeight}></div>
      </Box>
      <DemoModal modals={modals} />
      <WizardActions
        disabled={buttonDisabled}
        campaignId={moduleId}
        ignorePaddingBottom={true}
        innerStyle={{ paddingInline: 15 }}
        classes={classes}
        //@ts-ignore
        onExit={!isFromAutomation && onExit}
        //@ts-ignore
        onBack={
          fromLink?.toLowerCase() !== 'autoresponder' && {
            callback: () => { onBack() },
            text: t(getBackButtonText())
          }
        }
        //@ts-ignore
        onDelete={userRoles?.AllowDelete && fromLink?.toLowerCase() !== 'autoresponder' && onDelete}
        // onShowGallery={() => { setShowGallery(true) }}
        //@ts-ignore
        onShowDocuments={() => { setShowDocuments(true) }}
        //@ts-ignore
        additionalButtons={renderButtons()}
        //@ts-ignore
        additionalButtonsOnStart={renderTemplateButtons()}
        // additionalButtonsOnStart={<></>}
        //@ts-ignore
        helperText={<label style={{ fontSize: 14 }}>{lastSaveText}</label>}
      />
      {renderDialog()}
      <Loader isOpen={showLoader} showBackdrop={false} />
      {/* @ts-ignore */}
      {showGroupSelection && <GroupSelectorPopUp
        classes={classes}
        key={'groupSelection'}
        isOpen={true}
        onConfirm={updateWebFormGroups}
        onClose={() => setShowGroupSelection(false)}
        onCancel={() => setShowGroupSelection(false)}
        selectedGroups={selectedGroups}
      />}

      <SaveTemplate
        classes={classes}
        onClose={(resp: any) => {
          setDialog(null);
          //@ts-ignore
          saveRef.current = { ...saveRef.current, saveTemplate: false };
          if (resp !== undefined) saveTemplate(resp.name, resp.category);
        }}
        isOpen={dialog === DialogType.SAVE_TEMPLATE}
      />
      {showTierPlans && (
        <TierPlans
          classes={classes}
          isOpen={showTierPlans}
          onClose={() => setShowTierPlans(false)}
        />
      )}
      {showAddStepOptions && (
        <BaseDialog
          classes={classes}
          open={true}
          title={t('Popup.popup_add_step')}
          //@ts-ignore
          showDefaultButtons={false}
          childrenStyle={classes.noMargin}
          onClose={() => setShowAddStepOptions(false)}
          onCancel={() => setShowAddStepOptions(false)}
        >
          <Box style={{ textAlign: 'center', padding: '12px 0 16px' }}>
            <Typography style={{ marginBottom: 16, color: '#555' }}>
              {t('Popup.popup_add_step_choose')}
            </Typography>
            <Box style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Button
                variant='contained'
                className={clsx(classes.btn, classes.btnRounded)}
                onClick={handleAddStepBlank}
              >
                {t('Popup.popup_add_step_blank')}
              </Button>
              <Button
                variant='contained'
                className={clsx(classes.btn, classes.btnRounded)}
                onClick={handleAddStepDuplicate}
              >
                {t('Popup.popup_add_step_duplicate')}
              </Button>
            </Box>
          </Box>
        </BaseDialog>
      )}
      {showDeleteStepConfirm !== null && (
        <BaseDialog
          classes={classes}
          open={true}
          title={t('Popup.popup_step_n', { n: showDeleteStepConfirm })}
          //@ts-ignore
          onClose={() => setShowDeleteStepConfirm(null)}
          onCancel={() => setShowDeleteStepConfirm(null)}
          onConfirm={() => handleDeleteStep(showDeleteStepConfirm)}
        >
          <Typography>{t('Popup.popup_delete_step_confirm')}</Typography>
        </BaseDialog>
      )}
      {showContactFieldWarning && (
        <BaseDialog
          classes={classes}
          open={true}
          title={t('Popup.contactFieldRequiredTitle')}
          //@ts-ignore
          onClose={() => setShowContactFieldWarning(false)}
          onCancel={() => setShowContactFieldWarning(false)}
          renderButtons={() => (
            <Grid container spacing={2} justifyContent='center' className={clsx(classes.dialogButtonsContainer)}>
              <Grid item>
                <Button
                  variant='contained'
                  size='small'
                  className={clsx(classes.btn, classes.btnRounded)}
                  onClick={() => setShowContactFieldWarning(false)}
                >
                  {t('Popup.contactFieldRequiredOkay')}
                </Button>
              </Grid>
            </Grid>
          )}
        >
          <Typography>{t('Popup.contactFieldRequiredMessage')}</Typography>
        </BaseDialog>
      )}
    </DefaultScreen>
  )
}
export default BeeEditorPopup;
