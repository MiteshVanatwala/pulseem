import React from 'react';
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Paper,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PulseemSwitch from '../../../../components/Controlls/PulseemSwitch';

export interface AdvancedSettingsData {
  shouldContinueShowing: boolean;
  conversionType: string;
}

interface Props {
  classes: any;
  lookupData: any;
  show: boolean;
  onToggle: () => void;
  data: AdvancedSettingsData;
  onChange: (fieldName: keyof AdvancedSettingsData, value: any) => void;
}

const AdvancedSettings: React.FC<Props> = ({ classes, lookupData, show, onToggle, data, onChange }) => {
  const { t } = useTranslation();
  const { shouldContinueShowing, conversionType } = data;

  return (
    <Box mt={4}>
      <Paper variant="outlined" className={clsx(classes.paperPopupTrigger, classes.noPadding)}>
        <Box>
          <Box className={clsx(classes.topHeaderPopupTrigger, classes.p10, classes.spaceBetween)} alignItems="center" mb={show && 4}>
            <div>
              <Typography variant="body1" className={classes.managementTitle} gutterBottom>
                {t('PopupTriggers.advanceSettings.headerSection.title')}
              </Typography>
              <Typography variant="body1" className={classes.subtitlePopupTrigger}>
                {t('PopupTriggers.advanceSettings.headerSection.subtitle')}
              </Typography>
            </div>
            <PulseemSwitch
              switchType="ios"
              id="popupTriggers-toggle"
              checked={show}
              onChange={onToggle}
              classes={classes}
            />
          </Box>
          {show && (
            <>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                className={classes.accordionSummaryPopupTrigger}
              >
                <Typography variant="body1" className={classes.managementTitle}>{t('PopupTriggers.advanceSettings.postConversion.title')}</Typography>
              </Box>
              <Box className={classes.formContainerPopupTrigger}>
                <Box my={3} px={4}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={shouldContinueShowing}
                          onChange={(e) => onChange('shouldContinueShowing', e.target.checked)}
                          name="continue-showing"
                          color="primary"
                        />
                      }
                      label={
                        <>
                          <Typography variant='body1' className={classes.managementTitle}>{t('PopupTriggers.advanceSettings.postConversion.continueShowing.label')}</Typography>
                        </>
                      }
                    />
                  </FormGroup>
                  <Typography variant="body1" className={classes.grayTextCell}>
                    {t('PopupTriggers.advanceSettings.postConversion.continueShowing.helper')}
                  </Typography>
                </Box>
                <Box my={3} px={4}>
                  <Typography variant='body1' className={classes.managementTitle} gutterBottom>
                    {t('PopupTriggers.advanceSettings.postConversion.defineConversion.label')}
                  </Typography>
                  <RadioGroup
                    aria-label="conversion-type"
                    name="conversion-type"
                    value={conversionType}
                    onChange={(e) => onChange('conversionType', e.target.value)}
                  >
                    <Paper
                      variant="outlined"
                      className={`${classes.radioLabelPopupTrigger} ${conversionType === 'formSubmission' ? classes.radioLabelSelected : ''
                        }`}
                      style={{ marginBottom: '1rem' }}
                    >
                      <FormControlLabel
                        value="formSubmission"
                        control={<Radio color="primary" />}
                        label={t('PopupTriggers.advanceSettings.postConversion.defineConversion.formSubmission')}
                        className={classes.radioLable}
                      />
                    </Paper>
                    <Paper
                      variant="outlined"
                      className={`${classes.radioLabelPopupTrigger} ${conversionType === 'buttonClick' ? classes.radioLabelSelected : ''
                        }`}
                    >
                      <FormControlLabel
                        value="buttonClick"
                        control={<Radio color="primary" />}
                        label={t('PopupTriggers.advanceSettings.postConversion.defineConversion.buttonClick')}
                        className={classes.radioLable}
                      />
                    </Paper>
                  </RadioGroup>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default AdvancedSettings;