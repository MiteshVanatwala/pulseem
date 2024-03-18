import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useSelector } from 'react-redux';
import { coreProps } from '../../model/Core/corePros.types';
import { Button, Grid } from '@material-ui/core';

export type PickerObject = {
	classes: any;
	onConfirm: () => void;
	onCancel: () => void;
};

const ConfirmationButtons = ({ 
	classes, 
	onConfirm,
	onCancel
}: PickerObject) => {
	const { t: translator } = useTranslation();
	const { isRTL } = useSelector(
		(state: { core: coreProps }) => state.core
	);
	return (
		<Grid
			container
			spacing={4}
			className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null)}
		>
			<Grid item>
				<Button
					variant='contained'
					size='small'
					onClick={onConfirm}
					className={clsx(
						classes.btn,
						classes.btnRounded
					)}
				>
					{translator('common.Yes')}
				</Button>
			</Grid>
			<Grid item>
				<Button
					variant='contained'
					size='small'
					onClick={onCancel}
					className={clsx(
						classes.btn,
						classes.btnRounded
					)}
				>
					{translator('common.No')}
				</Button>
			</Grid>
		</Grid>
	);
};

export default ConfirmationButtons;
