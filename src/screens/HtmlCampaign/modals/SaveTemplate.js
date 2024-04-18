import React, { useEffect, useState } from 'react'
import { SolidDialog } from '../../../components/managment/SolidDialog';
import { useTranslation } from "react-i18next";
import { Box, TextField, Typography } from '@material-ui/core'
import clsx from 'clsx';
import Toast from '../../../components/Toast/Toast.component';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';

const SaveTemplate = ({ onClose, isOpen, classes, name = '', categoryName = '' }) => {
  const { t } = useTranslation();
  const [ templateName, setTemplateName ] = useState(name)
  const [ category, setCategory ] = useState(categoryName);
  const [toastMessage, setToastMessage] = useState(null);
  
  useEffect(() => {
    setTemplateName(name);
  }, [ name ]);

  useEffect(() => {
    setCategory(categoryName);
  }, [ categoryName ]);

  const onHandleSave = () => {
    if (templateName.trim() === '') setToastMessage({ severity: 'error', color: 'error', message: t('common.templateNameIsRequired'), showAnimtionCheck: false });
    else {
      onClose({
        name: templateName,
        category: category
      })
    }
  };

  const renderToast = () => {
    if (toastMessage) {
      setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return (
        <Toast data={toastMessage} />
      );
    }
    return null;
  }

  return (
    <>
      <BaseDialog
        classes={classes}
        key={'save-template'}
        disableBackdropClick={true}
        open={isOpen}
        title={t("common.saveTemplate")}
        cancelText='common.cancel'
        confirmText='common.save'
        showDefaultButtons={true}
        onConfirm={onHandleSave}
        onClose={() => onClose()}
        children={
          <>
            <Box className={clsx(classes.mt15, classes.mb15)}>
              <Typography className={clsx(classes.mb5, classes.f18)}>{t('common.templateName')}</Typography>
              <TextField
                variant='outlined'
                size='small'
                value={templateName}
                onChange={(event) => setTemplateName(event?.target?.value)}
                className={clsx(classes.textField, classes.minWidth252)}
                placeholder={t('common.templateName')}
              />
            </Box>
            <Box className={clsx(classes.mt15, classes.mb15)}>
              <Typography className={clsx(classes.mb5, classes.f18)}>{t('common.CategoryName')}</Typography>
              <TextField
                variant='outlined'
                size='small'
                value={category}
                onChange={(event) => setCategory(event?.target?.value)}
                className={clsx(classes.textField, classes.minWidth252)}
                placeholder={t('common.CategoryName')}
              />
            </Box>
          </>
        }
      >
      </BaseDialog>
      {renderToast()}
    </>
  )
}

export default SaveTemplate
