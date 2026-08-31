import React from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import ChatBubbleOutlineIcon from '@material-ui/icons/ChatBubbleOutline';
import { IConversation, STATUS_COLORS, avatarColor, avatarInitial } from '../../../../Models/Service/Conversation';
import Skeleton from './Skeleton';
import EmptyState from './EmptyState';

interface Props {
  conversations: IConversation[];
  loading: boolean;
  onViewAll: () => void;
}

const pathnameOf = (url: string): string => {
  if (!url) return '';
  try {
    return new URL(url).pathname || '/';
  } catch {
    return url;
  }
};

const RecentConversationsPanel = ({ conversations, loading, onViewAll }: Props) => {
  const { t } = useTranslation();

  return (
    <div className="svc-card">
      <div className="svc-panel-head">
        <div className="svc-panel-title-wrap">
          <span className="svc-panel-icon" style={{ background: '#FF1744', color: '#fff' }}>
            <ChatBubbleOutlineIcon />
          </span>
          <h3 className="svc-panel-title">{t('common.dashboard_recent_convs', 'Recent Conversations')}</h3>
        </div>
        <span className="svc-panel-link" onClick={onViewAll}>
          {t('common.dashboard_view_all', 'View All')}
        </span>
      </div>

      {loading && !conversations.length ? (
        [0, 1, 2, 3, 4].map((i) => (
          <div className="svc-rc-row" key={i}>
            <Skeleton width={38} height={38} radius={19} />
            <div className="svc-rc-main">
              <Skeleton width={140} height={13} />
              <Skeleton width={90} height={11} style={{ marginTop: 6 }} />
            </div>
          </div>
        ))
      ) : !conversations.length ? (
        <EmptyState icon={<ChatBubbleOutlineIcon fontSize="inherit" />} text={t('common.dashboard_no_convs', 'No conversations yet')} />
      ) : (
        conversations.map((c) => {
          const name = c.visitorName || `Visitor ${(c.visitorId || '').slice(-6)}`;
          return (
            <div className="svc-rc-row" key={c.id}>
              <div className="svc-rc-avatar" style={{ background: avatarColor(c.visitorId || c.id) }}>
                {avatarInitial(c.visitorName)}
              </div>
              <div className="svc-rc-main">
                <div className="svc-rc-name">{name}</div>
                <div className="svc-rc-meta">
                  {c.assignedAgentName ? `${c.assignedAgentName} · ` : ''}
                  {pathnameOf(c.pageUrl)}
                  {` · ${c.messageCount} msg`}
                </div>
              </div>
              <div className="svc-rc-right">
                <span className="svc-badge" style={{ background: STATUS_COLORS[c.status] }}>
                  {t(`conv_${c.status}`, c.status)}
                </span>
                <div className="svc-rc-time">{moment(c.lastActivityAt).fromNow()}</div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default RecentConversationsPanel;
