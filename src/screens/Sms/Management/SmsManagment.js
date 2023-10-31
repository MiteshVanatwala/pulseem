import { useState, useEffect, useCallback } from 'react';
import DefaultScreen from '../../DefaultScreen';
import clsx from 'clsx';
import {
	Typography,
	Table,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
	TableContainer,
	Grid,
	Button,
	TextField,
	Box
} from '@material-ui/core';
import {
	AutomationIcon,
	DeleteIcon,
	DuplicateIcon,
	EditIcon,
	GroupsIcon,
	PreviewIcon,
	SendIcon
} from '../../../assets/images/managment/index';
import {
	TablePagination,
	ManagmentIcon,
	DateField,
	SearchField,
	RestorDialogContent,
} from '../../../components/managment/index';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import {
	getSmsData,
	restoreSms,
	deleteSms,
	duplicteSms,
	sendVerificationCode,
	verifyCode,
	getSmsByID,
} from '../../../redux/reducers/smsSlice';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import 'moment/locale/he';
import { Preview } from '../../../components/Notifications/Preview/Preview';
import { pulseemNewTab } from '../../../helpers/Functions/functions';
import { Loader } from '../../../components/Loader/Loader';
import { setRowsPerPage } from '../../../redux/reducers/coreSlice';
import CustomTooltip from '../../../components/Tooltip/CustomTooltip';
import VerificationDialog from '../../../components/DialogTemplates/VerificationDialog';
import useRedirect from '../../../helpers/Routes/Redirect';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import { Title } from '../../../components/managment/Title';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { sitePrefix } from '../../../config';
import DuplicateCampaign from '../../../components/Campaigns/DuplicateCampaign';
import { FaEye } from 'react-icons/fa';

