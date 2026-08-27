import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Chip,
  Box,
  Grid,
  Typography,
  IconButton,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import { Close as CloseIcon } from '@material-ui/icons';
import {
  IKnowledgeItem,
  IKnowledgeItemInput,
  KnowledgeItemType,
  KNOWLEDGE_ITEM_TYPES,
  MAX_TITLE_LENGTH,
  MAX_CONTENT_LENGTH,
  MAX_TAGS_PER_ITEM,
  MAX_TAG_LENGTH,
  isValidHttpUrl,
  splitFaqContent,
  combineFaqContent,
} from '../../../../Models/Service/AIAssistant';
import { TYPE_ICON } from './KnowledgeItemCard';

const useStyles = makeStyles((theme) => ({
  dialog: {
    '& .MuiDialog-paper': {
      borderRadius: theme.spacing(2),
      overflow: 'hidden',
    },
  },
  dialogTitleBar: {
    background: 'linear-gradient(90deg, #FF0076 1.31%, #FF0054 33.07%, #FF4D2A 134.74%)',
    color: '#fff',
    padding: theme.spacing(2, 3),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 'auto',
  },
  dialogTitleText: {
    fontWeight: 600,
    fontSize: '1.25rem',
    flex: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  closeButton: {
    color: '#fff',
    padding: theme.spacing(1),
    flexShrink: 0,
    marginLeft: theme.spacing(1),
  },
  field: {
    marginBlockEnd: 16,
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
  tagsChipRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 4,
    marginBlockStart: 8,
  },
  typeMenuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  privacyNotice: {
    marginBlockStart: 8,
    marginBlockEnd: 8,
  },
}));

const VALIDATION_FIELD_MAP: Record<string, 'title' | 'type' | 'content' | 'tags'> = {
  'Title is required': 'title',
  'Title must be 200 characters or fewer': 'title',
  "Item type must be 'text', 'faq', or 'url'": 'type',
  'Content is required': 'content',
  'Content must be 20,000 characters or fewer': 'content',
  "Content must be an absolute http or https URL when item type is 'url'": 'content',
  'A maximum of 10 tags is allowed': 'tags',
  'Each tag must be 50 characters or fewer': 'tags',
  'Combined tag length is too long': 'tags',
};

export interface KnowledgeItemServerError {
  validation?: boolean;
  capReached?: boolean;
  limit?: number;
  notFound?: boolean;
  message?: string | null;
}

interface KnowledgeItemFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  item?: IKnowledgeItem | null;
  saving: boolean;
  serverError?: KnowledgeItemServerError | null;
  onClose: () => void;
  onSubmit: (input: IKnowledgeItemInput) => void;
}

const emptyState = () => ({
  title: '',
  type: 'text' as KnowledgeItemType,
  content: '',
  question: '',
  answer: '',
  tagsInput: '',
});

const parseTags = (tagsInput: string): string[] =>
  tagsInput
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

