import {
	Box,
	Button,
	Grid,
	Table,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Typography,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
	CalendarIcon,
	SearchIcon,
} from '../../../assets/images/managment/index';
import ExcelImg from '../../../assets/images/excel.png';
import { Title } from '../../../components/managment/Title';
import { ClassesType } from '../../Classes.types';
import DefaultScreen from '../../DefaultScreen';
import {
	coreProps,
	reportListAPIProps,
} from '../Editor/Types/WhatsappCreator.types';
import ClearIcon from '@material-ui/icons/Clear';
import clsx from 'clsx';
import { BaseSyntheticEvent, useEffect, useState } from 'react';
import moment from 'moment';
import CustomTooltip from '../../../components/Tooltip/CustomTooltip';
import Pagination from '../management/Component/Pagination';
import { KeyboardDatePicker } from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import {
	exportDataProps,
	filtersObjectProps,
	reportDataProps,
	searchArrayProps,
} from '../Campaign/Types/WhatsappCampaign.types';
import { exportAsXLSX } from '../../../helpers/Export/ExportFile';
import { getAllReports } from '../../../redux/reducers/whatsappSlice';
import { Loader } from '../../../components/Loader/Loader';
import { apiStatus, reportCellNames } from '../Constant';
import { CLIENT_CONSTANTS } from '../../../model/Clients/Contants';
import { useNavigate } from 'react-router-dom';
import { GetPageNyName } from '../../../helpers/UI/SessionStorageManager';
import { campaignStatus } from '../Constant';

