import clsx from 'clsx';
import { Typography, Button, Box } from '@material-ui/core';
import useRedirect from '../../../../helpers/Routes/Redirect';
import { ManagmentIconProps } from '../Types/Management.types';

export const ManagmentIcon = ({
	classes,
	icon,
	uIcon,
	lable = '',
	disable = false,
	hide = false,
	openNewTab = false,
	href = '',
	remove = false,
	buttonKey,
	onClick,
	rootClass,
	id
}: ManagmentIconProps) => {
	const Redirect = useRedirect();

	if (remove) return null;

	return (
		<Button
			disabled={!!disable || !!hide}
			size='small'
			onClick={() => {
				if (href) {
					Redirect({ url: href, openNewTab: openNewTab });
				} else {
					onClick(buttonKey, id);
				}
			}}
			className={clsx({
				[classes.managmentIconHide]: hide,
			})}>
			<Box
				className={clsx(
					disable && classes.disabledCursor,
					classes.managmentIconContainer,
					rootClass
				)}>
				{!!uIcon ?
					<div>
						{uIcon}
					</div>
					:
					<img
						src={icon}
						alt='Icon'
						className={clsx(classes.managmentIcon, {
							[classes.managmentIconDisable]: disable,
						})}
					/>
				}
				<Typography
					className={clsx(
						classes.managmentIconText,
						disable && classes.colorGray
					)}>
					{lable}
				</Typography>
			</Box>
		</Button>
	);
};

export default ManagmentIcon;
