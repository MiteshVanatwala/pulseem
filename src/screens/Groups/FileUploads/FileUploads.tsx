import { useState, useEffect } from 'react';
import DefaultScreen from '../../DefaultScreen'
import clsx from 'clsx';
import {
    Box, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography
} from '@material-ui/core'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Title } from '../../../components/managment/Title';
import { Loader } from '../../../components/Loader/Loader';
import { ClassesType } from '../../Classes.types';
import { ERROR_TYPE } from '../../../helpers/Types/common';
import Toast from '../../../components/Toast/Toast.component';
import { setRowsPerPage } from '../../../redux/reducers/coreSlice';
import { rowsOptions } from '../../../helpers/Constants';
import { PageProperty, SetPageState } from '../../../helpers/UI/SessionStorageManager';
import { TablePagination } from '../../../components/managment';
import { PulseemReactInstance } from '../../../helpers/Api/PulseemReactAPI';
import { UploadedFile } from '../../../model/Groups/FileUploads.types';
import { DeleteIcon } from '../../../assets/images/managment';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';

const FileUploads = ({ classes }: ClassesType) => {
  const { language, windowSize, rowsPerPage } = useSelector((state: any) => state.core)
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showLoader, setLoader] = useState(false);
  const [dialogType, setDialogType] = useState<{
    type: string;
    data: any
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<ERROR_TYPE>(null);
  const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot }
  const cellStyle = { head: classes.tableCellHead, body: classes.tableCellBody, root: classes.tableCellRoot };
  const [serachData, setSearchData] = useState<any>({
    PageIndex: 1,
    PageSize: rowsPerPage,
    SearchTerm: "",
    IsDynamic: true
  });
  const [ uploadedFileList, setUploadedFileList ] = useState<UploadedFile[]>([]);
  
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
    // const response = await PulseemReactInstance.get(`/FileUploads/Get`);
    // console.log(response);
    const data = [ 
      {
        ID: 1,
        uploadType: 1,
        FileSize: 14124,
        Status: 'Pending',
        UploadedBy: '',
        FileName: "1_2_2024 5_27_00 AM-784648.XLSX",
        Results: "",
        ErrorData: "",
        FieldsMapping: '',
        CreatedDate: '',
        LastUpdated: '',
        RunDateStart: '',
        RunDateEnd: '',
        StatusTitle: '',
        UploadTypeTitle: '',
      }
    ];
    setUploadedFileList(data);
  }

  const renderTableHead = () => {
    return (
      <TableHead>
        <TableRow classes={rowStyle}>
          <TableCell classes={cellStyle} className={classes.flex3}>{t("common.GroupName")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t("group.updateFrequency")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t("common.Status")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("common.Groups")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t("group.results")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t("group.totalRecipients")}</TableCell>
          <TableCell classes={cellStyle} className={clsx(classes.flex1, classes.noBorderOnLastCell)} align='center'>{t("group.deleteGroup")}</TableCell>
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
          uploadedFileList.length ? uploadedFileList.map(windowSize === 'xs' ? renderPhoneRow : renderRow)
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

  const renderRow = (row: UploadedFile) => {
    return (
      <TableRow
        key={row.ID}
        classes={rowStyle}>
        <TableCell classes={cellStyle} align='left' className={clsx(classes.flex3, classes.alignItemsStart)}>
          {row.FileName}
          ({row.FileSize} KB)
        </TableCell>
        <TableCell classes={cellStyle} align='center' className={classes.flex2}>
          {t(`group.${row.uploadType === 1 ? 'weekly' : 'Daily'}`)}
        </TableCell>
        <TableCell classes={cellStyle} align='center' className={classes.flex2}>
          {/* {moment(row.CreationDate).format("DD/MM/YYYY HH:mm")} */}
          {row.Status}
        </TableCell>
        <TableCell classes={cellStyle} align='center' className={clsx(classes.flex1, classes.underline)}>
          {t('common.Groups')}
        </TableCell>
        <TableCell classes={cellStyle} align='center' className={clsx(classes.flex2, classes.underline)}>
          {t('group.results')}
        </TableCell>
        <TableCell classes={cellStyle} align='center' className={classes.flex2}>
        </TableCell>
        <TableCell classes={cellStyle} align='center' className={clsx(classes.flex1, classes.noBorderOnLastCell)}>
          <DeleteIcon width={18} height={20} className={'rowIcon'}  onClick={() => {
            setDialogType({
              type: 'delete',
              data: row.ID
            })
          }}/>
        </TableCell>
    </TableRow>
    )
  }
  
  const renderPhoneRow = (row: any) => {
    return (
      <></>
    )
  }

  const handleRowsPerPageChange = (val: Number) => {
    dispatch(setRowsPerPage(val))
  }

  const handlePageChange = (val: Number) => {
    SetPageState({
      "PageName": "groups",
      "PageNumber": val,
      "SearchTerm": serachData.SearchTerm,
      "SearchData": (serachData.SearchTerm !== '') ? {
        SearchTerm: serachData.SearchTerm,
        PageIndex: val
      } : null,
      "IsDynamic": true
    } as PageProperty);
    setSearchData({ ...serachData, PageIndex: val });
  }

  const renderTablePagination = () => {
    return (
      // @ts-ignore
      <TablePagination
        classes={classes}
        // rows={groupData ? groupData.RecordCount : 0}
        rows={20}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={rowsOptions}
        page={serachData.PageIndex}
        onPageChange={handlePageChange}
      />
    )
  }

  const getDeleteDialog = (data = '') => ({
    title: t('group.delete'),
    showDivider: false,
    content: (
      <Typography style={{ fontSize: 18 }}>
        {t('group.deleteGroupConfirmation')}
      </Typography>
    ),
    onConfirm: async () => {
    }
  })

  const getResultDialog = (data: any) => ({
    title: t('group.delete'),
    showDivider: false,
    content: (
      <></>
    ),
    onConfirm: async () => {
    }
  })

  const getGroupDialog = (data: any) => ({
    title: t('group.delete'),
    showDivider: false,
    content: (
      <></>
    ),
    onConfirm: async () => {
    }
  })

  const renderDialog = () => {
    const { data, type } = dialogType || {}
    // const campaign = newslettersData?.find((e) => { return parseInt(e.CampaignID) === parseInt(data) });

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
            Text={t('master.recipientManagement')}
            classes={classes}
            ContainerStyle={{ border: 'none !important' }}
          />
        </Box>
        {renderTable()}
        {renderTablePagination()}

        <Loader isOpen={showLoader} />
        {toastMessage && renderToast()}
        {renderDialog()}
      </Box>
    </DefaultScreen>
  )
}

export default FileUploads