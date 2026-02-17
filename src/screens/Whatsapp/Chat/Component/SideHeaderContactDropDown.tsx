import { MenuItem } from '@material-ui/core';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { SideHeaderContactDropDownProps } from '../Types/WhatsappChat.type';
import { coreProps } from '../../Campaign/Types/WhatsappCampaign.types';
import { useSelector } from 'react-redux';
import Select, { SelectChangeEvent } from '@mui/material/Select';

const SideHeaderContactDropDown = ({
	classes,
	phoneNumbersList,
	onActiveUserChange,
	activePhoneNumber,
}: SideHeaderContactDropDownProps) => {
	const { t: translator } = useTranslation();
	const { isRTL } = useSelector((state: { core: coreProps }) => state.core);

	return (
		<div className={clsx(classes.whatsappChat, 'chat__contact-wrapper', classes.paddingSides10)} style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
			{phoneNumbersList?.length === 1 ? (
				<span>{activePhoneNumber}</span>
			) : (
				<Select
					variant="standard"
					displayEmpty
					value={activePhoneNumber}
					onChange={(event: SelectChangeEvent) => onActiveUserChange(event)}
					MenuProps={{
						PaperProps: {
							style: {
								maxHeight: 300,
								direction: isRTL ? 'rtl' : 'ltr',
							},
						},
					}}
				>
					{phoneNumbersList?.length > 0 ? (
						phoneNumbersList?.map((phone: string, index: number) => <MenuItem key={index} value={phone}>{phone}</MenuItem>)
					) : (
						<MenuItem key={'no-data-template'} disabled>{translator('whatsapp.noTemplateAaliable')}</MenuItem>
					)}
				</Select>
			)}
		</div>
	);
};

export default SideHeaderContactDropDown;
