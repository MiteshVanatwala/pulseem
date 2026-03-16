import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { addMessage, addUserMessage, setAIIconStatus } from '../../redux/reducers/aiChatSlice';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import { StateType } from '../../Models/StateTypes';

const useStyles = makeStyles((theme) => ({
  presetQuestions: {
    padding: '9px 16px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
  },
  questionsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  button: {
    borderRadius: '20px',
    textTransform: 'none',
    fontSize: '0.95rem',
    justifyContent: 'flex-start',
    color: theme.palette.text.secondary,
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      backgroundColor: 'white',
    },
  },
}));

const PresetQuestions: React.FC = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { messages, aiIconStatus } = useSelector((state: StateType) => state.aiChat);

  const PRESET_QUESTIONS = [
    t("common.presetQuestion1"),
    t("common.presetQuestion2"),
    t("common.presetQuestion3"),
    t("common.presetQuestion4"),
  ];

  const handlePresetClick = (question: string) => {
    dispatch(addUserMessage({
      MessageID: uuidv4(),
      MessageTimestamp: new Date().toISOString(),
      MessageTypeID: 1,
      ResponseTimeMs: null,
      MessageText: question,
    }));
    dispatch(addMessage({ MessageText: question, MessageTypeID: 1 }));
    dispatch(setAIIconStatus(1));
  };

  const userMessages = messages.filter(msg => msg.MessageTypeID === 1);
  
  if (userMessages.length > 0) {
    return null;
  }

  return (
    <Box className={classes.presetQuestions}>
      <Typography variant="body1" color="textSecondary">
        {t("common.orTryOneOfThese")}
      </Typography>
      <Box className={classes.questionsContainer}>
        {PRESET_QUESTIONS.map((q: string, index: number) => (
          <Button
            key={index}
            variant="outlined"
            size="small"
            className={classes.button}
            onClick={() => handlePresetClick(q)}
            disabled={aiIconStatus === 1}
          >
            {q}
          </Button>
        ))}
      </Box>
    </Box>
  );
};

export default PresetQuestions;
