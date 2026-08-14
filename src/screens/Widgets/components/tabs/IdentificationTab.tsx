import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, TextField, Switch, Typography, Button, IconButton, Select, MenuItem, FormControl } from '@material-ui/core';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import DragIndicatorIcon from '@material-ui/icons/DragIndicator';
import AddIcon from '@material-ui/icons/Add';
import { WidgetConfig, IdentificationField } from '../../types';
import SettingRow from '../SettingRow';

interface IdentificationTabProps {
  config: WidgetConfig;
  onChange: (key: keyof WidgetConfig, value: any) => void;
}

// Pulseem brand accent — matches palette.primary.main in style/theme.js.
const ACCENT = '#FF1744';
const MAX_FIELDS = 5;

/** Small bold label used above each field input. */
const ColLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography style={{ fontWeight: 600, color: '#374151', fontSize: '0.78rem', marginBottom: 6 }}>{children}</Typography>
);

const IdentificationTab: React.FC<IdentificationTabProps> = ({ config, onChange }) => {
  const { t } = useTranslation();

  const handleAddField = () => {
    if (config.identificationFields.length >= MAX_FIELDS) return;
    const newField: IdentificationField = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      label: '',
      type: 'text',
      required: false,
    };
    onChange('identificationFields', [...config.identificationFields, newField]);
  };

  const handleUpdateField = (index: number, key: keyof IdentificationField, value: any) => {
    const updatedFields = [...config.identificationFields];
    updatedFields[index] = { ...updatedFields[index], [key]: value };
    onChange('identificationFields', updatedFields);
  };

  const handleRemoveField = (index: number) => {
    onChange('identificationFields', config.identificationFields.filter((_, i) => i !== index));
  };

  return (
    <Box>
      <SettingRow
        label={t('common.widget_identification_enable', 'Require Initial Identification Form')}
        description={t('common.widget_identification_enable_desc', 'Ask visitors to provide their details before starting a chat.')}
        divider={!config.enableIdentification}
      >
        <Switch
          checked={config.enableIdentification}
          onChange={(e) => onChange('enableIdentification', e.target.checked)}
          color="primary"
        />
      </SettingRow>

      {config.enableIdentification && (
        <Box pt={3}>
          {/* Field builder header */}
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Typography style={{ fontWeight: 600, color: '#111827', fontSize: '0.95rem' }}>
                {t('common.widget_field_builder', 'Field Builder')}
              </Typography>
              <Typography variant="body2" style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: 4 }}>
                {t('common.widget_field_builder_desc', 'Add up to 5 fields to collect visitor information.')}
              </Typography>
            </Box>
            <Typography variant="body2" style={{ color: '#6b7280', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
              {config.identificationFields.length} / {MAX_FIELDS} {t('common.widget_fields_used', 'fields used')}
            </Typography>
          </Box>

          {config.identificationFields.map((field, index) => (
            <Box
              key={field.id}
              border="1px solid #e5e7eb"
              borderRadius={12}
              p={2}
              mb={2}
              display="flex"
              alignItems="flex-start"
            >
              <Box display="flex" alignItems="center" mr={1.5} style={{ marginTop: 26 }}>
                <DragIndicatorIcon style={{ color: '#cbd5e1', fontSize: 20, cursor: 'grab' }} />
                <Typography style={{ color: '#6b7280', fontWeight: 600, fontSize: '0.85rem', marginLeft: 4 }}>{index + 1}.</Typography>
              </Box>

              <Box display="flex" flexWrap="wrap" flexGrow={1} style={{ gap: 12 }}>
                <Box flexGrow={1} style={{ minWidth: 130 }}>
                  <ColLabel>{t('common.widget_identification_field_name', 'Internal Name')}</ColLabel>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="name"
                    value={field.name}
                    onChange={(e) => handleUpdateField(index, 'name', e.target.value)}
                  />
                </Box>
                <Box flexGrow={1} style={{ minWidth: 130 }}>
                  <ColLabel>{t('common.widget_identification_display_label', 'Display Label')}</ColLabel>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="Full Name"
                    value={field.label}
                    onChange={(e) => handleUpdateField(index, 'label', e.target.value)}
                  />
                </Box>
                <Box style={{ minWidth: 120, flexGrow: 1 }}>
                  <ColLabel>{t('common.widget_identification_type', 'Field Type')}</ColLabel>
                  <FormControl fullWidth variant="outlined" size="small">
                    <Select
                      value={field.type}
                      onChange={(e) => handleUpdateField(index, 'type', e.target.value)}
                    >
                      <MenuItem value="text">{t('common.widget_identification_type_text', 'Text')}</MenuItem>
                      <MenuItem value="email">{t('common.widget_identification_type_email', 'Email')}</MenuItem>
                      <MenuItem value="phone">{t('common.widget_identification_type_phone', 'Phone')}</MenuItem>
                      <MenuItem value="textarea">{t('common.widget_identification_type_textarea', 'Textarea')}</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box style={{ minWidth: 80 }}>
                  <ColLabel>{t('common.widget_identification_required', 'Required')}</ColLabel>
                  <Switch
                    checked={field.required}
                    onChange={(e) => handleUpdateField(index, 'required', e.target.checked)}
                    color="primary"
                  />
                </Box>
              </Box>

              <Box style={{ marginTop: 22 }}>
                <IconButton onClick={() => handleRemoveField(index)} size="small">
                  <DeleteOutlineIcon style={{ color: '#9ca3af' }} />
                </IconButton>
              </Box>
            </Box>
          ))}

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddField}
            disabled={config.identificationFields.length >= MAX_FIELDS}
            style={{
              textTransform: 'none',
              color: ACCENT,
              borderColor: ACCENT,
              fontWeight: 600,
              borderRadius: 8,
              padding: '8px 20px',
            }}
          >
            {t('common.widget_identification_add_field', 'Add Field')}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default IdentificationTab;
