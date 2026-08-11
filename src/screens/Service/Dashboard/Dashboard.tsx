import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Grid } from '@material-ui/core';
import DefaultScreen from '../../DefaultScreen';
import { sitePrefix } from '../../../config';
import { getDashboardData } from '../../../redux/reducers/serviceDashboardSlice';
import { IDashboardData } from '../../../Models/Service/Dashboard';
import StatsCards from './components/StatsCards';
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

  useEffect(() => {
    (dispatch as any)(getDashboardData());
    const id = setInterval(() => (dispatch as any)(getDashboardData()), REFRESH_MS);
    return () => clearInterval(id);
  }, [dispatch]);

  const goWidgets = () => navigate(`${sitePrefix}Widgets`);

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
        <h1 className="svc-dash-title">{t('dashboard_title', 'Dashboard')}</h1>
        <p className="svc-dash-subtitle">
          {t('dashboard_subtitle', 'A real-time overview of your support operation')}
        </p>
      </div>

      {/* Stats cards — 4-col desktop, 2-col tablet, 1-col mobile */}
      <StatsCards stats={data?.stats ?? null} loading={loading} />

      {/* Quick actions */}
      <div style={{ margin: '20px 0' }}>
        <QuickActions />
      </div>

      {/* Panels — 3-col desktop, 2-col tablet, 1-col mobile */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} lg={4}>
          <RecentConversationsPanel
            conversations={data?.recentConversations ?? []}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <PerformanceInsightsPanel data={data?.performance ?? null} loading={loading} />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <MarketingInsightsPanel data={data?.marketing ?? null} loading={loading} />
        </Grid>
        <Grid item xs={12}>
          <UserFeedbackPanel data={data?.feedback ?? null} loading={loading} onSettings={goWidgets} />
        </Grid>
      </Grid>
    </div>
    </DefaultScreen>
  );
};

export default Dashboard;
