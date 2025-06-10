import {
	Avatar,
	Box,
	ListItem,
	ListItemAvatar,
	ListItemText,
} from '@material-ui/core';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { FaCheck } from 'react-icons/fa';
import { HiUserGroup } from 'react-icons/hi';
import { GroupsSelectAllProps } from '../../../Types/WhatsappCampaign.types';
import { useSelector } from 'react-redux';

const GroupsSelectAll = ({
	classes,
	onSelectAllGroup,
	allSelected,
}: GroupsSelectAllProps) => {
	const { t: translator } = useTranslation();
	const { isRTL } = useSelector((state: any) => state.core)
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
			<Box dir={ isRTL ? "rtl" : "ltr" } width="100%">
				<ListItemText
					className={clsx('groupText', !isRTL && classes.textLeft)}
					title={translator('notifications.selectAll')}
					//@ts-ignore
					primary={translator('notifications.selectAll')}
				/>
			</Box>
		</ListItem>
	);
};

export default GroupsSelectAll;
