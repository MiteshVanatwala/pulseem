import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import {
    Box, Button, Grid, Table, TableContainer,
    TableCell, Link, FormControl, MenuItem,
    TableHead, TableRow, TextField, Typography, TableBody
} from '@material-ui/core';
import Select from '@mui/material/Select';
import {
    TablePagination, DateField, ManagmentIcon
} from '../../../components/managment/index';
import { PreviewIcon, SearchIcon } from '../../../assets/images/managment';
import ClearIcon from '@material-ui/icons/Clear';
import moment from 'moment';
import { getDirectReport } from '../../../redux/reducers/whatsappSlice';
import { Loader } from '../../../components/Loader/Loader';
import { WhatsappStatus } from '../../../helpers/Constants';
import { setRowsPerPage } from '../../../redux/reducers/coreSlice';
import CustomTooltip from "../../../components/Tooltip/CustomTooltip";
import { ConvertColorStatus, ConvertWhatsappStatusText, SourceType } from '../../../helpers/UI/TableText';
import { IoIosArrowDown } from 'react-icons/io';
import { Title } from '../../../components/managment/Title';
import { WhatsappTemplatePreview } from '../../../components/WhatsappTemplatePreview/WhatsappTemplatePreview';
import TotalSection from '../../../components/managment/TotalSection';
import { useSelector } from 'react-redux';

