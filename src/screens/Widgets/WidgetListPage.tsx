import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Grid, Typography, Box, Button, CircularProgress, TextField,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import LanguageIcon from '@material-ui/icons/Language';
import { FaCommentDots } from 'react-icons/fa';
import clsx from 'clsx';
import DefaultScreen from '../DefaultScreen';
import { BaseDialog } from '../../components/DialogTemplates/BaseDialog';
import { sitePrefix } from '../../config';
import { getAllWidgets, WidgetSummary } from '../../helpers/Api/WidgetAPI';

// Pulseem brand accent — matches palette.primary.main in style/theme.js. The page
// previously used the mockup's orange (#f4511e), which belonged to no palette.
const ACCENT = '#FF1744';
const ACCENT_SOFT = '#fff0f3';

const STATUS_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  active: { label: 'Active', bg: '#dcfce7', color: '#166534' },
  paused: { label: 'Paused', bg: '#fef9c3', color: '#854d0e' },
  draft: { label: 'Draft', bg: '#f3f4f6', color: '#6b7280' },
};

const WidgetCard = ({ widget, onClick }: { widget: WidgetSummary; onClick: () => void }) => {
  const { t } = useTranslation();
  const badge = STATUS_BADGE[widget.status] || STATUS_BADGE.draft;
  return (
    <Box
      p={3}
      bgcolor="#ffffff"
      borderRadius={16}
      boxShadow="0 4px 20px rgba(0,0,0,0.04)"
      border="1px solid #e5e7eb"
      style={{ cursor: 'pointer', transition: 'box-shadow 0.15s ease' }}
      onClick={onClick}
    >
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
        <Box display="flex" alignItems="center">
          <Box
            width={40} height={40} borderRadius={10} bgcolor={ACCENT_SOFT}
            display="flex" alignItems="center" justifyContent="center" mr={1.5}
          >
            <FaCommentDots size={18} color={ACCENT} />
          </Box>
          <Box>
            <Typography style={{ fontWeight: 700, color: '#111827', fontSize: '1.05rem' }}>
              {widget.name || t('common.widget_default_name', 'Chat with us')}
            </Typography>
            <Box display="flex" alignItems="center" mt={0.25}>
              <LanguageIcon style={{ fontSize: 14, color: '#9ca3af', marginRight: 4 }} />
              <Typography variant="caption" style={{ color: '#6b7280' }}>
                {widget.domain || t('common.widget_no_domain', 'No domain set')}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box
          px={1.25} py={0.4} borderRadius={6}
          style={{ backgroundColor: badge.bg, color: badge.color, fontWeight: 600, fontSize: '0.75rem', textTransform: 'capitalize' }}
        >
          {badge.label}
        </Box>
      </Box>
      <Typography variant="body2" color="textSecondary" style={{ wordBreak: 'break-all' }}>
        {widget.websiteUrl || t('common.widget_no_url', 'No website URL set')}
      </Typography>
    </Box>
  );
};

const WidgetListPage = ({ classes }: { classes?: any }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [widgets, setWidgets] = useState<WidgetSummary[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  // The Dashboard's "New Widget" quick action links to /Widgets?action=create so it
  // lands on creating a widget rather than on the list. Consume the parameter once
  // and strip it, otherwise a refresh — or a back-navigation after cancelling —
  // reopens the dialog with no way to dismiss it for good.
  useEffect(() => {
    if (searchParams.get('action') !== 'create') return;
    setCreateOpen(true);
    const rest = new URLSearchParams(searchParams);
    rest.delete('action');
    setSearchParams(rest, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    getAllWidgets()
      .then((data) => { if (!cancelled) setWidgets(data); })
      .catch((err) => { console.error('Failed to load widgets', err); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const openWidget = (widgetId: string) => navigate(`${sitePrefix}Widgets/${widgetId}`);

  const handleCreate = () => {
    const domain = newDomain.trim();
    if (!domain) return;
    setCreateOpen(false);
    setNewDomain('');
    navigate(`${sitePrefix}Widgets/new?domain=${encodeURIComponent(domain)}`);
  };

  return (
    <DefaultScreen
      currentPage="widgets"
      classes={classes}
      containerClass={clsx(classes?.management, classes?.mb50)}
    >
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4} mt={2}>
        <Box>
          <Typography variant="h4" style={{ fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 }}>
            {t('common.widget_chat_widget', 'Chat Widget')}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {t('common.widget_list_subtitle', 'Manage your embeddable chat widgets, one per website domain')}
          </Typography>
        </Box>
        <Button
          className={clsx(classes?.btn, classes?.btnRounded, classes?.redButton)}
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
        >
          {t('common.widget_create_new', 'Create Widget')}
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress />
        </Box>
      ) : widgets.length === 0 ? (
        <Box
          p={6}
          textAlign="center"
          bgcolor="#ffffff"
          borderRadius={16}
          border="1px dashed #d1d5db"
        >
          <FaCommentDots size={40} color="#d1d5db" />
          <Typography variant="h6" style={{ fontWeight: 700, color: '#374151', marginTop: 16, marginBottom: 6 }}>
            {t('common.widget_no_widgets_title', 'No chat widgets yet')}
          </Typography>
          <Typography variant="body2" color="textSecondary" style={{ marginBottom: 20 }}>
            {t('common.widget_no_widgets_subtitle', 'Create your first widget to start chatting with visitors on your website')}
          </Typography>
          <Button
            className={clsx(classes?.btn, classes?.btnRounded, classes?.redButton)}
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
          >
            {t('common.widget_create_new', 'Create Widget')}
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {widgets.map((widget) => (
            <Grid item xs={12} sm={6} md={4} key={widget.widgetId}>
              <WidgetCard widget={widget} onClick={() => openWidget(widget.widgetId)} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* BaseDialog rather than a raw MUI Dialog, so the popup carries the same
          chrome, buttons and exit affordance as every other dialog in the app. */}
      <BaseDialog
        open={createOpen}
        classes={classes}
        title={t('common.widget_create_new', 'Create Widget')}
        confirmText={t('common.widget_create_new', 'Create Widget')}
        cancelText={t('common.cancel', 'Cancel')}
        confirmDisabled={!newDomain.trim()}
        onClose={() => setCreateOpen(false)}
        onCancel={() => setCreateOpen(false)}
        onConfirm={handleCreate}
      >
        <>
          <Typography variant="body2" color="textSecondary" style={{ marginBottom: 12 }}>
            {t('common.widget_create_domain_prompt', 'Which website domain is this widget for?')}
          </Typography>
          <TextField
            autoFocus
            fullWidth
            size="small"
            variant="outlined"
            placeholder="www.example.com"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
          />
        </>
      </BaseDialog>
    </DefaultScreen>
  );
};

export default WidgetListPage;
