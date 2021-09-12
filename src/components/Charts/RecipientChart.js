import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { IconButton, Box, Avatar, Button, Grid, Paper, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Carousel } from 'react-responsive-carousel';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import { getRecipientsReport } from '../../redux/reducers/recipientsReportSlice';
import { actionURL } from '../../config/index';

const doughnutOptions = {
    cutout: 77,
    backgroundColor: ['#6EE602', '#E0FAC6'],
    plugins: {
        tooltip: false
    }
};

const RecipientChart = ({ classes }) => {
    const { t } = useTranslation();
    const [carouselItem, setCarouselItem] = useState(0);
    const { recipientsReport } = useSelector(state => state.recipientReports);
    const { language, windowSize, isRTL } = useSelector(state => state.core);
    const { packagesDetails } = useSelector(state => state.dashboard);
    const { Notifications = {}, Newsletter = {}, Sms = {} } = packagesDetails || {};

    const dispatch = useDispatch();


    const initData = async () => {
        dispatch(getRecipientsReport());
    }

    useEffect(initData, [dispatch]);

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
        if (report.ReportSection === 2 && !Notifications.FeatureExist ||
            report.ReportSection === 1 && !Sms.FeatureExist) {
            return;
        }
        else {
            data.push({
                labels: [t('common.harStatus.active'), t('common.charStatus.error'), t('common.charStatus.removed')],
                datasets: [{
                    data: [
                        report.Active,
                        report.Error,
                        report.Removed
                    ],
                    borderWidth: 0,
                }],
            })
        }
    });

    const renderCircleAdd = (innerTitle) => {
        return (
            <Grid item xs={12} sm={4} className={classes.doughnutGrid} key={`circleAdd${Math.round(Math.random() * 999999999)}`}>
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
            onClick: (e) => {
                const chart = e.chart;
                if (chart) {
                    const activeChart = e.chart._active[0];
                    openReports(chart.data.productType, activeChart.index);
                }
            },
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
            productType: `${report.ReportSection}`,
            labels: [t('common.charStatus.active'), t('common.charStatus.error'), t('common.charStatus.removed')],
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
            <Grid
                key={`doughnut${report.ReportSection}`}
                item xs={12} sm={12} md={4}
                className={classes.doughnutGrid}>
                <Typography align='center' className={classes.f20}>{t(titles[index].mainTitle)}</Typography>
                <Box className={classes.doughnutBox}>
                    <Typography className={classes.chartLabel}>{t('common.Total')}<br />{report.Total.toLocaleString()}</Typography>
                    <Doughnut data={innerData} options={options} />
                </Box>
            </Grid>
        );
    };

    const openReports = (productType, reportType) => {
        let qReportType = null;

        if(productType === "0")
        {
            switch(reportType) {
                case 0:{
                    qReportType = 1;
                    break;
                }
                case 1:{
                    qReportType = 4;
                    break;
                }
                case 2:{
                    qReportType = 2;
                    break;
                }
            }
            window.open(`${actionURL}ClientSearchResult.aspx?ClientStatus=${qReportType}`, '_blank', 'noopener,noreferrer');
        }
        if(productType === "1"){
            switch(reportType) {
                case 0:{
                    qReportType = 0;
                    break;
                }
                case 1:{
                    qReportType = 4;
                    break;
                }
                case 2:{
                    qReportType = 1;
                    break;
                }
            }
            window.open(`${actionURL}ClientSearchResult.aspx?ClientStatus=${qReportType}&IsSMS=true`, '_blank', 'noopener,noreferrer');
        }
        
    }

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
                        if (report.ReportSection === 2 && !Notifications.FeatureExist
                            || report.ReportSection === 1 && !Sms.FeatureExist) {
                            return;
                        }
                        if (report.Total) {
                            return renderDoughnut(report, index)
                        }
                        // else {
                        //     return renderCircleAdd(titles[index])
                        // }
                    })}
                </Carousel>
            </Grid>
        );
    };

    const renderCharts = () => {
        return (
            <Grid item container justify='space-evenly'>
                {recipientsReport.map((report, index) => {
                    if (report.ReportSection === 2 && !Notifications.FeatureExist ||
                        report.ReportSection === 1 && !Sms.FeatureExist) {
                        return;
                    }
                    if (report.Total) {
                        return renderDoughnut(report, index)
                    }
                    // else {
                    //     return renderCircleAdd(titles[index])
                    // }
                })}
            </Grid>
        );
    };

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

export default React.memo(RecipientChart);