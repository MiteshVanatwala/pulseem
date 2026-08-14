import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, TextField, FormControl, Select, MenuItem, Switch, Typography, IconButton } from '@material-ui/core';
import ColorizeIcon from '@material-ui/icons/Colorize';
import { WidgetConfig } from '../../types';
import SettingRow from '../SettingRow';

interface AppearanceTabProps {
  config: WidgetConfig;
  onChange: (key: keyof WidgetConfig, value: any) => void;
}

const GREETING_MAX = 500;

const AppearanceTab: React.FC<AppearanceTabProps> = ({ config, onChange }) => {
  const { t } = useTranslation();
  const colorInputRef = useRef<HTMLInputElement>(null);

  return (
    <Box>
      <SettingRow
        label={t('common.widget_name', 'Widget Name')}
        description={t('common.widget_name_desc', 'Internal name for this chat widget.')}
      >
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Sales Chat Widget"
          value={config.name}
          onChange={(e) => onChange('name', e.target.value)}
          required
        />
      </SettingRow>

      <SettingRow
        label={t('common.widget_website_url', 'Website URL (Optional)')}
        description={t('common.widget_website_url_desc', 'The website where this widget will be installed.')}
      >
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="https://www.yourwebsite.com"
          value={config.websiteUrl}
          onChange={(e) => onChange('websiteUrl', e.target.value)}
        />
      </SettingRow>

      <SettingRow
        label={t('common.widget_position', 'Position')}
        description={t('common.widget_position_desc', 'Choose where the chat widget will appear on screen.')}
      >
        <FormControl fullWidth variant="outlined" size="small">
          <Select
            value={config.position}
            onChange={(e) => onChange('position', e.target.value)}
          >
            <MenuItem value="bottom-right">{t('common.widget_position_bottom_right', 'Bottom Right')}</MenuItem>
            <MenuItem value="bottom-left">{t('common.widget_position_bottom_left', 'Bottom Left')}</MenuItem>
          </Select>
        </FormControl>
      </SettingRow>

      <SettingRow
        label={t('common.widget_primary_color', 'Primary Color')}
        description={t('common.widget_primary_color_desc', 'The primary color used for the chat widget.')}
      >
        <Box
          display="flex"
          alignItems="center"
          border="1px solid #cbd5e1"
          borderRadius={6}
          pl={1}
          pr={0.5}
          py={0.5}
          maxWidth={300}
        >
          <Box
            width={28}
            height={28}
            borderRadius={4}
            style={{ backgroundColor: config.primaryColor, cursor: 'pointer', border: '1px solid #e5e7eb', flexShrink: 0 }}
            onClick={() => colorInputRef.current?.click()}
          />
          <input
            ref={colorInputRef}
            type="color"
            value={config.primaryColor}
            onChange={(e) => onChange('primaryColor', e.target.value)}
            style={{ width: 0, height: 0, opacity: 0, position: 'absolute', pointerEvents: 'none' }}
          />
          <TextField
            value={config.primaryColor}
            onChange={(e) => onChange('primaryColor', e.target.value)}
            InputProps={{ disableUnderline: true }}
            style={{ marginLeft: 12, flex: 1 }}
          />
          <IconButton size="small" onClick={() => colorInputRef.current?.click()}>
            <ColorizeIcon fontSize="small" style={{ color: '#9ca3af' }} />
          </IconButton>
        </Box>
      </SettingRow>

      <SettingRow
        label={t('common.widget_greeting', 'Greeting Message')}
        description={t('common.widget_greeting_desc', 'The message shown to visitors when they open the chat.')}
        alignTop
      >
        <Box position="relative">
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={config.greetingMessage}
            onChange={(e) => onChange('greetingMessage', e.target.value.slice(0, GREETING_MAX))}
            inputProps={{ maxLength: GREETING_MAX }}
            placeholder={t('common.widget_default_greeting', 'Hi there! 👋 Thanks for visiting. How can we help you today?')}
          />
          <Typography
            variant="caption"
            style={{ position: 'absolute', bottom: 8, right: 12, color: '#9ca3af' }}
          >
            {config.greetingMessage.length} / {GREETING_MAX}
          </Typography>
        </Box>
      </SettingRow>

      <SettingRow
        label={t('common.widget_branding', 'Show Pulseem Branding')}
        description={t('common.widget_branding_desc', 'Display "Powered by Pulseem" below the chat widget.')}
        divider={false}
      >
        <Box display="flex" alignItems="center">
          <Switch
            checked={config.showBranding}
            onChange={(e) => onChange('showBranding', e.target.checked)}
            color="primary"
          />
          <Typography style={{ color: '#374151', fontWeight: 500 }}>
            {config.showBranding ? t('common.on', 'On') : t('common.off', 'Off')}
          </Typography>
        </Box>
      </SettingRow>
    </Box>
  );
};

export default AppearanceTab;