const SmsManagnentScreen = ({ classes }) => {
	const { language, windowSize, rowsPerPage, isRTL } = useSelector(state => state.core) // smsOldVersion, isRTL
	const { smsData, smsDeletedData } = useSelector(state => state.sms)
	const { t } = useTranslation()
	const [fromDate, handleFromDate] = useState(null);
	const [toDate, handleToDate] = useState(null);
	const [number, handleNumber] = useState('');
	const [numberError, handleNumberError] = useState(false);
	const [verificationCode, handleVerificationCodeInput] = useState('');
	const [verificationCodeError, handleVerificationCodeError] = useState(false);
	const [campaineNameSearch, setCampaineNameSearch] = useState('')
	const rowsOptions = [6, 10, 20, 50]
	const [page, setPage] = useState(1)
	const [isSearching, setSearching] = useState(false)
	const [searchResults, setSearchResults] = useState(null)
	const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot }
	const cellStyle = { head: classes.tableCellHead, body: classes.tableCellBody, root: classes.tableCellRoot }
	const [dialogType, setDialogType] = useState(null)
	const [restoreArray, setRestoreArray] = useState([])
	const [showLoader, setLoader] = useState(true);
	const [newSmsVerification, setNewSmsVerification] = useState(false);
	const [duplicateDialog, setDuplicateDialog] = useState({});
	const dateFormat = 'YYYY-MM-DD HH:mm:ss.FFF';
	const dispatch = useDispatch();
	moment.locale(language);
	const Redirect = useRedirect();

	const getData = useCallback(async () => {
		await dispatch(getSmsData())
		setLoader(false);
	}, [dispatch])

	useEffect(() => {
		setLoader(true);
		getData();
	}, [getData]);

	const clearSearch = () => {
		setCampaineNameSearch('');
		handleFromDate(null);
		handleToDate(null);
		setSearchResults(null);
		setSearching(false);
	};

	const renderSearchLine = () => {
		const handleKeyDown = (event) => {
			if (event.keyCode === 13 || event.code === 'Enter') {
				handleSearch();
			}
		};
		const handleSearch = () => {
			const searchArray = [
				{
					type: 'name',
					campaineName: campaineNameSearch,
				},
				{
					type: 'date',
					fromDate,
					toDate,
				},
			];
			const filtersObject = {
				name: (row, values) => {
					return String(row.Name.toLowerCase()).includes(
						values.campaineName.toLowerCase()
					);
				},
				date: (row, values) => {
					const { UpdatedDate, SendDate } = row;
					const lastUpdate = SendDate
						? moment(SendDate, dateFormat).valueOf()
						: moment(UpdatedDate, dateFormat).valueOf();
					const startFromDate =
						(values.fromDate && moment(values.fromDate).hour(0).minute(0).valueOf()) ||
						null;
					const endToDate =
						(values.toDate && moment(values.toDate).hour(23).minute(59).valueOf()) ||
						null;

					if (!values) return true;
					if (fromDate && toDate && startFromDate && endToDate)
						return lastUpdate >= startFromDate && lastUpdate <= endToDate;
					if (fromDate && startFromDate) return lastUpdate >= startFromDate;
					if (toDate && endToDate) return lastUpdate <= endToDate;
					return true;
				},
			};

			let sortData = smsData;
			searchArray.forEach((values) => {
				sortData = sortData.filter((row) =>
					filtersObject[values.type](row, values)
				);
			});
			setSearchResults(sortData);
			setSearching(true);
			setPage(1);
		};

		const handleKeyPress = (e) => {
			if (e.charCode === 13 || e.code === 'Enter') {
				handleSearch();
			}
		};

		const handleFromDateChange = (value) => {
			if (value > toDate) {
				handleToDate(null);
			}
			handleFromDate(value);
		};

		const handleCampainNameChange = (event) => {
			setCampaineNameSearch(event.target.value);
		};

		if (windowSize === 'xs') {
			return (
				<Grid container className={'searchLine'}>
					<SearchField
						classes={classes}
						value={campaineNameSearch}
						onChange={handleCampainNameChange}
						onClick={handleSearch}
						onKeyPress={handleKeyPress}
						placeholder={t('common.CampaignName')}
					/>
				</Grid>
			)
		}

		return (
			<Grid container spacing={2} className={clsx(classes.lineTopMarging, 'searchLine')}>
				<Grid item>
					<TextField
						variant='outlined'
						size='small'
						value={campaineNameSearch}
						onKeyPress={handleKeyDown}
						onChange={handleCampainNameChange}
						className={clsx(classes.textField, classes.minWidth252)}
						placeholder={t('sms.GridBoundColumnResource2.HeaderText')}
					/>
				</Grid>

				{windowSize !== 'xs' ? (
					<Grid item>
						<DateField
							toolbarDisabled={false}
							classes={classes}
							value={fromDate}
							onChange={handleFromDateChange}
							placeholder={t('mms.locFromDateResource1.Text')}
						/>
					</Grid>
				) : null}

				{windowSize !== 'xs' ? (
					<Grid item>
						<DateField
							toolbarDisabled={false}
							classes={classes}
							value={toDate}
							onChange={handleToDate}
							placeholder={t('mms.locToDateResource1.Text')}
							minDate={fromDate ? fromDate : undefined}
						/>
					</Grid>
				) : null}

				<Grid item>
					<Button
						onClick={handleSearch}
						className={clsx(classes.btn, classes.btnRounded, classes.searchButton)}
						endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}>
						{t('campaigns.btnSearchResource1.Text')}
					</Button>
				</Grid>
				{isSearching && <Grid item>
					<Button
						onClick={clearSearch}
						className={clsx(classes.btn, classes.btnRounded, classes.searchButton)}
						endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}>
						{t('common.clear')}
					</Button>
				</Grid>}
			</Grid>
		)
	}

	const renderManagmentLine = () => {
		return (
			<Grid container spacing={2} className={classes.linePadding} >
				<Grid item xs={windowSize === 'xs' && 12}>
					<Button
						onClick={() => {
							Redirect({ url: `${sitePrefix}sms/create` })
						}}
						className={clsx(
							classes.btn, classes.btnRounded
						)}
						endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
					>
						{t('sms.create')}
					</Button>
				</Grid>
				{windowSize !== 'xs' && <Grid item>
					<Button
						className={clsx(
							classes.btn, classes.btnRounded
						)}
						onClick={() => setDialogType({
							type: 'restore',
							data: smsDeletedData
						})}
						endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
					>
						{t('campaigns.restoreDeleted')}
					</Button>
				</Grid>}
				{windowSize !== 'xs' && <Grid item>
					<Button
						className={clsx(
							classes.btn, classes.btnRounded
						)}
						onClick={() => setNewSmsVerification(true)}
						endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
					>
						{t('sms.verificationDialogTitle')}
					</Button>
				</Grid>}
				<Grid item xs={windowSize === 'xs' && 12} className={classes.groupsLableContainer} >
					<Typography className={classes.groupsLable}>
						{`${isSearching ? searchResults.length : smsData.length} ${t('mms.campaigns')}`}
					</Typography>
				</Grid>
			</Grid>
		)
	}

	const renderTableHead = () => {
		return (
			<TableHead>
				<TableRow classes={rowStyle}>
					<TableCell
						classes={cellStyle}
						className={classes.flex3}
						align='center'>
						{t('sms.GridBoundColumnResource2.HeaderText')}
					</TableCell>
					<TableCell
						classes={cellStyle}
						className={classes.flex1}
						align='center'>
						{t('campaigns.recipients')}
					</TableCell>
					<TableCell
						classes={cellStyle}
						className={classes.flex1}
						align='center'>
						{t('sms.CreditsResource1.HeaderText')}
					</TableCell>
					<TableCell
						classes={cellStyle}
						className={classes.flex1}
						align='center'>
						{t('sms.StatusResource1.HeaderText')}
					</TableCell>
					<TableCell
						classes={{ root: classes.tableCellRoot }}
						className={classes.flex5}></TableCell>
				</TableRow>
			</TableHead>
		);
	};

	const renderCellIcons = (row) => {
		const { Name, Status, Groups, AutomationID, Id, AutomationTriggerInActive } = row;

		const iconsMap = [
			{
				key: 'preview',
				uIcon: PreviewIcon,
				lable: t('campaigns.Image1Resource1.ToolTip'),
				remove: windowSize === 'xs',
				rootClass: classes.paddingIcon,
				onClick: async () => {
					const sms = await dispatch(getSmsByID(Id));
					setDialogType({
						type: 'preview',
						data: sms.payload
					})
				}
			},
			{
				key: 'edit',
				uIcon: EditIcon,
				disable: Status !== 1 || AutomationID !== 0,
				lable: t('campaigns.Image2Resource1.ToolTip'),
				href: `${sitePrefix}sms/edit/${Id}`,
				rootClass: classes.paddingIcon
			},
			{
				key: 'duplicate',
				uIcon: DuplicateIcon,
				lable: t('campaigns.lnkEditResource1.ToolTip'),
				rootClass: classes.paddingIcon,
				onClick: () => {
					setDuplicateDialog({
						id: Id,
						name: Name
					});
				},
			},
			{
				key: 'groups',
				uIcon: GroupsIcon,
				disable: Groups && Groups.length === 0,
				lable: t('campaigns.lnkPreviewResource1.ToolTip'),
				remove: windowSize === 'xs',
				rootClass: classes.paddingIcon,
				onClick: () => {
					setDialogType({
						type: 'groups',
						data: row.Groups
					})
				}
			},
			{
				key: 'automation',
				uIcon: AutomationIcon,
				disable: AutomationID === 0,
				lable: t('campaigns.automation'),
				remove: windowSize === 'xs',
				onClick: () => {
					pulseemNewTab(`CreateAutomations.aspx?Mode=show&AutomationID=${AutomationID}&fromreact=true`)
				},
				rootClass: classes.paddingIcon,
			},
			{
				key: 'delete',
				uIcon: DeleteIcon,
				lable: t('campaigns.DeleteResource1.HeaderText'),
				showPhone: true,
				disable: AutomationID !== 0,
				rootClass: classes.paddingIcon,
				onClick: () => {
					setDialogType({
						type: 'delete',
						data: Id
					})
				}
			},
			{
				key: 'send',
				uIcon: SendIcon,
				lable: t('campaigns.imgSendResource1.ToolTip'),
				remove: Status !== 1 || (AutomationID !== 0 && AutomationTriggerInActive === false),
				rootClass: classes.sendIcon,
				textClass: classes.sendIconText,
				href: `${sitePrefix}sms/send/${Id}`
			},
		]
		return (
			<Grid
				container
				direction='row'
				justifyContent={windowSize === 'xs' ? 'flex-start' : 'flex-end'}>
				{iconsMap.map(icon => (
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
				)}
					endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
				>
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
					{t('campaigns.recipients')}
				</Typography>
			</>
		);
	};

	const renderMessagesCell = (messages) => {
		return (
			<>
				<Typography className={classes.middleText}>
					{messages.toLocaleString()}
				</Typography>
				<Typography className={classes.middleText}>
					{t('sms.CreditsResource1.HeaderText')}
				</Typography>
			</>
		);
	};

	const renderNameCell = (row) => {
		let date = null;
		let text = '';
		if (!row.SendDate) {
			date = moment(row.UpdatedDate, dateFormat);
			text = t('common.UpdatedOn');
		} else {
			date = moment(row.SendDate, dateFormat);
			const dateMillis = date.valueOf();
			const currentDateMillis = moment().valueOf();
			text =
				dateMillis > currentDateMillis
					? t('common.ScheduledFor')
					: t('common.SentOn');
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
				/>
				<Typography className={classes.grayTextCell}>
					{`${text} ${date.format('DD/MM/YYYY')} ${date.format('LT')}`}
				</Typography>
			</>
		);
	};

	const renderRow = (row) => {
		return (
			<TableRow key={Math.round(Math.random() * 999999999)} classes={rowStyle}>
				<TableCell classes={cellStyle} align='center' className={classes.flex3}>
					{renderNameCell(row)}
				</TableCell>
				<TableCell
					classes={cellStyle}
					align='center'
					className={clsx(classes.flex1, classes.maxnWidth75)}>
					{renderRecipientsCell(row.SentCount)}
				</TableCell>
				<TableCell classes={cellStyle} align='center' className={classes.flex1}>
					{renderMessagesCell(row.CreditsPerSms)}
				</TableCell>
				<TableCell classes={cellStyle} align='center' className={classes.flex1}>
					{renderStatusCell(row.Status)}
				</TableCell>
				<TableCell
					component='th'
					scope='row'
					classes={{ root: classes.tableCellRoot }}
					className={classes.flex5}>
					{renderCellIcons(row)}
				</TableCell>
			</TableRow>
		);
	};

	const renderPhoneRow = (row) => {
		return (
			<TableRow key={row.Id} component='div' classes={rowStyle}>
				<TableCell
					style={{ flex: 1 }}
					classes={{ root: classes.tableCellRoot }}>
					<Box className={classes.justifyBetween}>
						<Box className={classes.inlineGrid}>{renderNameCell(row)}</Box>
						<Box>{renderStatusCell(row.Status)}</Box>
					</Box>
					{renderCellIcons(row)}
				</TableCell>
			</TableRow>
		);
	};

	const renderTableBody = () => {
		let sortData = isSearching ? searchResults : smsData;
		let rpp = parseInt(rowsPerPage);
		sortData = sortData.slice((page - 1) * rpp, (page - 1) * rpp + rpp);
		return (
			<TableBody>
				{sortData.map(windowSize === 'xs' ? renderPhoneRow : renderRow)}
			</TableBody>
		);
	};

	const renderTable = () => {
		return (
			<TableContainer>
				<Table className={classes.tableContainer}>
					{windowSize !== 'xs' && renderTableHead()}
					{renderTableBody()}
				</Table>
			</TableContainer>
		);
	};

	const renderTablePagination = () => {
		const handleRowsPerPageChange = (val) => {
			dispatch(setRowsPerPage(val));
		};
		return (
			<TablePagination
				classes={classes}
				rows={isSearching ? searchResults.length : smsData.length}
				rowsPerPage={rowsPerPage}
				onRowsPerPageChange={handleRowsPerPageChange}
				rowsPerPageOptions={rowsOptions}
				page={page}
				onPageChange={setPage}
			/>
		);
	};

	const handleChange = (Id) => () => {
		const found = restoreArray.includes(Id);
		if (found) {
			setRestoreArray(restoreArray.filter((restore) => restore !== Id));
		} else {
			setRestoreArray([...restoreArray, Id]);
		}
	};

	const handleShortVerify = async (number) => {
		handleVerificationCodeInput('');
		handleNumber(number);
		setDialogType({
			type: 'shortVerify',
			data: number,
		});
	};

	const handleSendVerificationCode = async () => {
		const value = (dialogType && dialogType.type === 'shortVerify' && dialogType.data) ? dialogType.data : number;
		if (!value || value.length < 10) {
			handleNumberError(true);
			return
		}
		const result = await dispatch(sendVerificationCode({ number: value }));

		if (!result.error) {
			setDialogType({
				type: 'verificationSent',
				data: value,
			});
		}
	};

	const handleConfirmCode = async () => {
		const result = await dispatch(
			verifyCode({
				optinCode: verificationCode,
				phoneNumber: number,
			})
		);
		if (result.error || result.payload === 'NotMatch') {
			handleVerificationCodeError(true);
		} else {
			setDialogType({
				type: 'verificationSuccess',
				data: {},
			});
		}
	};

	const handleClose = () => {
		setDialogType(null);
		handleVerificationCodeError(false);
		handleNumberError(false);
		handleNumber('');
		handleVerificationCodeInput('');
	};

	const getRestorDialog = (data = []) => {
		if (!data || !Array.isArray(data)) return null;
		return {
			title: t('sms.restoreCampaignTitle'),
			showDivider: false,
			icon: <div className={classes.dialogIconContent}>{'\uE185'}</div>,
			content: (
				<RestorDialogContent
					classes={classes}
					data={data}
					currentChecked={restoreArray}
					onChange={handleChange}
					dataIdVar='Id'
				/>
			),
			onConfirm: async () => {
				handleClose();
				await dispatch(restoreSms(restoreArray));
				setRestoreArray([]);
				getData();
			},
		};
	};

	const getGroupsDialog = (data = []) => {
		if (!data || !Array.isArray(data)) return null;

		return {
			title: t('campaigns.ShowGroupsTitle'),
			showDivider: false,
			content: (
				<Box className={classes.gruopsDialogContent}>
					{data.map((group) => {
						return (
							<Typography key={group} className={classes.gruopsDialogText}>
								<FiberManualRecordIcon className={classes.gruopsDialogBullet} />
								{group}
							</Typography>
						);
					})}
				</Box>
			)
		};
	};

	const getDeleteDialog = (data = '') => ({
		title: t('campaigns.GridButtonColumnResource2.ConfirmTitle'),
		showDivider: false,
		content: (
			<Typography style={{ fontSize: 18 }}>
				{t('campaigns.GridButtonColumnResource2.ConfirmText')}
			</Typography>
		),
		onConfirm: async () => {
			clearSearch();
			handleClose();
			await dispatch(deleteSms(data));
			getData();
		},
	});

	const getDuplicateDialog = (data = '') => ({
		title: t('campaigns.dialogDuplicateTitle'),
		showDivider: false,
		content: (
			<Typography style={{ fontSize: 18 }}>
				{t('campaigns.dialogDuplicateContent')}
			</Typography>
		),
		onConfirm: async () => {
			clearSearch();
			handleClose();
			setPage(1);
			await dispatch(duplicteSms(data));
			getData();
		},
	});

	const getPreviewDialog = (data = {}) => {
		return {
			childrenPadding: false,
			contentStyle: classes.pt2rem,
			showDivider: false,
			title: t('common.Preview'),
			icon: (
				<FaEye style={{ fontSize: 35, padding: 5, fill: '#fff' }} />
			),
			content: (
				<Box>
					<Preview
						classes={classes}
						mobileFullsize={true}
						model={data}
						ShowRedirectButton={
							data.RedirectButtonText && data.RedirectButtonText !== ''
						}
						showTitle={false}
						showID={true}
						isSMS={true}
					/>
				</Box>
			),
			showDefaultButtons: false
		};
	};

	// const getVerifyDialog = (data = []) => {
	// 	if (!data || !Array.isArray(data)) return null;
	// 	return {
	// 		title: t('sms.verificationDialogTitle'),
	// 		showDivider: false,
	// 		content: (
	// 			<Box>
	// 				<Typography style={{ fontSize: 15 }} align={'justify'}>
	// 					{t('sms.verificationBody')}
	// 					<b>{t('sms.oneTimeProcess')}</b>
	// 					{t('sms.foreachSubmission')}
	// 				</Typography>
	// 				<br />
	// 				<Typography style={{ fontSize: 15, textDecoration: 'underline' }}>
	// 					{t('sms.verificationNote')}
	// 				</Typography>
	// 				<hr />
	// 				<Box
	// 					style={{
	// 						display: 'flex',
	// 						justifyContent: 'space-between',
	// 						marginBottom: 10,
	// 					}}>
	// 					<Typography style={{ fontSize: 15 }}>
	// 						{t('sms.numbersAccount')}
	// 					</Typography>
	// 					<Button
	// 						variant='contained'
	// 						size='small'
	// 						color='primary'
	// 						onClick={() => handleShortVerify()}>
	// 						{t('sms.verifyAnotherNumber')}
	// 					</Button>
	// 				</Box>
	// 				<List
	// 					style={{
	// 						padding: 0,
	// 						overflow: 'auto',
	// 						height: 'calc(100vh - 500px)',
	// 					}}>
	// 					{data.map((item) => {
	// 						return (
	// 							<ListItem
	// 								style={{ padding: 0 }}
	// 								key={`verificationNumber${item.ID}`}>
	// 								<ListItemAvatar style={{ minWidth: 25 }}>
	// 									<Avatar
	// 										className={
	// 											item.IsOptIn ? classes.checkIcon : classes.redIcon
	// 										}>
	// 										<div className={clsx(classes.avatarIcon)}>
	// 											{item.IsOptIn ? '\uE134' : '\uE0A7'}
	// 										</div>
	// 									</Avatar>
	// 								</ListItemAvatar>
	// 								<ListItemText
	// 									style={{ margin: 0 }}
	// 									primary={
	// 										<Grid container>
	// 											<Grid item>
	// 												<Typography variant='body2'>{item.Number}</Typography>
	// 											</Grid>
	// 											{!item.IsOptIn && (
	// 												<Grid item>
	// 													<Typography
	// 														className={classes.verifyLink}
	// 														onClick={() => handleShortVerify(item.Number)}>
	// 														{t('sms.verifyNumber')}
	// 													</Typography>
	// 												</Grid>
	// 											)}
	// 										</Grid>
	// 									}
	// 								/>
	// 								<ListItemSecondaryAction></ListItemSecondaryAction>
	// 							</ListItem>
	// 						);
	// 					})}
	// 				</List>
	// 			</Box>
	// 		),
	// 		renderButtons: () => (
	// 			<Button
	// 				variant='contained'
	// 				size='small'
	// 				style={{ maxWidth: 100 }}
	// 				onClick={handleClose}
	// 				className={clsx(
	// 					classes.gruopsDialogButton,
	// 					classes.dialogConfirmButton
	// 				)}>
	// 				{t('common.Ok')}
	// 			</Button>
	// 		),
	// 	};
	// };

	const getShortVerifyDialog = (data = '') => ({
		showDivider: false,
		content: (
			<Box style={{ textAlign: 'center' }}>
				<Typography align='center' style={{ fontWeight: 'bold', fontSize: 25 }}>
					{t('sms.shortVerificationTitle')}
				</Typography>
				<Typography style={{ fontSize: 15 }} align={'justify'}>
					{t('sms.verificationBody')}
					<b>{t('sms.oneTimeProcess')}</b>
					{t('sms.foreachSubmission')}
				</Typography>
				<br />
				<TextField
					autoFocus
					error={numberError}
					helperText={numberError ? t('sms.numberError') : ''}
					variant='outlined'
					placeholder={t('sms.enterNumberText')}
					value={data || number}
					onChange={(e) => handleNumber(e.target.value)}
					size='small'
					type='tel'
					className={!data && classes.verifyField}
					readOnly={!!data}
				/>
				<br />
				<br />
				<Button
					size={!data ? 'large' : 'medium'}
					variant='contained'
					onClick={handleSendVerificationCode}
					className={clsx(classes.btn, classes.btnRounded)}>
					{t('sms.verificationButtonText')}
				</Button>
				<Typography className={clsx(classes.contactUs, classes.newLine)}>
					{t('sms.havingIssuesMessage')}
				</Typography>
			</Box>
		),
		renderButtons: () => null,
	});

	const getVerificationSentDialog = (data = '') => ({
		showDivider: false,
		icon: <div className={classes.dialogIconContent}>{'\uE11B'}</div>,
		content: (
			<Box style={{ textAlign: 'center' }}>
				<Typography align='center' className={classes.verificationTitle}>
					{t('common.Sent')}
				</Typography>
				<Typography style={{ fontSize: 15 }} align={'center'}>
					{t('sms.verificationSentToNumber')}
					{data}
					<br />
					{t('sms.pleaseNoteCode')}
				</Typography>
				<br />
				<TextField
					error={verificationCodeError}
					helperText={
						verificationCodeError ? t('sms.verificationCodeError') : ''
					}
					variant='outlined'
					placeholder={t('sms.enterCode')}
					value={verificationCode}
					onChange={(e) => handleVerificationCodeInput(e.target.value)}
					size='small'
				/>
				<br />
				<br />
				<Button
					variant='contained'
					onClick={() => handleConfirmCode(verificationCode)}
					color='primary'
					style={{ minWidth: 150 }}>
					{t('common.Ok')}
				</Button>
				<Grid container style={{ marginTop: 20 }} justifyContent='center'>
					<Grid item>
						<Typography>{t('sms.didNotReceived')}</Typography>
					</Grid>
					<Grid item>
						<Typography
							onClick={() => handleShortVerify(data)}
							style={{
								textDecoration: 'underline',
								margin: '0 5px',
								cursor: 'pointer',
							}}>
							{t('sms.resend')}
						</Typography>
					</Grid>
				</Grid>
			</Box>
		),
		renderButtons: () => null,
	});

	const getVerificationSuccessDialog = () => ({
		showDivider: false,
		icon: <div className={classes.dialogIconContent}>{'\uE11B'}</div>,
		content: (
			<Box style={{ textAlign: 'center' }}>
				<Typography
					align='center'
					className={clsx(classes.verificationTitle, classes.green)}>
					{t('sms.verificationSuccessful')}
				</Typography>
				<Typography style={{ fontSize: 15 }} align={'center'}>
					{t('sms.verificationSuccessMessage')}
				</Typography>
				<br />
				<div className={classes.verifySuccessIcon}>{'\uE134'}</div>
			</Box>
		),
		renderButtons: () => null,
	});

	const onDuplicateCampaign = async (selectedOptions) => {
		handleClose();
		const response = await dispatch(duplicteSms({ CampaignId: duplicateDialog?.id, CloneOptions: selectedOptions }))
		handleDuplicateResponse(response?.payload);
	}
	const handleDuplicateResponse = (response) => {
		switch (response?.StatusCode) {
			case 201:
			default: {
				clearSearch();
				getData();
				setPage(1);
				// Show success
				break;
			}
			case 404: {
				// Show campaign not found
				break;
			}
			case 405: {
				// Show Maximum monthly campaigns created or bulk ended
				break;
			}
		}
	}

	const renderDialog = () => {
		const { data, type } = dialogType || {};

		const dialogContent = {
			restore: getRestorDialog(data),
			groups: getGroupsDialog(data),
			delete: getDeleteDialog(data),
			duplicate: getDuplicateDialog(data),
			preview: getPreviewDialog(data),
			// verify: getVerifyDialog(data),
			shortVerify: getShortVerifyDialog(data),
			verificationSent: getVerificationSentDialog(data),
			verificationSuccess: getVerificationSuccessDialog(data),
		};

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
			currentPage='sms'
			classes={classes}
			containerClass={clsx(classes.management, classes.mb50)}>
			<Box className={'topSection'}>
				<Title Text={t('sms.PageResource1.Title')} classes={classes} />
				{renderSearchLine()}
			</Box>
			{renderManagmentLine()}
			{renderTable()}
			{renderTablePagination()}
			{renderDialog()}
			{newSmsVerification && <VerificationDialog classes={classes} isOpen={newSmsVerification} variant='sms' onClose={() => setNewSmsVerification(false)} />}
			<DuplicateCampaign
				isSms={true}
				title={t('campaigns.dialogDuplicateTitle')}
				classes={classes}
				isOpen={!!duplicateDialog?.id}
				duplicateOptions={[]}
				handleClose={async (selectedOptions) => {
					if (selectedOptions !== undefined) {
						onDuplicateCampaign(selectedOptions);
					}
					setDuplicateDialog({});
				}}
				campaignName={duplicateDialog?.name}
			/>
			<Loader isOpen={showLoader} />
		</DefaultScreen>
	)
}

export default SmsManagnentScreen;
