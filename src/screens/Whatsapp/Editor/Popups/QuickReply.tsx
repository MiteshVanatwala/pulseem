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
import { BaseSyntheticEvent, useEffect } from 'react';
import uniqid from 'uniqid';
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';
import CloseIcon from '@material-ui/icons/Close';
import {
	coreProps,
	quickReplyButtonProps,
	quickReplyButtonsFieldProps,
	quickReplyProps,
} from '../Types/WhatsappCreator.types';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

const QuickReply = ({
	classes,
	isQuickReplyOpen,
	closeQuickReply,
	quickReplyButtons,
	setQuickReplyButtons,
	updateTemplateData,
	templateButtons,
	isEditable,
}: quickReplyProps) => {
	const { t: translator } = useTranslation();
	const onSubmit = (e: BaseSyntheticEvent) => {
		e.preventDefault();
		setQuickReplyButtons(quickReplyButtons);
		updateTemplateData(quickReplyButtons);
		closeQuickReply();
	};
	const MAX_BUTTON_TEXT_LENGTH = 20;
	const { isRTL } = useSelector((state: { core: coreProps }) => state.core);
	const button = {
		id: uniqid(),
		typeOfAction: '',
		fields: [
			{
				fieldName: translator('whatsapp.websiteButtonText'),
				type: 'text',
				placeholder: translator('whatsapp.websiteButtonTextPlaceholder'),
				value: '',
			},
		],
	};
	const addMore = () => {
		setQuickReplyButtons([...quickReplyButtons, button]);
	};
	const onButtonTextChange = (
		e: BaseSyntheticEvent,
		changedButton: quickReplyButtonProps,
		changedField: quickReplyButtonsFieldProps
	) => {
		if (e.target.value?.length > MAX_BUTTON_TEXT_LENGTH) return;
		const updatedQuickButtons = quickReplyButtons.map((button) =>
			button.id === changedButton.id
				? {
						...button,
						fields: button.fields.map((field: quickReplyButtonsFieldProps) =>
							field.fieldName === changedField.fieldName
								? { ...field, value: e.target.value }
								: field
						),
				  }
				: button
		);
		setQuickReplyButtons(updatedQuickButtons);
	};
	const onDeleteButton = (changedButton: quickReplyButtonProps) => {
		const updatedQuickButtons = quickReplyButtons.filter(
			(button) => button.id !== changedButton.id
		);
		setQuickReplyButtons(updatedQuickButtons);
	};

	useEffect(() => {
		if (templateButtons?.length <= 0) {
			setQuickReplyButtons([button]);
		} else {
			setQuickReplyButtons(templateButtons);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isQuickReplyOpen]);
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
				<>{translator('whatsapp.quickReply.title')}</>
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
					<>{translator('whatsapp.quickReply.titleDescription')}</>
				</DialogContentText>
				<form onSubmit={onSubmit}>
					{quickReplyButtons?.map((button) => (
						<Grid
							container
							alignItems='center'
							className={classes.quickReplayButtonGridWrapper}
							key={button.id}>
							<Grid item>
								<Typography>
									<>{translator('whatsapp.quickReply.buttonText')}</>
								</Typography>
								<Grid container className={classes.quickReplayButtonWrapper}>
									{button?.fields?.map(
										(field: quickReplyButtonsFieldProps, index: number) => (
											<div key={index}>
												<TextField
													className={classes.quickReplaybuttonField}
													name={'quickreply'}
													value={field?.value}
													onChange={(e) => onButtonTextChange(e, button, field)}
													required
													key={index}
													disabled={!isEditable}
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
											</div>
										)
									)}
								</Grid>
							</Grid>
							{isEditable && (
								<DeleteOutlinedIcon
									className={classes.quickReplyDelete}
									onClick={() => onDeleteButton(button)}
								/>
							)}
						</Grid>
					))}
					<DialogActions>
						<Button
							variant='contained'
							color='primary'
							onClick={addMore}
							disabled={quickReplyButtons?.length >= 3 ? true : false}>
							<>{translator('whatsapp.quickReply.addMore')}</>
						</Button>
						<Button
							onClick={closeQuickReply}
							variant='contained'
							color='secondary'>
							<>{translator('whatsapp.quickReply.exit')}</>
						</Button>
						<Button
							variant='contained'
							type='submit'
							className={classes.quickReplySave}>
							<>{translator('whatsapp.quickReply.save')}</>
						</Button>
					</DialogActions>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default QuickReply;
