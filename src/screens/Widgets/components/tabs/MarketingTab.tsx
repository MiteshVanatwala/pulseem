import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, FormControlLabel, Switch, Typography, Grid, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import { WidgetConfig } from '../../types';

interface MarketingTabProps {
  config: WidgetConfig;
  onChange: (key: keyof WidgetConfig, value: any) => void;
}

const MarketingTab: React.FC<MarketingTabProps> = ({ config, onChange }) => {
  const { t } = useTranslation();

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={config.enableMarketing}
                onChange={(e) => onChange('enableMarketing', e.target.checked)}
                color="primary"
              />
            }
            label={t('common.widget_marketing_enable', 'Enable Marketing Opt-in')}
          />
        </Grid>
        
        {config.enableMarketing && (
          <>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>{t('common.widget_marketing_when_to_show', 'When to Show')}</InputLabel>
                <Select
                  value={config.marketingTiming}
                  onChange={(e) => onChange('marketingTiming', e.target.value)}
                  label={t('common.widget_marketing_when_to_show', 'When to Show')}
                >
                  <MenuItem value="immediately">{t('common.widget_marketing_timing_immediately', 'Immediately')}</MenuItem>
                  <MenuItem value="after_first_response">{t('common.widget_marketing_timing_after_first', 'After First Response')}</MenuItem>
                  <MenuItem value="end_of_conversation">{t('common.widget_marketing_timing_end', 'End of Conversation')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.marketingRequestPhone}
                    onChange={(e) => onChange('marketingRequestPhone', e.target.checked)}
                    color="primary"
                  />
                }
                label={t('common.widget_marketing_request_phone', 'Request Phone Number (Adds phone field to opt-in form)')}
              />
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};

export default MarketingTab;
