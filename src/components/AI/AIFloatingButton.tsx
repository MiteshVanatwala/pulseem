import React from 'react';
import { Fab } from '@material-ui/core';
import { Chat as ChatIcon } from '@material-ui/icons';
import { useDispatch } from 'react-redux';
import { toggleChat } from '../../redux/reducers/aiChatSlice';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  fab: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '60px',
    height: '60px',
    backgroundColor: '#FF1744',
    color: 'white',
    '&:hover': {
      backgroundColor: '#FF4569',
    },
    animation: '$pulse 2s infinite',
  },
  '@keyframes pulse': {
    '0%': {
      boxShadow: '0 0 0 0 rgba(255, 23, 68, 0.4)',
    },
    '70%': {
      boxShadow: '0 0 0 10px rgba(255, 23, 68, 0)',
    },
    '100%': {
      boxShadow: '0 0 0 0 rgba(255, 23, 68, 0)',
    },
  },
}));

const AIFloatingButton: React.FC = () => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const handleToggleChat = () => {
    dispatch(toggleChat());
  };

  return (
    <Fab className={classes.fab} onClick={handleToggleChat}>
      <ChatIcon />
    </Fab>
  );
};

export default AIFloatingButton;
