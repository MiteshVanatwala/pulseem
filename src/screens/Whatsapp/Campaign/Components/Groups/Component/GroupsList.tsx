import {
	Avatar,
	Box,
	ListItem,
	ListItemAvatar,
	ListItemSecondaryAction,
	ListItemText,
} from '@material-ui/core';
import {
	groupsListProps,
	testGroupDataProps,
} from '../../../Types/WhatsappCampaign.types';
import clsx from 'clsx';
import { FaCheck } from 'react-icons/fa';
import { HiUserGroup } from 'react-icons/hi';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

const GroupsList = ({
	classes,
	list,
	groupNameSearch,
	selectedList,
	onSelectGroup,
	from,
}: groupsListProps) => {
	const { t: translator } = useTranslation();
	const { isRTL } = useSelector((state: any) => state.core)
	return list
		.filter((g: testGroupDataProps) => {
			return g.GroupName.toLowerCase().includes(groupNameSearch.toLowerCase());
		})
		.map((group: testGroupDataProps) => {
			const isExist = selectedList
				.map((group: testGroupDataProps) => {
					return group['GroupID'] || group['WACampaignID'];
				})
				.includes(group['GroupID']);
			return (
				<ListItem
					key={group['GroupID']}
					onClick={() => onSelectGroup(group)}
					className={clsx(classes.groupListRow, 'group-container')}
					style={{ cursor: 'pointer' }}
				>
					<ListItemAvatar>
						<Avatar
							className={clsx(classes.listIcon, isExist ? classes.redBg : classes.transparentBg, isExist ? classes.white : classes.blue, isExist ? classes.borderRed : classes.borderPrimary)}>
							{isExist ? (
								<FaCheck className={clsx(classes.white)} />
							) : (
								<HiUserGroup className={clsx(classes.colrPrimary)} />
							)}
						</Avatar>
					</ListItemAvatar>
					<Box dir={ isRTL ? "rtl" : "ltr" } width="100%">
						<ListItemText
							className={clsx('groupText', !isRTL && classes.textLeft)}
							title={group.GroupName}
							primary={group.GroupName}
						/>
					</Box>
					{from === 'group' && (
						<Box dir={ isRTL ? "rtl" : "ltr" } width="100%">
							<Box className={clsx('groupText', classes.itemAvatar, isRTL ? classes.textLeft : classes.textRight)}>
								{group['Recipients']?.toLocaleString()}{' '}
								<>
									{group['Recipients'] !== 1
										? translator('notifications.recipients')
										: translator('notifications.recipient')}
								</>
							</Box>
						</Box>
					)}
				</ListItem>
			);
		});
};

export default GroupsList;
