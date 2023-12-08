import clsx from 'clsx';
import { debounce, includes } from 'lodash';
import BeePlugin from '@mailupinc/bee-plugin'
import { Box, Button, TextField, Typography } from '@material-ui/core'
import { useRef, useState, useEffect } from 'react'
import DefaultScreen from '../DefaultScreen'
import { useSelector, useDispatch } from 'react-redux';
import { Loader } from '../../components/Loader/Loader';
import { useTranslation } from "react-i18next";
import ResponseModal from './modals/ResponseModal'
import Toast from '../../components/Toast/Toast.component';
import { getCommonFeatures, isAlive } from '../../redux/reducers/commonSlice';
import WizardActions from '../../components/Wizard/WizardActions';
import { deleteLPUserBlock, deleteLandingPage, getAllLPTemplatesBySubaccountId, getLPBeeToken, getLPPublicTemplates, getLPTemplateById, getLPUserblocks, saveLPTemplateToAccount, saveLPUserBlock, saveLandingPage } from '../../redux/reducers/landingPagesSlice';
import { initExtraDataField, initLandingPages } from './helper/MigratePulseemData';
import { BeeConfig, DialogType, DefaultContent } from './helper/Config';
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
import Templates from './modals/Templates';
/* END Bee */
import { loginURL, sitePrefix } from '../../config';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { BaseDialog } from '../../components/DialogTemplates/BaseDialog';
import { BEE_EDITOR_TYPES } from '../../helpers/Constants';
import { RenderHtml } from '../../helpers/Utils/HtmlUtils';

