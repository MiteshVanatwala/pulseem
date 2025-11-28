import React, { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { StateType } from '../../Models/StateTypes';
import clsx from 'clsx';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { RenderHtml } from '../../helpers/Utils/HtmlUtils';

const useStyles = makeStyles((theme) => ({
  messageList: {
    // height: '50vh', // Fixed height
    // maxHeight: 'calc(80vh - 300px)', // Maximum height 
    maxHeight: '80vh', // Maximum height based on viewport height minus header and input area
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
    borderRadius: '20px',
    backgroundColor: '#f0f0f0',
    display: 'inline-block',
  },
  messageDot: {
    paddingInline: '5px',
  },
  typingDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: theme.palette.text.secondary,
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
}));

const formatTime = (timestamp: string) => {
  try {
    // Parse the ISO timestamp and convert to local time
    const utcDate = new Date(timestamp);
    const localDate = new Date(utcDate.getTime() - (utcDate.getTimezoneOffset() * 60000));
    
    return localDate.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).replace(/\s*(AM|PM)/, (_, meridiem) => ` ${meridiem}`);
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
};

const MessageList: React.FC = () => {
  const classes = useStyles();
  const { messages, aiIconStatus } = useSelector((state: StateType) => state.aiChat);
  const { language } = useSelector((state: StateType) => state.core);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  moment.locale(language);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollToBottom = () => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth'
        });
      };
      
      // Scroll immediately when new messages are added
      scrollToBottom();
      
      // Also scroll after a short delay to handle dynamic content (like images) loading
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
          <Box className={msg.MessageTypeID === 1 ?  classes.userBubbleWrapper: classes.aiBubbleWrapper}>
            <Paper
              className={`${classes.messageBubble} ${
                msg.MessageTypeID === 1 ? classes.userBubble : classes.aiBubble
              } ${msg.MessageTypeID === 1 ? 'user-bubble' : 'ai-bubble'}`}
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
                  {/* {formatTime(msg.MessageTimestamp)} */}
                  {moment(msg.MessageTimestamp)?.format('HH:mm a')}
                </Typography>
              )}
            </Paper>
          </Box>
        </Box>
      ))}
      {aiIconStatus === 1 && (
        <Box className={`${classes.messageRow} ${classes.aiMessage}`}>
          <Paper className={classes.typingBubble} elevation={1}>
            <span className={classes.messageDot}>
              {t("common.messageDot")}
            </span>
            <span className={classes.typingDot} />
            <span className={classes.typingDot} />
            <span className={classes.typingDot} />
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default MessageList;