const WhatsappReports = ({ classes }: ClassesType) => {
	const { t: translator } = useTranslation();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { windowSize } = useSelector(
		(state: { core: coreProps }) => state.core
	);
	const [fromDate, handleFromDate] = useState<MaterialUiPickersDate | null>(
		null
	);
	const [toDate, handleToDate] = useState<MaterialUiPickersDate | null>(null);
	const [campaignNameSearch, setCampaineNameSearch] = useState<string>('');
	const [isSearching, setSearching] = useState<boolean>(false);
	const [page, setPage] = useState<number>(1);
	const [rowsPerPage, setRowsPerPage] = useState<number>(6);

	const [isFromDatePickerOpen, setIsFromDatePickerOpen] =
		useState<boolean>(false);
	const [isToDatePickerOpen, setIsToDatePickerOpen] = useState<boolean>(false);

	const [tableData, setTableData] = useState<reportDataProps[]>([]);

	const [isLoader, setIsLoader] = useState<boolean>(false);
	const [reportListData, setReportListData] = useState<reportDataProps[]>([]);

	const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot };
	const cellStyle = {
		head: classes.tableCellHead,
		body: classes.tableCellBody,
		root: classes.tableCellRoot,
	};
	const dateFormat = 'YYYY-MM-DD HH:mm:ss.FFF';

	useEffect(() => {
		setApiReportData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (
			(fromDate && moment(fromDate).format('DD/MM/YYYY')?.length > 0) ||
			(toDate && moment(toDate).format('DD/MM/YYYY')?.length > 0) ||
			campaignNameSearch?.length > 0
		) {
			setSearching(true);
		}
	}, [fromDate, toDate, campaignNameSearch]);

	const handleFromDateChange = (value: MaterialUiPickersDate | null) => {
		if (toDate && value && value > toDate) {
			handleToDate(null);
		}
		handleFromDate(value);
	};
	const handleCampainNameChange = (event: BaseSyntheticEvent) => {
		setCampaineNameSearch(event.target.value);
	};
	const clearSearch = () => {
		setCampaineNameSearch('');
		handleFromDate(null);
		handleToDate(null);
		setSearching(false);
		setTableData(reportListData);
	};
	const renderNameCell = (row: reportDataProps) => {
		let date = null;
		let text = '';
		date = moment(row.CreateDate, dateFormat);
		text = translator('common.UpdatedOn');

		return (
			<>
				<CustomTooltip
					isSimpleTooltip={false}
					interactive={true}
					classes={{
						tooltip: clsx(classes.tooltipBlack, classes.tooltipPlacement),
						arrow: classes.fBlack,
					}}
					arrow={true}
					style={{ fontSize: 16, fontWeight: 'bold' }}
					placement={'top'}
					title={<Typography noWrap={false}>{row.Name}</Typography>}
					text={row.Name}
					children={undefined}
					icon={undefined}
				/>
				<Typography className={classes.grayTextCell}>
					{`${text} ${date.format('DD/MM/YYYY')} ${date.format('LT')}`}
				</Typography>
			</>
		);
	};

	const getSearchedCampaign = () => {
		const searchArray: searchArrayProps[] = [
			{
				type: 'name',
				campaignName: campaignNameSearch,
			},
			{
				type: 'date',
				fromDate,
				toDate,
			},
		];
		const filtersObject: filtersObjectProps = {
			name: (row: reportDataProps) => {
				return String(row.Name.toLowerCase()).includes(
					campaignNameSearch.toLowerCase()
				);
			},
			date: (row: reportDataProps, values: searchArrayProps) => {
				const { UpdateDate, CreateDate } = row;
				const lastUpdate = CreateDate
					? moment(CreateDate, dateFormat).valueOf()
					: moment(UpdateDate, dateFormat).valueOf();
				const startFromDate =
					(values.fromDate && values.fromDate.hour(0).minute(0).valueOf()) ||
					null;
				const endToDate =
					(values.toDate && values.toDate.hour(23).minute(59).valueOf()) ||
					null;

				if (!values) return true;
				if (fromDate && toDate && startFromDate && endToDate)
					return lastUpdate >= startFromDate && lastUpdate <= endToDate;
				if (fromDate && startFromDate) return lastUpdate >= startFromDate;
				if (toDate && endToDate) return lastUpdate <= endToDate;
				return true;
			},
		};

		let sortData = reportListData;
		searchArray.forEach((values: searchArrayProps) => {
			sortData = sortData.filter((row: reportDataProps) =>
				filtersObject[values.type](row, values)
			);
		});
		return sortData;
	};

	const getRows = () => {
		let sortData = tableData;
		sortData = sortData.slice(
			(page - 1) * rowsPerPage,
			(page - 1) * rowsPerPage + rowsPerPage
		);

		return sortData?.length > 0 ? sortData : [];
	};

	const onSearch = () => {
		setPage(1);
		setTableData(getSearchedCampaign());
	};

	const onTableCellClick = (cellName: string, campaignId: number) => {
		navigate(CLIENT_CONSTANTS.BASEURL, {
			state: {
				...CLIENT_CONSTANTS.QUERY_PARAMS,
				CampaignID: '537500',
				ReportType: CLIENT_CONSTANTS.REPORT_TYPE.ShowMails,
				PageType: CLIENT_CONSTANTS.PAGE_TYPES.SentToCampaignID,
				ResultTitle: `${cellName} - Campaign ID ${campaignId}`,
				PageProperty: GetPageNyName('reports/NewsletterReports'),
			},
		});
	};

	const getTableTypographyCells = (
		title: string,
		value: number,
		cellName: string,
		row: reportDataProps
	) => {
		return (
			<>
				<Typography
					onClick={() =>
						value >= 1 ? onTableCellClick(cellName, row.WACampaignID) : {}
					}
					className={classes.middleText}>
					{value ? value : '0'}
				</Typography>
				<Typography
					onClick={() =>
						value >= 1 ? onTableCellClick(cellName, row.WACampaignID) : {}
					}
					className={classes.middleText}>
					{title}
				</Typography>
			</>
		);
	};

	const onExport = async () => {
		const header: {} = {
			1: 'Campaign Id',
			2: 'Status',
			3: 'Campaign Name',
			4: 'From Number',
			5: 'Total Send Plan',
			6: 'Clicks Count',
			7: 'Unique Clicks Count',
			8: 'Created Date',
			9: 'Total Sent',
			10: 'Total Read',
			11: 'Failure',
			12: 'Removed',
			13: 'Total Feedback',
			14: 'Send Date',
		};
		const exportData: exportDataProps[] = tableData?.map(
			(row: reportDataProps) => {
				let updatedRow: exportDataProps = {
					...row,
					Status: campaignStatus[row.Status],
					CreateDate: row.CreateDate
						? moment(row.CreateDate).format('DD/MM/YYYY')
						: '',
				};
				delete updatedRow.statusId;
				delete updatedRow.TemplateID;
				return updatedRow;
			}
		);
		exportAsXLSX(exportData, header, 'pulseemExport.XLSX', 'Sheet1');
	};

	const setApiReportData = async () => {
		setIsLoader(true);
		const campaignData: reportListAPIProps = await dispatch<any>(
			getAllReports()
		);
		if (campaignData.payload.Status === apiStatus.SUCCESS) {
			setReportListData(campaignData.payload.Data.Items);
			setTableData(campaignData.payload.Data.Items);
			setIsLoader(false);
		} else {
			setReportListData([]);
			setTableData([]);
			setIsLoader(false);
		}
	};

	return (
		<DefaultScreen
			subPage={'manage'}
			currentPage='whatsapp'
			classes={classes}
			customPadding={true}>
			<Title
				Text={translator('whatsappReport.report')}
				Classes={classes.whatsappTemplateTitle}
				ContainerStyle={{}}
				Element={null}
			/>

			<div className={classes.manageWhatsappTemplates}>
				<Grid container spacing={2} className={classes.lineTopMarging}>
					<Grid item>
						<TextField
							variant='outlined'
							size='small'
							value={campaignNameSearch}
							onChange={handleCampainNameChange}
							className={clsx(classes.textField, classes.minWidth252)}
							placeholder={translator(
								'sms.GridBoundColumnResource2.HeaderText'
							)}
						/>
					</Grid>

					{windowSize !== 'xs' && (
						<Grid item>
							<KeyboardDatePicker
								inputVariant='outlined'
								className={clsx(classes.textField)}
								inputProps={{
									className: classes.datePickerInput,
								}}
								variant='inline'
								keyboardIcon={<CalendarIcon />}
								format={'DD/MM/YYYY'}
								placeholder={translator('whatsappReport.fromDate')}
								initialFocusedDate={moment()}
								value={fromDate}
								onChange={handleFromDateChange}
								onClose={() => setIsFromDatePickerOpen(false)}
								open={isFromDatePickerOpen}
								onClick={() => setIsFromDatePickerOpen(true)}
								autoOk={true}
							/>
						</Grid>
					)}

					{windowSize !== 'xs' && (
						<Grid item>
							<KeyboardDatePicker
								inputVariant='outlined'
								className={clsx(classes.textField)}
								inputProps={{
									className: classes.datePickerInput,
								}}
								variant='inline'
								keyboardIcon={<CalendarIcon />}
								format={'DD/MM/YYYY'}
								placeholder={translator('whatsappReport.toDate')}
								initialFocusedDate={moment()}
								minDate={moment(fromDate)}
								value={toDate}
								onChange={handleToDate}
								onClose={() => setIsToDatePickerOpen(false)}
								open={isToDatePickerOpen}
								onClick={() => setIsToDatePickerOpen(true)}
								autoOk={true}
							/>
						</Grid>
					)}

					<Grid item>
						<Button
							size='large'
							variant='contained'
							onClick={onSearch}
							className={classes.searchButton}
							endIcon={<SearchIcon />}>
							{translator('campaigns.btnSearchResource1.Text')}
						</Button>
					</Grid>
					{isSearching && (
						<Grid item>
							<Button
								size='large'
								variant='contained'
								onClick={clearSearch}
								className={classes.searchButton}
								endIcon={<ClearIcon />}>
								{translator('common.clear')}
							</Button>
						</Grid>
					)}
				</Grid>

				<Grid
					container
					spacing={2}
					className={classes.whatsappReportHeaderButtons}>
					<div className={classes.whatsappReportHeaderExportButton}>
						<Button onClick={onExport}>
							<img src={ExcelImg} alt='excel-icon' />
							{translator('whatsappReport.export')}
						</Button>
					</div>

					<span className={classes.whatsappReportCampaignCount}>
						{tableData?.length || 0} {translator('whatsappReport.campaigns')}
					</span>
				</Grid>

				<Grid
					container
					spacing={2}
					className={classes.whatsappReportTableWrapper}>
					<TableContainer>
						<Table className={classes.tableContainer}>
							{windowSize !== 'xs' && (
								<TableHead>
									<TableRow classes={rowStyle}>
										<TableCell classes={cellStyle} align='center'>
											<>
												{translator('sms.GridBoundColumnResource2.HeaderText')}
											</>
										</TableCell>
										<TableCell classes={cellStyle} align='center'>
											<Grid container justifyContent='space-around'>
												<Grid item>
													<>
														{translator(
															'mainReport.locTotalSendPlan.HeaderText'
														)}
													</>
												</Grid>
												<Grid item>
													<>{translator('common.Sent')}</>
												</Grid>
											</Grid>
										</TableCell>
										<TableCell classes={cellStyle} align='center'>
											<>{translator('whatsappReport.read')}</>
										</TableCell>
										<TableCell classes={cellStyle} align='center'>
											<>{translator('common.Clicks')}</>
										</TableCell>
										<TableCell classes={cellStyle} align='center'>
											<>{translator('common.Feedback')}</>
										</TableCell>
										<TableCell classes={cellStyle} align='center'>
											<>{}</>
										</TableCell>
										<TableCell classes={cellStyle} align='center'>
											<>{translator('common.revenue')}</>
										</TableCell>
									</TableRow>
								</TableHead>
							)}
							{getRows()?.length === 0 ? (
								<Box
									className={clsx(classes.flex, classes.justifyCenterOfCenter)}
									style={{ height: 50 }}>
									<Typography>
										{translator('common.NoDataTryFilter')}
									</Typography>
								</Box>
							) : (
								<>
									{getRows()?.map((report: reportDataProps, index: number) => (
										<TableRow
											key={`whatsappReport_${report.WACampaignID}_${index}`}
											classes={rowStyle}>
											<TableCell
												classes={cellStyle}
												align='center'
												className={clsx(classes.tableCellBody)}>
												{renderNameCell(report)}
											</TableCell>
											<TableCell
												classes={cellStyle}
												align='center'
												className={clsx(classes.tableCellBody)}>
												<Grid container justifyContent='space-around'>
													<Grid
														item
														className={`${report?.ToSend >= 1 && 'underline'}`}>
														{getTableTypographyCells(
															translator(
																'mainReport.locTotalSendPlan.HeaderText'
															),
															report.ToSend,
															reportCellNames.TOSEND,
															report
														)}
													</Grid>
													<Grid
														item
														className={`${report?.Sent >= 1 && 'underline'}`}>
														{getTableTypographyCells(
															translator('common.Sent'),
															report.Sent,
															reportCellNames.SENT,
															report
														)}
													</Grid>
												</Grid>
											</TableCell>
											<TableCell
												classes={cellStyle}
												align='center'
												className={clsx(
													classes.tableCellBody,
													`${report?.Read >= 1 && 'underline'}`
												)}>
												{getTableTypographyCells(
													translator('whatsappReport.read'),
													report.Read,
													reportCellNames.READ,
													report
												)}
											</TableCell>
											<TableCell
												classes={cellStyle}
												align='center'
												className={clsx(classes.tableCellBody)}>
												<Grid container justifyContent='space-around'>
													<Grid
														item
														className={`${
															report?.ClicksCount >= 1 && 'underline'
														}`}>
														{getTableTypographyCells(
															translator('common.Clicks'),
															report.ClicksCount,
															reportCellNames.CLICKS,
															report
														)}
													</Grid>
													<Grid
														item
														className={`${
															report?.UniqueClicksCount >= 1 && 'underline'
														}`}>
														{getTableTypographyCells(
															translator('common.Unique'),
															report.UniqueClicksCount,
															reportCellNames.UNIQUE,
															report
														)}
													</Grid>
												</Grid>
											</TableCell>
											<TableCell
												classes={cellStyle}
												align='center'
												className={clsx(
													classes.tableCellBody,
													`${report?.FeedBack >= 1 && 'underline'}`
												)}>
												{getTableTypographyCells(
													translator('common.Total'),
													report.FeedBack,
													reportCellNames.FEEDBACK,
													report
												)}
											</TableCell>
											<TableCell
												classes={cellStyle}
												align='center'
												className={clsx(classes.tableCellBody)}>
												<Grid container justifyContent='space-around'>
													<Grid
														item
														className={`${
															report?.Removed >= 1 && 'underline'
														}`}>
														{getTableTypographyCells(
															translator('common.Removed'),
															report.Removed,
															reportCellNames.REMOVED,
															report
														)}
													</Grid>
													<Grid
														item
														className={`${report?.Failed >= 1 && 'underline'}`}>
														{getTableTypographyCells(
															translator('common.failedStatus'),
															report.Failed,
															reportCellNames.FAILED,
															report
														)}
													</Grid>
												</Grid>
											</TableCell>
											<TableCell
												component='th'
												scope='row'
												className={clsx(classes.tableCellRoot)}>
												{/* {'Revenue'} */}
											</TableCell>
										</TableRow>
									))}
								</>
							)}
						</Table>
					</TableContainer>
				</Grid>
				<Pagination
					classes={classes}
					rows={tableData?.length}
					rowsPerPage={rowsPerPage}
					onRowsPerPageChange={(rowsNumber: number) =>
						setRowsPerPage(rowsNumber)
					}
					rowsPerPageOptions={[6, 10, 20, 50]}
					page={page}
					onPageChange={(pageNumber: number) => setPage(pageNumber)}
					returnPageOne={false}
				/>
			</div>
			<Loader isOpen={isLoader} showBackdrop={true} />
		</DefaultScreen>
	);
};

export default WhatsappReports;
