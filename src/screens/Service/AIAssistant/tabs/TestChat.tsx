import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  Tooltip,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import { sendTestChatMessage, submitTestChatFeedback } from '../../../../redux/reducers/aiAssistantSlice';
import { ITestChatExchange, MAX_TEST_MESSAGE_LENGTH } from '../../../../Models/Service/AIAssistant';

const useStyles = makeStyles({
  section: {
    padding: 24,
  },
  intro: {
    marginBlockEnd: 16,
  },
  conversation: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    marginBlockEnd: 16,
    maxHeight: 520,
    overflowY: 'auto',
  },
  questionBubble: {
    alignSelf: 'flex-end',
    maxWidth: '75%',
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    padding: '8px 16px',
  },
  replyCard: {
    alignSelf: 'flex-start',
    maxWidth: '85%',
    padding: 16,
  },
  confidenceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBlockStart: 12,
  },
  confidenceTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    transition: 'width 0.3s ease',
  },
  sourcesRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 4,
    marginBlockStart: 12,
  },
  feedbackRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBlockStart: 16,
  },
  thinkingDot: {
    display: 'inline-block',
    width: 6,
    height: 6,
    borderRadius: '50%',
    backgroundColor: '#9ca3af',
    marginInlineEnd: 4,
    animation: '$pulse 1.2s infinite ease-in-out',
  },
  '@keyframes pulse': {
    '0%, 80%, 100%': { opacity: 0.3 },
    '40%': { opacity: 1 },
  },
  inputRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'flex-end',
  },
  field: {
    '& .MuiOutlinedInput-root': {
      borderRadius: 20,
      backgroundColor: '#fff',
      '& fieldset': {
        borderColor: '#e0e0e0',
      },
      '&:hover fieldset': {
        borderColor: '#FF0076',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#FF0076',
      },
    },
  },
});

// Multi-second LLM latency deserves its own indicator — not the instant spinner used
// for the page's CRUD saves. Ticks an elapsed-seconds counter so a slow reply still
// reads as "working," not "stuck."
const ThinkingIndicator = ({ classes }: { classes: any }) => {
  const { t } = useTranslation();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const interval = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <Paper variant="outlined" className={classes.replyCard}>
      <Box display="flex" alignItems="center">
        <span className={classes.thinkingDot} style={{ animationDelay: '0s' }} />
        <span className={classes.thinkingDot} style={{ animationDelay: '0.2s' }} />
        <span className={classes.thinkingDot} style={{ animationDelay: '0.4s' }} />
        <Typography variant="body2" color="textSecondary" style={{ marginInlineStart: 8 }}>
          {t('AIAssistant.testChat.thinking', { seconds: elapsedSeconds })}
        </Typography>
      </Box>
    </Paper>
  );
};

interface ExchangeItemProps {
  exchange: ITestChatExchange;
  confidenceThreshold: number;
  classes: any;
  onFeedback: (exchangeId: string, responseLogId: number, helpful: boolean) => void;
}

