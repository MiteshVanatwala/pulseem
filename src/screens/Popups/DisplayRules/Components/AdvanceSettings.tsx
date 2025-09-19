import { useState } from 'react';
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
import { ArrowDropDown as ArrowDropDownIcon } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

const AdvancedSettings = ({ classes }: any) => {
  const { t } = useTranslation();
  const [shouldContinueShowing, setShouldContinueShowing] = useState(false);
  const [conversionType, setConversionType] = useState('formSubmission');

  return (
    <Box mt={4}>
      <Paper variant="outlined" className={clsx(classes.paperPopupTrigger, classes.noPadding)}>
        <Box>
          <Box className={clsx(classes.topHeaderPopupTrigger, classes.p10)} mb={4}>
            <Typography variant="h5" gutterBottom className={classes.bold}>
              {t('PopupTriggers.advanceSettings.headerSection.title')}
            </Typography>
            <Typography variant="body1" className={classes.subtitlePopupTrigger}>
              {t('PopupTriggers.advanceSettings.headerSection.subtitle')}
            </Typography>
          </Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            className={classes.accordionSummaryPopupTrigger}
          >
            <Typography variant="h6">{t('PopupTriggers.advanceSettings.postConversion.title')}</Typography>
            <ArrowDropDownIcon />
          </Box>
          <Box className={classes.formContainerPopupTrigger}>
            <Box my={3} px={4}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={shouldContinueShowing}
                      onChange={(e) => setShouldContinueShowing(e.target.checked)}
                      name="continue-showing"
                      color="primary"
                    />
                  }
                  label={
                    <>
                      <Typography variant='h6' className={classes.bold}>{t('PopupTriggers.advanceSettings.postConversion.continueShowing.label')}</Typography>
                    </>
                  }
                />
              </FormGroup>
              <Typography variant="body1" color="textSecondary">
                {t('PopupTriggers.advanceSettings.postConversion.continueShowing.helper')}
              </Typography>
            </Box>
            <Box my={3} px={4}>
              <Typography variant="h6" className={classes.bold} gutterBottom>
                {t('PopupTriggers.advanceSettings.postConversion.defineConversion.label')}
              </Typography>
              <RadioGroup
                aria-label="conversion-type"
                name="conversion-type"
                value={conversionType}
                onChange={(e) => setConversionType(e.target.value)}
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
        </Box>
      </Paper>
    </Box>
  );
};

export default AdvancedSettings;
