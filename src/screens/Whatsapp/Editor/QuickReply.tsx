import {
	Button,
	Grid,
	Dialog,
	DialogContent,
	DialogTitle,
	IconButton,
	DialogContentText,
	Typography,
	TextField,
	DialogActions,
} from '@material-ui/core';
import { BaseSyntheticEvent, useState } from 'react';
import uniqid from 'uniqid';
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';
import CloseIcon from '@material-ui/icons/Close';
import {
	coreProps,
	quickReplyButtonProps,
	quickReplyProps,
} from './WhatsappCreator.types';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

const QuickReply = ({
	classes,
	isQuickReplyOpen,
	closeQuickReply,
}: quickReplyProps) => {
	const { t: translator } = useTranslation();
	const onSubmit = () => {};
	const MAX_BUTTON_TEXT_LENGTH = 20;
	const initialQuickButtons = [
		{
			id: uniqid(),
			value: '',
		},
	];
	const { isRTL } = useSelector((state: { core: coreProps }) => state.core);
	const [quickButtons, setQuickButtons] =
		useState<quickReplyButtonProps[]>(initialQuickButtons);
	const addMore = () => {
		const button = {
			id: uniqid(),
			value: '',
		};
		setQuickButtons([...quickButtons, button]);
	};
	const onButtonTextChange = (
		e: BaseSyntheticEvent,
		button: quickReplyButtonProps
	) => {
		if (e.target.value?.length <= 20) {
			const updatedQuickButtons = quickButtons.map((b) =>
				b.id === button.id ? { ...b, value: e.target.value } : b
			);
			setQuickButtons(updatedQuickButtons);
		}
	};
	const onDeleteButton = (button: quickReplyButtonProps) => {
		const updatedQuickButtons = quickButtons.filter((b) => b.id !== button.id);
		setQuickButtons(updatedQuickButtons);
	};
	return (
		<Dialog
			open={isQuickReplyOpen}
			onClose={closeQuickReply}
			aria-labelledby='form-dialog-title'
			fullWidth
			maxWidth='md'
			className={classes.quickReplayDialog}>
			<DialogTitle
				id='form-dialog-title'
				className={classes.quickReplayDialogHeader}>
				{translator('whatsapp.quickReply.title')}
				<IconButton
					aria-label='close'
					onClick={closeQuickReply}
					className={classes.quickReplayDialogClose}>
					<CloseIcon />
				</IconButton>
			</DialogTitle>
			<DialogContent>
				<DialogContentText
					className={classes.quickReplayDialogHeaderDescription}>
					{translator('whatsapp.quickReply.titleDescription')}
				</DialogContentText>
				<form onSubmit={onSubmit}>
					{quickButtons?.map((button) => (
						<Grid
							container
							alignItems='center'
							className={classes.quickReplayButtonGridWrapper}>
							<Grid item key={button.id}>
								<Typography>
									{translator('whatsapp.quickReply.buttonText')}
								</Typography>
								<Grid container className={classes.quickReplayButtonWrapper}>
									<TextField
										className={classes.quickReplaybuttonField}
										name={'quickreply'}
										value={button?.value}
										onChange={(e) => onButtonTextChange(e, button)}
										required
									/>
									<Button
										variant='outlined'
										className={classes.quickReplayValidationCounter}>
										{isRTL ? (
											<>
												{MAX_BUTTON_TEXT_LENGTH}/{button?.value?.length}
											</>
										) : (
											<>
												{button?.value?.length}/{MAX_BUTTON_TEXT_LENGTH}
											</>
										)}
									</Button>
								</Grid>
							</Grid>
							<DeleteOutlinedIcon
								className={classes.quickReplyDelete}
								onClick={() => onDeleteButton(button)}
							/>
						</Grid>
					))}
					<DialogActions>
						<Button
							variant='contained'
							color='primary'
							onClick={addMore}
							disabled={quickButtons?.length >= 3 ? true : false}>
							{translator('whatsapp.quickReply.addMore')}
						</Button>
						<Button
							onClick={closeQuickReply}
							variant='contained'
							color='secondary'>
							{translator('whatsapp.quickReply.exit')}
						</Button>
						<Button
							variant='contained'
							type='submit'
							className={classes.quickReplySave}
							disabled={quickButtons?.length === 0 ? true : false}>
							{translator('whatsapp.quickReply.save')}
						</Button>
					</DialogActions>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default QuickReply;
