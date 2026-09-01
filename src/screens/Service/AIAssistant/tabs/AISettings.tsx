import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Typography,
  Slider,
  Switch,
  FormControlLabel,
  Button,
  Tooltip,
  Paper,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { useServiceLimits } from '../../../../hooks/useServiceLimits';
import { saveAiAssistantSettings } from '../../../../redux/reducers/aiAssistantSlice';
import {
  IAiAssistantSettings,
  ResponseStyle,
  RESPONSE_STYLES,
  DEFAULT_CONFIDENCE_THRESHOLD,
  DEFAULT_MAX_CONTEXT_WORDS,
  MIN_MAX_CONTEXT_WORDS,
  MAX_MAX_CONTEXT_WORDS,
  MIN_CONFIDENCE_THRESHOLD,
  MAX_CONFIDENCE_THRESHOLD,
  MAX_ESCALATION_MESSAGE_LENGTH,
} from '../../../../Models/Service/AIAssistant';

const useStyles = makeStyles({
  section: {
    padding: 24,
    marginBlockEnd: 16,
  },
  field: {
    marginBlockEnd: 24,
    '& .MuiOutlinedInput-root': {
      borderRadius: 30,
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
  multilineField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: 20,
    },
  },
  saveBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBlockStart: 8,
  },
});

const buildDefaults = (): IAiAssistantSettings => ({
  responseStyle: 'professional',
  defaultLanguage: 'en',
  confidenceThreshold: DEFAULT_CONFIDENCE_THRESHOLD,
  autoEscalate: true,
  escalationMessage: "I'm not fully sure about this — let me connect you with a member of our team.",
  maxContextWords: DEFAULT_MAX_CONTEXT_WORDS,
  includeConversationHistory: true,
});

const DEFAULT_LANGUAGES = [
  { value: 'en', labelKey: 'languages.langCodes.english' },
  { value: 'he', labelKey: 'languages.langCodes.hebrew' },
  { value: 'pl', labelKey: 'languages.langCodes.polish' },
];

// Mirrors the exact Message strings from the contract's SaveAISettings validation
// table, so a server-side rejection lands on the right field.
const VALIDATION_FIELD_MAP: Record<string, keyof IAiAssistantSettings> = {
  "Response style must be 'professional', 'friendly', or 'concise'": 'responseStyle',
  'Default language is required': 'defaultLanguage',
  'Confidence threshold must be between 0 and 100': 'confidenceThreshold',
  'Escalation message must be 1,000 characters or fewer': 'escalationMessage',
  'Max context words must be between 100 and 10,000': 'maxContextWords',
};

interface SettingsServerError {
  validation?: boolean;
  message?: string | null;
}

interface AISettingsProps {
  onDirtyChange?: (dirty: boolean) => void;
}

