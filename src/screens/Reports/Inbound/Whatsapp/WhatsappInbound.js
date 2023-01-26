import clsx from 'clsx'
import 'moment/locale/he';
import moment from 'moment';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Loader } from '../../../../components/Loader/Loader';
import { exportFile } from '../../../../helpers/exportFromJson';
import { ClientStatus } from '../../../../helpers/PulseemArrays';
import { ExportFileTypes } from '../../../../model/Export/ExportFileTypes';
import { getInboundReport } from '../../../../redux/reducers/whatsappSlice';
import ConfirmRadioDialog from '../../../../components/DialogTemplates/ConfirmRadioDialog';
import { ExportIcon } from '../../../../assets/images/managment/index';
import { TablePagination } from '../../../../components/managment/index';
import { preferredOrder, formatDateTime, emailStatusNumberToString, smsStatusNumberToString } from '../../../../helpers/exportHelper';
import { Typography, Table, TableBody, TableRow, TableHead, TableCell, TableContainer, Grid, Button, Box } from '@material-ui/core'
import SearchLine from '../SearchLine';

const WhatsappInbound = ({ classes }) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const rowsOptions = [6, 10, 20, 50];
    const dateFormat = 'YYYY-MM-DD HH:mm:ss:FFF';
    const [dialog, setDialog] = useState(null);
    const [showLoader, setShowLoader] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [rowsPerPage, setRowsPerPage] = useState(rowsOptions[0]);
    const { inboundWhatsappReport } = useSelector(state => state.whatsapp);
    const { accountFeatures, windowSize } = useSelector(state => state.core);

    const rowStyle = { head: classes.tableRowReportHead, root: clsx(classes.tableRowRoot) }
    const cellBodyStyle = { body: clsx(classes.tableCellBody), root: clsx(classes.tableCellRoot) }
    const cellStyle = { head: classes.tableCellHead, root: clsx(classes.tableCellRoot, classes.paddingHead) }
    const { id } = useParams();
    const defaultRequest = {
        FromDate: null,
        ToDate: null,
        FromNumber: '',
        ToNumber: '',
        MessageText: '',
        PageIndex: 1,
        PageSize: rowsPerPage,
        IsExport: false
    };
    const [request, setRequest] = useState(defaultRequest);
    const [searchRequest, setSearchRequest] = useState(defaultRequest)


    const getInboundData = async () => {
        await dispatch(getInboundReport({ ...request, PageSize: rowsPerPage, PageIndex: page }));
    }
    const getInboundDataById = async (id) => {
        console.log(id);
    }
    useEffect(() => {
        if (id && id > 0) {
            getInboundDataById(id);
        }
        else {
            getInboundData();
        }
        setShowLoader(false);
    }, [request, page, rowsPerPage]);

    useEffect(() => {
        if (!isSearching) {
            setSearchRequest(defaultRequest);
        }
    }, [isSearching]);


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
        let orderList = preferredOrder(response?.payload?.Data, Object.keys(exportColumnHeader));
        orderList = await formatDateTime(orderList);
        exportFile({
            data: orderList,
            fileName: `ResponsesReport${id ? '_' + id : ''}`,
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
                        {`${inboundWhatsappReport?.Message} ${t('common.Clients')}`}
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
                {rowData
                    .map(windowSize === 'xs' ? renderPhoneRow : renderRow)}
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
        return <></>
    }

    const handlePageChange = (val) => {
        setRowsPerPage(val);
        setRequest({ ...request, PageSize: val });
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
    return <Box>
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
            defaultValue="xls"
            options={ExportFileTypes}
        />
        <Loader isOpen={showLoader} showBackdrop={true} />
    </Box>
}

export default WhatsappInbound;