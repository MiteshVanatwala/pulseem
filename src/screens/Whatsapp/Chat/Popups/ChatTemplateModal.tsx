import { Button, Grid } from '@material-ui/core';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import '../css/ChatTemplate.css';
import { FaChevronRight } from 'react-icons/fa';
import { chatModalProps } from '../Types/WhatsappChat.type';
import {
	buttonsDataProps,
	callToActionFieldProps,
	callToActionProps,
	callToActionRowProps,
	quickReplyButtonProps,
	quickReplyButtonsFieldProps,
	savedTemplateCallToActionProps,
	savedTemplateCardProps,
	savedTemplateListProps,
	savedTemplateMediaProps,
	savedTemplateQuickReplyProps,
	savedTemplateTextProps,
	savedTemplateTypesProps,
} from '../../Editor/Types/WhatsappCreator.types';
import { buttonTypes, templateTypes } from '../../Constant';
import uniqid from 'uniqid';
import { getTemplateName } from '../../Common';

const ChatTemplateModal = ({
	classes,
	onChoose,
	savedTemplateList,
}: chatModalProps) => {
	const theme = useTheme();
	const { t: translator } = useTranslation();
	const setButtonsData = (buttonType: string, data: buttonsDataProps[]) => {
		let buttonData: quickReplyButtonProps[] | callToActionProps = [];
		switch (buttonType) {
			case 'quickReply':
				buttonData = data?.map((button: buttonsDataProps) => {
					return {
						id: uniqid(),
						typeOfAction: '',
						fields: [
							{
								fieldName: 'whatsapp.websiteButtonText',
								type: 'text',
								placeholder: 'whatsapp.websiteButtonTextPlaceholder',
								value: button.title,
							},
						],
					};
				});
				return buttonData ? buttonData : [];
			case 'callToAction':
				buttonData = data?.map((button: buttonsDataProps) => {
					if (button?.type === 'PHONE_NUMBER') {
						return {
							id: uniqid(),
							typeOfAction: 'phonenumber',
							fields: [
								{
									fieldName: 'whatsapp.phoneButtonText',
									type: 'text',
									placeholder: 'whatsapp.phoneButtonTextPlaceholder',
									value: button.title,
								},
								{
									fieldName: 'whatsapp.country',
									type: 'select',
									placeholder: 'Select Your Country Code',
									value: '+972',
								},
								{
									fieldName: 'whatsapp.phoneNumber',
									type: 'tel',
									placeholder: 'whatsapp.phoneNumberPlaceholder',
									value: button.phone,
								},
							],
						};
					} else {
						return {
							id: uniqid(),
							typeOfAction: 'website',
							fields: [
								{
									fieldName: 'whatsapp.websiteButtonText',
									type: 'text',
									placeholder: 'whatsapp.websiteButtonTextPlaceholder',
									value: button.title,
								},
								{
									fieldName: 'whatsapp.websiteURL',
									type: 'text',
									placeholder: 'whatsapp.websiteURLPlaceholder',
									value: button.url,
								},
							],
						};
					}
				});
				return buttonData ? buttonData : [];
		}
	};
	const getTemplateText = (template: savedTemplateListProps) => {
		if (template && template?.Data && template?.Data?.types) {
			if (templateTypes.QUICK_REPLY in template?.Data?.types) {
				const quickReplyData: savedTemplateQuickReplyProps =
					template?.Data?.types[templateTypes.QUICK_REPLY];
				return quickReplyData?.body;
			}
			if (templateTypes.CALL_TO_ACTION in template?.Data?.types) {
				const callToActionData: savedTemplateCallToActionProps =
					template?.Data?.types[templateTypes.CALL_TO_ACTION];
				return callToActionData?.body;
			} else if (templateTypes.CARD in template?.Data?.types) {
				const cardData: savedTemplateCardProps =
					template?.Data?.types[templateTypes.CARD];
				return cardData?.title;
			} else if (templateTypes.MEDIA in template?.Data?.types) {
				const mediaData: savedTemplateMediaProps =
					template?.Data?.types[templateTypes.MEDIA];
				return mediaData?.body;
			} else if (templateTypes.TEXT in template?.Data?.types) {
				const textData: savedTemplateTextProps =
					template?.Data?.types[templateTypes.TEXT];
				return textData?.body;
			}
		}
		return null;
	};
	const getValueByFieldName = (
		button: quickReplyButtonProps | callToActionRowProps,
		fieldName: string
	) => {
		return (
			button.fields.find(
				(field: quickReplyButtonsFieldProps | callToActionFieldProps) => {
					return field.fieldName === fieldName;
				}
			)?.value || ''
		);
	};

	const getButton = (templateData: savedTemplateTypesProps) => {
		let updatedButtonType: string = '';
		let button: quickReplyButtonProps[] | callToActionProps = [];
		if (templateData) {
			if ('quick-reply' in templateData) {
				const quickReplyData: savedTemplateQuickReplyProps =
					templateData?.['quick-reply'];
				updatedButtonType = buttonTypes.QUICK_REPLY;
				const buttonData = setButtonsData(
					buttonTypes.QUICK_REPLY,
					quickReplyData?.actions
				);
				button = buttonData ? buttonData : [];
			}
			if ('call-to-action' in templateData) {
				const callToActionData: savedTemplateCallToActionProps =
					templateData?.['call-to-action'];
				updatedButtonType = 'callToAction';
				const buttonData = setButtonsData(
					'callToAction',
					callToActionData?.actions
				);
				button = buttonData ? buttonData : [];
			} else if ('card' in templateData) {
				const cardData: savedTemplateCardProps = templateData?.['card'];
				if (cardData?.actions?.length > 0) {
					if (cardData?.actions[0]?.type !== 'QUICK_REPLY') {
						updatedButtonType = buttonTypes.CALL_TO_ACTION;
						const buttonData = setButtonsData(
							buttonTypes.CALL_TO_ACTION,
							cardData?.actions
						);
						button = buttonData ? buttonData : [];
					} else {
						updatedButtonType = buttonTypes.QUICK_REPLY;
						const buttonData = setButtonsData(
							buttonTypes.QUICK_REPLY,
							cardData?.actions
						);
						button = buttonData ? buttonData : [];
					}
				}
			}
		}
		if (updatedButtonType === buttonTypes.QUICK_REPLY) {
			return (
				<Grid item xs={12}>
					{button?.map(
						(button: quickReplyButtonProps | callToActionRowProps) => (
							<div
								key={button.id}
								className={`${classes.whatsappMobileMessage} sent quick-reply-button`}
								style={{
									margin: '2px 0px 0px 0px',
									borderRadius: '5px',
									padding: '4px 8px',
									width: 'auto',
								}}
							>
								<span className={classes.quickReplyButtonText}>
									{getValueByFieldName(button, 'whatsapp.websiteButtonText')}
								</span>
							</div>
						)
					)}
				</Grid>
			);
		} else if (updatedButtonType === buttonTypes.CALL_TO_ACTION) {
			return (
				<Grid item xs={12}>
					{button?.map(
						(button: quickReplyButtonProps | callToActionRowProps) => (
							<Grid
								item
								key={button.id}
								className={classes.calltoActionButtonChatWrapper}>
								{button.typeOfAction === 'phonenumber' ? (
									<a
										className={classes.calltoActionButtonChat}
										target='_blank'
										href={`tel:${getValueByFieldName(
											button,
											'whatsapp.phoneNumber'
										)}`}
										rel='noreferrer'>
										<i
											className={`${classes.callToActionButton} zmdi zmdi-phone`}></i>
										<span className={classes.callToActionButtonText}>
											{getValueByFieldName(button, 'whatsapp.phoneButtonText')}
										</span>
									</a>
								) : (
									<a
										className={classes.calltoActionButtonChat}
										href={getValueByFieldName(button, 'whatsapp.websiteURL')}
										target='_blank'
										rel='noreferrer'>
										<i
											className={`${classes.callToActionButton} zmdi zmdi-open-in-new`}></i>
										<span className={classes.callToActionButtonText}>
											{getValueByFieldName(
												button,
												'whatsapp.websiteButtonText'
											)}
										</span>
									</a>
								)}
							</Grid>
						)
					)}
				</Grid>
			);
		}
	};
	return (
		<div className={classes.templateListModalContent}>
			<ul className={classes.chooseTemplateModalUl}>
				{savedTemplateList?.map(
					(template: savedTemplateListProps, index: number) => (
						<section
							className='accordion'
							key={`templatelist_${template.TemplateId}_${index}`}>
							<input
								type='checkbox'
								name='collapse'
								id={template?.TemplateId}
							/>
							<h2 className='handle'>
								<label htmlFor={template?.TemplateId}>
									<FaChevronRight
										style={{
											marginRight: '10px',
											fontSize: '0.7rem',
											fontFamily: 'fontawesome',
										}}
									/>
									{getTemplateName(template)}
								</label>
							</h2>
							<div className='content'>
								<Grid
									container
									className={
										classes.chatTemplateModalTemplateDataWrapper
									}>
									<Grid item>
										<p>{getTemplateText(template)}</p>
									</Grid>
									<Grid item>
										<Button
											className='ok-button'
											size='small'
											variant='contained'
											color='primary'
											autoFocus
											onClick={() => onChoose(template, getTemplateText(template))}
										>
											{translator('whatsappChat.choose')}
										</Button>
									</Grid>
								</Grid>
								<Grid container>{getButton(template?.Data?.types)}</Grid>
							</div>
						</section>
					)
				)}
			</ul>
		</div>
	);
};

export default ChatTemplateModal;
