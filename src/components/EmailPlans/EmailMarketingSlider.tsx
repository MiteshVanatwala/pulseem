import React, { useState } from 'react';
import { Box, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import clsx from 'clsx';

const EmailMarketingSlider = ({ classes }: any) => {
  const { t } = useTranslation();
  const { isRTL } = useSelector((state: any) => state.core);
  
  const tiers = [
    { label: '100', value: 0 },
    { label: '500', value: 1 },
    { label: '1K', value: 2 },
    { label: '2.5K', value: 3 },
    { label: '5K', value: 4 },
    { label: '10K', value: 5 },
    { label: '20K', value: 6 },
    { label: '50K', value: 7 },
    { label: '100K', value: 8 },
    { label: '200K', value: 9 },
    { label: '200K+', value: 10 }
  ];

  const [sliderValue, setSliderValue] = useState(0);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderValue(parseInt(e.target.value));
  };

  const handleTierClick = (value: number) => {
    setSliderValue(value);
  };

  // Calculate position based on RTL
  const getPosition = (index: number) => {
    const position = (index / (tiers.length - 1)) * 100;
    return isRTL ? 100 - position : position;
  };

  return (
    <Box className={clsx(classes.emailMarketingSliderContainer)}>
      {/* Header */}
      <Box className={clsx(classes.textCenter, classes.mb10)}>
        <Typography variant="h4" className={clsx(classes.bold, classes.mb5)}>
          {t('billing.EmailMarketing')}
        </Typography>
        <Typography variant="body1" color="textSecondary" className={clsx(classes.mb50)}>
          {t('billing.EmailMarketingDescription')}
        </Typography>
      </Box>

      {/* Slider Container */}
      <Box className={classes.sliderContainer}>
        {/* Tier Labels */}
        <Box className={classes.sliderLabelsWrapper}>
          <Box className={classes.sliderLabelsContainer}>
            {tiers.map((tier, index) => {
              const position = getPosition(index);
              const isActive = sliderValue === tier.value;
              return (
                <Box
                  key={tier.label}
                  onClick={() => handleTierClick(tier.value)}
                  className={classes.sliderLabel}
                  style={{ left: `${position}%` }}
                >
                  <Typography
                    variant="body2"
                    className={clsx(
                      classes.bold,
                      classes.sliderLabelText,
                      { [classes.sliderLabelActive]: isActive }
                    )}
                  >
                    {tier.label}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Slider Track Container */}
        <Box className={classes.sliderTrackWrapper}>
          {/* Slider Track */}
          <Box className={classes.sliderTrack}>
            {/* Filled Track */}
            <Box
              className={clsx(
                classes.sliderTrackFilled,
                { [classes.sliderTrackFilledRTL]: isRTL }
              )}
              style={{ width: `${(sliderValue / (tiers.length - 1)) * 100}%` }}
            />

            {/* Slider Thumb */}
            {tiers.map((tier, index) => {
              if (tier.value !== sliderValue) return null;
              const position = getPosition(index);
              return (
                <Box
                  key={`thumb-${tier.value}`}
                  className={classes.sliderThumb}
                  style={{ left: `${position}%` }}
                />
              );
            })}
          </Box>

          {/* HTML Range Input */}
          <input
            type="range"
            min={0}
            max={tiers.length - 1}
            value={sliderValue}
            onChange={handleSliderChange}
            step={1}
            className={classes.sliderInput}
            style={{ direction: isRTL ? 'rtl' : 'ltr' }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default EmailMarketingSlider;