import React, { useState, useEffect, useRef } from 'react';
import DefaultScreen from '../../DefaultScreen';
import clsx from 'clsx';
import {
    Typography, Divider, Table, TableBody, TableRow, TableHead, TableCell, TableContainer, Grid, Button, TextField, Box
} from '@material-ui/core'
import Switch from "react-switch";
import {
    SearchIcon, ExportIcon
} from '../../../assets/images/managment/index'
import {
    TablePagination, DateField, SearchField
} from '../../../components/managment/index'
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import ClearIcon from '@material-ui/icons/Clear';
import moment from 'moment';
import 'moment/locale/he';
import { CSVLink } from 'react-csv'
import { getMmsReport, getMmsGraph } from '../../../redux/reducers/mmsSlice';
import { Loader } from '../../../components/Loader/Loader';
import { exportFile } from '../../../helpers/exportFromJson';
import { MMSReportStatus } from '../../../helpers/PulseemArrays';
import { preferredOrder, statusNumberToString, formatDateTime, booleanToNumber, setTotalSent } from '../../../helpers/exportHelper';
import GraphReport from '../../../components/Reports/GraphReport';
import NameValueGridStructure from '../../../components/Grids/NameValueGridStructure';
import { setRowsPerPage } from '../../../redux/reducers/coreSlice';
import { setCookie } from '../../../helpers/cookies';
import DataTable from '../../../components/Table/DataTable';
import CustomTooltip from '../../../components/Tooltip/CustomTooltip';

const DEFAULT_FILTER = {
    fromDate: null,
    toDate: null,
    campaignName: ''
}

