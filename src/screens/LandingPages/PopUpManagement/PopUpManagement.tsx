import React, { useState, useEffect } from 'react';
import DefaultScreen from '../../DefaultScreen';
import clsx from 'clsx';
import {
    Typography,
    Grid,
    Button,
    TextField,
    Box,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
} from '@material-ui/core';
import { ViewModule, ViewList, Add, Restore } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Title } from '../../../components/managment/Title';
import { ManagmentIcon, TablePagination } from '../../../components/managment/index';
import PopUpCard, { PopUp } from './PopUpCard';
import StatCard from './StatCard';
import { CopyIcon, DeleteIcon, DuplicateIcon, EditIcon, PreviewIcon, SettingIcon, ReportsIcon } from '../../../assets/images/managment';
import { FaChartPie } from 'react-icons/fa';

// Mock Data based on the reference image
const mockPopUps: PopUp[] = [
    {
        id: 1,
        title: 'Winter Sale 2025 - 30% Off Everything',
        url: 'www.example-store.co.il',
        status: 'Active',
        stats: {
            allViewers: 12450,
            identifiedViewers: 8234,
            conversions: 771,
            conversionRate: 6.2,
            mobileViewer: 10,
            desktopViewer: 20
        },
    },
    {
        id: 2,
        title: 'Newsletter Signup - Get 10% Off',
        url: 'www.fashion-boutique.co.il',
        status: 'Active',
        stats: {
            allViewers: 8923,
            identifiedViewers: 4120,
            conversions: 312,
            conversionRate: 3.5,
            mobileViewer: 10,
            desktopViewer: 20
        },
    },
    {
        id: 3,
        title: 'Exit Intent - Wait!',
        url: 'www.cool-gadgets.co.il',
        status: 'Inactive',
        stats: {
            allViewers: 24309,
            identifiedViewers: 7293,
            conversions: 389,
            conversionRate: 1.6,
            mobileViewer: 10,
            desktopViewer: 20,
        },
    },
    {
        id: 4,
        title: 'Spring Sale 2025 (Draft)',
        url: 'www.kitchen-market.co.il',
        status: 'Draft',
        stats: {
            allViewers: null,
            identifiedViewers: null,
            conversions: null,
            conversionRate: null,
            mobileViewer: 10,
            desktopViewer: 20
        },
    },
    // Add more items to test pagination
    { id: 5, title: 'Summer Promo', url: 'www.summer-fun.com', status: 'Active', stats: { allViewers: 1000, identifiedViewers: 500, conversions: 50, conversionRate: 5, mobileViewer: 10, desktopViewer: 20 } },
    { id: 6, title: 'Black Friday Teaser', url: 'www.deals-galore.com', status: 'Draft', stats: { allViewers: null, identifiedViewers: null, conversions: null, conversionRate: null, mobileViewer: 10, desktopViewer: 20 } },
    { id: 7, title: 'Holiday Special', url: 'www.holiday-shop.com', status: 'Inactive', stats: { allViewers: 50000, identifiedViewers: 20000, conversions: 1000, conversionRate: 2, mobileViewer: 10, desktopViewer: 20 } },
    { id: 8, title: 'New Year Blast', url: 'www.new-year.com', status: 'Active', stats: { allViewers: 25000, identifiedViewers: 10000, conversions: 800, conversionRate: 3.2, mobileViewer: 10, desktopViewer: 20 } },
    { id: 9, title: 'Valentine Love', url: 'www.love-is-in-the-air.com', status: 'Active', stats: { allViewers: 15000, identifiedViewers: 8000, conversions: 1200, conversionRate: 8, mobileViewer: 10, desktopViewer: 20 } },
    { id: 10, title: 'Easter Hunt', url: 'www.easter-eggs.com', status: 'Inactive', stats: { allViewers: 5000, identifiedViewers: 1000, conversions: 50, conversionRate: 1, mobileViewer: 10, desktopViewer: 20 } },
];

interface PopUpManagementProps {
    classes: Record<string, string>;
}

