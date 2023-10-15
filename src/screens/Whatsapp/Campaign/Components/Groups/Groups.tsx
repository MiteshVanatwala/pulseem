import { BaseSyntheticEvent, useState } from 'react';
import {
	Typography,
	Grid,
	List,
	TextField,
	FormControl,
	Input,
	InputAdornment,
	Box,
	MenuItem,
	Button,
} from '@material-ui/core';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import 'moment/locale/he';
import clsx from 'clsx';
import { BsSearch } from 'react-icons/bs';
import { BiSortDown, BiSortUp } from 'react-icons/bi';
import { MdClear } from 'react-icons/md';
import './Groups.styles.css';
import { BsDot } from 'react-icons/bs';
import { BsFilter } from 'react-icons/bs';
import {
	GroupsProps,
	testGroupDataProps,
} from '../../Types/WhatsappCampaign.types';
import { coreProps } from '../../../Editor/Types/WhatsappCreator.types';
import GroupsList from './Component/GroupsList';
import GroupsSelectAll from './Component/GroupsSelectAll';

const Groups = ({
	classes,
	list,
	isFilterSelected,
	selectedList,
	innerHeight,
	showSortBy,
	showFilter,
	showSelectAll,
	callbackSelectedGroups,
	callbackUpdateGroups,
	callbackSelectAll,
	callbackReciFilter,
	callbackShowTestGroup,
	uniqueKey,
	showTestGroups
}: GroupsProps) => {
	const { windowSize, isRTL } = useSelector(
		(state: { core: coreProps }) => state.core
	);
	const { t: translator } = useTranslation();
	const [groupNameSearch, setGroupNameSearch] = useState<string>('');

	const handleShowTestGroup = () => {
		callbackShowTestGroup(showTestGroups);
	};
	const handleSearch = (event: BaseSyntheticEvent) => {
		setGroupNameSearch(event.target.value);
	};
	const resetSearch = (event: BaseSyntheticEvent) => {
		setGroupNameSearch('');
	};
	const onSelectGroup = (group: testGroupDataProps) => {
		callbackSelectedGroups(group);
	};

	const onTagChange = (value: testGroupDataProps[]) => {
		callbackUpdateGroups(value);
	};

	const defaultProps = {
		options: selectedList,
		getOptionLabel: (group: testGroupDataProps) => {
			if (group) {
				return group.GroupName;
			}
		},
	};

	const onSelectAllGroup = () => {
		callbackSelectAll();
	};

	const groupSortOptions = [
		{
			value: 'Group Name',
			text: translator('notifications.sort_by_group'),
		},
		{
			value: 'Creation Date',
			text: translator('notifications.sort_by_creation'),
		},
		{
			value: 'Update Date',
			text: translator('notifications.sort_by_updated'),
		},
	];

	const [sortBySelected, setSortBy] = useState('Group Name');
	const [sortDirection, setSortDirection] = useState('asc');
	const renderSortItems = () => {
		return groupSortOptions.map((sortBy) => {
			return (
				<MenuItem key={sortBy.value} value={sortBy.value}>
					{sortBy.text}
				</MenuItem>
			);
		});
	};
	const handleSortBySelected = (event: SelectChangeEvent) => {
		setSortBy(event.target.value);
		sortBy(event.target.value, sortDirection);
	};
	const handleSortDirection = () => {
		const selected = sortDirection === 'asc' ? 'desc' : 'asc';
		setSortDirection(selected);
		sortBy(sortBySelected, selected);
	};

	const sortBy = (sortBy: string, direction: string) => {
		if (list) {
			if (sortBy === 'Group Name') {
				direction === 'asc'
					? list.sort((a: testGroupDataProps, b: testGroupDataProps) =>
							a.GroupName.toUpperCase() < b.GroupName.toUpperCase()
								? -1
								: Number(a.GroupName.toUpperCase() > b.GroupName.toUpperCase())
					  )
					: list.sort((a: testGroupDataProps, b: testGroupDataProps) =>
							b.GroupName.toUpperCase() < a.GroupName.toUpperCase()
								? -1
								: Number(b.GroupName.toUpperCase() > a.GroupName.toUpperCase())
					  );
			} else if (sortBy === 'Update Date' && list[0] && list[0].UpdateDate) {
				direction === 'asc'
					? list.sort((a: testGroupDataProps, b: testGroupDataProps) =>
							a.UpdateDate !== null && b.UpdateDate !== null
								? Date.parse(a.UpdateDate) - Date.parse(b.UpdateDate)
								: -1
					  )
					: list.sort((a: testGroupDataProps, b: testGroupDataProps) =>
							a.UpdateDate !== null && b.UpdateDate !== null
								? Date.parse(b.UpdateDate) - Date.parse(a.UpdateDate)
								: -1
					  );
			} else if (sortBy === 'Creation Date') {
				direction === 'asc'
					? list.sort((a: testGroupDataProps, b: testGroupDataProps) =>
							a.CreationDate !== null && b.CreationDate !== null
								? Date.parse(a.CreationDate) - Date.parse(b.CreationDate)
								: -1
					  )
					: list.sort((a: testGroupDataProps, b: testGroupDataProps) =>
							a.CreationDate !== null && b.CreationDate !== null
								? Date.parse(b.CreationDate) - Date.parse(a.CreationDate)
								: -1
					  );
			}
		}
	};

	return (
		<Box className={classes.groupsContainer} key={uniqueKey}>
			{windowSize === 'xs' && (
				<Grid item xs={12}>
					<FormControl className={clsx(classes.margin, classes.searchInput)}>
						<Input
							onChange={handleSearch}
							placeholder={translator('notifications.buttons.search')}
							value={groupNameSearch}
							startAdornment={
								<InputAdornment position='start'>
									<BsSearch />
								</InputAdornment>
							}
							endAdornment={
								groupNameSearch?.length > 0 && (
									<InputAdornment position='start' onClick={resetSearch}>
										<MdClear style={{ cursor: 'pointer' }} />
									</InputAdornment>
								)
							}
						/>
					</FormControl>
				</Grid>
			)}
			<Grid
				item
				xs={12}
				className={clsx(classes.flex, classes.groupFilterRow)}
				style={{ whiteSpace: windowSize !== 'xs' ? 'nowrap' : 'normal' }}>
				{windowSize !== 'xs' && (
					<FormControl className={clsx(classes.margin, classes.searchInput)}>
						<Input
							onChange={handleSearch}
							placeholder={translator('notifications.buttons.search')}
							value={groupNameSearch}
							startAdornment={
								<InputAdornment position='start'>
									<BsSearch />
								</InputAdornment>
							}
							endAdornment={
								groupNameSearch?.length > 0 && (
									<InputAdornment position='start' onClick={resetSearch}>
										<MdClear style={{ cursor: 'pointer' }} />
									</InputAdornment>
								)
							}
						/>
					</FormControl>
				)}
				{showSortBy && (
					<Box className={classes.filterButtonsContainer}>
						{selectedList.length > 0 && showFilter ? (
							<Button
								className={clsx(classes.formControl, classes.whatsappDropDown, classes.mt1)}
								onClick={callbackReciFilter}
								style={{
									height: '36px',
									color: '#ff3343',
									fontWeight: '600',
									textTransform: 'capitalize',
								}}>
								{windowSize !== 'xs' && (
									<BsFilter style={{ fontSize: '22px', color: '#ff3343' }} />
								)}{' '}
								{isFilterSelected ? (
									<BsDot
										style={{
											position: 'absolute',
											left: '8px',
											top: '-6px',
											fontSize: '28px',
										}}
									/>
								) : null}{' '}
								<>{translator('mainReport.recipientFilter')}</>
							</Button>
						) : null}
						<Button
							variant='outlined'
							className={clsx(
								classes.formControl,
								classes.mt1,
								showTestGroups
									? classes.buttonActiveRed
									: classes.twoLineButton
							)}
							onClick={() => handleShowTestGroup()}>
							<>{translator('sms.showTestGroups')}</>
						</Button>
						<FormControl
							className={clsx(classes.whatsappDropDown, classes.mt1)}
						>
							<Select
								variant="standard"
								id='groupOrder'
								value={sortBySelected}
								onChange={handleSortBySelected}
								endAdornment={null}
								className={clsx(classes.paddingSides10)}
								style={{ color: 'inherit', fontSize: '0.875rem', lineHeight: '1.5rem' }}
								MenuProps={{
									PaperProps: {
										style: {
											maxHeight: 300,
											direction: isRTL ? 'rtl' : 'ltr'
										},
									},
								}}
							>
								{renderSortItems()}
							</Select>
						</FormControl>
						<Button
							style={{
								margin:
									selectedList.length > 0 && showFilter && windowSize === 'xs'
										? '5px 0px'
										: '',
							}}
							className={clsx(
								classes.formControl,
								classes.whatsappDropDown,
								classes.controlField,
								classes.mt1
							)}
							onClick={() => {
								handleSortDirection();
							}}>
							{sortDirection === 'asc' ? <BiSortDown /> : <BiSortUp />}
						</Button>
					</Box>
				)}
			</Grid>
			<Autocomplete
				{...defaultProps}
				multiple
				id='multiple-limit-tags'
				value={selectedList}
				getOptionSelected={(
					option: testGroupDataProps,
					value: testGroupDataProps
				) => option.GroupName === value.GroupName}
				getOptionLabel={(group) => group.GroupName}
				defaultValue={[]}
				open={false}
				popupIcon={false}
				onChange={(_e, value: Array<testGroupDataProps>) => onTagChange(value)}
				renderInput={(params) =>
					selectedList.length > 0 ? (
						<TextField
							{...params}
							className={clsx(
								classes.bottomShadow,
								classes.tagSelected,
								classes.sidebar
							)}
							style={{ maxHeight: 45 }}></TextField>
					) : (
						<Typography
							className={clsx(classes.bottomShadow, classes.noSelection)}>
							<>{translator('notifications.noGroupsSelected')}</>
						</Typography>
					)
				}
			/>
			<div
				className={clsx(classes.demo, classes.sidebar)}
				style={{
					maxHeight: innerHeight || 'auto',
					minHeight: innerHeight || 'auto',
					overflow: 'auto',
				}}>
				<List key={uniqueKey}>
					{showSelectAll && (
						<GroupsSelectAll
							classes={classes}
							onSelectAllGroup={onSelectAllGroup}
							allSelected={list.length === selectedList.length}
						/>
					)}
					<GroupsList
						classes={classes}
						list={list}
						groupNameSearch={groupNameSearch}
						selectedList={selectedList}
						onSelectGroup={(group) => onSelectGroup(group)}
						from={'group'}
					/>
				</List>
			</div>
		</Box>
	);
};

export default Groups;
