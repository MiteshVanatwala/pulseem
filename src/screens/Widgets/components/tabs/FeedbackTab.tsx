import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, TextField, Switch, Typography, FormControl, Select, MenuItem, Chip } from '@material-ui/core';
import { WidgetConfig } from '../../types';
import SettingRow from '../SettingRow';
import NumberStepper from '../NumberStepper';

interface FeedbackTabProps {
  config: WidgetConfig;
  onChange: (key: keyof WidgetConfig, value: any) => void;
}

const FeedbackTab: React.FC<FeedbackTabProps> = ({ config, onChange }) => {
  const { t } = useTranslation();
  const [tagInput, setTagInput] = React.useState('');

  const handleAddTag = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && tagInput.trim()) {
      event.preventDefault();
      const newTag = tagInput.trim();
      if (!config.predefinedTags.includes(newTag)) {
        onChange('predefinedTags', [...config.predefinedTags, newTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange('predefinedTags', config.predefinedTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <Box>
      <SettingRow
        label={t('common.widget_enable_feedback', 'Enable User Feedback')}
        description={t('common.widget_enable_feedback_desc', 'Allow visitors to share feedback after their chat.')}
        divider={!config.enableFeedback}
      >
        <Switch
          checked={config.enableFeedback}
          onChange={(e) => onChange('enableFeedback', e.target.checked)}
          color="primary"
        />
      </SettingRow>

      {config.enableFeedback && (
        <Box>
          {/* Trigger timing + delay (two columns) */}
          <Box display="flex" flexWrap="wrap" py={2.5} style={{ gap: 24 }}>
            <Box flexGrow={1} style={{ minWidth: 240 }}>
              <Typography style={{ fontWeight: 600, color: '#111827', fontSize: '0.95rem' }}>
                {t('common.widget_trigger_timing', 'Trigger Timing')}
              </Typography>
              <Typography variant="body2" style={{ color: '#6b7280', fontSize: '0.8rem', margin: '4px 0 10px' }}>
                {t('common.widget_trigger_timing_desc', 'When should we ask for feedback?')}
              </Typography>
              <FormControl fullWidth variant="outlined" size="small">
                <Select
                  value={config.feedbackTiming}
                  onChange={(e) => onChange('feedbackTiming', e.target.value)}
                >
                  <MenuItem value="conversation_ends">{t('common.widget_timing_conversation_ends', 'After conversation ends')}</MenuItem>
                  <MenuItem value="after_delay">{t('common.widget_timing_after_delay', 'After delay')}</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {config.feedbackTiming === 'after_delay' && (
              <Box flexGrow={1} style={{ minWidth: 240 }}>
                <Typography style={{ fontWeight: 600, color: '#111827', fontSize: '0.95rem' }}>
                  {t('common.widget_delay_seconds', 'Delay in seconds')}
                </Typography>
                <Typography variant="body2" style={{ color: '#6b7280', fontSize: '0.8rem', margin: '4px 0 10px' }}>
                  {t('common.widget_delay_seconds_desc', 'Set the delay before showing the feedback form.')}
                </Typography>
                <NumberStepper
                  value={config.feedbackDelaySeconds}
                  onChange={(v) => onChange('feedbackDelaySeconds', v)}
                  min={0}
                />
              </Box>
            )}
          </Box>
          <Box borderTop="1px solid #e5e7eb" />

          <SettingRow
            label={t('common.widget_star_rating', 'Star Rating')}
            description={t('common.widget_star_rating_desc', 'Collect a star rating for the chat experience.')}
          >
            <Switch
              checked={config.enableStarRating}
              onChange={(e) => onChange('enableStarRating', e.target.checked)}
              color="primary"
            />
          </SettingRow>

          <SettingRow
            label={t('common.widget_free_text_comment', 'Free Text Comment')}
            description={t('common.widget_free_text_comment_desc', 'Allow visitors to leave an open-ended comment.')}
          >
            <Switch
              checked={config.enableFreeText}
              onChange={(e) => onChange('enableFreeText', e.target.checked)}
              color="primary"
            />
          </SettingRow>

          <SettingRow
            label={t('common.widget_predefined_tags', 'Predefined Tags')}
            description={t('common.widget_predefined_tags_desc', 'Allow visitors to select from preset tags.')}
            divider={!config.enablePredefinedTags}
          >
            <Switch
              checked={config.enablePredefinedTags}
              onChange={(e) => onChange('enablePredefinedTags', e.target.checked)}
              color="primary"
            />
          </SettingRow>

          {config.enablePredefinedTags && (
            <Box py={2.5} borderBottom="1px solid #e5e7eb">
              <Typography style={{ fontWeight: 600, color: '#111827', fontSize: '0.95rem' }}>
                {t('common.widget_tags_list', 'Tags List')}
              </Typography>
              <Typography variant="body2" style={{ color: '#6b7280', fontSize: '0.8rem', margin: '4px 0 10px' }}>
                {t('common.widget_tags_list_desc', 'Add tags that visitors can choose from.')}
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder={t('common.widget_add_tag', 'Add a tag and press Enter')}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
              <Box mt={2} display="flex" flexWrap="wrap">
                {config.predefinedTags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    style={{ marginRight: 8, marginBottom: 8, backgroundColor: '#f3f4f6', color: '#374151' }}
                  />
                ))}
              </Box>
            </Box>
          )}

          <SettingRow
            label={t('common.widget_feedback_routing', 'Feedback Routing')}
            description={t('common.widget_feedback_routing_desc', 'Choose where feedback submissions should be sent.')}
            divider={false}
          >
            <FormControl fullWidth variant="outlined" size="small">
              <Select
                value={config.feedbackRouting}
                onChange={(e) => onChange('feedbackRouting', e.target.value)}
              >
                <MenuItem value="all_agents">{t('common.widget_routing_all_agents', 'All Agents')}</MenuItem>
                <MenuItem value="support_team">{t('common.widget_routing_support_team', 'Support Team')}</MenuItem>
                <MenuItem value="sales_team">{t('common.widget_routing_sales_team', 'Sales Team')}</MenuItem>
              </Select>
            </FormControl>
          </SettingRow>
        </Box>
      )}
    </Box>
  );
};

export default FeedbackTab;
