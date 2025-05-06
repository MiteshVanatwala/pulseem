import clsx from 'clsx';
import { debounce, includes } from 'lodash';
import BeePlugin from '@mailupinc/bee-plugin'
import { Box, Button, Grid, TextField, Typography } from '@material-ui/core'
import { useRef, useState, useEffect } from 'react'
import DefaultScreen from '../DefaultScreen'
import { useSelector, useDispatch } from 'react-redux';
import { Loader } from '../../components/Loader/Loader';
import { useTranslation } from "react-i18next";
import ResponseModal from './modals/ResponseModal'
import Toast from '../../components/Toast/Toast.component';
import { getAuthorizedEmails, getCommonFeatures, isAlive } from '../../redux/reducers/commonSlice';
import WizardActions from '../../components/Wizard/WizardActions';
import { getById, deleteLPUserBlock, deleteLandingPage, getAllLPTemplatesBySubaccountId, getLPBeeToken, getLPPublicTemplates, getLPTemplateById, getLPUserblocks, saveLPTemplateToAccount, saveLPUserBlock, saveWebform, publish, setWebformGroups } from '../../redux/reducers/landingPagesSlice';
import { initClientForm, initExtraDataField, initLandingPages } from './helper/MigratePulseemData';
import { BeeConfig, DialogType, DefaultContent } from './helper/config';
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
import { MdArrowBackIos, MdArrowForwardIos, MdCheck, MdGroups, MdOutlinePublic } from 'react-icons/md';
import { BaseDialog } from '../../components/DialogTemplates/BaseDialog';
import { BEE_EDITOR_TYPES } from '../../helpers/Constants';
import { RenderHtml } from '../../helpers/Utils/HtmlUtils';
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

const BeeEditor = ({ classes }: BeeEditorModel) => {
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
  const { landingPage, landingPageUserBlocks, ToastMessages, LPBeeToken, publicTemplates, templatesBySubAccount } = useSelector((state: { landingPages: BeeEditorStoreModel }) => state.landingPages)
  const [showLoader, setLoader] = useState(true);
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
  //#endregion State
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
    if (!includes(BEE_EDITOR_TYPES, moduleType)) {
      navigateToLandingPageManagement();
    }
    if (Number(moduleId) > 0) {
      if (localStorage.getItem('reloadLPBeeEditor') === '1') {
        localStorage.removeItem('reloadLPBeeEditor');
        window.location.reload();
      } else getData();
    }
    //@ts-ignore
    if (!publicTemplates.length) dispatch(getLPPublicTemplates(isRTL));
    if (!templatesBySubAccount.length) dispatch(getAllLPTemplatesBySubaccountId());
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
    navigate(`${sitePrefix}EditRegistrationPage`);
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
    await dispatch(getAccountExtraData());
    await dispatch(getPreviousLandingData());
    await dispatch(getTestGroups());
    await dispatch(getLPUserblocks());
    await dispatch(getAuthorizedEmails());
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
      config.titleDefaultStyles = defaultContent.titleDefaultStyles;
      config.contentDefaults = defaultContent.contentDefaults;

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
            const template = forceTemplate !== null ? forceTemplate : webform?.JsonData ? JSON.parse(webform?.JsonData) : defaultContent.defaultTemplate;

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
      initLPBeeEditor();
    }
  }, [LPBeeToken]);
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
    //@ts-ignore
    const reInit = saveRef.current?.reInitEditor;
    try {
      //@ts-ignore
      if (saveRef.current?.showAnimation) setLoader(true);
      let finalHtml = args.HtmlData;
      let finalJson = args.JsonData;

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
            //@ts-ignore
            setToastMessage(ToastMessages.LANDING_PAGE_SAVED);
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
  const saveDesign = async (redirectAfterSave = false, redirectUrl: string | null | undefined = null, showAnimation = true, isPublish: boolean = false) => {
    //@ts-ignore
    saveRef.current = { ...saveRef.current, redirectAfterSave: redirectAfterSave, redirectUrl: redirectUrl, showAnimation: showAnimation, isPublish: isPublish };
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
    saveDesign(false, null, false);
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
      Category: saveRef.current?.templateCategory
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
    const redirectLink = isAutoResponder ? `/Pulseem/AutoSendPlans.aspx?Culture=${isRTL ? 'he-IL' : 'en-US'}` : `${sitePrefix}EditRegistrationPage`;
    if (saveBeforeExit) {
      saveDesign(true, redirectLink, false, false);
    }
    else {
      window.location.href = redirectLink;
    }
  }
  const onExit = () => setDialogType({ type: DialogType.EXIT })

  const onBack = () => saveDesign(true, `${sitePrefix}LandingPages/Create/${moduleId}`);
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
              saveDesign(false, null, true)
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
                <Button onClick={() => {
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
                {/* @ts-ignore */}
                <Button onClick={() => {
                  saveRef.current = {
                    //@ts-ignore
                    ...saveRef.current,
                    showGroupPopup: showGroupSelection && selectedGroups?.length <= 0
                  };
                  saveDesign(true, `${sitePrefix}EditRegistrationPage`, false, landingPage.Status === 2);
                }}
                  variant='contained'
                  size='medium'
                  className={clsx(
                    classes.btn,
                    classes.btnRounded,
                    classes.backButton
                  )}
                  startIcon={<MdCheck />}
                  style={{ marginInlineStart: '8px' }}
                  color="primary"
                >
                  {t('common.finish')}
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
      title: t('landingPages.handleExitTitle'),
      cancelText: 'common.No',
      confirmText: 'common.Yes',
      content: (
        <Typography>
          {RenderHtml(t("landingPages.confirmExit"))}
        </Typography>
      ),
      onConfirm: () => handleExitLandingPage(true),
      onClose: () => handleExitLandingPage(false)
    };
  }
  const deleteDialog = () => {
    return {
      showDivider: false,
      title: t('landingPages.DeleteTitle'),
      confirmText: t('common.Yes'),
      cancelText: t('common.No'),
      content: (
        <Typography>
          {RenderHtml(t("landingPages.DeleteBody"))}
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
    if (type === DialogType.Templates) {
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
      languageCode: language
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
        <div id="page-bee-plugin-container" className={classes.containerFullHeight}></div>
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
    </DefaultScreen>
  )
}
export default BeeEditor;
