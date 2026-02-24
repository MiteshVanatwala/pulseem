import Icon from './Icon';
import clsx from 'clsx';
import { WhatsappChatSideBarProps } from '../Types/WhatsappChat.type';
import AccountUser from '../../../../assets/images/acc-user.jpg';
import {
	Box,
	Button,
	IconButton,
	MenuItem,
	Tab,
	Tabs,
	TextField,
	Chip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	ThemeProviderProps,
	Paper,
	ClickAwayListener,
	MenuList,
	Popper,
	Typography,
} from '@material-ui/core';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { FaBars, FaCalendar, FaFilter, FaTrash } from 'react-icons/fa';
import {
	BsFillTagsFill,
	BsPeopleFill,
	BsPersonWorkspace,
	BsX,
} from 'react-icons/bs';
import { BaseSyntheticEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SideHeaderContactDropDown from './SideHeaderContactDropDown';
import SideBarContactList from './SideBarContactList';
import useDebounce from '../Hook/useDebounce';
import { useSelector, useDispatch } from 'react-redux';
import {
	coreProps,
	WhatsappAgent,
} from '../../Campaign/Types/WhatsappCampaign.types';
import { StateType } from '../../../../Models/StateTypes';
import { setCookie } from '../../../../helpers/Functions/cookies';
import { TablePagination } from '../../../../components/managment/index';
import { COLORS } from '../../../../helpers/Constants';
import { getWhatsappChatTag } from '../../../../redux/reducers/whatsappSlice';
import { PulseemReactInstance } from '../../../../helpers/Api/PulseemReactAPI';
import Toast from '../../../../components/Toast/Toast.component';
import DynamicConfirmDialog from '../../../../components/DialogTemplates/DynamicConfirmDialog';

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
	onTagColorUpdated,
	TotalRecord,
	TotalOpen,
	TotalPending,
	TotalSolved,
}: WhatsappChatSideBarProps) => {
	const { t: translator } = useTranslation();
	const { isRTL, userRoles } = useSelector(
		(state: { core: coreProps }) => state.core,
	);
	const { agentList } = useSelector((state: StateType) => state.whatsapp);
	const isAdmin =
		userRoles &&
		userRoles.AllowSend &&
		userRoles.AllowExport &&
		userRoles.AllowDelete &&
		!userRoles.HideRecipients;
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
	const [selectedTags, setSelectedTags] = useState<number[]>([]);
	const [dialogSelectedAgents, setDialogSelectedAgents] = useState<number[]>(
		[],
	);
	const [dialogSelectedTags, setDialogSelectedTags] = useState<number[]>([]);
	const [dialogTimePeriod, setDialogTimePeriod] = useState<string>('lastMonth');
	const [dialogStartDate, setDialogStartDate] = useState<string>('');
	const [dialogEndDate, setDialogEndDate] = useState<string>('');
	const [dialogStartTime, setDialogStartTime] = useState<string>('');
	const [dialogEndTime, setDialogEndTime] = useState<string>('');
	const [showEditTagsDialog, setShowEditTagsDialog] = useState<boolean>(false);
	const [tagsList, setTagsList] = useState<
		Array<{ id: string; TagName: string; TagColor: string }>
	>([]);
	const [editingTags, setEditingTags] = useState<
		Array<{ id: string; TagName: string; TagColor: string }>
	>([]);
	const [savingTagId, setSavingTagId] = useState<string | null>(null);
	const [toastMessage, setToastMessage] = useState<any>(null);
	const [showDateRangePopup, setShowDateRangePopup] = useState<boolean>(false);
	const dateRangeAnchorRef = useRef<HTMLButtonElement>(null);
	const [showDeleteTagConfirm, setShowDeleteTagConfirm] =
		useState<boolean>(false);
	const [tagToDelete, setTagToDelete] = useState<{
		index: number;
		tag: any;
	} | null>(null);

	// Initialize default date range on mount
	useEffect(() => {
		getDateRange('lastMonth');
	}, []);

	// Fetch tags on component mount
	useEffect(() => {
		const fetchTags = async () => {
			try {
				const result = (await dispatch(getWhatsappChatTag())) as any;
				if (
					result.payload &&
					result.payload?.Data &&
					Array.isArray(result.payload?.Data)
				) {
					// Transform tags: convert Id -> id and keep only needed fields
					const normalizedTags = result.payload.Data.map((tag: any) => ({
						id: String(tag.Id),
						TagName: tag.TagName,
						TagColor: tag.TagColor,
					}));
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
			case 'last24hours':
				// Last 24 Hours: 12:01 AM 24 hours ago to 11:59 PM today
				start = new Date(today.getTime() - 24 * 60 * 60 * 1000);
				setStartTime('00:01');
				setEndTime('23:59');
				break;
			case 'lastWeek':
				// Last Week: 12:01 AM 7 days ago to 11:59 PM today
				start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
				setStartTime('00:01');
				setEndTime('23:59');
				break;
			case 'lastMonth':
				// Last Month: 12:01 AM 30 days ago to 11:59 PM today
				start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
				setStartTime('00:01');
				setEndTime('23:59');
				break;
			case 'lastYear':
				// Last Year: 12:01 AM 1 year ago to 11:59 PM today
				start = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
				setStartTime('00:01');
				setEndTime('23:59');
				break;
			case 'custom':
				setStartDate('');
				setEndDate('');
				setStartTime('00:01');
				setEndTime('23:59');
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
		fetchMoreContacts(
			searchText,
			Number(newValue),
			true,
			contactsPaginationSetting?.PageSize || 10,
			1,
			false,
			startDate,
			endDate,
			selectedAgents,
			selectedTags,
			startTime,
			endTime,
		);
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
				return date.toLocaleDateString('en-GB', {
					day: '2-digit',
					month: 'short',
				});
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
	const getSelectedAgentsDetails = () => {
		return selectedAgents
			.map((agentId) => {
				const agent = (agentList as WhatsappAgent[])?.find(
					(a) => a.AgentId === agentId,
				);
				return agent ? { id: agentId, name: agent.Name } : null;
			})
			.filter(Boolean);
	};

	const handleRemoveDateFilter = () => {
		setTimePeriod('lastMonth');
		getDateRange('lastMonth');
		// Fetch will be triggered by useEffect watching startDate/endDate
		// Times are set by getDateRange, so no need to set them here
	};

	const handleRemoveAgentFilter = (agentId: number) => {
		const newSelectedAgents = selectedAgents.filter((id) => id !== agentId);
		setSelectedAgents(newSelectedAgents);

		// Update single agent selector if needed
		if (newSelectedAgents.length === 0) {
			setAgentSelected(0);
			setCookie('whatsappSelectedAgentId', '0');
		} else if (selectedAgent === agentId) {
			// If we removed the currently selected single agent, update to first remaining
			setAgentSelected(newSelectedAgents[0]);
			setCookie('whatsappSelectedAgentId', String(newSelectedAgents[0]));
		}

		// Trigger fetch immediately with remaining filters
		fetchMoreContacts(
			searchText,
			filterBySelected,
			true,
			contactsPaginationSetting?.PageSize || 10,
			1,
			false,
			startDate,
			endDate,
			newSelectedAgents,
			selectedTags,
			startTime,
			endTime,
		);
	};

	const handleRemoveTagFilter = (tagId: number) => {
		const newSelectedTags = selectedTags.filter((id) => id !== tagId);
		setSelectedTags(newSelectedTags);
		// Trigger fetch immediately with remaining filters
		fetchMoreContacts(
			searchText,
			filterBySelected,
			true,
			contactsPaginationSetting?.PageSize || 10,
			1,
			false,
			startDate,
			endDate,
			selectedAgents,
			newSelectedTags,
			startTime,
			endTime,
		);
	};

	// Get selected tags details (name and color)
	const getSelectedTagsDetails = () => {
		return selectedTags
			.map((tagId) => {
				const tag = tagsList.find((t) => parseInt(t.id) === tagId);
				return tag
					? { id: tagId, name: tag.TagName, color: tag.TagColor }
					: null;
			})
			.filter(Boolean);
	};

	// Clear all filters at once
	const handleClearAllFilters = () => {
		setTimePeriod('lastMonth');
		getDateRange('lastMonth');
		setAgentSelected(0);
		setCookie('whatsappSelectedAgentId', '0');
		setSelectedAgents([]);
		setSelectedTags([]);
		// Note: useEffects will handle the fetch after state updates
		// Times are set by getDateRange, so no need to set them here
	};

	const handleAgentToggle = (agentId: number) => {
		setDialogSelectedAgents((prev) =>
			prev.includes(agentId)
				? prev.filter((id) => id !== agentId)
				: [...prev, agentId],
		);
	};

	const handleTagToggle = (tagId: number) => {
		setDialogSelectedTags((prev) =>
			prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId],
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

		// Apply tags from dialog to actual state
		setSelectedTags(dialogSelectedTags);

		// Apply agents from dialog to actual state
		setSelectedAgents(dialogSelectedAgents);

		// If agents selected, apply the first one as selectedAgent
		if (dialogSelectedAgents.length > 0) {
			setAgentSelected(dialogSelectedAgents[0]);
			setCookie('whatsappSelectedAgentId', String(dialogSelectedAgents[0]));
		} else {
			setAgentSelected(0);
			setCookie('whatsappSelectedAgentId', '0');
		}

		// AND logic: send agents and tags separately
		fetchMoreContacts(
			searchText,
			filterBySelected,
			true,
			contactsPaginationSetting?.PageSize || 10,
			1,
			false,
			dialogStartDate,
			dialogEndDate,
			dialogSelectedAgents,
			dialogSelectedTags,
			dialogStartTime,
			dialogEndTime,
		);
	};

	const handleSetDateRange = (period: string) => {
		// Toggle: if clicking same period again, clear the date filter
		if (dialogTimePeriod === period) {
			setDialogTimePeriod('');
			setDialogStartDate('');
			setDialogEndDate('');
			setDialogStartTime('');
			setDialogEndTime('');
			return;
		}

		setDialogTimePeriod(period);
		const today = new Date();
		let start = new Date();
		let end = new Date(today);

		switch (period) {
			case 'last24hours':
				// Last 24 Hours: 12:01 AM 24 hours ago to 11:59 PM today
				start = new Date(today.getTime() - 24 * 60 * 60 * 1000);
				setDialogStartTime('00:01'); // 12:01 AM
				setDialogEndTime('23:59'); // 11:59 PM
				break;
			case 'lastWeek':
				// Last Week: 12:01 AM 7 days ago to 11:59 PM today
				start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
				setDialogStartTime('00:01'); // 12:01 AM
				setDialogEndTime('23:59'); // 11:59 PM
				break;
			case 'lastMonth':
				// Last Month: 12:01 AM 30 days ago to 11:59 PM today
				start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
				setDialogStartTime('00:01'); // 12:01 AM
				setDialogEndTime('23:59'); // 11:59 PM
				break;
			case 'custom':
				// Custom Range: User picks dates, times auto-assigned
				setDialogStartDate('');
				setDialogEndDate('');
				setDialogStartTime('00:01'); // 12:01 AM (default start)
				setDialogEndTime('23:59'); // 11:59 PM (default end)
				return;
			default:
				return null;
		}

		const formatDate = (date: Date) => date.toISOString().split('T')[0];
		setDialogStartDate(formatDate(start));
		setDialogEndDate(formatDate(end));
	};
	const handleQuickDateRangeSelection = (period: string) => {
		setShowDateRangePopup(false);
		if (period === 'custom') {
			setDialogSelectedAgents([...selectedAgents]);
			setDialogSelectedTags([...selectedTags]);
			setShowFilterDialog(true);
			setDialogTimePeriod('custom');
			setDialogStartDate(startDate);
			setDialogEndDate(endDate);
			setDialogStartTime(startTime);
			setDialogEndTime(endTime);
			setTimeout(() => {
				dateRangeRef.current?.scrollIntoView({
					behavior: 'smooth',
					block: 'start',
				});
			}, 100);
		} else {
			const today = new Date();
			let start = new Date();
			let end = new Date(today);

			switch (period) {
				case 'last24hours':
					start = new Date(today.getTime() - 24 * 60 * 60 * 1000);
					break;
				case 'lastWeek':
					start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
					break;
				case 'lastMonth':
					start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
					break;
			}
			const formatDate = (date: Date) => date.toISOString().split('T')[0];
			const newStartDate = formatDate(start);
			const newEndDate = formatDate(end);

			setStartDate(newStartDate);
			setEndDate(newEndDate);
			setStartTime('00:01');
			setEndTime('23:59');
			setTimePeriod(period);

			fetchMoreContacts(
				searchText,
				filterBySelected,
				true,
				contactsPaginationSetting?.PageSize || 10,
				1,
				false,
				newStartDate,
				newEndDate,
				selectedAgents,
				selectedTags,
				'00:01',
				'23:59',
			);
		}
	};
	const handleClickAwayDatePopup = (event: any) => {
		if (
			dateRangeAnchorRef.current &&
			dateRangeAnchorRef.current.contains(event.target)
		) {
			return;
		}
		setShowDateRangePopup(false);
	};
	// Tag editing handlers
	const handleOpenEditTags = () => {
		setEditingTags([...tagsList]);
		setShowEditTagsDialog(true);
	};

	const handleCloseEditTags = () => {
		setShowEditTagsDialog(false);
	};

	const handleUpdateTag = (
		index: number,
		field: 'TagName' | 'TagColor',
		value: string,
	) => {
		const updatedTags = [...editingTags];
		updatedTags[index][field] = value;
		setEditingTags(updatedTags);
	};

	const handleDeleteTag = (index: number) => {
		const tag = editingTags[index];

		// Only delete if it's not a new tag (id !== '0')
		if (tag.id === '0') {
			// New unsaved tag - just remove from editingTags
			setEditingTags(editingTags.filter((_, i) => i !== index));
			return;
		}

		// Show confirmation dialog
		setTagToDelete({ index, tag });
		setShowDeleteTagConfirm(true);
	};

	const confirmDeleteTag = async () => {
		if (!tagToDelete) return;

		const { index, tag } = tagToDelete;

		try {
			setSavingTagId(tag.id);
			setShowDeleteTagConfirm(false);

			const tagId = parseInt(tag.id);
			const response = await PulseemReactInstance.delete(
				`WhatsAppChat/DeleteWhatsAppChatTag?tagId=${tagId}`,
			);

			// Remove from editingTags
			const updatedEditingTags = editingTags.filter((_, i) => i !== index);
			setEditingTags(updatedEditingTags);

			// Remove from tagsList
			const updatedTagsList = tagsList.filter((t) => t.id !== tag.id);
			setTagsList(updatedTagsList);

			setToastMessage({
				message: 'Tag deleted successfully',
				severity: 'success',
			});
			setTimeout(() => setToastMessage(null), 3000);
		} catch (error: any) {
			console.error('Error deleting tag:', error);
			setToastMessage({
				message: error.response?.data?.message || 'Failed to delete tag',
				severity: 'error',
			});
			setTimeout(() => setToastMessage(null), 3000);
		} finally {
			setSavingTagId(null);
			setTagToDelete(null);
		}
	};

	const cancelDeleteTag = () => {
		setShowDeleteTagConfirm(false);
		setTagToDelete(null);
	};

	const handleAddNewTag = () => {
		setEditingTags([
			...editingTags,
			{ id: '0', TagName: '', TagColor: COLORS[0] },
		]);
	};

	// Save tag to backend
	const handleSaveTag = async (index: number) => {
		const tag = editingTags[index];

		// Validation
		if (!tag.TagName || tag.TagName.trim() === '') {
			setToastMessage({
				message: 'Tag name cannot be empty',
				severity: 'error',
			});
			setTimeout(() => setToastMessage(null), 3000);
			return;
		}

		// Check for duplicate tag (same name)
		const isDuplicate = tagsList.some(
			(existingTag) =>
				existingTag.id !== tag.id &&
				existingTag.TagName.toLowerCase() === tag.TagName.toLowerCase(),
		);

		if (isDuplicate) {
			setToastMessage({
				message:
					'A tag with this name already exists. Please use a different name.',
				severity: 'error',
			});
			setTimeout(() => setToastMessage(null), 3000);
			return;
		}

		try {
			setSavingTagId(tag.id);

			const payloadId = tag.id === '0' ? 0 : parseInt(tag.id);

			const response = await PulseemReactInstance.post(
				'WhatsAppChat/ManageWhatsAppChatTag',
				{
					Id: payloadId,
					TagName: tag.TagName,
					TagColor: tag.TagColor,
				},
			);

			if (response.data) {
				// The API returns the ID in the Data field (e.g., {StatusCode: 201, Message: 'Success', Data: 16})
				const returnedId = response.data.Data || response.data.Id;
				const finalId =
					returnedId !== null && returnedId !== undefined
						? String(returnedId)
						: tag.id;
				// Use returned TagColor, or fallback to local tag.TagColor if not provided
				const returnedColor = response.data.TagColor || tag.TagColor;

				// Update the editingTags with the response
				const updatedEditingTags = [...editingTags];
				updatedEditingTags[index] = {
					id: finalId,
					TagName: response.data.TagName || tag.TagName,
					TagColor: returnedColor,
				};
				setEditingTags(updatedEditingTags);

				// Also update the main tagsList
				const existingIndex = tagsList.findIndex((t) => t.id === tag.id);
				const oldColor =
					existingIndex !== -1 ? tagsList[existingIndex].TagColor : null;

				console.log('🔍 Tag update:', {
					tagId: finalId,
					oldColor,
					newColor: returnedColor,
					willUpdate: oldColor !== returnedColor,
				});

				if (existingIndex !== -1) {
					// Update existing tag
					const updatedTagsList = [...tagsList];
					updatedTagsList[existingIndex] = {
						id: finalId,
						TagName: response.data.TagName || tag.TagName,
						TagColor: returnedColor,
					};
					setTagsList([...updatedTagsList]);

					// If color changed, notify parent to update all contacts
					if (oldColor !== returnedColor && onTagColorUpdated) {
						console.log('🔥 Calling onTagColorUpdated');
						onTagColorUpdated(finalId, returnedColor);
					}
				} else {
					// Add new tag
					setTagsList([
						...tagsList,
						{
							id: finalId,
							TagName: response.data.TagName || tag.TagName,
							TagColor: returnedColor,
						},
					]);
				}

				setToastMessage({
					message: 'Tag saved successfully',
					severity: 'success',
				});

				// Clear toast after 3 seconds
				setTimeout(() => setToastMessage(null), 3000);
			}
		} catch (error: any) {
			console.error('Error saving tag:', error);
			setToastMessage({
				message: error.response?.data?.message || 'Failed to save tag',
				severity: 'error',
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
			{
				status: 'whatsappChat.allStatus',
				count: TotalOpen + TotalPending + TotalSolved,
			},
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
		// Always fetch with all filters (tags, agents, dates)
		fetchMoreContacts(
			searchText,
			filterBySelected,
			true,
			contactsPaginationSetting?.PageSize || 10,
			1,
			false,
			startDate,
			endDate,
			selectedAgents,
			selectedTags,
			startTime,
			endTime,
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedAgent, debouncedValue]);

	// Fetch chats when date range changes
	useEffect(() => {
		if (isInitialMount.current) return;
		// Always fetch with all filters (tags, agents, dates)
		fetchMoreContacts(
			searchText,
			filterBySelected,
			true,
			contactsPaginationSetting?.PageSize || 10,
			1,
			false,
			startDate,
			endDate,
			selectedAgents,
			selectedTags,
			startTime,
			endTime,
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [startDate, endDate]);

	// Fetch chats when selectedTags changes (but not on initial mount)
	useEffect(() => {
		if (isInitialMount.current) return;
		// Always fetch with all filters (tags, agents, dates)
		fetchMoreContacts(
			searchText,
			filterBySelected,
			true,
			contactsPaginationSetting?.PageSize || 10,
			1,
			false,
			startDate,
			endDate,
			selectedAgents,
			selectedTags,
			startTime,
			endTime,
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedTags]);

	return (
		<>
			<aside
				className={`${classes.whatsappChat} sidebar ${
					isMobileSideBar && 'mobile-side-bar'
				}`}
			>
				<header
					className={clsx(
						`${classes.whatsappChat} header left`,
						classes.sidebarHeader,
					)}
				>
					<div
						className={`${classes.whatsappChat} sidebar__avatar-wrapper`}
						style={{ flexShrink: 0 }}
					>
						<img
							src={AccountUser}
							alt="Avatar"
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
							title={translator('common.manageAgent')}
						>
							<BsPeopleFill />
						</IconButton>
						<IconButton onClick={() => handleOpenEditTags()} title="Edit Tags">
							<BsFillTagsFill />
						</IconButton>
					</div>
					<div
						className={`${classes.whatsappChat} sidebar__actions`}
						style={{ flexShrink: 0 }}
					>
						<IconButton
							className={classes.whatsappChatBarButton}
							onClick={setIsMobileSideBar}
						>
							<FaBars />
						</IconButton>
					</div>
				</header>
				<div
					className={clsx(`${classes.whatsappChat} tab-wrapper`, classes.dFlex)}
				>
					<Box
						className={clsx(
							`${classes.whatsappChat} tab-container`,
							classes.p5,
						)}
					>
						<Tabs
							className={`${classes.whatsappChat} tabs-main`}
							classes={{ indicator: classes.hideIndicator }}
							value={activeTab}
							onChange={handleFilterByStatus}
							aria-label="status tabs"
						>
							{statusTabs?.map((tab, index) => (
								<Tab
									className={`${classes.whatsappChat} custom-tab`}
									key={`${tab}_${index}`}
									label={
										<Box>
											<h2 className={classes.font16}>
												{translator(tab?.status)}
											</h2>
											<h6 className={classes.font14}>{tab?.count}</h6>
										</Box>
									}
								/>
							))}
						</Tabs>
					</Box>
				</div>
				<div className={classes.searchAreaWrapper}>
					<div
						className={clsx(
							`${classes.whatsappChat} search-wrapper`,
							classes.searchWrapperComplex,
						)}
					>
						<div
							className={clsx(
								`${classes.whatsappChat} search-icons`,
								classes.searchIconsStyle,
							)}
						>
							<Icon
								id="search"
								className={`${classes.whatsappChat} search-icon`}
							/>
							<button
								className={clsx(
									`${classes.whatsappChat} search__back-btn`,
									classes.searchInputHidden,
								)}
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
								}}
							>
								<Icon id="back" />
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
								padding: isRTL ? '0 40px 0 8px' : '0 8px 0 40px',
							}}
						/>
						<div
							className={clsx(
								`${classes.whatsappChat} search-icons-right`,
								classes.searchIconsRight,
							)}
						>
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
								{/* <IconButton
									size='small'
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										// Initialize dialog states from current values
										setDialogSelectedTags([...selectedTags]);
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
								</IconButton> */}
								<IconButton
									ref={dateRangeAnchorRef}
									size="small"
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										setShowDateRangePopup(!showDateRangePopup);
									}}
									onMouseDown={(e) => {
										e.preventDefault();
										e.stopPropagation();
									}}
									disableRipple
									title="Calendar"
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
									size="small"
									title="Filter"
									disableRipple
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										// Initialize dialog states from current values
										setDialogSelectedAgents([...selectedAgents]);
										setDialogSelectedTags([...selectedTags]);
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
				{(getDateChipLabel() ||
					selectedAgents.length > 0 ||
					selectedTags.length > 0) && (
					<Box className={classes.chipsContainer}>
						<Box className={classes.chipsWrapper}>
							{getDateChipLabel() && (
								<Chip
									label={getDateChipLabel()}
									onDelete={handleRemoveDateFilter}
									size="small"
									className={classes.filterChip}
								/>
							)}
							{getSelectedAgentsDetails().map((agent: any) => (
								<Chip
									key={agent.id}
									label={agent.name}
									onDelete={() => handleRemoveAgentFilter(agent.id)}
									size="small"
									className={classes.agentChip}
								/>
							))}
							{getSelectedTagsDetails().map((tag: any) => (
								<Chip
									key={tag.id}
									label={tag.name}
									onDelete={() => handleRemoveTagFilter(tag.id)}
									size="small"
									style={{
										backgroundColor: tag.color || '#e8e8e8',
										color: '#fff',
										fontWeight: '500',
										margin: '2px',
									}}
								/>
							))}
						</Box>
						<IconButton
							size="small"
							onClick={handleClearAllFilters}
							title={translator('common.clearAllFilters')}
							style={{ padding: '4px' }}
						>
							<FaTrash style={{ fontSize: '14px', color: '#666' }} />
						</IconButton>
					</Box>
				)}
				{showFilterDropdown && (
					<Box
						style={{
							padding: '10px',
							backgroundColor: '#f5f5f5',
							paddingTop: 3,
						}}
					>
						<Box
							style={{
								display: 'flex',
								gap: '12px',
								flexDirection: isRTL ? 'row-reverse' : 'row',
								alignItems: 'flex-end',
							}}
						>
							<Box style={{ flex: 1 }}>
								<Select
									autoWidth
									defaultValue="0"
									value={`${selectedAgent}`}
									variant="standard"
									style={{
										fontSize: '13px',
										backgroundColor: '#fff',
										padding: '8px 10px',
										borderRadius: '4px',
										height: '32px',
									}}
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
									<MenuItem value={0}>
										{translator('whatsappChat.selectAgent')}
									</MenuItem>
									{agentList?.map((agent: WhatsappAgent) => {
										return (
											<MenuItem key={agent.AgentId} value={agent.AgentId}>
												{agent.Name}
											</MenuItem>
										);
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
						fetchMoreContacts(
							searchText,
							filterBySelected,
							false,
							contactsPaginationSetting?.PageSize || 10,
							undefined,
							false,
							startDate,
							endDate,
							selectedAgents,
							selectedTags,
							startTime,
							endTime,
						)
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
							endDate,
							selectedAgents,
							selectedTags,
							startTime,
							endTime,
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
							endDate,
							selectedAgents,
							selectedTags,
							startTime,
							endTime,
						);
					}}
					style={{
						borderTop: '1px solid #e0e0e0',
						backgroundColor: '#f9f9f9',
						paddingInline: 10,
						paddingTop: 0,
						paddingBottom: 0,
					}}
				/>
			</aside>
			{/* Filter Dialog */}
			{/* Small Date Range Popup */}
			<Popper
				open={showDateRangePopup}
				anchorEl={dateRangeAnchorRef.current}
				placement="bottom-end"
				transition
				style={{ zIndex: 1300 }}
			>
				{({ TransitionProps }) => (
					<ClickAwayListener onClickAway={handleClickAwayDatePopup}>
						<Paper
							elevation={8}
							style={{
								marginTop: '8px',
								borderRadius: '8px',
								overflow: 'hidden',
								minWidth: '200px',
								boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
							}}
						>
							<MenuList style={{ padding: '8px 0' }}>
								<MenuItem
									onClick={() => handleQuickDateRangeSelection('last24hours')}
									style={{
										padding: '12px 20px',
										fontSize: '14px',
										color: timePeriod === 'last24hours' ? '#FF3343' : '#333',
										fontWeight: timePeriod === 'last24hours' ? '600' : '400',
										backgroundColor:
											timePeriod === 'last24hours' ? '#fff5f7' : 'transparent',
									}}
								>
									{translator('whatsappChat.last24hours')}
								</MenuItem>
								<MenuItem
									onClick={() => handleQuickDateRangeSelection('lastWeek')}
									style={{
										padding: '12px 20px',
										fontSize: '14px',
										color: timePeriod === 'lastWeek' ? '#FF3343' : '#333',
										fontWeight: timePeriod === 'lastWeek' ? '600' : '400',
										backgroundColor:
											timePeriod === 'lastWeek' ? '#fff5f7' : 'transparent',
									}}
								>
									{translator('whatsappChat.lastWeek')}
								</MenuItem>
								<MenuItem
									onClick={() => handleQuickDateRangeSelection('lastMonth')}
									style={{
										padding: '12px 20px',
										fontSize: '14px',
										color: timePeriod === 'lastMonth' ? '#FF3343' : '#333',
										fontWeight: timePeriod === 'lastMonth' ? '600' : '400',
										backgroundColor:
											timePeriod === 'lastMonth' ? '#fff5f7' : 'transparent',
									}}
								>
									{translator('whatsappChat.lastMonth')}
								</MenuItem>
								<MenuItem
									onClick={() => handleQuickDateRangeSelection('custom')}
									style={{
										padding: '12px 20px',
										fontSize: '14px',
										color: timePeriod === 'custom' ? '#FF3343' : '#333',
										fontWeight: timePeriod === 'custom' ? '600' : '400',
										backgroundColor:
											timePeriod === 'custom' ? '#fff5f7' : 'transparent',
										borderTop: '1px solid #f0f0f0',
										marginTop: '4px',
									}}
								>
									{translator('whatsappChat.customRange')}
								</MenuItem>
							</MenuList>
						</Paper>
					</ClickAwayListener>
				)}
			</Popper>
			<Dialog
				open={showFilterDialog}
				onClose={() => setShowFilterDialog(false)}
				maxWidth="sm"
				fullWidth
				PaperProps={{
					style: {
						borderRadius: '12px',
						direction: isRTL ? 'rtl' : 'ltr',
					},
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
						fontWeight: 'bold',
					}}
				>
					<span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
						<FaFilter /> Filter Chats
					</span>
					<IconButton
						onClick={() => setShowFilterDialog(false)}
						style={{
							color: '#fff',
							padding: '0',
							position: 'absolute',
							[isRTL ? 'left' : 'right']: '25px',
							top: '12px',
						}}
					>
						<BsX fontSize={40} />
					</IconButton>
				</DialogTitle>
				<DialogContent style={{ padding: '20px' }}>
					{/* Agents Section */}
					{agentList && agentList.length > 0 && (
						<Box style={{ marginBottom: '24px' }}>
							<h3
								style={{
									margin: '0 0 12px 0',
									fontSize: '14px',
									fontWeight: '600',
									color: '#333',
								}}
							>
								{translator('whatsappChat.agents')}
							</h3>
							<Box style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
								{agentList?.map((agent: WhatsappAgent) => (
									<Chip
										key={agent.AgentId}
										label={agent.Name}
										onClick={() => handleAgentToggle(agent.AgentId)}
										style={{
											backgroundColor: dialogSelectedAgents.includes(
												agent.AgentId,
											)
												? '#FF3343'
												: '#fff',
											color: dialogSelectedAgents.includes(agent.AgentId)
												? '#fff'
												: '#333',
											border: dialogSelectedAgents.includes(agent.AgentId)
												? 'none'
												: '1px solid #ddd',
											cursor: 'pointer',
										}}
									/>
								))}
							</Box>
						</Box>
					)}
					{/* Tags Section */}
					{tagsList && tagsList.length > 0 && (
						<Box style={{ marginBottom: '24px' }}>
							<Box
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
									marginBottom: '12px',
								}}
							>
								<h3
									style={{
										margin: '0',
										fontSize: '14px',
										fontWeight: '600',
										color: '#333',
									}}
								>
									{translator('common.tags')}
								</h3>
								{/* <Button
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
					</Button> */}
							</Box>
							<Box style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
								{tagsList.map((tag: any) => (
									<Chip
										key={tag?.id}
										label={tag?.TagName}
										onClick={() => handleTagToggle(parseInt(tag.id))}
										style={{
											backgroundColor: tag?.TagColor || '#e8e8e8',
											color: '#fff',
											border: dialogSelectedTags.includes(parseInt(tag.id))
												? '3px solid #000'
												: '3px solid transparent',
											cursor: 'pointer',
											fontWeight: dialogSelectedTags.includes(parseInt(tag.id))
												? '600'
												: '500',
											boxShadow: dialogSelectedTags.includes(parseInt(tag.id))
												? '0 2px 8px rgba(0,0,0,0.3)'
												: 'none',
										}}
									/>
								))}
							</Box>
						</Box>
					)}
					<div ref={dateRangeRef}>
						<Box style={{ marginBottom: '24px' }}>
							<h3
								style={{
									margin: '0 0 12px 0',
									fontSize: '14px',
									fontWeight: '600',
									color: '#333',
								}}
							>
								{translator('whatsappChat.dateTimeRange')}
							</h3>
							<Box style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
								<Chip
									label={translator('whatsappChat.last24hours')}
									onClick={() => handleSetDateRange('last24hours')}
									style={{
										backgroundColor:
											dialogTimePeriod === 'last24hours' ? '#FF3343' : '#fff',
										color: dialogTimePeriod === 'last24hours' ? '#fff' : '#333',
										border:
											dialogTimePeriod === 'last24hours'
												? 'none'
												: '1px solid #ddd',
										cursor: 'pointer',
									}}
								/>
								<Chip
									label={translator('whatsappChat.lastWeek')}
									onClick={() => handleSetDateRange('lastWeek')}
									style={{
										backgroundColor:
											dialogTimePeriod === 'lastWeek' ? '#FF3343' : '#fff',
										color: dialogTimePeriod === 'lastWeek' ? '#fff' : '#333',
										border:
											dialogTimePeriod === 'lastWeek'
												? 'none'
												: '1px solid #ddd',
										cursor: 'pointer',
									}}
								/>
								<Chip
									label={translator('whatsappChat.lastMonth')}
									onClick={() => handleSetDateRange('lastMonth')}
									style={{
										backgroundColor:
											dialogTimePeriod === 'lastMonth' ? '#FF3343' : '#fff',
										color: dialogTimePeriod === 'lastMonth' ? '#fff' : '#333',
										border:
											dialogTimePeriod === 'lastMonth'
												? 'none'
												: '1px solid #ddd',
										cursor: 'pointer',
									}}
								/>
								<Chip
									label={translator('whatsappChat.customRange')}
									onClick={() => handleSetDateRange('custom')}
									style={{
										backgroundColor:
											dialogTimePeriod === 'custom' ? '#FF3343' : '#fff',
										color: dialogTimePeriod === 'custom' ? '#fff' : '#333',
										border:
											dialogTimePeriod === 'custom' ? 'none' : '1px solid #ddd',
										cursor: 'pointer',
									}}
								/>
							</Box>
						</Box>
					</div>
					{/* Custom Date Input Fields (Times auto-assigned: 12:01 AM start, 11:59 PM end) */}
					{dialogTimePeriod === 'custom' && (
						<Box
							style={{
								display: 'flex',
								flexDirection: isRTL ? 'row-reverse' : 'row',
								gap: '12px',
								marginTop: '12px',
							}}
						>
							<TextField
								label={translator('whatsappChat.startDate')}
								type="date"
								value={dialogStartDate}
								onChange={(e) => {
									setDialogStartDate(e.target.value);
									// Auto-assign start time: 12:01 AM
									setDialogStartTime('00:01');
								}}
								InputLabelProps={{ shrink: true }}
								size="small"
								style={{ flex: 1 }}
							/>
							<TextField
								label={translator('whatsappChat.endDate')}
								type="date"
								value={dialogEndDate}
								onChange={(e) => {
									setDialogEndDate(e.target.value);
									// Auto-assign end time: 11:59 PM
									setDialogEndTime('23:59');
								}}
								InputLabelProps={{ shrink: true }}
								size="small"
								style={{ flex: 1 }}
							/>
						</Box>
					)}
				</DialogContent>
				<DialogActions
					style={{
						padding: '16px 20px',
						borderTop: '1px solid #eee',
						flexDirection: isRTL ? 'row-reverse' : 'row',
					}}
				>
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
				maxWidth="sm"
				fullWidth
				PaperProps={{
					style: {
						borderRadius: '16px',
						overflow: 'hidden',
						direction: isRTL ? 'rtl' : 'ltr',
					},
				}}
			>
				<DialogTitle className={classes.editTagsDialogTitle}>
					<Box className={classes.editTagsHeaderContainer}>
						<BsFillTagsFill size={20} className={classes.editTagsIcon} />
						<span className={classes.editTagsHeaderText}>
							{translator('whatsappChat.editTags')}
						</span>
					</Box>
					<IconButton
						onClick={handleCloseEditTags}
						className={classes.editTagsCloseButton}
						style={{
							color: '#fff',
							padding: '0',
							position: 'absolute',
							[isRTL ? 'left' : 'right']: '25px',
							top: '12px',
						}}
					>
						<BsX fontSize={40} />
					</IconButton>
				</DialogTitle>

				<DialogContent className={classes.editTagsDialogContent}>
					{isAdmin ? (
						<>
							{editingTags.map((tag, index) => (
								<Box key={index} className={classes.editTagsItem}>
									<label className={classes.editTagsLabel}>
										{translator('whatsappChat.tagName')}
									</label>
									<Box className={classes.editTagsInputRow}>
										<TextField
											// @ts-ignore
											value={tag.TagName}
											// @ts-ignore
											onChange={(e) =>
												handleUpdateTag(index, 'TagName', e.target.value)
											}
											placeholder={translator('whatsappChat.enterTagName')}
											size="small"
											variant="outlined"
											className={classes.editTagsTextField}
										/>

										<Box className={classes.editTagsButtonsContainer}>
											<Button
												variant="outlined"
												size="small"
												className={clsx(classes.btn, classes.btnRounded)}
												disabled={savingTagId === tag.id}
												// @ts-ignore
												onClick={() => handleSaveTag(index)}
											>
												{tag.id === '0'
													? translator('common.save')
													: translator('common.update')}
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
												onClick={() =>
													handleUpdateTag(index, 'TagColor', color)
												}
												className={clsx(
													classes.editTagsColorCircle,
													tag?.TagColor === color &&
														classes.editTagsColorCircleSelected,
												)}
												style={{
													backgroundColor: color,
												}}
											/>
										))}
									</Box>
								</Box>
							))}

							<Box className={classes.editTagsAddNewTagBox}>
								<Button
									fullWidth
									variant="outlined"
									className={clsx(classes.btn, classes.btnRounded)}
									onClick={handleAddNewTag}
								>
									{translator('whatsappChat.addNewTag')}
								</Button>
							</Box>
						</>
					) : (
						<Typography
							color="textSecondary"
							align="center"
							style={{ margin: '32px 0' }}
						>
							{translator(
								'You do not have permission to manage tags. Please contact your administrator.',
							)}
						</Typography>
					)}
				</DialogContent>
			</Dialog>

			{/* Delete Tag Confirmation Dialog */}
			<DynamicConfirmDialog
				classes={classes}
				isOpen={showDeleteTagConfirm}
				onClose={cancelDeleteTag}
				onCancel={cancelDeleteTag}
				onConfirm={confirmDeleteTag}
				title={translator('whatsappChat.deleteTag')}
				text={translator('whatsappChat.confirmDeleteTag')}
				confirmButtonText=""
			/>

			{/* Toast Notification */}
			{toastMessage && <Toast customData={toastMessage as any} data={null} />}
		</>
	);
};

export default SideBar;
