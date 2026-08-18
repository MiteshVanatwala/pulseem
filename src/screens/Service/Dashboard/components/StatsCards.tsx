import React from 'react';
import { Grid } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import FiberNewIcon from '@material-ui/icons/FiberNew';
import ChatBubbleOutlineIcon from '@material-ui/icons/ChatBubbleOutline';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import ForumOutlinedIcon from '@material-ui/icons/ForumOutlined';
import { IDashboardStats } from '../../../../Models/Service/Dashboard';
import Skeleton from './Skeleton';

interface Props {
  stats: IDashboardStats | null;
  loading: boolean;
}

const StatsCards = ({ stats, loading }: Props) => {
  const { t } = useTranslation();

  const cards = [
    { key: 'newConversations', label: t('common.dashboard_new_conversations', 'New Conversations'), value: stats?.newConversations, icon: <FiberNewIcon />, fg: '#3b82f6', bg: '#dbeafe' },
    { key: 'openConversations', label: t('common.dashboard_open_conversations', 'Open Conversations'), value: stats?.openConversations, icon: <ChatBubbleOutlineIcon />, fg: '#f97316', bg: '#ffedd5' },
    { key: 'marketingConsent', label: t('common.dashboard_marketing_consent', 'Marketing Consent'), value: stats?.marketingConsent, icon: <MailOutlineIcon />, fg: '#8b5cf6', bg: '#ede9fe' },
    { key: 'totalConversations', label: t('common.dashboard_total_conversations', 'Total Conversations'), value: stats?.totalConversations, icon: <ForumOutlinedIcon />, fg: '#0ea5e9', bg: '#e0f2fe' },
  ];

  return (
    <Grid container spacing={2}>
      {cards.map((c) => (
        <Grid item xs={12} sm={6} lg={3} key={c.key}>
          <div className="svc-card svc-stat" style={{ ['--svc-accent' as any]: c.fg }}>
            <div className="svc-stat-icon" style={{ background: c.bg, color: c.fg }}>
              {c.icon}
            </div>
            <div>
              {loading && !stats ? (
                <>
                  <Skeleton width={54} height={24} />
                  <Skeleton width={96} height={12} style={{ marginTop: 6 }} />
                </>
              ) : (
                <>
                  <div className="svc-stat-value">{c.value ?? 0}</div>
                  <div className="svc-stat-label">{c.label}</div>
                </>
              )}
            </div>
          </div>
        </Grid>
      ))}
    </Grid>
  );
};

export default StatsCards;
