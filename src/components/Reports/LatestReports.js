import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'
import { Box, Grid, Paper, Tab, Tabs, Typography, Tooltip, Link } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Bar } from 'react-chartjs-2';
import clsx from 'clsx';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { getLastCampaignReport } from '../../redux/reducers/dashboardSlice';
import { HiUserGroup } from 'react-icons/hi';
import { actionURL } from '../../config/index';
import ButtonWithTitle from '../Buttons/ButtonWithTitle'

const LatestReports = ({ classes, t, isRTL }) => {
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

  useEffect(initData, [dispatch]);

  const barOptions = {
    responsive: true,
    legend: {
      display: false
    },
    type: "bar",
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            var label = context.dataset.label || '';

            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + '%';
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        beforeCalculateLabelRotation: (event) => {
          event.ticks.forEach((t) => {
            if (t.label.length >= 8)
              t.label = `${t.label.substring(0, 8)}..`;
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
          drawTicks: true,
        },
      }
    }
  };

  let reports = {
    newsletter: lastCampaignReport ? lastCampaignReport.filter(report => report.ReportSection === 0) : null,
    sms: lastCampaignReport ? lastCampaignReport.filter(report => report.ReportSection === 1) : null
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
    if (!lastCampaignReport) {
      return;
    }
    const innerData = tabType === "newsletter" ? reports.newsletter : reports.sms;
    const labels = [];
    const datasets = [];
    const opens = [];
    const clicks = [];
    const removed = [];

    innerData.forEach((campaign, index) => {
      let percentOpens = 0;
      let percentClicks = 0;
      let perecentRemoved = 0;
      let errors = campaign.Error && campaign.Error > 0 ? campaign.Error : 0;

      if ((campaign.TotalSendPlan - errors) > 0) {
        percentOpens = campaign.Opens / (campaign.TotalSendPlan - errors) * 100;
        percentClicks = campaign.Clicks / (campaign.TotalSendPlan - errors) * 100;
        perecentRemoved = campaign.Removed / (campaign.TotalSendPlan - errors) * 100;
      }

      labels.push(campaign.CampaignName);

      opens.push(percentOpens.toLocaleString(undefined, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      }));
      clicks.push(percentClicks.toLocaleString(undefined, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      }));
      removed.push(perecentRemoved.toLocaleString(undefined, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      }));

    });

    if (tabType === "newsletter") {
      datasets.push(
        // { stack: 1, label: "total", backgroundColor: "#000", hoverBackgroundColor: "#000", data: total, title: 'ccc' },
        { stack: 2, label: `${t('common.Opens')}`, backgroundColor: "#579b53", hoverBackgroundColor: "#579b53", data: opens, title: 'aaa' },
        { stack: 3, label: `${t('common.Clicks')}`, backgroundColor: "#648FD5", hoverBackgroundColor: "#648FD5", data: clicks, title: 'bbb' }
      );
    }

    if (tabType === 'sms') {
      datasets.push(
        // { stack: 4, label: "total", backgroundColor: "#000", hoverBackgroundColor: "#000", data: total, title: 'ccc' },
        { stack: 5, label: `${t('common.Removed')}`, backgroundColor: "#6771DC", hoverBackgroundColor: "#6771DC", data: removed },
        { stack: 6, label: `${t('common.Clicks')}`, backgroundColor: "#648FD5", hoverBackgroundColor: "#648FD5", data: clicks }
      );
    }


    const reportData = {
      data: {
        labels,
        datasets
      }
    }

    const showGraphs = innerData && (innerData.length > 0);

    return (
      <TabPanel value={tabValue} index={tabType === 'newsletter' ? 0 : 1} key={`newsletterTabPanel_${tabType}`}>
        <Grid container justifyContent={'space-between'} className={!showGraphs ? classes.tabPanel : null}>
          <Grid item lg={showGraphs ? 4 : 12} xs={12} className={tabType !== "newsletter" ? classes.flexSpaceBetweenVertical : null}>
            {
              showGraphs ? (innerData.map((c, index) => {
                const campaignLink = tabType === 'newsletter' ? `${actionURL}CampaignStatistics.aspx?CampaignID=${c.CampaignID}` : `${actionURL}SMSMainReport.aspx?name=${c.CampaignName}`;
                return (
                  <Grid container className={clsx(tabType === "newsletter" ? classes.mb25 : null, tabType === "newsletter" ? classes.mt25 : null)} key={`${c.CampaignName}_${index}`}>
                    <Grid item lg={12} xs={12}>
                      <Box style={{ display: 'flex', alignItems: 'center' }}>
                        <BootstrapTooltip title={c.CampaignName} placement="top">
                          <Link href={campaignLink} className={clsx(classes.dInlineBlock, classes.ellipsisText, classes.graphCampaignName)}>
                            {c.CampaignName}
                          </Link>
                        </BootstrapTooltip>
                        <Typography className={clsx(classes.dInlineBlock, classes.f14, classes.italic, classes.mr5, classes.ml5, classes.fontWrap)} style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
                          {c.UpdatedDate ? moment(c.UpdatedDate).format(dateFormat) : ''}
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
              })) :
                (
                  <ButtonWithTitle
                    classes={classes}
                    title={tabType === 'newsletter' ? t("dashboard.createFirstNewsletter") : t("dashboard.createFirstSms")}
                    buttonText={tabType === 'newsletter' ? t('common.CreateNewsletter') : t('sms.create')}
                    redirect={tabType === 'newsletter' ? `/Pulseem/Editor/CampaignInfo?new=1&fromreact=true&Culture=${isRTL ? 'he-IL' : 'en-US'}` : `/react/sms/create`}
                    buttonClass={classes.createButton} />
                )
            }
          </Grid>
          {showGraphs && <Grid item lg={8} xs={12}>
            <Box className={classes.barChart}>
              <Bar data={reportData.data} options={barOptions} className={classes.barContainer} />
            </Box>
          </Grid>
          }
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
          justifyContent='space-between'
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
            className={clsx(classes.mr15, classes.ml15)}
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

  return (
    <Paper elevation={3} className={clsx(classes.dashboardBottomPaper, classes.lastReportPadding)
    } >
      {renderTabsLastReports()}
    </Paper >
  )
}

export default React.memo(LatestReports);
