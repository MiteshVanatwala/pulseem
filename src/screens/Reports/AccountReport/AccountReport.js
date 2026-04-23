import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import DefaultScreen from '../../DefaultScreen';
import clsx from 'clsx';
import {
  Typography, Grid, Box, Paper, Tooltip
} from '@material-ui/core';
import { Loader } from '../../../components/Loader/Loader';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import 'moment/locale/he';
import { getAccountReport } from '../../../redux/reducers/accountReportSlice';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

am4core.useTheme(am4themes_animated);

// ─── Mock data (replaced by real API when backend is ready) ──────────────────
const MOCK_EMAILS_SENT = [
  { subAccountName: 'Main Account', emailsSent: 610, opens: 72, opensPercent: 11.80, clicks: 61, clicksPercent: 10.00, bounced: 74, bouncedPercent: 12.13, color: '#A8D8EA' },
];

const MONTH_COLORS = [
  '#CDDC39', '#8BC34A', '#4CAF50', '#00BCD4',
  '#2196F3', '#3F51B5', '#9C27B0', '#E91E63',
  '#FF5722', '#FF9800', '#FF6F00', '#FFC107'
];

const MOCK_MONTHLY_SENT = [
  { month: '5/2025', amount: 5, color: MONTH_COLORS[0] },
  { month: '6/2025', amount: 24, color: MONTH_COLORS[1] },
  { month: '7/2025', amount: 44, color: MONTH_COLORS[2] },
  { month: '8/2025', amount: 8, color: MONTH_COLORS[3] },
  { month: '9/2025', amount: 68, color: MONTH_COLORS[4] },
  { month: '10/2025', amount: 11, color: MONTH_COLORS[5] },
  { month: '11/2025', amount: 18, color: MONTH_COLORS[6] },
  { month: '12/2025', amount: 13, color: MONTH_COLORS[7] },
  { month: '1/2026', amount: 58, color: MONTH_COLORS[8] },
  { month: '2/2026', amount: 47, color: MONTH_COLORS[9] },
  { month: '3/2026', amount: 310, color: MONTH_COLORS[10] },
  { month: '4/2026', amount: 124, color: MONTH_COLORS[11] },
];

const MOCK_RECIPIENTS_BY_DATE = [
  { month: '5/2025', amount: 1, color: MONTH_COLORS[0] },
  { month: '6/2025', amount: 158, color: MONTH_COLORS[1] },
  { month: '7/2025', amount: 15, color: MONTH_COLORS[2] },
  { month: '8/2025', amount: 31, color: MONTH_COLORS[3] },
  { month: '9/2025', amount: 125, color: MONTH_COLORS[4] },
  { month: '10/2025', amount: 29, color: MONTH_COLORS[5] },
  { month: '11/2025', amount: 14, color: MONTH_COLORS[6] },
  { month: '12/2025', amount: 23, color: MONTH_COLORS[7] },
  { month: '1/2026', amount: 62, color: MONTH_COLORS[8] },
  { month: '2/2026', amount: 18, color: MONTH_COLORS[9] },
  { month: '3/2026', amount: 147, color: MONTH_COLORS[10] },
  { month: '4/2026', amount: 92, color: MONTH_COLORS[11] },
];
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a 3D column chart (amCharts) matching the original .aspx design
 */
