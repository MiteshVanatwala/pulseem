import { useState, useEffect } from 'react';
import clsx from 'clsx';
import {
    Box, Button, TextField, InputAdornment, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TablePagination, Typography, Tooltip, Chip, Card, CardContent,
    FormControlLabel, Switch
} from '@material-ui/core';
import { Search } from '@material-ui/icons';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { Loader } from '../../components/Loader/Loader';
import { ClassesType } from '../Classes.types';
import { DateFormats } from '../../helpers/Constants';
import { SetPageState, GetPageNyName } from '../../helpers/UI/SessionStorageManager';
import useRedirect from '../../helpers/Routes/Redirect';
import { sitePrefix } from '../../config';
import { getSmartSendList } from '../../redux/reducers/smartSendSlice';
import { SmartSendListItem, eSendChannel, getChannelDescriptor } from '../../Models/DataSources/SmartSend';
import { eCampaignStatus } from '../../Models/Enums/Campaign';

// Own page-state key so this tab's page/search/filter never collide with the sources tab's
// 'DataSources' key (SessionStorageManager keys by PageName — different names never overwrite).
const PAGE_NAME_SS = 'DataSourcesSmartSend';
// Mirror of DataSources.tsx ROWS_OPTIONS (this is a separate module — same options, no shared const).
const ROWS_OPTIONS = [6, 10, 20, 50];

// Replicated from CampaignPicker.STATUS_KEY (that const is module-private) so the tab and the
// campaign picker can never disagree about what a campaign status is called. Same 7 statuses,
// same i18n keys (common.* / campaigns.*, which already exist and NewsletterManagment uses too).
const STATUS_KEY: { [k: number]: string } = {
    [eCampaignStatus.Created]: 'common.Created',
    [eCampaignStatus.Sending]: 'common.Sending',
    [eCampaignStatus.Stopped]: 'campaigns.Stopped',
    [eCampaignStatus.Finished]: 'common.Sent',
    [eCampaignStatus.Canceled]: 'campaigns.Canceled',
    [eCampaignStatus.OptinPending]: 'campaigns.Optin',
    [eCampaignStatus.ApprovePending]: 'campaigns.Approve',
};

