import React, { useRef, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography, Paper, Button, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { StateType } from '../../Models/StateTypes';
import clsx from 'clsx';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { RenderHtml } from '../../helpers/Utils/HtmlUtils';
import { AIChatConfig, advisorConfig } from './chatConfig';
import { useThinkingPhrases } from '../../hooks/useThinkingPhrases';
import { escapeToAgent } from '../../redux/reducers/supportChatSlice';

const useStyles = makeStyles((theme) => ({
  messageList: {
    maxHeight: '80vh',
    overflowY: 'auto',
    padding: theme.spacing(2),
    backgroundColor: '#ffffff',
    '&::-webkit-scrollbar': {
      width: '8px',
      background: 'transparent',
      display: 'block',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#666666',
      borderRadius: '4px',
      '&:hover': {
        background: '#4d4d4d',
      },
    },
    scrollbarWidth: 'thin',
    scrollbarColor: '#666666 transparent',
  },
  messageRow: {
    display: 'flex',
    marginBottom: theme.spacing(1),
    animation: '$fadeIn 0.3s ease-in-out',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    padding: theme.spacing(1, 2),
    borderRadius: '20px',
    maxWidth: '100%',
    display: 'inline-block',
    '&.user-bubble': {
      maxWidth: '100%',
    },
  },
  userBubble: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  userBubbleWrapper: {
   maxWidth: '95%',
   marginLeft: '5%',
   display: 'flex',
   justifyContent: 'flex-end'
  },
  aiBubbleWrapper: {
    maxWidth: '95%',
    display: 'flex',
    justifyContent: 'flex-start'
  },
  aiBubble: {
    backgroundColor: '#f0f0f0',
    color: theme.palette.text.primary,
  },
  messageTime: {
    fontSize: '0.7rem',
    color: '#666',
    marginTop: '4px',
    textAlign: 'right',
  },
  messageContent: {
    fontSize: '1.1rem',
    whiteSpace: 'pre-wrap',
    '& br': {
      display: 'block',
      content: '""',
      marginTop: '0.5em',
    },
    '& label': {
      display: 'block',
      margin: 0,
    },
    '& .htmlwrapperai': {
      fontFamily: '"Heebo", sans-serif',
      whiteSpace: 'collapse',
    },
  },
  userMessageTime: {
    color: '#FFF',
  },
  '@keyframes fadeIn': {
    '0%': {
      opacity: 0,
      transform: 'translateY(10px)',
    },
    '100%': {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
  typingBubble: {
    padding: theme.spacing(1, 2),
    backgroundColor: 'transparent',
    display: 'inline-block',
    boxShadow: 'none',
  },
  messageDot: {
    paddingInline: '5px',
    color: '#dd2339',
    fontSize: '1.5rem',
  },
  typingDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#dd2339',
    display: 'inline-block',
    margin: '0 2px',
    animation: '$blink 1.4s infinite both',
    '&:nth-of-type(2)': {
      animationDelay: '0.2s',
    },
    '&:nth-of-type(3)': {
      animationDelay: '0.4s',
    },
  },
  '@keyframes blink': {
    '0%': {
      opacity: 0.2,
    },
    '20%': {
      opacity: 1,
    },
    '100%': {
      opacity: 0.2,
    },
  },
  contactBubble: {
    padding: '10px 16px',
    backgroundColor: '#fff8e1',
    border: '1px solid #ffe082',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxWidth: '85%',
  },
  escalateButton: {
    color: '#dd2339',
    borderColor: '#dd2339',
    alignSelf: 'flex-start',
    '&:hover': {
      backgroundColor: '#ffeaea',
      borderColor: '#dd2339',
    },
  },
  escalateError: {
    fontSize: '0.75rem',
    color: '#dd2339',
    marginTop: '2px',
  },
}));

interface MessageListProps {
  config?: AIChatConfig;
}

const MessageList: React.FC<MessageListProps> = ({ config = advisorConfig }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const isSupport = config.reduxSliceName === 'supportChat';
  const { messages, aiIconStatus, totalMessagesForUserCount, isEscalated, suggestAgent } = useSelector((state: StateType) =>
    isSupport ? state.supportChat : state.aiChat
  );
  const { language } = useSelector((state: StateType) => state.core);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { phrase, visible } = useThinkingPhrases(aiIconStatus === 1);
  moment.locale(language);

  const [isEscalating, setIsEscalating] = useState(false);
  const [escalateError, setEscalateError] = useState(false);

  const showContactBubble = isSupport && (totalMessagesForUserCount >= 2 || suggestAgent) && !isEscalated && aiIconStatus !== 1;

  const handleEscalate = async () => {
    setIsEscalating(true);
    setEscalateError(false);
    try {
      await (dispatch(escapeToAgent()) as any).unwrap();
    } catch (_) {
      setEscalateError(true);
    } finally {
      setIsEscalating(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      const scrollToBottom = () => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth'
        });
      };

      scrollToBottom();
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, aiIconStatus]);

  return (
    // @ts-ignore
    <Box className={classes.messageList} style={{height: messages.length > 1 ? '50vh' : '40vh'}} ref={scrollRef}>
      {messages.map((msg, index) => (
        <Box
          key={msg.MessageID}
          style={{ animationDelay: `${index * 100}ms` }}
          className={`${classes.messageRow} ${
            msg.MessageTypeID === 1 ? classes.userMessage : classes.aiMessage
          }`}
        >
          <Box className={msg.MessageTypeID === 1 ? classes.userBubbleWrapper : classes.aiBubbleWrapper}>
            {msg.MessageTypeID === 4 && (
              <div style={{ fontSize: '0.7rem', color: '#888', marginBottom: '2px', paddingInlineStart: '4px' }}>
                {t('common.agentLabel')}
              </div>
            )}
            <Paper
              className={`${classes.messageBubble} ${
                msg.MessageTypeID === 1 ? classes.userBubble : classes.aiBubble
              } ${msg.MessageTypeID === 1 ? 'user-bubble' : 'ai-bubble'}`}
              style={msg.MessageTypeID === 4 ? { backgroundColor: '#e8f5e9', border: '1px solid #a5d6a7' } : undefined}
              elevation={1}
            >
              {msg.MessageHTML ? (
                <Box className={classes.messageContent}>
                  {RenderHtml(msg.MessageHTML)}
                </Box>
              ) : (
                <Typography
                  variant="body1"
                  className={classes.messageContent}
                >
                  {msg.MessageText}
                </Typography>
              )}
              {msg.MessageTimestamp && (
                <Typography className={clsx(classes.messageTime, msg.MessageTypeID === 1 ? classes.userMessageTime : null)}>
                  {moment(msg.MessageTimestamp)?.format('HH:mm a')}
                </Typography>
              )}
            </Paper>
          </Box>
        </Box>
      ))}
      {aiIconStatus === 1 && (
        <Box className={`${classes.messageRow} ${classes.aiMessage}`}>
          <Paper className={classes.typingBubble} elevation={0}>
            <span
              className={classes.messageDot}
              style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.25s ease' }}
            >
              {phrase}
            </span>
            <span className={classes.typingDot} />
            <span className={classes.typingDot} />
            <span className={classes.typingDot} />
          </Paper>
        </Box>
      )}
      {showContactBubble && (
        <Box className={`${classes.messageRow} ${classes.aiMessage}`}>
          <Box className={classes.contactBubble}>
            <Typography variant="body2">
              {t('common.contactAgentSuggestion')}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              className={classes.escalateButton}
              onClick={handleEscalate}
              disabled={isEscalating}
            >
              {isEscalating
                ? <CircularProgress size={16} style={{ color: '#dd2339' }} />
                : t('common.contactAgent')}
            </Button>
            {escalateError && (
              <Typography className={classes.escalateError}>
                {t('common.contactAgentError')}
              </Typography>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default MessageList;
