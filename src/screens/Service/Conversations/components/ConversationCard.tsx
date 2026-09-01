import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@material-ui/core';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import ChatBubbleOutlineIcon from '@material-ui/icons/ChatBubbleOutline';
import moment from 'moment';
import { IConversation, STATUS_COLORS, avatarColor, avatarInitial } from '../../../../Models/Service/Conversation';

const StatusBadge = ({ status }: { status: IConversation['status'] }) => {
  const { t } = useTranslation();
  const label = t(`conv_${status}`, status.charAt(0).toUpperCase() + status.slice(1));
  return (
    <Box
      component="span"
      style={{ backgroundColor: STATUS_COLORS[status], color: '#fff', borderRadius: 12, padding: '1px 8px', fontSize: 10.5, fontWeight: 600, textTransform: 'capitalize', whiteSpace: 'nowrap' }}
    >
      {label}
    </Box>
  );
};

const ConversationCard = ({ conversation, selected, onClick }: { conversation: IConversation; selected: boolean; onClick: () => void }) => {
  const { t } = useTranslation();
  const last6 = conversation.visitorId ? conversation.visitorId.slice(-6) : '';
  const title = conversation.visitorName || t('conv_visitor', 'Visitor {{id}}', { id: last6 });
  let pagePath = '';
  try { pagePath = conversation.pageUrl ? new URL(conversation.pageUrl).pathname : ''; } catch { pagePath = conversation.pageUrl; }

  return (
    <Box
      onClick={onClick}
      display="flex"
      p={1.25}
      className={`svc-conv-card ${selected ? 'svc-selected' : ''}`}
      style={{ cursor: 'pointer', borderBottom: '1px solid #f1f3f5' }}
    >
      {/* Avatar */}
      <div className="svc-avatar" style={{ backgroundColor: avatarColor(conversation.id || title) }}>
        {avatarInitial(conversation.visitorName, 'V')}
      </div>

      {/* Content */}
      <Box style={{ minWidth: 0, flex: 1, marginInlineStart: 12 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" style={{ minWidth: 0 }}>
            {conversation.channel === 'whatsapp'
              ? <WhatsAppIcon style={{ fontSize: 14, color: '#25D366', marginInlineEnd: 5 }} />
              : <ChatBubbleOutlineIcon style={{ fontSize: 14, color: '#f4511e', marginInlineEnd: 5 }} />}
            <Typography noWrap style={{ fontWeight: 600, color: '#111827', fontSize: 14.5 }}>{title}</Typography>
          </Box>
          <Typography variant="caption" style={{ color: '#9ca3af', whiteSpace: 'nowrap', marginInlineStart: 8 }}>
            {moment(conversation.lastActivityAt).fromNow(true)}
          </Typography>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="flex-end" mt={0.25}>
          <Typography
            style={{ color: '#667781', fontSize: 13, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1, marginInlineEnd: 8 }}
          >
            {conversation.lastMessageSender === 'agent' ? t('conv_you_prefix', 'You: ') : ''}{conversation.lastMessage}
          </Typography>
          <StatusBadge status={conversation.status} />
        </Box>

        <Typography variant="caption" noWrap style={{ color: '#9ca3af', display: 'block', marginTop: 2 }}>
          {conversation.assignedAgentName || t('conv_unassigned', 'Unassigned')}
          {pagePath ? ` · ${pagePath}` : ''} · {conversation.messageCount}
        </Typography>
      </Box>
    </Box>
  );
};

export default ConversationCard;
