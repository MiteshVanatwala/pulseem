import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, TextField } from '@material-ui/core';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import { widgetCdnURL } from '../../../config';

interface EmbedCodeGeneratorProps {
  widgetId?: string;
  open: boolean;
  onClose: () => void;
  classes?: any;
}

/**
 * The install snippet, in the same BaseDialog the popup Embed action uses, so both
 * Embed flows in the product look and behave the same way.
 */
const EmbedCodeGenerator: React.FC<EmbedCodeGeneratorProps> = ({ widgetId, open, onClose, classes }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const siteId = widgetId || 'YOUR_SITE_ID';

  // Environment-driven so a stage build hands out the stage bundle. Hardcoding
  // this meant stage widgets loaded production JS against the stage API.
  const scriptSrc = `${widgetCdnURL}/pulseem.js`;

  // The widget id rides in the query string, which pulseem.js reads off its own
  // <script> tag. Keep it a single external <script>: inline JavaScript is blocked
  // by a strict Content-Security-Policy on the customer's site, where the widget
  // then never appears and says nothing about why.
  const snippet = `<script async src="${scriptSrc}?id=${siteId}"></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true);
      // Leave the confirmation on screen briefly before closing, so the copy is
      // visibly acknowledged — this dialog has no toast of its own.
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 900);
    });
  };

  return (
    <BaseDialog
      open={open}
      classes={classes}
      title={t('common.widget_embed', 'Embed')}
      showDivider={false}
      confirmText={copied ? t('common.widget_copied', 'Copied') : t('notifications.copy', 'Copy')}
      cancelText={t('common.Cancel', 'Cancel')}
      onClose={onClose}
      onCancel={onClose}
      onConfirm={handleCopy}
    >
      <Box>
        <Typography style={{ fontSize: 16, marginBottom: 16 }}>
          {t('common.widget_embed_message', 'Copy and paste this code into your website:')}
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          value={snippet}
          InputProps={{ readOnly: true }}
          onClick={(e: any) => e.target.select()}
        />
      </Box>
    </BaseDialog>
  );
};

export default EmbedCodeGenerator;
