import React, { useState, useRef, useEffect } from 'react';
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
  const [copyFailed, setCopyFailed] = useState(false);

  // The dialog stays mounted between openings, so a failure from last time would
  // still be on screen the next time it is opened.
  useEffect(() => {
    if (open) { setCopyFailed(false); setCopied(false); }
  }, [open]);

  // MUI spreads onClick onto the TextField root, so the handler fires for the
  // padding and the outlined border too, where e.target is a div/fieldset with no
  // .select(). Holding the input itself means a click anywhere in the field selects
  // the whole snippet, which is the point of it.
  const snippetRef = useRef<HTMLTextAreaElement | null>(null);

  const siteId = widgetId || 'YOUR_SITE_ID';

  // Environment-driven so a stage build hands out the stage bundle. Hardcoding
  // this meant stage widgets loaded production JS against the stage API.
  const scriptSrc = `${widgetCdnURL}/pulseem.js`;

  // The widget id rides in the query string, which pulseem.js reads off its own
  // <script> tag. Keep it a single external <script>: inline JavaScript is blocked
  // by a strict Content-Security-Policy on the customer's site, where the widget
  // then never appears and says nothing about why.
  const snippet = `<script async src="${scriptSrc}?id=${siteId}"></script>`;

  // navigator.clipboard exists only in a secure context, so it is undefined when the
  // dashboard is served over plain http — reading .writeText off it threw and took
  // the dialog with it. Selecting the field and using execCommand still works there,
  // and if even that fails the snippet is left selected so Ctrl+C is one key away.
  const copySnippet = async (): Promise<boolean> => {
    try {
      if (window.isSecureContext && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(snippet);
        return true;
      }
    } catch {
      // Denied or unavailable — fall through to the selection-based path.
    }
    const field = snippetRef.current;
    if (!field) return false;
    field.select();
    try {
      return document.execCommand('copy');
    } catch {
      return false;
    }
  };

  const handleCopy = async () => {
    const copied = await copySnippet();
    // A failed copy must not close the dialog: the snippet is selected and the
    // visitor can still copy it by hand, which is impossible once it is gone.
    if (!copied) {
      setCopyFailed(true);
      return;
    }
    setCopied(true);
    // Leave the confirmation on screen briefly before closing, so the copy is
    // visibly acknowledged — this dialog has no toast of its own.
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 900);
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
          inputRef={snippetRef}
          onClick={() => snippetRef.current?.select()}
        />
        {copyFailed && (
          <Typography variant="caption" color="error" style={{ display: 'block', marginTop: 8 }}>
            {t(
              'common.widget_embed_copy_failed',
              'Your browser blocked the copy. The code is selected — press Ctrl+C to copy it.',
            )}
          </Typography>
        )}
      </Box>
    </BaseDialog>
  );
};

export default EmbedCodeGenerator;
