import { Link } from 'react-router-dom';
import light from '../../../assets/images/lightbulb.png';
import Icon from './Icon';
import { contacts, lastMessage } from './data';
const SideBar = () => {
	const formatTime = (timeString: string) => {
		let splitTimeString = timeString.split(':');
		return `${splitTimeString[0]}:${splitTimeString[1]}`;
	};

	return (
		<>
			<aside className='sidebar'>
				<header className='header'>
					<div className='sidebar__avatar-wrapper'>
						<img src={light} alt='Karen Okonkwo' className='avatar' />
					</div>
					<div className='sidebar__actions'>
						<button className='sidebar__action' aria-label='Status'>
							<Icon
								id='status'
								className='sidebar__action-icon sidebar__action-icon--status'
							/>
						</button>
						<button className='sidebar__action' aria-label='New chat'>
							<Icon id='chat' className='sidebar__action-icon' />
						</button>
					</div>
				</header>
				<div className='search-wrapper'>
					<div className='search-icons'>
						<Icon id='search' className='search-icon' />
						<button className='search__back-btn'>
							<Icon id='back' />
						</button>
					</div>
					<input className='search' placeholder='Search or start a new chat' />
				</div>
				<div className='sidebar__contacts'>
					{contacts.map((contact: any) => (
						<Link className='sidebar-contact' to={`/chat/${contact.id}`}>
							<div className='sidebar-contact__avatar-wrapper'>
								<img src={light} alt={'profile_picture'} className='avatar' />
							</div>
							<div className='sidebar-contact__content'>
								<div className='sidebar-contact__top-content'>
									<h2 className='sidebar-contact__name'> {contact.name} </h2>
									<span className='sidebar-contact__time'>
										{formatTime(lastMessage.time)}
									</span>
								</div>
								<div className='sidebar-contact__bottom-content'>
									<p className='sidebar-contact__message-wrapper'>
										{lastMessage.status && (
											<Icon
												id={
													lastMessage?.status === 'sent'
														? 'singleTick'
														: 'doubleTick'
												}
												aria-label={lastMessage?.status}
												className={`sidebar-contact__message-icon ${
													lastMessage?.status === 'read'
														? 'sidebar-contact__message-icon--blue'
														: ''
												}`}
											/>
										)}
										<span
											className={`sidebar-contact__message ${
												!!contact.unread
													? 'sidebar-contact__message--unread'
													: ''
											}`}>
											{contact.typing ? (
												<i> typing...</i>
											) : (
												lastMessage?.content
											)}
										</span>
									</p>
									<div className='sidebar-contact__icons'>
										{contact.pinned && (
											<Icon id='pinned' className='sidebar-contact__icon' />
										)}
										{!!contact.unread && (
											<span className='sidebar-contact__unread'>
												{contact.unread}
											</span>
										)}
										<button aria-label='sidebar-contact__btn'>
											<Icon
												id='downArrow'
												className='sidebar-contact__icon sidebar-contact__icon--dropdown'
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
