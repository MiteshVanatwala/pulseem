import React, { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { StateType } from '../../Models/StateTypes';
import InsightRenderer from './InsightRenderer';

const useStyles = makeStyles((theme) => ({
  messageList: {
    flexGrow: 1,
    overflowY: 'auto',
    padding: theme.spacing(2),
    backgroundColor: '#ffffff',
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
    maxWidth: '70%',
  },
  userBubble: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderBottomRightRadius: '5px',
  },
  aiBubble: {
    backgroundColor: '#f0f0f0',
    color: theme.palette.text.primary,
    borderBottomLeftRadius: '5px',
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

const MessageList: React.FC = () => {
  const classes = useStyles();
  const { messages, isLoading } = useSelector((state: StateType) => state.aiChat);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Box className={classes.messageList} ref={scrollRef}>
      {messages.map((msg, index) => (
        <Box
          key={msg.id}
          style={{ animationDelay: `${index * 100}ms` }}
          className={`${classes.messageRow} ${
            msg.sender === 'user' ? classes.userMessage : classes.aiMessage
          }`}
        >
          <Paper
            className={`${classes.messageBubble} ${
              msg.sender === 'user' ? classes.userBubble : classes.aiBubble
            }`}
            elevation={1}
          >
            {msg.sender === 'user' ? (
              <Typography variant="body1">{msg.text}</Typography>
            ) : (
              <InsightRenderer message={msg.data} />
            )}
          </Paper>
        </Box>
      ))}
      {isLoading && (
        <Box className={`${classes.messageRow} ${classes.aiMessage}`}>
          <Paper className={classes.typingBubble} elevation={1}>
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
