import React from 'react';
import clsx from 'clsx';
import { Loader } from '../Loader/Loader';
import { useTranslation } from 'react-i18next';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import { Typography, Box, Paper } from '@material-ui/core';
import arrowDown from "../../assets/images/down-arrow-splash.png";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import * as am4plugins_annotation from "@amcharts/amcharts4/plugins/annotation";

const GraphReport = ({ classes, reportData, showLoader }) => {
    let chart;
    am4core.useTheme(am4themes_animated);
    const { t } = useTranslation()

    chart = am4core.create("chartdiv", am4charts.XYChart3D);
    chart.data = reportData;
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "month";
    categoryAxis.cursorTooltipEnabled = false;
    categoryAxis.renderer.labels.template.rotation = 270;

    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = `[bold]${t('mainReport.chrtMonthlySendsSmlTitle.Name')}[/]`;
    valueAxis.cursorTooltipEnabled = false;

    var series = chart.series.push(new am4charts.ColumnSeries3D());
    series.dataFields.valueY = "amount";
    series.dataFields.categoryX = "month";
    series.dataFields.color = "color";
    series.tooltipText = "{categoryX}\n{valueY}";
    series.tooltip.getFillFromObject = false;
    series.tooltip.background.strokeWidth = 2;
    series.tooltip.background.cornerRadius = 0
    series.tooltip.label.fill = am4core.color("#000000");
    series.tooltip.background.propertyFields.stroke = "color";
    series.columns.template.propertyFields.fill = "color";

    chart.cursor = new am4charts.Cursor();
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
                }, {
                    "label": "Save As ...",
                    "menu": [
                        { "type": "csv", "label": "CSV" },
                        { "type": "xlsx", "label": "XLSX" },
                        { "type": "json", "label": "JSON" },
                        { "type": "pdf", "label": "PDF" },
                        { "type": "html", "label": "HTML" },
                    ]
                }, {
                    "label": "Print", "type": "print"
                }
            ]
        }
    ]
    chart.plugins.push(new am4plugins_annotation.Annotation());

    return (
        <>
            <Box style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <img src={arrowDown} width={50} height={50} className={classes.pl25} alt="" />
                <Typography className={clsx(classes.f28, classes.bold)} align='center'>{t('smsReport.amountSent')}</Typography>
                <img src={arrowDown} width={50} height={50} className={classes.ps25} alt="arrow" />
            </Box>
            <Paper elevation={3} className={classes.smsGraph} style={{ position: 'relative' }}>
                <Loader isOpen={showLoader} showBackdrop={false} />
                <div dir="ltr" id="chartdiv" style={{ width: "100%", height: "450px" }}></div>
            </Paper>
        </>
    )
}

export default GraphReport;