const SmartSendManageTab = ({ classes }: ClassesType) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const Redirect = useRedirect();
    const { windowSize, rowsPerPage } = useSelector((s: any) => s.core);
    const { smartSendList, smartSendListStatus } = useSelector((s: any) => s.smartSend);

    const restored = GetPageNyName(PAGE_NAME_SS);
    // Clamp a restored page-size that isn't in ROWS_OPTIONS (the shared rowsPerPage cookie may hold a
    // value other screens use) so MUI TablePagination never gets an out-of-range value — as DataSources does.
    const restoredSize = restored?.SearchData?.PageSize;
    const initialPageSize = ROWS_OPTIONS.indexOf(restoredSize) > -1 ? restoredSize
        : (ROWS_OPTIONS.indexOf(rowsPerPage) > -1 ? rowsPerPage : 6);
    const [searchData, setSearchData] = useState({
        PageIndex: restored?.PageNumber ?? 1,
        PageSize: initialPageSize,
        SearchTerm: restored?.SearchData?.SearchTerm ?? '',
        OutdatedOnly: restored?.SearchData?.OutdatedOnly ?? false
    });
    const [searchInput, setSearchInput] = useState(searchData.SearchTerm);
    const [loading, setLoading] = useState(false);

    const items: SmartSendListItem[] = smartSendList?.items ?? [];
    const total: number = smartSendList?.total ?? 0;

    // ── load on searchData change + persist page state (own key) ──
    useEffect(() => {
        loadList();
        SetPageState({
            PageName: PAGE_NAME_SS,
            PageNumber: searchData.PageIndex,
            SearchData: { SearchTerm: searchData.SearchTerm, PageSize: searchData.PageSize, OutdatedOnly: searchData.OutdatedOnly },
            SearchTerm: searchData.SearchTerm,
            IsDynamic: false
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchData]);

    const loadList = async () => {
        setLoading(true);
        const res: any = await dispatch(getSmartSendList({
            search: searchData.SearchTerm,
            outdatedOnly: searchData.OutdatedOnly,
            channel: eSendChannel.EMAIL,           // v1: EMAIL is the only wired channel
            pageSize: searchData.PageSize,
            rowsToSkip: (searchData.PageIndex - 1) * searchData.PageSize
        }));
        setLoading(false);
        // A restored page index can exceed the current page count (data shrank) → snap back to page 1
        // (mirrors DataSources.loadList).
        const data = res?.payload?.Data;
        if (data && (data.items?.length ?? 0) === 0 && (data.total ?? 0) > 0 && searchData.PageIndex > 1) {
            setSearchData(s => ({ ...s, PageIndex: 1 }));
        }
    };

    // ── handlers (mirror DataSources) ──
    const doSearch = () => setSearchData(s => ({ ...s, SearchTerm: searchInput.trim(), PageIndex: 1 }));
    const clearSearch = () => { setSearchInput(''); setSearchData(s => ({ ...s, SearchTerm: '', PageIndex: 1 })); };
    const changePage = (_: any, page: number) => setSearchData(s => ({ ...s, PageIndex: page + 1 }));
    const changeRows = (e: any) => setSearchData(s => ({ ...s, PageSize: parseInt(e.target.value, 10), PageIndex: 1 }));
    const toggleOutdated = (e: any) => setSearchData(s => ({ ...s, OutdatedOnly: e.target.checked, PageIndex: 1 }));
    // Distinguish "no data yet" from "no match": when a search term OR the outdatedOnly filter is
    // active, an empty grid means "no results" — and the reset must clear BOTH (the toolbar's
    // clearSearch clears only the term).
    const hasFilter = !!searchData.SearchTerm || searchData.OutdatedOnly;
    const resetFilters = () => { setSearchInput(''); setSearchData(s => ({ ...s, SearchTerm: '', OutdatedOnly: false, PageIndex: 1 })); };

    // The version chip is the ONLY entry into the mapping screen from this tab (§7.3): amber +
    // clickable when a newer source version exists, otherwise plain text. Same route as SmartSendPicker.
    const goToMapping = (campaignId: number) =>
        Redirect({ url: `${sitePrefix}Campaigns/SmartSend/${campaignId}`, openNewTab: false });

    // ── cell renderers ──
    const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot };
    const cellStyle = { head: classes.tableCellHead, body: classes.tableCellBody, root: classes.tableCellRoot };

    const renderStatusChip = (status: number) => {
        const key = STATUS_KEY[status];
        return key ? <Chip size="small" label={t(key)} /> : null;
    };

    const renderVersionChip = (row: SmartSendListItem) => {
        if (row.IsOutdated) {
            return (
                <Tooltip title={t('DataSources.send.stale.title')}>
                    <Chip
                        size="small"
                        clickable
                        onClick={() => goToMapping(row.CampaignID)}
                        label={t('DataSources.send.manage.staleChip', { mapped: row.MappedVersionNumber, latest: row.LatestVersionNumber })}
                        style={{ backgroundColor: '#FEF0C7', color: '#B54708', fontWeight: 700, direction: 'ltr' }}
                    />
                </Tooltip>
            );
        }
        return <Typography style={{ direction: 'ltr' }}>{`V${row.MappedVersionNumber}`}</Typography>;
    };

    const channelLabel = (channel: number) => t(getChannelDescriptor(channel as eSendChannel).labelKey);

    const updatedText = (row: SmartSendListItem) =>
        row.LastUpdated ? moment(row.LastUpdated).format(DateFormats.DATE_TIME_24) : '—';

    // PK is (CampaignID, Channel) — key on both so a future SMS row for the same campaign is distinct.
    const rowKey = (row: SmartSendListItem) => `${row.CampaignID}-${row.Channel}`;

    const renderRow = (row: SmartSendListItem) => (
        <TableRow key={rowKey(row)} classes={rowStyle}>
            <TableCell classes={cellStyle} align="center" className={clsx(classes.flex3)}>
                <Typography style={{ fontWeight: 600 }}>{row.CampaignName}</Typography>
            </TableCell>
            <TableCell classes={cellStyle} align="center" className={clsx(classes.flex2)}>{renderStatusChip(row.CampaignStatus)}</TableCell>
            <TableCell classes={cellStyle} align="center" className={clsx(classes.flex2)}>{row.DataSourceName}</TableCell>
            <TableCell classes={cellStyle} align="center" className={clsx(classes.flex2)}>{renderVersionChip(row)}</TableCell>
            <TableCell classes={cellStyle} align="center" className={clsx(classes.flex1)}>{channelLabel(row.Channel)}</TableCell>
            <TableCell classes={cellStyle} align="center" className={clsx(classes.flex2, classes.noBorderOnLastCell)} style={{ direction: 'ltr' }}>
                {updatedText(row)}
            </TableCell>
        </TableRow>
    );

    const renderPhoneRow = (row: SmartSendListItem) => (
        <TableRow key={rowKey(row)} classes={rowStyle}>
            <TableCell classes={cellStyle} align="right" style={{ display: 'block' }}>
                <Card variant="outlined" style={{ marginBottom: 8 }}>
                    <CardContent>
                        <Typography style={{ fontWeight: 600 }}>{row.CampaignName}</Typography>
                        <Typography style={{ fontSize: 12, color: '#5b6b7b' }}>{row.DataSourceName}</Typography>
                        <Box style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                            {renderStatusChip(row.CampaignStatus)}
                            {renderVersionChip(row)}
                            <Chip size="small" variant="outlined" label={channelLabel(row.Channel)} />
                        </Box>
                        <Typography style={{ marginTop: 8, fontSize: 12, color: '#5b6b7b', direction: 'ltr' }}>{updatedText(row)}</Typography>
                    </CardContent>
                </Card>
            </TableCell>
        </TableRow>
    );

    const renderTableHead = () => (
        <TableHead>
            <TableRow classes={rowStyle}>
                <TableCell classes={cellStyle} className={clsx(classes.flex3)} align="center">{t('DataSources.send.manage.columns.campaign')}</TableCell>
                <TableCell classes={cellStyle} className={clsx(classes.flex2)} align="center">{t('DataSources.send.manage.columns.status')}</TableCell>
                <TableCell classes={cellStyle} className={clsx(classes.flex2)} align="center">{t('DataSources.send.manage.columns.source')}</TableCell>
                <TableCell classes={cellStyle} className={clsx(classes.flex2)} align="center">{t('DataSources.send.manage.columns.version')}</TableCell>
                <TableCell classes={cellStyle} className={clsx(classes.flex1)} align="center">{t('DataSources.send.manage.columns.channel')}</TableCell>
                <TableCell classes={cellStyle} className={clsx(classes.flex2, classes.noBorderOnLastCell)} align="center">{t('DataSources.send.manage.columns.updated')}</TableCell>
            </TableRow>
        </TableHead>
    );

    const renderEmptyState = () => (
        <Box style={{ textAlign: 'center', padding: '48px 16px', color: '#5b6b7b' }}>
            <Typography style={{ fontSize: 18, fontWeight: 600 }}>
                {t(hasFilter ? 'DataSources.send.picker.noResults' : 'DataSources.send.manage.empty')}
            </Typography>
            {hasFilter && <Button onClick={resetFilters} style={{ marginTop: 12 }}>{t('DataSources.clearSearch')}</Button>}
        </Box>
    );

    const renderTable = () => {
        // `smartSendList` stays null until the first GetList resolves — avoids flashing the empty state on mount.
        if (smartSendList && !loading && items.length === 0) return renderEmptyState();
        return (
            <>
                <TableContainer className={classes.tableStyle}>
                    <Table className={classes.tableContainer}>
                        {windowSize !== 'xs' && renderTableHead()}
                        <TableBody>
                            {items.map(windowSize === 'xs' ? renderPhoneRow : renderRow)}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={total}
                    page={Math.max(0, searchData.PageIndex - 1)}
                    onPageChange={changePage}
                    rowsPerPage={searchData.PageSize}
                    onRowsPerPageChange={changeRows}
                    rowsPerPageOptions={ROWS_OPTIONS}
                />
            </>
        );
    };

    return (
        <Box>
            <Box style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '12px 0', flexWrap: 'wrap' }}>
                <TextField
                    variant="outlined"
                    label={t('DataSources.send.picker.searchPlaceholder')}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') doSearch(); }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
                    size="small"
                    style={{ minWidth: 320 }}
                />
                <Button onClick={doSearch} variant="outlined">{t('common.search')}</Button>
                {searchData.SearchTerm && <Button onClick={clearSearch}>{t('DataSources.clearSearch')}</Button>}
                <FormControlLabel
                    control={<Switch color="primary" checked={searchData.OutdatedOnly} onChange={toggleOutdated} />}
                    label={t('DataSources.send.manage.outdatedOnly')}
                />
            </Box>

            {renderTable()}

            <Loader isOpen={loading && smartSendListStatus === 'loading'} />
        </Box>
    );
};

export default SmartSendManageTab;
