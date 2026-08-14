import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, TextField, Switch, Typography, FormControl, Select, MenuItem } from '@material-ui/core';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import { WidgetConfig, WeeklySchedule } from '../../types';
import SettingRow from '../SettingRow';
import NumberStepper from '../NumberStepper';

interface BehaviorTabProps {
  config: WidgetConfig;
  onChange: (key: keyof WidgetConfig, value: any) => void;
}

const AWAY_MAX = 500;

const TIMEZONES: { value: string; label: string }[] = [
  { value: 'UTC', label: '(GMT+00:00) UTC' },
  { value: 'America/New_York', label: '(GMT-04:00) Eastern Time (US & Canada)' },
  { value: 'America/Chicago', label: '(GMT-05:00) Central Time (US & Canada)' },
  { value: 'America/Denver', label: '(GMT-06:00) Mountain Time (US & Canada)' },
  { value: 'America/Los_Angeles', label: '(GMT-07:00) Pacific Time (US & Canada)' },
  { value: 'Europe/London', label: '(GMT+00:00) London' },
  { value: 'Europe/Paris', label: '(GMT+01:00) Central European Time' },
  { value: 'Asia/Jerusalem', label: '(GMT+03:00) Jerusalem' },
];

const formatTime = (value: string): string => {
  const [hStr, mStr] = value.split(':');
  const h = parseInt(hStr, 10);
  const ampm = h < 12 ? 'AM' : 'PM';
  let hr = h % 12;
  if (hr === 0) hr = 12;
  return `${hr}:${mStr} ${ampm}`;
};

const buildTimeOptions = (): { value: string; label: string }[] => {
  const opts: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      opts.push({ value, label: formatTime(value) });
    }
  }
  return opts;
};

const TIME_OPTIONS = buildTimeOptions();

const DAYS: (keyof WeeklySchedule)[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

/** Small bold label used above fields inside the office-hours card. */
const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography style={{ fontWeight: 600, color: '#374151', fontSize: '0.85rem', marginBottom: 6 }}>{children}</Typography>
);

/** 12-hour time dropdown with a leading clock icon. */
const TimeSelect: React.FC<{ value: string; disabled?: boolean; onChange: (v: string) => void }> = ({ value, disabled, onChange }) => (
  <FormControl fullWidth variant="outlined" size="small" disabled={disabled}>
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value as string)}
      renderValue={() =>
        disabled ? (
          <span style={{ color: '#c0c4cc' }}>—</span>
        ) : (
          <Box display="flex" alignItems="center">
            <AccessTimeIcon style={{ fontSize: 15, color: '#9ca3af', marginRight: 6 }} />
            {formatTime(value)}
          </Box>
        )
      }
    >
      {TIME_OPTIONS.map((o) => (
        <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
      ))}
    </Select>
  </FormControl>
);

