import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@material-ui/core';
import { BaseDialog } from '../../../../components/DialogTemplates/BaseDialog';

const ConfirmDeleteRowDisplayConditionDialog = ({ onClose, save, args, classes }) => {
  const { t } = useTranslation();

  return (
    <BaseDialog
      classes={classes}
      open={true}
      onClose={onClose}
      onCancel={onClose}
      onConfirm={() => save({ confirmed: true })}
      title={t('campaigns.displayConditions.deleteConfirmation.title')}
      confirmText={'campaigns.displayConditions.deleteConfirmation.confirm'}
      cancelText={'campaigns.displayConditions.deleteConfirmation.cancel'}
    >
      <Box style={{ padding: '8px 0', maxWidth: 420 }}>
        <Typography variant="body2" style={{ marginBottom: 12 }}>
          {t('campaigns.displayConditions.deleteConfirmation.line1')}
        </Typography>
        <Typography variant="body2">
          {t('campaigns.displayConditions.deleteConfirmation.line2')}
        </Typography>
      </Box>
    </BaseDialog>
  );
};

export default ConfirmDeleteRowDisplayConditionDialog;