const MmsReport = ({ classes }) => {
    const { language, windowSize, isRTL, rowsPerPage } = useSelector(state => state.core)
    const { mmsReport, mmsGraph } = useSelector(state => state.mms)
    const { t } = useTranslation()
    const [filterValues, setFilterValues] = useState(DEFAULT_FILTER)
    const [filter, setFilter] = useState(false);
    const [page, setPage] = useState(1)

    const [filteredResults, setFilteredResults] = useState([])
    const [isDemoSend, setIsDemoSend] = useState(false)
    const [csvData, setCsvData] = useState('')
    const dateFormat = 'YYYY-MM-DD HH:mm:ss.FFF'
    const dispatch = useDispatch()
    const rowStyle = { head: classes.tableRowReportHead, root: clsx(classes.tableRowRoot, classes.maxHeight87) }
    const cellStyle = { head: classes.tableCellHead, root: clsx(classes.tableCellRoot, classes.paddingHead) }
    const cell50wStyle = { head: clsx(classes.tableCellHead), root: clsx(classes.tableCellRoot, classes.paddingHead, classes.minWidth50) }
    const cellBodyStyle = { body: clsx(classes.tableCellBody), root: clsx(classes.tableCellRoot) }
    const noBorderCellStyle = { body: classes.tableCellBodyNoBorder, root: clsx(classes.tableCellRoot, classes.minWidth50) }
    const borderCellStyle = { body: clsx(classes.tableCellBody), root: clsx(classes.tableCellRoot, classes.minWidth50) }
    const csvLinkRef = useRef(null)
    const [showLoader, setLoader] = useState(true);

    moment.locale(language)

    const TABLE_HEAD = [
        { label: t("common.CampaignName"), classes: cell50wStyle, className: classes.flex2, align: 'center' },
        { label: t("common.Status"), classes: cell50wStyle, className: classes.flex1, align: 'center' },
        { label: t('mmsreport.amount'), classes: cell50wStyle, className: classes.flex2, align: 'center' },
        { label: t('mmsreport.sent'), classes: cell50wStyle, className: classes.flex1, align: 'center' },
        { label: '', classes: cell50wStyle, className: classes.flex2, align: 'center' },
        { label: t('mmsreport.credits'), classes: cell50wStyle, className: classes.flex2, align: 'center' },
    ]

    useEffect(() => {
        const getMmsData = async () => {
            setLoader(true);
            await dispatch(getMmsReport(isDemoSend));
            setLoader(false);
            await dispatch(getMmsGraph());
        }
        getMmsData();
    }, [isDemoSend]);

    useEffect(() => {
        handleSearch(filterValues);
    }, [mmsReport])




    //  HANDLERS  //
    const getHrefs = (id) => ({
        TotalSendTo: {
            title: t('mmsreport.amountToSend'),
            href: `/Pulseem/ClientSearchResult.aspx?MmsCountCampaignID=${id}&Culture=${isRTL ? 'he-IL' : 'en-US'}`
        },
        TotalSent: {
            title: t('common.Total'),
            href: `/Pulseem/ClientSearchResult.aspx?MmsCountCampaignID=${id}&Status=3&fromreact=true&Culture=${isRTL ? 'he-IL' : 'en-US'}`
        },
        FutureSends: {
            title: t('mmsreport.futureSends'),
            href: ''
        },
        Failed: {
            title: windowSize === 'xs' ? '' : t("common.failedStatus"),
            href: `/Pulseem/ClientSearchResult.aspx?MmsCountCampaignID=${id}&Status=4&Culture=${isRTL ? 'he-IL' : 'en-US'}`
        },
        Removed: {
            title: windowSize === 'xs' ? '' : t('mmsreport.removal'),
            href: `/Pulseem/ClientSearchResult.aspx?MmsCountCampaignID=${id}&Status=5&Culture=${isRTL ? 'he-IL' : 'en-US'}`
        },
        CreditsPerMms: {
            title: t('mmsreport.creditsPerMms'),
            href: ''
        },
        TotalCredits: {
            title: t('mmsreport.totalCreditsSent'),
            href: ''
        }
    })

    const exportColumnHeader = {
        "MmsCampaignID": t('mainReport.CampaignID'),
        "Status": t('common.Status'),
        "Name": t('common.CampaignName'),
        "UpdateDate": t("common.UpdateDate"),
        "SendDate": t('common.SendDate'),
        "CreditsPerMms": t('mmsreport.postCredits'),
        "Failure": t('common.failedStatus'),
        "Removed": t('common.Removed'),
        // "TotalCredits": t('mmsreport.totalCreditsSent'),
        "TotalSent": t('mmsreport.sent'),
        "FutureSends": t('mmsreport.futureSends'),
        "Amount": t('mmsreport.amount'),
    }

    const handleDownloadCsv = async () => {
        let orderList = preferredOrder(filteredResults, Object.keys(exportColumnHeader));
        orderList = await statusNumberToString(t, orderList, MMSReportStatus);
        orderList = await formatDateTime(orderList, t);
        orderList = await booleanToNumber(orderList, 'IsResponse', true, t);
        orderList = orderList.reduce(
            (previousValue, currentValue) => {
                currentValue.Amount = currentValue.TotalSent + currentValue.FutureSends
                return [...previousValue, currentValue]
            },
            []
        );
        console.log("OrderLIST: ", orderList)
        exportFile({
            data: orderList,
            fileName: 'mmsReport',
            exportType: 'csv',
            fields: exportColumnHeader
        });
    }

    const colorTextStyle = {
        red: classes.textColorRed,
        blue: classes.textColorBlue,
        green: classes.sendIconText
    }

    const handleRowsPerPageSearching = (val) => {
        dispatch(setRowsPerPage(val))
        setCookie('rpp', val, { maxAge: 2147483647 })
    }
    const handlePageChange = (val) => {
        setPage(val);
    }

    const handleSearch = (values) => {
        const rowData = mmsReport;
        const filteredReports =
            rowData.filter((obj) => {
                if (
                    (values.campaignName ? obj.Name.toLowerCase().includes(values.campaignName.toLowerCase()) : obj)
                ) {
                    return true
                }
                return false
            }).filter(obj => {
                const lastUpdated = new Date(obj.SendDate || obj.UpdateDate)
                const fromDate = values.fromDate;
                const toDate = values.toDate ?? new Date();
                if (lastUpdated < toDate && lastUpdated > fromDate) {
                    return true;
                }
                return false;
            })
        setFilteredResults(filteredReports)
        setPage(1);
    }

    //  COMPONENTS  //
    const renderFilter = () => {
        if (windowSize === 'xs') {
            return (
                <SearchField
                    classes={classes}
                    value={filterValues.campaignName}
                    onChange={(e) => setFilterValues({
                        ...filterValues,
                        campaignName: e.target.value
                    })}
                    onClick={() => handleSearch()}
                    placeholder={t('common.CampaignName')}
                />
            )
        }

        return (
            <Grid
                container
                spacing={2}
                className={classes.lineTopMarging}>
                <Grid item>
                    <TextField
                        variant='outlined'
                        size='small'
                        value={filterValues.campaignName}
                        // onKeyPress={handleKeyPress}
                        onChange={(e) => setFilterValues({
                            ...filterValues,
                            campaignName: e.target.value
                        })}
                        className={clsx(classes.textField, classes.minWidth252)}
                        placeholder={t('common.CampaignName')}
                    />
                </Grid>

                {windowSize !== 'xs' ?
                    <Grid item>
                        <DateField
                            classes={classes}
                            value={filterValues.fromDate}
                            onChange={(value) => setFilterValues({
                                ...filterValues,
                                fromDate: filterValues.toDate ? (value < filterValues.toDate ? value : null) : value
                            })}
                            placeholder={t('mms.locFromDateResource1.Text')}
                            maxDate={filterValues.toDate ? filterValues.toDate : undefined}
                        />
                    </Grid>
                    : null}

                {windowSize !== 'xs' ?
                    <Grid item>
                        <DateField
                            classes={classes}
                            value={filterValues.toDate}
                            onChange={(value) => {
                                setFilterValues({
                                    ...filterValues,
                                    toDate: value > filterValues.fromDate ? value : filterValues.fromDate
                                })
                            }}
                            placeholder={t('mms.locToDateResource1.Text')}
                            minDate={filterValues.fromDate ? filterValues.fromDate : undefined}
                        />
                    </Grid>
                    : null}

                <Grid item style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Switch
                        checked={isDemoSend}
                        onColor="#0371ad"
                        //onHandleColor="#e6f6ff"
                        handleDiameter={20}
                        uncheckedIcon={false}
                        checkedIcon={false}
                        boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                        activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                        height={15}
                        width={40}
                        className={clsx({ [classes.rtlSwitch]: isRTL })}
                        onChange={() => { setIsDemoSend(!isDemoSend) }}
                    />
                    <Typography style={{ marginInlineStart: 8 }}>
                        {t('mainReport.locShowTestCampaigns.Text')}
                    </Typography>
                </Grid>
                <Grid item>
                    <Button
                        size='large'
                        variant='contained'
                        onClick={() => {
                            handleSearch(filterValues)
                            setFilter(true);
                        }}
                        className={classes.searchButton}
                        endIcon={<SearchIcon />}
                    >
                        {t('notifications.buttons.search')}
                    </Button>
                </Grid>
                {
                    (filterValues.campaignName || filterValues.fromDate || filterValues.toDate) && <Grid item>
                        <Button
                            size='large'
                            variant='contained'
                            onClick={() => {
                                setFilterValues(DEFAULT_FILTER)
                                if (filter) {
                                    handleSearch(DEFAULT_FILTER)
                                    setFilter(false);
                                }
                            }}
                            className={classes.searchButton}
                            endIcon={<ClearIcon />}>
                            {t('common.clear')}
                        </Button>
                    </Grid>
                }
            </Grid >
        )
    }

    const renderManagmentLine = () => {
        const dataLength = filteredResults.length;
        return (
            <Grid container spacing={2} className={classes.linePadding} >
                {windowSize !== 'xs' && <Grid item>
                    <Button
                        variant='contained'
                        size='medium'
                        className={clsx(
                            classes.actionButton,
                            classes.actionButtonGreen,
                            mmsReport.length > 0 ? null : classes.disabled
                        )}
                        onClick={() => handleDownloadCsv()}
                        startIcon={<ExportIcon />}
                    >

                        {t('campaigns.exportFile')}
                    </Button>
                    <CSVLink
                        data={csvData}
                        filename='report.csv'
                        className='hidden'
                        ref={csvLinkRef}
                        target='_blank'
                    />
                </Grid>}
                <Grid item className={classes.groupsLableContainer} >
                    <Typography className={classes.groupsLable}>
                        {`${dataLength} ${t('mms.campaigns')}`}
                    </Typography>
                </Grid>
            </Grid>
        )
    }

    const renderNameCell = (row, fullwidth) => {
        const { Name, SendDate, UpdateDate, Status } = row

        const date = SendDate ? moment(SendDate) : ''
        const udate = UpdateDate ? moment(UpdateDate) : '';
        const showDate = SendDate ? date.format('L') : ''
        const showTime = SendDate ? date.format('LT') : ''
        const isSchedule = moment(SendDate) > moment();
        const showUpdateDate = UpdateDate ? udate.format('L') : '';
        const showTimeUpdate = UpdateDate ? udate.format('LT') : '';

        return (
            <>
                <CustomTooltip
                    isSimpleTooltip={false}
                    interactive={true}
                    classes={{
                        tooltip: clsx(classes.tooltipBlack, classes.tooltipPlacement),
                        arrow: classes.fBlack
                    }}
                    arrow={true}
                    style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}
                    placement={'top'}
                    title={<Typography noWrap={false} align="center">{Name}</Typography>}
                    text={Name}
                    textAlign={'center'}

                >
                    {
                        fullwidth ? <Typography className={classes.nameEllipsis} style={{ maxWidth: "100%" }}>
                            {Name}
                        </Typography> :
                            <Typography className={classes.nameEllipsis} >
                                {Name}
                            </Typography>

                    }
                </CustomTooltip>
                {Status === 5 ? <Typography className={clsx(classes.dInlineBlock, classes.f14, classes.red)}>({t("campaigns.Canceled")})</Typography> : null}
                {SendDate !== null ?
                    (
                        <Typography className={classes.grayTextCell}>
                            {isSchedule ? t("common.ScheduledFor") : t("common.SentOn")} {`${isRTL ? showDate : moment(showDate).format("DD/MM/YYYY")} ${showTime}`}
                        </Typography>
                    ) :
                    (
                        <Typography className={classes.grayTextCell}>
                            {t("common.UpdatedOn")} {`${isRTL ? showUpdateDate : moment(showUpdateDate).format("DD/MM/YYYY")} ${showTimeUpdate}`}
                        </Typography>
                    )
                }

            </>
        )

        // return <>
        //     <Typography fullWidth className={clsx(classes.nameEllipsis, classes.fullWidth)} align={align} variant="body1">
        //         {name}
        //     </Typography>
        //     <Typography className={classes.grayTextCell} align={align} variant="body1">
        //         {date && (moment(date).format('LLL') ?? '')}
        //     </Typography>
        // </>
    }

    const renderIntData = (value, type, data = {}, clickable = true) => {
        const { title = windowSize === 'xs' ? '' : t("notifications.tblBody.total"), href = '' } = data
        const innerRef = clickable ? href : '';
        return (
            <Box style={{ display: 'flex', flexDirection: 'column' }} >
                <Typography component={innerRef && value > 0 ? 'a' : 'p'}
                    href={innerRef}
                    className={clsx(classes.middleText, colorTextStyle[type] || '')}
                    target="_blank">
                    {value && value.toLocaleString() || '0'}
                </Typography>
                <Typography className={clsx(classes.middleWrapText, colorTextStyle[type])}>
                    {title}
                </Typography>
            </Box>
        )

    }

    const renderStatusCell = (status) => {
        const statuses = {
            1: 'common.Created',
            2: 'common.Sending',
            3: 'campaigns.Stopped',
            4: 'common.Sent',
            5: 'campaigns.Canceled',
            6: 'campaigns.Optin',
            7: 'campaigns.Approve'
        }
        return (
            <>
                <Typography className={clsx(
                    classes.middleText,
                    classes.recipientsStatus,
                    {
                        [classes.recipientsStatusCreated]: status === 1,
                        [classes.recipientsStatusSent]: status === 4,
                        [classes.recipientsStatusSending]: status === 2,
                        [classes.recipientsStatusCanceled]: status === 5
                    }
                )}>
                    {t(statuses[status])}
                </Typography>
            </>
        )
    }

    const renderRow = (row) => {
        const {
            MmsCampaignID,
            Name,
            Removed,
            Status,
            TotalCredits,
            TotalSent,
            SendDate,
            UpdateDate,
            Success,
            FutureSends,
            TotalSendPlan,
            Failure,
            CreditsPerMms
        } = row
        const hrefs = getHrefs(MmsCampaignID)
        return (
            <TableRow
                key={MmsCampaignID}
                classes={rowStyle}>
                <TableCell
                    classes={cellBodyStyle}
                    align='center'
                    className={clsx(classes.flex2)}>
                    {renderNameCell(row)}
                </TableCell>
                <TableCell
                    classes={borderCellStyle}
                    align='center'
                    className={classes.flex1}>
                    {renderStatusCell(Status)}
                </TableCell>
                <TableCell
                    classes={borderCellStyle}
                    align='center'
                    className={classes.flex2}>
                    <Grid container direction={'row'} className={classes.justifyEvenly}>
                        <Grid item className={classes.plr10}>
                            {renderIntData(TotalSent, '', hrefs.TotalSendTo)}
                        </Grid>
                        <Grid item className={classes.plr10}>
                            {renderIntData(FutureSends, '', hrefs.FutureSends)}
                        </Grid>
                    </Grid>
                </TableCell>
                <TableCell
                    classes={borderCellStyle}
                    align='center'
                    className={classes.flex1}>
                    {renderIntData(Success, '', hrefs.TotalSent)}
                </TableCell>
                <TableCell
                    classes={borderCellStyle}
                    align='center'
                    className={classes.flex2}>
                    <Grid container direction={'row'} className={classes.justifyEvenly}>
                        <Grid item className={classes.plr10}>
                            {renderIntData(Failure, 'red', hrefs.Failed)}
                        </Grid>
                        <Grid item className={classes.plr10}>
                            {renderIntData(Removed, 'red', hrefs.Removed)}
                        </Grid>
                    </Grid>
                </TableCell>
                <TableCell
                    classes={noBorderCellStyle}
                    align='center'
                    className={classes.flex2}>
                    <Grid container direction={'row'} className={classes.justifyEvenly}>
                        <Grid item className={classes.plr10}>
                            {renderIntData(CreditsPerMms, '', hrefs.CreditsPerMms)}
                        </Grid>
                        <Grid item className={classes.plr10}>
                            {renderIntData(TotalCredits, '', hrefs.TotalCredits)}
                        </Grid>
                    </Grid>
                </TableCell>
            </TableRow>
        )
    }

    const renderPhoneRow = (row) => {
        const {
            MmsCampaignID,
            Name,
            Removed,
            Status,
            TotalCredits,
            TotalSent,
            SendDate,
            UpdateDate,
            FutureSends,
            TotalSendPlan,
            Failure,
            CreditsPerMms
        } = row
        const hrefs = getHrefs(MmsCampaignID)
        return (
            <TableRow
                key={row.ID}
                component='div'
                classes={rowStyle}>
                <TableCell classes={{ root: clsx(classes.tableCellRoot, classes.flex1, classes.tabelCellPadding) }}>
                    <Box className={classes.inlineGrid} style={{ paddingInlineStart: 10 }}>
                        {renderNameCell({ MmsCampaignID, Name, SendDate, UpdateDate, Status }, true)}
                    </Box>

                    <Grid container spacing={2} style={{ paddingInlineStart: 10 }}>
                        <Grid item xs={6}>
                            <Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
                                {t("mmsreport.creditsPerMms")}
                            </Typography>
                            {renderIntData(CreditsPerMms, '', { ...hrefs.CreditsPerMms, title: '' }, false)}
                        </Grid>
                        <Grid item xs={6}>
                            <Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
                                {t("mmsreport.totalCreditsSent")}
                            </Typography>
                            {renderIntData(TotalCredits, '', { ...hrefs.TotalCredits, title: '' }, false)}
                        </Grid>
                    </Grid>
                    <Grid container spacing={2} style={{ paddingInlineStart: 10 }} >
                        <Grid item xs={4}>
                            <Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
                                {t("common.Sent")}
                            </Typography>
                            {renderIntData(TotalSent, '', {}, false)}
                        </Grid>
                        <Grid item xs={4}>
                            <Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
                                {t("common.failedStatus")}
                            </Typography>
                            {renderIntData(Failure, 'red', hrefs.Failed, false)}
                        </Grid>
                        <Grid item xs={4}>
                            <Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
                                {t("common.Removed")}
                            </Typography>
                            {renderIntData(Removed, 'red', hrefs.Removed, false)}
                        </Grid>
                    </Grid>

                </TableCell>
            </TableRow>
        )
    }

    const renderTableBody = () => {
        let rowData = filteredResults;

        if (rowData.length > 0) {
            let rpp = parseInt(rowsPerPage)
            rowData = rowData.slice((page - 1) * rpp, (page - 1) * rpp + rpp)

            return (
                <TableBody>
                    {rowData
                        .map(windowSize === 'xs' ? renderPhoneRow : renderRow)}
                </TableBody>
            )
        }
        return <Typography className={classes.flexCenter}>{t("common.NoData")}</Typography>
    }


    return (
        <DefaultScreen
            classes={classes}
            containerClass={classes.management}
            currentPage="reports"
            subPage="MmsReport">
            <Typography className={classes.managementTitle}>
                {t('common.MMSReports')}
            </Typography>
            <Divider />
            {renderFilter()}
            {renderManagmentLine()}
            <DataTable
                tableContainer={{ className: classes.tableStyle }}
                table={{ className: classes.tableContainer }}
                tableHead={{ tableHeadCells: TABLE_HEAD, classes: rowStyle, className: windowSize === 'xs' && classes.dNone }}
            >
                {renderTableBody()}
            </DataTable>
            <TablePagination
                classes={classes}
                rows={filteredResults?.length ?? 0}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleRowsPerPageSearching}
                rowsPerPageOptions={[6, 10, 20, 50]}
                page={page}
                onPageChange={handlePageChange}
            />
            <GraphReport classes={classes} showLoader={!mmsGraph || mmsGraph.length <= 0} reportData={mmsGraph} />
            <Loader isOpen={showLoader} showBackdrop={true} />
        </DefaultScreen>
    )
};



export default MmsReport;
