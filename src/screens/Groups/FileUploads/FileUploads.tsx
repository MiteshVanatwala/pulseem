import { useState, useEffect } from 'react';
import DefaultScreen from '../../DefaultScreen'
import clsx from 'clsx';
import {
  Box, Button, Grid, MenuItem, MenuList, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography
} from '@material-ui/core'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Title } from '../../../components/managment/Title';
import { Loader } from '../../../components/Loader/Loader';
import { ClassesType } from '../../Classes.types';
import { ERROR_TYPE } from '../../../helpers/Types/common';
import Toast from '../../../components/Toast/Toast.component';
// import { setRowsPerPage } from '../../../redux/reducers/coreSlice';
// import { rowsOptions } from '../../../helpers/Constants';
// import { PageProperty, SetPageState } from '../../../helpers/UI/SessionStorageManager';
// import { TablePagination } from '../../../components/managment';
// import { UploadedFile } from '../../../model/Groups/FileUploads.types';
import { DeleteIcon } from '../../../assets/images/managment';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import GroupSummary from '../../../components/GroupSummary/GroupSummary';
import { Summary } from '../../../model/Groups/GroupSummary.types';
import { cancelUpload, getFiles } from '../../../redux/reducers/fileUploadSlice';
import { PulseemFile, eUploadType } from '../../../Models/Files/FileUpload';
import CustomTooltip from '../../../components/Tooltip/CustomTooltip';
import moment from 'moment';
import { RenderHtml } from '../../../helpers/Utils/HtmlUtils';
import { eFileStatus } from '../../../Models/Files/FileUpload';
import { DateFormats } from '../../../helpers/Constants';

