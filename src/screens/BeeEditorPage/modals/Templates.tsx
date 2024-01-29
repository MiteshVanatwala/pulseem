import { useEffect, useRef, useState } from 'react';
import clsx from "clsx";
import { Box, Tab, Grid, Tabs, Typography, Button } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import "moment/locale/he";
import TemplatePreview from './TemplatePreview'
import { Loader } from '../../../components/Loader/Loader';
import { convertHyphensToword } from '../../../helpers/Utils/common';
import { useSelector } from 'react-redux';
import { TemplateModel } from '../../../Models/LandingPage/Templates';

const Templates = ({
  classes,
  onClose = () => null,
  isCreateLandingPage = false
}: TemplateModel) => {
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
  const [showLoader, setLoader] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(0);
  const { publicTemplates, templatesBySubAccount, publicTemplateCategories, templatesBySubAccountCategories } = useSelector(
    (state: { landingPages: any }) => state.landingPages
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
    // if (!publicTemplates.length) setLoader(true);
    setTimeout(() => {
      resizeWindow();
    }, 1000);
  }, []);

  const resizeWindow = () => {
    const height = window.innerHeight * 0.5;
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
      <Grid key={selectedCategory + '_' + templateDetails.ID} item xs={12} sm={6} md={3} className={clsx(classes.ps15, classes.pe15, classes.pb10, 'template-item')} onClick={() => setSelectedTemplateId(templateDetails.ID)}>
        <Box className={clsx(classes.templateItem, selectedTemplateId === templateDetails.ID ? 'selected' : '')}>
          {renderHtml(templateDetails.Html)}
        </Box>
        <div id='name' className={clsx(classes.textCenter, classes.pt10, classes.f14, classes.elipsis, classes.mb5)}>{convertHyphensToword(templateDetails.Name)}</div>
        <div id='buttons' className={clsx(classes.textCenter, classes.pb25)}>
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
              {t(`common.${isCreateLandingPage ? 'selectTemplate' : 'loadTemplate'}`)}
            </Typography>
          </Button>
        </div>
      </Grid>
    )
  }

  return <div className='bee-templates'>
    <Box className={clsx(classes.templateModal)}>
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
                    <Box className={clsx(classes.textCenter, classes.pb15)}>
                      <Button
                        className={clsx(
                          classes.btn,
                          classes.btnRounded,
                          classes.paddingSides25
                        )}
                        onClick={() => setMaxTemplatesToShow(maxTemplatesToShow + 8)}
                      >
                        {t('common.loadMore')}
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
  </div>
}

export default Templates;
