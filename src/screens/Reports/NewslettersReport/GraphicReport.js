import React, { useState, useEffect, useRef } from 'react';
import { Avatar, Box, Button, Divider, Grid, List, ListItem, ListItemText, Paper, Tab, Tabs, Typography } from "@material-ui/core";
import { useTranslation } from 'react-i18next';
import DefaultScreen from '../../DefaultScreen';
import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';
import { Doughnut } from 'react-chartjs-2';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import '@amcharts/amcharts4/charts';
import { getNewsletterReportsByIds } from '../../../redux/reducers/newsletterSlice';
import TabPanel from '@material-ui/lab/TabPanel';
import TabContext from '@material-ui/lab/TabContext';
import TabList from '@material-ui/lab/TabList';
import { Loader } from '../../../components/Loader/Loader';
import useRedirect from '../../../helpers/Routes/Redirect';
import { useParams } from 'react-router-dom';
import { sitePrefix } from '../../../config';
import RecipientsTab from './RecipientsTab';

const GraphicReport = ({ props, classes }) => {
  const { isRTL } = useSelector(state => state.core)
  const Redirect = useRedirect();
  const [tabValue, setTabValue] = useState(0);
  const [showLoader, setLoader] = useState(true);
  const [campaignData, setData] = useState(null);
  //const [campaignPreviewImage, setCampaignPreviewImage] = useState(null);
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { tab } = useParams();

  const getData = async () => {
    const newsletterReport = await dispatch(getNewsletterReportsByIds(props.match.params.campaignID));
    setData(newsletterReport.payload[0]);
  }

  useEffect(async () => {
    if (tab && tab > 0) {
      setTabValue(parseInt(tab));
    }
    await getData();
    setLoader(false);
  }, [dispatch])

  const renderHeader = () => {
    return (
      <>
        <Grid container alignItems={"flex-end"} justifyContent={"space-between"}>
          <Grid item>
            <Typography className={classes.managementTitle}>
              {campaignData.Name}
            </Typography>
          </Grid>
          <Grid item className={classes.mb4}>
            <Button
              onClick={() => {
                Redirect({ url: `${sitePrefix}Reports/NewsletterReports` });
              }}
              className={classes.middleTxt}
            >
              <Typography>
                {t("mainReport.backToNewsletterReports")}
              </Typography>
            </Button>
          </Grid>
        </Grid>
        <Divider />
      </>
    )
  }

  const RenderCampaignSummary = ({ chartData = [] }) => {
    let charts = {
      pieChart: null,
      barChart: null
    }

    useEffect(() => {
      initializeCharts();

      return () => {
        Object.keys(charts).map(chart => {
          charts[chart] && charts[chart].dispose();
        });
      }
    }, [chartData])

    const initializeCharts = () => {
      initializeBarChart();
      initializePieChart();
    }

    const initializeBarChart = () => {
      charts.barChart = am4core.create("barDiv", am4charts.XYChart);

      charts.barChart.data = [{
        "title": t("report.notOpened"),
        "value": campaignData.NotOpened
      }, {
        "title": t("report.Opened"),
        "value": campaignData.OpenCount
      }];

      charts.barChart.rtl = true;
      var categoryAxis = charts.barChart.xAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = "title";
      categoryAxis.title.text = "";
      categoryAxis.renderer.grid.template.location = 0;
      categoryAxis.renderer.grid.template.disabled = true;
      categoryAxis.renderer.labels.template.disabled = true;

      var valueAxis = charts.barChart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.title.text = "";
      valueAxis.renderer.labels.template.disabled = true;

      var series = charts.barChart.series.push(new am4charts.ColumnSeries());
      series.dataFields.valueY = "value";
      series.dataFields.categoryX = "title";
      series.calculatePercent = true;
      series.stacked = true;
      series.columns.template.adapter.add("fill", function (fill, target) {
        return charts.barChart.colors.getIndex(target.dataItem.index);
      });

      var labelBullet = series.bullets.push(new am4charts.LabelBullet());
      labelBullet.label.text = "{valueY.percent.formatNumber('#.0')}%";
      labelBullet.locationY = 0.5;
      labelBullet.label.fill = am4core.color("#fff");


      var legend = new am4charts.Legend();
      legend.parent = charts.barChart.chartContainer;
      legend.position = isRTL && "right";
      legend.itemContainers.template.reverseOrder = isRTL && true;
      legend.itemContainers.template.togglable = false;
      legend.marginTop = 40

      series.events.on("ready", function (ev) {
        var legenddata = [];
        series.columns.each(function (column) {
          legenddata.push({
            name: `${column.dataItem.categoryX} - ${column.dataItem.valueY}`,
            fill: column.fill
          });
        });
        legend.data = legenddata;
      });
    }

    const initializePieChart = () => {
      charts.pieChart = am4core.create("pieDiv", am4charts.PieChart);

      charts.pieChart.data = [{
        "title": t("report.notOpened"),
        "value": campaignData.NotOpened
      }, {
        "title": t("report.Opened"),
        "value": campaignData.OpenCount
      }];

      charts.pieChart.rtl = true;
      let pieSeries = charts.pieChart.series.push(new am4charts.PieSeries());
      pieSeries.dataFields.value = "value";
      pieSeries.dataFields.category = "title";
      pieSeries.tooltip.disabled = true;
      pieSeries.ticks.template.disabled = true;
      pieSeries.alignLabels = false;
      pieSeries.labels.template.text = "{value.percent.formatNumber('#.0')}%";
      pieSeries.labels.template.radius = am4core.percent(-40);
      pieSeries.labels.template.fill = am4core.color("white");
      var slice = pieSeries.slices.template;
      slice.states.getKey("hover").properties.scale = 1;

      charts.pieChart.legend = new am4charts.Legend();
      charts.pieChart.legend.valueLabels.template.text = "{value.value}";
      charts.pieChart.legend.layout = "vertical";
      charts.pieChart.legend.align = "right";
      charts.pieChart.legend.itemContainers.template.reverseOrder = isRTL && true;
    }

    const renderCampaignData = () => {
      return (
        <List className={classes.p0} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
          <ListItem classes={{ root: clsx(classes.pt0, classes.pb0) }} key={-1}>
            <ListItemText
              primary={t('report.subjectLine')}
              secondary={campaignData.Subject}
              classes={{
                primary: clsx(classes.bold, classes.f18),
                secondary: clsx(classes.fBlack, classes.f18)
              }}
            />
          </ListItem>
          <ListItem classes={{ root: clsx(classes.pt0, classes.pb0) }} key={0}>
            <ListItemText
              primary={t('report.date')}
              secondary={campaignData.SendDate}
              classes={{
                primary: clsx(classes.bold, classes.f18),
                secondary: clsx(classes.fBlack, classes.f18)
              }}
            />
          </ListItem>
          <ListItem classes={{ root: clsx(classes.pt0, classes.pb0) }} key={1}>
            <ListItemText
              primary={t('report.FromEmail')}
              secondary={campaignData.FromEmail}
              classes={{
                primary: clsx(classes.bold, classes.f18),
                secondary: clsx(classes.fBlack, classes.f18)
              }}
            />
          </ListItem>
          <ListItem classes={{ root: clsx(classes.pt0, classes.pb0) }} key={2}>
            <ListItemText
              primary={t('report.FromName')}
              secondary={campaignData.FromName}
              classes={{
                primary: clsx(classes.bold, classes.f18),
                secondary: clsx(classes.fBlack, classes.f18)
              }}
            />
          </ListItem>
          <ListItem classes={{ root: clsx(classes.pt0, classes.pb0) }} key={3}>
            <ListItemText
              primary={t('report.Attachments')}
              secondary={campaignData.Attachments === '' ? t('report.None') : campaignData.Attachments}
              classes={{
                primary: clsx(classes.bold, classes.f18),
                secondary: clsx(classes.fBlack, classes.f18)
              }}
            />
          </ListItem>
          <ListItem classes={{ root: clsx(classes.pt0, classes.pb0) }} key={4}>
            <ListItemText
              primary={t('report.TotalSent')}
              secondary={campaignData.TotalSendPlan}
              classes={{
                primary: clsx(classes.bold, classes.f18),
                secondary: clsx(classes.fBlack, classes.f18)
              }}
            />
          </ListItem>
          <ListItem classes={{ root: clsx(classes.pt0, classes.pb0) }} key={5}>
            <ListItemText
              primary={t('report.removals')}
              secondary={campaignData.RemovedClients}
              classes={{
                primary: clsx(classes.bold, classes.f18),
                secondary: clsx(classes.fBlack, classes.f18)
              }}
            />
          </ListItem>
        </List>
      )
    }
    const renderSectionRight = () => {
      const doughnutOptions = {
        cutout: 52,
        backgroundColor: ['#6EE602', '#E0FAC6'],
        plugins: {
          tooltip: false
        }
      };
      const quality = 6 * 10;


      return (
        <Box style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
          <Paper className={clsx(classes.doughnutPaper)}>
            <Grid container direction='row' alignItems={'center'}>
              <Grid item style={{ maxWidth: 'calc(100% - 150px)', marginInlineEnd: 20, padding: '0.7rem 2.3rem' }}>
                <Typography className={clsx(classes.bold, classes.f20)}>{t('mainReport.campaignQuality')}</Typography>
                <Typography>{t("mainReport.campaignQualitySummary")}</Typography>
              </Grid>
              <Grid item>
                <Box className={clsx(classes.doughnutGreenBox, classes.size150)}>
                  <Avatar className={clsx(classes.bgLightGreen, classes.size130)}>
                    <Typography className={clsx(classes.chartLabelGreen, classes.f30)}>{quality}%</Typography>
                  </Avatar>
                  <Doughnut data={{ datasets: [{ data: [quality, 100 - quality] }] }} options={doughnutOptions} />
                </Box>
              </Grid>
            </Grid>
          </Paper>
          <Grid container className={classes.mt20} justifyContent={'space-between'}>
            <Grid item style={{ maxWidth: "250px" }}>
              <Typography className={clsx(classes.bold, classes.f20)}>{t("report.distributeOfUse")}</Typography>
              <div id="barDiv" style={{ width: "100%", height: "320px", marginTop: 45 }}></div>
            </Grid>
            <Grid item style={{ maxWidth: "250px" }}>
              <Typography className={clsx(classes.bold, classes.f20)} align='center'>{t("report.distributeOfUse")}</Typography>
              <div id="pieDiv" style={{ width: "100%", height: "350px" }}></div>
            </Grid>
          </Grid>
        </Box>
      );
    }

    return (
      <Paper elevation={0} className={classes.campaignSummary} style={{ backgroundColor: "#E3E9F0", padding: 25 }}>
        <Grid container>
          <Grid item md={4}>
            {campaignData && <Box className={classes.sidebar} style={{ height: 'calc(100vh - 300px)', width: '100%', overflow: 'auto', overflowX: 'hidden' }}>
              <div dangerouslySetInnerHTML={{ __html: campaignData.HTML }} />
            </Box>}
          </Grid>
          <Grid item md={4}>
            {renderCampaignData()}
          </Grid>
          <Grid item md={4} style={{ paddingLeft: 15, paddingRight: 15 }}>
            {renderSectionRight()}
          </Grid>
        </Grid>
      </Paper>
    );
  }

  const RenderOpenClickTab = () => {
    let charts = {
      generalSummary: null,
      byGroups: null,
      byDateTime: null
    };

    useEffect(() => {
      initializeCharts();
      return () => {
        Object.keys(charts).map(chart => {
          charts[chart] && charts[chart].dispose();
        });
      }
    })

    const initializeCharts = () => {
      loadGeneralSummaryChart();
      loadByGroupsChart();

    }

    const loadGeneralSummaryChart = () => {
      charts.generalSummary = am4core.create("genSumDiv", am4charts.XYChart);

      charts.generalSummary.data = [{
        "title": "Opens",
        "value": campaignData.OpenCount
      }, {
        "title": "Clicks",
        "value": campaignData.ClickUnique
      }];

      // Create axes
      charts.generalSummary.rtl = true;

      let categoryAxis = charts.generalSummary.xAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = "title";
      categoryAxis.renderer.grid.template.location = 0;

      // let valueAxis = charts.generalSummary.yAxes.push(new am4charts.ValueAxis());

      // Create series
      let series = charts.generalSummary.series.push(new am4charts.ColumnSeries());
      series.dataFields.valueY = "value";
      series.dataFields.categoryX = "title";
      series.name = "";
      series.columns.template.tooltipText = "{valueY}";
      series.columns.template.width = 60;
      series.tooltip.getFillFromObject = false;
      series.tooltip.background.fill = am4core.color("#000000");

      series.columns.template.adapter.add("fill", function (fill, target) {
        return charts.generalSummary.colors.getIndex(target.dataItem.index);
      });
    }

    const loadByGroupsChart = () => {
      charts.byGroups = am4core.create("byGroupsDiv", am4charts.XYChart);

      charts.byGroups.data = [{
        "title": "New Recipients February",
        "opens": 500,
        "clicks": 2025
      }, {
        "title": "Release Conference October 17",
        "opens": 500,
        "clicks": 2025
      }, {
        "title": "Did not receive SMS feedback",
        "opens": 500,
        "clicks": 2025
      }];

      charts.byGroups.rtl = true;
      // Create axes
      let categoryAxis = charts.byGroups.xAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = "title";
      categoryAxis.renderer.grid.template.location = 0;
      categoryAxis.renderer.labels.template.fontWeight = "bold";
      categoryAxis.renderer.labels.template.dy = 15;

      // let valueAxis = charts.byGroups.yAxes.push(new am4charts.ValueAxis());
      // Create series
      function createSeries(field, name) {
        var series = charts.byGroups.series.push(new am4charts.ColumnSeries());
        series.dataFields.valueY = field;
        series.dataFields.categoryX = "title";
        series.name = name;
        series.columns.template.tooltipText = "{valueY}";
        series.columns.template.width = 60;
        series.tooltip.getFillFromObject = false;
        series.tooltip.background.fill = am4core.color("#000000");

        var bullet = series.bullets.push(new am4charts.LabelBullet);
        bullet.label.text = "{name}";
        bullet.label.truncate = false;
        bullet.label.hideOversized = false;
        bullet.locationY = 1;
        bullet.dy = 15;
      }

      charts.byGroups.maskBullets = false;

      createSeries("opens", "Opens", false);
      createSeries("clicks", "Clicks", true);
    }


    const renderTotals = () => {
      const items = [
        {
          title: 'report.Opened',
          value: campaignData.OpenCount,
          percent: campaignData.OpenCountUnique
        },
        {
          title: 'report.locUniqueOpens',
          value: campaignData.OpenCountUnique,
        },
        {
          title: 'report.notOpened',
          value: campaignData.NotOpened
        },
        {
          title: 'report.error',
          value: campaignData.SendError
        },
        {
          title: 'report.clicks',
          value: campaignData.ClickCountUnique
        },
        {
          title: 'report.removals',
          value: campaignData.RemovedClients
        },
      ]
      const total = items.reduce((a, v) => a = a + v.value, 0);
      return (
        <Box className={clsx(classes.mt25, classes.mb10, classes.reportPaperBgGray, classes.spaceBetween)}>
          {items.map((item, idx) => (
            <Box className={clsx(classes.ml25, classes.ps25, classes.ps25)} key={idx}>
              <Typography className={clsx(classes.bold, classes.blue, classes.f20)}>
                {t(item.title)}
              </Typography>
              <Typography align='center' className={clsx(classes.blue, classes.f20)}>
                {`${item.value.toLocaleString()} ${((item.value / total) * 100).toFixed(2)}%`}
              </Typography>
            </Box>
          ))}
        </Box>
      );
    };

    const renderBarGraphs = () => {

      return (
        <Grid container spacing={3} className={classes.mt25}>
          <Grid item xs={12} sm={12} md={5}>
            <Typography className={clsx(classes.f20, classes.mb2)}>General Summary</Typography>
            <Paper style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
              <div id="genSumDiv" style={{ width: "90%", height: "250px" }}></div>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={12} md={7}>
            <Typography className={clsx(classes.f20, classes.mb2)}>By Groups</Typography>
            <Paper style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
              <div id="byGroupsDiv" style={{ width: "90%", height: "250px" }}></div>
            </Paper>
          </Grid>
        </Grid>
      );
    }

    return (
      <>
        {renderTotals()}
        {renderBarGraphs()}
      </>
    )
  }

  const renderManagementLine = () => {
    const handleChange = (event, newValue) => {
      setTabValue(newValue);
    };

    return (
      campaignData && <TabContext
        value={tabValue}
        onChange={handleChange}
        indicatorColor="primary"
      >
        <TabList
          onChange={handleChange}
          indicatorColor="primary">
          <Tab label={t('mainReport.summaryModalTitle')} classes={{ wrapper: classes.tabWrapper }} />
          <Tab label={t('common.Recipients')} classes={{ wrapper: classes.tabWrapper }} />
          <Tab label={t('mainReport.opensAndClicks')} classes={{ wrapper: classes.tabWrapper }} />
          <Tab label={t('mainReport.geographicalReport')} classes={{ wrapper: classes.tabWrapper }} />
          <Tab label={t('mainReport.systemsReport')} classes={{ wrapper: classes.tabWrapper }} />
        </TabList>
        <Divider />
        <TabPanel value={0} index={0} className={classes.p0}>
          {<RenderCampaignSummary chartData={campaignData} />}
        </TabPanel>
        <TabPanel value={1} index={1} className={classes.p0}>
          <RecipientsTab classes={classes} />
        </TabPanel>
        <TabPanel value={2} index={2} className={classes.p0}>
          {<RenderOpenClickTab />}
        </TabPanel>
        <TabPanel value={3} index={3} className={classes.p0}>
          Geographical Report Tab
        </TabPanel>
        <TabPanel value={4} index={4} className={classes.p0}>
          Systems Report
        </TabPanel>
      </TabContext>
    )
  }

  return (
    <DefaultScreen currentPage="reports" classes={classes}>
      {
        campaignData && <>
          {renderHeader()}
          {renderManagementLine()}
        </>
      }
      <Loader isOpen={showLoader} showBackdrop={true} />
    </DefaultScreen>
  );
};

export default GraphicReport;
