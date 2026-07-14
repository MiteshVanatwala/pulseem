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

type StyleProps = { isRTL: boolean; isAffectedPage: boolean; featureId: number; isOpen: boolean; isDrawerOpen: boolean };

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'fixed',
    width: '60px',
    height: '60px',
    bottom: ({ isAffectedPage }: StyleProps) => isAffectedPage ? 'calc(170px - 5vh)' : 'calc(105px - 5vh)',
    left: ({ isRTL, isAffectedPage, featureId, isDrawerOpen }: StyleProps) => {
      if (featureId === 73) {
        // Support Mascot: In LTR, sidebar is on the left, so it must slide.
        return isRTL ? 'auto' : (isDrawerOpen ? '75px' : '249px');
      }
      if (featureId === 69) {
        // Pulsy AI: In RTL, it's on the left (opposite of sidebar), no sliding needed.
        return isRTL ? (isAffectedPage ? '0px' : '5px') : 'auto';
      }
      return 'auto';
    },
    right: ({ isRTL, isAffectedPage, featureId, isDrawerOpen }: StyleProps) => {
      if (featureId === 73) {
        // Support Mascot: In RTL, sidebar is on the right, so it must slide.
        return isRTL ? (isDrawerOpen ? '75px' : '249px') : 'auto';
      }
      if (featureId === 69) {
        // Pulsy AI: In LTR, it's on the right (opposite of sidebar), no sliding needed.
        return isRTL ? 'auto' : (isAffectedPage ? '10px' : '20px');
      }
      return 'auto';
    },
    zIndex: ({ isOpen }: StyleProps) => isOpen ? 1297 : 1300,
    transition: 'bottom 0.3s ease, right 0.3s ease, left 0.3s ease',
  },
  fab: {
    width: '60px',
    height: '60px',
    border: 'solid',
    borderWidth: '0px',
    borderColor: '#FF1744',
    backgroundColor: 'transparent',
    color: 'white',
    zIndex: ({ isOpen }: StyleProps) => isOpen ? 1297 : 1300,
    '&:hover': {
      borderColor: '#FF4569',
      backgroundColor: 'transparent',
    },
    animation: '$pulse 2s infinite',
  },
  smallIcon: {
    position: 'absolute',
    top: '-5px',
    bottom: 'auto',
    right: '-5px',
    left: 'auto',
    '& img': {
      position: 'absolute',
      top: '-3px',
      bottom: 'auto',
      right: '-3px',
      left: 'auto',
      width: '20px',
      height: '20px',
    }
  },
  smallIconRTL69: {
    top: 'auto',
    bottom: '-5px',
    right: 'auto',
    left: '-5px',
    '& img': {
      top: 'auto',
      bottom: '-3px',
      right: 'auto',
      left: '-3px',
    }
  },
  polyIcon: {
    transform: ({ isRTL }: StyleProps) => isRTL ? 'scaleX(-1)' : 'none',
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
  customTooltip: {
    maxWidth: '250px',
    width: 'max-content',
    fontSize: '13px',
    padding: '8px 12px',
    textAlign: 'center',
    lineHeight: 1.3,
  }
}));

interface AIFloatingButtonProps {
  config?: AIChatConfig;
}

const AIFloatingButton: React.FC<AIFloatingButtonProps> = ({ config = advisorConfig }) => {
  const location = useLocation();
  const { isRTL, isDrawerOpen } = useSelector((state: StateType) => state.core);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { accountFeatures } = useSelector((state: StateType) => state.common);

  const isSupport = config.reduxSliceName === 'supportChat';
  const { aiIconStatus, isOpen } = useSelector((state: StateType) =>
    isSupport ? state.supportChat : state.aiChat
  );
  const agentIconTitle = isSupport ? t("common.polyAgentIconTitleSupport") : t("common.polyAgentIconTitle");
  const affectedPages = ['campaigns/editor', 'editor/landingpages', 'popupeditor', 'whatsapp/chat'];
  const pathname = location.pathname.toLowerCase();
  const isAffectedPage = affectedPages.some(page => pathname.includes(page));
  const classes = useStyles({ isRTL, isAffectedPage, featureId: config.featureId, isOpen, isDrawerOpen });

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
    <div className={classes.container}>
      <Tooltip
        arrow
        title={agentIconTitle}
        placement={config.featureId === 73 ? "top-start" : "top-end"}
        open
        PopperProps={{ disablePortal: true }}
        classes={{ tooltip: classes.customTooltip }}
      >
        <Fab className={classes.fab} onClick={handleToggleChat}>
          <div className={`${classes.smallIcon}${config.featureId === 69 && isRTL ? ` ${classes.smallIconRTL69}` : ''}`}>
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
    </div>
  );
};

export default AIFloatingButton;
