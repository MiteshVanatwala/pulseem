import React, { useState, useEffect } from 'react';
import DefaultScreen from '../../DefaultScreen';
import clsx from 'clsx';
import uniqid from 'uniqid';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Grid, 
  Table, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell, 
  TableContainer, 
  Typography,
  Card,
  CardContent
} from '@material-ui/core';
import { FaFileExcel } from 'react-icons/fa';
import { TablePagination } from '../../../components/managment';
import { Title } from '../../../components/managment/Title';
import { Loader } from '../../../components/Loader/Loader';
import { getLinksClicksReport, exportLinksClicksReport, exportLinkClicksData } from '../../../redux/reducers/linksClicksReportSlice';
import { ExportFile } from '../../../helpers/Export/ExportFile';
import { ExportFileTypes } from '../../../model/Export/ExportFileTypes';
import ConfirmRadioDialog from '../../../components/DialogTemplates/ConfirmRadioDialog';
import { CLIENT_CONSTANTS } from '../../../model/Clients/Contants';
import { ExportIcon } from '../../../assets/images/managment';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { setRowsPerPage } from '../../../redux/reducers/coreSlice';
import { getLanguageCulture } from '../../../helpers/Utils/TextHelper';

// Define the interface for each link click item
interface LinkClickItem {
  LinkID: number;
  Url: string;
  CampaignID: number;
  ClickCount: number;
  ClickUniq: number;
  ClickVerified: number;
}

