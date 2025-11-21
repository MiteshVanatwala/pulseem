import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, IconButton } from '@material-ui/core';
import { ChevronLeft, ChevronRight } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';
import _ from 'lodash';
import { getEmailPerRecipientsTierScaling } from '../../redux/reducers/emailTierScalingSlice';

const EmailMarketingSlider = ({ classes, onTierChange }: any) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isRTL } = useSelector((state: any) => state.core);
  const { currencyId } = useSelector((state: any) => state.common);
  const { tiers: apiTiers, loading } = useSelector((state: any) => state.emailTierScaling);

  const [sliderValue, setSliderValue] = useState(0);

  useEffect(() => {
    if (currencyId) {
      dispatch(getEmailPerRecipientsTierScaling(currencyId) as any);
    }
  }, [dispatch, currencyId]);

  const uniqueTierRanges = useMemo(() => {
    if (!apiTiers || apiTiers.length === 0) return [];
    return _.uniqBy(apiTiers, 'LevelHigh');
  }, [apiTiers]);

  const tiers = useMemo(() => {
    if (uniqueTierRanges.length === 0) return [];
    
    return uniqueTierRanges.map((tier: any, index: number) => {
      const levelHigh = tier.LevelHigh;
      let label = '';
      
      if (levelHigh >= 1000) {
        label = `${levelHigh / 1000}K`;
      } else {
        label = `${levelHigh}`;
      }
      
      // Add '+' for the last tier
      if (index === uniqueTierRanges.length - 1) {
        label = `${label}+`;
      }
      
      return {
        label,
        value: index,
        tierData: tier
      };
    });
  }, [uniqueTierRanges]);

   useEffect(() => {
    if (onTierChange && tiers.length > 0 && tiers[sliderValue]) {
      onTierChange(tiers[sliderValue].tierData);
    }
  }, [sliderValue, tiers, onTierChange]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderValue(parseInt(e.target.value));
  };

  const handleTierClick = (value: number) => {
    setSliderValue(value);
  };

  const handlePrevious = () => {
    if (sliderValue > 0) {
      setSliderValue(sliderValue - 1);
    }
  };

  const handleNext = () => {
    if (sliderValue < tiers.length - 1) {
      setSliderValue(sliderValue + 1);
    }
  };

  const getPosition = (index: number) => {
    if (tiers.length === 0) return 0;
    const position = (index / (tiers.length - 1)) * 100;
    return isRTL ? 100 - position : position;
  };

  if (loading || tiers.length === 0) {
    return null;
  }

  return (
    <Box className={clsx(classes.emailMarketingSliderContainer)}>
      {/* Header */}
      <Box sx={{alignItems: 'center', display: 'flex'}}>
        <Typography variant="h6" className={clsx(classes.bold)}>
            {t('billing.EmailMarketingList')}
        </Typography>
        <Typography variant="body1" className={clsx(classes.marginSides5)}>
          {t('billing.EmailMarketingListSending')}
        </Typography>
      </Box>

      <Box className={classes.sliderContainer}>
       

        <Box className={classes.sliderTrackWrapper}>
          <IconButton
            onClick={handlePrevious}
            className={classes.sliderArrowLeft}
            aria-label="decrease tier"
          >
            <ChevronLeft />
          </IconButton>

          <Box className={classes.sliderTrack}>
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

          {/* Right Arrow - Increase */}
          <IconButton
            onClick={handleNext}
            className={classes.sliderArrowRight}
            aria-label="increase tier"
          >
            <ChevronRight />
          </IconButton>
        </Box>
         {/* Tier Labels */}
        <Box className={classes.sliderLabelsWrapper}>
          <Box className={clsx(classes.sliderLabelsContainer, classes.mt20)}>
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
                      // { [classes.sliderLabelActive]: isActive }
                    )}
                  >
                    {tier.label}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default EmailMarketingSlider;