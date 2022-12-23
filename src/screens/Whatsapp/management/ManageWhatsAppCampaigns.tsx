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
import {
	AutomationIcon,
	DeleteIcon,
	DuplicateIcon,
	EditIcon,
	SendGreenIcon,
	SearchIcon,
	GroupsIcon,
	PreviewIcon,
} from '../../../assets/images/managment/index';
import {
	DateField,
	ManagmentIcon,
	TablePagination,
} from '../../../components/managment/index';
import { Title } from '../../../components/managment/Title';
import { ClassesType } from '../../Classes.types';
import DefaultScreen from '../../DefaultScreen';
import { coreProps } from '../Editor/WhatsappCreator.types';
import ClearIcon from '@material-ui/icons/Clear';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import moment from 'moment';
import CustomTooltip from '../../../components/Tooltip/CustomTooltip';
import { templatData } from '../Constant';

const ManageWhatsAppCampaigns = ({ classes }: ClassesType) => {
	const { t: translator } = useTranslation();
	const { windowSize } = useSelector(
		(state: { core: coreProps }) => state.core
	);
	const [fromDate, handleFromDate] = useState<any>(null);
	const [toDate, handleToDate] = useState<any>(null);
	const [campaineNameSearch, setCampaineNameSearch] = useState('');
	const [isSearching, setSearching] = useState(false);
	const [page, setPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(1);

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
	const renderRecipientsCell = (recipients: any) => {
		return (
			<>
				<Typography className={classes.middleText}>
					{recipients.toLocaleString()}
				</Typography>
				<Typography className={classes.middleText}>
					{translator('campaigns.recipients')}
				</Typography>
			</>
		);
	};

	const renderMessagesCell = (messages: any) => {
		return (
			<>
				<Typography className={classes.middleText}>
					{messages.toLocaleString()}
				</Typography>
				<Typography className={classes.middleText}>
					{translator('sms.CreditsResource1.HeaderText')}
				</Typography>
			</>
		);
	};
	const renderStatusCell = (status: any) => {
		const statuses: any = {
			1: 'common.Created',
			2: 'common.Sending',
			3: 'campaigns.Stopped',
			4: 'common.Sent',
			5: 'campaigns.Canceled',
			6: 'campaigns.Optin',
			7: 'campaigns.Approve',
		};
		return (
			<>
				<Typography
					className={clsx(classes.middleText, classes.recipientsStatus, {
						[classes.recipientsStatusCreated]: status === 1,
						[classes.recipientsStatusSent]: status === 4,
						[classes.recipientsStatusSending]: status === 2,
						[classes.recipientsStatusCanceled]: status === 5,
					})}>
					{translator(statuses[status])}
				</Typography>
			</>
		);
	};
	const renderCellIcons = (row: any) => {
		const { Status, Groups, AutomationID, Id, AutomationTriggerInActive } = row;

		const iconsMap = [
			{
				key: 'send',
				icon: SendGreenIcon,
				lable: translator('campaigns.imgSendResource1.ToolTip'),
				remove:
					Status !== 1 ||
					(AutomationID !== 0 && AutomationTriggerInActive === false),
				rootClass: classes.sendIcon,
				textClass: classes.sendIconText,
			},
			{
				key: 'preview',
				icon: PreviewIcon,
				lable: translator('campaigns.Image1Resource1.ToolTip'),
				remove: windowSize === 'xs',
				rootClass: classes.paddingIcon,
			},
			{
				key: 'edit',
				icon: EditIcon,
				disable: Status !== 1 || AutomationID !== 0,
				lable: translator('campaigns.Image2Resource1.ToolTip'),
				rootClass: classes.paddingIcon,
			},
			{
				key: 'duplicate',
				icon: DuplicateIcon,
				lable: translator('campaigns.lnkEditResource1.ToolTip'),
				rootClass: classes.paddingIcon,
			},
			{
				key: 'groups',
				icon: GroupsIcon,
				disable: Groups && Groups.length === 0,
				lable: translator('campaigns.lnkPreviewResource1.ToolTip'),
				remove: windowSize === 'xs',
				rootClass: classes.paddingIcon,
			},
			{
				key: 'automation',
				icon: AutomationIcon,
				disable: AutomationID === 0,
				lable: translator('campaigns.automation'),
				remove: windowSize === 'xs',
				rootClass: classes.paddingIcon,
			},
			{
				key: 'delete',
				icon: DeleteIcon,
				lable: translator('campaigns.DeleteResource1.HeaderText'),
				showPhone: true,
				disable: AutomationID !== 0,
				rootClass: classes.paddingIcon,
			},
		];
		return (
			<Grid
				container
				direction='row'
				justifyContent={windowSize === 'xs' ? 'flex-start' : 'flex-end'}
				alignItems='center'>
				{iconsMap.map((icon) => (
					<Grid
						className={icon?.disable ? classes.disabledCursor : ''}
						key={icon.key}
						item>
						<ManagmentIcon classes={classes} {...icon} uIcon={false} />
					</Grid>
				))}
			</Grid>
		);
	};
	return (
		<DefaultScreen
			subPage={'manage'}
			currentPage='whatsapp'
			classes={classes}
			customPadding={true}>
			<Title
				Text={'Whatsapp Campaign Management'}
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
					className={classes.manageTemplatesHeaderButtons}>
					<div>
						<Button className={'green'}>Create Campaign</Button>
						<Button className={'blue'}>Restore Deleted</Button>
					</div>

					<span className={classes.manageTemplatesCampaignCount}>
						2 Campaigns
					</span>
				</Grid>

				<Grid
					container
					spacing={2}
					className={classes.manageTemplatesTableWrapper}>
					<TableContainer>
						<Table className={classes.tableContainer}>
							{windowSize !== 'xs' && (
								<TableHead>
									<TableRow classes={rowStyle}>
										<TableCell
											classes={cellStyle}
											className={classes.flex3}
											align='center'>
											{translator('sms.GridBoundColumnResource2.HeaderText')}
										</TableCell>
										<TableCell
											classes={cellStyle}
											className={classes.flex1}
											align='center'>
											{translator('campaigns.recipients')}
										</TableCell>
										<TableCell
											classes={cellStyle}
											className={classes.flex1}
											align='center'>
											{translator('sms.CreditsResource1.HeaderText')}
										</TableCell>
										<TableCell
											classes={cellStyle}
											className={classes.flex1}
											align='center'>
											{translator('sms.StatusResource1.HeaderText')}
										</TableCell>
										<TableCell
											classes={{ root: classes.tableCellRoot }}
											className={classes.flex5}></TableCell>
									</TableRow>
								</TableHead>
							)}
							{templatData.map((template: any) => (
								<TableRow
									key={Math.round(Math.random() * 999999999)}
									classes={rowStyle}>
									<TableCell
										classes={cellStyle}
										align='center'
										className={clsx(classes.flex3, classes.tableCellBody)}>
										{renderNameCell(template)}
									</TableCell>
									<TableCell
										classes={cellStyle}
										align='center'
										className={clsx(classes.flex1, classes.tableCellBody)}>
										{renderRecipientsCell(template.SentCount)}
									</TableCell>
									<TableCell
										classes={cellStyle}
										align='center'
										className={clsx(classes.flex1, classes.tableCellBody)}>
										{renderMessagesCell(template.CreditsPerSms)}
									</TableCell>
									<TableCell
										classes={cellStyle}
										align='center'
										className={clsx(classes.flex1, classes.tableCellBody)}>
										{renderStatusCell(template.Status)}
									</TableCell>
									<TableCell
										component='th'
										scope='row'
										className={clsx(classes.flex5, classes.tableCellRoot)}>
										{renderCellIcons(template)}
									</TableCell>
								</TableRow>
							))}
						</Table>
					</TableContainer>
				</Grid>
				<TablePagination
					classes={classes}
					rows={rowsPerPage}
					rowsPerPage={2}
					// onRowsPerPageChange={(val: number) => setRowsPerPage(val)}
					rowsPerPageOptions={[10, 20, 30, 40]}
					page={page}
					// onPageChange={setPage}
				/>
			</div>
		</DefaultScreen>
	);
};

export default ManageWhatsAppCampaigns;
