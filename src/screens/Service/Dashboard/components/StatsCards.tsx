import React from 'react';
import { Grid } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import FiberNewIcon from '@material-ui/icons/FiberNew';
import ChatBubbleOutlineIcon from '@material-ui/icons/ChatBubbleOutline';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import ForumOutlinedIcon from '@material-ui/icons/ForumOutlined';
import { IDashboardStats } from '../../../../Models/Service/Dashboard';
import Skeleton from './Skeleton';

/** Conversation status a card filters the list to. null = the card is not a filter. */
export type StatFilter = 'new' | 'open' | 'all' | null;

interface Props {
  stats: IDashboardStats | null;
  loading: boolean;
  selected: StatFilter;
  onSelect: (next: StatFilter) => void;
}

/** palette.primary.main — the app's only brand colour (see style/theme.js). */
const BRAND = '#FF1744';

const StatsCards = ({ stats, loading, selected, onSelect }: Props) => {
  const { t } = useTranslation();

  // Icon chips and the left accent bar all use the Pulseem accent. They used to be
  // four unrelated hues (blue / orange / violet / cyan) that matched nothing else in
  // the product. `valueColor` still tints a number where the colour means something.
  const cards = [
    { filter: 'new' as StatFilter, key: 'newConversations', label: t('common.dashboard_new_conversations', 'New Conversations'), value: stats?.newConversations, icon: <FiberNewIcon />, fg: BRAND, bg: BRAND, valueColor: undefined as string | undefined },
    { filter: 'open' as StatFilter, key: 'openConversations', label: t('common.dashboard_open_conversations', 'Open Conversations'), value: stats?.openConversations, icon: <ChatBubbleOutlineIcon />, fg: BRAND, bg: BRAND, valueColor: undefined as string | undefined },
    { filter: null as StatFilter, key: 'marketingConsent', label: t('common.dashboard_marketing_consent', 'Marketing Consent'), value: stats?.marketingConsent, icon: <MailOutlineIcon />, fg: BRAND, bg: BRAND, valueColor: '#12894f' },
    { filter: 'all' as StatFilter, key: 'totalConversations', label: t('common.dashboard_total_conversations', 'Total Conversations'), value: stats?.totalConversations, icon: <ForumOutlinedIcon />, fg: BRAND, bg: BRAND, valueColor: undefined as string | undefined },
  ];

  return (
    <Grid container spacing={2}>
      {cards.map((c) => (
        <Grid item xs={12} sm={6} lg={3} key={c.key}>
          {(() => {
            const isSel = c.filter !== null && selected === c.filter;
            const cls =
              `svc-card svc-stat${c.filter ? ' svc-stat--clickable' : ''}` +
              (isSel ? ' svc-stat--selected' : '');
            const body = (
              <>
                <div className="svc-stat-top">
                  <div className="svc-stat-label">
                    {loading && !stats ? <Skeleton width={96} height={12} /> : c.label}
                  </div>
                  <div className="svc-stat-icon" style={{ background: c.bg, color: '#fff' }}>
                    {c.icon}
                  </div>
                </div>
                <div className="svc-stat-value" style={c.valueColor && !isSel ? { color: c.valueColor } : undefined}>
                  {loading && !stats ? <Skeleton width={54} height={28} /> : (c.value ?? 0)}
                </div>
              </>
            );

            // Rendered as a real <button> when it filters, so keyboard and screen
            // readers get it for free; a plain div otherwise.
            return c.filter ? (
              <button
                type="button"
                className={cls}
                style={{ ['--svc-accent' as any]: c.fg }}
                aria-pressed={isSel}
                // Clicking the active filter clears it, so there is always a way back
                // to the full list without hunting for a reset control.
                onClick={() => onSelect(isSel ? null : c.filter)}
              >
                {body}
              </button>
            ) : (
              <div className={cls} style={{ ['--svc-accent' as any]: c.fg }}>
                {body}
              </div>
            );
          })()}
        </Grid>
      ))}
    </Grid>
  );
};

export default StatsCards;
