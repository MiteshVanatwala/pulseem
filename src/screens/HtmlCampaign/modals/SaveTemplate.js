import React, { useEffect, useState } from 'react'
import { useTranslation } from "react-i18next";
import { Box, Chip, TextField, Typography } from '@material-ui/core'
import clsx from 'clsx';
import Toast from '../../../components/Toast/Toast.component';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import { Autocomplete } from '@mui/material';

const SaveTemplate = ({ onClose, isOpen, classes, name = '', categoryName = '', categoryList = [] }) => {
  const { t } = useTranslation();
  const [templateName, setTemplateName] = useState(name)
  const [category, setCategory] = useState(categoryName);
  const [toastMessage, setToastMessage] = useState(null);
  const [templateCategories, setTemplateCategories] = useState([]);

  useEffect(() => {
    setTemplateName(name);
  }, [name]);

  useEffect(() => {
    setCategory(categoryName);
    setTemplateCategories(categoryList);
  }, [categoryName]);

  const onHandleSave = () => {
    if (templateName.trim() === '') setToastMessage({ severity: 'error', color: 'error', message: t('common.templateNameIsRequired'), showAnimtionCheck: false });
    else {
      onClose({
        name: templateName,
        category: templateCategories.join(',')
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

  const onUpdate = (value) => {
    const newArr = [...templateCategories];
    newArr.push(value);
    setTemplateCategories(newArr);
    setCategory(newArr.join(','));
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
              {/* <TextField
                variant='outlined'
                size='small'
                value={category}
                onChange={(event) => setCategory(event?.target?.value)}
                className={clsx(classes.textField, classes.minWidth252)}
                placeholder={t('common.CategoryName')}
              /> */}
              <Box>
                <Autocomplete
                  clearIcon={false}
                  options={[]}
                  freeSolo
                  multiple
                  key={templateCategories}
                  value={templateCategories || ''}
                  // @ts-ignore
                  onBlur={(event) => {
                    if (event.target.value !== '' && event.target.value.trim() !== '') {
                      onUpdate(event.target.value);
                    }
                  }}
                  onChange={(event, value, reason) => {
                    if (reason === 'createOption') {
                      if (value[0].trim() !== '') {
                        onUpdate(event.target.value);
                      }
                    }
                  }}
                  renderTags={(value, props) =>
                    value.map((option, index) => (
                      <Chip label={option} {...props({ index })} className={clsx(classes.MuiChipRoot)} onDelete={() => {
                        const filteredMeta = templateCategories?.filter((m) => { return m !== option });
                        setTemplateCategories(filteredMeta);
                        setCategory(filteredMeta.join(','));
                      }} />
                    ))
                  }
                  renderInput={(params) => <TextField {...params} className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)} />}
                />
              </Box>
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
