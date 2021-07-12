import React, { useState, useEffect } from 'react';
import DefaultScreen from '../DefaultScreen'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'
import {
  Box, Button, Grid, Avatar, Paper,
  Tab, Tabs, Typography, IconButton,
} from '@material-ui/core';
import { Doughnut, Bar } from 'react-chartjs-2';
import LighBulb from '../../assets/images/lightbulb.png';
import Users from '../../assets/images/users.png';
import clsx from 'clsx';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { getRecipientsReport, getPackagesDetails, getLastCampaignReport, getTips } from '../../redux/reducers/dashboardSlice';
import { Shortcut } from '../../components/managment';
import PricePackages from '../../components/Prices/PricePackages.component';
import { GoPackage } from 'react-icons/go/index';
import { Dialog } from '../../components/managment/index';

const DashboardScreen = ({ classes }) => {
  const { language, windowSize, isRTL } = useSelector(state => state.core);
  const { username } = useSelector(state => state.user);
  const { recipientsReport, lastCampaignReport, packagesDetails, accountAvailablePackages, tips, shortcuts, recipientsReportError,
    lastCampaignReportError, packagesDetailsError, tipsError, shortCutsError } = useSelector(state => state.dashboard);
  const [tabValue, handleTabValue] = useState(0);
  const [carouselItem, setCarouselItem] = useState(0);
  const [activeTip, setActiveTip] = useState(0);
  const [isOpenPackageDialog, setIsOpenPackageDialog] = useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const dateTimeFormat = 'DD/MM/YYYY, hh:mm a';
  const dateFormat = 'DD/MM/YYYY';

  moment.locale(language);

  const initData = async () => {
    dispatch(getPackagesDetails());
    dispatch(getRecipientsReport());
    dispatch(getLastCampaignReport());
    dispatch(getTips());
  }

  useEffect(initData, [dispatch])

  const renderBulkStatus = () => {
    const { Mms = {}, Newsletters = {}, Notifications = {}, Sms = {} } = packagesDetails || {};
    const availablePackages = accountAvailablePackages || [];
    let isNewsletterPrepaid = Newsletters.isPrepaid || Newsletters.Credits == -1;
    let isMMSPrepaid = Mms.isPrepaid || Mms.Credits == -1;
    let isNotificationsPrepaid = Notifications.isPrepaid || Notifications.Credits == -1;
    let isSMSPrepaid = Sms.isPrepaid || Sms.Credits == -1;
    return (
      <Paper
        className={clsx(classes.dashboardTopPaper, classes.bulkMargin)}
        elevation={3}>
        <Grid container justify='center'>
          <Grid item xs={8} className={classes.bulkStatusTitleSection}>
            <Typography
              align='center'
              className={classes.dashboardUsername}>
              {t('dashboard.hi')} {username},
            </Typography>
            <Typography align='center' className={classes.f20}>{t('dashboard.yourBulkStatus')}</Typography>
          </Grid>
          <Grid container item xs={9} className={classes.bulkStatusBlue} justify='space-between'>
            <Typography className={classes.bulkTitle}>{t('appBar.sms.title')}</Typography>
            <Typography className={classes.bulkTitle}>
              {isSMSPrepaid ? t('dashboard.perRecipients') : Sms.Credits}
            </Typography>
            {isSMSPrepaid && Sms.Credits <= 0 &&
              <Button onClick={() => setIsOpenPackageDialog(true)}>
                {t('dashboard.purchase')}
              </Button>
            }
          </Grid>
          <Grid container item xs={9} className={classes.bulkStatusBlue} justify='space-between'>
            <Typography className={classes.bulkTitle}>{t('appBar.newsletter.title')}</Typography>
            <Typography className={classes.bulkTitle}>
              {isNewsletterPrepaid ? t('dashboard.perRecipients') : Newsletters.Credits}
            </Typography>
          </Grid>
          <Grid container item xs={9} className={classes.bulkOutline} justify='space-between'>
            <Typography className={classes.bulkTitle}>{t('appBar.mms.title')}</Typography>
            {availablePackages.length > 0 && <a href='#' className={classes.bulkContent}>
              {/* {isMMSPrepaid?t('dashboard.perRecipients'):Mms.Credits} */}
              {t('dashboard.purchase')}
            </a>
            }
          </Grid>
          <Grid container item xs={9} className={classes.bulkOutline} justify='space-between'>
            <Typography className={classes.bulkTitle}>{t('master.notifications')}</Typography>
            {availablePackages.length > 0 &&
              <a href='#' className={classes.bulkContent}>
                {/* {isNotificationsPrepaid?t('dashboard.perRecipients'):Notifications.Credits} */}
                {t('dashboard.purchase')}
              </a>
            }
          </Grid>
        </Grid>
      </Paper>
    );
  }

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

  const renderRecipients = () => {
    const titles = [
      {
        mainTitle: 'appBar.newsletter.title',
        centerTitle: 'dashboard.noNewsletters',
      },
      {
        mainTitle: 'appBar.sms.title',
        centerTitle: 'dashboard.noSMS'
      },
      {
        mainTitle: 'master.notifications',
        centerTitle: 'dashboard.noNotifications'
      }
    ];

    let data = [];
    recipientsReport.map(report => {
      data.push({
        labels: ['Active', 'Error', 'Removed'],
        datasets: [{
          data: [
            report.Active,
            report.Error,
            report.Removed
          ],
          borderWidth: 0,
        }],
      })
    });

    const renderCircleAdd = (innerTitle) => {
      return (
        <Grid item xs={12} sm={4} className={classes.doughnutGrid}>
          <Typography align='center' className={classes.f20}>{t(innerTitle.mainTitle)}</Typography>
          <Box className={classes.doughnutBox}>
            <Avatar className={classes.emptyDoughnut}>
              <Typography className={classes.noRecipients}>{t(innerTitle.centerTitle)}</Typography>
              <Button>
                <Box className={classes.dInlineBlock}>
                  <div className={classes.addRecipientsIcon}>
                    {'\uE14F'}
                  </div>
                  <Typography className={classes.addRecipientsBtn}>{t('dashboard.add')}</Typography>
                </Box>
              </Button>
            </Avatar>
          </Box>
        </Grid>
      )
    };

    const renderDoughnut = (report, index) => {

      const getOrCreateTooltip = (chart) => {
        let tooltipEl = chart.canvas.parentNode.querySelector('div');

        if (!tooltipEl) {
          tooltipEl = document.createElement('div');
          tooltipEl.style.background = '#fff';
          tooltipEl.style.width = '70px';
          tooltipEl.style.height = '70px';
          tooltipEl.style.boxShadow = '0px 0px 5px -1px';
          tooltipEl.style.borderRadius = '50px';
          tooltipEl.style.color = 'black';
          tooltipEl.style.opacity = 1;
          tooltipEl.style.pointerEvents = 'none';
          tooltipEl.style.position = 'absolute';
          tooltipEl.style.transform = 'translate(-50%, 0)';
          tooltipEl.style.transition = 'all .1s ease';
          tooltipEl.style.display = 'flex';
          tooltipEl.style.alignItems = 'center';
          tooltipEl.style.justifyContent = 'center';

          const table = document.createElement('table');
          table.style.margin = '0px';

          tooltipEl.appendChild(table);
          chart.canvas.parentNode.appendChild(tooltipEl);
        }

        return tooltipEl;
      };

      const externalTooltipHandler = (context) => {
        const { chart, tooltip } = context;
        const tooltipEl = getOrCreateTooltip(chart);

        if (tooltip.opacity === 0) {
          tooltipEl.style.opacity = 0;
          return;
        }

        if (tooltip.body) {
          const bodyLines = tooltip.body.map(b => b.lines);
          const tableBody = document.createElement('tbody');
          bodyLines[0][0].split(': ').reverse().forEach((body, i) => {
            const tr = document.createElement('tr');
            tr.style.backgroundColor = 'inherit';
            tr.style.borderWidth = 0;
            tr.style.marginTop = i == 1 ? '-10px' : 0;
            tr.style.fontWeight = i == 0 ? '700' : '';
            tr.style.fontSize = '12px';

            const td = document.createElement('td');
            td.style.borderWidth = 0;
            td.style.position = 'absolute';
            td.style.right = '0';
            td.style.left = '0';
            td.style.bottom = i == 0 ? '30px' : '18px';

            const text = document.createTextNode(body);

            td.appendChild(text);
            tr.appendChild(td);
            tableBody.appendChild(tr);
          });

          const tableRoot = tooltipEl.querySelector('table');

          // Remove old children
          while (tableRoot.firstChild) {
            tableRoot.firstChild.remove();
          }

          tableRoot.appendChild(tableBody);
        }

        const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;
        tooltipEl.style.opacity = 1;
        tooltipEl.style.left = positionX + tooltip.caretX + 'px';
        tooltipEl.style.top = '50px';
        tooltipEl.style.font = tooltip.options.bodyFont.string;
      };

      const options = {
        layout: {
          padding: 9
        },
        rotation: -35,
        responsive: true,
        cutout: 55,
        plugins: {
          datalabels: {
            backgroundColor: 'white'
          },
          legend: {
            display: false
          },
          tooltip: {
            enabled: false,
            external: externalTooltipHandler,
          }
        },
        hoverOffset: 10,
        backgroundColor: [
          '#67B7DC',
          '#648FD5',
          '#6771DC',
        ],
        hoverBackgroundColor: [
          '#67B7DC',
          '#648FD5',
          '#6771DC',
        ],
        hoverBorderColor: [
          '#67B7DC',
          '#648FD5',
          '#6771DC',
        ]
      };

      let innerData = {
        labels: ['Active', 'Error', 'Removed'],
        datasets: [{
          data: [
            report.Active,
            report.Error,
            report.Removed
          ],
          borderWidth: 0,
        }],
      }
      return (
        <Grid item xs={12} sm={12} md={4} className={classes.doughnutGrid}>
          <Typography align='center' className={classes.f20}>{t(titles[index].mainTitle)}</Typography>
          <Box className={classes.doughnutBox}>
            <Typography className={classes.chartLabel}>{t('common.Total')}<br />{report.Total.toLocaleString()}</Typography>
            <Doughnut data={innerData} options={options} />
          </Box>
        </Grid>
      );
    };

    const renderChartsCarousel = () => {
      return (
        <Grid container dir={'ltr'} className={classes.carouselChart}>
          {renderArrows(carouselItem, 2, setCarouselItem, classes.carouselArrows)}
          <Carousel
            showIndicators={false}
            showStatus={false}
            showThumbs={false}
            showArrows={false}
            selectedItem={carouselItem}>
            {recipientsReport.map((report, index) => {
              if (report.Total) {
                return renderDoughnut(report, index)
              } else {
                return renderCircleAdd(titles[index])
              }
            })}
          </Carousel>
        </Grid>
      );
    };

    const renderCharts = () => {
      return (
        <Grid item container justify='space-evenly'>
          {recipientsReport.map((report, index) => {
            if (report.Total) {
              return renderDoughnut(report, index)
            } else {
              return renderCircleAdd(titles[index])
            }
          })}
        </Grid>
      );
    };

    return (
      <Paper elevation={3} className={classes.dashboardTopPaper}>
        <Grid container>
          <Grid item xs={12} className={classes.recipientTitleSection}>
            <Typography
              className={classes.dashboardTitle}>
              {t('dashboard.yourRecipients')}
            </Typography>
          </Grid>
          {windowSize === 'xs' || windowSize === 'sm' ? renderChartsCarousel() : renderCharts()}
        </Grid>
      </Paper>
    );
  }

  const renderTIPulseem = () => {
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
                <Box component='div' className={classes.tipItem}>
                  <Typography align='center' className={classes.tipulseemMsg}>{tip.TipText}</Typography>
                </Box>
              );
            })}
          </Carousel>
        </Box>
      </Paper>
    );
  }

  const renderLastReports = () => {
    const barOptions = {
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
              return value;
            },
            font: { size: 16 },
            color: 'black',
            drawTicks: false,
          },
        }
      }
    };

    const doughnutOptions = {
      cutout: 62,
      backgroundColor: ['#6EE602', '#E0FAC6'],
      plugins: {
        tooltip: false
      }
    };

    let reports = {
      newsletter: lastCampaignReport.find(report => report.ReportSection === 0) || null,
      sms: lastCampaignReport.find(report => report.ReportSection === 1) || null
    }

    const labels = [
      `${t('common.Opens')}`,
      `${t('common.Clicks')}`,
      `${t('common.Errors')}`,
      `${t('common.Removed')}`
    ];
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
              <Typography>{children}</Typography>
            </Box>
          )}
        </div>
      );
    }

    const renderTabPanel = (innerData, tabIndex) => {
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
        <TabPanel value={tabValue} index={tabIndex} key={`tabPanel${tabIndex}`}>
          <Grid container justify={'space-between'}>
            <Grid item lg={4}>
              <Grid container direction='column'>
                <Grid item>
                  <Typography className={classes.f20}>{reportData.campaignName}</Typography>
                  <Box className={classes.p0}>
                    <img src={Users} width={15} />
                    <Box className={clsx(classes.colorGray, classes.dInline, classes.ml5)}>
                      <Typography variant={'body2'} className={clsx(classes.ml5, classes.dInline)}>{reportData.total.toLocaleString()}</Typography>
                      <Typography variant={'body2'} className={clsx(classes.ml5, classes.dInline)}>{date}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item>
                  <Box className={classes.doughnutGreenBox}>
                    <Avatar className={classes.bgLightGreen}>
                      <Typography className={classes.chartLabelGreen}>{quality}%</Typography>
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
                {t('common.UpdatedTo')}{` ${tabValue === 0 ? newsletterLastUpdated : smsLastUpdated}`}
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
            {Object.keys(reports).map((name, ind) => (
              renderTabPanel(reports[name], ind)
            ))}
          </Grid>
        </Grid>
      );
    }

    const renderPhoneLastReports = () => {

      const renderItem = (innerData, index) => {
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
          <Grid item xs={12} className={clsx(classes.newsletterLastReportGrid, index === 0 && classes.newsletterItemBorder)}>
            <Typography align='center' className={clsx(classes.f20, classes.pb10)}>{t('appBar.newsletter.title')}</Typography>
            <Typography className={classes.f17}>{innerData && innerData.CampaignName || ''}</Typography>
            <Box className={classes.p0}>
              <img src={Users} width={15} />
              <Box className={clsx(classes.colorGray, classes.dInline, classes.ml5)}>
                <Typography variant={'body2'} className={clsx(classes.ml5, classes.dInline)}>{total.toLocaleString()}</Typography>
                <Typography variant={'body2'} className={clsx(classes.ml5, classes.dInline)}>{date}</Typography>
              </Box>
            </Box>
            {phoneData.map(item => {
              return (
                <Box className={classes.lastReportRowItem}>
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
            renderItem(reports[name], index)
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

  const renderTopSection = () => {
    return (
      <Grid container direction='row'>
        <Grid item xs={12} sm={12} md={12} lg={4}>{renderBulkStatus()}</Grid>
        <Grid item xs={12} sm={12} md={12} lg={8}>{renderRecipients()}</Grid>
      </Grid>
    );
  }

  const renderBottomSection = () => {
    return (
      <Grid container direction='row'>
        <Grid item xs={12} sm={12} md={12} lg={3}>{renderTIPulseem()}</Grid>
        <Grid item xs={12} sm={12} md={12} lg={9}>{renderLastReports()}</Grid>
      </Grid>
    );
  }

  const renderContent = () => {
    return (
      <Grid container className={classes.dashboardContainer}>
        <Grid item xs={12} sm={9} md={10}>
          {renderTopSection()}
          {renderBottomSection()}
        </Grid>
        <Grid item xs={12} sm={3} md={2}>
          <Shortcut
            classes={classes}
          />
        </Grid>
      </Grid>
    );
  };


  const renderPackagesListDialog = () => {
    return {
      showDivider: false,
      icon: (
        <GoPackage style={{ fontSize: 30 }} />
      ),
      content: (
        <Grid item xs={12}>
          <PricePackages classes={classes} />
        </Grid>
      )
    };
  }

  const handleDialogClose = () => {
    setIsOpenPackageDialog(false);
  }

  const renderPackagesDialog = () => {
    if (isOpenPackageDialog === true) {
      let dialog = {};
      dialog = renderPackagesListDialog();

      return (
        <Dialog
          classes={classes}
          open={isOpenPackageDialog}
          onClose={handleDialogClose}
          onConfirm={handleDialogClose}
          showDefaultButtons={false}
          {...dialog}>
          {dialog.content}
        </Dialog>
      );
    }
  }

  return (
    <DefaultScreen
      currentPage='dashboard'
      classes={classes}
      customStyle={classes.dashboard}>
      {renderContent()}
      {renderPackagesDialog()}
    </DefaultScreen>
  )
}

export default DashboardScreen;
