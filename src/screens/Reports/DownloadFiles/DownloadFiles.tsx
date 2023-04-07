import { useState, useEffect } from 'react';
import DefaultScreen from '../../DefaultScreen'
import clsx from 'clsx';
import {
  Typography, Divider, Table, TableBody, TableRow, TableHead, TableCell, TableContainer, Box
} from '@material-ui/core'
import { TablePagination } from '../../../components/managment/index'
import { GetFileDownloadList } from '../../../redux/reducers/reportSlice'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import 'moment/locale/he'
import { Loader } from '../../../components/Loader/Loader';
import { setRowsPerPage } from '../../../redux/reducers/coreSlice';
import CustomTooltip from '../../../components/Tooltip/CustomTooltip';
import { fileInstence } from '../../../helpers/api';

const DownloadFiles = ({ classes }: any) => {
  const { language, windowSize, rowsPerPage } = useSelector((state: any) => state.core)
  const { downloadFileList } = useSelector((state: any) => state.report)
  const { t } = useTranslation();
  const rowsOptions = [6, 10, 20, 50];
  const [page, setPage] = useState(1);
  const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot }
  const cellStyle = { head: classes.tableCellHead, body: classes.tableCellBody, root: classes.tableCellRoot }
  const [showLoader, setLoader] = useState(true);
  const dispatch = useDispatch()
  moment.locale(language)

  const getData = async () => {
    await dispatch(GetFileDownloadList())
    setLoader(false);
  }

  useEffect(() => {
    setLoader(true);
    getData();
  }, [dispatch])

  const renderHeader = () => {
    return (
      <>
        <Typography className={classes.managementTitle}>
          {t('common.fileDownloads')}
        </Typography>
        <Divider />
      </>
    )
  }

  const renderTableHead = () => {
    return (
      <TableHead>
        <TableRow classes={rowStyle}>
          <TableCell classes={cellStyle} className={classes.flex6} align='center'>{t("report.fileName")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("common.Status")}</TableCell>
          <TableCell classes={cellStyle} className={clsx(classes.flex1, classes.noBorderOnLastCell)} align='center'>{t("report.action")}</TableCell>
        </TableRow>
      </TableHead>
    )
  }

  const renderStatusCell = (status: string|number) => {
    const statuses = {
      1: 'report.InProcess',
      2: 'report.ReadyForDownload',
      5: 'report.Failed'
    }
    return (
      <>
        <Typography className={clsx(
          classes.middleText,
          classes.recipientsStatus,
          {
            [classes.recipientsStatusSending]: status === 1,
            [classes.recipientsStatusSent]: status === 2,
            [classes.recipientsStatusCanceled]: status === 5
          }
        )}>
          {/* {t(statuses[status])} */}
        </Typography>
      </>
    )
  }

  const renderActionCell = (row: any) => {
    return row.Status === 2 && (
      <>
        <Typography className={clsx(
            classes.middleText,
            classes.blueLink
          )}
          onClick={() => downloadFile(row.ID, row.FileName)}
        >
          {t('master.download')}
        </Typography>
      </>
    )
  }

  const downloadFile = async (fileID: number, FileName: string) => {
    const response = await fileInstence.get(`/LargeFiles/DonwloadFile/${fileID}`);
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
        "download",
        FileName
    );
    document.body.appendChild(link);
    link.click();
    // https://github.com/eligrey/FileSaver.js#readme
    // 
  }

  const renderNameCell = (row: any) => {
    return (
      <CustomTooltip
        key={row.id}
        isSimpleTooltip={false}
        classes={classes}
        interactive={true}
        arrow={true}
        placement={'top'}
        title={<Typography noWrap={false}>{row.FileName}</Typography>}
        text={row.FileName} icon={undefined} style={undefined}>
          <Typography noWrap={false}>{row.FileName}</Typography>
      </CustomTooltip>
    )
  }

  const renderRow = (row: any) => {
    return (
      <TableRow
        key={row.ID}
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
          className={classes.flex1}>
          {renderStatusCell(row.Status)}
        </TableCell>
        <TableCell
          classes={cellStyle}
          align='center'
          className={clsx(classes.flex1, classes.noBorderOnLastCell)}>
          {renderActionCell(row)}
        </TableCell>
      </TableRow>
    )
  }

  const renderPhoneRow = (row: any) => {
    return (
      <TableRow
        key={row.ID}
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
          {renderActionCell(row.Status)}
        </TableCell>
      </TableRow>
    )
  }

  const renderTableBody = () => {
    let sortData = downloadFileList;
    let rpp = parseInt(rowsPerPage)
    sortData = sortData.slice((page - 1) * rpp, (page - 1) * rpp + rpp)
    return (
      <TableBody>
        {sortData
          .map(windowSize === 'xs' ? renderPhoneRow : renderRow)}
      </TableBody>
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

  const handleRowsPerPageChange = (val: number) => {
    dispatch(setRowsPerPage(val))
  }

  const renderTablePagination = () => {
    return (
      <TablePagination
        classes={classes}
        rows={downloadFileList.length}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(val: any) => handleRowsPerPageChange(val)}
        rowsPerPageOptions={rowsOptions}
        page={page}
        onPageChange={(val: any) => setPage(val)}
      />
    )
  }

  return (
    <DefaultScreen
      currentPage="downloadfiles"
      classes={classes}
      containerClass={clsx(classes.management, classes.mb50)}
    >
      {renderHeader()}
      {renderTable()}
      {renderTablePagination()}
      <Loader isOpen={showLoader} />
    </DefaultScreen>
  )
}

export default DownloadFiles