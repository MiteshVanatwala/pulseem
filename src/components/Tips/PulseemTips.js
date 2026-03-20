import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { IconButton, Box, Grid, Paper, Typography, Tooltip } from '@material-ui/core';
import { Carousel } from 'react-responsive-carousel';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import clsx from 'clsx';
import { getTips } from '../../redux/reducers/dashboardSlice';
import { HornIcon, IllustrationTipulseem } from '../../assets/images/dashboard/index'
import { URLS } from '../../config/enum';
import { MdLibraryBooks } from 'react-icons/md';

const PulseemTips = ({ classes, t, isRTL }) => {
  const { language, windowSize } = useSelector(state => state.core);
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
      <Box className={clsx(classes.tipsTitle, classes.dashBoxtitleSection, classes.mb15, classes.spaceBetween)}>
        <Box>
          <HornIcon className={clsx(classes.marginInlineEnd15, classes.marginInlineStart5)} style={{ verticalAlign: 'middle' }} />
          <Typography
            className={clsx(classes.dInline, classes.pe10, 'title')}
          >
            {t('dashboard.tip')}{t('dashboard.ulseem')}
          </Typography>
        </Box>
        <Box className={clsx(classes.dFlex, classes.flexWrap)} justifyContent='center' alignItems='center' style={{ position: 'relative' }}>
          <IconButton size="small" className={clsx(classes.noPadding)} onClick={() => window.open(URLS.UserGuide, '_blank')}>
            <MdLibraryBooks className={classes.linkNoDesign} style={{ fontSize: 30, color: '#ff3343' }} title={t('common.UserGuides')} />
          </IconButton>
          <Box 
            className={clsx(classes.tooltipPrimary, classes.f12)}
            style={{
              position: 'absolute',
              top: windowSize === 'xs' || windowSize === 'sm' ? '50%' : '-40px',
              left: windowSize === 'xs' || windowSize === 'sm' ? '-80px' : '50%',
              transform: windowSize === 'xs' || windowSize === 'sm' ? 'translateY(-50%)' : 'translateX(-50%)',
              backgroundColor: '#ff3343',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
              zIndex: 1000,
              fontSize: '12px'
            }}
          >
            {t('common.UserGuides')}
            <Box
              style={{
                position: 'absolute',
                top: windowSize === 'xs' || windowSize === 'sm' ? '50%' : '100%',
                left: windowSize === 'xs' || windowSize === 'sm' ? '100%' : '50%',
                marginLeft: windowSize === 'xs' || windowSize === 'sm' ? '0' : '-5px',
                marginTop: windowSize === 'xs' || windowSize === 'sm' ? '-5px' : '0',
                width: 0,
                height: 0,
                borderLeft: windowSize === 'xs' || windowSize === 'sm' ? '0' : '5px solid transparent',
                borderRight: windowSize === 'xs' || windowSize === 'sm' ? '0' : '5px solid transparent',
                borderTop: windowSize === 'xs' || windowSize === 'sm' ? '5px solid transparent' : '5px solid #f74747',
                borderBottom: windowSize === 'xs' || windowSize === 'sm' ? '5px solid transparent' : '0',
                borderLeftColor: windowSize === 'xs' || windowSize === 'sm' ? '#f74747' : 'transparent'
              }}
            />
          </Box>
        </Box>
      </Box>
      <Box className={classes.flexJustifyCenter}>
        {/* <IllustrationTipulseem /> */}
        <img alt="Tips" src={IllustrationTipulseem} width="158" height="99" />
      </Box>
      <Box dir={'ltr'} style={{ marginTop: 15, marginBottom: 20 }}>
        <Carousel
          autoPlay={true}
          interval={8000}
          infiniteLoop={true}
          selectedItem={activeTip}
          showThumbs={false}
          showStatus={false}
          showArrows={false}>
          {tips.map(tip => {
            let langTip = '';
            switch (language) {
              case 'pl': {
                langTip = tip.PolishTipText;
                break;
              }
              case 'en': {
                langTip = tip.TipText;
                break;
              }
              default:
              case 'he': {
                langTip = tip.HebrewTipText;
                break;
              }
            }
            return (
              <Box component='div' className={classes.tipItem} key={`tip${Math.round(Math.random() * 999999999)}`}>
                <Typography style={{ direction: isRTL ? 'rtl' : 'ltr' }} align='center' className={classes.tipulseemMsg}>{langTip}</Typography>
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
