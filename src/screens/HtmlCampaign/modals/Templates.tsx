import { useEffect, useRef, useState } from 'react';
import clsx from "clsx";
import { Box, Tab, Grid, Tabs, Typography, Button } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import "moment/locale/he";
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import { convertHyphensToword, getUniqueValuesOfKey } from '../../../helpers/utils';
import TemplatePreview from './TemplatePreview'
import { Loader } from '../../../components/Loader/Loader';
import { useSelector } from 'react-redux';

const Templates = ({
  classes,
  onClose = () => null,
  isOpen = false
}: any) => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const handleChange = (event: any, newValue: any) => {
    setTabValue(newValue);
  };
  const [ templateList, setTemplateList ] = useState([]);
  const [ categoryList, setCategoryList ] = useState([]);
  const [ selectedCategory, setSelectedCategory ] = useState('');
  const refScriptCode = useRef<HTMLDivElement>(null);
  const refCategory = useRef<HTMLDivElement>(null);
  const [ openPreview, setOpenPreview ] = useState(false);
  const [ selectedTemplate, setSelectedTemplate ] = useState({});
  const [showLoader, setLoader] = useState(true);
  const { publicTemplates, templatesBySubAccount } = useSelector(
    (state: { campaignEditor: any }) => state.campaignEditor
  );

  const renderHtml = (html: any) => {
    function createMarkup() {
      return { __html: html };
    }
    return (
      <label dangerouslySetInnerHTML={createMarkup()}></label>
    );
  }

  // WHY DO WE NEED TO CALCULATE WHEN WE USING RESPONSIVE DESIGN? 
  // useEffect(() => {
  //   setTimeout(() => {
  //     const height = `${(document.querySelector('.MuiPaper-rounded') as HTMLElement)?.offsetHeight - 120}px`;
  //     if (refScriptCode.current !== null) {
  //       refScriptCode.current.style['maxHeight'] = height;
  //       refScriptCode.current.style['height'] = height;
  //       refScriptCode.current.style['overflow'] = 'scroll';
  //     }

  //     if (refCategory.current !== null) {
  //       refCategory.current.style['maxHeight'] = height;
  //       refCategory.current.style['height'] = height;
  //       refCategory.current.style['overflow'] = 'scroll';
  //     }
  //   }, 1000);
  // }, []);

  useEffect(() => {
    setTemplateList(tabValue === 0 ? publicTemplates : templatesBySubAccount)
    setLoader(false)
  }, [ publicTemplates, templatesBySubAccount, tabValue ]);

  useEffect(() => {
    setCategoryList(getUniqueValuesOfKey(templateList, 'Category'));
  }, [templateList]);

  const template = (templateDetails: any) => {
    return (
      <>
        <Grid item xs={6} md={3} className={clsx(classes.ps15, classes.pe15, classes.pb10)} key={templateDetails.ID}>
          <Box className={clsx(classes.templateItem)}>
            {renderHtml(templateDetails.Html)}
          </Box>
          <div className={clsx(classes.textCenter, classes.pt5, classes.f14)}>{convertHyphensToword(templateDetails.Name)}</div>
          <div className={clsx(classes.textCenter, classes.p5)}>
            <Button
              className={clsx(
                classes.solidDialogButton,
                classes.dialogConfirmBlueButton,
                classes.pt0,
                classes.pb0
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
                classes.pt0,
                classes.pb0
              )}
              onClick={() => {
                onClose(templateDetails)
              }}
            >
              <Typography    
                className={clsx(classes.dBlock, classes.f14)}
              >
                {t('common.loadTemplate')}
              </Typography>
            </Button>
          </div>
        </Grid>
      </>
    )
  }

  return <BaseDialog
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
                onClick={() => setSelectedCategory('')}
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
                  if (selectedCategory !== '' && selectedCategory === templ['Category']) return template(templ);
                  if (selectedCategory === '') return template(templ);
                })
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
