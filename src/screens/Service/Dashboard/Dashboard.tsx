import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Grid } from '@material-ui/core';
import DefaultScreen from '../../DefaultScreen';
import { sitePrefix } from '../../../config';
import { whatsappRoutes } from '../../Whatsapp/Constant';
import { getDashboardData, DashboardRange } from '../../../redux/reducers/serviceDashboardSlice';
import { IDashboardData } from '../../../Models/Service/Dashboard';
import StatsCards, { StatFilter } from './components/StatsCards';
import QuickActions from './components/QuickActions';
import RecentConversationsPanel from './components/RecentConversationsPanel';
import PerformanceInsightsPanel from './components/PerformanceInsightsPanel';
import MarketingInsightsPanel from './components/MarketingInsightsPanel';
import UserFeedbackPanel from './components/UserFeedbackPanel';
import './dashboard.css';

const REFRESH_MS = 5 * 60 * 1000; // silent auto-refresh every 5 minutes (ticket)

const Dashboard = ({ classes }: any) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data, loading } = useSelector(
    (s: any) => s.serviceDashboard as { data: IDashboardData | null; loading: boolean },
  );
  // Falls back to the generic subtitle when the token carried no name, rather than
  // rendering "Welcome back, undefined".
  const userName = useSelector((s: any) => s.core?.subUserName);
  // 7d rather than all-time: a support dashboard is about what is happening now, and
  // an all-time Open count keeps growing until it stops meaning anything.
  const [range, setRange] = useState<DashboardRange>('7d');
  // Which stat card is filtering the conversation list. null = show everything.
  const [statFilter, setStatFilter] = useState<StatFilter>(null);

  useEffect(() => {
    (dispatch as any)(getDashboardData(range));
    const id = setInterval(() => (dispatch as any)(getDashboardData(range)), REFRESH_MS);
    // `range` in the deps so switching window refetches immediately and the silent
    // refresh keeps polling the window the user is actually looking at.
    return () => clearInterval(id);
  }, [dispatch, range]);

  // Widget conversations live inside the WhatsApp Chat inbox rather than a second
  // page, so "View all" filters that inbox to the widget channel.
  const goConversations = () => navigate(`${whatsappRoutes.CHAT}?channel=widget`);
  const goWidgets = () => navigate(`${sitePrefix}Widgets`);

  // Filtered in the browser because the endpoint returns only the five most recent
  // conversations, not a queryable list — so selecting a status narrows those five
  // rather than fetching more. A card can therefore legitimately show 4 while the
  // list below shows fewer; "View All" goes to the inbox for the full set.
  const allRecent = data?.recentConversations ?? [];
  const recentFiltered =
    statFilter === null || statFilter === 'all'
      ? allRecent
      : allRecent.filter((c) => c.status === statFilter);

  return (
    <DefaultScreen
      classes={classes}
      currentPage="service"
      subPage="serviceDashboard"
      containerClass=""
      hideSideImages
    >
    <div className="svc-dash">
      <div className="svc-dash-head">
        <div className="svc-dash-head-row">
          <div>
            <h1 className="svc-dash-title">{t('common.dashboard_title', 'Dashboard')}</h1>
        <p className="svc-dash-subtitle">
          {userName
            ? `${t('common.dashboard_welcome_back', 'Welcome back')}, ${userName}`
            : t('common.dashboard_subtitle', 'A real-time overview of your support operation')}
          </p>
          </div>

          {/* Reporting window. "All" is kept because some accounts have too little
              traffic for a 24h or 7d view to show anything at all. */}
          <div className="svc-range" role="group" aria-label={t('common.dashboard_range', 'Date range')}>
            {([
              ['24h', t('common.dashboard_range_24h', '24h')],
              ['7d', t('common.dashboard_range_7d', '7d')],
              ['30d', t('common.dashboard_range_30d', '30d')],
              ['all', t('common.dashboard_range_all', 'All')],
            ] as [DashboardRange, string][]).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`svc-range-btn${range === key ? ' svc-range-btn--on' : ''}`}
                aria-pressed={range === key}
                onClick={() => setRange(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats cards — 4-col desktop, 2-col tablet, 1-col mobile */}
      <div className="svc-section">{t('common.dashboard_section_conversations', 'Conversations')}</div>
      <StatsCards
        stats={data?.stats ?? null}
        loading={loading}
        selected={statFilter}
        onSelect={setStatFilter}
      />

      {/* Quick actions */}
      <div style={{ margin: '20px 0' }}>
        <QuickActions />
      </div>

      {/* Insight panels — 2-col desktop, 1-col below. Was 3-col, but Marketing and
          Performance are dense key/value lists that were being squeezed. */}
      <div className="svc-section">{t('common.dashboard_section_insights', 'Insights')}</div>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <PerformanceInsightsPanel data={data?.performance ?? null} loading={loading} />
        </Grid>
        <Grid item xs={12} md={6}>
          <MarketingInsightsPanel data={data?.marketing ?? null} loading={loading} />
        </Grid>
      </Grid>

      {/* Full width: rows carry a name, a message preview and status chips. At a
          third of the width the preview truncated after a couple of words, which is
          worse still for the Hebrew conversations. */}
      <div className="svc-section">{t('common.dashboard_section_recent', 'Recent Conversations')}</div>
      <RecentConversationsPanel
        conversations={recentFiltered}
        loading={loading}
        onViewAll={goConversations}
      />

      <div className="svc-section">{t('common.dashboard_section_feedback', 'User Feedback')}</div>
      <UserFeedbackPanel data={data?.feedback ?? null} loading={loading} onSettings={goWidgets} />
    </div>
    </DefaultScreen>
  );
};

export default Dashboard;
