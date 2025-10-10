import {
	Box,
	Button,
	FormControlLabel,
	Grid,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Typography,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { CalendarIcon } from '../../../assets/images/managment/index';
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
import { TablePagination } from '../../../components/managment';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { DateFormats, SizeOptions_XS_SM, TierFeatures } from '../../../helpers/Constants';
import PulseemSwitch from '../../../components/Controlls/PulseemSwitch';
import { sitePrefix } from '../../../config';
import { LinksClicksReport } from '../../../config/enum';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import { findPlanByFeatureCode } from '../../../redux/reducers/TiersSlice';
import TierPlans from '../../../components/TierPlans/TierPlans';
import { get } from 'lodash';

const WhatsappReports = ({ classes }: ClassesType) => {
	const { t: translator } = useTranslation();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { isRTL, windowSize, rowsPerPage, userRoles } = useSelector(
		(state: { core: coreProps }) => state.core
	);
	const { accountFeatures, currencySymbol, isCurrencySymbolPrefix, subAccount } = useSelector(
		(state: { common: CommonRedux }) => state.common
	);
	const { currentPlan, availablePlans } = useSelector((state: any) => state.tiers);
	const [fromDate, handleFromDate] = useState<MaterialUiPickersDate | null>(
		null
	);
	const [toDate, handleToDate] = useState<MaterialUiPickersDate | null>(null);
	const [campaignNameSearch, setCampaineNameSearch] = useState<string>('');
	const [isSearching, setSearching] = useState<boolean>(false);
	const [hasRevenue, setHasRevenue] = useState<boolean>(false);
	const [totalRecord, setTotalRecord] = useState<number>(0);
	const [includeTestCampaigns, setIncludeTestCampaigns] = useState(false)
	const [showTierPlans, setShowTierPlans] = useState(false);
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
	const [dialogType, setDialogType] = useState<{type: string} | null>(null);
	const [TierMessageCode, setTierMessageCode] = useState<string>('');

	const handleGetPlanForFeature = (tierMessageCode: string) => {
		const planName = findPlanByFeatureCode(
			tierMessageCode,
			availablePlans,
			currentPlan.Id
		);
		
		if (planName) {
			return translator('billing.tier.featureNotAvailable').replace('{feature}', translator(TierFeatures[tierMessageCode as keyof typeof TierFeatures] || tierMessageCode)).replace('{planName}', planName);
		} else {
			return translator('billing.tier.noFeatureAvailable');
		}
	};

	const getTierValidationDialog = () => ({
		type: 'tier',
		title: translator('billing.tier.permission'),
		showDivider: false,
		content: (
			<Typography style={{ fontSize: 18 }} className={clsx(classes.textCenter)}>
				{handleGetPlanForFeature(TierMessageCode)}
			</Typography>
		),
		renderButtons: () => (
			<Grid
				container
				spacing={2}
				className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null, !get(subAccount, 'CompanyAdmin', false) ? classes.dNone : '')}
			>
				<Grid item>
					<Button
						onClick={() => {
						setDialogType(null);
						setShowTierPlans(true);
					}}
					className={clsx(classes.btn, classes.btnRounded)}
					>
						{translator('billing.upgradePlan')}
					</Button>
				</Grid>
				<Grid item>
					<Button
						onClick={() => setDialogType(null)}
						className={clsx(classes.btn, classes.btnRounded)}
					>
						{translator('common.cancel')}
					</Button>
				</Grid>
			</Grid>
		)
	});

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

	useEffect(() => {
		onSearch();
	}, [includeTestCampaigns])

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
		setIncludeTestCampaigns(false);

		const updatedPagination: AllReportReq = {
			...paginationSetting,
			pageNo: 1,
			campaignName: '',
			fromDate: null,
			toDate: null,
			IsTestCampaign: false
		};
		setPaginationSetting(updatedPagination);
		setApiReportData(updatedPagination);
	};

	const renderNameCell = (row: reportDataProps) => {
		let date = null;
		let text = '';
		if (!row?.SendDate) {
			date = moment(row.UpdateDate, dateFormat);
			text = translator('common.UpdatedOn');
		} else {
			date = moment(row.SendDate, dateFormat);
			const dateMillis = date.valueOf();
			const currentDateMillis = moment().valueOf();
			text =
				dateMillis > currentDateMillis
					? translator('common.ScheduledFor')
					: translator('common.SentOn');
		}

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
					{`${text} ${date.format(DateFormats.DATE_TIME_24)}`}
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
			IsTestCampaign: includeTestCampaigns,
		};
		setPaginationSetting(updatedPagination);
		setApiReportData(updatedPagination);
	};

	const onTableCellClick = (cellName: string, campaignId: number) => {
		if (userRoles?.HideRecipients) {
			return;
		}

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
				navigate(`${CLIENT_CONSTANTS.BASEURL}`, {
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
			const campaign = reportListData.find(item => item.WACampaignID === campaignId);
  		const campaignName = campaign ? campaign.Name : '';
			navigate(`${sitePrefix}reports/LinksClicksReport`, {
				state: {
					type: LinksClicksReport.WhatsApp,
					campaignId: campaignId,
					campaignName: campaignName
				}
			})
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
						? (
							cellName === reportCellNames.REVENUE ?
								`${isCurrencySymbolPrefix ? currencySymbol : ''} ${cellValue ? cellValue.toFixed(2) : '0'}  ${!isCurrencySymbolPrefix ? currencySymbol : ''}`
								: `${cellValue ? cellValue.toFixed(2) : '0'} ${translator('common.NIS')}`
						)
						: cellValue || '0'
					}
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
		
		// Check for tier validation
		if (campaignData?.StatusCode === 927) {
			// WHATSAPP_REPORT
			setTierMessageCode(campaignData?.Message);
			setDialogType(getTierValidationDialog());
			return;
		}
		
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
							? moment(row?.CreateDate).format(DateFormats.DATE_ONLY)
							: '',
						UpdateDate: row?.UpdateDate
							? moment(row?.UpdateDate).format(DateFormats.DATE_ONLY)
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
		
		// Check for tier validation
		if (campaignData?.payload?.StatusCode === 927) {
			setTierMessageCode(campaignData?.payload?.Message || 'WHATSAPP_REPORT');
			setDialogType(getTierValidationDialog());
			return;
		}
		
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

	const renderSearchSection = () => {
		return (
			<Grid container spacing={2} className={clsx(SizeOptions_XS_SM.indexOf(windowSize) > -1 ? classes.mt15 : classes.lineTopMarging, 'searchLine')}>
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

				<Grid item style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
					<FormControlLabel
						control={
							<PulseemSwitch
								id="type"
								switchType='ios'
								classes={classes}
								checked={includeTestCampaigns}
								onColor="#0371ad"
								handleDiameter={20}
								boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
								activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
								height={15}
								width={40}
								className={clsx(classes.inputSwitch, { [classes.rtlSwitch]: isRTL })}
								onChange={() => setIncludeTestCampaigns(!includeTestCampaigns)}
							/>
						}
						label={translator('mainReport.locShowTestCampaigns.Text')}
					/>
				</Grid>

				<Grid item>
					<Button
						size='large'
						variant='contained'
						onClick={onSearch}
						className={clsx(classes.btn, classes.btnRounded)}
						endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}>
						{translator('campaigns.btnSearchResource1.Text')}
					</Button>
				</Grid>
				{isSearching && (
					<Grid item>
						<Button
							size='large'
							variant='contained'
							onClick={clearSearch}
							className={clsx(classes.btn, classes.btnRounded)}
							endIcon={<ClearIcon />}
						>
							{translator('common.clear')}
						</Button>
					</Grid>
				)}
			</Grid>
		)
	};

	const renderManagmentLine = () => {
		return (
			<Grid container spacing={2} className={clsx(classes.linePadding, classes.pb10)}>
				{
					userRoles?.AllowExport && windowSize !== 'xs' && (
						<Grid item>
							<Button
								className={clsx(
									classes.btn, classes.btnRounded,
									totalRecord > 0 ? null : classes.disabled
								)}
								onClick={onExport}
								endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}>
								{translator('campaigns.exportFile')}
							</Button>
						</Grid>
					)
				}

				<Grid item className={classes.groupsLableContainer} >
					<Typography className={classes.groupsLable}>
						{totalRecord || 0} {translator('whatsappReport.campaigns')}
					</Typography>
				</Grid>
			</Grid>
		)
	}

	const renderTableHead = () => {
		return (
			<TableHead>
				<TableRow classes={rowStyle}>
					<TableCell classes={cellStyle} className={classes.flex3} align='center'>{translator('sms.GridBoundColumnResource2.HeaderText')}</TableCell>
					<TableCell classes={cellStyle} className={classes.flex2} align='center'>
						<Grid container justifyContent='space-around'>
							<Grid item>{translator('mainReport.locTotalSendPlan.HeaderText')}</Grid>
							<Grid item>{translator('whatsappReport.sent')}</Grid>
						</Grid>
					</TableCell>
					<TableCell classes={cellStyle} className={clsx(classes.flex1, classes.greenTextColor)} align='center'>{translator('whatsappReport.read')}</TableCell>
					<TableCell classes={cellStyle} className={clsx(classes.flex2, classes.blueTextColor)} align='center'>{translator('whatsappReport.clicks')}</TableCell>
					<TableCell classes={cellStyle} className={classes.flex2} align='center'></TableCell>
					<TableCell classes={cellStyle} className={classes.flex1} align='center'>{translator('whatsappReport.cost')}</TableCell>
					{hasRevenue && <TableCell classes={cellStyle} className={classes.flex1} align='center'>{translator('common.revenue')}</TableCell>}
				</TableRow>
			</TableHead>
		)
	}

	const renderPhoneRow = (report: any) => {
		return (
			<TableRow
				key={report.ID}
				component='div'
				classes={rowStyle}>
				<TableCell classes={{ root: clsx(classes.tableCellRoot, classes.flex1, classes.tabelCellPadding) }}>
					<Box className={classes.inlineGrid} style={{ paddingInlineStart: 10 }}>
						{renderNameCell(report)}
					</Box>
					<Grid container spacing={2} className={classes.pr10}>
						<Grid item xs={3}>
							<Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
								{translator("whatsappReport.toSend")}
							</Typography>
							<Grid container spacing={2}>
								<Grid item>
									{getTableTypographyCells('', report.ToSend, reportCellNames.TOSEND, report)}
								</Grid>
							</Grid>
						</Grid>

						<Grid item xs={3}>
							<Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
								{translator("whatsappReport.sent")}
							</Typography>
							<Grid container spacing={2}>
								<Grid item className={`${report?.Sent >= 1 && classes.underline}`}>
									{getTableTypographyCells('', report?.Sent, reportCellNames.SENT, report, true)}
								</Grid>
							</Grid>
						</Grid>

						<Grid item xs={3}>
							<Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
								{translator("whatsappReport.read")}
							</Typography>
							<Grid container spacing={2}>
								<Grid item className={clsx(`${report.Read >= 1 && classes.underline}`, classes.greenTextColor)}>
									{getTableTypographyCells('', report.Read, reportCellNames.READ, report, true)}
								</Grid>
							</Grid>
						</Grid>
					</Grid>
					<Grid container spacing={2} style={{ paddingInlineStart: 10 }} >
						<Grid item xs={3}>
							<Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
								{translator('whatsappReport.clicks')}
							</Typography>
							<Grid container spacing={2}>
								<Grid item className={clsx(`${report?.ClicksCount >= 1 && classes.underline}`, classes.blueTextColor)}>
									{getTableTypographyCells('', report.ClicksCount, reportCellNames.CLICKS, report, true)}
								</Grid>
							</Grid>
						</Grid>
						<Grid item xs={3}>
							<Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
								{translator('whatsappReport.unique')}
							</Typography>
							<Grid container spacing={2}>
								<Grid item className={clsx(`${report?.UniqueClicksCount >= 1 && classes.underline}`, classes.blueTextColor)}>
									{getTableTypographyCells('', report.UniqueClicksCount, reportCellNames.UNIQUE, report, true)}
								</Grid>
							</Grid>
						</Grid>
						<Grid item xs={3}>
							<Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
								{translator('common.Removed')}
							</Typography>
							<Grid container spacing={2}>
								<Grid item className={clsx(`${report?.Removed >= 1 && classes.underline}`, classes.redTextColor)}>
									{getTableTypographyCells('', report.Removed, reportCellNames.REMOVED, report, true)}
								</Grid>
							</Grid>
						</Grid>
						<Grid item xs={3}>
							<Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
								{translator('common.failedStatus')}
							</Typography>
							<Grid container spacing={2}>
								<Grid item className={clsx(`${report?.Failed >= 1 && classes.underline}`, classes.redTextColor)}>
									{getTableTypographyCells('', report.Failed, reportCellNames.FAILED, report, true)}
								</Grid>
							</Grid>
						</Grid>
						<Grid item xs={3}>
							<Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
								{translator('whatsappReport.cost')}
							</Typography>
							<Grid container spacing={2}>
								<Grid item>
									{getTableTypographyCells('', report?.Cost, reportCellNames.COST, report)}
								</Grid>
							</Grid>
						</Grid>
						{hasRevenue && <Grid item xs={3}>
							<Typography className={clsx(classes.mobileReportHead, classes.ml0)}>
								{translator('common.revenue')}
							</Typography>
							<Grid container spacing={2}>
								<Grid item className={`${report?.Revenue >= 1 && classes.underline}`}>
									{getTableTypographyCells('', report.Revenue, reportCellNames.REVENUE, report, true)}
								</Grid>
							</Grid>
						</Grid>}
					</Grid>
				</TableCell>
			</TableRow>
		);
	}

	const renderRow = (report: any, index: any) => {
		return (
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
						classes.flex2,
						userRoles?.HideRecipients && classes.disabled
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
							className={`${report?.Sent >= 1 && classes.underline
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
						`${report?.Read >= 1 && classes.underline}`,
						classes.flex1,
						classes.greenTextColor,
						userRoles?.HideRecipients && classes.disabled
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
						classes.flex2,
						classes.blueTextColor,
						userRoles?.HideRecipients && classes.disabled
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
							className={`${report?.UniqueClicksCount >= 1 &&
								classes.underline
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
						`${!hasRevenue && classes.tableCellNoBorder}`,
						userRoles?.HideRecipients && classes.disabled
					)}>
					<Grid container justifyContent='space-around'>
						<Grid
							item
							className={clsx(
								`${report?.Removed >= 1 && classes.underline
								}`,
								classes.redTextColor
							)}>
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
							className={clsx(
								`${report?.Failed >= 1 && classes.underline
								}`,
								classes.redTextColor
							)}>
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
						classes.revenueTableCell,
						userRoles?.HideRecipients && classes.disabled
					)}>
					<Typography className={clsx(classes.middleText)}>
						{getTableTypographyCells(
							translator('whatsappReport.cost'),
							report?.Cost,
							reportCellNames.COST,
							report
						)}
					</Typography>
					{/* {getTableTypographyCells(
						translator('whatsappReport.cost'),
						report?.Cost,
						reportCellNames.COST,
						report
					)} */}
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
							`${report && report?.Revenue > 0
								? classes.revenueTableCellPointer
								: ''
							}`,
							userRoles?.HideRecipients && classes.disabled
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
		);
	}

	const renderTableBody = () => {
		let rowData = reportListData;
		if (rowData.length > 0) {
			return (
				<Box className='tableBodyContainer'>
					<TableBody>
						{rowData.map(SizeOptions_XS_SM.indexOf(windowSize) > -1 ? renderPhoneRow : renderRow)}
					</TableBody>
				</Box>
			)
		}
		return <Box className={clsx(classes.flex, classes.justifyCenterOfCenter)} style={{ height: 50 }}>
			<Typography>{translator("common.NoDataTryFilter")}</Typography>
		</Box>
	}

	const renderTable = () => {
		return (
			<TableContainer className={classes.tableStyle}>
				<Table className={classes.tableContainer}>
					{SizeOptions_XS_SM.indexOf(windowSize) === -1 && renderTableHead()}
					{renderTableBody()}
				</Table>
			</TableContainer>
		)
	}

	const renderTablePagination = () => {
		return (
			<TablePagination
				classes={classes}
				rows={totalRecord}
				rowsPerPage={paginationSetting?.pageSize}
				onRowsPerPageChange={onRowsPerPageChange}
				rowsPerPageOptions={[6, 10, 20, 50] as any}
				page={paginationSetting?.pageNo}
				onPageChange={(pageNumber: number) =>
					updatePaginationSetting({
						...paginationSetting,
						pageNo: pageNumber,
					})
				}
				returnPageOne={false}
			/>
		)
	}

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
						{renderSearchSection()}
					</Box>

					<div className={classes.manageWhatsappTemplates}>
						{renderManagmentLine()}
						{renderTable()}
						{renderTablePagination()}
					</div>
				</>
			) : (
				!isLoader && <NoSetup classes={classes} />
			)}
			<Loader isOpen={isLoader} showBackdrop={true} />
			
			{/* Tier Validation Dialog */}
			{dialogType?.type === 'tier' && (
				<BaseDialog
					classes={classes}
					open={true}
					onCancel={() => setDialogType(null)}
					onClose={() => setDialogType(null)}
					onConfirm={() => setDialogType(null)}
					title={translator('billing.tier.permission')}
					showDivider={false}
					renderButtons={() => (
            <Grid container spacing={2} className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null, !get(subAccount, 'CompanyAdmin', false) ? classes.dNone : '')}>
                <Grid item>
                <Button
                    onClick={() => {
										setDialogType(null);
                    setShowTierPlans(true);
                  }}
                  className={clsx(classes.btn, classes.btnRounded)}
                >
                  {translator('billing.upgradePlan')}
                </Button>
                </Grid>
                <Grid item>
                <Button
                  onClick={() => { setDialogType(null); }}
                  className={clsx(classes.btn, classes.btnRounded)}
                >
                  {translator('common.cancel')}
                </Button>
                </Grid>
            </Grid>
          )}
				>
					<Typography style={{ fontSize: 18 }} className={clsx(classes.textCenter)}>
						{handleGetPlanForFeature(TierMessageCode)}
					</Typography>
				</BaseDialog>
			)}
			{showTierPlans && <TierPlans
				classes={classes}
				isOpen={showTierPlans}
				onClose={() => setShowTierPlans(false)}
			/>}
		</DefaultScreen>
	);
};

export default WhatsappReports;
