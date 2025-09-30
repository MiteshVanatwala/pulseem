import React from 'react';
import { AppBar, Toolbar, Typography, IconButton } from '@material-ui/core';
import { Close as CloseIcon, Minimize as MinimizeIcon } from '@material-ui/icons';
import { useDispatch } from 'react-redux';
import { toggleChat } from '../../redux/reducers/aiChatSlice';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  appBar: {
    backgroundColor: '#FF1744', // Primary color
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
    '.miniIcon': {
      fontSize: '2rem'
    }
  },
  toolbar: {
    minHeight: '48px',
  },
  title: {
    flexGrow: 1,
    fontSize: '1rem',
  },
}));

const ChatHeader: React.FC = () => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const handleClose = () => {
    dispatch(toggleChat());
  };

  return (
    <AppBar position="static" className={classes.appBar} elevation={0}>
      <Toolbar variant="dense" className={classes.toolbar}>
        <Typography variant="h6" className={classes.title}>
          Pulseem AI Assistant
        </Typography>
        {/* <IconButton color="inherit" size="small">
          <MinimizeIcon />
        </IconButton> */}
        <IconButton color="inherit" onClick={handleClose} size="medium" className='miniIcon'>
          <MinimizeIcon style={{ fontSize: '2.5rem', marginTop: '-10px' }} />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default ChatHeader;