const FileUploads = ({ classes }: ClassesType) => {
  const { windowSize, rowsPerPage } = useSelector((state: any) => state.core)
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showLoader, setLoader] = useState(true);
  const [dialogType, setDialogType] = useState<{
    type: string;
    data: any
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<ERROR_TYPE>(null);
  const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot }
  const cellStyle = { head: classes.tableCellHead, body: classes.tableCellBody, root: classes.tableCellRoot };
  // const [serachData, setSearchData] = useState<any>({
  //   PageIndex: 1,
  //   PageSize: rowsPerPage,
  //   SearchTerm: "",
  //   IsDynamic: true
  // });
  const [uploadedFileList, setUploadedFileList] = useState<PulseemFile[]>([]);
  const dateFormat = 'YYYY-MM-DD HH:mm:ss.FFF'

  useEffect(() => {
    getFileUploadList();
  }, [])

  const renderToast = () => {
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
    return <Toast data={toastMessage} />;
  };

  const getFileUploadList = async () => {
    const response: any = await dispatch(getFiles());
    setUploadedFileList(response?.payload?.Data);
    setLoader(false);
  }

  const resetUpload = async (ID: number) => {
    // @ts-ignore
    const cReq: any = await dispatch(cancelUpload(ID));
    if (cReq?.payload?.Data === true) {
      getFileUploadList();
    }
    setLoader(false);
  }

  const renderTableHead = () => {
    return (
      <TableHead>
        <TableRow classes={rowStyle}>
          <TableCell classes={cellStyle} className={classes.flex3}>{t("FileUploads.fileName")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("FileUploads.fileSize")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("group.updateFrequency")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t("common.Status")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("common.Groups")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t("common.UploadResults")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t("group.totalRecipients")}</TableCell>
          <TableCell classes={cellStyle} className={clsx(classes.flex1, classes.noBorderOnLastCell)} align='center'>{t("common.cancel")}</TableCell>
        </TableRow>
      </TableHead>
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

  const renderTableBody = () => {
    return (
      <TableBody>
        {
          uploadedFileList?.length ? uploadedFileList.map(windowSize === 'xs' ? renderPhoneRow : renderRow)
            : (
              <Box className={clsx(classes.p10, classes.mt15, classes.mb15, classes.colorBlue)}>
                <Grid container spacing={2} className={clsx(classes.flexJustifyCenter, classes.alignCenter, classes.textCenter, classes.pr25, classes.pe25)} style={{ minHeight: 70 }}>
                  {t('common.NoDataTryFilter')}
                </Grid>
              </Box>
            )
        }
      </TableBody>
    )
  }

  const renderNameCell = (row: PulseemFile) => {
    let date = null
    let text: any = ''
    let separator = windowSize === 'xs' ? ":" : "";

    date = moment(row.LastUpdated, dateFormat)
    text = row?.Status === eFileStatus.CANCELLED ? `${t('FileUploads.cancelledBy')} <b>${row?.UploadedBy}</b>` : `${t('group.uploadedBy')} <b>${row?.UploadedBy}</b>`
    return (
      <>
        {/* @ts-ignore */}
        <CustomTooltip
          isSimpleTooltip={false}
          classes={classes}
          interactive={true}
          arrow={true}
          placement={'top'}
          title={<Typography noWrap={false}>{row.FileName}</Typography>}
          style={{ fontSize: 16 }}
          text={row.FileName}
        />
        <Typography
          className={clsx(classes.grayTextCell)} style={{ fontSize: 12 }}>
          {RenderHtml(`${text}${separator}  ${t('common.OnDate')} <b>${date.format(DateFormats.DATE_TIME_24)}</b>`)}
        </Typography>
      </>
    )
  }

  const renderStatus = (status: number) => {
    const colors: any = ['#0371AD', '#E74C3C', '#27AE60', '#E74C3C', '#F59A23'];
    return <Typography style={{ color: colors[status] }} className={clsx(classes.bold, classes.font16)}>{t(`group.uploadFiles.statuses.${status}`)}</Typography>

  }

  const renderRow = (row: PulseemFile) => {
    return (
      <TableRow
        key={row.ID}
        classes={rowStyle}>
        <TableCell classes={cellStyle} align='left' className={clsx(classes.flex3, classes.alignItemsStart)}>
          {renderNameCell(row)}
        </TableCell>
        <TableCell classes={cellStyle} align='center' className={clsx(classes.flex1)} style={{ direction: 'ltr' }}>
          {`${row.FileSize?.toLocaleString()} KB`}
        </TableCell>
        <TableCell classes={cellStyle} align='center' className={clsx(classes.flex1, classes.font16)}>
          {row.UploadType === eUploadType.Direct ? t('FileUploads.directUpload') : t('FileUploads.systemUpload')}
        </TableCell>
        <TableCell classes={cellStyle} align='center' className={clsx(classes.flex2)}>
          {renderStatus(row?.Status)}
        </TableCell>
        <TableCell classes={cellStyle} align='center' className={clsx(classes.flex1, classes.underline, classes.font16)} onClick={() => {
          setDialogType({ type: 'groups', data: row?.UploadResultsData })
        }}>
          {t('common.Groups')}
        </TableCell>
        <TableCell
          classes={cellStyle}
          align='center'
          className={clsx(classes.flex2, classes.font16)}
          onClick={() => {
            row?.Status === eFileStatus.SUCCESSFULLY_COMPLETED && setDialogType({ type: 'results', data: row.UploadResultsData })
          }}>
          {row?.Status === eFileStatus.SUCCESSFULLY_COMPLETED && <Typography className={classes.underline}>{t('group.results')}</Typography>}
        </TableCell>
        <TableCell classes={cellStyle} align='center' className={clsx(classes.flex2, classes.bold, classes.font16)}>
          {row?.UploadResultsData?.TotalRecords?.toLocaleString()}
        </TableCell>
        <TableCell classes={cellStyle} align='center' className={clsx(classes.flex1, classes.noBorderOnLastCell)}>
          {row?.Status === eFileStatus.WAITTING_FOR_UPLOAD && <DeleteIcon width={18} height={20} className={clsx('rowIcon', classes.underline)} onClick={() => {
            setDialogType({
              type: 'delete',
              data: row.ID
            })
          }} />}
        </TableCell>
      </TableRow>
    )
  }

  const renderPhoneRow = (row: any) => {
    return (
      <></>
    )
  }

  // const handleRowsPerPageChange = (val: Number) => {
  //   dispatch(setRowsPerPage(val))
  // }

  // const handlePageChange = (val: Number) => {
  //   SetPageState({
  //     "PageName": "groups",
  //     "PageNumber": val,
  //     "SearchTerm": serachData.SearchTerm,
  //     "SearchData": (serachData.SearchTerm !== '') ? {
  //       SearchTerm: serachData.SearchTerm,
  //       PageIndex: val
  //     } : null,
  //     "IsDynamic": true
  //   } as PageProperty);
  //   setSearchData({ ...serachData, PageIndex: val });
  // }

  // const renderTablePagination = () => {
  //   return (
  //     // @ts-ignore
  //     <TablePagination
  //       classes={classes}
  //       // rows={groupData ? groupData.RecordCount : 0}
  //       rows={20}
  //       rowsPerPage={rowsPerPage}
  //       onRowsPerPageChange={handleRowsPerPageChange}
  //       rowsPerPageOptions={rowsOptions}
  //       page={serachData.PageIndex}
  //       onPageChange={handlePageChange}
  //     />
  //   )
  // }

  const getDeleteDialog = (ID: number) => ({
    title: t('group.delete'),
    showDivider: false,
    content: (
      <Typography style={{ fontSize: 18 }}>
        {t('group.deleteUploadConfirmation')}
      </Typography>
    ),
    onConfirm: async () => {
      setLoader(true);
      await resetUpload(ID);
      setDialogType(null);
    }
  })

  const getResultDialog = (summary: Summary) => ({
    title: t('common.UploadResults'),
    showDivider: false,
    content: <GroupSummary classes={classes} summary={summary} />,
    renderButtons: () => (
      <Grid
        container
        spacing={4}
        className={clsx(classes.dialogButtonsContainer)}
      >
        <Button
          variant='contained'
          size='small'
          style={{ maxWidth: 100 }}
          onClick={() => setDialogType(null)}
          className={clsx(
            classes.btn,
            classes.btnRounded
          )}>
          {t('common.Ok')}
        </Button>
      </Grid>
    ),
  })

  const getGroupDialog = (data: any) => ({
    title: t('common.Groups'),
    showDivider: false,
    content: (
      <MenuList>
        {data?.groups && data?.groups?.map((g: any) => {
          return <MenuItem>{g.Title}</MenuItem>
        })}
      </MenuList>
    ),
    renderButtons: () => (
      <Grid
        container
        spacing={4}
        className={clsx(classes.dialogButtonsContainer)}
      >
        <Button
          variant='contained'
          size='small'
          style={{ maxWidth: 100 }}
          onClick={() => setDialogType(null)}
          className={clsx(
            classes.btn,
            classes.btnRounded
          )}>
          {t('common.Ok')}
        </Button>
      </Grid>
    ),
  })

  const renderDialog = () => {
    const { data, type }: any = dialogType || {}

    const dialogContent: { [key: string]: {} } = {
      groups: getGroupDialog(data),
      results: getResultDialog(data),
      delete: getDeleteDialog(data)
    }

    const currentDialog: any = dialogContent[type] || {}
    return (
      dialogType && <BaseDialog
        classes={classes}
        open={dialogType}
        onCancel={() => setDialogType(null)}
        onClose={() => setDialogType(null)}
        renderButtons={currentDialog.renderButtons || null}
        {...currentDialog}>
        {currentDialog.content}
      </BaseDialog>
    )
  }

  return (
    <DefaultScreen
      currentPage="FileUploads"
      classes={classes}
      containerClass={clsx(classes.management, classes.mb50)}
    >
      <Box className={classes.mb50}>
        <Box className={'topSection onlyTitleBar'}>
          <Title
            Text={t("master.RadMenuItemResourceFileUploads.Text")}
            classes={classes}
            ContainerStyle={{ border: 'none !important' }}
          />
        </Box>
        {renderTable()}
        {/* {renderTablePagination()} */}

        <Loader isOpen={showLoader} />
        {toastMessage && renderToast()}
        {renderDialog()}
      </Box>
    </DefaultScreen>
  )
}

export default FileUploads