import clsx from 'clsx';
import { useTranslation } from 'react-i18next'
import { Box, Button, Grid, TextField, Typography } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { toastProps } from '../Whatsapp/Editor/Types/WhatsappCreator.types';
import { resetToastData } from '../Whatsapp/Constant';
import Toast from '../../components/Toast/Toast.component';
import { Loader } from '../../components/Loader/Loader';
import DefaultScreen from '../DefaultScreen';
import { Title } from '../../components/managment/Title';
import { getAutomationTemplates } from '../../redux/reducers/automationsSlice';
import { AutomationTemplate } from '../../Models/Automations/Automation';
import { BiSave } from 'react-icons/bi';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';

const CreateAutomationTemplate = ({ classes }: any) => {
  const navigate = useNavigate();
  const { language, windowSize, isRTL } = useSelector((state: any) => state.core);
  const { automationTemplates } = useSelector((state: any) => state.automations)
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [ showLoader, setShowLoader ] = useState<boolean>(true);
  const [ toastMessage, setToastMessage ] = useState<toastProps['SUCCESS']>(resetToastData);
  const [ errors, setErrors ] = useState({
    automationName: "",
    selectedTemplate: ""
  });
  const [ selectedTemplate, setSelectedTemplate ] = useState<number>(0);
  const [ automationName, setAutomationName ] = useState<string>('');
  moment.locale(language);

  useEffect(() => {
    setShowLoader(false);
    dispatch(getAutomationTemplates());
  }, [])

  const renderToast = () => {
		if (toastMessage.message?.length > 0) {
			setTimeout(() => {
				setToastMessage(resetToastData);
			}, 4000);
			return <Toast data={toastMessage} />;
		}
		return null;
	};

  const automationTemplate = (template: AutomationTemplate) => {
    return <Grid item md={4} sm={12} xs={12}>
      <Box className={clsx(classes.p10, classes.automationTemplate, classes.cursorPointer, template.AutomationId === selectedTemplate ? 'active': '')} onClick={() => setSelectedTemplate(template.AutomationId)}>
        <Box className={clsx(classes.semibold600, classes.f18, classes.colrPrimary)}>{template.Name}</Box>
        <Box className={clsx(classes.pt15, classes.black)}>{template.Description}</Box>
      </Box>
    </Grid>
  }

  const saveAutomation = () => {
    let errorsTemp = JSON.parse(JSON.stringify(errors));
    errorsTemp.automationName = automationName === '' ? t('automations.automationNameIsRequired') : '';
    errorsTemp.selectedTemplate = selectedTemplate === 0 ? t('automations.automationNameIsRequired') : '';
    setErrors(errorsTemp);
    
    if (errorsTemp.automationName === '' && errorsTemp.selectedTemplate === '') {

    }
  }

  return (
    <DefaultScreen
      currentPage="newsletter"
      subPage={"newsletterInfo"}
      classes={classes}
      customPadding={true}
      containerClass={clsx(classes.mb50, classes.editorCont)}
    >
      <Box className="head">
        <Title Text={t('automations.createResource.Text')} classes={classes} />
      </Box>
      <Box className={clsx("containerBody", classes.pb25)}>
        <Box>
          <Typography title={t("automations.labelAutomationName")} className={clsx(classes.alignDir, classes.pb5, classes.bold, classes.f18)}>
            {t("automations.labelAutomationName")}
            <label className={clsx(classes.ml10, classes.textRed)}>*</label>
          </Typography>
          <TextField
            id="automationName"
            label=""
            variant="outlined"
            name="Name"
            value={automationName}
            className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, { [classes.textFieldError]: !!errors.automationName })}
            autoComplete="off"
            onChange={(event: any) => setAutomationName(event.target.value)}
            error={!!errors.automationName}
            style={{ width: windowSize !== 'xs' ? "400px": '100%' }}
          />
          <Box className='textBoxWrapper'>
            <Typography className={clsx(errors.automationName ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
              {errors.automationName ?? errors.automationName}
            </Typography>
          </Box>
        </Box>
        <Box className={clsx(classes.pt30)}>
          {
            automationTemplates.length > 0 && (
              <>
                <Typography title={t("automations.selectTemplate")} className={clsx(classes.alignDir, classes.pb15, classes.bold, classes.f18)}>
                  {t("automations.selectTemplate")}
                  <label className={clsx(classes.ml10, classes.textRed)}>*</label>
                  <Typography className={clsx(errors.selectedTemplate ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
                    {errors.selectedTemplate ?? errors.selectedTemplate}
                  </Typography>
                </Typography>
                <Grid container className={clsx(classes.pb15)} spacing={3}>
                  {
                    automationTemplates.map((template: any) => automationTemplate(template))
                  }
                </Grid>
              </>
            )
          }
        </Box>

        <Box
          className={clsx(
            classes.pt50, { 
              [classes.flexJustifyCenter]: windowSize === 'xs', 
              [classes.flexWrap]: windowSize === 'xs', 
              [classes.textRight]: !isRTL,
              [classes.textLeft]: isRTL
          })}>
          {/* @ts-ignore */}
          <Button
              onClick={saveAutomation}
              className={clsx(
                  classes.btn,
                  classes.btnRounded,
                  classes.backButton,
                  {
                    [classes.w100]: windowSize === 'xs'
                  }
              )}
              style={{ margin: '8px' }}
              startIcon={<BiSave />}
              endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
            >{t("common.continue")}
          </Button>
        </Box>
      </Box>
      {renderToast()}
      <Loader isOpen={showLoader} zIndex={9999} />
    </DefaultScreen>
  )
}

export default CreateAutomationTemplate