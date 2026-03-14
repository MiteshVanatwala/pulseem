import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Paper, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { StateType } from '../../Models/StateTypes';
import { toggleChat, loadSessionMessages, setAIIconStatus, openAIChat } from '../../redux/reducers/aiChatSlice';
import { toggleSupportChat, loadSupportSessionMessages, setSupportAIIconStatus, openSupportChat } from '../../redux/reducers/supportChatSlice';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import InputArea from './InputArea';
import { useTypewriter } from '../../hooks/useTypewriter';
import { useTranslation } from 'react-i18next';
import { PulseemFeatures } from '../../model/PulseemFields/Fields';
import PresetQuestions from './PresetQuestions';
import { AIChatConfig, advisorConfig } from './chatConfig';

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
  Polycontent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  PolywidgetOpen: {
    transform: 'translate(-50%, -50%) scale(1)',
    opacity: 1,
    pointerEvents: 'auto',
    zIndex: 1299,
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
      '0%': {
        opacity: 1
      },
      '50%': {
        opacity: 0
      }
    }
  }
}));

interface AIChatWidgetProps {
  config?: AIChatConfig;
}

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
  const { isOpen, messages, totalMessagesForUserCount } = chatState;
  const { accountFeatures } = useSelector((state: StateType) => state.common);

  const { displayedText, isTyping } = useTypewriter({
    text: t(config.bubbleTextKey),
    speed: 100,
    delay: 1000,
    loop: false,
    startTyping: isOpen
  });

  const handleWidgetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleBackdropClick = () => {
    // dispatch(toggleChat());
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputAreaRef.current?.focus();
      }, 300);

      if (messages.length === 0) {
        if (isSupport) {
          dispatch(setSupportAIIconStatus(1));
        } else {
          dispatch(setAIIconStatus(1));
        }
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const initializeChat = async () => {
      if (totalMessagesForUserCount === -1) {
        if (isSupport) {
          await dispatch(loadSupportSessionMessages());
        } else {
          await dispatch(loadSessionMessages());
        }
      }
      // Auto-open only for feature 69 (marketing advisor)
      if (!isSupport && totalMessagesForUserCount === 0 && messages.length === 1 && username) {
        try {
          const hideAIChatDialog = localStorage.getItem('hideAIChatDialog');
          if (hideAIChatDialog !== 'true' && !isOpen) {
            dispatch(openAIChat());
          }
        } catch (error) {
          console.error('Error sending initial message:', error);
        }
      }
    };

    const featureKey = String(config.featureId);
    if (totalMessagesForUserCount < 1 && username && accountFeatures !== null && accountFeatures?.indexOf(featureKey) !== -1) {
      initializeChat();
    }
  }, [dispatch, messages, username, totalMessagesForUserCount]);

  const featureKey = String(config.featureId);
  if (accountFeatures === null || accountFeatures?.indexOf(featureKey) === -1) return <></>;

  return (
    <div className={classes.PolywidgetContainer}>
        <div
          className={`${classes.Polybackdrop} ${isOpen ? classes.PolybackdropOpen : ''}`}
          onClick={handleBackdropClick}
        />
        <Paper
            className={`${classes.PolyWidget} ${isOpen ? classes.PolywidgetOpen : ''}`}
            elevation={5}
            onClick={handleWidgetClick}
        >
            <ChatHeader config={config} />
            <Box className={classes.Polycontent}>
              <MessageList config={config} />
              <PresetQuestions config={config} />
            </Box>
            <InputArea ref={inputAreaRef} config={config} />
            <div className={classes.PolymascotImage}>
              <div className="message">
                {displayedText}
                {isTyping && <span className={classes.Polycursor} />}
              </div>
              <img src={config.mascotWidgetImage} alt="Pulseem Mascot" />
            </div>
        </Paper>
    </div>
  );
};

export default AIChatWidget;
