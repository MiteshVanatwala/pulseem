import {
	LinearProgress,
	makeStyles,
	MenuItem,
	Select,
} from '@material-ui/core';
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

const SideBarContactList = ({
	classes,
	filteredSideChatContacts,
	handleChatId,
	handleUserStatus,
	getStatusClass,
	fetchMoreContacts,
	contactsPaginationSetting,
}: SideBarContactListProps) => {
	const { t: translator } = useTranslation();
	const { contactID } = useParams();

	const useStyles = makeStyles(() => ({
		selectSection: {
			'&:focus': {
				backgroundColor: 'rgba(0,0,0,0)',
			},
		},
	}));
	const muiclasses = useStyles();

	const formatTime = (timeString: string) => {
		let splitTimeString = timeString.split(':');
		return `${splitTimeString[0]}:${splitTimeString[1]}`;
	};

	return (
		<>
			<div
				id='contact-list-div'
				className={`${classes.whatsappChat} sidebar__contacts`}>
				<InfiniteScroll
					dataLength={filteredSideChatContacts?.length}
					next={fetchMoreContacts}
					hasMore={contactsPaginationSetting?.hasMore}
					loader={<LinearProgress />}
					scrollableTarget='contact-list-div'>
					{filteredSideChatContacts.map(
						(contact: APIWhatsappChatSidebarContactsItemsData, i: number) => (
							<Link
								className={clsx(
									`${classes.whatsappChat} sidebar-contact`,
									`${
										contactID &&
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
											<span className={classes.whatsappSidebarStatusPadding}>
												<Select
													classes={{ root: muiclasses.selectSection }}
													className={clsx(
														classes.whatsappChatStatusSelect,
														getStatusClass(contact.ConversationStatusId)
													)}
													autoWidth
													value={contact.ConversationStatusId}
													variant='standard'
													style={{ fontSize: '12px' }}
													onChange={(e) =>
														handleUserStatus(e, contact.PhoneNumber)
													}>
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

											{formatTime(
												contact.LastMessageDate.split('T')[1].split('.')[0]
											)}
										</span>
									</div>
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
											<button aria-label='sidebar-contact__btn'>
												<Icon
													id='downArrow'
													className={`${classes.whatsappChat} sidebar-contact__icon sidebar-contact__icon--dropdown`}
												/>
											</button>
										</div>
									</div>
								</div>
							</Link>
						)
					)}
				</InfiniteScroll>
			</div>
		</>
	);
};

export default SideBarContactList;
