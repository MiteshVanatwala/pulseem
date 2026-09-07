import React, { useState } from 'react';
import { Box, Grid, Typography, Button, Chip } from '@material-ui/core';
import { Code, Edit as EditIcon, Forum as ForumIcon } from '@material-ui/icons';
import ScheduleIcon from '@material-ui/icons/Schedule';
import LanguageIcon from '@material-ui/icons/Language';
import LinkIcon from '@material-ui/icons/Link';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { Switch } from '../../../components/managment';
import { sitePrefix } from '../../../config';
import { whatsappRoutes } from '../../Whatsapp/Constant';
import { setWidgetStatus, WidgetSummary } from '../../../helpers/Api/WidgetAPI';

interface WidgetCardProps {
  widget: WidgetSummary;
  classes: any;
  onEmbed: (widget: WidgetSummary) => void;
  onStatusChange: (widgetId: string, status: 'active' | 'paused') => void;
  onError: (message: string) => void;
}

interface FactProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  // Renders the value as an absence rather than as data, so an unset field is not
  // mistaken for a real one at a glance.
  empty?: boolean;
  classes: any;
}

// Takes the popup card's band and grid, but aligns to the reading edge instead of
// centring: these are strings of varying length, and centred text values in wide
// columns give the eye nothing to track down the row.
const Fact: React.FC<FactProps> = ({ icon, title, value, empty, classes }) => (
  <Grid item xs={12} sm={4} className={classes?.widgetFactItem}>
    <Typography variant="caption" component="div" className={classes?.widgetFactLabel}>
      {icon}
      {title}
    </Typography>
    <Typography
      component="div"
      className={clsx(classes?.widgetFactValue, { [classes?.widgetFactValueEmpty]: empty })}
      // The value is ellipsised, so the full string has to stay reachable.
      title={empty ? undefined : value}
    >
      {value}
    </Typography>
  </Grid>
);

const WidgetCard: React.FC<WidgetCardProps> = ({
  widget, classes, onEmbed, onStatusChange, onError,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isRTL } = useSelector((state: any) => state.core) || { isRTL: false };
  const [saving, setSaving] = useState(false);

  const isActive = widget.status === 'active';
  const isDraft = widget.status === 'draft';

  const handleStatusChange = async () => {
    if (saving) return;
    const next: 'active' | 'paused' = isActive ? 'paused' : 'active';
    // Optimistic: the switch has to move under the pointer immediately. The parent
    // owns the list, so it also owns the revert if the request fails.
    const previous: 'active' | 'paused' = isActive ? 'active' : 'paused';
    onStatusChange(widget.widgetId, next);
    setSaving(true);
    try {
      await setWidgetStatus(next, widget.widgetId);
    } catch (e: any) {
      onStatusChange(widget.widgetId, previous);
      onError(e?.message || t('common.widget_status_failed', 'Could not change the widget status. Try again.'));
    } finally {
      setSaving(false);
    }
  };

  const renderStatusControl = () => {
    // A draft has never been published, so there is nothing to switch off. The popup
    // card takes the same approach: a chip instead of a toggle.
    if (isDraft) {
      return (
        <Chip
          label={t('landingPages.popupManagement.filters.draft', 'Draft')}
          className={classes?.draftChip}
          size="small"
        />
      );
    }
    return (
      <Box display="flex" alignItems="center" justifyContent="flex-end">
        <Typography
          className={clsx(classes?.middleText, classes?.txtCenter, {
            [classes?.switchActive]: isActive,
            [classes?.switchInactive]: !isActive,
          })}
          style={{ marginRight: '10px' }}
        >
          {isActive
            ? t('landingPages.popupManagement.filters.active', 'Active')
            : t('common.widget_status_paused', 'Paused')}
        </Typography>
        <Switch
          checked={isActive}
          onChange={handleStatusChange}
          disabled={saving}
          color="primary"
          name="statusSwitch"
          inputProps={{ 'aria-label': t('common.widget_status_switch', 'Widget status') }}
        />
      </Box>
    );
  };

  const created = widget.createdDate
    ? new Date(widget.createdDate).toLocaleDateString()
    : '—';

  return (
    <Box p={3} className={classes?.popupCard}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={8}>
          <Typography variant="h6" className={classes?.popupTitle}>
            {widget.name || t('common.widget_default_name', 'Chat with us')}
          </Typography>
        </Grid>
        <Grid item xs={12} md={4} style={{ textAlign: isRTL ? 'left' : 'right' }}>
          {renderStatusControl()}
        </Grid>
      </Grid>

      {/* Occupies the band the popup card fills with metrics. Per-widget engagement
          figures have no endpoint yet — getAllWidgets returns identity fields only —
          so this shows what is actually known rather than a row of dashes. */}
      <Box my={2} className={classes?.statsContainer}>
        <Grid container spacing={2} justifyContent="flex-start">
          <Fact
            classes={classes}
            icon={<LanguageIcon color="disabled" />}
            title={t('common.widget_fact_domain', 'Domain')}
            value={widget.domain || t('common.widget_no_domain', 'No domain set')}
            empty={!widget.domain}
          />
          <Fact
            classes={classes}
            icon={<LinkIcon color="disabled" />}
            title={t('common.widget_fact_website', 'Website')}
            value={widget.websiteUrl || t('common.widget_no_url', 'No website URL set')}
            empty={!widget.websiteUrl}
          />
          <Fact
            classes={classes}
            icon={<ScheduleIcon color="disabled" />}
            title={t('common.widget_fact_created', 'Created')}
            value={created}
            empty={!widget.createdDate}
          />
        </Grid>
      </Box>

      <Box className={classes?.actionsContainer}>
        <Button
          size="small"
          className={classes?.actionButtonPopupManagement}
          startIcon={<EditIcon />}
          onClick={() => navigate(`${sitePrefix}Widgets/${widget.widgetId}`)}
        >
          {t('common.widget_action_edit', 'Edit')}
        </Button>
        <Button
          size="small"
          className={classes?.actionButtonPopupManagement}
          startIcon={<Code />}
          // A draft has no published runtime, so the snippet would resolve to a
          // widget that renders nothing on the customer's site.
          disabled={isDraft}
          onClick={() => onEmbed(widget)}
        >
          {t('landingPages.popupManagement.actions.embed', 'Embed')}
        </Button>
        <Button
          size="small"
          className={classes?.actionButtonPopupManagement}
          startIcon={<ForumIcon />}
          onClick={() => navigate(`${whatsappRoutes.CHAT}?channel=widget`)}
        >
          {t('common.service_conversations', 'Conversations')}
        </Button>
      </Box>
    </Box>
  );
};

export default WidgetCard;
