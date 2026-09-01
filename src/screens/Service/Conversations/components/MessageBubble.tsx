import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@material-ui/core';
import moment from 'moment';
import { IMessage } from '../../../../Models/Service/Conversation';

const MessageBubble = ({ message }: { message: IMessage }) => {
  const { t } = useTranslation();
  const isVisitor = message.sender === 'visitor';
  const isAi = message.sender === 'ai';

  const bubbleStyle: React.CSSProperties = isVisitor
    ? { backgroundColor: '#f3f4f6', color: '#111827' }
    : isAi
      ? { backgroundColor: '#e0f2fe', color: '#0c4a6e' }
      : { background: 'linear-gradient(135deg, #f4511e, #ff7a59)', color: '#fff' };

  return (
    <Box display="flex" justifyContent={isVisitor ? 'flex-start' : 'flex-end'} mb={1.5}>
      <Box style={{ maxWidth: '72%' }}>
        <Box
          className="svc-bubble"
          px={1.5} py={1}
          style={{ ...bubbleStyle, borderRadius: 8, wordBreak: 'break-word' }}
        >
          <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>{message.content}</Typography>
          {message.fileUrl && (
            <a href={message.fileUrl} target="_blank" rel="noreferrer" style={{ color: isVisitor ? '#f4511e' : '#fff', fontSize: 13, textDecoration: 'underline', display: 'inline-block', marginTop: 4 }}>
              📎 {t('conv_view_file', 'View attached file')}
            </a>
          )}
        </Box>
        <Typography variant="caption" style={{ color: '#9ca3af', display: 'block', textAlign: isVisitor ? 'start' : 'end', marginTop: 2 }}>
          {message.senderName} · {moment(message.sentAt).format('MMM D, HH:mm')}
        </Typography>
      </Box>
    </Box>
  );
};

export default MessageBubble;