const PopUpManagement: React.FC<PopUpManagementProps> = ({ classes }) => {
    const { t } = useTranslation();
    const { windowSize } = useSelector((state: any) => state.core);
    const [view, setView] = useState<'card' | 'table'>('card');
    const [searchText, setSearchText] = useState('');
    const [filteredPopUps, setFilteredPopUps] = useState<PopUp[]>(mockPopUps);
    const [isSearching, setIsSearching] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');
    const [sortOrder, setSortOrder] = useState('asc');
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(6);

    const isMobile = windowSize === 'xs' || windowSize === 'sm';

    useEffect(() => {
        let popups: PopUp[] = [...mockPopUps];

        // Filtering logic
        if (activeFilter !== 'All') {
            popups = popups.filter(p => p.status === activeFilter);
        }

        // Sorting logic
        popups = popups.sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.title.localeCompare(b.title);
            } else {
                return b.title.localeCompare(a.title);
            }
        });

        // Searching logic
        if (isSearching && searchText) {
            const lowercasedSearchText = searchText.toLowerCase();
            popups = popups.filter(
                (popup) =>
                    popup.title.toLowerCase().includes(lowercasedSearchText) ||
                    popup.url.toLowerCase().includes(lowercasedSearchText)
            );
        }


        setFilteredPopUps(popups);
        setPage(1); // Reset to first page whenever filters change
    }, [activeFilter, sortOrder, isSearching, searchText]);

    const handleSearch = () => {
        setIsSearching(true);
    };

    const clearSearch = () => {
        setSearchText('');
        setIsSearching(false);
    };

    const renderTopSection = () => (
        <Box>
            <Box pt={4}>
                <Title
                    Text={t('landingPages.popupManagement.title')}
                    classes={classes}
                />
            </Box>
            <Box pt={3} className={classes.responsiveActions}>
                <Button
                    variant="contained"
                    color="primary"
                    className={clsx(classes.btn, classes.btnRounded, classes.mr10)}
                    startIcon={<Add />}
                >
                    {t('landingPages.popupManagement.createNew')}
                </Button>
                <Button
                    variant="outlined"
                    className={clsx(classes.btn, classes.btnRounded)}
                    startIcon={<Restore />}
                >
                    {t('campaigns.restoreDeleted')}
                </Button>
            </Box>
            <Box mt={3}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            classes={classes}
                            title={t('landingPages.popupManagement.statCards.totalPopups')}
                            value="12"
                            change="7 active • 2 inactive • 2 drafts"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            classes={classes}
                            title={t('landingPages.popupManagement.statCards.viewsThisMonth')}
                            value="45,682"
                            change="+1.2% this month"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            classes={classes}
                            title={t('landingPages.popupManagement.statCards.avgConversionRate')}
                            value="3.8%"
                            change="-0.3% this week"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            classes={classes}
                            title={t('landingPages.popupManagement.statCards.topPerforming')}
                            value="Winter Sale"
                            change="30% conversion"
                        />
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );

    const renderSearchAndFilterSection = () => {
        const filterButtons = ['All', 'Active', 'Inactive', 'Draft'];

        return (
            <Box className={classes.topSection} mt={3} p={1}>
                <Grid className={clsx(classes.popupCard, classes.p10)} container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder={t('landingPages.popupManagement.searchPlaceholder')}
                        />
                    </Grid>
                    <Grid item>
                        {filterButtons.map(filter => (
                            <Button
                                key={filter}
                                variant={activeFilter === filter ? "contained" : "text"}
                                color={activeFilter === filter ? "primary" : "default"}
                                className={classes.btnRounded}
                                onClick={() => setActiveFilter(filter)}
                                style={{ marginRight: '5px' }}
                            >
                                {t(`landingPages.popupManagement.filters.${filter.toLowerCase()}`)}
                            </Button>
                        ))}
                    </Grid>
                    <Grid item xs>
                        {/* Spacer */}
                    </Grid>
                    <Grid item>
                        <FormControl variant="outlined" size="small" style={{ minWidth: 120 }}>
                            <InputLabel>Sort By</InputLabel>
                            <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as string)} label="Sort By">
                                <MenuItem value="asc">Name A-Z</MenuItem>
                                <MenuItem value="desc">Name Z-A</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item>
                        <IconButton onClick={() => setView('card')} color={view === 'card' ? 'primary' : 'default'}>
                            <ViewModule />
                        </IconButton>
                        <IconButton onClick={() => setView('table')} color={view === 'table' ? 'primary' : 'default'}>
                            <ViewList />
                        </IconButton>
                    </Grid>
                </Grid>
            </Box>
        );
    };

    const currentPopups = filteredPopUps.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    const renderCardView = () => {
        return (
            <Grid container spacing={3}>
                {currentPopups.map((popup) => (
                    <Grid item xs={12} key={popup.id}>
                        <PopUpCard popup={popup} classes={classes} />
                    </Grid>
                ))}
            </Grid>
        );
    };

    const renderActionIcons = () => {
        const iconsMap = [
            // { key: "survey", uIcon: FaChartPie, lable: "Survey" },
            // { key: "purchase", uIcon: ReportsIcon, lable: "Purchase" },
            { key: "settings", uIcon: SettingIcon, lable: "Settings" },
            { key: "preview", uIcon: PreviewIcon, lable: "Preview" },
            { key: "edit", uIcon: EditIcon, lable: "Edit" },
            { key: "duplicate", uIcon: DuplicateIcon, lable: "Duplicate" },
            { key: "copy", uIcon: CopyIcon, lable: "Copy" },
            { key: "embed", uIcon: CopyIcon, lable: "Embed" },
            { key: "delete", uIcon: DeleteIcon, lable: "Delete" },
        ];

        return (
            <Grid container justifyContent="center">
                {iconsMap.map(icon => (
                    <Grid
                        className={clsx('rowIconContainer', classes.actionIconsContainer)}
                        key={icon.key}
                        item >
                        <ManagmentIcon
                            classes={classes}
                            {...icon}
                            icon={null}
                            uIcon={<icon.uIcon width={18} height={20} className={'rowIcon'} />}
                        />
                    </Grid>
                ))}
            </Grid>
        );

    }

    const renderDesktopTableRow = (popup: PopUp) => {
        const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot };
        const cellStyle = { head: classes.tableCellHead, body: classes.tableCellBody, root: classes.tableCellRoot };

        return (
            <TableRow key={popup.id} classes={rowStyle} className={classes.tableBodyRow}>
                <TableCell classes={cellStyle} className={clsx(classes.flex2)}>
                    <Typography variant="h5" className={classes.f22}>
                        {popup.title}
                    </Typography>
                    <Typography variant="body1">
                        {popup.url}
                    </Typography>
                </TableCell>
                <TableCell classes={cellStyle} className={classes.flex1}>
                    <Typography variant="body1">
                        {popup.stats.allViewers?.toLocaleString() ?? 'N/A'}
                    </Typography>
                    <Typography variant="body1">
                        ({popup.status})
                    </Typography>
                </TableCell>
                <TableCell classes={cellStyle} className={classes.flex1}>
                    {popup.stats.identifiedViewers?.toLocaleString() ?? 'N/A'}
                </TableCell>
                <TableCell classes={cellStyle} className={classes.flex1}>{popup.stats.conversions?.toLocaleString() ?? 'N/A'}{'/'}{popup.stats.conversionRate ? `${popup.stats.conversionRate}%` : 'N/A'}</TableCell>
                <TableCell classes={cellStyle} className={clsx(classes.flex3, classes.tableActionContainerCell)}>{renderActionIcons()}</TableCell>
            </TableRow>
        );
    }

    const renderMobileTableRow = (popup: PopUp) => (
        <TableRow key={popup.id} component="div" classes={{ root: classes.tableRowRoot }}>
            <TableCell style={{ flex: 1 }} classes={{ root: clsx(classes.tableCellRoot, classes.tabelCellPadding) }}>
                <Box p={2}>
                    <Typography variant="h6" gutterBottom>
                        {popup.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                        {popup.url}
                    </Typography>
                    <Typography variant="body2">{t('landingPages.popupManagement.tableHeaders.status')}: {popup.status}</Typography>
                    <Box mt={2}>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="caption">{t('landingPages.popupManagement.tableHeaders.allViewers')}</Typography>
                                <Typography>
                                    {popup.stats.allViewers?.toLocaleString() ?? 'N/A'}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption">{t('landingPages.popupManagement.tableHeaders.identifiedViewers')}</Typography>
                                <Typography>
                                    {popup.stats.identifiedViewers?.toLocaleString() ?? 'N/A'}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption">{t('landingPages.popupManagement.tableHeaders.conversions')}</Typography>
                                <Typography>
                                    {popup.stats.conversions?.toLocaleString() ?? 'N/A'}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption">{t('landingPages.popupManagement.tableHeaders.conversionRate')}</Typography>
                                <Typography>
                                    {popup.stats.conversionRate
                                        ? `${popup.stats.conversionRate}%`
                                        : 'N/A'}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </TableCell>
        </TableRow>
    );

    const renderTableView = () => {
        const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot };
        const cellStyle = { head: classes.tableCellHead, body: classes.tableCellBody, root: classes.tableCellRoot };

        return (
            <TableContainer className={classes.tableStyle}>
                <Table className={classes.tableContainer}>
                    {!isMobile && (
                        <TableHead>
                            <TableRow classes={rowStyle} className={classes.alignItemsCenter}>
                                <TableCell align='center' classes={cellStyle} className={classes.flex2}>
                                    <div>{t('landingPages.popupManagement.tableHeaders.title')}</div>
                                    <div>({(t('landingPages.popupManagement.tableHeaders.url'))})</div>
                                </TableCell>
                                <TableCell align='center' classes={cellStyle} className={classes.flex1}>
                                    <div>{t('landingPages.popupManagement.tableHeaders.allViewers')}</div>
                                    <div>({t('landingPages.popupManagement.tableHeaders.status')})</div>
                                </TableCell>
                                <TableCell align='center' classes={cellStyle} className={classes.flex1}>
                                    {t('landingPages.popupManagement.tableHeaders.identifiedViewers')}
                                </TableCell>
                                <TableCell align="center" classes={cellStyle} className={classes.flex1}>
                                    {`${t('landingPages.popupManagement.tableHeaders.conversions')} / ${t('landingPages.popupManagement.tableHeaders.conversionRate')}`}
                                </TableCell>
                                <TableCell align='center' classes={cellStyle} className={clsx(classes.flex3, classes.tableActionContainerCell)}>
                                    {t('landingPages.popupManagement.tableHeaders.actions')}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                    )}
                    <TableBody>
                        {currentPopups.map(
                            isMobile ? renderMobileTableRow : renderDesktopTableRow
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    const renderContent = () => {
        if (filteredPopUps.length === 0) {
            return (
                <Box textAlign="center" py={5}>
                    <Typography>{t('common.NoDataTryFilter')}</Typography>
                </Box>
            );
        }

        if (view === 'card') {
            return renderCardView();
        } else {
            return renderTableView();
        }
    };

    return (
        <DefaultScreen
            currentPage="landingPages"
            classes={classes}
            containerClass={clsx(classes.management, classes.mb50)}
        >
            {renderTopSection()}

            {renderSearchAndFilterSection()}
            <Box mt={3}>{renderContent()}</Box>
            <TablePagination
                classes={classes}
                rows={filteredPopUps.length}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(val) => {
                    setRowsPerPage(val);
                    setPage(1);
                }}
                // @ts-ignore
                rowsPerPageOptions={[6, 12, 18]}
                page={page}
                onPageChange={setPage}
            />
        </DefaultScreen>
    );
};

export default PopUpManagement;