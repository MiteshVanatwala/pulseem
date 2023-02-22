import Icon from './Icon';
import {
	APIWhatsappChatSidebarContactsItemsData,
	WhatsappChatSideBarProps,
} from '../Types/WhatsappChat.type';
import AccountUser from '../../../../assets/images/acc-user.jpg';
import { IconButton, makeStyles, MenuItem, Select } from '@material-ui/core';
import { FaBars } from 'react-icons/fa';
import { BaseSyntheticEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SideHeaderContactDropDown from './SideHeaderContactDropDown';
import SideBarContactList from './SideBarContactList';
import useDebounce from '../Hook/useDebounce';

const SideBar = ({
	classes,
	isMobileSideBar,
	setIsMobileSideBar,
	handleChatId,
	onActiveUserChange,
	sideChatContacts,
	filteredSideChatContacts,
	setFilteredSideChatContacts,
	phoneNumbersList,
	handleUserStatus,
	getStatusClass,
	activePhoneNumber,
	fetchMoreContacts,
	fetchSearchedContacts,
	contactsPaginationSetting,
}: WhatsappChatSideBarProps) => {
	const [filterBySelected, setFilterBySelected] = useState(0);
	const { t: translator } = useTranslation();
	const [searchText, setSearchText] = useState<string>('');
	const debouncedValue = useDebounce<string>(searchText, 500);

	useEffect(() => {
		fetchSearchedContacts(searchText, true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedValue]);

	const useStyles = makeStyles(() => ({
		selectSection: {
			'&:focus': {
				backgroundColor: 'rgba(0,0,0,0)',
			},
		},
	}));
	const muiclasses = useStyles();

	const handleSearch = (e: BaseSyntheticEvent) => {
		setSearchText(e.target.value.toLowerCase());
	};

	const handleFilter = (e: BaseSyntheticEvent) => {
		let result = [];
		let value = e.target.value;
		setFilterBySelected(e.target.value);

		if (e.target.value === 0) {
			result = sideChatContacts;
		} else {
			result = sideChatContacts.filter(
				(data: APIWhatsappChatSidebarContactsItemsData) => {
					return data.ConversationStatusId === value;
				}
			);
		}
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
					<SideHeaderContactDropDown
						classes={classes}
						phoneNumbersList={phoneNumbersList}
						onActiveUserChange={onActiveUserChange}
						activePhoneNumber={activePhoneNumber}
					/>
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
							<MenuItem value={0}>
								{translator('whatsappChat.allStatus')}
							</MenuItem>
							<MenuItem value={1}>{translator('whatsappChat.open')}</MenuItem>
							<MenuItem value={2}>
								{translator('whatsappChat.pending')}
							</MenuItem>
							<MenuItem value={3}>{translator('whatsappChat.solved')}</MenuItem>
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
					<input
						className={`${classes.whatsappChat} search`}
						placeholder={translator('whatsappChat.searchPlaceholder')}
						onChange={(e) => handleSearch(e)}
						value={searchText}
					/>
				</div>
				<SideBarContactList
					classes={classes}
					filteredSideChatContacts={filteredSideChatContacts}
					handleChatId={handleChatId}
					handleUserStatus={handleUserStatus}
					getStatusClass={getStatusClass}
					fetchMoreContacts={() => fetchMoreContacts(searchText)}
					contactsPaginationSetting={contactsPaginationSetting}
				/>
			</aside>
		</>
	);
};

export default SideBar;
