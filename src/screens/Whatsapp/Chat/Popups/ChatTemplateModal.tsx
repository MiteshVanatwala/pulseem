import { Button, Box, Dialog, Grid } from '@material-ui/core';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Close, InfoOutlined } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import '../css/ChatTemplate.css';
import { useState } from 'react';
import { FaChevronRight } from 'react-icons/fa';
import { chatModalProps } from '../Types/WhatsappChat.type';
import {
	savedTemplateCallToActionProps,
	savedTemplateCardProps,
	savedTemplateListProps,
	savedTemplateMediaProps,
	savedTemplateQuickReplyProps,
	savedTemplateTextProps,
} from '../../Editor/Types/WhatsappCreator.types';

const ChatTemplateModal = ({
	classes,
	isOpen,
	onClose,
	onChoose,
	savedTemplateList,
}: chatModalProps) => {
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
	const { t: translator } = useTranslation();

	const getTemplateText = (template: savedTemplateListProps) => {
		if (template && template?.Data && template?.Data?.types) {
			if ('quick-reply' in template?.Data?.types) {
				const quickReplyData: savedTemplateQuickReplyProps =
					template?.Data?.types['quick-reply'];
				return quickReplyData?.body;
			}
			if ('call-to-action' in template?.Data?.types) {
				const callToActionData: savedTemplateCallToActionProps =
					template?.Data?.types['call-to-action'];
				return callToActionData?.body;
			} else if ('card' in template?.Data?.types) {
				const cardData: savedTemplateCardProps = template?.Data?.types['card'];
				return cardData?.title;
			} else if ('media' in template?.Data?.types) {
				const mediaData: savedTemplateMediaProps =
					template?.Data?.types['media'];
				return mediaData?.body;
			} else if ('text' in template?.Data?.types) {
				const textData: savedTemplateTextProps = template?.Data?.types['text'];
				return textData?.body;
			}
		}
		return null;
	};
	return (
		<>
			<Dialog
				fullScreen={fullScreen}
				open={isOpen}
				onClose={onClose}
				aria-labelledby='responsive-dialog-title'>
				<div className={classes.alertModal}>
					<div id='responsive-dialog-title' className={classes.alertModalTitle}>
						{/* {title} */}
						Choose Template
					</div>
					<Box className={classes.alertModalClose}>
						<Close fontSize={'small'} onClick={onClose} />
					</Box>
					<Box className={classes.alertModalInfoWrapper}>
						<Box className={classes.alertModalInfo}>
							<InfoOutlined fontSize={'small'} onClick={onClose} />
						</Box>
					</Box>
					<div className={classes.alertModalContent}>
						<ul className={classes.validationAlertModalUl}>
							{/* {requiredFields?.map((requiredField: string, index: number) => (
								<li key={index} className={classes.infoAlertModalLi}>
									{requiredField}
								</li>
							))} */}
							{savedTemplateList?.map((template: savedTemplateListProps) => (
								<section className='accordion' key={template.TemplateId}>
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
											{template?.TemplateName}
										</label>
									</h2>
									<div className='content'>
										<Grid
											container
											className={classes.chatTemplateModalTemplateDataWrapper}>
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
													onClick={() => onChoose(template, getTemplateText(template))}>
													<>Choose</>
												</Button>
											</Grid>
										</Grid>
									</div>
								</section>
							))}
						</ul>
					</div>
					{/* <Grid container className={classes.alertModalAction}>
						<Button
							className='ok-button'
							variant='contained'
							color='primary'
							autoFocus
							onClick={onClose}>
							<>{translator('whatsapp.alertModal.okButtonText')}</>
						</Button>
					</Grid> */}
				</div>
			</Dialog>
		</>
	);
};

export default ChatTemplateModal;
