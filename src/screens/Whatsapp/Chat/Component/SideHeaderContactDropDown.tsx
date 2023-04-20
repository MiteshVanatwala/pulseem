import { makeStyles, MenuItem, Select, TextField } from '@material-ui/core';
import { BaseSyntheticEvent } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { SideHeaderContactDropDownProps } from '../Types/WhatsappChat.type';

const SideHeaderContactDropDown = ({
	classes,
	phoneNumbersList,
	onActiveUserChange,
	activePhoneNumber,
}: SideHeaderContactDropDownProps) => {
	const { t: translator } = useTranslation();

	const useStyles = makeStyles(() => ({
		selectRoot: {
			fontSize: '18px',
			'&:focus': {
				backgroundColor: 'rgba(0,0,0,0)',
			},
		},
	}));
	const muiclasses = useStyles();

	return (
		<>
			<div className={`${classes.whatsappChat} chat__contact-wrapper`}>
				&emsp;
				{phoneNumbersList?.length === 1 ? (
					// <TextField
					// 	required
					// 	type='text'
					// 	disabled
					// 	className={clsx(classes.buttonField)}
					// 	onChange={(e: BaseSyntheticEvent) => onActiveUserChange(e)}
					// 	value={activePhoneNumber}
					// />
					<span>{activePhoneNumber}</span>
				) : (
					<Select
						type='text'
						classes={{ root: muiclasses.selectRoot }}
						onChange={(e: BaseSyntheticEvent) => onActiveUserChange(e)}
						value={activePhoneNumber}>
						{phoneNumbersList?.length > 0 ? (
							phoneNumbersList?.map((phone: string, index: number) => (
								<MenuItem key={index} value={phone}>
									{phone}
								</MenuItem>
							))
						) : (
							<MenuItem key={'no-data-template'} disabled>
								<>{translator('whatsapp.noTemplateAaliable')}</>
							</MenuItem>
						)}
					</Select>
				)}
			</div>
		</>
	);
};

export default SideHeaderContactDropDown;