const create3DBarChart = (containerId, data, yAxisTitle) => {
  const chart = am4core.create(containerId, am4charts.XYChart3D);
  chart.data = data;

  // X Axis (categories = months)
  const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
  categoryAxis.dataFields.category = "month";
  categoryAxis.cursorTooltipEnabled = false;
  categoryAxis.renderer.labels.template.rotation = 270;
  categoryAxis.renderer.labels.template.fontSize = 12;
  categoryAxis.renderer.labels.template.fill = am4core.color("#000");
  categoryAxis.renderer.labels.template.fontWeight = "600";
  categoryAxis.renderer.grid.template.disabled = false;
  categoryAxis.renderer.grid.template.strokeOpacity = 0.1;
  categoryAxis.renderer.minGridDistance = 20;

  // Y Axis (values)
  const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
  valueAxis.title.text = `[bold]${yAxisTitle}[/]`;
  valueAxis.cursorTooltipEnabled = false;
  valueAxis.renderer.grid.template.strokeOpacity = 0.15;

  // 3D Column Series
  const series = chart.series.push(new am4charts.ColumnSeries3D());
  series.dataFields.valueY = "amount";
  series.dataFields.categoryX = "month";
  series.columns.template.propertyFields.fill = "color";
  series.columns.template.propertyFields.stroke = "color";
  series.columns.template.column3D.stroke = am4core.color("#fff");
  series.columns.template.column3D.strokeOpacity = 0.2;
  series.tooltipText = "[bold]{valueY}[/]";
  series.tooltip.getFillFromObject = false;
  series.tooltip.background.strokeWidth = 2;
  series.tooltip.background.cornerRadius = 4;
  series.tooltip.label.fill = am4core.color("#000");
  series.tooltip.background.propertyFields.stroke = "color";

  series.maskBullets = false;

  series.bullets.template.locationY = 1;

  // Single bold black label above every bar — no duplicates, no color issues
  const labelBullet = series.bullets.push(new am4charts.LabelBullet());
  labelBullet.label.text = "{valueY}";
  labelBullet.label.fontSize = 14;
  labelBullet.label.fontWeight = "bold";
  labelBullet.label.fill = am4core.color("#000");
  labelBullet.label.truncate = false;
  labelBullet.label.hideOversized = false;
  labelBullet.label.verticalCenter = "top";
  labelBullet.label.dy = 10;
  labelBullet.zIndex = 10;

  // Export menu (matching original)
  chart.exporting.menu = new am4core.ExportMenu();
  chart.exporting.menu.items = [
    {
      "label": "...",
      "menu": [
        {
          "label": "Download As ...",
          "menu": [
            { "type": "png", "label": "PNG" },
            { "type": "jpg", "label": "JPG" },
            { "type": "svg", "label": "SVG" },
            { "type": "pdf", "label": "PDF" }
          ]
        },
        {
          "label": "Save As ...",
          "menu": [
            { "type": "csv", "label": "CSV" },
            { "type": "xlsx", "label": "XLSX" },
            { "type": "json", "label": "JSON" }
          ]
        },
        { "label": "Print", "type": "print" }
      ]
    }
  ];

  chart.cursor = new am4charts.XYCursor();
  chart.cursor.behavior = "none";

  return chart;
};

