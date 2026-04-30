import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Paper, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { StateType } from '../../Models/StateTypes';
import { toggleChat, loadSessionMessages, setAIIconStatus, openAIChat } from '../../redux/reducers/aiChatSlice';
import {
  toggleSupportChat, loadSupportSessionMessages, setSupportAIIconStatus,
  openSupportChat, escapeToAgent, pollAgentMessages
} from '../../redux/reducers/supportChatSlice';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import InputArea from './InputArea';
import { useTypewriter } from '../../hooks/useTypewriter';
import { useTranslation } from 'react-i18next';
import PresetQuestions from './PresetQuestions';
import { AIChatConfig, advisorConfig } from './chatConfig';
import { getIsBeeperAccount } from '../WhiteLabel/WhiteLabelMigrate';

const COMPACT_WIDTH = 360;
const COMPACT_HEIGHT = 510;

const useStyles = makeStyles((theme) => ({
  PolyWidget: {
    position: 'fixed',
    top: '35%',
    left: '50%',
    width: '58vw',
    height: '50vh',
    maxHeight: '50vh',
    maxWidth: '1000px',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 150ms ease-out, opacity 150ms ease-out',
    transform: 'translate(-50%, -50%) scale(0.95)',
    opacity: 0,
    pointerEvents: 'none',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    '& > *': {
      flexShrink: 0,
    },
    '& .MuiToolbar-root': {
      minHeight: '64px',
      '& .MuiTypography-h6': {
        fontSize: '1.25rem',
        fontWeight: 500,
      }
    },
    "@media screen and (max-width: 768px)": {
      top: '30%',
      width: '90%'
    }
  },
  PolyWidgetCompact: {
    width: `${COMPACT_WIDTH}px !important`,
    height: `${COMPACT_HEIGHT}px !important`,
    maxHeight: `${COMPACT_HEIGHT}px !important`,
    maxWidth: `${COMPACT_WIDTH}px !important`,
    top: 'auto !important',
    left: 'auto !important',
    // position controlled by inline style when compact
  },
  PolywidgetOpen: {
    transform: 'translate(-50%, -50%) scale(1)',
    opacity: 1,
    pointerEvents: 'auto',
    zIndex: 1299,
  },
  PolyWidgetCompactOpen: {
    transform: 'none !important',
    opacity: 1,
    pointerEvents: 'auto',
    zIndex: 1299,
  },
  Polycontent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  Polybackdrop: {
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
    zIndex: 1298,
  },
  PolybackdropOpen: {
    opacity: 1,
    pointerEvents: 'auto',
  },
  PolywidgetContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1300,
    pointerEvents: 'none',
  },
  PolymascotImage: {
    position: 'absolute',
    left: ({ isRTL }: { isRTL: boolean }) => isRTL ? 'auto' : '-300px',
    right: ({ isRTL }: { isRTL: boolean }) => isRTL ? '-300px' : 'auto',
    zIndex: 9,
    bottom: '-70px',
    '& img': {
      height: '300px',
      transform: ({ isRTL }: { isRTL: boolean }) => isRTL ? 'scaleX(-1)' : 'none',
    },
    "@media screen and (max-width: 768px)": {
      position: 'relative',
      left: 'auto !important',
      right: 'auto !important',
      bottom: 0,
      order: 3,
      margin: '10px auto',
      '& img': {
        height: '100px',
        display: 'block',
        margin: '0 auto',
      },
      '& div.message': {
        maxWidth: '80%',
        fontSize: '0.9rem',
        minHeight: '25px',
      }
    },
    '& div.message': {
      textAlign: 'center',
      backgroundColor: theme.palette.primary.main,
      color: 'white',
      padding: theme.spacing(1, 2),
      borderRadius: '20px',
      marginBottom: theme.spacing(2.5),
      maxWidth: '200px',
      margin: '0 auto',
      position: 'relative',
      minHeight: '40px',
      fontWeight: 'bold',
      direction: ({ isRTL }: { isRTL: boolean }) => isRTL ? 'rtl' : 'ltr',
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: '-10px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 0,
        height: 0,
        borderLeft: '10px solid transparent',
        borderRight: '10px solid transparent',
        borderTop: `10px solid ${theme.palette.primary.main}`,
      }
    }
  },
  Polycursor: {
    display: 'inline-block',
    width: '2px',
    height: '1em',
    backgroundColor: 'white',
    marginLeft: '2px',
    verticalAlign: 'middle',
    animation: 'cursor-blink 1s step-end infinite'
  },
  '@global': {
    '@keyframes cursor-blink': {
      '0%': { opacity: 1 },
      '50%': { opacity: 0 }
    }
  }
}));

