import React from 'react'
import { useTranslation } from "react-i18next";
import { Box, TextField, Typography } from '@material-ui/core'
import clsx from 'clsx';
import { BaseDialog } from '../../../../../components/DialogTemplates/BaseDialog';

const EditRow = ({ onClose, save, args, classes }) => {
  const { t } = useTranslation();
  const [text, setText] = React.useState(args?.row?.name)
  const [tags, setTags] = React.useState(args?.row?.metadata?.tags);

  const onHandleSave = React.useCallback(() => {
    save({
      success: true,
      name: text,
      tags: tags
    })
  }, [text, tags, save])

  const handleTextChange = React.useCallback((event) => {
    setText(event?.target?.value)
  }, [])
  const handleTagChange = React.useCallback((event) => {
    setTags(event?.target?.value.replace(', ', ',').replace(' ', '-'))
  }, [])

  return (
    <>
      <BaseDialog
        classes={classes}
        key={123}
        disableBackdropClick={true}
        open={true}
        title={t("common.createOrEdit")}
        cancelText='common.cancel'
        confirmText='common.save'
        showDefaultButtons={true}
        onConfirm={onHandleSave}
        onClose={onClose}
        children={
          <>
            <Box className={clsx(classes.mt15, classes.mb15)}>
              <Typography className={clsx(classes.mb5, classes.f18)}>{t('common.rowName')}</Typography>
              <TextField
                variant='outlined'
                size='small'
                value={text}
                onChange={handleTextChange}
                className={clsx(classes.textField, classes.minWidth252)}
                placeholder={t('common.rowName')}
              />
            </Box>
            <Box className={clsx(classes.mt15, classes.mb15)}>
              <Typography className={clsx(classes.mb5, classes.f18)}>{t('common.tags')}</Typography>
              <TextField
                variant='outlined'
                size='small'
                value={tags}
                onChange={handleTagChange}
                className={clsx(classes.textField, classes.minWidth252)}
                placeholder={t('common.tags')}
              />
            </Box>
          </>
        }
      >
      </BaseDialog>
    </>
  )
}

export default EditRow
