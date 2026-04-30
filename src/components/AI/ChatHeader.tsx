import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Tooltip } from '@material-ui/core';
import { Minimize as MinimizeIcon, CropSquare as CropSquareIcon, FullscreenExit as FullscreenExitIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { AIChatConfig, advisorConfig } from './chatConfig';

const useStyles = makeStyles(() => ({
  appBar: {
    backgroundColor: '#FF1744',
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
  },
  toolbar: {
    minHeight: '48px',
    cursor: 'default',
  },
  toolbarDraggable: {
    minHeight: '48px',
    cursor: 'grab',
    '&:active': {
      cursor: 'grabbing',
    },
  },
  title: {
    flexGrow: 1,
    fontSize: '1rem',
    userSelect: 'none',
  },
  headerIcon: {
    color: 'inherit',
    padding: '6px',
  },
}));

interface ChatHeaderProps {
  config?: AIChatConfig;
  isCompact?: boolean;
  onMinimize: () => void;
  onToggleCompact: () => void;
  onHeaderMouseDown?: (e: React.MouseEvent) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  config = advisorConfig,
  isCompact = false,
  onMinimize,
  onToggleCompact,
  onHeaderMouseDown,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <AppBar position="static" className={classes.appBar} elevation={0}>
      <Toolbar
        variant="dense"
        className={isCompact ? classes.toolbarDraggable : classes.toolbar}
        onMouseDown={isCompact ? onHeaderMouseDown : undefined}
      >
        <Typography variant="h6" className={classes.title}>
          {t(config.headerTitleKey)}
        </Typography>
        <Tooltip title={isCompact ? t('common.chatFullMode') : t('common.chatCompactMode')} arrow>
          <IconButton className={classes.headerIcon} onClick={onToggleCompact} size="small">
            {isCompact
              ? <FullscreenExitIcon style={{ fontSize: '1.4rem' }} />
              : <CropSquareIcon style={{ fontSize: '1.4rem' }} />
            }
          </IconButton>
        </Tooltip>
        <Tooltip title={t('common.minimize')} arrow>
          <IconButton className={classes.headerIcon} onClick={onMinimize} size="small">
            <MinimizeIcon style={{ fontSize: '1.8rem', marginTop: '-8px' }} />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
};

export default ChatHeader;