const KnowledgeItemForm = ({ open, mode, item, saving, serverError, onClose, onSubmit }: KnowledgeItemFormProps) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { isRTL } = useSelector((state: any) => state.core);
  const [form, setForm] = useState(emptyState());
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && item) {
      const { question, answer } = item.type === 'faq' ? splitFaqContent(item.content) : { question: '', answer: '' };
      setForm({
        title: item.title,
        type: item.type,
        // 'url' items have no separate URL field server-side — Content IS the URL.
        content: item.type === 'faq' ? '' : item.content,
        question,
        answer,
        tagsInput: item.tags.join(', '),
      });
    } else {
      setForm(emptyState());
    }
    setTouched(false);
  }, [open, mode, item]);

  const tags = parseTags(form.tagsInput);

  const content = form.type === 'faq' ? combineFaqContent(form.question, form.answer) : form.content;

  const serverFieldErrors: Record<string, string> = {};
  if (serverError?.validation && serverError.message) {
    const field = VALIDATION_FIELD_MAP[serverError.message];
    if (field) serverFieldErrors[field] = serverError.message;
  }

  const titleError = serverFieldErrors.title
    ? serverFieldErrors.title
    : touched && !form.title.trim()
      ? t('AIAssistant.knowledgeItemForm.titleRequired')
      : touched && form.title.length > MAX_TITLE_LENGTH
        ? t('AIAssistant.knowledgeItemForm.titleTooLong')
        : '';

  const contentError = serverFieldErrors.content
    ? serverFieldErrors.content
    : touched && !content.trim()
      ? t('AIAssistant.knowledgeItemForm.contentRequired')
      : touched && content.length > MAX_CONTENT_LENGTH
        ? t('AIAssistant.knowledgeItemForm.contentTooLong')
        : touched && form.type === 'url' && !isValidHttpUrl(form.content)
          ? t('AIAssistant.knowledgeItemForm.urlInvalid')
          : '';

  const handleRemoveTag = (index: number) => {
    setForm({ ...form, tagsInput: tags.filter((_, i) => i !== index).join(', ') });
  };

  const tagsError = serverFieldErrors.tags
    ? serverFieldErrors.tags
    : tags.length > MAX_TAGS_PER_ITEM
      ? t('AIAssistant.knowledgeItemForm.tagsMax')
      : tags.find((tag) => tag.length > MAX_TAG_LENGTH)
        ? t('AIAssistant.knowledgeItemForm.tagTooLong')
        : '';

  // Unmapped server message (the shared DATA_INCORRECT string, or anything not in
  // VALIDATION_FIELD_MAP) — show as a generic banner rather than silently dropping it.
  const genericServerMessage =
    serverError && !serverError.capReached && !(serverError.validation && VALIDATION_FIELD_MAP[serverError.message || ''])
      ? serverError.message || t('AIAssistant.knowledgeItemForm.serverErrorFallback')
      : null;

  const isValid =
    form.title.trim().length > 0 &&
    form.title.length <= MAX_TITLE_LENGTH &&
    content.trim().length > 0 &&
    content.length <= MAX_CONTENT_LENGTH &&
    tags.length <= MAX_TAGS_PER_ITEM &&
    !tags.find((tag) => tag.length > MAX_TAG_LENGTH) &&
    (form.type !== 'url' || isValidHttpUrl(form.content));

  const handleSubmit = () => {
    setTouched(true);
    if (!isValid) return;

    const input: IKnowledgeItemInput = {
      title: form.title.trim(),
      type: form.type,
      content,
      tags,
    };
    onSubmit(input);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" dir={isRTL ? 'rtl' : 'ltr'} className={classes.dialog}>
      <DialogTitle className={classes.dialogTitleBar} disableTypography dir={isRTL ? 'rtl' : 'ltr'}>
        <Typography className={classes.dialogTitleText}>
          {mode === 'create' ? t('AIAssistant.knowledgeItemForm.createTitle') : t('AIAssistant.knowledgeItemForm.editTitle')}
        </Typography>
        <IconButton className={classes.closeButton} onClick={onClose} size="small" disabled={saving}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {serverError?.capReached && (
          <Alert severity="warning" style={{ marginBlockEnd: 16 }}>
            {serverError.message || t('AIAssistant.knowledgeItemForm.capReachedFallback', { limit: serverError.limit })}
          </Alert>
        )}
        {genericServerMessage && (
          <Alert severity="error" style={{ marginBlockEnd: 16 }}>
            {genericServerMessage}
          </Alert>
        )}

        <Alert severity="info" className={classes.privacyNotice}>
          {t('AIAssistant.knowledgeItemForm.privacyNotice')}
        </Alert>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={7}>
            <TextField
              variant="outlined"
              className={classes.field}
              fullWidth
              label={t('AIAssistant.knowledgeItemForm.titleLabel')}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              error={!!titleError}
              helperText={titleError || `${form.title.length}/${MAX_TITLE_LENGTH}`}
              inputProps={{ maxLength: MAX_TITLE_LENGTH }}
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              select
              variant="outlined"
              className={classes.field}
              fullWidth
              label={t('AIAssistant.knowledgeItemForm.typeLabel')}
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as KnowledgeItemType })}
            >
              {KNOWLEDGE_ITEM_TYPES.map((type) => (
                <MenuItem key={type} value={type} className={classes.typeMenuItem}>
                  {TYPE_ICON[type]}
                  {t(`AIAssistant.knowledgeItemForm.typeOptions.${type}`)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        {form.type === 'text' && (
          <TextField
            variant="outlined"
            className={clsx(classes.field, classes.multilineField)}
            fullWidth
            multiline
            minRows={4}
            label={t('AIAssistant.knowledgeItemForm.contentLabel')}
            placeholder={t('AIAssistant.knowledgeItemForm.contentPlaceholderText') as string}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            error={!!contentError}
            helperText={contentError || `${form.content.length}/${MAX_CONTENT_LENGTH}`}
          />
        )}

        {form.type === 'faq' && (
          <>
            <TextField
              variant="outlined"
              className={classes.field}
              fullWidth
              label={t('AIAssistant.knowledgeItemForm.questionLabel')}
              placeholder={t('AIAssistant.knowledgeItemForm.questionPlaceholder') as string}
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
            />
            <TextField
              variant="outlined"
              className={clsx(classes.field, classes.multilineField)}
              fullWidth
              multiline
              minRows={3}
              label={t('AIAssistant.knowledgeItemForm.answerLabel')}
              placeholder={t('AIAssistant.knowledgeItemForm.answerPlaceholder') as string}
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
              error={!!contentError}
              helperText={contentError}
            />
          </>
        )}

        {form.type === 'url' && (
          <>
            <TextField
              variant="outlined"
              className={classes.field}
              fullWidth
              label={t('AIAssistant.knowledgeItemForm.urlLabel')}
              placeholder={t('AIAssistant.knowledgeItemForm.urlPlaceholder') as string}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              error={!!contentError}
              helperText={contentError}
            />
            <Typography variant="body2" color="textSecondary" className={classes.field}>
              {t('AIAssistant.knowledgeItemForm.urlNotice')}
            </Typography>
          </>
        )}

        <TextField
          variant="outlined"
          className={classes.field}
          fullWidth
          label={t('AIAssistant.knowledgeItemForm.tagsLabel')}
          placeholder={t('AIAssistant.knowledgeItemForm.tagsPlaceholder') as string}
          value={form.tagsInput}
          onChange={(e) => setForm({ ...form, tagsInput: e.target.value })}
          error={!!tagsError}
          helperText={tagsError}
        />
        {tags.length > 0 && (
          <Box className={classes.tagsChipRow}>
            {tags.map((tag, i) => (
              <Chip
                key={`${tag}-${i}`}
                size="small"
                label={tag}
                onDelete={saving ? undefined : () => handleRemoveTag(i)}
              />
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions style={{ padding: '12px 24px' }}>
        <Button onClick={onClose} disabled={saving}>
          {t('AIAssistant.formActions.cancel')}
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained" disabled={saving}>
          {t('AIAssistant.formActions.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default KnowledgeItemForm;
