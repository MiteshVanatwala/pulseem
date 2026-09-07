import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  Grid, Typography, Box, Button, TextField, FormControl, InputLabel, Select, MenuItem,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { Language, Code } from '@material-ui/icons';
import { FaCommentDots } from 'react-icons/fa';
import clsx from 'clsx';
import DefaultScreen from '../DefaultScreen';
import { BaseDialog } from '../../components/DialogTemplates/BaseDialog';
import { Title } from '../../components/managment/Title';
import { TablePagination } from '../../components/managment/index';
import { Loader } from '../../components/Loader/Loader';
import Toast from '../../components/Toast/Toast.component';
// Generic (title / value / change), and shared so both management screens keep the
// same stat row. Worth promoting to components/managment if a third screen needs it.
import StatCard from '../LandingPages/PopUpManagement/StatCard';
import { sitePrefix } from '../../config';
import { getAllWidgets, WidgetSummary } from '../../helpers/Api/WidgetAPI';
import WidgetCard from './components/WidgetCard';
import EmbedCodeGenerator from './components/EmbedCodeGenerator';
import { getDashboardData } from '../../redux/reducers/serviceDashboardSlice';
import { IDashboardData } from '../../Models/Service/Dashboard';

const STATUS_FILTERS = [
  { value: 'All', labelKey: 'landingPages.popupManagement.filters.all', fallback: 'All' },
  { value: 'active', labelKey: 'landingPages.popupManagement.filters.active', fallback: 'Active' },
  { value: 'paused', labelKey: 'common.widget_status_paused', fallback: 'Paused' },
  { value: 'draft', labelKey: 'landingPages.popupManagement.filters.draft', fallback: 'Draft' },
];

const PAGE_SIZE_OPTIONS = [6, 12, 18];

// Widgets are created per domain, but the field is nullable, so anything without one
// still needs a group to sit in rather than vanishing from the list.
const UNGROUPED = '__no_domain__';

