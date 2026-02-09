import {
	LinearProgress,
	MenuItem,
	Menu,
	Chip,
	IconButton,
	Box
} from '@material-ui/core';
import { AiOutlinePlus } from 'react-icons/ai';
import { MdClose } from 'react-icons/md';
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
import { coreProps, WhatsappAgent } from '../../Campaign/Types/WhatsappCampaign.types';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { StateType } from '../../../../Models/StateTypes';
import { compareLastNineDigits } from '../../../../helpers/Utils/TextHelper';
import { useState } from 'react';
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
}: SideBarContactListProps) => {
	const { t: translator } = useTranslation();
	const { contactID } = useParams();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<string | null>(null);
	const [updatedTags, setUpdatedTags] = useState<{ [key: string]: Array<{ id: string; TagName: string; TagColor: string }> }>({});
	const { isRTL } = useSelector((state: { core: coreProps }) => state.core);
	const { agentList } = useSelector((state: StateType) => state.whatsapp);

	const handleOpenTagMenu = (e: React.MouseEvent<HTMLElement>, phoneNumber: string) => {
		e.preventDefault();
		e.stopPropagation();
		setAnchorEl(e.currentTarget);
		setSelectedPhoneNumber(phoneNumber);
	};

	const handleCloseTagMenu = () => {
		setAnchorEl(null);
		setSelectedPhoneNumber(null);
	};

	const handleTagChange = async (tagId: string, isAssigned: boolean) => {
		if (!selectedPhoneNumber) return;

		const contact = ChatContacts.find(c => c.PhoneNumber === selectedPhoneNumber);
		if (!contact) return;

		try {
			// Get current tags from state or contact
			const currentTags = updatedTags[selectedPhoneNumber] || contact.Tags || [];
			const currentTagIds = currentTags.map(t => {
				const id = parseInt(t.id);
				return isNaN(id) ? parseInt(String(t.id).split('_')[0]) : id;
			}).filter(id => !isNaN(id));
			const allTags = tagsList || [];
			
			// Add or remove tag
			let newTagIds: number[] = [];
			let newTags: Array<{ id: string; TagName: string; TagColor: string }> = [];
			
			if (isAssigned) {
				// Remove tag
				const tagIdNum = parseInt(tagId);
				newTagIds = currentTagIds.filter(id => id !== tagIdNum);
				newTags = currentTags.filter(t => parseInt(t.id) !== tagIdNum);
			} else {
				// Add tag
				const tagIdNum = parseInt(tagId);
				if (!isNaN(tagIdNum) && !currentTagIds.includes(tagIdNum)) {
					newTagIds = [...currentTagIds, tagIdNum];
					const tagToAdd = allTags.find(t => t.id === tagId);
					if (tagToAdd) {
						newTags = [...currentTags, tagToAdd];
					}
				} else {
					// Tag already exists or invalid ID
					console.warn('Tag already assigned or invalid ID:', tagId);
					return;
				}
			}

			// Call API
			const response = await PulseemReactInstance.put(
				'WhatsAppChat/AssignTagsToChat',
				{
					Cellphone: selectedPhoneNumber,
					TagIds: newTagIds
				}
			);

			console.log('Tags updated:', response.data);

			// Update local state
			if (selectedPhoneNumber) {
				setUpdatedTags(prev => ({
					...prev,
					[selectedPhoneNumber]: newTags
				}));
			}

			// Update contact object as well
			contact.Tags = newTags;

			// Call callback with both tag IDs and tag objects for immediate UI update
			if (onTagsUpdated) {
				onTagsUpdated(selectedPhoneNumber, newTagIds, newTags);
			}

			// Close menu after adding a tag (not when removing)
			if (!isAssigned) {
				handleCloseTagMenu();
			}

		} catch (error: any) {
			console.error('Error updating tags:', error);
		}
	};

	return (
		<>
			<div
				id='contact-list-div'
				className={`${classes.whatsappChat} sidebar__contacts`}>
				<InfiniteScroll
					dataLength={ChatContacts?.length}
					next={fetchMoreContacts}
					hasMore={false}
					loader={<LinearProgress />}
					scrollableTarget='contact-list-div'>
					{ChatContacts?.length === 0 && !isLoader ? (
						<div className={classes.noContactDiv}>
							<>{translator('whatsappChat.noContacts')}</>
						</div>
					) : (
						<>
							{ChatContacts.map(
								(
									contact: APIWhatsappChatSidebarContactsItemsData,
									i: number
								) => (
									<Link
										className={clsx(
											`${classes.whatsappChat} sidebar-contact`,
											`${contactID &&
											contact?.PhoneNumber === contactID &&
											'active-contact'
											}`
										)}
										key={i}
										to={`/react/whatsapp/chat/${contact?.PhoneNumber}`}
										onClick={(e) => handleChatId(e, contact)}>
										<div
											className={`${classes.whatsappChat} sidebar-contact__avatar-wrapper`}>
											<img
												src={AccountUser}
												alt={'profile_picture'}
												className={`${classes.whatsappChat} avatar`}
											/>
										</div>
										<div
											className={`${classes.whatsappChat} sidebar-contact__content`}>
											<div
												className={`${classes.whatsappChat} sidebar-contact__top-content`}>
												<h2
													className={`${classes.whatsappChat} sidebar-contact__name`}>
													{' '}
													{contact.UserName || contact.PhoneNumber}{' '}
												</h2>
												<span
													className={`${classes.whatsappChat} sidebar-contact__time`}>
													<span
														className={classes.whatsappSidebarStatusPadding}>
														<Select
															className={clsx(
																classes.whatsappChatStatusSelect,
																getStatusClass(contact.ConversationStatusId),
																classes.f12
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
															variant='standard'
															onChange={(e: SelectChangeEvent) => handleUserStatus(e, contact.PhoneNumber)}
														>
															<MenuItem value={1}>{translator('whatsappChat.open')}</MenuItem>
															<MenuItem value={2}>{translator('whatsappChat.pending')}</MenuItem>
															<MenuItem value={3}>{translator('whatsappChat.solved')}</MenuItem>
														</Select>
													</span>

													<div className={classes.whatsappDateTime}>
														<div>{moment(contact.LastMessageDate).format('HH:mm')}</div>
														<div>{moment(contact.LastMessageDate).format('DD/MM/YYYY')}</div>
													</div>
													<div className={clsx(classes.justifyContentEnd, classes.bold)}>
													</div>
												</span>
											</div>
											
											{/* Tags Section - Between top and bottom */}
											<Box className={classes.tagAgentWrapper}>
												<Box className={classes.tagsFlexWrapper}>
												{(updatedTags[contact.PhoneNumber] || contact.Tags || []).length > 0 && (
													<>
														{(updatedTags[contact.PhoneNumber] || contact.Tags || []).map((tag) => (
															<Chip
																key={tag.id}
																label={tag.TagName}
																size='small'
																style={{
																	backgroundColor: tag.TagColor,
																	color: '#fff',
																	fontWeight: 600,
																	fontSize: '9px',
																	height: '18px',
																	padding: '0 5px',
																	margin: '0'
																}}															className={classes.tagChipSmall}															/>
														))}
													</>
												)}
												
												{/* Plus Button - Small Size */}
												<IconButton
													size='small'
													onClick={(e) => handleOpenTagMenu(e, contact.PhoneNumber)}
													className={classes.plusButtonStyle}
												>
													<AiOutlinePlus size={11} />
												</IconButton>
												</Box>

												{/* Agent Name - Pinned to Top-Right, Won't Move */}
												<Box className={classes.agentBoxContainer}>
													{agentList
														?.filter((agent: WhatsappAgent) => agent?.Sessions?.some(session => compareLastNineDigits(session.Cellphone, contact?.PhoneNumber)))
														?.map((agent: WhatsappAgent) => <div key={agent.AgentId} className={clsx(classes.agentNameContainer, classes.agentNameBlack)}>{agent.Name}</div>)
													}
												</Box>
											</Box>

											{/* Tag Menu */}
											<Menu
													id={`tag-menu-${contact.PhoneNumber}`}
													anchorEl={anchorEl}
													open={Boolean(anchorEl) && selectedPhoneNumber === contact.PhoneNumber}
													onClose={handleCloseTagMenu}
													PaperProps={{
														style: {
															maxHeight: '300px',
															width: '250px',
														},
													}}
												>
													{/* Assigned Tags Section */}
													{(updatedTags[contact.PhoneNumber] || contact.Tags || []).length > 0 && (
														<>
															<MenuItem disabled style={{ opacity: 0.7, fontWeight: 600 }}>
																{translator('whatsappChat.assignedTags')}
															</MenuItem>
															{(updatedTags[contact.PhoneNumber] || contact.Tags || []).map((tag) => (
																<MenuItem key={tag.id} className={classes.assignedTagMenuItem}>
																	<span className={classes.tagNameFlex}>{tag.TagName}</span>
																	<IconButton
																		size='small'
																		onClick={() => handleTagChange(tag.id, true)}
																		className={classes.deleteIconButton}
																	>
																		<MdClose size={16} />
																	</IconButton>
																</MenuItem>
															))}
															<div className={classes.tagMenuDivider} />
														</>
													)}

													{/* Available Tags Section */}
													<MenuItem disabled style={{ opacity: 0.7, fontWeight: 600 }}>
													{translator('whatsappChat.addTags')}
													</MenuItem>
													{tagsList
														.filter((tag: any) => !(updatedTags[contact.PhoneNumber] || contact.Tags || []).some(ct => ct.id === tag.id))
														.map((tag: any) => (
															<MenuItem
																key={tag.id}
																onClick={() => handleTagChange(tag.id, false)}
																className={classes.availableTagMenuItem}
															>
																<span className={classes.tagColorDot} style={{ color: tag.TagColor }}>●</span>
																<span className={classes.tagNameMargin}>{tag.TagName}</span>
															</MenuItem>
														))}
											</Menu>
											
											<div
												className={`${classes.whatsappChat} sidebar-contact__bottom-content`}>
												<p
													className={`${classes.whatsappChat} sidebar-contact__message-wrapper`}>
													{lastMessage.status && (
														<Icon
															id={
																lastMessage?.status === 'sent'
																	? 'singleTick'
																	: 'doubleTick'
															}
															aria-label={lastMessage?.status}
															className={`${classes.whatsappChat
																} sidebar-contact__message-icon ${lastMessage?.status === 'read'
																	? `${classes.whatsappChat} sidebar-contact__message-icon--blue`
																	: ''
																}`}
														/>
													)}
													<span
														className={`${classes.whatsappChat
															} sidebar-contact__message ${!!contact.Unread
																? `${classes.whatsappChat} sidebar-contact__message--unread`
																: ''
															}`}>
														{contact.LastMessage}
													</span>
												</p>
												<div
													className={`${classes.whatsappChat} sidebar-contact__icons`}>
													{!!contact.Unread && (
														<span
															className={`${classes.whatsappChat} sidebar-contact__unread`}>
															{contact.Unread}
														</span>
													)}
												</div>
											</div>
										</div>
									</Link>
								)
							)}
						</>
					)}
				</InfiniteScroll>
			</div>
		</>
	);
};

export default SideBarContactList;
