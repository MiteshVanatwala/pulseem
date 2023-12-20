import React, { useState, useEffect } from 'react';
import DefaultScreen from '../../DefaultScreen'
import clsx from 'clsx';
import {
  Typography, Table, TableBody, TableRow, TableHead, TableCell, TableContainer,
  Grid, Button, TextField, Box
} from '@material-ui/core'
import { DuplicateIcon, PreviewIcon } from '../../../assets/images/managment/index'
import { TablePagination, ManagmentIcon, DateField, SearchField } from '../../../components/managment/index'
import { getArchiveCampaigns, cloneArchiveCampaign } from '../../../redux/reducers/newsletterSlice'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import 'moment/locale/he'
import { pulseemNewTab } from '../../../helpers/Functions/functions';
import { Loader } from '../../../components/Loader/Loader';
import { setRowsPerPage } from '../../../redux/reducers/coreSlice';
import CustomTooltip from '../../../components/Tooltip/CustomTooltip';
import { ExportFile } from '../../../helpers/Export/ExportFile';
import { EmailStatus } from '../../../helpers/Constants';
import { HandleExportData } from '../../../helpers/Export/ExportHelper';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import { sendToTeamChannel } from "../../../redux/reducers/ConnectorsSlice";
import { Title } from '../../../components/managment/Title';
import { ExportFileTypes } from '../../../model/Export/ExportFileTypes';
import ConfirmRadioDialog from '../../../components/DialogTemplates/ConfirmRadioDialog';
import { sitePrefix } from '../../../config';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { PulseemFeatures } from '../../../model/PulseemFields/Fields';

