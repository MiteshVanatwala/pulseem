import Icon from './Icon';
import clsx from 'clsx';
import {
	APIWhatsappChatSidebarContactsItemsData,
	WhatsappChatSideBarProps,
} from '../Types/WhatsappChat.type';
import AccountUser from '../../../../assets/images/acc-user.jpg';
import { Box, Button, IconButton, MenuItem, styled, Tab, Tabs } from '@material-ui/core';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { FaBars } from 'react-icons/fa';
import { BaseSyntheticEvent, useEffect, useRef, useState } from 'react';
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
	setAgentSelected,
	onAddAgent,
	onEditAgents
}: WhatsappChatSideBarProps) => {
	const { t: translator } = useTranslation();
	const { isRTL } = useSelector((state: { core: coreProps }) => state.core);
	const { agentList } = useSelector((state: StateType) => state.whatsapp);
	const [searchText, setSearchText] = useState<string>('');
	const debouncedValue = useDebounce<string>(searchText, 500);
	const sideChatContactsAllRef = useRef<APIWhatsappChatSidebarContactsItemsData[] | null>(null);
	const [activeTab, setActiveTab] = useState(0);
	const sideChatContactsAll = sideChatContactsAllRef.current || []

	if (!sideChatContactsAllRef.current && Array.isArray(sideChatContacts)) {
		sideChatContactsAllRef.current = sideChatContacts
	}

	const handleSearch = (e: BaseSyntheticEvent) => {
		setSearchText(e.target.value.toLowerCase());
	};

	const handleFilterByStatus = (e: React.ChangeEvent<{}>, newValue: any) => {
		setActiveTab(newValue);
		setFilterBySelected(Number(newValue));
		fetchMoreContacts(searchText, Number(newValue), true);
	};

	const handleAgentSelected = (e: SelectChangeEvent) => {
		setAgentSelected(Number(e.target.value));
		setCookie('whatsappSelectedAgentId', e.target.value);
	};

	const statusCount = sideChatContactsAll?.reduce((acc: any, curr: any) => {
		acc[curr?.ConversationStatusId] = (acc[curr?.ConversationStatusId] || 0) + 1;
		return acc;
	}, {});

	const totalStatusCount = sideChatContactsAll?.length ?? 0;

	const statusTabs = [
		{ status: 'whatsappChat.allStatus', count: totalStatusCount },
		{ status: 'whatsappChat.open', count: statusCount?.[1] || 0 },
		{ status: 'whatsappChat.pending', count: statusCount?.[2] || 0 },
		{ status: 'whatsappChat.solved', count: statusCount?.[3] || 0 },
	];

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
					<span style={{ marginInlineStart: 10 }}>
						<div className={classes.agentSelectorContainer}>
							<Select
								className={classes.whatsappAgentSelect}
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
							</Select>
							|
							<Button onClick={(e: BaseSyntheticEvent) => {
								onAddAgent();
							}}>{translator('common.addNew')}</Button>
							|
							<Button onClick={(e: BaseSyntheticEvent) => {
								onEditAgents();
							}}>{translator('common.Edit')}</Button>
						</div>
					</span>
					<div className={`${classes.whatsappChat} sidebar__actions`}>
						<IconButton
							className={classes.whatsappChatBarButton}
							onClick={setIsMobileSideBar}>
							<FaBars />
						</IconButton>
					</div>
				</header>
				<div className={clsx(`${classes.whatsappChat} tab-wrapper`, classes.dFlex)}>
					<Box className={clsx(`${classes.whatsappChat} tab-container`, classes.p5)}>
						<Tabs
							className={`${classes.whatsappChat} tabs-main`}
							classes={{ indicator: classes.hideIndicator }}
							value={activeTab}
							onChange={handleFilterByStatus}
							aria-label="status tabs">
							{statusTabs?.map((tab, index) => (
								<Tab
									className={`${classes.whatsappChat} custom-tab`}
									key={`${tab}_${index}`}
									label={
										<Box>
											<h2 className={classes.font16}>{translator(tab?.status)}</h2>
											<h6 className={classes.font14}>{tab?.count}</h6>
										</Box>
									} 
								/>
							))}
						</Tabs>
					</Box>
				</div>
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