const BehaviorTab: React.FC<BehaviorTabProps> = ({ config, onChange }) => {
  const { t } = useTranslation();

  const updateDay = (day: keyof WeeklySchedule, patch: Partial<WeeklySchedule[keyof WeeklySchedule]>) => {
    onChange('weeklySchedule', {
      ...config.weeklySchedule,
      [day]: { ...config.weeklySchedule[day], ...patch },
    });
  };

  return (
    <Box>
      {/* Auto Open Chat */}
      <SettingRow
        label={t('common.widget_auto_open', 'Auto Open Chat')}
        description={t('common.widget_auto_open_desc', 'Automatically open the chat widget after a delay.')}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap">
          <Switch
            checked={config.autoOpen}
            onChange={(e) => onChange('autoOpen', e.target.checked)}
            color="primary"
          />
          {config.autoOpen && (
            <Box ml="auto">
              <Typography style={{ fontWeight: 600, color: '#374151', fontSize: '0.8rem', marginBottom: 6 }}>
                {t('common.widget_auto_open_delay', 'Auto Open Delay (seconds)')}
              </Typography>
              <NumberStepper
                value={config.autoOpenDelay}
                onChange={(v) => onChange('autoOpenDelay', v)}
                min={0}
              />
            </Box>
          )}
        </Box>
      </SettingRow>

      {/* AI Assistant */}
      <SettingRow
        label={t('common.widget_ai_enable', 'Enable AI Assistant')}
        description={t('common.widget_ai_enable_desc', 'Allow the AI assistant to handle and respond to visitor queries.')}
      >
        <Switch
          checked={config.enableAi}
          onChange={(e) => onChange('enableAi', e.target.checked)}
          color="primary"
        />
      </SettingRow>

      {/* Office Hours */}
      <SettingRow
        label={t('common.widget_enable_office_hours', 'Enable Office Hours')}
        description={t('common.widget_office_hours_desc', "Set your availability and routing when you're offline.")}
        divider={false}
      >
        <Switch
          checked={config.enableOfficeHours}
          onChange={(e) => onChange('enableOfficeHours', e.target.checked)}
          color="primary"
        />
      </SettingRow>

      {config.enableOfficeHours && (
        <Box mt={1} p={3} bgcolor="#fbfbfc" border="1px solid #e5e7eb" borderRadius={12} display="flex" flexWrap="wrap">
          {/* Left column: timezone, routing email, away message */}
          <Box flexBasis="48%" flexGrow={1} pr={3} style={{ minWidth: 260 }}>
            <Box mb={3}>
              <FieldLabel>{t('common.widget_timezone', 'Timezone')}</FieldLabel>
              <FormControl fullWidth variant="outlined" size="small">
                <Select value={config.timezone} onChange={(e) => onChange('timezone', e.target.value)}>
                  {TIMEZONES.map((tz) => (
                    <MenuItem key={tz.value} value={tz.value}>{tz.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box mb={3}>
              <FieldLabel>{t('common.widget_email_routing', 'Offline Routing Email')}</FieldLabel>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="support@yourcompany.com"
                value={config.emailRouting}
                onChange={(e) => onChange('emailRouting', e.target.value)}
              />
            </Box>

            <Box>
              <FieldLabel>{t('common.widget_away_message', 'Away Message')}</FieldLabel>
              <Box position="relative">
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  value={config.awayMessage}
                  onChange={(e) => onChange('awayMessage', e.target.value.slice(0, AWAY_MAX))}
                  inputProps={{ maxLength: AWAY_MAX }}
                />
                <Typography variant="caption" style={{ position: 'absolute', bottom: 8, right: 12, color: '#9ca3af' }}>
                  {config.awayMessage.length} / {AWAY_MAX}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Right column: weekly schedule */}
          <Box flexBasis="48%" flexGrow={1} style={{ minWidth: 300 }}>
            <FieldLabel>{t('common.widget_weekly_schedule', 'Weekly Schedule')}</FieldLabel>
            {DAYS.map((day) => {
              const scheduleDay = config.weeklySchedule[day];
              return (
                <Box key={day} display="flex" alignItems="center" mb={1.5}>
                  <Box width={72} style={{ textTransform: 'capitalize', color: scheduleDay.enabled ? '#374151' : '#9ca3af', fontSize: '0.85rem' }}>
                    {t(`common.day_${day}`, day.charAt(0).toUpperCase() + day.slice(1))}
                  </Box>
                  <Switch
                    checked={scheduleDay.enabled}
                    onChange={(e) => updateDay(day, { enabled: e.target.checked })}
                    color="primary"
                    size="small"
                  />
                  <Box flex={1} mr={1} ml={1}>
                    <TimeSelect
                      value={scheduleDay.startTime}
                      disabled={!scheduleDay.enabled}
                      onChange={(v) => updateDay(day, { startTime: v })}
                    />
                  </Box>
                  <Box flex={1}>
                    <TimeSelect
                      value={scheduleDay.endTime}
                      disabled={!scheduleDay.enabled}
                      onChange={(v) => updateDay(day, { endTime: v })}
                    />
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default BehaviorTab;
