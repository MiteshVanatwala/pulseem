import React from 'react';
import { useSelector } from 'react-redux';
import { Paper, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { StateType } from '../../Models/StateTypes';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import InputArea from './InputArea';
import PresetQuestions from './PresetQuestions';

const useStyles = makeStyles((theme) => ({
  widget: {
    position: 'fixed',
    bottom: '80px',
    right: theme.spacing(2),
    width: '350px',
    height: '70vh',
    maxHeight: '700px',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 300ms ease-out, opacity 300ms ease-out',
    transform: 'translateY(20px) scale(0.95)',
    opacity: 0,
    pointerEvents: 'none',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  },
  widgetOpen: {
    transform: 'translateY(0) scale(1)',
    opacity: 1,
    pointerEvents: 'auto',
  },
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(4px)',
    transition: 'opacity 300ms ease-out',
    opacity: 0,
    pointerEvents: 'none',
    zIndex: 1299, // One less than the widget
  },
  backdropOpen: {
    opacity: 1,
  },
  widgetContainer: {
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    zIndex: 1300,
    pointerEvents: 'none',
  }
}));

const AIChatWidget: React.FC = () => {
  const classes = useStyles();
  const { isOpen, messages } = useSelector((state: StateType) => state.aiChat);

  // Stop propagation to prevent clicks inside the widget from closing it if the backdrop handler is on the same element.
  const handleWidgetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className={classes.widgetContainer}>
        <div className={`${classes.backdrop} ${isOpen ? classes.backdropOpen : ''}`} />
        <Paper
            className={`${classes.widget} ${isOpen ? classes.widgetOpen : ''}`}
            elevation={5}
            onClick={handleWidgetClick}
        >
            <ChatHeader />
            <MessageList />
            {messages.length === 0 && <PresetQuestions />}
            <InputArea />
        </Paper>
    </div>
  );
};

export default AIChatWidget;
