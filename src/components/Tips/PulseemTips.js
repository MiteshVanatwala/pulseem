import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { IconButton, Box, Grid, Paper, Typography } from '@material-ui/core';
import { Carousel } from 'react-responsive-carousel';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import LighBulb from '../../assets/images/lightbulb.png'
import clsx from 'clsx';
import { getTips } from '../../redux/reducers/dashboardSlice';

const PulseemTips = ({ classes, t, isRTL }) => {
  const { tips } = useSelector(state => state.dashboard);
  const [activeTip, setActiveTip] = useState(0);

  const dispatch = useDispatch();

  const initData = async () => {
    dispatch(getTips());
  }

  useEffect(initData, [dispatch])

  const renderArrows = (value, length, setItem, className) => {
    let selectedItem = value;
    const handleNext = () => {
      if (value >= length) return;
      selectedItem++;
      setItem(selectedItem);
    }
    const handlePrevious = () => {
      if (selectedItem <= 0) return;
      selectedItem--;
      setItem(selectedItem);
    }

    return (
      <Grid item className={className}>
        <IconButton onClick={handlePrevious}>
          <ArrowBackIosIcon />
        </IconButton>
        <IconButton onClick={handleNext}>
          <ArrowForwardIosIcon />
        </IconButton>
      </Grid>
    );
  }

  return (
    <Paper elevation={3} className={clsx(classes.dashboardBottomPaper, classes.tipMargin, classes.carouselTips)}>
      <Box className={classes.tipsTitle}>
        <img src={LighBulb} className={classes.lightBulb} />
        <Typography
          align='center'
          variant='h5'
          className={classes.blue}>
          <b>{t('dashboard.tip')}</b>{t('dashboard.ulseem')}
        </Typography>
      </Box>
      <Box dir={'ltr'} >
        {renderArrows(activeTip, tips.length - 1, setActiveTip, classes.carouselTipsArrows)}
        <Carousel
          autoPlay={true}
          interval={8000}
          infiniteLoop={true}
          selectedItem={activeTip}
          showThumbs={false}
          showStatus={false}
          showArrows={false}>
          {tips.map(tip => {
            return (
              <Box component='div' className={classes.tipItem} key={`tip${Math.round(Math.random() * 999999999)}`}>
                <Typography style={{ direction: isRTL ? 'rtl' : 'ltr'}} align='center' className={classes.tipulseemMsg}>{isRTL ? tip.HebrewTipText : tip.TipText}</Typography>
              </Box>
            );
          })}
        </Carousel>
      </Box>
    </Paper>
  );
}

export default React.memo(PulseemTips);