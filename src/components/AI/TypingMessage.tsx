import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  typingContainer: {
    position: 'absolute',
    bottom: '100%',
    right: 0,
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1, 2),
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
    minWidth: '200px',
    whiteSpace: 'nowrap',
  },
  text: {
    color: '#333',
    fontWeight: 500,
  },
  cursor: {
    display: 'inline-block',
    width: '2px',
    height: '1em',
    backgroundColor: '#FF1744',
    marginLeft: '2px',
    animation: '$blink 1s infinite',
  },
  '@keyframes blink': {
    '0%, 100%': {
      opacity: 1,
    },
    '50%': {
      opacity: 0,
    },
  },
}));

interface TypingMessageProps {
  message: string;
  typingSpeed?: number;
}

const TypingMessage: React.FC<TypingMessageProps> = ({ 
  message, 
  typingSpeed = 50 
}) => {
  const classes = useStyles();
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let currentIndex = 0;
    setDisplayText('');
    setIsTyping(true);

    const typingInterval = setInterval(() => {
      if (currentIndex < message.length) {
        setDisplayText(prev => prev + message[currentIndex]);
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, typingSpeed);

    return () => clearInterval(typingInterval);
  }, [message, typingSpeed]);

  return (
    <Box className={classes.typingContainer}>
      <Typography variant="body2" className={classes.text}>
        {displayText}
        {isTyping && <span className={classes.cursor} />}
      </Typography>
    </Box>
  );
};

export default TypingMessage;
