import { useState, useEffect } from 'react';
import DefaultScreen from '../../DefaultScreen';
import clsx from 'clsx';
import uniqid from 'uniqid';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { getLinksClicksReport, exportLinksClicksReport, clearLinksClicksReport } from '../../../redux/reducers/linksClicksReportSlice';
import { ExportFile } from '../../../helpers/Export/ExportFile';
import { ExportFileTypes } from '../../../model/Export/ExportFileTypes';
import ConfirmRadioDialog from '../../../components/DialogTemplates/ConfirmRadioDialog';
import { CLIENT_CONSTANTS } from '../../../model/Clients/Contants';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { setRowsPerPage } from '../../../redux/reducers/coreSlice';
import { getLanguageCulture } from '../../../helpers/Utils/TextHelper';
import Toast from '../../../components/Toast/Toast.component';
import { LinksClicksReport } from '../../../config/enum';

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
  const location = useLocation();
  
  // Redux state
  const { linksClicksData, loading, error } = useSelector((state: any) => state.linksClicksReportSlice);
  const { windowSize, isRTL, userRoles, rowsPerPage, language } = useSelector((state: any) => state.core);
  const { accountFeatures } = useSelector((state: any) => state.common);
  
  // Local state
  const [showLoader, setShowLoader] = useState<boolean>(false);
  const [dialogType, setDialogType] = useState<any>(null);
  const [page, setPage] = useState<number>(1);
  const [ toastMessage, setToastMessage ] = useState(null);

  const { type, campaignId, isVerified, isParent, campaignName } = location.state || {};

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
    
    return () => {
      dispatch(clearLinksClicksReport());
    };
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
  
  const handleExport = async (format: string, linkId: number = 0) => {
    setDialogType(null);
    setShowLoader(true);
    
    try {
      var response: any = await dispatch(exportLinksClicksReport(
        linkId ? {
          campaignId: parseInt(campaignId || ''),
          isParent: !!isParent,
          Culture: getLanguageCulture(language),
          type: type,
          linkId: linkId,
        } : {
          campaignId: parseInt(campaignId || ''),
          isParent: !!isParent,
          Culture: getLanguageCulture(language),
          type: type,
          linkId: linkId,
        }
      ) as any);
      
      if (response?.payload && !response.error) {
        const exportData = response.payload;

        if (exportData.value.length === 0) {
          // @ts-ignore
          setToastMessage({ severity: 'error', color: 'error', message: t('report.linksClicksReport.NoRecipients'), showAnimtionCheck: false });
          return false;
        }

        const fields: any = [...Object.keys(exportData.header)];
        const dataToExport = exportData.value.map((row: any) => {
          const exportRow: any = {};
          Object.keys(fields).forEach(key => {
            exportRow[fields[key]] = row[fields[key]] || '';
          });
          return exportRow;
        });

        const excelHeader = (Object.values(exportData.header) as string[]).map((field: string) => {
          const translated = t(`report.linksClicksReport.${field}`);
          return translated === `report.linksClicksReport.${field}` ? field : translated;
        });

        ExportFile({
          data: dataToExport,
          fileName: `LinkClickReportByCampaign_${campaignId}`,
          exportType: format,
          fields: excelHeader
        });
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setShowLoader(false);
    }
  };

  const getPageType = () => {
    switch (type) {
      case LinksClicksReport.Newsletter:
        return CLIENT_CONSTANTS.PAGE_TYPES.EmailUniqueClick;
      case LinksClicksReport.SMS: {
        return isVerified ? CLIENT_CONSTANTS.PAGE_TYPES.SMSVerifiedClick : CLIENT_CONSTANTS.PAGE_TYPES.SMSUniqueClick;
      }
      case LinksClicksReport.WhatsApp:
        return CLIENT_CONSTANTS.PAGE_TYPES.WhatsappUniqueClick;
      default:
        return CLIENT_CONSTANTS.PAGE_TYPES.Undefined;
    }
  }
  
  const handleClickNavigation = (linkId: number) => {
    navigate(CLIENT_CONSTANTS.BASEURL, {
      state: {
        ...CLIENT_CONSTANTS.QUERY_PARAMS,
        CampaignID: parseInt(campaignId || ''),
        LinkID: linkId,
        PageType: getPageType(),
        IsParent: !!isParent,
        IsSearchByFilter: false,
        ResultTitle: `${t('report.linksClicksReport.title')} - ${t('common.campaignID')}: ${campaignId}`
      }
    });
  };
  
  const renderHeader = () => {
    return (
      <Box className={'topSection'}>
        <Title Text={`${t('report.linksClicksReport.title')} (${campaignName || ''} - ${campaignId})`} classes={classes} />
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
            {t('report.linksClicksReport.totalClick')}
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
            style={{
              wordBreak: 'break-all',
              whiteSpace: 'pre-line', // allows line breaks
              overflowWrap: 'break-word',
            }}
          >
            <Box className={clsx(classes.paddingInline10)}>
              {item.Url}
            </Box>
          </Typography>
        </TableCell>
        <TableCell 
          classes={cellBodyStyle}
          className={clsx(classes.flex1, classes.alignItemsCenter)}
          align="center"
        >
          <Button
            className={clsx(classes.bluetext, classes.fontSize18, item.ClickUniq > 0 ? classes.blueLink : null)}
            onClick={() => handleClickNavigation(item.LinkID)}
          >
            {item.ClickUniq.toLocaleString()}
          </Button>
        </TableCell>
        <TableCell 
          classes={cellBodyStyle}
          className={clsx(classes.flex1, classes.alignItemsCenter)}
          align="center"
        >
          <Button
            className={clsx(classes.linkButton, classes.fontSize18, item.ClickCount > 0 ? classes.blueLink : null)}
            onClick={() => handleClickNavigation(item.LinkID)}
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
              onClick={() => handleExport('xlsx', item.LinkID)}
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
                onClick={() => handleClickNavigation(item.LinkID)}
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
                onClick={() => handleClickNavigation(item.LinkID)}
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
                  onClick={() => handleExport('xlsx', item.LinkID)}
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

  const renderToast = () => {
    if (toastMessage) {
      setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return (
        <Toast data={toastMessage} />
      );
    }
    return null;
  }
  
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
        onConfirm={handleExport}
        onCancel={() => setDialogType(null)}
        cookieName={'exportFormat'}
        defaultValue="xlsx"
        options={ExportFileTypes}
      />
      
      <Loader isOpen={showLoader || loading} />
      {renderToast()}
    </DefaultScreen>
  );
};

export default LinkClickReport;