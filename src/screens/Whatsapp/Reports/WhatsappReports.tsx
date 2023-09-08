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
	CommonRedux,
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
	phoneNumberAPIProps,
	reportDataProps,
} from '../Campaign/Types/WhatsappCampaign.types';
import { exportAsXLSX } from '../../../helpers/Export/ExportFile';
import {
	getAllReports,
	userPhoneNumbers,
} from '../../../redux/reducers/whatsappSlice';
import { Loader } from '../../../components/Loader/Loader';
import {
	allReportInitialPagination,
	apiStatus,
	reportCellNames,
} from '../Constant';
import { CLIENT_CONSTANTS } from '../../../model/Clients/Contants';
import { useNavigate } from 'react-router-dom';
import { GetPageNyName } from '../../../helpers/UI/SessionStorageManager';
import { campaignStatus } from '../Constant';
import {
	AllReportReq,
	PageTypeRequest,
} from '../management/Types/Management.types';
import { setRowsPerPage } from '../../../redux/reducers/coreSlice';
import NoSetup from '../NoSetup/NoSetup';

const WhatsappReports = ({ classes }: ClassesType) => {
	const { t: translator } = useTranslation();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { isRTL, windowSize, rowsPerPage } = useSelector(
		(state: { core: coreProps }) => state.core
	);
	const { accountFeatures } = useSelector(
		(state: { common: CommonRedux }) => state.common
	);
	const [fromDate, handleFromDate] = useState<MaterialUiPickersDate | null>(
		null
	);
	const [toDate, handleToDate] = useState<MaterialUiPickersDate | null>(null);
	const [campaignNameSearch, setCampaineNameSearch] = useState<string>('');
	const [isSearching, setSearching] = useState<boolean>(false);
	const [hasRevenue, setHasRevenue] = useState<boolean>(false);
	const [totalRecord, setTotalRecord] = useState<number>(0);

	const [isFromDatePickerOpen, setIsFromDatePickerOpen] =
		useState<boolean>(false);
	const [isToDatePickerOpen, setIsToDatePickerOpen] = useState<boolean>(false);

	const [isAccountSetup, setIsAccountSetup] = useState<boolean>(true);
	const [isLoader, setIsLoader] = useState<boolean>(false);
	const [reportListData, setReportListData] = useState<reportDataProps[]>([]);
	// const [accountFeatures, setAccountFeatures] = useState<number[]>([]);

	const [paginationSetting, setPaginationSetting] = useState<AllReportReq>(
		allReportInitialPagination
	);

	const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot };
	const cellStyle = {
		head: classes.tableCellHead,
		body: classes.tableCellBody,
		root: classes.tableCellRoot,
	};
	const dateFormat = 'YYYY-MM-DD HH:mm:ss.FFF';

	useEffect(() => {
		(async () => {
			setIsLoader(true);
			const { payload: phoneNumberData }: phoneNumberAPIProps =
				await dispatch<any>(userPhoneNumbers());
			if (
				phoneNumberData?.Status === apiStatus.SUCCESS &&
				phoneNumberData?.Data &&
				phoneNumberData?.Data?.length > 0
			) {
				setApiReportData(
					rowsPerPage
						? { ...paginationSetting, pageSize: Number(rowsPerPage) }
						: paginationSetting
				);
				if (rowsPerPage) {
					setPaginationSetting({
						...paginationSetting,
						pageSize: Number(rowsPerPage),
					});
				}
			} else {
				setIsLoader(false);
				setIsAccountSetup(false);
			}
		})();
		/**
		 * we disable it because we want to run this code only when component loads
		 */
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (
			accountFeatures &&
			accountFeatures?.map((feature) => feature?.toString()).includes('42')
		) {
			setHasRevenue(true);
		}
	}, [accountFeatures]);

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

		const updatedPagination: AllReportReq = {
			...paginationSetting,
			pageNo: 1,
			campaignName: '',
			fromDate: null,
			toDate: null,
		};
		setPaginationSetting(updatedPagination);
		setApiReportData(updatedPagination);
	};

	const renderNameCell = (row: reportDataProps) => {
		let date = null;
		let text = '';
		date = moment(row.UpdateDate, dateFormat);
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
					titleStyle={undefined}
					children={undefined}
					icon={undefined}
				/>
				<Typography className={classes.grayTextCell}>
					{`${text} ${date.format('DD/MM/YYYY')} ${date.format('LT')}`}
				</Typography>
			</>
		);
	};

	const onSearch = () => {
		const updatedPagination: AllReportReq = {
			...paginationSetting,
			pageNo: 1,
			campaignName: campaignNameSearch || '',
			fromDate: fromDate || null,
			toDate: toDate || null,
		};
		setPaginationSetting(updatedPagination);
		setApiReportData(updatedPagination);
	};

	const onTableCellClick = (cellName: string, campaignId: number) => {
		const pageTypeRequest: PageTypeRequest = {
			Failed: CLIENT_CONSTANTS.PAGE_TYPES.WhatsappFailed,
			Read: CLIENT_CONSTANTS.PAGE_TYPES.WhatsappRead,
			Sent: CLIENT_CONSTANTS.PAGE_TYPES.WhatsappSentCount,
			Removed: CLIENT_CONSTANTS.PAGE_TYPES.WhatsappRemoved,
			Unique: CLIENT_CONSTANTS.PAGE_TYPES.WhatsappUniqueClick,
			Revenue: CLIENT_CONSTANTS.PAGE_TYPES.WhatsappRevenue,
		};
		if (cellName !== reportCellNames.UNIQUE) {
			if (cellName === reportCellNames.REVENUE) {
				navigate(`${CLIENT_CONSTANTS.BASEURL}/${campaignId}`, {
					state: {
						...CLIENT_CONSTANTS.QUERY_PARAMS,
						CampaignID: campaignId,
						PageType: pageTypeRequest[cellName],
						ReportType: CLIENT_CONSTANTS.REPORT_TYPE.ShowWhatsapp,
						ResultTitle: `${cellName} - ${translator(
							'whatsappReport.WhatsAppCampaign'
						)} ID ${campaignId}`,
						PageProperty: GetPageNyName('reports/WhatsappReports'),
					},
				});
			} else {
				navigate(CLIENT_CONSTANTS.BASEURL, {
					state: {
						...CLIENT_CONSTANTS.QUERY_PARAMS,
						CampaignID: campaignId,
						PageType: pageTypeRequest[cellName],
						ResultTitle: `${cellName} - Campaign ID ${campaignId}`,
						PageProperty: GetPageNyName('reports/WhatsappReports'),
					},
				});
			}
		} else {
			const win: Window = window;
			win.location = `/Pulseem/WhatsappLinksClicksReport.aspx?CampaignID=${campaignId}&fromreact=true&Culture=${
				isRTL ? 'he-IL' : 'en-US'
			}`;
		}
	};

	const getTableTypographyCells = (
		title: string,
		cellValue: number,
		cellName: string,
		row: reportDataProps,
		isClickable: boolean = false
	) => {
		const amountCell: string[] = [
			reportCellNames.REVENUE,
			reportCellNames.COST,
		];
		return (
			<>
				<Typography
					onClick={() =>
						cellValue >= 1 && isClickable
							? onTableCellClick(cellName, row.WACampaignID)
							: {}
					}
					className={clsx(
						classes.middleText,
						`${cellValue >= 1 && isClickable && 'value-cell'}`
					)}>
					{amountCell.includes(cellName)
						? `${cellValue ? cellValue.toLocaleString() : '0'} ${translator(
								'common.NIS'
						  )}`
						: cellValue || '0'}
				</Typography>
				{!amountCell.includes(cellName) && (
					<Typography
						onClick={() =>
							cellValue >= 1 && isClickable
								? onTableCellClick(cellName, row.WACampaignID)
								: {}
						}
						className={clsx(
							classes.middleText,
							`${cellValue >= 1 && isClickable && 'value-cell'}`
						)}>
						{title}
					</Typography>
				)}
			</>
		);
	};

	const onExport = async () => {
		let header: { [key: number]: string } = {
			1: 'Campaign Number',
			2: 'Campaign Name',
			3: 'From Number',
			4: 'Total Send Plan',
			5: 'Total Sent',
			6: 'Total Read',
			7: 'Clicks Count',
			8: 'Unique Clicks Count',
			9: 'Removed',
			10: 'Failure',
			11: 'Status',
			12: 'Cost',
			13: 'Revenue',
			14: 'Created Date',
			15: 'Update Date',
		};

		setIsLoader(true);
		const { payload: campaignData }: reportListAPIProps = await dispatch<any>(
			getAllReports({
				...paginationSetting,
				isPagination: false,
			})
		);
		setIsLoader(false);
		if (campaignData.Status === apiStatus.SUCCESS) {
			let exportData: exportDataProps[] = campaignData?.Data?.Items?.map(
				(row: reportDataProps) => {
					let updatedRow: exportDataProps = {
						WACampaignID: row.WACampaignID,
						Name: row?.Name,
						FromNumber: row?.FromNumber,
						ToSend: row?.ToSend,
						Sent: row?.Sent,
						Read: row?.Read,
						ClicksCount: row?.ClicksCount,
						UniqueClicksCount: row?.UniqueClicksCount,
						Removed: row?.Removed,
						Failed: row?.Failed,
						Status: campaignStatus[row.Status],
						Cost: row?.Cost,
						Revenue: row?.Revenue,
						CreateDate: row?.CreateDate
							? moment(row?.CreateDate).format('DD/MM/YYYY')
							: '',
						UpdateDate: row?.UpdateDate
							? moment(row?.UpdateDate).format('DD/MM/YYYY')
							: '',
					};
					return updatedRow;
				}
			);
			if (!hasRevenue) {
				delete header[13];
				exportData = exportData?.map((data) => {
					delete data?.Revenue;
					return data;
				});
			}
			exportAsXLSX(
				exportData,
				header,
				`${translator('whatsappReport.report')}.XLSX`,
				`${translator('whatsappReport.report')}.XLSX`
			);
		}
	};

	const setApiReportData = async (
		pagination: AllReportReq = paginationSetting
	) => {
		setIsLoader(true);
		const campaignData: reportListAPIProps = await dispatch<any>(
			getAllReports(pagination)
		);
		setIsLoader(false);
		if (campaignData.payload.Status === apiStatus.SUCCESS) {
			setReportListData(campaignData.payload.Data.Items);
			setTotalRecord(campaignData?.payload?.Data?.TotalRecord);
		} else {
			setReportListData([]);
			setTotalRecord(0);
		}
	};

	const updatePaginationSetting = (pagination: AllReportReq) => {
		setApiReportData(pagination);
		setPaginationSetting(pagination);
	};

	const onRowsPerPageChange = (rowsNumber: number) => {
		dispatch(setRowsPerPage(rowsNumber));
		updatePaginationSetting({
			...paginationSetting,
			pageSize: rowsNumber,
			pageNo: 1,
		});
	};

	const onTemplateKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		const keyCode = e.keyCode ? e.keyCode : e.which;
		if (keyCode === 13) {
			onSearch();
		}
	};

	return (
		<DefaultScreen
			subPage={'WhatsappReports'}
			currentPage='reports'
			classes={classes}
			customPadding={false}
			containerClass={clsx(classes.management, classes.mb50)}
		>
			{isAccountSetup ? (
				<>
					<Box className={'topSection'}>
						<Title
							Text={translator('whatsappReport.report')}
							classes={classes}
							ContainerStyle={{}}
							Element={null}
						/>
					</Box>

					<div className={classes.manageWhatsappTemplates}>
						<Grid container spacing={2} className={classes.lineTopMarging}>
							<Grid item>
								<TextField
									variant='outlined'
									size='small'
									value={campaignNameSearch}
									onChange={handleCampainNameChange}
									onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
										onTemplateKeyDown(e)
									}
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
									<>{translator('campaigns.btnSearchResource1.Text')}</>
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
										<>{translator('common.clear')}</>
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
									<>{translator('whatsappReport.export')}</>
								</Button>
							</div>

							<span className={classes.whatsappReportCampaignCount}>
								<>
									{totalRecord || 0} {translator('whatsappReport.campaigns')}
								</>
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
												<TableCell
													classes={cellStyle}
													className={classes.flex3}
													align='center'>
													<>
														{translator(
															'sms.GridBoundColumnResource2.HeaderText'
														)}
													</>
												</TableCell>
												<TableCell
													classes={cellStyle}
													className={classes.flex2}
													align='center'>
													<Grid container justifyContent='space-around'>
														<Grid item>
															<>
																{translator(
																	'mainReport.locTotalSendPlan.HeaderText'
																)}
															</>
														</Grid>
														<Grid item>
															<>{translator('whatsappReport.sent')}</>
														</Grid>
													</Grid>
												</TableCell>
												<TableCell
													classes={cellStyle}
													className={classes.flex1}
													align='center'>
													<>{translator('whatsappReport.read')}</>
												</TableCell>
												<TableCell
													classes={cellStyle}
													className={classes.flex2}
													align='center'>
													<>{translator('whatsappReport.clicks')}</>
												</TableCell>
												<TableCell
													classes={cellStyle}
													className={classes.flex2}
													align='center'>
													<>{}</>
												</TableCell>
												<TableCell
													classes={cellStyle}
													className={classes.flex1}
													align='center'>
													<>{translator('whatsappReport.cost')}</>
												</TableCell>
												{hasRevenue && (
													<TableCell
														classes={cellStyle}
														className={classes.flex1}
														align='center'>
														<>{translator('common.revenue')}</>
													</TableCell>
												)}
											</TableRow>
										</TableHead>
									)}
									{reportListData?.length === 0 ? (
										<Box
											className={clsx(
												classes.flex,
												classes.justifyCenterOfCenter
											)}
											style={{ height: 50 }}>
											<Typography>
												<>{translator('common.NoDataTryFilter')}</>
											</Typography>
										</Box>
									) : (
										<>
											{reportListData?.map(
												(report: reportDataProps, index: number) => (
													<TableRow
														key={`whatsappReport_${report.WACampaignID}_${index}`}
														classes={rowStyle}>
														<TableCell
															classes={cellStyle}
															align='center'
															className={clsx(
																classes.tableCellBody,
																classes.flex3
															)}>
															{renderNameCell(report)}
														</TableCell>
														<TableCell
															classes={cellStyle}
															align='center'
															className={clsx(
																classes.tableCellBody,
																classes.flex2
															)}>
															<Grid container justifyContent='space-around'>
																<Grid item>
																	{getTableTypographyCells(
																		translator('whatsappReport.toSend'),
																		report.ToSend,
																		reportCellNames.TOSEND,
																		report
																	)}
																</Grid>
																<Grid
																	item
																	className={`${
																		report?.Sent >= 1 && 'underline'
																	}`}>
																	{getTableTypographyCells(
																		translator('whatsappReport.sent'),
																		report.Sent,
																		reportCellNames.SENT,
																		report,
																		true
																	)}
																</Grid>
															</Grid>
														</TableCell>
														<TableCell
															classes={cellStyle}
															align='center'
															className={clsx(
																classes.tableCellBody,
																`${report?.Read >= 1 && 'underline'}`,
																classes.flex1
															)}>
															{getTableTypographyCells(
																translator('whatsappReport.read'),
																report.Read,
																reportCellNames.READ,
																report,
																true
															)}
														</TableCell>
														<TableCell
															classes={cellStyle}
															align='center'
															className={clsx(
																classes.tableCellBody,
																classes.flex2
															)}>
															<Grid container justifyContent='space-around'>
																<Grid item>
																	{getTableTypographyCells(
																		translator('whatsappReport.clicks'),
																		report.ClicksCount,
																		reportCellNames.CLICKS,
																		report
																	)}
																</Grid>
																<Grid
																	item
																	className={`${
																		report?.UniqueClicksCount >= 1 &&
																		'underline'
																	}`}>
																	{getTableTypographyCells(
																		translator('whatsappReport.unique'),
																		report.UniqueClicksCount,
																		reportCellNames.UNIQUE,
																		report,
																		true
																	)}
																</Grid>
															</Grid>
														</TableCell>
														<TableCell
															classes={cellStyle}
															align='center'
															className={clsx(
																classes.tableCellBody,
																classes.flex2,
																`${!hasRevenue && classes.tableCellNoBorder}`
															)}>
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
																		report,
																		true
																	)}
																</Grid>
																<Grid
																	item
																	className={`${
																		report?.Failed >= 1 && 'underline'
																	}`}>
																	{getTableTypographyCells(
																		translator('common.failedStatus'),
																		report.Failed,
																		reportCellNames.FAILED,
																		report,
																		true
																	)}
																</Grid>
															</Grid>
														</TableCell>
														<TableCell
															classes={cellStyle}
															align='center'
															className={clsx(
																classes.tableCellBody,
																classes.flex1,
																classes.revenueTableCell
															)}>
															{getTableTypographyCells(
																translator('whatsappReport.cost'),
																report?.Cost,
																reportCellNames.COST,
																report
															)}
														</TableCell>
														{hasRevenue && (
															<TableCell
																classes={cellStyle}
																align='center'
																className={clsx(
																	classes.tableCellBody,
																	classes.flex1,
																	classes.tableCellNoBorder,
																	classes.revenueTableCell,
																	`${
																		report && report?.Revenue > 0
																			? classes.revenueTableCellPointer
																			: ''
																	}`
																)}>
																{getTableTypographyCells(
																	translator('common.revenue'),
																	report.Revenue,
																	reportCellNames.REVENUE,
																	report,
																	true
																)}
															</TableCell>
														)}
													</TableRow>
												)
											)}
										</>
									)}
								</Table>
							</TableContainer>
						</Grid>
						<Pagination
							classes={classes}
							rows={totalRecord}
							rowsPerPage={paginationSetting?.pageSize}
							onRowsPerPageChange={onRowsPerPageChange}
							rowsPerPageOptions={[6, 10, 20, 50]}
							page={paginationSetting?.pageNo}
							onPageChange={(pageNumber: number) =>
								updatePaginationSetting({
									...paginationSetting,
									pageNo: pageNumber,
								})
							}
							returnPageOne={false}
						/>
					</div>
				</>
			) : (
				!isLoader && <NoSetup classes={classes} />
			)}
			<Loader isOpen={isLoader} showBackdrop={true} />
		</DefaultScreen>
	);
};

export default WhatsappReports;