const ArchiveManagementScreen = ({ classes }) => {
  const { language, windowSize, rowsPerPage, isRTL } = useSelector(state => state.core)
  const { accountFeatures } = useSelector(state => state.common);
  const { newsletterArchiveData } = useSelector(state => state.newsletter)
  const { t } = useTranslation()
  const [fromDate, handleFromDate] = useState(null);
  const [toDate, handleToDate] = useState(null)
  const [campaineNameSearch, setCampaineNameSearch] = useState('')
  const rowsOptions = [6, 10, 20, 50]
  const [page, setPage] = useState(1)
  const [isSearching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot }
  const cellStyle = { head: classes.tableCellHead, body: classes.tableCellBody, root: classes.tableCellRoot }
  const [dialogType, setDialogType] = useState(null)
  const [showLoader, setLoader] = useState(true);
  const dateFormat = 'YYYY-MM-DD HH:mm:ss.FFF'
  const dispatch = useDispatch()
  moment.locale(language)

  const getData = async () => {
    await dispatch(getArchiveCampaigns())
    setLoader(false);
  }

  const handleDefaultDates = () => {
    let lastYear = moment().subtract(1, 'year');
    let dateVal = moment(lastYear).format('YYYY-MM-DD HH:mm') || null;
    handleToDate(dateVal);
  }
  useEffect(() => {
    setLoader(true);
    getData();
    handleDefaultDates();
  }, [dispatch])

  const clearSearch = () => {
    setCampaineNameSearch('');
    handleFromDate(null);
    setSearchResults(null);
    setSearching(false);
    handleDefaultDates();
  }

  const renderSearchLine = () => {
    const handleKeyDown = (event) => {
      if (event.keyCode === 13 || event.key === 'Enter') {
        handleSearch();
      }
    }
    const handleSearch = () => {
      if (campaineNameSearch === '' && !fromDate && !toDate) {
        return;
      }
      try {
        const searchArray = [{
          type: 'name',
          campaineName: campaineNameSearch
        }, {
          type: 'date',
          fromDate,
          toDate
        }];

        const filtersObject = {
          name: (row, values) => {
            return String(row.Name.toLowerCase()).includes(values.campaineName.toLowerCase());
          },
          date: (row, values) => {
            const { UpdatedDate, SendDate } = row
            const lastUpdate = SendDate ?
              moment(SendDate, dateFormat).valueOf()
              : moment(UpdatedDate, dateFormat).valueOf()
            const startFromDate = (values.fromDate && moment(values.fromDate).hour(0).minute(0).valueOf()) ?? null
            const endToDate = (values.toDate && moment(values.toDate).hour(23).minute(59).valueOf()) ?? null

            if (!values)
              return true
            if (fromDate && toDate && startFromDate && endToDate)
              return ((lastUpdate >= startFromDate) && (lastUpdate <= endToDate))
            if (fromDate && startFromDate)
              return (lastUpdate >= startFromDate)
            if (toDate && endToDate)
              return (lastUpdate <= endToDate)
            return true
          }
        }

        let sortData = newsletterArchiveData
        searchArray.forEach(values => {
          sortData = sortData.filter(row => filtersObject[values.type](row, values))
        });
        setSearchResults(sortData);
        setSearching(true);
        setPage(1);
      } catch (error) {
        console.log(error);
        dispatch(sendToTeamChannel({
          MethodName: 'handleSearch',
          ComponentName: 'ArchiveManagement.js',
          Text: error
        }));
      }
    }

    const handleKeyPress = (e) => {
      if (e.charCode === 13) {
        handleSearch()
      }
    }



    const handleCampainNameChange = event => {
      setCampaineNameSearch(event.target.value)
    }

    return (
      <Grid container spacing={2} className={clsx(windowSize === 'xs' || windowSize === 'sm' ? classes.mt15 : classes.lineTopMarging, 'searchLine')}>
        <Grid item>
          <TextField
            variant='outlined'
            size='small'
            value={campaineNameSearch}
            onKeyPress={handleKeyDown}
            onChange={handleCampainNameChange}
            className={clsx(classes.textField, classes.minWidth252)}
            placeholder={t('common.CampaignName')}
          />
        </Grid>
        {renderDateFields()}
        <Grid item>
          <Button
            size='large'
            variant='contained'
            onClick={handleSearch}
            className={clsx(classes.btn, classes.btnRounded)}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}>
            {t('campaigns.btnSearchResource1.Text')}
          </Button>
        </Grid>
        {isSearching && <Grid item>
          <Button
            size='large'
            variant='contained'
            onClick={clearSearch}
            className={clsx(classes.btn, classes.btnRounded)}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}>
            {t('common.clear')}
          </Button>
        </Grid>}
      </Grid>
    )
  }

  const handleFromDateChange = (value) => {
    if (value > toDate) {
      handleToDate(null);
    }
    handleFromDate(value);
  }

  const renderDateFields = () => {
    return <>
      {
        windowSize !== 'xs' ?
          <Grid item>
            <DateField
              classes={classes}
              value={fromDate}
              onChange={handleFromDateChange}
              placeholder={t('mms.locFromDateResource1.Text')}
              maximumDate={moment().subtract(1, 'year')}
              toolbarDisabled={false}
            />
          </Grid>
          : null
      }

      {
        windowSize !== 'xs' ?
          <Grid item>
            <DateField
              classes={classes}
              value={toDate}
              onChange={handleToDate}
              placeholder={t('mms.locToDateResource1.Text')}
              minDate={fromDate ? fromDate : undefined}
              toolbarDisabled={false}
            />
          </Grid>
          : null
      }
    </>
  }

  const handleDownloadCsv = async (formatType) => {
    setDialogType(null);
    setLoader(true)
    const exportColumnHeader = {
      "Name": t('common.CampaignName'),
      "SendDate": t('mainReport.GridBoundColumnResource3.HeaderText'),
      "Status": t('common.Status'),
      "StatusName": t('mainReport.statusName'),
    }

    const list = searchResults ?? newsletterArchiveData;

    const exportOptions = {
      OrderItems: true,
      FormatDate: true,
      ConvertStatusToString: true,
      Statuses: EmailStatus,
      Order: Object.keys(exportColumnHeader),
      DeleteProperties: ["Status"]
    };

    try {
      const result = await HandleExportData(list, exportOptions);

      ExportFile({
        data: result,
        fileName: 'emailReport',
        exportType: formatType,
        fields: exportColumnHeader
      });
    } catch (e) {
      console.log(e);
      dispatch(sendToTeamChannel({
        MethodName: 'handleDownloadCsv',
        ComponentName: 'ArchiveManagement.js',
        Text: e
      }));
    }
    finally {
      setLoader(false);
    }
  }

  const renderManagmentLine = () => {
    return (
      <Grid container spacing={2} className={clsx(classes.linePadding, classes.pb10)}>
        {accountFeatures?.indexOf(PulseemFeatures.LOCK_EXPORT_DATA) === -1 && windowSize !== 'xs' && <Grid item>
          <Button
            variant='contained'
            size='medium'
            onClick={() => setDialogType("exportFormat")}
            className={clsx(classes.btn, classes.btnRounded)}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}>
            {t('campaigns.exportFile')}
          </Button>
        </Grid>}
        <Grid item className={classes.groupsLableContainer} >
          <Typography className={classes.groupsLable}>
            {`${isSearching ? searchResults.length : newsletterArchiveData.length} ${t('campaigns.newsletters')}`}
          </Typography>
        </Grid>
      </Grid>
    )
  }

  const renderTableHead = () => {
    return (
      <TableHead>
        <TableRow classes={rowStyle}>
          <TableCell classes={cellStyle} className={classes.flex6} align='center'>{t("common.CampaignName")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex4} align='center'>{t("campaigns.recipients")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex4} align='center'>{t("campaigns.lblCampaignStatusResource1.Text")}</TableCell>
          <TableCell classes={{ root: classes.tableCellRoot }} className={classes.flex4} ></TableCell>
        </TableRow>
      </TableHead>
    )
  }

  const renderCellIcons = (row) => {
    const { CampaignID } = row

    const iconsMap = [[
      {
        key: 'preview',
        uIcon: PreviewIcon,
        lable: t('campaigns.Image1Resource1.ToolTip'),
        remove: windowSize === 'xs',
        rootClass: classes.paddingIcon,
        onClick: () => {
          pulseemNewTab(`PreviewCampaign.aspx?CampaignID=${CampaignID}&fromreact=true`)
        }
      },
      {
        key: 'duplicate',
        uIcon: DuplicateIcon,
        lable: t('campaigns.lnkEditResource1.ToolTip'),
        rootClass: classes.paddingIcon,
        onClick: () => {
          setDialogType({
            type: 'duplicate',
            data: CampaignID
          })
        }
      }
    ]
    ]
    return (
      <Grid
        container
        className={windowSize !== 'xs' ? classes.justifyCenterOfCenter : null}
        direction={windowSize === 'sm' ? 'column' : 'row'}>
        {iconsMap.map((map, index) => (
          <Grid
            key={index}
            item
            className={classes.fullFlexItem}>
            <Grid
              container>
              {map.map(icon => (
                <Grid
                  className={clsx(icon.disable && classes.disabledCursor, 'rowIconContainer')}
                  key={icon.key}
                  item >
                  <ManagmentIcon
                    classes={classes}
                    {...icon}
                    uIcon={<icon.uIcon width={18} height={20} className={'rowIcon'} />}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
        ))}
      </Grid>
    )
  }

  const renderStatusCell = (status) => {
    const statuses = {
      1: 'common.Created',
      2: 'common.Sending',
      3: 'campaigns.Stopped',
      4: 'common.Sent',
      5: 'campaigns.Canceled',
      6: 'campaigns.Optin',
      7: 'campaigns.Approve'
    }
    return (
      <>
        <Typography className={clsx(
          classes.middleText,
          classes.recipientsStatus,
          {
            [classes.recipientsStatusCreated]: status === 1,
            [classes.recipientsStatusSent]: status === 4,
            [classes.recipientsStatusSending]: status === 2,
            [classes.recipientsStatusCanceled]: status === 5
          }
        )}>
          {t(statuses[status])}
        </Typography>
      </>
    )
  }

  const renderRecipientsCell = (recipients) => {

    return (
      <>
        <Typography className={classes.middleText}>
          {recipients.toLocaleString()}
        </Typography>
        <Typography className={classes.middleText}>
          {t("campaigns.recipients")}
        </Typography>
      </>
    )
  }

  const renderNameCell = (row) => {
    let date = null
    let text = ''
    if (!row.SendDate) {
      date = moment(row.UpdatedDate, dateFormat)
      text = t('common.UpdatedOn')
    } else {
      date = moment(row.SendDate, dateFormat)
      const dateMillis = date.valueOf()
      const currentDateMillis = moment().valueOf()
      text = dateMillis > currentDateMillis ? t('common.ScheduledFor') : t('common.SentOn')
    }

    return (
      <>
        <CustomTooltip
          key={row.ID}
          isSimpleTooltip={false}
          classes={classes}
          interactive={true}
          arrow={true}
          placement={'top'}
          title={<Typography noWrap={false}>{row.Name}</Typography>}
          text={row.Name}
        />
        <Typography className={classes.f14}>
          {`${t("mainReport.CampaignID")} ${row.CampaignID}`}
        </Typography>
        <Typography
          className={classes.grayTextCell}>
          {`${text} ${date.format('DD/MM/YYYY')} ${date.format('LT')}`}
        </Typography>
      </>
    )
  }

  const renderRow = (row) => {
    return (
      <TableRow
        key={row.CampaignID}
        classes={rowStyle}>
        <TableCell
          classes={cellStyle}
          align='center'
          className={classes.flex6}>
          {renderNameCell(row)}
        </TableCell>
        <TableCell
          classes={cellStyle}
          align='center'
          className={classes.flex4}>
          {renderRecipientsCell(row.SentCount)}
        </TableCell>
        <TableCell
          classes={cellStyle}
          align='center'
          className={classes.flex4}>
          {renderStatusCell(row.Status)}
        </TableCell>
        <TableCell
          component="th"
          scope="row"
          classes={{ root: classes.tableCellRoot }}
          className={classes.flex4}
        >
          {renderCellIcons(row)}

        </TableCell>
      </TableRow>
    )
  }

  const renderPhoneRow = (row) => {
    return (
      <TableRow
        key={row.CampaignID}
        component='div'
        classes={rowStyle}>
        <TableCell style={{ flex: 1 }} classes={{ root: classes.tableCellRoot }}>
          <Box className={classes.justifyBetween}>
            <Box className={classes.inlineGrid}>
              {renderNameCell(row)}
            </Box>
            <Box>
              {renderStatusCell(row.Status)}
            </Box>
          </Box>
          {renderCellIcons(row)}
        </TableCell>
      </TableRow>
    )
  }

  const renderTableBody = () => {
    let sortData = isSearching ? searchResults : newsletterArchiveData;
    let rpp = parseInt(rowsPerPage)
    sortData = sortData.slice((page - 1) * rpp, (page - 1) * rpp + rpp)
    return (
      <Box className='tableBodyContainer'>
        <TableBody>
          {!sortData || sortData.length === 0 ?
            <Box className={clsx(classes.flex, classes.justifyCenterOfCenter)} style={{ height: 50 }}>
              <Typography>{t("common.NoDataTryFilter")}</Typography>
            </Box> :
            sortData.map((obj, idx) => windowSize === "xs" ? renderPhoneRow(obj) : renderRow(obj))}
        </TableBody>
      </Box>
    )
  }

  const renderTable = () => {
    return (
      <TableContainer className={classes.tableStyle}>
        <Table className={classes.tableContainer}>
          {windowSize !== 'xs' && renderTableHead()}
          {renderTableBody()}
        </Table>
      </TableContainer>
    )
  }

  const renderTablePagination = () => {
    const handleRowsPerPageChange = (val) => {
      dispatch(setRowsPerPage(val))
    }
    return (
      <TablePagination
        classes={classes}
        rows={isSearching ? searchResults.length : newsletterArchiveData.length}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={rowsOptions}
        page={page}
        onPageChange={setPage}
      />
    )
  }


  const handleClose = () => {
    setDialogType(null)
  }


  const getDuplicateDialog = (data = '') => ({
    title: t('campaigns.dialogDuplicateTitle'),
    showDivider: false,
    content: (
      <Typography style={{ fontSize: 18 }}>
        {t('campaigns.dialogDuplicateContent')}
      </Typography>
    ),
    onConfirm: async () => {
      clearSearch()
      handleClose()
      setPage(1)
      const newCampaignId = await dispatch(cloneArchiveCampaign(data))
      if (newCampaignId.payload > 0) {
        window.open(`${sitePrefix}Campaigns`);
      }
    }
  })
  const renderDialog = () => {
    const { data, type } = dialogType || {}

    if (!type)
      return;

    const dialogContent = {
      duplicate: getDuplicateDialog(data)
    }

    const currentDialog = dialogContent[type] || {}
    return (
      dialogType && <BaseDialog
        classes={classes}
        open={dialogType}
        onClose={handleClose}
        onCancel={handleClose}
        {...currentDialog}>
        {currentDialog.content}
      </BaseDialog>
    )
  }

  return (
    <DefaultScreen
      currentPage="newsletter"
      subPage='archiveManagement'
      classes={classes}
      containerClass={clsx(classes.management, classes.mb50)}>
      <Box className={classes.mb50}>
        <Box className={'topSection'}>
          <Title Text={t('campaigns.logPageHeaderArchive.Text')} classes={classes} />
          {renderSearchLine()}
        </Box>
        {renderManagmentLine()}
        {renderTable()}
        {renderTablePagination()}
        {renderDialog()}
        <Loader isOpen={showLoader} />
        <ConfirmRadioDialog
          classes={classes}
          isOpen={dialogType === 'exportFormat'}
          title={t('campaigns.exportFile')}
          radioTitle={t('common.SelectFormat')}
          onConfirm={(e) => handleDownloadCsv(e)}
          onCancel={() => setDialogType(null)}
          cookieName={'exportFormat'}
          defaultValue="xls"
          options={ExportFileTypes}
        />
      </Box>
    </DefaultScreen>
  )
}

export default ArchiveManagementScreen