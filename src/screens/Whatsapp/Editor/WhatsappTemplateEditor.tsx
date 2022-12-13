import { BaseSyntheticEvent, useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
	actionButtonProps,
	callToActionFieldProps,
	callToActionRowProps,
	coreProps,
	quickReplyButtonProps,
	quickReplyButtonsFieldProps,
	WhatsappCreatorProps,
} from './WhatsappCreator.types';
import clsx from 'clsx';
import { Box, Button, makeStyles, Tooltip } from '@material-ui/core';
import FormatAlignLeftIcon from '@material-ui/icons/FormatAlignLeft';
import FormatAlignRightIcon from '@material-ui/icons/FormatAlignRight';
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';
import { ClassesType } from '../../Classes.types';

const WhatsappTemplateEditor = ({
	classes,
	onButtonClick,
	buttons,
	onButtonDelete,
	buttonType,
	setTemplateText,
	templateText,
	templateTextRef,
	OnEditorActionButtonClick,
}: WhatsappCreatorProps & ClassesType) => {
	const { t: translator } = useTranslation();
	const useStyles = makeStyles(() => ({
		customWidth: {
			maxWidth: 200,
			backgroundColor: 'black',
			fontSize: '14px',
			textAlign: 'center',
		},
		noMaxWidth: {
			maxWidth: 'none',
		},
	}));
	const styles = useStyles();
	const { isRTL } = useSelector((state: { core: coreProps }) => state.core);
	const [linkCount, setlinkCount] = useState(0);
	const [messageCount, setMessageCount] = useState(0);
	const [alignment, setAlignment] = useState<string>('right');
	const [textAreaHeight, setTextAreaHeight] = useState<string>('auto');

	useEffect(() => {
		const textAreaElement: HTMLElement | null = document.getElementById(
			'conversation-text-preview'
		);
		const buttonsWrapperElement: HTMLElement | null =
			document.getElementById('buttons-wrapper');
		const textAreaHeight = textAreaElement?.scrollHeight || 0;
		const buttonWrapperHeight = buttonsWrapperElement?.scrollHeight || 0;
		const avaliableHeight = 240 - (textAreaHeight + buttonWrapperHeight);
		console.log('avaliableHeight::', avaliableHeight);
		if (textAreaHeight) {
			if (avaliableHeight >= 25) {
				setTextAreaHeight(25 + textAreaHeight + 'px');
			} else {
				setTextAreaHeight(230 - buttonWrapperHeight + 'px');
			}
		}
	}, [templateText, buttons]);

	useEffect(() => {
		setAlignment(isRTL ? 'right' : 'left');
	}, [isRTL]);

	const onEditorChange = (e: BaseSyntheticEvent) => {
		if (e.target.value?.length <= 1024) {
			// TO STOP RESETTING CURSOR
			const caret = e.target.selectionStart;
			const element = e.target;
			window.requestAnimationFrame(() => {
				element.selectionStart = caret;
				element.selectionEnd = caret;
			});
			setTemplateText(e.target.value);
		}
	};

	const actionButtons = useMemo<actionButtonProps[]>(
		() => [
			{
				tooltipTitle: 'whatsapp.template.callToActionTooltip',
				buttonTitle: 'whatsapp.template.callToAction',
			},
			{
				tooltipTitle: 'whatsapp.template.quickReplayTooltip',
				buttonTitle: 'whatsapp.template.quickReplay',
			},
			{
				tooltipTitle: 'whatsapp.template.removalLinkTooltip',
				buttonTitle: 'whatsapp.template.removalLink',
			},
			{
				tooltipTitle: 'whatsapp.template.removalTextTooltip',
				buttonTitle: 'whatsapp.template.removalText',
			},
			{
				tooltipTitle: 'whatsapp.template.dynamicFieldTooltip',
				buttonTitle: 'whatsapp.template.dynamicField',
			},
		],
		[]
	);

	const isDisableButton = (buttonTitle: string) => {
		if (buttonTitle.includes('callToAction') && buttonType === 'quickReply') {
			return true;
		} else if (
			buttonTitle.includes('quickReplay') &&
			buttonType === 'callToAction'
		) {
			return true;
		} else if (
			buttonTitle.includes('removalText') &&
			templateText.includes('Reply “remove” to unsubscribe')
		) {
			return true;
		}
		return false;
	};

	return (
		<>
			<div className={classes.WhatsappTextareaWrapper}>
				<textarea
					required
					ref={templateTextRef}
					placeholder={translator('whatsapp.template.textareaPlaceholder')}
					maxLength={1024}
					id='whatsapp-template-text'
					className={clsx(classes.msgArea, classes.sidebar)}
					style={{
						textAlign: alignment === 'right' ? 'right' : 'left',
						height: textAreaHeight,
					}}
					onChange={onEditorChange}
					value={templateText}></textarea>

				<Box
					className={classes.whatsappActionButtonsWrapper}
					id='buttons-wrapper'>
					{buttons.map((button: quickReplyButtonProps | callToActionRowProps) =>
						button.fields.map(
							(field: quickReplyButtonsFieldProps | callToActionFieldProps) =>
								field.fieldName === 'Button Text' && (
									<Box
										key={button.id}
										className={classes.whatsappActionButtonsBox}>
										<Button
											className={classes.whatsappActionButtons}
											onClick={() => OnEditorActionButtonClick(button)}>
											{field.value}
										</Button>
										<DeleteOutlinedIcon
											style={{ color: 'red', cursor: 'pointer' }}
											onClick={() => {
												onButtonDelete(button);
											}}
										/>
									</Box>
								)
						)
					)}
				</Box>
			</div>
			<Box className={classes.whatsappSmallInfoDiv}>
				<span className={classes.textInfoWrapper}>
					{linkCount}
					<span className={classes.textInfo}>
						<>
							{linkCount === 1
								? translator('mainReport.link')
								: translator('mainReport.links')}
						</>
					</span>
				</span>

				<span className={classes.textInfoWrapper}>
					{messageCount}
					<span className={classes.textInfo}>
						<>
							{messageCount === 1
								? translator('sms.message')
								: translator('sms.messages')}
						</>
					</span>
				</span>

				<span className={classes.textInfoWrapper}>
					{templateText?.length}/1024
					<span className={classes.textInfo}>
						<>{translator('mainReport.char')}</>
					</span>
				</span>
			</Box>

			<Box className={classes.whatsappFuncDiv}>
				<Box className={isRTL ? classes.emojiHe : classes.emoji}>
					<>
						<Tooltip
							disableFocusListener
							title={<>{translator('mainReport.aligntoRight')}</>}
							classes={{ tooltip: styles.customWidth }}
							placement='top-start'
							arrow>
							{isRTL ? (
								<FormatAlignRightIcon
									style={{ marginInlineEnd: '4px' }}
									onClick={() => {
										setAlignment('right');
									}}
								/>
							) : (
								<FormatAlignLeftIcon
									onClick={() => {
										setAlignment('left');
									}}
								/>
							)}
						</Tooltip>
						<Tooltip
							disableFocusListener
							title={<>{translator('mainReport.alignToLeft')}</>}
							classes={{ tooltip: styles.customWidth }}
							placement='top-start'
							arrow>
							{isRTL ? (
								<FormatAlignLeftIcon
									onClick={() => {
										setAlignment('left');
									}}
								/>
							) : (
								<FormatAlignRightIcon
									style={{ marginInlineEnd: '4px' }}
									onClick={() => {
										setAlignment('right');
									}}
								/>
							)}
						</Tooltip>
					</>
				</Box>

				<Box className={classes.whatsappBaseButtons}>
					{actionButtons.map((button) => (
						<Tooltip
							disableFocusListener
							title={<>{translator(button.tooltipTitle)}</>}
							classes={{ tooltip: styles.customWidth }}
							placement='top'
							arrow
							key={button.buttonTitle}>
							{onButtonClick && (
								<Button
									className={clsx(
										classes.whatsappInfoButtons,
										isDisableButton(button.buttonTitle)
											? classes.disabled
											: null
									)}
									onClick={() => onButtonClick(button)}>
									<>{translator(button.buttonTitle)}</>
								</Button>
							)}
						</Tooltip>
					))}
				</Box>
			</Box>
		</>
	);
};

export default WhatsappTemplateEditor;
