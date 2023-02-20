import { Button, Box, Dialog, Grid } from '@material-ui/core';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Close, InfoOutlined } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import '../css/ChatTemplate.css';
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
import { templateTypes } from '../../Constant';

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
	return (
		<>
			<Dialog
				fullScreen={fullScreen}
				open={isOpen}
				onClose={onClose}
				aria-labelledby='responsive-dialog-title'>
				<div className={classes.alertModal}>
					<div id='responsive-dialog-title' className={classes.alertModalTitle}>
						{translator('whatsappChat.chooseTemplate')}
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
						<ul className={classes.chooseTemplateModalUl}>
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
													onClick={() =>
														onChoose(template, getTemplateText(template))
													}>
													<>{translator('whatsappChat.choose')}</>
												</Button>
											</Grid>
										</Grid>
										<Grid
											item
											style={{ paddingTop: '8px', marginLeft: '-8px' }}>
											<Box className={classes.whatsappActionButtonsBox}>
												<Button className={classes.whatsappActionButtons}>
													<i
														className={`${classes.callToActionButton} zmdi zmdi-open-in-new`}></i>
													<span className={classes.callToActionButtonText}>
														{translator('whatsappChat.callUs')}
													</span>
												</Button>
											</Box>
											<Box className={classes.whatsappActionButtonsBox}>
												<Button className={classes.whatsappActionButtons}>
													<i
														className={`${classes.callToActionButton} zmdi zmdi-phone`}></i>
													<span className={classes.callToActionButtonText}>
														{translator('whatsappChat.callUs')}
													</span>
												</Button>
											</Box>
										</Grid>
									</div>
								</section>
							))}
						</ul>
					</div>
				</div>
			</Dialog>
		</>
	);
};

export default ChatTemplateModal;
