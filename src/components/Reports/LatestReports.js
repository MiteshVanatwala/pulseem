import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'
import { Box, Grid, Avatar, Paper, Tab, Tabs, Typography } from '@material-ui/core';
import { Doughnut, Bar } from 'react-chartjs-2';
import clsx from 'clsx';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { GroupsIcon } from '../../assets/images/managment/index';
import { getLastCampaignReport } from '../../redux/reducers/dashboardSlice';

const LatestReports = ({ classes, windowSize, t }) => {
  const { lastCampaignReport } = useSelector(state => state.dashboard);
  const dispatch = useDispatch();
  const [tabValue, handleTabValue] = useState(0);
  const dateTimeFormat = 'MM/DD/YY, hh:mm a';
  const dateFormat = 'MM/DD/YY';

  const initData = async () => {
    dispatch(getLastCampaignReport());
  }

  useEffect(initData, [dispatch])

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        ticks: {
          font: { size: 16 },
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

  const doughnutOptions = {
    cutout: 77,
    backgroundColor: ['#6EE602', '#E0FAC6'],
    plugins: {
      tooltip: false
    }
  };

  let reports = {
    newsletter: lastCampaignReport.find(report => report.ReportSection === 0) || null,
    sms: lastCampaignReport.find(report => report.ReportSection === 1) || null
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

  const renderNewsletterTab = () => {
    const innerData = reports.newsletter;
    const labels = [
      `${t('common.Opens')}`,
      `${t('common.Clicks')}`,
      `${t('common.Errors')}`,
      `${t('common.Removed')}`
    ];

    const reportData = {
      data: {
        labels: labels,
        datasets: [{
          data: [
            innerData && innerData.Opens || 0,
            innerData && innerData.Clicks || 0,
            innerData && innerData.Errors || 0,
            innerData && innerData.Removed || 0
          ],
          backgroundColor:
            '#0371AD',
          barThickness: 10,
          borderRadius: 2,
          borderSkipped: 'left'
        }]
      },
      campaignName: innerData && innerData.CampaignName || '',
      sendDate: innerData && innerData.SendDate || '',
      total: innerData && innerData.TotalSendPlan || 0,
      quality: innerData && innerData.Quality || 0
    }

    const quality = reportData.quality * 10;
    const date = reportData.sendDate ? moment(reportData.sendDate).format(dateFormat) : '';
    return (
      <TabPanel value={tabValue} index={0} key={`newsletterTabPanel`}>
        <Grid container justify={'space-between'}>
          <Grid item lg={4}>
            <Grid container direction='column'>
              <Grid item>
                <Typography className={classes.f22}>{reportData.campaignName}</Typography>
                <Box className={classes.p0}>
                  <img src={GroupsIcon} width={20} />
                  <Box className={clsx(classes.colorGray, classes.dInline, classes.ml5)}>
                    <Typography className={clsx(classes.ml5, classes.dInline)}>{reportData.total.toLocaleString()}</Typography>
                    <Typography className={clsx(classes.ml5, classes.dInline)}>{date}</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item>
                <Box className={classes.doughnutGreenBox}>
                  <Avatar className={classes.bgLightGreen}>
                    <Typography className={classes.chartLabelGreen}>{quality.toFixed(2)}%</Typography>
                  </Avatar>
                  <Doughnut data={{ datasets: [{ data: [quality, 100 - quality] }] }} options={doughnutOptions} />
                </Box>
              </Grid>
              <Grid item>
                <Typography className={classes.f20}>{t('dashboard.campaignQuality')}</Typography>
              </Grid>
            </Grid>
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

  const renderSmsTab = () => {
    const innerData = reports.sms;
    const labels = [
      `${t('common.Sent')}`,
      `${t('common.Clicks')}`,
      `${t('common.Errors')}`,
      `${t('common.DLR')}`
    ];

    const reportData = {
      data: {
        labels: labels,
        datasets: [{
          data: [
            innerData && innerData.TotalSendPlan || 0,
            innerData && innerData.Clicks || 0,
            innerData && innerData.Errors || 0,
            innerData && innerData.DLR || 0
          ],
          backgroundColor:
            '#0371AD',
          barThickness: 10,
          borderRadius: 2,
          borderSkipped: 'left'
        }]
      },
      campaignName: innerData && innerData.CampaignName || '',
      sendDate: innerData && innerData.SendDate || '',
      total: innerData && innerData.TotalSendPlan || 0,
      quality: innerData && innerData.Quality || 0
    }

    const quality = reportData.quality * 10;
    const date = reportData.sendDate ? moment(reportData.sendDate).format(dateFormat) : '';
    return (
      <TabPanel value={tabValue} index={1} key={`smsTabPanel`}>
        <Grid container justify={'space-between'}>
          <Grid item lg={4}>
            <Grid container direction='column'>
              <Grid item>
                <Typography className={classes.f22}>{reportData.campaignName}</Typography>
                <Box className={classes.p0}>
                  <img src={GroupsIcon} width={20} />
                  <Box className={clsx(classes.colorGray, classes.dInline, classes.ml5)}>
                    <Typography className={clsx(classes.ml5, classes.dInline)}>{reportData.total.toLocaleString()}</Typography>
                    <Typography className={clsx(classes.ml5, classes.dInline)}>{date}</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item>
                <Box className={classes.doughnutGreenBox}>
                  <Avatar className={classes.bgLightGreen}>
                    <Typography className={classes.chartLabelGreen}>{quality.toFixed(2)}%</Typography>
                  </Avatar>
                  <Doughnut data={{ datasets: [{ data: [quality, 100 - quality] }] }} options={doughnutOptions} />
                </Box>
              </Grid>
              <Grid item>
                <Typography className={classes.f20}>{t('dashboard.campaignQuality')}</Typography>
              </Grid>

            </Grid>
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
          {renderNewsletterTab()}
          {renderSmsTab()}
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
