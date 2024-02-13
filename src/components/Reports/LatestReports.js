import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'
import { Box, Grid, Paper, Tab, Tabs, Typography, Tooltip, Link, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Bar } from 'react-chartjs-2';
import clsx from 'clsx';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { getLastCampaignReport } from '../../redux/reducers/dashboardSlice';
import { actionURL } from '../../config/index';
import ButtonWithTitle from '../Buttons/ButtonWithTitle'
import { NotesIcon } from '../../assets/images/dashboard/index'
import { sitePrefix } from '../../config/index';
import { userPhoneNumbers } from '../../redux/reducers/whatsappSlice';
import { apiStatus } from '../../screens/Whatsapp/Constant';
import NoSetup from '../../screens/Whatsapp/NoSetup/NoSetup';

const LatestReports = ({ classes, t, isRTL }) => {
  const { windowSize } = useSelector(state => state.core);
  const { lastCampaignReport } = useSelector(state => state.dashboard);
  const dispatch = useDispatch();
  const [tabValue, handleTabValue] = useState(0);
  const dateTimeFormat = 'DD/MM/YY, HH:mm';
  const dateFormat = 'D.M.YYYY';
  const [isWhatsappAccountSetup, setIsWhatsappAccountSetup] = useState(true);

  const useStylesBootstrap = makeStyles((theme) => ({
    arrow: {
      color: theme.palette.common.black,
    },
    tooltip: {
      backgroundColor: theme.palette.common.black,
      fontSize: '0.77rem !important'
    },
  }));

  function BootstrapTooltip(props) {
    const classes = useStylesBootstrap();

    return <Tooltip arrow classes={classes} {...props} disableFocusListener />;
  }

  const initData = () => {
    dispatch(getLastCampaignReport());
  }

  useEffect(initData, [dispatch]);

  useEffect(() => {
    (async () => {
      const { payload: phoneNumberData } = await dispatch(userPhoneNumbers());
      if (!(
        phoneNumberData?.Status === apiStatus.SUCCESS &&
        phoneNumberData?.Data &&
        phoneNumberData?.Data?.length > 0
      )) {
        setIsWhatsappAccountSetup(false);
      }
    })();
  }, []);

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
          font: { size: 18 },
          color: 'black',
          drawTicks: true,
        },
      }
    }
  };

  let reports = {
    newsletter: lastCampaignReport ? lastCampaignReport.filter(report => report.ReportSection === 0) : null,
    sms: lastCampaignReport ? lastCampaignReport.filter(report => report.ReportSection === 1) : null,
    whatsapp: lastCampaignReport ? lastCampaignReport.filter(report => report.ReportSection === 2) : null,
  }

  const { newsletter = null, sms = null, whatsapp = null } = reports || {};
  const smsLastUpdated = sms && sms.UpdatedDate ? moment(sms.UpdatedDate).format(dateTimeFormat) : '';
  const newsletterLastUpdated = newsletter && newsletter.UpdatedDate ? moment(newsletter.UpdatedDate).format(dateTimeFormat) : '';
  const whatsappLastUpdated = whatsapp && whatsapp.UpdatedDate ? moment(whatsapp.UpdatedDate).format(dateTimeFormat) : '';

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

  const renderTab = (tabType, index) => {
    if (!lastCampaignReport) {
      return;
    }
    const innerData = reports[tabType];
    const labels = [];
    const datasets = [];
    const opens = [];
    const clicks = [];
    const removed = [];

    innerData?.forEach((campaign, index) => {
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
        { label: `${t('common.Opens')}`, backgroundColor: "#FF0076", hoverBackgroundColor: "#FF0076", data: opens },
        { label: `${t('common.Clicks')}`, backgroundColor: "#CCFF00", hoverBackgroundColor: "#CCFF00", data: clicks }
      );
    }

    if (tabType === 'sms') {
      datasets.push(
        { label: `${t('common.Removed')}`, backgroundColor: "#FF0076", hoverBackgroundColor: "#FF0076", data: removed },
        { label: `${t('common.Clicks')}`, backgroundColor: "#CCFF00", hoverBackgroundColor: "#CCFF00", data: clicks }
      );
    }
    if (tabType === 'whatsapp') {
      datasets.push(
        { label: `${t('common.Removed')}`, backgroundColor: "#FF0076", hoverBackgroundColor: "#FF0076", data: removed },
        { label: `${t('common.Clicks')}`, backgroundColor: "#CCFF00", hoverBackgroundColor: "#CCFF00", data: clicks }
      );
    }


    const reportData = {
      data: {
        labels,
        datasets
      }
    }

    let NoDataObject = {
      sms: {
        title: t("dashboard.createFirstSms"),
        buttonText: t('sms.create'),
        redirect: `${sitePrefix}sms/create`
      },
      newsletter: {
        title: t("dashboard.createFirstNewsletter"),
        buttonText: t('common.CreateNewsletter'),
        redirect: `${sitePrefix}Campaigns/Create`

      },
      whatsapp: {
        title: t("whatsapp.whatsappTemplate"),
        buttonText: t('whatsapp.NewWhatsappCampaign'),
        redirect: `${sitePrefix}whatsapp/template/create`
      }
    }

    const showGraphs = !!(innerData && (innerData.length > 0));

    return (
      <TabPanel value={tabValue} index={index} key={`newsletterTabPanel_${tabType}`}>
        <Box className={clsx(!showGraphs ? classes.tabPanel : null, windowSize !== 'xs' ? classes.spaceBetween : '', classes.flexJustifyCenter, classes.flexWrap)}>
          <Grid container spacing={2}>
            <Grid item sm={12} md={5} className={classes.w100}>
              <Box className={clsx(tabType !== "newsletter" ? clsx(classes.flex, classes.flexColumn) : null, classes.flex1)}>
                {
                  showGraphs ? (innerData.map((c, index) => {
                    const campaignLink = tabType === 'newsletter' ? `${actionURL}CampaignStatistics.aspx?CampaignID=${c.CampaignID}` : `${sitePrefix}reports/SMSMainReport?name=${c.CampaignName}`;
                    return (
                      <Box key={index} className={classes.w100}>
                        {index === 0 && <Divider />}
                        <Box style={{ height: 40, background: index % 2 === 1 ? '#F0F5FF' : '#fff' }} className={clsx(classes.flex)} key={`${c.CampaignName}_${index}`}>
                          <Box className={clsx(classes.flex2, classes.paddingSides5, classes.textCenter)}>
                            <BootstrapTooltip title={c.CampaignName} placement="top">
                              <Link href={campaignLink} className={clsx(classes.dInlineBlock, classes.f14, classes.ellipsisText, classes.graphCampaignName)} style={{ maxWidth: windowSize === 'xs' ? '80%' : 'revert-layer' }}>
                                {c.CampaignName?.substring(0, 25)} {c.CampaignName?.length > 25 ? '...' : null}
                              </Link>
                            </BootstrapTooltip>
                          </Box>
                          {tabType === "sms" && <Box className={classes.flex1}>
                            <Box>
                              <Typography className={clsx(classes.dInline, classes.ml5, classes.mr5, classes.f14)}>
                                {c.TotalSendPlan.toLocaleString()} {`${c.TotalSendPlan === 1 ? t('common.Recipient') : t('common.Recipients')}`}
                              </Typography>
                            </Box>
                          </Box>
                          }
                          <Box className={classes.flex1}>
                            <Typography className={clsx(classes.dInlineBlock, classes.f14, classes.mr5, classes.ml5, classes.fontWrap)} style={{ direction: isRTL ? 'rtl' : 'ltr', maxWidth: '80%' }}>
                              {c.UpdatedDate ? moment(c.UpdatedDate).format(dateFormat) : ''}
                            </Typography>
                          </Box>
                        </Box>
                        {index === innerData.length - 1 && <Divider />}
                      </Box>
                    )
                  })) :
                    (
                      <></>
                    )
                }
              </Box>
            </Grid>
            <Grid item sm={12} md={7} className={classes.w100}>
              {showGraphs &&
                <Box className={classes.barChart}>
                  <Bar data={reportData.data} options={barOptions} />
                </Box>
              }
            </Grid>
          </Grid>
          {!showGraphs && (
            <Grid>
              <Box className={classes.w100}>
                {
                  tabType === 'whatsapp' && !isWhatsappAccountSetup ?
                    <NoSetup classes={classes} isCompact={true} />
                    :
                    <ButtonWithTitle
                      classes={classes}
                      title={NoDataObject[tabType].title}
                      buttonText={NoDataObject[tabType].buttonText}
                      redirect={NoDataObject[tabType].redirect}
                    />
                }
              </Box>
            </Grid>
          )}
        </Box>
      </TabPanel >
    );
  }

  const renderTabsLastReports = () => {
    let updatedOnText;
    if (tabValue === 0) {
      updatedOnText = `${newsletterLastUpdated ? t('common.UpdatedOn') : ''} ${newsletterLastUpdated}`;
    } else if (tabValue === 1) {
      updatedOnText = `${smsLastUpdated ? t('common.UpdatedOn') : ''} ${smsLastUpdated}`;
    } else {
      updatedOnText = `${whatsappLastUpdated ? t('common.UpdatedOn') : ''} ${whatsappLastUpdated}`;
    }
    return (
      <Grid container>
        <Grid
          container
          justifyContent='space-between'
          alignItems='center'
          item xs={12}
          className={clsx(classes.lastReportTitleSection, classes.dashBoxtitleSection)}>
          <Box className={clsx(classes.spaceBetween, classes.w100, classes.flexWrap)}>
            <Box className={classes.mt2}>
              <NotesIcon className={clsx(classes.marginInlineEnd15, classes.marginInlineStart5)} style={{ verticalAlign: 'middle' }} />
              <Typography
                className={clsx(classes.dInline, classes.pe10, 'title')}
              >
                {t('dashboard.lastReports')}
              </Typography>
              <Typography className={clsx(classes.colorGray, classes.f14)}>
                {updatedOnText}
              </Typography>
            </Box>
            <Box className={{ [classes.w100]: windowSize === 'xs' }}>
              <Tabs
                value={tabValue}
                onChange={(e, value) => handleTabValue(value)}
                className={clsx(classes.ml15, classes.tab, classes.tablistRoot)}
                classes={{ indicator: classes.hideIndicator }}
                visibleScrollbar={false}
              // scrollableX={true}
              // variant="scrollable"
              // orientation="horizontal"
              >
                <Tab label={t('appBar.newsletter.title')} classes={{ root: classes.btnTab, selected: classes.currentActiveTab }} />
                <Tab label={t('appBar.sms.title')} classes={{ root: classes.btnTab, selected: classes.currentActiveTab }} />
                <Tab label={t('appBar.whatsapp.title')} classes={{ root: classes.btnTab, selected: classes.currentActiveTab }} />
              </Tabs>
            </Box>
          </Box>

        </Grid>
        <Grid item xs={12} className={classes.lastReportsTabPanels}>
          {renderTab('newsletter', 0)}
          {renderTab('sms', 1)}
          {renderTab('whatsapp', 2)}
        </Grid>
      </Grid>
    );
  }

  return (
    <Paper elevation={3} style={{ height: 'max-content' }} className={clsx(classes.dashboardBottomPaper, classes.lastReportPadding)
    } >
      {renderTabsLastReports()}
    </Paper >
  )
}

export default React.memo(LatestReports);
