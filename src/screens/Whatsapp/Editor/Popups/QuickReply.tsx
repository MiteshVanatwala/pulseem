import {
	Button,
	Grid,
	DialogContentText,
	Typography,
	TextField,
	DialogActions,
} from '@material-ui/core';
import clsx from 'clsx';
import { BaseSyntheticEvent, useEffect } from 'react';
import uniqid from 'uniqid';
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';
import {
	coreProps,
	quickReplyButtonProps,
	quickReplyButtonsFieldProps,
	quickReplyProps,
} from '../Types/WhatsappCreator.types';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { AiOutlinePlusCircle } from 'react-icons/ai';

const QuickReply = ({
	classes,
	closeQuickReply,
	quickReplyButtons,
	setQuickReplyButtons,
	updateTemplateData,
	templateButtons,
	isEditable,
	isDeletionAllowed = true,
	canAddMoreButtons = true,
	maxButtonTextLength = 20
}: quickReplyProps) => {
	const { t: translator } = useTranslation();
	const onSubmit = (e: BaseSyntheticEvent) => {
		e.preventDefault();
		setQuickReplyButtons(quickReplyButtons);
		updateTemplateData(quickReplyButtons);
		closeQuickReply();
	};
	const MAX_BUTTON_TEXT_LENGTH = maxButtonTextLength;
	const { isRTL } = useSelector((state: { core: coreProps }) => state.core);
	const button = {
		id: uniqid(),
		typeOfAction: '',
		fields: [
			{
				fieldName: 'whatsapp.websiteButtonText',
				type: 'text',
				placeholder: 'whatsapp.websiteButtonTextPlaceholder',
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
								? { ...field, value: e.target.value?.replace(/_/g, '') }
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
	}, []);

	return (
		<>
			{
				canAddMoreButtons && (
					<DialogContentText
						className={clsx(classes.callToActionDialogHeaderDescription, classes.f16, classes.pb15)}
					>
						{translator('whatsapp.quickReply.titleDescription')}
					</DialogContentText>
				)
			}
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
						{isDeletionAllowed && isEditable && (
							<DeleteOutlinedIcon
								className={classes.quickReplyDelete}
								onClick={() => onDeleteButton(button)}
							/>
						)}
					</Grid>
				))}
				<DialogActions>
					<Grid container>
						<Grid item md={6}>
							{canAddMoreButtons && isEditable && (
								<Button
									variant='contained'
									onClick={addMore}
									disabled={quickReplyButtons?.length >= 10 ? true : false}
									className={clsx(classes.btn, classes.btnRounded)}
								>
									<AiOutlinePlusCircle className={clsx(classes.addOptionsIcon, classes.fBlack)} />
									{translator('whatsapp.quickReply.addMore')}
								</Button>
							)}	
						</Grid>
						<Grid item className={classes.justifyContentEnd} md={6}>
							<Button
								onClick={closeQuickReply}
								variant='contained'
								color='secondary'
								className={clsx(classes.btn, classes.btnRounded, classes.mlr10)}
							>
								{translator('whatsapp.quickReply.exit')}
							</Button>
							{isEditable && (
								<Button
									variant='contained'
									type='submit'
									className={clsx(classes.btn, classes.btnRounded, classes.redButton)}
								>
									{translator('whatsapp.quickReply.save')}
								</Button>
							)}
						</Grid>
					</Grid>
				</DialogActions>
			</form>
		</>
	);
};

export default QuickReply;
