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
import { BaseSyntheticEvent } from 'react';
import uniqid from 'uniqid';
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';
import CloseIcon from '@material-ui/icons/Close';
import {
	coreProps,
	quickReplyButtonProps,
	quickReplyButtonsFieldProps,
	quickReplyProps,
} from './WhatsappCreator.types';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

const QuickReply = ({
	classes,
	isQuickReplyOpen,
	closeQuickReply,
	quickReplyButtons,
	setQuickReplyButtons,
	updateTemplateData,
}: quickReplyProps) => {
	const { t: translator } = useTranslation();
	const onSubmit = () => {
		setQuickReplyButtons(quickReplyButtons);
		updateTemplateData(quickReplyButtons);
		closeQuickReply();
	};
	const MAX_BUTTON_TEXT_LENGTH = 20;
	const { isRTL } = useSelector((state: { core: coreProps }) => state.core);
	const addMore = () => {
		const button = {
			id: uniqid(),
			fields: [
				{
					fieldName: translator('whatsapp.websiteButtonText'),
					type: 'text',
					placeholder: translator('whatsapp.websiteButtonTextPlaceholder'),
					value: '',
				},
			],
		};
		setQuickReplyButtons([...quickReplyButtons, button]);
	};
	const onButtonTextChange = (
		e: BaseSyntheticEvent,
		button: quickReplyButtonProps,
		field: quickReplyButtonsFieldProps
	) => {
		if (e.target.value?.length > MAX_BUTTON_TEXT_LENGTH) return;
		const updatedQuickButtons = quickReplyButtons.map((b) =>
			b.id === button.id
				? {
						...b,
						fields: b.fields.map((f: quickReplyButtonsFieldProps) =>
							f.fieldName === field.fieldName
								? { ...f, value: e.target.value }
								: f
						),
				  }
				: b
		);
		setQuickReplyButtons(updatedQuickButtons);
	};
	const onDeleteButton = (button: quickReplyButtonProps) => {
		const updatedQuickButtons = quickReplyButtons.filter(
			(b) => b.id !== button.id
		);
		setQuickReplyButtons(updatedQuickButtons);
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
					{quickReplyButtons?.map((button) => (
						<Grid
							container
							alignItems='center'
							className={classes.quickReplayButtonGridWrapper}>
							<Grid item key={button.id}>
								<Typography>
									{translator('whatsapp.quickReply.buttonText')}
								</Typography>
								<Grid container className={classes.quickReplayButtonWrapper}>
									{button?.fields?.map((field: quickReplyButtonsFieldProps) => (
										<>
											<TextField
												className={classes.quickReplaybuttonField}
												name={'quickreply'}
												value={field?.value}
												onChange={(e) => onButtonTextChange(e, button, field)}
												required
											/>
											<Button
												variant='outlined'
												className={classes.quickReplayValidationCounter}>
												{isRTL ? (
													<>
														{MAX_BUTTON_TEXT_LENGTH}/{field?.value?.length}
													</>
												) : (
													<>
														{field?.value?.length}/{MAX_BUTTON_TEXT_LENGTH}
													</>
												)}
											</Button>
										</>
									))}
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
							disabled={quickReplyButtons?.length >= 3 ? true : false}>
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
							className={classes.quickReplySave}>
							{translator('whatsapp.quickReply.save')}
						</Button>
					</DialogActions>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default QuickReply;