const AISettings = ({ onDirtyChange }: AISettingsProps) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isRTL } = useSelector((state: any) => state.core);
  const { settings, saving } = useSelector((state: any) => state.aiAssistant);
  const { getLimit } = useServiceLimits();

  const contextWordsCeiling = getLimit('maxAiContextWords'); // null = plan has no ceiling (-1 server-side)
  const effectiveMax = contextWordsCeiling !== null ? Math.min(MAX_MAX_CONTEXT_WORDS, contextWordsCeiling) : MAX_MAX_CONTEXT_WORDS;

  const [form, setForm] = useState<IAiAssistantSettings>(settings || buildDefaults());
  const [savedSnapshot, setSavedSnapshot] = useState<IAiAssistantSettings>(settings || buildDefaults());
  const [serverError, setServerError] = useState<SettingsServerError | null>(null);

  useEffect(() => {
    if (settings) {
      setForm(settings);
      setSavedSnapshot(settings);
    }
  }, [settings]);

  const isDirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(savedSnapshot), [form, savedSnapshot]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const serverField = serverError?.validation && serverError.message ? VALIDATION_FIELD_MAP[serverError.message] : undefined;
  const genericServerMessage = serverError && !serverField ? serverError.message : null;

  const contextWordsError =
    serverField === 'maxContextWords'
      ? serverError!.message
      : form.maxContextWords < MIN_MAX_CONTEXT_WORDS || form.maxContextWords > MAX_MAX_CONTEXT_WORDS
        ? t('AIAssistant.settings.maxContextWordsRange')
        : '';

  const escalationError =
    serverField === 'escalationMessage'
      ? serverError!.message
      : (form.escalationMessage || '').length > MAX_ESCALATION_MESSAGE_LENGTH
        ? t('AIAssistant.settings.escalationMessageTooLong')
        : '';

  const isValid =
    form.maxContextWords >= MIN_MAX_CONTEXT_WORDS &&
    form.maxContextWords <= MAX_MAX_CONTEXT_WORDS &&
    (form.escalationMessage || '').length <= MAX_ESCALATION_MESSAGE_LENGTH &&
    form.confidenceThreshold >= MIN_CONFIDENCE_THRESHOLD &&
    form.confidenceThreshold <= MAX_CONFIDENCE_THRESHOLD;

  const handleSave = () => {
    if (!isValid) return;
    setServerError(null);
    (dispatch(saveAiAssistantSettings(form) as any) as Promise<any>).then((result: any) => {
      if (result?.meta?.requestStatus === 'fulfilled') {
        // Always re-render from the response — the server may have silently
        // clamped MaxContextWords down to the plan ceiling. Never echo what we sent.
        setForm(result.payload);
        setSavedSnapshot(result.payload);
      } else {
        setServerError(result?.payload || null);
      }
    });
  };

  return (
    <Box dir={isRTL ? 'rtl' : 'ltr'}>
      <Paper variant="outlined" className={classes.section}>
        {genericServerMessage && (
          <Alert severity="error" style={{ marginBlockEnd: 16 }}>
            {genericServerMessage}
          </Alert>
        )}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              variant="outlined"
              className={classes.field}
              fullWidth
              label={t('AIAssistant.settings.responseStyleLabel')}
              value={form.responseStyle}
              onChange={(e) => setForm({ ...form, responseStyle: e.target.value as ResponseStyle })}
              error={serverField === 'responseStyle'}
              helperText={serverField === 'responseStyle' ? serverError?.message : ''}
            >
              {RESPONSE_STYLES.map((style) => (
                <MenuItem key={style} value={style}>
                  {t(`AIAssistant.settings.responseStyleOptions.${style}`)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              variant="outlined"
              className={classes.field}
              fullWidth
              label={t('AIAssistant.settings.defaultLanguageLabel')}
              value={form.defaultLanguage}
              onChange={(e) => setForm({ ...form, defaultLanguage: e.target.value })}
              error={serverField === 'defaultLanguage'}
              helperText={serverField === 'defaultLanguage' ? serverError?.message : ''}
            >
              {DEFAULT_LANGUAGES.map((lang) => (
                <MenuItem key={lang.value} value={lang.value}>
                  {t(lang.labelKey)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Box className={classes.field} style={{ marginBlockStart: 24 }}>
          <Box display="flex" alignItems="center" style={{ gap: 8 }}>
            <Typography>
              {t('AIAssistant.settings.confidenceLabel')}: {form.confidenceThreshold}
            </Typography>
            <Tooltip title={t('AIAssistant.settings.confidenceTooltip') as string}>
              <InfoOutlinedIcon fontSize="small" style={{ marginInlineStart: 6 }} />
            </Tooltip>
          </Box>
          <Slider
            value={form.confidenceThreshold}
            min={MIN_CONFIDENCE_THRESHOLD}
            max={MAX_CONFIDENCE_THRESHOLD}
            valueLabelDisplay="auto"
            onChange={(_e, value) => setForm({ ...form, confidenceThreshold: value as number })}
          />
          {serverField === 'confidenceThreshold' && (
            <Typography variant="caption" color="error">
              {serverError?.message}
            </Typography>
          )}
        </Box>

        <FormControlLabel
          className={classes.field}
          style={{ display: 'block' }}
          control={
            <Switch
              checked={form.autoEscalate}
              onChange={(e) => setForm({ ...form, autoEscalate: e.target.checked })}
            />
          }
          label={t('AIAssistant.settings.autoEscalateLabel')}
        />

        {form.autoEscalate && (
          <TextField
            variant="outlined"
            className={clsx(classes.field, classes.multilineField)}
            fullWidth
            multiline
            minRows={3}
            label={t('AIAssistant.settings.escalationMessageLabel')}
            value={form.escalationMessage || ''}
            onChange={(e) => setForm({ ...form, escalationMessage: e.target.value })}
            error={!!escalationError}
            helperText={escalationError || `${(form.escalationMessage || '').length}/${MAX_ESCALATION_MESSAGE_LENGTH}`}
          />
        )}

        <Box className={classes.field}>
          <TextField
            type="number"
            variant="outlined"
            className={classes.field}
            fullWidth={false}
            label={t('AIAssistant.settings.maxContextWordsLabel')}
            value={form.maxContextWords}
            onChange={(e) => setForm({ ...form, maxContextWords: Number(e.target.value) })}
            error={!!contextWordsError}
            helperText={contextWordsError}
            inputProps={{ min: MIN_MAX_CONTEXT_WORDS, max: effectiveMax }}
          />
          <Typography variant="caption" color="textSecondary" style={{ display: 'block', marginBlockStart: 4 }}>
            {contextWordsCeiling !== null
              ? t('AIAssistant.settings.maxContextWordsCeiling', { max: contextWordsCeiling })
              : t('AIAssistant.settings.maxContextWordsUnlimited')}
          </Typography>
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={form.includeConversationHistory}
              onChange={(e) => setForm({ ...form, includeConversationHistory: e.target.checked })}
            />
          }
          label={t('AIAssistant.settings.includeHistoryLabel')}
        />
      </Paper>

      {/* Deliberately NOT auto-save, unlike the widget config page: these settings
          change what the AI says to real customers, so a half-typed escalation
          message must never go live mid-keystroke. Requires an explicit Save. */}
      <Box className={classes.saveBar}>
        <Button
          variant="contained"
          color="primary"
          disabled={!isDirty || !isValid || saving === 'loading'}
          onClick={handleSave}
        >
          {t('AIAssistant.settingsActions.save')}
        </Button>
        {isDirty ? (
          <Typography variant="body2" color="textSecondary">
            {t('AIAssistant.settingsActions.unsavedChanges')}
          </Typography>
        ) : saving === 'succeeded' ? (
          <Box display="flex" alignItems="center" style={{ gap: 4 }}>
            <CheckCircleIcon fontSize="small" style={{ color: '#16a34a' }} />
            <Typography variant="body2" color="textSecondary">
              {t('AIAssistant.settingsActions.saved')}
            </Typography>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
};

export default AISettings;
