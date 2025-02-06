import clsx from 'clsx';
import { useTranslation } from 'react-i18next'
import { Box, Button, Grid, TextField, Typography } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toastProps } from '../Whatsapp/Editor/Types/WhatsappCreator.types';
import { resetToastData } from '../Whatsapp/Constant';
import Toast from '../../components/Toast/Toast.component';
import { Loader } from '../../components/Loader/Loader';
import DefaultScreen from '../DefaultScreen';
import { Title } from '../../components/managment/Title';
import { createAutomation, getAutomationTemplates } from '../../redux/reducers/automationsSlice';
import { AutomationTemplate } from '../../Models/Automations/Automation';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { pulseemNewTab } from '../../helpers/Functions/functions';
import { URLS } from '../../config/enum';
import { BaseDialog } from '../../components/DialogTemplates/BaseDialog';

const CreateAutomationTemplate = ({ classes }: any) => {
  const { windowSize, isRTL } = useSelector((state: any) => state.core);
  const { automationTemplates } = useSelector((state: any) => state.automations);
  const { ToastMessages } = useSelector((state: any) => state.client);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [ showLoader, setShowLoader ] = useState<boolean>(true);
  const [ toastMessage, setToastMessage ] = useState<toastProps['SUCCESS']>(resetToastData);
  const [ errors, setErrors ] = useState({
    automationName: ""
  });
  const [ selectedTemplate, setSelectedTemplate ] = useState<number>(0);
  const [ automationName, setAutomationName ] = useState<string>('');
  const [ search, setSearch ] = useState<string>('');
  const [ searchKeyword, setSearchKeyword ] = useState<string>('');
  const [ dialogType, setDialogType ] = useState<string | null>(null);
  const scratchTemplate = {
    AutomationId: 0,
    Name: t("automations.startFromScratch"),
    Description: t("automations.startFromScratchDesc"),
    NameHe: t("automations.startFromScratch"),
    DescriptionHe: t("automations.startFromScratchDesc"),
    IsActive: true,
    IsDeleted: null,
    CreateDate: ""
  }

  useEffect(() => {
    const init = async () => {
      await dispatch(getAutomationTemplates());
      setShowLoader(false);
    }
    init();
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
    const templateDescription = isRTL ? template.DescriptionHe : template.Description;
    return <Grid item md={4} sm={12} xs={12}>
      <Box
        className={clsx(classes.p10, classes.automationTemplate, classes.cursorPointer)}
        onClick={() => setSelectedTemplate(template.AutomationId)}
      >
        <Box className={clsx(classes.semibold600, classes.f18, classes.colrPrimary)}>{ isRTL ? template.NameHe : template.Name }</Box>
        <Box className={clsx('description', classes.pt10, classes.black)}>{templateDescription.length > 80 ? `${templateDescription.substring(0, 80)}...` : templateDescription}</Box>
        <Box className={clsx(isRTL ? classes.textLeft : classes.textRight)}>
          {
            template.AutomationId > 0 && (
              <Button
                className={clsx(classes.btn, classes.btnRounded, classes.f12, classes.ml5)}
                onClick={() => pulseemNewTab(`${URLS.AutomationTemplatePreview}${template.AutomationId}&Culture=${isRTL ? 'he-IL' : 'en-US'}`)}
              >
                {t('common.Preview')}
              </Button>
            )
          }
          <Button
            className={clsx(classes.btn, classes.btnRounded, classes.f12)}
            onClick={() => {
              setSelectedTemplate(template.AutomationId);
              setDialogType('AddTemplateName');
            }}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
          >
            {t('automations.selectTemplate')}
          </Button>
        </Box>
      </Box>
    </Grid>
  }

  const saveAutomation = async () => {
    let errorsTemp = JSON.parse(JSON.stringify(errors));
    errorsTemp.automationName = automationName === '' ? t('automations.automationNameIsRequired') : '';
    setErrors(errorsTemp);
    
    if (errorsTemp.automationName === '') {
      setDialogType(null);
      setShowLoader(true);
      // @ts-ignore`
      const response = await dispatch(createAutomation({AutomationName: automationName})) as any;
      switch (response?.payload?.StatusCode) {
        case 1:
            setToastMessage({ severity: 'success', color: 'success', message: t('automations.automationcreated'), showAnimtionCheck: false })
            setTimeout(() => {
              window.location.href = `/Pulseem/CreateAutomations.aspx?AutomationID=${response?.payload?.Data?.AutomationID}&TemplateId=${selectedTemplate}&fromreact=true&Culture=${isRTL ? 'he-IL' : 'en-US'}`;
            }, 2000);
          break;

        case 100:
        default:
          setToastMessage(ToastMessages.SOMETHING_WENT_WRONG);
          break;
      }
      setShowLoader(false);
    }
  }

  const renderDialog = () => {
    let currentDialog: any = {};
		if (dialogType === 'AddTemplateName') {
			currentDialog = renderAutomationNameDialog();
    }

    if (dialogType) {
      return (
        dialogType && <BaseDialog
          contentStyle={classes.maxWidth400}
          classes={classes}
          open={dialogType}
          onClose={() => setDialogType(null)}
          onCancel={() => setDialogType(null)}
          {...currentDialog}>
          {currentDialog.content}
        </BaseDialog>
      )
    }
    return <></>
  }

  const renderAutomationNameDialog = () => {
    return {
      title: t('automations.labelAutomationName'),
      showDivider: true,
      content: (
        <Box style={{ maxWidth: 400 }} className={clsx(classes.mb20)}>
					<Typography title={t("automations.labelAutomationName")} className={classes.bold}>
						{t("automations.labelAutomationName")}
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
      ),
      showDefaultButtons: true,
			confirmText: t("common.continue"),
      onClose: () => { setDialogType(null) },
      onConfirm: () => saveAutomation()
    }
  }

  const handleKeyDown = (event: any) => {
    if (event.keyCode === 13 || event.code === 'Enter') {
      setSearchKeyword(search);
    }
  }

  return (
    <DefaultScreen
      currentPage="automations"
      subPage={"create-automations"}
      classes={classes}
      customPadding={true}
      containerClass={clsx(classes.mb50, classes.editorCont)}
    >
      <Box className="head">
        <Title Text={t('automations.selectTemplate')} classes={classes} />
      </Box>
      <Box className={clsx("containerBody", classes.pb25)}>
        <Grid container spacing={2} className={clsx(classes.pb10, classes.pt10)}>
          <Grid item md={4}>
            <TextField
              variant='outlined'
              size='small'
              value={search}
              onKeyPress={handleKeyDown}
              onChange={(event) => setSearch(event.target.value)}
              className={clsx(classes.textField, classes.minWidth252)}
              placeholder={t('automations.searchemplate')}
            />
          </Grid>

          <Grid item>
            <Button
              onClick={() => setSearchKeyword(search)}
              className={clsx(classes.btn, classes.btnRounded)}
              endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}>
              {t('campaigns.btnSearchResource1.Text')}
            </Button>
          </Grid>
          {searchKeyword && <Grid item>
            <Button
              onClick={() => {
                setSearch('');
                setSearchKeyword('');
              }}
              className={clsx(classes.btn, classes.btnRounded)}
              endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}>
              {t('common.clear')}
            </Button>
          </Grid>}
        </Grid>
        <Box className={clsx(classes.pt10)}>
          {
            automationTemplates.length > 0 && (
              <>
                <Grid container className={clsx(classes.pb15)} spacing={3}>
                  {
                    [scratchTemplate, ...automationTemplates].filter((template: AutomationTemplate) => searchKeyword !== '' ? (
                      template.Name.toLowerCase().includes(searchKeyword.toLowerCase()) || 
                      template.NameHe.toLowerCase().includes(searchKeyword.toLowerCase()) || 
                      template.Description.toLowerCase().includes(searchKeyword.toLowerCase()) || 
                      template.DescriptionHe.toLowerCase().includes(searchKeyword.toLowerCase())
                    ) : true).map((template: any) => automationTemplate(template))
                  }
                </Grid>
              </>
            )
          }
        </Box>
      </Box>
      {renderToast()}
      {renderDialog()}
      <Loader isOpen={showLoader} zIndex={9999} />
    </DefaultScreen>
  )
}

export default CreateAutomationTemplate