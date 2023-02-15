import {
	Avatar,
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

const GroupsList = ({
	classes,
	list,
	groupNameSearch,
	selectedList,
	onSelectGroup,
}: groupsListProps) => {
	const { t: translator } = useTranslation();
	return list
		.filter((g: testGroupDataProps) => {
			return g.GroupName.toLowerCase().includes(groupNameSearch.toLowerCase());
		})
		.map((group: testGroupDataProps) => {
			const isExist = selectedList
				.map((group: testGroupDataProps) => {
					return group['GroupID'];
				})
				.includes(group['GroupID']);
			return (
				<ListItem
					key={group['GroupID']}
					onClick={() => onSelectGroup(group)}
					className={classes.groupListRow}
					style={{ cursor: 'pointer' }}>
					<ListItemAvatar>
						<Avatar
							className={clsx(
								classes.listIcon,
								classes.transparentBg,
								isExist ? classes.green : classes.blue,
								isExist ? classes.borderGreen : classes.borderBlue
							)}>
							{isExist ? (
								<FaCheck className={clsx(classes.green)} />
							) : (
								<HiUserGroup className={clsx(classes.blue)} />
							)}
						</Avatar>
					</ListItemAvatar>
					<ListItemText
						className={'groupText'}
						title={group.GroupName}
						primary={group.GroupName}
					/>
					<ListItemSecondaryAction className={'groupText'}>
						{group['Recipients']?.toLocaleString()}{' '}
						<>
							{group['Recipients'] !== 1
								? translator('notifications.recipients')
								: translator('notifications.recipient')}
						</>
					</ListItemSecondaryAction>
				</ListItem>
			);
		});
};

export default GroupsList;
