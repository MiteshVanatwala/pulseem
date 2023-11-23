import { BaseSyntheticEvent, useEffect, useState } from 'react';
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
} from '../Types/WhatsappCreator.types';
import clsx from 'clsx';
import { Box, Button, makeStyles, Tooltip } from '@material-ui/core';
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';
import { ClassesType } from '../../../Classes.types';
import { checkLanguage } from '../../Common';
import { authenticationTypes } from '../../Constant';

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
	dynamicFieldCount,
	linkCount,
	templateTextLimit,
	fileData,
	category
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
	const [textAreaHeight, setTextAreaHeight] = useState<string>('auto');
	const [textDirection, setTextDirection] = useState<string>('ltr');

	useEffect(() => {
		const textAreaElement: HTMLElement | null = document.getElementById(
			'conversation-text-preview'
		);
		const buttonsWrapperElement: HTMLElement | null =
			document.getElementById('buttons-wrapper');
		const textAreaHeight = textAreaElement?.scrollHeight || 0;
		const buttonWrapperHeight = buttonsWrapperElement?.scrollHeight || 0;
		const avaliableHeight = 240 - (textAreaHeight + buttonWrapperHeight);
		if (textAreaHeight) {
			if (avaliableHeight >= 25) {
				setTextAreaHeight(25 + textAreaHeight + 'px');
			} else {
				setTextAreaHeight(230 - buttonWrapperHeight + 'px');
			}
		}
	}, [templateText, buttons]);

	useEffect(() => {
		const direction = checkLanguage(templateText, isRTL);
		if (direction !== 'Both') {
			setTextDirection(direction === 'English' ? 'ltr' : 'rtl');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [templateText]);

	const onEditorChange = (e: BaseSyntheticEvent) => {
		if (e.target.value?.length <= templateTextLimit) {
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

	const actionButtons: actionButtonProps[] = [
		{
			tooltipTitle: 'whatsapp.template.callToActionTooltip',
			buttonTitle: 'whatsapp.template.callToAction',
		},
		{
			tooltipTitle: 'whatsapp.template.quickReplayTooltip',
			buttonTitle: 'whatsapp.template.quickReplay',
		},
		// {
		// 	tooltipTitle: 'whatsapp.template.removalLinkTooltip',
		// 	buttonTitle: 'whatsapp.template.removalLink',
		// },
		{
			tooltipTitle: 'whatsapp.template.removalTextTooltip',
			buttonTitle: 'whatsapp.template.removalText',
		},
		{
			tooltipTitle: 'whatsapp.template.dynamicFieldTooltip',
			buttonTitle: 'whatsapp.template.dynamicField',
		},
	];

	const isDisableButton = (buttonTitle: string) => {
		if (buttonTitle?.indexOf('callToAction') > -1 && buttonType === 'quickReply') {
			return true;
		} else if (
			buttonTitle?.indexOf('quickReplay') > -1 &&
			(buttonType === 'callToAction' || fileData?.fileLink?.length > 0)
		) {
			return true;
		} else if (
			buttonTitle?.indexOf('removalText') > -1 &&
			(
				templateText?.toLowerCase().indexOf(translator('whatsapp.replyRemoveToUnsubscribe', { lng: 'en' }).toLowerCase()) > -1
				|| templateText?.toLowerCase().indexOf(translator('whatsapp.replyRemoveToUnsubscribe', { lng: 'he' }).toLowerCase()) > -1
			)
		) {
			return true;
		}
		return false;
	};

	return (
		<>
			<div className={classes.WhatsappTextareaWrapper}>
				<textarea
					disabled={category === authenticationTypes.AUTHENTICATIONEN || category === authenticationTypes.AUTHENTICATIONHEBREW}
					required
					ref={templateTextRef}
					placeholder={translator('whatsapp.template.textareaPlaceholder')}
					maxLength={templateTextLimit}
					id='whatsapp-template-text'
					className={clsx(classes.msgArea, classes.sidebar)}
					style={{
						direction:
							templateText?.length > 0
								? textDirection === 'rtl'
									? 'rtl'
									: 'ltr'
								: isRTL
								? 'rtl'
								: 'ltr',
						height: textAreaHeight,
						minHeight: '81px',
					}}
					onChange={onEditorChange}
					value={templateText}></textarea>

				<Box
					className={classes.whatsappActionButtonsWrapper}
					id='buttons-wrapper'>
					{buttons?.map(
						(button: quickReplyButtonProps | callToActionRowProps) =>
							button?.fields.map(
								(field: quickReplyButtonsFieldProps | callToActionFieldProps) =>
									(field.fieldName === 'whatsapp.websiteButtonText' ||
										field.fieldName === 'whatsapp.phoneButtonText') && (
										<Box
											key={button.id}
											className={classes.whatsappActionButtonsBox}>
											<Button
												className={classes.whatsappActionButtons}
												onClick={() => OnEditorActionButtonClick(button)}>
												{field.value}
											</Button>
											{
												category !== authenticationTypes.AUTHENTICATIONEN && category !== authenticationTypes.AUTHENTICATIONHEBREW && (
													<DeleteOutlinedIcon
														style={{ color: 'red', cursor: 'pointer' }}
														onClick={() => {
															onButtonDelete(button);
														}}
													/>
												)
											}
										</Box>
									)
							)
					)}
				</Box>
			</div>
			<Box className={classes.whatsappSmallInfoDiv}>
				<span className={classes.textInfoWrapper}>
					{dynamicFieldCount}
					<span className={classes.textInfo}>
						<>
							{dynamicFieldCount === 1
								? translator('whatsappCampaign.dfield')
								: translator('whatsappCampaign.dfields')}
						</>
					</span>
				</span>

				<span
					className={clsx(
						classes.textInfoWrapper,
						`${templateText?.length > templateTextLimit && 'limit-exceed'}`
					)}>
					{templateText?.length}/{templateTextLimit}
					<span className={classes.textInfo}>
						<>{translator('mainReport.char')}</>
					</span>
				</span>
			</Box>

			{
				category !== authenticationTypes.AUTHENTICATIONEN && category !== authenticationTypes.AUTHENTICATIONHEBREW && (
					<Box className={classes.whatsappFuncDiv}>
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
				)
			}
		</>
	);
};

export default WhatsappTemplateEditor;
