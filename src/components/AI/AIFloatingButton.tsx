import React, { useState, useEffect, useCallback } from 'react';
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
import { useDraggable } from '../../hooks/useDraggable';

type StyleProps = { isRTL: boolean; isAffectedPage: boolean; featureId: number; isOpen: boolean; isDrawerOpen: boolean; isMobile: boolean };

// Support Mascot (featureId 73) always sits on the same side as the sidebar (LTR: left, RTL: right).
// On mobile the sidebar is a full overlay, not a rail, so instead of sliding with it, the mascot
// just hides while the sidebar is open — Pulsy (69) is always on the opposite side and never needs to hide.
const shouldHideOnMobileDrawer = ({ featureId, isMobile, isDrawerOpen }: StyleProps) =>
  featureId === 73 && isMobile && isDrawerOpen;

// Group dynamic route segments (numeric ids, GUIDs) so the same logical screen
// shares one saved position (e.g. every campaign editor, not per campaign id).
const normalizeScreenKey = (pathname: string): string =>
  pathname
    .toLowerCase()
    .split('/')
    .filter(Boolean)
    .filter((seg) => !/^\d+$/.test(seg) && !/^[0-9a-f]{8}-[0-9a-f]{4}-/.test(seg))
    .join('/') || 'root';

// One-time "you can drag me" discoverability hint — shown once per user, then never again.
const HINT_FLAG = 'pulsiDragHintSeen';
const hintAlreadySeen = (): boolean => {
  try { return window.localStorage.getItem(HINT_FLAG) === '1'; } catch { return false; }
};
const markHintSeen = (): void => {
  try { window.localStorage.setItem(HINT_FLAG, '1'); } catch { /* private mode — hint may re-show */ }
};

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'fixed',
    width: '60px',
    height: '60px',
    bottom: ({ isAffectedPage }: StyleProps) => isAffectedPage ? 'calc(170px - 5vh)' : 'calc(105px - 5vh)',
    left: (props: StyleProps) => {
      const { isRTL, isAffectedPage, featureId, isDrawerOpen, isMobile } = props;
      if (featureId === 73) {
        // Support Mascot: In LTR, sidebar is on the left, so it must slide (desktop) or just sit near the edge (mobile, hidden while drawer is open).
        if (isRTL) return 'auto';
        return isMobile ? '12px' : (isDrawerOpen ? '75px' : '249px');
      }
      if (featureId === 69) {
        // Pulsy AI: In RTL, it's on the left (opposite of sidebar), no sliding needed.
        return isRTL ? (isAffectedPage ? '0px' : '5px') : 'auto';
      }
      return 'auto';
    },
    right: (props: StyleProps) => {
      const { isRTL, isAffectedPage, featureId, isDrawerOpen, isMobile } = props;
      if (featureId === 73) {
        // Support Mascot: In RTL, sidebar is on the right, so it must slide (desktop) or just sit near the edge (mobile, hidden while drawer is open).
        if (!isRTL) return 'auto';
        return isMobile ? '12px' : (isDrawerOpen ? '75px' : '249px');
      }
      if (featureId === 69) {
        // Pulsy AI: In LTR, it's on the right (opposite of sidebar), no sliding needed.
        return isRTL ? 'auto' : (isAffectedPage ? '10px' : '20px');
      }
      return 'auto';
    },
    zIndex: ({ isOpen }: StyleProps) => isOpen ? 1297 : 1300,
    opacity: (props: StyleProps) => shouldHideOnMobileDrawer(props) ? 0 : 1,
    visibility: (props: StyleProps) => shouldHideOnMobileDrawer(props) ? 'hidden' : 'visible',
    pointerEvents: (props: StyleProps) => shouldHideOnMobileDrawer(props) ? 'none' : 'auto',
    transition: 'bottom 0.3s ease, right 0.3s ease, left 0.3s ease, opacity 0.2s ease',
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
    // Inherit the container's grab/grabbing cursor (MUI's ButtonBase forces `pointer`,
    // which would otherwise mask the drag affordance on desktop).
    cursor: 'inherit',
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
  const { isRTL, isDrawerOpen, windowSize } = useSelector((state: StateType) => state.core);
  const isMobile = windowSize === 'xs' || windowSize === 'sm';
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
  const classes = useStyles({ isRTL, isAffectedPage, featureId: config.featureId, isOpen, isDrawerOpen, isMobile });

  // Draggable + per-screen persistence. Key by mascot (featureId) and current screen.
  const screenKey = `${config.featureId}:${normalizeScreenKey(location.pathname)}`;
  const draggable = useDraggable({ storageKey: screenKey });

  // One-time drag hint: reuse the mascot's own speech bubble to say "you can drag me" once.
  const featureKey = String(config.featureId);
  const isEnabled = accountFeatures !== null && accountFeatures.indexOf(featureKey) !== -1;
  const [showHint, setShowHint] = useState(false);
  const dismissHint = useCallback(() => {
    setShowHint(false);
    markHintSeen();
  }, []);

  // Show the hint on first appearance, then auto-dismiss after a few seconds.
  useEffect(() => {
    if (!isEnabled || hintAlreadySeen()) return;
    setShowHint(true);
    const timer = setTimeout(dismissHint, 5000);
    return () => clearTimeout(timer);
  }, [isEnabled, dismissHint]);

  // A drag also dismisses the hint — the user has clearly discovered the gesture.
  useEffect(() => {
    if (draggable.isDragging) dismissHint();
  }, [draggable.isDragging, dismissHint]);

  const handleToggleChat = () => {
    if (showHint) dismissHint();
    if (isSupport) {
      dispatch(toggleSupportChat());
    } else {
      dispatch(toggleChat());
    }
  };

  if (!isEnabled) return <></>;

  return (
    <div
      ref={draggable.ref}
      className={classes.container}
      style={draggable.style}
      {...draggable.handlers}
      onClickCapture={(e) => {
        // A drag must not also open the chat — swallow the click it produced.
        if (draggable.consumeClickAfterDrag()) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <Tooltip
        arrow
        title={showHint ? t("common.dragHint") : agentIconTitle}
        placement={config.featureId === 73 ? "top-start" : "top-end"}
        {...(showHint
          ? { open: true }
          : isMobile
            ? {}
            : { open: !draggable.isDragging })}
        PopperProps={{ disablePortal: true }}
        classes={{ tooltip: classes.customTooltip }}
      >
        <Fab
          className={classes.fab}
          onClick={handleToggleChat}
          aria-label={agentIconTitle}
          style={draggable.isDragging
            ? { transform: 'scale(1.05)', boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)', animationPlayState: 'paused' }
            : undefined}
        >
          <div className={`${classes.smallIcon}${config.featureId === 69 && isRTL ? ` ${classes.smallIconRTL69}` : ''}`}>
            {aiIconStatus === 0 ? (
              <img src={AIImage} alt="AI status" />
            ) : aiIconStatus === 1 ? (
              <CircularProgress size={15} />
            ) : (
              <Check fontSize="small" color="primary" style={{ color: 'green' }} />
            )}
          </div>
          <img width={60} src={config.mascotButtonImage} className={classes.polyIcon} alt="Pulseem mascot" draggable={false} />
        </Fab>
      </Tooltip>
    </div>
  );
};

export default AIFloatingButton;
