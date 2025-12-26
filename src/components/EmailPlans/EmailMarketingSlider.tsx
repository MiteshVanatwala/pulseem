import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, IconButton } from '@material-ui/core';
import { ChevronLeft, ChevronRight } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';
import _ from 'lodash';
import { getEmailPerRecipientsTierScaling } from '../../redux/reducers/emailTierScalingSlice';

interface EmailMarketingSliderProps {
  classes: any;
  // Controlled mode props
  value?: number;
  onChange?: (event: any, newValue: number) => void;
  marks?: Array<{ value: number; label?: string; displayText?: string; [key: string]: any }>;
  disabled?: boolean;
  min?: number;
  max?: number;
  // Optional: hide header in controlled mode
  hideHeader?: boolean;
}

const EmailMarketingSlider = ({ 
  classes, 
  value: controlledValue,
  onChange: controlledOnChange,
  marks: controlledMarks,
  disabled = false,
  min: controlledMin,
  max: controlledMax,
  hideHeader = false
}: EmailMarketingSliderProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isRTL } = useSelector((state: any) => state.core);
  const { currencyId } = useSelector((state: any) => state.common);
  const { tiers: apiTiers, loading } = useSelector((state: any) => state.emailTierScaling);

  // Use controlled value if provided, otherwise use internal state
  const [internalValue, setInternalValue] = useState(0);
  const isControlled = controlledValue !== undefined;
  const sliderValue = isControlled ? controlledValue : internalValue;

  useEffect(() => {
    // Only fetch from API if not in controlled mode
    if (!isControlled && currencyId) {
      dispatch(getEmailPerRecipientsTierScaling(currencyId) as any);
    }
  }, [dispatch, currencyId, isControlled]);

  const uniqueTierRanges = useMemo(() => {
    if (!apiTiers || apiTiers.length === 0) return [];
    return _.uniqBy(apiTiers, 'LevelHigh');
  }, [apiTiers]);

  const tiers = useMemo(() => {
    // Use controlled marks if provided
    if (controlledMarks && controlledMarks.length > 0) {
      return controlledMarks.map((mark, index) => ({
        label: mark.displayText || mark.label || '',
        value: mark.value,
        tierData: mark
      }));
    }

    // Otherwise use API data
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
  }, [uniqueTierRanges, controlledMarks]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    if (isControlled && controlledOnChange) {
      controlledOnChange(e, newValue);
    } else {
      setInternalValue(newValue);
    }
  };

  const handleTierClick = (value: number) => {
    if (disabled) return;
    const mockEvent = { target: { value: value.toString() } } as any;
    if (isControlled && controlledOnChange) {
      controlledOnChange(mockEvent, value);
    } else {
      setInternalValue(value);
    }
  };

  const handlePrevious = () => {
    if (disabled) return;
    const minValue = controlledMin !== undefined ? controlledMin : 0;
    if (sliderValue > minValue) {
      const newValue = sliderValue - 1;
      const mockEvent = { target: { value: newValue.toString() } } as any;
      if (isControlled && controlledOnChange) {
        controlledOnChange(mockEvent, newValue);
      } else {
        setInternalValue(newValue);
      }
    }
  };

  const handleNext = () => {
    if (disabled) return;
    const maxValue = controlledMax !== undefined ? controlledMax : tiers.length - 1;
    if (sliderValue < maxValue) {
      const newValue = sliderValue + 1;
      const mockEvent = { target: { value: newValue.toString() } } as any;
      if (isControlled && controlledOnChange) {
        controlledOnChange(mockEvent, newValue);
      } else {
        setInternalValue(newValue);
      }
    }
  };

  const getPosition = (index: number) => {
    if (tiers.length === 0) return 0;
    const position = (index / (tiers.length - 1)) * 100;
    return isRTL ? 100 - position : position;
  };

  // Find the current tier index based on value
  const getCurrentTierIndex = () => {
    const tierIndex = tiers.findIndex(tier => tier.value === sliderValue);
    return tierIndex !== -1 ? tierIndex : 0;
  };

  const currentIndex = getCurrentTierIndex();
  const minValue = controlledMin !== undefined ? controlledMin : 0;
  const maxValue = controlledMax !== undefined ? controlledMax : (tiers.length - 1);
  
  // Calculate percentage for filled track
  const getFilledPercentage = () => {
    if (tiers.length === 0) return 0;
    if (maxValue <= minValue) return 0;
    return (currentIndex / (tiers.length - 1)) * 100;
  };

  if (!isControlled && (loading || tiers.length === 0)) {
    return null;
  }

  if (tiers.length === 0) {
    return null;
  }

  return (
    <Box className={clsx(classes.emailMarketingSliderContainer)}>
      {/* Header - Only show in uncontrolled mode */}
      {!hideHeader && !isControlled && (
        <Box sx={{alignItems: 'center', display: 'flex'}}>
          <Typography variant="h6" className={clsx(classes.bold)}>
              {t('billing.EmailMarketingList')}
          </Typography>
          <Typography variant="body1" className={clsx(classes.marginSides5)}>
            {t('billing.EmailMarketingListSending')}
          </Typography>
        </Box>
      )}

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
              style={{ width: `${getFilledPercentage()}%` }}
            />

            {/* Slider Thumb */}
            {tiers.map((tier, index) => {
              if (tier.value !== sliderValue) return null;
              const position = getPosition(index);
              return (
                <Box
                  key={`thumb-${tier.value}`}
                  className={classes.sliderThumb}
                  style={{ 
                    left: `${position}%`,
                    opacity: disabled ? 0.5 : 1,
                    cursor: disabled ? 'not-allowed' : 'pointer'
                  }}
                />
              );
            })}
          </Box>

          {/* HTML Range Input */}
          <input
            type="range"
            min={minValue}
            max={maxValue}
            value={currentIndex}
            onChange={(e) => {
              const newIndex = parseInt(e.target.value);
              if (newIndex >= 0 && newIndex < tiers.length) {
                const newValue = tiers[newIndex].value;
                const mockEvent = { target: { value: newValue.toString() } } as any;
                handleSliderChange(mockEvent);
              }
            }}
            step={1}
            disabled={disabled}
            className={classes.sliderInput}
            style={{ 
              direction: isRTL ? 'rtl' : 'ltr',
              cursor: disabled ? 'not-allowed' : 'pointer'
            }}
          />

          {/* Right Arrow - Increase */}
          <IconButton
            onClick={handleNext}
            className={classes.sliderArrowRight}
            aria-label="increase tier"
            disabled={disabled}
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
                  style={{ 
                    left: `${position}%`,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.6 : 1
                  }}
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