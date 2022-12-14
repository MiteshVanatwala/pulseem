import React, { useState, useEffect } from 'react';
import DefaultScreen from '../../DefaultScreen';
import clsx from 'clsx';
import { Typography, Divider, TableBody, TableRow, TableHead, TableCell, TableContainer, Grid, Button, TextField, Box, FormControl, Select, MenuItem, Checkbox, ListItemText } from '@material-ui/core'
import { SearchIcon, ExportIcon } from '../../../assets/images/managment/index'
import { TablePagination } from '../../../components/managment/index'
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import ClearIcon from '@material-ui/icons/Clear';
import moment from 'moment';
import 'moment/locale/he';
import { Loader } from '../../../components/Loader/Loader';
import { setRowsPerPage } from '../../../redux/reducers/coreSlice';
import DataTable from '../../../components/Table/DataTable';
import { useNavigate } from 'react-router';
import { CLIENT_CONSTANTS } from '../../../model/Clients/Contants';
import { GetProductReports } from '../../../redux/reducers/reportSlice';
import { FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa'

const DEFAULT_FILTER = {
    PageIndex: 1,
    PageSize: 6,
    ProductName: '',
    CategoryID: [],
    IsExport: false,
    OrderBY: 0,
    OrderByParameter: "ProductName"
}

const ProductsReport = ({ classes }) => {
    const navigate = useNavigate()
    const { accountFeatures, language, windowSize, isRTL, rowsPerPage } = useSelector(state => state.core)
    const { productsReportDetails, productCategories } = useSelector(state => state.report)

    const { t } = useTranslation()
    const [filterValues, setFilterValues] = useState(DEFAULT_FILTER)
    const [isSearching, setIsSearching] = useState(true);
    const [filter, setFilter] = useState(false);
    const [page, setPage] = useState(1)

    const dispatch = useDispatch()
    const rowStyle = { head: classes.tableRowReportHead, root: clsx(classes.tableRowRoot, classes.maxHeight87) }
    const cell50wStyle = { head: clsx(classes.tableCellHead), root: clsx(classes.tableCellRoot, classes.paddingHead, classes.minWidth50) }
    const cellBodyStyle = { body: clsx(classes.tableCellBody), root: clsx(classes.tableCellRoot) }
    const noBorderCellStyle = { body: classes.tableCellBodyNoBorder, root: clsx(classes.tableCellRoot, classes.minWidth50) }
    const borderCellStyle = { body: clsx(classes.tableCellBody), root: clsx(classes.tableCellRoot, classes.minWidth50) }
    const [showLoader, setLoader] = useState(true);

    moment.locale(language)

    const GetSortIcon = (key) => {

        const handleClickSort = (order) => {
            setFilterValues({ ...filterValues, OrderByParameter: key, OrderBY: order })
            setTimeout(() => {
                setIsSearching(true)
            }, 200);
        }


        if (filterValues?.OrderBY === 0 && filterValues?.OrderByParameter === key) {
            return <FaSortAmountUp style={{ color: '#0371ad', cursor: 'pointer' }} onClick={() => handleClickSort(1)} />
        }
        else {
            return <FaSortAmountDown style={{ color: '#0371ad', cursor: 'pointer' }} onClick={() => handleClickSort(0)} />
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
        if (isSearching) {
            setLoader(true);
            dispatch(GetProductReports({ ...filterValues, PageSize: rowsPerPage }));
            setIsSearching(false)
            setLoader(false)
        }
    }, [isSearching]);


    //  HANDLERS  //
    const getHrefs = (id) => ({
        Purchased: {
            title: t('report.ProductsReport.purchased'),
            onClick: () => navigate(CLIENT_CONSTANTS.BASEURL, { state: { ...CLIENT_CONSTANTS.QUERY_PARAMS, ProductId: id, PageType: '' } }),


        },
        Abandoned: {
            title: t('report.ProductsReport.abandoned'),
            onClick: () => navigate(CLIENT_CONSTANTS.BASEURL, { state: { ...CLIENT_CONSTANTS.QUERY_PARAMS, ProductId: id, PageType: '' } }),


        },
        TotalRevenue: {
            title: 'report.ProductsReport.revenueFrmProd',
            onClick: () => navigate(CLIENT_CONSTANTS.BASEURL, { state: { ...CLIENT_CONSTANTS.QUERY_PARAMS, ProductId: id, PageType: '' } }),
        }
    })


    const handleRowsPerPageSearching = (val) => {
        dispatch(setRowsPerPage(val))
    }
    const handlePageChange = (val) => {
        setPage(val);
    }

    //  COMPONENTS  //
    const renderFilter = () => {

        return (
            <Grid
                container
                spacing={2}
                className={classes.lineTopMarging}>
                <Grid item>
                    <TextField
                        variant='outlined'
                        size='small'
                        value={filterValues.ProductName}
                        onChange={(e) => setFilterValues({ ...filterValues, ProductName: e.target.value })}
                        className={clsx(classes.textField, classes.minWidth252)}
                        placeholder={t('report.ProductsReport.prodName')}
                    />
                </Grid>

                <Grid item>
                    <FormControl variant="standard" className={classes.selectInputFormControl} style={{ width: '100%' }} >
                        <Select
                            style={{
                                height: 40
                            }}
                            placeholder={t('report.ProductsReport.category')}
                            className={clsx(classes.select, 'outerborder')}
                            labelId="category"
                            id="category"
                            multiple
                            value={filterValues.CategoryID}
                            inputProps={{
                                placeholder: t('report.ProductsReport.category'),
                                class: filterValues.CategoryID.length === 0 ? classes.selectPlaceholderInput : classes.dNone

                            }}

                            MenuProps={{
                                style: {
                                    paddingTop: 9,
                                    paddingBottom: 9
                                }
                            }}
                            renderValue={(selected) => productCategories.reduce((prev, next) => selected.indexOf(next.CategoryId) > -1 ? [...prev, next.CategoryName] : prev, []).join(', ')}
                            onChange={(e) => setFilterValues({ ...filterValues, CategoryID: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value })}
                        >
                            {
                                productCategories.map((obj, idx) =>
                                    <MenuItem key={`op${obj.CategoryId}`} value={obj.CategoryId}
                                        style={{ paddingBlockStart: 10, textAlign: isRTL ? 'right' : 'left', direction: isRTL ? 'rtl' : 'ltr' }}
                                    >
                                        <Checkbox checked={filterValues.CategoryID.indexOf(obj.CategoryId) > -1} />
                                        <ListItemText primary={t(obj.CategoryName)} />
                                    </MenuItem>
                                )
                            }
                        </Select>
                    </FormControl >
                </Grid>

                <Grid item>
                    <Button
                        size='large'
                        variant='contained'
                        onClick={() => {
                            if (filterValues.CategoryID.length > 0 || filterValues.ProductName) {
                                setIsSearching(true)
                                setFilter(true)
                            }
                        }}
                        className={classes.searchButton}
                        endIcon={<SearchIcon />}
                    >
                        {t('notifications.buttons.search')}
                    </Button>

                </Grid>
                {
                    filter && <Grid item>
                        <Button
                            size='large'
                            variant='contained'
                            onClick={() => {
                                setFilterValues(DEFAULT_FILTER)
                                setTimeout(() => {
                                    setIsSearching(true)
                                    setFilter(false)
                                }, 200);
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
        const dataLength = productsReportDetails.length;
        return (
            <Grid container spacing={2} className={classes.linePadding} >
                {accountFeatures?.indexOf('13') === -1 && windowSize !== 'xs' && <Grid item>
                    <Button
                        variant='contained'
                        size='medium'
                        className={clsx(
                            classes.actionButton,
                            classes.actionButtonGreen,
                        )}
                        onClick={() => {
                            setFilterValues({ ...filterValues, IsExport: true })
                            setTimeout(() => {
                                setIsSearching(true)
                                setFilterValues({ ...filterValues, IsExport: false })
                            }, 200);
                        }}
                        startIcon={<ExportIcon />}
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

    const renderIntData = (value, data = {}) => {
        const { title = windowSize === 'xs' ? '' : t("notifications.tblBody.total"), href = '', onClick = null } = data
        return (
            <Box style={{ display: 'flex', flexDirection: 'column' }} >
                <Typography component={'p'}
                    onClick={() => onClick?.()}
                    className={clsx(classes.middleText,
                        (onClick && value > 0) ? classes.link : '')}
                    target="_blank">
                    {value && value.toLocaleString() || '0'}
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
        } = row
        const hrefs = getHrefs(ProductId)
        return (
            <TableRow
                key={ProductId}
                classes={rowStyle}>
                <TableCell
                    classes={cellBodyStyle}
                    align='center'
                    className={clsx(classes.flex1)}>
                    <img src={ImageURL} alt={ProductName} className={classes.imgFluid} />
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
                    <Typography>{CategoryName}</Typography>
                </TableCell>
                <TableCell
                    classes={borderCellStyle}
                    align='center'
                    className={classes.flex1}>
                    {renderIntData(Price, '')}
                </TableCell>
                <TableCell
                    classes={borderCellStyle}
                    align='center'
                    className={classes.flex1}>
                    {renderIntData(Purchased, hrefs.Purchased)}
                </TableCell>
                <TableCell
                    classes={borderCellStyle}
                    align='center'
                    className={classes.flex1}>
                    {renderIntData(Abandoned, hrefs.Abandoned)}
                </TableCell>
                <TableCell
                    classes={noBorderCellStyle}
                    align='center'
                    className={classes.flex2}>
                    {renderIntData(TotalRevenue, hrefs.TotalRevenue)}
                </TableCell>
            </TableRow>
        )
    }

    const renderPhoneRow = (row) => {
        return <></>
    }

    const renderTableBody = () => {
        let rowData = productsReportDetails;

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
        return <Box className={clsx(classes.flex, classes.justifyCenterOfCenter)} style={{ height: 50 }}>
            <Typography>{t("common.NoDataTryFilter")}</Typography>
        </Box>
    }


    return (
        <DefaultScreen
            classes={classes}
            containerClass={classes.management}
            currentPage="reports"
            subPage="productsReport">
            <Typography className={classes.managementTitle}>
                {t('report.ProductsReport.title')}
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
                rows={productsReportDetails?.length ?? 0}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleRowsPerPageSearching}
                rowsPerPageOptions={[6, 10, 20, 50]}
                page={page}
                onPageChange={handlePageChange}
            />

            <Loader isOpen={showLoader} showBackdrop={true} />
        </DefaultScreen>
    )
};

export default ProductsReport;

