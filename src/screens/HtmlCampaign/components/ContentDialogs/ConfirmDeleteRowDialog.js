import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@material-ui/core';
import { BaseDialog } from '../../../../components/DialogTemplates/BaseDialog';

const ConfirmDeleteRowDialog = ({ onClose, save, args, classes }) => {
  const { t } = useTranslation();

  return (
    <BaseDialog
      classes={classes}
      open={true}
      onClose={onClose}
      onCancel={onClose}
      onConfirm={() => save({ confirmed: true })}
      title={t('campaigns.deleteRowConfirmation.title')}
      confirmText={'campaigns.deleteRowConfirmation.confirm'}
      cancelText={'campaigns.deleteRowConfirmation.cancel'}
    >
      <Typography variant="body2" style={{ padding: '8px 0', maxWidth: 380 }}>
        {t('campaigns.deleteRowConfirmation.message')}
      </Typography>
    </BaseDialog>
  );
};

export default ConfirmDeleteRowDialog;
