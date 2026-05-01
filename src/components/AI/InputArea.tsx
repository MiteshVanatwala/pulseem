import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, TextField, IconButton, Button, Tooltip } from '@material-ui/core';
import { Send as SendIcon } from '@material-ui/icons';
import CustomTooltip from '../Tooltip/CustomTooltip';
import { makeStyles } from '@material-ui/core/styles';
import { addMessage, addUserMessage, setAIIconStatus } from '../../redux/reducers/aiChatSlice';
import { addSupportMessage, addSupportUserMessage, setSupportAIIconStatus, startNewSupportSession, escapeToAgent } from '../../redux/reducers/supportChatSlice';
import { StateType } from '../../Models/StateTypes';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import { AIChatConfig, advisorConfig } from './chatConfig';

const useStyles = makeStyles((theme) => ({
  inputArea: {
    padding: '8px 16px',
    backgroundColor: '#ffffff',
    border: `1px solid ${theme.palette.divider}`,
    flexDirection: 'column',
  },
  inputRow: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  input: {
    '& .MuiInputBase-root': {
        borderRadius: '20px',
        backgroundColor: '#f0f0f0',
        transition: 'box-shadow 0.2s ease-in-out',
        '& textarea': {
            '&::-webkit-scrollbar': {
                width: '8px',
            },
            '&::-webkit-scrollbar-track': {
                background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
                background: '#f0f0f0',
                borderRadius: '4px',
            },
            scrollbarWidth: 'thin',
            scrollbarColor: '#f0f0f0 transparent',
        },
    },
    '& .MuiOutlinedInput-notchedOutline': {
        border: 'none',
    },
    '& .Mui-focused .MuiInputBase-root': {
        boxShadow: `0 0 0 2px ${theme.palette.primary.main}40`,
    },
  },
  characterCount: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    marginTop: '2px',
    textAlign: 'right',
  },
  footerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
}));

export interface InputAreaHandle {
  focus: () => void;
}

interface InputAreaProps {
  config?: AIChatConfig;
}

const InputArea: React.ForwardRefRenderFunction<InputAreaHandle, InputAreaProps> = ({ config = advisorConfig }, ref) => {
  const { isRTL } = useSelector((state: any) => state.core);
  const classes = useStyles();
  const dispatch = useDispatch();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useTranslation();
  const [text, setText] = useState('');

  const isSupport = config.reduxSliceName === 'supportChat';
  const { totalMessagesForUserCount, aiIconStatus, isEscalated, suggestAgent } = useSelector((state: StateType) =>
    isSupport ? state.supportChat : state.aiChat
  );

  const handleSend = () => {
    const trimmedText = text.trim();
    if (trimmedText) {
      if (isSupport) {
        dispatch(addSupportUserMessage({
          MessageID: uuidv4(),
          MessageTimestamp: new Date().toISOString(),
          MessageTypeID: 1,
          ResponseTimeMs: null,
          MessageText: trimmedText,
        }));
        dispatch(addSupportMessage({ MessageText: trimmedText, MessageTypeID: 1 }));
        dispatch(setSupportAIIconStatus(1));
      } else {
        dispatch(addUserMessage({
          MessageID: uuidv4(),
          MessageTimestamp: new Date().toISOString(),
          MessageTypeID: 1,
          ResponseTimeMs: null,
          MessageText: trimmedText,
        }));
        dispatch(addMessage({ MessageText: trimmedText, MessageTypeID: 1 }));
        dispatch(setAIIconStatus(1));
      }
      setText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStartNewConversation = () => {
    dispatch(startNewSupportSession());
  };

  const handleEscalate = () => {
    if (!isEscalated) dispatch(escapeToAgent());
  };

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    }
  }));

  const showNewConversationButton = isSupport;
  const showFooterRow = showNewConversationButton;
  // Contact Agent button: always visible for support pre-escalation, disabled until 2 exchanges
  const showContactAgentButton = isSupport && !isEscalated;
  const contactAgentDisabled = (totalMessagesForUserCount < 2 && !suggestAgent) || aiIconStatus === 1;

  return (
    <Box display="flex" className={classes.inputArea}>
      <Box className={classes.inputRow}>
        <TextField
          className={classes.input}
          variant="outlined"
          size="small"
          fullWidth
          inputRef={inputRef}
          placeholder={isSupport ? t("common.agentPlaceholderSupport") :t("common.agentPlaceholder") }
          value={text}
          onChange={(e) => {
            if (e.target.value.length <= config.maxChars) {
              setText(e.target.value);
            }
          }}
          onKeyPress={handleKeyPress}
          multiline
          maxRows={3}
          disabled={aiIconStatus === 1}
          inputProps={{
            maxLength: config.maxChars
          }}
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          style={{ marginRight: '8px' }}
          disabled={aiIconStatus === 1}
        >
          <SendIcon style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }} />
        </IconButton>
      </Box>
      <Box className={classes.characterCount}>
        {text.length}/{config.maxChars}
      </Box>
      {showFooterRow && (
        <Box className={classes.footerRow}>
          {/* Contact Agent — left side (opposite "Start New Conversation") */}
          {showContactAgentButton ? (
            <Box style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <Tooltip
                title={contactAgentDisabled ? t('common.contactAgentTooltip') : ''}
                arrow
                placement="top"
              >
                <span>
                  <Button
                    size="small"
                    onClick={handleEscalate}
                    disabled={contactAgentDisabled}
                    style={{
                      color: contactAgentDisabled ? undefined : '#dd2339',
                      borderColor: contactAgentDisabled ? undefined : '#dd2339',
                    }}
                    variant="outlined"
                  >
                    {t('common.contactAgent')}
                  </Button>
                </span>
              </Tooltip>
              {contactAgentDisabled && (
                // @ts-ignore
                <CustomTooltip
                  text={t('common.contactAgentTooltip')}
                  placement="top"
                  isSimpleTooltip={true}
                  style={{ fontSize: 14 }}
                />
              )}
            </Box>
          ) : (
            <span />
          )}
          {showNewConversationButton && (
            <Button
              size="small"
              color="primary"
              onClick={handleStartNewConversation}
              disabled={aiIconStatus === 1}
            >
              {t("common.startNewConversation")}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default forwardRef(InputArea);
