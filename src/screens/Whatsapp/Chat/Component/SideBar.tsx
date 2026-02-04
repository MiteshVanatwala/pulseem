import Icon from './Icon';
import clsx from 'clsx';
import {
	WhatsappChatSideBarProps,
} from '../Types/WhatsappChat.type';
import AccountUser from '../../../../assets/images/acc-user.jpg';
import { Box, Button, IconButton, MenuItem, Tab, Tabs, TextField, Chip } from '@material-ui/core';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { FaBars, FaCalendar, FaFilter, FaTrash } from 'react-icons/fa';
import { BsPersonWorkspace } from 'react-icons/bs';
import { BaseSyntheticEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SideHeaderContactDropDown from './SideHeaderContactDropDown';
import SideBarContactList from './SideBarContactList';
import useDebounce from '../Hook/useDebounce';
import { useSelector } from 'react-redux';
import { coreProps, WhatsappAgent } from '../../Campaign/Types/WhatsappCampaign.types';
import { StateType } from '../../../../Models/StateTypes';
import { setCookie } from '../../../../helpers/Functions/cookies';
import { TablePagination } from '../../../../components/managment/index';

const SideBar = ({
	classes,
	isMobileSideBar,
	setIsMobileSideBar,
	handleChatId,
	onActiveUserChange,
	sideChatContacts,
	phoneNumbersList,
	handleUserStatus,
	getStatusClass,
	activePhoneNumber,
	fetchMoreContacts,
	fetchSearchedContacts,
	contactsPaginationSetting,
	isLoader,
	filterBySelected,
	setFilterBySelected,
	selectedAgent,
	setAgentSelected,
	onAddAgent,
	onEditAgents,
	TotalRecord,
	TotalOpen,
	TotalPending,
	TotalSolved
}: WhatsappChatSideBarProps) => {
	const { t: translator } = useTranslation();
	const { isRTL } = useSelector((state: { core: coreProps }) => state.core);
	const { agentList } = useSelector((state: StateType) => state.whatsapp);
	const [searchText, setSearchText] = useState<string>('');
	const debouncedValue = useDebounce<string>(searchText, 500);
	const [activeTab, setActiveTab] = useState(0);
	const isInitialMount = useRef(true);
	const isChangingRowsPerPage = useRef(false);
	const [startDate, setStartDate] = useState<string>('');
	const [endDate, setEndDate] = useState<string>('');
	const [timePeriod, setTimePeriod] = useState<string>('lastMonth');
	const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
	const [showFilterDropdown, setShowFilterDropdown] = useState<boolean>(false);

	// Initialize default date range on mount
	useEffect(() => {
		getDateRange('lastMonth');
	}, []);

	const getDateRange = (period: string) => {
		const today = new Date();
		let start = new Date();
		let end = new Date(today);

		switch (period) {
			case 'lastWeek':
				start = new Date(today.setDate(today.getDate() - 7));
				break;
			case 'lastMonth':
				start = new Date(today.setMonth(today.getMonth() - 1));
				break;
			case 'lastYear':
				start = new Date(today.setFullYear(today.getFullYear() - 1));
				break;
			case 'custom':
				return null;
			default:
				return null;
		}

		const formatDate = (date: Date) => date.toISOString().split('T')[0];
		setStartDate(formatDate(start));
		setEndDate(formatDate(end));
	};

	const handleTimePeriodChange = (e: SelectChangeEvent) => {
		const value = e.target.value;
		setTimePeriod(value);
		if (value !== 'custom') {
			getDateRange(value);
			// Auto-close date picker after selecting a period
			setShowDatePicker(false);
		} else {
			setStartDate('');
			setEndDate('');
		}
	};

	const handleSearch = (e: BaseSyntheticEvent) => {
		setSearchText(e.target.value.toLowerCase());
	};

	const handleFilterByStatus = (e: React.ChangeEvent<{}>, newValue: any) => {
		setActiveTab(newValue);
		setFilterBySelected(Number(newValue));
		// Reset to page 1 and maintain current page size when filtering
		fetchMoreContacts(searchText, Number(newValue), true, contactsPaginationSetting?.PageSize || 10, 1, false, startDate, endDate);
	};

	const handleAgentSelected = (e: SelectChangeEvent) => {
		setAgentSelected(Number(e.target.value));
		setCookie('whatsappSelectedAgentId', e.target.value);
	};

	// Helper function to get date chip label
	const getDateChipLabel = () => {
		if (timePeriod === 'lastMonth' && startDate && endDate) {
			// Don't show chip for default last month
			return null;
		}
		if (startDate && endDate) {
			const start = new Date(startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: startDate.substring(0, 4) !== new Date().getFullYear().toString() ? '2-digit' : undefined });
			const end = new Date(endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
			return `${start} - ${end}`;
		}
		return null;
	};

	// Get selected agent name for chip
	const getSelectedAgentName = () => {
		if (selectedAgent && selectedAgent > 0 && agentList) {
			const agent = (agentList as WhatsappAgent[]).find((a) => a.AgentId === selectedAgent);
			return agent?.Name || null;
		}
		return null;
	};

	const handleRemoveDateFilter = () => {
		setTimePeriod('lastMonth');
		getDateRange('lastMonth');
	};

	const handleRemoveAgentFilter = () => {
		setAgentSelected(0);
		setCookie('whatsappSelectedAgentId', '0');
	};

	// Clear all filters at once
	const handleClearAllFilters = () => {
		setTimePeriod('lastMonth');
		getDateRange('lastMonth');
		setAgentSelected(0);
		setCookie('whatsappSelectedAgentId', '0');
	};


	const [statusTabs, setStatusTabs] = useState([
		{ status: 'whatsappChat.allStatus', count: 0 },
		{ status: 'whatsappChat.open', count: 0 },
		{ status: 'whatsappChat.pending', count: 0 },
		{ status: 'whatsappChat.solved', count: 0 },
	]);

	// Initialize default date range on component mount
	useEffect(() => {
		getDateRange('lastMonth');
	}, []);

	useEffect(() => {
		setStatusTabs([
			{ status: 'whatsappChat.allStatus', count: TotalRecord },
			{ status: 'whatsappChat.open', count: TotalOpen },
			{ status: 'whatsappChat.pending', count: TotalPending },
			{ status: 'whatsappChat.solved', count: TotalSolved },
		]);
	}, [sideChatContacts, TotalRecord, TotalOpen, TotalPending, TotalSolved]);

	useEffect(() => {
		if (isInitialMount.current) {
			isInitialMount.current = false;
			return;
		}
		if (selectedAgent && selectedAgent > 0) {
			fetchMoreContacts(searchText, filterBySelected, true, contactsPaginationSetting?.PageSize || 10, 1, false, startDate, endDate);
		}
		else {
			fetchSearchedContacts(searchText, filterBySelected, true, startDate, endDate);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedAgent, debouncedValue]);

	// Fetch chats when date range changes
	useEffect(() => {
		if (isInitialMount.current) return;
		
		if (selectedAgent && selectedAgent > 0) {
			fetchMoreContacts(searchText, filterBySelected, true, contactsPaginationSetting?.PageSize || 10, 1, false, startDate, endDate);
		}
		else {
			fetchSearchedContacts(searchText, filterBySelected, true, startDate, endDate);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [startDate, endDate]);

	return (
		<>
			<aside
				className={`${classes.whatsappChat} sidebar ${isMobileSideBar && 'mobile-side-bar'
					}`}>
				<header className={`${classes.whatsappChat} header left`}>
					<div className={`${classes.whatsappChat} sidebar__avatar-wrapper`}>
						<img
							src={AccountUser}
							alt='Avatar'
							className={`${classes.whatsappChat} avatar`}
						/>
					</div>
					<SideHeaderContactDropDown
						classes={classes}
						phoneNumbersList={phoneNumbersList}
						onActiveUserChange={onActiveUserChange}
						activePhoneNumber={activePhoneNumber}
					/>
					<span style={{ marginInlineStart: 10 }}>
						<div>
							<IconButton
								onClick={() => onEditAgents()}
								title={translator("common.manageAgent")}
							>
							<BsPersonWorkspace />
							</IconButton>
						</div>
					</span>
					<div className={`${classes.whatsappChat} sidebar__actions`}>
						<IconButton
							className={classes.whatsappChatBarButton}
							onClick={setIsMobileSideBar}>
							<FaBars />
						</IconButton>
					</div>
				</header>
				<div className={clsx(`${classes.whatsappChat} tab-wrapper`, classes.dFlex)}>
					<Box className={clsx(`${classes.whatsappChat} tab-container`, classes.p5)}>
						<Tabs
							className={`${classes.whatsappChat} tabs-main`}
							classes={{ indicator: classes.hideIndicator }}
							value={activeTab}
							onChange={handleFilterByStatus}
							aria-label="status tabs">
							{statusTabs?.map((tab, index) => (
								<Tab
									className={`${classes.whatsappChat} custom-tab`}
									key={`${tab}_${index}`}
									label={
										<Box>
											<h2 className={classes.font16}>{translator(tab?.status)}</h2>
											<h6 className={classes.font14}>{tab?.count}</h6>
										</Box>
									} 
								/>
							))}
						</Tabs>
					</Box>
				</div>
				<div className={`${classes.whatsappChat} search-wrapper`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
					<div className={`${classes.whatsappChat} search-icons`}>
						<Icon
							id='search'
							className={`${classes.whatsappChat} search-icon`}
						/>
					<button 
						className={`${classes.whatsappChat} search__back-btn`}
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
						}}
					>
							<Icon id='back' />
						</button>
					</div>
					<input
						className={`${classes.whatsappChat} search`}
						placeholder={translator('whatsappChat.searchPlaceholder')}
						onChange={(e) => handleSearch(e)}
						value={searchText}
						style={{ flex: 1 }}
					/>
					<div className={`${classes.whatsappChat} search-icons-right`} style={{ display: 'flex', gap: '4px', pointerEvents: 'none' }}>
						<div 
							style={{ pointerEvents: 'auto' }} 
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
							}}
							onMouseDown={(e) => {
								e.preventDefault();
								e.stopPropagation();
							}}
						>
							<IconButton
								size='small'
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									setShowDatePicker(!showDatePicker);
								}}
								onMouseDown={(e) => {
									e.preventDefault();
									e.stopPropagation();
								}}
								disableRipple
								title='Calendar'
							>
								<FaCalendar style={{ fontSize: '16px' }} />
							</IconButton>
						</div>
						<div 
							style={{ pointerEvents: 'auto' }} 
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
							}}
							onMouseDown={(e) => {
								e.preventDefault();
								e.stopPropagation();
							}}
						>
							<IconButton
								size='small'
								title='Filter'
								disableRipple
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									setShowFilterDropdown(!showFilterDropdown);
								}}
								onMouseDown={(e) => {
									e.preventDefault();
									e.stopPropagation();
								}}
								>
								<FaFilter style={{ fontSize: '16px' }} />
							</IconButton>
						</div>
					</div>
				</div>
			{(getDateChipLabel() || getSelectedAgentName()) && (
			<Box style={{ display: 'flex', gap: '8px', padding: '8px 10px', flexWrap: 'wrap', alignItems: 'center', backgroundColor: '#fff', justifyContent: 'space-between' }}>
					<Box style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
						{getDateChipLabel() && (
							<Chip
								label={getDateChipLabel()}
								onDelete={handleRemoveDateFilter}
								size='small'
								className={classes.filterChip}
							/>
						)}
						{getSelectedAgentName() && (
							<Chip
								label={getSelectedAgentName()}
								onDelete={handleRemoveAgentFilter}
								size='small'
								className={classes.agentChip}
							/>
						)}
					</Box>
					<IconButton
						size='small'
						onClick={handleClearAllFilters}
						title={translator("common.clearAllFilters")}
						style={{ padding: '4px' }}
					>
						<FaTrash style={{ fontSize: '14px', color: '#666' }} />
					</IconButton>
				</Box>
			)}
			{showFilterDropdown && (
			<Box style={{ padding: '10px', backgroundColor: '#f5f5f5', paddingTop: 3 }}>
					<Box style={{ display: 'flex', gap: '12px', flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
						<Box style={{ flex: 1 }}>
							<Select
								autoWidth
								defaultValue='0'
								value={`${selectedAgent}`}
								variant='standard'
								style={{ fontSize: '13px', backgroundColor: '#fff', padding: '8px 10px', borderRadius: '4px', height: '32px' }}
								fullWidth
								displayEmpty
								MenuProps={{
									PaperProps: {
										style: {
											direction: isRTL ? 'rtl' : 'ltr',
										},
									},
								}}
								onChange={(e: SelectChangeEvent) => {
									handleAgentSelected(e);
									setShowFilterDropdown(false);
								}}
							>
								<MenuItem value={0}>{translator('whatsappChat.selectAgent')}</MenuItem>
								{agentList?.map((agent: WhatsappAgent) => {
									return <MenuItem key={agent.AgentId} value={agent.AgentId}>{agent.Name}</MenuItem>
								})}
							</Select>
						</Box>
					</Box>
			</Box>
			)}
			{showDatePicker && (
			<Box style={{ padding: '10px', backgroundColor: '#f5f5f5', paddingTop: 3 }}>
					<Box style={{ display: 'flex', gap: '12px', flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
						<Box style={{ flex: 1 }}>
							<Select
								value={timePeriod}
								onChange={handleTimePeriodChange}
								variant='standard'
								fullWidth
								displayEmpty
								style={{ fontSize: '13px', backgroundColor: '#fff', padding: '8px 10px', borderRadius: '4px', height: '32px', display: 'flex', alignItems: 'center' }}
							>
								<MenuItem value='lastWeek'>{translator("common.lastWeek")}</MenuItem>
								<MenuItem value='lastMonth'>{translator("common.lastMonth")}</MenuItem>
								<MenuItem value='lastYear'>{translator("common.lastYear")}</MenuItem>
								<MenuItem value='custom'>{translator("common.specificDates")}</MenuItem>
							</Select>
						</Box>
						<Box style={{ flex: 1 }}>
							<TextField
								type='date'
								value={startDate}
								onChange={(e) => setStartDate(e.target.value)}
								InputLabelProps={{
									shrink: true,
									style: { fontSize: '12px', color: '#666' }
								}}
								inputProps={{
									style: { fontSize: '13px', padding: '8px 10px' }
								}}
								variant='standard'
								size='small'
								fullWidth
								placeholder='dd/mm/yyyy'
								style={{
									backgroundColor: '#fff',
									borderRadius: '4px'
								}}
							/>
						</Box>
						<Box style={{ flex: 1 }}>
							<TextField
								type='date'
								value={endDate}
								onChange={(e) => setEndDate(e.target.value)}
								InputLabelProps={{
									shrink: true,
									style: { fontSize: '12px', color: '#666' }
								}}
								inputProps={{
									style: { fontSize: '13px', padding: '8px 10px' }
								}}
								variant='standard'
								size='small'
								fullWidth
								placeholder='dd/mm/yyyy'
								style={{
									backgroundColor: '#fff',
									borderRadius: '4px'
								}}
							/>
						</Box>
						{timePeriod === 'custom' && (
							<Box>
								<Button
									size='small'
									variant='contained'
									color='primary'
									onClick={() => setShowDatePicker(false)}
									style={{ fontSize: '12px', padding: '6px 12px', height: '32px' }}
								>
									{translator('common.apply')}
								</Button>
							</Box>
						)}
					</Box>
				</Box>
			)}
			<SideBarContactList
					classes={classes}
					ChatContacts={sideChatContacts}
					handleChatId={handleChatId}
					handleUserStatus={handleUserStatus}
					getStatusClass={getStatusClass}
					fetchMoreContacts={() =>
						fetchMoreContacts(searchText, filterBySelected)
					}
					contactsPaginationSetting={contactsPaginationSetting}
					isLoader={isLoader}
					searchText={searchText}
				/>
				<TablePagination
					classes={classes}
					rows={TotalRecord}
					rowsPerPage={contactsPaginationSetting?.PageSize || 10}
					page={contactsPaginationSetting?.PageNo || 1}
					onPageChange={(newPage: number) => {
						// Skip if we just changed rows per page (to avoid double fetch)
						if (isChangingRowsPerPage.current) {
							isChangingRowsPerPage.current = false;
							return;
						}
						fetchMoreContacts(
							searchText,
							filterBySelected,
							true,
							contactsPaginationSetting?.PageSize || 10,
							newPage,
							false,
							startDate,
							endDate
						);
					}}
					rowsPerPageOptions={[10, 20, 50, 100] as any}
					onRowsPerPageChange={(newPageSize: number) => {
						// Set flag to prevent onPageChange from firing
						isChangingRowsPerPage.current = true;
						// Reset to first page when changing page size
						fetchMoreContacts(
							searchText,
							filterBySelected,
							true,
							newPageSize,
							1,
							false,
							startDate,
							endDate
						);
					}}
					style={{ borderTop: '1px solid #e0e0e0', backgroundColor: '#f9f9f9', paddingInline: 10, paddingTop: 0, paddingBottom: 0 }}
				/>
			</aside>
		</>
	);
};

export default SideBar;