const DirectWhatsappReportTab = ({
    classes,
    title,
    dispatch,
    windowSize,
    isRTL,
    handleSearchInput = () => null,
    handleSearching = () => null,
    handlePageChange = () => null,
    handleAdvanceSearch = () => null,
    clearSearch,
    rowsPerPage,
    searchData,
    isSearching,
    directWhatsappReport,
    advanceSearch,
    rowsOptions
}) => {
    const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot };
    const cellStyle = { head: classes.tableCellHead, body: classes.tableCellBody, root: classes.tableCellRoot };
    const noborderCell = { body: clsx(classes.tableCellBody, classes.noborder), root: classes.tableCellRoot };
    const { currencySymbol, isCurrencySymbolPrefix } = useSelector((state) => state.common);
    const { t } = useTranslation();
    const [showLoader, setLoader] = useState(false)
    const [page, setPage] = useState(1);
    const [openTemplatePreview, setTemplatePreview] = useState(false);
    const [templateID, setTemplateID] = useState(null);

    const handleSearch = async () => {
        setLoader(true);
        const { whatsapp = {} } = searchData || {};
        const { FromNumber = '', ToNumber = '', ExternalRef = '', Status = '', FromDate = null, ToDate = null, ResponseType = null, Text = null, ShowContent = false } = whatsapp || {};
        const param = {
            FromDate,
            ToDate,
            Status,
            FromNumber,
            ToNumber,
            ExternalRef,
            ResponseType,
            PageIndex: page,
            PageSize: rowsPerPage,
            Text
        }
        let searchObjects = {};
        Object.keys(param).map(item => {
            if (param[item]) {
                searchObjects[item] = param[item];
            }
        })

        await dispatch(getDirectReport(searchObjects))
        handleSearching('whatsapp', true);
        setLoader(false);
    }

    const searchRequest = async (pageSize, pageIndex) => {
        setLoader(true);
        let { whatsapp = {} } = searchData || {};
        let params = {
            PageSize: pageSize,
            PageIndex: pageIndex,
            ...whatsapp
        };
        params["ShowContent"] = true;
        await dispatch(getDirectReport(params))
        setLoader(false);
    }

    const handlePageSearching = (val) => {
        searchRequest(rowsPerPage, val);
        setPage(val);
    }

    const handleRowsPerPageSearching = (val) => {
        dispatch(setRowsPerPage(val))
        searchRequest(val, 0);
        setPage(1);
    }

    const renderCell = (data, dataType, isBalanceCol) => {
        let text = data;
        if (dataType === 'date') {
            text = moment(text);
            text = `${text.format('DD/MM/YYYY HH:mm')}`
        }
        if (dataType === 'status') {
            text = t(ConvertWhatsappStatusText(text));
            return (
                <Typography style={{ color: ConvertColorStatus(data, SourceType.WHATSAPP), fontWeight: 600 }}>{text}</Typography>
            )
        }

        return (
            <Typography style={{ fontWeight: isBalanceCol ? 900 : null, wordBreak: dataType === 'content' ? 'break-word' : null }}>
                { isBalanceCol && isCurrencySymbolPrefix ? currencySymbol : '' } {isBalanceCol ? text?.toFixed(2) : text} { isBalanceCol && !isCurrencySymbolPrefix ? currencySymbol : '' }
            </Typography>
        );
    }

    const handleFromDate = (val) => {
        if (val) {
            let dateVal = moment(val).startOf('day').format('YYYY-MM-DD HH:mm') || null;
            handleSearchInput(dateVal, 'FromDate', 'whatsapp')
        }
    }

    const handleToDate = (val) => {
        if (val) {
            let dateVal = moment(val).endOf('day').format('YYYY-MM-DD HH:mm') || null;
            handleSearchInput(dateVal, 'ToDate', 'whatsapp')
        }
    }

    const renderDateFields = () => {
        const { whatsapp = {} } = searchData || {};
        const { FromDate = null, ToDate = null, ToNumber = '' } = whatsapp || {};

        return (
            <>
                <Grid item>
                    <DateField
                        classes={classes}
                        value={FromDate}
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
                        value={ToDate}
                        onChange={(v) => handleToDate(v)}
                        placeholder={t('mms.locToDateResource1.Text')}
                        minDate={FromDate ? FromDate : '2000-01-01'}
                        toolbarDisabled={false}
                        rootStyle={classes.maxWidth190}
                        isRoundedOnMobile={windowSize === 'xs'}
                    />
                </Grid>
                {windowSize !== 'xs' && <Grid item>
                    <TextField
                        type='tel'
                        variant='outlined'
                        size='small'
                        inputProps={{
                            style: {
                                textAlign: isRTL ? 'right' : 'left'
                            }
                        }}
                        value={ToNumber}
                        onChange={(e) => handleSearchInput(e.target.value, 'ToNumber', 'whatsapp')}
                        className={clsx(classes.textField, classes.minWidth252)}
                        placeholder={t('common.ToNumber')}
                    />
                </Grid>
                }
            </>
        )
    }

    const renderAdvanceSearch = () => {
        const { whatsapp = {} } = searchData || {};
        const { FromNumber = '', ExternalRef = '', Status = '', Text = '', FromDate = null, ToDate = null, ToNumber = '' } = whatsapp || {};

        return (
            <>
                <Grid item>
                    <TextField
                        type='tel'
                        variant='outlined'
                        size='small'
                        inputProps={{
                            style: {
                                textAlign: isRTL ? 'right' : 'left'
                            }
                        }}
                        value={FromNumber}
                        onChange={(e) => handleSearchInput(e.target.value, 'FromNumber', 'whatsapp')}
                        className={clsx(classes.textField, classes.minWidth252)}
                        placeholder={t('common.FrmNumber')}
                    />
                </Grid>
                <Grid item>
                    <TextField
                        type='tel'
                        variant='outlined'
                        size='small'
                        inputProps={{
                            style: {
                                textAlign: isRTL ? 'right' : 'left'
                            }
                        }}
                        value={ToNumber}
                        onChange={(e) => handleSearchInput(e.target.value, 'ToNumber', 'whatsapp')}
                        className={clsx(classes.textField, classes.minWidth252)}
                        placeholder={t('common.ToNumber')}
                    />
                </Grid>
                <Grid item>
                    <TextField
                        variant='outlined'
                        size='small'
                        value={Text}
                        inputProps={{
                            style: {
                                textAlign: isRTL ? 'right' : 'left'
                            }
                        }}
                        onChange={(e) => handleSearchInput(e.target.value, 'Text', 'whatsapp')}
                        className={clsx(classes.textField, classes.minWidth252)}
                        placeholder={t('report.ContentOfMessage')}
                    />
                </Grid>
                <Grid item>
                    <DateField
                        classes={classes}
                        value={FromDate}
                        onChange={handleFromDate}
                        placeholder={t('mms.locFromDateResource1.Text')}
                        rootStyle={classes.maxWidth190}
                        toolbarDisabled={false}
                        minDate={'2000-01-01'}
                    />
                </Grid>
                <Grid item>
                    <DateField
                        classes={classes}
                        value={ToDate}
                        onChange={handleToDate}
                        placeholder={t('mms.locToDateResource1.Text')}
                        minDate={FromDate ? FromDate : '2000-01-01'}
                        toolbarDisabled={false}
                        rootStyle={classes.maxWidth190}
                    />
                </Grid>
                <Grid item>
                    <TextField
                        variant='outlined'
                        size='small'
                        inputProps={{
                            style: {
                                textAlign: isRTL ? 'right' : 'left'
                            }
                        }}
                        value={ExternalRef}
                        onChange={(e) => handleSearchInput(e.target.value, 'ExternalRef', 'whatsapp')}
                        className={clsx(classes.textField, classes.minWidth252)}
                        placeholder={t('common.templateId')}
                    />
                </Grid>
                <Grid item>
                    <FormControl variant='standard' className={clsx(classes.selectInputFormControl, classes.w100)}>
                        <Select
                            variant="standard"
                            autoWidth
                            displayEmpty
                            value={Status}
                            onChange={(e) => handleSearchInput(e.target.value, 'Status', 'whatsapp')}
                            IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: 200,
                                        direction: isRTL ? 'rtl' : 'ltr'
                                    },
                                },
                            }}
                        >
                            <MenuItem value="">{t("common.Status")}</MenuItem>
                            {WhatsappStatus.map(so => <MenuItem key={so.id} value={so.id}>{t(so.value)}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
            </>
        )
    }

    const renderSearchLine = () => {
        const { whatsapp = false } = isSearching || {};
        return (
            <Grid container spacing={2} className={clsx(windowSize === 'xs' || windowSize === 'sm' ? classes.mt15 : classes.lineTopMarging, 'searchLine')}>
                {advanceSearch ? renderAdvanceSearch() : renderDateFields()}
                <Grid item>
                    <Button
                        size='large'
                        variant='contained'
                        onClick={handleSearch}
                        className={clsx(classes.btn, classes.btnRounded)}
                        endIcon={<SearchIcon />}
                    >
                        {t('campaigns.btnSearchResource1.Text')}
                    </Button>
                    {windowSize !== 'xs' && <Link
                        color='initial'
                        component='button'
                        underline='none'
                        onClick={() => handleAdvanceSearch(!advanceSearch)}
                        className={clsx(classes.dBlock, classes.mt1, advanceSearch && windowSize === 'lg' ? classes.mb15 : null)}>
                        {t(!advanceSearch ? 'report.AdvanceSearch' : 'report.closeAdvanceSearch')}
                    </Link>
                    }
                </Grid>

                {whatsapp ? <Grid item>
                    <Button
                        size='large'
                        variant='contained'
                        onClick={() => {
                            setPage(1);
                            clearSearch('whatsapp');
                        }}
                        className={clsx(classes.btn, classes.btnRounded, classes.mleft5)}
                        endIcon={<ClearIcon />}
                    >
                        {t('common.clear')}
                    </Button>
                </Grid> : null}
            </Grid>
        )
    }

    const renderTableHead = () => {
        return (
            <TableHead>
                <TableRow classes={rowStyle}>
                    <TableCell
                        classes={cellStyle}
                        align='center'
                        className={classes.flex2}>
                        {t('report.SendDate')}
                    </TableCell>
                    <TableCell
                        classes={cellStyle}
                        align='center'
                        className={classes.flex1}>
                        {t('common.FrmNumber')}
                    </TableCell>
                    <TableCell
                        classes={cellStyle}
                        align='center'
                        className={classes.flex1}>
                        {t('common.ToNumber')}
                    </TableCell>
                    <TableCell
                        classes={cellStyle}
                        align='center'
                        className={classes.flex1}>
                        {t('common.Status')}
                    </TableCell>
                    <TableCell
                        classes={cellStyle}
                        align='center'
                        className={classes.flex3}>
                        {t('report.ContentOfMessage')}
                    </TableCell>
                    <TableCell
                        classes={cellStyle}
                        className={classes.flex1}
                        align='center'>
                        <>{t('whatsappReport.cost')}</>
                    </TableCell>
                    <TableCell
                        classes={cellStyle}
                        align='center'
                        className={classes.flex1}>
                        {t('report.failure')}
                    </TableCell>
                    <TableCell
                        classes={cellStyle}
                        className={classes.flex1}
                        align='center'></TableCell>
                </TableRow>
            </TableHead>
        )
    }

    // const renderReactivate = (row) => {
    //     const reactivate = async () => {
    //         const request = {
    //             To: row.TO
    //         };
    //         await dispatch(reactivateSms(request));
    //         handleSearch();
    //     }
    //     return (<Link
    //         color="primary"
    //         onClick={() => { reactivate() }}
    //         target='_blank'
    //         className={clsx(classes.f16, classes.redLink)}>
    //         {t('report.Reactivate')}
    //     </Link>)
    // }

    const renderRow = (row) => {
        const { Schedule, FromNumber, ToNumber, Status, Text, ErrorMessage, ReferenceId, Cost } = row;
        return (
            <TableRow
                classes={rowStyle}>
                <TableCell scope="row"
                    classes={cellStyle}
                    align='center'
                    className={classes.flex2}>
                    {renderCell(Schedule, 'date')}
                </TableCell>

                <TableCell
                    classes={noborderCell}
                    align='center'
                    className={classes.flex1}>
                    {renderCell(FromNumber)}
                </TableCell>
                <TableCell
                    classes={noborderCell}
                    align='center'
                    className={classes.flex1}>
                    {renderCell(ToNumber)}
                </TableCell>
                <TableCell
                    classes={cellStyle}
                    align='center'
                    className={classes.flex1}>
                    {renderCell(Status, 'status')}
                </TableCell>
                <TableCell
                    classes={cellStyle}
                    align='center'
                    className={classes.flex3}>
                    {renderCell(Text, 'content')}
                </TableCell>
                <TableCell
                    classes={cellStyle}
                    align='center'
                    className={classes.flex1}>
                    {Status !== 7 && renderCell(Cost, null, true)}
                </TableCell>
                <TableCell
                    classes={cellStyle}
                    align='center'
                    className={classes.flex1} title={ErrorMessage}>
                    <CustomTooltip
                        isSimpleTooltip={false}
                        interactive={true}
                        forceDirection={'ltr'}
                        classes={{
                            tooltip: clsx(classes.tooltipBlack, classes.tooltipPlacement),
                            arrow: classes.fBlack,
                        }}
                        arrow={true}
                        style={{ fontSize: 15 }}
                        placement={"top"}
                        title={<Typography noWrap={false}>{ErrorMessage}</Typography>}
                    >
                        {ErrorMessage && ErrorMessage !== '' && <Typography>
                            {t('common.showError')}
                        </Typography>}
                    </CustomTooltip>
                </TableCell>
                {windowSize !== 'xs' && (
                    <>
                        <TableCell
                            classes={noborderCell}
                            align='center'
                            className={classes.flex1} title={ReferenceId}>
                            <CustomTooltip
                                isSimpleTooltip={false}
                                interactive={true}
                                forceDirection={'ltr'}
                                classes={{
                                    tooltip: clsx(classes.tooltipBlack, classes.tooltipPlacement),
                                    arrow: classes.fBlack,
                                }}
                                arrow={true}
                                style={{ fontSize: 15 }}
                                placement={"top"}
                                title={<Typography noWrap={false}>{ReferenceId}</Typography>}
                            >
                                {ReferenceId && ReferenceId !== '' && <>
                                    <ManagmentIcon
                                        uIcon={<PreviewIcon width={18} height={20} className={'PreviewIcon'} />}
                                        lable={t('campaigns.Image1Resource1.ToolTip')}
                                        onClick={() => {
                                            setTemplateID(ReferenceId);
                                            setTemplatePreview(true);
                                        }}
                                        classes={classes}
                                    />
                                </>}
                            </CustomTooltip>
                        </TableCell>
                    </>
                )}
            </TableRow>
        )
    }

    const renderNameCell = (schedule) => {
        let d = moment(schedule);
        d = `${d.format('DD/MM/YYYY HH:mm')}`

        return (
            <>
                <Typography className={classes.nameEllipsis}>
                    {t('report.SendDate')}
                </Typography>
                <Typography className={classes.grayTextCell}>
                    {t("common.SentOn")} {d}
                </Typography>
            </>
        )
    }

    const renderPhoneRow = (row) => {
        const { Schedule, FromNumber, ToNumber, Status, Text, ErrorMessage } = row;

        return (
            <TableRow
                classes={rowStyle}>
                <TableCell
                    style={{ flex: 2 }}
                    classes={{ root: classes.tableCellRoot }}
                    className={classes.p20}
                >
                    <Box className={classes.ml10}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Box className={classes.spaceBetween}>
                                    <Box>
                                        {renderCell(Schedule, 'date')}
                                    </Box>
                                    <Box>
                                        {renderCell(Status, 'status')}
                                    </Box>
                                </Box>
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
                                    {Text}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                </TableCell>
            </TableRow >
        )
    }

    const renderTableBody = () => {
        let sortData = directWhatsappReport?.Data ?? null;

        return (
            <TableBody>
                {!sortData || sortData.length === 0 ? <Box className={clsx(classes.flex, classes.justifyCenterOfCenter)} style={{ height: 50 }}>
                    <Typography>{t("common.NoDataTryFilter")}</Typography>
                </Box> :
                    sortData.map(windowSize === 'xs' ? renderPhoneRow : renderRow)
                }
            </TableBody>
        )
    }

    const renderTable = () => {
        return (
            <>
                <Grid container style={{ justifyContent: windowSize === 'xs' ? 'flex-start' : 'flex-end' }}>
                    <Grid item className={windowSize === 'xs' ? classes.mt15 : null} style={{ textAlign: isRTL ? 'left' : 'right' }}>
                        <Typography className={clsx(classes.groupsLable, classes.mb5)}>
                            {t('common.Total')} {directWhatsappReport?.Message?.TotalMessages ?? 0} {t('report.Messages')}
                        </Typography>
                    </Grid>
                </Grid>
                <TableContainer className={clsx(classes.mt10)}>
                    <Table className={clsx(classes.tableContainer, classes.noborder)}>
                        {windowSize !== 'xs' && renderTableHead()}
                        {renderTableBody()}
                    </Table>
                </TableContainer>
            </>
        )
    }

    const renderTablePagination = () => {
        const data = (directWhatsappReport && directWhatsappReport.Message?.TotalMessages) || 0;
        return (
            <TablePagination
                classes={classes}
                rows={data}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleRowsPerPageSearching}
                rowsPerPageOptions={rowsOptions}
                page={page}
                onPageChange={handlePageSearching}
                returnPageOne={false}
            />
        )
    }

    return <>
        <Box className={clsx('topSection', classes.mt10)}>
            <Title Text={title} classes={classes} />
            {renderSearchLine()}
        </Box>
        {renderTable()}
        {renderTablePagination()}
        {directWhatsappReport && <TotalSection classes={classes} TotalObject={{
            "TotalSent": directWhatsappReport?.Message?.TotalMessages,
            "WhatsappBalance": `${ isCurrencySymbolPrefix ? currencySymbol : '' } ${directWhatsappReport?.Message?.WhatsappBalance || 0} ${ !isCurrencySymbolPrefix ? currencySymbol : '' }`
        }} callerType="whatsapp" />}
        <WhatsappTemplatePreview classes={classes} templateID={templateID} openPreview={openTemplatePreview} closeModel={() => setTemplatePreview(false)} />
        <Loader isOpen={showLoader} />
    </>
}

export default DirectWhatsappReportTab