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
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import 'moment/locale/he';
import clsx from 'clsx';
import { BsSearch } from 'react-icons/bs';
import { MdClear } from 'react-icons/md';
import './Groups.styles.css';
import {
	CampaignGroupsProps,
	selectedFilterCampaignsProps,
	testGroupDataProps,
} from '../../Types/WhatsappCampaign.types';
import { coreProps } from '../../../Editor/Types/WhatsappCreator.types';
import GroupsList from './Component/GroupsList';
import GroupsSelectAll from './Component/GroupsSelectAll';

const CampaignGroups = ({
	classes,
	list,
	selectedList,
	innerHeight,
	showSelectAll,
	callbackSelectedGroups,
	callbackUpdateGroups,
	callbackSelectAll,
	uniqueKey,
}: CampaignGroupsProps) => {
	const { windowSize } = useSelector(
		(state: { core: coreProps }) => state.core
	);
	const { t: translator } = useTranslation();
	const [groupNameSearch, setGroupNameSearch] = useState<string>('');

	const handleSearch = (event: BaseSyntheticEvent) => {
		setGroupNameSearch(event.target.value);
	};
	const resetSearch = (event: BaseSyntheticEvent) => {
		setGroupNameSearch('');
	};
	const onSelectGroup = (group: selectedFilterCampaignsProps) => {
		callbackSelectedGroups(group);
	};

	const onTagChange = (value: selectedFilterCampaignsProps[]) => {
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
			</Grid>
			<Autocomplete
				{...defaultProps}
				multiple
				id='multiple-limit-tags'
				value={selectedList}
				getOptionSelected={(
					option: selectedFilterCampaignsProps,
					value: selectedFilterCampaignsProps
				) => option.Name === value.Name}
				getOptionLabel={(campaign) => campaign.Name}
				defaultValue={[]}
				open={false}
				popupIcon={false}
				onChange={(_e, value: Array<selectedFilterCampaignsProps>) =>
					onTagChange(value)
				}
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
							<>{translator('sms.NoFilteredCampaigns')}</>
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
						list={list?.map((campaign) => {
							return {
								GroupName: campaign?.Name,
								GroupID: campaign?.WACampaignID,
							};
						})}
						groupNameSearch={groupNameSearch}
						selectedList={selectedList}
						onSelectGroup={(group) =>
							onSelectGroup({
								WACampaignID: group?.GroupID,
								Name: group?.GroupName,
							})
						}
						from={'campaign'}
					/>
				</List>
			</div>
		</Box>
	);
};

export default CampaignGroups;