const WidgetListPage = ({ classes }: { classes?: any }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [widgets, setWidgets] = useState<WidgetSummary[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [toastMessage, setToastMessage] = useState<any>(null);
  const [embedWidgetId, setEmbedWidgetId] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'createdDate' | 'name' | 'status'>('createdDate');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[1]);

  // Account-wide engagement figures, not per-widget: the same aggregate the Service
  // Dashboard renders. There is no per-widget stats endpoint, so the stat row
  // summarises the account and the cards below stay descriptive.
  const { data: dashboard, loading: dashboardLoading } = useSelector(
    (s: any) => s.serviceDashboard as { data: IDashboardData | null; loading: boolean },
  ) || { data: null, loading: false };

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
      .catch((err) => {
        console.error('Failed to load widgets', err);
        if (!cancelled) {
          setToastMessage({
            severity: 'error',
            message: t('common.widget_load_failed', 'Could not load your widgets. Refresh to try again.'),
          });
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Stat row only — a failure here must not block the list, so the rejection is
    // swallowed and those cards fall back to a dash.
    (dispatch as any)(getDashboardData());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-dismiss, matching the popup management screen's toast behaviour.
  useEffect(() => {
    if (!toastMessage) return undefined;
    const timer = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const counts = useMemo(() => ({
    total: widgets.length,
    active: widgets.filter((w) => w.status === 'active').length,
    paused: widgets.filter((w) => w.status === 'paused').length,
    draft: widgets.filter((w) => w.status === 'draft').length,
  }), [widgets]);

  // Filtering, sorting and paging are all client-side: getAllWidgets returns the
  // whole set and there is one widget per domain, so the list stays small. Move
  // these server-side if that stops being true.
  const visible = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let rows = widgets.filter((w) => {
      if (statusFilter !== 'All' && w.status !== statusFilter) return false;
      if (!term) return true;
      return [w.name, w.domain, w.websiteUrl]
        .some((field) => (field || '').toLowerCase().includes(term));
    });

    const direction = sortDirection === 'ASC' ? 1 : -1;
    rows = [...rows].sort((a, b) => {
      let result = 0;
      if (sortBy === 'name') result = (a.name || '').localeCompare(b.name || '');
      else if (sortBy === 'status') result = a.status.localeCompare(b.status);
      else result = new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
      return result * direction;
    });
    return rows;
  }, [widgets, searchTerm, statusFilter, sortBy, sortDirection]);

  // A filter change can leave the current page beyond the end of the results, which
  // would render an empty grid with rows still available on page 1.
  useEffect(() => { setPage(1); }, [searchTerm, statusFilter, sortBy, sortDirection]);

  const paged = useMemo(
    () => visible.slice((page - 1) * pageSize, page * pageSize),
    [visible, page, pageSize],
  );

  // The card toggles optimistically and calls back here, because the list is owned
  // by this component — including the revert when the request fails.
  const applyStatus = (widgetId: string, status: 'active' | 'paused') => {
    setWidgets((prev) => prev.map(
      (w) => (w.widgetId === widgetId ? { ...w, status } : w),
    ));
  };

  const handleCreate = () => {
    const domain = newDomain.trim();
    if (!domain) return;
    setCreateOpen(false);
    setNewDomain('');
    navigate(`${sitePrefix}Widgets/new?domain=${encodeURIComponent(domain)}`);
  };

  const renderTopSection = () => (
    <Box>
      <Box pt={4}>
        <Title
          Text={t('common.widget_chat_widget', 'Chat Widget')}
          classes={classes}
        />
      </Box>
      <Box pt={3} className={classes?.responsiveActions}>
        <Button
          variant="contained"
          color="primary"
          className={clsx(classes?.btn, classes?.btnRounded)}
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
        >
          {t('common.widget_create_new', 'Create Widget')}
        </Button>
      </Box>
      <Box mt={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              classes={classes}
              title={t('common.widget_stat_total', 'Total Widgets')}
              value={counts.total.toString()}
              change={`${counts.active} ${t('landingPages.popupManagement.filters.active', 'Active')} • ${counts.paused} ${t('common.widget_status_paused', 'Paused')} • ${counts.draft} ${t('landingPages.popupManagement.filters.draft', 'Draft')}`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              classes={classes}
              title={t('common.dashboard_total_conversations', 'Total Conversations')}
              value={dashboard ? dashboard.stats.totalConversations.toLocaleString() : '—'}
              change={dashboard
                ? `${dashboard.stats.newConversations} ${t('common.dashboard_new_conversations', 'New')} • ${dashboard.stats.openConversations} ${t('common.dashboard_open_conversations', 'Open')}`
                : ''}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              classes={classes}
              title={t('common.widget_stat_avg_response', 'Avg. Response Time')}
              // Null until a conversation has actually been answered. A dash rather
              // than 0, which would read as instant replies.
              value={dashboard && dashboard.performance.avgResponseMinutes !== null
                ? `${dashboard.performance.avgResponseMinutes} ${t('common.widget_stat_minutes', 'min')}`
                : '—'}
              change={dashboard
                ? `${dashboard.performance.resolutionRate.toFixed(0)}% ${t('common.widget_stat_resolved', 'resolved')}`
                : ''}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              classes={classes}
              title={t('common.widget_stat_satisfaction', 'Satisfaction')}
              value={dashboard && dashboard.feedback.totalReviews > 0
                ? dashboard.feedback.avgRating.toFixed(1)
                : '—'}
              change={dashboard && dashboard.feedback.totalReviews > 0
                ? `${dashboard.feedback.totalReviews} ${t('common.widget_stat_reviews', 'reviews')}`
                : ''}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );

  const renderSearchAndFilterSection = () => (
    <Box mt={3}>
      <Grid className={classes?.widgetToolbar} container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('common.widget_search_placeholder', 'Search by name, domain or URL')}
            inputProps={{ 'aria-label': t('common.widget_search_placeholder', 'Search by name, domain or URL') }}
          />
        </Grid>
        <Grid item>
          {STATUS_FILTERS.map((filter) => (
            <Button
              key={filter.value}
              variant={statusFilter === filter.value ? 'contained' : 'text'}
              color={statusFilter === filter.value ? 'primary' : 'default'}
              className={classes?.btnRounded}
              onClick={() => setStatusFilter(filter.value)}
              style={{ marginRight: '5px' }}
            >
              {t(filter.labelKey, filter.fallback)}
            </Button>
          ))}
        </Grid>
        <Grid item xs />
        <Grid item>
          <FormControl variant="outlined" size="small" style={{ minWidth: 130, marginRight: '10px' }}>
            <InputLabel>{t('landingPages.popupManagement.filters.sortBy', 'Sort by')}</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'createdDate' | 'name' | 'status')}
              label={t('landingPages.popupManagement.filters.sortBy', 'Sort by')}
            >
              <MenuItem value="createdDate">{t('landingPages.popupManagement.filters.createdDate', 'Created date')}</MenuItem>
              <MenuItem value="name">{t('landingPages.popupManagement.filters.name', 'Name')}</MenuItem>
              <MenuItem value="status">{t('common.widget_sort_status', 'Status')}</MenuItem>
            </Select>
          </FormControl>
          <FormControl variant="outlined" size="small" style={{ minWidth: 110 }}>
            <InputLabel>{t('landingPages.popupManagement.filters.direction', 'Direction')}</InputLabel>
            <Select
              value={sortDirection}
              onChange={(e) => setSortDirection(e.target.value as 'ASC' | 'DESC')}
              label={t('landingPages.popupManagement.filters.direction', 'Direction')}
            >
              <MenuItem value="ASC">{t('landingPages.popupManagement.filters.ascending', 'Ascending')}</MenuItem>
              <MenuItem value="DESC">{t('landingPages.popupManagement.filters.descending', 'Descending')}</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );

  // Grouped by domain with a header carrying the Embed action, and one full-width
  // card per widget — the same shape as the popup management screen. A widget with
  // no domain set is grouped separately rather than dropped.
  const renderCardView = () => {
    const grouped = paged.reduce((acc: Record<string, WidgetSummary[]>, widget) => {
      const key = widget.domain || UNGROUPED;
      if (!acc[key]) acc[key] = [];
      acc[key].push(widget);
      return acc;
    }, {} as Record<string, WidgetSummary[]>);

    return (
      <Box>
        {Object.entries(grouped).map(([domain, domainWidgets]) => {
          // Only a published widget has a snippet worth handing out, and the dialog
          // needs a specific widget id, so the header acts on the first active one.
          const embeddable = domainWidgets.find((w) => w.status !== 'draft');
          return (
            <Box key={domain} mb={4}>
              <Box mb={2} className={classes?.widgetDomainHeader}>
                <Box className={classes?.widgetDomainIcon}>
                  <Language style={{ fontSize: 22 }} />
                </Box>
                <Typography variant="h6" className={classes?.widgetDomainName}>
                  {domain === UNGROUPED
                    ? t('common.widget_no_domain', 'No domain set')
                    : domain}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  className={clsx(classes?.btn, classes?.btnRounded, classes?.ml5)}
                  startIcon={<Code />}
                  disabled={!embeddable}
                  onClick={() => embeddable && setEmbedWidgetId(embeddable.widgetId)}
                >
                  {t('landingPages.popupManagement.actions.embed', 'Embed')}
                </Button>
              </Box>

              <Grid container spacing={3}>
                {domainWidgets.map((widget) => (
                  <Grid item xs={12} key={widget.widgetId}>
                    <WidgetCard
                      widget={widget}
                      classes={classes}
                      onEmbed={(w) => setEmbedWidgetId(w.widgetId)}
                      onStatusChange={applyStatus}
                      onError={(message) => setToastMessage({ severity: 'error', message })}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          );
        })}
      </Box>
    );
  };

  const renderEmptyState = () => {
    // A search that matches nothing is not the same as having no widgets, and
    // offering "Create Widget" to someone who has widgets but mistyped is wrong.
    const filtered = widgets.length > 0;
    return (
      <Box className={classes?.widgetEmptyState}>
        <FaCommentDots size={40} className={classes?.widgetEmptyIcon} />
        <Typography variant="h6" style={{ fontWeight: 600, marginTop: 16, marginBottom: 6 }}>
          {filtered
            ? t('common.widget_no_results_title', 'No widgets match your filters')
            : t('common.widget_no_widgets_title', 'No chat widgets yet')}
        </Typography>
        <Typography variant="body2" color="textSecondary" style={{ marginBottom: 20 }}>
          {filtered
            ? t('common.widget_no_results_subtitle', 'Try a different search term or clear the status filter.')
            : t('common.widget_no_widgets_subtitle', 'Create your first widget to start chatting with visitors on your website')}
        </Typography>
        {filtered ? (
          <Button
            variant="outlined"
            className={clsx(classes?.btn, classes?.btnRounded)}
            onClick={() => { setSearchTerm(''); setStatusFilter('All'); }}
          >
            {t('common.widget_clear_filters', 'Clear filters')}
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            className={clsx(classes?.btn, classes?.btnRounded)}
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
          >
            {t('common.widget_create_new', 'Create Widget')}
          </Button>
        )}
      </Box>
    );
  };

  return (
    <DefaultScreen
      currentPage="widgets"
      classes={classes}
      containerClass={clsx(classes?.management, classes?.mb50)}
    >
      {renderTopSection()}
      {renderSearchAndFilterSection()}

      <Box mt={3}>
        {/* Nothing is rendered while loading — the shared Loader covers the screen,
            as it does on the popup management page. */}
        {loading ? null : visible.length === 0 ? renderEmptyState() : renderCardView()}
      </Box>

      {visible.length > 0 && (
        <TablePagination
          classes={classes}
          rows={visible.length}
          rowsPerPage={pageSize}
          rowsPerPageOptions={PAGE_SIZE_OPTIONS}
          onRowsPerPageChange={(val: number) => { setPageSize(val); setPage(1); }}
          page={page}
          onPageChange={(p: number) => setPage(p)}
        />
      )}

      <EmbedCodeGenerator
        open={embedWidgetId !== null}
        widgetId={embedWidgetId || undefined}
        classes={classes}
        onClose={() => setEmbedWidgetId(null)}
      />

      <Loader isOpen={loading || dashboardLoading} />
      {toastMessage && <Toast data={toastMessage} />}

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