const LinkClickReport = ({ classes }: any) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  
  // Redux state
  const { linksClicksData, loading, error } = useSelector((state: any) => state.linksClicksReportSlice);
  const { windowSize, isRTL, userRoles, rowsPerPage, language } = useSelector((state: any) => state.core);
  const { accountFeatures } = useSelector((state: any) => state.common);
  
  // Local state
  const [showLoader, setShowLoader] = useState<boolean>(false);
  const [dialogType, setDialogType] = useState<any>(null);
  const [page, setPage] = useState<number>(1);
  
  const { type, campaignId, isVerified, isParent } = location.state || {};

  // Table styles
  const rowStyle = { head: classes.tableRowReportHead, root: clsx(classes.tableRowRoot) };
  const cellStyle = { head: classes.tableCellHead, root: clsx(classes.tableCellRoot) };
  const cellBodyStyle = { body: clsx(classes.tableCellBody), root: clsx(classes.tableCellRoot) };
  
  // Row options for pagination
  const rowsOptions = [10, 20, 50, 100];
  const canExport = !userRoles?.HideRecipients && (!accountFeatures || !accountFeatures.includes(13));
  
  useEffect(() => {
    if (campaignId) {
      loadData();
    }
    
    // Cleanup on unmount
    // return () => {
    //   dispatch(clearLinksClicksReport());
    // };
  }, [campaignId]);
  
  const loadData = async () => {
    setShowLoader(true);
    try {
      await dispatch(getLinksClicksReport({
        CampaignID: parseInt(campaignId || ''),
        IsParent: !!isParent,
        IsVerified: !!isVerified,
        type: type
      }) as any);
    } catch (error) {
      console.error('Error loading links clicks report:', error);
    } finally {
      setShowLoader(false);
    }
  };
  
  const handleExportClick = () => {
    setDialogType({ type: 'exportFormat' });
  };
  
  const handleExportRow = async (linkId: number) => {
    setShowLoader(true);
    
    try {
      // Call the individual link export API
      const response = await dispatch(exportLinkClicksData({
        linkId: linkId,
        campaignId: parseInt(campaignId || ''),
        Culture: getLanguageCulture(language),
        type: type
      }) as any);
      
      if (response?.payload && !response.error) {
        const exportData = response.payload;
        
        // Transform the data for export
        const dataToExport = exportData.value.map((row: any) => {
          const exportRow: any = {};
          
          // Map each field using the header keys
          Object.keys(exportData.header).forEach(key => {
            exportRow[exportData.header[key]] = row[key] || '';
          });
          
          return exportRow;
        });
        
        // Get the field names from the header values
        const fields = Object.values(exportData.header);
        
        // Export the file
        ExportFile({
          data: dataToExport,
          fileName: `LinkClickData_Link${linkId}_Campaign${campaignId}`,
          exportType: 'xlsx',
          fields: fields
        });
      }
    } catch (error) {
      console.error('Error exporting link data:', error);
    } finally {
      setShowLoader(false);
    }
  };
  
  const handleExportConfirm = async (format: string) => {
    setDialogType(null);
    setShowLoader(true);
    
    try {
      // Call the export API
      const response = await dispatch(exportLinksClicksReport({
        campaignId: parseInt(campaignId || ''),
        isParent: !!isParent,
        Culture: getLanguageCulture(language)
      }) as any);
      
      if (response?.payload && !response.error) {
        const exportData = response.payload;
        
        // Transform the data for export
        const dataToExport = exportData.value.map((row: any) => {
          const exportRow: any = {};
          
          // Map each field using the header keys
          Object.keys(exportData.header).forEach(key => {
            exportRow[exportData.header[key]] = row[key] || '';
          });
          
          return exportRow;
        });
        
        // Get the field names from the header values
        const fields = Object.values(exportData.header);
        
        // Export the file
        ExportFile({
          data: dataToExport,
          fileName: `LinkClickReportByCampaign_${campaignId}`,
          exportType: format,
          fields: fields
        });
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setShowLoader(false);
    }
  };
  
  const handleClickNavigation = (linkId: number, clickType: 'unique' | 'total') => {
    navigate(CLIENT_CONSTANTS.BASEURL, {
      state: {
        ...CLIENT_CONSTANTS.QUERY_PARAMS,
        CampaignID: parseInt(campaignId || ''),
        // PageType: CLIENT_CONSTANTS.PAGE_TYPES?.LinkClicked || '',
        PageType: CLIENT_CONSTANTS.PAGE_TYPES.ClientStatus,
        ResultTitle: `${t('report.linksClicksReport.title')} - ${clickType === 'unique' ? t('common.Unique') : t('common.Total')}`
      }
    });
  };
  
  const renderHeader = () => {
    return (
      <Box className={'topSection'}>
        <Title Text={t('report.linksClicksReport.title')} classes={classes} />
      </Box>
    );
  };
  
  const renderManagementLine = () => {
    return (
      <Grid container className={clsx(classes.managementLine, classes.mt15, classes.mb15)} spacing={2}>
        {canExport && (
          <Grid item>
            <Button
              className={clsx(classes.btn, classes.btnRounded)}
              endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
              onClick={handleExportClick}
            >
              {t('campaigns.exportFile')}
            </Button>
          </Grid>
        )}
        <Grid item className={clsx(classes.groupsLableContainer)} style={{ "justifyContent": "end" }}>
          <Typography className={classes.groupsLable}>
            {`${linksClicksData?.length || 0} ${t('report.TotalRecords')}`}
          </Typography>
        </Grid>
      </Grid>
    );
  };
  
  const renderTableHead = () => {
    return (
      <TableHead>
        <TableRow classes={rowStyle}>
          <TableCell 
            classes={cellStyle} 
            className={clsx(classes.flex6)}
            align='left'
          >
            <Box className={clsx(classes.paddingInline10, classes.alignItemsStart)}>
              {t('common.URL')}
            </Box>
          </TableCell>
          <TableCell 
            classes={cellStyle} 
            className={clsx(classes.flex1)}
            align="center"
          >
            {t('common.ClicksUnique')}
          </TableCell>
          <TableCell 
            classes={cellStyle} 
            className={clsx(classes.flex1)}
            align="center"
          >
            {t('report.linksClicksReport.verifiedClick')}
          </TableCell>
          <TableCell 
            classes={cellStyle} 
            className={clsx(classes.flex1)}
            align="center"
          >
            &nbsp;
          </TableCell>
        </TableRow>
      </TableHead>
    );
  };
  
  const renderRow = (item: LinkClickItem) => {
    return (
      <TableRow key={uniqid()} classes={{ root: classes.tableRowRoot }}>
        <TableCell 
          classes={cellBodyStyle}
          className={clsx(classes.flex6, classes.paddingInline10, classes.alignItemsStart)}
          align='left'
        >
          <Typography 
            className={clsx(classes.bluetext, classes.bold, classes.fontSize18, classes.ellipsis)}
            title={item.Url}
          >
            <Box className={clsx(classes.paddingInline10)}>
              {item.Url} (CampaignID = {item.CampaignID})
            </Box>
          </Typography>
        </TableCell>
        <TableCell 
          classes={cellBodyStyle}
          className={clsx(classes.flex1, classes.alignItemsCenter)}
          align="center"
        >
          <Button
            className={clsx(classes.bluetext, classes.fontSize18, classes.blueLink)}
            onClick={() => handleClickNavigation(item.LinkID, 'unique')}
            disabled={userRoles?.HideRecipients || item.ClickUniq === 0}
          >
            {item.ClickUniq.toLocaleString()}
          </Button>
        </TableCell>
        <TableCell 
          classes={cellBodyStyle}
          className={clsx(classes.flex1, classes.alignItemsCenter, classes.blueLink)}
          align="center"
        >
          <Button
            className={clsx(classes.linkButton, classes.bluetext, classes.fontSize18)}
            onClick={() => handleClickNavigation(item.LinkID, 'total')}
            disabled={userRoles?.HideRecipients || item.ClickCount === 0}
          >
            {item.ClickCount.toLocaleString()}
          </Button>
        </TableCell>
        <TableCell 
          classes={cellBodyStyle}
          className={clsx(classes.flex1, classes.blueLink)}
          align="center"
        >
          {canExport && (
            <Button
              variant="text"
              className={clsx(classes.linkButton, classes.bluetext)}
              onClick={() => handleExportRow(item.LinkID)}
            >
              {t('report.linksClicksReport.exportRecipient')}
            </Button>
          )}
        </TableCell>
      </TableRow>
    );
  };
  
  const renderPhoneRow = (item: LinkClickItem) => {
    const canExport = !userRoles?.HideRecipients && 
                     (!accountFeatures || !accountFeatures.includes(13));
    
    return (
      <Card key={uniqid()} className={clsx(classes.mobileCard, classes.mb15)}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography 
                className={clsx(classes.bluetext, classes.bold, classes.fontSize16)}
                style={{ wordBreak: 'break-all' }}
              >
                {item.Url}
              </Typography>
            </Grid>
            <Grid item xs={6} className={clsx(classes.textCenter)}>
              <Typography className={clsx(classes.fontSize14, classes.grayText)}>
                {t('common.ClicksUnique')}
              </Typography>
              <Button
                className={clsx(classes.linkButton, classes.bluetext, classes.fontSize16)}
                onClick={() => handleClickNavigation(item.LinkID, 'unique')}
                disabled={userRoles?.HideRecipients || item.ClickUniq === 0}
              >
                {item.ClickUniq.toLocaleString()}
              </Button>
            </Grid>
            <Grid item xs={6} className={clsx(classes.textCenter)}>
              <Typography className={clsx(classes.fontSize14, classes.grayText)}>
                {t('report.linksClicksReport.verifiedClick')}
              </Typography>
              <Button
                className={clsx(classes.linkButton, classes.bluetext, classes.fontSize16)}
                onClick={() => handleClickNavigation(item.LinkID, 'total')}
                disabled={userRoles?.HideRecipients || item.ClickCount === 0}
              >
                {item.ClickCount.toLocaleString()}
              </Button>
            </Grid>
            {canExport && (
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  fullWidth
                  className={clsx(classes.btn, classes.btnRed)}
                  startIcon={<FaFileExcel />}
                  onClick={() => handleExportRow(item.LinkID)}
                >
                  {t('report.linksClicksReport.exportRecipient')}
                </Button>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    );
  };
  
  const renderTableBody = () => {
    if (!linksClicksData || linksClicksData.length === 0) {
      return (
        <TableBody>
          <TableRow>
            <TableCell colSpan={3} align="center" className={classes.p20}>
              <Box className={clsx(classes.p10)}>
                <Grid container spacing={2} className={clsx(classes.flexJustifyCenter, classes.alignCenter, classes.textCenter)}>
                  <Grid item>
                    <Typography>{t('common.NoDataTryFilter')}</Typography>
                  </Grid>
                </Grid>
              </Box>
            </TableCell>
          </TableRow>
        </TableBody>
      );
    }
    
    // Get paginated data
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedData = linksClicksData.slice(startIndex, endIndex);
    
    if (windowSize === 'xs') {
      return (
        <Box className={classes.mobileContainer}>
          {paginatedData.map((item: LinkClickItem) => renderPhoneRow(item))}
        </Box>
      );
    }
    
    return (
      <TableBody>
        {paginatedData.map((item: LinkClickItem) => renderRow(item))}
      </TableBody>
    );
  };
  
  const renderTable = () => {
    if (windowSize === 'xs') {
      return renderTableBody();
    }
    
    return (
      <TableContainer className={clsx(classes.tableStyle, classes.mt4, classes.mb15)}>
        <Table className={classes.tableContainer}>
          {renderTableHead()}
          {renderTableBody()}
        </Table>
      </TableContainer>
    );
  };
  
  const renderTablePagination = () => {
    if (!linksClicksData || linksClicksData.length <= rowsPerPage) {
      return null;
    }
    
    const handleRowsPerPageChange = (val: number) => {
      dispatch(setRowsPerPage(val));
      setPage(1);
    };
    
    return (
      <TablePagination
        classes={classes}
        rows={linksClicksData.length}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        // @ts-ignore
        rowsPerPageOptions={rowsOptions}
        page={page}
        onPageChange={setPage}
      />
    );
  };
  
  return (
    <DefaultScreen
      currentPage="reports"
      subPage="linksClicksReport"
      classes={classes}
      containerClass={clsx(classes.management, classes.mb50)}
    >
      <Box className={classes.mb50}>
        {renderHeader()}
        {renderManagementLine()}
        {renderTable()}
        {renderTablePagination()}
      </Box>
      
      <ConfirmRadioDialog
        classes={classes}
        isOpen={dialogType?.type === 'exportFormat'}
        title={t('campaigns.exportFile')}
        radioTitle={t('common.SelectFormat')}
        onConfirm={handleExportConfirm}
        onCancel={() => setDialogType(null)}
        cookieName={'exportFormat'}
        defaultValue="xlsx"
        options={ExportFileTypes}
      />
      
      <Loader isOpen={showLoader || loading} />
    </DefaultScreen>
  );
};

export default LinkClickReport;