import { Link } from 'react-router-dom';
import Icon from './Icon';
import { contacts, lastMessage } from './data';
// import { contacts, lastMessage } from './Contacts.json';
import { WhatsappChatSideBarProps } from '../Types/WhatsappChat.type';
import AccountUser from '../../../../assets/images/acc-user.jpg';
import { IconButton, makeStyles, MenuItem, Select } from '@material-ui/core';
import { FaBars } from 'react-icons/fa';
import { BaseSyntheticEvent, useState } from 'react';

const SideBar = ({
	classes,
	isMobileSideBar,
	setIsMobileSideBar,
	handleChatId,
}: WhatsappChatSideBarProps) => {
	const useStyles = makeStyles(() => ({
		selectRoot: {
			fontSize: '18px',
			'&:focus': {
				backgroundColor: 'rgba(0,0,0,0)',
			},
		},
	}));
	const muiclasses = useStyles();
	const [activeUser, setActiveUser] = useState<string>('8123591159');
	const formatTime = (timeString: string) => {
		let splitTimeString = timeString.split(':');
		return `${splitTimeString[0]}:${splitTimeString[1]}`;
	};

	return (
		<>
			<aside
				className={`${classes.whatsappChat} sidebar ${
					isMobileSideBar && 'mobile-side-bar'
				}`}>
				<header className={`${classes.whatsappChat} header left`}>
					<div className={`${classes.whatsappChat} sidebar__avatar-wrapper`}>
						<img
							src={AccountUser}
							alt='Avatar'
							className={`${classes.whatsappChat} avatar`}
						/>
					</div>
					<div className={`${classes.whatsappChat} chat__contact-wrapper`}>
						&emsp;
						<Select
							classes={{ root: muiclasses.selectRoot }}
							autoWidth
							value={activeUser}
							onChange={(e: BaseSyntheticEvent) =>
								setActiveUser(e.target.value)
							}>
							<MenuItem value={8123591159}>8123591159</MenuItem>
							<MenuItem value={6295236652}>6295236652</MenuItem>
							<MenuItem value={1234567890}>1234567890</MenuItem>
						</Select>
					</div>
					<div className={`${classes.whatsappChat} sidebar__actions`}>
						<IconButton
							className={classes.whatsappChatBarButton}
							onClick={setIsMobileSideBar}>
							<FaBars />
						</IconButton>
					</div>
				</header>
				<div className={`${classes.whatsappChat} search-wrapper`}>
					<div className={`${classes.whatsappChat} search-icons`}>
						<Icon
							id='search'
							className={`${classes.whatsappChat} search-icon`}
						/>
						<button className={`${classes.whatsappChat} search__back-btn`}>
							<Icon id='back' />
						</button>
					</div>
					<div className={`${classes.whatsappChat} sidebar__actions`}>
						<IconButton
							className={classes.whatsappChatBarButton}
							onClick={setIsMobileSideBar}>
							<FaBars />
						</IconButton>
					</div>
					<input
						className={`${classes.whatsappChat} search`}
						placeholder='Search or start a new chat'
					/>
				</div>
				<div className={`${classes.whatsappChat} sidebar__contacts`}>
					{contacts.map((contact: any) => (
						<Link
							className={`${classes.whatsappChat} sidebar-contact`}
							to={`/chat/${contact.id}`}
							onClick={(e) => handleChatId(contact.id)}>
							<div
								className={`${classes.whatsappChat} sidebar-contact__avatar-wrapper`}>
								{/* <img
									src={light}
									alt={'profile_picture'}
									className={`${classes.whatsappChat} avatar`}
								/> */}
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
										{contact.name}{' '}
									</h2>
									<span
										className={`${classes.whatsappChat} sidebar-contact__time`}>
										{formatTime(lastMessage.time)}
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
												!!contact.unread
													? `${classes.whatsappChat} sidebar-contact__message--unread`
													: ''
											}`}>
											{contact.typing ? (
												<i> typing...</i>
											) : (
												lastMessage?.content
											)}
										</span>
									</p>
									<div
										className={`${classes.whatsappChat} sidebar-contact__icons`}>
										{contact.pinned && (
											<Icon
												id='pinned'
												className={`${classes.whatsappChat} sidebar-contact__icon`}
											/>
										)}
										{!!contact.unread && (
											<span
												className={`${classes.whatsappChat} sidebar-contact__unread`}>
												{contact.unread}
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
					))}
				</div>
			</aside>
		</>
	);
};

export default SideBar;
