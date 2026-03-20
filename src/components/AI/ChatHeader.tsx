import React from 'react';
import { AppBar, Toolbar, Typography, IconButton } from '@material-ui/core';
import { Minimize as MinimizeIcon } from '@material-ui/icons';
import { useDispatch } from 'react-redux';
import { toggleChat } from '../../redux/reducers/aiChatSlice';
import { toggleSupportChat } from '../../redux/reducers/supportChatSlice';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { AIChatConfig, advisorConfig } from './chatConfig';

const useStyles = makeStyles((theme) => ({
  appBar: {
    backgroundColor: '#FF1744',
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

interface ChatHeaderProps {
  config?: AIChatConfig;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ config = advisorConfig }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const handleClose = () => {
    if (config.reduxSliceName === 'supportChat') {
      dispatch(toggleSupportChat());
    } else {
      dispatch(toggleChat());
    }
  };

  return (
    <AppBar position="static" className={classes.appBar} elevation={0}>
      <Toolbar variant="dense" className={classes.toolbar}>
        <Typography variant="h6" className={classes.title}>
          {t(config.headerTitleKey)}
        </Typography>
        <IconButton color="inherit" onClick={handleClose} size="medium" className='miniIcon'>
          <MinimizeIcon style={{ fontSize: '2.5rem', marginTop: '-10px' }} />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default ChatHeader;
