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
import { useDispatch, useSelector } from 'react-redux';
import { getPerformanceStats, getPopupPages, Page, deletePopup, getDeletedPopups } from '../../../../src/redux/reducers/popUpManagementSlice';
import { restoreLandingPages } from '../../../../src/redux/reducers/landingPagesSlice';
import { Title } from '../../../components/managment/Title';
import { Loader } from '../../../components/Loader/Loader';
import Toast from '../../../components/Toast/Toast.component';
import { ManagmentIcon, TablePagination, RestorDialogContent } from '../../../components/managment/index';
import PopUpCard from './PopUpCard';
import StatCard from './StatCard';
import { CopyIcon, DeleteIcon, DuplicateIcon, EditIcon, PreviewIcon, SettingIcon, ReportsIcon } from '../../../assets/images/managment';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import { sitePrefix } from '../../../config';
import { useNavigate } from 'react-router-dom';

interface PopUpManagementProps {
  classes: Record<string, string>;
}

interface ToastMessage {
  type: 'error' | 'success' | 'info';
  message: string;
}

export interface DialogType {
  type: 'delete' | 'restore';
  data: any;
}

const PopUpManagement: React.FC<PopUpManagementProps> = ({ classes }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();
  const { windowSize } = useSelector((state: any) => state.core);
  const {
    stats,
    statsLoading,
    statsError,
    pages,
    totalPages,
    currentPage,
    pagesLoading,
    pagesError,
    deletedPopups,
  } = useSelector((state: any) => state.popUpManagement);

  const [view, setView] = useState<'card' | 'table'>('card');
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
  const [dialogType, setDialogType] = useState<DialogType | null>(null);
  const [restoreArray, setRestoreArray] = useState<number[]>([]);
  const [filters, setFilters] = useState({
    SearchTerm: '',
    FilterStatus: 'All',
    SortBy: 'CreatedDate',
    SortDirection: 'DESC',
    PageNumber: 1,
    PageSize: 6,
    PageType: 5
  });


  const handleCreatePopup = () => {
    navigate(`${sitePrefix}Popups/Create`);
  };

  const isMobile = windowSize === 'xs' || windowSize === 'sm';

  useEffect(() => {
    dispatch(getPerformanceStats());
    dispatch(getPopupPages(filters));
    dispatch(getDeletedPopups());
  }, [dispatch, filters]);

  useEffect(() => {
    if (statsError) {
      setToastMessage({ type: 'error', message: statsError });
    }
    if (pagesError) {
      setToastMessage({ type: 'error', message: pagesError });
    }
  }, [statsError, pagesError]);

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
          onClick={handleCreatePopup}
        >
          {t('landingPages.popupManagement.createNew')}
        </Button>
        <Button
          variant="outlined"
          className={clsx(classes.btn, classes.btnRounded)}
          startIcon={<Restore />}
          disabled={!deletedPopups || deletedPopups.length === 0}
          onClick={() => setDialogType({ type: 'restore', data: deletedPopups })}
        >
          {t('campaigns.restoreDeleted')}
        </Button>
      </Box>
      <Box mt={3}>
        {stats ? (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                classes={classes}
                title={t('landingPages.popupManagement.statCards.totalPopups')}
                value={stats.TotalPopups.toString()}
                change={`${stats.ActiveCount} active • ${stats.InactiveCount} inactive • ${stats.DraftCount} drafts`}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                classes={classes}
                title={t('landingPages.popupManagement.statCards.viewsThisMonth')}
                value={stats.MonthlyViews.toLocaleString()}
                change={`${stats.MonthlyViewsChange > 0 ? '+' : ''}${stats.MonthlyViewsChange.toFixed(2)}% this month`}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                classes={classes}
                title={t('landingPages.popupManagement.statCards.avgConversionRate')}
                value={`${stats.AverageConversionRate.toFixed(2)}%`}
                change={`${stats.AverageConversionChange > 0 ? '+' : ''}${stats.AverageConversionChange.toFixed(2)}% this week`}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                classes={classes}
                title={t('landingPages.popupManagement.statCards.topPerforming')}
                value={stats.TopPerformer ? stats.TopPerformer.Name : 'N/A'}
                change={stats.TopPerformer ? `${stats.TopPerformer.ConversionRate.toFixed(2)}% conversion` : ''}
              />
            </Grid>
          </Grid>
        ) : null}
      </Box>
    </Box>
  );

  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, SearchTerm: searchTerm, PageNumber: 1 }));
  };

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
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (e.target.value === '') {
                  setFilters(prev => ({ ...prev, SearchTerm: '', PageNumber: 1 }));
                }
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={t('landingPages.popupManagement.searchPlaceholder')}
            />
          </Grid>
          <Grid item>
            {filterButtons.map(filter => (
              <Button
                key={filter}
                variant={filters.FilterStatus === filter ? "contained" : "text"}
                color={filters.FilterStatus === filter ? "primary" : "default"}
                className={classes.btnRounded}
                onClick={() => setFilters(prev => ({ ...prev, FilterStatus: filter, PageNumber: 1 }))}
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
            <FormControl variant="outlined" size="small" style={{ minWidth: 120, marginRight: '10px' }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={filters.SortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, SortBy: e.target.value as string }))}
                label="Sort By"
              >
                <MenuItem value="CreatedDate">Created Date</MenuItem>
                <MenuItem value="Name">Name</MenuItem>
                <MenuItem value="Views">Views</MenuItem>
                <MenuItem value="ConversionRate">Conversion Rate</MenuItem>
                <MenuItem value="LastModified">Last Modified</MenuItem>
              </Select>
            </FormControl>
            <FormControl variant="outlined" size="small" style={{ minWidth: 100 }}>
              <InputLabel>Direction</InputLabel>
              <Select
                value={filters.SortDirection}
                onChange={(e) => setFilters(prev => ({ ...prev, SortDirection: e.target.value as string }))}
                label="Direction"
              >
                <MenuItem value="ASC">ASC</MenuItem>
                <MenuItem value="DESC">DESC</MenuItem>
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

  const renderCardView = () => {
    return (
      <Grid container spacing={3}>
        {pages.map((page: Page) => (
          <Grid item xs={12} key={page.ID}>
            <PopUpCard popup={page} classes={classes} setDialogType={setDialogType} />
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderActionIcons = (page: Page) => {
    const id = page.ID;
    const { PageUrl } = page as any;
    const iconsMap = [
      // { key: "survey", uIcon: FaChartPie, lable: "Survey" },
      // { key: "purchase", uIcon: ReportsIcon, lable: "Purchase" },
      {
        key: "settings",
        uIcon: SettingIcon,
        lable: "Settings",
        onClick: () => {
          navigate(`${sitePrefix}Popups/Create/${id}`);
        }
      },
      {
        key: "preview",
        uIcon: PreviewIcon,
        lable: "Preview",
        onClick: () => {
          const previewLink = `${sitePrefix}previewer/popup/${id}`;
          window.open(previewLink, '_blank');
        }
      },
      {
        key: "edit", uIcon: EditIcon, lable: "Edit", onClick: () => {
          navigate(`${sitePrefix}popupeditor/${id}`);
        }
      },
      { key: "duplicate", uIcon: DuplicateIcon, lable: "Duplicate" },
      { key: "copy", uIcon: CopyIcon, lable: "Copy" },
      { key: "embed", uIcon: CopyIcon, lable: "Embed" },
      {
        key: "delete",
        uIcon: DeleteIcon,
        lable: "Delete",
        onClick: () => {
          setDialogType({
            type: 'delete',
            data: id
          })
        }
      },
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

  const renderDesktopTableRow = (page: Page) => {
    const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot };
    const cellStyle = { head: classes.tableCellHead, body: classes.tableCellBody, root: classes.tableCellRoot };

    return (
      <TableRow key={page.ID} classes={rowStyle} className={classes.tableBodyRow}>
        <TableCell classes={cellStyle} className={clsx(classes.flex2)}>
          <Typography variant="h5" className={classes.f22}>
            {page.Name}
          </Typography>
          <Typography variant="body1">
            {page.Domains.join(', ')}
          </Typography>
        </TableCell>
        <TableCell classes={cellStyle} className={classes.flex1}>
          <Typography variant="body1">
            {page.AllViews?.toLocaleString() ?? 'N/A'}
          </Typography>
          <Typography variant="body1">
            ({page.StatusName})
          </Typography>
        </TableCell>
        <TableCell classes={cellStyle} className={classes.flex1}>
          {page.IdentifiedViewers?.toLocaleString() ?? 'N/A'}
        </TableCell>
        <TableCell classes={cellStyle} className={classes.flex1}>{page.Conversions?.toLocaleString() ?? 'N/A'}{'/'}{page.ConversionRate ? `${page.ConversionRate}%` : 'N/A'}</TableCell>
        <TableCell classes={cellStyle} className={clsx(classes.flex3, classes.tableActionContainerCell)}>{renderActionIcons(page)}</TableCell>
      </TableRow>
    );
  }

  const renderMobileTableRow = (page: Page) => (
    <TableRow key={page.ID} component="div" classes={{ root: classes.tableRowRoot }}>
      <TableCell style={{ flex: 1 }} classes={{ root: clsx(classes.tableCellRoot, classes.tabelCellPadding) }}>
        <Box p={2}>
          <Typography variant="h6" gutterBottom>
            {page.Name}
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {page.Domains.join(', ')}
          </Typography>
          <Typography variant="body2">{t('landingPages.popupManagement.tableHeaders.status')}: {page.StatusName}</Typography>
          <Box mt={2}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption">{t('landingPages.popupManagement.tableHeaders.allViewers')}</Typography>
                <Typography>
                  {page.AllViews?.toLocaleString() ?? 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption">{t('landingPages.popupManagement.tableHeaders.identifiedViewers')}</Typography>
                <Typography>
                  {page.IdentifiedViewers?.toLocaleString() ?? 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption">{t('landingPages.popupManagement.tableHeaders.conversions')}</Typography>
                <Typography>
                  {page.Conversions?.toLocaleString() ?? 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption">{t('landingPages.popupManagement.tableHeaders.conversionRate')}</Typography>
                <Typography>
                  {page.ConversionRate
                    ? `${page.ConversionRate}%`
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
            {pages.map(
              isMobile ? renderMobileTableRow : renderDesktopTableRow
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderContent = () => {
    if (pagesLoading) {
      return <Loader isOpen={true} />;
    }

    if (pages.length === 0) {
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

  const renderToast = () => {
    if (toastMessage) {
      setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return (
        <Toast data={toastMessage} />
      );
    }
    return null;
  }

  const handleClose = () => {
    setDialogType(null);
  }

  const handleChange = (id: number) => () => {
    const found = restoreArray.includes(id);
    if (found) {
      setRestoreArray(restoreArray.filter(restore => restore !== id));
    } else {
      setRestoreArray([...restoreArray, id]);
    }
  }

  const getRestorDialog = (data: Page[] = []) => {
    if (!data || !Array.isArray(data)) return null;

    return {
      title: t('landingPages.popupManagement.restorePopupTitle'),
      showDivider: false,
      icon: (
        <div className={clsx(classes.dialogIconContent, 'unicode')}>
          {'\uE185'}
        </div>
      ),
      content: (
        <RestorDialogContent
          classes={classes}
          data={data as any}
          currentChecked={restoreArray as any}
          onChange={handleChange}
          dataIdVar='ID'
        />
      ),
      onConfirm: async () => {
        handleClose();
        await dispatch((restoreLandingPages as any)(restoreArray));
        dispatch(getPopupPages(filters));
        setRestoreArray([]);
      }
    }
  }

  const getDeleteDialog = (data?: string | number) => ({
    title: t('landingPages.GridButtonColumnResource1.ConfirmTitle'),
    showDivider: false,
    content: (
      <Typography style={{ fontSize: 18 }}>
        {t('landingPages.GridButtonColumnResource1.ConfirmText')}
      </Typography>
    ),
    onConfirm: async () => {
      if (data) {
        handleClose()
        await dispatch(deletePopup(data as number))
      }
    }
  })

  const renderDialog = () => {
    if (!dialogType) {
      return null;
    }

    const { data, type } = dialogType;
    const dialogContent = {
      delete: getDeleteDialog(data),
      restore: getRestorDialog(data)
    }

    const currentDialog = dialogContent[type];
    if (!currentDialog) return null;
    return (
      <BaseDialog
        classes={classes}
        open={!!dialogType}
        onClose={handleClose}
        onCancel={handleClose}
        {...currentDialog}>
        {currentDialog.content}
      </BaseDialog>
    )
  }

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
        rows={totalPages * filters.PageSize}
        rowsPerPage={filters.PageSize}
        onRowsPerPageChange={(val) => {
          setFilters(prev => ({ ...prev, PageSize: val, PageNumber: 1 }));
        }}
        // @ts-ignore
        rowsPerPageOptions={[6, 12, 18]}
        page={filters.PageNumber}
        onPageChange={(p) => setFilters(prev => ({ ...prev, PageNumber: p }))}
      />
      <Loader isOpen={statsLoading || pagesLoading} />
      {renderToast()}
      {renderDialog()}
    </DefaultScreen>
  );
};

export default PopUpManagement;