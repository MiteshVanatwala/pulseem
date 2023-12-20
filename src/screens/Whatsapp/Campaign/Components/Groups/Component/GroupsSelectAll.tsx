import {
	Avatar,
	ListItem,
	ListItemAvatar,
	ListItemText,
} from '@material-ui/core';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { FaCheck } from 'react-icons/fa';
import { HiUserGroup } from 'react-icons/hi';
import { GroupsSelectAllProps } from '../../../Types/WhatsappCampaign.types';

const GroupsSelectAll = ({
	classes,
	onSelectAllGroup,
	allSelected,
}: GroupsSelectAllProps) => {
	const { t: translator } = useTranslation();
	return (
		<ListItem
			className={clsx(classes.groupListRow, 'group-container')}
			key='liSelectAll'
			onClick={() => onSelectAllGroup()}
			style={{ cursor: 'pointer' }}>
			<ListItemAvatar>
				<Avatar
					className={clsx(
						classes.listIcon,
						classes.transparentBg,
						allSelected ? classes.redBg : classes.transparentBg,
						allSelected ? classes.borderRed : classes.borderPrimary
					)}>
					{allSelected ? (
						<FaCheck className={clsx(classes.white)} />
					) : (
						<HiUserGroup className={clsx(classes.colrPrimary)} />
					)}
				</Avatar>
			</ListItemAvatar>
			<ListItemText
				className={'groupText'}
				title={translator('notifications.selectAll')}
				//@ts-ignore
				primary={translator('notifications.selectAll')}
			/>
		</ListItem>
	);
};

export default GroupsSelectAll;