const BeeEditor = ({ classes }) => {
  //#region State
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();
  const editorRef = useRef(null);
  const saveRef = useRef(null);
  const moduleId = params?.id;
  const moduleType = params?.type;
  
  const { campaign, userBlocks, ToastMessages } = useSelector(state => state.campaignEditor);
  const { extraData, previousLandingData } = useSelector(state => state.sms);
  const { language, isRTL } = useSelector(state => state.core)
  const { tokenAlive, accountSettings, accountFeatures } = useSelector(state => state.common)
  const { LPBeeToken, publicTemplates, templatesBySubAccount } = useSelector(state => state.landingPages)

  const [showLoader, setLoader] = useState(true);
  const [dataReady, setDataReady] = useState(false);
  const [dialogType, setDialogType] = useState({ type: null });
  const [mergeData, setPulseemMergeData] = useState({});
  const [dialog, setDialog] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [isResponseModal, setIsResponseModal] = useState(false);
  const [alertLogout, setAlertLogout] = useState(false);
  const { modals, openModal } = useModals()
  const { setRow, getRows, handleDeleteRow, handleEditRow } = useMockAPI();
  const [showGallery, setShowGallery] = useState(false);
  const [showDocs, setShowDocuments] = useState(false);
  const queryParams = new URLSearchParams(window.location.search)
  const isFromAutomation = queryParams.get("FromAutomation");
  const NodeToEdit = queryParams.get("NodeToEdit");
  const fromLink = queryParams.get("fromLink");
  const [lastSaveText, setLastSaveText] = useState(null);
  const [silentSave, setSilentSave] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(true);
  // const [newTemplate, setNewTemplate] = useState('');
  const [saveTemplateDetails, setSaveTemplateDetails] = useState({
    templateName: '',
    categoryName: '',
  });
  const [errors, setErrors] = useState({
    templateName: '',
    categoryName: '',
  });
  //#endregion State

  //#region Get Extra fields & Landing pages, after Data Ready
  const initFields = () => {
    initExtraDataField(extraData, t).then((exData) => {
      setPulseemMergeData(exData);
    })
  }

  const initSpecialLinks = () => {
    return new Promise((resolve, reject) => {
      try {
        initLandingPages(previousLandingData, t).then((items) => {
          dispatch(getFileGallery(PulseemFolderType.DOCUMENT)).then((response) => {
            const gallery = response.payload;
            const specialLinksFiles = items;
            const folderExtName = t('common.files');

            gallery?.Files?.forEach((file) => {
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
  // Get data by campaign id
  useEffect(() => {
    if (!includes(BEE_EDITOR_TYPES, moduleType)) {
      navigateToLandingPageManagement();
    }

    if (params?.id > 0) {
      if (localStorage.getItem('reloadLPBeeEditor') == '1') {
        localStorage.removeItem('reloadLPBeeEditor');
        window.location.reload(true);
      } else getData();
    }

    if (!publicTemplates.length) dispatch(getLPPublicTemplates(isRTL));
		if (!templatesBySubAccount.length) dispatch(getAllLPTemplatesBySubaccountId());
  }, []);

  useEffect(() => {
    if (userBlocks) {
      return new Promise((resolve) => {
        userBlocks.forEach(x => setRow(x.data));
        resolve();
      });
    }
    else {
      initOptions();
    }
  }, [language, userBlocks]);

  //#region Check session token -> tokenAlive
  useEffect(() => {
    setInterval(() => {
      if (tokenAlive) {
        dispatch(isAlive());
      }
    }, 300000);
    try {
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

  const getData = async () => {
    setLoader(true);
    const initBeeToken = () => {
      dispatch(getLPBeeToken());
    }
    initBeeToken();
    setDataReady(true);
  }
  //#region Init Bee Token & Configuration
  const initTags = () => {
    let tempTags = [...new Set(userBlocks?.map(item => item.tags))];
    var tags = [].concat.apply([], tempTags);
    if (tags && tags?.length > 0) {
      config.rowsConfiguration.externalContentURLs = [];
      let tempRows = [];
      tags?.forEach((tag, idx) => {
        if (tag && tag !== undefined && tag !== null) {
          const tagObj = {
            name: tag.trim(),
            value: tag.replace(' ', ''),
            handle: tag.replace(' ', ''),
            isLocal: true,
            behaviors: {
              canEdit: true,
              canDelete: true,
            },
          };
          tempRows.push(tagObj);
        }
      });
      tempRows = tempRows.filter((value, index) => {
        const _value = JSON.stringify(value);
        return index === tempRows.findIndex(obj => {
          return JSON.stringify(obj) === _value;
        });
      });
      config.rowsConfiguration.externalContentURLs = tempRows;
    }
  }
  const initLPBeeEditor = (templateId = null) => {
      initSpecialLinks().then(async (specialLinksFiles) => {
        const isRtlLang = campaign?.LanguageCode === 0 || campaign?.LanguageCode === 8 ? true : false;
        let forceTemplate = null;
        let defaultContent = DefaultContent(isRtlLang);
        // if (templateId !== null) {
        //   const templateResponse = await dispatch(getLPTemplateById(templateId));
  
        //   if (templateResponse?.payload?.StatusCode === 201) {
        //     const responseData = templateResponse?.payload?.Data;
        //     setNewTemplate(responseData)
        //     forceTemplate = responseData?.JsonData ? JSON.parse(responseData?.JsonData) : defaultContent.defaultTemplate;
        //   } else {
        //     setToastMessage({ severity: 'error', color: 'error', message: templateResponse?.payload.Message, showAnimtionCheck: false });
        //   }
        // }
        // config.uid = accountSettings?.SubAccountSettings?.BeeUniqueID;
        // config.mergeTags = mergeData;
        // config.specialLinks = specialLinksFiles;
        // config.titleDefaultStyles = defaultContent.titleDefaultStyles;
        // config.contentDefaults = defaultContent.contentDefaults;
        // if (accountFeatures?.indexOf(PulseemFeatures.BEE_AMP) > -1) {
        //   config.workspace.type = 'mixed';
        // }
  
        // initTags();
        switch (LPBeeToken?.StatusCode) {
          case 201: {
            const beeObject = JSON.parse(LPBeeToken.Message);
            if (LPBeeToken.Message === "null" || LPBeeToken.Message === null) {
              setDialogType({
                type: DialogType.GENERIC,
                data: t(DialogType.MISSING_API_KEY)
              });
            }
            else {
              const beeTest = new BeePlugin(beeObject);
              let template = null;
              if (forceTemplate !== null) {
                template = forceTemplate;
              }
              else {
                template = campaign?.JsonData ? JSON.parse(campaign?.JsonData) : defaultContent.defaultTemplate;
              }
  
              beeTest.start(config, template).then((instance) => {
                editorRef.current = instance;
                if ((!campaign || !campaign.HtmlData) && (!params?.id || params?.id === 0)) {
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
      })
  }

  useEffect(() => {
    if (LPBeeToken) {
      initLPBeeEditor();
    }

  }, [LPBeeToken]);

  const initOptions = async () => {
    initTags();
    if (!accountSettings || accountSettings.SubAccountSettings) {
      await dispatch(getCommonFeatures());
    }
    if (editorRef.current) {
      const c = getConfig();
      editorRef.current.loadConfig(c);
      editorRef.current.load();
    }
  }


  //#endregion Init Bee Token & Configuration
  //#region Pulseem Methods (Save, Delete, Exit, Back, Test Send)
  const onSave = async (args) => {
    const reInit = saveRef.current?.reInitEditor;

    try {
      if (saveRef.current?.showAnimation) setLoader(true);
      let finalHtml = args.HtmlData;
      let finalJson = args.JsonData;
      const response = await dispatch(saveLandingPage({
        Name: '',
        campaignId: args.campaignId,
        JsonData: finalJson,
        HTML: finalHtml
      }));

      if (response.payload === true) {
        if (saveRef.current?.redirectAfterSave) {
          localStorage.setItem('reloadLPBeeEditor', 1);
          window.location = saveRef.current?.redirectUrl ?? `${sitePrefix}Campaigns/SendSettings/${args.campaignId}`;
          return false;
        }
        else if (saveRef.current?.showAnimation) {
          setToastMessage(saveRef.current?.saveTemplate ? ToastMessages.TEMPLATE_SAVED : ToastMessages.CAMPAIGN_SAVED);
        }

        if (reInit) {
          getData();
        }
      }

      if (saveRef.current?.saveTemplate) {
        const templateResponse = await dispatch(saveLPTemplateToAccount({
          Name: saveRef.current?.templateName,
          JsonData: finalJson,
          HTML: finalHtml,
          Category: saveRef.current?.templateCategory
        }));
        if (!templateResponse.payload.Data) {
          setToastMessage({ severity: 'error', color: 'error', message: templateResponse.payload.Message, showAnimtionCheck: false });
        }
        dispatch(getAllLPTemplatesBySubaccountId());
      }
    } catch (e) {
      console.error(e);
    }
    finally {
      setLoader(false);
    }
  }

  const saveDesign = async (redirectAfterSave = false, redirectUrl = null, showAnimation = true) => {
    saveRef.current = { redirectAfterSave: redirectAfterSave, redirectUrl: redirectUrl, showAnimation: showAnimation };
    await editorRef.current.save();
    setTimeout(() => {
      const now = moment();
      setLastSaveText(`${t('landingPages.lastSaveAt')} ${moment(now).format("hh:mm:ss")}`)
      setSilentSave(false)
    }, 2000);
  }

  const onAutoSavePage = debounce(() => {
    setSilentSave(true)
    saveDesign(false, null, false);
  }, 5000);

  const onDesignChange = async () => {
    onAutoSavePage();
  }

  const deleteCurrentLandingPage = async () => {
    await dispatch(deleteLandingPage(moduleId));
    navigateToLandingPageManagement();
  }

  const onDelete = () => {
    setDialogType({
      type: DialogType.DELETE
    })
  }
  
  const handleExitLandingPage = (saveBeforeExit = true) => {
    setDialogType(null);
    const isAutoResponder = fromLink?.toLowerCase() === 'autoresponder';
    const redirectLink = isAutoResponder ? `/Pulseem/AutoSendPlans.aspx?Culture=${isRTL ? 'he-IL' : 'en-US'}` : `${sitePrefix}EditRegistrationPage`;

    if (saveBeforeExit) {
      saveDesign(true, redirectLink, false);
    }
    else {
      window.location.href = redirectLink;
    }
  }

  const onExit = () => setDialogType({ type: DialogType.EXIT })
  
  const onBack = () => saveDesign(true, `${sitePrefix}EditRegistrationPage`);

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
  const handleCloseReponse = () => {
    setIsResponseModal(false);
  }

  const onSaveUserBlock = (json, block) => {
    setLoader(true);
    const blockRequest = {
      Data: JSON.stringify(json),
      Category: block?.metadata?.name,
      Tags: block?.metadata?.tags?.split(','),
      uuid: block?.metadata?.uuid
    };
    dispatch(saveLPUserBlock(blockRequest)).then(async () => {
      setLoader(false);
      dispatch(getLPUserblocks());
      await setRow(json);
    });
  }

  const onEditBlock = (blockRequest) => {
    setLoader(true);
    dispatch(saveLPUserBlock(blockRequest)).then(async () => {
      setLoader(false);
      await setRow(JSON.stringify(blockRequest?.Json));
    });
  }

  const handleDeleteBlock = (e, row_id) => {
    dispatch(deleteLPUserBlock(row_id)).then((result) => {
      console.log(result);
    })
  }

  const getConfig = () => {
    return BeeConfig({
      moduleType,
      classes,
      onSaveUserBlock,
      IsRTL: isRTL,
      EditRow: EditRow,
      openModal: openModal,
      Save: onSave,
      AutoSave: onAutoSavePage,
      DesignChange: onDesignChange,
      SetDialog: setDialog,
      Id: moduleId,
      PulseemEditBlock: onEditBlock,
      DeleteBlock: handleDeleteBlock,
      // HandleAutoSave: handleAutoSave,
      getRows,
      handleEditRow,
      handleDeleteRow,
      t: t
    });
  }
  const config = getConfig();


  const saveTemplate = async () => {
    saveRef.current = {
      templateName: saveTemplateDetails.templateName,
      templateCategory: saveTemplateDetails.categoryName,
      saveTemplate: true,
      showAnimation: true
    };
    await editorRef.current.save();
  }

  const onBeforeReinit = async () => {
    saveRef.current = { showAnimation: false, reInitEditor: true };
    await editorRef.current.save();
  }

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
          showDivider={false}
          classes={classes}
          open={showDocs}
          onClose={() => { setShowDocuments(false); }}
          onCancel={() => { setShowDocuments(false); }}
          onConfirm={() => { setShowDocuments(false); onBeforeReinit(); }}
          {...dialog}>
          {dialog.content}
        </BaseDialog>
      );
    }
  }

  const renderTemplateButtons = () => {
    return <>
      <Button onClick={() => {
        setLoader(true);
        setTimeout(() => {
          setDialogType({
            type: DialogType.Templates
          });
        }, 1000);

        setTimeout(() => {
          setLoader(false);
        }, 2000);
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
      <Button onClick={() => setDialogType({ type: DialogType.SAVE_TEMPLATE })}
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
      </Button></>
  }
  const renderButtons = () => {
    const wizardButtons = [];
    if (!isFromAutomation) {
      wizardButtons.push(<>
        <Button
          onClick={() =>
            saveDesign(false, null, true)}
          className={clsx(
            classes.btn,
            classes.btnRounded,
            classes.backButton
          )}
          style={{ margin: '8px' }}
          startIcon={silentSave ? <Loader isOpen={silentSave} size={20} showBackdrop={false} contained={true} /> : <BiSave />}
          color="primary"
        >{t("common.save")}
        </Button>
        {fromLink?.toLowerCase() !== 'autoresponder' && <Button onClick={saveDesign}
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
        >{t('common.continue')}</Button>
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
    switch (moduleType) {
      case BEE_EDITOR_TYPES.LANDING_PAGE:
        return 'landingPages.landingPages';

      default:
        return 'common.back'
    }
  }

  const renderTemplateDialog = () => {
		return {
			showDivider: false,
			title: t("common.SelectTemplate"),
			showDefaultButtons: false,
			content: (
				<Templates
					isCreateLandingPage={true}
					classes={classes}
					onClose={async (template) => {
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

  const renderSaveTemplateDialog = () => {
		return {
			showDivider: false,
			title: t("common.saveTemplate"),
			showDefaultButtons: true,
      cancelText: 'common.cancel',
      confirmText: 'common.save',
      icon: false,
			content: (
				<>
          <Box className={clsx(classes.mt15, classes.mb15)}>
            <Typography className={clsx(classes.mb5, classes.f18)}>{t('common.templateName')}</Typography>
            <TextField
              variant='outlined'
              size='small'
              value={saveTemplateDetails.templateName}
              onChange={(event) => setSaveTemplateDetails({
                ...saveTemplateDetails,
                templateName: event?.target?.value
              })}
              className={clsx(classes.textField, classes.minWidth252)}
              placeholder={t('common.templateName')}
            />
            <Box className='textBoxWrapper'>
              <Typography className={clsx(errors.templateName ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
                {errors.templateName ?? errors.templateName}
              </Typography>
            </Box>
          </Box>
          <Box className={clsx(classes.mt15, classes.mb15)}>
            <Typography className={clsx(classes.mb5, classes.f18)}>{t('common.CategoryName')}</Typography>
            <TextField
              variant='outlined'
              size='small'
              value={saveTemplateDetails.categoryName}
              onChange={(event) => setSaveTemplateDetails({
                ...saveTemplateDetails,
                categoryName: event?.target?.value
              })}
              className={clsx(classes.textField, classes.minWidth252)}
              placeholder={t('common.CategoryName')}
            />
          </Box>
        </>
			),
			onConfirm: async () => {
        if (!saveTemplateDetails.templateName.trim()) setErrors({ ...errors, templateName: t('common.templateNameIsRequired') });
        else {
          setErrors({ ...errors, templateName: '' });
          saveTemplate();
        }
			},
      onClose: () => {
        setErrors({ ...errors, templateName: '' });
        setDialogType(null);
      },
      onCancel: () => {
        setErrors({ ...errors, templateName: '' });
        setDialogType(null);
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

  const renderTemplateConfirmationDialog = (newTemplate) => {
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

  const renderGenericDialog = (message) => {
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
		} else if (type === DialogType.SAVE_TEMPLATE) {
      currentDialog = renderSaveTemplateDialog();
    } else if (type === DialogType.LOGOUT) {
      currentDialog = logoutDialog();
    } else if (type === DialogType.EXIT) {
      currentDialog = exitDialog();
    } else if (type === DialogType.DELETE) {
      currentDialog = deleteDialog();
    } else if (type === DialogType.RENDER_TEMPLATE_CONFIRMATION) {
      currentDialog = renderTemplateConfirmationDialog(data);
    } else if (type === DialogType.NO_CREDITS_LEFT) {
      currentDialog = renderNoCreditLeftDialog(data);
    } else if (type === DialogType.GENERIC) {
      currentDialog = renderGenericDialog(data);
    }

    if (type) {
      return (
        dialogType && <BaseDialog
          classes={classes}
          open={dialogType}
          childrenStyle={classes.mb25}
          onClose={() => setDialogType(null)}
          onCancel={() => setDialogType(null)}
          {...currentDialog}>
          {currentDialog.content}
        </BaseDialog>
      )
    }
    return <></>
  }

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
      <ResponseModal
        classes={classes}
        isOpen={dialog && isResponseModal}
        onClose={handleCloseReponse}
        onConfirm={handleCloseReponse}
        summaryData={summaryData}
        message={dialog}
      />
      <Box className={classes.containerFullHeight}>
        <div id="page-bee-plugin-container" className={classes.containerFullHeight}></div>
      </Box>
      <WizardActions
        disabled={buttonDisabled}
        campaignId={moduleId}
        ignorePaddingBottom={true}
        innerStyle={{ paddingInline: 15}}
        classes={classes}
        onExit={!isFromAutomation && onExit}
        onBack={
          fromLink?.toLowerCase() !== 'autoresponder' && {
            callback: () => { onBack() },
            text: t(getBackButtonText())
          }
        }
        onDelete={fromLink?.toLowerCase() !== 'autoresponder' && onDelete}
        // onShowGallery={() => { setShowGallery(true) }}
        onShowDocuments={() => { setShowDocuments(true) }}
        additionalButtons={renderButtons()}
        additionalButtonsOnStart={renderTemplateButtons()}
        helperText={<label style={{ fontSize: 14 }}>{lastSaveText}</label>}
      />
      {renderDialog()}
      <Loader isOpen={showLoader} showBackdrop={false} />
    </DefaultScreen>
  )
}

export default BeeEditor;
