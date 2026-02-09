import Icon from './Icon';
import clsx from 'clsx';
import {
	WhatsappChatSideBarProps,
} from '../Types/WhatsappChat.type';
import AccountUser from '../../../../assets/images/acc-user.jpg';
import { Box, Button, IconButton, MenuItem, Tab, Tabs, TextField, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, FormControlLabel } from '@material-ui/core';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { FaBars, FaCalendar, FaFilter, FaTrash } from 'react-icons/fa';
import { BsFillTagsFill, BsPeopleFill, BsPersonWorkspace, BsX } from 'react-icons/bs';
import { BaseSyntheticEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SideHeaderContactDropDown from './SideHeaderContactDropDown';
import SideBarContactList from './SideBarContactList';
import useDebounce from '../Hook/useDebounce';
import { useSelector, useDispatch } from 'react-redux';
import { coreProps, WhatsappAgent } from '../../Campaign/Types/WhatsappCampaign.types';
import { StateType } from '../../../../Models/StateTypes';
import { setCookie } from '../../../../helpers/Functions/cookies';
import { TablePagination } from '../../../../components/managment/index';
import { COLORS } from '../../../../helpers/Constants';
import { getWhatsappChatTag } from '../../../../redux/reducers/whatsappSlice';
import { PulseemReactInstance } from '../../../../helpers/Api/PulseemReactAPI';
import Toast from '../../../../components/Toast/Toast.component';

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
	onTagsUpdated,
	TotalRecord,
	TotalOpen,
	TotalPending,
	TotalSolved
}: WhatsappChatSideBarProps) => {
	const { t: translator } = useTranslation();
	const { isRTL } = useSelector((state: { core: coreProps }) => state.core);
	const { agentList } = useSelector((state: StateType) => state.whatsapp);
	const dispatch = useDispatch();
	const [searchText, setSearchText] = useState<string>('');
	const debouncedValue = useDebounce<string>(searchText, 500);
	const [activeTab, setActiveTab] = useState(0);
	const isInitialMount = useRef(true);
	const isChangingRowsPerPage = useRef(false);
	const dateRangeRef = useRef<HTMLDivElement>(null);
	const [startDate, setStartDate] = useState<string>('');
	const [endDate, setEndDate] = useState<string>('');
	const [startTime, setStartTime] = useState<string>('');
	const [endTime, setEndTime] = useState<string>('');
	const [timePeriod, setTimePeriod] = useState<string>('lastMonth');
	const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
	const [showFilterDropdown, setShowFilterDropdown] = useState<boolean>(false);
	const [showFilterDialog, setShowFilterDialog] = useState<boolean>(false);
	const [selectedAgents, setSelectedAgents] = useState<number[]>([]);
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [dialogTimePeriod, setDialogTimePeriod] = useState<string>('lastMonth');
	const [dialogStartDate, setDialogStartDate] = useState<string>('');
	const [dialogEndDate, setDialogEndDate] = useState<string>('');
	const [dialogStartTime, setDialogStartTime] = useState<string>('');
	const [dialogEndTime, setDialogEndTime] = useState<string>('');
	const [showEditTagsDialog, setShowEditTagsDialog] = useState<boolean>(false);
	const [tagsList, setTagsList] = useState<Array<{ id: string; TagName: string; TagColor: string }>>([]);
	const [editingTags, setEditingTags] = useState<Array<{ id: string; TagName: string; TagColor: string }>>([]);
	const [savingTagId, setSavingTagId] = useState<string | null>(null);
	const [toastMessage, setToastMessage] = useState<any>(null);

	// Get available tags from tagsList
	console.log('tagsList', tagsList);
	// Initialize default date range on mount
	useEffect(() => {
		getDateRange('lastMonth');
	}, []);

	// Fetch tags on component mount
	useEffect(() => {
		const fetchTags = async () => {
			try {
				const result = await dispatch(getWhatsappChatTag()) as any;
				console.log('getWhatsappChatTag response:', result)
				if (result.payload && result.payload?.Data && Array.isArray(result.payload?.Data)) {
					// Transform tags: convert Id -> id and keep only needed fields
					const normalizedTags = result.payload.Data.map((tag: any) => ({
						id: String(tag.Id),
						TagName: tag.TagName,
						TagColor: tag.TagColor
					}));
					console.log('Tags from API (normalized):', normalizedTags);
					setTagsList(normalizedTags);
				}
			} catch (error) {
				console.error('Failed to fetch tags:', error);
			}
		};
		fetchTags();
	}, [dispatch]);

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

	// Helper function to get date chip label with time
	const getDateChipLabel = () => {
		if (timePeriod === 'lastMonth') {
			// Don't show chip for default last month
			return null;
		}
		if (startDate && endDate && startTime && endTime) {
			// Format time to 12-hour AM/PM
			const formatTime = (timeStr: string) => {
				if (!timeStr) return '';
				const [hours, minutes] = timeStr.split(':').map(Number);
				const ampm = hours >= 12 ? 'PM' : 'AM';
				const displayHours = hours % 12 || 12;
				return `${displayHours}:${String(minutes).padStart(2, '0')} ${ampm}`;
			};

			// Format date to "03 Feb"
			const formatDatePart = (dateStr: string) => {
				const date = new Date(dateStr);
				return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
			};

			const startTimeFormatted = formatTime(startTime);
			const endTimeFormatted = formatTime(endTime);
			const startDateFormatted = formatDatePart(startDate);
			const endDateFormatted = formatDatePart(endDate);

			return `${startTimeFormatted} ${startDateFormatted} - ${endTimeFormatted} ${endDateFormatted}`;
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
		setSelectedAgents([]);
		setSelectedTags([]);
	};

	const handleAgentToggle = (agentId: number) => {
		setSelectedAgents(prev =>
			prev.includes(agentId)
				? prev.filter(id => id !== agentId)
				: [...prev, agentId]
		);
	};

	const handleTagToggle = (tag: string) => {
		setSelectedTags(prev =>
			prev.includes(tag)
				? prev.filter(t => t !== tag)
				: [...prev, tag]
		);
	};

	const handleApplyFilters = () => {
		// Apply filters - will fetch contacts with selected agents and tags
		setShowFilterDialog(false);
		
		// Apply the dates and times from dialog to actual state
		setStartDate(dialogStartDate);
		setEndDate(dialogEndDate);
		setStartTime(dialogStartTime);
		setEndTime(dialogEndTime);
		setTimePeriod(dialogTimePeriod);
		
		// If agents selected, apply the first one as selectedAgent
		if (selectedAgents.length > 0) {
			setAgentSelected(selectedAgents[0]);
			setCookie('whatsappSelectedAgentId', String(selectedAgents[0]));
		} else {
			setAgentSelected(0);
			setCookie('whatsappSelectedAgentId', '0');
		}
		
		// Trigger fetch with current filters including agent and tag IDs
		fetchMoreContacts(searchText, filterBySelected, true, contactsPaginationSetting?.PageSize || 10, 1, false, dialogStartDate, dialogEndDate, selectedAgents, []);
	};

	const handleSetDateRange = (period: string) => {
		setDialogTimePeriod(period);
		const today = new Date();
		let start = new Date();
		let end = new Date(today);

		switch (period) {
			case 'last24hours':
				// Last 24 Hours: 12:01 AM 24 hours ago to 11:59 PM today
				start = new Date(today.getTime() - 24 * 60 * 60 * 1000);
				setDialogStartTime('00:01'); // 12:01 AM
				setDialogEndTime('23:59');   // 11:59 PM
				break;
			case 'lastWeek':
				// Last Week: 12:01 AM 7 days ago to 11:59 PM today
				start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
				setDialogStartTime('00:01'); // 12:01 AM
				setDialogEndTime('23:59');   // 11:59 PM
				break;
			case 'lastMonth':
				// Last Month: 12:01 AM 30 days ago to 11:59 PM today
				start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
				setDialogStartTime('00:01'); // 12:01 AM
				setDialogEndTime('23:59');   // 11:59 PM
				break;
			case 'custom':
				// Custom Range: User picks dates, times auto-assigned
				setDialogStartDate('');
				setDialogEndDate('');
				setDialogStartTime('00:01'); // 12:01 AM (default start)
				setDialogEndTime('23:59');   // 11:59 PM (default end)
				return;
			default:
				return null;
		}

		const formatDate = (date: Date) => date.toISOString().split('T')[0];
		setDialogStartDate(formatDate(start));
		setDialogEndDate(formatDate(end));
	};

	// Tag editing handlers
	const handleOpenEditTags = () => {
		setEditingTags([...tagsList]);
		setShowEditTagsDialog(true);
	};

	const handleCloseEditTags = () => {
		setShowEditTagsDialog(false);
	};

	const handleUpdateTag = (index: number, field: 'TagName' | 'TagColor', value: string) => {
		const updatedTags = [...editingTags];
		updatedTags[index][field] = value;
		setEditingTags(updatedTags);
	};

	const handleDeleteTag = async (index: number) => {
		const tag = editingTags[index];

		// Only delete if it's not a new tag (id !== '0')
		if (tag.id === '0') {
			// New unsaved tag - just remove from editingTags
			setEditingTags(editingTags.filter((_, i) => i !== index));
			return;
		}

		try {
			setSavingTagId(tag.id);

			const tagId = parseInt(tag.id);
			console.log('Deleting tag with ID:', tagId);

			const response = await PulseemReactInstance.delete(
				`WhatsAppChat/DeleteWhatsAppChatTag?tagId=${tagId}`
			);

			console.log('Delete API Response:', response.data);

			// Remove from editingTags
			const updatedEditingTags = editingTags.filter((_, i) => i !== index);
			setEditingTags(updatedEditingTags);

			// Remove from tagsList
			const updatedTagsList = tagsList.filter(t => t.id !== tag.id);
			setTagsList(updatedTagsList);

			setToastMessage({ message: 'Tag deleted successfully', severity: 'success' });
			setTimeout(() => setToastMessage(null), 3000);

		} catch (error: any) {
			console.error('Error deleting tag:', error);
			setToastMessage({
				message: error.response?.data?.message || 'Failed to delete tag',
				severity: 'error'
			});
			setTimeout(() => setToastMessage(null), 3000);
		} finally {
			setSavingTagId(null);
		}
	};

	const handleAddNewTag = () => {
		setEditingTags([...editingTags, { id: '0', TagName: '', TagColor: COLORS[0] }]);
	};

	// Save tag to backend
	const handleSaveTag = async (index: number) => {
		const tag = editingTags[index];

		// Validation
		if (!tag.TagName || tag.TagName.trim() === '') {
			setToastMessage({ message: 'Tag name cannot be empty', severity: 'error' });
			setTimeout(() => setToastMessage(null), 3000);
			return;
		}

		try {
			setSavingTagId(tag.id);

			const payloadId = tag.id === '0' ? 0 : parseInt(tag.id);
			
			console.log('Sending to API:', {
				Id: payloadId,
				TagName: tag.TagName,
				TagColor: tag.TagColor,
				originalTagId: tag.id
			});

			const response = await PulseemReactInstance.post(
				'WhatsAppChat/ManageWhatsAppChatTag',
				{
					Id: payloadId,
					TagName: tag.TagName,
					TagColor: tag.TagColor
				}
			);

			console.log('API Response:', response.data);

			if (response.data) {
				// The API returns the ID in the Data field (e.g., {StatusCode: 201, Message: 'Success', Data: 16})
				const returnedId = response.data.Data || response.data.Id;
				const finalId = returnedId !== null && returnedId !== undefined ? String(returnedId) : tag.id;
				// Use returned TagColor, or fallback to local tag.TagColor if not provided
				const returnedColor = response.data.TagColor || tag.TagColor;
				
				console.log('Final ID to save:', finalId);
				
				// Update the editingTags with the response
				const updatedEditingTags = [...editingTags];
				updatedEditingTags[index] = {
					id: finalId,
					TagName: response.data.TagName || tag.TagName,
					TagColor: returnedColor
				};
				setEditingTags(updatedEditingTags);

				// Also update the main tagsList
				const existingIndex = tagsList.findIndex(t => t.id === tag.id);
				if (existingIndex !== -1) {
					// Update existing tag
					const updatedTagsList = [...tagsList];
					updatedTagsList[existingIndex] = {
						id: finalId,
						TagName: response.data.TagName || tag.TagName,
						TagColor: returnedColor
					};
					setTagsList(updatedTagsList);
				} else {
					// Add new tag
					setTagsList([...tagsList, {
						id: finalId,
						TagName: response.data.TagName || tag.TagName,
						TagColor: returnedColor
					}]);
				}

				setToastMessage({ message: 'Tag saved successfully', severity: 'success' });

				// Clear toast after 3 seconds
				setTimeout(() => setToastMessage(null), 3000);
			}
		} catch (error: any) {
			console.error('Error saving tag:', error);
			setToastMessage({
				message: error.response?.data?.message || 'Failed to save tag',
				severity: 'error'
			});
			setTimeout(() => setToastMessage(null), 3000);
		} finally {
			setSavingTagId(null);
		}
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
				<header className={clsx(`${classes.whatsappChat} header left`, classes.sidebarHeader)}>
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
					<div className={classes.agentManagementButtonsWrapper}>
							<IconButton
								onClick={() => onEditAgents()}
								title={translator("common.manageAgent")}
							>
								<BsPeopleFill />
							</IconButton>
							<IconButton
								onClick={() => handleOpenEditTags()}
								title='Edit Tags'
							>
								<BsFillTagsFill />
							</IconButton>
					</div>
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
				<div className={classes.searchAreaWrapper}>
					<div className={clsx(`${classes.whatsappChat} search-wrapper`, classes.searchWrapperComplex)}>
						<div className={clsx(`${classes.whatsappChat} search-icons`, classes.searchIconsStyle)}>
							<Icon
								id='search'
								className={`${classes.whatsappChat} search-icon`}
							/>
							<button 
								className={clsx(`${classes.whatsappChat} search__back-btn`, classes.searchInputHidden)}
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
							style={{ 
								flex: 2,
								border: 'none',
								backgroundColor: 'transparent',
								outline: 'none',
								fontSize: '14px',
								color: '#333',
								padding: '0 8px 0 40px'
							}}
						/>
						<div className={clsx(`${classes.whatsappChat} search-icons-right`, classes.searchIconsRight)}>
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
									setShowFilterDialog(true);									// Scroll to date range section after dialog opens
									setTimeout(() => {
										dateRangeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
									}, 100);									}}
									onMouseDown={(e) => {
										e.preventDefault();
										e.stopPropagation();
									}}
									disableRipple
									title='Calendar'
									style={{ padding: '4px' }}
								>
									<FaCalendar style={{ fontSize: '16px', color: '#FF3343' }} />
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
										setShowFilterDialog(true);
									}}
									onMouseDown={(e) => {
										e.preventDefault();
										e.stopPropagation();
									}}
									style={{ padding: '4px' }}
									>
									<FaFilter style={{ fontSize: '16px', color: '#FF3343' }} />
								</IconButton>
							</div>
						</div>
					</div>
				</div>
			{(getDateChipLabel() || getSelectedAgentName()) && (
			<Box className={classes.chipsContainer}>
					<Box className={classes.chipsWrapper}>
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
					tagsList={tagsList}
					onTagsUpdated={onTagsUpdated}
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
		{/* Filter Dialog */}
			<Dialog 
				open={showFilterDialog} 
				onClose={() => setShowFilterDialog(false)}
				maxWidth="sm"
				fullWidth
				PaperProps={{
					style: {
						borderRadius: '12px'
					}
				}}
			>
				<DialogTitle 
					style={{ 
						backgroundColor: '#FF3343', 
						color: '#fff', 
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						padding: '16px 20px',
						fontSize: '18px',
						fontWeight: 'bold'
					}}
				>
					<span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
						<FaFilter /> Filter Chats
					</span>
					<IconButton
						onClick={() => setShowFilterDialog(false)}
						style={{ color: '#fff', padding: '0', position: 'absolute', right: '25px', top: '12px' }}
					>
						<BsX fontSize={40} />
					</IconButton>
				</DialogTitle>
				<DialogContent style={{ padding: '20px' }}>
					{/* Agents Section */}
					<Box style={{ marginBottom: '24px' }}>
						<h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#333' }}>
							Agents
						</h3>
					<Box style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
						{agentList?.map((agent: WhatsappAgent) => (
							<Chip
								key={agent.AgentId}
								label={agent.Name}
								onClick={() => handleAgentToggle(agent.AgentId)}
								style={{
									backgroundColor: selectedAgents.includes(agent.AgentId) ? '#FF3343' : '#fff',
									color: selectedAgents.includes(agent.AgentId) ? '#fff' : '#333',
									border: selectedAgents.includes(agent.AgentId) ? 'none' : '1px solid #ddd',
									cursor: 'pointer'
								}}
							/>
						))}
					</Box>
			</Box>
				{/* Tags Section */}
				<Box style={{ marginBottom: '24px' }}>
				<Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
					<h3 style={{ margin: '0', fontSize: '14px', fontWeight: '600', color: '#333' }}>
						Tags
					</h3>
					<Button
						size='small'
						onClick={handleOpenEditTags}
						style={{
							fontSize: '12px',
							padding: '4px 8px',
							color: '#FF3343',
							textTransform: 'none',
							fontWeight: '600'
						}}
					>
						Edit
					</Button>
				</Box>
				<Box style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
					{tagsList.map((tag: any) => (
						<Chip
							key={tag?.id}
							label={tag?.TagName}
							onClick={() => handleTagToggle(tag)}
							style={{
								backgroundColor: selectedTags.includes(tag?.TagName) ? '#FF3343' : '#fff',
								color: selectedTags.includes(tag?.TagName) ? '#fff' : '#333',
								border: selectedTags.includes(tag?.TagName) ? 'none' : '1px solid #ddd',
								cursor: 'pointer'
							}}
						/>
					))}
				</Box>
			</Box>
					<div ref={dateRangeRef}>
						<Box style={{ marginBottom: '24px' }}>
							<h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#333' }}>
								Date & Time Range
							</h3>
						<Box style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
							<Chip
								label={translator('whatsappChat.last24hours')}
								onClick={() => handleSetDateRange('last24hours')}
								style={{
									width: '100%',
									height: '40px',
									backgroundColor: dialogTimePeriod === 'last24hours' ? '#FF3343' : '#fff',
									color: dialogTimePeriod === 'last24hours' ? '#fff' : '#999',
									border: '1px solid #ddd',
									cursor: 'pointer',
									fontSize: '14px',
									fontWeight: '500'
								}}
							/>
							<Chip
								label={translator('whatsappChat.lastWeek')}
								onClick={() => handleSetDateRange('lastWeek')}
								style={{
									width: '100%',
									height: '40px',
									backgroundColor: dialogTimePeriod === 'lastWeek' ? '#FF3343' : '#fff',
									color: dialogTimePeriod === 'lastWeek' ? '#fff' : '#999',
									border: '1px solid #ddd',
									cursor: 'pointer',
									fontSize: '14px',
									fontWeight: '500'
								}}
							/>
							<Chip
								label={translator('whatsappChat.lastMonth')}
								onClick={() => handleSetDateRange('lastMonth')}
								style={{
									width: '100%',
									height: '40px',
									backgroundColor: dialogTimePeriod === 'lastMonth' ? '#FF3343' : '#fff',
									color: dialogTimePeriod === 'lastMonth' ? '#fff' : '#999',
									border: '1px solid #ddd',
									cursor: 'pointer',
									fontSize: '14px',
									fontWeight: '500'
								}}
							/>
							<Chip
								label={translator('whatsappChat.customRange')}
								onClick={() => handleSetDateRange('custom')}
								style={{
									width: '100%',
									height: '40px',
									backgroundColor: dialogTimePeriod === 'custom' ? '#FF3343' : '#fff',
									color: dialogTimePeriod === 'custom' ? '#fff' : '#999',
									border: '1px solid #ddd',
									cursor: 'pointer',
									fontSize: '14px',
									fontWeight: '500'
								}}
							/>
						</Box>
					</Box>
				</div>
				{/* Custom Date Input Fields (Times auto-assigned: 12:01 AM start, 11:59 PM end) */}
				{dialogTimePeriod === 'custom' && (
					<Box style={{ display: 'flex', flexDirection: 'row', gap: '12px', marginTop: '12px' }}>
						<TextField
							label={translator('whatsappChat.startDate')}
							type='date'
							value={dialogStartDate}
							onChange={(e) => {
								setDialogStartDate(e.target.value);
								// Auto-assign start time: 12:01 AM
								setDialogStartTime('00:01');
							}}
							InputLabelProps={{ shrink: true }}
							size='small'
							style={{ flex: 1 }}
						/>
						<TextField
							label={translator('whatsappChat.endDate')}
							type='date'
							value={dialogEndDate}
							onChange={(e) => {
								setDialogEndDate(e.target.value);
								// Auto-assign end time: 11:59 PM
								setDialogEndTime('23:59');
							}}
							InputLabelProps={{ shrink: true }}
							size='small'
							style={{ flex: 1 }}
						/>
					</Box>
				)}
			</DialogContent>
				<DialogActions style={{ padding: '16px 20px', borderTop: '1px solid #eee' }}>
					<Button
						onClick={() => setShowFilterDialog(false)}
						className={clsx(classes.btn, classes.btnRounded)}
					>
						{translator('common.cancel')}
					</Button>
					<Button
						onClick={handleApplyFilters}
						className={clsx(classes.btn, classes.btnRounded)}
						style={{ backgroundColor: '#FF3343', color: '#fff' }}
					>
						{translator('whatsappChat.applyFilters')}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Edit Tags Dialog */}
		<Dialog 
			open={showEditTagsDialog} 
			onClose={handleCloseEditTags} 
			maxWidth='sm' 
			fullWidth
			PaperProps={{
				style: {
					borderRadius: '16px',
					overflow: 'hidden'
				}
			}}
		>
			<DialogTitle className={classes.editTagsDialogTitle}>
				<Box className={classes.editTagsHeaderContainer}>
					<BsFillTagsFill size={20} className={classes.editTagsIcon} />
					<span className={classes.editTagsHeaderText}>{translator('whatsappChat.editTags')}</span>
				</Box>
				<IconButton onClick={handleCloseEditTags} className={classes.editTagsCloseButton} style={{ color: '#fff', padding: '0', position: 'absolute', right: '25px', top: '12px' }}>
					<BsX fontSize={40} />
				</IconButton>
			</DialogTitle>

			<DialogContent className={classes.editTagsDialogContent}>
				{editingTags.map((tag, index) => (
					<Box
						key={index}
						className={classes.editTagsItem}
					>
						<label className={classes.editTagsLabel}>
							{translator('whatsappChat.tagName')}
						</label>
						<Box className={classes.editTagsInputRow}>
							<TextField
								// @ts-ignore
								value={tag.TagName}
								// @ts-ignore
								onChange={(e) => handleUpdateTag(index, 'TagName', e.target.value)}
								placeholder={translator('whatsappChat.enterTagName')}
								size='small'
								variant='outlined'
								className={classes.editTagsTextField}
								/>

							<Box className={classes.editTagsButtonsContainer}>
								<Button
									variant='outlined'
									size='small'
									className={clsx(classes.btn, classes.btnRounded)}
									disabled={savingTagId === tag.id}
									// @ts-ignore
									onClick={() => handleSaveTag(index)}
								>
									{savingTagId === tag.id ? translator('common.saving') : tag.id === '0' ? translator('common.save') : translator('common.update')}
								</Button>

								<IconButton
									onClick={() => handleDeleteTag(index)}
									className={classes.editTagsDeleteButton}
									disabled={savingTagId === tag.id}
								>
									<FaTrash />
								</IconButton>
							</Box>
						</Box>

						<Box className={classes.editTagsColorContainer}>
							{COLORS.map((color) => (
								<Box
									key={color}
									onClick={() => handleUpdateTag(index, 'TagColor', color)}
									className={clsx(
										classes.editTagsColorCircle,
										tag?.TagColor === color && classes.editTagsColorCircleSelected
									)}
									style={{
										backgroundColor: color
									}}
								/>
							))}
						</Box>
					</Box>
				))}

				<Box className={classes.editTagsAddNewTagBox}>
					<Button
						fullWidth
						variant='outlined'
						className={clsx(classes.btn, classes.btnRounded)}
						onClick={handleAddNewTag}
					>
						{translator('whatsappChat.addNewTag')}
					</Button>
				</Box>
			</DialogContent>

			</Dialog>

			{/* Toast Notification */}
			{toastMessage && (
				<Toast
					customData={toastMessage as any}
					data={null}
				/>
			)}
		</>
	);
};

export default SideBar;
