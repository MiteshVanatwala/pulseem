import {
	LinearProgress,
	MenuItem,
	Menu,
	Chip,
	IconButton,
	Box,
} from '@material-ui/core';
import { AiOutlinePlus } from 'react-icons/ai';
import { MdClose } from 'react-icons/md';
import { FaPhone, FaTag, FaUser } from 'react-icons/fa';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import {
	APIWhatsappChatSidebarContactsItemsData,
	SideBarContactListProps,
} from '../Types/WhatsappChat.type';
import Icon from './Icon';
import { Link, useParams } from 'react-router-dom';
import clsx from 'clsx';
import { lastMessage } from './data';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useTranslation } from 'react-i18next';
import AccountUser from '../../../../assets/images/acc-user.jpg';
import {
	coreProps,
	WhatsappAgent,
} from '../../Campaign/Types/WhatsappCampaign.types';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { StateType } from '../../../../Models/StateTypes';
import { compareLastNineDigits } from '../../../../helpers/Utils/TextHelper';
import { useState, useEffect } from 'react';
import { PulseemReactInstance } from '../../../../helpers/Api/PulseemReactAPI';

const SideBarContactList = ({
	classes,
	ChatContacts,
	handleChatId,
	handleUserStatus,
	getStatusClass,
	fetchMoreContacts,
	contactsPaginationSetting,
	isLoader,
	tagsList = [],
	onTagsUpdated,
	activePhoneNumber,
}: SideBarContactListProps) => {
	const { t: translator } = useTranslation();
	const { contactID } = useParams();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [menuOpen, setMenuOpen] = useState(false);
	const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<string | null>(
		null,
	);
	const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
	const [updatedTags, setUpdatedTags] = useState<{
		[key: string]: Array<{ id: string; TagName: string; TagColor: string }>;
	}>({});
	const [updatedAgents, setUpdatedAgents] = useState<{
		[key: string]: Array<{ AgentID: number; AgentName: string }>;
	}>({});
	const { isRTL } = useSelector((state: { core: coreProps }) => state.core);
	const { agentList } = useSelector((state: StateType) => state.whatsapp);

	useEffect(() => {
		const nextTags: { [key: string]: Array<{ id: string; TagName: string; TagColor: string }> } = {};
		const nextAgents: { [key: string]: Array<{ AgentID: number; AgentName: string }> } = {};

		ChatContacts.forEach((contact) => {
			nextTags[contact.PhoneNumber] = (contact.Tags || []).map((tag: any) => ({
				id: String(tag.id ?? tag.Id ?? ''),
				TagName: tag.TagName,
				TagColor: tag.TagColor,
			}));
			nextAgents[contact.PhoneNumber] = ((contact as any)?.Agents || []).map((agent: any) => ({
				AgentID: agent.AgentID,
				AgentName: agent.AgentName,
			}));
		});

		setUpdatedTags(nextTags);
		setUpdatedAgents(nextAgents);
	}, [ChatContacts]);

	const handleOpenTagMenu = (
		e: React.MouseEvent<HTMLElement>,
		phoneNumber: string,
	) => {
		e.preventDefault();
		e.stopPropagation();
		e.nativeEvent.stopImmediatePropagation();
		const rect = e.currentTarget.getBoundingClientRect();
		const menuWidth = 250;
		const menuHeight = 300;
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;
		const padding = 8;

		let leftPosition = rect.left;
		let topPosition = rect.bottom;
		if (leftPosition + menuWidth > viewportWidth - padding) {
			leftPosition = viewportWidth - menuWidth - padding;
		}
		if (leftPosition < padding) {
			leftPosition = padding;
		}

		if (topPosition + menuHeight > viewportHeight - padding) {
			topPosition = Math.max(padding, rect.top - menuHeight);
		}

		setMenuPosition({
			top: topPosition,
			left: leftPosition
		});
		setAnchorEl(e.currentTarget);
		setSelectedPhoneNumber(phoneNumber);
		setMenuOpen(true);
	};

	const handleCloseTagMenu = () => {
		setMenuOpen(false);
		setTimeout(() => {
			setAnchorEl(null);
			setSelectedPhoneNumber(null);
			setMenuPosition(null);
		}, 200);
	};

	const handleTagChange = async (
		tagId: string,
		isAssigned: boolean,
		phoneNumber?: string,
	) => {
		const targetPhone = phoneNumber || selectedPhoneNumber;
		if (!targetPhone) return;

		const contact = ChatContacts.find((c) => c.PhoneNumber === targetPhone);
		if (!contact) return;

		try {
			// Get current tags - prioritize updatedTags over contact.Tags
			const currentTags = updatedTags[targetPhone] || (contact.Tags || []).map((t: any) => ({
				id: String(t.id ?? t.Id ?? ''),
				TagName: t.TagName,
				TagColor: t.TagColor,
			}));
			const currentTagIds = currentTags
				.map((t) => {
					const id = parseInt(t.id);
					return isNaN(id) ? parseInt(String(t.id).split('_')[0]) : id;
				})
				.filter((id) => !isNaN(id));
			const allTags = tagsList || [];

			let newTagIds: number[] = [];
			let newTags: Array<{ id: string; TagName: string; TagColor: string }> = [];

			if (isAssigned) {
				// Remove tag
				const tagIdToRemove = parseInt(tagId);
				newTags = currentTags.filter((t) => parseInt(t.id) !== tagIdToRemove);
				newTagIds = newTags
					.map((t) => parseInt(t.id))
					.filter((id) => !isNaN(id));
			} else {
				// Add tag - ensure we keep existing tags
				const tagIdNum = parseInt(tagId);
				if (!isNaN(tagIdNum) && !currentTagIds.includes(tagIdNum)) {
					const tagToAdd = allTags.find((t) => t.id === tagId);
					if (tagToAdd) {
						// Keep all existing tags and add the new one
						newTags = [...currentTags, tagToAdd];
						newTagIds = [...currentTagIds, tagIdNum];
					} else {
						console.warn('Tag not found in tagsList:', tagId);
						return;
					}
				} else {
					console.warn('Tag already assigned or invalid ID:', tagId);
					return;
				}
			}

			// Update local state
			setUpdatedTags((prev) => ({
				...prev,
				[targetPhone]: newTags,
			}));

			// Update contact object
			contact.Tags = newTags;

			// Notify parent component
			if (typeof onTagsUpdated === 'function') {
				onTagsUpdated(targetPhone, newTagIds, newTags, activePhoneNumber);
			}

			handleCloseTagMenu();
			// Update backend
			await PulseemReactInstance.put('WhatsAppChat/AssignTagsToChat', {
				Cellphone: targetPhone,
				TagIds: newTagIds,
				Sendernumber: activePhoneNumber,
			});

		} catch (error: any) {
			console.error('Error updating tags:', error);
			const revertTags: { id: string; TagName: string; TagColor: string }[] = (
				contact.Tags || []
			).map((t: any) => ({
				id: String(t.id ?? t.Id ?? ''),
				TagName: t.TagName,
				TagColor: t.TagColor,
			}));
			setUpdatedTags((prev) => ({
				...prev,
				[targetPhone]: revertTags,
			}));
		}
	};

	return (
		<>
			<div
				id="contact-list-div"
				className={`${classes.whatsappChat} sidebar__contacts`}
			>
				<InfiniteScroll
					dataLength={ChatContacts?.length}
					next={fetchMoreContacts}
					hasMore={false}
					loader={<LinearProgress />}
					scrollableTarget="contact-list-div"
				>
					{ChatContacts?.length === 0 && !isLoader ? (
						<div className={classes.noContactDiv}>
							<>{translator('whatsappChat.noContacts')}</>
						</div>
					) : (
						<>
							{ChatContacts.map(
								(
									contact: APIWhatsappChatSidebarContactsItemsData,
									i: number,
								) => (
									<Link
										className={clsx(
											`${classes.whatsappChat} sidebar-contact`,
											`${
												contactID &&
												contact?.PhoneNumber === contactID &&
												'active-contact'
											}`,
										)}
										key={i}
										to={`/react/whatsapp/chat/${contact?.PhoneNumber}`}
										onClick={(e) => handleChatId(e, contact)}
									>
										<div
											className={`${classes.whatsappChat} sidebar-contact__avatar-wrapper`}
										>
											<img
												src={AccountUser}
												alt={'profile_picture'}
												className={`${classes.whatsappChat} avatar`}
											/>
										</div>
										<div
											className={`${classes.whatsappChat} sidebar-contact__content`}
										>
											<div
												className={`${classes.whatsappChat} sidebar-contact__top-content`}
											>
												<h2
													className={`${classes.whatsappChat} sidebar-contact__name`}
												>
													{' '}
													{contact.UserName || contact.PhoneNumber}{' '}
												</h2>
												<span
													className={`${classes.whatsappChat} sidebar-contact__time`}
												>
													<span
														className={classes.whatsappSidebarStatusPadding}
													>
														<Select
															key={contact.PhoneNumber}
															className={clsx(
																classes.whatsappChatStatusSelect,
																getStatusClass(contact.ConversationStatusId),
																classes.f12,
															)}
															MenuProps={{
																PaperProps: {
																	style: {
																		direction: isRTL ? 'rtl' : 'ltr',
																	},
																},
															}}
															autoWidth
															value={`${contact.ConversationStatusId}`}
															variant="standard"
															onChange={(e: SelectChangeEvent) => {
																const changeValue = Number(e.target.value);
																if (isNaN(changeValue) || changeValue < 1 || changeValue > 3) {
																	return;
																}
																handleUserStatus(e, contact.PhoneNumber);
															}}
														>
															<MenuItem value={1}>
																{translator('whatsappChat.open')}
															</MenuItem>
															<MenuItem value={2}>
																{translator('whatsappChat.pending')}
															</MenuItem>
															<MenuItem value={3}>
																{translator('whatsappChat.solved')}
															</MenuItem>
														</Select>
													</span>

													<div className={classes.whatsappDateTime}>
														<div>
															{moment(contact.LastMessageDate).format('HH:mm')}
														</div>
														<div>
															{moment(contact.LastMessageDate).format(
																'DD/MM/YYYY',
															)}
														</div>
													</div>
													<div
														className={clsx(
															classes.justifyContentEnd,
															classes.bold,
														)}
													></div>
												</span>
											</div>

											{/* Tags Section */}
											<Box className={classes.tagAgentWrapper}>
												<Box className={classes.tagsFlexWrapper}>
													{(
														updatedTags[contact.PhoneNumber] ||
														contact.Tags ||
														[]
													).length > 0 && (
															<Box className={classes.tagsScrollArea}>
																{(
																	updatedTags[contact.PhoneNumber] ||
																	contact.Tags ||
																	[]
																).map((tag) => (
																	<Chip
																		key={tag.id}
																		label={tag.TagName}
																		size="small"
																		style={{
																			backgroundColor: tag.TagColor || '#888',
																			color: '#fff',
																			fontWeight: 600,
																			fontSize: '15px',
																			height: '18px',
																			padding: '13px 0px',
																			margin: '0',
																			flexShrink: 0,
																		}}
																		className={classes.tagChipSmall}
																		onClick={(e) => {
																			e.preventDefault();
																			e.stopPropagation();
																			e.nativeEvent.stopImmediatePropagation();
																		}}
																		onDelete={(e) => {
																			e.preventDefault();
																			e.stopPropagation();
																			e.nativeEvent.stopImmediatePropagation();
																			handleTagChange(
																				tag.id, 
																				true, 
																				contact.PhoneNumber,
																			);
																		}}
																	/>
																))}
															</Box>
														)}

													{/* Plus Button - Small Size */}
													<IconButton
														size="small"
														onClick={(e) => {
															e.preventDefault();
															e.stopPropagation();
															handleOpenTagMenu(e, contact.PhoneNumber);
														}}
														className={classes.plusButtonStyle}
													>
														<AiOutlinePlus size={11} />
													</IconButton>
												</Box>

												{/* Agent Name - Pinned to Top-Right, Won't Move */}
												<Box className={classes.agentBoxContainer}>
													{(
														updatedAgents[contact.PhoneNumber]?.length > 0
															? updatedAgents[contact.PhoneNumber]
															: ((contact as any)?.Agents || []).map((agent: any) => ({
																AgentID: agent.AgentID,
																AgentName: agent.AgentName,
															}))
													).map((agent: { AgentID: number; AgentName: string }) => (
														<div
															key={agent.AgentID}
															className={clsx(classes.agentNameContainer, classes.agentNameBlack)}
														>
															{agent.AgentName}
														</div>
													))}
												</Box>
											</Box>

											{/* Tag Menu */}
											<Menu
												id={`tag-menu-${contact.PhoneNumber}`}
												anchorEl={anchorEl}
												open={
													menuOpen && 
													selectedPhoneNumber === contact.PhoneNumber
												}
												onClose={handleCloseTagMenu}
												anchorReference="none"
												disableAutoFocusItem
												disableRestoreFocus
												disableScrollLock
												container={() => document.body}
												transitionDuration={{ enter: 150, exit: 200 }}
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													e.nativeEvent.stopImmediatePropagation();
												}}
												PaperProps={{
													style: {
														maxHeight: '300px',
														width: 'min(250px, calc(100vw - 16px))',
														position: 'fixed',
														zIndex: 9999,
														top: menuPosition?.top || 0,
														left: menuPosition?.left || 0,
														direction: isRTL ? 'rtl' : 'ltr',
														boxSizing: 'border-box',
													},
												}}
											>
												{/* Assigned Tags Section */}
												{(
													updatedTags[contact.PhoneNumber] ||
													contact.Tags ||
													[]
												).length > 0 ? [
													<MenuItem
														key="assigned-header"
														disabled
														style={{ 
															opacity: 0.7, 
															fontWeight: 600,
															textAlign: isRTL ? 'left' : 'left'
														}}
													>
														{translator('whatsappChat.assignedTags')}
													</MenuItem>,
													...(
														updatedTags[contact.PhoneNumber] ||
														contact.Tags ||
														[]
													).map((tag) => (
														<MenuItem
															key={tag.id}
															className={classes.assignedTagMenuItem}
															style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: isRTL ? 'row-reverse' : 'row' }}
															onClick={() => handleCloseTagMenu()}
														>
															<span className={classes.tagNameFlex}>
																{tag.TagName}
															</span>
															<IconButton
																size="small"
																onClick={(e) => {
																	e.stopPropagation();
																	handleTagChange(tag.id, true, contact.PhoneNumber);
																}}
																className={classes.deleteIconButton}
															>
																<MdClose size={16} />
															</IconButton>
														</MenuItem>
													)),
													<div key="divider" className={classes.tagMenuDivider} />
												] : []}

												{/* Available Tags Section */}
												{[
													<MenuItem
														key="available-header"
														disabled
														style={{ 
															opacity: 0.7, 
															fontWeight: 600,
															textAlign: isRTL ? 'left' : 'left'
														}}
													>
														{translator('whatsappChat.addTags')}
													</MenuItem>,
													...tagsList
														.filter(
															(tag: any) =>
																!(
																	updatedTags[contact.PhoneNumber] ||
																	contact.Tags ||
																	[]
																).some((ct) => ct.id === tag.id),
														)
														.map((tag: any) => (
															<MenuItem
																key={tag.id}
																onClick={() => handleTagChange(tag.id, false)}
																className={classes.availableTagMenuItem}
															>
																<span
																	className={classes.tagColorDot}
																	style={{ color: tag.TagColor }}
																>
																	●
																</span>
																<span className={classes.tagNameMargin}>
																	{tag.TagName}
																</span>
															</MenuItem>
														))
												]}
											</Menu>

											<div
												className={`${classes.whatsappChat} sidebar-contact__bottom-content`}
											>
												<p
													className={`${classes.whatsappChat} sidebar-contact__message-wrapper`}
												>
													{lastMessage.status && (
														<Icon
															id={
																lastMessage?.status === 'sent'
																	? 'singleTick'
																	: 'doubleTick'
															}
															aria-label={lastMessage?.status}
															className={`${
																classes.whatsappChat
															} sidebar-contact__message-icon ${
																lastMessage?.status === 'read'
																	? `${classes.whatsappChat} sidebar-contact__message-icon--blue`
																	: ''
															}`}
														/>
													)}
													<span
														className={`${
															classes.whatsappChat
														} sidebar-contact__message ${
															!!contact.Unread
																? `${classes.whatsappChat} sidebar-contact__message--unread`
																: ''
														}`}
													>
														{contact.LastMessage}
													</span>
												</p>
												<div
													className={`${classes.whatsappChat} sidebar-contact__icons`}
												>
													{!!contact.Unread && (
														<span
															className={`${classes.whatsappChat} sidebar-contact__unread`}
														>
															{contact.Unread}
														</span>
													)}
												</div>
											</div>
										</div>
									</Link>
								),
							)}
						</>
					)}
				</InfiniteScroll>
			</div>
		</>
	);
};

export default SideBarContactList;
