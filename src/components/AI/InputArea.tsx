import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, TextField, IconButton, Checkbox, FormControlLabel } from '@material-ui/core';
import { Send as SendIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { addMessage, addUserMessage, setAIIconStatus } from '../../redux/reducers/aiChatSlice';
import { StateType } from '../../Models/StateTypes';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
  inputArea: {
    padding: theme.spacing(1, 2),
    backgroundColor: '#ffffff',
    borderTop: `1px solid ${theme.palette.divider}`,
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
        boxShadow: `0 0 0 2px ${theme.palette.primary.main}40`, // 25% opacity
    },
  },
  characterCount: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    marginTop: '4px',
    textAlign: 'right',
  },
  checkboxLabel: {
    marginTop: theme.spacing(1),
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
  },
}));

export interface InputAreaHandle {
  focus: () => void;
}

const InputArea: React.ForwardRefRenderFunction<InputAreaHandle, {}> = (props, ref) => {
  const { isRTL } = useSelector((state: any) => state.core);
  const classes = useStyles();
  const dispatch = useDispatch();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [hideDialog, setHideDialog] = useState(false);
  const { totalMessagesForUserCount, aiIconStatus } = useSelector((state: StateType) => state.aiChat);

  useEffect(() => {
    const savedPreference = localStorage.getItem('hideAIChatDialog');
    if (savedPreference) {
      setHideDialog(JSON.parse(savedPreference));
    }
  }, []);

  const handleHideDialogChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setHideDialog(newValue);
    localStorage.setItem('hideAIChatDialog', JSON.stringify(newValue));
  };

  const handleSend = () => {
    const trimmedText = text.trim();
    if (trimmedText) {
      dispatch(addUserMessage({
        MessageID: uuidv4(),
        MessageTimestamp: new Date().toISOString(),
        MessageTypeID: 1,
        ResponseTimeMs: null,
        MessageText: trimmedText,
      }));
      dispatch(addMessage({ MessageText: trimmedText, MessageTypeID: 1 }));
      dispatch(setAIIconStatus(1));
      setText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    }
  }));

  return (
    <Box display="flex" className={classes.inputArea}>
      <Box className={classes.inputRow}>
        <TextField
          className={classes.input}
          variant="outlined"
          size="small"
          fullWidth
          inputRef={inputRef}
          placeholder="Type a message..."
          value={text}
          onChange={(e) => {
            if (e.target.value.length <= 500) {
              setText(e.target.value);
            }
          }}
          onKeyPress={handleKeyPress}
          multiline
          maxRows={3}
          disabled={aiIconStatus === 1}
          inputProps={{
            maxLength: 500
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
        {text.length}/{t('common.500chars')}
      </Box>
      {
        totalMessagesForUserCount <= 0 && (
          <FormControlLabel
            control={
              <Checkbox
                checked={hideDialog}
                onChange={handleHideDialogChange}
                color="primary"
                size="small"
              />
            }
            label="Do not show this dialog"
            className={classes.checkboxLabel}
          />
        )
      }
    </Box>
  );
};

export default forwardRef(InputArea);
