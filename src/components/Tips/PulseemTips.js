import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { IconButton, Box, Grid, Paper, Typography } from '@material-ui/core';
import { Carousel } from 'react-responsive-carousel';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import clsx from 'clsx';
import { getTips } from '../../redux/reducers/dashboardSlice';
import { HornIcon, IllustrationTipulseem } from '../../assets/images/dashboard/index'

const PulseemTips = ({ classes, t, isRTL }) => {
  const { tips } = useSelector(state => state.dashboard);
  const [activeTip, setActiveTip] = useState(0);

  const dispatch = useDispatch();

  const initData = () => {
    if (!tips || tips.length === 0) {
      dispatch(getTips());
    }
  }

  //eslint-disable-next-line
  useEffect(initData, [dispatch])

  const renderArrows = (value, length, setItem, className) => {
    let selectedItem = value;
    const handleNext = () => {
      if (value >= length) {
        setItem(0);
      }
      else {
        selectedItem++;
        setItem(selectedItem);
      }
    }
    const handlePrevious = () => {
      if (selectedItem <= 0) {
        setItem(tips.length - 1);
      }
      else {
        selectedItem--;
        setItem(selectedItem);
      }
    }

    return (
      <Box className={classes.justifyCenterOfCenter}>
        <Grid item className={className}>
          <IconButton onClick={handlePrevious}>
            <ArrowBackIosIcon />
          </IconButton>
          <IconButton onClick={handleNext}>
            <ArrowForwardIosIcon />
          </IconButton>
        </Grid>
      </Box>
    );
  }

  return (
    <Paper elevation={3} className={clsx(classes.dashboardBottomPaper, classes.tipMargin, classes.carouselTips)}>
      <Box className={clsx(classes.tipsTitle, classes.dashBoxtitleSection, classes.mb15)}>
        <HornIcon className={clsx(classes.marginInlineEnd15, classes.marginInlineStart5)} style={{ verticalAlign: 'middle' }} />
        <Typography
          className={clsx(classes.dInline, classes.pe10, 'title')}
        >
          {t('dashboard.tip')}{t('dashboard.ulseem')}
        </Typography>
      </Box>
      <Box className={classes.flexJustifyCenter}>
        {/* <IllustrationTipulseem /> */}
        <img alt="Tips" src={IllustrationTipulseem} width="158" height="99" />
      </Box>
      <Box dir={'ltr'} style={{marginTop: 30}}>
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
                <Typography style={{ direction: isRTL ? 'rtl' : 'ltr' }} align='center' className={classes.tipulseemMsg}>{isRTL ? tip.HebrewTipText : tip.TipText}</Typography>
              </Box>
            );
          })}
        </Carousel>
        {renderArrows(activeTip, tips.length - 1, setActiveTip, classes.carouselTipsArrows)}
      </Box>
    </Paper>
  );
}

export default React.memo(PulseemTips);
