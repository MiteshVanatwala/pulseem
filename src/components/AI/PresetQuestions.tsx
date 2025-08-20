import React from 'react';
import { useDispatch } from 'react-redux';
import { Box, Button, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { addMessage, fetchAiResponse } from '../../redux/reducers/aiChatSlice';
import uniqid from 'uniqid';

const useStyles = makeStyles((theme) => ({
  presetQuestions: {
    padding: theme.spacing(2, 2, 1),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    backgroundColor: '#ffffff',
  },
  button: {
    borderRadius: '20px',
    textTransform: 'none',
    fontSize: '0.8rem',
    justifyContent: 'flex-start',
    borderColor: theme.palette.divider,
    color: theme.palette.text.secondary,
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      backgroundColor: 'white',
    },
  },
}));

const PRESET_QUESTIONS = [
  "Top performing newsletters this month?",
  "What's our SMS delivery rate?",
  "Compare channel performance.",
  "Who are my most engaged customers?",
];

const PresetQuestions: React.FC = () => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const handlePresetClick = (question: string) => {
    dispatch(addMessage({ id: uniqid(), text: question, sender: 'user' }));
    dispatch(fetchAiResponse(question));
  };

  return (
    <Box className={classes.presetQuestions}>
        <Typography variant="caption" color="textSecondary" style={{ marginBottom: '4px' }}>
            Or try one of these
        </Typography>
      {PRESET_QUESTIONS.map((q) => (
        <Button
          key={q}
          variant="outlined"
          size="small"
          className={classes.button}
          onClick={() => handlePresetClick(q)}
        >
          {q}
        </Button>
      ))}
    </Box>
  );
};

export default PresetQuestions;
