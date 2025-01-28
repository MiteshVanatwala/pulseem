import { useState, useEffect } from 'react';
import DefaultScreen from '../../DefaultScreen'
import clsx from 'clsx';
import moment from 'moment';
import {
    Typography, Divider, Table, TableBody, TableRow, TableHead, TableCell, TableContainer, Box, Grid
} from '@material-ui/core'
import { TablePagination } from '../../../components/managment/index'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Loader } from '../../../components/Loader/Loader';
import { setRowsPerPage } from '../../../redux/reducers/coreSlice';
import CustomTooltip from '../../../components/Tooltip/CustomTooltip';
import Toast from '../../../components/Toast/Toast.component';
import { PulseemReactInstance } from '../../../helpers/Api/PulseemReactAPI';
import { get, includes } from 'lodash';
import { DateFormats, rowsOptions } from '../../../helpers/Constants';
import { ERROR_TYPE } from '../../../helpers/Types/common';
import { Title } from '../../../components/managment/Title';

const DownloadFiles = ({ classes }: any) => {
    const { language, windowSize, rowsPerPage, userRoles } = useSelector((state: any) => state.core)
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const [fileDownoadList, setFileDownloadList] = useState([]);
    const [progressList, setProgressList] = useState({});
    const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot }
    const cellStyle = { head: classes.tableCellHead, body: classes.tableCellBody, root: classes.tableCellRoot }
    const [showLoader, setLoader] = useState(true);
    const [toastMessage, setToastMessage] = useState<ERROR_TYPE>(null);

    const dispatch = useDispatch();
    moment.locale(language);
    const getData = async () => {
        await getDownloadFileList();
        setLoader(false);
    }

    useEffect(() => {
        setLoader(true);
        getData();
    }, [])

    const renderHeader = () => {
        return (
            <>
                <Typography className={classes.managementTitle}>
                    {/* @ts-ignore */}
                    {t('master.fileDownload')}
                </Typography>
                <Divider />
            </>
        )
    }

    const renderTableHead = () => {
        return (
            <TableHead>
                <TableRow classes={rowStyle}>
                    {/* @ts-ignore */}
                    <TableCell classes={cellStyle} className={classes.flex5} align='center'>{t("report.fileName")}</TableCell>
                    {/* @ts-ignore */}
                    <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("common.Status")}</TableCell>
                    {/* @ts-ignore */}
                    <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("common.CreationDate")}</TableCell>
                    {/* @ts-ignore */}
                    {userRoles.AllowExport && <TableCell classes={cellStyle} className={clsx(classes.flex1, classes.noBorderOnLastCell)} align='center'>{t("master.download")}</TableCell>}
                </TableRow>
            </TableHead>
        )
    }

    const renderStatusCell = (status: number) => {
        interface Istatuses {
            [key: string]: string;
        }
        const statuses: Istatuses = {
            1: 'report.InProcess',
            2: 'report.ReadyForDownload',
            4: 'report.ReadyForDownload',
            5: 'report.Failed'
        }
        return (
            <>
                <Typography className={clsx(
                    classes.middleText,
                    classes.recipientsStatus,
                    {
                        [classes.recipientsStatusSending]: status === 1,
                        [classes.recipientsStatusSent]: includes([2, 4], status),
                        [classes.recipientsStatusCanceled]: status === 5
                    },
                    classes.font15
                )}>
                    {/* @ts-ignore */}
                    {t(statuses[status])}
                </Typography>
            </>
        )
    }

    const renderActionCell = (row: any) => {
        return includes([2, 4], row.Status) && (
            <>
                {
                    get(progressList, row.ID, 0) > 0 ? (
                        `${get(progressList, row.ID)}% ${t('report.Completed')}`
                    ) : (
                        <Grid container spacing={1}>
                            <Grid item sm={6} className={clsx(classes.justifyCenterOfCenter)}>
                                <Typography
                                    onClick={() => downloadFile(row.ID, row.FileName, 'XLS', row.SourceFileName)}
                                    className={classes.blueLink}
                                >XLS</Typography>
                            </Grid>
                            <Grid item sm={6} className={clsx(classes.justifyCenterOfCenter, classes.blueLink)}>
                                <Typography
                                    onClick={() => downloadFile(row.ID, row.FileName, 'CSV', row.SourceFileName)}
                                    className={classes.blueLink}
                                >CSV</Typography>
                            </Grid>
                        </Grid>
                    )
                }
            </>
        )
    }

    const getDownloadFileList = async () => {
        const response = await PulseemReactInstance.get(`/LargeFiles/GetAllFiles`);
        setFileDownloadList(response.data.Data)
    }

    const setPercentage = (ID: number, percentage: number) => {
        setProgressList({
            ...progressList,
            [ID]: percentage
        })
    }

    const downloadFile = async (fileID: number, FileName: string, Type: string, SourceFileName: string) => {
        window.open(`/Pulseem/DownloadFile.aspx?fileFormat=${Type}&fileId=${fileID}`);
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
                titleStyle={undefined}
                title={<Typography noWrap={false}>{row.FileName}</Typography>}
                text={row.FileName} icon={undefined} style={undefined}>
                <Typography noWrap={false}>{row.SourceFileName && row.SourceFileName != '' && row.SourceFileName != null ? row.SourceFileName : row.FileName}</Typography>
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
                    className={classes.flex5}>
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
                    className={classes.flex1}>
                    {moment(row.CreationDate).format(DateFormats.DATE_TIME_24)}
                </TableCell>
                {userRoles.AllowExport && <TableCell
                    classes={cellStyle}
                    align='center'
                    className={clsx(classes.flex1, classes.noBorderOnLastCell)}>
                    {renderActionCell(row)}
                </TableCell>}
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
        let sortData = fileDownoadList;
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

    const renderToast = () => {
        setTimeout(() => {
            setToastMessage(null);
        }, 4000);
        return <Toast data={toastMessage} />;
    };

    const renderTablePagination = () => {
        return (
            <TablePagination
                classes={classes}
                rows={fileDownoadList.length}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(val: any) => dispatch(setRowsPerPage(val))}
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
            <Box className={'topSection onlyTitleBar'}>
                <Title Text={t('master.fileDownload')} classes={classes} ContainerStyle={{ border: 'none !important' }} />
            </Box>
            {renderTable()}
            {renderTablePagination()}
            <Loader isOpen={showLoader} />
            {toastMessage && renderToast()}
        </DefaultScreen>
    )
}

export default DownloadFiles