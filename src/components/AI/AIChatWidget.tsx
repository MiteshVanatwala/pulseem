import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Paper, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { StateType } from '../../Models/StateTypes';
import { toggleChat, loadSessionMessages, setAIIconStatus, openAIChat } from '../../redux/reducers/aiChatSlice';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import InputArea from './InputArea';
import MascotImage from "../../assets/images/mascot_pointing.png";
import { useTypewriter } from '../../hooks/useTypewriter';
import { useTranslation } from 'react-i18next';
import { setIsLoader } from '../../redux/reducers/coreSlice';
import { PulseemFeatures } from '../../model/PulseemFields/Fields';

const useStyles = makeStyles((theme) => ({
  PolyWidget: {
    position: 'fixed',
    top: '40%',
    left: '50%',
    width: '50vw',
    height: '50vh',
    maxHeight: '50vh',
    // minWidth: '200px',
    maxWidth: '1000px',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 150ms ease-out, opacity 150ms ease-out',
    transform: 'translate(-50%, -50%) scale(0.95)',
    opacity: 0,
    pointerEvents: 'none',
    borderRadius: '12px',
    // overflow: 'hidden',
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
    // overflow: 'hidden',
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
    zIndex: 1298, // Below both widget and button
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
    zIndex: 1300, // Above backdrop, below button
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

const AIChatWidget: React.FC = () => {
  const { isRTL } = useSelector((state: any) => state.core);
  const { username } = useSelector((state: any) => state.user);
  const classes = useStyles({ isRTL });
  const dispatch = useDispatch();
  const inputAreaRef = useRef<{ focus: () => void }>(null);
  const { t } = useTranslation();
  const { isOpen, messages, totalMessagesForUserCount } = useSelector((state: StateType) => state.aiChat);
  const { accountFeatures } = useSelector((state: StateType) => state.common);
  const { displayedText, isTyping } = useTypewriter({
    text: t("common.polyAgentIconTitleMarquee"),
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
      // Focus the input when the widget opens
      setTimeout(() => {
        inputAreaRef.current?.focus();
      }, 300); // Small delay to ensure the animation is complete

      if (messages.length === 0) dispatch(setAIIconStatus(1));
    }
  }, [isOpen]);

  useEffect(() => {
    const initializeChat = async () => {
      if (totalMessagesForUserCount === -1) await dispatch(loadSessionMessages());
      // Only auto-close if there are no messages at all (neither in API nor in local state)
      if (totalMessagesForUserCount === 0 && messages.length === 1 && username) {
        try {
          const hideAIChatDialog = localStorage.getItem('hideAIChatDialog');
          if (hideAIChatDialog !== 'true' && !isOpen) {
            dispatch(openAIChat());
            // await dispatch(addMessage({
            //   MessageText: `${t("common.welcomeMessage").replace("{USERNAME}", username)}`,
            //   MessageTypeID: 1
            // }));
            // dispatch(setIsLoader(true));
          }
        } catch (error) {
          console.error('Error sending initial message:', error);
        }
      }
    };

    if (totalMessagesForUserCount < 1 && username && accountFeatures?.indexOf(PulseemFeatures.PolyAIAgent) !== -1) {
      initializeChat();
    }

    // if (totalMessagesForUserCount > 0) {
    //   dispatch(setIsLoader(false));
    // }
  }, [dispatch, messages, username, totalMessagesForUserCount])

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
            <ChatHeader />
            <Box className={classes.Polycontent}>
              <MessageList />
              {/* {messages.length === 0 && <PresetQuestions />} */}
              {/* {<PresetQuestions />} */}
            </Box>
            <InputArea ref={inputAreaRef} />
            <div className={classes.PolymascotImage}>
              <div className="message">
                {displayedText}
                {isTyping && <span className={classes.Polycursor} />}
              </div>
              <img src={MascotImage} alt="Pulseem Mascot" />
            </div>
        </Paper>
    </div>
  );
};

export default AIChatWidget;
