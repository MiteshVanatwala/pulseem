import { useEffect, useRef, useState } from 'react';
import clsx from "clsx";
import { Box, Tab, Grid, Tabs, Typography, Button } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import "moment/locale/he";
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import TemplatePreview from './TemplatePreview'
import { Loader } from '../../../components/Loader/Loader';
import { convertHyphensToword } from '../../../helpers/Utils/common';
import { useSelector } from 'react-redux';

const Templates = ({
  classes,
  onClose = () => null,
  isOpen = false,
  isCreateCampaign = false
}: any) => {
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

  const handleChange = (event: any, newValue: any) => {
    setTabValue(newValue);
    setTemplateList([]);
    setSelectedCategory(null);
  };

  const renderHtml = (html: any) => {
    function createMarkup() {
      return { __html: html };
    }
    return (
      <label dangerouslySetInnerHTML={createMarkup()}></label>
    );
  }

  useEffect(() => {
    const templates = tabValue === 0 ? publicTemplates : templatesBySubAccount;
    setTemplateList(templates);
    const categories = tabValue === 0 ? publicTemplateCategories : templatesBySubAccountCategories;
    setCategoryList(categories);
    setSelectedCategory(categories?.length > 0 ? categories[0] : '');
    setLoader(false);
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
      const height = (document.querySelector('.MuiPaper-rounded') as HTMLElement)?.offsetHeight - 120;
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
    }, 1000);
  }, []);

  const template = (templateDetails: any, selectedCategory: string) => {
    return (
      <Grid key={selectedCategory + '_' + templateDetails.ID} item xs={6} md={3} className={clsx(classes.ps15, classes.pe15, classes.pb10)} onClick={() => setSelectedTemplateId(templateDetails.ID)}>
        <Box className={clsx(classes.templateItem, selectedTemplateId === templateDetails.ID ? 'selected' : '')}>
          {renderHtml(templateDetails.Html)}
        </Box>
        <div className={clsx(classes.textCenter, classes.pt5, classes.f14, classes.elipsis, classes.mb5)}>{convertHyphensToword(templateDetails.Name)}</div>
        <div className={clsx(classes.textCenter, classes.p5)}>
          <Button
            className={clsx(
              classes.solidDialogButton,
              classes.dialogConfirmBlueButton,
              classes.p5
            )}
            onClick={() => {
              setSelectedTemplate(templateDetails);
              setOpenPreview(true);
            }}
          >
            <Typography    
              className={clsx(classes.dBlock, classes.f14)}
            >
              {t('common.Preview')}
            </Typography>
          </Button>

          <Button
            className={clsx(
              classes.solidDialogButton,
              classes.dialogConfirmButton,
              classes.ml5,
              classes.p5
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
    exitButton={true}>
    <Box className={clsx(classes.templateModal)}>
      <Grid container style={{ width: '100%' }}>
        <Grid item md={2} ref={refCategory}>
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
        <Grid item md={10}>
          <Tabs
            value={tabValue}
            onChange={handleChange}
            className={clsx(classes.mr15, classes.ml15)}
            classes={{ indicator: classes.hideIndicator }}
          >
            <Tab label={t('common.pulseemTemplates')} classes={{ root: classes.tabText, selected: classes.activeTab }} />
            <Tab label={t('common.myTemplates')} classes={{ root: classes.tabText, selected: classes.activeTab }} />
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
                  if (selectedCategory !== '' && selectedCategory === templ['Category']) return template(templ, 'category');
                  if (selectedCategory === '') return template(templ, 'all');
                })
              }
              {
                selectedCategory === '' && tabValue === 0 && maxTemplatesToShow < publicTemplates.length && (
                  <Grid item md={12}>
                    <Box className={clsx(classes.textCenter, classes.pt15)}>
                      <Button
                        className={clsx(
                          classes.actionButton,
                          classes.actionButtonLightBlue,
                          classes.paddingSides25
                        )}
                        onClick={() => setMaxTemplatesToShow(maxTemplatesToShow + 8)}
                      >
                        <Typography    
                          className={clsx(classes.dBlock, classes.f18)}
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
      />
      <Loader isOpen={showLoader} showBackdrop={false} />
    </Box>
  </BaseDialog>
}

export default Templates;
