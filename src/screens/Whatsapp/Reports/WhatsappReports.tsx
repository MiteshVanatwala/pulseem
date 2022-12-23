import {
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
import { useSelector } from 'react-redux';
import { SearchIcon } from '../../../assets/images/managment/index';
import {
	DateField,
	TablePagination,
} from '../../../components/managment/index';
import ExcelImg from '../../../assets/images/excel.png';
import { Title } from '../../../components/managment/Title';
import { ClassesType } from '../../Classes.types';
import DefaultScreen from '../../DefaultScreen';
import { coreProps } from '../Editor/WhatsappCreator.types';
import ClearIcon from '@material-ui/icons/Clear';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import moment from 'moment';
import CustomTooltip from '../../../components/Tooltip/CustomTooltip';

const WhatsappReports = ({ classes }: ClassesType) => {
	const { t: translator } = useTranslation();
	const { windowSize } = useSelector(
		(state: { core: coreProps }) => state.core
	);
	const [fromDate, handleFromDate] = useState<any>(null);
	const [toDate, handleToDate] = useState<any>(null);
	const [campaineNameSearch, setCampaineNameSearch] = useState('');
	const [isSearching, setSearching] = useState(false);
	const [page, setPage] = useState(1);
	const rows: any = [1, 2, 3, 4, 5, 6];
	const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot };
	const cellStyle = {
		head: classes.tableCellHead,
		body: classes.tableCellBody,
		root: classes.tableCellRoot,
	};
	const dateFormat = 'YYYY-MM-DD HH:mm:ss.FFF';
	useEffect(() => {
		if (
			fromDate?.length > 0 ||
			toDate?.length > 0 ||
			campaineNameSearch?.length > 0
		) {
			setSearching(true);
		}
	}, [fromDate, toDate, campaineNameSearch]);
	const handleFromDateChange = (value: any) => {
		if (toDate && value > toDate) {
			handleToDate(null);
		}
		handleFromDate(value);
	};
	const handleCampainNameChange = (event: any) => {
		setCampaineNameSearch(event.target.value);
	};
	const clearSearch = () => {
		setCampaineNameSearch('');
		handleFromDate(null);
		handleToDate(null);
		setSearching(false);
	};
	const renderNameCell = (row: any) => {
		let date = null;
		let text = '';
		if (!row.SendDate) {
			date = moment(row.UpdatedDate, dateFormat);
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
					style={{ fontSize: 18, fontWeight: 'bold' }}
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
	return (
		<DefaultScreen
			subPage={'manage'}
			currentPage='whatsapp'
			classes={classes}
			customPadding={true}>
			<Title
				Text={translator('whatsapp.WhatsappCampaignReports')}
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
							value={campaineNameSearch}
							onChange={handleCampainNameChange}
							className={clsx(classes.textField, classes.minWidth252)}
							placeholder={translator(
								'sms.GridBoundColumnResource2.HeaderText'
							)}
						/>
					</Grid>

					{windowSize !== 'xs' ? (
						<Grid item>
							<DateField
								toolbarDisabled={false}
								classes={classes}
								value={fromDate}
								// onChange={handleFromDateChange}
								placeholder={translator('mms.locToDateResource1.Text')}
								minDate={undefined}
								onTimeChange={undefined}
							/>
						</Grid>
					) : null}

					{windowSize !== 'xs' ? (
						<Grid item>
							<DateField
								toolbarDisabled={false}
								classes={classes}
								value={toDate}
								// onChange={handleToDate}
								placeholder={translator('mms.locToDateResource1.Text')}
								minDate={undefined}
								onTimeChange={undefined}
							/>
						</Grid>
					) : null}

					<Grid item>
						<Button
							size='large'
							variant='contained'
							// onClick={handleSearch}
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
						<Button>
							<img src={ExcelImg} alt='excel-icon' />
							Export File
						</Button>
					</div>

					<span className={classes.whatsappReportCampaignCount}>
						2 Campaigns
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
													<>{'To send'}</>
												</Grid>
												<Grid item>
													<>{'Sent'}</>
												</Grid>
											</Grid>
										</TableCell>
										<TableCell classes={cellStyle} align='center'>
											<>{'Read'}</>
										</TableCell>
										<TableCell classes={cellStyle} align='center'>
											<>{'Clicks'}</>
										</TableCell>
										<TableCell classes={cellStyle} align='center'>
											<>{'Feedback'}</>
										</TableCell>
										<TableCell classes={cellStyle} align='center'>
											<>{}</>
										</TableCell>
										<TableCell classes={cellStyle} align='center'>
											<>{'Revenue'}</>
										</TableCell>
									</TableRow>
								</TableHead>
							)}
							{rows.map(() => (
								<TableRow
									key={Math.round(Math.random() * 999999999)}
									classes={rowStyle}>
									<TableCell
										classes={cellStyle}
										align='center'
										className={clsx(classes.tableCellBody)}>
										{renderNameCell({
											Id: 140831,
											Name: 'sdsd',
											Status: 1,
											IsDeleted: false,
											UpdatedDate: '2022-11-11 07:18:26',
											SendDate: null,
											SentCount: 0,
											CreditsPerSms: 1,
											AutomationID: 0,
											Groups: [],
											AutomationTriggerInActive: false,
										})}
									</TableCell>
									<TableCell
										classes={cellStyle}
										align='center'
										className={clsx(classes.tableCellBody)}>
										<Grid container justifyContent='space-around'>
											<Grid item>
												<Typography className={classes.middleText}>
													{'1865'}
												</Typography>
												<Typography className={classes.middleText}>
													{'To Send'}
												</Typography>
											</Grid>
											<Grid item>
												<Typography className={classes.middleText}>
													{'1865'}
												</Typography>
												<Typography className={classes.middleText}>
													{'Sent'}
												</Typography>
											</Grid>
										</Grid>
									</TableCell>
									<TableCell
										classes={cellStyle}
										align='center'
										className={clsx(classes.tableCellBody)}>
										<Typography className={classes.middleText}>
											{'1865'}
										</Typography>
										<Typography className={classes.middleText}>
											{'Read'}
										</Typography>
									</TableCell>
									<TableCell
										classes={cellStyle}
										align='center'
										className={clsx(classes.tableCellBody)}>
										<Grid container justifyContent='space-around'>
											<Grid item>
												<Typography className={classes.middleText}>
													{'1865'}
												</Typography>
												<Typography className={classes.middleText}>
													{'Clicks'}
												</Typography>
											</Grid>
											<Grid item>
												<Typography className={classes.middleText}>
													{'158'}
												</Typography>
												<Typography className={classes.middleText}>
													{'Unique'}
												</Typography>
											</Grid>
										</Grid>
									</TableCell>
									<TableCell
										classes={cellStyle}
										align='center'
										className={clsx(classes.tableCellBody)}>
										<Typography className={classes.middleText}>
											{'0'}
										</Typography>
										<Typography className={classes.middleText}>
											{'Total'}
										</Typography>
									</TableCell>
									<TableCell
										classes={cellStyle}
										align='center'
										className={clsx(classes.tableCellBody)}>
										<Grid container justifyContent='space-around'>
											<Grid item>
												<Typography className={classes.middleText}>
													{'12'}
												</Typography>
												<Typography className={classes.middleText}>
													{'Removed'}
												</Typography>
											</Grid>
											<Grid item>
												<Typography className={classes.middleText}>
													{'6'}
												</Typography>
												<Typography className={classes.middleText}>
													{'Failed'}
												</Typography>
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
						</Table>
					</TableContainer>
				</Grid>
				<TablePagination
					classes={classes}
					rows={50}
					rowsPerPage={2}
					// onRowsPerPageChange={handleRowsPerPageChange}
					rowsPerPageOptions={[10, 20, 30, 40]}
					page={page}
					// onPageChange={setPage}
				/>
			</div>
		</DefaultScreen>
	);
};

export default WhatsappReports;
