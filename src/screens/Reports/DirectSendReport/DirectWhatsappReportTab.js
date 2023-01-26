import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import {
    Box, Button, Grid, Table, TableContainer,
    TableCell, Link, FormControl, Select, MenuItem,
    TableHead, TableRow, TextField, Typography, TableBody
} from '@material-ui/core';
import {
    TablePagination, DateField
} from '../../../components/managment/index';
import { SearchIcon } from '../../../assets/images/managment';
import ClearIcon from '@material-ui/icons/Clear';
import moment from 'moment';
import { getDirectReport } from '../../../redux/reducers/whatsappSlice';
import { Loader } from '../../../components/Loader/Loader';
import { WhatsappStatus } from '../../../helpers/PulseemArrays';
import { whatsappStatusToString, whatsappStatusColor, renderHtml } from '../../../helpers/functions';
import { setRowsPerPage } from '../../../redux/reducers/coreSlice';
import CustomTooltip from "../../../components/Tooltip/CustomTooltip";
import { ImWhatsapp } from 'react-icons/im';

const DirectWhatsappReportTab = ({
    classes,
    dispatch,
    windowSize,
    isRTL,
    handleSearchInput = () => null,
    handleSearching = () => null,
    handlePageChange = () => null,
    handleAdvanceSearch = () => null,
    clearSearch,
    page,
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
    const { t } = useTranslation();
    const [showLoader, setLoader] = useState(false)

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
        handlePageChange(val);
    }

    const handleRowsPerPageSearching = (val) => {
        dispatch(setRowsPerPage(val))
        searchRequest(val, page);
    }

    const renderCell = (data, dataType, cutOff) => {
        let text = data;
        if (dataType === 'date') {
            text = moment(text);
            text = `${text.format('DD/MM/YYYY HH:mm')}`
        }
        if (dataType === 'status') {
            text = t(whatsappStatusToString(text));
            return (
                <Typography style={{ color: whatsappStatusColor(data), fontWeight: 600 }}>{text}</Typography>
            )
        }

        return (
            <Typography style={{ wordBreak: dataType === 'content' ? 'break-word' : null }}>{text}</Typography>
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
                        value={ExternalRef}
                        onChange={(e) => handleSearchInput(e.target.value, 'ExternalRef', 'whatsapp')}
                        className={clsx(classes.textField, classes.minWidth252)}
                        placeholder={t('common.templateId')}
                    />
                </Grid>
                <Grid item>
                    <FormControl variant="outlined" className={classes.formControl} style={{ width: '100%', maxHeight: 40 }}>
                        <Select
                            autoWidth
                            displayEmpty
                            className={clsx(classes.textField, classes.minWidth192, classes.formControlSelect)}
                            value={Status}
                            style={{ maxHeight: 40, overflow: 'hidden', paddingLeft: 0, paddingRight: 0 }}
                            onChange={(e) => handleSearchInput(e.target.value, 'Status', 'whatsapp')}
                            MenuProps={{
                                anchorOrigin: {
                                    vertical: "bottom",
                                    horizontal: "left"
                                },
                                transformOrigin: {
                                    vertical: "top",
                                    horizontal: "left"
                                },
                                getContentAnchorEl: null
                            }}
                        >
                            <MenuItem value="" className={classes.dropDownItem}>
                                {t("common.Status")}
                            </MenuItem>
                            {WhatsappStatus.map(so => {
                                return <MenuItem key={so.id} value={so.id} className={classes.dropDownItem}>{t(so.value)}</MenuItem>
                            })}
                        </Select>
                    </FormControl>
                </Grid>
            </>
        )
    }

    const renderSearchLine = () => {
        const { whatsapp = false } = isSearching || {};
        return (
            <Grid container spacing={2} className={classes.lineTopMarging}>
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
                            clearSearch('whatsapp');
                        }}
                        className={classes.searchButton}
                        endIcon={<ClearIcon />}>
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
                        align='center'
                        className={classes.flex1}>
                        {t('report.failure')}
                    </TableCell>
                    <TableCell
                        classes={cellStyle}
                        className={classes.flex1}
                        style={{ inlineSize: 90 }}
                        align='center'>
                        {t('common.templateId')}
                    </TableCell>
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
        return (
            <TableRow
                classes={rowStyle}>
                <TableCell scope="row"
                    classes={cellStyle}
                    align='center'
                    className={classes.flex2}>
                    {renderCell(row.Schedule, 'date')}
                </TableCell>

                <TableCell
                    classes={noborderCell}
                    align='center'
                    className={classes.flex1}>
                    {renderCell(row.FromNumber)}
                </TableCell>
                <TableCell
                    classes={noborderCell}
                    align='center'
                    className={classes.flex1}>
                    {renderCell(row.ToNumber)}
                </TableCell>
                <TableCell
                    classes={cellStyle}
                    align='center'
                    className={classes.flex1}>
                    {renderCell(row.Status, 'status')}
                </TableCell>
                <TableCell
                    classes={cellStyle}
                    align='center'
                    className={classes.flex3}>
                    {renderCell(row.Text, 'content')}
                </TableCell>
                <TableCell
                    classes={noborderCell}
                    align='center'
                    className={classes.flex1} title={row.ErrorMessage}>
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
                        title={<Typography noWrap={false}>{row.ErrorMessage}</Typography>}
                    >
                        {row.ErrorMessage && row.ErrorMessage !== '' && <Typography>
                            {t('common.showError')}
                        </Typography>}
                    </CustomTooltip>
                </TableCell>
                {windowSize !== 'xs' && (
                    <>
                        <TableCell
                            classes={noborderCell}
                            align='center'
                            className={classes.flex1} title={row.ReferenceId}>
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
                                title={<Typography noWrap={false}>{row.ReferenceId}</Typography>}
                            >
                                {row.ReferenceId && row.ReferenceId !== '' && <Typography>
                                    {t('common.showTemplateId')}
                                </Typography>}
                            </CustomTooltip>
                        </TableCell>
                    </>
                )}
                {/* <TableCell
                    classes={noborderCell}
                    align='center'
                    className={classes.flex1}>
                    {renderCell(row.Credits)}
                </TableCell> */}
            </TableRow>
        )
    }

    const renderNameCell = (row) => {
        const { DATE } = row
        let d = moment(DATE);
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
        const {
            PID, DATE, FROM, TO, STATUS
        } = row

        return (
            <TableRow
                key={row.ID}
                component='div'
                classes={rowStyle}>
                <TableCell classes={{ root: clsx(classes.tableCellRoot, classes.flex1, classes.tabelCellPadding) }} style={{ paddingInline: 10 }}>
                    <Box className={clsx(classes.dFlex)} style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Box className={classes.dFlex} style={{ flexDirection: 'column', justifySelf: 'flex-start' }}>
                            {renderNameCell({ PID, DATE, FROM, TO, STATUS })}
                        </Box>
                        <Box style={{ justifySelf: 'flex-end', whiteSpace: 'nowrap' }}>
                            <Typography style={{ color: whatsappStatusColor(STATUS) }}>
                                {t(whatsappStatusToString(STATUS))}
                            </Typography>
                        </Box>
                    </Box>
                    <Grid container spacing={2}  >
                        <Grid item>
                            <Typography className={classes.mobileReportHead}>
                                {t('common.FrmNumber')}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            {FROM}
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
                                {t('common.ToNumber')}
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item>
                                    {TO}
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </TableCell>
            </TableRow>
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
                            {t('common.Total')} {directWhatsappReport?.Message ?? 0} {t('report.Messages')}
                        </Typography>
                    </Grid>
                </Grid>
                <TableContainer className={clsx(classes.borderAround, classes.mt10)}>
                    <Table className={clsx(classes.tableContainer, classes.noborder)}>
                        {windowSize !== 'xs' && renderTableHead()}
                        {renderTableBody()}
                    </Table>
                </TableContainer>
            </>
        )
    }

    const renderTablePagination = () => {
        const data = (directWhatsappReport && directWhatsappReport.Message) || 0;
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

    return directWhatsappReport?.Data ? (
        <>
            {renderSearchLine()}
            {renderTable()}
            {renderTablePagination()}
            <Loader isOpen={showLoader} />
        </>
    ) : <>
        <Box className={classes.flexCenterOfCenter} style={{ marginTop: 25 }}>
            <Typography style={{ fontSize: 30 }}>{renderHtml(t('common.whatsappCommingSoon'))}</Typography>
            <ImWhatsapp style={{ color: '#25D366', fontSize: 40, marginTop: 15 }} />
        </Box>
    </>
}

export default DirectWhatsappReportTab