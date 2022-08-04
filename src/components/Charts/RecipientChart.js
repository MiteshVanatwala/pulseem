import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { IconButton, Box, Avatar, Button, Grid, Paper, Typography, Link, Tooltip } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Carousel } from 'react-responsive-carousel';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import { getRecipientsReport } from '../../redux/reducers/recipientsReportSlice';
import { BsInfoCircleFill } from 'react-icons/bs';
import clsx from 'clsx';
import ButtonWithTitle from '../Buttons/ButtonWithTitle';
import { CLIENT_CONSTANTS } from '../../model/Clients/Contants';
import { useNavigate } from 'react-router';


const RecipientChart = ({ classes, }) => {
    const navigate = useNavigate()
    const { t } = useTranslation();
    const [carouselItem, setCarouselItem] = useState(0);
    const { recipientsReport } = useSelector(state => state.recipientReports);
    const { windowSize, isRTL } = useSelector(state => state.core);
    const { packagesDetails } = useSelector(state => state.dashboard);
    const { Notifications = {}, Newsletter = {}, Sms = {} } = packagesDetails || {};

    const useStylesBootstrap = makeStyles((theme) => ({
        arrow: {
            color: theme.palette.common.black,
        },
        tooltip: {
            backgroundColor: theme.palette.common.black,
        },
    }));

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
    if (recipientsReport) {
        recipientsReport.map(report => {
            if (report.ReportSection === 2 && !Notifications.FeatureExist ||
                report.ReportSection === 1 && !Sms.FeatureExist) {
                return;
            }
            else {
                data.push({
                    labels: [t('common.harStatus.active'), t('common.charStatus.error'), t('common.charStatus.removed'), t('common.Waiting'), t('common.Waiting')],
                    datasets: [{
                        data: [
                            report.Active,
                            report.Error,
                            report.Removed,
                            (report.ReportSection === 0) ? report.PendingEmails : (report.ReportSection === 1) ? report.PendingSms : null
                        ],
                        borderWidth: 0,
                    }],
                })
            }
        });
    }

    // const renderCircleAdd = (innerTitle) => {
    //     return (
    //         <Grid item xs={12} sm={4} className={classes.doughnutGrid} key={`circleAdd${Math.round(Math.random() * 999999999)}`}>
    //             <Typography align='center' className={classes.f20}>{t(innerTitle.mainTitle)}</Typography>
    //             <Box className={classes.doughnutBox}>
    //                 <Avatar className={classes.emptyDoughnut}>
    //                     <Typography className={classes.noRecipients}>{t(innerTitle.centerTitle)}</Typography>
    //                     <Button>
    //                         <Box className={classes.dInlineBlock}>
    //                             <div className={classes.addRecipientsIcon}>
    //                                 {'\uE14F'}
    //                             </div>
    //                             <Typography className={classes.addRecipientsBtn}>{t('dashboard.add')}</Typography>
    //                         </Box>
    //                     </Button>
    //                 </Avatar>
    //             </Box>
    //         </Grid>
    //     )
    // };

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
                    openReports(report.ReportSection, activeChart?.index);
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
                '#c5caff'
            ],
            hoverBackgroundColor: [
                '#67B7DC',
                '#648FD5',
                '#6771DC',
                '#c5caff'
            ],
            hoverBorderColor: [
                '#67B7DC',
                '#648FD5',
                '#6771DC',
                '#c5caff'
            ]
        };

        let innerData = {
            productType: report.ReportSection,
            labels: [t('common.charStatus.active'), t('common.charStatus.error'), t('common.charStatus.removed'), t('common.Waiting'), t('common.Waiting')],
            datasets: [{
                data: [
                    report.Active,
                    report.Error,
                    report.Removed,
                    (report.ReportSection === 0) ? report.PendingEmails : (report.ReportSection === 1) ? report.PendingSms : null
                ],
                borderColor: [
                    '#67B7DC',
                    '#648FD5',
                    '#6771DC',
                    '#c5caff'
                ],
                borderWidth: 2
            }],
        }
        return (
            <Grid
                key={`doughnut${report.ReportSection}`}
                item xs={12} sm={12} md={4}
                className={classes.doughnutGrid}>
                <Typography align='center' className={classes.f20}>{t(titles[index].mainTitle)}</Typography>
                <Box className={classes.doughnutBox}>
                    {/* <Link
                        href="#!"
                        className={classes.chartLabel}
                        onClick={() => openReports(report.ReportSection, "total")}>{t('common.Total')}<br />{report.Total.toLocaleString()}</Link> */}
                    <Typography
                        href="#!"
                        className={classes.chartLabel}
                        onClick={() => openReports(report.ReportSection, "total")}>{t('common.Total')}<br />{report.Total.toLocaleString()}</Typography>
                    <Doughnut data={innerData} options={options} style={{ cursor: 'pointer' }} />
                </Box>
            </Grid>
        );
    };

    const openReports = (productType, reportType) => {
        let qReportType = null;
        let resultTitle = null;

        if (reportType === "total") {
            qReportType = 100;
            if (productType === 0) {
                resultTitle = t('client.titles.searchResult.newsletter.total');
                navigate(CLIENT_CONSTANTS.BASEURL, {
                    state: {
                        ...CLIENT_CONSTANTS.QUERY_PARAMS,
                        PageType: CLIENT_CONSTANTS.PAGE_TYPES.ClientStatus,
                        TestStatusOfEmailElseSms: 1,
                        Status: qReportType,
                        ResultTitle: resultTitle
                    }
                })
            }
            if (productType === 1) {
                resultTitle = t('client.titles.searchResult.sms.total');
                navigate(CLIENT_CONSTANTS.BASEURL, {
                    state: {
                        ...CLIENT_CONSTANTS.QUERY_PARAMS,
                        PageType: CLIENT_CONSTANTS.PAGE_TYPES.ClientStatus,
                        Status: qReportType,
                        ResultTitle: resultTitle,
                        TestStatusOfEmailElseSms: 0
                    }
                })
            }
        }
        if (productType === 0) {
            switch (reportType) {
                case 0: {
                    qReportType = 1;
                    resultTitle = t('client.titles.searchResult.newsletter.active');
                    break;
                }
                case 1: {
                    qReportType = 4;
                    resultTitle = t('client.titles.searchResult.newsletter.error');
                    break;
                }
                case 2: {
                    qReportType = 2;
                    resultTitle = t('client.titles.searchResult.newsletter.removed');
                    break;
                }
                case 5: {
                    qReportType = 5;
                    resultTitle = t('client.clientStatus.sms.Pending');
                    break;
                }
                default: { return; }
            }

            navigate(CLIENT_CONSTANTS.BASEURL, {
                state: {
                    ...CLIENT_CONSTANTS.QUERY_PARAMS,
                    PageType: CLIENT_CONSTANTS.PAGE_TYPES.ClientStatus,
                    Status: qReportType,
                    ResultTitle: resultTitle,
                    TestStatusOfEmailElseSms: 1
                }
            })
        }
        if (productType === 1) {
            switch (reportType) {
                case 0: {
                    qReportType = 0;
                    resultTitle = t('client.titles.searchResult.sms.active');
                    break;
                }
                case 1: {
                    qReportType = 4;
                    resultTitle = t('client.titles.searchResult.sms.error');
                    break;
                }
                case 2: {
                    qReportType = 1;
                    resultTitle = t('client.titles.searchResult.sms.removed');
                    break;
                }
                case 5: {
                    qReportType = 5;
                    resultTitle = t('client.clientStatus.email.Pending');
                    break;
                }
                default: { return; }
            }
            navigate(CLIENT_CONSTANTS.BASEURL, {
                state: {
                    ...CLIENT_CONSTANTS.QUERY_PARAMS,
                    PageType: CLIENT_CONSTANTS.PAGE_TYPES.ClientStatus,
                    TestStatusOfEmailElseSms: 0,
                    ResultTitle: resultTitle,
                    Status: qReportType
                }
            })
        }

    }

    const renderChartsCarousel = () => {
        if (!recipientsReport) {
            return;
        }

        let totalRecipientsReport = 0;

        if (recipientsReport) {
            totalRecipientsReport = recipientsReport.reduce(function (a, b) {
                return a + b["Total"];
            }, 0);
        }

        return (
            <Grid container dir={'ltr'} className={classes.carouselChart}>
                {recipientsReport && totalRecipientsReport > 0 ? renderArrows(carouselItem, 2, setCarouselItem, classes.carouselArrows) : null}
                {recipientsReport && totalRecipientsReport > 0 ? (
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
                    </Carousel>) : (
                    <ButtonWithTitle
                        innerStyle={{ minHeight: 210 }}
                        classes={classes}
                        title={t("common.createFirstGroup")}
                        buttonText={t("common.addRecipients")}
                        redirect={`/Pulseem/Groups.aspx?NewGroup=true&Culture=${isRTL ? 'he-IL' : 'en-US'}`}
                        buttonClass={classes.createButton} />
                )}

            </Grid>
        );
    };

    const renderCharts = () => {
        if (!recipientsReport) {
            return;
        }

        let totalRecipientsReport = 0;

        if (recipientsReport) {
            totalRecipientsReport = recipientsReport.reduce(function (a, b) {
                return a + b["Total"];
            }, 0);
        }

        return (
            <Grid item container justifyContent='space-evenly'>
                {recipientsReport && totalRecipientsReport > 0 ? recipientsReport.map((report, index) => {
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
                }) :
                    <ButtonWithTitle
                        innerStyle={{ minHeight: 210 }}
                        classes={classes}
                        title={t("common.createFirstGroup")}
                        buttonText={t("common.addRecipients")}
                        redirect={`/Pulseem/Groups.aspx?NewGroup=true&Culture=${isRTL ? 'he-IL' : 'en-US'}`}
                        buttonClass={classes.importButtonBlue} />
                }
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

    let totalRecipient = recipientsReport && recipientsReport.reduce(function (a, b) {
        return a + b["Total"];
    }, 0);

    return (
        <Paper elevation={3} className={classes.dashboardTopPaper}>
            <Grid container>
                <Grid item xs={12} className={classes.recipientTitleSection}>
                    <Box>
                        <Typography
                            className={clsx(classes.dInlineBlock, classes.dashboardTitle)}>
                            {t('dashboard.yourRecipients')}
                        </Typography>
                        {totalRecipient > 0 && <Tooltip
                            arrow
                            style={{ color: '#000' }}
                            title={t('dashboard.chartTooltip')}
                            classes={{
                                tooltip: clsx(classes.tooltipBlack, classes.tooltipPlacement),
                                arrow: classes.fBlack
                            }}
                            enterTouchDelay={50}
                            placement={"top"}>
                            <IconButton aria-label={t('dashboard.chartTooltip')}>
                                <BsInfoCircleFill />
                            </IconButton>
                        </Tooltip>
                        }
                    </Box>
                </Grid>
                {windowSize === 'xs' || windowSize === 'sm' ? renderChartsCarousel() : renderCharts()}
            </Grid>
        </Paper>
    );
}

export default React.memo(RecipientChart);
