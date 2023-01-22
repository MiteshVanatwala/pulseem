import clsx from 'clsx'
import 'moment/locale/he';
import moment from 'moment';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ClearIcon from '@material-ui/icons/Clear';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Loader } from '../../../../components/Loader/Loader';
import { exportFile } from '../../../../helpers/exportFromJson';
import { ClientStatus } from '../../../../helpers/PulseemArrays';
import { ExportFileTypes } from '../../../../model/Export/ExportFileTypes';
import { getInboundReport } from '../../../../redux/reducers/whatsappSlice';
import ConfirmRadioDialog from '../../../../components/DialogTemplates/ConfirmRadioDialog';
import { ExportIcon, SearchIcon } from '../../../../assets/images/managment/index';
import { TablePagination, DateField } from '../../../../components/managment/index';
import { preferredOrder, formatDateTime, emailStatusNumberToString, smsStatusNumberToString } from '../../../../helpers/exportHelper';
import { Link, Typography, Table, TableBody, TableRow, TableHead, TableCell, TableContainer, Grid, Button, TextField, Box } from '@material-ui/core'

const WhatsappInbound = ({ classes }) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const rowsOptions = [6, 10, 20, 50];
    const dateFormat = 'YYYY-MM-DD HH:mm:ss:FFF';
    const [dialog, setDialog] = useState(null);
    const [showLoader, setShowLoader] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [advanceSearch, setAdvanceSearch] = useState(false);
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
        FromNumber: null,
        ToNumber: null,
        MessageText: null,
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
    const exportColumnHeader = {
        "ClientID": t('client.ClientId'),
        "FirstName": t('smsReport.firstName'),
        "LastName": t('smsReport.lastName'),
        "Email": t('common.Email'),
        "Cellphone": t('common.cellphone'),
        "CreationDate": t('common.CreationDate'),
        "SmsStatus": t('common.smsStatus'),
        "Status": t('common.Status'),
        "ExtraField1": t('common.ExtraField1'),
        "ExtraField2": t('common.ExtraField2'),
        "ExtraField3": t('common.ExtraField3'),
        "ExtraField4": t('common.ExtraField4'),
        "ExtraField5": t('common.ExtraField5'),
        "ExtraField6": t('common.ExtraField6'),
        "ExtraField7": t('common.ExtraField7'),
        "ExtraField8": t('common.ExtraField8'),
        "ExtraField9": t('common.ExtraField9'),
        "ExtraField10": t('common.ExtraField10'),
        "ExtraField11": t('common.ExtraField11'),
        "ExtraField12": t('common.ExtraField12'),
        "ExtraField13": t('common.ExtraField13'),
        "ReplyDate": t('common.ReplyDate'),
        "ReplyText": t('common.ReplyText'),

    }

    const handleDownloadCsv = async (formatType) => {
        setDialog(null);
        setShowLoader(true);
        let orderList = preferredOrder(inboundWhatsappReport?.Data, Object.keys(exportColumnHeader));
        orderList = await emailStatusNumberToString(t, orderList, ClientStatus.Email);
        orderList = await smsStatusNumberToString(t, orderList, ClientStatus.Sms);
        orderList = await formatDateTime(orderList);
        exportFile({
            data: orderList,
            fileName: `ResponsesReport${id ? '_' + id : ''}`,
            exportType: formatType,
            fields: exportColumnHeader
        });
        setShowLoader(false)
    }

    const renderDateFields = () => {
        const handleFromDate = (val) => {
            if (val) {
                let dateVal = moment(val).startOf('day').format('YYYY-MM-DD HH:mm') || null;
                setSearchRequest({ ...searchRequest, FromDate: dateVal });
            }
        }

        const handleToDate = (val) => {
            if (val) {
                let dateVal = moment(val).endOf('day').format('YYYY-MM-DD HH:mm') || null;
                setSearchRequest({ ...searchRequest, ToDate: dateVal });
            }
        }

        return (
            <>
                <Grid item>
                    <DateField
                        classes={classes}
                        value={searchRequest.FromDate}
                        onChange={(v) => handleFromDate(v)}
                        placeholder={t('mms.locFromDateResource1.Text')}
                        rootStyle={classes.maxWidth190}
                        toolbarDisabled={false}
                        minDate={'2000-01-01'}
                        isRoundedOnMobile={windowSize === 'xs'}
                    />
                </Grid>
                <Grid item>
                    <DateField
                        classes={classes}
                        value={searchRequest.ToDate}
                        onChange={(v) => handleToDate(v)}
                        placeholder={t('mms.locToDateResource1.Text')}
                        minDate={searchRequest.FromDate ? searchRequest.FromDate : moment.now()}
                        toolbarDisabled={false}
                        rootStyle={classes.maxWidth190}
                        isRoundedOnMobile={windowSize === 'xs'}
                    />
                </Grid>
                {windowSize !== 'xs' && <Grid item>
                    <TextField
                        type="tel"
                        variant='outlined'
                        size='small'
                        value={searchRequest.FromNumber}
                        onChange={(e) => setSearchRequest({ ...searchRequest, FromNumber: e.target.value })}
                        className={clsx(classes.textField, classes.minWidth252)}
                        placeholder={t('common.FrmNumber')}
                    />
                </Grid>
                }
            </>
        )
    }
    const renderAdvanceSearch = () => {
        return (
            <>
                <Grid item>
                    <TextField
                        type="tel"
                        variant='outlined'
                        size='small'
                        value={searchRequest.FromNumber}
                        onChange={(e) => setSearchRequest({ ...searchRequest, FromNumber: e.target.value })}
                        className={clsx(classes.textField, classes.minWidth252)}
                        placeholder={t('common.FrmNumber')}
                    />
                </Grid>
                <Grid item>
                    <TextField
                        type="tel"
                        variant='outlined'
                        size='small'
                        value={searchRequest.ToNumber}
                        onChange={(e) => setSearchRequest({ ...searchRequest, ToNumber: e.target.value })}
                        className={clsx(classes.textField, classes.minWidth252)}
                        placeholder={t('common.ToNumber')}
                    />
                </Grid>
                <Grid item>
                    <DateField
                        classes={classes}
                        value={searchRequest.FromDate}
                        onChange={(e) => setSearchRequest({ ...searchRequest, FromDate: e.target.value })}
                        placeholder={t('mms.locFromDateResource1.Text')}
                        rootStyle={classes.maxWidth190}
                        toolbarDisabled={false}
                        minDate={'2000-01-01'}
                    />
                </Grid>
                <Grid item>
                    <DateField
                        classes={classes}
                        value={searchRequest.ToDate}
                        onChange={(e) => setSearchRequest({ ...searchRequest, ToDate: e.target.value })}
                        placeholder={t('mms.locToDateResource1.Text')}
                        minDate={searchRequest.FromDate ? searchRequest.FromDate : '2000-01-01'}
                        toolbarDisabled={false}
                        rootStyle={classes.maxWidth190}
                    />
                </Grid>
                <Grid item>
                    <TextField
                        variant='outlined'
                        size='small'
                        value={searchRequest.MessageText}
                        onChange={(e) => setSearchRequest({ ...searchRequest, MessageText: e.target.value })}
                        className={clsx(classes.textField, classes.minWidth252)}
                        placeholder={t('common.messageContent')}
                    />
                </Grid>
            </>
        )
    }
    const handleSearch = () => {
        setIsSearching(true);
        setPage(1);
        setRequest({ ...request, ...searchRequest });
    }
    const handleClearSearchForm = (e) => {
        e.preventDefault();
        setRequest(defaultRequest);
        setIsSearching(false);
    }
    const renderSearchLine = () => {
        return (
            <Grid container spacing={2} className={clsx(classes.lineTopMarging, classes.mb15)}>
                {advanceSearch ? renderAdvanceSearch() : renderDateFields()}
                <Grid item>
                    <Button
                        size='large'
                        variant='contained'
                        onClick={handleSearch}
                        className={classes.searchButton}
                        endIcon={<SearchIcon />}>
                        {t('campaigns.btnSearchResource1.Text')}
                    </Button>
                    {windowSize !== 'xs' && <Link
                        color='initial'
                        component='button'
                        underline='none'
                        onClick={() => setAdvanceSearch(!advanceSearch)}
                        className={clsx(classes.dBlock, classes.mt1, advanceSearch && windowSize === 'lg' ? classes.mb15 : null)}>
                        {t(!advanceSearch ? 'report.AdvanceSearch' : 'report.closeAdvanceSearch')}
                    </Link>
                    }
                </Grid>
                {isSearching && <Grid item>
                    <Button
                        size='large'
                        variant='contained'
                        onClick={(e) => {
                            handleClearSearchForm(e);
                        }}
                        className={classes.searchButton}
                        endIcon={<ClearIcon />}>
                        {t('common.clear')}
                    </Button>
                </Grid>
                }
            </Grid>
        )
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
        {renderSearchLine()}
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