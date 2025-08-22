import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Box, TextField, IconButton } from '@material-ui/core';
import { Send as SendIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { addMessage, fetchAiResponse, setAIIconStatus, toggleChat } from '../../redux/reducers/aiChatSlice';
import uniqid from 'uniqid';

const useStyles = makeStyles((theme) => ({
  inputArea: {
    padding: theme.spacing(1, 2),
    backgroundColor: '#ffffff',
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  input: {
    '& .MuiInputBase-root': {
        borderRadius: '20px',
        backgroundColor: '#f0f0f0',
        transition: 'box-shadow 0.2s ease-in-out',
    },
    '& .MuiOutlinedInput-notchedOutline': {
        border: 'none',
    },
    '& .Mui-focused .MuiInputBase-root': {
        boxShadow: `0 0 0 2px ${theme.palette.primary.main}40`, // 25% opacity
    },
  },
}));

const InputArea: React.FC = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [text, setText] = useState('');

  const handleSend = () => {
    const trimmedText = text.trim();
    if (trimmedText) {
      dispatch(addMessage({ id: uniqid(), data: {
        type: 'text',
        content: trimmedText
      }, sender: 'user' }));
      dispatch(fetchAiResponse(trimmedText));
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

  return (
    <Box display="flex" alignItems="center" className={classes.inputArea}>
      <TextField
        className={classes.input}
        variant="outlined"
        size="small"
        fullWidth
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyPress={handleKeyPress}
        multiline
        maxRows={3}
      />
      <IconButton color="primary" onClick={handleSend} style={{ marginLeft: '8px' }}>
        <SendIcon />
      </IconButton>
    </Box>
  );
};

export default InputArea;
