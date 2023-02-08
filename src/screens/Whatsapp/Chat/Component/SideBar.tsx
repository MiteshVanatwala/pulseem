import { Link } from 'react-router-dom';
import Icon from './Icon';
import { contacts, lastMessage } from './data';
import { WhatsappChatSideBarProps } from '../Types/WhatsappChat.type';
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
import { getWhatsappChatContactsByPhoneNumber } from '../../../../redux/reducers/whatsappSlice';
import { AsyncThunkAction, AnyAction } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import { apiStatus } from '../../Constant';

const SideBar = ({
	classes,
	isMobileSideBar,
	setIsMobileSideBar,
	handleChatId,
}: WhatsappChatSideBarProps) => {
	const [sideChatContacts, setSideChatContacts] = useState<any>([]);
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
	const getStatusClass = () => {
		switch (userStatus) {
			case 'Open':
				return 'open';
			case 'Pending':
				return 'pending';
			case 'Solved':
				return 'solved';

			default:
				break;
		}
	};

	useEffect(() => {
		getPhoneNumber();
		setAPIWhatsAppChatContacts();
		// (async () => {
		// 	console.log(
		// 		await dispatch(getWhatsappChatContactsByPhoneNumber('16067520281'))
		// 	);
		// })();
	}, []);

	const setAPIWhatsAppChatContacts = async () => {
		const whatsAppChatContactsData: any = await dispatch<any>(
			getWhatsappChatContactsByPhoneNumber('16067520281')
		);
		if (whatsAppChatContactsData.payload.Status === apiStatus.SUCCESS) {
			setSideChatContacts(whatsAppChatContactsData.payload.Data.Items);
		} else {
			setSideChatContacts([]);
		}
	};
	console.log(sideChatContacts);

	const getPhoneNumber = async () => {
		// const { payload: phoneNumberData }: phoneNumberAPIProps =
		// 	await dispatch<any>(userPhoneNumbers());
		const phoneNumberData: phoneNumberAPIProps['payload'] = [
			'91901000001',
			'91901000002',
			'91901000003',
		];
		if (phoneNumberData?.length > 0) {
			setActiveUser(phoneNumberData[0]);
		}
		setPhoneNumbersList(phoneNumberData);
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
								onChange={(e: BaseSyntheticEvent) =>
									setActiveUser(e.target.value?.replace(/\D/g, ''))
								}
								value={activeUser}
							/>
						) : (
							<Select
								type='text'
								classes={{ root: muiclasses.selectRoot }}
								onChange={(e: BaseSyntheticEvent) =>
									setActiveUser(e.target.value?.replace(/\D/g, ''))
								}
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
					/>
				</div>
				<div className={`${classes.whatsappChat} sidebar__contacts`}>
					{sideChatContacts.map((contact: any, i: number) => (
						<Link
							className={`${classes.whatsappChat} sidebar-contact`}
							to={`/chat/${contact.ConversationStatusId}`}
							onClick={(e) => handleChatId(e, contact.ConversationStatusId)}>
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
													getStatusClass()
												)}
												autoWidth
												value={userStatus}
												variant='standard'
												style={{ fontSize: '12px' }}
												onChange={(e) => handleUserStatus(e)}>
												<MenuItem value={'Open'}>Open</MenuItem>
												<MenuItem value={'Pending'}>Pending</MenuItem>
												<MenuItem value={'Solved'}>Solved</MenuItem>
												{/* <MenuItem value={contact.ConversationStatusId}>
													{contact.ConversationStatusId}
												</MenuItem> */}
											</Select>
										</span>
										{/* {formatTime(lastMessage.time)} */}
										{formatTime(contact.LastMessageDate)}
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
												// lastMessage?.content
												contact.LastMessage
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
					))}
				</div>
			</aside>
		</>
	);
};

export default SideBar;
