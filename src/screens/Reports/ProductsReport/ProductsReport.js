import React, { useState, useEffect } from 'react';
import DefaultScreen from '../../DefaultScreen';
import clsx from 'clsx';
import { Typography, TableBody, TableRow, TableCell, Grid, Button, TextField, Box, FormControl, MenuItem, Checkbox, ListItemText } from '@material-ui/core'
import Select from '@mui/material/Select';
import { TablePagination } from '../../../components/managment/index'
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import 'moment/locale/he';
import { Loader } from '../../../components/Loader/Loader';
import { setRowsPerPage } from '../../../redux/reducers/coreSlice';
import DataTable from '../../../components/Table/DataTable';
import { useNavigate } from 'react-router';
import { CLIENT_CONSTANTS } from '../../../model/Clients/Contants';
import { GetProductReports } from '../../../redux/reducers/reportSlice';
import { FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa'
import ConfirmRadioDialog from '../../../components/DialogTemplates/ConfirmRadioDialog';
import { ExportFile } from '../../../helpers/Export/ExportFile';
import { ExportFileTypes } from '../../../model/Export/ExportFileTypes';
import { HandleExportData } from '../../../helpers/Export/ExportHelper';
import LazyBackground from '../../../components/Gallery/Lazy/LazyBackground';
import { RenderHtml } from '../../../helpers/Utils/HtmlUtils';
import { Title } from '../../../components/managment/Title';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { IoIosArrowDown } from 'react-icons/io';
import { PulseemFeatures } from '../../../model/PulseemFields/Fields';
import { WhiteLabelObject } from '../../../components/WhiteLabel/WhiteLabelMigrate';

const DEFAULT_FILTER = {
    PageIndex: 1,
    PageSize: 6,
    ProductName: null,
    CategoryID: [],
    IsExport: false,
    OrderBY: 0,
    OrderByParameter: null
}

const ProductsReport = ({ classes }) => {
    const navigate = useNavigate()
    const { accountFeatures, accountSettings, currencySymbol, isCurrencySymbolPrefix } = useSelector(state => state.common);
    const { language, windowSize, isRTL, rowsPerPage, userRoles } = useSelector(state => state.core)
    const { productsReportDetails, productCategories, exportPRData } = useSelector(state => state.report)
    const { t } = useTranslation()
    const [searchData, setSearchData] = useState(DEFAULT_FILTER)
    const [isSearching, setIsSearching] = useState(true);
    const [filter, setFilter] = useState(false);

    const dispatch = useDispatch()
    const rowStyle = { head: classes.tableRowReportHead, root: clsx(classes.tableRowRoot, classes.maxHeight87) }
    const cell50wStyle = { head: clsx(classes.tableCellHead), root: clsx(classes.tableCellRoot, classes.paddingHead, classes.minWidth50) }
    const cellBodyStyle = { body: clsx(classes.tableCellBody), root: clsx(classes.tableCellRoot) }
    const noBorderCellStyle = { body: classes.tableCellBodyNoBorder, root: clsx(classes.tableCellRoot, classes.minWidth50) }
    const borderCellStyle = { body: clsx(classes.tableCellBody), root: clsx(classes.tableCellRoot, classes.minWidth50) }
    const [showLoader, setLoader] = useState(true);
    const [dialogType, setDialogType] = useState(null);
    const rowsOptions = [6, 10, 20, 50];

    moment.locale(language)

    const GetSortIcon = (key) => {

        const handleClickSort = (order) => {
            setSearchData({ ...searchData, OrderByParameter: key, OrderBY: order })
            setTimeout(() => {
                setIsSearching(true)
            }, 200);
        }
        if (searchData?.OrderBY === 0 && searchData?.OrderByParameter === key) {
            return <FaSortAmountUp className={classes.colrPrimary} style={{ cursor: 'pointer' }} onClick={() => handleClickSort(1)} />
        }
        else {
            return <FaSortAmountDown className={classes.colrPrimary} style={{ cursor: 'pointer' }} onClick={() => handleClickSort(0)} />
        }
    }

    const TABLE_HEAD = [
        { label: t('report.ProductsReport.photo'), classes: cell50wStyle, className: classes.flex1, align: 'center' },
        { label: t('report.ProductsReport.prodName'), classes: cell50wStyle, className: classes.flex2, align: 'center' },
        { label: t('report.ProductsReport.category'), classes: cell50wStyle, className: classes.flex1, align: 'center' },
        { label: t('report.ProductsReport.price'), icon: GetSortIcon('Price'), classes: cell50wStyle, className: classes.flex1, align: 'center' },
        { label: t('report.ProductsReport.purchased'), icon: GetSortIcon('Purchased'), classes: cell50wStyle, className: classes.flex1, align: 'center' },
        { label: t('report.ProductsReport.abandoned'), icon: GetSortIcon('Abandoned'), classes: cell50wStyle, className: classes.flex1, align: 'center' },
        { label: t('report.ProductsReport.revenueFrmProd'), icon: GetSortIcon('TotalRevenue'), classes: cell50wStyle, className: classes.flex2, align: 'center' },
    ]

    useEffect(() => {
        const initProducts = async () => {
            setLoader(true);
            await dispatch(GetProductReports({ ...searchData, PageSize: rowsPerPage }));
            setIsSearching(false)
            setLoader(false)
        }
        if (isSearching) {
            initProducts();
        }
    }, [isSearching]);


    //  HANDLERS  //
    const getHrefs = (id) => ({
        Purchased: {
            title: t('report.ProductsReport.purchased'),
            onClick: () => !userRoles?.HideRecipients && navigate(CLIENT_CONSTANTS.BASEURL, {
                state: {
                    ...CLIENT_CONSTANTS.QUERY_PARAMS,
                    ProductId: id,
                    PageType: CLIENT_CONSTANTS.PAGE_TYPES.Product,
                    EventTypeID: CLIENT_CONSTANTS.PRODUCT_REPORT_TYPE.PURCHASED
                }
            }),
        },
        Abandoned: {
            title: t('report.ProductsReport.abandoned'),
            onClick: () => !userRoles?.HideRecipients && navigate(CLIENT_CONSTANTS.BASEURL, {
                state: {
                    ...CLIENT_CONSTANTS.QUERY_PARAMS,
                    ProductId: id,
                    PageType: CLIENT_CONSTANTS.PAGE_TYPES.Product,
                    EventTypeID: CLIENT_CONSTANTS.PRODUCT_REPORT_TYPE.ABANDONED
                }
            }),
        },
        TotalRevenue: {
            title: 'report.ProductsReport.revenueFrmProd'
        }
    })

    const exportColumnHeader = {
        "ProductId": t('report.ProductsReport.productId'),
        "ProductName": t('report.ProductsReport.prodName'),
        "CategoryName": t('report.ProductsReport.category'),
        "Price": t('report.ProductsReport.price'),
        "Purchased": t('report.ProductsReport.purchased'),
        "Abandoned": t('report.ProductsReport.abandoned'),
        "TotalRevenue": t('report.ProductsReport.revenueFrmProd'),
        "ImageURL": t('report.ProductsReport.photo')
    }

    const handleDownloadCsv = async (formatType) => {
        setDialogType(null);
        setLoader(true)
        const exportOptions = {
            OrderItems: true,
            FormatDate: true,
            Order: Object.keys(exportColumnHeader)
        };

        try {
            const result = await HandleExportData(exportPRData, exportOptions);
            ExportFile({
                data: result,
                fileName: 'productsReport',
                exportType: formatType,
                fields: exportColumnHeader
            });
        } catch (e) {
            console.log(e);
            // dispatch(sendToTeamChannel({
            //     MethodName: 'handleDownloadCsv',
            //     ComponentName: 'ArchiveManagement.js',
            //     Text: e
            // }));
        }
        finally {
            setLoader(false);
        }
    }
    //  COMPONENTS  //
    const renderFilter = () => {

        return (
            <Grid
                container
                spacing={2}
                className={clsx(classes.lineTopMarging, 'searchLine')}>
                <Grid item>
                    <TextField
                        variant='outlined'
                        value={searchData.ProductName ?? ''}
                        onChange={(e) => setSearchData({ ...searchData, ProductName: e.target.value })}
                        className={clsx(classes.textField, classes.minWidth252, classes.h100)}
                        placeholder={t('report.ProductsReport.prodName')}
                    />
                </Grid>

                <Grid item>
                    <FormControl variant='standard' className={clsx(classes.selectInputFormControl, classes.w100)}>
                        <Select
                            variant="standard"
                            placeholder={t('report.ProductsReport.category')}
                            labelId="category"
                            id="category"
                            multiple
                            style={{ minWidth: windowSize !== 'xs' ? 300 : 200 }}
                            value={searchData.CategoryID}
                            IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                            inputProps={{
                                placeholder: t('report.ProductsReport.category'),
                                class: searchData.CategoryID.length === 0 ? classes.selectPlaceholderInput : classes.dNone

                            }}
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: 300,
                                        direction: isRTL ? 'rtl' : 'ltr'
                                    },
                                },
                            }}
                            renderValue={(selected) => productCategories.reduce((prev, next) => selected.indexOf(next.CategoryId) > -1 ? [...prev, next.CategoryName] : prev, []).join(', ')}
                            onChange={(e) => setSearchData({ ...searchData, CategoryID: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value })}
                        >
                            {
                                productCategories?.map((obj, idx) =>
                                    <MenuItem key={`op${obj.CategoryId}`} value={obj.CategoryId}>
                                        <Checkbox size="small" color="primary" checked={searchData.CategoryID.indexOf(obj.CategoryId) > -1} />
                                        <ListItemText primary={t(obj.CategoryName)} />
                                    </MenuItem>
                                )
                            }
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item>
                    <Button
                        onClick={() => {
                            if (searchData.CategoryID.length > 0 || searchData.ProductName) {
                                setIsSearching(true)
                                setFilter(true)
                            }
                        }}
                        className={clsx(classes.btn, classes.btnRounded)}
                        endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                    >
                        {t('notifications.buttons.search')}
                    </Button>

                </Grid>
                {
                    filter && <Grid item>
                        <Button
                            onClick={() => {
                                setSearchData(DEFAULT_FILTER)
                                setIsSearching(true)
                                setFilter(false)
                            }}
                            className={clsx(classes.btn, classes.btnRounded)}
                            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}>
                            {t('common.clear')}
                        </Button>
                    </Grid>
                }
            </Grid >
        )
    }

    const renderManagmentLine = () => {
        const dataLength = productsReportDetails?.TotalProducts ?? 0;
        return (
            <Grid container spacing={2} className={classes.linePadding}>
                {userRoles?.AllowExport && accountFeatures?.indexOf(PulseemFeatures.LOCK_EXPORT_DATA) === -1 && windowSize !== 'xs' && <Grid item>
                    <Button
                        className={clsx(classes.btn, classes.btnRounded)}
                        onClick={() => {
                            dispatch(GetProductReports({ ...searchData, IsExport: true }))
                            setDialogType('exportFormat')
                        }}
                        endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                        disabled={!productsReportDetails?.Products?.length}
                    >
                        {t('campaigns.exportFile')}
                    </Button>
                </Grid>}
                <Grid item className={classes.groupsLableContainer} >
                    <Typography className={classes.groupsLable}>
                        {`${dataLength} ${t('report.ProductsReport.products')}`}
                    </Typography>
                </Grid>
            </Grid>
        )
    }

    const colorTextStyle = { red: classes.textColorRed, blue: classes.textColorBlue, green: classes.sendIconText, grey: classes.textColorGrey };

    const renderIntData = (value, data = {}, type = null, displayCurrency = false) => {
        const {
            // title = windowSize === 'xs' ? '' : t("notifications.tblBody.total"), 
            // href = '', 
            onClick = null
        } = data
        return (
            <Box style={{ display: 'flex', flexDirection: 'column' }} className={userRoles?.HideRecipients && classes.disabled}>
                <Typography component={'p'}
                    onClick={() => onClick?.()}
                    className={clsx(classes.middleText, colorTextStyle[type],
                        (onClick && value > 0) ? classes.link : '')}
                    target="_blank">
                    {displayCurrency && isCurrencySymbolPrefix ? currencySymbol : ''} {value?.toLocaleString() ?? '0'} {displayCurrency && !isCurrencySymbolPrefix ? currencySymbol : ''}
                </Typography>
            </Box>
        )
    }

    const renderRow = (row) => {
        const {
            ProductId,
            ImageURL,
            ProductName,
            CategoryName,
            Price,
            Purchased,
            Abandoned,
            TotalRevenue,
            uniqueKey
        } = row
        const hrefs = getHrefs(ProductId)
        return (
            <TableRow
                key={uniqueKey}
                classes={rowStyle}>
                <TableCell
                    classes={cellBodyStyle}
                    align='center'
                    className={clsx(classes.flex1)}>
                    <LazyBackground
                        style={{ backgroundSize: 'contain' }}
                        url={ImageURL}
                        title={ProductName}
                        height={'100px'}
                    />
                    {/* <img src={ImageURL} alt={ProductName} className={classes.imgFluid} /> */}
                </TableCell>
                <TableCell
                    classes={borderCellStyle}
                    align='center'
                    className={classes.flex2}>
                    <Typography>{ProductName}</Typography>
                </TableCell>
                <TableCell
                    classes={borderCellStyle}
                    align='center'
                    className={classes.flex1}>
                    <Box sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        maxHeight: '80px',
                        overflowY: 'auto'
                    }}>
                        {CategoryName.split(',').map((category, index) => (
                            <Typography>{category}{index < CategoryName?.split(',')?.length - 1 && ','}&nbsp;</Typography>
                        ))}
                    </Box>
                </TableCell>
                <TableCell
                    classes={borderCellStyle}
                    align='center'
                    className={classes.flex1}>
                    {renderIntData(Price, '', null, true)}
                </TableCell>
                <TableCell
                    classes={borderCellStyle}
                    align='center'
                    className={classes.flex1}>
                    {renderIntData(Purchased, Purchased > 0 && hrefs.Purchased)}
                </TableCell>
                <TableCell
                    classes={borderCellStyle}
                    align='center'
                    className={classes.flex1}>
                    {renderIntData(Abandoned, Abandoned > 0 && hrefs.Abandoned)}
                </TableCell>
                <TableCell
                    classes={noBorderCellStyle}
                    align='center'
                    className={classes.flex2}>
                    {renderIntData(TotalRevenue, hrefs.TotalRevenue, null, true)}
                </TableCell>
            </TableRow >
        )
    }


    const renderPhoneRow = (row) => {
        const {
            ProductId,
            ImageURL,
            ProductName,
            Price,
            Purchased,
            Abandoned,
            TotalRevenue,
            uniqueKey
        } = row
        const hrefs = getHrefs(ProductId)
        return (
            <TableRow
                key={uniqueKey}
                classes={rowStyle}
                style={{ justifyContent: 'left' }}>
                <TableCell
                    classes={cellBodyStyle}
                    className={classes.w100}
                >
                    <Grid container spacing={2}>
                        <Grid item sm={4} xs={4}>
                            <LazyBackground
                                style={{ backgroundSize: 'contain', height: 70, minWidth: 70, width: 70 }}
                                url={ImageURL}
                                title={ProductName}
                            />
                        </Grid>
                        <Grid item sm={8} xs={8}>
                            <Typography className={clsx(classes.bold, classes.ellipsisText, classes.f14)}>
                                {ProductName}
                            </Typography>
                            <Typography className={clsx(classes.pt5, classes.f14, classes.semibold)}>
                                <span className={classes.bold}>{t("report.ProductsReport.price")}:</span>
                                {isCurrencySymbolPrefix ? currencySymbol : ''} {Price} {!isCurrencySymbolPrefix ? currencySymbol : ''}
                            </Typography>

                            <Grid container className={classes.pt5}>
                                <Grid item xs={6} sm={6}>
                                    <Typography className={clsx(classes.f14, classes.bold)}>{t("client.Purchased")}</Typography>
                                    <Typography className={clsx(colorTextStyle.blue, classes.elipsis)}>
                                        {renderIntData(Purchased, Purchased > 0 && hrefs.Purchased, 'blue')}
                                    </Typography>
                                </Grid>

                                <Grid item xs={6} sm={6}>
                                    <Typography className={clsx(classes.f14, classes.bold)}>{t("report.ProductsReport.abandoned")}</Typography>
                                    <Typography className={clsx(colorTextStyle.red, classes.elipsis)}>
                                        {renderIntData(Abandoned, Abandoned > 0 && hrefs.Abandoned, 'red')}
                                    </Typography>
                                </Grid>

                                <Grid item xs={6} sm={6} className={classes.pt5}>
                                    <Typography className={clsx(classes.f14, classes.bold)}>{t("client.totalRevenue")}</Typography>
                                    <Typography className={clsx(classes.elipsis)}>
                                        {renderIntData(TotalRevenue, hrefs.TotalRevenue, 'green', true)}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </TableCell>
            </TableRow>
        )
    }

    const handleRowsPerPageSearching = (val) => {
        dispatch(setRowsPerPage(val));
        setIsSearching(true)
    }
    const handlePageChange = (val) => {
        setSearchData({ ...searchData, PageIndex: val });
        setIsSearching(true)
    }

    const renderTableBody = () => {
        if (productsReportDetails && productsReportDetails?.Products?.length > 0) {
            return (
                <DataTable
                    tableContainer={{
                        className:
                            windowSize === "xs"
                                ? clsx(classes.mt3, classes.tableStyle)
                                : classes.tableStyle,
                    }}
                    table={{ className: classes.tableContainer }}
                    tableHead={{
                        tableHeadCells: TABLE_HEAD,
                        classes: rowStyle,
                        className: windowSize === "xs" && classes.dNone,
                    }}
                >
                    <Box className='tableBodyContainer'>
                        <TableBody>
                            {productsReportDetails?.Products
                                .map(windowSize === 'xs' ? renderPhoneRow : renderRow)}
                        </TableBody>
                    </Box>
                </DataTable>)
        }
        return <Box className={clsx(classes.flex, classes.justifyCenterOfCenter)} style={{ height: 50 }}>
            <Typography>{t("common.NoDataTryFilter")}</Typography>
        </Box>
    }

    const renderTablePagination = () => {
        return (
            <TablePagination
                classes={classes}
                rows={productsReportDetails?.TotalProducts ? productsReportDetails?.TotalProducts : 0}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleRowsPerPageSearching}
                rowsPerPageOptions={rowsOptions}
                page={searchData.PageIndex}
                onPageChange={handlePageChange}
            />
        )
    }

    const wl_renderContact = (param) => {
        const isWhiteLabel = accountSettings?.Account?.ReferrerID > 0 && WhiteLabelObject[accountSettings?.Account?.ReferrerID] !== undefined;
        return WhiteLabelObject[isWhiteLabel ? accountSettings?.Account?.ReferrerID : 0][param];
    }

    return (
        <DefaultScreen
            classes={classes}
            containerClass={clsx(classes.management, classes.mb50)}
            currentPage="reports"
            subPage="productsReport">
            <Box>
                <Box className='topSection'>
                    <Title Text={t('report.ProductsReport.title')} classes={classes} />
                    <Grid item xs={12} className={classes.mt2} style={{ paddingInline: 31 }}>
                        <Typography>{RenderHtml(t('report.ProductsReport.registrationGuide'))}</Typography>
                        <Typography display='inline'>{t('common.ForSupport')}: </Typography>
                        <Typography display='inline' className={clsx(classes.link, classes.colrPrimary)} component='a' href={`tel:${wl_renderContact('Phone')}`}>{wl_renderContact('Phone')}</Typography>
                        <Typography display='inline' className={classes.colrPrimary}> / </Typography>
                        <Typography display='inline' className={clsx(classes.link, classes.colrPrimary)} component='a' href={`mailto:${wl_renderContact('Email')}`}>{wl_renderContact('Email')}</Typography>
                    </Grid>
                    {renderFilter()}
                </Box>
            </Box>
            {/* <Divider /> */}
            {renderManagmentLine()}
            {renderTableBody()}
            {renderTablePagination()}
            <ConfirmRadioDialog
                classes={classes}
                isOpen={dialogType === 'exportFormat'}
                title={t('campaigns.exportFile')}
                radioTitle={t('common.SelectFormat')}
                onConfirm={(e) => handleDownloadCsv(e)}
                onCancel={() => setDialogType(null)}
                cookieName={'exportFormat'}
                defaultValue="xlsx"
                options={ExportFileTypes}
            />

            <Loader isOpen={showLoader} showBackdrop={true} />
        </DefaultScreen>
    )
};

export default ProductsReport;

