import Icon from './Icon';
import {
	WhatsappChatSideBarProps,
} from '../Types/WhatsappChat.type';
import AccountUser from '../../../../assets/images/acc-user.jpg';
import { IconButton, MenuItem } from '@material-ui/core';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { FaBars } from 'react-icons/fa';
import { BaseSyntheticEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SideHeaderContactDropDown from './SideHeaderContactDropDown';
import SideBarContactList from './SideBarContactList';
import useDebounce from '../Hook/useDebounce';
import { useSelector } from 'react-redux';
import { coreProps, WhatsappAgent } from '../../Campaign/Types/WhatsappCampaign.types';
import { StateType } from '../../../../Models/StateTypes';
import { setCookie } from '../../../../helpers/Functions/cookies';

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
	setAgentSelected
}: WhatsappChatSideBarProps) => {
	const { t: translator } = useTranslation();
	const { isRTL } = useSelector((state: { core: coreProps }) => state.core);
	const { agentList } = useSelector((state: StateType) => state.whatsapp);
	const [searchText, setSearchText] = useState<string>('');
	const debouncedValue = useDebounce<string>(searchText, 500);

	const handleSearch = (e: BaseSyntheticEvent) => {
		setSearchText(e.target.value.toLowerCase());
	};

	const handleFilter = (e: SelectChangeEvent) => {
		setFilterBySelected(Number(e.target.value));
		fetchMoreContacts(searchText, Number(e.target.value), true);
	};

	const handleAgentSelected = (e: SelectChangeEvent) => {
		setAgentSelected(Number(e.target.value));
		setCookie('whatsappSelectedAgentId', e.target.value);
	};

	const onAddAgentDialog = () => {
		alert('add agent')
		return false;
	}

	useEffect(() => {
		if (selectedAgent && selectedAgent > 0) {
			fetchMoreContacts(searchText, filterBySelected, true);
		}
		else {
			fetchSearchedContacts(searchText, filterBySelected, true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedAgent, debouncedValue]);

	return (
		<>
			<aside
				className={`${classes.whatsappChat} sidebar ${isMobileSideBar && 'mobile-side-bar'
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
							className={classes.whatsappMainChatStatusSelect}
							autoWidth
							defaultValue='0'
							value={`${filterBySelected}`}
							variant='standard'
							style={{ fontSize: '12px' }}
							MenuProps={{
								PaperProps: {
									style: {
										direction: isRTL ? 'rtl' : 'ltr',
									},
								},
							}}
							onChange={(e: SelectChangeEvent) => handleFilter(e)}
						>
							<MenuItem value={0}>{translator('whatsappChat.allStatus')}</MenuItem>
							<MenuItem value={1}>{translator('whatsappChat.open')}</MenuItem>
							<MenuItem value={2}>{translator('whatsappChat.pending')}</MenuItem>
							<MenuItem value={3}>{translator('whatsappChat.solved')}</MenuItem>
						</Select>
					</span>
					<span style={{ marginInlineStart: 10 }}>
						<Select
							className={classes.whatsappMainChatStatusSelect}
							autoWidth
							defaultValue='0'
							value={`${selectedAgent}`}
							variant='standard'
							style={{ fontSize: '12px' }}
							MenuProps={{
								PaperProps: {
									style: {
										direction: isRTL ? 'rtl' : 'ltr',
									},
								},
							}}
							onChange={(e: SelectChangeEvent) => handleAgentSelected(e)}
						>
							<MenuItem value={0}>{translator('whatsappChat.selectAgent')}</MenuItem>
							{agentList?.map((agent: WhatsappAgent) => {
								return <MenuItem value={agent.AgentId}>{agent.Name}</MenuItem>
							})}
							<MenuItem onClick={onAddAgentDialog}>{translator('common.addNew')}</MenuItem>
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
				/>
			</aside>
		</>
	);
};

export default SideBar;