interface AIChatWidgetProps {
  config?: AIChatConfig;
}

const defaultCompactPos = () => ({
  x: Math.max(0, window.innerWidth - COMPACT_WIDTH - 24),
  y: 80,
});

const AIChatWidget: React.FC<AIChatWidgetProps> = ({ config = advisorConfig }) => {
  const { isRTL } = useSelector((state: any) => state.core);
  const { username } = useSelector((state: any) => state.user);
  const classes = useStyles({ isRTL });
  const dispatch = useDispatch();
  const inputAreaRef = useRef<{ focus: () => void }>(null);
  const { t } = useTranslation();

  const isSupport = config.reduxSliceName === 'supportChat';
  const chatState = useSelector((state: StateType) =>
    isSupport ? state.supportChat : state.aiChat
  );
  const { isOpen, messages, totalMessagesForUserCount, isEscalated, suggestAgent, lastAgentMessageId } = chatState;
    const { accountFeatures, accountSettings } = useSelector((state: StateType) => state.common);

  // ─── Compact mode ──────────────────────────────────────────────────────────
  const [isCompact, setIsCompact] = useState<boolean>(() =>
    localStorage.getItem(config.compactModeKey) === 'true'
  );
  const [compactPos, setCompactPos] = useState(defaultCompactPos);

  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleHeaderMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isCompact) return;
    isDragging.current = true;
    dragOffset.current = { x: e.clientX - compactPos.x, y: e.clientY - compactPos.y };
    e.preventDefault();
  }, [isCompact, compactPos]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      setCompactPos({
        x: Math.max(0, Math.min(window.innerWidth - COMPACT_WIDTH, e.clientX - dragOffset.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragOffset.current.y)),
      });
    };
    const onMouseUp = () => { isDragging.current = false; };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const handleToggleCompact = () => {
    const next = !isCompact;
    setIsCompact(next);
    if (next) setCompactPos(defaultCompactPos());
    try { localStorage.setItem(config.compactModeKey, next ? 'true' : 'false'); } catch (_) {}
  };

  // ─── Minimize — saves preference ──────────────────────────────────────────
  const handleMinimize = () => {
    try { localStorage.setItem(config.localStorageKey, 'true'); } catch (_) {}
    dispatch(isSupport ? toggleSupportChat() : toggleChat());
  };

  // ─── Agent message cursor ref ─────────────────────────────────────────────
  const lastAgentMessageIdRef = useRef(lastAgentMessageId);
  useEffect(() => {
    lastAgentMessageIdRef.current = lastAgentMessageId;
  }, [lastAgentMessageId]);

  const { displayedText, isTyping } = useTypewriter({
    text: t(config.bubbleTextKey),
    speed: 100,
    delay: 1000,
    loop: false,
    startTyping: isOpen
  });

  // ─── Poll for agent messages every 5s ────────────────────────────────────
  useEffect(() => {
    if (!isSupport || !isEscalated || !isOpen) return;
    const intervalId = setInterval(() => {
      dispatch(pollAgentMessages(lastAgentMessageIdRef.current));
    }, 5000);
    return () => clearInterval(intervalId);
  }, [isSupport, isEscalated, isOpen, dispatch]);

  const handleWidgetClick = (e: React.MouseEvent) => e.stopPropagation();

  const handleEscalate = () => {
    if (isSupport && !isEscalated) dispatch(escapeToAgent());
  };

  // ─── Auto-focus + icon status on open ────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => { inputAreaRef.current?.focus(); }, 300);
      if (messages.length === 0) {
        dispatch(isSupport ? setSupportAIIconStatus(1) : setAIIconStatus(1));
      }
    }
  }, [isOpen]);

  // ─── Initialize / auto-open ───────────────────────────────────────────────
  useEffect(() => {
    const initializeChat = async () => {
      if (totalMessagesForUserCount === -1) {
        await dispatch(isSupport ? loadSupportSessionMessages() : loadSessionMessages());
      }
      if (totalMessagesForUserCount === 0 && messages.length === 1 && username) {
        try {
          const hideDialog = localStorage.getItem(config.localStorageKey);
          if (hideDialog !== 'true' && !isOpen) {
            dispatch(isSupport ? openSupportChat() : openAIChat());
          }
        } catch (error) {
          console.error('Error sending initial message:', error);
        }
      }
    };

    const featureKey = String(config.featureId);
    if (totalMessagesForUserCount < 1 && username &&
        accountFeatures !== null &&
        accountFeatures?.indexOf(featureKey) !== -1) {
      initializeChat();
    }
  }, [dispatch, messages, username, totalMessagesForUserCount]);

  const featureKey = String(config.featureId);
  if (accountFeatures === null || accountFeatures?.indexOf(featureKey) === -1) return <></>;
  if (getIsBeeperAccount(accountSettings)) return <></>;

  const compactStyle: React.CSSProperties | undefined = isCompact
    ? { position: 'fixed', top: compactPos.y, left: compactPos.x }
    : undefined;

  const openClass = isOpen
    ? (isCompact ? classes.PolyWidgetCompactOpen : classes.PolywidgetOpen)
    : '';

  return (
    <div className={classes.PolywidgetContainer}>
      {/* Backdrop only in full (non-compact) mode */}
      {!isCompact && (
        <div
          className={`${classes.Polybackdrop} ${isOpen ? classes.PolybackdropOpen : ''}`}
          onClick={() => {}}
        />
      )}
      <Paper
        className={`${classes.PolyWidget} ${isCompact ? classes.PolyWidgetCompact : ''} ${openClass}`}
        style={compactStyle}
        elevation={5}
        onClick={handleWidgetClick}
      >
        <ChatHeader
          config={config}
          isCompact={isCompact}
          onMinimize={handleMinimize}
          onToggleCompact={handleToggleCompact}
          onHeaderMouseDown={handleHeaderMouseDown}
        />
        <Box className={classes.Polycontent}>
          <MessageList config={config} />

          {isSupport && !isEscalated && (totalMessagesForUserCount >= 2 || suggestAgent) && (
            <Box style={{ padding: '6px 16px', textAlign: 'center' }}>
              <button
                onClick={handleEscalate}
                style={{
                  background: 'none',
                  border: '1px solid #dd2339',
                  color: '#dd2339',
                  borderRadius: '16px',
                  padding: '4px 14px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                {t('common.contactAgent')}
              </button>
            </Box>
          )}

          {isSupport && isEscalated && (
            <Box style={{ padding: '6px 16px', textAlign: 'center', fontSize: '0.8rem', color: '#888' }}>
              {t('common.connectedToAgent')}
            </Box>
          )}

          <PresetQuestions config={config} />
        </Box>
        <InputArea ref={inputAreaRef} config={config} />

        {/* Mascot hidden in compact mode */}
        {!isCompact && (
          <div className={classes.PolymascotImage}>
            <div className="message">
              {displayedText}
              {isTyping && <span className={classes.Polycursor} />}
            </div>
            <img src={config.mascotWidgetImage} alt="Pulseem Mascot" />
          </div>
        )}
      </Paper>
    </div>
  );
};

export default AIChatWidget;
