import clsx from 'clsx'
import 'moment/locale/he';
import moment from 'moment';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Loader } from '../../../../components/Loader/Loader';
import { ExportFileTypes } from '../../../../model/Export/ExportFileTypes';
import { getInboundReport } from '../../../../redux/reducers/whatsappSlice';
import ConfirmRadioDialog from '../../../../components/DialogTemplates/ConfirmRadioDialog';
import { ExportIcon } from '../../../../assets/images/managment/index';
import { TablePagination } from '../../../../components/managment/index';
import { Typography, Table, TableBody, TableRow, TableHead, TableCell, TableContainer, Grid, Button, Box } from '@material-ui/core'
import SearchLine from '../SearchLine';
import { RenderHtml } from '../../../../helpers/Utils/HtmlUtils';
import { ImWhatsapp } from 'react-icons/im';
import { ExportFile } from '../../../../helpers/Export/ExportFile';
import { HandleExportData } from '../../../../helpers/Export/ExportHelper';
import { setRowsPerPage } from '../../../../redux/reducers/coreSlice';

const WhatsappInbound = ({ classes }) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const rowsOptions = [6, 10, 20, 50];
    const dateFormat = 'YYYY-MM-DD HH:mm:ss:FFF';
    const [dialog, setDialog] = useState(null);
    const [showLoader, setShowLoader] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const { inboundWhatsappReport } = useSelector(state => state.whatsapp);
    const { windowSize, rowsPerPage } = useSelector(state => state.core);
    const { accountFeatures } = useSelector(state => state.common);

    const rowStyle = { head: classes.tableRowReportHead, root: clsx(classes.tableRowRoot) }
    const cellBodyStyle = { body: clsx(classes.tableCellBody), root: clsx(classes.tableCellRoot) }
    const cellStyle = { head: classes.tableCellHead, root: clsx(classes.tableCellRoot, classes.paddingHead) }
    const { id } = useParams();
    const defaultRequest = {
        FromDate: moment().subtract(30, 'days').utcOffset(0).format('YYYY-MM-DD HH:mm').toString(),
        ToDate: moment({ hour: 23, minute: 59, second: 59 }).format('YYYY-MM-DD HH:mm').toString(),
        FromNumber: '',
        ToNumber: '',
        TextMessage: '',
        PageIndex: 1,
        PageSize: rowsPerPage,
        IsExport: false
    };
    const [request, setRequest] = useState(defaultRequest);

    const getInboundData = async () => {
        setShowLoader(true);
        await dispatch(getInboundReport({ ...request, PageSize: rowsPerPage, PageIndex: page }));
        setShowLoader(false);
    }
    const getInboundDataById = async (id) => {
        setShowLoader(true);
        console.log(id);
        setShowLoader(false);
    }
    useEffect(() => {
        if (id && id > 0) {
            getInboundDataById(id);
        }
        else {
            getInboundData();
        }
    }, [request, page, rowsPerPage]);

    const renderHeader = () => {
        return (
            <>
                {/* <Divider /> */}
                <Grid container spacing={2} className={classes.linePadding} >
                    {accountFeatures?.indexOf('13') === -1 && windowSize !== 'xs' && <Grid item>
                        <Button
                            variant='contained'
                            size='medium'
                            className={clsx(
                                classes.actionButton,
                                classes.actionButtonGreen,
                                inboundWhatsappReport && inboundWhatsappReport?.Data?.length > 0 ? null : classes.disabled
                            )}
                            onClick={() => setDialog('exportFormat')}
                            startIcon={<ExportIcon />}>
                            {t('campaigns.exportFile')}
                        </Button>
                    </Grid>}
                </Grid>
            </>
        )
    }
    //TODO: add from / to number
    const exportColumnHeader = {
        "SendDate": t('common.ReplyDate'),
        "FromNumber": t('common.FrmNumber'),
        "ToNumber": t('common.ToNumber'),
        "TextMessage": t('common.messageContent')
    }

    const handleDownloadCsv = async (formatType) => {
        setDialog(null);
        setShowLoader(true);
        request.IsExport = true;
        const response = await dispatch(getInboundReport(request));
        let orderList = response?.payload?.Data;

        const exportOptions = {
            OrderItems: true,
            FormatDate: true,
            ReplaceNull: true,
            Order: Object.keys(exportColumnHeader)
        };

        const result = await HandleExportData(orderList, exportOptions);

        ExportFile({
            data: result,
            fileName: `Whatsapp_InboundReport`,
            exportType: formatType,
            fields: exportColumnHeader
        });
        setShowLoader(false)
    }

    const renderTable = () => {
        return (
            <>
                <Grid item className={clsx(classes.groupsLableContainer, classes.mb15)} >
                    <Typography className={classes.groupsLable}>
                        {`${inboundWhatsappReport?.Message} ${t('master.responses')}`}
                    </Typography>
                </Grid>
                <TableContainer className={classes.tableStyle}>
                    <Table className={classes.tableContainer}>
                        {windowSize !== 'xs' && renderTableHead()}
                        {renderTableBody()}
                    </Table>
                </TableContainer>
            </>
        )
    }
    const renderTableHead = () => {
        return (
            <TableHead>
                <TableRow classes={rowStyle}>
                    <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t("common.ReplyDate")}</TableCell>
                    <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t('common.SentFromNumber')}</TableCell>
                    <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t('common.SendTo2')}</TableCell>
                    <TableCell classes={cellStyle} className={classes.flex5} align='center' >{t("common.messageContent")}</TableCell>
                </TableRow>
            </TableHead>
        )
    }
    const renderTableBody = () => {
        let rowData = inboundWhatsappReport?.Data;

        if (!rowData || rowData?.length === 0) {
            return <Box className={clsx(classes.flex, classes.justifyCenterOfCenter)} style={{ height: 50 }}>
                <Typography>{t("common.NoDataTryFilter")}</Typography>
            </Box>
        }

        return (
            <TableBody>
                {rowData.map(windowSize === 'xs' ? renderPhoneRow : renderRow)}
            </TableBody>
        )
    }

    const renderRow = (row, index) => {
        const {
            Id,
            SendDate,
            FromNumber,
            ToNumber,
            TextMessage
        } = row;

        let reply = moment(SendDate, dateFormat);
        return (
            <TableRow
                key={Id}
                classes={rowStyle}>
                <TableCell
                    classes={cellBodyStyle}
                    align='center'
                    className={classes.flex2}>
                    {reply.format('DD/MM/YYYY')} {reply.format('HH:mm:ss')}
                </TableCell>
                <TableCell
                    classes={cellBodyStyle}
                    align='center'
                    className={classes.flex2}>
                    <Typography>{FromNumber}</Typography>
                </TableCell>
                <TableCell
                    classes={cellBodyStyle}
                    align='center'
                    className={classes.flex2}>
                    <Typography>{ToNumber}</Typography>
                </TableCell>
                <TableCell
                    classes={{ root: classes.tableCellRoot }}
                    align='center'
                    className={classes.flex5}>
                    {TextMessage}
                </TableCell>
            </TableRow >
        )
    }

    const renderPhoneRow = (row) => {
        const {
            Id,
            SendDate,
            FromNumber,
            ToNumber,
            TextMessage
        } = row;

        let reply = moment(SendDate, dateFormat);
        return (
            <TableRow
                key={Id}
                classes={rowStyle}>
                <TableCell
                    style={{ flex: 2 }}
                    classes={{ root: classes.tableCellRoot }}
                    className={classes.p20}
                >
                    <Box className={classes.ml10}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
                                    {t("common.ReplyDate")}
                                </Typography>
                                <Typography component={'p'} className={clsx(classes.middleTxt)}>{reply.format('DD/MM/YYYY')} {reply.format('HH:mm:ss')}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Box className={classes.cellText}>
                                    <Typography className={clsx(classes.mobileReportHead, classes.ml0)}>{t('common.SentFromNumber')}</Typography>
                                    <Typography component={'p'}
                                        className={clsx(classes.middleTxt)}>
                                        {FromNumber}
                                    </Typography>
                                </Box>
                                <Box className={classes.cellText}>
                                    <Typography className={clsx(classes.mobileReportHead, classes.ml0)}>{t('common.SendTo2')}</Typography>
                                    <Typography component={'p'}
                                        className={clsx(classes.middleTxt)}>
                                        {ToNumber}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography className={clsx(classes.mobileReportHead, classes.ml0)}>{t('common.messageContent')}</Typography>
                                <Typography className={clsx(classes.ml0)}>
                                    {TextMessage}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                </TableCell>
            </TableRow>
        )
    }

    const handlePageChange = (val) => {
        dispatch(setRowsPerPage(val))
    }

    const renderTablePagination = () => {
        return (
            <TablePagination
                classes={classes}
                rows={inboundWhatsappReport?.Message}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handlePageChange}
                rowsPerPageOptions={rowsOptions}
                page={page}
                onPageChange={setPage}
            />
        )
    }
    return <>
        {inboundWhatsappReport?.StatusCode === 201 ?
            (<Box>
                {renderHeader()}
                <SearchLine
                    classes={classes}
                    onSetPage={(val) => setPage(val)}
                    onFilterRequest={(val) => setRequest(val)}
                    onSetIsSearching={(val) => setIsSearching(val)}
                />
                {renderTable()}
                {renderTablePagination()}
                <ConfirmRadioDialog
                    classes={classes}
                    isOpen={dialog === 'exportFormat'}
                    title={t('campaigns.exportFile')}
                    radioTitle={t('common.SelectFormat')}
                    onConfirm={(e) => handleDownloadCsv(e)}
                    onCancel={() => setDialog(null)}
                    cookieName={'exportFormat'}
                    defaultValue="xlsx"
                    options={ExportFileTypes}
                />
                <Loader isOpen={showLoader} showBackdrop={true} />
            </Box>) : <>
                <Box className={classes.flexCenterOfCenter} style={{ marginTop: 25 }}>
                    <Typography style={{ fontSize: 30 }}>{RenderHtml(t('common.whatsappCommingSoon'))}</Typography>
                    <ImWhatsapp style={{ color: '#25D366', fontSize: 40, marginTop: 15 }} />
                </Box>
            </>}
    </>
}

export default WhatsappInbound;