import { useEffect, useRef, useState } from 'react';
import clsx from "clsx";
import { Box } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import "moment/locale/he";
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';

const TemplatePreview = ({
  classes,
  isOpen = false,
  templateDetails = {},
  onClose = () => null
}: any) => {
  const { t } = useTranslation();
  const renderHtml = (html: any) => {
    function createMarkup() {
      return { __html: html };
    }
    return (
      <label dangerouslySetInnerHTML={createMarkup()}></label>
    );
  }

  return <BaseDialog
    classes={classes}
    customContainerStyle={classes.beeTemplate}
    contentStyle={classes.beeTemplate}
    open={isOpen}
    showDivider={true}
    onConfirm={() => {
      onClose(templateDetails);
    }}
    onClose={onClose}
    onCancel={onClose}
    reduceTitle
    showDefaultButtons={true}
    title={t('common.Preview')}
    confirmText={t('common.loadTemplate')}
  >
    <Box className={clsx(classes.templateModal)}>
      {renderHtml(templateDetails.Html)}
    </Box>
  </BaseDialog>
}

export default TemplatePreview;
