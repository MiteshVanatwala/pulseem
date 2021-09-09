import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'
import { Box, Grid, Avatar, Paper, Tab, Tabs, Typography, Tooltip } from '@material-ui/core';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import { Doughnut, Bar } from 'react-chartjs-2';
import clsx from 'clsx';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { GroupsIcon } from '../../assets/images/managment/index';
import { getLastCampaignReport } from '../../redux/reducers/dashboardSlice';
import { HiUserGroup } from 'react-icons/hi';

const LatestReports = ({ classes, windowSize, t, isRTL }) => {
  const { lastCampaignReport } = useSelector(state => state.dashboard);
  const dispatch = useDispatch();
  const [tabValue, handleTabValue] = useState(0);
  const dateTimeFormat = 'DD/MM/YY, HH:mm';
  const dateFormat = 'D.M.YYYY';

  const useStylesBootstrap = makeStyles((theme) => ({
    arrow: {
      color: theme.palette.common.black,
    },
    tooltip: {
      backgroundColor: theme.palette.common.black,
    },
  }));

  function BootstrapTooltip(props) {
    const classes = useStylesBootstrap();

    return <Tooltip arrow classes={classes} {...props} disableFocusListener />;
  }

  const initData = async () => {
    dispatch(getLastCampaignReport());
  }

  useEffect(initData, [dispatch])

  const barOptions = {
    responsive: true,
    legend: {
      display: false
    },
    type: "bar",
    scales: {
      x: {
        beforeCalculateLabelRotation: (event) => {
          event.ticks.forEach((t) => {
            if (t.label.length > 10)
              t.label = `${t.label.substring(0, 10)}...`;
          });
        },
        ticks: {
          font: { size: 12 },
          color: 'black',
        },
        grid: {
          drawOnChartArea: false,
        }
      },
      y: {
        max: 100,
        min: 0,
        ticks: {
          stepSize: 25,
          callback: function (value, index, values) {
            return `${value}%`;
          },
          font: { size: 16 },
          color: 'black',
          drawTicks: false,
        },
      }
    }
  };

  let reports = {
    newsletter: lastCampaignReport.filter(report => report.ReportSection === 0) || null,
    sms: lastCampaignReport.filter(report => report.ReportSection === 1) || null
  }

  const { newsletter = null, sms = null } = reports || {};
  const smsLastUpdated = sms && sms.UpdatedDate ? moment(sms.UpdatedDate).format(dateTimeFormat) : '';
  const newsletterLastUpdated = newsletter && newsletter.UpdatedDate ? moment(newsletter.UpdatedDate).format(dateTimeFormat) : '';

  const TabPanel = (props) => {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box>
            {children}
          </Box>
        )}
      </div>
    );
  }

  const renderTab = (tabType) => {
    const innerData = tabType === "newsletter" ? reports.newsletter : reports.sms;
    const labels = [];
    const datasets = [];
    const opens = [];
    const clicks = [];
    const removed = [];

    innerData.forEach(campaign => {
      labels.push(campaign.CampaignName);
      opens.push(campaign.Opens.toLocaleString());
      clicks.push(campaign.Clicks.toLocaleString());
      removed.push(campaign.Removed.toLocaleString());
    });

    if (tabType === "newsletter") {
      datasets.push(
        { label: `${t('common.Opens')}`, backgroundColor: "#579b53", hoverBackgroundColor: "#579b53", data: opens },
        { label: `${t('common.Clicks')}`, backgroundColor: "#648FD5", hoverBackgroundColor: "#648FD5", data: clicks }
      );
    }

    if (tabType === 'sms') {
      datasets.push(
        { label: `${t('common.Removed')}`, backgroundColor: "#648FD5", hoverBackgroundColor: "#648FD5", data: removed },
        { label: `${t('common.Clicks')}`, backgroundColor: "#67B7DC", hoverBackgroundColor: "#67B7DC", data: clicks }
      );
    }


    const reportData = {
      data: {
        labels,
        datasets
      }
    }

    return (
      <TabPanel value={tabValue} index={tabType === 'newsletter' ? 0 : 1} key={`newsletterTabPanel_${tabType}`}>
        <Grid container justify={'space-between'}>
          <Grid item lg={4} className={classes.flexSpaceBetweenVertical}>
            {
              innerData.map((c, index) => {
                return (
                  <Grid container justify={'space-between'} className={classes.mb10} key={`${c.CampaignName}_${index}`}>
                    <Grid item lg={12}>
                      <Box style={{ display: 'flex', alignItems: 'center' }}>
                        <BootstrapTooltip title={c.CampaignName} placement="top">
                          <Typography className={clsx(classes.dInlineBlock, classes.ellipsisText)} style={{ fontWeight: 'bold', maxWidth: 150 }}>
                            {c.CampaignName}
                          </Typography>
                        </BootstrapTooltip>
                        <Typography className={clsx(classes.dInlineBlock, classes.f14, classes.italic, classes.mr5, classes.ml5)} style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
                          {`${t('common.UpdatedOn')}`} {c.UpdatedDate ? moment(c.UpdatedDate).format(dateFormat) : ''}
                        </Typography>
                      </Box>
                      {tabType === "sms" && <Box>
                        <HiUserGroup />
                        <Typography className={clsx(classes.dInline, classes.ml5, classes.mr5)}>
                          {c.TotalSendPlan.toLocaleString()} {`${c.TotalSendPlan === 1 ? t('common.Recipient') : t('common.Recipients')}`}
                        </Typography>
                      </Box>}
                    </Grid>
                  </Grid>
                )
              })
            }
          </Grid>
          <Grid item lg={8}>
            <Box className={classes.barChart}>
              <Bar data={reportData.data} options={barOptions} />
            </Box>
          </Grid>
        </Grid>
      </TabPanel>
    );
  }

  const renderTabsLastReports = () => {
    let updatedOnText;
    if (tabValue === 0) {
      updatedOnText = `${newsletterLastUpdated ? t('common.UpdatedOn') : ''} ${newsletterLastUpdated}`;
    } else {
      updatedOnText = `${smsLastUpdated ? t('common.UpdatedOn') : ''} ${smsLastUpdated}`;
    }
    return (
      <Grid container>
        <Grid
          container
          justify='space-between'
          alignItems='center'
          item xs={12}
          className={classes.lastReportTitleSection}>
          <Box className={classes.lastReportItemText}>
            <Typography className={clsx(classes.dashboardTitle, classes.dInline, classes.pe10)}>
              {t('dashboard.lastReports')}
            </Typography>
            <Typography className={clsx(classes.colorGray, classes.f14)}>
              {updatedOnText}
            </Typography>
          </Box>
          <Tabs
            value={tabValue}
            onChange={(e, value) => handleTabValue(value)}
            className={classes.mr15}
            classes={{ indicator: classes.hideIndicator }}
          >
            <Tab label={t('appBar.newsletter.title')} classes={{ root: classes.tabText, selected: classes.activeTab }} />
            <Tab label={t('appBar.sms.title')} classes={{ root: classes.tabText, selected: classes.activeTab }} />
          </Tabs>
        </Grid>
        <Grid item xs={12} className={classes.lastReportsTabPanels}>
          {renderTab('newsletter')}
          {renderTab('sms')}
        </Grid>
      </Grid>
    );
  }

  const renderPhoneLastReports = () => {

    const renderItem = (innerData, index, name) => {
      const phoneData = [
        { label: t('common.Opens'), value: innerData && innerData.Opens || 0 },
        { label: t('common.Clicks'), value: innerData && innerData.Clicks || 0 },
        { label: t('common.Errors'), value: innerData && innerData.Errors || 0 },
        { label: t('common.Removed'), value: innerData && innerData.Removed || 0 },
      ]
      const sendDate = innerData && innerData.SendDate || ''
      const date = sendDate ? moment(sendDate).format(dateFormat) : '';
      const total = innerData && innerData.TotalSendPlan || 0;
      return (
        <Grid item xs={12} className={clsx(classes.newsletterLastReportGrid, index === 0 && classes.newsletterItemBorder)} key={`item_${index}`}>
          <Typography align='center' className={clsx(classes.f20, classes.pb10)}>
            {name === 'newsletter' ? t('appBar.newsletter.title') : t('appBar.sms.title')}
          </Typography>
          <Typography className={classes.f20}>{innerData && innerData.CampaignName || ''}</Typography>
          <Box className={classes.p0}>
            <img src={GroupsIcon} width={20} />
            <Box className={clsx(classes.colorGray, classes.dInline, classes.ml5)}>
              <Typography className={clsx(classes.ml5, classes.dInline)}>{total.toLocaleString()}</Typography>
              <Typography className={clsx(classes.ml5, classes.dInline)}>{date}</Typography>
            </Box>
          </Box>
          {phoneData.map((item, ind) => {
            return (
              <Box key={`phoneItem${ind}`} className={classes.lastReportRowItem}>
                <Typography className={classes.f18}>{item.label}</Typography>
                <Typography className={classes.f18}>{item.value}</Typography>
              </Box>
            )
          })}
        </Grid>
      )
    }

    return (
      <Grid container className={classes.pb10}>
        <Grid item xs={12} className={classes.phoneLastReportTitle}>
          <Typography
            className={classes.dashboardTitle}>
            {t('dashboard.lastReports')}
          </Typography>
        </Grid>
        {Object.keys(reports).map((name, index) => (
          renderItem(reports[name], index, name)
        ))}
      </Grid>
    );
  }

  return (
    <Paper elevation={3} className={clsx(classes.dashboardBottomPaper, classes.lastReportPadding)}>
      {windowSize === 'xs' || windowSize === 'sm' ? renderPhoneLastReports() : renderTabsLastReports()}
    </Paper>
  )
}

export default React.memo(LatestReports);
