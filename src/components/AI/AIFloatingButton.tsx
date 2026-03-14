import React from 'react';
import { Fab, Tooltip, CircularProgress } from '@material-ui/core';
import { Check } from '@material-ui/icons';
import { useDispatch, useSelector } from 'react-redux';
import { toggleChat } from '../../redux/reducers/aiChatSlice';
import { toggleSupportChat } from '../../redux/reducers/supportChatSlice';
import { makeStyles } from '@material-ui/core/styles';
import AIImage from "../../assets/images/AI-icon.png";
import { useTranslation } from 'react-i18next';
import { StateType } from '../../Models/StateTypes';
import { useLocation } from 'react-router-dom';
import { AIChatConfig, advisorConfig } from './chatConfig';

const useStyles = makeStyles((theme) => ({
  fab: {
    position: 'fixed',
    bottom: ({ isAffectedPage }: { isRTL: boolean; isAffectedPage: boolean }) => isAffectedPage ? '170px' : '105px',
    left: ({ isAffectedPage, featureId }: { isRTL: boolean; isAffectedPage: boolean; featureId: number }) => {
      if (featureId === 73) return isAffectedPage ? '10px' : '5px';
    },
    right: '20px',
    width: '60px',
    height: '60px',
    border: 'solid',
    borderWidth: '0px',
    borderColor: '#FF1744',
    backgroundColor: 'transparent',
    color: 'white',
    zIndex: 1300,
    '&:hover': {
      borderColor: '#FF4569',
      backgroundColor: 'transparent',
    },
    animation: '$pulse 2s infinite',
    transition: 'bottom 0.3s ease',
  },
  smallIcon: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    '& img': {
      position: 'absolute',
      top: '-3px',
      right: '-3px',
      width: '20px',
      height: '20px',
    }
  },
  polyIcon: {
    transform: ({ isRTL }: { isRTL: boolean; isAffectedPage: boolean; featureId: number }) => isRTL ? 'scaleX(-1)' : 'none',
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

interface AIFloatingButtonProps {
  config?: AIChatConfig;
}

const AIFloatingButton: React.FC<AIFloatingButtonProps> = ({ config = advisorConfig }) => {
  const location = useLocation();
  const isRTL = useSelector((state: StateType) => state.core.isRTL);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { accountFeatures } = useSelector((state: StateType) => state.common);

  const isSupport = config.reduxSliceName === 'supportChat';
  const { aiIconStatus } = useSelector((state: StateType) =>
    isSupport ? state.supportChat : state.aiChat
  );
  const agentIconTitle = isSupport ? t("common.polyAgentIconTitleSupport") : t("common.polyAgentIconTitle");
  const affectedPages = ['campaigns/editor', 'editor/landingpages', 'popupeditor', 'whatsapp/chat'];
  const pathname = location.pathname.toLowerCase();
  const isAffectedPage = affectedPages.some(page => pathname.includes(page));
  const classes = useStyles({ isRTL, isAffectedPage, featureId: config.featureId });

  const handleToggleChat = () => {
    if (isSupport) {
      dispatch(toggleSupportChat());
    } else {
      dispatch(toggleChat());
    }
  };

  const featureKey = String(config.featureId);
  if (accountFeatures === null || accountFeatures?.indexOf(featureKey) === -1) return <></>;

  return (
    <Tooltip
      arrow
      title={agentIconTitle}
      placement={"top"}
      open
    >
      <Fab className={classes.fab} onClick={handleToggleChat}>
        <div className={classes.smallIcon}>
          {aiIconStatus === 0 ? (
            <img src={AIImage} alt="AI status" />
          ) : aiIconStatus === 1 ? (
            <CircularProgress size={15} />
          ) : (
            <Check fontSize="small" color="primary" style={{ color: 'green' }} />
          )}
        </div>
        <img width={60} src={config.mascotButtonImage} className={classes.polyIcon} alt="Pulseem mascot" />
      </Fab>
    </Tooltip>
  );
};

export default AIFloatingButton;