const AccountReport = ({ classes }) => {
  const { language, windowSize, isRTL } = useSelector(state => state.core);
  const { accountReportData } = useSelector(state => state.accountReport);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showLoader, setLoader] = useState(true);

  const monthlySentChartRef = useRef(null);
  const recipientsChartRef = useRef(null);
  const emailsSentChartRef = useRef(null);

  moment.locale(language);

  useEffect(() => {
    const loadData = async () => {
      setLoader(true);
      try {
        await dispatch(getAccountReport({}));
      } catch (e) {
        // API not ready — will use mock data
      }
      setLoader(false);
    };
    loadData();
  }, [dispatch]);

  // Use real data if available, otherwise mock
  const emailsSentData = accountReportData?.emailsSent || MOCK_EMAILS_SENT;
  const monthlySentData = accountReportData?.monthlySent || MOCK_MONTHLY_SENT;
  const recipientsByDate = accountReportData?.recipientsByDate || MOCK_RECIPIENTS_BY_DATE;

  // ─── Create amCharts when data is ready ──────────────────────────────────
  useLayoutEffect(() => {
    if (showLoader) return;

    // Emails Sent chart
    emailsSentChartRef.current = createEmailsSentChart(
      "emailsSentChart",
      emailsSentData
    );

    // Sent by Month chart
    monthlySentChartRef.current = create3DBarChart(
      "sentByMonthChart",
      monthlySentData,
      'Emails Sent'
    );

    // Recipients by Date chart
    recipientsChartRef.current = create3DBarChart(
      "recipientsByDateChart",
      recipientsByDate,
      'Recipients Amount'
    );

    return () => {
      if (emailsSentChartRef.current) {
        emailsSentChartRef.current.dispose();
      }
      if (monthlySentChartRef.current) {
        monthlySentChartRef.current.dispose();
      }
      if (recipientsChartRef.current) {
        recipientsChartRef.current.dispose();
      }
    };
  }, [showLoader, emailsSentData, monthlySentData, recipientsByDate]);


  // ─── Create Emails Sent chart (top section) ────────────────────────────────
  const smileImages = [
    require('../../../assets/images/smile copy.png'),
    require('../../../assets/images/smile2.png'),
    require('../../../assets/images/smile3.png'),
    require('../../../assets/images/smile4.png'),
  ];

  const createEmailsSentChart = (containerId, data) => {
    // Transform data into chart-ready format
    // Each sub-account gets 4 bars: Total, Opens, Clicks, Bounced
    const chartData = [];
    data.forEach((account) => {
      chartData.push(
        { category: account.subAccountName, value: account.emailsSent, color: '#A8D8EA', label: `${t('AccountReport.total')}: ${account.emailsSent}`, icon: smileImages[0] },
        { category: `Opens`, value: account.opens, color: '#FFD700', label: `${t('AccountReport.opens')}: ${account.opens} (${account.opensPercent}%)`, icon: smileImages[1] },
        { category: `Clicks`, value: account.clicks, color: '#B8D430', label: `${t('AccountReport.clicks')}: ${account.clicks} (${account.clicksPercent}%)`, icon: smileImages[2] },
        { category: `Bounced`, value: account.bounced, color: '#E8A090', label: `${t('AccountReport.bounced')}: ${account.bounced} (${account.bouncedPercent}%)`, icon: smileImages[3] },
      );
    });

    const chart = am4core.create(containerId, am4charts.XYChart);
    chart.data = chartData;
    chart.paddingBottom = 50;
    chart.paddingTop = 80;

    // X Axis
    const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "category";
    categoryAxis.cursorTooltipEnabled = false;
    categoryAxis.renderer.grid.template.disabled = true;
    categoryAxis.renderer.labels.template.disabled = true;
    categoryAxis.renderer.minGridDistance = 40;

    // Y Axis
    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.cursorTooltipEnabled = false;
    valueAxis.renderer.grid.template.strokeOpacity = 0.08;
    valueAxis.renderer.grid.template.strokeDasharray = "4,4";
    valueAxis.renderer.labels.template.disabled = true;
    valueAxis.min = 0;

    // Column Series
    const series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueY = "value";
    series.dataFields.categoryX = "category";
    series.columns.template.propertyFields.fill = "color";
    series.columns.template.propertyFields.stroke = "color";
    series.columns.template.strokeWidth = 0;
    series.columns.template.width = am4core.percent(85);
    series.columns.template.column.cornerRadiusTopLeft = 6;
    series.columns.template.column.cornerRadiusTopRight = 6;
    series.columns.template.column.cornerRadiusBottomLeft = 6;
    series.columns.template.column.cornerRadiusBottomRight = 6;
    series.columns.template.tooltipText = "[bold]{label}[/]";
    series.tooltip.getFillFromObject = false;
    series.tooltip.background.fill = am4core.color("#fff");
    series.tooltip.label.fill = am4core.color("#000");
    series.tooltip.background.strokeWidth = 2;
    series.tooltip.background.propertyFields.stroke = "color";
    series.tooltip.label.fontSize = 13;
    series.tooltip.pointerOrientation = "vertical";
    series.columns.template.tooltipY = 0;

    // Smile avatar image bullets on TOP of each bar
    const imageBullet = series.bullets.push(new am4charts.Bullet());
    const image = imageBullet.createChild(am4core.Image);
    image.propertyFields.href = "icon";
    image.width = 40;
    image.height = 40;
    image.horizontalCenter = "middle";
    image.verticalCenter = "bottom";
    image.dy = -5;

    // Label centered inside the bar near the bottom
    const labelBullet = series.bullets.push(new am4charts.LabelBullet());
    labelBullet.label.text = "{label}";
    labelBullet.label.fontSize = 13;
    labelBullet.label.fontWeight = "600";
    labelBullet.label.fill = am4core.color("#333");
    labelBullet.label.truncate = false;
    labelBullet.label.hideOversized = false;
    labelBullet.locationY = 0.5;
    labelBullet.label.verticalCenter = "middle";

    // Export menu
    chart.exporting.menu = new am4core.ExportMenu();
    chart.exporting.menu.items = [
      {
        "label": "...",
        "menu": [
          {
            "label": "Download As ...",
            "menu": [
              { "type": "png", "label": "PNG" },
              { "type": "jpg", "label": "JPG" },
              { "type": "svg", "label": "SVG" },
              { "type": "pdf", "label": "PDF" }
            ]
          },
          {
            "label": "Save As ...",
            "menu": [
              { "type": "csv", "label": "CSV" },
              { "type": "xlsx", "label": "XLSX" },
              { "type": "json", "label": "JSON" }
            ]
          },
          { "label": "Print", "type": "print" }
        ]
      }
    ];

    return chart;
  };

  return (
    <DefaultScreen classes={classes} currentPage="reports" subPage="accountReport">
      <Box style={{ maxWidth: 1600, margin: '0 auto', padding: '20px 16px 40px' }}>

        {/* ── Page Title ──────────────────────────────────────────────── */}
        <Typography align="center" style={{
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 8,
          color: '#333',
        }}>
          {t('AccountReport.pageTitle')}
          <Tooltip title="Presents general information about emails sent by the account" arrow placement="top">
            <Typography component="span" style={{
              marginLeft: 6,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 18,
              height: 18,
              border: '1px solid #666',
              borderRadius: 2,
              fontSize: 12,
              fontWeight: 700,
              color: '#444',
              cursor: 'pointer',
              verticalAlign: 'middle',
              lineHeight: '18px',
            }}>i</Typography>
          </Tooltip>
        </Typography>

        {showLoader ? <Loader /> : (
          <>
            {/* ── Emails Sent (Top Section) ───────────────────────────── */}
            <Typography align="center" style={{
              fontSize: 20,
              fontWeight: 700,
              marginTop: 24,
              marginBottom: 16,
              color: '#333',
            }}>
              {t('AccountReport.emailsSent')}
            </Typography>

            {/* ── Emails Sent Chart ──────────────────────────────────── */}
            <Box dir="ltr" id="emailsSentChart" style={{
              width: '100%',
              height: Math.max(370, emailsSentData.length * 210),
            }} />

            {/* ── Sent by Month (Middle Section) ──────────────────────── */}
            <Typography align="center" style={{
              fontSize: 20,
              fontWeight: 700,
              marginTop: 40,
              marginBottom: 16,
              color: '#333',
            }}>
              {t('AccountReport.sentByMonth')}
            </Typography>
            <Box dir="ltr" id="sentByMonthChart" style={{
              width: '100%',
              height: 450,
            }} />

            {/* ── Number of Recipients by Date (Bottom Section) ────────── */}
            <Typography align="center" style={{
              fontSize: 20,
              fontWeight: 700,
              marginTop: 40,
              marginBottom: 16,
              color: '#333',
            }}>
              {t('AccountReport.recipientsByDate')}
            </Typography>
            <Box dir="ltr" id="recipientsByDateChart" style={{
              width: '100%',
              height: 450,
            }} />
          </>
        )}
      </Box>
    </DefaultScreen>
  );
};

export default AccountReport;
