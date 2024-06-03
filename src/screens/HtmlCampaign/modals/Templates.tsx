import { useEffect, useRef, useState } from 'react';
import clsx from "clsx";
import { Box, Tab, Grid, Tabs, Typography, Button, Tooltip } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import "moment/locale/he";
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import TemplatePreview from './TemplatePreview'
import { Loader } from '../../../components/Loader/Loader';
import { convertHyphensToword } from '../../../helpers/Utils/common';
import { useDispatch, useSelector } from 'react-redux';
import { EmailTemplateType } from '../../../Models/PushNotifications/Enums';
import { MdDelete, MdEdit } from 'react-icons/md';
import DynamicConfirmDialog from '../../../components/DialogTemplates/DynamicConfirmDialog';
import { deleteTemplateById, getAllTemplatesBySubaccountId, updateTemplateMeta } from '../../../redux/reducers/campaignEditorSlice';
import Toast from '../../../components/Toast/Toast.component';
import { apiStatus } from '../../Whatsapp/Constant';
import SaveTemplate from './SaveTemplate';
import { RenderHtml } from '../../../helpers/Utils/HtmlUtils';

const Templates = ({
  classes,
  onClose = () => null,
  isOpen = false,
  isCreateCampaign = false
}: any) => {
  const dispatch = useDispatch()
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [templateList, setTemplateList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [maxTemplatesToShow, setMaxTemplatesToShow] = useState(8);
  const [selectedCategory, setSelectedCategory] = useState<null | string>(null);
  const refScriptCode = useRef<HTMLDivElement>(null);
  const refCategory = useRef<HTMLDivElement>(null);
  const [openPreview, setOpenPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState({});
  const [showLoader, setLoader] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState(0);
  const { publicTemplates, templatesBySubAccount, publicTemplateCategories, templatesBySubAccountCategories } = useSelector(
    (state: { campaignEditor: any }) => state.campaignEditor
  );
  const { windowSize } = useSelector(
    (state: { core: any }) => state.core
  );

  const [displayRemoveTemplateDialog, setDisplayRemoveTemplateDialog] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<any>(null);
  const [displaySaveTemplate, setDisplaySaveTemplate] = useState<boolean>(false);
  const [templateDetails, setTemplateDetails] = useState<{
    ID: number;
    Name?: string,
    Category?: string,
  }>({
    ID: 0,
    Name: '',
    Category: '',
  });

  const handleChange = (event: any, newValue: any) => {
    setTabValue(newValue);
    setTemplateList([]);
    setSelectedCategory(null);
  };

  useEffect(() => {
    const templates = tabValue === 0 ? publicTemplates : templatesBySubAccount;
    setTemplateList(templates);
    const categories = tabValue === 0 ? publicTemplateCategories : templatesBySubAccountCategories;
    setCategoryList(categories);
    setSelectedCategory(categories?.length > 0 ? categories[0] : '');
    setLoader(false);

    resizeWindow();
  }, [publicTemplates, templatesBySubAccount, tabValue]);

  useEffect(() => {
    if (tabValue === 0 && selectedCategory === '') {
      setTemplateList(publicTemplates.slice(0, maxTemplatesToShow));
    } else {
      const templates = tabValue === 0 ? publicTemplates : templatesBySubAccount;
      setTemplateList(templates);
    }
  }, [maxTemplatesToShow, selectedCategory]);

  useEffect(() => {
    if (!publicTemplates.length) setLoader(true);
    setTimeout(() => {
      resizeWindow();
    }, 1000);
  }, []);

  const resizeWindow = () => {
    const height = (document.querySelector('.bee-templates') as HTMLElement)?.offsetHeight - 160;
    if (refScriptCode.current !== null) {
      refScriptCode.current.style['maxHeight'] = `${height}px`;
      refScriptCode.current.style['height'] = `${height}px`;
      refScriptCode.current.style['overflow'] = 'scroll';
    }
    if (refCategory.current !== null) {
      refCategory.current.style['maxHeight'] = `${height + 60}px`;
      refCategory.current.style['height'] = `${height + 60}px`;
      refCategory.current.style['overflow'] = 'scroll';
    }
  }

  const template = (templateDetails: any, selectedCategory: string) => {
    return (
      <Grid style={{ paddingBottom: '15x' }} key={selectedCategory + '_' + templateDetails.ID} item xs={12} sm={6} md={3} className={clsx(classes.ps15, classes.pe15, classes.pb10, 'template-item', classes.posRelative)} onClick={(event: any) => event.target instanceof HTMLDivElement && setSelectedTemplateId(templateDetails.ID)}>
        {
          tabValue === EmailTemplateType.MY_TEMPLATES && (
            <Box className={classes.removeTemplateItem}>
              <Tooltip title={t('common.Edit')}>
                <MdEdit onClick={() => {
                  setTemplateDetails({
                    ID: templateDetails.ID,
                    Name: templateDetails.Name,
                    Category: templateDetails.Category,
                  });
                  setDisplaySaveTemplate(true);
                }} />
              </Tooltip>
              <Tooltip title={t('common.Delete')}>
                <MdDelete onClick={() => {
                  setDisplayRemoveTemplateDialog(true);
                  setTemplateDetails({ ID: templateDetails.ID });
                }} />
              </Tooltip>
            </Box>
          )
        }
        <Box className={clsx(classes.templateItem, selectedTemplateId === templateDetails.ID ? 'selected' : '')} style={{ 
          overflowY: 'auto', direction: 'ltr' }}>
          {
            tabValue === EmailTemplateType.PULSEEM_TEMPLATES && <img src={decodeURIComponent(templateDetails?.ThumbnailUrl)}
              style={{
                width: '100%',
                height: 'auto',
                overflowY: 'auto'
              }}
              alt={templateDetails.Name}
              title={templateDetails.Name} />
          }
          {
            tabValue === EmailTemplateType.MY_TEMPLATES && <Box
              style={{
                width: '100%',
                height: 'auto',
                overflowY: 'auto'
              }}
              title={templateDetails.Name}>
              {RenderHtml(templateDetails.Html)}
            </Box>
          }
        </Box>
        <div id='name' className={clsx(classes.textCenter, classes.pt10, classes.f14, classes.elipsis, classes.mb5)}>{convertHyphensToword(templateDetails.Name)}</div>
        <div id='buttons' className={clsx(classes.textCenter)}>
          <Button
            className={clsx(
              classes.p5,
              classes.btn,
              classes.btnRounded,
              classes.textCapitalize,
              classes.mt1,
              'preview-btn'
            )}
            onClick={() => {
              setSelectedTemplate(templateDetails);
              setOpenPreview(true);
            }}
          >
            <Typography
              className={clsx(classes.dBlock, classes.f12)}
            >
              {t('common.Preview')}
            </Typography>
          </Button>

          <Button
            className={clsx(
              classes.btn,
              classes.btnRounded,
              classes.ml5,
              classes.p5,
              classes.textCapitalize,
              classes.mt1
            )}
            onClick={() => {
              onClose(templateDetails)
            }}
          >
            <Typography
              className={clsx(classes.dBlock, classes.f14)}
            >
              {t(`common.${isCreateCampaign ? 'selectTemplate' : 'loadTemplate'}`)}
            </Typography>
          </Button>
        </div>
      </Grid>
    )
  }

  const deleteTemplate = async () => {
    setLoader(true);
    setDisplayRemoveTemplateDialog(false);
    // @ts-ignore
    const { payload: { Message } } = await dispatch(deleteTemplateById(templateDetails.ID));
    setToastMessage({
      // @ts-ignore
      severity: Message === apiStatus.SUCCESS ? 'success' : 'error',
      color: Message === apiStatus.SUCCESS ? 'success' : 'error',
      message: t(Message === apiStatus.SUCCESS ? 'whatsappCampaign.deleteTemplate' : 'client.errors.somethingWentWrong'),
      showAnimtionCheck: false
    });
    dispatch(getAllTemplatesBySubaccountId());
    setLoader(false);
  }

  const renderToast = () => {
    if (toastMessage) {
      setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return (
        <Toast data={toastMessage} />
      );
    }
    return null;
  }

  const updateTemplate = async (name: string, category: string) => {
    // @ts-ignore
    const response: any = await dispatch(updateTemplateMeta({
      ID: templateDetails.ID,
      Name: name,
      Category: category
    }));
    setToastMessage({
      severity: response.payload.StatusCode === 201 ? 'success' : 'error',
      color: response.payload.Message === apiStatus.SUCCESS ? 'success' : 'error',
      message: 'Updated',
      showAnimtionCheck: false
    });
    dispatch(getAllTemplatesBySubaccountId());
  }

  return <BaseDialog
    classes={classes}
    customContainerStyle={classes.beeTemplate}
    contentStyle={classes.beeTemplate}
    open={isOpen}
    showDivider={false}
    onClose={onClose}
    onCancel={onClose}
    onConfirm={onClose}
    reduceTitle
    showDefaultButtons={false}
    exitButton={true}
    maxHeight={windowSize !== 'lg' && windowSize !== 'xl' ? '90vh' : '80vh'}
    className='bee-templates'>
    <Box className={clsx(classes.templateModal)}>
      {/* {windowSize} */}
      <Grid container style={{ width: '100%' }}>
        <Grid item xs={12} sm={4} md={2} ref={refCategory} className='category-container'>
          {
            categoryList?.length > 0 && (
              <Typography
                className={clsx(classes.dBlock, classes.pb10, classes.f16, selectedCategory === '' ? classes.bold : '', classes.cursorPointer)}
                onClick={() => {
                  setMaxTemplatesToShow(8);
                  setSelectedCategory('')
                }}
              >
                {t('common.all')}
              </Typography>
            )
          }
          {
            categoryList?.map((category): any => {
              return <Typography
                key={category}
                className={clsx(classes.dBlock, classes.pb10, classes.f16, selectedCategory === category ? classes.bold : '', classes.cursorPointer)}
                onClick={() => setSelectedCategory(category)}
              >
                {convertHyphensToword(category)}
              </Typography>
            })
          }
        </Grid>
        <Grid item xs={12} sm={8} md={10} className='template-container'>
          <Tabs
            value={tabValue}
            onChange={handleChange}
            className={clsx(classes.mr15, classes.ml15)}
            classes={{ indicator: classes.hideIndicator }}
          >
            <Tab value={EmailTemplateType.PULSEEM_TEMPLATES} label={t('common.pulseemTemplates')} classes={{ root: classes.tabText, selected: classes.activeTab }} />
            <Tab value={EmailTemplateType.MY_TEMPLATES} label={t('common.myTemplates')} classes={{ root: classes.tabText, selected: classes.activeTab }} />
          </Tabs>
          <Box className={classes.pt15}>
            {
              templateList?.length === 0 && !showLoader && (
                <div className={clsx(classes.textCenter, classes.f18, classes.pbt10, classes.dBlock)}>
                  {t('common.noTemplate')}
                </div>
              )
            }
            <Grid container ref={refScriptCode}>
              {
                templateList?.map((templ, i): any => {
                  const catList = templ['CategoryList'];
                  //@ts-ignore
                  const exists = catList?.filter((t: string) => { return t === selectedCategory });
                  if (selectedCategory !== '' && exists?.length > 0) return template(templ, 'category');
                  if (selectedCategory === '') return template(templ, 'all');
                })
              }
              {
                selectedCategory === '' && tabValue === 0 && maxTemplatesToShow < publicTemplates.length && (
                  <Grid item md={12}>
                    <Box className={clsx(classes.textCenter, classes.pt15)}>
                      <Button
                        className={clsx(
                          classes.btn,
                          classes.btnRounded,
                          classes.actionButton,
                          classes.textCapitalize,
                          classes.paddingSides25
                        )}
                        onClick={() => setMaxTemplatesToShow(maxTemplatesToShow + 8)}
                      >
                        <Typography
                          className={clsx(classes.dBlock, classes.f14)}
                        >
                          {t('common.loadMore')}
                        </Typography>
                      </Button>
                    </Box>
                  </Grid>
                )
              }
            </Grid>
          </Box>
        </Grid>
      </Grid>
      <TemplatePreview
        classes={classes}
        onClose={(template: any) => {
          setOpenPreview(false);
          if (template !== undefined) onClose(template);
        }}
        isOpen={openPreview}
        templateDetails={selectedTemplate}
        isMyTemplate={tabValue}
      />
      <Loader isOpen={showLoader} showBackdrop={false} />
      <DynamicConfirmDialog
        classes={classes}
        isOpen={displayRemoveTemplateDialog}
        title={t('common.DeleteTemplate')}
        text={t('common.DeleteTemplateConfirm')}
        onConfirm={deleteTemplate}
        onClose={() => setDisplayRemoveTemplateDialog(false)}
        onCancel={() => setDisplayRemoveTemplateDialog(false)}
        confirmButtonText={t('common.Yes')}
        cancelButtonText={t('common.No')}
      />
      <SaveTemplate
        classes={classes}
        onClose={(resp: any) => {
          setDisplaySaveTemplate(false);
          if (resp !== undefined) updateTemplate(resp?.name, resp?.category);
        }}
        isOpen={displaySaveTemplate}
        name={templateDetails.Name}
        categoryName={templateDetails.Category}
        categoryList={templateDetails.Category?.split(',')}
      />
      {renderToast()}
    </Box>
  </BaseDialog>
}

export default Templates;