const ExchangeItem = ({ exchange, confidenceThreshold, classes, onFeedback }: ExchangeItemProps) => {
  const { t } = useTranslation();

  return (
    <>
      <Paper variant="outlined" className={classes.questionBubble}>
        <Typography variant="body2">{exchange.question}</Typography>
      </Paper>

      {exchange.status === 'pending' && <ThinkingIndicator classes={classes} />}

      {exchange.status === 'rateLimited' && (
        <Alert severity="warning" icon={<ErrorOutlineIcon fontSize="small" />} className={classes.replyCard}>
          {exchange.maxRequestsPerDay
            ? t('AIAssistant.testChat.rateLimitedWithLimit', { limit: exchange.maxRequestsPerDay })
            : t('AIAssistant.testChat.rateLimited')}
        </Alert>
      )}

      {exchange.status === 'failed' && (
        <Alert severity="error" className={classes.replyCard}>
          {exchange.errorMessage || t('AIAssistant.testChat.genericError')}
        </Alert>
      )}

      {exchange.status === 'succeeded' && exchange.response && (
        <Paper variant="outlined" className={classes.replyCard}>
          <Typography variant="body2">{exchange.response.reply}</Typography>

          {exchange.response.escalated && (
            <Alert severity="warning" style={{ marginBlockStart: 12 }}>
              {t('AIAssistant.testChat.escalatedBanner')}
            </Alert>
          )}

          <Box className={classes.confidenceRow}>
            <Typography variant="caption" color="textSecondary">
              {t('AIAssistant.testChat.confidenceLabel')}: {exchange.response.confidenceScore}%
            </Typography>
            <Box className={classes.confidenceTrack}>
              <Box
                className={classes.confidenceFill}
                style={{
                  width: `${exchange.response.confidenceScore}%`,
                  backgroundColor: exchange.response.confidenceScore >= confidenceThreshold ? '#16a34a' : '#ed6c02',
                }}
              />
            </Box>
            <Tooltip title={t('AIAssistant.settings.confidenceTooltip') as string}>
              <InfoOutlinedIcon fontSize="small" />
            </Tooltip>
          </Box>

          <Box className={classes.sourcesRow}>
            {exchange.response.knowledgeSources.length > 0 ? (
              exchange.response.knowledgeSources.map((source) => (
                <Chip key={source.id} size="small" variant="outlined" label={source.title} />
              ))
            ) : (
              <Typography variant="caption" color="textSecondary">
                {t('AIAssistant.testChat.noSources')}
              </Typography>
            )}
          </Box>

          <Typography variant="caption" color="textSecondary" style={{ display: 'block', marginBlockStart: 12 }}>
            {t('AIAssistant.testChat.responseTimeFormat', { ms: exchange.response.responseTimeMs })}
          </Typography>

          <Box className={classes.feedbackRow}>
            <Button
              size="small"
              variant={exchange.feedback === 'helpful' ? 'contained' : 'outlined'}
              disabled={!!exchange.feedback}
              onClick={() => onFeedback(exchange.id, exchange.response!.responseLogId, true)}
            >
              {t('AIAssistant.testChat.goodResponse')}
            </Button>
            <Button
              size="small"
              variant={exchange.feedback === 'needsImprovement' ? 'contained' : 'outlined'}
              disabled={!!exchange.feedback}
              onClick={() => onFeedback(exchange.id, exchange.response!.responseLogId, false)}
            >
              {t('AIAssistant.testChat.needsImprovement')}
            </Button>
            {exchange.feedback && (
              <Typography variant="caption" color="textSecondary">
                {t('AIAssistant.testChat.feedbackThanks')}
              </Typography>
            )}
          </Box>
        </Paper>
      )}
    </>
  );
};

const TestChat = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isRTL } = useSelector((state: any) => state.core);
  const { testChatExchanges, testChatSending, settings } = useSelector((state: any) => state.aiAssistant);

  const [draft, setDraft] = useState('');

  const confidenceThreshold = settings?.confidenceThreshold ?? 0;
  const isSending = testChatSending === 'loading';
  const isTooLong = draft.length > MAX_TEST_MESSAGE_LENGTH;

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed.length > MAX_TEST_MESSAGE_LENGTH || isSending) return;
    dispatch(sendTestChatMessage(trimmed) as any);
    setDraft('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFeedback = (exchangeId: string, responseLogId: number, helpful: boolean) => {
    // Fire-and-forget: no loading state shown while this round-trips.
    dispatch(submitTestChatFeedback({ exchangeId, responseLogId, feedback: helpful ? 'good' : 'needs_improvement' }) as any);
  };

  return (
    <Box dir={isRTL ? 'rtl' : 'ltr'}>
      <Paper variant="outlined" className={classes.section}>
        <Typography variant="body2" color="textSecondary" className={classes.intro}>
          {t('AIAssistant.testChat.intro')}
        </Typography>

        <Box className={classes.conversation}>
          {testChatExchanges.length === 0 ? (
            <Typography variant="body2" color="textSecondary">
              {t('AIAssistant.testChat.empty')}
            </Typography>
          ) : (
            testChatExchanges.map((exchange: ITestChatExchange) => (
              <ExchangeItem
                key={exchange.id}
                exchange={exchange}
                confidenceThreshold={confidenceThreshold}
                classes={classes}
                onFeedback={handleFeedback}
              />
            ))
          )}
        </Box>

        <Box className={classes.inputRow}>
          <TextField
            variant="outlined"
            fullWidth
            multiline
            minRows={1}
            maxRows={4}
            className={classes.field}
            placeholder={t('AIAssistant.testChat.inputPlaceholder')}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
            error={isTooLong}
            helperText={isTooLong ? t('AIAssistant.testChat.messageTooLong') : `${draft.length}/${MAX_TEST_MESSAGE_LENGTH}`}
          />
          <Button
            variant="contained"
            color="primary"
            disabled={isSending || !draft.trim() || isTooLong}
            onClick={handleSend}
          >
            {t('AIAssistant.testChat.sendButton')}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default TestChat;
