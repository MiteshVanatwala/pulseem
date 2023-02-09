import { Link } from 'react-router-dom';
import Icon from './Icon';
import { contacts, lastMessage } from './data';
import {
	APIWhatsappChatSidebarContactsItemsProps,
	APIWhatsappChatSidebarContactsProps,
	WhatsappChatSideBarProps,
} from '../Types/WhatsappChat.type';
import AccountUser from '../../../../assets/images/acc-user.jpg';
import {
	IconButton,
	makeStyles,
	MenuItem,
	Select,
	TextField,
} from '@material-ui/core';
import { FaBars } from 'react-icons/fa';
import { BaseSyntheticEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { phoneNumberAPIProps } from '../../Campaign/Types/WhatsappCampaign.types';
import {
	getWhatsappChatContactsByPhoneNumber,
	userPhoneNumbers,
} from '../../../../redux/reducers/whatsappSlice';
import { useDispatch } from 'react-redux';
import { apiStatus } from '../../Constant';
import moment from 'moment';

const SideBar = ({
	classes,
	isMobileSideBar,
	setIsMobileSideBar,
	handleChatId,
}: WhatsappChatSideBarProps) => {
	const [sideChatContacts, setSideChatContacts] = useState<
		APIWhatsappChatSidebarContactsItemsProps[]
	>([]);
	const [filteredSideChatContacts, setFilteredSideChatContacts] =
		useState<APIWhatsappChatSidebarContactsItemsProps[]>(sideChatContacts);

	const [filterBySelected, setFilterBySelected] = useState(0);
	const { t: translator } = useTranslation();
	const dispatch = useDispatch();

	const useStyles = makeStyles(() => ({
		selectRoot: {
			fontSize: '18px',
			'&:focus': {
				backgroundColor: 'rgba(0,0,0,0)',
			},
		},
		selectSection: {
			'&:focus': {
				backgroundColor: 'rgba(0,0,0,0)',
			},
		},
	}));
	const muiclasses = useStyles();

	const [phoneNumbersList, setPhoneNumbersList] = useState<string[]>([]);
	const [activeUser, setActiveUser] = useState<string>('16067520281');
	const formatTime = (timeString: string) => {
		let splitTimeString = timeString.split(':');
		return `${splitTimeString[0]}:${splitTimeString[1]}`;
	};

	const [userStatus, setUserStatus] = useState<string>('Open');
	const handleUserStatus = (e: BaseSyntheticEvent) => {
		e.preventDefault();
		setUserStatus(e.target.value);
	};
	const getStatusClass = (status: number) => {
		switch (status) {
			case 1:
				return 'open';
			case 2:
				return 'pending';
			case 3:
				return 'solved';

			default:
				break;
		}
	};

	useEffect(() => {
		getPhoneNumber();
	}, []);

	const setAPIWhatsAppChatContacts = async (activeUser: string) => {
		const whatsAppChatContactsData: APIWhatsappChatSidebarContactsProps =
			await dispatch<any>(getWhatsappChatContactsByPhoneNumber(activeUser));
		console.log(whatsAppChatContactsData);
		if (whatsAppChatContactsData.payload.Status === apiStatus.SUCCESS) {
			setSideChatContacts(whatsAppChatContactsData.payload.Data.Items);
			setFilteredSideChatContacts(whatsAppChatContactsData.payload.Data.Items);
		} else {
			setSideChatContacts([]);
			setFilteredSideChatContacts([]);
		}
	};

	const getPhoneNumber = async () => {
		const { payload: phoneNumberData }: phoneNumberAPIProps =
			await dispatch<any>(userPhoneNumbers());
		if (phoneNumberData?.Data?.length > 0) {
			setActiveUser(phoneNumberData?.Data[0]);
			setAPIWhatsAppChatContacts(phoneNumberData?.Data[0]);
		}
		setPhoneNumbersList(phoneNumberData?.Data);
	};

	const onActiveUserChange = (e: BaseSyntheticEvent) => {
		setActiveUser(e.target.value?.replace(/\D/g, ''));
		setAPIWhatsAppChatContacts(e.target.value?.replace(/\D/g, ''));
	};

	const handleSearch = (e: BaseSyntheticEvent) => {
		let value = e.target.value.toLowerCase();
		let result = [];

		result = sideChatContacts.filter(
			(data: APIWhatsappChatSidebarContactsItemsProps) => {
				// return data.PhoneNumber.search(value) != -1;
				return (
					data.UserName?.toLowerCase()?.includes(value) ||
					data.LastMessage?.toLowerCase()?.includes(value) ||
					data.PhoneNumber?.includes(value)
				);
			}
		);
		setFilteredSideChatContacts(result);
	};

	const handleFilter = (e: BaseSyntheticEvent) => {
		let result = [];
		let value = e.target.value;
		if (e.target.value === 0) {
			getPhoneNumber();
			setFilterBySelected(e.target.value);
		} else {
			setFilterBySelected(e.target.value);
		}

		result = sideChatContacts.filter((data) => {
			return data.ConversationStatusId === value;
		});
		setFilteredSideChatContacts(result);
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
						{phoneNumbersList?.length === 1 ? (
							<TextField
								required
								type='text'
								disabled
								className={clsx(classes.buttonField)}
								onChange={(e: BaseSyntheticEvent) => onActiveUserChange(e)}
								value={activeUser}
							/>
						) : (
							<Select
								type='text'
								classes={{ root: muiclasses.selectRoot }}
								onChange={(e: BaseSyntheticEvent) => onActiveUserChange(e)}
								value={activeUser}>
								{phoneNumbersList?.length > 0 ? (
									phoneNumbersList?.map((phone: string, index: number) => (
										<MenuItem key={index} value={phone}>
											{phone}
										</MenuItem>
									))
								) : (
									<MenuItem key={'no-data-template'} disabled>
										<>{translator('whatsapp.noTemplateAaliable')}</>
									</MenuItem>
								)}
							</Select>
						)}
					</div>
					<span>
						<Select
							classes={{ root: muiclasses.selectSection }}
							className={classes.whatsappMainChatStatusSelect}
							autoWidth
							defaultValue={0}
							value={filterBySelected}
							variant='standard'
							style={{ fontSize: '12px' }}
							onChange={(e) => handleFilter(e)}>
							<MenuItem value={0}>All Status</MenuItem>
							<MenuItem value={1}>Open</MenuItem>
							<MenuItem value={2}>Pending</MenuItem>
							<MenuItem value={3}>Solved</MenuItem>
						</Select>
					</span>
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
						placeholder={translator('whatsappChat.searchPlaceholder')}
						onChange={(e) => handleSearch(e)}
					/>
				</div>
				<div className={`${classes.whatsappChat} sidebar__contacts`}>
					{filteredSideChatContacts.map(
						(contact: APIWhatsappChatSidebarContactsItemsProps, i: number) => (
							<Link
								className={`${classes.whatsappChat} sidebar-contact`}
								// to={`/chat/${contact.PhoneNumber}`}
								to={''}
								onClick={(e) =>
									handleChatId(e, contact.PhoneNumber, activeUser)
								}>
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
											<span style={{ paddingRight: '10px' }}>
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
													onChange={(e) => handleUserStatus(e)}>
													<MenuItem value={1}>Open</MenuItem>
													<MenuItem value={2}>Pending</MenuItem>
													<MenuItem value={3}>Solved</MenuItem>
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
				</div>
			</aside>
		</>
	);
};

export default SideBar;
